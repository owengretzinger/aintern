import express from "express";
import { z } from "zod";
import { MeetingTranscriptService } from "../services/meeting-transcript.service.js";
import { KnowledgeService } from "../services/documents.js";
import { RecallService, TranscriptEntry } from "../services/recall.service.js";
import { openai } from "../services/ai.js";

const router = express.Router();
const transcriptService = new MeetingTranscriptService();
const knowledgeService = new KnowledgeService();
const recallService = new RecallService();

// Start analysis for a bot
router.post("/analyze/:botId", async (req, res) => {
  try {
    const schema = z.object({
      botId: z.string(),
    });

    const { botId } = schema.parse(req.params);

    // Start the analysis job
    const { job_id } = await recallService.analyzeBotMedia(botId);

    res.json({
      status: "success",
      message: "Analysis job started",
      job_id,
      bot_id: botId,
    });
  } catch (error: any) {
    console.error("Error starting analysis:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Get analysis job status
router.get("/analyze/job/:jobId", async (req, res) => {
  try {
    const schema = z.object({
      jobId: z.string(),
    });

    const { jobId } = schema.parse(req.params);
    const jobStatus = await recallService.getAnalysisJob(jobId);

    res.json(jobStatus);
  } catch (error: any) {
    console.error("Error getting job status:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Get intelligence results
router.get("/intelligence/:botId", async (req, res) => {
  try {
    const schema = z.object({
      botId: z.string(),
    });

    const { botId } = schema.parse(req.params);
    const results = await recallService.getIntelligenceResults(botId);

    res.json(results);
  } catch (error: any) {
    console.error("Error getting intelligence results:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Get all transcripts
router.get("/transcripts", async (_req, res) => {
  try {
    const transcripts = await transcriptService.getAllTranscripts();
    res.json(transcripts);
  } catch (error: any) {
    console.error("Error fetching transcripts:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Get transcripts by bot ID
router.get("/transcripts/:botId", async (req, res) => {
  try {
    const schema = z.object({
      botId: z.string(),
    });

    const { botId } = schema.parse(req.params);
    const transcripts = await transcriptService.getTranscriptsByBotId(botId);
    res.json(transcripts);
  } catch (error: any) {
    console.error("Error fetching transcripts:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Webhook endpoint for recall.ai
router.post("/webhook", async (req, res) => {
  try {
    console.log("Received webhook:", JSON.stringify(req.body, null, 2));

    const schema = z.object({
      data: z.object({
        bot_id: z.string(),
        status: z
          .object({
            code: z.string(),
            created_at: z.string(),
            message: z.string().nullable(),
            sub_code: z.string().nullable(),
          })
          .optional(),
      }),
      event: z.string(),
    });

    const { data, event } = schema.parse(req.body);
    const bot_id = data.bot_id;

    if (event === "bot.status_change" && data.status?.code === "call_ended") {
      try {
        // Get transcript
        const transcript = await recallService.getBotTranscript(bot_id);

        // Generate summary using OpenAI
        const transcriptText = transcript
          .map(
            (entry: TranscriptEntry) =>
              `${entry.speaker}: ${entry.words.map((w) => w.text).join(" ")}`,
          )
          .join("\n");

        const completion = await openai.chat.completions.create({
          model: "gpt-4o", // DO NOT CHANGE THIS
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that generates concise but informative meeting summaries. Focus on key points, decisions, and action items.",
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
        if (!summary) throw new Error("Failed to generate summary");

        // Store transcript and summary in database
        await transcriptService.storeTranscript(bot_id, summary);

        // Store summary in knowledge base for context
        await knowledgeService.addDocument(summary, {
          type: "meeting_summary",
          bot_id: bot_id,
          date: new Date().toISOString(),
        });
      } catch (error) {
        console.error(
          `Failed to process meeting data for bot ${bot_id}:`,
          error,
        );
      }
    }

    res.json({ status: "success" });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

export const recallWebhookRouter = router;
