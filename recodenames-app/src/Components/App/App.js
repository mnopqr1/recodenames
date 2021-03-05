import React from 'react';
import './App.css';


import GuesserView from '../GuesserView/GuesserView.js';
import MasterView from '../MasterView/MasterView.js';

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
            guesser: false,
            clues: [],
            turn: "red",
            phase: "clue",
            score : {"red" : 0, "blue": 0},
            guessPlayers: {"red": [], "blue": []},
            masterPlayers: {"red": undefined, "blue": undefined},
            guesserCards: this.words.map((word) => {return {text: word, color: "unknown", turned: false}}),
            masterCards: this.words.map((word) => {return {text: word, color: this.colorOf(word), turned: false}})
        }
    }

    render() {
        if (this.state.guesser) {
            return <div>
                <GuesserView 
                    cards={this.state.guesserCards}
                    toggleView={this.toggleView}
                    submitGuess={this.submitGuess}
                    clues={this.state.clues}
                    turn={this.state.turn}
                    phase={this.state.phase}
                    score={this.state.score}
                    />
                </div>
        } else {
            return <div>
                <MasterView 
                    cards={this.state.masterCards}
                    toggleView={this.toggleView}
                    turn={this.state.turn}
                    submitClue={this.submitClue}
                    clues={this.state.clues}
                    phase={this.state.phase}
                    score={this.state.score}/>
                </div>
        }
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
    }

    toggleView = () => {
        this.setState(state => ({
            guesser: !state.guesser
        }));
    }
}


export default App;