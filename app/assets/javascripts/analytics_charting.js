/*------------------------------------------------
  Begin: Analytics Season Show Javascript
  ------------------------------------------------*/

$(".analytics_seasons_summary").ready(function() {
  allChartPopulator = new AllChartPopulator();
});


$(".analytics_charting_analysis").ready(function() {
  allChartPopulator = new AllChartPopulator();
});

$(".analytics_charting_dashboard").ready(function() {
  controller = new ZIGVU.Analytics.CrossChannel.Controller();
  controller.setup();
  controller.draw();

  function redraw() {
    controller.dataManager.updateDummyData();
    controller.eventManager.fireRepaintCallback();
    setTimeout(function(){ redraw(); }, 5000);
  }
  redraw();

});

$(".analytics_charting_discover").ready(function() {
  var clipSetData = [
    {
      url: "/uploads/clips/clip_0.mp4", brand_group: 'Coca-Cola', stream: 'World Cup 2014', time: '2/15/2014 7:15PM', bg_color: 'red'
    },
    {
      url: "/uploads/clips/clip_1.mp4", brand_group: 'Visa', stream: 'World Cup 2014', time: '2/15/2014 8:15PM', bg_color: 'blue'
    },
    {
      url: "/uploads/clips/clip_2.mp4", brand_group: 'McDonalds', stream: 'World Cup 2014', time: '2/14/2014 2:15PM', bg_color: 'green'
    },
    {
      url: "/uploads/clips/clip_3.mp4", brand_group: 'Yingli', stream: 'World Cup 2014', time: '2/15/2014 3:43PM', bg_color: 'yellow'
    },
  ];
  clipsPlayerContainer = new ZIGVU.Analytics.Discover.ClipsPlayerContainer();
  clipsPlayerContainer.createClipSetPromise(clipSetData).then(function(){
    console.log("Loaded all clips");
    clipsPlayerContainer.startPlay();
  }).catch(function (errorReason) { console.log(errorReason); });
});

$(".high_voltage_pages_show").ready(function() {
  controller = new ZIGVU.Analytics.Discover.Controller();
  controller.setup();
  controller.draw();
});
