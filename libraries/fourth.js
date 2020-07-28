// var margin = { top: 10, right: 10, bottom: 35, left: 50 },
//   width = 500 - margin.left - margin.right,
//   height = 400 - margin.top - margin.bottom;

// var races = ["Asian", "Black", "Hispanic", "Native", "White"];

d3.csv("data/race_count_population_ratio.csv", function (data) {
  var svg = d3
    .select("#fourth_dataViz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var tooltip = d3
    .select("#fourth-viz-tooltip")
    .append("div")
    .style("position", "absolute")
    .style("visibility", "hidden");

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
    .attr("fill", function (d) {
      return color(d.key);
    })
    .on("mouseover", function () {
      return tooltip.style("visibility", "visible");
    })
    .on("mousemove", function (d) {
      let key = d.key[0].split("_")[0];
      let value = Math.round(d.value);
      return tooltip
        .style("top", event.pageY - 10 + "px")
        .style("left", event.pageX + 10 + "px")
        .text(key + ":" + value + "%")
        .style("font-size", "small");
    })
    .on("mouseout", function () {
      return tooltip.style("visibility", "hidden");
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
    .attr("y", -margin.left + 30)
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
});
