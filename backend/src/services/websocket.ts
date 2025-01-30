import { WebSocket, WebSocketServer } from "ws";
import { Server } from "http";
import { Message } from "../types/shared.js";

class WebSocketService {
  private wss: WebSocketServer;
  private clients: Set<WebSocket>;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.clients = new Set();
    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.wss.on("connection", (ws: WebSocket) => {
      this.clients.add(ws);
      console.log("Client connected");

      ws.on("close", () => {
        this.clients.delete(ws);
        console.log("Client disconnected");
      });
    });
  }

  public broadcastTranscript(transcriptData: any) {
    this.broadcast(transcriptData);
  }

  public broadcastAIResponse(messages: Message[]) {
    this.broadcast({
      type: "ai_response",
      messages,
    });
  }

  private broadcast(data: any) {
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
}

export default WebSocketService;
