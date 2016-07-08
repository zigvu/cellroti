/*------------------------------------------------
  Brush chart
  ------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.BaseCharts = ZIGVU.Analytics.BaseCharts || {};

ZIGVU.Analytics.BaseCharts.BrushChart = function(chartImpl){
  var self = this;

  //------------------------------------------------
  // set up
  var chartHelpers = chartImpl.chartHelpers;

  function getChartDim(){ return chartImpl.getChartDim(); }
  function getChartData(){ return chartImpl.getChartData(); }
  function getItemIds(){ return chartImpl.getItemIds(); }
  function getItemName(itemId){ return chartImpl.getItemName(itemId); }
  function getItemColor(itemId){ return chartImpl.getItemColor(itemId); }

  function handleBrushSelection(dates){ chartImpl.handleBrushSelection(dates); }
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

  var chartData, itemIds;
  //------------------------------------------------


  //------------------------------------------------
  // set up gemoetry
  var margin = {top: 2, right: 2, bottom: 2, left: 50};
  var width, height;
  function setGeometry(){
    width = divWidth - margin.left - margin.right;
    height = divHeight - margin.top - margin.bottom;
  }
  setGeometry();
  //------------------------------------------------


  //------------------------------------------------
  // define axis and brush
  var x = d3.scale.linear().range([0, width]),
      y = d3.scale.linear().range([height, 0]);
  function setRange(){
    x.range([0, width]);
    y.range([height, 0]);
  }

  var brush = d3.svg.brush()
      .x(x)
      .on("brushstart", brushStart)
      .on("brush", brushed)
      .on("brushend", brushEnd);
  this.brush = brush;

  var contextLine = d3.svg.line()
      .interpolate("linear")
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.value); });
  //------------------------------------------------


  //------------------------------------------------
  // start drawing
  var svg = d3.select(chartDiv).append("svg")
      .attr("width", divWidth)
      .attr("height", divHeight);

  var brushSVG = svg.append("g")
      .attr("class", "brush-chart")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // provide some background fill to range chart
  var brushBgRect = brushSVG.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "bg-rect");

  var mask = brushSVG.append("g")
      .attr("class", "mask");

  var maskedLines = mask.append("g");

  var maskRectLeft = mask.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height);

  var maskRectRight = mask.append("rect")
      .attr("x", width)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height);

  // set brush
  brushSVG.append("g")
      .attr("class", "x brush")
      .call(brush)
    .selectAll("rect")
      .attr("y", 0)
      .attr("height", height);

  var brushFgRect = brushSVG.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "fg-rect");
  //------------------------------------------------


  //------------------------------------------------
  // define domains
  function setDomains(){
    x.domain(d3.extent(chartData[0].values, function(d) { return d.date; }));
    var minY = Infinity, maxY = -Infinity;
    _.each(chartData, function(cd){
      _.each(cd.values, function(d){
        if(minY > d.value){ minY = d.value; }
        if(maxY < d.value){ maxY = d.value; }
      });
    });
    y.domain([minY, maxY]);
  }
  //------------------------------------------------


  //------------------------------------------------
  // resize
  function resizeSVG(){
    svg.attr("width", divWidth).attr("height", divHeight);
    brushSVG.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    brushBgRect.attr("width", width).attr("height", height);
    brushFgRect.attr("width", width).attr("height", height);
  }
  //------------------------------------------------


  //------------------------------------------------
  // callbacks

  // repainting and loading new data
  function repaint(){
    chartData = getChartData();
    itemIds = getItemIds();
    setDomains();

    var lines = maskedLines.selectAll(".lines").data(chartData);

    // enter
    lines.enter().append("g")
        .attr("class", "lines")
      .append("path")
        .attr("class", "line");

    // update
    lines
        .select("path")
        .attr("d", function(d) { return contextLine(d.values); })
        .style("stroke", function(d) { return getItemColor(d.itemId); });

    // exit
    lines.exit().remove();
  }

  function resize(){
    var brushLeft = brush.extent()[0];
    var brushRight = brush.extent()[1];

    setDimensions();
    setGeometry();
    setRange();
    resizeSVG();

    repaint();
    self.brushSet(brushLeft, brushRight);
  }
  //------------------------------------------------

  //------------------------------------------------
  // brush event handling
  var isStillBrushing;

  // brush start
  function brushStart() {
    isStillBrushing = true;
  }

  // on brush
  function brushed() {
    maskRectLeft.attr("width", x(brush.extent()[0]));
    maskRectRight.attr("x", x(brush.extent()[1]));
  }

  // on mouse release after brushing
  function brushEnd() {
    isStillBrushing = false;
    handleBrushSelection(self.getBrushDates());
  }

  // allow outsiders to simulate brush events
  this.brushSet = function(beginDate, endDate){
    var beginX = beginDate > x.domain()[0] ? beginDate : x.domain()[0];
    var endX = endDate < x.domain()[1] ? endDate : x.domain()[1];
    brush.extent([beginX, endX]);

    brush(d3.select(".brush"));
    brush.event(d3.select(".brush"));
  };

  // reset brush
  this.brushReset = function(){
    brush.clear();
    maskRectLeft.attr("width", width);
    maskRectRight.attr("x", width);
    brush(d3.select(".brush"));
  };

  this.isBrushSet = function(){ return !brush.empty(); };

  this.getBrushDates = function(){
    var beginDate = brush.extent()[0], endDate = brush.extent()[1];
    if(beginDate == endDate){
      beginDate = x.domain()[0];
      endDate = x.domain()[1];
    }
    return {begin_date: new Date(beginDate), end_date: new Date(endDate)};
  };
  //------------------------------------------------

};
