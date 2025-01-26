import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import OpenAI from "openai";
import { chatRouter } from "./routers/chat";
import { meetingRouter } from "./routers/meeting";

import { summonRouter } from "./routers/summon";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
app.use(express.json());

// Configure CORS with proper options
app.use(
  cors({
    origin: [
      "https://aintern.vercel.app", // Production
      "https://aintern-six.vercel.app", // Alternative production URL
      "http://localhost:5173", // Local development
      "https://easy-walrus-dominant.ngrok-free.app", // Specific ngrok tunnel"
      "https://d525-209-29-99-157.ngrok-free.app",
      "https://full-liked-ray.ngrok-free.app",
      "https://591b-209-29-99-157.ngrok-free.app",
      /^https:\/\/.*\.ngrok-free\.app$/, // Any ngrok-free.app subdomain
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;

// Add test route
app.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Backend is running!",
    timestamp: new Date().toISOString(),
  });
});

// Add transcript endpoint
app.post("/api/transcript", async (req: Request, res: Response) => {
  try {
    const transcriptData = req.body;

    console.log("Transcript data received:", transcriptData);

    // Broadcast transcript to all connected WebSocket clients
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(transcriptData));
      }
    });

    // Handle wake word detection
    if (transcriptData.transcript) {
      const transcriptText =
        transcriptData.transcript.words
          ?.map((w: { text: string }) => w.text)
          .join(" ") || "";
      console.log("Transcript text:", transcriptText);

      if (transcriptText.toLowerCase().includes("alexa")) {
        console.log("Wake word detected");
        console.log("Sending request to chat endpoint", transcriptText);
        
        try {
          // Use chat endpoint directly
          const response = await fetch(
            `http://localhost:${port}/api/chat/chat`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                message: transcriptText,
                sessionId: "default",
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`Chat request failed: ${response.statusText}`);
          }

          const chatResponse = await response.json();
          console.log("Chat response:", chatResponse);

          if (chatResponse.messages && Array.isArray(chatResponse.messages)) {
            // Broadcast AI response to all connected clients
            clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(
                  JSON.stringify({
                    type: "ai_response",
                    messages: chatResponse.messages,
                  })
                );
              }
            });
            console.log("AI response sent to clients");
          } else {
            console.error("Invalid chat response format:", chatResponse);
          }
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

app.use("/api/summon", summonRouter);

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Store connected clients
const clients = new Set<WebSocket>();

// WebSocket connection handler
wss.on("connection", (ws: WebSocket) => {
  clients.add(ws);
  console.log("Client connected");

  ws.on("close", () => {
    clients.delete(ws);
    console.log("Client disconnected");
  });
});

console.log(
  `WebSocket server running on ws://${
    process.env.VITE_RAILWAY_STATIC_URL || "localhost"
  }:${port}`
);

// Change the listen call to use the http server
server.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
  console.log(`WebSocket server attached to same port ${port}`);
});
