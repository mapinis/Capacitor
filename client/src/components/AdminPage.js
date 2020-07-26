import React from "react";
import Login from "./Login";

class AdminPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      locationID: null,
    };
  }

  handleLogin(locationID) {
    this.setState({
      locationID: locationID,
    });
  }

  render() {
    return (
      <div className='AdminPage'>
        {!this.state.locationID && (
          <Login onSuccess={this.handleLogin.bind(this)} />
        )}
        {this.state.locationID && <h1>Admin {this.state.locationID}</h1>}
      </div>
    );
  }
}

export default AdminPage;
