import React from 'react';
import './GameInfo.css';

class GameInfo extends React.Component {
    render() {
        const clues = this.props.clues.map((clue, index) => { 
            return <div className={"clue-" + clue.team} key={index}>{clue.content}</div> 
        });
        return <div className="game-info">
            
            <div className="earlier-clues">
            <h2>Earlier Clues:</h2>
            <ul>
                {clues}
            </ul>
            </div>

            <div className="new-clue">
            <h2>New Clue:</h2> 
            {this.props.phase === "guess" ? clues[clues.length-1] : "waiting for spymaster..."}
            </div>


            <div className="game-phase">
            <h2>It is {this.props.turn}'s turn to {this.props.phase}.</h2>
            </div>


            <div className="scores">
            <h3>Scores:</h3>
            <p>Red: {this.props.score["red"]}</p>
            <p>Blue: {this.props.score["blue"]}</p>
            </div>

            </div>   
    }
}

export default GameInfo;