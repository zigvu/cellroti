/*------------------------------------------------
	Donut chart
	------------------------------------------------*/

function AllDonutCharts(ndxManager){
  new DonutChart(ndxManager, 'getDetectionsCountData', '#brand-count-pie-chart');
  new DonutChart(ndxManager, 'getViewDurationData', '#view-duration-pie-chart');
};

function DonutChart(ndxManager, ndxDataAccessMethod, chartDiv){
  //------------------------------------------------
  // set up

  // div for chart
  var pc_detectionCount_div = chartDiv;
  var divWidth = $(pc_detectionCount_div).parent().width();

  var pcData = ndxManager[ndxDataAccessMethod]();
  // var color = d3.scale.category10();
  var color = d3.scale.ordinal().range(d3.scale.category10().range());

  //------------------------------------------------
  // set up gemoetry
  var width = divWidth;
  if (width > 200) { width = 200; };
  var height = width,
      radius = Math.min(width, height) / 2,
      outerRadius = radius - 1,
      innerRadius = 20;
  //------------------------------------------------


  //------------------------------------------------
  // define layout
  var arc = d3.svg.arc()
      .outerRadius(outerRadius)
      .innerRadius(innerRadius);

  var pie = d3.layout.pie()
      .sort(function(a, b){ return d3.ascending(a.bgId, b.bgId); })
      .value(function(d) { return d.percent; });
  //------------------------------------------------


  //------------------------------------------------
  // start drawing
  var pcSVG = d3.select(pc_detectionCount_div).append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("class", "pie-chart")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var arcs = pcSVG.selectAll(".arc")
      .data(pie(pcData))
    .enter().append("g")
      .attr("class", "arc");

  arcs.append("path")
      .attr("d", arc)
      .style("fill", function(d) { return color(d.data.bgId); });

  arcs.append("text")
      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .text(function(d) { return d.data.count; });

  arcs.append("svg:title")
      .text(function (d) { return 'Brand Group Name Here' + ": " + d3.format(',%')(d.data.percent); });      
  //------------------------------------------------


  //------------------------------------------------
  // repainting and loading new data
  function repaint(){
    pcData = ndxManager[ndxDataAccessMethod]();

    arcs.data(pie(pcData));
    arcs.select("path").transition().duration(750).attr("d", arc);
    arcs.select("text")
      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
      .text(function(d) { return d.data.count; });
    arcs.select("title")
      .text(function (d) { return 'Brand Group Name Here' + ": " + d3.format(',%')(d.data.percent); });      
  };
  //------------------------------------------------


  //------------------------------------------------
  // finally, add call back to repaint charts
  ndxManager.addCallback(repaint);
  //------------------------------------------------
};
