function drawAreaChart(holder, data, legend, title, yTitle){
	let margin = {"left": 75, "top": 75, "bottom": 25, "right": 175};
	let keys = ["Under 5", "Everything Else", "Over 10"];
	let values = Array.from(d3.rollup(data, ([d]) => d.value, d => +d.date, d => d.name));
	let width = 600;
	let height = 300;
	let svg = d3.select(holder);
	let mainG = svg.append("g").attr("class", "main");
	let axisX = svg.append("g").attr("class", "axisX");
	let x = d3.scaleUtc()
	    .domain(d3.extent(data, d => d.date))
	    .range([margin.left, width - margin.right]);	
	xAxis(axisX, x, width, height, margin);

	let area = d3.area()
    .x(d => x(d.data[0]))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]))

	let order = d3.stackOrderNone;
	let series = d3.stack()
    .keys(keys)
    .value(([, values], key) => values.get(key))
    .order(order)
  (values)

	let axisY = svg.append("g").attr("class", "axisY");
    let y = d3.scaleLinear()
	.domain([0, 1]).nice()
    .range([height - margin.bottom, margin.top])
	yAxis(axisY, y, width, height, margin, ".0%");

  let path = mainG
    .selectAll("path")
    .data(series)
    .join("path")
      .attr("fill", function(d){
      	return legend[d.key]["colour"];
      })
      .attr("d", area)
    .append("title")
      .text(({key}) => key);

   	drawLineChartLegend(svg.append("g").attr("class", "legend").attr("transform", "translate(" + (width - margin.right + 15) + "," + (margin.top) + ")"), legend);
   	makeTitle(d3.select(holder), margin, title);
    makeYName(d3.select(holder), margin, height, yTitle);

    svg.call(areaHover, path, x, y, data);
}