import React, { useState, useEffect } from "react";
import "./css/Dashboard.css";

interface TranscriptWord {
  text: string;
  start_timestamp: number;
  end_timestamp: number;
  confidence: number;
}

interface TranscriptSegment {
  speaker: string;
  speaker_id: number;
  language: string;
  words: TranscriptWord[];
}

interface Meeting {
  id: string;
  bot_id: string;
  status: "in_meeting" | "completed" | "error";
  transcript: TranscriptSegment[];
  summary: string;
  created_at: string;
  updated_at: string;
}

interface MeetingModalProps {
  meeting: Meeting;
  onClose: () => void;
}

const MeetingModal: React.FC<MeetingModalProps> = ({ meeting, onClose }) => {
  const combinedTranscript = meeting.transcript?.reduce<
    { speaker: string; text: string }[]
  >((acc, entry) => {
    const text = entry.words.map((w) => w.text).join(" ");
    if (acc.length > 0 && acc[acc.length - 1].speaker === entry.speaker) {
      acc[acc.length - 1].text += " " + text;
    } else {
      acc.push({ speaker: entry.speaker, text });
    }
    return acc;
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2>Meeting Details</h2>
        <div className="modal-info">
          <p>
            <strong>Meeting ID:</strong> {meeting.bot_id}
          </p>
          <p>
            <strong>Status:</strong> {meeting.status}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(meeting.created_at).toLocaleString()}
          </p>
        </div>
        {meeting.status === "completed" && (
          <>
            <div className="modal-summary">
              <h3>Summary</h3>
              <p>{meeting.summary}</p>
            </div>
            {combinedTranscript && (
              <div className="modal-transcript">
                <h3>Transcript</h3>
                <div className="transcript-entries">
                  {combinedTranscript.map((entry, index) => (
                    <div key={index} className="transcript-entry">
                      <strong>{entry.speaker}:</strong> {entry.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:3001/api/summon/meetings",
        );
        if (!response.ok) throw new Error("Failed to fetch meetings");
        const data = await response.json();
        setMeetings(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch meetings",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
    const interval = setInterval(fetchMeetings, 30000);
    return () => clearInterval(interval);
  }, []);

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

  const formatMeetingId = (id: string) => {
    return id.split("-")[0];
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <h1>Loading meetings...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <h1>Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="meetings-grid">
        {meetings.length === 0 ? (
          <p className="no-meetings">
            No meetings found. Start a meeting to see it here!
          </p>
        ) : (
          meetings.map((meeting) => (
            <div
              key={meeting.id}
              className={`meeting-card ${meeting.status}`}
              onClick={() => setSelectedMeeting(meeting)}
            >
              <div className="meeting-card-header">
                <h3>Meeting {formatMeetingId(meeting.id)}</h3>
                <span className="meeting-date">
                  {formatDate(meeting.created_at)}
                </span>
              </div>
              <div className="meeting-card-content">
                <div className="status-badge">{meeting.status}</div>
                {meeting.status === "completed" && meeting.summary && (
                  <p className="meeting-summary">
                    {meeting.summary.length > 150
                      ? `${meeting.summary.substring(0, 150)}...`
                      : meeting.summary}
                  </p>
                )}
                {meeting.status === "in_meeting" && (
                  <p className="meeting-status">Meeting in progress...</p>
                )}
                {meeting.status === "error" && (
                  <p className="meeting-status error">An error occurred</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      {selectedMeeting && (
        <MeetingModal
          meeting={selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
