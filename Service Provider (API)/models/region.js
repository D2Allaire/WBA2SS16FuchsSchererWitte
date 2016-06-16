/** Model: Region **/
/*
* Region = {
*      name: full name,
*      id: UNOGS id 
*      code: ISO-code (de, ca, us, ...) 
* }
*/

var db = require('../config/db').get();
var Movie = require('./movie');
var async = require('async');

/**
 * Add a movie to the region
 * region: code of the region
 * movie: movie object to be added
 */
exports.addMovie = function(region, id, callback) {
    db.sadd("region:" + region + ":movies", id, function (err, rep) {
        if (err) throw err;
        if (rep > 0) {
            callback();
        } else {
            callback(new Error("Movie already added to region."));
        }
    });
}

/**
 * Get movies from this region
 * region: code of the region
 * count: limit on how many movies to retrieve
 * season: holiday season (christmas, halloween, ...)
 */
exports.getMovies = function(region, count, season, callback) {
    if (count == "all") {
        if (season != null) {
            db.sinter("movies:"+season, "region:" + region +":movies", function(err, rep) {
                //:rep is an array with all IMDB IDs from :region that are also in the :season set
                Movie.get(rep, function(err, result) {
                    callback(err, result);
                });
            });
        } else {
            db.smembers("region:" + region + ":movies", function (err, rep) {
                if (err) throw err;
                if (rep) { 
                    // :rep is an array of IMDB IDs from :region
                    Movie.get(rep, function (err, result) {
                        callback(err, result);
                    });
                }
            });
        }
        
    } else {
        if (season != null) {
            db.sinter("movies:"+season, "region:" + region + ":movies", function(err, rep) {
                // :rep is an array with all IMDB IDs from :region that are also in the season set
                Movie.get(rep, function(err, result) {
                    if (err) {
                        callback(err);
                    } else {
                        if (result.length <= count) {
                            callback(null, result);
                        } else {
                            // Shuffle array and select :count elements (to select :count random season movies)
                            result.sort(function() {return 0.5 - Math.random()});
                            var movies = result.slice(0, count);
                            callback(null, movies);
                        }
                    }
                });
            });
        } else {
            db.srandmember("region:" + region + ":movies", count, function (err, rep) {
                if (err) throw err;
                if (rep) { 
                    // :rep is an array of :count random IMDB IDs from :region
                    Movie.get(rep, function(err, result) {
                        callback(err, result);
                    });
                }
            });
        }
    }
}