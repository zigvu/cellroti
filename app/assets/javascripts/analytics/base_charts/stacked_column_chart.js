/*------------------------------------------------
  Stacked bar chart
  ------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.BaseCharts = ZIGVU.Analytics.BaseCharts || {};

ZIGVU.Analytics.BaseCharts.StackedColumnChart = function(chartImpl){
  var self = this;

  //------------------------------------------------
  // set up
  var chartCommon = new ZIGVU.Analytics.BaseCharts.ChartCommon();
  var chartHelpers = chartImpl.chartHelpers;

  function getChartDim(){ return chartImpl.getChartDim(); }
  function getChartData(){ return chartImpl.getChartData(); }
  function getGroupIds(){ return chartImpl.getGroupIds(); }
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
  // group -> this is a single column in the stacked-column chart
  // item -> this is a single stacked item in the stacked column

  var columnChartData, itemIds, groupIds;

  // modify data to help in stacking
  function initializeData(data){
    itemIds = getItemIds();
    groupIds = getGroupIds();

    // structure:
    // allData[groupId][itemId] = {value_x0, value_x1, percent}
    var allData = {};
    var groupData, itemData, newItemData, totalValueX, value_x0;
    _.each(groupIds, function(groupId){
      groupData = _.findWhere(data, {groupId: groupId});
      totalValueX = _.reduce(groupData.items, function(c, i){ return c + i.value; }, 0);

      value_x0 = 0;
      _.each(itemIds, function(itemId){
        itemData = _.findWhere(groupData.items, {itemId: itemId});
        newItemData = {
          value_x0: value_x0/totalValueX,
          value_x1: (value_x0 + itemData.value)/totalValueX,
          percent: itemData.value/totalValueX,
          groupId: groupId
        };

        allData[groupId] = allData[groupId] || {};
        allData[groupId][itemId] = _.extend(newItemData, itemData);
        value_x0 += itemData.value;
      });
    });

    // structure:
    // [{groupId: , items: [{itemId: , value:, groupId:,}, ]}, ]
    columnChartData = [];
    _.each(groupIds, function(groupId){
      var items = [];
      _.each(itemIds, function(itemId){
        itemData = allData[groupId][itemId];
        items.push(itemData);
      });
      columnChartData.push({ groupId: groupId, items: items });
    });
  }
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
  //------------------------------------------------


  //------------------------------------------------
  // set up gemoetry
  var margin = {top: 10, right: 15, bottom: 35, left: 100};
  var width, height;

  function setGeometry(){
    width = divWidth - margin.left - margin.right;
    height = divHeight - margin.top - margin.bottom;
  }
  setGeometry();

  var xAxisLabelAnchorX = 0; // margin left of x-axis for label
  var xAxisLabelAnchorY = 30; // margin bottom of x-axis for label
  var gapBetweenGroups = 0.1; // gap between groups is 10%
  var hieghtOfItemsInGroup = 0.9; // items use only 90% height within group
  //------------------------------------------------


  //------------------------------------------------
  // define axis
  var x = d3.scale.linear().range([0, width]),
      y = d3.scale.ordinal().rangeRoundBands([height, 0], gapBetweenGroups);
  function setRange(){
    x.range([0, width]);
    y.rangeRoundBands([height, 0], gapBetweenGroups);
  }

  var xAxis = d3.svg.axis().scale(x)
        .tickFormat(function(d) {return d3.format(',%')(d); })
        .orient("bottom");
  var yAxis = d3.svg.axis().scale(y).orient("left");
  //------------------------------------------------


  //------------------------------------------------
  // start drawing
  var svg = d3.select(chartDiv).append("svg")
      .attr("width", divWidth)
      .attr("height", divHeight);

  var bcSVG = svg.append("g")
      .attr("class", "stacked-column-chart")
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
    x.domain([0, 1]);
    y.domain(groupIds);
  }
  //------------------------------------------------


  //------------------------------------------------
  // draw axes
  var xAxisSVG = bcSVG.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  var xAxisLabelSVG = bcSVG.append("g")
      .attr("class", "x-axis-label")
      .attr("transform", "translate(" + (width/2 + xAxisLabelAnchorX) +
        "," + (height + xAxisLabelAnchorY)+ ")"
      );
  xAxisLabelSVG.append("text")
      .style("text-anchor", "middle")
      .text("Share Percentage")
      .attr("class", "label-text");

  var yAxisSVG = bcSVG.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  function resizeSVG(){
    svg.attr("width", divWidth).attr("height", divHeight);
    bcSVG.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    mask.attr("width", width).attr("height", height);
    maskRect
        .attr("width", width)
        .attr("height", height)
        .attr("style", 'fill:url(#pattern);');

    xAxisSVG.attr("transform", "translate(0," + height + ")");
    xAxisLabelSVG
        .attr("transform", "translate(" + (width/2 + xAxisLabelAnchorX) +
          "," + (height + xAxisLabelAnchorY)+ ")"
        );
  }
  //------------------------------------------------


  //------------------------------------------------
  // callbacks

  // repainting and loading new data
  function repaint(){
    // initialize all data for charting
    initializeData(getChartData());
    setDomains();

    // enter
    var groupSVG = allGroupSVG.selectAll(".group-svg").data(columnChartData);

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
        .attr("transform", function(d) { return "translate(0," + y(d.groupId) + ")"; });

    groupSVG.selectAll(".item-svg").select("rect")
        .attr("x", function(d) { return x(d.value_x0); })
        .attr("width", function(d) { return x(d.value_x1) - x(d.value_x0); })
      .transition()
        .duration(750)
        .attr("y", 0)
        .attr("height", y.rangeBand() * hieghtOfItemsInGroup);

    groupSVG.selectAll(".item-svg").select("title")
        .text(function (d) {
          return getItemName(d.itemId) + ": " + d3.format(',%')(d.percent);
        });

    // exit
    itemSVG.exit().remove();
    groupSVG.exit().remove();

    bcSVG.select(".x.axis").call(xAxis);
    bcSVG.select(".y.axis").transition().duration(750).call(yAxis);
    bcSVG.select(".y.axis")
        .selectAll(".tick text")
        .text(function(t){ return getGroupName(t); })
        .call(wrapText, margin.left);
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
