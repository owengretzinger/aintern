import { useRef, useEffect } from "react";
import { useTranscriptWebSocket } from "../hooks/useTranscriptWebSocket";

// Styles objects for better organization and reusability
const styles = {
  container: {
    position: "fixed",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    zIndex: 10,
  },
  transcriptBox: {
    width: "100%",
    maxWidth: "42rem",
    maxHeight: "40vh",
    overflowY: "auto",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: "8px",
    padding: "1.5rem",
    marginBottom: "1rem",
    color: "white",
  },
  messageContainer: {
    display: "flex",
    flexDirection: "column-reverse",
    gap: "1rem",
  },
  message: {
    display: "flex",
    gap: "1rem",
  },
  speaker: {
    width: "6rem",
    textAlign: "right",
  },
  text: {
    flex: 1,
  },
  placeholder: {
    textAlign: "center",
    fontSize: "1.25rem",
    padding: "1rem",
    fontWeight: "bold",
  },
};

// Separate component for individual utterance
const UtteranceMessage = ({ utterance, isNewSpeaker }) => (
  <div style={styles.message}>
    <div
      style={{
        ...styles.speaker,
        fontWeight: isNewSpeaker ? "bold" : "normal",
        visibility: isNewSpeaker ? "visible" : "hidden",
      }}
    >
      {isNewSpeaker && utterance.speaker ? utterance.speaker : ""}
    </div>
    <div
      style={{
        ...styles.text,
        opacity: utterance.isFinal ? 1 : 0.6,
      }}
    >
      {utterance.text}
    </div>
  </div>
);

export const Transcript = ({ isViewOnly }) => {
  const { utterances } = useTranscriptWebSocket(isViewOnly);
  const containerRef = useRef(null);

  // Auto-scroll to bottom when new utterances are added
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo(0, containerRef.current.scrollHeight);
    }
  }, [utterances]);

  return (
    <div style={styles.container}>
      <div ref={containerRef} style={styles.transcriptBox}>
        {utterances.length >= 1 ? (
          <div style={styles.messageContainer}>
            {utterances.map((utterance, index) => {
              const isNewSpeaker =
                index === 0 ||
                utterances[index - 1].speaker !== utterance.speaker;
              return (
                <UtteranceMessage
                  key={index}
                  utterance={utterance}
                  isNewSpeaker={isNewSpeaker}
                />
              );
            })}
          </div>
        ) : isViewOnly ? (
          <div style={styles.placeholder}>
            Start speaking to see transcription in real-time.
          </div>
        ) : (
          <div style={styles.placeholder}>
            Transcription only available in view-only mode.
          </div>
        )}
      </div>
    </div>
  );
};
