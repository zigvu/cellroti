/*------------------------------------------------
	Begin: Helper functions
	------------------------------------------------*/

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
