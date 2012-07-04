$(document).ready(function() {
	$('input[onfinishinput]').live("keypress", function(e)
	{		
		startTypingTimer($(e.target));
	}); 	
});


var typingTimeout;
function startTypingTimer(input_field)
{	
	if (typingTimeout != undefined) 
		clearTimeout(typingTimeout);
	typingTimeout = setTimeout( function()
				{				
					eval(input_field.attr("onfinishinput"));
				}
	, 500);
}

