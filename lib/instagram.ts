import axios from 'axios'

export async function sendInstagramMessage(accessToken: string, recipientId: string, text: string, pageId?: string) {
    try {
        // Instagram messaging requires the Page ID in the endpoint, NOT the Instagram account ID
        const accountId = pageId || 'me';
        const url = `https://graph.facebook.com/v21.0/${accountId}/messages`;

        console.log(`Sending Instagram message to ${recipientId} via Page ${accountId}`);

        const response = await axios.post(url, {
            recipient: { id: recipientId },
            message: { text: text }
        }, {
            params: { access_token: accessToken }
        });
        return response.data;
    } catch (error: any) {
        console.error('Error sending Instagram message:', error?.response?.data || error.message);
        throw error;
    }
}

export async function sendInstagramCommentReply(accessToken: string, commentId: string, text: string) {
    try {
        const url = `https://graph.facebook.com/v21.0/${commentId}/replies`;
        const response = await axios.post(url, {
            message: text
        }, {
            params: { access_token: accessToken }
        });
        return response.data;
    } catch (error) {
        console.error('Error sending Instagram comment reply:', error);
        throw error;
    }
}
