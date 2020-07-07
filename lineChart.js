function drawLineChart(holder, data, legend, yTitle, yFormat, tooltipFormat){
	let width = d3.select(holder).node().width.baseVal.value;
	let height = d3.select(holder).node().height.baseVal.value;
	let margin = {"left": width < 500 ? 65 : 75, "top": 0, "bottom": 75, "right": 0};

	let svg = d3.select(holder)
		svg.attr("viewBox", `0 0 ${width} ${height}`)
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
	yAxis(axisY, y, width, height, margin, yFormat);
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
	
	drawLineChartLegend(svg.append("g").attr("class", "legend").attr("transform", "translate(" + (0) + "," + (height - margin.bottom/2) + ")"), legend, width);
	makeYName(d3.select(holder), margin, height, yTitle);

	svg.call(lineHover, path, x, y, data, legend, tooltipFormat);
}
