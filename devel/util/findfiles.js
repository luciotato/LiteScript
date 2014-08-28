var path = require('path'), fs=require('fs');

function fromDir(startPath,filter){

    console.error('Starting from dir '+startPath+'/*');

    if (!fs.existsSync(startPath)){
        console.log("no dir ",startPath);
        return;
    }

    var files=fs.readdirSync(startPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        var stat = fs.lstatSync(path_string);
        if stat.isDirectory(){
            fromDir(filename); //recurse
        }
        else if (filename.indexOf(filter)>=0) {
            console.log(filename,path.extname(filename));
        };
    };
};

fromDir('~/LiteScript','.lite.md');
