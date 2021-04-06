import { useEffect, useState } from 'react';
import './App.css';
import { Socket } from 'phoenix';

const WEB_SOCKET_URL = 'ws://localhost:4000/socket';

const Msgs = {
  COORD_MOVE: 'coord_move',
}

function useSocket() {
  const [socket, setSocket] = useState();
  useEffect(() => {
    const socket = new Socket(WEB_SOCKET_URL, {params: {}})
    socket.connect();
    setSocket(socket);
  }, []);
  return socket;
}

function useChannel(socket, topic) {
  const [channel, setChannel] = useState();
  useEffect(() => {
    if (!socket) return
    const newChannel = socket.channel(topic, {});
    newChannel.join()
      .receive("ok", _resp => {
        setChannel(newChannel);
      })
      .receive("error", resp => {
        console.error("Unable to join", resp)
      })
    return () => newChannel.leave();
  }, [setChannel, socket, topic]);
  return channel
}

function useMessage(channel, cb) { 
  // useMessage
  useEffect(() => {
    if (!channel) return;
    channel.on(Msgs.COORD_MOVE, cb);
  }, [channel, cb]);
}

function App() {
  const socket = useSocket();
  const channel = useChannel(socket, "room:jazz");

  useMessage(channel, payload => console.log('payload', payload));

  const [playerId, setPlayerId] = useState();
  const handleSetId = (e) => {
    setPlayerId(e.currentTarget.value)
  }

  const move = () => {
    if (!channel) return;
    channel
      .push(Msgs.COORD_MOVE, {
        coords: { x: 20, y: 20 },
        player_id: playerId
      })
  }


  return (
    <div className="App">
      <h1>Talk 'n' chat!</h1>
      <div>
      <label>
        Player to move
        <input type="number" onChange={handleSetId} />
      </label>
      <button onClick={move}>Move</button>
      </div>
    </div>
  );
}

export default App;
