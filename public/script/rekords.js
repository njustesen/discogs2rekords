var free = [];
var taken = [];
var done = [];

gameLoaded = false
setInterval(function(){
	if (!gameLoaded){
		$('.game').blockrain();
		gameLoaded = true
	}
},1000);

setInterval(function(){
	if (free.length>0)
		call(free[0]);
},2000);

$( document ).ready(function() {
	
	$('#markall').on('click', function(){
		alert("Den virker jo ikke Jakob");
	});

	$('#images').on('click', function(){
		downloadImages();
	});

	$('#clear').on('click', function(){
		$('#rekords').html('');
		$('#rekords-images').html('');
		$('.token').remove();
	});

	$('#tetris').on('click', function(){
		if ($('#float-container').hasClass("hidden")){
			$('#float-container').removeClass("hidden")
		} else {
			$('#float-container').addClass("hidden")
		}
	});

	$('.tokenfield')
	.on('tokenfield:createtoken', function (e) {
		
	})
	.on('tokenfield:createdtoken', function (e) {
	    var valid = true;
	    if (!valid) {
	      $(e.relatedTarget).addClass('invalid')
	    } else {
	    	var target = e.relatedTarget;
	    	var id = target.textContent.substring(0,target.textContent.length-1);
	    	free.push({id:id, target:target});
	    }

	})
	.on('tokenfield:edittoken', function (e) {
	    if (e.attrs.label !== e.attrs.value) {
	    	var label = e.attrs.label.split(' (')
	    	e.attrs.value = label[0] + '|' + e.attrs.value
	    }
	})
	.on('tokenfield:removedtoken', function (e) {
	    //alert('Token removed! Token value was: ' + e.attrs.value)
	    var target = e.relatedTarget;
	   	var id = target.textContent.substring(0,target.textContent.length-1);
	    removeFromQueue(id);

	})
	.tokenfield({
		autocomplete: {
			source: ['red','blue','green','yellow','violet','brown','purple','black','white'],
		    delay: 100
		},
		showAutocompleteOnFocus: true
	})

});

// IMAGE DOWNLOADER
function downloadImages(){

	var images = document.getElementsByTagName('img');
	var i = 0;

	setInterval(function(){
	    if(images.length > i){
	        window.open(images[i].src,'_blank');
	        i++;
	    }
	},1000);

}
// ---------

function removeFromQueue(id){
	var idx = -1;
	var i = 0;
	free.forEach(function(e){
		if (e.id == id){
			idx = i;
		}
		i++;
	});
	if (idx > -1){
		free.splice(idx,1);
	}
}

function call(e){
	removeFromQueue(e.id);
		
	$.post( "/rekords/"+e.id, {} )
		.done(function( data ) {
			if (data.error !== undefined){
				if (data.error.indexOf("No release found for") >= 0){
					$(e.target).css('background-color','#f66');
					removeFromQueue(e.id);
				} else {
					$(e.target).css('background-color','#66c');
				}
			} else {
				//if (added.indexOf(e.id) > -1){
				//	removeFromQueue(e.id);
				//	return;
				//}
				$(e.target).css('background-color','#6f6');
				var row = $('<tr></tr>');
				row.append('<td style="width:100px; word-wrap:break-word;">' + data.data.id + '</td>');
	    		row.append('<td style="width:100px; word-wrap:break-word;">' + data.releaseInfo + '</td>');
	    		row.append('<td width=82px>' + data.country + '</td>');
	    		row.append('<td width=120px>' + data.catalog + '</td>');
	    		row.append('<td width="150px"><xmp>' + data.rekords + '</xmp></td>');
	    		for(var i = 0; i < 9; i++)
	    			row.append('<td></td>');
	    		row.append('<td width=50p>' + data.released + '</td>');
	    		for(var i = 0; i < 14; i++)
	    			row.append('<td></td>');
	    		row.append('<td width=50p>' + data.weight + '</td>');
	    		for(var i = 0; i < 3; i++)
	    			row.append('<td></td>');
	    		row.append('<td width=100px>' + data.labels + '</td>');
	    		$('#rekords').append(row);
				$('#rekords-images').append('<img src="' + data.img + '">');
				removeFromQueue(e.id);
				done.push(e.id);
			}
		})
		.fail(function ( data ) {
			$('#alerts').html('');
			var alert = $('<div></div>');
			alert.addClass('alert');
			alert.addClass('alert-danger');
			alert.html(data.error);
			alert.css('width', '50%');
			alert.css('text-align', 'center');
			alert.css('margin-left', 'auto');
			alert.css('margin-right', 'auto');
			alert.html(data.error);
			
			$('#alerts').append(alert);
		});	   

}