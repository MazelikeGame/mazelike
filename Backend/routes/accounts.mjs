// jshint esversion: 6
import express from "express";
import Sequelize from 'sequelize';
import User from '../models/user.mjs';
import sql from "../sequelize";
import multer from 'multer';
import fs from 'fs';
import qs from "querystring";
import nodemailer from 'nodemailer';
import crypto from 'crypto';


var storage = multer.diskStorage({
  destination: 'Frontend/public/images',
  filename: function(req, file, cb) {
    let date_posted = Date.now().toString().concat('-');
    cb(null, date_posted.concat(file.originalname));
  }
});
var upload = multer({ storage: storage });

const accountRouter = express.Router();

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

accountRouter.post('/create', upload.fields([{ name: 'avatar', maxCount: 1}]), function(req, res) {
  var userModel = new User(sql);

  userModel.username = req.body.username;
  userModel.email = req.body.email;
  try {
    userModel.image_name = req.files.avatar[0].filename;
  } catch(e) {
    userModel.image_name = null;
  }

  userModel.sync().then(() => {
    userModel.findOne({
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
        userModel.encryptPassword(req.body.password, (err, hash) => {
          userModel.create({
            username: userModel.username,
            email: userModel.email,
            password: hash,
            image_name: userModel.image_name
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

  var userModel = new User(sql);

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
    userModel.encryptPassword(req.body.password, (err, hash) => {
      let values = {};
      req.body.email && (values.email = req.body.email); // eslint-disable-line
      req.body.password && (values.password = hash); // eslint-disable-line
      if(changing_avatar === true) {
        values.image_name = file_name;
        let file_to_delete = 'Frontend/public/images/'.concat(req.user.image_name);
        fs.unlink(file_to_delete, () => {});
      }
      let selector = {
        where: { username: req.session.username }
      };
      userModel.update(values, selector).then(function(result) {
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
  var userModel = new User(sql); //make username, email, password properties in the user model.

  userModel.findOne({
    where: {
      username: req.body.username
    }
  }).then(function(user) {
    if(user) {
      userModel.comparePassword(req.body.password, user.password, (err, result) => {
        if(result) {
          req.session.authenticated = true;
          req.session.username = user.username;
          req.session.userId = user.id;
          if(req.query.returnUrl) {
            res.redirect(req.query.returnUrl);
          } else {
            res.redirect('dashboard');
          }
        } else {
          res.render('login', {
            wrongPassword: true,
            returnUrl: req.query.returnUrl ?
              `?returnUrl=${qs.escape(req.query.returnUrl || "")}` :
              ""
          }); //Failed login by password.
        }
      });
    } else {
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

accountRouter.get('/forgot-password', function(req, res) {
  res.render('forgot-password');
});

accountRouter.post('/forgot-password', async(req, res) => {
  var userModel = new User(sql);
  const buf = crypto.randomBytes(20);
  var token = buf.toString('hex');
  let user = await userModel.findOne({
    where: {
      username: req.body.username
    }
  });
  if(!user) {
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
    // eslint-disable-next-line
    await smtpTransport.sendMail(mailOptions);
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
  var userModel = new User(sql);
  let user = await userModel.findOne({
    where: {
      resetPasswordToken: req.params.token
    }
  });
  if(!user) {
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
  var userModel = new User(sql);
  let user = await userModel.findOne({
    where: {
      resetPasswordToken: req.params.token
    }
  });
  if(!user) {
    res.render('reset', {
      tokenError: 'Reset token is invalid'
    });
  }
  userModel.encryptPassword(req.body.password, (err, hash) => {
    let values = {
      password: hash
    };
    let selector = {
      where: {
        username: user.username
      }
    };
    userModel.update(values, selector).then((result) => {
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
