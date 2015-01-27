/*------------------------------------------------
	Parse API inputs
	------------------------------------------------*/

//------------------------------------------------
/* Convert season JSON data to crossfilter data for charts */

function parseSeasonData(seasonInfo, seasonData){
	var ndxData = [];
	var counter = 0;

	// disaggregate seasonInfo - convert to hashes like below
	// var eventTypesInfo = seasonInfo["event_types"];
	// var teamsInfo = seasonInfo["teams"];
	// var gamesInfo = seasonInfo["games"];
	var gameIds = {};
	seasonInfo["games"].forEach(function (game) {
		gameIds[+game["id"]] = game["name"];
	});

	// disaggregate seasonData
	var brandGroupIds = {};
	seasonData["brand_groups"].forEach(function (brandGroup) {
		brandGroupIds[+brandGroup["id"]] = brandGroup["name"];
	});
	var brandGroupDataKeys = seasonData["brand_group_data_keys"];

	// counter demarkation for games
	var counterDems = [];

	// iterate through games data and populate ndx
	seasonData["games"].sort(sortById).forEach(function (games) {
		// get summary data - assume sorted by time
		counterDems.push({
			series_label: "Game "+ games["id"] + " Desc.",
			range_label: +games["id"],
			counter: counter
		});
		
		games["gameData"].forEach(function (gameData){
			//var time = gameData["time"];

			gameData["bgData"].forEach(function (bgData){
				for (var brandGroup in bgData){
					if (!bgData.hasOwnProperty(brandGroup)){
						continue;
					}
					//var bgName = brandGroupIds[brandGroup];
					dataLine = {
						counter: counter,
						game_id: +games["id"],
						bg_id: +brandGroup
					}
					bgData[brandGroup].forEach(function (d, idx, data){
						if (brandGroupDataKeys[idx] === "quadrants"){
							d.forEach(function(q, qidx, qdata){
								dataLine["q" + qidx] = +q;
							});
						} else {
							dataLine[brandGroupDataKeys[idx]] = +d;
						}
					});
					ndxData.push(dataLine);
				}
			});
			counter++;
		});
	});
	var finalCounterValue = --counter;
	// sort and save with range information
	counterGameDemarcation = {};
	counterDems.reverse().forEach(function (cd){
		counterGameDemarcation[cd["counter"]] = {
			series_label: cd["series_label"],
			range_label: cd["range_label"],
			series_counters: [cd["counter"], counter]
		}
		counter = cd["counter"];
	});
	// create mapping to counterGameDemarcation to avoid expensive loops
	counterGameDemarcationMap = {};
	for (var i = 0; i < finalCounterValue; i++){
		// loop through
		var beginC, endC, key;
		for (key in counterGameDemarcation){
			beginC = counterGameDemarcation[key]["series_counters"][0];
			endC = counterGameDemarcation[key]["series_counters"][1];
			if (i >= beginC && i < endC){ 
				counterGameDemarcationMap[i] = key;
				break;
			}
		}
		// the last entry is not in counterGameDemarcation map yet
		counterGameDemarcationMap[finalCounterValue] = key;
	}
	//console.log(ndxData[0]);
	var parsedData = new NDXData(counterGameDemarcationMap, counterGameDemarcation, gameIds, brandGroupIds, ndxData);
	return parsedData;
	// return {
	// 	counterGameDemarcationMap: counterGameDemarcationMap,
	// 	counterGameDemarcation: counterGameDemarcation,
	// 	gameIds: gameIds,
	// 	brandGroupIds: brandGroupIds,
	// 	ndxData: ndxData
	// };
	
};
//------------------------------------------------  

