import React from "react";
import LocationsContext from "../util/LocationsContext";
import { CardDeck } from "react-bootstrap";
import LocationCard from "./LocationCard";

class MainPage extends React.Component {
  static contextType = LocationsContext;

  render() {
    return (
      <CardDeck className='locationCardDeck'>
        {Object.keys(this.context).map((locationID) => (
          <LocationCard key={locationID} locationID={locationID} />
        ))}
      </CardDeck>
    );
  }
}

export default MainPage;
