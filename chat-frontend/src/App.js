import { useEffect, useState } from 'react';
import './App.css';
import { Socket } from 'phoenix';

const WEB_SOCKET_URL = 'ws://localhost:4000/socket';


function App() {
  // useSocket
  const [socket, setSocket] = useState();
  useEffect(() => {
    const socket = new Socket(WEB_SOCKET_URL, {params: {}})
    socket.connect();
    setSocket(socket);
  }, []);


  // useChannel
  const [channel, setChannel] = useState();
  useEffect(() => {
    if (!socket) return
    const newChannel = socket.channel("room:jazz", {});
    console.log('new channel', newChannel);
    newChannel.join()
      .receive("ok", resp => {
        console.log("Joined successfully", resp)
        setChannel(newChannel);
      })
      .receive("error", resp => {
        console.log("Unable to join", resp)
      })
    return () => newChannel.leave();
  }, [setChannel, socket]);

  const move = () => {
    console.log('channel', channel)
    channel && channel.push("coord_move", { coords: { x: 20, y: 20 }})
  }

  return (
    <div className="App">
      <h1>Talk 'n' chat!</h1>
      <button onClick={move}>Move</button>
    </div>
  );
}

export default App;
