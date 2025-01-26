import React, { useEffect, useState } from 'react';
import AgoraRTC, { createClient } from 'agora-rtc-sdk-ng';
import { VideoPlayer } from './VideoPlayer';

const APP_ID = 'fd724da3607e4f568c1775a94077234d';
const TOKEN =
  '007eJxTYNg3V7bdbWnmt1//RJ51yXc2z67fEHiSW+X/lYYDa5+U7X2mwJCWYm5kkpJobGZgnmqSZmpmkWxobm6aaGliYG5uZGyS8nPq1PSGQEaG/R7zmBkZIBDEZ2HITczMY2AAAEV4IsI=';
const CHANNEL = 'main';

AgoraRTC.setLogLevel(4);

let agoraCommandQueue = Promise.resolve();

const createAgoraClient = ({
  onVideoTrack,
  onUserDisconnected,
}) => {
  const client = createClient({
    mode: 'rtc',
    codec: 'vp8',
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
    await waitForConnectionState('DISCONNECTED');

    const uid = await client.join(
      APP_ID,
      CHANNEL,
      TOKEN,
      null
    );

    client.on('user-published', (user, mediaType) => {
      client.subscribe(user, mediaType).then(() => {
        if (mediaType === 'video') {
          onVideoTrack(user);
        }
      });
    });

    client.on('user-left', (user) => {
      onUserDisconnected(user);
    });

    if (viewOnly){
      tracks = await AgoraRTC.createMicrophoneAndCameraTracks()
    } else {
      // Create a screen track instead of microphone and camera
      tracks = await AgoraRTC.createScreenVideoTrack({
        audio: true, // optional, set to false if you don't need audio from the screen
        video: true, // required to share the screen video
      }, 'enable');
    }

    await client.publish(tracks);

    return {
      tracks,
      uid,
    };
  };

  const disconnect = async () => {
    await waitForConnectionState('CONNECTED');
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
      const viewOnly = queryParams.get('viewOnly') === 'true';

      console.log('viewOnly:', viewOnly)
      const { tracks, uid } = await connect(viewOnly);
      setUid(uid);
      setUsers((previousUsers) => [
        ...previousUsers,
        {
          uid,
          audioTrack: tracks[0], // optional audio track
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
    <>
      {uid}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 200px)',
          }}
        > */}
          {users.map((user, i) => (
            <VideoPlayer key={user.uid} user={user} z = {i} localUID = {uid}/>
          ))}
        {/* </div> */}
      </div>
    </>
  );
};
