/*------------------------------------------------
  Average brand effectiveness multi bar chart
  ------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.Discover = ZIGVU.Analytics.Discover || {};
ZIGVU.Analytics.Discover.Charts = ZIGVU.Analytics.Discover.Charts || {};

ZIGVU.Analytics.Discover.Charts.Brush = function(){
  var self = this;

  //------------------------------------------------
  // set up
  this.dataManager = undefined;
  this.eventManager = undefined;
  this.responsiveCalculator = undefined;
  this.chartHelpers = undefined;
  this.brushChart = undefined;

  this.draw = function(){
    self.brushChart = new ZIGVU.Analytics.BaseCharts.BrushChart(self);
    self.eventManager.addResetBrushCallback(resetBrush);
  };

  // set brush
  this.brushSet = function(beginDate, endDate){
    return self.brushChart.brushSet(beginDate, endDate);
  };
  this.handleBrushSelection = function(dates){
    if(self.dataManager.setCalendarDates(dates.begin_date, dates.end_date)){
      self.eventManager.fireRepaintCallback();
    }
    console.log("Brush: Begin: " + dates.begin_date + ", End: " + dates.end_date);
  };
  function resetBrush(){ self.brushChart.brushReset(); }

  // data for chart
  this.getChartDim = function(){ return self.responsiveCalculator.getBrushChartDims(); };
  this.getChartData = function(){ return self.dataManager.getTimelineData(); };
  this.getItemIds = function(){ return self.dataManager.getBrandGroupIds(); };
  this.getItemName = function(bgId){ return self.dataManager.getBrandGroupName(bgId); };
  this.getItemColor = function(bgId){ return self.dataManager.getBrandGroupColor(bgId); };

  // events for chart
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
