function drawStreamChart(holder, data, title){
  let margin = {"left": 50, "top": 75, "bottom": 65, "right": 50};
  let keys = d3.map(data, d => d.name).keys();
  let values = Array.from(d3.rollup(data, ([d]) => d.value, d => +d.date, d => d.name));
  let width = 1000;
  let height = 500;
  let svg = d3.select(holder);
  let mainG = svg.append("g").attr("class", "main");
  let axisX = svg.append("g").attr("class", "axisX");
  let labelG = svg.append("g").attr("class", "labels");
  let x = d3.scaleUtc()
      .domain(d3.extent(data, d => d.date))
      .range([margin.left, width - margin.right]);  
  xAxis(axisX, x, width, height, margin);

  let area = d3.area()
    .x(d => x(d.data[0]))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]))
    .curve(d3.curveCardinal)

  let order = d3.stackOrderNone;
  let series = d3.stack()
    .keys(keys)
    .value(([, values], key) => values.get(key))
    .order(order)
    .offset(d3.stackOffsetWiggle)
  (values);

  series.forEach(function(d, i){
    if (d[0][1] === d3.max(series.map(f => f[0][1]))) {
      d.top = true;
    }
    if (d[0][0] === d3.min(series.map(f => f[0][0]))) {
      d.bottom = true;
    }
  });

  // let axisY = svg.append("g").attr("class", "axisY");
    let y = d3.scaleLinear()
  .domain([0, d3.max(series, d => d3.max(d, d => d[1]))]).nice()
    .range([(height - margin.bottom * 3), margin.top])

  let color = d3.scaleOrdinal()
    .domain(keys)
    .range(d3.schemeDark2);

    let groups = mainG
    .selectAll("g")
    .data(series)
    .join("g")

    groups.append("path")
      .attr("fill", ({key}) => color(key))
      .attr("d", area)
    .append("title")
      .text(({key}) => key);

   let titles = labelG
    .selectAll("text")
    .data(series)
    .join("text")
    .text(function(d){
        return d.key;
    })
    .attr("fill", "#fff")
    .attr("stroke", "#000")
    .attr("stroke-opacity", 0.75)
    .attr("stroke-width", 3)
    .attr("paint-order", "stroke")



    titles
    .datum(function(d){
      return getBestLabel(this, d, x, y);
    })
    .attr("text-anchor", "middle")
    .filter(d => d)
    .attr("x", d => d[0])
    .attr("y", d => d[1])

    makeTitle(d3.select(holder), margin, title);
}

function getBestLabel(that, points, x, y) {
  let newX = d3.scaleLinear().domain([0, points.length]).range(x.range());
  var bbox = that.getBBox(),
      numValues = Math.ceil(newX.invert(bbox.width + 25)),
      finder = findSpace(points, bbox, numValues, newX, y);
  let posFound = finder();
  let altPoint;
  if (!posFound && !points.top && !points.bottom){
  	  let maxPoint = d3.maxIndex(points, e => e[1] - e[0]);
  	  let iOfMax = points[maxPoint];
  	  altPoint = [x(iOfMax.data[0]), y((iOfMax[1] - iOfMax[0])/2 + iOfMax[0])];
  } 

  let bottomPoint;
  if (points.bottom){
  	bottomPoint = finder(null, y.range()[0]);
  	bottomPoint = [bottomPoint[0] + 10, bottomPoint[1] + 20]
  }
  // Try to fit it inside, otherwise try to fit it above or below
  return posFound ||
    (points.top && finder(y.range()[1])) ||
    (points.bottom && bottomPoint) ||
    altPoint;
}


function findSpace(points, bbox, numValues, x, y) {

  return function(top, bottom) {
    var bestRange = -Infinity,
      bestPoint,
      set,
      floor,
      ceiling,
      textY;

    for (var i = 1; i < points.length - numValues - 1; i++) {
      set = points.slice(i, i + numValues);
      if (bottom != null) {
        floor = bottom;
        ceiling = d3.max(set, d => y(d[0]));
      } else if (top != null) {
        floor = d3.min(set, d => y(d[1]));
        ceiling = top;
      } else {
        floor = d3.min(set, d => y(d[0]));
        ceiling = d3.max(set, d => y(d[1]));
      }
      
      if (floor - ceiling > bbox.height + 20 && floor - ceiling > bestRange) {
        bestRange = floor - ceiling;
        if (bottom != null) {
          textY = ceiling + bbox.height / 2 + 10;
        } else if (top != null) {
          textY = floor - bbox.height / 2 - 10;
        } else {
          textY = (floor + ceiling) / 2;
        }
        bestPoint = [
          x(i + (numValues - 1) / 2),
          textY
        ];
      }
    }
   
    return bestPoint;
  };
}