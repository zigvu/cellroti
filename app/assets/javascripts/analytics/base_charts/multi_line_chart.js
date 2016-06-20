/*------------------------------------------------
  Brush chart
  ------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.BaseCharts = ZIGVU.Analytics.BaseCharts || {};

ZIGVU.Analytics.BaseCharts.MultiLineChart = function(chartImpl){
  var self = this;

  //------------------------------------------------
  // set up
  var chartHelpers = chartImpl.chartHelpers;

  function getChartDim(){ return chartImpl.getChartDim(); }
  function getTimelineData(){ return chartImpl.getTimelineData(); }
  function getItemIds(){ return chartImpl.getItemIds(); }
  function getItemName(itemId){ return chartImpl.getItemName(itemId); }
  function getItemColor(itemId){ return chartImpl.getItemColor(itemId); }
  function getEventData(){ return chartImpl.getEventData(); }
  function getEventName(eventId){ return chartImpl.getEventName(eventId); }
  function getSegmentData(){ return chartImpl.getSegmentData(); }
  function getSegmentColor(idx){ return chartImpl.getSegmentColor(idx); }
  function getYAxisLabel(){ return chartImpl.getYAxisLabel(); }

  // function handleBrushSelection(dates){ chartImpl.handleBrushSelection(dates); }
  chartImpl.addRepaintCallback(repaint);
  chartImpl.addResizeCallback(resize);
  //------------------------------------------------


  //------------------------------------------------
  // modify data

  // Note on terminology:
  // item -> this is a single line in the multi-line chart

  // no modification necessary

  //------------------------------------------------

  // div for chart
  var chartDim, chartDiv, divWidth, divHeight;
  function setDimensions(){
    chartDim = getChartDim();
    chartDiv = chartDim.div;
    divWidth = $(chartDiv).parent().width();
    divHeight = chartDim.height;
  }
  setDimensions();

  var timelineData, eventData, segmentData, itemIds, yAxisLabel;
  //------------------------------------------------


  //------------------------------------------------
  // set up gemoetry
  var margin = {top: 5, right: 2, bottom: 25, left: 50};
  var width, height;
  function setGeometry(){
    width = divWidth - margin.left - margin.right;
    height = divHeight - margin.top - margin.bottom;
  }
  setGeometry();

  // how far to the left of y-axis we want our labels to be
  var yAxisLabelAnchorX = -35;
  var segmentLabelsAddPosX = 5;
  var segmentLabelsAddPosY = 15;
  var pxSpaceForOneChar; // cache px mapper for label length computation
  //------------------------------------------------


  //------------------------------------------------
  // define axis and brush
  var x = d3.time.scale().range([0, width]),
      y = d3.scale.linear().range([height, 0]);
  function setRange(){
    x.range([0, width]);
    y.range([height, 0]);
  }

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .tickFormat(function(d) {return d3.format(',%')(d); })
      .orient("left");

  var focusLine = d3.svg.line()
      .interpolate("linear")
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.value); });
  //------------------------------------------------


  //------------------------------------------------
  // start drawing
  var svg = d3.select(chartDiv).append("svg")
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

  var segmentSVG = multiLineSVG.append("g").attr("class", "segment-svg");
  var eventSVG = multiLineSVG.append("g").attr("class", "event-svg");
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
  }
  //------------------------------------------------


  //------------------------------------------------
  // define domains
  function setDomains(){
    x.domain(d3.extent(timelineData[0].values, function(d) { return d.date; }));
    y.domain([0, 1]);
  }
  //------------------------------------------------


  //------------------------------------------------
  // draw axes
  var xAxisSVG = multiLineSVG.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  var yAxisSVG = multiLineSVG.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  var yAxisLabelSVG = multiLineSVG.append("text")
      .attr("transform", "translate("+ (yAxisLabelAnchorX) +","+(height/2)+")rotate(-90)")
      .style("text-anchor", "middle")
      .text(yAxisLabel)
      .attr("class", "axis-label");
  //------------------------------------------------


  //------------------------------------------------
  // resize
  function resizeSVG(){
    svg.attr("width", divWidth).attr("height", divHeight);
    multiLineSVG.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    clipRect.attr("width", width).attr("height", height);
    mouseTrackingRect.attr("width", width).attr("height", height);
    mouseTrackingX.attr("y1", 0).attr("y2", height);
    mouseTrackingY.attr("x1", 0).attr("x2", width);

    xAxisSVG.attr("transform", "translate(0," + height + ")");
    yAxisLabelSVG.attr("transform", "translate("+ (yAxisLabelAnchorX) +","+(height/2)+")rotate(-90)");
  }
  //------------------------------------------------


  //------------------------------------------------
  // brush event handling
  this.getXDomain = function() { return x.domain(); };

  // on brush
  this.setNewExtent = function(dates) {
    x.domain([dates.begin_date, dates.end_date]);
    multiLineSVG.select(".x.axis").call(xAxis);
    multiLineSVG.select(".y.axis").call(yAxis);

    drawTimelineChart(timelineData);
    drawEventChart(eventData);
    drawSegmentChart(segmentData);
  };
  //------------------------------------------------


  //------------------------------------------------
  // callbacks

  // repainting and loading new data
  function repaint(){
    timelineData = getTimelineData();
    eventData = getEventData();
    segmentData = getSegmentData();
    itemIds = getItemIds();
    yAxisLabel = getYAxisLabel();
    setDomains();

    drawTimelineChart(timelineData);
    drawEventChart(eventData);
    drawSegmentChart(segmentData);

    multiLineSVG.select(".axis-label").text(yAxisLabel);
    multiLineSVG.select(".x.axis").call(xAxis);
    multiLineSVG.select(".y.axis").transition().duration(750).call(yAxis);
  }

  // drawing timeline chart
  function drawTimelineChart(timelineChartData){
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
        .style("stroke", function(d) { return getItemColor(d.itemId); });

    // exit
    focusLines.exit().remove();
  }

  // drawing segmet chart
  function drawSegmentChart(segmentData){
    var segmentRects = segmentSVG.selectAll("rect").data(segmentData);
    var segmentLabels = segmentSVG.selectAll(".segmentLabel").data(segmentData);

    // enter
    segmentRects.enter().append("rect")
        .attr("clip-path", "url(#milti-line-clip)")
        .style("fill", function(d) { return getSegmentColor(d.idx); });

    segmentLabels.enter().append("text").attr("class", "segmentLabel");

    // update + enter
    segmentRects
        .attr("x", function(d) { return x(d.begin_date); })
        .attr("y", 0)
        .attr("width", function(d) { return x(d.end_date) - x(d.begin_date); })
        .attr("height", function(d) { return height; });

    segmentLabels
        .attr("x", function(d) { return getSegmentLabelXPos(d) + segmentLabelsAddPosX; })
        .attr("y", segmentLabelsAddPosY)
        .text(function (d) { return getModifiedsegmentLabel(d); });

    // exit
    segmentRects.exit().remove();
    segmentLabels.exit().remove();
  }

  // drawing event chart
  function drawEventChart(eventData){
    var eventLineLong = eventSVG.selectAll(".event-line-long")
        .data(eventData, function(d){ return d.date; });
    var eventLineShort = eventSVG.selectAll(".event-line-short")
        .data(eventData, function(d){ return d.date; });
    var eventLabels = eventSVG.selectAll(".event-label")
        .data(eventData, function(d){ return d.date; });

    // enter
    eventLineLong.enter().append("line")
        .attr("clip-path", "url(#milti-line-clip)")
        .attr("class", "event-line-long");
    eventLineShort.enter().append("line")
        .attr("clip-path", "url(#milti-line-clip)")
        .attr("class", "event-line-short");
    eventLabels.enter().append("text")
        .attr("clip-path", "url(#milti-line-clip)")
        .attr("class", "event-label");

    // update + enter
    eventLineLong
        .attr("x1", function(d){ return x(d.date); })
        .attr("x2", function(d){ return x(d.date); })
        .attr("y1", 0)
        .attr("y2", height);
    eventLineShort
        .attr("x1", function(d){ return x(d.date); })
        .attr("x2", function(d){ return x(d.date); })
        .attr("y1", height - 5)
        .attr("y2", height);

    eventLabels
        .attr("x", function(d) { return x(d.date) + segmentLabelsAddPosX; })
        .attr("y", segmentLabelsAddPosY * 2)
        .text(function (d) { return getModifiedEventLabel(d); });

    // exit
    eventLineLong.exit().remove();
    eventLineShort.exit().remove();
    eventLabels.exit().remove();
  }


  function resize(){
    setDimensions();
    setGeometry();
    setRange();
    resizeSVG();

    repaint();
  }
  //------------------------------------------------

  //------------------------------------------------
  // get modified labels and widths

  function getSegmentLabelXPos(d){
    var xPos;
    if(x(d.begin_date) >= 0 && x(d.begin_date) <= width){
      xPos = x(d.begin_date);
    } else if(x(d.end_date) >= 0 && x(d.end_date) <= width) {
      xPos = 0;
    } else if(x(d.begin_date) <= 0 && x(d.end_date) >= width) {
      xPos = 0;
    } else {
      xPos = -500;
    }
    return xPos;
  }
  function getModifiedsegmentLabel(d){
    if (pxSpaceForOneChar === undefined){
      pxSpaceForOneChar = chartHelpers.getPxSpaceForOneChar(segmentSVG, "segment-svg");
    }
    var pxContainerLength = x(d.end_date) - getSegmentLabelXPos(d);
    return chartHelpers.ellipsis(d.label, pxContainerLength, pxSpaceForOneChar);
  }

  function getModifiedEventLabel(d){ return getEventName(d.event_id); }
};
