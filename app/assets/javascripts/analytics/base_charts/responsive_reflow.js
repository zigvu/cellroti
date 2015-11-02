/*------------------------------------------------
	Calculator for responsive widths
	------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.BaseCharts = ZIGVU.Analytics.BaseCharts || {};


ZIGVU.Analytics.BaseCharts.ResponsiveReflows = function(divs, heights){
  var self = this;

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

  this.getDims = function(chartKey){
    return {
      'div': divs[chartKey],
      'height': getHeight(heights[chartKey])
    };
  };

  function getHeight(heightHash){
    if(self.isSmall()){ return heightHash['small']; }
    if(self.isMedium()){ return heightHash['medium']; }
    if(self.isLarge()){ return heightHash['large']; }
  };
  //------------------------------------------------
};
