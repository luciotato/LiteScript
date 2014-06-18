//Compiled by LiteScript compiler v0.6.7, source: /home/ltato/LiteScript/devel/source-v0.6/Compiler.lite.md
// The LiteScript Compiler Module
// ==============================
// LiteScript is a highly readable language that compiles to JavaScript.

   var version = '0.6.7';
   // export
   module.exports.version = version;

    //compiler generate(lines:string array)
    //    lines.push "export var buildDate = '#{new Date.toISOString()}'"
   var buildDate = '20140606';
   // export
   module.exports.buildDate = buildDate;

// This v0.6 compiler is written in v0.5 syntax.
// That is, you use the v0.5 compiler to compile this code
// and you get a v0.6 compiler, suporting v0.6 syntax.

// ###Module Dependencies

// The Compiler module is the main module, requiring all other modules to
// compile LiteScript code.

   // import
   var ASTBase = require('./ASTBase');
   var Grammar = require('./Grammar');
   var Lexer = require('./Lexer');
   var NameDeclaration = require('./NameDeclaration');
   var Validate = require('./Validate');
   var log = require('./log');

   var debug = log.debug;

// Get the 'Environment' object for the compiler to use.
// The 'Environment' object, must provide functions to load files, search modules,
// and a optional external cache (disk).
// The `Environment` abstraction allows us to support compile on server(node) or the browser.

   // import Environment
   var Environment = require('./Environment');

// Require the Producer (to include it in the dependency tree)

   // import Producer_js
   var Producer_js = require('./Producer_js');

// ## Main API functions: LiteScript.compile & LiteScript.compileProject

   // export function compile (filename, sourceLines, options) returns string
   function compile(filename, sourceLines, options){

// Used to compile source code loaded in memory (instead of loading a file)
// input:
// * filename (for error reporting),
// * sourceLines: LiteScript code: string array | large string | Buffer

// output:
// * string, compiled code

        // declare valid options.storeMessages
       // if options.storeMessages
       if (options.storeMessages) {
           log.options.storeMessages = true;
           log.getMessages(); //clear
       };

       var moduleNode = compileModule(filename, sourceLines, options);

       return moduleNode.getCompiledText();
   };
   // export
   module.exports.compile=compile;


   // export function compileProject (mainModule, options) returns Project
   function compileProject(mainModule, options){

// The 'compileProject' function will load and compile the main Module of a project.
// The compilation of the main module will trigger import and compilation of all its "child" modules
// (dependency tree is constructed by `import`/`require` between modules)

// The main module is the root of the module dependency tree, and can reference
// another modules via import|require.

       // default options =
       if(!options) options={};
       if(options.outDir===undefined) options.outDir='.';
       if(options.target===undefined) options.target='js';

       log.extra("Out Dir: " + options.outDir);

// Create a 'Project' to hold the main module and dependant modules

       var project = new Project(mainModule, options);

       project.compile();

       return project;
   };
   // export
   module.exports.compileProject=compileProject;

// After generating all modules, if no errors occurred,
// mainModuleName and all its dependencies will be compiled in the output dir

// ## Secondary Function: compileModule, returns Grammar.Module

   // export function compileModule (filename, sourceLines, options) returns Grammar.Module
   function compileModule(filename, sourceLines, options){
// Compile a module from source in memory
// input:
// * filename (for error reporting),
// * sourceLines: LiteScript code: string array | large string | Buffer

// output:
// * moduleNode: Grammar.Module: module's code AST root node

       // default filename = 'unnamed'
       if(filename===undefined) filename='unnamed';

       var project = new Project(filename, options);

       var fileInfo = new Environment.FileInfo({name: filename});

       var moduleNode = project.createNewModule(fileInfo);

// parse source lines & store in moduleCache for validation

       project.parseOnModule(moduleNode, filename, sourceLines);
       project.moduleCache[filename] = moduleNode;

// import dependencies

       // if no project.options.single
       if (!project.options.single) {
           project.importDependencies(moduleNode);
       };

// validate var & property names

       // if no project.options.skip
       if (!project.options.skip) {

           Validate.validate(project);
           // if log.error.count is 0, log.info "Validation OK"
           if (log.error.count === 0) {log.info("Validation OK")};
       };

// initialize out buffer & produce target code

       log.info("Generating " + project.options.target);
       project.produceModule(moduleNode);
        // # the produced code will be at: moduleNode.lexer.out.getResult() :string array

       // if log.error.count isnt 0, log.throwControled "#log.error.count errors during compilation"
       if (log.error.count !== 0) {log.throwControled("#log.error.count errors during compilation")};

// text compiled result can be obtained with: moduleNode.lexer.out.getResult() :string array

       return moduleNode;
   };
   // export
   module.exports.compileModule=compileModule;


// ----------------
   // class Project
   // constructor
    function Project(filename, options){
     //      properties

        // options
        // name
        // moduleCache
        // root: Grammar.Module
        // compilerVars: NameDeclaration
        // globalScope: NameDeclaration
        // main: Grammar.Module
        // Producer
        // recurseLevel = 0
        this.recurseLevel=0;

// normalize options

       // default options =
       if(!options) options={};
       if(options.verbose===undefined) options.verbose=1;
       if(options.warning===undefined) options.warning=1;
       if(options.comments===undefined) options.comments=1;
       if(options.target===undefined) options.target='js';
       if(options.outDir===undefined) options.outDir='.';
       // options.debug: undefined
       // options.skip: undefined
       // options.nomap: undefined
       // options.single: undefined
       // options.compileIfNewer: undefined
       // options.browser: undefined
       if(options.extraComments===undefined) options.extraComments=1;
       if(options.defines===undefined) options.defines=[];
       if(options.mainModuleName===undefined) options.mainModuleName=filename;
       // options.basePath: undefined
       if(options.outBasePath===undefined) options.outBasePath=options.outDir;


// Initialize this project. Project has a cache for required modules.
// As with node's `require` mechanism, a module,
// when imported|required is only compiled once and then cached.

       this.name = 'Project';
       this.options = options;
       this.moduleCache = {};

       log.error.count = 0;
       log.options.verbose = options.verbose;
       log.options.warning = options.warning;
       log.options.debug.enabled = options.debug;
       // if options.debug, log.debug.clear
       if (options.debug) {log.debug.clear()};

// set basePath from main module path

       Environment.setBasePath(filename, options);

       log.info('Base Path:', this.options.basePath);
       log.info('Main Module:', this.options.mainModuleName);
       log.info('Out Base Path:', this.options.outBasePath);

// create a 'root' dummy-module to hold global scope

       this.root = new Grammar.Module(this);
       this.root.name = 'Project Root';
       this.root.fileInfo = new Environment.FileInfo({name: 'Project'});
       this.root.fileInfo.relFilename = 'Project';
       this.root.fileInfo.dirname = options.basePath;

// The "scope" of rootNode is the global scope.
// Initialize the global scope

       Validate.createGlobalScope(this);

// Note: we defer requiring utility string functions to *after* **createGlobalScope**
// to avoid tainting core classes in the compiled module global scope.
// In 'string-shims' we add methods to core's String & Array

       // import StringShims from './string-shims'
       var StringShims = require('././string-shims');

// compiler vars, to use at conditional compilation

       this.compilerVars = new NameDeclaration("Compiler Vars");
       this.compilerVars.addMember('debug', {value: true});

       // for each def in options.defines
       for( var def__inx=0,def ; def__inx<options.defines.length ; def__inx++){def=options.defines[def__inx];
           this.compilerVars.addMember(def, {value: true});
       };// end for each in options.defines

// add 'inNode' and 'inBrowser' as compiler vars

        // declare var window
       var inNode = typeof window === 'undefined';
       this.compilerVars.addMember('inNode', {value: inNode});
       this.compilerVars.addMember('inBrowser', {value: !(inNode)});

        //log.info .root.compilerVars
        //log.info ""

// in 'options' we receive also the target code to generate. (default is 'js')

// Now we load the **Producer** module for the selected target code.

// The **Producer** module will append to each Grammar class a `produce()` method
// which generates target code for the AST class

       this.Producer = require('./Producer_' + options.target);
    };

// ### Project.compile

    // method compile()
    Project.prototype.compile = function(){

// Import & compile the main module. The main module will, in turn, 'import' and 'compile'
// -if not cached-, all dependent modules.

       this.main = this.importModule(this.root, {name: this.options.mainModuleName});

       // if log.error.count is 0
       if (log.error.count === 0) {
           log.info("\nParsed OK");
       };

// Validate

       // if no .options.skip
       if (!this.options.skip) {
           log.info("Validating");
           Validate.validate(this);
           // if log.error.count, log.throwControled log.error.count,"errors"
           if (log.error.count) {log.throwControled(log.error.count, "errors")};
       };

// Produce, for each module

       log.info("\nProducing " + this.options.target + " at " + this.options.outDir + "\n");

       // for each own property filename in .moduleCache
       for ( var filename in this.moduleCache)if (this.moduleCache.hasOwnProperty(filename)){
         var moduleNode = this.moduleCache[filename];

         // if not moduleNode.fileInfo.isCore and moduleNode.referenceCount
         if (!(moduleNode.fileInfo.isCore) && moduleNode.referenceCount) {

           log.extra("source:", moduleNode.fileInfo.importInfo.name);
           var result = undefined;

           // if not moduleNode.fileInfo.isLite
           if (!(moduleNode.fileInfo.isLite)) {
               log.extra('non-Lite module, copy to out dir.');
                // #copy the file to output dir
               var contents = Environment.loadFile(moduleNode.fileInfo.filename);
               Environment.externalCacheSave(moduleNode.fileInfo.outFilename, contents);
                // declare valid contents.length
               result = "" + (contents.length >> 10 || 1) + " kb";
               contents = undefined;
           }
           
           else {

// produce & get result target code

               this.produceModule(moduleNode);
               var resultLines = moduleNode.lexer.out.getResult();

// save to disk / add to external cache

               Environment.externalCacheSave(moduleNode.fileInfo.outFilename, resultLines);
               result = "" + resultLines.length + " lines";

               // if moduleNode.lexer.out.sourceMap
               if (moduleNode.lexer.out.sourceMap) {

                   Environment.externalCacheSave(moduleNode.fileInfo.outFilename + '.map', moduleNode.lexer.out.sourceMap.generate({generatedFile: moduleNode.fileInfo.basename + moduleNode.fileInfo.outExtension, sourceFiles: [moduleNode.fileInfo.sourcename]}));
               };
           };

//                 var exportedArray = moduleNode.exports.toExportArray()
//                 var cacheContents = JSON.stringify({required:[], exported:exportedArray},null,2)
//                 Environment.externalCacheSave(moduleNode.fileInfo.outExportRequired, cacheContents)
//     

           // end if

           log.message("" + log.color.green + "[OK] " + result + " -> " + moduleNode.fileInfo.outRelFilename + " " + log.color.normal);
           log.extra();// #blank line
         };
         }
       // end for each property

       // end for each module cached

       log.message("" + log.error.count + " errors, " + log.warning.count + " warnings.");
    };


    // method compileFile(filename, moduleNode:Grammar.Module)
    Project.prototype.compileFile = function(filename, moduleNode){

// Compilation:
// Load source -> Lexer/Tokenize -> Parse/create AST

       log.info(String.spaces(this.recurseLevel * 2), "compile: '" + (Environment.relName(filename, this.options.basePath)) + "'");

// Load source code, parse

       this.parseOnModule(moduleNode, filename, Environment.loadFile(filename));

// Check if this module 'imported other modules'. Process Imports (recursive)

       // if no .options.single
       if (!this.options.single) {
           this.importDependencies(moduleNode);
       };
    };



    // method parseOnModule(moduleNode:Grammar.Module, filename, sourceLines)
    Project.prototype.parseOnModule = function(moduleNode, filename, sourceLines){ try{
// This method will initialize lexer & parse  source lines into ModuleNode scope

// set Lexer source code, process lines, tokenize

       log.error.count = 0;

       var stage = "lexer";
       moduleNode.lexer.initSource(filename, sourceLines);
       moduleNode.lexer.process();

// Parse source

       stage = "parsing";
       moduleNode.parse();

// Check if errors were emitted

       // if log.error.count
       if (log.error.count) {
           var errsEmitted = new Error("" + log.error.count + " errors emitted");
           errsEmitted.controled = true;
           // throw errsEmitted
           throw errsEmitted;
       };

// Handle errors, add stage info, and stack

       // exception err
       
       }catch(err){

           err = moduleNode.lexer.hardError || err; //get important (inner) error
           // if not err.controled  //if not 'controled' show lexer pos & call stack (includes err text)
           if (!(err.controled)) { //if not 'controled' show lexer pos & call stack (includes err text)
                // declare valid err.stack
               err.message = "" + (moduleNode.lexer.posToString()) + "\n" + (err.stack || err.message);
           };

           log.error(err.message);

            // #show last soft error. Can be useful to pinpoint the problem
           // if moduleNode.lexer.softError, log.message "previous soft-error: #{moduleNode.lexer.softError.message}"
           if (moduleNode.lexer.softError) {log.message("previous soft-error: " + moduleNode.lexer.softError.message)};

            //if process #we're in node.js
            //    process.exit(1)
            //else
           // throw err
           throw err;
       };
    };

    // method createNewModule(fileInfo) returns Grammar.Module
    Project.prototype.createNewModule = function(fileInfo){

// create a **new Module** and then create a **new lexer** for the Module
// (each module has its own lexer. There is one lexer per file)

       var moduleNode = new Grammar.Module(this.root);
       moduleNode.name = fileInfo.filename;
       moduleNode.fileInfo = fileInfo;
       moduleNode.referenceCount = 0;

// create a Lexer for the module. The Lexer receives this module exports as a "compiler"
// because the lexer preprocessor can compile marcros and generate code in the fly via 'compiler generate'

       moduleNode.lexer = new Lexer(module.exports, this, this.options);

// Now create the module scope, with two local scope vars:
// 'module' and 'exports = module.exports'. 'exports' will hold all exported members.

       moduleNode.createScope();
       var moduleVar = moduleNode.addToScope('module');
       moduleNode.exports = moduleVar.addMember('exports');// #add as member of 'module'
       moduleNode.addToScope('exports', {pointsTo: moduleNode.exports});// #add also as 'exports' in scope

// add other common built-in members of var 'module'. http://nodejs.org/api/modules.html#modules_module_id

       moduleVar.addMember(moduleNode.declareName('filename', {value: fileInfo.filename}));

// Also, register every `import|require` in this module body, to track modules dependencies.
// We create a empty a empty `.requireCallNodes[]`, to hold:
// 1. VariableRef, when is a require() call
// 2. each VariableDecl, from ImportStatements

       moduleNode.requireCallNodes = [];

       return moduleNode;
    };


    // method produceModule(moduleNode:Grammar.Module)
    Project.prototype.produceModule = function(moduleNode){

       moduleNode.lexer.out.browser = this.options.browser;

       // if .options.extraComments
       if (this.options.extraComments) {
           moduleNode.lexer.out.put("//Compiled by LiteScript compiler v" + version + ", source: " + moduleNode.fileInfo.filename);
           moduleNode.lexer.out.startNewLine();
       };

       moduleNode.produce();

        // #referenceSourceMap
       // if no .options.nomap and moduleNode.fileInfo.outExtension
       if (!this.options.nomap && moduleNode.fileInfo.outExtension) {
           moduleNode.lexer.out.startNewLine();
           moduleNode.lexer.out.put("//# sourceMappingURL=" + (moduleNode.fileInfo.basename + moduleNode.fileInfo.outExtension + '.map'));
       };
    };


    // method importDependencies(moduleNode:Grammar.Module)
    Project.prototype.importDependencies = function(moduleNode){

// Check if this module 'imported other modules'. Process Imports (recursive)

       // for each node in moduleNode.requireCallNodes
       for( var node__inx=0,node ; node__inx<moduleNode.requireCallNodes.length ; node__inx++){node=moduleNode.requireCallNodes[node__inx];

           var importInfo = new Environment.ImportParameterInfo();

// get import parameter, and parent Module
// store a pointer to the imported module in
// the statement AST node

// If the origin is: ImportStatement/global Declare

           // if node instance of Grammar.ImportStatementItem
           if (node instanceof Grammar.ImportStatementItem) {
                // declare node:Grammar.ImportStatementItem
               // if node.importParameter
               if (node.importParameter) {
                   importInfo.name = node.importParameter.getValue();
               }
               
               else {
                   importInfo.name = node.name;
               };

// if it was 'global import, inform, else search will be local '.','./lib' and '../lib'

                // declare valid node.parent.global
               // if node.parent instanceof Grammar.DeclareStatement
               if (node.parent instanceof Grammar.DeclareStatement) {
                   importInfo.interface = true;
               }
               
               else if (node.parent instanceof Grammar.ImportStatement) {
                   importInfo.globalImport = node.parent.global;
               };
           }

// else, If the origin is a require() call
           
           else if (node instanceof Grammar.VariableRef) {// #require() call
                // declare node:Grammar.VariableRef
               // if node.accessors and node.accessors[0] instanceof Grammar.FunctionAccess
               if (node.accessors && node.accessors[0] instanceof Grammar.FunctionAccess) {
                   var requireCall = node.accessors[0];
                   // if requireCall.args[0].root.name instanceof Grammar.StringLiteral
                   if (requireCall.args[0].root.name instanceof Grammar.StringLiteral) {
                       importInfo.name = requireCall.args[0].root.name.getValue();
                   };
               };
           };

// if found a valid filename to import

           // if importInfo.name
           if (importInfo.name) {
               node.importedModule = this.importModule(moduleNode, importInfo);
           };
       };// end for each in moduleNode.requireCallNodes
       
    };

        // #loop


    // method importModule(importingModule:Grammar.Module, importInfo: Environment.ImportParameterInfo)
    Project.prototype.importModule = function(importingModule, importInfo){

// importParameter is the raw string passed to `import/require` statements,

// *Return*: a ModuleNode AST Class instance (from local cache, external cache or as a result of compilation)

        // declare valid .recurseLevel

       this.recurseLevel++;
       var indent = String.spaces(this.recurseLevel * 2);

       log.info("");
       log.info(indent, "'" + importingModule.fileInfo.relFilename + "' imports '" + importInfo.name + "'");

// Determine the full module filename. Search for the module in the environment.

       var fileInfo = new Environment.FileInfo(importInfo);

       fileInfo.searchModule(importingModule.fileInfo, this.options);

// Before compiling the module, check internal, and external cache

// Check Internal Cache: if it is already compiled, return cached Module node

       // if .moduleCache.hasOwnProperty(fileInfo.filename) #registered
       if (this.moduleCache.hasOwnProperty(fileInfo.filename)) {// #registered
           log.info(indent, 'cached: ', fileInfo.filename);
           this.recurseLevel--;
           return this.moduleCache[fileInfo.filename];
       };

// It isn't on internal cache, then create a **new Module**.

       var moduleNode = this.createNewModule(fileInfo);

// early add to local cache, to cut off circular references

       this.moduleCache[fileInfo.filename] = moduleNode;

// Check if we can get exports from a "interface.md" file

       // if .getInterface(importingModule, fileInfo, moduleNode)
       if (this.getInterface(importingModule, fileInfo, moduleNode)) {
            // #getInterface also loads and analyze .js interfaces
           // do nothing
           null;
       }

// else, we need to compile the file
       
       else {

           // if importingModule is .root and .options.compileIfNewer and fileInfo.outFileIsNewer
           if (importingModule === this.root && this.options.compileIfNewer && fileInfo.outFileIsNewer) {
               // do nothing //do not compile if source didnt change
               null; //do not compile if source didnt change
           }
           
           else {
               this.compileFile(fileInfo.filename, moduleNode);
               moduleNode.referenceCount++;
           };
       };


// at last, return the parsed Module node

       this.recurseLevel -= 1;
       return moduleNode;
    };

    // #end importModule



    // method getInterface(importingModule,fileInfo, moduleNode:Grammar.Module )
    Project.prototype.getInterface = function(importingModule, fileInfo, moduleNode){
// If a 'interface' file exists, compile interface declarations instead of file
// return true if interface (exports) obtained

       // if fileInfo.interfaceFileExists
       if (fileInfo.interfaceFileExists) {
            // # compile interface
           this.compileFile(fileInfo.interfaceFile, moduleNode);
           return true; //got Interface
       };

// Check if we're compiling for the browser

       // if .options.browser
       if (this.options.browser) {
           // if fileInfo.extension is '.js'
           if (fileInfo.extension === '.js') {
               log.throwControled('Missing ' + fileInfo.relPath + '/' + fileInfo.basename + '.interface.md for ');
           }
           
           else {
               return false; //getInterface returning false means call "CompileFile"
           };
       };

// here, we're compiling for node.js environment
// for .js file/core/global module,
// call node.js **require()** for parameter
// and generate & cache interface

       // if fileInfo.isCore or fileInfo.importInfo.globalImport or fileInfo.extension is '.js'
       if (fileInfo.isCore || fileInfo.importInfo.globalImport || fileInfo.extension === '.js') {

           log.info(String.spaces(this.recurseLevel * 2), fileInfo.isCore ? "core module" : "javascript file", "require('" + fileInfo.relFilename + "')");

           // if not fileInfo.isCore
           if (!(fileInfo.isCore)) {
                // #hack for require(). Simulate we're at the importingModule dir
                // #for require() fn to look at the same dirs as at runtime
                // declare on module paths:string array
                // declare valid module.constructor._nodeModulePaths
                // #declare valid module.filename
               var save = {paths: module.paths, filename: module.filename};
               module.paths = module.constructor._nodeModulePaths(importingModule.fileInfo.dirname);
               module.filename = importingModule.fileInfo.filename;
               debug("importingModule", module.filename);
           };

           var requiredNodeJSModule = require(fileInfo.importInfo.name);
           moduleNode.exports.getMembersFromObjProperties(requiredNodeJSModule);

           // if not fileInfo.isCore #restore
           if (!(fileInfo.isCore)) {// #restore
               module.paths = save.paths;
               module.filename = save.filename;
           };

           return true;
       };
    };

    // helper method compilerVar(name)
    Project.prototype.compilerVar = function(name){
// helper compilerVar(name)
// return root.compilerVars.members[name].value

       var compVar = this.compilerVars.findOwnMember(name);
       // if compVar, return compVar.findOwnMember("**value**")
       if (compVar) {return compVar.findOwnMember("**value**")};
    };

    // helper method setCompilerVar(name,value)
    Project.prototype.setCompilerVar = function(name, value){
// helper compilerVar(name)
// set root.compilerVars.members[name].value

       var compVar = this.compilerVars.findOwnMember(name);
       // if no compVar, compVar = .compilerVars.addMember(name)
       if (!compVar) {compVar = this.compilerVars.addMember(name)};
       compVar.setMember("**value**", value);
    };
   // end class Project

   // end class Project

// Require Extensions
// ------------------

// This segment adds extensions to node's `require` function
// for LiteScript files so that you can just `require` a .lite.md file
// without having to compile it ahead of time

   // helper function extension_LoadLS(requiringModule, filename)
   function extension_LoadLS(requiringModule, filename){

// Read the file, then compile using the `compile` function above.
// Then use node's built-in compile function to compile the generated JavaScript.

       var content = compile(filename, Environment.loadFile(filename), {verbose: 0, warnings: 0});
        // declare valid requiringModule._compile
       requiringModule._compile(content, filename);
   };


   // export helper function registerRequireExtensions
   function registerRequireExtensions(){

// Add the extension for all appropriate file types. Don't overwrite `.md` in case CoffeeScript or something else is already using it.

        // declare on require
            // extensions

       // if require.extensions
       if (require.extensions) {

         require.extensions['.lite.md'] = extension_LoadLS;
         require.extensions['.lite'] = extension_LoadLS;
         require.extensions['.md'] = extension_LoadLS;
       };
   };
   // export
   module.exports.registerRequireExtensions=registerRequireExtensions;


// ##Helper module functions

   // public function getMessages() returns string array
   function getMessages(){
// if compile() throws, call getMessages() to retrieve compiler messages

       return log.getMessages();
   };
   // export
   module.exports.getMessages=getMessages;

// ##Add helper properties and methods to AST node class Module

   // append to class Grammar.Module
     //      properties
        // fileInfo #module file info
        // exports: NameDeclaration # holds module.exports as members
        // requireCallNodes: Grammar.ImportStatementItem array #list of `import` item nodes or `require()` function calls (varRef)
        // referenceCount

    // method getCompiledLines returns array
    Grammar.Module.prototype.getCompiledLines = function(){
       return this.lexer.out.getResult();
    };

    // method getCompiledText returns string
    Grammar.Module.prototype.getCompiledText = function(){
       return this.lexer.out.getResult().join('\n');
    };


   // append to class Grammar.VariableRef
     //      properties
        // importedModule: Grammar.Module
    

   // append to class Grammar.ImportStatementItem
     //      properties
        // importedModule: Grammar.Module
    


// ----------------
   // append to class NameDeclaration
    // helper method toExportArray()
    NameDeclaration.prototype.toExportArray = function(){

// converts .members={} to
// simpler arrays for JSON.stringify & cache

      // #declare valid .members
      // #declare valid item.type.fullName
      // #declare valid item.itemType.fullName

      // #FIX WITH for each own property
     // if .members
     if (this.members) {
       var result = [];
        // # FIX with for each property
       // for each prop in Object.keys(.members)
       var _list1=Object.keys(this.members);
       for( var prop__inx=0,prop ; prop__inx<_list1.length ; prop__inx++){prop=_list1[prop__inx];
         var item = this.members[prop];
         var membersArr = item.toExportArray();// #recursive
          // # FIX with Ternary
         var arrItem = {name: item.name};

          // declare valid arrItem.members
          // declare valid arrItem.type
          // declare valid arrItem.itemType
          // declare valid arrItem.value

         // if membersArr.length
         if (membersArr.length) {
           arrItem.members = membersArr;
         };

         // if item.hasOwnProperty('type') and item.type
         if (item.hasOwnProperty('type') && item.type) {
           arrItem.type = item.type.toString();
         };

         // if item.hasOwnProperty('itemType') and item.itemType
         if (item.hasOwnProperty('itemType') && item.itemType) {
           arrItem.itemType = item.itemType.toString();
         };

         // if item.hasOwnProperty('value')
         if (item.hasOwnProperty('value')) {
           arrItem.value = item.value;
         };

         result.push(arrItem);
       };// end for each in Object.keys(this.members)
       
     };

     return result;
    };

// ----------------
   // append to class NameDeclaration
    // helper method importMembersFromArray(exportedArr: NameDeclaration array) ### Recursive
    NameDeclaration.prototype.importMembersFromArray = function(exportedArr){// ### Recursive

// Inverse of helper method toExportObject()
// converts exported object, back to NameDeclarations and .members[]

        // #declare item:Grammar.Identifier

       // for each item in exportedArr
       for( var item__inx=0,item ; item__inx<exportedArr.length ; item__inx++){item=exportedArr[item__inx];
         var nameDecl = new NameDeclaration(item.name || '(unnamed)');
         // if item.hasOwnProperty('type')
         if (item.hasOwnProperty('type')) {
           nameDecl.type = item.type;
         };
         // if item.hasOwnProperty('value')
         if (item.hasOwnProperty('value')) {
           nameDecl.value = item.value;
         };
         this.addMember(nameDecl);
         // if item.members
         if (item.members) {
           nameDecl.importMembersFromArray(item.members);// #recursive
         };
       };// end for each in exportedArr
       
    };
