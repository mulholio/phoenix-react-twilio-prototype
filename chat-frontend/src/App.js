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

function useMessage(channel, msgName, cb) { 
  useEffect(() => {
    if (!channel) return;
    channel.on(msgName, cb);
  }, [channel, msgName, cb]);
}

// User {
//   id
//   coords
// }

function App() {
  const socket = useSocket();
  const channel = useChannel(socket, "room:jazz");

  const [currentUserId, setCurrentUserId] = useState();
  const [users, setUsers] = useState({});

  useMessage(
    channel,
    Msgs.COORD_MOVE,
    ({ user_id, coords }) => {
      setUsers(users => ({ ...users, [user_id]: { coords }}));
    }
  );
  console.log(users)

  const move = () => {
    if (!channel) return;
    channel
      .push(Msgs.COORD_MOVE, {
        coords: { x: 20, y: 20 },
        user_id: currentUserId
      })
  }


  return (
    <div className="App">
      <h1>Talk 'n' chat!</h1>
      <div>
        <label>Enter user id to "sign in" or change user</label>
        <input type="number" value={currentUserId} onChange={e => setCurrentUserId(e.currentTarget.value)} />
      </div>
      <div>
        <button onClick={move}>Move</button>
      </div>
      <div>
        {Object.entries(users).map(([userId, {coords: {x, y}}]) => console.log('x', x) || (
          <p>
            {userId}: (<span>{x}</span>, <span>{y}</span>)
          </p>
        ))}
      </div>
    </div>
  );
}

export default App;
