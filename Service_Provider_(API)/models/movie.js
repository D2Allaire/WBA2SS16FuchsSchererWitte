/** Model: Movie **/
/*
* Movie = {
*      title: title,
*      imdb_id: imdbID 
*      year: year,
*      runtime: runTime,
*      plot: plot,
*      genre: genre,
*      poster: poster (IMDB),
*      imdb_rating: imdbRating,
*      language: available languages,
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
        callback(movie);
    });
}

/**
 * Find and select one or multiple movies from the database by their ID
 * ids: array of IMDB ids
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
                        // rep is an array of all regions the movie is available in
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
 * id: IMDB id of the movie
 * region: region to be added (ca, de, us, ...)
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
 * id: IMDB id of the movie
 */
exports.exists = function(id, callback) {
    db.exists('movie:' + id, function (err, rep) {
        if (err) throw err;
        if (rep == 1) callback(true);
        else callback(false);
    });
}