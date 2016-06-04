var express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var redis = require("redis");
var db = redis.createClient();

var app = express();

app.get('/movie', function (req, res) {
    var movie;
    db.srandmember("region:us:movies", function(err, rep) {
        
        // rep is a random IMDB id from the database
        if (rep) {
          db.hget("movies", rep, function(err, rep) {
              // rep is the id of the movie key-value pair associated with the previous IMDB id
              db.get("movie:"+rep, function(err, rep) {
                  // rep is the value of movie:id, so a JSON object in string format
                  movie = JSON.parse(rep);
              });
          });
            
        }
        
        else {
            res.status(404).type('text').send('Keine Filme gefunden.');
        }
    });
    
    res.status(200).type('json').json(movie);
});