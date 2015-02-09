/*------------------------------------------------
	Generic reduce sum/count/average for arrays

	Note: It is inefficient to perform the average
	operation for each `p`. Hence, only sum and count
	are computed - at the point of usage, they can be
	used to compute average.
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
					}
				}
				
				++p.count;
				for(var i = 0; i < attrArr.length; i++){
					p.sum[attrArr[i]] += v[attrArr[i]];
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
				}
				return p;
			};
		},
		//------------------------------------------------
		/* Init */
		reduceInitAvg: function() {
			return { count:0, sum:{} };
		}
	},
	SINGLE: {
		//------------------------------------------------
		/* Add average */
		reduceAddAvg: function(attr) {
			return function(p,v) {
				++p.count;
				p.sum += v[attr];

				return p;
			};
		},
		//------------------------------------------------
		/* Remove average */
		reduceRemoveAvg: function(attr) {
			return function(p,v) {
				--p.count;
				p.sum -= v[attr];

				return p;
			};
		},
		//------------------------------------------------
		/* Init */
		reduceInitAvg: function() {
			return { count:0, sum:0 };
		}
	}
};
