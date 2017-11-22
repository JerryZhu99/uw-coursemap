import "d3-force";
import * as d3 from "d3";
import "normalize.css";
import "bootstrap";
import "styles.scss";
import $ from "jquery";

import * as search from "search";
import * as courseMap from "coursemap";
import * as simulation from "simulation";

simulation.getData().then(ready, console.error)

function ready() {
    simulation.init($("#map").width(),$("#map").height());
    courseMap.init();
    search.init();
}


