/*------------------------------------------------
	NDX data structure
	------------------------------------------------*/

function NDXData(gameDemarcationsMap, gameDemarcations, brandGroupMap, ndxData){
	
	//------------------------------------------------
	// Run the data through crossfilter
	this.ndxData = ndxData;
	this.ndx = crossfilter(this.ndxData);

	// color domain/range for game
	this.gameColors = d3.scale.category20().domain(Object.keys(gameDemarcations));
	this.gameColorsAccessor = function(d){ return gameDemarcationsMap[d.key]; };

	// color domain/range for brand_group - sort based on name of brand group
	var brandGroupSorter = _.chain(brandGroupMap).pairs().sortBy(function(k){return k[1];}).value();
	this.brandGroupIdArr = _.map(brandGroupSorter, function(k){ return k[0];});
	this.brandGroupNameArr = _.map(brandGroupSorter, function(k){ return k[1];});
	

	this.brandGroupIdColors = d3.scale.category10().domain(this.brandGroupIdArr);
	this.brandGroupIdColorsAccessor = function(d) { return d.key; };
	this.brandGroupNameColors = d3.scale.category10().domain(this.brandGroupNameArr);
	// apparently : series chart doesn't need color accessor
	// this.brandGroupNameColorsAccessor = function(d) { return d.key; };

	// accessor functions
	this.getBrandGroupName = function(brandGroupId){ return brandGroupMap[brandGroupId]; };

	// accessor for series/range chart in season analysis
	this.getLabelDemarcationKey = function(counter){ return gameDemarcationsMap[counter]; };
	this.getSeriesLabelForDemarcationCounter = function(counter){
		return gameDemarcations[gameDemarcationsMap[counter]]["series_label"];
	};
	this.isInDemarcationLine = function(dmKey){ return gameDemarcations.hasOwnProperty(dmKey); };
	this.getRangeLabelForDemarcation = function(dmKey){ return gameDemarcations[dmKey]["range_label"]; };
	this.getSeriesLabelForDemarcation = function(dmKey){ return gameDemarcations[dmKey]["series_label"]; };
	this.getSeriesCountersForDemarcation = function(dmKey){ return gameDemarcations[dmKey]["series_counters"]; };

};

//------------------------------------------------  
