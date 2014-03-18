##Compiling from javascript (node.js)

###Main API functions are:

#### compile (filename,sourceLines,options)

Will compile `sourceLines` returning a string with compiled js code.

Returns: string

Input: 

  - filename: source code filename, only to include in compiler errors

  - sourceLines: string, string array, or Buffer

  - default options:

   - verbose: 0 # Additional messages during compilation. 

   - warning: 1 # show warnings, 0: do not show warnings

   - comments: 1 # add comments to js produced file. set to 0.

   - target: 'js' 

   - single: false # Set to true, for single file compilation (dependencies are not compiled)

   - storeMessages: false # set to true to store compiler messages. retrieve messages with *getMessages()*.

   - skip: false # Skip validation phase. set to true for single file compilation.

   - nomap: false #do not generate source map.
   
   - browser:false #compile for browser: "window" is the global scope instead of "global"

   - extraComments: true #add 'compiled by' comment

   - es6: false # enable ES6 features. required for 'yield'(nice functions) 

    
#### getMessages()

returns: string array

if `compile(filepath,sourceLines,options)` throws, use 
`getMessages()` to retrieve compiler error & warning messages.

### Full example:
Here's a node.js example script you can use to compile all .lite.md files 
in dir "./src" to dir "./out"

You can use this script as a base to create a Grunt task.


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



##Compiling in the browser 

you need to emulate "require()"

see: https://github.com/luciotato/LiteScript_online_playground


