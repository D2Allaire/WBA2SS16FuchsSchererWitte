require('dotenv').config();
var express = require("express");
var fs = require("fs");
var bodyParser = require("body-parser");
var ejs = require("ejs");
var http = require("http");

var app = express();
var getmovie;



app.use(bodyParser.json());

function (callback) {
    unirest.get("localhost:3000/movies/")
        .header("Accept", "application/json")
        .header("Authorization", "Basic YWEyN2NiYzktMTY2Zi00N2MzLWE2NGUtYzIyN2Y4ZWM4M2ZiOjA3NjUxMGQ5LWU0ZjItNDkwNS04MGJkLWQxNTA5N2M0OWQ2MQ==")
        .end(function (result) {
            getmovie = result.body;

        });
},

app.listen(3001);
console.log("Port 3001 ist nun akiv");
