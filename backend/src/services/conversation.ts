import OpenAI from "openai";
import { env } from "../config/env.js";
import { AudioService } from "./audio.js";
import type { ConversationHistory, Message } from "../types/shared.js";

export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export class ConversationService {
  private sessionHistories = new Map<string, ConversationHistory[]>();
  private audioService: AudioService;

  constructor() {
    this.audioService = new AudioService();
  }

  async processChat(userMessage: string, sessionId: string = "default") {
    // Initialize or get conversation history
    if (!this.sessionHistories.has(sessionId)) {
      this.sessionHistories.set(sessionId, [
        {
          role: "system",
          content: `You are an AI intern assistant. You should maintain context from previous messages.
You will reply with a JSON array of messages. Only use multiple messages when the response naturally requires separate statements or emotions.
Most responses should be a single message unless there's a clear reason to split them.
Each message has a text, facialExpression, and animation property.
The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
The different animations are: Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, and Angry.`,
        },
      ]);
    }

    const history = this.sessionHistories.get(sessionId)!;

    // Add user message to history
    history.push({ role: "user", content: userMessage });

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1000,
      temperature: 0.8,
      messages: history,
    });

    // Parse response
    const content = completion.choices[0].message.content || "[]";
    const jsonStr = content.replace(/^```json\n|\n```$/g, "").trim();
    const messages: Message[] = JSON.parse(jsonStr);

    // Add assistant response to history
    history.push({
      role: "assistant",
      content: content,
    });

    // Limit history size
    this.pruneHistory(history);

    // Process audio for each message
    for (let i = 0; i < messages.length; i++) {
      try {
        const { audio, lipsync } = await this.audioService.processAudioMessage(
          i,
          messages[i].text
        );
        messages[i].audio = audio;
        messages[i].lipsync = lipsync;
      } catch (error) {
        console.error("Error processing audio for message:", error);
        messages[i].audio = "";
        messages[i].lipsync = null;
      }
    }

    return messages;
  }

  private pruneHistory(history: ConversationHistory[]) {
    if (history.length > 10) {
      const systemMessage = history[0];
      history.splice(0, history.length - 9);
      history.unshift(systemMessage);
    }
  }
} 