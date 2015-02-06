/*------------------------------------------------
	Heatmap Chart
	------------------------------------------------*/

function HeatmapChart_dcjs(parsedData){
	timeLogStart("HeatmapChart");

	//------------------------------------------------
	// set groups

	var quadMapping = [
		{q: 'q0', name: 'Left Top', row: 0, col: 0, value: 0},
		{q: 'q1', name: 'Center Top', row: 0, col: 1, value: 0},
		{q: 'q2', name: 'Right Top', row: 0, col: 2, value: 0},
		{q: 'q3', name: 'Left Center', row: 1, col: 0, value: 0},
		{q: 'q4', name: 'Center', row: 1, col: 1, value: 0},
		{q: 'q5', name: 'Right Center', row: 1, col: 2, value: 0},
		{q: 'q6', name: 'Left Bottom', row: 2, col: 0, value: 0},
		{q: 'q7', name: 'Center Bottom', row: 2, col: 1, value: 0},
		{q: 'q8', name: 'Right Bottom', row: 2, col: 2, value: 0}
	];
	
	var qaudAccessors = quadMapping.map(function(d){ return d.q; });
	var heatmapDim = parsedData.ndx.dimension(function (d) { return d.bg_id; });
	var heatmapGroup = heatmapDim.group().reduce(
		REDUCEAVG.MULTIPLE.reduceAddAvg(qaudAccessors), 
		REDUCEAVG.MULTIPLE.reduceRemoveAvg(qaudAccessors), 
		REDUCEAVG.MULTIPLE.reduceInitAvg
	);

	//------------------------------------------------
	// set colors

	var heatmapColors = [
		"#0000FF", "#0032CC", "#006599", "#009965", "#00CC32",
		"#33CB00", "#669800", "#996500", "#CB3300", "#FF0000"
	];
	var heatmapColorsDomain = $.map(heatmapColors, function(val, i){
		return Math.round(10 * i / (heatmapColors.length))/10;
	});

	var heatmapColorScale = d3.scale.linear()
		.domain(heatmapColorsDomain)
		.range(heatmapColors);

	//------------------------------------------------
	// set gemoetry
	var heatmap_div = '#d3-spatial-position-heatmap-chart';

	var margin = { top: 0, right: 50, bottom: 0, left: 0 };
	var width = $(heatmap_div).parent().width() - margin.left - margin.right;
	var height = 200 - margin.top - margin.bottom;
	var gridWidth = Math.floor(width / 3);
	var gridHeight = Math.floor(height / 3);

	var legendStartX = width + 5;
	var legendTotalHeight = height;
	var legendWidth = 15;
	var legendHeight = Math.round(height/(heatmapColors.length));

	this.getOuterDivHeight = function(){ return $(heatmap_div).outerHeight(); };

	//------------------------------------------------
	// create elems

	var svg = d3.select(heatmap_div).append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var heatmap = svg.selectAll(".quadrant")
		.data(quadMapping, function(d){ return d.q; })
		.enter().append("rect")
		.attr("x", function(d) { return d.col * gridWidth; })
		.attr("y", function(d) { return d.row * gridHeight; })
		.attr("rx", 5).attr("ry", 5)
		.attr("class", "quadrant bordered")
		.attr("width", gridWidth)
		.attr("height", gridHeight)
		.style("fill", "blue");

	heatmap.append("title").text(function(d) { 
		return "Quadrant: " + d.name + "\nValue: " + d3.format(',%')(d.value);
	});

	heatmap.transition().duration(1000)
		.style("fill", function(d) { return heatmapColorScale(d.value); });

	var legend = svg.selectAll(".legend")
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
	// update heatmap

	this.updateHeatmap = function() {
		// create dict to hold avg values
		var avgSumAcrossKeys = {}
		for(var i = 0; i < qaudAccessors.length; i++){
			avgSumAcrossKeys[qaudAccessors[i]] = 0;
		}
		// add avg values across all brand groups
		var heatmapGroupAll = heatmapGroup.all();
		var numKeysWithNonZeroCount = 0;
		for(var i = 0; i < heatmapGroupAll.length; i++){
			for(k in heatmapGroupAll[i].value.avg){
				avgSumAcrossKeys[k] += heatmapGroupAll[i].value.avg[k];
			}
			if (heatmapGroupAll[i].value.count > 0){ numKeysWithNonZeroCount++; }
		}
		// reset value for heat map
		for(var i = 0; i < quadMapping.length; i++){
			if (numKeysWithNonZeroCount > 0){
				quadMapping[i].value = avgSumAcrossKeys[quadMapping[i].q]/numKeysWithNonZeroCount;
			} else {
				quadMapping[i].value = 0;
			}
		}

    heatmap.data(quadMapping, function(d){ return d.q; });
    heatmap.select("title").text(function(d) { 
      return "Quadrant: " + d.name + "\nValue: " + d3.format(',%')(d.value);
    });
    heatmap.transition().duration(1000)
      .style("fill", function(d) { return heatmapColorScale(d.value); });
	};

	timeLogEnd("HeatmapChart", "HeatmapChart Creation");
};

//------------------------------------------------  
