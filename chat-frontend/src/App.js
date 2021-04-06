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
  const [users, setUsers] = useState({});

  // TODO perf setup where we calculate current user separately
  useMessage(
    channel,
    Msgs.COORD_MOVE,
    ({ user_id, coords }) => {
      setUsers(users => ({ ...users, [user_id]: { coords }}));
    }
  );

  const move = useCallback(_.throttle((coords) => {
    console.log('move');
    if (!channel) return;
    channel
      .push(Msgs.COORD_MOVE, {
        coords,
        user_id: currentUserId
      })
  }, 500), [currentUserId, channel]);

  useEffect(() => {
    const handler = ({ key }) => {
      console.log('handler');
      const currentUser = users[currentUserId];
      const { coords } = currentUser || { coords: { x: 0, y: 0 }};
      switch (key) {
        case 'j':
          move({ ...coords, y: coords.y - 1 });
          break;
        case 'k':
          move({ ...coords, y: coords.y + 1 });
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
        <label>Enter user id to "sign in" or change user</label>
        <input type="number" value={currentUserId} onChange={e => setCurrentUserId(e.currentTarget.value)} />
      </div>
      <Map users={users} />
    </div>
  );
}

const Map = ({ users }) => (
  <div>
    {Object.entries(users).map(([userId, {coords: {x, y}}]) => (
      <p>
        {userId}: (<span>{x}</span>, <span>{y}</span>)
      </p>
    ))}
  </div>
)

export default App;
