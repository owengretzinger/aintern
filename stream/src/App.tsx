import { useEffect, useRef, useState } from 'react';

function App() {
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const socket = useRef<WebSocket | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [connectionState, setConnectionState] = useState<string>('Disconnected');
  const [wsState, setWsState] = useState<string>('Connecting...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize WebSocket connection
    const serverUrl = process.env.RAILWAY_STATIC_URL ? `wss://${process.env.RAILWAY_STATIC_URL}` : 'ws://localhost:8080';
    socket.current = new WebSocket(serverUrl);

    // Initialize WebRTC peer connection
    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    const pc = peerConnection.current;
    const ws = socket.current;

    // Handle incoming tracks
    pc.ontrack = (event) => {
      console.log('Received remote track', event.streams[0]);
      if (videoRef.current && videoRef.current.srcObject !== event.streams[0]) {
        videoRef.current.srcObject = event.streams[0];
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          videoRef.current?.play()
            .then(() => setIsLoading(false))
            .catch(e => console.error('Error playing video:', e));
        };
      }
    };

    // Handle WebSocket messages
    ws.onmessage = async (message) => {
      try {
        const text = await message.data.text();
        const data = JSON.parse(text);

        if (data.offer) {
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          ws.send(JSON.stringify({ answer: pc.localDescription }));
        } else if (data.candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch (e) {
            console.error('Error adding ICE candidate:', e);
          }
        }
      } catch (e) {
        console.error('Error handling WebSocket message:', e);
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        ws.send(JSON.stringify({ candidate: event.candidate }));
      }
    };

    // Log connection state changes
    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      setConnectionState(pc.connectionState);
    };

    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
    };

    // WebSocket state handlers
    ws.onopen = () => {
      console.log('WebSocket connected');
      setWsState('Connected');
    };

    ws.onclose = () => {
      setWsState('Disconnected');
    };

    ws.onerror = () => {
      setWsState('Error');
    };

    // Cleanup
    return () => {
      ws.close();
      pc.close();
    };
  }, []);

  return (
    <div className="relative w-screen h-screen bg-black">
      {isLoading && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xl z-10">
          Connecting to stream...
        </div>
      )}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        autoPlay
        muted
      />
      <div className="fixed bottom-4 right-4 bg-black/50 text-white p-4 rounded-lg space-y-2">
        <div>WebSocket: {wsState}</div>
        <div>WebRTC: {connectionState}</div>
      </div>
    </div>
  );
}

export default App;
