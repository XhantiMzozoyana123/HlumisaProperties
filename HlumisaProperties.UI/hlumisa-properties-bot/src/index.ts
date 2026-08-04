import dotenv from "dotenv";
import { CronService } from "./services/cron-service";

// Load environment variables
dotenv.config();

const MESSENGER_EMAIL = process.env.MESSENGER_EMAIL_ADDRESS;
const MESSENGER_PASSWORD = process.env.MESSENGER_PASSWORD;
const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;

// Validate required environment variables
if (!MESSENGER_EMAIL || !MESSENGER_PASSWORD) {
  console.error("❌ ERROR: MESSENGER_EMAIL_ADDRESS and MESSENGER_PASSWORD are required in .env file");
  process.exit(1);
}

if (!DB_HOST || !DB_NAME) {
  console.error("❌ ERROR: DB_HOST and DB_NAME are required in .env file");
  process.exit(1);
}

console.log("╔════════════════════════════════════════════════════════════╗");
console.log("║                                                            ║");
console.log("║   🤖 Hlumisa Properties - Messenger Bot Microservice      ║");
console.log("║   Standalone AI Chatbot with Puppeteer + LLM              ║");
console.log("║                                                            ║");
console.log("╚════════════════════════════════════════════════════════════╝");
console.log("");
console.log("📋 Configuration:");
console.log(`   Facebook Email: ${MESSENGER_EMAIL}`);
console.log(`   Database: ${DB_HOST}/${DB_NAME}`);
console.log(`   LLM: ${process.env.LLM_BASE_URL || 'http://63.141.255.202:11434'}`);
console.log("");

// Initialize and start cron service
const cronService = new CronService();

// Start the service
cronService.start();

console.log("");
console.log("✅ Messenger Bot is running!");
console.log("   - Scheduled messages: Every 5 minutes");
console.log("   - Intent analysis: Every hour");
console.log("   - Database: Direct MySQL connection");
console.log("   - Automation: Puppeteer browser automation");
console.log("");
console.log("Press Ctrl+C to stop...");

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("");
  console.log("🛑 Shutting down gracefully...");
  cronService.stop();
  console.log("✅ Shutdown complete");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("");
  console.log("🛑 Shutting down gracefully...");
  cronService.stop();
  console.log("✅ Shutdown complete");
  process.exit(0);
});