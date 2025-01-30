import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Experience } from "./components/Experience";
import { useRef, useEffect } from "react";
import { useChat } from "./hooks/useChat";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { setMessage } = useChat();

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio();

    // Connect to backend WebSocket
    wsRef.current = new WebSocket(
      `wss://${import.meta.env.VITE_BACKEND_WS_URL}`,
    );
    console.log(
      "Attempting WebSocket connection to:",
      import.meta.env.VITE_BACKEND_WS_URL,
    );

    wsRef.current.onopen = () => {
      console.log("WebSocket connection established successfully");
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket connection error:", error);
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    wsRef.current.onmessage = async (event) => {
      console.log("Received WebSocket message:", event.data);
      try {
        const data = JSON.parse(event.data);
        console.log("Parsed WebSocket data:", data);

        if (data.type === "ai_response" && data.messages) {
          console.log(
            `Processing ${data.messages.length} AI response messages:`,
            data.messages,
          );
          // Process each message in sequence
          for (const [index, message] of data.messages.entries()) {
            console.log(
              `Processing message ${index + 1}/${data.messages.length}:`,
              message,
            );

            try {
              // Create and prepare audio before setting message state
              if (!message.audio) {
                console.warn("Message has no audio data:", message);
                continue;
              }
              const audioBlob = await fetch(
                `data:audio/mp3;base64,${message.audio}`,
              ).then((r) => r.blob());
              const audioUrl = URL.createObjectURL(audioBlob);
              console.log(`Created blob URL for audio: ${audioUrl}`);

              audioRef.current!.src = audioUrl;

              // Set up audio event handlers before setting message state
              const audioPlayPromise = new Promise<void>((resolve, reject) => {
                if (audioRef.current) {
                  audioRef.current.onended = () => {
                    console.log("Audio playback ended");
                    resolve();
                  };
                  audioRef.current.onerror = (e) => {
                    console.error("Audio playback error:", e);
                    reject(e);
                  };
                }
              });

              // Now set the message state and start playing
              setMessage(message);
              console.log("Starting audio playback");
              await audioRef.current!.play();
              console.log("Audio playback started successfully");

              // Wait for audio to finish
              await audioPlayPromise;

              // Clean up
              URL.revokeObjectURL(audioUrl);
            } catch (error) {
              console.error("Error processing message:", error);
              // Reset message state if there was an error
              setMessage(null);
            }
          }
          // Reset message state after all messages are processed
          setMessage(null);
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };

    return () => {
      console.log("Cleaning up WebSocket and audio connections");
      wsRef.current?.close();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [setMessage]);

  return (
    <>
      <Loader />
      <Leva hidden />
      <Canvas ref={canvasRef} shadows camera={{ position: [0, 0, 1], fov: 30 }}>
        <Experience />
      </Canvas>
    </>
  );
}

export default App;
