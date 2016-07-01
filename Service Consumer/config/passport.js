var LocalStrategy = require('passport-local').Strategy;

module.exports = function (passport, unirest, auth) {
    // Serialize user for session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // Deserialize user
    passport.deserializeUser(function (id, done) {
        unirest.get(process.env.API + '/users/' + id)
            .headers({ 'Accept': 'application/json', 'Authorization': 'Basic ' + auth })
            .end(function (response) {
                var user = response.body;
                done(null, user);
            });
    });

    // Signup user
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
        function (req, email, password, done) {
            process.nextTick(function () {
                // Check if user with that email already exists
                unirest.get(process.env.API + '/users?email=' + email)
                    .headers({ 'Accept': 'application/json', 'Authorization': 'Basic ' + auth })
                    .end(function (response) {
                        var user = response.body;
                        // If status is ok user already exists
                        if (response.ok) {
                            return done(null, false);
                        } else {
                            var user = {
                                name: req.param("username"),
                                email: email,
                                password: password
                            };
                            unirest.post(process.env.API + '/users')
                                .headers({ 'Content-Type': 'application/json', 'Authorization': 'Basic ' + auth })
                                .send(user)
                                .end(function (response) {
                                    var user = response.body;
                                    return done(null, user);
                                });
                        }
                    });
            });
        }
    ));

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
        function (req, email, password, done) {
            process.nextTick(function () {
                console.log(email);
                // Check if user with that email exists
                unirest.get(process.env.API + '/users?email=' + email)
                    .headers({ 'Accept': 'application/json', 'Authorization': 'Basic ' + auth })
                    .end(function (response) {
                        var user = response.body;
                        // If status is ok user exists
                        if (response.ok) {
                            var user = response.body;
                            if (user.password == password) {
                                return done(null, user);
                            } else {
                                return done(null, false);
                            }
                        }
                    });
            });
        }
    ));
};