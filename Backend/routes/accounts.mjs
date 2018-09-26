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
}); //logging: false - to turn logging off.

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

  req.session.cookie.expires = 600000; //Resets the cookie time.
  next();
}

/**
 * DEFAULT
 */

accountRouter.get('/', function(req, res) {
  res.redirect('/'); //Redirects to the homepage.
});

/**
 * CREATE ACCOUNT GET/POST
 */

accountRouter.get('/create', function(req, res) {
  res.render('create_acct');
});

accountRouter.post('/create', function(req, res) {
  var userModel = new User(sql);

  userModel.username = req.body.username;
  userModel.email = req.body.email;

  userModel.sync().then(() => {
    userModel.findOne({
      where: {
        [Sequelize.Op.or]: [{username: req.body.username}, {email: req.body.email}]
      }
    }).then(function(user) {
      if(user) {
        res.render('create_acct', { isAuthenticated: true });
      } else {
        bcrypt.hash(req.body.password, 10, function(err, hash) {
          userModel.password = hash;
          userModel.create(userModel);
          res.redirect('/');
        });
      }
    });
  });
});

/**
 * LOGOUT
 */

accountRouter.get('/logout', isAuthenticated, function(req, res) {
  req.session.destroy();
  res.redirect('/account/login');
});

accountRouter.get('/edit', isAuthenticated, function(req, res) {
  res.send(req.session.username);
});

/**
 * LOGIN GET/POST
 */

accountRouter.get('/login', function(req, res) {
  res.render('login'); //Add isAuth to make sure you can't login again.
});

accountRouter.post('/login', function(req, res) {
  var userModel = new User(sql); //make username, email, password properties in the user model.
  userModel.findOne({
    where: {
      username: req.body.username
    }
  }).then(function(user) {
    if(user) {
      bcrypt.compare(req.body.password, user.password, function(err, result) {
        if(result) {
          req.session.authenticated = true;
          req.session.username = user.username;
          res.redirect('/');
        } else {
          res.render('login', { wrongPassword: true }); //Failed login by password.
        }
      });
    } else {
      res.render('login', { wrongUsername: true }); //Failed login by username.
    }
  });
});

accountRouter.get('/view', function(req, res) {

  res.render('view_acct', {
    username: req.session.username,
    //if user is undefined
    email: "email@example.com", //req.user.email
    //else something DO THIS OUTSIDE THE RENDER else redirect to login page @Katie-finish
  });
});

accountRouter.get('/dashboard', function(req, res) {
  res.render('dashboard', {
    username: req.session.username
  }); //redirect to login
});

export default accountRouter;
