/*------------------------------------------------
  Filter manager
  ------------------------------------------------*/
/*
// Data Hash structure

current_filter: {
  :season_id, :game_id, 
}
*/

function FilterManager(chartManager){
  var self = this;

  this.current_filter = {
    season_id: -1,
    game_id: -1,
  }

  this.setSeasonId = function(seasonId){ self.current_filter.season_id = seasonId; }
  this.unsetSeasonId = function(){ self.current_filter.season_id = -1; }

  this.setGameId = function(gameId){ self.current_filter.game_id = gameId; }
  this.unsetGameId = function(){ self.current_filter.game_id = -1; }

  this.synch = function(){
    self.getGETRequestPromise(window.filterPath, {filters: self.current_filter});
  };

  this.reset = function(){
    self.current_filter = { 
      season_id: -1,
      game_id: -1,
    }
  };

  // note: we are not expecting results back from ajax
  this.getGETRequestPromise = function(url, params){
    $.ajax({
      url: url,
      data: params,
      type: "GET",
      success: function(json){ /* no content expected */ },
      error: function( xhr, status, errorThrown ) { console.log(errorThrown); }
    });
  };
};
