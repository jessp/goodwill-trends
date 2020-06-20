function drawHistogram(holder, data, title, yTitle){
	let margin = {"left": 75, "top": 75, "bottom": 25, "right": 10};
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

	yAxis(axisY, yScale, width, height, margin, "~s");
	xAxis(axisX, xScale, width, height, margin, "$");
	d3.select(holder).select(".axisX").selectAll(".tick").selectAll("*").attr("transform", "translate(-" +(xScale.bandwidth()/2) + ",0)")

	makeTitle(d3.select(holder), margin, title);
	makeYName(d3.select(holder), margin, height, yTitle);
}