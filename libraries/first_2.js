var glines;
var mouseG;
var tooltip;
var years = ["2015", "2016", "2017", "2018", "2019"];
var parseDate = d3.timeParse("%d/%m/%Y");
var monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];

var margin = { top: 10, right: 10, bottom: 35, left: 50 },
  width = 500 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

var lineOpacity = 1;
var lineStroke = "2px";

var axisPad = 6; // axis formatting
var R = 6; //legend marker

// since Category B and E are really close to each other, assign them diverging colors
var color = d3
  .scaleOrdinal()
  .domain(years)
  .range(["#2D4057", "#7C8DA4", "#B7433D", "#2E7576", "#EE811D"]);

d3.csv("data/date_count_total.csv", (data) => {
  var res = data.map((d, i) => {
    return {
      month: parseDate(d.date).getMonth(),
      total: d.total,
      year: parseDate(d.date).getFullYear(),
    };
  });

  var svg = d3
    .select("#first_dataViz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3
    .scaleLinear()
    .domain([0, 11])
    .range([0, width - margin.right - 30]);

  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + height + ")")
    .call(
      d3
        .axisBottom(x)
        .ticks(12)
        .tickFormat((d, i) => monthNames[i])
    );
    
    console.log(res);
  // Add Y axis
  var y = d3.scaleLinear().domain([0, 1200]).range([height, margin.top]);
  svg
    .append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y))
    .append("text")
    .attr("x", 50)
    .attr("y", -10)
    .attr("fill", "#A9A9A9");

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
    .data(years)
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
    .attr("r", R)
    .style("fill", (d) => color(d));

  legend
    .append("text")
    .attr("class", "legend-text")
    .attr("x", R * 2)
    .attr("y", R / 2)
    .style("fill", "#A9A9A9")
    .style("font-size", 12)
    .text((d) => d);

  // line generator
  var line = d3
    .line()
    .x(function (d) {
      return x(+d.month);
    })
    .y(function (d) {
      return y(+d.count);
    });

  var res_nested = d3
    .nest() // necessary to nest data so that keys represent each vehicle category
    .key((d) => d.year)
    .entries(res);

  // APPEND MULTIPLE LINES //
  var lines = svg.append("g").attr("class", "lines");

  var glines = lines
    .selectAll(".line-group")
    .data(res_nested)
    .enter()
    .append("g")
    .attr("class", "line-group");

  glines
    .append("path")
    .attr("class", "line")
    .attr("d", (d) => d.values)
    .style("stroke", (d, i) => color(i))
    .style("fill", "none")
    .style("opacity", lineOpacity)
    .style("stroke-width", lineStroke);
});
