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
  this.eventManager = undefined;
  this.ajaxHandler = new ZIGVU.Analytics.Discover.Data.AjaxHandler();
  this.filterStore = new ZIGVU.Analytics.Discover.Data.FilterStore();
  this.dataStore = new ZIGVU.Analytics.Discover.Data.DataStore();
  self.dateNavigator = new ZIGVU.Analytics.Discover.Data.DateNavigator();
  self.chartDataPackager = new ZIGVU.Analytics.Discover.Data.ChartDataPackager();

  this.setupPromise = function(){
    var requestDefer = Q.defer();

    var ds = self.dataStore;
    var fs = self.filterStore;

    self.ajaxHandler.getDiscoverSummaryPromise()
      .then(function(sd){
        fs.dates.calBeginDate = sd.dates.cal_begin_date;
        fs.dates.calEndDate = sd.dates.cal_end_date;
        fs.dates.timelineBeginDate = sd.dates.cal_begin_date;
        fs.dates.timelineEndDate = sd.dates.cal_end_date;
        fs.dates.minBeginDate = sd.dates.min_begin_date;
        fs.dates.maxEndDate = sd.dates.max_end_date;
        fs.curBrandGroupIds = _.keys(sd.brand_group_map);
        fs.curStreamIds = _.keys(sd.stream_map);

        ds.brandGroupMap = sd.brand_group_map;
        ds.streamMap = sd.stream_map;
        ds.eventMap = sd.event_map;

        self.dateNavigator.setFilterStore(self.filterStore);

        self.chartDataPackager.setFilterStore(self.filterStore);
        self.chartDataPackager.setDataStore(self.dataStore);

        return self.requestNewDataPromise();
      }).then(function(){
        requestDefer.resolve(true);
      }).catch(function (errorReason) {
        requestDefer.reject('ZIGVU.Analytics.Discover.Data.DataManager ->' + errorReason);
      });

    return requestDefer.promise;
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
    // return self.chartDataPackager.getDummyTimelineData();
    return self.chartDataPackager.getTimelineChartData();
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
    return self.filterStore.curTimelineAxisLabel;
  };

  //------------------------------------------------
  // data functions
  this.requestNewDataPromise = function(){
    var requestDefer = Q.defer();
    self.ajaxHandler.updateFilterStorePromise(self.filterStore)
      .then(function(){
        if(self.chartDataPackager.setRightChartData()){
          requestDefer.resolve(true);
        } else {
          self.eventManager.fireLoadingDataCallback(true);
          self.ajaxHandler.getDiscoverDataPromise()
            .then(function(data){
              self.chartDataPackager.addChartData(data);
              self.eventManager.fireLoadingDataCallback(false);
              requestDefer.resolve(true);
            }).catch(function (errorReason) {
              requestDefer.reject('ZIGVU.Analytics.Discover.Data.DataManager ->' + errorReason);
            });
        }
      }).catch(function (errorReason) {
        requestDefer.reject('ZIGVU.Analytics.Discover.Data.DataManager ->' + errorReason);
      });
    return requestDefer.promise;
  };

  // shorthand for error printing
  this.err = function(errorReason){
    displayJavascriptError('ZIGVU.Analytics.Discover.Data.DataManager -> ' + errorReason);
  };

  //------------------------------------------------
  // set relations
  this.setEventManager = function(ddd){ self.eventManager = ddd; return self; };
};
//------------------------------------------------
