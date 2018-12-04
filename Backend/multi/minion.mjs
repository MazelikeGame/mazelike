/* global ml */
import http2 from "http2";
import urlLib from "url";
import os from "os";
import startGame from "../game";
import {createServer} from "../server";
import socketio from "socket.io";

const RECONNECT_TIME = 3;

export default function start() {
  // Start the game server
  let server = createServer();
  global.io = socketio(server);

  server.listen(3000, () => {
    ml.logger.info("Server started on port 3000");
  });

  connect();
}

function connect() {
  // Connect to the master
  ml.logger.verbose(`Attempting to connect to ${process.env.MAZELIKE_MASTER}`, ml.tags("intercom"));
  let connection = http2.connect(`${process.env.MAZELIKE_MASTER}:8000`);

  connection.settings({
    enablePush: true
  });

  connection.on("localSettings", () => {
    connection.on("close", () => {
      ml.logger.info(`Attempting to reconnect to ${process.env.MAZELIKE_MASTER} in ${RECONNECT_TIME} seconds`, ml.tags("intercom"));

      setTimeout(connect, RECONNECT_TIME);
    });

    connection.request({
      ":path": "/v1/poll-games",
      "x-extrn-addr": process.env.MAZELIKE_EXTERN_ADDR,
      "x-hostname": os.hostname()
    });

    connection.on("stream", (push, headers) => {
      let url = urlLib.parse(headers[":path"], true);

      if(url.pathname === "/v1/start") {
        startGame(url.query.gameId);
      }
    });
  });
}