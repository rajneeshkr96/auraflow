"use server";

import { revalidatePath } from "next/cache";
import { getAuthUserId } from "@/lib/platform/auth";
import { IntegrationRepository } from "@/lib/domain/integration/integration.repository";
import { InstagramService } from "@/lib/domain/integration/instagram.service";

export async function getIntegrations() {
  const userId = await getAuthUserId();
  if (!userId) return [];
  return IntegrationRepository.findByUserId(userId);
}

export async function getInstagramPosts() {
  const userId = await getAuthUserId();
  if (!userId) return { status: 401, data: [] };

  const integration = await IntegrationRepository.findPrimaryInstagram(userId);
  if (!integration?.token || !integration.instagramId) return { status: 404, data: [] };

  try {
    const isBusinessLogin = !!process.env.INSTAGRAM_APP_CLIENT_ID;
    const posts = await InstagramService.getMediaPosts(
      integration.token,
      integration.instagramId,
      isBusinessLogin
    );
    return { status: 200, data: posts };
  } catch {
    return { status: 500, data: [] };
  }
}

export const onDisconnectIntegration = async (id: string) => {
  const userId = await getAuthUserId();
  if (!userId) return { status: 401, message: "Unauthorized" };

  try {
    await IntegrationRepository.delete(id, userId);
    revalidatePath("/integrations");
    return { status: 200, message: "Disconnected successfully" };
  } catch {
    return { status: 404, message: "Integration not found" };
  }
};

export async function onToggleIntegrationActive(id: string, isActive: boolean) {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    await IntegrationRepository.toggleActive(id, userId, isActive);
    revalidatePath("/integrations");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function checkCanAddAccount() {
  const userId = await getAuthUserId();
  if (!userId) return { allowed: false, error: "Unauthorized" };

  const { checkQuota } = await import("@/lib/platform/entitlements");
  const count = await IntegrationRepository.countByUserId(userId);
  const quota = await checkQuota("connections", count);

  return {
    allowed: quota.allowed,
    currentCount: count,
    limit: quota.limit,
    needsUpgrade: !quota.allowed,
  };
}

export async function getInstagramAuthUrl() {
  const userId = await getAuthUserId();
  if (!userId) return null;

  const clientId = process.env.INSTAGRAM_APP_CLIENT_ID || process.env.INSTAGRAM_CLIENT_ID;
  const redirectUri = encodeURIComponent(process.env.INSTAGRAM_REDIRECT_URI || "https://aura.codeswayam.com/api/integrations/instagram/callback");
  const scope = "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish";

  return `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${userId}`;
}

export async function createIntegration(data: {
  token: string;
  instagramId?: string;
  pageId?: string;
  name: "INSTAGRAM";
  username?: string;
  fullName?: string;
  profilePic?: string;
}) {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  await IntegrationRepository.saveInstagramIntegration({
    userId,
    token: data.token,
    instagramId: data.instagramId,
    pageId: data.pageId,
    username: data.username,
    fullName: data.fullName,
    profilePic: data.profilePic,
  });

  revalidatePath("/integrations");
  return { success: true };
}
