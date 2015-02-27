/*------------------------------------------------
	Game Data Manager
	------------------------------------------------*/
  
function GameDataManager(dataParser, chartManager){
  //------------------------------------------------
  // set up
  var chartHelpers = chartManager.chartHelpers;

  //------------------------------------------------
  // ingest data
  var gameEvents = dataParser.gameEvents;
  this.ndxData = dataParser.ndxData;

  //------------------------------------------------


  //------------------------------------------------
  // game events
  
  // brushed game events
  this.getBrushedEvents = function(beginCounter, endCounter){
    var that = this;
    var be = [];
    _.each(gameEvents, function(ge){
      // add events that are inside the range - note the double
      // `counter` in the formula
      if((ge.counter >= beginCounter) && (ge.counter < endCounter)){ be.push(ge); };
    });
    return be;
  };

  //------------------------------------------------


  //------------------------------------------------
  // summary panel time calculations

  // IMPORTANT NOTE: this is identical to what is in season data manager;
  // to change any thing in this function, do so in season data manager first
  this.getBrushedFrameTime = function(beginCounter, endCounter){
    var that = this;
    var brushedTimes = [];
    var curGameId, beginTime, endTime;
    _.each(this.ndxData, function(d, idx, list){
      // loop through only the first det_group_id and averager values
      if(d.det_group_id !== that.ndxData[0].det_group_id){ return; }
      if(d.averager !== that.ndxData[0].averager){ return; }

      // if prior to beginCounter or after endCounter
      if((d.counter < beginCounter) || (d.counter > endCounter)){ return; }

      // if at beginCounter
      if(d.counter == beginCounter){
        curGameId = d.game_id;
        beginTime = d.frame_time;
        return;
      }
      // if in same game, update end time
      if(d.game_id == curGameId){
        endTime = d.frame_time;
      } else {
        // need at least two data points
        if(endTime !== undefined){
          brushedTimes.push({game_id: curGameId, begin_time: beginTime, end_time: endTime});
        }
        curGameId = d.game_id;
        beginTime = d.frame_time;
        endTime = undefined;
      }
    });
    if ((curGameId !== undefined) && (endTime !== undefined)){
      brushedTimes.push({game_id: curGameId, begin_time: beginTime, end_time: endTime});
    }
    return brushedTimes;
  };
  //------------------------------------------------


};
