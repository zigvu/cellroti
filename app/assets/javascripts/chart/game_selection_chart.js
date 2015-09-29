/*------------------------------------------------
	Brush chart
	------------------------------------------------*/

function GameSelectionChart(chartManager){
  //------------------------------------------------
  // set up
  var chartHelpers = chartManager.chartHelpers;

  var pxSpaceForOneChar; // cache px mapper for game background label length computation
  var isGameInfoShowing = false; // true if game is currently showing
  var selectedGameId;

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
  var margin = {top: 1, right: 1, bottom: 1, left: 50};
  var width, height;

  var seasonLabelsAddPosX = 5;
  var seasonLabelsAddPosY = 5;
  var lulButtonWidthSmallerBy = 12;
  var lulButtonWidth = 60;
  var lulButtonHeightSmallerBy = 6;
  var lulButtonHeight;

  function setGeometry(){
    width = divWidth - margin.left - margin.right;
    height = divHeight - margin.top - margin.bottom;

    lulButtonHeight = height - lulButtonHeightSmallerBy;
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
  // mode setting
  this.setSeasonMode = function(){
    // hide reset button
    lulButton.select("text").text("LOAD");
    lulButton.select("title").text("Load Game");
    lulButton.select("rect").classed("reset", false);

    // make rest of chart clickable
    d3.select("#blocking-rect").style("display", "none");
    d3.select("#blocking-text").style("display", "none");
  };

  this.setGameMode = function(){
    // change load to reset
    lulButton.select("text").text("RESET");
    lulButton.select("title").text("Reset");
    lulButton.select("rect").classed("reset", true);

    // make rest of chart unclickable
    d3.select("#blocking-rect").style("display", null);
    d3.select("#blocking-text").style("display", null);
  };
  //------------------------------------------------


  //------------------------------------------------
  // start drawing
  var svg = d3.select(bc_gameSelection_div).append("svg")
      .attr("width", divWidth)
      .attr("height", divHeight);

  var gameSelectionSVG = svg.append("g")
      .attr("class", "game-selection-chart")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  // button to load/reset data
  var lulButton = gameSelectionSVG
    .append("g")
      .attr("class", "load-reset-button")
      .attr("x", 0)
      .attr("y", 0)
      .attr("transform", "translate(" + lulButtonWidth 
        + "," + lulButtonHeightSmallerBy/2 + ")");

  var lulButtonRect = lulButton.append("rect")
      .attr("width", lulButtonWidth)
      .attr("height", lulButtonHeight)
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("x", 0)
      .attr("y", 0)
      .on("click", handleClickGameLoadButton);
  lulButtonRect.append("svg:title").text("Load game");

  var lulButtonText = lulButton.append("text")
        .attr("x", seasonLabelsAddPosX)
        .attr("y", height/2 + lulButtonHeightSmallerBy/2 - 1)
        .text("LOAD");

  // draw rects for season
  var backgroundRect = gameSelectionSVG
    .append("rect")
      .attr("class", "background-rect")
      .attr("width", width)
      .attr("x", 0)
      .attr("y", 0)
      .attr("height", height);
  //------------------------------------------------


  //------------------------------------------------
  // define domains
  x.domain([
    d3.min(subSeasonData, function(d) { return d.begin_count; }),
    d3.max(subSeasonData, function(d) { return d.end_count; })
  ]);
  y.domain([0, 1]);
  //------------------------------------------------


  //------------------------------------------------
  // draw bars
  var subSeasonRects = gameSelectionSVG.selectAll(".bar")
      .data(subSeasonData, function(d){ return d.id; });

  subSeasonRects.enter()
      .append("rect")
      .attr("class", "bar")
      .attr("id", function(d){ return getSelectionId(d); })
      .attr("width", function(d) { return x(d.end_count) - x(d.begin_count); })
      .attr("x", function(d) { return x(d.begin_count); })
      .attr("y", 1)
      .attr("height", height - 1)
      .on("click", handleClickSubSeason)
      .style("fill", function(d) { return getColor(d); });

  subSeasonRects.append("svg:title").text(function (d) { return getModifiedTitle(d); });

  // draw background labels
  var gameLabels = gameSelectionSVG.selectAll(".seasonLabel")
      .data(subSeasonData, function(d){ return d.id; });

  gameLabels.enter()
      .append("text")
      .attr("class", "seasonLabel")
      .attr("x", function(d) { return x(d.begin_count) + seasonLabelsAddPosX; })
      .attr("y", height/2 + seasonLabelsAddPosY)
      .text(function (d) { 
        return getModifiedLabel(d.name, x(d.end_count) - x(d.begin_count));
      });

  // draw rect to disable clicking on any labels during game data display
  var blockingRect = gameSelectionSVG
    .append("rect")
      .attr("id", "blocking-rect")
      .style("display", "none")
      .attr("width", width + 2)
      .attr("x", -1)
      .attr("y", -1)
      .attr("height", height + 2);

  var blockingText = gameSelectionSVG
    .append("text")
      .attr("id", "blocking-text")
      .style("display", "none")
      .attr("x", 20)
      .attr("y", height/2 + seasonLabelsAddPosY)
      .text("Click reset to go back to season data");

  //------------------------------------------------


  //------------------------------------------------
  // repaint due to brush update callback
  function repaint(){
    if(!chartManager.getIsGameDisplaying()){
      var gameData = chartManager.getBrushedGames();
      var gameIds = _.pluck(gameData, 'game_id');
      if(gameIds.length > 0 && gameIds.length <= chartManager.numOfGamesInSubSeasonChart){
        addGameInfo(gameIds);
      } else {
        resetGameInfo();
      }
    }
  };

  // redraw with modified data
  function redrawSeasons(newData){
    subSeasonRects.data(newData, function(d){ return d.id; });
    subSeasonRects
      .transition()
        .delay(function(d, i) { return getRedrawDelay(d, i); })
        .duration(750)
        .attr("width", function(d) { return x(d.end_count) - x(d.begin_count); })
        .attr("x", function(d) { return x(d.begin_count); })
        .style("fill", function(d) { return getColor(d); });

    subSeasonRects.select("title").text(function (d) { return getModifiedTitle(d); });

    gameLabels.data(newData, function(d){ return d.id; });
    gameLabels
      .transition()
        .delay(function(d, i) { return getRedrawDelay(d, i) + 100; })
        .duration(750)
        .attr("x", function(d) { return x(d.begin_count) + seasonLabelsAddPosX; })
        .attr("y", height/2 + seasonLabelsAddPosY)
        .text(function (d) { 
          return getModifiedLabel(d.name, x(d.end_count) - x(d.begin_count));
        });
  };

  // custom delay when easing in/out the rects
  function getRedrawDelay(d, i){
    var delay;
    if(isGameInfoShowing){ delay = d.id < 0 ? 500 : 100; }
    if(!isGameInfoShowing){ delay = d.id < 0 ? 100 : 500; }
    return delay;
  }
  //------------------------------------------------


  //------------------------------------------------
  // handle click events
  function addGameInfo(gameIds){
    isGameInfoShowing = true;
    redrawSeasons(getClonedSubSeasonData(gameIds));
  };

  function resetGameInfo(){
    isGameInfoShowing = false;
    d3.selectAll(".selected").classed("selected", false);

    redrawSeasons(subSeasonData);
    hideGameLoadButton();
  };

  function handleClickSubSeason(d){
    if(d.id > 0){
      // trigger event on brush chart, which will call repaint
      // which will in turn take care of resetting game info
      if(isGameInfoShowing){
        chartManager.brushReset();
      } else {
        chartManager.brushSet(d.begin_count, d.end_count);
      }
    } else {
      selectedGameId = d.game_ids[0];
      showGameLoadButton();
      // change color of clicked game
      d3.selectAll(".selected").classed("selected", false);
      d3.select("#" + getSelectionId(d)).classed("selected", true);
    }
  };

  this.loadGameSimulate = function(gameId){
    showGameLoadButton();
  };


  // show/hide load button
  function showGameLoadButton(){
    lulButton.transition().duration(750)
      .attr("transform", "translate(-" + (lulButtonWidth - lulButtonWidthSmallerBy)  
        + "," + lulButtonHeightSmallerBy/2 + ")");
  };

  function hideGameLoadButton(){
    lulButton.transition().duration(750)
      .attr("transform", "translate(" + lulButtonWidth 
        + "," + lulButtonHeightSmallerBy/2 + ")");
  };

  function handleClickGameLoadButton(){ chartManager.toggleGameDisplay(selectedGameId) };
  //------------------------------------------------



  //------------------------------------------------
  // update with game level information
  function getClonedSubSeasonData(inputGameIds){
    var gameIds = _.uniq(inputGameIds);
    // when adding new game labels, squeeze existing
    // season level rects into 80% area
    var squeezedWidth = width * 0.2 / (subSeasonData.length - chartManager.numOfGamesInSubSeasonChart);
    var squeezedWidthCounter = x.invert(squeezedWidth) - x.invert(0);
    var clonedSubSeasonData = _.map(subSeasonData, function(d, idx, list){ return _.clone(d); });

    // any subseason before games are to the left
    var beginL = x.invert(0),
        endL = beginL + squeezedWidthCounter;
    _.find(clonedSubSeasonData, function(d){
        if(d.id < 0){ return true; } // break
        d.begin_count = beginL;
        d.end_count = endL;
        beginL = endL;
        endL = beginL + squeezedWidthCounter;
        return false;
    });

    // any subseason after games are to the right
    clonedSubSeasonData.reverse(); // reverse to loop from back
    var endR = x.invert(width),
        beginR = endR - squeezedWidthCounter;
    _.find(clonedSubSeasonData, function(d){
        if(d.id < 0){ return true; } // break
        d.begin_count = beginR;
        d.end_count = endR;
        endR = beginR;
        beginR = endR - squeezedWidthCounter;
        return false;
    });
    clonedSubSeasonData.reverse(); // reverse back to original

    // now, those in the middle are games
    var gWidthCounter = (endR - beginL)/_.min([chartManager.numOfGamesInSubSeasonChart, gameIds.length]);
    var gameLabelCount = 0;
    _.each(clonedSubSeasonData, function(d){
      if(d.id < 0){
        if(gameLabelCount < gameIds.length){
          d.begin_count = beginL;
          d.end_count = beginL + gWidthCounter;
          beginL += gWidthCounter;
        } else {
          d.begin_count = beginL;
          d.end_count = beginL;
        }
        gameLabelCount++;
      }
    });

    // add names of games
    _.each(gameIds, function(gId, idx, list){
      var selD = _.find(clonedSubSeasonData, function(d){ return d.id == (-1 * (idx + 1)); });
      if(selD !== undefined){
        selD.name = chartManager.getGameName(gId);
        selD.game_ids = [gId];
      }
    });

    return clonedSubSeasonData;
  };
  //------------------------------------------------


  //------------------------------------------------
  // colors, labels and titles

  function getSelectionId(d){ return "sid_" + d.id; };

  function getColor(d){
    var color;
    if(d.id > 0){
      color = chartManager.getSubSeasonColor(d.id);
    } else {
      color = chartManager.getGameColor(d.game_ids[0]);
    }
    return color;
  };


  function getModifiedTitle(d){
    var title;
    if(d.id > 0){
      title = isGameInfoShowing ? "Reset to season view" : d.name;
    } else {
      title = "Click to load game '" + d.name + "'";
    }
    return title;
  };

  // get modified text for season label based on width
  function getModifiedLabel(label, pxContainerLength){
    if (pxSpaceForOneChar === undefined){
      pxSpaceForOneChar = chartHelpers.getPxSpaceForOneChar(gameSelectionSVG, "game-selection-chart");
    }
    return chartHelpers.ellipsis(label, pxContainerLength, pxSpaceForOneChar);
  };
  //------------------------------------------------


  //------------------------------------------------
  // finally, add call back to repaint charts
  chartManager.addRepaintCallback(repaint);
  //------------------------------------------------
};
