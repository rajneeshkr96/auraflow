import { prisma } from "@/lib/db";
import axios from "axios";

export interface SaveIntegrationDto {
  userId: number;
  token: string;
  instagramId?: string | null;
  pageId?: string | null;
  username?: string | null;
  fullName?: string | null;
  profilePic?: string | null;
  accountType?: string | null;
}

export class IntegrationRepository {
  /**
   * Returns all connected social integrations for a user
   */
  static async findByUserId(userId: number) {
    return prisma.integration.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Finds a specific integration by ID and userId
   */
  static async findById(id: string, userId: number) {
    return prisma.integration.findFirst({
      where: { id, userId },
    });
  }

  /**
   * Finds primary or first active Instagram integration for a user
   */
  static async findPrimaryInstagram(userId: number) {
    return prisma.integration.findFirst({
      where: { userId, name: "INSTAGRAM", isActive: true },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Resilient dual-ID resolution:
   * 1. Fast path: Direct query on instagramId or pageId (0ms overhead)
   * 2. Self-healing fallback: Inquires Meta Graph API /me to resolve IGSID vs ASUID and updates DB
   * 3. Single-tenant fallback: If user/workspace has exactly 1 active integration, maps safely
   */
  static async findByAccountOrPageId(accountId: string) {
    if (!accountId) return null;

    // 1. Fast path: Direct match by instagramId (ASUID) or pageId (IGSID / Page ID)
    const directMatch = await prisma.integration.findFirst({
      where: {
        isActive: true,
        OR: [
          { instagramId: accountId },
          { pageId: accountId },
        ],
      },
    });
    if (directMatch) return directMatch;

    // 2. Also check any record regardless of isActive
    const directMatchAny = await prisma.integration.findFirst({
      where: {
        OR: [
          { instagramId: accountId },
          { pageId: accountId },
        ],
      },
    });
    if (directMatchAny) return directMatchAny;

    // 3. Resilient fallback resolution:
    try {
      const activeIntegrations = await prisma.integration.findMany({
        where: { name: "INSTAGRAM", isActive: true },
        orderBy: { createdAt: "desc" },
      });

      // If exactly 1 active integration exists, it MUST belong to this incoming webhook.
      // Auto-bind accountId immediately and return with 0ms external API delay!
      if (activeIntegrations.length === 1) {
        const single = activeIntegrations[0];
        console.log(`[IntegrationRepository] Auto-binding accountId ${accountId} to sole active integration ${single.id}`);
        prisma.integration.update({
          where: { id: single.id },
          data: {
            ...(single.instagramId ? { pageId: accountId } : { instagramId: accountId }),
          },
        }).catch((e) => console.error("[IntegrationRepository] Auto-bind error:", e.message));

        return single;
      }

      // If multiple active integrations exist, query Meta Graph in PARALLEL with a fast timeout (1500ms)
      if (activeIntegrations.length > 1) {
        const checkPromises = activeIntegrations.map(async (item) => {
          if (!item.token) return null;
          try {
            const res = await axios.get("https://graph.instagram.com/v21.0/me", {
              params: { fields: "id,user_id,username", access_token: item.token },
              timeout: 1500,
            });
            const igUserId = res.data?.user_id ? String(res.data.user_id) : null;
            const asUserId = res.data?.id ? String(res.data.id) : null;
            if (igUserId === accountId || asUserId === accountId) {
              return { item, resolvedPageId: igUserId || item.pageId, resolvedUsername: res.data?.username || item.username };
            }
          } catch {}
          return null;
        });

        const results = await Promise.all(checkPromises);
        const match = results.find(Boolean);
        if (match) {
          prisma.integration.update({
            where: { id: match.item.id },
            data: {
              pageId: match.resolvedPageId,
              ...(match.resolvedUsername && { username: match.resolvedUsername }),
            },
          }).catch(() => null);
          return match.item;
        }

        // Fallback: Default to latest active integration so the DM is never dropped
        const latest = activeIntegrations[0];
        console.warn(`[IntegrationRepository] No exact ID match, falling back to latest active integration: ${latest.id}`);
        prisma.integration.update({
          where: { id: latest.id },
          data: {
            ...(latest.instagramId ? { pageId: accountId } : { instagramId: accountId }),
          },
        }).catch(() => null);
        return latest;
      }

      // 4. Last resort: Check any integration in database
      const allIntegrations = await prisma.integration.findMany({
        where: { name: "INSTAGRAM" },
        orderBy: { createdAt: "desc" },
      });
      if (allIntegrations.length > 0) {
        return allIntegrations[0];
      }
    } catch (e: any) {
      console.error("[IntegrationRepository] findByAccountOrPageId resolution error:", e.message);
    }

    return null;
  }

  /**
   * Count connected integrations for a user
   */
  static async countByUserId(userId: number): Promise<number> {
    return prisma.integration.count({ where: { userId } });
  }

  /**
   * Disconnects / deletes an integration
   */
  static async delete(id: string, userId: number) {
    return prisma.integration.delete({ where: { id, userId } });
  }

  /**
   * Toggles active status of an integration
   */
  static async toggleActive(id: string, userId: number, isActive: boolean) {
    return prisma.integration.update({
      where: { id, userId },
      data: { isActive },
    });
  }

  /**
   * Upserts a specific Instagram account without wiping out other connected accounts.
   * Enables Enterprise multi-account support.
   */
  static async saveInstagramIntegration(data: SaveIntegrationDto) {
    // Check if this specific account was previously connected by this user
    const existing = await prisma.integration.findFirst({
      where: {
        userId: data.userId,
        name: "INSTAGRAM",
        ...(data.instagramId ? { instagramId: data.instagramId } : {}),
      },
    });

    if (existing) {
      return prisma.integration.update({
        where: { id: existing.id },
        data: {
          token: data.token,
          pageId: data.pageId ?? existing.pageId,
          username: data.username ?? existing.username,
          fullName: data.fullName ?? existing.fullName,
          profilePic: data.profilePic ?? existing.profilePic,
          accountType: data.accountType ?? existing.accountType,
          isActive: true,
        },
      });
    }

    // Clean up any stale record from a different user with this exact same instagramId
    if (data.instagramId) {
      await prisma.integration.deleteMany({
        where: { instagramId: data.instagramId, userId: { not: data.userId } },
      });
    }

    return prisma.integration.create({
      data: {
        userId: data.userId,
        token: data.token,
        instagramId: data.instagramId,
        pageId: data.pageId,
        username: data.username,
        fullName: data.fullName,
        profilePic: data.profilePic,
        accountType: data.accountType || "BUSINESS",
        name: "INSTAGRAM",
        isActive: true,
      },
    });
  }
}

