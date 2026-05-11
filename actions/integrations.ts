"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getAuthUserId } from "@/lib/auth";
import axios from "axios";

async function getCurrentUserId() {
  return getAuthUserId();
}

export async function getIntegrations() {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  return prisma.integration.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInstagramPosts() {
  const userId = await getCurrentUserId();
  if (!userId) return { status: 401, data: [] };

  const integration = await prisma.integration.findFirst({
    where: { userId, name: "INSTAGRAM" },
  });

  if (!integration?.token || !integration.instagramId) return { status: 404, data: [] };

  try {
    const response = await axios.get(
      `https://graph.facebook.com/v21.0/${integration.instagramId}/media`,
      {
        params: {
          fields: "id,caption,media_url,media_type,timestamp,thumbnail_url,permalink",
          access_token: integration.token,
          limit: 20,
        },
      }
    );
    return { status: 200, data: response.data.data };
  } catch {
    return { status: 500, data: [] };
  }
}

export const onDisconnectIntegration = async (id: string) => {
  const userId = await getCurrentUserId();
  if (!userId) return { status: 401, message: "Unauthorized" };

  const integration = await prisma.integration.findFirst({ where: { id, userId } });
  if (!integration) return { status: 404, message: "Not found" };

  await prisma.integration.delete({ where: { id } });
  revalidatePath("/integrations");
  return { status: 200, message: "Disconnected successfully" };
};

export async function createIntegration(data: {
  token: string;
  instagramId?: string;
  pageId?: string;
  name: "INSTAGRAM";
}) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  // Remove existing integration for this user+type
  await prisma.integration.deleteMany({ where: { userId, name: data.name } });

  // Remove any integration with same instagramId (cross-user reconnect)
  if (data.instagramId) {
    await prisma.integration.deleteMany({ where: { instagramId: data.instagramId } });
  }

  await prisma.integration.create({
    data: { userId, token: data.token, instagramId: data.instagramId, pageId: data.pageId, name: data.name },
  });

  revalidatePath("/integrations");
  return { success: true };
}
