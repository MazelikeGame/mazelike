/* eslint-disable no-param-reassign,complexity */
import socketIO from "socket.io";
import http from "http";
import Floor from "./game/floor";
import saveHandler from "./handlers/save";
import movementHandler from "./handlers/player-movement";
import initAuth from "./game-auth.mjs";
import path from "path";

export default async function main(env, httpd) {
  // Parse the env vars
  const PORT = +process.env.MAZELIKE_port;
  const MAZELIKE_ENV = /^MAZELIKE_(.+)/;
  let gameEnv = env;

  if(env === process.env) {
    gameEnv = {};

    for(let key of Object.keys(env)) {
      let match = key.match(MAZELIKE_ENV);
      if(match) {
        gameEnv[match[1]] = env[key];
      }
    }
  }

  // Load/generate the ground floor
  let floor = await Floor.load(gameEnv.gameId, 0);

  // Create the socket.io server
  if(!isNaN(PORT)) {
    httpd = http.createServer((req, res) => {
      res.end("Game server");
    }).listen(PORT, () => {
      process.stdout.write(`Game server listening on ${PORT}\n`);
    });

    // tell the manager this port is in use
    httpd.on("error", (err) => {
      if(err.errno === "EADDRINUSE") {
        process.exit(198);
      }
    });
  }

  let io = socketIO(httpd, {
    path: `/socket/${gameEnv.gameId}`
  });

  initAuth(io);

  io.on("connection", (sock) => {
    sock.emit("set-username", sock.user.username);
    saveHandler(sock, floor);
    movementHandler(sock, floor, io);
  });

  // In the future we should wait for all players to join here

  // start the count down
  for(let i = 5; i > 0; --i) {
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

    io.emit("countdown", i);
  }

  // start the game
  await floor.sendState(io);
  io.emit("start-game");

  triggerTick(floor, io, Date.now());
}

async function triggerTick(floor, io, lastUpdate) {
  let now = Date.now();

  // save and quit if we loose all the clients
  if(io.engine.clientsCount === 0) {
    await floor.save();

    if(process.env.CLUSTER_MANAGER === "single") {
      return;
    }

    process.exit(0);
  }

  // move monsters and check for collisions
  try {
    await floor.tick(now - lastUpdate);
    await floor.sendState(io);
  } catch(err) {
    process.stderr.write(`${err.stack}\n`);
  }

  setTimeout(triggerTick.bind(undefined, floor, io, now), Floor.UPDATE_INTERVAL);
}

if(path.relative(process.cwd(), process.argv[1]) === "Backend/game.mjs") {
  main(process.env);
}
