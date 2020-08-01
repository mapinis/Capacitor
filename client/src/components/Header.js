import React from "react";

import "./Header.css";
import { Link, useHistory } from "react-router-dom";
import { Button } from "react-bootstrap";

const Header = (props) => {
  const history = useHistory();

  // TODO hide admin login button in mobile
  return (
    <div className='Header'>
      <div className='HeaderContent'>
        <Link to='/'>{props.title}</Link>
        <Button variant='outline-light' onClick={() => history.push("/admin")}>
          Admin Login
        </Button>
      </div>
    </div>
  );
};

export default Header;
