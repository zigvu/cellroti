/*------------------------------------------------
	Series Chart for Season
	------------------------------------------------*/

function SeasonSeriesChart(parsedData){
	timeLogStart("SeasonSeriesChart");

	//------------------------------------------------
	// set associated charts
	var heatmapChart, brandEffectivenessCharts;
	this.setAssociatedCharts = function(_heatmapChart, _brandEffectivenessCharts){
		heatmapChart = _heatmapChart;
		brandEffectivenessCharts = _brandEffectivenessCharts;
	};

	//------------------------------------------------
	// set groups
	var counterDomain = d3.extent(parsedData.ndxData, function(d) { return d.counter; });
	var counterDim = parsedData.ndx.dimension(function (d) { return d.counter; });
	var counterDimGroup = counterDim.group(); // count

	var brandEffectivenessDim = parsedData.ndx.dimension(function (d) { 
		return [d.counter, parsedData.getBrandGroupName(d.bg_id)];
	});
	var brandEffectivenessDimGroup = brandEffectivenessDim.group().reduceSum(function(d) { 
		return d.brand_effectiveness;
	});


	//------------------------------------------------
	// set charts
	var sc_brandEffectiveness_div = '#dc-brand-effectiveness-series-chart';
	var rc_brandEffectiveness_div = '#dc-brand-effectiveness-range-chart';
	var rc_brandEffectivenessResetId = '#dc-brand-effectiveness-series-chart-reset';

	var sc_brandEffectiveness = dc.seriesChart(sc_brandEffectiveness_div);
	var rc_brandEffectiveness = dc.barChart(rc_brandEffectiveness_div);

	//------------------------------------------------
	// set gemoetry
	var sc_brandEffectiveness_width = $(sc_brandEffectiveness_div).parent().width();
	var sc_brandEffectiveness_height = 300;
	var sc_brandEffectiveness_margin = { top: 1, right: 1, bottom: 0, left: 40 };
	
	var sc_MinLabelWidthAll = 150;
	var sc_MinLabelWidthIndv = 100;

	var rc_brandEffectiveness_width = sc_brandEffectiveness_width;
	var rc_brandEffectiveness_height = 45;
	var rc_brandEffectiveness_margin = {top: 1, right: 1, bottom: 0, left: 40};

	//------------------------------------------------
	// create renderlets
	// put text labels for game range chart
	var gameLabelText_renderlet = function(_chart){
		var barsData = [];
		var bars = _chart.selectAll('.bar').each(function(d) { barsData.push(d); });

		// remove old values (if found)
		d3.select(bars[0][0].parentNode).select('#inline-labels').remove();
		// create group for labels 
		var gLabels = d3.select(bars[0][0].parentNode).append('g').attr('id','inline-labels');

		for (var i = bars[0].length - 1; i >= 0; i--) {
			var b = bars[0][i];
			if (parsedData.isInDemarcationLine(barsData[i].data.key)){
				gLabels
					.append("text")
					.text(parsedData.getRangeLabelForDemarcation(barsData[i].data.key))
					.attr('x', +b.getAttribute('x') + (b.getAttribute('width')/2) )
					.attr('y', +b.getAttribute('y') + 20)
					.attr('text-anchor', 'left');
			}
		}
	};

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
			if (parsedData.isInDemarcationLine(cnt)){
				var beginPx = -1;
				var endPx = -1;
				// data extractors
				var seriesCounters = parsedData.getSeriesCountersForDemarcation(cnt);
				var beginC = seriesCounters[0];
				var endC = seriesCounters[1];
				var label = parsedData.getSeriesLabelForDemarcation(cnt);
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
			var dmKey = parsedData.getLabelDemarcationKey(sortedPointsCounter[0]["counter"]);
			var label = parsedData.getSeriesLabelForDemarcation(dmKey);
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
			var dmKey = parsedData.getLabelDemarcationKey(sortedPointsCounter[0]["counter"]);
			var label = parsedData.getSeriesLabelForDemarcation(dmKey);
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
			var color = parsedData.gameColors(rectStartEnd[i][3]);
			var g = bgRects.append('g').attr("transform", function(d, i) { 
				return "translate(" + x + "," + y + ")";
			});
			g.append('rect').attr('width', width).attr('height', yAxisHeight).attr('fill', color);
			// don't label if too small a space
			if (drawLabel && width > sc_MinLabelWidthIndv){
				g.append('text')
					.text(label).attr('x', 5).attr('y', 15)
					.attr('text-anchor', 'left');
			}
		}
		// console.log(rectStartEnd);
	};
	//------------------------------------------------
	// create charts

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
		.colors(parsedData.brandGroupNameColors)
		// .colorAccessor(parsedData.brandGroupNameColorsAccessor) - doesn't use this
		.rangeChart(rc_brandEffectiveness)
		.renderlet(sc_brandEffectiveness_renderlet)
		.seriesSort(d3.ascending)		
		.brushOn(false)
		.mouseZoomable(false)
		.title(function (d) {
			var gameTitle = parsedData.getSeriesLabelForDemarcationCounter(d.key[0]);
			var str = 
				'Game:          ' + gameTitle + '\n' + 
				'Group:         ' + d.key[1] + '\n' +
				'Effectiveness: ' + d3.format(',%')(d.value);
			return str;
		})
		.on("postRedraw", function(chart) {
			debouncedSeriesChartPostRedraw();
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
		.colors(parsedData.gameColors)
		.colorAccessor(parsedData.gameColorsAccessor)
		.renderlet(gameLabelText_renderlet)
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

	//------------------------------------------------
	// reset charts and resize divs
	$(rc_brandEffectivenessResetId).click(function(){
		rc_brandEffectiveness.filterAll();
		dc.redrawAll();
	});

	this.resizeDiv = function(){
		$(sc_brandEffectiveness_div)
			.parent().select('.chart-content')
			.height(
				$(sc_brandEffectiveness_div).outerHeight() + 
				$(rc_brandEffectiveness_div).outerHeight()
			);	
	};
	

	//------------------------------------------------
	// helper functions
	var seriesChartPostRedraw = function(){
		brandEffectivenessCharts.redrawCompositeDomainYAxis();
		heatmapChart.updateHeatmap();
		//console.log("Times");
	}
	var debouncedSeriesChartPostRedraw = _.debounce(seriesChartPostRedraw, chartDebounceTime);

	timeLogEnd("SeasonSeriesChart", "SeasonSeriesChart Creation");
};

//------------------------------------------------  
