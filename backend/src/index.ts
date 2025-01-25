import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { chatRouter } from "./routers/chat";
import { router } from "./trpc";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;

// Add test route
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend is running!",
    timestamp: new Date().toISOString(),
  });
});

const appRouter = router({
  chat: chatRouter,
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
