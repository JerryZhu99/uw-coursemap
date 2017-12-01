import "d3-force";
import * as d3 from "d3";

import * as data from "data";
import * as simulation from "map/simulation"
import * as search from "map/mapsearch";

const RADIUS = 35;
const BORDER_WIDTH = 0.5;
const ARROW_WIDTH = 12;
const ARROW_LENGTH = 18;

var facultyMap = {
    "ART": ["#D93F00", "#FBAF00"],
    "AHS": ["#005963", "#00BED0"],
    "ENG": ["#57058B", "#BE33DA"],
    "ENV": ["#607000", "#BED500"],
    "MAT": ["#C60078", "#FF63AA"],
    "SCI": ["#0033BE", "#63A0FF"],
    "VPA": ["#80001F", "#E41740"],
    "REN": ["#00693C", "#DE3831"],
    "STJ": ["#C88A11", "#C88A11"],
    "STP": ["#879637", "#584528"],
    "CGC": ["#C4262E", "#C4262E"],
}
var coloursUsed = {};
var facultyIndices = {};

var svg, map;
var zoom;
var link;
var node;

/**
 * Returns the colour of the subject at UW.
 * @param {string} subject
 * @returns {string} The colour of the subject.
 */
function subjectColors(subject) {
    if (coloursUsed[subject]) return coloursUsed[subject];
    let faculty = data.subjects.find((x) => (x.subject == subject));
    if (!facultyIndices[faculty]) facultyIndices[faculty] = 0;
    let index = facultyIndices[faculty];
    let color = "#E4B429";
    if(faculty && facultyMap[faculty.group]) color = facultyMap[faculty.group][index % 2];
    coloursUsed[subject] = color;
    facultyIndices[faculty]++;
    return color;
}

/**
 * Initializes the course map.
 */
export function init() {
    let courses = data.courses;
    let courseLinks = data.courseLinks;
    zoom = d3.zoom().on("zoom", function () {
        map.attr("transform", d3.event.transform)
    });
    svg = d3.select("#map")
        .attr("width", "100%")
        .attr("height", "100%")
        .call(zoom);
    svg.append("defs")
        .append("marker")
        .attr("id", "marker")
        .attr("refX", ARROW_LENGTH)
        .attr("refY", ARROW_WIDTH / 2)
        .attr("markerWidth", ARROW_LENGTH)
        .attr("markerHeight", ARROW_WIDTH)
        .attr("orient", "auto")
        .append("path")
        .attr("d", `M0,0 L0,${ARROW_WIDTH} L${ARROW_LENGTH},${ARROW_WIDTH/2} z`);
    map = svg.append("g");
    let width = +map.attr("width");
    let height = +map.attr("height");
    link = map.append("g").selectAll(".link")
        .data(courseLinks)
        .enter().append("line").attr("marker-end", "url(#marker)")

    node = map.append("g").selectAll(".node")
        .data(courses)
        .enter().append("g")

    node.on("click", search.showDetails)

    node.append("circle")
        .attr("class", "node")
        .attr("r", 35)
        .attr("style", d => "fill:" + subjectColors(d.subject));

    let text = node.append("text")
        .attr("text-anchor", "middle")
    text.append("tspan")
        .attr("x", 0)
        .attr("dy", d => (!d.isSubject ? "-.25rem" : "0.25rem"))
        .text((d) => `${d.subject}`);
    text.append("tspan")
        .attr("x", 0)
        .attr("dy", "1.25rem")
        .text((d) => `${d.catalog_number}`)

    simulation.simulation.on("tick", ticked);

    $("#center-button").click(() => {
        svg.transition(500).call(zoom.transform, d3.zoomIdentity)
    });

}
/**
 * Updates the map, highlighting based on the given filter.
 * @param {function} highlightFilter 
 */
export function update(highlightFilter) {
    let courses = data.courses;
    let courseLinks = data.courseLinks;
    node = node.data(courses, function (d) {
        return d.id;
    });
    node.exit().remove();
    let enter = node.enter().append("g")
    enter.on("click", search.showDetails)

    enter.append("circle")
        .attr("class", "node")
        .attr("r", 35)
        .attr("style", d => "fill:" + subjectColors(d.subject));
    let text = enter.append("text")
        .attr("text-anchor", "middle")
    text.append("tspan")
        .attr("x", 0)
        .attr("dy", d => (!d.isSubject ? "-.25rem" : "0.25rem"))
        .text((d) => `${d.subject}`);
    text.append("tspan")
        .attr("x", 0)
        .attr("dy", "1.25rem")
        .text((d) => `${d.catalog_number}`)
    node = node.merge(enter);
    link = link.data(courseLinks, function (d) {
        return d.source + "-" + d.target;
    });
    link.exit().remove();
    link = link.enter().append("line").attr("marker-end", "url(#marker)").merge(link);

    node.attr("opacity", d => (highlightFilter(d) ? 1 : 0.25))
    link.attr("opacity", d => ((highlightFilter(d.source) || highlightFilter(d.target)) ? 1 : 0.25))
}

/**
 * Updates the map with new locations of elements.
 */
export function ticked() {
    link.attr("x1", function (d) {
            let dist = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
            let dx = (d.target.x - d.source.x) / dist;
            return d.source.x + dx * (RADIUS + BORDER_WIDTH);
        })
        .attr("y1", function (d) {
            let dist = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
            let dy = (d.target.y - d.source.y) / dist;
            return d.source.y + dy * (RADIUS + BORDER_WIDTH);
        })
        .attr("x2", function (d) {
            let dist = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
            let dx = (d.target.x - d.source.x) / dist;
            return d.target.x - dx * (RADIUS + BORDER_WIDTH);
        })
        .attr("y2", function (d) {
            let dist = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
            let dy = (d.target.y - d.source.y) / dist;
            return d.target.y - dy * (RADIUS + BORDER_WIDTH);
        });
    node.attr("transform", (d) => (`translate(${d.x},${d.y})`))
}

/**
 * Zooms the map to the given course
 * @param {Object} node - The course to zoom to.
 */
export function zoomTo(node) {
    let offset = 500;
    svg.transition(500).call(zoom.transform, d3.zoomIdentity.translate(offset - node.x, offset - node.y));

}