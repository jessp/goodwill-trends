function drawHistogram(holder, data, yTitle){
	let width = d3.select(holder).node().width.baseVal.value;
  	let height = d3.select(holder).node().height.baseVal.value;
  	if (height > 10){
		let margin = {"left": 75, "top": 0, "bottom": 25, "right": 10};
		let svg = d3.select(holder)
			.attr("width", width)
			.attr("height", height)
			.append("g")
			.attr("transform", "translate(" + 0 + "," + 0 + ")");
		
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

		makeYName(d3.select(holder), margin, height, yTitle);
	}
}