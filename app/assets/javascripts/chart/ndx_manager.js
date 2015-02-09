/*------------------------------------------------
	NDX Manager
	------------------------------------------------*/

// TODO: scope variables properly - currently many in global scope

function NDXManager(dataManager){
  //------------------------------------------------
  // set up
  var bCounter, eCounter;
  var maxDataPoints = 1000;

  //------------------------------------------------
  quadMapping = [
    {q: 'q0', name: 'Left Top', row: 0, col: 0, value: 0, count: 0},
    {q: 'q1', name: 'Center Top', row: 0, col: 1, value: 0, count: 0},
    {q: 'q2', name: 'Right Top', row: 0, col: 2, value: 0, count: 0},
    {q: 'q3', name: 'Left Center', row: 1, col: 0, value: 0, count: 0},
    {q: 'q4', name: 'Center', row: 1, col: 1, value: 0, count: 0},
    {q: 'q5', name: 'Right Center', row: 1, col: 2, value: 0, count: 0},
    {q: 'q6', name: 'Left Bottom', row: 2, col: 0, value: 0, count: 0},
    {q: 'q7', name: 'Center Bottom', row: 2, col: 1, value: 0, count: 0},
    {q: 'q8', name: 'Right Bottom', row: 2, col: 2, value: 0, count: 0}
  ];

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
  this.ndx = crossfilter(dataManager.ndxData);

  averagerDim = this.ndx.dimension(function (d) { return d.averager; });
  averagerGroup = averagerDim.group();
  
  counterDim = this.ndx.dimension(function (d) { return d.counter; });
  bgFilterDim = this.ndx.dimension(function (d) { return d.det_group_id; });
  bgFilterGroup = bgFilterDim.group().reduce(
    REDUCEAVG.MULTIPLE.reduceAddAvg(compositeAccessors), 
    REDUCEAVG.MULTIPLE.reduceRemoveAvg(compositeAccessors), 
    REDUCEAVG.MULTIPLE.reduceInitAvg
  );
  var bgFilterGroupAll; // data to hold group all data

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
    this.fire();

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
    })
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
  }

  // reset all filters
  this.resetAllFilters = function(){
    counterDim.filterAll();
    averagerDim.filterAll();
  };

  // let jquery manage call backs to update all charts
  var callbacks = $.Callbacks("unique");
  this.addCallback = function(callback){ callbacks.add(callback); };
  this.fire = function(){ callbacks.fire(); };
};
