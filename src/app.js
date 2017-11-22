import "d3-force";
import * as d3 from "d3";
import "normalize.css";
import "bootstrap";
import "styles.scss";
import $ from "jquery";

import * as Search from "search";
import * as CourseMap from "coursemap";
import * as Simulation from "simulation";

Simulation.getData().then(ready, console.error)

function ready() {
    Simulation.init($("#map").width(),$("#map").height());
    CourseMap.init();
    Search.init();
}


