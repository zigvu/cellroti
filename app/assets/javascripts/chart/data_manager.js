/*------------------------------------------------
	Data Manager
	------------------------------------------------*/
/*
// seasonData Hash structure
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

function DataManager(seasonInfo, seasonData){
  this.seasonData = seasonData;

  // disaggregate seasonInfo - convert to hashes like below
  // var eventTypesInfo = seasonInfo["event_types"];
  // var teamsInfo = seasonInfo["teams"];
  // var gamesInfo = seasonInfo["games"];
  gameDataMap = {};
  seasonInfo["games"].forEach(function (game) {
    gameDataMap[+game["id"]] = game["name"];
  });

  // disaggregate seasonData
  brandGroupMap = seasonData["brand_group_map"];
  dataKeys = seasonData["brand_group_data_keys"];
  gameDemarcations = seasonData["game_demarcations"];
  
  // coerce all numbers
  this.ndxData = _.map(seasonData["ndx_data"], function(arr){ return coercer(arr); });
  // help GC by marking as null
  seasonData["ndx_data"] = null;


  // color domain/range for game
  var gameIds = _.pluck(gameDemarcations, 'game_id');
  var gameColors = d3.scale.category20().domain(gameIds);
  this.getGameName = function(gameId){ return gameDataMap[gameId]; };
  this.getGameColor = function(gameId){ return gameColors(gameId); };
  this.getBrushedGames = function(beginCounter, endCounter){
    var that = this;
    var bg = [];
    _.each(gameDemarcations, function(gd){
      // add games that are inside the range
      if((gd.begin_count >= beginCounter) && (gd.end_count <= endCounter)){ bg.push(gd); };
      // if some part of the game is before the beginCounter
      if((gd.begin_count < beginCounter) && (gd.end_count > beginCounter)){
        var newGd = _.clone(gd);
        newGd.begin_count = beginCounter; 
        bg.push(newGd);
      }
      // if some part of the game is after the endCounter
      if((gd.begin_count < endCounter) && (gd.end_count > endCounter)){
        var newGd = _.clone(gd);
        newGd.end_count = endCounter;
        bg.push(newGd);
      }
    });
    return bg;
  };

  // color domain/range for brand group - sort based on name of brand group
  var brandGroupSorter = _.chain(brandGroupMap).pairs().sortBy(function(k){return k[1];}).value();
  this.brandGroupIdArr = _.map(brandGroupSorter, function(k){ return k[0];});
  this.brandGroupNameArr = _.map(brandGroupSorter, function(k){ return k[1];});
  
  var brandGroupColors = d3.scale.category10().domain(this.brandGroupIdArr);
  this.getBrandGroupName = function(bgId){ return brandGroupMap[bgId]; };
  this.getBrandGroupColor = function(bgId){ return brandGroupColors(bgId); };


  // component bar chart labels
  var componentBarChartLabels = {
    'brand_group_crowding': 'Brand Group Crowding',
    'visual_saliency': 'Visual Saliency',
    'timing_effectiveness': 'Timing Effectiveness',
    'spatial_effectiveness': 'Spatial Effectiveness'    
  };
  this.getComponentBarChartLabel = function(compKey){ return componentBarChartLabels[compKey]; };

  // coerce to number
  function coercer(arr){
    var d = new Object();
    dataKeys.forEach(function(k, i, list){ 
      d[k] = +arr[i];
    });
    return d;
  };


};
