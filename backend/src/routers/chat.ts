import express from "express";
import { z } from "zod";
import { ConversationService } from "../services/conversation.js";

const router = express.Router();
const conversationService = new ConversationService();

router.post("/chat", async (req, res) => {
  try {
    const schema = z.object({
      message: z.string(),
      sessionId: z.string().default("default"),
    });

    const { message: userMessage, sessionId } = schema.parse(req.body);

    if (!userMessage) {
      throw new Error("No message provided");
    }

    const messages = await conversationService.processChat(userMessage, sessionId);
    res.json({ messages });
  } catch (error: any) {
    console.error("Error in chat endpoint:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

export const chatRouter = router;
