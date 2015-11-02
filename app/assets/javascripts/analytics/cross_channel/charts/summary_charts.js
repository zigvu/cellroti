/*------------------------------------------------
  Average brand effectiveness multi bar chart
  ------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.CrossChannel = ZIGVU.Analytics.CrossChannel || {};
ZIGVU.Analytics.CrossChannel.Charts = ZIGVU.Analytics.CrossChannel.Charts || {};

ZIGVU.Analytics.CrossChannel.Charts.SummaryCharts = function(){
  var self = this;

  //------------------------------------------------
  // set up
  this.dataManager = undefined;
  this.eventManager = undefined;
  this.responsiveCalculator = undefined;
  this.chartHelpers = undefined;

  this.summaryChartData = undefined;
  this.summaryChartMultiple = undefined;

  this.draw = function(){
    self.summaryChartData = new ZIGVU.Analytics.Common.SummaryChartData();
    self.summaryChartData
        .setDataManager(self.dataManager)
        .setChartHelpers(self.chartHelpers);

    self.summaryChartMultiple = new ZIGVU.Analytics.BaseCharts.SummaryChartMultiple(self);
  };

  // data for chart
  this.getChartDimsData = function(){
    // format: [{id: , dims:, data:}, ]
    var chartsDimsData = [
      { 
        id: 1,
        dims: self.responsiveCalculator.getSummaryChartDims_1(),
        data: self.summaryChartData.requestDataMediaLength()
      }, { 
        id: 2,
        dims: self.responsiveCalculator.getSummaryChartDims_2(),
        data: self.summaryChartData.requestDataTvEquivalent()
      }, { 
        id: 3,
        dims: self.responsiveCalculator.getSummaryChartDims_3(),
        data: self.summaryChartData.requestDataViewDuration()
      }, { 
        id: 4,
        dims: self.responsiveCalculator.getSummaryChartDims_4(),
        data: self.summaryChartData.requestDataViewPersistence()
      }
    ];
    return chartsDimsData;
  };

  // events for chart
  this.addRepaintCallback = function(func){ self.eventManager.addRepaintCallback(func); };
  this.addResizeCallback = function(func){ self.eventManager.addResizeCallback(func); };

  //------------------------------------------------
  // set relations
  this.setDataManager = function(ddd){ self.dataManager = ddd; return self; };
  this.setEventManager = function(ddd){ self.eventManager = ddd; return self; };
  this.setResponsiveCalculator = function(ddd){ self.responsiveCalculator = ddd; return self; };
  this.setChartHelpers = function(ddd){ self.chartHelpers = ddd; return self; };
};
