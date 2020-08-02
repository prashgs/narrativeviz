var glines;
var mouseG;
var tooltip;
var years = ["2015", "2016", "2017", "2018", "2019", "2020"];
// var myColor = d3.scaleOrdinal().domain([0, 4]).range(d3.schemeSet1);
var yearColors = d3
  .scaleOrdinal()
  .domain(years)
  .range(["steelblue", "red", "blue", "green", "brown", "grey"]);
var parseDate = d3.timeParse("%m/%d/%Y");
var months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

var margin = { top: 10, right: 10, bottom: 30, left: 50 },
  width = 500 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

var r = 4;
var race = ["White", "Black", "Hispanic", "Asian", "Native", "Other"];
var raceColors = d3
  .scaleOrdinal()
  .domain(race)
  .range(["steelblue", "red", "blue", "green", "brown", "darkgreen"]);
var ageColors = d3
  .scaleOrdinal()
  .domain(race)
  .range(["steelblue", "red", "blue", "green"]);

var yearBins = ["<=20 Years", "21-40 Years", "41-60 Years", "Over 60 Years"];
var yearBinsColors = d3
  .scaleOrdinal()
  .domain(yearBins)
  .range(["steelblue", "red", "blue", "green"]);

d3.csv("data/race_count_population_ratio.csv", function (data) {
  var svg = d3
    .select("#fourth_dataViz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.selection.prototype.first = function () {
    return d3.select(this.nodes()[0]);
  };
  d3.selection.prototype.last = function () {
    return d3.select(this.nodes()[this.size() - 1]);
  };

  var tooltip = d3
    .select("#fourth-viz-tooltip")
    .append("div")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .attr("class", "tooltip");

  // List of subgroups = header of the csv files = soil condition here
  var deathPercentage = data.columns.slice(2, 3);
  var populationPercentage = data.columns.slice(5);

  var subgroups = [deathPercentage, populationPercentage];

  // List of groups = species here = value of the first column called group -> I show them on the X axis
  var groups = d3
    .map(data, function (d) {
      return d.race;
    })
    .keys();

  // Add X axis
  var x = d3.scaleBand().domain(groups).range([0, width]).padding([0.2]);
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSize(0));

  var y = d3.scaleLinear().domain([0, 100]).range([height, 0]);
  svg.append("g").call(d3.axisLeft(y));

  var xSubgroup = d3
    .scaleBand()
    .domain(subgroups)
    .range([0, x.bandwidth()])
    .padding([0.05]);

  var color = d3.scaleOrdinal().domain(subgroups).range(["#e41a1c", "#377eb8"]);

  svg
    .append("g")
    .selectAll("g")
    .data(data)
    .enter()
    .append("g")
    .attr("class", (d) => "bar-" + d.race)
    .attr("transform", function (d) {
      return "translate(" + x(d.race) + ",0)";
    })
    .selectAll("rect")
    .data(function (d) {
      return subgroups.map(function (key) {
        return { key: key, value: d[key] };
      });
    })
    .enter()
    .append("rect")
    .on("mouseover", function () {
      return tooltip.style("visibility", "visible");
    })
    .on("mousemove", function (d) {
      let key = d.key[0].split("_")[0];
      let value = Math.round(d.value);
      return tooltip
        .style("top", event.pageY - 10 + "px")
        .style("left", event.pageX + 10 + "px")
        .html("year: " + "2019" + "<br/>" + key + ":" + value + "%")
        .style("font-size", "small");
    })
    .on("mouseout", function () {
      return tooltip.style("visibility", "hidden");
    })
    .attr("x", function (d) {
      return xSubgroup(d.key);
    })
    .attr("y", function (d) {
      return y(d.value);
    })
    .attr("width", xSubgroup.bandwidth())
    .attr("height", function (d) {
      return height - y(d.value);
    })
    .transition()
    .duration(800)
    .attr("fill", function (d) {
      return "lightgrey";
    })
    .transition()
    .attr("fill", function (d) {
      return color(d.key);
    });

  svg
    .append("g")
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", width / 2 + margin.left)
    .attr("y", height + margin.top + 20)
    .style("font-size", "small")
    .text("Race");

  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 20)
    .attr("x", -margin.top - height / 2 + 10)
    .text("Percentage")
    .style("font-size", "small");

  var svgLegend = svg
    .append("g")
    .attr("class", "gLegend")
    .attr(
      "transform",
      "translate(" + (width - margin.right - 70) + "," + margin.top + ")"
    );

  var legend = svgLegend
    .selectAll(".legend")
    .data(["Fatality %", "Population %"])
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
    .style("fill", (d) => color(d));

  legend
    .append("text")
    .attr("class", "legend-text")
    .attr("class", "w3-button")
    .attr("x", r * 2)
    .attr("y", r / 2)
    .style("fill", "#A9A9A9")
    .style("font-size", "small")
    .text((d) => d);

  drawAnnotations();
  function drawAnnotations() {
    var hElement = svg.selectAll(".bar-Hispanic");
    var hString = hElement.first().attr("transform");
    var hTranslate = hString
      .substring(hString.indexOf("(") + 1, hString.indexOf(")"))
      .split(",")[0];
    var hXCoord =
      Number(svg.selectAll(".bar-Hispanic rect").first().attr("x")) +
      Number(svg.selectAll(".bar-Hispanic rect").first().attr("width")) +
      Number(hTranslate);
    var hYCoord =
      Number(svg.selectAll(".bar-Black rect").first().attr("y")) +
      Number(svg.selectAll(".bar-Black rect").first().attr("height")) / 2 -
      20;

    svg
      .append("line")
      .attr("class", "annotation-line")
      .attr("x1", hXCoord)
      .attr("y1", hYCoord)
      .attr("x2", hXCoord)
      .attr("y2", height - 200)
      .attr("stroke", "darkgrey")
      .style('stroke-width', '2px')
      .style('stroke-dasharray', '5,3');

    // svg
    //   .append("circle")
    //   .attr("class", "annotation-circle")
    //   .attr("cx", hXCoord)
    //   .attr("cy", hYCoord)
    //   .attr("r", 40)
    //   .style("stroke", "grey")
    //   .style("fill", "none")
    //   .text("Test");

    var bElement = svg.selectAll(".bar-Black");
    var bString = bElement.first().attr("transform");
    var bTranslate = bString
      .substring(bString.indexOf("(") + 1, bString.indexOf(")"))
      .split(",")[0];
    var bXCoord =
      Number(svg.selectAll(".bar-Black rect").first().attr("x")) +
      Number(svg.selectAll(".bar-Black rect").first().attr("width")) +
      Number(bTranslate);
    var bYCoord =
      Number(svg.selectAll(".bar-Black rect").first().attr("y")) +
      Number(svg.selectAll(".bar-Black rect").first().attr("height")) / 2 -
      20;

    svg
      .append("line")
      .attr("class", "annotation-line")
      .attr("x1", bXCoord)
      .attr("y1", bYCoord - 40)
      .attr("x2", bXCoord)
      .attr("y2", height - 200)
      .attr("stroke", "darkgrey")
      .style('stroke-width', '2px')
      .style('stroke-dasharray', '5,3');

    // svg
    //   .append("circle")
    //   .attr("class", "annotation-circle")
    //   .attr("cx", bXCoord)
    //   .attr("cy", bYCoord)
    //   .attr("r", 40)
    //   .style("stroke", "grey")
    //   .style("fill", "none");

    // console.log(bElement.first().data()[0]);
    svg
      .append("text")
      .attr("class", "annotation-text")
      .attr("x", bXCoord - 50)
      .attr("y", height - 200)
      .html("Diff in % Fatality & Population")
      .style("font-size", "small")
      .attr("stroke", "grey");
  }
});
