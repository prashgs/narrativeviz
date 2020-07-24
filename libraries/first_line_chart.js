var years = ["2015", "2016", "2017", "2018", "2019"];
var race = ["White", "Black", "Hispanic", "Asian", "Native", "Other"];
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
var yearColors = d3
  .scaleOrdinal()
  .domain(years)
  .range(["steelblue", "red", "blue", "green", "brown"]);

var raceColors = d3
  .scaleOrdinal()
  .domain(race)
  .range(["steelblue", "red", "blue", "green", "brown", "darkgreen"]);
var margin = { top: 10, right: 10, bottom: 35, left: 50 },
  width = 500 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

d3.csv(
  "data/year_date_count.csv",
  // When reading the csv, I must format variables:
  function (d) {
    return {
      month: d3.timeParse("%d/%m/%Y")(d.date).getMonth(),
      date: d3.timeParse("%d/%m/%Y")(d.date),
      value: Number(d.count),
      year: Number(d3.timeParse("%d/%m/%Y")(d.date).getFullYear())
    };
  },
  // Now I can use this dataset:
  function (data) {
    var svg = d3
      .select("#first_dataViz")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    // Add X axis --> it is a date format
    var x = d3.scaleLinear().domain([1, 12]).range([0, width]);
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

    var line = d3
      .line()
      .x(function (d) {
        return x(+d.month);
      })
      .y(function (d) {
        return y(+d.count);
      });

    console.log(data);
    svg
      .selectAll("myLines")
      .data(data)
      .enter()
      .append("path")
      .attr("class", function (d) {
        return "y" + d.name;
      })
      .attr("d", function (d) {
        return line(d.values);
      })
      .attr("stroke", function (d) {
        return yearColors(d.year);
      })
      .style("stroke-width", 2)
      .style("fill", "none");
  }
);
