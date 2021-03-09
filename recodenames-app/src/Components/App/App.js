import React from 'react';
import './App.css';

import MainView from '../MainView/MainView.js';
import RegistrationView from '../RegistrationView/RegistrationView.js';
import socket from '../../socket.js';

class App extends React.Component {
    constructor(props) {
        super(props);

        // this.initWords();            
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
            cards: [],
        };

        socket.on("userlist", (userList) => this.setState({
            userList
        }));

        socket.on("cardlist", (cards) => this.setState({
            cards
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
                        cards={this.state.cards}
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
        // console.log("calling jointeam with value " + team);
        this.setState( {
            team,
            role
        });
        socket.emit("join team", team, role);
        // console.log(this.state.userList);
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
}


export default App;