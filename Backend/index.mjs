import express from "express";
import http from "http";
import socketio from "socket.io";
import accountRouter from "./routes/accounts.mjs";

let app = express();
let server = http.Server(app);
let io = socketio(server);

app.use(express.static("Frontend"));

app.use('/accounts', accountRouter);

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