/*------------------------------------------------
	NDX Manager
	------------------------------------------------*/

function NDXManager(ndxData, chartManager){
  var self = this;

  //------------------------------------------------
  // set up
  var chartHelpers = chartManager.chartHelpers;

  var maxDataPoints = chartManager.numOfDataPtsPerBGInSeriesChart;
  var bCounter, eCounter;

  //------------------------------------------------
  var quadMapping = chartHelpers.quadMapping;

  //------------------------------------------------
  var viewPersitenceAccessor = 'view_persistence';
  var bcComponentAccessors = [
    'brand_group_crowding',
    'visual_saliency',
    'timing_effectiveness',
    'spatial_effectiveness'
  ];

  var summaryComponentAccessors = [
    'view_duration',
    'brand_effectiveness'
  ];

  var quadComponentAccessors = _.pluck(quadMapping, 'q');

  var compositeAccessors = _.union(
    bcComponentAccessors,
    summaryComponentAccessors,
    quadComponentAccessors
  );

  // create cross filter
  this.ndx = crossfilter(ndxData);

  // needed for multi-series chart
  var averagerDim = self.ndx.dimension(function (d) { return d.averager; });
  var averagerGroup = averagerDim.group();

  // needed for thumbnails
  var brandEffectivenessDim = self.ndx.dimension(function (d) { return d.brand_effectiveness; });

  // needed for rest of the charts
  var counterDim = self.ndx.dimension(function (d) { return d.counter; });
  var bgFilterDim = self.ndx.dimension(function (d) { return d.det_group_id; });
  var bgFilterGroup = bgFilterDim.group().reduce(
    REDUCEAVG.MULTIPLE.reduceAddAvg(compositeAccessors), 
    REDUCEAVG.MULTIPLE.reduceRemoveAvg(compositeAccessors), 
    REDUCEAVG.MULTIPLE.reduceInitAvg
  );
  var viewPersistenceBgFilterGroup = bgFilterDim.group().reduce(
    REDUCEAVG.NONZERO_SINGLE.reduceAddAvg(viewPersitenceAccessor), 
    REDUCEAVG.NONZERO_SINGLE.reduceRemoveAvg(viewPersitenceAccessor), 
    REDUCEAVG.NONZERO_SINGLE.reduceInitAvg
  );
  var bgFilterGroupAll; // structure to hold group all data for multiple accessors
  var viewPersistenceBgFilterGroupAll; // structure to hold group all data for view persistence
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
    self.resetAllFilters();
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
    viewPersistenceBgFilterGroupAll = viewPersistenceBgFilterGroup.all();
    beTop1K = brandEffectivenessDim.top(1000);

    // return total number of filtered data points and averager used
    var boundDetails = {averager: bestAverager, total_data_points: totalDataPoints};
    return boundDetails;
  };

  // get filtered data
  this.getTimelineChartData = function(bgIds){
    // format:
    // [{bgId: det_group_id, values: [{brand_group_data_keys} ,...]} ,... ]
    var values;
    return _.chain(bgFilterDim.top(Infinity))
      .groupBy(function(d){ return '' + d.det_group_id; })
      .pick(bgIds)
      .map(function(coll, det_group_id, list){
        values = _.sortBy(coll, function(d){ return d.counter; });
        return { bgId: det_group_id, values: values };
      }).value();
  };

  // for brush chart, we don't respect time bound filter, so once cached,
  // filter from this cached value and serve
  this.brushChartDataCache = undefined;
  this.getBrushChartData = function(bgIds){
    if(self.brushChartDataCache === undefined){
      self.brushChartDataCache = self.getTimelineChartData(bgIds);
    }
    return _.filter(self.brushChartDataCache, function(d){ 
      return _.contains(bgIds, '' + d.bgId); 
    });
  };

  this.getBeBarChartData = function(){
    return _.map(bgFilterGroupAll, function(d){
      return {
        bgId: d.key, 
        value: d.value.sum.brand_effectiveness / d.value.count
      };
    });
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
      return { component: component, bgValues: values };
    });

    return beComponentData;
  };

  this.getTvEquivalentDuration = function(bgIds){
    var tvEquivalentDuration = 0;

    var viewDuration = {};
    _.each(bgFilterGroupAll, function(bfg, idx, list){
      viewDuration[bfg.key] = bfg.value.sum[summaryComponentAccessors[0]];
    });

    _.each(self.getBeBarChartData(), function(be){
      // if det group is not present, do not use it for averaging      
      if(_.contains(bgIds, '' + be.bgId) && be.value > 0){
        tvEquivalentDuration += be.value * viewDuration['' + be.bgId];
      }
    });

    return tvEquivalentDuration;
  };

  this.getAverageViewPersistence = function(bgIds){
    var avgVPAcrossBgIds = 0, numOfConsideredBgIds = 0;
    _.each(viewPersistenceBgFilterGroupAll, function(vpg, idx, list){
      if(_.contains(bgIds, '' + vpg.key)){ 
        if(vpg.value.count > 0){
          avgVPAcrossBgIds += vpg.value.sum / vpg.value.count;
          numOfConsideredBgIds += 1;
        }
      }
    });

    var averageViewPersitence = avgVPAcrossBgIds / numOfConsideredBgIds;
    return averageViewPersitence;
  };

  this.getTotalViewDuration = function(bgIds){
    var totalViewDuration = 0;
    _.each(bgFilterGroupAll, function(bfg, idx, list){
      if(_.contains(bgIds, '' + bfg.key)){ 
        totalViewDuration += bfg.value.sum[summaryComponentAccessors[0]];
      }
    });

    return totalViewDuration;
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
        // if det group is not present, do not use it for averaging
        if(bfg.value.sum[d.q] > 0){ d.count += bfg.value.count; }
      });
    });
    // average using count
    _.each(quadMapping, function(d){ 
      d.value = d.count === 0 ? 0 : d.value/d.count;
    });
    return quadMapping;
  };

  this.getThumbnailData = function(bgIds){
    var thumbnailData = [];
    _.find(beTop1K, function(d, idx, list){
      if(d.extracted_frame_number > 0 && _.contains(bgIds, '' + d.det_group_id)){ 
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
