/*------------------------------------------------
  Multi-line chart
  ------------------------------------------------*/

function MultiLineChart(chartManager){
  //------------------------------------------------
  // set up
  var chartHelpers = chartManager.chartHelpers;

  // caches
  var pxSpaceForOneChar; // px mapper for game background label length computation
  var timelineChartType = undefined;
  var timelineChartYAxisLabel = undefined;

  // div for chart
  var timelineChartDim, timelineChart_div, divWidth, divHeight;
  function setDimensions(){
    timelineChartDim = chartManager.getTimelineChartDims();
    timelineChart_div = timelineChartDim['div'];

    divWidth = $(timelineChart_div).parent().width();
    divHeight = timelineChartDim['height'];
  };
  setDimensions();
  //------------------------------------------------


  //------------------------------------------------
  // set up gemoetry
  var margin = {top: 5, right: 1, bottom: 35, left: 50};
  var width, height;
  function setGeometry(){
    width = divWidth - margin.left - margin.right;
    height = divHeight - margin.top - margin.bottom;
  };
  setGeometry();

  // how far to the left of y-axis we want our labels to be
  var yAxisLabelAnchorX = -35;
  var xAxisLabelAnchorY = 30;

  var gameLabelsAddPosX = 5;
  var gameLabelsAddPosY = 15;
  //------------------------------------------------


  //------------------------------------------------
  // define axis
  var x = d3.scale.linear().range([0, width]),
      y = d3.scale.linear().range([height, 0]);
  function setRange(){
    x.range([0, width]);
    y.range([height, 0]);
  };

  // time formatting for x-axis
  var xAxisMaxDateStatic = new Date(2000,0,0,0,0,0,0); // Jan 1 2000
  var xAxisTimeFormatter = chartHelpers.getReadableTime(0).formatter;
  var xAxisTimeScale = d3.time.scale()
        .range(x.domain())
        .domain([xAxisMaxDateStatic, xAxisMaxDateStatic]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .ticks(10)
      .tickFormat(function(d) {return xAxisTimeTickLabel(d); })
      .orient("bottom");
  var yAxis = d3.svg.axis()
      .scale(y)
      .tickFormat(function(d) {return d3.format(',%')(d); })
      .orient("left");
  //------------------------------------------------


  //------------------------------------------------
  // X axis time formatting
  function xAxisTimeFormatXAxis(){
    var totalTime = chartManager.getBrushedFrameTime();
    var readableTime = chartHelpers.getReadableTime(totalTime);
    xAxisTimeFormatter = readableTime.formatter;
    xAxisTimeScale = d3.time.scale()
        .range(x.domain())
        .domain([xAxisMaxDateStatic, new Date(xAxisMaxDateStatic.getTime() + totalTime)]);
    return readableTime.unit_chart;
  };

  function xAxisTimeTickLabel(d){
    return xAxisTimeFormatter(xAxisTimeScale.invert(d));
  };
  //------------------------------------------------


  //------------------------------------------------
  // lines in charts
  var focusLine = d3.svg.line()
      .interpolate("linear")
      .x(function(d) { return x(d.counter); })
      .y(function(d) { return y(d[timelineChartType]); });
  //------------------------------------------------


  //------------------------------------------------
  // svg drawing
  var svg = d3.select(timelineChart_div).append("svg")
      .attr("width", divWidth)
      .attr("height", divHeight);

  var multiLineSVG = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr("class", "multi-line-chart");

  // clip prevents out-of-bounds flow of data points from chart when brushing
  var clipRect = multiLineSVG.append("defs").append("clipPath")
      .attr("id", "milti-line-clip")
    .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height);

  var gameBgRect = multiLineSVG.append("g").attr("class", "game-bg-rect");
  var gameEventSVG = multiLineSVG.append("g").attr("class", "game-event-svg");
  var timelineSVG = multiLineSVG.append("g").attr("class", "timeline-svg");

  // track mouse movements with dashed lines
  var mouseTrackingSVG = multiLineSVG.append("g")
      .attr("class", "mouse-tracking-svg")
      .style("display", "none");

  var mouseTrackingRect = multiLineSVG.append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", function() { mouseTrackingSVG.style("display", null); })
      .on("mouseout", function() { mouseTrackingSVG.style("display", "none"); })
      .on("mousemove", mousemove);

  var mouseTrackingX = mouseTrackingSVG.append("line").attr("y1", 0).attr("y2", height);
  var mouseTrackingY = mouseTrackingSVG.append("line").attr("x1", 0).attr("x2", width);

  // move mouse tracking lines as mouse moves
  function mousemove(){
    mouseTrackingX.attr("transform", "translate(" + d3.mouse(this)[0] + "," + 0 + ")");
    mouseTrackingY.attr("transform", "translate(" + 0 + "," + d3.mouse(this)[1] + ")");
  };
  //------------------------------------------------


  //------------------------------------------------
  // draw axes
  var xAxisSVG = multiLineSVG.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  var xAxisLabelSVG = multiLineSVG.append("g")
    .append("text")
      .attr("transform", "translate("+ (width/2 - 30) +","+ (height + xAxisLabelAnchorY) +")")
      .style("text-anchor", "middle")
      .text("TIME (" + '' + ")")
      .attr("class", "x-axis-time-label");

  var YAxisSVG = multiLineSVG.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  var yAxisLabelSVG = multiLineSVG.append("text")
      .attr("transform", "translate("+ (yAxisLabelAnchorX) +","+(height/2)+")rotate(-90)")
      .style("text-anchor", "middle")
      .text(timelineChartYAxisLabel)
      .attr("class", "axis-label");

  function resizeSVG(){
    svg.attr("width", divWidth).attr("height", divHeight);
    multiLineSVG.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    clipRect.attr("width", width).attr("height", height);
    mouseTrackingRect.attr("width", width).attr("height", height);
    mouseTrackingX.attr("y1", 0).attr("y2", height);
    mouseTrackingY.attr("x1", 0).attr("x2", width);

    xAxisSVG.attr("transform", "translate(0," + height + ")");
    xAxisLabelSVG.attr("transform", "translate("+ (width/2 - 30) +","+ (height + xAxisLabelAnchorY) +")");
    yAxisLabelSVG.attr("transform", "translate("+ (yAxisLabelAnchorX) +","+(height/2)+")rotate(-90)");
  };
  //------------------------------------------------


  //------------------------------------------------
  // brush event handling
  this.getXDomain = function() { return x.domain(); };

  // on brush
  this.setNewExtent = function(brushExtent) {
    x.domain(brushExtent);
    multiLineSVG.select(".x.axis").call(xAxis);
    multiLineSVG.select(".y.axis").call(yAxis);
  };
  //------------------------------------------------


  //------------------------------------------------
  // repainting and loading new data
  function repaint(){
    timelineChartType = chartManager.getTimelineChartType();
    timelineChartYAxisLabel = chartHelpers.getChartLabel(timelineChartType);
    var timelineChartData = chartManager.getTimelineChartData();
    drawTimelineChart(timelineChartData)

    var gameData = chartManager.getBrushedGames();
    drawGameBackground(gameData);

    var gameEventData = chartManager.getBrushedEvents();
    drawGameEvents(gameEventData);

    multiLineSVG.select(".x.axis").call(xAxis);
    multiLineSVG.select(".y.axis").transition().duration(750).call(yAxis);
  };

  // drawing timeline chart
  function drawTimelineChart(timelineChartData){
    // define domains
    x.domain(d3.extent(timelineChartData[0].values, function(d) { return d.counter; }));
    y.domain([
      chartHelpers.getMinTimelineChartValue(timelineChartData, timelineChartType),
      chartHelpers.getMaxTimelineChartValue(timelineChartData, timelineChartType)
    ]);
    var xAxisTimeFormatLabel = xAxisTimeFormatXAxis();
    multiLineSVG.select(".x-axis-time-label").text("TIME (" + xAxisTimeFormatLabel + ")");
    multiLineSVG.select(".axis-label").text(timelineChartYAxisLabel);

    var focusLines = timelineSVG.selectAll(".focusLines").data(timelineChartData);

    // enter
    focusLines.enter().append("g")
        .attr("class", "focusLines")
      .append("path")
        .attr("class", "line")
        .attr("clip-path", "url(#milti-line-clip)");

    // update + enter
    focusLines
        .select("path")
        .attr("d", function(d) { return focusLine(d.values); })
        .style("stroke", function(d) { return chartManager.getBrandGroupColor(d.bgId); });

    // exit
    focusLines.exit().remove();
  };

  // drawing background rects
  function drawGameBackground(gameData){
    var gameRects = gameBgRect.selectAll("rect").data(gameData, function(d){ return d.game_id; });
    var gameLabels = gameBgRect.selectAll(".gameLabel").data(gameData, function(d){ return d.game_id; })

    // enter
    gameRects.enter().append("rect")
        .attr("clip-path", "url(#milti-line-clip)")
        .style("fill", function(d) { return chartManager.getGameColor(d.game_id); });

    gameLabels.enter().append("text")
        .attr("class", "gameLabel");

    // update + enter
    gameRects
        .attr("x", function(d) { return x(d.begin_count); })
        .attr("y", 0)
        .attr("width", function(d) { return x(d.end_count + 1) - x(d.begin_count); })
        .attr("height", function(d) { return height; });

    gameLabels
        .attr("x", function(d) { return getModifiedXPos(d) + gameLabelsAddPosX; })
        .attr("y", gameLabelsAddPosY)
        .text(function (d) { return getModifiedGameLabel(d); });

    // exit
    gameRects.exit().remove();
    gameLabels.exit().remove();
  };


  function drawGameEvents(gameEventData){
    var gameEventLineLong = gameEventSVG.selectAll(".gameEventLineLong")
        .data(gameEventData, function(d){ return d.counter; });
    var gameEventLineShort = gameEventSVG.selectAll(".gameEventLineShort")
        .data(gameEventData, function(d){ return d.counter; });
    var gameEventLabels = gameEventSVG.selectAll(".gameEventLabel")
        .data(gameEventData, function(d){ return d.counter; });

    // enter
    gameEventLineLong.enter()
      .append("line")
        .attr("class", "gameEventLineLong");
        // .style("stroke", function(d){ return chartManager.getGameEventColor(d.event_id); });

    gameEventLineShort.enter()
      .append("line")
        .attr("class", "gameEventLineShort");

    gameEventLabels.enter()
      .append("text")
        .attr("class", "gameEventLabel");

    // update + enter
    gameEventLineLong
        .attr("x1", function(d){ return x(d.begin_count); })
        .attr("x2", function(d){ return x(d.begin_count); })
        .attr("y1", 0)
        .attr("y2", height);
    gameEventLineShort
        .attr("x1", function(d){ return x(d.begin_count); })
        .attr("x2", function(d){ return x(d.begin_count); })
        .attr("y1", height - 5)
        .attr("y2", height);

    gameEventLabels
        .attr("x", function(d) { return x(d.begin_count) + gameLabelsAddPosX; })
        .attr("y", gameLabelsAddPosY * 2)
        .text(function (d) { return getModifiedEventLabel(d); });

    // exit
    gameEventLineLong.exit().remove();
    gameEventLineShort.exit().remove();
    gameEventLabels.exit().remove();
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
  // get modified text for game label based on width
  function getModifiedXPos(d){
    var xPos = x(d.begin_count) > 0 ? x(d.begin_count) : 0;
    return xPos;
  };

  function getModifiedGameLabel(d){
    return getModifiedLabel(chartManager.getGameName(d.game_id), d);
  };

  function getModifiedEventLabel(d){
    return getModifiedLabel(chartManager.getGameEventName(d.event_type_id), d);
  };

  function getModifiedLabel(label, d){
    if (pxSpaceForOneChar === undefined){
      pxSpaceForOneChar = chartHelpers.getPxSpaceForOneChar(gameBgRect, "game-bg-rect");
    }
    var pxContainerLength = x(d.end_count + 1) - getModifiedXPos(d);
    return chartHelpers.ellipsis(label, pxContainerLength, pxSpaceForOneChar);
  };
  //------------------------------------------------


  //------------------------------------------------
  // finally, add call back to repaint charts
  chartManager.addRepaintCallback(repaint);
  chartManager.addResizeCallback(resize);
  //------------------------------------------------
};
