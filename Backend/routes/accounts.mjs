import express from "express";

export const accountRouter = express.Router();

accountRouter.get('/', function(req, res) {
  res.send('Hello');
});

accountRouter.get('/register', function(req, res) {
  res.send('Register');
});

accountRouter.get('/login', function(req, res) {
  res.send('Login');
});

export default accountRouter;
