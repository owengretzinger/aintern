import React, { useEffect, useState } from "react";
import "./css/Dashboard.css";

interface Transcript {
  id: string;
  bot_id: string;
  transcript: {
    words?: Array<{
      text: string;
      start: number;
      end: number;
      confidence: number;
      speaker?: string;
    }>;
    paragraphs?: Array<{
      text: string;
      start: number;
      end: number;
      speaker?: string;
    }>;
  };
  summary: string;
  created_at: string;
  updated_at: string;
}

interface AnalysisJob {
  id: string;
  status: string;
  bot_id: string;
}

const Dashboard: React.FC = () => {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisJobs, setAnalysisJobs] = useState<Record<string, AnalysisJob>>({});

  useEffect(() => {
    const fetchTranscripts = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/api/recall/transcripts"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch transcripts");
        }
        const data = await response.json();
        setTranscripts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTranscripts();
  }, []);

  const startAnalysis = async (botId: string) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/recall/analyze/${botId}`,
        {
          method: "POST",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to start analysis");
      }
      const data = await response.json();
      setAnalysisJobs((prev) => ({
        ...prev,
        [botId]: { id: data.job_id, status: "in_progress", bot_id: botId },
      }));

      // Start polling for job status
      pollJobStatus(data.job_id, botId);
    } catch (err) {
      console.error("Error starting analysis:", err);
    }
  };

  const pollJobStatus = async (jobId: string, botId: string) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/recall/analyze/job/${jobId}`
      );
      if (!response.ok) {
        throw new Error("Failed to get job status");
      }
      const data = await response.json();

      setAnalysisJobs((prev) => ({
        ...prev,
        [botId]: { ...prev[botId], status: data.status },
      }));

      // If job is not done, poll again in 5 seconds
      if (data.status === "in_progress") {
        setTimeout(() => pollJobStatus(jobId, botId), 5000);
      } else if (data.status === "done") {
        // Refresh transcripts to get the new summary
        const transcriptsResponse = await fetch(
          "http://localhost:3001/api/recall/transcripts"
        );
        if (transcriptsResponse.ok) {
          const newTranscripts = await transcriptsResponse.json();
          setTranscripts(newTranscripts);
        }
      }
    } catch (err) {
      console.error("Error polling job status:", err);
    }
  };

  if (loading) {
    return <div className="dashboard-container">Loading...</div>;
  }

  if (error) {
    return <div className="dashboard-container">Error: {error}</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Meeting Transcripts</h1>
      <div className="transcripts-list">
        {transcripts.map((transcript) => (
          <div key={transcript.id} className="transcript-card">
            <div className="transcript-header">
              <h3>Meeting {transcript.bot_id}</h3>
              <span className="transcript-date">
                {new Date(transcript.created_at).toLocaleString()}
              </span>
            </div>
            <div className="transcript-summary">
              <h4>Summary</h4>
              {transcript.summary ? (
                <p>{transcript.summary}</p>
              ) : (
                <div className="summary-actions">
                  <p>No summary available.</p>
                  {analysisJobs[transcript.bot_id]?.status === "in_progress" ? (
                    <span className="analysis-status">Analysis in progress...</span>
                  ) : (
                    <button
                      onClick={() => startAnalysis(transcript.bot_id)}
                      className="analyze-button"
                    >
                      Generate Summary
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="transcript-content">
              <h4>Transcript</h4>
              <pre>{JSON.stringify(transcript.transcript, null, 2)}</pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
