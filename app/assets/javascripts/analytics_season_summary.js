/*------------------------------------------------
	Begin: Analytics Season Show Javascript
	------------------------------------------------*/

$(".analytics_seasons.summary").ready(function() {
  // read JSON - nested to force the first call to finish prior to second call
  timeLogStart("downloadData");
  d3.json(window.seasonLabelPath, function(error, seasonInfo) {
    d3.json(window.seasonShowPath, function(error, seasonData) {
      timeLogEnd("downloadData", "Data download done");
      seasonInfos = seasonInfo;
      chartManager = new ChartManager(seasonInfo, seasonData);
      chartManager.drawCharts();
    });
  });
});
