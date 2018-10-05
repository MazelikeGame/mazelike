import express from "express";
import Sequelize from 'sequelize';
import User from '../models/user.mjs';
import sql from "../sequelize";
import multer from 'multer';
import fs from 'fs';
import qs from "querystring";


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

accountRouter.post('/forgot-password', function(req, res) {
  var userModel = new User(sql);

  userModel.sync().then(() => {
    userModel.findOne({
      where: {
        [Sequelize.Op.or]: [{ username: req.body.username }, {email: req.body.username}]
      }
    }).then((user) => {
      if(user) {
        res.render('forgot-password', {
          accountFound: true
        });
      } else {
        res.render('forgot-password', {
          noEmailExists: true
        });
      }
    });
  });
});

accountRouter.get('/dashboard', function(req, res) {
  if(res.loginRedirect()) {
    return;
  }

  res.render('dashboard', {
    username: req.session.username,
    image: req.user.image_name || "../../img/profilepic.jpg"
  });
});

export default accountRouter;
