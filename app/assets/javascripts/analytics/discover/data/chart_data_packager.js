/*------------------------------------------------
  Data Manager - Mock for now
  ------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.Discover = ZIGVU.Analytics.Discover || {};
ZIGVU.Analytics.Discover.Data = ZIGVU.Analytics.Discover.Data || {};

ZIGVU.Analytics.Discover.Data.ChartDataPackager = function(){
  var self = this;
  this.dataFilter = undefined;

  //------------------------------------------------
  // brand group
  var brandGroupMap, brandGroupSorter, brandGroupIds, brandGroupColors;
  this.setBrandGroupMap = function(){
    brandGroupMap = self.dataFilter.brandGroupMap;
    brandGroupSorter = _.chain(brandGroupMap).pairs().sortBy(function(k){return k[1];}).value();
    brandGroupIds = _.map(brandGroupSorter, function(k){ return k[0];});
    brandGroupColors = d3.scale.category10().domain(brandGroupIds);
  };
  this.getBrandGroupIds = function(){ return brandGroupIds; };
  this.getBrandGroupName = function(bgId){ return brandGroupMap[bgId]; };
  this.getBrandGroupColor = function(bgId){ return brandGroupColors(bgId); };

  //------------------------------------------------
  // channels
  var channelMap, channelSorter, channelIds;
  this.setChannelMap = function(){
    channelMap = self.dataFilter.channelMap;
    channelSorter = _.chain(channelMap).pairs().sortBy(function(k){return k[1];}).value();
    channelIds = _.map(channelSorter, function(k){ return k[0];});
  };
  this.getChannelIds = function(){ return channelIds; };
  this.getChannelName = function(channelId){ return channelMap[channelId]; };

  //------------------------------------------------
  // dummy data
  var dummyData, oldBeginDate, oldEndDate;
  this.getDummyData = function(){
    if(oldBeginDate == self.dataFilter.dates.timelineBeginDate &&
      oldEndDate == self.dataFilter.dates.timelineEndDate){
      return dummyData;
    }
    oldBeginDate = self.dataFilter.dates.timelineBeginDate;
    oldEndDate = self.dataFilter.dates.timelineEndDate;
    var numItems = 300;
    var msPerItem = (oldEndDate.getTime() - oldBeginDate.getTime())/numItems;

    // format:
    // {bg_id: [{date:, value:}, ], }
    dummyData = [];
    _.each(self.getBrandGroupIds(), function(bgId){
      var values = [];
      _.each(_.range(numItems), function(i){
        var be = rand(0.0, 1.0);
        values.push({
          date: new Date(oldBeginDate.getTime() + msPerItem * i),
          value: be,
        });
      });
      dummyData.push({
        itemId: bgId,
        values: values,
      });
    });
    return dummyData;
  };

  function rand(min, max){ return Math.random() * (max - min) + min; }
  function randSign(){ return Math.random() > 0.5 ? -1 : 1; }

  //------------------------------------------------
  // set relations
  this.setDataFilter = function(ddd){
    self.dataFilter = ddd;
    self.setBrandGroupMap();
    self.setChannelMap();
    return self;
  };
};
//------------------------------------------------
