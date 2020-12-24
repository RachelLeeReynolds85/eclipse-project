
const mapboxAccessToken = 'pk.eyJ1IjoicmFjaGVsbGVlcmV5bm9sZHM4NSIsImEiOiJja2Y5dzI4OGYwMTlzMnFwZHFoN2NjanV5In0._9M8fGH_2Ge9l2lextgMLQ'
mapboxgl.accessToken = mapboxAccessToken

const margin = {
    top: 100,
    bottom: 100,
    left: 50,
    right: 50,
};

const timelineColumns = {
    eclipseWidth: 300,
    poetWidth: 300,
    poemWidth: 300,
    eclipseHeight: 300,
}

const svgHeigth = 38 * 500
const svgWidth = 1000

const timelineHeight = svgHeigth - margin.top - margin.bottom;
const timelineWidth = svgWidth - margin.left - margin.right

const timelineSvg = d3
	.select("#timeline")
	.append("svg")
	.attr("height", svgHeigth)
	.attr("width", svgWidth)

const timelineG = timelineSvg 
	.append("g")
	.attr("transform", `translate(${margin.left}, ${margin.top})`)
	.classed("timeline-group", true)

d3.json("static/data/eclipse_data.json").then((data) => {
	console.log(data)

	eclipseYears = data.map((d) => parseInt(d["date"].slice(0, 4)))
	eclipseNames = data.map((d) => d["date"])
	console.log(eclipseNames)

	var yScale = d3.scaleLinear()
	.domain(d3.extent(eclipseYears))
	.range([0, timelineHeight])

	var yAxis = d3.axisLeft(yScale)
		.tickFormat(d3.format(".0f"))
		.ticks(100)

	var yAxisG = timelineG.append("g").call(yAxis).classed("timeline-axis", true)
	
	// ----- Column for eclipse maps ------------
    var eclipseArea = timelineG
        .append("g")
        .classed("eclipse-area", true)

    var eclipseG = eclipseArea
        .selectAll("g")
        .data(data)
		.enter()

	// placeholder for maps of eclipse paths
    eclipseG
		.append("rect")
		.attr("transform", (d) => `translate (0, ${yScale(parseInt(d["date"].slice(0, 4)))})`)
        .attr("height", timelineColumns.eclipseHeight)
        .attr("width", timelineColumns.eclipseWidth)
		.attr("fill", "darkgray")
		
	eclipseG
        .append("foreignObject")
		.attr("transform", (d) => `translate (0, ${yScale(parseInt(d["date"].slice(0, 4)))})`)
		.attr("height", 300)
		.attr("width", 300)
		.classed("mapbox-container", true)
		.append("xhtml:div")
		.attr("id", (d) => `eclipse-${d.date}`)
		.attr("height", 300)
		.attr("width", 300)    


	eclipseNames.forEach(eclipseName => {
		var eclipseIndex = data.findIndex((element) => element.date === eclipseName)
		eclipseDate = `${eclipseName.slice(-2)}/${eclipseName.slice(4,6)}/${eclipseName.slice(0,4)}`
		var mapData = [
			{
				type: "scattermapbox",
				lon: data[eclipseIndex]["central_line"]["lons"],
				lat: data[eclipseIndex]["central_line"]["lats"],
				marker: {
					color: "lightslategray",
					opacity: 0.5,
					line: {
						width: 1,
						color: "lightgray",
					}, 
					size: 12,
				},
			},
			{
				type: "scattermapbox",
				lon: data[eclipseIndex]["northern_limit"]["lons"],
				lat: data[eclipseIndex]["northern_limit"]["lats"],
				marker: {
					color: "lightgray",
					line: {
						width: 1,
						color: "lightgray",
					}, 
					size: 2,
				},
			},
			{
				type: "scattermapbox",
				lon: data[eclipseIndex]["southern_limit"]["lons"],
				lat: data[eclipseIndex]["southern_limit"]["lats"],
				marker: {
					color: "lightgray",
					line: {
						width: 1,
						color: "lightgray",
					}, 
					size: 2,
				},
			},
		]
		var mapLayout = {
			title: {
				text: eclipseDate,
				font: {
					color: "lightslategray",
				},
				yref: "paper",
				y: .95,
				yanchor: "top",
			},
			dragmode: "zoom",
			mapbox: {
				style: "dark",
				center: {
					lat: 35,
					lon: -100,
				},
				zoom: 1,
			},
			margin: {
				r: 0, t: 0, b: 0, l: 0
			},
			showlegend: false,
		}
		var mapboxConfig = {
			mapboxAccessToken: mapboxAccessToken
		}
		Plotly.newPlot(`eclipse-${eclipseName}`, mapData, mapLayout, mapboxConfig)
	});


	
	// ---------- ADD POETS AND POEMS FROM CSV FILE -----------
	d3.csv("static/data/data.csv").then((data) => {
		console.log(data)    
		
		// yearData = data.map((d) => parseInt(d["year"]))
		poemScoreData = data.map((d) => parseFloat(d["poemscore"]))
	
		// allYearData = data.map((d) => parseInt(d["year"])).concat(data.map((d) => parseInt(d["birth"]))).concat(data.map((d) => parseInt(d["death"])))
		// console.log(d3.extent(allYearData))
		// console.log(allYearData)
	
	
		var poemScale = d3.scaleLinear()
			.domain([0, 1])
			.range([0, 1])
	
		var poetArea = timelineG
			.append("g")
			// .attr("transform", `translate(${margin.left}, ${margin.top})`)
			.classed("poet-area", true)
		
		// --------Poet Column-------------
		var poetG = poetArea
			.selectAll("g")
			.data(data)
			.enter()
			.append("g")
			.attr("transform", (d) => `translate (${timelineColumns.eclipseWidth}, ${yScale(parseInt(d.birth))})`)
	
		poetG
			.append("text")
			.attr("x", timelineColumns.poetWidth / 2)
			.text((d) => `${d.poet}: ${d.birth}-${d.death}`)
			.attr("text-anchor", "middle")
			.attr("fill", "whitesmoke")
	
	
		// -----Poem column of timeline-------
	
		var poemArea = timelineG
			.append("g")
			// .attr("transform", `translate(${margin.left}, ${margin.top})`)
			.classed("poem-area", true)
		
		// For each poem, create moon icons in phases based on positivity/negativity of poem sentiment analysis
		moonRad = 50
		moonPhase = .25
	
		var poemG = poemArea
			.selectAll("g")
			.data(data)
			.enter()
			.append("g")
			.attr("transform", (d) => `translate (${timelineColumns.eclipseWidth + timelineColumns.poetWidth + timelineColumns.poemWidth / 2}, ${yScale(parseInt(d.year))})`)
		
		// draw light moon shape
		poemG
			.append("circle")
			.classed("moonLight", true)
			.attr("r", moonRad)
		
		// overlay moonface image
		poemG.append("image")
			.attr("x", -1 * moonRad)
			.attr("y", -1 * moonRad)
			.attr("width", 2 * moonRad)
			.attr("height", 2 * moonRad)
			.attr("xlink:href", moonface)
		
		// draw moon shade for phase based on sentiment analysis of poem
		poemG.append("path")
			.attr("d", (d) => DrawMoonShade(poemScale(parseFloat(d.poemscore)), 0, 0, moonRad))
			.classed("moonShade", true)
	
		// DrawMoonShade(poemG, data, 0, 0, moonRad)
		poemG
			.append("text")
			.text((d) => d.poemtitle)
			.attr("text-anchor", "middle")
			.attr("dy", "50px")
			.attr("fill", "whitesmoke")
	})
    
})


// --------Supporting functions for drawing moon phases-----------
function DrawMoonShade(Phase, CX, CY, R) {
	// full moon
	if(Phase == 1) { 
		return;
	};
	
	// new moon
	if(Math.abs(Phase) == 0) {
        poemG.append("circle")
            .classed("moonShade", true)
            .attr("cx", CX)
            .attr("cy", CY)
            .attr("r", R)
		return;
	};
	
	var d = "M" + CX + "," + (CY - R) +
		"A" + R + "," + R +
		" 0 1 " + ((Phase > 0) ? "0" : "1") +
		" " + CX + "," + (CY + R);
		
	if(Math.abs(Phase) == 0.5) {
		// half moon
		d += "Z";
	}
	else {
		var h = 2 * R * (
			((Phase > -0.5) && (Phase < 0.5) ? 1 - Math.abs(Phase) : Math.abs(Phase))
						- 0.5);
		var leg = Math.sqrt(R * R + h * h);
	
		var bigR = leg * leg / (2 * Math.sqrt(leg * leg - R * R));
	
		d += "A" + bigR + "," + bigR +
			" 0 0 " + 
			((Phase < -0.5) || ((Phase > 0) && (Phase < 0.5)) ? "0" : "1") +
			" " + CX + "," + (CY - R);
	};
    return d
	// poemG.append("path")
    //     .attr("d", d)
    //     .classed("moonShade", true);
};

var moonface = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAA" +
			   "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";