/* global io */
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
import {spawnGame, getGameAddr} from "../managers/manager";
import Floor from "../game/floor";

const mkdir = util.promisify(fs.mkdir);
const exists = util.promisify(fs.exists);

export let gameRouter = express.Router();

// List all lobbies
gameRouter.get("/all", async(req, res) => {
  if(res.loginRedirect()) {
    return;
  }

  // Get the hosts of all of the lobbies this user is a part of
  let lobbies = await sql.query(`
    SELECT l1.playerId, l1.lobbyId FROM lobbies l1
      WHERE l1.lobbyId IN (SELECT l.lobbyId FROM lobbies l WHERE l.playerId = :userId)
      AND l1.isHost = 1
      ORDER BY l1.lobbyId;`, {
    replacements: {
      userId: req.user.username
    },
    type: sql.QueryTypes.SELECT
  });

  let counts = await sql.query(`
    SELECT lobbyId, COUNT(playerId) AS count FROM lobbies l1
      WHERE l1.lobbyId IN (SELECT l2.lobbyId FROM lobbies l2 WHERE l2.playerId = :userId)
      GROUP BY l1.lobbyId
      ORDER BY l1.lobbyId`, {
    replacements: {
      userId: req.user.username
    },
    type: sql.QueryTypes.SELECT
  });

  if(counts.length !== lobbies.length) {
    process.stderr.write("Lobbies and counts results were different from /game/all\n");
    res.writeHead(500);
    res.end("Internal server error (see server logs)");
    return;
  }

  // Merge counts and lobbies
  for(let i = 0; i < lobbies.length; ++i) {
    if(lobbies[i].lobbyId !== counts[i].lobbyId) {
      process.stderr.write("Lobbies and counts lobbyIds were different from /game/all\n");
      res.writeHead(500);
      res.end("Internal server error (see server logs)");
      return;
    }

    lobbies[i].count = counts[i].count;
  }

  res.render("game-list", {
    user: req.user.username,
    lobbies
  });
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
  let lobby = await Lobby.find({
    where: {
      secret: req.params.id
    }
  });

  /* Check if the lobby exists. If it doesn't, inform user the join link is invalid. */
  if(!lobby) {
    res.status(404);
    res.end("Join code is invalid");
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

  io.emit("lobby-add", {
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

  res.redirect(`/game/lobby/${id}`);
});

// Delete a lobby
gameRouter.get("/lobby/:id/delete", async(req, res) => {
  if(res.loginRedirect()) {
    return;
  }

  let lobby = await Lobby.find({
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
      io.emit("lobby-delete", req.params.id);
      fs.unlink(`./Frontend/public/maps/${req.params.id}.json`, () => {
        //pass
      });
      res.redirect("/account/dashboard");
    } else {
      res.status(401);
      res.end("Only the host can delete this lobby.");
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

  let host = await Lobby.find({
    where: {
      lobbyId: req.params.id,
      playerId: req.user.username
    }
  });

  if(!host.isHost) {
    res.status(401);
    res.end("Only the host can drop a player");
    return;
  }

  let lobby = await Lobby.find({
    where: {
      lobbyId: req.params.id,
      playerId: req.params.player
    }
  });

  let player = await Player.find({
    where: {
      id: lobby.player
    }
  });

  if(lobby && player) {
    await player.update({
      inGame: false
    });
    io.emit("lobby-drop", {
      id: req.params.id,
      player: req.params.player
    });
    res.end("Player removed");
  }

  res.status(404);
  res.end("No such lobby or player");
});

// Start the game for this lobby
gameRouter.get("/lobby/:id/start", async(req, res) => {
  if(res.loginRedirect()) {
    return;
  }

  let lobby = await Lobby.find({
    where: {
      lobbyId: req.params.id,
      playerId: req.user.username
    }
  });

  if(lobby && lobby.isHost) {
    let lobbyResults = await Lobby.findAll({
      where: {
        lobbyId: req.params.id
      }
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

    try {
      await mkdir("Frontend/public/maps");
    } catch(err) {
      // pass
    }

    // Generate the game
    if(!await exists(`Frontend/public/maps/${req.params.id}.json`)) {
      await Floor.generate({
        gameId: req.params.id,
        floorIdx: 0
      }).save(true);
    }

    try {
      await spawnGame({
        gameId: req.params.id
      });
      await Lobby.update({ inProgress: true },
        {
          where: {
            lobbyId: req.params.id,
          }
        });
      io.emit("lobby-start", req.params.id, usernames);
      res.end("Game started");
    } catch(err) {
      await Lobby.update({ inProgress: false },
        {
          where: {
            lobbyId: req.params.id,
          }
        });
      process.stderr.write(`Error starting game: ${err.message}\n`);
      res.end("An error occured while starting game");
    }
    return;
  }

  res.end("No such lobby or you are not the host");
});

// Get the game server address
gameRouter.get("/addr/:id", (req, res) => {
  res.end(getGameAddr(req.params.id));
});

// Serve /game/:id as /game/
gameRouter.get(/[A-Za-z0-9]{12}/, (req, res) => {
  res.sendFile(path.resolve("Frontend/game/index.html"));
});

gameRouter.get('/test', (req, res) => {
  res.sendFile(path.resolve("Frontend/game/Tests/index.html"));
});

