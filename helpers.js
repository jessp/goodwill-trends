function xAxis(g, scale, width, height, margin){
	g
	.transition().duration(100)
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(scale).ticks(width / 80).tickSizeOuter(0));
}

function yAxis(g, scale, width, height, margin, format){
	g
	.transition().duration(250)
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(scale).tickFormat(d3.format(format)));
}

function drawLineChartLegend(holder, values){
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

function makeTitle(group, margin, title){
	let titleGroup = group.select(".svgTitle").node() === null ? group.append("g").attr("class", "svgTitle").append("text") : group.select(".svgTitle").select("text");
	titleGroup
		.attr("transform", `translate(${15},${margin.top/2})`)
		.text(title);
}