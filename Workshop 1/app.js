var fs = require('fs');
var obj;
const chalk = require('chalk');
fs.readFile(__dirname+"/wolkenkratzer.json",  'utf8', function(err, data) {
    if (err) throw err;
    console.log("Parsing " + __dirname+"/wolkenkratzer.json");
    obj = JSON.parse(data);

    // Array sortieren
    obj.wolkenkratzer.sort(function(a,b){
      return b.hoehe - a.hoehe;
    })

    	console.log();

      // sortiert in neue Datei schreiben, vorher JS-Objekt wieder in JSON umwandeln
      fs.writeFile(__dirname+"/wolkenkratzer_sortiert.json", JSON.stringify(obj.wolkenkratzer), function(err){
      if(err) throw err;
    })

    console.log("Sortierte Ausgabe");

      //Daten nochmals ausgeben
  	for(var i = 0; i < obj.wolkenkratzer.length; i++){
  		console.log(chalk.red('Name: '+obj.wolkenkratzer[i].name));
  		console.log(chalk.green('Stadt: '+obj.wolkenkratzer[i].stadt));
  		console.log(chalk.yellow('Hoehe: '+obj.wolkenkratzer[i].hoehe+'m'));
  		console.log('-------------------------------------')
  	}

  	console.log();
});
