/*------------------------------------------------
  Summary chart single
  ------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.BaseCharts = ZIGVU.Analytics.BaseCharts || {};

ZIGVU.Analytics.BaseCharts.SummaryChartSingle = function(chartDim){
  var self = this;

  var pcChartDim = chartDim;
  // div for chart
  var pc_div, divWidth, divHeight;
  function setDimensions(){
    pc_div = pcChartDim.div;
    divWidth = $(pc_div).parent().width();
    divHeight = Math.min(pcChartDim.height, divWidth);
  }
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
    innerRadius = outerRadius - 8;

    pcCenterX = width/2; pcCenterY = chartWH/2;
    textCenterY = pcCenterY;
    unitCenterY = textCenterY + parseInt(pcCenterY/2);
    labelCenterY = chartWH + parseInt(chartWH * 0.2);
  }
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
  }
  //------------------------------------------------


  //------------------------------------------------
  // repainting
  this.repaint = function(summaryData){
    var pcText = summaryData.text;
    var pcUnit = summaryData.unit;
    var pcLabel = summaryData.label;
    var pcData = summaryData.pc_data;

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
