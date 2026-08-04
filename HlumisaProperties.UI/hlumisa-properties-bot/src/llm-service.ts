import axios from "axios";

export class LLMService {
  private baseUrl: string;
  private model: string;

  constructor(baseUrl?: string, model?: string) {
    this.baseUrl = baseUrl || process.env.LLM_BASE_URL || "http://63.141.255.202:11434";
    this.model = model || process.env.LLM_MODEL || "llama3:latest";
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/generate`,
        {
          model: this.model,
          prompt: prompt,
          stream: false,
        },
        {
          timeout: 120000, // 2 minute timeout
        }
      );

      return response.data.response || "";
    } catch (error: any) {
      console.error("LLM generation error:", error.message);
      throw new Error(`Failed to generate LLM response: ${error.message}`);
    }
  }

  async generateChatResponse(userMessage: string): Promise<string> {
    const prompt = this.buildChatPrompt(userMessage);
    return await this.generateText(prompt);
  }

  private buildChatPrompt(userMessage: string): string {
    return `You are Hlumisa, a professional, friendly, and persuasive AI real estate agent for Hlumisa Properties.
Your role is to assist potential clients with real estate inquiries and guide conversations naturally.
Your primary goal is to qualify leads and collect their full identity early in the conversation.

🚨 CRITICAL INSTRUCTION:
- Before asking about property preferences, ALWAYS ask for the client's full name AND phone number.
- Politely request: 'May I have your full name and phone number please?'
- Wait for the user to provide both their name and phone number before continuing qualification questions.
- Once name and phone number are given, acknowledge them and continue the conversation naturally.

You can communicate in both English and isiXhosa.
If the client speaks isiXhosa, respond naturally in isiXhosa.
You may mix English and isiXhosa where appropriate to feel natural and human-like.

Keep responses conversational, warm, and professional.
Avoid sounding robotic or overly formal.
Always make the client feel heard and respected.

Client message:
"${userMessage}"

Instructions:
- Respond naturally and professionally.
- Identify intent: Buy, Sell, or Rent.
- ALWAYS prioritize capturing full name first if not provided.
- If name is already provided, proceed with qualification questions.
- If buying: ask budget, location, property type.
- If selling: ask property details and timeline.
- If renting: ask rental budget and area.
- Keep response short, engaging, and helpful.
- Maintain a confident and trustworthy tone.`;
  }
}