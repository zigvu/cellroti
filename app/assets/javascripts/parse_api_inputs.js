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
	var gameIds = {}
	seasonInfo["games"].forEach(function (game) {
		gameIds[+game["id"]] = game["name"];
	});

	// disaggregate seasonData
	var brandGroupIds = {}
	seasonData["brand_groups"].forEach(function (brandGroup) {
		brandGroupIds[+brandGroup["id"]] = brandGroup["name"];
	});
	var brandGroupDataKeys = seasonData["brand_group_data_keys"];

	// iterate through games data and populate ndx
	seasonData["games"].sort(sortById).forEach(function (games) {
		// get summary data - assume sorted by time
		games["gameData"].forEach(function (gameData){
			//var time = gameData["time"];
			gameData["bgData"].forEach(function (bgData){
				for (var brandGroup in bgData){
					if (!bgData.hasOwnProperty(brandGroup)){
						continue;
					}
					//bgName = brandGroupIds[brandGroup];
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
	//console.log(ndxData);

	return {
		gameIds: gameIds,
		brandGroupIds: brandGroupIds,
		ndxData: ndxData
	};
};
//------------------------------------------------  

