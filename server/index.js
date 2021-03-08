const app = require('express')();
const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (username.length === 1) {
    return next(new Error("username too short"));
  }
  socket.username = username;
  next();
})

io.on("connection", (socket) => {
  const users = [];
  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      userID: id,
      username: socket.username
    });
  }
  io.emit("userlist", users);
})

httpServer.listen(9000);