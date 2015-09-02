/*------------------------------------------------
  Data Parser
  ------------------------------------------------*/
/*
// Data Hash structure

seasonInfo: {
  :id, :name, :league, :sport, 
  event_types: [{:id, :name, :description}, ],
  teams: [{:id, :name}, ],
  games: [
    { :id, :name, teams: [integer, ], :start_date, :venue_city, :venue_stadium,
      sequence_counters: [{:video_id, :begin_count, :end_count, :begin_time, :end_time}, ]
    }, 
  ],
  sub_seasons: [{:id, :name, game_ids: [integer, ]}, ]
}

seasonData: {
  brand_group_data_keys: [
    :averager, :counter, :frame_time, :game_id, :det_group_id,
    :brand_effectiveness, :brand_group_crowding, :visual_saliency,
    :timing_effectiveness, :spatial_effectiveness, :detections_count,
    :view_duration, :q0, :q1, :q2, :q3, :q4, :q5, :q6, :q7, :q8
  ],
  game_events: {game_id: [{:counter, :time, :event_type_id}, ], },
  brand_group_map: {id: :name, },
  ndx_data: [
    { game_id: :game_id,
      game_data: [array of values according to brand_group_data_keys]
    }, 
  ]
}
*/

// TODO: scope variables properly - currently many in global scope

function DataParser(seasonInfo, seasonData, chartManager){
  var self = this;

  // set up
  var chartHelpers = chartManager.chartHelpers;

  // disaggregate seasonInfo - convert to hashes like below
  this.eventTypesInfo = seasonInfo["event_types"];
  // this.teamsInfo = seasonInfo["teams"];
  this.gamesInfo = seasonInfo["games"];
  this.subSeasonsInfo = seasonInfo["sub_seasons"];

  // create game id to values map
  this.gameDataMap = {};
  this.gamesInfo.forEach(function (game) {
    self.gameDataMap[+game["id"]] = game;
  });

  // disaggregate seasonData
  this.brandGroupMap = seasonData["brand_group_map"];
  var dataKeys = seasonData["brand_group_data_keys"];
  this.gameEvents = seasonData["game_events"];

  this.gameDemarcations = [];
  this.ndxData = [];

  var lastGameEndCount = 0;
  _.each(seasonData["ndx_data"], function(gData){
    var gameId = gData.game_id;

    // assume one and only 1 video in game
    var gameCounters = self.gameDataMap[gameId]["sequence_counters"];
    if (gameCounters.length === 0) { return; }

    var videoId = gameCounters[0].video_id;
    var gameBeginCount = gameCounters[0].begin_count;
    var gameEndCount = gameCounters[0].end_count;
    var beginTime = gameCounters[0].begin_time;
    var endTime = gameCounters[0].end_time;

    lastGameEndCount += gameBeginCount;
    self.gameDemarcations.push({
      video_id: videoId,
      game_id: gameId,
      begin_count: lastGameEndCount,
      end_count: lastGameEndCount + gameEndCount,
      begin_time: beginTime,
      end_time: endTime
    });
    // ingest to ndxData
    _.each(gData.game_data, function(gDataBG){
      var coercedD;
      _.each(gDataBG.data, function(arr){
        coercedD = chartHelpers.coercer(dataKeys, arr);
        coercedD.counter += lastGameEndCount;
        self.ndxData.push(coercedD);
      });
    });
    // increment to the next counter
    lastGameEndCount += gameEndCount + 1;

    // add event bounds
    if(self.gameEvents[gameId] !== undefined){
      var allCounters = _.map(self.gameEvents[gameId], function(ge){ return ge.counter; });
      allCounters.push(lastGameEndCount - 1);

      _.each(self.gameEvents[gameId], function(ge, idx, list){
        ge['begin_count'] = allCounters[idx];
        ge['end_count'] = allCounters[idx + 1];
      });      
    }
  });

  // help GC by marking as null
  seasonData["ndx_data"] = null;
};
