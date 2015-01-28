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
	var gameDataMap = {};
	seasonInfo["games"].forEach(function (game) {
		gameDataMap[+game["id"]] = game["name"];
	});

	// disaggregate seasonData
	var brandGroupMap = {};
	seasonData["brand_groups"].forEach(function (brandGroup) {
		brandGroupMap[+brandGroup["id"]] = brandGroup["name"];
	});
	var brandGroupDataKeys = seasonData["brand_group_data_keys"];

	// counter demarkation for games
	var counterDems = [];

	// iterate through games data and populate ndx
	seasonData["games"].sort(sortById).forEach(function (games) {
		// get summary data - assume sorted by time
		counterDems.push({
			series_label: gameDataMap[+games["id"]],
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
					//var bgName = brandGroupMap[brandGroup];
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
	var gameDemarcations = {};
	counterDems.reverse().forEach(function (cd){
		gameDemarcations[cd["counter"]] = {
			series_label: cd["series_label"],
			range_label: cd["range_label"],
			series_counters: [cd["counter"], counter]
		}
		counter = cd["counter"];
	});
	// create mapping to gameDemarcations to avoid expensive loops
	var beginC, endC, key;
	var gameDemarcationsMap = {};
	for (var i = 0; i < finalCounterValue; i++){
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
	// the last entry is not in gameDemarcations map yet
	gameDemarcationsMap[finalCounterValue] = key;

	//console.log(ndxData[0]);
	var parsedData = new NDXData(gameDemarcationsMap, gameDemarcations, brandGroupMap, ndxData);
	return parsedData;
};
//------------------------------------------------  

