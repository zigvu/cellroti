/*------------------------------------------------
  Responsive width calculator
  ------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.Discover = ZIGVU.Analytics.Discover || {};

ZIGVU.Analytics.Discover.ResponsiveCalculator = function(){
  var self = this;

  var divs = {
    'clips_player_container': '#clips-player-container',
    'calendar_chart': '#calendar-bar',
    'brush_chart': '#brush-bar',
    'timeline_chart': '#timeline-chart',
  };

  var heights = {
    'clips_player_container': {'small': 180, 'medium': 180, 'large': 180},
    'calendar_chart': {'small': 30, 'medium': 30, 'large': 30},
    'brush_chart': {'small': 30, 'medium': 30, 'large': 30},
    'timeline_chart': {'small': 200, 'medium': 220, 'large': 250},
  };

  this.responsive = new ZIGVU.Analytics.BaseCharts.ResponsiveReflows(divs, heights);
  this.reflowHeights = function(){ self.responsive.reflowHeights(); };

  this.getClipsPlayerContainer = function(){ return self.responsive.getDims('clips_player_container'); };
  this.getCalendarChartDims = function(){ return self.responsive.getDims('calendar_chart'); };
  this.getBrushChartDims = function(){ return self.responsive.getDims('brush_chart'); };
  this.getTimelineChartDims = function(){ return self.responsive.getDims('timeline_chart'); };
};
//------------------------------------------------
