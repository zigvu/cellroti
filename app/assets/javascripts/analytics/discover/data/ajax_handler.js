/*------------------------------------------------
  AjaxHandler
  ------------------------------------------------*/

var ZIGVU = ZIGVU || {};
ZIGVU.Analytics = ZIGVU.Analytics || {};
ZIGVU.Analytics.Discover.Data = ZIGVU.Analytics.Discover.Data || {};

ZIGVU.Analytics.Discover.Data.AjaxHandler = function() {
  var self = this;
  this.baseUrl = '/api/v1';
  this.dataParser = new ZIGVU.Analytics.Discover.Data.DataParser();

  // Note: Getting from data tag requires camelcasing underscorers
  this.filterId = $('.ruby_vars').data('filterId');

  this.getDiscoverDataPromise = function(){
    var dataURL = self.baseUrl + '/filters/' + self.filterId + '/discover_data';
    var dataParam = {};

    var requestDefer = Q.defer();
    self.getGETRequestPromise(dataURL, dataParam)
      .then(function(data){
        var discoverData = self.dataParser.getDiscoverData(data);
        requestDefer.resolve(discoverData);
      })
     .catch(function (errorReason) {
        requestDefer.reject('ZIGVU.Analytics.Discover.Data.AjaxHandler ->' + errorReason);
      });
    return requestDefer.promise;
  };

  this.getDiscoverSummaryPromise = function(){
    var dataURL = self.baseUrl + '/filters/' + self.filterId + '/discover_summary';
    var dataParam = {};

    var requestDefer = Q.defer();
    self.getGETRequestPromise(dataURL, dataParam)
      .then(function(data){
        var summaryData = self.dataParser.getSummaryData(data);
        requestDefer.resolve(summaryData);
      })
     .catch(function (errorReason) {
        requestDefer.reject('ZIGVU.Analytics.Discover.Data.AjaxHandler ->' + errorReason);
      });
    return requestDefer.promise;
  };

  this.updateFilterStorePromise = function(filterStore){
    var dataURL = self.baseUrl + '/filters/' + self.filterId;
    var dataParam = {filter: {
      cal_begin_date: Math.floor(filterStore.dates.calBeginDate.getTime() / 1000.0),
      cal_end_date: Math.floor(filterStore.dates.calEndDate.getTime() / 1000.0)
    }};

    var requestDefer = Q.defer();
    self.setPUTRequestPromise(dataURL, dataParam)
      .then(function(data){
        requestDefer.resolve(data);
      })
     .catch(function (errorReason) {
        requestDefer.reject('ZIGVU.Analytics.Discover.Data.AjaxHandler ->' + errorReason);
      });
    return requestDefer.promise;
  };

  this.getGETRequestPromise = function(url, params){
    return self.genericRequestPromise("GET", url, params);
  };
  this.setPOSTRequestPromise = function(url, params){
    return self.genericRequestPromise("POST", url, params);
  };
  this.setPUTRequestPromise = function(url, params){
    return self.genericRequestPromise("PUT", url, params);
  };

  // note: while jquery ajax return promises, they are deficient
  // and we need to convert to `q` based promises
  this.genericRequestPromise = function(verb, url, params){
    var requestDefer = Q.defer();
    $.ajax({
      url: url,
      data: params,
      type: verb,
      success: function(json){ requestDefer.resolve(json); },
      error: function( xhr, status, errorThrown ) {
        requestDefer.reject("ZIGVU.Analytics.Discover.Data.AjaxHandler: " + errorThrown);
      }
    });
    return requestDefer.promise;
  };

  // shorthand for error printing
  this.err = function(errorReason){
    displayJavascriptError('ZIGVU.Analytics.Discover.Data.AjaxHandler -> ' + errorReason);
  };
};
