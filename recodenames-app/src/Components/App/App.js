import React from 'react';
import './App.css';


import MainView from '../MainView/MainView.js';
import RegistrationView from '../RegistrationView/RegistrationView.js';
import socket from '../../socket.js';

/* https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}



class App extends React.Component {
    constructor(props) {
        super(props);
        this.board = {"blue" : ["chest", "belt", "whip", "space", "cliff", "flat", "fighter", "dressing", "blizzard"],
                      "red" : ["mummy", "sloth", "chalk", "van", "sled", "attic", "state", "ice"],
                      "black" : ["steam"],
                      "white" : ["yard", "web","pie", "shampoo", "scientist", "octopus", "roll"]}
        this.initWords();            
        this.state = {
            usernameSelected: false,
            username: "",
            team: "spectator",
            role: "spectator",
            userList: [],
            guesser: false,
            clues: [],
            turn: "red",
            phase: "clue",
            score : {"red" : 0, "blue": 0},
            guessPlayers: {"red": [], "blue": []},
            masterPlayers: {"red": undefined, "blue": undefined},
            cardList: [],
            guesserCards: this.words.map((word) => {return {text: word, color: "unknown", turned: false}}),
            masterCards: this.words.map((word) => {return {text: word, color: this.colorOf(word), turned: false}}),
        };

        socket.on("userlist", (userList) => this.setState({
            userList
        }));

        socket.on("cardList", (cardList) => this.setState({
            cardList
        }))

        socket.on("clue change", (clues) => this.setState({
            clues
        }))

        socket.on("phase change", (turn, phase) => this.setState({
            turn,
            phase
        }))

        
    }



    render() {
        if (!this.state.usernameSelected) {
            return (
                <RegistrationView
                    registerUser = {this.registerUser}
                />
            )

        } else {
            // if (this.state.role !== "master") {
            // if (this.guesser) {
                return (
                    <MainView 
                        cards={this.state.guesserCards}
                        toggleView={this.toggleView}
                        submitGuess={this.submitGuess}
                        submitClue={this.submitClue}
                        clues={this.state.clues}
                        turn={this.state.turn}
                        team={this.state.team}
                        role={this.state.role}
                        phase={this.state.phase}
                        score={this.state.score}
                        userList={this.state.userList}
                        joinTeam={this.joinTeam}
                        />
                );
            /* } else {
                return (
                    <MasterView 
                        cards={this.state.masterCards}
                        toggleView={this.toggleView}
                        turn={this.state.turn}
                        submitClue={this.submitClue}
                        clues={this.state.clues}
                        phase={this.state.phase}
                        score={this.state.score}
                        userlist={this.state.userlist}
                        joinTeam={this.joinTeam}
                        />
                );
            } */
        }
    }

    registerUser = (username) => {
        this.setState( {
            usernameSelected: true
        });
        socket.auth = { username };
        socket.connect();
    }

    joinTeam = (team, role) => {
        console.log("calling jointeam with value " + team);
        this.setState( {
            team,
            role
        });
        socket.emit("join team", team, role);
        console.log(this.state.userList);
    }

    initWords = () => {
        const words = [...this.board["blue"], 
                       ...this.board["red"], 
                       ...this.board["black"], 
                       ...this.board["white"]];
        shuffleArray(words);
        this.words = words;
    }



    colorOf = (word) => {
        return Object.keys(this.board).find(key => this.board[key].includes(word));
    }

    submitGuess = (i) => {
        if (this.board[this.state.turn].includes(this.words[i])) {
            this.handleCorrect(i);
        } else {
            this.handleWrong(i);
        }
        this.setState((state) => ({
            turn: (state.turn === "red") ? "blue" : "red",
            phase: "clue"
            // guesserCards: [...state.guesserCards, state.guesserCards[i].turned = true]
        }))
    }

    handleCorrect = (guess) => {
        this.setState((state) => {
            return {
                score : {
                    ...state.score,
                    [state.turn]: state.score[state.turn] + 1               
                }
            }
        });
       
    }

    handleWrong = (guess) => {
        return;
    }
    submitClue = (clue) => {
        if (clue === "") { alert("no clue entered"); return; }

        const newClue = {
            content: clue, 
            team: this.state.turn
        };
        this.setState((state) => ({
            clues: [...this.state.clues, newClue],
            phase: "guess"
        }));
        socket.emit("new clue", newClue);
    }

/*    toggleView = () => {
        this.setState(state => ({
            guesser: !state.guesser
        }));
    } */
}


export default App;