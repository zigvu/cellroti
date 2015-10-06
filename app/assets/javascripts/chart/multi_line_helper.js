/*------------------------------------------------
	Helper for multine chart
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
  };
  // initialize
  self.resetTimelineChart();

  this.setTimelineChartType = function(tc){ self.timelineChartType = tc; };
  this.getTimelineChartType = function(){ return self.timelineChartType; };
  this.setTimelineChartBgIds = function(bgIds){ self.timelineChartBgIds = bgIds; };
  this.getTimelineChartBgIds = function(){ return self.timelineChartBgIds; };

  //------------------------------------------------
  // Set/reset charts using buttons
  var resetButTimelineChart = '#reset-timeline-charts';
  $(resetButTimelineChart).click(function(){ chartManager.brushReset(); });

  var resetButComponentChart = '#reset-component-charts';
  $(resetButComponentChart).click(function(){ chartManager.resetTimelineChart(); });

  var resetButBEChart = '#reset-brand-effectiveness-bar-chart';
  $(resetButBEChart).click(function(){ chartManager.resetTimelineChart(); });

  var resetButSPChart = '#reset-spatial-position-chart';
  $(resetButSPChart).click(function(){ chartManager.resetTimelineChart(); });

  var timelineChartTitleId = '#timeline-chart-title';
  function resetTimelineChartTitle(){
    var newTitle = chartHelpers.getChartLabel(self.timelineChartType);
    $(timelineChartTitleId).text(newTitle);
  };

  function resetButton(butId){
    $(butId).addClass('title-button-unselected');
    $(butId).removeClass('title-button-selected');
  };
  function setButton(butId){
    $(butId).removeClass('title-button-unselected');
    $(butId).addClass('title-button-selected');
  };
  //------------------------------------------------


  //------------------------------------------------
  // repaint
  function repaint(){
    resetTimelineChartTitle();

    // timeline chart reset button
    if(chartManager.isBrushSet()){ setButton(resetButTimelineChart); }
    else { resetButton(resetButTimelineChart); }

    var ctype = _.keys(chartHelpers.beLabels);
    if(_.contains(ctype, self.timelineChartType) && 
        self.timelineChartBgIds != chartManager.getBrandGroupIds()){
      setButton(resetButBEChart);
    } else {
      resetButton(resetButBEChart);
    }

    ctype = _.keys(chartHelpers.bgCrowdingLabels);
    if(_.contains(ctype, self.timelineChartType)){ setButton(resetButComponentChart); }
    else { resetButton(resetButComponentChart); }

    ctype = _.map(chartHelpers.quadMapping, function(qm){ return qm.q; });
    if(_.contains(ctype, self.timelineChartType)){ setButton(resetButSPChart); }
    else { resetButton(resetButSPChart); }
  };

  //------------------------------------------------

  //------------------------------------------------
  // finally, add call back to repaint charts
  chartManager.addRepaintCallback(repaint);
  //------------------------------------------------
};
