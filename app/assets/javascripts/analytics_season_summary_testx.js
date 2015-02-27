/*------------------------------------------------
	Begin: Analytics Season Show Javascript
	------------------------------------------------*/

$(".analytics_seasons.summary_testx").ready(function() {
  // read JSON - nested to force the first call to finish prior to second call
  timeLogStart("downloadData");
  
  d3.json(window.seasonLabelPath, function(error, seasonInfo) {
    d3.json(window.seasonShowPath, function(error, seasonData) {
      timeLogEnd("downloadData", "Data download done");
      seasonInfos = seasonInfo;
      seasonDatas = seasonData;
      // dataManager = new SeasonDataManager(seasonInfo, seasonData, 'this');
      chartManager = new ChartManagerTestX(seasonInfo, seasonData);
      chartManager.drawCharts();
      // chartManager.loadGame(1);
    });
  });
});
