function drawMap(holder, data, title){
	let margin = {"left": 75, "top": 75, "bottom": 25, "right": 175};
	let width = 600;
	let height = 350;

	let svg = d3.select(holder);
	let stateLevel = svg.append("g").attr("transform", "scale(0.425,0.425) translate(0,125)");

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
	    .append("title")
	    .text(d => d.properties.name);
	
	stateLevel.selectAll("text")
	  .data(data)
	  .enter().append("text")
	  	.attr("transform", function(d) { 
	  		let centre = path.centroid(d);
	  		if (d.properties.name === "New Jersey"){
	  			return "translate(" + (centre[0] + 75) + "," + (centre[1] + 15) + ")";
	  		}
	  		if (d.properties.name === "Indiana"){
	  			return "translate(" + (centre[0] + 15) + "," + (centre[1] + 50) + ")";
	  		}
	  		return "translate(" + centre + ")"; 
	  	})
	  	.text(function(d){ return d.brand})
	  	.attr("font-size", "120%")
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

	makeTitle(d3.select(holder), margin, title);
	let extent = d3.extent(data.filter(e => e.price !== undefined).map(f => f.price));
	let legendGroup = svg.append("g").attr("class", "legend").attr("transform", "translate(" + (width - margin.right + 15) + "," + (margin.top) + ")");
	drawMapLegend(legendGroup, margin, width, colourScale, extent);
}

function drawMapLegend(group, margin, width, scale, extent){
	let defs = group.select("#gradLinear").node() === null ? group.append("defs").append("linearGradient").attr("id", "gradLinear").attr("x1", 0).attr("x2", 0).attr("y1", 1).attr("y2", 0) : group.select("#gradLinear");

	let stop0 = defs.select(".stop0").node() === null ? defs.append("stop").attr("class", "stop0").attr("offset", "0%") : defs.select(".stop0");
	let stop1 = defs.select(".stop1").node() === null ? defs.append("stop").attr("class", "stop1") : defs.select(".stop1");
	let stop2 = defs.select(".stop2").node() === null ? defs.append("stop").attr("class", "stop2").attr("offset", "100%") : defs.select(".stop2");
	stop0.attr("stop-color", scale(extent[0]));
	stop1.attr("offset", (1 - scale.domain()[1]/(extent[1] - extent[0]) * 100 ) + "%")
		.attr("stop-color", "orange");
	stop2.attr("stop-color", scale(extent[1]));

	let rectGradient = group.select(".gradient").node() === null ? group.append("rect").attr("class", "gradient") : group.select(".gradient");
	rectGradient
		.attr("x", 15)
		.attr("y", 0)
		.attr("width", 10)
		.attr("height", 90)
		.attr("fill", "url(#gradLinear)");

	let gradientTopText = group.select(".gradientTopText").node() === null ? group.append("text").attr("class", "gradientTopText") : group.select(".gradientTopText");
	gradientTopText.attr("x", 45)
		.attr("y", 0)
		.text("$" + extent[1] + " (Highest Price)");
	let topGradientLine = group.select(".gradientTopLine").node() === null ? group.append("line").attr("class", "gradientTopLine") : group.select(".gradientTopLine");
	topGradientLine.attr("x1", 15)
		.attr("x2", 40)
		.attr("y1", 0).attr("y2", 0)
		.attr("stroke", "#000")


	let gradientBottomText = group.select(".gradientBottomText").node() === null ? group.append("text").attr("class", "gradientBottomText") : group.select(".gradientBottomText");
	gradientBottomText.attr("x", 45)
		.attr("y", 90)
		.text("$" + extent[0] + " (Lowest Price)");

	let BottomGradientLine = group.select(".gradientBottomLine").node() === null ? group.append("line").attr("class", "gradientBottomLine") : group.select(".gradientBottomLine");
	BottomGradientLine.attr("x1", 15)
		.attr("x2", 40)
		.attr("y1", 90).attr("y2", 90)
		.attr("stroke", "#000")

	let rectangleLegend = group.select(".legRect").node() === null ? group.append("rect").attr("class", "legRect") : group.select("legRect");
	rectangleLegend.attr("x", 15)
	.attr("y", 105)
	.attr("width", 10)
	.attr("height", 15)
	.attr("fill", "url(#diagonalHatch)");

	let noDataGradientLine = group.select(".gradientNoDataLine").node() === null ? group.append("line").attr("class", "gradientNoDataLine") : group.select(".gradientNoDataLine");
	noDataGradientLine.attr("x1", 15)
		.attr("x2", 40)
		.attr("y1", 120).attr("y2", 120)
		.attr("stroke", "#000")

	let noDataText = group.select(".gradientNoDataText").node() === null ? group.append("text").attr("class", "gradientNoDataText") : group.select(".gradientNoDataText");
	noDataText.attr("x", 45)
		.attr("y", 120)
		.text("Insufficient Data");
}