const app = require('express')();
const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});

var clues = [];
var turn = "red";
var phase = "clue";

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (username.length <= 1) {
    return next(new Error("username too short"));
  }
  socket.username = username;
  socket.team = "spectator";
  socket.role = "spectator";
  next();
})

userList = () => {
  const users = [];
  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      userID: id,
      username: socket.username,
      team: socket.team,
      role: socket.role
    });
  }
  console.log(users);
  return users;
}

io.on("connection", (socket) => {
  const users = userList();
  io.emit("userlist", users);

  socket.on("join team", (teamname, rolename) => {
    console.log("received join team");
    socket.team = teamname;
    socket.role = rolename;
    const users = userList();
    io.emit("team change", users);
  });

  socket.on("new clue", (newClue) => {
    clues.push(newClue);
    io.emit("clue change", clues);
    phase = "guess";
    io.emit("phase change", turn, phase);
  })
});





httpServer.listen(9000);