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

function drawLineChart(holder, data, legend, title, yTitle){
	let margin = {"left": 75, "top": 75, "bottom": 25, "right": 175};
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

	drawLineChartLegend(svg.append("g").attr("class", "legend").attr("transform", "translate(" + (width - margin.right + 15) + "," + (margin.top) + ")"), legend);
	makeTitle(d3.select(holder), margin, title);
	makeYName(d3.select(holder), margin, height, yTitle);
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
