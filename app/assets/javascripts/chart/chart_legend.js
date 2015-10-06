/*------------------------------------------------
	Chart Legend
	------------------------------------------------*/

function ChartLegend(chartManager){
  var self = this;

  //------------------------------------------------
  // set up
  var chartHelpers = chartManager.chartHelpers;


  //------------------------------------------------
	// Add legend items
	_.each(chartManager.getBrandGroupIds(), function(bgId){
		var legendText = chartManager.getBrandGroupName(bgId);
		var legendTextTrunc = chartHelpers.ellipsis(legendText, 22, 1);
		var li = $("<li/>");
		li.prepend(
			$("<div/>", { class: "square" })
				.css("background-color", chartManager.getBrandGroupColor(bgId)));
		li.append($("<div/>", { text: legendTextTrunc, class: "text" }));
		li.attr("title", legendText);
		$('#brand-legend-content-ul').append(li);
	});
  //------------------------------------------------

  //------------------------------------------------
	// Monitor number of selected brand groups
	var minNumOfBrandGroups = 2, maxNumOfBrandGroups = 6;
	function monitorBrandGroups(){
		var len = $("#brand-group-update input[name='det_group_ids[]']:checked").length;
		if(len < minNumOfBrandGroups || len > maxNumOfBrandGroups){
			$("#brand-group-max").addClass("alert-brand-group-max");
			$("#brand-group-submit").addClass("disabled");
		} else {
			$("#brand-group-max").removeClass("alert-brand-group-max");
			$("#brand-group-submit").removeClass("disabled");
		}
		return len;
	};

	$("#brand-group-update input[name='det_group_ids[]']").change(function(){
		monitorBrandGroups();
	});
	$("#brand-group-submit").click(function(event){
		var len = monitorBrandGroups();
		if(len < minNumOfBrandGroups || len > maxNumOfBrandGroups){ event.preventDefault(); }
	});
	monitorBrandGroups();
  //------------------------------------------------

};

//------------------------------------------------  
