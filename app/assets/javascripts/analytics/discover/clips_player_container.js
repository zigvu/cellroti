/*------------------------------------------------
  Responsive width calculator
  ------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.Discover = ZIGVU.Analytics.Discover || {};

ZIGVU.Analytics.Discover.ClipsPlayerContainer = function(){
  var self = this;
  // format:
  // [{nav_id:, player_id:, clip_player:}, ]
  this.clipPlayers = [];
  this.curClipPlayer = undefined;
  this.clipSetData = undefined;
  var isMuted = true;
  var isFullScreen = false;
  this.clipsEventManager = new ZIGVU.Analytics.Discover.ClipsEventManager();

  //------------------------------------------------
  // create clip players
  function progressBarCallback(barWidth){
    $(".clips-player .progress .meter").css("width", barWidth);
  }
  function endedCallback(playerId){
    var playerIdIdx = _.findIndex(self.clipPlayers, function(cp){
      return cp.player_id == playerId;
    });
    if(self.isInFullScreen()) { self.exitFullscreen(); }
    // if not the last clip, play next with same setting
    if(playerIdIdx < (self.clipPlayers.length - 1)){
      $(self.clipPlayers[playerIdIdx + 1].nav_id).click();
    } else {
      isFullScreen = false;
    }
  }

  this.collectClipPlayers = function(){
    var ids = _.map($("#clip-player-nav").find("a"), function(a){
      return a.id.split("clip-player-nav-")[1];
    });
    _.each(ids, function(id){
      var playerId = "#clip-player-video-" + id;
      var clipPlayer = new ZIGVU.Analytics.BaseCharts.ClipPlayer(playerId);
      clipPlayer.setEventManager(self.clipsEventManager);
      self.clipPlayers.push({
        nav_id: "#clip-player-nav-" + id,
        player_id: playerId,
        clip_player: clipPlayer
      });
    });
    // add actions on click
    _.each(self.clipPlayers, function(cp){
      $(cp.nav_id).click(function(){ self.playClip(cp); });
      $(cp.player_id).click(function(){
        if(cp.player_id == _.last(self.clipPlayers).player_id && cp.clip_player.hasEnded()){
          self.startPlay();
        } else {
          cp.clip_player.togglePlayPausePromise();
        }
      });
    });
    // associate callbacks
    self.clipsEventManager.addProgressBarCallbacks(progressBarCallback);
    self.clipsEventManager.addEndedCallbacks(endedCallback);
    // add actions on control buttons
    $("#description-control #volume").click(function(){ self.toggleMute(); });
    $("#description-control #fullscreen").click(function(){
      isFullScreen = true;
      self.curClipPlayer.clip_player.requestFullscreen();
    });
  };
  self.collectClipPlayers();
  //------------------------------------------------

  //------------------------------------------------
  // clip player sequencing
  this.playClip = function(newClipPlayer){
    if(!self.curClipPlayer){ self.curClipPlayer = self.clipPlayers[0]; }
    self.curClipPlayer.clip_player.pausePromise()
      .then(function(){
        self.curClipPlayer = newClipPlayer;
        return self.curClipPlayer.clip_player.playPromise();
      }).then(function(){
        if(isFullScreen){ self.curClipPlayer.clip_player.requestFullscreen(); }
        self.displayClipDetails(self.curClipPlayer.player_id);
      }).catch(function (errorReason) { err(errorReason); });
  };

  this.displayClipDetails = function(playerId){
    var playerIdIdx = _.findIndex(self.clipPlayers, function(cp){
      return cp.player_id == playerId;
    });
    var clipData = self.clipSetData[playerIdIdx];

    $("#description-details #brand-group").text(clipData.brand_group);
    $("#description-details #brand-group-square").css("background", clipData.bg_color);
    $("#description-details #stream").text(clipData.stream);
    $("#description-details #time").text(clipData.time);
  };

  this.toggleMute = function(){
    if(isMuted){
      _.each(self.clipPlayers, function(cp){ cp.clip_player.unmute(); });
      $("#description-control #volume i").addClass("fi-volume");
      $("#description-control #volume i").removeClass("fi-volume-strike");
      isMuted = false;
    } else {
      _.each(self.clipPlayers, function(cp){ cp.clip_player.mute(); });
      $("#description-control #volume i").addClass("fi-volume-strike");
      $("#description-control #volume i").removeClass("fi-volume");
      isMuted = true;
    }
  };
  //------------------------------------------------

  //------------------------------------------------
  // create and play sets
  this.createClipSetPromise = function(_clipSetData){
    self.clipSetData = _clipSetData;
    if(self.clipSetData.length != self.clipPlayers.length){
      console.log("URLs do not match clip sets");
      return;
    }
    var loadPromises = [];
    _.each(self.clipSetData, function(clipData, idx, list){
      loadPromises.push(self.clipPlayers[idx].clip_player.loadVideoPromise(clipData.url));
    });
    return Q.all(loadPromises);
  };

  this.startPlay = function(){
    $(_.first(self.clipPlayers).nav_id).click();
  };

  //------------------------------------------------
  // experimental full screen

  this.isInFullScreen = function(){
    return document.fullscreenElement || document.mozFullScreenElement ||
      document.webkitFullscreenElement || document.msFullscreenElement;
  };
  this.exitFullscreen = function(){
    console.log("Exiting full screen mode");
    if(document.exitFullscreen){
      document.exitFullscreen();
    } else if(document.msExitFullscreen){
      document.msExitFullscreen();
    } else if(document.mozCancelFullScreen){
      document.mozCancelFullScreen();
    } else if(document.webkitExitFullscreen){
      document.webkitExitFullscreen();
    }
  };


  //------------------------------------------------
  // shorthand for error printing
  this.err = function(errorReason){
    console.log('ZIGVU.Analytics.Discover.ClipsPlayerContainer -> ' + errorReason);
  };
};
//------------------------------------------------
