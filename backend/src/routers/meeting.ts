import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { createBot, getBotStatus, getBotTranscript } from "../services/recall";

export const meetingRouter = router({
  createBot: publicProcedure
    .input(
      z.object({
        meetingUrl: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { meetingUrl } = input;
      return await createBot(meetingUrl);
    }),

  getBotStatus: publicProcedure
    .input(
      z.object({
        botId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { botId } = input;
      return await getBotStatus(botId);
    }),

  getBotTranscript: publicProcedure
    .input(
      z.object({
        botId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { botId } = input;
      return await getBotTranscript(botId);
    }),
});
