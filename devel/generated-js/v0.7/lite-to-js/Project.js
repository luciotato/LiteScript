//Compiled by LiteScript compiler v0.6.7, source: /home/ltato/LiteScript/devel/source/v0.7/Project.lite.md
// The LiteScript Project Module
// ==============================
// LiteScript is a highly readable language that compiles to JavaScript.

// ###Module Dependencies

// The Project Class require all other modules to
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

    //import Producer_c
    // #else
   // import Producer_js
   var Producer_js = require('./Producer_js');
    // #endif

// ----------------
   // export default class Project
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

        //var DEFAULT_TARGET="c"
        // #else
       var DEFAULT_TARGET = "js";
        // #end if

       // default options =
       if(!options) options={};
       if(options.verbose===undefined) options.verbose=1;
       if(options.warning===undefined) options.warning=1;
       if(options.comments===undefined) options.comments=1;
       if(options.target===undefined) options.target=DEFAULT_TARGET;
       if(options.outDir===undefined) options.outDir='.';
       // options.debug: undefined
       // options.skip: undefined
       // options.nomap: undefined
       // options.single: undefined
       // options.compileIfNewer: undefined
       // options.browser: undefined
       if(options.extraComments===undefined) options.extraComments=1;
       if(options.defines===undefined) options.defines=[];
       if(options.literalMap===undefined) options.literalMap=false;
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

       // import StringShims
       var StringShims = require('./StringShims');

// compiler vars, to use at conditional compilation

       this.compilerVars = new NameDeclaration("Compiler Vars");

       // for each def in options.defines
       for( var def__inx=0,def ; def__inx<options.defines.length ; def__inx++){def=options.defines[def__inx];
           this.compilerVars.addMember(def, {value: true});
       };// end for each in options.defines

       // if options.browser, .compilerVars.addMember "FOR_BROWSER",{value:true}
       if (options.browser) {this.compilerVars.addMember("FOR_BROWSER", {value: true})};

// add 'inNode' and 'inBrowser' as compiler vars

        //.compilerVars.addMember 'ENV_JS',{value:true}
        // #endif
        //.compilerVars.addMember 'ENV_C',{value:true}
        // #endif

        // declare var window
       var inNode = typeof window === 'undefined';
       // if inNode
       if (inNode) {
           this.compilerVars.addMember('ENV_NODE', {value: true});
       }
       
       else {
           this.compilerVars.addMember('ENV_BROWSER', {value: true});
       };
       // end if

       this.compilerVars.addMember('TARGET_' + (options.target.toUpperCase()), {value: true});

       var defined = [];
       // for each own property key,nameDecl in .compilerVars.members
       var nameDecl=undefined;
       for ( var key in this.compilerVars.members)if (this.compilerVars.members.hasOwnProperty(key)){nameDecl=this.compilerVars.members[key];
           {
           defined.push(nameDecl.name);
           }
           
           }// end for each property

       log.message('preprocessor #defined', defined);

        //log.message .compilerVars
        //log.info ""

// in 'options' we receive also the target code to generate. (default is 'js')

// Now we load the **Producer** module for the selected target code.

// The **Producer** module will append to each Grammar class a `produce()` method
// which generates target code for the AST class

       this.Producer = require('./Producer_' + options.target);
    };

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
           Validate.launch(this);
           // if log.error.count, log.throwControled log.error.count,"errors"
           if (log.error.count) {log.throwControled(log.error.count, "errors")};
       };

// Produce, for each module

       log.info("\nProducing " + this.options.target + " at " + this.options.outDir + "\n");

        //Producer_c.preProduction this
        // #endif

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

                //resultLines =  moduleNode.lexer.out.getResult(1) //get .h file contents
                //if resultLines.length
                    //Environment.externalCacheSave moduleNode.fileInfo.outFilename.slice(0,-1)+'h',resultLines
                // #endif

                //do nothing //no source map
                // #else
               // if moduleNode.lexer.out.sourceMap
               if (moduleNode.lexer.out.sourceMap) {

                   Environment.externalCacheSave(moduleNode.fileInfo.outFilename + '.map', moduleNode.lexer.out.sourceMap.generate({generatedFile: moduleNode.fileInfo.basename + moduleNode.fileInfo.outExtension, sourceFiles: [moduleNode.fileInfo.sourcename]}));
               };
           };
                // #end if

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

        //if no log.error.count, Producer_c.postProduction this
        // #endif

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
// because the lexer preprocessor can compile marcros and generate code on the fly
// via 'compiler generate'

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
           moduleNode.lexer.out.put("//Compiled by LiteScript compiler v" + Project.version + ", source: " + moduleNode.fileInfo.filename);
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

// if it was 'global import, inform, els search will be local '.','./lib' and '../lib'

                // declare valid node.parent.global
               // if node.parent instanceof Grammar.DeclareStatement
               if (node.parent instanceof Grammar.DeclareStatement) {
                   importInfo.interface = true;
               }
               
               else if (node.parent instanceof Grammar.ImportStatement) {
                   importInfo.globalImport = false; //node.parent.global
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
                //try
                   node.importedModule = this.importModule(moduleNode, importInfo);
           };
       };// end for each in moduleNode.requireCallNodes
       
    };
                //catch err
                //    #show import statement source location
                //    node.sayErr '#{err.message} importing module "#{importInfo.name}"'
                //    raise err //re-throw


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

       // if fileInfo.isCore or  fileInfo.extension is '.js'
       if (fileInfo.isCore || fileInfo.extension === '.js') {

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

    // helper method redirectOutput(newOut)
    Project.prototype.redirectOutput = function(newOut){

       // for each own property filename in .moduleCache
       for ( var filename in this.moduleCache)if (this.moduleCache.hasOwnProperty(filename)){
             var moduleNode = this.moduleCache[filename];
             moduleNode.lexer.out = newOut;
             }
       // end for each property
       
    };
   // end class Project

   // end class Project

   // append to namespace Project
     //      properties // as namespace properties
        // version:string #version. set from compiler
    


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

module.exports=Project;
//# sourceMappingURL=Project.js.map