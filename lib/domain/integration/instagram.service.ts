import axios from "axios";

export class InstagramService {
  /**
   * Sends a direct message to an Instagram user
   */
  static async sendDm(params: {
    token: string;
    recipientId: string;
    text: string;
    pageId?: string | null;
    instagramId?: string | null;
  }): Promise<boolean> {
    if (!params.token || !params.recipientId || !params.text.trim()) return false;
    if (!params.pageId && !params.instagramId) {
      console.error("[InstagramService] sendDm skipped — neither pageId nor instagramId provided");
      return false;
    }

    const baseUrl = params.pageId
      ? `https://graph.facebook.com/v21.0/${params.pageId}/messages`
      : `https://graph.instagram.com/v21.0/me/messages`;

    try {
      await axios.post(
        baseUrl,
        {
          recipient: { id: params.recipientId },
          message: { text: params.text },
        },
        {
          params: { access_token: params.token },
          timeout: 8000,
        }
      );
      return true;
    } catch (error: any) {
      console.error("[InstagramService] sendDm error:", error.response?.data || error.message);
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
