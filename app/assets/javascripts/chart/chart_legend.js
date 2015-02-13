/*------------------------------------------------
	Chart Legend
	------------------------------------------------*/

function ChartLegend(chartManager){

  //------------------------------------------------
	// Add legend items
	_.each(chartManager.getBrandGroupIds(), function(bgId){
		var li = $("<li/>");
		li.prepend(
			$("<div/>", { class: "square" })
				.css("background-color", chartManager.getBrandGroupColor(bgId)));
		li.append($("<div/>", { text: chartManager.getBrandGroupName(bgId), class: "text" }));
		$('#brand-legend-content-ul').append(li);
	});
  //------------------------------------------------


  //------------------------------------------------
	// Reset Chart
  var resetChartsId = '#reset-charts';
  $(resetChartsId).click(function(){
		chartManager.brushReset();
	});
  //------------------------------------------------

	//------------------------------------------------
	// Update Chart
  var updateChartsId = '#brand-legend-update-charts';
  $(updateChartsId).click(function(){
		// TODO
	});
  //------------------------------------------------


  //------------------------------------------------
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
  //------------------------------------------------

};

//------------------------------------------------  
