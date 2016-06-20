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

  // format:
  // {bg_id: :name, }
  this.brandGroupMap = undefined;
  // format:
  // {channel_id: :name, }
  this.channelMap = undefined;
  // format:
  // {event_id: :name}
  this.eventMap = undefined;
};
//------------------------------------------------
