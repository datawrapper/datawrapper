function responsive_render(render_div, opt, theme){
	
	var count_rows = 0;

	var tablehtml = '';

	var num_rows = opt.series.length;

	//Prepares the title
	tablehtml += '<h2 class="responsive_h2">'+ opt.title.text +'</h2>';

	//Prepares the Subtitle
	if (opt.subtitle.text != "") tablehtml += '<h3 class="responsive_h3">'+ opt.subtitle.text +'</h3>';

	tablehtml += '<table class="responsive_table">';

	//header row

	var num_cols = opt.xAxis.categories.length;
		
	var count_cols = 0;

	$.each(opt.xAxis.categories, function() {
		
		//Exception on first cell: starts row with an empty cell
		if(count_cols==0) tablehtml += '<thead><tr><td></td>';

		var current_cell = String(this);

		tablehtml += '<td class="responsive_head">';

		tablehtml += current_cell;
		
		tablehtml += '</td>';

		count_cols++;

		//Exception on last cell: ends row
		if(count_cols==num_cols) tablehtml += '</tr></thead>';

	});

	$.each(opt.series, function() {

		tablehtml += '<tr>';

		//sets the first line of the col
		tablehtml+= '<td class="responsive_head">'+ this.name +'</td>'

		var num_cols = this.data.length;
		
		var count_cols = 0;

		$.each(this.data, function() {

			var current_cell = String(this);

			tablehtml += '<td class="responsive_regular">';

			tablehtml += current_cell;
			
			tablehtml += '</td>';

			count_cols++;
			
		});

	if (!--count_cols) tablehtml += '</tr>';
	
	count_rows++;

	});
		
	tablehtml += '</table>';

	//Appends the table to the div
	$("#"+render_div).html(tablehtml);

	//Sets the theme
	$.getScript('themes/js/' + theme + '.js', function(){

		//Sets the styles for the h2
		$.each(Highcharts.theme.title.style, function(key, val){
			$(".responsive_h2").css(key, val);
		});

		//Sets the styles for the h3
		$.each(Highcharts.theme.subtitle.style, function(key, val){
			$(".responsive_h3").css(key, val);
		});

		//Gets variables from the theme file
		var color_text = Highcharts.theme.subtitle.style.color;
		var color_header = Highcharts.theme.colors[0];
		var color_cell = Highcharts.theme.chart.plotBackgroundColor;
		var font_cell = Highcharts.theme.subtitle.style.font;

		//Sets style for all cells
		$(".responsive_regular").css({"font": font_cell, "padding": "4px 2px", 'font-size': '11px', "margin": "1px"});
		$(".responsive_head").css({"font": font_cell, "padding": "4px 2px", 'font-size': '11px', "margin": "1px"});

		//Sets style for regular cells
		$(".responsive_regular").css("color", color_text);
		$(".responsive_regular").css("background-color", color_cell);
		$(".responsive_regular").css("font-weight", "normal");

		//Sets style for header cells
		$(".responsive_head").css("font-weight", "bold");
		$(".responsive_head").css("background-color", color_cell);
		$(".responsive_head").css("color", color_header);

		//Sets style for table
		$(".responsive_table").css("width", "100%");

		//Loads responsive CSS
		var link = $("<link>");
		link.attr({
		        type: 'text/css',
		        rel: 'stylesheet',
		        href: "visualizations/responsive/responsive.css"
		});
		$("head").append(link); 

		/*Labels the data*/

		//generates the labels
		var labels = '';
		$.each(opt.xAxis.categories, function(key, val) {
			row_num = key+2;
			labels = labels + 'td:nth-of-type('+ String(row_num) +'):before { content: "'+ val +'"; }';
		});

		//Generates css code
		var style_labels = '<style media="only screen and (max-width: 760px), (min-device-width: 768px) and (max-device-width: 1024px)">'+labels+'</style>';
		
		//Appends css code to head
		$(style_labels).appendTo('head'); 
		
	});

}