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

  this.getBrushedFrameTime = function(beginCounter, endCounter){
    var that = this;
    var brushedTimes = [];
    var curGameId = this.ndxData[0].game_id;
    var beginTime = -1;
    var endTime = -1;
    _.each(this.ndxData, function(d, idx, list){
      // loop through only the first det_group_id and averager values
      // for the current game
      if(d.det_group_id !== that.ndxData[0].det_group_id){ return; }
      if(d.averager !== that.ndxData[0].averager){ return; }
      if(d.game_id !== that.ndxData[0].game_id){ return; }

      // if prior to beginCounter or after endCounter
      if((d.counter < beginCounter) || (d.counter > endCounter)){ return; }

      if((d.counter >= beginCounter) && (beginTime == -1)){ 
        beginTime = d.frame_time;
        return;
      }
      if(d.counter <= endCounter){ 
        endTime = d.frame_time;
        return;
      }
    });
    brushedTimes.push({game_id: curGameId, begin_time: beginTime, end_time: endTime});
    return brushedTimes;
  };
  //------------------------------------------------


};
