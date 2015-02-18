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
  var gameEvents = gameData["game_events"][0]["events"];
  
  // coerce all numbers
  this.ndxData = _.map(gameData["ndx_data"], function(arr){ 
    return chartHelpers.coercer(dataKeys, arr);
  });
  var lastEndCounter = this.ndxData[this.ndxData.length - 1].counter;
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
    allCounters.push(lastEndCounter);

    _.each(gameEventsRaw, function(ge, idx, list){
      ge['begin_count'] = allCounters[idx];
      ge['end_count'] = allCounters[idx + 1];
    });
  };
  //------------------------------------------------

};
