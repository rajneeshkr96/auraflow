"use server";

import axios from "axios";
import { prisma } from "@/lib/db";
import { getAuthUserId } from "@/lib/auth";

export const getInstagramPosts = async () => {
  const userId = await getAuthUserId();
  if (!userId) return { status: 401, data: [] };

  try {
    const integration = await prisma.integration.findFirst({
      where: { userId, name: "INSTAGRAM" },
    });

    if (!integration?.token || !integration.instagramId) {
      return { status: 404, data: [] };
    }

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

    return { status: 200, data: response.data.data ?? [] };
  } catch (error: any) {
    console.error("getInstagramPosts Error:", error.response?.data || error.message);
    return { status: 500, data: [] };
  }
};
