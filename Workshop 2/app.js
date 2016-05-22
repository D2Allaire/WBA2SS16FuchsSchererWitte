var express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var app = express();

var movies = [
    {title: "Charlie's Country", year: "2013", genre: "Drama", plot: "Displeased with the intervention of whitefella laws, Charlie takes off to live the old way and sets off a chain reaction of enlightening difficulties.",
     poster: "http://ia.media-imdb.com/images/M/MV5BMTQ4OTg3Mzc5Ml5BMl5BanBnXkFtZTgwNTQxNzk3MTE@._V1_SX300.jpg", 
     imdb_id: "tt3244512", imdb_rating: "7.3"},
    {title: "The Road", year: "2009", genre: "Adventure, Drama", plot: "In a dangerous post-apocalyptic world, an ailing father defends his son as they slowly travel to the sea.",
     poster: "http://ia.media-imdb.com/images/M/MV5BMTAwNzk4NTU3NDReQTJeQWpwZ15BbWU3MDg3OTEyODI@._V1_SX300.jpg",
     imdb_id: "tt0898367", imdb_rating: "7.3"}
]

var user1watched = [
    {imdb_id: ""}
];

app.get('/', function (req, res) {
    var filteredData = movies.filter(function (value, index, arr) {
        var notWatched = true;
        for (var i=0; i<user1watched.length; i++) {
            if (value.imdb_id == user1watched[i].imdb_id) {
                notWatched = false;
            }
        }
        return notWatched;
    });
    
    if (filteredData.length >= 1) {
        res.status(200).json(filteredData);
    } else {
        res.status(404).end();
    }
});

app.post('/', jsonParser, function (req, res) {
    movies.push(req.body);
});

app.post('/user/:id/watched', jsonParser, function (req, res) {  
      
    if (req.params.id == '1') {
        user1watched.push(req.body);
        res.status(200).type('plain').send('Added to Watchlist.');
    } else {
        res.status(403).end();
    }
});

app.get('/user/:id/watched', function (req, res) {
   var user_id = req.params.id;
   
   if (user_id == 1) {
       res.status(200).json(user1watched);
   } else {
       res.status(403).end();
   }
});

app.listen(3000);