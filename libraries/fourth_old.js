// set the dimensions and margins of the graph
var margin = { top: 10, right: 30, bottom: 30, left: 60 },
  width = 460 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;
var race = ["White", "Black", "Hispanic", "Asian", "Native", "Other"];
var raceColors = d3
  .scaleOrdinal()
  .domain(race)
  .range(["steelblue", "red", "blue", "green", "brown", "darkgreen"]);
//Read the data
d3.csv("data/2019_year_race_age_count_binned.csv", function (data) {
  // Add X axis

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

  // Color scale: give me a specie name, I return a color
  var color = d3
    .scaleOrdinal()
    .domain(["setosa", "versicolor", "virginica"])
    .range(["#440154ff", "#21908dff", "#fde725ff"]);

  // Add brushing
  var brush = d3
    .brushX() // Add the brush feature using the d3.brush function
    .extent([
      [0, 0],
      [width, height],
    ]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
    .on("end", updateChart); // Each time the brush selection changes, trigger the 'updateChart' function

  var tooltip = d3
    .select("#fourth_dataViz")
    .append("div")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .text("I'm a circle!");
  // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
  var mouseover = function (d) {
    tooltip.style("opacity", 1);
  };

  var mousemove = function (d) {
    tooltip
      .html("The exact value of<br>the Ground Living area is: " + d.GrLivArea)
      .style("left", d3.mouse(this)[0] + 90 + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
      .style("top", d3.mouse(this)[1] + "px");
  };

  // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
  var mouseleave = function (d) {
    tooltip.transition().duration(200).style("opacity", 0);
  };
  // Add the brushing
  scatter.append("g").attr("class", "brush").call(brush);

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
    .attr("r", 6)
    .style("fill", function (d) {
      return raceColors(d.race);
    })
    .style("opacity", 0.5)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);

  // A function that set idleTimeOut to null
  var idleTimeout;
  function idled() {
    idleTimeout = null;
  }

  // Add X axis label:
  svg
    .append("g")
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", width / 2 + margin.left)
    .attr("y", height + margin.top + 15)
    .attr("font-size", "smaller")
    .text("Age of victim");

  // Y axis label:
  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 30)
    .attr("x", -margin.top - height / 2 + 15)
    .text("Fatality count")
    .attr("font-size", "smaller");

  // A function that update the chart for given boundaries
  function updateChart() {
    extent = d3.event.selection;

    // If no selection, back to initial coordinate. Otherwise, update X axis domain
    if (!extent) {
      if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350)); // This allows to wait a little bit
      x.domain([
        0,
        d3.max(data, function (d) {
          return +d.age + 10;
        }),
      ]);
    } else {
      x.domain([x.invert(extent[0]), x.invert(extent[1])]);
      scatter.select(".brush").call(brush.move, null); // This remove the grey brush area as soon as the selection has been done
    }

    // Update axis and circle position
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
});
