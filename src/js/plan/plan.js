import $ from "jquery";

import * as plan from "plan";

$(document).ready(function () {
    console.log(plan)
    let rows = Math.max(...Object.values(plan.plan).map(e => e.length))
    for (let i = 0; i < rows; i++) {
        var row = `
        <tr>
            ${plan.terms.map(e=>plan.plan[e][i] ? 
                `<td class="border border-primary">
                    <a href="/uw-coursemap/courses#course=${plan.plan[e][i]}">
                        ${plan.plan[e][i]}
                    </a>
                </td>`:
                `<td class="border border-primary"></td>`).join("")}
        </tr>
        `
        $("#courses").append(row);

    }
    if (plan.plan[plan.terms[0]].length == 0)
        $("#plan-overview tr > :first-child").hide();
});