import $ from "jquery";

import * as plan from "utils/plan";

$(document).ready(function(){
    console.log(plan)
    let rows = Math.max(...Object.values(plan.plan).map(e=>e.length))
    for(let i=0; i<rows; i++){
        var row = `
        <tr>
            ${plan.terms.map(e=>plan.plan[e][i]?`<td>${plan.plan[e][i]}</td>`:"<td>Empty</td>").join("")}
        </tr>
        `
        $("#courses").append(row);
        
    }
});