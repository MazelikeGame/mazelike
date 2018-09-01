var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var path = require('path');
var logger = require('morgan');

const dashboardRouter = require('./routes/dashboard');
const publicRouter = require('./routes/public');

var app = express();

// view engine setup

/* 8 is the length of string '/backend' */
var projectDir = __dirname.substring(0, __dirname.length - 8);
var frontendDir = projectDir.concat('/Frontend');
app.set('views', path.join(frontendDir, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(frontendDir, 'public')));
app.use(cookieParser());

app.use('/', publicRouter);
app.use('/dashboard', dashboardRouter);

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
