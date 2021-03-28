import React from 'react';
import './RegistrationView.css';

class RegistrationView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: ""
        }
    }

    render() {
        return <div>
        <input className="username-input"
            onKeyPress={this.handleKeyPress} 
            onChange={this.handleChange} 
            key="username" 
            value={this.state.username} 
            type="text"
        >
        </input>
        <button onClick={this.handleSubmit}>Submit</button>
        </div>
    }


    handleKeyPress = (event) => {
        if (event.key === "Enter") {
            this.handleSubmit();
        }
    }

    handleChange = (event) => {
        this.setState( {
            username: event.target.value
        })
    }

    handleSubmit = (event) => {
        this.props.registerUser(this.state.username);
    }

}
export default RegistrationView;