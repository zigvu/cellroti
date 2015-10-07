/*------------------------------------------------
  Chart Populator
  ------------------------------------------------*/

function AllChartPopulator(){
  var self = this;

  //------------------------------------------------  
  // data download and populate charts

  // read JSON - nested to force the first call to finish prior to second call
  timeLogStart("downloadData");

  // show spinner
  showSpinner();

  d3.json(window.seasonLabelPath, function(error, seasonInfo) {
    d3.json(window.seasonShowPath, function(error, seasonData) {
      timeLogEnd("downloadData", "Data download done");

      chartManager = new ChartManager(seasonInfo, seasonData);

      try {
        chartManager.drawCharts();

        if(window.selectedGameId !== undefined){
          chartManager.gameSelectionChart.loadGameSimulate(window.selectedGameId);
        }
      } catch(e) {
        zconsole(e.message, "from", e.stack);
        throw e;
      }

      // hide spinner
      hideSpinner();
    });
  });
  //------------------------------------------------  

};
//------------------------------------------------  
