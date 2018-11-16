import child_process from "child_process";

const CHILD_MAIN = "Backend/game.mjs";
const ADDRESS = process.env.EXTERN_ADDRESS || "localhost";
const STARTING_PORT = +process.env.STARTING_PORT || 5900;
const ENDING_PORT = +process.env.ENDING_PORT || 5999;
let inUsePorts = new Set();
let portMap = new Map();

export function spawnGame(gameEnv = {}) {
  let port = pickPort();
  portMap.set(gameId, port);
  inUsePorts.add(port);
  gameEnv.port = port;

  let gameId = gameEnv.gameId;
  let origEnv = Object.assign({}, gameEnv);
  // prefix all mazelike env vars
  for(let key of Object.keys(gameEnv)) {
    gameEnv[`MAZELIKE_${key}`] = gameEnv[key];
    delete gameEnv[key];
  }

  let child = child_process.spawn(process.argv[0], ['--experimental-modules', CHILD_MAIN], {
    env: gameEnv,
    stdio: ['ignore', 'inherit', 'inherit']
  });

  child.on("exit", (code) => {
    if(code !== 0) {
      process.stderr.write(`Child exited with non-zero status code ${code}\n`);
    }

    if(code === 198) {
      inUsePorts.add(port);
      spawnGame(origEnv);
    }

    inUsePorts.delete(port);
    portMap.delete(gameId);
  });

  child.on("error", (err) => {
    process.stderr.write(`An error occured when spawning the game server: ${err.message}`);
    inUsePorts.delete(port);
    portMap.delete(gameId);
  });

  return `${ADDRESS}:${port}`;
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
