function drawMap(holder, data){
	let width = d3.select(holder).node().width.baseVal.value;
  	let height = d3.select(holder).node().height.baseVal.value;
	let margin = {"left": 75, "top": 75, "bottom": 50, "right": 0};
  	let theScale = 0.0015;
	let svg = d3.select(holder)
		svg.attr("viewBox", `0 0 ${width} ${height}`)
	let stateLevel = svg.append("g").attr("transform", `scale(${theScale*height},${theScale*height}) translate(0,0)`);

	let colourScale = d3.scaleLinear()
		.range(["pink", "orange", "red"])
		.domain([0, 5, 10]);

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
	    })
	    .style("cursor", d => d.price ? "pointer" : "initial")
	    .on("mouseover", function(d){
	    	if (d.price){
	    		let centre = path.centroid(d);
	    		squarePopupStart(d3.select(holder), 
	    		[centre[0] * theScale*height, centre[1] * theScale*height],
	    		[d.properties.name, d.brand, "Median Price of All Tops", "", d3.format("$")(d.price), ""]);

	    	}
	    })
	    .on("touchstart", function(d){
	    	if (d.price){
	    		let centre = path.centroid(d);
	    		squarePopupStart(d3.select(holder), 
	    		[centre[0] * theScale*height, centre[1] * theScale*height],
	    		[d.properties.name, d.brand, "Median Price of All Tops", "", d3.format("$")(d.price), ""]);

	    	}
	    })
	    .on("mouseout", function(d){
	    	squarePopupStop(d3.select(holder));
	    })
	    .on("touchend", function(d){
	    	squarePopupStop(d3.select(holder));
	    })

	if (width > 500){
	
		stateLevel.selectAll("text")
		  .data(data)
		  .enter().append("text")
		  	.attr("transform", function(d) { 
		  		let centre = path.centroid(d);
		  		if (d.properties.name === "New Jersey"){
		  			return "translate(" + (centre[0] + 100) + "," + (centre[1] + 20) + ")";
		  		}
		  		if (d.properties.name === "Indiana"){
		  			return "translate(" + (centre[0] + 15) + "," + (centre[1] + 50) + ")";
		  		}
		  		return "translate(" + centre + ")"; 
		  	})
		  	.style("pointer-events", "none")
		  	.text(function(d){ return d.brand})
		  	.attr("font-size", "150%")
		  	.attr("text-anchor", "middle")
		  	.attr("fill", "#fff")
		    .attr("stroke", "#000")
		    .attr("stroke-opacity", 0.75)
		    .attr("stroke-width", 4)
		    .attr("paint-order", "stroke");

		let jerseyData = data.find(e => e.properties.name === "New Jersey");
		let jerseyLine = stateLevel.select(".jerseyLine").node() === null ? stateLevel.append("line").attr("class", "jerseyLine") : stateLevel.select(".jerseyLine");
		jerseyLine
			.attr("x1", path.centroid(jerseyData)[0])
			.attr("x2", path.centroid(jerseyData)[0] + 25)
			.attr("y1", path.centroid(jerseyData)[1])
			.attr("y2", path.centroid(jerseyData)[1] + 10)
			.attr("stroke", "#000")
			.attr("stroke-width", 2.5)

		let indianaData = data.find(e => e.properties.name === "Indiana");
		let indianaLine = stateLevel.select(".indianaLine").node() === null ? stateLevel.append("line").attr("class", "indianaLine") : stateLevel.select(".indianaLine");
		indianaLine
			.attr("x1", path.centroid(indianaData)[0])
			.attr("x2", path.centroid(indianaData)[0] + 15)
			.attr("y1", path.centroid(indianaData)[1])
			.attr("y2", path.centroid(indianaData)[1] + 40)
			.attr("stroke", "#000")
			.attr("stroke-width", 2.5)
	}

	let extent = d3.extent(data.filter(e => e.price !== undefined).map(f => f.price));
	let legendGroup = svg.append("g").attr("class", "legend").attr("transform", "translate(0," + (height - margin.bottom + 15) + ")");
	drawMapLegend(legendGroup, margin, width, colourScale, extent);
	setupSquarePopup(d3.select(holder));
}

function drawMapLegend(group, margin, width, scale, extent){
	let defs = group.select("#gradLinear").node() === null ? group.append("defs").append("linearGradient").attr("id", "gradLinear") : group.select("#gradLinear");

	let stop0 = defs.select(".stop0").node() === null ? defs.append("stop").attr("class", "stop0").attr("offset", "0%") : defs.select(".stop0");
	let stop1 = defs.select(".stop1").node() === null ? defs.append("stop").attr("class", "stop1") : defs.select(".stop1");
	let stop2 = defs.select(".stop2").node() === null ? defs.append("stop").attr("class", "stop2").attr("offset", "100%") : defs.select(".stop2");
	stop0.attr("stop-color", scale(extent[0]));
	stop1.attr("offset", (1 - scale.domain()[1]/(extent[1] - extent[0]) * 100 ) + "%")
		.attr("stop-color", "orange");
	stop2.attr("stop-color", scale(extent[1]));

	let rectGradient = group.select(".gradient").node() === null ? group.append("rect").attr("class", "gradient") : group.select(".gradient");
	rectGradient
		.attr("x", 0)
		.attr("y", 25)
		.attr("width", 130)
		.attr("height", 10)
		.attr("fill", "url(#gradLinear)");

	let gradientTopText = group.select(".gradientTopText").node() === null ? group.append("text").attr("class", "gradientTopText") : group.select(".gradientTopText");
	gradientTopText.attr("x", 0)
		.attr("y", 55)
		.text("$" + extent[0] + " (Lowest Price)");
	let topGradientLine = group.select(".gradientTopLine").node() === null ? group.append("line").attr("class", "gradientTopLine") : group.select(".gradientTopLine");
	topGradientLine.attr("x1", 0)
		.attr("x2", 0)
		.attr("y1", 25).attr("y2", 40)
		.attr("stroke", "#000")

	let gradientBottomText = group.select(".gradientBottomText").node() === null ? group.append("text").attr("class", "gradientBottomText") : group.select(".gradientBottomText");
	gradientBottomText.attr("x", 130)
		.attr("y", 55)
		.text("$" + extent[1] + " (Highest Price)");

	let BottomGradientLine = group.select(".gradientBottomLine").node() === null ? group.append("line").attr("class", "gradientBottomLine") : group.select(".gradientBottomLine");
	BottomGradientLine.attr("x1", 130)
		.attr("x2", 130)
		.attr("y1", 25).attr("y2", 40)
		.attr("stroke", "#000")

	let rectangleLegend = group.select(".legRect").node() === null ? group.append("rect").attr("class", "legRect") : group.select("legRect");
	rectangleLegend.attr("x", width > 500 ? 275 : 240)
	.attr("y", 25)
	.attr("width", 7)
	.attr("height", 10)
	.attr("fill", "url(#diagonalHatch)");

	let noDataGradientLine = group.select(".gradientNoDataLine").node() === null ? group.append("line").attr("class", "gradientNoDataLine") : group.select(".gradientNoDataLine");
	noDataGradientLine.attr("x1", width > 500 ? 275 : 240)
		.attr("x2", width > 500 ? 275 : 240)
		.attr("y1", 25).attr("y2", 40)
		.attr("stroke", "#000")

	let noDataText = group.select(".gradientNoDataText").node() === null ? group.append("text").attr("class", "gradientNoDataText") : group.select(".gradientNoDataText");
	noDataText.attr("x", width > 500 ? 275 : 240)
		.attr("y", 55)
		.text("Insufficient Data");
	
}