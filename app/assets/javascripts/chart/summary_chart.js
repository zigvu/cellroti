/*------------------------------------------------
	Summary chart
	------------------------------------------------*/

function SummaryChart(chartManager){
  //------------------------------------------------
  // set up
  var chartHelpers = chartManager.chartHelpers;

  var scMediaLength = new SummaryChartSingle(chartManager.getSummaryChartDims_1());
  var scTvEquivalent = new SummaryChartSingle(chartManager.getSummaryChartDims_2());
  var scViewDuration = new SummaryChartSingle(chartManager.getSummaryChartDims_3());
  var scViewPersistence = new SummaryChartSingle(chartManager.getSummaryChartDims_4());

  //------------------------------------------------
  // data requests

  function requestDataMediaLength(){
    var totalTime = chartManager.getTotalFrameTime();
    var brushedTime = chartManager.getBrushedFrameTime();
    var readableTime = chartHelpers.getReadableTime(brushedTime);

    var pcData = [
      {id: 1, name: 'Time selected', sum: brushedTime, color: '#928F8F'},
      {id: 2, name: 'Time not selected', sum: (totalTime - brushedTime), color: '#CAC6C5'}
    ];
    pcData = pcDataCalculatePercent(pcData);
    var summaryData = {
      text: readableTime.time,
      unit: readableTime.unit,
      label: 'Media Length',
      pc_data: pcData
    };
    return summaryData;
  };

  function requestDataTvEquivalent(){
    var pcData = chartManager.getTvEquivalentDuration();
    pcData = pcDataCalculatePercent(pcData);
    pcData = pcDataAddBgIdDecorations(pcData);

    var totalTvEqTime = _.reduce(pcData, function(s, d){ return s + d.sum; }, 0);
    var readableTime = chartHelpers.getReadableTime(totalTvEqTime);

    var summaryData = {
      text: readableTime.time,
      unit: readableTime.unit,
      label: 'TV Spot',
      pc_data: pcData
    };
    return summaryData;
  };

  function requestDataViewDuration(){
    var pcData = chartManager.getViewDuration();
    pcData = pcDataCalculatePercent(pcData);
    pcData = pcDataAddBgIdDecorations(pcData);

    var totalTime = _.reduce(pcData, function(s, d){ return s + d.sum; }, 0);
    var readableTime = chartHelpers.getReadableTime(totalTime);

    var summaryData = {
      text: readableTime.time,
      unit: readableTime.unit,
      label: 'View Duration',
      pc_data: pcData
    };
    return summaryData;
  };

  function requestDataViewPersistence(){
    var pcData = chartManager.getViewPersistence();
    pcData = pcDataCalculatePercent(pcData);
    pcData = pcDataAddBgIdDecorations(pcData);

    var totalDuration = 0, nonZeroCount = 0;
    _.each(pcData, function(d){
      if(d.sum > 0){
        totalDuration += d.sum;
        nonZeroCount += 1;
      }
    });
    if(nonZeroCount == 0){ totalDuration = 0; }
    else { totalDuration = totalDuration / nonZeroCount; }
    var readableTime = chartHelpers.getReadableTime(totalDuration);

    var summaryData = {
      text: readableTime.time,
      unit: readableTime.unit,
      label: 'View Persistence',
      pc_data: pcData
    };
    return summaryData;
  };

  function pcDataAddBgIdDecorations(pcData){
    _.each(pcData, function(d){
      d.name = chartManager.getBrandGroupName(d.id);
      d.color = chartManager.getBrandGroupColor(d.id);
    });
    return pcData;
  };

  function pcDataCalculatePercent(pcData){
    var total = _.reduce(pcData, function(s, d){ return s + d.sum; }, 0)
    // prevent divide by zero
    if(total > 0){
      _.each(pcData, function(d){ d.percent = parseInt(d.sum/total * 100)/100; });
    } else {
      _.each(pcData, function(d){ d.percent = parseInt(1.0/pcData.length); });
    }
    return pcData;
  };
  //------------------------------------------------

  //------------------------------------------------
  // drawing
  function repaint(){
    scMediaLength.repaint(requestDataMediaLength());
    scTvEquivalent.repaint(requestDataTvEquivalent());
    scViewDuration.repaint(requestDataViewDuration());
    scViewPersistence.repaint(requestDataViewPersistence());
  };
  repaint();

  function resize(){
    scMediaLength.resize(chartManager.getSummaryChartDims_1());
    scTvEquivalent.resize(chartManager.getSummaryChartDims_2());
    scViewDuration.resize(chartManager.getSummaryChartDims_3());
    scViewPersistence.resize(chartManager.getSummaryChartDims_4());

    repaint();
  };
  //------------------------------------------------


  //------------------------------------------------
  // finally, add call back to repaint charts
  chartManager.addRepaintCallback(repaint);
  chartManager.addResizeCallback(resize);
  //------------------------------------------------
};

function SummaryChartSingle(chartDim){
  var pcChartDim = chartDim;
  // div for chart
  var pc_div, divWidth, divHeight;
  function setDimensions(){
    pc_div = pcChartDim['div'];
    divWidth = $(pc_div).parent().width();
    divHeight = Math.min(pcChartDim['height'], divWidth);
  };
  setDimensions();
  //------------------------------------------------


  //------------------------------------------------
  // set up gemoetry
  var margin = {top: 0, right: 0, bottom: 0, left: 0};
  var chartWH, width, height, radius, outerRadius, innerRadius;
  var pcCenterX, pcCenterY, textCenterY, unitCenterY, labelCenterY;
  function setGeometry(){
    width = divWidth - margin.left - margin.right;
    height = divHeight - margin.top - margin.bottom;

    chartWH = parseInt(height * 0.8);
    if(chartWH > 100){ chartWH = 100; }

    radius = chartWH / 2;
    outerRadius = radius - 1;
    innerRadius = outerRadius - 5;

    pcCenterX = width/2; pcCenterY = chartWH/2;
    textCenterY = pcCenterY;
    unitCenterY = chartWH - parseInt(chartWH * 0.1);
    labelCenterY = chartWH + parseInt(chartWH * 0.2);
  };
  setGeometry();
  //------------------------------------------------

  //------------------------------------------------
  // define layout
  var arc = d3.svg.arc()
      .outerRadius(outerRadius)
      .innerRadius(innerRadius);

  var pie = d3.layout.pie()
      .sort(function(a, b){ return d3.ascending(a.id, b.id); })
      .value(function(d) { return d.percent; });
  //------------------------------------------------


  //------------------------------------------------
  // start drawing
  var svg = d3.select(pc_div).append("svg")
      .attr("width", divWidth)
      .attr("height", divHeight);

  var pcSVG = svg
    .append("g")
      .attr("class", "pie-chart")
      .attr("transform", "translate(" + pcCenterX + "," + pcCenterY + ")");
  
  var pcTextsSVG = svg.append("g").attr("class", "pie-chart-texts");

  function resizeSVG(){
    arc.outerRadius(outerRadius).innerRadius(innerRadius);

    svg.attr("width", divWidth).attr("height", divHeight);
    pcSVG.attr("transform", "translate(" + pcCenterX + "," + pcCenterY + ")");
  };
  //------------------------------------------------


  //------------------------------------------------
  // repainting
  this.repaint = function(summaryData){
    var pcText = summaryData['text'];
    var pcUnit = summaryData['unit'];
    var pcLabel = summaryData['label'];
    var pcData = summaryData['pc_data'];

    var arcs = pcSVG.selectAll(".arc").data(pie(pcData));

    // enter
    var arcsSVG = arcs.enter().append("g").attr("class", "arc");
    
    arcsSVG.append("path");
    arcsSVG.append("svg:title");

    pcTextsSVG.append("text").attr("class", "pc-text").style("text-anchor", "middle");
    pcTextsSVG.append("text").attr("class", "pc-unit").style("text-anchor", "middle");
    pcTextsSVG.append("text").attr("class", "pc-label").style("text-anchor", "middle");

    // update + enter
    arcs.select("path")
      // .transition()
      //   .duration(750)
        .attr("d", arc)
        .style("fill", function(d){ return d.data.color; });
    arcs.select("title")
        .text(function (d) { return d.data.name + ": " + d3.format(',%')(d.data.percent); });

    pcTextsSVG.select(".pc-text").text(pcText)
        .attr("dy", ".35em")
        .attr("transform", "translate(" + pcCenterX + "," + textCenterY + ")");
    pcTextsSVG.select(".pc-unit").text(pcUnit)
        .attr("transform", "translate(" + pcCenterX + "," + unitCenterY + ")");
    pcTextsSVG.select(".pc-label").text(pcLabel)
        .attr("transform", "translate(" + pcCenterX + "," + labelCenterY + ")");

    // exit
    arcs.exit().remove();
  };

  this.resize = function(chartDim){
    pcChartDim = chartDim;
    setDimensions();
    setGeometry();
    resizeSVG();
  };
  //------------------------------------------------
};
