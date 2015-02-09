/*------------------------------------------------
	Chart Manager
	------------------------------------------------*/

function ChartManager(seasonInfo, seasonData){

  timeLogStart("dataManager");
  dataManager = new DataManager(seasonInfo, seasonData);
  timeLogEnd("dataManager", "Data averaging done");

  // create ndx
  timeLogStart("ndxManager");
  ndxManager = new NDXManager(dataManager);
  timeLogEnd("ndxManager", "Creating ndx");
  
  timeLogStart("chartDrawing");
  // this is the normal 100% resolution for all charts
  ndxManager.setCounterBounds(0,Infinity);

  // draw charts
  multiLineChart = new MultiLineChart(ndxManager, dataManager);
  multiBarChart = new MultiBarChart(ndxManager, dataManager);
  allDonutCharts = new AllDonutCharts(ndxManager, dataManager);
  heatmapChart = new HeatmapChart(ndxManager, dataManager);
  allDonutCharts.setDivHeight(heatmapChart.getOuterDivHeight());
  timeLogEnd("chartDrawing", "All chart drawing done");

  // draw legend
  chartLegend = new ChartLegend(dataManager, multiLineChart);
};

//------------------------------------------------  
