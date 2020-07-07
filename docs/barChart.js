function drawVerticalBarChart(holder, data, color){
	let margin = {"left": 0, "top": 25, "bottom": 25, "right": 10};
	let width = d3.select(holder).node().width.baseVal.value;
  	let height = d3.select(holder).node().height.baseVal.value;
	let svg = d3.select(holder)
		svg.attr("viewBox", `0 0 ${width} ${height}`)
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
		.text(function(d){
			if (d.brand.length > Math.floor(width/15)){
				return d.brand.substring(0,Math.floor(width/15)+3) + "...";
			}
			return d.brand
			
		})
		.append("title")
		.text(d => d.brand)

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

}