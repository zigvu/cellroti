/*------------------------------------------------
	NDX data structure
	------------------------------------------------*/

function NDXData(counterGameDemarcationMap, counterGameDemarcation, gameIds, brandGroupIds, ndxData){
	timeLogStart("NDXData");
	
	//var ndxData, gameIds, brandGroupIds, gameDemarcations;
	//------------------------------------------------

	// TODO: remove:
	this.counterGameDemarcationMap = function(){ return counterGameDemarcationMap; };
	this.counterGameDemarcation = function(){ return counterGameDemarcation; };
	this.gameIds = function(){ return gameIds; };
	this.brandGroupIds = function(){ return brandGroupIds; };
	// this.ndxData = function(){ return ndxData; };
	// END: remove

	// Run the data through crossfilter
	this.ndxData = ndxData;
	this.ndx = crossfilter(this.ndxData);
	// color domain/range for game
	this.gameColors = d3.scale.category20().domain(Object.keys(counterGameDemarcation));
	this.gameColorsAccessor = function(d){ return counterGameDemarcationMap[d.key]; };

	// color domain/range for brand_group - sort based on name of brand group
	var brandGroupSorter = _.chain(brandGroupIds).pairs().sortBy(function(k){return k[1];}).value();
	this.brandGroupIdArr = _.map(brandGroupSorter, function(k){ return k[0];});
	this.brandGroupNameArr = _.map(brandGroupSorter, function(k){ return k[1];});
	

	this.brandGroupIdColors = d3.scale.category10().domain(this.brandGroupIdArr);
	this.brandGroupIdColorsAccessor = function(d) { return d.key; };
	this.brandGroupNameColors = d3.scale.category10().domain(this.brandGroupNameArr);
	// apparently : series chart doesn't need color accessor
	// this.brandGroupNameColorsAccessor = function(d) { return d.key; };

	// accessor functions


	this.getBrandGroupName = function(brandGroupId){ return brandGroupIds[brandGroupId]; };

	// data structure to hold charts
	this.charts = {};
	timeLogEnd("NDXData", "NDXData Creation");
};

//------------------------------------------------  
