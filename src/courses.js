import $ from "jquery";

import * as data from "data";
import * as search from "courses/coursesearch";

data.getData("courses").then(function(){
    search.init();    
})
