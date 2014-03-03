//Compiled by LiteScript compiler v0.6.1, source: /home/ltato/LiteScript/devel/source-v0.6/Compiler.lite.md
   var version = '0.6.1';
   
   module.exports.version = version;
   var ASTBase = require('./ASTBase');
   var Grammar = require('./Grammar');
   var Lexer = require('./Lexer');
   var NameDeclaration = require('./NameDeclaration');
   var Validate = require('./Validate');
   var log = require('./log');
   var debug = log.debug;
   var Environment = require('./Environment');
   var Producer_js = require('./Producer_js');
   function compile(filename, sourceLines, options){
       var moduleNode = compileModule(filename, sourceLines, options);
       return moduleNode.getCompiledText();
   };
   
   module.exports.compile=compile;
   function compileProject(mainModule, options){
       if(!options) options={};
       if(options.outDir===undefined) options.outDir='.';
       if(options.target===undefined) options.target='js';
       log.extra("Out Dir: " + options.outDir);
       var project = new Project(mainModule, options);
       project.compile();
       return project;
   };
   
   module.exports.compileProject=compileProject;
   function compileModule(filename, sourceLines, options){
       var project = new Project(filename, options);
       var fileInfo = new Environment.FileInfo(filename);
       var moduleNode = project.createNewModule(fileInfo);
       project.parseOnModule(moduleNode, filename, sourceLines);
       project.moduleCache[filename] = moduleNode;
       if (!project.options.single) {
           project.importDependencies(moduleNode);
       };
       if (!project.options.skip) {
           Validate.validate(project);
           if (log.error.count === 0) {
               log.message("Validation OK")};
       };
       log.message("Generating " + project.options.target);
       project.produceModule(moduleNode);
       if (log.error.count !== 0) {
           log.throwControled("#log.error.count errors during compilation")};
       return moduleNode;
   };
   
   module.exports.compileModule=compileModule;
   
    function Project(filename, options){    this.recurseLevel=0;
       if(!options) options={};
       if(options.verbose===undefined) options.verbose=1;
       if(options.warning===undefined) options.warning=1;
       if(options.comments===undefined) options.comments=1;
       if(options.target===undefined) options.target='js';
       if(options.outDir===undefined) options.outDir='.';
       if(options.extraComments===undefined) options.extraComments=true;
       if(options.mainModuleName===undefined) options.mainModuleName=filename;
       if(options.outBasePath===undefined) options.outBasePath=options.outDir;
       this.name = 'Project';
       this.options = options;
       this.moduleCache = {};
       log.error.count = 0;
       log.options.verbose = options.verbose;
       log.options.warning = options.warning;
       log.options.debug.enabled = options.debug;
       if (options.debug) {
           log.debug.clear()};
       Environment.setBasePath(filename, options);
       log.message('Base Path:', this.options.basePath);
       log.message('Main Module:', this.options.mainModuleName);
       log.message('Out Base Path:', this.options.outBasePath);
       this.root = new Grammar.Module(this);
       this.root.name = 'Project Root';
       this.root.fileInfo = new Environment.FileInfo('./Project');
       this.root.fileInfo.relFilename = 'Project';
       this.root.fileInfo.dirname = options.basePath;
       Validate.createGlobalScope(this);
       require('./string-shims');
       
       this.root.compilerVars = new NameDeclaration("Compiler Vars");
       this.root.compilerVars.addMember('debug', {value: true});
       
       var inNode = typeof window === 'undefined';
       this.root.compilerVars.addMember('inNode', {value: inNode});
       this.root.compilerVars.addMember('inBrowser', {value: !(inNode)});
       this.Producer = require('./Producer_' + options.target);
    };
   
    Project.prototype.compile = function(){
       this.main = this.importModule(this.root, this.options.mainModuleName);
       if (log.error.count === 0) {
           log.message("\nParsed OK");
       };
       if (!this.options.skip) {
           log.message("Validating");
           Validate.validate(this);
           if (log.error.count) {
               log.throwControled(log.error.count, "errors")};
       };
       log.message("\nProducing " + this.options.target + " at " + this.options.outDir + "\n");
       for ( var filename in this.moduleCache)if (this.moduleCache.hasOwnProperty(filename)){
         var moduleNode = this.moduleCache[filename];
         if (!(moduleNode.fileInfo.isCore) && moduleNode.referenceCount) {
           log.extra("source:", moduleNode.fileInfo.importParameter);
           var result = undefined;
           if (!(moduleNode.fileInfo.isLite)) {
               log.extra('non-Lite module, copy to out dir.');
               var contents = Environment.loadFile(moduleNode.fileInfo.filename);
               Environment.externalCacheSave(moduleNode.fileInfo.outFilename, contents);
               
               result = "" + (contents.length >> 10 || 1) + " kb";
               contents = undefined;
           }
           else {
               this.produceModule(moduleNode);
               var resultLines = moduleNode.lexer.out.getResult();
               Environment.externalCacheSave(moduleNode.fileInfo.outFilename, resultLines);
               result = "" + resultLines.length + " lines";
               if (moduleNode.lexer.out.sourceMap) {
                   Environment.externalCacheSave(moduleNode.fileInfo.outFilename + '.map', moduleNode.lexer.out.sourceMap.generate({generatedFile: moduleNode.fileInfo.basename + moduleNode.fileInfo.outExtension, sourceFiles: [moduleNode.fileInfo.sourcename]}));
               };
           };
           
           log.message("" + log.color.green + "[OK] " + result + " -> " + moduleNode.fileInfo.outRelFilename + " " + log.color.normal);
           log.extra();
         };
         }
       
       
       console.log("" + log.error.count + " errors, " + log.warning.count + " warnings.");
    };
    Project.prototype.compileFile = function(filename, moduleNode){
       log.message(String.spaces(this.recurseLevel * 2), "compile: '" + (Environment.relName(filename, this.options.basePath)) + "'");
       this.parseOnModule(moduleNode, filename, Environment.loadFile(filename));
       if (!this.options.single) {
           this.importDependencies(moduleNode);
       };
    };
    Project.prototype.parseOnModule = function(moduleNode, filename, sourceLines){ try{
       log.error.count = 0;
       var stage = "lexer";
       moduleNode.lexer.initSource(filename, sourceLines);
       moduleNode.lexer.process();
       stage = "parsing";
       moduleNode.parse();
       if (log.error.count) {
           var errsEmitted = new Error("" + log.error.count + " errors emitted");
           errsEmitted.controled = true;
           throw errsEmitted;
       };
       
       }catch(err){
           err = moduleNode.lexer.hardError || err;
           if (!(err.controled)) {
               err.message = "" + (moduleNode.lexer.posToString()) + "\n" + (err.stack || err.message);
           };
           log.error(err.message);
           if (moduleNode.lexer.softError) {
               log.message("previous soft-error: " + moduleNode.lexer.softError.message)};
           if (process) {
               process.exit(1);
           }
           else {
               throw err;
           };
       };
    };
    Project.prototype.createNewModule = function(fileInfo){
       var moduleNode = new Grammar.Module(this.root);
       moduleNode.name = fileInfo.filename;
       moduleNode.fileInfo = fileInfo;
       moduleNode.referenceCount = 0;
       moduleNode.lexer = new Lexer(module.exports, this.options);
       moduleNode.createScope();
       var moduleVar = moduleNode.addToScope('module');
       moduleNode.exports = moduleVar.addMember('exports');
       moduleNode.addToScope('exports', {pointsTo: moduleNode.exports});
       moduleVar.addMember(moduleNode.declareName('filename', {value: fileInfo.filename}));
       moduleNode.requireCallNodes = [];
       return moduleNode;
    };
    Project.prototype.produceModule = function(moduleNode){
       moduleNode.lexer.out.addSourceAsComment = this.options.extraComments;
       moduleNode.lexer.out.browser = this.options.browser;
       moduleNode.lexer.out.put("//Compiled by LiteScript compiler v" + version + ", source: " + moduleNode.fileInfo.filename);
       moduleNode.lexer.out.startNewLine();
       moduleNode.produce();
       if (!this.options.nomap && moduleNode.fileInfo.outExtension) {
           moduleNode.lexer.out.startNewLine();
           moduleNode.lexer.out.put("//# sourceMappingURL=" + (moduleNode.fileInfo.basename + moduleNode.fileInfo.outExtension + '.map'));
       };
    };
    Project.prototype.importDependencies = function(moduleNode){
       for( var node__inx=0,node ; node__inx<moduleNode.requireCallNodes.length ; node__inx++){node=moduleNode.requireCallNodes[node__inx];
       
           var requireParameter = undefined;
           if (node instanceof Grammar.ImportStatementItem) {
               
               if (node.importParameter) {
                   requireParameter = node.importParameter.getValue();
               }
               else {
                   requireParameter = node.name;
               };
               
               if (!node.parent.global) {
                   requireParameter = './' + requireParameter};
           }
           else if (node instanceof Grammar.VariableRef) {
               
               if (node.accessors && node.accessors[0] instanceof Grammar.FunctionAccess) {
                   var requireCall = node.accessors[0];
                   if (requireCall.args[0].root.name instanceof Grammar.StringLiteral) {
                       requireParameter = requireCall.args[0].root.name.getValue();
                   };
               };
           };
           if (requireParameter) {
               node.importedModule = this.importModule(moduleNode, requireParameter);
           };
       };
       
    };
    Project.prototype.importModule = function(importingModule, importParameter){
       
       this.recurseLevel++;
       var indent = String.spaces(this.recurseLevel * 2);
       log.message("");
       log.message(indent, "'" + importingModule.fileInfo.relFilename + "' imports '" + importParameter + "'");
       var fileInfo = new Environment.FileInfo(importParameter);
       fileInfo.searchModule(importingModule.fileInfo, this.options);
       if (this.moduleCache.hasOwnProperty(fileInfo.filename)) {
           log.message(indent, 'cached: ', fileInfo.filename);
           this.recurseLevel--;
           return this.moduleCache[fileInfo.filename];
       };
       var moduleNode = this.createNewModule(fileInfo);
       this.moduleCache[fileInfo.filename] = moduleNode;
       if (this.getInterface(importingModule, fileInfo, moduleNode)) {
           null;
       }
       else {
           this.compileFile(fileInfo.filename, moduleNode);
           moduleNode.referenceCount++;
       };
       this.recurseLevel -= 1;
       return moduleNode;
    };
    Project.prototype.getInterface = function(importingModule, fileInfo, moduleNode){
       if (fileInfo.interfaceFileExists) {
           this.compileFile(fileInfo.interfaceFile, moduleNode);
           return true;
       }
       else if (fileInfo.extension === '.js' || fileInfo.isCore) {
           log.message(String.spaces(this.recurseLevel * 2), fileInfo.isCore ? "core module" : "javascript file", "require('" + fileInfo.importParameter + "')");
           if (!(fileInfo.isCore)) {
               
               
               
               var save = {paths: module.paths, filename: module.filename};
               module.paths = module.constructor._nodeModulePaths(importingModule.fileInfo.dirname);
               module.filename = importingModule.fileInfo.filename;
               debug("importingModule", module.filename);
           };
           var requiredNodeJSModule = require(fileInfo.importParameter);
           moduleNode.exports.getMembersFromObjProperties(requiredNodeJSModule);
           if (!(fileInfo.isCore)) {
               module.paths = save.paths;
               module.filename = save.filename;
           };
           return true;
       };
    };
   Project
   function extension_LoadLS(requiringModule, filename){
       var content = compile(filename, Environment.loadFile(filename), {verbose: 0, warnings: 0});
       
       requiringModule._compile(content, filename);
   };
   function registerRequireExtensions(){
       
       if (require.extensions) {
         require.extensions['.lite.md'] = extension_LoadLS;
         require.extensions['.lite'] = extension_LoadLS;
         require.extensions['.md'] = extension_LoadLS;
       };
   };
   
   module.exports.registerRequireExtensions=registerRequireExtensions;
   
    
    Grammar.Module.prototype.getCompiledLines = function(){
       return this.lexer.out.getResult();
    };
    Grammar.Module.prototype.getCompiledText = function(){
       return this.lexer.out.getResult().join('\n');
    };
   
    
   
    
   
    NameDeclaration.prototype.toExportArray = function(){
     if (this.members) {
       var result = [];
       var _list1=Object.keys(this.members);
       for( var prop__inx=0,prop ; prop__inx<_list1.length ; prop__inx++){prop=_list1[prop__inx];
       
         var item = this.members[prop];
         var membersArr = item.toExportArray();
         var arrItem = {name: item.name};
         
         
         
         
         if (membersArr.length) {
           arrItem.members = membersArr;
         };
         if (item.hasOwnProperty('type') && item.type) {
           arrItem.type = item.type.toString();
         };
         if (item.hasOwnProperty('itemType') && item.itemType) {
           arrItem.itemType = item.itemType.toString();
         };
         if (item.hasOwnProperty('value')) {
           arrItem.value = item.value;
         };
         result.push(arrItem);
       };
       
     };
     return result;
    };
   
    NameDeclaration.prototype.importMembersFromArray = function(exportedArr){
       for( var item__inx=0,item ; item__inx<exportedArr.length ; item__inx++){item=exportedArr[item__inx];
       
         var nameDecl = new NameDeclaration(item.name || '(unnamed)');
         if (item.hasOwnProperty('type')) {
           nameDecl.type = item.type;
         };
         if (item.hasOwnProperty('value')) {
           nameDecl.value = item.value;
         };
         this.addMember(nameDecl);
         if (item.members) {
           nameDecl.importMembersFromArray(item.members);
         };
       };
       
    };
