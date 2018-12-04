/* global ml */
import http2 from "http2";

let streams = [];
let gameAddrs = new Map();

export function initHost() {
  let server = http2.createServer();

  server.on("stream", (stream, headers) => {
    if(headers[":path"] === "/version") {
      // Send our current api version
      stream.respond({ ":status": 200 });
      stream.end("v1");
    } else if(headers[":path"] === "/v1/poll-games") {
      ml.logger.info(`Game server ${headers["x-hostname"]} connected`);
      // A game server is ready to handle games
      stream.respond({ ":status": 200 });
      streams.push(stream);
      stream.$hostname = headers["x-hostname"];
      stream.$extrnAddr = headers["x-extrn-addr"];

      stream.on("finish", () => {
        ml.logger.info(`Game server ${headers["x-hostname"]} disconnected`, ml.tags("intercom"));
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
  if(hasGameServers()) {
    return gameAddrs.get(gameId);
  }
  
  return "__current__";
}

/**
 * Check if we are connected to any game servers
 */
export function hasGameServers() {
  return streams.length > 0;
}

/**
 * Tell one of the game servers to start a game
 * @param gameId The id of the game to start
 */
export function dispatchGame(gameId) {
  let stream = streams[Math.floor(Math.random() * streams.length)];

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
  });
}