var redis = require("redis");
var fs = require('fs');
var unirest = require('unirest');
const chalk = require('chalk');

var db = redis.createClient();
var obj;
var movies;

// Read region JSON file
fs.readFile(__dirname + "/regions_short.json", 'utf8', function (err, data) {
    if (err) throw err;
    console.log(chalk.green("Parsing " + __dirname + "/regions_short.json"));
    obj = JSON.parse(data);

    // Run through each region and make API requests
    var i = 0;
    var region = obj.regions[i];

    fs.readFile(__dirname + "/austest.json", 'utf8', function (err, data) {
        if (err) throw err;
        console.log(chalk.green("Parsing " + __dirname + "/austest.json"));
        movies = JSON.parse(data);

        insertMovies(movies.ITEMS, region);
    });
});

function insertMovies(movies, region) {
    var movieArr;

    if (movies.length == 0) {
        return;
    }

    movieArr = movies.pop();

    var movie = {};
    movie.title = movieArr[1];
    movie.year = movieArr[7];
    movie.imdb_id = movieArr[11];

    console.log(movie.imdb_id);

    db.hexists("movies", movie.imdb_id, function (err, rep) {
        if (rep == 1) {
            console.log(chalk.red("Movie " + movie.imdb_id + " already exists, adding region."));
            db.sadd("region:" + region.code + ":movies", movie.imdb_id);
            insertMovies(movies, region);
        } else if (rep == 0) {
            unirest.get("http://www.omdbapi.com/?i=" + movie.imdb_id + "&plot=short&r=json")
                .header("Accept", "application/json")
                .end(function (result) {
                    var parsedMovie = result.body;
                    movie.plot = parsedMovie.Plot;
                    movie.genre = parsedMovie.Genre;
                    movie.poster = parsedMovie.Poster;
                    movie.imdb_rating = parsedMovie.imdbRating;

                    db.incr('id:movie', function (err, rep) {
                        console.log(chalk.blue("Getting next ID: " + rep));
                        movie.id = rep;
                        db.set('movie:' + movie.id, JSON.stringify(movie), function (err, rep) {
                            console.log(chalk.blue("Inserting movie " + movie.imdb_id + "."));
                            if (rep) {
                                db.hset("movies", movie.imdb_id, movie.id, function (err, rep) {
                                    console.log(chalk.blue("Adding movie " + movie.imdb_id + " to list."));
                                    db.sadd("movie:" + movie.id + ":regions", region.code, function (err, rep) {
                                        console.log(chalk.blue("Adding region "+region.code+" to movie " + movie.imdb_id +"."));
                                        db.sadd("region:" + region.code + ":movies", movie.imdb_id, function(err, rep) {
                                            console.log(chalk.blue("Adding movie "+movie.imdb_id+" to region " + region.code));
                                            insertMovies(movies, region);
                                        });
                                    });
                                });
                            }
                        });
                    });
                });     
        }
    });
}