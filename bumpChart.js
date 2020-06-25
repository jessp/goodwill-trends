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
	xAxisScaleAlt(axisX, xScale, width, height, margin);

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
	    .attr("class", d => d.brand.split(" ").join(""))
	    .on("mouseover", function(d){
	    	squarePopupStart(d3.select(holder), 
	    		[xScale(d.date) + margin.left, yScale(d.rank) + margin.top],
	    		[d["brand"], d.date.getFullYear(), "Rank", "Count", d.rank, d3.format(",")(d.count)]);
	    	d3.select(holder)
	    		.selectAll("circle")
	    		.attr("r", 4);
	    	d3.select(holder)
	    		.selectAll("." + d.brand.split(" ").join(""))
	    		.attr("r", 8);
	    })
	    .on("mouseout", function(d){
	    	squarePopupStop(d3.select(holder));
	    	d3.select(holder)
	    		.selectAll("circle")
	    		.attr("r", 4);
	    })
	    .on("touchstart", function(d){
	    	squarePopupStart(d3.select(holder), 
	    		[xScale(d.date) + margin.left, yScale(d.rank) + margin.top],
	    		[d["brand"], d.date.getFullYear(), "Rank", "Count", d.rank, d3.format(",")(d.count)]);
	    	d3.select(holder)
	    		.selectAll("circle")
	    		.attr("r", 4);
	    	d3.select(holder)
	    		.selectAll("." + d.brand.split(" ").join(""))
	    		.attr("r", 8);
	    })
	    .on("touchend", function(d){
	    	squarePopupStop(d3.select(holder));
	    	d3.select(holder)
	    		.selectAll("circle")
	    		.attr("r", 4);
	    })
	    .attr("r", 4)
	    .style("cursor", "pointer")
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

	setupSquarePopup(d3.select(holder));
	
}
