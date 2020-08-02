# Capacitor

An easy website for live view of location capacity and open/closed state, with a simple and clean design that updates immediately for all viewers.

Demo live at https://capacitor-demo.herokuapp.com/, with admin password set to 'admin'.

Inspired by the tragically growing need for online capacity and population trackers, Capacitor is an easy-to-use and accessible utility that can be quickly configured for any use case. Simply provide a `server/data.json` file with location data, and optionally environment variables for a title, admin password hash, session secret, port, and Google Maps Static API Key, then just build and run. Capacitor will dynamically create the pages seen below and allow for easy population editing by staff.

Sample data in this repository refers to my town's pools, whose struggling capacity website desperately needed a refresh.

---

## Screenshots (with sample data)

Main Page:

![Main Page](https://imgur.com/wTHEO1b.png)

Admin Page:

![Admin Page](https://i.imgur.com/pCVP2BV.png)

---

## Configuration

Capacitor reads from `server/data.json`, which expects a JSON object with the following structure:

```
{
  "{Location ID}": {
    "name": "{Location Name}",
    "capacity": {Capacity (integer)},
    (optional) "coordinates": {
      "lat": {Location Latitude (number)},
      "lng": {Location Longitude (number)}
    }
  },
  ...
}
```

Capacitor supports as many locations as you would need, but duplicating location ID will lead to overwriting of the previous location with the following one. Additionally a Location ID of "placeholder" is prohibited.

Coordinates for the location are optional, but providing them will allow users to easily click on the location's card image to open a Google maps tab. If the environment variable `GMAPS_STATIC_API_KEY` is provided, the image for the card will be a map of the area around the location, not just a placeholder.

### Environment Variables

Capacitor also optionally supports multiple environment variables, which should be placed in `server/.env`.

- `ADMIN_HASH`: The bcrypt 10-salt-round hash for the admin password that staff will use to log in and edit the population and open/closed states. Defaults to the hash for "admin".
- `GMAPS_STATIC_API_KEY`: The API key that Capacitor will use to generate map images for location cards. One request under this key will be made per location at server startup, and then the images are saved on the server. If not provided, any locations with coordinates will instead have their images be placeholders.
- `PORT`: The port that Capacitor will run on. Defaults to 8080.
- `SESSION_SECRET`: The secret for authenticated sessions. Defaults to undefined, which is not very secure at all.
- `TITLE`: The title for this Capacitor, which will be visible in the page header and in the tab title. Defaults to "Capacitor".

---

## Running

After configuration, simply run the "build" and "start" scripts from package.json with `yarn build && yarn start`. This will build the client and then start the server.

---

## Development

Any and all contributions are welcome. If you want to work on Capacitor, it is recommended that you use the React development server. In this case, `server/.env` must include `DEV=true` and `client/.env` must include `REACT_APP_DEV=true`. Then, you can start development by first running the server with `yarn start` in the repository's root directory and then also concurrently running the React development server by running `cd client && yarn start`.

---

Thank you and enjoy!

Copyright © Mark Apinis 2020
