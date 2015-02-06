/*------------------------------------------------
	Multi-line chart
	------------------------------------------------*/

function MultiLineChart(ndxManager){
  //------------------------------------------------
  // set up
  var debounceAutoReloadTime = 500; // 0.5 second

  // div for chart
  var sc_brandEffectiveness_div = '#brand-effectiveness-series-chart';
  var divWidth = $(sc_brandEffectiveness_div).parent().width();

  var beData = ndxManager.getBEData();
  var color = d3.scale.category10();
  //------------------------------------------------


  //------------------------------------------------
  // set up gemoetry
  var margin = {top: 10, right: 1, bottom: 90, left: 50},
      margin2 = {top: 325, right: 1, bottom: 1, left: 50},
      width = divWidth - margin.left - margin.right, 
      height = 400 - margin.top - margin.bottom,     // 300
      height2 = 361 - margin2.top - margin2.bottom;  // 35

  // how far to the left of y-axis we want our labels to be
  var yAxisLabelAnchorX = -35;
  //------------------------------------------------


  //------------------------------------------------
  // define axis and brush
  var x = d3.scale.linear().range([0, width]),
      x2 = d3.scale.linear().range([0, width]),
      y = d3.scale.linear().range([height, 0]),
      y2 = d3.scale.linear().range([height2, 0]);

  var xAxis = d3.svg.axis().scale(x).ticks(0).orient("bottom"),
      yAxis = d3.svg.axis()
          .scale(y)
          .tickFormat(function(d) {return d3.format(',%')(d); })
          .orient("left"),
      y2Axis = d3.svg.axis().scale(y2).ticks(0).orient("left");

  var brush = d3.svg.brush()
      .x(x2)
      .on("brushstart", brushStart)
      .on("brush", brushed)
      .on("brushend", brushEnd);
  //------------------------------------------------


  //------------------------------------------------
  // lines in charts
  // larger series chart
  var focusLine = d3.svg.line()
      .interpolate("linear")
      .x(function(d) { return x(d.counter); })
      .y(function(d) { return y(d.brand_effectiveness); });

  // smaller range chart
  var contextLine = d3.svg.line()
      .interpolate("linear")
      .x(function(d) { return x(d.counter); })
      .y(function(d) { return y2(d.brand_effectiveness); });
  //------------------------------------------------


  //------------------------------------------------
  // start drawing
  var beSVG = d3.select(sc_brandEffectiveness_div).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("class", "multi-line-chart");

  // clip prevents out-of-bounds flow of data points from chart when brushing
  beSVG.append("defs").append("clipPath")
      .attr("id", "clip")
    .append("rect")
      .attr("width", width)
      .attr("height", height);

  var focusSVG = beSVG.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr("class", "focusSVG");

  var contextSVG = beSVG.append("g")
      .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")")
      .attr("class", "contextSVG");

  // provide some background fill to range chart
  contextSVG.append("rect")
      .attr("width", width)
      .attr("height", height2)
      .attr("class", "contextSVGBackground");

  // set brush
  contextSVG.append("g")
      .attr("class", "x brush")
      .call(brush)
    .selectAll("rect")
      .attr("y", -6)
      .attr("height", height2 + 7);
  //------------------------------------------------


  //------------------------------------------------
  // define domains
  color.domain(d3.keys(beData));

  x.domain(d3.extent(beData[0].values, function(d) { return d.counter; }));
  y.domain([getMinEffectiveness(beData), getMaxEffectiveness(beData)]);

  x2.domain(d3.extent(beData[0].values, function(d) { return d.counter; }));
  y2.domain([getMinEffectiveness(beData), getMaxEffectiveness(beData)]);
  //------------------------------------------------


  //------------------------------------------------
  // draw lines in both charts
  var focusBE = focusSVG.selectAll(".focusBE")
      .data(beData)
    .enter().append("g")
      .attr("class", "focusBE");

  focusBE.append("path")
      .attr("class", "line")
      .attr("clip-path", "url(#clip)")
      .attr("d", function(d) { return focusLine(d.values); })
      .style("stroke", function(d) { return color(d.name); });

  var contextBE = contextSVG.selectAll(".contextBE")
      .data(beData)
    .enter().append("g")
      .attr("class", "contextBE");

  contextBE.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return contextLine(d.values); })
      .style("stroke", function(d) { return color(d.name); });
  //------------------------------------------------


  //------------------------------------------------
  // draw axes
  focusSVG.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  focusSVG.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "translate("+ (yAxisLabelAnchorX) +","+(height/2)+")rotate(-90)")  
      .style("text-anchor", "middle")
      .text("Brand Effectiveness")
      .attr("class", "axis-label");

  contextSVG.append("g")
      .attr("class", "y axis")
      .call(y2Axis)
    .append("text")
      .attr("transform", "translate("+ (yAxisLabelAnchorX) +","+(height2/2)+")rotate(-90)")  
      .style("text-anchor", "middle")
      .text("Game")
      .attr("class", "axis-label");
  //------------------------------------------------


  //------------------------------------------------
  // brush event handling 
  var oldXDomain, isStillBrushing;

  // brush start
  function brushStart() {
    oldXDomain = x.domain();
    isStillBrushing = true;
  };

  // on brush 
  function brushed() {
    x.domain(brush.empty() ? x2.domain() : brush.extent());

    focusBE.selectAll("path").attr("d", function(d) { return focusLine(d.values); });
    focusSVG.select(".x.axis").call(xAxis);
    focusSVG.select(".y.axis").call(yAxis);

    debouncedAutoReloadDuringBrush()
  };

  // on mouse release after brushing, pull in new set of data
  function brushEnd() {
    isStillBrushing = false;
    triggerNewData();
  };
  //------------------------------------------------


  //------------------------------------------------
  // repainting and loading new data
  function repaint(){
    beData = ndxManager.getBEData();

    x.domain(d3.extent(beData[0].values, function(d) { return d.counter; }));
    y.domain([getMinEffectiveness(beData), getMaxEffectiveness(beData)]);

    focusBE.data(beData);
    focusBE.select("path").attr("d", function(d) { return focusLine(d.values); });

    focusSVG.select(".x.axis").call(xAxis);
    focusSVG.select(".y.axis").transition().duration(750).call(yAxis);
  };

  function triggerNewData() {
    var brushLeft, brushRight;
    if(brush.empty()){
      brushLeft = x2.domain()[0];
      brushRight = x2.domain()[1];
    } else {
      brushLeft = brush.extent()[0];
      brushRight = brush.extent()[1];
    }

    // this triggers repaint of all charts through ndxManager
    ndxManager.setCounterBounds(brushLeft, brushRight);
  };

  function autoReloadDuringBrush() {
    // if not brushing anymore, don't do anything
    if (!isStillBrushing){ return; };

    // else, if we are out of bounds of existing data, reload
    var newXDomain = x.domain();
    if ((oldXDomain[0] > newXDomain[0]) || (oldXDomain[1] < newXDomain[1])){
      triggerNewData();
    }
  }
  var debouncedAutoReloadDuringBrush = _.debounce(autoReloadDuringBrush, debounceAutoReloadTime);
  //------------------------------------------------


  //------------------------------------------------
  // Get min/max of brand effectiveness - adjust
  // slightly so that it doesn't touch the bounds of chart
  function getMinEffectiveness(curData){
    return _.max(
      [0, d3.min(curData, function(s) { 
          return d3.min(s.values, function(v) { return v.brand_effectiveness - 0.01; }); 
        })
      ]);
  };

  function getMaxEffectiveness(curData){
    return _.min(
      [1, d3.max(curData, function(s) { 
          return d3.max(s.values, function(v) { return v.brand_effectiveness + 0.01; }); 
        })
      ]);
  };
  //------------------------------------------------


  //------------------------------------------------
  // finally, add call back to repaint charts
  ndxManager.addCallback(repaint);
  //------------------------------------------------
};
