import React from 'react';
import './MasterView.css';

import GameInfo from '../GameInfo/GameInfo.js';
import Card from '../Card/Card.js';

class MasterView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clue: ""
        }
    }

    render() {
        const cards = this.props.cards.map((card,i) => {
            return <Card 
            color={card.color} 
            word={card.text} 
            turned={card.turned}
            key={i}/>
        })
        return (
            <div className={"master-view " + this.props.turn + "-turn"}>
                <section className="game-board">
                        {cards}
                <button onClick={this.props.toggleView}>Toggle view (Debugging)</button>
                </section>
                
                <div className="controls">
                <input className="clue-input"
                    onKeyPress={this.handleKeyPress} 
                    onChange={this.handleChange} 
                    key="clue" 
                    value={this.state.clue} 
                    type="text"
                    disabled={this.props.phase === "guess"}
                >
                </input>
                <button onClick={this.handleSubmit} disabled={this.props.phase==="guess"}>Submit clue</button>
                </div>    
            

            <GameInfo
                turn={this.props.turn}
                clues={this.props.clues}
                score={this.props.score}
                phase={this.props.phase}
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
            clue: "waiting for guess..."
        })
    }
}

export default MasterView;