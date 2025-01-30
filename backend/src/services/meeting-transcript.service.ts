import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";
import { RecallService } from "./recall.service.js";

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
const recallService = new RecallService();

export class MeetingTranscriptService {
  async storeTranscript(botId: string, summary: string) {
    try {
      const transcript = await recallService.getBotTranscript(botId);

      const { data, error } = await supabase
        .from("meeting_transcripts")
        .insert([
          {
            bot_id: botId,
            transcript: transcript,
            summary: summary,
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error("Error storing transcript:", error);
      throw error;
    }
  }

  async getTranscriptsByBotId(botId: string) {
    try {
      const { data, error } = await supabase
        .from("meeting_transcripts")
        .select("*")
        .eq("bot_id", botId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching transcripts:", error);
      throw error;
    }
  }

  async getAllTranscripts() {
    try {
      const { data, error } = await supabase
        .from("meeting_transcripts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching all transcripts:", error);
      throw error;
    }
  }
}
