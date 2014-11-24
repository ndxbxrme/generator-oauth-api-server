'use strict';
var express = require('express'),
    compression = require('compression'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    flash = require('connect-flash'),
    morgan = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session');
var app = express();

app.set('port', process.env.PORT || 3000);
app.use(compression())
.use(morgan('dev'))
.use(cookieParser())
.use(bodyParser.json())
.use(bodyParser.urlencoded({extended:true}))
.use(session({secret:process.env.SESSION_SECRET, saveUninitialized:true, resave:true}))
.use(passport.initialize())
.use(passport.session())
.use(flash());

mongoose.connect(process.env.DBURL);

require('./config/passport')(passport);

require('./routes.js')(app, passport);

require('./angular.js')(app);

app.listen(app.get('port'));
console.log('api server listening on ' + app.get('port'));