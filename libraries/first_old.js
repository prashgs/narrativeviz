var years = ["2015", "2016", "2017", "2018", "2019"];
var race = ["White", "Black", "Hispanic", "Asian", "Native", "Other"];
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var yearColors = d3
  .scaleOrdinal()
  .domain(years)
  .range(["steelblue", "red", "blue", "green", "brown"]);
var race = ["White", "Black", "Hispanic", "Asian", "Native", "Other"];
var raceColors = d3
  .scaleOrdinal()
  .domain(race)
  .range(["steelblue", "red", "blue", "green", "brown", "darkgreen"]);
var margin = { top: 10, right: 10, bottom: 35, left: 50 },
  width = 500 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;
var r = 6; //legend marker
//Read the data
d3.csv("data/year_month_count2.csv", function (data) {
  // set the dimensions and margins of the graph

  // append the svg object to the body of the page
  var svg = d3
    .select("#first_dataViz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  // List of groups (here I have one group per column)

  // Reformat the data: we need an array of arrays of {x, y} tuples
  var dataReady = years.map(function (grpName) {
    // .map allows to do something for each element of the list
    return {
      name: grpName,
      values: data.map(function (d) {
        return { Month: d.month_number, value: +d[grpName] };
      }),
    };
  });
  // I strongly advise to have a look to dataReady with
  // console.log(data)
  // console.log(dataReady);

  // A color scale: one color for each group

  // Add X axis --> it is a date format
  var x = d3.scaleLinear().domain([1, 12]).range([0, width - margin.right-50]);

  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(
      d3
        .axisBottom(x)
        .ticks(12)
        .tickFormat((d, i) => months[i])
    );

  // Add Y axis
  var y = d3.scaleLinear().domain([0, 1200]).range([height, 0]);
  svg.append("g").call(d3.axisLeft(y));

  // Add the lines
  var line = d3
    .line()
    .x(function (d) {
      return x(+d.Month);
    })
    .y(function (d) {
      return y(+d.value);
    });

  svg
    .selectAll("myLines")
    .data(dataReady)
    .enter()
    .append("path")
    .attr("class", function (d) {
      return "y" + d.name;
    })
    .attr("d", function (d) {
      return line(d.values);
    })
    .attr("stroke", function (d) {
      return yearColors(d.name);
    })
    .style("stroke-width", 2)
    .style("fill", "none");

  // create a tooltip
  var tooltip = d3
    .select("#first_dataViz")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .text("a simple tooltip");

  // Add the points
  svg
    // First we need to enter in a group
    .selectAll("myDots")
    .data(dataReady)
    .enter()
    .append("g")
    .style("fill", function (d) {
      return yearColors(d.name);
    })
    .attr("class", function (d) {
      return "y" + d.name;
    })
    .on("mouseover", function (d) {
      console.log(d);
      tooltip.text("Year: " + d.name + "</br>" + "Month: " + d.values.Month);
      return tooltip.style("visibility", "visible");
    })
    .on("mousemove", function () {
      return tooltip
        .style("top", d3.event.pageY - 10 + "px")
        .style("left", d3.event.pageX + 10 + "px");
    })
    .on("mouseout", function () {
      return tooltip.style("visibility", "hidden");
    })
    // Second we need to enter in the 'values' part of this group
    .selectAll("myPoints")
    .data(function (d) {
      return d.values;
    })
    .enter()
    .append("circle")
    .attr("cx", function (d) {
      return x(d.Month);
    })
    .attr("cy", function (d) {
      return y(d.value);
    })
    .attr("r", 5)
    .attr("stroke", "white")


  // Add a label at the end of each line
  svg
    .selectAll("myLabels")
    .data(dataReady)
    .enter()
    .append("g")
    .append("text")
    .attr("class", function (d) {
      return "y" + d.name;
    })
    .datum(function (d) {
      return { name: d.name, value: d.values[d.values.length - 1] };
    }) // keep only the last value of each time series
    .attr("transform", function (d) {
      return "translate(" + x(d.value.Month) + "," + y(d.value.value) + ")";
    }) // Put the text at the position of the last point
    .attr("x", 12) // shift the text a bit more right
    .text(function (d) {
      return d.name;
    })
    .style("fill", function (d) {
      return yearColors(d.name);
    })
    .style("font-size", 15);

  // Add a legend (interactive)
  svg
    .selectAll("myLegend")
    .data(dataReady)
    .enter()
    .append("g")
    .append("text")
    .attr("x", function (d, i) {
      return 30 + i * 60;
    })
    .attr("y", 30)
    .text(function (d) {
      return d.name;
    })
    .style("fill", function (d) {
      return yearColors(d.name);
    })
    .style("font-size", 15)
    .on("click", function (d) {
      // is the element currently visible ?
      currentOpacity = d3.selectAll(".y" + d.name).style("opacity");
      // Change the opacity: from 0 to 1 or from 1 to 0
      d3.selectAll(".y" + d.name)
        .transition()
        .style("opacity", currentOpacity == 1 ? 0 : 1);
    });


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
    .attr("y", -margin.left + 10)
    .attr("x", -margin.top - height / 2 + 10)
    .text("Number of Fatality")
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
    .style("fill", (d) => color(d));

  legend
    .append("text")
    .attr("class", "legend-text")
    .attr("x", r * 2)
    .attr("y", r / 2)
    .style("fill", "#A9A9A9")
    .style("font-size", 12)
    .text((d) => d);
});
