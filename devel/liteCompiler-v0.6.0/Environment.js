//The 'Environment' object, must provide functions to load files,
//search modules in external cache, load and save from external cache (disk).

//The `Environment` abstraction helps us to support compile on server (nodejs) or the browser.

//Dependencies

   //global import fs, path
   var fs = require('fs');
   var path = require('path');

   //import mkPath, log
   var mkPath = require('./mkPath');
   var log = require('./log');
   var debug = log.debug;

   //export class FileInfo
   //constructor
    function FileInfo(importParameter){
     //properties
        //importParameter:string #: raw string passed to import/require
        //dirname:string #: path.dirname(importParameter)
        //extension:string #: path.extname(importParameter)
        //basename:string #: path.basname(importParameter, ext) #with out extensions
        //sourcename:string #: path.basname(importParameter, ext) #with  extensions
        //hasPath # true if starts with '.' or '/'
        //isCore # true if it's a core node module as 'fs' or 'path'
        //isLite #: true is extension is '.lite'|'.lite.md'
        //filename:string #: found full module filename
        //relPath:string # path.relative(basePath, this.dirname); //relative to basePath
        //relFilename
        //outFilename #: output file for code production
        //outRelFilename # path.relative(options.outBasePath, this.outFilename); //relative to basePath
        //outExtension
        //interfaceFile #: interface file (.[auto-]interface.md) declaring exports cache
        //interfaceFileExists #: if interfaceFileName file exists
        //externalCacheExists


       this.importParameter = importParameter;
       this.filename = importParameter;
       this.dirname = path.resolve(path.dirname(importParameter));
       this.hasPath = [path.delimiter, '.'].indexOf(importParameter[0])>=0;
       this.sourcename = path.basename(importParameter);
       this.extension = path.extname(importParameter);
       this.basename = path.basename(importParameter, this.extension);

        //#remove .lite from double extension .lite.md
       this.basename = this.basename.replace(/.lite$/, "");
    };


    //method searchModule(importingModuleFileInfo, options )
    FileInfo.prototype.searchModule = function(importingModuleFileInfo, options){

//------------------
//provide a searchModule function to the LiteScript environment
// to use to locate modules for the `import/require` statement
//------------------

       //default options =
       if(!options) options={};
       if(options.target===undefined) options.target='js';

        //declare on options
            //basePath,outBasePath

//check if it's a core module like 'fs' or 'path'

       //if no this.hasPath and no this.extension and isBuiltInModule(this.basename)
       if (!this.hasPath && !this.extension && isBuiltInModule(this.basename)) {
           this.isCore = true;
           this.isLite = false;
           return;
       };

//if parameter has no extension or extension is [.lite].md
//we search the module

       //if no this.extension or this.extension is '.md'
       if (!this.extension || this.extension === '.md') {

            //search the file
           var search = undefined;
           //if this.hasPath #specific path indicated
           if (this.hasPath) {// #specific path indicated
               search = path.resolve(importingModuleFileInfo.dirname, this.importParameter);
           }
           
           else {
                //search in node_modules, unless we're already in node_modules:
               //if path.basename(importingModuleFileInfo.dirname) is 'node_modules'
               if (path.basename(importingModuleFileInfo.dirname) === 'node_modules') {
                   search = path.join(importingModuleFileInfo.dirname, this.importParameter);
               }
               
               else {
                   search = path.join(importingModuleFileInfo.dirname, 'node_modules', this.importParameter);
               };
           };

           var full = undefined, found = undefined;
           //for each ext in ['.lite.md','.md','.interface.md','.js']
           var _list4=['.lite.md', '.md', '.interface.md', '.js'];
           for( var ext__inx=0,ext ; ext__inx<_list4.length ; ext__inx++){ext=_list4[ext__inx];
           
               full = search + ext;
               //if fs.existsSync(full)
               if (fs.existsSync(full)) {
                   found = full;
                   //break;
                   break;
               };
           }; // end for each in ['.lite.md', '.md', '.interface.md', '.js']

            //console.log(basePath);
            //console.log(full);

           //if not found
           if (!(found)) {
               log.throwControled('' + importingModuleFileInfo.relFilename + ': Module not found: ' + this.importParameter + '\n' + '\tSearched as:\n' + '\t#search(.lite.md|.md|.js)]');
           };

            //set filename & Recalc extension
           this.filename = path.resolve(full); //full path
           this.extension = path.extname(this.filename);
       }
       
       else {

            //other extensions
            //No compilation (only copy to output dir), and keep extension
           this.filename = path.resolve(importingModuleFileInfo.dirname, this.importParameter);
       };


        //recalc data from found file
       this.dirname = path.dirname(this.filename);
       this.sourcename = path.basename(this.filename);// #with extensions
       this.relPath = path.relative(options.basePath, this.dirname); //relative to basePath
       this.relFilename = path.relative(options.basePath, this.filename); //relative to basePath

        // based on result extension
       this.isLite = ['.md', '.lite'].indexOf(this.extension)>=0;
       this.outExtension = this.isLite ? "." + options.target : (this.extension || '.js');

       this.outFilename = path.join(options.outBasePath, this.relPath, this.basename + this.outExtension);
       this.outRelFilename = path.relative(options.outBasePath, this.outFilename); //relative to basePath

//Also calculate this.interfaceFile (cache of module exported names),
//check if the file exists, and if it is updated

       this.interfaceFile = path.join(this.dirname, this.basename + '.interface.md');
       var isCacheFile = undefined;
       //if fs.existsSync(this.interfaceFile)
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

//Check if interface cache is updated

       //if this.interfaceFileExists and isCacheFile
       if (this.interfaceFileExists && isCacheFile) {
            //get source date & time
           var stat = fs.statSync(this.filename);
            //declare on stat mtime
            //get interface date & time
           var statInterface = fs.statSync(this.interfaceFile);
            //declare on statInterface mtime
            //cache exists if source is older
           this.interfaceFileExists = (statInterface.mtime > stat.mtime);
           //if not this.interfaceFileExists, externalCacheSave this.interfaceFile,null //delete cache file if outdated
           if (!(this.interfaceFileExists)) {
               externalCacheSave(this.interfaceFile, null)};
       };

       debug(this);

       return;
    };
   //export
   module.exports.FileInfo = FileInfo;
   //end class FileInfo

   //end class FileInfo

   //export helper function setBasePath(filename, options)
   function setBasePath(filename, options){

        //declare on options
            //basePath,outBasePath,mainModuleName,outDir

       var fileInfo = new FileInfo(filename);
       options.basePath = fileInfo.dirname;
       options.mainModuleName = '.' + path.sep + fileInfo.basename;

       options.outBasePath = path.resolve(options.outDir);
   };
   //export
   module.exports.setBasePath=setBasePath;


   //export helper export function relName(filename,basePath)
   function relName(filename, basePath){
        //relative to basePath
       return path.relative(basePath, filename);
   };
   //export
   module.exports.relName=relName;

//----------

   //export function loadFile(filename)
   function loadFile(filename){
    //------------------
    //provide a loadFile function to the LiteScript environment.
    //return file contents
    //------------------
       return fs.readFileSync(filename);
   };
   //export
   module.exports.loadFile=loadFile;


   //export function externalCacheSave(filename, fileLines)
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
               fs.unlinkSync(filename);
           };
       }
       
       else {

            // make sure output dir exists
           mkPath.toFile(filename);

           //if fileLines instanceof Array
           if (fileLines instanceof Array) {
                //declare fileLines:Array
               fileLines = fileLines.join("\n");
           };

            //console.log('save file',filename,fileLines.length,'lines');

           fs.writeFileSync(filename, fileLines);
       };
   };
   //export
   module.exports.externalCacheSave=externalCacheSave;


    //------------------
    // Check for built in and global names
    //------------------

   //export function isBuiltInModule (name,prop)
   function isBuiltInModule(name, prop){
    //
    // return true if 'name' is a built-in node module
    //

      var isCoreModule = ['assert', 'buffer', 'child_process', 'cluster', 'crypto', 'dgram', 'dns', 'events', 'fs', 'http', 'https', 'net', 'os', 'path', 'punycode', 'querystring', 'readline', 'repl', 'string_decoder', 'tls', 'tty', 'url', 'util', 'vm', 'zlib'].indexOf(name)>=0;

      //if isCoreModule
      if (isCoreModule) {
           //if no prop, return true; //just asking: is core module?
           if (!prop) {
               return true};

           var r = require(name); //load module
           //if r has property prop, return true; //is the member there?
           if (prop in r) {
               return true};
      };
   };
   //export
   module.exports.isBuiltInModule=isBuiltInModule;


   //export function isBuiltInObject(name)
   function isBuiltInObject(name){
    //
    // return true if 'name' is a javascript built-in object
    //

       return ['isNaN', 'parseFloat', 'parseInt', 'isFinite', 'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'eval', 'console', 'process', 'require'].indexOf(name)>=0;
   };
   //export
   module.exports.isBuiltInObject=isBuiltInObject;


   //export function getGlobalObject(name)
   function getGlobalObject(name){
       //try
       try{
           return global[name];
       
       }catch(e){
           log.error("Environment.getGlobalObject '" + name + "'");
           log.error(e.stack);
           //debugger
           debugger;
       };
   };
   //export
   module.exports.getGlobalObject=getGlobalObject;




//Compiled by LiteScript compiler v0.5.0, source: /home/ltato/LiteScript/devel/source-v0.6.0/Environment.lite.md
//# sourceMappingURL=Environment.js.map
