/*------------------------------------------------
	Generic reduce add/average for arrays
	------------------------------------------------*/

//------------------------------------------------
/* Add average */

function reduceAddAvg(attrArr) {
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
}

//------------------------------------------------  

//------------------------------------------------
/* Remove average */
function reduceRemoveAvg(attrArr) {
	return function(p,v) {
		--p.count;
		for(var i = 0; i < attrArr.length; i++){
			p.sum[attrArr[i]] -= v[attrArr[i]];
			p.count === 0 ? p.avg[attrArr[i]] = 0 : p.avg[attrArr[i]] = p.sum[attrArr[i]]/p.count;
		}
		return p;
	};
}

//------------------------------------------------  

//------------------------------------------------
/* Init */
function reduceInitAvg() {
	return { count:0, sum:{}, avg:{} };
}

//------------------------------------------------  
