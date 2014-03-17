
    var fs = require('fs'),path=require('path');

// read and compile a single .lite.md file

    function compileLite(filepath) {

    	//if litescript is installed -g and NODE_PATH set, use:
        //var compiler=require('litescript');
        var compiler=require('../../../../lib/Compiler');

        var options = {
            storeMessages: true,
            single : true,
            nomap : true,
            noval: true
            }

        var sourceLines = fs.readFileSync(filepath);
        
        try {
            //return compiler.compile(filepath,sourceLines,options);
       		return compiler.compile(undefined,sourceLines,options);
       
        } catch(e) {

            console.log('ERRORS COMPILING');
            console.log(e.message);

            //show compiler warnings and error messages
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
            var destFile = path.join(destDir, path.basename(files[n],'.md')+'.js');
            fs.writeFileSync(destFile, compiled);
        }
            
    }

