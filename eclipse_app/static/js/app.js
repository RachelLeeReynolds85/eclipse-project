
// const data = [1800, 1850, 1900, 1950]

const margin = {
    top: 100,
    bottom: 100,
    left: 50,
    right: 50,
};

const timelineColumns = {
    eclipseWidth: 100,
    poetWidth: 100,
    poemWidth: 100,
}


d3.csv("static/data/data.csv").then((data) => {
    console.log(data)
    
    const svgHeigth = data.length * 500
    const svgWidth = 1000

    var timelineHeight = svgHeigth - margin.top - margin.bottom;
    var timelineWidth = svgWidth - margin.left - margin.right

    var timelineSvg = d3
        .select("#timeline")
        .append("svg")
        .attr("height", svgHeigth)
        .attr("width", svgWidth)

    timelineG = timelineSvg 
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .classed("timeline-group", true)

    yearData = data.map((d) => parseInt(d["year"]))
    intensityData = data.map((d) => parseInt(d["intensity"]))

    var yScale = d3.scaleLinear()
        .domain(d3.extent(yearData))
        .range([0, timelineHeight])
    
    yAxis = d3.axisLeft(yScale)
        .tickFormat(d3.format(".0f"))

    yAxisG = timelineG.append("g").call(yAxis).classed("timeline-axis", true)

    var radiusScale = d3.scaleLinear()
        .domain(d3.extent(intensityData))
        .range([0, timelineColumns.eclipseWidth / 1.1])

    var eclipseArea = timelineG.append("g").classed("eclipse-area",true)

    var moonG = eclipseArea
        .selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("transform", (d) => `translate (${timelineColumns.eclipseWidth}, ${yScale(parseInt(d.year))})`)
    
    moonG
        .append("circle")
        .attr("r", (d) => radiusScale(parseInt(d.intensity)))
        .attr("fill", "lightgray")

    var poetArea = timelineG
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
})
