import React, { useEffect, useRef } from 'react';

export const VideoPlayer = ({ user , z, localUID}) => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (user.videoTrack) {
      user.videoTrack.play(videoRef.current);
    }
    if (user.audioTrack && user.uid != localUID) {
      user.audioTrack.play(audioRef.current)
    }

    return () => {
      if (user.videoTrack) {
        user.videoTrack.stop();
      }
      if (user.audioTrack) {
        user.audioTrack.stop();
      }
    };
  }, [user]);

  return (
    <div>
      <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover', position:'absolute', left: 0, top: 0, zIndex: -z}} autoPlay playsInline />
      <audio ref={audioRef} autoPlay />
    </div>
  );
};
