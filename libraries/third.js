//set the dimensions and margins of the graph
var margin = { top: 10, right: 10, bottom: 35, left: 50 },
  width = 500 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page

// Parse the Data
d3.csv("data/race_count_population_ratio.csv", function (data) {
  var svg = d3
    .select("#third_dataViz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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

  // Add Y axis
  var y = d3.scaleLinear().domain([0, 100]).range([height, 0]);
  svg.append("g").call(d3.axisLeft(y));

  // Another scale for subgroup position?
  var xSubgroup = d3
    .scaleBand()
    .domain(subgroups)
    .range([0, x.bandwidth()])
    .padding([0.05]);

  // color palette = one color per subgroup
  var color = d3.scaleOrdinal().domain(subgroups).range(["#e41a1c", "#377eb8"]);

  // Show the bars
  svg
    .append("g")
    .selectAll("g")
    // Enter in data = loop group per group
    .data(data)
    .enter()
    .append("g")
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
    });

  // Add one dot in the legend for each name.
  var size = 20;
  svg
    .selectAll("mydots")
    .data(["Fatality %", "Population %"])
    .enter()
    .append("rect")
    .attr("x", width - size * 5.5)
    .attr("y", function (d, i) {
      return +i * (size + 10) + size / 2;
    }) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("width", size)
    .attr("height", size)
    .style("fill", function (d) {
      return color(d);
    });
  // Add one dot in the legend for each name.
  svg
    .selectAll("mylabels")
    .data(["Fatality %", "Population %"])
    .enter()
    .append("text")
    .attr("x", width - size * 4)
    .attr("y", function (d, i) {
      return 15 + i * (size + 5) + size / 2;
    }) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", function (d) {
      return color(d);
    })
    .text(function (d) {
      return d;
    })
    .attr("text-anchor", "left")
    .style("alignment-baseline", "right");

  // Add X axis label:
  svg
    .append("g")
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", width / 2 + margin.left)
    .attr("y", height + margin.top + 20)
    .attr("font-size", "smaller")
    .text("Race");

  // Y axis label:
  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 30)
    .attr("x", -margin.top - height / 2 + 10)
    .text("Percentage")
    .attr("font-size", "smaller");

  // create a tooltip
  var tooltip = d3
    .select("#third_dataViz")
    .append("div")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .text("I'm a circle!");
  //
  d3.select("#circleBasicTooltip")
    .on("mouseover", function () {
      return tooltip.style("visibility", "visible");
    })
    .on("mousemove", function () {
      return tooltip
        .style("top", event.pageY - 800 + "px")
        .style("left", event.pageX - 800 + "px");
    })
    .on("mouseout", function () {
      return tooltip.style("visibility", "hidden");
    });
});
