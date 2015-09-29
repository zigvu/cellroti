/*------------------------------------------------
	Calculator for responsive widths
	------------------------------------------------*/

function ResponsiveWidthCalculator(chartManager){
  var self = this;

  //------------------------------------------------
  // set up
  var chartHelpers = chartManager.chartHelpers;

  var divs = {
    'timeline_chart': '#timeline-chart',
    'brush_chart': '#brush-chart',
    'game_selection_chart': '#game-selection-chart',
    'be_component_chart': '#component-bar-chart',
    'spatial_position_chart': '#spatial-position-chart',
    'brand_effectiveness_chart': '#brand-effectiveness-bar-chart',
  };

  var heights = {
    'timeline_chart': {'small': 220, 'medium': 220, 'large': 250},
    'brush_chart': {'small': 28, 'medium': 30, 'large': 30},
    'game_selection_chart': {'small': 28, 'medium': 30, 'large': 30},
    'be_component_chart': {'small': 200, 'medium': 220, 'large': 230},
    'spatial_position_chart': {'small': 200, 'medium': 220, 'large': 230},
    'brand_effectiveness_chart': {'small': 200, 'medium': 220, 'large': 230},
  };

  this.getTimelineChartDims = function(){
    var chartKey = 'timeline_chart';
    return getDims(chartKey);
  };
  this.getBrushChartDims = function(){
    var chartKey = 'brush_chart';
    return getDims(chartKey);
  };
  this.getGameSelectionChartDims = function(){
    var chartKey = 'game_selection_chart';
    return getDims(chartKey);
  };
  this.getBEComponentChartDims = function(){
    var chartKey = 'be_component_chart';
    return getDims(chartKey);
  };
  this.getSpatialPositionChartDims = function(){
    var chartKey = 'spatial_position_chart';
    return getDims(chartKey);
  };
  this.getBrandEffectivenessChartDims = function(){
    var chartKey = 'brand_effectiveness_chart';
    return getDims(chartKey);
  };


  this.reflowHeights = function(){
    // no need to equalize if small
    if(self.isSmall()){ return; }

    var rowHeights, maxHeight;

    rowHeights = $("#row-1").find(".card").map(function() { return $(this).height(); });
    maxHeight = _.max(rowHeights);
    $("#row-1").find(".card").css('min-height', (maxHeight + 1) + 'px');

    rowHeights = $("#row-2").find(".card").map(function() { return $(this).height(); });
    maxHeight = _.max(rowHeights);
    $("#row-2").find(".card").css('min-height', (maxHeight + 1) + 'px');
    // var maxHeight = $('#component-bar-chart').parents('.card').height();
  };


  // detect current state
  this.isSmall = function(){
    return matchMedia(Foundation.media_queries.small).matches &&
      !matchMedia(Foundation.media_queries.medium).matches &&
      !matchMedia(Foundation.media_queries.large).matches;
  };
  this.isMedium = function(){
    return matchMedia(Foundation.media_queries.small).matches &&
      matchMedia(Foundation.media_queries.medium).matches &&
      !matchMedia(Foundation.media_queries.large).matches;
  };
  this.isLarge = function(){
    return matchMedia(Foundation.media_queries.small).matches &&
      matchMedia(Foundation.media_queries.medium).matches &&
      matchMedia(Foundation.media_queries.large).matches;
  };

  function getDims(chartKey){
    return {
      'div': divs[chartKey],
      'height': getHeight(heights[chartKey])
    }
  };

  function getHeight(heightHash){
    if(self.isSmall()){ return heightHash['small']; }
    if(self.isMedium()){ return heightHash['medium']; }
    if(self.isLarge()){ return heightHash['large']; }
  };
  //------------------------------------------------

  //------------------------------------------------
  // resize triggered
  function resize(){
    // since order is important, this needs to be done manually from chartManager
    // self.reflowHeights();
  };

  //------------------------------------------------

  //------------------------------------------------
  // finally, add call back to repaint charts
  chartManager.addResizeCallback(resize);
  //------------------------------------------------
};
