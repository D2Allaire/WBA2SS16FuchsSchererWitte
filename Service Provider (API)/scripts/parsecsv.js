var parse = require('csv-parse');
var fs = require('fs');
var chalk = require('chalk');
var async = require('async');
var _ = require("underscore");

/**** PARAMETERS: Change these */
var lists = ["hall1.csv", "hall2.csv", "hall3.csv", "hall4.csv"]; // Place in /libs/seasons/lists folder
var seasonName = "halloween";
/*******************************/

var movies = [];

async.forEachSeries(lists, function(list, callback) {
    var parsedMovies;
    var filteredMovies = [];
    async.series([
    function(callback) {
        fs.readFile('../libs/seasons/lists/'+list, function(err, data) {
            if (err) throw err;
            console.log(chalk.green("Parsing " + list));
            parse(data, function(err, output){
                parsedMovies = output;
                callback();
            });
        });
    },
    function(callback) {
        /**
         * Unfortunately, IMDB exported lists aren't consistent in the placement of the IMDB rating.
         * If the user who created the list rated some of the titles, the position of IMDB rating is 9 in
         * the resulting array. Non rated titles will have a "" field.
         * If the user hasn't rated any movies there is no such field, and IMDB rating is at position 8.
         * Since user rating can only be integers, we're checking if the value of field at position 8 is an
         * integer or float to determine at what position the IMDB rating is.
         */
        var ratingPos;
        if (isFloat(parseFloat(parsedMovies[1][8]))) {
            ratingPos = 8;
        } else {
            ratingPos = 9;
        }
        for (var i=1; i<parsedMovies.length; i++) {
            if (parseFloat(parsedMovies[i][ratingPos]) > 7.0) {
                filteredMovies.push(parsedMovies[i][1]);
            }
        }
        callback();
    },
    ], function(err) {
        movies.push(filteredMovies);
        callback();
    });
}, function(err) {
    console.log("Finished processing all lists.");
    var uniqueMovies = [];
    console.log(movies);
    for (var i=0; i<movies.length; i++) {
        // Make intersection with each subarray to filter out duplicate entries
        uniqueMovies = _.union(uniqueMovies, movies[i]);
    }
    var season = {
        name: seasonName,
        movies: uniqueMovies
    }
    fs.writeFile('../libs/seasons/'+seasonName+'.json', JSON.stringify(season), function(err) {
            if (err) throw err;
    });
});

function isFloat(n) {
    return n === +n && n !== (n|0);
}