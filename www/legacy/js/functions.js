

/*
 * @desc: Triggers error messages
 * @param: The message to be displayed
 * @returns: Nothing
 *
 */

function error(msg){

	$('#error').html("");

	if(msg == "" || msg == undefined){
		msg = "Oops, that's not supposed to happen.";
	}

    $('#error').html(msg);
    $('#error').show();
    $('#error')
    	.effect("bounce", {
        times:3
    }, 300);

    setTimeout(function() {
        $("#error").fadeOut(100)
    }, 5000);

}


/*
 * @desc: Checks if the param is a numeric value
 * @param: A variable of any type
 * @returns: true if n is a number, false otherwise
 *
 */

 function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

/*
 * @desc: Rounds number with precision
 * @param: The number to be rounded
 * @param: The precision (decimals)
 * @returns: The rounded number
 *
 */

 function roundNumber(num, dec) {
	var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
	return result;
}


/*
 * @desc: formats the labels for Highcharts
 * @param: A value
 * @returns: the string to display on the chart
 *
 */

function pieLabels(value) {return '<b>'+ value.point.name +'</b>: '+ roundNumber(value.percentage, 2) +' %';}

function pieTooltip(value) { return '' + value.point.name + ': ' + roundNumber(value.y, 2) ; }

function barTooltip(value) { return '' + value.x +': '+ roundNumber(value.y, 2) ; }


/*
 * @desc: Loads the loading anim
 *
 */

function loader_show(){
	$("#black_veil").fadeIn("fast", function(){
		
	});
	$("#loader").show();
}

/*
 * @desc: Removes the loading anim
 *
 */

function loader_hide(){

	$("#loader").hide();
	$("#black_veil").fadeOut("fast");
}

/*
 * @desc: Initialize the input fields so they behave on focus and on blur
 *
 */

function initInputs(){
	
	$(document).find("input").each(function(){
		
		var default_content = jQuery(this).val();
		
		jQuery(this).focus(function(){
			
			if (jQuery(this).val() == default_content){
			
				jQuery(this).val("");
			
			}
		});

		jQuery(this).blur(function(){
			
			if (jQuery(this).val() == ""){

				jQuery(this).val(default_content);

				//Updates the graph
				if(typeof update_options == 'function') update_options();
				
			}
		});
	});
}


/*
 * @desc 	Renders the chart
 * @param	opt 		obj 	options object
 * @param 	theme 		str 	the chart's theme
 * @param 	showLogo 	bool 	displays the logo
 *
 */

function render_chart(opt, theme, showLogo){

	//gets chart width & height
	var render_div = opt.chart.renderTo;
	var chart_w = $("#"+ render_div).width();
	var chart_h = $("#"+ render_div).height();
	var image_w = 0;
	var image_h = 0;
	var image_ext = '';

	//gets the JSON to find the data for the current theme
	$.getJSON("themes/config.json", function(data){

		//Checks that the theme exists
		if (data.themes[theme] !== undefined){
			
			//Checks if the theme has an image
			if(data.themes[theme].image != null){

				image_w = data.themes[theme].image.width;
				image_h = data.themes[theme].image.height;
				image_ext = data.themes[theme].image.format;

				//Computes logo position (chart width minus image width minus margin)
				logo_x = chart_w-image_w-(chart_w * .05);
				logo_y = chart_h-image_h-(chart_h * .05);

			}
		}
	

		//Sets the correct dimensions for the chart
		opt.chart.width = chart_w;
		opt.chart.height = chart_h;

		if(typeof theme == 'string'){
			//If a theme is specified
			
			$.getScript('themes/js/' + theme + '.js', function(){

				//Once the theme is loaded, renders chart
				if (opt.chart.chart_lib == "highcharts"){

					//Specifies the width of the title
					Highcharts.theme.title.style.width = Math.round(chart_w * .8) + 'px';
					Highcharts.theme.subtitle.style.width = Math.round(chart_w * .8) + 'px';
					Highcharts.theme.labels.style.width = Math.round(chart_w * .2) + 'px';
					Highcharts.theme.plotOptions.series.dataLabels.style = {width: Math.round(chart_w * .2) + 'px'};

					var highchartsOptions = Highcharts.setOptions(Highcharts.theme);

					var chart = new Highcharts.Chart(opt);

	        	}else if (opt.chart.chart_lib == "responsive"){
	        		
	        		responsive_render(render_div, opt, theme);

	        	}else if (opt.chart.chart_lib == "flotr2"){
	        		
	        		basic_pie(render_div, opt, theme);

	        	}else if (opt.chart.chart_lib == "d3"){

	        		if (opt.chart.defaultSeriesType == "stream"){
	        			$.getScript('visualizations/d3/vis.stream.js', function(){
	        				stream_render(render_div, opt, theme);
	        			});
	        		}
	        	}


	        	//adds the theme's logo
	        	if (data.themes[theme].image != null && showLogo !== false){
	        		var linkTo = "";
	        		var linkTo_close = "";
	        		//prepares the link
	        		if (data.themes[theme].link != null){
	        			linkTo = "<a class='logo' href='"+ data.themes[theme].link +"' target='_blank'>";
	        			linkTo_close = "</a>";
	        		}

	        		$("#embed_extras .logo")
	        			.html(linkTo + "<img src='themes/images/"+ theme +"."+ image_ext +"' width="+ image_w +" height="+ image_h +"/>"+ linkTo_close);
	        	}

			});

		}

	});

}

function stripslashes (str) {
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Ates Goral (http://magnetiq.com)
    // +      fixed by: Mick@el
    // +   improved by: marrtins
    // +   bugfixed by: Onno Marsman
    // +   improved by: rezna
    // +   input by: Rick Waldron
    // +   reimplemented by: Brett Zamir (http://brett-zamir.me)
    // +   input by: Brant Messenger (http://www.brantmessenger.com/)
    // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
    // *     example 1: stripslashes('Kevin\'s code');
    // *     returns 1: "Kevin's code"
    // *     example 2: stripslashes('Kevin\\\'s code');
    // *     returns 2: "Kevin\'s code"
    return (str + '').replace(/\\(.?)/g, function (s, n1) {
        switch (n1) {
        case '\\':
            return '\\';
        case '0':
            return '\u0000';
        case '':
            return '';
        default:
            return n1;
        }
    });
}

/*
 * @desc: Checks the email address format
 * @return: true if it looks like an email address
 *
 */

function test_email(email){
	var emailReg = new RegExp(/^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/);

    if(emailReg.test(email)) {
    	return true;
    }else{
    	return false;
    }
}

/*
 * @desc: Initializes all tooltips
 * @return: nothing
 *
 */

function initTooltips(){

	$(".tooltip").each(function(){
		$(this).qtip({
			content: $(this).attr('tooltip'),
			style: { 
	      		name: 'light',
	      		tip: true
	   		},
			position: {
		      corner: {
		         target: 'topRight',
		         tooltip: 'bottomLeft'
		      }
		   }
		});
	});
}

function showChartDesc(title, desc){
	$.notification ( 
	    {
	        title:      title,
	        content:    desc,
	        border:     true,
	        icon:       '`',
	        color:      '#333'
	    }
	);

	$("#show_desc").fadeOut('fast');

}

function initDeleteChart(){
	$('.delete_chart').each(function(){
		$(this).click(function(){

			window.delete_chart_id = $(this).attr("chart_id");
			window.delete_chart_title = $(this).attr("chart_title");

			$('#delete_chart').show();
			$("#black_veil").fadeIn("fast");

			$("#delete_chart .chart_title").text(window.delete_chart_title);

		});
	});

	$("#delete_NO").click(function(){
		$('#delete_chart').hide();
		$("#black_veil").fadeOut("fast");
	});

	$("#delete_OK").click(function(){
		$.post("actions/charts.php", { chart_id: window.delete_chart_id, action: "deleteChart" },
    	function(data) {
    		if (data != ""){

	            data = jQuery.parseJSON(data);

	            if (data.status == 200){

	            	//alert success
	            	error(texts.chart_deleted);

	            	//removes the warning box
	                $('#delete_chart').hide();
	                $("#black_veil").fadeOut("fast");

	                //removes the chart from the list
	                $('#chart-'+window.delete_chart_id).fadeOut(500, function(){
	                	$(this).remove();
	                });
	                
	            }else{
	                error(data.error);
	            }

	        }else{
	            error();
	        }
    	});
	});
}