import React from 'react';
import './RoomInfo.css';

class RoomInfo extends React.Component {

    styleUser = (user) => {
        return (
            <span className={user.role + "-user"} key={user.id}>{user.username} </span>
        );
    }

    render() {
        const blue = this.props.userList.filter((user) => user.team === "blue").map(this.styleUser);
        const red = this.props.userList.filter((user) => user.team === "red").map(this.styleUser);
        const spectator = this.props.userList.filter((user) => user.team === "spectator").map(this.styleUser);
        return <div className="room-info">
            
                <div className="team blue-team">
                    <h2>Team Blue</h2>
                    {blue}
                    <button data-team="blue" data-role="guesser" onClick={this.handleClick}>Join as Guesser</button>
                    <button data-team="blue" data-role="master" onClick={this.handleClick}>Join as Master</button>
                </div>

                <div className="team red-team">
                    <h2>Team Red</h2>
                    {red}
                    <button data-team="red" data-role="guesser" onClick={this.handleClick}>Join as Guesser</button>
                    <button data-team="red" data-role="master" onClick={this.handleClick}>Join as Master</button>
                </div>

                <div className="team spectators">
                    <h2>Spectators</h2>
                    {spectator}
                    <button data-team="spectator" data-role="spectator" onClick={this.handleClick}>Join</button>
                </div>
            
                </div>
            
    }

    handleClick = (event) => {
        this.props.joinTeam(event.target.dataset.team, event.target.dataset.role);
    }
}

export default RoomInfo;