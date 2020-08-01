import React from "react";

import "./OpenClosedIndicator.css";

export default (props) => {
  const color = props.open ? "#2EE85A" : "#FF4542";

  return (
    <div
      className='OpenClosedIndicator'
      style={{ color: color, borderColor: color }}
    >
      {props.open ? "OPEN" : "CLOSED"}
    </div>
  );
};
