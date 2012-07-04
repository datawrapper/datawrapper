function stream_render(render_div, opt, theme){


  //Clears the chart div
  $("#"+render_div).html("");

  /* Gets the size of the div to render in */
  var chart_w = jQuery("#"+render_div).width();
  var chart_h = jQuery("#"+render_div).height();  

  /* Formats the data appropriately */
  /* The expected format for the stacked bars is [[{x:0,y:1,y0:12}, {x:1,y:.5,y0:5}],[{x:0,y:1,y0:12}, {x:1,y:.5,y0:5}]] */
  
  var streamdata = new Array();
  
  //new layer
  for (cnt_layer in opt.series) {

    streamdata[cnt_layer] = new Array();

    layer_data = opt.series[cnt_layer].data;

    //new sample
    for (cnt_sample in layer_data){

      var data_point = opt.series[cnt_layer].data[cnt_sample];

      streamdata[cnt_layer][cnt_sample] = {"x": parseFloat(cnt_sample), "y": parseFloat(data_point), "y0": parseFloat(data_point)};

    }

  }

  /*Gets colors from theme */
  var color_array = Highcharts.theme.colors;
  

  /* Gets the initial vars */
  var n = streamdata.length, // number of layers
      m = streamdata[0].length, // number of samples per layer
      data0 = d3.layout.stack().offset("wiggle")(streamdata);


  var w = chart_w,
      h = chart_h,
      x = d3.scale.linear().range([0, w]),
      y = d3.scale.linear().range([0, h - 40]);
      mx = m - 1,
      my = d3.max(data0, function(d) {
        return d3.max(d, function(d) {
          return d.y0 + d.y;
        });
      });

  var area = d3.svg.area()
      .x(function(d) { return d.x * w / mx; })
      .y0(function(d) { return h - d.y0 * h / my; })
      .y1(function(d) { return h - (d.y + d.y0) * h / my; });

  var vis = d3.select("#"+render_div)
    .append("svg:svg")
      .attr("width", w)
      .attr("height", h);

  vis.selectAll("path")
      .data(data0)
    .enter().append("svg:path")
      .style("fill", function(d, i) { return color_array[i]; })
      .attr("d", area);

  //Adds the title
  var title = vis.append("svg:text")
          .style("font", Highcharts.theme.title.style.font)
          .style("fill", Highcharts.theme.title.style.color)
          .attr("dy", ".71em")
          .attr("transform", "translate(20, 10)scale(1,1)")
          .text(2000);
  title.text(opt.title.text);

  //Adds the subtitle
  var subtitle = vis.append("svg:text")
          .style("font", Highcharts.theme.subtitle.style.font)
          .style("fill", Highcharts.theme.subtitle.style.color)
          .attr("dy", ".71em")
          .attr("transform", "translate(20, 25)scale(1,1)")
          .text(2000);
  subtitle.text(opt.subtitle.text);
  
  //Adds background to the legend box
  var legend_box = vis.append("svg:rect")
        .style("fill", "#fff")
        .style("opacity", .6)
        .attr("width", "200")
        .attr("height", 15*opt.series.length + 5 )
        .attr("transform", "translate(35, " + String(100 - 15*(opt.series.length-1)-5) + ")scale(1,1)");

  //Adds the Legend
  for (cnt_layer in opt.series) {
    layer_title = opt.series[cnt_layer].name;

    //Adds a colobox
    var legend_item_box = vis.append("svg:rect")
        .style("fill", color_array[cnt_layer])
        .attr("width", "10")
        .attr("height", "10")
        .attr("transform", "translate(40, " + String(100-15*cnt_layer) + ")scale(1,1)");

    //Adds the text
    var legend_item_text = vis.append("svg:text")
          .style("font", Highcharts.theme.xAxis.labels.style.font)
          .style("fill", Highcharts.theme.xAxis.labels.style.color)
          .attr("dy", ".71em")
          .attr("transform", "translate(55, " + String(100-15*cnt_layer) + ")scale(1,1)")
          .text(2000);
    legend_item_text.text(layer_title);

  }


  //Adds the vertical axis
  var yAxis_title = vis.append("svg:text")
          .style("font", Highcharts.theme.yAxis.labels.style.font)
          .style("fill", Highcharts.theme.yAxis.labels.style.color)
          .attr("dy", ".71em")
          .attr("transform", "translate(10, "+ String(h/2+20) +")scale(1,1)rotate(-90)")
          .text(2000);
  yAxis_title.text(opt.yAxis.title.text);

  //Adds the horizontal axis
  for (xAxis_cnt in opt.xAxis.categories) {
    var xAxis_label = vis.append("svg:text")
            .style("font", Highcharts.theme.yAxis.labels.style.font)
            .style("fill", Highcharts.theme.yAxis.labels.style.color)
            .attr("dy", ".71em")
            .attr("transform", "translate("+ String((xAxis_cnt * (w / opt.xAxis.categories.length)) + 5) +", "+ String(h - 10) +")scale(1,1)")
            .text(2000);
    xAxis_label.text(opt.xAxis.categories[xAxis_cnt]);
  }
}