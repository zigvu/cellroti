/*------------------------------------------------
  Data Filter
  ------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.Discover = ZIGVU.Analytics.Discover || {};
ZIGVU.Analytics.Discover.Data = ZIGVU.Analytics.Discover.Data || {};

ZIGVU.Analytics.Discover.Data.Filter = function(){
  var self = this;

  this.dates = {
    calBeginDate: undefined, calEndDate: undefined,
    timelineBeginDate: undefined, timelineEndDate: undefined,
    minBeginDate: undefined, maxEndDate: undefined
  };

  this.brandGroupMap = undefined;
  this.channelMap = undefined;

};
//------------------------------------------------
