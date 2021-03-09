import React from 'react';
import './GuesserView.css';

import GameInfo from '../GameInfo/GameInfo.js';
import RoomInfo from '../RoomInfo/RoomInfo.js';
import Card from '../Card/Card.js'

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
            <div className="game-board">
                {this.props.cards.map((card, i) => {
                return <Card 
                    color={card.color}
                    word={card.text}
                    turned={card.turned}
                    key={i}
                    selected={this.state.selected === i}
                    handleClick={(this.props.phase === "guess") ? (e) => this.onItemSelected(i) : null}
                />})}
            <button onClick={this.props.toggleView}>Toggle view (Debugging)</button>
            </div>
            <div className="controls">
                <button onClick={this.handleSubmit} disabled={this.props.phase === "clue"}>Submit guess</button>
            </div>

            <RoomInfo
                userlist={this.props.userlist}
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
    
    handleSubmit = () => {
        if (this.state.selected !== -1) {
            this.props.submitGuess(this.state.selected);
        } else {
            alert('no card selected');
        }
        this.setState( { selected: -1 });
    }
}

export default GuesserView;