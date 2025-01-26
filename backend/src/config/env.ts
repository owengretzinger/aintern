import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().transform(Number).default("3001"),
  OPENAI_API_KEY: z.string().min(1),
  ELEVEN_LABS_API_KEY: z.string().min(1),
  RECALL_API_KEY: z.string().min(1),
  RECALL_REGION: z.string().default("us-west-2"),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  SUPABASE_URL: z.string().min(1),
  SUPABASE_KEY: z.string().min(1),
});

export const env = envSchema.parse(process.env);

export const CORS_ORIGINS = [
  "https://aintern.vercel.app",
  "https://aintern-six.vercel.app",
  "http://localhost:5173",
  "http://localhost:4000",
  /^https:\/\/.*\.ngrok-free\.app$/,
];
