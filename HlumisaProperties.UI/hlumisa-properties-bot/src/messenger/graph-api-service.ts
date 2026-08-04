import axios from "axios";

export class GraphApiService {
  private pageAccessToken: string;
  private pageId: string;

  constructor(pageAccessToken?: string, pageId?: string) {
    this.pageAccessToken = pageAccessToken || process.env.FACEBOOK_PAGE_ACCESS_TOKEN || "";
    this.pageId = pageId || process.env.FACEBOOK_PAGE_ID || "";
  }

  async sendMessage(recipientId: string, messageText: string): Promise<any> {
    try {
      const url = `https://graph.facebook.com/v21.0/me/messages`;
      
      const payload = {
        recipient: { id: recipientId },
        message: { text: messageText }
      };

      const response = await axios.post(url, payload, {
        params: { access_token: this.pageAccessToken },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error: any) {
      console.error("Graph API send message error:", error.response?.data || error.message);
      throw new Error(`Failed to send message: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async sendTypingIndicator(recipientId: string): Promise<void> {
    try {
      const url = `https://graph.facebook.com/v21.0/me/messages`;
      
      const payload = {
        recipient: { id: recipientId },
        sender_action: "typing_on"
      };

      await axios.post(url, payload, {
        params: { access_token: this.pageAccessToken },
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error: any) {
      console.error("Graph API typing indicator error:", error.message);
    }
  }

  async markAsRead(recipientId: string): Promise<void> {
    try {
      const url = `https://graph.facebook.com/v21.0/me/messages`;
      
      const payload = {
        recipient: { id: recipientId },
        sender_action: "mark_seen"
      };

      await axios.post(url, payload, {
        params: { access_token: this.pageAccessToken },
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error: any) {
      console.error("Graph API mark as read error:", error.message);
    }
  }

  verifyWebhook(mode: string, token: string, challenge: string): boolean {
    const verifyToken = process.env.FACEBOOK_VERIFY_TOKEN || "";
    return mode === "subscribe" && token === verifyToken;
  }
}