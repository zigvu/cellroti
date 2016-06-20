/*------------------------------------------------
  Event Manager
  ------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.Discover.Event = ZIGVU.Analytics.Discover.Event || {};

ZIGVU.Analytics.Discover.Event.EventManager = function(){
  var self = this;

  //------------------------------------------------
  // repaint
  var repaintCallbacks = $.Callbacks("unique");
  this.addRepaintCallback = function(callback){ repaintCallbacks.add(callback); };
  this.fireRepaintCallback = function(){ repaintCallbacks.fire(); };

  var resizeCallbacks = $.Callbacks("unique");
  this.addResizeCallback = function(callback){ resizeCallbacks.add(callback); };
  this.fireResizeCallback = function(){ resizeCallbacks.fire(); };

  var resetBrushCallbacks = $.Callbacks("unique");
  this.addResetBrushCallback = function(callback){ resetBrushCallbacks.add(callback); };
  this.fireResetBrushCallback = function(){ resetBrushCallbacks.fire(); };

  var brushChangeCallbacks = $.Callbacks("unique");
  this.addBrushChangeCallback = function(callback){ brushChangeCallbacks.add(callback); };
  this.fireBrushChangeCallback = function(args){ brushChangeCallbacks.fire(args); };
  //------------------------------------------------
  // clip player
  var clipProgressBarCallbacks = $.Callbacks("unique");
  this.addClipProgressBarCallbacks = function(callback){ clipProgressBarCallbacks.add(callback); };
  this.fireClipProgressBarCallbacks = function(args){ clipProgressBarCallbacks.fire(args); };

  var clipEndedCallbacks = $.Callbacks("unique");
  this.addClipEndedCallbacks = function(callback){ clipEndedCallbacks.add(callback); };
  this.fireClipEndedCallbacks = function(args){ clipEndedCallbacks.fire(args); };
  //------------------------------------------------
};
//------------------------------------------------