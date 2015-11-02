/*------------------------------------------------
  Controller
  ------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.CrossChannel = ZIGVU.Analytics.CrossChannel || {};

ZIGVU.Analytics.CrossChannel.Controller = function(){
  var self = this;

  var CrossChannel = ZIGVU.Analytics.CrossChannel;
  var Common = ZIGVU.Analytics.Common;

  this.chartHelpers = undefined;
  this.responsiveCalculator = undefined;
  this.eventManager = undefined;
  this.dataManager = undefined;

  this.averageBEChart = undefined;
  this.summaryCharts = undefined;
  this.tvSpotByChannelChart = undefined;
  this.tvSpotBySportChart = undefined;

  //------------------------------------------------  
  // Initialize and update of charts
  this.setup = function(){
    self.chartHelpers = new ChartHelpers(); // TODO - replace with namespaced
    self.responsiveCalculator = new CrossChannel.ResponsiveCalculator();
    self.eventManager = new Common.EventManager();
    self.dataManager = new CrossChannel.DataManager();
    self.dataManager
        .setChartHelpers(self.chartHelpers);
    self.responsiveCalculator = new CrossChannel.ResponsiveCalculator();

    self.summaryCharts = new CrossChannel.Charts.SummaryCharts();
    self.summaryCharts
        .setEventManager(self.eventManager)
        .setDataManager(self.dataManager)
        .setResponsiveCalculator(self.responsiveCalculator)
        .setChartHelpers(self.chartHelpers);

    self.averageBEChart = new CrossChannel.Charts.AverageBE();
    self.averageBEChart
        .setEventManager(self.eventManager)
        .setDataManager(self.dataManager)
        .setResponsiveCalculator(self.responsiveCalculator)
        .setChartHelpers(self.chartHelpers);

    self.tvSpotByChannelChart = new CrossChannel.Charts.TVSpotByChannel();
    self.tvSpotByChannelChart
        .setEventManager(self.eventManager)
        .setDataManager(self.dataManager)
        .setResponsiveCalculator(self.responsiveCalculator)
        .setChartHelpers(self.chartHelpers);

    self.tvSpotBySportChart = new CrossChannel.Charts.TVSpotBySport();
    self.tvSpotBySportChart
        .setEventManager(self.eventManager)
        .setDataManager(self.dataManager)
        .setResponsiveCalculator(self.responsiveCalculator)
        .setChartHelpers(self.chartHelpers);


    $(window).resize(function() { self.debouncedResize(); });
  };

  this.draw = function(){
    self.summaryCharts.draw();
    self.averageBEChart.draw();
    self.tvSpotByChannelChart.draw();
    self.tvSpotBySportChart.draw();

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
