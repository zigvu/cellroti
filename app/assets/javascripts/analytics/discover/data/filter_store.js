/*------------------------------------------------
  Data Filter
  ------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.Discover = ZIGVU.Analytics.Discover || {};
ZIGVU.Analytics.Discover.Data = ZIGVU.Analytics.Discover.Data || {};

ZIGVU.Analytics.Discover.Data.FilterStore = function(){
  var self = this;

  this.dates = {
    calBeginDate: undefined, calEndDate: undefined,
    timelineBeginDate: undefined, timelineEndDate: undefined,
    minBeginDate: undefined, maxEndDate: undefined
  };

  this.curBrandGroupIds = [];
  this.curStreamIds = [];

  this.curTimelineSelector = 'brand_effectiveness';
  this.curTimelineAxisLabel = 'Brand Effectiveness';
};
//------------------------------------------------
