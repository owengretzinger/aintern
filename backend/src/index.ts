import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { chatRouter } from "./routers/chat.js";
import { meetingRouter } from "./routers/meeting.js";
import { router } from "./trpc.js";
dotenv.config();

const app = express();
app.use(express.json());

// Configure CORS with proper options
app.use(
  cors({
    origin: [
      "https://aintern.vercel.app", // Production
      "https://aintern-six.vercel.app", // Alternative production URL
      "http://localhost:5173", // Local development
      "https://easy-walrus-dominant.ngrok-free.app", // Specific ngrok tunnel
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

const appRouter = router({
  chat: chatRouter,
  meeting: meetingRouter,
});

export type AppRouter = typeof appRouter;

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
  })
);

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
