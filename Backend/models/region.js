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
exports.addMovie = function(region, movie, callback) {
    db.sadd("region:" + region + ":movies", movie.imdb_id, function (err, rep) {
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
 */
exports.getMovies = function(region, count, callback) {
    if (count == "all") {
        db.smembers("region:" + region + ":movies", function (err, rep) {
            if (err) throw err;
            if (rep) { // rep is an array of IMDB IDs from :region
                Movie.get(rep, function (err, result) {
                    callback(err, result);
                });
            }
        });
    } else {
        db.srandmember("region:" + region + ":movies", count, function (err, rep) {
                if (err) throw err;
                if (rep) { // rep is an array of :count random IMDB IDs from :region
                    Movie.get(rep, function(err, result) {
                        callback(err, result);
                    });
                }
            });
    }
}