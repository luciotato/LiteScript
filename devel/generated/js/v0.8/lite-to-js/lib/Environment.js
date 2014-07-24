//The 'Environment' object, must provide functions to load files, 
//search modules in external cache, load and save from external cache (disk). 

//The `Environment` abstraction helps us to support compile on server (nodejs) or the browser.

//Dependencies

    //global import fs, path
    var fs = require('fs');
    var path = require('path');

    //import mkPath, logger
    var mkPath = require('./mkPath.js');
    var logger = require('./logger.js');

//Module vars

    //var 
        //projectDir: string
        //outDir: string
        //targetExt: string
    var 
        projectDir = undefined, 
        outDir = undefined, 
        targetExt = undefined
;


//### export Class FileInfo
    // constructor
    function FileInfo(info){

//#### properties

        //importInfo:ImportParameterInfo #: .name, .globalImport .interface - info passed to new
        //dir:string #: path.dirname(importParameter)
        //extension:string #: path.extname(importParameter)
        //base:string #: path.basename(importParameter, ext) #with out extensions
        //sourcename:string #: path.basename(importParameter, ext) #with  extensions
        //hasPath # true if starts with '.' or '/'
        //isCore # true if it's a core node module as 'fs' or 'path'
        //isLite #: true if extension is '.lite'|'.lite.md' 
        //isInterface # set after search: true if this.sourcename.contains('.interface.')
        //filename:string #: found full module filename
        //relPath:string # path.relative(basePath, this.dirname); //relative to basePath
        //relFilename: string
        //outDir: string
        //outFilename: string # output file for code production
        //outRelFilename: string # path.relative(options.outDir, this.outFilename); //relative to basePath
        //outExtension: string
        //outFileIsNewer: boolean # true if generated file is newer than source
        //interfaceFile: string #: interface file (.[auto-]interface.md) declaring exports cache
        //interfaceFileExists: boolean #: if interfaceFileName file exists
        //externalCacheExists: boolean

//#### constructor (info:ImportParameterInfo)

        //if typeof info is 'string'
        if (typeof info === 'string') {
            //var filename = info
            var filename = info;
            //info = new ImportParameterInfo
            info = new ImportParameterInfo();
            //info.name = filename
            info.name = filename;
        };

        //var name = info.name;
        var name = info.name;
        //this.importInfo = info;
        this.importInfo = info;
        //this.filename = name
        this.filename = name;
        //this.dir = path.resolve(path.dirname(name))
        this.dir = path.resolve(path.dirname(name));
        //this.hasPath = name.charAt(0) in [path.sep,'.']
        this.hasPath = [path.sep, '.'].indexOf(name.charAt(0))>=0;
        //this.sourcename = path.basename(name) 
        this.sourcename = path.basename(name);
        //this.isInterface = this.sourcename.indexOf('.interface.') isnt -1
        this.isInterface = this.sourcename.indexOf('.interface.') !== -1;
        //this.extension = path.extname(name)
        this.extension = path.extname(name);
        //this.base = path.basename(name,this.extension) 
        this.base = path.basename(name, this.extension);

        //#remove .lite from double extension .lite.md
        //if this.base.endsWith('.lite'), this.base=this.base.slice(0,-5)
        if (this.base.endsWith('.lite')) {this.base = this.base.slice(0, -5)};
     };

//#### method outWithExtension(ext)
     FileInfo.prototype.outWithExtension = function(ext){
        //return path.join(.outDir,"#{.base}#{ext}")
        return path.join(this.outDir, '' + this.base + ext);
     };

//#### method searchModule(importingModuleDir:string)
     FileInfo.prototype.searchModule = function(importingModuleDir){

////------------------
////provide a searchModule function to the LiteScript environment
//// to use to locate modules for the `import/require` statement
////------------------

        //#logger.debug "searchModule #{JSON.stringify(this)}"

//check if it's a node global module (if require() parameter do not start with '.' or './') 
//if compiling for node, and "global import" and no extension, asume global lib or core module

        //if this.importInfo.globalImport and targetExt is "js"
        if (this.importInfo.globalImport && targetExt === "js") {
            //# if compiling to node.js and global import ASSSUME core node module / installed node_modules
            //this.isCore = isBuiltInModule(this.base) #core module like 'fs' or 'path'
            this.isCore = isBuiltInModule(this.base);// #core module like 'fs' or 'path'
            //this.isLite = false
            this.isLite = false;
            //return 
            return;
        };

//if parameter has no extension or extension is [.lite].md
//we search the module 

        //var full,found = undefined
        var full = undefined, found = undefined;

        //if this.importInfo.createFile
        if (this.importInfo.createFile) {
            //full = path.join(projectDir, this.importInfo.name)
            full = path.join(projectDir, this.importInfo.name);
        }
        else {

        //else
            ////search the file
            //var search
            var search = undefined;
            //if this.hasPath #specific path indicated
            if (this.hasPath) {// #specific path indicated
                //search = [ path.resolve(importingModuleDir,this.importInfo.name)]
                search = [path.resolve(importingModuleDir, this.importInfo.name)];
            }
            else {
            //else
                //#normal: search local ./ & .[projectDir]/lib
                //search = [ 
                    //path.join(importingModuleDir, this.importInfo.name)
                    //path.join(projectDir,'/lib',this.importInfo.name)
                search = [path.join(importingModuleDir, this.importInfo.name), path.join(projectDir, '/lib', this.importInfo.name)];
                    //]

                //if targetExt is "c"
                if (targetExt === "c") {
                    //// add Project/C_global_import if target is 'c'
                    //search.push path.join(projectDir,'/C_global_import',this.importInfo.name)
                    search.push(path.join(projectDir, '/C_global_import', this.importInfo.name));
                };
            };


            //for each item in search 
            for( var item__inx=0,item ; item__inx<search.length ; item__inx++){item=search[item__inx];
            
                //for each ext in ['.lite.md','.md','.interface.md','.js'] 
                var _list5=['.lite.md', '.md', '.interface.md', '.js'];
                for( var ext__inx=0,ext ; ext__inx<_list5.length ; ext__inx++){ext=_list5[ext__inx];
                
                    //if fs.existsSync("#{item}#{ext}" into full)
                    if (fs.existsSync((full='' + item + ext))) {
                        //found=full
                        found = full;
                        //break
                        break;
                    };
                };// end for each in ['.lite.md', '.md', '.interface.md', '.js']
                //end for
                
                //if found, break
                if (found) {break};
            };// end for each in search
            //end for
            
                
            ////console.log(basePath);
            ////logger.debug full

            //#try \t#{search.join('\n\t')}

            //if not found
            if (!(found)) {
                //logger.throwControlled """
                logger.throwControlled('' + this.importInfo.source + ":" + this.importInfo.line + ":1 Module not found: " + this.importInfo.name + "\nSearched as:\n" + ((search.join('\n'))) + "\n   with extensions (.lite.md|.md|.interface.md|.js)");
            };
        };
                        //#{this.importInfo.source}:#{this.importInfo.line}:1 Module not found: #{this.importInfo.name}
                        //Searched as:
                        //#{search.join('\n')}
                           //with extensions (.lite.md|.md|.interface.md|.js)
                        //"""

        //end if
        

        ////set filename & Recalc extension
        //this.filename =  path.resolve(full); //full path
        this.filename = path.resolve(full); //full path
        //this.extension = path.extname(this.filename);
        this.extension = path.extname(this.filename);
        
        ////else 

            ////other extensions
            ////No compilation (only copy to output dir), and keep extension 
        ////    this.filename = path.resolve(importingModuleDirname,this.importInfo.name);
        

        ////recalc data from found file
        //this.dir = path.dirname(this.filename);
        this.dir = path.dirname(this.filename);
        //this.sourcename = path.basename(this.filename); #with extensions
        this.sourcename = path.basename(this.filename);// #with extensions
        //this.isInterface = this.sourcename.indexOf('.interface.') isnt -1
        this.isInterface = this.sourcename.indexOf('.interface.') !== -1;
        //this.relPath = path.relative(projectDir, this.dir); //relative to basePath
        this.relPath = path.relative(projectDir, this.dir); //relative to basePath
        //this.relFilename = path.relative(projectDir, this.filename); //relative to basePath
        this.relFilename = path.relative(projectDir, this.filename); //relative to basePath

        //// based on result extension                
        //this.isLite = this.extension in ['.md','.lite']
        this.isLite = ['.md', '.lite'].indexOf(this.extension)>=0;
        //this.outExtension = not this.isLite and this.extension? this.extension else ".#{targetExt}"
        this.outExtension = !(this.isLite) && this.extension ? this.extension : "." + targetExt;
            
        //this.outDir = path.join(outDir, this.relPath)
        this.outDir = path.join(outDir, this.relPath);
        //this.outFilename = path.join(this.outDir, "#{this.base}#{this.outExtension}");
        this.outFilename = path.join(this.outDir, '' + this.base + this.outExtension);
        //this.outRelFilename = path.relative(outDir, this.outFilename); //relative to options.outDir
        this.outRelFilename = path.relative(outDir, this.outFilename); //relative to options.outDir

        ////print JSON.stringify(this,null,2)

        //if this.importInfo.createFile, return #we're creating this file
        if (this.importInfo.createFile) {return};

//Check if outFile exists, but is older than Source

        ////get source date & time 
        //var sourceStat = fs.statSync(this.filename);
        var sourceStat = fs.statSync(this.filename);
        //declare on sourceStat mtime
        

        //if fs.existsSync(this.outFilename)
        if (fs.existsSync(this.outFilename)) {
            ////get generated date & time 
            //var statGenerated = fs.statSync(this.outFilename);
            var statGenerated = fs.statSync(this.outFilename);
            //declare on statGenerated mtime
            
            ////if source is older
            //this.outFileIsNewer = (statGenerated.mtime > sourceStat.mtime ); 
            this.outFileIsNewer = (statGenerated.mtime > sourceStat.mtime);
        };

        ///*
        //console.log this.filename
        //console.log sourceStat.mtime
        //console.log this.outFilename
        //if statGenerated, console.log statGenerated.mtime
        //console.log this.outFileIsNewer
        //*/

//Also calculate this.interfaceFile (cache of module exported names), 
//check if the file exists, and if it is updated

        //this.interfaceFile = path.join(this.dir,'#{this.base}.interface.md');
        this.interfaceFile = path.join(this.dir, '' + this.base + '.interface.md');
        //#logger.debug this.interfaceFile 
        //var isCacheFile
        var isCacheFile = undefined;
        //if fs.existsSync(this.interfaceFile)
        if (fs.existsSync(this.interfaceFile)) {
            //this.interfaceFileExists = true
            this.interfaceFileExists = true;
            //isCacheFile = false
            isCacheFile = false;
        }
        else {
        //else
            ////set for auto-generated interface
            //this.interfaceFile = path.join(this.dir,'#{this.base}.cache-interface.md');
            this.interfaceFile = path.join(this.dir, '' + this.base + '.cache-interface.md');
            //isCacheFile = true
            isCacheFile = true;
            //this.interfaceFileExists = fs.existsSync(this.interfaceFile)
            this.interfaceFileExists = fs.existsSync(this.interfaceFile);
        };

//Check if interface cache is updated

        //if this.interfaceFileExists and isCacheFile
        if (this.interfaceFileExists && isCacheFile) {
            ////get interface date & time 
            //var statInterface = fs.statSync(this.interfaceFile);
            var statInterface = fs.statSync(this.interfaceFile);
            //declare on statInterface mtime
            
            ////cache exists if source is older
            //this.interfaceFileExists = (statInterface.mtime > sourceStat.mtime ); 
            this.interfaceFileExists = (statInterface.mtime > sourceStat.mtime);
            //if not this.interfaceFileExists, externalCacheSave this.interfaceFile,null //delete cache file if outdated
            if (!(this.interfaceFileExists)) {externalCacheSave(this.interfaceFile, null)};
        };
        
        //return
        return;
     };
    // export
    module.exports.FileInfo = FileInfo;
    
    // end class FileInfo
    
    //end class FileInfo
    

//### export helper function setBaseInfo(aProjectDir, aOutDir, aTargetExt)
    function setBaseInfo(aProjectDir, aOutDir, aTargetExt){

        ////set module vars
        //projectDir = aProjectDir
        projectDir = aProjectDir;
        //outDir = aOutDir
        outDir = aOutDir;
        //targetExt = aTargetExt
        targetExt = aTargetExt;
    }
    // export
    module.exports.setBaseInfo = setBaseInfo;


//### export helper function relativeFrom(actualPath, destFilename) returns string
    function relativeFrom(actualPath, destFilename){

        ////relative to fromFileinfo.outFilename
        ////print "relativeFileRef(filename, fromFileinfo)"
        ////print filename
        ////print fromFileinfo.outDir
        ////print path.relative(fromFileinfo.outDir, filename)
        //return path.relative(actualPath, destFilename ) //from path, to filename/fullpath
        return path.relative(actualPath, destFilename); //from path, to filename/fullpath
    }
    // export
    module.exports.relativeFrom = relativeFrom;


//### export helper function resolvePath(text)
    function resolvePath(text){
        //return path.resolve(text)
        return path.resolve(text);
    }
    // export
    module.exports.resolvePath = resolvePath;

//### export helper function getDir(filename)
    function getDir(filename){
        ////dir name
        //return path.dirname(filename)
        return path.dirname(filename);
    }
    // export
    module.exports.getDir = getDir;
    
//----------

//### export helper function loadFile(filename)
    function loadFile(filename){
    ////------------------
    ////provide a loadFile function to the LiteScript environment.
    ////return file contents
    ////------------------
        //return fs.readFileSync(filename);
        return fs.readFileSync(filename);
    }
    // export
    module.exports.loadFile = loadFile;
    

//### export helper function externalCacheSave(filename, fileLines)
    function externalCacheSave(filename, fileLines){
    ////------------------
    ////provide a externalCacheSave (disk) function to the LiteScript environment
    //// receive a filename and an array of lines
    ////------------------
        //if no fileLines
        if (!fileLines) {
            //if fs.existsSync(filename)
            if (fs.existsSync(filename)) {
                ////remove file
                //fs.unlinkSync filename
                fs.unlinkSync(filename);
            };
        }
        else {

        //else 

            //// make sure output dir exists
            //mkPath.toFile(filename);
            mkPath.toFile(filename);

            //if fileLines instanceof Array 
            if (fileLines instanceof Array) {
                //declare fileLines:Array
                
                //fileLines=fileLines.join("\n")
                fileLines = fileLines.join("\n");
            };

            ////console.log('save file',filename,fileLines.length,'lines');

            //fs.writeFileSync filename,fileLines
            fs.writeFileSync(filename, fileLines);
        };
    }
    // export
    module.exports.externalCacheSave = externalCacheSave;


//### export helper function isBuiltInModule (name,prop)
    function isBuiltInModule(name, prop){

//Check for built in and global names
//return true if 'name' is a built-in node module

        ////ifdef PROD_C
        ////do nothing // if generating the compile-to-C compiler
        
        ////else

        //var isCoreModule = name in ['assert', 'buffer', 'child_process', 'cluster',
        var isCoreModule = ['assert', 'buffer', 'child_process', 'cluster', 'crypto', 'dgram', 'dns', 'events', 'fs', 'http', 'https', 'net', 'os', 'path', 'punycode', 'querystring', 'readline', 'repl', 'string_decoder', 'tls', 'tty', 'url', 'util', 'vm', 'zlib'].indexOf(name)>=0;
          //'crypto', 'dgram', 'dns', 'events', 'fs', 'http', 'https', 'net',
          //'os', 'path', 'punycode', 'querystring', 'readline', 'repl',
          //'string_decoder', 'tls', 'tty', 'url', 'util', 'vm', 'zlib']

        //if isCoreModule
        if (isCoreModule) {
            //if no prop, return true; //just asking: is core module?
            if (!prop) {return true};

            //var r = require(name); //load module
            var r = require(name); //load module
            //if r has property prop, return true; //is the member there?
            if (prop in r) {return true};
        };
    }
    // export
    module.exports.isBuiltInModule = isBuiltInModule;
            

        ////endif

//### export helper function isBuiltInObject(name)
    function isBuiltInObject(name){
    ////
    //// return true if 'name' is a javascript built-in object
    ////

        //return name in ['isNaN','parseFloat','parseInt','isFinite'
        return ['isNaN', 'parseFloat', 'parseInt', 'isFinite', 'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'eval', 'console', 'process', 'require'].indexOf(name)>=0;
    }
    // export
    module.exports.isBuiltInObject = isBuiltInObject;
            //,'decodeURI','decodeURIComponent'
            //,'encodeURI','encodeURIComponent'
            //,'eval','console'
            //,'process','require']


//### export helper function getGlobalObject(name)
    function getGlobalObject(name){
        
        //if targetExt is 'c'
        if (targetExt === 'c') {
            //return
            return;
        }
        else {
        //else
            ////ifdef PROD_C
            ////do nothing
            
            ////else
            //try 
            try{
                //return global[name]
                return global[name];
            
            }catch(e){
            
            //catch e
                //logger.error "Environment.getGlobalObject '#{name}'"
                logger.error("Environment.getGlobalObject '" + name + "'");
                //declare valid e.stack
                
                //logger.error e.stack
                logger.error(e.stack);
                //debugger
                debugger;
            };
        };
            
            ////endif

        //end if
        
    }
    // export
    module.exports.getGlobalObject = getGlobalObject;
    
//### export helper function fileInfoNewFile(name) returns FileInfo
    function fileInfoNewFile(name){

//create a fileInfo with paths and data for a file to be created

        //var importParam = new ImportParameterInfo
        var importParam = new ImportParameterInfo();
        //importParam.name = name
        importParam.name = name;
        //importParam.source="(compiler)"
        importParam.source = "(compiler)";
        //importParam.line=0
        importParam.line = 0;
        //importParam.createFile = true
        importParam.createFile = true;
        //var fileInfo = new FileInfo(importParam)
        var fileInfo = new FileInfo(importParam);
        //fileInfo.searchModule null
        fileInfo.searchModule(null);
        //return fileInfo
        return fileInfo;
    }
    // export
    module.exports.fileInfoNewFile = fileInfoNewFile;


//### export Class ImportParameterInfo
    // constructor
    function ImportParameterInfo(){ // default constructor
        //properties
            //name: string
            
            //source:string, line:number //position of "import" statement

            //isGlobalDeclare: boolean
            //globalImport: boolean
            //createFile: boolean
    };
    
    // export
    module.exports.ImportParameterInfo = ImportParameterInfo;
    
    // end class ImportParameterInfo
