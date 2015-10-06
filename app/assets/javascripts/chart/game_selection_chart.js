/*------------------------------------------------
	Brush chart
	------------------------------------------------*/

function GameSelectionChart(chartManager){
  //------------------------------------------------
  // set up
  var chartHelpers = chartManager.chartHelpers;

  var pxSpaceForOneChar; // cache px mapper for game background label length computation

  // div for chart
  var gameSelectionChartDim, bc_gameSelection_div, divWidth, divHeight;
  function setDimensions(){
    gameSelectionChartDim = chartManager.getGameSelectionChartDims();
    bc_gameSelection_div = gameSelectionChartDim['div'];
    divWidth = $(bc_gameSelection_div).parent().width();
    divHeight = gameSelectionChartDim['height'];
  };
  setDimensions();

  var subSeasonData = chartManager.getSubSeasonData();
  //------------------------------------------------


  //------------------------------------------------
  // set up gemoetry
  var margin = {top: 3, right: 2, bottom: 3, left: 50};
  var seasonLabelsAddPosX = 5;
  var seasonLabelsAddPosY = 5;

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
  //------------------------------------------------


  //------------------------------------------------
  // start drawing
  var svg = d3.select(bc_gameSelection_div).append("svg")
      .attr("width", divWidth)
      .attr("height", divHeight)
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // clip prevents out-of-bounds flow of bars
  var clipRect = svg.append("defs").append("clipPath")
      .attr("id", "clip")
    .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height);

  var seasonSVG = svg.append("g")
      .attr("class", "game-selection-chart")
      .attr("clip-path", "url(#clip)");

  function resizeSVG(){
    svg.attr("width", divWidth).attr("height", divHeight);
    clipRect.attr("width", width).attr("height", height);
  };
  //------------------------------------------------


  //------------------------------------------------
  // define domains
  var domainForChart = 1000; // set domain for ease of debugging
  function setDomains(){
    x.domain([0, domainForChart]);
    y.domain([0, 1]);
  };
  setDomains();
  //------------------------------------------------


  //------------------------------------------------
  // repaint due to brush update callback
  function repaint(){
    if(!chartManager.isBrushSet()){ setSeasonSelected(); }
    subSeasonData = getClonedSubSeasonData(chartManager.getSubSeasonData());

    // enter
    subSeasonSVG = seasonSVG.selectAll(".sub-season").data(subSeasonData, function(d){ return '' + d.id; });
    
    var subSeasonG = subSeasonSVG.enter().append("g").attr("class", "sub-season");

    var gameSVG = subSeasonG.selectAll(".game")
        .data(function(d) { return d.games; });

    var gameG = gameSVG.enter().append("g").attr("class", "game");
    gameG.append("rect")
        .attr("class", "game-rect")
        .attr("id", function(d){ return "gid_" + d.game_id; })
        .attr("y", 2)
        .style("fill", function(d) { return chartManager.getGameColor(d.game_id); })
        .on("click", handleClickGame);
    gameG.append("text").attr("class", "game-text");

    subSeasonG.append("rect")
        .attr("class", "sub-season-rect")
        .attr("id", function(d){ return "sid_" + d.id; })
        .attr("x", 0)
        .attr("y", 1)
        .on("click", handleClickSubSeason);
    subSeasonG.append("text").attr("class", "sub-season-text");
    subSeasonG.append("rect")
        .attr("class", "sub-season-border")
        .attr("x", 0)
        .attr("y", 1);

    gameG.append("rect")
        .attr("class", "game-overlay")
        .attr("y", 1)
        .on("click", handleClickGame);

    // update + enter
    seasonSVG.selectAll(".sub-season")
        .attr("transform", function(d){ return "translate(" + x(d.x) + ", 0)"; });

    subSeasonSVG.selectAll(".game-rect")
        .attr("x", function(d) { return x(d.x); })
        .attr("width", function(d) { return x(d.width); })
        .attr("height", height - 2);
    subSeasonSVG.selectAll(".game-text")
        .attr("x", function(d) { return x(d.x) + seasonLabelsAddPosX; })
        .attr("y", height/2 + seasonLabelsAddPosY)
        .text(function (d) { return getModifiedLabelGame(d, x(d.width)); })
        .attr("style", function(d){ return getSubSeasonDisplayStyle(d); })
        .classed("selected", isGameSelected());
    subSeasonSVG.selectAll(".game-overlay")
        .attr("x", function(d) { return x(d.x); })
        .attr("width", function(d) { return x(d.width); })
        .attr("height", height - 2)
        .attr("style", function(d){ return getGameDisplayStyle(d); });

    subSeasonSVG.select(".sub-season-rect")
        .attr("width", function(d) { return x(d.width); })
        .attr("height", height - 1)
        .attr("style", function(d){ return getSeasonDisplayStyle(d); });
    subSeasonSVG.select(".sub-season-text")
        .attr("x", seasonLabelsAddPosX)
        .attr("y", height/2 + seasonLabelsAddPosY)
        .text(function (d) { return getModifiedLabelSeason(d, x(d.width)); })
        .attr("style", function(d){ return getSeasonDisplayStyle(d); });
    subSeasonSVG.select(".sub-season-border")
        .attr("width", function(d) { return x(d.width); })
        .attr("height", height - 1);

    // exit
    subSeasonSVG.exit().remove();
  };


  function resize(){
    setDimensions();
    setGeometry();
    setRange();
    resizeSVG();

    repaint();
  };
  //------------------------------------------------


  //------------------------------------------------
  // click handling
  function handleClickSubSeason(d){
    selectSubSeasonEvent = true;
    if(d.id > 0){
      setSubSeasonSelected(d.id);
      chartManager.brushSet(d.begin_count, d.end_count);
    } else {
      // reset clicked
      if(isSubSeasonSelected()){
        setSeasonSelected();
        chartManager.brushReset();
      } else {
        var ssd = _.find(subSeasonData, function(sd, idx, list){
          return _.find(sd.games, function(gd){
            return gd.game_id == displayingGameId;
          }) !== undefined;
        });
        if(isGameLoaded()){ unloadGame(); }
        setSubSeasonSelected(ssd.id);
        chartManager.brushSet(ssd.begin_count, ssd.end_count);
      }
    }
    selectSubSeasonEvent = false;
  };

  function handleClickGame(d){
    if(isGameSelected()){
      if(!isGameLoaded()){ loadGame(); }
    } else {
      setGameSelected(d.game_id);
      chartManager.brushSet(d.begin_count, d.end_count);
    }
  };
  //------------------------------------------------


  //------------------------------------------------
  // helper functions

  // get modified text label based on width
  function getModifiedLabelGame(d, px){
    if(isGameSelected()){
      if(isGameLoaded()){ return "Game: " + d.name; }
      else { return "Load game: " + d.name; }
    }
    return getModifiedLabel(d.name, px);
  };
  function getModifiedLabelSeason(d, px){
    return getModifiedLabel(d.name, px);
  };
  function getModifiedLabel(label, pxContainerLength){
    if (pxSpaceForOneChar === undefined){
      pxSpaceForOneChar = chartHelpers.getPxSpaceForOneChar(seasonSVG, "game-selection-chart");
    }
    return chartHelpers.ellipsis(label, pxContainerLength, pxSpaceForOneChar);
  };


  // get display styles
  function getSeasonDisplayStyle(d){
    var disp = 'display:none';
    if(isSeasonSelected()){
      if(d.id > 0){ disp = 'display:inline'; }
    } else if(isSubSeasonSelected() || isGameSelected()){
      if(d.id < 0){ disp = 'display:inline; opacity: 1.0'; }
    }
    return disp;
  };
  function getSubSeasonDisplayStyle(d){
    var disp = 'display:none';
    if(isSubSeasonSelected() || isGameSelected()){
      disp = 'display:inline';
    }
    return disp;
  };
  function getGameDisplayStyle(d){
    var disp = 'display:none';
    if(isGameSelected()){ disp = 'display:inline'; }
    return disp;
  };
  //------------------------------------------------


  //------------------------------------------------
  // data manipulation
  var displayingSubSeasonId = undefined, displayingGameId = undefined;

  function setSeasonSelected(){
    displayingSubSeasonId = undefined;
    displayingGameId = undefined;
  };
  function isSeasonSelected(){ 
    return displayingSubSeasonId === undefined && displayingGameId === undefined;
  };

  function setSubSeasonSelected(subSeasonId){
    displayingSubSeasonId = subSeasonId;
    displayingGameId = undefined;
  };
  function isSubSeasonSelected(){ return displayingSubSeasonId !== undefined; };

  function setGameSelected(gameId){
    displayingSubSeasonId = undefined;
    displayingGameId = gameId;
  };
  function isGameSelected(){ return displayingGameId !== undefined; };

  // simulate selection
  var selectSubSeasonEvent = false;
  function autoSelectRects(){
    if(selectSubSeasonEvent){ return; }
    var brushedGames = chartManager.getBrushedGames();
    var brushedGameIds = _.pluck(brushedGames, 'game_id');
    var brushedSeasonIds = _.unique(_.pluck(brushedGames, 'season_id'));
    if(brushedGameIds.length == 1){
      setGameSelected(brushedGameIds[0]);
    } else if(brushedSeasonIds.length == 1) {
      setSubSeasonSelected(brushedSeasonIds[0]);
    } else { }
  };

  // modify incoming data
  function getClonedSubSeasonData(nonEmptySubSeasons){ 
    var numOfResetBoxes = 2;
    if(nonEmptySubSeasons.length <= numOfResetBoxes){ return []; }

    autoSelectRects();

    var widthOfBarSubSeason = domainForChart/(nonEmptySubSeasons.length - numOfResetBoxes);
    var beginXSubSeason = 0;
    _.each(nonEmptySubSeasons, function(sd){
      // skip reset boxes
      if(sd.id < 0){ return; }

      sd.x = beginXSubSeason;
      sd.width = widthOfBarSubSeason;
      beginXSubSeason = beginXSubSeason + widthOfBarSubSeason;

      getSubSeasonData_updateGameWidths(sd, widthOfBarSubSeason)
    });

    // in case need to display side reset bars
    var expandedBarWidth = parseInt(domainForChart * 0.70);
    var resetBarWidth = parseInt((domainForChart - expandedBarWidth)/2);
    var resetBarFirstX = 0;
    var resetBarSecondX = resetBarWidth + expandedBarWidth;

    if(isSubSeasonSelected()){
      var widthSubSeason = 0, subSeasonDisplayed = false;
      _.each(nonEmptySubSeasons, function(sd, idx, list){
        if(sd.id == displayingSubSeasonId){
          beginXSubSeason = resetBarWidth;
          widthSubSeason = expandedBarWidth;
          getSubSeasonData_updateGameWidths(sd, expandedBarWidth);
          subSeasonDisplayed = true;
        } else {
          if(!subSeasonDisplayed){ beginXSubSeason = sd.x - domainForChart - 1; }
          else { beginXSubSeason = sd.x + domainForChart + 1; }
          widthSubSeason = sd.width;
        }
        sd.x = beginXSubSeason;
        sd.width = widthSubSeason;
      });
    } else if(isGameSelected()){
      var widthSubSeason = 0, subSeasonDisplayed = false;
      _.each(nonEmptySubSeasons, function(sd, idx, list){
        var displyingGD = _.find(sd.games, function(gd){ return gd.game_id == displayingGameId; });
        if(displyingGD !== undefined){
          var resize = d3.scale.linear()
              .range([resetBarWidth, expandedBarWidth + resetBarWidth])
              .domain([sd.x + displyingGD.x, sd.x + displyingGD.x + displyingGD.width]);

          beginXSubSeason = resize(sd.x);
          widthSubSeason = resize(sd.x + sd.width) - resize(sd.x);
          getSubSeasonData_updateGameWidths(sd, widthSubSeason);

          subSeasonDisplayed = true;
        } else {
          if(!subSeasonDisplayed){ beginXSubSeason = sd.x - domainForChart - 1; }
          else { beginXSubSeason = sd.x + domainForChart + 1; }
          widthSubSeason = sd.width;
        }
        sd.x = beginXSubSeason;
        sd.width = widthSubSeason;
      });
    }

    // add reset boxes
    _.each(nonEmptySubSeasons, function(sd){
      if(sd.id > 0){ return; }

      if(sd.id == -1){ 
        if(isSubSeasonSelected() || isGameSelected()){
          beginXSubSeason = 0;
          widthSubSeason = resetBarWidth;
        } else {
          beginXSubSeason = resetBarFirstX + resetBarWidth;
          widthSubSeason = 0;
        }
      } else if(sd.id == -2){ 
        beginXSubSeason = resetBarSecondX;
        if(isSubSeasonSelected() || isGameSelected()){ widthSubSeason = resetBarWidth; }
        else { widthSubSeason = 0; }
      }
      sd.x = beginXSubSeason;
      sd.width = widthSubSeason;
    });

    return nonEmptySubSeasons;
  };

  function getSubSeasonData_updateGameWidths(sd, widthOfBarSubSeason){
    // update game widths
    var widthOfBarGame = widthOfBarSubSeason/sd.games.length;
    var beginXGame = 0;
    _.each(sd.games, function(gd){
      gd.x = beginXGame;
      gd.width = widthOfBarGame;
      beginXGame = beginXGame + widthOfBarGame;
      gd.name = chartManager.getGameName(gd.game_id);
    });
  };
  //------------------------------------------------


  //------------------------------------------------
  // mode setting
  this.loadGameSimulate = function(gameId){
    displayingGameId = gameId;
    loadGame();
  };
  function loadGame(){ chartManager.toggleGameDisplay(displayingGameId); };
  function unloadGame(){ chartManager.toggleGameDisplay(displayingGameId); }
  function isGameLoaded(){ return chartManager.getIsGameDisplaying(); }
  //------------------------------------------------


  //------------------------------------------------
  // finally, add call back to repaint charts
  chartManager.addRepaintCallback(repaint);
  chartManager.addResizeCallback(resize);
  //------------------------------------------------
};
