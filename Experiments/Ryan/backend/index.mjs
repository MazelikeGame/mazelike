import express from "express";
import http from "http";
import socketio from "socket.io";
import {verifyPassword, hashPassword} from "./asyncFn.mjs";

let app = express();
let server = http.Server(app);
let io = socketio(server);

app.use(express.static("../frontend"));

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

app.get("/set-passwd", async(req, res) => {
  try {
    await hashPassword(req);
    res.writeHead(200, { "type": "text/plain" });
    res.end("Password hashed");
  } catch(err) {
    res.writeHead(500, { "type": "text/plain" });
    res.end(`An error occured ${err.message}`);
  }
});

app.get("/check-passwd", async(req, res) => {
  res.writeHead(200, { "type": "text/plain" });

  if(await verifyPassword(req)) {
    res.end("Password accepted");
  } else {
    res.end("Password invalid");
  }
});

server.listen(3000, "localhost");