/*------------------------------------------------
	Chart Manager
	------------------------------------------------*/

function ChartManager(seasonInfo, seasonData){
  // variables for different charts
  this.numOfDataPtsPerBGInSeriesChart = 1000;
  this.numRowsInTableChart = 10;
  this.numOfGamesInSubSeasonChart = 2;

  // draw charts inside object method scope
  // so that charts can be passed the `this` object
  this.drawCharts = function(){
    // global scope so we don't have to pass this around
    this.chartHelpers = new ChartHelpers();

    timeLogStart("dataManager");
    this.dataManager = new SeasonDataManager(seasonInfo, seasonData, this);
    this.seasonDataManager = this.dataManager; // keep a second reference around
    timeLogEnd("dataManager", "Data averaging done");

    // create ndx
    timeLogStart("ndxManager");
    this.ndxManager = new NDXManager(this.seasonDataManager.ndxData, this);
    this.seasonNDXManager = this.ndxManager; // keep a second reference around
    timeLogEnd("ndxManager", "Done creating ndx");
    
    timeLogStart("chartDrawing");
    // this is the normal 100% resolution for all charts
    this.ndxManager.setCounterBounds(0,Infinity);

    this.multiLineChart = new MultiLineChart(this);
    this.brushChart = new BrushChart(this);
    this.gameSelectionChart = new GameSelectionChart(this);
    this.multiBarChart = new MultiBarChart(this);
    this.allDonutCharts = new AllDonutCharts(this);
    this.heatmapChart = new HeatmapChart(this);
    this.tableChart = new TableChart(this);
    this.chartLegend = new ChartLegend(this);

    // set heights
    this.allDonutCharts.setDivHeight(this.heatmapChart.getOuterDivHeight());
    timeLogEnd("chartDrawing", "All chart drawing done");
  };

  // update data and ndx managers
  this.isGameDisplaying = false;
  this.toggleGameDisplay = function(gameId){
    this.isGameDisplaying ? this.unloadGame() : this.loadGame(gameId);
  }

  this.loadGame = function(gameId){
    var that = this;

    // show spinner
    showSpinner();

    // first, just select that one game so we get the right label
    that.brushChart.brushGame(gameId);

    var gameURL = window.gameShowPath + gameId;
    d3.json(gameURL, function(error, gameData) {
      that.isGameDisplaying = true;
  
      that.dataManager = new GameDataManager('gameInfo', gameData, that);
      that.gameDataManager = that.dataManager; // keep a second reference around

      that.ndxManager = new NDXManager(that.gameDataManager.ndxData, that);
      that.gameNDXManager = that.ndxManager; // keep a second reference around

      that.ndxManager.setCounterBounds(0,Infinity);

      // set mode in charts
      that.gameSelectionChart.setGameMode();
      that.brushChart.repaint();
      that.brushChart.brushReset();

      // hide spinner
      hideSpinner();
    });
  };

  this.unloadGame = function(){
    this.isGameDisplaying = false;

    this.dataManager = this.seasonDataManager;
    this.ndxManager = this.seasonNDXManager;
    this.ndxManager.setCounterBounds(0,Infinity);

    // set mode in charts
    this.brushChart.repaint();
    this.gameSelectionChart.setSeasonMode();
    this.brushChart.brushReset();
  };

  //------------------------------------------------  
  // API Router

  // Common NDXManager
  this.setCounterBounds = function(brushLeft, brushRight){ 
    return this.ndxManager.setCounterBounds(brushLeft, brushRight);
  };
  this.getBEData = function(){ return this.ndxManager.getBEData(); };
  this.getBEComponentData = function(){ return this.ndxManager.getBEComponentData(); };
  this.getPCData = function(ndxDataAccessMethod){ return this.ndxManager[ndxDataAccessMethod](); };
  this.getHeatmapData = function(){ return this.ndxManager.getHeatmapData(); };

  // GameNDXManager
  // None

  // Common DataManager
  // None

  // SeasonDataManager
  this.getBrandGroupIds = function(){ return this.seasonDataManager.brandGroupIdArr; };
  this.getBrandGroupName = function(bgId){ return this.seasonDataManager.getBrandGroupName(bgId); };
  this.getBrandGroupColor = function(bgId){ return this.seasonDataManager.getBrandGroupColor(bgId); };
  this.getGameName = function(gameId){ return this.seasonDataManager.getGameName(gameId); };
  this.getGameColor = function(gameId){ return this.seasonDataManager.getGameColor(gameId); };
  this.getBrushedGames = function(){
    return this.seasonDataManager.getBrushedGames(
      this.ndxManager.getBeginCounter(), 
      this.ndxManager.getEndCounter());
  };
  this.getCounterForGame = function(gameId){ return this.seasonDataManager.getCounterForGame(gameId); };
  this.getSubSeasonData = function(){ return this.seasonDataManager.getSubSeasonData(); };
  this.getSubSeasonColor = function(subSeasonId){
    return this.seasonDataManager.getSubSeasonColor(subSeasonId);
  };
  this.getTableData = function(){ 
    return this.seasonDataManager.formatTableChartData(this.ndxManager.getTableData());
  };

  // GameDataManager
  // None

  // chart manipulation
  this.brushSet = function(beginCounter, endCounter){
    this.brushChart.brushSet(beginCounter, endCounter);
  };
  this.brushReset = function(){ this.brushChart.brushReset(); };
  this.getMultiLineXDomain = function(){ return this.multiLineChart.getXDomain(); };
  this.setMultiLineNewExtent = function(brushExtent){ this.multiLineChart.setNewExtent(brushExtent); };

  //------------------------------------------------  


  //------------------------------------------------  
  // let jquery manage call backs to update all charts
  var callbacks = $.Callbacks("unique");
  this.addCallback = function(callback){ callbacks.add(callback); };
  this.fire = function(){ callbacks.fire(); };
  //------------------------------------------------  
};

//------------------------------------------------  
