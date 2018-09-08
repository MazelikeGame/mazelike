var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var createError = require('http-errors');
var path = require('path');
var morgan = require('morgan');
var User = require('./models/user.js');

const dashboardRouter = require('./routes/dashboard');
const publicRouter = require('./routes/public');

var app = express();

/* 8 is the length of string '/backend' */
var projectDir = __dirname.substring(0, __dirname.length - 8);
var frontendDir = projectDir.concat('/Frontend');
app.set('views', path.join(frontendDir, 'views'));
app.set('view engine', 'pug');

app.use(morgan('dev'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(frontendDir, 'public')));

app.use('/', publicRouter);
app.use('/dashboard', sessionChecker, dashboardRouter);

app.use(session({
    key: 'user_sid',
    secret: 'somerandomstuffs',
    resave: false,
    saveUnitialized: false,
    cookie: {
        expires: 600000
    }
}));

// This middleware will check if user's cookie is still saved in browser and user is not set,
// then automatically log the user out. This usually happens when you stop your express server after login,
// your cookie still remains saved in the browser.
app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');
    }
    next();
});

// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/dashboard');
    } else {
        next();
    }
};

// route for Home-Page
app.get('/', sessionChecker, (req, res) => {
    res.redirect('/login');
});

// route for user signup
app.route('/signup')
    .get(sessionChecker, (req, res) => {
        res.sendFile(frontendDir + '/views/signup.pug');
    })
    .post((req, res) => {
        User.create({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        })
            .then((user) => {
                req.session.user = user.dataValues;
                res.redirect('/dashboard');
            })
            .catch((error) => {
                res.redirect('/signup');
            });
    });

// route for user Login
app.route('/login')
    .get(sessionChecker, (req, res) => {
        res.sendFile( + '/views/login.pug');
    })
    .post((req, res) => {
        var username = req.body.username,
            password = req.body.password;

        User.findOne({ where: { username: username } }).then(function(user) {
            if (!user) {
                res.redirect('/login');
            } else if (!user.validPassword(password)) {
                res.redirect('/login');
            } else {
                req.session.user = user.dataValues;
                res.redirect('/dashboard');
            }
        });
    });

// route for user's dashboard
app.get('/dashboard', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.sendFile(frontendDir + '/views/dashboard.pug');
    } else {
        res.redirect('/login');
    }
});


// route for user logout
app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
