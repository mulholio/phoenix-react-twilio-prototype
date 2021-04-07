import { useEffect, useState, useCallback } from 'react';
import './App.css';
import { Socket } from 'phoenix';
import _ from 'lodash';

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

// TODO grab userid from url param

function App() {
  const socket = useSocket();
  const channel = useChannel(socket, "room:jazz");

  const [currentUserId, setCurrentUserId] = useState();
  useEffect(() => {
    const id = window.location.pathname.slice(1);
    setCurrentUserId(id);
  }, []);

  const [users, setUsers] = useState({});
  useMessage(
    channel,
    Msgs.COORD_MOVE,
    ({ user_id, coords }) => {
      if (user_id === currentUserId) return;
      setUsers(users => ({ ...users, [user_id]: { coords }}));
    }
  );

  const pushUserCoords = useCallback(_.debounce((coords) => {
    channel
      .push(Msgs.COORD_MOVE, {
        coords,
        user_id: currentUserId
      })
  }, 1000), [channel, currentUserId])

  const move = useCallback((coords) => {
    setUsers(users =>
      ({ ...users, [currentUserId]: { ...users[currentUserId], coords }})
    );
    pushUserCoords(coords);
  }, [currentUserId, pushUserCoords]);

  useEffect(() => {
    const handler = ({ key }) => {
      const { coords } = users[currentUserId] || { coords: { x: 0, y: 0 }};
      switch (key) {
        case 'j':
          move({ ...coords, y: coords.y + 1 });
          break;
        case 'k':
          move({ ...coords, y: coords.y - 1 });
          break;
        case 'h':
          move({ ...coords, x: coords.x - 1 });
          break;
        case 'l':
          move({ ...coords, x: coords.x + 1 });
          break;
        default:
          return
      }
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [move, currentUserId, users]);

  return (
    <div className="App">
      <h1>Talk 'n' chat!</h1>
      <div>
        <p>You are user {currentUserId}</p>
      </div>
      <Map users={users} />
    </div>
  );
}

const Map = ({ users }) => (
  <div>
    {Object.entries(users).map(([userId, {coords: {x, y}}]) => (
      <div key={userId} style={{ transform: `translate(${x*5}px, ${y*5}px)`}}>
        {userId}: (<span>{x}</span>, <span>{y}</span>)
      </div>
    ))}
  </div>
)

export default App;
