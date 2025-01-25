import dotenv from "dotenv";

dotenv.config();

if (!process.env.RECALL_API_KEY) {
  console.error("Error: RECALL_API_KEY is not set in environment variables");
  process.exit(1);
}

const RECALL_REGION = process.env.RECALL_REGION || "us-east-1";
const BASE_URL = `https://${RECALL_REGION}.recall.ai/api/v1`;

export interface CreateBotResponse {
  id: string;
  video_url: string | null;
  status_changes: Array<{
    code: string;
    message: string | null;
    created_at: string;
  }>;
  meeting_metadata: any;
  meeting_participants: Array<{
    id: number;
    name: string;
    events: Array<{
      code: string;
      created_at: string;
    }>;
    is_host: boolean;
    platform: string;
    extra_data: any;
  }>;
}

export const createBot = async (meetingUrl: string): Promise<CreateBotResponse> => {
  const response = await fetch(`${BASE_URL}/bot`, {
    method: "POST",
    headers: {
      "Authorization": `Token ${process.env.RECALL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      meeting_url: meetingUrl,
      bot_name: "AI Intern Bot",
      transcription_options: { provider: "meeting_captions" }
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create bot: ${response.statusText}`);
  }

  return response.json();
};

export const getBotStatus = async (botId: string): Promise<CreateBotResponse> => {
  const response = await fetch(`${BASE_URL}/bot/${botId}`, {
    headers: {
      "Authorization": `Token ${process.env.RECALL_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get bot status: ${response.statusText}`);
  }

  return response.json();
};

export const getBotTranscript = async (botId: string): Promise<any> => {
  const response = await fetch(`${BASE_URL}/bot/${botId}/transcript`, {
    headers: {
      "Authorization": `Token ${process.env.RECALL_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get bot transcript: ${response.statusText}`);
  }

  return response.json();
}; 