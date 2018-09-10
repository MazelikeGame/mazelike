const createError = require("http-errors");
const express = require("express");
const logger = require("morgan");
const path = require("path");
const session = require("express-session");

const dashboardRouter = require("./routes/dashboard");
const publicRouter = require("./routes/public");
const usersRouter = require("./routes/users");
const loginRouter = require("./routes/login");


// App initialization
const app = express();
app.use(session({
  key: 'user_sid',
  secret: 'somerandomstuffs',
  resave: false,
  saveUnitialized: false,
  cookie: {
    expires: 600000
  }
}));


/* 8 is the length of string '/backend' */
var projectDir = __dirname.substring(0, __dirname.length - 8);
var frontendDir = projectDir.concat('/Frontend');
app.set("views", path.join(frontendDir, "views"));
app.set("view engine", "pug");

// Middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('../Frontend'));
// app.use(express.static(path.join(frontendDir, "public")));

// Routes
app.use('/', publicRouter);
app.use('/login', loginRouter);
app.use('/dashboard', dashboardRouter);
app.use('/users', usersRouter);

// Error handlers
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});


module.exports = app;
