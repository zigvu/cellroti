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
