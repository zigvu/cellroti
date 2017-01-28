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


$(".high_voltage_pages_show").ready(function() {
  // $('#thumbnail_li_0_reveal').click(function(){
  //   console.log("Clicked 0");
  // });
  // $(document).on('open.fndtn.reveal', '#thumbnail_li_0_reveal[data-reveal]', function () {
  //   console.log("Clicked 0");
  // });
  $(document).ready(attachDataRevealActions);
  console.log("Hello");
  // $(document).on('open.fndtn.reveal', '#thumbnail_li_0_reveal[data-reveal]', function(){
  //   console.log('test');
  // });
});
