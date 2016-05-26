/*------------------------------------------------
  Multi bar chart
  ------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.BaseCharts = ZIGVU.Analytics.BaseCharts || {};

ZIGVU.Analytics.BaseCharts.MultiBarChart = function(chartImpl){
  //------------------------------------------------
  // set up
  var chartCommon = new ZIGVU.Analytics.BaseCharts.ChartCommon();
  var chartHelpers = chartImpl.chartHelpers;

  function getChartDim(){ return chartImpl.getChartDim(); }
  function getChartData(){ return chartImpl.getChartData(); }
  function getItemIds(){ return chartImpl.getItemIds(); }
  function getGroupName(groupId){ return chartImpl.getGroupName(groupId); }
  function getItemName(itemId){ return chartImpl.getItemName(itemId); }
  function getItemColor(itemId){ return chartImpl.getItemColor(itemId); }

  function handleClickOnItem(groupId, itemId){ chartImpl.handleClickOnItem(groupId, itemId); }
  chartImpl.addRepaintCallback(repaint);
  chartImpl.addResizeCallback(resize);
  chartImpl.addTimelineChartSelectionCallback(decorateItemRect);
  //------------------------------------------------


  //------------------------------------------------
  // modify data

  // Note on terminology:
  // group -> this is a collection of items
  // item -> this is a single bar in the multi-bar chart

  // no modification necessary

  //------------------------------------------------

  // div for chart
  var chartDim, chartDiv, divWidth, divHeight;
  function setDimensions(){
    chartDim = getChartDim();
    chartDiv = chartDim.div;
    divWidth = $(chartDiv).parent().width();
    divHeight = chartDim.height;
  }
  setDimensions();

  var chartData, itemIds;
  //------------------------------------------------


  //------------------------------------------------
  // set up gemoetry
  var margin = {top: 10, right: 10, bottom: 25, left: 50};
  var width, height;
  function setGeometry(){
    width = divWidth - margin.left - margin.right;
    height = divHeight - margin.top - margin.bottom;
  }
  setGeometry();

  var yAxisLabelAnchorX = -35; // margin left of y-axis for label
  var gapBetweenGroups = 0.1; // gap between groups is 10%
  var widthOfItemsInGroup = 0.9; // items use only 90% width within group
  //------------------------------------------------


  //------------------------------------------------
  // define axis
  var x0 = d3.scale.ordinal().rangeRoundBands([0, width], gapBetweenGroups),
      x1 = d3.scale.ordinal(),
      y = d3.scale.linear().range([height, 0]);
  function setRange(){
    x0.rangeRoundBands([0, width], gapBetweenGroups);
    y.range([height, 0]);
  }

  var xAxis = d3.svg.axis().scale(x0).orient("bottom"),
      yAxis = d3.svg.axis()
          .scale(y)
          .tickFormat(function(d) {return d3.format(',%')(d); })
          .orient("left");
  //------------------------------------------------


  //------------------------------------------------
  // start drawing
  var svg = d3.select(chartDiv).append("svg")
      .attr("width", divWidth)
      .attr("height", divHeight);

  var bcSVG = svg.append("g")
      .attr("class", "multi-bar-chart")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var allGroupSVG = bcSVG.append("g").attr("class", "all-group-svg");

  // pattern for marking selected boxes
  var defs = svg.append('defs');

  var pattern = defs.append("pattern")
      .attr("id", "pattern")
      .attr("width", 40)
      .attr("height", 20)
      .attr("x", 0).attr("y", 0)
      .attr("patternUnits","userSpaceOnUse");

  pattern.append("line").attr("x1", 10).attr("y1", 0).attr("x2", 30).attr("y2", 20);
  pattern.append("line").attr("x1", -10).attr("y1", 0).attr("x2", 10).attr("y2", 20);
  pattern.append("line").attr("x1", 30).attr("y1", 0).attr("x2", 50).attr("y2", 20);

  var mask = defs.append("mask")
      .attr("id","mask")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height);
  var maskRect = mask.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("style", 'fill:url(#pattern);');
  //------------------------------------------------


  //------------------------------------------------
  // define domains
  function setDomains(){
    x0.domain(chartData.map(function(d) { return d.groupId; }));
    x1.domain(itemIds).rangeRoundBands([0, x0.rangeBand()]);
    y.domain([0, d3.max(chartData, function(d) { return d3.max(d.items, function(d) { return d.value; }); })]);
  }
  //------------------------------------------------


  //------------------------------------------------
  // draw axes
  var xAxisSVG = bcSVG.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  var yAxisSVG = bcSVG.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  var yAxisLabelSVG = bcSVG.append("g")
      .attr("class", "y-axis-label")
      .attr("transform", "translate("+ (yAxisLabelAnchorX) +","+(height/2)+")rotate(-90)");
  yAxisLabelSVG.append("text")
      .style("text-anchor", "middle")
      .text("Score")
      .attr("class", "axis-label")
      .attr("id", "y-axis-label-text");

  function resizeSVG(){
    svg.attr("width", divWidth).attr("height", divHeight);
    bcSVG.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    mask.attr("width", width).attr("height", height);
    maskRect
        .attr("width", width)
        .attr("height", height)
        .attr("style", 'fill:url(#pattern);');

    xAxisSVG.attr("transform", "translate(0," + height + ")");
    yAxisLabelSVG.attr("transform", "translate("+ (yAxisLabelAnchorX) +","+(height/2)+")rotate(-90)");
  }
  //------------------------------------------------


  //------------------------------------------------
  // callbacks

  // repainting and loading new data
  function repaint(){
    chartData = getChartData();
    itemIds = getItemIds();
    setDomains();

    // enter
    var groupSVG = allGroupSVG.selectAll(".group-svg").data(chartData);

    groupSVG.enter().append("g").attr("class", "group-svg");

    var itemSVG = groupSVG.selectAll(".item-svg")
        .data(function(d) { return d.items; });

    var itemRect = itemSVG.enter().append("g")
        .attr("class", "item-svg")
        .on("click", function(d) { handleClickOnItem(d.groupId, d.itemId); });

    itemRect.append("rect")
        .attr("class", "rect")
        .style("fill", function(d) { return getItemColor(d.itemId); });

    itemRect.append("svg:title");

    // update + enter
    groupSVG
        .attr("transform", function(d) { return "translate(" + x0(d.groupId) + ",0)"; });

    groupSVG.selectAll(".item-svg").select("rect")
        .attr("x", function(d) { return x1(d.itemId); })
        .attr("width", x1.rangeBand() * widthOfItemsInGroup)
      .transition()
        .duration(750)
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); });

    groupSVG.selectAll(".item-svg").select("title")
        .text(function (d) {
          return getItemName(d.itemId) + ": " + d3.format(',%')(d.value);
        });

    // exit
    itemSVG.exit().remove();
    groupSVG.exit().remove();

    bcSVG.select(".x.axis").call(xAxis);
    bcSVG.select(".x.axis")
        .selectAll("text")
        .text(function(groupId){ return getGroupName(groupId); })
        .attr("class", "axis-label")
        .call(wrapText, x0.rangeBand());

    bcSVG.select(".y.axis").transition().duration(750).call(yAxis);
  }

  function wrapText(svgText, width){
    chartCommon.wrapText(svgText, width);
  }

  function decorateItemRect(groupIdArg, itemIdsArg){
    allGroupSVG.selectAll(".group-svg").selectAll(".item-svg").select("rect")
        .attr("mask", function(d) {
          if(d.groupId == groupIdArg && d.itemId == itemIdsArg[0]){
            return 'url(#mask)';
          } else { return null; }
        });
  }

  function resize(){
    setDimensions();
    setGeometry();
    setRange();
    resizeSVG();

    repaint();
  }
  //------------------------------------------------
};
