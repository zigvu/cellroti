/*------------------------------------------------
	Brush chart
	------------------------------------------------*/

function MultiLineHelper(chartManager){
  var self = this;

  //------------------------------------------------
  // set up
  var chartHelpers = chartManager.chartHelpers;


  // initial timeline chart selection
  this.timelineChartType = undefined;
  this.timelineChartBgIds = undefined;
  //------------------------------------------------

  this.resetTimelineChart = function(){
    self.timelineChartType = 'brand_effectiveness';
    self.timelineChartBgIds = chartManager.getBrandGroupIds();
    resetTimelineChartTitle();
  };
  // initialize
  self.resetTimelineChart();

  this.getTimelineChartType = function(){
    return self.timelineChartType;
  };
  this.getTimelineChartBgIds = function(){
    return self.timelineChartBgIds;
  };
  this.handleClickOnBgBar = function(chartType, bgIds){
    self.timelineChartType = chartType;
    self.timelineChartBgIds = bgIds;
    resetTimelineChartTitle();
  };


  //------------------------------------------------
  // Reset Chart
  var resetTimelineChartsId = '#reset-timeline-charts';
  $(resetTimelineChartsId).click(function(){
    chartManager.brushReset();
  });

  var resetTimelineChartsId = '#reset-component-charts';
  $(resetTimelineChartsId).click(function(){
    chartManager.resetTimelineChart();
  });

  var timelineChartTitleId = '#timeline-chart-title';
  function resetTimelineChartTitle(){
    var newTitle = chartHelpers.getChartLabel(self.timelineChartType);
    $(timelineChartTitleId).text(newTitle);
  };
  //------------------------------------------------


  //------------------------------------------------
  // finally, add call back to repaint charts
  //chartManager.addRepaintCallback(repaint);
  //------------------------------------------------
};
