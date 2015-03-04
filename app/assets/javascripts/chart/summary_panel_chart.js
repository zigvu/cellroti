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
    repaint_mediaLength();
    repaint_brandEffectivenss();
    repaint_brandAppearance();
    repaint_averageDuration();
  };

  function repaint_mediaLength(){
    var mediaLength = chartHelpers.getReadableBrushedTime(chartManager.getBrushedFrameTime());
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

  function repaint_brandEffectivenss(){
    // TODO: dummy data for now
    var dcData = chartManager.getPCData('getDetectionsCountData');
    var dcCount = _.reduce(dcData, function(total, d){ return total + d.sum; }, 0);
    dcCount = chartHelpers.getReadableCount(dcCount * 27.242); 
    $(div_averageBENumber).text(dcCount.number);
    $(div_averageBEUnit).text(dcCount.unit);
  };

  function repaint_brandAppearance(){
    var dcData = chartManager.getPCData('getDetectionsCountData');
    var dcCount = _.reduce(dcData, function(total, d){ return total + d.sum; }, 0);
    dcCount = chartHelpers.getReadableCount(dcCount); 
    $(div_totalBANumber).text(dcCount.number);
    $(div_totalBAUnit).text(dcCount.unit);
    // $(div_totalBAText).text(baText); // no change
  };

  function repaint_averageDuration(){
    var vdData = chartManager.getPCData('getViewDurationData');
    var vdCount = _.reduce(vdData, function(total, d){ return total + d.count; }, 0);
    var vdSum = _.reduce(vdData, function(total, d){ return total + d.sum; }, 0);

    avgD = vdSum/vdCount;

    var avgVD = chartHelpers.getReadableTime(vdSum/vdCount); 
    $(div_averageDurationNumber).text(avgVD.time);
    $(div_averageDurationUnit).text(avgVD.unit);
    // $(div_averageDurationText).text(avgVDText); // no change
  };

  //------------------------------------------------
  // finally, add call back to repaint charts
  chartManager.addCallback(repaint);
  //------------------------------------------------
};
