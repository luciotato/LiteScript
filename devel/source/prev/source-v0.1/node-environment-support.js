//-------------------------------------------------------
// Environment support to run LiteScritp compiler on node
//-------------------------------------------------------

//Dependencies

    var path = require('path');
    var fs   = require('fs');

    util = require('./util'); // global.colors, global.debug, global.log, mkPath


//------------------------------
//------------------------------
environment = {

    splitImportParameter: function(importParameter){
    // returns: 
    /*  fileInfo = {
            dirname : path.dirname(filename)
            basename : path.basename(importParameter)
            extension : path.extname(importParameter)
            moduleName: w/o extension
            isAbsolutePath: (fileInfo.dirname[0]===path.delimiter)
        }
    */    
        var fileInfo =  {
            importParameter: importParameter
            ,filename : importParameter
            ,dirname : path.dirname(importParameter)
            ,basename : path.basename(importParameter)
            ,extension: path.extname(importParameter)
        };

        //check if absolute path
        fileInfo.isAbsolutePath = (fileInfo.dirname[0]===path.delimiter); 
        //Get pure module name (no path, no extension)
        fileInfo.moduleName = path.basename(importParameter,fileInfo.extension).replace(/\.lite$/,"");
        
        return fileInfo;
    }   

    ,searchModule: function(importParameter, basePath, importingModuleDirName, options ){
    //------------------
    //provide a searchModule function to the LiteScript environment
    // to use to locate modules for the `import/require` statement
    //------------------
    // returns: 
    /*  fileInfo = {
            importParameter: raw string passed to import/require
            filename: full module filename
            dirname : path.dirname(filename)
            isAbsolutePath : (dirname[0]===path.delimiter); 
            extension : path.extname(importParameter)
            moduleName : clean module name, no path no extension
            isLite: true if extension is '.lite'|'.lite.md' 
            outFilename: output file for code production
            outExportRequired: output file for export members cache
            outExportRequiredExists: if outExportRequired file exists
        }
    */

        if (!options) options={};
        
        var fileInfo = environment.splitImportParameter(importParameter);

        //if has no extension or extension is .lite or .md
        // we search the module in the basepath as file.lite.md or as file/main.lite.me
        if (!fileInfo.extension || fileInfo.extension==='.lite' || fileInfo.extension==='.md') {

            //search the file:
            var search;
            if (fileInfo.isAbsolutePath)
                search = [path.join(fileInfo.dirname,fileInfo.moduleName)]
            else
            //search in:
                search = [
                    path.resolve(basePath, importingModuleDirName, fileInfo.dirname, fileInfo.moduleName)
                    ,path.resolve(basePath, importingModuleDirName, fileInfo.dirname, fileInfo.moduleName,'main')
                    ]
            ;

            var full,found;
            for (var n=0;n<search.length && !found;n++) {
                for (ext in {'.lite.md':0, '.lite':1, '.js':2}) {
                    full = search[n]+ext;
                    if (fs.existsSync(full)) {
                        found=full;
                        break;
                    }
                };
            };

            //console.log(basePath);
            //console.log(full);

            if (!found) raise('Module not found: ',importParameter,'\nSearched as:\n ',search.join('(.lite.md|.lite|.js)]\n  ')+'(.lite.md|.lite|.js)\n');
            
            //Recalc relPath & extension
            fileInfo.filename = full; //full path
            fileInfo.extension = path.extname(fileInfo.filename);
        }
        else {

            // other extensions
            //No compilation (only copy to output dir), and no change of output extension 
            if (!fileInfo.isAbsolutePath) {
                fileInfo.filename = path.resolve(basePath,importingModuleDirName,fileInfo.importParameter);
            }
        }

        fileInfo.dirname = path.dirname(fileInfo.filename);
        fileInfo.relPath = path.relative(basePath, fileInfo.dirname); //relative to basePath
        fileInfo.outPath = path.resolve(basePath,'..',(options.outDir||"out/debug"),fileInfo.relPath)

        // based on result extension                
        fileInfo.isLite = (fileInfo.extension==='.lite'||fileInfo.extension==='.md');
        fileInfo.outExtension = fileInfo.isLite? '.js': (fileInfo.extension||'.js');
            
        fileInfo.outFilename = path.join(fileInfo.outPath,fileInfo.moduleName+fileInfo.outExtension);

        if (fileInfo.isLite){
            //Also calculate fileInfo.outExportRequired (cache of module exported names), and check if the file exists
            //(location of cache members is './out/declare')

            fileInfo.outExportRequired = path.join(fileInfo.outPath,"declares",fileInfo.moduleName+".json");
            //create path if it not exists
            util.mkPathToFile(fileInfo.outExportRequired);
            //check if file exists
            fileInfo.outExportRequiredExists = fs.existsSync(fileInfo.outExportRequired)
        };

        // make sure output dir exists
        util.mkPathToFile(fileInfo.outFilename);

        debug(fileInfo);
        
        return fileInfo;
    }


    ,loadFile: function(filename){
    //------------------
    //provide a loadFile function to the LiteScript environment.
    //return file contents
    //------------------
        return fs.readFileSync(filename);
    }


    ,checkExternalCache: function(fileInfo){
    //------------------
    //provide a checkExternalCache (disk) function to the LiteScript environment
    //------------------

        //default is not-cached
        fileInfo.externalCacheExists = false;
        //console.log("check external cache:",fileInfo.outFilename);
        //check source date vs compiled date
        try {
        //get source date & time 
            var stat = fs.statSync(fileInfo.filename);
            if (fs.existsSync(fileInfo.outFilename)) {
                var stat_processed = fs.statSync(fileInfo.outFilename);
                //console.log(stat.mtime, stat_processed.mtime);
                fileInfo.externalCacheExists = (stat_processed.mtime > stat.mtime ); //cache exists if compiled id older
                //if (fileInfo.externalCacheExists) console.log('UNCHANGED:',fileInfo.filename);
            }

            if (!fileInfo.isLite) { // unrecg extension, just copy
                if (!fileInfo.externalCacheExists) { 
                    console.log('copying ',fileInfo.filename,fileInfo.outFilename);
                    fs.createReadStream(fileInfo.filename).pipe(fs.createWriteStream(fileInfo.outFilename));
                    fileInfo.externalCacheExists = true;
                }
            }
            else {// .lite extension
                // if cached, the outExportRequired should exist too
                if (fileInfo.externalCacheExists) {  //cached
                    if (!fileInfo.outExportRequiredExists)
                        return false; //no decls found, compile again
                }
            }

        }
        catch(err){
            console.error(err.message,fileInfo.filename);
        }

        return fileInfo.externalCacheExists;
    }


    ,externalCacheSave: function(filename, fileLines){
    //------------------
    //provide a externalCacheSave (disk) function to the LiteScript environment
    // receive a filename and an array of lines
    //------------------
        if (!fileLines){
            if (fs.existsSync(filename)) {
                //remove file
                fs.unlinkSync(filename);
            }
        }
        else {
            if (fileLines instanceof Array) fileLines=fileLines.join("\n");
            //console.log('save file',filename,fileLines.length,'lines');
            fs.writeFileSync(filename,fileLines);
        }
    }


    //------------------
    // Check for built in and global names
    //------------------
    
    ,isBuiltInModule: function (name,prop){
    //
    // return true if 'name' is a built-in node module
    //

        var isCoreModule = ['assert', 'buffer', 'child_process', 'cluster',
          'crypto', 'dgram', 'dns', 'events', 'fs', 'http', 'https', 'net',
          'os', 'path', 'punycode', 'querystring', 'readline', 'repl',
          'string_decoder', 'tls', 'tty', 'url', 'util', 'vm', 'zlib'].indexOf(name)>=0;

       if (isCoreModule) {
                if (!prop) return true; //just asking is core module

                var r = require(mainVar); //load module
                if (prop in r) return true; //is the member there?
            }
     
    }

    ,isBuiltInObject: function (name){
    //
    // return true if 'name' is a javascript built-in object
    //

        if (['isNaN','parseFloat','parseInt','isFinite'
            ,'decodeURI','decodeURIComponent'
            ,'encodeURI','encodeURIComponent'
            ,'eval','console'
            ,'process','require'
            ].indexOf(name)>=0 ) return true;

    }

    ,getGlobalObjectProperties: function (name, level1,level2){
    //
        try {
            var main = global;
            for(var level=0;level<arguments.length;level++)
                main = main[arguments[level]];
            return Object.keys(main);
        }
        catch(e){
            console.error("EnvironmentgetBuiltInProperties "+Array.prototype.slice.call(arguments).join());
            console.error(e.stack);
            debugger;
        }
    }

};

module.exports = environment;


