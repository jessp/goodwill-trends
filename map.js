function drawMap(holder, data, title){
	let margin = {"left": 75, "top": 75, "bottom": 25, "right": 0};
	let width = 600;
	let height = 450;

	let svg = d3.select(holder);
	let stateLevel = svg.append("g").attr("transform", "scale(0.65,0.65) translate(0,100)");

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

}