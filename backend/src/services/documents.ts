import { createClient } from "@supabase/supabase-js";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { env } from "../config/env.js";

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: env.OPENAI_API_KEY,
});

export class KnowledgeService {
  async getAllDocuments() {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching documents:", error);
      throw error;
    }
  }

  async addDocument(content: string, metadata: Record<string, any> = {}) {
    try {
      // Generate embeddings for the content
      const [embedding] = await embeddings.embedDocuments([content]);

      // Store document and its embedding
      const { data, error } = await supabase
        .from("documents")
        .insert([
          {
            content,
            embedding,
            metadata,
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error("Error adding document:", error);
      throw error;
    }
  }

  async searchSimilarDocuments(query: string, limit: number = 5) {
    try {
      // Generate embedding for the query
      const [embedding] = await embeddings.embedDocuments([query]);

      // Search for similar documents
      const { data, error } = await supabase
        .rpc("match_documents", {
          query_embedding: embedding,
          match_threshold: 0.7,
          match_count: limit,
        })
        .select("content, metadata, similarity");

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error searching documents:", error);
      throw error;
    }
  }

  async deleteDocument(id: string) {
    const { error } = await supabase.from("documents").delete().eq("id", id);

    if (error) throw error;
  }
}
