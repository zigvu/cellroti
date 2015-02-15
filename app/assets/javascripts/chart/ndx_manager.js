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
  var bgFilterGroupAll; // data to hold group all data

  // TODO: delete
  this.avd = averagerDim
  this.avg = averagerGroup
  this.bed = brandEffectivenessDim;

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
    var bestAverager;
    _.find(averagerGroup.top(Infinity), function(k){
      bestAverager = k.key;
      // break when satisfied
      if (k.value <= maxDataPoints){ return true; }
    });

    // filter to the right averager and update group data
    averagerDim.filterExact(bestAverager);
    bgFilterGroupAll = bgFilterGroup.all();

    // trigger all repaints
    chartManager.fire();

    // return the best averager
    return bestAverager;
  };

  // get filtered data
  this.getBEData = function(){
    // format:
    // [{bgId: det_group_id, values: [{counter: , brand_effectivesnss: ,... }]} ,... ]
    var values;
    return _.chain(bgFilterDim.top(Infinity))
      .groupBy(function(d){ return d.det_group_id; })
      .map(function(coll, det_group_id, list){
        values = _.chain(coll)
          .sortBy(function(d){ return d.counter; })
          .map(function(d){ 
            return { counter: +d.counter, brand_effectiveness: +d.brand_effectiveness };
          })
          .value();
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
      return {bgId: bfg.key, count: bfg.value.sum[chartDataKey]};
    });
    var total = _.reduce(allDC, function(total, v){ return total + v.count; }, 0);
    allDC = _.map(allDC, function(v){ 
      var avg = total === 0 ? 0 : v.count/total;
      return _.extend(v, {percent: avg}); 
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
    var beTop = brandEffectivenessDim.top(numRowsInTableChart);
    var tableData = _.map(beTop, function(d){
      return _.map(chartHelpers.tableKeys, function(tk){ return d[tk]; });
    });
    return tableData;
  };

  this.getThumbnailData = function(){
    // TODO: get this from dim
    var thumbnailData = [
      {game_id: 1, frame_id: 1},
      {game_id: 1, frame_id: 2},
      {game_id: 1, frame_id: 3},
      {game_id: 1, frame_id: 4}
    ];
    return thumbnailData;
  };

  // reset all filters
  this.resetAllFilters = function(){
    counterDim.filterAll();
    averagerDim.filterAll();
  };
};
