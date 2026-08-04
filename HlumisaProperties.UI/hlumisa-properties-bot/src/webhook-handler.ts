import { Request, Response } from "express";
import { GraphApiService } from "./messenger/graph-api-service";
import { LLMService } from "./llm-service";
import { AIConstants } from "./ai-constants";

export class WebhookHandler {
  private graphApi: GraphApiService;
  private llm: LLMService;

  constructor(graphApi: GraphApiService, llm: LLMService) {
    this.graphApi = graphApi;
    this.llm = llm;
  }

  handleWebhook(req: Request, res: Response): void {
    const mode = req.query["hub.mode"] as string;
    const token = req.query["hub.verify_token"] as string;
    const challenge = req.query["hub.challenge"] as string;

    console.log("Webhook verification attempt:", { mode, token });

    if (this.graphApi.verifyWebhook(mode, token, challenge)) {
      console.log("Webhook verified successfully");
      res.status(200).send(challenge);
    } else {
      console.log("Webhook verification failed");
      res.status(403).send("Forbidden");
    }
  }

  async handleMessage(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;

      if (body.object !== "page") {
        res.status(404).send("Not Found");
        return;
      }

      const entry = body.entry?.[0];
      if (!entry) {
        res.status(200).send("OK");
        return;
      }

      const messagingEvent = entry.messaging?.[0];
      if (!messagingEvent) {
        res.status(200).send("OK");
        return;
      }

      const senderId = messagingEvent.sender?.id;
      const recipientId = messagingEvent.recipient?.id;
      const messageText = messagingEvent.message?.text;

      if (!senderId || !messageText) {
        res.status(200).send("OK");
        return;
      }

      console.log(`Received message from ${senderId}: ${messageText}`);

      // Mark as read and show typing indicator
      await this.graphApi.markAsRead(senderId);
      await this.graphApi.sendTypingIndicator(senderId);

      // Generate AI response using AI constants
      console.log(`Generating AI response for ${senderId}...`);
      const prompt = AIConstants.getAutoResponderInstructions(messageText);
      const aiResponse = await this.llm.generateText(prompt);
      console.log(`AI Response: ${aiResponse}`);

      // Send the AI response back to the user
      await this.graphApi.sendMessage(senderId, aiResponse);
      console.log(`Response sent to ${senderId}`);

      res.status(200).send("OK");
    } catch (error: any) {
      console.error("Error handling message:", error);
      res.status(200).send("OK"); // Always return 200 to Facebook
    }
  }
}