import express from "express";
import cors from "cors";
import { GraphApiService } from "./messenger/graph-api-service";
import { LLMService } from "./llm-service";
import { WebhookHandler } from "./webhook-handler";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.MESSENGER_BOT_PORT || 3001;

// Initialize services
const graphApi = new GraphApiService();
const llm = new LLMService();
const webhookHandler = new WebhookHandler(graphApi, llm);

// ======================================================
// WEBHOOK VERIFICATION (GET)
// ======================================================
app.get("/webhook", (req, res) => {
  webhookHandler.handleWebhook(req, res);
});

// ======================================================
// WEBHOOK MESSAGE HANDLER (POST)
// ======================================================
app.post("/webhook", async (req, res) => {
  await webhookHandler.handleMessage(req, res);
});

// ======================================================
// HEALTH CHECK
// ======================================================
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    service: "messenger-bot-api",
    mode: "Graph API",
    llm: llm["baseUrl"]
  });
});

// ======================================================
// SEND MESSAGE ENDPOINT (Manual trigger)
// ======================================================
app.post("/send-message", async (req, res) => {
  try {
    const { recipientId, message } = req.body;

    if (!recipientId || !message) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: recipientId, message",
      });
    }

    await graphApi.sendMessage(recipientId, message);
    res.json({ success: true, message: "Message sent successfully" });
  } catch (error: any) {
    console.error("API error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Messenger Bot API server running on port ${PORT}`);
  console.log(`Mode: Graph API (Meta Official API)`);
  console.log(`LLM Service: ${llm["baseUrl"]}`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/webhook`);
});