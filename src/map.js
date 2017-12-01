import "d3-force";
import * as d3 from "d3";
import $ from "jquery";

import * as data from "data";
import * as search from "map/mapsearch";
import * as courseMap from "map/coursemap";
import * as simulation from "map/simulation";

$(document).ready(function () {
    $("#main-panel").show();
    $(".panel-back").click(function () {
        $(".panel").hide();
        $("#main-panel").show();
    });
    let isResizing = false,
        lastDownX = 0;
    let container = $('body'),
        right = $('#options'),
        handle = $('#resize');

    handle.on('mousedown touchstart', function (e) {
        isResizing = true;
        let x = e.type == "touchstart" ? e.targetTouches.item(0).clientX : e.clientX;
        lastDownX = x;
    });

    $(document).on('mousemove touchmove', function (e) {
        if (!isResizing)
            return;
        let x = e.type == "touchmove" ? e.targetTouches.item(0).clientX : e.clientX;
        let offsetRight = container.width() - (x - container.offset().left);

        right.css('width', offsetRight);
    }).on('mouseup touchend', function (e) {
        isResizing = false;
    });
    //https://stackoverflow.com/a/26233793
});

data.getData("prereqs", "courses", "subjects").then(ready, console.error)

function ready() {
    simulation.init($("#map").width(), $("#map").height());
    courseMap.init($("#map").width(), $("#map").height());
    search.init();
}