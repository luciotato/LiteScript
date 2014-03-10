##Compiling from javascript (node.js)

Here's a node.js example script you can use to compile all .lite.md files 
in dir "./src" to dir "./out"

You can use this script as a base to create a Grunt task.

Main API functions are:

#### compiler.compile 

 - `compiler.compile(filepath,sourceLines,options)`

Will compile `sourceLines` returning a string with compiled js code.

Returns: string

Input: 

  - `filepath`: source code filename, only to reference it in compiler errors

  - `sourceLines`: string, string array, or Buffer

  - `options`:

   - verbose: 1 # Additional messages during compilation. set to 0.

   - warning: 1 # show warnings, 0: do not show warnings

   - comments: 1 # add comments to js produced file. set to 0.

   - target: 'js' 

   - single: false # single file: when true dependencies are not compiled. Set to true, for single file compilation.

   - skip: false # Skip validation phase. set to true

   - nomap: false #do nor generate mapSource.
   
   - browser:false #compile for browser: "window" instead fo "global"

   - extraComments: true #add 'compiled by' comment

   - es6: false # enable ES6 features. required for 'yield'(nice functions) 

    
#### compiler.getMessages()

if `compiler.compile(filepath,sourceLines,options)` throws, use 
`compiler.getMessages()` to retrieve compiler error & warning messages.

### Full example:

    var fs = require('fs'),path=require('path');

    // read and compile a single .lite.md file

    function compileLite(filepath) {

        var compiler=require('litescript');

        var options = {
            storeMessages: true,
            single : true,
            nomap : true,
            verbose : 0,
            noval: true,
            comments: 0
            }

        var sourceLines = fs.readFileSync(filepath);
        
        try {
            return compiler.compile(filepath,sourceLines,options);
       
        } catch(e) {

            console.log('LiteScript failed to compile.');
            console.log(e.message);

            //compiler warnings and error messages
            var messages = compiler.getMessages();
            for(var n=0;n<messages.length;n++){
                 console.log(messages[n]);
            }
        }

    }

    // Compile ./src into ./out

    var srceDir = 'src';
    var destDir = 'out';

    try{fs.mkdirSync(destDir)}catch(e){};

    var files = fs.readdirSync(srceDir);
    for (var n=0; n<files.length; n++){
        var file=path.join(srceDir,files[n]);
        console.log(file);
        if (path.extname(file)==='.md'){
            var compiled = compileLite(file);
            if (compiled) {
                var destFile = path.join(destDir,path.basename(files[n],'.md')+'.js');
                fs.writeFileSync(destFile, compiled);
            }
        }
            
    }



##Compiling from the browser 

you need to emulate "require()"

see: https://github.com/luciotato/LiteScript_online_playground


