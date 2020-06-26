function lineHover(svg, path, x, y, data, legend){
	let dateFormat = d3.timeFormat("%B %Y");
	if ("ontouchstart" in document) svg
      .style("-webkit-tap-highlight-color", "transparent")
      .on("touchmove", moved)
      .on("touchstart", entered)
      .on("touchend", left)
  else svg
      .on("mousemove", moved)
      .on("mouseenter", entered)
      .on("mouseleave", left);

  const dot = svg.append("g")
      .attr("display", "none");

  dot.append("circle")
      .attr("r", 2.5);

  let text = dot.append("text")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "middle");

  text.append("tspan")
  	.style("font-weight", "bold")
  	.attr("x", 0)
      .attr("y", -24);

  text.append("tspan")
  	.attr("x", 0)
      .attr("y", -8);

	function moved() {
	    d3.event.preventDefault();
	    const mouse = d3.mouse(this);
	    const xm = x.invert(mouse[0]);
	    const ym = y.invert(mouse[1]);
	    const i1 = d3.bisectLeft(data.dates, xm, 1);
	    const i0 = i1 - 1;
	    const i = xm - data.dates[i0] > data.dates[i1] - xm ? i1 : i0;
	    const s = d3.least(data.series, d => Math.abs(d.values[i] - ym));
	    path.attr("stroke", d => d === s ? (legend[d.name] ? legend[d.name]["colour"] : "orange") : "#ddd").filter(d => d === s).raise();
	    dot.attr("transform", `translate(${x(data.dates[i])},${y(s.values[i])})`);
	    dot.select("text").select("tspan:first-of-type").text(dateFormat(data.dates[i]));
	    dot.select("text").select("tspan:nth-of-type(2)").text(d3.format("$.2f")(s["values"][i]));
	}

	function entered() {
    	path.style("mix-blend-mode", null).attr("stroke", "#ddd");
    	dot.attr("display", null);
  	}

	function left() {
	    path.style("mix-blend-mode", "multiply").attr("stroke", d => legend[d.name] ? legend[d.name]["colour"] : "orange");
	    dot.attr("display", "none");
	}
}