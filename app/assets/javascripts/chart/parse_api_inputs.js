/*------------------------------------------------
	Parse API inputs
	------------------------------------------------*/

/*
// seasonData Hash structure
{
	season_id:,
	brand_group_map: [{:id => :name}, ],
	brand_group_data_keys: [
		:counter, :game_id, :bg_id,
		:brand_effectiveness, :brand_group_crowding, :visual_saliency,
		:timing_effectiveness, :spatial_effectiveness, :detections_count,
		:view_duration, :quadrants
	],
	data_counter: [{game_id:, :data_count}, ],
	ndxData: [
		[array of values according to brand_group_data_keys],
	]
}
*/

//------------------------------------------------
/* Convert season JSON data to crossfilter data for charts */

function parseSeasonData(seasonInfo, seasonData){
	timeLogStart("parseSeasonData");

	// disaggregate seasonInfo - convert to hashes like below
	// var eventTypesInfo = seasonInfo["event_types"];
	// var teamsInfo = seasonInfo["teams"];
	// var gamesInfo = seasonInfo["games"];
	var gameDataMap = {};
	seasonInfo["games"].forEach(function (game) {
		gameDataMap[+game["id"]] = game["name"];
	});

	// disaggregate seasonData
	var brandGroupMap = seasonData["brand_group_map"];
	var brandGroupDataKeys = seasonData["brand_group_data_keys"];

	// NDX data
	var ndxData = [];
	seasonData["ndxData"].forEach(function (dLine) {
		dataLine = {};
		dLine.forEach(function (d, idx, data){
			if (brandGroupDataKeys[idx] === "quadrants"){
				d.forEach(function(q, qidx, qdata){
					dataLine["q" + qidx] = +q;
				});
			} else {
				dataLine[brandGroupDataKeys[idx]] = +d;
			}
		});
		ndxData.push(dataLine);
	});

	// create game demarcations
	var gameDemarcations = {};
	var curDataCount = 0;
	seasonData["data_counter"].forEach(function (dataCounter) {
		if(dataCounter["data_count"] > 0){
			gameDemarcations[curDataCount] = {
				series_label: gameDataMap[dataCounter["game_id"]],
				range_label: dataCounter["game_id"],
				series_counters: [curDataCount, curDataCount + dataCounter["data_count"]]
			};
			curDataCount += dataCounter["data_count"];
		}
	});

	// create mapping to gameDemarcations to avoid expensive loops
	var beginC, endC, key;
	var gameDemarcationsMap = {};
	for (var i = 0; i < curDataCount; i++){
		// loop through
		for (key in gameDemarcations){
			beginC = gameDemarcations[key]["series_counters"][0];
			endC = gameDemarcations[key]["series_counters"][1];
			if (i >= beginC && i < endC){ 
				gameDemarcationsMap[i] = key;
				break;
			}
		}
	}

	//console.log(ndxData[0]);
	var parsedData = new NDXData(gameDemarcationsMap, gameDemarcations, brandGroupMap, ndxData);

	timeLogEnd("parseSeasonData", "Parse data and create NDX");

	return parsedData;
};
//------------------------------------------------  

