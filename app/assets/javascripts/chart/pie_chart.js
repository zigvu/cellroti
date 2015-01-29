/*------------------------------------------------
	Pie Chart
	------------------------------------------------*/

function PieChart(parsedData){
	timeLogStart("PieChart");

	//------------------------------------------------
	// set groups

	var detectionCountDim = parsedData.ndx.dimension(function (d) { return d.bg_id; });
	var detectionCountGroup = detectionCountDim.group().reduce(
		REDUCEAVG.SINGLE.reduceAddAvg('detections_count'), 
		REDUCEAVG.SINGLE.reduceRemoveAvg('detections_count'), 
		REDUCEAVG.SINGLE.reduceInitAvg
	);

	var viewDurationDim = parsedData.ndx.dimension(function (d) { return d.bg_id; });
	var viewDurationGroup = viewDurationDim.group().reduce(
		REDUCEAVG.SINGLE.reduceAddAvg('view_duration'), 
		REDUCEAVG.SINGLE.reduceRemoveAvg('view_duration'), 
		REDUCEAVG.SINGLE.reduceInitAvg
	);

	//------------------------------------------------
	// set charts

	var pc_viewDuration_div = '#dc-view-duration-pie-chart';
	var pc_detectionCount_div = '#dc-brand-count-pie-chart';
	var pc_viewDurationResetId = '#dc-view-duration-pie-chart-reset';
	var pc_detectionCountResetId = '#dc-brand-count-pie-chart-reset';

	var pc_detectionCount = dc.pieChart(pc_detectionCount_div);
	var pc_viewDuration = dc.pieChart(pc_viewDuration_div);

	//------------------------------------------------
	// set gemoetry

	var widthHeight = $(pc_detectionCount_div).parent().width();
	if (widthHeight > 200) { widthHeight = 200; }
	var innerRadius = 20;

	//------------------------------------------------
	// create charts

	// detection count chart
	pc_detectionCount
		.width(widthHeight)
		.height(widthHeight)
		.innerRadius(innerRadius)
		.dimension(detectionCountDim)
		.group(detectionCountGroup)
		.valueAccessor(function(d) { 
			if (d.value.avg !== undefined){ return d.value.avg;
			} else {
				return d.value;
			}
		})
		.colors(parsedData.brandGroupIdColors)
		.colorAccessor(parsedData.brandGroupIdColorsAccessor)
		.label(function(d) { return "Count: " + Math.round(d.value.avg);})
		.title(function (d) {
			if (d.value.avg !== undefined){
				return parsedData.getBrandGroupName(d.key) + ": " + Math.round(d.value.avg);
			} else { 
				return parsedData.getBrandGroupName(d.data.key) + ": " + Math.round(d.value);
			}
		});

	// view duration chart
	pc_viewDuration
		.width(widthHeight)
		.height(widthHeight)
		.innerRadius(innerRadius)
		.dimension(viewDurationDim)
		.group(viewDurationGroup)
		.valueAccessor(function(d) { 
			if (d.value.avg !== undefined){ return d.value.avg;
			} else {
				return d.value;
			}
		})
		.colors(parsedData.brandGroupIdColors)
		.colorAccessor(parsedData.brandGroupIdColorsAccessor)
		.label(function(d) { return Math.round(d.value.avg) + " sec";})
		.title(function (d) {
			if (d.value.avg !== undefined){
				return parsedData.getBrandGroupName(d.key) + ": " + Math.round(d.value.avg) + " sec";
			} else { 
				return parsedData.getBrandGroupName(d.data.key) + ": " + Math.round(d.value) + " sec";
			}
		});

	//------------------------------------------------
	// reset charts and resize divs

	$(pc_detectionCountResetId).click(function(){
		pc_detectionCount.filterAll();
		dc.redrawAll();
	});

	$(pc_viewDurationResetId).click(function(){
		pc_viewDuration.filterAll();
		dc.redrawAll();
	});

	this.setDivHeight = function(pcDivHeight){
		$(pc_detectionCount_div)
			.parent().select('.chart-content')
			.height(pcDivHeight);

		$(pc_viewDuration_div)
			.parent().select('.chart-content')
			.height(pcDivHeight);
	};
	
	timeLogEnd("PieChart", "PieChart Creation");
};

//------------------------------------------------  
