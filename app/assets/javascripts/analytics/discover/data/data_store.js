/*------------------------------------------------
  Data Filter
  ------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.Discover = ZIGVU.Analytics.Discover || {};
ZIGVU.Analytics.Discover.Data = ZIGVU.Analytics.Discover.Data || {};

ZIGVU.Analytics.Discover.Data.DataStore = function(){
  var self = this;

  // collection of ChartData objects
  this.maxNumChartDataArrElem = 5;
  this.chartDataArr = [];
  this.curChartDataArrIdx = 0;

  // format:
  // {bg_id: :name, }
  this.brandGroupMap = undefined;
  // format:
  // {stream_id: :name, }
  this.streamMap = undefined;
  // format:
  // {event_id: :name}
  this.eventMap = undefined;
};
//------------------------------------------------
