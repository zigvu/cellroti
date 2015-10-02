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
	// Update Chart
  var updateChartsId = '#brand-legend-update-charts';
  $(updateChartsId).click(function(){
		// TODO
	});
  //------------------------------------------------
};

//------------------------------------------------  
