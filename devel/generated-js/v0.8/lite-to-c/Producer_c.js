//Producer C
//===========

//The `producer` module extends Grammar classes, adding a `produce()` method 
//to generate target code for the node.

//The compiler calls the `.produce()` method of the root 'Module' node 
//in order to return the compiled code for the entire tree.

//We extend the Grammar classes, so this module require the `Grammar` module.

    //import 
      //Project
      //Parser, ASTBase, Grammar
      //Names
      //Environment, logger, color, UniqueID
    var Project = require('./Project.js');
    var Parser = require('./Parser.js');
    var ASTBase = require('./ASTBase.js');
    var Grammar = require('./Grammar.js');
    var Names = require('./Names.js');
    var Environment = require('./lib/Environment.js');
    var logger = require('./lib/logger.js');
    var color = require('./lib/color.js');
    var UniqueID = require('./lib/UniqueID.js');

    //shim import LiteCore
    var LiteCore = require('./interfaces/LiteCore.js');

//To be able to compile-to-c this source, we instruct the
//compiler to create a *new Map* when it encounters an *untyped* object literal.
//e.g: `var x = {foo:1, bar:"baz"}` => `var x = Map.newFromObject({foo:1, bar:"baz"})`

    //lexer options object literal is Map

//Map & Object implement common methods:
//.hasProperty, .tryGetProperty, .setProperty, .allClassProperties
//so the same code can handle "objects" (when compiled-to-js) 
//and "Maps" (when compiled-to-c)



//"C" Producer Functions
//==========================

//module vars  

    //# list of classes, to call _newClass & _declareMethodsAndProps
    //var allClasses: array of Grammar.ClassDeclaration = []
    var allClasses = [];

//store each distinct method name (globally).
//We start with core-supported methods. 
//Method get a trailing "_" if they're a C reserved word

    //var allMethodNames: Map string to Names.Declaration = {}  // all distinct methodnames, to declare method symbols
    var allMethodNames = new Map().fromObject({}); // all distinct methodnames, to declare method symbols
    //var allClassProperties: Map string to Names.Declaration = {} // all distinct propname, to declare props symbols
    var allClassProperties = new Map().fromObject({}); // all distinct propname, to declare props symbols

    //var coreSupportedMethods = [
        //"toString","iterableNext"
        //"tryGetMethod","tryGetProperty","getProperty", "getPropertyName","hasProperty"
        //"has", "get", "set", "clear", "delete", "keys"
        //"slice", "split", "indexOf", "lastIndexOf", "concat"
        //"toUpperCase", "toLowerCase","charAt", "replaceAll","trim","substr","countSpaces","byteIndexOf","byteSlice"
        //"toDateString","toTimeString","toUTCString","toISOString"
        //"copy", "write" //Buffer
        //"shift","push","unshift", "pop", "join","splice"
    var coreSupportedMethods = ["toString", "iterableNext", "tryGetMethod", "tryGetProperty", "getProperty", "getPropertyName", "hasProperty", "has", "get", "set", "clear", "delete", "keys", "slice", "split", "indexOf", "lastIndexOf", "concat", "toUpperCase", "toLowerCase", "charAt", "replaceAll", "trim", "substr", "countSpaces", "byteIndexOf", "byteSlice", "toDateString", "toTimeString", "toUTCString", "toISOString", "copy", "write", "shift", "push", "unshift", "pop", "join", "splice"];
    //]

    //var coreSupportedProps = [
        //'name','value','key','size','message','stack','code','extra'
    var coreSupportedProps = ['name', 'value', 'key', 'size', 'message', 'stack', 'code', 'extra'];
    //]

    //public var dispatcherModule: Grammar.Module
    var dispatcherModule = undefined;
    // export
    module.exports.dispatcherModule = dispatcherModule;

    //var appendToCoreClassMethods: array of Grammar.MethodDeclaration = []
    var appendToCoreClassMethods = [];

    //var DEFAULT_ARGUMENTS = "(any this, len_t argc, any* arguments)"
    var DEFAULT_ARGUMENTS = "(any this, len_t argc, any* arguments)";


//### Public function postProduction(project)
    function postProduction(project){

//create _dispatcher.c & .h

        //dispatcherModule = new Grammar.Module()
        module.exports.dispatcherModule = new Grammar.Module();
        //declare valid project.options
        
        //dispatcherModule.lexer = new Parser.Lexer(project, project.options)
        module.exports.dispatcherModule.lexer = new Parser.Lexer(project, project.options);

        //project.redirectOutput dispatcherModule.lexer.outCode // all Lexers now out here        
        project.redirectOutput(module.exports.dispatcherModule.lexer.outCode); // all Lexers now out here

        //dispatcherModule.fileInfo = Environment.fileInfoNewFile("_dispatcher", project.options.target)
        module.exports.dispatcherModule.fileInfo = Environment.fileInfoNewFile("_dispatcher", project.options.target);

        //dispatcherModule.lexer.outCode.filenames[0] = dispatcherModule.fileInfo.outFilename
        module.exports.dispatcherModule.lexer.outCode.filenames[0] = module.exports.dispatcherModule.fileInfo.outFilename;
        //dispatcherModule.lexer.outCode.filenames[1] = '#{dispatcherModule.fileInfo.outFilename.slice(0,-1)}h'
        module.exports.dispatcherModule.lexer.outCode.filenames[1] = '' + (module.exports.dispatcherModule.fileInfo.outFilename.slice(0, -1)) + 'h';

        //dispatcherModule.produceDispatcher project
        module.exports.dispatcherModule.produceDispatcher(project);

        //dispatcherModule.lexer.outCode.close
        module.exports.dispatcherModule.lexer.outCode.close();

        ///*
        //var resultLines:string array =  dispatcherModule.lexer.outCode.getResult() //get .c file contents
        //if resultLines.length
            //Environment.externalCacheSave dispatcherModule.fileInfo.outFilename,resultLines

        //resultLines =  dispatcherModule.lexer.outCode.getResult(1) //get .h file contents
        //if resultLines.length
            //Environment.externalCacheSave '#{dispatcherModule.fileInfo.outFilename.slice(0,-1)}h',resultLines
        //*/

        //logger.info "#{color.green}[OK] -> #{dispatcherModule.fileInfo.outRelFilename} #{color.normal}"
        logger.info('' + color.green + "[OK] -> " + module.exports.dispatcherModule.fileInfo.outRelFilename + " " + color.normal);
        //logger.extra #blank line
        logger.extra();// #blank line
    }
    // export
    module.exports.postProduction = postProduction;

    //end function
    

    //helper function normalizeDefine(name:string)
    function normalizeDefine(name){
        //var chr, result=""
        var chr = undefined, result = "";
        //for n=0 to name.length
        var _end7=name.length;
        for( var n=0; n<=_end7; n++) {
            //chr=name.charAt(n).toUpperCase()
            chr = name.charAt(n).toUpperCase();
            //if chr<'A' or chr>'Z', chr="_"
            if (chr < 'A' || chr > 'Z') {chr = "_"};
            //result="#{result}#{chr}"
            result = '' + result + chr;
        };// end for n

        //return result
        return result;
    };


//### Append to class Grammar.Module ###
    

//#### method produceDispatcher(project)
     Grammar.Module.prototype.produceDispatcher = function(project){

        //var requiredHeaders: Grammar.Module array = []
        var requiredHeaders = [];

//_dispatcher.h

        //.out 
            //{h:1},NL
            //'#ifndef #{normalizeDefine(.fileInfo.outRelFilename)}_H',NL
            //'#define #{normalizeDefine(.fileInfo.outRelFilename)}_H',NL,NL
            //'#include "LiteC-core.h"',NL,NL,NL
        this.out({h: 1}, NL, '#ifndef ' + (normalizeDefine(this.fileInfo.outRelFilename)) + '_H', NL, '#define ' + (normalizeDefine(this.fileInfo.outRelFilename)) + '_H', NL, NL, '#include "LiteC-core.h"', NL, NL, NL);

//LiteC__init extern declaration

        //.out 
            //NL,{COMMENT: 'core support and defined classes init'},NL
            //'extern void __declareClasses();',NL,NL
        this.out(NL, {COMMENT: 'core support and defined classes init'}, NL, 'extern void __declareClasses();', NL, NL);

//verbs & things

//now all distinct method names

        //.out 
            //{COMMENT: 'methods'},NL,NL
            //"enum _VERBS { //a symbol for each distinct method name",NL
        this.out({COMMENT: 'methods'}, NL, NL, "enum _VERBS { //a symbol for each distinct method name", NL);

        //var initialValue = " = -_CORE_METHODS_MAX-#{allMethodNames.size}"
        var initialValue = " = -_CORE_METHODS_MAX-" + allMethodNames.size;
        //for each methodDeclaration in map allMethodNames
        var methodDeclaration=undefined;
        if(!allMethodNames.dict) throw(new Error("for each in map: not a Map, no .dict property"));
        for ( var methodDeclaration__propName in allMethodNames.dict){methodDeclaration=allMethodNames.dict[methodDeclaration__propName];
            {
            //.out '    ',makeSymbolName(methodDeclaration.name),initialValue,",",NL
            this.out('    ', makeSymbolName(methodDeclaration.name), initialValue, ",", NL);
            //initialValue=undefined
            initialValue = undefined;
            }
            
            }// end for each property
        //.out NL,"_LAST_VERB};",NL
        this.out(NL, "_LAST_VERB};", NL);

//all  distinct property names

        //.out 
            //{COMMENT: 'property names'},NL,NL
            //"enum _THINGS { //a symbol for each distinct property name",NL
        this.out({COMMENT: 'property names'}, NL, NL, "enum _THINGS { //a symbol for each distinct property name", NL);

        //initialValue = "= _CORE_PROPS_LENGTH"
        initialValue = "= _CORE_PROPS_LENGTH";
        //for each name,value in map allClassProperties
        var value=undefined;
        if(!allClassProperties.dict) throw(new Error("for each in map: not a Map, no .dict property"));
        for ( var name in allClassProperties.dict){value=allClassProperties.dict[name];
            {
            //.out '    ',makeSymbolName(name), initialValue, ",",NL
            this.out('    ', makeSymbolName(name), initialValue, ",", NL);
            //initialValue=undefined
            initialValue = undefined;
            }
            
            }// end for each property
        //.out NL,"_LAST_THING};",NL,NL,NL
        this.out(NL, "_LAST_THING};", NL, NL, NL);

        //.out """
        this.out("\n            // a MACRO for each property name, to circumvent C-preprocessor problem with commas\n            // and to be able to include foo__(this) as a parameter in a ITEM(arr,index) MACRO\n");

            // a MACRO for each property name, to circumvent C-preprocessor problem with commas
            // and to be able to include foo__(this) as a parameter in a ITEM(arr,index) MACRO

            //"""

        //for each name,value in map allClassProperties
        var value=undefined;
        if(!allClassProperties.dict) throw(new Error("for each in map: not a Map, no .dict property"));
        for ( var name in allClassProperties.dict){value=allClassProperties.dict[name];
            {
            //.out "    #define ",makeSymbolName(name), "_(this) PROP(",makeSymbolName(name),",this)",NL
            this.out("    #define ", makeSymbolName(name), "_(this) PROP(", makeSymbolName(name), ",this)", NL);
            }
            
            }// end for each property

        //.out NL,NL,NL
        this.out(NL, NL, NL);

//Now include headers for all the imported modules.
//To put this last is important, because if there's a error in the included.h 
//and it's *before* declaring _VERBS and _THINGS, _VERBS and _THINGS don't get
//declared and the C compiler shows errors everywhere

        //for each moduleNode:Grammar.Module in map project.moduleCache
        var moduleNode=undefined;
        if(!project.moduleCache.dict) throw(new Error("for each in map: not a Map, no .dict property"));
        for ( var moduleNode__propName in project.moduleCache.dict){moduleNode=project.moduleCache.dict[moduleNode__propName];
            {
            //var hFile = moduleNode.fileInfo.outWithExtension(".h")
            var hFile = moduleNode.fileInfo.outWithExtension(".h");
            //hFile = Environment.relativeFrom(.fileInfo.outDir, hFile)
            hFile = Environment.relativeFrom(this.fileInfo.outDir, hFile);
            //.out '#include "#{hFile}"',NL
            this.out('#include "' + hFile + '"', NL);
            }
            
            }// end for each property

        //.out NL,NL,"#endif",NL,NL
        this.out(NL, NL, "#endif", NL, NL);

//_dispatcher.c

        //.out 
            //{h:0},NL
            //'#include "_dispatcher.h"',NL,NL,NL,NL
        this.out({h: 0}, NL, '#include "_dispatcher.h"', NL, NL, NL, NL);

//static definition added verbs (methods) and things (properties)

        //.out 
            //{COMMENT: 'methods'},NL,NL
            //"static str _ADD_VERBS[] = { //string name for each distinct method name",NL
            //{pre:'    "', CSL:allMethodNames.keys(), post:'"\n'}
            //'};',NL,NL
        this.out({COMMENT: 'methods'}, NL, NL, "static str _ADD_VERBS[] = { //string name for each distinct method name", NL, {pre: '    "', CSL: allMethodNames.keys(), post: '"\n'}, '};', NL, NL);

//all  distinct property names

        //.out 
            //{COMMENT: 'propery names'},NL,NL
            //"static str _ADD_THINGS[] = { //string name for each distinct property name",NL
            //{pre:'    "', CSL:allClassProperties.keys(), post:'"\n'}
            //'};',NL,NL
        this.out({COMMENT: 'propery names'}, NL, NL, "static str _ADD_THINGS[] = { //string name for each distinct property name", NL, {pre: '    "', CSL: allClassProperties.keys(), post: '"\n'}, '};', NL, NL);

//All literal Maps & arrays

        ///*for each nameDecl in map .scope.members
            //where nameDecl.nodeDeclared instanceof Grammar.Literal
                //.out nameDecl,";",NL
        //*/

//_dispatcher.c contains main function

        //.out 
            //"\n\n\n//-------------------------------",NL
            //"int main(int argc, char** argv) {",NL
            //'    LiteC_init( #{allClasses.length}, argc,argv);',NL
            //'    LiteC_addMethodSymbols( #{allMethodNames.size}, _ADD_VERBS);',NL
            //'    LiteC_addPropSymbols( #{allClassProperties.size}, _ADD_THINGS);',NL
        this.out("\n\n\n//-------------------------------", NL, "int main(int argc, char** argv) {", NL, '    LiteC_init( ' + allClasses.length + ', argc,argv);', NL, '    LiteC_addMethodSymbols( ' + allMethodNames.size + ', _ADD_VERBS);', NL, '    LiteC_addPropSymbols( ' + allClassProperties.size + ', _ADD_THINGS);', NL);


//process methods appended to core classes, by calling LiteC_registerShim

        //.out '\n'
        this.out('\n');
        //for each methodDeclaration in appendToCoreClassMethods
        for( var methodDeclaration__inx=0,methodDeclaration ; methodDeclaration__inx<appendToCoreClassMethods.length ; methodDeclaration__inx++){methodDeclaration=appendToCoreClassMethods[methodDeclaration__inx];
        
                //var appendToDeclaration = methodDeclaration.getParent(Grammar.ClassDeclaration)
                var appendToDeclaration = methodDeclaration.getParent(Grammar.ClassDeclaration);
                //.out '    LiteC_registerShim(',appendToDeclaration.varRef,
                this.out('    LiteC_registerShim(', appendToDeclaration.varRef, ',' + methodDeclaration.name + '_,', appendToDeclaration.varRef, '_', methodDeclaration.name, ');', NL);
        };// end for each in appendToCoreClassMethods
                     //',#{methodDeclaration.name}_,',
                     //appendToDeclaration.varRef,'_',methodDeclaration.name,');',NL

//call __ModuleInit for all the imported modules. call the base modules init first

        //var moduleList: array of Grammar.Module=[]
        var moduleList = [];

        //for each moduleNode:Grammar.Module in map project.moduleCache
        var moduleNode=undefined;
        if(!project.moduleCache.dict) throw(new Error("for each in map: not a Map, no .dict property"));
        for ( var moduleNode__propName in project.moduleCache.dict){moduleNode=project.moduleCache.dict[moduleNode__propName];
        if(moduleNode !== project.main){
            //where moduleNode isnt project.main
                //moduleList.push moduleNode //order in moduleCache is lower level to higher level
                moduleList.push(moduleNode); //order in moduleCache is lower level to higher level
                }
                
                }// end for each property

        // sort list so base-modules (deeper level) come first 
        //moduleList.sort(sortByRecurseLevel)
        moduleList.sort(sortByRecurseLevel);

        //.out '\n'
        this.out('\n');
        //for each nodeModule in moduleList
        for( var nodeModule__inx=0,nodeModule ; nodeModule__inx<moduleList.length ; nodeModule__inx++){nodeModule=moduleList[nodeModule__inx];
        
            //.out '    ',nodeModule.fileInfo.base,'__moduleInit();',' // level:',nodeModule.dependencyTreeLevel ,NL 
            this.out('    ', nodeModule.fileInfo.base, '__moduleInit();', ' // level:', nodeModule.dependencyTreeLevel, NL);
        };// end for each in moduleList

//call main module __init (main program execution),
//and before exit, call LiteC_finish

        //.out 
            //'\n\n    ',project.main.fileInfo.base,'__moduleInit();'
            //NL
            //'\n\n    LiteC_finish();'
            //NL 
            //'} //end main'
            //NL
        this.out('\n\n    ', project.main.fileInfo.base, '__moduleInit();', NL, '\n\n    LiteC_finish();', NL, '} //end main', NL);
     };


//#### method produce() # Module
     Grammar.Module.prototype.produce = function(){// # Module

//default #includes:
//"LiteC-core.h" in the header, the .h in the .c

        //.out 
            //{h:1},NL
            //'#ifndef #{normalizeDefine(.fileInfo.outRelFilename)}_H',NL
            //'#define #{normalizeDefine(.fileInfo.outRelFilename)}_H',NL,NL
        this.out({h: 1}, NL, '#ifndef ' + (normalizeDefine(this.fileInfo.outRelFilename)) + '_H', NL, '#define ' + (normalizeDefine(this.fileInfo.outRelFilename)) + '_H', NL, NL);

        //var thisBase = Environment.getDir(.fileInfo.outFilename)
        var thisBase = Environment.getDir(this.fileInfo.outFilename);

        //declare valid .parent.fileInfo.outFilename
        
        //var dispatcherFull = "#{Environment.getDir(.parent.fileInfo.outFilename)}/_dispatcher.h"
        var dispatcherFull = '' + (Environment.getDir(this.parent.fileInfo.outFilename)) + "/_dispatcher.h";
        //var dispatcherRel = Environment.relativeFrom(thisBase,dispatcherFull)
        var dispatcherRel = Environment.relativeFrom(thisBase, dispatcherFull);
        //.out '#include "', dispatcherRel, '"',NL
        this.out('#include "', dispatcherRel, '"', NL);

        //var prefix=.fileInfo.base
        var prefix = this.fileInfo.base;

        //.out 
            //"//-------------------------",NL
            //"//Module ",prefix, NL
            //"//-------------------------",NL
        this.out("//-------------------------", NL, "//Module ", prefix, NL, "//-------------------------", NL);

//Modules have a __moduleInit function holding module items initialization and any loose statements

        //.out "extern void ",prefix,"__moduleInit(void);",NL
        this.out("extern void ", prefix, "__moduleInit(void);", NL);

//Interfaces have a __nativeInit function to provide a initialization opportunity 
//to module native support

        //if .fileInfo.isInterface // add call to native hand-coded C support for this module 
        if (this.fileInfo.isInterface) { // add call to native hand-coded C support for this module
            //.out "extern void ",prefix,"__nativeInit(void);",NL
            this.out("extern void ", prefix, "__nativeInit(void);", NL);
        };

//Since we cannot initialize a module var at declaration in C (err:initializer element is not constant),
//we separate declaration from initialization.

//Var names declared inside a module/namespace, get prefixed with namespace name

//module vars declared public 

        // add each public/export item as a extern declaration
        //.produceDeclaredExternProps prefix
        this.produceDeclaredExternProps(prefix);

//Now produce the .c file,

        //.out 
            //{h:0} //on .c
            //'#include "#{prefix}.h"',NL,NL
            //"//-------------------------",NL
            //"//Module ",prefix, .fileInfo.isInterface? ' - INTERFACE':'',NL
            //"//-------------------------",NL
        this.out({h: 0}, '#include "' + prefix + '.h"', NL, NL, "//-------------------------", NL, "//Module ", prefix, this.fileInfo.isInterface ? ' - INTERFACE' : '', NL, "//-------------------------", NL);

///*
//OLD include __or temp vars

        //.out '#include "#{.fileInfo.base}.c.extra"',NL
        //.lexer.outCode.filenames[2] = "#{.fileInfo.outFilename}.extra"
//*/


//Check if there's a explicit namespace/class with the same name as the module (default export)

        //var explicitModuleNamespace 
        var explicitModuleNamespace = undefined;
        //for each statement in .statements    
        for( var statement__inx=0,statement ; statement__inx<this.statements.length ; statement__inx++){statement=this.statements[statement__inx];
        
            //if statement.specific.constructor is Grammar.NamespaceDeclaration
            if (statement.specific.constructor === Grammar.NamespaceDeclaration && statement.specific.name === this.fileInfo.base) {
                //and statement.specific.name is .fileInfo.base
                    //explicitModuleNamespace=statement
                    explicitModuleNamespace = statement;
                    //explicitModuleNamespace.produce //produce main namespace
                    explicitModuleNamespace.produce(); //produce main namespace
                    //break
                    break;
            };
        };// end for each in this.statements


//if there's no explicit namespace declaration, 
//produce this module body as a namespace (using module name as namespace)

        //if no explicitModuleNamespace 
        if (!explicitModuleNamespace) {
            //.produceAsNamespace prefix
            this.produceAsNamespace(prefix);
        };

//__moduleInit: module main function 

        //.out 
            //"\n\n//-------------------------",NL
            //"void ",prefix,"__moduleInit(void){",NL
        this.out("\n\n//-------------------------", NL, "void ", prefix, "__moduleInit(void){", NL);

        // all init is done in the module-as-namespace init, just call __namespaceInit
        //.out '    ',prefix,'__namespaceInit();',NL
        this.out('    ', prefix, '__namespaceInit();', NL);

        //if .fileInfo.isInterface // add call to native hand-coded C support for this module 
        if (this.fileInfo.isInterface) { // add call to native hand-coded C support for this module
            //.out NL,'    ',prefix,"__nativeInit();"
            this.out(NL, '    ', prefix, "__nativeInit();");
        };

        //.out NL,"};",NL
        this.out(NL, "};", NL);

        //.skipSemiColon = true
        this.skipSemiColon = true;

//close .h #ifdef

        //.out 
            //{h:1}
            //NL,'#endif',NL
            //{h:0}
        this.out({h: 1}, NL, '#endif', NL, {h: 0});
     };


//### function sortByRecurseLevel(moduleA:Grammar.Module, moduleB:Grammar.Module)
    function sortByRecurseLevel(moduleA, moduleB){
        //return moduleB.dependencyTreeLevel - moduleA.dependencyTreeLevel // deeper level first
        return moduleB.dependencyTreeLevel - moduleA.dependencyTreeLevel; // deeper level first
    };


//----------------------------

//## Grammar.ClassDeclaration & derivated

//### Append to class Grammar.AppendToDeclaration ###
    

//Any class|object can have properties or methods appended at any time. 
//Append-to body contains properties and methods definitions.

      //method produceHeader() 
      Grammar.AppendToDeclaration.prototype.produceHeader = function(){

        //var nameDeclClass = .varRef.tryGetReference() // get class being append to
        var nameDeclClass = this.varRef.tryGetReference(); // get class being append to
        //if no nameDeclClass, return .sayErr("append to: no reference found")
        if (!nameDeclClass) {return this.sayErr("append to: no reference found")};

        //if .toNamespace
        if (this.toNamespace) {
            //.body.produceDeclaredExternProps nameDeclClass.getComposedName(), true
            this.body.produceDeclaredExternProps(nameDeclClass.getComposedName(), true);
            //return //nothing more to do if it's "append to namespace"
            return; //nothing more to do if it's "append to namespace"
        };

//handle methods added to core classes

        //if nameDeclClass.nodeDeclared and nameDeclClass.nodeDeclared.name is "*Global Scope*"
        if (nameDeclClass.nodeDeclared && nameDeclClass.nodeDeclared.name === "*Global Scope*") {

//for each method declaration in .body

            //for each item in .body.statements
            for( var item__inx=0,item ; item__inx<this.body.statements.length ; item__inx++){item=this.body.statements[item__inx];
              if(item.specific.constructor === Grammar.MethodDeclaration){
                //where item.specific.constructor is Grammar.MethodDeclaration 
                    //declare item.specific: Grammar.MethodDeclaration 
                    

                    //if no item.specific.nameDecl, continue // do not process, is a shim
                    if (!item.specific.nameDecl) {continue};

//keep a list of all methods appended to core-defined classes (like String)
//they require a special registration, because the class pre-exists in core

                    //appendToCoreClassMethods.push item.specific
                    appendToCoreClassMethods.push(item.specific);

//also add to allMethods, since the class is core, is not declared in this project

                    //item.specific.nameDecl.addToAllMethodNames
                    item.specific.nameDecl.addToAllMethodNames();

//out header

                    //.out 'extern any ',item.specific.nameDecl.getComposedName(),"(DEFAULT_ARGUMENTS);",NL                            
                    this.out('extern any ', item.specific.nameDecl.getComposedName(), "(DEFAULT_ARGUMENTS);", NL);
            }};// end for each in this.body.statements
            
        };
      };



      //method produce() 
      Grammar.AppendToDeclaration.prototype.produce = function(){

        //if .toNamespace, return //nothing to do if it's "append to namespace"
        //.out .body
        this.out(this.body);
        //.skipSemiColon = true
        this.skipSemiColon = true;
      };


//### Append to class Grammar.NamespaceDeclaration ###
    
//namespaces are like modules inside modules


//#### method produceHeader
     Grammar.NamespaceDeclaration.prototype.produceHeader = function(){

        //var prefix= .nameDecl.getComposedName()
        var prefix = this.nameDecl.getComposedName();

        //.out 
            //"//-------------------------",NL
            //"// namespace ",prefix,NL
            //"//-------------------------",NL
        this.out("//-------------------------", NL, "// namespace ", prefix, NL, "//-------------------------", NL);

//all namespace methods & props are public 

        // add each method
        //var count=0
        var count = 0;
        //var namespaceMethods=[]
        var namespaceMethods = [];
        //for each member in map .nameDecl.members
        var member=undefined;
        if(!this.nameDecl.members.dict) throw(new Error("for each in map: not a Map, no .dict property"));
        for ( var member__propName in this.nameDecl.members.dict){member=this.nameDecl.members.dict[member__propName];
        if(['constructor', 'length', 'prototype'].indexOf(member.name)===-1){
            //where member.name not in ['constructor','length','prototype']
                //case member.nodeClass
                
                    //when Grammar.VariableDecl:
                if (
                   (member.nodeClass==Grammar.VariableDecl)
               ){
                        //.out '    extern var ',prefix,'_',member.name,';',NL
                        this.out('    extern var ', prefix, '_', member.name, ';', NL);
                
                }
                    //when Grammar.MethodDeclaration:
                else if (
                   (member.nodeClass==Grammar.MethodDeclaration)
               ){
                        //.out '    extern any ',prefix,'_',member.name,'(DEFAULT_ARGUMENTS);',NL
                        this.out('    extern any ', prefix, '_', member.name, '(DEFAULT_ARGUMENTS);', NL);
                
                };
                }
                
                }// end for each property

         // recurse, add internal classes and namespaces
        //.body.produceDeclaredExternProps prefix, forcePublic=true
        this.body.produceDeclaredExternProps(prefix, true);
     };


//#### method produce # namespace
     Grammar.NamespaceDeclaration.prototype.produce = function(){// # namespace

        //var prefix= .nameDecl.getComposedName()
        var prefix = this.nameDecl.getComposedName();
        //var isPublic = .hasAdjective('export')
        var isPublic = this.hasAdjective('export');

        //logger.debug "produce Namespace",c
        //.body.produceAsNamespace prefix
        this.body.produceAsNamespace(prefix);
     };


//### Append to class Grammar.ClassDeclaration ###
    

//#### method produceHeader()
     Grammar.ClassDeclaration.prototype.produceHeader = function(){

        //if no .nameDecl, return //shim class
        if (!this.nameDecl) {return};

        // keep a list of classes in each moudle, to out __registerClass
        //allClasses.push this
        allClasses.push(this);

        //var c = .nameDecl.getComposedName()
        var c = this.nameDecl.getComposedName();

        //logger.debug "produce header class",c

//header

        //.outClassTitleComment c
        this.outClassTitleComment(c);

//In C we create a struct for "instance properties" of each class 

        //.out 
            //"typedef struct ",c,"_s * ",c,"_ptr;",NL
            //"typedef struct ",c,"_s {",NL
        this.out("typedef struct ", c, "_s * ", c, "_ptr;", NL, "typedef struct ", c, "_s {", NL);

//out all properties, from the start of the "super-extends" chain

        //.nameDecl.outSuperChainProps this
        this.nameDecl.outSuperChainProps(this);

//close instance struct

        //.out NL,"} ",c,"_s;",NL,NL
        this.out(NL, "} ", c, "_s;", NL, NL);

//and declare extern for class __init

        //declare extern for this class methods
        //.out "extern void ",c,"__init(DEFAULT_ARGUMENTS);",NL
        this.out("extern void ", c, "__init(DEFAULT_ARGUMENTS);", NL);
        //.out "extern any ",c,"_newFromObject(DEFAULT_ARGUMENTS);",NL
        this.out("extern any ", c, "_newFromObject(DEFAULT_ARGUMENTS);", NL);


//add each prop to "all properties list", each method to "all methods list"
//and declare extern for each class method

        //var classMethods=[]
        var classMethods = [];

        //var prt = .nameDecl.findOwnMember('prototype')
        var prt = this.nameDecl.findOwnMember('prototype');
        //for each prtNameDecl in map prt.members
        var prtNameDecl=undefined;
        if(!prt.members.dict) throw(new Error("for each in map: not a Map, no .dict property"));
        for ( var prtNameDecl__propName in prt.members.dict){prtNameDecl=prt.members.dict[prtNameDecl__propName];
        if(['constructor', 'length', 'prototype'].indexOf(prtNameDecl.name)===-1){
            //where prtNameDecl.name not in ['constructor','length','prototype']
                //if prtNameDecl.nodeClass is Grammar.VariableDecl
                if (prtNameDecl.nodeClass === Grammar.VariableDecl) {
                    // keep a list of all classes props
                    //prtNameDecl.addToAllProperties
                    prtNameDecl.addToAllProperties();
                }
                else {
                //else
                    // keep a list of all classes methods
                    //prtNameDecl.addToAllMethodNames 
                    prtNameDecl.addToAllMethodNames();

                    //declare extern for this class methods
                    //.out "extern any ",c,"_",prtNameDecl.name,"(DEFAULT_ARGUMENTS);",NL
                    this.out("extern any ", c, "_", prtNameDecl.name, "(DEFAULT_ARGUMENTS);", NL);
                };
                }
                
                }// end for each property

//methods in the class as namespace

        //for each nameDecl in map .nameDecl.members
        var nameDecl=undefined;
        if(!this.nameDecl.members.dict) throw(new Error("for each in map: not a Map, no .dict property"));
        for ( var nameDecl__propName in this.nameDecl.members.dict){nameDecl=this.nameDecl.members.dict[nameDecl__propName];
        if(nameDecl.name !== 'prototype' && nameDecl.name.charAt(0) !== '*'){
            //where nameDecl.name isnt 'prototype' and nameDecl.name.charAt(0) isnt '*'
                //if nameDecl.nodeClass is Grammar.MethodDeclaration
                if (nameDecl.nodeClass === Grammar.MethodDeclaration) {
                    //declare extern for this class as namespace method
                    //.out "extern any ",c,"_",nameDecl.name,"(DEFAULT_ARGUMENTS); //class as namespace",NL
                    this.out("extern any ", c, "_", nameDecl.name, "(DEFAULT_ARGUMENTS); //class as namespace", NL);
                };
                }
                
                }// end for each property
        
     };

//#### method produce()
     Grammar.ClassDeclaration.prototype.produce = function(){

        //if no .nameDecl, return //shim class
        if (!this.nameDecl) {return};

        //logger.debug "produce body class",c

//this is the class body, goes on the .c file,

        //var c = .nameDecl.getComposedName()
        var c = this.nameDecl.getComposedName();

        //.outClassTitleComment c
        this.outClassTitleComment(c);

        //var hasConstructor: boolean
        var hasConstructor = undefined;
        //var hasNewFromObject: boolean
        var hasNewFromObject = undefined;

        //for each index,item in .body.statements
        for( var index=0,item ; index<this.body.statements.length ; index++){item=this.body.statements[index];
        

            //if item.specific instanceof Grammar.ConstructorDeclaration 
            if (item.specific instanceof Grammar.ConstructorDeclaration) {
                //if hasConstructor # what? more than one?
                if (hasConstructor) {// # what? more than one?
                    //.throwError('Two constructors declared for class #{c}')
                    this.throwError('Two constructors declared for class ' + c);
                };
                //hasConstructor = true
                hasConstructor = true;
            }
            else if (item.specific instanceof Grammar.MethodDeclaration) {

            //else if item.specific instanceof Grammar.MethodDeclaration
                //if .name is 'newFromObject'
                if (this.name === 'newFromObject') {
                    //hasNewFromObject = true
                    hasNewFromObject = true;
                };
            };
        };// end for each in this.body.statements


//default constructors

        //if not .getParent(Grammar.Module).fileInfo.isInterface
        if (!(this.getParent(Grammar.Module).fileInfo.isInterface)) {

            //if not hasConstructor 
            if (!(hasConstructor)) {
                // produce a default constructor
                //.out 
                    //"//auto ",c,"__init",NL
                    //"void ",c,"__init",DEFAULT_ARGUMENTS,"{",NL
                this.out("//auto ", c, "__init", NL, "void ", c, "__init", DEFAULT_ARGUMENTS, "{", NL);

                //if .varRefSuper
                if (this.varRefSuper) {
                    //.out 
                        //"    ",{COMMENT:"//auto call super class __init"},NL
                        //"    ",.varRefSuper,"__init(this,argc,arguments);",NL
                    this.out("    ", {COMMENT: "//auto call super class __init"}, NL, "    ", this.varRefSuper, "__init(this,argc,arguments);", NL);
                };

                //.body.producePropertiesInitialValueAssignments '((#{c}_ptr)this.value.ptr)->'
                this.body.producePropertiesInitialValueAssignments('((' + c + '_ptr)this.value.ptr)->');

                // end default constructor
                //.out "};",NL
                this.out("};", NL);
            };

//produce newFromObject

            //if not hasNewFromObject
            if (!(hasNewFromObject)) {

                // produce default newFromObject as namespace method for the class
                //.out 
                    //NL
                    //"//auto ",c,"_newFromObject",NL
                    //"inline any ",c,"_newFromObject(DEFAULT_ARGUMENTS){",NL
                    //"    return _newFromObject(",c,",argc,arguments);",NL
                    //"}",NL
                this.out(NL, "//auto ", c, "_newFromObject", NL, "inline any ", c, "_newFromObject(DEFAULT_ARGUMENTS){", NL, "    return _newFromObject(", c, ",argc,arguments);", NL, "}", NL);
            };
        };

//produce class body

        //.body.produce
        this.body.produce();
        //.skipSemiColon = true
        this.skipSemiColon = true;
     };


//-------------------------------------
//#### helper method outClassTitleComment(c:string)
     Grammar.ClassDeclaration.prototype.outClassTitleComment = function(c){

        //.out 
            //"\n\n//--------------",NL
            //{COMMENT:c},NL
            //'any #{c}; //Class ',c
            //.varRefSuper? [' extends ',.varRefSuper,NL] else '', NL
        this.out("\n\n//--------------", NL, {COMMENT: c}, NL, 'any ' + c + '; //Class ', c, this.varRefSuper ? [' extends ', this.varRefSuper, NL] : '', NL);
     };


//-------------------------------------
//#### method produceStaticListMethodsAndProps
     Grammar.ClassDeclaration.prototype.produceStaticListMethodsAndProps = function(){

//static definition info for each class: list of _METHODS and _PROPS

        //skip NamespaceDeclaration & AppendToDeclaration (both derived from ClassDeclaration)
        //if .constructor isnt Grammar.ClassDeclaration, return 
        if (this.constructor !== Grammar.ClassDeclaration) {return};

        //var c = .nameDecl.getComposedName()
        var c = this.nameDecl.getComposedName();

        //.out 
            //'//-----------------------',NL
            //'// Class ',c,': static list of METHODS(verbs) and PROPS(things)',NL
            //'//-----------------------',NL
            //NL 
            //"static _methodInfoArr ",c,"_METHODS = {",NL
        this.out('//-----------------------', NL, '// Class ', c, ': static list of METHODS(verbs) and PROPS(things)', NL, '//-----------------------', NL, NL, "static _methodInfoArr ", c, "_METHODS = {", NL);

        //var propList=[]
        var propList = [];
        //var prt = .nameDecl.findOwnMember('prototype')
        var prt = this.nameDecl.findOwnMember('prototype');
        //for each nameDecl in map prt.members
        var nameDecl=undefined;
        if(!prt.members.dict) throw(new Error("for each in map: not a Map, no .dict property"));
        for ( var nameDecl__propName in prt.members.dict){nameDecl=prt.members.dict[nameDecl__propName];
        if(['constructor', 'length', 'prototype'].indexOf(nameDecl.name)===-1){
            //where nameDecl.name not in ['constructor','length','prototype']
                //if nameDecl.nodeClass is Grammar.MethodDeclaration
                if (nameDecl.nodeClass === Grammar.MethodDeclaration) {
                    //.out '  { #{makeSymbolName(nameDecl.name)}, #{c}_#{nameDecl.name} },',NL
                    this.out('  { ' + (makeSymbolName(nameDecl.name)) + ', ' + c + '_' + nameDecl.name + ' },', NL);
                }
                else {
                //else
                    //propList.push makeSymbolName(nameDecl.name)
                    propList.push(makeSymbolName(nameDecl.name));
                };
                }
                
                }// end for each property

        //.out 
            //NL,"{0,0}}; //method jmp table initializer end mark",NL
            //NL
            //"static propIndex_t ",c,"_PROPS[] = {",NL
            //{CSL:propList, post:'\n    '}
            //"};",NL,NL
        this.out(NL, "{0,0}}; //method jmp table initializer end mark", NL, NL, "static propIndex_t ", c, "_PROPS[] = {", NL, {CSL: propList, post: '\n    '}, "};", NL, NL);
     };

//#### method produceClassRegistration
     Grammar.ClassDeclaration.prototype.produceClassRegistration = function(){

        //skip NamespaceDeclaration & AppendToDeclaration (both derived from ClassDeclaration)
        //if .constructor isnt Grammar.ClassDeclaration, return 
        if (this.constructor !== Grammar.ClassDeclaration) {return};

        //var c = .nameDecl.getComposedName()
        var c = this.nameDecl.getComposedName();

        //var superName = .nameDecl.superDecl? .nameDecl.superDecl.getComposedName() else 'Object' 
        var superName = this.nameDecl.superDecl ? this.nameDecl.superDecl.getComposedName() : 'Object';

        //.out 
            //'    #{c} =_newClass("#{c}", #{c}__init, sizeof(struct #{c}_s), #{superName});',NL
            //'    _declareMethods(#{c}, #{c}_METHODS);',NL
            //'    _declareProps(#{c}, #{c}_PROPS, sizeof #{c}_PROPS);',NL,NL
        this.out('    ' + c + ' =_newClass("' + c + '", ' + c + '__init, sizeof(struct ' + c + '_s), ' + superName + ');', NL, '    _declareMethods(' + c + ', ' + c + '_METHODS);', NL, '    _declareProps(' + c + ', ' + c + '_PROPS, sizeof ' + c + '_PROPS);', NL, NL);
     };

//-------------------------------------
//### Append to class Names.Declaration
    
//#### method outSuperChainProps(node:Grammar.ClassDeclaration) #recursive
     Names.Declaration.prototype.outSuperChainProps = function(node){// #recursive

//out all properties of a class, including those of the super's-chain

        //if .superDecl, .superDecl.outSuperChainProps node #recurse
        if (this.superDecl) {this.superDecl.outSuperChainProps(node)};

        //node.out '    //',.name,NL
        node.out('    //', this.name, NL);
        //var prt = .ownMember('prototype')
        var prt = this.ownMember('prototype');
        //if no prt, .sayErr "class #{.name} has no prototype"
        if (!prt) {this.sayErr("class " + this.name + " has no prototype")};

        //for each prtNameDecl in map prt.members
        var prtNameDecl=undefined;
        if(!prt.members.dict) throw(new Error("for each in map: not a Map, no .dict property"));
        for ( var prtNameDecl__propName in prt.members.dict){prtNameDecl=prt.members.dict[prtNameDecl__propName];
        if(['constructor', 'length', 'prototype'].indexOf(prtNameDecl.name)===-1){
            //where prtNameDecl.name not in ['constructor','length','prototype']
                //if prtNameDecl.nodeClass is Grammar.VariableDecl
                if (prtNameDecl.nodeClass === Grammar.VariableDecl) {
                    //node.out '    any ',prtNameDecl.name,";",NL
                    node.out('    any ', prtNameDecl.name, ";", NL);
                };
                }
                
                }// end for each property
        
     };



//### Append to class Grammar.Body 
    

//A "Body" is an ordered list of statements.

//"Body"s lines have all the same indent, representing a scope.

//"Body"s are used for example, to parse an `if` statement body and `else` body, `for` loops, etc.

//#### method produce()
     Grammar.Body.prototype.produce = function(){

        //for each statement in .statements
        for( var statement__inx=0,statement ; statement__inx<this.statements.length ; statement__inx++){statement=this.statements[statement__inx];
        
          //statement.produce()
          statement.produce();
        };// end for each in this.statements

        //.out NL
        this.out(NL);
     };


//#### method produceAsNamespace(prefix) # namespace
     Grammar.Body.prototype.produceAsNamespace = function(prefix){// # namespace

//Now on the .c file,

        //.out 
            //"//-------------------------",NL
            //"//NAMESPACE ",prefix,NL
            //"//-------------------------",NL
        this.out("//-------------------------", NL, "//NAMESPACE ", prefix, NL, "//-------------------------", NL);

//add declarations for vars & internal classes

        //.produceInternalDeclarations prefix
        this.produceInternalDeclarations(prefix);

//__namespaceInit function

        //.out 
            //NL,NL,"//------------------",NL
            //"void ",prefix,"__namespaceInit(void){",NL
        this.out(NL, NL, "//------------------", NL, "void ", prefix, "__namespaceInit(void){", NL);

//register internal classes

        //.callOnSubTree LiteCore.getSymbol('produceClassRegistration')
        this.callOnSubTree(LiteCore.getSymbol('produceClassRegistration'));

//namespace initialization vars & code

        //.produceInitializationCode prefix
        this.produceInitializationCode(prefix);

        //.out "};",NL
        this.out("};", NL);
        //.skipSemiColon = true
        this.skipSemiColon = true;
     };


//#### method produceDeclaredExternProps(parentName,forcePublic)
     Grammar.Body.prototype.produceDeclaredExternProps = function(parentName, forcePublic){

        //if no .statements, return //interface only
        if (!this.statements) {return};

        //var prefix = parentName? "#{parentName}_" else ""
        var prefix = parentName ? '' + parentName + "_" : "";

        // add each declared prop as a extern prefixed var
        //for each item in .statements
        for( var item__inx=0,item ; item__inx<this.statements.length ; item__inx++){item=this.statements[item__inx];
        

            //var isPublic = forcePublic or item.hasAdjective('export')
            var isPublic = forcePublic || item.hasAdjective('export');

            //case item.specific.constructor
            
                //when Grammar.VarStatement:
            if (
               (item.specific.constructor==Grammar.VarStatement)
           ){
                    //declare item.specific:Grammar.VarStatement
                    
                    //if isPublic, .out 'extern var ',{pre:prefix, CSL:item.specific.getNames()},";",NL
                    if (isPublic) {this.out('extern var ', {pre: prefix, CSL: item.specific.getNames()}, ";", NL)};
            
            }
                //when Grammar.FunctionDeclaration, Grammar.MethodDeclaration: //method: append to class xx - when is a core class
            else if (
               (item.specific.constructor==Grammar.FunctionDeclaration)
               ||(item.specific.constructor==Grammar.MethodDeclaration)
           ){
                    //declare item.specific:Grammar.FunctionDeclaration
                    
                    //export module function
                    //if isPublic, .out 'extern any ',prefix,item.specific.name,"(DEFAULT_ARGUMENTS);",NL
                    if (isPublic) {this.out('extern any ', prefix, item.specific.name, "(DEFAULT_ARGUMENTS);", NL)};
            
            }
                //when Grammar.ClassDeclaration, Grammar.AppendToDeclaration:
            else if (
               (item.specific.constructor==Grammar.ClassDeclaration)
               ||(item.specific.constructor==Grammar.AppendToDeclaration)
           ){
                    //declare item.specific:Grammar.ClassDeclaration
                    
                    //produce class header declarations
                    //item.specific.produceHeader
                    item.specific.produceHeader();
            
            }
                //when Grammar.NamespaceDeclaration:
            else if (
               (item.specific.constructor==Grammar.NamespaceDeclaration)
           ){
                    //declare item.specific:Grammar.NamespaceDeclaration
                    
                    //item.specific.produceHeader #recurses
                    item.specific.produceHeader();// #recurses
            
            };
        };// end for each in this.statements
        
     };
                    // as in JS, always public. Must produce, can have classes inside


//#### method produceInternalDeclarations(prefix)
     Grammar.Body.prototype.produceInternalDeclarations = function(prefix){

//before main function,
//produce body sustance: vars & other functions declarations

        //if no .statements, return //just interface
        if (!this.statements) {return};

        //var produceSecond: array of Grammar.Statement = []
        var produceSecond = [];
        //var produceThird: array of Grammar.Statement = []
        var produceThird = [];

        //for each item in .statements
        for( var item__inx=0,item ; item__inx<this.statements.length ; item__inx++){item=this.statements[item__inx];
        

            //if item.specific instanceof Grammar.VarDeclList // PropertiesDeclaration & VarStatement
            if (item.specific instanceof Grammar.VarDeclList) { // PropertiesDeclaration & VarStatement
                //declare item.specific:Grammar.VarDeclList
                
                //just declare existence, do not assign. (C compiler: error: initializer element is not constant)
                //.out 'var ',{pre:"#{prefix}_", CSL:item.specific.getNames()},";",NL
                this.out('var ', {pre: '' + prefix + "_", CSL: item.specific.getNames()}, ";", NL);
            }
            else if (item.specific.constructor === Grammar.FunctionDeclaration) {

            //since C require to define a fn before usage. we make forward declarations
            // of all module functions, to avoid any ordering problem.
            //else if item.specific.constructor is Grammar.FunctionDeclaration
                //declare item.specific:Grammar.FunctionDeclaration
                
                //just declare existence, do not assign. (C compiler: error: initializer element is not constant)
                //.out 'any ',prefix,'_',item.specific.name,"(DEFAULT_ARGUMENTS); //forward declare",NL
                this.out('any ', prefix, '_', item.specific.name, "(DEFAULT_ARGUMENTS); //forward declare", NL);
                //produceThird.push item
                produceThird.push(item);
            }
            else if (item.specific.constructor === Grammar.ClassDeclaration) {

            //else if item.specific.constructor is Grammar.ClassDeclaration
                //declare item.specific:Grammar.ClassDeclaration
                
                //item.specific.produceStaticListMethodsAndProps
                item.specific.produceStaticListMethodsAndProps();
                //produceSecond.push item.specific
                produceSecond.push(item.specific);
            }
            else if (item.specific.constructor === Grammar.NamespaceDeclaration) {

            //else if item.specific.constructor is Grammar.NamespaceDeclaration
                //declare item.specific:Grammar.NamespaceDeclaration
                
                //produceSecond.push item.specific #recurses thru namespace.produce()
                produceSecond.push(item.specific);// #recurses thru namespace.produce()
            }
            else if (item.specific.constructor === Grammar.AppendToDeclaration) {

            //else if item.specific.constructor is Grammar.AppendToDeclaration
                //item.specific.callOnSubTree LiteCore.getSymbol('produceStaticListMethodsAndProps') //if there are internal classes
                item.specific.callOnSubTree(LiteCore.getSymbol('produceStaticListMethodsAndProps')); //if there are internal classes
                //produceThird.push item
                produceThird.push(item);
            }
            else if (item.isDeclaration()) {

            //else if item.isDeclaration()
                //produceThird.push item
                produceThird.push(item);
            };
        };// end for each in this.statements

        //end for //produce vars functions & classes sustance
        

        //for each item in produceSecond //class & namespace sustance
        for( var item__inx=0,item ; item__inx<produceSecond.length ; item__inx++){item=produceSecond[item__inx];
        
            //.out item
            this.out(item);
        };// end for each in produceSecond

        //for each item in produceThird //other declare statements
        for( var item__inx=0,item ; item__inx<produceThird.length ; item__inx++){item=produceThird[item__inx];
        
            //.out item
            this.out(item);
        };// end for each in produceThird
        
     };


//#### method produceInitializationCode(prefix)
     Grammar.Body.prototype.produceInitializationCode = function(prefix){

//Third: assign values for module vars.
//if there is var or properties with assigned values, produce those assignment.
//also produce any other executable statement (non-declarations) in the body.
//User classes must be registered previously, in case the module vars use them as initial values.

        //for each item in .statements 
        for( var item__inx=0,item ; item__inx<this.statements.length ; item__inx++){item=this.statements[item__inx];
        
            //if item.specific instanceof Grammar.VarDeclList //for modules:VarStatement, for Namespaces: PropertiesDeclaration
            if (item.specific instanceof Grammar.VarDeclList) { //for modules:VarStatement, for Namespaces: PropertiesDeclaration
                //declare item.specific:Grammar.VarDeclList
                
                //for each variableDecl in item.specific.list
                for( var variableDecl__inx=0,variableDecl ; variableDecl__inx<item.specific.list.length ; variableDecl__inx++){variableDecl=item.specific.list[variableDecl__inx];
                  if(variableDecl.assignedValue){
                    //where variableDecl.assignedValue
                        //.out '    ',prefix,'_',variableDecl.name,' = ', variableDecl.assignedValue,";",NL
                        this.out('    ', prefix, '_', variableDecl.name, ' = ', variableDecl.assignedValue, ";", NL);
                }};// end for each in item.specific.list
                
            }
            else if (item.specific instanceof Grammar.NamespaceDeclaration) {

            //else if item.specific instanceof Grammar.NamespaceDeclaration
                //declare item.specific:Grammar.NamespaceDeclaration
                
                // add call to __namespaceInit
                //.out '    ',item.specific.nameDecl.getComposedName(),'__namespaceInit();',NL
                this.out('    ', item.specific.nameDecl.getComposedName(), '__namespaceInit();', NL);
            }
            else if (item.isExecutableStatement()) {

            //else if item.isExecutableStatement()
                //item.produce //produce here
                item.produce(); //produce here
            };
        };// end for each in this.statements
        
     };


//#### method producePropertiesInitialValueAssignments(fullPrefix)
     Grammar.Body.prototype.producePropertiesInitialValueAssignments = function(fullPrefix){

//if there is var or properties with assigned values, produce those assignment

        //for each item in .statements 
        for( var item__inx=0,item ; item__inx<this.statements.length ; item__inx++){item=this.statements[item__inx];
          if(item.specific.constructor === Grammar.PropertiesDeclaration){
            //where item.specific.constructor is Grammar.PropertiesDeclaration 
                //declare item.specific:Grammar.PropertiesDeclaration
                
                //for each variableDecl in item.specific.list
                for( var variableDecl__inx=0,variableDecl ; variableDecl__inx<item.specific.list.length ; variableDecl__inx++){variableDecl=item.specific.list[variableDecl__inx];
                  if(variableDecl.assignedValue){
                    //where variableDecl.assignedValue
                        //.out makeSymbolName(variableDecl.name),'_(this)=',variableDecl.assignedValue,";",NL
                        this.out(makeSymbolName(variableDecl.name), '_(this)=', variableDecl.assignedValue, ";", NL);
                }};// end for each in item.specific.list
                
        }};// end for each in this.statements
        
     };


//-------------------------------------
//### append to class Grammar.Statement ###
    

//`Statement` objects call their specific statement node's `produce()` method
//after adding any comment lines preceding the statement

      //method produce()
      Grammar.Statement.prototype.produce = function(){

//add comment lines, in the same position as the source

        //.outSourceLinesAsComment .sourceLineNum-1
        this.outSourceLinesAsComment(this.sourceLineNum - 1);

//To enhance compiled code readability, add original Lite line as comment 

        //if .lexer.options.comments // and .lexer.outCode.lastOriginalCodeComment<.lineInx
        if (this.lexer.options.comments) { // and .lexer.outCode.lastOriginalCodeComment<.lineInx

            //var commentTo =  .lastSourceLineNum
            var commentTo = this.lastSourceLineNum;
            //if .specific has property "body"
            if ("body" in this.specific || this.specific instanceof Grammar.IfStatement || this.specific instanceof Grammar.WithStatement || this.specific instanceof Grammar.ForStatement || this.specific instanceof Grammar.CaseStatement) {
                //or .specific is instance of Grammar.IfStatement
                //or .specific is instance of Grammar.WithStatement
                //or .specific is instance of Grammar.ForStatement
                //or .specific is instance of Grammar.CaseStatement
                    //commentTo =  .sourceLineNum
                    commentTo = this.sourceLineNum;
            };

            //.outSourceLinesAsComment commentTo
            this.outSourceLinesAsComment(commentTo);

            //.lexer.outCode.lastOriginalCodeComment = commentTo
            this.lexer.outCode.lastOriginalCodeComment = commentTo;
        };

//Each statement in its own line

        //if .specific isnt instance of Grammar.SingleLineBody
        if (!(this.specific instanceof Grammar.SingleLineBody)) {
          //.lexer.outCode.ensureNewLine
          this.lexer.outCode.ensureNewLine();
        };

//if there are one or more 'into var x' in a expression in this statement, 
//declare vars before the statement (exclude body of FunctionDeclaration).
//Also declare __orXX temp vars to implement js || behavior.

        //this.callOnSubTree LiteCore.getSymbol('declareIntoVar'), excludeClass=Grammar.Body
        this.callOnSubTree(LiteCore.getSymbol('declareIntoVar'), Grammar.Body);

//call the specific statement (if,for,print,if,function,class,etc) .produce()

        //var mark = .lexer.outCode.markSourceMap(.indent)
        var mark = this.lexer.outCode.markSourceMap(this.indent);
        //.out .specific
        this.out(this.specific);

//add ";" after the statement
//then EOL comment (if it isnt a multiline statement)
//then NEWLINE

        //if not .specific.skipSemiColon
        if (!(this.specific.skipSemiColon)) {
          //.addSourceMap mark
          this.addSourceMap(mark);
          //.out ";"
          this.out(";");
          //if not .specific has property "body"
          if (!("body" in this.specific)) {
            //.out .getEOLComment()
            this.out(this.getEOLComment());
          };
        };
      };

//helper function to determine if a statement is a declaration (can be outside a funcion in "C")
//or a "statement" (must be inside a funcion in "C")

      //helper method isDeclaration returns boolean
      Grammar.Statement.prototype.isDeclaration = function(){

        //return .specific is instance of Grammar.ClassDeclaration
            //or .specific is instance of Grammar.FunctionDeclaration
            //or .specific is instance of Grammar.VarStatement
            //or .specific.constructor in [
                    //Grammar.ImportStatement
                    //Grammar.DeclareStatement
                    //Grammar.CompilerStatement
        return this.specific instanceof Grammar.ClassDeclaration || this.specific instanceof Grammar.FunctionDeclaration || this.specific instanceof Grammar.VarStatement || [Grammar.ImportStatement, Grammar.DeclareStatement, Grammar.CompilerStatement].indexOf(this.specific.constructor)>=0;
      };
                    //]

      //helper method isExecutableStatement returns boolean
      Grammar.Statement.prototype.isExecutableStatement = function(){

        //return not .isDeclaration()
        return !(this.isDeclaration());
      };

    //append to class Grammar.Oper
    

      //method declareIntoVar()
      Grammar.Oper.prototype.declareIntoVar = function(){

//called above, pre-declare vars from 'into var x' assignment-expression
//and also "__orX" vars to emulate js's || operator behavior.

//.intoVar values:
//- '*r' means use .right operaand (used for "into x")
//- anything else is the var name to declare

        //var varName = .intoVar
        var varName = this.intoVar;

        //if varName
        if (varName) {
            //if varName is '*r', varName = .right
            if (varName === '*r') {varName = this.right};
            //.out "var ",varName,"=undefined;",NL
            this.out("var ", varName, "=undefined;", NL);
        };
      };


//---------------------------------
//### append to class Grammar.ThrowStatement ###
    

      //method produce()
      Grammar.ThrowStatement.prototype.produce = function(){
          //if .specifier is 'fail'
          if (this.specifier === 'fail') {
            //.out "throw(new(Error,1,(any_arr){",.expr,"}));"
            this.out("throw(new(Error,1,(any_arr){", this.expr, "}));");
          }
          else {
          //else
            //.out "throw(",.expr,")"
            this.out("throw(", this.expr, ")");
          };
      };


//### Append to class Grammar.ReturnStatement ###
    

      //method produce()
      Grammar.ReturnStatement.prototype.produce = function(){
        //var defaultReturn = .getParent(Grammar.ConstructorDeclaration)? '' else 'undefined'
        var defaultReturn = this.getParent(Grammar.ConstructorDeclaration) ? '' : 'undefined';


//we need to unwind try-catch blocks, to calculate to which active exception frame
//we're "returning" to

        //var countTryBlocks = 0
        var countTryBlocks = 0;
        //var node:ASTBase = this.parent
        var node = this.parent;
        //do until node instance of Grammar.FunctionDeclaration
        while(!(node instanceof Grammar.FunctionDeclaration)){

            //if node.constructor is Grammar.TryCatch
            if (node.constructor === Grammar.TryCatch) {
                //a return inside a "TryCatch" block
                //countTryBlocks++ //we need to explicitly unwind
                countTryBlocks++; //we need to explicitly unwind
            };

            //node = node.parent
            node = node.parent;
        };// end loop
        //loop 

//we reached function header here.
//if the function had a ExceptionBlock, we need to unwind
//because an auto "try{" is inserted at function start

        //declare node:Grammar.FunctionDeclaration
        
        //if node.hasExceptionBlock, countTryBlocks++ 
        if (node.hasExceptionBlock) {countTryBlocks++};

        //if countTryBlocks
        if (countTryBlocks) {
            //.out "{e4c_exitTry(",countTryBlocks,");"
            this.out("{e4c_exitTry(", countTryBlocks, ");");
        };

        //.out 'return ',.expr or defaultReturn
        this.out('return ', this.expr || defaultReturn);

        //if countTryBlocks
        if (countTryBlocks) {
            //.out ";}"
            this.out(";}");
        };
      };


//### Append to class Grammar.FunctionCall ###
    

      //method produce() 
      Grammar.FunctionCall.prototype.produce = function(){

//Check if varRef "executes" 
//(a varRef executes if last accessor is "FunctionCall" or it has --/++)

//if varRef do not "executes" add "FunctionCall", 
//so varRef production adds (), 
//and C/JS executes the function call

        //if no .varRef.executes, .varRef.addAccessor new Grammar.FunctionAccess(.varRef)
        if (!this.varRef.executes) {this.varRef.addAccessor(new Grammar.FunctionAccess(this.varRef))};

        //var result = .varRef.calcReference()
        var result = this.varRef.calcReference();
        //.out result
        this.out(result);
      };


//### append to class Grammar.Operand ###
    

//`Operand:
  //|NumberLiteral|StringLiteral|RegExpLiteral
  //|ParenExpression|ArrayLiteral|ObjectLiteral|FunctionDeclaration
  //|VariableRef

//A `Operand` is the left or right part of a binary oper
//or the only Operand of a unary oper.

      //properties
        //produceType: string 
      

      //method produce()
      Grammar.Operand.prototype.produce = function(){

        //if .accessors and .name isnt instance of Grammar.NumberLiteral 
        if (this.accessors && !(this.name instanceof Grammar.NumberLiteral)) {
            //.sayErr "accessors on Literals or ParenExpressions not supported for C generation"
            this.sayErr("accessors on Literals or ParenExpressions not supported for C generation");
        };

        //var pre,post
        var pre = undefined, post = undefined;

        //if .name instance of Grammar.StringLiteral
        if (this.name instanceof Grammar.StringLiteral) {
            //declare .name:Grammar.StringLiteral
            
            // in C we only have "" to define strings, '' are for char constants
            // if the StringLiteral is defined with '', change to "" and escape all internal \"
            //var strValue:string = .name.name
            var strValue = this.name.name;
            //if strValue.charAt(0) is "'"
            if (strValue.charAt(0) === "'") {
                //strValue = .name.getValue() // w/o quotes
                strValue = this.name.getValue(); // w/o quotes
                //strValue = strValue.replaceAll("\"",'\\"') // escape internal " => \"
                strValue = strValue.replaceAll("\"", '\\"'); // escape internal " => \"
                //strValue = '"#{strValue}"' // enclose in ""
                strValue = '"' + strValue + '"'; // enclose in ""
            };

            //if strValue is '""' 
            if (strValue === '""') {
                //.out "any_EMPTY_STR"
                this.out("any_EMPTY_STR");
            }
            else if (this.produceType === 'Number' && (strValue.length === 3 || strValue.charAt(1) === '/' && strValue.length === 4)) { //a single char (maybe escaped)
            //else if .produceType is 'Number' and (strValue.length is 3 or strValue.charAt(1) is '/' and strValue.length is 4) //a single char (maybe escaped)
                //.out "'", strValue.slice(1,-1), "'" // out as C 'char' (C char = byte, a numeric value)
                this.out("'", strValue.slice(1, -1), "'"); // out as C 'char' (C char = byte, a numeric value)
            }
            else {
            //else
                //.out "any_LTR(",strValue,")"
                this.out("any_LTR(", strValue, ")");
            };
        }
        else if (this.name instanceof Grammar.NumberLiteral) {

            //out .accessors

        //else if .name instance of Grammar.NumberLiteral

            //if .produceType is 'any'
            if (this.produceType === 'any') {
                //pre="any_number("
                pre = "any_number(";
                //post=")"
                post = ")";
            };

            //.out pre,.name, post //.accessors,post
            this.out(pre, this.name, post); //.accessors,post
        }
        else if (this.name instanceof Grammar.VariableRef) {

        //else if .name instance of Grammar.VariableRef
            //declare .name:Grammar.VariableRef
            
            //.name.produceType = .produceType
            this.name.produceType = this.produceType;
            //.out .name
            this.out(this.name);
        }
        else if (this.name instanceof Grammar.ParenExpression) {

        //else if .name instance of Grammar.ParenExpression
            //declare .name:Grammar.ParenExpression
            
            //.name.expr.produceType = .produceType
            this.name.expr.produceType = this.produceType;
            //.out '(', .name.expr, ')', .accessors
            this.out('(', this.name.expr, ')', this.accessors);
        }
        else {

        //else //other
            //.out .name, .accessors
            this.out(this.name, this.accessors);
        };

        //end if
        
      };

      //#end Operand


//### append to class Grammar.UnaryOper ###
    

//`UnaryOper: ('-'|new|type of|not|no|bitwise not) `

//A Unary Oper is an operator acting on a single operand.
//Unary Oper inherits from Oper, so both are `instance of Oper`

//Examples:
//1) `not`     *boolean negation*     `if not a is b`
//2) `-`       *numeric unary minus*  `-(4+3)`
//3) `new`     *instantiation*        `x = new classNumber[2]`
//4) `type of` *type name access*     `type of x is classNumber[2]` 
//5) `no`      *'falsey' check*       `if no options then options={}` 
//6) `~`       *bit-unary-negation*   `a = ~xC0 + 5`

      //method produce() 
      Grammar.UnaryOper.prototype.produce = function(){

        //var translated = operTranslate(.name)
        var translated = operTranslate(this.name);
        //var prepend,append
        var prepend = undefined, append = undefined;

//Consider "not": 
//if it is "boolean not", add parentheses, because js has a different precedence for "boolean not"
//-(prettier generated code) do not add () for simple "falsey" variable check: "if no x"

        //if translated is "!" 
        if (translated === "!") {
            //if not (.name is "no" and .right.name instanceof Grammar.VariableRef)
            if (!((this.name === "no" && this.right.name instanceof Grammar.VariableRef))) {
                //prepend ="("
                prepend = "(";
                //append=")"
                append = ")";
            };
        };

//Special cases

        //var pre,post
        var pre = undefined, post = undefined;

        //if translated is "new" and .right.name instance of Grammar.VariableRef
        if (translated === "new" && this.right.name instanceof Grammar.VariableRef) {
            //declare .right.name:Grammar.VariableRef
            

//hacked optimization, call with object and prop names 
//instead of code a new(X,1,new(map(new(nvp... wich is slow (calls to getSymbol)
//code a call to _fastNew(X,n,prop,value,prop,value)...

            //var optimized = false;
            var optimized = false;
            //if .right.name.accessors.length > 0 and .right.name.accessors[.right.name.accessors.length-1] instanceof Grammar.FunctionAccess
            if (this.right.name.accessors.length > 0 && this.right.name.accessors[this.right.name.accessors.length - 1] instanceof Grammar.FunctionAccess) {
                //var ac:Grammar.FunctionAccess = .right.name.accessors[.right.name.accessors.length-1]
                var ac = this.right.name.accessors[this.right.name.accessors.length - 1];
                //if ac.args and ac.args.length is 1 and ac.args[0].expression.operandCount is 1
                if (ac.args && ac.args.length === 1 && ac.args[0].expression.operandCount === 1) {

                    //var objLit:Grammar.ObjectLiteral = ac.args[0].expression.root.name
                    var objLit = ac.args[0].expression.root.name;
                    //if objLit instanceof Grammar.ObjectLiteral
                    if (objLit instanceof Grammar.ObjectLiteral) {

                        //OK here we can optimize

                        //.out "_fastNew(", .right.name.calcPropAccessOnly(),","
                        this.out("_fastNew(", this.right.name.calcPropAccessOnly(), ",");
                        //.out objLit.items.length,NL
                        this.out(objLit.items.length, NL);

                        //for each nameValuePair in objLit.items
                        for( var nameValuePair__inx=0,nameValuePair ; nameValuePair__inx<objLit.items.length ; nameValuePair__inx++){nameValuePair=objLit.items[nameValuePair__inx];
                        
                            //.out ",",nameValuePair.name,"_,",nameValuePair.value,NL
                            this.out(",", nameValuePair.name, "_,", nameValuePair.value, NL);
                        };// end for each in objLit.items

                        //.out ")",NL
                        this.out(")", NL);
                        //optimized   = true
                        optimized = true;
                    };
                };
            };
            //end if
            

            //if not optimized
            if (!(optimized)) {
                    //.out "new(", .right.name.calcReference(callNew=true)
                    this.out("new(", this.right.name.calcReference(true));
            };

            //return
            return;
        };

        //if translated is "typeof" 
        if (translated === "typeof") {
            //pre="_typeof("
            pre = "_typeof(";
            //translated=""
            translated = "";
            //post=")"
            post = ")";
        }
        else {

        //else
            //if .produceType is 'any'
            if (this.produceType === 'any') {
                //if translated is "!"         
                if (translated === "!") {
                    //pre = 'any_bool('
                    pre = 'any_bool(';
                    //post = ")"
                    post = ")";
                }
                else {
                //else
                    //pre="any_number("
                    pre = "any_number(";
                    //post=")"
                    post = ")";
                };
            };

            //.right.produceType = translated is "!"? 'Bool' else 'Number' //Except "!", unary opers require numbers
            this.right.produceType = translated === "!" ? 'Bool' : 'Number'; //Except "!", unary opers require numbers
        };

        //end if
        

//add a space if the unary operator is a word. Example `typeof`
//            if /\w/.test(translated), translated+=" "

        //.out pre, translated, prepend, .right, append, post
        this.out(pre, translated, prepend, this.right, append, post);
      };


//### append to class Grammar.Oper ###
    

      //properties
          //produceType: string
      

      //method produce()
      Grammar.Oper.prototype.produce = function(){

        //var oper = .name
        var oper = this.name;

//Discourage string concat using '+':

//+, the infamous js string concat. You should not use + to concat strings. use string interpolation instead.
//e.g.: DO NOT: `stra+": "+strb`   DO: `"#{stra}: #{strb}"`

        //if oper is '+'
        if (oper === '+') {
            //var lresultNameDecl = .left.getResultType() 
            var lresultNameDecl = this.left.getResultType();
            //var rresultNameDecl = .right.getResultType() 
            var rresultNameDecl = this.right.getResultType();
            //if (lresultNameDecl and lresultNameDecl.hasProto('String'))
            if ((lresultNameDecl && lresultNameDecl.hasProto('String')) || (rresultNameDecl && rresultNameDecl.hasProto('String'))) {
                //or (rresultNameDecl and rresultNameDecl.hasProto('String'))
                    //.sayErr """
                    this.sayErr("You should not use + to concat strings. use string interpolation instead.\ne.g.: DO: \"#\{stra}: #\{strb}\"  vs.  DO NOT: stra + \": \" + strb");
            };
        };
                            //You should not use + to concat strings. use string interpolation instead.
                            //e.g.: DO: "#\{stra}: #\{strb}"  vs.  DO NOT: stra + ": " + strb
                            //"""

        //var toAnyPre, toAnyPost
        var toAnyPre = undefined, toAnyPost = undefined;
        //if .produceType is 'any' 
        if (this.produceType === 'any') {
            //toAnyPre = 'any_number('
            toAnyPre = 'any_number(';
            //toAnyPost = ")"
            toAnyPost = ")";
        };

//default mechanism to handle 'negated' operand

        //var prepend,append
        var prepend = undefined, append = undefined;
        //if .negated # NEGATED
        if (this.negated) {// # NEGATED

//else -if NEGATED- we add `!( )` to the expression

            //prepend ="!("
            prepend = "!(";
            //append=")"
            append = ")";
        };

//Check for special cases: 

//1) 'in' operator, requires swapping left and right operands and to use `.indexOf(...)>=0`
//example: `x in [1,2,3]` -> `indexOf(x,_literalArray(1,2,3))>=0`
//example: `x not in [1,2,3]` -> `indexOf(x,_literalArray(1,2,3))==-1`
//example: `char not in myString` -> `indexOf(char,myString)==-1`

        //case .name 
        
          //when 'in':
        if (
           (this.name=='in')
       ){
            //if .right.name instanceof Grammar.ArrayLiteral
            if (this.right.name instanceof Grammar.ArrayLiteral) {
                //var haystack:Grammar.ArrayLiteral = .right.name
                var haystack = this.right.name;
                //.out toAnyPre,prepend,"__inLiteralArray(",.left,",",haystack.items.length,",(any_arr){",{CSL:haystack.items},"})",append,toAnyPost
                this.out(toAnyPre, prepend, "__inLiteralArray(", this.left, ",", haystack.items.length, ",(any_arr){", {CSL: haystack.items}, "})", append, toAnyPost);
            }
            else {
            //else
                //.out toAnyPre,"__byteIndex(",.left,",",.right,")", .negated? "==-1" : ">=0",toAnyPost
                this.out(toAnyPre, "__byteIndex(", this.left, ",", this.right, ")", this.negated ? "==-1" : ">=0", toAnyPost);
            };
        
        }
          //when 'has property':
        else if (
           (this.name=='has property')
       ){
            //.out toAnyPre,prepend,"_hasProperty(",.left,",",.right,")",append,toAnyPost
            this.out(toAnyPre, prepend, "_hasProperty(", this.left, ",", this.right, ")", append, toAnyPost);
        
        }
          //when 'into':
        else if (
           (this.name=='into')
       ){
            //if .produceType and .produceType isnt 'any', .out '_anyTo',.produceType,'('
            if (this.produceType && this.produceType !== 'any') {this.out('_anyTo', this.produceType, '(')};
            //.left.produceType='any'
            this.left.produceType = 'any';
            //.out "(",.right,"=",.left,")"
            this.out("(", this.right, "=", this.left, ")");
            //if .produceType and .produceType isnt 'any', .out ')'
            if (this.produceType && this.produceType !== 'any') {this.out(')')};
        
        }
          //when 'instance of':
        else if (
           (this.name=='instance of')
       ){
            //.left.produceType = 'any'
            this.left.produceType = 'any';
            //.right.produceType = 'any'
            this.right.produceType = 'any';
            //.out toAnyPre,prepend,'_instanceof(',.left,',',.right,')',append,toAnyPost
            this.out(toAnyPre, prepend, '_instanceof(', this.left, ',', this.right, ')', append, toAnyPost);
        
        }
          //when 'like':
        else if (
           (this.name=='like')
       ){
            //.throwError "like not supported yet for C-production"
            this.throwError("like not supported yet for C-production");
        
        }
          //when 'is':
        else if (
           (this.name=='is')
       ){
            //.left.produceType = 'any'
            this.left.produceType = 'any';
            //.right.produceType = 'any'
            this.right.produceType = 'any';
            //.out toAnyPre,.negated?'!':'', '__is(',.left,',',.right,')',toAnyPost
            this.out(toAnyPre, this.negated ? '!' : '', '__is(', this.left, ',', this.right, ')', toAnyPost);
        
        }
          //when 'or':
        else if (
           (this.name=='or')
       ){
            //.lexer.outCode.orTempVarCount++
            this.lexer.outCode.orTempVarCount++;

            //.left.produceType = 'any'
            this.left.produceType = 'any';
            //.right.produceType = 'any'
            this.right.produceType = 'any';
            //if .produceType and .produceType isnt 'any', .out '_anyTo',.produceType,'('
            if (this.produceType && this.produceType !== 'any') {this.out('_anyTo', this.produceType, '(')};

            //.out '(_anyToBool(', .intoVar,'=',.left,')? ',.intoVar,' : ',.right,')'
            this.out('(_anyToBool(', this.intoVar, '=', this.left, ')? ', this.intoVar, ' : ', this.right, ')');

            //if .produceType and .produceType isnt 'any', .out ')'
            if (this.produceType && this.produceType !== 'any') {this.out(')')};
        
        }
          //when '%',"<<",">>","bitand","bitor","bitxor":
        else if (
           (this.name=='%')
           ||(this.name=="<<")
           ||(this.name==">>")
           ||(this.name=="bitand")
           ||(this.name=="bitor")
           ||(this.name=="bitxor")
       ){
            //if .produceType and .produceType isnt 'Number', .out 'any_number('
            if (this.produceType && this.produceType !== 'Number') {this.out('any_number(')};
            //.left.produceType = 'Number'
            this.left.produceType = 'Number';
            //.right.produceType = 'Number'
            this.right.produceType = 'Number';
            //.out '(int64_t)',.left,' ',operTranslate(oper),' (int64_t)',.right
            this.out('(int64_t)', this.left, ' ', operTranslate(oper), ' (int64_t)', this.right);
            //if .produceType and .produceType isnt 'Number', .out ')'
            if (this.produceType && this.produceType !== 'Number') {this.out(')')};
        
        }
          //when '&':
        else if (
           (this.name=='&')
       ){
            //if .produceType is 'Number', .throwError 'cannot use & to concat and produce a number'
            if (this.produceType === 'Number') {this.throwError('cannot use & to concat and produce a number')};
            //.left.produceType = 'any'
            this.left.produceType = 'any';
            //.right.produceType = 'any'
            this.right.produceType = 'any';
            //.out "_concatAny(2,",.left,',',.right,')'
            this.out("_concatAny(2,", this.left, ',', this.right, ')');
        
        }
        else {

//else we have a direct translatable operator. 
//We out: left,operator,right

          //else

            //var operC = operTranslate(oper) 
            var operC = operTranslate(oper);
            //case operC
            
                //when '?': // left is condition, right is: if_true
            if (
               (operC=='?')
           ){
                    //.left.produceType = 'Bool'
                    this.left.produceType = 'Bool';
                    //.right.produceType = .produceType
                    this.right.produceType = this.produceType;
            
            }
                //when ':': // left is a?b, right is: if_false
            else if (
               (operC==':')
           ){
                    //.left.produceType = .produceType
                    this.left.produceType = this.produceType;
                    //.right.produceType = .produceType
                    this.right.produceType = this.produceType;
            
            }
                //when '&&': // boolean and
            else if (
               (operC=='&&')
           ){
                    //.left.produceType = 'Bool'
                    this.left.produceType = 'Bool';
                    //.right.produceType = 'Bool'
                    this.right.produceType = 'Bool';
            
            }
            else {

                //else // a+b  a>=b  a<b 
                     //default for two-operand operators: numbers
                    //.left.produceType = 'Number'
                    this.left.produceType = 'Number';
                    //.right.produceType = 'Number'
                    this.right.produceType = 'Number';
            };

            //var extra, preExtra
            var extra = undefined, preExtra = undefined;

            //if operC isnt '?' // cant put xx( a ? b )
            if (operC !== '?') { // cant put xx( a ? b )
                //if .produceType is 'any' 
                if (this.produceType === 'any') {
                    //if .left.produceType is 'any' and .right.produceType is 'any'
                    if (this.left.produceType === 'any' && this.right.produceType === 'any') {
                        //do nothing
                        null;
                    }
                    else {
                    //else
                        //case operC
                        
                            //when '>','<','>=','<=','!=','==':
                        if (
                           (operC=='>')
                           ||(operC=='<')
                           ||(operC=='>=')
                           ||(operC=='<=')
                           ||(operC=='!=')
                           ||(operC=='==')
                       ){
                                // comparision operators, result is converted to boolean
                                //preExtra = 'any_bool('
                                preExtra = 'any_bool(';
                                //extra = ")"
                                extra = ")";
                        
                        }
                        else {
                            //else
                                //preExtra = 'any_number('
                                preExtra = 'any_number(';
                                //extra = ")"
                                extra = ")";
                        };
                    };
                }
                else if (this.produceType) {

                //else if .produceType 
                    //if ( .left.produceType is .produceType and .right.produceType is .produceType )
                    if ((this.left.produceType === this.produceType && this.right.produceType === this.produceType) || (this.produceType === 'Bool' && this.left.produceType === 'Number' && this.right.produceType === 'Number')) {
                        //or ( .produceType is 'Bool' and .left.produceType is 'Number' and .right.produceType is 'Number' ) // numbers are valid bools
                        //do nothing
                        null;
                    }
                    else {
                    //else
                      //preExtra = '_anyTo#{.produceType}('
                      preExtra = '_anyTo' + this.produceType + '(';
                      //extra = ")"
                      extra = ")";
                    };
                };
            };

            //.out preExtra, prepend, .left,' ', operC, ' ',.right, append, extra
            this.out(preExtra, prepend, this.left, ' ', operC, ' ', this.right, append, extra);
        };

        //end case oper
        
      };


//### append to class Grammar.Expression ###
    

      //properties
          //produceType: string
      

      //method produce(negated) 
      Grammar.Expression.prototype.produce = function(negated){

//Produce the expression body, optionally negated

        //default .produceType='any'
        if(this.produceType===undefined) this.produceType='any';

        //var prepend=""
        var prepend = "";
        //var append=""
        var append = "";
        //if negated
        if (negated) {

//(prettier generated code) Try to avoid unnecessary parens after '!' 
//for example: if the expression is a single variable, as in the 'falsey' check: 
//Example: `if no options.logger then... ` --> `if (!options.logger) {...` 
//we don't want: `if (!(options.logger)) {...` 

          //if .operandCount is 1 
          if (this.operandCount === 1) {
              //#no parens needed
              //prepend = "!"
              prepend = "!";
          }
          else {
          //else
              //prepend = "!("
              prepend = "!(";
              //append = ")"
              append = ")";
          };
        };
          //#end if
        //#end if negated

//produce the expression body

        //declare valid .root.produceType
        
        //.root.produceType = .produceType
        this.root.produceType = this.produceType;
        //.out prepend, .root, append
        this.out(prepend, this.root, append);
      };
        //.out preExtra, prepend, .root, append, extra


//### append to class Grammar.FunctionArgument ###
    

        //method produce
        Grammar.FunctionArgument.prototype.produce = function(){
            //.out .expression
            this.out(this.expression);
        };


//### helper function makeSymbolName(symbol)
    function makeSymbolName(symbol){
        // hack: make "symbols" avoid interference with C's reserved words
        // and also common variable names
        //return "#{symbol}_"
        return '' + symbol + "_";
    };

//### append to class Grammar.VariableRef ###
    

//`VariableRef: ['--'|'++'] IDENTIFIER [Accessors] ['--'|'++']`

//`VariableRef` is a Variable Reference. 

 //a VariableRef can include chained 'Accessors', which can:
 //*access a property of the object : `.`-> PropertyAccess `[`->IndexAccess
 //*assume the variable is a function and perform a function call :  `(`-> FunctionAccess

      //properties
          //produceType: string 
          //calcType: string // 'any','Number','Bool','**native number**'
      

      //method produce() 
      Grammar.VariableRef.prototype.produce = function(){

//Prefix ++/--, varName, Accessors and postfix ++/--

        //if .name is 'arguments'
        if (this.name === 'arguments') {
            //.out '_newArray(argc,arguments)'
            this.out('_newArray(argc,arguments)');
            //return
            return;
        };

        //var result = .calcReference()
        var result = this.calcReference();
        //var pre,post
        var pre = undefined, post = undefined;

//if what is required is what is referenced, do nothing

        //if .produceType is .calcType 
        if (this.produceType === this.calcType) {
            //do nothing 
            null;
        };

//else, if we require 'any' but the variable ref is referencing something else...

        //if .produceType is 'any' and not .calcType is 'any'
        if (this.produceType === 'any' && !(this.calcType === 'any')) {
            //if .calcType is 'functionPtr'
            if (this.calcType === 'functionPtr') {
                //pre = 'any_func('
                pre = 'any_func(';
            }
            else {
            //else
                //assume returnes is number|native number
                //pre = 'any_number('
                pre = 'any_number(';
            };
            //end if
            
            //post = ')'
            post = ')';
        }
        else if (this.produceType && this.produceType !== 'any' && this.calcType === 'any') {

//else, if we require other than 'any' and the varRef returns 'any'...

        //else if .produceType and .produceType isnt 'any' and .calcType is 'any'
            //pre = '_anyTo#{.produceType}('
            pre = '_anyTo' + this.produceType + '(';
            //post = ')'
            post = ')';
        };

        //.out pre, result, post
        this.out(pre, result, post);
      };

//##### helper method calcReference(callNew) returns array of array
      Grammar.VariableRef.prototype.calcReference = function(callNew){

        //var result = .calcReferenceArr(callNew)
        var result = this.calcReferenceArr(callNew);

//PreIncDec and postIncDec: ++/--

        //var hasIncDec = .preIncDec or .postIncDec
        var hasIncDec = this.preIncDec || this.postIncDec;

        //if hasIncDec 
        if (hasIncDec) {

            //if no .calcType
            if (!this.calcType) {
                //.throwError "pre or post inc/dec (++/--) can only be used on simple variables"
                this.throwError("pre or post inc/dec (++/--) can only be used on simple variables");
            };

            //if .calcType is 'any'
            if (this.calcType === 'any') {
                //result.push ['.value.number']
                result.push(['.value.number']);
                //.calcType = 'Number'
                this.calcType = 'Number';
            }
            else {

            //else //assume number
                //do nothing
                null;
            };
        };

        //if .postIncDec
        if (this.postIncDec) {
            //result.push [.postIncDec]
            result.push([this.postIncDec]);
        };

        //if .preIncDec
        if (this.preIncDec) {
            //result.unshift [.preIncDec]
            result.unshift([this.preIncDec]);
        };

        //return result
        return result;
      };

//##### helper method calcReferenceArr(callNew) returns array of array
      Grammar.VariableRef.prototype.calcReferenceArr = function(callNew){

//Start with main variable name, to check property names

        //var actualVar = .tryGetFromScope(.name)
        var actualVar = this.tryGetFromScope(this.name);
        //if no actualVar, .throwError("var '#{.name}' not found in scope")
        if (!actualVar) {this.throwError("var '" + this.name + "' not found in scope")};

        //var actualType = actualVar //determines valid memebers at actual point in accesor chain analysis
        var actualType = actualVar; //determines valid memebers at actual point in accesor chain analysis

//*actualVar* determines the specific var at actual point in the chain analysis.
//actualVar can be calculated on each [PropertyAccess] accessor, but cannot
//pass a [FunctionAccess] (we dont know which instance the fn will return)
//or a [IndexAccess] (we dont evaluate the index value, neither know what is stored)


//*actualType* determines the specific *type* at actual point in the chain analysis.
//actualType follows actualVar (is the same) during [PropertyAccess], but, unlike actualVar
//is able to pass a [FunctionAccess] and [IndexAccess] if typified.

//if the function referenced in the [FunctionAccess] has a *result type* (at function declaration),
//actualType continues with that type.

//if the array referenced at [IndexAccess] has a *item type* (at array declaration),
//actualType continues with that **item type**


        //var result: array = [] //array of arrays
        var result = []; //array of arrays

        //var partial = actualVar.getComposedName()
        var partial = actualVar.getComposedName();
        //result.push [partial]
        result.push([partial]);

        //.calcType = 'any' //default
        this.calcType = 'any'; //default
        //if actualVar.findOwnMember("**proto**") is '**native number**' 
        if (actualVar.findOwnMember("**proto**") === '**native number**') {
            //e.g.:loop index var, is: int64_t
            //.calcType = '**native number**'
            this.calcType = '**native number**';
        };

        //if no .accessors, return result
        if (!this.accessors) {return result};

//now follow each accessor

        //var hasInstanceReference:boolean
        var hasInstanceReference = undefined;
        //var isOk, functionAccess, args:array
        var 
           isOk = undefined
           , functionAccess = undefined
           , args = undefined
       ;

        //for each inx,ac in .accessors
        for( var inx=0,ac ; inx<this.accessors.length ; inx++){ac=this.accessors[inx];
        
            //declare valid ac.name
            

            //if no actualVar
            //    .throwError("processing '#{partial}', cant follow property chain types")

//##### PropertyAccess: ***.***

//for PropertyAccess: `foo.bar`

            //if ac instanceof Grammar.PropertyAccess
            if (ac instanceof Grammar.PropertyAccess) {

                //partial ="#{partial}.#{ac.name}"
                partial = '' + partial + "." + ac.name;

                //var classNameArr:array
                var classNameArr = undefined;

//**.constructor**: hack, all vars have a "constructor" property.

//`foo.constructor` resolves to the class-function of which foo is instance of.

//compile-to-c: convert "bar.constructor" into: "any_class(bar.class)"

                //if ac.name is 'constructor' 
                if (ac.name === 'constructor') {

                    //result.unshift ['any_class(']
                    result.unshift(['any_class(']);
                    // here goes anyClass var
                    //result.push [".class)"]
                    result.push([".class)"]);

                    //.calcType = 'any'
                    this.calcType = 'any';
                    //hasInstanceReference=true
                    hasInstanceReference = true;

                    //if actualVar
                    if (actualVar) {
                        //actualVar = actualVar.findOwnMember('**proto**')
                        actualVar = actualVar.findOwnMember('**proto**');
                    };
                        //now we're referencig the Class

                    //actualType = actualVar //actualtype follows actualVar on [PropertyAccess]
                    actualType = actualVar; //actualtype follows actualVar on [PropertyAccess]
                }
                else if (ac.name === 'prototype') {


//**.prototype**: hack, all classes have a "prototype" property to access methods.

//compile-to-c: convert "Foo.prototype.slice" into: "__classMethodAny(slice_,Foo)" :returns any

                //else if ac.name is 'prototype'

                    //if inx+1 >= .accessors.length or .accessors[inx+1].constructor isnt Grammar.PropertyAccess
                    if (inx + 1 >= this.accessors.length || this.accessors[inx + 1].constructor !== Grammar.PropertyAccess) {
                        //.sayErr "expected: Class.prototype.method, e.g.: 'Foo.prototype.toString'"
                        this.sayErr("expected: Class.prototype.method, e.g.: 'Foo.prototype.toString'");
                        //return result
                        return result;
                    };

                    //classNameArr = result.pop()
                    classNameArr = result.pop();
                    //classNameArr.unshift '__classMethodFunc(',.accessors[inx+1].name,"_ ," //__classMethodFunc(methodName,
                    classNameArr.unshift('__classMethodFunc(', this.accessors[inx + 1].name, "_ ,"); //__classMethodFunc(methodName,
                    // here goes any class
                    //classNameArr.push ")"
                    classNameArr.push(")");
                    //result.push classNameArr //now converted to any Function
                    result.push(classNameArr); //now converted to any Function
                    //inx+=1 //skip method name
                    inx += 1; //skip method name

                    //.calcType = 'any' // __classMethodFunc() returns any_func
                    this.calcType = 'any'; // __classMethodFunc() returns any_func
                    //hasInstanceReference = true
                    hasInstanceReference = true;

                    //if actualVar 
                    if (actualVar) {
                        //actualVar = actualVar.findMember(.accessors[inx+1].name) 
                        actualVar = actualVar.findMember(this.accessors[inx + 1].name);
                    };
                        //move to method

                    //actualType = actualVar //actualtype follows actualVar on [PropertyAccess]
                    actualType = actualVar; //actualtype follows actualVar on [PropertyAccess]
                }
                else if (ac.name === 'length') {

 //hack, convert x.length in a funcion call, _length(x)

                //else if ac.name is 'length'
                    //result.unshift ['_length','('] // put "_length(" first
                    result.unshift(['_length', '(']); // put "_length(" first
                    //result.push [")"]
                    result.push([")"]);

                    //.calcType = '**native number**'
                    this.calcType = '**native number**';
                    //actualVar = undefined
                    actualVar = undefined;
                    //actualType = undefined 
                    actualType = undefined;
                }
                else if (ac.name === 'call') {


//hack: *.call(...)*

//convert .call(...) to  __apply(Function,instance,argc,arguments)

                //else if ac.name is 'call' 

                    //should be here after Class.prototype.xxx.call
                    // or foo.call(...) when foo:Function
                    //if no actualType or no actualType.findMember('call')
                    if (!actualType || !actualType.findMember('call')) {
                        //.sayErr "#{partial}: #{actualType? actualType.info(): '-no actual Type-'}"
                        this.sayErr('' + partial + ": " + (actualType ? actualType.info() : '-no actual Type-'));
                        //.throwError 'cannot use .call on a non-Function. Use: Class.prototype.method.call(this,arg1,...)'
                        this.throwError('cannot use .call on a non-Function. Use: Class.prototype.method.call(this,arg1,...)');
                    };

                    //let's make sure next accessor is FunctionAccess with at least one arg
                    //isOk=false
                    isOk = false;

                    //if inx+1<.accessors.length 
                    if (inx + 1 < this.accessors.length) {
                        //if .accessors[inx+1].constructor is Grammar.FunctionAccess
                        if (this.accessors[inx + 1].constructor === Grammar.FunctionAccess) {
                            //functionAccess=.accessors[inx+1]
                            functionAccess = this.accessors[inx + 1];
                            //if functionAccess.args and functionAccess.args.length >= 1
                            if (functionAccess.args && functionAccess.args.length >= 1) {
                                //isOk=true
                                isOk = true;
                            };
                        };
                    };

                    //if not isOk, .throwError 'expected instance and optional arguments after ".call": foo.call(this,arg1,arg2)'
                    if (!(isOk)) {this.throwError('expected instance and optional arguments after ".call": foo.call(this,arg1,arg2)')};

                    //args = functionAccess.args
                    args = functionAccess.args;

                    //result.unshift ['__apply(']
                    result.unshift(['__apply(']);
                    //here goes Function ref
                    //var FnArr = [",",args[0],","] // instance
                    var FnArr = [",", args[0], ","]; // instance
                    //.addArguments args.slice(1), FnArr //other arguments
                    this.addArguments(args.slice(1), FnArr); //other arguments
                    //FnArr.push ')'
                    FnArr.push(')');

                    //result.push FnArr
                    result.push(FnArr);

                    //new actual type is method's return type
                    //if actualVar
                    if (actualVar) {
                        //actualType = actualVar.findMember("**return type**")
                        actualType = actualVar.findMember("**return type**");
                    }
                    else {
                    //else
                        //actualType = undefined //any
                        actualType = undefined; //any
                    };

                    //inx+=1 //skip fn.call and args
                    inx += 1; //skip fn.call and args
                    //actualVar = undefined //we dont know what instance the pointed function returns
                    actualVar = undefined; //we dont know what instance the pointed function returns
                    //.calcType = 'any' // all funcs returns any
                    this.calcType = 'any'; // all funcs returns any
                }
                else if (ac.name === 'apply') {

//hack: *.apply(x,arr[])*

//convert .apply(x,arr[]) to:  __apply(Function,x,arr.length,arr.itemd)

                //else if ac.name is 'apply' 

                    //should be here after Class.prototype.xxx.call
                    // or foo.call(...) when foo:Function
                    //if no actualType or no actualType.findMember('apply')
                    if (!actualType || !actualType.findMember('apply')) {
                        //.throwError 'cannot use .apply on a non-Function. Use: Class.prototype.method.apply(this,args:Array)'
                        this.throwError('cannot use .apply on a non-Function. Use: Class.prototype.method.apply(this,args:Array)');
                    };

                    //let's make sure next accessor is FunctionAccess with at least one arg
                    //isOk=false
                    isOk = false;
                    //if inx+1<.accessors.length 
                    if (inx + 1 < this.accessors.length) {
                        //if .accessors[inx+1].constructor is Grammar.FunctionAccess
                        if (this.accessors[inx + 1].constructor === Grammar.FunctionAccess) {
                            //functionAccess=.accessors[inx+1]
                            functionAccess = this.accessors[inx + 1];
                            //if functionAccess.args and functionAccess.args.length >= 2
                            if (functionAccess.args && functionAccess.args.length >= 2) {
                                //isOk=true
                                isOk = true;
                            };
                        };
                    };

                    //if no isOk, .throwError 'expected two arguments after ".apply". e.g.: foo.apply(this,argArray)'
                    if (!isOk) {this.throwError('expected two arguments after ".apply". e.g.: foo.apply(this,argArray)')};

                    //args = functionAccess.args
                    args = functionAccess.args;

                    //result.unshift ['__applyArr(', hasInstanceReference? '': 'any_func(']
                    result.unshift(['__applyArr(', hasInstanceReference ? '' : 'any_func(']);
                    //here goes Function ref
                    //result.push [hasInstanceReference? '': ')',',',args[0],',',args[1],')']
                    result.push([hasInstanceReference ? '' : ')', ',', args[0], ',', args[1], ')']);

                    //new actual type is method's return type
                    //if actualVar
                    if (actualVar) {
                        //actualType = actualVar.findMember("**return type**")
                        actualType = actualVar.findMember("**return type**");
                    }
                    else {
                    //else
                        //actualType = undefined //any
                        actualType = undefined; //any
                    };

                    //inx+=1 //skip fn.call and args
                    inx += 1; //skip fn.call and args
                    //actualVar = undefined //we dont know what does the pointed function returns
                    actualVar = undefined; //we dont know what does the pointed function returns
                    //.calcType = 'any' // all funcs returns any
                    this.calcType = 'any'; // all funcs returns any
                }
                else if (actualVar && (actualVar.nodeClass === Grammar.NamespaceDeclaration || (actualVar.nodeClass === Grammar.ClassDeclaration && ac.name !== 'name'))) { //is namespace


//access to a namespace property or function. Implies *no* redirection. 
//when compiled-to-c, namespaces are just lexical name concatenations (better performance)

                //else if actualVar and ( actualVar.nodeClass is Grammar.NamespaceDeclaration //is namespace
                                        //or (actualVar.nodeClass is Grammar.ClassDeclaration and ac.name isnt 'name' ) // or a class prop other than .name
                                      //)

                    //just namespace access or accessing a "property" of a class "as namespace"
                    //var prevArr:array = result.pop() 
                    var prevArr = result.pop();
                    //prevArr.push "_",ac.name
                    prevArr.push("_", ac.name);
                    //result.push prevArr
                    result.push(prevArr);

//if we're accessing a namespace function, it could be:

//a) a raw C function (it is *not*: `(any){.class=Function_inx}` var)

//b) a class, then *it is*: `(any){.class=Class_inx}`

//on case a), we mark ".calcType" as 'functionPtr', so it can be enlosed by "any_func()" 
//in case type "any" is required from this varRef

                    //actualType = undefined
                    actualType = undefined;

                    //if actualVar.findMember(ac.name) into actualVar
                    if ((actualVar=actualVar.findMember(ac.name))) {
                        //got the accessed member
                        //if actualVar.nodeDeclared instanceof Grammar.FunctionDeclaration 
                        if (actualVar.nodeDeclared instanceof Grammar.FunctionDeclaration) {
                            //if it is a function...
                            //.calcType = 'functionPtr' //it's a raw c-function
                            this.calcType = 'functionPtr'; //it's a raw c-function
                            //actualType = undefined //it's a raw c-function
                            actualType = undefined; //it's a raw c-function
                            //actualVar = undefined //it's a raw c-function
                            actualVar = undefined; //it's a raw c-function
                        }
                        else {
                        //else
                            // a namespace property
                            //.calcType = 'any'
                            this.calcType = 'any';
                            //actualType = actualVar //actualType follows actualVar on [PropertyAccess]
                            actualType = actualVar; //actualType follows actualVar on [PropertyAccess]
                        };
                    };
                }
                else if (inx + 1 < this.accessors.length && this.accessors[inx + 1].constructor === Grammar.FunctionAccess) {

//avoid evaluating as a property if the next accessor is a function call

                //else if inx+1 < .accessors.length and .accessors[inx+1].constructor is Grammar.FunctionAccess

                    // if next is function access, this is a method name. just make ac.name a symbol
                    //result.push [makeSymbolName(ac.name)]
                    result.push([makeSymbolName(ac.name)]);
                    //.calcType = 'any'
                    this.calcType = 'any';
                    //hasInstanceReference=true
                    hasInstanceReference = true;

                    //if actualVar 
                    if (actualVar) {
                        //actualVar = actualVar.findMember(ac.name)
                        actualVar = actualVar.findMember(ac.name);
                    };

                    //actualType = actualVar //actualType follows actualVar on [PropertyAccess]
                    actualType = actualVar; //actualType follows actualVar on [PropertyAccess]
                }
                else {


//else, normal property access. out: `propName__(instance)`. 

//macro "foo__(this)" will evaluate to direct|fast access #ifdef NDEBUG, 
//and a controlled|checked access otherwise 

                //else

                    //.calcType = 'any'
                    this.calcType = 'any';
                    //hasInstanceReference=true
                    hasInstanceReference = true;
                    //result.unshift [makeSymbolName(ac.name),"_("] // foo__(this) macro enclose all 
                    result.unshift([makeSymbolName(ac.name), "_("]); // foo__(this) macro enclose all
                    // here goes thisValue (instance)
                    //result.push [")"]
                    result.push([")"]);

                    //if actualVar 
                    if (actualVar) {
                        //actualVar = actualVar.findMember(ac.name)
                        actualVar = actualVar.findMember(ac.name);
                    };

                    //actualType = actualVar //actualType follows actualVar on [PropertyAccess]
                    actualType = actualVar; //actualType follows actualVar on [PropertyAccess]
                };

                //end if // subtypes of propertyAccess
                
            }
            else if (ac.constructor === Grammar.FunctionAccess) {


//##### FunctionAccess: (...)

//else, for FunctionAccess

            //else if ac.constructor is Grammar.FunctionAccess

                //partial ="#{partial}(...)"
                partial = '' + partial + "(...)";
                //.calcType = 'any'
                this.calcType = 'any';

                //functionAccess = ac
                functionAccess = ac;

                //var callParams:array
                var callParams = undefined;

//if there was a "new" unary-op: "new Foo(bar)" 
//the `new Foo(bar,baz)` call translates to `new(Foo,1,[bar,baz])`

                //if callNew
                if (callNew) {

                    //callParams = [","] // new(Class,argc,arguments*)
                    callParams = [","]; // new(Class,argc,arguments*)
                    //add arguments: count,(any_arr){...}
                    //.addArguments functionAccess.args, callParams
                    this.addArguments(functionAccess.args, callParams);
                    //callParams.push ")" //close 
                    callParams.push(")"); //close

                    // new(Foo..) result type is a Foo.prototype object
                    //if actualVar 
                    if (actualVar) {
                        //actualType = actualVar.findOwnMember('prototype')
                        actualType = actualVar.findOwnMember('prototype');
                    }
                    else {
                    //else
                        //actualType = undefined
                        actualType = undefined;
                    };

                    //actualVar = undefined //a new instance
                    actualVar = undefined; //a new instance
                }
                else {

//else, a method call

                //else

//Mandatory use of apply/call, 
//if we're calling on the result of an IndexAccess 
//or the result of a function 
//or a var type:function.

                    //var callOnValue
                    var callOnValue = undefined;
                    //if inx>0 and .accessors[inx-1].constructor isnt Grammar.PropertyAccess
                    if (inx > 0 && this.accessors[inx - 1].constructor !== Grammar.PropertyAccess) {
                        //callOnValue = true 
                        callOnValue = true;
                    }
                    else if (actualVar && [Grammar.FunctionDeclaration, Grammar.MethodDeclaration].indexOf(actualVar.nodeClass)===-1) {
                        // calling on: "foo[x](...)"
                        // calling on: "foo(a,b,c)(...)"

                    //else if actualVar and actualVar.nodeClass not in [Grammar.FunctionDeclaration,Grammar.MethodDeclaration]
                        // calling on: "foo.prop(a,b,c)" when "prop" is  property
                        // calling on: "avar(a,b,c)" when "avar" is a scope var
                        //callOnValue = true
                        callOnValue = true;
                    };

                    //if callOnValue
                    if (callOnValue) {
                        //.throwError("'#{partial}: .call() or '.apply()' must be used to call a function from a 'value'")
                        this.throwError("'" + partial + ": .call() or '.apply()' must be used to call a function from a 'value'");
                    };

                    //var fnNameArray:array = result.pop() //take fn name 
                    var fnNameArray = result.pop(); //take fn name

                    //if no hasInstanceReference //first accessor is function access, this is a call to a global function
                    if (!hasInstanceReference) { //first accessor is function access, this is a call to a global function

                        //fnNameArray.push "(" //add "(" 
                        fnNameArray.push("("); //add "("
                        //if fnNameArray[0] is 'Number', fnNameArray[0]='_toNumber'; //convert "Number" (class name) to fn "_toNumber"
                        //result.unshift fnNameArray // put "functioname" first - call to global function
                        result.unshift(fnNameArray); // put "functioname" first - call to global function

                        //if fnNameArray[0] is '_concatAny'
                        if (fnNameArray[0] === '_concatAny') {
                            //callParams =[] // no "thisValue" for internal _concatAny, just params to concat
                            callParams = []; // no "thisValue" for internal _concatAny, just params to concat
                            //add arguments: count,...
                            //.addArguments functionAccess.args, callParams, skipAnyArr=true
                            this.addArguments(functionAccess.args, callParams, true);
                        }
                        else {
                        //else
                            //callParams = ["undefined", ","] //this==undefined as in js "use strict" mode
                            callParams = ["undefined", ","]; //this==undefined as in js "use strict" mode
                            //add arguments: count,(any_arr){...}
                            //.addArguments functionAccess.args, callParams
                            this.addArguments(functionAccess.args, callParams);
                        };

                        //callParams.push ")" //close function(undefined,arg,any* arguments)
                        callParams.push(")"); //close function(undefined,arg,any* arguments)
                    }
                    else {

                    //else
                        //method call

                        // DISABLED-
                        //to ease C-code reading, use macros CALL1 to CALL4 if possible
                        //if false /*functionAccess.args and functionAccess.args.length<=4*/
                        if (false) { //functionAccess.args and functionAccess.args.length<=4

                            // __call enclose all
                            //fnNameArray.unshift "CALL#{functionAccess.args.length}(" 
                            fnNameArray.unshift("CALL" + functionAccess.args.length + "(");
                            // here goes methodName
                            //fnNameArray.push "," // CALLn(symbol_ *,*
                            fnNameArray.push(","); // CALLn(symbol_ *,*
                            // here: instance reference as 2nd param (this value)
                            //result.unshift fnNameArray //prepend CALLn(method_,instanceof,...
                            result.unshift(fnNameArray); //prepend CALLn(method_,instanceof,...
                            //callParams = functionAccess.args.length? [","] else []
                            callParams = functionAccess.args.length ? [","] : [];
                            //callParams.push {CSL:functionAccess.args}
                            callParams.push({CSL: functionAccess.args});
                        }
                        else {

                        //else // do not use macros CALL1 to CALL4

                            ///*
                            // METHOD()(... ) enclose all
                            //fnNameArray.unshift "METHOD(" 
                            // here goes methodName
                            //fnNameArray.push "," // __call(symbol_ *,*
                            // here: instance reference as 2nd param (this value)
                            //result.unshift fnNameArray //prepend __call(methodName, ...instanceof
                            //options.validations.push ["assert("].concat(callParams,".type>TYPE_NULL);")
                            //callParams = [")("]
                            //*/
                            //var simpleVar = result.length is 1 and result[0].length is 1
                            var simpleVar = result.length === 1 && result[0].length === 1;
                            //if simpleVar
                            if (simpleVar) {
                                //var simpleVarName = result[0][0]
                                var simpleVarName = result[0][0];
                                // METHOD()(... ) enclose all
                                //fnNameArray.unshift ["METHOD("]
                                fnNameArray.unshift(["METHOD("]);
                                // here goes methodName
                                //fnNameArray.push ","
                                fnNameArray.push(",");
                                //result.unshift fnNameArray
                                result.unshift(fnNameArray);
                                // here: 1st instance reference 
                                //result.push [")(",simpleVarName] // METHOD(symbol_,this)(this
                                result.push([")(", simpleVarName]); // METHOD(symbol_,this)(this
                                //options.validations.push ["assert("].concat(callParams,".type>TYPE_NULL);")
                                //callParams = [","]
                                callParams = [","];
                            }
                            else {

                            //else
                                // __call() enclose all
                                //fnNameArray.unshift "__call(" 
                                fnNameArray.unshift("__call(");
                                // here goes methodName
                                //fnNameArray.push "," // __call(symbol_ *,*
                                fnNameArray.push(","); // __call(symbol_ *,*
                                // here: instance reference as 2nd param (this value)
                                //result.unshift fnNameArray //prepend __call(methodName, ...instanceof
                                result.unshift(fnNameArray); //prepend __call(methodName, ...instanceof
                                //options.validations.push ["assert("].concat(callParams,".type>TYPE_NULL);")
                                //callParams = [","]
                                callParams = [","];
                            };
                            //end if
                            

                            //add arguments: count,(any_arr){...}
                            //.addArguments functionAccess.args, callParams
                            this.addArguments(functionAccess.args, callParams);
                            //callParams.push ")" //close 
                            callParams.push(")"); //close
                        };

                        //end if
                        
                    };

                    //end if //global fn or method
                    

                    // foo(...) 
                    // new actual type is method's return type
                    //if actualVar
                    if (actualVar) {
                        //actualType = actualVar.findMember("**return type**")
                        actualType = actualVar.findMember("**return type**");
                    }
                    else {
                    //else
                        //actualType = undefined //any
                        actualType = undefined; //any
                    };

                    //actualVar = undefined // we cannot know return instance
                    actualVar = undefined; // we cannot know return instance
                };


                //end if //new x() or x()
                

                //result.push callParams
                result.push(callParams);
            }
            else if (ac.constructor === Grammar.IndexAccess) {


//##### IndexAccess: [...]

//else, for IndexAccess, the varRef type is now 'name.value.item[...]'
//and next property access should be on members type of the array

            //else if ac.constructor is Grammar.IndexAccess

                //partial ="#{partial}[...]"
                partial = '' + partial + "[...]";

                //.calcType = 'any'
                this.calcType = 'any';

                //declare ac:Grammar.IndexAccess
                

                //ac.name is a Expression
                //ac.name.produceType = 'Number'
                ac.name.produceType = 'Number';

                //add macro ITEM(array,index)
                //macro ITEM() encloses all 
                //result.unshift ["ITEM(" ]
                result.unshift(["ITEM("]);
                // here goes instance
                //result.push [",",ac.name,")"]
                result.push([",", ac.name, ")"]);

                //if actualVar 
                if (actualVar) {
                    //actualType = actualVar.findMember('**item type**')
                    actualType = actualVar.findMember('**item type**');
                    //if no actualVar.hasProto("Array"), .sayErr "#{partial} is not Array"
                    if (!actualVar.hasProto("Array")) {this.sayErr('' + partial + " is not Array")};
                }
                else {
                //else
                    //actualType = undefined
                    actualType = undefined;
                };

                //actualVar = undefined // we cannot know return instance
                actualVar = undefined; // we cannot know return instance
            };

            //end if //type of accessor
            
        };// end for each in this.accessors

        //end for #each accessor
        

        //return result
        return result;
      };


//##### helper method addArguments(args:array , callParams:array, skipAnyArr:boolean)
      Grammar.VariableRef.prototype.addArguments = function(args, callParams, skipAnyArr){

        //var pre=skipAnyArr?'' else '(any_arr){'
        var pre = skipAnyArr ? '' : '(any_arr){';
        //var post=skipAnyArr?'' else '}'
        var post = skipAnyArr ? '' : '}';

        //add arguments[] 
        //if args and args.length
        if (args && args.length) {
            //callParams.push "#{args.length},",pre,{CSL:args, freeForm:1},post
            callParams.push('' + args.length + ",", pre, {CSL: args, freeForm: 1}, post);
        }
        else {
            //,freeForm:true,indent:String.spaces(8)
        //else
            //callParams.push "0,NULL"
            callParams.push("0,NULL");
        };
      };



//##### helper method calcPropAccessOnly() returns array 
      Grammar.VariableRef.prototype.calcPropAccessOnly = function(){

//Start with main variable name, upto functionAccess or indexAccess

        //var actualVar = .tryGetFromScope(.name)
        var actualVar = this.tryGetFromScope(this.name);
        //if no actualVar, .throwError("var '#{.name}' not found in scope")
        if (!actualVar) {this.throwError("var '" + this.name + "' not found in scope")};

        //var result: array = []
        var result = [];

        //var partial = actualVar.getComposedName()
        var partial = actualVar.getComposedName();
        //result.push partial
        result.push(partial);

        //if no .accessors, return result
        if (!this.accessors) {return result};

//now follow each PropertyAccess

        //for each inx,ac:Grammar.PropertyAccess in .accessors
        for( var inx=0,ac ; inx<this.accessors.length ; inx++){ac=this.accessors[inx];
        

            //if ac isnt instanceof Grammar.PropertyAccess, return result
            if (!(ac instanceof Grammar.PropertyAccess)) {return result};

            //partial ="#{partial}.#{ac.name}"
            partial = '' + partial + "." + ac.name;

//access to a namespace property or function. Implies *no* redirection. 
//when compiled-to-c, namespaces are just lexical name concatenations (better performance)

            //if actualVar and ( actualVar.nodeClass is Grammar.NamespaceDeclaration //is namespace
            if (actualVar && (actualVar.nodeClass === Grammar.NamespaceDeclaration || (actualVar.nodeClass === Grammar.ClassDeclaration && ac.name !== 'name'))) { //is namespace
                                    //or (actualVar.nodeClass is Grammar.ClassDeclaration and ac.name isnt 'name' ) // or a class prop other than .name
                                  //)

                    //just namespace access or accessing a "property" of a class "as namespace"
                    //result.push "_",ac.name
                    result.push("_", ac.name);
            }
            else {

//else, normal property access. out: `propName__(instance)`. 

//macro "PROP" will evaluate to direct|fast access #ifdef NDEBUG, 
//and a controlled|checked access otherwise 

            //else

                //result.unshift makeSymbolName(ac.name),"_("  // foo__() macro enclose all 
                result.unshift(makeSymbolName(ac.name), "_("); // foo__() macro enclose all
                // here goes thisValue (instance)
                //result.push ")"
                result.push(")");
            };

            //end if
            

            //if actualVar 
            if (actualVar) {
                //actualVar = actualVar.findMember(ac.name)
                actualVar = actualVar.findMember(ac.name);
            };
        };// end for each in this.accessors

        //end loop
        
      };

//### append to class Grammar.AssignmentStatement ###
    

      //method produce() 
      Grammar.AssignmentStatement.prototype.produce = function(){

        //var extraLvalue='.value.number'
        var extraLvalue = '.value.number';
        //if .lvalue.tryGetReference() into var nameDecl
        var nameDecl=undefined;
        if ((nameDecl=this.lvalue.tryGetReference()) && nameDecl.findOwnMember('**proto**') === '**native number**') {
            //and nameDecl.findOwnMember('**proto**') is '**native number**'
                //extraLvalue=undefined
                extraLvalue = undefined;
        };

        //var oper = operTranslate(.name)
        var oper = operTranslate(this.name);
        //case oper
        
            //when "+=","-=","*=","/=":
        if (
           (oper=="+=")
           ||(oper=="-=")
           ||(oper=="*=")
           ||(oper=="/=")
       ){

                //if oper is '+='
                if (oper === '+=') {
                    //var rresultNameDecl = .rvalue.getResultType() 
                    var rresultNameDecl = this.rvalue.getResultType();
                    //if (nameDecl and nameDecl.hasProto('String'))
                    if ((nameDecl && nameDecl.hasProto('String')) || (rresultNameDecl && rresultNameDecl.hasProto('String'))) {
                        //or (rresultNameDecl and rresultNameDecl.hasProto('String'))
                            //.sayErr """
                            this.sayErr("You should not use += to concat strings. use string concat oper: & or interpolation instead.\ne.g.: DO: \"a &= b\"  vs.  DO NOT: a += b");
                    };
                };
                                //You should not use += to concat strings. use string concat oper: & or interpolation instead.
                                //e.g.: DO: "a &= b"  vs.  DO NOT: a += b
                                //"""

                //.rvalue.produceType = 'Number'
                this.rvalue.produceType = 'Number';
                //.out .lvalue,extraLvalue,' ', oper,' ',.rvalue
                this.out(this.lvalue, extraLvalue, ' ', oper, ' ', this.rvalue);
        
        }
            //when "&=": //string concat
        else if (
           (oper=="&=")
       ){
                //.rvalue.produceType = 'any'
                this.rvalue.produceType = 'any';
                //.out .lvalue, '=', "_concatAny(2,",.lvalue,',',.rvalue,')'
                this.out(this.lvalue, '=', "_concatAny(2,", this.lvalue, ',', this.rvalue, ')');
        
        }
        else {

            //else
                //.rvalue.produceType = 'any'
                this.rvalue.produceType = 'any';
                //.out .lvalue, ' ', operTranslate(.name), ' ' , .rvalue
                this.out(this.lvalue, ' ', operTranslate(this.name), ' ', this.rvalue);
        };
      };

//-------
//### append to class Grammar.DefaultAssignment ###
    

      //method produce() 
      Grammar.DefaultAssignment.prototype.produce = function(){

        //.process(.assignment.lvalue, .assignment.rvalue)
        this.process(this.assignment.lvalue, this.assignment.rvalue);

        //.skipSemiColon = true
        this.skipSemiColon = true;
      };

//#### helper Functions

      //#recursive duet 1
      //helper method process(name,value)
      Grammar.DefaultAssignment.prototype.process = function(name, value){

//if it is ObjectLiteral: recurse levels, else, a simple 'if undefined, assignment'

//check if it's a ObjectLiteral (level indent)

          //if value instanceof Grammar.ObjectLiteral
          if (value instanceof Grammar.ObjectLiteral) {
            //.processItems name, value # recurse Grammar.ObjectLiteral
            this.processItems(name, value);// # recurse Grammar.ObjectLiteral
          }
          else {

//else, simple value (Expression)

          //else
            //.assignIfUndefined name, value # Expression
            this.assignIfUndefined(name, value);// # Expression
          };
      };


      //#recursive duet 2
      //helper method processItems(main, objectLiteral) 
      Grammar.DefaultAssignment.prototype.processItems = function(main, objectLiteral){

          //.throwError "default for objects not supported on C-generation"
          this.throwError("default for objects not supported on C-generation");
      };
          ///*
          //.out "_defaultObject(&",main,");",NL

          //for each nameValue in objectLiteral.items
            //var itemFullName = [main,'.',nameValue.name]
            //.process(itemFullName, nameValue.value)
          //*/

    //#end helper recursive functions

//-----------

//### Append to class Grammar.WithStatement ###
    

//`WithStatement: with VariableRef Body`

//The WithStatement simplifies calling several methods of the same object:
//Example:
//```    
//with frontDoor
    //.show
    //.open
    //.show
    //.close
    //.show
//```
//to js:
//```
//var with__1=frontDoor;
  //with__1.show;
  //with__1.open
  //with__1.show
  //with__1.close
  //with__1.show
//```

      //method produce() 
      Grammar.WithStatement.prototype.produce = function(){

        //.out "var ",.nameDecl.getComposedName(),'=',.varRef,";"
        this.out("var ", this.nameDecl.getComposedName(), '=', this.varRef, ";");
        //.out .body
        this.out(this.body);
      };



//---

//### Append to class Names.Declaration ###
    

      //method addToAllProperties
      Names.Declaration.prototype.addToAllProperties = function(){

        //var name = .name
        var name = this.name;
        //if name not in coreSupportedProps and not allClassProperties.has(name) 
        if (coreSupportedProps.indexOf(name)===-1 && !(allClassProperties.has(name))) {
            //if allMethodNames.has(name)
            if (allMethodNames.has(name)) {
                //.sayErr "Ambiguity: A method named '#{name}' is already defined. Cannot reuse the symbol for a property"
                this.sayErr("Ambiguity: A method named '" + name + "' is already defined. Cannot reuse the symbol for a property");
                //allMethodNames.get(name).sayErr "declaration of method '#{name}'"
                allMethodNames.get(name).sayErr("declaration of method '" + name + "'");
            }
            else if (coreSupportedMethods.indexOf(name)>=0) {
            //else if name in coreSupportedMethods
                //.sayErr "'#{name}' is declared in as a core method. Cannot use the symbol for a property"
                this.sayErr("'" + name + "' is declared in as a core method. Cannot use the symbol for a property");
            }
            else {
            //else
                //allClassProperties.set name, this
                allClassProperties.set(name, this);
            };
        };
      };

//### Append to class Grammar.VarDeclList ###
    

      //method addToAllProperties
      Grammar.VarDeclList.prototype.addToAllProperties = function(){
        //for each varDecl in .list
        for( var varDecl__inx=0,varDecl ; varDecl__inx<this.list.length ; varDecl__inx++){varDecl=this.list[varDecl__inx];
        
            //varDecl.nameDecl.addToAllProperties
            varDecl.nameDecl.addToAllProperties();
        };// end for each in this.list
        
      };

      //method getNames returns array of string
      Grammar.VarDeclList.prototype.getNames = function(){
        //var result=[]
        var result = [];
        //for each varDecl in .list
        for( var varDecl__inx=0,varDecl ; varDecl__inx<this.list.length ; varDecl__inx++){varDecl=this.list[varDecl__inx];
        
            //result.push varDecl.name
            result.push(varDecl.name);
        };// end for each in this.list
        //return result
        return result;
      };


//### Append to class Grammar.VarStatement ###
    

//'var' followed by a list of comma separated: var names and optional assignment

      //method produce() 
      Grammar.VarStatement.prototype.produce = function(){
        //.out 'var ',{CSL:.list, freeForm:1}
        this.out('var ', {CSL: this.list, freeForm: 1});
      };

//### Append to class Grammar.VariableDecl ###
    

//variable name and optionally assign a value

      //method produce
      Grammar.VariableDecl.prototype.produce = function(){
        //.out .name,' = ', .assignedValue or 'undefined'
        this.out(this.name, ' = ', this.assignedValue || 'undefined');
      };

//### Append to class Grammar.ImportStatement ###
    

//'import' followed by a list of comma separated: var names and optional assignment

      //method produce() 
      Grammar.ImportStatement.prototype.produce = function(){

        //for each item in .list
        //    .out '#include "', item.getRefFilename('.h'),'"', NL

        //.skipSemiColon = true
        this.skipSemiColon = true;
      };


//### Append to class Grammar.SingleLineBody ###
    

      //method produce()
      Grammar.SingleLineBody.prototype.produce = function(){

        //var bare=[]
        var bare = [];
        //for each item in .statements
        for( var item__inx=0,item ; item__inx<this.statements.length ; item__inx++){item=this.statements[item__inx];
        
            //bare.push item.specific
            bare.push(item.specific);
        };// end for each in this.statements

        //.out {CSL:bare, separator:","}
        this.out({CSL: bare, separator: ","});
      };


//### Append to class Grammar.IfStatement ###
    

      //method produce() 
      Grammar.IfStatement.prototype.produce = function(){

        //declare valid .elseStatement.produce
        
        //.conditional.produceType = 'Bool'
        this.conditional.produceType = 'Bool';
        //.out "if (", .conditional,") "
        this.out("if (", this.conditional, ") ");

        //if .body instanceof Grammar.SingleLineBody
        if (this.body instanceof Grammar.SingleLineBody) {
            //.out '{',.body,';}'
            this.out('{', this.body, ';}');
        }
        else {
        //else
            //.out " {", .getEOLComment()
            this.out(" {", this.getEOLComment());
            //.out .body, "}"
            this.out(this.body, "}");
        };

        //if .elseStatement
        if (this.elseStatement) {
            //.outSourceLinesAsComment .elseStatement.sourceLineNum-1
            this.outSourceLinesAsComment(this.elseStatement.sourceLineNum - 1);
            //.elseStatement.produce()
            this.elseStatement.produce();
        };
      };


//### Append to class Grammar.ElseIfStatement ###
    

      //method produce() 
      Grammar.ElseIfStatement.prototype.produce = function(){

        //.outSourceLineAsComment .sourceLineNum
        this.outSourceLineAsComment(this.sourceLineNum);

        //.out NL,"else ", .nextIf
        this.out(NL, "else ", this.nextIf);
      };

//### Append to class Grammar.ElseStatement ###
    

      //method produce()
      Grammar.ElseStatement.prototype.produce = function(){

        //.outSourceLineAsComment .sourceLineNum
        this.outSourceLineAsComment(this.sourceLineNum);

        //.out NL,"else {", .body, "}"
        this.out(NL, "else {", this.body, "}");
      };

//### Append to class Grammar.ForStatement ###
    

//There are 3 variants of `ForStatement` in LiteScript

      //method produce() 
      Grammar.ForStatement.prototype.produce = function(){

        //declare valid .variant.produce
        
        //.variant.produce()
        this.variant.produce();

//Since al 3 cases are closed with '}; //comment', we skip statement semicolon

        //.skipSemiColon = true
        this.skipSemiColon = true;
      };


//### Append to class Grammar.ForEachProperty
    
//### Variant 1) 'for each property' to loop over *object property names* 

//`ForEachProperty: for each property [name-IDENTIFIER,]value-IDENTIFIER in this-VariableRef`

      //method produce() 
      Grammar.ForEachProperty.prototype.produce = function(){

//=> C:  for(inx=0;inx<obj.getPropertyCount();inx++){ 
            //value=obj.value.prop[inx]; name=obj.getPropName(inx); 
        //...

//Create a default index var name if none was provided

        //.out "{" //enclose defined temp vars in their own scope
        this.out("{"); //enclose defined temp vars in their own scope

        //var listName, uniqueName = UniqueID.getVarName('list')  #unique temp listName var name
        var listName = undefined, uniqueName = UniqueID.getVarName('list');// #unique temp listName var name
        //declare valid .iterable.root.name.hasSideEffects
        
        //if .iterable.operandCount>1 or .iterable.root.name.hasSideEffects or .iterable.root.name instanceof Grammar.Literal
        if (this.iterable.operandCount > 1 || this.iterable.root.name.hasSideEffects || this.iterable.root.name instanceof Grammar.Literal) {
            //listName = uniqueName
            listName = uniqueName;
            //.out "any ",listName,"=",.iterable,";"
            this.out("any ", listName, "=", this.iterable, ";");
        }
        else {
        //else
            //listName = .iterable
            listName = this.iterable;
        };

//create a var holding object property count

        //.out "len_t __propCount=_length(",listName,');'
        this.out("len_t __propCount=_length(", listName, ');');

        //var startValue = "0"
        var startValue = "0";
        //var intIndexVarName = '#{.valueVar.name}__inx';
        var intIndexVarName = '' + this.valueVar.name + '__inx';

        //if .keyIndexVar 
        if (this.keyIndexVar) {
            //.out " any ",.keyIndexVar.name,"=undefined;"
            this.out(" any ", this.keyIndexVar.name, "=undefined;");
        };

        //.out " any ",.valueVar.name,"=undefined;", NL
        this.out(" any ", this.valueVar.name, "=undefined;", NL);

        //.out 
            //"for(int __propIndex=", startValue
            //" ; __propIndex < __propCount"
            //" ; __propIndex++ ){", NL
        this.out("for(int __propIndex=", startValue, " ; __propIndex < __propCount", " ; __propIndex++ ){", NL);


        // loop vars assignment block
        //.body.out "NameValuePair_s _nvp = _unifiedGetNVPAtIndex(",listName,", __propIndex);",NL
        this.body.out("NameValuePair_s _nvp = _unifiedGetNVPAtIndex(", listName, ", __propIndex);", NL);
        //.body.out .valueVar.name,"= _nvp.value;"
        this.body.out(this.valueVar.name, "= _nvp.value;");
        //if .keyIndexVar
        if (this.keyIndexVar) {
            //.body.out .keyIndexVar.name,"= _nvp.name;"
            this.body.out(this.keyIndexVar.name, "= _nvp.name;");
        };
        //.body.out NL
        this.body.out(NL);

        //if .where 
        if (this.where) {
          //.out '  ',.where,"{",.body,"}"
          this.out('  ', this.where, "{", this.body, "}");
        }
        else {
        //else 
          //.out .body
          this.out(this.body);
        };

        //.out "}};",{COMMENT:["end for each property in ",.iterable]},NL
        this.out("}};", {COMMENT: ["end for each property in ", this.iterable]}, NL);
      };

//### Append to class Grammar.ForEachInArray
    
//### Variant 2) 'for each index' to loop over *Array indexes and items*

//`ForEachInArray: for each [index-VariableDecl,]item-VariableDecl in array-VariableRef`

//####  method produce()
      Grammar.ForEachInArray.prototype.produce = function(){

//Create a default index var name if none was provided

//vars declaration code in a bracket block to contain scope

        //.out 
            //"{",NL
        this.out("{", NL);

//Determine type for loop var indexNameVar

        //var nameIndexType, valueType
        var nameIndexType = undefined, valueType = undefined;
        //if .iterable.root.name instanceof Grammar.ArrayLiteral
        if (this.iterable.root.name instanceof Grammar.ArrayLiteral || this.iterable.root.name instanceof Grammar.StringLiteral) {
            //or .iterable.root.name instanceof Grammar.StringLiteral
                //nameIndexType='**native number**'
                nameIndexType = '**native number**';
        };

//Check if we can use the iterable as it is, or we need to create a temp var

        //var listName
        var listName = undefined;

        //if .iterable.operandCount>1 or .iterable.root.name.hasSideEffects or .iterable.root.name instanceof Grammar.Literal
        if (this.iterable.operandCount > 1 || this.iterable.root.name.hasSideEffects || this.iterable.root.name instanceof Grammar.Literal) {
            //listName = UniqueID.getVarName('list')  #unique temp listName var name
            listName = UniqueID.getVarName('list');// #unique temp listName var name
            //.out "var ",listName,"=",.iterable,";",NL
            this.out("var ", listName, "=", this.iterable, ";", NL);
        }
        else {
        //else
            //simple var
            //listName = .iterable
            listName = this.iterable;
        };


//check if a intIndexVarName was specified: `for each inx,name,value in iterable`

        //var intIndexVarName
        var intIndexVarName = undefined;
        //var startValue = "0"
        var startValue = "0";
        //if .intIndexVar 
        if (this.intIndexVar) {
            //.intIndexVar.nameDecl.setMember '**proto**','**native number**'
            this.intIndexVar.nameDecl.setMember('**proto**', '**native number**');
            //intIndexVarName = .intIndexVar.name
            intIndexVarName = this.intIndexVar.name;
            //startValue = .intIndexVar.assignedValue or "0"
            startValue = this.intIndexVar.assignedValue || "0";
        }
        else {
        //else
            //intIndexVarName = '#{.valueVar.name}__inx';
            intIndexVarName = '' + this.valueVar.name + '__inx';
        };

//check if a nameIndexVarName was specified: `for each name,value in iterable`

        //var keyVarName
        var keyVarName = undefined;
        //if .keyIndexVar
        if (this.keyIndexVar) {
            //keyVarName = .keyIndexVar.name
            keyVarName = this.keyIndexVar.name;
        }
        else {
        //else
            //keyVarName = '#{.valueVar.name}__name';
            keyVarName = '' + this.valueVar.name + '__name';
        };

//create Iterable.Position, start loop 

        //.out 
            //"var iter=_newIterPos(); int __inx=0;",NL
            //"for(int __inx=0; ITER_NEXT(",listName,",iter); __inx++ ){",NL
        this.out("var iter=_newIterPos(); int __inx=0;", NL, "for(int __inx=0; ITER_NEXT(", listName, ",iter); __inx++ ){", NL);

//declare loop variables (up to three), assign values from item

        //.out
            //"  var ",.valueVar.name,"=value__(iter)"
        this.out("  var ", this.valueVar.name, "=value__(iter)");

        //if keyVarName
        if (keyVarName) {
            //.out ", ",keyVarName,"=key__(iter)"
            this.out(", ", keyVarName, "=key__(iter)");
        };

        //if intIndexVarName
        if (intIndexVarName) {
            //.out ", ",intIndexVarName,"=any_number(__inx)"
            this.out(", ", intIndexVarName, "=any_number(__inx)");
        };

        //.out ";",NL
        this.out(";", NL);

//out filter and body

        //if .where 
        if (this.where) {
            //.out '  ',.where,"{",.body,"}" //filter condition
            this.out('  ', this.where, "{", this.body, "}"); //filter condition
        }
        else {
        //else 
            //.out .body
            this.out(this.body);
        };

        //.out "}};",{COMMENT:"end for each loop"},NL
        this.out("}};", {COMMENT: "end for each loop"}, NL);
      };

///*
//Create a default index var name if none was provided

        //var listName
        //listName = UniqueID.getVarName('list')  #unique temp listName var name
        //.out "any ",listName,"=",.iterable,";",NL

        //if .isMap
            //return .produceForMap(listName)

        //var intIndexVarName
        //var startValue = "0"
        //if .keyIndexVar 
            //.keyIndexVar.nameDecl.members.set '**proto**','**native number**'
            //intIndexVarName = .keyIndexVar.name
            //startValue = .keyIndexVar.assignedValue or "0"
        //else
            //intIndexVarName = '#{.valueVar.name}__inx';

//include valueVar.name in a bracket block to contain scope

        //.out "{ var ",.valueVar.name,"=undefined;",NL

        //.out 
            //"for(int ", intIndexVarName,"=", startValue
            //" ; ",intIndexVarName,"<",listName,".value.arr->length"
            //" ; ",intIndexVarName,"++){"

        //.body.out .valueVar.name,"=ITEM(",listName,",",intIndexVarName,");",NL

        //if .where 
            //.out '  ',.where,"{",.body,"}" //filter condition
        //else 
            //.out .body

        //.out "}};",{COMMENT:"end for each in"},NL


//####  method produceForMap(listName)

        //.out 
            //"{" //enclose in a block to limit scope of loop vars
            //"NameValuePair_ptr __nvp=NULL; //name:value pair",NL
            //"int64_t __len=MAPSIZE(",listName,"); //how many pairs",NL

        //if .keyIndexVar, .out "var ",.keyIndexVar.name,"=undefined; //key",NL 
        //.out "var ",.valueVar.name,"=undefined; //value",NL

        //.out 
            //"for(int64_t __inx=0"
            //" ; __inx < __len"
            //" ; __inx++ ){",NL

        //.body.out "__nvp = MAPITEM( __inx,",listName,");",NL //get nv pair ptr
        //if .keyIndexVar, .body.out .keyIndexVar.name,"= __nvp->name;",NL //get key
        //.body.out .valueVar.name,"= __nvp->value;",NL //get value

        //if .where 
          //.out '  ',.where,"{",.body,"}" //filter condition
        //else 
          //.out .body

        //.out "}};",{COMMENT:"end for each in map"},NL
//*/

//### Append to class Grammar.ForIndexNumeric
    
//### Variant 3) 'for index=...' to create *numeric loops* 

//`ForIndexNumeric: for index-VariableDecl [","] (while|until|to|down to) end-Expression ["," increment-Statement] ["," where Expression]`

//Examples: `for n=0 while n<10`, `for n=0 to 9`
//Handle by using a js/C standard for(;;){} loop

      //method produce(iterable)
      Grammar.ForIndexNumeric.prototype.produce = function(iterable){

        //var isToDownTo: boolean
        var isToDownTo = undefined;
        //var endTempVarName
        var endTempVarName = undefined;

        //.endExpression.produceType='Number'
        this.endExpression.produceType = 'Number';

        // indicate .keyIndexVar is a native number, so no ".value.number" required to produce a number
        //.keyIndexVar.nameDecl.members.set '**proto**','**native number**'
        this.keyIndexVar.nameDecl.members.set('**proto**', '**native number**');

        //if .keyIndexVar.assignedValue, .keyIndexVar.assignedValue.produceType='Number'
        if (this.keyIndexVar.assignedValue) {this.keyIndexVar.assignedValue.produceType = 'Number'};

        //if .conditionPrefix in['to','down']
        if (['to', 'down'].indexOf(this.conditionPrefix)>=0) {

            //isToDownTo= true
            isToDownTo = true;

//store endExpression in a temp var. 
//For loops "to/down to" evaluate end expresion only once

            //endTempVarName = UniqueID.getVarName('end')
            endTempVarName = UniqueID.getVarName('end');
            //.out "int64_t ",endTempVarName,"=",.endExpression,";",NL
            this.out("int64_t ", endTempVarName, "=", this.endExpression, ";", NL);
        };

        //end if
        

        //.out "for(int64_t ", .keyIndexVar.name,"=", .keyIndexVar.assignedValue or "0","; "
        this.out("for(int64_t ", this.keyIndexVar.name, "=", this.keyIndexVar.assignedValue || "0", "; ");

        //if isToDownTo
        if (isToDownTo) {

            //#'for n=0 to 10' -> for(n=0;n<=10;n++)
            //#'for n=10 down to 0' -> for(n=10;n>=0;n--)
            //.out .keyIndexVar.name, .conditionPrefix is 'to'? "<=" else ">=", endTempVarName
            this.out(this.keyIndexVar.name, this.conditionPrefix === 'to' ? "<=" : ">=", endTempVarName);
        }
        else {

        //else # is while|until

//produce the condition, negated if the prefix is 'until'

            //#for n=0, while n<arr.length  -> for(n=0;n<arr.length;...
            //#for n=0, until n >= arr.length  -> for(n=0;!(n>=arr.length);...
            //.endExpression.produceType='Bool'
            this.endExpression.produceType = 'Bool';
            //.endExpression.produce( negated = .conditionPrefix is 'until' )
            this.endExpression.produce(this.conditionPrefix === 'until');
        };

        //end if
        

        //.out "; "
        this.out("; ");

//if no increment specified, the default is keyIndexVar++/--

        //if .increment
        if (this.increment) {
            //.out .increment //statements separated by ","
            this.out(this.increment); //statements separated by ","
        }
        else {
        //else
            //default index++ (to) or index-- (down to)
            //.out .keyIndexVar.name, .conditionPrefix is 'down'? '--' else '++'
            this.out(this.keyIndexVar.name, this.conditionPrefix === 'down' ? '--' : '++');
        };

        //.out 
            //"){", .body, "};" 
            //{COMMENT:"end for #{.keyIndexVar.name}"}, NL
        this.out("){", this.body, "};", {COMMENT: "end for " + this.keyIndexVar.name}, NL);
      };



//### Append to class Grammar.ForWhereFilter
    
//### Helper for where filter
//`ForWhereFilter: [where Expression]`

      //method produce()
      Grammar.ForWhereFilter.prototype.produce = function(){

        //.outLineAsComment .lineInx
        //.outSourceLineAsComment .sourceLineNum
        this.outSourceLineAsComment(this.sourceLineNum);

        //.filterExpression.produceType='Bool'
        this.filterExpression.produceType = 'Bool';
        //.out 'if(',.filterExpression,')'
        this.out('if(', this.filterExpression, ')');
      };

//### Append to class Grammar.DeleteStatement
    
//`DeleteStatement: delete VariableRef`

      //method produce()
      Grammar.DeleteStatement.prototype.produce = function(){
        //.out 'delete ',.varRef
        this.out('delete ', this.varRef);
      };

//### Append to class Grammar.WhileUntilExpression ###
    

      //method produce(askFor:string, negated:boolean) 
      Grammar.WhileUntilExpression.prototype.produce = function(askFor, negated){

//If the parent ask for a 'while' condition, but this is a 'until' condition,
//or the parent ask for a 'until' condition and this is 'while', we must *negate* the condition.

        //if askFor and .name isnt askFor
        if (askFor && this.name !== askFor) {
            //negated = true
            negated = true;
        };

//*askFor* is used when the source code was, for example,
//`do until Expression` and we need to code: `while(!(Expression))` 
//or the code was `loop while Expression` and we need to code: `if (!(Expression)) break` 

//when you have a `until` condition, you need to negate the expression 
//to produce a `while` condition. (`while NOT x` is equivalent to `until x`)

        //.expr.produceType = 'Bool'
        this.expr.produceType = 'Bool';
        //.expr.produce negated
        this.expr.produce(negated);
      };


//### Append to class Grammar.DoLoop ###
    

      //method produce() 
      Grammar.DoLoop.prototype.produce = function(){

//Note: **WhileUntilLoop** extends **DoLoop**, so this *.produce()* method is used by both symbols.

        //if .postWhileUntilExpression 
        if (this.postWhileUntilExpression) {

//if we have a post-condition, for example: `do ... loop while x>0`, 

            //.out 
                //"do{", .getEOLComment()
                //.body
                //"} while ("
            this.out("do{", this.getEOLComment(), this.body, "} while (");

            //.postWhileUntilExpression.produce(askFor='while')
            this.postWhileUntilExpression.produce('while');

            //.out ")"
            this.out(")");
        }
        else {

//else, optional pre-condition:

        //else

            //.out 'while('
            this.out('while(');
            //if .preWhileUntilExpression
            if (this.preWhileUntilExpression) {
              //.preWhileUntilExpression.produce(askFor='while')
              this.preWhileUntilExpression.produce('while');
            }
            else {
            //else 
              //.out 'TRUE'
              this.out('TRUE');
            };

            //.out '){', .body , "}"
            this.out('){', this.body, "}");
        };

        //end if
        

        //.out ";",{COMMENT:"end loop"},NL
        this.out(";", {COMMENT: "end loop"}, NL);
        //.skipSemiColon = true
        this.skipSemiColon = true;
      };

//### Append to class Grammar.LoopControlStatement ###
    
//This is a very simple produce() to allow us to use the `break` and `continue` keywords.

      //method produce() 
      Grammar.LoopControlStatement.prototype.produce = function(){

//validate usage inside a for/while

        //var nodeASTBase = this.parent
        var nodeASTBase = this.parent;
        //do
        while(true){

            //if nodeASTBase is instanceof Grammar.FunctionDeclaration
            if (nodeASTBase instanceof Grammar.FunctionDeclaration) {
                //if we reach function header
                //.sayErr '"{.control}" outside a for|while|do loop'
                this.sayErr('"{.control}" outside a for|while|do loop');
                //break loop
                break;
            }
            else if (nodeASTBase instanceof Grammar.ForStatement || nodeASTBase instanceof Grammar.DoLoop) {

            //else if nodeASTBase is instanceof Grammar.ForStatement
                //or nodeASTBase is instanceof Grammar.DoLoop
                    //break loop //ok, break/continue used inside a loop
                    break; //ok, break/continue used inside a loop
            };

            //end if
            

            //nodeASTBase = nodeASTBase.parent
            nodeASTBase = nodeASTBase.parent;
        };// end loop

        //loop

        //.out .control
        this.out(this.control);
      };


//### Append to class Grammar.DoNothingStatement ###
    

      //method produce()
      Grammar.DoNothingStatement.prototype.produce = function(){
        //.out "//do nothing",NL
        this.out("//do nothing", NL);
      };

//### Append to class Grammar.ParenExpression ###
    
//A `ParenExpression` is just a normal expression surrounded by parentheses.

      //properties
        //produceType
      

      //method produce() 
      Grammar.ParenExpression.prototype.produce = function(){
        //.expr.produceType = .produceType
        this.expr.produceType = this.produceType;
        //.out "(",.expr,")"
        this.out("(", this.expr, ")");
      };

//### Append to class Grammar.ArrayLiteral ###
    

//A `ArrayLiteral` is a definition of a list like `[1, a, 2+3]`. 
//On js we just pass this through, on C we create the array on the fly

      //method produce() 
      Grammar.ArrayLiteral.prototype.produce = function(){

        //.out "new(Array,"
        this.out("new(Array,");

        //if no .items or .items.length is 0
        if (!this.items || this.items.length === 0) {
            //.out "0,NULL"
            this.out("0,NULL");
        }
        else {
        //else
            //.out .items.length, ',(any_arr){', {CSL:.items}, '}'
            this.out(this.items.length, ',(any_arr){', {CSL: this.items}, '}');
        };

        //.out ")"
        this.out(")");
      };


//### Append to class Grammar.NameValuePair ###
    

//A `NameValuePair` is a single item in an Map definition. 
//we call _newPair to create a new NameValuePair

      //method produce() 
      Grammar.NameValuePair.prototype.produce = function(){
        //var strName = .name
        var strName = this.name;

        //if strName instanceof Grammar.Literal
        if (strName instanceof Grammar.Literal) {
            //declare strName: Grammar.Literal
            
            //strName = strName.getValue() 
            strName = strName.getValue();
        };

        //.out NL,'_newPair("',strName, '",', .value,')'
        this.out(NL, '_newPair("', strName, '",', this.value, ')');
      };

//### Append to class Grammar.ObjectLiteral ### also FreeObjectLiteral
    

//A `ObjectLiteral` is an object definition using key/value pairs like `{a:1,b:2}`. 
//JavaScript supports this syntax, so we just pass it through. 
//C99 does only support "static" initializers for structs.

      //method produce()
      Grammar.ObjectLiteral.prototype.produce = function(){

        //.out "new(Map,"
        this.out("new(Map,");

        //if no .items or .items.length is 0
        if (!this.items || this.items.length === 0) {
            //.out "0,NULL"
            this.out("0,NULL");
        }
        else {
        //else
            //.out 
                //.items.length,',(any_arr){'
                //{CSL:.items}
                //NL,"}"
            this.out(this.items.length, ',(any_arr){', {CSL: this.items}, NL, "}");
        };

        //.out ")",NL
        this.out(")", NL);
      };


//### Append to class Grammar.RegExpLiteral ###
    


      //method produce()
      Grammar.RegExpLiteral.prototype.produce = function(){

        //.throwError "generating C-code for RegExp Literals not supported yet. Use PMREX paliatives"
        this.throwError("generating C-code for RegExp Literals not supported yet. Use PMREX paliatives");
      };


//### Append to class Grammar.ConstructorDeclaration ###
    

//Produce a Constructor

      //method produce() 
      Grammar.ConstructorDeclaration.prototype.produce = function(){

        //if no .body.statements 
        if (!this.body.statements) {
            //.skipSemiColon=true
            this.skipSemiColon = true;
            //return // just method declaration (interface)
            return; // just method declaration (interface)
        };

        // get owner: should be ClassDeclaration
        //var ownerClassDeclaration  = .getParent(Grammar.ClassDeclaration) 
        var ownerClassDeclaration = this.getParent(Grammar.ClassDeclaration);
        //if no ownerClassDeclaration.nameDecl, return 
        if (!ownerClassDeclaration.nameDecl) {return};

        //var c = ownerClassDeclaration.nameDecl.getComposedName()
        var c = ownerClassDeclaration.nameDecl.getComposedName();

        //.out "void ",c,"__init(DEFAULT_ARGUMENTS){",NL
        this.out("void ", c, "__init(DEFAULT_ARGUMENTS){", NL);

//auto call supper init

        //if ownerClassDeclaration.varRefSuper
        if (ownerClassDeclaration.varRefSuper) {
            //.out 
                //"  ",{COMMENT:"auto call super class __init"},NL
                //"  ",ownerClassDeclaration.varRefSuper,"__init(this,argc,arguments);",NL
            this.out("  ", {COMMENT: "auto call super class __init"}, NL, "  ", ownerClassDeclaration.varRefSuper, "__init(this,argc,arguments);", NL);
        };

//On the constructor, assign initial values for properties.
//Initialize (non-undefined) properties with assigned values.

        //.getParent(Grammar.ClassDeclaration).body.producePropertiesInitialValueAssignments "#{c}_"
        this.getParent(Grammar.ClassDeclaration).body.producePropertiesInitialValueAssignments('' + c + "_");

// now the rest of the constructor body 

        //.produceFunctionBody c
        this.produceFunctionBody(c);
      };


//### Append to class Grammar.MethodDeclaration ###
    

//Produce a Method

      //method produce() 
      Grammar.MethodDeclaration.prototype.produce = function(){

        //if no .body.statements
        if (!this.body.statements) {
            //.skipSemiColon=true
            this.skipSemiColon = true;
            //return //just interface
            return; //just interface
        };

        //if no .nameDecl, return //shim
        if (!this.nameDecl) {return};
        //var name = .nameDecl.getComposedName()
        var name = this.nameDecl.getComposedName();

        //var ownerNameDecl  = .nameDecl.parent
        var ownerNameDecl = this.nameDecl.parent;
        //if no ownerNameDecl, return 
        if (!ownerNameDecl) {return};

        //var isClass = ownerNameDecl.name is 'prototype'
        var isClass = ownerNameDecl.name === 'prototype';

        //var c = ownerNameDecl.getComposedName()
        var c = ownerNameDecl.getComposedName();

        //.out "any ",name,"(DEFAULT_ARGUMENTS){",NL
        this.out("any ", name, "(DEFAULT_ARGUMENTS){", NL);

        //assert 'this' parameter class
        //if isClass 
        if (isClass) {
            //.body.out 
                //"assert(_instanceof(this,",c,"));",NL
                //"//---------"
            this.body.out("assert(_instanceof(this,", c, "));", NL, "//---------");
        };

        //.produceFunctionBody c
        this.produceFunctionBody(c);
      };


//### Append to class Grammar.FunctionDeclaration ###
    

//only module function production
//(methods & constructors handled above)

//`FunctionDeclaration: '[export] function [name] '(' FunctionParameterDecl* ')' Block`

      //method produce() 
      Grammar.FunctionDeclaration.prototype.produce = function(){

//exit if it is a *shim* method which never got declared (method exists, shim not required)

        //if no .nameDecl, return
        if (!this.nameDecl) {return};

//being a function, the only possible parent is a Module

        //var parentModule = .getParent(Grammar.Module)
        var parentModule = this.getParent(Grammar.Module);
        //var prefix = parentModule.fileInfo.base
        var prefix = parentModule.fileInfo.base;
        //var name = "#{prefix}_#{.name}"
        var name = '' + prefix + "_" + this.name;

        //var isInterface = no .body.statements
        var isInterface = !this.body.statements;
        //if isInterface, return // just method declaration (interface)
        if (isInterface) {return};

        //.out "any ",name,"(DEFAULT_ARGUMENTS){"
        this.out("any ", name, "(DEFAULT_ARGUMENTS){");

        //.produceFunctionBody prefix
        this.produceFunctionBody(prefix);
      };


//##### helper method produceFunctionBody(prefix:string)
      Grammar.FunctionDeclaration.prototype.produceFunctionBody = function(prefix){

//common code
//start body

        // function named params
        //if .paramsDeclarations and .paramsDeclarations.length
        if (this.paramsDeclarations && this.paramsDeclarations.length) {

                //.body.out NL,"// define named params",NL
                this.body.out(NL, "// define named params", NL);

                //if .paramsDeclarations.length is 1
                if (this.paramsDeclarations.length === 1) {
                    //.body.out "var ",.paramsDeclarations[0].name,"= argc? arguments[0] : undefined;",NL
                    this.body.out("var ", this.paramsDeclarations[0].name, "= argc? arguments[0] : undefined;", NL);
                }
                else {

                //else
                    //var namedParams:array=[]
                    var namedParams = [];

                    //for each paramDecl in .paramsDeclarations
                    for( var paramDecl__inx=0,paramDecl ; paramDecl__inx<this.paramsDeclarations.length ; paramDecl__inx++){paramDecl=this.paramsDeclarations[paramDecl__inx];
                    
                        //namedParams.push paramDecl.name
                        namedParams.push(paramDecl.name);
                    };// end for each in this.paramsDeclarations

                    //.body.out  
                        //"var ",{CSL:namedParams},";",NL
                        //namedParams.join("="),"=undefined;",NL
                        //"switch(argc){",NL 
                    this.body.out("var ", {CSL: namedParams}, ";", NL, namedParams.join("="), "=undefined;", NL, "switch(argc){", NL);

                    //for inx=namedParams.length-1, while inx>=0, inx--
                    for( var inx=namedParams.length - 1; inx >= 0; inx--) {
                        //.body.out "  case #{inx+1}: #{namedParams[inx]}=arguments[#{inx}];",NL
                        this.body.out("  case " + (inx + 1) + ": " + (namedParams[inx]) + "=arguments[" + inx + "];", NL);
                    };// end for inx

                    //.body.out "}",NL
                    this.body.out("}", NL);
                };

                //end if
                
                //.body.out "//---------",NL
                this.body.out("//---------", NL);
        };

        //end if //named params
        

//if single line body, insert return. Example: `function square(x) = x*x`

        //if .body instance of Grammar.Expression
        if (this.body instanceof Grammar.Expression) {
            //.out "return ", .body
            this.out("return ", this.body);
        }
        else {

        //else

//if it has a exception block, insert 'try{'

            //if .hasExceptionBlock, .body.out " try{",NL
            if (this.hasExceptionBlock) {this.body.out(" try{", NL)};

//now produce function body

            //.body.produce()
            this.body.produce();

//close the function, to all functions except *constructors* (__init), 
//add default "return undefined", to emulate js behavior on C. 
//if you dot not insert a "return", the C function will return garbage.

            //if not .constructor is Grammar.ConstructorDeclaration // declared as void Class__init(...)
            if (!(this.constructor === Grammar.ConstructorDeclaration)) { // declared as void Class__init(...)
                //.out "return undefined;",NL
                this.out("return undefined;", NL);
            };
        };

//close function

        //.out "}"
        this.out("}");

        //.skipSemiColon = true
        this.skipSemiColon = true;
      };

        //if .lexer.out.sourceMap
        //    .lexer.out.sourceMap.add ( .EndFnLineNum, 0, .lexer.out.lineNum-1, 0)
        //endif


//--------------------
//### Append to class Grammar.PrintStatement ###
    
//`print` is an alias for console.log

      //method produce()
      Grammar.PrintStatement.prototype.produce = function(){

        //if .args.length 
        if (this.args.length) {
            //.out 'print(#{.args.length},(any_arr){',{CSL:.args},'})'
            this.out('print(' + this.args.length + ',(any_arr){', {CSL: this.args}, '})');
        }
        else {
        //else
            //.out 'print(0,NULL)'
            this.out('print(0,NULL)');
        };
      };

//--------------------
//### Append to class Grammar.EndStatement ###
    

//Marks the end of a block. It's just a comment for javascript

      //method produce()
      Grammar.EndStatement.prototype.produce = function(){

        //declare valid .lexer.outCode.lastOriginalCodeComment
        
        //declare valid .lexer.infoLines
        

        //if .lexer.outCode.lastOriginalCodeComment<.lineInx
        if (this.lexer.outCode.lastOriginalCodeComment < this.lineInx) {
          //.out {COMMENT: .lexer.infoLines[.lineInx].text}
          this.out({COMMENT: this.lexer.infoLines[this.lineInx].text});
        };

        //.skipSemiColon = true
        this.skipSemiColon = true;
      };

///*
//--------------------
//### Append to class Grammar.CompilerStatement ###

      //method produce()

//first, out as comment this line

        //.outLineAsComment .lineInx
        //.outSourceLineAsComment .sourceLineNum

//if it's a conditional compile, output body is option is Set

        //if .conditional
            //if .compilerVar(.conditional)
                //declare valid .body.produce
                //.body.produce()

        //.skipSemiColon = true
//*/

//--------------------
//### Append to class Grammar.ImportStatementItem ###
    

        //method getRefFilename(ext)
        Grammar.ImportStatementItem.prototype.getRefFilename = function(ext){

            //var thisModule = .getParent(Grammar.Module)
            var thisModule = this.getParent(Grammar.Module);

            //return Environment.relativeFrom(thisModule.fileInfo.outDir,
            return Environment.relativeFrom(thisModule.fileInfo.outDir, this.importedModule.fileInfo.outWithExtension(".h"));
        };
                     //.importedModule.fileInfo.outWithExtension(".h"))

//--------------------
//### Append to class Grammar.DeclareStatement ###
    

//Out as comments

      //method produce()
      Grammar.DeclareStatement.prototype.produce = function(){
        //.skipSemiColon = true
        this.skipSemiColon = true;
      };


//----------------------------
//### Append to class Names.Declaration ###
    

//#### method getComposedName
     Names.Declaration.prototype.getComposedName = function(){

//if this nameDecl is member of a namespace, goes up the parent chain
//composing the name. e.g. a property x in module Foo, namespace Bar => `Foo_Bar_x`

            //var result = []
            var result = [];
            //var node = this
            var node = this;
            //while node and not node.isScope
            while(node && !(node.isScope)){
                //if node.name isnt 'prototype', result.unshift node.name
                if (node.name !== 'prototype') {result.unshift(node.name)};
                //if node.nodeDeclared instanceof Grammar.ImportStatementItem
                if (node.nodeDeclared instanceof Grammar.ImportStatementItem) {
                    //stop here, imported modules create a local var, but act as global var
                    //since all others import of the same name, return the same content 
                    //return result.join('_')
                    return result.join('_');
                };

                //node = node.parent
                node = node.parent;
            };// end loop

//if we reach module scope, (and not Global Scope) 
//then it's a var|fn|class declared at module scope.
//Since modules act as namespaces, we add module.fileinfo.base to the name.
//Except is the same name as the top namespace|class (auto export default).


            //if node and node.isScope and node.nodeDeclared.constructor is Grammar.Module 
            if (node && node.isScope && node.nodeDeclared.constructor === Grammar.Module) {
                //var scopeModule = node.nodeDeclared
                var scopeModule = node.nodeDeclared;
                //if scopeModule.name isnt '*Global Scope*' //except for global scope
                if (scopeModule.name !== '*Global Scope*') { //except for global scope
                    //if result[0] isnt scopeModule.fileInfo.base
                    if (result[0] !== scopeModule.fileInfo.base) {
                        //result.unshift scopeModule.fileInfo.base
                        result.unshift(scopeModule.fileInfo.base);
                    };
                };
            };

            //return result.join('_')
            return result.join('_');
     };


//#### method addToAllMethodNames() 
     Names.Declaration.prototype.addToAllMethodNames = function(){

//For C production, we're declaring each distinct method name (verbs)

            //var methodName=.name
            var methodName = this.name;

            //if methodName not in coreSupportedMethods and not allMethodNames.has(methodName) 
            if (coreSupportedMethods.indexOf(methodName)===-1 && !(allMethodNames.has(methodName))) {
                //if allClassProperties.has(methodName)
                if (allClassProperties.has(methodName)) {
                    //.sayErr "Ambiguity: A property '#{methodName}' is already defined. Cannot reuse the symbol for a method."
                    this.sayErr("Ambiguity: A property '" + methodName + "' is already defined. Cannot reuse the symbol for a method.");
                    //allClassProperties.get(methodName).sayErr "Definition of property '#{methodName}'."
                    allClassProperties.get(methodName).sayErr("Definition of property '" + methodName + "'.");
                }
                else if (coreSupportedProps.indexOf(methodName)>=0) {
                //else if methodName in coreSupportedProps
                    //.sayErr "Ambiguity: A property '#{methodName}' is defined in core. Cannot reuse the symbol for a method."
                    this.sayErr("Ambiguity: A property '" + methodName + "' is defined in core. Cannot reuse the symbol for a method.");
                }
                else {

                //else
                    //allMethodNames.set methodName, this
                    allMethodNames.set(methodName, this);
                };
            };
     };



//### Append to class Grammar.TryCatch ###
    

      //method produce() 
      Grammar.TryCatch.prototype.produce = function(){

        //.out 'try{', .body, .exceptionBlock
        this.out('try{', this.body, this.exceptionBlock);
      };

//### Append to class Grammar.ExceptionBlock ###
    

      //method produce() 
      Grammar.ExceptionBlock.prototype.produce = function(){

        //.out NL,'}catch(',.catchVar,'){', .body, '}'
        this.out(NL, '}catch(', this.catchVar, '){', this.body, '}');

        //if .finallyBody
        if (this.finallyBody) {
            //.out NL,'finally{', .finallyBody, '}'
            this.out(NL, 'finally{', this.finallyBody, '}');
        };
      };


//### Append to class Grammar.CaseStatement ###
    

//##### method produce()
      Grammar.CaseStatement.prototype.produce = function(){

//if we have a varRef, is a case over a value

        //if .isInstanceof
        if (this.isInstanceof) {
            //return .produceInstanceOfLoop
            return this.produceInstanceOfLoop;
        };

//start "case-when", store expression in a tempVar

        //if .varRef
        if (this.varRef) {
            //var tmpVar=UniqueID.getVarName('case')
            var tmpVar = UniqueID.getVarName('case');
            //.out "var ",tmpVar,"=",.varRef,";",NL
            this.out("var ", tmpVar, "=", this.varRef, ";", NL);
        };

        //for each index,whenSection in .cases
        for( var index=0,whenSection ; index<this.cases.length ; index++){whenSection=this.cases[index];
        

            //.outLineAsComment switchCase.lineInx
            //.outSourceLineAsComment whenSection.sourceLineNum
            this.outSourceLineAsComment(whenSection.sourceLineNum);

            //.out '    ',index>0? 'else ' : '' 
            this.out('    ', index > 0 ? 'else ' : '');

            //if .varRef
            if (this.varRef) {
                //case foo...
                //.out 'if (', {pre:['__is(',tmpVar,','], CSL:whenSection.expressions, post:')', separator:'||'}
                this.out('if (', {pre: ['__is(', tmpVar, ','], CSL: whenSection.expressions, post: ')', separator: '||'});
            }
            else {
            //else
                //case when TRUE
                //.out 'if (', {pre:['('], CSL:whenSection.expressions, post:')', separator:'||'}
                this.out('if (', {pre: ['('], CSL: whenSection.expressions, post: ')', separator: '||'});
            };

            //.out 
                //'){',NL
                //'        ',whenSection.body,";", NL
                //'    }'
            this.out('){', NL, '        ', whenSection.body, ";", NL, '    }');
        };// end for each in this.cases

//else body

        //if .elseBody, .out NL,'else {',.elseBody,'}'
        if (this.elseBody) {this.out(NL, 'else {', this.elseBody, '}')};
      };


//##### method produceInstanceOfLoop
      Grammar.CaseStatement.prototype.produceInstanceOfLoop = function(){

        //var tmpVar=UniqueID.getVarName('class')
        var tmpVar = UniqueID.getVarName('class');
        //.out 
            //"Class_ptr ",tmpVar," = ",.varRef,".class;",NL
            //"while(",tmpVar,"){",NL
        this.out("Class_ptr ", tmpVar, " = ", this.varRef, ".class;", NL, "while(", tmpVar, "){", NL);

        //for each index,whenSection in .cases
        for( var index=0,whenSection ; index<this.cases.length ; index++){whenSection=this.cases[index];
        

            //.outLineAsComment switchCase.lineInx
            //.outSourceLineAsComment whenSection.sourceLineNum
            this.outSourceLineAsComment(whenSection.sourceLineNum);

            //whenSection.out 
                //index>0? 'else ' : '' 
                //'if (', {pre:['(',.varRef,'.class=='], CSL:whenSection.expressions, post:')', separator:'||'}
                //'){'
                //whenSection.body, NL
                //'break;',NL //exit while super loop
                //'}'
            whenSection.out(index > 0 ? 'else ' : '', 'if (', {pre: ['(', this.varRef, '.class=='], CSL: whenSection.expressions, post: ')', separator: '||'}, '){', whenSection.body, NL, 'break;', NL, '}');
        };// end for each in this.cases

        //end for
        

        //.out tmpVar,'=',tmpVar,'.super;',NL //move to super
        this.out(tmpVar, '=', tmpVar, '.super;', NL); //move to super
        //.out '}',NL //close while loooking for super
        this.out('}', NL); //close while loooking for super

//else body

        //if .elseBody, .out NL,'if(!tmpVar) {',.elseBody,'}'
        if (this.elseBody) {this.out(NL, 'if(!tmpVar) {', this.elseBody, '}')};
      };

//Example produced loop: /*

    //var __class1 = CLASSES[foo.class];
    //while(__class1) {
        //if (__class1==Grammar.ClassDeclaration.value.class){
            //declare foo:Grammar.ClassDeclaration;
            //...
        //}
        //else if (__class1==Grammar.AppendToDeclaration){
            //declare foo:Grammar.AppendToDeclaration
            //...
        //}
        //else if (__class1==Grammar.VarStatement){
            //declare foo:Grammar.VarStatement
            //...
        //}
        //__class1=CLASSES[__class1].super;
    //}
    //if (!__class1){ //default:
        //fail with "Unexpected class. foo is #{CLASSES[foo.class].name}"
    //}

//*/


//### Append to class Grammar.DebuggerStatement ###
    
      //method produce
      Grammar.DebuggerStatement.prototype.produce = function(){
        //.out "assert(0)"
        this.out("assert(0)");
      };

//### Append to class Grammar.YieldExpression ###
    

      //method produce()
      Grammar.YieldExpression.prototype.produce = function(){

//Check location

        //if no .getParent(Grammar.FunctionDeclaration) into var functionDeclaration 
        var functionDeclaration=undefined;
        if (!((functionDeclaration=this.getParent(Grammar.FunctionDeclaration))) || !functionDeclaration.hasAdjective('nice')) {
            //or no functionDeclaration.hasAdjective('nice')
                //.throwError '"yield" can only be used inside a "nice function/method"'
                this.throwError('"yield" can only be used inside a "nice function/method"');
        };

        //var yieldArr=[]
        var yieldArr = [];

        //var varRef = .fnCall.varRef
        var varRef = this.fnCall.varRef;
        //from .varRef calculate object owner and method name 

        //var thisValue='null'
        var thisValue = 'null';
        //var fnName = varRef.name #default if no accessors 
        var fnName = varRef.name;// #default if no accessors

        //if varRef.accessors
        if (varRef.accessors) {

            //var inx=varRef.accessors.length-1
            var inx = varRef.accessors.length - 1;
            //if varRef.accessors[inx] instance of Grammar.FunctionAccess
            if (varRef.accessors[inx] instanceof Grammar.FunctionAccess) {
                //var functionAccess = varRef.accessors[inx]
                var functionAccess = varRef.accessors[inx];
                //yieldArr = functionAccess.args
                yieldArr = functionAccess.args;
                //inx--
                inx--;
            };

            //if inx>=0 
            if (inx >= 0) {
                //if varRef.accessors[inx] isnt instance of Grammar.PropertyAccess
                if (!(varRef.accessors[inx] instanceof Grammar.PropertyAccess)) {
                    //.throwError 'yield needs a clear method name. Example: "yield until obj.method(10)". redefine yield parameter.'
                    this.throwError('yield needs a clear method name. Example: "yield until obj.method(10)". redefine yield parameter.');
                };

                //fnName = "'#{varRef.accessors[inx].name}'"
                fnName = "'" + (varRef.accessors[inx].name) + "'";
                //thisValue = [varRef.name]
                thisValue = [varRef.name];
                //thisValue = thisValue.concat(varRef.accessors.slice(0,inx))
                thisValue = thisValue.concat(varRef.accessors.slice(0, inx));
            };
        };


        //if .specifier is 'until'
        if (this.specifier === 'until') {

            //yieldArr.unshift fnName
            yieldArr.unshift(fnName);
            //yieldArr.unshift thisValue
            yieldArr.unshift(thisValue);
        }
        else {

        //else #parallel map

            //yieldArr.push "'map'",.arrExpression, thisValue, fnName
            yieldArr.push("'map'", this.arrExpression, thisValue, fnName);
        };


        //.out "yield [ ",{CSL:yieldArr}," ]"
        this.out("yield [ ", {CSL: yieldArr}, " ]");
      };



//# Helper functions 

//Utility 
//-------

    //var NL = '\n' # New Line constant
    var NL = '\n';// # New Line constant

//Operator Mapping
//================

//Many LiteScript operators can be easily mapped one-to-one with their JavaScript equivalents.

    //var OPER_TRANSLATION = 

      //'no':           '!'
      //'not':          '!'
      //'unary -':      '-'
      //'unary +':      '+'

      //'type of':      'typeof'
      //'instance of':  'instanceof'

      //'bitand':       '&'
      //'bitor':        '|'
      //'bitxor':       '^'
      //'bitnot':       '~'

      //'is':           '=='
      //'isnt':         '!='
      //'<>':           '!='
      //'and':          '&&'
      //'but':          '&&'
      //'or':           '||'
      //'has property': 'in'
    var OPER_TRANSLATION = {
       'no': '!'
       , 'not': '!'
       , 'unary -': '-'
       , 'unary +': '+'
       , 'type of': 'typeof'
       , 'instance of': 'instanceof'
       , 'bitand': '&'
       , 'bitor': '|'
       , 'bitxor': '^'
       , 'bitnot': '~'
       , 'is': '=='
       , 'isnt': '!='
       , '<>': '!='
       , 'and': '&&'
       , 'but': '&&'
       , 'or': '||'
       , 'has property': 'in'
   };


    //function operTranslate(name:string)
    function operTranslate(name){
      //return OPER_TRANSLATION.tryGetProperty(name) or name
      return OPER_TRANSLATION.tryGetProperty(name) || name;
    };

//---------------------------------

//### Append to class ASTBase
    
//Helper methods and properties, valid for all nodes

     //properties skipSemiColon 
     

//#### helper method assignIfUndefined(name,expression) 
     ASTBase.prototype.assignIfUndefined = function(name, expression){

          //.out "if(",name,'.class==&Undefined_CLASSINFO) ',name,"=",expression,";",NL
          //.out "_default(&",name,",",expression,");",NL
          this.out("_default(&", name, ",", expression, ");", NL);
     };
