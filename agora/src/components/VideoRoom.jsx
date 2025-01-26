import React, { useEffect, useState } from "react";
import AgoraRTC, { createClient } from "agora-rtc-sdk-ng";
import { VideoPlayer } from "./VideoPlayer";
import { Transcript } from "./Transcript";

const APP_ID = import.meta.env.VITE_AGORA_APP_ID;
const TOKEN = import.meta.env.VITE_AGORA_TOKEN;
const CHANNEL = "main";

AgoraRTC.setLogLevel(4);

let agoraCommandQueue = Promise.resolve();

const createAgoraClient = ({ onVideoTrack, onUserDisconnected }) => {
  const client = createClient({
    mode: "rtc",
    codec: "vp8",
  });

  let tracks;

  const waitForConnectionState = (connectionState) => {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (client.connectionState === connectionState) {
          clearInterval(interval);
          resolve();
        }
      }, 200);
    });
  };

  const connect = async (viewOnly) => {
    await waitForConnectionState("DISCONNECTED");

    const uid = await client.join(APP_ID, CHANNEL, TOKEN, null);

    client.on("user-published", (user, mediaType) => {
      client.subscribe(user, mediaType).then(() => {
        if (mediaType === "video") {
          onVideoTrack(user);
        }
      });
    });

    client.on("user-left", (user) => {
      onUserDisconnected(user);
    });

    if (viewOnly) {
      tracks = await AgoraRTC.createMicrophoneAndCameraTracks();
    } else {
      try {
        // Create screen video track first
        const screenTrack = await AgoraRTC.createScreenVideoTrack();
        // Create microphone track separately
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        tracks = [audioTrack, screenTrack];
      } catch (error) {
        console.error("Error creating screen share:", error);
        // Fallback to camera if screen share fails
        tracks = await AgoraRTC.createMicrophoneAndCameraTracks();
      }
    }

    await client.publish(tracks);

    return {
      tracks,
      uid,
    };
  };

  const disconnect = async () => {
    await waitForConnectionState("CONNECTED");
    client.removeAllListeners();
    for (let track of tracks) {
      track.stop();
      track.close();
    }
    await client.unpublish(tracks);
    await client.leave();
  };

  return {
    disconnect,
    connect,
  };
};

export const VideoRoom = () => {
  const [users, setUsers] = useState([]);
  const [uid, setUid] = useState(null);
  const [viewOnly, setViewOnly] = useState(false);

  useEffect(() => {
    const onVideoTrack = (user) => {
      setUsers((previousUsers) => [...previousUsers, user]);
    };

    const onUserDisconnected = (user) => {
      setUsers((previousUsers) =>
        previousUsers.filter((u) => u.uid !== user.uid)
      );
    };

    const { connect, disconnect } = createAgoraClient({
      onVideoTrack,
      onUserDisconnected,
    });

    const setup = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      const isViewOnly = queryParams.get("viewOnly") === "true";
      setViewOnly(isViewOnly);

      console.log("viewOnly:", isViewOnly);
      const { tracks, uid } = await connect(isViewOnly);
      setUid(uid);
      setUsers((previousUsers) => [
        ...previousUsers,
        {
          uid,
          audioTrack: tracks[0],
          videoTrack: tracks[1],
        },
      ]);
    };

    const cleanup = async () => {
      await disconnect();
      setUid(null);
      setUsers([]);
    };

    agoraCommandQueue = agoraCommandQueue.then(setup);

    return () => {
      agoraCommandQueue = agoraCommandQueue.then(cleanup);
    };
  }, []);

  return (
    <div className="relative">
      {uid}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 200px)',
          }}
        > */}
        {users.map((user, i) => (
          <VideoPlayer key={user.uid} user={user} z={i} localUID={uid} />
        ))}
        {/* </div> */}
      </div>
      <Transcript viewOnly={viewOnly} />
    </div>
  );
};
