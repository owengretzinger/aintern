import { Loader } from "@react-three/drei";
// import { Canvas } from "@react-three/fiber";
import Canvas from "./components/Canvas";
import { Leva } from "leva";
import { Experience } from "./components/Experience";
import { Avatar } from "./components/Avatar";
import { UI } from "./components/UI";

function App() {
  // Throttling function to limit the frame rate
  // let lastTime = 0;
  // const throttleFPS = (time: number) => {
  //   if (time - lastTime >= 1000 / 30) { // Cap to 30 FPS
  //     lastTime = time;
  //   }
  //   // Only call requestAnimationFrame for throttled updates
  //   requestAnimationFrame(throttleFPS);
  // };
  return (
    <>
      <Loader />
      <Leva hidden />
      <UI />
      <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
        <Experience />
        {/* <Avatar /> */}
      </Canvas>
    </>
  );
}

export default App;
