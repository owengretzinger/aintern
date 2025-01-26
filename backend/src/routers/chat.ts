import express from "express";
import { z } from "zod";
import { openai, voice } from "../services/ai.js";
import {
  audioFileToBase64,
  lipSyncMessage,
  readJsonTranscript,
} from "../utils.js";
import type { ConversationHistory } from "../types/shared.js";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUDIO_DIR = path.join(__dirname, "../../audios");

const router = express.Router();

// Store conversation history for each session
const sessionHistories = new Map<string, ConversationHistory[]>();

router.post("/chat", async (req, res) => {
  try {
    const schema = z.object({
      message: z.string(),
      sessionId: z.string().default("default"),
    });

    const { message: userMessage, sessionId } = schema.parse(req.body);

    if (!userMessage) {
      throw new Error("No message provided");
    }

    // Get or initialize conversation history for this session
    if (!sessionHistories.has(sessionId)) {
      sessionHistories.set(sessionId, [
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

    const history = sessionHistories.get(sessionId)!;

    // Add user message to history
    history.push({ role: "user", content: userMessage });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // DO NOT CHANGE gpt-4o-mini
      max_tokens: 1000,
      temperature: 0.8,
      messages: history,
    });

    let messages;
    try {
      const content = completion.choices[0].message.content || "[]";
      // Remove any markdown code block syntax if present
      const jsonStr = content.replace(/^```json\n|\n```$/g, "").trim();
      messages = JSON.parse(jsonStr);

      // Add assistant response to history
      history.push({
        role: "assistant",
        content: content,
      });

      // Limit history size to prevent token overflow
      if (history.length > 10) {
        // Keep system message and last 9 messages
        const systemMessage = history[0];
        history.splice(0, history.length - 9);
        history.unshift(systemMessage);
      }
    } catch (error) {
      console.error("Failed to parse OpenAI response:", error);
      throw new Error("Failed to parse AI response");
    }

    // Process each message
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const baseFileName = `message_${i}`;

      // Clean up existing files before creating new ones
      try {
        await fs.unlink(path.join(AUDIO_DIR, `${baseFileName}.mp3`));
        await fs.unlink(path.join(AUDIO_DIR, `${baseFileName}.wav`));
        await fs.unlink(path.join(AUDIO_DIR, `${baseFileName}.json`));
      } catch (error) {
        // Ignore errors if files don't exist
      }

      const fileName = path.join(AUDIO_DIR, `${baseFileName}.mp3`);
      const textInput = message.text;

      try {
        await voice.textToSpeech({
          fileName,
          textInput,
          voiceId: "cgSgspJ2msm6clMCkdW9",
          stability: 0.5,
          similarityBoost: 0.5,
          modelId: "eleven_multilingual_v2",
          style: 0,
          speakerBoost: true,
        });

        await lipSyncMessage(i);
        message.audio = await audioFileToBase64(fileName);
        message.lipsync = await readJsonTranscript(
          path.join(AUDIO_DIR, `${baseFileName}.json`)
        );
      } catch (error) {
        console.error("Error processing text to speech:", error);
        message.audio = "";
        message.lipsync = null;
      }
    }

    res.json({ messages });
  } catch (error: any) {
    console.error("Error in chat endpoint:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

export const chatRouter = router;
