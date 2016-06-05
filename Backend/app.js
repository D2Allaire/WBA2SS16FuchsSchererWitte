var express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var redis = require("redis");
var db = redis.createClient();

var app = express();

app.get('/movie', function (req, res) {
    db.srandmember("region:us:movies", function(err, rep) {
        
        // rep is a random IMDB id from the database
        if (rep) {
          db.hget("movies", rep, function(err, rep) {
              // rep is the id of the movie key-value pair associated with the previous IMDB id
              db.get("movie:"+rep, function(err, rep) {
                  // rep is the value of movie:id, so a JSON object in string format
                  var movie = JSON.parse(rep);
                  res.status(200).type('json').json(movie);
              });
          });
            
        }
        
        else {
            res.status(404).type('text').send('Keine Filme gefunden.');
        }
    });
    
});

app.post('/user', function(req, res) {
    
    var newUser = req.body;
    db.incr('id:user', function (err,rep) {
        
        newUser.id = rep;
       
       db.set('user:' + newUser.id, JSON.stringify(newUser), function(err, rep) {
       
       res.json(newUser);    
       }); 
       
    });
});

app.get('/user/:id', function(req, res) {
    
    db.get('user:' + req.params.id, function(err, rep) {
        
        if (rep) {
            res.type('json').send(rep);
        }
        else {
            res.status(404).type('text').send("Der user mit der ID " + req.param.id + " ist nicht vorhanden");
        }
    });
});

app.put('/user/:id', function(req, res) {
   
   db.exists('user:' + req.params.id, function(err, rep) {
       if(rep == 1 ) {
           var updatedUser = req.body;
           updatedUser.id = req.params.id;
           db.set('user:' + req.params.id, JSON.stringify(updatedUser), function(err, rep) {
               res.json(updatedUser);
           });
       }
       else {
           res.status(404).type('text').send("Der user mit der ID " + req.param.id + " ist nicht vorhanden");
       }
   });
});

app.listen(3000);