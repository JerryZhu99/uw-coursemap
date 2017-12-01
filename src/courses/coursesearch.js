import * as data from "data";

import * as plan from "utils/plan";

/**
 * @namespace
 * @property {string} general
 * @property {boolean} searching
 * @property {string} subjects
 * @property {boolean}  undergrad
 * @property {boolean} graduate
 */
var search = {
    general: "",
    subjects: "",
    number: "",
    undergrad: true,
    graduate: false,
}

var page = 0;
var itemsShown = 10;

/**
 * Initializes the search with event handlers.
 */
export function init() {
    $("#search").change(updateData);
    $("#subjectsearch").change(updateData);
    $("#numbersearch").change(updateData);
    $("#undergradsearch").change(updateData);
    $("#graduatesearch").change(updateData);
    $(".pagination").delegate("a", "click", function(){
        page = $(this).data("page");
        updateData();
    })
    updateData();
}

/**
 * Returns whether the course is included in the selection.
 * @param {Object} e The course to test.
 * @returns {boolean} whether the course is found in the selection.
 */
export function getFilter(e) {
    if (search.subjects && !search.subjects.split(",").some((x) => (x.trim().toUpperCase() == e.subject))) {
        return false;
    }
    if (search.number && !search.number.split(",").some((x) => (x.trim().toUpperCase() == e.catalog_number))) {
        return false;
    }
    if (!search.undergrad && e.academic_level == "undergraduate") {
        return false;
    }
    if (!search.graduate && e.academic_level == "graduate") {
        return false;
    }
    if (search.general && !search.general.split(",").some(
            s => ([
                e.subject + " " + e.catalog_number,
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

function updateData() {
    search.general = $("#search").val();
    search.subjects = $("#subjectsearch").val();
    search.number = $("#numbersearch").val();
    search.undergrad = $("#undergradsearch").is(":checked");
    search.graduate = $("#graduatesearch").is(":checked");

    data.filter(getFilter);
    $("#results").empty();
    for (let e of data.courses.slice(page * itemsShown, (page + 1) * itemsShown)) {

        $("#results").append($("#course-template").html())
        let elem = $("#results").children().last();
        let courseCode = e.subject+" "+e.catalog_number;
        elem.children(".course-plan").change(function(){
            let term = elem.children(".course-plan").val();
            if(term){
                plan.remove(courseCode);
                plan.add(term, courseCode)
            }else{
                plan.remove(courseCode);
            }
        })
        elem.children(".course-plan").val(plan.get(courseCode))
        elem.children(".course-name").text(e.title ? e.title : e.description);
        elem.children(".course-code").text(`${e.subject} ${e.catalog_number}${e.crosslistings?" | "+e.crosslistings:""}`);
        elem.children(".course-description").text(e.description);
        elem.children(".course-prereqs").text(e.prerequisites ? `Prereqs: ${e.prerequisites}` : e.isSubject ? "" : "No prerequisites found.");
        elem.children(".course-coreqs").text(e.corequisites ? `Coreqs: ${e.corequisites}` : "");
        elem.children(".course-antireqs").text(e.antirequisites ? `Antireqs: ${e.antirequisites}` : "");
        elem.children(".course-dept-consent").text(e.needs_department_consent ? "Department consent required." : "");
        elem.children(".course-instr-consent").text(e.needs_instructor_consent ? "Instructor consent required." : "");

        e.url ? $(".course-link").show() : $(".course-link").hide();
        elem.children(".course-link").attr("href", e.url);
    }
    updatePagination();

}

function updatePagination() {
    let length = Math.ceil(data.courses.length / 10);
    let pagination = $(".pagination");
    pagination.empty()
    if (page == 0) {
        pagination.append(`
        <li class="page-item disabled">
            <span class="page-link">First</span>
        </li>
        `)
        pagination.append(`
        <li class="page-item disabled">
            <span class="page-link">Previous</span>
        </li>
        `)
    } else {
        pagination.append(`
        <li class="page-item">
            <a href="#${1}" data-page="${0}" class="page-link">First</a>
        </li>
        `)
        pagination.append(`
        <li class="page-item">
            <a href="#${page}" data-page="${page - 1}" class="page-link">Previous</a>
        </li>
        `)
    }
    let min = Math.max(0, page - 2);
    let max = Math.min(length, page + 3);
    for (let i = min; i < max; i++){
        pagination.append(`
        <li class="page-item ${i == page ? "active" : ""}">
            <a href="#${i+1}" data-page="${i}" class="page-link">${i+1}</a>
        </li>
        `)

    }
    if (page == length - 1) {
        pagination.append(`
        <li class="page-item disabled">
            <span class="page-link">Next</span>
        </li>
        `)
        pagination.append(`
        <li class="page-item disabled">
            <span class="page-link">Last</span>
        </li>
        `)
    } else {
        pagination.append(`
        <li class="page-item">
            <a href="#${page + 2}" data-page="${page + 1}" class="page-link">Next</a>
        </li>
        `)

        pagination.append(`
        <li class="page-item">
            <a href="#${length}" data-page="${length - 1}" class="page-link">Last</a>
        </li>
        `)

    }
}