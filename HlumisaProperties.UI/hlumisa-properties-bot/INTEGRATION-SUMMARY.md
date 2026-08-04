# Messenger Bot Integration Summary

## Overview

This document summarizes the integration of the Puppeteer-based Messenger Bot (https://github.com/dolanmiu/Messenger-Bot) into the HlumisaProperties ASP.NET Core application.

**Important**: Both the Graph API and Puppeteer systems coexist independently. The Graph API remains the primary system, while the Puppeteer system provides an alternative browser-based approach.

## What Was Implemented

### 1. Messenger-Bot Repository Cloned
- **Location**: `HlumisaProperties.UI/Messenger-Bot/`
- **Source**: https://github.com/dolanmiu/Messenger-Bot.git
- **Purpose**: Provides Puppeteer-based Facebook Messenger automation

### 2. API Server Created
- **File**: `HlumisaProperties.UI/Messenger-Bot/src/api-server.ts`
- **Purpose**: Express.js API server that wraps the Puppeteer functionality
- **Endpoints**:
  - `GET /health` - Health check
  - `POST /send-message` - Send a message via Puppeteer

### 3. C# Service Implementation
- **File**: `HlumisaProperties.Infrastructure/Services/PuppeteerMessengerService.cs`
- **Purpose**: C# wrapper that communicates with the Node.js API server
- **Key Features**:
  - Sends messages to the Puppeteer API server
  - Logs all messages to the local database
  - Configurable via appsettings.json

### 4. Separate Controller Created
- **File**: `HlumisaProperties.Api/Controllers/PuppeteerMessengerController.cs`
- **Route**: `api/puppeteer-messenger/*`
- **Purpose**: Dedicated API endpoints for Puppeteer-based messaging
- **Endpoints**:
  - `POST /send` - Send message via Puppeteer
  - `GET /conversation/{id}` - Get conversation history
  - `GET /messages` - Get all messages
  - `GET /health` - Health check

### 5. Integration with ASP.NET Core
- **File**: `HlumisaProperties.Api/Program.cs`
- **Change**: Both services registered independently
- **Graph API**: `builder.Services.AddScoped<IFacebookMessengerService, FacebookMessengerService>();` (unchanged)
- **Puppeteer**: `builder.Services.AddScoped<PuppeteerMessengerService>();` (new separate service)

### 6. Configuration Added
- **File**: `HlumisaProperties.Api/appsettings.json`
- **Section Added**: `MessengerBot` configuration
  - `ApiUrl`: URL of the Node.js API server (default: http://localhost:3001)
  - `Email`: Facebook account email
  - `Password`: Facebook account password
  - `PuppeteerArgs`: Browser automation settings

### 7. Dependencies Installed
- **Node.js packages added**:
  - `express` - API server framework
  - `cors` - CORS middleware
  - `@types/express` - TypeScript types
  - `@types/cors` - TypeScript types
  - `@types/node` - Node.js types

### 8. TypeScript Configuration Updated
- **File**: `HlumisaProperties.UI/Messenger-Bot/tsconfig.json`
- **Change**: Added `"rootDir": "./src"` to fix compilation errors

### 9. Package.json Updated
- **File**: `HlumisaProperties.UI/Messenger-Bot/package.json`
- **Added script**: `"start:api": "ts-node src/api-server.ts"`

### 10. Documentation Created
- **File**: `HlumisaProperties.UI/Messenger-Bot/README-SETUP.md`
- **Purpose**: Comprehensive setup and usage instructions

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  WHERE PUPPETEER RUNS: Messenger-Bot Repository (Node.js)   │
│  Location: HlumisaProperties.UI/Messenger-Bot/              │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    ASP.NET Core Application                  │
│  (HlumisaProperties.Api)                                     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  MessengerController (Graph API) - api/messenger/*   │  │
│  │  - Uses IFacebookMessengerService                     │  │
│  │  - Communicates via Meta Graph API                    │  │
│  │  - Webhook-based incoming messages                    │  │
│  └───────────────────────┬──────────────────────────────┘  │
│                          │                                  │
│  ┌───────────────────────▼──────────────────────────────┐  │
│  │  FacebookMessengerService (Graph API)                 │  │
│  │  - Direct HTTP calls to Meta Graph API                │  │
│  │  - Uses Page Access Token                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PuppeteerMessengerController - api/puppeteer-messenger/* │
│  │  - Receives HTTP requests from clients                │  │
│  └───────────────────────┬──────────────────────────────┘  │
│                          │                                  │
│  ┌───────────────────────▼──────────────────────────────┐  │
│  │  PuppeteerMessengerService (C# Wrapper)               │  │
│  │  - ONLY forwards requests to Node.js API              │  │
│  │  - NO Puppeteer logic here                            │  │
│  │  - Logs to database                                    │  │
│  └───────────────────────┬──────────────────────────────┘  │
│                          │                                  │
│                    HTTP POST ─────────────────────────────►│
└─────────────────────────────────────────────────────────────┘
                           │
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  HlumisaProperties.UI/Messenger-Bot/                        │
│  (Node.js/TypeScript - THIS IS WHERE PUPPETEER RUNS)        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Express API Server (src/api-server.ts)               │  │
│  │  - Receives HTTP requests from C#                      │  │
│  │  - Endpoint: POST /send-message                        │  │
│  └───────────────────────┬──────────────────────────────┘  │
│                          │                                  │
│  ┌───────────────────────▼──────────────────────────────┐  │
│  │  Puppeteer Service (src/messenger/send-message.ts)    │  │
│  │  ✓ Launches Chrome/Chromium                           │  │
│  │  ✓ Logs into Facebook Messenger                       │  │
│  │  ✓ Navigates to user chat                             │  │
│  │  ✓ Sends message                                      │  │
│  │  ✓ Logs out                                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## How It Works

### Graph API System (Primary - Unchanged)
1. **Webhook**: Meta sends webhook to `MessengerController` at `api/messenger/webhook`
2. **Processing**: Controller extracts message and PSID
3. **AI Response**: LLM generates response
4. **Send**: `FacebookMessengerService` sends via Graph API
5. **Database**: Message logged to local database

### Puppeteer System (New - Separate)
**Important**: All Puppeteer/browser automation happens in the Node.js Messenger-Bot repository, NOT in ASP.NET Core.

1. **Request**: Client calls `PuppeteerMessengerController` at `api/puppeteer-messenger/send`
2. **C# Wrapper**: `PuppeteerMessengerService.SendMessageAsync()` forwards to Node.js API
3. **HTTP Request**: C# sends HTTP POST to `http://localhost:3001/send-message`
4. **Node.js API Server** (in Messenger-Bot folder):
   - Receives the HTTP request
   - **Puppeteer launches Chrome browser HERE**
   - Navigates to messenger.com
   - Logs in with Facebook credentials
   - Navigates to the user's chat
   - Sends the message
   - Logs out
5. **Database Logging**: C# service logs the message to the same local database

**Key Point**: The ASP.NET Core API NEVER runs Puppeteer. It only makes HTTP calls to the Node.js server where Puppeteer actually runs.

## Configuration

### C# appsettings.json
```json
"MessengerBot": {
  "ApiUrl": "http://localhost:3001",
  "Email": "your-email@example.com",
  "Password": "your-password",
  "PuppeteerArgs": {
    "Headless": true,
    "ExecutablePath": "",
    "Args": ["--no-sandbox", "--disable-setuid-sandbox"]
  }
}
```

### Node.js .env
```env
MESSENGER_EMAIL_ADDRESS=your-email@example.com
MESSENGER_PASSWORD=your-password
MESSENGER_BOT_PORT=3001
```

## Running the System

### Option A: Graph API (Existing - No Changes Needed)
```bash
# Just start the ASP.NET Core application
cd HlumisaProperties.Api
dotnet run
```

Send messages via:
```bash
POST https://your-api-domain.com/api/messenger/send?recipientId=USER_PSID&message=Hello
```

### Option B: Puppeteer-based Messaging (New)
```bash
# Terminal 1: Start the Node.js API server
cd HlumisaProperties.UI/Messenger-Bot
npm run start:api

# Terminal 2: Start the ASP.NET Core application
cd HlumisaProperties.Api
dotnet run
```

Send messages via:
```bash
POST https://your-api-domain.com/api/puppeteer-messenger/send?recipientId=USER_PSID&message=Hello
```

**Both systems can run simultaneously and use the same database.**

## Key Differences

| Feature | Graph API | Puppeteer |
|---------|-----------|-----------|
| Authentication | Page Access Token | Facebook Email/Password |
| Webhook Required | Yes (for incoming) | No |
| Rate Limits | Meta's API limits | Browser-based (no official limits) |
| Setup Complexity | Moderate | Requires Chrome + 2FA disabled |
| Reliability | High (official API) | Medium (browser automation) |
| Session Management | Token-based | Login per session (currently) |
| Controller Route | `api/messenger/*` | `api/puppeteer-messenger/*` |
| Use Case | Production, webhooks | Alternative, automation |

## Important Notes

### Prerequisites
1. **Chrome/Chromium** must be installed on the server (for Puppeteer only)
2. **2FA must be disabled** on the Facebook account (for Puppeteer only)
3. **Node.js v16+** must be installed (for Puppeteer only)
4. **Facebook account** should be dedicated for automation (for Puppeteer only)

### Security Considerations
1. Store Facebook credentials securely (use environment variables or secrets manager)
2. Run the Node.js API server on localhost only in production
3. Consider adding authentication to the Node.js API server
4. Use a dedicated Facebook account for automation

### Limitations
1. Each message requires a fresh login (no session persistence yet)
2. Browser automation is more fragile than official API
3. Subject to Facebook's Terms of Service
4. May break if Facebook changes their UI

## Testing

The C# project builds successfully with the new service:
```bash
cd HlumisaProperties.Api
dotnet build
```

Result: **Build succeeded with 25 warning(s)**

## Next Steps

1. **Test the Puppeteer Integration**:
   - Start the Node.js API server
   - Configure Facebook credentials
   - Test sending a message via the API

2. **Improve Session Management**:
   - Implement session persistence to avoid repeated logins
   - Cache browser sessions

3. **Add Error Handling**:
   - Implement retry logic in C# service
   - Add circuit breaker pattern for API server failures

4. **Monitoring**:
   - Add health checks for the Node.js API server
   - Log Puppeteer errors for debugging

5. **Security**:
   - Add API key authentication to Node.js server
   - Implement rate limiting
   - Use HTTPS for communication between services

## Files Modified/Created

### Created
- `HlumisaProperties.UI/Messenger-Bot/src/api-server.ts` - Node.js Express API server
- `HlumisaProperties.Infrastructure/Services/PuppeteerMessengerService.cs` - C# service for Puppeteer
- `HlumisaProperties.Api/Controllers/PuppeteerMessengerController.cs` - Separate API controller
- `HlumisaProperties.UI/Messenger-Bot/README-SETUP.md` - Setup instructions
- `HlumisaProperties.UI/Messenger-Bot/INTEGRATION-SUMMARY.md` - This file

### Modified
- `HlumisaProperties.Api/Program.cs` - Added PuppeteerMessengerService registration (Graph API unchanged)
- `HlumisaProperties.Api/appsettings.json` - Added MessengerBot configuration section
- `HlumisaProperties.UI/Messenger-Bot/package.json` - Added express, cors dependencies and start:api script
- `HlumisaProperties.UI/Messenger-Bot/tsconfig.json` - Fixed rootDir setting

### Unchanged (Graph API remains as-is)
- `HlumisaProperties.Api/Controllers/MessengerController.cs`
- `HlumisaProperties.Infrastructure/Services/FacebookMessengerService.cs`
- `HlumisaProperties.Application/Interfaces/IFacebookMessengerService.cs`

## Support

For issues or questions:
1. Check the README-SETUP.md for troubleshooting
2. Review Puppeteer documentation: https://pptr.dev/
3. Review Messenger-Bot repository: https://github.com/dolanmiu/Messenger-Bot