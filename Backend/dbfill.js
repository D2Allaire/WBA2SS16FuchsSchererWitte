var redis = require("redis");
var fs = require('fs');
var unirest = require('unirest');


var obj;

// Read region JSON file
fs.readFile(__dirname+"/regions_short.json",  'utf8', function(err, data) {
    if (err) throw err;
    console.log("Parsing " + __dirname+"/regions_short.json");
    obj = JSON.parse(data);
    
    // Run through each region and make API requests
    for (var i=0; i<1; i++) {
        var region = obj.regions[i];
        var movie = {
            title: "",
            year: "",
            genre: "",
            plot: "",
            poster: "",
            imdb_id: "",
            imdb_rating: ""
        }
        
        unirest.get("https://unogs-unogs-v1.p.mashape.com/api.cgi?q=get%3Anew9999-!1900,2017-!0,5-!7,10-!0-!Movie-!Any-!Any-!gt100&t=ns&cl="+region.id+"&st=adv&ob=Date&p=1&sa=and")
        .header("X-Mashape-Key", "augKdKBQYNmshFgSalRFx2WUP4DEp1Z23Hajsn48B26JtFAcdB")
        .header("Accept", "application/json")
        .end(function (result) {
            var results = JSON.parse(result.body);
            
            for (var i=0; i<results.ITEMS.length; i++) {
                var movie = {};
                movie.title = results.ITEMS[i][1];
                movie.year = results.ITEMS[i][7];
                movie.imdb_id = results.ITEMS[i][12];
            }
            console.log(result.status, result.headers, result.body);
        });
        
    }
    
    
    
});



