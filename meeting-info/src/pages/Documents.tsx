import React, { useState, useEffect } from "react";

interface Document {
  id: string;
  content: string;
  metadata: Record<string, string | number | boolean | null>;
  created_at: string;
}

const Documents: React.FC = () => {
  const [content, setContent] = useState("");
  const [metadata, setMetadata] = useState("");
  const [message, setMessage] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/memory");
      if (!response.ok) throw new Error("Failed to fetch documents");
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setMessage(
        error instanceof Error ? error.message : "Failed to fetch documents"
      );
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3001/api/memory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          metadata: metadata ? JSON.parse(metadata) : undefined,
        }),
      });

      if (!response.ok) throw new Error("Upload failed");

      setMessage("Document uploaded successfully!");
      setContent("");
      setMetadata("");
      fetchDocuments(); // Refresh the list
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to upload document"
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/memory/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Delete failed");

      setMessage("Document deleted successfully!");
      fetchDocuments(); // Refresh the list
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to delete document"
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container">
      <h1>Upload Documents</h1>
      <p>
        Add documents to enhance AI responses with additional context and
        knowledge.
      </p>

      {message && (
        <div
          className={`message ${
            message.includes("failed") ? "error" : "success"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="content">Document Content:</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            placeholder="Enter the document content here..."
            rows={6}
          />
        </div>

        <div className="form-group">
          <label htmlFor="metadata">
            Metadata (optional, JSON format):
            <span className="hint">
              e.g., {"{"}type: "meeting", date: "2024-01-26"{"}"}
            </span>
          </label>
          <textarea
            id="metadata"
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            placeholder='{"key": "value"}'
            rows={3}
          />
        </div>

        <button type="submit">Upload Document</button>
      </form>

      <div className="documents-list">
        <h2>Uploaded Documents</h2>
        {documents.length === 0 ? (
          <p>No documents uploaded yet.</p>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="document-item">
              <div className="document-content">
                <pre>{doc.content}</pre>
                {doc.metadata && Object.keys(doc.metadata).length > 0 && (
                  <div className="document-metadata">
                    <strong>Metadata:</strong>
                    <pre>{JSON.stringify(doc.metadata, null, 2)}</pre>
                  </div>
                )}
                <div className="document-date">
                  Added: {formatDate(doc.created_at)}
                </div>
              </div>
              <button
                onClick={() => handleDelete(doc.id)}
                className="delete-button"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      <style>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: bold;
        }

        .hint {
          display: block;
          font-size: 0.8rem;
          color: #666;
          font-weight: normal;
        }

        textarea {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-family: inherit;
        }

        button {
          background-color: #007bff;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        button:hover {
          background-color: #0056b3;
        }

        .message {
          padding: 1rem;
          margin-bottom: 1rem;
          border-radius: 4px;
        }

        .success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .documents-list {
          margin-top: 3rem;
        }

        .document-item {
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 1rem;
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          background-color: #f8f9fa;
        }

        .document-content {
          flex: 1;
          margin-right: 1rem;
        }

        .document-content pre {
          white-space: pre-wrap;
          word-wrap: break-word;
          margin: 0;
          font-family: inherit;
        }

        .document-metadata {
          margin-top: 0.5rem;
          font-size: 0.9rem;
        }

        .document-date {
          margin-top: 0.5rem;
          color: #666;
          font-size: 0.8rem;
        }

        .delete-button {
          background-color: #dc3545;
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
        }

        .delete-button:hover {
          background-color: #c82333;
        }
      `}</style>
    </div>
  );
};

export default Documents;
