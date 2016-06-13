var express = require("express");
var fs = require("fs");
var bodyParser = require("body-parser");
var ejs = require("ejs");
var http = require("http");

var app = express();



app.use(bodyParser.json());

//Beim Aufruf der Route "/" wird die Index Seite aufgerufen
app.get("/", function(req, res){
    res.render('index.ejs');
});



app.get("/movie/de", function(req, res){
    fs.readFile("./test_website.ejs", {encoding:"utf-8"}, function(err, filestring){
        if(err) {
            throw err;
            console.log("Etwas ist schief gegangen");
        }
        else {
            var options = {
                host: "localhost",
                port: 3000,
                path: "/movie/de",
                method: "GET",
                headers : {
                    accept : "application/json"
                }
            }

            var externalRequest = http.request(options, function(externalResponse){
                console.log("Es wird nach einem Film gesucht");
                externalResponse.on("data", function(chunk){
                    console.log(chunk);
                    var objektive = JSON.parse(chunk);
                    console.log(movie);
                    var html = ejs.render(filestring, {movie: movie});
                    res.setHeader("content-type", "text/html");
                    res.writeHead(200);
                    res.write(html);
                    res.end();
                });
            });
            externalRequest.end();
        }
    });
});

app.listen(3001);
console.log("Port 3001ist nun akiv");
