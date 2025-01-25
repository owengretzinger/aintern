import { useEffect, useRef, useState } from 'react';

interface StreamSetupProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const StreamSetup = ({ canvasRef }: StreamSetupProps) => {
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const socket = useRef<WebSocket | null>(null);
  const [connectionState, setConnectionState] = useState<string>('Disconnected');
  const [wsState, setWsState] = useState<string>('Connecting...');

  useEffect(() => {
    // Initialize WebSocket connection
    socket.current = new WebSocket(`ws://${process.env.RAILWAY_STATIC_URL || 'localhost'}:8080`);

    // Initialize WebRTC peer connection
    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    const pc = peerConnection.current;
    const ws = socket.current;

    // Handle WebSocket messages
    ws.onmessage = async (message) => {
      try {
        const text = await message.data.text();
        const data = JSON.parse(text);

        if (data.answer) {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
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
      startStreaming();
    };

    ws.onclose = () => {
      setWsState('Disconnected');
    };

    ws.onerror = () => {
      setWsState('Error');
    };

    // Get canvas stream and create offer
    const startStreaming = async () => {
      if (!canvasRef.current) return;

      const stream = canvasRef.current.captureStream(60);
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        ws.send(JSON.stringify({ offer: pc.localDescription }));
      } catch (error) {
        console.error('Error creating offer:', error);
      }
    };

    // Cleanup
    return () => {
      ws.close();
      pc.close();
    };
  }, [canvasRef]);

  return (
    <div className="fixed bottom-4 right-4 bg-black/50 text-white p-4 rounded-lg space-y-2">
      <div>WebSocket: {wsState}</div>
      <div>WebRTC: {connectionState}</div>
    </div>
  );
}; 