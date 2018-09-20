import express from "express";
import Sequelize from 'sequelize';
import dotenv from 'dotenv';
import User from '../models/user.mjs';
import bcrypt from 'bcrypt';

dotenv.config();

const accountRouter = express.Router();

const sql = new Sequelize({
  database: process.env.DB_DATABASE,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql',
  operatorsAliases: false
});

accountRouter.get('/', function(req, res) {
  res.redirect('/'); //In the future check for auth here.
});

accountRouter.get('/create', function(req, res) {
  res.render('create_acct');
});

accountRouter.get('/update', function(req, res) {
  res.render('edit_acct');
});

accountRouter.post('/update/:accountId', function(req, res) {
  var userModel = new User(sql);
  userModel.sync().then(() => {
    const Op = Sequelize.Op;
    userModel.findOne({
      where: {
        [Op.or]: [{username: req.body.username}, {email: req.body.email}]
      }
    }).then(function(user) {
      if(user) {
        res.send("Username or email already exists!");
      } else {
        userModel.update({
          username: req.body.username,
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password, 10)
        });
        res.send('Account updated!');
      }
    });
  });
});

accountRouter.post('/create', function(req, res) {
  var userModel = new User(sql); //make username, email, password properties in the user model.

  /*
  //When cleaning up, switch to this, instead of directly assigning password.
  userModel.beforeCreate(() => {
    bcrypt.hashSync(req.body.password, 10);
  });*/

  userModel.sync().then(() => {
    const Op = Sequelize.Op;
    userModel.findOne({
      where: {
        [Op.or]: [{username: req.body.username}, {email: req.body.email}]
      }
    }).then(function(user) {
      if(user) {
        res.send("Username or email already exists!");
      } else {
        //The req.body needs sanitized and checked for valid inputs in the future.
        //Shouldn't be assinging bcrypt.hashSync here.
        userModel.create({
          username: req.body.username,
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password, 10)
        });
        res.send('Account Created!');
      }
    });
  });
});

accountRouter.get('/login', function(req, res) {
  res.render('login');
});

export default accountRouter;
