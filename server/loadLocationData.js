const fs = require("fs");
const fetch = require("node-fetch");

function loadLocations() {
  if (!fs.existsSync("data.json")) {
    console.error("No data.json file in server directory.");
    process.exit(-1);
  }

  const locationData = JSON.parse(fs.readFileSync("data.json"));
  for (let locationID in locationData) {
    // "placeholder" is a reserved word for the placeholder image
    if (locationID === "placeholder") {
      console.error("Data includes reserved ID 'placeholder'");
      process.exit(-1);
    }

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
        locationData[locationID].imagePath = "img/placeholder.jpg";
      } else {
        // to save calls on API, only fetch the image if the image doesn't exist
        // this also allows for custom images by simply placing an image with the name "{locationID}.jpg" in the image folder
        if (!fs.existsSync(`img/${locationID}.jpg`)) {
          const { lat, lng } = locationData[locationID].coordinates;
          const url = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&format=jpg&size=500x350&key=${process.env.GMAPS_STATIC_API_KEY}`;

          fetch(url)
            .then((res) => res.arrayBuffer())
            .then((imageBuffer) => {
              fs.open(`img/${locationID}.jpg`, "w", (err, fd) => {
                if (err) {
                  console.error(err);
                  process.exit(-1);
                }

                fs.writevSync(fd, [new Uint8Array(imageBuffer)], 0);
              });
            });
        }

        locationData[locationID].imagePath = `img/${locationID}.jpg`;
      }
    }
  }

  return locationData;
}

module.exports = loadLocations;
