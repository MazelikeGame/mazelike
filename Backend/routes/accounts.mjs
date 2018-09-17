import express from "express";
import Sequelize from 'sequelize';
import dotenv from 'dotenv';
import { User } from '../models/user.mjs';
dotenv.config();

export const accountRouter = express.Router();

const sql = new Sequelize({
  database: process.env.DB_DATABASE,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql',
  operatorsAliases: false
});

const userModel = new User(sql);

accountRouter.get('/', function(req, res) {
  res.redirect('/'); //In the future check for auth here.
});

accountRouter.get('/create', function(req, res) {
  res.render('create_acct');
});

accountRouter.post('/create', function(req, res) {
  res.send('Account Created!');
  userModel.sync().then(() => {
    return userModel.create({
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