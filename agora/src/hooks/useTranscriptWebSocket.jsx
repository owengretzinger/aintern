import { useEffect, useMemo, useRef, useState } from "react";

/**
 * @typedef {Object} Word
 * @property {string} text
 * @property {number} start_time
 * @property {number} end_time
 */

/**
 * @typedef {Object} Transcript
 * @property {string|null} speaker
 * @property {string|null} speaker_id
 * @property {string} [transcription_provider_speaker]
 * @property {string|null} language
 * @property {number} original_transcript_id
 * @property {Word[]} words
 * @property {boolean} is_final
 */

/**
 * @typedef {Object} TranscriptMessage
 * @property {string} bot_id
 * @property {Transcript} transcript
 */

/**
 * @typedef {Object} Utterance
 * @property {string|null} speaker
 * @property {string} text
 * @property {boolean} isFinal
 */

export const useTranscriptWebSocket = (viewOnly = false) => {
  const RECONNECT_RETRY_INTERVAL_MS = 3000;
  const wsRef = useRef(null);
  const retryIntervalRef = useRef(null);

  const [finalizedUtterances, setFinalizedUtterances] = useState([]);
  const [currentUtterance, setCurrentUtterance] = useState(null);

  const connectWebSocket = () => {
    if (!viewOnly || wsRef.current) return;

    wsRef.current = new WebSocket(
      "wss://meeting-data.bot.recall.ai/api/v1/transcript"
    );

    wsRef.current.onopen = () => {
      console.log("Connected to WebSocket server");
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current);
        retryIntervalRef.current = null;
      }
    };

    wsRef.current.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        const transcript = message.transcript;
        const text = transcript.words.map((word) => word.text).join(" ");

        if (!transcript.is_final) {
          setCurrentUtterance({
            speaker: transcript.speaker,
            text,
            isFinal: false,
          });
        } else {
          setFinalizedUtterances((prev) => [
            ...prev,
            {
              speaker: transcript.speaker,
              text,
              isFinal: true,
            },
          ]);
          setCurrentUtterance(null);
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket closed. Attempting to reconnect...");
      wsRef.current = null;
      if (viewOnly) {
        attemptReconnect();
      }
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      wsRef.current?.close();
    };
  };

  const attemptReconnect = () => {
    if (!retryIntervalRef.current && viewOnly) {
      retryIntervalRef.current = window.setInterval(() => {
        console.log("Attempting to reconnect to WebSocket...");
        connectWebSocket();
      }, RECONNECT_RETRY_INTERVAL_MS);
    }
  };

  useEffect(() => {
    if (viewOnly) {
      connectWebSocket();
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current);
      }
    };
  }, [viewOnly]);

  // Combine finalized and current utterances
  const utterances = useMemo(() => {
    if (currentUtterance) {
      return [...finalizedUtterances, currentUtterance];
    }
    return finalizedUtterances;
  }, [finalizedUtterances, currentUtterance]);

  return {
    utterances,
  };
};
