
//The LiteScript Compiler Module
//==============================
//LiteScript is a highly readable language that compiles to JavaScript.

//This v0.3 compiler is written in v0.2 syntax.
//That is, you use the v0.2 compiler to compile this code
//and you get a v0.3 compiler, suporting v0.3 syntax.

//###Module Dependencies

//The Compiler module is the main module, requiring all other modules to
//compile LiteScript code.

   var ASTBase = require('ASTBase');
   var Grammar = require('Grammar');
   var Lexer = require('Lexer');
   var NameDeclaration = require('NameDeclaration');
   var Validate = require('Validate');
   var log = require('log');

//    declare valid log.color.normal
//    declare valid log.color.red
//    declare valid log.color.green
//    declare valid log.color.yellow

//Get the 'Environment' object for the compiler to use.
//The 'Environment' object, must provide functions to load files, search modules,
//and a optional external cache (disk).
//The `Environment` abstraction allows us to support compile on server(node) or the browser.

   var Environment = require('Environment');

   //require('Producer_js')
   require('Producer_js');

//## Main function: compile

   //public function compile (mainModule, options)
   function compile(mainModule, options){

//The 'compile' function will import and compile the main Module of a project.
//The compilation of the main module will trigger import and compilation of all its "child" modules
//(dependency tree is constructed by `import`/`require` between modules)

//The main module is the root of the module dependency tree, and references
//another modules via import|require.

       //default options =
       if(!options) options={};
       if(options.outDir===undefined) options.outDir='out/debug';
       if(options.target===undefined) options.target='js';

       //log.extra "Out Dir: #{options.outDir}"
       log.extra("Out Dir: " + (options.outDir));

//Create a 'Project' to hold the main module and dependant modules

       var project = new Project(mainModule, options);

       //project.compile
       project.compile();
   };
   exports.compile=compile;

//After generating all modules, if no errors occurred,
//mainModuleName and all its dependencies will be compiled in the output dir


//## Secondary Function: compileLines

   //public function compileLines (filename, sourceLines, options)
   function compileLines(filename, sourceLines, options){
//Used to compile source from memory (instead of a file, aka js: new Function/eval)
//input:
//* filename (for error reporting),
//* sourceLines: string array, LiteScript code.

//output:
//* moduleNode: Grammar.Module, parsed AST
//* compiled result is at: moduleNode.outCode.getResult() :string array

       var project = new Project(filename, options);

       var moduleNode = project.createNewModule(project.fileInfo);

//parse source lines & store in moduleCache for validation

       //project.parseOnModule moduleNode, filename, sourceLines
       project.parseOnModule(moduleNode, filename, sourceLines);
       project.moduleCache[filename] = moduleNode;

//validate var & property names

       //Validate.validate project
       Validate.validate(project);
       //if log.error.count is 0, log.message "Validation OK"
       if (log.error.count === 0) {
           log.message("Validation OK")};

//initialize out buffer & produce target code

       //log.message "Generating #project.options.target"
       log.message("Generating " + project.options.target);
       //moduleNode.outCode.start
       moduleNode.outCode.start();
       //moduleNode.produce
       moduleNode.produce();
//        # the produced code will be at: moduleNode.outCode.getResult() :string array

       //if log.error.count isnt 0, log.throwControled "#log.error.count errors during compilation"
       if (log.error.count !== 0) {
           log.throwControled(log.error.count + " errors during compilation")};

       //return moduleNode
       return moduleNode;
   };
   exports.compileLines=compileLines;


//----------------
   // Class Project, constructor:
   function Project(filename, options){

//normalize options

       //default options =
       if(!options) options={};
       if(options.verbose===undefined) options.verbose=1;
       if(options.warning===undefined) options.warning=1;
       if(options.target===undefined) options.target='js';
       if(options.outDir===undefined) options.outDir='out/Debug';
       if(options.force===undefined) options.force=false;
       if(options.debug===undefined) options.debug=false;
       if(options.skip===undefined) options.skip=false;

//Initialize this project. Project has a cache for required modules.
//As with node's `require` mechanism, a module,
//when imported|required is only compiled once and then cached.

       this.name = 'Project';
       this.options = options;
       this.moduleCache = {};

       log.error.count = 0;
       log.options.verbose = options.verbose;
       log.options.warning = options.warning;
       log.options.debug.enabled = options.debug;
       //if options.debug, log.debug.clear
       if (options.debug) {
           log.debug.clear()};

//Analyze main module path. Main module path, becomes new base path

       this.fileInfo = new Environment.FileInfo(filename);
       //Environment.setBasePath me.fileInfo.dirname
       Environment.setBasePath(this.fileInfo.dirname);
       this.fileInfo.dirname = '';

//When no explicit path is included, node's "require()" starts searching in './node_modules'.
//This is not inuitive from the command line, so we force compile parameter ".hasPath"
//to avoid node's special behavior on command line parameter

       this.fileInfo.hasPath = true;

//create a 'root' dummy-module to hold global scope

       this.root = new Grammar.Module(this);
       this.root.name = 'Project Root';
       this.root.fileInfo = new Environment.FileInfo(filename);// #another instance
       this.root.fileInfo.basename = 'Project';
       this.root.fileInfo.dirname = '';

//The "scope" of rootNode is the global scope.
//Initialize the global scope

       //Validate.createGlobalScope me
       Validate.createGlobalScope(this);

//Note: we defer requiring utility string functions to *after* **createGlobalScope**
//to avoid tainting core classes in the compiled module global scope.
//In 'string-shims' we add methods to core's String & Array

       //require('string-shims') #.startWith, endsWith
       require('string-shims');// #.startWith, endsWith

//compiler vars, to use at conditional compilation

//        declare valid me.root.compilerVars.addMember
       this.root.compilerVars = new NameDeclaration("Compiler Vars");
       //me.root.compilerVars.addMember 'debug',{value:true}
       this.root.compilerVars.addMember('debug', {value: true});

//add 'inNode' and 'inBrowser' as compiler vars

       var inNode = typeof window === 'undefined';
       //me.root.compilerVars.addMember 'inNode',{value:inNode}
       this.root.compilerVars.addMember('inNode', {value: inNode});
       //me.root.compilerVars.addMember 'inBrowser',{value: not inNode}
       this.root.compilerVars.addMember('inBrowser', {value: !(inNode)});

        //log.message me.root.compilerVars
        //log.message ""

//in 'options' we receive also the target code to generate. (default is 'js')

//Now we load the **Producer** module for the selected target code.

//The **Producer** module will append to each Grammar class a `produce()` method
//which generates target code for the AST class

       this.Producer = require('Producer_' + options.target);
    };
   
   // declared properties & methods
//          properties

//        options,
//        name, fileInfo
//        moduleCache
//        root: Grammar.Module
//        main: Grammar.Module
//        Producer
//        recurseLevel = 0
    Project.prototype.recurseLevel=0;

//### Project.compile

    //method compile()
    Project.prototype.compile = function(){

//Import the main module. The main module will, in turn, 'import' and 'compile' -if not cached-,
//all dependent modules. Throw if errror.

       this.main = this.importModule(this.root, this.fileInfo);

       //if log.error.count is 0
       if (log.error.count === 0) {
           //log.message "parsed OK"
           log.message("parsed OK");
       };

       //if no me.options.skip
       if (!this.options.skip) {
           //log.message "Validating"
           log.message("Validating");
           //Validate.validate me
           Validate.validate(this);
           //if log.error.count, log.throwControled log.error.count,"errors"
           if (log.error.count) {
               log.throwControled(log.error.count, "errors")};
       };

       //log.message "\nProducing #me.options.target at #me.options.outDir\n"
       log.message("\nProducing " + this.options.target + " at " + this.options.outDir + "\n");

       //for each own property filename in me.moduleCache
       for ( var filename in this.moduleCache) if (this.moduleCache.hasOwnProperty(filename)) {
         var moduleNode = this.moduleCache[filename];
         //if not moduleNode.fileInfo.isCore
         if (!(moduleNode.fileInfo.isCore)) {

           //log.extra "source:", moduleNode.fileInfo.importParameter
           log.extra("source:", moduleNode.fileInfo.importParameter);
           var result = undefined;

           //if not moduleNode.fileInfo.isLite
           if (!(moduleNode.fileInfo.isLite)) {
               //log.extra 'non-Lite module, copy to out dir.'
               log.extra('non-Lite module, copy to out dir.');
//                #copy the file to output dir
               var contents = Environment.loadFile(moduleNode.fileInfo.filename);
               //Environment.externalCacheSave(moduleNode.fileInfo.outFilename, contents)
               Environment.externalCacheSave(moduleNode.fileInfo.outFilename, contents);
//                declare valid contents.length
               result = "" + (contents.length >> 10 || 1) + " kb";
               contents = undefined;
           }
           else {

//initialize out buffer, produce target code & get result target code

               //moduleNode.outCode.start
               moduleNode.outCode.start();
               //moduleNode.produce
               moduleNode.produce();
               var resultLines = moduleNode.outCode.getResult();

//save to disk / add to external cache

               //Environment.externalCacheSave(moduleNode.fileInfo.outFilename,resultLines)
               Environment.externalCacheSave(moduleNode.fileInfo.outFilename, resultLines);
               result = resultLines.length + " lines";
           };


//                var exportedArray = moduleNode.exports.toExportArray()
//                var cacheContents = JSON.stringify({required:[], exported:exportedArray},null,2)
//                Environment.externalCacheSave(moduleNode.fileInfo.outExportRequired, cacheContents)
//    

           //end if

           //log.message "#log.color.green[OK] #result -> #moduleNode.fileInfo.outRelFilename #log.color.normal"
           log.message(log.color.green + "[OK] " + result + " -> " + moduleNode.fileInfo.outRelFilename + " " + log.color.normal);
           //log.extra #blank line
           log.extra();// #blank line
         };
       }; // end for each property

       //end for each module cached

       //print "#log.error.count errors, #log.warning.count warnings."
       console.log(log.error.count + " errors, " + log.warning.count + " warnings.");
    };

    //method createNewModule(fileInfo) returns Grammar.Module
    Project.prototype.createNewModule = function(fileInfo){

//create a **new Module** and then create a **new lexer** for the Module
//(each module has its own lexer. There is one lexer per file)

       var moduleNode = new Grammar.Module(this.root);
       moduleNode.name = fileInfo.filename;
       moduleNode.fileInfo = fileInfo;

       moduleNode.lexer = new Lexer();

//Now create the module scope, with two local scope vars:
//'module' and 'exports = module.exports'. 'exports' will hold all exported members.

       //moduleNode.createScope()
       moduleNode.createScope();
       var moduleVar = moduleNode.addToScope('module');
       moduleNode.exports = moduleVar.addMember('exports');// #add as member of 'module'
       //moduleNode.addToScope('exports',{pointsTo:moduleNode.exports}) #add also as 'exports' in scope
       moduleNode.addToScope('exports', {pointsTo: moduleNode.exports});// #add also as 'exports' in scope

//add other common built-in members of var 'module'. http://nodejs.org/api/modules.html#modules_module_id

       //moduleVar.addMember moduleNode.declareName('filename',{value: fileInfo.filename})
       moduleVar.addMember(moduleNode.declareName('filename', {value: fileInfo.filename}));

//Also, register every `import|require` in this module body, to track modules dependencies.
//We create a empty a empty `.requireCallNodes[]`, to hold:
//1. VariableRef, when is a require() call
//2. each VariableDecl, from ImportStatements

       moduleNode.requireCallNodes = [];

       //return moduleNode
       return moduleNode;
    };


    //method parseOnModule(moduleNode:Grammar.Module, filename, sourceLines)
    Project.prototype.parseOnModule = function(moduleNode, filename, sourceLines){ try{

//This method will initialize lexer & parse  source lines into ModuleNode scope

//set Lexer source code, process lines, tokenize

       log.error.count = 0;

       var stage = "lexer";
       //moduleNode.lexer.initSource( filename, sourceLines )
       moduleNode.lexer.initSource(filename, sourceLines);
       //moduleNode.lexer.process()
       moduleNode.lexer.process();

//Parse source

       stage = "parsing";
       //moduleNode.parse()
       moduleNode.parse();

//Check if errors were emitted

       //if log.error.count
       if (log.error.count) {
           var errsEmitted = new Error("" + (log.error.count) + " errors emitted");
           errsEmitted.controled = true;
           //throw errsEmitted
           throw errsEmitted;
       };

//Handle errors, add stage info, and stack

       //exception err
       
       }catch(err){

           err = moduleNode.lexer.hardError || err; //get important (inner) error
           //if not err.controled  //if not 'controled' show lexer pos & call stack (includes err text)
           if (!(err.controled)) { //if not 'controled' show lexer pos & call stack (includes err text)
               err.message = "" + (moduleNode.lexer.posToString()) + "\n" + (err.stack || err.message);
           };

           //log.error err.message
           log.error(err.message);

//            #show last soft error. Helps the programmer pinpoint the problem
           //if moduleNode.lexer.softError, log.message "previous soft-error: #moduleNode.lexer.softError.message"
           if (moduleNode.lexer.softError) {
               log.message("previous soft-error: " + moduleNode.lexer.softError.message)};

           //if process #we're in node.js
           if (process) {// #we're in node.js
               //process.exit(1)
               process.exit(1);
           }
           else {
               //throw err
               throw err;
           };
       };
    };


    //method importModule(importingModule:Grammar.Module, fileInfo)
    Project.prototype.importModule = function(importingModule, fileInfo){

//The importModule method can receive a string in `fileInfo`,
//the raw string passed to `import/require` statements,
//with the module to load and compile.

//*Return*: a ModuleNode AST Class instance (from local cache, external cache or as a result of compilation)

//        declare valid me.root
//        declare valid me.recurseLevel

//        declare importingModule:Grammar.Module

//convert parameters

       //if type of fileInfo is 'string'
       if (typeof fileInfo === 'string') {
           fileInfo = new Environment.FileInfo(fileInfo);
       };

       this.recurseLevel += 1;
       var indent = String.spaces(this.recurseLevel * 2);
       //log.message ""
       log.message("");
       //log.message indent,"'#{importingModule.fileInfo.basename}' imports '#{fileInfo.basename}'"
       log.message(indent, "'" + (importingModule.fileInfo.basename) + "' imports '" + (fileInfo.basename) + "'");

//Determine the full module filename. Search for the module in the environment.

       //fileInfo.searchModule importingModule.fileInfo, me.options
       fileInfo.searchModule(importingModule.fileInfo, this.options);

//Before compiling the module, check internal, and external cache

//Check Internal Cache: if it is already compiled, return cached Module node

       //if me.moduleCache.hasOwnProperty(fileInfo.filename) #registered
       if (this.moduleCache.hasOwnProperty(fileInfo.filename)) {// #registered
           //log.message indent,'cached: ',fileInfo.filename
           log.message(indent, 'cached: ', fileInfo.filename);
           this.recurseLevel -= 1;
           //return me.moduleCache[fileInfo.filename]
           return this.moduleCache[fileInfo.filename];
       };

//It isn't on internal cache, then create a **new Module**.

       var moduleNode = this.createNewModule(fileInfo);

//early add to local cache, to cut off circular references

       this.moduleCache[fileInfo.filename] = moduleNode;

//Check if we can get exports from a "interface.md" file

       //if this.getInterface(importingModule, fileInfo, moduleNode)
       if (this.getInterface(importingModule, fileInfo, moduleNode)) {
           //do nothing #getInterface sets moduleNode.exports
           null;// #getInterface sets moduleNode.exports
       }
       else {
           //this.compileFile fileInfo.filename, moduleNode
           this.compileFile(fileInfo.filename, moduleNode);
       };

//at last, return the parsed Module node

       this.recurseLevel -= 1;
       //return moduleNode
       return moduleNode;
    };

//    #end importModule


    //method compileFile(filename, moduleNode:Grammar.Module)
    Project.prototype.compileFile = function(filename, moduleNode){

//Compilation:
//Load source -> Lexer/Tokenize -> Parse/create AST

       //log.message String.spaces(this.recurseLevel*2),"compile: '#{Environment.relName(filename)}'"
       log.message(String.spaces(this.recurseLevel * 2), "compile: '" + (Environment.relName(filename)) + "'");

//Load source code, parse

       //me.parseOnModule moduleNode, filename, Environment.loadFile(filename)
       this.parseOnModule(moduleNode, filename, Environment.loadFile(filename));

//Check if this module 'imported other modules'. Process Imports (recursive)

       //for each node in moduleNode.requireCallNodes
       for ( var node__inx=0,node=undefined; node__inx<moduleNode.requireCallNodes.length; node__inx++) {
           var node=moduleNode.requireCallNodes[node__inx];

           var requireParameter = undefined;

//get import parameter, and parent Module
//store pointer to imported module in AST node

//If the origin is: ImportStatement

           //if node instance of Grammar.VariableDecl #ImportStatement
           if (node instanceof Grammar.VariableDecl) {// #ImportStatement
//                declare node:Grammar.VariableDecl
               //if node.assignedValue
               if (node.assignedValue) {
//                    declare valid node.assignedValue.root.name.getValue
                   //if node.assignedValue.root.name instanceof Grammar.StringLiteral
                   if (node.assignedValue.root.name instanceof Grammar.StringLiteral) {
                       requireParameter = node.assignedValue.root.name.getValue();
                   };
               }
               else {
                   requireParameter = node.name;
               };

//if it wansn't 'global import', add './' to the filename

//                declare valid node.parent.global
               //if no node.parent.global,  requireParameter = './'+requireParameter
               if (!node.parent.global) {
                   requireParameter = './' + requireParameter};
           }
           else if (node instanceof Grammar.VariableRef) {// #require() call
//                declare node:Grammar.VariableRef
               //if node.accessors and node.accessors[0] instanceof Grammar.FunctionAccess
               if (node.accessors && node.accessors[0] instanceof Grammar.FunctionAccess) {
                   var requireCall = node.accessors[0];
                   //if requireCall.args[0].root.name instanceof Grammar.StringLiteral
                   if (requireCall.args[0].root.name instanceof Grammar.StringLiteral) {
                       requireParameter = requireCall.args[0].root.name.getValue();
                   };
               };
           };

//if a valid filename to import was found.
//Import file (recursive)

           //if requireParameter
           if (requireParameter) {
               node.importedModule = this.importModule(moduleNode, requireParameter);
           };
       }; // end for each in moduleNode.requireCallNodes
       
    };

//        #loop

    //method getInterface(importingModule,fileInfo, moduleNode:Grammar.Module)
    Project.prototype.getInterface = function(importingModule, fileInfo, moduleNode){
//If a 'interface' file exists, compile interface declarations instead of file
//return true if interface (exports) obtained

       //if fileInfo.interfaceFileExists
       if (fileInfo.interfaceFileExists) {

           //this.compileFile fileInfo.interfaceFile, moduleNode
           this.compileFile(fileInfo.interfaceFile, moduleNode);
           //return true
           return true;
       }
       else if (fileInfo.extension === '.js' || fileInfo.isCore) {

           //log.message String.spaces(this.recurseLevel*2),
           log.message(String.spaces(this.recurseLevel * 2), fileInfo.isCore ? "core module" : "javascript file", "require('" + (fileInfo.importParameter) + "')");

           //if not fileInfo.isCore
           if (!(fileInfo.isCore)) {
//                #hack for require(). Simulate we're at the importingModule dir
//                #for require() to look at the same dirs as at runtime
//                declare global module
//                declare on module paths:string array
//                declare valid module.constructor._nodeModulePaths
//                #declare valid module.filename
               var save = {paths: module.paths, filename: module.filename};
               module.paths = module.constructor._nodeModulePaths(importingModule.fileInfo.dirname);
               module.filename = importingModule.fileInfo.filename;
               //log.message module.filename
               log.message(module.filename);
           };

           var requiredNodeJSModule = require(fileInfo.importParameter);
           //moduleNode.exports.getMembersFromObjProperties(requiredNodeJSModule)
           moduleNode.exports.getMembersFromObjProperties(requiredNodeJSModule);

           //if not fileInfo.isCore #restore
           if (!(fileInfo.isCore)) {// #restore
               module.paths = save.paths;
               module.filename = save.filename;
           };

           //return true
           return true;
       };
    };
   //end class Project


//##Add helper properties and methods to AST node class Module

   //append to class Grammar.Module
   
//          properties
//        fileInfo #module file info
//        exports: NameDeclaration # holds module.exports as members
//        requireCallNodes: Grammar.VariableRef array #list of VariableRef being `require()` calls or `import` statements
    

   //append to class Grammar.VariableRef
   
//          properties
//        importedModule: Grammar.Module
    

   //append to class Grammar.VariableDecl
   
//          properties
//        importedModule: Grammar.Module
    


//----------------
   //append to class NameDeclaration
   
    //helper method toExportArray()
    NameDeclaration.prototype.toExportArray = function(){

//converts .members={} to
//simpler arrays for JSON.stringify & cache

//      #declare valid me.members
//      #declare valid item.type.fullName
//      #declare valid item.itemType.fullName

//      #FIX WITH for each own property
     //if me.members
     if (this.members) {
       var result = [];
//        # FIX with for each property
       //for prop in Object.keys(me.members)
       var list__1=Object.keys(this.members);
       for ( var prop__inx=0,prop=undefined; prop__inx<list__1.length; prop__inx++) {
         var prop=list__1[prop__inx];
         var item = this.members[prop];
         var membersArr = item.toExportArray();// #recursive
//          # FIX with Ternary
         var arrItem = {name: item.name};

//          declare valid arrItem.members
//          declare valid arrItem.type
//          declare valid arrItem.itemType
//          declare valid arrItem.value

         //if membersArr.length
         if (membersArr.length) {
           arrItem.members = membersArr;
         };

         //if item.hasOwnProperty('type') and item.type
         if (item.hasOwnProperty('type') && item.type) {
           arrItem.type = item.type.toString();
         };

         //if item.hasOwnProperty('itemType') and item.itemType
         if (item.hasOwnProperty('itemType') && item.itemType) {
           arrItem.itemType = item.itemType.toString();
         };

         //if item.hasOwnProperty('value')
         if (item.hasOwnProperty('value')) {
           arrItem.value = item.value;
         };

         //result.push arrItem
         result.push(arrItem);
       }; // end for each in Object.keys(this.members)
       
     };

     //return result
     return result;
    };

//----------------
   //append to class NameDeclaration
   
    //helper method importMembersFromArray(exportedArr: NameDeclaration array) ### Recursive
    NameDeclaration.prototype.importMembersFromArray = function(exportedArr){// ### Recursive

//Inverse of helper method toExportObject()
//converts exported object, back to NameDeclarations and .members[]

//        #declare item:Grammar.Identifier

       //for item in exportedArr
       for ( var item__inx=0,item=undefined; item__inx<exportedArr.length; item__inx++) {
         var item=exportedArr[item__inx];
         var nameDecl = new NameDeclaration(item.name || '(unnamed)');
         //if item.hasOwnProperty('type')
         if (item.hasOwnProperty('type')) {
           nameDecl.type = item.type;
         };
         //if item.hasOwnProperty('value')
         if (item.hasOwnProperty('value')) {
           nameDecl.value = item.value;
         };
         //me.addMember nameDecl
         this.addMember(nameDecl);
         //if item.members
         if (item.members) {
           //nameDecl.importMembersFromArray(item.members) #recursive
           nameDecl.importMembersFromArray(item.members);// #recursive
         };
       }; // end for each in exportedArr
       
    };

