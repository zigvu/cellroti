/*------------------------------------------------
  Average brand effectiveness multi bar chart
  ------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.CrossChannel = ZIGVU.Analytics.CrossChannel || {};
ZIGVU.Analytics.CrossChannel.Charts = ZIGVU.Analytics.CrossChannel.Charts || {};

ZIGVU.Analytics.CrossChannel.Charts.AverageBE = function(){
  var self = this;

  //------------------------------------------------
  // set up
  this.dataManager = undefined;
  this.eventManager = undefined;
  this.responsiveCalculator = undefined;
  this.chartHelpers = undefined;
  this.multiBarChart = undefined;

  this.draw = function(){
    self.multiBarChart = new ZIGVU.Analytics.BaseCharts.MultiBarChart(self);
  };

  // data for chart
  this.getChartDim = function(){ return self.responsiveCalculator.getABEChartDims(); };
  this.getChartData = function(){ return self.dataManager.getABEChartData(); };
  this.getGroupName = function(channelId){ return self.dataManager.getChannelName(channelId); };
  this.getItemIds = function(){ return self.dataManager.getBrandGroupIds(); };
  this.getItemName = function(bgId){ return self.dataManager.getBrandGroupName(bgId); };
  this.getItemColor = function(bgId){ return self.dataManager.getBrandGroupColor(bgId); };

  // events for chart
  this.handleClickOnItem = function(channelId, bgId){ };
  this.addRepaintCallback = function(func){ self.eventManager.addRepaintCallback(func); };
  this.addResizeCallback = function(func){ self.eventManager.addResizeCallback(func); };
  this.addTimelineChartSelectionCallback = function(func){ self.eventManager.addTimelineChartSelectionCallback(func); };

  //------------------------------------------------
  // set relations
  this.setDataManager = function(ddd){ self.dataManager = ddd; return self; };
  this.setEventManager = function(ddd){ self.eventManager = ddd; return self; };
  this.setResponsiveCalculator = function(ddd){ self.responsiveCalculator = ddd; return self; };
  this.setChartHelpers = function(ddd){ self.chartHelpers = ddd; return self; };
};
