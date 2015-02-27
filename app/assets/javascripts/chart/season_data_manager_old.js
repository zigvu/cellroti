/*------------------------------------------------
  Season Data Manager
  ------------------------------------------------*/
/*
// SeasonData Hash structure
{
  brand_group_map: {:id => :name, },
  brand_group_data_keys: [
    :averager, :counter, :game_id, :det_group_id,
    :brand_effectiveness, :brand_group_crowding, :visual_saliency,
    :timing_effectiveness, :spatial_effectiveness, :detections_count,
    :view_duration, :q0, :q1, :q2, :q3, :q4, :q5, :q6, :q7, :q8
  ],
  game_demarcations: [{:game_id, :begin_count, :end_count}, ],
  game_events: [],
  ndx_data: [
    [array of values according to brand_group_data_keys],
  ]
}
*/

// TODO: scope variables properly - currently many in global scope

function SeasonDataManagerOld(seasonInfo, seasonData, chartManager){
  //------------------------------------------------
  // set up
  var chartHelpers = chartManager.chartHelpers;

  //------------------------------------------------
  // ingest data

  // disaggregate seasonInfo - convert to hashes like below
  var eventTypesInfo = seasonInfo["event_types"];
  // var teamsInfo = seasonInfo["teams"];
  var gamesInfo = seasonInfo["games"];
  var subSeasonsInfo = seasonInfo["sub_season"];

  // create game id to name map
  var gameDataMap = {};
  gamesInfo.forEach(function (game) {
    gameDataMap[+game["id"]] = game["name"];
  });

  // disaggregate seasonData
  var brandGroupMap = seasonData["brand_group_map"];
  var dataKeys = seasonData["brand_group_data_keys"];
  var gameDemarcations = seasonData["game_demarcations"];
  
  // coerce all numbers
  this.ndxData = _.map(seasonData["ndx_data"], function(arr){ 
    return chartHelpers.coercer(dataKeys, arr);
  });
  // help GC by marking as null
  seasonData["ndx_data"] = null;
  //------------------------------------------------


  //------------------------------------------------
  // add subseason information
  this.numOfGamesInSubSeasonChart = chartManager.numOfGamesInSubSeasonChart;
  addCountersToSubSeason(subSeasonsInfo);
  var subSeasonData = insertPlaceHolderInSubSeason(subSeasonsInfo, this.numOfGamesInSubSeasonChart);
  //------------------------------------------------


  //------------------------------------------------
  // common season/game/brand group information across charts
  var colorBrewer = d3.entries(colorbrewer);

  // color domain/range for sub seasons
  this.subSeasonIds = _.pluck(subSeasonData, 'subseason_id');
  var subSeasonColorsMap = _.map(subSeasonData, function(sd, idx){
    var numOfGames = sd.game_ids.length;
    var maxColorKey = parseInt(_.chain(colorBrewer[idx].value).keys().max().value());
    var minColorKey = parseInt(_.chain(colorBrewer[idx].value).keys().min().value());
    numOfGames = numOfGames > maxColorKey ? maxColorKey : numOfGames;
    numOfGames = numOfGames < minColorKey ? minColorKey : numOfGames;

    return {
      season_id: sd.subseason_id,
      color: _.last(colorBrewer[idx].value[numOfGames]),
      colorKey: colorBrewer[idx].key,
      game_ids: sd.game_ids,
      colorNum: numOfGames
    };
  });

  var subSeasonColors = d3.scale.ordinal()
    .domain(_.pluck(subSeasonColorsMap, 'season_id'))
    .range(_.pluck(subSeasonColorsMap, 'color'));
  this.getSubSeasonColor = function(subSeasonId){ return subSeasonColors(subSeasonId); };

  // color domain/range for game
  var gameIds = _.pluck(gameDemarcations, 'game_id');
  gameColorsMap = [];
  _.each(subSeasonColorsMap, function(sc){
    _.each(sc.game_ids, function(gId, idx){
      gColor = colorbrewer[sc.colorKey][sc.colorNum][idx];
      gameColorsMap.push({ game_id: gId, color: gColor });
    });
  });
  var gameColors = d3.scale.ordinal()
    .domain(_.pluck(gameColorsMap, 'game_id'))
    .range(_.pluck(gameColorsMap, 'color'));
  this.getGameName = function(gameId){ return gameDataMap[gameId]; };
  this.getGameColor = function(gameId){ return gameColors(gameId); };

  // color domain/range for brand group - sort based on name of brand group
  var brandGroupSorter = _.chain(brandGroupMap).pairs().sortBy(function(k){return k[1];}).value();
  this.brandGroupIdArr = _.map(brandGroupSorter, function(k){ return k[0];});
  this.brandGroupNameArr = _.map(brandGroupSorter, function(k){ return k[1];});
  
  var brandGroupColors = d3.scale.category10().domain(this.brandGroupIdArr);
  this.getBrandGroupName = function(bgId){ return brandGroupMap[bgId]; };
  this.getBrandGroupColor = function(bgId){ return brandGroupColors(bgId); };

  var gameEventsMap = new Object();
  _.each(eventTypesInfo, function(e){ gameEventsMap[e.id] = _.omit(e, 'id'); });
  var gameEventColors = d3.scale.ordinal().domain(_.keys(gameEventsMap)).range(colorbrewer.Set1["9"]);
  this.getGameEventName = function(geId){ return gameEventsMap[geId].name; }
  this.getGameEventColor = function(geId){ return gameEventColors(geId); }
  //------------------------------------------------


  //------------------------------------------------
  // brushed game data - used both in multi-line chart and game selection chart
  this.getBrushedGames = function(beginCounter, endCounter){
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

  this.getCounterForGame = function(gameId){
    gameD = _.findWhere(gameDemarcations, {game_id: gameId});
    return { begin_count: gameD.begin_count, end_count: gameD.end_count };
  };
  //------------------------------------------------


  //------------------------------------------------
  // sub season chart data  
  this.getSubSeasonData = function(){ return subSeasonData; };

  function addCountersToSubSeason(subSeasonInputData){
    _.each(subSeasonInputData, function(d){
      var beginCounters = _.map(d.game_ids, function(gId){ 
        return _.findWhere(gameDemarcations, {game_id: gId}).begin_count; 
      });
      var endCounters = _.map(d.game_ids, function(gId){ 
        return _.findWhere(gameDemarcations, {game_id: gId}).end_count;
      });
      d.begin_count = _.min(beginCounters);
      d.end_count = _.max(endCounters);
    });
  };

  // insert place holder data with negative subseason_id
  // in the middle of input subseason data
  function insertPlaceHolderInSubSeason(subSeasonInputData, numOfNewGames){
    var splitLeft = _.initial(subSeasonInputData, subSeasonInputData.length/2);
    var splitRight = _.last(subSeasonInputData, subSeasonInputData.length - splitLeft.length);
    var counterMiddle = _.last(splitLeft).end_count;
    var placeHolders = _.times(numOfNewGames, function(i){
      return {
        subseason_id: -1 * (i+1),
        subseason_name: '',
        game_ids: [],
        begin_count: counterMiddle,
        end_count: counterMiddle
      };
    });
    return _.union(splitLeft, placeHolders, splitRight);
  }
  //------------------------------------------------


  //------------------------------------------------
  // thumbnail chart data
  this.formatThumbnailChartData = function(tcData){
    var thumbnailData = new Object();
    _.each(chartHelpers.thumbnailModalIds, function(id, idx, obj){
      if(idx < tcData.length){
        thumbnailData[id] = tcData[idx];
      } else {
        thumbnailData[id] = {game_id: 0, frame_id: 0};
      }
    });
    return thumbnailData;
  };
  //------------------------------------------------


  //------------------------------------------------
  // table chart data
  this.formatTableChartData = function(tcData){
    var that = this;
    var tableData = _.map(tcData, function(tr){
      // note: this maps to chartHelpers.tableHeadLabels array
      return [
        chartHelpers.ellipsis(that.getGameName(tr[0]), 20, 1),
        chartHelpers.ellipsis(that.getBrandGroupName(tr[1]), 20, 1),
        tr[2],
        tr[3],
        d3.format(',%')(tr[4])
      ];
    });
    // fill in empty spaces if not enough data
    _.times(chartManager.numRowsInTableChart - tableData.length, function(i){
      tableData.push(_.map(chartHelpers.tableKeys, function(k){ return ""; }));
    });
    return tableData;
  };
  //------------------------------------------------


  //------------------------------------------------
  // summary panel time calculations
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

  this.getFrameTime = function(counter){ 
    var counterData = _.findWhere(this.ndxData, {counter: counter});
    return counterData === undefined ? -1 : counterData.frame_time;
  };
  //------------------------------------------------

};
