// Position of the circles on the X axis
let t_height = 25;
let t_width = 100;
var position = [15, 30, 45, 60, 75];
var myColor = d3.scaleOrdinal().domain([0, 4]).range(d3.schemeSet1);
// Add circles at the top
d3.select("#dataviz_delay")
  .append("g")
  .attr("transform", "translate(0,0)")
  .selectAll("mycircles")
  .data(position)
  .enter()
  .append("circle")
  .attr("cx", function (d) {
    return d;
  })
  .attr("cy", 5)
  .attr("r", 5)
  .attr("fill", function (d, i) {
    return myColor(i);
  })
  .transition()
  .duration(750)
  .delay(function (i) {
    return i * 15;
  })
  .on("start", function repeat() {
    d3.active(this)
      .attr("cy", t_height - 5)
      .transition()
      .attr("cy", 5)
      .transition()
      .on("start", repeat);
  });
