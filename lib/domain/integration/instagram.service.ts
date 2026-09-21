import axios from "axios";

export interface SendDmParams {
  token: string;
  recipientId: string;
  text: string;
  pageId?: string | null;
  instagramId?: string | null;
}

export class InstagramService {
  /**
   * Sends a direct message to an Instagram user with automatic endpoint resolution & fallback.
   * Priority:
   * 1. Instagram Business Login uses: https://graph.instagram.com/v21.0/me/messages
   * 2. Page-backed Facebook Login uses: https://graph.facebook.com/v21.0/{pageId}/messages
   */
  static async sendDm(params: SendDmParams): Promise<boolean> {
    if (!params.token || !params.recipientId || !params.text.trim()) return false;

    // Detect if pageId is a real Facebook Page ID vs an Instagram ID
    const isFacebookPage = params.pageId && !params.pageId.startsWith("1784") && !params.pageId.startsWith("2953");
    const primaryUrl = isFacebookPage
      ? `https://graph.facebook.com/v21.0/${params.pageId}/messages`
      : `https://graph.instagram.com/v21.0/me/messages`;

    const payload = {
      recipient: { id: params.recipientId },
      message: { text: params.text },
    };

    try {
      console.log(`[InstagramService] Sending DM to ${params.recipientId} via ${primaryUrl}`);
      await axios.post(primaryUrl, payload, {
        params: { access_token: params.token },
        timeout: 10000,
      });
      console.log(`[InstagramService] DM sent successfully to ${params.recipientId}`);
      return true;
    } catch (error: any) {
      console.error("[InstagramService] sendDm primary error:", error.response?.data || error.message);

      // Fallback: If Facebook Page endpoint was attempted and failed, retry via /me/messages
      if (primaryUrl !== "https://graph.instagram.com/v21.0/me/messages") {
        try {
          console.log(`[InstagramService] Retrying DM via https://graph.instagram.com/v21.0/me/messages`);
          await axios.post("https://graph.instagram.com/v21.0/me/messages", payload, {
            params: { access_token: params.token },
            timeout: 10000,
          });
          console.log(`[InstagramService] DM sent successfully via fallback`);
          return true;
        } catch (fallbackError: any) {
          console.error("[InstagramService] sendDm fallback error:", fallbackError.response?.data || fallbackError.message);
        }
      }

      return false;
    }
  }

  /**
   * Sends a public reply to an Instagram comment
   */
  static async sendCommentReply(token: string, commentId: string, text: string): Promise<boolean> {
    if (!token || !commentId || !text.trim()) return false;

    const url = `https://graph.instagram.com/v21.0/${commentId}/replies`;

    try {
      await axios.post(
        url,
        { message: text },
        {
          params: { access_token: token },
          timeout: 8000,
        }
      );
      return true;
    } catch (error: any) {
      console.error("[InstagramService] sendCommentReply error:", error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Resolves Instagram user profile (username, name, avatar)
   */
  static async fetchUserProfile(recipientId: string, token: string): Promise<{
    username: string | null;
    fullName: string | null;
    avatarUrl: string | null;
  }> {
    if (!recipientId || !token) return { username: null, fullName: null, avatarUrl: null };

    try {
      const res = await axios.get(`https://graph.instagram.com/v21.0/${recipientId}`, {
        params: { fields: "name,username,profile_pic", access_token: token },
        timeout: 4000,
      });

      return {
        username: res.data?.username ? `@${res.data.username.replace(/^@/, "")}` : null,
        fullName: res.data?.name || null,
        avatarUrl: res.data?.profile_pic || null,
      };
    } catch {
      return { username: null, fullName: null, avatarUrl: null };
    }
  }

  /**
   * Fetches latest media posts for user
   */
  static async getMediaPosts(token: string, accountId: string, isBusinessLogin = true) {
    const url = isBusinessLogin
      ? "https://graph.instagram.com/me/media"
      : `https://graph.facebook.com/v21.0/${accountId}/media`;

    const response = await axios.get(url, {
      params: {
        fields: "id,caption,media_url,media_type,timestamp,thumbnail_url,permalink",
        access_token: token,
        limit: 20,
      },
      timeout: 10000,
    });

    return response.data?.data || [];
  }
}
