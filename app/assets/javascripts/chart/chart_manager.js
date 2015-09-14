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

  //------------------------------------------------  
  // Initialize and update of charts

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

    // create chart objects
    this.multiLineHelper = new MultiLineHelper(self);
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

  // brush
  this.brushSet = function(beginCounter, endCounter){
    self.brushChart.brushSet(beginCounter, endCounter);
  };
  this.brushReset = function(){ self.brushChart.brushReset(); };
  this.getMultiLineXDomain = function(){ return self.multiLineChart.getXDomain(); };
  this.setMultiLineNewExtent = function(brushExtent){
    self.multiLineChart.setNewExtent(brushExtent);
  };


  // timeline chart  
  this.resetTimelineChart = function(){
    self.multiLineHelper.resetTimelineChart();
    self.repaintAll();
  };
  this.handleClickOnBgBar = function(chartType, bgIds){
    self.multiLineHelper.handleClickOnBgBar(chartType, bgIds);
    self.repaintAll();
  };
  this.repaintAll = function(){
    self.brushChart.repaint();
    self.fireRepaintCallback();
    self.fireTimelineChartSelectionCallback();    
  };
  //------------------------------------------------  


  //------------------------------------------------  
  // Game handling

  // update data and ndx managers
  var isGameDisplaying = false;
  this.getIsGameDisplaying = function(){ return isGameDisplaying; };

  this.toggleGameDisplay = function(gameId){
    isGameDisplaying ? self.unloadGame() : self.loadGame(gameId);
  };

  this.loadGame = function(gameId){
    // show spinner
    showSpinner();

    // first, just select one game so we get the right label
    self.brushChart.brushGame(gameId);

    var gameURL = window.gameShowPath + gameId;
    d3.json(gameURL, function(error, gameData) {
      // note: `this` will give us the d3.json context so avoid and use self instead
      isGameDisplaying = true;
  
      self.gameDataParser = new DataParser(seasonInfo, gameData, self);
      self.gameDataManager = new GameDataManager(self.gameDataParser, self);
      self.gameNDXManager = new NDXManager(self.gameDataManager.ndxData, self);

      // set to current
      self.dataManager = self.gameDataManager;
      self.ndxManager = self.gameNDXManager;

      self.setCounterBounds(0,Infinity);

      // set mode in charts
      self.gameSelectionChart.setGameMode();
      self.resetTimelineChart();
      self.brushChart.brushReset();

      // hide spinner
      hideSpinner();
    });
  };

  this.unloadGame = function(){
    isGameDisplaying = false;

    self.dataManager = self.seasonDataManager;
    self.ndxManager = self.seasonNDXManager;
    self.setCounterBounds(0,Infinity);

    // set mode in charts
    self.gameSelectionChart.setSeasonMode();
    self.resetTimelineChart();
    self.brushChart.brushReset();
  };
  //------------------------------------------------  


  //------------------------------------------------  
  // API Router

  // Common NDXManager
  this.setCounterBounds = function(brushLeft, brushRight){ 
    var numBrandGroups = self.seasonDataManager.brandGroupIdArr.length;
    var boundDetails = self.ndxManager.setCounterBounds(brushLeft, brushRight);
    
    // expand brush (up to 100 counters on each side) to ensure we have at
    // least 2 data points per brand group
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
      self.fireRepaintCallback();
    }
  };

  this.getTimelineChartData = function(){ 
    return self.ndxManager.getTimelineChartData(self.getTimelineChartBgIds()); 
  };
  this.getBrushChartData = function(){
    return self.ndxManager.getBrushChartData(self.getTimelineChartBgIds()); 
  };
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
    var bgIds = self.getTimelineChartBgIds();
    var thumbnailData = self.ndxManager.getThumbnailData(bgIds);
    return self.seasonDataManager.formatThumbnailChartData(thumbnailData);
  };
  this.getGameEventName = function(geId){ return self.seasonDataManager.getGameEventName(geId); };
  this.getGameEventColor = function(geId){ return self.seasonDataManager.getGameEventColor(geId); };


  // GameDataManager
  this.getBrushedEvents = function(){
    if(isGameDisplaying){
      return self.gameDataManager.getBrushedEvents(
        self.ndxManager.getBeginCounter(), 
        self.ndxManager.getEndCounter());
    } else {
      return [];
    }
  };

  // Timeline chart manipulation
  this.getTimelineChartType = function(){ return self.multiLineHelper.getTimelineChartType(); };
  this.getTimelineChartBgIds = function(){ return self.multiLineHelper.getTimelineChartBgIds(); };
  //------------------------------------------------  


  //------------------------------------------------  
  // let jquery manage call backs to update all charts
  var repaintCallbacks = $.Callbacks("unique");
  this.addRepaintCallback = function(callback){ repaintCallbacks.add(callback); };
  this.fireRepaintCallback = function(){ repaintCallbacks.fire(); };

  var timelineChartSelectionCallback = $.Callbacks("unique");
  this.addTimelineChartSelectionCallback = function(callback){ timelineChartSelectionCallback.add(callback); };
  this.fireTimelineChartSelectionCallback = function(){
    timelineChartSelectionCallback.fire(self.getTimelineChartType(), self.getTimelineChartBgIds());
  };
  //------------------------------------------------  
};

//------------------------------------------------  
