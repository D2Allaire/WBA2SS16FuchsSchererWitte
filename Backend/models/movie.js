/** Model: Movie **/
/*
* Movie = {
*      title: title,
*      imdb_id: imdbID 
*      year: year,
*      runTime: runTime,
*      plot: plot,
*      genre: genre,
*      poster: poster (IMDB),
*      imdb_rating: imdbRating,
*      regions: [regions]      
* }
*/

var db = require('../config/db').get();
var async = require('async');

var that = this;

/**
 * Add movie to the database
 * movie: Movie object to be inserted
 */
exports.create = function(movie, callback) {
    db.set('movie:' + movie.imdb_id, JSON.stringify(movie), function (err, rep) {
        if (err) throw err;
        callback();
    });
}

/**
 * Find and select one or multiple movies from the database by their ID
 */
exports.get = function(ids, callback) {
    var movies = [];
    async.forEach(ids, function (id, callback) {
        var movie = {};

        async.series([
            // Get movie object from the database
            function (callback) {
                db.get("movie:" + id, function (err, rep) {
                    if (err) throw err;
                    if (rep) {
                        movie = JSON.parse(rep);
                        callback();
                    } else {
                        callback(new Error("Movie " + id + " not found."));
                    }
                });
            },
            // Get regions assigned to movie
            function (callback) {
                db.smembers("movie:" + id + ":regions", function (err, rep) {
                    if (err) throw err;
                    if (rep.length > 0) {
                        movie.regions = rep;
                    }
                    callback();
                });
            }
        ], function (err) {
            if (err) {
                callback(err);
            } else {
                movies.push(movie);
                callback();
            }
        });
    }, function (err) {
        callback(err, movies);
    });
}

/**
 * Add region to a movie in the database
 */
exports.addRegion = function(id, region, callback) {
    db.sadd("movie:" + id + ":regions", region, function (err, rep) {
        if (rep > 0) {
            callback();
        } else {
            callback(new Error("Region already added to movie."));
        }
    });
}

/**
 * Check if a movie exists in the database
 */
exports.exists = function(id, callback) {
    db.exists('movie:' + id, function (err, rep) {
        if (err) throw err;
        if (rep == 1) callback(true);
        else callback(false);
    });
}