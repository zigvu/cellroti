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
  };

  var heights = {
    'clips_player_container': {'small': 180, 'medium': 180, 'large': 180},
  };

  this.responsive = new ZIGVU.Analytics.BaseCharts.ResponsiveReflows(divs, heights);
  this.reflowHeights = function(){ self.responsive.reflowHeights(); };

  this.getClipsPlayerContainer = function(){ return self.responsive.getDims('clips_player_container'); };
};
//------------------------------------------------
