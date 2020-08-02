import React from "react";
import LocationsContext from "../util/LocationsContext";
import OpenClosedIndicator from "./OpenClosedIndicator";
import { Card } from "react-bootstrap";

import "./LocationCard.css";

class LocationCard extends React.Component {
  static contextType = LocationsContext;

  rgbToHex = (r, g, b) =>
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("");

  lowColor = [88, 255, 127];
  highColor = [255, 28, 27];

  render() {
    const locationData = this.context[this.props.locationID];

    const ratio = locationData.population / locationData.capacity;

    const percent = (ratio * 100).toFixed(0);

    const color = !locationData.open
      ? "#000"
      : this.rgbToHex(
          ...this.lowColor.map((c, i) =>
            Math.round(c * (1 - ratio) + this.highColor[i] * ratio)
          )
        );

    return (
      <Card className='locationCard' border='secondary'>
        {locationData.imagePath && locationData.coordinates && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${locationData.coordinates.lat},${locationData.coordinates.lng}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            <Card.Img
              variant='top'
              src={
                (process.env.REACT_APP_DEV ? "http://localhost:8080/" : "") +
                locationData.imagePath
              }
            />
          </a>
        )}
        <Card.Body>
          <Card.Title>{locationData.name}</Card.Title>
          <OpenClosedIndicator open={locationData.open} />
          <Card.Text style={{ opacity: locationData.open ? 1 : 0.25 }}>
            Capacity: {locationData.capacity}
            <br />
            Population: {locationData.population} (
            <span
              style={{
                color: color,
              }}
            >
              {percent}%
            </span>
            )
          </Card.Text>
        </Card.Body>
      </Card>
    );
  }
}

export default LocationCard;
