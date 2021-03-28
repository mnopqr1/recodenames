import React from 'react';
import './MainView.css';

import GameInfo from '../GameInfo/GameInfo.js';
import RoomInfo from '../RoomInfo/RoomInfo.js';
import Card from '../Card/Card.js'

class MainView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: -1,
            clue: "",
            number: 1,
        }
    }


    render() { 
        return (
            <div className={"view " + this.props.turn + "-turn"}>
            <div className="left-panel">
            <div className="game-board">
                {this.props.cards.map((card, i) => {
                    return <Card 
                        color={card.color}
                        word={card.text}
                        key={i}
                        selected={this.state.selected === i}
                        handleClick={this.props.myTurnToGuess && !(card.turned) ? (e) => this.onItemSelected(i) : null}
                        turned={card.turned}
                    />})}
                
            </div>
            <div className="controls">
                {this.props.myTurnToGuess && 
                        <button onClick={this.handleSubmitGuess} disabled={this.props.phase === "clue"}>Submit guess</button>
                }
                {this.props.myTurnToClue && 
                        <input className="clue-input"
                                onKeyPress={this.handleKeyPress} 
                                onChange={this.handleChange} 
                                key="clue" 
                                value={this.state.clue} 
                                type="text"
                                disabled={this.props.phase === "guess"}
                                placeholder="Enter a clue"
                        />
                }
                {this.props.myTurnToClue &&
                        <input type="number"
                               onChange={this.handleNumberChange}
                               key="number"
                               value={this.state.number}
                               placeholder="1"
                               min="1"
                               max="10"
                        />}
                {this.props.myTurnToClue && 
                <button onClick={this.handleSubmitClue} disabled={this.props.phase==="guess"}>Submit clue</button> 
                }
            </div>
            </div>
                
            

            <RoomInfo
                userList={this.props.userList}
                joinTeam={this.props.joinTeam}                
            />

            <GameInfo
                turn={this.props.turn}
                clues={this.props.clues}
                score={this.props.score}
                phase={this.props.phase}
                guessesLeft={this.props.guessesLeft}
                    />
            </div> 
        );
    }

    onItemSelected = (index) => {
        if (this.props.cards[index].turned) { return; }
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
    
    handleSubmitGuess = () => {
        if (this.state.selected !== -1) {
            this.props.submitGuess(this.state.selected);
        } else {
            alert('no card selected');
        }
        this.setState( { selected: -1 });
    }


    handleSubmitClue = (event) => {
        this.props.submitClue(this.state.clue, parseInt(this.state.number));
        this.setState( {
            clue: "",
            number: 1
        })
    } 

    handleKeyPress = (event) => {
        if (event.key === "Enter") {
            this.handleSubmitClue();
        }
    }

    handleChange = (event) => {
        this.setState( {
            clue: event.target.value
        })
    }

    handleNumberChange = (event) => {
        this.setState( {
            number: event.target.value
        })
    }


}

export default MainView;