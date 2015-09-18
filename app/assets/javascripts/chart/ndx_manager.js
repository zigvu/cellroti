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
  var bcComponentAccessors = [
    'brand_group_crowding',
    'visual_saliency',
    'timing_effectiveness',
    'spatial_effectiveness'
  ];
  var brandEffectivenessAccessor = 'brand_effectiveness';
  var viewDurationAccessor = 'view_duration';
  var viewPersitenceAccessor = 'view_persistence';

  var quadComponentAccessors = _.pluck(quadMapping, 'q');

  var compositeAccessorsIncZero = _.union(
    bcComponentAccessors,
    [brandEffectivenessAccessor],
    [viewDurationAccessor]
  );

  var compositeAccessorsExcZero = _.union(
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

  // brand filter group to include zero values during averaging
  var bgFGincZero = bgFilterDim.group().reduce(
    REDUCEAVG.MULTIPLE.reduceAddAvg(compositeAccessorsIncZero), 
    REDUCEAVG.MULTIPLE.reduceRemoveAvg(compositeAccessorsIncZero), 
    REDUCEAVG.MULTIPLE.reduceInitAvg
  );

  // brand filter group to exclude zero values during averaging
  var bgFGexcZero = bgFilterDim.group().reduce(
    REDUCEAVG.NONZERO_MULTIPLE.reduceAddAvg(compositeAccessorsExcZero, brandEffectivenessAccessor), 
    REDUCEAVG.NONZERO_MULTIPLE.reduceRemoveAvg(compositeAccessorsExcZero, brandEffectivenessAccessor), 
    REDUCEAVG.NONZERO_MULTIPLE.reduceInitAvg
  );

  // brand filter group for view persistence - excludes zero values during averaging
  var viewPersistenceBgFilterGroup = bgFilterDim.group().reduce(
    REDUCEAVG.NONZERO_SINGLE.reduceAddAvg(viewPersitenceAccessor, viewPersitenceAccessor), 
    REDUCEAVG.NONZERO_SINGLE.reduceRemoveAvg(viewPersitenceAccessor, viewPersitenceAccessor), 
    REDUCEAVG.NONZERO_SINGLE.reduceInitAvg
  );

  var bgFGincZeroAll; // structure to hold grouped data - multiple
  var bgFGexcZeroAll; // structure to hold grouped data - multiple
  var viewPersistenceBgFilterGroupAll; // structure to hold grouped data - view persistence
  var beTop1K; // structure to hold top 1K highest brand effectiveness values

  // TODO: delete
  this.avd = averagerDim
  this.avg = averagerGroup
  this.bfgi = bgFGincZero;
  this.bfge = bgFGexcZero;

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
    bgFGincZeroAll = bgFGincZero.all();
    bgFGexcZeroAll = bgFGexcZero.all();
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
    return _.map(bgFGincZeroAll, function(d){
      return {
        bgId: d.key, 
        value: d.value.sum.brand_effectiveness / d.value.count
      };
    });
  };

  this.getBEComponentData = function(){
    var beComponentData = _.map(bgFGincZeroAll, function(d){
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
    _.each(bgFGincZeroAll, function(d, idx, list){
      viewDuration[d.key] = d.value.sum[viewDurationAccessor];
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
    _.each(viewPersistenceBgFilterGroupAll, function(d, idx, list){
      if(_.contains(bgIds, '' + d.key)){ 
        if(d.value.count > 0){
          avgVPAcrossBgIds += d.value.sum / d.value.count;
          numOfConsideredBgIds += 1;
        }
      }
    });

    var averageViewPersitence = avgVPAcrossBgIds / numOfConsideredBgIds;
    return averageViewPersitence;
  };

  this.getTotalViewDuration = function(bgIds){
    var totalViewDuration = 0;
    _.each(bgFGincZeroAll, function(d, idx, list){
      if(_.contains(bgIds, '' + d.key)){ 
        totalViewDuration += d.value.sum[viewDurationAccessor];
      }
    });

    return totalViewDuration;
  };

  this.getHeatmapData = function(){
    // reset quadmapping
    _.each(quadMapping, function(qm){ 
      qm.value = 0;
      qm.count = 0;
    });
    // add q values for all bgIds
    _.each(bgFGexcZeroAll, function(d){
      _.each(quadMapping, function(qm){ 
        qm.value += d.value.sum[qm.q];
        // if det group is not present, do not use it for averaging
        if(d.value.sum[qm.q] > 0){ qm.count += d.value.count; }
      });
    });
    // average using count
    _.each(quadMapping, function(qm){ 
      qm.value = qm.count === 0 ? 0 : qm.value/qm.count;
    });
    return quadMapping;
  };

  this.getThumbnailData = function(bgIds){
    var thumbnailData = [];
    _.find(beTop1K, function(d, idx, list){
      if(d.extracted_frame_number > 0 && _.contains(bgIds, '' + d.det_group_id)){ 
        thumbnailData.push(d);
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
