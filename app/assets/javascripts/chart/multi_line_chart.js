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

  // draw background rects
  var gameRects = gameBgRect.selectAll("rect")
      .data(gameData, function(d){ return d.game_id; })
    .enter()
      .append("rect")
      .attr("clip-path", "url(#clip)")
      .attr("width", function(d) { return x(d.end_count) - x(d.begin_count); })
      .attr("x", function(d) { return x(d.begin_count); })
      .attr("y", 0)
      .attr("height", function(d) { return height; })
      .style("fill", function(d) { return chartManager.getGameColor(d.game_id); });

  // draw background labels
  var gameLabels = gameBgRect.selectAll(".gameLabel")
      .data(gameData, function(d){ return d.game_id; })
    .enter()
      .append("text")
      .attr("class", "gameLabel")
      .attr("x", function(d) { return x(d.begin_count) + gameLabelsAddPosX; })
      .attr("y", gameLabelsAddPosY)
      .text(function (d) { 
        return getModifiedLabel(chartManager.getGameName(d.game_id), x(d.end_count) - x(d.begin_count));
      });
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

    multiLineSVG.select(".x.axis").call(xAxis);
    multiLineSVG.select(".y.axis").transition().duration(750).call(yAxis);    
  };

  // drawing background rects
  function drawGameBackground(data){
    gameRects = gameBgRect.selectAll("rect").data(data, function(d){ return d.game_id; });
    gameLabels = gameBgRect.selectAll(".gameLabel").data(gameData, function(d){ return d.game_id; })

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
