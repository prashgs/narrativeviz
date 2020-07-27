var years = ["2015", "2016", "2017", "2018", "2019"];
// set the dimensions and margins of the graph
var margin = { top: 10, right: 30, bottom: 90, left: 40 },
  width = 460 - margin.left - margin.right,
  height = 450 - margin.top - margin.bottom;
var yearColors = d3
  .scaleOrdinal()
  .domain(years)
  .range(["steelblue", "red", "blue", "green", "brown", "grey"]);

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
      .select("#selectButton")
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
        .call(d3.axisBottom(x))
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
        }) // always equal to 0
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
        .attr("x", function (d, i) {
          return x(d.statecode) + x.bandwidth() / 2;
        })
        .attr("y", height)
        .transition("label")
        .delay(function (d, i) {
          return i * 50; // gives it a smoother effect
        })
        .duration(500)
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
      .attr("font-size", "smaller");

    // Y axis label:
    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 10)
      .attr("x", -margin.top - height / 2 + 10)
      .text("Fatality count")
      .attr("font-size", "smaller");
  });
