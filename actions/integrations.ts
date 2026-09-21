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

export async function createIntegration(data: {
  token: string;
  instagramId?: string;
  pageId?: string;
  name: "INSTAGRAM";
}) {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  await IntegrationRepository.saveInstagramIntegration({
    userId,
    token: data.token,
    instagramId: data.instagramId,
    pageId: data.pageId,
  });

  revalidatePath("/integrations");
  return { success: true };
}
