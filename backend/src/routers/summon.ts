import express from "express";
import { MeetingService } from "../services/meeting.service.js";
import { RecallService, TranscriptEntry } from "../services/recall.service.js";
import { openai } from "../services/ai.js";

export const summonRouter = express.Router();
const meetingService = new MeetingService();
const recallService = new RecallService();

summonRouter.post("/summon", async (req, res) => {
  try {
    const { meeting_url } = req.body;
    if (!meeting_url) {
      res.status(400).json({ error: "Missing meeting_url" });
      return;
    }

    // Create bot in recall.ai
    const bot = await recallService.createBot(meeting_url);

    // Create meeting in our database
    const meeting = await meetingService.createMeeting(bot.id);

    res.json({ meeting, bot });
  } catch (e) {
    console.warn(e);
    res.status(500).json({ error: "Failed to create meeting" });
  }
});

summonRouter.get("/meetings", async (_req, res) => {
  try {
    // Check and update status of in-progress meetings
    await meetingService.checkAndUpdateMeetings();

    // Get all meetings
    const meetings = await meetingService.getAllMeetings();

    res.json(meetings);
  } catch (error) {
    console.error("Error fetching meetings:", error);
    res.status(500).json({ error: "Failed to fetch meetings" });
  }
});

summonRouter.post(
  "/transcript",
  async (req: express.Request, res: express.Response) => {
    try {
      const response = await fetch(
        "https://us-west-2.recall.ai/api/v1/bot/" + req.body.id + "/transcript",
        {
          headers: {
            Authorization: "Token " + process.env.RECALL_API_KEY,
            "Content-Type": "application/json",
          },
        },
      );

      res.json(await response.json());
    } catch (e) {
      console.warn(e);
      res.status(500);
    }
  },
);

summonRouter.get("/get-summary/:botId", async (req, res) => {
  try {
    const { botId } = req.params;
    console.log("Getting summary for bot:", botId);

    // Get transcript
    const transcript = await recallService.getBotTranscript(botId);
    console.log("Got transcript:", transcript);

    // Generate summary using OpenAI
    let summary = null;
    try {
      const transcriptText = transcript
        .map(
          (entry: TranscriptEntry) =>
            `${entry.speaker}: ${entry.words.map((w) => w.text).join(" ")}`,
        )
        .join("\n");

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
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

      summary = completion.choices[0].message.content;
      console.log("Generated summary:", summary);
    } catch (error) {
      console.error("Error generating summary:", error);
    }

    res.json({ transcript, summary });
  } catch (error) {
    console.error("Error getting meeting summary:", error);
    res.status(500).json({ error: "Failed to get meeting summary" });
  }
});
