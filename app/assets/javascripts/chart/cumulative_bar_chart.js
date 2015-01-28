/*------------------------------------------------
	Cumulative Bar Chart
	------------------------------------------------*/

function CumulativeBarChart(parsedData){
	//------------------------------------------------
	// set groups

	var compositeAccessors = [
		'brand_group_crowding',
		'visual_saliency',
		'timing_effectiveness',
		'spatial_effectiveness'
	];
	var compositeDim = parsedData.ndx.dimension(function (d) { return d.bg_id; });
	var compositeGroup = compositeDim.group().reduce(
		reduceAddAvg(compositeAccessors), 
		reduceRemoveAvg(compositeAccessors), 
		reduceInitAvg
	);

	//------------------------------------------------
	// set charts

	var bc_brandCrowding_div = '#dc-brand-crowding-bar-chart';
	var bc_visualSaliency_div = '#dc-visual-saliency-bar-chart';
	var bc_timingEffectiveness_div = '#dc-timing-effectiveness-bar-chart';
	var bc_spatialEffectiveness_div = '#dc-spatial-effectiveness-bar-chart';
	var composite_ResetId = '#dc-brand-effectiveness-composite-reset';

	var bc_brandCrowding = dc.barChart(bc_brandCrowding_div);
	var bc_visualSaliency = dc.barChart(bc_visualSaliency_div);
	var bc_timingEffectiveness = dc.barChart(bc_timingEffectiveness_div);
	var bc_spatialEffectiveness = dc.barChart(bc_spatialEffectiveness_div);

	var allCompositeChartArr = [
		bc_brandCrowding,
		bc_visualSaliency,
		bc_timingEffectiveness,
		bc_spatialEffectiveness
	];

	//------------------------------------------------
	// set gemoetry

	var width = $(bc_brandCrowding_div).parent().width();
	var height = 250;
	var margins = {top: 1, right: 0, bottom: 0, left: 0};


	//------------------------------------------------
	// create all composite chart components in one go
	for(var i = 0; i < allCompositeChartArr.length; i++){
		allCompositeChartArr[i]
			.width(width)
			.height(height)
			.margins(margins)
			.x(d3.scale.ordinal().domain(parsedData.brandGroupIdArr))
			.xUnits(dc.units.ordinal)
			.dimension(compositeDim)
			.group(compositeGroup)
			//.ordering(function(d) { console.log(d); return parsedData.getBrandGroupName(d.key); }) // doesn't work!
			.colors(parsedData.brandGroupIdColors)
			.colorAccessor(parsedData.brandGroupIdColorsAccessor)
			.barPadding(0.1)
			.outerPadding(0.05)
			.brushOn(false)
			.elasticX(false)
			.elasticY(false)
			.xAxis().tickFormat(function(d) { return ""; });
	}

	// Note: valueAccessor and the likes cannot be pulled in the above loop because
	// the data elem 'd' does not have accessor information within it

	// Brand crowding bar chart specific
	bc_brandCrowding
		.valueAccessor(function(d) { return d.value.avg['brand_group_crowding']; })
		.title(function (d) {
			return parsedData.getBrandGroupName(d.key) + ": " 
				+ d3.format(',%')(d.value.avg['brand_group_crowding']);
		})
		.xAxisLabel('Brand Crowding')
		.yAxisLabel('Score')
		.yAxis().tickFormat(function(d) {return d3.format(',%')(d); });

	// Visual Saliency bar chart specific
	bc_visualSaliency
		.valueAccessor(function(d) { return d.value.avg['visual_saliency']; })
		.title(function (d) {
			return parsedData.getBrandGroupName(d.key) + ": " 
				+ d3.format(',%')(d.value.avg['visual_saliency']);
		})
		.xAxisLabel('Visual Saliency')
		.yAxisLabel(false)
		.yAxis().tickFormat(function(d) {return ""; });

	// Timing Effectiveness bar chart specific
	bc_timingEffectiveness
		.valueAccessor(function(d) { return d.value.avg['timing_effectiveness']; })
		.title(function (d) {
			return parsedData.getBrandGroupName(d.key) + ": " 
				+ d3.format(',%')(d.value.avg['timing_effectiveness']);
		})
		.xAxisLabel('Timing Effectiveness')
		.yAxisLabel(false)
		.yAxis().tickFormat(function(d) {return ""; });

	// Spatial Effectiveness bar chart specific
	bc_spatialEffectiveness
		.valueAccessor(function(d) { return d.value.avg['spatial_effectiveness']; })
		.title(function (d) {
			return parsedData.getBrandGroupName(d.key) + ": " 
				+ d3.format(',%')(d.value.avg['spatial_effectiveness']);
		})
		.xAxisLabel('Spatial Effectiveness')
		.yAxisLabel(false)
		.yAxis().tickFormat(function(d) {return ""; });

	$(composite_ResetId).click(function(){
		for(var i = 0; i < allCompositeChartArr.length; i++){
			allCompositeChartArr[i].filterAll();
		}
		dc.redrawAll();
	});

	//------------------------------------------------
	// redraw Y axis for composite charts
	this.redrawCompositeDomainYAxis = function() {
		var maxValue = -Infinity;
		var allGroups = compositeGroup.all();
		for (var i = 0; i < allGroups.length; i++){
			for (key in allGroups[i].value.avg){
				if (allGroups[i].value.avg[key] > maxValue){
					maxValue = allGroups[i].value.avg[key];
				}
			}
		}
		domain = [0, maxValue];

		for (var i = 0; i < allCompositeChartArr.length; i++){
			allCompositeChartArr[i].y(d3.scale.linear().domain(domain));
			allCompositeChartArr[i].redraw();
			allCompositeChartArr[i].renderYAxis(allCompositeChartArr[i].g());
		}
	}

	//------------------------------------------------
	// resize divs once all charts have rendered
	this.resizeDiv = function(){
		$(bc_brandCrowding_div)
			.parent()
			.height($(bc_brandCrowding_div).outerHeight());
	};
};

//------------------------------------------------  
