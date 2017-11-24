import $ from "jquery";
import * as simulation from "simulation";
import * as courseMap from "coursemap";

var search = {
    general: [""],
    subjects: ["MATH"],
    undergrad: true,
    graduate: false,
}

export function init(){
    $("#search").change(searchGeneral);    
    $("#subjectsearch").change(searchSubject);
    $("#undergradsearch").change(searchUndergrad);
    $("#graduatesearch").change(searchGraduate);
}

export function getFilter(e){
    if(!search.subjects.some((x)=>(x.trim().toUpperCase()==e.subject))){
        return false;
    }
    if(!search.undergrad && e.academic_level == "undergraduate"){
        return false;
    }
    if(!search.graduate && e.academic_level == "graduate"){
        return false;
    }
    return true;
}
export function getHighlight(e){
    if(search.general.length == 1&&search.general[0] == ""){
        return true;
    }
    if(!search.general.every(
        s=>([
            e.subject,
            e.catalog_number,
            e.title,
            e.description
        ].some(v=>String(v).toUpperCase().includes(s.trim().toUpperCase())))
    )){
        return false;
    }
    return true;
}
function searchGeneral(){
    search.general = $("#search").val().split(" ");
    updateData();
}
function searchSubject(){
    search.subjects = $("#subjectsearch").val().split(",");
    updateData();
}
function searchUndergrad(){
    search.undergrad = $("#undergradsearch").is(":checked");
    updateData();
}
function searchGraduate(){
    search.graduate = $("#graduatesearch").is(":checked");
    updateData();    
}
function updateData(){
    simulation.updateData(getFilter);    
    courseMap.update(getHighlight);
}

export function showDetails(e){
    $(".panel").hide();
    $("#details-panel").show();
    $("#course-name").text(e.title);
    $("#course-code").text(`${e.subject} ${e.catalog_number}`);
    $("#course-description").text(e.description);
    
}