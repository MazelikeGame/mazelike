/* global ml io */
/* eslint-disable no-param-reassign,complexity */
import Floor from "./game/floor";
import movementHandler from "./handlers/player-movement";
import initAuth from "./game-auth";
import os from "os";

let runningGames = new Set();

export default async function startGame(gameId) {
  try {
    let floorRef = {};
    if(runningGames.has(gameId)) {
      return;
    }

    runningGames.add(gameId);

    // Load/generate the ground floor
    let floor = floorRef.floor = await Floor.load(gameId, 0);

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

      sock.emit("game-server-name", os.hostname());
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

      movementHandler(sock, floorRef, sock.broadcast);

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

    triggerTick(floor, Date.now(), gameId, floorRef);
  } catch(err) {
    ml.logger.error(`Game crashed because of ${err.message}`);
    ml.logger.verbose(err.stack);
  }
}

async function triggerTick(floor, lastUpdate, gameId, floorRef) {
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

    // REGENERATE NEW FLOOR
    if(typeof floor.regenerate !== 'undefined') { //if the floor needs to be regenerated
      let oldId = floor.id.split("-");
      let newIndex = Number(oldId[1]) + 1;
      if(newIndex === 3) {
        floor.players = [];
        io.of(`/game/${gameId}`).emit("win");
      } else {
        let newFloor = Floor.generate({
          gameId: oldId[0],
          floorIdx: newIndex
        });
        for(let player of floor.players) {
          player.floor = newFloor;
          player.hasKey = undefined;
          delete player.wearing.key;
          player.respawn();
        }
        newFloor.players = floor.players;
        await newFloor.save(true); //Saves the new floor (true)
        floor = floorRef.floor = newFloor;
        io.of(`/game/${gameId}`).emit("new-floor", floor.id);
      }
    }

    await floor.sendState(io.of(`/game/${gameId}`));
  } catch(err) {
    ml.logger.error(`${err.stack}`, ml.tags("game"));
  }

  setTimeout(triggerTick.bind(undefined, floor, now, gameId, floorRef), Floor.UPDATE_INTERVAL);
}
