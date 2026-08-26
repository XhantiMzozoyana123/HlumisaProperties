# Hlumisa Properties — Messenger Bot (Graph API)

A **standalone, production-ready microservice** for a real-time AI chatbot on
**Facebook Messenger**, built on the **official Meta Graph API (v21.0)** — no
browser automation, no Puppeteer, no headless Chrome.

It receives Messenger webhooks, generates an AI reply (Llama 3 via Ollama), and
sends it back to the user through the Graph API.

> Real-time auto-responder lives here. Lead extraction / CRM writes are handled
> by the companion ASP.NET Core API (`HlumisaProperties.Api`) via Hangfire.

## Features
- ✅ Official Meta Graph API v21.0 (`graph.facebook.com/v21.0/me/messages`)
- ✅ Webhook verification + real-time message handling
- ✅ AI auto-responder powered by Llama 3 (Ollama)
- ✅ Typing indicators + read receipts
- ✅ Bilingual English / isiXhosa
- ✅ Lead-qualification prompts (collects name + phone number first)
- ✅ Docker ready — slim multi-stage image (no Chromium)

## Tech Stack
- Runtime: Node.js (v18+)
- Framework: Express.js + TypeScript
- AI: Llama 3 via Ollama (`LLM_BASE_URL` / `LLM_MODEL`)
- Messenger: Meta Graph API v21.0 (Page Access Token)
- HTTP: Axios

## Project Structure
```
HlumisaProperties.UI/hlumisa-properties-bot/
├── src/
│   ├── api-server.ts            # Express entry point: /webhook, /send-message, /health
│   ├── webhook-handler.ts       # Verifies & processes Facebook webhooks
│   ├── llm-service.ts           # Calls Ollama/Llama 3 for AI responses
│   ├── ai-constants.ts          # AI prompts (auto-responder + lead extraction)
│   └── messenger/
│       └── graph-api-service.ts # Official Meta Graph API v21.0 wrapper
├── .env.example                 # Graph API + LLM env template
├── Dockerfile                   # Two-stage build (no Chromium)
├── docker-compose.yml
└── package.json
```

## Quick Start (local)
```bash
cd HlumisaProperties.UI/hlumisa-properties-bot
npm install
cp .env.example .env            # add your Graph API keys
npm start                       # http://localhost:3001
```

## Docker
```bash
cp .env.example .env
docker compose up -d --build
```

## Endpoints
| Method | Path          | Description                                  |
|--------|---------------|----------------------------------------------|
| GET    | `/webhook`    | Facebook webhook verification (handshake)      |
| POST   | `/webhook`    | Facebook webhook (incoming messages)         |
| POST   | `/send-message` | Manually send a text message to a PSID     |
| GET    | `/health`     | Health check                                 |

## Configuration (`.env`)
| Variable                   | Description                          | Required |
|----------------------------|--------------------------------------|----------|
| `FACEBOOK_PAGE_ACCESS_TOKEN` | Page access token from Meta        | Yes      |
| `FACEBOOK_PAGE_ID`         | Your Facebook Page ID                | Yes      |
| `FACEBOOK_VERIFY_TOKEN`    | Webhook verify token (match in Meta) | Yes    |
| `LLM_BASE_URL`            | Ollama URL                           | Yes      |
| `LLM_MODEL`               | Llama model name                     | Yes      |
| `MESSENGER_BOT_PORT`      | API port (default 3001)              | No       |

## How It Works
1. Facebook sends a webhook POST to `/webhook`.
2. `webhook-handler.ts` verifies the token, marks the message as read, and sends a typing indicator.
3. `llm-service.ts` + `ai-constants.ts` generate an AI reply via Llama 3 (Ollama).
4. `graph-api-service.ts` sends the reply back through `https://graph.facebook.com/v21.0/me/messages`.

## Integration with ASP.NET Core
The bot is independent but complements the main API:
- **Bot** (this repo): Messenger webhook + AI replies via the official Graph API.
- **ASP.NET Core**: Authentication (JWT), property listings, buyers/sellers/referrals,
  transaction ledger, lead extraction from conversations (Hangfire), admin dashboard,
  and the central API for the frontend.

See `INTEGRATION-SUMMARY.md` for details.

## Docs
- [Setup Guide](README-SETUP.md)
- [Complete Setup](COMPLETE-SETUP.md)
- [Integration Summary](INTEGRATION-SUMMARY.md)
- [Final Architecture](FINAL-ARCHITECTURE.md)
