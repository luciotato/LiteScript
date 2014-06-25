//Compiled by LiteScript compiler v0.7.0, source: /home/ltato/LiteScript/devel/source-v0.7/Environment.lite.md
   var fs = require('fs');
   var path = require('path');
   var mkPath = require('./mkPath');
   var log = require('./log');
   var debug = log.debug;
   
    function FileInfo(info){
       var name = info.name;
       this.importInfo = info;
       this.filename = name;
       this.dirname = path.resolve(path.dirname(name));
       this.hasPath = [path.delimiter, '.'].indexOf(name[0])>=0;
       this.sourcename = path.basename(name);
       this.extension = path.extname(name);
       this.basename = path.basename(name, this.extension);
       this.basename = this.basename.replace(/.lite$/, "");
    };
   
    FileInfo.prototype.searchModule = function(importingModuleFileInfo, options){
       if(!options) options={};
       if(options.target===undefined) options.target='js';
       
       if (this.importInfo.globalImport && !this.hasPath) {
           this.isCore = isBuiltInModule(this.basename);
           this.isLite = false;
           return;
       };
       var full = undefined, found = undefined;
       if (this.importInfo.createFile) {
           full = path.join(options.basePath, this.importInfo.name);
       }
       else {
           var search = undefined;
           if (this.hasPath) {
               search = [path.resolve(importingModuleFileInfo.dirname, this.importInfo.name)];
           }
           else {
               search = [path.join(importingModuleFileInfo.dirname, this.importInfo.name), path.join(importingModuleFileInfo.dirname, '/lib', this.importInfo.name), path.join(importingModuleFileInfo.dirname, '../lib', this.importInfo.name)];
           };
           for( var item__inx=0,item ; item__inx<search.length ; item__inx++){item=search[item__inx];
             if(!(found)){
               var _list4=['.lite.md', '.md', '.interface.md', '.js'];
               for( var ext__inx=0,ext ; ext__inx<_list4.length ; ext__inx++){ext=_list4[ext__inx];
                 if(!(found)){
                   if (fs.existsSync((full=item + ext))) {
                       found = full;
                   };
               }};
               
           }};
           if (!(found)) {
               log.throwControled('' + importingModuleFileInfo.relFilename + ': Module not found: ' + this.importInfo.name + '\n' + '\tSearched as: ' + this.importInfo.name + ' (options.browser=' + options.browser + ')\n' + '\t' + search + '(.lite.md|.md|.interface.md|.js)]');
           };
       };
       
       this.filename = path.resolve(full);
       this.extension = path.extname(this.filename);
       this.dirname = path.dirname(this.filename);
       this.sourcename = path.basename(this.filename);
       this.relPath = path.relative(options.basePath, this.dirname);
       this.relFilename = path.relative(options.basePath, this.filename);
       this.isLite = ['.md', '.lite'].indexOf(this.extension)>=0;
       this.outExtension = !(this.isLite) && this.extension ? this.extension : "." + options.target;
       this.outFilename = path.join(options.outBasePath, this.relPath, this.basename + this.outExtension);
       this.outRelFilename = path.relative(options.outBasePath, this.outFilename);
       if (this.importInfo.createFile) {return;};
       var sourceStat = fs.statSync(this.filename);
       
       if (fs.existsSync(this.outFilename)) {
           var statGenerated = fs.statSync(this.outFilename);
           
           this.outFileIsNewer = (statGenerated.mtime > sourceStat.mtime);
       };
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
           var statInterface = fs.statSync(this.interfaceFile);
           
           this.interfaceFileExists = (statInterface.mtime > sourceStat.mtime);
           if (!(this.interfaceFileExists)) {externalCacheSave(this.interfaceFile, null);};
       };
       return;
    };
   
   module.exports.FileInfo = FileInfo;
   FileInfo
   
   function setBasePath(filename, options){
       
       var fileInfo = new FileInfo({name: filename});
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
           if (!prop) {return true;};
           var r = require(name);
           if (prop in r) {return true;};
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
   function fileInfoNewFile(name, options){
       var fileInfo = new FileInfo({name: name, createFile: true});
       fileInfo.searchModule(null, options);
       return fileInfo;
   };
   
   module.exports.fileInfoNewFile=fileInfoNewFile;
   
   function ImportParameterInfo(){};
   
   
   module.exports.ImportParameterInfo = ImportParameterInfo;
   ImportParameterInfo