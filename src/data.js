import $ from "jquery"


export var courseData = [];
export var links = [];
export var subjects = [];

export var courses;
export var courseLinks;

export function filter(courseFilter) {
    courses = courseData.filter(courseFilter);
    courseLinks = links
        .filter((x) => courses.includes(x.prereq) && courses.includes(x.course))
}

export function getData() {
    let dataRequests = [];
    dataRequests.push($.getJSON("data/prereqs.json").done(function (data) {
        links = data;
        console.log(`retrieved prereq data: (${links.length})`);
    }).fail(console.error));
    dataRequests.push($.getJSON("data/details.json").done(function (data) {
        courseData = data;
        console.log(`retrieved course data: (${courseData.length})`);
    }).fail(console.error));
    dataRequests.push($.getJSON("data/subjects.json").done(function (data) {
        subjects = data;
        console.log(`retrieved subject data: (${subjects.length})`);
    }).fail(console.error));
    return Promise.all(dataRequests);
}