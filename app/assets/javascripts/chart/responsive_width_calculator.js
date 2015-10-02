/*------------------------------------------------
	Calculator for responsive widths
	------------------------------------------------*/

function ResponsiveWidthCalculator(chartManager){
  var self = this;

  //------------------------------------------------
  // set up
  var chartHelpers = chartManager.chartHelpers;

  var divs = {
    'summary_chart_1': '#summary-chart-1',
    'summary_chart_2': '#summary-chart-2',
    'summary_chart_3': '#summary-chart-3',
    'summary_chart_4': '#summary-chart-4',
    'timeline_chart': '#timeline-chart',
    'brush_chart': '#brush-chart',
    'game_selection_chart': '#game-selection-chart',
    'be_component_chart': '#component-bar-chart',
    'spatial_position_chart': '#spatial-position-chart',
    'brand_effectiveness_chart': '#brand-effectiveness-bar-chart',
  };

  var heights = {
    'summary_chart_1': {'small': 130, 'medium': 100, 'large': 130},
    'summary_chart_2': {'small': 130, 'medium': 100, 'large': 130},
    'summary_chart_3': {'small': 130, 'medium': 100, 'large': 130},
    'summary_chart_4': {'small': 130, 'medium': 100, 'large': 130},
    'timeline_chart': {'small': 220, 'medium': 220, 'large': 250},
    'brush_chart': {'small': 28, 'medium': 30, 'large': 30},
    'game_selection_chart': {'small': 32, 'medium': 34, 'large': 34},
    'be_component_chart': {'small': 200, 'medium': 220, 'large': 230},
    'spatial_position_chart': {'small': 200, 'medium': 220, 'large': 230},
    'brand_effectiveness_chart': {'small': 200, 'medium': 220, 'large': 230},
  };

  this.getSummaryChartDims_1 = function(){ return getDims('summary_chart_1'); };
  this.getSummaryChartDims_2 = function(){ return getDims('summary_chart_2'); };
  this.getSummaryChartDims_3 = function(){ return getDims('summary_chart_3'); };
  this.getSummaryChartDims_4 = function(){ return getDims('summary_chart_4'); };
  this.getTimelineChartDims = function(){ return getDims('timeline_chart'); };
  this.getBrushChartDims = function(){ return getDims('brush_chart'); };
  this.getGameSelectionChartDims = function(){ return getDims('game_selection_chart'); };
  this.getBEComponentChartDims = function(){ return getDims('be_component_chart'); };
  this.getSpatialPositionChartDims = function(){ return getDims('spatial_position_chart'); };
  this.getBrandEffectivenessChartDims = function(){ return getDims('brand_effectiveness_chart'); };


  this.reflowHeights = function(){
    // no need to equalize if small
    if(self.isSmall()){ return; }

    var rowHeights, maxHeight;

    // remove min height style, get original height and set max to all
    $("#row-1").find(".card").removeAttr("style");
    rowHeights = $("#row-1").find(".card").map(function() { return $(this).height(); });
    maxHeight = _.max(rowHeights);
    $("#row-1").find(".card").css("min-height", (maxHeight + 1) + "px");

    $("#row-2").find(".card").removeAttr("style");
    rowHeights = $("#row-2").find(".card").map(function() { return $(this).height(); });
    maxHeight = _.max(rowHeights);
    $("#row-2").find(".card").css("min-height", (maxHeight + 1) + "px");
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
