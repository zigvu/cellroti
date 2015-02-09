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
  var margin = {top: 5, right: 1, bottom: 1, left: 50},
      width = divWidth - margin.left - margin.right, 
      height = 306 - margin.top - margin.bottom;     // 300

  // how far to the left of y-axis we want our labels to be
  var yAxisLabelAnchorX = -35;

  var gameLabelsAddPosX = 15;
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
  var multiLineSVG = d3.select(sc_brandEffectiveness_div).append("svg")
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
  y.domain([getMinEffectiveness(beData), getMaxEffectiveness(beData)]);
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
      .style("stroke", function(d) { return dataManager.getBrandGroupColor(d.bgId); }); 

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
      .style("fill", function(d) { return dataManager.getGameColor(d.game_id); });
      
  gameRects.append("svg:title").text(function (d) { return dataManager.getGameName(d.game_id); });

  // draw background labels
  var gameLabels = gameBgRect.selectAll(".gameLabel")
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
  this.getXDomain = function() {
    return x.domain();
  };

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
    beData = ndxManager.getBEData();

    x.domain(d3.extent(beData[0].values, function(d) { return d.counter; }));
    y.domain([getMinEffectiveness(beData), getMaxEffectiveness(beData)]);

    focusBE.data(beData);
    focusBE.select("path").attr("d", function(d) { return focusLine(d.values); });

    gameData = dataManager.getBrushedGames(ndxManager.getBeginCounter(), ndxManager.getEndCounter());
    drawGameBackground(gameData);

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
      var textFW = "abcdefghijklmnopqrstuvdxyz";
      // get width of characters in SVG
      var textForWidth = gameBgRect.selectAll(".textForWidth")
          .data([textFW])
        .enter().append("text")
          .attr("id", "textForWidth")
          .attr("class", "game-bg-rect")
          .attr("x", 0)
          .text(function(d) { return d; });
      pxSpaceForOneChar = textForWidth.node().getComputedTextLength()/textFW.length;
      gameBgRect.selectAll("#textForWidth").remove();
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
