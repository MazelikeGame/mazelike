import express from "express";
import http from "http";
import socketio from "socket.io";
import accountRouter from "./routes/accounts.mjs";
import exphbs from "express-handlebars";

let app = express();
let server = http.Server(app);
let io = socketio(server);

app.use(express.static("Frontend"));

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.set('views', 'Frontend/views');

app.use('/account', accountRouter);

app.get('/testing', (req, res) => {
  res.render('login');
});

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