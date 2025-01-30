import { useEffect, useRef } from "react";

export const useTranscriptWebSocket = (viewOnly = false) => {
  const RECONNECT_RETRY_INTERVAL_MS = 3000;
  const wsRef = useRef(null);
  const retryIntervalRef = useRef(null);

  const connectWebSocket = () => {
    if (!viewOnly || wsRef.current) return;

    console.log("Attempting to connect to transcript WebSocket...");
    wsRef.current = new WebSocket(
      "wss://meeting-data.bot.recall.ai/api/v1/transcript",
    );

    wsRef.current.onopen = () => {
      console.log("Connected to transcript WebSocket server");
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current);
        retryIntervalRef.current = null;
      }
    };

    wsRef.current.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("Received message from transcript WebSocket:", {
          messageType: message.type,
          hasTranscript: !!message.transcript,
          transcript: message.transcript,
        });

        // Forward transcript to backend via POST request
        try {
          console.log("Attempting to forward transcript to backend...", {
            url: `${import.meta.env.VITE_BACKEND_URL}/api/transcript`,
            message,
          });

          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/transcript`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                event: "bot.transcription",
                data: {
                  transcript: message,
                },
              }),
            },
          );

          const responseText = await response.text();
          console.log("Backend response:", {
            status: response.status,
            statusText: response.statusText,
            body: responseText,
          });

          if (!response.ok) {
            console.warn(
              "Failed to forward transcript to backend:",
              response.status,
              responseText,
            );
          } else {
            console.log("Successfully forwarded transcript to backend");
          }
        } catch (error) {
          console.error("Error forwarding transcript to backend:", {
            error,
            message: error.message,
            stack: error.stack,
          });
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

  // const attemptReconnect = () => {
  //   if (!retryIntervalRef.current && viewOnly) {
  //     retryIntervalRef.current = window.setInterval(() => {
  //       console.log("Attempting to reconnect to WebSocket...");
  //       connectWebSocket();
  //     }, RECONNECT_RETRY_INTERVAL_MS);
  //   }
  // };

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
};
