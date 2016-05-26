/*------------------------------------------------
  Summary chart multiple
  ------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.BaseCharts = ZIGVU.Analytics.BaseCharts || {};

var BaseCharts = ZIGVU.Analytics.BaseCharts;

ZIGVU.Analytics.BaseCharts.SummaryChartMultiple = function(chartImpl){
  var self = this;

  //------------------------------------------------
  // set up
  function getChartDimsData(){ return chartImpl.getChartDimsData(); }
  chartImpl.addRepaintCallback(repaint);
  chartImpl.addResizeCallback(resize);

  // format: {id: chart}
  this.summaryCharts = {};

  // format: [{id: , dims:, data:}, ]
  var chartsDimsData = getChartDimsData();
  _.each(chartsDimsData, function(cdd){
    self.summaryCharts[cdd.id] = new BaseCharts.SummaryChartSingle(cdd.dims);
  });

  //------------------------------------------------
  // drawing
  function repaint(){
    var chartsDimsData = getChartDimsData();
    _.each(chartsDimsData, function(cdd){
      self.summaryCharts[cdd.id].repaint(cdd.data);
    });
  }

  function resize(){
    var chartsDimsData = getChartDimsData();
    _.each(chartsDimsData, function(cdd){
      self.summaryCharts[cdd.id].resize(cdd.dims);
    });

    repaint();
  }
  //------------------------------------------------
};
