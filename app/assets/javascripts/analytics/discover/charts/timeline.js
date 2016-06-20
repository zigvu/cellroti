/*------------------------------------------------
  Timeline chart
  ------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.Discover = ZIGVU.Analytics.Discover || {};
ZIGVU.Analytics.Discover.Charts = ZIGVU.Analytics.Discover.Charts || {};

ZIGVU.Analytics.Discover.Charts.Timeline = function(){
  var self = this;

  //------------------------------------------------
  // set up
  this.dataManager = undefined;
  this.eventManager = undefined;
  this.responsiveCalculator = undefined;
  this.chartHelpers = undefined;
  this.multiLineChart = undefined;

  this.draw = function(){
    self.multiLineChart = new ZIGVU.Analytics.BaseCharts.MultiLineChart(self);
    self.eventManager.addBrushChangeCallback(changeExtent);
  };

  function changeExtent(dates){ self.multiLineChart.setNewExtent(dates); }

  // data for chart
  this.getChartDim = function(){ return self.responsiveCalculator.getTimelineChartDims(); };
  this.getTimelineData = function(){ return self.dataManager.getTimelineData(); };
  this.getItemIds = function(){ return self.dataManager.getBrandGroupIds(); };
  this.getItemName = function(bgId){ return self.dataManager.getBrandGroupName(bgId); };
  this.getItemColor = function(bgId){ return self.dataManager.getBrandGroupColor(bgId); };
  this.getEventData = function(){ return self.dataManager.getEventData(); };
  this.getEventName = function(eventId){ return self.dataManager.getEventName(eventId); };
  this.getSegmentData = function(){ return self.dataManager.getSegmentData(); };
  this.getSegmentColor = function(idx){ return self.dataManager.getSegmentColor(idx); };
  this.getYAxisLabel = function(idx){ return self.dataManager.getTimelineYAxisLabel(); };

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
