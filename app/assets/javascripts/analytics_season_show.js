/*------------------------------------------------
	Begin: Analytics Season Show Javascript
	------------------------------------------------*/

$(".analytics_seasons.show").ready(function() {
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
	
	$("#static-brand-legend").sticky({ topSpacing: 0 });

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

	var gameDim = ndx.dimension(function (d) { return d.game_id; });
	var gameDimGroup = gameDim.group().reduceSum(function(d) { 
		return d.counter;
	});

	var brandEffectivenessDim = ndx.dimension(function (d) { 
		return [d.counter, brandGroupIds[d.bg_id]];
	});
	var brandEffectivenessDimGroup = brandEffectivenessDim.group().reduceSum(function(d) { 
		return d.brand_effectiveness;
	});

	var brandCrowdingDim = ndx.dimension(function (d) { return d.bg_id; });
	var brandCrowdingGroup = brandCrowdingDim.group().reduce(
		reduceAddAvg('brand_group_crowding'), 
		reduceRemoveAvg('brand_group_crowding'), 
		reduceInitAvg
	);

	var visualSaliencyDim = ndx.dimension(function (d) { return d.bg_id; });
	var visualSaliencyGroup = visualSaliencyDim.group().reduce(
		reduceAddAvg('visual_saliency'), 
		reduceRemoveAvg('visual_saliency'), 
		reduceInitAvg
	);

	var timingEffectivenessDim = ndx.dimension(function (d) { return d.bg_id; });
	var timingEffectivenessGroup = timingEffectivenessDim.group().reduce(
		reduceAddAvg('timing_effectiveness'), 
		reduceRemoveAvg('timing_effectiveness'), 
		reduceInitAvg
	);

	var spatialEffectivenessDim = ndx.dimension(function (d) { return d.bg_id; });
	var spatialEffectivenessGroup = spatialEffectivenessDim.group().reduce(
		reduceAddAvg('spatial_effectiveness'), 
		reduceRemoveAvg('spatial_effectiveness'), 
		reduceInitAvg
	);

	var viewDurationDim = ndx.dimension(function (d) { return d.bg_id; });
	var viewDurationGroup = viewDurationDim.group().reduce(
		reduceAddAvg('view_duration'), 
		reduceRemoveAvg('view_duration'), 
		reduceInitAvg
	);

	var detectionCountDim = ndx.dimension(function (d) { return d.bg_id; });
	var detectionCountGroup = detectionCountDim.group().reduce(
		reduceAddAvg('detections_count'), 
		reduceRemoveAvg('detections_count'), 
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

	sc_brandEffectiveness_div = '#dc-brand-effectiveness-series-chart';
	rc_brandEffectiveness_div = '#dc-brand-effectiveness-range-chart';
	bc_brandCrowding_div = '#dc-brand-crowding-bar-chart';
	bc_visualSaliency_div = '#dc-visual-saliency-bar-chart';
	bc_timingEffectiveness_div = '#dc-timing-effectiveness-bar-chart';
	bc_spatialEffectiveness_div = '#dc-spatial-effectiveness-bar-chart';
	pc_viewDuration_div = '#dc-brand-duration-pie-chart';
	pc_detectionCount_div = '#dc-brand-count-pie-chart';

	// reset buttons
	var rc_brandEffectivenessResetId = '#dc-brand-effectiveness-series-chart-reset';
	var bc_brandCrowdingResetId = '#dc-brand-crowding-bar-chart-reset';
	var bc_visualSaliencyResetId = '#dc-visual-saliency-bar-chart-reset';
	var bc_timingEffectivenessResetId = '#dc-timing-effectiveness-bar-chart-reset';
	var bc_spatialEffectivenessResetId = '#dc-spatial-effectiveness-bar-chart-reset';
	var pc_viewDurationResetId = '#dc-brand-duration-pie-chart-reset';
	var pc_detectionCountResetId = '#dc-brand-count-pie-chart-reset';


	// Create the dc.js chart objects & link to div
	var sc_brandEffectiveness = dc.seriesChart(sc_brandEffectiveness_div);
	var rc_brandEffectiveness = dc.barChart(rc_brandEffectiveness_div);
	var bc_brandCrowding = dc.barChart(bc_brandCrowding_div);
	var bc_visualSaliency = dc.barChart(bc_visualSaliency_div);
	var bc_timingEffectiveness = dc.barChart(bc_timingEffectiveness_div);
	var bc_spatialEffectiveness = dc.barChart(bc_spatialEffectiveness_div);
	//var pc_viewDuration = dc.pieChart(pc_viewDuration_div);
	var pc_detectionCount = dc.pieChart(pc_detectionCount_div);

	// geometry
	//var sc_brandEffectiveness_width = 896;
	var sc_brandEffectiveness_width = 674;
	var sc_brandEffectiveness_height = 300;
	
	var sc_LabelTitleText = "Brand Groups";
	// var sc_brandEffectiveness_labelWidth = 140;
	// var sc_brandEffectiveness_labelStartX = 
	// 	sc_brandEffectiveness_width - sc_brandEffectiveness_labelWidth;
	// var sc_brandEffectiveness_labelStartY = 30;
	// var sc_brandEffectiveness_margin = {
	// 	top: 1, right: sc_brandEffectiveness_labelWidth + 10, 
	// 	bottom: 0, left: 40
	// };

	var sc_brandEffectiveness_margin = { top: 1, right: 1, bottom: 0, left: 40 };

	var sc_MinLabelWidthAll = 150;
	var sc_MinLabelWidthIndv = 100;

	var rc_brandEffectiveness_width = sc_brandEffectiveness_width;
	var rc_brandEffectiveness_height = 45;
	//var rc_brandEffectiveness_margin = {top: 1, right: 150, bottom: 0, left: 40};
	var rc_brandEffectiveness_margin = {top: 1, right: 1, bottom: 0, left: 40};

	var half_width = 412;
	var half_height = 200;
	var half_margins = {top: 1, right: 1, bottom: 40, left: 40};

	timeLogEnd("chartSetup", "Chart setup");
	//------------------------------------------------


	//------------------------------------------------
	/* Chart helpers */

	// Generic averaging reduce functions
	function reduceAddAvg(attr) {
		return function(p,v) {
			++p.count;
			p.sum += v[attr];
			p.count === 0 ? p.avg = 0 : p.avg = p.sum/p.count;
			return p;
		};
	}
	function reduceRemoveAvg(attr) {
		return function(p,v) {
			--p.count;
			p.sum -= v[attr];
			p.count === 0 ? p.avg = 0 : p.avg = p.sum/p.count;
			return p;
		};
	}
	function reduceInitAvg() {
		return { count:0, sum:0, avg:0 };
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
		});

	// sc_brandEffectiveness
	// 	.legend(dc
	// 		.legend()
	// 		.x(sc_brandEffectiveness_labelStartX)
	// 		.y(sc_brandEffectiveness_labelStartY)
	// 		.itemHeight(13).gap(5).horizontal(1)
	// 		.legendWidth(5)
	// 		.itemWidth(70));

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
		.xAxis()
		.ticks(0);

	rc_brandEffectiveness
		.yAxisLabel('Game')
		.yAxis()
		.ticks(0);

	$(rc_brandEffectivenessResetId).click(function(){
		rc_brandEffectiveness.filterAll();
		dc.redrawAll();
	});
	//------------------------------------------------

	//------------------------------------------------
	/* Brand crowding bar chart */

	bc_brandCrowding
		.width(half_width)
		.height(half_height)
		.margins(half_margins)
		.x(d3.scale.ordinal().domain(brandGroupIdArr))
		.xUnits(dc.units.ordinal)
		.dimension(brandCrowdingDim)
		.group(brandCrowdingGroup)
		.valueAccessor(function(d) { return d.value.avg; })
		//.ordering(function(d) { console.log(d); return brandGroupIds[d.key]; }) // doesn't work!
		.colors(brandGroupIdColors)
		.colorAccessor(brandGroupIdColorsAccessor)
		.barPadding(0.1)
		.outerPadding(0.05)
		.brushOn(false);
		

	bc_brandCrowding
		.elasticX(false)
		.xAxisLabel('Brand Groups')
		.xAxis().tickFormat(function(d){ return brandGroupIds[d]; });

	bc_brandCrowding
		.elasticY(true)
		.yAxisLabel('Brand Crowding')
		.yAxis().tickFormat(function(d) {return d3.format(',%')(d); });

	$(bc_brandCrowdingResetId).click(function(){
		bc_brandCrowding.filterAll();
		dc.redrawAll();
	});
	//------------------------------------------------  


	//------------------------------------------------
	/* Visual Saliency bar chart */

	bc_visualSaliency
		.width(half_width)
		.height(half_height)
		.margins(half_margins)
		.x(d3.scale.ordinal().domain(brandGroupIdArr))
		.xUnits(dc.units.ordinal)
		.dimension(visualSaliencyDim)
		.group(visualSaliencyGroup)
		.valueAccessor(function(d) { return d.value.avg; })
		.colors(brandGroupIdColors)
		.colorAccessor(brandGroupIdColorsAccessor)
		.barPadding(0.1)
		.outerPadding(0.05)
		.brushOn(false);
		

	bc_visualSaliency
		.elasticX(false)
		.xAxisLabel('Brand Groups')
		.xAxis().tickFormat(function(d){ return brandGroupIds[d]; });

	bc_visualSaliency
		.elasticY(true)
		.yAxisLabel('Visual Saliency')
		.yAxis().tickFormat(function(d) {return d3.format(',%')(d); });

	$(bc_visualSaliencyResetId).click(function(){
		bc_visualSaliency.filterAll();
		dc.redrawAll();
	});
	//------------------------------------------------  


	//------------------------------------------------
	/* Timing Effectiveness bar chart */

	bc_timingEffectiveness
		.width(half_width)
		.height(half_height)
		.margins(half_margins)
		.x(d3.scale.ordinal().domain(brandGroupIdArr))
		.xUnits(dc.units.ordinal)
		.dimension(timingEffectivenessDim)
		.group(timingEffectivenessGroup)
		.valueAccessor(function(d) { return d.value.avg; })
		.colors(brandGroupIdColors)
		.colorAccessor(brandGroupIdColorsAccessor)
		.barPadding(0.1)
		.outerPadding(0.05)
		.brushOn(false);
		

	bc_timingEffectiveness
		.elasticX(false)
		.xAxisLabel('Brand Groups')
		.xAxis().tickFormat(function(d){ return brandGroupIds[d]; });

	bc_timingEffectiveness
		.elasticY(true)
		.yAxisLabel('Timing Effectiveness')
		.yAxis().tickFormat(function(d) {return d3.format(',%')(d); });

	$(bc_timingEffectivenessResetId).click(function(){
		bc_timingEffectiveness.filterAll();
		dc.redrawAll();
	});
	//------------------------------------------------  


	//------------------------------------------------
	/* Spatial Effectiveness bar chart */

	bc_spatialEffectiveness
		.width(half_width)
		.height(half_height)
		.margins(half_margins)
		.x(d3.scale.ordinal().domain(brandGroupIdArr))
		.xUnits(dc.units.ordinal)
		.dimension(spatialEffectivenessDim)
		.group(spatialEffectivenessGroup)
		.valueAccessor(function(d) { return d.value.avg; })
		.colors(brandGroupIdColors)
		.colorAccessor(brandGroupIdColorsAccessor)
		.barPadding(0.1)
		.outerPadding(0.05)
		.brushOn(false);
		

	bc_spatialEffectiveness
		.elasticX(false)
		.xAxisLabel('Brand Groups')
		.xAxis().tickFormat(function(d){ return brandGroupIds[d]; });

	bc_spatialEffectiveness
		.elasticY(true)
		.yAxisLabel('Spatial Effectiveness')
		.yAxis().tickFormat(function(d) {return d3.format(',%')(d); });

	$(bc_spatialEffectivenessResetId).click(function(){
		bc_spatialEffectiveness.filterAll();
		dc.redrawAll();
	});
	//------------------------------------------------  

	//------------------------------------------------
	/* Detection Count chart */

	var one_third_width = 251;
	var one_third_height = 200;
	var one_third_margins = {top: 1, right: 1, bottom: 1, left: 1};
	var one_third_pie_chart_outerRadius = 100;
	var one_third_pie_chart_innerRadius = 70;

	pc_detectionCount
		.width(one_third_width)
		.height(one_third_height)
		.radius(one_third_pie_chart_outerRadius)
		.innerRadius(one_third_pie_chart_innerRadius)
		//.margins(one_third_margins)
		//.x(d3.scale.ordinal().domain(brandGroupIdArr))
		//.xUnits(dc.units.ordinal)
		.dimension(detectionCountDim)
		.group(detectionCountGroup)
		.valueAccessor(function(d) { return d.value.avg; })
		.colors(brandGroupIdColors)
		.colorAccessor(brandGroupIdColorsAccessor);
		

	// bc_spatialEffectiveness
	// 	.elasticX(false)
	// 	.xAxisLabel('Brand Groups')
	// 	.xAxis().tickFormat(function(d){ return brandGroupIds[d]; });

	// bc_spatialEffectiveness
	// 	.elasticY(true)
	// 	.yAxisLabel('Spatial Effectiveness')
	// 	.yAxis().tickFormat(function(d) {return d3.format(',%')(d); });

	// $(bc_spatialEffectivenessResetId).click(function(){
	// 	bc_spatialEffectiveness.filterAll();
	// 	dc.redrawAll();
	// });
	//------------------------------------------------  


	//------------------------------------------------
	/* Finally, render charts and update visual elements */	
	dc.renderAll();

	timeLogEnd("chartsRender", "Chart render");	
	timeLogStart("postRender");

	// add legend items
	for(var i = 0; i < brandGroupNameArr.length; i++){
		var li = $("<li/>");
		li.prepend(
			$("<div/>", { class: "square" })
				.css("background-color", brandGroupNameColors(brandGroupNameArr[i])));
		li.append($("<div/>", { text: brandGroupNameArr[i], class: "text" }));
		$('#static-brand-legend-content').append(li);
	}

	// resize divs
	$(sc_brandEffectiveness_div)
		.parent().select('.chart-content')
		.height(
			$(sc_brandEffectiveness_div).outerHeight() + 
			$(rc_brandEffectiveness_div).outerHeight()
		);

	$('#static-brand-legend').width($('#static-brand-legend').width()); // force write


	$(bc_brandCrowding_div)
		.parent().select('.chart-content')
		.height($(bc_brandCrowding_div).outerHeight());

	$(bc_visualSaliency_div)
		.parent().select('.chart-content')
		.height($(bc_visualSaliency_div).outerHeight());

	$(bc_timingEffectiveness_div)
		.parent().select('.chart-content')
		.height($(bc_timingEffectiveness_div).outerHeight());

	$(bc_spatialEffectiveness_div)
		.parent().select('.chart-content')
		.height($(bc_spatialEffectiveness_div).outerHeight());

	$(pc_viewDuration_div)
		.parent().select('.chart-content')
		.height($(pc_viewDuration_div).outerHeight());

	$(pc_detectionCount_div)
		.parent().select('.chart-content')
		.height($(pc_detectionCount_div).outerHeight());

	timeLogEnd("postRender", "Post chart render");
	//------------------------------------------------

	$("#debug_dump").click(function(){
		print_filter("visualSaliencyGroup");
	});
};