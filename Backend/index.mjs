import express from "express";
import http from "http";
import socketio from "socket.io";
import accountRouter from "./routes/accounts.mjs";
import exphbs from "express-handlebars";
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

let app = express();
let server = http.Server(app);
let io = socketio(server);

dotenv.config();
app.use(express.static("Frontend"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//Handlebars
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.set('views', 'Frontend/views');

//Routes
app.use('/account', accountRouter);

/*
sql.authenticate().then(() => {
  console.log('Connection has been established successfully.');
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});*/

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