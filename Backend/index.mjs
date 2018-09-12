import express from "express";
import http from "http";
import socketio from "socket.io";
import versionRouter from "./routes/version";
import logger from "morgan";

let app = express();
let server = http.Server(app);
let io = socketio(server);

app.use(logger("dev"));
app.use(express.static("Frontend"));

/**
 * Define your top level routes here
 * Then in routes/top_level_route create and export a router as your default export
 * 
 * A top level route is something like /auth which is the parent for several related routes.
 * Ex: /auth/login /auth/logout
 * 
 * See https://expressjs.com/en/guide/routing.html
 */
app.use("/version", versionRouter);

let nextId = 0;

io.on("connection", (client) => {
  const id = ++nextId;

  client.once("ready", () => {
    client.emit("id", id);
  });

  client.on("position", (pos) => {
    io.emit("set", pos);
  });

  client.on("disconnect", () => {
    io.emit("remove", id);
  });
});

server.listen(3000);