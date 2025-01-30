import dotenv from "dotenv";
import { env } from "../config/env.js";

dotenv.config();

if (!env.RECALL_API_KEY) {
  console.error("Error: RECALL_API_KEY is not set in environment variables");
  process.exit(1);
}

const RECALL_REGION = env.RECALL_REGION || "us-west-2";
const BASE_URL = `https://${RECALL_REGION}.recall.ai/api/v1`;
const BASE_URL_V2 = `https://${RECALL_REGION}.recall.ai/api/v2beta`;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";
const BACKEND_WS_URL = process.env.BACKEND_WS_URL || "ws://localhost:3001";

// Common headers for all requests
const getHeaders = (isV2: boolean = false) => ({
  Authorization: `Token ${env.RECALL_API_KEY}`,
  "Content-Type": "application/json",
  ...(isV2 ? { accept: "application/json" } : {}),
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

export interface TranscriptWord {
  text: string;
  start_timestamp?: number;
  end_timestamp?: number;
  confidence?: number;
}

export interface TranscriptEntry {
  speaker: string;
  words: TranscriptWord[];
}

export class RecallService {
  async createBot(meetingUrl: string): Promise<CreateBotResponse> {
    const response = await fetch(`${BASE_URL}/bot`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        meeting_url: meetingUrl,
        bot_name: "Iris the Intern",
        output_media: {
          camera: {
            kind: "webpage",
            config: {
              url: "https://falcon-enough-corgi.ngrok-free.app?viewOnly=true",
            },
          },
        },
        transcription_options: {
          provider: "meeting_captions",
        },
        variant: {
          google_meet: "web_4_core",
        },
        include_bot_in_recording: { audio: true },
        recording_mode: "gallery_view_v2",
      }),
    });

    console.log(
      JSON.stringify({
        meeting_url: meetingUrl,
        bot_name: "Iris the Intern",
        output_media: {
          camera: {
            kind: "webpage",
            config: {
              url: "https://falcon-enough-corgi.ngrok-free.app?viewOnly=true",
            },
          },
        },
        transcription_options: {
          provider: "meeting_captions",
        },
        variant: {
          google_meet: "web_4_core",
        },
        include_bot_in_recording: { audio: true },
        recording_mode: "gallery_view_v2",
      }),
    );

    if (!response.ok) {
      throw new Error(`Failed to create bot: ${response.statusText}`);
    }

    return response.json();
  }

  async getBotStatus(botId: string): Promise<CreateBotResponse> {
    const response = await fetch(`${BASE_URL}/bot/${botId}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get bot status: ${response.statusText}`);
    }

    return response.json();
  }

  async getBotTranscript(botId: string): Promise<TranscriptEntry[]> {
    const response = await fetch(`${BASE_URL}/bot/${botId}/transcript`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get bot transcript: ${response.statusText}`);
    }

    return response.json();
  }

  async analyzeBotMedia(botId: string): Promise<{ job_id: string }> {
    console.log(
      `Analyzing bot media for ${botId} with URL: ${BASE_URL_V2}/bot/${botId}/analyze`,
    );
    const response = await fetch(`${BASE_URL_V2}/bot/${botId}/analyze`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify({
        assemblyai_async_transcription: {
          summarization: true,
          summary_type: "paragraph",
          summary_model: "informative",
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Analysis failed with status ${response.status}: ${errorText}`,
      );
      throw new Error(`Failed to analyze bot media: ${response.statusText}`);
    }

    return response.json();
  }

  async getAnalysisJob(jobId: string): Promise<any> {
    const response = await fetch(`${BASE_URL_V2}/analysis/job/${jobId}/`, {
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error(`Failed to get analysis job: ${response.statusText}`);
    }

    return response.json();
  }

  async getIntelligenceResults(botId: string): Promise<any> {
    console.log(`Getting intelligence results for bot ${botId}`);
    const response = await fetch(`${BASE_URL}/bot/${botId}/intelligence/`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to get intelligence results: ${response.statusText}`,
      );
    }

    const data = await response.json();
    console.log("Intelligence results response:", data);
    return data;
  }
}
