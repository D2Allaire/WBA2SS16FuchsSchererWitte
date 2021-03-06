// Load dependencies
require('dotenv').config();
var express = require('express');
var jsonParser = require('body-parser').json();
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var port = process.env.PORT || 3000;

var app = express();

// Initialize database
require('./config/db').connect();

// Load Middleware
require('./routes/middlewares')(passport, BasicStrategy);
app.use(passport.initialize());

// Load Routes
require('./routes/users')(app, passport, jsonParser);
require('./routes/movies')(app, passport, jsonParser);
require('./routes/regions')(app, passport, jsonParser);

// Start app
app.listen(port);
console.log("API is running on Port " + port);