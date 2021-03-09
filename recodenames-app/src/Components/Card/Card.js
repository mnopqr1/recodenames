import React from 'react';
import './Card.css';

class Card extends React.Component {
    render() {
        return <div className="code-card">
                    <p onClick={this.props.handleClick} 
                       className={"code-text " + this.props.color + "-col" + (this.props.selected ? "-sel" : "") + (this.props.turned ? "-turned" : "")}>
                        {this.props.word}
                    </p>
                </div>
    }
}

export default Card;