// Load dependencies
require('dotenv').config();
var express = require('express');
var jsonParser = require('body-parser').json();

var app = express();
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

// Load Controllers
require('./controllers/home')(app, jsonParser);

// Start app
app.listen(3001);
console.log("Service Consumer is running on Port 3001.");