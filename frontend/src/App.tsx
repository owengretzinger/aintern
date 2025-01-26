import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
// import { StreamSetup } from "./components/StreamSetup";
import { useRef } from "react";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
