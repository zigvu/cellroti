/*------------------------------------------------
  Data Manager
  ------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.Discover = ZIGVU.Analytics.Discover || {};
ZIGVU.Analytics.Discover.Data = ZIGVU.Analytics.Discover.Data || {};

ZIGVU.Analytics.Discover.Data.ChartDataPackager = function(){
  var self = this;
  this.filterStore = undefined;
  this.dataStore = undefined;

  //------------------------------------------------
  // brand group
  var brandGroupMap, brandGroupSorter, brandGroupIds, brandGroupColors;
  this.setBrandGroupMap = function(){
    brandGroupMap = self.dataStore.brandGroupMap;
    brandGroupSorter = _.chain(brandGroupMap).pairs().sortBy(function(k){return k[1];}).value();
    brandGroupIds = _.map(brandGroupSorter, function(k){ return k[0];});
    brandGroupColors = d3.scale.category10().domain(brandGroupIds);
  };
  this.getBrandGroupIds = function(){ return brandGroupIds; };
  this.getBrandGroupName = function(bgId){ return brandGroupMap[bgId]; };
  this.getBrandGroupColor = function(bgId){ return brandGroupColors(bgId); };

  //------------------------------------------------
  // streams
  var streamMap, streamSorter, streamIds;
  this.setStreamMap = function(){
    streamMap = self.dataStore.streamMap;
    streamSorter = _.chain(streamMap).pairs().sortBy(function(k){return k[1];}).value();
    streamIds = _.map(streamSorter, function(k){ return k[0];});
  };
  this.getStreamIds = function(){ return streamIds; };
  this.getStreamName = function(streamId){ return streamMap[streamId]; };

  //------------------------------------------------
  // events
  var eventMap, eventSorter, eventIds;
  this.setEventMap = function(){
    eventMap = self.dataStore.eventMap;
    eventSorter = _.chain(eventMap).pairs().sortBy(function(k){return k[1];}).value();
    eventIds = _.map(eventSorter, function(k){ return k[0];});
  };
  this.getEventIds = function(){ return eventIds; };
  this.getEventName = function(eventId){ return eventMap[eventId]; };

  //------------------------------------------------
  // Chart Data
  this.addChartData = function(data){
    var ds = self.dataStore;
    var fs = self.filterStore;
    var calBeginDate = fs.dates.calBeginDate;
    var calEndDate = fs.dates.calEndDate;

    if(ds.chartDataArr.length >= ds.maxNumChartDataArrElem){
      lastCd = _.min(ds.chartDataArr, function(cd){ return cd.dataAddDate; });
      ds.chartDataArr = _.without(ds.chartDataArr, lastCd);
    }
    var chartData = new ZIGVU.Analytics.Discover.Data.ChartData(calBeginDate, calEndDate);
    chartData.addChartData(data);
    ds.chartDataArr.push(chartData);
    ds.curChartDataArrIdx = ds.chartDataArr.length - 1;
    console.log("Add chart data. curChartDataArrIdx: " + ds.curChartDataArrIdx);
  };

  this.setRightChartData = function(){
    var ds = self.dataStore;
    var fs = self.filterStore;
    var calBeginDate = fs.dates.calBeginDate;
    var calEndDate = fs.dates.calEndDate;

    var canSetChartData = false;
    var rightCd = _.find(ds.chartDataArr, function(cd){
      return (isSameDate(cd.calBeginDate, calBeginDate) && isSameDate(cd.calEndDate, calEndDate));
    });
    if(rightCd){
      ds.curChartDataArrIdx = _.findIndex(ds.chartDataArr, rightCd);
      canSetChartData = true;
      rightCd.setToCalDates();
      console.log("Use existing data. curChartDataArrIdx: " + ds.curChartDataArrIdx);
    }
    return canSetChartData;
  };

  //------------------------------------------------
  // data for charts
  this.setDates = function(){
    var ds = self.dataStore;
    var fs = self.filterStore;
    var timelineBeginDate = fs.dates.timelineBeginDate;
    var timelineEndDate = fs.dates.timelineEndDate;
    var chartData = ds.chartDataArr[ds.curChartDataArrIdx];

    if(isSameDate(chartData.timelineBeginDate, timelineBeginDate) &&
      isSameDate(chartData.timelineEndDate, timelineEndDate)){
      return;
    }
    chartData.setDates(timelineBeginDate, timelineEndDate);
  };

  var oldBeginDate, oldEndDate;
  this.getTimelineChartData = function(){
    var ds = self.dataStore;
    var fs = self.filterStore;

    oldBeginDate = self.filterStore.dates.timelineBeginDate;
    oldEndDate = self.filterStore.dates.timelineEndDate;

    var chartData = ds.chartDataArr[ds.curChartDataArrIdx];
    return chartData.getTimelineChartData(fs.curBrandGroupIds, fs.curTimelineSelector);
  };

  //------------------------------------------------
  // dummy data
  var dummyTimelineData;
  this.getDummyTimelineData = function(){
    if(oldBeginDate && oldEndDate &&
      oldBeginDate.getTime() === self.filterStore.dates.timelineBeginDate.getTime() &&
      oldEndDate.getTime() === self.filterStore.dates.timelineEndDate.getTime()){
      return dummyTimelineData;
    }
    oldBeginDate = self.filterStore.dates.timelineBeginDate;
    oldEndDate = self.filterStore.dates.timelineEndDate;
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
  this.setFilterStore = function(ddd){ self.filterStore = ddd; return self; };
  this.setDataStore = function(ddd){
    self.dataStore = ddd;
    self.setBrandGroupMap();
    self.setStreamMap();
    self.setEventMap();
    return self;
  };
};
//------------------------------------------------
