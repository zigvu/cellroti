/*------------------------------------------------
  Summary Panel display
  ------------------------------------------------*/

function SummaryPanelChart(chartManager){
  //------------------------------------------------
  // set up
  var chartHelpers = chartManager.chartHelpers;

  // media length
  var div_mediaLengthNumber = "#media-length-number";
  var div_mediaLengthUnit = "#media-length-unit";
  var div_mediaLengthText = "#media-length-text";

  // average brand effectiveness
  var div_averageBENumber = "#average-be-number";
  var div_averageBEUnit = "#average-be-unit";
  var div_averageBEText = "#average-be-text";

  // average view duration
  var div_averageDurationNumber = "#average-duration-number";
  var div_averageDurationUnit = "#average-duration-unit";
  var div_averageDurationText = "#average-duration-text";

  // total brand appearance
  var div_totalBANumber = "#total-ba-number";
  var div_totalBAUnit = "#total-ba-unit";
  var div_totalBAText = "#total-ba-text";

  repaint();

  //------------------------------------------------
  // Repaint upon request
  function repaint(){
    repaint_mediaLength();
    repaint_brandEffectivenss();
    repaint_averageDuration();
    repaint_brandAppearance();
  };

  function repaint_mediaLength(){
    var mediaLength = chartHelpers.getReadableBrushedTime(chartManager.getBrushedFrameTime());
    var mediaText;
    if(mediaLength.num_games > 1){
      mediaText = "Selected media length across " + mediaLength.num_games + " games";
    } else {
      mediaText = "Selected Media length in " + mediaLength.num_games + " game";
    }
    $(div_mediaLengthNumber).text(mediaLength.time);
    $(div_mediaLengthUnit).text(mediaLength.unit);
    $(div_mediaLengthText).text(mediaText);
  }; 

  function repaint_brandEffectivenss(){
    var count = chartManager.getTvEquivalentDuration();
    var formattedCount = chartHelpers.getReadableTime(count);
    $(div_averageBENumber).text(formattedCount.time);
    $(div_averageBEUnit).text(formattedCount.unit);
  };

  function repaint_averageDuration(){
    var count = chartManager.getAverageViewPersistence();
    var formattedCount = chartHelpers.getReadableTime(count);
    $(div_averageDurationNumber).text(formattedCount.time);
    $(div_averageDurationUnit).text(formattedCount.unit);
  };

  function repaint_brandAppearance(){
    var count = chartManager.getTotalViewDuration();
    var formattedCount = chartHelpers.getReadableTime(count);
    $(div_totalBANumber).text(formattedCount.time);
    $(div_totalBAUnit).text(formattedCount.unit);
  };

  //------------------------------------------------
  // finally, add call back to repaint charts
  chartManager.addRepaintCallback(repaint);
  //------------------------------------------------
};
