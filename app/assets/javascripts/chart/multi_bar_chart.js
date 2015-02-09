/*------------------------------------------------
	Multi-line chart
	------------------------------------------------*/

function MultiBarChart(ndxManager, dataManager){
  //------------------------------------------------
  // set up

  // div for chart
  var bc_ComponentBarChart_div = '#component-bar-chart';
  var divWidth = $(bc_ComponentBarChart_div).parent().width();

  var bcData = ndxManager.getBEComponentData();
  var bgIds = _.pluck(ndxManager.getBEComponentData()[0].bgValues, 'bgId');
  //------------------------------------------------
  // set up gemoetry
  var margin = {top: 10, right: 20, bottom: 40, left: 50},
      width = divWidth - margin.left - margin.right, 
      height = 250 - margin.top - margin.bottom;     // 200

  // how far to the left of y-axis we want our labels to be
  var yAxisLabelAnchorX = -35;
  var gapBetweenBarsInGroup = 0.9; // gap is 10% of bar width
  //------------------------------------------------


  //------------------------------------------------
  // define axis
  var x0 = d3.scale.ordinal().rangeRoundBands([0, width], .1),
      x1 = d3.scale.ordinal(),
      y = d3.scale.linear().range([height, 0]);

  var xAxis = d3.svg.axis().scale(x0).orient("bottom"),
      yAxis = d3.svg.axis()
          .scale(y)
          .tickFormat(function(d) {return d3.format(',%')(d); })
          .orient("left");
  //------------------------------------------------


  //------------------------------------------------
  // start drawing
  var bcSVG = d3.select(bc_ComponentBarChart_div).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("class", "bar-chart")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  //------------------------------------------------


  //------------------------------------------------
  // define domains
  x0.domain(bcData.map(function(d) { return d.component; }));
  x1.domain(bgIds).rangeRoundBands([0, x0.rangeBand()]);
  y.domain([0, d3.max(bcData, function(d) { return d3.max(d.bgValues, function(d) { return d.value; }); })]);
  //------------------------------------------------


  //------------------------------------------------
  // draw bars
  var componentSVG = bcSVG.selectAll(".componentSVG")
      .data(bcData)
    .enter().append("g")
      .attr("class", "componentSVG")
      .attr("transform", function(d) { return "translate(" + x0(d.component) + ",0)"; });

  var componentBars = componentSVG.selectAll(".rect")
      .data(function(d) { return d.bgValues; });

  var componentRects = componentBars.enter().append("rect")
      .attr("class", "rect")
      .attr("width", x1.rangeBand() * gapBetweenBarsInGroup)
      .attr("x", function(d) { return x1(d.bgId); })
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return height - y(d.value); })
      .style("fill", function(d) { return dataManager.getBrandGroupColor(d.bgId); });
      
  componentRects.append("svg:title")
      .text(function (d) { 
        return dataManager.getBrandGroupName(d.bgId) + ": " + d3.format(',%')(d.value); 
      });
  //------------------------------------------------


  //------------------------------------------------
  // draw axes
  bcSVG.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .selectAll("text")
      .text(function(k){ return dataManager.getComponentBarChartLabel(k); });

  bcSVG.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "translate("+ (yAxisLabelAnchorX) +","+(height/2)+")rotate(-90)")  
      .style("text-anchor", "middle")
      .text("Score")
      .attr("class", "axis-label");
  //------------------------------------------------


  //------------------------------------------------
  // repainting and loading new data
  function repaint(){
    bcData = ndxManager.getBEComponentData();

    y.domain([0, d3.max(bcData, function(d) { return d3.max(d.bgValues, function(d) { return d.value; }); })]);

    componentSVG.data(bcData);
    componentBars.data(function(d) { return d.bgValues; });
    componentSVG.selectAll("rect")
      .transition()
        .duration(750)
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); });

    componentRects.select("title")
        .text(function (d) { return 'Brand Group Name Here' + ": " + d3.format(',%')(d.value); });

    bcSVG.select(".y.axis").transition().duration(750).call(yAxis);
  };
  //------------------------------------------------


  //------------------------------------------------
  // finally, add call back to repaint charts
  ndxManager.addCallback(repaint);
  //------------------------------------------------
};
