require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

/* Build Server */

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

const passport = requrie("passport");
const LocalStrategy = require("passport-local").Strategy;

// set up authentication

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
