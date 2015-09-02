/*------------------------------------------------
  Chart Manager
  ------------------------------------------------*/

function ChartManager(seasonInfo, seasonData){
  var self = this;

  // variables for different charts
  this.numOfDataPtsPerBGInSeriesChart = 1000;
  this.numRowsInTableChart = 10;
  this.numOfGamesInSubSeasonChart = 2;

  // access to internal variables
  this.seasonDataParser = undefined;
  this.gameDataParser = undefined;
  this.dataManager = undefined;
  this.ndxManager = undefined;

  this.drawCharts = function(){
    this.chartHelpers = new ChartHelpers();

    timeLogStart("dataManager");
    this.seasonDataParser = new DataParser(seasonInfo, seasonData, self);
    this.seasonDataManager = new SeasonDataManager(self.seasonDataParser, self);
    timeLogEnd("dataManager", "Data averaging done");

    // create ndx
    timeLogStart("ndxManager");
    this.seasonNDXManager = new NDXManager(self.seasonDataManager.ndxData, self);
    timeLogEnd("ndxManager", "Done creating ndx");

    // set to current
    this.dataManager = self.seasonDataManager;
    this.ndxManager = self.seasonNDXManager;
    
    timeLogStart("chartDrawing");
    // the normal 100% resolution for all charts
    self.setCounterBounds(0,Infinity);

    this.multiLineChart = new MultiLineChart(self);
    this.brushChart = new BrushChart(self);
    this.gameSelectionChart = new GameSelectionChart(self);
    this.multiBarChart = new MultiBarChart(self);
    this.allDonutCharts = new AllDonutCharts(self);
    this.heatmapChart = new HeatmapChart(self);
    this.tableChart = new TableChart(self);
    this.thumbnailChart = new ThumbnailChart(self);
    this.chartLegend = new ChartLegend(self);
    this.summaryPanelChart = new SummaryPanelChart(self);

    // finalize inits
    self.allDonutCharts.setDivHeight(self.heatmapChart.getOuterDivHeight());
    timeLogEnd("chartDrawing", "All chart drawing done");
  };

  // update data and ndx managers
  this.isGameDisplaying = false;
  this.toggleGameDisplay = function(gameId){
    self.isGameDisplaying ? self.unloadGame() : self.loadGame(gameId);
  }

  this.loadGame = function(gameId){
    // show spinner
    showSpinner();

    // first, just select one game so we get the right label
    self.brushChart.brushGame(gameId);

    var gameURL = window.gameShowPath + gameId;
    d3.json(gameURL, function(error, gameData) {
      // note: `this` will give us the d3.json context so avoid and use self instead
      self.isGameDisplaying = true;
  
      self.gameDataParser = new DataParser(seasonInfo, gameData, self);
      self.gameDataManager = new GameDataManager(self.gameDataParser, self);
      self.gameNDXManager = new NDXManager(self.gameDataManager.ndxData, self);

      // set to current
      self.dataManager = self.gameDataManager;
      self.ndxManager = self.gameNDXManager;

      self.setCounterBounds(0,Infinity);

      // set mode in charts
      self.gameSelectionChart.setGameMode();
      self.brushChart.repaint();
      self.brushChart.brushReset();

      // hide spinner
      hideSpinner();
    });
  };

  this.unloadGame = function(){
    self.isGameDisplaying = false;

    self.dataManager = self.seasonDataManager;
    self.ndxManager = self.seasonNDXManager;
    self.setCounterBounds(0,Infinity);

    // set mode in charts
    self.brushChart.repaint();
    self.gameSelectionChart.setSeasonMode();
    self.brushChart.brushReset();
  };

  //------------------------------------------------  
  // API Router

  // Common NDXManager
  this.setCounterBounds = function(brushLeft, brushRight){ 
    var numBrandGroups = self.seasonDataManager.brandGroupIdArr.length;
    var boundDetails = self.ndxManager.setCounterBounds(brushLeft, brushRight);
    
    // max of 100 updates
    var boundariesUpdated = false;
    for(var i = 0; i < 100; i++){
      if(boundDetails.total_data_points/numBrandGroups >= 2){ break; }
      brushLeft = _.max([0, brushLeft - 1]);
      brushRight = brushRight + 1;
      boundDetails = self.ndxManager.setCounterBounds(brushLeft, brushRight);
      boundariesUpdated = true;
    }
    if(boundariesUpdated){
      self.brushSet(brushLeft, brushRight);
    } else {
      self.fire();
    }
  };
  this.getBEData = function(){ return self.ndxManager.getBEData(); };
  this.getBEComponentData = function(){ return self.ndxManager.getBEComponentData(); };
  this.getPCData = function(ndxDataAccessMethod){ return self.ndxManager[ndxDataAccessMethod](); };
  this.getHeatmapData = function(){ return self.ndxManager.getHeatmapData(); };

  // GameNDXManager
  // None

  // Common DataManager
  // get brushed time
  this.getBrushedFrameTime = function(){
    return self.dataManager.getBrushedFrameTime(
        self.ndxManager.getBeginCounter(), 
        self.ndxManager.getEndCounter());
  };

  // SeasonDataManager
  this.getBrandGroupIds = function(){ return self.seasonDataManager.brandGroupIdArr; };
  this.getBrandGroupName = function(bgId){ return self.seasonDataManager.getBrandGroupName(bgId); };
  this.getBrandGroupColor = function(bgId){ return self.seasonDataManager.getBrandGroupColor(bgId); };
  this.getGameName = function(gameId){ return self.seasonDataManager.getGameName(gameId); };
  this.getGameColor = function(gameId){ return self.seasonDataManager.getGameColor(gameId); };
  this.getBrushedGames = function(){
    return self.seasonDataManager.getBrushedGames(
      self.ndxManager.getBeginCounter(), 
      self.ndxManager.getEndCounter());
  };
  this.getCounterForGame = function(gameId){ return self.seasonDataManager.getCounterForGame(gameId); };
  this.getSubSeasonData = function(){ return self.seasonDataManager.getSubSeasonData(); };
  this.getSubSeasonColor = function(subSeasonId){
    return self.seasonDataManager.getSubSeasonColor(subSeasonId);
  };
  this.getTableData = function(){ 
    return self.seasonDataManager.formatTableChartData(self.ndxManager.getTableData());
  };
  this.getThumbnailData = function(){
    return self.seasonDataManager.formatThumbnailChartData(self.ndxManager.getThumbnailData());
  };
  this.getGameEventName = function(geId){ return self.seasonDataManager.getGameEventName(geId); };
  this.getGameEventColor = function(geId){ return self.seasonDataManager.getGameEventColor(geId); };


  // GameDataManager
  this.getBrushedEvents = function(){
    if(self.isGameDisplaying){
      return self.gameDataManager.getBrushedEvents(
        self.ndxManager.getBeginCounter(), 
        self.ndxManager.getEndCounter());
    } else {
      return [];
    }
  };


  // chart manipulation
  this.brushSet = function(beginCounter, endCounter){
    self.brushChart.brushSet(beginCounter, endCounter);
  };
  this.brushReset = function(){ self.brushChart.brushReset(); };
  this.getMultiLineXDomain = function(){ return self.multiLineChart.getXDomain(); };
  this.setMultiLineNewExtent = function(brushExtent){ self.multiLineChart.setNewExtent(brushExtent); };

  //------------------------------------------------  


  //------------------------------------------------  
  // let jquery manage call backs to update all charts
  var callbacks = $.Callbacks("unique");
  this.addCallback = function(callback){ callbacks.add(callback); };
  this.fire = function(){ callbacks.fire(); };
  //------------------------------------------------  
};

//------------------------------------------------  
