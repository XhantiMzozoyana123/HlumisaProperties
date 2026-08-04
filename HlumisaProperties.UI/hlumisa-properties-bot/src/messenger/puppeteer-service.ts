import puppeteer from 'puppeteer';

export class PuppeteerService {
  private browser: any = null;

  async launchBrowser(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async sendMessage(email: string, password: string, chatId: string, message: string): Promise<boolean> {
    try {
      if (!this.browser) {
        await this.launchBrowser();
      }

      const page = await this.browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });

      // Navigate to Messenger
      await page.goto('https://messenger.com', { waitUntil: 'networkidle2' });
      
      // Handle cookie dialog if present
      try {
        const cookieButton = await page.$('[data-testid="cookie-policy-manage-dialog-accept-button"]');
        if (cookieButton) {
          await cookieButton.click();
          await page.waitForTimeout(1000);
        }
      } catch (e) {
        // Cookie dialog not present, continue
      }

      // Login
      await page.type('#email', email);
      await page.type('#pass', password);
      await page.keyboard.press('Enter');
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });

      // Navigate to chat
      await page.goto(`https://www.messenger.com/t/${chatId}`, { 
        waitUntil: 'networkidle2',
        timeout: 60000 
      });

      // Wait for message input and type message
      await page.waitForSelector('[role="textbox"]', { timeout: 30000 });
      await page.type('[role="textbox"]', message);
      await page.keyboard.press('Enter');

      // Wait a bit for message to send
      await page.waitForTimeout(3000);

      // Logout
      try {
        const settingsButton = await page.$('[aria-label="Settings, help and more"]');
        if (settingsButton) {
          await settingsButton.click();
          await page.waitForTimeout(1000);
          
          const logoutButton = await page.$x('//span[contains(., "Log Out")]');
          if (logoutButton.length > 0) {
            await logoutButton[0].click();
            await page.waitForNavigation({ waitUntil: 'load', timeout: 30000 });
          }
        }
      } catch (e) {
        // Logout failed, but message was sent
        console.log('Logout failed, but message was sent');
      }

      await page.close();
      return true;
    } catch (error: any) {
      console.error('Error sending message:', error.message);
      return false;
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}