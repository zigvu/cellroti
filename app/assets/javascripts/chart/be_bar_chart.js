/*------------------------------------------------
	Multi-bar chart
	------------------------------------------------*/

function BeBarChart(chartManager){
  //------------------------------------------------
  // set up
  var chartHelpers = chartManager.chartHelpers;

  // div for chart
  var be_BarChart_div = '#brand-effectiveness-bar-chart';
  var divWidth = $(be_BarChart_div).parent().width();

  var beData = chartManager.getBeBarChartData();
  var bgIds = _.pluck(beData, 'bgId');
  var chartType = 'brand_effectiveness';
  //------------------------------------------------


  //------------------------------------------------
  // set up gemoetry
  var margin = {top: 10, right: 20, bottom: 40, left: 50},
      width = divWidth - margin.left - margin.right, 
      height = 250 - margin.top - margin.bottom;     // 200

  // how far to the left of y-axis we want our labels to be
  var yAxisLabelAnchorX = -35;
  var xAxisLabelAnchorY = 20;
  //------------------------------------------------


  //------------------------------------------------
  // define axis
  var x = d3.scale.ordinal().rangeRoundBands([0, width], .1),
      y = d3.scale.linear().range([height, 0]);

  var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(""),
      yAxis = d3.svg.axis()
          .scale(y)
          .tickFormat(function(d) {return d3.format(',%')(d); })
          .orient("left");
  //------------------------------------------------


  //------------------------------------------------
  // start drawing
  beSVG = d3.select(be_BarChart_div).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("class", "bar-chart-svg")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  //------------------------------------------------


  //------------------------------------------------
  // define domains
  x.domain(beData.map(function(d) { return d.bgId; }));
  y.domain([0, d3.max(beData, function(d) { return d.value; })]);
  //------------------------------------------------


  //------------------------------------------------
  // draw bars

  var componentRects = beSVG.selectAll(".rect").data(beData)
      .enter()
    .append("rect")
      .attr("id", function(d){ return getRectId(chartType, d.bgId); })
      .attr("class", "rect")
      .attr("width", x.rangeBand())
      .attr("x", function(d) { return x(d.bgId); })
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return height - y(d.value); })
      .style("fill", function(d) { return chartManager.getBrandGroupColor(d.bgId); })
      .on("click", function(d) { handleClickOnBgBar(d.bgId); });
      
  componentRects.append("svg:title")
      .text(function (d) { 
        return chartManager.getBrandGroupName(d.bgId) + ": " + d3.format(',%')(d.value); 
      });

  function handleClickOnBgBar(bgId){
    // need to coerce to string
    chartManager.handleClickOnBgBar(chartType, ['' + bgId]);
  };
  function getRectId(chartTypeArg, bgId){
    return chartTypeArg + '_' + bgId;
  };
  //------------------------------------------------


  //------------------------------------------------
  // draw axes
  beSVG.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .selectAll(".tick").remove(); // remove all ticks

  beSVG.append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("x", width/2)
    .attr("y", height + xAxisLabelAnchorY)
    .text(chartHelpers.getChartLabel(chartType));

  beSVG.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "translate("+ (yAxisLabelAnchorX) +","+(height/2)+")rotate(-90)")  
      .style("text-anchor", "middle")
      .text("Score")
      .attr("class", "axis-label");
  //------------------------------------------------


  //------------------------------------------------
  // callbacks

  // repainting and loading new data
  function repaint(){
    beData = chartManager.getBeBarChartData();

    y.domain([0, d3.max(beData, function(d) { return d.value; })]);

    beSVG.selectAll(".rect")
        .data(beData)
      .transition()
        .duration(750)
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); });

    componentRects.select("title")
        .text(function (d) { 
          return chartManager.getBrandGroupName(d.bgId) + ": " + d3.format(',%')(d.value); 
        });

    beSVG.select(".y.axis").transition().duration(750).call(yAxis);
  };

  function decorateComponentRect(chartTypeArg, bgIdsArg){
    // reset all rects
    beSVG
        .selectAll(".rect")
        .classed("selected", false);
    //  add decoration
    if(bgIdsArg.length == 1){
      // since brand effectiveness is the default timeline chart,
      // only select it when clicked
      beSVG
          .selectAll("#" + getRectId(chartTypeArg, bgIdsArg[0]))
          .classed("selected", true);
    }
  };
  //------------------------------------------------


  //------------------------------------------------
  // finally, add call back to repaint charts
  chartManager.addRepaintCallback(repaint);
  chartManager.addTimelineChartSelectionCallback(decorateComponentRect);
  //------------------------------------------------
};
