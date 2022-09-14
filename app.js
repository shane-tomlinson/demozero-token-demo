const express = require('express');
const path = require('path');
const logger = require('morgan');
const session = require('express-session');
const passport = require("passport");
const flash = require("req-flash");
const bodyParser = require("body-parser");
const routes = require("./routes/index");
const user = require("./routes/user");
const auth0StrategyBuilder = require("./lib/strategies/auth0");
const samlStrategyBuilder = require("./lib/strategies/saml");

module.exports = async () => {
  passport.use(await auth0StrategyBuilder());
  passport.use(await samlStrategyBuilder());

  // you can use this section to keep a smaller payload
  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    done(null, user);
  });

  const app = express();

  app.use(bodyParser.urlencoded({ extended: false }));

  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "jade");
  app.set("view options", { pretty: true });

  app.use(logger("dev"));
  app.use(
    session({
      secret: "yourSessionSecret",
      resave: true,
      saveUninitialized: true,
    })
  );
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.static(path.join(__dirname, "public")));

  app.use(function authErrorHandler(req, res, next) {
    if (req && req.query && req.query.error) {
      req.flash("error", req.query.error);
    }
    if (req && req.query && req.query.error_description) {
      req.flash("error_description", req.query.error_description);
    }
    next();
  });

  app.use("/", routes);
  app.use("/user", user);

  app.use(function catch404Error(req, res, next) {
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
  });

  if (app.get("env") === "development") {
    app.use(function devErrorHandler(err, req, res, next) {
      // TODO: A better way to output diagnostic info in the console
      console.log(err.data);
      res.status(err.status || 500);
      res.render("error", {
        message: err.message,
        error: err,
      });
    });
  }

  app.use(function prodErrorHandler(err, req, res, next) {
    // TODO: What makes to log in production?
    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      error: {},
    });
  });

  return app;
};
