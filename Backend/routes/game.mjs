import express from "express";

const gameRouter = express.Router();

gameRouter.get("/lobby/:id", (req, res) => {
  res.render("lobby", {
    id: req.param.id,
    isHost: req.query.user === "host",
    user: req.query.user,
    players: (req.query.person || [])
      .map((k, j) => ({ name: k, isHost: k == "host", id: j }))
  });
});

export default gameRouter;