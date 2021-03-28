import { io } from "socket.io-client"

const URL = "http://localhost:9000";
const socket = io(URL, { autoConnect: false });

socket.onAny((event, ...args) => {
    console.log(event, args);
})

socket.on("connect_error", (err) => {
    if (err.message === "username too short") {
      alert("bad username");
    }
  });



export default socket;