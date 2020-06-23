function drawComparativeChart(holder, data, clickData, defaultName, title){
	let div = d3.select(holder);
	div.select("h3").html(title);

	let list = div.select("ul")
		.selectAll("li")
		.data(data[defaultName])
		.join("li")
		.html(d => d)
		.on("click", function(d){
			d3.select(clickData + " select").node().slim.set(d);
		});
}

function drawComparativeSelector(holder, data, clickData, defaultName, title){
	let selectorObject = Object.keys(data).map(e => ({"text": e, "selected": defaultName.includes(e)}));
	
	let selector = new SlimSelect({
	  select: holder + " select",
	  data: selectorObject,
	  onChange: function(e){
	  	drawComparativeChart(holder, data, clickData, e.value, title);
	  }
	});
}
