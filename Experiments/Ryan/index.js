const express = require("express");

let app = express();
let server = require("http").Server(app);
let io = require("socket.io")(server);

app.use(express.static(__dirname));

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

server.listen(3000, "localhost");