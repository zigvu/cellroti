/*------------------------------------------------
  Responsive width calculator
  ------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.CrossChannel = ZIGVU.Analytics.CrossChannel || {};

ZIGVU.Analytics.CrossChannel.ResponsiveCalculator = function(){
  var self = this;

  var divs = {
    'summary_chart_1': '#summary-chart-1',
    'summary_chart_2': '#summary-chart-2',
    'summary_chart_3': '#summary-chart-3',
    'summary_chart_4': '#summary-chart-4',
    'average_brand_effectiveness_chart': '#average-brand-effectiveness-bar-chart',
    'tv_spot_chart': '#tv-spot-chart',
    'view_duration_chart': '#view-duration-chart',
  };

  var heights = {
    'summary_chart_1': {'small': 110, 'medium': 100, 'large': 110},
    'summary_chart_2': {'small': 110, 'medium': 100, 'large': 110},
    'summary_chart_3': {'small': 110, 'medium': 100, 'large': 110},
    'summary_chart_4': {'small': 110, 'medium': 100, 'large': 110},
    'average_brand_effectiveness_chart': {'small': 220, 'medium': 220, 'large': 230},
    'tv_spot_chart': {'small': 200, 'medium': 220, 'large': 230},
    'view_duration_chart': {'small': 200, 'medium': 220, 'large': 230},
  };

  this.responsive = new ZIGVU.Analytics.BaseCharts.ResponsiveReflows(divs, heights);
  this.reflowHeights = function(){ self.responsive.reflowHeights(); };

  this.getSummaryChartDims_1 = function(){ return self.responsive.getDims('summary_chart_1'); };
  this.getSummaryChartDims_2 = function(){ return self.responsive.getDims('summary_chart_2'); };
  this.getSummaryChartDims_3 = function(){ return self.responsive.getDims('summary_chart_3'); };
  this.getSummaryChartDims_4 = function(){ return self.responsive.getDims('summary_chart_4'); };
  this.getABEChartDims = function(){ return self.responsive.getDims('average_brand_effectiveness_chart'); };
  this.getTVSpotChartDims = function(){ return self.responsive.getDims('tv_spot_chart'); };
  this.getViewDurationChartDims = function(){ return self.responsive.getDims('view_duration_chart'); };
};
//------------------------------------------------  
