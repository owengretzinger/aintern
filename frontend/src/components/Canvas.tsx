import { Canvas as R3FCanvas } from "@react-three/fiber";
import * as THREE from "three";
import { SVGRenderer } from "three/addons/renderers/SVGRenderer.js"; // Correct import for SVGRenderer

const Canvas = ({ children, ...props }: any) => {
  // Custom function to create SVGRenderer instead of WebGLRenderer
  const createRenderer = (gl: any) => {
    const renderer = new SVGRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Optionally, set clear color, etc.
    // renderer.setClearColor(0xeeeeee);
    return renderer;
  };

  return (
    <R3FCanvas
      {...props}
      onCreated={({ gl } :any) => {
        // Use SVGRenderer here
        const renderer = createRenderer(gl);
        gl.domElement = renderer.domElement; // Assign the SVGRenderer's domElement
      }}
    >
      {children}
    </R3FCanvas>
  );
};

export default Canvas;
