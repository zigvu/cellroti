/*------------------------------------------------
	Multi-bar chart
	------------------------------------------------*/

function MultiBarChart(chartManager){
  //------------------------------------------------
  // set up
  var chartHelpers = chartManager.chartHelpers;

  // div for chart
  var bc_ComponentBarChart_div = '#component-bar-chart';
  var divWidth = $(bc_ComponentBarChart_div).parent().width();

  var bcData = chartManager.getBEComponentData();
  var bgIds = _.pluck(bcData[0].bgValues, 'bgId');
  //------------------------------------------------


  //------------------------------------------------
  // set up gemoetry
  var margin = {top: 10, right: 20, bottom: 40, left: 50},
      width = divWidth - margin.left - margin.right, 
      height = 250 - margin.top - margin.bottom;     // 200

  // how far to the left of y-axis we want our labels to be
  var yAxisLabelAnchorX = -35;
  var gapBetweenBarsInGroup = 0.9; // gap is 10% of bar width
  //------------------------------------------------


  //------------------------------------------------
  // define axis
  var x0 = d3.scale.ordinal().rangeRoundBands([0, width], .1),
      x1 = d3.scale.ordinal(),
      y = d3.scale.linear().range([height, 0]);

  var xAxis = d3.svg.axis().scale(x0).orient("bottom"),
      yAxis = d3.svg.axis()
          .scale(y)
          .tickFormat(function(d) {return d3.format(',%')(d); })
          .orient("left");
  //------------------------------------------------


  //------------------------------------------------
  // start drawing
  var svg = d3.select(bc_ComponentBarChart_div).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);
  
  var bcSVG = svg.append("g")
      .attr("class", "bar-chart-svg")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // pattern for marking selected boxes
  var defs = svg.append('defs');

  var pattern = defs.append("pattern")
      .attr("id", "pattern")
      .attr("width", 40)
      .attr("height", 20)
      .attr("x", 0).attr("y", 0)
      .attr("patternUnits","userSpaceOnUse");

  pattern.append("line").attr("x1", 10).attr("y1", 0).attr("x2", 30).attr("y2", 20);
  pattern.append("line").attr("x1", -10).attr("y1", 0).attr("x2", 10).attr("y2", 20);
  pattern.append("line").attr("x1", 30).attr("y1", 0).attr("x2", 50).attr("y2", 20);

  var mask = defs.append("mask")
      .attr("id","mask")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height)
    .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("style", 'fill:url(#pattern);');
  //------------------------------------------------


  //------------------------------------------------
  // define domains
  x0.domain(bcData.map(function(d) { return d.component; }));
  x1.domain(bgIds).rangeRoundBands([0, x0.rangeBand()]);
  y.domain([0, d3.max(bcData, function(d) { return d3.max(d.bgValues, function(d) { return d.value; }); })]);
  //------------------------------------------------


  //------------------------------------------------
  // draw bars
  var componentSVG = bcSVG.selectAll(".componentSVG")
      .data(bcData)
    .enter().append("g")
      .attr("class", "componentSVG")
      .attr("transform", function(d) { return "translate(" + x0(d.component) + ",0)"; });

  var componentBars = componentSVG.selectAll(".component-rects")
      .data(function(d) { return d.bgValues; });

  var componentRects = componentBars.enter().append("g")
      .attr("class", "component-rects")
      .attr("id", function(d){ return getRectId(d.component, d.bgId); })
      .on("click", function(d) { handleClickOnBgBar(d.component, d.bgId); });

  componentRects.append("rect")
      .attr("class", "rect")
      .attr("x", function(d) { return x1(d.bgId); })
      .attr("y", function(d) { return y(d.value); })
      .attr("width", x1.rangeBand() * gapBetweenBarsInGroup)
      .attr("height", function(d) { return height - y(d.value); })
      .style("fill", function(d) { return chartManager.getBrandGroupColor(d.bgId); });
      
  componentRects.append("svg:title")
      .text(function (d) { 
        return chartManager.getBrandGroupName(d.bgId) + ": " + d3.format(',%')(d.value); 
      });

  function handleClickOnBgBar(chartType, bgId){
    // need to coerce to string
    chartManager.handleClickOnBgBar(chartType, ['' + bgId]);
  };
  function getRectId(chartType, bgId){
    return chartType + '_' + bgId;
  };
  //------------------------------------------------


  //------------------------------------------------
  // draw axes
  bcSVG.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .selectAll("text")
      .text(function(k){ return chartHelpers.getChartLabel(k); })
      .attr("class", "axis-label");

  bcSVG.append("g")
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
    bcData = chartManager.getBEComponentData();

    y.domain([0, d3.max(bcData, function(d) { return d3.max(d.bgValues, function(d) { return d.value; }); })]);

    componentSVG.data(bcData);
    componentBars.data(function(d) { return d.bgValues; });
    componentRects.select(".rect")
      .transition()
        .duration(750)
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); });

    componentRects.select("title")
        .text(function (d) { 
          return chartManager.getBrandGroupName(d.bgId) + ": " + d3.format(',%')(d.value); 
        });

    bcSVG.select(".y.axis").transition().duration(750).call(yAxis);
  };

  function decorateComponentRect(chartTypeArg, bgIdsArg){
    componentRects.select(".rect")
        .attr("mask", function(d) {
          if(d.component == chartTypeArg && d.bgId == bgIdsArg[0]){ 
            return 'url(#mask)';
          } else { return null; }
        });
  };
  //------------------------------------------------


  //------------------------------------------------
  // finally, add call back to repaint charts
  chartManager.addRepaintCallback(repaint);
  chartManager.addTimelineChartSelectionCallback(decorateComponentRect);
  //------------------------------------------------
};
