/*------------------------------------------------
	Brush chart
------------------------------------------------*/

function BrushChart(chartManager){
  var self = this;

  //------------------------------------------------
  // set up
  var chartHelpers = chartManager.chartHelpers;

  // div for chart
  var brushChartDim, brushChart_div, divWidth, divHeight;
  function setDimensions(){
    brushChartDim = chartManager.getBrushChartDims();
    brushChart_div = brushChartDim['div'];
    divWidth = $(brushChart_div).parent().width();
    divHeight = brushChartDim['height'];
  };
  setDimensions();

  var timelineChartType = undefined;
  //------------------------------------------------


  //------------------------------------------------
  // set up gemoetry
  var margin = {top: 1, right: 1, bottom: 1, left: 50};

  var width, height;
  function setGeometry(){
    width = divWidth - margin.left - margin.right;
    height = divHeight - margin.top - margin.bottom;
  };
  setGeometry();
  //------------------------------------------------


  //------------------------------------------------
  // define axis and brush
  var x = d3.scale.linear().range([0, width]),
      y = d3.scale.linear().range([height, 0]);
  function setRange(){
    x.range([0, width]);
    y.range([height, 0]);
  };

  var brush = d3.svg.brush()
      .x(x)
      .on("brushstart", brushStart)
      .on("brush", brushed)
      .on("brushend", brushEnd);
  this.brush = brush;
  //------------------------------------------------


  //------------------------------------------------
  // lines in charts
  var contextLine = d3.svg.line()
      .interpolate("linear")
      .x(function(d) { return x(d.counter); })
      .y(function(d) { return y(d[timelineChartType]); });
  //------------------------------------------------


  //------------------------------------------------
  // start drawing
  var svg = d3.select(brushChart_div).append("svg")
      .attr("width", divWidth)
      .attr("height", divHeight);

  var brushSVG = svg.append("g")
      .attr("class", "brush-chart")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // provide some background fill to range chart
  var brushBackgroundSVG = brushSVG.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "bg-rect");

  // set brush
  brushSVG.append("g")
      .attr("class", "x brush")
      .call(brush)
    .selectAll("rect")
      .attr("y", -6)
      .attr("height", height + 7);

  function resizeSVG(){
    svg.attr("width", divWidth).attr("height", divHeight);
    brushSVG.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    brushBackgroundSVG.attr("width", width).attr("height", height);
  };
  //------------------------------------------------


  //------------------------------------------------
  // repainting and loading new data
  this.repaint = function(){
    var brushChartData = chartManager.getBrushChartData();
    timelineChartType = chartManager.getTimelineChartType();

    // define domains
    x.domain(d3.extent(brushChartData[0].values, function(d) { return d.counter; }));
    y.domain([0, 1]);

    var contextBE = brushSVG.selectAll(".contextBE").data(brushChartData);
      
    // enter
    contextBE.enter().append("g")
        .attr("class", "contextBE")
      .append("path")
        .attr("class", "line");

    // update
    contextBE
        .select("path")
        .attr("d", function(d) { return contextLine(d.values); })
        .style("stroke", function(d) { return chartManager.getBrandGroupColor(d.bgId); }); 

    // exit
    contextBE.exit().remove();
  };

  function resize(){
    var brushLeft = brush.extent()[0];
    var brushRight = brush.extent()[1];

    setDimensions();
    setGeometry();
    setRange();
    resizeSVG();

    self.repaint();
    self.brushSet(brushLeft, brushRight);
  };
  //------------------------------------------------


  //------------------------------------------------
  // brush event handling 
  var oldXDomain, isStillBrushing;

  // brush start
  function brushStart() {
    oldXDomain = chartManager.getMultiLineXDomain();
    isStillBrushing = true;
  };

  // on brush 
  function brushed() {
    chartManager.setMultiLineNewExtent(brush.empty() ? x.domain() : brush.extent());

    debouncedAutoReloadDuringBrush();
  };

  // on mouse release after brushing, pull in new set of data
  function brushEnd() {
    isStillBrushing = false;
    triggerNewData();
  };

  // allow outsiders to simulate brush events
  this.brushSet = function(beginCounter, endCounter){
    var beginX = beginCounter > x.domain()[0] ? beginCounter : x.domain()[0];
    var endX = endCounter < x.domain()[1] ? endCounter : x.domain()[1];
    brush.extent([beginX, endX]);

    if(beginCounter === 0 && endCounter === Infinity){ brush.clear(); };

    brush(d3.select(".brush"));
    brush.event(d3.select(".brush"));
  };

  // convenience function that calls burshSet
  this.brushReset = function(){
    this.brushSet(0, Infinity);
  };

  this.brushGame = function(gameId){
    gameCounter = chartManager.getCounterForGame(gameId);
    this.brushSet(gameCounter.begin_count, gameCounter.end_count);
  }
  //------------------------------------------------


  //------------------------------------------------
  // loading new data
  function autoReloadDuringBrush() {
    // if not brushing anymore, don't do anything
    if (!isStillBrushing){ return; };

    // else, if we are out of bounds of existing data, reload
    var newXDomain = chartManager.getMultiLineXDomain();
    if ((oldXDomain[0] > newXDomain[0]) || // if swiping left of existing bound
      (oldXDomain[1] < newXDomain[1]) ||   // if swiping right of existing bound
      (oldXDomain[0] === x.domain()[0] && oldXDomain[1] === x.domain()[1])){ // no previous brush
      triggerNewData();
    }
  }
  var debouncedAutoReloadDuringBrush = _.debounce(autoReloadDuringBrush, chartDebounceTime);

  // trigger for new data
  function triggerNewData() {
    var brushLeft, brushRight;
    if(brush.empty()){
      brushLeft = x.domain()[0];
      brushRight = x.domain()[1];
    } else {
      brushLeft = brush.extent()[0];
      brushRight = brush.extent()[1];
    }

    // this triggers repaint of all charts
    chartManager.setCounterBounds(brushLeft, brushRight);
  };
  //------------------------------------------------


  //------------------------------------------------
  // finally, add call back to repaint charts
  // note: we don't want to repaint brush chart after every brush, so instead
  // call repainting from chart manager
  // chartManager.addRepaintCallback(repaint);
  chartManager.addResizeCallback(resize);
  //------------------------------------------------
};
