import React from "react";

import "./Header.css";
import { Link, useHistory } from "react-router-dom";
import { Button } from "react-bootstrap";
import { BrowserView } from "react-device-detect";

const Header = (props) => {
  const history = useHistory();

  return (
    <div className='Header'>
      <div className='HeaderContent'>
        <Link to='/'>{props.title}</Link>
        <BrowserView>
          <Button
            variant='outline-light'
            onClick={() => history.push("/admin")}
          >
            Admin Login
          </Button>
        </BrowserView>
      </div>
    </div>
  );
};

export default Header;
