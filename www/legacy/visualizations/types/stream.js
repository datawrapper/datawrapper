//Shows the attributes specific to stream charts
$(".column").removeClass("inactive");

//Axes
options.xAxis = {};
options.xAxis.categories = new Array();
options.yAxis= {};
options.yAxis.min = 0;

//Y axis name
options.yAxis.title = {text: yAxis};

//Prepares Highcharts
options.chart.defaultSeriesType = chart_type;

var count_rows = 0;

$.each(csv_data, function() {
	//New row

	//if this is the first row, populates the categories
	if (count_rows == 0 && horizontal_headers == 1){
		
		var count_cols = 0;

		$.each(this, function() {

			if (count_cols>0) options.xAxis.categories.push(String(stripslashes(this)));

			count_cols++;

		});

	}else{

		var count_cols = 0;
	
		$.each(this, function() {
			//New col

			if (count_cols == 0){
				//if this is the first cell, adds series
				
				options.series.push({name: String(stripslashes(this)), data: new Array});

			}else{
				//else, populates the series	
				options.series[options.series.length-1].data.push(parseFloat(this));
			}

			count_cols++;
		});

	}
	count_rows++;
});