function drawBubbleChart(holder, data, clickData, defaultName, title){
	let margin = {"left": 50, "top": 75, "bottom": 25, "right": 25};
	let width = 450;
	let height = 450;
	let smallR = 20;
	let largeR = 50;

	let group = d3.select(holder).select(".main").node() === null ? d3.select(holder).append("g").attr("class", "main") : d3.select(holder).select(".main");

	let nodes = data[defaultName].map(e => ({"name": e, "r": smallR, "inG": true, "x": (Math.random() < 0.5 ? -smallR : width + smallR), "y": (Math.random() * height + smallR * 2 - smallR)}));
	nodes.push({"name": defaultName, "r": largeR, "main": true, "x": width/2, "y": height/2})

	 const node = group
	    .selectAll("g")
	    .data(nodes, d => d.name)
	    .join("g")
	    .attr("transform", d => `translate(${d.x},${d.y})`);

	node.append("circle")
	    .attr("r", d => d.r)
	    .attr("fill", "orange")
	    .on("click", function(d){
	    	drawBubbleChart(clickData.tag, clickData.data, {"tag": holder, "data": data, "title": title}, d.name, clickData.title)
	    });

	node.append("text")
		.attr("text-anchor", "middle")
		.attr("dy", 4)
		.attr("font-size", d => d.main ? "100%" : "60%")
		.attr("pointer-events", "none")
		.text(d => d.name)

	  const simulation = d3
	    .forceSimulation(nodes)
	    .on("tick", tick)
	    .force("collide", d3.forceCollide().radius(d => 1 + d.r))
	    .force("x", d3.forceX(width/2))
	    .force("y", d3.forceY(height/2));

		function tick() {
	    	node
	    		.attr("transform", d => `translate(${d.x},${d.y})`)
	  	}
	makeTitle(d3.select(holder), margin, "\"" + (defaultName.charAt(0).toUpperCase() + defaultName.slice(1)) + "\"" + title);

}

function drawLineChart(holder, data, legend, title){
	let margin = {"left": 50, "top": 75, "bottom": 25, "right": 175};
	let width = 600;
	let height = 300;
	let svg = d3.select(holder);
	let mainG = svg.append("g").attr("class", "main");
	let axisX = svg.append("g").attr("class", "axisX");
	let x = d3.scaleUtc()
	    .domain(d3.extent(data.dates))
	    .range([margin.left, width - margin.right]);	
	xAxis(axisX, x, width, height, margin);

	let axisY = svg.append("g").attr("class", "axisY");
    let y = d3.scaleLinear()
	    .domain([0, d3.max(data.series, d => d3.max(d.values))]).nice()
	    .range([height - margin.bottom, margin.top]);
	yAxis(axisY, y, width, height, margin, "$");
	const line = d3.line()
    .defined(d => !isNaN(d))
    .x((d, i) => x(data.dates[i]))
    .y(d => y(d))

	const path = svg.append("g")
      .attr("fill", "none")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
	    .selectAll("path")
	    .data(data.series)
	    .join("path")
	    	.attr("stroke", function(d){
	    		if (d.name === "price"){
	    			return null;
	    		}
      			return legend[d.name] ? legend[d.name]["colour"] : "orange";
      		})
      		.attr("stroke-dasharray", function(d){
      			if (d.name === "price"){
	    			return null;
	    		}
      			return legend[d.name]["dash"] === "solid" ? null : "3,3";
      		})
	      .attr("d", d => line(d.values));

	drawLegend(svg.append("g").attr("class", "legend").attr("transform", "translate(" + (width - margin.right + 15) + "," + (margin.top) + ")"), legend);
	makeTitle(d3.select(holder), margin, title);
}

function xAxis(g, scale, width, height, margin){
	g
	.transition().duration(100)
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(scale).ticks(width / 80).tickSizeOuter(0));
}

function xAxisBumpChart(g, scale, width, height, margin){
	g
    .attr("transform", `translate(${margin.left},${height - margin.bottom})`)
    .call(d3.axisTop(scale)
    	.tickSize(height - margin.top/4*3 - margin.bottom)
    	.ticks(6)
    	.tickSizeOuter(0))
    .call(g => g.selectAll(".tick line")
        .attr("stroke-opacity", 0.5)
        .attr("stroke-dasharray", "2,2"))
    .call(g => g.select(".domain")
        .remove());
}

function yAxis(g, scale, width, height, margin, format){
	g
	.transition().duration(250)
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(scale).tickFormat(d3.format(format)));
}


function drawLegend(holder, values){
	let names = holder.selectAll(".legItem")
			.data(Object.keys(values))
			.enter()
			.append("g")
			.attr("transform", (d, i) => `translate(0,${i * 30})`)
			.attr("class", "legItem")

	names.append("line")
			.attr("x1", 0)
			.attr("x2", 15)
			.attr("y1", 0)
			.attr("y2", 0)
			.attr("stroke-width", 2)
			.attr("stroke", function(d){
				return values[d]["colour"];
			})
			.attr("stroke-dasharray", function(d){
      			return values[d]["dash"] === "solid" ? null : "4,4";
      		});

	names.append("text")
			.attr("transform", "translate(20,4)")
			.text(d => values[d].label)
}

function drawAreaChart(holder, data, legend, title){
	let margin = {"left": 50, "top": 75, "bottom": 25, "right": 175};
	let keys = ["Under 5", "Everything Else", "Over 10"];
	let values = Array.from(d3.rollup(data, ([d]) => d.value, d => +d.date, d => d.name));
	let width = 600;
	let height = 300;
	let svg = d3.select(holder);
	let mainG = svg.append("g").attr("class", "main");
	let axisX = svg.append("g").attr("class", "axisX");
	let x = d3.scaleUtc()
	    .domain(d3.extent(data, d => d.date))
	    .range([margin.left, width - margin.right]);	
	xAxis(axisX, x, width, height, margin);

	let area = d3.area()
    .x(d => x(d.data[0]))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]))

	let order = d3.stackOrderNone;
	let series = d3.stack()
    .keys(keys)
    .value(([, values], key) => values.get(key))
    .order(order)
  (values)

	let axisY = svg.append("g").attr("class", "axisY");
    let y = d3.scaleLinear()
	.domain([0, 1]).nice()
    .range([height - margin.bottom, margin.top])
	yAxis(axisY, y, width, height, margin, ".0%");

    mainG
    .selectAll("path")
    .data(series)
    .join("path")
      .attr("fill", function(d){
      	return legend[d.key]["colour"];
      })
      .attr("d", area)
    .append("title")
      .text(({key}) => key);

   	drawLegend(svg.append("g").attr("class", "legend").attr("transform", "translate(" + (width - margin.right + 15) + "," + (margin.top) + ")"), legend);
   	makeTitle(d3.select(holder), margin, title);
}

function drawStreamChart(holder, data, title){
	let margin = {"left": 50, "top": 75, "bottom": 65, "right": 50};
	let keys = d3.map(data, d => d.name).keys();
	let values = Array.from(d3.rollup(data, ([d]) => d.value, d => +d.date, d => d.name));
	let width = 1000;
	let height = 500;
	let svg = d3.select(holder);
	let mainG = svg.append("g").attr("class", "main");
	let axisX = svg.append("g").attr("class", "axisX");
	let labelG = svg.append("g").attr("class", "labels");
	let x = d3.scaleUtc()
	    .domain(d3.extent(data, d => d.date))
	    .range([margin.left, width - margin.right]);	
	xAxis(axisX, x, width, height, margin);

	let area = d3.area()
    .x(d => x(d.data[0]))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]))
    .curve(d3.curveCardinal)

	let order = d3.stackOrderNone;
	let series = d3.stack()
    .keys(keys)
    .value(([, values], key) => values.get(key))
    .order(order)
    .offset(d3.stackOffsetWiggle)
  (values);

  series.forEach(function(d, i){
    if (d[0][1] === d3.max(series.map(f => f[0][1]))) {
      d.top = true;
    }
    if (d[0][0] === d3.min(series.map(f => f[0][0]))) {
      d.bottom = true;
    }
  });

	// let axisY = svg.append("g").attr("class", "axisY");
    let y = d3.scaleLinear()
	.domain([0, d3.max(series, d => d3.max(d, d => d[1]))]).nice()
    .range([(height - margin.bottom * 3), margin.top])

	let color = d3.scaleOrdinal()
    .domain(keys)
    .range(d3.schemeCategory10);

    let groups = mainG
    .selectAll("g")
    .data(series)
    .join("g")

    groups.append("path")
      .attr("fill", ({key}) => color(key))
      .attr("d", area)
    .append("title")
      .text(({key}) => key);

   let titles = labelG
    .selectAll("text")
    .data(series)
    .join("text")
    .text(function(d){
    		return d.key;
    })



    titles
    .datum(function(d){
    	return getBestLabel(this, d, x, y);
    })
    .attr("text-anchor", "middle")
    .filter(d => d)
    .attr("x", d => d[0])
    .attr("y", d => d[1])

    makeTitle(d3.select(holder), margin, title);
}

function drawVerticalBarChart(holder, data, color, title){
	let margin = {"left": 10, "top": 75, "bottom": 25, "right": 10};
	let width = 300;
	let height = 400;
	let svg = d3.select(holder);
	let xScale = d3.scaleLinear()
		.domain([0, d3.max(data.map(e => e.count))])
		.range([0, width-margin.left-margin.right]);
	let yScale = d3.scaleBand()
		.domain(data.map(e => e.brand))
		.range([0, height - margin.top - margin.bottom])
		.paddingInner(0.8);

	let mainGroup = svg.append("g")
		.attr("class", "holder")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	let rects = mainGroup.selectAll("g.barGroup")
		.data(data, function(d) { return d})
		.enter()
		.append("g")
		.attr("class", "barGroup")
		.attr("transform", (d) => ("translate(0," + yScale(d.brand) + ")"));

	rects.append("rect")
		.attr("width", function(d){
			return xScale(d.count);
		})
		.attr("height", yScale.bandwidth())
		.attr("fill", color);

	rects.append("text")
		.attr("transform", "translate(0," + (-yScale.bandwidth() + 2) + ")")
		.text(function(d){ return d.brand})

	rects.append("text")
		.attr("transform", "translate(" + (width - margin.left - margin.right) + "," + (-yScale.bandwidth() + 2) + ")")
		.style("text-anchor", "end")
		.text(function(d){ return d3.format(",")(d.count)})

	rects.append("line")
		.attr("x1",0)
		.attr("x2",width - margin.left - margin.right)
		.attr("y1",yScale.bandwidth()/2)
		.attr("y2",yScale.bandwidth()/2)
		.attr("stroke-dasharray", "2 2")
		.attr("stroke", color);

	makeTitle(d3.select(holder), margin, title);
}

function drawBumpChart(holder, data, colors, title){
	let margin = {"left": 150, "top": 100, "bottom": 25, "right": 150};
	let titleMargin = {"left": 150, "top": 75, "bottom": 25, "right": 150};
	let width = 600;
	let height = 450;
	let xScale = d3.scaleUtc()
		.domain(d3.extent(data.flat(), e => e.date))
		.range([0, width-margin.left-margin.right]);
	let yScale = d3.scaleLinear()
		.domain([0, 14])
		.range([0, height-margin.top-margin.bottom]);

	let axisX = d3.select(holder)
		.append("g").attr("class", "axisX");
	xAxisBumpChart(axisX, xScale, width, height, margin);

	let svg = d3.select(holder).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	const line = d3.line()
    .defined(d => !isNaN(d.rank))
    .x(d => xScale(d.date))
    .y(d => yScale(d.rank))

	const path = svg.append("g")
      .attr("fill", "none")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
	
	let items = path.selectAll("g.item")
	    .data(data, function(d){
	    	return d.filter(line.defined())
	    })
	    .enter()
	    .append("g")
	    .attr("stroke", function(d){
	    	if (colors.domain().indexOf(d[0]["brand"]) > -1){
	    		return colors(d[0]["brand"]);
	    	}
	    	return "#a1a176";
	    })
	    .attr("stroke-width", function(d){
	    	if (colors.domain().indexOf(d[0]["brand"]) > -1){
	    		return 2;
	    	}
	    	return 0.75;
	    })
	    .attr("class", "item");

	items.append("path")
	     	.attr("d", d => line(d));

	items.selectAll("circle")
		.data(function(e){
	    	return e.filter(line.defined())
	    })
	    .enter()
	    .append("circle")
	    .attr("r", 4)
	    .attr("fill", function(d){
	    	if (colors.domain().indexOf(d["brand"]) > -1){
	    		return colors(d["brand"]);
	    	}
	    	return "#a1a176";
	    })
	    .attr("cx", d => xScale(d.date))
	    .attr("cy", d => yScale(d.rank))

	svg.append("g").selectAll("text.inLabel")
		.data(data.filter(e => e[0]["count"] > 0), function(d){ return d.brand})
		.enter()
		.append("text")
		.attr("fill", function(d){
	    	if (colors.domain().indexOf(d[0]["brand"]) > -1){
	    		return colors(d[0]["brand"]);
	    	}
	    	return "#a1a176";
	    })
		.attr("class", "inLabel")
		.attr("text-anchor", "end")
		.attr("x", -15)
		.attr("dy", 4)
		.attr("y", function(d){
			return yScale(d[0]["rank"])
		})
		.text(function(d){
			return (d[0]["rank"] + 1) + ". " + d[0]["brand"];
		});

	svg.append("g").selectAll("text.outLabel")
		.data(data.filter(e => e[e.length - 1]["count"] > 0), function(d){ return d.brand})
		.enter()
		.append("text")
		.attr("fill", function(d){
	    	if (colors.domain().indexOf(d[0]["brand"]) > -1){
	    		return colors(d[d.length-1]["brand"]);
	    	}
	    	return "#a1a176";
	    })
		.attr("class", "outLabel")
		.attr("text-anchor", "start")
		.attr("x", width - margin.right - margin.right + 15)
		.attr("dy", 4)
		.attr("y", function(d){
			return yScale(d[d.length - 1]["rank"])
		})
		.text(function(d){
			return (d[d.length - 1]["rank"] + 1) + ". " + d[d.length - 1]["brand"];
		});

	makeTitle(d3.select(holder), titleMargin, title);
	
}

function drawHistogram(holder, data, title){
	let margin = {"left": 55, "top": 75, "bottom": 25, "right": 10};
	let width = 300;
	let height = 200;
	let svg = d3.select(holder).append("g").attr("transform", "translate(" + 0 + "," + 0 + ")");
	
	let axisY = d3.select(holder)
		.append("g").attr("class", "axisY");
	let axisX = d3.select(holder)
		.append("g").attr("class", "axisX");

	let xScale = d3.scaleBand()
		.domain(data.map(e => e.range))
		.range([margin.left, width - margin.right])
		.paddingInner(0.1);
	let yScale = d3.scaleLinear()
		.domain([0, d3.max(data.map(e => e.count))])
		.range([height - margin.bottom, margin.top]);
	let bars = svg.selectAll("rect")
		.data(data, d => d.range)
		.enter()
		.append("rect")
		.attr("fill", "steelblue")
		.attr("x", d => xScale(d.range))
		.attr("height", d => (height - margin.bottom - yScale(d.count)))
		.attr("width", xScale.bandwidth())
		.attr("y", d => yScale(d.count));

	yAxis(axisY, yScale, width, height, margin, "2,");
	xAxis(axisX, xScale, width, height, margin);
	d3.select(holder).select(".axisX").selectAll(".tick").selectAll("*").attr("transform", "translate(-" +(xScale.bandwidth()/2) + ",0)")

	makeTitle(d3.select(holder), margin, title);
}

function makeTitle(group, margin, title){
	let titleGroup = group.select(".svgTitle").node() === null ? group.append("g").attr("class", "svgTitle").append("text") : group.select(".svgTitle").select("text");
	titleGroup
		.attr("transform", `translate(${15},${margin.top/2})`)
		.text(title);
}

function getBestLabel(that, points, x, y) {
  let newX = d3.scaleLinear().domain([0, points.length]).range(x.range());
  var bbox = that.getBBox(),
      numValues = Math.ceil(newX.invert(bbox.width + 25)),
      finder = findSpace(points, bbox, numValues, newX, y);
  let posFound = finder();
  let altPoint;
  if (!posFound && !points.top && !points.bottom){
  	  let maxPoint = d3.maxIndex(points, e => e[1] - e[0]);
  	  let iOfMax = points[maxPoint];
  	  altPoint = [x(iOfMax.data[0]), y((iOfMax[1] - iOfMax[0])/2 + iOfMax[0])];
  } 

  let bottomPoint;
  if (points.bottom){
  	bottomPoint = finder(null, y.range()[0]);
  	bottomPoint = [bottomPoint[0] + 10, bottomPoint[1] + 20]
  }
  // Try to fit it inside, otherwise try to fit it above or below
  return posFound ||
    (points.top && finder(y.range()[1])) ||
    (points.bottom && bottomPoint) ||
    altPoint;
}


function findSpace(points, bbox, numValues, x, y) {

  return function(top, bottom) {
    var bestRange = -Infinity,
      bestPoint,
      set,
      floor,
      ceiling,
      textY;

    for (var i = 1; i < points.length - numValues - 1; i++) {
      set = points.slice(i, i + numValues);
      if (bottom != null) {
        floor = bottom;
        ceiling = d3.max(set, d => y(d[0]));
      } else if (top != null) {
        floor = d3.min(set, d => y(d[1]));
        ceiling = top;
      } else {
        floor = d3.min(set, d => y(d[0]));
        ceiling = d3.max(set, d => y(d[1]));
      }
      
      if (floor - ceiling > bbox.height + 20 && floor - ceiling > bestRange) {
        bestRange = floor - ceiling;
        if (bottom != null) {
          textY = ceiling + bbox.height / 2 + 10;
        } else if (top != null) {
          textY = floor - bbox.height / 2 - 10;
        } else {
          textY = (floor + ceiling) / 2;
        }
        bestPoint = [
          x(i + (numValues - 1) / 2),
          textY
        ];
      }
    }
   
    return bestPoint;
  };
}

function drawBrandLineChart(holder, data, title, selected){
	let margin = {"left": 55, "top": 75, "bottom": 25, "right": 100};
	let width = 600;
	let height = 350;
	let svg = d3.select(holder);
	let mainG = svg.select(".main").node() === null ? svg.append("g").attr("class", "main") : svg.select(".main");
	mainG.style("mix-blend-mode", "multiply");
	let axisX = svg.select(".axisX").node() === null ? svg.append("g").attr("class", "axisX") : svg.select(".axisX");
	let dates = Object.values(data[0])[0].map(e => Object.values(e)[0]["date"]);
	let x = d3.scaleUtc()
	    .domain(d3.extent(dates))
	    .range([margin.left, width - margin.right]);	
	xAxis(axisX, x, width, height, margin);
	let selectedData = data.filter(e => selected.some(f => Object.keys(e)[0] === f));
	let axisY = svg.select(".axisY").node() === null ? svg.append("g").attr("class", "axisY") : svg.select(".axisY");
    let y = d3.scaleLinear()
	    .domain([0, d3.max(selectedData.map(e => Object.values(e)[0]).flat().map(f => Object.values(f)[0].count))]).nice()
	    .range([height - margin.bottom, margin.top]);
	yAxis(axisY, y, width, height, margin, "2,");
	let theMax = d3.max(selectedData.map(e => Object.values(e)[0]).flat().map(f => Object.values(f)[0].median));
	if (theMax > 15){
		theMax = 15;
	}
	let radii = d3.scaleLinear()
		.domain([0, theMax]).nice()
	    .range([0, 6]);


	const line = d3.line()
    .defined(d => !isNaN(Object.values(d)[0].count))
    .x(d => x(Object.values(d)[0].date))
    .y(d => y(Object.values(d)[0].count))

	const path = mainG
      .attr("fill", "none")
      .attr("stroke-width", 1.5)
      .attr("stroke", "steelblue")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
	    .selectAll("path")
	    .data(selectedData)
	    .join("path")
	    .attr("d", function(d){
	    	return line(Object.values(d)[0]);
	    });

	let circles = svg.selectAll(".circleGroup")
		.data(selectedData)
		.join("g")
		.attr("class", "circleGroup")
			.selectAll("circle")
			.data(function(d){
				return Object.values(d)[0].filter(function(d){ return d.count !== 0});
			})
			.join("circle")
			.attr("fill", "steelblue")
			.attr("r", function(d){
				return radii(Object.values(d)[0].median)
			})
			.attr("cx", function(d){
				return x(Object.values(d)[0].date)
			})
			.attr("cy", function(d){
				return y(Object.values(d)[0].count)
			})

	makeTitle(d3.select(holder), margin, title);

}

function drawBrandSelection(holder, allBrands, selected, callback){
	let div = d3.select(holder);
	let divs = div.selectAll("div.checkbox")
		.data(allBrands)
		.join("div")
		.attr("class", "checkbox")
		.on("click", function(d){
			const index = selected.indexOf(d);
			if (index > -1){
				selected.splice(index, 1);
			} else {
				selected.push(d);
			}
			callback(selected);
		});

	divs.append("input")
		.attr("type", "checkbox")
		.property("checked", d => selected.indexOf(d) > -1)

	divs.append("label")
		.html(d => d)
}

function drawMatrix(holder, data, scale, title){
	let margin = {"left": 120, "top": 30, "bottom": 25, "right": 0};
	let width = 600;
	let height = 600;
	let scaleX = d3.scaleUtc()
		.domain(d3.extent(data[0].values, e => e.date))
		.range([0, width-margin.left-margin.right]);

	let scaleY = d3.scaleBand()
		.domain(data.map(e => e.key))
		.range([margin.top, height - margin.bottom])
		.paddingInner(0.25)


	var colourDomainByState;

	if (scale === "priceRel"){
		colourDomainByState = data.map(e => 
			({
				[e.key]: d3.scaleLinear()
					.domain([0, d3.max(e.values, f => f.price)])
					.range([0, 1])
			}));
	} else if (scale === "priceAbs"){
		let priceMax = d3.max(data.map(e => d3.max(e.values.map(f => f.price))));
		colourDomainByState = data.map(e => 
			({
				[e.key]: d3.scaleLinear()
					.domain([0, priceMax])
					.range([0, 1])
			}));
	} else if (scale === "countRel"){
		colourDomainByState = data.map(e => 
			({
				[e.key]: d3.scaleLinear()
					.domain([0, d3.max(e.values, f => f.count)])
					.range([0, 1])
			}));
	} else if (scale === "countAbs"){
		let countMax = d3.max(data.map(e => d3.max(e.values.map(f => f.count))));
		colourDomainByState = data.map(e => 
			({
				[e.key]: d3.scaleLinear()
					.domain([0, countMax])
					.range([0, 1])
			}));
	} else {
		let countDes = d3.max(data.map(e => d3.max(e.values.map(f => f.designerCount))));
		colourDomainByState = data.map(e => 
			({
				[e.key]: d3.scaleLinear()
					.domain([0, countDes])
					.range([0, 1])
			}));
	}
	let colourDomainByStateObject = Object.assign({}, ...colourDomainByState);

	let oneBand = (scaleX.range()[1] - scaleX.range()[0])/data[0].values.length;

	let svg = d3.select(holder);


	let group = d3.select(holder).select(".main").node() === null ? d3.select(holder).append("g").attr("class", "main") : d3.select(holder).select(".main");
	group.attr("transform", "translate(" + margin.left + ",0)")

	let rows = group.selectAll("g.band")
		.data(data)
		.join("g")
		.attr("class", "band")
		.attr("state", d => d.key)
		.attr("transform", function(d){
			return "translate(0," + (scaleY(d.key)) + ")"
		});

	let rowText = rows.select("text").node() === null ? rows.append("text") : rows.select("text");
	
	rowText
		.attr("x", 0 - 5)
		.attr("text-anchor", "end")
		.attr("dy", scaleY.bandwidth())
		.text(function(d){ return d.key;});

	let boxes = rows.selectAll("rect")
		.data(d => d.values)
		.join("rect")
		.attr("x", function(d){ return scaleX(d["date"])})
		.attr("y", 0)
		.attr("width", oneBand)
		.attr("height", scaleY.bandwidth())
		.transition().duration(1000)
		.attr("fill", function(d){
			let parState = this.parentNode.getAttribute("state");
			if (d.count === 0){ return "url(#diagonalHatch)"}

			if (scale === "priceRel" || scale === "priceAbs"){
				return d3.interpolateBlues(colourDomainByStateObject[parState](d.price));
			}
			if (scale === "countRel" || scale === "countAbs"){
				return d3.interpolateBlues(colourDomainByStateObject[parState](d.count));
			}
			if (scale === "countDes"){
				return d3.interpolateBlues(colourDomainByStateObject[parState](d.designerCount));
			}
		});

	
	let axisX = d3.select(holder).select(".axisX").node() === null ? svg.append("g").attr("class", "axisX") : svg.select(".axisX");

	xAxisBumpChart(axisX, scaleX, width, height, margin);
}

function drawMap(holder, data, title){
	let margin = {"left": 75, "top": 75, "bottom": 25, "right": 0};
	let width = 600;
	let height = 450;

	let svg = d3.select(holder);
	let stateLevel = svg.append("g").attr("transform", "scale(0.65,0.65) translate(0,100)");

	let colourScale = d3.scaleLinear()
		.range(["pink", "orange", "red"])
		.domain([0, 5, 10])

	let path = d3.geoPath();
	stateLevel.selectAll("path")
	  .data(data)
	  .enter().append("path")
	    .attr("d", path)
	    .style("opacity", 0.8)
	    .attr("stroke", "#fff")
	    .attr("fill", function(d){
	    	if (!d.price){
	    		return "url(#diagonalHatch)";
	    	} else {
	    		return colourScale(d.price);
	    	}
	    });
	
	stateLevel.selectAll("text")
	  .data(data)
	  .enter().append("text")
	  	.attr("transform", function(d) { 
	  		return "translate(" + path.centroid(d) + ")"; 
	  	})
	  	.text(function(d){ return d.brand})
	  	.attr("text-anchor", "middle")

	makeTitle(d3.select(holder), margin, title);

}