/*------------------------------------------------
  Clips player
  ------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.BaseCharts = ZIGVU.Analytics.BaseCharts || {};


ZIGVU.Analytics.BaseCharts.ClipPlayer = function(videoId){
  var self = this;
  var url;
  this.eventManager = undefined;
  this.video = $(videoId).get(0);

  this.loadVideoPromise = function(videoSrc){
    url = videoSrc;
    self.video.src = url;
    self.video.autoplay = false;
    self.video.defaultMuted = true;
    self.video.muted = true;
    self.video.controls = false;
    self.video.pause();
    self.video.load();

    // we return a promise immediately from this function and resolve
    // it based on event firing on load success/failure
    var videoDefer = Q.defer();
    // if error, reject the promise
    self.video.addEventListener('error', function(){
      return videoDefer.reject("ZIGVU.Analytics.BaseCharts.ClipPlayer -> " +
        "Video can't be loaded. Src: " + videoSrc);
    });

    // notify caller when video is "loaded" and "seekable" by resolving promise
    self.video.addEventListener('canplaythrough', function() {
      console.log("Loaded video: " + url);
      return videoDefer.resolve(true);
    }, false);

    self.video.addEventListener('timeupdate', function() {
      var progressWidth = Math.floor((self.video.currentTime / self.video.duration) * 100) + '%';
      self.eventManager.fireProgressBarCallbacks(progressWidth);
    });

    self.video.addEventListener('ended', function() {
      self.eventManager.fireEndedCallbacks(videoId);
    });

    console.log("Loading video: " + url);
    return videoDefer.promise;
  };

  this.playPromise = function(){
    var videoDefer = Q.defer();
    if(!self.video.paused){
      videoDefer.resolve(true);
    } else {
      self.video.play();
      self.video.addEventListener('playing', function() {
        console.log("Playing video: " + url);
        return videoDefer.resolve(true);
      });
    }
    return videoDefer.promise;
  };
  this.pausePromise = function(){
    var videoDefer = Q.defer();
    if(self.video.paused){
      videoDefer.resolve(true);
    } else {
      self.video.pause();
      self.video.addEventListener('pause', function() {
        console.log("Pausing video: " + url);
        return videoDefer.resolve(true);
      });
    }
    return videoDefer.promise;
  };
  this.togglePlayPausePromise = function(){
    if(self.video.paused){
      return self.playPromise();
    } else {
      return self.pausePromise();
    }
  };

  this.hasEnded = function(){ return self.video.ended; };

  this.mute = function(){ self.video.muted = true; };
  this.unmute = function(){ self.video.muted = false; };

  this.requestFullscreen = function(){
    console.log("Setting fullscreen: " + url);
    if(self.video.requestFullscreen){
      self.video.requestFullscreen();
    } else if(self.video.msRequestFullscreen){
      self.video.msRequestFullscreen();
    } else if(self.video.mozRequestFullScreen){
      self.video.mozRequestFullScreen();
    } else if(self.video.webkitRequestFullscreen){
      self.video.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  };
  //------------------------------------------------
  // set relations
  this.setEventManager = function(ddd){ self.eventManager = ddd; return self; };
};
