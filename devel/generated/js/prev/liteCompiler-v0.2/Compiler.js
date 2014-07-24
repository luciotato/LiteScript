//The LiteScript Compiler Module
//==============================
//LiteScript is a highly readable language that compiles to JavaScript.

//This v0.2 compiler is written in LiteScript v0.1. That is,
//you use the v0.1 compiler to compile this code and you get
//a v0.2 compiler, suporting v0.2 syntax.

//The Compiler module is the main module, requiring all other modules in order to
//compile v0.2 LiteScript code.

//###global declares

    //declare global debug

    //declare global color
    //declare on color
        //normal, red, green

    //declare global log
    //declare on log
        //error, message, warning

    //declare valid log.error.count
    //declare valid log.error.apply
    //declare valid log.error.apply

    //declare on Error
    //declare on Error
        //soft, controled, stack


//###Module Dependencies

   var ASTBase = require('./ASTBase');
   var Grammar = require('./Grammar');
   var Lexer = require('./Lexer');
   var NameDeclaration = require('./NameDeclaration');
   var Validate = require('./Validate');

//Get the 'Environment' object for the compiler to use.
//The 'Environment' object, must provide functions to load files, search modules,
//and a optional external cache (disk).
//The `Environment` abstraction allows us to support compile on server(node) or the browser.

   var Environment = require('./Environment');

   //require('./Producer_js')
   require('./Producer_js');

//Require util functions and declare external objects

   //require('./string-shims') #.startWith, endsWith
   require('./string-shims');//#.startWith, endsWith
   //require('./util') #global debug, log
   require('./util');//#global debug, log

//----------------
//We add helper properties and method to AST node class Module

   //append to Module.prototype
   
     //     properties
        //fileInfo #module file info
        //exports: NameDeclaration # holds module.exports as members
        //requireCallNodes: Grammar.VariableRef array #list of VariableRef being `require()` calls or `import` statements

   //append to VariableRef.prototype
   
     //     properties
        //importedModule: Grammar.Module

   //class Project, constructor:
   function Project(basePath, options){

//normalize options

       //default options =
       if(!options) options={};
       if(options.target===undefined) options.target='js';
       if(options.debug===undefined) options.debug=false;
       if(options.force===undefined) options.force=false;

        //declare global debugOptions
        //declare on debugOptions enabled
       debugOptions.enabled = options.debug;

//Initialize this project. Project has a cache for required modules.
//As with node's `require` mechanism, a module,
//when imported|required is only compiled once and then cached.

       this.name = 'Project';
       this.basePath = basePath;
       this.options = options;
       this.moduleCache = {};

       this.fileInfo = {
           dirname: ".", 
           moduleName: this.name
           };

       this.root = new Grammar.Module(this);
       this.root.name = 'Project Root Dir ' + basePath;

//compiler vars, to use at conditional compilation

        //declare valid me.root.compilerVars.addMember
        //me.root.compilerVars = new NameDeclaration("Compiler Vars")
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

//The **Producer** module append to each Grammar class a `produce()` method
//which generates target code for the AST class. Example: [Producer_js.lite.md]

       this.Producer = require('./Producer_' + options.target);
    };
   
   // declared properties & methods
     //     properties

        //options,
        //name, basePath, fileInfo
        //moduleCache
        //root: Grammar.Module
        //main: Grammar.Module
        //Producer
        //recurseLevel = 0
       Project.prototype.recurseLevel=0;


    //     method createNewModule(fileInfo) returns Grammar.Module
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
       moduleNode.exports = moduleVar.addMember('exports');//#add as member of 'module'
       //moduleNode.addToScope('exports',{pointsTo:moduleNode.exports}) #add also as 'exports' in scope
       moduleNode.addToScope('exports', {pointsTo: moduleNode.exports});//#add also as 'exports' in scope

//add other common built-in members of var 'module'. http://nodejs.org/api/modules.html#modules_module_id

       //moduleVar.addMember moduleNode.declareName('filename',{value: fileInfo.filename})
       moduleVar.addMember(moduleNode.declareName('filename', {value: fileInfo.filename}));

//Also, register every `import|require` in this module body, to track modules dependencies.
//We create a empty a empty `.requireCallNodes[]`, to hold:
    //.VariableRef, when is a require() call
    //.ImportStatement

       moduleNode.requireCallNodes = [];

       //return moduleNode
       return moduleNode;
    };


    //     method parseOnModule(moduleNode:Grammar.Module, sourceLines)
    Project.prototype.parseOnModule = function(moduleNode, sourceLines){
     try{
//This method will initialize lexer & parse  source lines into ModuleNode scope

//set Lexer source code, process lines, tokenize

       var stage = "lexer";
       //moduleNode.lexer.initSource( moduleNode.name, sourceLines )
       moduleNode.lexer.initSource(moduleNode.name, sourceLines);
       //moduleNode.lexer.process()
       moduleNode.lexer.process();

//Parse source

       stage = "parsing";
       //moduleNode.parse()
       moduleNode.parse();

//Check if errors were emitted

       //if moduleNode.lexer.errCount
       if (moduleNode.lexer.errCount) {
           var errsEmitted = new Error("" + (moduleNode.lexer.errCount) + " errors emitted");
           errsEmitted.controled = true;
           //throw errsEmitted
           throw errsEmitted;
       };

//Handle errors, add stage info, and stack

       //exception err
       
       }catch(err){

           err = moduleNode.lexer.hardError || err;//get important (inner) error
           //if not err.controled  //if not 'controled' show lexer pos & call stack (includes err text)
           if (!(err.controled)) {//if not 'controled' show lexer pos & call stack (includes err text)
               err.message = "" + (moduleNode.lexer.posToString()) + "\n" + (err.stack || err.message);
           };

           //log.error err.message
           log.error(err.message);

            //#show last soft error. Helps the programmer pinpoint the problem
           //if moduleNode.lexer.softError, log.message "previous soft-error: #moduleNode.lexer.softError.message"
           if (moduleNode.lexer.softError) {
               log.message("previous soft-error: " + moduleNode.lexer.softError.message)};

           //if process #we're in node.js
           if (process) {//#we're in node.js
               //process.exit(1)
               process.exit(1);
           }
           else {
               //throw err
               throw err;
           
           };
       };
    };


    //     method importModule(importingModule:Grammar.Module, importParameter)
    Project.prototype.importModule = function(importingModule, importParameter){

//The importModule method receives a `importParameter` string,
//the raw string passed to `import/require` statements,
//with the module to load and compile.

//*Return*: a ModuleNode AST Class instance (from local cache, external cache or as a result of compilation)

        //declare valid me.root
        //declare valid me.recurseLevel
        //declare valid me.recurseLevel

        //declare valid importingModule.fileInfo.dirname
        //declare valid importingModule.fileInfo.dirname
        //declare valid importingModule.fileInfo.importParameter
        //declare valid importingModule.fileInfo.importParameter

//log

        //me.recurseLevel+=1
       this.recurseLevel += 1;
       var indent = String.spaces(this.recurseLevel * 2);
       //log.message ""
       log.message("");
       //log.message indent,"'#{importingModule.fileInfo.importParameter}' imports '#{importParameter}'"
       log.message(indent, "'" + (importingModule.fileInfo.importParameter) + "' imports '" + (importParameter) + "'");

//Determine the full module filename. Search for the module in the environment.

       var fileInfo = Environment.searchModule(importParameter, this.basePath, importingModule.fileInfo.dirname, this.options);

//Before compiling the module, check internal, and external cache

//Check Internal Cache: if it is already compiled, return cached Module node

       //if me.moduleCache.hasOwnProperty(fileInfo.filename) #registered
       if (this.moduleCache.hasOwnProperty(fileInfo.filename)) {//#registered
           //log.message indent,'cached: ',fileInfo.filename.slice(-20)
           log.message(indent, 'cached: ', fileInfo.filename.slice(-20));
           this.recurseLevel -= 1;
           //return me.moduleCache[fileInfo.filename]
           return this.moduleCache[fileInfo.filename];
       };

//It isn't on internal cache, then create a **new Module**.

       var moduleNode = this.createNewModule(fileInfo);

//early add to local cache, to cut off circular references

       this.moduleCache[fileInfo.filename] = moduleNode;

//if it is not a lite file, just copy the file to output dir

       //if not fileInfo.isLite
       if (!(fileInfo.isLite)) {

//if extension is .js or fileInfo.isCore, nodejs-require the module, and get the exported vars

           //if fileInfo.extension is '.js' or fileInfo.isCore
           if (fileInfo.extension === '.js' || fileInfo.isCore) {
               //log.message indent,fileInfo.isCore?"core module":"javascript file","require('#{fileInfo.importParameter}')"
               log.message(indent, fileInfo.isCore ? "core module" : "javascript file", "require('" + (fileInfo.importParameter) + "')");
               //moduleNode.exports.getMembersFromObjProperties(require(fileInfo.filename))
               moduleNode.exports.getMembersFromObjProperties(require(fileInfo.filename));
           };

           this.recurseLevel -= 1;
           //return moduleNode #import is done here
           return moduleNode;//#import is done here
       };

//External cache
//--------------

        //declare valid me.options.force

        //#EXTERNAL CACHE DISABLED - beta
        //if true or me.options.force #do not use cache, delete files
       //if true or me.options.force #do not use cache, delete files
       if (true || this.options.force) {//#do not use cache, delete files
           //Environment.externalCacheSave(fileInfo.outFilename)
           Environment.externalCacheSave(fileInfo.outFilename);
           //Environment.externalCacheSave(fileInfo.outExportRequired)
           Environment.externalCacheSave(fileInfo.outExportRequired);
       }
       else {

//Check External Cache:

//If the module is already compiled and cached in external cache (disk)
//We just retrieve externally cached members and the list of required modules,
//to continue with the dependency tree

           //if Environment.checkExternalCache(fileInfo, me.options)
           if (Environment.checkExternalCache(fileInfo, this.options)) {

               //log.message indent,'cached (external): ', fileInfo.outFilename
               log.message(indent, 'cached (external): ', fileInfo.outFilename);

//Get cached members

               var declarationsContent = Environment.loadFile(fileInfo.outExportRequired);
               var declarationsCache = JSON.parse(declarationsContent);

                //declare on declarationsCache
                    //exported:array,required:array

//exported names goes to moduleNode.exports

               //moduleNode.exports.importMembersFromArray(declarationsCache.exported)
               moduleNode.exports.importMembersFromArray(declarationsCache.exported);

//Import the required modules, walk the dependency tree

               //for requiredParam in declarationsCache.required
               for ( var requiredParam__inx=0; requiredParam__inx<declarationsCache.required.length; requiredParam__inx++) {
                   var requiredParam=declarationsCache.required[requiredParam__inx];
                   //me.importModule(moduleNode,requiredParam)
                   this.importModule(moduleNode, requiredParam);
               }; // end for each in declarationsCache.required

//and return the node, since it does not need compilation

               this.recurseLevel -= 1;
               //return moduleNode
               return moduleNode;
           };

           //end if # in external cache
           
       };

       //end if # force - do not check External cache


//Compilation:
//------------
//If we have reached here, we need to parse the source. 'to parse' a module means:
//Load source -> Lexer/Tokenize -> Parse/create AST

       //log.message indent,"compile: '#{fileInfo.importParameter}'"
       log.message(indent, "compile: '" + (fileInfo.importParameter) + "'");

//Load source code, parse

       //me.parseOnModule moduleNode, Environment.loadFile(fileInfo.filename)
       this.parseOnModule(moduleNode, Environment.loadFile(fileInfo.filename));

//Check if this module 'imported other modules'. Process Imports (recursive)

       //for each node in moduleNode.requireCallNodes
       for ( var node__inx=0; node__inx<moduleNode.requireCallNodes.length; node__inx++) {
           var node=moduleNode.requireCallNodes[node__inx];

           //if node instance of Grammar.VariableRef
           if (node instanceof Grammar.VariableRef) {
               //if node.accessors and node.accessors[0] instanceof Grammar.FunctionAccess
               if (node.accessors && node.accessors[0] instanceof Grammar.FunctionAccess) {
                 var requireCall = node.accessors[0];
                 //if requireCall.args[0].root.name instanceof Grammar.StringLiteral
                 if (requireCall.args[0].root.name instanceof Grammar.StringLiteral) {

//get import parameter, and parent Module
//store pointer to imported module in AST VarRef node

                       var requireParameter = requireCall.args[0].root.name.getValue();

                       node.importedModule = this.importModule(moduleNode, requireParameter);
                 };
               };
           };
       }; // end for each in moduleNode.requireCallNodes


//and return the Module node

       this.recurseLevel -= 1;
       //return moduleNode
       return moduleNode;
    };
   
   //end class Project

    //#end importModule


   //    public function compileLines (filename, sourceLines, options)
   function compileLines(filename, sourceLines, options){

//input:
//* filename (for error reporting),
//* sourceLines: string array, LiteScript code.

//output:
//* moduleNode:Grammar.Module
//* compiled result is at: moduleNode.outCode.getResult() :string array

       var project = new Project('.', options || {});

       var fileInfo = {filename: filename, dirname: '.'};

       var moduleNode = project.createNewModule(fileInfo);

       log.error.count = 0;

//parse source lines & store in moduleCache for validation

       //project.parseOnModule moduleNode, sourceLines
       project.parseOnModule(moduleNode, sourceLines);
       project.moduleCache[filename] = moduleNode;

//validate var & property names

       //Validate.validate project
       Validate.validate(project);
       //if log.error.count is 0, log.message "Validation OK"
       if (log.error.count === 0) {
           log.message("Validation OK")};

//initialize out buffer & produce target code

       //log.message "Generating #options.target"
       log.message("Generating " + options.target);
       //moduleNode.outCode.start
       moduleNode.outCode.start();
       //moduleNode.produce
       moduleNode.produce();
        //# the produced code will be at: moduleNode.outCode.getResult() :string array

       //return moduleNode
       return moduleNode;
   };
   exports.compileLines=compileLines;


   //    public function compile (basePath, mainModuleName, options)
   function compile(basePath, mainModuleName, options){

//The 'compile' function will import and compile the main Module of a project.
//The compilation of the main module will trigger import and compilation of all its "child" modules
//(dependency tree is constructed by `import`/`require` between modules)

//Create a 'Project' to hold the main module and dependent modules

//The main module is the root of the module dependency tree, and can reference
//another modules via import|require.

       //default options =
       if(!options) options={};
       if(options.outDir===undefined) options.outDir=undefined;
       if(options.target===undefined) options.target='js';

       var project = new Project(basePath, options);

       //log.message "Base Path: #{basePath}"
       log.message("Base Path: " + (basePath));
       //log.message "Out Dir: #{options.outDir}"
       log.message("Out Dir: " + (options.outDir));

//Import the main module. The main module will, in turn, 'import' and 'compile' -if not cached-,
//all dependent modules.

       project.main = project.importModule(project, mainModuleName);

       //if log.error.count is 0
       if (log.error.count === 0) {
           //print "parsed OK"
           console.log("parsed OK");
       };

       //print "Validating"
       console.log("Validating");
       //Validate.validate(project)
       Validate.validate(project);
       //if log.error.count
       if (log.error.count) {
           var err = new Error(log.error.count + " errors");
           err.controled = true;
           //throw err
           throw err;
       };

       //print "\nProducing #options.target\n"
       console.log("\nProducing " + options.target + "\n");

       //for each own property filename in project.moduleCache
       for ( var filename in project.moduleCache) if (project.moduleCache.hasOwnProperty(filename)) {

           var moduleNode = project.moduleCache[filename];
           //if not moduleNode.fileInfo.isCore
           if (!(moduleNode.fileInfo.isCore)) {

               //log.message "source:",moduleNode.fileInfo.importParameter
               log.message("source:", moduleNode.fileInfo.importParameter);
               var result = undefined;

               //if not moduleNode.fileInfo.isLite
               if (!(moduleNode.fileInfo.isLite)) {
                   //log.message 'non-Lite module, copy to out dir.'
                   log.message('non-Lite module, copy to out dir.');
                    //#copy the file to output dir
                   var contents = Environment.loadFile(moduleNode.fileInfo.filename);
                    //declare valid contents.length
                    //Environment.externalCacheSave(moduleNode.fileInfo.outFilename, contents)
                   //Environment.externalCacheSave(moduleNode.fileInfo.outFilename, contents)
                   Environment.externalCacheSave(moduleNode.fileInfo.outFilename, contents);
                   result = "" + (contents.length >> 10 || 1) + " kb";
                   contents = undefined;
               }
               else {

//initialize out buffer & produce target code

                   //moduleNode.outCode.start
                   moduleNode.outCode.start();
                   //moduleNode.produce
                   moduleNode.produce();
                   var resultLines = moduleNode.outCode.getResult();

//add to external cache (save to disk)

                   //Environment.externalCacheSave(moduleNode.fileInfo.outFilename,resultLines)
                   Environment.externalCacheSave(moduleNode.fileInfo.outFilename, resultLines);
                   result = resultLines.length + " lines";
               
               };


//                    var exportedArray = moduleNode.exports.toExportArray()
//                    var cacheContents = JSON.stringify({required:[], exported:exportedArray},null,2)
//                    Environment.externalCacheSave(moduleNode.fileInfo.outExportRequired, cacheContents)
//        

               //end if

               //log.message color.green+"[OK],",result,'->', moduleNode.fileInfo.outRelFilename, color.normal
               log.message(color.green + "[OK],", result, '->', moduleNode.fileInfo.outRelFilename, color.normal);
               //log.message #blank line
               log.message();//#blank line
           };

           //end if core
           }; // end for each property

       //end for


//After generating all modules, if no errors occurred,
//mainModuleName and all its dependencies will be compiled in
//the output dir: './out/debug'

       //return project
       return project;
   };
   exports.compile=compile;

   //class FileInfo, constructor:
   function FileInfo(){};
   
   // declared properties & methods
        //properties
            //importParameter #: raw string passed to import/require
            //dirname #: path.dirname(importParameter)
            //extension #: path.extname(importParameter)
            //moduleName #: clean module name, no path no extension
            //isLite #: true is extension is '.lite'|'.lite.md'
            //filename #: found full module filename
            //outFilename #: output file for code production
            //outExportRequired #: output file for export members cache
            //outExportRequiredExists #: if outExportRequired file exists
   
   //end class FileInfo


//----------------
   //append to NameDeclaration.prototype
   
    //     helper method toExportArray()
    NameDeclaration.prototype.toExportArray = function(){

//converts .members={} to
//simpler arrays for JSON.stringify & cache

      //#declare valid me.members
      //#declare valid item.type.fullName
      //#declare valid item.itemType.fullName

      //#FIX WITH for each own property
     //if me.members
     if (this.members) {
       var result = [];
        //# FIX with for each property
       //for prop in Object.keys(me.members)
       var list__1=Object.keys(this.members);
       for ( var prop__inx=0; prop__inx<list__1.length; prop__inx++) {
         var prop=list__1[prop__inx];
         var item = this.members[prop];
         var membersArr = item.toExportArray();//#recursive
          //# FIX with Ternary
         var arrItem = {name: item.name};

          //declare valid arrItem.members
          //declare valid arrItem.type
          //declare valid arrItem.type
          //declare valid arrItem.itemType
          //declare valid arrItem.itemType
          //declare valid arrItem.value
          //declare valid arrItem.value

          //if membersArr.length
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
   //append to NameDeclaration.prototype
   
    //     helper method importMembersFromArray(exportedArr: NameDeclaration array) ### Recursive
    NameDeclaration.prototype.importMembersFromArray = function(exportedArr){//### Recursive

//Inverse of helper method toExportObject()
//converts exported object, back to NameDeclarations and .members[]

        //#declare item:Grammar.Identifier

       //for item in exportedArr
       for ( var item__inx=0; item__inx<exportedArr.length; item__inx++) {
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
           nameDecl.importMembersFromArray(item.members);//#recursive
         };
       }; // end for each in exportedArr
    };