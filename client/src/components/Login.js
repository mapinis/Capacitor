import React from "react";
import parameterize from "../util/parameterize";
import callAPI from "../util/callAPI";

// A Login Component for the admins, with locationID and password.
// TODO: use the context to have a drop down of location IDs
//  - Optional prop 'onSuccess' expects a function that takes in the location ID that was logged in under
//  - Option prop 'onFailure' expects a function that takes in an error object
class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
    };

    this.locationID = React.createRef();
    this.password = React.createRef();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();

    callAPI(
      "login" +
        parameterize({
          locationID: this.locationID.current.value,
          password: this.password.current.value,
        }),
      { method: "POST" }
    ).then((res) => {
      if (res.status !== 200) {
        return res.json().then((json) => {
          this.setState({
            error: json.error,
          });

          if (this.props.onFailure) {
            this.props.onFailure(json.error);
          }
        });
      }

      if (this.props.onSuccess) {
        this.props.onSuccess(this.locationID.current.value);
      }
    });
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>
            Location ID:
            <input type='text' ref={this.locationID} />
          </label>
          <label>
            Password:
            <input type='password' ref={this.password} />
          </label>
          <input type='submit' value='Submit' />
        </form>
        {this.state.error && (
          <div style={{ color: "red" }}>{this.state.error.message}</div>
        )}
      </div>
    );
  }
}

export default Login;
