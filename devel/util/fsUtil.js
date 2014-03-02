var path = require('path');
var fs   = require('fs');


//--------------------------
    function dirExists(dirPath){
    try {
        if (fs.statSync(dirPath).isDirectory())
            return true; //ok! exists and is a directory
        else 
            throw new Error(dirPath + ' exists but IS NOT a directory');
        } 
        catch (err) {
            //if it not exists, return false
            if (err.code === 'ENOENT') return false;
            else throw err; //another error
        };
    };

//--------------------------
    function mkPath(dirPath, mode){
        if (dirExists(dirPath))
            return; //ok! dir exists
        else {
            //try a folder up, until a dir is found (or an error thrown)
            mkPath(path.dirname(dirPath), mode);
            //ok, found parent dir! - make the children dir
            fs.mkdirSync(dirPath, mode);
            // return recursion, making all the children subdirs
        }   
    };


//--------------------------
    function mkPathToFile(filename, mode){
      mkPath(path.dirname(filename), mode)
    }
    
//--------------------------
function rmDirForce(dirPath) {
      if (!dirPath || dirPath==='/' || dirPath==='/*') throw 'not the root!';
      try { var files = fs.readdirSync(dirPath); }
      catch(e) { return; }
      if (files.length > 0)
        for (var i = 0; i < files.length; i++) {
          var filePath = dirPath + '/' + files[i];
          if (fs.statSync(filePath).isFile())
            fs.unlinkSync(filePath);
          else
            rmDirForce(filePath); //recursive
        }
      fs.rmdirSync(dirPath);
    };


/*
recurseDir
===========
This function recursively call a hook on every file
*/
function recurseDir(rootDir, hook) {

    var stat;

    function recursive(dir){
        stat = fs.statSync(dir);
        if (!stat.isDirectory()) throw 'expected a dir';

        //for each item in folder
        fs.readdirSync(dir).forEach(function(itemNameOnly){
            //get Full Path
            var item = path.join(dir, itemNameOnly);
            //check if it is a dir
            if (fs.statSync(item).isDirectory()) {
                //recursive call
                recursive(item);
            }
            else { //single file, apply hook
              // call hook with full filename, path relative to rootDir, basename
              hook( item, path.relative(rootDir,dir), itemNameOnly);
            }
        });
    };

    //first call
    recursive(rootDir);
}

function fileIsNewer(filename, destFileName) {

    var stat;
    stat = fs.statSync(filename);
    if (stat.isDirectory()) throw 'expected a file';

    var result=true;
    //console.log(stat.mtime, fname_processed);
    if (fs.existsSync(destFileName)) {
        var stat_processed = fs.statSync(destFileName);
        //console.log(stat.mtime, stat_processed.mtime);
        result = (stat.mtime > stat_processed.mtime); //proces if source is newer
    }

    return result;
}


function copyFile(filename, destFileName, options) {
    console.log('cp',filename,'->', path.relative(path.resolve(),destFileName));
    mkPathToFile(destFileName);
    fs.writeFileSync(destFileName, fs.readFileSync(filename), options);
}

function copyIfNewer(filename, destFileName,options) {
    if (fileIsNewer(filename, destFileName)) copyFile(filename, destFileName,options);
}

module.exports = {
        mkPath:mkPath
        ,mkPathToFile:mkPathToFile
        ,dirExists: dirExists
        ,recurseDir: recurseDir
        ,rmDirForce: rmDirForce
        ,fileIsNewer: fileIsNewer
        ,copyFile: copyFile
        ,copyIfNewer: copyIfNewer
};
