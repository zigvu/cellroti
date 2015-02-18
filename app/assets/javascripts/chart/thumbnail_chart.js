/*------------------------------------------------
  Thumbnail display
  ------------------------------------------------*/

function ThumbnailChart(chartManager){
  //------------------------------------------------
  // set up
  //var chartHelpers = chartManager.chartHelpers;

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
    var oldFrameIds = _.chain(thumbnailData).values().pluck('frame_id').value();
    var newFrameIds = _.chain(newThumbnailData).values().pluck('frame_id').value();
    if (!(_.isEqual(oldFrameIds, newFrameIds))){
      $(thumbnailChartRefresh_div).css("display", "flex");
      thumbnailData = newThumbnailData;
    }
  };

  function redrawThumbnails(){
    d3.select(thumbnailChart_ul).selectAll("li")
        .each(function (d, i){
          var thumbnailURL = getThumbnailURL(thumbnailData[d3.select(this).attr("data-reveal-id")]);
          d3.select(this).select("a").select("img").attr("src", thumbnailURL);
        });

    d3.select(thumbnailChartReveals_div).selectAll("div")
        .each(function (d,i){
          var frameURL = getFrameURL(thumbnailData[d3.select(this).attr("id")]); 
          d3.select(this).select("img").attr("src", frameURL);
        });

    $(thumbnailChartRefresh_div).css("display", "none");
  };
  //------------------------------------------------


  //------------------------------------------------
  // Get strings for URL/ids
  function getRevealModelId(d, i){
    return "thumbnail_li_" + i + "_reveal";
  };

  function getThumbnailURL(d){
    if (d.game_id > 0){
      return "/uploads/" + d.game_id + "/thumbnails/" + d.frame_id + ".jpg";
    } else {
      return "/uploads/refresh_to_load.jpg";
    }
  };

  function getFrameURL(d){
    if (d.game_id > 0){
      return "/uploads/" + d.game_id + "/frames/" + d.frame_id + ".jpg";
    } else {
      return "/uploads/refresh_to_load.jpg";
    }
  };
  //------------------------------------------------



  //------------------------------------------------
  // finally, add call back to repaint charts
  chartManager.addCallback(repaint);
  //------------------------------------------------
};
