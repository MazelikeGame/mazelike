import express from "express";
import Sequelize from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

export const accountRouter = express.Router();

const Sql = new Sequelize({
  database: process.env.DB_DATABASE,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql'
});

const User = Sql.define('user', {
  username: {
    type: Sequelize.STRING
  },
  email: {
    type: Sequelize.STRING
  },
  password: {
    type: Sequelize.STRING
  }
});

accountRouter.get('/', function(req, res) {
  res.redirect('/'); //In the future check for auth here.
});

accountRouter.get('/create', function(req, res) {
  res.render('create_acct');
});

accountRouter.post('/create', function(req, res) {
  res.send('Account Created!');
  User.sync().then(() => {
    return User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    });
  });
});

accountRouter.get('/login', function(req, res) {
  res.render('login');
});

export default accountRouter;