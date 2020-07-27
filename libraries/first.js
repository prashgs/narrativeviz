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
  height = 500 - margin.top - margin.bottom;

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
d3.csv("data/year_month_count_3.csv", (d) => {
  // var res = data.map((d, i) => {
  //   return {
  //     month: parseDate(d.date).getMonth(),
  //     total: d.total,
  //     year: parseDate(d.date).getFullYear()
  //   };
  // });

  var svg = d3
    .select("#first_dataViz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const tooltip = d3.select("#tooltip");
  const tooltipLine = svg.append("line");

  var x = d3
    .scaleLinear()
    .domain([1, 12])
    .range([0, width - margin.right - 50]);

  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(
      d3
        .axisBottom(x)
        .ticks(12)
        .tickFormat((d, i) => months[i])
    )
    .attr("class", "x-axis");

  // var x = d3
  //   .scalePoint()
  //   .domain(monthNames)
  //   .range([0, width - margin.right - 50]);
  // var xAxis = d3.axisBottom(x).tickSizeOuter(0);
  // svg
  //   .append("g")
  //   .attr("class", "x-axis")
  //   .attr("transform", "translate(0," + height + ")")
  //   .attr("class", "x-axis")
  //   .call(xAxis);

  // Add Y axis
  var y = d3.scaleLinear().domain([0, 1100]).range([height, margin.top]);
  var yAxis = d3.axisLeft(y);
  svg.append("g").attr("class", "y-axis").call(yAxis);

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
    .attr("r", r)
    .style("fill", (d) => yearColors(d));

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
      lineOpacity = d3.selectAll(".line-" + d).style("opacity");
      dotOpacity = d3.selectAll(".dot-" + d).style("opacity");
      d3.selectAll(".line-" + d)
        .transition()
        .style("opacity", lineOpacity == 1 ? 0 : 1);
      d3.selectAll(".dot-" + d)
        .transition()
        .style("opacity", dotOpacity == 1 ? 0 : 1);
    });

  var data_nested = d3
    .nest()
    .key((d) => d.year)
    .entries(d);

  var line = d3
    .line()
    .x(function (d) {
      return x(d.month_num);
    })
    .y(function (d) {
      return y(d.count);
    });

  var path = svg
    .selectAll("myLines")
    .data(data_nested)
    .enter()
    .append("path")
    .attr("class", (d) => "line-" + d.key)
    .attr("fill", "none")
    .attr("stroke", (d) => yearColors(d.key))
    .attr("stroke-width", 2)
    .datum((d) => d.values)
    .attr("d", line);

  svg
    .selectAll("myDots")
    .data(data_nested)
    .enter()
    .append("g")
    .attr("class", (d) => "dot-" + d.key)
    .style("fill", function (d) {
      return yearColors(d.key);
    })
    .selectAll("myPoints")
    .data(function (d) {
      return d.values;
    })
    .enter()
    .append("circle")
    .attr("cx", function (d) {
      return x(d.month_num);
    })
    .attr("cy", function (d) {
      return y(d.count);
    })
    .attr("r", 5)
    .attr("stroke", "white");

  tipBox = svg
    .append("rect")
    .attr("width", width - margin.left)
    .attr("height", height - margin.top)
    .attr("opacity", 0)
    .on("mousemove", drawTooltip)
    .on("mouseout", removeTooltip)
    .on("mouseover", function () {
      return tooltip.style("visibility", "visible");
    });

  function removeTooltip() {
    if (tooltip) tooltip.style("display", "none");
    if (tooltipLine) tooltipLine.attr("stroke", "none");
  }

  function drawTooltip() {
    try {
      const month = Math.round(x.invert(d3.mouse(tipBox.node())[0]));
      if (month <= months.length) {
        tooltipLine
          .attr("stroke", "grey")
          .attr("x1", x(month))
          .attr("x2", x(month))
          .attr("y1", 0)
          .attr("y2", height);

        tooltip
          .style("font-size", "smaller")
          .html("Month: " + months[month - 1])
          .style("display", "block")
          .style("left", d3.event.pageX + 10 + "px")
          .style("top", d3.event.pageY - 10 + "px")
          .selectAll()
          .data(data_nested)
          .enter()
          .append("div")
          .style("font-size", "smaller")
          .style("color", "blue")
          .html(
            (d) =>
              d.key + ": " + d.values.find((h) => h.month_num == month).count
          );
      }
    } catch (err) {}
  }

  // Add X axis label:
  svg
    .append("g")
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", width / 2 + margin.left)
    .attr("y", height + margin.top + 20)
    .attr("font-size", "smaller")
    .text("Months");

  // Y axis label:
  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 20)
    .attr("x", -margin.top - height / 2 + 10)
    .text("Fatality count")
    .attr("font-size", "smaller");

  var last2020Circle = d3.select(
    "#first_dataViz > svg > g > g.dot-2020 > circle:nth-child(5)"
  );

  const annotations = [
    {
      note: {
        title: "May 2020 Fatality: 365 ",
      },
      x: last2020Circle.attr("cx"),
      y: last2020Circle.attr("cy"),
      dy: 30,
      dx: 30,
    },
  ];
  const makeAnnotations = d3.annotation().annotations(annotations);
  svg.append("g").style("font-size", "smaller").call(makeAnnotations);
});
