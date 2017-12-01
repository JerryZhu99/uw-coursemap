/**
 * @type {String[]}
 */
export var terms = [
    "Other",
    "1A",
    "1B",
    "2A",
    "2B",
    "3A",
    "3B",
    "4A",
    "4B",
]

if (!localStorage.coursePlan) localStorage.coursePlan = "{}";

/**
 * @type {Object.<string, string[]>}
 */
export var plan = JSON.parse(localStorage.coursePlan);

function savePlan() {
    localStorage.coursePlan = JSON.stringify(plan);
}

/**
 * 
 * @param {String} term 
 * @param {String} courseCode 
 */
export function add(term, courseCode) {
    if (!plan[term]) {
        plan[term] = [courseCode];
    } else {
        plan[term].push(courseCode)
        plan[term].sort();
    }
    savePlan();
}

/**
 * 
 * @param {String} courseCode 
 */
export function remove(courseCode) {
    for (let term of terms) {
        if (!plan[term]) {
            plan[term] = [];
        } else {
            let index = plan[term].indexOf(courseCode);
            if (index > -1) plan[term].splice(index, 1);
        }
    }
    savePlan();
}

/**
 * 
 * @param {String} courseCode 
 */
export function get(courseCode) {
    for (let term of terms) {
        if (!plan[term]) {
            plan[term] = [];
        } else {
            if (plan[term].includes(courseCode)) return term;
        }
    }
    return "";
}