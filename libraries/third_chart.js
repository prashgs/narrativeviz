// set the dimensions and margins of the graph
// var margin = { top: 10, right: 20, bottom: 30, left: 50 },
//   width = 500 - margin.left - margin.right,
//   height = 420 - margin.top - margin.bottom;

// append the svg object to the body of the page

//Read the data
d3.csv("data/race_count_population_ratio.csv", function (data) {
  var svg = d3
    .select("#third_dataViz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  // Add X axis
  var maxPopulation = d3.max(data, function (d) {
    return +d.population;
  });
  var minPopulation = d3.min(data, function (d) {
    return +d.population;
  });
  var maxCount = d3.max(data, function (d) {
    return +d.count;
  });
  var minCount = d3.min(data, function (d) {
    return +d.count;
  });
  var formatPercent = d3.format(".0%");
  var formatValue = d3.format(".1s");

  var x = d3.scaleLog().domain([1000000, maxPopulation]).range([0, width]);
  // Add Y axis
  var y = d3
    .scaleLog()
    .domain([5, maxCount + 50])
    .range([height, 0]);
  // Add a scale for bubble size
  var z = d3.scaleLinear().domain([0, 100]).range([0, 100]);

  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(
      d3.axisBottom(x).tickFormat(function (d) {
        return formatValue(d);
      })
      // .tickValues(
      //   data.map((d) => {
      //     return +d.population;
      //   })
      // )
    );

  svg.append("g").call(
    d3.axisLeft(y).tickFormat(function (d) {
      return formatValue(d);
    })
    // .tickValues(
    //   data.map((d) => {
    //     return +d.count;
    //   })
    // )
  );

  // svg.append("g").call(d3.axisLeft(y));

  // Add a scale for bubble color
  var myColor = d3.scaleOrdinal().domain([1, 5]).range(d3.schemeSet2);

  // -1- Create a tooltip div that is hidden by default:
  var tooltip = d3
    .select("#third_dataViz")
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
      .html("Country: " + d.race)
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
      console.log(x(parseInt(d["population"])));
      return x(parseInt(d["population"]));
    })
    .attr("cy", function (d) {
      console.log(x(parseInt(d["count"])));
      return y(d["count"]);
    })
    .attr("r", function (d) {
      return z(d.percentage / 1.5);
    })
    .style("fill", function (d) {
      return myColor;
    })
    .style("fill", "red")
    // -3- Trigger the functions
    .on("mouseover", showTooltip)
    .on("mousemove", moveTooltip)
    .on("mouseleave", hideTooltip);

    svg
    .append("g")
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", width / 2 + margin.left)
    .attr("y", height + margin.top + 20)
    .attr("font-size", "smaller")
    .text("Race");

  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 10)
    .attr("x", -margin.top - height / 2 + 10)
    .text("Percentage")
    .attr("font-size", "smaller");
});
