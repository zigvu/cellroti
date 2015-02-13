/*------------------------------------------------
	Brush chart
	------------------------------------------------*/

function BrushChart(chartManager){
  //------------------------------------------------
  // set up
  var chartHelpers = chartManager.chartHelpers;

  // div for chart
  var brushChart_div = '#brush-chart';
  var divWidth = $(brushChart_div).parent().width();

  var beData = chartManager.getBEData();
  //------------------------------------------------


  //------------------------------------------------
  // set up gemoetry
  var margin = {top: 1, right: 1, bottom: 1, left: 50},
      width = divWidth - margin.left - margin.right, 
      height = 28 - margin.top - margin.bottom;     // 26

  //------------------------------------------------


  //------------------------------------------------
  // define axis and brush
  var x = d3.scale.linear().range([0, width]),
      y = d3.scale.linear().range([height, 0]);

  var brush = d3.svg.brush()
      .x(x)
      .on("brushstart", brushStart)
      .on("brush", brushed)
      .on("brushend", brushEnd);
  //------------------------------------------------


  //------------------------------------------------
  // lines in charts
  var contextLine = d3.svg.line()
      .interpolate("linear")
      .x(function(d) { return x(d.counter); })
      .y(function(d) { return y(d.brand_effectiveness); });
  //------------------------------------------------


  //------------------------------------------------
  // start drawing
  var brushSVG = d3.select(brushChart_div).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("class", "brush-chart")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // provide some background fill to range chart
  brushSVG.append("rect")
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
  //------------------------------------------------


  //------------------------------------------------
  // define domains
  x.domain(d3.extent(beData[0].values, function(d) { return d.counter; }));
  y.domain([chartHelpers.getMinEffectiveness(beData), chartHelpers.getMaxEffectiveness(beData)]);
  //------------------------------------------------


  //------------------------------------------------
  // draw lines
  var contextBE = brushSVG.selectAll(".contextBE")
      .data(beData)
    .enter().append("g")
      .attr("class", "contextBE");

  contextBE.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return contextLine(d.values); })
      .style("stroke", function(d) { return chartManager.getBrandGroupColor(d.bgId); }); 
  //------------------------------------------------

  //------------------------------------------------
  // repainting and loading new data
  this.repaint = function(){
    beData = chartManager.getBEData();

    x.domain(d3.extent(beData[0].values, function(d) { return d.counter; }));
    y.domain([chartHelpers.getMinEffectiveness(beData), chartHelpers.getMaxEffectiveness(beData)]);


    contextBE.data(beData);
    contextBE.select("path").attr("d", function(d) { return contextLine(d.values); });
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
};
