/*------------------------------------------------
	Season Data Manager
	------------------------------------------------*/
/*
// GameData Hash structure - For now, identical to SeasonData Hash structure
// except for game_events
{
  brand_group_map: [{:id => :name}, ],
  brand_group_data_keys: [
    :averager, :counter, :game_id, :det_group_id,
    :brand_effectiveness, :brand_group_crowding, :visual_saliency,
    :timing_effectiveness, :spatial_effectiveness, :detections_count,
    :view_duration, :q0, :q1, :q2, :q3, :q4, :q5, :q6, :q7, :q8
  ],
  game_demarcations: [{:begin_count, :end_count}, ],
  game_events: [:game_id , :events [{:counter, :event_id}]],
  ndx_data: [
    [array of values according to brand_group_data_keys],
  ]
}
*/

// TODO: scope variables properly - currently many in global scope

function GameDataManager(gameInfo, gameData, chartManager){
  //------------------------------------------------
  // set up
  var chartHelpers = chartManager.chartHelpers;

  //------------------------------------------------
  // ingest data

  // disaggregate gameData
  var dataKeys = gameData["brand_group_data_keys"];
  gameEvents = gameData["game_events"][0]["events"];
  
  // coerce all numbers
  this.ndxData = _.map(gameData["ndx_data"], function(arr){ 
    return chartHelpers.coercer(dataKeys, arr);
  });
  var ndxMaxCounter = _.max(this.ndxData, function(d){ return d.counter; }).counter;
  // help GC by marking as null
  gameData["ndx_data"] = null;
  //------------------------------------------------


  //------------------------------------------------
  // game events
  // add event bounds
  gameEventsWithBounds(gameEvents);
  
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

  function gameEventsWithBounds(gameEventsRaw){
    var allCounters = _.map(gameEventsRaw, function(ge){ return ge.counter; });
    allCounters.push(ndxMaxCounter);

    _.each(gameEventsRaw, function(ge, idx, list){
      ge['begin_count'] = allCounters[idx];
      ge['end_count'] = allCounters[idx + 1];
    });
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
