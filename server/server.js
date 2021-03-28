const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');

const app = require('express')();
const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});




// initialize board
var board = {"blue" : ["chest", "belt", "whip", "space", "cliff", "flat", "fighter", "dressing", "blizzard"],
             "red" : ["mummy", "sloth", "chalk", "van", "sled", "attic", "state", "ice"],
             "black" : ["steam"],
             "white" : ["yard", "web","pie", "shampoo", "scientist", "octopus", "roll"]};
const words = [...board["blue"], ...board["red"], ...board["black"], ...board["white"]];
shuffleArray(words);

// initialize cards
var cardsNoColor = words.map((word) => {
  return { 
    text: word, 
    color: "unknown", 
    turned: false}
  });
                                                      
var cardsWithColor = words.map((word) => {
  return {
    text: word, 
    color: Object.keys(board).find(key => board[key].includes(word)), 
    turned: false}
  });

// initialize game info
var clues = [];
var turn = "red";
var phase = "clue";
var guessesLeft = 1;
var score = {"red" : 0, "blue" : 0};

// helper function: randomly shuffle array
/* https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
}

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
  return users;
}

hasMaster = (teamname) => {
  for (let [id, socket] of io.of("/").sockets) {
    if (socket.team === teamname && socket.role === "master") {
      return true;
    }
  }
  return false;
}

broadcastCards = () => {
  for (let [id, socket] of io.of("/").sockets) {
    // console.log(socket.role);
    if (socket.role === "guesser" || socket.role === "spectator") {
      
      socket.emit("cardlist", cardsNoColor)
    }
    if (socket.role === "master") {
      socket.emit("cardlist", cardsWithColor)
    }
  }
}

broadcastScores = () => {
  io.emit("scores", score);
}

io.on("connection", (socket) => {
  const users = userList();
  io.emit("userlist", users);
  io.emit("phase change", turn, phase, guessesLeft);

  broadcastCards();

  socket.on("join team", (teamname, rolename) => {
    // refuse when the team already has a master
    if (rolename === "master" && hasMaster(teamname)) {
      return;
    }
    socket.team = teamname;
    socket.role = rolename;
    io.emit("userlist", userList());
    broadcastCards();
  });

  socket.on("new clue", (newClue) => {
    clues.push(newClue);
    io.emit("clue change", clues);
    guessesLeft = newClue["number"];
    phase = "guess";
    io.emit("phase change", turn, phase, guessesLeft);
  })

  socket.on("new guess", (i) => {
    guessesLeft -= 1;

    cardsNoColor[i].turned = true;
    cardsWithColor[i].turned = true;
    cardsNoColor[i].color = cardsWithColor[i].color;
    if (board[turn].includes(words[i])) {
      score[turn] += 1;
    } else {
      guessesLeft = 0;
    }

    broadcastCards();
    broadcastScores();

    if (guessesLeft == 0) {
      phase = "clue";
      turn = (turn === "red") ? "blue" : "red";
    }
    io.emit("phase change", turn, phase, guessesLeft);
  });
});




var port = 9000;
httpServer.listen(port);
console.log("Listening at port 9000");