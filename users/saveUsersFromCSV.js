var fs = require('fs');
var path = require('path');
var users = [];

function parseCSVLine (line){
	line = line.split(';');

	// check for splits performed inside quoted strings and correct if needed
	for (var i = 0; i < line.length; i++){
		var chunk = line[i].replace(/^[\s]*|[\s]*$/g, "");
		var quote = "";
		if (chunk.charAt(0) == '"' || chunk.charAt(0) == "'") quote = chunk.charAt(0);
		if (quote != "" && chunk.charAt(chunk.length - 1) == quote) quote = "";

		if (quote != ""){
			var j = i + 1;

			if (j < line.length) chunk = line[j].replace(/^[\s]*|[\s]*$/g, "");

			while (j < line.length && chunk.charAt(chunk.length - 1) != quote){
				line[i] += ',' + line[j];
				line.splice(j, 1);
				chunk = line[j].replace(/[\s]*$/g, "");
			}

			if (j < line.length){
				line[i] += ',' + line[j];
				line.splice(j, 1);
			}
		}
	}

	for (var i = 0; i < line.length; i++){
		// remove leading/trailing whitespace
		line[i] = line[i].replace(/^[\s]*|[\s]*$/g, "");

		// remove leading/trailing quotes
		if (line[i].charAt(0) == '"') line[i] = line[i].replace(/^"|"$/g, "");
		else if (line[i].charAt(0) == "'") line[i] = line[i].replace(/^'|'$/g, "");
	}

	return line;
}

function csvToJson (csvText, group){
	var objArr = [];
	var csvRows = [];
	
	if (csvText != ""){
		
		try{
			csvRows = csvText.split(/[\r\n]/g); // split into rows
		}catch(error){
			console.log("Error:"+error);
		}
		
		// get rid of empty rows
		for (var i = 0; i < csvRows.length; i++){
			if (csvRows[i].replace(/^[\s]*|[\s]*$/g, '') == ""){
				csvRows.splice(i, 1);
				i--;
			}
		}

		if (csvRows.length >1) {
			for (var i = 0; i < csvRows.length; i++){
				csvRows[i] = parseCSVLine(csvRows[i]);
			}

			for (var i = 1; i < csvRows.length; i++){
				if (csvRows[i].length > 0){
					objArr.push({});
				}

				for (var j = 0; j < csvRows[i].length; j++){
					objArr[i - 1][csvRows[0][j]] = csvRows[i][j];
					objArr[i - 1]["group"] = group;
				}
			}
		}
	}
	return objArr;
}

if(process.argv.length>3){
	var filePath = process.argv[2];
	path.exists(filePath, function(exists) {
    	if (exists) {
            fs.readFile(filePath, "UTF-8",function(error, content) {
                if (error) {
                	console.log("Error reading file: "+filePath);
                } else {
                	var csvText = new String(content);
                	//console.log("content:"+csvText+"END");
                    users = csvToJson (csvText, process.argv[3]);
                    console.log("Users: "+JSON.stringify(users));
                    
                    var mongodb = require('mongodb');
                	var server = new mongodb.Server("127.0.0.1", 27017, {});
                	new mongodb.Db('classon-uab', server, {}).open(function (error, client) {
                	  if (error) console.log("error:"+error);
                	  var collection = new mongodb.Collection(client, 'users');
                	  collection.insert(users, function(error, objects){
							  if (error) console.log("error:"+error);
							  // Let's close the db
						      client.close();
						      console.log("Saved!");
						  });
                	  
                	});
                	//console.log("Saved!");
                }
            });
        } else {
        	console.log("File: "+filePath+" does not exist.");
        }
    });
	
}else{
	console.log("Usage: node saveUsersFromCSV.js CSVfilename groupName");
}


