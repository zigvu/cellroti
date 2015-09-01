/*------------------------------------------------
	Begin: Analytics Season Show Javascript
	------------------------------------------------*/

$(".analytics_seasons.summary").ready(function() {
  // read JSON - nested to force the first call to finish prior to second call
  timeLogStart("downloadData");
  // show spinner
  showSpinner();

  d3.json(window.seasonLabelPath, function(error, seasonInfo) {
    d3.json(window.seasonShowPath, function(error, seasonData) {
      timeLogEnd("downloadData", "Data download done");
      seasonInfos = seasonInfo;
      chartManager = new ChartManager(seasonInfo, seasonData);

      try {
        chartManager.drawCharts();
      } catch(e) {
        console.log(e.message, "from", e.stack);
        throw e;
      }

      // chartManager.drawCharts();
      // chartManager.loadGame(1);

      // hide spinner
      hideSpinner();
    });
  });    
});
