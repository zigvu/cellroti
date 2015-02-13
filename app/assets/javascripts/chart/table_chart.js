/*------------------------------------------------
	Brush chart
	------------------------------------------------*/

function TableChart(chartManager){
  //------------------------------------------------
  // set up
  var chartHelpers = chartManager.chartHelpers;

  // div for chart
  var tableChart_div = '#table-chart';

  var tableData = chartManager.getTableData();
  //------------------------------------------------


  //------------------------------------------------
  // start drawing
  var table = d3.select(tableChart_div)
      .append("table")
      .attr("class", "table-chart");

  table.append("thead").append("tr").selectAll("td")
      .data(chartHelpers.tableColLabels)
    .enter().append("td")
      .text(function(d){ return d; });

  var tbody = table.append("tbody");

  var tr = tbody.selectAll("tr")
      .data(tableData)
    .enter().append("tr");

  var td = tr.selectAll("td")
      .data(function(rowData){return rowData;})
    .enter().append("td")
      .text(function(d){ return d; });
  //------------------------------------------------

  //------------------------------------------------
  // repainting and loading new data
  function repaint(){
    tableData = chartManager.getTableData();
    tr.data(tableData);
    td.data(function(rowData){return rowData;});

    td.text(function(d){ return d; });
  };
  //------------------------------------------------


  //------------------------------------------------
  // finally, add call back to repaint charts
  chartManager.addCallback(repaint);
  //------------------------------------------------

};
