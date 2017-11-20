import "d3-force";
import * as d3 from "d3";
import "normalize.css";
import "bootstrap";
import "styles.scss";
import $ from "jquery";

const radius = 35;


var search = {
    all: [""],
    subjects: ["MATH"],
    undergrad: true,
    graduate: false,
}
var simulation;
var subjects = [];
var courseData = [];
var links = [];
var link;
var node;
getData().then(init, console.error).then(ready);

function getData() {
    let dataRequests = [];
    dataRequests.push($.getJSON("data/prereqs.json").done(function(data){
        links = data;
        console.log(`retrieved prereq data: (${links.length})`);
    }).fail(console.error));
    dataRequests.push($.getJSON("data/courses.json").done(function (data) {
        courseData = data;
        console.log(`retrieved course data: (${courseData.length})`);
    }).fail(console.error));
    dataRequests.push($.getJSON("data/subjects.json").done(function (data) {
        subjects = data;
        console.log(`retrieved subject data: (${subjects.length})`);
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
    let courseFilter = getFilter()
    let courses = courseData.filter(courseFilter);
    let courseLinks = links
    .filter((x)=>courses.includes(x.prereq)&&courses.includes(x.course))
    .filter((x)=>courses.some(y=>x.source==y.id)&&courses.some(y=>x.target==y.id));
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
        .attr("refX", 18)
        .attr("refY", 6)
        .attr("markerWidth", 20)
        .attr("markerHeight", 20)
        .attr("orient", "auto")
    .append("path")
        .attr("d", "M0,0 L0,12 L18,6 z");
    let map = svg
        .append("g");
    let width = +map.attr("width");
    let height = +map.attr("height");
    
    simulation = d3.forceSimulation(courses)
        .force("charge", d3.forceManyBody().strength(-3000))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("links", d3.forceLink(courseLinks).id(x=>x.id).distance(300))
        .on("tick", ticked);

    link = map.append("g").selectAll(".link")
        .data(courseLinks)
        .enter().append("line").attr("marker-end","url(#marker)")
        console.log(link);

    node = map.append("g").selectAll(".node")
        .data(courses)
        .enter().append("g")

    node.append("circle")
        .attr("class", "node")
        .attr("r", 35)
        .attr("style", d=>"fill:"+subjectColors(d.subject));        

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
   

    function ticked() {
        
        link.attr("x1", function (d) {
                return d.prereq.x;
            })
            .attr("y1", function (d) {
                return d.prereq.y;
            })
            .attr("x2", function (d) {
                let dist = Math.hypot(d.course.x-d.prereq.x,d.course.y-d.prereq.y);
                let dx = (d.course.x-d.prereq.x)/dist;
                return d.course.x-dx*radius;
            })
            .attr("y2", function (d) {
                let dist = Math.hypot(d.course.x-d.prereq.x,d.course.y-d.prereq.y);
                let dy = (d.course.y-d.prereq.y)/dist;
                return d.course.y-dy*radius;
            });
        node.attr("transform", (d) => (`translate(${d.x},${d.y})`))
    }
    $("#center-button").click(()=>{
        svg.transition(500).call(zoom.transform, d3.zoomIdentity)
    });    
    
    $("#search").change(searchGeneral);    
    $("#subjectsearch").change(searchSubject);
    $("#undergradsearch").change(searchUndergrad);
    $("#graduatesearch").change(searchGraduate);
    
}
var facultyMap = {
    "ART": ["#D93F00","#FBAF00"],
    "AHS": ["#005963","#00BED0"],
    "ENG": ["#57058B","#BE33DA"],
    "ENV": ["#607000","#BED500"],
    "MAT": ["#C60078","#FF63AA"],
    "SCI": ["#0033BE","#63A0FF"],
    "VPA": ["#80001F","#E41740"],
    "REN": ["#00693C","#DE3831"],
    "STJ": ["#C88A11","#C88A11"],
    "STP": ["#879637","#584528"],
    "CGC": ["#C4262E","#C4262E"],
}
var coloursUsed = {};
var facultyIndices = {};
function subjectColors(subject){
    if(coloursUsed[subject])return coloursUsed[subject];
    let faculty = subjects.find((x)=>(x.subject == subject));
    if(!facultyIndices[faculty])facultyIndices[faculty]=0;
    let index = facultyIndices[faculty];
    let color = faculty?facultyMap[faculty.group][index%2]:"#E4B429";
    coloursUsed[subject] = color;
    facultyIndices[faculty]++;
    return color;
}

function getFilter(){
    return function(e){
        if(e.catalog_number&&
            !search.all.every(y=>Object.values(e).some((x)=>(String(x).includes(y.trim()))))){
            return false;
        }
        if(!search.subjects.some((x)=>(x.trim().toUpperCase()==e.subject))){
            return false;
        }
        if(!search.undergrad && parseInt(e.catalog_number)<500){
            return false;
        }
        if(!search.graduate && parseInt(e.catalog_number)>=500){
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
    let enter = node.enter().append("g")
    enter.append("circle")
    .attr("class", "node")
    .attr("r", 35)
    .attr("style", d=>"fill:"+subjectColors(d.subject));
    let text = enter.append("text")
        .attr("text-anchor","middle")
    text.append("tspan")
        .attr("x", 0)
        .attr("dy", "-.25rem")            
        .text((d) => `${d.subject}`);
    text.append("tspan")
        .attr("x", 0)
        .attr("dy", "1.25rem")            
        .text((d) => `${d.catalog_number}`)
    node = node.merge(enter);
    link = link.data(courseLinks, function(d) { return d.source + "-" + d.target; });
    link.exit().remove();
    link = link.enter().append("line").attr("marker-end","url(#marker)").merge(link);    

    simulation.nodes(courses);
    simulation.force("charge").initialize(courses);
    simulation.force("center").initialize(courses);
    simulation.force("links").links(courseLinks).initialize(courses);
    simulation.alpha(1).restart();
}
function searchGeneral(){
    search.all = $("#search").val().split(" ");
    updateData();
}
function searchSubject(){
    search.subjects = $("#subjectsearch").val().split(",");
    updateData();
}
function searchUndergrad(){
    search.undergrad = $("#undergradsearch").is(":checked");
    updateData();
}
function searchGraduate(){
    search.graduate = $("#graduatesearch").is(":checked");
    updateData();    
}
$(document).ready(function(){
});
export default {
    courseData,
    map
};