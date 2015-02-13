/*------------------------------------------------
	Begin: Helper functions
	------------------------------------------------*/

//------------------------------------------------
/* Chart elements debounce time */
// do not call the functions (those decorated by underscore.js)
// more than once in the time below
chartDebounceTime = 500; // milliseconds


//------------------------------------------------
/* To show/hide wait spinners */
showSpinner = function() {
  $("#spinner-overlay").center();
  $("#spinner-popup").center();
  $("#spinner-overlay").show();
  $("#spinner-popup").show();
  $("#spinner-popup").spin("large", "white");
}
hideSpinner = function() {
  $("#spinner-overlay").hide();
  $("#spinner-popup").hide();
  $("#spinner-popup").spin(false);
};
//------------------------------------------------

//------------------------------------------------
/* Decorate top-bar navigation li items with "active" class */
function decorateNavigationList(){
	// for each page, we set class to controller name
	var bodyClass = $('body').attr('class').split(" ");
	for (var i = 0, l = bodyClass.length; i < l; ++i) {
		// get the right element - assume id is set for each li
		var navElem = $("li#" + bodyClass[i]);
		// set active class
		$("nav.top-bar").find(navElem).attr('class', 'active');
	}
}
//------------------------------------------------

//------------------------------------------------
/* Sort objects with IDs */
function sortById(a, b){
  var aId = a.id;
  var bId = b.id; 
  return ((aId < bId) ? -1 : ((aId > bId) ? 1 : 0));
};
//------------------------------------------------

//------------------------------------------------
/* Log time */
var timeLogEnabled = true;
var timeLogs = {};
function timeLogStart(logId){
	if (timeLogEnabled){
		timeLogs[logId] = new Date();
	}
};
function timeLogEnd(logId, message){
	if (timeLogEnabled){
		console.log("Time: " + message + ": " + ((new Date()).getTime() - timeLogs[logId].getTime())/1000);
	}
};
//------------------------------------------------

//------------------------------------------------
/* Debugging print tool for filters */
function print_filter(filter){
	var f=eval(filter);
	if (typeof(f.length) != "undefined") {} else {}
		if (typeof(f.top) != "undefined") {
			f = f.top(Infinity);
		} else {}
		if (typeof(f.dimension) != "undefined") {
			f = f.dimension(function(d) { return "";}).top(Infinity);
		} else {}
		console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
	}
//print_filter("brandCrowdingGroup");
//------------------------------------------------  
