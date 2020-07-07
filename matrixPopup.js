function matrixHover(svg, path, x, y, data, margin, scale, xWid){
  var eachBand = y.step();

  let dates = data[0].values.map(e => e.date).sort((a, b) => a - b);
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

  setupSquarePopup(svg);
  let popup = svg.select(".popup");
	function moved() {
	    d3.event.preventDefault();
	    const mouse = d3.mouse(this);
	    const xm = x.invert(mouse[0] - margin.left);
      var index = Math.round(((mouse[1] - margin.top) / eachBand));
      var ym = y.domain()[index];
      if (ym){
        let selectedRow = data.find(e => e.key === ym);
  	    const i1 = d3.bisectLeft(dates, xm, 1);
  	    const i0 = i1 - 1;
  	    const i = xm - dates[i0] > dates[i1] - xm ? i1 : i0;
        var theValue; 
        let d = selectedRow.values.find(e => e.date.getTime() === dates[i].getTime());
        if (d.count > 0){
          if (scale === "priceRel" || scale === "priceAbs") {
            theValue = {"key": "Median Price", "value": d3.format("$")(d.price)};
          } else if (scale === "countRel" || scale === "countAbs"){
            theValue = {"key": "Count", "value": d3.format(",")(d.count)};
          } else {
            theValue = {"key": "Count of Designer Items", "value": d.designerCount};
          }
          popup.style("display", null);
          popup.attr("transform", `translate(${x(dates[i]) + margin.left + xWid/2},${y(ym) + 2})`);
          popup.select(".hl1").text(dateFormat(dates[i]));
          popup.select(".hl2").text(ym);
          popup.select(".cat1hl").text(theValue["key"]);
          popup.select(".cat1val").text(theValue["value"]);
          popup.select(".cat2hl").text("");
          popup.select(".cat2val").text("");
        } else {
          popup.style("display", "none");
        }
	 }
  }

	function entered() {
    	popup.style("display", null);
  	}

	function left() {
	    popup.style("display", "none");
	}
}