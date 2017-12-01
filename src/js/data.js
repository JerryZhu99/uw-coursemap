import $ from "jquery"

/**
 * @typedef {Object} Course
 * @property {string} subject
 * @property {?string} catalog_number
 * @property {?string} title
 * @property {?string} prerequisites
 * @property {?string[]} prerequisites_parsed
 * @property {string} course_id
 * @property {number} units
 * @property {?string} description
 * @property {?string} antirequisites
 * @property {?string} corequisites
 * @property {boolean} needs_department_consent
 * @property {boolean} needs_instructor_consent
 * @property {string} url
 * @property {string} academic_level
 */

/**
 * All courses from data.
 * @type {Course[]}
 */
export var courseData = [];
/**
 * All prereq links from data.
 * @type {{source: string, target: string, course: Course, prereq: Course}}
 */
export var links = [];
export var subjects = [];

/**
 * Currently filtered courses.
 * @type {Course[]}
 */
export var courses;

/**
 * Currently filtered prereq links.
 * @type {{source: string, target: string, course: Course, prereq: Course}}
 */
export var courseLinks;

/**
 * Filters the courses and links by the given filter.
 * @param {function} courseFilter - the filter to apply.
 */
export function filter(courseFilter) {
    if(courseData) courses = courseData.filter(courseFilter);
    if(links) courseLinks = links
        .filter((x) => courses.some(e=>e.id == x.prereq) && courses.some(e=>e.id == x.course))
}
/**
 * Requests the prereqs, details, and subjects.
 * @returns {Promise} Promise object represeting prereqs, course, and subject data.
 */
export function getData(...dataTypes) {
    let dataRequests = [];
    if(dataTypes.includes("prereqs")) dataRequests.push($.getJSON("/uw-coursemap/data/prereqs.json").done(function (data) {
        links = data;
        console.log(`retrieved prereq data: (${links.length})`);
    }).fail(console.error));
    if(dataTypes.includes("courses")) dataRequests.push($.getJSON("/uw-coursemap/data/details.json").done(function (data) {
        courseData = data;
        console.log(`retrieved course data: (${courseData.length})`);
    }).fail(console.error));
    if(dataTypes.includes("subjects")) dataRequests.push($.getJSON("/uw-coursemap/data/subjects.json").done(function (data) {
        subjects = data;
        console.log(`retrieved subject data: (${subjects.length})`);
    }).fail(console.error));
    return Promise.all(dataRequests);
}