/*------------------------------------------------
	Generic reduce add/average for arrays
	------------------------------------------------*/

// Namespace array functions
var REDUCEAVG = REDUCEAVG || {
	MULTIPLE: {
		//------------------------------------------------
		/* Add average */
		reduceAddAvg: function(attrArr) {
			return function(p,v) {
				// initialize
				if(p.count === 0){ 
					for(var i = 0; i < attrArr.length; i++){
						p.sum[attrArr[i]] = 0;
						p.avg[attrArr[i]] = 0;
					}
				}
				
				++p.count;
				for(var i = 0; i < attrArr.length; i++){
					p.sum[attrArr[i]] += v[attrArr[i]];
					p.count === 0 ? p.avg[attrArr[i]] = 0 : p.avg[attrArr[i]] = p.sum[attrArr[i]]/p.count;
				}
				return p;
			};
		},
		//------------------------------------------------
		/* Remove average */
		reduceRemoveAvg: function(attrArr) {
			return function(p,v) {
				--p.count;
				for(var i = 0; i < attrArr.length; i++){
					p.sum[attrArr[i]] -= v[attrArr[i]];
					p.count === 0 ? p.avg[attrArr[i]] = 0 : p.avg[attrArr[i]] = p.sum[attrArr[i]]/p.count;
				}
				return p;
			};
		},
		//------------------------------------------------
		/* Init */
		reduceInitAvg: function() {
			return { count:0, sum:{}, avg:{} };
		}
	},
	SINGLE: {
		//------------------------------------------------
		/* Add average */
		reduceAddAvg: function(attr) {
			return function(p,v) {
				++p.count;
				p.sum += v[attr];
				p.count === 0 ? p.avg = 0 : p.avg = p.sum/p.count;

				return p;
			};
		},
		//------------------------------------------------
		/* Remove average */
		reduceRemoveAvg: function(attr) {
			return function(p,v) {
				--p.count;
				p.sum -= v[attr];
				p.count === 0 ? p.avg = 0 : p.avg = p.sum/p.count;

				return p;
			};
		},
		//------------------------------------------------
		/* Init */
		reduceInitAvg: function() {
			return { count:0, sum:0, avg:0 };
		}
	}
};

// //------------------------------------------------
// /* Add average */

// function reduceAddAvg(attrArr) {
// 	return function(p,v) {
// 		// initialize
// 		if(p.count === 0){ 
// 			for(var i = 0; i < attrArr.length; i++){
// 				p.sum[attrArr[i]] = 0;
// 				p.avg[attrArr[i]] = 0;
// 			}
// 		}
		
// 		++p.count;
// 		for(var i = 0; i < attrArr.length; i++){
// 			p.sum[attrArr[i]] += v[attrArr[i]];
// 			p.count === 0 ? p.avg[attrArr[i]] = 0 : p.avg[attrArr[i]] = p.sum[attrArr[i]]/p.count;
// 		}
// 		return p;
// 	};
// }

// //------------------------------------------------  

// //------------------------------------------------
// /* Remove average */
// function reduceRemoveAvg(attrArr) {
// 	return function(p,v) {
// 		--p.count;
// 		for(var i = 0; i < attrArr.length; i++){
// 			p.sum[attrArr[i]] -= v[attrArr[i]];
// 			p.count === 0 ? p.avg[attrArr[i]] = 0 : p.avg[attrArr[i]] = p.sum[attrArr[i]]/p.count;
// 		}
// 		return p;
// 	};
// }

// //------------------------------------------------  

// //------------------------------------------------
// /* Init */
// function reduceInitAvg() {
// 	return { count:0, sum:{}, avg:{} };
// }

//------------------------------------------------  
