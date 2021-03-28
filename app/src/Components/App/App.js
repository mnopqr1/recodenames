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
            guessesLeft: 0
        };

        socket.on("userlist", (userList) => this.setState({
            userList
        }));

        socket.on("cardlist", (cards) => this.setState({
            cards
        }));

        socket.on("scores", (score) => this.setState({ score }));

        socket.on("clue change", (clues) => this.setState({
            clues
        }))

        socket.on("phase change", (turn, phase, guessesLeft) => this.setState({
            turn,
            phase,
            guessesLeft
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
                        guessesLeft={this.state.guessesLeft}
                        submitGuess={this.submitGuess}
                        submitClue={this.submitClue}
                        botClue={this.botClue}
                        myTurnToGuess={this.state.phase === "guess" && this.state.team === this.state.turn && this.state.role === "guesser"}
                        myTurnToClue={this.state.phase === "clue" && this.state.team === this.state.turn && this.state.role === "master"}
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
        socket.emit("new guess", i);
        /* this.setState((state) => ({
            turn: (state.turn === "red") ? "blue" : "red",
            phase: "clue"
            // guesserCards: [...state.guesserCards, state.guesserCards[i].turned = true]
        })) */
    }


    submitClue = (clue, number) => {
        if (clue === "") { alert("no clue entered"); return; }

        const newClue = {
            content: clue, 
            number: number,
            team: this.state.turn
        };

        socket.emit("new clue", newClue);
    }

    botClue = (number) => {
        socket.emit("bot clue", number);
    }
}


export default App;