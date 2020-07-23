require("dotenv").config();

/* Build Server */
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
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
const passport = requrie("passport");
const LocalStrategy = require("passport-local").Strategy;

const adminUsername = process.env.ADMIN_USERNAME;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminUsername) {
  console.warn("ADMIN_USERNAME not set in .env, defaulting to 'admin'");
  adminUsername = "admin";
}

if (!adminPassword) {
  console.warn("ADMIN_PASSWORD not set in .env, defaulting to 'admin'");
  adminPassword = "admin";
}

passport.use(
  new LocalStrategy(async (username, password, done) => {
    // yea sure a username isn't really needed, but in the end having two fields will make people feel better,
    // and if I eventually seperate into multiple admin accounts, it will be useful.

    if (username === adminUsername && password === adminPassword) {
      console.log("Admin successfully logged in");
      return done(null, true);
    }

    return done(null, false, { message: "Incorrect Credentials" });
  })
);

app.use(passport.initialize());

// sessions

const uuid = require("uuid/v1");
const sessionIDs = [];

app.use(passport.session());

passport.serializeUser((_, done) => {
  const id = uuid();
  sessionIDs.push(id);
  return done(null, id);
});

passport.deserializeUser((id, done) => {
  if (sessionIDs.includes(id)) {
    sessionIDs.splice(sessionIDs.indexOf(id), 1);
    return done(null, true);
  }

  return done(null, false, { message: "Deserialization error" });
});

// might need user serialization for session to work

/* LOAD DATA */
const locations = require("./loadLocationData")();

/* SOCKET */
const io = require("socket.io")(app);

io.on("connection", (socket) => {
  // send initial data to client
  socket.emit("locations", locations);
});

/* ENDPOINTS */
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

      return res.status(200);
    });
  })(req, res, next);
});

app.get("/api/validateSession", (req, res, next) => {
  passport.authenticate("session", (err) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    if (!req.user) {
      return res.status(200).json({ validSession: false });
    }

    return res.status(200).json({ validSession: true });
  })(req, res, next);
});

app.post("/api/addOne", (req, res, next) => {
  passport.authenticate("session", (err) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    if (!req.user) {
      return res.status(401).json({ error: { message: "Not logged in." } });
    }

    if (!req.body.locationID) {
      return res.status(400).json({
        error: {
          message:
            "Requires JSON body property 'locationID' with id of location being edited.",
        },
      });
    }

    const locationID = req.body.locationID;

    if (!locations[locationID]) {
      return res.status(400).json({ error: { message: "Bad locationID" } });
    }

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

    return res.status(200);
  })(req, res, next);
});

app.post("/api/subOne", (req, res, next) => {
  passport.authenticate("session", (err) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    if (!req.user) {
      return res.status(401).json({ error: { message: "Not logged in." } });
    }

    if (!req.body.locationID) {
      return res.status(400).json({
        error: {
          message:
            "Requires JSON body property 'locationID' with id of location being edited.",
        },
      });
    }

    const locationID = req.body.locationID;

    if (!locations[locationID]) {
      return res.status(400).json({ error: { message: "Bad locationID" } });
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

    return res.status(200);
  })(req, res, next);
});

app.post("/api/setPopulation", (req, res, next) => {
  passport.authenticate("session", (err) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    if (!req.user) {
      return res.status(401).json({ error: { message: "Not logged in." } });
    }

    if (!req.body.locationID || !req.body.newPop) {
      return res.status(400).json({
        error: {
          message:
            "Requires JSON body properties 'locationID' with id of location being edited and 'newPop' with the new population number.",
        },
      });
    }

    const locationID = req.body.locationID;
    const newPop = req.body.newPop;

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

    return res.status(200);
  })(req, res, next);
});

app.post("/api/toggleOpen", (req, res, next) => {
  passport.authenticate("session", (err) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    if (!req.user) {
      return res.status(401).json({ error: { message: "Not logged in." } });
    }

    if (!req.body.locationID) {
      return res.status(400).json({
        error: {
          message:
            "Requires JSON body property 'locationID' with id of location being edited.",
        },
      });
    }

    const locationID = req.body.locationID;

    if (!locations[locationID]) {
      return res.status(400).json({ error: { message: "Bad locationID" } });
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

    return res.status(200);
  })(req, res, next);
});

// serve frontend
const path = require("path");
app.use(express.static(path.join(__dirname, "client/build")));

app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

// RUN IT
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("Server listening on " + port);
});
