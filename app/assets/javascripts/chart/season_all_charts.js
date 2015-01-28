/*------------------------------------------------
	Season charts
	------------------------------------------------*/

seasonAllCharts = function(parsedData) {
	//------------------------------------------------
	// Set up charts

	var allChartsResetId = '#brand-legend-reset-all-charts';

	var seasonSeriesChart = new SeasonSeriesChart(parsedData);
	var brandEffectivenessCharts = new CumulativeBarChart(parsedData);
	var heatmapChart = new HeatmapChart(parsedData);
	var pieCharts = new PieChart(parsedData);

	seasonSeriesChart.setAssociatedCharts(heatmapChart, brandEffectivenessCharts)

	//------------------------------------------------
	// render charts and update visual elements
	dc.renderAll();

	$(allChartsResetId).click(function(){
		dc.filterAll();
		dc.redrawAll();
	});

	//------------------------------------------------
	// Add legend items
	for(var i = 0; i < parsedData.brandGroupNameArr.length; i++){
		var li = $("<li/>");
		li.prepend(
			$("<div/>", { class: "square" })
				.css("background-color", parsedData.brandGroupNameColors(parsedData.brandGroupNameArr[i])));
		li.append($("<div/>", { text: parsedData.brandGroupNameArr[i], class: "text" }));
		$('#brand-legend-content-ul').append(li);
	}

	//------------------------------------------------
	// Resize divs
	seasonSeriesChart.resizeDiv();
	brandEffectivenessCharts.resizeDiv();

	// for the pie charts, use height of heatmap if that is larger
	var pcDivHeight = heatmapChart.getOuterDivHeight();
	pieCharts.setDivHeight(pcDivHeight);


	//------------------------------------------------
	// trigger click so that all charts are updated with latest values
	//$('#dc-brand-effectiveness-composite-reset').trigger( "click" );

	$("#debug_dump").click(function(){
		print_filter("visualSaliencyGroup");
	});
};