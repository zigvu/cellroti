/*------------------------------------------------
	Heatmap Chart
	------------------------------------------------*/

function HeatmapChart(ndxManager){
  //------------------------------------------------
  // set up

  // div for chart
	var heatmap_div = '#heatmap-chart';
  var divWidth = $(heatmap_div).parent().width();


	var quadMapping = ndxManager.getHeatmapData();
	
	var heatmapColors = [
		"#0000FF", "#0032CC", "#006599", "#009965", "#00CC32",
		"#33CB00", "#669800", "#996500", "#CB3300", "#FF0000"
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
			height = 200 - margin.top - margin.bottom,
			gridWidth = Math.floor(width / 3),
			gridHeight = Math.floor(height / 3);

	var legendStartX = width + 5,
			legendTotalHeight = height,
			legendWidth = 15,
			legendHeight = Math.round(height/(heatmapColors.length));
	//------------------------------------------------


  //------------------------------------------------
  // start drawing
	var heatmapSVG = d3.select(heatmap_div).append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
		.append("g")
      .attr("class", "heatmap-chart")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var heatmap = heatmapSVG.selectAll(".quadrant")
			.data(quadMapping, function(d){ return d.q; })
		.enter().append("rect")
			.attr("x", function(d) { return d.col * gridWidth; })
			.attr("y", function(d) { return d.row * gridHeight; })
			.attr("rx", 5).attr("ry", 5)
			.attr("class", "quadrant bordered")
			.attr("width", gridWidth)
			.attr("height", gridHeight)
			.style("fill", "blue");

	heatmap.append("title")
		.text(function(d) { return "Quadrant: " + d.name + "\nValue: " + d3.format(',%')(d.value); });

	heatmap
		.transition()
			.duration(1000)
			.style("fill", function(d) { return heatmapColorScale(d.value); });

	var legend = heatmapSVG.selectAll(".legend")
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
  	quadMapping = ndxManager.getHeatmapData();

    heatmap.data(quadMapping, function(d){ return d.q; });
    heatmap.select("title")
	    .text(function(d) { return "Quadrant: " + d.name + "\nValue: " + d3.format(',%')(d.value); });

    heatmap
    	.transition()
	    	.duration(1000)
	      .style("fill", function(d) { return heatmapColorScale(d.value); });
	};
  //------------------------------------------------


  //------------------------------------------------
  // finally, add call back to repaint charts
  ndxManager.addCallback(repaint);
  //------------------------------------------------
};
