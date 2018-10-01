import express from "express";
import Sequelize from 'sequelize';
import User from '../models/user.mjs';
import sql from "../sequelize";
import multer from 'multer';

var storage = multer.diskStorage({
  destination: 'Frontend/public/images',
  filename: function(req, file, cb) {
    let new_name = Date.now().toString().concat('-');
    // cb(null, file.originalname.concat('-' + Date.now()));
    cb(null, new_name.concat(file.originalname));
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
  if(req.session.authenticated) {
    res.redirect('dashboard');
  } else {
    res.render('create_acct');
  }
});

accountRouter.post('/create', upload.fields([{ name: 'avatar', maxCount: 1}]), function(req, res) {
  var userModel = new User(sql);

  userModel.username = req.body.username;
  userModel.email = req.body.email;
  userModel.image_name = req.files.avatar[0].filename;

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
            password: hash,
            image_name: userModel.image_name
          });
          res.redirect('login');
        });
      }
    });
  });
});

accountRouter.get('/edit', function(req, res) {
  if(req.session.username === undefined) {
    res.redirect('login');
  } else {
    res.render('edit_acct', {
      username: req.session.username
    });
  }
});

accountRouter.post('/edit', function(req, res) {
  var userModel = new User(sql);
  if ((req.body.email || req.body.password) && req.session.username !== undefined) {
    userModel.encryptPassword(req.body.password, (err, hash) => {
      let values = {};
      req.body.email && (values.email = req.body.email); // eslint-disable-line
      req.body.password && (values.password = hash); // eslint-disable-line
      // req.body.image && (values.image = req.body.image); // eslint-disable-line
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
    res.redirect('dashboard');
  } else {
    res.render('login');
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
          res.redirect('dashboard');
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
  if(req.session.username === undefined) {
    res.redirect('login');
  } else{
    res.render('view_acct', {
      username: req.session.username,
      email: req.user.email,
      image: req.user.image
    });
  }

});

accountRouter.get('/dashboard', function(req, res) {
  if(req.session.username === undefined) {
    res.redirect('login');
  } else{
    res.render('dashboard', {
      username: req.session.username,
    });
  }
});

export default accountRouter;
