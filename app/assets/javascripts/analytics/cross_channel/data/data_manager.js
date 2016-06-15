/*------------------------------------------------
  Data Manager - Mock for now
  ------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.CrossChannel = ZIGVU.Analytics.CrossChannel || {};
ZIGVU.Analytics.CrossChannel.Data = ZIGVU.Analytics.CrossChannel.Data || {};

ZIGVU.Analytics.CrossChannel.Data.DataManager = function(){
  var self = this;

  //------------------------------------------------
  // set up
  this.chartHelpers = undefined;

  // general brand group
  var brandGroupMap = {1: "Other Sports Drink", 2: "Powerade", 3: "Gatorade"};
  var brandGroupSorter = _.chain(brandGroupMap).pairs().sortBy(function(k){return k[1];}).value();
  var brandGroupIds = _.map(brandGroupSorter, function(k){ return k[0];});
  var brandGroupColors = d3.scale.category10().domain(brandGroupIds);
  this.getBrandGroupIds = function(){ return brandGroupIds; };
  this.getBrandGroupName = function(bgId){ return brandGroupMap[bgId]; };
  this.getBrandGroupColor = function(bgId){ return brandGroupColors(bgId); };

  var sportMap = {1: "Soccer", 2: "Baseball", 3: "Golf", 4: "Nascar"};
  var sportSorter = _.chain(sportMap).pairs().sortBy(function(k){return k[1];}).value();
  var sportIds = _.map(sportSorter, function(k){ return k[0];});
  this.getSportIds = function(){ return sportIds; };
  this.getSportName = function(sportId){ return sportMap[sportId]; };

  var channelMap = {1: "ESPN", 2: "Fox Sports 1", 3: "MLB.com", 4: "Youtube Sport 1K"};
  var channelSorter = _.chain(channelMap).pairs().sortBy(function(k){return k[1];}).value();
  var channelIds = _.map(channelSorter, function(k){ return k[0];});
  this.getChannelIds = function(){ return channelIds; };
  this.getChannelName = function(channelId){ return channelMap[channelId]; };

  var brandGroupChannelColors = {};
  var brightnessStep = 0.2;
  _.each(brandGroupIds, function(bgId){
    var brandColor = self.getBrandGroupColor(bgId);
    var currentBrightness = 0;
    _.each(channelIds, function(channelId){
      brandGroupChannelColors[bgId] = brandGroupChannelColors[bgId] || {};
      brandGroupChannelColors[bgId][channelId] = d3.hsl(brandColor).brighter(currentBrightness);
      currentBrightness += brightnessStep;
    });
  });
  this.getBrandGroupChannelColor = function(bgId, channelId){
    return brandGroupChannelColors[bgId][channelId];
  };

  var dummyData;
  this.getDummyData = function(){
    var durationOfAnalysis = 24 * 60 * 60 * 1000; // 24 hours

    dummyData = [];
    var channelIds = self.getChannelIds();
    _.each(channelIds, function(channelId){
      var channelData = [];
      var sportIds = self.getSportIds();
      _.each(sportIds, function(sportId){
        var sportData = [];
        var bgIds = self.getBrandGroupIds();
        _.each(bgIds, function(bgId){
          var mediaLength = rand(0.8, 1.1) * durationOfAnalysis / (sportIds.length * bgIds.length);
          var viewDuration = mediaLength * rand(0.005, 0.1);
          var viewPersistence = rand(0.8, 1.1) * 10 * 1000; // around 10 seconds
          var avgBE = rand(0.01, 0.99);
          var tvSpot = viewDuration * avgBE;

          sportData.push({
            bgId: bgId,
            mediaLength: mediaLength,
            viewDuration: viewDuration,
            viewPersistence: viewPersistence,
            avgBE: avgBE,
            tvSpot: tvSpot
          });
        });
        channelData.push({sportId: sportId, sportData: sportData});
      });
      dummyData.push({channelId: channelId, channelData: channelData});
    });
    return dummyData;
  };
  this.updateDummyData = function(){
    var perChange = 0.1;
    _.each(dummyData, function(channelD){
      _.each(channelD.channelData, function(sportD){
        _.each(sportD.sportData, function(bgD){
          bgD.mediaLength += bgD.mediaLength * randSign() * rand(0.0, perChange);
          bgD.viewDuration += bgD.viewDuration * randSign() * rand(0.0, perChange);
          bgD.viewPersistence += bgD.viewPersistence * randSign() * rand(0.0, perChange);
          bgD.avgBE += bgD.avgBE * randSign() * rand(0.0, perChange);
          bgD.tvSpot = bgD.viewDuration * bgD.avgBE;

          bgD.avgBE = bgD.avgBE > 1.0 ? 1.0 : bgD.avgBE;
        });
      });
    });
  };



  self.getDummyData();
  // summary charts
  this.getTotalFrameTime = function(){
    var totalFrameTime = 0;
    _.each(dummyData, function(channelD){
      _.each(channelD.channelData, function(sportD){
        _.each(sportD.sportData, function(bgD){
          totalFrameTime += bgD.mediaLength;
        });
      });
    });
    return totalFrameTime;
  };
  this.getBrushedFrameTime = function(){ return self.getTotalFrameTime(); };

  function sumOnBgId(dummyDataArr, dataKey){
    var agg = {};
    _.each(dummyDataArr, function(channelD){
      _.each(channelD.channelData, function(sportD){
        _.each(sportD.sportData, function(bgD){
          if(!agg[bgD.bgId]){ agg[bgD.bgId] = bgD[dataKey]; }
          else { agg[bgD.bgId] += bgD[dataKey]; }
        });
      });
    });
    return agg;
  }

  this.getViewDuration = function(){
    return _.map(sumOnBgId(dummyData, 'viewDuration'), function(sum, bgId, list){
      return {id: bgId, sum: sum};
    });
  };
  this.getTvEquivalentDuration = function(){
    return _.map(sumOnBgId(dummyData, 'tvSpot'), function(sum, bgId, list){
      return {id: bgId, sum: sum};
    });
  };
  this.getViewPersistence = function(){
    var averager = self.getChannelIds().length * self.getSportIds().length;
    return _.map(sumOnBgId(dummyData, 'viewPersistence'), function(sum, bgId, list){
      return {id: bgId, sum: sum/averager};
    });
  };

  // average be chart
  this.getABEChartData = function(){
    var numOfSports = self.getSportIds().length;
    var itemsH = {};

    _.each(dummyData, function(channelD){
      _.each(channelD.channelData, function(sportD){
        _.each(sportD.sportData, function(bgD){
          if(!itemsH[channelD.channelId]){ itemsH[channelD.channelId] = {}; }
          if(!itemsH[channelD.channelId][bgD.bgId]){
            itemsH[channelD.channelId][bgD.bgId] = 0;
          }
          itemsH[channelD.channelId][bgD.bgId] += bgD.avgBE;
        });
      });
    });

    // format:
    // [{groupId:, items: [{itemId:, value:}, ]}, ]
    return _.map(itemsH, function(channelD, channelId, list){
      var items = _.map(channelD, function(sum, bgId, llist){
        return {itemId: bgId, value: sum/numOfSports};
      });
      return {groupId: channelId, items: items};
    });
  };

  // tv spot chart
  this.getTVSpotChartData = function(){
    var itemsH = {};

    _.each(dummyData, function(channelD){
      _.each(channelD.channelData, function(sportD){
        _.each(sportD.sportData, function(bgD){
          if(!itemsH[bgD.bgId]){ itemsH[bgD.bgId] = {}; }
          if(!itemsH[bgD.bgId][channelD.channelId]){
            itemsH[bgD.bgId][channelD.channelId] = 0;
          }
          itemsH[bgD.bgId][channelD.channelId] += bgD.tvSpot;
        });
      });
    });

    // format:
    // [{groupId:, items: [{itemId:, value:}, ]}, ]
    return _.map(itemsH, function(bgD, bgId, list){
      var items = _.map(bgD, function(sum, channelId, llist){
        return {itemId: channelId, value: sum};
      });
      return {groupId: bgId, items: items};
    });
  };

  // view duration chart
  this.getViewDurationChartData = function(){
    var numOfChannels = self.getChannelIds().length;
    var itemsH = {};

    _.each(dummyData, function(channelD){
      _.each(channelD.channelData, function(sportD){
        _.each(sportD.sportData, function(bgD){
          if(!itemsH[sportD.sportId]){ itemsH[sportD.sportId] = {}; }
          if(!itemsH[sportD.sportId][bgD.bgId]){
            itemsH[sportD.sportId][bgD.bgId] = 0;
          }
          itemsH[sportD.sportId][bgD.bgId] += bgD.avgBE;
        });
      });
    });

    // format:
    // [{groupId:, items: [{itemId:, value:}, ]}, ]
    return _.map(itemsH, function(sportD, sportId, list){
      var items = _.map(sportD, function(sum, bgId, llist){
        return {itemId: bgId, value: sum/numOfChannels};
      });
      return {groupId: sportId, items: items};
    });
  };

  function rand(min, max){ return Math.random() * (max - min) + min; }
  function randSign(){ return Math.random() > 0.5 ? -1 : 1; }

  //------------------------------------------------
  // set relations
  this.setChartHelpers = function(ddd){ self.chartHelpers = ddd; return self; };
};
//------------------------------------------------
