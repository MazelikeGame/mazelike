import child_process from "child_process";
import poll from "./manager-connect.mjs";

const CHILD_MAIN = "Backend/game.mjs";
const ADDRESS = process.env.EXTERN_ADDRESS || "localhost";
const STARTING_PORT = +process.env.STARTING_PORT || 5900;
const ENDING_PORT = +process.env.ENDING_PORT || 5999;
let inUsePorts = new Set();
let portMap = new Map();

export function spawnGame(gameEnv = {}) {
  let gameId = gameEnv.gameId;
  // prefix all mazelike env vars
  for(let key of Object.keys(gameEnv)) {
    gameEnv[`MAZELIKE_${key}`] = gameEnv[key];
    delete gameEnv[key];
  }

  let port = pickPort();
  portMap.set(gameId, port);
  inUsePorts.add(port);

  let child = child_process.spawn("node", ["--experimental-modules", CHILD_MAIN, port], {
    env: gameEnv,
    stdio: ["ignore", "inherit", "inherit"]
  });

  child.on("exit", (code) => {
    if(code !== 0) {
      process.stderr.write(`Child exited with non-zero status code ${code}\n`);
    }

    inUsePorts.delete(port);
    portMap.delete(gameId);
  });

  return Promise.race([
    // listen for spawn errors
    new Promise((resolve, reject) => {
      child.on("error", (err) => {
        reject(new Error(`An error occured when spawning the game server: ${err.message}`));
        inUsePorts.delete(port);
        portMap.delete(gameId);
      });  
    }),

    // wait for the server to start
    poll(`${ADDRESS}:${port}`)
      .then(() => {
        return `${ADDRESS}:${port}`;
      })
  ]);
}

function pickPort() {
  let port = STARTING_PORT;
  while(inUsePorts.has(port)) {
    ++port;

    if(port > ENDING_PORT) {
      throw new Error(`All ports in use`);
    }
  }

  return port;
}

export function getGameAddr(gameId) {
  return `${ADDRESS}:${portMap.get(gameId)}`;
}