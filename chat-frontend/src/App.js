import { useEffect, useState } from 'react';
import './App.css';
import { Socket } from 'phoenix';

const WEB_SOCKET_URL = 'ws://localhost:4000/socket';


function App() {
  const [socket, setSocket] = useState();

  useEffect(() => {
    const socket = new Socket(WEB_SOCKET_URL, {params: {}})
    socket.connect();
    setSocket(socket);
  }, []);

  const [channel, setChannel] = useState();
  console.log('channel', channel);

  useEffect(() => {
    if (!socket) return
    const newChannel = socket.channel("room:jazz", {});
    console.log('new channel', newChannel);
    newChannel.join()
      .receive("ok", resp => {
        console.log("Joined successfully", resp)
      })
      .receive("error", resp => {
        console.log("Unable to join", resp)
      })
    return () => newChannel.leave();
  }, [setChannel, socket]);


  return (
    <div className="App">
      <h1>Talk 'n' chat!</h1>
    </div>
  );
}

export default App;
