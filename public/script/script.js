$( document ).ready(function() {
    $('.alert').hide();

    $('#user-create').find('.btn').on( "click", function (){
		$('#user-create').find('.alert').hide();
		$.post( "/user/create/", 
			{ 
				username: 	$('#user-create').find('.username').val(), 
				password: 	$('#user-create').find('.password').val(),
				email: 		$('#user-create').find('.email').val() 
			})
		  .done(function( data ) {
		  	var str = '<b>Response</b><br/>' + JSON.stringify(data);
		  	str = str.replace(/,/g, ",<br/>");
		  	str = str.replace('{', "{<br/>");
		  	str = str.replace('}', "<br/>}");
		  	str = str.replace(':', " : ");
		  	$('#user-create').find('.alert-success').html(str);
		  	$('#user-create').find('.alert-success').show();
		  })
		  .fail(function(data) {
		    $('#user-create').find('.alert-danger').html('<b>'+data.status+':</b> '+data.responseText);
		  	$('#user-create').find('.alert-danger').show();
		  });
	});

	$('#session').find('.btn').on( "click", function (){
		$('#session').find('.alert').hide();
		$.post( "/session/", 
			{ 
				username: 	$('#session').find('.username').val(), 
				session: 	$('#session').find('.session').val(),
			})
		  .done(function( data ) {
		  	var str = '<b>Response</b><br/>' + JSON.stringify(data);
		  	str = str.replace(/,/g, ",<br/>");
		  	str = str.replace('{', "{<br/>");
		  	str = str.replace('}', "<br/>}");
		  	str = str.replace(':', " : ");
		  	$('#session').find('.alert-success').html(str);
		  	$('#session').find('.alert-success').show();
		  })
		  .fail(function(data) {
		    $('#session').find('.alert-danger').html('<b>'+data.status+':</b> '+data.responseText);
		  	$('#session').find('.alert-danger').show();
		  });
	});

	$('#session-create').find('.btn').on( "click", function (){
		$('#session-create').find('.alert').hide();
		$.post( "/session/create/", 
			{ 
				username: 	$('#session-create').find('.username').val(), 
				password: 	$('#session-create').find('.password').val(),
			})
		  .done(function( data ) {
		  	var str = '<b>Response</b><br/>' + JSON.stringify(data);
		  	str = str.replace(/,/g, ",<br/>");
		  	str = str.replace('{', "{<br/>");
		  	str = str.replace('}', "<br/>}");
		  	str = str.replace(':', " : ");
		  	$('#session-create').find('.alert-success').html(str);
		  	$('#session-create').find('.alert-success').show();
		  })
		  .fail(function(data) {
		    $('#session-create').find('.alert-danger').html('<b>'+data.status+':</b> '+data.responseText);
		  	$('#session-create').find('.alert-danger').show();
		  });
	});
});

