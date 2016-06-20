/*------------------------------------------------
  Data Manager
  ------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.Discover = ZIGVU.Analytics.Discover || {};
ZIGVU.Analytics.Discover.Data = ZIGVU.Analytics.Discover.Data || {};

ZIGVU.Analytics.Discover.Data.DataManager = function(){
  var self = this;

  //------------------------------------------------
  // set up
  this.dateNavigator = undefined;
  this.chartDataPackager = undefined;
  this.dataFilter = undefined;

  this.setupPromise = function(){
    var metadataDefer = Q.defer();

    // TODO: ajax
    metadataDefer.resolve(true);

    var beginDate = new Date(2015, 7, 12, 3, 5, 0, 0);
    var endDate = new Date(2015, 7, 12, 15, 25, 50, 0);
    var minBeginDate = new Date(2014, 4, 5);
    var maxEndDate = new Date(2016, 0, 5);
    var brandGroupMap = {1: "Other Sports Drink", 2: "Powerade", 3: "Gatorade"};
    var channelMap = {1: "ESPN", 2: "Fox Sports 1", 3: "MLB.com", 4: "Youtube Sport 1K"};
    var eventMap = {1: "Goal", 2: "Penalty", 3: "Red Card", 4: "Yellow Card"};

    self.dataFilter = new ZIGVU.Analytics.Discover.Data.Filter();
    self.dataFilter.dates.calBeginDate = beginDate;
    self.dataFilter.dates.calEndDate = endDate;
    self.dataFilter.dates.timelineBeginDate = beginDate;
    self.dataFilter.dates.timelineEndDate = endDate;
    self.dataFilter.dates.minBeginDate = minBeginDate;
    self.dataFilter.dates.maxEndDate = maxEndDate;
    self.dataFilter.brandGroupMap = brandGroupMap;
    self.dataFilter.channelMap = channelMap;
    self.dataFilter.eventMap = eventMap;

    self.dateNavigator = new ZIGVU.Analytics.Discover.Data.DateNavigator();
    self.dateNavigator.setDataFilter(self.dataFilter);

    self.chartDataPackager = new ZIGVU.Analytics.Discover.Data.ChartDataPackager();
    self.chartDataPackager.setDataFilter(self.dataFilter);

    return metadataDefer.promise;
  };

  //------------------------------------------------
  // calendar
  this.setCalendarDatesByIdx = function(idx){
    return self.dateNavigator.setDatesOnIdx(idx);
  };
  this.setCalendarDates = function(beginDate, endDate){
    return self.dateNavigator.setDates(beginDate, endDate);
  };
  this.getCalendarChartData = function(){
    return self.dateNavigator.getData();
  };

  //------------------------------------------------
  // timeline
  this.getTimelineData = function(){
    return self.chartDataPackager.getDummyTimelineData();
  };
  this.getBrandGroupIds = function(){
    return self.chartDataPackager.getBrandGroupIds();
  };
  this.getBrandGroupName = function(bgId){
    return self.chartDataPackager.getBrandGroupName(bgId);
  };
  this.getBrandGroupColor = function(bgId){
    return self.chartDataPackager.getBrandGroupColor(bgId);
  };
  this.getEventData = function(){
    return self.chartDataPackager.getDummyEventData();
  };
  this.getEventName = function(eventId){
    return self.chartDataPackager.getEventName(eventId);
  };
  this.getSegmentData = function(){
    return self.chartDataPackager.getSegmentDummyData();
  };
  this.getSegmentColor = function(idx){
    return self.chartDataPackager.getSegmentColor(idx);
  };
  this.getTimelineYAxisLabel = function(){
    return "Brand Effectiveness";
  };

  //------------------------------------------------
  // data functions
  this.requestNewDataPromise = function(){
    var requestDataDefer = Q.defer();
    // TODO: ajax, ndx etc.
    requestDataDefer.resolve(true);
    return requestDataDefer.promise;
  };
};
//------------------------------------------------
