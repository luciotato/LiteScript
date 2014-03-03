//============
//Utility file
//============

//Colors
//------

global.color = {
      normal:"\x1b[39;49m"
      ,red: "\x1b[91m"
      ,yellow: "\x1b[93m"
      ,green: "\x1b[32m" 
  };
    
var fs = require('fs'), path = require('path');


//-----------------
// Helper functions
//-----------------
    function dirExists(dirPath){
    try {
        if (fs.statSync(dirPath).isDirectory())
            return true; //ok! exists and is a directory
        else 
            throw new Error(dirpath + ' exists but IS NOT a directory');
        } 
        catch (err) {
            //if it not exists, return false
            if (err.code === 'ENOENT') return false;
            else throw err; //another error
        };
    };

//--------------------------
    mkPath = function(dirPath, mode){
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
    exports.mkPath = mkPath;


//--------------------------
    mkPathToFile = function(filename, mode){
      mkPath(path.dirname(filename), mode)
    };
    exports.mkPathToFile = mkPathToFile;

//----------------------------------
// Helper functions, global debug
//----------------------------------
//default global.debugOptions

if (!global.debugOptions) global.debugOptions={};
if (global.debugOptions.enabled===undefined) global.debugOptions.enabled=true;
if (global.debugOptions.file===undefined) global.debugOptions.file = 'out/debug.log';
if (global.debugOptions.level===undefined) global.debugOptions.level = 1;

if (global.debugOptions.file) {
    mkPathToFile(global.debugOptions.file);
    fs.writeFileSync(global.debugOptions.file,"");
}

// raise throws a "controled" error
global.raise = function(){
    var e = new Error(Array.prototype.slice.call(arguments).join(" "));
    e.controled = true;
    throw e;
}

global.debug = function(){
    if (global.debugOptions.enabled) {
        args = Array.prototype.slice.apply(arguments)
        if (global.debugOptions.file)
            fs.appendFileSync(global.debugOptions.file, args.join(" ")+"\r\n");
        else
            console.log.apply(this,args);
    }
};

global.log = function(){
    debug.apply(this,arguments);
    console.log.apply(this,arguments);
}

global.log.error = function(){
    global.log.error.count++;
    args = Array.prototype.slice.apply(arguments);
    args.unshift('ERROR:');
    debug.apply(this,args);
    args.unshift(global.color.red);
    args.push(global.color.normal);
    console.error.apply(this,args);
}
global.log.error.count=0;

global.log.warning = function(){
    args = Array.prototype.slice.apply(arguments);
    args.unshift('WARNING:');
    debug.apply(this,args);
    if (global.debugOptions.level>=1){
        args.unshift(global.color.yellow);
        args.push(global.color.normal);
        console.error.apply(this,args);
    }
}

global.log.message = function(){
    debug.apply(this,arguments);
    if (global.debugOptions.level>=2)
        console.log.apply(this,arguments);
}
