import React from "react";

import "./Header.css";
import { Link } from "react-router-dom";

export default (props) => (
  <div className='Header'>
    <div className='HeaderContent'>
      <Link to='/'>{props.title}</Link>
    </div>
  </div>
);
