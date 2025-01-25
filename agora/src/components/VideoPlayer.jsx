import React, { useEffect, useRef } from 'react';

export const VideoPlayer = ({ user , z}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (user.videoTrack) {
      user.videoTrack.play(videoRef.current);
    }

    return () => {
      if (user.videoTrack) {
        user.videoTrack.stop();
      }
    };
  }, [user]);

  return (
    <div>
      <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover', position:'absolute', left: 0, top: 0, zIndex: -z}} autoPlay playsInline />
    </div>
  );
};
