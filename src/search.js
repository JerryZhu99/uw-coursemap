import $ from "jquery";
import * as simulation from "simulation";
import * as courseMap from "coursemap";

var search = {
    general: [""],
    get searching() {
        return !(search.general.length == 1 && search.general[0] == "");
    },
    subjects: ["MATH"],
    undergrad: true,
    graduate: false,
}

export function init() {
    $("#search").change(searchGeneral);
    $("#subjectsearch").change(searchSubject);
    $("#undergradsearch").change(searchUndergrad);
    $("#graduatesearch").change(searchGraduate);
}

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
export function getHighlight(e) {
    if (!search.searching) {
        return true;
    }
    if (!search.general.every(
            s => ([
                e.subject,
                e.catalog_number,
                e.title,
                e.description
            ].some(v => String(v).toUpperCase().includes(s.trim().toUpperCase())))
        )) {
        return false;
    }
    return true;
}

function searchGeneral() {
    search.general = $("#search").val().split(" ");
    updateData();
}

function searchSubject() {
    search.subjects = $("#subjectsearch").val().split(",");
    updateData();
}

function searchUndergrad() {
    search.undergrad = $("#undergradsearch").is(":checked");
    updateData();
}

function searchGraduate() {
    search.graduate = $("#graduatesearch").is(":checked");
    updateData();
}

function updateData() {
    simulation.updateData(getFilter);
    courseMap.update(getHighlight);
    $("#search-results").empty();
    if (search.searching) {
        let searchResults = simulation.courses.filter(getHighlight);
        $.each(searchResults.slice(0, 3), (i, e) => {
            console.log(e.subject)
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
                    console.log(e.subject)
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