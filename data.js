require('dotenv').config()
const uwapi = require('uwapi')(process.env.UWAPI_KEY);
const fs = require('fs');
const _ = require('lodash');

console.log("fetching data");

new Promise(function (resolve, reject) {
    fs.exists(__dirname + "/build/data/subjects.json",
        (exists) => (exists ? resolve() : reject()));
    }).then(function(){
        console.log("subjects.json found")
    },function(){
        console.log("subjects.json not found, requesting data")
        return uwapi.codesSubjects().then(function (subjects) {
            console.log("subject info found: " + subjects.length);
            fs.writeFile(__dirname + "/build/data/subjects.json", JSON.stringify(subjects, null, 2), console.error);
            console.log("subject info saved: " + __dirname + "/build/data/subjects.json");
            return subjects;
        }, console.error);
    })

new Promise(function (resolve, reject) {
        fs.exists(__dirname + "/build/data/courses.json",
            (exists) => (exists ? resolve() : reject()));
    })
    .then(function (exists) {
        console.log("courses.json found");
        return new Promise(function (resolve, reject) {
            fs.readFile(__dirname + "/build/data/courses.json",
                (err, data) => (err ? reject(err) : resolve(JSON.parse(data))));
        });
    })
    .catch(function () {
        console.log("courses.json not found, requesting data");
        return uwapi.courses().then(function (courses) {
            console.log("course info found: " + courses.length);
            fs.writeFile(__dirname + "/build/data/courses.json", JSON.stringify(courses, null, 2), console.error);
            console.log("course info saved: " + __dirname + "/build/data/courses.json");
            return courses;
        }, console.error);
    })
    .then(function (courses) {
        console.log("processing " + courses.length + " courses")
        let coursePromises = [];
        console.log("requesting course prereqs...");
        let delay = 0;
        courses.forEach(function (c) {
            coursePromises.push(new Promise(function (resolve, reject) {
                fs.exists(__dirname + "/build/data/prereqs/" + c.subject +" "+ c.catalog_number + ".json",
                    (exists) => (exists ? resolve() : reject()));
            }).then(function () {
                return new Promise(function (resolve, reject) {
                    fs.readFile(__dirname + "/build/data/prereqs/" + c.subject +" "+ c.catalog_number + ".json",
                        (err, data) => (err ? reject(err) : resolve(JSON.parse(data))));
                });
            }).catch(function () {
                return new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        uwapi.coursesPrerequisites({
                                subject: c.subject,
                                catalog_number: c.catalog_number
                            })
                            .then(function (prereqs) {
                                if (prereqs.subject) {
                                    console.log(prereqs.subject + " " + prereqs.catalog_number);
                                    fs.writeFileSync(__dirname + "/build/data/prereqs/" + c.subject +" "+ c.catalog_number + ".json", JSON.stringify(prereqs, null, 2));
                                    resolve(prereqs);
                                } else {
                                    console.log("no prereqs: " + c.subject + " " + c.catalog_number);
                                    prereqs = {
                                        subject: c.subject,
                                        catalog_number: c.catalog_number,
                                        title: c.title,
                                        prerequisites: '',
                                        prerequisites_parsed: []
                                    }
                                    fs.writeFileSync(__dirname + "/build/data/prereqs/" + c.subject +" "+ c.catalog_number + ".json", JSON.stringify(prereqs, null, 2));
                                    resolve(prereqs);
                                }
                            }, function (error) {
                                console.log("error: " + c.subject + " " + c.catalog_number);
                                resolve.reject(error);
                            });
                    }, delay * 250);
                    delay++;
                });
            }));
        }, this);
        console.log("waiting for course prereqs");
        return Promise.all(coursePromises);
    }, console.error)
    .then(function (courses) {
        let prereqs = [];
        for (let course of courses) {
            try {
                let invalid = (course.prerequisites_parsed === "" || course.prerequisites_parsed === null);
                let allprereqs = _.flattenDeep(invalid ? [] : course.prerequisites_parsed)
                    .filter((x) => (!(typeof x == "number")));
                if(allprereqs.length==0)allprereqs.push(course.subject);
                for (let prereq of allprereqs) {
                    prereqs.push({
                        course: course.subject + course.catalog_number,
                        prereq: prereq
                    });
                }
            } catch (e) {
                console.error("Error: " + e + " on " + course.subject + course.catalog_number)
            }
        }
        console.log("prereq list created: " + prereqs.length + " entries");
        return new Promise(function (resolve, reject) {
            fs.writeFile(__dirname + "/build/data/prereqs.json", JSON.stringify(prereqs, null, 2),
                (err) => (err ? reject(err) : resolve(courses)));
        });
    }, console.error)
    .then(function(courses){
        console.log("prerequisites saved");
        let coursePromises = [];
        console.log("requesting course details...");
        let delay = 0;
        courses.forEach(function (c) {
            coursePromises.push(new Promise(function (resolve, reject) {
                fs.exists(__dirname + "/build/data/details/" + c.subject +" "+ c.catalog_number + ".json",
                    (exists) => (exists ? resolve() : reject()));
            }).then(function () {
                return new Promise(function (resolve, reject) {
                    fs.readFile(__dirname + "/build/data/details/" + c.subject +" "+ c.catalog_number + ".json",
                        (err, data) => (err ? reject(err) : resolve(JSON.parse(data))));
                });
            }).catch(function () {
                return new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        uwapi.courses({
                                subject: c.subject,
                                catalog_number: c.catalog_number
                            })
                            .then(function (details) {
                                if (details.subject) {
                                    details = Object.assign(c,details);
                                    console.log(details.subject + " " + details.catalog_number);
                                    fs.writeFileSync(__dirname + "/build/data/details/" + c.subject +" "+ c.catalog_number + ".json", JSON.stringify(details, null, 2));
                                    resolve(details);
                                } else {
                                    console.log("no details: " + c.subject + " " + c.catalog_number);
                                    details = {
                                        subject: c.subject,
                                        catalog_number: c.catalog_number,
                                        title: c.title,
                                        prerequisites: '',
                                        prerequisites_parsed: []
                                    }
                                    details = Object.assign(c,details);                                    
                                    fs.writeFileSync(__dirname + "/build/data/details/" + c.subject +" "+ c.catalog_number + ".json", JSON.stringify(details, null, 2));
                                    resolve(details);
                                }
                            }, function (error) {
                                console.log("error: " + c.subject + " " + c.catalog_number);
                                resolve.reject(error);
                            });
                    }, delay * 250);
                    delay++;
                });
            }));
        }, this);
        console.log("waiting for course info");
        return Promise.all(coursePromises);
    }, console.error).then(function(courses){
        console.log("saving data")
        return new Promise(function (resolve, reject) {
            fs.writeFile(__dirname + "/build/data/details.json", JSON.stringify(courses, null, 2),
                (err) => (err ? reject(err) : resolve(courses)));
        });
    }).catch(console.error)
    .then(function(){
        console.log("finished");
    });