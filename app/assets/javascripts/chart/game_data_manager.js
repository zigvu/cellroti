/*------------------------------------------------
	Game Data Manager
	------------------------------------------------*/
  
function GameDataManager(dataParser, chartManager){
  var self = this;

  //------------------------------------------------
  // set up
  var chartHelpers = chartManager.chartHelpers;

  //------------------------------------------------
  // ingest data
  var gameEvents = dataParser.gameEvents;
  var gameDemarcations = dataParser.gameDemarcations;
  // accessed from outside
  this.ndxData = dataParser.ndxData;
  //------------------------------------------------


  //------------------------------------------------
  // game events

  // there is only 1 game in game events
  var firstGameEvent;
  for(var key in gameEvents){
    firstGameEvent = gameEvents[key];
    break; 
  }
  
  // brushed game events
  this.getBrushedEvents = function(beginCounter, endCounter){
    var that = this;
    var be = [];
    _.each(firstGameEvent, function(ge){
      // add events that are inside the range - note the double
      // `counter` in the formula
      if((ge.counter >= beginCounter) && (ge.counter < endCounter)){ be.push(ge); };
    });
    return be;
  };

  // there is only 1 game in game demarcations
  var gd = gameDemarcations[0];
  var timeRatio = (gd.end_time - gd.begin_time)/(gd.end_count - gd.begin_count);

  this.getBrushedGames = function(beginCounter, endCounter){
    var bg = [];
    if((gd.begin_count >= beginCounter) && (gd.end_count <= endCounter)){ 
      bg.push(gd);
    } else {
      var newGd = _.clone(gd);
      newGd.begin_count = beginCounter; 
      newGd.end_count = endCounter;
      newGd.begin_time = gd.begin_time + (newGd.begin_count - gd.begin_count) * timeRatio;
      newGd.end_time = gd.end_time - (gd.end_count - newGd.end_count) * timeRatio;

      bg.push(newGd);
    }
    return bg;
  };
  //------------------------------------------------

  //------------------------------------------------
  // time calculations
  this.getBrushedFrameTime = function(beginCounter, endCounter){
    //  brushed games also includes time information
    var brushedGames = self.getBrushedGames(beginCounter, endCounter);
    var totalTime = _.reduce(brushedGames, function(total, d){ 
      return total + d.end_time - d.begin_time; }, 
    0);
    return totalTime;
  };
  //------------------------------------------------

};
