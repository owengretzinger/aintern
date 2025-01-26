import cors from "cors";
import express from "express";
import http from "http";
import { chatRouter } from "./routers/chat.js";
import { meetingRouter } from "./routers/meeting.js";
import { ConversationService } from "./services/conversation.js";
import WebSocketService from "./services/websocket.js";
import { env, CORS_ORIGINS } from "./config/env.js";

import { summonRouter } from "./routers/summon";
import { memoryRouter } from "./routers/memory-upload.js";

const app = express();
app.use(express.json());

// Configure CORS
app.use(
  cors({
    origin: CORS_ORIGINS,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket service
const wsService = new WebSocketService(server);

// Initialize Conversation service
const conversationService = new ConversationService();

// Add test route
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "Backend is running!",
    timestamp: new Date().toISOString(),
  });
});

// Add transcript endpoint
app.post("/api/transcript", async (req, res) => {
  try {
    const transcriptData = req.body;
    console.log("Transcript data received:", transcriptData);

    // Broadcast transcript to all connected WebSocket clients
    wsService.broadcastTranscript(transcriptData);

    // Handle wake word detection
    if (transcriptData.transcript) {
      const transcriptText =
        transcriptData.transcript.words
          ?.map((w: { text: string }) => w.text)
          .join(" ") || "";
      console.log("Transcript text:", transcriptText);

      if (transcriptText.toLowerCase().includes("alexa")) {
        console.log("Wake word detected");

        try {
          const messages = await conversationService.processChat(
            transcriptText
          );
          wsService.broadcastAIResponse(messages);
          console.log("AI response sent to clients");
        } catch (error) {
          console.error("Error processing chat request:", error);
        }
      }
    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Error processing transcript:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Mount routers
app.use("/api/chat", chatRouter);
app.use("/api/meeting", meetingRouter);
app.use("/api/memory", memoryRouter);
app.use("/api/summon", summonRouter);

// Start server
server.listen(env.PORT, () => {
  console.log(`Backend listening on port ${env.PORT}`);
});
