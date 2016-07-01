// Load dependencies
require('dotenv').config();
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
var unirest = require('unirest');
var passport = require('passport');
var auth = new Buffer(process.env.API_USER + ":" + process.env.API_PW).toString('base64');
var port = process.env.PORT || 3001;

var app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(session({
  secret: 'KoolCat',
  resave: false,
  saveUninitialized: true
}))

require('./config/passport')(passport, unirest, auth);

app.use(passport.initialize());
app.use(passport.session());

// Load Controllers
require('./controllers/auth')(app, unirest, auth, passport);
require('./controllers/home')(app, unirest, auth);
require('./controllers/movies')(app, unirest, auth);

// Start app
app.listen(port);
console.log("Service Consumer is running on Port " + port);