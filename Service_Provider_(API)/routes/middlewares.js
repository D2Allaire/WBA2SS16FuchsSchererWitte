/** Middlewares **/

module.exports = function(passport, BasicStrategy) {
    // HTTP Basic Auth
    passport.use(new BasicStrategy(
        function (username, password, done) {
            if (username.valueOf() === process.env.API_USER &&
                password.valueOf() === process.env.API_PW)
                return done(null, true);
            else
                return done(null, false);
        }
    ));
}