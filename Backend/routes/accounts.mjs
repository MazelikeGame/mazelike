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

/**
 * Checks to make sure the user is authenticated.
 * @param req 
 * @param res 
 * @param next 
 */
function isAuthenticated(req, res, next) {
  if(!req.session || !req.session.authenticated) {
    res.redirect('/account/login');
  }

  req.session.cookie.expires = 600000;
  next();
}

accountRouter.get('/', function(req, res) {
  res.redirect('/');
});

accountRouter.get('/create', function(req, res) {
  res.render('create_acct');
});

accountRouter.post('/create', function(req, res) {
  var userModel = new User(sql); //make username, email, password properties in the user model.
  userModel.password = "hi";
  /*
  //When cleaning up, switch to this, instead of directly assigning password.
  userModel.beforeCreate(() => {
    bcrypt.hashSync(req.body.password, 10);
  });*/

  userModel.sync().then(() => {
    userModel.findOne({
      where: {
        [Sequelize.Op.or]: [{username: req.body.username}, {email: req.body.email}]
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
          password: req.body.password
        });
        res.send('Account Created!');
      }
    });
  });
});

accountRouter.get('/logout', isAuthenticated, function(req, res) {
  req.session.destroy();
  res.redirect('/account/login');
});

accountRouter.get('/login', function(req, res) {
  res.render('login'); //Add isAuth to make sure you can't login again.
});

accountRouter.get('/edit', isAuthenticated, function(req, res) {
  res.send(req.session.username);
});

accountRouter.post('/login', function(req, res) {

  var userModel = new User(sql); //make username, email, password properties in the user model.
  userModel.findOne({
    where: {
      username: req.body.username, 
      password: req.body.password
    }
  }).then(function(user) {
    if(user) {
      req.session.authenticated = true;
      req.session.username = user.username;
      res.redirect('/');
    } else {
      res.redirect('/account/login'); //Fail login
    }
  });
  /*
  if (req.body.username && req.body.username === 'test'  
  && req.body.password && req.body.password === 'password') { //Put SQL check here...
    
    //Login works
    req.session.authenticated = true;
    req.session.username = 'test';
    res.redirect('/');
  } else {
    res.redirect('/account/login'); //Fail login
  }*/
});

export default accountRouter;