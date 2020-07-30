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

var r = 5;
d3.csv("data/year_race_age_count_binned.csv")
  .row(function (d) {
    return {
      year: Number(d.year),
      race: d.race,
      age: Number(d.age),
      count: Number(d.count),
      binned: d.binned,
    };
  })
  .get(function (data) {
    function sortDataByAge() {
      return data.sort(function (a, b) {
        return d3.ascending(a.age, b.age);
      });
    }

    function filterData(data, year) {
      return data.filter(function (d) {
        return d.year == year;
      });
    }

    var svg = d3
      .select("#third_dataViz")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var dropdown = d3
      .select("#third-grid select")
      .selectAll("yearOptions")
      .data(years)
      .enter()
      .append("option")
      .text(function (d) {
        return d;
      })
      .attr("value", function (d) {
        return d;
      });

    dropdown.property("selected", function (d) {
      return d == "2019";
    });

    var selectedYear = d3.select("#third-grid select").property("value");
    var filteredData = filterData(sortDataByAge(), selectedYear);

    var maxAge = d3.max(data, function (d) {
      return +d.age + 10;
    });
    var minAge = d3.min(data, function (d) {
      return +d.age + 10;
    });
    var maxCount = d3.max(data, function (d) {
      return +d.count + 5;
    });

    var bins = d3
      .map(data, function (d) {
        return d.binned;
      })
      .keys();

    var x = d3
      .scaleLinear()
      .domain([0, maxAge + 10])
      .range([0, width]);
    var xAxis = svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    var y = d3.scaleLinear().domain([0, maxCount]).range([height, 0]);
    svg.append("g").call(d3.axisLeft(y));

    var tooltip = d3
      .select("#third-viz-tooltip")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden");

    svg
      .append("g")
      .selectAll("scatterCircle")
      .data(filteredData)
      .enter()
      .append("circle")
      .attr("class", "scatterCircle")
      .attr("cx", function (d) {
        return x(d.age);
      })
      .attr("cy", function (d) {
        return y(d.count);
      })
      .attr("r", r)
      .style("fill", function (d) {
        return yearBinsColors(d.binned);
      })
      .style("opacity", 0.7)
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);

    // Create Event Handlers for mouse
    function handleMouseOver(d, i) {
      d3.select(this).attr("r", Number(r) * 2);
      tooltip.style("visibility", "visible");
      console.log(d);
      return tooltip
        .html("Year: " + d.year + "<br/>" + "Age: " + d.age + "<br/>" +"Count: " + d.count)
        .style("top", event.pageY - 10 + "px")
        .style("left", event.pageX + 10 + "px")
        .style("font-size","small");
    }

    function handleMouseOut(d, i) {
      // Use D3 to select element, change color back to normal
      d3.select(this).attr("r", Number(r));
      return tooltip.style("visibility", "hidden");

      //   // Select text by id and then remove
      //   d3.select("#t" + d.x + "-" + d.y + "-" + i).remove(); // Remove text location
    }
  });
