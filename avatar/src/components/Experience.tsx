import { CameraControls, ContactShadows, Environment } from "@react-three/drei";
import { useRef, useEffect } from "react";
import { Avatar } from "./Avatar";

export const Experience = () => {
  const cameraControls = useRef<CameraControls>(null);

  useEffect(() => {
    cameraControls.current?.setLookAt(0, 2.2, 5, 0, 1.0, 0);
  }, []);

  return (
    <>
      <CameraControls ref={cameraControls} />
      <Environment preset="sunset" />
      <Avatar />
      <ContactShadows opacity={0.7} />
    </>
  );
};
