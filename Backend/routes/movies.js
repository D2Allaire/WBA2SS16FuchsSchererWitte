/** Movie Routes **/
var Movie = require('../models/movie');
var Region = require('../models/region');

/**
 * GET /movies[?r=region&c=count]
 * Returns either a specified amount (random in that case) or all movies from the specified region.
 */
module.exports = function (app, passport, jsonParser) {
    app.get('/movies', passport.authenticate('basic', { session: false }), function (req, res) {
        var region = req.query.r || "us"; // Set default region to US
        var count = req.query.c || 1; // Returns 1 movie by default
        var season = req.query.s || null; // No season selected by default

        Region.getMovies(region, count, season, function (err, result) {
            if (err) {
                res.status(404).type('text').send(err.message);
            } else {
                res.status(200).type('json').json(result);
            }
        });
    });
}
