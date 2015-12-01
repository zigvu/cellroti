/*------------------------------------------------
  Thumbnail display
  ------------------------------------------------*/

function ThumbnailChart(chartManager){
  //------------------------------------------------
  // set up
  var chartHelpers = chartManager.chartHelpers;

  // div for chart
  var thumbnailChart_ul = '#thumbnail-chart';
  var thumbnailChartReveals_div = '#thumbnail-chart-reveals';
  var thumbnailChartRefresh_div = '#thumbnail-chart-refresh';
  $(thumbnailChartRefresh_div).click(redrawThumbnails);

  // draw for the first time
  var thumbnailData = chartManager.getThumbnailData();
  redrawThumbnails();

  //------------------------------------------------
  // Repaint upon request

  // currently, we require users to re-load images upon repaint
  function repaint(){
    var newThumbnailData = chartManager.getThumbnailData();

    // only require to refresh if we get new frame numbers
    var oldFrameIds = _.chain(thumbnailData).values().pluck('extracted_frame_number').value();
    var newFrameIds = _.chain(newThumbnailData).values().pluck('extracted_frame_number').value();
    if (!(_.isEqual(oldFrameIds, newFrameIds))){
      $(thumbnailChartRefresh_div).css("display", "flex");
      thumbnailData = newThumbnailData;
    }
  };

  function redrawThumbnails(){
    d3.select(thumbnailChart_ul).selectAll("li")
        .each(function (d, i){
          var thisD = thumbnailData[d3.select(this).attr("data-reveal-id")];

          d3.select(this).select("a").select("img").attr("src", getThumbnailURL(thisD));
          d3.select(this).select(".game").text(getGameName(thisD));
          d3.select(this).select(".time").text(getGameTime(thisD));
          d3.select(this).select(".bg").text(getBrandGroupName(thisD));
          d3.select(this).select(".be").text(getBrandEffectiveness(thisD));
        });

    d3.select(thumbnailChartReveals_div).selectAll(".reveal-modal")
        .each(function (d,i){
          var thisD = thumbnailData[d3.select(this).attr("id")];

          d3.select(this).select(".thumbnail-container").select("img").attr("src", getFrameURL(thisD));
          d3.select(this).select(".game").text(getGameName(thisD));
          d3.select(this).select(".time").text(getGameTime(thisD));
          d3.select(this).select(".bg").text(getBrandGroupName(thisD));
          d3.select(this).select(".be").text(getBrandEffectiveness(thisD));
        });

    $(thumbnailChartRefresh_div).css("display", "none");
  };
  //------------------------------------------------


  //------------------------------------------------
  // Get strings for URL/ids
  function getThumbnailURL(d){
    if (d.video_id > 0){
      return "/uploads/" + d.video_id + "/thumbnails/" + d.extracted_frame_number + ".jpg";
    } else {
      return "/uploads/refresh_to_load.jpg";
    }
  };
  function getFrameURL(d){
    if (d.video_id > 0){
      return "/uploads/" + d.video_id + "/frames/" + d.extracted_frame_number + ".jpg";
    } else {
      return "/uploads/refresh_to_load.jpg";
    }
  };

  function getGameName(d){
    if(d.video_id > 0){
      var label = chartManager.getGameName(d.game_id);
      return chartHelpers.ellipsis(label, 22, 1);
    } else {
      return "";
    }
  }
  function getGameTime(d){
    if(d.video_id > 0){ return chartHelpers.getHHmmSS(d.frame_time); }
    else { return ""; }
  }
  function getBrandGroupName(d){
    if(d.video_id > 0 && d.brand_effectiveness > 0.01){
      var label = chartManager.getBrandGroupName(d.det_group_id);
      return chartHelpers.ellipsis(label, 22, 1);
    } else {
      return "None";
    }
  }
  function getBrandEffectiveness(d){
    if(d.video_id > 0 && d.brand_effectiveness > 0.01){
      return d3.format(',%')(d.brand_effectiveness);
    }
    else { return "0%"; }
  }
  //------------------------------------------------


  //------------------------------------------------
  // finally, add call back to repaint charts
  chartManager.addRepaintCallback(repaint);
  //------------------------------------------------
};
