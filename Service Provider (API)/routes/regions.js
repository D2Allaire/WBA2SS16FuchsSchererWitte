/** Movie Routes **/
var Region = require('../models/region');

/**
 * GET /regions
 * Returns a list with all available regions
 */
module.exports = function (app, passport, jsonParser) {
    app.get('/regions', passport.authenticate('basic', { session: false }), function (req, res) {
        
        Region.getAll(function (result) {
            res.status(200).type('json').json(result);
        });
    });
}
