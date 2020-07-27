import React from "react";
import LocationsContext from "../util/LocationsContext";
import { CardDeck, CardColumns } from "react-bootstrap";
import LocationCard from "./LocationCard";

class MainPage extends React.Component {
  static contextType = LocationsContext;

  render() {
    if (Object.keys(this.context).length > 3) {
      return (
        <CardColumns className='locationCardDeck'>
          {Object.keys(this.context).map((locationID) => (
            <LocationCard key={locationID} locationID={locationID} />
          ))}
        </CardColumns>
      );
    } else {
      return (
        <CardDeck className='locationCardDeck'>
          {Object.keys(this.context).map((locationID) => (
            <LocationCard key={locationID} locationID={locationID} />
          ))}
        </CardDeck>
      );
    }
  }
}

export default MainPage;
