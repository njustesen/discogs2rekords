
var http = require('http');
var https = require('https');
var express = require('express');
var app = express();
var Discogs = require('disconnect').Client;
var bodyParser = require('body-parser')

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public/', {maxAge: 0}));

app.use( bodyParser.json() );       // to support JSON-encoded bodies

app.post('/ping', function(req, res) {
	res.send('Hello World');
});

app.listen(app.get('port'), function() {
	console.log('Server listening to port ' + app.get('port'));
});

app.get('/', function (req, res) {
  res.render('rekords',
  	{ title : 'DiscogsToRekords' }
  )
})

app.post('/rekords/:id', function(req, res) {

	console.log(req.params);
	var id = req.params.id;
	console.log(id);
	
	var db = new Discogs().database();
	
    db.release(id, function(err, data){

    	console.log("Requesting for " + id);

    	if (data === undefined || catalog(data) === ""){
    		console.log("No release found for " + id);
    		res.json({error: 'No release found for ' + id});    		
    		return;
    	}
    	var rekords = releaseToRekords(data);
    	console.log(rekords);
    	var info = releaseInfo(data);
    	console.log("INFO: " + info);
    	var catno = catalog(data);
    	console.log("CATNO: " + catno);
    	var labs = labels(data);
    	console.log("LABELS: " + labs);
    	console.log("DATA REL: " + data.released);
    	var year = released(data);
    	console.log("YEAR: " + year);
    	var weight = data.estimated_weight;
    	console.log("WEIGHT: " + weight);
    	var country = data.country;

    	// Get image
    	console.log("Requesting image for " + id);
    	https.get(data.uri, (resp) => {
			let webdata = '';
		 
			// A chunk of data has been recieved.
			resp.on('data', (chunk) => {
			    webdata += chunk;
			});
		 
			// The whole response has been received. Print out the result.
			resp.on('end', () => {

				console.log("Returning data for " + id)
		    	var img = getImg(webdata)
		    	
		    	if (country === undefined)
		    		country = "";

		        res.json(
		  			{
		  				data 		: data,  
		  				webdata     : webdata,
		  				img         : img,
		  				releaseInfo : info,
		  				country 	: country,
		  				catalog 	: catno,
		  				rekords 	: rekords,
		  				released 	: year,
		  				//weight		: weight / 1000,
		  				weight  	: "",
		  				labels		: labs,
		  		//		img			: img
		  			}
		  		)
		  		return;
			});
		 
		}).on("error", (err) => {
			res.json({error: 'Could not get image URL. ' + err.message});    
		  	console.log("Error: " + err.message);
		});
    	
    });

});

app.get('/release/rekords/:id', function(req, res){
    var db = new Discogs().database();
    db.release(req.params.id, function(err, data){
    	var rekords = releaseToRekords(data);
    	var info = releaseInfo(data);
    	var catno = catalog(data);
    	var labs = labels(data);
    	var year = released(data);
        res.render('index',
  			{ 
  				title 		: 'Discogs2Rekords',
  				releaseInfo : info,
  				country 	: data.country,
  				catalog 	: catno,
  				rekords 	: rekords,
  				released 	: year,
  				//weight		: data.estimated_weight / 1000,
  				weight 		: "",
  				labels		: labs
  			}
  		)
    });
});

app.get('/release/rekords/clean/:id', function(req, res){
    var db = new Discogs().database();
    db.release(req.params.id, function(err, data){
		var out = releaseToRekords(data);
	    res.send(out);
	});
});

app.get('/release-all/json/:id', function(req, res){
    var db = new Discogs().database();
    db.release(req.params.id, function(err, data){
    	res.send(data);
    });
});

app.get('*', function(req, res) {
	res.sendFile(__dirname + '/public/'); // Derect to angular
});

app.get('/release/json/:id', function(req, res){
    var db = new Discogs().database();
    db.release(req.params.id, function(err, data){
    	var out = releaseToJSON(data);
        res.send(out);
    });
});

app.get('*', function(req, res) {
	res.sendFile(__dirname + '/public/'); // Derect to angular
});

function getImg(html){
	return html.split('property="og:image" content="')[1].split('.jpg"')[0] + '.jpg';
}

function released(release){
	if (release.released === undefined){
		return "";
	}
	var splitted = release.released.split('-');
	var year = "";
	for(var s in splitted){
		if (splitted[s].length === 4){
			return splitted[s];
		}
	}
	return release.released;
}

function labels(release){
	var text = "";
	var i = 0;
	var ids = [];
	for(var c in release.labels){
		if (!contains(ids, release.labels[c].id)){
			if (i == 0)
				text += release.labels[c].name.split(' (')[0];
			// Add to show multiple labels
			//else
			//	text += ', ' + release.labels[c].name;
			i++;
			ids.push(release.labels[c].id);
		}
	}
	return text;
}

function catalog(release){
	var text = "";
	var i = 0;
	for(var c in release.labels){
		if (i == 0)
			text += release.labels[c].catno;
		// Add to show multiple catalogs
		//else
		//	text += ', ' + release.labels[c].catno;
		i++;
		console.log(release.labels[c].catno);
	}
	return text;
}

function releaseInfo(release){
	var text = '';
	var artists = '';
	console.log("-- Artists --")
	console.log(JSON.stringify(release.artists));
	for(var a in release.artists){
		artists += bestname(release.artists[a]);
		if (release.artists[a].join != ',')
			artists += ' ';
		if (a < release.artists.length - 1)
			artists += release.artists[a].join + ' \n';	
	}
	text += artists + ' - ' + release.title + ', ';
	var formats = 0;
	for(var f in release.formats){
		if (formats>0)
			text += " + ";
		var i = 0;
		if (release.formats[f].name === "CD" || release.formats[f].name === "CDr" || release.formats[f].name === "DVD"){
			if(release.formats[f].qty > 1)
				text += release.formats[f].qty + 'x';
			text += release.formats[f].name;
			i++;
		}
		for(var d in release.formats[f].descriptions){
			var desc = release.formats[f].descriptions[d];
			if ((['album', 'compilation', 'unofficial release', 'numbered', '33 ⅓ RPM', '45 RPM', 'single', 'limited edition', 'white label', 'picture disc', 'maxi-single', 'mixed', 'partially'].indexOf(desc.toLowerCase()) >= 0))
				continue;
			if(desc === 'LP' && release.formats[f].qty > 1)
				desc = release.formats[f].qty + 'xLP';
			if(desc === '12"' && release.formats[f].qty > 1)
				desc = release.formats[f].qty + 'x12"';
			if(desc === '10"' && release.formats[f].qty > 1)
				desc = release.formats[f].qty + '10"';
			if(desc === '7"' && release.formats[f].qty > 1)
				desc = release.formats[f].qty + '7"';
			if (i==0)
				text += desc;
			else
				text += ', ' + desc;
			i++;
		}
		formats++;
	}
	return text;
}

function releaseToRekords(release){
	
	var rekord = "\n<br/><br/>\n<b>Tracklist</b><br/><br/>\n";
		
	for(var i in release.tracklist){
		var track = release.tracklist[i];
		
		// Basic info
		if (track.hasOwnProperty('artists')){
			var artists = '';
			for(var a in track.artists){
				artists += bestname(track.artists[a]);
				if (track.artists[a].join != ',')
					artists += ' ';
				artists += track.artists[a].join + ' \n';
			}
			artists = artists.substring(0, artists.length-2);	// Remove last comma
			rekord += track.position + ': ' + artists + ' \n- ' + track.title + '<br/>\n';
		} else {
			rekord += track.position + ': ' + track.title + '<br/>\n';
		}
		
		// Extra artists
		var extras = [];
		var roles = [];
		for(var j in track.extraartists){
			var role = track.extraartists[j].role;
			var name = bestname(track.extraartists[j]);
			extras.push({role : role, name : name});
			if (!contains(roles,role))
				roles.push(role);
		}

		var lines = "";
		for(var r in roles){
			//console.log("ROLE: " + roles[r]);
			var line = roles[r] + "\n - ";
			var n = 0;
			for (var e in extras){
				if (extras[e].role === roles[r]){
					if (n==0)
						line += extras[e].name;
					else
						line += ', \n' + extras[e].name;
					n++;
					//console.log("\tNAME: " + extras[e].name);
				}
			}
			lines += '<i>' + line + "</i><br/>\n";
		}

		if (lines != "")
			rekord += lines

		rekord += "<br/>\n";

	}

	//rekord = rekord.replace('*','');

	return rekord;

}

function releaseToJSON(release){
	
	var tracklist = [];
	var rekord = "";
		
	for(var idx in release.tracklist){
		var track = release.tracklist[idx];
		tracklist.push(track);
	}

	return tracklist;

}

function bestname(artist){
	if (artist.hasOwnProperty('anv') && artist.anv != "")
		return artist.anv.split(' (')[0];
	return artist.name.split(' (')[0];
}

function contains(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return true;
       }
    }
    return false;
}

/*
A1 Manifesto (Intro)  <br>
A2 Good Vibes<br>
Rap [Featuring] – Selvin Thomas<br>
A3 Inferno<br>
Producer – LG<br>
A4 Lovemusic<br>
Producer – Tommy Koi<br>
B1 The Mysteries  <br>
B2 Jugganaught<br>
Producer – LG<br>
B3 The Parallax View  <br>
C1 Revolutions<br>
Producer – Cee*Why<br>
Vocals – Nuwella<br>
C2 Transitions (The Capsule Part 2)<br>
Producer – Evil Ed<br>
Scratches (Uncredited) – Evil Ed<br>
C3 Binyard 2 Vinyard<br>
Producer – Evil Ed<br>
Rap [Featuring] – Diablo<br>
C4 Move... Now<br>
Producer – Mark B<br>
D1 Another Hit<br>
Producer – Apollo<br>
Rap [Featuring] – Colony, The<br>
Vocals – Nuwella<br>
D2 Remain Forever<br>
Vocals – Neneh Cherry<br>
D3 Truth I See<br>
*/