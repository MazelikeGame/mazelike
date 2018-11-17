/* eslint-disable complexity */
import dockerApi from "node-docker-api";
import fs from "fs";

const ENV_NAMES = [
  "DB",
  "NODE_ENV"
];

const VERSION = fs.readFileSync("VERSION", "utf8").trim();
const IMAGE_NAME = process.env.IMAGE_NAME || `ryan3r/mazelike:${VERSION}`;
const ADDRESS = process.env.EXTERN_ADDRESS;
const STARTING_PORT = +process.env.STARTING_PORT || 5900;
const ENDING_PORT = +process.env.ENDING_PORT || 5999;
const PUBLIC_DIR = process.env.PUBLIC_DIR || "Frontend/public";

let docker = new dockerApi.Docker({ socketPath: "/var/run/docker.sock" });
let inUsePorts = new Set();
let portMap = new Map();

export async function spawnGame(gameEnv = {}) {
  // prefix all mazelike env vars
  let envArray = [];
  for(let key of Object.keys(gameEnv)) {
    envArray.push(`MAZELIKE_${key}=${gameEnv[key]}`);
  }

  // copy our env to the child
  for(let envName of ENV_NAMES) {
    envArray.push(`${envName}=${process.env[envName]}`);
  }

  let hostname = `mazelike-${gameEnv.gameId}`;
  let port = pickPort();

  inUsePorts.add(port);
  portMap.set(gameEnv.gameId, port);
  envArray.push(`MAZELIKE_port=${port}`);

  let container = await docker.container.create({
    name: hostname,
    Hostname: hostname,
    Image: IMAGE_NAME,
    Cmd: ["-g"],
    Env: envArray,
    ExposedPorts: {
      [`${port}/tcp`]: {}
    },
    HostConfig: {
      PortBindings: {
        [`${port}/tcp`]: [{
          HostPort: `${port}`
        }]
      },
      Binds: [
        `${process.env.EXTERN_PUBLIC_DIR}:/data`
      ]
    },
    Labels: {
      "edu.iastate.ryanr": `mazelike`
    }
  });

  let addr = await startContainer(container, gameEnv.gameId, gameEnv);
  if(addr) {
    return addr;
  }

  waitForClose(container, port, gameEnv.gameId); // DO NOT AWAIT THIS

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

async function waitForClose(container, port, gameId) {
  await container.wait();
  await container.delete({ force: true });
  inUsePorts.delete(port);
  portMap.delete(gameId);
}

export function getGameAddr(gameId) {
  return `${ADDRESS}:${portMap.get(gameId)}`;
}

async function startContainer(container, gameId, gameEnv) {
  try {
    await container.start();
  } catch(err) {
    // check if the port is already being used
    if(err.message.indexOf("address already in use") !== -1 ||
        err.message.indexOf("port is already allocated") !== -1) {
      portMap.delete(gameId);
      await container.delete();

      return spawnGame(gameEnv);
    }

    throw err;
  }

  return undefined;
}