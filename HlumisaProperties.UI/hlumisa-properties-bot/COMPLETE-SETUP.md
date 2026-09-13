# Messenger Bot — Complete Setup Guide

## What Was Built
A **completely standalone, production-ready microservice** for Facebook Messenger
automation using:
- **Official Meta Graph API (v21.0)** — send/receive messages, typing indicator, read receipts
- **Direct database access** is **not** required by the bot (the ASP.NET Core API owns the DB)
- **LLM (Llama 3 / Ollama)** for AI-powered buyer/seller lead qualification
- **Zero dependencies** on ASP.NET Core for chatbot messaging
- **Zero browser automation** (no Puppeteer, no Chromium)

## Project Structure
```
HlumisaProperties.UI/hlumisa-properties-bot/
├── src/
│   ├── api-server.ts            # Express entry point
│   ├── webhook-handler.ts       # Webhook processing
│   ├── llm-service.ts           # Ollama / Llama 3 integration
│   ├── ai-constants.ts          # AI prompts (auto-responder + lead extraction)
│   └── messenger/
│       └── graph-api-service.ts # Official Meta Graph API wrapper
├── .env.example
├── Dockerfile                   # Two-stage, no Chromium
├── docker-compose.yml
└── package.json
```

## Quick Start

### 1. Install Dependencies
```bash
cd HlumisaProperties.UI/hlumisa-properties-bot
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Edit `.env`:
```env
FACEBOOK_PAGE_ACCESS_TOKEN=<your-page-access-token>
FACEBOOK_PAGE_ID=<your-facebook-page-id>
FACEBOOK_VERIFY_TOKEN=<your-webhook-verify-token>
LLM_BASE_URL=http://63.141.255.202:11434
LLM_MODEL=llama3:latest
MESSENGER_BOT_PORT=3001
```

### 3. Start the Service
```bash
npm start
# or compiled:
npm run build && node dist/api-server.js
```

## Endpoints
| Method | Path          | Description                                  |
|--------|---------------|----------------------------------------------|
| GET    | `/webhook`    | Facebook webhook verification                |
| POST   | `/webhook`    | Facebook webhook (incoming messages)         |
| POST   | `/send-message` | Send a message to a PSID (manual)          |
| GET    | `/health`     | Health check (`{ status, service, mode, llm }`) |

## Docker
```bash
cp .env.example .env
docker compose up -d --build
docker logs -f hlumisa-messenger-bot
```

## Environment Variables
| Variable                     | Description                          | Required |
|------------------------------|--------------------------------------|----------|
| `FACEBOOK_PAGE_ACCESS_TOKEN` | Page access token from Meta          | Yes      |
| `FACEBOOK_PAGE_ID`           | Your Facebook Page ID                | Yes      |
| `FACEBOOK_VERIFY_TOKEN`      | Webhook verify token (match in Meta) | Yes      |
| `LLM_BASE_URL`              | Ollama URL                           | Yes      |
| `LLM_MODEL`                 | Llama model name                     | Yes      |
| `MESSENGER_BOT_PORT`        | API port (default 3001)              | No       |

## What It Does
1. **Webhook Receiver**: verifies Facebook webhooks and processes incoming messages.
2. **Graph API Client**: marks messages as read, sends typing indicators, and replies
   — all via the **official Meta Graph API v21.0**.
3. **AI Auto-Responder**: uses Llama 3 (Ollama) with `ai-constants.ts` prompts to
   qualify leads (collects name + phone number) and respond in English or isiXhosa.
4. **Manual Send**: `/send-message` lets you proactively message any Page‑Scoped ID (PSID).

## Monitoring
```bash
# Docker
docker logs -f hlumisa-messenger-bot

# PM2
pm2 logs messenger-bot
```

## Troubleshooting
- **Graph API errors (OAuthException / #190)**: regenerate the Page Access Token with
  `pages_messaging` and confirm `FACEBOOK_VERIFY_TOKEN` matches your webhook config.
- **LLM not responding**: verify `LLM_BASE_URL` and that the model is pulled (`ollama run llama3`).
- **Health check**: `curl http://localhost:3001/health`.

## Success Criteria
- ✅ Service starts and `/health` returns `200` with `mode: "Graph API"`
- ✅ Webhook verification succeeds for your verify token
- ✅ AI replies are generated and sent back via the Graph API
- ✅ Leads can be extracted by the ASP.NET Core Hangfire job
