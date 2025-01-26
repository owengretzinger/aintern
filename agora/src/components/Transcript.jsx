import { useRef, useEffect } from "react";
import { useTranscriptWebSocket } from "../hooks/useTranscriptWebSocket";

export const Transcript = ({ viewOnly }) => {
  const { utterances } = useTranscriptWebSocket(viewOnly);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo(0, containerRef.current.scrollHeight);
    }
  }, [utterances]);

  let lastSpeaker = null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        zIndex: 10,
      }}
    >
      <div
        ref={containerRef}
        style={{
          width: "100%",
          maxWidth: "42rem",
          maxHeight: "40vh",
          overflowY: "auto",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          borderRadius: "8px",
          padding: "1.5rem",
          marginBottom: "1rem",
          color: "white",
        }}
      >
        {!utterances.length ? (
          <div
            style={{
              textAlign: "center",
              fontSize: "1.25rem",
              padding: "1rem",
              fontWeight: "bold",
            }}
          >
            {viewOnly
              ? "Start speaking to see transcription in real-time."
              : "Transcription only available in view-only mode."}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column-reverse",
              gap: "1rem",
            }}
          >
            {utterances.map((item, index) => {
              const isNewSpeaker = item.speaker !== lastSpeaker;
              lastSpeaker = item.speaker;

              return (
                <div key={index} style={{ display: "flex", gap: "1rem" }}>
                  <div
                    style={{
                      width: "6rem",
                      textAlign: "right",
                      fontWeight: isNewSpeaker ? "bold" : "normal",
                      visibility: isNewSpeaker ? "visible" : "hidden",
                    }}
                  >
                    {isNewSpeaker && item.speaker ? item.speaker : ""}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      opacity: item.isFinal ? 1 : 0.6,
                    }}
                  >
                    {item.text}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
