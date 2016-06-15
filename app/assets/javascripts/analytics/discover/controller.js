/*------------------------------------------------
  Controller
  ------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.Discover = ZIGVU.Analytics.Discover || {};

ZIGVU.Analytics.Discover.Controller = function(){
  var self = this;

  var Discover = ZIGVU.Analytics.Discover;

  this.chartHelpers = undefined;
  this.responsiveCalculator = undefined;
  this.eventManager = undefined;
  this.dataManager = undefined;

  this.calendarChart = undefined;

  //------------------------------------------------
  // Initialize and update of charts
  this.setup = function(){
    self.chartHelpers = new ChartHelpers(); // TODO - replace with namespaced
    self.responsiveCalculator = new Discover.ResponsiveCalculator();
    self.eventManager = new Discover.Event.EventManager();
    self.dataManager = new Discover.Data.DataManager();
    self.dataManager
        .setChartHelpers(self.chartHelpers);
    self.responsiveCalculator = new Discover.ResponsiveCalculator();

    self.calendarChart = new Discover.Charts.Calendar();
    self.calendarChart
        .setDataManager(self.dataManager)
        .setEventManager(self.eventManager)
        .setResponsiveCalculator(self.responsiveCalculator)
        .setChartHelpers(self.chartHelpers);

    $(window).resize(function() { self.debouncedResize(); });
  };

  this.draw = function(){
    self.calendarChart.draw();

    self.eventManager.fireRepaintCallback();
    self.responsiveCalculator.reflowHeights();
  };

  //------------------------------------------------
  // handle browser resize
  this.resize = function(){
    self.eventManager.fireResizeCallback();
    self.responsiveCalculator.reflowHeights();
  };
  this.debouncedResize = _.debounce(self.resize, 2000); // 2 seconds
  //------------------------------------------------
};
//------------------------------------------------
