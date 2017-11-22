import $ from "jquery";
import {updateData} from "app";

var search = {
    all: [""],
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

export function getFilter(){
    return function(e){
        if(e.catalog_number&&
            !search.all.every(y=>Object.values(e).some((x)=>(String(x).includes(y.trim()))))){
            return false;
        }
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
}

function searchGeneral(){
    search.all = $("#search").val().split(" ");
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
