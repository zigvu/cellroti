/*------------------------------------------------
	Begin: Analytics Season Show Javascript
	------------------------------------------------*/

	$(".analytics_seasons.show").ready(function() {

	// read JSON - nested to force the first call to finish prior to second call
	d3.json(window.seasonLabelPath, function(error, seasonInfo) {
		d3.json(window.seasonShowPath, function(error, seasonData) {
			parsedData = parseSeasonData(seasonInfo, seasonData);
			seasonsShowCrossFilterChart(parsedData);
		});
	});

});

/*------------------------------------------------
	Cross filter chart scripts
	------------------------------------------------*/

// Cross filter charts are created using dc.js library
seasonsShowCrossFilterChart = function(parsedData) {
	// decompose from tuple
	var gameIds = parsedData["gameIds"];
	var brandGroupIds = parsedData["brandGroupIds"];
	var ndxData = parsedData["ndxData"];

	// Run the data through crossfilter
	var ndx = crossfilter(ndxData);
	var all = ndx.groupAll();

	//------------------------------------------------
	/* Generic averaging reduce functions */
	function reduceAddAvg(attr) {
		return function(p,v) {
			++p.count;
			p.sum += v[attr];
			p.avg = p.sum/p.count;
			return p;
		};
	}
	function reduceRemoveAvg(attr) {
		return function(p,v) {
			--p.count;
			p.sum -= v[attr];
			p.avg = p.sum/p.count;
			return p;
		};
	}
	function reduceInitAvg() {
		return { count:0, sum:0, avg:0 };
	}
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
	//print_filter("brandCrowdingDimGroup");
	//------------------------------------------------  


	// Create the dc.js chart objects & link to div
	var sc_brandEffectiveness = dc.seriesChart("#dc-brand-effectiveness-series-chart");
	var cc_rangeChart = dc.barChart("#dc-brand-effectiveness-range-chart");
	var bc_brandCrowding = dc.barChart("#dc-brand-crowding-bar-chart");


	//------------------------------------------------
	/* Common geometry and ndx dimensions/groups */
	var full_width = 896;
	var full_height = 300;
	var full_margins = {top: 10, right: 10, bottom: 40, left: 40};
	var half_width = 412;
	var half_height = 200;
	var half_margins = {top: 10, right: 10, bottom: 40, left: 40};

	var counterDomain = d3.extent(ndxData, function(d) { return d.counter; });
	var counterDim = ndx.dimension(function (d) { return d.counter; });
	var counterDimGroup = counterDim.group(); // count

	var gameDim = ndx.dimension(function (d) { return d.game_id; });
	var gameDimGroup = gameDim.group().reduceSum(function(d) { 
		return d.counter;
	});

	var brandEffectivenessDim = ndx.dimension(function (d) { 
		return [d.counter, d.bg_id];
	});
	var brandEffectivenessDimGroup = brandEffectivenessDim.group().reduceSum(function(d) { 
		return d.brand_effectiveness;
	});

	var brandCrowdingDim = ndx.dimension(function (d) { return d.bg_id; });
	var brandCrowdingDimGroup = brandCrowdingDim.group().reduce(
		reduceAddAvg('brand_group_crowding'), 
		reduceRemoveAvg('brand_group_crowding'), 
		reduceInitAvg
	);
	//------------------------------------------------
	/* Brand effectiveness series chart */

	var beSC_xAxisLabel = 'Game Time';
	var beSC_yAxisLabel = 'Brand Effectiveness';

	sc_brandEffectiveness
		.width(full_width)
		.height(full_height)
		.margins(full_margins)
		.dimension(counterDim)
		.group(brandEffectivenessDimGroup)
		.keyAccessor(function(d) {return +d.key[0];})
		.seriesAccessor(function(d) {return d.key[1];})
		.valueAccessor(function(d) {return +d.value;})
		//.chart(function(c) { return dc.lineChart(c).interpolate('linear'); })  // basis
		.x(d3.scale.linear().domain(counterDomain))
		//.x(d3.scale.linear().domain([0,20]))
		//.elasticX(true)
		.elasticY(true)
		.brushOn(false)
		.yAxisLabel(beSC_yAxisLabel)
		.xAxisLabel(false)
		.mouseZoomable(false)
		.rangeChart(cc_rangeChart)
		.clipPadding(10);
		
	//.legend(dc.legend().x(250).y(100).itemHeight(13).gap(5).horizontal(1).legendWidth(140).itemWidth(70));
	//chart.yAxis().tickFormat(function(d) {return d3.format(',d')(d+299500);});
	//chart.margins().left += 40;
	//------------------------------------------------  

	//------------------------------------------------
	/* Brand effectiveness range chart */

	cc_rangeChart
		.width(full_width)
		.height(100)
		.margins(full_margins)
		.x(d3.scale.linear().domain(counterDomain))
		.dimension(counterDim)
		.group(counterDimGroup)
		.gap(0)
		.colors(d3.scale.ordinal().domain(["positive","negative"]).range(["#00FF00","#FF0000"]))
		.colorAccessor(function(d) { 
			//console.log(d);
			if(d.key < 5) {
				return "positive";
			} else {
				return "negative";
			}
		})
		.renderlet(function(chart){
			var barsData = [];
			var bars = chart.selectAll('.bar').each(function(d) { barsData.push(d); });

			//Remove old values (if found)
			d3.select(bars[0][0].parentNode).select('#inline-labels').remove();
			//Create group for labels 
			var gLabels = d3.select(bars[0][0].parentNode).append('g').attr('id','inline-labels');

			for (var i = bars[0].length - 1; i >= 0; i--) {

				var b = bars[0][i];
				//Only create label if bar height is tall enough
				if (+b.getAttribute('height') < 18) continue;

				if (i == 0 || i == 5){
					gLabels
						.append("text")
						.text("Game " + i) //barsData[i].data.key
						//.attr('x', +b.getAttribute('x') + (b.getAttribute('width')/2) )
						.attr('x', +b.getAttribute('x') + (b.getAttribute('width')/2) )
						.attr('y', +b.getAttribute('y') + 15)
						.attr('text-anchor', 'left')
						.attr('fill', 'white');
					}
			}
		})
		// .yAxisLabel(false)
		// .xAxisLabel(false)
		.valueAccessor(function(d) {return 1;})
		.brushOn(true);


	//------------------------------------------------

	//------------------------------------------------
	/* Brand crowding bar chart */

	bc_brandCrowding
		.width(half_width)
		.height(half_height)
		.margins(half_margins)
		.x(d3.scale.ordinal())
		.xUnits(dc.units.ordinal)
		.brushOn(false)
		.xAxisLabel('Brand Groups')
		.yAxisLabel('Crowding Score')
		.dimension(brandCrowdingDim)
		.group(brandCrowdingDimGroup)
		.valueAccessor(function(d) {return d.value.avg})
		.barPadding(0.1)
		.outerPadding(0.05)
		.elasticY(true);
	//------------------------------------------------  

	//------------------------------------------------
	/* Finally, render charts */
	dc.renderAll();

	$("#debug_dump").click(function(){
		print_filter("counterDimGroup");
	});
};