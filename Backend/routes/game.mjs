/* global io ml */
/* eslint-disable complexity */
import express from "express";
import crypto from "crypto";
import util from "util";
import Lobby from "../models/lobby";
import Player from '../models/player';
import User from '../models/user';
import sql from "../sequelize";
import path from "path";
import fs from "fs";
import startGame from "../game.mjs";
import Floor from "../game/floor";
import MonsterModel from "../models/monster.mjs";
import ItemModel from '../models/item.mjs';
import Sequelize from "sequelize";
import Maps from "../models/maps";
import {getAddr} from "../multi/host";

let monsterModel = new MonsterModel(sql);

const mkdir = util.promisify(fs.mkdir);
const DATA_DIR = process.env.PUBLIC_DIR || "Frontend/public";

export let gameRouter = express.Router();

gameRouter.use((req, res, next) => {
  res.set("Cache-Control", "no-cache");
  next();
});

// View a lobby
gameRouter.get("/lobby/:id", async(req, res) => {
  // make sure req.user is an object
  req.user || (req.user = {}); // eslint-disable-line

  let lobbyResults = await Lobby.findAll({
    where: {
      lobbyId: req.params.id
    }
  });

  // Check if the lobby exists
  if(lobbyResults.length === 0) {
    res.status(404);
    res.render("lobby", {
      invalid: true,
      user: req.user.username
    });

    return;
  }

  // Convert the mysql rows into useful a useful format
  let host = await lobbyResults.find((row) => {
    return row.isHost;
  });

  let playerRows = await Promise.all(
    lobbyResults.map((lobby) => {
      return Player.findOne({
        where: {
          id: lobby.player
        }
      });
    })
  );

  lobbyResults = lobbyResults.filter((lobby) => {
    let _player = playerRows.find((row) => {
      return row.id === lobby.player;
    });
    return _player && _player.inGame;
  });

  let players = lobbyResults.map((row) => {
    return {
      id: row.playerId,
      isHost: row.isHost
    };
  });

  let usernames = players.map((player) => {
    return player.id;
  });

  let playerImages = await sql.query(`SELECT image_name, username FROM users WHERE username IN (:usernames)`, {
    replacements: {
      usernames: usernames
    },
    type: sql.QueryTypes.SELECT
  });

  playerImages.forEach((image) => {
    players.forEach((player) => {
      if(player.id === image.username) {
        player.image_name = image.image_name;
      }
    });
  });

  let isHost = host.playerId === req.user.username;

  res.render("lobby", {
    id: req.params.id,
    isHost,
    user: req.user.username,
    players,
    host: host.playerId,
    origin: `http://${req.headers.host}`,
    secret: lobbyResults[0].secret
  });
});

// Join a lobby
// /j/:id (from the root)
export const joinRoute = async(req, res) => {
  if(res.loginRedirect()) {
    return;
  }
  let lobby = await Lobby.findOne({
    where: {
      secret: req.params.id
    }
  });

  /* Check if the lobby exists. If it doesn't, inform user the join link is invalid. */
  if(!lobby) {
    res.status(404);
    res.end("Join code is invalid");
    ml.logger.verbose(`${req.user.username} failed to join a lobby becuase the join code ${req.params.id} is invalid`, ml.tags.lobby);
    return;
  }
  let user = await User.findOne({
    where: {
      username: req.user.username
    }
  });

  /* Check to see if there is a player already for this user and lobby */
  let lobbyExists = await Lobby.findOne({
    where: {
      secret: req.params.id,
      playerId: req.user.username
    }
  });
  /* If there is a lobby for this user, update the `inGame` attribute to true for the player
   * record associated for this lobby */
  if(lobbyExists) {
    let continuePlayer = await Player.findOne({
      where: {
        id: lobbyExists.player
      }
    });
    await continuePlayer.update({
      inGame: true
    });
  } else {
    /* Create a new player and lobby for this user */
    let newPlayer = await Player.create({
      spriteName: Player.getRandomSprite()
    });
    await user.addPlayer(newPlayer);
    let newLobby = await Lobby.create({
      lobbyId: lobby.lobbyId,
      secret: lobby.secret,
      playerId: req.user.username
    });
    await newPlayer.setLobby(newLobby);
  }

  ml.logger.info(`${req.user.username} joined ${lobby.lobbyId}`, ml.tags.lobby);

  io.of(`/lobby`).emit("lobby-add", {
    id: lobby.lobbyId,
    playerId: req.user.username,
    image_name: req.user.image_name
  });

  res.redirect(`/game/lobby/${lobby.lobbyId}`);
};

const randomBytes = util.promisify(crypto.randomBytes);

// Generate a cryptographically random base64 encoded id
const genId = async(length) => {
  return (await randomBytes(length))
    .toString("base64")
    .replace(/\//g, "A")
    .replace(/\+/g, "B");
};

const ID_LENGTH = 9; // should be divisible by 3 to aviod the = in the base 64
const SECRET_LENGTH = 3;

// Create a new lobby
gameRouter.get("/new", async(req, res) => {
  if(res.loginRedirect()) {
    return;
  }

  let id = await genId(ID_LENGTH);
  let secret = await genId(SECRET_LENGTH);

  let newPlayer = await Player.create({
    spriteName: Player.getRandomSprite()
  });
  let user = await User.findOne({
    where: {
      username: req.user.username
    }
  });
  await user.addPlayer(newPlayer);
  let newLobby = await Lobby.create({
    secret,
    lobbyId: id,
    playerId: req.user.username,
    isHost: true
  });
  await newPlayer.setLobby(newLobby);

  ml.logger.info(`${id} created (secret: ${secret})`, ml.tags.lobby);
  res.redirect(`/game/lobby/${id}`);
});

// Delete a lobby
gameRouter.get("/lobby/:id/delete", async(req, res) => {
  if(res.loginRedirect()) {
    return;
  }

  let lobby = await Lobby.findOne({
    where: {
      lobbyId: req.params.id,
      playerId: req.user.username
    }
  });
  let allLobbies = await Lobby.findAll({
    where: {
      lobbyId: req.params.id
    }
  });

  if(lobby) {
    if(lobby.isHost) {
      await Lobby.destroy({
        where: {
          lobbyId: req.params.id
        }
      });
      /* This will need to refactored once the following has occured:
       * Users 1 -> * Lobbies -> * Players */
      allLobbies.forEach(async(singleLobby) => {
        await Player.destroy({
          where: {
            id: singleLobby.player
          }
        });
      });
      io.of(`/lobby`).emit("lobby-delete", req.params.id);
      await deleteGame(req.params.id);
      ml.logger.info(`Deleted ${req.params.id}`, ml.tags.lobby);
      res.redirect("/account/dashboard");
    } else {
      res.status(401);
      res.end("Only the host can delete this lobby.");
      ml.logger.verbose(`${req.user.username} failed to delete ${req.params.id} because they are not the host`, ml.tags.lobby);
    }
    return;
  }

  res.status(404);
  res.end("No such lobby or you are not in it");
});

// Drop a player from the lobby
gameRouter.get("/lobby/:id/drop/:player", async(req, res) => {
  if(res.loginRedirect()) {
    return;
  }

  let host = await Lobby.findOne({
    where: {
      lobbyId: req.params.id,
      playerId: req.user.username
    }
  });

  if(!host.isHost) {
    res.status(401);
    res.end("Only the host can drop a player");
    ml.logger.verbose(`${req.user.username} failed to drop ${req.params.player} from ${req.params.id} becuase they are not the host`, ml.tags.lobby);
    return;
  }

  let lobby = await Lobby.findOne({
    where: {
      lobbyId: req.params.id,
      playerId: req.params.player
    }
  });

  let player = await Player.findOne({
    where: {
      id: lobby.player
    }
  });

  if(lobby && player) {
    await player.update({
      inGame: false
    });
    io.of(`/lobby`).emit("lobby-drop", {
      id: req.params.id,
      player: req.params.player
    });
    res.end("Player removed");
    ml.logger.info(`Droped ${req.params.player} from ${req.params.id}`, ml.tags.lobby);
  }

  res.status(404);
  res.end("No such lobby or player");
});

// Start the game for this lobby
gameRouter.get("/lobby/:id/start", async(req, res) => {
  if(res.loginRedirect()) {
    return;
  }

  let lobby = await Lobby.findOne({
    where: {
      lobbyId: req.params.id,
      playerId: req.user.username
    }
  });

  if(lobby && lobby.isHost) {
    try {
      await mkdir(`${DATA_DIR}/maps`);
    } catch(err) {
      // pass
    }

    ml.logger.info(`Starting game ${req.params.id}`, ml.tags.lobby);

    // Generate the game
    if(!await Maps.findOne({ where: { floorId: `${req.params.id}-0` } })) {
      ml.logger.verbose(`Generating floor ${req.params.id}-0`, ml.tags.lobby);
      await Floor.generate({
        gameId: req.params.id,
        floorIdx: 0,
        map: {
          nodes: req.params.mini ? 9 : undefined
        }
      }).save(true);
    }

    try {
      ml.logger.verbose(`Spawning ${req.params.id}`, ml.tags.lobby);
      startGame(req.params.id);
      await Lobby.update({ inProgress: true },
        {
          where: {
            lobbyId: req.params.id,
          }
        });
      io.of(`/lobby`).emit("lobby-start", req.params.id);
      res.end("Game started");
    } catch(err) {
      await Lobby.update({ inProgress: false },
        {
          where: {
            lobbyId: req.params.id,
          }
        });
      ml.logger.error(`Error starting game: ${err.message}`, ml.logger.manager);
      ml.logger.verbose(err.stack, ml.logger.manager);
      res.end("An error occured while starting game");
    }
    return;
  }

  ml.logger.verbose(`${req.user.username} failed to start ${req.params.id}`, ml.tags.lobby);
  res.end("No such lobby or you are not the host");
});

// Serve the maps
gameRouter.get("/map/:id", async(req, res) => {
  let rawMap = await Maps.findOne({
    where: {
      floorId: req.params.id
    }
  });

  res.end(rawMap.map);
});

gameRouter.get("/addr/:id", (req, res) => {
  res.end(getAddr(req.params.id));
});

// Serve /game/:id as /game/
gameRouter.get(/[A-Za-z0-9]{12}/, (req, res) => {
  res.sendFile(path.resolve("Frontend/game/index.html"));
});

gameRouter.get('/test', (req, res) => {
  res.sendFile(path.resolve("Frontend/game/Tests/index.html"));
});

function deleteGame(id) {
  return Promise.all([
    Maps.destroy({
      where: {
        floorId: {
          [Sequelize.Op.like]: `${id}-%`
        }
      }
    }),
    ItemModel.destroy({
      where: {
        floorId: {
          [Sequelize.Op.like]: `${id}-%`
        }
      }
    }),
    monsterModel.destroy({
      where: {
        floorId: {
          [Sequelize.Op.like]: `${id}-%`
        }
      }
    })
  ])
    // Ignore all errors
    .catch(() => {});
}
