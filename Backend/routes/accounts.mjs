import express from "express";

export const accountRouter = express.Router();

accountRouter.get('/', function(req, res) {
  res.send('Hello');
});

accountRouter.get('/create', function(req, res) {
  res.send('Create an account');
});

accountRouter.get('/login', function(req, res) {
  res.render('login');
});

export default accountRouter;