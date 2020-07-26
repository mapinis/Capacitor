import React from "react";
import LocationsContext from "../util/LocationsContext";

class MainPage extends React.Component {
  static contextType = LocationsContext;

  render() {
    return (
      <div>
        {Object.entries(this.context).map(([locationID, locationData]) => (
          <div key={locationID}>
            <h3>{locationID}</h3>
            <h1>{locationData.name}</h1>
            <h3>Open: {locationData.open ? "true" : "false"}</h3>
            <h3>Capacity: {locationData.capacity}</h3>
            <h3>Population: {locationData.population}</h3>
            <br />
            <br />
          </div>
        ))}
      </div>
    );
  }
}

export default MainPage;
