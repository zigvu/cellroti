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
  this.dateNavigator = new ZIGVU.Analytics.Discover.DateNavigator();

  this.draw = function(){
    var beginDate = new Date(2015, 7, 12, 3, 5, 0, 0);
    var endDate = new Date(2015, 7, 12, 15, 25, 50, 0);
    self.dateNavigator.setAllDatesRange(new Date(2014, 4, 5), new Date(2016, 0, 5));
    self.dateNavigator.setDates(beginDate, endDate);
    self.calendarChart = new ZIGVU.Analytics.BaseCharts.CalendarChart(self);
    self.calendarChart.tempRepaint();
  };

  // data for chart
  // this.getChartDim = function(){ return self.responsiveCalculator.getABEChartDims(); };
  // this.getChartData = function(){ return self.dataManager.getABEChartData(); };
  this.getChartDim = function(){
    return {
      div: '#calendar-bar',
      height: 40
    };
  };
  this.getChartData = function(){
    return self.dateNavigator.getData();
  };

  // events for chart
  this.handleClickOnBar = function(idx){
    self.dateNavigator.setDatesOnIdx(idx);
    self.calendarChart.tempRepaint();
  };
  // this.addRepaintCallback = function(func){ self.eventManager.addRepaintCallback(func); };
  // this.addResizeCallback = function(func){ self.eventManager.addResizeCallback(func); };
  this.addRepaintCallback = function(func){ };
  this.addResizeCallback = function(func){ };

  //------------------------------------------------
  // set relations
  this.setDataManager = function(ddd){ self.dataManager = ddd; return self; };
  this.setEventManager = function(ddd){ self.eventManager = ddd; return self; };
  this.setResponsiveCalculator = function(ddd){ self.responsiveCalculator = ddd; return self; };
  this.setChartHelpers = function(ddd){ self.chartHelpers = ddd; return self; };
};
