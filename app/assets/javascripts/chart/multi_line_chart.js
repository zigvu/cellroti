/*------------------------------------------------
  Multi-line chart
  ------------------------------------------------*/

function MultiLineChart(chartManager){
  //------------------------------------------------
  // set up
  var chartHelpers = chartManager.chartHelpers;

  var pxSpaceForOneChar; // cache px mapper for game background label length computation

  // div for chart
  var seriesChart_div = '#series-chart';
  var divWidth = $(seriesChart_div).parent().width();

  var beData = chartManager.getBEData();
  var gameData = chartManager.getBrushedGames();
  var gameEventData = chartManager.getBrushedEvents();
  //------------------------------------------------


  //------------------------------------------------
  // set up gemoetry
  var margin = {top: 5, right: 1, bottom: 1, left: 50},
      width = divWidth - margin.left - margin.right, 
      height = 306 - margin.top - margin.bottom;     // 300

  // how far to the left of y-axis we want our labels to be
  var yAxisLabelAnchorX = -35;

  var gameLabelsAddPosX = 5;
  var gameLabelsAddPosY = 15;
  //------------------------------------------------


  //------------------------------------------------
  // define axis
  var x = d3.scale.linear().range([0, width]),
      y = d3.scale.linear().range([height, 0]);

  var xAxis = d3.svg.axis().scale(x).ticks(0).orient("bottom"),
      yAxis = d3.svg.axis()
          .scale(y)
          .tickFormat(function(d) {return d3.format(',%')(d); })
          .orient("left");
  //------------------------------------------------


  //------------------------------------------------
  // lines in charts
  var focusLine = d3.svg.line()
      .interpolate("linear")
      .x(function(d) { return x(d.counter); })
      .y(function(d) { return y(d.brand_effectiveness); });
  //------------------------------------------------


  //------------------------------------------------
  // start drawing
  var multiLineSVG = d3.select(seriesChart_div).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr("class", "multi-line-chart");

  // clip prevents out-of-bounds flow of data points from chart when brushing
  multiLineSVG.append("defs").append("clipPath")
      .attr("id", "clip")
    .append("rect")
      .attr("width", width)
      .attr("height", height);

  var gameBgRect = multiLineSVG.append("g").attr("class", "game-bg-rect");

  var gameEventSVG = multiLineSVG.append("g").attr("class", "game-event-svg");

  // track mouse movements with dashed lines
  var mouseTrackingSVG = multiLineSVG.append("g")
      .attr("class", "mouse-tracking-svg")
      .style("display", "none");

  multiLineSVG.append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", function() { mouseTrackingSVG.style("display", null); })
      .on("mouseout", function() { mouseTrackingSVG.style("display", "none"); })
      .on("mousemove", mousemove);
  //------------------------------------------------


  //------------------------------------------------
  // define domains
  x.domain(d3.extent(beData[0].values, function(d) { return d.counter; }));
  y.domain([chartHelpers.getMinEffectiveness(beData), chartHelpers.getMaxEffectiveness(beData)]);
  //------------------------------------------------


  //------------------------------------------------
  // draw bars/lines
  var focusBE = multiLineSVG.selectAll(".focusBE")
      .data(beData)
    .enter().append("g")
      .attr("class", "focusBE");

  focusBE.append("path")
      .attr("class", "line")
      .attr("clip-path", "url(#clip)")
      .attr("d", function(d) { return focusLine(d.values); })
      .style("stroke", function(d) { return chartManager.getBrandGroupColor(d.bgId); }); 

  // background decorations
  drawGameBackground(gameData);
  drawGameEvents(gameEventData);

  // draw mouse tracking lines
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
  multiLineSVG.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  multiLineSVG.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "translate("+ (yAxisLabelAnchorX) +","+(height/2)+")rotate(-90)")  
      .style("text-anchor", "middle")
      .text("Brand Effectiveness")
      .attr("class", "axis-label");
  //------------------------------------------------


  //------------------------------------------------
  // brush event handling 
  this.getXDomain = function() { return x.domain(); };

  // on brush 
  this.setNewExtent = function(brushExtent) {
    x.domain(brushExtent);

    focusBE.selectAll("path").attr("d", function(d) { return focusLine(d.values); });
    multiLineSVG.select(".x.axis").call(xAxis);
    multiLineSVG.select(".y.axis").call(yAxis);
  };
  //------------------------------------------------


  //------------------------------------------------
  // repainting and loading new data
  function repaint(){
    beData = chartManager.getBEData();

    x.domain(d3.extent(beData[0].values, function(d) { return d.counter; }));
    y.domain([chartHelpers.getMinEffectiveness(beData), chartHelpers.getMaxEffectiveness(beData)]);

    focusBE.data(beData);
    focusBE.select("path").attr("d", function(d) { return focusLine(d.values); });

    if(!chartManager.isGameDisplaying){
      gameData = chartManager.getBrushedGames();
      drawGameBackground(gameData);
    }

    gameEventData = chartManager.getBrushedEvents();
    drawGameEvents(gameEventData);

    multiLineSVG.select(".x.axis").call(xAxis);
    multiLineSVG.select(".y.axis").transition().duration(750).call(yAxis);    
  };

  // drawing background rects
  function drawGameBackground(data){
    var gameRects = gameBgRect.selectAll("rect").data(data, function(d){ return d.game_id; });
    var gameLabels = gameBgRect.selectAll(".gameLabel").data(gameData, function(d){ return d.game_id; })

    // enter
    gameRects.enter().append("rect")
        .attr("clip-path", "url(#clip)")
        .attr("width", function(d) { return x(d.end_count) - x(d.begin_count); })
        .attr("x", function(d) { return x(d.begin_count); })
        .attr("y", 0)
        .attr("height", function(d) { return height; })
        .style("fill", function(d) { return chartManager.getGameColor(d.game_id); });
    
    gameLabels.enter().append("text")
        .attr("class", "gameLabel")
        .attr("x", function(d) { return x(d.begin_count) + gameLabelsAddPosX; })
        .attr("y", gameLabelsAddPosY)
        .text(function (d) { 
          return getModifiedLabel(chartManager.getGameName(d.game_id), x(d.end_count) - x(d.begin_count));
        });

    // update
    gameRects
        .attr("width", function(d) { return x(d.end_count) - x(d.begin_count); })
        .attr("x", function(d) { return x(d.begin_count); });

    gameLabels
        .attr("x", function(d) { return x(d.begin_count) + gameLabelsAddPosX; })
        .text(function (d) { 
          return getModifiedLabel(chartManager.getGameName(d.game_id), x(d.end_count) - x(d.begin_count));
        });
        
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
      .attr("class", "gameEventLineLong")
      .attr("x1", function(d){ return x(d.begin_count); })
      .attr("x2", function(d){ return x(d.begin_count); })
      .attr("y1", 0)
      .attr("y2", height);
      // .style("stroke", function(d){ return chartManager.getGameEventColor(d.event_id); });

    gameEventLineShort.enter()
      .append("line")
      .attr("class", "gameEventLineShort")
      .attr("x1", function(d){ return x(d.begin_count); })
      .attr("x2", function(d){ return x(d.begin_count); })
      .attr("y1", height - 5)
      .attr("y2", height);

    gameEventLabels.enter()
      .append("text")
      .attr("class", "gameEventLabel")
      .attr("x", function(d) { return x(d.begin_count) + gameLabelsAddPosX; })
      .attr("y", gameLabelsAddPosY * 2)
      .text(function (d) { 
        return getModifiedLabel(
          chartManager.getGameEventName(d.event_id), x(d.end_count) - x(d.begin_count)
        );
      });

    // update
    gameEventLineLong
        .attr("x1", function(d){ return x(d.begin_count); })
        .attr("x2", function(d){ return x(d.begin_count); });
    gameEventLineShort
        .attr("x1", function(d){ return x(d.begin_count); })
        .attr("x2", function(d){ return x(d.begin_count); });

    gameEventLabels
        .attr("x", function(d) { return x(d.begin_count) + gameLabelsAddPosX; })
      .text(function (d) { 
        return getModifiedLabel(
          chartManager.getGameEventName(d.event_id), x(d.end_count) - x(d.begin_count)
        );
      });

    // exit
    gameEventLineLong.exit().remove();
    gameEventLineShort.exit().remove();
    gameEventLabels.exit().remove();
  };
  //------------------------------------------------


  //------------------------------------------------
  // get modified text for game label based on width
  function getModifiedLabel(label, pxContainerLength){
    if (pxSpaceForOneChar === undefined){
      pxSpaceForOneChar = chartHelpers.getPxSpaceForOneChar(gameBgRect, "game-bg-rect");
    }
    return chartHelpers.ellipsis(label, pxContainerLength, pxSpaceForOneChar);
  };
  //------------------------------------------------


  //------------------------------------------------
  // finally, add call back to repaint charts
  chartManager.addCallback(repaint);
  //------------------------------------------------
};
