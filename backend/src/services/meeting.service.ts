import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";
import { RecallService } from "./recall.service.js";
import { openai } from "./ai.js";

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
const recallService = new RecallService();

export class MeetingService {
  async createMeeting(botId: string) {
    try {
      const { data, error } = await supabase
        .from("meetings")
        .insert([{ bot_id: botId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating meeting:", error);
      throw error;
    }
  }

  async getAllMeetings() {
    try {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching meetings:", error);
      throw error;
    }
  }

  async checkAndUpdateMeetings() {
    try {
      // Get all meetings in 'in_meeting' status
      const { data: meetings, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("status", "in_meeting");

      if (error) throw error;

      for (const meeting of meetings) {
        try {
          // Check bot status
          const botStatus = await recallService.getBotStatus(meeting.bot_id);

          // If bot is no longer in meeting
          if (
            botStatus.status_changes.some((change) =>
              ["done", "fatal"].includes(change.code),
            )
          ) {
            console.log(
              `Bot ${meeting.bot_id} has left the meeting, processing data...`,
            );

            // Get transcript
            const transcript = await recallService.getBotTranscript(
              meeting.bot_id,
            );
            console.log("Got transcript:", transcript);

            // Generate summary using OpenAI
            const transcriptText = transcript
              .map(
                (entry) =>
                  `${entry.speaker}: ${entry.words
                    .map((w) => w.text)
                    .join(" ")}`,
              )
              .join("\n");

            const completion = await openai.chat.completions.create({
              model: "gpt-4",
              messages: [
                {
                  role: "system",
                  content:
                    "You are a helpful assistant that generates concise but informative meeting summaries. Focus on key points, decisions, and action items. Do not include any headings or prefixes like 'Meeting Summary:' - just start directly with the content.",
                },
                {
                  role: "user",
                  content: `Please provide a summary of this meeting transcript:\n\n${transcriptText}`,
                },
              ],
              temperature: 0.7,
              max_tokens: 500,
            });

            const summary = completion.choices[0].message.content;
            console.log("Generated summary:", summary);

            // Update meeting in database
            const { error: updateError } = await supabase
              .from("meetings")
              .update({
                status: "completed",
                transcript,
                summary,
                updated_at: new Date().toISOString(),
              })
              .eq("id", meeting.id);

            if (updateError) throw updateError;
            console.log(`Meeting ${meeting.id} successfully updated`);
          }
        } catch (error) {
          console.error(`Error processing meeting ${meeting.id}:`, error);
          // Update meeting status to error
          await supabase
            .from("meetings")
            .update({
              status: "error",
              updated_at: new Date().toISOString(),
            })
            .eq("id", meeting.id);
        }
      }
    } catch (error) {
      console.error("Error checking meetings:", error);
      throw error;
    }
  }
}
