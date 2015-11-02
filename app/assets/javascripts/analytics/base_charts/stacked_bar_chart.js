/*------------------------------------------------
	Stacked bar chart
	------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.BaseCharts = ZIGVU.Analytics.BaseCharts || {};

ZIGVU.Analytics.BaseCharts.StackedBarChart = function(chartImpl){
  var self = this;

  //------------------------------------------------
  // set up
  var chartCommon = new ZIGVU.Analytics.BaseCharts.ChartCommon();
  var chartHelpers = chartImpl.chartHelpers;

  function getChartDim(){ return chartImpl.getChartDim(); }
  function getChartData(){ return chartImpl.getChartData(); }
  function getGroupIds(){ return chartImpl.getGroupIds();}
  function getItemIds(){ return chartImpl.getItemIds();}
  function getGroupName(groupId){ return chartImpl.getGroupName(groupId); }
  function getItemName(itemId){ return chartImpl.getItemName(itemId); }
  function getItemColor(groupId, itemId){ return chartImpl.getItemColor(groupId, itemId); }

  function handleClickOnItem(groupId, itemId){ chartImpl.handleClickOnItem(groupId, itemId); };
  chartImpl.addRepaintCallback(repaint);
  chartImpl.addResizeCallback(resize);
  chartImpl.addTimelineChartSelectionCallback(decorateItemRect);
  //------------------------------------------------


  //------------------------------------------------
  // modify data

  // Note on terminology:
  // group -> this is a single bar in the stacked-bar chart
  // item -> this is a single stacked item in the stacked bar

  var barChartData, lineChartData, itemIds, groupIds;
  var yAxisLabelUnit = "sec", yMaxValueTotal = 0;

  // modify data to help in stacking
  function initializeData(data){
    itemIds = getItemIds();
    groupIds = getGroupIds();

    // structure:
    // allData[groupId][itemId] = {value_y0, value_y1}
    var allData = {}
    var groupData, itemData, newItemData, value_y0;
    _.each(groupIds, function(groupId){
      groupData = _.findWhere(data, {groupId: groupId});
      value_y0 = 0;
      _.each(itemIds, function(itemId){
        itemData = _.findWhere(groupData.items, {itemId: itemId});
        newItemData = { value_y0: value_y0, value_y1: value_y0 + itemData.value, groupId: groupId };

        allData[groupId] = allData[groupId] || {}
        allData[groupId][itemId] = _.extend(newItemData, itemData);
        value_y0 += itemData.value;
      });
    });

    // structure:
    // [{groupId: , items: [{itemId: , value:, groupId:,}, ]}, ]
    barChartData = [];
    _.each(groupIds, function(groupId){
      var items = [], total = 0;
      _.each(itemIds, function(itemId){
        itemData = allData[groupId][itemId];
        items.push(itemData);
        if(itemData.value_y1 > total){ total = itemData.value_y1; }
      });
      barChartData.push({ groupId: groupId, items: items, value_total: total });
    });

    yMaxValueTotal = d3.max(barChartData, function(d) { return d.value_total; });
    yAxisLabelUnit = chartHelpers.getReadableTime(yMaxValueTotal).unit;

    // structure:
    // [{groupId:, value_y1:, firstPoint:, isLabel:}, ]
    lineChartData = [];
    _.each(itemIds, function(itemId, idx, list){
      var points = [], point;
      _.each(groupIds, function(groupId){
        point = {groupId: groupId, value_y1: allData[groupId][itemId].value_y1, firstPoint: true, isLabel: false};
        points.push(point);
        point = {groupId: groupId, value_y1: allData[groupId][itemId].value_y1, firstPoint: false, isLabel: false};
        points.push(point);
      });
      // add lines for labels
      point = {groupId: -1, value_y1: ((idx + 1) * yMaxValueTotal/itemIds.length), firstPoint: true, isLabel: true};
      points.push(point);
      point = {groupId: -1, value_y1: ((idx + 1) * yMaxValueTotal/itemIds.length), firstPoint: false, isLabel: true};
      points.push(point);

      lineChartData.push(points);
    });
  };
  //------------------------------------------------

  // div for chart
  var chartDim, chartDiv, divWidth, divHeight;
  function setDimensions(){
    chartDim = getChartDim();
    chartDiv = chartDim['div'];
    divWidth = $(chartDiv).parent().width();
    divHeight = chartDim['height'];
  };
  setDimensions();
  //------------------------------------------------


  //------------------------------------------------
  // set up gemoetry
  var margin = {top: 10, right: 10, bottom: 25, left: 50};
  var width, height, legendWidth, nonLegendWidth;
  var legendMarginLeft = 5;
  function setGeometry(){
    width = divWidth - margin.left - margin.right;
    height = divHeight - margin.top - margin.bottom;
    legendWidth = d3.max([75, 0.10 * width]);
    nonLegendWidth = width - legendWidth;
  };
  setGeometry();

  var yAxisLabelAnchorX = -35; // margin left of y-axis for label
  var gapBetweenGroups = 0.1; // gap between groups is 10%
  var widthOfItemsInGroup = 0.9; // items use only 90% width within group
  //------------------------------------------------


  //------------------------------------------------
  // define axis
  var x = d3.scale.ordinal().rangeRoundBands([0, nonLegendWidth], gapBetweenGroups),
      y = d3.scale.linear().range([height, 0]);
  function setRange(){
    x.rangeRoundBands([0, nonLegendWidth], gapBetweenGroups);
    y.rangeRound([height, 0]);
  };

  var xAxis = d3.svg.axis().scale(x).orient("bottom"),
      yAxis = d3.svg.axis().scale(y).orient("left");

  // separator lines in charts
  var separatorLine = d3.svg.line()
      .interpolate("linear")
      .x(function(d) {
        if(d.isLabel){
          if(d.firstPoint){ return nonLegendWidth; }
          else { return nonLegendWidth + legendMarginLeft - 2; }
        } else {
          if(d.firstPoint){ return x(d.groupId); }
          else { return x.rangeBand() * widthOfItemsInGroup + x(d.groupId); }
        }
      })
      .y(function(d) { return y(d.value_y1); });
  //------------------------------------------------


  //------------------------------------------------
  // start drawing
  var svg = d3.select(chartDiv).append("svg")
      .attr("width", divWidth)
      .attr("height", divHeight);
  
  var bcSVG = svg.append("g")
      .attr("class", "stacked-bar-chart")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var allGroupSVG = bcSVG.append("g").attr("class", "all-group-svg");
  var allLineSVG = bcSVG.append("g").attr("class", "all-line-svg");
  var allLabelSVG = bcSVG.append("g").attr("class", "all-label-svg");

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
    x.domain(groupIds);
    y.domain([0, yMaxValueTotal]);
  };
  //------------------------------------------------


  //------------------------------------------------
  // draw axes
  var xAxisSVG = bcSVG.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
  xAxisSVG.selectAll(".tick").remove(); // remove all ticks

  var yAxisSVG = bcSVG.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  var yAxisLabelSVG = bcSVG.append("g")
      .attr("class", "y-axis-label")
      .attr("transform", "translate("+ (yAxisLabelAnchorX) +","+(height/2)+")rotate(-90)");
  yAxisLabelSVG.append("text")
      .style("text-anchor", "middle")
      .text("TIME ( )")
      .attr("class", "y-axis-label-text");

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
  };
  //------------------------------------------------


  //------------------------------------------------
  // callbacks

  // repainting and loading new data
  function repaint(){
    // initialize all data for charting
    initializeData(getChartData());
    setDomains();
    
    // enter
    var groupSVG = allGroupSVG.selectAll(".group-svg").data(barChartData);
    var separatorLines = allLineSVG.selectAll(".separator-lines").data(lineChartData);
    var labelSVG = allLabelSVG.selectAll(".label-text").data(itemIds);
    
    groupSVG.enter().append("g").attr("class", "group-svg");
    labelSVG.enter().append("text").attr("class", "label-text");

    var itemSVG = groupSVG.selectAll(".item-svg")
        .data(function(d) { return d.items; });

    var itemRect = itemSVG.enter().append("g")
        .attr("class", "item-svg")
        .on("click", function(d) { handleClickOnItem(d.groupId, d.itemId); });

    itemRect.append("rect")
        .attr("class", "rect")
        .style("fill", function(d) { return getItemColor(d.groupId, d.itemId); });
        
    itemRect.append("svg:title");

    separatorLines.enter().append("g")
        .attr("class", "separator-lines")
      .append("path")
        .attr("class", "line");

    // update + enter
    groupSVG
        .attr("transform", function(d) { return "translate(" + x(d.groupId) + ",0)"; });

    groupSVG.selectAll(".item-svg").select("rect")
        .attr("x", 0)
        .attr("width", x.rangeBand() * widthOfItemsInGroup)
      .transition()
        .duration(750)
        .attr("y", function(d) { return y(d.value_y1); })
        .attr("height", function(d) { return y(d.value_y0) - y(d.value_y1); });

    groupSVG.selectAll(".item-svg").select("title")
        .text(function (d) { 
          return getItemName(d.itemId) + ": " + 
            chartHelpers.getTimeInUnits(d.value, yAxisLabelUnit) + " " + 
            yAxisLabelUnit;
        });

    separatorLines.select("path").attr("d", function(d) { return separatorLine(d); });
    labelSVG
        .text(function(d){ return getItemName(d); })
        .attr("x", nonLegendWidth + legendMarginLeft)
        .attr("y", function(d, idx){ return y((idx + 1) * yMaxValueTotal/itemIds.length) })
        .attr("dy", 0.5)
        .call(wrapText, legendWidth - legendMarginLeft);

    // exit
    itemSVG.exit().remove();
    groupSVG.exit().remove();
    labelSVG.exit().remove();
    separatorLines.exit().remove();

    bcSVG.select(".x.axis").call(xAxis);
    bcSVG.select(".x.axis")
        .selectAll(".tick text")
        .text(function(t){ return getGroupName(t); })
        .call(wrapText, x.rangeBand());
    bcSVG.select(".y.axis").transition().duration(750).call(yAxis);
    bcSVG.select(".y.axis")
        .selectAll("text")
        .text(function(t){ return chartHelpers.getTimeInUnits(t, yAxisLabelUnit);});
    bcSVG.select(".y-axis-label-text").text("TIME (" + yAxisLabelUnit + ")");
  };

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
  };

  function resize(){
    setDimensions();
    setGeometry();
    setRange();
    resizeSVG();

    repaint();
  };
  //------------------------------------------------
};
