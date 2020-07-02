d3.csv("./data/compare_median_by_date.csv", function(d){
	let parseTime = d3.timeParse("%Y-%m");
	return {
		date: parseTime(d.date),
		nominal_all: +d.nominal_all,
		adjusted_all: +d.adjusted_all,
		nominal_tees: +d.nominal_tees,
		adjusted_tees: +d.adjusted_tees
	}
}).then(function(data) {
	const columns = data.columns.slice(1);
	let formattedData = {
		series: columns.map(d => ({
	      name: d,
	      values: data.map(k => +k[d])
	    })),
	    dates: data.map(d => d[data.columns[0]])
	};
	let legend = {
		"nominal_all": {"colour": "blue", "dash": "solid", "label": "All Items Nominal Price"},
		"nominal_tees": {"colour": "green", "dash": "solid", "label": "Just Tees Nominal Price"},
		"adjusted_all": {"colour": "blue", "dash": "dashed", "label": "All Items Adjusted Price"},
		"adjusted_tees": {"colour": "green", "dash": "dashed", "label": "Just Tees Adjusted Price"}
	}
	drawLineChart(".overtime", formattedData, legend, "Median Price of Top");
});


d3.csv("./data/percent_by_date.csv", function(d){
	let parseTime = d3.timeParse("%Y-%m");
	return {
		date: parseTime(d.date),
		name: d.range,
		value: +(d.id/100)
	}
}).then(function(data) {
	let legend = {
		"Over 10": {"colour": "red", "dash": "solid", "label": "Over $10"},
		"Everything Else": {"colour": "orange", "dash": "solid", "label": "Everything Else"},
		"Under 5": {"colour": "pink", "dash": "solid", "label": "Under $5"}

	}
	drawAreaChart(".stackedpricemargin", data, legend, "% of Tops Sold");
});

d3.csv("./data/trends_over_time.csv", function(d, e, columns){
	let parseTime = d3.timeParse("%Y-%m");
	let year = parseTime(d.year);
	let items = columns.slice(1).map(e => ({"date": year, "name": e, "value": +d[e]}));
	return items;
}).then(function(data) {
	let formattedData = data.flat();
	drawStreamChart(".trendStream", formattedData);
});

d3.csv("./data/top_brands.csv", function(d){
	return {
		brand: d.brand,
		count: +d.count
	};
}).then(function(data) {
	let width = window.innerWidth;
	drawVerticalBarChart(width < 760 ? ".small_topRankings" : ".topRankings", data, "steelblue");
});

d3.csv("./data/top_brands_by_year.csv", function(d){
	let parseTime = d3.timeParse("%Y");
	return {
		date: parseTime(d.date),
		brand: d.brand,
		count: +d.count
	};
}).then(function(data) {
	const columns = data.columns.slice(1);
	let unique = [...new Set(data.map(e => e.brand))];
	let dates = [...new Set(data.map(e => e.date.getTime()))];
	let dateArrays = unique.map(function(d){
		return dates.map(e => ({"date": new Date(e), "brand": d, "count": 0}))
	})
	dateArrays.map(function(e){
		for (var j = 0; j < e.length; j++){
			let brand = e[j]["brand"];
			let date = e[j]["date"];
			let justYear = data.filter(f => f.date.getTime() === date.getTime());
			let rank = justYear
						.map(e => e.brand).indexOf(brand);
			if (rank > -1){
				e[j]["rank"] = rank;
				e[j]["count"] = justYear[rank]["count"];
			} else {
				e[j]["rank"] = NaN;
				e[j]["count"] = NaN;
			}
		}
	});
	test = dateArrays.map(function(e){
		let newp = e.filter(function(f){
			return f.rank > -1;
		});
		return newp;
	});
	let brands = ["Loft", "Talbots", "Coral Bay", "Gloria Vanderbilt", "Reel Legends", "Nue Options", "Dept 222"];
	var scale = d3.scaleOrdinal().domain(brands).range(["#2d004b", "#542788", "#8073ac", "#b2abd2", "#e08214", "#b35806", "#7f3b08"]);
	drawBumpChart(".brandsOverTime", dateArrays, scale);
});

d3.csv("./data/prices_by_brand.csv", function(d){
	return {
		range: d.range,
		brand: d.brand,
		count: +d.count
	}
}).then(function(data) {
	let midBrands = data.filter(d => d.range === "Everything Else");
	let pricyBrands = data.filter(d => d.range === "Over 10");
	let cheapBrands = data.filter(d => d.range === "Under 5");

	drawVerticalBarChart(".cheapBrands", cheapBrands, "pink");
	drawVerticalBarChart(".pricyBrands", pricyBrands, "red");
	drawVerticalBarChart(".midBrands", midBrands, "orange");
});

d3.csv("./data/histogram.csv", function(d, e, columns){
	return {
		range: d.histo,
		count: +d.id
	}
}).then(function(data) {
	drawHistogram(window.innerWidth < 760 ? ".small_distribution" : ".distribution", data, "Count of Tops Sold");
});

d3.json("./data/brand_words.json").then(function(data) {
	let allDescriptors ={};
	let brandDistribution = data;
	let wordDistribution = {};
	for (var i = 0; i < Object.keys(data).length; i++){
		let theBrand = Object.keys(data)[i];
		let theWords = data[Object.keys(data)[i]];
		for (var j = 0; j < theWords.length; j++){
			if (Object.keys(wordDistribution).indexOf(theWords[j]) < 0){
				wordDistribution[theWords[j]] = [theBrand];
			} else {
				wordDistribution[theWords[j]].push(theBrand)
			}
		}
	}

	drawComparativeChart(".brandsToWords", brandDistribution, ".wordsToBrands", "Max Studio", "Explore Brands");
	drawComparativeSelector(".brandsToWords", brandDistribution, ".wordsToBrands", "Max Studio", "Explore Brands");
	drawComparativeChart(".wordsToBrands", wordDistribution, ".brandsToWords", "silk", "Explore Descriptors");
	drawComparativeSelector(".wordsToBrands", wordDistribution, ".brandsToWords", "silk", "Explore Descriptors");

});

d3.csv("./data/brands_count_over_time.csv", function(d){
	let parseTime = d3.timeParse("%Y-%m");
	return {
		date: parseTime(d.date),
		brand: d.brand,
		count: +d.count,
		median: +d.median
	}
}).then(function(data){
	let brands = [...new Set(data.map(e => e.brand))];
	let theDays = [...new Set(data.map(e => e.date.getTime()))];
	let formattedData = brands.map(e => ({[(e)]: theDays.map(f => ({[(f)]: data.find(g => g.brand === e && g.date.getTime() === f) || {"brand": e, "count": 0, "median": null, "date": new Date(f)}}))}));
	drawBrandLineChart(".brandsPriceOverTime", formattedData, "Brand Cost and Popularity Over Time", "Number of Items Sold", ["Gap", "Michael Kors"])
	
	drawBrandSelection(".brandDropdown", brands, ["Gap", "Michael Kors"], e => drawBrandLineChart(".brandsPriceOverTime", formattedData, "Brand Cost and Popularity Over Time", "Number of Items Sold", e));
})

d3.csv("./data/values_by_state.csv", function(d){
	let parseTime = d3.timeParse("%Y-%m");
	return {
		us_state: d.us_state,
		date: parseTime(d.date),
		count: +d.Count,
		price: +d.MedianPrice,
		designerCount: +d.DesignerCount
	}
}).then(function(data){

	let dates = [...new Set(data.map(e => e.date.getTime()))];
	let formattedData = d3.nest()
		.key(d => d.us_state)
		.entries(data);

	let blank = dates.map(e => ({count: 0, date: new Date(e), designerCount: 0, price: 0}));

	for (var i = 0; i < formattedData.length; i++){
		let theseDates = formattedData[i].values.map(e => e.date.getTime());

		formattedData[i].values = [...formattedData[i].values, ...blank.filter(d => !theseDates.includes(d.date.getTime()))];
	}

	drawMatrix(".valuesByState", formattedData, "priceRel", "Goodwill Tops by State Over Time");

	let selectElement = d3.select(".matrixDropdown")
		.on("change", function(d){
			if (this.value === "Price relative to state average"){
				drawMatrix(".valuesByState", formattedData, "priceRel", "Goodwill Tops by State Over Time");
			} else if (this.value === "Price relative to overall average"){
				drawMatrix(".valuesByState", formattedData, "priceAbs", "Goodwill Tops by State Over Time");
			} else if (this.value === "Count relative to state average") {
				drawMatrix(".valuesByState", formattedData, "countRel", "Goodwill Tops by State Over Time");
			} else if (this.value === "Count relative to overall average") {
				drawMatrix(".valuesByState", formattedData, "countAbs", "Goodwill Tops by State Over Time");
			} else if (this.value === "Count of designer tops") {
				drawMatrix(".valuesByState", formattedData, "countDes", "Goodwill Tops by State Over Time");
			}
		})
})

d3.csv("./data/top_stores.csv", function(d){
	return {
		brand: d.location.replace("Goodwill Industries", "GW I").replace("Goodwill", "GW"),
		count: +d.count
	}
}).then(function(data){
	let width = window.innerWidth;
	drawVerticalBarChart(innerWidth < 760 ? ".small_topStores" : ".topStores", data, "steelblue");
});

d3.csv("./data/brand_map.csv", function(d){
	return {
		brand: d.brand,
		state: d.us_state,
		price: +d.price
	}
}).then(function(data){
	d3.json("./states-albers-10m.json", function(json) {
		return json
	}).then(function(stateData){
		let formattedData = topojson.feature(stateData, stateData.objects.states).features;
		for (var i = 0; i < formattedData.length; i++){

			let stateName = formattedData[i].properties["name"];
			let theData = data.find(e => e.state === stateName); 
			if (theData){
				formattedData[i]["price"] = theData["price"];
				formattedData[i]["brand"] = theData["brand"];
			}
		}
		drawMap(".stateMap", formattedData);
	})
})