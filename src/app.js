import "d3-force";
import * as d3 from "d3";
import "normalize.css";
import "bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import "styles.css";
import $ from "jquery";


var courseData;
var links = [];
getData().then(init, console.error).then(ready);

function getData() {
    let dataRequests = [];
    dataRequests.push($.getJSON("data/prereqs.json").done(function(data){
        links = data;
        console.log(links);
        console.log(`retrieved prereq data: (${links.length})`);
    }).fail(console.error));
    dataRequests.push($.getJSON("data/courses.json").done(function (data) {
        courseData = $.map(data, e => e);

        console.log(courseData);
        console.log(`retrieved course data: (${courseData.length})`);

    }).fail(console.error));
    return Promise.all(dataRequests);
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
    })

    for (let s of Object.values(subjects)) {
        courseData.push(s);
    }
    courseData.forEach(e => {
        e.x = 100 * Math.random(), e.y = 100 * Math.random();
        e.id = `${e.subject}${e.catalog_number}`;
    })
    links.forEach(function(e){
        e.source = e.prereq;
        e.prereq = courseData.find(x=>e.prereq==x.id)
        e.target = e.course;
        e.course = courseData.find(x=>e.course==x.id)
        if(!e.prereq){
            let n = {
                id: e.course,
                x: 0,
                y: 0,
                subject: "missing",
                catalog_number: "missing"
            };
            courseData.push(n);
            e.prereq = n;
        }
    })
}

function ready() {
    let courses = courseData.filter(e=>e.subject=="MATH");
    let courseLinks = links.filter(x=>x.prereq.subject=="MATH"&&x.course.subject=="MATH");
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
        .force("charge", d3.forceManyBody().strength(-50))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide(10))
    var link = map.selectAll("g.link")
        .data(courseLinks)
        .enter().append("line")
        .attr("stroke", "#AAAAAA")
        .attr("stroke-width", 2)
        .attr("x1", 12).attr("y1", 12).attr("x2", 12).attr("y2", 12)
        console.log(link);

    let node = map.selectAll("g.node")
        .data(courses)
        .enter().append("g")

    node.append("circle")
        .attr("class", "node")
        .attr("r", 6)
        .attr("fill", (d) => (d.catalog_number ? "#AAAAAA" : "#AAFFAA"))
    node.append("text")
        .attr("dy", "8pt")
        .attr("fill", "#AAAAAA")
        .text((d) => `${d.subject} ${d.catalog_number}`)
    simulation.nodes(courses)
        .on("tick", ticked);
    simulation.force("links", d3.forceLink(courseLinks));

    function ticked() {
        link.attr("x1", function (d) {
                return d.prereq.x;
            })
            .attr("y1", function (d) {
                return d.prereq.y;
            })
            .attr("x2", function (d) {
                return d.course.x;
            })
            .attr("y2", function (d) {
                return d.course.y;
            });
        node.attr("transform", (d) => (`translate(${d.x},${d.y})`))
    }
}
export default {
    courseData,
    map
};