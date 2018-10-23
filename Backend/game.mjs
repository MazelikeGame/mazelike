import socketIO from "socket.io";
import http from "http";
import Floor from "./game/floor";

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
  let floor;
  if(gameEnv.isNewGame === "yes") {
    floor = Floor.generate({
      gameId: gameEnv.gameId,
      floorIdx: 0
    });
  } else {
    floor = Floor.load(gameEnv.gameId, 0);
  }

  // put the initial game state in the database 
  await floor.save();

  // Create the socket.io server
  let httpd = http.createServer((req, res) => {
    res.end("Game server");
  }).listen(PORT, () => {
    process.stdout.write(`Game server listening on ${PORT}\n`);
  });

  // eslint-disable-next-line

  let io = socketIO(httpd); 

  io.on("connection", (sock) => {
    sock.on("save", async() => {
      await floor.save();
      sock.emit("save-complete");
    });
  });
}

main();