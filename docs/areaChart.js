function drawAreaChart(holder, data, legend, yTitle){

  let width = d3.select(holder).node().width.baseVal.value;
  let height = d3.select(holder).node().height.baseVal.value;
  let margin = {"left": width < 500 ? 65 : 75, "top": 0, "bottom": 75, "right": 0};
	let keys = ["Under 5", "Everything Else", "Over 10"];
	let values = Array.from(d3.rollup(data, ([d]) => d.value, d => +d.date, d => d.name));
	let svg = d3.select(holder);
      svg.attr("viewBox", `0 0 ${width} ${height}`)
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

   	drawLineChartLegend(svg.append("g").attr("class", "legend").attr("transform", "translate(" + (0) + "," + (height - margin.bottom/2) + ")"), legend, width);
    makeYName(d3.select(holder), margin, height, yTitle);

    svg.call(areaHover, path, x, y, data);
}