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
