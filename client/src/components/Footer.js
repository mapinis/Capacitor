import dotenv from "dotenv";
import React from "react";
import { isBrowser } from "react-device-detect";

import "./Footer.css";

dotenv.config();

// hacky but the only solution I see
const Footer = () => (
  <div style={isBrowser ? { bottom: 0 } : {}} className='Footer'>
    <div className='FooterContent'>
      <div className='FooterInner'>
        <b>Capacitor</b>, made by{" "}
        <a href='https://github.com/mapinis'>Mark Apinis</a> under the MIT
        license.{" "}
        <a href='https://github.com/mapinis/capacitor'>Source on GitHub.</a>
        <br />
        {process.env.REACT_APP_DEMO && (
          <>
            DISCLAIMER: This tech demo is not representative of actual
            capacities, populations, or open/closed states.
            <br />
          </>
        )}
        Copyright © Mark Apinis 2020
      </div>
    </div>
  </div>
);

export default Footer;
