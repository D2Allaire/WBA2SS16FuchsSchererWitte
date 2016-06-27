/** User Routes **/
var User = require('../models/user');

module.exports = function (app, passport, jsonParser) {

    /**
     * GET /users?name=name
     * Find a user by his name
     */
    app.get('/users', passport.authenticate('basic', { session: false }), jsonParser, function (req, res) {
        var name = req.query.name || null;
        if (name == null) {
            res.status(400).type('text').send("Please filter by username.");
        }
        User.find(name, function (err, result) {
            if (err) {
                res.status(404).type('text').send(err.message);
            } else {
                res.status(200).type('json').json(result);
            }
        });
    });

    /**
    * POST /users
    * Creates a new user in the database with the provided user object in JSON format.
    */
    app.post('/users', passport.authenticate('basic', { session: false }), jsonParser, function (req, res) {
        var user = req.body;
        User.create(user, function (err, result) {
            if (err) {
                res.status(409).type('text').send(err.message);
            } else {
                res.status(200).type('json').json(result);
            }
        });
    });

    /**
     * GET /users/:id
     * Returns a user object from the database in JSON format.
     */
    app.get('/users/:id', passport.authenticate('basic', { session: false }), function (req, res) {
        var id = req.params.id;
        User.get(id, function (err, result) {
            if (err) {
                res.status(404).type('text').send(err.message);
            } else {
                res.status(200).type('json').json(result);
            }
        });
    });

    /**
     * PUT /users/:id
     * Updates an existing user record in the database by overwriting the old one.
     */
    app.put('/users/:id', passport.authenticate('basic', { session: false }), jsonParser, function (req, res) {
        var user = req.body;
        user.id = req.params.id;
        User.save(user, function (err, result) {
            if (err) {
                res.status(404).type('text').send(err.message);
            } else {
                res.status(200).type('json').json(result);
            }
        })
    });

    /**
     * POST /users/:id/watchlist
     * Creates one or multiple new entries in a user's watchlist (with an IMDB ID).
     * :movies is always an array (with one entry: ["tt232342"])
     */
    app.post('/users/:id/watchlist', passport.authenticate('basic', { session: false }), jsonParser, function (req, res) {
        /**
         * {
         *      "items": ["tt342352", "tt358342"]
         * }
         */
        var movies = req.body.items;
        User.addToWatchlist(req.params.id, movies, function (err) {
            if (err) {
                res.status(500).type('text').send(err.message);
            } else {
                res.status(200).type('text').send("Movie(s) added to watchlist.");
            }
        });
    });

    /**
     * GET /users/:id/watchlist
     * Returns the watchlist of a given user as an array (of IMDB IDs).
     */
    app.get('/users/:id/watchlist', passport.authenticate('basic', { session: false }), function (req, res) {
        User.getWatchlist(req.params.id, function (err, result) {
            if (err) {
                res.status(404).type('text').send(err.message);
            } else {
                res.status(200).type('json').json(result);
            }
        });
    });

    /**
     * DELETE /users/:id/watchlist
     * Deletes one or multiple entries in a user's watchlist.
     */
    app.delete('/users/:id/watchlist', passport.authenticate('basic', { session: false }), jsonParser, function (req, res) {
        var movies = req.body.items;
        User.deleteFromWatchlist(req.params.id, movies, function (err) {
            if (err) {
                res.status(500).type('text').send(err.message);
            } else {
                res.status(200).type('text').send("Movie(s) deleted.");
            }
        });
    });

    /**
     * GET /users/:id/movies[?r=region]
     * Returns an array of movies from the specifiec region that are not in the user's watchlist.
     */
    app.get('/users/:id/movies', passport.authenticate('basic', { session: false }), function (req, res) {
        var region = req.query.r || "us"; // Set default region to US
        User.getMovies(req.params.id, region, function (err, result) {
            if (err) {
                res.status(404).type('text').send(err.message);
            } else {
                res.status(200).type('json').json(result);
            }
        });
    });

}