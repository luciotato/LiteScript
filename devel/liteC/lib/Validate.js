//Compiled by LiteScript compiler v0.7.0, source: /home/ltato/LiteScript/devel/source-v0.8/Validate.lite.md
// Name Validation
// ===============

// This module contains helper functions to manage variable,
// function and object property name declaration.

// This module purpose is to make the compiler catch
// mistyped variable and property names at compile time
// (instead of YOU spending hours to debug a subtle bug at run time)

// In order to do name validation we need to construct the scope tree,
// and also register all valid members of all "types" (objects).

// ----------
// ##Dependencies:

// This module extends Grammar classes, adding 'declare', 'evaluateAssignments', etc.
// methods to validate var & property names.

   // import
   var ASTBase = require('./ASTBase.js');
   var Grammar = require('./Grammar.js');
   var Names = require('./Names.js');
   var Environment = require('./lib/Environment.js');

   // import logger, UniqueID, Strings
   var logger = require('./lib/logger.js');
   var UniqueID = require('./lib/UniqueID.js');
   var Strings = require('./lib/Strings.js');

   // shim import LiteCore, Map
   var LiteCore = require('./LiteCore.js');
   var Map = require('./lib/Map.js');


// ---------
// Module vars:

   var project = undefined;

   var globalScope = undefined;

   var nameAffinity = undefined;


// ##Members & Scope

// A Names.Declaration have a `.members=Map string to NamedDeclaration` property
// `.members={}` is a map to other `Names.Declaration`s which are valid members of this name.

// A 'scope' is a Names.Declaration whose members are the declared vars in the scope.

// For Example: 'console' is stored at 'Global Scope' and has '.log' and '.error' as members

// Project
// |_
   // scope = {
     // name: 'global scope'
     // members: {
        // console: {
          // name:'console'
          // type: Object
          // members:
              // log:
                // name:'log'
                // type: Function
              // error:
                // name: 'error'
                // type: Function
          // }
     // }


// 'Scopes' are created only for certain AST nodes, such as:
// Module, FunctionDeclaration, ForStatement, Catch/Exception, etc.

// Variables in the scope
// ----------------------
// Referenced vars must be in the scope . You are required to explicitly declare your variables
// so you're **unable** to create a global variable by mistipying a name in an assignment.
// The compiler will catch such a misstype as "undeclared variable".

// Object properties access
// ------------------------
// Object properties access are another source of subtle bugs in any medium to large javascript project.
// The problem is a mistyped property name results in the property not being found
// in the object nor the prototype chain, and javascript in this case just returns "undefined"
// and goes on. This causes hard to find subtle bugs.

// Example: The following javascript code, **will probably need debugging.**

  // options = options || {};
  // if (options.importantCodeDefaultTrue===undefined) options.importantCodeDefaultTrue=true;
  // if (options.anotherOptionDefaultZero===undefined) options.anotherOptionDefaultZero=0;

  // initFunction(options);
  // prepareDom(options);
  // if (options.importantCodesDefaultTrue) { moreInit(); subtleDomChanges(); }

// The same LiteScript code, but the mistake **will be caught by the compiler**
// The compiler will emit an error during compilation, -no debugging required-.

  // options = options or {}
  // if options.importantCodeDefaultTrue is undefined, options.importantCodeDefaultTrue=true
  // if options.anotherOptionDefaultZero is undefined, options.anotherOptionDefaultZero=0;

  // initFunction options
  // prepareDom options
  // if options.importantCodesDefaultTrue then moreInit(); subtleDomChanges()

// In order to completely check property names, a full type system is neeeded.

// LiteScript, based in js, *is not typed*, but you can add "type annotations"
// to your variable declaration, in order to declare the list of valid members
// to check at compile time.

// The compiler will guess var types from creation, assignment
// and by name affinity. If type cannot be guessed you can also explicitily use a
// `declare on myObj prop1,prop2` statement to dismiss the 'UNDECLARED PROPERTY' warnings.

// Example:
//   class ClassA
//     properties
//       classAProp1, classAProp2
//     method methodA
//       this.classAProp1 = 11
//       this.classAProp2 = 12
//   class ClassB
//     properties
//       classBProp1, classBProp2
//     method methodB
//       this.classBProp1 = 21
//   var instanceB = new ClassB // implicit type
//   instanceB.classBprop1 = 5 // <-- this **will be caught** as "case mismatch" since classBprop1 is defined as classBProp1
//   var bObj = instanceB // simple assignment, implicit type
//   bObj.classAProp1 = 5 // <-- this **will be caught** as: object 'bObj' has no property 'classAProp1'
//   var xObj = callToFn() // unknown type
//   xObj.classBProp1 = 5 // <-- this trigger a "classBProp1 IS NOT A DECLARED PROPERTY OF xObj"
//   declare on xObj  // <-- this fixes it
//     classBProp1
//   xObj.classBProp1 = 5 // <-- this is OK now
//   var xObj:ClassB = callToFn() // type annotation, this also fixes it
//   bObj.classBProp1 = 5 // <-- this is ok


   // export function validate()
   function validate(){

// We start this module once the entire multi-node AST tree has been parsed.

// Start running passes on the AST

// #### Pass 1.0 Declarations
// Walk the tree, and call function 'declare' on every node having it.
// 'declare' will create scopes, and vars in the scope.
// May inform 'DUPLICATES' and 'CASE MISMATCH' errors.

       logger.info("- Process Declarations");
       walkAllNodesCalling('declare');

// #### Pass 1.1 Declare By Assignment
// Walk the tree, and check assignments looking for: 'module.exports.x=x' and 'x.prototype.y = '.
// Treat them as declarations.
//         logger.info "- Declare By Assignment (support .js syntax, .exports.x=..., .prototype.x=...)"
//         walkAllNodesCalling 'declareByAssignment'

// #### Pass 1.2 connectImportRequire
// handle: `import x` and `global declare x`
// Make var x point to imported module 'x' exports

        // declare valid project.moduleCache

       logger.info("- Connect Imported");
       // for each moduleNode:Grammar.Module in map project.moduleCache
       var moduleNode=undefined;
       if(!project.moduleCache.dict) throw(new Error("for each in map: not a Map, no .dict property"));
       for ( var moduleNode__propName in project.moduleCache.dict) if (project.moduleCache.dict.hasOwnProperty(moduleNode__propName)){moduleNode=project.moduleCache.dict[moduleNode__propName];
         {

         // for each node in moduleNode.requireCallNodes
         for( var node__inx=0,node ; node__inx<moduleNode.requireCallNodes.length ; node__inx++){node=moduleNode.requireCallNodes[node__inx];

            // declare valid node.importedModule.exports.members

           // if node.importedModule
           if (node.importedModule) {

             var parent = undefined;
             var referenceNameDecl = undefined; //var where to import exported module members

              // declare valid parent.nameDecl


// 1st, more common: if node is Grammar.ImportStatementItem

             // if node instance of Grammar.ImportStatementItem
             if (node instanceof Grammar.ImportStatementItem) {
                  // declare node:Grammar.ImportStatementItem
                 referenceNameDecl = node.nameDecl;

// if we process a 'global declare' command (interface)
// all exported should go to the global scope.

// If the imported module exports a class, e.g.: "export default class OptionsParser",
// 'importedModule.exports' points to the class 'prototype'.

                 // if node.getParent(Grammar.DeclareStatement) isnt undefined //is a "global declare"
                 if (node.getParent(Grammar.DeclareStatement) !== undefined) { //is a "global declare"
                       var moveWhat = node.importedModule.exports;
                        // #if the module exports a "class-function", move to global with class name
                       // if moveWhat.findOwnMember('prototype') into var protoExportNameDecl
                       var protoExportNameDecl=undefined;
                       if ((protoExportNameDecl=moveWhat.findOwnMember('prototype'))) {
                            //if it has a 'prototype'
                            //replace 'prototype' (on module.exports) with the class name, and add as the class
                           protoExportNameDecl.name = protoExportNameDecl.parent.name;
                           project.rootModule.addToScope(protoExportNameDecl);
                       }
                       
                       else {
                            // a "declare global x", but "x.lite.md" do not export a class
                            // move all exported (namespace members) to global scope
                           // for each nameDecl in map moveWhat.members
                           var nameDecl=undefined;
                           if(!moveWhat.members.dict) throw(new Error("for each in map: not a Map, no .dict property"));
                           for ( var nameDecl__propName in moveWhat.members.dict) if (moveWhat.members.dict.hasOwnProperty(nameDecl__propName)){nameDecl=moveWhat.members.dict[nameDecl__propName];
                               {
                               project.rootModule.addToScope(nameDecl);
                               }
                               
                               }// end for each property
                           
                       };

                        //we moved all to the global scope, e.g.:"declare global jQuery" do not assign to referenceNameDecl
                       referenceNameDecl = undefined;
                 };
             };

// else is a "require" call (VariableRef).
// Get parent node.
//               else
//                   parent = node.parent
//                   if parent instance of Grammar.Operand
//                      parent = node.parent.parent.parent # varRef->operand->Expression->Expression Parent
// get referece where import module is being assigned to
//                   if parent instance of Grammar.AssignmentStatement
//                       var opt = new Names.NameDeclOptions
//                       opt.informError = true
//                       declare valid parent.lvalue.tryGetReference
//                       referenceNameDecl = parent.lvalue.tryGetReference(opt)
//                   else if parent instance of Grammar.VariableDecl
//                       referenceNameDecl = parent.nameDecl
//               end if

// After determining referenceNameDecl where imported items go,
// make referenceNameDecl point to importedModule.exports

             // if referenceNameDecl
             if (referenceNameDecl) {
                 referenceNameDecl.makePointTo(node.importedModule.exports);
                  // if it has a 'prototype' => it's a Function-Class
                  // else we assume all exported from module is a namespace
                 referenceNameDecl.isNamespace = !referenceNameDecl.findOwnMember('prototype');
             };
           };
         };// end for each in moduleNode.requireCallNodes
         
         }
         
         }// end for each property


// #### Pass 1.3 Process "Append To" Declarations
// Since 'append to [class|object] x.y.z' statement can add to any object, we delay
// "Append To" declaration to this point, where 'x.y.z' can be analyzed and a reference obtained.
// Walk the tree, and check "Append To" Methods & Properties Declarations

       logger.info("- Processing Append-To, extends");
       walkAllNodesCalling('processAppendToExtends');


// #### Pass 2.0 Apply Name Affinity

       logger.info("- Apply Name Affinity");

        // #first, try to assign type by "name affinity"
        // #(only applies when type is not specified)
       // for each nameDecl in Names.allNameDeclarations
       for( var nameDecl__inx=0,nameDecl ; nameDecl__inx<Names.allNameDeclarations.length ; nameDecl__inx++){nameDecl=Names.allNameDeclarations[nameDecl__inx];
           nameDecl.assignTypebyNameAffinity();
       };// end for each in Names.allNameDeclarations

// #### Pass 2.1 Convert Types
// for each Names.Declaration try to find the declared 'type' (string) in the scope.
// Repeat until no conversions can be made.

       logger.info("- Converting Types");

        // #now try de-referencing types
       var 
       pass = 0, 
       sumConverted = 0, 
       sumFailures = 0, 
       lastSumFailures = 0
       ;
        // #repeat until all converted
       // do
       do{

           lastSumFailures = sumFailures;
           sumFailures = 0;
           sumConverted = 0;

            // #process all, sum conversion failures
           // for each nameDecl in Names.allNameDeclarations
           for( var nameDecl__inx=0,nameDecl ; nameDecl__inx<Names.allNameDeclarations.length ; nameDecl__inx++){nameDecl=Names.allNameDeclarations[nameDecl__inx];
               var result = nameDecl.processConvertTypes();
               sumFailures += result.failures;
               sumConverted += result.converted;
           };// end for each in Names.allNameDeclarations
           // end for

           pass++;
       } while (!(sumFailures === lastSumFailures));// end loop

// Inform unconverted types as errors

       // if sumFailures #there was failures, inform al errors
       if (sumFailures) {// #there was failures, inform al errors
           var opt = new Names.NameDeclOptions();
           opt.informError = true;
           // for each nameDecl in Names.allNameDeclarations
           for( var nameDecl__inx=0,nameDecl ; nameDecl__inx<Names.allNameDeclarations.length ; nameDecl__inx++){nameDecl=Names.allNameDeclarations[nameDecl__inx];
               nameDecl.processConvertTypes(opt);
           };// end for each in Names.allNameDeclarations
           
       };

// #### Pass 3 Evaluate Assignments
// Walk the scope tree, and for each assignment,
// IF L-value has no type, try to guess from R-value's result type

       logger.info("- Evaluating Assignments");
       walkAllNodesCalling('evaluateAssignments');

// #### Pass 4 -Final- Validate Property Access
// Once we have all vars declared and typed, walk the AST,
// and for each VariableRef validate property access.
// May inform 'UNDECLARED PROPERTY'.

       logger.info("- Validating Property Access");
       walkAllNodesCalling('validatePropertyAccess');

// Inform forward declarations not fulfilled, as errors

       // for each nameDecl in Names.allNameDeclarations
       for( var nameDecl__inx=0,nameDecl ; nameDecl__inx<Names.allNameDeclarations.length ; nameDecl__inx++){nameDecl=Names.allNameDeclarations[nameDecl__inx];

           // if nameDecl.isForward and not nameDecl.isDummy
           if (nameDecl.isForward && !(nameDecl.isDummy)) {

               nameDecl.warn("forward declared, but never found");
               var container = nameDecl.nodeDeclared.getParent(Grammar.ClassDeclaration);
               // if container
               if (container) {
                  // declare container:Grammar.ClassDeclaration
                  // declare valid container.varRef.toString
                 // if container.varRef, logger.warning "#{container.positionText()} more info: '#{nameDecl.name}' of '#{container.varRef.toString()}'"
                 if (container.varRef) {logger.warning("" + (container.positionText()) + " more info: '" + nameDecl.name + "' of '" + (container.varRef.toString()) + "'")};
               };
           };
       };// end for each in Names.allNameDeclarations
       
   };
   // export
   module.exports.validate=validate;

   // end function validate

   // export function walkAllNodesCalling(methodName:string)
   function walkAllNodesCalling(methodName){

       var methodSymbol = undefined;
       methodSymbol = LiteCore.getSymbol(methodName);

// For all modules, for each node, if the specific AST node has methodName, call it

       // for each moduleNode:Grammar.Module in map project.moduleCache
       var moduleNode=undefined;
       if(!project.moduleCache.dict) throw(new Error("for each in map: not a Map, no .dict property"));
       for ( var moduleNode__propName in project.moduleCache.dict) if (project.moduleCache.dict.hasOwnProperty(moduleNode__propName)){moduleNode=project.moduleCache.dict[moduleNode__propName];
           {
           moduleNode.callOnSubTree(methodSymbol);
           }
           
           }// end for each property
       
   };
   // export
   module.exports.walkAllNodesCalling=walkAllNodesCalling;


   // export function initialize(aProject)
   function initialize(aProject){

// Initialize module vars

       project = aProject;

        // #clear global Names.Declaration list
       Names.allNameDeclarations = [];

// initialize NameAffinity

       var options = new Names.NameDeclOptions();
       options.normalizeModeKeepFirstCase = true;// #nameAffinity members are stored: [0].Toupper()+slice(1).toLower()
       nameAffinity = new Names.Declaration('Name Affinity', options);// # project-wide name affinity for classes

        //populateGlobalScope(aProject)

// The "scope" of rootNode is the global scope.

       globalScope = project.rootModule.createScope();

// Initialize global scope
// a)non-instance values

       globalScope.addMember('undefined');
       var opt = new Names.NameDeclOptions();
       opt.value = null;
       globalScope.addMember('null', opt);
       opt.value = true;
       globalScope.addMember('true', opt);
       opt.value = false;
       globalScope.addMember('false', opt);
       opt.value = NaN;
       globalScope.addMember('NaN', opt);
       opt.value = Infinity;
       globalScope.addMember('Infinity', opt);

// b) pre-create core classes, to allow the interface.md file to declare property types and return values

       AddGlobalClasses('Object', 'Function', 'Array', 'String', 'Number', 'Date', 'Boolean');

// note: 'Map' and 'NameValuePair' are declared at GlobalScopeX.interface.md


// b) create special types

// b.1) arguments:any*

// "arguments:any*" - arguments, type: pointer to any

// 'arguments' is a local var to all functions, representing a pseudo-array witj all the arguments.
// 'arguments' has only one method: `arguments.toArray()`

// we declare here the type:"pointer to any" - "any*"

       var argumentsType = globalScope.addMember('any*'); //  any pointer, type for "arguments"
       opt.value = undefined;
       opt.type = globalPrototype('Function');
       opt.returnType = globalPrototype('Array');
       argumentsType.addMember('toArray', opt);

// b.2) Lite-C: the Lexer replaces string interpolation with calls to `__concatAny`

       opt.returnType = globalPrototype('String');
       globalScope.addMember('_concatAny', opt); //used for string interpolation

       opt.returnType = undefined;
       globalScope.addMember('parseFloat', opt); //used for string interpolation
       globalScope.addMember('parseInt', opt); //used for string interpolation

        //var core = globalScope.addMember('LiteCore') //core supports
        //core.isNamespace = true
        //opt.returnType='Number'
        //core.addMember 'getSymbol',opt //to get a symbol (int) from a symbol name (string)

// b.3) "any" default type for vars

       globalScope.addMember('any'); // used for "map string to any" - Dictionaries

// Process the global scope declarations interface file: GlobalScopeJS.interface.md

       var globalInterfaceFile = '' + (process.cwd()) + '/lib/GlobalScope' + (project.options.target.toUpperCase());
       logger.msg("Declare global scope using ", globalInterfaceFile);
       var globalInterfaceModule = project.compileFile(globalInterfaceFile);

// For the globalInterfaceModule, which have parsed GlobalScopeJS.interface.md file
// we call "declare" on all nodes, create the Names.Declaration

       var methodSymbol = LiteCore.getSymbol('declare');

// calll "declare" on each item of the GlobalScope interface file, to create the NameDeclarations

       globalInterfaceModule.callOnSubTree(methodSymbol);

// move all exported from the interface file, to project.rootModule global scope

       // for each nameDecl in map globalInterfaceModule.exports.members
       var nameDecl=undefined;
       if(!globalInterfaceModule.exports.members.dict) throw(new Error("for each in map: not a Map, no .dict property"));
       for ( var nameDecl__propName in globalInterfaceModule.exports.members.dict) if (globalInterfaceModule.exports.members.dict.hasOwnProperty(nameDecl__propName)){nameDecl=globalInterfaceModule.exports.members.dict[nameDecl__propName];
           {
           project.rootModule.addToSpecificScope(globalScope, nameDecl);
           }
           
           }// end for each property

// Initial NameAffinity, err|xxxErr => type:Error

       // if tryGetGlobalPrototype('Error') into var errProto:Names.Declaration
       var errProto=undefined;
       if ((errProto=tryGetGlobalPrototype('Error'))) {
           nameAffinity.members.set('Err', errProto.parent); // err|xxxErr => type:Error
       };
   };
   // export
   module.exports.initialize=initialize;


// ### export function populateGlobalScope(aProject)
// This method prepares a default global scope for a project
// global scope starts populated with most common js built-in objects
// Populate the global scope
//         globalScope.addMember 'setTimeout'
//         globalScope.addMember 'clearTimeout'
//         globalScope.addMember 'setInterval'
//         globalScope.addMember 'clearInterval'
//         globalScope.addMember 'undefined',{value:undefined}
//         globalScope.addMember 'null',{value:null}
//         globalScope.addMember 'true',{value:true}
//         globalScope.addMember 'false',{value:false}
//         globalScope.addMember 'NaN',{value:NaN}
//         var objProto = addBuiltInClass('Object') #first: Object. Order is important
//         objProto.addMember('__proto__')
//         #ifndef PROD_C
//         objProto.ownMember("constructor").addMember('name')
//         #endif
//         var functionProto = addBuiltInClass('Function') #second: Function. Order is important
//         functionProto.addMember('initInstance',{type:functionProto}) #unified way to call Class Initialization function
//         #Function is declared here so ':function' type properties (methods) of "Array" or "String"
//         #can be properly typified
//         var stringProto = addBuiltInClass('String')
//         var arrayProto = addBuiltInClass('Array')
//         #state that String.split returns string array
//         stringProto.ownMember("split").setMember '**return type**', arrayProto
//         #state that Obj.toString returns string:
//         objProto.ownMember("tostring").setMember '**return type**', stringProto
//         // int equals 'number'
//         globalScope.addMember 'int'
//         addBuiltInObject 'Boolean'
//         addBuiltInObject 'Number'
//         addBuiltInObject 'Date'
//         addBuiltInObject 'RegExp'
//         addBuiltInObject 'JSON'
//         var ErrProto = addBuiltInClass('Error')
//         ErrProto.addMember 'stack'
//         ErrProto.addMember 'code'
//         addBuiltInObject 'Math'
//         // "arguments" is a local var to any function, with only a method: arguments.toArray()
//         var argumentsType = globalScope.addMember('any*') //  any pointer, type for "arguments"
//         argumentsType.addMember('length') //
//         argumentsType.addMember('toArray',{type:functionProto, returnType:arrayProto}) //
//         globalScope.addMember("liteC_getSymbol",{type:functionProto})
//         globalScope.addMember("liteC_tryGetMethod",{type:functionProto})
//         globalScope.addMember("liteC_getMethod",{type:functionProto})
//         #ifdef PROD_C
//         var anyType = globalScope.addMember('any') // all vars and props are type:any - see LiteC core, any.h
//         var anyTypeProto = anyType.addMember('prototype')
//         anyTypeProto.addMember 'constructor',{type:"any"} //hack, constructor = typeID
//         anyTypeProto.addMember 'length',{type:"int"} //hack convert property 'length' to a fn call length(this)
//         var MapType = globalScope.addMember('Map',{type:functionProto}) // Map is like a js-ES6 Map. Should be used to have dyn props
//         var MapProto = MapType.addMember('prototype')
//         MapProto.addMember 'get',{type:functionProto, returnType:anyTypeProto}
//         MapProto.addMember 'set',{type:functionProto, returnType:anyTypeProto}
//         MapProto.addMember 'has',{type:functionProto, returnType:anyTypeProto}
//         MapProto.addMember 'keys',{type:functionProto, returnType:arrayProto}
//         globalScope.addMember '_concatAny',{type:functionProto} //used for string interpolation
//         //console is a namespace in Lite-C
//         addBuiltInObject 'console'
//         globalScope.findOwnMember('console').isNamespace = true
//         #endif
// if we're not compiling for the browser, add 'process'
//         if not project.options.browser
//             var proc = globalScope.addMember('process') // node "process" global var emulation
//             proc.isNamespace = true
//             proc.addMember('exit',{type:functionProto})
//             proc.addMember('cwd',{type:functionProto})
//             proc.addMember('argv',{type:arrayProto})
//             if project.options.target is 'js'
//                 #node.js
//                 globalScope.addMember 'global',{type:globalScope}
//                 globalScope.addMember 'require'
//             end if
//         end if

// ----------
// ----------

// ## Module Helper Functions

   // helper function tryGetGlobalPrototype(name)
   function tryGetGlobalPrototype(name){
// gets a var from global scope

     // if globalScope.findOwnMember(name) into var nameDecl
     var nameDecl=undefined;
     if ((nameDecl=globalScope.findOwnMember(name))) {
         return nameDecl.members.get("prototype");
     };
   };

   // helper function globalPrototype(name)
   function globalPrototype(name){
// gets a var from global scope

     // if name instanceof Names.Declaration, return name #already converted type
     if (name instanceof Names.Declaration) {return name};

     // if not globalScope.findOwnMember(name) into var nameDecl
     var nameDecl=undefined;
     if (!((nameDecl=globalScope.findOwnMember(name)))) {
       // fail with "no '#{name}' in global scope"
       throw new Error("no '" + name + "' in global scope");
     };

     // if no nameDecl.findOwnMember("prototype") into var protoNameDecl
     var protoNameDecl=undefined;
     if (!((protoNameDecl=nameDecl.findOwnMember("prototype")))) {
       // fail with "global scope type '#{name}' must have a 'prototype' property"
       throw new Error("global scope type '" + name + "' must have a 'prototype' property");
     };

     return protoNameDecl;
   };


   // helper function addBuiltInClass(name,node) returns Names.Declaration
   function addBuiltInClass(name, node){
// Add a built-in class to global scope, return class prototype

     var nameDecl = new Names.Declaration(name, new Map().fromObject({isBuiltIn: true}), node);
     globalScope.addMember(nameDecl);

     nameDecl.getMembersFromObjProperties(Environment.getGlobalObject(name));

     // if no nameDecl.findOwnMember("prototype") into var classProto:Names.Declaration
     var classProto=undefined;
     if (!((classProto=nameDecl.findOwnMember("prototype")))) {
         // throw("addBuiltInClass '#{name}, expected to have a prototype")
         throw ("addBuiltInClass '" + name + ", expected to have a prototype");
     };

     nameDecl.setMember('**proto**', globalPrototype('Function'));
      // commented v0.8: classes can not be used as functions.
      // nameDecl.setMember '**return type**', classProto

     return classProto;
   };


   // helper function addBuiltInObject(name,node) returns Names.Declaration
   function addBuiltInObject(name, node){
// Add a built-in object to global scope, return object

     var nameDecl = new Names.Declaration(name, new Map().fromObject({isBuiltIn: true}), node);
     globalScope.addMember(nameDecl);
     nameDecl.getMembersFromObjProperties(Environment.getGlobalObject(name));

     // if nameDecl.findOwnMember("prototype")
     if (nameDecl.findOwnMember("prototype")) {
         // throw("addBuiltObject '#{name}, expected *Object* to have not a prototype")
         throw ("addBuiltObject '" + name + ", expected *Object* to have not a prototype");
     };

     return nameDecl;
   };

// ---------------------------------------
// ----------------------------------------
// ----------------------------------------

   // append to namespace Names

     // class ConvertResult
     // constructor
     function ConvertResult(){ // default constructor
        // properties
          // converted:number=0
          // failures:number=0
           this.converted=0;
           this.failures=0;
     };
     Names.ConvertResult=ConvertResult;
     
     // end class ConvertResult
     

// ##Additions to Names.Declaration. Helper methods to do validation

   // append to class Names.Declaration

    // helper method findMember(name) returns Names.Declaration
    Names.Declaration.prototype.findMember = function(name){
// this method looks for a name in Names.Declaration members,
// it also follows the **proto** chain (same mechanism as js __proto__ chain)

       var actual = this;
       var count = 0;

       // do while actual instance of Names.Declaration
       while(actual instanceof Names.Declaration){

           // if actual.findOwnMember(name) into var result
           var result=undefined;
           if ((result=actual.findOwnMember(name))) {
              return result;
           };

// We use a member named '**proto**' on NameDeclarations, mapping run-time proto chain.
// We follow the chain to validate property names.

           var nextInChain = actual.findOwnMember('**proto**');

// As last option in the chain, we always use 'Object.prototype'

           // if no nextInChain and actual isnt globalPrototype('Object')
           if (!nextInChain && actual !== globalPrototype('Object')) {
             nextInChain = globalPrototype('Object');
           };

           actual = nextInChain;

           // if count++ > 50 #assume circular
           if (count++ > 50) {// #assume circular
               this.warn("circular type reference");
               return;
           };
       };// end loop
       
    };


    // helper method isInstanceof(name) returns boolean
    Names.Declaration.prototype.isInstanceof = function(name){
// this method looks for a name in Names.Declaration members **proto**->prototpye->parent
// it also follows the **proto** chain (same mechanism as js __proto__ chain)

       var actual = this;
       var count = 0;

       // do while actual instance of Names.Declaration
       while(actual instanceof Names.Declaration){

           // if actual.name is 'prototype' and actual.parent.name is name
           if (actual.name === 'prototype' && actual.parent.name === name) {
               return true;
           };

// We use a member named '**proto**' on NameDeclarations, mapping run-time proto chain.
// We follow the chain to validate property names.

           var nextInChain = actual.findOwnMember('**proto**');

// As last option in the chain, we always use 'Object.prototype'

           // if no nextInChain and actual isnt globalPrototype('Object')
           if (!nextInChain && actual !== globalPrototype('Object')) {
               nextInChain = globalPrototype('Object');
           };

           actual = nextInChain;

           // if count++ > 50 #assume circular
           if (count++ > 50) {// #assume circular
               this.warn("circular type reference");
               return;
           };
       };// end loop
       
    };

    // helper method getMembersFromObjProperties(obj) #Recursive
    Names.Declaration.prototype.getMembersFromObjProperties = function(obj){// #Recursive
// Recursively converts a obj properties in NameDeclarations.
// it's used when a pure.js module is imported by 'require'
// to convert required 'exports' to LiteScript compiler usable NameDeclarations
// Also to load the global scope with built-in objects

        //ifdef PROD_C
       return;
    };
        //else
        //var newMember:Names.Declaration

        //if obj instanceof Object or obj is Object.prototype

            //for each prop in Object.getOwnPropertyNames(obj) #even not enumerables
                //where prop not in ['__proto__','arguments','caller'] #exclude __proto__

                    //var type =  Grammar.autoCapitalizeCoreClasses(typeof obj[prop])
                    //type = tryGetGlobalPrototype(type) #core classes: Function, Object, String
                    //if type is this, type = undefined #avoid circular references

                    //newMember = .addMember(prop,{type:type})

//on 'prototype' member or
//if member is a Function-class - dive into

                    //declare valid Object.hasOwnProperty.call
                    //if prop isnt 'constructor'
                        //if  prop is 'prototype'
                            //or (typeof obj[prop] is 'function'
                                //and obj[prop].hasOwnProperty('prototype')
                                //and not .isInParents(prop)
                               //)
                            //or (typeof obj[prop] is 'object'
                                //and not .isInParents(prop)
                               //)
                              //newMember.getMembersFromObjProperties(obj[prop]) #recursive
                              //if prop is 'super_' # used in node's core modules: http, EventEmitter, etc.
                                  //if newMember.findOwnMember('prototype') into var superProtopNameDecl
                                    //var protopNameDecl = .findOwnMember('prototype') or .addMember('prototype')
                                    //protopNameDecl.setMember '**proto**', superProtopNameDecl #put super's proto in **proto** of prototype

        //end if



    // helper method isInParents(name)
    Names.Declaration.prototype.isInParents = function(name){
// return true if a property name is in the parent chain.
// Used to avoid recursing circular properties

       var nameDecl = this.parent;
       // while nameDecl
       while(nameDecl){
         // if nameDecl.findOwnMember(name), return true
         if (nameDecl.findOwnMember(name)) {return true};
         nameDecl = nameDecl.parent;
       };// end loop
       
    };


    // helper method processConvertTypes(options) returns Names.ConvertResult
    Names.Declaration.prototype.processConvertTypes = function(options){
// convert possible types stored in Names.Declaration,
// from string/varRef to other NameDeclarations in the scope

       var result = new Names.ConvertResult();

       this.convertType('**proto**', result, options);// #try convert main type
       this.convertType('**return type**', result, options);// #a Function can have **return type**
       this.convertType('**item type**', result, options);// #an Array can have **item type** e.g.: 'var list: string array'

       return result;
    };


    // helper method convertType(internalName, result: Names.ConvertResult, options: Names.NameDeclOptions)
    Names.Declaration.prototype.convertType = function(internalName, result, options){
// convert type from string to NameDeclarations in the scope.
// returns 'true' if converted, 'false' if it has to be tried later

       // if no .findOwnMember(internalName) into var typeRef
       var typeRef=undefined;
       if (!((typeRef=this.findOwnMember(internalName)))) {
            // #nothing to process
           return;
       };

       // if typeRef instance of Names.Declaration
       if (typeRef instanceof Names.Declaration) {
            // #already converted, nothing to do
           return;
       };

       var converted = undefined;

        // # if the typeRef is a varRef, get reference
       // if typeRef instanceof Grammar.VariableRef
       if (typeRef instanceof Grammar.VariableRef) {
            // declare typeRef:Grammar.VariableRef
           converted = typeRef.tryGetReference();
       }
       
       else if (typeof typeRef === 'string') {// #built-in class or local var

           // if no .nodeDeclared #converting typeRef for a var not declared in code
           if (!this.nodeDeclared) {// #converting typeRef for a var not declared in code
             converted = globalPrototype(typeRef);
           }
           
           else {
             converted = this.nodeDeclared.findInScope(typeRef);
           };
           // end if
           
       }
       
       else {
            // declare valid typeRef.constructor.name
           this.sayErr("INTERNAL ERROR: convertType UNRECOGNIZED type of:'" + (typeof typeRef) + "' on " + internalName + ": '" + typeRef + "' [" + typeRef.constructor.name + "]");
           return;
       };

       // end if #check instance of "typeRef"


       // if converted
       if (converted) {
            // #move to prototype if referenced is a class
           // if converted.findOwnMember("prototype") into var prototypeNameDecl
           var prototypeNameDecl=undefined;
           if ((prototypeNameDecl=converted.findOwnMember("prototype"))) {
               converted = prototypeNameDecl;
           };
            // #store converted
           this.setMember(internalName, converted);
           result.converted++;
       }
       
       else {
           result.failures++;
           // if options and options.informError, .sayErr "Undeclared type: '#{typeRef.toString()}'"
           if (options && options.informError) {this.sayErr("Undeclared type: '" + (typeRef.toString()) + "'")};
       };
       // end if

       return;
    };


    // helper method assignTypeFromValue(value)
    Names.Declaration.prototype.assignTypeFromValue = function(value){
// if we can determine assigned value type, set var type

      // declare valid value.getResultType
     var valueNameDecl = value.getResultType();

// now set var type (unless is "null" or "undefined", because they destroy type info)

     // if valueNameDecl instance of Names.Declaration
     if (valueNameDecl instanceof Names.Declaration && ["undefined", "null"].indexOf(valueNameDecl.name)===-1) {

           var theType = undefined;
           // if valueNameDecl.name is 'prototype' # getResultType returns a class prototype
           if (valueNameDecl.name === 'prototype') {// # getResultType returns a class prototype
                // use the class as type
               theType = valueNameDecl;
           }
                // use the class as type
           
           else {
                //we assume valueNameDecl is a simple var, then we try to get **proto**
               theType = valueNameDecl.findOwnMember('**proto**') || valueNameDecl;
           };
           // end if

            // assign type: now both nameDecls points to same type
           this.setMember('**proto**', theType);
     };
    };



    // helper method assignTypebyNameAffinity()
    Names.Declaration.prototype.assignTypebyNameAffinity = function(){
// Auto-assign type by name affinity.
// If no type specified, check project.nameAffinity

       // if .nodeDeclared and not Strings.isCapitalized(.name) and .name isnt 'prototype'
       if (this.nodeDeclared && !(Strings.isCapitalized(this.name)) && this.name !== 'prototype') {

           // if not .findOwnMember('**proto**')
           if (!(this.findOwnMember('**proto**'))) {

               var possibleClassRef = undefined;
                // # possibleClassRef is a Names.Declaration whose .nodeDeclared is a ClassDeclaration

                // #should look as className. Also when searching with "endsWith",
                // # nameAffinity declarations are stored capitalized
               var asClassName = this.name.capitalized();

                // # look in name affinity map
               // if no nameAffinity.members.get(.name) into possibleClassRef
               if (!((possibleClassRef=nameAffinity.members.get(this.name)))) {
                    // # make first letter uppercase, e.g.: convert 'lexer' to 'Lexer'
                    // # try with name, 1st letter capitalized
                   possibleClassRef = nameAffinity.members.get(asClassName);
               };
               // end if

                // # check 'ends with' if name is at least 6 chars in length
               // if not possibleClassRef and .name.length>=6
               if (!(possibleClassRef) && this.name.length >= 6) {
                   // for each affinityName,classRef in map nameAffinity.members
                   var classRef=undefined;
                   if(!nameAffinity.members.dict) throw(new Error("for each in map: not a Map, no .dict property"));
                   for ( var affinityName in nameAffinity.members.dict) if (nameAffinity.members.dict.hasOwnProperty(affinityName)){classRef=nameAffinity.members.dict[affinityName];
                       {
                       // if asClassName.endsWith(affinityName)
                       if (asClassName.endsWith(affinityName)) {
                           possibleClassRef = classRef;
                           // break
                           break;
                       };
                       }
                       
                       }// end for each property
                   
               };

                // #if there is a candidate class, check of it has a defined prototype
               // if possibleClassRef and possibleClassRef.findOwnMember("prototype") into var prototypeNameDecl
               var prototypeNameDecl=undefined;
               if (possibleClassRef && (prototypeNameDecl=possibleClassRef.findOwnMember("prototype"))) {
                     this.setMember('**proto**', prototypeNameDecl);
                     return true;
               };
           };
       };
    };


// --------------------------------
// ## Helper methods added to AST Tree

   // append to class ASTBase

     //      properties
        // scope: Names.Declaration //for nodes with scope

    // helper method declareName(name, options)
    ASTBase.prototype.declareName = function(name, options){
// declareName creates a new Names.Declaration, *referecing source as nodeDeclared (AST node)*

       return new Names.Declaration(name, options, this);
    };

    // method addMemberTo(nameDecl, memberName, options)  returns Names.Declaration
    ASTBase.prototype.addMemberTo = function(nameDecl, memberName, options){
// a Helper method ASTBase.*addMemberTo*
// Adds a member to a NameDecl, referencing this node as nodeDeclared

       return nameDecl.addMember(memberName, options, this);
    };

    // helper method tryGetMember(nameDecl, name:string, options:Names.NameDeclOptions)
    ASTBase.prototype.tryGetMember = function(nameDecl, name, options){
// this method looks for a specific member, optionally declare as forward
// or inform error. We need this AST node, to correctly report error.

       // default options = new Names.NameDeclOptions
       if(options===undefined) options=new Names.NameDeclOptions();

       var found = nameDecl.findMember(name);

       // if found and name.slice(0,2) isnt '**'
       if (found && name.slice(0, 2) !== '**') {
         found.caseMismatch(name, this);
       }
       
       else {

         // if options.informError
         if (options.informError) {
               logger.warning("" + (this.positionText()) + ". No member named '" + name + "' on " + (nameDecl.info()));
         };

         // if options.isForward, found = .addMemberTo(nameDecl,name,options)
         if (options.isForward) {found = this.addMemberTo(nameDecl, name, options)};
       };

       return found;
    };


    // helper method getScopeNode()
    ASTBase.prototype.getScopeNode = function(){

// **getScopeNode** method return the parent 'scoped' node in the hierarchy.
// It looks up until found a node with .scope

// Start at this node

       var node = this;

       // while node
       while(node){

         // if node.scope
         if (node.scope) {
             return node;// # found a node with scope
         };

         node = node.parent;// # move up
       };// end loop

        // #loop

       return null;
    };


    // method findInScope(name) returns Names.Declaration
    ASTBase.prototype.findInScope = function(name){
// this method looks for the original place
// where a name was defined (function,method,var)
// Returns the Identifier node from the original scope
// It's used to validate variable references to be previously declared names

// Start at this node

       var node = this;

// Look for the declaration in this scope

       // while node
       while(node){
          // declare valid node.scope:Names.Declaration
         // if node.scope and node.scope.findOwnMember(name) into var found
         var found=undefined;
         if (node.scope && (found=node.scope.findOwnMember(name))) {
             return found;
         };

// move up in scopes

         node = node.parent;
       };// end loop
       
    };

        // #loop


    // method tryGetFromScope(name, options:Names.NameDeclOptions) returns Names.Declaration
    ASTBase.prototype.tryGetFromScope = function(name, options){
// a Helper method: *ASTBase.tryGetFromScope(name)*, this method looks for the original declaration
// in the scope. if the declaration is not found, an error is emmited and a -pseudo- var is created
// in the scope in order to continue compilation

// Check if the name is declared. Retrieve the original declaration

// if it's already a Names.Declaration, no need to search

       // if name instanceof Names.Declaration, return name
       if (name instanceof Names.Declaration) {return name};

// Search the scope

       // if .findInScope(name) into var found
       var found=undefined;
       if ((found=this.findInScope(name))) {

// Declaration found, we check the upper/lower case to be consistent
// If the found item has a different case than the name we're looking for, emit error

           // if found.caseMismatch(name, this)
           if (found.caseMismatch(name, this)) {
               return found;
           };
           // end if
           
       }

// if it is not found,check options: a) inform error. b) declare foward.
       
       else {
           // if options and options.informError
           if (options && options.informError) {
               this.sayErr("UNDECLARED NAME: '" + name + "'");
           };

           // if options and options.isForward
           if (options && options.isForward) {
               found = this.addToScope(name, options);
               // if options.isDummy and Strings.isCapitalized(name) #let's assume is a class
               if (options.isDummy && Strings.isCapitalized(name)) {// #let's assume is a class
                   this.addMemberTo(found, 'prototype', options);
               };
           };
       };

        // #end if - check declared variables

       return found;
    };


    // method addToScope(item, options:Names.NameDeclOptions) returns Names.Declaration
    ASTBase.prototype.addToScope = function(item, options){
// a Helper method ASTBase.*addToScope*
// Search for parent Scope, adds passed name to scope.members
// Reports duplicated.
// return: Names.Declaration

       // if no item, return # do nothing on undefined params
       if (!item) {return};

       var scope = this.getScopeNode().scope;

       return this.addToSpecificScope(scope, item, options);
    };

// First search it to report duplicates, if found in the scope.
// If the found item has a different case than the name we're adding, emit error & return

    // method addToSpecificScope(scope:Names.Declaration, item, options:Names.NameDeclOptions) returns Names.Declaration
    ASTBase.prototype.addToSpecificScope = function(scope, item, options){

        // declare valid item.name
       var name = typeof item === 'string' ? item : item.name;

       logger.debug("addToScope: '" + name + "' to '" + scope.name + "'");// #[#{.constructor.name}] name:

       // if .findInScope(name) into var found
       var found=undefined;
       if ((found=this.findInScope(name))) {

           // if found.caseMismatch(name, this)
           if (found.caseMismatch(name, this)) {
              // #case mismatch informed
             // do nothing
             null;
           }
           
           else if (found.isForward) {
             found.isForward = false;
             found.nodeDeclared = this;
             // if item instanceof Names.Declaration
             if (item instanceof Names.Declaration) {
               found.replaceForward(item);
             };
           }
           
           else {
             this.sayErr("DUPLICATED name in scope: '" + name + "'");
             logger.error(found.originalDeclarationPosition());// #add extra information line
           };

           return found;
       };

        // #end if

// else, not found, add it to the scope

       var nameDecl = undefined;
       // if item instanceof Names.Declaration
       if (item instanceof Names.Declaration) {
         nameDecl = item;
       }
       
       else {
         nameDecl = this.declareName(name, options);
       };

       scope.addMember(nameDecl);

       return nameDecl;
    };


    // helper method addToExport(exportedNameDecl, isVarFn)
    ASTBase.prototype.addToExport = function(exportedNameDecl, isVarFn){
// Add to parentModule.exports, but *preserve parent*

     var theModule = this.getParent(Grammar.Module);

     var exportDefault = theModule.exports.name === exportedNameDecl.name;

     var informInconsistency = undefined;

     // if exportDefault
     if (exportDefault) {
         informInconsistency = true;
         // if not theModule.exportsReplaced
         if (!(theModule.exportsReplaced) && theModule.exports.getMemberCount() === 0) {
                  //ok to replace
                 theModule.exports.makePointTo(exportedNameDecl);
                 theModule.exportsReplaced = true;
                 informInconsistency = false;
         };
     }
     
     else {
         // if isVarFn and theModule.exportsReplaced
         if (isVarFn && theModule.exportsReplaced) {
             informInconsistency = true;
         }
         
         else {
             theModule.exports.addMember(exportedNameDecl);
         };
     };

     // if informInconsistency
     if (informInconsistency) {
         exportedNameDecl.warn('default export: cannot have some "public function/var" and also a class/namespace named as the module (default export)');
     };
    };



    // helper method createScope()
    ASTBase.prototype.createScope = function(){
// initializes an empty scope in this node

       // if no .scope
       if (!this.scope) {
         var options = new Names.NameDeclOptions();
         options.normalizeModeKeepFirstCase = true;
         this.scope = this.declareName("[" + this.constructor.name + " Scope]", options);
         this.scope.isScope = true;
       };

       return this.scope;
    };

    // helper method tryGetOwnerNameDecl( informError ) returns Names.Declaration
    ASTBase.prototype.tryGetOwnerNameDecl = function(informError){

// Returns namedeclaration where this node should be.
// Used for properties & methods declarations.
// If the parent is Append-To, search for the referenced clas/namespace.

// returns owner.nameDecl or nothing

       var toNamespace = undefined;
       var ownerDecl = undefined;

        // # get parent ClassDeclaration/Append-to/Namespace
       var parent = this.getParent(Grammar.ClassDeclaration);

       // if no parent
       if (!parent) {
          // if informError, .throwError "declaration is outside 'class/namespace/append to'. Check indent"
          if (informError) {this.throwError("declaration is outside 'class/namespace/append to'. Check indent")};
          return;
       };

// Append to class|namespace

       // if parent instance of Grammar.AppendToDeclaration
       if (parent instanceof Grammar.AppendToDeclaration) {

            // #get varRefOwner from AppendToDeclaration
            // declare parent:Grammar.AppendToDeclaration

           toNamespace = parent.toNamespace;// #if it was 'append to namespace'

            // #get referenced class/namespace
           // if no parent.varRef.tryGetReference() into ownerDecl
           if (!((ownerDecl=parent.varRef.tryGetReference()))) {
               // if informError
               if (informError) {
                   this.sayErr("Append to: '" + parent.varRef + "'. Reference is not fully declared");
               };
               return; //if no ownerDecl found
           };
       }
       
       else {

           toNamespace = parent.constructor === Grammar.NamespaceDeclaration;

           ownerDecl = parent.nameDecl;
       };

       // end if


// check if owner is class (namespace) or class.prototype (class)


       // if toNamespace
       if (toNamespace) {
            // #'append to namespace'/'namespace x'. Members are added directly to owner
           return ownerDecl;
       }
       
       else {
            // # Class: members are added to the prototype
            // # move to class prototype
           // if no ownerDecl.findOwnMember("prototype") into var ownerDeclProto
           var ownerDeclProto=undefined;
           if (!((ownerDeclProto=ownerDecl.findOwnMember("prototype")))) {
               // if informError, .sayErr "Class '#{ownerDecl}' has no .prototype"
               if (informError) {this.sayErr("Class '" + ownerDecl + "' has no .prototype")};
               return;
           };

            // # Class: members are added to the prototype
           return ownerDeclProto;
       };

       // end if
       
    };


// #### helper method tryGetOwnerDecl(options:Names.NameDeclOptions) returns Names.Declaration
// Used by properties & methods in the body of ClassDeclaration|AppendToDeclaration
// to get their 'owner', i.e., a Names.Declaration where they'll be added as members
//         var toNamespace, classRef
//         var ownerDecl
//         declare valid .specifier
//         # get parent class/append to
//         var parent:Grammar.ClassDeclaration = .getParent(Grammar.ClassDeclaration)
//         if no parent
//           .throwError "'#{.specifier}' declaration outside 'class/append to' declaration. Check indent"
// Append to class|namespace
//         if parent instance of Grammar.AppendToDeclaration
//             #get varRefOwner from AppendToDeclaration
//             declare parent:Grammar.AppendToDeclaration
//             toNamespace = parent.toNamespace #if it was 'append to namespace'
//             classRef = parent.varRef
//             #get referenced class/namespace
//             declare valid classRef.tryGetReference
//             if no classRef.tryGetReference() into ownerDecl
//                 if options and options.informError, .sayErr "Append to: '#{classRef}'. Reference is not fully declared"
//               return
//         else # simpler direct ClassDeclaration / NamespaceDeclaration
//             if no parent.nameDecl into ownerDecl
//                  .sayErr "Unexpected. Class has no nameDecl"
//             classRef = ownerDecl
//             toNamespace = parent.constructor is Grammar.NamespaceDeclaration
//         end if
// check if owner is class (namespace) or class.prototype (class)
//         if toNamespace
//             do nothing #'append to namespace'/'namespace x'. Members are added directly to owner
//         else
//           # Class: members are added to the prototype
//           # move to class prototype
//           if no ownerDecl.findOwnMember("prototype") into ownerDecl
//               if options and options.informError, .sayErr "Class '#{classRef}' has no .prototype"
//               return
//         return ownerDecl

    // helper method callOnSubTree(methodSymbol,excludeClass) # recursive
    ASTBase.prototype.callOnSubTree = function(methodSymbol, excludeClass){// # recursive

// This is instance has the method, call the method on the instance

     logger.debugGroup("callOnSubTree " + this.constructor.name + "." + (LiteCore.getSymbolName(methodSymbol)) + "() - '" + this.name + "'");

     // if this.tryGetMethod(methodSymbol) into var theFunction
     var theFunction=undefined;
     if ((theFunction=this.tryGetMethod(methodSymbol))) {
           logger.debug("calling " + this.constructor.name + "." + (LiteCore.getSymbolName(methodSymbol)) + "() - '" + this.name + "'");
           theFunction.call(this);
     };

     // if excludeClass and this is instance of excludeClass, return #do not recurse on filtered's childs
     if (excludeClass && this instanceof excludeClass) {return};

// recurse on this properties and Arrays (exclude 'parent' and 'importedModule')

     // for each property name,value in this
     var value=undefined;
     for ( var name in this)if (this.hasOwnProperty(name)){value=this[name];
     if(['constructor', 'parent', 'importedModule', 'requireCallNodes', 'exportDefault'].indexOf(name)===-1){

           // if value instance of ASTBase
           if (value instanceof ASTBase) {
                // declare value:ASTBase
               value.callOnSubTree(methodSymbol, excludeClass);// #recurse
           }
           
           else if (value instanceof Array) {
                // declare value:array
               logger.debug("callOnSubArray " + this.constructor.name + "." + name + "[]");
               // for each item in value where item instance of ASTBase
               for( var item__inx=0,item ; item__inx<value.length ; item__inx++){item=value[item__inx];
                 if(item instanceof ASTBase){
                    // declare item:ASTBase
                   item.callOnSubTree(methodSymbol, excludeClass);
               }};// end for each in value
               
           };
           }
           
           }// end for each property
     // end for

     logger.debugGroupEnd();
    };

// ----
// ## Methods added to specific Grammar Classes to handle scope, var & members declaration

   // append to class Grammar.VariableDecl ###

// `VariableDecl: Identifier (':' dataType-IDENTIFIER) ('=' assignedValue-Expression)`

// variable name, optional type anotation and optionally assign a value

// VariableDecls are used in:
// 1. `var` statement
// 2. function *parameter declaration*
// 3. class *properties declaration*

// Examples:
  // `var a : string = 'some text'`
  // `function x ( a : string = 'some text', b, c=0)`

      // properties nameDecl

     // helper method createNameDeclaration()
     Grammar.VariableDecl.prototype.createNameDeclaration = function(){

       var options = new Names.NameDeclOptions();
       options.type = this.type;
       options.itemType = this.itemType;

       return this.declareName(this.name, options);
     };

     // helper method declareInScope()
     Grammar.VariableDecl.prototype.declareInScope = function(){
         this.nameDecl = this.addToScope(this.createNameDeclaration());
     };

     // helper method getTypeFromAssignedValue()
     Grammar.VariableDecl.prototype.getTypeFromAssignedValue = function(){
         // if .nameDecl and .assignedValue and .nameDecl.name isnt 'prototype'
         if (this.nameDecl && this.assignedValue && this.nameDecl.name !== 'prototype') {
             // if no .nameDecl.findOwnMember('**proto**') into var type #if has no type
             var type=undefined;
             if (!((type=this.nameDecl.findOwnMember('**proto**')))) {// #if has no type
                 // if .assignedValue.getResultType() into var result #get assignedValue type
                 var result=undefined;
                 if ((result=this.assignedValue.getResultType())) {// #get assignedValue type
                     this.nameDecl.setMember('**proto**', result);// #assign to this.nameDecl
                 };
             };
         };
     };


   // append to class Grammar.VarStatement ###

    // method declare()  # pass 1
    Grammar.VarStatement.prototype.declare = function(){// # pass 1
       // for each varDecl in .list
       for( var varDecl__inx=0,varDecl ; varDecl__inx<this.list.length ; varDecl__inx++){varDecl=this.list[varDecl__inx];
           varDecl.declareInScope();
            // declare .parent: Grammar.Statement
           // if .hasAdjective('export'), .addToExport varDecl.nameDecl, isVarFn=true
           if (this.hasAdjective('export')) {this.addToExport(varDecl.nameDecl, true)};
           // if varDecl.aliasVarRef
           if (varDecl.aliasVarRef) {
                //Example: "public var $ = jQuery" => declare alias $ for jQuery
               var opt = new Names.NameDeclOptions();
               opt.informError = true;
               // if varDecl.aliasVarRef.tryGetReference(opt) into var ref
               var ref=undefined;
               if ((ref=varDecl.aliasVarRef.tryGetReference(opt))) {
                    // # aliases share .members
                   varDecl.nameDecl.members = ref.members;
               };
           };
       };// end for each in this.list
       
    };


    // method evaluateAssignments() # pass 4, determine type from assigned value
    Grammar.VarStatement.prototype.evaluateAssignments = function(){// # pass 4, determine type from assigned value
       // for each varDecl in .list
       for( var varDecl__inx=0,varDecl ; varDecl__inx<this.list.length ; varDecl__inx++){varDecl=this.list[varDecl__inx];
           varDecl.getTypeFromAssignedValue();
       };// end for each in this.list
       
    };


   // append to class Grammar.WithStatement ###

      // properties nameDecl

     // method declare()  # pass 1
     Grammar.WithStatement.prototype.declare = function(){// # pass 1
        this.nameDecl = this.addToScope(this.declareName(this.name));
     };

     // method evaluateAssignments() # pass 4, determine type from assigned value
     Grammar.WithStatement.prototype.evaluateAssignments = function(){// # pass 4, determine type from assigned value
       this.nameDecl.assignTypeFromValue(this.varRef);
     };


   // append to class Grammar.ImportStatementItem ###

      // properties nameDecl

     // method declare #pass 1: declare name choosed for imported(required) contents as a scope var
     Grammar.ImportStatementItem.prototype.declare = function(){// #pass 1: declare name choosed for imported(required) contents as a scope var

       // if no .getParent(Grammar.DeclareStatement) #except for 'global declare'
       if (!this.getParent(Grammar.DeclareStatement)) {// #except for 'global declare'
           // if .hasAdjective('shim') and .findInScope(.name), return // do not import if shim and already declared
           if (this.hasAdjective('shim') && this.findInScope(this.name)) {return};
           this.nameDecl = this.addToScope(this.name);
       };
     };


// ----------------------------
// ### Append to class Grammar.NamespaceDeclaration
// #### method declare()
//         .nameDecl = .addToScope(.declareName(.name))
//         .createScope


   // append to class Grammar.ClassDeclaration
// also AppendToDeclaration and NamespaceDeclaration (child classes).

     //      properties

      // nameDecl
      //container: Grammar.NamespaceDeclaration // in which namespace this class/namespace is declared

    // method declare()
    Grammar.ClassDeclaration.prototype.declare = function(){

// AppendToDeclarations do not "declare" anything at this point.
// AppendToDeclarations add to a existing classes or namespaces.
// The adding is delayed until pass:"processAppendToExtends", where
// append-To var reference is searched in the scope
// and methods and properties are added.
// This need to be done after all declarations.

       // if this.constructor is Grammar.AppendToDeclaration, return
       if (this.constructor === Grammar.AppendToDeclaration) {return};

// Check if it is a class or a namespace

       var isNamespace = this.constructor === Grammar.NamespaceDeclaration;
       var isClass = this.constructor === Grammar.ClassDeclaration;

       var opt = new Names.NameDeclOptions();

       // if isNamespace
       if (isNamespace) {

           this.nameDecl = this.declareName(this.name);
       }
       
       else {

// if is a class adjectivated "shim", do not declare if already exists

           // if .hasAdjective('shim')
           if (this.hasAdjective('shim')) {
               // if .tryGetFromScope(.name)
               if (this.tryGetFromScope(this.name)) {
                   return;
               };
           };

// declare the class

           opt.type = globalPrototype('Function');
           this.nameDecl = this.declareName(this.name, opt); //class
           opt.type = undefined;
       };

// get parent. We cover here class/namespaces directly declared inside namespaces (without AppendTo)

       var container = this.getParent(Grammar.NamespaceDeclaration);

// if it is declared inside a namespace, it becomes a item of the namespace

       // if container
       if (container) {
            // declare container: Grammar.NamespaceDeclaration
           container.nameDecl.addMember(this.nameDecl);
       }

// else, is a module-level class|namespace. Add to scope
       
       else {
           this.addToScope(this.nameDecl);

// if public/export, or interface, also add to module.exports

           var scopeModule = this.getParent(Grammar.Module);
           // if scopeModule.fileInfo.isInterface or .hasAdjective('export')
           if (scopeModule.fileInfo.isInterface || this.hasAdjective('export')) {
                 this.addToExport(this.nameDecl);
           };
       };

// if it is a Class, we create 'Class.prototype' member
// Class's properties & methods will be added to 'prototype' as valid member members.
// 'prototype' starts with 'constructor' which is a pointer to the class-funcion itself

       // if isClass
       if (isClass) {
           var prtypeNameDecl = this.nameDecl.findOwnMember('prototype') || this.addMemberTo(this.nameDecl, 'prototype');
           // if .varRefSuper, prtypeNameDecl.setMember('**proto**',.varRefSuper)
           if (this.varRefSuper) {prtypeNameDecl.setMember('**proto**', this.varRefSuper)};
           opt.pointsTo = this.nameDecl;
           prtypeNameDecl.addMember('constructor', opt);

// return type of the class-function, is the prototype

           this.nameDecl.setMember('**return type**', prtypeNameDecl);

// add to nameAffinity

           // if not nameAffinity.members.has(.name)
           if (!(nameAffinity.members.has(this.name))) {
               nameAffinity.members.set(this.name, this.nameDecl);
           };
       };
    };


    // method validatePropertyAccess()
    Grammar.ClassDeclaration.prototype.validatePropertyAccess = function(){

// in the pass "Validating Property Access", for a "ClassDeclaration"
// we check for duplicate property names in the super-class-chain

       // if .constructor isnt Grammar.ClassDeclaration, return // exclude child classes
       if (this.constructor !== Grammar.ClassDeclaration) {return};

       var prt = this.nameDecl.ownMember('prototype');
       // for each propNameDecl in map prt.members where propNameDecl.isProperty
       var propNameDecl=undefined;
       if(!prt.members.dict) throw(new Error("for each in map: not a Map, no .dict property"));
       for ( var propNameDecl__propName in prt.members.dict) if (prt.members.dict.hasOwnProperty(propNameDecl__propName)){propNameDecl=prt.members.dict[propNameDecl__propName];
       if(propNameDecl.isProperty){
               propNameDecl.checkSuperChainProperties(this.nameDecl.superDecl);
               }
               
               }// end for each property
       
    };




   // append to class Grammar.ArrayLiteral ###

     // properties nameDecl

    // method declare
    Grammar.ArrayLiteral.prototype.declare = function(){

// When producing C-code, an ArrayLiteral creates a "new(Array" at module level

       // if project.options.target is 'c'
       if (project.options.target === 'c') {
           this.nameDecl = this.declareName(UniqueID.getVarName('_literalArray'));
           this.getParent(Grammar.Module).addToScope(this.nameDecl);
       };
    };

    // method getResultType
    Grammar.ArrayLiteral.prototype.getResultType = function(){
         return tryGetGlobalPrototype('Array');
    };

   // append to class Grammar.ObjectLiteral ###

     // properties nameDecl

    // method declare
    Grammar.ObjectLiteral.prototype.declare = function(){

// When producing C-code, an ObjectLiteral creates a "Map string to any" on the fly,
// but it does not declare a valid type/class.

       // if project.options.target is 'c'
       if (project.options.target === 'c') {
           this.nameDecl = this.declareName(UniqueID.getVarName('_literalMap'));
           this.getParent(Grammar.Module).addToScope(this.nameDecl);
       }
       
       else {
            // declare valid .parent.nameDecl
           this.nameDecl = this.parent.nameDecl || this.declareName(UniqueID.getVarName('*ObjectLiteral*'));
       };
    };

// When producing the LiteScript-to-C compiler, a ObjectLiteral's return type is 'Map string to any'

    // method getResultType
    Grammar.ObjectLiteral.prototype.getResultType = function(){

       // if project.options.target is 'c'
       if (project.options.target === 'c') {
           return tryGetGlobalPrototype('Map');
       }
       
       else {
           return this.nameDecl;
       };
    };


   // append to class Grammar.NameValuePair ###

     // properties nameDecl

    // method declare
    Grammar.NameValuePair.prototype.declare = function(){

// When producing C-code, a ObjectLiteral creates a "Map string to any" on the fly,
// but it does not declare a valid type/class.

       // if project.options.target is 'c', return
       if (project.options.target === 'c') {return};

        // declare valid .parent.nameDecl
       this.nameDecl = this.addMemberTo(this.parent.nameDecl, this.name);

// check if we can determine type from value

       // if .type and .type instance of Names.Declaration and .type.name not in ["undefined","null"]
       if (this.type && this.type instanceof Names.Declaration && ["undefined", "null"].indexOf(this.type.name)===-1) {
           this.nameDecl.setMember('**proto**', this.type);
       }
       
       else if (this.value) {
           this.nameDecl.assignTypeFromValue(this.value);
       };
    };

   // append to class Grammar.FunctionDeclaration ###
// `FunctionDeclaration: '[export][generator] (function|method|constructor) [name] '(' FunctionParameterDecl* ')' Block`

     // properties
        // nameDecl
        // declared:boolean

    // method declare() ## function, methods and constructors
    Grammar.FunctionDeclaration.prototype.declare = function(){// ## function, methods and constructors

     var ownerNameDecl = undefined;
     var isMethod = this.constructor === Grammar.MethodDeclaration;
     var isFunction = this.constructor === Grammar.FunctionDeclaration;

     var opt = new Names.NameDeclOptions();

// 1st: Grammar.FunctionDeclaration

// if it is not anonymous, add function name to parent scope,
// if its 'export' add to exports

     // if isFunction
     if (isFunction) {

         opt.type = globalPrototype('Function');
         this.nameDecl = this.addToScope(this.name, opt);
         // if .hasAdjective('export'), .addToExport .nameDecl,isVarFn=true
         if (this.hasAdjective('export')) {this.addToExport(this.nameDecl, true)};
     }

// commmented, for functions and namespace methods, this should'n be a parameter
// determine 'owner' (where 'this' points to for this function)
//           var nameValuePair = .getParent(Grammar.NameValuePair)
//           if nameValuePair #NameValue pair where function is 'value'
//               declare valid nameValuePair.parent.nameDecl
//               ownerNameDecl = nameValuePair.parent.nameDecl  #ownerNameDecl object nameDecl
//           else
//             ownerNameDecl = globalScope

// 2nd: Methods & constructors

// Try to determine ownerNameDecl, for declaration and to set scope var "this"'s  **proto**.
// if ownerNameDecl *can* be determined at this point, declare method as member.

// Note: following JS design, constructors
// are the body of the function-class itself.
     
     else if ((ownerNameDecl=this.tryGetOwnerNameDecl())) {

         // if .constructor isnt Grammar.ConstructorDeclaration
         if (this.constructor !== Grammar.ConstructorDeclaration) {
              //the constructor is the Function-Class itself
              // so it is not a member function
             this.addMethodToOwnerNameDecl(ownerNameDecl);
         };
     };

     // end if

// Define function's return type from parsed text

     var returnType = this.createReturnType();

// Functions (methods and constructors also), have a 'scope'.
// It captures al vars declared in its body.
// We now create function's scope and add the special var 'this'.
// The 'type' of 'this' is normally a class prototype,
// which contains other methods and properties from the class.
// We also add 'arguments.length'

// Scope starts populated by 'this' and 'arguments'.

     var scope = this.createScope();

     opt.type = 'any*';
     this.addMemberTo(scope, 'arguments', opt);

     // if not isFunction
     if (!(isFunction)) {

         var addThis = false;

         var containerClassDeclaration = this.getParent(Grammar.ClassDeclaration); //also append-to & NamespaceDeclaration
         // if containerClassDeclaration.constructor is Grammar.ClassDeclaration
         if (containerClassDeclaration.constructor === Grammar.ClassDeclaration) {
             addThis = true;
         }
         
         else if (containerClassDeclaration.constructor === Grammar.AppendToDeclaration) {
              // declare containerClassDeclaration:Grammar.AppendToDeclaration
             addThis = !(containerClassDeclaration.toNamespace);
         };

         // if addThis
         if (addThis) {
             opt.type = ownerNameDecl;
             this.addMemberTo(scope, 'this', opt);
         };
     };

// Note: only class methods have 'this' as parameter

// add parameters to function's scope

     // if .paramsDeclarations
     if (this.paramsDeclarations) {
       // for each varDecl in .paramsDeclarations
       for( var varDecl__inx=0,varDecl ; varDecl__inx<this.paramsDeclarations.length ; varDecl__inx++){varDecl=this.paramsDeclarations[varDecl__inx];
         varDecl.declareInScope();
       };// end for each in this.paramsDeclarations
       
     };
    };



    // helper method addMethodToOwnerNameDecl(owner:Names.Declaration)  ## methods
    Grammar.FunctionDeclaration.prototype.addMethodToOwnerNameDecl = function(owner){// ## methods

     var actual = owner.findOwnMember(this.name);

     // if actual and .hasAdjective('shim') #shim for an exising method, do nothing
     if (actual && this.hasAdjective('shim')) {// #shim for an exising method, do nothing
       return;
     };

// Add to owner, type is 'Function'

     // if no .nameDecl
     if (!this.nameDecl) {
         var opt = new Names.NameDeclOptions();
         opt.type = globalPrototype('Function');
         this.nameDecl = this.declareName(this.name, opt);
     };

     this.declared = true;

     this.addMemberTo(owner, this.nameDecl);
    };


    // method createReturnType() returns string ## functions & methods
    Grammar.FunctionDeclaration.prototype.createReturnType = function(){// ## functions & methods

     // if no .nameDecl, return #nowhere to put definitions
     if (!this.nameDecl) {return};

// Define function's return type from parsed text

     // if .itemType
     if (this.itemType) {

// if there's a "itemType", it means type is: `TypeX Array`.
// We create a intermediate type for `TypeX Array`
// and set this new nameDecl as function's **return type**

         var composedName = '' + (this.itemType.toString()) + ' Array';

// check if it alerady exists, if not found, create one. Type is 'Array'

         // if not globalScope.findMember(composedName) into var intermediateNameDecl
         var intermediateNameDecl=undefined;
         if (!((intermediateNameDecl=globalScope.findMember(composedName)))) {
             var opt = new Names.NameDeclOptions();
             opt.type = globalPrototype('Array');
             intermediateNameDecl = globalScope.addMember(composedName, opt);
         };

// item type, is each array member's type

         intermediateNameDecl.setMember("**item type**", this.itemType);

         this.nameDecl.setMember('**return type**', intermediateNameDecl);

         return intermediateNameDecl;
     }

// else, it's a simple type
     
     else {

         // if .type then .nameDecl.setMember('**return type**', .type)
         if (this.type) {this.nameDecl.setMember('**return type**', this.type)};
         return this.type;
     };
    };


   // append to class Grammar.AppendToDeclaration ###

    // method processAppendToExtends()
    Grammar.AppendToDeclaration.prototype.processAppendToExtends = function(){
// when target is '.c' we do not allow treating classes as namespaces
// so an "append to namespace classX" should throw an error

// get referenced class/namespace

     // if no .varRef.tryGetReference() into var ownerDecl
     var ownerDecl=undefined;
     if (!((ownerDecl=this.varRef.tryGetReference()))) {
         this.sayErr("Append to: '" + this.varRef + "'. Reference is not fully declared");
         return; //if no ownerDecl found
     };

     var prt = ownerDecl.findOwnMember('prototype');

     // if project.options.target is 'c'
     if (project.options.target === 'c') {
         // if .toNamespace and prt
         if (this.toNamespace && prt) {
             this.sayErr("Append to: '" + this.varRef + "'. For C production, canot add to class as namespace.");
         };
     };

     // if prt, ownerDecl=prt // append to class, adds to prototype
     if (prt) {ownerDecl = prt};

     // for each item in .body.statements
     for( var item__inx=0,item ; item__inx<this.body.statements.length ; item__inx++){item=this.body.statements[item__inx];

         // switch item.specific.constructor
         switch(item.specific.constructor){
         
         case Grammar.PropertiesDeclaration:
                  // declare item.specific:Grammar.PropertiesDeclaration
                 // if not item.specific.declared, item.specific.declare(informError=true)
                 if (!(item.specific.declared)) {item.specific.declare(true)};
                 break;
                 
         case Grammar.MethodDeclaration:
                 var m = item.specific;
                 // if m.declared, continue
                 if (m.declared) {continue};

// Now that we have 'owner' we can set **proto** for scope var 'this',
// so we can later validate `.x` in `this.x = 7`

                 m.addMethodToOwnerNameDecl(ownerDecl);

                 // if m.scope.findOwnMember("this") into var scopeThis
                 var scopeThis=undefined;
                 if ((scopeThis=m.scope.findOwnMember("this"))) {
                     scopeThis.setMember('**proto**', ownerDecl);
                      // #set also **return type**
                     m.createReturnType();
                 };
                 break;
                 
         case Grammar.ClassDeclaration:
                  // declare item.specific:Grammar.ClassDeclaration
                 ownerDecl.addMember(item.specific.nameDecl);
                 break;
                 
         case Grammar.EndStatement:
                 // do nothing
                 null;
                 break;
                 
         default:
                 this.sayErr('unexpected "' + item.specific.constructor.name + '" inside Append-to Declaration');
         
         };
     };// end for each in this.body.statements
     
    };


   // append to class Names.Declaration ###
     //      properties
      // superDecl : Names.Declaration //nameDecl of the super class

    // method checkSuperChainProperties(superClassNameDecl)
    Names.Declaration.prototype.checkSuperChainProperties = function(superClassNameDecl){

       // if no superClassNameDecl, return
       if (!superClassNameDecl) {return};

// Check for duplicate class properties in the super class

       // if superClassNameDecl.findOwnMember('prototype') into var superPrt:Names.Declaration
       var superPrt=undefined;
       if ((superPrt=superClassNameDecl.findOwnMember('prototype'))) {

           // if superPrt.findOwnMember(.name) into var originalNameDecl
           var originalNameDecl=undefined;
           if ((originalNameDecl=superPrt.findOwnMember(this.name))) {
               this.sayErr("Duplicated property. super class [" + superClassNameDecl + "] already has a property '" + this + "'");
               originalNameDecl.sayErr("for reference, original declaration.");
           };

// recurse with super's super. Here we're using recursion as a loop device à la Haskell
// (instead of a simpler "while .superDecl into node" loop. Just to be fancy)

           this.checkSuperChainProperties(superClassNameDecl.superDecl);
       };
    };

   // append to class Grammar.ClassDeclaration ###

    // method processAppendToExtends()
    Grammar.ClassDeclaration.prototype.processAppendToExtends = function(){
// In Class's processAppendToExtends we try to get a reference to the superclass
// and then store the superclass nameDecl in the class nameDecl

// get referenced super class

     // if .varRefSuper
     if (this.varRefSuper) {
         // if no .varRefSuper.tryGetReference() into var superClassNameDecl
         var superClassNameDecl=undefined;
         if (!((superClassNameDecl=this.varRefSuper.tryGetReference()))) {
             this.sayErr("class " + this.name + " extends '" + this.varRefSuper + "'. Reference is not fully declared");
             return; //if no superClassNameDecl found
         };

         this.nameDecl.superDecl = superClassNameDecl;
     };
    };

   // append to class Grammar.PropertiesDeclaration ###

     // properties
        // nameDecl
        // declared:boolean

    // method declare(informError)
    Grammar.PropertiesDeclaration.prototype.declare = function(informError){
// Add all properties as members of its owner object (normally: class.prototype)

       var opt = new Names.NameDeclOptions();
       // if .tryGetOwnerNameDecl(informError) into var ownerNameDecl
       var ownerNameDecl=undefined;
       if ((ownerNameDecl=this.tryGetOwnerNameDecl(informError))) {

           // for each varDecl in .list
           for( var varDecl__inx=0,varDecl ; varDecl__inx<this.list.length ; varDecl__inx++){varDecl=this.list[varDecl__inx];
               opt.type = varDecl.type;
               opt.itemType = varDecl.itemType;
               varDecl.nameDecl = varDecl.addMemberTo(ownerNameDecl, varDecl.name, opt);
           };// end for each in this.list

           this.declared = true;
       };
    };

    // method evaluateAssignments() # determine type from assigned value on properties declaration
    Grammar.PropertiesDeclaration.prototype.evaluateAssignments = function(){// # determine type from assigned value on properties declaration

       // for each varDecl in .list
       for( var varDecl__inx=0,varDecl ; varDecl__inx<this.list.length ; varDecl__inx++){varDecl=this.list[varDecl__inx];
           varDecl.getTypeFromAssignedValue();
       };// end for each in this.list
       
    };



   // append to class Grammar.ForStatement ###

    // method declare()
    Grammar.ForStatement.prototype.declare = function(){

// a ForStatement has a 'Scope', indexVar & mainVar belong to the scope

       this.createScope();
    };

   // append to class Grammar.ForEachProperty ###

    // method declare()
    Grammar.ForEachProperty.prototype.declare = function(){

       // default .mainVar.type = .iterable.itemType
       if(this.mainVar.type===undefined) this.mainVar.type=this.iterable.itemType;
       this.mainVar.declareInScope();

       // if .indexVar, .indexVar.declareInScope
       if (this.indexVar) {this.indexVar.declareInScope()};
    };

    // method evaluateAssignments()
    Grammar.ForEachProperty.prototype.evaluateAssignments = function(){

// ForEachProperty: index is: string for js (property name) and number for C (symbol)

       var indexType = project.options.target === 'js' ? 'String' : 'Number';
       this.indexVar.nameDecl.setMember('**proto**', globalPrototype(indexType));
    };

   // append to class Grammar.ForEachInArray ###

    // method declare()
    Grammar.ForEachInArray.prototype.declare = function(){

       // default .mainVar.type = .iterable.itemType
       if(this.mainVar.type===undefined) this.mainVar.type=this.iterable.itemType;
       this.mainVar.declareInScope();

       // if .indexVar, .indexVar.declareInScope
       if (this.indexVar) {this.indexVar.declareInScope()};
    };

    // method evaluateAssignments()
    Grammar.ForEachInArray.prototype.evaluateAssignments = function(){

// ForEachInArray:
// If no mainVar.type, guess type from iterable's itemType

       // if no .mainVar.nameDecl.findOwnMember('**proto**')
       if (!this.mainVar.nameDecl.findOwnMember('**proto**')) {
           var iterableType = this.iterable.getResultType();
           // if iterableType and iterableType.findOwnMember('**item type**')  into var itemType
           var itemType=undefined;
           if (iterableType && (itemType=iterableType.findOwnMember('**item type**'))) {
               this.mainVar.nameDecl.setMember('**proto**', itemType);
           };
       };
    };

    // method validatePropertyAccess()
    Grammar.ForEachInArray.prototype.validatePropertyAccess = function(){
// ForEachInArray: check if the iterable has a .length property.

       // if .isMap, return
       if (this.isMap) {return};

       var iterableType = this.iterable.getResultType();

       // if no iterableType
       if (!iterableType) {
            // #.sayErr "ForEachInArray: no type declared for: '#{.iterable}'"
           // do nothing
           null;
       }
       
       else if (!iterableType.findMember('length')) {
           this.sayErr("ForEachInArray: no .length property declared in '" + this.iterable + "' type:'" + (iterableType.toString()) + "'");
           logger.error(iterableType.originalDeclarationPosition());
       };
    };

   // append to class Grammar.ForIndexNumeric ###

    // method declare()
    Grammar.ForIndexNumeric.prototype.declare = function(){

       this.indexVar.declareInScope();
    };


   // append to class Grammar.ExceptionBlock
// `ExceptionBlock: (exception|catch) catchVar-IDENTIFIER Body [finally Body]`

     // method declare()
     Grammar.ExceptionBlock.prototype.declare = function(){

// Exception blocks have a scope

       this.createScope();
       this.addToScope(this.catchVar, new Map().fromObject({type: globalPrototype('Error')}));
     };


   // append to class Grammar.VariableRef ### Helper methods

// `VariableRef: ['--'|'++']Identifier[Accessors]['--'|'++']`

// `VariableRef` is a Variable Reference.

    // method validatePropertyAccess()
    Grammar.VariableRef.prototype.validatePropertyAccess = function(){

       // if .parent is instance of Grammar.DeclareStatement
       if (this.parent instanceof Grammar.DeclareStatement) {
            // declare valid .parent.specifier
           // if .parent.specifier is 'valid'
           if (this.parent.specifier === 'valid') {
                 return;// #declare valid xx.xx.xx
           };
       };

// Start with main variable name, to check property names

       var opt = new Names.NameDeclOptions();
       opt.informError = true;
       opt.isForward = true;
       opt.isDummy = true;
       var actualVar = this.tryGetFromScope(this.name, opt);

// now follow each accessor

       // if no actualVar or no .accessors, return
       if (!actualVar || !this.accessors) {return};

       // for each ac in .accessors
       for( var ac__inx=0,ac ; ac__inx<this.accessors.length ; ac__inx++){ac=this.accessors[ac__inx];
            // declare valid ac.name

// for PropertyAccess, check if the property name is valid

           // if ac instanceof Grammar.PropertyAccess
           if (ac instanceof Grammar.PropertyAccess) {
               opt.isForward = false;
               actualVar = this.tryGetMember(actualVar, ac.name, opt);
           }

// else, for IndexAccess, the varRef type is now 'itemType'
// and next property access should be on defined members of the type
           
           else if (ac instanceof Grammar.IndexAccess) {
               actualVar = actualVar.findMember('**item type**');
           }

// else, for FunctionAccess, the varRef type is now function's return type'
// and next property access should be on defined members of the return type
           
           else if (ac instanceof Grammar.FunctionAccess) {

               // if actualVar.findOwnMember('**proto**') into var prt
               var prt=undefined;
               if ((prt=actualVar.findOwnMember('**proto**'))) {
                   // if prt.name is 'prototype', prt=prt.parent
                   if (prt.name === 'prototype') {prt = prt.parent};
                   // if prt.name isnt 'Function'
                   if (prt.name !== 'Function') {
                       this.warn("function call. '" + actualVar + "' is class '" + prt.name + "', not 'Function'");
                   };
               };

               actualVar = actualVar.findMember('**return type**');
           };

           // if actualVar instanceof Grammar.VariableRef
           if (actualVar instanceof Grammar.VariableRef) {
                // declare actualVar:Grammar.VariableRef
               opt.isForward = true;
               actualVar = actualVar.tryGetReference(opt);
           };

           // if no actualVar, break
           if (!actualVar) {break};
       };// end for each in this.accessors

       // end for #each accessor

       return actualVar;
    };

    // helper method tryGetReference(options:Names.NameDeclOptions) returns Names.Declaration
    Grammar.VariableRef.prototype.tryGetReference = function(options){

// evaluate this VariableRef.
// Try to determine referenced NameDecl.
// if we can reach a reference, return reference.
// For classes, return ClassDeclaration.nameDecl (not ClassDeclaration.nameDecl.prototype)

       // default options= new Names.NameDeclOptions
       if(options===undefined) options=new Names.NameDeclOptions();

// Start with main variable name

       var actualVar = this.tryGetFromScope(this.name, options);
       // if no actualVar, return
       if (!actualVar) {return};

// now check each accessor

       // if no .accessors, return actualVar
       if (!this.accessors) {return actualVar};

       var partial = this.name;

       // for each ac in .accessors
       for( var ac__inx=0,ac ; ac__inx<this.accessors.length ; ac__inx++){ac=this.accessors[ac__inx];
            // declare valid ac.name

// for PropertyAccess

           // if ac instanceof Grammar.PropertyAccess
           if (ac instanceof Grammar.PropertyAccess) {
               actualVar = this.tryGetMember(actualVar, ac.name, options);
           }

// else, for IndexAccess, the varRef type is now 'itemType'
// and next property access should be on defined members of the type
           
           else if (ac instanceof Grammar.IndexAccess) {
               actualVar = this.tryGetMember(actualVar, '**item type**');
           }

// else, for FunctionAccess, the varRef type is now function's return type'
// and next property access should be on defined members of the return type
           
           else if (ac instanceof Grammar.FunctionAccess) {
               actualVar = this.tryGetMember(actualVar, '**return type**');
           };

// check if we can continue on the chain

           // if actualVar isnt instance of Names.Declaration
           if (!(actualVar instanceof Names.Declaration)) {
             actualVar = undefined;
             // break
             break;
           }
           
           else {
             partial += ac.toString();
           };
       };// end for each in this.accessors

       // end for #each accessor

       // if no actualVar and options.informError
       if (!actualVar && options.informError) {
           this.sayErr("'" + this + "'. Reference can not be analyzed further than '" + partial + "'");
       };

       return actualVar;
    };

    // helper method getResultType() returns Names.Declaration
    Grammar.VariableRef.prototype.getResultType = function(){

     return this.tryGetReference();
    };

// -------

   // append to class Grammar.AssignmentStatement ###


    // method evaluateAssignments() ## Grammar.AssignmentStatement
    Grammar.AssignmentStatement.prototype.evaluateAssignments = function(){// ## Grammar.AssignmentStatement

// check if we've got a a clear reference.

     var reference = this.lvalue.tryGetReference();
     // if reference isnt instanceof Names.Declaration, return
     if (!(reference instanceof Names.Declaration)) {return};
     // if reference.findOwnMember('**proto**'), return #has a type already
     if (reference.findOwnMember('**proto**')) {return};

// check if we've got a clear rvalue.
// if we do, set type for lvalue (unless is "null" or "undefined", they destroy type info)

     reference.assignTypeFromValue(this.rvalue);
    };


// #### method declareByAssignment()
// Here we check for lvalue VariableRef in the form:
// `exports.x = xx`, `module.exports.x = xx` and `xx.prototype.yy =`
// We consider this assignments as 'declarations' of members rather than variable references to check.
// Start with main variable name
//         var varRef = .lvalue
//         var keywordFound
//         if varRef.name is 'exports' #start with 'exports'
//             keywordFound = varRef.name
//         if no varRef.accessors
//           if keywordFound # is: `exports = x`, it does not work in node-js
//               .sayErr "'exports = x', does not work. You need to do: 'module.exports = x'"
//           return # no accessors to check
//         var actualVar = .findInScope(varRef.name)
//         if no actualVar, return
// now check each accessor
//         var createName
//         for each index,ac in varRef.accessors
//             declare valid ac.name
// for PropertyAccess
//             if ac instanceof Grammar.PropertyAccess
//               #if we're after 'exports|prototype' keyword and this is the last accessor,
//               #then this is the name to create
//               if keywordFound and index is varRef.accessors.length-1
//                   createName = ac.name
//                   break
// check for 'exports' or 'prototype', after that, last accessor is property declaration
//               if ac.name in ['exports','prototype']
//                 keywordFound = ac.name
//               actualVar =  actualVar.findMember(ac.name)
//               if no actualVar, break
// else, if IndexAccess or function access, we exit analysis
//             else
//               return #exit
//         end for #each accessor in lvalue, look for module.exports=...
// if we found 'exports' or 'prototype', and we reach a valid reference
//         if keywordFound and actualVar
//             if createName # module.exports.x =... create a member
//               actualVar = .addMemberTo(actualVar,createName) # create x on module.exports
//             #try to execute assignment, so exported var points to content
//             var content = .rvalue.getResultType()
//             if content instanceof Names.Declaration
//                 actualVar.makePointTo content

   // append to class Grammar.Expression ###

    // helper method getResultType() returns Names.Declaration
    Grammar.Expression.prototype.getResultType = function(){
// Try to get return type from a simple Expression

        // declare valid .root.getResultType
       return this.root.getResultType();// # .root is Grammar.Oper or Grammar.Operand
    };


   // append to class Grammar.Oper ###

// for 'into var x' oper, we declare the var, and we deduce type

    // method declare()
    Grammar.Oper.prototype.declare = function(){

       // if .intoVar # is a into-assignment operator with 'var' declaration
       if (this.intoVar) {// # is a into-assignment operator with 'var' declaration

           var varRef = this.right.name;
           // if varRef isnt instance of Grammar.VariableRef
           if (!(varRef instanceof Grammar.VariableRef)) {
               this.throwError("Expected 'variable name' after 'into var'");
           };

           // if varRef.accessors
           if (varRef.accessors) {
               this.throwError("Expected 'simple variable name' after 'into var'");
           };

           var opt = new Names.NameDeclOptions();
           opt.type = varRef.type;
           this.addToScope(this.declareName(varRef.name, opt));
       };
    };

    // method evaluateAssignments()
    Grammar.Oper.prototype.evaluateAssignments = function(){

// for into-assignment operator

     // if .name is 'into' # is a into-assignment operator
     if (this.name === 'into') {// # is a into-assignment operator

// check if we've got a clear reference (into var x)

         // if .right.name instance of Grammar.VariableRef
         if (this.right.name instanceof Grammar.VariableRef) {

              // declare valid .right.name.tryGetReference
             var nameDecl = this.right.name.tryGetReference();

             // if nameDecl isnt instanceof Names.Declaration, return
             if (!(nameDecl instanceof Names.Declaration)) {return};
             // if nameDecl.findOwnMember('**proto**'), return #has a type already
             if (nameDecl.findOwnMember('**proto**')) {return};

// check if we've got a clear .left (value to be assigned) type
// if we do, set type for .rigth ('into var x') (unless is "null" or "undefined", they destroy type info)

             nameDecl.assignTypeFromValue(this.left);
         };
     };
    };


    // helper method getResultType() returns Names.Declaration
    Grammar.Oper.prototype.getResultType = function(){
// Try to get return type from this Oper (only for 'new' unary oper)

        // declare valid .right.getResultType

       // if .name is 'new'
       if (this.name === 'new') {
           return this.right.getResultType();// #.right is Grammar.Operand
       };
    };


   // append to class Grammar.Operand ###

    // helper method getResultType() returns Names.Declaration
    Grammar.Operand.prototype.getResultType = function(){
// Try to get return type from this Operand

        // declare valid .name.type
        // declare valid .name.getResultType
        // declare valid .name.tryGetReference

       // if .name instance of Grammar.ObjectLiteral
       if (this.name instanceof Grammar.ObjectLiteral) {
           return this.name.getResultType();
       }
       
       else if (this.name instanceof Grammar.Literal) {
           return globalPrototype(this.name.type);
       }
       
       else if (this.name instanceof Grammar.VariableRef) {
           return this.name.tryGetReference();
       };
    };


   // append to class Grammar.DeclareStatement
    // method declare() # pass 1, declare as props
    Grammar.DeclareStatement.prototype.declare = function(){// # pass 1, declare as props

// declare [all] x:type
// declare [global] var x
// declare on x
// declare valid x.y.z


     // if .specifier is 'on'
     if (this.specifier === 'on') {

         var opt = new Names.NameDeclOptions();
         opt.isForward = true;
         var reference = this.tryGetFromScope(this.name, opt);

         // if Strings.isCapitalized(reference.name) //let's assume is a Class
         if (Strings.isCapitalized(reference.name)) { //let's assume is a Class
             // if no reference.findOwnMember('prototype'), reference.addMember('prototype')
             if (!reference.findOwnMember('prototype')) {reference.addMember('prototype')};
             reference = reference.findOwnMember('prototype');
         };

         // for each varDecl in .names
         for( var varDecl__inx=0,varDecl ; varDecl__inx<this.names.length ; varDecl__inx++){varDecl=this.names[varDecl__inx];
             this.addMemberTo(reference, varDecl.createNameDeclaration());
         };// end for each in this.names
         
     }

// else: declare (name affinity|var) (VariableDecl,)
     
     else if (['affinity', 'var'].indexOf(this.specifier)>=0) {

         // for each varDecl in .names
         for( var varDecl__inx=0,varDecl ; varDecl__inx<this.names.length ; varDecl__inx++){varDecl=this.names[varDecl__inx];

           varDecl.nameDecl = varDecl.createNameDeclaration();

           // if .specifier is 'var'
           if (this.specifier === 'var') {
               // if .globVar
               if (this.globVar) {
                    // declare valid project.root.addToScope
                   project.root.addToScope(varDecl.nameDecl);
               }
               
               else {
                   this.addToScope(varDecl.nameDecl);
               };
           }
           
           else if (this.specifier === 'affinity') {
               var classDecl = this.getParent(Grammar.ClassDeclaration);
               // if no classDecl
               if (!classDecl) {
                   this.sayErr("'declare name affinity' must be included in a class declaration");
                   return;
               };
                // #add as member to nameAffinity, referencing class decl (.nodeDeclared)
               varDecl.nameDecl.nodeDeclared = classDecl;
               nameAffinity.members.set(varDecl.name.capitalized(), classDecl.nameDecl);
           };
         };// end for each in this.names
         
     };
    };

// if .specifier is 'on-the-fly', the type will be converted on next passes over the created Names.Declaration.
// On the method validatePropertyAccess(), types will be switched "on the fly"
// while checking property access.

    // method evaluateAssignments() # Grammar.DeclareStatement ###
    Grammar.DeclareStatement.prototype.evaluateAssignments = function(){// # Grammar.DeclareStatement ###
// Assign specific type to varRef - for the entire compilation

     // if .specifier is 'type'
     if (this.specifier === 'type') {
         var opt = new Names.NameDeclOptions();
         opt.informError = true;
         // if .varRef.tryGetReference(opt) into var actualVar
         var actualVar=undefined;
         if ((actualVar=this.varRef.tryGetReference(opt))) {
             this.setTypes(actualVar);
         };
     };
    };

    // helper method setTypes(actualVar:Names.Declaration) # Grammar.DeclareStatement ###
    Grammar.DeclareStatement.prototype.setTypes = function(actualVar){// # Grammar.DeclareStatement ###
// Assign types if it was declared

      // #create type on the fly, overwrite existing type

     this.setSubType(actualVar, this.type, '**proto**');
     this.setSubType(actualVar, this.itemType, '**item type**');
    };

    // helper method setSubType(actualVar:Names.Declaration, toSet, propName )
    Grammar.DeclareStatement.prototype.setSubType = function(actualVar, toSet, propName){
// Assign type if it was declared

     // if toSet #create type on the fly
     if (toSet) {// #create type on the fly
          //var act=actualVar.findMember(propName)
          //print "set *type* was #{act} set to #{toSet}"
         actualVar.setMember(propName, toSet);
         var result = actualVar.processConvertTypes();
         // if result.failures, .sayErr "can't find type '#{toSet}' in scope"
         if (result.failures) {this.sayErr("can't find type '" + toSet + "' in scope")};
     };
    };

    // method validatePropertyAccess() # Grammar.DeclareStatement ###
    Grammar.DeclareStatement.prototype.validatePropertyAccess = function(){// # Grammar.DeclareStatement ###

// declare members on the fly, with optional type

     var actualVar = undefined;

     // switch .specifier
     switch(this.specifier){
     
     case 'valid':

           actualVar = this.tryGetFromScope(this.varRef.name, new Map().fromObject({informError: true}));
           // if no actualVar, return
           if (!actualVar) {return};

           // for each ac in .varRef.accessors
           for( var ac__inx=0,ac ; ac__inx<this.varRef.accessors.length ; ac__inx++){ac=this.varRef.accessors[ac__inx];
                // declare valid ac.name

               // if ac isnt instance of Grammar.PropertyAccess
               if (!(ac instanceof Grammar.PropertyAccess)) {
                   actualVar = undefined;
                   // break
                   break;
               };

               // if ac.name is 'prototype'
               if (ac.name === 'prototype') {
                   actualVar = actualVar.findOwnMember(ac.name) || this.addMemberTo(actualVar, ac.name);
               }
               
               else {
                   actualVar = actualVar.findMember(ac.name) || this.addMemberTo(actualVar, ac.name);
               };
           };// end for each in this.varRef.accessors

           // end for

           // if actualVar, .setTypes actualVar
           if (actualVar) {this.setTypes(actualVar)};
           break;
           
     case 'on-the-fly':
            // #set type on-the-fly, from here until next type-assignment
            // #we allow more than one "declare x:type" on the same block
           var opt = new Names.NameDeclOptions();
           opt.informError = true;
           // if .varRef.tryGetReference(opt) into actualVar
           if ((actualVar=this.varRef.tryGetReference(opt))) {
               this.setTypes(actualVar);
           };
           break;
           
     
     };
    };


   // helper function AddGlobalClasses()
   function AddGlobalClasses(){

       var nameDecl = undefined;

       // for each name in arguments.toArray()
       var _list3=Array.prototype.slice.call(arguments);
       for( var name__inx=0,name ; name__inx<_list3.length ; name__inx++){name=_list3[name__inx];
           nameDecl = globalScope.addMember(name);
           nameDecl.addMember('prototype');

            // add to name affinity
           // if not nameAffinity.members.has(name)
           if (!(nameAffinity.members.has(name))) {
               nameAffinity.members.set(name, nameDecl);
           };
       };// end for each in Array.prototype.slice.call(arguments)
       
   };
