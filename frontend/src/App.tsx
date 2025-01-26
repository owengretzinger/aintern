import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
// import { StreamSetup } from "./components/StreamSetup";
import { useRef, useEffect } from "react";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio();

    // Connect to backend WebSocket
    wsRef.current = new WebSocket(
      `wss://${import.meta.env.VITE_BACKEND_WS_URL || "ws://localhost:3000"}`
    );

    wsRef.current.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "ai_response" && data.messages) {
          // Play each message in sequence
          for (const message of data.messages) {
            // Convert base64 audio to blob URL
            const audioBlob = await fetch(
              `data:audio/mp3;base64,${message.audio}`
            ).then((r) => r.blob());
            const audioUrl = URL.createObjectURL(audioBlob);

            // Play audio and animate avatar
            audioRef.current!.src = audioUrl;
            await audioRef.current!.play();

            // TODO: Use message.lipsync data to animate the avatar
            // TODO: Use message.facialExpression and message.animation for avatar animation
          }
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };

    return () => {
      wsRef.current?.close();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <Loader />
      <Leva hidden />
      <UI />
      <Canvas ref={canvasRef} shadows camera={{ position: [0, 0, 1], fov: 30 }}>
        <Experience />
      </Canvas>
      {/* <StreamSetup canvasRef={canvasRef} /> */}
    </>
  );
}

export default App;
