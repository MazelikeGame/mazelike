import child_process from "child_process";

const CHILD_MAIN = "Backend/game.mjs";
const ADDRESS = process.env.EXTERN_ADDRESS || "localhost";
const STARTING_PORT = 5900;
const ENDING_PORT = 5999;
let inUsePorts = new Set();

export default function spawn(gameEnv = {}) {
  // prefix all mazelike env vars
  for(let key of Object.keys(gameEnv)) {
    gameEnv[`MAZELIKE_${key}`] = gameEnv[key];
    delete gameEnv[key];
  }

  let port = pickPort();

  let child = child_process.spawn("node", ["--experimental-modules", CHILD_MAIN, port], {
    env: gameEnv,
    stdio: ["ignore", "inherit", "inherit"]
  });

  child.on("exit", (code) => {
    if(code !== 0) {
      process.stderr.write(`Child exited with non-zero status code ${code}\n`);
    }

    inUsePorts.delete(port);
  });

  child.on("error", (err) => {
    process.stderr.write(`An error occured when spawning the game server: ${err.message}\n`);
    inUsePorts.delete(port);
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