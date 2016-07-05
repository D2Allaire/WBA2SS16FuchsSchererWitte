/** Home Controller **/
var async = require('async');
var moment = require('moment');


/**
 * GET /
 * Builds the EJS file with default settings. Checks whether current date maps to one of the holiday seasons,
 * and returns movies based on that.
 */
module.exports = function (app, unirest, auth) {
    app.get('/', function (req, res) {
        var region = "us", count = 1, season = null; // Set defaults
        var movie, regions;
        var url = process.env.API + '/movies?r=' + region + '&c=' + count;
        var moChr1 = moment().year() + "-12-23"; // 2016-12-23
        var moChr2 = moment().year() + "-12-26"; // 2016-12-26
        var moHal = moment().year() + "-10-31"; // 2016-10-31

        // Check if date is one of the holidays seasons. @TODO: There's probably a better way to do this.
        if (moment().isBetween(moChr1, moChr2, 'day')) {
            url = url + '&s=christmas';
        } else if (moment().isSame(moHal, 'day')) {
            url = url + '&s=halloween';
        }

        async.parallel([
            function (callback) {
                unirest.get(process.env.API + '/regions')
                    .headers({ 'Accept': 'application/json', 'Authorization': 'Basic ' + auth })
                    .end(function (response) {
                        regions = response.body;
                        callback();
                    });
            },
            function (callback) {
                unirest.get(url)
                    .headers({ 'Accept': 'application/json', 'Authorization': 'Basic ' + auth })
                    .end(function (response) {
                        if (response.body) {
                            if (response.body.length > 0) {
                                movie = response.body[0];
                                if (movie.language.indexOf("English") != -1) {
                                    movie.language = "English";
                                } else {
                                    movie.language = movie.language[0];
                                }
                                callback();
                            } else {
                                callback(new Error("No movies found matching the selected criteria."));
                            }
                        }
                    });
            }
        ], function (err) {
            if (err) {
                res.status(404).type('text').send(err.message);
            } else {
                res.render('index', {
                    movie: movie,
                    regions: regions,
                    user: req.user ? req.user : null
                });
            }
        });
    });
}
