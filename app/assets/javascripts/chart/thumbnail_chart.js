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
  $(thumbnailChartRefresh_div).click(repaint);

  // repaint for the first time
  repaint();

  //------------------------------------------------
  // Repaint upon request
  function repaint(){
    var thumbnailData = chartManager.getThumbnailData();

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

};
//------------------------------------------------  
