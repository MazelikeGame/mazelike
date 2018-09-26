import express from "express";
import Sequelize from 'sequelize';
import dotenv from 'dotenv';
import User from '../models/user.mjs';
import bcrypt from 'bcrypt';
import sql from "../sequelize";

dotenv.config();

const accountRouter = express.Router();

/**
 * Checks to make sure the user is authenticated.
 * @param req
 * @param res
 * @param next
 */
function isAuthenticated(req, res, next) {
  if(!req.session || !req.session.authenticated) {
    return res.redirect('/account/login');
  }

  req.session.cookie.expires = 600000; //Resets the cookie time.
  return next();
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
        userModel.encryptPassword(req.body.password, (err, hash) => {
          userModel.create({
            username: userModel.username,
            email: userModel.email,
            password: hash
          });
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
  req.session.destroy(function(err) {
    if(err) {
      //
    } else {
      res.redirect('login');
    }
  });
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

export default accountRouter;
