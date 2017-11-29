import "d3-force";
import * as d3 from "d3";

import * as search from "search";
import * as data from "data";

/**
 * @type {d3.Simulation.<d3.SimulationNodeDatum, undefined>}
 */
export var simulation;

/**
 * Initializes the simulation centered in the given width and height.
 * @param {number} width 
 * @param {number} height 
 */
export function init(width, height) {
    for (let e of data.subjects) {
        e.catalog_number = "";
        e.isSubject = true;
        data.courseData.push(e);
    }
    data.courseData.forEach(e => {
        e.x = 100 * Math.random(), e.y = 100 * Math.random();
        e.id = `${e.subject}${e.catalog_number}`;
    })
    data.links.forEach(function (e) {
        e.source = e.prereq;
        e.prereq = data.courseData.find(x => e.prereq == x.id)
        e.target = e.course;
        e.course = data.courseData.find(x => e.course == x.id)
    })
    data.filter(search.getFilter);

    simulation = d3.forceSimulation(data.courses)
        .force("charge", d3.forceManyBody().strength(-3000))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("links", d3.forceLink(data.courseLinks).id(x => x.id).distance(300))
}

/**
 * Updates the simulation with new data.
 */
export function updateData() {
    simulation.nodes(data.courses);
    simulation.force("charge").initialize(data.courses);
    simulation.force("center").initialize(data.courses);
    simulation.force("links").links(data.courseLinks).initialize(data.courses);
    simulation.alpha(1).restart();
}