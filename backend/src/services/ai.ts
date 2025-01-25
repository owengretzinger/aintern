import ElevenLabs from "elevenlabs-node";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  console.error("Error: OPENAI_API_KEY is not set in environment variables");
  process.exit(1);
}

if (!process.env.ELEVEN_LABS_API_KEY) {
  console.error(
    "Error: ELEVEN_LABS_API_KEY is not set in environment variables",
  );
  process.exit(1);
}

export const VOICE_ID = "cgSgspJ2msm6clMCkdW9";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const voice = new ElevenLabs({
  apiKey: process.env.ELEVEN_LABS_API_KEY,
  voiceId: VOICE_ID,
});
