/** DB-SEAONS: Inserts all specified movies from /libs/seasons into corresponding sets **/

var fs = require('fs');
var chalk = require('chalk');
var async = require('async');
var redis = require('redis');
var db = redis.createClient();

var files = ["christmas.json", "halloween.json"];

async.forEachSeries(files, function(file, callback){
    var season;
    async.series([
        // Load JSON file
        function(callback) {
            fs.readFile("../libs/seasons/" + file, 'utf8', function (err, data) {
                if (err) throw err;
                console.log(chalk.green("Parsing " + file));
                season = JSON.parse(data);
                callback();
            });
        },
        // Add movies to database
        function(callback) {
            db.sadd('movies:' + season.name, season.movies, function(err, rep) {
                if (err) throw err;
                if (rep > 0) {
                    console.log(chalk.cyan("Successfully added movies from " + file + " to database."));
                } else {
                    console.log(chalk.red("Couldn't add movies from + " + file + " to database."));
                }
                callback();
            });
        }
    ], function(err) {
        callback();
    })
}, function(err) {
    console.log(chalk.yellow("Finished adding all seasonal movies."));
    db.quit();
});

