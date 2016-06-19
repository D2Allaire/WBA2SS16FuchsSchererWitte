// Load dependencies
require('dotenv').config();
var express = require('express');
var jsonParser = require('body-parser').json();
var unirest = require('unirest');
var auth = new Buffer(process.env.API_USER + ":" + process.env.API_PW).toString('base64');

var app = express();
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

// Load Controllers
require('./controllers/home')(app, jsonParser, unirest, auth);
require('./controllers/movies')(app, jsonParser, unirest, auth);

// Start app
app.listen(3001);
console.log("Service Consumer is running on Port 3001.");