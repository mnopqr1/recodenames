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
            myTurnToGuess: this.props.phase === "guess" && this.props.team === this.props.turn && this.props.role === "guesser",
            myTurnToClue: this.props.phase === "clue" && this.props.team === this.props.turn && this.props.role === "master",
        }
    }

    getControls = () => {
        /* console.log(this.props.phase)
        console.log(this.props.team)
        console.log(this.props.role)
        console.log(this.props.turn) */
        if (this.state.myTurnToGuess) {
            return <div className="controls">
                <button onClick={this.handleSubmitGuess} disabled={this.props.phase === "clue"}>Submit guess</button>
                   </div>
        }
        if (this.state.myTurnToClue) {
            return <div className="controls">
                        <input className="clue-input"
                                onKeyPress={this.handleKeyPress} 
                                onChange={this.handleChange} 
                                key="clue" 
                                value={this.state.clue} 
                                type="text"
                                disabled={this.props.phase === "guess"}
                                placeholder="Enter a clue"
                        >
                        </input>
                        <button onClick={this.handleSubmitClue} disabled={this.props.phase==="guess"}>Submit clue</button>
                    </div>
        }
    }

    render() {
        const cards = this.props.cards.map((card, i) => {
            return <Card 
                color={card.color}
                word={card.text}
                turned={card.turned}
                key={i}
                selected={this.state.selected === i}
                handleClick={this.state.myTurnToGuess ? (e) => this.onItemSelected(i) : null}
            />});
            
        return (
            <div className={"view " + this.props.turn + "-turn"}>
            <div className="game-board">
                {cards}
                {this.getControls()}
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
        this.props.submitClue(this.state.clue);
        this.setState( {
            clue: "waiting for guess..."
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


}

export default MainView;