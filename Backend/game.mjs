/* global ml io */
/* eslint-disable no-param-reassign,complexity */
import Floor from "./game/floor";
import saveHandler from "./handlers/save";
import movementHandler from "./handlers/player-movement";
import initAuth from "./game-auth";

let runningGames = new Set();

export default async function startGame(gameId) {
  if(runningGames.has(gameId)) {
    return;
  }

  runningGames.add(gameId);

  // Load/generate the ground floor
  let floor = await Floor.load(gameId, 0);

  // eslint-disable-next-line arrow-parens,arrow-body-style
  let awaitedPlayers = new Set(floor.players.map(player => player.name));
  ml.logger.verbose(`Waiting for players to join (${Array.from(awaitedPlayers).join(", ")})`, ml.tags.pregame);

  initAuth(io.of(`/game/${gameId}`));

  let readyResolver;
  let connectionHandler = async(sock) => {
    ml.logger.info(`Game client connected (username: ${sock.user ? sock.user.username : "No auth"})`);
    // Not logged in enter spectator mode
    if(!sock.user) {
      sock.emit("set-username");
      return;
    }

    sock.emit("set-username", sock.user.username);

    sock.on("disconnect", async() => {
      //Player has left and need to update the list of players.
      sock.broadcast.emit("update-playerlist", sock.user.username);

      ml.logger.info(`${sock.user.username} left the game`, ml.tags("game"));

      // Remove the player
      let player = floor.players.find((pl) => {
        return pl.name === sock.user.username;
      });

      if(player) {
        floor.players.splice(floor.players.indexOf(player), 1);
      }
    });

    saveHandler(sock, floor);
    movementHandler(sock, floor, sock.broadcast);

    // Mark this player as ready
    awaitedPlayers.delete(sock.user.username);

    ml.logger.verbose(`Waiting for players to join (${Array.from(awaitedPlayers).join(", ")})`, ml.tags.pregame);

    if(awaitedPlayers.size === 0) {
      readyResolver();
    }
  };

  io.of(`/game/${gameId}`).on("connection", connectionHandler);

  await new Promise((resolve) => {
    readyResolver = resolve;
  });

  ml.logger.verbose(`Starting countdown`, ml.tags.pregame);

  // start the count down
  for(let i = 3; i > 0; --i) {
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

    io.of(`/game/${gameId}`).emit("countdown", i);
  }

  ml.logger.info("Starting game", ml.tags("game"));

  // start the game
  await floor.sendState(io.of(`/game/${gameId}`));
  io.of(`/game/${gameId}`).emit("start-game");
  floor.isGameRunning = true;

  triggerTick(floor, Date.now(), gameId);
}

async function triggerTick(floor, lastUpdate, gameId) {
  let now = Date.now();

  // save and quit if we loose all the clients
  if(floor.players.length === 0) {
    await floor.sendState(io.of(`/game/${gameId}`));
    io.of(`/game/${gameId}`).removeAllListeners("connection");

    ml.logger.verbose("All clients left or died saving game", ml.tags("game"));

    await floor.save();

    runningGames.delete(gameId);

    return;
  }

  // move monsters and check for collisions
  try {
    await floor.tick(now - lastUpdate);
    await floor.sendState(io.of(`/game/${gameId}`));
  } catch(err) {
    ml.logger.error(`${err.stack}`, ml.tags("game"));
  }

  setTimeout(triggerTick.bind(undefined, floor, now, gameId), Floor.UPDATE_INTERVAL);
}
