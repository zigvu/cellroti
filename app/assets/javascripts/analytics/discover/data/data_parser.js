/*------------------------------------------------
  Data Parser
  ------------------------------------------------*/
/*
// Data Hash structure

{
  Discover Data:
  ------------------------------------------------------------------------------
  brand_group_data_keys: [
    :date, :kheer_stream_id, :det_group_id,
    :brand_effectiveness, :brand_group_crowding, :visual_saliency,
    :timing_effectiveness, :spatial_effectiveness, :view_duration,
    :view_persistence, :q0, :q1, :q2, :q3, :q4, :q5, :q6, :q7, :q8
  ],
  events: [{date:, name:,}, ]
  ndx_data: [
    [array of values according to brand_group_data_keys],
  ]


  Summary Data:
  ------------------------------------------------------------------------------
  dates: look at filterStore for details
  event_map: {id: :name, }
  brand_group_map: {id: :name, }
  stream_map: {kheer_stream_id: :name, }
}
*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.Discover.Data = ZIGVU.Analytics.Discover.Data || {};

ZIGVU.Analytics.Discover.Data.DataParser = function() {
  var self = this;

  //------------------------------------------------
  // ndx data

  // coerce to number
  function ndxCoercer(dataKeys, arr){
    var d = {};
    dataKeys.forEach(function(k, i, list){
      if(k == 'date'){ d[k] = new Date(1000.0 * arr[i]); }
      else { d[k] = +arr[i]; }
    });
    return d;
  }

  this.getDiscoverData = function(chartData){
    var dataKeys = chartData.brand_group_data_keys;
    // parse ndxData
    var ndxData = [];
    _.each(chartData.ndx_data, function(dataArr){
      ndxData.push(ndxCoercer(dataKeys, dataArr));
    });
    chartData.ndx_data = ndxData;

    // convert dates
    _.each(chartData.events, function(ev){
      ev.date = new Date(ev.date);
    });

    return chartData;
  };

  //------------------------------------------------
  // parse summary data
  this.getSummaryData = function(summaryData){
    _.each(summaryData.dates, function(v, k, list){
      summaryData.dates[k] = new Date(1000.0 * v);
    });
    return summaryData;
  };
};
