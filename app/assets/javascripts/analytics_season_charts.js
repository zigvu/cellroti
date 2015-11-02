/*------------------------------------------------
	Begin: Analytics Season Show Javascript
	------------------------------------------------*/

$(".analytics_seasons.summary").ready(function() {
  allChartPopulator = new AllChartPopulator();
});


$(".high_voltage_pages.show").ready(function() {
  controller = new ZIGVU.Analytics.CrossChannel.Controller();
  controller.setup();
  controller.draw();
});
