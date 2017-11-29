import $ from "jquery";
import * as simulation from "map/simulation";
import * as data from "data";
import * as courseMap from "map/coursemap";

/**
 * @namespace
 * @property {string[]} general
 * @property {boolean} searching
 * @property {string[]} subjects
 * @property {boolean}  undergrad
 * @property {boolean} graduate
 */
var search = {
    general: [""],
    get searching() {
        return !(search.general.length == 1 && search.general[0] == "");
    },
    subjects: ["MATH"],
    undergrad: true,
    graduate: false,
}

/**
 * Initializes the search with event handlers.
 */
export function init() {
    $("#search").change(searchGeneral);
    $("#subjectsearch").change(searchSubject);
    $("#undergradsearch").change(searchUndergrad);
    $("#graduatesearch").change(searchGraduate);
}

/**
 * Returns whether the course is included in the selection.
 * @param {Object} e The course to test.
 * @returns {boolean} whether the course is found in the selection.
 */
export function getFilter(e) {
    if (!search.subjects.some((x) => (x.trim().toUpperCase() == e.subject))) {
        return false;
    }
    if (!search.undergrad && e.academic_level == "undergraduate") {
        return false;
    }
    if (!search.graduate && e.academic_level == "graduate") {
        return false;
    }
    return true;
}

/**
 * Returns whether the course is highlighted.
 * @param {Object} e The course to test.
 * @returns {boolean} Whether the course is highlighted.
 */
export function getHighlight(e) {
    if (!search.searching) {
        return true;
    }
    if (!search.general.every(
            s => ([
                e.subject,
                e.catalog_number,
                e.title,
                e.description,
                e.prerequisites,
                e.corequisites,
                e.antirequisites,
            ].some(v => String(v).toUpperCase().includes(s.trim().toUpperCase())))
        )) {
        return false;
    }
    return true;
}

/**
 * Updates the data with the general search input.
 */
function searchGeneral() {
    search.general = $("#search").val().split(" ");
    updateData();
}

/**
 * Updates the data with the subject search input.
 */
function searchSubject() {
    search.subjects = $("#subjectsearch").val().split(",");
    updateData();
}

/**
 * Updates the data with the undergrad search toggle.
 */
function searchUndergrad() {
    search.undergrad = $("#undergradsearch").is(":checked");
    updateData();
}

/**
 * Updates the data with the graduate search toggle.
 */
function searchGraduate() {
    search.graduate = $("#graduatesearch").is(":checked");
    updateData();
}

/**
 * Updates data on map and simulation, and shows search results.
 */
function updateData() {
    data.filter(getFilter)
    simulation.updateData(getFilter);
    courseMap.update(getHighlight);
    $("#search-results").empty();
    if (search.searching) {
        let searchResults = data.courses.filter(getHighlight);
        $.each(searchResults.slice(0, 3), (i, e) => {
            $("#search-results")
                .append(`<a href="#" class="list-group-item">${e.subject} ${e.catalog_number}</a>`);
            $("#search-results>a").last().click(function () {
                courseMap.zoomTo(e);
                showDetails(e)
            });
        });
        if (searchResults.length > 3) {
            $("#search-results")
                .append(`<a href="#" class="list-group-item">+ ${searchResults.length - 3} more</a>`);
            $("#search-results>a").last().click(function () {
                $("#search-results>a").last().remove()
                $.each(searchResults.slice(3), (i, e) => {
                    $("#search-results")
                        .append(`<a href="#" class="list-group-item">${e.subject} ${e.catalog_number}</a>`);
                    $("#search-results>a").last().click(function () {
                        courseMap.zoomTo(e);
                        showDetails(e)
                    });
                });
            });
        }
    }
}

/**
 * Shows detilas on the given course.
 * @param {Object} e The course to show details of.
 */
export function showDetails(e) {
    $(".panel").hide();
    $("#details-panel").show();
    $(".course-name").text(e.title ? e.title : e.description);
    $(".course-code").text(`${e.subject} ${e.catalog_number}${e.crosslistings?" | "+e.crosslistings:""}`);
    $(".course-description").text(e.description);
    $(".course-prereqs").text(e.prerequisites ? `Prereqs: ${e.prerequisites}` : e.isSubject ? "" : "No prerequisites found.");
    $(".course-coreqs").text(e.corequisites ? `Coreqs: ${e.corequisites}` : "");
    $(".course-antireqs").text(e.antirequisites ? `Antireqs: ${e.antirequisites}` : "");
    $(".course-dept-consent").text(e.needs_department_consent ? "Department consent required." : "");
    $(".course-instr-consent").text(e.needs_instructor_consent ? "Instructor consent required." : "");

    e.url ? $(".course-link").show() : $(".course-link").hide();
    $(".course-link").attr("href", e.url);

}