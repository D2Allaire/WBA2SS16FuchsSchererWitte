var redis = require("redis");
var fs = require('fs');
var unirest = require('unirest');
const chalk = require('chalk');
var async = require('async');

var db = redis.createClient();
var obj;
var movies;
var regions;

async.series([
    // Parse region JSON file
    function(callback) {
        fs.readFile(__dirname + "/regions_short.json", 'utf8', function (err, data) {
            if (err) throw err;
            console.log(chalk.green("Parsing " + __dirname + "/regions_short.json"));
            regions = JSON.parse(data);
            callback();
        });
    },
    // Parse movie testfile
    function(callback) {
        fs.readFile(__dirname + "/austest.json", 'utf8', function (err, data) {
            if (err) throw err;
            console.log(chalk.green("Parsing " + __dirname + "/austest.json"));
            obj = JSON.parse(data);
            movies = obj.ITEMS;
            callback();
        });
    }, 
    function(callback) {
        async.forEachSeries(movies, function(movie, callback) {
            console.log("Inserting movie.");
            insertMovie(movie, regions.regions[0]);
            callback();
        }, function(err) {
            callback();
        });
    }
], function(err) {
    console.log("All movies processed.");
});


function insertMovie(movieArr, region) {
    var movie = {};
    movie.title = movieArr[1];
    movie.year = movieArr[7];
    movie.imdb_id = movieArr[11];

    console.log(movie.imdb_id);

    db.hexists("movies", movie.imdb_id, function (err, rep) {
        if (rep == 1) {
            console.log(chalk.red("Movie " + movie.imdb_id + " already exists, adding region."));
            db.sadd("region:" + region.code + ":movies", movie.imdb_id);
            return 1;
        } else if (rep == 0) {
            async.series([
                // Get IMDB Data from OMDB API
                function(callback) {
                    unirest.get("http://www.omdbapi.com/?i=" + movie.imdb_id + "&plot=short&r=json")
                        .header("Accept", "application/json")
                        .end(function (result) {
                            var parsedMovie = result.body;
                            movie.plot = parsedMovie.Plot;
                            movie.genre = parsedMovie.Genre;
                            movie.poster = parsedMovie.Poster;
                            movie.imdb_rating = parsedMovie.imdbRating;
                            callback();
                        });
                },
                // Get new ID for database insertion
                function(callback) {
                    db.incr('id:movie', function (err, rep) {
                        console.log(chalk.blue("Getting next ID: " + rep));
                        movie.id = rep;
                        callback();
                    });
                },
                // Do the necessary database insertions
                function(callback) {
                    async.parallel([
                        // Insert movie as a new key-value pair
                        function(callback) {
                            db.set('movie:' + movie.id, JSON.stringify(movie), function (err, rep) {
                                console.log(chalk.blue("Inserting movie " + movie.imdb_id + "."));
                                callback();
                            });
                        },
                        // Insert movie into the movies hash
                        function(callback) {
                            db.hset("movies", movie.imdb_id, movie.id, function (err, rep) {
                                console.log(chalk.blue("Adding movie " + movie.imdb_id + " to list."));
                                callback();
                            });
                        },
                        // Add region to movie
                        function(callback) {
                            db.sadd("movie:" + movie.id + ":regions", region.code, function (err, rep) {
                                console.log(chalk.blue("Adding region "+region.code+" to movie " + movie.imdb_id +"."));
                                callback();
                            });
                        },
                        // Add movie to region
                        function(callback) {
                            db.sadd("region:" + region.code + ":movies", movie.imdb_id, function(err, rep) {
                                console.log(chalk.blue("Adding movie "+movie.imdb_id+" to region " + region.code));
                                callback();
                            });
                        }
                    ], function(err) {
                        callback();
                    })
                                
                }
                
            ], function(err) {
                console.log("All movies added!");
                return 0;
            });
        }
    });
}