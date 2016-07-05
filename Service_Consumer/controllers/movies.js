/** Movies Controller **/

module.exports = function (app, unirest, auth) {

    /**
    * GET /movie?r=[region]
    * Returns a random movie from :region
    */
    app.get('/movie', function (req, res) {
        var region = req.query.r || "us";

        unirest.get(process.env.API + '/movies?r=' + region)
            .headers({ 'Accept': 'application/json', 'Authorization': 'Basic ' + auth })
            .end(function (response) {
                var movie = response.body[0];
                if (movie.language.indexOf("English") != -1) {
                    movie.language = "English";
                } else {
                    movie.language = movie.language[0];
                }
                res.status(200).type('json').json(movie);
            });
    });
}