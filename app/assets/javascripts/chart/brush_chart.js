/*------------------------------------------------
	Brush chart
	------------------------------------------------*/

function BrushChart(ndxManager, dataManager, multiLineChart){
  //------------------------------------------------
  // set up

  // div for chart
  var bc_brandEffectiveness_div = '#brand-effectiveness-brush-chart';
  var divWidth = $(bc_brandEffectiveness_div).parent().width();

  var beData = ndxManager.getBEData();
  //------------------------------------------------


  //------------------------------------------------
  // set up gemoetry
  var margin = {top: 1, right: 1, bottom: 1, left: 50},
      width = divWidth - margin.left - margin.right, 
      height = 37 - margin.top - margin.bottom;     // 35

  // how far to the left of y-axis we want our labels to be
  var yAxisLabelAnchorX = -35;
  //------------------------------------------------


  //------------------------------------------------
  // define axis and brush
  var x = d3.scale.linear().range([0, width]),
      y = d3.scale.linear().range([height, 0]);

  var xAxis = d3.svg.axis().scale(x).ticks(0).orient("bottom"),
      yAxis = d3.svg.axis().scale(y).ticks(0).orient("left");

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
  var brushSVG = d3.select(bc_brandEffectiveness_div).append("svg")
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
  y.domain([
    d3.min(beData, function(s) { return d3.min(s.values, function(v) { return v.brand_effectiveness; }); }),
    d3.max(beData, function(s) { return d3.max(s.values, function(v) { return v.brand_effectiveness; }); })
  ]);
  //------------------------------------------------


  //------------------------------------------------
  // draw bars/lines in both charts
  var contextBE = brushSVG.selectAll(".contextBE")
      .data(beData)
    .enter().append("g")
      .attr("class", "contextBE");

  contextBE.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return contextLine(d.values); })
      .style("stroke", function(d) { return dataManager.getBrandGroupColor(d.bgId); }); 
  //------------------------------------------------


  //------------------------------------------------
  // draw axes
  brushSVG.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "translate("+ (yAxisLabelAnchorX) +","+(height/2)+")rotate(-90)")  
      .style("text-anchor", "middle")
      .text("Game")
      .attr("class", "axis-label");
  //------------------------------------------------


  //------------------------------------------------
  // brush event handling 
  var oldXDomain, isStillBrushing;

  // brush start
  function brushStart() {
    oldXDomain = multiLineChart.getXDomain();
    isStillBrushing = true;
  };

  // on brush 
  function brushed() {
    multiLineChart.setNewExtent(brush.empty() ? x.domain() : brush.extent());

    debouncedAutoReloadDuringBrush();
  };

  // on mouse release after brushing, pull in new set of data
  function brushEnd() {
    isStillBrushing = false;
    triggerNewData();
  };

  // allow outsiders to simulate brush events
  this.brushSet = function(beginCounter, endCounter){
    // set x2 values
    var beginX = (x(beginCounter) > x.domain()[0]) ? x(beginCounter) : x.domain()[0];
    var endX = (x(endCounter) < x.domain()[1]) ? x(endCounter) : x.domain()[1];
    if(beginX >= endX){ endX = beginX + 1; }
    brush.extent([beginX, endX]);

    if(beginCounter === 0 && endCounter === Infinity){ brush.clear(); };

    brush(d3.select(".brush"));
    brush.event(d3.select(".brush"));
  };
  //------------------------------------------------


  //------------------------------------------------
  // loading new data
  function autoReloadDuringBrush() {
    // if not brushing anymore, don't do anything
    if (!isStillBrushing){ return; };

    // else, if we are out of bounds of existing data, reload
    var newXDomain = multiLineChart.getXDomain();
    if ((oldXDomain[0] > newXDomain[0]) || // if swiping left of existing bound
      (oldXDomain[1] < newXDomain[1]) ||   // if swiping right of existing bound
      (oldXDomain[0] === x.domain()[0] && oldXDomain[1] === x.domain()[1])){ // no previous brush
      triggerNewData();
    }
  }
  var debouncedAutoReloadDuringBrush = _.debounce(autoReloadDuringBrush, chartDebounceTime);

  // trigger for new data from ndxManager
  function triggerNewData() {
    var brushLeft, brushRight;
    if(brush.empty()){
      brushLeft = x.domain()[0];
      brushRight = x.domain()[1];
    } else {
      brushLeft = brush.extent()[0];
      brushRight = brush.extent()[1];
    }

    // this triggers repaint of all charts through ndxManager
    ndxManager.setCounterBounds(brushLeft, brushRight);
  };
  //------------------------------------------------
};
