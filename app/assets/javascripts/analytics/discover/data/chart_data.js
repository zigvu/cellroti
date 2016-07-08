/*------------------------------------------------
  Single ndx and related data
  ------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.Discover.Data = ZIGVU.Analytics.Discover.Data || {};

ZIGVU.Analytics.Discover.Data.ChartData = function(calBeginDate, calEndDate){
  var self = this;
  this.dataAddDate = new Date();
  this.calBeginDate = calBeginDate;
  this.calEndDate = calEndDate;
  this.timelineBeginDate = undefined;
  this.timelineEndDate = undefined;

  this.addChartData = function(data){
    self.createCrossFilter(data.ndx_data);
  };

  // create cross filter
  this.ndx = undefined;
  this.dateFilterDim = undefined;
  this.bgFilterDim = undefined;
  this.createCrossFilter = function(ndxData){
    self.ndx = crossfilter(ndxData);
    self.dateFilterDim = self.ndx.dimension(function (d) { return d.date; });
    self.bgFilterDim = self.ndx.dimension(function (d) { return d.det_group_id; });
    self.setToCalDates();
  };

  this.setDates = function(tBeginDate, tEndDate){
    self.timelineBeginDate = tBeginDate;
    self.timelineBeginDate = tEndDate;

    self.dateFilterDim.filterRange([tBeginDate, tEndDate]);
  };
  this.setToCalDates = function(){
    self.setDates(self.calBeginDate, self.calEndDate);
  };


  // get filtered data
  this.getTimelineChartData = function(bgIds, selector){
    // format:
    // [{itemId: det_group_id, values: [{date: value} ,...]} ,... ]
    var sortedColl, values;
    return _.chain(self.bgFilterDim.top(Infinity))
      .groupBy(function(d){ return '' + d.det_group_id; })
      .pick(bgIds)
      .map(function(coll, det_group_id, list){
        sortedColl = _.sortBy(coll, function(d){ return d.date; });
        values = _.map(sortedColl, function(d){ return {date: d.date, value: d[selector]}; });
        return { itemId: det_group_id, values: values };
      }).value();
  };


  // reset all filters
  this.resetAllFilters = function(){
    self.dateFilterDim.filterAll();
  };
};
