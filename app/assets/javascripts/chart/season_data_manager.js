/*------------------------------------------------
  Season Data Manager
  ------------------------------------------------*/

// TODO: scope variables properly - currently many in global scope

function SeasonDataManager(dataParser, chartManager){
  var self = this;

  //------------------------------------------------
  // set up
  var chartHelpers = chartManager.chartHelpers;
  //------------------------------------------------
  // ingest data

  var eventTypesInfo = dataParser.eventTypesInfo;
  var gamesInfo = dataParser.gamesInfo;
  var subSeasonsInfo = dataParser.subSeasonsInfo;

  var gameDataMap = dataParser.gameDataMap;
  var brandGroupMap = dataParser.brandGroupMap;

  var gameDemarcations = dataParser.gameDemarcations;
  this.ndxData = dataParser.ndxData;

  //------------------------------------------------


  //------------------------------------------------
  // add subseason information

  // add counters to game
  var subSeasonData = addCountersToSubSeason(subSeasonsInfo)
  subSeasonData = addGameHeirarchy(subSeasonsInfo);
  //------------------------------------------------


  //------------------------------------------------
  // common season/game/brand group information across charts
  var colorBrewer = d3.entries(colorbrewer);

  // color domain/range for sub seasons
  this.subSeasonIds = _.pluck(subSeasonData, 'id');
  var subSeasonColorsMap = _.map(subSeasonData, function(sd, idx){
    var numOfGames = sd.game_ids.length;
    var maxColorKey = parseInt(_.chain(colorBrewer[idx].value).keys().max().value());
    var minColorKey = parseInt(_.chain(colorBrewer[idx].value).keys().min().value());
    numOfGames = numOfGames > maxColorKey ? maxColorKey : numOfGames;
    numOfGames = numOfGames < minColorKey ? minColorKey : numOfGames;

    return {
      id: sd.id,
      color: _.last(colorBrewer[idx].value[numOfGames]),
      colorKey: colorBrewer[idx].key,
      game_ids: sd.game_ids,
      colorNum: numOfGames
    };
  });

  var subSeasonColors = d3.scale.ordinal()
    .domain(_.pluck(subSeasonColorsMap, 'id'))
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
  this.getGameName = function(gameId){ return gameDataMap[gameId]["name"]; };
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
      // NOTE: need to return after each push in array to avoid double counting
      // add games that are inside the range
      if((gd.begin_count >= beginCounter) && (gd.end_count <= endCounter)){ 
        // only consider non-empty games
        if(gd.begin_count < gd.end_count){ bg.push(gd); }
        return;
      };
      
      var timeRatio = (gd.end_time - gd.begin_time)/(gd.end_count - gd.begin_count);
      // if some part of the game is before the beginCounter
      if((gd.begin_count < beginCounter) && (gd.end_count > beginCounter)){
        var newGd = _.clone(gd);
        newGd.begin_count = beginCounter; 
        newGd.begin_time = gd.end_time - (gd.end_count - newGd.begin_count) * timeRatio;
        bg.push(newGd);
        return;
      }
      // if some part of the game is after the endCounter
      if((gd.begin_count < endCounter) && (gd.end_count > endCounter)){
        var newGd = _.clone(gd);
        newGd.end_count = endCounter;
        newGd.end_time = gd.begin_time + (newGd.end_count - gd.begin_count) * timeRatio;
        bg.push(newGd);
        return;
      }
    });
    return bg;
  };

  this.getCounterForGame = function(gameId){
    var gameD = _.findWhere(gameDemarcations, {game_id: gameId});
    return { begin_count: gameD.begin_count, end_count: gameD.end_count };
  };
  //------------------------------------------------


  //------------------------------------------------
  // game selection chart data  
  this.getSubSeasonData = function(){ 
    return getNonEmptySubSeasonData(subSeasonData);
  };

  function getNonEmptySubSeasonData(subSeasonInputData){
    var nonEmptySubSeasons = [];
    _.each(subSeasonInputData, function(sd){
      if(sd.nonempty_games.length > 0){
        // clone data
        var clonedSd = {};
        clonedSd.begin_count = sd.begin_count;
        clonedSd.end_count = sd.end_count;
        clonedSd.id = sd.id;
        clonedSd.name = sd.name;
        clonedSd.games = _.clone(sd.nonempty_games);
        nonEmptySubSeasons.push(clonedSd);
      }
    });
    // add reset boxes
    if(nonEmptySubSeasons.length > 0){
      var sd = { begin_count: 0, end_count: 0, name: "Reset" };

      var clonedSd = _.clone(sd);
      clonedSd.id = -1;
      clonedSd.games = [];
      nonEmptySubSeasons.push(clonedSd);

      clonedSd = _.clone(sd);
      clonedSd.id = -2;
      clonedSd.games = [];
      nonEmptySubSeasons.push(clonedSd);
    }
    return nonEmptySubSeasons;
  };

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

    return subSeasonInputData;
  };

  function addGameHeirarchy(subSeasonInputData){
    // consider only non empty games
    var nonEmptyGames = [];
    _.each(gameDemarcations, function(gd){
      if(gd.begin_count < gd.end_count){ nonEmptyGames.push(gd); }
    });

    // consider only sub-seasons that have games
    var nonEmptySubSeasons = [];
    _.each(subSeasonInputData, function(sd){
      var games = [];
      _.each(nonEmptyGames, function(gd){
        if(_.contains(sd.game_ids, gd.game_id)){
          gd.season_id = sd.id;
          games.push(gd);
        }
      });
      sd.nonempty_games = games;
    });

    return subSeasonInputData;
  };
  //------------------------------------------------


  //------------------------------------------------
  // thumbnail chart data
  this.formatThumbnailChartData = function(tcData){
    var that = this;

    var thumbnailData = new Object();
    _.each(chartHelpers.thumbnailModalIds, function(id, idx, obj){
      if(idx < tcData.length){
        thumbnailData[id] = tcData[idx];
        thumbnailData[id]['video_id'] = that.getVideoForGame(tcData[idx].game_id);
      } else {
        thumbnailData[id] = {
          game_id: 0,
          video_id: 0,
          extracted_frame_number: 0,
          frame_time: 0,
          brand_effectiveness: 0
        };
      }
    });
    return thumbnailData;
  };

  // assume only 1 video per game
  this.getVideoForGame = function(gameId){
    var gameD = _.findWhere(gameDemarcations, {game_id: gameId});
    return gameD.video_id;
  };
  //------------------------------------------------


  //------------------------------------------------
  // time calculations
  this.getBrushedFrameTime = function(beginCounter, endCounter){
    //  brushed games also includes time information
    return this.getBrushedGames(beginCounter, endCounter);
  };
  //------------------------------------------------

};
