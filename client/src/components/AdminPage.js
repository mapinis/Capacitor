import React from "react";
import Login from "./Login";
import { callAPIJSON } from "../util/callAPI";
import LocationsContext from "../util/LocationsContext";

class AdminPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      locationID: null,
    };

    this.handleLogin = this.handleLogin.bind(this);
    this.handleAddOne = this.handleToggleOpen.bind(this);
  }

  static contextType = LocationsContext;

  handleLogin(locationID) {
    this.setState({
      locationID: locationID,
    });
  }

  handleToggleOpen(event) {
    event.preventDefault();

    callAPIJSON("toggleOpen", { method: "POST" }).then((res) => {
      if (res.error) {
        alert(res.error.message);
      }
    });
  }

  render() {
    return (
      <div className='AdminPage'>
        {!this.state.locationID && <Login onSuccess={this.handleLogin} />}
        {this.state.locationID && (
          <div>
            <h1>Admin {this.state.locationID}</h1>
            <h3>
              Open:{" "}
              {this.context[this.state.locationID].open ? "true" : "false"}
            </h3>
            <button onClick={this.handleToggleOpen}>Toggle Open</button>
          </div>
        )}
      </div>
    );
  }
}

export default AdminPage;
