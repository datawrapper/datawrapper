function basic_pie(render_div, opt, theme) {

	var data = new Array();
	var graph;

	//prepares the data points
	$.each(opt.series[0].data, function(index, value){
		data.push({data:[[0, value.y]], label:value.name});
	});

  graph = Flotr.draw(document.getElementById(render_div), data, {
  	colors: [Highcharts.theme.colors[0], Highcharts.theme.colors[1], Highcharts.theme.colors[2], Highcharts.theme.colors[3], Highcharts.theme.colors[4]],
  	title: opt.title.text,
    subtitle: opt.subtitle.text,
    HtmlText : false,
    grid : {
      verticalLines : false,
      horizontalLines : false
    },
    xaxis : { showLabels : false },
    yaxis : { showLabels : false },
    pie : {
      show : true, 
      explode : 6
    },
    mouse : { track : true },
    legend : {
      position : 'se',
      backgroundColor : '#D2E8FF'
    }
  });
}