import socketIO from "socket.io";
import http from "http";
import Floor from "./game/floor";
import saveHandler from "./handlers/save";

async function main() {
  // Parse the env vars
  const PORT = +process.argv[2];
  const MAZELIKE_ENV = /^MAZELIKE_(.+)/;
  let gameEnv = {};

  for(let key of Object.keys(process.env)) {
    let match = key.match(MAZELIKE_ENV);
    if(match) {
      gameEnv[match[1]] = process.env[key];
    }
  }

  // Load/generate the ground floor
  let floor = await Floor.load(gameEnv.gameId, 0);

  // Create the socket.io server
  let httpd = http.createServer((req, res) => {
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

  let io = socketIO(httpd); 

  io.on("connection", (sock) => {
    saveHandler(sock, floor);
  });
}

main();

// don't run forever (keep until ganes exit on their own)
setTimeout(() => {
  process.exit(0);
}, 60000);