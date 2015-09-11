/*------------------------------------------------
	Chart Helpers
	------------------------------------------------*/

function ChartHelpers(){
  // shared data structures
  this.quadMapping = [
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

  this.componentBarChartLabels = {
    'brand_group_crowding': 'Brand Group Crowding',
    'visual_saliency': 'Visual Saliency',
    'timing_effectiveness': 'Timing Effectiveness',
    'spatial_effectiveness': 'Spatial Effectiveness'    
  };
  this.getComponentBarChartLabel = function(compKey){ return this.componentBarChartLabels[compKey]; };

  this.tableHeadLabels = [
    {'game_id': 'Game'},                             // get name from id
    {'det_group_id': 'Brand Group'},                 // get name from id
    {'detections_count': 'Brand Count'},             // get name from id
    {'view_duration': 'View Duration'},              // get name from id
    {'brand_effectiveness': 'Brand Effectiveness'}   // get name from id
  ];
  this.tableKeys = _.flatten(_.map(this.tableHeadLabels, function(k){ return _.keys(k); }));
  this.tableColLabels = _.flatten(_.map(this.tableHeadLabels, function(k){ return _.values(k); }));


  // thumbnail viewer ids for modal
  this.thumbnailModalIds = [
    'thumbnail_li_0_reveal', 'thumbnail_li_1_reveal', 
    'thumbnail_li_2_reveal', 'thumbnail_li_3_reveal' 
  ];
  //------------------------------------------------
  // coerce to number
  this.coercer = function(dataKeys, arr){
    var d = new Object();
    dataKeys.forEach(function(k, i, list){ 
      d[k] = +arr[i];
    });
    return d;
  };
  //------------------------------------------------


  //------------------------------------------------
  // text processing

  // get text label based on width of container and
  // amount of space per character
  this.ellipsis = function(label, pxContainerLength, pxSpaceForOneChar){
    var retLabel = label.substring(0, parseInt(pxContainerLength/pxSpaceForOneChar));
    // if truncated, show ellipsis
    if (retLabel.length != label.length){
      retLabel = retLabel.substring(0, retLabel.length - 4) + "...";
      // if less than 5 characters, show nothing
      retLabel = retLabel.length <= 5 ? "" : retLabel;
    }
    return retLabel;
  };

  this.getPxSpaceForOneChar = function(svgObj, objCSSClass){
    var textFW = "abcdefghijklmnopqrstuvdxyz";
    // get width of characters in SVG
    var textForWidth = svgObj.selectAll(".textForWidth")
        .data([textFW])
      .enter().append("text")
        .attr("id", "textForWidth")
        .attr("class", objCSSClass)
        .attr("x", 0)
        .text(function(d) { return d; });
    var pxSpaceForOneChar = textForWidth.node().getComputedTextLength()/textFW.length;
    svgObj.selectAll("#textForWidth").remove();
    return pxSpaceForOneChar;
  };
  //------------------------------------------------

  //------------------------------------------------
  // Timeline chart helper

  // Get min/max of timeline chart data type - adjust
  // slightly so that it doesn't touch the bounds of chart
  this.getMinTimelineChartValue = function(timelineChartData, timelineChartType){
    return _.max(
      [0, d3.min(timelineChartData, function(s) { 
          return d3.min(s.values, function(v) { 
            return v[timelineChartType] - (0.1 * v[timelineChartType]);
          }); 
        })
      ]);
  };

  this.getMaxTimelineChartValue = function(timelineChartData, timelineChartType){
    return _.min(
      [1, d3.max(timelineChartData, function(s) { 
          return d3.max(s.values, function(v) { 
            return v[timelineChartType] + (0.1 * v[timelineChartType]); 
          }); 
        })
      ]);
  };

  this.getReadableBrushedTime = function(brushedTimes){
    var timeInMS = _.reduce(brushedTimes, function(total, d){ 
      return total + d.end_time - d.begin_time; 
    }, 0);
    var readableTime = this.getReadableTime(timeInMS);

    return { 
      time: Math.round(readableTime.time * 10)/10, 
      unit: readableTime.unit,
      num_games: brushedTimes.length 
    };
  };

  this.timeFormatter_yrs = d3.time.format("%B:%Y");        // 2011:Feb
  this.timeFormatter_days = d3.time.format("%d:%H");       // 06:3
  this.timeFormatter_hrs = d3.time.format("%H:%M");        // 4:03
  this.timeFormatter_min = d3.time.format("%M:%S");        // 3:05
  this.timeFormatter_sec = d3.time.format("%S.%L");        // 3.032
  this.getReadableTime = function(timeInMS){
    var seconds = timeInMS/1000;
    var numyears = Math.floor(seconds / 31536000);
    var numdays = Math.floor((seconds % 31536000) / 86400); 
    var numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
    var numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
    var numseconds = (((seconds % 31536000) % 86400) % 3600) % 60;

    var time, unit, formatter;
    if(numyears != 0){
      time = numyears + (numdays/365);
      unit = "yrs";
      unit_chart = "year:month";
      formatter = this.timeFormatter_yrs;
    } else if (numdays != 0){
      time = numdays + (numhours/24);
      unit = "days";
      unit_chart = "day:hour";
      formatter = this.timeFormatter_days;
    } else if (numhours != 0){
      time = numhours + (numminutes/60);
      unit = "hrs";
      unit_chart = "hour:min";
      formatter = this.timeFormatter_hrs;
    } else if (numminutes != 0){
      time = numminutes + (numseconds/60);
      unit = "min";
      unit_chart = "min:sec";
      formatter = this.timeFormatter_min;
    } else {
      time = numseconds;
      unit = "sec";
      unit_chart = "sec.msec";
      formatter = this.timeFormatter_sec;
    }

    return { 
      time: Math.round(time * 10)/10, 
      unit: unit,
      unit_chart: unit_chart,
      formatter: formatter
    };
  };

  this.getReadableCount = function(count){
    var millions = Math.floor(count/1000000);
    var thousands = Math.floor((count % 1000000) / 1000);
    var units = Math.floor(((count % 1000000) % 1000) / 1);
    
    // limit to total of 5 characters including decimal
    var number, unit;
    if(millions != 0){
      number = millions + Math.round(10 * (thousands/1000))/10;
      unit = "M";
    } else if (thousands != 0){
      number = thousands + Math.round(10 * (units/1000))/10;
      unit = "K";
    } else {
      number = units;
      unit = "";
    }
    // limit to 4 characters total
    if ((number + "").length > 4){ number = Math.round(number); }

    return {
      number: number,
      unit: unit
    };
  };

  //------------------------------------------------
};
