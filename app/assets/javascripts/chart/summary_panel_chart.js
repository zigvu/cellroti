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

  // average brand appearance
  var div_totalBANumber = "#total-ba-number";
  var div_totalBAUnit = "#total-ba-unit";
  var div_totalBAText = "#total-ba-text";

  // average view duration
  var div_averageDurationNumber = "#average-duration-number";
  var div_averageDurationUnit = "#average-duration-unit";
  var div_averageDurationText = "#average-duration-text";

  repaint();

  //------------------------------------------------
  // Repaint upon request
  function repaint(){
    var mediaLength = chartHelpers.getReadableTime(chartManager.getBrushedFrameTime());
    var mediaText;
    if(mediaLength.num_games > 1){
      mediaText = "Media length across " + mediaLength.num_games + " games";
    } else {
      mediaText = "Media length in " + mediaLength.num_games + " game";
    }
    $(div_mediaLengthNumber).text(mediaLength.time);
    $(div_mediaLengthUnit).text(mediaLength.unit);
    $(div_mediaLengthText).text(mediaText);
  };

  

  //------------------------------------------------
  // finally, add call back to repaint charts
  chartManager.addCallback(repaint);
  //------------------------------------------------
};
