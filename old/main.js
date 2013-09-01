/* 
main.js: actions
-----------------
    1. create a LiteScript Processor from your ./node_modules/litescript dir
    2. add all the extra sugar from ./node_modules/litescript/sugar dir
    3. call lite.compile()
        3.1 default path is your main app dir: ../..
        3.2 compile only if source is newer
        3.3 process *.lite.js files, creating _*.js files
            Example: creates '_main.js' from 'main.lite.js', if datetime of 'main.lite.js' is newer
    
    
To use litescript from a node.js app
------------------------------------

1. Install your copy of litescript in node_modules:

    npm install litescript

2. Create a boot auto-compiler:

    (assuming your main source file is: main.lite.js)

    Include:  "main":"boot.js"  in your package.json

    create a file 'boot.js', with the following content:

    boot.js
    -------
    require('litescript'); //create & run LiteScript your processor from ./node_modules
    require('_main.js'); //load & run your processed main.lite.js

3. ?

4. PROFIT!

*/

// -----------------
// main.js
// -----------------

var fs=require('fs');

// 1. create a LiteScript Processor
var Lite=require('./lite'); //load class
var lite=new Lite(); //create processor

// 2. add all the extra sugar from ./sugar dir
fs.readdirSync("./sugar").forEach(
    function(file) {
        lite.addSugar( require("./sugar/" + file) );
    }
);

// 3. add & run 'Lite.prototype.compile(path)'
require('./compile');

//export created processor
module.exports = lite;
