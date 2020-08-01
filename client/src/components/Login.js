import React from "react";
import parameterize from "../util/parameterize";
import callAPI from "../util/callAPI";
import LocationsContext from "../util/LocationsContext";

import { Form, Row, Col, Button, Alert } from "react-bootstrap";

import "./Login.css";

// A Login Component for the admins, with locationID and password.
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

  static contextType = LocationsContext;

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
      <Form className='Login'>
        <Form.Group as={Row} controlId='locationID'>
          <Form.Label column sm={3}>
            Location:
          </Form.Label>
          <Col sm={4}>
            <Form.Control ref={this.locationID} as='select'>
              {Object.entries(this.context).map(([id, { name }]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </Form.Control>
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId='password'>
          <Form.Label column sm={3}>
            Admin Password:
          </Form.Label>
          <Col sm={4}>
            <Form.Control ref={this.password} type='password' />
          </Col>
        </Form.Group>
        {this.state.error && (
          <Alert variant='danger'>{this.state.error.message}</Alert>
        )}
        <Button variant='primary' type='submit' onClick={this.handleSubmit}>
          Submit
        </Button>
      </Form>
    );
  }
}

export default Login;
