function drawComparativeChart(holder, data, clickData, defaultName, title){
	let div = d3.select(holder);
	div.select("h3").html(title);

	const t = div.transition()
        .duration(1000);

	let list = div.select("ul")
		.selectAll("li")
		.data(data[defaultName], d => d)
			.join(
	        enter => enter.append("li")
	            .style("opacity", 0).style("margin-left", "-25px")
	            .html(d => "<span>" + d + "</span>")
	            .on("click", function(d){
					d3.select(clickData + " select").node().slim.set(d);
				})
	          .call(enter => enter.transition(t)
	            .style("opacity", 1).style("margin-left", "0px")),
	        update => update,
	        exit => exit
	          .call(exit => exit
	            .remove())
	      );
}

function drawComparativeSelector(holder, data, clickData, defaultName, title){
	let selectorObject = Object.keys(data).map(e => ({"text": e, "selected": defaultName.includes(e)}));
	selectorObject = selectorObject.sort((a, b) => d3.ascending(a.text, b.text));
	let selector = new SlimSelect({
	  select: holder + " select",
	  data: selectorObject,
	  onChange: function(e){
	  	drawComparativeChart(holder, data, clickData, e.value, title);
	  }
	});
}
