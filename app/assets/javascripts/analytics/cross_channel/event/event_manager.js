/*------------------------------------------------
  Event Manager
  ------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.CrossChannel = ZIGVU.Analytics.CrossChannel || {};
ZIGVU.Analytics.CrossChannel.Event = ZIGVU.Analytics.CrossChannel.Event || {};

ZIGVU.Analytics.CrossChannel.Event.EventManager = function(){
  var self = this;

  //------------------------------------------------
  // let jquery manage call backs to update all charts
  var repaintCallbacks = $.Callbacks("unique");
  this.addRepaintCallback = function(callback){ repaintCallbacks.add(callback); };
  this.fireRepaintCallback = function(){ repaintCallbacks.fire(); };

  var resizeCallbacks = $.Callbacks("unique");
  this.addResizeCallback = function(callback){ resizeCallbacks.add(callback); };
  this.fireResizeCallback = function(){ resizeCallbacks.fire(); };

  var timelineChartSelectionCallback = $.Callbacks("unique");
  this.addTimelineChartSelectionCallback = function(callback){ timelineChartSelectionCallback.add(callback); };
  this.fireTimelineChartSelectionCallback = function(groupId, itemIds){
    timelineChartSelectionCallback.fire(groupId, itemIds);
  };
  //------------------------------------------------
};
//------------------------------------------------
