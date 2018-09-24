/* global io */
import express from "express";
import crypto from "crypto";
import util from "util";
import Lobby from "../models/lobby";

export let gameRouter = express.Router();

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
  if(!req.user) {
    res.redirect("/account/login");
    return;
  }

  let lobby = await Lobby.find({
    where: {
      secret: req.params.id
    }
  });

  // check if the lobby exists
  if(!lobby) {
    res.end("Join code is invalid");
    return;
  }

  await Lobby.create({
    lobbyId: lobby.lobbyId,
    secret: lobby.secret,
    playerId: req.user.username
  });

  io.emit("lobby-add", {
    id: lobby.lobbyId,
    playerId: req.user.username
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
  if(!req.user) {
    res.redirect("/account/login");
    return;
  }

  let id = await genId(ID_LENGTH);
  let secret = await genId(SECRET_LENGTH);

  await Lobby.create({
    secret,
    lobbyId: id,
    playerId: req.user.username,
    isHost: true
  });

  res.redirect(`/game/lobby/${id}`);
});

// Delete a lobby
gameRouter.get("/lobby/:id/delete", async(req, res) => {
  if(!req.user) {
    res.redirect("/account/login");
    return;
  }

  let lobby = await Lobby.find({
    where: {
      lobbyId: req.params.id,
      playerId: req.user.username
    }
  });

  if(lobby) {
    if(lobby.isHost) {
      await Lobby.destroy({
        where: {
          lobbyId: req.params.id
        }
      });

      io.emit("lobby-delete", req.params.id);
      res.end("Lobby deleted");
    } else {
      res.end("Only the host can delete this lobby.");
    }
    return;
  }

  res.end("No such lobby or you are not in it");
});

// Drop a player from the lobby
gameRouter.get("/lobby/:id/drop/:player", async(req, res) => {
  if(!req.user) {
    res.redirect("/account/login");
    return;
  }

  let host = await Lobby.find({
    where: {
      lobbyId: req.params.id,
      playerId: req.user.username
    }
  });

  if(!host.isHost) {
    res.end("Only the host can drop a player");
    return;
  }

  let lobby = await Lobby.find({
    where: {
      lobbyId: req.params.id,
      playerId: req.params.player
    }
  });

  if(lobby) {
    await lobby.destroy();

    io.emit("lobby-drop", {
      id: req.params.id,
      player: req.params.player
    });

    res.end("Player removed");
  }

  res.end("No such lobby or player");
});

// Start the game for this lobby
gameRouter.get("/lobby/:id/start", async(req, res) => {
  if(!req.user) {
    res.redirect("/account/login");
    return;
  }

  let lobby = await Lobby.find({
    where: {
      lobbyId: req.params.id,
      playerId: req.user.username
    }
  });

  if(lobby && lobby.isHost) {
    await Lobby.destroy({
      where: {
        lobbyId: req.params.id
      }
    });

    // Create game here (TODO)

    io.emit("lobby-start", req.params.id);

    res.end("Game started");
    return;
  }

  res.end("No such lobby or you are not the host");
});