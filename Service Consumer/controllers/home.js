/** Home Controller **/
var unirest = require('unirest');
var async = require('async');
var moment = require('moment');


/**
 * GET /
 * Builds the EJS file with default settings. Checks whether current date maps to one of the holiday seasons,
 * and returns movies based on that.
 */
module.exports = function (app, jsonParser) {
    app.get('/', function (req, res) {
        var region = "us", count = 1, season = null; // Set defaults
        var auth = new Buffer(process.env.API_USER + ":" + process.env.API_PW).toString('base64');
        var movie;
        var url = 'http://api.netflix.dev:3000/movies?r=ca'
        var moChr1 = moment().year() + "-12-23"; // 2016-12-23
        var moChr2 = moment().year() + "-12-26"; // 2016-12-26
        var moHal = moment().year() + "-10-31"; // 2016-10-31

        // Check if date is one of the holidays seasons. @TODO: There's probably a better way to do this.
        if (moment().isBetween(moChr1, moChr2, 'day')) {
            url = 'http://api.netflix.dev:3000/movies?r=ca&s=christmas';
        } else if (moment().isSame(moHal, 'day')) {
            url = 'http://api.netflix.dev:3000/movies?r=ca&s=halloween'
        }

        unirest.get(url)
            .headers({ 'Accept': 'application/json', 'Authorization': 'Basic ' + auth })
            .end(function (response) {
                if (response.body.length > 0) {
                    movie = response.body[0];
                    console.log(movie);
                    res.render('index', {
                        movie: movie
                    });
                } else {
                    res.send("No movies found.");
                }
            });
    });
}
