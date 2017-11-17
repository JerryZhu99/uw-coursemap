require('dotenv').config()
const uwapi = require('uwapi')(process.env.UWAPI_KEY);
const fs = require('fs');
const express = require('express');

const app = express();
app.use(express.static('build'));

app.get("/courses/:subject", function(req, res){
    let subject = req.params[0];
    if(subjects.indexOf(subject)==-1){
        res.sendStatus(404);
    }
    fs.exists(`${__dirname}/build/data/courses-${subject}.json`, function(exists){
        if(exists){
            res.sendFile(`${__dirname}/courses-${subject}.json`);
        }else{
            uwapi.courses(subject).then(function(data){
                fs.writeFile(`${__dirname}/build/data/courses-${subject}.json`, data).then(console.log, console.error);
                res.json(data);
            });
        }
    })
});    

app.get("/courses/course/:id", function(req, res){

});

app.listen(8080);