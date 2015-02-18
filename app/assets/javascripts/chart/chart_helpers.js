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
  // Brand effectiveness helper

  // Get min/max of brand effectiveness - adjust
  // slightly so that it doesn't touch the bounds of chart
  this.getMinEffectiveness = function(beData){
    return _.max(
      [0, d3.min(beData, function(s) { 
          return d3.min(s.values, function(v) { 
            return v.brand_effectiveness - (0.1 * v.brand_effectiveness); 
          }); 
        })
      ]);
  };

  this.getMaxEffectiveness = function(beData){
    return _.min(
      [1, d3.max(beData, function(s) { 
          return d3.max(s.values, function(v) { 
            return v.brand_effectiveness + (0.1 * v.brand_effectiveness); 
          }); 
        })
      ]);
  };
  //------------------------------------------------
};
