/*------------------------------------------------
  Event Manager
  ------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.Discover = ZIGVU.Analytics.Discover || {};

ZIGVU.Analytics.Discover.ClipsEventManager = function(){
  var self = this;

  //------------------------------------------------
  // let jquery manage call backs
  var progressBarCallbacks = $.Callbacks("unique");
  this.addProgressBarCallbacks = function(callback){ progressBarCallbacks.add(callback); };
  this.fireProgressBarCallbacks = function(args){ progressBarCallbacks.fire(args); };

  var endedCallbacks = $.Callbacks("unique");
  this.addEndedCallbacks = function(callback){ endedCallbacks.add(callback); };
  this.fireEndedCallbacks = function(args){ endedCallbacks.fire(args); };
  //------------------------------------------------
};
//------------------------------------------------
