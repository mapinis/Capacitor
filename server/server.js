require("dotenv").config();

/* Build Server */
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

const app = express();
const http = require("http").createServer(app);

app.use(require("morgan")("dev"));
app.use(
  require("express-session")({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: !process.env.DEV,
    },
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Allow CORS if dev for React test server
if (process.env.DEV) {
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", req.get("origin") || "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type"); // or Authorization ?
    res.setHeader("Access-Control-Allow-Credentials", true);
    next();
  });
}

// set up authentication
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

let adminHash = process.env.ADMIN_HASH;

if (!adminHash) {
  console.warn("ADMIN_HASH not set in .env, defaulting to 'admin'");
  adminHash = "$2b$10$qYh3lwkmVIIPSK5TgirU5ONT/OyFdG4Jerp3YRjand9WE/nHTbKdK";
}

const { v1: uuid } = require("uuid");
const sessions = new Map();

passport.use(
  new LocalStrategy(
    {
      usernameField: "locationID",
    },
    async (locationID, password, done) => {
      // the 'username' here is just the location id of the location being edited

      if (!(locationID in locations)) {
        return done(null, false, {
          message: "Unknown location ID as username",
        });
      }

      return bcrypt.compare(password, adminHash, (err, match) => {
        if (err) {
          return done(null, false, { message: err });
        }

        if (!match) {
          return done(null, false, { message: "Incorrect credentials" });
        }

        const id = uuid();
        sessions.set(id, locationID);
        return done(null, { id: id, locationID: locationID });
      });
    }
  )
);

app.use(passport.initialize());

// sessions
app.use(passport.session());

passport.serializeUser((user, done) => {
  return done(null, user.id);
});

passport.deserializeUser((id, done) => {
  if (sessions.has(id)) {
    return done(null, { id: id, locationID: sessions.get(id) });
  }

  return done(null, false, { message: "Deserialization error" });
});

/* LOAD DATA */
const locations = require("./loadLocationData")();

/* SOCKET */
const io = require("socket.io")(http);

io.on("connection", (socket) => {
  // send initial data to client
  socket.emit("title", process.env.TITLE || "Capacitor");
  socket.emit("locations", locations);
});

/* ENDPOINTS */
// Login with locationID and admin password
app.post("/api/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    if (!user) {
      return res.status(401).json({ error: info });
    }

    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: err });
      }

      console.log("INFO: Admin logged in from " + req.ip);
      return res.status(200).send();
    });
  })(req, res, next);
});

// Lot out a user
app.post("/api/logout", (req, res, next) => {
  passport.authenticate("local", (err) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    if (!req.user) {
      return res.status(401).json({ error: { message: "Not Logged in." } });
    }

    sessions.delete(req.user.id);
    req.logout();
    return res.status(200).send();
  })(req, res, next);
});

// Check the user is logged in and return the locationID if so
app.get("/api/getLocationID", (req, res, next) => {
  passport.authenticate("local", (err) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    if (!req.user) {
      return res.status(401).json({ error: { message: "Not Logged in." } });
    }

    return res.status(200).json({ locationID: req.user.locationID });
  })(req, res, next);
});

// Add one to the population of the admin's location
app.post("/api/addOne", (req, res, next) => {
  passport.authenticate("local", (err) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    if (!req.user) {
      return res.status(401).json({ error: { message: "Not logged in." } });
    }

    const locationID = req.user.locationID;

    if (!locations[locationID]) {
      return res
        .status(400)
        .json({ error: { message: "Bad user locationID" } });
    }

    // should locations be allowed to go over capacity? legally of course not, but what if some scenario it does happen, should this still keep track?
    if (
      locations[locationID].population != locations[locationID].capacity &&
      locations[locationID].open
    ) {
      // actually add one to population now
      locations[locationID].population += 1;
      io.emit("update", {
        [locationID]: {
          population: locations[locationID].population,
        },
      });
    }

    return res.status(200).send();
  })(req, res, next);
});

// Subtract one from the population of the admin's location
app.post("/api/subOne", (req, res, next) => {
  passport.authenticate("local", (err) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    if (!req.user) {
      return res.status(401).json({ error: { message: "Not logged in." } });
    }

    const locationID = req.user.locationID;

    if (!locations[locationID]) {
      return res
        .status(400)
        .json({ error: { message: "Bad user locationID" } });
    }

    // actually sub one from population now
    if (locations[locationID].population != 0 && locations[locationID].open) {
      locations[locationID].population -= 1;
      io.emit("update", {
        [locationID]: {
          population: locations[locationID].population,
        },
      });
    }

    return res.status(200).send();
  })(req, res, next);
});

// Set the population of the admin's location, with the set value being in the request body under "newPops"
app.post("/api/setPopulation", (req, res, next) => {
  passport.authenticate("local", (err) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    if (!req.user) {
      return res.status(401).json({ error: { message: "Not logged in." } });
    }

    if (!req.body.newPop) {
      return res.status(400).json({
        error: {
          message:
            "Requires JSON body property 'newPop' with the new population number.",
        },
      });
    }

    if (!req.body.newPop.match(/\d+/)) {
      return res.status(400).json({
        error: {
          message:
            "JSON body property 'newPop' must be a non-negative integer.",
        },
      });
    }

    const locationID = req.user.locationID;
    const newPop = Number.parseInt(req.body.newPop);

    if (!locations[locationID]) {
      return res.status(400).json({ error: { message: "Bad locationID" } });
    }

    if (newPop < 0 || newPop > locations[locationID].capacity) {
      return res.status(400).json({
        error: {
          message:
            "Invalid new population amount, either less than 0 or larger than capacity",
        },
      });
    }

    if (locations[locationID].open) {
      // actually set population now
      locations[locationID].population = newPop;
      io.emit("update", {
        [locationID]: {
          population: newPop,
        },
      });
    }

    return res.status(200).send();
  })(req, res, next);
});

// Toggle open/close of the admin's location
app.post("/api/toggleOpen", (req, res, next) => {
  passport.authenticate("local", (err) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    if (!req.user) {
      return res.status(401).json({ error: { message: "Not logged in." } });
    }

    const locationID = req.user.locationID;

    if (!locations[locationID]) {
      return res
        .status(400)
        .json({ error: { message: "Bad user locationID" } });
    }

    // actually change open status now
    locations[locationID].open = !locations[locationID].open;
    locations[locationID].population = 0;
    io.emit("update", {
      [locationID]: {
        open: locations[locationID].open,
        population: 0,
      },
    });

    return res.status(200).send();
  })(req, res, next);
});

// serve frontend
const path = require("path");
app.use(express.static(path.join(__dirname, "../client/build")));

app.get("/img/*", (req, res) => {
  res.sendFile(path.join(__dirname, req.url));
});

app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

// RUN IT
const port = process.env.PORT || 8080;
http.listen(port, () => {
  console.log("Server listening on " + port);
});
