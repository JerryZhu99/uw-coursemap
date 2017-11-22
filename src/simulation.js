import "d3-force";
import * as d3 from "d3";
import * as search from "search";


export var courses;
export var courseLinks; 
export var subjects = [];

export var simulation;

var courseData = [];
var links = [];

export function getData() {
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


export function init(width, height) {
    for(let e of subjects){
        e.catalog_number = "";
        courseData.push(e);
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

    let courseFilter = search.getFilter;
    courses = courseData.filter(courseFilter);
    courseLinks = links
    .filter((x)=>courses.includes(x.prereq)&&courses.includes(x.course))
    .filter((x)=>courses.some(y=>x.source==y.id)&&courses.some(y=>x.target==y.id));

    simulation = d3.forceSimulation(courses)
    .force("charge", d3.forceManyBody().strength(-3000))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("links", d3.forceLink(courseLinks).id(x=>x.id).distance(300))
}

export function updateData(filter){
    courses = courseData.filter(filter);
    courseLinks = links
    .filter((x)=>courses.includes(x.prereq)&&courses.includes(x.course))
    simulation.nodes(courses);
    simulation.force("charge").initialize(courses);
    simulation.force("center").initialize(courses);
    simulation.force("links").links(courseLinks).initialize(courses);
    simulation.alpha(1).restart();   
}