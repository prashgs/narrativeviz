// set the dimensions and margins of the graph
var margin = { top: 10, right: 20, bottom: 30, left: 50 },
  width = 500 - margin.left - margin.right,
  height = 420 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3
  .select("#third_dataViz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var yearBins = ["<=20 Years", "21-40 Years", "41-60 Years", "Over 60 Years"];
var yearBinsColors = d3
  .scaleOrdinal()
  .domain(yearBins)
  .range(["steelblue", "red", "blue", "green"]);
//Read the data
d3.csv("data/year_race_age_count_binned.csv", function (data) {
  var maxAge = d3.max(data, function (d) {
    return +d.age + 10;
  });
  var minAge = d3.min(data, function (d) {
    return +d.age + 10;
  });
  var maxCount = d3.max(data, function (d) {
    return +d.count + 5;
  });

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

  var y = d3.scaleLinear().domain([0, maxCount]).range([height, 0]);
  svg.append("g").call(d3.axisLeft(y));

  // Add a scale for bubble size
  var z = d3.scaleLinear().domain(yearBins).range([4, 40]);

  // -1- Create a tooltip div that is hidden by default:
  var tooltip = d3
    .select("#third-viz-tooltip")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "black")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("color", "white");

  // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
  var showTooltip = function (d) {
    tooltip.transition().duration(200);
    tooltip
      .style("opacity", 1)
      .html("Country: " + d.country)
      .style("left", d3.mouse(this)[0] + 30 + "px")
      .style("top", d3.mouse(this)[1] + 30 + "px");
  };
  var moveTooltip = function (d) {
    tooltip
      .style("left", d3.mouse(this)[0] + 30 + "px")
      .style("top", d3.mouse(this)[1] + 30 + "px");
  };
  var hideTooltip = function (d) {
    tooltip.transition().duration(200).style("opacity", 0);
  };

  // Add dots
  svg
    .append("g")
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "bubbles")
    .attr("cx", function (d) {
      return x(d.gdpPercap);
    })
    .attr("cy", function (d) {
      return y(d.lifeExp);
    })
    .attr("r", function (d) {
      return z(d.pop);
    })
    .style("fill", function (d) {
      return myColor(d.continent);
    })
    // -3- Trigger the functions
    .on("mouseover", showTooltip)
    .on("mousemove", moveTooltip)
    .on("mouseleave", hideTooltip);
});
