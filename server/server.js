/********************/
/** LOADING MODULES */
/********************/

// for socket io
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');

const express = require('express');
const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});



// for running python bot from JS file
const {PythonShell} = require('python-shell');

// for reading in the file containing all possible word cards
var fs = require("fs");

/* END LOADING MODULES */

/**********************/
/** UTILITY FUNCTIONS */
/**********************/

// choose n random integers between 0 and N - 1, without repetitions
function randomArray(n, N) {
  if (n > N) { console.log("source file too small."); return;}
  var i = 0;
  var array = [];
  while (i < n) {
    var newchoice = -1
    do {
      newchoice = Math.floor(Math.random() * N);
    } while (array.includes(newchoice))
    array.push(newchoice);
    i++;
  }
  return array;
}

// randomly shuffle array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
}

// get the entries of sourceArray at all indices in the array indices
function pickFrom(sourceArray, indices) {
  retArray = []
  for (let i = 0; i < indices.length; i++) {
    retArray.push(sourceArray[indices[i]]);
  }
  return retArray;
}

function createRandomBoard() {
  // read words from file
  var all_words = fs.readFileSync("./game_wordpool.txt", "utf-8").split("\n");
  
  // pre-processing: need to omit '\n' at the end of every word and make lowercase.
  all_words = all_words.map(word => word.toLowerCase().substring(0,word.length-1)) 

  // choose a random array of indices
  var chosenindices = randomArray(25, all_words.length);

  // return corresponding board
  return  {"blue" : pickFrom(all_words, chosenindices.splice(0,9)), 
           "red" : pickFrom(all_words, chosenindices.splice(0,8)), 
           "white" : pickFrom(all_words, chosenindices.splice(0,7)),
           "black" : pickFrom(all_words, chosenindices.splice(0,1))};
}
/* END UTILITY FUNCTIONS */

/****************************/
/* INITIALIZATION FUNCTIONS */
/****************************/

// initialize board
var board = createRandomBoard();
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

/* END INITIALIZATION FUNCTIONS */

/**************************/
/** BOT UTILITY FUNCTIONS */
/**************************/

/* TO DO : bot should also take into account 'negatives' (other team + black card) 
           bot should get previous clues that it gave, shouldn't give the same clue twice.
           bot should only get as positives the words that are left to guess for its team.*/

const BOT_DEBUG_MODE = true;           
const BOT_MASTER_PATH = '../ai/';            // path to bot for spymaster
const BOT_MASTER_FILE = 'bot_master.py'; // filename of bot for spymaster
// groupSize is passed as a string! python script handles conversion to int
getBotClue = (groupSize) => {
  let arguments = board[turn].concat([groupSize]);

  // ask python bot for clue
  let options = {
    mode: 'text',
    pythonOptions: ['-u'], // get print results in real-time
    scriptPath: BOT_MASTER_PATH, 
    args: arguments // get a clue for the current player's cards
  };

  PythonShell.run(BOT_MASTER_FILE, options, function (err, result){
      if (err) throw err;
      let botClue = { content: result[0], 
                      number: groupSize,
                      team: turn };
      
      if (BOT_DEBUG_MODE) console.log(result); 

      // TODO: refactor into separate function once I understand async/await better
      // for now essentially just copy-pasted the "new clue" (from human player) procedure
      clues.push(botClue);
      io.emit("clue change", clues);
      guessesLeft = botClue["number"];
      phase = "guess";
      io.emit("phase change", turn, phase, guessesLeft);
  });
}
/* END BOT UTILITIES */

/********************/
/* SERVER FUNCTIONS */
/********************/

// on first connection of a new user
io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (username.length <= 1) {
    return next(new Error("username too short"));
  }
  socket.username = username;
  socket.team = "spectator";
  socket.role = "spectator";
  next();
});

// list of all currently connected users
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

// check if a team currently has a spymaster
hasMaster = (teamname) => {
  for (let [id, socket] of io.of("/").sockets) {
    if (socket.team === teamname && socket.role === "master") {
      return true;
    }
  }
  return false;
}

// send appropriate cards to all players
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

// send scores to all players
broadcastScores = () => {
  io.emit("scores", score);
}

// join a team
joinTeam = (socket, teamname, rolename) => {
  // refuse when the team already has a master
  if (rolename === "master" && hasMaster(teamname)) {
    return;
  }
  socket.team = teamname;
  socket.role = rolename;
  io.emit("userlist", userList());
  broadcastCards();
}

handleHumanClue = (newClue) => {
  clues.push(newClue);
  io.emit("clue change", clues);
  guessesLeft = newClue["number"];
  phase = "guess";
  io.emit("phase change", turn, phase, guessesLeft);
}

handleHumanGuess = (i) => {
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
}

// to do for every socket connection
io.on("connection", (socket) => {
  const users = userList();
  io.emit("userlist", users);
  io.emit("phase change", turn, phase, guessesLeft);

  broadcastCards();

  socket.on("join team", (teamname, rolename) => joinTeam(socket, teamname, rolename));
  socket.on("new clue", handleHumanClue);
  socket.on("bot clue", getBotClue);
  socket.on("new guess", handleHumanGuess);

});

/* END SERVER FUNCTIONS */


var port = 9000;
httpServer.listen(port);
console.log("Server is listening at port 9000");


// serve react app
const path = require('path');
const app = express();
app.use(express.static(path.join(__dirname, 'build')));
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.listen(3000);