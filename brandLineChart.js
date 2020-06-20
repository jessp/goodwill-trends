function drawBrandLineChart(holder, data, title, yTitle, selected){
	let margin = {"left": 75, "top": 30, "bottom": 25, "right": 175};
	let width = 600;
	let height = 250;
	let svg = d3.select(holder);
	let mainG = svg.select(".main").node() === null ? svg.append("g").attr("class", "main") : svg.select(".main");
	mainG.style("mix-blend-mode", "multiply");
	let axisX = svg.select(".axisX").node() === null ? svg.append("g").attr("class", "axisX") : svg.select(".axisX");
	let dates = Object.values(data[0])[0].map(e => Object.values(e)[0]["date"]);
	let x = d3.scaleUtc()
	    .domain(d3.extent(dates))
	    .range([margin.left, width - margin.right]);	
	xAxis(axisX, x, width, height, margin);
	let selectedData = data.filter(e => selected.some(f => Object.keys(e)[0] === f));
	let axisY = svg.select(".axisY").node() === null ? svg.append("g").attr("class", "axisY") : svg.select(".axisY");
    let y = d3.scaleLinear()
	    .domain([0, d3.max(selectedData.map(e => Object.values(e)[0]).flat().map(f => Object.values(f)[0].count))]).nice()
	    .range([height - margin.bottom, margin.top]);
	yAxis(axisY, y, width, height, margin, "2,");
	let theMax = d3.max(selectedData.map(e => Object.values(e)[0]).flat().map(f => Object.values(f)[0].median));
	let trueMax = theMax;
	let theMin = d3.min(selectedData.map(e => Object.values(e)[0]).flat().map(f => Object.values(f)[0].median));
	if (theMax > 15){
		theMax = 15;
	}
	let radii = d3.scaleLinear()
		.domain([0, theMin, theMax]).nice()
	    .range([0, 1, 6]);


	const line = d3.line()
    .defined(d => !isNaN(Object.values(d)[0].count))
    .x(d => x(Object.values(d)[0].date))
    .y(d => y(Object.values(d)[0].count))

	const path = mainG
      .attr("fill", "none")
      .attr("stroke-width", 1.5)
      .attr("stroke", "steelblue")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
	    .selectAll("path")
	    .data(selectedData)
	    .join("path")
	    .style("mix-blend-mode", "multiply")
	    .attr("d", function(d){
	    	return line(Object.values(d)[0]);
	    });

	let circles = svg.selectAll(".circleGroup")
		.data(selectedData)
		.join("g")
		.attr("class", "circleGroup")
			.selectAll("circle")
			.data(function(d){
				return Object.values(d)[0].filter(function(d){ return d.count !== 0});
			})
			.join("circle")
			.style("mix-blend-mode", "multiply")
			.attr("fill", "steelblue")
			.attr("r", function(d){
				return radii(Object.values(d)[0].median)
			})
			.attr("cx", function(d){
				return x(Object.values(d)[0].date)
			})
			.attr("cy", function(d){
				return y(Object.values(d)[0].count)
			});
		let legend = {
			"all": {"colour": "steelblue", "dash": "solid", "label": "# of Items from Brand"}
		};
		let legendG = svg.select(".legend").node() === null ? svg.append("g").attr("class", "legend") : svg.select(".legend");
	   	drawBrandLineChartLegend(legendG.attr("transform", "translate(" + (width - margin.right + 15) + "," + (margin.top) + ")"), legend, [theMin, trueMax]);

	   	makeYName(d3.select(holder), margin, height, yTitle);

}

function drawBrandSelection(holder, allBrands, selected, callBack){
	let brandObject = allBrands.map(e => ({"text": e, "selected": selected.includes(e)}));
	let selector = new SlimSelect({
	  select: holder,
	  data: brandObject,
	  onChange: function(e){
	  	let selectedBrands = e.map(f => f.value);
	  	callBack(selectedBrands);
	  }
	})
}

function drawBrandLineChartLegend(holder, values, scale){
	let priceFormat = d3.format(".2f");
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

	let priceHeader = holder.select(".priceHeader").node() === null ? holder.append("text").attr("class", "priceHeader") : holder.select(".priceHeader");

	priceHeader
		.text("Median Price of Top")
		.attr("transform", "translate(20,30.5)")
		.attr("font-weight", "bold")

	let smallCircle = holder.select(".smallCircle").node() === null ? holder.append("circle").attr("class", "smallCircle") : holder.select(".smallCircle");
	smallCircle
		.attr("r", 1)
		.attr("cx", 7.5)
		.attr("cy", 50)
		.attr("fill", "steelblue");

	let smallCircleText = holder.select(".smallCircleText").node() === null ? holder.append("text").attr("class", "smallCircleText") : holder.select(".smallCircleText");
	smallCircleText
		.attr("transform", "translate(20,54)")
		.text("$" + priceFormat(scale[0]) + " (Cheapest)");
	
	let largeCircle = holder.select(".largeCircle").node() === null ? holder.append("circle").attr("class", "largeCircle") : holder.select(".largeCircle");
	largeCircle
		.attr("r", 6)
		.attr("cx", 7.5)
		.attr("cy", 75)
		.attr("fill", "steelblue");

	let largeCircleText = holder.select(".largeCircleText").node() === null ? holder.append("text").attr("class", "largeCircleText") : holder.select(".largeCircleText");
	largeCircleText
		.attr("transform", "translate(20,79)")
		.text("$" + priceFormat(scale[1]) + " (Most Expensive)");
}