/*------------------------------------------------
  Filter for chart
  ------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.CrossChannel = ZIGVU.Analytics.CrossChannel || {};
ZIGVU.Analytics.CrossChannel.Charts = ZIGVU.Analytics.CrossChannel.Charts || {};

ZIGVU.Analytics.CrossChannel.Charts.Filter = function(){
  var self = this;

  //------------------------------------------------
  // set up
  this.dataManager = undefined;
  this.eventManager = undefined;
  this.responsiveCalculator = undefined;
  this.chartHelpers = undefined;

  this.summaryChartData = undefined;
  this.summaryChartMultiple = undefined;

  this.draw = function(){
    var d = self.dataManager;
    draw_li(
      d.getBrandGroupIds, d.getBrandGroupName, 
      d.getBrandGroupColor, '#brand-groups-ul'
    );
    draw_li(
      d.getChannelIds, d.getChannelName, 
      undefined, '#channels-ul'
    );
    draw_li(
      d.getSportIds, d.getSportName, 
      undefined, '#sports-ul'
    );
  };

  function draw_li(func_array, func_name, func_color, ul_div_id){
    _.each(func_array(), function(item){
      var legendText = func_name(item);
      var legendTextTrunc = self.chartHelpers.ellipsis(legendText, 15, 1);

      var square = $("<div/>", { class: "square" });
      if(func_color){ square.css("background-color", func_color(item)); }

      var li = $("<li/>");
      li.prepend(square);
      li.append($("<div/>", { text: legendTextTrunc, class: "text" }));
      li.attr("title", legendText);

      $(ul_div_id).append(li);
    });
  };



  //------------------------------------------------
  // set relations
  this.setDataManager = function(ddd){ self.dataManager = ddd; return self; };
  this.setEventManager = function(ddd){ self.eventManager = ddd; return self; };
  this.setResponsiveCalculator = function(ddd){ self.responsiveCalculator = ddd; return self; };
  this.setChartHelpers = function(ddd){ self.chartHelpers = ddd; return self; };
};
