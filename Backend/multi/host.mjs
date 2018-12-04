/* global ml */
/* eslint-disable consistent-return */
import http2 from "http2";
import startGame from "../game";

let streams = [];
let gameAddrs = new Map();

/**
 * Start the intercom server on the host
 */
export function initHost() {
  let server = http2.createServer();

  server.on("stream", (stream, headers) => {
    if(headers[":path"] === "/version") {
      // Send our current api version
      stream.respond({ ":status": 200 });
      stream.end("v1");
    } else if(headers[":path"] === "/v1/poll-games") {
      // Remove any other streams from this game server
      for(let dup of streams) {
        if(dup.$extrnAddr === headers["x-extrn-addr"]) {
          dup.end();
        }
      }

      // A game server is ready to handle games
      stream.respond({ ":status": 200 });
      streams.push(stream);
      stream.$hostname = headers["x-hostname"];
      stream.$extrnAddr = headers["x-extrn-addr"];

      ml.logger.info(`Game server ${headers["x-hostname"]} connected (1/${streams.length})`);

      stream.on("finish", () => {
        ml.logger.info(`Game server ${headers["x-hostname"]} disconnected (${streams.length} remain)`, ml.tags("intercom"));
        // The game server disconnected
        let idx = streams.indexOf(stream);

        if(idx !== -1) {
          streams.splice(idx, 1);
        }
      });
    } else {
      stream.respond({ ":status": 404 });
      stream.end();
    }
  });

  server.listen(8000, () => {
    ml.logger.info(`Coordination server listening on port 8000`, ml.tags("intercom"));
  });
}

/**
 * Get the game server address for a game
 */
export function getAddr(gameId) {
  if(streams.length > 0) {
    return gameAddrs.get(gameId);
  }
  
  return "__current__";
}

/**
 * Start a game
 * @param gameId The id of the game to start
 */
export default async function startGameWrapper(gameId) {
  let isOnHost;
  try {
    if(streams.length > 0) {
      return dispatchGame(gameId);
    }

    isOnHost = true;
    startGame(gameId); // don't return a promise because we don't want to wait for the entire game
  } catch(err) {
    if(!isOnHost) {
      return startGameWrapper(gameId);
    }

    throw err;
  }
}

/**
 * Tell one of the game servers to start a game
 * @param gameId The id of the game to start
 */
function dispatchGame(gameId) {
  let idx = Math.floor(Math.random() * streams.length);
  let stream = streams[idx];

  return new Promise((resolve, reject) => {
    stream.pushStream({ ":path": `/v1/start?gameId=${gameId}` }, (err, push) => {
      if(err) {
        reject(err);
        return;
      }
      
      ml.logger.verbose(`Dispatching game ${gameId} to ${stream.$hostname}`, ml.tags("intercom"));
      gameAddrs.set(gameId, stream.$extrnAddr);

      push.respond({ ":status": 200 });
      push.end();

      resolve();
    });
  }).catch((err) => {
    // Close and remove this server
    streams[idx].end();
    streams.splice(idx, 1);

    throw err;
  });
}