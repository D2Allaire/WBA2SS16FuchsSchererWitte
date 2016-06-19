/** DB-REGIONS: Inserts all regions into database **/

var fs = require('fs');
var chalk = require('chalk');
var async = require('async');
var redis = require('redis');
var db = redis.createClient();

var file = "regions_short.json";
var regions;

async.series([
    // Load JSON file
    function (callback) {
        fs.readFile("../libs/regions/" + file, 'utf8', function (err, data) {
            if (err) throw err;
            console.log(chalk.green("Parsing " + file));
            var temp = JSON.parse(data);
            regions = temp.regions;
            callback();
        });
    },
    // Insert regions into database
    function (callback) {
        async.forEach(regions, function (region, callback) {
            db.set('region:' + region.code, JSON.stringify(region), function (err, rep) {
                if (err) throw err;
                db.rpush('regions', region.code, function(err, rep) {
                    if (err) throw err;
                    console.log("Added " + region.name + " to the database.");
                    callback();
                });
            });
        }, function (err) {
            callback();
        });
    }
], function (err) {
    console.log(chalk.yellow("Finished adding all regions."));
    db.quit();
});

