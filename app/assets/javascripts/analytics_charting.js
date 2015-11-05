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
    setTimeout(function(){ redraw() }, 5000);
  };
  redraw();

});
