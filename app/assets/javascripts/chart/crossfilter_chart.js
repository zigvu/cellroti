/*------------------------------------------------
	Cross filter chart scripts
	------------------------------------------------*/

// Cross filter charts are created using dc.js library
seasonsShowCrossFilterChart = function(parsedData) {

	// decompose from tuple
	var counterGameDemarcationMap = parsedData["counterGameDemarcationMap"];
	var counterGameDemarcation = parsedData["counterGameDemarcation"];
	var gameIds = parsedData["gameIds"];
	var brandGroupIds = parsedData["brandGroupIds"];
	var ndxData = parsedData["ndxData"];

	//------------------------------------------------
	/* Create ndx dimensions/groups */
	timeLogStart("ndxCreation");

	// Run the data through crossfilter
	var ndx = crossfilter(ndxData);
	//var all = ndx.groupAll();

	var counterDomain = d3.extent(ndxData, function(d) { return d.counter; });
	var counterDim = ndx.dimension(function (d) { return d.counter; });
	var counterDimGroup = counterDim.group(); // count

	var brandEffectivenessDim = ndx.dimension(function (d) { 
		return [d.counter, brandGroupIds[d.bg_id]];
	});
	var brandEffectivenessDimGroup = brandEffectivenessDim.group().reduceSum(function(d) { 
		return d.brand_effectiveness;
	});

	var brandEffectivenessCompositeAccessors = [
		'brand_group_crowding',
		'visual_saliency',
		'timing_effectiveness',
		'spatial_effectiveness'
	];
	var brandEffectivenessCompositeDim = ndx.dimension(function (d) { return d.bg_id; });
	var brandEffectivenessCompositeGroup = brandEffectivenessCompositeDim.group().reduce(
		reduceAddAvg(brandEffectivenessCompositeAccessors), 
		reduceRemoveAvg(brandEffectivenessCompositeAccessors), 
		reduceInitAvg
	);

	var detectionCountDim = ndx.dimension(function (d) { return d.bg_id; });
	var detectionCountGroup = detectionCountDim.group().reduce(
		reduceAddAvg(['detections_count']), 
		reduceRemoveAvg(['detections_count']), 
		reduceInitAvg
	);

	var viewDurationDim = ndx.dimension(function (d) { return d.bg_id; });
	var viewDurationGroup = viewDurationDim.group().reduce(
		reduceAddAvg(['view_duration']), 
		reduceRemoveAvg(['view_duration']), 
		reduceInitAvg
	);

	// color domain/range for game
	var gameColors = d3.scale.category20().domain(Object.keys(counterGameDemarcation));
	var gameColorsAccessor = function(d) { return counterGameDemarcationMap[d.key]; };

	// color domain/range for brand_group - need brandGroups indexed by IDs and name
	var brandGroupSorter = [];
	for (var key in brandGroupIds) { brandGroupSorter.push([key, brandGroupIds[key]]); }
	brandGroupSorter.sort(function(a,b){ a = a[1]; b = b[1]; return a < b ? -1 : (a > b ? 1 : 0); });
	var brandGroupIdArr = []; brandGroupNameArr = [];
	for (var i = 0; i < brandGroupSorter.length; i++){
		brandGroupIdArr.push(brandGroupSorter[i][0]);
		brandGroupNameArr.push(brandGroupSorter[i][1]);
	}

	var brandGroupIdColors = d3.scale.category10().domain(brandGroupIdArr);
	var brandGroupIdColorsAccessor = function(d) { return d.key; };
	var brandGroupNameColors = d3.scale.category10().domain(brandGroupNameArr);
	// apparently : series chart doesn't need color accessor
	// var brandGroupNameColorsAccessor = function(d) { return d.key; };

	timeLogEnd("ndxCreation", "NDX Creation");
	//------------------------------------------------

	//------------------------------------------------
	/* Chart setup */
	timeLogStart("chartSetup");

	var sc_brandEffectiveness_div = '#dc-brand-effectiveness-series-chart';
	var rc_brandEffectiveness_div = '#dc-brand-effectiveness-range-chart';
	var bc_brandCrowding_div = '#dc-brand-crowding-bar-chart';
	var bc_visualSaliency_div = '#dc-visual-saliency-bar-chart';
	var bc_timingEffectiveness_div = '#dc-timing-effectiveness-bar-chart';
	var bc_spatialEffectiveness_div = '#dc-spatial-effectiveness-bar-chart';
	var pc_viewDuration_div = '#dc-view-duration-pie-chart';
	var heatmap_div = '#d3-spatial-position-heatmap-chart';
	var pc_detectionCount_div = '#dc-brand-count-pie-chart';

	// reset buttons
	var rc_brandEffectivenessResetId = '#dc-brand-effectiveness-series-chart-reset';
	var brandEffectivenessComposite_ResetId = '#dc-brand-effectiveness-composite-reset';
	var pc_viewDurationResetId = '#dc-view-duration-pie-chart-reset';
	var pc_detectionCountResetId = '#dc-brand-count-pie-chart-reset';
	var allChartsResetId = '#brand-legend-reset-all-charts';


	// Create the dc.js chart objects & link to div
	var sc_brandEffectiveness = dc.seriesChart(sc_brandEffectiveness_div);
	var rc_brandEffectiveness = dc.barChart(rc_brandEffectiveness_div);
	var bc_brandCrowding = dc.barChart(bc_brandCrowding_div);
	var bc_visualSaliency = dc.barChart(bc_visualSaliency_div);
	var bc_timingEffectiveness = dc.barChart(bc_timingEffectiveness_div);
	var bc_spatialEffectiveness = dc.barChart(bc_spatialEffectiveness_div);
	var pc_detectionCount = dc.pieChart(pc_detectionCount_div);
	var pc_viewDuration = dc.pieChart(pc_viewDuration_div);

	var allCompositeChartArr = [
		bc_brandCrowding,
		bc_visualSaliency,
		bc_timingEffectiveness,
		bc_spatialEffectiveness
	];

	// geometry
	var sc_brandEffectiveness_width = $(sc_brandEffectiveness_div).parent().width();
	var sc_brandEffectiveness_height = 300;
	var sc_brandEffectiveness_margin = { top: 1, right: 1, bottom: 0, left: 40 };
	
	var sc_MinLabelWidthAll = 150;
	var sc_MinLabelWidthIndv = 100;

	var rc_brandEffectiveness_width = sc_brandEffectiveness_width;
	var rc_brandEffectiveness_height = 45;
	var rc_brandEffectiveness_margin = {top: 1, right: 1, bottom: 0, left: 40};

	var brandEffectivenessComposite_width = $(bc_brandCrowding_div).parent().width();
	var brandEffectivenessComposite_height = 250;
	var brandEffectivenessComposite_margins = {top: 1, right: 0, bottom: 0, left: 0};

	var pieChart_widthHeight = $(pc_detectionCount_div).parent().width();
	if (pieChart_widthHeight > 200) { pieChart_widthHeight = 200; }
	var pieChart_innerRadius = 20;


	timeLogEnd("chartSetup", "Chart setup");
	//------------------------------------------------


	//------------------------------------------------
	/* Chart helpers */

	// Redraw Y axis for composite charts
	function redrawCompositeDomainYAxis(compositeChartArr, compositeGroup) {
		maxValue = -Infinity;
		var allGroups = compositeGroup.all();
		for (var i = 0; i < allGroups.length; i++){
			for (key in allGroups[i].value.avg){
				if (allGroups[i].value.avg[key] > maxValue){
					maxValue = allGroups[i].value.avg[key];
				}
			}
		}
		domain = [0, maxValue];

		for (var i = 0; i < compositeChartArr.length; i++){
			compositeChartArr[i].y(d3.scale.linear().domain(domain));
			compositeChartArr[i].redraw();
			compositeChartArr[i].renderYAxis(compositeChartArr[i].g());
		}
	}

	var sc_brandEffectiveness_renderlet = function(_chart){
		// get min and max x positions in chart
		var xAxisStartPos = 0;
		var xAxisWidth = _chart.selectAll('.axis').filter('.x').select('path')[0][0].getBBox().width;
		var yAxisHeight = _chart.selectAll('.axis').filter('.y').select('path')[0][0].getBBox().height;

		// get brushed points in chart
		var pointsCounter = [];
		// store DOM elements in pointLabels and push counter data to pointsCounter
		var pointLabels = _chart
			.selectAll('.sub').filter('._0').select('.dc-tooltip-list')
			.select('._0').selectAll('circle')
			.each(function(d) { 
				pointsCounter.push(d.data.key[0]); 
			});

		// associate each counter point with pixel position in graph
		var sortedPointsCounter = [];
		for (var i = 0; i < pointsCounter.length; i++) {
			sortedPointsCounter.push({
				counter: pointsCounter[i],
				px: pointLabels[0][i].getAttribute('cx')
			});
		}
		// sort the HTML points in numeric order - don't rely on DOM ordering
		sortedPointsCounter = sortedPointsCounter.sort(function(a,b) {
			return a["counter"] - b["counter"];
		});

		// for brushed points, find out the labels and rect positions
		var rectStartEnd = [];
		for (var i = 0; i < sortedPointsCounter.length; i++) {
			var cnt = sortedPointsCounter[i]["counter"];
			if (counterGameDemarcation.hasOwnProperty(cnt)){
				var beginPx = -1;
				var endPx = -1;
				// data extractors
				var beginC = counterGameDemarcation[cnt]["series_counters"][0];
				var endC = counterGameDemarcation[cnt]["series_counters"][1];
				var label = counterGameDemarcation[cnt]["series_label"];
				// loop to access right positions
				for (var j = i; j < sortedPointsCounter.length; j++) {
					if (beginPx != -1 && endPx != -1){ break; }
					if (sortedPointsCounter[j]["counter"] == beginC){ 
						beginPx = sortedPointsCounter[j]["px"];
					}
					if (sortedPointsCounter[j]["counter"] == endC){
						endPx = sortedPointsCounter[j]["px"];
					}
				}
				rectStartEnd.push([beginPx, endPx, label, cnt]);
			}
		}
		// if first rect was not included, include one rect from first position
		// to the current first item in rectStartEnd
		if (rectStartEnd.length > 0 && sortedPointsCounter[0]["px"] != rectStartEnd[0][0]){
			var dmKey = counterGameDemarcationMap[sortedPointsCounter[0]["counter"]];
			var label = counterGameDemarcation[dmKey]["series_label"];
			rectStartEnd.unshift([xAxisStartPos, rectStartEnd[0][0], label, dmKey]);
		}
		// if the last rect has out-of-bounds end point, correct to last point position
		if (rectStartEnd.length > 0 && rectStartEnd[rectStartEnd.length - 1][1] == -1){
			rectStartEnd[rectStartEnd.length - 1][1] = xAxisWidth;
		}
		// if there are no rects selected, draw at least one
		if ((rectStartEnd.length == 0) && 
				(sortedPointsCounter[0] !== undefined) && 
				(sortedPointsCounter[0].length > 2)){
			var dmKey = counterGameDemarcationMap[sortedPointsCounter[0]["counter"]];
			var label = counterGameDemarcation[dmKey]["series_label"];
			rectStartEnd.push([ xAxisStartPos, xAxisWidth, label, dmKey ]);
		}

		// first remove old rectangles (if found)
		_chart.select('.stack-list').select('#bg-rects').remove();
		// create holder for new rectangles in first sub of chart
		var bgRects = _chart
			.selectAll('.sub').filter('._0').select('.stack-list')
			.append('g').attr('id','bg-rects');

		// special logic to figure out if label should be written
		var drawLabel = false;
		for (var i = 0; i < rectStartEnd.length; i++){
			// if width less than certain size, no labels
			if (+(rectStartEnd[i][1] - rectStartEnd[i][0]) > sc_MinLabelWidthAll){
				drawLabel = true;
				break;
			}
		}
		// draw rectangles for each rectStartEnd
		for (var i = 0; i < rectStartEnd.length; i++){
			var x = +rectStartEnd[i][0], y = 0;
			var width = +(rectStartEnd[i][1] - rectStartEnd[i][0]);
			var label = rectStartEnd[i][2];
			var color = gameColors(rectStartEnd[i][3]);
			var g = bgRects.append('g').attr("transform", function(d, i) { 
				return "translate(" + x + "," + y + ")";
			});
			g.append('rect').attr('width', width).attr('height', yAxisHeight).attr('fill', color);
			// don't label in too small a space
			if (drawLabel && width > sc_MinLabelWidthIndv){
				g.append('text')
					.text(label).attr('x', 5).attr('y', 15)
					.attr('text-anchor', 'left');
			}
		}
		// console.log(rectStartEnd);
	};

	// put text labels for game range chart
	var gameLabelText = function(_chart){
		var barsData = [];
		var bars = _chart.selectAll('.bar').each(function(d) { barsData.push(d); });

		//Remove old values (if found)
		d3.select(bars[0][0].parentNode).select('#inline-labels').remove();
		//Create group for labels 
		var gLabels = d3.select(bars[0][0].parentNode).append('g').attr('id','inline-labels');

		for (var i = bars[0].length - 1; i >= 0; i--) {
			var b = bars[0][i];
			if (counterGameDemarcation.hasOwnProperty(barsData[i].data.key)){
				gLabels
					.append("text")
					.text(counterGameDemarcation[barsData[i].data.key]['range_label'])
					.attr('x', +b.getAttribute('x') + (b.getAttribute('width')/2) )
					.attr('y', +b.getAttribute('y') + 20)
					.attr('text-anchor', 'left');
			}
		}
	};
	//------------------------------------------------  


	//------------------------------------------------  
	/* Brand Effectiveness */
	timeLogStart("chartsRender");

	// series chart 
	sc_brandEffectiveness
		.width(sc_brandEffectiveness_width)
		.height(sc_brandEffectiveness_height)
		.margins(sc_brandEffectiveness_margin)
		// .chart(function(c) { return dc.lineChart(c).interpolate('basis'); })  // basis
		.x(d3.scale.linear().domain(counterDomain))
		.dimension(counterDim)
		.group(brandEffectivenessDimGroup)
		.seriesAccessor(function(d) {return d.key[1];})
		.keyAccessor(function(d) {return +d.key[0];})
		.valueAccessor(function(d) {return +d.value;})
		.colors(brandGroupNameColors)
		// .colorAccessor(brandGroupNameColorsAccessor) - doesn't use this
		.rangeChart(rc_brandEffectiveness)
		.renderlet(sc_brandEffectiveness_renderlet)
		.seriesSort(d3.ascending)		
		.brushOn(false)
		.mouseZoomable(false)
		.title(function (d) {
			var gameTitle = counterGameDemarcation[counterGameDemarcationMap[d.key[0]]]["series_label"];
			var str = 
				'Game:          ' + gameTitle + '\n' + 
				'Group:         ' + d.key[1] + '\n' +
				'Effectiveness: ' + d3.format(',%')(d.value);
			return str;
		})
		.on("postRedraw", function(chart) {
			redrawCompositeDomainYAxis(
				allCompositeChartArr,
				brandEffectivenessCompositeGroup
			);
			heatmapChart.updateHeatmap();
		});

	sc_brandEffectiveness
		.elasticY(true)
		.yAxisLabel('Brand Effectiveness (%)')
		.yAxis()
		.tickFormat(function(d) {return d3.format(',%')(d); });

	sc_brandEffectiveness
		.xAxisLabel(false)
		.xAxis()
		.ticks(0);


	// range chart
	rc_brandEffectiveness
		.width(rc_brandEffectiveness_width)
		.height(rc_brandEffectiveness_height)
		.margins(rc_brandEffectiveness_margin)
		.x(d3.scale.linear().domain(counterDomain))
		.dimension(counterDim)
		.group(counterDimGroup)
		.colors(gameColors)
		.colorAccessor(gameColorsAccessor)
		.renderlet(gameLabelText)
		.valueAccessor(function(d) {return 1;})
		.brushOn(true)
		.gap(0)
		.clipPadding(10);

	// hide axis - also use hidden in CSS
	rc_brandEffectiveness
		.xAxisLabel(false)
		.xAxis().ticks(0);

	rc_brandEffectiveness
		.yAxisLabel('Game')
		.yAxis().ticks(0);

	$(rc_brandEffectivenessResetId).click(function(){
		rc_brandEffectiveness.filterAll();
		dc.redrawAll();
	});
	//------------------------------------------------

	//------------------------------------------------
	/* Brand effectiveness composite charts */

	// create all composite chart components in one go
	for(var i = 0; i < allCompositeChartArr.length; i++){
		allCompositeChartArr[i]
			.width(brandEffectivenessComposite_width)
			.height(brandEffectivenessComposite_height)
			.margins(brandEffectivenessComposite_margins)
			.x(d3.scale.ordinal().domain(brandGroupIdArr))
			.xUnits(dc.units.ordinal)
			.dimension(brandEffectivenessCompositeDim)
			.group(brandEffectivenessCompositeGroup)
			//.ordering(function(d) { console.log(d); return brandGroupIds[d.key]; }) // doesn't work!
			.colors(brandGroupIdColors)
			.colorAccessor(brandGroupIdColorsAccessor)
			.barPadding(0.1)
			.outerPadding(0.05)
			.brushOn(false)
			.elasticX(false)
			.elasticY(false)
			.xAxis().tickFormat(function(d) { return ""; });
	}

	// Brand crowding bar chart specific
	bc_brandCrowding
		.valueAccessor(function(d) { return d.value.avg['brand_group_crowding']; })
		.title(function (d) {
			return brandGroupIds[d.key] + ": " + d3.format(',%')(d.value.avg['brand_group_crowding']);
		})
		.xAxisLabel('Brand Crowding')
		.yAxisLabel('Score')
		.yAxis().tickFormat(function(d) {return d3.format(',%')(d); });

	// Visual Saliency bar chart specific
	bc_visualSaliency
		.valueAccessor(function(d) { return d.value.avg['visual_saliency']; })
		.title(function (d) {
			return brandGroupIds[d.key] + ": " + d3.format(',%')(d.value.avg['visual_saliency']);
		})
		.xAxisLabel('Visual Saliency')
		.yAxisLabel(false)
		.yAxis().tickFormat(function(d) {return ""; });

	// Timing Effectiveness bar chart specific
	bc_timingEffectiveness
		.valueAccessor(function(d) { return d.value.avg['timing_effectiveness']; })
		.title(function (d) {
			return brandGroupIds[d.key] + ": " + d3.format(',%')(d.value.avg['timing_effectiveness']);
		})
		.xAxisLabel('Timing Effectiveness')
		.yAxisLabel(false)
		.yAxis().tickFormat(function(d) {return ""; });

	// Spatial Effectiveness bar chart specific
	bc_spatialEffectiveness
		.valueAccessor(function(d) { return d.value.avg['spatial_effectiveness']; })
		.title(function (d) {
			return brandGroupIds[d.key] + ": " + d3.format(',%')(d.value.avg['spatial_effectiveness']);
		})
		.xAxisLabel('Spatial Effectiveness')
		.yAxisLabel(false)
		.yAxis().tickFormat(function(d) {return ""; });

	$(brandEffectivenessComposite_ResetId).click(function(){
		for(var i = 0; i < allCompositeChartArr.length; i++){
			allCompositeChartArr[i].filterAll();
		}
		dc.redrawAll();
	});
	//------------------------------------------------

	//------------------------------------------------
	/* Spatial position heatmap */

	var heatmapChart = new HeatmapChart(ndx, heatmap_div);

	
	//------------------------------------------------  

	//------------------------------------------------
	/* Detection Count chart */

	pc_detectionCount
		.width(pieChart_widthHeight)
		.height(pieChart_widthHeight)
		.innerRadius(pieChart_innerRadius)
		.dimension(detectionCountDim)
		.group(detectionCountGroup)
		.valueAccessor(function(d) { 
			if (d.value.avg !== undefined){ return d.value.avg['detections_count'];
			} else { return d.value; }
		})
		.colors(brandGroupIdColors)
		.colorAccessor(brandGroupIdColorsAccessor)
		.label(function(d) { return "Count: " + Math.round(d.value.avg['detections_count']);})
		.title(function (d) {
			if (d.value.avg !== undefined){
				return brandGroupIds[d.key] + ": " + Math.round(d.value.avg['detections_count']);
			} else { 
				return brandGroupIds[d.data.key] + ": " + Math.round(d.value);
			}
		});
		

	$(pc_detectionCountResetId).click(function(){
		pc_detectionCount.filterAll();
		dc.redrawAll();
	});
	//------------------------------------------------  

	//------------------------------------------------
	/* View duration chart */

	pc_viewDuration
		.width(pieChart_widthHeight)
		.height(pieChart_widthHeight)
		.innerRadius(pieChart_innerRadius)
		.dimension(viewDurationDim)
		.group(viewDurationGroup)
		.valueAccessor(function(d) { 
			if (d.value.avg !== undefined){ return d.value.avg['view_duration'];
			} else { return d.value; }
		})
		.colors(brandGroupIdColors)
		.colorAccessor(brandGroupIdColorsAccessor)
		.label(function(d) { return Math.round(d.value.avg['view_duration']) + " sec";})
		.title(function (d) {
			if (d.value.avg !== undefined){
				return brandGroupIds[d.key] + ": " + Math.round(d.value.avg['view_duration']) + " sec";
			} else { 
				return brandGroupIds[d.data.key] + ": " + Math.round(d.value) + " sec";
			}
		});
		

	$(pc_viewDurationResetId).click(function(){
		pc_viewDuration.filterAll();
		dc.redrawAll();
	});
	//------------------------------------------------  


	//------------------------------------------------
	/* Finally, render charts and update visual elements */	
	dc.renderAll();

	$(allChartsResetId).click(function(){
		dc.filterAll();
		dc.redrawAll();
	});

	timeLogEnd("chartsRender", "Chart render");	
	timeLogStart("postRender");

	// Add legend items
	for(var i = 0; i < brandGroupNameArr.length; i++){
		var li = $("<li/>");
		li.prepend(
			$("<div/>", { class: "square" })
				.css("background-color", brandGroupNameColors(brandGroupNameArr[i])));
		li.append($("<div/>", { text: brandGroupNameArr[i], class: "text" }));
		$('#brand-legend-content-ul').append(li);
	}

	// Resize divs
	$(sc_brandEffectiveness_div)
		.parent().select('.chart-content')
		.height(
			$(sc_brandEffectiveness_div).outerHeight() + 
			$(rc_brandEffectiveness_div).outerHeight()
		);

	$(bc_brandCrowding_div)
		.parent()
		.height($(bc_brandCrowding_div).outerHeight());

	// for the pie charts, use height of heatmap if that is larger
	var pcDivHeight = $(pc_detectionCount_div).outerHeight();
	if (pcDivHeight < $(heatmap_div).outerHeight()) {
		pcDivHeight = $(heatmap_div).outerHeight();
	}
	$(pc_detectionCount_div)
		.parent().select('.chart-content')
		.height(pcDivHeight);

	$(pc_viewDuration_div)
		.parent().select('.chart-content')
		.height(pcDivHeight);

	// trigger click so that all charts are updated with latest values
	//$(brandEffectivenessComposite_ResetId).trigger( "click" );

	timeLogEnd("postRender", "Post chart render");
	//------------------------------------------------

	$("#debug_dump").click(function(){
		print_filter("visualSaliencyGroup");
	});
};