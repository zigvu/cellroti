/*------------------------------------------------
  Heatmap Chart
  ------------------------------------------------*/

function HeatmapChart(chartManager){
  //------------------------------------------------
  // set up

  // div for chart
  var spatialPositionChartDim = chartManager.getSpatialPositionChartDims();
  var heatmap_div = spatialPositionChartDim['div'];
  var divWidth = $(heatmap_div).parent().width();
  var divHeight = spatialPositionChartDim['height'];

  var quadMapping = chartManager.getHeatmapData();
  
  // need to skew heatmap red towards middle
  // python command: matplotlib.colors.rgb2hex(pylab.cm.jet(0.1))
  // var heatmapColors = [
  //   '#000080', '#0000f1', '#004dff', '#00b1ff', '#29ffce',
  //   '#7dff7a', '#ceff29', '#ffc400', '#ff6800', '#f10800'
  // ];
  var heatmapColors = [
    '#000080', '#00b1ff', '#ceff29', '#ffc400','#ff6800',
    '#ff6e6e', '#ff3e3e', '#ff0000', '#c60000', '#9c0000'
  ];
  var heatmapColorsDomain = $.map(heatmapColors, function(val, i){
    return Math.round(10 * i / (heatmapColors.length))/10;
  });
  var heatmapColorScale = d3.scale.linear().domain(heatmapColorsDomain).range(heatmapColors);
  //------------------------------------------------


  //------------------------------------------------
  // set gemoetry
  var margin = { top: 0, right: 50, bottom: 0, left: 0 },
      width = divWidth - margin.left - margin.right,
      height = divHeight - margin.top - margin.bottom,
      gridWidth = Math.floor(width / 3),
      gridHeight = Math.floor(height / 3);

  var legendStartX = width + 5,
      legendTotalHeight = height,
      legendWidth = 15,
      legendHeight = Math.round(height/(heatmapColors.length));
  //------------------------------------------------


  //------------------------------------------------
  // start drawing
  var svg = d3.select(heatmap_div).append("svg")
      .attr("viewBox", "0 0 " + divWidth + " " + divHeight)
      .attr("preserveAspectRatio", "xMidYMid");

  var heatmapSVG = svg.append("g")
      .attr("class", "heatmap-chart")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // pattern for marking selected boxes
  var defs = svg.append('defs');

  var pattern = defs.append("pattern")
      .attr("id", "pattern-mask")
      .attr("width", 40)
      .attr("height", 20)
      .attr("x", 0).attr("y", 0)
      .attr("patternUnits","userSpaceOnUse");

  pattern.append("line").attr("x1", 10).attr("y1", 0).attr("x2", 30).attr("y2", 20);
  pattern.append("line").attr("x1", -10).attr("y1", 0).attr("x2", 10).attr("y2", 20);
  pattern.append("line").attr("x1", 30).attr("y1", 0).attr("x2", 50).attr("y2", 20);

  // we define mask as a rectangle with pattern overlaid on top of quadrant
  // since creating mask for the whole SVG created cropped overlays for the
  // bottom layer quadrants
  //------------------------------------------------


  //------------------------------------------------
  // quadrants
  var quadrantSVG = heatmapSVG.append("g")
      .attr("class", "quadrant-svg")
      .selectAll(".quadrant")
      .data(quadMapping, function(d){ return d.q; });

  var heatmap = quadrantSVG.enter().append("rect")
      .attr("id", function(d){ return d.q; })
      .attr("class", "quadrant")
      .attr("x", function(d) { return d.col * gridWidth + 1; })
      .attr("y", function(d) { return d.row * gridHeight + 1; })
      .attr("width", gridWidth - 2)
      .attr("height", gridHeight - 2)
      .style("fill", "blue")
      .on("click", function(d) { handleClickOnQuadrant(d.q); });

  heatmap.append("title")
    .text(function(d) { return getQuadrantTitle(d); });

  function getQuadrantTitle(d){
    return "Quadrant: " + d.name + "\nValue: " + d3.format(',%')(d.value);
  };

  heatmap
    .transition()
      .duration(750)
      .style("fill", function(d) { return heatmapColorScale(d.value); });

  function handleClickOnQuadrant(chartType){
    chartManager.handleClickOnQuadrant(chartType);
  };

  // mask for selected quadrant
  var quadrantMask = heatmapSVG.append("rect")
      .attr("class", "quadrant-mask")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", gridWidth - 2)
      .attr("height", gridHeight - 2)
      .style("display", "none");
  var quadrantMaskTitle = quadrantMask.append("title").text("");

  // legends
  var legendSVG = heatmapSVG
    .append("g")
      .attr("class", "legend-svg");

  var legend = legendSVG.selectAll(".legend")
      .data([].concat(heatmapColorScale.domain()), function(d) { return d; })
    .enter().append("g")
      .attr("class", "legend");

  legend.append("rect")
      .attr("class", "legend")
      .attr("x", legendStartX)
      .attr("y", function(d, i) { return legendTotalHeight - legendHeight * (i+1); })
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", function(d, i) { return heatmapColors[i]; });

  legend.append("text")
      .attr("class", "legend")
      .text(function(d) { 
        if ((d * 10) % 2 == 0){ return d3.format(',%')(d); } 
        else { return ""; }
      })
      .attr("x", legendStartX + legendWidth + 2)
      .attr("y", function(d, i) { 
        return legendTotalHeight - legendHeight * i; 
      });

  // manually push 100% label
  legend.append("text")
      .attr("class", "legend")
      .text(d3.format(',%')(1))
      .attr("x", legendStartX + legendWidth + 2)
      .attr("y", legendTotalHeight - legendHeight * heatmapColors.length + 10);
  //------------------------------------------------


  //------------------------------------------------
  // repainting and loading new data
  function repaint(){
    quadMapping = chartManager.getHeatmapData();

    quadrantSVG.data(quadMapping, function(d){ return d.q; });
    heatmap.select("title")
      .text(function(d) { return "Quadrant: " + d.name + "\nValue: " + d3.format(',%')(d.value); });

    heatmap
      .transition()
        .duration(750)
        .style("fill", function(d) { return heatmapColorScale(d.value); });
  };
  //------------------------------------------------


  //------------------------------------------------
  // Get div height
  this.getOuterDivHeight = function(){ 
    return $(heatmap_div).outerHeight();
  };
  //------------------------------------------------


  //------------------------------------------------
  // callbacks
  function decorateQuadrant(chartTypeArg, bgIdsArg){
    // remove existing overlay
    quadrantMask.attr("x", 0).attr("y", 0).style("display", "none");
    quadrantMaskTitle.text("");

    // cycle through each quadrant - use dummy attr for now
    heatmap.attr("mask", function(d) {
      if(d.q == chartTypeArg){ 
        quadrantMask
            .attr("x", d.col * gridWidth + 1)
            .attr("y", d.row * gridHeight + 1)
            .attr("style", 'fill:url(#pattern-mask);');

        quadrantMaskTitle.text(getQuadrantTitle(d));
      }

      return null;
    });
  };
  //------------------------------------------------


  //------------------------------------------------
  // finally, add call back to repaint charts
  chartManager.addRepaintCallback(repaint);
  chartManager.addTimelineChartSelectionCallback(decorateQuadrant);
  //------------------------------------------------
};
