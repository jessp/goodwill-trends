function areaHover(svg, path, x, y, data){
  let mappedDates = data.map(e => e.date);
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
	    const i1 = d3.bisectLeft(mappedDates, xm, 1);

	    const i0 = i1 - 1;
	    const i = xm - mappedDates[i0] > mappedDates[i1] - xm ? i1 : i0;
      let matchedDates = data.filter(e => e.date.getTime() === mappedDates[i].getTime());

      let whichDate;
      if (ym < matchedDates[2].value){
        whichDate = matchedDates[2];
      } else if (ym < (matchedDates[2].value + matchedDates[0].value)){
        whichDate = matchedDates[0];
      } else {
        whichDate = matchedDates[1];
      }
	    dot.attr("transform", `translate(${x(mappedDates[i])},${mouse[1]})`);
	    dot.select("text").select("tspan:first-of-type").text(dateFormat(mappedDates[i]));
	    dot.select("text").select("tspan:nth-of-type(2)").text(d3.format(".2")(whichDate.value * 100) + "%");
	}

	function entered() {
    	dot.attr("display", null);
  	}

	function left() {
	    dot.attr("display", "none");
	}
}