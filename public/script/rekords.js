var queue = [];
var added = [];

setInterval(function(){
		if (queue.length>0)
    		call(queue[0]);
    },2000);

$( document ).ready(function() {
	
	$('#markall').on('click', function(){
		alert("Den virker jo ikke Jakob");
	});

	$('#clear').on('click', function(){
		$('#rekords').html('');
		$('.token').remove();
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
	    	queue.push({id:id, target:target}); 	
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

function removeFromQueue(id){
	var idx = -1;
	var i = 0;
	queue.forEach(function(e){
		if (e.id == id){
			idx = i;
		}
		i++;
	});
	if (idx > -1){
		queue.splice(idx,1);
	}
}

function call(e){

	$.post( "/rekords/"+e.id, {} )
		.done(function( data ) {
			if (data.error !== undefined){
				$(e.target).css('background-color','#f66');
			} else {
				if (added.indexOf(e.id) > -1)
					return;
				$(e.target).css('background-color','#6f6');
				var row = $('<tr></tr>');
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
				removeFromQueue(e.id);
				added.push(e.id);
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