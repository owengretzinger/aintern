import { useState } from 'react';
import './App.css';
import { VideoRoom } from './components/VideoRoom';

function App() {
  // const [joined, setJoined] = useState(false);
  const [joined, setJoined] = useState(true);

  return (
    <div className="App">
      {/* <h1>WDJ Virtual Call</h1>

      {!joined && (
        <button onClick={() => setJoined(true)}>
          Join Room
        </button>
      )} */}

      {joined && (
        <>
          {/* <button onClick={() => setJoined(false)}>
            To Lobby
          </button> */}
          <VideoRoom />
        </>
      )}
    </div>
  );
}

export default App;
