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
  this.chartHelpers = undefined;
  this.dateNavigator = new ZIGVU.Analytics.Discover.Data.DateNavigator();

  // TODO: move to function
  var beginDate = new Date(2015, 7, 12, 3, 5, 0, 0);
  var endDate = new Date(2015, 7, 12, 15, 25, 50, 0);
  self.dateNavigator.setMinMaxDatesRange(new Date(2014, 4, 5), new Date(2016, 0, 5));
  self.dateNavigator.setDates(beginDate, endDate);


  //------------------------------------------------
  // accessor functions
  this.getCalendarChartData = function(){
    return self.dateNavigator.getData();
  };

  //------------------------------------------------
  // setter functions
  this.setCalendarDateByIdxPromise = function(idx){
    self.dateNavigator.setDatesOnIdx(idx);
    var curDates = self.dateNavigator.getCurDates();
    return self.setCalendarDatePromise(curDates.begin_date, curDates.end_date);
  };

  this.setCalendarDatePromise = function(beginDate, endDate){
    var setDateDefer = Q.defer();
    // TODO: ajax, ndx etc.
    setDateDefer.resolve(true);
    return setDateDefer.promise;
  };

  //------------------------------------------------
  // set relations
  this.setChartHelpers = function(ddd){ self.chartHelpers = ddd; return self; };
};
//------------------------------------------------
