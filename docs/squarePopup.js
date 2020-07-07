function setupSquarePopup(svg){
  if (svg.select(".popup").node() === null){
    let popup = svg.append("g")
    .attr("class", "popup")
    .attr("transform", "translate(200,200)")
    .style("display", "none");
    popup.append("path")
      .attr("d", "M 0 -5 L -5 -12 L -100 -12 L -100 -137 L 100 -137 L 100 -12 L 5 -12 Z")
      .attr("stroke", "#000")
      .attr("fill", "#fff")
      .attr("opacity", 0.85)

    popup.append("text").attr("class", "hl1 bold")
      .text("Main")
      .attr("x", -90)
      .attr("y", -110)

    popup.append("text").attr("class", "hl2 italic")
      .text("Sub")
      .style("font-size", "90%")
      .attr("x", -90)
      .attr("y", -90)

    popup.append("text").attr("class", "cat1hl bold")
      .text("Category")
      .attr("x", -90)
      .attr("y", -55)

    popup.append("text").attr("class", "cat2hl bold")
      .text("Category")
      .attr("x", 0)
      .attr("y", -55)

    popup.append("text").attr("class", "cat1val italic")
      .text("Value")
      .style("font-size", "90%")
      .attr("x", -90)
      .attr("y", -35)

    popup.append("text").attr("class", "cat2val italic")
      .text("Value")
      .style("font-size", "90%")
      .attr("x", 0)
      .attr("y", -35)
  }

}

function squarePopupStart(holder, pos, titles){
  let popup = holder.select(".popup");

  popup
    .style("display", "initial")
    .attr("transform", `translate(${pos[0]},${pos[1]})`);

  popup.select(".hl1")
    .text(titles[0]);

  popup.select(".hl2")
    .text(titles[1]);

  popup.select(".cat1hl")
    .text(titles[2]);

  popup.select(".cat2hl")
    .text(titles[3]);

  popup.select(".cat1val")
    .text(titles[4]);

  popup.select(".cat2val")
    .text(titles[5]);

}

function squarePopupStop(holder){
   let popup = holder.select(".popup")
      .style("display", "none");
}