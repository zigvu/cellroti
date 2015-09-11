/*------------------------------------------------
	NDX Manager
	------------------------------------------------*/

function NDXManager(ndxData, chartManager){
  //------------------------------------------------
  // set up
  var chartHelpers = chartManager.chartHelpers;

  var maxDataPoints = chartManager.numOfDataPtsPerBGInSeriesChart;
  var numRowsInTableChart = chartManager.numRowsInTableChart;
  var bCounter, eCounter;

  //------------------------------------------------
  var quadMapping = chartHelpers.quadMapping;

  //------------------------------------------------
  var bcComponentAccessors = [
    'brand_group_crowding',
    'visual_saliency',
    'timing_effectiveness',
    'spatial_effectiveness'
  ];

  var pcComponentAccessors = [
    'detections_count',
    'view_duration'
  ];

  var quadComponentAccessors = _.pluck(quadMapping, 'q');

  var compositeAccessors = _.union(
    bcComponentAccessors,
    pcComponentAccessors,
    quadComponentAccessors);

  // create cross filter
  this.ndx = crossfilter(ndxData);

  // needed for multi-series chart
  var averagerDim = this.ndx.dimension(function (d) { return d.averager; });
  var averagerGroup = averagerDim.group();

  // needed for table
  var brandEffectivenessDim = this.ndx.dimension(function (d) { return d.brand_effectiveness; });

  // needed for rest of the charts
  var counterDim = this.ndx.dimension(function (d) { return d.counter; });
  var bgFilterDim = this.ndx.dimension(function (d) { return d.det_group_id; });
  var bgFilterGroup = bgFilterDim.group().reduce(
    REDUCEAVG.MULTIPLE.reduceAddAvg(compositeAccessors), 
    REDUCEAVG.MULTIPLE.reduceRemoveAvg(compositeAccessors), 
    REDUCEAVG.MULTIPLE.reduceInitAvg
  );
  var bgFilterGroupAll; // structure to hold group all data
  var beTop1K; // structure to hold top 1K highest brand effectiveness values

  // TODO: delete
  this.avd = averagerDim
  this.avg = averagerGroup
  this.bfga = bgFilterGroup;

  // get currently set counters
  this.getBeginCounter = function(){ return bCounter; };
  this.getEndCounter = function(){ return eCounter; };

  // set filters based on counter bounds
  this.setCounterBounds = function(beginCounter, endCounter){
    // reset all filters
    this.resetAllFilters();
    bCounter = beginCounter;
    eCounter = endCounter;

    // need to add a 1 to end counter since it is not inclusive
    counterDim.filterRange([beginCounter, endCounter + 1]);

    // determine the most appropriate averager - in the worst case, show the least dense data
    var bestAverager, totalDataPoints;
    _.find(averagerGroup.top(Infinity), function(k){
      bestAverager = k.key;
      totalDataPoints = k.value;
      // break when satisfied
      if (totalDataPoints <= maxDataPoints){ return true; }
    });

    // filter to the right averager and update group data
    averagerDim.filterExact(bestAverager);
    bgFilterGroupAll = bgFilterGroup.all();
    beTop1K = brandEffectivenessDim.top(1000);

    // return total number of filtered data points and averager used
    var boundDetails = {averager: bestAverager, total_data_points: totalDataPoints};
    return boundDetails;
  };

  // get filtered data
  this.getTimelineChartData = function(timlineChartBgIds){
    // format:
    // [{bgId: det_group_id, values: [{brand_group_data_keys} ,...]} ,... ]
    var values;
    return _.chain(bgFilterDim.top(Infinity))
      .groupBy(function(d){ return d.det_group_id; })
      .pick(timlineChartBgIds)
      .map(function(coll, det_group_id, list){
        values = _.sortBy(coll, function(d){ return d.counter; });
        return { bgId: det_group_id, values: values };
      }).value();
  };

  this.getBEComponentData = function(){
    var beComponentData = _.map(bgFilterGroupAll, function(d){
      return _.map(d.value.sum, function(sum, component){
        if (_.contains(bcComponentAccessors, component)){
          return {bgId: d.key, component: component, value: sum/d.value.count};
        }
      });
    });
    beComponentData = _.flatten(beComponentData);
    beComponentData = _.without(beComponentData, undefined);
    beComponentData = _.groupBy(beComponentData, function(d){ return d.component; })
    beComponentData = _.map(beComponentData, function(values, component, list){
      var bgValues = _.map(values, function(v){ return _.omit(v, 'component'); });
      return { component: component, bgValues: bgValues };
    });

    return beComponentData;
  };

  this.getDetectionsCountData = function(){
    return getPieChartData(pcComponentAccessors[0]);
  };

  this.getViewDurationData = function(){
    return getPieChartData(pcComponentAccessors[1]);
  };

  var getPieChartData = function(chartDataKey){
    var allDC = _.map(bgFilterGroupAll, function(bfg){
      return {bgId: bfg.key, count: bfg.value.count, sum: bfg.value.sum[chartDataKey]};
    });
    var totalSum = _.reduce(allDC, function(total, v){ return total + v.sum; }, 0);
    allDC = _.map(allDC, function(v){ 
      var percent = totalSum === 0 ? 0 : v.sum/totalSum;
      return _.extend(v, {percent: percent}); 
    });
    // if all percent are zero, chart will disappear - so put in equal percents
    if( _.filter(allDC, function(d){ return d.percent !== 0; }).length == 0 ){
      _.each(allDC, function(d) { d.percent = 1.0/allDC.length; })
    }
    return allDC;
  };

  this.getHeatmapData = function(){
    // reset quadmapping
    _.each(quadMapping, function(d){ 
      d.value = 0;
      d.count = 0;
    });
    // add q values for all bgIds
    _.each(bgFilterGroupAll, function(bfg){
      _.each(quadMapping, function(d){ 
        d.value += bfg.value.sum[d.q];
        d.count += bfg.value.count;
      });
    });
    // average using count
    _.each(quadMapping, function(d){ 
      d.value = d.count === 0 ? 0 : d.value/d.count;
    });
    return quadMapping;
  };

  // we need array of array numbers in format as specified in tableKeys
  this.getTableData = function(){
    var tableData = [];
    _.find(beTop1K, function(d, idx, list){
      tableData.push(_.map(chartHelpers.tableKeys, function(tk){ return d[tk]; }));
      return idx >= (numRowsInTableChart - 1);
    });
    return tableData;
  };

  this.getThumbnailData = function(){
    var thumbnailData = [];
    _.find(beTop1K, function(d, idx, list){
      if(d.extracted_frame_number > 0){ 
        thumbnailData.push({game_id: d.game_id, frame_id: d.extracted_frame_number});
      }
      return thumbnailData.length >= 4;
    });

    return thumbnailData;
  };

  // reset all filters
  this.resetAllFilters = function(){
    counterDim.filterAll();
    averagerDim.filterAll();
  };
};
