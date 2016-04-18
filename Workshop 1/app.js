var fs = require('fs');
var obj;
fs.readFile(__dirname+"/wolkenkratzer.json",  'utf8', function(err, data) {
    if (err) throw err;
    console.log("Parsing " + __dirname+"/wolkenkratzer.json");
    obj = JSON.parse(data);
    
 
    for (var i=0; i<obj.wolkenkratzer.length; i++) {
        console.log("Name: " + obj.wolkenkratzer[i].name);
        console.log("Stadt: " + obj.wolkenkratzer[i].stadt);
        console.log("Höhe: " + obj.wolkenkratzer[i].hoehe);
        console.log("----------------");
}
});