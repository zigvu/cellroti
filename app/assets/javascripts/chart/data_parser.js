/*------------------------------------------------
  Data Parser
  ------------------------------------------------*/
/*
// Data Hash structure
{
  brand_group_map: {:id => :name, },
  brand_group_data_keys: [
    :averager, :counter, :frame_time, :game_id, :det_group_id,
    :brand_effectiveness, :brand_group_crowding, :visual_saliency,
    :timing_effectiveness, :spatial_effectiveness, :detections_count,
    :view_duration, :q0, :q1, :q2, :q3, :q4, :q5, :q6, :q7, :q8
  ],
  game_events: {},
  ndx_data: [
    {
      :game_id,
      game_data: [array of values according to brand_group_data_keys],
      game_counters: [{:video_id, :begin_count, :end_count}, ]
    }, 
  ]
}
*/

// TODO: scope variables properly - currently many in global scope

function DataParser(seasonInfo, seasonData, chartManager){
  // set up
  var chartHelpers = chartManager.chartHelpers;

  // disaggregate seasonInfo - convert to hashes like below
  this.eventTypesInfo = seasonInfo["event_types"];
  // this.teamsInfo = seasonInfo["teams"];
  this.gamesInfo = seasonInfo["games"];
  this.subSeasonsInfo = seasonInfo["sub_season"];

  // create game id to name map
  var gameDataMap = {};
  this.gamesInfo.forEach(function (game) {
    gameDataMap[+game["id"]] = game["name"];
  });
  this.gameDataMap = gameDataMap;

  // disaggregate seasonData
  this.brandGroupMap = seasonData["brand_group_map"];
  var dataKeys = seasonData["brand_group_data_keys"];

  var gameDemarcations = [];
  var ndxData = [];

  var lastGameEndCount = 0;
  _.each(seasonData["ndx_data"], function(gData){
    var gameId = gData.game_id;

    // assume one and only 1 video in game
    var gameCounters = gData.game_counters;
    if (gameCounters.length === 0) { return; }

    var gameBeginCount = gameCounters[0].begin_count;
    var gameEndCount = gameCounters[0].end_count;

    lastGameEndCount += gameBeginCount;
    gameDemarcations.push({
      game_id: gameId,
      begin_count: lastGameEndCount,
      end_count: lastGameEndCount + gameEndCount
    });
    // ingest to ndxData
    _.each(gData.game_data, function(gDataBG){
      var coercedD;
      _.each(gDataBG.data, function(arr){
        coercedD = chartHelpers.coercer(dataKeys, arr);
        coercedD.counter += lastGameEndCount;
        ndxData.push(coercedD);
      });
    });
    // increment to the next counter
    lastGameEndCount += gameEndCount + 1;
  });
  this.gameDemarcations = gameDemarcations;
  this.ndxData = ndxData;

  // game specific
  var ndxMaxCounter = lastGameEndCount - 1;
  //ndxMaxCounter = _.max(this.ndxData, function(d){ return d.counter; }).counter;

  this.gameEvents = seasonData["game_events"];

  // add event bounds
  gameEventsWithBounds(this.gameEvents);
  function gameEventsWithBounds(gameEventsRaw){
    var allCounters = _.map(gameEventsRaw, function(ge){ return ge.counter; });
    allCounters.push(ndxMaxCounter);

    _.each(gameEventsRaw, function(ge, idx, list){
      ge['begin_count'] = allCounters[idx];
      ge['end_count'] = allCounters[idx + 1];
    });
  };

  // help GC by marking as null
  seasonData["ndx_data"] = null;
};
