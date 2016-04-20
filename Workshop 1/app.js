var fs = require('fs');
var obj;
const chalk = require('chalk');
fs.readFile(__dirname+"/wolkenkratzer.json",  'utf8', function(err, data) {
    if (err) throw err;
    console.log("Parsing " + __dirname+"/wolkenkratzer.json");
    obj = JSON.parse(data);
    
 
    for (var i=0; i<obj.wolkenkratzer.length; i++) {
        console.log(chalk.blue("Name: " + obj.wolkenkratzer[i].name));
        console.log(chalk.red("Stadt: " + obj.wolkenkratzer[i].stadt));
        console.log(chalk.green("Höhe: " + obj.wolkenkratzer[i].hoehe));
        console.log("----------------");
}
});
