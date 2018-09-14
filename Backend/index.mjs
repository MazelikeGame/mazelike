import express from "express";
import http from "http";
import socketio from "socket.io";
import accountRouter from "./routes/accounts.mjs";

let app = express();
let server = http.Server(app);
let io = socketio(server);
app.use(express.static("Frontend"));

app.set('view engine', 'handlebars'); //Need to install handlebars

app.use('/account', accountRouter);

let nextId = 0;

io.on("connection", (client) => {
  const id = ++nextId;

  client.once("ready", () => {
    client.emit("id", id);
  });

  client.on("position", (pos) => {
    io.emit("setR", pos);
  });

  client.on("disconnect", () => {
    io.emit("remove", id);
  });
});

server.listen(3000);