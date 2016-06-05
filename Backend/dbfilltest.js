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
    function (callback) {
        fs.readFile(__dirname + "/regions_test.json", 'utf8', function (err, data) {
            if (err) throw err;
            console.log(chalk.green("Parsing " + __dirname + "/regions_short.json"));
            var temp = JSON.parse(data);
            regions = temp.regions;
            callback();
        });
    },
    // Parse movie testfile
    function (callback) {
        console.log(regions);
        async.forEachSeries(regions, function (region, callback) {
            console.log(chalk.yellow("Processing region: " + region.name));

            async.series([
                // Make Netflix API request for current region, store movies in movies
                function (callback) {
                    unirest.get("https://unogs-unogs-v1.p.mashape.com/api.cgi?q=get%3Anew9999-!1900,2017-!0,5-!7,10-!0-!Movie-!Any-!Any-!gt100&t=ns&cl=" + region.id + "&st=adv&ob=Date&p=1&sa=and")
                        .header("X-Mashape-Key", "augKdKBQYNmshFgSalRFx2WUP4DEp1Z23Hajsn48B26JtFAcdB")
                        .header("Accept", "application/json")
                        .end(function (result) {
                            console.log(chalk.green("Parsing movies from region: " + region.code));
                            var temp = result.body;
                            movies = temp.ITEMS;
                            callback();
                        });
                },
                function (callback) {
                    async.forEachSeries(movies, function (movieArr, callback) {
                        console.log("Inserting movie.");
                        var movie = {};
                        movie.title = movieArr[1];
                        movie.year = movieArr[7];
                        movie.imdb_id = movieArr[11];

                        console.log(movie.imdb_id);

                        db.hget("movies", movie.imdb_id, function (err, rep) {
                            if (rep) {
                                console.log(chalk.red("Movie " + movie.imdb_id + " already exists, adding region."));
                                async.parallel([
                                    function(callback) {
                                        db.sadd("region:" + region.code + ":movies", movie.imdb_id, function(err, rep) {
                                            if (rep > 0) {
                                                console.log("Movie added to region.");
                                            } else {
                                                console.log("Movie already added to region.");
                                            }
                                            callback();
                                        });
                                    },
                                    function(callback) {
                                        db.sadd("movie:" + rep + ":regions", region.code, function(err, rep) {
                                            if (rep > 0) {
                                                console.log("Region already added to movie.");
                                            } else {
                                                console.log("Region added to movie");
                                            }
                                            callback();
                                        });
                                    }
                                ], function(err) {
                                    callback();
                                });
                 
                            } else if (rep == 0) {
                                async.series([
                                    // Get IMDB Data from OMDB API
                                    function (callback) {
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
                                    function (callback) {
                                        db.incr('id:movie', function (err, rep) {
                                            console.log(chalk.blue("Getting next ID: " + rep));
                                            movie.id = rep;
                                            callback();
                                        });
                                    },
                                    // Do the necessary database insertions
                                    function (callback) {
                                        async.parallel([
                                            // Insert movie as a new key-value pair
                                            function (callback) {
                                                db.set('movie:' + movie.id, JSON.stringify(movie), function (err, rep) {
                                                    console.log(chalk.blue("Inserting movie " + movie.imdb_id + "."));
                                                    callback();
                                                });
                                            },
                                            // Insert movie into the movies hash
                                            function (callback) {
                                                db.hset("movies", movie.imdb_id, movie.id, function (err, rep) {
                                                    console.log(chalk.blue("Adding movie " + movie.imdb_id + " to list."));
                                                    callback();
                                                });
                                            },
                                            // Add region to movie
                                            function (callback) {
                                                db.sadd("movie:" + movie.id + ":regions", region.code, function (err, rep) {
                                                    console.log(chalk.blue("Adding region " + region.code + " to movie " + movie.imdb_id + "."));
                                                    callback();
                                                });
                                            },
                                            // Add movie to region
                                            function (callback) {
                                                db.sadd("region:" + region.code + ":movies", movie.imdb_id, function (err, rep) {
                                                    console.log(chalk.blue("Adding movie " + movie.imdb_id + " to region " + region.code));
                                                    callback();
                                                });
                                            }
                                        ], function (err) {
                                            callback();
                                        })
                                    }

                                ], function (err) {
                                    console.log("Movie added.");
                                    callback();
                                });
                            }
                        });
                    }, function (err) {
                        callback();
                    });
                }
            ], function (err) {
                console.log("Region completed.");
                callback();
            });

        }, function (err) {
            callback();
        });
    }
], function (err) {
    console.log("All movies processed.");
    return;
});