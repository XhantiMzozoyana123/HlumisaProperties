# Hlumisa Properties Bot

A **completely standalone, production-ready microservice** for Facebook Messenger automation using Puppeteer browser automation, direct MySQL database access, and LLM-powered buyer/seller intent analysis.

## 🎯 What This Is

This is a **standalone Node.js microservice** that handles the complete Facebook Messenger chatbot workflow:

- ✅ **Puppeteer browser automation** (no Graph API, no web scraping)
- ✅ **Direct MySQL database connection**
- ✅ **Cron jobs** for scheduled messaging
- ✅ **AI-powered buyer/seller intent analysis**
- ✅ **Completely independent** from ASP.NET Core
- ✅ **Docker-ready** for VPS deployment
- ✅ **Production-ready** with error handling and logging

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                                                            │
│   Hlumisa Properties Bot (Node.js/TypeScript)               │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Main Service (index.ts)                              │  │
│  │  - Entry point                                        │  │
│  │  - Starts cron jobs                                   │  │
│  │  - Connects to database                               │  │
│  └───────────────────────┬──────────────────────────────┘  │
│                          │                                  │
│  ┌───────────────────────▼──────────────────────────────┐  │
│  │  Cron Service (services/cron-service.ts)              │  │
│  │  - Every 5 min: Send scheduled messages               │  │
│  │  - Every hour: Analyze buyer/seller intent            │  │
│  └───────────────────────┬──────────────────────────────┘  │
│                          │                                  │
│  ┌───────────────────────▼──────────────────────────────┐  │
│  │  Puppeteer Service (messenger/puppeteer-service.ts)   │  │
│  │  - Launches Chrome browser                            │  │
│  │  - Logs into Facebook Messenger                       │  │
│  │  - Sends messages to users                            │  │
│  │  - Logs out                                           │  │
│  └───────────────────────┬──────────────────────────────┘  │
│                          │                                  │
│  ┌───────────────────────▼──────────────────────────────┐  │
│  │  Database Connection (database/db-connection.ts)      │  │
│  │  - Direct MySQL connection                            │  │
│  │  - Reads/writes to hlumisapropertiesdb                │  │
│  └───────────────────────┬──────────────────────────────┘  │
│                          │                                  │
│  ┌───────────────────────▼──────────────────────────────┐  │
│  │  LLM Service (llm-service.ts)                         │  │
│  │  - Connects to Llama 3 (Ollama)                       │  │
│  │  - Analyzes conversations for buyer/seller intent     │  │
│  └───────────────────────┬──────────────────────────────┘  │
│                          │                                  │
│  ┌───────────────────────▼──────────────────────────────┐  │
│  │  AI Constants (ai-constants.ts)                       │  │
│  │  - Lead extraction prompts                            │  │
│  │  - Buyer/seller classification logic                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Direct MySQL Connection
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                                                              │
│  MySQL Database                                             │
│  Host: 63.141.255.202:3306                                  │
│  Database: hlumisapropertiesdb                              │
│  User: zola / Password: Zola123!                            │
│                                                              │
│  Tables Used:                                                │
│  - facebook_messages (message history)                       │
│  - scheduled_messages (cron job queue)                       │
│  - Buyers (existing - buyer leads)                           │
│  - Sellers (existing - seller leads)                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Features

### 1. **Puppeteer Browser Automation**
- Launches headless Chrome browser
- Logs into Facebook Messenger automatically
- Sends messages to users via browser automation
- No Graph API required

### 2. **Direct Database Access**
- Connects directly to MySQL database
- Reads message history
- Writes scheduled messages
- Stores buyer/seller leads in EXISTING tables

### 3. **Cron Jobs**
- **Every 5 minutes**: Send scheduled messages
- **Every hour**: Analyze conversations for buyer/seller intent

### 4. **AI-Powered Analysis**
- Uses Llama 3 LLM to analyze conversations
- Extracts buyer/seller intent
- Creates leads in existing Buyers/Sellers tables
- Bilingual support (English/isiXhosa)

## 📋 Prerequisites

1. **Node.js** (v16 or higher) - for local development
2. **Docker** - for VPS deployment
3. **MySQL Database** (accessible at 63.141.255.202:3306)
4. **Facebook Account** (for Puppeteer automation)
5. **LLM Server** (Ollama with Llama 3)

## 🔧 Local Development

### 1. Navigate to the directory
```bash
cd HlumisaProperties.UI/hlumisa-properties-bot
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Facebook Credentials (for Puppeteer)
MESSENGER_EMAIL_ADDRESS=your_facebook_email@example.com
MESSENGER_PASSWORD=your_facebook_password

# Database Configuration
DB_HOST=63.141.255.202
DB_PORT=3306
DB_NAME=hlumisapropertiesdb
DB_USER=zola
DB_PASSWORD=Zola123!

# LLM Configuration
LLM_BASE_URL=http://63.141.255.202:11434
LLM_MODEL=llama3:latest

# Server Port (for future API endpoints)
MESSENGER_BOT_PORT=3001
```

### 4. Start the microservice
```bash
npm start
```

## 🐳 Docker Deployment (VPS)

### Option 1: Using Docker Compose (Recommended)

1. **Clone the repository on your VPS:**
```bash
git clone https://github.com/YOUR_USERNAME/hlumisa-properties-bot.git
cd hlumisa-properties-bot
```

2. **Create .env file:**
```bash
cp .env.example .env
nano .env  # Edit with your credentials
```

3. **Build and run:**
```bash
docker-compose up -d --build
```

### Option 2: Using the Deployment Script

1. **Clone the repository on your VPS:**
```bash
git clone https://github.com/YOUR_USERNAME/hlumisa-properties-bot.git
cd hlumisa-properties-bot
```

2. **Create .env file:**
```bash
cp .env.example .env
nano .env  # Edit with your credentials
```

3. **Run the deployment script:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### Option 3: Manual Docker Commands

```bash
# Build the image
docker build -t hlumisa-properties-bot:latest .

# Run the container
docker run -d \
    --name hlumisa-messenger-bot \
    --restart unless-stopped \
    -p 3001:3001 \
    --env-file .env \
    -v $(pwd)/logs:/app/logs \
    hlumisa-properties-bot:latest

# View logs
docker logs -f hlumisa-messenger-bot
```

## 📊 Database Tables Used

### 1. `facebook_messages` (Already exists in ASP.NET Core)
Stores all Messenger conversations. The microservice reads from this table to analyze conversations.

### 2. `scheduled_messages` (Create this table)
Queue for messages to be sent via Puppeteer:
```sql
CREATE TABLE IF NOT EXISTS scheduled_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255),
  password VARCHAR(255),
  chat_id VARCHAR(255),
  message TEXT,
  sent BOOLEAN DEFAULT 0,
  scheduled_at DATETIME,
  sent_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3. `Buyers` (Already exists in ASP.NET Core)
The microservice inserts new buyer leads directly into this existing table. No changes needed.

### 4. `Sellers` (Already exists in ASP.NET Core)
The microservice inserts new seller leads directly into this existing table. No changes needed.

**Important**: The microservice uses the EXISTING `Buyers` and `Sellers` tables from the ASP.NET Core application. No new lead tables are created. This ensures the frontend (admin dashboard and landing page) continues to work without any changes.

## 🔄 How It Works

### Scheduled Message Sending (Every 5 Minutes)

1. **Cron job** queries `scheduled_messages` table
2. **Filters** messages where `sent = 0` and `scheduled_at <= NOW()`
3. **Puppeteer** launches browser and logs into Facebook
4. **Sends** message to specified user
5. **Updates** database to mark message as sent
6. **Logs** result

### Buyer/Seller Intent Analysis (Every Hour)

1. **Cron job** queries recent conversations from `facebook_messages`
2. **LLM** analyzes conversation history
3. **Extracts** lead information (name, phone, intent)
4. **Creates** new buyer/seller in existing `Buyers` or `Sellers` table
5. **Avoids** duplicates (checks last 7 days)

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Browser Automation**: Puppeteer
- **Database**: MySQL (mysql2)
- **LLM**: Llama 3 via Ollama
- **Job Scheduler**: node-cron
- **HTTP Client**: Axios
- **Containerization**: Docker

## 📝 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MESSENGER_EMAIL_ADDRESS` | Facebook account email | Yes |
| `MESSENGER_PASSWORD` | Facebook account password | Yes |
| `DB_HOST` | MySQL database host | Yes |
| `DB_PORT` | MySQL database port | Yes |
| `DB_NAME` | MySQL database name | Yes |
| `DB_USER` | MySQL database user | Yes |
| `DB_PASSWORD` | MySQL database password | Yes |
| `LLM_BASE_URL` | LLM server URL | Yes |
| `LLM_MODEL` | LLM model name | Yes |
| `MESSENGER_BOT_PORT` | API server port | No |

## 🔒 Security Considerations

1. **Facebook Account**: Use a dedicated account for automation (not personal)
2. **2FA**: Must be disabled on Facebook account for Puppeteer
3. **Database Credentials**: Store securely, never commit to git
4. **LLM Server**: Ensure it's not publicly accessible
5. **Rate Limiting**: Be mindful of Facebook rate limits

## 🚨 Important Notes

### Facebook Account Requirements
- **2FA must be disabled** (Puppeteer cannot handle 2FA)
- Use a **dedicated account** for automation
- Account may be flagged if used excessively
- Monitor for Facebook security alerts

### Database Access
- Direct MySQL connection (no ORM)
- Connection pooling for performance
- Automatic reconnection on failure

### Cron Jobs
- **Message Sender**: Runs every 5 minutes
- **Intent Analyzer**: Runs every hour
- Jobs are timezone-aware (Africa/Johannesburg)

## 🐛 Troubleshooting

### Puppeteer fails to launch
- Ensure Chrome/Chromium is installed
- Set `executablePath` if needed
- Check system has enough resources

### Database connection fails
- Verify credentials in .env
- Check database server is accessible
- Ensure user has proper permissions

### Messages not sending
- Check Facebook credentials
- Verify 2FA is disabled
- Check browser automation logs

### LLM analysis fails
- Verify Ollama is running
- Check Llama 3 model is available
- Test connectivity to LLM_BASE_URL

## 📦 Deployment

### Using PM2 (Local/Server)
```bash
# Install PM2
npm install -g pm2

# Start the service
pm2 start npm --name "hlumisa-bot" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

### Using Docker (VPS - Recommended)
```bash
# Build and run
docker-compose up -d --build

# Or use deploy script
./deploy.sh
```

### Using systemd
Create `/etc/systemd/system/hlumisa-bot.service`:
```ini
[Unit]
Description=Hlumisa Properties Bot
After=network.target

[Service]
Type=simple
WorkingDirectory=/path/to/hlumisa-properties-bot
ExecStart=/usr/bin/npm start
Restart=always

[Install]
WantedBy=multi-user.target
```

## 📈 Monitoring

The service logs all activities:
- ✅ Message send success/failure
- ✅ Cron job execution
- ✅ Buyer/seller analysis results
- ✅ Database operations
- ✅ Errors and warnings

View logs:
```bash
# Docker
docker logs -f hlumisa-messenger-bot

# PM2
pm2 logs hlumisa-bot

# Direct
npm start
```

## 🔮 Future Enhancements

1. **Session Persistence**: Cache Facebook login sessions
2. **Retry Logic**: Automatic retry for failed messages
3. **Queue System**: More robust message queue
4. **API Endpoints**: REST API for manual triggers
5. **Webhook Support**: Real-time message processing
6. **Multi-account**: Support multiple Facebook accounts

## 📄 License

ISC

## 👨‍💻 Support

For issues or questions:
- Check logs for error messages
- Verify all environment variables are set
- Ensure database is accessible
- Test Facebook credentials manually

---

**This is a completely standalone microservice. No ASP.NET Core required.**