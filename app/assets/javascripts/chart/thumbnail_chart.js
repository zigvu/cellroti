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
  var videoCollectionShow_but = '#video-collection-show-button';
  var videoCollectionReveals_div = '#video-collection-reveals';
  var videoReveal_div = '#video-reveal';
  var wasChartRefreshed = false;

  function resetButton(butId){
    $(butId).addClass('title-button-unselected');
    $(butId).removeClass('title-button-selected');
  }
  function setButton(butId){
    $(butId).removeClass('title-button-unselected');
    $(butId).addClass('title-button-selected');
  }

  $(thumbnailChartRefresh_div).click(function(){
    wasChartRefreshed = true;
    setButton(videoCollectionShow_but);
    redrawThumbnails();
  });

  // capture on-click of modal
  function captureOnClick(){
    d3.select(thumbnailChartReveals_div).selectAll(".reveal-modal")
      .each(function (d,i){
        var tId = d3.select(this).attr("id");
        $(document).on('open.fndtn.reveal', '#' + tId + '[data-reveal]', function(){
          var thisD = thumbnailData[tId];
          var videoElem = d3.select(this).select(".thumbnail-container").select("video");
          videoFrameList = [{
            video_id: thisD.video_id,
            extracted_frame_number: thisD.extracted_frame_number
          }];
          sendClipCreateRequest(videoFrameList, videoElem);
        });
      });
    // summary video
    $(videoCollectionShow_but).click(function(){
      videoFrameList = [];
      _.each(thumbnailData, function(d){
        if (d.video_id > 0 && d.brand_effectiveness > 0.01){
          videoFrameList.push({
            video_id: d.video_id,
            extracted_frame_number: d.extracted_frame_number
          });
        }
      });
      if(videoFrameList.length > 0 && wasChartRefreshed){
        var videoElem = d3.select('#video-collection-reveals')
          .select(".thumbnail-container").select("video");
        sendClipCreateRequest(videoFrameList, videoElem);
        $(videoReveal_div).foundation('reveal','open');
      }
    });
  }
  captureOnClick();

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
      wasChartRefreshed = false;
      resetButton(videoCollectionShow_but);
      thumbnailData = newThumbnailData;
    }
  }

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

    var firstD;
    d3.select(thumbnailChartReveals_div).selectAll(".reveal-modal")
        .each(function (d,i){
          var thisD = thumbnailData[d3.select(this).attr("id")];
          if (firstD === undefined){ firstD = thisD; }
          d3.select(this).select(".thumbnail-container").select("video")
            .attr("poster", getFrameURL(thisD));
          d3.select(this).select(".game").text(getGameName(thisD));
          d3.select(this).select(".time").text(getGameTime(thisD));
          d3.select(this).select(".bg").text(getBrandGroupName(thisD));
          d3.select(this).select(".be").text(getBrandEffectiveness(thisD));
        });

    // update the video reveal as well
    d3.select(videoCollectionReveals_div).selectAll(".reveal-modal")
      .each(function (d,i){
        d3.select(this).select(".thumbnail-container").select("video")
          .attr("poster", getFrameURL(firstD));
      });

    $(thumbnailChartRefresh_div).css("display", "none");
  }
  //------------------------------------------------


  //------------------------------------------------
  // Get strings for URL/ids
  function getThumbnailURL(d){
    if (d.video_id > 0){
      return "/uploads/" + d.video_id + "/thumbnails/" + d.extracted_frame_number + ".jpg";
    } else {
      return "/uploads/refresh_to_load.jpg";
    }
  }
  function getFrameURL(d){
    if (d.video_id > 0){
      return "/uploads/" + d.video_id + "/frames/" + d.extracted_frame_number + ".jpg";
    } else {
      return "/uploads/refresh_to_load.jpg";
    }
  }

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
  function sendClipCreateRequest(videoFrameList, videoElem){
    var videoId = videoFrameList[0].video_id;
    if (videoId > 0){
      $.ajax({
        url: window.clipIdPath,
        async: false,
        type: "get",
        data: {
          video_frame_list: videoFrameList
        },
        success: function(retData){
          var videoSrc = "/uploads/" + videoId + "/clips/" + retData.clip_id + ".mp4";
          videoElem.attr("src", videoSrc);
        },
        error: function(xhr, statusText) {
          console.log("Error: " + statusText);
        }
      });
    }
  }
  //------------------------------------------------


  //------------------------------------------------
  // finally, add call back to repaint charts
  chartManager.addRepaintCallback(repaint);
  //------------------------------------------------
}
