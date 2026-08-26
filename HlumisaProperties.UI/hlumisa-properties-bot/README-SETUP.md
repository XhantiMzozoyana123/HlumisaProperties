# Messenger Bot — Setup Guide (Official Meta Graph API)

## Overview
This is a standalone Node.js/TypeScript microservice that powers an AI chatbot on
Facebook Messenger using the **official Meta Graph API (v21.0)**. It does **not**
use Puppeteer or any browser automation.

## Prerequisites
1. **Node.js** v18 or higher (with npm)
2. A **Meta for Developers** app with the **Messenger** product added
3. A **Facebook Page Access Token** granted the `pages_messaging` (and `pages_manage_metadata` if needed) permission
4. A **Webhook Verify Token** (any string you choose — used only to verify webhooks)
5. An **Ollama / LLM** endpoint (Llama 3) for AI responses

## 1. Install Dependencies
```bash
cd HlumisaProperties.UI/hlumisa-properties-bot
npm install
```

## 2. Configure Environment
```bash
cp .env.example .env
```
Edit `.env`:
```env
FACEBOOK_PAGE_ACCESS_TOKEN=<your-page-access-token>
FACEBOOK_PAGE_ID=<your-facebook-page-id>
FACEBOOK_VERIFY_TOKEN=<your-webhook-verify-token>
LLM_BASE_URL=http://<ollama-host>:11434
LLM_MODEL=llama3:latest
MESSENGER_BOT_PORT=3001
```

## 3. Configure the Facebook Webhook
In the [Meta for Developers](https://developers.facebook.com/) console for your app:
- Go to **Products → Messenger** (add the product if missing).
- Under **Webhooks**, add the callback URL: `https://<your-domain>/webhook`
- Enter the **Verify Token** — this must be the same value you put in `FACEBOOK_VERIFY_TOKEN`.
- Subscribe your Page and select the `messages` field (and `message_deliveries` / `messaging_postbacks` as needed).

## 4. Run the Bot
### Local (development)
```bash
npm start
# Server: http://localhost:3001
```
For Facebook to reach your local server, expose it with a tunnel:
```bash
ngrok http 3001   # then use https://*.ngrok.io/webhook as the callback URL
```

### Production (PM2)
```bash
npm install -g pm2
pm2 start npm --name messenger-bot -- start
pm2 save
pm2 startup
```

### Production (Docker)
```bash
docker compose up -d --build
```

## 5. Test
- Health check: `curl http://localhost:3001/health`
- Send a manual message:
  ```bash
  curl -X POST http://localhost:3001/send-message \
    -H "Content-Type: application/json" \
    -d '{"recipientId":"<USER_PSID>","message":"Hello from Hlumisa!"}'
  ```
- Send a real message to your Facebook Page and confirm the AI replies.

## Endpoints Reference
- `GET  /webhook` — Facebook webhook verification (returns the challenge).
- `POST /webhook` — Facebook webhook payload (incoming messages). Always returns
  `200 OK` quickly to acknowledge receipt.
- `POST /send-message` — send a text message to a recipient PSID (manual trigger).
  Body: `{ "recipientId": "...", "message": "..." }`
- `GET  /health` — returns `{ status, service, mode, llm }`.

## Troubleshooting
- **Webhook verification fails**: ensure `FACEBOOK_VERIFY_TOKEN` in `.env` matches the
  Verify Token configured in the Meta Developer console, and that the callback URL is `https`.
- **(OAuthException) Invalid OAuth access token / #190**: the Page Access Token is missing,
  expired, or lacks `pages_messaging`. Regenerate it from your app's Messenger product.
- **AI response is slow/empty**: confirm `LLM_BASE_URL` is reachable and the model
  (`llama3:latest`) is pulled (`ollama run llama3`).
- **NGINX reverse proxy**: don't buffer `/webhook` POST bodies; ensure the path is proxied.
