/* global io */
import express from "express";
import crypto from "crypto";

export let gameRouter = express.Router();

let lobbies = new Map();

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
    origin: `http://${req.headers.host}`
  });
});

// /j/:id (from the root)
export const joinRoute = (req, res) => {
  if(!req.query.user) {
    res.redirect("/login");
    return;
  }

  let lobby = lobbies.get(req.params.id);

  lobby.players.push({
    id: req.query.user,
    name: req.query.user
  });

  io.emit("lobby-add", lobby.players[lobby.players.length - 1]);

  res.redirect(`/game/lobby/${req.params.id}`);
};

gameRouter.get("/new", (req, res) => {
  if(!req.query.user) {
    res.redirect("/login");
    return;
  }

  crypto.randomBytes(9, (_, b) => {
    let id = b.toString("base64")
      .replace(/\//g, "-")
      .replace(/\+/g, "_");

    lobbies.set(id, {
      host: req.query.user,
      players: [{
        id: req.query.user,
        name: req.query.user,
        isHost: true
      }]
    });

    res.redirect(`/game/lobby/${id}`);
  });
});

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
      io.emit("lobby-drop", lobby.players[idx].id);
      lobby.players.splice(idx, 1);
    }

    res.end("Player removed");
  }

  res.end("No such lobby");
});