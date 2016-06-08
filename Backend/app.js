require('dotenv').config();
var express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var redis = require("redis");
var async = require("async");
var passport = require('passport')    
var BasicStrategy = require('passport-http').BasicStrategy
var db = redis.createClient();
var app = express();

// HTTP Basic Auth
passport.use(new BasicStrategy(
  function(username, password, done) {
    if (username.valueOf() === process.env.API_USER &&
      password.valueOf() === process.env.API_PW)
      return done(null, true);
    else
      return done(null, false);
  }
));

app.use(passport.initialize());

/**
 * GET /movies[?r=region&c=count]
 * Returns either a specified amount (random in that case) or all movies from the specified region.
 */
app.get('/movies', passport.authenticate('basic', {session: false}), function (req, res) {
    var region = req.query.r || "us"; // Set default region to US
    var count = req.query.c || 1; // Returns 1 movie by default

    if (count == "all") {
        db.smembers("region:" + region + ":movies", function (err, rep) {
            if (err) throw err;
            if (rep) { // rep is an array of IMDB IDs from :region
                getMovies(rep, res);
            }
        });
    } else {
        db.srandmember("region:" + region + ":movies", count, function (err, rep) {
            if (err) throw err;
            if (rep) { // rep is an array of :count random IMDB IDs from :region
                getMovies(rep, res);
            }
        });
    }
});

/**
 * POST /user
 * Creates a new user in the database with the provided user object in JSON format.
 */
app.post('/user', passport.authenticate('basic', {session: false}), jsonParser, function (req, res) {
    var newUser = req.body;

    db.incr('id:user', function (err, rep) {
        newUser.id = rep;
        db.set('user:' + newUser.id, JSON.stringify(newUser), function (err, rep) {
            db.hset("users", newUser.name, newUser.id, function (err, rep) {
                res.json(newUser);
            });
        });
    });
});

/**
 * GET /user
 * Returns a user object from the database in JSON format.
 */
app.get('/user/:id', passport.authenticate('basic', {session: false}), function (req, res) {
    var userID = req.params.id;

    db.get('user:' + userID, function (err, rep) {
        if (rep) {
            res.type('json').send(rep);
        }
        else {
            res.status(404).type('text').send("Der User mit der ID " + userID + " ist nicht vorhanden.");
        }
    });
});

/**
 * PUT /user
 * Updates an existing user record in the database by overwriting the old one.
 */
app.put('/user/:id', passport.authenticate('basic', {session: false}), jsonParser, function (req, res) {
    var userID = req.params.id;

    db.exists('user:' + userID, function (err, rep) {
        if (rep == 1) {
            var updatedUser = req.body;
            updatedUser.id = userID;
            db.set('user:' + userID, JSON.stringify(updatedUser), function (err, rep) {
                db.hset("users", updatedUser.name, updatedUser.id, function (err, rep) {
                    res.json(updatedUser);
                });
            });
        }
        else {
            res.status(404).type('text').send("Der user mit der ID " + userID + " ist nicht vorhanden.");
        }
    });
});

/**
 * POST /user/:id/watchlist
 * Creates one or multiple new entries in a user's watchlist (with an IMDB ID).
 */
app.post('/user/:id/watchlist', passport.authenticate('basic', {session: false}), jsonParser, function (req, res) {
    var movies = req.body.items;

    db.sadd("user:" + req.params.id + ":watchlist", movies, function (err, rep) {
        if (rep > 0) {
            res.status(200).type('text').send("Movie(s) added to watchlist.");
        } else {
            res.status(503).type('text').send("Couldn't insert the movie(s). Please try again.");
        }
    });
});

/**
 * GET /user/:id/watchlist
 * Returns the watchlist of a given user as an array (of IMDB IDs).
 */
app.get('/user/:id/watchlist', passport.authenticate('basic', {session: false}), function (req, res) {
    db.smembers('user:' + req.params.id + ':watchlist', function (err, rep) {
        if (rep) {
            res.status(200).type('json').json(rep);
        } else {
            res.status(404).type('text').send("Watchlist nicht vorhanden");
        }
    });
});

/**
 * DELETE /user/:id/watchlist
 * Deletes one or multiple entries in a user's watchlist.
 */
app.delete('/user/:id/watchlist', passport.authenticate('basic', {session: false}), jsonParser, function (req, res) {
    var movies = req.body.items;

    db.srem("user:" + req.params.id + ":watchlist", movies, function (err, rep) {
        if (rep > 0) {
            res.status(200).type('text').send("Movie deleted");
        } else {
            res.status(503).type('text').send("Couldn't delete.");
        }
    });
});

/**
 * GET /user/:id/movies[?r=region]
 * Returns an array of movies from the specifiec region that are not in the user's watchlist.
 */
app.get('/user/:id/movies', passport.authenticate('basic', {session: false}), function (req, res) {
    var userID = req.params.id;
    var region = req.query.r || "us"; // Set default region to US

    db.sdiff("region:" + region + ":movies", "user:" + userID + ":watchlist", function (err, rep) {
        // :rep is an array with all IMDB IDs from :region that are not in the user watchlist
        if (rep) {
            res.status(200).type('json').json(rep);
        } else {
            res.status(404).type('text').send("No unwatched movies found.");
        }
    });
});

function getMovies(imdbIDs, res) {
    var movies = [];
    async.forEach(imdbIDs, function (imdbID, callback) {
        var movie = {};
        async.series([
            function (callback) {
                db.get("movie:" + imdbID, function (err, rep) {
                    // rep is the value of movie:id, so a JSON object in string format
                    movie = JSON.parse(rep);
                    callback();
                });
            },
            function (callback) {
                db.smembers("movie:" + imdbID + ":regions", function (err, rep) {
                    // rep is an array with all regions where the movie is available
                    movie.regions = rep;
                    callback();
                });
            }
        ], function (err) {
            movies.push(movie);
            callback();
        });
    }, function (err) {
        if (movies.length > 0) {
            res.status(200).type('json').json(movies);
        } else {
            res.status(404).type('text').send("No movies found for this region.");
        }
    });
}

app.listen(3000);
console.log("Dienstgeber aktiv auf Port 3000");