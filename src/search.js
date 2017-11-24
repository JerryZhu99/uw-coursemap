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
    if(!search.undergrad && parseInt(e.catalog_number)<500){
        return false;
    }
    if(!search.graduate && parseInt(e.catalog_number)>=500){
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
            e.title
        ].some(v=>String(v).includes(s.trim())))
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