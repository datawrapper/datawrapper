
		
//Shows/hides the attributes specific to pie charts
$(".column").addClass("inactive");

//Prepares Highcharts
options.chart.defaultSeriesType = chart_type;

//Tooltip
options.tooltip.formatter = function(){return pieTooltip(this); };

//Axes (remove)
options.xAxis = null;
options.yAxis = null;

//Prepares the series
options.series[0] = {};
options.series[0].type = 'pie';
options.series[0].name = options.title.text;
options.series[0].data = new Array();

//To build the pie, we only care about the first 2 columns
var count_rows = 0;

$.each(csv_data, function() {
	//New row
	var point_name = stripslashes(this[0]);
	var point_value = parseFloat(this[1]);

	//Checks that the (name, value) pair is correct
	if (isNumber(point_value)){
		var point = {name: point_name, y: point_value};
		
		options.series[0].data.push(point);
	}

});