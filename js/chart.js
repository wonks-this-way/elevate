var areas = ['All', 
 'Asian',
 'American Indian or Alaska Native',
 'Black or African American',
 'Hispanic or Latino',
 'Native Hawaiian or Other Pacific Islander',
 'White',
 'More than one race']

// CHANGE VERSION HERE
version = 'All';

var margin = {
    top: 20,
    right: 100,
    bottom: 180,
    left: 100
},
width = 1200 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom,
recWidth = 35;

var x = d3.scale.ordinal()
.rangeBands([0, width]);

var y = d3.scale.linear()
	.range([height, 0]);

var xAxis = d3.svg.axis()
.scale(x)
.orient("bottom");

var yAxis = d3.svg.axis()
.scale(y)
.orient("left");

var colorScale = d3.scale.category10();

var svg = d3.select("#chart").append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Background Rect
svg.append("rect")
.attr("width", width)
.attr("height", height)
.style("fill-opacity", .01);

// Load in Data
d3.tsv("data.tsv", function(error, data) {

data.forEach(function(d) {
    d['Total'] = +d['Total']
    d['Occ'] = d['Occupation'].replace(/\s+/g, '').replace(/\W/g, '');
    d['Cat'] = d['Category'].replace(/\s+/g, '').replace(/\W/g, '');
});

var nestedData = d3.nest()
    .key(function(d) {
        return d.Race;
    })
    .sortKeys(d3.descending)
    .sortValues(function(a, b) {
        return b['Total'] - a['Total'];
    })
    .entries(data);

var selectedData = nestedData.filter(function(d) {
    return d.key === version;
})
// Setting X & Y Domains based on the data
y.domain(d3.extent(selectedData[0].values.map(function(d, i) {
    return d.Total;
}))).nice();
x.domain(selectedData[0].values.map(function(d) {
    return d.Occupation;
}));

svg.selectAll(".bar")
    .data(selectedData[0].values)
    .enter().append("rect")
    .attr("class", function(d) {
        return "bar " + d.Occ + " " + d.Cat
    })
    .attr("rx", 2)
    .attr("ry", 2)
    .attr("x", function(d) {
        return x(d.Occupation);
    })
    .attr("y", function(d) {
        return y(d.Total);
    })
    .attr("height", function(d) {
        return height - y(d.Total);
    })
    .attr("width", recWidth)
    .style("fill", function(d) {
        return colorScale(d.Category);
    });

// Axis Labels
svg.selectAll("text")
    .data(selectedData[0].values)
    .enter().append("text")
    .attr("class", function(d) {
        return "axisText " + d['Occ']
    })
    .attr("y", height + 14)
    .attr("text-anchor", "top")
    .attr("transform", function(d) {
        return "rotate(45 " + x(d['Occupation']) + "," + (height + 14) + ")";
    })
    .attr("x", function(d, i) {
        return x(d['Occupation']);
    })
    .text(function(d) {
        return d['Occupation']
    });


// appending the axes
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

// Need to make these mobile compatitble
svg.append("text")
    .attr("class", "label")
    .attr("x", -40)
    .attr("y", 80)
    .attr("text-anchor", "top")
    .attr("transform", function(d) {
        return "rotate(270 " + 10 + "," + (height / 2) + ")";
    })
    .style("font-size", "12px")
    .text("Number of Employed");

svg.append("text")
    .attr("class", "label")
    .attr("x", width - 10)
    .attr("y", -10)
    .attr("text-anchor", "end")
    .style("font-size", "12px")
    .text("Click to filter by category");

// Dropdown Filter
d3.select("#selectSpot")
    .append("text")
    .attr("class", "label")
    .attr("text-anchor", "top")
    .style("font-size", "14px")
    .html("Click to see how the number of employed shift across ethnicity and race.");


var select = d3.select("#areaList")
    .append("select")
    .on("change", change),
    options = select.selectAll('option').data(areas); // Data join

// Enter selection
options.enter().append("option").text(function(d) {
    return d;
});

// Change the dataset
function change() {

    // turn off pointer events
    d3.selectAll(".bar")
        .style("pointer-events", "None");

    // Retrieve dropdown selection
    var newValue = this.value;
    newData = nestedData.filter(function(d) {
        return d.key === newValue;
    })

    // Reset domains
    y.domain(d3.extent(newData[0].values.map(function(d, i) {
        return d.Total;
    }))).nice();
    x.domain(newData[0].values.map(function(d) {
        return d.Occupation;
    }));

    // Replot bars using update method
    svg.selectAll(".bar")
        .data(newData[0].values)
        .transition()
        .delay(function(d, i) {
            return i * 20;
        })
        .duration(1000)
        .attr("class", function(d) {
            return "bar " + d['Occ'] + " " + d['Cat']
        })
        .attr("width", recWidth)
        .attr("height", function(d, i) {
            return height - y(d['Total']);
        })
        .style("fill", function(d, i) {
            return colorScale(d['Category']);
        })
        .attr("rx", 2)
        .attr("ry", 2)
        .attr("y", function(d, i) {
            return y(d['Total']);
        })
        .attr("x", function(d, i) {
            return x(d['Occupation']);
        })
        .each("end", function() {
            d3.selectAll(".bar").style("pointer-events", "all");
        })

    // Axis Labels
    svg.selectAll("text")
        .data(newData[0].values)
        .transition()
        .duration(1000)
        .attr("class", function(d) {
            return "axisText " + d['Occ']
        })
        .attr("y", height + 14)
        .attr("text-anchor", "top")
        .attr("transform", function(d) {
            return "rotate(45 " + x(d['Occupation']) + "," + (height + 14) + ")";
        })
        .attr("x", function(d, i) {
            return x(d['Occupation']);
        })
        .text(function(d) {
            return d['Occupation']
        });

    // Reset axes
    svg.select(".y")
        .attr("class", "y axis")
        .transition()
        .duration(1000)
        .call(yAxis);

    svg.select(".x")
        .attr("class", "x axis")
        .transition()
        .delay(function(d, i) {
            return i * 20;
        })
        .duration(1000)
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

}

// Hover Events
function hover(d, i) {

    svg.selectAll(".bar")
        .transition()
        .delay(100)
        .duration(2000)
        .ease("elastic")
        .attr("height", 10)
        .attr("y", height - 10)
        .style("fill-opacity", .3);

    var textFill = d['Occupation'];
    textFillTwo = d['Category'],
    textFillThree = numeral(d['Total']).format('0,0') + " employed",
    xLoc = d['Occupation'],
    yLoc = d['Total'];

    d3.selectAll(".bar" + d['Occ'])
        .transition()
        .duration(2000)
        .attr("height", function(d, i) {
            return height - y(yLoc);
        })
        .attr("y", function(d, i) {
            return y(yLoc);
        })
        .style("fill-opacity", 1);

    d3.selectAll("." + d['Occ'])
        .transition()
        .duration(500)
        .style("font-size", "12px");

    svg.append("text")
        .attr("class", "box")
        .attr("x", function(d, i) {
            if (y(yLoc) < (height / 3)) {
                return x(xLoc) + 25;
            } else {
                return x(xLoc);
            }
        })
        .attr("y", function(d, i) {
            if (y(yLoc) < (height / 3)) {
                return y(yLoc) + 15;
            } else {
                return y(yLoc) - 45;
            }
        })
        .attr("text-anchor", "top")
        .style("font-size", "2.0em")
        .html(textFill);

    svg.append("text")
        .attr("class", "box")
        .attr("x", function(d, i) {
            if (y(yLoc) < (height / 3)) {
                return x(xLoc) + 25;
            } else {
                return x(xLoc);
            }
        })
        .attr("y", function(d, i) {
            if (y(yLoc) < (height / 3)) {
                return y(yLoc) + 35;
            } else {
                return y(yLoc) - 25;
            }
        })
        .attr("text-anchor", "top")
        .style("font-size", "1.4em")
        .html(textFillTwo);

    svg.append("text")
        .attr("class", "box")
        .attr("x", function(d, i) {
            if (y(yLoc) < (height / 3)) {
                return x(xLoc) + 25;
            } else {
                return x(xLoc);
            }
        })
        .attr("y", function(d, i) {
            if (y(yLoc) < (height / 3)) {
                return y(yLoc) + 55;
            } else {
                return y(yLoc) - 5;
            }
        })
        .attr("text-anchor", function(d, i) {
            if (y(yLoc) < (height / 3)) {
                return "end";
            } else {
                "top";
            }
        })
        .attr("text-anchor", "top")
        .style("font-size", "1.4em")
        .html(textFillThree);
}


function hoverOut() {

    d3.selectAll(".box").remove();
    d3.selectAll(".bar").transition().delay(100).style("pointer-events", "none");

    svg.selectAll(".bar")
        .transition()
        .duration(2000)
        .ease("elastic")
        .attr("height", function(d, i) {
            return height - y(d['Total']);
        })
        .attr("y", function(d, i) {
            return y(d['Total']);
        })
        .style("fill-opacity", 1)
        .each("end", function() {
            d3.selectAll(".bar").style("pointer-events", "all");
        });

    svg.selectAll(".axisText")
        .transition()
        .duration(500)
        .ease("linear")
        .style("font-size", "8px");

}

svg.selectAll(".bar")
    .on("mouseover", hover)
    .on("mouseout", hoverOut);

// Click on Legend to "Filter" Dataset
function legendClick() {

    // Removing non-alphabetic characters for selection
    var filterOcc = this.__data__.replace(/\s+/g, '').replace(/\W/g, '');

    svg.selectAll(".bar")
        .transition()
        .duration(2000)
        .ease("elastic")
        .attr("height", 10)
        .attr("y", height - 10)
        .style("fill-opacity", .3);

    svg.selectAll("." + filterOcc)
        .transition()
        .duration(2000)
        .ease("elastic")
        .attr("height", function(d, i) {
            return height - y(d['Total']);
        })
        .attr("y", function(d, i) {
            return y(d['Total']);
        })
        .style("fill-opacity", 1);

}


// Legend
var legend = svg.selectAll(".legend")
    .data(colorScale.domain())
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) {
        return "translate(0," + i * 20 + ")";
    });

legend.append("rect")
    .attr("x", width - 22)
    .attr("y", 4)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", colorScale)
    .on("click", legendClick);

legend.append("text")
    .attr("x", width - 28)
    .attr("y", 13)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .style("font-size", "1.4em")
    .text(function(d) {
        return d;
    });

}); // Ends Data Function