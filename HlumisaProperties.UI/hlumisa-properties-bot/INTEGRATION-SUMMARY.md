# Messenger Bot Integration Summary

## Overview
The Messenger Bot is a **standalone Node.js microservice** that powers the
Facebook Messenger AI chatbot using the **official Meta Graph API (v21.0)**.
It runs independently of the ASP.NET Core API but complements it.

## Architecture
```
                         Meta Graph API (v21.0)
                              ▲
                              │ webhook POST + replies
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Messenger Bot (Node.js)                   │
│   HlumisaProperties.UI/hlumisa-properties-bot/src/          │
│   │  api-server.ts        Express server (/webhook, etc.)   │
│   │  webhook-handler.ts   Webhook verify + message receive  │
│   │  graph-api-service.ts Graph API send/typing/read        │
│   │  llm-service.ts       Llama 3 (Ollama) AI responses     │
│   │  ai-constants.ts      AI prompts (auto-responder)       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              ASP.NET Core API (HlumisaProperties.Api)        │
│   - Authentication (JWT), property listings, buyers/sellers  │
│   - Transaction ledger, admin dashboard, public frontend API │
│   - Lead extraction from conversations (Hangfire, daily)     │
│   - Stores inbound/outbound messages in SQLite               │
└─────────────────────────────────────────────────────────────┘
```

## Responsibilities
| Concern                          | Owner        | How                                                  |
|----------------------------------|--------------|------------------------------------------------------|
| Webhook verification             | Bot          | `/webhook` GET (Graph API verify token)              |
| Incoming message receive         | Bot          | `/webhook` POST (Meta → Bot)                         |
| Mark as read / typing indicator  | Bot          | `me/messages` sender_action via Graph API            |
| Send reply to user               | Bot          | `me/messages` via Graph API (Page Access Token)      |
| AI auto-responder (Llama 3)      | Bot          | `llm-service.ts` + `ai-constants.ts`                 |
| Conversation/message storage     | ASP.NET Core | `FacebookMessages` table (SQLite)                    |
| Lead extraction / CRM writes     | ASP.NET Core | `LeadExtractionService` via Hangfire (daily)         |
| Auth, listings, buyers/sellers   | ASP.NET Core | JWT + domain services                                |

## Data Flow
1. A user messages your Facebook Page.
2. Meta sends a webhook POST to the Bot at `/webhook`.
3. `webhook-handler.ts` verifies the token, saves nothing locally, marks the message
   as read and shows a typing indicator (Graph API), then asks the LLM for a reply.
4. The AI reply (Llama 3 via Ollama) is sent back to the user through the Graph API.
5. Independently, the ASP.NET Core Hangfire job (`ExtractLeadsFromTodayMessagesAsync`)
   reads stored messages and extracts qualified leads into `Buyers`/`Sellers`.

## Configuration Alignment
The Graph API credentials must be consistent across both services:

| Key                      | Bot (`.env`)                 | ASP.NET Core (`appsettings.json`)        |
|--------------------------|------------------------------|------------------------------------------|
| Page Access Token        | `FACEBOOK_PAGE_ACCESS_TOKEN` | `Facebook:PageAccessToken`               |
| Page ID                  | `FACEBOOK_PAGE_ID`           | `Facebook:PageId`                        |
| Webhook Verify Token     | `FACEBOOK_VERIFY_TOKEN`      | `Facebook:VerifyToken`                   |
| LLM base URL             | `LLM_BASE_URL`               | `LLM:BaseUrl`                            |
| LLM model                | `LLM_MODEL`                  | `LLM:Model`                              |

## Running Both
### Bot only (auto-responder)
```bash
cd HlumisaProperties.UI/hlumisa-properties-bot
cp .env.example .env
npm start          # http://localhost:3001/webhook
```

### Bot + ASP.NET Core
Run the ASP.NET Core API (with `Facebook:*` and `LLM:*` configured) for auth, CRM
and lead extraction, and the Bot for real-time messaging. They share the same SQLite
database for message storage.

## Removed (Legacy)
The following Puppeteer / browser‑automation artifacts were removed in favour of the
official Graph API:
- `PuppeteerMessengerService` / `PuppeteerMessengerController` (C# side — already removed)
- Bot cron jobs, Puppeteer browser automation, and ChatGPT browser login
