var redis = require("redis");
var fs = require('fs');
var unirest = require('unirest');
const chalk = require('chalk');

var db = redis.createClient();
var obj;
var movies;

// Read region JSON file
fs.readFile(__dirname + "/regions_test.json", 'utf8', function (err, data) {
    if (err) throw err;
    console.log(chalk.green("Parsing " + __dirname + "/regions_short.json"));
    obj = JSON.parse(data);
    
    cycleRegions(obj.regions);
});


function cycleRegions(regions) {
    var currentRegion;
    
    if (regions.length == 0) {
        return;
    }
    
    currentRegion = regions.pop();
    unirest.get("https://unogs-unogs-v1.p.mashape.com/api.cgi?q=get%3Anew9999-!1900,2017-!0,5-!7,10-!0-!Movie-!Any-!Any-!gt100&t=ns&cl="+currentRegion.id+"&st=adv&ob=Date&p=1&sa=and")
        .header("X-Mashape-Key", "augKdKBQYNmshFgSalRFx2WUP4DEp1Z23Hajsn48B26JtFAcdB")
        .header("Accept", "application/json")
        .end(function (result) {
            console.log(chalk.green("Parsing movies from region: "+currentRegion.code));
            var movies = result.body;
            insertMovies(movies.ITEMS, currentRegion);
            cycleRegions(regions);
        });
}

/**
 * Inserts a list of movies into a given region.
 */
function insertMovies(movies, region) {
    var movieArr;

    if (movies.length == 0) {
        return;
    }

    movieArr = movies.pop();

    var movie = {};
    movie.title = movieArr[1];
    movie.year = movieArr[7];
    movie.imdb_id = movieArr[11];

    console.log(movie.imdb_id);

    db.hexists("movies", movie.imdb_id, function (err, rep) {
        if (rep == 1) {
            console.log(chalk.red("Movie " + movie.imdb_id + " already exists, adding region."));
            db.sadd("region:" + region.code + ":movies", movie.imdb_id);
            insertMovies(movies, region);
        } else if (rep == 0) {
            unirest.get("http://www.omdbapi.com/?i=" + movie.imdb_id + "&plot=short&r=json")
                .header("Accept", "application/json")
                .end(function (result) {
                    var parsedMovie = result.body;
                    movie.plot = parsedMovie.Plot;
                    movie.genre = parsedMovie.Genre;
                    movie.poster = parsedMovie.Poster;
                    movie.imdb_rating = parsedMovie.imdbRating;

                    db.incr('id:movie', function (err, rep) {
                        console.log(chalk.blue("Getting next ID: " + rep));
                        movie.id = rep;
                        db.set('movie:' + movie.id, JSON.stringify(movie), function (err, rep) {
                            console.log(chalk.blue("Inserting movie " + movie.imdb_id + "."));
                            if (rep) {
                                db.hset("movies", movie.imdb_id, movie.id, function (err, rep) {
                                    console.log(chalk.blue("Adding movie " + movie.imdb_id + " to list."));
                                    db.sadd("movie:" + movie.id + ":regions", region.code, function (err, rep) {
                                        console.log(chalk.blue("Adding region "+region.code+" to movie " + movie.imdb_id +"."));
                                        db.sadd("region:" + region.code + ":movies", movie.imdb_id, function(err, rep) {
                                            console.log(chalk.blue("Adding movie "+movie.imdb_id+" to region " + region.code));
                                            insertMovies(movies, region);
                                        });
                                    });
                                });
                            }
                        });
                    });
                });     
        }
    });
}