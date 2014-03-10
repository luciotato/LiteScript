##Compiling from javascript (node.js)

Here's a node.js example script you can use to compile all .lite.md files 
in dir "./src" to dir "./out"

You can use this script as a base to create a Grunt task.

Main API used functions are:

 - `compiler.compile(filepath,sourceLines,options)`

returns: string

input: 
    - `filepath`: source code filename, to reference it in compiler errors
    - `sourceLines`: string, string array, or Buffer
    - `options`:
    

Will compile `sourceLines` (can be a string, 

- `compiler.getMessages()`


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


