import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Card extends React.Component {

    render() {
        return <div className="code-card">
                    <p onClick={this.props.handleClick} 
                       className={"code-text " + this.props.color + "-col" + (this.props.selected ? "-sel" : "") + (this.props.turned ? " turned" : "")}>
                        {this.props.word}
                    </p>
                </div>
    }
}

class GuesserView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: -1
        }
    }

    render() {
        return (
            <div className={"guesser-view " + this.props.turn + "-turn"}>
            <section className="game-board">
                {this.props.words.map((word, i) => {
                return <Card 
                    color="no" 
                    word={word.text}
                    turned={word.turned}
                    key={i}
                    selected={this.state.selected === i}
                    handleClick={(e) => this.onItemSelected(i)}
                />})}
            <button onClick={this.props.toggleView}>Toggle view (Debugging)</button>
            </section>
            <section className="guesser-controls">
            <button onClick={this.handleSubmit}>Submit guess</button>
            </section>
            <GameInfo
                turn={this.props.turn}
                clues={this.props.clues}
                score={this.props.score}
                    />
            </div>
            );
    }

    onItemSelected = (index) => {
        if (this.props.words[index].turned) { return; }
        if (this.state.selected === index) {
            this.setState( {
                selected : -1 
            });
        } else {
            this.setState( {
                selected: index
            } )
        }
    }
    
    handleSubmit = () => {
        if (this.state.selected !== -1) {
            this.props.submitGuess(this.props.words[this.state.selected]);
        } else {
            alert('no card selected');
        }
        this.setState( { selected: -1 });
    }
}
/* https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

class MasterView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clue: ""
        }
    }

    render() {
        const cards = this.props.board.words.map((word,i) => {
            return <Card 
            color={this.props.board.colorOf(word.text)} 
            word={word.text} 
            turned={word.turned}
            key={i}/>
        })
        return (
            <div className={"master-view " + this.props.turn + "-turn"}>
                <section className="game-board">
                        {cards}
                <button onClick={this.props.toggleView}>Toggle view (Debugging)</button>
                </section>
                
                <section className="master-controls">
                <input className="clue-input"
                    onKeyPress={this.handleKeyPress} 
                    onChange={this.handleChange} 
                    key="clue" 
                    value={this.state.clue} 
                    type="text"
                    >
                </input>
                <button onClick={this.handleSubmit}>Submit clue</button>
                </section>    
            

            <GameInfo
                turn={this.props.turn}
                clues={this.props.clues}
                score={this.props.score}
                    />
            </div>
            );
        
    }

    handleKeyPress = (event) => {
        if (event.key === "Enter") {
            this.handleSubmit();
        }
    }

    handleChange = (event) => {
        this.setState( {
            clue: event.target.value
        })
    }

    handleSubmit = (event) => {
        this.props.submitClue(this.state.clue);
        this.setState( {
            clue: ""
        })
    }
}

   // need to refactor this to get state.
   // probably just put this in app class.
class Board {
    constructor(content) {
        this.content = content;
        this.words = this.initWords().map((word) => { 
            return {text: word, turned: false} 
        });
    }


    initWords = () => {
        const words = [...this.content["blue"], 
                       ...this.content["red"], 
                       ...this.content["black"], 
                       ...this.content["white"]];
        shuffleArray(words);
        return words;
    }

    colorOf = (word) => {
        return Object.keys(this.content).find(key => this.content[key].includes(word));
    }

 
    turnCard = (word) => {
        return;
    }
}

class GameInfo extends React.Component {
    render() {
        const clues = this.props.clues.map((clue) => { 
            return <li className={"clue-" + clue.team}>{clue.content}</li> 
        });
        return <div>
            <section className="GameInfo">
            
            <h1>Clues:</h1>
            <ul>
                {clues}
            </ul>
            <hr/>

            <h2>It is {this.props.turn}'s turn.</h2>

            <h3>Scores:</h3>
            <p>Red: {this.props.score["red"]}</p>
            <p>Blue: {this.props.score["blue"]}</p>
            </section>
            </div>   
    }
}
class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            guesser: true,
            clues: [],
            turn: "red",
            score : {"red" : 0, "blue": 0},
            guessers: {"red": [], "blue": []},
            master: {"red": undefined, "blue": undefined},
            board: new Board({"blue" : ["chest", "belt", "whip", "space", "cliff", "flat", "fighter", "dressing", "blizzard"],
                    "red" : ["mummy", "sloth", "chalk", "van", "sled", "attic", "state", "ice"],
                    "black" : ["steam"],
                    "white" : ["yard", "web","pie", "shampoo", "scientist", "octopus", "roll"]})
        }
    }

    render() {
        if (this.state.guesser) {
            return <div>
                <GuesserView 
                    words={this.state.board.words}
                    toggleView={this.toggleView}
                    submitGuess={this.submitGuess}
                    clues={this.state.clues}
                    turn={this.state.turn}
                    score={this.state.score}
                    />
                </div>
        } else {
            return <div>
                <MasterView 
                    board={this.state.board}
                    toggleView={this.toggleView}
                    turn={this.state.turn}
                    submitClue={this.submitClue}
                    clues={this.state.clues}
                    score={this.state.score}/>
                </div>
        }
    }

    submitGuess = (guess) => {
        if (this.state.board.content[this.state.turn].includes(guess.text)) {
            this.handleCorrect(guess);
        } else {
            this.handleWrong(guess);
        }
        this.state.board.turnCard(guess);
        this.setState((state) => ({
            turn: (state.turn === "red") ? "blue" : "red"
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
        const newClue = {
            content: clue, 
            team: this.state.turn
        };
        this.setState((state) => ({
            clues: [...this.state.clues, newClue],
            turn: (this.state.turn === "red") ? "blue" : "red"
        }));
    }

    toggleView = () => {
        this.setState(state => ({
            guesser: !state.guesser
        }));
    }
}

ReactDOM.render(<App />, document.getElementById('root'));