/* global ml io */
/* eslint-disable complexity */
// jshint esversion: 6
import sequelize from "./sequelize";
import express from "express";
import {createServer, appPort} from "./server";
import socketio from "socket.io";
import {gameRouter, joinRoute} from "./routes/game.mjs";
import accountRouter from "./routes/accounts.mjs";
import exphbs from "express-handlebars";
import bodyParser from 'body-parser';
import userMiddleware from "./middleware/accounts";
import fs from "fs";
import {sessionMiddleware} from "./game-auth.mjs";
import morgan from "morgan";

export default async function startMaster() {
  const PACKAGE_VERSION = fs.readFileSync("VERSION", "utf8").trim();

  let app = express();
  let server = createServer(app);
  global.io = socketio(server);

  io.of(`/lobby`).on("connection", () => {});

  // Log http requests
  app.use(morgan(":method :url :status :res[content-length] - :response-time ms", {
    stream: {
      write(data) {
        ml.logger.verbose(data.trim(), ml.tags("http"));
      }
    }
  }));

  if(process.env.PUBLIC_DIR) {
    app.use("/public", express.static(process.env.PUBLIC_DIR));
  }

  app.use("/docs", express.static("Documents"));
  app.use(express.static("Frontend"));
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());

  app.use(sessionMiddleware);

  //Handlebars
  app.engine('handlebars', exphbs());
  app.set('view engine', 'handlebars');
  app.set('views', 'Frontend/views');

  // Middleware
  app.use(userMiddleware);

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

  // Warn users if the forgot password feature is disabled
  if(!process.env.MAILER_EMAIL_ID || !process.env.MAILER_PASSWORD || !process.env.MAILER_SERVICE_PROVIDER) {
    let vars = ["MAILER_EMAIL_ID", "MAILER_PASSWORD", "MAILER_SERVICE_PROVIDER"];

    vars = vars.filter((varName) => {
      return !process.env[varName];
    });
    
    let s = vars.length > 1 ? "s were" : " was";
    vars = vars.join(", ");

    ml.logger.warn(
      `The forgot password feature has been disabled because the ${vars} environment variable${s} not defined`
    );
  }

  await sequelize.sync();

  server.listen(appPort, () => {
    ml.logger.info(`Server started on port ${appPort}`);
  });
}