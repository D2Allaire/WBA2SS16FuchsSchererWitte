require('dotenv').config({ path: '../.env' });
var fs = require('fs');
var unirest = require('unirest');
const chalk = require('chalk');
var async = require('async');
var RateLimiter = require('limiter').RateLimiter;

require('../config/db').connect();
// Load Models
var Movie = require('../models/movie');
var Region = require('../models/region');

var movies;
var regions;
var limiter = new RateLimiter(200, 'minute');


async.series([
    // Parse region JSON file
    function (callback) {
        fs.readFile("../libs/regions/regions_test.json", 'utf8', function (err, data) {
            if (err) throw err;
            console.log(chalk.green("Parsing " + "regions_short.json"));
            var temp = JSON.parse(data);
            regions = temp.regions;
            callback();
        });
    },
    // Loop through all regions and insert movies
    function (callback) {
        console.log(regions);

        // Loop through all regions
        async.forEachSeries(regions, function (region, callback) {
            console.log(chalk.yellow("Processing region: " + region.name));

            async.series([
                // Make Netflix API request for current region, store movies in movies
                function (callback) {
                    unirest.get("https://unogs-unogs-v1.p.mashape.com/api.cgi?q=get%3Anew9999-!1900,2017-!0,5-!7,10-!0-!Movie-!Any-!Any-!gt1000&t=ns&cl=" + region.id + "&st=adv&ob=Date&p=1&sa=and")
                        .header("X-Mashape-Key", process.env.UNOGS)
                        .header("Accept", "application/json")
                        .end(function (result) {
                            console.log(chalk.green("Parsing movies from region: " + region.code));
                            var temp = result.body;
                            movies = temp.ITEMS;
                            callback();
                        });
                },

                // Loop through all movies and insert
                function (callback) {
                    // Loop through movies
                    async.forEachSeries(movies, function (movieArr, callback) {
                        console.log("Inserting movie.");
                        var movie = {};
                        movie.title = movieArr[1];
                        movie.year = movieArr[7];
                        movie.imdb_id = movieArr[11];

                        console.log(movie.imdb_id);

                        // Check if movie is already in database
                        Movie.exists(movie.imdb_id, function (result) {
                            if (result == true) {
                                console.log(chalk.red("Movie " + movie.imdb_id + " already exists, adding region."));
                                async.parallel([
                                    function (callback) {
                                        // Add region to movie
                                        Movie.addRegion(movie.imdb_id, region.code, function (err) {
                                            if (err) console.log(err.message);
                                            callback();
                                        });
                                    },
                                    function (callback) {
                                        // Add movie to region
                                        Region.addMovie(region.code, movie.imdb_id, function (err) {
                                            if (err) console.log(err.message);
                                            callback();
                                        });
                                    }
                                ], function (err) {
                                    callback();
                                });
                            } else {
                                limiter.removeTokens(1, function (err, remainingRequests) {

                                    async.series([
                                        // Get IMDB Data from OMDB API
                                        function (callback) {
                                            unirest.get("http://www.omdbapi.com/?i=" + movie.imdb_id + "&plot=short&r=json")
                                                .header("Accept", "application/json")
                                                .end(function (result) {
                                                    var parsedMovie = result.body;
                                                    movie.runtime = parsedMovie.Runtime;
                                                    movie.title = parsedMovie.Title;
                                                    movie.plot = parsedMovie.Plot;
                                                    movie.genre = parsedMovie.Genre;
                                                    movie.imdb_rating = parsedMovie.imdbRating;
                                                    callback();
                                                });
                                        },
                                        function (callback) {
                                            var url = "https://api.themoviedb.org/3/find/" + movie.imdb_id + "?external_source=imdb_id&api_key=" + process.env.API_TMDB;
                                            unirest.get(url)
                                                .header("Accept", "application/json")
                                                .end(function (result) {
                                                    if (result.body.movie_results.length > 0) {
                                                        movie.poster = "https://image.tmdb.org/t/p/w500" + result.body.movie_results[0].poster_path;
                                                    }
                                                    callback();
                                                });
                                        },
                                        function (callback) {
                                            if (movie.genre.indexOf("Documentary") == -1 && "poster" in movie) {
                                                async.parallel([
                                                    // Insert movie
                                                    function (callback) {
                                                        console.log(chalk.blue("Inserting movie " + movie.imdb_id + "."));
                                                        Movie.create(movie, function (err, result) {
                                                            callback();
                                                        });
                                                    },
                                                    // Add region to movie
                                                    function (callback) {
                                                        Movie.addRegion(movie.imdb_id, region.code, function (err) {
                                                            if (err) console.log(err.message);
                                                            callback();
                                                        });
                                                    },
                                                    // Add movie to region
                                                    function (callback) {
                                                        Region.addMovie(region.code, movie.imdb_id, function (err) {
                                                            if (err) console.log(err.message);
                                                            callback();
                                                        });
                                                    }
                                                ], function (err) {
                                                    callback();
                                                });
                                            } else {
                                                console.log("Movie is documentary. Ignoring.");
                                                callback();
                                            }
                                        }
                                    ], function (err) {
                                        console.log("Movie added.")
                                        callback();
                                    });
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
});