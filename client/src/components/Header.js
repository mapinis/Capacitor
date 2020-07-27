import React from "react";

import "./Header.css";
import { Link, Redirect } from "react-router-dom";
import { Button } from "react-bootstrap";

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      redirect: false,
    };
  }

  render() {
    if (this.state.redirect) {
      return (
        <Redirect to={this.state.redirect}>
          {this.setState({ redirect: false })}
        </Redirect>
      );
    }

    return (
      <div className='Header'>
        <div className='HeaderContent'>
          <Link to='/'>{this.props.title}</Link>
          <Button
            variant='outline-light'
            onClick={() => this.setState({ redirect: "/admin" })}
          >
            Admin Login
          </Button>
        </div>
      </div>
    );
  }
}

export default Header;
