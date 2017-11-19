import "d3-force";
import * as d3 from "d3";
import "normalize.css";
import "bootstrap";
import "styles.scss";
import $ from "jquery";

var search = {
    subjects: [],
    undergrad: true,
    graduate: false,
}
var simulation;
var courseData = [];
var links = [];
var link;
var node;
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
    })
}

function ready() {
    let courseFilter = (e=>(e.subject=="MATH"||e.subject=="PHYS")&&e.catalog_number<500)
    let courses = courseData.filter(courseFilter);
    let courseLinks = links
    .filter((x)=>courseData.includes(x.prereq)&&courseData.includes(x.course))
    .filter((x)=>courseData.some(y=>x.source==y.id)&&courseData.some(y=>x.target==y.id))
    .filter(x=>courseFilter(x.prereq)&&courseFilter(x.course));
    let map = d3.select("#map")
        .attr("width", "100%")
        .attr("height", "100%")
        .call(d3.zoom().on("zoom", function () {
            map.attr("transform", d3.event.transform)
        }))
        .append("g")
    let width = +map.attr("width");
    let height = +map.attr("height");
    
    simulation = d3.forceSimulation()
        .force("charge", d3.forceManyBody().strength(-3000))
        .force("center", d3.forceCenter(width / 2, height / 2))
    
    

    link = map.append("g").selectAll(".link")
        .data(courseLinks)
        .enter().append("line")
        console.log(link);

    node = map.append("g").selectAll(".node")
        .data(courses)
        .enter().append("g")

    node.append("circle")
        .attr("class", "node")
        .attr("r", 35)

    let text = node.append("text")
        .attr("text-anchor","middle")
    text.append("tspan")
        .attr("x", 0)
        .attr("dy", "-.25rem")            
        .text((d) => `${d.subject}`);
    text.append("tspan")
        .attr("x", 0)
        .attr("dy", "1.25rem")            
        .text((d) => `${d.catalog_number}`)
    simulation.nodes(courses)
        .on("tick", ticked);
    simulation.force("links", d3.forceLink(courseLinks).id(x=>x.id).distance(300));

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
    $("#subjectsearch").change(searchSubject);
    
}

function getFilter(){
    return function(e){
        if(search.subjects.length>0&&!search.subjects.some((x)=>(x.trim().toUpperCase()==e.subject))){
            return false;
        }
        if(!search.undergrad & e.catalog_number<500){
            return false;
        }
        if(!search.graduate & e.catalog_number>=500){
            return false;
        }
        return true;
    }
}

function updateData(){
    let courseFilter = getFilter();
    let courses = courseData.filter(courseFilter);
    let courseLinks = links
    .filter((x)=>courses.includes(x.prereq)&&courses.includes(x.course))


    node = node.data(courses, function(d) { return d.id;});
    node.exit().remove();
    node = node.enter().append("g").attr("class", "node").attr("r", 35).merge(node);
    node.append("circle")
    .attr("class", "node")
    .attr("r", 35)
    let text = node.append("text")
        .attr("text-anchor","middle")
    text.append("tspan")
        .attr("x", 0)
        .attr("dy", "-.25rem")            
        .text((d) => `${d.subject}`);
    text.append("tspan")
        .attr("x", 0)
        .attr("dy", "1.25rem")            
        .text((d) => `${d.catalog_number}`)

    link = link.data(courseLinks, function(d) { return d.source + "-" + d.target; });
    link.exit().remove();
    link = link.enter().append("line").merge(link);    

    simulation.nodes(courses);
    simulation.force("charge").initialize(courses);
    simulation.force("center").initialize(courses);
    simulation.force("links").links(courseLinks).initialize(courses);
    simulation.alpha(1).restart();
}

function searchSubject(){
    search.subjects = $("#subjectsearch").val().split(",");
    updateData();
}
$(document).ready(function(){
});
export default {
    courseData,
    map
};