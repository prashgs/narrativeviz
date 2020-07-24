// set the dimensions and margins of the graph
// var margin = { top: 10, right: 100, bottom: 40, left: 40 },
//   width = 460 - margin.left - margin.right,
//   height = 400 - margin.top - margin.bottom;
// var allGroup = ["2015", "2016", "2017", "2018", "2019"];
// Read data
d3.csv("data/year_state_count.csv", function (data) {
  var dataFilter = data.filter(function (d) {
    return d.year == "2019";
  });

  // Color palette for continents?
  var color = d3.scaleOrdinal().domain([0, 50]).range(d3.schemeSet1);

  // Size scale for countries
  var size = d3.scaleLinear().domain([0, 200]).range([7, 55]); // circle will be between 7 and 55 px wide
  var dropdown = d3
    .select("#selectButton")
    .selectAll("myOptions")
    .data(years)
    .enter()
    .append("option")
    .text(function (d) {
      return d;
    }) // text showed in the menu
    .attr("value", function (d) {
      return d;
    });

  dropdown.property("selected", function (d) {
    return d == "2019";
  });
  // append the svg object to the body of the page
  var svg = d3
    .select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var elemEnter = svg
    .selectAll("myCircleText")
    .data(dataFilter)
    .enter()
    .append("g");

  var circle = elemEnter
    .append("circle")
    .attr("class", "node")
    .attr("r", function (d) {
      return size(d.count);
    })
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .style("fill", function (d) {
      return color(d.state);
    })
    .style("fill-opacity", 0.8)
    .attr("stroke", "black");

  function update(selectedGroup) {
    console.log(selectedGroup);
    // Create new data with the selection?
    let dataFilter = data.filter(function (d) {
      return d.year == selectedGroup;
    });
    console.log(dataFilter);
    // Give these new data to update line
    circle
      .data(dataFilter)
      .transition()
      .duration(1000)
      .attr("r", function (d) {
        return size(d.count);
      });
  }

  d3.select("#selectButton").on("change", function (d) {
    var selectedOption = d3.select(this).property("value");
    update(selectedOption);
  });
  // Features of the forces applied to the nodes:
  var simulation = d3
    .forceSimulation()
    .force(
      "center",
      d3
        .forceCenter()
        .x(width / 2)
        .y(height / 2)
    ) // Attraction to the center of the svg area
    .force("charge", d3.forceManyBody().strength(0.1)) // Nodes are attracted one each other of value is > 0
    .force(
      "collide",
      d3
        .forceCollide()
        .strength(0.2)
        .radius(function (d) {
          return size(d.count) + 3;
        })
        .iterations(1)
    ); // Force that avoids circle overlapping

  simulation.nodes(data).on("tick", function (d) {
    circle
      .attr("cx", function (d) {
        return d.x;
      })
      .attr("cy", function (d) {
        return d.y;
      });
  });
});
