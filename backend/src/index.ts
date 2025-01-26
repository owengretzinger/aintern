import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import WebSocket from "ws";
import http from "http";
import OpenAI from "openai";
import { chatRouter } from "./routers/chat";
import { meetingRouter } from "./routers/meeting";
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
      /^https:\/\/.*\.ngrok-free\.app$/, // Any ngrok-free.app subdomain
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Add test route
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "Backend is running!",
    timestamp: new Date().toISOString(),
  });
});

// Mount routers
app.use("/api/chat", chatRouter);
app.use("/api/meeting", meetingRouter);

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Set<WebSocket>();

// WebSocket connection handler
wss.on("connection", (ws) => {
  clients.add(ws);

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message.toString());

      // If this is a transcript message
      if (data.transcript) {
        const transcriptText =
          data.transcript.words?.map((w: any) => w.text).join(" ") || "";

        // Check for wake word
        if (transcriptText.toLowerCase().includes("alexa")) {
          // Use chat endpoint directly
          const response = await fetch("http://localhost:" + port + "/api/chat/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: transcriptText,
              sessionId: "default",
            }),
          });
          
          const chatResponse = await response.json();

          // Broadcast response to all connected clients
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
        }
      }
    } catch (error) {
      console.error("Error processing WebSocket message:", error);
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
  });
});

console.log(
  `WebSocket server running on ws://${
    process.env.VITE_RAILWAY_STATIC_URL || "localhost"
  }:8080`
);

// Change the listen call to use the http server
server.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
  console.log(`WebSocket server attached to same port ${port}`);
});
