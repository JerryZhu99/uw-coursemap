require('dotenv').config()
const uwapi = require('uwapi')(process.env.UWAPI_KEY);
const fs = require('fs');
let term;



console.log("fetching data");
uwapi.termsList()
.then(function(termlist){
    console.log("term info found");    
    return {term_id :termlist.next_term};
}, console.error)
.then(uwapi.termsCourses, console.error)
.then(function(courses){
    console.log("course info found: "+courses);
    fs.writeFile(__dirname+"/build/data/courses.json", JSON.stringify(courses, null, 2), console.error);
}, console.error)