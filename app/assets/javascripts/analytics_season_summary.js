/*------------------------------------------------
	Begin: Analytics Season Show Javascript
	------------------------------------------------*/

$(".analytics_seasons.summary").ready(function() {
	timeLogStart("totalChartPageTime");

	// read JSON - nested to force the first call to finish prior to second call
	timeLogStart("jsonCall");
	d3.json(window.seasonLabelPath, function(error, seasonInfo) {
		d3.json(window.seasonShowPath, function(error, seasonData) {
			timeLogEnd("jsonCall", "Data download");

			timeLogStart("parseData");
			var parsedData = parseSeasonData(seasonInfo, seasonData);			
			timeLogEnd("parseData", "Parse data");

			seasonsShowCrossFilterChart(parsedData);
		
			timeLogEnd("totalChartPageTime", "Total JS time");
		});
	});
	


	// Legend Show Hide
	var explicitLogoHide = true;
	$('#brand-legend').sticky({ 
		topSpacing: 0,
		getWidthFrom: "#brand-legend-container-column"
	});

	$('#brand-legend-normal-hide').click(function(){
		$('#brand-legend-normal').hide();
		$('#brand-legend-hidden').show();
		explicitLogoHide = true;
	});

	$('#brand-legend-hidden-show').click(function(){
		$('#brand-legend-normal').show();
		$('#brand-legend-hidden').hide();
		explicitLogoHide = false;
	});

	$('#brand-legend').on('sticky-start', function() { 
		if(explicitLogoHide) {
			$('#brand-legend-normal').hide();
			$('#brand-legend-hidden').show();
		}
	});

	$('#brand-legend').on('sticky-end', function() { 
		$('#brand-legend-normal').show();
		$('#brand-legend-hidden').hide();
	});

});

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
	var all = ndx.groupAll();

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

	var heatmap_Qmapping = [
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
	
	var heatmapQaudAccessors = heatmap_Qmapping.map(function(d){return d.q});
	var heatmapDim = ndx.dimension(function (d) { return d.bg_id; });
	var heatmapGroup = heatmapDim.group().reduce(
		reduceAddAvg(heatmapQaudAccessors), 
		reduceRemoveAvg(heatmapQaudAccessors), 
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

	var heatmapColors = [
		"#0000FF", "#0032CC", "#006599", "#009965", "#00CC32",
		"#33CB00", "#669800", "#996500", "#CB3300", "#FF0000"
	];
	var heatmapColorsDomain = [];
	for (var i = 0; i < heatmapColors.length; i++){
		heatmapColorsDomain.push(Math.round(10 * i / (heatmapColors.length))/10);
	}
	heatmapColorScale = d3.scale.linear()
		.domain(heatmapColorsDomain)
		.range(heatmapColors);

	timeLogEnd("ndxCreation", "NDX Creation");
	//------------------------------------------------

	//------------------------------------------------
	/* Chart setup */
	timeLogStart("chartSetup");

	sc_brandEffectiveness_div = '#dc-brand-effectiveness-series-chart';
	rc_brandEffectiveness_div = '#dc-brand-effectiveness-range-chart';
	bc_brandCrowding_div = '#dc-brand-crowding-bar-chart';
	bc_visualSaliency_div = '#dc-visual-saliency-bar-chart';
	bc_timingEffectiveness_div = '#dc-timing-effectiveness-bar-chart';
	bc_spatialEffectiveness_div = '#dc-spatial-effectiveness-bar-chart';
	pc_viewDuration_div = '#dc-view-duration-pie-chart';
	heatmap_div = '#d3-spatial-position-heatmap-chart';
	pc_detectionCount_div = '#dc-brand-count-pie-chart';

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

	var heatmap_margin = { top: 0, right: 50, bottom: 0, left: 0 };
	var heatmap_width = $(heatmap_div).parent().width() - heatmap_margin.left - heatmap_margin.right;
	var heatmap_height = 200 - heatmap_margin.top - heatmap_margin.bottom;
	var heatmapGrid_width = Math.floor(heatmap_width / 3);
	var heatmapGrid_height = Math.floor(heatmap_height / 3);

	var heatmapLegend_startX = heatmap_width + 5;
	var heatmapLegend_totalHeight = heatmap_height;
	var heatmapLegend_width = 15;
	var heatmapLegend_height = Math.round(heatmap_height/(heatmapColors.length));

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

	// Generic averaging reduce functions
	function reduceAddAvg(attrArr) {
		return function(p,v) {
			// initialize
			if(p.count === 0){ 
				for(var i = 0; i < attrArr.length; i++){
					p.sum[attrArr[i]] = 0;
					p.avg[attrArr[i]] = 0;
				}
			}
			
			++p.count;
			for(var i = 0; i < attrArr.length; i++){
				p.sum[attrArr[i]] += v[attrArr[i]];
				p.count === 0 ? p.avg[attrArr[i]] = 0 : p.avg[attrArr[i]] = p.sum[attrArr[i]]/p.count;
			}
			return p;
		};
	}
	function reduceRemoveAvg(attrArr) {
		return function(p,v) {
			--p.count;
			for(var i = 0; i < attrArr.length; i++){
				p.sum[attrArr[i]] -= v[attrArr[i]];
				p.count === 0 ? p.avg[attrArr[i]] = 0 : p.avg[attrArr[i]] = p.sum[attrArr[i]]/p.count;
			}
			return p;
		};
	}
	function reduceInitAvg() {
		return { count:0, sum:{}, avg:{} };
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
	/* Debugging print tool for filters */
	function print_filter(filter){
		var f=eval(filter);
		if (typeof(f.length) != "undefined") {} else {}
			if (typeof(f.top) != "undefined") {
				f = f.top(Infinity);
			} else {}
			if (typeof(f.dimension) != "undefined") {
				f = f.dimension(function(d) { return "";}).top(Infinity);
			} else {}
			console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
		}
	//print_filter("brandCrowdingGroup");
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
			updateHeatmap();
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

	var d3HeatmapSVG = d3.select(heatmap_div).append("svg")
		.attr("width", heatmap_width + heatmap_margin.left + heatmap_margin.right)
		.attr("height", heatmap_height + heatmap_margin.top + heatmap_margin.bottom)
		.append("g")
		.attr("transform", "translate(" + heatmap_margin.left + "," + heatmap_margin.top + ")");

	var d3Heatmap = d3HeatmapSVG.selectAll(".quadrant")
		.data(heatmap_Qmapping, function(d){ return d.q; })
		.enter().append("rect")
		.attr("x", function(d) { return d.col * heatmapGrid_width; })
		.attr("y", function(d) { return d.row * heatmapGrid_height; })
		.attr("rx", 5).attr("ry", 5)
		.attr("class", "quadrant bordered")
		.attr("width", heatmapGrid_width)
		.attr("height", heatmapGrid_height)
		.style("fill", "blue");

	d3Heatmap.append("title").text(function(d) { 
		return "Quadrant: " + d.name + "\nValue: " + d3.format(',%')(d.value);
	});

	d3Heatmap.transition().duration(1000)
		.style("fill", function(d) { return heatmapColorScale(d.value); });

	var legend = d3HeatmapSVG.selectAll(".legend")
		.data([].concat(heatmapColorScale.domain()), function(d) { return d; })
		.enter().append("g")
		.attr("class", "legend");

	legend.append("rect")
		.attr("class", "legend")
		.attr("x", heatmapLegend_startX)
		.attr("y", function(d, i) { return heatmapLegend_totalHeight - heatmapLegend_height * (i+1); })
		.attr("width", heatmapLegend_width)
		.attr("height", heatmapLegend_height)
		.style("fill", function(d, i) { return heatmapColors[i]; });

	legend.append("text")
		.attr("class", "legend")
		.text(function(d) { 
			if ((d * 10) % 2 == 0){ return d3.format(',%')(d); } 
			else { return ""; }
		})
		.attr("x", heatmapLegend_startX + heatmapLegend_width + 2)
		.attr("y", function(d, i) { 
			return heatmapLegend_totalHeight - heatmapLegend_height * i; 
		});

	// manually push 100%
	legend.append("text")
		.attr("class", "legend")
		.text(d3.format(',%')(1))
		.attr("x", heatmapLegend_startX + heatmapLegend_width + 2)
		.attr("y", heatmapLegend_totalHeight - heatmapLegend_height * heatmapColors.length + 10);

	var updateHeatmap = function() {
		// create dict to hold avg values
		var qValueAvgSumAcrossKeys = {}
		for(var i = 0; i < heatmapQaudAccessors.length; i++){
			qValueAvgSumAcrossKeys[heatmapQaudAccessors[i]] = 0;
		}
		// add avg values across all brand groups
		var heatmapGroupAll = heatmapGroup.all();
		var numKeysWithNonZeroCount = 0;
		for(var i = 0; i < heatmapGroupAll.length; i++){
			for(k in heatmapGroupAll[i].value.avg){
				qValueAvgSumAcrossKeys[k] += heatmapGroupAll[i].value.avg[k];
			}
			if (heatmapGroupAll[i].value.count > 0){ numKeysWithNonZeroCount++; }
		}
		// reset value for heat map
		for(var i = 0; i < heatmap_Qmapping.length; i++){
			if (numKeysWithNonZeroCount > 0){
				heatmap_Qmapping[i].value = qValueAvgSumAcrossKeys[
					heatmap_Qmapping[i].q]/numKeysWithNonZeroCount;
			} else {
				heatmap_Qmapping[i].value = 0;
			}
		}

    d3Heatmap.data(heatmap_Qmapping, function(d){ return d.q; });
    d3Heatmap.select("title").text(function(d) { 
      return "Quadrant: " + d.name + "\nValue: " + d3.format(',%')(d.value);
    });
    d3Heatmap.transition().duration(1000)
      .style("fill", function(d) { return heatmapColorScale(d.value); });
	};
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