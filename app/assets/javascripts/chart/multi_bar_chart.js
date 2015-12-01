/*------------------------------------------------
  Multi-bar chart
  ------------------------------------------------*/

function MultiBarChart(chartManager){
  //------------------------------------------------
  // set up
  var chartHelpers = chartManager.chartHelpers;

  // div for chart
  var componentBarChartDim, bc_ComponentBarChart_div, divWidth, divHeight;
  function setDimensions(){
    componentBarChartDim = chartManager.getBEComponentChartDims();
    bc_ComponentBarChart_div = componentBarChartDim['div'];
    divWidth = $(bc_ComponentBarChart_div).parent().width();
    divHeight = componentBarChartDim['height'];
  };
  setDimensions();

  var bcData = chartManager.getBEComponentData();
  var bgIds = _.pluck(bcData[0].bgValues, 'bgId');
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
  var gapBetweenBarsInGroup = 0.9; // gap is 10% of bar width
  //------------------------------------------------


  //------------------------------------------------
  // define axis
  var x0 = d3.scale.ordinal().rangeRoundBands([0, width], .1),
      x1 = d3.scale.ordinal(),
      y = d3.scale.linear().range([height, 0]);
  function setRange(){
    x0.rangeRoundBands([0, width], .1);
    y.range([height, 0]);
  };

  var xAxis = d3.svg.axis()
          .scale(x0)
          .tickFormat(function(d) { return chartHelpers.getChartLabel(d); })
          .orient("bottom");
  var yAxis = d3.svg.axis()
          .scale(y)
          .tickFormat(function(d) {return d3.format(',%')(d); })
          .orient("left");
  //------------------------------------------------


  //------------------------------------------------
  // start drawing
  var svg = d3.select(bc_ComponentBarChart_div).append("svg")
      .attr("width", divWidth)
      .attr("height", divHeight);
  
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
      .attr("height", height);
  var maskRect = mask.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("style", 'fill:url(#pattern);');
  //------------------------------------------------


  //------------------------------------------------
  // define domains
  function setDomains(){
    x0.domain(bcData.map(function(d) { return d.component; }));
    x1.domain(bgIds).rangeRoundBands([0, x0.rangeBand()]);
    y.domain([0, d3.max(bcData, function(d) { return d3.max(d.bgValues, function(d) { return d.value; }); })]);
  };
  setDomains();
  //------------------------------------------------


  //------------------------------------------------
  // draw bars
  var allComponentSVG = bcSVG.append("g");

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
  var xAxisSVG = bcSVG.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  var xAxisLabelSVG = xAxisSVG.selectAll("text")
      .attr("class", "axis-label");

  var yAxisSVG = bcSVG.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  var yAxisLabelSVG = bcSVG.append("text")
      .attr("transform", "translate("+ (yAxisLabelAnchorX) +","+(height/2)+")rotate(-90)")
      .style("text-anchor", "middle")
      .text("Score")
      .attr("class", "axis-label");

  function resizeSVG(){
    svg.attr("width", divWidth).attr("height", divHeight);
    bcSVG.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    mask.attr("width", width).attr("height", height);
    maskRect
        .attr("width", width)
        .attr("height", height)
        .attr("style", 'fill:url(#pattern);');

    xAxisSVG.attr("transform", "translate(0," + height + ")");
    yAxisLabelSVG.attr("transform", "translate("+ (yAxisLabelAnchorX) +","+(height/2)+")rotate(-90)");
  };
  //------------------------------------------------


  //------------------------------------------------
  // callbacks

  // repainting and loading new data
  function repaint(){
    bcData = chartManager.getBEComponentData();

    setDomains();
    
    // enter
    var componentSVG = allComponentSVG.selectAll(".componentSVG").data(bcData);
    
    componentSVG.enter().append("g").attr("class", "componentSVG");

    var componentBars = componentSVG.selectAll(".component-rects")
        .data(function(d) { return d.bgValues; });

    var componentRects = componentBars.enter().append("g")
        .attr("class", "component-rects")
        .attr("id", function(d){ return getRectId(d.component, d.bgId); })
        .on("click", function(d) { handleClickOnBgBar(d.component, d.bgId); });

    componentRects.append("rect")
        .attr("class", "rect")
        .style("fill", function(d) { return chartManager.getBrandGroupColor(d.bgId); });
        
    componentRects.append("svg:title");

    // update + enter
    componentSVG
        .attr("transform", function(d) { return "translate(" + x0(d.component) + ",0)"; });

    componentSVG.selectAll(".component-rects").select("rect")
        .attr("x", function(d) { return x1(d.bgId); })
        .attr("width", x1.rangeBand() * gapBetweenBarsInGroup)
      .transition()
        .duration(750)
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); });

    componentSVG.selectAll(".component-rects").select("title")
        .text(function (d) { 
          return chartManager.getBrandGroupName(d.bgId) + ": " + d3.format(',%')(d.value); 
        });

    // exit
    componentBars.exit().remove();
    componentSVG.exit().remove();

    bcSVG.select(".x.axis").call(xAxis);
    bcSVG.select(".y.axis").transition().duration(750).call(yAxis);
  };

  function decorateComponentRect(chartTypeArg, bgIdsArg){
    allComponentSVG.selectAll(".componentSVG").selectAll(".component-rects").select("rect")
        .attr("mask", function(d) {
          if(d.component == chartTypeArg && d.bgId == bgIdsArg[0]){ 
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
