//Compiled by LiteScript compiler v0.7.0, source: /home/ltato/LiteScript/devel/source-v0.8/Producer_c.lite.md
// Producer C
// ===========

// The `producer` module extends Grammar classes, adding a `produce()` method
// to generate target code for the node.

// The compiler calls the `.produce()` method of the root 'Module' node
// in order to return the compiled code for the entire tree.

// We extend the Grammar classes, so this module require the `Grammar` module.

   // import
   var Project = require('./Project.js');
   var Parser = require('./Parser.js');
   var ASTBase = require('./ASTBase.js');
   var Grammar = require('./Grammar.js');
   var Names = require('./Names.js');
   var Environment = require('./lib/Environment.js');
   var logger = require('./lib/logger.js');
   var color = require('./lib/color.js');
   var UniqueID = require('./lib/UniqueID.js');

   // shim import LiteCore, Map
   var LiteCore = require('./LiteCore.js');
   var Map = require('./lib/Map.js');

// "C" Producer Functions
// ==========================

// module vars

    // # list of classes, to call _newClass & _declareMethodsAndProps
   var allClasses = [];

// store each distinct method name (globally).
// We start with core-supported methods.
// Method get a trailing "_" if they're a C reserved word

   var allMethodNames = new Map().fromObject({}); // all distinct methodnames, to declare method symbols
   var allPropertyNames = new Map().fromObject({}); // all distinct propname, to declare props symbols

   var coreSupportedMethods = ["toString", "tryGetMethod", "tryGetProperty", "getProperty", "getPropertyName", "hasProperty", "has", "get", "set", "clear", "delete", "keys", "slice", "split", "indexOf", "lastIndexOf", "concat", "toUpperCase", "toLowerCase", "charAt", "replaceAll", "trim", "toDateString", "toTimeString", "toUTCString", "toISOString", "shift", "push", "unshift", "pop", "join", "splice"];

   var coreSupportedProps = ['name', 'size', 'value', 'message', 'stack', 'code'];

   var dispatcherModule = undefined;
   // export
   module.exports.dispatcherModule = dispatcherModule;

   var appendToCoreClassMethods = [];

   var DEFAULT_ARGUMENTS = "(any this, len_t argc, any* arguments)";


   // public function postProduction(project)
   function postProduction(project){

// create _dispatcher.c & .h

       module.exports.dispatcherModule = new Grammar.Module();
        // declare valid project.options
       module.exports.dispatcherModule.lexer = new Parser.Lexer(project, project.options);

       project.redirectOutput(module.exports.dispatcherModule.lexer.outCode); // all Lexers now out here

       module.exports.dispatcherModule.fileInfo = Environment.fileInfoNewFile("_dispatcher", project.options.target);
       module.exports.dispatcherModule.produceDispatcher(project);

       var resultLines = module.exports.dispatcherModule.lexer.outCode.getResult(); //get .c file contents
       // if resultLines.length
       if (resultLines.length) {
           Environment.externalCacheSave(module.exports.dispatcherModule.fileInfo.outFilename, resultLines);
       };

       resultLines = module.exports.dispatcherModule.lexer.outCode.getResult(1); //get .h file contents
       // if resultLines.length
       if (resultLines.length) {
           Environment.externalCacheSave('' + (module.exports.dispatcherModule.fileInfo.outFilename.slice(0, -1)) + 'h', resultLines);
       };

       logger.msg("" + color.green + "[OK] -> " + module.exports.dispatcherModule.fileInfo.outRelFilename + " " + color.normal);
       logger.extra();// #blank line
   };
   // export
   module.exports.postProduction=postProduction;

   // end function

   // helper function normalizeDefine(name:string)
   function normalizeDefine(name){
       var chr = undefined, result = "";
       // for n=0 to name.length
       var _end6=name.length;
       for( var n=0; n<=_end6; n++) {
           chr = name.charAt(n).toUpperCase();
           // if chr<'A' or chr>'Z', chr="_"
           if (chr < 'A' || chr > 'Z') {chr = "_"};
           result = "" + result + chr;
       };// end for n

       return result;
   };


   // append to class Grammar.Module ###

    // method produceDispatcher(project)
    Grammar.Module.prototype.produceDispatcher = function(project){

       var requiredHeaders = [];

// _dispatcher.h

       this.out(new Map().fromObject({h: 1}), NL, '#ifndef ' + (normalizeDefine(this.fileInfo.outRelFilename)) + '_H', NL, '#define ' + (normalizeDefine(this.fileInfo.outRelFilename)) + '_H', NL, NL, '#include "../core/LiteC-core.h"', NL, NL, NL);

// LiteC__init extern declaration

       this.out(NL, new Map().fromObject({COMMENT: 'core support and defined classes init'}), NL, 'extern void __declareClasses();', NL, NL);

// verbs & things

// now all distinct method names

       this.out(new Map().fromObject({COMMENT: 'methods'}), NL, NL, "enum _VERBS { //a symbol for each distinct method name", NL);

       var initialValue = " = -_CORE_METHODS_MAX-" + allMethodNames.size;
       // for each methodDeclaration in map allMethodNames
       var methodDeclaration=undefined;
       if(!allMethodNames.dict) throw(new Error("for each in map: not a Map, no .dict property"));
       for ( var methodDeclaration__propName in allMethodNames.dict) if (allMethodNames.dict.hasOwnProperty(methodDeclaration__propName)){methodDeclaration=allMethodNames.dict[methodDeclaration__propName];
           {
           this.out('    ', makeSymbolName(methodDeclaration.name), initialValue, ",", NL);
           initialValue = undefined;
           }
           
           }// end for each property
       this.out(NL, "_LAST_VERB};", NL);

// all  distinct property names

       this.out(new Map().fromObject({COMMENT: 'propery names'}), NL, NL, "enum _THINGS { //a symbol for each distinct property name", NL);

       initialValue = "= _CORE_PROPS_LENGTH";
       // for each name,value in map allPropertyNames
       var value=undefined;
       if(!allPropertyNames.dict) throw(new Error("for each in map: not a Map, no .dict property"));
       for ( var name in allPropertyNames.dict) if (allPropertyNames.dict.hasOwnProperty(name)){value=allPropertyNames.dict[name];
           {
           this.out('    ', makeSymbolName(name), initialValue, ",", NL);
           initialValue = undefined;
           }
           
           }// end for each property
       this.out(NL, "_LAST_THING};", NL, NL, NL);

// Now include headers for all the imported modules.
// To put this last is important, because if there's a error in the included.h
// and it's *before* declaring _VERBS and _THINGS, _VERBS and _THINGS don't get
// declared and the C compiler shows errors everywhere

       // for each moduleNode:Grammar.Module in map project.moduleCache
       var moduleNode=undefined;
       if(!project.moduleCache.dict) throw(new Error("for each in map: not a Map, no .dict property"));
       for ( var moduleNode__propName in project.moduleCache.dict) if (project.moduleCache.dict.hasOwnProperty(moduleNode__propName)){moduleNode=project.moduleCache.dict[moduleNode__propName];
           {
           var hFile = moduleNode.fileInfo.outWithExtension(".h");
           hFile = Environment.relativeFrom(this.fileInfo.outDir, hFile);
           this.out('#include "' + hFile + '"', NL);
           }
           
           }// end for each property

       this.out(NL, NL, "#endif", NL, NL);

// _dispatcher.c

       this.out(new Map().fromObject({h: 0}), NL, '#include "_dispatcher.h"', NL, NL, NL, NL);

// static definition added verbs (methods) and things (properties)

       this.out(new Map().fromObject({COMMENT: 'methods'}), NL, NL, "static str _ADD_VERBS[] = { //string name for each distinct method name", NL, new Map().fromObject({pre: '    "', CSL: allMethodNames.keys(), post: '"\n'}), '};', NL, NL);

// all  distinct property names

       this.out(new Map().fromObject({COMMENT: 'propery names'}), NL, NL, "static str _ADD_THINGS[] = { //string name for each distinct property name", NL, new Map().fromObject({pre: '    "', CSL: allPropertyNames.keys(), post: '"\n'}), '};', NL, NL);

// All literal Maps & arrays

// for each nameDecl in map .scope.members
//             where nameDecl.nodeDeclared instanceof Grammar.Literal
//                 .out nameDecl,";",NL
//         

// _dispatcher.c contains main function

       this.out("\n\n\n//-------------------------------", NL, "int main(int argc, char** argv) {", NL, '    LiteC_init(argc,argv);', NL, '    LiteC_addMethodSymbols( ' + allMethodNames.size + ', _ADD_VERBS);', NL, '    LiteC_addPropSymbols( ' + allPropertyNames.size + ', _ADD_THINGS);', NL);


// process methods appended to core classes, by calling LiteC_registerShim

       this.out('\n');
       // for each methodDeclaration in appendToCoreClassMethods
       for( var methodDeclaration__inx=0,methodDeclaration ; methodDeclaration__inx<appendToCoreClassMethods.length ; methodDeclaration__inx++){methodDeclaration=appendToCoreClassMethods[methodDeclaration__inx];
               var appendToDeclaration = methodDeclaration.getParent(Grammar.ClassDeclaration);
               this.out('    LiteC_registerShim(', appendToDeclaration.varRef, ',' + methodDeclaration.name + '_,', appendToDeclaration.varRef, '_', methodDeclaration.name, ');', NL);
       };// end for each in appendToCoreClassMethods

// call __ModuleInit for all the imported modules. call the base modules init first

       var moduleList = [];

       // for each moduleNode:Grammar.Module in map project.moduleCache
       var moduleNode=undefined;
       if(!project.moduleCache.dict) throw(new Error("for each in map: not a Map, no .dict property"));
       for ( var moduleNode__propName in project.moduleCache.dict) if (project.moduleCache.dict.hasOwnProperty(moduleNode__propName)){moduleNode=project.moduleCache.dict[moduleNode__propName];
       if(moduleNode !== project.main){
               moduleList.push(moduleNode); //order in moduleCache is lower level to higher level
               }
               
               }// end for each property

       this.out('\n');
       // for each nodeModule in moduleList
       for( var nodeModule__inx=0,nodeModule ; nodeModule__inx<moduleList.length ; nodeModule__inx++){nodeModule=moduleList[nodeModule__inx];
           this.out('    ', nodeModule.fileInfo.base, '__moduleInit();', NL);
       };// end for each in moduleList

// call main module __init

       this.out('\n\n    ', project.main.fileInfo.base, '__moduleInit();', NL);

       this.out('}', NL, new Map().fromObject({COMMENT: 'end main'}), NL);
    };


    // method produce() # Module
    Grammar.Module.prototype.produce = function(){// # Module

// default #includes:
// "LiteC-core.h" in the header, the .h in the .c

       this.out(new Map().fromObject({h: 1}), NL, '#ifndef ' + (normalizeDefine(this.fileInfo.outRelFilename)) + '_H', NL, '#define ' + (normalizeDefine(this.fileInfo.outRelFilename)) + '_H', NL, NL);

       var thisBase = Environment.dirName(this.fileInfo.outFilename);

        // declare valid .parent.fileInfo.outFilename
       var dispatcherFull = "" + (Environment.dirName(this.parent.fileInfo.outFilename)) + "/_dispatcher.h";
       this.out('#include "' + (Environment.relativeFrom(thisBase, dispatcherFull)) + '"', NL);

       var prefix = this.fileInfo.base;

// header

       this.out("//-------------------------", NL, "//Module ", prefix, NL, "//-------------------------", NL);

// Modules have a __moduleInit function holding module items initialization and any loose statements

       this.out("extern void ", prefix, "__moduleInit(void);", NL);

// Interfaces have a __nativeInit function to provide a initialization opportunity
// to module native support

       // if .fileInfo.isInterface // add call to native hand-coded C support for this module
       if (this.fileInfo.isInterface) { // add call to native hand-coded C support for this module
           this.out("extern void ", prefix, "__nativeInit(void);", NL);
       };

// Since we cannot initialize a module var at declaration in C (err:initializer element is not constant),
// we separate declaration from initialization.

// Var names declared inside a module/namespace, get prefixed with namespace name

// module vars declared public

        // add each public/export item as a extern declaration
       this.produceDeclaredExternProps(prefix);

// Now produce the .c file,

       this.out(new Map().fromObject({h: 0}), '#include "' + prefix + '.h"', NL, NL, "//-------------------------", NL, "//Module ", prefix, this.fileInfo.isInterface ? ' - INTERFACE' : '', NL, "//-------------------------", NL);

        //space to insert __or temp vars
       var insertPos = this.lexer.outCode.lines.length;
       this.lexer.outCode.blankLine();
       this.lexer.outCode.blankLine();

        // add sustance for the module
       this.produceSustance(prefix);

// __moduleInit: module main function

       this.out("\n\n//-------------------------", NL, "void ", prefix, "__moduleInit(void){", NL);

//         for each nameDecl in map .scope.members
//             if nameDecl.nodeDeclared instanceof Grammar.ObjectLiteral
//                 .out nameDecl, "=new(Map,"
//                 var objectLiteral = nameDecl.nodeDeclared
//                 if no objectLiteral.items or objectLiteral.items.length is 0
//                     .out "0,NULL"
//                 else
//                     .out
//                         objectLiteral.items.length,',(any_arr){'
//                         {CSL:objectLiteral.items}
//                         NL,"}"
//                 .out ");",NL
//             else if nameDecl.nodeDeclared instanceof Grammar.ArrayLiteral
//                 .out nameDecl,"=new(Array,"
//                 var arrayLiteral = nameDecl.nodeDeclared
//                 if no arrayLiteral.items or arrayLiteral.items.length is 0
//                     .out "0,NULL"
//                 else
//                     // e.g.: LiteScript:   var list = [a,b,c]
//                     // e.g.: "C": any list = (any){Array_TYPEID,.value.arr=&(Array_s){3,.item=(any_arr){a,b,c}}};
//                     .out arrayLiteral.items.length,",(any_arr){",{CSL:arrayLiteral.items},"}"
//                 .out ");",NL
//         end for
//         

       this.produceMainFunctionBody(prefix);

       // if .fileInfo.isInterface // add call to native hand-coded C support for this module
       if (this.fileInfo.isInterface) { // add call to native hand-coded C support for this module
           this.out(NL, '    ', prefix, "__nativeInit();");
       };

       this.out(NL, "};", NL);

// insert at .c file start, helper tempvars for 'or' expressions short-circuit evaluation

       // if .lexer.outCode.orTempVarCount
       if (this.lexer.outCode.orTempVarCount) {
           this.lexer.outCode.lines[insertPos++] = "//helper tempvars for 'or' expressions short-circuit evaluation";
           var list = "any __or1";
           // for n=2 to .lexer.outCode.orTempVarCount
           var _end7=this.lexer.outCode.orTempVarCount;
           for( var n=2; n<=_end7; n++) {
               list += ",__or" + n;
           };// end for n
           list += ";";
           this.lexer.outCode.lines[insertPos] = list;
       };


       this.skipSemiColon = true;


// close .h #ifdef

       this.out(new Map().fromObject({h: 1}), NL, '#endif', NL, new Map().fromObject({h: 0}));
    };


// ----------------------------

// ## Grammar.ClassDeclaration & derivated

   // append to class Grammar.AppendToDeclaration ###

// Any class|object can have properties or methods appended at any time.
// Append-to body contains properties and methods definitions.

     // method produceHeader()
     Grammar.AppendToDeclaration.prototype.produceHeader = function(){

       var nameDeclClass = this.varRef.tryGetReference(); // get class being append to
       // if no nameDeclClass, return .sayErr("append to: no reference found")
       if (!nameDeclClass) {return this.sayErr("append to: no reference found")};

       // if .toNamespace
       if (this.toNamespace) {
               this.body.produceDeclaredExternProps(nameDeclClass.getComposedName(), true);
               return; //nothing more to do if it's "append to namespace"
       };

// handle methods added to core classes

       // if nameDeclClass.nodeDeclared and nameDeclClass.nodeDeclared.name is "*Global Scope*"
       if (nameDeclClass.nodeDeclared && nameDeclClass.nodeDeclared.name === "*Global Scope*") {

// for each method declaration in .body

           // for each item in .body.statements
           for( var item__inx=0,item ; item__inx<this.body.statements.length ; item__inx++){item=this.body.statements[item__inx];
             if(item.specific.constructor === Grammar.MethodDeclaration){
                    // declare item.specific: Grammar.MethodDeclaration

                   // if no item.specific.nameDecl, continue // do not process, is a shim
                   if (!item.specific.nameDecl) {continue};

// keep a list of all methods appended to core-defined classes (like String)
// they require a special registration, because the class pre-exists in core

                   appendToCoreClassMethods.push(item.specific);

// also add to allMethods, since the class is core, is not declared in this project

                   item.specific.nameDecl.addToAllMethodNames();

// out header

                   this.out('extern any ', item.specific.nameDecl.getComposedName(), "(DEFAULT_ARGUMENTS);", NL);
           }};// end for each in this.body.statements
           
       };
     };



     // method produce()
     Grammar.AppendToDeclaration.prototype.produce = function(){

        //if .toNamespace, return //nothing to do if it's "append to namespace"
       this.out(this.body);
       this.skipSemiColon = true;
     };


   // append to class Grammar.NamespaceDeclaration ###
// namespaces are like modules inside modules

    // method produceCallNamespaceInit()
    Grammar.NamespaceDeclaration.prototype.produceCallNamespaceInit = function(){
       this.out('    ', this.makeName(), '__namespaceInit();', NL);
    };

    // method makeName()
    Grammar.NamespaceDeclaration.prototype.makeName = function(){

       var prefix = this.nameDecl.getComposedName();

// if this is a namespace declared at module scope, we check if it has
// the same name as the module. If it does, is the "default export",
// if it not, we prepend module name to namespace name.
// (Modules act as namespaces, var=property, function=method)

       // if .nameDecl.parent.isScope //is a namespace declared at module scope
       if (this.nameDecl.parent.isScope) { //is a namespace declared at module scope
           var moduleNode = this.getParent(Grammar.Module);
           // if moduleNode.fileInfo.base is .nameDecl.name
           if (moduleNode.fileInfo.base === this.nameDecl.name) {
                //this namespace have the same name as the module
               // do nothing //prefix is OK
               null; //prefix is OK
           }
                //this namespace have the same name as the module
           
           else {
                //append modulename to prefix
               prefix = "" + moduleNode.fileInfo.base + "_" + prefix;
           };
           // end if
           
       };
       // end if

       return prefix;
    };

    // method produceHeader
    Grammar.NamespaceDeclaration.prototype.produceHeader = function(){

       var prefix = this.makeName();

       this.out("//-------------------------", NL, "// namespace ", prefix, NL, "//-------------------------", NL);

// all namespace methods & props are public

        // add each method
       var count = 0;
       var namespaceMethods = [];
       // for each member in map .nameDecl.members
       var member=undefined;
       if(!this.nameDecl.members.dict) throw(new Error("for each in map: not a Map, no .dict property"));
       for ( var member__propName in this.nameDecl.members.dict) if (this.nameDecl.members.dict.hasOwnProperty(member__propName)){member=this.nameDecl.members.dict[member__propName];
       if(['constructor', 'length', 'prototype'].indexOf(member.name)===-1){
               // if member.isProperty
               if (member.isProperty) {
                   this.out('    extern var ', prefix, '_', member.name, ';', NL);
               }
               
               else if (member.isMethod) {
                   this.out('    extern any ', prefix, '_', member.name, '(DEFAULT_ARGUMENTS);', NL);
               };
               }
               
               }// end for each property

         // recurse, add internal classes and namespaces
       this.body.produceDeclaredExternProps(prefix, true);
    };


    // method produce
    Grammar.NamespaceDeclaration.prototype.produce = function(){

       var prefix = this.makeName();
       var isPublic = this.hasAdjective('export');

        //logger.debug "produce Namespace",c

// Now on the .c file,

       this.out("//-------------------------", NL, "//NAMESPACE ", prefix, NL, "//-------------------------", NL);

       this.body.produceSustance(prefix);

// __namespaceInit function

       this.out(NL, NL, "//------------------", NL, "void ", prefix, "__namespaceInit(void){", NL);

       this.body.produceMainFunctionBody(prefix);
       this.out("};", NL);

       this.skipSemiColon = true;
    };


   // append to class Grammar.ClassDeclaration ###

    // method produceHeader()
    Grammar.ClassDeclaration.prototype.produceHeader = function(){

       // if no .nameDecl, return //shim class
       if (!this.nameDecl) {return};

        // keep a list of classes in each moudle, to out __registerClass
       allClasses.push(this);

       var c = this.nameDecl.getComposedName();

        //logger.debug "produce header class",c

// header

       this.outClassTitleComment(c);

// In C we create a struct for "instance properties" of each class

       this.out("typedef struct ", c, "_s * ", c, "_ptr;", NL, "typedef struct ", c, "_s {", NL);

// out all properties, from the start of the "super-extends" chain

       this.nameDecl.outSuperChainProps(this);

// close instance struct

       this.out(NL, "} ", c, "_s;", NL, NL);

// and declare extern for class __init

        //declare extern for this class methods
       this.out("extern void ", c, "__init(DEFAULT_ARGUMENTS);", NL);


// add each prop to "all properties list", each method to "all methods list"
// and declare extern for each class method

       var classMethods = [];

       var prt = this.nameDecl.findOwnMember('prototype');
       // for each prtNameDecl in map prt.members
       var prtNameDecl=undefined;
       if(!prt.members.dict) throw(new Error("for each in map: not a Map, no .dict property"));
       for ( var prtNameDecl__propName in prt.members.dict) if (prt.members.dict.hasOwnProperty(prtNameDecl__propName)){prtNameDecl=prt.members.dict[prtNameDecl__propName];
       if(['constructor', 'length', 'prototype'].indexOf(prtNameDecl.name)===-1){
               // if prtNameDecl.isProperty
               if (prtNameDecl.isProperty) {
                    // keep a list of all classes props
                   prtNameDecl.addToAllProperties();
               }
                    // keep a list of all classes props
               
               else {
                    // keep a list of all classes methods
                   prtNameDecl.addToAllMethodNames();

                    //declare extern for this class methods
                   this.out("extern any ", c, "_", prtNameDecl.name, "(DEFAULT_ARGUMENTS);", NL);
               };
               }
               
               }// end for each property
       
    };


    // method produce()
    Grammar.ClassDeclaration.prototype.produce = function(){

       // if no .nameDecl, return //shim class
       if (!this.nameDecl) {return};

        //logger.debug "produce body class",c

// this is the class body, goes on the .c file,

       var c = this.nameDecl.getComposedName();

       this.outClassTitleComment(c);

       var hasConstructor = undefined;
       // for each index,item in .body.statements
       for( var index=0,item ; index<this.body.statements.length ; index++){item=this.body.statements[index];
           // if item.specific instanceof Grammar.ConstructorDeclaration
           if (item.specific instanceof Grammar.ConstructorDeclaration) {
               // if hasConstructor # what? more than one?
               if (hasConstructor) {// # what? more than one?
                   this.throwError('Two constructors declared for class ' + c);
               };
               hasConstructor = true;
           };
       };// end for each in this.body.statements

// default constructor

       // if not hasConstructor and not .getParent(Grammar.Module).fileInfo.isInterface
       if (!(hasConstructor) && !(this.getParent(Grammar.Module).fileInfo.isInterface)) {
            // produce a default constructor
           this.out("//auto ", c, "__init", NL, "void ", c, "__init", DEFAULT_ARGUMENTS, "{", NL);

           // if .varRefSuper
           if (this.varRefSuper) {
               this.out("    ", new Map().fromObject({COMMENT: "//auto call super class __init"}), NL, "    ", this.varRefSuper, "__init(this,argc,arguments);", NL);
           };

           this.body.producePropertiesInitialValueAssignments('((' + c + '_ptr)this.value.ptr)->');

            // end default constructor
           this.out("};", NL);
       };

// produce class body

       this.body.produce();
       this.skipSemiColon = true;
    };


// -------------------------------------
    // helper method outClassTitleComment(c:string)
    Grammar.ClassDeclaration.prototype.outClassTitleComment = function(c){

       this.out("\n\n//--------------", NL, new Map().fromObject({COMMENT: c}), NL, 'any ' + c + '; //Class ', c, this.varRefSuper ? [' extends ', this.varRefSuper, NL] : '', NL);
    };


// -------------------------------------
    // method produceStaticListMethodsAndProps
    Grammar.ClassDeclaration.prototype.produceStaticListMethodsAndProps = function(){

// static definition info for each class: list of _METHODS and _PROPS

        //skip NamespaceDeclaration & AppendToDeclaration (both derived from ClassDeclaration)
       // if .constructor isnt Grammar.ClassDeclaration, return
       if (this.constructor !== Grammar.ClassDeclaration) {return};

       var c = this.nameDecl.getComposedName();

       this.out('//-----------------------', NL, '// Class ', c, ': static list of METHODS(verbs) and PROPS(things)', NL, '//-----------------------', NL, NL, "static _methodInfoArr ", c, "_METHODS = {", NL);

       var propList = [];
       var prt = this.nameDecl.findOwnMember('prototype');
       // for each nameDecl in map prt.members
       var nameDecl=undefined;
       if(!prt.members.dict) throw(new Error("for each in map: not a Map, no .dict property"));
       for ( var nameDecl__propName in prt.members.dict) if (prt.members.dict.hasOwnProperty(nameDecl__propName)){nameDecl=prt.members.dict[nameDecl__propName];
       if(['constructor', 'length', 'prototype'].indexOf(nameDecl.name)===-1){
               // if nameDecl.isMethod
               if (nameDecl.isMethod) {
                   this.out('  { ' + (makeSymbolName(nameDecl.name)) + ', ' + c + '_' + nameDecl.name + ' },', NL);
               }
               
               else {
                   propList.push(makeSymbolName(nameDecl.name));
               };
               }
               
               }// end for each property

       this.out(NL, "{0,0}}; //method jmp table initializer end mark", NL, NL, "static _posTableItem_t ", c, "_PROPS[] = {", NL, new Map().fromObject({CSL: propList, post: '\n    '}), "};", NL, NL);
    };

    // method produceClassRegistration
    Grammar.ClassDeclaration.prototype.produceClassRegistration = function(){

        //skip NamespaceDeclaration & AppendToDeclaration (both derived from ClassDeclaration)
       // if .constructor isnt Grammar.ClassDeclaration, return
       if (this.constructor !== Grammar.ClassDeclaration) {return};

       var c = this.nameDecl.getComposedName();

       var superName = this.nameDecl.superDecl ? this.nameDecl.superDecl.getComposedName() : 'Object';

       this.out('    ' + c + ' =_newClass("' + c + '", ' + c + '__init, sizeof(struct ' + c + '_s), ' + superName + '.value.classINFOptr);', NL, '    _declareMethods(' + c + ', ' + c + '_METHODS);', NL, '    _declareProps(' + c + ', ' + c + '_PROPS, sizeof ' + c + '_PROPS);', NL, NL);
    };

// -------------------------------------
   // append to class Names.Declaration
    // method outSuperChainProps(node:Grammar.ClassDeclaration) #recursive
    Names.Declaration.prototype.outSuperChainProps = function(node){// #recursive

// out all properties of a class, including those of the super's-chain

       // if .superDecl, .superDecl.outSuperChainProps node #recurse
       if (this.superDecl) {this.superDecl.outSuperChainProps(node)};

       node.out('    //', this.name, NL);
       var prt = this.ownMember('prototype');
       // if no prt, .sayErr "class #{.name} has no prototype"
       if (!prt) {this.sayErr("class " + this.name + " has no prototype")};

       // for each prtNameDecl in map prt.members
       var prtNameDecl=undefined;
       if(!prt.members.dict) throw(new Error("for each in map: not a Map, no .dict property"));
       for ( var prtNameDecl__propName in prt.members.dict) if (prt.members.dict.hasOwnProperty(prtNameDecl__propName)){prtNameDecl=prt.members.dict[prtNameDecl__propName];
       if(['constructor', 'length', 'prototype'].indexOf(prtNameDecl.name)===-1){
               // if prtNameDecl.isProperty
               if (prtNameDecl.isProperty) {
                   node.out('    any ', prtNameDecl.name, ";", NL);
               };
               }
               
               }// end for each property
       
    };



   // append to class Grammar.Body

// A "Body" is an ordered list of statements.

// "Body"s lines have all the same indent, representing a scope.

// "Body"s are used for example, to parse an `if` statement body and `else` body, `for` loops, etc.

    // method produce()
    Grammar.Body.prototype.produce = function(){

       // for each statement in .statements
       for( var statement__inx=0,statement ; statement__inx<this.statements.length ; statement__inx++){statement=this.statements[statement__inx];
         statement.produce();
       };// end for each in this.statements

       this.out(NL);
    };

    // method produceDeclaredExternProps(parentName,forcePublic)
    Grammar.Body.prototype.produceDeclaredExternProps = function(parentName, forcePublic){

       var prefix = parentName ? "" + parentName + "_" : "";

        // add each declared prop as a extern prefixed var
       // for each item in .statements
       for( var item__inx=0,item ; item__inx<this.statements.length ; item__inx++){item=this.statements[item__inx];

           var isPublic = forcePublic || item.hasAdjective('export');

           // switch item.specific.constructor
           switch(item.specific.constructor){
           
           case Grammar.VarStatement:
                    // declare item.specific:Grammar.VarStatement
                   // if isPublic, .out 'extern var ',{pre:prefix, CSL:item.specific.getNames()},";",NL
                   if (isPublic) {this.out('extern var ', new Map().fromObject({pre: prefix, CSL: item.specific.getNames()}), ";", NL)};
                   break;
                   
           case Grammar.FunctionDeclaration:
                    // declare item.specific:Grammar.FunctionDeclaration
                    //export module function
                   // if isPublic, .out 'extern any ',prefix,item.specific.name,"(DEFAULT_ARGUMENTS);",NL
                   if (isPublic) {this.out('extern any ', prefix, item.specific.name, "(DEFAULT_ARGUMENTS);", NL)};
                   break;
                   
           case Grammar.ClassDeclaration: case Grammar.AppendToDeclaration:
                    // declare item.specific:Grammar.ClassDeclaration
                    //produce class header declarations
                   item.specific.produceHeader();
                   break;
                   
           case Grammar.NamespaceDeclaration:
                    // declare item.specific:Grammar.NamespaceDeclaration
                   item.specific.produceHeader();// #recurses
                   break;
                   
           
           };
       };// end for each in this.statements
       
    };
                    // as in JS, always public. Must produce, can have classes inside


    // method produceSustance(prefix)
    Grammar.Body.prototype.produceSustance = function(prefix){

// before main function,
// produce body sustance: vars & other functions declarations

       var produceSecond = [];
       var produceThird = [];

       // for each item in .statements
       for( var item__inx=0,item ; item__inx<this.statements.length ; item__inx++){item=this.statements[item__inx];

           // if item.specific instanceof Grammar.VarDeclList // PropertiesDeclaration & VarStatement
           if (item.specific instanceof Grammar.VarDeclList) { // PropertiesDeclaration & VarStatement
                // declare item.specific:Grammar.VarDeclList
                //just declare existence, do not assign. (C compiler: error: initializer element is not constant)
               this.out('var ', new Map().fromObject({pre: "" + prefix + "_", CSL: item.specific.getNames()}), ";", NL);
           }

            //since C require to define a fn before usage. we make forward declarations
           
           else if (item.specific.constructor === Grammar.FunctionDeclaration) {
                // declare item.specific:Grammar.FunctionDeclaration
                //just declare existence, do not assign. (C compiler: error: initializer element is not constant)
               this.out('any ', prefix, '_', item.specific.name, "(DEFAULT_ARGUMENTS); //forward declare", NL);
               produceThird.push(item);
           }
           
           else if (item.specific.constructor === Grammar.ClassDeclaration) {
                // declare item.specific:Grammar.ClassDeclaration
               item.specific.produceStaticListMethodsAndProps();
               produceSecond.push(item.specific);
           }
           
           else if (item.specific.constructor === Grammar.NamespaceDeclaration) {
                // declare item.specific:Grammar.NamespaceDeclaration
               produceSecond.push(item.specific);// #recurses
           }
           
           else if (item.specific.constructor === Grammar.AppendToDeclaration) {
               item.specific.callOnSubTree(LiteCore.getSymbol('produceStaticListMethodsAndProps')); //if there are internal classes
               produceThird.push(item);
           }
           
           else if (item.isDeclaration()) {
               produceThird.push(item);
           };
       };// end for each in this.statements

       // end for //produce vars functions & classes sustance

       // for each item in produceSecond //class & namespace sustance
       for( var item__inx=0,item ; item__inx<produceSecond.length ; item__inx++){item=produceSecond[item__inx];
           item.produce();
       };// end for each in produceSecond

       // for each item in produceThird //other declare statements
       for( var item__inx=0,item ; item__inx<produceThird.length ; item__inx++){item=produceThird[item__inx];
           item.produce();
       };// end for each in produceThird
       
    };


    // method produceMainFunctionBody(prefix)
    Grammar.Body.prototype.produceMainFunctionBody = function(prefix){

// First: register user classes

       this.callOnSubTree(LiteCore.getSymbol('produceClassRegistration'));

// Second: recurse for namespaces

       this.callOnSubTree(LiteCore.getSymbol('produceCallNamespaceInit'));

// Third: assign values for module vars.
// if there is var or properties with assigned values, produce those assignment.
// User classes must be registered previously, in case the module vars use them as initial values.

       // for each item in .statements
       for( var item__inx=0,item ; item__inx<this.statements.length ; item__inx++){item=this.statements[item__inx];
         if(item.specific instanceof Grammar.VarDeclList){
                // declare item.specific:Grammar.VarDeclList
               // for each variableDecl in item.specific.list
               for( var variableDecl__inx=0,variableDecl ; variableDecl__inx<item.specific.list.length ; variableDecl__inx++){variableDecl=item.specific.list[variableDecl__inx];
                 if(variableDecl.assignedValue){
                       this.out('    ', prefix, '_', variableDecl.name, ' = ', variableDecl.assignedValue, ";", NL);
               }};// end for each in item.specific.list
               
       }};// end for each in this.statements


        // all other loose statements in module body
       this.produceLooseExecutableStatements();
    };


    // method producePropertiesInitialValueAssignments(fullPrefix)
    Grammar.Body.prototype.producePropertiesInitialValueAssignments = function(fullPrefix){

// if there is var or properties with assigned values, produce those assignment

       // for each item in .statements
       for( var item__inx=0,item ; item__inx<this.statements.length ; item__inx++){item=this.statements[item__inx];
         if(item.specific.constructor === Grammar.PropertiesDeclaration){
                // declare item.specific:Grammar.PropertiesDeclaration
               // for each variableDecl in item.specific.list
               for( var variableDecl__inx=0,variableDecl ; variableDecl__inx<item.specific.list.length ; variableDecl__inx++){variableDecl=item.specific.list[variableDecl__inx];
                 if(variableDecl.assignedValue){
                       this.out('PROP(', variableDecl.name, '_,this)=', variableDecl.assignedValue, ";", NL);
               }};// end for each in item.specific.list
               
       }};// end for each in this.statements
       
    };


    // method produceLooseExecutableStatements()
    Grammar.Body.prototype.produceLooseExecutableStatements = function(){
        // all loose executable statements in a namespace or module body
       // for each item in .statements
       for( var item__inx=0,item ; item__inx<this.statements.length ; item__inx++){item=this.statements[item__inx];
         if(item.isExecutableStatement()){
               item.produce(); //produce here
       }};// end for each in this.statements
       
    };


// -------------------------------------
   // append to class Grammar.Statement ###

// `Statement` objects call their specific statement node's `produce()` method
// after adding any comment lines preceding the statement

     // method produce()
     Grammar.Statement.prototype.produce = function(){

        // declare valid .specific.body

// add comment lines, in the same position as the source

       this.outPrevLinesComments();

// To ease reading of compiled code, add original Lite line as comment

       // if .lexer.options.comments // and .lexer.outCode.lastOriginalCodeComment<.lineInx
       if (this.lexer.options.comments) { // and .lexer.outCode.lastOriginalCodeComment<.lineInx

           var commentTo = this.lastSourceLineNum;
           // if .specific has property "body"
           if ("body" in this.specific || this.specific instanceof Grammar.IfStatement || this.specific instanceof Grammar.WithStatement || this.specific instanceof Grammar.ForStatement || this.specific instanceof Grammar.SwitchStatement) {
                   commentTo = this.sourceLineNum;
           };

           this.outSourceLinesAsComment(this.sourceLineNum, commentTo);

           this.lexer.outCode.lastOriginalCodeComment = commentTo;
       };

// Each statement in its own line

       // if .specific isnt instance of Grammar.SingleLineBody
       if (!(this.specific instanceof Grammar.SingleLineBody)) {
         this.lexer.outCode.ensureNewLine();
       };

// if there are one or more 'into var x' in a expression in this statement,
// declare vars before the statement (exclude body of FunctionDeclaration)

       this.callOnSubTree(LiteCore.getSymbol('declareIntoVar'), Grammar.Body);

// call the specific statement (if,for,print,if,function,class,etc) .produce()

       var mark = this.lexer.outCode.markSourceMap(this.indent);
       this.out(this.specific);

// add ";" after the statement
// then EOL comment (if it isnt a multiline statement)
// then NEWLINE

       // if not .specific.skipSemiColon
       if (!(this.specific.skipSemiColon)) {
         this.addSourceMap(mark);
         this.out(";");
         // if not .specific has property "body"
         if (!("body" in this.specific)) {
           this.out(this.getEOLComment());
         };
       };
     };

// helper function to determine if a statement is a declaration (can be outside a funcion in "C")
// or a "statement" (must be inside a funcion in "C")

     // helper method isDeclaration returns boolean
     Grammar.Statement.prototype.isDeclaration = function(){

       return this.specific instanceof Grammar.ClassDeclaration || this.specific instanceof Grammar.FunctionDeclaration || this.specific instanceof Grammar.VarStatement || [Grammar.ImportStatement, Grammar.DeclareStatement, Grammar.CompilerStatement].indexOf(this.specific.constructor)>=0;
     };

     // helper method isExecutableStatement returns boolean
     Grammar.Statement.prototype.isExecutableStatement = function(){

       return !(this.isDeclaration());
     };

// called above, pre-declare vars from 'into var x' assignment-expression

   // append to class Grammar.Oper
     // method declareIntoVar()
     Grammar.Oper.prototype.declareIntoVar = function(){
         // if .intoVar
         if (this.intoVar) {
             this.out("var ", this.right, "=undefined;", NL);
         };
     };


// ---------------------------------
   // append to class Grammar.ThrowStatement ###

     // method produce()
     Grammar.ThrowStatement.prototype.produce = function(){
         // if .specifier is 'fail'
         if (this.specifier === 'fail') {
           this.out("throw(new(Error,1,(any_arr){", this.expr, "}));");
         }
         
         else {
           this.out("throw(", this.expr, ")");
         };
     };


   // append to class Grammar.ReturnStatement ###

     // method produce()
     Grammar.ReturnStatement.prototype.produce = function(){
       var defaultReturn = this.getParent(Grammar.ConstructorDeclaration) ? '' : 'undefined';


// we need to unwind try-catch blocks, to calculate to which active exception frame
// we're "returning" to

       var countTryBlocks = 0;
       var node = this.parent;
       // do until node instance of Grammar.FunctionDeclaration
       while(!(node instanceof Grammar.FunctionDeclaration)){

           // if node.constructor is Grammar.TryCatch
           if (node.constructor === Grammar.TryCatch) {
                //a return inside a "TryCatch" block
               countTryBlocks++; //we need to explicitly unwind
           };

           node = node.parent;
       };// end loop

// we reached function header here.
// if the function had a ExceptionBlock, we need to unwind
// because an auto "try{" is inserted at function start

        // declare node:Grammar.FunctionDeclaration
       // if node.hasExceptionBlock, countTryBlocks++
       if (node.hasExceptionBlock) {countTryBlocks++};

       // if countTryBlocks
       if (countTryBlocks) {
           this.out("{e4c_exitTry(", countTryBlocks, ");");
       };

       this.out('return ', this.expr || defaultReturn);

       // if countTryBlocks
       if (countTryBlocks) {
           this.out(";}");
       };
     };


   // append to class Grammar.FunctionCall ###

     // method produce()
     Grammar.FunctionCall.prototype.produce = function(){

// Check if varRef "executes"
// (a varRef executes if last accessor is "FunctionCall" or it has --/++)

// if varRef do not "executes" add "FunctionCall",
// so varRef production adds (),
// and C/JS executes the function call

       // if no .varRef.executes, .varRef.addAccessor new Grammar.FunctionAccess(.varRef)
       if (!this.varRef.executes) {this.varRef.addAccessor(new Grammar.FunctionAccess(this.varRef))};

       var result = this.varRef.calcReference();
       this.out(result);
     };


   // append to class Grammar.Operand ###

// `Operand:
  // |NumberLiteral|StringLiteral|RegExpLiteral
  // |ParenExpression|ArrayLiteral|ObjectLiteral|FunctionDeclaration
  // |VariableRef

// A `Operand` is the left or right part of a binary oper
// or the only Operand of a unary oper.

      // properties
        // produceType: string

     // method produce()
     Grammar.Operand.prototype.produce = function(){

       var pre = undefined, post = undefined;

       // if .name instance of Grammar.StringLiteral
       if (this.name instanceof Grammar.StringLiteral) {
            // declare .name:Grammar.StringLiteral
            // in C we only have "" to define strings, '' are for char constants
            // if the StringLiteral is defined with '', change to "" and escape all internal \"
           var strValue = this.name.name;
           // if strValue.charAt(0) is "'"
           if (strValue.charAt(0) === "'") {
               strValue = this.name.getValue(); // w/o quotes
               strValue = strValue.replaceAll("\"", '\\"'); // escape internal " => \"
               strValue = '"' + strValue + '"'; // enclose in ""
           };

           // if strValue is '""'
           if (strValue === '""') {
               this.out("any_EMPTY_STR");
           }
           
           else if (this.produceType === 'Number' && (strValue.length === 3 || strValue.charAt(1) === '/' && strValue.length === 4)) { //a single char (maybe escaped)
               this.out("'", strValue.slice(1, -1), "'"); // out as C 'char' (C char = byte, a numeric value)
           }
           
           else {
               this.out("any_str(", strValue, ")");
           };

           this.out(this.accessors);
       }
       
       else if (this.name instanceof Grammar.NumberLiteral) {

           // if .produceType is 'any'
           if (this.produceType === 'any') {
               pre = "any_number(";
               post = ")";
           };

           this.out(pre, this.name, this.accessors, post);
       }
       
       else if (this.name instanceof Grammar.VariableRef) {
            // declare .name:Grammar.VariableRef
           this.name.produceType = this.produceType;
           this.out(this.name);
       }
       
       else if (this.name instanceof Grammar.ParenExpression) {
            // declare .name:Grammar.ParenExpression
           this.name.expr.produceType = this.produceType;
           this.out(this.name.expr, this.accessors);
       }
       
       else {
           this.out(this.name, this.accessors);
       };

       // end if
       
     };

      // #end Operand


   // append to class Grammar.UnaryOper ###

// `UnaryOper: ('-'|new|type of|not|no|bitwise not) `

// A Unary Oper is an operator acting on a single operand.
// Unary Oper inherits from Oper, so both are `instance of Oper`

// Examples:
// 1) `not`     *boolean negation*     `if not a is b`
// 2) `-`       *numeric unary minus*  `-(4+3)`
// 3) `new`     *instantiation*        `x = new classNumber[2]`
// 4) `type of` *type name access*     `type of x is classNumber[2]`
// 5) `no`      *'falsey' check*       `if no options then options={}`
// 6) `~`       *bit-unary-negation*   `a = ~xC0 + 5`

     // method produce()
     Grammar.UnaryOper.prototype.produce = function(){

       var translated = operTranslate(this.name);
       var prepend = undefined, append = undefined;

// Consider "not":
// if it is "boolean not", add parentheses, because js has a different precedence for "boolean not"
// -(prettier generated code) do not add () for simple "falsey" variable check: "if no x"

       // if translated is "!"
       if (translated === "!") {
           // if not (.name is "no" and .right.name instanceof Grammar.VariableRef)
           if (!((this.name === "no" && this.right.name instanceof Grammar.VariableRef))) {
               prepend = "(";
               append = ")";
           };
       };

// Special cases

       var pre = undefined, post = undefined;

       // if translated is "new" and .right.name instance of Grammar.VariableRef
       if (translated === "new" && this.right.name instanceof Grammar.VariableRef) {
            // declare .right.name:Grammar.VariableRef
           this.out("new(", this.right.name.calcReference(true));
           return;
       };

       // if translated is "typeof"
       if (translated === "typeof") {
           pre = "_typeof(";
           translated = "";
           post = ")";
       }
       
       else {
           // if .produceType is 'any'
           if (this.produceType === 'any') {
               pre = "any_number(";
               post = ")";
           };

           this.right.produceType = translated === "!" ? 'Bool' : 'Number'; //Except "!", unary opers require numbers
       };

       // end if

//add a space if the unary operator is a word. Example `typeof`
//            if /\w/.test(translated), translated+=" "

       this.out(pre, translated, prepend, this.right, append, post);
     };


   // append to class Grammar.Oper ###

      // properties
          // produceType: string

     // method produce()
     Grammar.Oper.prototype.produce = function(){

       var oper = this.name;

// Discourage string concat using '+':

// +, the infamous js string concat. You should not use + to concat strings. use string interpolation instead.
// e.g.: DO NOT: `stra+": "+strb`   DO: `"#{stra}: #{strb}"`

       // if oper is '+'
       if (oper === '+') {
           var lresultNameDecl = this.left.getResultType();
           var rresultNameDecl = this.right.getResultType();
           // if (lresultNameDecl and lresultNameDecl.isInstanceof('String'))
           if ((lresultNameDecl && lresultNameDecl.isInstanceof('String')) || (rresultNameDecl && rresultNameDecl.isInstanceof('String'))) {
                   this.sayErr("You should not use + to concat strings. use string interpolation instead.\ne.g.: DO: \"#\{stra}: #\{strb}\"  vs.  DO NOT: stra + \": \" + strb");
           };
       };

// default mechanism to handle 'negated' operand

       var toAnyPre = undefined, toAnyPost = undefined;
       // if .produceType is 'any'
       if (this.produceType === 'any') {
           toAnyPre = 'any_number(';
           toAnyPost = ")";
       };

       var prepend = undefined, append = undefined;
       // if .negated # NEGATED
       if (this.negated) {// # NEGATED

// else -if NEGATED- we add `!( )` to the expression

               prepend = "!(";
               append = ")";
       };

// Check for special cases:

// 1) 'in' operator, requires swapping left and right operands and to use `.indexOf(...)>=0`
// example: `x in [1,2,3]` -> `indexOf(x,_literalArray(1,2,3))>=0`
// example: `x not in [1,2,3]` -> `indexOf(x,_literalArray(1,2,3))==-1`
// example: `char not in myString` -> `indexOf(char,myString)==-1`

       // switch .name
       switch(this.name){
       
       case 'in':
           // if .right.name instanceof Grammar.ArrayLiteral
           if (this.right.name instanceof Grammar.ArrayLiteral) {
               var haystack = this.right.name;
               this.out(toAnyPre, prepend, "__in(", this.left, ",", haystack.items.length, ",(any_arr){", new Map().fromObject({CSL: haystack.items}), "})", append, toAnyPost);
           }
           
           else {
               this.out(toAnyPre, "CALL1(indexOf_,", this.right, ",", this.left, ").value.number", this.negated ? "==-1" : ">=0", toAnyPost);
           };
           break;
           
       case 'has property':
           this.out(toAnyPre, prepend, "_hasProperty(", this.left, ",", this.right, ")", append, toAnyPost);
           break;
           
       case 'into':
           // if .produceType and .produceType isnt 'any', .out '_anyTo',.produceType,'('
           if (this.produceType && this.produceType !== 'any') {this.out('_anyTo', this.produceType, '(')};
           this.left.produceType = 'any';
           this.out("(", this.right, "=", this.left, ")");
           // if .produceType and .produceType isnt 'any', .out ')'
           if (this.produceType && this.produceType !== 'any') {this.out(')')};
           break;
           
       case 'instance of':
           this.left.produceType = 'any';
           this.right.produceType = 'any';
           this.out(toAnyPre, prepend, '_instanceof(', this.left, ',', this.right, ')', append, toAnyPost);
           break;
           
       case 'like':
           this.throwError("like not supported yet for C-production");
           break;
           
       case 'is':
           this.left.produceType = 'any';
           this.right.produceType = 'any';
           this.out(toAnyPre, this.negated ? '!' : '', '__is(', this.left, ',', this.right, ')', toAnyPost);
           break;
           
       case 'or':
           this.lexer.outCode.orTempVarCount++;
           var orTmp = '__or' + this.lexer.outCode.orTempVarCount;

           this.left.produceType = 'any';
           this.right.produceType = 'any';
           // if .produceType and .produceType isnt 'any', .out '_anyTo',.produceType,'('
           if (this.produceType && this.produceType !== 'any') {this.out('_anyTo', this.produceType, '(')};

           this.out('(_anyToBool(' + orTmp + '=', this.left, ')? ' + orTmp + ' : ', this.right, ')');

           // if .produceType and .produceType isnt 'any', .out ')'
           if (this.produceType && this.produceType !== 'any') {this.out(')')};
           break;
           
       case '%':
           // if .produceType and .produceType isnt 'Number', .out 'any_number('
           if (this.produceType && this.produceType !== 'Number') {this.out('any_number(')};
           this.left.produceType = 'Number';
           this.right.produceType = 'Number';
           this.out('(int64_t)', this.left, ' % (int64_t)', this.right);
           // if .produceType and .produceType isnt 'Number', .out ')'
           if (this.produceType && this.produceType !== 'Number') {this.out(')')};
           break;
           
       case '&':
           // if .produceType is 'Number', .throwError 'cannot use & to concat and produce a number'
           if (this.produceType === 'Number') {this.throwError('cannot use & to concat and produce a number')};
           this.left.produceType = 'any';
           this.right.produceType = 'any';
           this.out("_concatAny(2,(any_arr){", this.left, ',', this.right, '})');
           break;
           
       default:

           var operC = operTranslate(oper);

           // switch operC
           switch(operC){
           
           case '?':
                   this.left.produceType = 'Bool';
                   this.right.produceType = this.produceType;
                   break;
                   
           case ':':
                   this.left.produceType = this.produceType;
                   this.right.produceType = this.produceType;
                   break;
                   
           case '&&':
                   this.left.produceType = 'Bool';
                   this.right.produceType = 'Bool';
                   break;
                   
           default:
                   this.left.produceType = 'Number';
                   this.right.produceType = 'Number';
           
           };

           var extra = undefined, preExtra = undefined;

           // if operC isnt '?' // cant put xx( a ? b )
           if (operC !== '?') { // cant put xx( a ? b )
               // if .produceType is 'any'
               if (this.produceType === 'any') {
                   // if .left.produceType is 'any' and .right.produceType is 'any'
                   if (this.left.produceType === 'any' && this.right.produceType === 'any') {
                       // do nothing
                       null;
                   }
                   
                   else {
                       preExtra = 'any_number(';
                       extra = ")";
                   };
               }
               
               else if (this.produceType) {
                   // if ( .left.produceType is .produceType and .right.produceType is .produceType )
                   if ((this.left.produceType === this.produceType && this.right.produceType === this.produceType) || (this.produceType === 'Bool' && this.left.produceType === 'Number' && this.right.produceType === 'Number')) {
                       // do nothing
                       null;
                   }
                   
                   else {
                     preExtra = '_anyTo' + this.produceType + '(';
                     extra = ")";
                   };
               };
           };

           this.out(preExtra, prepend, this.left, ' ', operC, ' ', this.right, append, extra);
       
       };

       // end case oper
       
     };


   // append to class Grammar.Expression ###

      // properties
          // produceType: string

     // method produce(negated)
     Grammar.Expression.prototype.produce = function(negated){

// Produce the expression body, optionally negated

       // default .produceType='any'
       if(this.produceType===undefined) this.produceType='any';

       var prepend = "";
       var append = "";
       // if negated
       if (negated) {

// (prettier generated code) Try to avoid unnecessary parens after '!'
// for example: if the expression is a single variable, as in the 'falsey' check:
// Example: `if no options.logger then... ` --> `if (!options.logger) {...`
// we don't want: `if (!(options.logger)) {...`

         // if .operandCount is 1
         if (this.operandCount === 1) {
              // #no parens needed
             prepend = "!";
         }
              // #no parens needed
         
         else {
             prepend = "!(";
             append = ")";
         };
       };
          // #end if
        // #end if negated

// produce the expression body

        // declare valid .root.produceType
       this.root.produceType = this.produceType;
       this.out(prepend, this.root, append);
     };
        //.out preExtra, prepend, .root, append, extra


   // append to class Grammar.FunctionArgument ###

       // method produce
       Grammar.FunctionArgument.prototype.produce = function(){
           this.out(this.expression);
       };


   // helper function makeSymbolName(symbol)
   function makeSymbolName(symbol){
        // hack: make "symbols" avoid interference with C's reserved words
        // and also common variable names
       return "" + symbol + "_";
   };

   // append to class Grammar.VariableRef ###

// `VariableRef: ['--'|'++'] IDENTIFIER [Accessors] ['--'|'++']`

// `VariableRef` is a Variable Reference.

 // a VariableRef can include chained 'Accessors', which can:
 // *access a property of the object : `.`-> PropertyAccess `[`->IndexAccess
 // *assume the variable is a function and perform a function call :  `(`-> FunctionAccess

      // properties
          // produceType: string
          // calcType: string // 'any','Number','Bool','**native number**'

     // method produce()
     Grammar.VariableRef.prototype.produce = function(){

// Prefix ++/--, varName, Accessors and postfix ++/--

       // if .name is 'arguments'
       if (this.name === 'arguments') {
           this.out('_newArray(argc,arguments)');
           return;
       };

       var result = this.calcReference();

       var pre = undefined, post = undefined;

       // if .produceType is 'any' and not .calcType is 'any'
       if (this.produceType === 'any' && !(this.calcType === 'any')) {
           pre = 'any_number(';
           post = ')';
       }
       
       else if (this.produceType && this.produceType !== 'any' && this.calcType === 'any') {
           pre = '_anyTo' + this.produceType + '(';
           post = ')';
       };

       this.out(pre, result, post);
     };

     // helper method calcReference(callNew) returns array of array
     Grammar.VariableRef.prototype.calcReference = function(callNew){

       var result = this.calcReferenceArr(callNew);

// PreIncDec and postIncDec: ++/--

       var hasIncDec = this.preIncDec || this.postIncDec;

       // if hasIncDec
       if (hasIncDec) {

           // if no .calcType
           if (!this.calcType) {
               this.throwError("pre or post inc/dec (++/--) can only be used on simple variables");
           };

           // if .calcType is 'any'
           if (this.calcType === 'any') {
               result.push(['.value.number']);
               this.calcType = 'Number';
           }
           
           else {
               // do nothing
               null;
           };
       };

       // if .postIncDec
       if (this.postIncDec) {
           result.push([this.postIncDec]);
       };

       // if .preIncDec
       if (this.preIncDec) {
           result.unshift([this.preIncDec]);
       };

       return result;
     };

     // helper method calcReferenceArr(callNew) returns array of array
     Grammar.VariableRef.prototype.calcReferenceArr = function(callNew){

// Start with main variable name, to check property names

       var actualVar = this.tryGetFromScope(this.name);
       // if no actualVar, .throwError("var '#{.name}' not found in scope")
       if (!actualVar) {this.throwError("var '" + this.name + "' not found in scope")};

       var result = []; //array of arrays

       var partial = actualVar.getComposedName();

       result.push([partial]);

       this.calcType = 'any'; //default
       // if actualVar.findOwnMember("**proto**") is '**native number**', .calcType = '**native number**'
       if (actualVar.findOwnMember("**proto**") === '**native number**') {this.calcType = '**native number**'};

       // if no .accessors, return result
       if (!this.accessors) {return result};

// now follow each accessor

       var avType = undefined;

       var hasInstanceReference = undefined;

       var 
       isOk = undefined, 
       functionAccess = undefined, 
       args = undefined
       ;

       // for each inx,ac in .accessors
       for( var inx=0,ac ; inx<this.accessors.length ; inx++){ac=this.accessors[inx];
            // declare valid ac.name

            //if no actualVar
            //    .throwError("processing '#{partial}', cant follow property chain types")

// for PropertyAccess

           // if ac instanceof Grammar.PropertyAccess
           if (ac instanceof Grammar.PropertyAccess) {

               var classNameArr = undefined;

               // if ac.name is 'constructor' //hack, all vars have a "constructor".
               if (ac.name === 'constructor') { //hack, all vars have a "constructor".
                    //convert "bar.constructor" to: "any_class(bar.class)"
                    //var classNameArr:array = result.pop()
                   result.unshift(['any_class(']);
                    // here goes any class
                   result.push([".class)"]);
                    //result.push classNameArr
                   this.calcType = 'any';
                   hasInstanceReference = true;
                   // if actualVar, actualVar = actualVar.findOwnMember('**proto**')
                   if (actualVar) {actualVar = actualVar.findOwnMember('**proto**')};
               }
               
               else if (ac.name === 'prototype') { //hack, all classes have a "prototype" to access methods
                    //convert "Foo.prototype.toString" to: "__classMethodAny(toString,Foo)"
                   // if inx+1 >= .accessors.length or .accessors[inx+1].constructor isnt Grammar.PropertyAccess
                   if (inx + 1 >= this.accessors.length || this.accessors[inx + 1].constructor !== Grammar.PropertyAccess) {
                       this.sayErr("expected: Class.prototype.method, e.g.: 'Foo.prototype.toString'");
                   }
                   
                   else {
                       classNameArr = result.pop();
                       classNameArr.unshift('__classMethodFunc(', this.accessors[inx + 1].name, "_ ,"); //__classMethodFunc(methodName,
                        // here goes any class
                       classNameArr.push(")");
                       result.push(classNameArr); //now converted to any Function
                       inx += 1; //skip method name
                       this.calcType = 'any'; // __classMethodFunc returns any_func
                       hasInstanceReference = true;

                       actualVar = this.tryGetFromScope('Function');
                       // if actualVar, actualVar=actualVar.findOwnMember('prototype') //actual var is now function prototype
                       if (actualVar) {actualVar = actualVar.findOwnMember('prototype')};
                   };
               }
               
               else if (ac.name === 'length') { //hack, convert x.length in a funcion call, _length(x)
                   result.unshift(['_length', '(']); // put "length(" first - call to dispatcher
                   result.push([")"]);
                   this.calcType = '**native number**';
                   actualVar = undefined;
               }
               
               else if (ac.name === 'call') {
                    //hack: .call
                    // this is .call use __apply(Function,instance,argc,arguments)

                    //should be here after Class.prototype.xxx.call
                   // if no actualVar or no actualVar.findMember('call')
                   if (!actualVar || !actualVar.findMember('call')) {
                       this.throwError('cannot use .call on a non-Function. Use: Class.prototype.method.call(this,arg1,...)');
                   };

                    //let's make sure next accessor is FunctionAccess with at least one arg
                   isOk = false;

                   // if inx+1<.accessors.length
                   if (inx + 1 < this.accessors.length) {
                       // if .accessors[inx+1].constructor is Grammar.FunctionAccess
                       if (this.accessors[inx + 1].constructor === Grammar.FunctionAccess) {
                           functionAccess = this.accessors[inx + 1];
                           // if functionAccess.args and functionAccess.args.length >= 1
                           if (functionAccess.args && functionAccess.args.length >= 1) {
                               isOk = true;
                           };
                       };
                   };

                   // if no isOk, .throwError 'expected instance and optional arguments after ".call": foo.call(this,arg1,arg2)'
                   if (!isOk) {this.throwError('expected instance and optional arguments after ".call": foo.call(this,arg1,arg2)')};

                   args = functionAccess.args;

                   result.unshift(['__apply(']);
                    //here goes Function ref
                   var FnArr = [",", args[0], ","]; // instance
                   this.addArguments(args.slice(1), FnArr); //other arguments
                   FnArr.push(')');

                   result.push(FnArr);
                   inx += 1; //skip fn.call and args
                   actualVar = undefined;
               }

               
               else if (ac.name === 'apply') {
                    //hack: .apply
                    // this is .apply(this,args:anyArr) use __applyArr(Function,instance,anyArgsArray)

                    //should be here after Class.prototype.xxx.apply
                   // if no actualVar or no actualVar.findMember('apply')
                   if (!actualVar || !actualVar.findMember('apply')) {
                       this.throwError('cannot use .apply on a non-Function. Use: Class.prototype.method.apply(this,args:Array)');
                   };

                    //let's make sure next accessor is FunctionAccess with at least one arg
                   isOk = false;
                   // if inx+1<.accessors.length
                   if (inx + 1 < this.accessors.length) {
                       // if .accessors[inx+1].constructor is Grammar.FunctionAccess
                       if (this.accessors[inx + 1].constructor === Grammar.FunctionAccess) {
                           functionAccess = this.accessors[inx + 1];
                           // if functionAccess.args and functionAccess.args.length >= 2
                           if (functionAccess.args && functionAccess.args.length >= 2) {
                               isOk = true;
                           };
                       };
                   };

                   // if no isOk, .throwError 'expected two arguments after ".apply". e.g.: foo.apply(this,argArray)'
                   if (!isOk) {this.throwError('expected two arguments after ".apply". e.g.: foo.apply(this,argArray)')};

                   args = functionAccess.args;

                   result.unshift(['__applyArr(', hasInstanceReference ? '' : 'any_func(']);
                    //here goes Function ref
                   result.push([hasInstanceReference ? '' : ')', ',', args[0], ',', args[1], ')']);

                   inx += 1; //skip fn.call and args
                   actualVar = undefined;
               }
               
               else if (actualVar && actualVar.isNamespace) { //just namespace access
                   var prevArr = result.pop();
                   prevArr.push("_", ac.name);
                   result.push(prevArr);

                   actualVar = actualVar.findOwnMember(ac.name);
               }
               
               else if (inx + 1 < this.accessors.length && this.accessors[inx + 1].constructor === Grammar.FunctionAccess) {
                    // if next is function access, this is a method name. just make name a symbol
                   result.push([makeSymbolName(ac.name)]);
                   this.calcType = 'any';
                   hasInstanceReference = true;
                   // if actualVar, actualVar = actualVar.findOwnMember(ac.name)
                   if (actualVar) {actualVar = actualVar.findOwnMember(ac.name)};
               }
               
               else {
                    // normal property access
                    //out PROP(propName,instance)
                   this.calcType = 'any';
                   hasInstanceReference = true;
                   result.unshift(["PROP", "(", makeSymbolName(ac.name), ","]); // PROP macro enclose all
                    // here goes thisValue (instance)
                   result.push([")"]);

                   // if actualVar, actualVar = actualVar.findOwnMember(ac.name)
                   if (actualVar) {actualVar = actualVar.findOwnMember(ac.name)};
               };

               // end if // subtypes of propertyAccess

               partial = "" + partial + "." + ac.name;
           }

// else, for FunctionAccess
           
           else if (ac.constructor === Grammar.FunctionAccess) {

               partial = "" + partial + "(...)";
               this.calcType = 'any';

               functionAccess = ac;

                //we're calling on an IndexAccess or the result of a function. Mandatory use of apply/call
               // if inx>1 and .accessors[inx-1].constructor isnt Grammar.PropertyAccess
               if (inx > 1 && this.accessors[inx - 1].constructor !== Grammar.PropertyAccess) {
                   this.throwError("'" + partial + ".call' or '.apply' must be used to call a function pointer stored in a variable");
               };

               var callParams = undefined;

               // if callNew
               if (callNew) {
                   callParams = [","]; // new(Class,argc,arguments*)
                    //add arguments: count,(any_arr){...}
                   this.addArguments(functionAccess.args, callParams);
                   callParams.push(")"); //close
               }
               
               else {
                   var fnNameArray = result.pop(); //take fn name
                   // if no hasInstanceReference //first accessor is function access, this is a call to a global function
                   if (!hasInstanceReference) { //first accessor is function access, this is a call to a global function

                       fnNameArray.push("("); //add "("
                        //if fnNameArray[0] is 'Number', fnNameArray[0]='_toNumber'; //convert "Number" (class name) to fn "_toNumber"
                       result.unshift(fnNameArray); // put "functioname" first - call to global function

                       // if fnNameArray[0] is '_concatAny'
                       if (fnNameArray[0] === '_concatAny') {
                           callParams = []; // no "thisValue" for internal _concatAny, just params to concat
                       }
                       
                       else {
                           callParams = ["undefined", ","]; //this==undefined as in js "use strict" mode
                       };

                        //add arguments: count,(any_arr){...}
                       this.addArguments(functionAccess.args, callParams);
                       callParams.push(")"); //close function(undefined,arg,any* arguments)
                   }
                   
                   else {
                        //method call

                        //to ease C-code reading, use macros CALL1 to CALL4 if possible
                       // if false //functionAccess.args and functionAccess.args.length<=4
                       if (false) { //functionAccess.args and functionAccess.args.length<=4

                            // __call enclose all
                           fnNameArray.unshift("CALL" + functionAccess.args.length + "(");
                            // here goes methodName
                           fnNameArray.push(","); // CALLn(symbol_ *,*
                            // here: instance reference as 2nd param (this value)
                           result.unshift(fnNameArray); //prepend CALLn(method_,instanceof,...
                           callParams = functionAccess.args.length ? [","] : [];
                           callParams.push(new Map().fromObject({CSL: functionAccess.args}));
                       }
                       
                       else {

//                             // METHOD()(... ) enclose all
//                             fnNameArray.unshift "METHOD("
//                             // here goes methodName
//                             fnNameArray.push "," // __call(symbol_ *,*
//                             // here: instance reference as 2nd param (this value)
//                             result.unshift fnNameArray //prepend __call(methodName, ...instanceof
//                             //options.validations.push ["assert("].concat(callParams,".type>TYPE_NULL);")
//                             callParams = [")("]
//                             
                           var simpleVar = result.length === 1 && result[0].length === 1;
                           // if simpleVar
                           if (simpleVar) {
                               var simpleVarName = result[0][0];
                                // METHOD()(... ) enclose all
                               fnNameArray.unshift(["METHOD("]);
                                // here goes methodName
                               fnNameArray.push(",");
                               result.unshift(fnNameArray);
                                // here: 1st instance reference
                               result.push([")(", simpleVarName]); // METHOD(symbol_,this)(this
                                //options.validations.push ["assert("].concat(callParams,".type>TYPE_NULL);")
                               callParams = [","];
                           }
                           
                           else {
                                // METHOD()(... ) enclose all
                               fnNameArray.unshift("__call(");
                                // here goes methodName
                               fnNameArray.push(","); // __call(symbol_ *,*
                                // here: instance reference as 2nd param (this value)
                               result.unshift(fnNameArray); //prepend __call(methodName, ...instanceof
                                //options.validations.push ["assert("].concat(callParams,".type>TYPE_NULL);")
                               callParams = [","];
                           };
                           // end if

                            //add arguments: count,(any_arr){...}
                           this.addArguments(functionAccess.args, callParams);
                           callParams.push(")"); //close
                       };

                       // end if
                       
                   };

                   // end if //global fn or method
                   
               };

               // end if //callNew

               result.push(callParams);

               // if actualVar, actualVar = actualVar.findMember('**return type**')
               if (actualVar) {actualVar = actualVar.findMember('**return type**')};
           }
                // #the actualVar is now function's return type'
                // #and next property access should be on defined members of the return type


// else, for IndexAccess, the varRef type is now 'name.value.item[...]'
// and next property access should be on defined members of the type
           
           else if (ac.constructor === Grammar.IndexAccess) {

               partial = "" + partial + "[...]";

               this.calcType = 'any';

                // declare ac:Grammar.IndexAccess

                //ac.name is a Expression
               ac.name.produceType = 'Number';

                //add macro ITEM(index, array )
                //macro ITEM() encloses all
               result.unshift(["ITEM(", ac.name, ","]);
                // here goes instance
               result.push([")"]);

               // if actualVar, actualVar = actualVar.findOwnMember('**item type**')
               if (actualVar) {actualVar = actualVar.findOwnMember('**item type**')};
           };

           // end if //type of accessor
           
       };// end for each in this.accessors

       // end for #each accessor

       return result;
     };



     // method getTypeName() returns string
     Grammar.VariableRef.prototype.getTypeName = function(){

       var opt = new Names.NameDeclOptions();
       opt.informError = true;
       opt.isForward = true;
       opt.isDummy = true;
       var avType = this.tryGetReference(opt);
        // #get type name
       var typeStr = avType.name;
       // if typeStr is 'prototype'
       if (typeStr === 'prototype') {
           typeStr = avType.parent.name;
       };
       // end if

       return typeStr;
     };


     // helper method addArguments(args:array , callParams:array)
     Grammar.VariableRef.prototype.addArguments = function(args, callParams){

        //add arguments[]
       // if args and args.length
       if (args && args.length) {
           callParams.push("" + args.length + ",(any_arr){", new Map().fromObject({CSL: args}), "}");
       }
       
       else {
           callParams.push("0,NULL");
       };
     };



   // append to class Grammar.AssignmentStatement ###

     // method produce()
     Grammar.AssignmentStatement.prototype.produce = function(){

       var extraLvalue = '.value.number';
       // if .lvalue.tryGetReference() into var nameDecl
       var nameDecl=undefined;
       if ((nameDecl=this.lvalue.tryGetReference()) && nameDecl.findOwnMember('**proto**') === '**native number**') {
               extraLvalue = undefined;
       };

       var oper = operTranslate(this.name);
       // switch oper
       switch(oper){
       
       case "+=": case "-=": case "*=": case "/=":

               // if oper is '+='
               if (oper === '+=') {
                   var rresultNameDecl = this.rvalue.getResultType();
                   // if rresultNameDecl and rresultNameDecl.isInstanceof('String')
                   if (rresultNameDecl && rresultNameDecl.isInstanceof('String')) {
                       this.sayErr("You should not use += to concat strings. use string concat oper: & or interpolation instead.\ne.g.: DO: \"a &= b\"  vs.  DO NOT: a += b");
                   };
               };

               this.rvalue.produceType = 'Number';
               this.out(this.lvalue, extraLvalue, ' ', oper, ' ', this.rvalue);
               break;
               
       case "&=":
               this.rvalue.produceType = 'any';
               this.out(this.lvalue, '=', "_concatAny(2,(any_arr){", this.lvalue, ',', this.rvalue, '})');
               break;
               
       default:
               this.rvalue.produceType = 'any';
               this.out(this.lvalue, ' ', operTranslate(this.name), ' ', this.rvalue);
       
       };
     };

// -------
   // append to class Grammar.DefaultAssignment ###

     // method produce()
     Grammar.DefaultAssignment.prototype.produce = function(){

       this.process(this.assignment.lvalue, this.assignment.rvalue);

       this.skipSemiColon = true;
     };

// #### helper Functions

      // #recursive duet 1
     // helper method process(name,value)
     Grammar.DefaultAssignment.prototype.process = function(name, value){

// if it is ObjectLiteral: recurse levels, else, a simple 'if undefined, assignment'

// check if it's a ObjectLiteral (level indent)

         // if value instanceof Grammar.ObjectLiteral
         if (value instanceof Grammar.ObjectLiteral) {
           this.processItems(name, value);// # recurse Grammar.ObjectLiteral
         }

// else, simple value (Expression)
         
         else {
           this.assignIfUndefined(name, value);// # Expression
         };
     };


      // #recursive duet 2
     // helper method processItems(main, objectLiteral)
     Grammar.DefaultAssignment.prototype.processItems = function(main, objectLiteral){

         this.throwError("default for objects not supported on C-generation");
     };
//           .out "_defaultObject(&",main,");",NL
//           for each nameValue in objectLiteral.items
//             var itemFullName = [main,'.',nameValue.name]
//             .process(itemFullName, nameValue.value)
//           

    // #end helper recursive functions

// -----------

   // append to class ASTBase
    // helper method lastLineInxOf(list:ASTBase array)
    ASTBase.prototype.lastLineInxOf = function(list){

// More Helper methods, get max line of list

       var lastLine = this.lineInx;
       // for each item in list
       for( var item__inx=0,item ; item__inx<list.length ; item__inx++){item=list[item__inx];
           // if item.lineInx>lastLine
           if (item.lineInx > lastLine) {
             lastLine = item.lineInx;
           };
       };// end for each in list

       return lastLine;
    };


// ---
   // append to class Grammar.WithStatement ###

// `WithStatement: with VariableRef Body`

// The WithStatement simplifies calling several methods of the same object:
// Example:
// ```
// with frontDoor
    // .show
    // .open
    // .show
    // .close
    // .show
// ```
// to js:
// ```
// var with__1=frontDoor;
  // with__1.show;
  // with__1.open
  // with__1.show
  // with__1.close
  // with__1.show
// ```

     // method produce()
     Grammar.WithStatement.prototype.produce = function(){

       this.out("var ", this.nameDecl.getComposedName(), '=', this.varRef, ";");
       this.out(this.body);
     };



// ---

   // append to class Names.Declaration ###

     // method addToAllProperties
     Names.Declaration.prototype.addToAllProperties = function(){

       var name = this.name;
       // if name not in coreSupportedProps and not allPropertyNames.has(name)
       if (coreSupportedProps.indexOf(name)===-1 && !(allPropertyNames.has(name))) {
           // if allMethodNames.has(name)
           if (allMethodNames.has(name)) {
               this.sayErr("Ambiguity: A method named '" + name + "' is already defined. Cannot reuse the symbol for a property");
               allMethodNames.get(name).sayErr("declaration of method '" + name + "'");
           }
           
           else if (coreSupportedMethods.indexOf(name)>=0) {
               this.sayErr("'" + name + "' is declared in as a core method. Cannot use the symbol for a property");
           }
           
           else {
               allPropertyNames.set(name, this);
           };
       };
     };

   // append to class Grammar.VarDeclList ###

     // method addToAllProperties
     Grammar.VarDeclList.prototype.addToAllProperties = function(){
       // for each varDecl in .list
       for( var varDecl__inx=0,varDecl ; varDecl__inx<this.list.length ; varDecl__inx++){varDecl=this.list[varDecl__inx];
           varDecl.nameDecl.addToAllProperties();
       };// end for each in this.list
       
     };

     // method getNames returns array of string
     Grammar.VarDeclList.prototype.getNames = function(){
       var result = [];
       // for each varDecl in .list
       for( var varDecl__inx=0,varDecl ; varDecl__inx<this.list.length ; varDecl__inx++){varDecl=this.list[varDecl__inx];
           result.push(varDecl.name);
       };// end for each in this.list
       return result;
     };


   // append to class Grammar.VarStatement ###

// 'var' followed by a list of comma separated: var names and optional assignment

     // method produce()
     Grammar.VarStatement.prototype.produce = function(){
       this.out('var ', new Map().fromObject({CSL: this.list}));
     };

   // append to class Grammar.VariableDecl ###

// variable name and optionally assign a value

     // method produce
     Grammar.VariableDecl.prototype.produce = function(){
       this.out(this.name, ' = ', this.assignedValue || 'undefined');
     };


//       method produceAssignments(prefix)
//         var count=0
//         for each variableDecl in .list
//             if count++ and no prefix, .out ", "
//             variableDecl.produceAssignment prefix
//             if prefix, .out ";",NL
//         if count and no prefix, .out ";",NL
// /*
// ---
// ### Append to class Grammar.PropertiesDeclaration ###
// 'properties' followed by a list of comma separated: var names and optional assignment
// See: Grammar.VariableDecl
//       method produce()
//         //.outLinesAsComment .lineInx, .lastLineInxOf(.list)
//         .out 'any ',{CSL:.list, freeForm:1},";"
//         //for each inx,varDecl in .list
//         //    .out inx>0?',':'',varDecl.name,NL
//         .addToAllProperties
//         .skipSemiColon = true
// ### Append to class Grammar.VariableDecl ###
// variable name and optionally assign a value
//       method produceAssignment(prefix) // prefix+name = [assignedValue|undefined]
//             .out prefix, .name,' = '
//             if .assignedValue
//                 .out .assignedValue
//             else
//                 .out 'undefined'
//     end VariableDecl
// ### Append to class Grammar.VarStatement ###
// 'var' followed by a list of comma separated: var names and optional assignment
//       method produceDeclare()
//         .out 'var ',{CSL:.list},";",NL
//       method produce()
// 'var' (alias for 'any') and one or more comma separated VariableDecl with assignments
//         .out 'var '
//         .produceAssignments
//         .skipSemiColon = true
// If 'var' was adjectivated 'export', add to exportNamespace
//         /*
//         if not .lexer.out.browser
//               if .export and not .default
//                 .out ";", NL,{COMMENT:'export'},NL
//                 for each varDecl in .list
//                     .out .lexer.out.exportNamespace,'.',varDecl.name,' = ', varDecl.name, ";", NL
//                 .skipSemiColon = true
//         
// */

   // append to class Grammar.ImportStatement ###

// 'import' followed by a list of comma separated: var names and optional assignment

     // method produce()
     Grammar.ImportStatement.prototype.produce = function(){

        //for each item in .list
        //    .out '#include "', item.getRefFilename('.h'),'"', NL

       this.skipSemiColon = true;
     };


   // append to class Grammar.SingleLineBody ###

     // method produce()
     Grammar.SingleLineBody.prototype.produce = function(){

       var bare = [];
       // for each item in .statements
       for( var item__inx=0,item ; item__inx<this.statements.length ; item__inx++){item=this.statements[item__inx];
           bare.push(item.specific);
       };// end for each in this.statements

       this.out(new Map().fromObject({CSL: bare, separator: ";"}), ";");
     };


   // append to class Grammar.IfStatement ###

     // method produce()
     Grammar.IfStatement.prototype.produce = function(){

        // declare valid .elseStatement.produce
       this.conditional.produceType = 'Bool';
       this.out("if (", this.conditional, ") ");

       // if .body instanceof Grammar.SingleLineBody
       if (this.body instanceof Grammar.SingleLineBody) {
           this.out('{', this.body, '}');
       }
       
       else {
           this.out(" {", this.getEOLComment());
           this.out(this.body, "}");
       };

       // if .elseStatement
       if (this.elseStatement) {
           this.outPrevLinesComments(this.elseStatement.lineInx - 1);
           this.elseStatement.produce();
       };
     };


   // append to class Grammar.ElseIfStatement ###

     // method produce()
     Grammar.ElseIfStatement.prototype.produce = function(){

       this.outSourceLineAsComment(this.sourceLineNum);

       this.out(NL, "else ", this.nextIf);
     };

   // append to class Grammar.ElseStatement ###

     // method produce()
     Grammar.ElseStatement.prototype.produce = function(){

       this.outSourceLineAsComment(this.sourceLineNum);

       this.out(NL, "else {", this.body, "}");
     };

   // append to class Grammar.ForStatement ###

// There are 3 variants of `ForStatement` in LiteScript

     // method produce()
     Grammar.ForStatement.prototype.produce = function(){

        // declare valid .variant.produce
       this.variant.produce();

// Since al 3 cases are closed with '}; //comment', we skip statement semicolon

       this.skipSemiColon = true;
     };


   // append to class Grammar.ForEachProperty
// ### Variant 1) 'for each property' to loop over *object property names*

// `ForEachProperty: for each property [name-IDENTIFIER,]value-IDENTIFIER in this-VariableRef`

     // method produce()
     Grammar.ForEachProperty.prototype.produce = function(){

// => C:  for(inx=0;inx<obj.getPropertyCount();inx++){
            // value=obj.value.prop[inx]; name=obj.getPropName(inx);
        // ...

// Create a default index var name if none was provided

       this.out("{", NL); //enclose defined temp vars in their own scope

       var listName = undefined, uniqueName = UniqueID.getVarName('list');// #unique temp listName var name
        // declare valid .iterable.root.name.hasSideEffects
       // if .iterable.operandCount>1 or .iterable.root.name.hasSideEffects or .iterable.root.name instanceof Grammar.Literal
       if (this.iterable.operandCount > 1 || this.iterable.root.name.hasSideEffects || this.iterable.root.name instanceof Grammar.Literal) {
           listName = uniqueName;
           this.out("any ", listName, "=", this.iterable, ";", NL);
       }
       
       else {
           listName = this.iterable;
       };

// create a var holding object property count

       this.out("len_t __propCount=", listName, '.class->instanceSize / sizeof(any);', NL);

       var startValue = "0";
       var intIndexVarName = '' + this.mainVar.name + '__inx';

       // if .indexVar
       if (this.indexVar) {
           this.out("any ", this.indexVar.name, "=undefined;", NL);
       };

       this.out("any ", this.mainVar.name, "=undefined;", NL);

       this.out("for(int __propIndex=", startValue, " ; __propIndex < __propCount", " ; __propIndex++ ){");

       this.body.out(this.mainVar.name, "=", listName, ".value.prop[__propIndex];", NL);

       // if .indexVar
       if (this.indexVar) {
           this.body.out(this.indexVar.name, "= _getPropertyNameAtIndex(", listName, ",__propIndex);", NL);
       };

       // if .where
       if (this.where) {
         this.out('  ', this.where, "{", this.body, "}");
       }
       
       else {
         this.out(this.body);
       };

       this.out("}};", new Map().fromObject({COMMENT: ["end for each property in ", this.iterable]}), NL);
     };

   // append to class Grammar.ForEachInArray
// ### Variant 2) 'for each index' to loop over *Array indexes and items*

// `ForEachInArray: for each [index-VariableDecl,]item-VariableDecl in array-VariableRef`

     // method produce()
     Grammar.ForEachInArray.prototype.produce = function(){

// Create a default index var name if none was provided

       var listName = undefined;
       listName = UniqueID.getVarName('list');// #unique temp listName var name
       this.out("any ", listName, "=", this.iterable, ";", NL);

       // if .isMap
       if (this.isMap) {
           return this.produceForMap(listName);
       };

       var intIndexVarName = undefined;
       var startValue = "0";
       // if .indexVar
       if (this.indexVar) {
           this.indexVar.nameDecl.members.set('**proto**', '**native number**');
           intIndexVarName = this.indexVar.name;
           startValue = this.indexVar.assignedValue || "0";
       }
       
       else {
           intIndexVarName = '' + this.mainVar.name + '__inx';
       };

// include mainVar.name in a bracket block to contain scope

       this.out("{ var ", this.mainVar.name, "=undefined;", NL);

       this.out("for(int ", intIndexVarName, "=", startValue, " ; ", intIndexVarName, "<", listName, ".value.arr->length", " ; ", intIndexVarName, "++){");

       this.body.out(this.mainVar.name, "=ITEM(", intIndexVarName, ",", listName, ");", NL);

       // if .where
       if (this.where) {
           this.out('  ', this.where, "{", this.body, "}"); //filter condition
       }
       
       else {
           this.out(this.body);
       };

       this.out("}};", new Map().fromObject({COMMENT: ["end for each in ", this.iterable]}), NL);
     };


     // method produceForMap(listName)
     Grammar.ForEachInArray.prototype.produceForMap = function(listName){

       this.out("{", "NameValuePair_ptr __nvp=NULL; //name:value pair", NL, "int64_t __len=MAPSIZE(", listName, "); //how many pairs", NL);

       // if .indexVar, .out "var ",.indexVar.name,"=undefined; //key",NL
       if (this.indexVar) {this.out("var ", this.indexVar.name, "=undefined; //key", NL)};
       this.out("var ", this.mainVar.name, "=undefined; //value", NL);

       this.out("for(int64_t __inx=0", " ; __inx < __len", " ; __inx++ ){", NL);

       this.body.out("__nvp = MAPITEM( __inx,", listName, ");", NL); //get nv pair ptr
       // if .indexVar, .body.out .indexVar.name,"= __nvp->name;",NL //get key
       if (this.indexVar) {this.body.out(this.indexVar.name, "= __nvp->name;", NL)};
       this.body.out(this.mainVar.name, "= __nvp->value;", NL); //get value

       // if .where
       if (this.where) {
         this.out('  ', this.where, "{", this.body, "}"); //filter condition
       }
       
       else {
         this.out(this.body);
       };

       this.out("}};", new Map().fromObject({COMMENT: ["end for each in map ", this.iterable]}), NL);
     };

   // append to class Grammar.ForIndexNumeric
// ### Variant 3) 'for index=...' to create *numeric loops*

// `ForIndexNumeric: for index-VariableDecl [","] (while|until|to|down to) end-Expression ["," increment-Statement] ["," where Expression]`

// Examples: `for n=0 while n<10`, `for n=0 to 9`
// Handle by using a js/C standard for(;;){} loop

     // method produce(iterable)
     Grammar.ForIndexNumeric.prototype.produce = function(iterable){

       var isToDownTo = undefined;
       var endTempVarName = undefined;

       this.endExpression.produceType = 'Number';

        // indicate .indexVar is a native number, so no ".value.number" required to produce a number
       this.indexVar.nameDecl.members.set('**proto**', '**native number**');

       // if .indexVar.assignedValue, .indexVar.assignedValue.produceType='Number'
       if (this.indexVar.assignedValue) {this.indexVar.assignedValue.produceType = 'Number'};

       // if .conditionPrefix in['to','down']
       if (['to', 'down'].indexOf(this.conditionPrefix)>=0) {

           isToDownTo = true;

// store endExpression in a temp var.
// For loops "to/down to" evaluate end expresion only once

           endTempVarName = UniqueID.getVarName('end');
           this.out("int64_t ", endTempVarName, "=", this.endExpression, ";", NL);
       };

       // end if

       this.out("for(int64_t ", this.indexVar.name, "=", this.indexVar.assignedValue || "0", "; ");

       // if isToDownTo
       if (isToDownTo) {

            // #'for n=0 to 10' -> for(n=0;n<=10;n++)
            // #'for n=10 down to 0' -> for(n=10;n>=0;n--)
           this.out(this.indexVar.name, this.conditionPrefix === 'to' ? "<=" : ">=", endTempVarName);
       }
       
       else {

// produce the condition, negated if the prefix is 'until'

            // #for n=0, while n<arr.length  -> for(n=0;n<arr.length;...
            // #for n=0, until n >= arr.length  -> for(n=0;!(n>=arr.length);...
           this.endExpression.produceType = 'Bool';
           this.endExpression.produce(this.conditionPrefix === 'until');
       };

       // end if

       this.out("; ");

// if no increment specified, the default is indexVar++/--

       this.out(this.increment ? this.increment.specific : [this.indexVar.name, this.conditionPrefix === 'down' ? '--' : '++'], ") ", "{", this.body, "};", new Map().fromObject({COMMENT: "end for " + this.indexVar.name}), NL);
     };



   // append to class Grammar.ForWhereFilter
// ### Helper for where filter
// `ForWhereFilter: [where Expression]`

     // method produce()
     Grammar.ForWhereFilter.prototype.produce = function(){
       this.outLineAsComment(this.lineInx);
       this.filterExpression.produceType = 'Bool';
       this.out('if(', this.filterExpression, ')');
     };

   // append to class Grammar.DeleteStatement
// `DeleteStatement: delete VariableRef`

     // method produce()
     Grammar.DeleteStatement.prototype.produce = function(){
       this.out('delete ', this.varRef);
     };

   // append to class Grammar.WhileUntilExpression ###

     // method produce(askFor:string, negated:boolean)
     Grammar.WhileUntilExpression.prototype.produce = function(askFor, negated){

// If the parent ask for a 'while' condition, but this is a 'until' condition,
// or the parent ask for a 'until' condition and this is 'while', we must *negate* the condition.

       // if askFor and .name isnt askFor
       if (askFor && this.name !== askFor) {
           negated = true;
       };

// *options.askFor* is used when the source code was, for example,
// `do until Expression` and we need to code: `while(!(Expression))`
// or the code was `loop while Expression` and we need to code: `if (!(Expression)) break`

// when you have a `until` condition, you need to negate the expression
// to produce a `while` condition. (`while NOT x` is equivalent to `until x`)

       this.expr.produceType = 'Bool';
       this.expr.produce(negated);
     };


   // append to class Grammar.DoLoop ###

     // method produce()
     Grammar.DoLoop.prototype.produce = function(){

// Note: **WhileUntilLoop** extends **DoLoop**, so this *.produce()* method is used by both symbols.

       // if .postWhileUntilExpression
       if (this.postWhileUntilExpression) {

// if we have a post-condition, for example: `do ... loop while x>0`,

           this.out("do{", this.getEOLComment(), this.body, "} while (");

           this.postWhileUntilExpression.produce('while');

           this.out(")");
       }

// else, optional pre-condition:
       
       else {

           this.out('while(');
           // if .preWhileUntilExpression
           if (this.preWhileUntilExpression) {
             this.preWhileUntilExpression.produce('while');
           }
           
           else {
             this.out('TRUE');
           };

           this.out('){', this.body, "}");
       };

       // end if

       this.out(";", new Map().fromObject({COMMENT: "end loop"}), NL);
       this.skipSemiColon = true;
     };

   // append to class Grammar.LoopControlStatement ###
// This is a very simple produce() to allow us to use the `break` and `continue` keywords.

     // method produce()
     Grammar.LoopControlStatement.prototype.produce = function(){

// validate usage inside a for/while

       var nodeASTBase = this.parent;
       // do
       while(true){

           // if .control is 'break' and nodeASTBase is instanceof Grammar.SwitchCase
           if (this.control === 'break' && nodeASTBase instanceof Grammar.SwitchCase) {
               this.sayErr('cannot use "break" from inside a "switch" statement for "historic" reasons');
           }
           
           else if (nodeASTBase instanceof Grammar.FunctionDeclaration) {
                //if we reach function header
               this.sayErr('"{.control}" outside a for|while|do loop');
               // break loop
               break;
           }
           
           else if (nodeASTBase instanceof Grammar.ForStatement || nodeASTBase instanceof Grammar.DoLoop) {
                   // break loop //ok, break/continue used inside a loop
                   break; //ok, break/continue used inside a loop
           };

           // end if

           nodeASTBase = nodeASTBase.parent;
       };// end loop

       this.out(this.control);
     };


   // append to class Grammar.DoNothingStatement ###

     // method produce()
     Grammar.DoNothingStatement.prototype.produce = function(){
       this.out("//do nothing", NL);
     };

   // append to class Grammar.ParenExpression ###
// A `ParenExpression` is just a normal expression surrounded by parentheses.

      // properties
        // produceType

     // method produce()
     Grammar.ParenExpression.prototype.produce = function(){
       this.expr.produceType = this.produceType;
       this.out("(", this.expr, ")");
     };

   // append to class Grammar.ArrayLiteral ###

// A `ArrayLiteral` is a definition of a list like `[1, a, 2+3]`.
// On js we just pass this through, on C we create the array on the fly

     // method produce()
     Grammar.ArrayLiteral.prototype.produce = function(){

       this.out("new(Array,");

       // if no .items or .items.length is 0
       if (!this.items || this.items.length === 0) {
           this.out("0,NULL");
       }
       
       else {
           this.out(this.items.length, ',(any_arr){', new Map().fromObject({CSL: this.items}), '}');
       };

       this.out(")");
     };


   // append to class Grammar.NameValuePair ###

// A `NameValuePair` is a single item in an Map definition.
// we call _newPair to create a new NameValuePair

     // method produce()
     Grammar.NameValuePair.prototype.produce = function(){
       var strName = this.name;

       // if strName instanceof Grammar.Literal
       if (strName instanceof Grammar.Literal) {
            // declare strName: Grammar.Literal
           strName = strName.getValue();
       };

       this.out(NL, '_newPair("', strName, '",', this.value, ')');
     };

   // append to class Grammar.ObjectLiteral ### also FreeObjectLiteral

// A `ObjectLiteral` is an object definition using key/value pairs like `{a:1,b:2}`.
// JavaScript supports this syntax, so we just pass it through.
// C99 does only support "static" initializers for structs.

     // method produce()
     Grammar.ObjectLiteral.prototype.produce = function(){

       this.out("new(Map,");

       // if no .items or .items.length is 0
       if (!this.items || this.items.length === 0) {
           this.out("0,NULL");
       }
       
       else {
           this.out(this.items.length, ',(any_arr){', new Map().fromObject({CSL: this.items}), NL, "}");
       };

       this.out(")", NL);
     };

   // append to class Grammar.ConstructorDeclaration ###

// Produce a Constructor

     // method produce()
     Grammar.ConstructorDeclaration.prototype.produce = function(){

       // if no .body.statements
       if (!this.body.statements) {
           this.skipSemiColon = true;
           return; // just method declaration (interface)
       };

        // get owner: should be ClassDeclaration
       var ownerClassDeclaration = this.getParent(Grammar.ClassDeclaration);
       // if no ownerClassDeclaration.nameDecl, return
       if (!ownerClassDeclaration.nameDecl) {return};

       var c = ownerClassDeclaration.nameDecl.getComposedName();

       this.out("void ", c, "__init(DEFAULT_ARGUMENTS){", NL);

// auto call supper init

       // if ownerClassDeclaration.varRefSuper
       if (ownerClassDeclaration.varRefSuper) {
           this.out("  ", new Map().fromObject({COMMENT: "auto call super class __init"}), NL, "  ", ownerClassDeclaration.varRefSuper, "__init(this,argc,arguments);", NL);
       };

// On the constructor, assign initial values for properties.
// Initialize (non-undefined) properties with assigned values.

       this.getParent(Grammar.ClassDeclaration).body.producePropertiesInitialValueAssignments("" + c + "_");

// now the rest of the constructor body

       this.produceFunctionBody(c);
     };


   // append to class Grammar.MethodDeclaration ###

// Produce a Method

     // method produce()
     Grammar.MethodDeclaration.prototype.produce = function(){

       // if no .body.statements
       if (!this.body.statements) {
           this.skipSemiColon = true;
           return; //just interface
       };

       // if no .nameDecl, return //shim
       if (!this.nameDecl) {return};
       var name = this.nameDecl.getComposedName();

       var ownerNameDecl = this.nameDecl.parent;
       // if no ownerNameDecl, return
       if (!ownerNameDecl) {return};

       var isClass = ownerNameDecl.name === 'prototype';

       var c = ownerNameDecl.getComposedName();

       this.out("any ", name, "(DEFAULT_ARGUMENTS){", NL);

        //assert 'this' parameter class
       // if isClass
       if (isClass) {
           this.body.out("assert(_instanceof(this,", c, "));", NL, "//---------");
       };

       this.produceFunctionBody(c);
     };


   // append to class Grammar.FunctionDeclaration ###

// only module function production
// (methods & constructors handled above)

// `FunctionDeclaration: '[export] function [name] '(' FunctionParameterDecl* ')' Block`

     // method produce()
     Grammar.FunctionDeclaration.prototype.produce = function(){

// exit if it is a *shim* method which never got declared (method exists, shim not required)

       // if no .nameDecl, return
       if (!this.nameDecl) {return};

// being a function, the only possible parent is a Module

       var parentModule = this.getParent(Grammar.Module);
       var prefix = parentModule.fileInfo.base;
       var name = "" + prefix + "_" + this.name;

       var isInterface = !this.body.statements;
       // if isInterface, return // just method declaration (interface)
       if (isInterface) {return};

       this.out("any ", name, "(DEFAULT_ARGUMENTS){");

       this.produceFunctionBody(prefix);
     };


     // helper method produceFunctionBody(prefix:string)
     Grammar.FunctionDeclaration.prototype.produceFunctionBody = function(prefix){

// common code
// start body

        // function named params
       // if .paramsDeclarations and .paramsDeclarations.length
       if (this.paramsDeclarations && this.paramsDeclarations.length) {

               this.body.out(NL, "// define named params", NL);

               // if .paramsDeclarations.length is 1
               if (this.paramsDeclarations.length === 1) {
                   this.body.out("var ", this.paramsDeclarations[0].name, "= argc? arguments[0] : undefined;", NL);
               }
               
               else {
                   var namedParams = [];

                   // for each paramDecl in .paramsDeclarations
                   for( var paramDecl__inx=0,paramDecl ; paramDecl__inx<this.paramsDeclarations.length ; paramDecl__inx++){paramDecl=this.paramsDeclarations[paramDecl__inx];
                       namedParams.push(paramDecl.name);
                   };// end for each in this.paramsDeclarations

                   this.body.out("var ", new Map().fromObject({CSL: namedParams}), ";", NL, namedParams.join("="), "=undefined;", NL, "switch(argc){", NL);


                   // for inx=namedParams.length-1, while inx>=0, inx--
                   for( var inx=namedParams.length - 1; inx >= 0; inx--) {
                       this.body.out("  case " + (inx + 1) + ":" + (namedParams[inx]) + "=arguments[" + inx + "];", NL);
                   };// end for inx

                   this.body.out("}", NL);
               };

               // end if
               this.body.out("//---------", NL);
       };

       // end if //named params

// if single line body, insert return. Example: `function square(x) = x*x`

       // if .body instance of Grammar.Expression
       if (this.body instanceof Grammar.Expression) {
           this.out("return ", this.body);
       }
       
       else {

// if it has a exception block, insert 'try{'

           // if .hasExceptionBlock, .body.out " try{",NL
           if (this.hasExceptionBlock) {this.body.out(" try{", NL)};

// now produce function body

           this.body.produce();

// close the function, to all functions except *constructors* (__init),
// add default "return undefined", to emulate js behavior on C.
// if you dot not insert a "return", the C function will return garbage.

           // if not .constructor is Grammar.ConstructorDeclaration // declared as void Class__init(...)
           if (!(this.constructor === Grammar.ConstructorDeclaration)) { // declared as void Class__init(...)
               this.out("return undefined;", NL);
           };
       };

// close function

       this.out("}");

       this.skipSemiColon = true;
     };

        //if .lexer.out.sourceMap
        //    .lexer.out.sourceMap.add ( .EndFnLineNum, 0, .lexer.out.lineNum-1, 0)
        //endif


// --------------------
   // append to class Grammar.PrintStatement ###
// `print` is an alias for console.log

     // method produce()
     Grammar.PrintStatement.prototype.produce = function(){

       // if .args.length
       if (this.args.length) {
           this.out('print(' + this.args.length + ',(any_arr){', new Map().fromObject({CSL: this.args}), '})');
       }
       
       else {
           this.out('print(0,NULL)');
       };
     };

// --------------------
   // append to class Grammar.EndStatement ###

// Marks the end of a block. It's just a comment for javascript

     // method produce()
     Grammar.EndStatement.prototype.produce = function(){

        // declare valid .lexer.outCode.lastOriginalCodeComment
        // declare valid .lexer.infoLines

       // if .lexer.outCode.lastOriginalCodeComment<.lineInx
       if (this.lexer.outCode.lastOriginalCodeComment < this.lineInx) {
         this.out(new Map().fromObject({COMMENT: this.lexer.infoLines[this.lineInx].text}));
       };

       this.skipSemiColon = true;
     };

// --------------------
   // append to class Grammar.CompilerStatement ###

     // method produce()
     Grammar.CompilerStatement.prototype.produce = function(){

// first, out as comment this line

       this.outLineAsComment(this.lineInx);

// if it's a conditional compile, output body is option is Set

       // if .conditional
       if (this.conditional) {
           // if .compilerVar(.conditional)
           if (this.compilerVar(this.conditional)) {
                // declare valid .body.produce
               this.body.produce();
           };
       };

       this.skipSemiColon = true;
     };


// --------------------
   // append to class Grammar.ImportStatementItem ###

       // method getRefFilename(ext)
       Grammar.ImportStatementItem.prototype.getRefFilename = function(ext){

           var thisModule = this.getParent(Grammar.Module);

           return Environment.relativeFrom(thisModule.fileInfo.outDir, this.importedModule.fileInfo.outWithExtension(".h"));
       };

// --------------------
   // append to class Grammar.DeclareStatement ###

// Out as comments

     // method produce()
     Grammar.DeclareStatement.prototype.produce = function(){
       this.outLinesAsComment(this.lineInx, this.names ? this.lastLineInxOf(this.names) : this.lineInx);
       this.skipSemiColon = true;
     };


// ----------------------------
   // append to class Names.Declaration ###
        //properties
            //productionInfo: ClassProductionInfo

       // method getComposedName
       Names.Declaration.prototype.getComposedName = function(){

// if this nameDecl is member of a namespace, goes up the parent chain
// composing the name. e.g.: Foo_Bar_var

           var result = [];
           var node = this;
           // while node and not node.isScope
           while(node && !(node.isScope)){
               // if node.name isnt 'prototype', result.unshift node.name
               if (node.name !== 'prototype') {result.unshift(node.name)};
               // if node.nodeDeclared instanceof Grammar.ImportStatementItem
               if (node.nodeDeclared instanceof Grammar.ImportStatementItem) {
                    //stop here, imported modules create a local var, but act as global var
                    //since all others import of the same name, return the same content
                   return result.join('_');
               };

               node = node.parent;
           };// end loop

// if we reach module scope, (and not Global Scope)
// then it's a var|fn|class declared at module scope.
// Since modules act as namespaces, we add module.fileinfo.base to the name.
// Except is the same name as the top namespace|class (auto export default).


           // if node and node.isScope and node.nodeDeclared.constructor is Grammar.Module
           if (node && node.isScope && node.nodeDeclared.constructor === Grammar.Module) {
               var scopeModule = node.nodeDeclared;
               // if scopeModule.name isnt '*Global Scope*' //except for global scope
               if (scopeModule.name !== '*Global Scope*') { //except for global scope
                   // if result[0] isnt scopeModule.fileInfo.base
                   if (result[0] !== scopeModule.fileInfo.base) {
                       result.unshift(scopeModule.fileInfo.base);
                   };
               };
           };

           return result.join('_');
       };

// For C production, we're declaring each distinct method name (verbs)

       // method addToAllMethodNames()
       Names.Declaration.prototype.addToAllMethodNames = function(){
           var methodName = this.name;

           // if methodName not in coreSupportedMethods and not allMethodNames.has(methodName)
           if (coreSupportedMethods.indexOf(methodName)===-1 && !(allMethodNames.has(methodName))) {
               // if allPropertyNames.has(methodName)
               if (allPropertyNames.has(methodName)) {
                   this.sayErr("Ambiguity: A property '" + methodName + "' is already defined. Cannot reuse the symbol for a method.");
                   allPropertyNames.get(methodName).sayErr("Definition of property '" + methodName + "'.");
               }
               
               else if (coreSupportedProps.indexOf(methodName)>=0) {
                   this.sayErr("Ambiguity: A property '" + methodName + "' is defined in core. Cannot reuse the symbol for a method.");
               }
               
               else {
                   allMethodNames.set(methodName, this);
               };
           };
       };



   // append to class Grammar.TryCatch ###

     // method produce()
     Grammar.TryCatch.prototype.produce = function(){

       this.out('try{', this.body, this.exceptionBlock);
     };

   // append to class Grammar.ExceptionBlock ###

     // method produce()
     Grammar.ExceptionBlock.prototype.produce = function(){

       this.out(NL, '}catch(', this.catchVar, '){', this.body, '}');

       // if .finallyBody
       if (this.finallyBody) {
           this.out(NL, 'finally{', this.finallyBody, '}');
       };
     };


   // append to class Grammar.SwitchStatement ###

     // method produce()
     Grammar.SwitchStatement.prototype.produce = function(){

// if we have a varRef, is a switch over a value
// we produce as chained if-else, using == to switchValue

       // if .varRef
       if (this.varRef) {

           var switchVar = UniqueID.getVarName('switch');
           this.out("any ", switchVar, "=", this.varRef, ";", NL);

           // for each index,switchCase in .cases
           for( var index=0,switchCase ; index<this.cases.length ; index++){switchCase=this.cases[index];

               this.outLineAsComment(switchCase.lineInx);

               this.out(index > 0 ? 'else ' : '', 'if (', new Map().fromObject({pre: '__is(' + switchVar + ',', CSL: switchCase.expressions, post: ')', separator: '||'}), '){', switchCase.body, NL, '}');
           };// end for each in this.cases
           
       }

// else, it's a swtich over true-expression, we produce as chained if-else
// with the casee expresions
       
       else {

         // for each index,switchCase in .cases
         for( var index=0,switchCase ; index<this.cases.length ; index++){switchCase=this.cases[index];
             this.outLineAsComment(switchCase.lineInx);
             this.out(index > 0 ? 'else ' : '', 'if (', new Map().fromObject({pre: '(', CSL: switchCase.expressions, post: ')', separator: '||'}), '){', switchCase.body, NL, '}');
         };// end for each in this.cases
         
       };

       // end if

// defaul case

       // if .defaultBody, .out NL,'else {',.defaultBody,'}'
       if (this.defaultBody) {this.out(NL, 'else {', this.defaultBody, '}')};
     };


   // append to class Grammar.SwitchCase ###

     // method produce()
     Grammar.SwitchCase.prototype.produce = function(){

       // for each expression in .expressions
       for( var expression__inx=0,expression ; expression__inx<this.expressions.length ; expression__inx++){expression=this.expressions[expression__inx];
           expression.produceType = 'Number';
       };// end for each in this.expressions

       this.out(new Map().fromObject({pre: 'case ', CSL: this.expressions, post: ':', separator: ' '}));
       this.out(this.body);
       this.body.out('break;', NL);
     };


   // append to class Grammar.CaseWhenExpression ###

     // method produce()
     Grammar.CaseWhenExpression.prototype.produce = function(){

// if we have a varRef, is a case over a value

       // if .varRef
       if (this.varRef) {

           var caseVar = UniqueID.getVarName('caseVar');
           this.out('(function(', caseVar, '){', NL);
           // for each caseWhenSection in .cases
           for( var caseWhenSection__inx=0,caseWhenSection ; caseWhenSection__inx<this.cases.length ; caseWhenSection__inx++){caseWhenSection=this.cases[caseWhenSection__inx];
               caseWhenSection.out('if(', new Map().fromObject({pre: '' + caseVar + '==(', CSL: caseWhenSection.expressions, post: ')', separator: '||'}), ') return ', caseWhenSection.resultExpression, ';', NL);
           };// end for each in this.cases

           // if .elseExpression, .out '    return ',.elseExpression,';',NL
           if (this.elseExpression) {this.out('    return ', this.elseExpression, ';', NL)};
           this.out('        }(', this.varRef, '))');
       }

// else, it's a var-less case. we code it as chained ternary operators
       
       else {

         // for each caseWhenSection in .cases
         for( var caseWhenSection__inx=0,caseWhenSection ; caseWhenSection__inx<this.cases.length ; caseWhenSection__inx++){caseWhenSection=this.cases[caseWhenSection__inx];
             this.outLineAsComment(caseWhenSection.lineInx);
             caseWhenSection.booleanExpression.produceType = 'Bool';
             caseWhenSection.out('(', caseWhenSection.booleanExpression, ') ? (', caseWhenSection.resultExpression, ') :', NL);
         };// end for each in this.cases

         this.out('/* else */ ', this.elseExpression || 'undefined');
       };
     };


   // append to class Grammar.DebuggerStatement ###
     // method produce
     Grammar.DebuggerStatement.prototype.produce = function(){
       this.out("assert(0)");
     };

   // append to class Grammar.YieldExpression ###

     // method produce()
     Grammar.YieldExpression.prototype.produce = function(){

// Check location

       // if no .getParent(Grammar.FunctionDeclaration) into var functionDeclaration
       var functionDeclaration=undefined;
       if (!((functionDeclaration=this.getParent(Grammar.FunctionDeclaration))) || !functionDeclaration.hasAdjective('nice')) {
               this.throwError('"yield" can only be used inside a "nice function/method"');
       };

       var yieldArr = [];

       var varRef = this.fnCall.varRef;
        //from .varRef calculate object owner and method name

       var thisValue = 'null';
       var fnName = varRef.name;// #default if no accessors

       // if varRef.accessors
       if (varRef.accessors) {

           var inx = varRef.accessors.length - 1;
           // if varRef.accessors[inx] instance of Grammar.FunctionAccess
           if (varRef.accessors[inx] instanceof Grammar.FunctionAccess) {
               var functionAccess = varRef.accessors[inx];
               yieldArr = functionAccess.args;
               inx--;
           };

           // if inx>=0
           if (inx >= 0) {
               // if varRef.accessors[inx] isnt instance of Grammar.PropertyAccess
               if (!(varRef.accessors[inx] instanceof Grammar.PropertyAccess)) {
                   this.throwError('yield needs a clear method name. Example: "yield until obj.method(10)". redefine yield parameter.');
               };

               fnName = "'" + (varRef.accessors[inx].name) + "'";
               thisValue = [varRef.name];
               thisValue = thisValue.concat(varRef.accessors.slice(0, inx));
           };
       };


       // if .specifier is 'until'
       if (this.specifier === 'until') {

           yieldArr.unshift(fnName);
           yieldArr.unshift(thisValue);
       }
       
       else {

           yieldArr.push("'map'", this.arrExpression, thisValue, fnName);
       };


       this.out("yield [ ", new Map().fromObject({CSL: yieldArr}), " ]");
     };



// # Helper functions


// Identifier aliases
// ------------------

// This are a few aliases to most used built-in identifiers:

   var IDENTIFIER_ALIASES = new Map().fromObject({
     'on': 'true', 
     'off': 'false'
     });

// Utility
// -------

   var NL = '\n';// # New Line constant

// Operator Mapping
// ================

// Many LiteScript operators can be easily mapped one-to-one with their JavaScript equivalents.

   var OPER_TRANSLATION_map = new Map().fromObject({
     'no': '!', 
     'not': '!', 
     'unary -': '-', 
     'unary +': '+', 
     'type of': 'typeof', 
     'instance of': 'instanceof', 
     'bitand': '&', 
     'bitor': '|', 
     'is': '==', 
     'isnt': '!=', 
     '<>': '!=', 
     'and': '&&', 
     'but': '&&', 
     'or': '||', 
     'has property': 'in'
     });


   // function operTranslate(name:string)
   function operTranslate(name){
     return OPER_TRANSLATION_map.get(name) || name;
   };

// ---------------------------------

   // append to class ASTBase
// Helper methods and properties, valid for all nodes

     // properties skipSemiColon

    // helper method assignIfUndefined(name,expression)
    ASTBase.prototype.assignIfUndefined = function(name, expression){

          //.out "if(",name,'.class==&Undefined_CLASSINFO) ',name,"=",expression,";",NL
         this.out("_default(&", name, ",", expression, ");", NL);
    };


// --------------------------------
