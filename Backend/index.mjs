/* global io */
// jshint esversion: 6
import sequelize from "./sequelize";
import express from "express";
import http from "http";
import socketio from "socket.io";
import {gameRouter, joinRoute} from "./routes/game.mjs";
import accountRouter from "./routes/accounts.mjs";
import exphbs from "express-handlebars";
import bodyParser from 'body-parser';
import session from 'express-session';
import userMiddleware from "./middleware/accounts";
import sessionStore from "./session-store";
import morgan from 'morgan';
import fs from "fs";
import {setHttpd} from "./managers/manager-single";

const PACKAGE_VERSION = fs.readFileSync("VERSION", "utf8").trim();

let app = express();
let server = http.Server(app);
global.io = socketio(server);
setHttpd(server);

if(process.env.PUBLIC_DIR) {
  app.use("/public", express.static(process.env.PUBLIC_DIR));
}

app.use(express.static("Frontend"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//Note if we add https: cookie: { secure: true }
app.use(session({
  secret: 'mazelike',
  resave: true,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 365 // save cookies for 1 year
  }
}));

//Handlebars
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.set('views', 'Frontend/views');

// Middleware
app.use(userMiddleware);
// request logging
app.use(morgan(":method :status :url (:response-time ms)"));

//Routes
app.use("/game", gameRouter);
app.get("/j/:id", joinRoute);
app.use('/account', accountRouter);

app.get('/', function(req, res) {
  if(req.session.authenticated) {
    res.redirect('/account/dashboard');
  } else {
    res.render('index', { version: PACKAGE_VERSION });
  }
});

let nextId = 0;

io.on("connection", (client) => {
  const id = ++nextId;
  let gameId;

  client.once("ready", (_gameId) => {
    gameId = _gameId;
    client.emit("id", id);
  });

  client.on("position", (pos) => {
    io.emit("set", pos);
  });

  client.on("disconnect", () => {
    if(gameId) {
      io.emit("remove", {id, gameId});
    }
  });
});

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const MAX_RETRIES = 10;
const start = async() => {
  // make several attempts to connect to mysql
  for(let i = 0;; ++i) {
    try {
      await sequelize.authenticate();
      break;
    } catch(err) {
      process.stderr.write(`[${i + 1}/${MAX_RETRIES}] MySql connection failed ${err.message} (retrying in 5s)\n`);
      await sleep(5000);

      if(i === MAX_RETRIES) {
        process.stderr.write(err.stack);
        process.exit(1);
      }
    }
  }

  await sequelize.sync();

  server.listen(3000, () => {
    process.stdout.write("Server started on port 3000\n");
  });
};

// Warn users if the forgot password feature is disabled
if(!process.env.MAILER_EMAIL_ID || !process.env.MAILER_PASSWORD || !process.env.MAILER_SERVICE_PROVIDER) {
  let vars = ["MAILER_EMAIL_ID", "MAILER_PASSWORD", "MAILER_SERVICE_PROVIDER"];

  vars = vars.filter((varName) => {
    return !process.env[varName];
  });
  
  let s = vars.length > 1 ? "s were" : " was";
  vars = vars.join(", ");

  process.stdout.write(
    `Warning: the forgot password feature has been disabled because the ${vars} environment variable${s} not defined\n`
  );
}

start();
