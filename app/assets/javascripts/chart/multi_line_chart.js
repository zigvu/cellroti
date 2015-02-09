/*------------------------------------------------
	Multi-line chart
	------------------------------------------------*/

function MultiLineChart(ndxManager, dataManager){
  //------------------------------------------------
  // set up
  var pxSpaceForOneChar; // cache px mapper for game background label length computation

  // div for chart
  var sc_brandEffectiveness_div = '#brand-effectiveness-series-chart';
  var divWidth = $(sc_brandEffectiveness_div).parent().width();

  var beData = ndxManager.getBEData();
  var gameData = dataManager.getBrushedGames(
    ndxManager.getBeginCounter(), ndxManager.getEndCounter());
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

  var gameLabelsAddPosX = 15;
  var gameLabelsAddPosY = 15;
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

  var focusGames = focusSVG.append("g").attr("class", "focusGames");

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
  x.domain(d3.extent(beData[0].values, function(d) { return d.counter; }));
  y.domain([getMinEffectiveness(beData), getMaxEffectiveness(beData)]);

  x2.domain(d3.extent(beData[0].values, function(d) { return d.counter; }));
  y2.domain([getMinEffectiveness(beData), getMaxEffectiveness(beData)]);
  //------------------------------------------------


  //------------------------------------------------
  // draw bars/lines in both charts

  var focusBE = focusSVG.selectAll(".focusBE")
      .data(beData)
    .enter().append("g")
      .attr("class", "focusBE");

  focusBE.append("path")
      .attr("class", "line")
      .attr("clip-path", "url(#clip)")
      .attr("d", function(d) { return focusLine(d.values); })
      .style("stroke", function(d) { return dataManager.getBrandGroupColor(d.bgId); }); 

  var contextBE = contextSVG.selectAll(".contextBE")
      .data(beData)
    .enter().append("g")
      .attr("class", "contextBE");

  contextBE.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return contextLine(d.values); })
      .style("stroke", function(d) { return dataManager.getBrandGroupColor(d.bgId); }); 

  // draw background rects
  var gameRects = focusGames.selectAll("rect")
      .data(gameData, function(d){ return d.game_id; })
    .enter()
      .append("rect")
      .attr("clip-path", "url(#clip)")
      .attr("width", function(d) { return x(d.end_count) - x(d.begin_count); })
      .attr("x", function(d) { return x(d.begin_count); })
      .attr("y", 0)
      .attr("height", function(d) { return height; })
      .style("fill", function(d) { return dataManager.getGameColor(d.game_id); });
      
  gameRects.append("svg:title").text(function (d) { return dataManager.getGameName(d.game_id); });

  // draw background labels
  var gameLabels = focusGames.selectAll(".gameLabel")
      .data(gameData, function(d){ return d.game_id; })
    .enter()
      .append("text")
      .attr("class", "gameLabel")
      .attr("x", function(d) { return x(d.begin_count) + gameLabelsAddPosX; })
      .attr("y", gameLabelsAddPosY)
      .text(function (d) { 
        return getModifiedGameLabel(
          dataManager.getGameName(d.game_id), 
          x(d.end_count) - x(d.begin_count));
      });
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
    var beginX2 = (x2(beginCounter) > x2.domain()[0]) ? x2(beginCounter) : x2.domain()[0];
    var endX2 = (x2(endCounter) < x2.domain()[1]) ? x2(endCounter) : x2.domain()[1];
    if(beginX2 >= endX2){ endX2 = beginX2 + 1; }
    brush.extent([beginX2, endX2]);

    if(beginCounter === 0 && endCounter === Infinity){ brush.clear(); };

    brush(d3.select(".brush"));
    brush.event(d3.select(".brush"));
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

    gameData = dataManager.getBrushedGames(ndxManager.getBeginCounter(), ndxManager.getEndCounter());
    drawGameBackground(gameData);

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
  var debouncedAutoReloadDuringBrush = _.debounce(autoReloadDuringBrush, chartDebounceTime);

  // drawing background rects
  function drawGameBackground(data){
    gameRects = focusGames.selectAll("rect").data(data, function(d){ return d.game_id; });
    gameLabels = focusGames.selectAll(".gameLabel").data(gameData, function(d){ return d.game_id; })

    // enter
    gameRects.enter().append("rect")
        .attr("clip-path", "url(#clip)")
        .attr("width", function(d) { return x(d.end_count) - x(d.begin_count); })
        .attr("x", function(d) { return x(d.begin_count); })
        .attr("y", 0)
        .attr("height", function(d) { return height; })
        .style("fill", function(d) { return dataManager.getGameColor(d.game_id); });

    gameRects.append("svg:title").text(function (d) { return dataManager.getGameName(d.game_id); });
        
    gameLabels.enter().append("text")
        .attr("class", "gameLabel")
        .attr("x", function(d) { return x(d.begin_count) + gameLabelsAddPosX; })
        .attr("y", gameLabelsAddPosY)
        .text(function (d) { 
          return getModifiedGameLabel(
            dataManager.getGameName(d.game_id), 
            x(d.end_count) - x(d.begin_count));
        });

    // update
    gameRects
        .attr("width", function(d) { return x(d.end_count) - x(d.begin_count); })
        .attr("x", function(d) { return x(d.begin_count); });

    gameLabels
        .attr("x", function(d) { return x(d.begin_count) + 10; })
        .text(function (d) { 
          return getModifiedGameLabel(
            dataManager.getGameName(d.game_id), 
            x(d.end_count) - x(d.begin_count));
        });
        
    // exit
    gameRects.exit().remove();
    gameLabels.exit().remove();
  };

  function drawGameBackground_old(data){
    var gameRects = focusGames.selectAll(".gameLabel").data(data, function(d){ return d.game_id; });

    gameRects.enter().append("g")
        .attr("class", "gameLabel")
        .attr("clip-path", "url(#clip)");

    gameRects.append("rect")
        .attr("width", function(d) { return x(d.end_count) - x(d.begin_count); })
        .attr("x", function(d) { return x(d.begin_count); })
        .attr("y", 0)
        .attr("height", function(d) { return height; })
        .style("fill", function(d) { return dataManager.getGameColor(d.game_id); });
        
    gameRects.append("svg:title").text(function (d) { return dataManager.getGameName(d.game_id); });
    gameRects.append("text")
        .attr("x", function(d) { return x(d.begin_count) + 10; })
        .attr("y", 15)
        .text(function (d) { 
          return getModifiedGameLabel(
            dataManager.getGameName(d.game_id), 
            x(d.end_count) - x(d.begin_count));
        });

    gameRects.select("rect")
        .attr("width", function(d) { return x(d.end_count) - x(d.begin_count); })
        .attr("x", function(d) { return x(d.begin_count); });

    gameRects.exit().remove();
  };
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
  // get modified text for game label based on width
  function getModifiedGameLabel(gameLabel, pxLength){
    if (pxSpaceForOneChar === undefined){
      textFW = "abcdefghijklmnopqrstuvdxyz";
      // get width of characters in SVG
      var textForWidth = focusGames.selectAll(".textForWidth")
          .data([textFW])
        .enter().append("text")
          .attr("id", "textForWidth")
          .attr("class", "focusGames")
          .attr("x", 0)
          .text(function(d) { return d; });
      pxSpaceForOneChar = textForWidth.node().getComputedTextLength()/textFW.length;
      focusGames.selectAll("#textForWidth").remove();
    }
    var retLabel = gameLabel.substring(0, parseInt(pxLength/pxSpaceForOneChar));
    // if truncated, show ellipeses
    if (retLabel.length != gameLabel.length){
      retLabel = retLabel.substring(0, retLabel.length - 4) + "..."
    }
    // if less than 5 characters, show nothing
    retLabel = retLabel.length <= 5 ? "" : retLabel;
    return retLabel;
  };

  //------------------------------------------------


  //------------------------------------------------
  // finally, add call back to repaint charts
  ndxManager.addCallback(repaint);
  //------------------------------------------------
};
