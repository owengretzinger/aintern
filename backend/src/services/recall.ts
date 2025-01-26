import dotenv from "dotenv";

dotenv.config();

if (!process.env.RECALL_API_KEY) {
  console.error("Error: RECALL_API_KEY is not set in environment variables");
  process.exit(1);
}

const RECALL_REGION = process.env.RECALL_REGION || "us-west-2";
const BASE_URL = `https://${RECALL_REGION}.recall.ai/api/v1`;
const BASE_URL_V2 = `https://${RECALL_REGION}.recall.ai/api/v2beta`;

// Common headers for all requests
const getHeaders = (isV2: boolean = false) => ({
  "Authorization": `Token ${process.env.RECALL_API_KEY}`,
  "Content-Type": "application/json",
  ...(isV2 ? { "accept": "application/json" } : {}),
});

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
    headers: getHeaders(),
    body: JSON.stringify({
      meeting_url: meetingUrl,
      bot_name: "AI Intern Bot",
      transcription_options: { provider: "assembly_ai" },
      assemblyai_async_transcription: {
        summarization: true,
        summary_type: "paragraph",
        summary_model: "informative"
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create bot: ${response.statusText}`);
  }

  return response.json();
};

export const getBotStatus = async (botId: string): Promise<CreateBotResponse> => {
  const response = await fetch(`${BASE_URL}/bot/${botId}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to get bot status: ${response.statusText}`);
  }

  return response.json();
};

export const getBotTranscript = async (botId: string): Promise<any> => {
  const response = await fetch(`${BASE_URL}/bot/${botId}/transcript`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to get bot transcript: ${response.statusText}`);
  }

  return response.json();
};

export const analyzeBotMedia = async (botId: string): Promise<{ job_id: string }> => {
  console.log(`Analyzing bot media for ${botId} with URL: ${BASE_URL_V2}/bot/${botId}/analyze`);
  const response = await fetch(`${BASE_URL_V2}/bot/${botId}/analyze`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify({
      assemblyai_async_transcription: {
        summarization: true,
        summary_type: "paragraph",
        summary_model: "informative"
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Analysis failed with status ${response.status}: ${errorText}`);
    throw new Error(`Failed to analyze bot media: ${response.statusText}`);
  }

  return response.json();
};

export const getAnalysisJob = async (jobId: string): Promise<any> => {
  const response = await fetch(`${BASE_URL_V2}/analysis/job/${jobId}`, {
    headers: getHeaders(true),
  });

  if (!response.ok) {
    throw new Error(`Failed to get analysis job: ${response.statusText}`);
  }

  return response.json();
};

export const getIntelligenceResults = async (botId: string): Promise<any> => {
  const response = await fetch(`${BASE_URL}/bot/${botId}/intelligence/`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to get intelligence results: ${response.statusText}`);
  }

  return response.json();
}; 