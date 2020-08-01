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

    if (locationData[locationID].coordinates) {
      if (!process.env.GMAPS_STATIC_API_KEY) {
        console.warn(
          "Warning: Coordinates for " +
            locationData[locationID].name +
            " provided without environment variable GMAPS_STATIC_API_KEY, using placeholder image instead."
        );

        // this could go wrong if someone's locationID is "placeholder" while also providing *actual* coordinates
        // I think if someone actually does that, they deserve the pain, but at the same time I hope it never does
        locationData[locationID].imagePath = "/img/placeholder.jpg";
      }

      // TODO get image from google here
      locationData[locationID].imagePath = "/img/placeholder.jpg";
    }
  }

  return locationData;
}

module.exports = loadLocations;
