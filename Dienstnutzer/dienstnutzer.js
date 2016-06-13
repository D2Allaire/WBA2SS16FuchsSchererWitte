require('dotenv').config();
var express = require("express");
var fs = require("fs");
var bodyParser = require("body-parser");
var ejs = require("ejs");
var http = require("http");

var app = express();
var getmovie;



app.use(bodyParser.json());
app.set('view engine', 'ejs');

app.get('/top', bodyParser.json(), function(req, res){


    var options = {
        host: 'localhost',
        port: '3000',
        path: '/movies/',
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Basic YWEyN2NiYzktMTY2Zi00N2MzLWE2NGUtYzIyN2Y4ZWM4M2ZiOjA3NjUxMGQ5LWU0ZjItNDkwNS04MGJkLWQxNTA5N2M0OWQ2MQ=='
        }
    };

    var externalRequest = http.request(options, function(externalResponse){
      externalResponse.on('data',function(chunk){

        var data = JSON.parse(chunk);


        console.dir(data);
        res.render('index', {
        data:data
        });

      });

    });

    externalRequest.end();

});

app.listen(3001);
console.log("Port 3001 ist nun akiv");
