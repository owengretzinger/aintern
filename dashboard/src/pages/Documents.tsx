import React, { useState, useEffect } from "react";
import "./css/Documents.css";

interface Document {
  id: string;
  content: string;
  created_at: string;
}

const Documents: React.FC = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/memory");
      if (!response.ok) throw new Error("Failed to fetch documents");
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch documents",
      );
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch("http://localhost:3001/api/memory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error("Failed to upload document");

      setContent("");
      fetchDocuments();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to upload document",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/memory/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete document");
      fetchDocuments();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to delete document",
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      year:
        date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
    });
  };

  return (
    <section className="documents">
      <div className="documents-container">
        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter document content here..."
            disabled={loading}
          />
          <button
            type="submit"
            className="submit-button"
            disabled={loading || !content.trim()}
          >
            Add Document
          </button>
          {error && <p className="error active">{error}</p>}
          {loading && <p className="active">Uploading document...</p>}
        </form>

        <div className="documents-list">
          {documents.length === 0 ? (
            <p className="no-documents">No documents yet. Add one above!</p>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="document-card">
                <div className="document-header">
                  <span className="document-date">
                    {formatDate(doc.created_at)}
                  </span>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="delete-button"
                  >
                    &times;
                  </button>
                </div>
                <div className="document-content">
                  <p>{doc.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Documents;
