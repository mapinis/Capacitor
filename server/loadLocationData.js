const fs = require("fs");

function loadLocations() {
  if (!fs.existsSync("data.json")) {
    console.error("No data.json file in server directory.");
    process.exit();
  }

  const locationData = JSON.parse(fs.readFileSync("data.json"));
  for (let locationID in locationData) {
    locationData[locationID].population = 0;
    locationData[locationID].open = false;
    // here is where we load image(s) from Google Maps API too
  }

  return locationData;
}

module.exports = loadLocations;
