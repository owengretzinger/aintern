import { z } from "zod";
import { publicProcedure, router } from "../trpc.js";
import { openai, voice } from "../services/ai.js";
import {
  audioFileToBase64,
  lipSyncMessage,
  readJsonTranscript,
} from "../utils.js";

export const chatRouter = router({
  chat: publicProcedure
    .input(
      z.object({
        message: z.string(),
        sessionId: z.string().default("default"),
      })
    )
    .mutation(async ({ input }) => {
      const { message: userMessage, sessionId } = input;

      if (!userMessage) {
        throw new Error("No message provided");
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // do not change
        max_tokens: 1000,
        temperature: 0.6,
        messages: [
          {
            role: "system",
            content: `
            You are an AI intern assistant.
            You will reply with a JSON array of messages. Only use multiple messages when the response naturally requires separate statements or emotions.
            Most responses should be a single message unless there's a clear reason to split them.
            Each message has a text, facialExpression, and animation property.
            The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
            The different animations are: Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, and Angry. 
            `,
          },
          { role: "user", content: userMessage },
        ],
      });

      let messages = JSON.parse(completion.choices[0].message.content || "{}");
      if ((messages as any).messages) {
        messages = (messages as any).messages;
      }

      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        const fileName = `audios/message_${i}.mp3`;
        const textInput = message.text;

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
        message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
      }

      return { messages };
    }),
});
