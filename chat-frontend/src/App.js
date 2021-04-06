import './App.css';
import { Socket } from 'phoenix';

const WEB_SOCKET_URL = 'ws://localhost:4000/socket';

const options = {};
const socket = new Socket(WEB_SOCKET_URL, {params: options})
socket.connect()

function App() {
  return (
    <div className="App">
      <h1>Talk 'n' chat!</h1>
    </div>
  );
}

export default App;
