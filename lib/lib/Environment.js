//search modules in external cache, load and save from external cache (disk).

//The `Environment` abstraction helps us to support compile on server (nodejs) or the browser.

//Dependencies

    //import fs, path
    var fs = require('fs');
    var path = require('path');

    //import mkPath, logger, GeneralOptions
    var mkPath = require('./mkPath.js');
    var logger = require('./logger.js');
    var GeneralOptions = require('./GeneralOptions.js');

//Module vars

    //public var options: GeneralOptions
    var options = undefined;
    // export
    module.exports.options = options;


    //    export class FileInfo
    // constructor
    function FileInfo(info){
     //     properties

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
        //this.isInterface = '.interface.' in this.sourcename
        this.isInterface = this.sourcename.indexOf('.interface.')>=0;
        //this.extension = path.extname(name)
        this.extension = path.extname(name);
        //this.base = path.basename(name,this.extension)
        this.base = path.basename(name, this.extension);

        //#remove .lite from double extension .lite.md
        //if this.base.endsWith('.lite'), this.base=this.base.slice(0,-5)
        if (this.base.endsWith('.lite')) {this.base = this.base.slice(0, -5)};
     };

     //     method outWithExtension(ext)
     FileInfo.prototype.outWithExtension = function(ext){
        //return path.join(.outDir,"#{.base}#{ext}")
        return path.join(this.outDir, '' + this.base + ext);
     };

     //     method searchModule(importingModuleDir:string)
     FileInfo.prototype.searchModule = function(importingModuleDir){

//------------------
//provide a searchModule function to the LiteScript environment
// to use to locate modules for the `import/require` statement
//------------------

        //#logger.debug "searchModule #{JSON.stringify(this)}"

//check if it's a node global module (if require() parameter do not start with '.' or './')
//if compiling for node, and "global import" and no extension, asume global lib or core module

        //ifndef TARGET_C //"require() hack" not possible in .c
        //if .importInfo.globalImport and options.target is 'js'
        if (this.importInfo.globalImport && module.exports.options.target === 'js') {
        
            // if running on node.js and global import ASSSUME core node module / installed node_modules
            //this.isCore = isBuiltInModule(this.base) #core module like 'fs' or 'path'
            this.isCore = isBuiltInModule(this.base);
            //this.isLite = false
            this.isLite = false;
            //return
            return;
        };
        //endif

//if parameter has no extension or extension is [.lite].md
//we search the module

        //var full, found, foundIndex=-1, includeDirsIndex=1
        var 
           full = undefined
           , found = undefined
           , foundIndex = -1
           , includeDirsIndex = 1
        ;

        //if this.importInfo.createFile
        if (this.importInfo.createFile) {
        
            //full = path.join(options.projectDir, this.importInfo.name)
            full = path.join(module.exports.options.projectDir, this.importInfo.name);
        }
        //if this.importInfo.createFile
        
        else {
            //search the file
            //var search = [ importingModuleDir ]
            var search = [importingModuleDir];
            //if this.hasPath #specific path indicated
            if (this.hasPath) {
            
                //do nothing // only search at specified dir
                null;
            }
            //if this.hasPath #specific path indicated
            
            else {
                //#normal: search local ./ & .[projectDir]/lib & .[projectDir]/interfaces & -i dirs
                //search.push
                    //path.join(options.projectDir,'/lib')
                    //path.join(options.projectDir,'/interfaces')
                    //path.join(options.projectDir,'../lib')
                    //path.join(options.projectDir,'../interfaces')

//if we're generating c-code a "global import" of core modules like "path" and "fs",
//gets redirected to dir `ENV_C_global_import` or `../ENV_C_global_import`

                //if options.target is 'c'
                search.push(path.join(module.exports.options.projectDir, '/lib'), path.join(module.exports.options.projectDir, '/interfaces'), path.join(module.exports.options.projectDir, '../lib'), path.join(module.exports.options.projectDir, '../interfaces'));

//if we're generating c-code a "global import" of core modules like "path" and "fs",
//gets redirected to dir `ENV_C_global_import` or `../ENV_C_global_import`

                //if options.target is 'c'
                if (module.exports.options.target === 'c') {
                
                    // prepend interfaces/C_standalone to found "path" "fs" and other
                    // core node-js modules (migrated to Litescript and/or native-c)
                    //search.unshift
                        //path.join(options.projectDir,'/interfaces/C_standalone')
                        //path.join(options.projectDir,'../interfaces/C_standalone')
                //end if
                    search.unshift(path.join(module.exports.options.projectDir, '/interfaces/C_standalone'), path.join(module.exports.options.projectDir, '../interfaces/C_standalone'));
                };
                //end if

//include command-line (-i foo/bar) specified dirs

                //for each extra in options.includeDirs
                

//include command-line (-i foo/bar) specified dirs

                //for each extra in options.includeDirs
                for( var extra__inx=0,extra ; extra__inx<module.exports.options.includeDirs.length ; extra__inx++){extra=module.exports.options.includeDirs[extra__inx];
                
                    //search.push path.resolve(options.projectDir,extra)
                    search.push(path.resolve(module.exports.options.projectDir, extra));
                };// end for each in module.exports.options.includeDirs

//add compiler directory to "include dirs" so GlobalScopeX.interface.md can be found

                //includeDirsIndex = search.length
                includeDirsIndex = search.length;
                //if __dirname
                if (__dirname) {
                

                    //if options.target is 'c' //include first: /interfaces/C_standalone'
                    if (module.exports.options.target === 'c') {
                    
                        //search.push path.resolve('#{__dirname}/../interfaces/C_standalone')
                        search.push(path.resolve('' + __dirname + '/../interfaces/C_standalone'));
                    };
                    //end if

                    //search.push path.resolve('#{__dirname}/../interfaces')
                    

                    //search.push path.resolve('#{__dirname}/../interfaces')
                    search.push(path.resolve('' + __dirname + '/../interfaces'));
                };
                //end if


//Now search the file in all specidief dirs/with all the extensions

            //for each dirIndex,dir in search
                
            };


//Now search the file in all specidief dirs/with all the extensions

            //for each dirIndex,dir in search
            for( var dirIndex=0,dir ; dirIndex<search.length ; dirIndex++){dir=search[dirIndex];
            
                //var fname = path.join(dir,this.importInfo.name)
                var fname = path.join(dir, this.importInfo.name);
                //for each ext in ['.lite.md','.md','.interface.md','.js']
                var _list5=['.lite.md', '.md', '.interface.md', '.js'];
                for( var ext__inx=0,ext ; ext__inx<_list5.length ; ext__inx++){ext=_list5[ext__inx];
                
                    //full = fname & ext
                    full = fname + ext;
                    //if fs.existsSync(full)
                    if (fs.existsSync(full)) {
                    
                        //found=full
                        found = full;
                        //foundIndex=dirIndex
                        foundIndex = dirIndex;
                        //break
                        break;
                    };
                };// end for each in ['.lite.md', '.md', '.interface.md', '.js']
                //end for
                //if found, break
                
                //if found, break
                if (found) {break};
            };// end for each in search
            //end for

            //console.log(basePath);
            //logger.debug full

            //#try \t#{search.join('\n\t')}

            //if not found
            

            //console.log(basePath);
            //logger.debug full

            //#try \t#{search.join('\n\t')}

            //if not found
            if (!(found)) {
            
                //logger.throwControlled '' + .importInfo.source + ":" + .importInfo.line + ":1 Module not found: " + .importInfo.name + "\nSearched as:\n" + (search.join('\n')) + "\n   with extensions (.lite.md|.md|.interface.md|.js)"
                logger.throwControlled('' + this.importInfo.source + ":" + this.importInfo.line + ":1 Module not found: " + this.importInfo.name + "\nSearched as:\n" + (search.join('\n')) + "\n   with extensions (.lite.md|.md|.interface.md|.js)");
            };
        };

        //end if

        //set filename & Recalc extension
        //this.filename =  path.resolve(full); //full path
        

        //set filename & Recalc extension
        //this.filename =  path.resolve(full); //full path
        this.filename = path.resolve(full);
        //this.extension = path.extname(this.filename);
        this.extension = path.extname(this.filename);

        //else

            //other extensions
            //No compilation (only copy to output dir), and keep extension
        //    this.filename = path.resolve(importingModuleDirname,this.importInfo.name);


        //recalc data from found file
        //this.dir = path.dirname(this.filename);
        this.dir = path.dirname(this.filename);
        //this.sourcename = path.basename(this.filename); #with extensions
        this.sourcename = path.basename(this.filename);
        //this.isInterface = this.sourcename.indexOf('.interface.') isnt -1
        this.isInterface = this.sourcename.indexOf('.interface.') !== -1;
        //this.relFilename = path.relative(options.projectDir, this.filename); //relative project path
        this.relFilename = path.relative(module.exports.options.projectDir, this.filename);
        //this.relPath = path.relative(options.projectDir, this.dir); //relative to project path
        this.relPath = path.relative(module.exports.options.projectDir, this.dir);

        // based on result extension
        //this.isLite = this.extension in ['.md','.lite']
        this.isLite = ['.md', '.lite'].indexOf(this.extension)>=0;
        //this.outExtension = not this.isLite and this.extension? this.extension else ".#{options.target}"
        this.outExtension = !(this.isLite) && this.extension ? this.extension : "." + module.exports.options.target;

        //this.outDir = path.join(options.outDir, this.relPath)
        this.outDir = path.join(module.exports.options.outDir, this.relPath);
        //if this.outDir.slice(0,options.outDir.length) isnt options.outDir // the out path is outside inicated path
        if (this.outDir.slice(0, module.exports.options.outDir.length) !== module.exports.options.outDir) {
        
            //mainly because .. on the found file.
            // fix it to be inside options.outDir
            //this.outDir = path.join(options.outDir, path.basename(this.dir)) // use only one last dir
            this.outDir = path.join(module.exports.options.outDir, path.basename(this.dir));
        };

        //this.outFilename = path.join(this.outDir, "#{this.base}#{this.outExtension}");
        this.outFilename = path.join(this.outDir, '' + this.base + this.outExtension);
        //this.outRelFilename = path.relative(options.outDir, this.outFilename); //relative to options.outDir
        this.outRelFilename = path.relative(module.exports.options.outDir, this.outFilename);

        //print JSON.stringify(this,null,2)

        //if this.importInfo.createFile, return #we're creating this file
        if (this.importInfo.createFile) {return};

//Check if outFile exists, but is older than Source

        //get source date & time
        //var sourceStat = fs.statSync(this.filename);
        var sourceStat = fs.statSync(this.filename);
        //declare on sourceStat mtime
        

        //if fs.existsSync(this.outFilename)
        if (fs.existsSync(this.outFilename)) {
        
            //get generated date & time
            //var statGenerated = fs.statSync(this.outFilename);
            var statGenerated = fs.statSync(this.outFilename);
            //declare on statGenerated mtime
            
            //if source is older
            //this.outFileIsNewer = (statGenerated.mtime > sourceStat.mtime );
            this.outFileIsNewer = (statGenerated.mtime > sourceStat.mtime);
        };

//
//        console.log this.filename
//        console.log sourceStat.mtime
//        console.log this.outFilename
//        if statGenerated, console.log statGenerated.mtime
//        console.log this.outFileIsNewer
//        

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
        //if fs.existsSync(this.interfaceFile)
        
        else {
            //set for auto-generated interface
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
        
            //get interface date & time
            //var statInterface = fs.statSync(this.interfaceFile);
            var statInterface = fs.statSync(this.interfaceFile);
            //declare on statInterface mtime
            
            //cache exists if source is older
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

    //    export helper function setBaseInfo(projectOptions)
    

    //    export helper function setBaseInfo(projectOptions)
    function setBaseInfo(projectOptions){

        //set module vars
        //options = projectOptions
        module.exports.options = projectOptions;
    }
    // export
    module.exports.setBaseInfo = setBaseInfo;


    //    export helper function relativeFrom(actualPath, destFilename) returns string
    function relativeFrom(actualPath, destFilename){

        //relative to fromFileinfo.outFilename
        //print "relativeFileRef(filename, fromFileinfo)"
        //print filename
        //print fromFileinfo.outDir
        //print path.relative(fromFileinfo.outDir, filename)
        //return path.relative(actualPath, destFilename ) //from path, to filename/fullpath
        return path.relative(actualPath, destFilename);
    }
    // export
    module.exports.relativeFrom = relativeFrom;


    //    export helper function resolvePath(text)
    function resolvePath(text){
        //return path.resolve(text)
        return path.resolve(text);
    }
    // export
    module.exports.resolvePath = resolvePath;

    //    export helper function getDir(filename)
    function getDir(filename){
        //dir name
        //return path.dirname(filename)
        return path.dirname(filename);
    }
    // export
    module.exports.getDir = getDir;

//----------

    //    export helper function loadFile(filename)
    function loadFile(filename){
    //------------------
    //provide a loadFile function to the LiteScript environment.
    //return file contents
    //------------------
        //return fs.readFileSync(filename);
        return fs.readFileSync(filename);
    }
    // export
    module.exports.loadFile = loadFile;


    //    export helper function externalCacheSave(filename, fileLines)
    function externalCacheSave(filename, fileLines){
    //------------------
    //provide a externalCacheSave (disk) function to the LiteScript environment
    // receive a filename and an array of lines
    //------------------
        //if no fileLines
        if (!fileLines) {
        
            //if fs.existsSync(filename)
            if (fs.existsSync(filename)) {
            
                //remove file
                //fs.unlinkSync filename
                fs.unlinkSync(filename);
            };
        }
        //if no fileLines
        
        else {

            // make sure output dir exists
            //mkPath.toFile(filename);
            mkPath.toFile(filename);

            //if fileLines instanceof Array
            if (fileLines instanceof Array) {
            
                //declare fileLines:Array
                
                //fileLines=fileLines.join("\n")
                fileLines = fileLines.join("\n");
            };

            //console.log('save file',filename,fileLines.length,'lines');

            //fs.writeFileSync filename,fileLines
            fs.writeFileSync(filename, fileLines);
        };
    }
    // export
    module.exports.externalCacheSave = externalCacheSave;


    //    export helper function isBuiltInModule (name,prop)
    function isBuiltInModule(name, prop){

//Check for built in and global names
//return true if 'name' is a built-in node module

        //ifdef TARGET_C
        //do nothing // if generating the compile-to-C compiler

        //else

        //var isCoreModule = name in ['assert', 'buffer', 'child_process', 'cluster',
          //'crypto', 'dgram', 'dns', 'events', 'fs', 'http', 'https', 'net',
          //'os', 'path', 'punycode', 'querystring', 'readline', 'repl',
          //'string_decoder', 'tls', 'tty', 'url', 'util', 'vm', 'zlib']
        var isCoreModule = ['assert', 'buffer', 'child_process', 'cluster', 'crypto', 'dgram', 'dns', 'events', 'fs', 'http', 'https', 'net', 'os', 'path', 'punycode', 'querystring', 'readline', 'repl', 'string_decoder', 'tls', 'tty', 'url', 'util', 'vm', 'zlib'].indexOf(name)>=0;

        //if isCoreModule
        if (isCoreModule) {
        
            //if no prop, return true; //just asking: is core module?
            if (!prop) {return true};

            //var r = require(name); //load module
            var r = require(name);
            //if r has property prop, return true; //is the member there?
            if (prop in r) {return true};
        };
    }
    // export
    module.exports.isBuiltInModule = isBuiltInModule;


        //endif

    //    export helper function isBuiltInObject(name)
    function isBuiltInObject(name){
    //
    // return true if 'name' is a javascript built-in object
    //

        //return name in ['isNaN','parseFloat','parseInt','isFinite'
            //,'decodeURI','decodeURIComponent'
            //,'encodeURI','encodeURIComponent'
            //,'eval','console'
            //,'process','require']
        return ['isNaN', 'parseFloat', 'parseInt', 'isFinite', 'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'eval', 'console', 'process', 'require'].indexOf(name)>=0;
    }
    // export
    module.exports.isBuiltInObject = isBuiltInObject;


    //    export helper function getGlobalObject(name)
    function getGlobalObject(name){

        //if options.target is 'c'
        if (module.exports.options.target === 'c') {
        
            //return
            return;
        }
        //if options.target is 'c'
        
        else {
            //ifdef TARGET_C
            //do nothing

            //else
            //try
            try{
                //return global[name]
                return global[name];
            
            }catch(e){
                //logger.error "Environment.getGlobalObject '#{name}'"
                logger.error("Environment.getGlobalObject '" + name + "'");
                //logger.error 'stack:',e.stack
                logger.error('stack:', e.stack);
                //debugger
                debugger;
            };
        };

            //endif

        //end if

    //    export helper function fileInfoNewFile(name) returns FileInfo
        
    }
    // export
    module.exports.getGlobalObject = getGlobalObject;

    //    export helper function fileInfoNewFile(name) returns FileInfo
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


    //    export class ImportParameterInfo
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
