import express from "express";
import http from "http";
import socketio from "socket.io";

let app = express();
let server = http.Server(app);
let io = socketio(server);

app.use(express.static("Frontend"));

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

server.listen(3000, () => {
  // eslint-disable no-console
  console.log("Server started on port 3000");
  // eslint-enable
});