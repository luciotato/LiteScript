
    var fs = require('fs'),path=require('path');

// read and compile a single .lite.md file

    function compileLite(filepath) {

        var compiler=require('litescript');

        var options = {
            storeMessages: true,
            single : true,
            nomap : true,
            verbose : 0,
            noval: true
            }

        var sourceLines = fs.readfileSync(filepath);
        
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
            var destFile = path.join(destDir,basename(files[n],'.md')+'.js');
            fs.writeFileSync(destFile, compiled);
        }
            
    }

