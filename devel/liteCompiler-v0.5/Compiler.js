//Compiled by LiteScript compiler v0.4.0, source: /home/ltato/LiteScript/source-v0.5.0/Compiler.lite.md
//The LiteScript Compiler Module
//==============================
//LiteScript is a highly readable language that compiles to JavaScript.

   var version = '0.5.0';
   //export
   module.exports.version = version;

//This v0.4 compiler is written in v0.3 syntax.
//That is, you use the v0.3 compiler to compile this code
//and you get a v0.3 compiler, suporting v0.4 syntax.

//###Module Dependencies

//The Compiler module is the main module, requiring all other modules to
//compile LiteScript code.

   //import
   var ASTBase = require('./ASTBase');
   var Grammar = require('./Grammar');
   var Lexer = require('./Lexer');
   var NameDeclaration = require('./NameDeclaration');
   var Validate = require('./Validate');
   var log = require('./log');

   var debug = log.debug;

//Get the 'Environment' object for the compiler to use.
//The 'Environment' object, must provide functions to load files, search modules,
//and a optional external cache (disk).
//The `Environment` abstraction allows us to support compile on server(node) or the browser.

   //import Environment
   var Environment = require('./Environment');

//Require the Producer (to include it in dependency tree)

   //import Producer_js
   var Producer_js = require('./Producer_js');


//## Main API functions: LiteScript.compile & LiteScript.compileProject

   //export function compile (filename, sourceLines, options) returns string
   function compile(filename, sourceLines, options){

//Used to compile source code loaded in memory (instead of loading a file)
//input:
//* filename (for error reporting),
//* sourceLines: LiteScript code: string array | large string | Buffer

//output:
//* string, compiled code

       var moduleNode = compileModule(filename, sourceLines, options);

       return moduleNode.lexer.out.getResult().join('\n');
   };
   //export
   module.exports.compile=compile;


   //export function compileProject (mainModule, options) returns Project
   function compileProject(mainModule, options){

//The 'compileProject' function will load and compile the main Module of a project.
//The compilation of the main module will trigger import and compilation of all its "child" modules
//(dependency tree is constructed by `import`/`require` between modules)

//The main module is the root of the module dependency tree, and can reference
//another modules via import|require.

       //default options =
       if(!options) options={};
       if(options.outDir===undefined) options.outDir='.';
       if(options.target===undefined) options.target='js';

       log.extra("Out Dir: " + options.outDir);

//Create a 'Project' to hold the main module and dependant modules

       var project = new Project(mainModule, options);

       project.compile();

       return project;
   };
   //export
   module.exports.compileProject=compileProject;

//After generating all modules, if no errors occurred,
//mainModuleName and all its dependencies will be compiled in the output dir

//## Secondary Function: compileModule, returns Grammar.Module

   //export function compileModule (filename, sourceLines, options) returns Grammar.Module
   function compileModule(filename, sourceLines, options){
//Compile a module from source in memory
//input:
//* filename (for error reporting),
//* sourceLines: LiteScript code: string array | large string | Buffer

//output:
//* moduleNode: Grammar.Module: module's code AST root node

       var project = new Project(filename, options);

       var fileInfo = new Environment.FileInfo(filename);

       var moduleNode = project.createNewModule(fileInfo);

//parse source lines & store in moduleCache for validation

       project.parseOnModule(moduleNode, filename, sourceLines);
       project.moduleCache[filename] = moduleNode;

//import dependencies

       //if no project.options.single
       if (!project.options.single) {
           project.importDependencies(moduleNode);
       };

//validate var & property names

       //if no project.options.skip
       if (!project.options.skip) {

           Validate.validate(project);
           //if log.error.count is 0, log.message "Validation OK"
           if (log.error.count === 0) {
               log.message("Validation OK")};
       };

//initialize out buffer & produce target code

       log.message("Generating " + project.options.target);
       project.produceModule(moduleNode);
        //# the produced code will be at: moduleNode.lexer.out.getResult() :string array

       //if log.error.count isnt 0, log.throwControled "#log.error.count errors during compilation"
       if (log.error.count !== 0) {
           log.throwControled("#log.error.count errors during compilation")};

//text compiled result can be obtained with: moduleNode.lexer.out.getResult() :string array

       return moduleNode;
   };
   //export
   module.exports.compileModule=compileModule;


//----------------
   //class Project
   //constructor
   function Project(filename, options){

//normalize options

       //default options =
       if(!options) options={};
       if(options.verbose===undefined) options.verbose=1;
       if(options.warning===undefined) options.warning=1;
       if(options.target===undefined) options.target='js';
       if(options.outDir===undefined) options.outDir='.';
       // options.debug: undefined
       // options.skip: undefined
       // options.single: undefined
       // options.browser: undefined
       if(options.extraComments===undefined) options.extraComments=true;
       if(options.mainModuleName===undefined) options.mainModuleName=filename;
       // options.basePath: undefined
       if(options.outBasePath===undefined) options.outBasePath=options.outDir;



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

//set basePath from main module path

       Environment.setBasePath(filename, options);

       log.message('Base Path:', this.options.basePath);
       log.message('Main Module:', this.options.mainModuleName);
       log.message('Out Base Path:', this.options.outBasePath);

//create a 'root' dummy-module to hold global scope

       this.root = new Grammar.Module(this);
       this.root.name = 'Project Root';
       this.root.fileInfo = new Environment.FileInfo('./Project');
       this.root.fileInfo.relFilename = 'Project';
       this.root.fileInfo.dirname = options.basePath;

//The "scope" of rootNode is the global scope.
//Initialize the global scope

       Validate.createGlobalScope(this);

//Note: we defer requiring utility string functions to *after* **createGlobalScope**
//to avoid tainting core classes in the compiled module global scope.
//In 'string-shims' we add methods to core's String & Array

       require('./string-shims');

//compiler vars, to use at conditional compilation

        //declare valid this.root.compilerVars.addMember
       this.root.compilerVars = new NameDeclaration("Compiler Vars");
       this.root.compilerVars.addMember('debug', {value: true});

//add 'inNode' and 'inBrowser' as compiler vars

        //global declare window
       var inNode = typeof window === 'undefined';
       this.root.compilerVars.addMember('inNode', {value: inNode});
       this.root.compilerVars.addMember('inBrowser', {value: !(inNode)});

        //log.message .root.compilerVars
        //log.message ""

//in 'options' we receive also the target code to generate. (default is 'js')

//Now we load the **Producer** module for the selected target code.

//The **Producer** module will append to each Grammar class a `produce()` method
//which generates target code for the AST class

       this.Producer = require('./Producer_' + options.target);
    };
     //     properties

        //options
        //name
        //moduleCache
        //root: Grammar.Module
        //globalScope: NameDeclaration
        //mainModuleFileInfo
        //main: Grammar.Module
        //Producer
        //recurseLevel = 0
    Project.prototype.recurseLevel=0;

//### Project.compile

    //method compile()
    Project.prototype.compile = function(){

//Import & compile the main module. The main module will, in turn, 'import' and 'compile'
//-if not cached-, all dependent modules.

       this.main = this.importModule(this.root, this.options.mainModuleName);

       //if log.error.count is 0
       if (log.error.count === 0) {
           log.message("\nParsed OK");
       };

//Validate

       //if no .options.skip
       if (!this.options.skip) {
           log.message("Validating");
           Validate.validate(this);
           //if log.error.count, log.throwControled log.error.count,"errors"
           if (log.error.count) {
               log.throwControled(log.error.count, "errors")};
       };

//Produce, for each module

       log.message("\nProducing " + this.options.target + " at " + this.options.outDir + "\n");

       //for each own property filename in .moduleCache
       for ( var filename in this.moduleCache)if (this.moduleCache.hasOwnProperty(filename)){
         var moduleNode = this.moduleCache[filename];

         //if not moduleNode.fileInfo.isCore and moduleNode.referenceCount
         if (!(moduleNode.fileInfo.isCore) && moduleNode.referenceCount) {

           log.extra("source:", moduleNode.fileInfo.importParameter);
           var result = undefined;

           //if not moduleNode.fileInfo.isLite
           if (!(moduleNode.fileInfo.isLite)) {
               log.extra('non-Lite module, copy to out dir.');
                //#copy the file to output dir
               var contents = Environment.loadFile(moduleNode.fileInfo.filename);
               Environment.externalCacheSave(moduleNode.fileInfo.outFilename, contents);
                //declare valid contents.length
               result = "" + (contents.length >> 10 || 1) + " kb";
               contents = undefined;
           }
           
           else {

//produce & get result target code

               this.produceModule(moduleNode);
               var resultLines = moduleNode.lexer.out.getResult();

//save to disk / add to external cache

               Environment.externalCacheSave(moduleNode.fileInfo.outFilename, resultLines);
               result = "" + resultLines.length + " lines";

               //if moduleNode.lexer.out.sourceMap
               if (moduleNode.lexer.out.sourceMap) {

                   Environment.externalCacheSave(moduleNode.fileInfo.outFilename + '.map', moduleNode.lexer.out.sourceMap.generate({generatedFile: moduleNode.fileInfo.basename + moduleNode.fileInfo.outExtension, sourceFiles: [moduleNode.fileInfo.sourcename]}));
               };
           };


//                var exportedArray = moduleNode.exports.toExportArray()
//                var cacheContents = JSON.stringify({required:[], exported:exportedArray},null,2)
//                Environment.externalCacheSave(moduleNode.fileInfo.outExportRequired, cacheContents)
//    

           //end if

           log.message("" + log.color.green + "[OK] " + result + " -> " + moduleNode.fileInfo.outRelFilename + " " + log.color.normal);
           log.extra();// #blank line
         };
         }
       //end for each property

       //end for each module cached

       //print "#{log.error.count} errors, #{log.warning.count} warnings."
       console.log("" + log.error.count + " errors, " + log.warning.count + " warnings.");
    };


    //method compileFile(filename, moduleNode:Grammar.Module)
    Project.prototype.compileFile = function(filename, moduleNode){

//Compilation:
//Load source -> Lexer/Tokenize -> Parse/create AST

       log.message(String.spaces(this.recurseLevel * 2), "compile: '" + (Environment.relName(filename, this.options.basePath)) + "'");

//Load source code, parse

       this.parseOnModule(moduleNode, filename, Environment.loadFile(filename));

//Check if this module 'imported other modules'. Process Imports (recursive)

       //if no .options.single
       if (!this.options.single) {
           this.importDependencies(moduleNode);
       };
    };



    //method parseOnModule(moduleNode:Grammar.Module, filename, sourceLines)
    Project.prototype.parseOnModule = function(moduleNode, filename, sourceLines){ try{

//This method will initialize lexer & parse  source lines into ModuleNode scope

//set Lexer source code, process lines, tokenize

       log.error.count = 0;

       var stage = "lexer";
       moduleNode.lexer.initSource(filename, sourceLines);
       moduleNode.lexer.process();

//Parse source

       stage = "parsing";
       moduleNode.parse();

//Check if errors were emitted

       //if log.error.count
       if (log.error.count) {
           var errsEmitted = new Error("" + log.error.count + " errors emitted");
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

           log.error(err.message);

            //#show last soft error. Can be useful to pinpoint the problem
           //if moduleNode.lexer.softError, log.message "previous soft-error: #{moduleNode.lexer.softError.message}"
           if (moduleNode.lexer.softError) {
               log.message("previous soft-error: " + moduleNode.lexer.softError.message)};

           //if process #we're in node.js
           if (process) {// #we're in node.js
               process.exit(1);
           }
           
           else {
               //throw err
               throw err;
           };
       };
    };

    //method createNewModule(fileInfo) returns Grammar.Module
    Project.prototype.createNewModule = function(fileInfo){

//create a **new Module** and then create a **new lexer** for the Module
//(each module has its own lexer. There is one lexer per file)

       var moduleNode = new Grammar.Module(this.root);
       moduleNode.name = fileInfo.filename;
       moduleNode.fileInfo = fileInfo;
       moduleNode.referenceCount = 0;

       moduleNode.lexer = new Lexer();

//Now create the module scope, with two local scope vars:
//'module' and 'exports = module.exports'. 'exports' will hold all exported members.

       moduleNode.createScope();
       var moduleVar = moduleNode.addToScope('module');
       moduleNode.exports = moduleVar.addMember('exports');// #add as member of 'module'
       moduleNode.addToScope('exports', {pointsTo: moduleNode.exports});// #add also as 'exports' in scope

//add other common built-in members of var 'module'. http://nodejs.org/api/modules.html#modules_module_id

       moduleVar.addMember(moduleNode.declareName('filename', {value: fileInfo.filename}));

//Also, register every `import|require` in this module body, to track modules dependencies.
//We create a empty a empty `.requireCallNodes[]`, to hold:
//1. VariableRef, when is a require() call
//2. each VariableDecl, from ImportStatements

       moduleNode.requireCallNodes = [];

       return moduleNode;
    };


    //method produceModule(moduleNode:Grammar.Module)
    Project.prototype.produceModule = function(moduleNode){

       moduleNode.lexer.out.addSourceAsComment = this.options.extraComments;
       moduleNode.lexer.out.browser = this.options.browser;

       moduleNode.produce();

       var NL = '\n';
        //#referenceSourceMap
       moduleNode.out(NL, "//Compiled by LiteScript compiler v" + version + ", source: " + moduleNode.fileInfo.filename);
       moduleNode.out(NL, "//# sourceMappingURL=" + (moduleNode.fileInfo.basename + moduleNode.fileInfo.outExtension + '.map'), NL);
    };


    //method importDependencies(moduleNode:Grammar.Module)
    Project.prototype.importDependencies = function(moduleNode){

//Check if this module 'imported other modules'. Process Imports (recursive)

       //for each node in moduleNode.requireCallNodes
       for( var node__inx=0,node ; node__inx<moduleNode.requireCallNodes.length ; node__inx++){node=moduleNode.requireCallNodes[node__inx];
       

           var requireParameter = undefined;

//get import parameter, and parent Module
//store a pointer to the imported module in
//the statement AST node

//If the origin is: ImportStatement

           //if node instance of Grammar.ImportStatementItem
           if (node instanceof Grammar.ImportStatementItem) {
                //declare node:Grammar.ImportStatementItem
               //if node.importParameter
               if (node.importParameter) {
                   requireParameter = node.importParameter.getValue();
               }
               
               else {
                   requireParameter = node.name;
               };

//if it wansn't 'global import', add './' to the filename

                //declare valid node.parent.global
               //if no node.parent.global,  requireParameter = './'+requireParameter
               if (!node.parent.global) {
                   requireParameter = './' + requireParameter};
           }

//else, If the origin is a require() call
           
           else if (node instanceof Grammar.VariableRef) {// #require() call
                //declare node:Grammar.VariableRef
               //if node.accessors and node.accessors[0] instanceof Grammar.FunctionAccess
               if (node.accessors && node.accessors[0] instanceof Grammar.FunctionAccess) {
                   var requireCall = node.accessors[0];
                   //if requireCall.args[0].root.name instanceof Grammar.StringLiteral
                   if (requireCall.args[0].root.name instanceof Grammar.StringLiteral) {
                       requireParameter = requireCall.args[0].root.name.getValue();
                   };
               };
           };

//if found a valid filename to import

           //if requireParameter
           if (requireParameter) {
               node.importedModule = this.importModule(moduleNode, requireParameter);
           };
       }; // end for each in moduleNode.requireCallNodes
       
    };

        //#loop


    //method importModule(importingModule:Grammar.Module, importParameter)
    Project.prototype.importModule = function(importingModule, importParameter){

//importParameter is the raw string passed to `import/require` statements,

//*Return*: a ModuleNode AST Class instance (from local cache, external cache or as a result of compilation)

        //declare valid .recurseLevel

       this.recurseLevel++;
       var indent = String.spaces(this.recurseLevel * 2);

       log.message("");
       log.message(indent, "'" + importingModule.fileInfo.relFilename + "' imports '" + importParameter + "'");

//Determine the full module filename. Search for the module in the environment.

       var fileInfo = new Environment.FileInfo(importParameter);

       fileInfo.searchModule(importingModule.fileInfo, this.options);

//Before compiling the module, check internal, and external cache

//Check Internal Cache: if it is already compiled, return cached Module node

       //if .moduleCache.hasOwnProperty(fileInfo.filename) #registered
       if (this.moduleCache.hasOwnProperty(fileInfo.filename)) {// #registered
           log.message(indent, 'cached: ', fileInfo.filename);
           this.recurseLevel--;
           return this.moduleCache[fileInfo.filename];
       };

//It isn't on internal cache, then create a **new Module**.

       var moduleNode = this.createNewModule(fileInfo);

//early add to local cache, to cut off circular references

       this.moduleCache[fileInfo.filename] = moduleNode;

//Check if we can get exports from a "interface.md" file

       //if .getInterface(importingModule, fileInfo, moduleNode)
       if (this.getInterface(importingModule, fileInfo, moduleNode)) {
            //#getInterface also loads and analyze .js interfaces
           //do nothing #getInterface sets moduleNode.exports
           null;// #getInterface sets moduleNode.exports
       }

//else, we need to compile the file
       
       else {
           this.compileFile(fileInfo.filename, moduleNode);
           moduleNode.referenceCount++;
       };


//at last, return the parsed Module node

       this.recurseLevel -= 1;
       return moduleNode;
    };

    //#end importModule



    //method getInterface(importingModule,fileInfo, moduleNode:Grammar.Module)
    Project.prototype.getInterface = function(importingModule, fileInfo, moduleNode){
//If a 'interface' file exists, compile interface declarations instead of file
//return true if interface (exports) obtained

       //if fileInfo.interfaceFileExists
       if (fileInfo.interfaceFileExists) {

           this.compileFile(fileInfo.interfaceFile, moduleNode);

           return true;
       }

//else, for .js file, **require()** the file and generate & cache interface
       
       else if (fileInfo.extension === '.js' || fileInfo.isCore) {

           log.message(String.spaces(this.recurseLevel * 2), fileInfo.isCore ? "core module" : "javascript file", "require('" + fileInfo.importParameter + "')");

           //if not fileInfo.isCore
           if (!(fileInfo.isCore)) {
                //#hack for require(). Simulate we're at the importingModule dir
                //#for require() to look at the same dirs as at runtime
                //declare global module
                //declare on module paths:string array
                //declare valid module.constructor._nodeModulePaths
                //#declare valid module.filename
               var save = {paths: module.paths, filename: module.filename};
               module.paths = module.constructor._nodeModulePaths(importingModule.fileInfo.dirname);
               module.filename = importingModule.fileInfo.filename;
               debug("importingModule", module.filename);
           };

           var requiredNodeJSModule = require(fileInfo.importParameter);
           moduleNode.exports.getMembersFromObjProperties(requiredNodeJSModule);

           //if not fileInfo.isCore #restore
           if (!(fileInfo.isCore)) {// #restore
               module.paths = save.paths;
               module.filename = save.filename;
           };

           return true;
       };
    };
   //end class Project


//Require Extensions
//------------------

//This segment adds extensions to node's `require` function
//for LiteScript files so that you can just `require` a .lite.md file
//without having to compile it ahead of time

   //helper function extension_LoadLS(requiringModule, filename)
   function extension_LoadLS(requiringModule, filename){

//Read the file, then compile using the `compile` function above.
//Then use node's built-in compile function to compile the generated JavaScript.

       var content = compile(filename, Environment.loadFile(filename), {verbose: 0, warnings: 0});
        //declare valid requiringModule._compile
       requiringModule._compile(content, filename);
   };


   //export helper function registerRequireExtensions
   function registerRequireExtensions(){

//Add the extension for all appropriate file types. Don't overwrite `.md` in case CoffeeScript or something else is already using it.

        //declare on require
            //extensions

       //if require.extensions
       if (require.extensions) {

         require.extensions['.lite.md'] = extension_LoadLS;
         require.extensions['.lite'] = extension_LoadLS;
         require.extensions['.md'] = extension_LoadLS;
       };
   };
   //export
   module.exports.registerRequireExtensions=registerRequireExtensions;



//##Add helper properties and methods to AST node class Module

   //append to class Grammar.Module
   
     //     properties
        //fileInfo #module file info
        //exports: NameDeclaration # holds module.exports as members
        //requireCallNodes: Grammar.ImportStatementItem array #list of `import` item nodes or `require()` function calls (varRef)
        //referenceCount

    //method getCompiledLines returns array
    Grammar.Module.prototype.getCompiledLines = function(){
       return this.lexer.out.getResult();
    };


   //append to class Grammar.VariableRef
   
     //     properties
        //importedModule: Grammar.Module
    

   //append to class Grammar.ImportStatementItem
   
     //     properties
        //importedModule: Grammar.Module
    


//----------------
   //append to class NameDeclaration
   
    //helper method toExportArray()
    NameDeclaration.prototype.toExportArray = function(){

//converts .members={} to
//simpler arrays for JSON.stringify & cache

      //#declare valid .members
      //#declare valid item.type.fullName
      //#declare valid item.itemType.fullName

      //#FIX WITH for each own property
     //if .members
     if (this.members) {
       var result = [];
        //# FIX with for each property
       //for each prop in Object.keys(.members)
       var list__1=Object.keys(this.members);
       for( var prop__inx=0,prop ; prop__inx<list__1.length ; prop__inx++){prop=list__1[prop__inx];
       
         var item = this.members[prop];
         var membersArr = item.toExportArray();// #recursive
          //# FIX with Ternary
         var arrItem = {name: item.name};

          //declare valid arrItem.members
          //declare valid arrItem.type
          //declare valid arrItem.itemType
          //declare valid arrItem.value

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

         result.push(arrItem);
       }; // end for each in Object.keys(this.members)
       
     };

     return result;
    };

//----------------
   //append to class NameDeclaration
   
    //helper method importMembersFromArray(exportedArr: NameDeclaration array) ### Recursive
    NameDeclaration.prototype.importMembersFromArray = function(exportedArr){// ### Recursive

//Inverse of helper method toExportObject()
//converts exported object, back to NameDeclarations and .members[]

        //#declare item:Grammar.Identifier

       //for each item in exportedArr
       for( var item__inx=0,item ; item__inx<exportedArr.length ; item__inx++){item=exportedArr[item__inx];
       
         var nameDecl = new NameDeclaration(item.name || '(unnamed)');
         //if item.hasOwnProperty('type')
         if (item.hasOwnProperty('type')) {
           nameDecl.type = item.type;
         };
         //if item.hasOwnProperty('value')
         if (item.hasOwnProperty('value')) {
           nameDecl.value = item.value;
         };
         this.addMember(nameDecl);
         //if item.members
         if (item.members) {
           nameDecl.importMembersFromArray(item.members);// #recursive
         };
       }; // end for each in exportedArr
       
    };

