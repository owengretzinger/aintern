import express from "express";
import { z } from "zod";
import { KnowledgeService } from "../services/documents.js";

const router = express.Router();
const knowledgeService = new KnowledgeService();

router.get("/", async (_req, res) => {
  try {
    const documents = await knowledgeService.getAllDocuments();
    res.json(documents);
  } catch (error: any) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const schema = z.object({
      content: z.string(),
      metadata: z.record(z.any()).optional(),
    });

    const { content, metadata } = schema.parse(req.body);
    const document = await knowledgeService.addDocument(content, metadata);
    res.json(document);
  } catch (error: any) {
    console.error("Error uploading memory:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const schema = z.object({
      id: z.string(),
    });

    const { id } = schema.parse(req.params);
    await knowledgeService.deleteDocument(id);
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting memory:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

export const memoryRouter = router;
