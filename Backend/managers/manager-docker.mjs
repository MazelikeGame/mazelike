import dockerApi from "node-docker-api";
import poll from "./manager-connect";

const IMAGE_NAME = process.env.IMAGE_NAME || "mazelike/backend:devel";
const ADDRESS = process.env.EXTERN_ADDRESS;
const STARTING_PORT = +process.env.STARTING_PORT || 5900;
const ENDING_PORT = +process.env.ENDING_PORT || 5999;
const PREFIX = process.env.CONTAINER_PREFIX || "";
const PUBLIC_DIR = process.env.PUBLIC_DIR;

let docker = new dockerApi.Docker({ socketPath: "/var/run/docker.sock" });
let inUsePorts = new Set();

export default async function spawn(gameEnv = {}) {
  // prefix all mazelike env vars
  let envArray = [];
  for(let key of Object.keys(gameEnv)) {
    envArray.push(`MAZELIKE_${key}=${gameEnv[key]}`);
  }

  let hostname = `mazelike-${PREFIX}${gameEnv.gameId}`;
  let port = pickPort();

  let container = await docker.container.create({
    name: hostname,
    Hostname: hostname,
    Image: IMAGE_NAME,
    Cmd: ["node", "--experimental-modules", "Backend/game.mjs", `${port}`],
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
        `${PUBLIC_DIR}:/app/Frontend/public`
      ]
    },
    Labels: {
      "edu.iastate.ryanr": `mazelike-${PREFIX}`
    }
  });

  await container.start();

  let ip = (await container.status()).data.NetworkSettings.IPAddress;

  // wait for the server to start
  try {
    await poll(`${ip}:${port}`);
  } catch(err) {
    try {
      await container.kill();
    } catch(err2) {
      // pass
    }

    throw err;
  }


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