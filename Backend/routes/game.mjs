/* global io */
import express from "express";
import crypto from "crypto";
import util from "util";

export let gameRouter = express.Router();

let lobbies = new Map();

// View a lobby
gameRouter.get("/lobby/:id", (req, res) => {
  if(!lobbies.has(req.params.id)) {
    res.render("lobby", {
      invalid: true,
      user: req.query.user
    });

    return;
  }

  let lobby = lobbies.get(req.params.id);

  res.render("lobby", {
    id: req.params.id,
    isHost: req.query.user === lobby.host,
    user: req.query.user,
    players: lobby.players,
    host: lobby.host,
    origin: `http://${req.headers.host}`,
    secret: lobby.secret
  });
});

// Join a lobby
// /j/:id (from the root)
export const joinRoute = (req, res) => {
  if(!req.query.user) {
    res.redirect("/login");
    return;
  }

  // Find the lobby
  let lobby, id;
  for(const [_id, _lobby] of lobbies) {
    if(_lobby.secret === req.params.id) {
      lobby = _lobby;
      id = _id;
    }
  }

  if(!lobby) {
    res.end("Join code is invalid");
    return;
  }

  lobby.players.push({
    id: req.query.user,
    name: req.query.user
  });

  io.emit("lobby-add", {
    id,
    player: lobby.players[lobby.players.length - 1]
  });

  res.redirect(`/game/lobby/${id}`);
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
  if(!req.query.user) {
    res.redirect("/login");
    return;
  }

  let id = await genId(ID_LENGTH);
  let secret = await genId(SECRET_LENGTH);

  lobbies.set(id, {
    host: req.query.user,
    secret,
    players: [{
      id: req.query.user,
      name: req.query.user,
      isHost: true
    }]
  });

  res.redirect(`/game/lobby/${id}`);
});

// Delete a lobby
gameRouter.get("/lobby/:id/delete", (req, res) => {
  if(!req.query.user) {
    res.redirect("/login");
    return;
  }

  let lobby = lobbies.get(req.params.id);

  if(lobby) {
    if(lobby.host === req.query.user) {
      lobbies.delete(req.params.id);
      io.emit("lobby-delete");
    } else {
      res.end("Only the host can delete this lobby.");
      return;
    }
  }

  res.end("Lobby deleted");
});

// Drop a player from the lobby
gameRouter.get("/lobby/:id/drop/:player", (req, res) => {
  if(!req.query.user) {
    res.redirect("/login");
    return;
  }

  let lobby = lobbies.get(req.params.id);

  if(lobby) {
    let idx = lobby.players.findIndex((player) => {
      return player.id === req.params.player;
    });

    if(idx !== -1) {
      io.emit("lobby-drop", {
        id: req.params.id,
        player: lobby.players[idx].id
      });

      lobby.players.splice(idx, 1);
    }

    res.end("Player removed");
  }

  res.end("No such lobby");
});

// Start the game for this lobby
gameRouter.get("/lobby/:id/start", (req, res) => {
  if(!req.query.user) {
    res.redirect("/login");
    return;
  }

  let lobby = lobbies.get(req.params.id);

  if(lobby) {
    lobbies.delete(req.params.id);
    io.emit("lobby-start", req.params.id);

    res.end("Game started");
    return;
  }

  res.end("No such lobby");
});