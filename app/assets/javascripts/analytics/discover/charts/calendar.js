/*------------------------------------------------
  Average brand effectiveness multi bar chart
  ------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.Discover = ZIGVU.Analytics.Discover || {};
ZIGVU.Analytics.Discover.Charts = ZIGVU.Analytics.Discover.Charts || {};

ZIGVU.Analytics.Discover.Charts.Calendar = function(){
  var self = this;

  //------------------------------------------------
  // set up
  this.dataManager = undefined;
  this.eventManager = undefined;
  this.responsiveCalculator = undefined;
  this.chartHelpers = undefined;
  this.calendarChart = undefined;

  this.draw = function(){
    self.calendarChart = new ZIGVU.Analytics.BaseCharts.CalendarChart(self);
  };

  // data for chart
  this.getChartDim = function(){ return self.responsiveCalculator.getCalendarChartDims(); };
  this.getChartData = function(){ return self.dataManager.getCalendarChartData(); };

  // events for chart
  this.handleClickOnBar = function(idx){
    self.dataManager.setCalendarDateByIdxPromise(idx)
      .then(function(){
        self.eventManager.fireRepaintCallback();
      }).catch(function (errorReason) { err(errorReason); });
  };

  this.addRepaintCallback = function(func){ self.eventManager.addRepaintCallback(func); };
  this.addResizeCallback = function(func){ self.eventManager.addResizeCallback(func); };

  //------------------------------------------------
  // set relations
  this.setDataManager = function(ddd){ self.dataManager = ddd; return self; };
  this.setEventManager = function(ddd){ self.eventManager = ddd; return self; };
  this.setResponsiveCalculator = function(ddd){ self.responsiveCalculator = ddd; return self; };
  this.setChartHelpers = function(ddd){ self.chartHelpers = ddd; return self; };

  //------------------------------------------------
  // shorthand for error printing
  this.err = function(errorReason){
    console.log('ZIGVU.Analytics.Discover.Charts.Calendar -> ' + errorReason);
  };
};
