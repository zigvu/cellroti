/*------------------------------------------------
	Multi-bar chart
	------------------------------------------------*/

function BeBarChart(chartManager){
  //------------------------------------------------
  // set up
  var chartHelpers = chartManager.chartHelpers;

  // div for chart
  var brandEffectivenessChartDim, be_BarChart_div, divWidth, divHeight;
  function setDimensions(){
    brandEffectivenessChartDim = chartManager.getBrandEffectivenessChartDims();
    be_BarChart_div = brandEffectivenessChartDim['div'];
    divWidth = $(be_BarChart_div).parent().width();
    divHeight = brandEffectivenessChartDim['height'];
  };
  setDimensions();

  var beData = chartManager.getBeBarChartData();
  var bgIds = _.pluck(beData, 'bgId');
  var chartType = 'brand_effectiveness';
  //------------------------------------------------


  //------------------------------------------------
  // set up gemoetry
  var margin = {top: 10, right: 10, bottom: 25, left: 50};
  var width, height;
  function setGeometry(){
    width = divWidth - margin.left - margin.right;
    height = divHeight - margin.top - margin.bottom;
  };
  setGeometry();

  // how far to the left of y-axis we want our labels to be
  var yAxisLabelAnchorX = -35;
  var xAxisLabelAnchorY = 20;
  //------------------------------------------------


  //------------------------------------------------
  // define axis
  var x = d3.scale.ordinal().rangeRoundBands([0, width], .1),
      y = d3.scale.linear().range([height, 0]);
  function setRange(){
    x.rangeRoundBands([0, width], .1);
    y.range([height, 0]);
  };

  var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(""),
      yAxis = d3.svg.axis()
          .scale(y)
          .tickFormat(function(d) {return d3.format(',%')(d); })
          .orient("left");
  //------------------------------------------------


  //------------------------------------------------
  // start drawing
  var svg = d3.select(be_BarChart_div).append("svg")
      .attr("width", divWidth)
      .attr("height", divHeight);

  var beSVG = svg.append("g")
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
      .attr("height", height);

  var maskRect = mask.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("style", 'fill:url(#pattern);');
  //------------------------------------------------


  //------------------------------------------------
  // define domains
  function setDomains(){
    x.domain(beData.map(function(d) { return d.bgId; }));
    y.domain([0, d3.max(beData, function(d) { return d.value; })]);
  };
  setDomains();
  //------------------------------------------------


  //------------------------------------------------
  // draw bars
  var barChartSVG = beSVG.append("g").attr("class", "game-bg-rect");

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
  var xAxisSVG = beSVG.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
  xAxisSVG.selectAll(".tick").remove(); // remove all ticks

  var xAxisLabelSVG = beSVG.append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("x", width/2)
    .attr("y", height + xAxisLabelAnchorY)
    .text(chartHelpers.getChartLabel(chartType));

  var yAxisSVG = beSVG.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  var yAxisLabelSVG = beSVG.append("text")
      .attr("transform", "translate("+ (yAxisLabelAnchorX) +","+(height/2)+")rotate(-90)")
      .style("text-anchor", "middle")
      .text("Score")
      .attr("class", "axis-label");

  function resizeSVG(){
    svg.attr("width", divWidth).attr("height", divHeight);
    beSVG.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    mask.attr("width", width).attr("height", height);
    maskRect
        .attr("width", width)
        .attr("height", height)
        .attr("style", 'fill:url(#pattern);');

    xAxisSVG.attr("transform", "translate(0," + height + ")");
    xAxisLabelSVG.attr("x", width/2).attr("y", height + xAxisLabelAnchorY);
    yAxisLabelSVG.attr("transform", "translate("+ (yAxisLabelAnchorX) +","+(height/2)+")rotate(-90)");
  };
  //------------------------------------------------


  //------------------------------------------------
  // callbacks

  // repainting and loading new data
  function repaint(){
    beData = chartManager.getBeBarChartData();

    setDomains();
    
    var componentBars = barChartSVG.selectAll(".component-rects").data(beData);

    // enter
    var componentRects = componentBars.enter().append("g")
        .attr("class", "component-rects")
        .attr("id", function(d){ return getRectId(chartType, d.bgId); })
        .on("click", function(d) { handleClickOnBgBar(d.bgId); });

    componentRects.append("rect")
        .attr("class", "rect")
        .style("fill", function(d) { return chartManager.getBrandGroupColor(d.bgId); });
        
    componentRects.append("svg:title");

    // update + enter
    componentBars.select("rect")
        .attr("width", x.rangeBand())
      .transition()
        .duration(750)
        .attr("x", function(d) { return x(d.bgId); })
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); });

    componentBars.select("title")
        .text(function (d) { 
          return chartManager.getBrandGroupName(d.bgId) + ": " + d3.format(',%')(d.value); 
        });

    // exit
    componentBars.exit().remove();

    beSVG.select(".x.axis").call(xAxis);
    beSVG.select(".y.axis").transition().duration(750).call(yAxis);
  };

  function decorateComponentRect(chartTypeArg, bgIdsArg){
    barChartSVG.selectAll(".component-rects").select(".rect")
        .attr("mask", function(d) {
          if(chartType == chartTypeArg && bgIdsArg.length == 1 && d.bgId == bgIdsArg[0]){ 
            return 'url(#mask)';
          } else { return null; }
        });
  };

  function resize(){
    setDimensions();
    setGeometry();
    setRange();
    resizeSVG();

    repaint();
  };
  //------------------------------------------------


  //------------------------------------------------
  // finally, add call back to repaint charts
  chartManager.addRepaintCallback(repaint);
  chartManager.addResizeCallback(resize);
  chartManager.addTimelineChartSelectionCallback(decorateComponentRect);
  //------------------------------------------------
};
