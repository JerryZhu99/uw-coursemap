import * as data from "data";
import * as plan from "plan";
import * as queryString from "query-string";

/**
 * @namespace
 * @property {string} all
 * @property {boolean} searching
 * @property {string} subjects
 * @property {boolean}  undergrad
 * @property {boolean} graduate
 */
var search = {
    all: "",
    subjects: "",
    number: "",
    undergrad: true,
    graduate: false,
    page: 0,
}

var itemsShown = 10;

var parsed = queryString.parse(location.hash);
if (typeof parsed.course !== 'undefined') {
    search.subjects = parsed.course.split(" ")[0];
    search.number = parsed.course.split(" ")[1];
    search.undergrad = true;
    search.graduate = true;
}
if (typeof parsed.all !== 'undefined') search.all = parsed.all;
if (typeof parsed.subjects !== 'undefined') search.subjects = parsed.subjects;
if (typeof parsed.number !== 'undefined') search.number = parsed.number;
if (typeof parsed.undergrad !== 'undefined') search.undergrad = parsed.undergrad == 'true';
if (typeof parsed.graduate !== 'undefined') search.graduate = parsed.graduate == 'true';
search.page = isNaN(parseInt(parsed.page)) ? 0 : parseInt(parsed.page);
console.log(search.page)

location.hash = queryString.stringify(search)

/**
 * Initializes the search with event handlers.
 */
export function init() {
    $("#search").val(search.all);
    $("#subjectsearch").val(search.subjects);
    $("#numbersearch").val(search.number);
    $("#undergradsearch").prop("checked", search.undergrad);
    $("#graduatesearch").prop("checked", search.graduate);
    $("#search").change(searchChanged);
    $("#subjectsearch").change(searchChanged);
    $("#numbersearch").change(searchChanged);
    $("#undergradsearch").change(searchChanged);
    $("#graduatesearch").change(searchChanged);
    $(".pagination").delegate("a", "click", function () {
        search.page = $(this).data("page");
        updateData(true);
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
    if (search.all && !search.all.split(",").some(
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

function searchChanged() {
    search.page = 0;
    updateData();
}

function updateData() {
    search.all = $("#search").val();
    search.subjects = $("#subjectsearch").val();
    search.number = $("#numbersearch").val();
    search.undergrad = $("#undergradsearch").is(":checked");
    search.graduate = $("#graduatesearch").is(":checked");
    location.hash = queryString.stringify(search);

    data.filter(getFilter);
    $("#results").empty();
    for (let e of data.courses.slice(search.page * itemsShown, (search.page + 1) * itemsShown)) {

        $("#results").append($("#course-template").html())
        let elem = $("#results").children().last();
        let courseCode = e.subject + " " + e.catalog_number;
        elem.children(".course-plan").change(function () {
            let term = elem.children(".course-plan").val();
            if (term) {
                plan.remove(courseCode);
                plan.add(term, courseCode)
            } else {
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
    if (search.page == 0) {
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
            <a href="javascript:void(0)" data-page="${0}" class="page-link">First</a>
        </li>
        `)
        pagination.append(`
        <li class="page-item">
            <a href="javascript:void(0)" data-page="${search.page - 1}" class="page-link">Previous</a>
        </li>
        `)
    }
    let min = Math.max(0, search.page - 2);
    let max = Math.min(length, search.page + 3);
    for (let i = min; i < max; i++) {
        pagination.append(`
        <li class="page-item ${i == search.page ? "active" : ""}">
            <a href="javascript:void(0)" data-page="${i}" class="page-link">${i+1}</a>
        </li>
        `)

    }
    if (search.page == length - 1) {
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
            <a href="javascript:void(0)" data-page="${search.page + 1}" class="page-link">Next</a>
        </li>
        `)

        pagination.append(`
        <li class="page-item">
            <a href="javascript:void(0)" data-page="${length - 1}" class="page-link">Last</a>
        </li>
        `)

    }
}