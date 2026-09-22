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

    const igId = params.instagramId || params.pageId;
    const payload = {
      recipient: { id: params.recipientId },
      message: { text: params.text },
    };

    // Candidate endpoints to support both Instagram Business Login and Facebook Page Login tokens
    const candidateUrls: string[] = [];

    // 1. Instagram Business Login ID-based endpoint
    if (igId) {
      candidateUrls.push(`https://graph.instagram.com/v21.0/${igId}/messages`);
    }
    // 2. Instagram Business Login /me/messages
    candidateUrls.push("https://graph.instagram.com/v21.0/me/messages");
    // 3. Facebook Graph API ID-based endpoint
    if (igId) {
      candidateUrls.push(`https://graph.facebook.com/v21.0/${igId}/messages`);
    }
    // 4. Facebook Graph API /me/messages
    candidateUrls.push("https://graph.facebook.com/v21.0/me/messages");

    for (const url of candidateUrls) {
      try {
        console.log(`[InstagramService] Attempting to send DM to ${params.recipientId} via ${url}`);
        const res = await axios.post(url, payload, {
          headers: {
            Authorization: `Bearer ${params.token}`,
            "Content-Type": "application/json",
          },
          params: { access_token: params.token },
          timeout: 8000,
        });

        console.log(`[InstagramService] DM sent successfully via ${url}:`, res.data);
        return true;
      } catch (error: any) {
        console.warn(
          `[InstagramService] sendDm failed via ${url}:`,
          error.response?.data?.error?.message || error.response?.data || error.message
        );
      }
    }

    console.error(`[InstagramService] All DM send attempts failed for recipient ${params.recipientId}`);
    return false;
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
