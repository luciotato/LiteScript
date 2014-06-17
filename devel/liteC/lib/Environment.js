//Compiled by LiteScript compiler v0.7.0, source: /home/ltato/LiteScript/devel/source-v0.8/Environment.lite.md
// The 'Environment' object, must provide functions to load files,
// search modules in external cache, load and save from external cache (disk).

// The `Environment` abstraction helps us to support compile on server (nodejs) or the browser.

// Dependencies

   // global import fs, path
   var fs = require('fs');
   var path = require('path');

   // import mkPath, log
   var mkPath = require('./mkPath');
   var log = require('./log');
   var debug = log.debug;

   // export class FileInfo
   // constructor
    function FileInfo(info){
     // properties
        // importInfo:ImportParameterInfo #: .name, .globalImport .interface - info passed to new
        // dirname:string #: path.dirname(importParameter)
        // extension:string #: path.extname(importParameter)
        // basename:string #: path.basname(importParameter, ext) #with out extensions
        // sourcename:string #: path.basname(importParameter, ext) #with  extensions
        // hasPath # true if starts with '.' or '/'
        // isCore # true if it's a core node module as 'fs' or 'path'
        // isLite #: true is extension is '.lite'|'.lite.md'
        // filename:string #: found full module filename
        // relPath:string # path.relative(basePath, this.dirname); //relative to basePath
        // relFilename: string
        // outFilename: string # output file for code production
        // outRelFilename: string # path.relative(options.outBasePath, this.outFilename); //relative to basePath
        // outExtension: string
        // outFileIsNewer: boolean # true if generated file is newer than source
        // interfaceFile: string #: interface file (.[auto-]interface.md) declaring exports cache
        // interfaceFileExists: boolean #: if interfaceFileName file exists
        // externalCacheExists: boolean

       var name = info.name;
       this.importInfo = info;
       this.filename = name;
       this.dirname = path.resolve(path.dirname(name));
       this.hasPath = [path.delimiter, '.'].indexOf(name[0])>=0;
       this.sourcename = path.basename(name);
       this.extension = path.extname(name);
       this.basename = path.basename(name, this.extension);

        // #remove .lite from double extension .lite.md
       this.basename = this.basename.replace(/.lite$/, "");
    };


    // method searchModule(importingModuleFileInfo, options )
    FileInfo.prototype.searchModule = function(importingModuleFileInfo, options){

//------------------
//provide a searchModule function to the LiteScript environment
// to use to locate modules for the `import/require` statement
//------------------

        // #log.debug "searchModule #{JSON.stringify(this)}"

       // default options =
       if(!options) options={};
       if(options.target===undefined) options.target='c';
            // #else
            //target: 'js'
            // #endif

        // declare on options
            // basePath,outBasePath,browser

// check if it's a node global module (if require() parameter do not start with '.' or './')
// if compiling for node, and "global import" and no extension, asume global lib or core module

       // if this.importInfo.globalImport and no this.hasPath
       if (this.importInfo.globalImport && !this.hasPath) {
           this.isCore = isBuiltInModule(this.basename);// #core module like 'fs' or 'path'
           this.isLite = false;
           return;
       };

// if parameter has no extension or extension is [.lite].md
// we search the module

       var full = undefined, found = undefined;

       // if this.importInfo.createFile
       if (this.importInfo.createFile) {
           full = path.join(options.basePath, this.importInfo.name);
       }
       
       else {
            //search the file
           var search = undefined;
           // if this.hasPath #specific path indicated
           if (this.hasPath) {// #specific path indicated
               search = [path.resolve(importingModuleFileInfo.dirname, this.importInfo.name)];
           }
           
           else {
                // #normal: search local ./lib & ../lib
               search = [path.join(importingModuleFileInfo.dirname, this.importInfo.name), path.join(importingModuleFileInfo.dirname, '/lib', this.importInfo.name), path.join(importingModuleFileInfo.dirname, '../lib', this.importInfo.name)];
           };

           // for each item in search where not found
           for( var item__inx=0,item ; item__inx<search.length ; item__inx++){item=search[item__inx];
           if(!(found)){
               // for each ext in ['.lite.md','.md','.interface.md','.js'] where not found
               var _list3=['.lite.md', '.md', '.interface.md', '.js'];
               for( var ext__inx=0,ext ; ext__inx<_list3.length ; ext__inx++){ext=_list3[ext__inx];
               if(!(found)){
                   // if fs.existsSync(item+ext into full)
                   if (fs.existsSync((full=item + ext))) {
                       found = full;
                   };
               }};// end for each in ['.lite.md', '.md', '.interface.md', '.js']
               
           }};// end for each in search

            //console.log(basePath);
            //log.debug full

           // if not found
           if (!(found)) {
               log.throwControled('' + importingModuleFileInfo.relFilename + ': Module not found: ' + this.importInfo.name + '\n' + '\tSearched as: ' + this.importInfo.name + ' (options.browser=' + options.browser + ')\n' + '\t' + search + '(.lite.md|.md|.interface.md|.js)]');
           };
       };

       // end if

        //set filename & Recalc extension
       this.filename = path.resolve(full); //full path
       this.extension = path.extname(this.filename);

        //else

            //other extensions
            //No compilation (only copy to output dir), and keep extension
        //    this.filename = path.resolve(importingModuleFileInfo.dirname,this.importInfo.name);


        //recalc data from found file
       this.dirname = path.dirname(this.filename);
       this.sourcename = path.basename(this.filename);// #with extensions
       this.relPath = path.relative(options.basePath, this.dirname); //relative to basePath
       this.relFilename = path.relative(options.basePath, this.filename); //relative to basePath

        // based on result extension
       this.isLite = ['.md', '.lite'].indexOf(this.extension)>=0;
       this.outExtension = !(this.isLite) && this.extension ? this.extension : "." + options.target;

       this.outFilename = path.join(options.outBasePath, this.relPath, this.basename + this.outExtension);
       this.outRelFilename = path.relative(options.outBasePath, this.outFilename); //relative to basePath

        //print JSON.stringify(this,null,2)

       // if this.importInfo.createFile, return #we're creating this file
       if (this.importInfo.createFile) {return};

// Check if outFile exists, but is older than Source

        //get source date & time
       var sourceStat = fs.statSync(this.filename);
        // declare on sourceStat mtime

       // if fs.existsSync(this.outFilename)
       if (fs.existsSync(this.outFilename)) {
            //get generated date & time
           var statGenerated = fs.statSync(this.outFilename);
            // declare on statGenerated mtime
            //if source is older
           this.outFileIsNewer = (statGenerated.mtime > sourceStat.mtime);
       };

//         console.log this.filename
//         console.log sourceStat.mtime
//         console.log this.outFilename
//         if statGenerated, console.log statGenerated.mtime
//         console.log this.outFileIsNewer
//         

// Also calculate this.interfaceFile (cache of module exported names),
// check if the file exists, and if it is updated

       this.interfaceFile = path.join(this.dirname, this.basename + '.interface.md');
        // #log.debug this.interfaceFile
       var isCacheFile = undefined;
       // if fs.existsSync(this.interfaceFile)
       if (fs.existsSync(this.interfaceFile)) {
           this.interfaceFileExists = true;
           isCacheFile = false;
       }
       
       else {
            //set for auto-generated interface
           this.interfaceFile = path.join(this.dirname, this.basename + '.cache-interface.md');
           isCacheFile = true;
           this.interfaceFileExists = fs.existsSync(this.interfaceFile);
       };

// Check if interface cache is updated

       // if this.interfaceFileExists and isCacheFile
       if (this.interfaceFileExists && isCacheFile) {
            //get interface date & time
           var statInterface = fs.statSync(this.interfaceFile);
            // declare on statInterface mtime
            //cache exists if source is older
           this.interfaceFileExists = (statInterface.mtime > sourceStat.mtime);
           // if not this.interfaceFileExists, externalCacheSave this.interfaceFile,null //delete cache file if outdated
           if (!(this.interfaceFileExists)) {externalCacheSave(this.interfaceFile, null)};
       };

       return;
    };
   // export
   module.exports.FileInfo = FileInfo;
   // end class FileInfo

   // end class FileInfo

   // export helper function setBasePath(filename, options)
   function setBasePath(filename, options){

        // declare on options
            // basePath,outBasePath,mainModuleName,outDir

       var fileInfo = new FileInfo({name: filename});
       options.basePath = fileInfo.dirname;
       options.mainModuleName = '.' + path.sep + fileInfo.basename;

       options.outBasePath = path.resolve(options.outDir);
   };
   // export
   module.exports.setBasePath=setBasePath;


   // export helper function relName(filename,basePath)
   function relName(filename, basePath){
        //relative to basePath
       return path.relative(basePath, filename);
   };
   // export
   module.exports.relName=relName;

// ----------

   // export helper function loadFile(filename)
   function loadFile(filename){
    //------------------
    //provide a loadFile function to the LiteScript environment.
    //return file contents
    //------------------
       return fs.readFileSync(filename);
   };
   // export
   module.exports.loadFile=loadFile;


   // export helper function externalCacheSave(filename, fileLines)
   function externalCacheSave(filename, fileLines){
    //------------------
    //provide a externalCacheSave (disk) function to the LiteScript environment
    // receive a filename and an array of lines
    //------------------
       // if no fileLines
       if (!fileLines) {
           // if fs.existsSync(filename)
           if (fs.existsSync(filename)) {
                //remove file
               fs.unlinkSync(filename);
           };
       }
       
       else {

            // make sure output dir exists
           mkPath.toFile(filename);

           // if fileLines instanceof Array
           if (fileLines instanceof Array) {
                // declare fileLines:Array
               fileLines = fileLines.join("\n");
           };

            //console.log('save file',filename,fileLines.length,'lines');

           fs.writeFileSync(filename, fileLines);
       };
   };
   // export
   module.exports.externalCacheSave=externalCacheSave;


   // export helper function isBuiltInModule (name,prop)
   function isBuiltInModule(name, prop){

    //------------------
    // Check for built in and global names
    //------------------

    //
    // return true if 'name' is a built-in node module
    //

      var isCoreModule = ['assert', 'buffer', 'child_process', 'cluster', 'crypto', 'dgram', 'dns', 'events', 'fs', 'http', 'https', 'net', 'os', 'path', 'punycode', 'querystring', 'readline', 'repl', 'string_decoder', 'tls', 'tty', 'url', 'util', 'vm', 'zlib'].indexOf(name)>=0;

      // if isCoreModule
      if (isCoreModule) {
           // if no prop, return true; //just asking: is core module?
           if (!prop) {return true};

           var r = require(name); //load module
           // if r has property prop, return true; //is the member there?
           if (prop in r) {return true};
      };
   };
   // export
   module.exports.isBuiltInModule=isBuiltInModule;


   // export helper function isBuiltInObject(name)
   function isBuiltInObject(name){
    //
    // return true if 'name' is a javascript built-in object
    //

       return ['isNaN', 'parseFloat', 'parseInt', 'isFinite', 'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'eval', 'console', 'process', 'require'].indexOf(name)>=0;
   };
   // export
   module.exports.isBuiltInObject=isBuiltInObject;


   // export helper function getGlobalObject(name)
   function getGlobalObject(name){
       // try
       try{
           return global[name];
       
       }catch(e){
           log.error("Environment.getGlobalObject '" + name + "'");
            // declare valid e.stack
           log.error(e.stack);
           // debugger
           debugger;
       };
   };
   // export
   module.exports.getGlobalObject=getGlobalObject;


   // export helper function fileInfoNewFile(name,options) returns FileInfo
   function fileInfoNewFile(name, options){

// create a fileInfo with paths and data for a file to be created

       var fileInfo = new FileInfo({name: name, createFile: true});
       fileInfo.searchModule(null, options);
       return fileInfo;
   };
   // export
   module.exports.fileInfoNewFile=fileInfoNewFile;


   // export class ImportParameterInfo
   // constructor
   function ImportParameterInfo(){
        // properties
            // name: string
            // interface: boolean
            // globalImport: boolean
            // createFile: boolean
   };
   
   // export
   module.exports.ImportParameterInfo = ImportParameterInfo;
   // end class ImportParameterInfo


