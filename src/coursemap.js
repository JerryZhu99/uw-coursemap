import "d3-force";
import * as d3 from "d3";
import * as simulation from "simulation" 
import * as search from "search";

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

var link;
var node;

function subjectColors(subject) {
    if (coloursUsed[subject]) return coloursUsed[subject];
    let faculty = simulation.subjects.find((x) => (x.subject == subject));
    if (!facultyIndices[faculty]) facultyIndices[faculty] = 0;
    let index = facultyIndices[faculty];
    let color = faculty ? facultyMap[faculty.group][index % 2] : "#E4B429";
    coloursUsed[subject] = color;
    facultyIndices[faculty]++;
    return color;
}

export function init() {
    let courses = simulation.courses;
    let courseLinks = simulation.courseLinks;
    let zoom = d3.zoom().on("zoom", function () {
        map.attr("transform", d3.event.transform)
    });
    let svg = d3.select("#map")
        .attr("width", "100%")
        .attr("height", "100%")
        .call(zoom);  
    svg.append("defs")
    .append("marker")
        .attr("id", "marker")
        .attr("refX", ARROW_LENGTH)
        .attr("refY", ARROW_WIDTH/2)
        .attr("markerWidth", ARROW_LENGTH)
        .attr("markerHeight", ARROW_WIDTH)
        .attr("orient", "auto")
    .append("path")
        .attr("d", `M0,0 L0,${ARROW_WIDTH} L${ARROW_LENGTH},${ARROW_WIDTH/2} z`);
    let map = svg.append("g");
    let width = +map.attr("width");
    let height = +map.attr("height");
    link = map.append("g").selectAll(".link")
        .data(courseLinks)
        .enter().append("line").attr("marker-end", "url(#marker)")
    console.log(link);

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
        .attr("dy", "-.25rem")
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
export function update(highlightFilter) {
    let courses = simulation.courses;
    let courseLinks = simulation.courseLinks;
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
        .attr("dy", "-.25rem")
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

    node.attr("opacity", d=>(highlightFilter(d)?1:0.25))
    link.attr("opacity", d=>((highlightFilter(d.course)||highlightFilter(d.prereq))?1:0.25))    
}
export function ticked() {
    link.attr("x1", function (d) {
            let dist = Math.hypot(d.course.x - d.prereq.x, d.course.y - d.prereq.y);
            let dx = (d.course.x - d.prereq.x) / dist;
            return d.prereq.x + dx * (RADIUS + BORDER_WIDTH);
        })
        .attr("y1", function (d) {
            let dist = Math.hypot(d.course.x - d.prereq.x, d.course.y - d.prereq.y);
            let dy = (d.course.y - d.prereq.y) / dist;
            return d.prereq.y + dy * (RADIUS + BORDER_WIDTH);
        })
        .attr("x2", function (d) {
            let dist = Math.hypot(d.course.x - d.prereq.x, d.course.y - d.prereq.y);
            let dx = (d.course.x - d.prereq.x) / dist;
            return d.course.x - dx * (RADIUS + BORDER_WIDTH);
        })
        .attr("y2", function (d) {
            let dist = Math.hypot(d.course.x - d.prereq.x, d.course.y - d.prereq.y);
            let dy = (d.course.y - d.prereq.y) / dist;
            return d.course.y - dy * (RADIUS + BORDER_WIDTH);
        });
    node.attr("transform", (d) => (`translate(${d.x},${d.y})`))
}