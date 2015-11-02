/*------------------------------------------------
  Data Manager - Mock for now
  ------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.CrossChannel = ZIGVU.Analytics.CrossChannel || {};

ZIGVU.Analytics.CrossChannel.DataManager = function(){
  var self = this;

  //------------------------------------------------
  // set up
  this.chartHelpers = undefined;

  // general brand group
  var brandGroupMap = {4: "CocaCola Main Brand",  5: "Powerade Logo",  6: "Continental Logo"};
  var brandGroupSorter = _.chain(brandGroupMap).pairs().sortBy(function(k){return k[1];}).value();
  var brandGroupIds = _.map(brandGroupSorter, function(k){ return k[0];});
  var brandGroupColors = d3.scale.category10().domain(brandGroupIds);
  this.getBrandGroupIds = function(){ return brandGroupIds; };
  this.getBrandGroupName = function(bgId){ return brandGroupMap[bgId]; };
  this.getBrandGroupColor = function(bgId){ return brandGroupColors(bgId); };

  var sportMap = {1: "Soccer", 2: "Hockey", 3: "Baseball", 4: "Golf", 5: "Other"};
  var sportSorter = _.chain(sportMap).pairs().sortBy(function(k){return k[1];}).value();
  var sportIds = _.map(sportSorter, function(k){ return k[0];});
  this.getSportIds = function(){ return sportIds; };
  this.getSportName = function(sportId){ return sportMap[sportId]; };
  
  var channelMap = {1: "ESPN", 2: "Fox Sports 1", 3: "Youtube Top 1%", 4: "Fifa World Cup"};
  var channelSorter = _.chain(channelMap).pairs().sortBy(function(k){return k[1];}).value();
  var channelIds = _.map(channelSorter, function(k){ return k[0];});
  this.getChannelIds = function(){ return channelIds; };
  this.getChannelName = function(channelId){ return channelMap[channelId]; };
  
  // TODO: add var
  brandGroupChannelColors = {};
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

  // shortcut
  var bgs = brandGroupIds;
  var sprt = sportIds;
  var chnls = channelIds;


  // summary charts
  this.getTotalFrameTime = function(){ return 22.2 * 60 * 60 * 1000; } // 22.2 hours
  this.getBrushedFrameTime = function(){ return self.getTotalFrameTime(); }
  this.getViewDuration = function(){
    var vd = self.getTotalFrameTime() * 0.05; // 5%
    return [
      {id: bgs[0], sum: vd * 0.3}, {id: bgs[1], sum: vd * 0.2}, {id: bgs[2], sum: vd * 0.5},
    ];
  };
  this.getTvEquivalentDuration = function(){
    var vd = self.getTotalFrameTime() * 0.05 * 0.25; // 5% * 25%
    return [
      {id: bgs[0], sum: vd * 0.5}, {id: bgs[1], sum: vd * 0.2}, {id: bgs[2], sum: vd * 0.3},
    ];
  }
  this.getViewPersistence = function(){
    return [
      {id: bgs[0], sum: 5556.2}, {id: bgs[1], sum: 7375.9}, {id: bgs[2], sum: 13763.4},
    ];
  }


  // average be chart
  this.getABEChartData = function(){
    return [
      {groupId: chnls[0], items: [{itemId: bgs[0], value: 0.02},{itemId: bgs[1], value: 0.05},{itemId: bgs[2], value: 0.03}]},
      {groupId: chnls[1], items: [{itemId: bgs[0], value: 0.01},{itemId: bgs[1], value: 0.13},{itemId: bgs[2], value: 0.06}]},
      {groupId: chnls[2], items: [{itemId: bgs[0], value: 0.05},{itemId: bgs[1], value: 0.01},{itemId: bgs[2], value: 0.01}]},
      {groupId: chnls[3], items: [{itemId: bgs[0], value: 0.05},{itemId: bgs[1], value: 0.09},{itemId: bgs[2], value: 0.04}]},
    ];
  };

  // tv spot chart
  this.getTVSpotChartData = function(){
    return [
      {groupId: bgs[0], items: [{itemId: chnls[0], value: 22000}, {itemId: chnls[1], value: 2000}, {itemId: chnls[2], value: 3000}, {itemId: chnls[3], value: 3000}, ]},
      {groupId: bgs[1], items: [{itemId: chnls[0], value: 1000}, {itemId: chnls[1], value: 2000}, {itemId: chnls[2], value: 5000}, {itemId: chnls[3], value: 2000}, ]},
      {groupId: bgs[2], items: [{itemId: chnls[0], value: 1000}, {itemId: chnls[1], value: 1000}, {itemId: chnls[2], value: 2000}, {itemId: chnls[3], value: 1000}, ]},
    ];
  };

  // view duration chart
  this.getViewDurationChartData = function(){
    return [
      {groupId: sprt[0], items: [{itemId: bgs[0], value: 15000}, {itemId: bgs[1], value: 15000}, {itemId: bgs[2], value: 13000}, ]},
      {groupId: sprt[1], items: [{itemId: bgs[0], value: 4600}, {itemId: bgs[1], value: 2200}, {itemId: bgs[2], value: 12000}, ]},
      {groupId: sprt[2], items: [{itemId: bgs[0], value: 12000}, {itemId: bgs[1], value: 200}, {itemId: bgs[2], value: 3000}, ]},
      {groupId: sprt[3], items: [{itemId: bgs[0], value: 2000}, {itemId: bgs[1], value: 2400}, {itemId: bgs[2], value: 13000}, ]},
      {groupId: sprt[4], items: [{itemId: bgs[0], value: 7000}, {itemId: bgs[1], value: 2400}, {itemId: bgs[2], value: 14000}, ]},
    ];
  };

  //------------------------------------------------
  // set relations
  this.setChartHelpers = function(ddd){ self.chartHelpers = ddd; return self; };
};
//------------------------------------------------  
