# Messenger Bot API Server Setup

This document explains how to set up and run the Messenger Bot API server for the HlumisaProperties application.

## Overview

The Messenger Bot uses Puppeteer to automate Facebook Messenger interactions. It runs as a separate Node.js API server that the C# ASP.NET Core application communicates with via HTTP.

## Prerequisites

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **Facebook Account** with 2FA disabled (required for Puppeteer automation)

## Installation

1. Navigate to the Messenger-Bot directory:
   ```bash
   cd HlumisaProperties.UI/Messenger-Bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and add your Facebook credentials:
   ```
   MESSENGER_EMAIL_ADDRESS=your-email@example.com
   MESSENGER_PASSWORD=your-password
   ```

5. Create a `config.json` file from the example:
   ```bash
   cp src/config.json.example src/config.json
   ```

## Configuration

### Environment Variables (.env)

| Variable | Description |
|----------|-------------|
| `MESSENGER_EMAIL_ADDRESS` | Your Facebook account email |
| `MESSENGER_PASSWORD` | Your Facebook account password |
| `MESSENGER_BOT_PORT` | (Optional) Port for API server (default: 3001) |

### Config File (src/config.json)

```json
{
  "chats": [
    {
      "chatId": "USER_PSID_HERE",
      "events": [
        {
          "name": "Event Name",
          "cron": "0 9 * * *",
          "message": "Your message here",
          "useChatGpt": false
        }
      ]
    }
  ],
  "puppeteerArgs": {
    "headless": true,
    "executablePath": "/path/to/chrome",
    "args": ["--no-sandbox", "--disable-setuid-sandbox"]
  },
  "timeZone": "Africa/Johannesburg"
}
```

### C# Application Configuration (appsettings.json)

Add the following to your `appsettings.json` in the HlumisaProperties.Api project:

```json
"MessengerBot": {
  "ApiUrl": "http://localhost:3001",
  "Email": "your-email@example.com",
  "Password": "your-password",
  "PuppeteerArgs": {
    "Headless": true,
    "ExecutablePath": "",
    "Args": [
      "--no-sandbox",
      "--disable-setuid-sandbox"
    ]
  }
}
```

## Running the API Server

### Option 1: Run the API Server (Recommended for Production)

```bash
npm run start:api
```

This starts the Express API server on port 3001 (configurable via `MESSENGER_BOT_PORT`).

### Option 2: Run the Original Cron-based Bot

```bash
npm start
```

This runs the original cron-based scheduler for automated messages.

## API Endpoints

### Health Check
```
GET http://localhost:3001/health
```

### Send Message
```
POST http://localhost:3001/send-message
Content-Type: application/json

{
  "email": "your-email@example.com",
  "password": "your-password",
  "chatId": "USER_PSID",
  "message": "Hello from HlumisaProperties!",
  "puppeteerArgs": {
    "headless": true,
    "args": ["--no-sandbox", "--disable-setuid-sandbox"]
  }
}
```

## Integration with C# ASP.NET Core

The C# application automatically uses the PuppeteerMessengerService which:

1. Receives messages from the MessengerController
2. Forwards them to the Node.js API server
3. Puppeteer automates the browser to send the message via Messenger.com
4. The message is logged to the local database

### Important Notes

- **Two-Factor Authentication**: Must be disabled on the Facebook account for Puppeteer to work
- **Browser Requirements**: Chrome/Chromium must be installed on the server
- **Session Persistence**: Currently, each message requires a fresh login. Future versions may support session persistence
- **Rate Limiting**: Be mindful of Facebook's rate limits to avoid account restrictions

## Troubleshooting

### Puppeteer fails to launch
- Ensure Chrome/Chromium is installed
- Set `executablePath` in `puppeteerArgs` if Chrome is not in the default location
- On Linux servers, you may need additional args: `["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]`

### Login fails
- Verify email and password in `.env` or `appsettings.json`
- Ensure 2FA is disabled on the Facebook account
- Check if Facebook has blocked the login attempt (may need to verify via email/phone)

### Messages not sending
- Check the API server logs for errors
- Verify the `chatId` is correct (user's PSID)
- Ensure the MessengerController is receiving requests properly

## Development

### Building TypeScript

```bash
npm run build
```

### Running Tests

```bash
npm test
```

### Formatting Code

```bash
npm run prettier:fix
```

## Security Considerations

1. **Credentials Storage**: Store Facebook credentials securely using environment variables or a secrets manager
2. **API Protection**: In production, protect the Node.js API server with authentication or run it on localhost only
3. **Account Safety**: Use a dedicated Facebook account for automation to avoid personal account restrictions
4. **Rate Limiting**: Implement rate limiting to avoid being blocked by Facebook

## Migration from Graph API

This Puppeteer-based system replaces the previous Meta Graph API implementation. The main differences:

- **No Webhook Required**: Messages are sent proactively without webhook verification
- **Browser Automation**: Uses Puppeteer instead of direct API calls
- **Session Management**: Requires Facebook login for each session (currently)
- **No Official API Limits**: Bypasses Graph API rate limits (but subject to Facebook's terms of service)

## Support

For issues with:
- **Puppeteer**: Check [Puppeteer Documentation](https://pptr.dev/)
- **Messenger-Bot**: Check [Messenger-Bot GitHub](https://github.com/dolanmiu/Messenger-Bot)
- **HlumisaProperties Integration**: Contact the development team