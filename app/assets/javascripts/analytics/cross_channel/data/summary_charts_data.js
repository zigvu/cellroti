/*------------------------------------------------
  Summary chart data
  ------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.CrossChannel = ZIGVU.Analytics.CrossChannel || {};
ZIGVU.Analytics.CrossChannel.Data = ZIGVU.Analytics.CrossChannel.Data || {};

ZIGVU.Analytics.CrossChannel.Data.SummaryChartData = function(){
  var self = this;

  //------------------------------------------------
  // set up
  this.dataManager = undefined;
  this.chartHelpers = undefined;

  //------------------------------------------------
  // data requests

  this.requestDataMediaLength = function(){
    var totalTime = self.dataManager.getTotalFrameTime();
    var brushedTime = self.dataManager.getBrushedFrameTime();
    var readableTime = self.chartHelpers.getReadableTime(brushedTime);

    var pcData = [
      {id: 1, name: 'Time selected', sum: brushedTime, color: '#928F8F'},
      {id: 2, name: 'Time not selected', sum: (totalTime - brushedTime), color: '#CAC6C5'}
    ];
    pcData = pcDataCalculatePercent(pcData);
    var summaryData = {
      text: readableTime.time,
      unit: readableTime.unit,
      label: 'Media Length',
      pc_data: pcData
    };
    return summaryData;
  };

  this.requestDataTvEquivalent = function(){
    var pcData = self.dataManager.getTvEquivalentDuration();
    pcData = pcDataCalculatePercent(pcData);
    pcData = pcDataAddBgIdDecorations(pcData);

    var totalTvEqTime = _.reduce(pcData, function(s, d){ return s + d.sum; }, 0);
    var readableTime = self.chartHelpers.getReadableTime(totalTvEqTime);

    var summaryData = {
      text: readableTime.time,
      unit: readableTime.unit,
      label: 'TV Spot',
      pc_data: pcData
    };
    return summaryData;
  };

  this.requestDataViewDuration = function(){
    var pcData = self.dataManager.getViewDuration();
    pcData = pcDataCalculatePercent(pcData);
    pcData = pcDataAddBgIdDecorations(pcData);

    var totalTime = _.reduce(pcData, function(s, d){ return s + d.sum; }, 0);
    var readableTime = self.chartHelpers.getReadableTime(totalTime);

    var summaryData = {
      text: readableTime.time,
      unit: readableTime.unit,
      label: 'View Duration',
      pc_data: pcData
    };
    return summaryData;
  };

  this.requestDataViewPersistence = function(){
    var pcData = self.dataManager.getViewPersistence();
    pcData = pcDataCalculatePercent(pcData);
    pcData = pcDataAddBgIdDecorations(pcData);

    var totalDuration = 0, nonZeroCount = 0;
    _.each(pcData, function(d){
      if(d.sum > 0){
        totalDuration += d.sum;
        nonZeroCount += 1;
      }
    });
    if(nonZeroCount === 0){ totalDuration = 0; }
    else { totalDuration = totalDuration / nonZeroCount; }
    var readableTime = self.chartHelpers.getReadableTime(totalDuration);

    var summaryData = {
      text: readableTime.time,
      unit: readableTime.unit,
      label: 'View Persistence',
      pc_data: pcData
    };
    return summaryData;
  };

  function pcDataAddBgIdDecorations(pcData){
    _.each(pcData, function(d){
      d.name = self.dataManager.getBrandGroupName(d.id);
      d.color = self.dataManager.getBrandGroupColor(d.id);
    });
    return pcData;
  }

  function pcDataCalculatePercent(pcData){
    var total = _.reduce(pcData, function(s, d){ return s + d.sum; }, 0);
    // prevent divide by zero
    if(total > 0){
      _.each(pcData, function(d){ d.percent = parseInt(d.sum/total * 100)/100; });
    } else {
      _.each(pcData, function(d){ d.percent = parseInt(1.0/pcData.length); });
    }
    return pcData;
  }
  //------------------------------------------------

  //------------------------------------------------
  // set relations
  this.setDataManager = function(ddd){ self.dataManager = ddd; return self; };
  this.setChartHelpers = function(ddd){ self.chartHelpers = ddd; return self; };
};
