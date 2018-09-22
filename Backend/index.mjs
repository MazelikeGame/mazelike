import express from "express";
import http from "http";
import socketio from "socket.io";
import {gameRouter, joinRoute} from "./routes/game.mjs";
import exphbs from "express-handlebars";
// import bodyParser from 'body-parser';

let app = express();
let server = http.Server(app);
let io = socketio(server);

app.use(express.static("Frontend"));
// app.use(bodyParser.urlencoded({extended: true}));
// app.use(bodyParser.json());

//Handlebars
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.set('views', 'Frontend/views');

//Routes
app.use("/game", gameRouter);
app.get("/j/:id", joinRoute);

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