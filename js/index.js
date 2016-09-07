let jsonUrl = "https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json";

let width = 800;
let height = 800;

// Get json data
d3.json(jsonUrl, function(error, json) {

  let graph = d3.select(".graph")
    .attr("width", width)
    .attr("height", height);

  // Div for tooltip box
  let tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("opacity", 0);

  // forManyBody().strength(-55) seems to affect the "gravity."
  // The more negative the param is, the more spread apart the nodes are.
  let simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function id(d, i) {
      return i;
    }))
    .force("charge", d3.forceManyBody().strength(-70))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("positionX", d3.forceX(0))
    .force("positionY", d3.forceY(0));

  let link = graph.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(json.links)
    .enter().append("line");

  // Use foreignObject to attach flag to node
  // Credits to mbostock at https://gist.github.com/mbostock/1424037 for showing how to use foreignObject
  let node = graph.append("g")
    .attr("class", "nodes")
    .selectAll("foreignObject")
    .data(json.nodes)
    .enter().append("foreignObject")
    .attr("width", 16)
    .attr("height", 11);

  node.append("xhtml:div")
    .attr("xlink:href", "https://raw.githubusercontent.com/shintouki/uploaded-files/master/blank.gif")
    .attr("class", function(d) {
      return "flag flag-" + d.code;
    })
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended))
    .on("mouseover", function(d) {
      tooltip.transition()
        .duration(200)
        .style("opacity", 0.9);
      tooltip.html(d.country)
        .style("left", (d3.event.pageX + 5) + "px")
        .style("top", (d3.event.pageY - 25) + "px");
    })
    .on("mouseout", function(d) {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });

  simulation
    .nodes(json.nodes)
    .on("tick", ticked);

  simulation.force("link")
    .links(json.links);

  function ticked() {
    link
      .attr("x1", function(d) {
        return d.source.x;
      })
      .attr("y1", function(d) {
        return d.source.y;
      })
      .attr("x2", function(d) {
        return d.target.x;
      })
      .attr("y2", function(d) {
        return d.target.y;
      });

    node
      .attr("x", function(d) {
        return d.x;
      })
      .attr("y", function(d) {
        return d.y;
      });
  }

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
});

// Credits to Mike Bostock's force-directed graph example - https://bl.ocks.org/mbostock/4062045