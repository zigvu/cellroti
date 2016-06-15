/*------------------------------------------------
  Calendar chart
  ------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.BaseCharts = ZIGVU.Analytics.BaseCharts || {};

ZIGVU.Analytics.BaseCharts.CalendarChart = function(chartImpl){
  //------------------------------------------------
  // set up
  var chartCommon = new ZIGVU.Analytics.BaseCharts.ChartCommon();
  var chartHelpers = chartImpl.chartHelpers;

  function getChartDim(){ return chartImpl.getChartDim(); }
  function getChartData(){ return chartImpl.getChartData(); }

  function handleClickOnBar(idx){ chartImpl.handleClickOnBar(idx); }
  chartImpl.addRepaintCallback(repaint);
  chartImpl.addResizeCallback(resize);
  //------------------------------------------------


  //------------------------------------------------
  // modify data

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
  //------------------------------------------------


  //------------------------------------------------
  // set up gemoetry
  var margin = {top: 8, right: 2, bottom: 8, left: 50};
  var width, height;
  function setGeometry(){
    width = divWidth - margin.left - margin.right;
    height = divHeight - margin.top - margin.bottom;
  }
  setGeometry();

  var pxSpaceForOneChar; // cache px mapper for label length computation
  var labelsAddPosY = 5;
  //------------------------------------------------


  //------------------------------------------------
  // define axis
  var x = d3.scale.linear().range([0, width]),
      y = d3.scale.linear().range([height, 0]);
  function setRange(){
    x.range([0, width]);
    y.range([height, 0]);
  }
  //------------------------------------------------


  //------------------------------------------------
  // start drawing
  var svg = d3.select(chartDiv).append("svg")
      .attr("width", divWidth)
      .attr("height", divHeight);

  var calSVG = svg.append("g")
      .attr("class", "cal-selection-chart")
      .attr("clip-path", "url(#cal-selection-clip)")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  //------------------------------------------------


  //------------------------------------------------
  // define domains
  function setDomains(){
    x.domain([0, 1]);
    y.domain([0, 1]);
  }
  setDomains();
  //------------------------------------------------


  //------------------------------------------------
  // draw axes

  // no axis

  function resizeSVG(){
    svg.attr("width", divWidth).attr("height", divHeight);
  }
  //------------------------------------------------


  //------------------------------------------------
  // callbacks

  // repainting and loading new data
  function repaint(){
    var chartData = getChartData();
    setDomains();

    var calBars = calSVG.selectAll(".cal-rects").data(chartData, function(d){
      return "id" + Math.floor(Math.random()*1000000001);
    });

    // enter
    var calRects = calBars.enter().append("g")
        .attr("class", function(d) {
          if(d.current){ return "cal-rects current"; }
          else { return "cal-rects"; }
        })
        .on("click", function(d) {
          if(d.enabled){ handleClickOnBar(d.idx); }
        });

    calRects.append("rect").attr("class", "rect");

    calRects.append("text")
        .attr("class", function(d) {
          if(d.enabled){ return "cal-rects-text"; }
          else { return "cal-rects-text disabled"; }
        });

    // update + enter
    calBars.select("rect")
        .attr("x", function(d) { return x(d.value_x0); })
        .attr("width", function(d) { return x(d.value_x1) - x(d.value_x0); })
        .attr("y", 0)
        .attr("height", height);

    calRects.select(".cal-rects-text")
        .attr("x", function(d) {
          return x(d.value_x0) + (x(d.value_x1) - x(d.value_x0))/2 - getWidthOfLabel(d.text)/2;
        })
        .attr("y", height/2 + labelsAddPosY)
        .text(function (d) { return d.text; });

    // exit
    calBars.exit().remove();
  }
  this.tempRepaint = function(){ repaint(); };

  function getWidthOfLabel(label){
    if (pxSpaceForOneChar === undefined){
      pxSpaceForOneChar = chartHelpers.getPxSpaceForOneChar(calSVG, "cal-selection-chart");
    }
    return pxSpaceForOneChar * label.length;
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
