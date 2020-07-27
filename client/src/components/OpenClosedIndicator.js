import React from "react";

import "./OpenClosedIndicator.css";

export default (props) => {
  const color = props.open ? "#33FF64" : "#FF4542";

  return (
    <div
      className='OpenClosedIndicator'
      style={{ color: color, borderColor: color }}
    >
      {props.open ? "OPEN" : "CLOSED"}
    </div>
  );
};
