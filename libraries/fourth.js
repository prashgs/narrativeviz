// set the dimensions and margins of the graph
var margin = { top: 10, right: 30, bottom: 30, left: 60 },
  width = 460 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;
var race = ["White", "Black", "Hispanic", "Asian", "Native", "Other"];
var raceColors = d3
  .scaleOrdinal()
  .domain(race)
  .range(["steelblue", "red", "blue", "green", "brown", "darkgreen"]);
var ageColors = d3
  .scaleOrdinal()
  .domain(race)
  .range(["steelblue", "red", "blue", "green"]);
//Read the data

var r = 5;
d3.csv("data/2019_year_race_age_count_binned.csv", function (data) {
  // append the svg object to the body of the page
  var svg = d3
    .select("#fourth_dataViz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var maxAge = d3.max(data, function (d) {
    return +d.age + 10;
  });
  var minAge = d3.min(data, function (d) {
    return +d.age + 10;
  });
  var maxCount = d3.max(data, function (d) {
    return +d.count + 5;
  });
  // Add X axis
  var bins = d3
    .map(data, function (d) {
      return d.binned;
    })
    .keys();

  var x = d3
    .scaleLinear()
    .domain([0, maxAge + 10])
    .range([0, width]);
  var xAxis = svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add Y axis
  var y = d3.scaleLinear().domain([0, maxCount]).range([height, 0]);
  svg.append("g").call(d3.axisLeft(y));

  var tooltip = d3
    .select("#fourth-viz-tooltip")
    .append("div")
    .style("position", "absolute")
    .style("visibility", "hidden");

  // Add a clipPath: everything out of this area won't be drawn.
  var clip = svg
    .append("defs")
    .append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("width", width)
    .attr("height", height)
    .attr("x", 0)
    .attr("y", 0);

  // Add brushing
  var brush = d3
    .brushX() // Add the brush feature using the d3.brush function
    .extent([
      [0, 0],
      [width, height],
    ]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
    .on("end", updateChart); // Each time the brush selection changes, trigger the 'updateChart' function

  // Create the scatter variable: where both the circles and the brush take place
  var scatter = svg.append("g").attr("clip-path", "url(#clip)");

  // Add circles
  scatter
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) {
      return x(d.age);
    })
    .attr("cy", function (d) {
      return y(d.count);
    })
    .attr("r", 5)
    .style("fill", function (d) {
      return ageColors(d.binned);
    })
    .style("opacity", 0.5);
  // Add the brushing
  scatter.append("g").attr("class", "brush").call(brush);

  // A function that set idleTimeOut to null
  var idleTimeout;
  function idled() {
    idleTimeout = null;
  }

  // A function that update the chart for given boundaries
  function updateChart() {
    extent = d3.event.selection;
    if (!extent) {
      if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350));
      x.domain([0, maxAge + 10]);
    } else {
      x.domain([x.invert(extent[0]), x.invert(extent[1])]);
      scatter.select(".brush").call(brush.move, null);
    }

    xAxis.transition().duration(1000).call(d3.axisBottom(x));
    scatter
      .selectAll("circle")
      .transition()
      .duration(1000)
      .attr("cx", function (d) {
        return x(d.age);
      })
      .attr("cy", function (d) {
        return y(d.count);
      });
  }

  // Add X axis label:
  svg
    .append("g")
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", width / 2 + margin.left)
    .attr("y", height + margin.top + 20)
    .attr("font-size", "smaller")
    .text("Age");

  // Y axis label:
  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 30)
    .attr("x", -margin.top - height / 2 + 10)
    .text("Fatality count")
    .attr("font-size", "smaller");

  // CREATE LEGEND //
  var svgLegend = svg
    .append("g")
    .attr("class", "gLegend")
    .attr(
      "transform",
      "translate(" + (width - margin.right - 20) + "," + margin.top + ")"
    );

  var legend = svgLegend
    .selectAll(".legend")
    .data(bins)
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", function (d, i) {
      return "translate(0," + i * 20 + ")";
    });
  legend
    .append("circle")
    .attr("class", "legend-node")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", r)
    .style("fill", (d, i) => ageColors(i));

  legend
    .append("text")
    .attr("class", "legend-text")
    .attr("class", "w3-button")
    .attr("x", r * 2)
    .attr("y", r / 2)
    .style("fill", "#A9A9A9")
    .style("font-size", 12)
    .text((d) => d)
    .on("click", function (d) {
      // is the element currently visible ?
      lineOpacity = d3.selectAll(".line-" + d).style("opacity");
      dotOpacity = d3.selectAll(".dot-" + d).style("opacity");
      // Change the opacity: from 0 to 1 or from 1 to 0
      d3.selectAll(".line-" + d)
        .transition()
        .style("opacity", lineOpacity == 1 ? 0 : 1);
      d3.selectAll(".dot-" + d)
        .transition()
        .style("opacity", dotOpacity == 1 ? 0 : 1);
    });
});
