// jshint esversion: 6
/* global ml */
import express from "express";
import Sequelize from 'sequelize';
import User from '../models/user.mjs';
import sql from "../sequelize";
import multer from 'multer';
import fs from 'fs';
import qs from "querystring";
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const DATA_DIR = process.env.PUBLIC_DIR || "Frontend/public";

var storage = multer.diskStorage({
  destination: `${DATA_DIR}/images`,
  filename: function(req, file, cb) {
    let date_posted = Date.now().toString().concat('-');
    cb(null, date_posted.concat(file.originalname));
  }
});
var upload = multer({ storage: storage });

const accountRouter = express.Router();

accountRouter.use((req, res, next) => {
  res.set("Cache-Control", "no-cache");
  next();
});

/**
 * Checks to make sure the user is authenticated.
 * @param req
 * @param res
 * @param next
 */
function isAuthenticated(req, res, next) {
  res.loginRedirect();

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
  if(req.session.authenticated) {
    res.redirect('dashboard');
  } else {
    res.render('create_acct', {
      returnUrl: req.query.returnUrl ?
        `?returnUrl=${qs.escape(req.query.returnUrl || "")}` :
        ""
    });
  }
});

accountRouter.post('/create', upload.fields([{ name: 'avatar', maxCount: 1}]), async(req, res) => {

  let image_name = null;
  try {
    image_name = req.files.avatar[0].filename;
  } catch(e) {
    image_name = null;
  }

  let username = req.body.username;
  let email = req.body.email;

  User.sync().then(() => {
    User.findOne({
      where: {
        [Sequelize.Op.or]: [{username: req.body.username}, {email: req.body.email}]
      }
    }).then(function(user) {
      if(user) {
        res.render('create_acct', {
          isAuthenticated: true,
          returnUrl: req.query.returnUrl ?
            `?returnUrl=${qs.escape(req.query.returnUrl || "")}` :
            ""
        });
      } else {
        ml.logger.info(`Created user ${username}`, ml.tags.account);
        User.encryptPassword(req.body.password, (err, hash) => {
          User.create({
            username: username,
            email: email,
            password: hash,
            image_name: image_name
          });
          res.loginRedirect(req.query.returnUrl || "");
        });
      }
    });
  });
});

accountRouter.get('/edit', function(req, res) {
  if(res.loginRedirect()) {
    return;
  }

  res.render('edit_acct', {
    username: req.session.username,
    image: req.user.image_name || "../../img/profilepic.jpg"
  });
});

// I will refactor this in the future
accountRouter.post('/edit', upload.fields([{ name: 'avatar', maxCount: 1}]), function(req, res) { // eslint-disable-line
  if(res.loginRedirect()) {
    return;
  }

  var argument, file_name;
  var changing_avatar = false;
  try {
    file_name = req.files.avatar[0].filename;
    argument = req.body.email || req.body.password || req.files.avatar[0].filename;
    changing_avatar = true;
  } catch (e) {
    argument = req.body.email || req.body.password;
  }

  if (argument && req.session.username !== undefined) {
    User.encryptPassword(req.body.password, (err, hash) => {
      let values = {};
      if(req.body.email) {
        values.email = req.body.email;
        ml.logger.verbose(`Updating email for ${req.session.username} to ${req.body.email}`, ml.tags.account);
      }
      if(req.body.password) {
        values.password = hash;
        ml.logger.verbose(`Updating password for ${req.session.username}`, ml.tags.account);
      }
      if(changing_avatar === true) {
        values.image_name = file_name;
        let file_to_delete = `${DATA_DIR}/images/${req.user.image_name}`;
        fs.unlink(file_to_delete, () => {});
        ml.logger.verbose(`Update profie pic for ${req.session.username}`, ml.tags.account);
      }
      let selector = {
        where: { username: req.session.username }
      };
      ml.logger.info(`Updated account ${req.session.username}`, ml.tags.account);
      User.update(values, selector).then(function(result) {
        if(result) {
          res.redirect('dashboard');
        } else {
          res.redirect('edit_acct');
        }
      });
    });
  }
});


/**
 * LOGOUT
 */
accountRouter.get('/logout', isAuthenticated, function(req, res) {
  ml.logger.info(`${req.session && req.session.username} logged out`, ml.tags.account);
  req.session.destroy(function(err) {
    if(!err) {
      res.redirect('login');
    }
  });
});

/**
 * LOGIN GET/POST
 */
accountRouter.get('/login', function(req, res) {
  if(req.session.authenticated) {
    if(req.query.returnUrl) {
      res.redirect(req.query.returnUrl);
    } else {
      res.redirect('dashboard');
    }
  } else {
    res.render('login', {
      returnUrl: req.query.returnUrl ?
        `?returnUrl=${qs.escape(req.query.returnUrl || "")}` :
        ""
    });
  }
});

accountRouter.post('/login', function(req, res) {
  User.findOne({
    where: {
      username: req.body.username
    }
  }).then(function(user) {
    if(user) {
      User.comparePassword(req.body.password, user.password, (err, result) => {
        if(result) {
          ml.logger.info(`${req.body.username} logged in`, ml.tags.account);
          req.session.authenticated = true;
          req.session.username = user.username;
          req.session.userId = user.id;
          if(req.query.returnUrl) {
            res.redirect(req.query.returnUrl);
          } else {
            res.redirect('dashboard');
          }
        } else {
          ml.logger.verbose(`${req.body.username} failed to login because of invalid password`, ml.tags.account);
          res.render('login', {
            wrongPassword: true,
            returnUrl: req.query.returnUrl ?
              `?returnUrl=${qs.escape(req.query.returnUrl || "")}` :
              ""
          }); //Failed login by password.
        }
      });
    } else {
      ml.logger.verbose(`${req.body.username} failed to login because the user did not exist`, ml.tags.account);
      res.render('login', {
        wrongUsername: true,
        returnUrl: req.query.returnUrl ?
          `?returnUrl=${qs.escape(req.query.returnUrl || "")}` :
          ""
      }); //Failed login by username.
    }
  });
});

accountRouter.get('/view', function(req, res) {
  if(res.loginRedirect()) {
    return;
  }

  res.render('view_acct', {
    username: req.session.username,
    email: req.user.email,
    image: req.user.image_name || "../../img/profilepic.jpg"
  });
});

// Check if forgot password is enabled if not send an error message to the user
const checkForgotPassword = (res) => {
  if(!process.env.MAILER_EMAIL_ID || !process.env.MAILER_PASSWORD || !process.env.MAILER_SERVICE_PROVIDER) {
    res.render('forgot-password', {
      badError: new Error("Forgot password is not enabled")
    });

    return false;
  }

  return true;
};

accountRouter.get('/forgot-password', function(req, res) {
  if(!checkForgotPassword(res)) {
    return;
  }

  res.render('forgot-password');
});

/* eslint-disable complexity */
accountRouter.post('/forgot-password', async(req, res) => {
  if(!checkForgotPassword(res)) {
    return undefined;
  }
  
  const buf = crypto.randomBytes(20);
  var token = buf.toString('hex');
  let user = await User.findOne({
    where: {
      username: req.body.username
    }
  });
  if(!user) {
    ml.logger.verbose(`Forgot password failed because ${req.body.username} does not exist`, ml.tags.account);
    return res.render('forgot-password', {
      noUserExists: true
    });
  }
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000;
  user.save();

  let smtpTransport = nodemailer.createTransport({
    service: process.env.MAILER_SERVICE_PROVIDER,
    auth: {
      user: process.env.MAILER_EMAIL_ID,
      pass: process.env.MAILER_PASSWORD
    }
  });
  let mailOptions = {
    from: process.env.MAILER_EMAIL_ID,
    to: user.email,
    subject: 'MazeLike Password Reset',
    // eslint-disable-next-line prefer-template
    text: 'Greetings ' + req.body.username +
    ',\n\nPlease click the following link, or paste this into your browser to complete the process.\n\n' +
    ' http://' + req.headers.host + '/account/reset/' + token + ' \n\n' +
    'If you did not request this, please ignore this email and your password will remain unchanged.' +
    '\n\nThank you,\nMazeLike'
  };
  try {
    await smtpTransport.sendMail(mailOptions);
    ml.logger.info(`Sent forget password email to ${user.email} for ${user.username}`, ml.tags.account);
  } catch (err) {
    return res.render('forgot-password', {
      badError: err
    });
  }
  return res.render('forgot-password', {
    accountFound: true
  });
});

accountRouter.get('/reset/:token', async(req, res) => {
  let user = await User.findOne({
    where: {
      resetPasswordToken: req.params.token
    }
  });
  if(!user) {
    ml.logger.verbose(`Password reset token ${req.params.token} is invalid`, ml.tags.account);
    return res.render('forgot-password', {
      badError: 'Password reset token is invalid or has expired. '.concat(user)
    });
  }
  return res.render('reset_password', {
    token: req.params.token,
    username: user.username
  });
});

accountRouter.post('/reset/:token', async(req, res) => {
  let user = await User.findOne({
    where: {
      resetPasswordToken: req.params.token
    }
  });
  if(!user) {
    ml.logger.verbose(`Password reset token ${req.params.token} is invalid`, ml.tags.account);
    res.render('reset', {
      tokenError: 'Reset token is invalid'
    });
  }
  User.encryptPassword(req.body.password, (err, hash) => {
    let values = {
      password: hash
    };
    let selector = {
      where: {
        username: user.username
      }
    };
    ml.logger.info(`Reset password for ${user.username}`, ml.tags.account);
    User.update(values, selector).then((result) => {
      if(result) {
        res.render('reset_password', {
          successfulReset: 'Password reset was successful for user '.concat(user.username)
        });
      } else {
        res.render('reset/'.concat(req.params.token), {
          tokenError: 'Could not reset password for '.concat(user.username)
        });
      }
    });
  });
});
/* eslint-enable complexity */

accountRouter.get('/dashboard', async(req, res) => {
  if(res.loginRedirect()) {
    return;
  }
  let lobbies = await sql.query(`
    SELECT l1.playerId, l1.lobbyId FROM lobbies l1
    WHERE l1.lobbyId IN (SELECT l.lobbyId FROM lobbies l WHERE l.playerId = :userId)
    AND l1.isHost = 1
    ORDER BY l1.lobbyId;`, {
    replacements: {
      userId: req.user.username
    },
    type: sql.QueryTypes.SELECT
  });
  res.render('dashboard', {
    username: req.session.username,
    image: req.user.image_name || "../../img/profilepic.jpg",
    lobbies
  });
});

export default accountRouter;
