/** Authentication Controller **/

module.exports = function (app, unirest, auth, passport) {

    /**
    * POST /signup
    * Creates a new user
    */
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: 'auth/success',
        failureRedirect: 'auth/failure'
    }));

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: 'auth/success',
        failureRedirect: 'auth/failure'
    }));

    app.get('/auth/success', function (req, res) {
        res.status(200).type('json').send({ state: 'success', user: req.user ? req.user : null });
    });

    app.get('/auth/failure', function (req, res) {
        res.status(500).type('json').send({ state: 'failure', user: null });
    });
}