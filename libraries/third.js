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
      .domain([0, maxAge + 5])
      .range([0, width]);
    var xAxis = svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickSizeOuter(0));

    var y = d3.scaleLinear().domain([0, maxCount]).range([height, 0]);
    svg.append("g").call(d3.axisLeft(y));

    var tooltip = d3
      .select("#third-viz-tooltip")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden");

    var clip = svg
      .append("defs")
      .append("svg:clipPath")
      .attr("id", "clip")
      .append("svg:rect")
      .attr("width", width)
      .attr("height", height)
      .attr("x", 0)
      .attr("y", 0);

    var brush = d3
      .brushX()
      .extent([
        [0, 0],
        [width, height],
      ])
      .on("end", updateChart);

    var scatter = svg.append("g").attr("clip-path", "url(#clip)");

    scatter
      .selectAll("scatterCircle")
      .data(filteredData)
      .enter()
      .append("circle")
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut)
      .attr("class", "scatterCircle")
      .attr("cx", function (d) {
        return x(d.age);
      })
      .attr("cy", function (d) {
        return y(d.count);
      })
      .style("fill", "lightgrey")
      .attr("r", 10)
      .transition()
      .duration(800)
      .attr("r", r)
      .transition()
      .duration(1000)
      .style("fill", function (d) {
        return yearBinsColors(d.binned);
      })
      .style("opacity", 0.7);

    // Create Event Handlers for mouse
    function handleMouseOver(d, i) {
      d3.select(this).attr("r", Number(r) * 2);
      tooltip.style("visibility", "visible");
      return tooltip
        .html(
          "Year: " +
            d.year +
            "<br/>" +
            "Age: " +
            d.age +
            "<br/>" +
            "Count: " +
            d.count
        )
        .style("top", event.pageY - 10 + "px")
        .style("left", event.pageX + 10 + "px")
        .style("font-size", "small");
    }

    function handleMouseOut(d, i) {
      // Use D3 to select element, change color back to normal
      d3.select(this).attr("r", Number(r));
      return tooltip.style("visibility", "hidden");

      //   // Select text by id and then remove
      //   d3.select("#t" + d.x + "-" + d.y + "-" + i).remove(); // Remove text location
    }

    // scatter.append("g").attr("class", "brush").call(brush);

    var idleTimeout;
    function idled() {
      idleTimeout = null;
    }

    function updateChart() {
      extent = d3.event.selection;
      var count = 0;
      if (!extent) {
        if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350));
        x.domain([0, maxAge + 10]);
        // console.log("If Not extent");
        // d3.selectAll("#third_dataViz .annotation-line").remove();
        // d3.selectAll("#third_dataViz .annotation-text").remove();
        drawAnnotations();
      } else {
        x.domain([x.invert(extent[0]), x.invert(extent[1])]);
        scatter.select(".brush").call(brush.move, null);
        console.log("Else Extent");
        d3.selectAll("#third_dataViz .annotation-line").remove();
        d3.selectAll("#third_dataViz .annotation-text").remove();
      }

      xAxis.transition().duration(1000).call(d3.axisBottom(x));
      scatter
        .selectAll(".scatterCircle")
        .transition()
        .duration(1000)
        .attr("cx", function (d) {
          return x(d.age);
        })
        .attr("cy", function (d) {
          return y(d.count);
        });
    }

    svg
      .append("g")
      .append("text")
      .attr("text-anchor", "end")
      .attr("x", width / 2 + margin.left)
      .attr("y", height + margin.top + 15)
      .style("font-size", "small")
      .text("Age");

    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", -margin.top - height / 2 + 10)
      .text("Fatality count")
      .style("font-size", "small");

    var svgLegend = svg
      .append("g")
      .attr("class", "gLegend")
      .attr(
        "transform",
        "translate(" + (width - margin.right - 80) + "," + margin.top + ")"
      );

    var legend = svgLegend
      .selectAll(".legend")
      .data(yearBins)
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
      .style("fill", (d, i) => yearBinsColors(i));

    legend
      .append("text")
      .attr("class", "legend-text")
      .attr("class", "w3-button")
      .attr("x", r * 2)
      .attr("y", r / 2)
      .style("fill", "#A9A9A9")
      .style("font-size", "small")
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

    svg
      .append("text")
      .text("<-Hover")
      .attr("x", width - margin.right - 40)
      .attr("y", height - margin.bottom)
      .style("font-size", "small");

    drawAnnotations();

    d3.select("#third-grid select").on("change", function (d) {
      selectedYear = d3.select(this).property("value");
      filteredData = filterData(data, selectedYear);
      updateScatter(filteredData);
    });

    function drawAnnotations() {
      d3.selection.prototype.first = function () {
        return d3.select(this.nodes()[0]);
      };
      d3.selection.prototype.last = function () {
        return d3.select(this.nodes()[this.size() - 1]);
      };

      var scatterCircles = svg.selectAll(".scatterCircle");
      scatterCircles.first().attr("transform", "translate(4,0)");
      scatterCircles.last().attr("transform", "translate(-4,0)");

      if (scatterCircles !== null) {
        svg
          .append("line")
          .attr("class", "annotation-line")
          .transition()
          .duration(500)
          .attr("x1", scatterCircles.last().attr("cx"))
          .attr("y1", scatterCircles.last().attr("cy"))
          .attr("x2", scatterCircles.last().attr("cx"))
          .attr("y2", height - 200)
          .transition()
          .duration(500)
          .attr("stroke", "darkgrey")
          .style("stroke-width", "2px")
          .style("stroke-dasharray", "5,3");

        svg
          .append("text")
          .transition()
          .duration(500)
          .attr("class", "annotation-text")
          .attr("x", Number(scatterCircles.last().attr("cx")) - 80)
          .transition()
          .duration(500)
          .attr("y", height - 200)
          .text(
            "Year: " +
              scatterCircles.last().data()[0].year +
              " Max Age: " +
              scatterCircles.last().data()[0].age
          )
          .style("font-size", "small")
          .attr("stroke", "grey");

        svg
          .append("line")
          .attr("class", "annotation-line")
          .transition()
          .duration(500)
          .attr("x1", scatterCircles.first().attr("cx"))
          .attr("y1", scatterCircles.first().attr("cy"))
          .attr("x2", scatterCircles.first().attr("cx"))
          .attr("y2", height - 300)
          .transition()
          .duration(500)
          .attr("stroke", "darkgrey")
          .style("stroke-width", "2px")
          .style("stroke-dasharray", "5,3");

        svg
          .append("text")
          .transition()
          .duration(500)
          .attr("class", "annotation-text")
          .attr("x", Number(scatterCircles.first().attr("cx")) - 10)
          .transition()
          .duration(500)
          .attr("y", height - 300)
          .text(
            "Year: " +
              scatterCircles.first().data()[0].year +
              " Min Age: " +
              scatterCircles.first().data()[0].age
          )
          .style("font-size", "small")
          .attr("stroke", "grey");
      }
    }

    function updateScatter(filteredData) {
      d3.selectAll("#third_dataViz .scatterCircle").remove();
      d3.selectAll("#third_dataViz .annotation-line").remove();
      d3.selectAll("#third_dataViz .annotation-text").remove();

      scatter
        .selectAll("scatterCircle")
        .data(filteredData)
        .enter()
        .append("circle")
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
        .attr("class", "scatterCircle")
        .attr("cx", function (d) {
          console.log(d);
          return x(d.age);
        })

        .attr("cy", function (d) {
          return y(d.count);
        })
        .style("fill", "lightgrey")
        .attr("r", 10)
        .transition()
        .duration(800)
        .attr("r", r)
        .transition()
        .duration(800)
        .style("fill", function (d) {
          return yearBinsColors(d.binned);
        })
        .style("opacity", 0.7);

      drawAnnotations();
    }
  });
