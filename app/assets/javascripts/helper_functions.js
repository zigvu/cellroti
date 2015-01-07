/*------------------------------------------------
	Begin: Helper functions
	------------------------------------------------*/

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
