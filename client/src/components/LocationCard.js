import React from "react";
import LocationsContext from "../util/LocationsContext";
import OpenClosedIndicator from "./OpenClosedIndicator";
import { Card } from "react-bootstrap";

import "./LocationCard.css";

class LocationCard extends React.Component {
  static contextType = LocationsContext;

  render() {
    const locationData = this.context[this.props.locationID];

    return (
      <Card className='locationCard' border='secondary'>
        <Card.Body>
          <Card.Title>{locationData.name}</Card.Title>
          <OpenClosedIndicator open={locationData.open} />
          <Card.Text style={{ opacity: locationData.open ? 1 : 0.25 }}>
            Capacity: {locationData.capacity}
            <br />
            Population: {locationData.population} (
            {((locationData.population * 100) / locationData.capacity).toFixed(
              0
            )}
            %)
          </Card.Text>
        </Card.Body>
      </Card>
    );
  }
}

export default LocationCard;
