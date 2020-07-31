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

d3.csv("data/year_state_statecode_count.csv")
  .row(function (d) {
    return {
      year: d.year,
      state: d.state,
      statecode: d.statecode,
      count: Number(d.count),
    };
  })
  .get(function (data) {
    function sortDataByCount(data) {
      return data.sort(function (a, b) {
        return d3.descending(a.count, b.count);
      });
    }

    function filterData(data, year) {
      return data.filter(function (d) {
        return d.year == year;
      });
    }

    function getTop(data, top, bottom) {
      return data
        .sort(function (a, b) {
          return d3.descending(+a.count, +b.count);
        })
        .slice(top, bottom);
    }

    // append the svg object to the body of the page
    var svg = d3
      .select("#second_dataViz")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var dropdown = d3
      .select("#second-grid select")
      .selectAll("yearOptions")
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

    var selectedYear = d3.select("#selectButton").property("value");
    var selectedColor = yearColors(selectedYear);
    var filteredData = filterData(data, selectedYear);
    var topData = getTop(
      sortDataByCount(filteredData),
      0,
      filteredData.length / 2
    );

    var x = d3
      .scaleBand()
      .domain(
        topData.map(function (d) {
          return d.statecode;
        })
      )
      .range([0, width])
      .padding(0.2);

    var xAxis = svg
      .append("g")
      .attr("transform", "translate(0," + height + ")");

    var yMax = d3.max(data, function (d) {
      return +d.count;
    });

    // Add Y axis
    var y = d3
      .scaleLinear()
      .domain([0, yMax + 10])
      .range([height, 0]);
    svg.append("g").call(d3.axisLeft(y));

    function update(selectedYear, selectedColor, top, bottom) {
      // Create new data with the selection?
      topData = getTop(
        sortDataByCount(filterData(data, selectedYear)),
        top,
        bottom
      );

      // Give these new data to update line
      x.domain(
        topData.map(function (d) {
          return d.statecode;
        })
      );
      xAxis
        .transition()
        .duration(1000)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .selectAll("text")
        .attr("class", "bar-label")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

      d3.selectAll(".bar").remove();

      // Bars
      svg
        .selectAll("rect")
        .data(topData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
          return x(d.statecode);
        })
        .attr("width", x.bandwidth())
        .attr("height", function (d) {
          return height - y(0);
        })
        .attr("y", function (d) {
          return y(0);
        });

      // Animation
      svg
        .selectAll("rect")
        .attr("fill", selectedColor)
        .transition()
        .duration(800)
        .attr("y", function (d) {
          return y(+d.count);
        })
        .transition()
        .duration(800)
        .attr("height", function (d) {
          return height - y(+d.count);
        })
        .delay(function (d, i) {
          return i * 10;
        });

      d3.selectAll(".bar-value").remove();

      svg
        .selectAll(".bar-value")
        .data(topData)
        .enter()
        .append("text")
        .classed("bar-value", true)
        .style("font-size", "x-small")
        .transition()
        .duration(800)
        .attr("x", function (d, i) {
          return x(d.statecode) + x.bandwidth() / 2;
        })
        .attr("y", height)
        .transition("label")
        .delay(function (d, i) {
          return i * 50; // gives it a smoother effect
        })
        .transition()
        .duration(1000)
        .attr("y", function (d, i) {
          return y(d.count) - 4;
        })
        .attr("text-anchor", "middle")
        .text(function (d) {
          return d.count;
        });
    }

    update(selectedYear, selectedColor, 0, topData.length);

    d3.select("#selectButton").on("change", function (d) {
      selectedYear = d3.select(this).property("value");
      let selectedColor = yearColors(selectedYear);
      var dataLength = filterData(data, selectedYear).length;
      update(selectedYear, selectedColor, 0, Math.round(dataLength / 2));
    });

    d3.select("#bottom25").on("click", function (d) {
      selectedYear = d3.select("#selectButton").property("value");
      let selectedColor = yearColors(selectedYear);
      var dataLength = filterData(data, selectedYear).length;
      update(
        selectedYear,
        selectedColor,
        Math.round(dataLength / 2),
        dataLength
      );
    });

    d3.select("#top25").on("click", function (d) {
      selectedYear = d3.select("#selectButton").property("value");
      let selectedColor = yearColors(selectedYear);
      var dataLength = filterData(data, selectedYear).length;
      update(selectedYear, selectedColor, 0, Math.round(dataLength / 2));
    });

    // Add X axis label:
    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("x", width / 2 + margin.left)
      .attr("y", height + margin.top + 20)
      .text("US States")
      .attr("font-size", "small");

    // Y axis label:
    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", -margin.top - height / 2 + 10)
      .text("Fatality count")
      .attr("font-size", "small");
  });
