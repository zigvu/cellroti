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
  // events
  var eventMap, eventSorter, eventIds;
  this.setEventMap = function(){
    eventMap = self.dataFilter.eventMap;
    eventSorter = _.chain(eventMap).pairs().sortBy(function(k){return k[1];}).value();
    eventIds = _.map(eventSorter, function(k){ return k[0];});
  };
  this.getEventIds = function(){ return eventIds; };
  this.getEventName = function(eventId){ return eventMap[eventId]; };

  //------------------------------------------------
  // dummy data
  var dummyTimelineData, oldBeginDate, oldEndDate;
  this.getDummyTimelineData = function(){
    if(oldBeginDate && oldEndDate &&
      oldBeginDate.getTime() === self.dataFilter.dates.timelineBeginDate.getTime() &&
      oldEndDate.getTime() === self.dataFilter.dates.timelineEndDate.getTime()){
      return dummyTimelineData;
    }
    oldBeginDate = self.dataFilter.dates.timelineBeginDate;
    oldEndDate = self.dataFilter.dates.timelineEndDate;
    var numItems = 300;
    var msPerItem = (oldEndDate.getTime() - oldBeginDate.getTime())/numItems;

    // format:
    // {bg_id: [{date:, value:}, ], }
    dummyTimelineData = [];
    _.each(self.getBrandGroupIds(), function(bgId){
      var values = [];
      _.each(_.range(numItems + 1), function(i){
        var be = rand(0.0, 1.0);
        values.push({
          date: new Date(oldBeginDate.getTime() + msPerItem * i),
          value: be,
        });
      });
      dummyTimelineData.push({
        itemId: bgId,
        values: values,
      });
    });
    return dummyTimelineData;
  };

  var dummyEventData;
  this.getDummyEventData = function(){
    var numItems = 4;
    var msPerItem = (oldEndDate.getTime() - oldBeginDate.getTime())/numItems;

    // format:
    // {date:, event_id:}
    dummyEventData = [];
    var eIds = self.getEventIds();
    _.each(_.range(1, numItems), function(i){
      dummyEventData.push({
        date: new Date(oldBeginDate.getTime() + msPerItem * i),
        event_id: eIds[Math.floor(Math.random() * eIds.length)]
      });
    });
    return dummyEventData;
  };

  var segmentData, segmentColors;
  this.getSegmentDummyData = function(){
    var dur = oldEndDate.getTime() - oldBeginDate.getTime();
    dur = new Date(oldBeginDate.getTime() + Math.round(Math.random() * dur));
    segmentData = [
      { idx: 1, begin_date: oldBeginDate, end_date: dur, label: 'Happy Hallows' },
      { idx: 2, begin_date: dur, end_date: oldEndDate, label: 'Somber Shallows' },
    ];
    segmentColors = d3.scale.category10().domain([1,2]);
    return segmentData;
  };
  this.getSegmentColor = function(idx){ return segmentColors(idx); };


  function rand(min, max){ return Math.random() * (max - min) + min; }
  function randSign(){ return Math.random() > 0.5 ? -1 : 1; }

  //------------------------------------------------
  // set relations
  this.setDataFilter = function(ddd){
    self.dataFilter = ddd;
    self.setBrandGroupMap();
    self.setChannelMap();
    self.setEventMap();
    return self;
  };
};
//------------------------------------------------
