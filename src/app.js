import "d3-force";
import * as d3 from "d3";
import "normalize.css";
import "bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import "styles.css";
import $ from "jquery";


var courseData;
var links = [];
getData();

function getData() {
    $.getJSON("data/courses.json").done(function (data) {
        courseData = $.map(data, e => e);

        console.log(courseData);
        console.log(`retrieved course data: (${courseData.length})`);
        init();
        ready();
    }).fail(console.error);
}

function init() {
    let subjects = {};
    courseData.forEach(function (e) {
        if (!subjects[e.subject]) {
            subjects[e.subject] = {
                id: e.subject,
                x: 0,
                y: 0,
                subject: e.subject,
                catalog_number: ""
            }
        }
        links.push({
            source: subjects[e.subject],
            target: e
        });
    })
    for (let s of Object.values(subjects)) {
        courseData.push(s);
    }
    courseData.forEach(e => {
        e.x = 10000 * Math.random(), e.y = 10000 * Math.random();
        e.id = `${e.subject}:${e.catalog_number}`;
    })
}

function ready() {
    let map = d3.select("#map")
        .attr("width", "100%")
        .attr("height", "100%")
        .call(d3.zoom().on("zoom", function () {
            map.attr("transform", d3.event.transform)
        }))
        .append("g")
    let width = +map.attr("width");
    let height = +map.attr("height");

    let simulation = d3.forceSimulation()
        .force("charge", d3.forceManyBody().strength(-20))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("links", d3.forceLink(links)
            .strength(1)
            .id(function (d) {
                return d.id;
            }))
        .force("collision", d3.forceCollide(40))
    let link = map.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("stroke-width", 3);

    let node = map.selectAll("g.node")
        .data(courseData)
        .enter().append("g")

    node.append("circle")
        .attr("class", "node")
        .attr("r", 2)
        .attr("fill", (d) => (d.catalog_number ? "#AAAAAA" : "#AAFFAA"))
    node.append("text")
        .attr("dy", "8pt")
        .attr("fill", "#AAAAAA")
        .text((d) => `${d.subject} ${d.catalog_number}`)
    simulation.nodes(courseData)
        .on("tick", ticked);
    simulation.force("links")
        .links(links);

    function ticked() {
        link.attr("x1", function (d) {
                return d.source.x;
            })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });
        node.attr("transform", (d) => (`translate(${d.x},${d.y})`))
    }
}
export default {
    courseData,
    map
};