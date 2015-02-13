/*------------------------------------------------
	Season Data Manager
	------------------------------------------------*/
/*
// GameData Hash structure - For now, identical to SeasonData Hash structure
{
  brand_group_map: [{:id => :name}, ],
  brand_group_data_keys: [
    :averager, :counter, :game_id, :det_group_id,
    :brand_effectiveness, :brand_group_crowding, :visual_saliency,
    :timing_effectiveness, :spatial_effectiveness, :detections_count,
    :view_duration, :q0, :q1, :q2, :q3, :q4, :q5, :q6, :q7, :q8
  ],
  game_demarcations: [{begin_count:, end_count:}, ],
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
  
  // coerce all numbers
  this.ndxData = _.map(gameData["ndx_data"], function(arr){ 
    return chartHelpers.coercer(dataKeys, arr);
  });
  // help GC by marking as null
  gameData["ndx_data"] = null;
  //------------------------------------------------


};
