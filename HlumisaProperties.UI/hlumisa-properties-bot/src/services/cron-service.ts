import { CronJob } from 'cron';
import { PuppeteerService } from '../messenger/puppeteer-service';
import { DatabaseConnection } from '../database/db-connection';
import { LLMService } from '../llm-service';
import { AIConstants } from '../ai-constants';

export class CronService {
  private puppeteerService: PuppeteerService;
  private db: DatabaseConnection;
  private llmService: LLMService;
  private jobs: CronJob[] = [];

  constructor() {
    this.puppeteerService = new PuppeteerService();
    this.db = DatabaseConnection.getInstance();
    this.llmService = new LLMService();
  }

  start(): void {
    console.log('Starting cron jobs...');

    // Job 1: Send scheduled messages every 5 minutes
    this.scheduleMessageSender();

    // Job 2: Analyze conversations for buyer/seller intent every hour
    this.scheduleIntentAnalyzer();

    console.log('Cron jobs started successfully');
  }

  private scheduleMessageSender(): void {
    const job = new CronJob(
      '*/5 * * * *', // Every 5 minutes
      async () => {
        console.log('Running scheduled message sender...');
        await this.sendScheduledMessages();
      },
      null,
      false,
      'Africa/Johannesburg'
    );

    job.start();
    this.jobs.push(job);
  }

  private scheduleIntentAnalyzer(): void {
    const job = new CronJob(
      '0 * * * *', // Every hour
      async () => {
        console.log('Running buyer/seller intent analyzer...');
        await this.analyzeConversations();
      },
      null,
      false,
      'Africa/Johannesburg'
    );

    job.start();
    this.jobs.push(job);
  }

  private async sendScheduledMessages(): Promise<void> {
    try {
      // Get all pending messages from database
      const pendingMessages = await this.db.query(
        'SELECT * FROM scheduled_messages WHERE sent = 0 AND scheduled_at <= NOW() LIMIT 10'
      );

      const messages = pendingMessages as any[];
      console.log(`Found ${messages.length} pending messages`);

      for (const msg of messages) {
        try {
          const success = await this.puppeteerService.sendMessage(
            msg.email,
            msg.password,
            msg.chat_id,
            msg.message
          );

          if (success) {
            // Mark as sent
            await this.db.query(
              'UPDATE scheduled_messages SET sent = 1, sent_at = NOW() WHERE id = ?',
              [msg.id]
            );
            console.log(`Message sent to ${msg.chat_id}`);
          } else {
            console.error(`Failed to send message to ${msg.chat_id}`);
          }
        } catch (error) {
          console.error(`Error sending message ${msg.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in sendScheduledMessages:', error);
    }
  }

  private async analyzeConversations(): Promise<void> {
    try {
      // Get recent conversations that haven't been analyzed
      const conversations = await this.db.query(`
        SELECT DISTINCT sender_id, recipient_id 
        FROM facebook_messages 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        AND sender_id NOT LIKE 'PAGE_%'
        LIMIT 20
      `);

      const convs = conversations as any[];
      console.log(`Analyzing ${convs.length} conversations for buyer/seller intent`);

      for (const conv of convs) {
        try {
          // Get conversation history
          const messages = await this.db.query(
            'SELECT text, direction, created_at FROM facebook_messages WHERE (sender_id = ? OR recipient_id = ?) ORDER BY created_at ASC LIMIT 20',
            [conv.sender_id, conv.sender_id]
          );

          const msgs = messages as any[];
          if (!msgs || msgs.length < 2) {
            continue; // Skip if not enough messages
          }

          // Build conversation JSON
          const conversationJson = JSON.stringify(messages);

          // Use LLM to analyze intent
          const prompt = AIConstants.getLeadExtractionInstructions(conversationJson);
          const llmResponse = await this.llmService.generateText(prompt);

          // Parse LLM response
          try {
            const leads = JSON.parse(llmResponse);
            
            if (Array.isArray(leads) && leads.length > 0) {
              const lead = leads[0];
              
              // Determine lead type and insert into appropriate table
              const leadType = lead.LeadType || 'Buyer';
              
              if (leadType === 'Buyer') {
                // Insert into Buyers table
                await this.db.query(
                  `INSERT INTO Buyers (FirstName, LastName, PhoneNumber, Location, Budget, PropertyType, IsContacted, IsDiscarded)
                   VALUES (?, ?, ?, ?, ?, ?, 0, 0)`,
                  [
                    lead.FirstName || '',
                    lead.LastName || '',
                    lead.PhoneNumber || '',
                    lead.Location || '',
                    lead.Budget || '',
                    lead.PropertyType || ''
                  ]
                );
                console.log(`New buyer created: ${lead.FirstName} ${lead.LastName}`);
              } else if (leadType === 'Seller') {
                // Insert into Sellers table
                await this.db.query(
                  `INSERT INTO Sellers (FirstName, LastName, PhoneNumber, Location, PropertyType, EstimatedValue, IsContacted, IsDiscarded, StatusColor)
                   VALUES (?, ?, ?, ?, ?, ?, 0, 0, 'white')`,
                  [
                    lead.FirstName || '',
                    lead.LastName || '',
                    lead.PhoneNumber || '',
                    lead.Location || '',
                    lead.PropertyType || '',
                    lead.EstimatedValue || ''
                  ]
                );
                console.log(`New seller created: ${lead.FirstName} ${lead.LastName}`);
              }
            }
          } catch (parseError) {
            console.error('Failed to parse LLM response:', parseError);
          }
        } catch (error) {
          console.error(`Error analyzing conversation ${conv.sender_id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in analyzeConversations:', error);
    }
  }

  stop(): void {
    console.log('Stopping cron jobs...');
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
    this.puppeteerService.close();
    this.db.close();
  }
}