//Compiled by LiteScript compiler v0.6.1, source: /home/ltato/LiteScript/devel/source-v0.6/Environment.lite.md
   var fs = require('fs');
   var path = require('path');
   var mkPath = require('./mkPath');
   var log = require('./log');
   var debug = log.debug;
   
    function FileInfo(importParameter){
       this.importParameter = importParameter;
       this.filename = importParameter;
       this.dirname = path.resolve(path.dirname(importParameter));
       this.hasPath = [path.delimiter, '.'].indexOf(importParameter[0])>=0;
       this.sourcename = path.basename(importParameter);
       this.extension = path.extname(importParameter);
       this.basename = path.basename(importParameter, this.extension);
       this.basename = this.basename.replace(/.lite$/, "");
    };
   
    FileInfo.prototype.searchModule = function(importingModuleFileInfo, options){
       if(!options) options={};
       if(options.target===undefined) options.target='js';
       
       if (!this.hasPath && !this.extension && isBuiltInModule(this.basename)) {
           this.isCore = true;
           this.isLite = false;
           return;
       };
       if (!this.extension || this.extension === '.md') {
           var search = undefined;
           if (this.hasPath) {
               search = path.resolve(importingModuleFileInfo.dirname, this.importParameter);
           }
           else {
               if (path.basename(importingModuleFileInfo.dirname) === 'node_modules') {
                   search = path.join(importingModuleFileInfo.dirname, this.importParameter);
               }
               else {
                   search = path.join(importingModuleFileInfo.dirname, 'node_modules', this.importParameter);
               };
           };
           var full = undefined, found = undefined;
           var _list4=['.lite.md', '.md', '.interface.md', '.js'];
           for( var ext__inx=0,ext ; ext__inx<_list4.length ; ext__inx++){ext=_list4[ext__inx];
           
               full = search + ext;
               if (fs.existsSync(full)) {
                   found = full;
                   break;
               };
           };
           if (!(found)) {
               log.throwControled('' + importingModuleFileInfo.relFilename + ': Module not found: ' + this.importParameter + '\n' + '\tSearched as:\n' + '\t' + search + '(.lite.md|.md|.js)]');
           };
           this.filename = path.resolve(full);
           this.extension = path.extname(this.filename);
       }
       else {
           this.filename = path.resolve(importingModuleFileInfo.dirname, this.importParameter);
       };
       this.dirname = path.dirname(this.filename);
       this.sourcename = path.basename(this.filename);
       this.relPath = path.relative(options.basePath, this.dirname);
       this.relFilename = path.relative(options.basePath, this.filename);
       this.isLite = ['.md', '.lite'].indexOf(this.extension)>=0;
       this.outExtension = this.isLite ? "." + options.target : (this.extension || '.js');
       this.outFilename = path.join(options.outBasePath, this.relPath, this.basename + this.outExtension);
       this.outRelFilename = path.relative(options.outBasePath, this.outFilename);
       this.interfaceFile = path.join(this.dirname, this.basename + '.interface.md');
       var isCacheFile = undefined;
       if (fs.existsSync(this.interfaceFile)) {
           this.interfaceFileExists = true;
           isCacheFile = false;
       }
       else {
           this.interfaceFile = path.join(this.dirname, this.basename + '.cache-interface.md');
           isCacheFile = true;
           this.interfaceFileExists = fs.existsSync(this.interfaceFile);
       };
       if (this.interfaceFileExists && isCacheFile) {
           var stat = fs.statSync(this.filename);
           
           var statInterface = fs.statSync(this.interfaceFile);
           
           this.interfaceFileExists = (statInterface.mtime > stat.mtime);
           if (!(this.interfaceFileExists)) {
               externalCacheSave(this.interfaceFile, null)};
       };
       debug(this);
       return;
    };
   
   module.exports.FileInfo = FileInfo;
   FileInfo
   
   function setBasePath(filename, options){
       
       var fileInfo = new FileInfo(filename);
       options.basePath = fileInfo.dirname;
       options.mainModuleName = '.' + path.sep + fileInfo.basename;
       options.outBasePath = path.resolve(options.outDir);
   };
   
   module.exports.setBasePath=setBasePath;
   function relName(filename, basePath){
       return path.relative(basePath, filename);
   };
   
   module.exports.relName=relName;
   function loadFile(filename){
       return fs.readFileSync(filename);
   };
   
   module.exports.loadFile=loadFile;
   function externalCacheSave(filename, fileLines){
       if (!fileLines) {
           if (fs.existsSync(filename)) {
               fs.unlinkSync(filename);
           };
       }
       else {
           mkPath.toFile(filename);
           if (fileLines instanceof Array) {
               
               fileLines = fileLines.join("\n");
           };
           fs.writeFileSync(filename, fileLines);
       };
   };
   
   module.exports.externalCacheSave=externalCacheSave;
   function isBuiltInModule(name, prop){
      var isCoreModule = ['assert', 'buffer', 'child_process', 'cluster', 'crypto', 'dgram', 'dns', 'events', 'fs', 'http', 'https', 'net', 'os', 'path', 'punycode', 'querystring', 'readline', 'repl', 'string_decoder', 'tls', 'tty', 'url', 'util', 'vm', 'zlib'].indexOf(name)>=0;
      if (isCoreModule) {
           if (!prop) {
               return true};
           var r = require(name);
           if (prop in r) {
               return true};
      };
   };
   
   module.exports.isBuiltInModule=isBuiltInModule;
   function isBuiltInObject(name){
       return ['isNaN', 'parseFloat', 'parseInt', 'isFinite', 'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'eval', 'console', 'process', 'require'].indexOf(name)>=0;
   };
   
   module.exports.isBuiltInObject=isBuiltInObject;
   function getGlobalObject(name){
       try{
           return global[name];
       
       }catch(e){
           log.error("Environment.getGlobalObject '" + name + "'");
           log.error(e.stack);
           debugger;
       };
   };
   
   module.exports.getGlobalObject=getGlobalObject;