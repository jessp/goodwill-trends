function drawMatrix(holder, data, scale, title){
	let margin = {"left": 120, "top": 30, "bottom": 75, "right": 0};
	let width = 600;
	let height = 650;
	let scaleX = d3.scaleUtc()
		.domain(d3.extent(data[0].values, e => e.date))
		.range([0, width-margin.left-margin.right]);

	let scaleY = d3.scaleBand()
		.domain(data.map(e => e.key))
		.range([margin.top, height - margin.bottom])
		.paddingInner(0.25);

	let dateFormat = d3.timeFormat("%B %Y")


	var colourDomainByState;

	if (scale === "priceRel"){
		colourDomainByState = data.map(e => 
			({
				[e.key]: d3.scaleLinear()
					.domain([0, d3.max(e.values, f => f.price)])
					.range([0, 1])
			}));
	} else if (scale === "priceAbs"){
		let priceMax = d3.max(data.map(e => d3.max(e.values.map(f => f.price))));
		colourDomainByState = data.map(e => 
			({
				[e.key]: d3.scaleLinear()
					.domain([0, priceMax])
					.range([0, 1])
			}));
	} else if (scale === "countRel"){
		colourDomainByState = data.map(e => 
			({
				[e.key]: d3.scaleLinear()
					.domain([0, d3.max(e.values, f => f.count)])
					.range([0, 1])
			}));
	} else if (scale === "countAbs"){
		let countMax = d3.max(data.map(e => d3.max(e.values.map(f => f.count))));
		colourDomainByState = data.map(e => 
			({
				[e.key]: d3.scaleLinear()
					.domain([0, countMax])
					.range([0, 1])
			}));
	} else {
		let countDes = d3.max(data.map(e => d3.max(e.values.map(f => f.designerCount))));
		colourDomainByState = data.map(e => 
			({
				[e.key]: d3.scaleLinear()
					.domain([0, countDes])
					.range([0, 1])
			}));
	}
	let colourDomainByStateObject = Object.assign({}, ...colourDomainByState);

	let oneBand = (scaleX.range()[1] - scaleX.range()[0])/data[0].values.length;

	let svg = d3.select(holder);


	let group = d3.select(holder).select(".main").node() === null ? d3.select(holder).append("g").attr("class", "main") : d3.select(holder).select(".main");
	group.attr("transform", "translate(" + margin.left + ",0)")

	let rows = group.selectAll("g.band")
		.data(data)
		.join("g")
		.attr("class", "band")
		.attr("state", d => d.key)
		.attr("transform", function(d){
			return "translate(0," + (scaleY(d.key)) + ")"
		});

	let rowText = rows.select("text").node() === null ? rows.append("text") : rows.select("text");
	
	rowText
		.attr("x", 0 - 5)
		.attr("text-anchor", "end")
		.attr("dy", scaleY.bandwidth())
		.text(function(d){ return d.key;});

	let boxes = rows.selectAll("rect")
		.data(d => d.values)
		.join("rect")
		.style("cursor", d => d.us_state ? "pointer" : "initial")
		// .on("mouseenter", function(d){
		// 	if (d.us_state){
		// 		var theValue; 

		// 		if (scale === "priceRel" || scale === "priceAbs") {
		// 			theValue = {"key": "Median Price", "value": d3.format("$")(d.price)};
		// 		} else if (scale === "countRel" || scale === "countAbs"){
		// 			theValue = {"key": "Count", "value": d3.format(",")(d.count)};
		// 		} else {
		// 			theValue = {"key": "Count of Designer Items", "value": d.designerCount};
		// 		}
		// 		squarePopupStart(d3.select(holder), 
	 //    		[scaleX(d["date"]) + margin.left + oneBand/2, scaleY(d.us_state)],
	 //    		[dateFormat(d["date"]), d["us_state"], theValue.key, "", theValue.value, ""]);
		// 	}
	 //    })
	 //    .on("touchstart", function(d){
		// 	if (d.us_state){
		// 		var theValue; 

		// 		if (scale === "priceRel" || scale === "priceAbs") {
		// 			theValue = {"key": "Median Price", "value": d3.format("$")(d.price)};
		// 		} else if (scale === "countRel" || scale === "countAbs"){
		// 			theValue = {"key": "Count", "value": d3.format(",")(d.count)};
		// 		} else {
		// 			theValue = {"key": "Count of Designer Items", "value": d.designerCount};
		// 		}
		// 		squarePopupStart(d3.select(holder), 
	 //    		[scaleX(d["date"]) + margin.left + oneBand/2, scaleY(d.us_state)],
	 //    		[dateFormat(d["date"]), d["us_state"], theValue.key, "", theValue.value, ""]);
		// 	}
	 //    })
	 //    .on("mouseout", function(d){
	 //    	squarePopupStop(d3.select(holder));
	 //    })
	 //    .on("touchend", function(d){
	 //    	squarePopupStop(d3.select(holder));
	 //    })
		.attr("x", function(d){ return scaleX(d["date"])})
		.attr("y", 0)
		.attr("width", oneBand)
		.attr("height", scaleY.bandwidth())
		.transition().duration(1000)
		.attr("fill", function(d){
			let parState = this.parentNode.getAttribute("state");
			if (d.count === 0){ return "url(#diagonalHatch)"}

			if (scale === "priceRel" || scale === "priceAbs"){
				return d3.interpolateBlues(colourDomainByStateObject[parState](d.price));
			}
			if (scale === "countRel" || scale === "countAbs"){
				return d3.interpolateBlues(colourDomainByStateObject[parState](d.count));
			}
			if (scale === "countDes"){
				return d3.interpolateBlues(colourDomainByStateObject[parState](d.designerCount));
			}
		});

	
	let axisX = d3.select(holder).select(".axisX").node() === null ? svg.append("g").attr("class", "axisX") : svg.select(".axisX");

	xAxisScaleAlt(axisX, scaleX, width, height, margin);

	let legendGroup = svg.select(".legend").node() === null ? svg.append("g").attr("class", "legend").attr("transform", "translate(" + (margin.left) + "," + (height - margin.bottom) + ")") : svg.select(".legend");
	drawMatrixLegend(legendGroup, margin, scale, colourDomainByState);

	setupSquarePopup(d3.select(holder));

}

function drawMatrixLegend(group, margin, scaleType, scaleVal){
	//get arizona scale for absolute values
	let arizona = scaleVal[0]["Arizona"].domain();
	let moneyFormat = d3.format("$");
	let commaFormat = d3.format(",");

	let defs = group.select("#gradLinearMatrix").node() === null ? group.append("defs").append("linearGradient").attr("id", "gradLinearMatrix") : group.select("#gradLinearMatrix");

	let stop0 = defs.select(".stop0").node() === null ? defs.append("stop").attr("class", "stop0").attr("offset", "0%") : defs.select(".stop0");
	let stop1 = defs.select(".stop1").node() === null ? defs.append("stop").attr("class", "stop1").attr("offset", "100%") : defs.select(".stop1");
	stop0.attr("stop-color", d3.interpolateBlues(0));
	stop1.attr("stop-color", d3.interpolateBlues(1));

	let rectGradient = group.select(".gradient").node() === null ? group.append("rect").attr("class", "gradient") : group.select(".gradient");
	rectGradient
		.attr("x", 0)
		.attr("y", 25)
		.attr("width", 150)
		.attr("height", 10)
		.attr("fill", "url(#gradLinearMatrix)");

	let gradientTopText = group.select(".gradientTopText").node() === null ? group.append("text").attr("class", "gradientTopText") : group.select(".gradientTopText");
	gradientTopText.attr("x", 0)
		.attr("y", 55)
		.text("abc jbjbjb")
		.text(function(){
			if (scaleType === "priceRel"){
				return "Cheaper";
			} else if (scaleType === "priceAbs"){
				return "$0";
			} else if (scaleType === "countRel"){
				return "Fewer"
			} else if (scaleType === "countAbs"){
				return "0 Tops"
			} else {
				return "0 Designer Tops"
			}
		})
	let topGradientLine = group.select(".gradientTopLine").node() === null ? group.append("line").attr("class", "gradientTopLine") : group.select(".gradientTopLine");
	topGradientLine.attr("x1", 0)
		.attr("x2", 0)
		.attr("y1", 25).attr("y2", 40)
		.attr("stroke", "#000")


	let gradientBottomText = group.select(".gradientBottomText").node() === null ? group.append("text").attr("class", "gradientBottomText") : group.select(".gradientBottomText");
	gradientBottomText.attr("x", 150)
		.attr("y", 55)
		.text(function(){
			if (scaleType === "priceRel"){
				return "Pricier";
			} else if (scaleType === "priceAbs"){
				return moneyFormat(arizona[1]);
			} else if (scaleType === "countRel"){
				return "More"
			} else if (scaleType === "countAbs"){
				return commaFormat(arizona[1]) + " Tops"
			} else {
				return arizona[1] + " Designer Tops"
			}
		})

	let BottomGradientLine = group.select(".gradientBottomLine").node() === null ? group.append("line").attr("class", "gradientBottomLine") : group.select(".gradientBottomLine");
	BottomGradientLine.attr("x1", 150)
		.attr("x2", 150)
		.attr("y1", 25).attr("y2", 40)
		.attr("stroke", "#000")

	let rectangleLegend = group.select(".legRect").node() === null ? group.append("rect").attr("class", "legRect") : group.select("legRect");
	rectangleLegend.attr("x", 250)
	.attr("y", 25)
	.attr("width", 7)
	.attr("height", 10)
	.attr("fill", "url(#diagonalHatch)");

	let noDataGradientLine = group.select(".gradientNoDataLine").node() === null ? group.append("line").attr("class", "gradientNoDataLine") : group.select(".gradientNoDataLine");
	noDataGradientLine.attr("x1", 250)
		.attr("x2", 250)
		.attr("y1", 25).attr("y2", 40)
		.attr("stroke", "#000")

	let noDataText = group.select(".gradientNoDataText").node() === null ? group.append("text").attr("class", "gradientNoDataText") : group.select(".gradientNoDataText");
	noDataText.attr("x", 250)
		.attr("y", 55)
		.text("Insufficient Data");
}