import express from "express";
import sequelize from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

export const accountRouter = express.Router();

accountRouter.get('/', function(req, res) {
  res.send('Hello');
});

/*
accountRouter.get('/create', function(req, res) {
  res.send('Create an account');
});*/

accountRouter.get('/create', function(req, res) {
  res.render('create_acct');
  var username = req.param('user');
  var email = req.param('email');
  var password = req.param('password');  
});

accountRouter.get('/login', function(req, res) {
  res.render('login');
});

const sql = new sequelize({
  database: process.env.DB_DATABASE,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql'
});

const User = sql.define('user', {
  firstName: {
    type: sequelize.STRING
  },
  lastName: {
    type: sequelize.STRING
  }
});

User.sync().then(() => {
  return User.create({
    firstName: 'John',
    lastName: 'Hancock'
  });
});

export default accountRouter;