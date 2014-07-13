#include "Validate.h"
//-------------------------
//Module Validate
//-------------------------
var Validate_project;
var Validate_globalScope;
var Validate_nameAffinity;
any Validate_validate(DEFAULT_ARGUMENTS); //forward declare
any Validate_walkAllNodesCalling(DEFAULT_ARGUMENTS); //forward declare
any Validate_initialize(DEFAULT_ARGUMENTS); //forward declare
any Validate_tryGetGlobalPrototype(DEFAULT_ARGUMENTS); //forward declare
any Validate_globalPrototype(DEFAULT_ARGUMENTS); //forward declare
any Validate_addBuiltInClass(DEFAULT_ARGUMENTS); //forward declare
any Validate_addBuiltInObject(DEFAULT_ARGUMENTS); //forward declare
any Validate_AddGlobalClasses(DEFAULT_ARGUMENTS); //forward declare
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

   // import logger, UniqueID, Strings

   // shim import LiteCore, Map


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
   any Validate_validate(DEFAULT_ARGUMENTS){

// We start this module once the entire multi-node AST tree has been parsed.

// Start running passes on the AST

// #### Pass 1.0 Declarations
// Walk the tree, and call function 'declare' on every node having it.
// 'declare' will create scopes, and vars in the scope.
// May inform 'DUPLICATES' and 'CASE MISMATCH' errors.

       // logger.info "- Process Declarations"
       logger_info(undefined,1,(any_arr){any_str("- Process Declarations")});
       // walkAllNodesCalling 'declare'
       Validate_walkAllNodesCalling(undefined,1,(any_arr){any_str("declare")});

// #### Pass 1.1 Declare By Assignment
// Walk the tree, and check assignments looking for: 'module.exports.x=x' and 'x.prototype.y = '.
// Treat them as declarations.
//         logger.info "- Declare By Assignment (support .js syntax, .exports.x=..., .prototype.x=...)"
//         walkAllNodesCalling 'declareByAssignment'

// #### Pass 1.2 connectImportRequire
// handle: `import x` and `global declare x`
// Make var x point to imported module 'x' exports

        // declare valid project.moduleCache

       // logger.info "- Connect Imported"
       logger_info(undefined,1,(any_arr){any_str("- Connect Imported")});
       // for each moduleNode:Grammar.Module in map project.moduleCache
       any _list31=PROP(moduleCache_,Validate_project);
       { NameValuePair_ptr _nvp6=NULL; //name:value pair
        var moduleNode=undefined; //value
       for(int64_t moduleNode__inx=0 ; moduleNode__inx<_list31.value.arr->length ; moduleNode__inx++){
         assert(ITEM(moduleNode__inx,_list31).value.class==&NameValuePair_CLASSINFO);
       _nvp6 = ITEM(moduleNode__inx,_list31).value.ptr;
         moduleNode=_nvp6->value;

         // for each node in moduleNode.requireCallNodes
         any _list32=PROP(requireCallNodes_,moduleNode);
         { var node=undefined;
         for(int node__inx=0 ; node__inx<_list32.value.arr->length ; node__inx++){node=ITEM(node__inx,_list32);

            // declare valid node.importedModule.exports.members

           // if node.importedModule
           if (_anyToBool(PROP(importedModule_,node)))  {

             // var parent: ASTBase
             var parent = undefined;
             // var referenceNameDecl: Names.Declaration //var where to import exported module members
             var referenceNameDecl = undefined; //var where to import exported module members

              // declare valid parent.nameDecl


// 1st, more common: if node is Grammar.ImportStatementItem

             // if node instance of Grammar.ImportStatementItem
             if (_instanceof(node,Grammar_ImportStatementItem))  {
                  // declare node:Grammar.ImportStatementItem
                 // referenceNameDecl = node.nameDecl
                 referenceNameDecl = PROP(nameDecl_,node);

// if we process a 'global declare' command (interface)
// all exported should go to the global scope.

// If the imported module exports a class, e.g.: "export default class OptionsParser",
// 'importedModule.exports' points to the class 'prototype'.

                 // if node.getParent(Grammar.DeclareStatement) isnt undefined //is a "global declare"
                 if (!__is(CALL1(getParent_,node,Grammar_DeclareStatement),undefined))  { //is a "global declare"
                       // var moveWhat = node.importedModule.exports
                       var moveWhat = PROP(exports_,PROP(importedModule_,node));
                        // #if the module exports a "class-function", move to global with class name
                       // if moveWhat.findOwnMember('prototype') into var protoExportNameDecl
                       var protoExportNameDecl=undefined;
                       if (_anyToBool((protoExportNameDecl=CALL1(findOwnMember_,moveWhat,any_str("prototype")))))  {
                            //if it has a 'prototype'
                            //replace 'prototype' (on module.exports) with the class name, and add as the class
                           // protoExportNameDecl.name = protoExportNameDecl.parent.name
                           PROP(name_,protoExportNameDecl) = PROP(name_,PROP(parent_,protoExportNameDecl));
                           // project.rootModule.addToScope protoExportNameDecl
                           CALL1(addToScope_,PROP(rootModule_,Validate_project),protoExportNameDecl);
                       }
                       
                       else {
                            // a "declare global x", but "x.lite.md" do not export a class
                            // move all exported (namespace members) to global scope
                           // for each nameDecl in map moveWhat.members
                           any _list33=PROP(members_,moveWhat);
                           { NameValuePair_ptr _nvp7=NULL; //name:value pair
                            var nameDecl=undefined; //value
                           for(int64_t nameDecl__inx=0 ; nameDecl__inx<_list33.value.arr->length ; nameDecl__inx++){
                               assert(ITEM(nameDecl__inx,_list33).value.class==&NameValuePair_CLASSINFO);
                           _nvp7 = ITEM(nameDecl__inx,_list33).value.ptr;
                               nameDecl=_nvp7->value;
                               // project.rootModule.addToScope nameDecl
                               CALL1(addToScope_,PROP(rootModule_,Validate_project),nameDecl);
                           }};// end for each in map PROP(members_,moveWhat)
                           
                       };

                        //we moved all to the global scope, e.g.:"declare global jQuery" do not assign to referenceNameDecl
                       // referenceNameDecl = undefined
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
             if (_anyToBool(referenceNameDecl))  {
                 // referenceNameDecl.makePointTo node.importedModule.exports
                 CALL1(makePointTo_,referenceNameDecl,PROP(exports_,PROP(importedModule_,node)));
                  // if it has a 'prototype' => it's a Function-Class
                  // else we assume all exported from module is a namespace
                 // referenceNameDecl.isNamespace = no referenceNameDecl.findOwnMember('prototype')
                 PROP(isNamespace_,referenceNameDecl) = any_number(!_anyToBool(CALL1(findOwnMember_,referenceNameDecl,any_str("prototype"))));
             };
           };
         }};// end for each in PROP(requireCallNodes_,moduleNode)
         
       }};// end for each in map PROP(moduleCache_,Validate_project)


// #### Pass 1.3 Process "Append To" Declarations
// Since 'append to [class|object] x.y.z' statement can add to any object, we delay
// "Append To" declaration to this point, where 'x.y.z' can be analyzed and a reference obtained.
// Walk the tree, and check "Append To" Methods & Properties Declarations

       // logger.info "- Processing Append-To"
       logger_info(undefined,1,(any_arr){any_str("- Processing Append-To")});
       // walkAllNodesCalling 'processAppendTo'
       Validate_walkAllNodesCalling(undefined,1,(any_arr){any_str("processAppendTo")});


// #### Pass 2.0 Apply Name Affinity

       // logger.info "- Apply Name Affinity"
       logger_info(undefined,1,(any_arr){any_str("- Apply Name Affinity")});

        // #first, try to assign type by "name affinity"
        // #(only applies when type is not specified)
       // for each nameDecl in Names.allNameDeclarations
       any _list34=Names_allNameDeclarations;
       { var nameDecl=undefined;
       for(int nameDecl__inx=0 ; nameDecl__inx<_list34.value.arr->length ; nameDecl__inx++){nameDecl=ITEM(nameDecl__inx,_list34);
           // nameDecl.assignTypebyNameAffinity()
           CALL0(assignTypebyNameAffinity_,nameDecl);
       }};// end for each in Names_allNameDeclarations

// #### Pass 2.1 Convert Types
// for each Names.Declaration try to find the declared 'type' (string) in the scope.
// Repeat until no conversions can be made.

       // logger.info "- Converting Types"
       logger_info(undefined,1,(any_arr){any_str("- Converting Types")});

        // #now try de-referencing types
       // var pass=0, sumConverted=0, sumFailures=0, lastSumFailures=0
       var pass = any_number(0), sumConverted = any_number(0), sumFailures = any_number(0), lastSumFailures = any_number(0);
        // #repeat until all converted
       // do
       do{

           // lastSumFailures = sumFailures
           lastSumFailures = sumFailures;
           // sumFailures = 0
           sumFailures = any_number(0);
           // sumConverted = 0
           sumConverted = any_number(0);

            // #process all, sum conversion failures
           // for each nameDecl in Names.allNameDeclarations
           any _list35=Names_allNameDeclarations;
           { var nameDecl=undefined;
           for(int nameDecl__inx=0 ; nameDecl__inx<_list35.value.arr->length ; nameDecl__inx++){nameDecl=ITEM(nameDecl__inx,_list35);
               // var result = nameDecl.processConvertTypes()
               var result = CALL0(processConvertTypes_,nameDecl);
               // sumFailures += result.failures
               sumFailures.value.number += _anyToNumber(PROP(failures_,result));
               // sumConverted += result.converted
               sumConverted.value.number += _anyToNumber(PROP(converted_,result));
           }};// end for each in Names_allNameDeclarations
           // end for

           // pass++
           pass.value.number++;
       } while (!(__is(sumFailures,lastSumFailures)));// end loop

       // if sumConverted<=0 or sumFailures>0
       if (_anyToBool(__or(any_number(_anyToNumber(sumConverted) <= 0),any_number(_anyToNumber(sumFailures) > 0))))  {
           // logger.info "- Converted OK:#{sumConverted}, fails:#{sumFailures}"
           logger_info(undefined,1,(any_arr){_concatAny(4,(any_arr){any_str("- Converted OK:"), sumConverted, any_str(", fails:"), sumFailures})});
       };

// Inform unconverted types as errors

       // if sumFailures #there was failures, inform al errors
       if (_anyToBool(sumFailures))  {// #there was failures, inform al errors
           // var opt = new Names.NameDeclOptions
           var opt = new(Names_NameDeclOptions,0,NULL);
           // opt.informError = true
           PROP(informError_,opt) = true;
           // for each nameDecl in Names.allNameDeclarations
           any _list36=Names_allNameDeclarations;
           { var nameDecl=undefined;
           for(int nameDecl__inx=0 ; nameDecl__inx<_list36.value.arr->length ; nameDecl__inx++){nameDecl=ITEM(nameDecl__inx,_list36);
               // nameDecl.processConvertTypes(opt)
               CALL1(processConvertTypes_,nameDecl,opt);
           }};// end for each in Names_allNameDeclarations
           
       };

// #### Pass 3 Evaluate Assignments
// Walk the scope tree, and for each assignment,
// IF L-value has no type, try to guess from R-value's result type

       // logger.info "- Evaluating Assignments"
       logger_info(undefined,1,(any_arr){any_str("- Evaluating Assignments")});
       // walkAllNodesCalling 'evaluateAssignments'
       Validate_walkAllNodesCalling(undefined,1,(any_arr){any_str("evaluateAssignments")});

// #### Pass 4 -Final- Validate Property Access
// Once we have all vars declared and typed, walk the AST,
// and for each VariableRef validate property access.
// May inform 'UNDECLARED PROPERTY'.

       // logger.info "- Validating Property Access"
       logger_info(undefined,1,(any_arr){any_str("- Validating Property Access")});
       // walkAllNodesCalling 'validatePropertyAccess'
       Validate_walkAllNodesCalling(undefined,1,(any_arr){any_str("validatePropertyAccess")});

// Inform forward declarations not fulfilled, as errors

       // for each nameDecl in Names.allNameDeclarations
       any _list37=Names_allNameDeclarations;
       { var nameDecl=undefined;
       for(int nameDecl__inx=0 ; nameDecl__inx<_list37.value.arr->length ; nameDecl__inx++){nameDecl=ITEM(nameDecl__inx,_list37);

           // if nameDecl.isForward and not nameDecl.isDummy
           if (_anyToBool(PROP(isForward_,nameDecl)) && !(_anyToBool(PROP(isDummy_,nameDecl))))  {

               // nameDecl.warn "forward declared, but never found"
               CALL1(warn_,nameDecl,any_str("forward declared, but never found"));
               // var container = nameDecl.nodeDeclared.getParent(Grammar.ClassDeclaration)
               var container = CALL1(getParent_,PROP(nodeDeclared_,nameDecl),Grammar_ClassDeclaration);
               // if container
               if (_anyToBool(container))  {
                  // declare container:Grammar.ClassDeclaration
                  // declare valid container.varRef.toString
                 // if container.varRef, logger.warning "#{container.positionText()} more info: '#{nameDecl.name}' of '#{container.varRef.toString()}'"
                 if (_anyToBool(PROP(varRef_,container))) {logger_warning(undefined,1,(any_arr){_concatAny(6,(any_arr){(CALL0(positionText_,container)), any_str(" more info: '"), PROP(name_,nameDecl), any_str("' of '"), (CALL0(toString_,PROP(varRef_,container))), any_str("'")})});};
               };
           };
       }};// end for each in Names_allNameDeclarations
       
   }

   // export function walkAllNodesCalling(methodName:string)
   any Validate_walkAllNodesCalling(DEFAULT_ARGUMENTS){// define named params
       var methodName= argc? arguments[0] : undefined;
       //---------

       // var methodSymbol
       var methodSymbol = undefined;
       // methodSymbol = LiteCore.getSymbol(methodName)
       methodSymbol = LiteCore_getSymbol(undefined,1,(any_arr){methodName});

// For all modules, for each node, if the specific AST node has methodName, call it

       // for each moduleNode:Grammar.Module in map project.moduleCache
       any _list38=PROP(moduleCache_,Validate_project);
       { NameValuePair_ptr _nvp8=NULL; //name:value pair
        var moduleNode=undefined; //value
       for(int64_t moduleNode__inx=0 ; moduleNode__inx<_list38.value.arr->length ; moduleNode__inx++){
           assert(ITEM(moduleNode__inx,_list38).value.class==&NameValuePair_CLASSINFO);
       _nvp8 = ITEM(moduleNode__inx,_list38).value.ptr;
           moduleNode=_nvp8->value;
           // moduleNode.callOnSubTree methodSymbol
           CALL1(callOnSubTree_,moduleNode,methodSymbol);
       }};// end for each in map PROP(moduleCache_,Validate_project)
       
   }


   // export function initialize(aProject)
   any Validate_initialize(DEFAULT_ARGUMENTS){// define named params
       var aProject= argc? arguments[0] : undefined;
       //---------

// Initialize module vars

       // project = aProject
       Validate_project = aProject;

        // #clear global Names.Declaration list
       // Names.allNameDeclarations = []
       Names_allNameDeclarations = _newArray(0,NULL);

// initialize NameAffinity

       // var options = new Names.NameDeclOptions
       var options = new(Names_NameDeclOptions,0,NULL);
       // options.normalizeModeKeepFirstCase = true #nameAffinity members are stored: [0].Toupper()+slice(1).toLower()
       PROP(normalizeModeKeepFirstCase_,options) = true;// #nameAffinity members are stored: [0].Toupper()+slice(1).toLower()
       // nameAffinity= new Names.Declaration('Name Affinity',options) # project-wide name affinity for classes
       Validate_nameAffinity = new(Names_Declaration,2,(any_arr){any_str("Name Affinity"), options});// # project-wide name affinity for classes

        //populateGlobalScope(aProject)

// The "scope" of rootNode is the global scope.

       // globalScope = project.rootModule.createScope()
       Validate_globalScope = CALL0(createScope_,PROP(rootModule_,Validate_project));

// Initialize global scope
// a)non-instance values

       // globalScope.addMember 'undefined'
       CALL1(addMember_,Validate_globalScope,any_str("undefined"));
       // var opt = new Names.NameDeclOptions
       var opt = new(Names_NameDeclOptions,0,NULL);
       // opt.value = null
       PROP(value_,opt) = null;
       // globalScope.addMember 'null',opt
       CALL2(addMember_,Validate_globalScope,any_str("null"), opt);
       // opt.value = true
       PROP(value_,opt) = true;
       // globalScope.addMember 'true',opt
       CALL2(addMember_,Validate_globalScope,any_str("true"), opt);
       // opt.value = false
       PROP(value_,opt) = false;
       // globalScope.addMember 'false',opt
       CALL2(addMember_,Validate_globalScope,any_str("false"), opt);
       // opt.value = NaN
       PROP(value_,opt) = NaN;
       // globalScope.addMember 'NaN',opt
       CALL2(addMember_,Validate_globalScope,any_str("NaN"), opt);
       // opt.value = Infinity
       PROP(value_,opt) = Infinity;
       // globalScope.addMember 'Infinity',opt
       CALL2(addMember_,Validate_globalScope,any_str("Infinity"), opt);

// b) pre-create core classes, to allow the interface.md file to declare property types and return values

       // AddGlobalClasses
       Validate_AddGlobalClasses(undefined,7,(any_arr){any_str("Object"), any_str("Function"), any_str("Array"), any_str("String"), any_str("Number"), any_str("Date"), any_str("Boolean")});

// note: 'Map' and 'NameValuePair' are declared at GlobalScopeX.interface.md


// b) create special types

// b.1) arguments:any*

// "arguments:any*" - arguments, type: pointer to any

// 'arguments' is a local var to all functions, representing a pseudo-array witj all the arguments.
// 'arguments' has only one method: `arguments.toArray()`

// we declare here the type:"pointer to any" - "any*"

       // var argumentsType = globalScope.addMember('any*') //  any pointer, type for "arguments"
       var argumentsType = CALL1(addMember_,Validate_globalScope,any_str("any*")); //  any pointer, type for "arguments"
       // opt.value = undefined
       PROP(value_,opt) = undefined;
       // opt.type = globalPrototype('Function')
       PROP(type_,opt) = Validate_globalPrototype(undefined,1,(any_arr){any_str("Function")});
       // opt.returnType=globalPrototype('Array')
       PROP(returnType_,opt) = Validate_globalPrototype(undefined,1,(any_arr){any_str("Array")});
       // argumentsType.addMember('toArray',opt)
       CALL2(addMember_,argumentsType,any_str("toArray"), opt);

// b.2) Lite-C: the Lexer replaces string interpolation with calls to `__concatAny`

       // opt.returnType=globalPrototype('String')
       PROP(returnType_,opt) = Validate_globalPrototype(undefined,1,(any_arr){any_str("String")});
       // globalScope.addMember '_concatAny',opt //used for string interpolation
       CALL2(addMember_,Validate_globalScope,any_str("_concatAny"), opt); //used for string interpolation

       // opt.returnType=undefined
       PROP(returnType_,opt) = undefined;
       // globalScope.addMember 'parseFloat',opt //used for string interpolation
       CALL2(addMember_,Validate_globalScope,any_str("parseFloat"), opt); //used for string interpolation
       // globalScope.addMember 'parseInt',opt //used for string interpolation
       CALL2(addMember_,Validate_globalScope,any_str("parseInt"), opt); //used for string interpolation

        //var core = globalScope.addMember('LiteCore') //core supports
        //core.isNamespace = true
        //opt.returnType='Number'
        //core.addMember 'getSymbol',opt //to get a symbol (int) from a symbol name (string)

// b.3) "any" default type for vars

       // globalScope.addMember 'any' // used for "map string to any" - Dictionaries
       CALL1(addMember_,Validate_globalScope,any_str("any")); // used for "map string to any" - Dictionaries

// Process the global scope declarations interface file: GlobalScopeJS.interface.md

       // var globalInterfaceFile = '#{process.cwd()}/lib/GlobalScope#{project.options.target.toUpperCase()}'
       var globalInterfaceFile = _concatAny(3,(any_arr){(process_cwd(undefined,0,NULL)), any_str("/lib/GlobalScope"), (CALL0(toUpperCase_,PROP(target_,PROP(options_,Validate_project))))});
       // logger.msg "Declare global scope using ", globalInterfaceFile
       logger_msg(undefined,2,(any_arr){any_str("Declare global scope using "), globalInterfaceFile});
       // var globalInterfaceModule = project.compileFile(globalInterfaceFile)
       var globalInterfaceModule = CALL1(compileFile_,Validate_project,globalInterfaceFile);

// For the globalInterfaceModule, which have parsed GlobalScopeJS.interface.md file
// we call "declare" on all nodes, create the Names.Declaration

       // var methodSymbol = LiteCore.getSymbol('declare')
       var methodSymbol = LiteCore_getSymbol(undefined,1,(any_arr){any_str("declare")});

// calll "declare" on each item of the GlobalScope interface file, to create the NameDeclarations

       // globalInterfaceModule.callOnSubTree methodSymbol
       CALL1(callOnSubTree_,globalInterfaceModule,methodSymbol);

// move all exported from the interface file, to project.rootModule global scope

       // for each nameDecl in map globalInterfaceModule.exports.members
       any _list39=PROP(members_,PROP(exports_,globalInterfaceModule));
       { NameValuePair_ptr _nvp9=NULL; //name:value pair
        var nameDecl=undefined; //value
       for(int64_t nameDecl__inx=0 ; nameDecl__inx<_list39.value.arr->length ; nameDecl__inx++){
           assert(ITEM(nameDecl__inx,_list39).value.class==&NameValuePair_CLASSINFO);
       _nvp9 = ITEM(nameDecl__inx,_list39).value.ptr;
           nameDecl=_nvp9->value;
           // project.rootModule.addToSpecificScope globalScope, nameDecl
           CALL2(addToSpecificScope_,PROP(rootModule_,Validate_project),Validate_globalScope, nameDecl);
       }};// end for each in map PROP(members_,PROP(exports_,globalInterfaceModule))

// Initial NameAffinity, err|xxxErr => type:Error

       // if tryGetGlobalPrototype('Error') into var errProto:Names.Declaration
       var errProto=undefined;
       if (_anyToBool((errProto=Validate_tryGetGlobalPrototype(undefined,1,(any_arr){any_str("Error")}))))  {
           // nameAffinity.members.set 'Err',errProto.parent // err|xxxErr => type:Error
           CALL2(set_,PROP(members_,Validate_nameAffinity),any_str("Err"), PROP(parent_,errProto)); // err|xxxErr => type:Error
       };
   }


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
   any Validate_tryGetGlobalPrototype(DEFAULT_ARGUMENTS){// define named params
     var name= argc? arguments[0] : undefined;
     //---------
// gets a var from global scope

     // if globalScope.findOwnMember(name) into var nameDecl
     var nameDecl=undefined;
     if (_anyToBool((nameDecl=CALL1(findOwnMember_,Validate_globalScope,name))))  {
         // return nameDecl.members.get("prototype")
         return CALL1(get_,PROP(members_,nameDecl),any_str("prototype"));
     };
   }

   // helper function globalPrototype(name)
   any Validate_globalPrototype(DEFAULT_ARGUMENTS){// define named params
     var name= argc? arguments[0] : undefined;
     //---------
// gets a var from global scope

     // if name instanceof Names.Declaration, return name #already converted type
     if (_instanceof(name,Names_Declaration)) {return name;};

     // if not globalScope.findOwnMember(name) into var nameDecl
     var nameDecl=undefined;
     if (!(_anyToBool((nameDecl=CALL1(findOwnMember_,Validate_globalScope,name)))))  {
       // fail with "no '#{name}' in global scope"
       throw(new(Error,1,(any_arr){_concatAny(3,(any_arr){any_str("no '"), name, any_str("' in global scope")})}));;
     };

     // if no nameDecl.findOwnMember("prototype") into var protoNameDecl
     var protoNameDecl=undefined;
     if (!(_anyToBool((protoNameDecl=CALL1(findOwnMember_,nameDecl,any_str("prototype"))))))  {
       // fail with "global scope type '#{name}' must have a 'prototype' property"
       throw(new(Error,1,(any_arr){_concatAny(3,(any_arr){any_str("global scope type '"), name, any_str("' must have a 'prototype' property")})}));;
     };

     // return protoNameDecl
     return protoNameDecl;
   }


   // helper function addBuiltInClass(name,node) returns Names.Declaration
   any Validate_addBuiltInClass(DEFAULT_ARGUMENTS){// define named params
     var name, node;
     name=node=undefined;
     switch(argc){
       case 2:node=arguments[1];
       case 1:name=arguments[0];
     }
     //---------
// Add a built-in class to global scope, return class prototype

     // var nameDecl = new Names.Declaration( name,{isBuiltIn:true},node )
     var nameDecl = new(Names_Declaration,3,(any_arr){name, new(Map,1,(any_arr){
     {&NameValuePair_CLASSINFO,&((NameValuePair_s){any_str("isBuiltIn"),true})}
     }), node});
     // globalScope.addMember nameDecl
     CALL1(addMember_,Validate_globalScope,nameDecl);

     // nameDecl.getMembersFromObjProperties Environment.getGlobalObject(name)
     CALL1(getMembersFromObjProperties_,nameDecl,Environment_getGlobalObject(undefined,1,(any_arr){name}));

     // if no nameDecl.findOwnMember("prototype") into var classProto:Names.Declaration
     var classProto=undefined;
     if (!(_anyToBool((classProto=CALL1(findOwnMember_,nameDecl,any_str("prototype"))))))  {
         // throw("addBuiltInClass '#{name}, expected to have a prototype")
         throw((_concatAny(3,(any_arr){any_str("addBuiltInClass '"), name, any_str(", expected to have a prototype")})));
     };

     // nameDecl.setMember '**proto**', globalPrototype('Function')
     CALL2(setMember_,nameDecl,any_str("**proto**"), Validate_globalPrototype(undefined,1,(any_arr){any_str("Function")}));
      // commented v0.8: classes can not be used as functions.
      // nameDecl.setMember '**return type**', classProto

     // return classProto
     return classProto;
   }


   // helper function addBuiltInObject(name,node) returns Names.Declaration
   any Validate_addBuiltInObject(DEFAULT_ARGUMENTS){// define named params
     var name, node;
     name=node=undefined;
     switch(argc){
       case 2:node=arguments[1];
       case 1:name=arguments[0];
     }
     //---------
// Add a built-in object to global scope, return object

     // var nameDecl = new Names.Declaration(name, {isBuiltIn:true},node)
     var nameDecl = new(Names_Declaration,3,(any_arr){name, new(Map,1,(any_arr){
     {&NameValuePair_CLASSINFO,&((NameValuePair_s){any_str("isBuiltIn"),true})}
     }), node});
     // globalScope.addMember nameDecl
     CALL1(addMember_,Validate_globalScope,nameDecl);
     // nameDecl.getMembersFromObjProperties Environment.getGlobalObject(name)
     CALL1(getMembersFromObjProperties_,nameDecl,Environment_getGlobalObject(undefined,1,(any_arr){name}));

     // if nameDecl.findOwnMember("prototype")
     if (_anyToBool(CALL1(findOwnMember_,nameDecl,any_str("prototype"))))  {
         // throw("addBuiltObject '#{name}, expected *Object* to have not a prototype")
         throw((_concatAny(3,(any_arr){any_str("addBuiltObject '"), name, any_str(", expected *Object* to have not a prototype")})));
     };

     // return nameDecl
     return nameDecl;
   }

// ---------------------------------------
// ----------------------------------------
// ----------------------------------------

   // append to namespace Names

     // class ConvertResult
     // Names_ConvertResult
     
     any Names_ConvertResult; //Class Object
     //auto Names_ConvertResult__init
     void Names_ConvertResult__init(any this, len_t argc, any* arguments){
       PROP(converted_,this)=any_number(0);
       PROP(failures_,this)=any_number(0);
     };
       // properties
       ;
     

// ##Additions to Names.Declaration. Helper methods to do validation

   // append to class Names.Declaration

    // helper method findMember(name) returns Names.Declaration
    any Names_Declaration_findMember(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Names_Declaration));
       //---------
       // define named params
       var name= argc? arguments[0] : undefined;
       //---------
// this method looks for a name in Names.Declaration members,
// it also follows the **proto** chain (same mechanism as js __proto__ chain)

       // var actual = this
       var actual = this;
       // var count=0
       var count = any_number(0);

       // do while actual instance of Names.Declaration
       while(_instanceof(actual,Names_Declaration)){

           // if actual.findOwnMember(name) into var result
           var result=undefined;
           if (_anyToBool((result=CALL1(findOwnMember_,actual,name))))  {
              // return result
              return result;
           };

// We use a member named '**proto**' on NameDeclarations, mapping run-time proto chain.
// We follow the chain to validate property names.

           // var nextInChain = actual.findOwnMember('**proto**')
           var nextInChain = CALL1(findOwnMember_,actual,any_str("**proto**"));

// As last option in the chain, we always use 'Object.prototype'

           // if no nextInChain and actual isnt globalPrototype('Object')
           if (!_anyToBool(nextInChain) && !__is(actual,Validate_globalPrototype(undefined,1,(any_arr){any_str("Object")})))  {
             // nextInChain = globalPrototype('Object')
             nextInChain = Validate_globalPrototype(undefined,1,(any_arr){any_str("Object")});
           };

           // actual = nextInChain
           actual = nextInChain;

           // if count++ > 50 #assume circular
           if (count.value.number++ > 50)  {// #assume circular
               // .warn "circular type reference"
               CALL1(warn_,this,any_str("circular type reference"));
               // return
               return undefined;
           };
       };// end loop
       
    }


    // helper method isInstanceof(name) returns boolean
    any Names_Declaration_isInstanceof(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Names_Declaration));
       //---------
       // define named params
       var name= argc? arguments[0] : undefined;
       //---------
// this method looks for a name in Names.Declaration members **proto**->prototpye->parent
// it also follows the **proto** chain (same mechanism as js __proto__ chain)

       // var actual = this
       var actual = this;
       // var count=0
       var count = any_number(0);

       // do while actual instance of Names.Declaration
       while(_instanceof(actual,Names_Declaration)){

           // if actual.name is 'prototype' and actual.parent.name is name
           if (__is(PROP(name_,actual),any_str("prototype")) && __is(PROP(name_,PROP(parent_,actual)),name))  {
               // return true
               return true;
           };

// We use a member named '**proto**' on NameDeclarations, mapping run-time proto chain.
// We follow the chain to validate property names.

           // var nextInChain = actual.findOwnMember('**proto**')
           var nextInChain = CALL1(findOwnMember_,actual,any_str("**proto**"));

// As last option in the chain, we always use 'Object.prototype'

           // if no nextInChain and actual isnt globalPrototype('Object')
           if (!_anyToBool(nextInChain) && !__is(actual,Validate_globalPrototype(undefined,1,(any_arr){any_str("Object")})))  {
               // nextInChain = globalPrototype('Object')
               nextInChain = Validate_globalPrototype(undefined,1,(any_arr){any_str("Object")});
           };

           // actual = nextInChain
           actual = nextInChain;

           // if count++ > 50 #assume circular
           if (count.value.number++ > 50)  {// #assume circular
               // .warn "circular type reference"
               CALL1(warn_,this,any_str("circular type reference"));
               // return
               return undefined;
           };
       };// end loop
       
    }

    // helper method getMembersFromObjProperties(obj) #Recursive
    any Names_Declaration_getMembersFromObjProperties(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Names_Declaration));
       //---------
       // define named params
       var obj= argc? arguments[0] : undefined;
       //---------
// Recursively converts a obj properties in NameDeclarations.
// it's used when a pure.js module is imported by 'require'
// to convert required 'exports' to LiteScript compiler usable NameDeclarations
// Also to load the global scope with built-in objects

        //ifdef PROD_C
       // return
       return undefined;
    }
        //else
        //var newMember:Names.Declaration
//
        //if obj instanceof Object or obj is Object.prototype
//
            //for each prop in Object.getOwnPropertyNames(obj) #even not enumerables
                //where prop not in ['__proto__','arguments','caller'] #exclude __proto__
//
                    //var type =  Grammar.autoCapitalizeCoreClasses(typeof obj[prop])
                    //type = tryGetGlobalPrototype(type) #core classes: Function, Object, String
                    //if type is this, type = undefined #avoid circular references
//
                    //newMember = .addMember(prop,{type:type})
//
//on 'prototype' member or
//if member is a Function-class - dive into
//
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
//
        //end if



    // helper method isInParents(name)
    any Names_Declaration_isInParents(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Names_Declaration));
       //---------
       // define named params
       var name= argc? arguments[0] : undefined;
       //---------
// return true if a property name is in the parent chain.
// Used to avoid recursing circular properties

       // var nameDecl = this.parent
       var nameDecl = PROP(parent_,this);
       // while nameDecl
       while(_anyToBool(nameDecl)){
         // if nameDecl.findOwnMember(name), return true
         if (_anyToBool(CALL1(findOwnMember_,nameDecl,name))) {return true;};
         // nameDecl = nameDecl.parent
         nameDecl = PROP(parent_,nameDecl);
       };// end loop
       
    }


    // helper method processConvertTypes(options) returns Names.ConvertResult
    any Names_Declaration_processConvertTypes(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Names_Declaration));
       //---------
       // define named params
       var options= argc? arguments[0] : undefined;
       //---------
// convert possible types stored in Names.Declaration,
// from string/varRef to other NameDeclarations in the scope

       // var result = new Names.ConvertResult
       var result = new(Names_ConvertResult,0,NULL);

       // .convertType '**proto**',result,options  #try convert main type
       CALL3(convertType_,this,any_str("**proto**"), result, options);// #try convert main type
       // .convertType '**return type**',result,options  #a Function can have **return type**
       CALL3(convertType_,this,any_str("**return type**"), result, options);// #a Function can have **return type**
       // .convertType '**item type**',result,options  #an Array can have **item type** e.g.: 'var list: string array'
       CALL3(convertType_,this,any_str("**item type**"), result, options);// #an Array can have **item type** e.g.: 'var list: string array'

       // return result
       return result;
    }


    // helper method convertType(internalName, result: Names.ConvertResult, options: Names.NameDeclOptions)
    any Names_Declaration_convertType(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Names_Declaration));
       //---------
       // define named params
       var internalName, result, options;
       internalName=result=options=undefined;
       switch(argc){
         case 3:options=arguments[2];
         case 2:result=arguments[1];
         case 1:internalName=arguments[0];
       }
       //---------
// convert type from string to NameDeclarations in the scope.
// returns 'true' if converted, 'false' if it has to be tried later

       // if no .findOwnMember(internalName) into var typeRef
       var typeRef=undefined;
       if (!(_anyToBool((typeRef=CALL1(findOwnMember_,this,internalName)))))  {
            // #nothing to process
           // return
           return undefined;
       };

       // if typeRef instance of Names.Declaration
       if (_instanceof(typeRef,Names_Declaration))  {
            // #already converted, nothing to do
           // return
           return undefined;
       };

       // var converted:Names.Declaration
       var converted = undefined;

        // # if the typeRef is a varRef, get reference
       // if typeRef instanceof Grammar.VariableRef
       if (_instanceof(typeRef,Grammar_VariableRef))  {
            // declare typeRef:Grammar.VariableRef
           // converted = typeRef.tryGetReference()
           converted = CALL0(tryGetReference_,typeRef);
       }
       
       else if (__is(_typeof(typeRef),any_str("string")))  {// #built-in class or local var

           // if no .nodeDeclared #converting typeRef for a var not declared in code
           if (!_anyToBool(PROP(nodeDeclared_,this)))  {// #converting typeRef for a var not declared in code
             // converted = globalPrototype(typeRef)
             converted = Validate_globalPrototype(undefined,1,(any_arr){typeRef});
           }
           
           else {
             // converted = .nodeDeclared.findInScope(typeRef)
             converted = CALL1(findInScope_,PROP(nodeDeclared_,this),typeRef);
           };
           // end if
           
       }
       
       else {
            // declare valid typeRef.constructor.name
           // .sayErr "INTERNAL ERROR: convertType UNRECOGNIZED type of:'#{typeof typeRef}' on #{internalName}: '#{typeRef}' [#{typeRef.constructor.name}]"
           CALL1(sayErr_,this,_concatAny(9,(any_arr){any_str("INTERNAL ERROR: convertType UNRECOGNIZED type of:'"), (_typeof(typeRef)), any_str("' on "), internalName, any_str(": '"), typeRef, any_str("' ["), PROP(name_,any_class(typeRef.class)), any_str("]")}));
           // return
           return undefined;
       };

       // end if #check instance of "typeRef"


       // if converted
       if (_anyToBool(converted))  {
            // #move to prototype if referenced is a class
           // if converted.findOwnMember("prototype") into var prototypeNameDecl
           var prototypeNameDecl=undefined;
           if (_anyToBool((prototypeNameDecl=CALL1(findOwnMember_,converted,any_str("prototype")))))  {
               // converted = prototypeNameDecl
               converted = prototypeNameDecl;
           };
            // #store converted
           // .setMember(internalName,converted)
           CALL2(setMember_,this,internalName, converted);
           // result.converted++
           PROP(converted_,result).value.number++;
       }
       
       else {
           // result.failures++
           PROP(failures_,result).value.number++;
           // if options and options.informError, .sayErr "Undeclared type: '#{typeRef.toString()}'"
           if (_anyToBool(options) && _anyToBool(PROP(informError_,options))) {CALL1(sayErr_,this,_concatAny(3,(any_arr){any_str("Undeclared type: '"), (CALL0(toString_,typeRef)), any_str("'")}));};
       };
       // end if

       // return
       return undefined;
    }


    // helper method assignTypeFromValue(value)
    any Names_Declaration_assignTypeFromValue(DEFAULT_ARGUMENTS){
     assert(_instanceof(this,Names_Declaration));
     //---------
     // define named params
     var value= argc? arguments[0] : undefined;
     //---------
// if we can determine assigned value type, set var type

      // declare valid value.getResultType
     // var valueNameDecl = value.getResultType()
     var valueNameDecl = CALL0(getResultType_,value);

// now set var type (unless is "null" or "undefined", because they destroy type info)

     // if valueNameDecl instance of Names.Declaration
     if (_instanceof(valueNameDecl,Names_Declaration) && CALL1(indexOf_,_newArray(2,(any_arr){any_str("undefined"), any_str("null")}),PROP(name_,valueNameDecl)).value.number==-1)  {

           // var theType
           var theType = undefined;
           // if valueNameDecl.name is 'prototype' # getResultType returns a class prototype
           if (__is(PROP(name_,valueNameDecl),any_str("prototype")))  {// # getResultType returns a class prototype
                // use the class as type
               // theType = valueNameDecl
               theType = valueNameDecl;
           }
                // use the class as type
           
           else {
                //we assume valueNameDecl is a simple var, then we try to get **proto**
               // theType = valueNameDecl.findOwnMember('**proto**') or valueNameDecl
               theType = __or(CALL1(findOwnMember_,valueNameDecl,any_str("**proto**")),valueNameDecl);
           };
           // end if

            // assign type: now both nameDecls points to same type
           // .setMember '**proto**', theType
           CALL2(setMember_,this,any_str("**proto**"), theType);
     };
    }



    // helper method assignTypebyNameAffinity()
    any Names_Declaration_assignTypebyNameAffinity(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Names_Declaration));
       //---------
// Auto-assign type by name affinity.
// If no type specified, check project.nameAffinity

       // if .nodeDeclared and not Strings.isCapitalized(.name) and .name isnt 'prototype'
       if (_anyToBool(PROP(nodeDeclared_,this)) && !(_anyToBool(Strings_isCapitalized(undefined,1,(any_arr){PROP(name_,this)}))) && !__is(PROP(name_,this),any_str("prototype")))  {

           // if not .findOwnMember('**proto**')
           if (!(_anyToBool(CALL1(findOwnMember_,this,any_str("**proto**")))))  {

               // var possibleClassRef:Names.Declaration
               var possibleClassRef = undefined;
                // # possibleClassRef is a Names.Declaration whose .nodeDeclared is a ClassDeclaration

                // #should look as className. Also when searching with "endsWith",
                // # nameAffinity declarations are stored capitalized
               // var asClassName = .name.capitalized()
               var asClassName = CALL0(capitalized_,PROP(name_,this));

                // # look in name affinity map
               // if no nameAffinity.members.get(.name) into possibleClassRef
               if (!(_anyToBool((possibleClassRef=CALL1(get_,PROP(members_,Validate_nameAffinity),PROP(name_,this))))))  {
                    // # make first letter uppercase, e.g.: convert 'lexer' to 'Lexer'
                    // # try with name, 1st letter capitalized
                   // possibleClassRef = nameAffinity.members.get(asClassName)
                   possibleClassRef = CALL1(get_,PROP(members_,Validate_nameAffinity),asClassName);
               };
               // end if

                // # check 'ends with' if name is at least 6 chars in length
               // if not possibleClassRef and .name.length>=6
               if (!(_anyToBool(possibleClassRef)) && _length(PROP(name_,this)) >= 6)  {
                   // for each affinityName,classRef in map nameAffinity.members
                   any _list40=PROP(members_,Validate_nameAffinity);
                   { NameValuePair_ptr _nvp10=NULL; //name:value pair
                        var affinityName=undefined; //key
                    var classRef=undefined; //value
                   for(int64_t classRef__inx=0 ; classRef__inx<_list40.value.arr->length ; classRef__inx++){
                       assert(ITEM(classRef__inx,_list40).value.class==&NameValuePair_CLASSINFO);
                   _nvp10 = ITEM(classRef__inx,_list40).value.ptr;
                       affinityName=_nvp10->name;
                       classRef=_nvp10->value;
                       // if asClassName.endsWith(affinityName)
                       if (_anyToBool(CALL1(endsWith_,asClassName,affinityName)))  {
                           // possibleClassRef = classRef
                           possibleClassRef = classRef;
                           // break
                           break;
                       };
                   }};// end for each in map PROP(members_,Validate_nameAffinity)
                   
               };

                // #if there is a candidate class, check of it has a defined prototype
               // if possibleClassRef and possibleClassRef.findOwnMember("prototype") into var prototypeNameDecl
               var prototypeNameDecl=undefined;
               if (_anyToBool(possibleClassRef) && _anyToBool((prototypeNameDecl=CALL1(findOwnMember_,possibleClassRef,any_str("prototype")))))  {
                     // .setMember '**proto**', prototypeNameDecl
                     CALL2(setMember_,this,any_str("**proto**"), prototypeNameDecl);
                     // return true
                     return true;
               };
           };
       };
    }


// --------------------------------
// ## Helper methods added to AST Tree

   // append to class ASTBase

    // properties
    ;

    // helper method declareName(name, options)
    any ASTBase_declareName(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,ASTBase));
       //---------
       // define named params
       var name, options;
       name=options=undefined;
       switch(argc){
         case 2:options=arguments[1];
         case 1:name=arguments[0];
       }
       //---------
// declareName creates a new Names.Declaration, *referecing source as nodeDeclared (AST node)*

       // return new Names.Declaration(name, options, this)
       return new(Names_Declaration,3,(any_arr){name, options, this});
    }

    // method addMemberTo(nameDecl, memberName, options)  returns Names.Declaration
    any ASTBase_addMemberTo(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,ASTBase));
       //---------
       // define named params
       var nameDecl, memberName, options;
       nameDecl=memberName=options=undefined;
       switch(argc){
         case 3:options=arguments[2];
         case 2:memberName=arguments[1];
         case 1:nameDecl=arguments[0];
       }
       //---------
// a Helper method ASTBase.*addMemberTo*
// Adds a member to a NameDecl, referencing this node as nodeDeclared

       // return nameDecl.addMember(memberName, options, this)
       return CALL3(addMember_,nameDecl,memberName, options, this);
    }

    // helper method tryGetMember(nameDecl, name:string, options:Names.NameDeclOptions)
    any ASTBase_tryGetMember(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,ASTBase));
       //---------
       // define named params
       var nameDecl, name, options;
       nameDecl=name=options=undefined;
       switch(argc){
         case 3:options=arguments[2];
         case 2:name=arguments[1];
         case 1:nameDecl=arguments[0];
       }
       //---------
// this method looks for a specific member, optionally declare as forward
// or inform error. We need this AST node, to correctly report error.

       // default options = new Names.NameDeclOptions
       _default(&options,new(Names_NameDeclOptions,0,NULL));

       // var found = nameDecl.findMember(name)
       var found = CALL1(findMember_,nameDecl,name);

       // if found and name.slice(0,2) isnt '**'
       if (_anyToBool(found) && !__is(CALL2(slice_,name,any_number(0), any_number(2)),any_str("**")))  {
         // found.caseMismatch name,this
         CALL2(caseMismatch_,found,name, this);
       }
       
       else {

         // if options.informError
         if (_anyToBool(PROP(informError_,options)))  {
               // logger.warning "#{.positionText()}. No member named '#{name}' on #{nameDecl.info()}"
               logger_warning(undefined,1,(any_arr){_concatAny(5,(any_arr){(CALL0(positionText_,this)), any_str(". No member named '"), name, any_str("' on "), (CALL0(info_,nameDecl))})});
         };

         // if options.isForward, found = .addMemberTo(nameDecl,name,options)
         if (_anyToBool(PROP(isForward_,options))) {found = CALL3(addMemberTo_,this,nameDecl, name, options);};
       };

       // return found
       return found;
    }


    // helper method getScopeNode()
    any ASTBase_getScopeNode(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,ASTBase));
       //---------

// **getScopeNode** method return the parent 'scoped' node in the hierarchy.
// It looks up until found a node with .scope

// Start at this node

       // var node = this
       var node = this;
        // declare valid node.scope

       // while node
       while(_anyToBool(node)){

         // if node.scope
         if (_anyToBool(PROP(scope_,node)))  {
           // return node # found a node with scope
           return node;// # found a node with scope
         };

         // node = node.parent # move up
         node = PROP(parent_,node);// # move up
       };// end loop

        // #loop

       // return null
       return null;
    }


    // method findInScope(name) returns Names.Declaration
    any ASTBase_findInScope(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,ASTBase));
       //---------
       // define named params
       var name= argc? arguments[0] : undefined;
       //---------
// this method looks for the original place
// where a name was defined (function,method,var)
// Returns the Identifier node from the original scope
// It's used to validate variable references to be previously declared names

// Start at this node

       // var node = this
       var node = this;

// Look for the declaration in this scope

       // while node
       while(_anyToBool(node)){
          // declare valid node.scope:Names.Declaration
         // if node.scope and node.scope.findOwnMember(name) into var found
         var found=undefined;
         if (_anyToBool(PROP(scope_,node)) && _anyToBool((found=CALL1(findOwnMember_,PROP(scope_,node),name))))  {
             // return found
             return found;
         };

// move up in scopes

         // node = node.parent
         node = PROP(parent_,node);
       };// end loop
       
    }

        // #loop


    // method tryGetFromScope(name, options:Names.NameDeclOptions) returns Names.Declaration
    any ASTBase_tryGetFromScope(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,ASTBase));
       //---------
       // define named params
       var name, options;
       name=options=undefined;
       switch(argc){
         case 2:options=arguments[1];
         case 1:name=arguments[0];
       }
       //---------
// a Helper method: *ASTBase.tryGetFromScope(name)*, this method looks for the original declaration
// in the scope. if the declaration is not found, an error is emmited and a -pseudo- var is created
// in the scope in order to continue compilation

// Check if the name is declared. Retrieve the original declaration

// if it's already a Names.Declaration, no need to search

       // if name instanceof Names.Declaration, return name
       if (_instanceof(name,Names_Declaration)) {return name;};

// Search the scope

       // if .findInScope(name) into var found
       var found=undefined;
       if (_anyToBool((found=CALL1(findInScope_,this,name))))  {

// Declaration found, we check the upper/lower case to be consistent
// If the found item has a different case than the name we're looking for, emit error

           // if found.caseMismatch(name, this)
           if (_anyToBool(CALL2(caseMismatch_,found,name, this)))  {
               // return found
               return found;
           };
           // end if
           
       }

// if it is not found,check options: a) inform error. b) declare foward.
       
       else {
           // if options and options.informError
           if (_anyToBool(options) && _anyToBool(PROP(informError_,options)))  {
               // .sayErr "UNDECLARED NAME: '#{name}'"
               CALL1(sayErr_,this,_concatAny(3,(any_arr){any_str("UNDECLARED NAME: '"), name, any_str("'")}));
           };

           // if options and options.isForward
           if (_anyToBool(options) && _anyToBool(PROP(isForward_,options)))  {
               // found = .addToScope(name,options)
               found = CALL2(addToScope_,this,name, options);
               // if options.isDummy and Strings.isCapitalized(name) #let's assume is a class
               if (_anyToBool(PROP(isDummy_,options)) && _anyToBool(Strings_isCapitalized(undefined,1,(any_arr){name})))  {// #let's assume is a class
                   // .addMemberTo(found,'prototype',options)
                   CALL3(addMemberTo_,this,found, any_str("prototype"), options);
               };
           };
       };

        // #end if - check declared variables

       // return found
       return found;
    }


    // method addToScope(item, options:Names.NameDeclOptions) returns Names.Declaration
    any ASTBase_addToScope(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,ASTBase));
       //---------
       // define named params
       var item, options;
       item=options=undefined;
       switch(argc){
         case 2:options=arguments[1];
         case 1:item=arguments[0];
       }
       //---------
// a Helper method ASTBase.*addToScope*
// Search for parent Scope, adds passed name to scope.members
// Reports duplicated.
// return: Names.Declaration

       // if no item, return # do nothing on undefined params
       if (!_anyToBool(item)) {return undefined;};

       // var scope:Names.Declaration = .getScopeNode().scope
       var scope = PROP(scope_,CALL0(getScopeNode_,this));

       // return .addToSpecificScope(scope, item, options)
       return CALL3(addToSpecificScope_,this,scope, item, options);
    }

// First search it to report duplicates, if found in the scope.
// If the found item has a different case than the name we're adding, emit error & return

    // method addToSpecificScope(scope:Names.Declaration, item, options:Names.NameDeclOptions) returns Names.Declaration
    any ASTBase_addToSpecificScope(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,ASTBase));
       //---------
       // define named params
       var scope, item, options;
       scope=item=options=undefined;
       switch(argc){
         case 3:options=arguments[2];
         case 2:item=arguments[1];
         case 1:scope=arguments[0];
       }
       //---------

        // declare valid item.name
       // var name = type of item is 'string'? item : item.name
       var name = __is(_typeof(item),any_str("string")) ? item : PROP(name_,item);

       // logger.debug "addToScope: '#{name}' to '#{scope.name}'" #[#{.constructor.name}] name:
       logger_debug(undefined,1,(any_arr){_concatAny(5,(any_arr){any_str("addToScope: '"), name, any_str("' to '"), PROP(name_,scope), any_str("'")})});// #[#{.constructor.name}] name:

       // if .findInScope(name) into var found
       var found=undefined;
       if (_anyToBool((found=CALL1(findInScope_,this,name))))  {

           // if found.caseMismatch(name, this)
           if (_anyToBool(CALL2(caseMismatch_,found,name, this)))  {
              // #case mismatch informed
             //do nothing
             ;
           }
           
           else if (_anyToBool(PROP(isForward_,found)))  {
             // found.isForward = false
             PROP(isForward_,found) = false;
             // found.nodeDeclared = this
             PROP(nodeDeclared_,found) = this;
             // if item instanceof Names.Declaration
             if (_instanceof(item,Names_Declaration))  {
               // found.replaceForward item
               CALL1(replaceForward_,found,item);
             };
           }
           
           else {
             // .sayErr "DUPLICATED name in scope: '#{name}'"
             CALL1(sayErr_,this,_concatAny(3,(any_arr){any_str("DUPLICATED name in scope: '"), name, any_str("'")}));
             // logger.error found.originalDeclarationPosition() #add extra information line
             logger_error(undefined,1,(any_arr){CALL0(originalDeclarationPosition_,found)});// #add extra information line
           };

           // return found
           return found;
       };

        // #end if

// else, not found, add it to the scope

       // var nameDecl
       var nameDecl = undefined;
       // if item instanceof Names.Declaration
       if (_instanceof(item,Names_Declaration))  {
         // nameDecl = item
         nameDecl = item;
       }
       
       else {
         // nameDecl = .declareName(name,options)
         nameDecl = CALL2(declareName_,this,name, options);
       };

       // scope.addMember nameDecl
       CALL1(addMember_,scope,nameDecl);

       // return nameDecl
       return nameDecl;
    }


    // helper method addToExport(exportedNameDecl, isVarFn)
    any ASTBase_addToExport(DEFAULT_ARGUMENTS){
     assert(_instanceof(this,ASTBase));
     //---------
     // define named params
     var exportedNameDecl, isVarFn;
     exportedNameDecl=isVarFn=undefined;
     switch(argc){
       case 2:isVarFn=arguments[1];
       case 1:exportedNameDecl=arguments[0];
     }
     //---------
// Add to parentModule.exports, but *preserve parent*

     // var theModule: Grammar.Module = .getParent(Grammar.Module)
     var theModule = CALL1(getParent_,this,Grammar_Module);

     // var exportDefault = theModule.exports.name is exportedNameDecl.name
     var exportDefault = any_number(__is(PROP(name_,PROP(exports_,theModule)),PROP(name_,exportedNameDecl)));

     // var informInconsistency
     var informInconsistency = undefined;

     // if exportDefault
     if (_anyToBool(exportDefault))  {
         // informInconsistency = true
         informInconsistency = true;
         // if not theModule.exportsReplaced
         if (!(_anyToBool(PROP(exportsReplaced_,theModule))) && __is(CALL0(getMemberCount_,PROP(exports_,theModule)),any_number(0)))  {
                  //ok to replace
                 // theModule.exports.makePointTo exportedNameDecl
                 CALL1(makePointTo_,PROP(exports_,theModule),exportedNameDecl);
                 // theModule.exportsReplaced = true
                 PROP(exportsReplaced_,theModule) = true;
                 // informInconsistency = false
                 informInconsistency = false;
         };
     }
     
     else {
         // if isVarFn and theModule.exportsReplaced
         if (_anyToBool(isVarFn) && _anyToBool(PROP(exportsReplaced_,theModule)))  {
             // informInconsistency = true
             informInconsistency = true;
         }
         
         else {
             // theModule.exports.addMember exportedNameDecl
             CALL1(addMember_,PROP(exports_,theModule),exportedNameDecl);
         };
     };

     // if informInconsistency
     if (_anyToBool(informInconsistency))  {
         // exportedNameDecl.warn 'default export: cannot have some "public function/var" and also a class/namespace named as the module (default export)'
         CALL1(warn_,exportedNameDecl,any_str("default export: cannot have some \"public function/var\" and also a class/namespace named as the module (default export)"));
     };
    }



    // helper method createScope()
    any ASTBase_createScope(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,ASTBase));
       //---------
// initializes an empty scope in this node

       // if no .scope
       if (!_anyToBool(PROP(scope_,this)))  {
         // var options=new Names.NameDeclOptions
         var options = new(Names_NameDeclOptions,0,NULL);
         // options.normalizeModeKeepFirstCase = true
         PROP(normalizeModeKeepFirstCase_,options) = true;
         // .scope = .declareName("[#{.constructor.name} Scope]", options)
         PROP(scope_,this) = CALL2(declareName_,this,_concatAny(3,(any_arr){any_str("["), PROP(name_,any_class(this.class)), any_str(" Scope]")}), options);
         // .scope.isScope = true
         PROP(isScope_,PROP(scope_,this)) = true;
       };

       // return .scope
       return PROP(scope_,this);
    }

    // helper method tryGetOwnerNameDecl( informError ) returns Names.Declaration
    any ASTBase_tryGetOwnerNameDecl(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,ASTBase));
       //---------
       // define named params
       var informError= argc? arguments[0] : undefined;
       //---------

// Returns namedeclaration where this node should be.
// Used for properties & methods declarations.
// If the parent is Append-To, search for the referenced clas/namespace.

// returns owner.nameDecl or nothing

       // var toNamespace
       var toNamespace = undefined;
       // var ownerDecl
       var ownerDecl = undefined;

        // # get parent ClassDeclaration/Append-to/Namespace
       // var parent:Grammar.ClassDeclaration = .getParent(Grammar.ClassDeclaration)
       var parent = CALL1(getParent_,this,Grammar_ClassDeclaration);

       // if no parent
       if (!_anyToBool(parent))  {
          // if informError, .throwError "declaration is outside 'class/namespace/append to'. Check indent"
          if (_anyToBool(informError)) {CALL1(throwError_,this,any_str("declaration is outside 'class/namespace/append to'. Check indent"));};
          // return
          return undefined;
       };

// Append to class|namespace

       // if parent instance of Grammar.AppendToDeclaration
       if (_instanceof(parent,Grammar_AppendToDeclaration))  {

            // #get varRefOwner from AppendToDeclaration
            // declare parent:Grammar.AppendToDeclaration

           // toNamespace = parent.toNamespace #if it was 'append to namespace'
           toNamespace = PROP(toNamespace_,parent);// #if it was 'append to namespace'

            // #get referenced class/namespace
           // if no parent.varRef.tryGetReference() into ownerDecl
           if (!(_anyToBool((ownerDecl=CALL0(tryGetReference_,PROP(varRef_,parent))))))  {
               // if informError
               if (_anyToBool(informError))  {
                   // .sayErr "Append to: '#{parent.varRef}'. Reference is not fully declared"
                   CALL1(sayErr_,this,_concatAny(3,(any_arr){any_str("Append to: '"), PROP(varRef_,parent), any_str("'. Reference is not fully declared")}));
               };
               // return //if no ownerDecl found
               return undefined; //if no ownerDecl found
           };
       }
       
       else {

           // toNamespace = parent.constructor is Grammar.NamespaceDeclaration
           toNamespace = any_number(__is(any_class(parent.class),Grammar_NamespaceDeclaration));

           // ownerDecl = parent.nameDecl
           ownerDecl = PROP(nameDecl_,parent);
       };

       // end if


// check if owner is class (namespace) or class.prototype (class)


       // if toNamespace
       if (_anyToBool(toNamespace))  {
            // #'append to namespace'/'namespace x'. Members are added directly to owner
           // return ownerDecl
           return ownerDecl;
       }
       
       else {
            // # Class: members are added to the prototype
            // # move to class prototype
           // if no ownerDecl.findOwnMember("prototype") into var ownerDeclProto
           var ownerDeclProto=undefined;
           if (!(_anyToBool((ownerDeclProto=CALL1(findOwnMember_,ownerDecl,any_str("prototype"))))))  {
               // if informError, .sayErr "Class '#{ownerDecl}' has no .prototype"
               if (_anyToBool(informError)) {CALL1(sayErr_,this,_concatAny(3,(any_arr){any_str("Class '"), ownerDecl, any_str("' has no .prototype")}));};
               // return
               return undefined;
           };

            // # Class: members are added to the prototype
           // return ownerDeclProto
           return ownerDeclProto;
       };

       // end if
       
    }


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
     ;

     // helper method createNameDeclaration()
     any Grammar_VariableDecl_createNameDeclaration(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_VariableDecl));
       //---------

       // var options = new Names.NameDeclOptions
       var options = new(Names_NameDeclOptions,0,NULL);
       // options.type = .type
       PROP(type_,options) = PROP(type_,this);
       // options.itemType = .itemType
       PROP(itemType_,options) = PROP(itemType_,this);

       // return .declareName(.name,options)
       return CALL2(declareName_,this,PROP(name_,this), options);
     }

     // helper method declareInScope()
     any Grammar_VariableDecl_declareInScope(DEFAULT_ARGUMENTS){
         assert(_instanceof(this,Grammar_VariableDecl));
         //---------
         // .nameDecl = .addToScope(.createNameDeclaration())
         PROP(nameDecl_,this) = CALL1(addToScope_,this,CALL0(createNameDeclaration_,this));
     }

     // helper method getTypeFromAssignedValue()
     any Grammar_VariableDecl_getTypeFromAssignedValue(DEFAULT_ARGUMENTS){
         assert(_instanceof(this,Grammar_VariableDecl));
         //---------
         // if .nameDecl and .assignedValue and .nameDecl.name isnt 'prototype'
         if (_anyToBool(PROP(nameDecl_,this)) && _anyToBool(PROP(assignedValue_,this)) && !__is(PROP(name_,PROP(nameDecl_,this)),any_str("prototype")))  {
             // if no .nameDecl.findOwnMember('**proto**') into var type #if has no type
             var type=undefined;
             if (!(_anyToBool((type=CALL1(findOwnMember_,PROP(nameDecl_,this),any_str("**proto**"))))))  {// #if has no type
                 // if .assignedValue.getResultType() into var result #get assignedValue type
                 var result=undefined;
                 if (_anyToBool((result=CALL0(getResultType_,PROP(assignedValue_,this)))))  {// #get assignedValue type
                     // this.nameDecl.setMember('**proto**', result) #assign to this.nameDecl
                     CALL2(setMember_,PROP(nameDecl_,this),any_str("**proto**"), result);// #assign to this.nameDecl
                 };
             };
         };
     }


   // append to class Grammar.VarStatement ###

    // method declare()  # pass 1
    any Grammar_VarStatement_declare(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_VarStatement));
       //---------
       // for each varDecl in .list
       any _list41=PROP(list_,this);
       { var varDecl=undefined;
       for(int varDecl__inx=0 ; varDecl__inx<_list41.value.arr->length ; varDecl__inx++){varDecl=ITEM(varDecl__inx,_list41);
           // varDecl.declareInScope
           PROP(declareInScope_,varDecl);
            // declare .parent: Grammar.Statement
           // if .hasAdjective('export'), .addToExport varDecl.nameDecl, isVarFn=true
           if (_anyToBool(CALL1(hasAdjective_,this,any_str("export")))) {CALL2(addToExport_,this,PROP(nameDecl_,varDecl), true);};
           // if varDecl.aliasVarRef
           if (_anyToBool(PROP(aliasVarRef_,varDecl)))  {
                //Example: "public var $ = jQuery" => declare alias $ for jQuery
               // var opt = new Names.NameDeclOptions
               var opt = new(Names_NameDeclOptions,0,NULL);
               // opt.informError= true
               PROP(informError_,opt) = true;
               // if varDecl.aliasVarRef.tryGetReference(opt) into var ref
               var ref=undefined;
               if (_anyToBool((ref=CALL1(tryGetReference_,PROP(aliasVarRef_,varDecl),opt))))  {
                    // # aliases share .members
                   // varDecl.nameDecl.members = ref.members
                   PROP(members_,PROP(nameDecl_,varDecl)) = PROP(members_,ref);
               };
           };
       }};// end for each in PROP(list_,this)
       
    }


    // method evaluateAssignments() # pass 4, determine type from assigned value
    any Grammar_VarStatement_evaluateAssignments(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_VarStatement));
       //---------
       // for each varDecl in .list
       any _list42=PROP(list_,this);
       { var varDecl=undefined;
       for(int varDecl__inx=0 ; varDecl__inx<_list42.value.arr->length ; varDecl__inx++){varDecl=ITEM(varDecl__inx,_list42);
           // varDecl.getTypeFromAssignedValue
           PROP(getTypeFromAssignedValue_,varDecl);
       }};// end for each in PROP(list_,this)
       
    }


   // append to class Grammar.WithStatement ###

     // properties nameDecl
     ;

     // method declare()  # pass 1
     any Grammar_WithStatement_declare(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_WithStatement));
        //---------
        // .nameDecl = .addToScope(.declareName(.name))
        PROP(nameDecl_,this) = CALL1(addToScope_,this,CALL1(declareName_,this,PROP(name_,this)));
     }

     // method evaluateAssignments() # pass 4, determine type from assigned value
     any Grammar_WithStatement_evaluateAssignments(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_WithStatement));
       //---------
       // .nameDecl.assignTypeFromValue .varRef
       CALL1(assignTypeFromValue_,PROP(nameDecl_,this),PROP(varRef_,this));
     }


   // append to class Grammar.ImportStatementItem ###

     // properties nameDecl
     ;

     // method declare #pass 1: declare name choosed for imported(required) contents as a scope var
     any Grammar_ImportStatementItem_declare(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_ImportStatementItem));
       //---------

       // if no .getParent(Grammar.DeclareStatement) #except for 'global declare'
       if (!_anyToBool(CALL1(getParent_,this,Grammar_DeclareStatement)))  {// #except for 'global declare'
           // if .hasAdjective('shim') and .findInScope(.name), return // do not import if shim and already declared
           if (_anyToBool(CALL1(hasAdjective_,this,any_str("shim"))) && _anyToBool(CALL1(findInScope_,this,PROP(name_,this)))) {return undefined;};
           // .nameDecl = .addToScope(.name)
           PROP(nameDecl_,this) = CALL1(addToScope_,this,PROP(name_,this));
       };
     }


// ----------------------------
// ### Append to class Grammar.NamespaceDeclaration
// #### method declare()
//         .nameDecl = .addToScope(.declareName(.name))
//         .createScope


   // append to class Grammar.ClassDeclaration
// also AppendToDeclaration and NamespaceDeclaration (child classes).

    // properties
    ;
      //container: Grammar.NamespaceDeclaration // in which namespace this class/namespace is declared

    // method declare()
    any Grammar_ClassDeclaration_declare(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_ClassDeclaration));
       //---------

// AppendToDeclarations do not "declare" anything at this point.
// AppendToDeclarations add to a existing classes or namespaces.
// The adding is delayed until pass:"processAppendTo", where
// append-To var reference is searched in the scope
// and methods and properties are added.
// This need to be done after all declarations.

       // if this.constructor is Grammar.AppendToDeclaration, return
       if (__is(any_class(this.class),Grammar_AppendToDeclaration)) {return undefined;};

// Check if it is a class or a namespace

       // var isNamespace = this.constructor is Grammar.NamespaceDeclaration
       var isNamespace = any_number(__is(any_class(this.class),Grammar_NamespaceDeclaration));
       // var isClass = this.constructor is Grammar.ClassDeclaration
       var isClass = any_number(__is(any_class(this.class),Grammar_ClassDeclaration));

       // var opt = new Names.NameDeclOptions
       var opt = new(Names_NameDeclOptions,0,NULL);

       // if isNamespace
       if (_anyToBool(isNamespace))  {
           // .nameDecl = .declareName(.name)
           PROP(nameDecl_,this) = CALL1(declareName_,this,PROP(name_,this));
           // .nameDecl.isNamespace = true
           PROP(isNamespace_,PROP(nameDecl_,this)) = true;
       }
       
       else {

// if is a class adjectivated "shim", do not declare if already exists

           // if .hasAdjective('shim')
           if (_anyToBool(CALL1(hasAdjective_,this,any_str("shim"))))  {
               // if .tryGetFromScope(.name)
               if (_anyToBool(CALL1(tryGetFromScope_,this,PROP(name_,this))))  {
                   // return
                   return undefined;
               };
           };

// declare the class

           // opt.type = globalPrototype('Function')
           PROP(type_,opt) = Validate_globalPrototype(undefined,1,(any_arr){any_str("Function")});
           // .nameDecl = .declareName(.name,opt) //class
           PROP(nameDecl_,this) = CALL2(declareName_,this,PROP(name_,this), opt); //class
           // opt.type = undefined
           PROP(type_,opt) = undefined;
       };

// get parent. We cover here class/namespaces directly declared inside namespaces (without AppendTo)

       // var container = .getParent(Grammar.NamespaceDeclaration)
       var container = CALL1(getParent_,this,Grammar_NamespaceDeclaration);

// if it is declared inside a namespace, it becomes a item of the namespace

       // if container
       if (_anyToBool(container))  {
            // declare container: Grammar.NamespaceDeclaration
           // container.nameDecl.addMember .nameDecl
           CALL1(addMember_,PROP(nameDecl_,container),PROP(nameDecl_,this));
       }

// else, is a module-level class|namespace. Add to scope
       
       else {
           // .addToScope .nameDecl
           CALL1(addToScope_,this,PROP(nameDecl_,this));

// if public/export, or interface, also add to module.exports

           // var scopeModule=.getParent(Grammar.Module)
           var scopeModule = CALL1(getParent_,this,Grammar_Module);
           // if scopeModule.fileInfo.isInterface or .hasAdjective('export')
           if (_anyToBool(__or(PROP(isInterface_,PROP(fileInfo_,scopeModule)),CALL1(hasAdjective_,this,any_str("export")))))  {
                 // .addToExport .nameDecl
                 CALL1(addToExport_,this,PROP(nameDecl_,this));
           };
       };

// if it is a Class, we create 'Class.prototype' member
// Class's properties & methods will be added to 'prototype' as valid member members.
// 'prototype' starts with 'constructor' which is a pointer to the class-funcion itself

       // if isClass
       if (_anyToBool(isClass))  {
           // var prtypeNameDecl = .nameDecl.findOwnMember('prototype') or .addMemberTo(.nameDecl,'prototype')
           var prtypeNameDecl = __or(CALL1(findOwnMember_,PROP(nameDecl_,this),any_str("prototype")),CALL2(addMemberTo_,this,PROP(nameDecl_,this), any_str("prototype")));
           // if .varRefSuper, prtypeNameDecl.setMember('**proto**',.varRefSuper)
           if (_anyToBool(PROP(varRefSuper_,this))) {CALL2(setMember_,prtypeNameDecl,any_str("**proto**"), PROP(varRefSuper_,this));};
           // opt.pointsTo = .nameDecl
           PROP(pointsTo_,opt) = PROP(nameDecl_,this);
           // prtypeNameDecl.addMember('constructor',opt)
           CALL2(addMember_,prtypeNameDecl,any_str("constructor"), opt);

// return type of the class-function, is the prototype

           // .nameDecl.setMember '**return type**',prtypeNameDecl
           CALL2(setMember_,PROP(nameDecl_,this),any_str("**return type**"), prtypeNameDecl);

// add to nameAffinity

           // if not nameAffinity.members.has(.name)
           if (!(_anyToBool(CALL1(has_,PROP(members_,Validate_nameAffinity),PROP(name_,this)))))  {
               // nameAffinity.members.set .name, .nameDecl
               CALL2(set_,PROP(members_,Validate_nameAffinity),PROP(name_,this), PROP(nameDecl_,this));
           };
       };
    }


   // append to class Grammar.ObjectLiteral ###

    // properties nameDecl
    ;

    // method declare
    any Grammar_ObjectLiteral_declare(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_ObjectLiteral));
       //---------

// When producing C-code, a ObjectLiteral creates a "Map string to any" on the fly,
// but it does not declare a valid type/class.

       // if project.options.target is 'c', return
       if (__is(PROP(target_,PROP(options_,Validate_project)),any_str("c"))) {return undefined;};

        // declare valid .parent.nameDecl
       // .nameDecl = .parent.nameDecl or .declareName(UniqueID.getVarName('*ObjectLiteral*'))
       PROP(nameDecl_,this) = __or(PROP(nameDecl_,PROP(parent_,this)),CALL1(declareName_,this,UniqueID_getVarName(undefined,1,(any_arr){any_str("*ObjectLiteral*")})));
    }

// When producing the LiteScript-to-C compiler, a ObjectLiteral's return type is 'Map string to any'

    // method getResultType
    any Grammar_ObjectLiteral_getResultType(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_ObjectLiteral));
       //---------

       // if project.options.target is 'c'
       if (__is(PROP(target_,PROP(options_,Validate_project)),any_str("c")))  {
           // return tryGetGlobalPrototype('Map')
           return Validate_tryGetGlobalPrototype(undefined,1,(any_arr){any_str("Map")});
       }
       
       else {
           // return .nameDecl
           return PROP(nameDecl_,this);
       };
    }


   // append to class Grammar.NameValuePair ###

    // properties nameDecl
    ;

    // method declare
    any Grammar_NameValuePair_declare(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_NameValuePair));
       //---------

// When producing C-code, a ObjectLiteral creates a "Map string to any" on the fly,
// but it does not declare a valid type/class.

       // if project.options.target is 'c', return
       if (__is(PROP(target_,PROP(options_,Validate_project)),any_str("c"))) {return undefined;};

        // declare valid .parent.nameDecl
       // .nameDecl = .addMemberTo(.parent.nameDecl, .name)
       PROP(nameDecl_,this) = CALL2(addMemberTo_,this,PROP(nameDecl_,PROP(parent_,this)), PROP(name_,this));

// check if we can determine type from value

       // if .type and .type instance of Names.Declaration and .type.name not in ["undefined","null"]
       if (_anyToBool(PROP(type_,this)) && _instanceof(PROP(type_,this),Names_Declaration) && CALL1(indexOf_,_newArray(2,(any_arr){any_str("undefined"), any_str("null")}),PROP(name_,PROP(type_,this))).value.number==-1)  {
           // .nameDecl.setMember '**proto**', .type
           CALL2(setMember_,PROP(nameDecl_,this),any_str("**proto**"), PROP(type_,this));
       }
       
       else if (_anyToBool(PROP(value_,this)))  {
           // .nameDecl.assignTypeFromValue .value
           CALL1(assignTypeFromValue_,PROP(nameDecl_,this),PROP(value_,this));
       };
    }

   // append to class Grammar.FunctionDeclaration ###
// `FunctionDeclaration: '[export][generator] (function|method|constructor) [name] '(' FunctionParameterDecl* ')' Block`

    // properties nameDecl, declared:boolean, scope:Names.Declaration
    ;

    // method declare() ## function, methods and constructors
    any Grammar_FunctionDeclaration_declare(DEFAULT_ARGUMENTS){
     assert(_instanceof(this,Grammar_FunctionDeclaration));
     //---------

     // var ownerNameDecl
     var ownerNameDecl = undefined;
     // var isMethod = .constructor is Grammar.MethodDeclaration
     var isMethod = any_number(__is(any_class(this.class),Grammar_MethodDeclaration));
     // var isFunction = .constructor is Grammar.FunctionDeclaration
     var isFunction = any_number(__is(any_class(this.class),Grammar_FunctionDeclaration));

     // var opt = new Names.NameDeclOptions
     var opt = new(Names_NameDeclOptions,0,NULL);

// 1st: Grammar.FunctionDeclaration

// if it is not anonymous, add function name to parent scope,
// if its 'export' add to exports

     // if isFunction
     if (_anyToBool(isFunction))  {

         // opt.type = globalPrototype('Function')
         PROP(type_,opt) = Validate_globalPrototype(undefined,1,(any_arr){any_str("Function")});
         // .nameDecl = .addToScope(.name,opt)
         PROP(nameDecl_,this) = CALL2(addToScope_,this,PROP(name_,this), opt);
         // if .hasAdjective('export'), .addToExport .nameDecl,isVarFn=true
         if (_anyToBool(CALL1(hasAdjective_,this,any_str("export")))) {CALL2(addToExport_,this,PROP(nameDecl_,this), true);};
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
     
     else if (_anyToBool((ownerNameDecl=CALL0(tryGetOwnerNameDecl_,this))))  {

         // if .constructor isnt Grammar.ConstructorDeclaration
         if (!__is(any_class(this.class),Grammar_ConstructorDeclaration))  {
              //the constructor is the Function-Class itself
              // so it is not a member function
             // .addMethodToOwnerNameDecl ownerNameDecl
             CALL1(addMethodToOwnerNameDecl_,this,ownerNameDecl);
         };
     };

     // end if

// Define function's return type from parsed text

     // var returnType = .createReturnType()
     var returnType = CALL0(createReturnType_,this);

// Functions (methods and constructors also), have a 'scope'.
// It captures al vars declared in its body.
// We now create function's scope and add the special var 'this'.
// The 'type' of 'this' is normally a class prototype,
// which contains other methods and properties from the class.
// We also add 'arguments.length'

// Scope starts populated by 'this' and 'arguments'.

     // var scope = .createScope()
     var scope = CALL0(createScope_,this);

     // opt.type='any*'
     PROP(type_,opt) = any_str("any*");
     // .addMemberTo(scope,'arguments',opt)
     CALL3(addMemberTo_,this,scope, any_str("arguments"), opt);

     // if not isFunction
     if (!(_anyToBool(isFunction)))  {

         // var addThis = false
         var addThis = false;

         // var containerClassDeclaration = .getParent(Grammar.ClassDeclaration) //also append-to & NamespaceDeclaration
         var containerClassDeclaration = CALL1(getParent_,this,Grammar_ClassDeclaration); //also append-to & NamespaceDeclaration
         // if containerClassDeclaration.constructor is Grammar.ClassDeclaration
         if (__is(any_class(containerClassDeclaration.class),Grammar_ClassDeclaration))  {
             // addThis = true
             addThis = true;
         }
         
         else if (__is(any_class(containerClassDeclaration.class),Grammar_AppendToDeclaration))  {
              // declare containerClassDeclaration:Grammar.AppendToDeclaration
             // addThis = not containerClassDeclaration.toNamespace
             addThis = any_number(!(_anyToBool(PROP(toNamespace_,containerClassDeclaration))));
         };

         // if addThis
         if (_anyToBool(addThis))  {
             // opt.type=ownerNameDecl
             PROP(type_,opt) = ownerNameDecl;
             // .addMemberTo(scope,'this',opt)
             CALL3(addMemberTo_,this,scope, any_str("this"), opt);
         };
     };

// Note: only class methods have 'this' as parameter

// add parameters to function's scope

     // if .paramsDeclarations
     if (_anyToBool(PROP(paramsDeclarations_,this)))  {
       // for each varDecl in .paramsDeclarations
       any _list43=PROP(paramsDeclarations_,this);
       { var varDecl=undefined;
       for(int varDecl__inx=0 ; varDecl__inx<_list43.value.arr->length ; varDecl__inx++){varDecl=ITEM(varDecl__inx,_list43);
         // varDecl.declareInScope
         PROP(declareInScope_,varDecl);
       }};// end for each in PROP(paramsDeclarations_,this)
       
     };
    }



    // helper method addMethodToOwnerNameDecl(owner:Names.Declaration)  ## methods
    any Grammar_FunctionDeclaration_addMethodToOwnerNameDecl(DEFAULT_ARGUMENTS){
     assert(_instanceof(this,Grammar_FunctionDeclaration));
     //---------
     // define named params
     var owner= argc? arguments[0] : undefined;
     //---------

     // var actual = owner.findOwnMember(.name)
     var actual = CALL1(findOwnMember_,owner,PROP(name_,this));

     // if actual and .hasAdjective('shim') #shim for an exising method, do nothing
     if (_anyToBool(actual) && _anyToBool(CALL1(hasAdjective_,this,any_str("shim"))))  {// #shim for an exising method, do nothing
       // return
       return undefined;
     };

// Add to owner, type is 'Function'

     // if no .nameDecl
     if (!_anyToBool(PROP(nameDecl_,this)))  {
         // var opt = new Names.NameDeclOptions
         var opt = new(Names_NameDeclOptions,0,NULL);
         // opt.type=globalPrototype('Function')
         PROP(type_,opt) = Validate_globalPrototype(undefined,1,(any_arr){any_str("Function")});
         // .nameDecl = .declareName(.name,opt)
         PROP(nameDecl_,this) = CALL2(declareName_,this,PROP(name_,this), opt);
     };

     // .declared = true
     PROP(declared_,this) = true;

     // .addMemberTo owner, .nameDecl
     CALL2(addMemberTo_,this,owner, PROP(nameDecl_,this));
    }


    // method createReturnType() returns string ## functions & methods
    any Grammar_FunctionDeclaration_createReturnType(DEFAULT_ARGUMENTS){
     assert(_instanceof(this,Grammar_FunctionDeclaration));
     //---------

     // if no .nameDecl, return #nowhere to put definitions
     if (!_anyToBool(PROP(nameDecl_,this))) {return undefined;};

// Define function's return type from parsed text

     // if .itemType
     if (_anyToBool(PROP(itemType_,this)))  {

// if there's a "itemType", it means type is: `TypeX Array`.
// We create a intermediate type for `TypeX Array`
// and set this new nameDecl as function's **return type**

         // var composedName = '#{.itemType.toString()} Array'
         var composedName = _concatAny(2,(any_arr){(CALL0(toString_,PROP(itemType_,this))), any_str(" Array")});

// check if it alerady exists, if not found, create one. Type is 'Array'

         // if not globalScope.findMember(composedName) into var intermediateNameDecl
         var intermediateNameDecl=undefined;
         if (!(_anyToBool((intermediateNameDecl=CALL1(findMember_,Validate_globalScope,composedName)))))  {
             // var opt = new Names.NameDeclOptions
             var opt = new(Names_NameDeclOptions,0,NULL);
             // opt.type = globalPrototype('Array')
             PROP(type_,opt) = Validate_globalPrototype(undefined,1,(any_arr){any_str("Array")});
             // intermediateNameDecl = globalScope.addMember(composedName,opt)
             intermediateNameDecl = CALL2(addMember_,Validate_globalScope,composedName, opt);
         };

// item type, is each array member's type

         // intermediateNameDecl.setMember "**item type**", .itemType
         CALL2(setMember_,intermediateNameDecl,any_str("**item type**"), PROP(itemType_,this));

         // .nameDecl.setMember '**return type**', intermediateNameDecl
         CALL2(setMember_,PROP(nameDecl_,this),any_str("**return type**"), intermediateNameDecl);

         // return intermediateNameDecl
         return intermediateNameDecl;
     }

// else, it's a simple type
     
     else {

         // if .type then .nameDecl.setMember('**return type**', .type)
         if (_anyToBool(PROP(type_,this))) {CALL2(setMember_,PROP(nameDecl_,this),any_str("**return type**"), PROP(type_,this));};
         // return .type
         return PROP(type_,this);
     };
    }


   // append to class Grammar.AppendToDeclaration ###

    // method processAppendTo()
    any Grammar_AppendToDeclaration_processAppendTo(DEFAULT_ARGUMENTS){
     assert(_instanceof(this,Grammar_AppendToDeclaration));
     //---------
// when target is '.c' we do not allow treating classes as namespaces
// so an "append to namespace classX" should throw an error

// get referenced class/namespace

     // if no .varRef.tryGetReference() into var ownerDecl
     var ownerDecl=undefined;
     if (!(_anyToBool((ownerDecl=CALL0(tryGetReference_,PROP(varRef_,this))))))  {
         // .sayErr "Append to: '#{.varRef}'. Reference is not fully declared"
         CALL1(sayErr_,this,_concatAny(3,(any_arr){any_str("Append to: '"), PROP(varRef_,this), any_str("'. Reference is not fully declared")}));
         // return //if no ownerDecl found
         return undefined; //if no ownerDecl found
     };

     // var prt=ownerDecl.findOwnMember('prototype')
     var prt = CALL1(findOwnMember_,ownerDecl,any_str("prototype"));

     // if project.options.target is 'c'
     if (__is(PROP(target_,PROP(options_,Validate_project)),any_str("c")))  {
         // if .toNamespace and prt
         if (_anyToBool(PROP(toNamespace_,this)) && _anyToBool(prt))  {
             // .sayErr "Append to: '#{.varRef}'. For C production, canot add to class as namespace."
             CALL1(sayErr_,this,_concatAny(3,(any_arr){any_str("Append to: '"), PROP(varRef_,this), any_str("'. For C production, canot add to class as namespace.")}));
         };
     };

     // if prt, ownerDecl=prt // append to class, adds to prototype
     if (_anyToBool(prt)) {ownerDecl = prt;};

     // for each item in .body.statements
     any _list44=PROP(statements_,PROP(body_,this));
     { var item=undefined;
     for(int item__inx=0 ; item__inx<_list44.value.arr->length ; item__inx++){item=ITEM(item__inx,_list44);

         // switch item.specific.constructor
         any _switch4=any_class(PROP(specific_,item).class);
              // case Grammar.PropertiesDeclaration:
         if (__is(_switch4,Grammar_PropertiesDeclaration)){
                  // declare item.specific:Grammar.PropertiesDeclaration
                 // if not item.specific.declared, item.specific.declare(informError=true)
                 if (!(_anyToBool(PROP(declared_,PROP(specific_,item))))) {CALL1(declare_,PROP(specific_,item),true);};
         
         }// case Grammar.MethodDeclaration:
         else if (__is(_switch4,Grammar_MethodDeclaration)){
                 // var m:Grammar.MethodDeclaration = item.specific
                 var m = PROP(specific_,item);
                 // if m.declared, continue
                 if (_anyToBool(PROP(declared_,m))) {continue;};

// Now that we have 'owner' we can set **proto** for scope var 'this',
// so we can later validate `.x` in `this.x = 7`

                 // m.addMethodToOwnerNameDecl ownerDecl
                 CALL1(addMethodToOwnerNameDecl_,m,ownerDecl);

                 // if m.scope.findOwnMember("this") into var scopeThis
                 var scopeThis=undefined;
                 if (_anyToBool((scopeThis=CALL1(findOwnMember_,PROP(scope_,m),any_str("this")))))  {
                     // scopeThis.setMember '**proto**',ownerDecl
                     CALL2(setMember_,scopeThis,any_str("**proto**"), ownerDecl);
                      // #set also **return type**
                     // m.createReturnType
                     PROP(createReturnType_,m);
                 };
         
         }// case Grammar.ClassDeclaration:
         else if (__is(_switch4,Grammar_ClassDeclaration)){
                  // declare item.specific:Grammar.ClassDeclaration
                 // ownerDecl.addMember item.specific.nameDecl
                 CALL1(addMember_,ownerDecl,PROP(nameDecl_,PROP(specific_,item)));
         
         }// case Grammar.EndStatement:
         else if (__is(_switch4,Grammar_EndStatement)){
                 //do nothing
                 ;
         
         }
         else {
                 // .sayErr 'unexpected "#{item.specific.constructor.name}" inside Append-to Declaration'
                 CALL1(sayErr_,this,_concatAny(3,(any_arr){any_str("unexpected \""), PROP(name_,any_class(PROP(specific_,item).class)), any_str("\" inside Append-to Declaration")}));
         };
     }};// end for each in PROP(statements_,PROP(body_,this))
     
    }


   // append to class Grammar.PropertiesDeclaration ###

    // properties nameDecl, declared:boolean, scope:Names.Declaration
    ;

    // method declare(informError)
    any Grammar_PropertiesDeclaration_declare(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_PropertiesDeclaration));
       //---------
       // define named params
       var informError= argc? arguments[0] : undefined;
       //---------
// Add all properties as members of its owner object (normally: class.prototype)

       // var opt= new Names.NameDeclOptions
       var opt = new(Names_NameDeclOptions,0,NULL);
       // if .tryGetOwnerNameDecl(informError) into var owner
       var owner=undefined;
       if (_anyToBool((owner=CALL1(tryGetOwnerNameDecl_,this,informError))))  {

           // for each varDecl in .list
           any _list45=PROP(list_,this);
           { var varDecl=undefined;
           for(int varDecl__inx=0 ; varDecl__inx<_list45.value.arr->length ; varDecl__inx++){varDecl=ITEM(varDecl__inx,_list45);
               // opt.type = varDecl.type
               PROP(type_,opt) = PROP(type_,varDecl);
               // opt.itemType = varDecl.itemType
               PROP(itemType_,opt) = PROP(itemType_,varDecl);
               // varDecl.nameDecl = varDecl.addMemberTo(owner,varDecl.name,opt)
               PROP(nameDecl_,varDecl) = CALL3(addMemberTo_,varDecl,owner, PROP(name_,varDecl), opt);
           }};// end for each in PROP(list_,this)

           // .declared = true
           PROP(declared_,this) = true;
       };
    }

    // method evaluateAssignments() # determine type from assigned value on properties declaration
    any Grammar_PropertiesDeclaration_evaluateAssignments(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_PropertiesDeclaration));
       //---------

       // for each varDecl in .list
       any _list46=PROP(list_,this);
       { var varDecl=undefined;
       for(int varDecl__inx=0 ; varDecl__inx<_list46.value.arr->length ; varDecl__inx++){varDecl=ITEM(varDecl__inx,_list46);
           // varDecl.getTypeFromAssignedValue
           PROP(getTypeFromAssignedValue_,varDecl);
       }};// end for each in PROP(list_,this)
       
    }



   // append to class Grammar.ForStatement ###

    // method declare()
    any Grammar_ForStatement_declare(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_ForStatement));
       //---------

// a ForStatement has a 'Scope'. Add, if they exists, indexVar & mainVar

        // declare valid .variant.indexVar:Grammar.VariableDecl
        // declare valid .variant.mainVar:Grammar.VariableDecl
        // declare valid .variant.iterable:Grammar.VariableRef

       // .createScope
       PROP(createScope_,this);
       // if .variant.indexVar, .variant.indexVar.declareInScope
       if (_anyToBool(PROP(indexVar_,PROP(variant_,this)))) {PROP(declareInScope_,PROP(indexVar_,PROP(variant_,this)));};

       // if .variant.mainVar
       if (_anyToBool(PROP(mainVar_,PROP(variant_,this))))  {
           // if .variant.iterable, default .variant.mainVar.type = .variant.iterable.itemType
           if (_anyToBool(PROP(iterable_,PROP(variant_,this)))) {_default(&PROP(type_,PROP(mainVar_,PROP(variant_,this))),PROP(itemType_,PROP(iterable_,PROP(variant_,this))));
           ;};
           // .variant.mainVar.declareInScope
           PROP(declareInScope_,PROP(mainVar_,PROP(variant_,this)));
       };
    }

        //debug:
        //.sayErr "ForStatement - pass declare"
        //console.log "index",.variant.indexVar, .indexNameDecl? .indexNameDecl.toString():undefined
        //console.log "main",.variant.mainVar, .mainNameDecl? .mainNameDecl.toString(): undefined


    // method evaluateAssignments() # Grammar.ForStatement
    any Grammar_ForStatement_evaluateAssignments(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_ForStatement));
       //---------

        // declare valid .variant.iterable.getResultType

// ForEachInArray:
// If no mainVar.type, guess type from iterable's itemType

       // if .variant instanceof Grammar.ForEachInArray
       if (_instanceof(PROP(variant_,this),Grammar_ForEachInArray))  {
           // if no .variant.mainVar.nameDecl.findOwnMember('**proto**')
           if (!_anyToBool(CALL1(findOwnMember_,PROP(nameDecl_,PROP(mainVar_,PROP(variant_,this))),any_str("**proto**"))))  {
               // var iterableType:Names.Declaration = .variant.iterable.getResultType()
               var iterableType = CALL0(getResultType_,PROP(iterable_,PROP(variant_,this)));
               // if iterableType and iterableType.findOwnMember('**item type**')  into var itemType
               var itemType=undefined;
               if (_anyToBool(iterableType) && _anyToBool((itemType=CALL1(findOwnMember_,iterableType,any_str("**item type**")))))  {
                   // .variant.mainVar.nameDecl.setMember('**proto**',itemType)
                   CALL2(setMember_,PROP(nameDecl_,PROP(mainVar_,PROP(variant_,this))),any_str("**proto**"), itemType);
               };
           };
       }

// ForEachProperty: index is string (property name)
       
       else if (_instanceof(PROP(variant_,this),Grammar_ForEachProperty))  {
           // .variant.indexVar.nameDecl.setMember('**proto**',globalPrototype('String'))
           CALL2(setMember_,PROP(nameDecl_,PROP(indexVar_,PROP(variant_,this))),any_str("**proto**"), Validate_globalPrototype(undefined,1,(any_arr){any_str("String")}));
       };
    }


    // method validatePropertyAccess() # Grammar.ForStatement
    any Grammar_ForStatement_validatePropertyAccess(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_ForStatement));
       //---------
// ForEachInArray: check if the iterable has a .length property.

       // if .variant instanceof Grammar.ForEachInArray
       if (_instanceof(PROP(variant_,this),Grammar_ForEachInArray))  {

            // declare valid .variant.iterable.getResultType

           // var iterableType:Names.Declaration = .variant.iterable.getResultType()
           var iterableType = CALL0(getResultType_,PROP(iterable_,PROP(variant_,this)));

           // if no iterableType
           if (!_anyToBool(iterableType))  {
              // #.sayErr "ForEachInArray: no type declared for: '#{.variant.iterable}'"
             //do nothing
             ;
           }
              // #.sayErr "ForEachInArray: no type declared for: '#{.variant.iterable}'"
           
           else if (!_anyToBool(PROP(isMap_,PROP(variant_,this))) && !_anyToBool(CALL1(findMember_,iterableType,any_str("length"))))  {
             // .sayErr "ForEachInArray: no .length property declared in '#{.variant.iterable}' type:'#{iterableType.toString()}'"
             CALL1(sayErr_,this,_concatAny(5,(any_arr){any_str("ForEachInArray: no .length property declared in '"), PROP(iterable_,PROP(variant_,this)), any_str("' type:'"), (CALL0(toString_,iterableType)), any_str("'")}));
             // logger.error iterableType.originalDeclarationPosition()
             logger_error(undefined,1,(any_arr){CALL0(originalDeclarationPosition_,iterableType)});
           };
       };
    }


   // append to class Grammar.ExceptionBlock
// `ExceptionBlock: (exception|catch) catchVar-IDENTIFIER Body [finally Body]`

     // method declare()
     any Grammar_ExceptionBlock_declare(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_ExceptionBlock));
       //---------

// Exception blocks have a scope

       // .createScope
       PROP(createScope_,this);
       // .addToScope .catchVar,{type:globalPrototype('Error')}
       CALL2(addToScope_,this,PROP(catchVar_,this), new(Map,1,(any_arr){
       {&NameValuePair_CLASSINFO,&((NameValuePair_s){any_str("type"),Validate_globalPrototype(undefined,1,(any_arr){any_str("Error")})})}
       }));
     }


   // append to class Grammar.VariableRef ### Helper methods

// `VariableRef: ['--'|'++']Identifier[Accessors]['--'|'++']`

// `VariableRef` is a Variable Reference.

    // method validatePropertyAccess() # Grammar.VariableRef
    any Grammar_VariableRef_validatePropertyAccess(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_VariableRef));
       //---------

       // if .parent is instance of Grammar.DeclareStatement
       if (_instanceof(PROP(parent_,this),Grammar_DeclareStatement))  {
            // declare valid .parent.specifier
           // if .parent.specifier is 'valid'
           if (__is(PROP(specifier_,PROP(parent_,this)),any_str("valid")))  {
                 // return #declare valid xx.xx.xx
                 return undefined;// #declare valid xx.xx.xx
           };
       };

// Start with main variable name, to check property names

       // var opt = new Names.NameDeclOptions
       var opt = new(Names_NameDeclOptions,0,NULL);
       // opt.informError=true
       PROP(informError_,opt) = true;
       // opt.isForward=true
       PROP(isForward_,opt) = true;
       // opt.isDummy=true
       PROP(isDummy_,opt) = true;
       // var actualVar = .tryGetFromScope(.name, opt)
       var actualVar = CALL2(tryGetFromScope_,this,PROP(name_,this), opt);

// now follow each accessor

       // if no actualVar or no .accessors, return
       if (_anyToBool(__or(any_number(!_anyToBool(actualVar)),any_number(!_anyToBool(PROP(accessors_,this)))))) {return undefined;};

       // for each ac in .accessors
       any _list47=PROP(accessors_,this);
       { var ac=undefined;
       for(int ac__inx=0 ; ac__inx<_list47.value.arr->length ; ac__inx++){ac=ITEM(ac__inx,_list47);
            // declare valid ac.name

// for PropertyAccess, check if the property name is valid

           // if ac instanceof Grammar.PropertyAccess
           if (_instanceof(ac,Grammar_PropertyAccess))  {
               // opt.isForward=false
               PROP(isForward_,opt) = false;
               // actualVar = .tryGetMember(actualVar, ac.name,opt)
               actualVar = CALL3(tryGetMember_,this,actualVar, PROP(name_,ac), opt);
           }

// else, for IndexAccess, the varRef type is now 'itemType'
// and next property access should be on defined members of the type
           
           else if (_instanceof(ac,Grammar_IndexAccess))  {
               // actualVar = actualVar.findMember('**item type**')
               actualVar = CALL1(findMember_,actualVar,any_str("**item type**"));
           }

// else, for FunctionAccess, the varRef type is now function's return type'
// and next property access should be on defined members of the return type
           
           else if (_instanceof(ac,Grammar_FunctionAccess))  {

               // if actualVar.findOwnMember('**proto**') into var prt
               var prt=undefined;
               if (_anyToBool((prt=CALL1(findOwnMember_,actualVar,any_str("**proto**")))))  {
                   // if prt.name is 'prototype', prt=prt.parent
                   if (__is(PROP(name_,prt),any_str("prototype"))) {prt = PROP(parent_,prt);};
                   // if prt.name isnt 'Function'
                   if (!__is(PROP(name_,prt),any_str("Function")))  {
                       // .warn "function call. '#{actualVar}' is class '#{prt.name}', not 'Function'"
                       CALL1(warn_,this,_concatAny(5,(any_arr){any_str("function call. '"), actualVar, any_str("' is class '"), PROP(name_,prt), any_str("', not 'Function'")}));
                   };
               };

               // actualVar = actualVar.findMember('**return type**')
               actualVar = CALL1(findMember_,actualVar,any_str("**return type**"));
           };

           // if actualVar instanceof Grammar.VariableRef
           if (_instanceof(actualVar,Grammar_VariableRef))  {
                // declare actualVar:Grammar.VariableRef
               // opt.isForward=true
               PROP(isForward_,opt) = true;
               // actualVar = actualVar.tryGetReference(opt)
               actualVar = CALL1(tryGetReference_,actualVar,opt);
           };

           // if no actualVar, break
           if (!_anyToBool(actualVar)) {break;};
       }};// end for each in PROP(accessors_,this)

       // end for #each accessor

       // return actualVar
       return actualVar;
    }

    // helper method tryGetReference(options:Names.NameDeclOptions) returns Names.Declaration
    any Grammar_VariableRef_tryGetReference(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_VariableRef));
       //---------
       // define named params
       var options= argc? arguments[0] : undefined;
       //---------

// evaluate this VariableRef.
// Try to determine referenced NameDecl.
// if we can reach a reference, return reference.
// For classes, return ClassDeclaration.nameDecl (not ClassDeclaration.nameDecl.prototype)

       // default options= new Names.NameDeclOptions
       _default(&options,new(Names_NameDeclOptions,0,NULL));

// Start with main variable name

       // var actualVar = .tryGetFromScope(.name, options)
       var actualVar = CALL2(tryGetFromScope_,this,PROP(name_,this), options);
       // if no actualVar, return
       if (!_anyToBool(actualVar)) {return undefined;};

// now check each accessor

       // if no .accessors, return actualVar
       if (!_anyToBool(PROP(accessors_,this))) {return actualVar;};

       // var partial = .name
       var partial = PROP(name_,this);

       // for each ac in .accessors
       any _list48=PROP(accessors_,this);
       { var ac=undefined;
       for(int ac__inx=0 ; ac__inx<_list48.value.arr->length ; ac__inx++){ac=ITEM(ac__inx,_list48);
            // declare valid ac.name

// for PropertyAccess

           // if ac instanceof Grammar.PropertyAccess
           if (_instanceof(ac,Grammar_PropertyAccess))  {
               // actualVar = .tryGetMember(actualVar, ac.name, options)
               actualVar = CALL3(tryGetMember_,this,actualVar, PROP(name_,ac), options);
           }

// else, for IndexAccess, the varRef type is now 'itemType'
// and next property access should be on defined members of the type
           
           else if (_instanceof(ac,Grammar_IndexAccess))  {
               // actualVar = .tryGetMember(actualVar, '**item type**')
               actualVar = CALL2(tryGetMember_,this,actualVar, any_str("**item type**"));
           }

// else, for FunctionAccess, the varRef type is now function's return type'
// and next property access should be on defined members of the return type
           
           else if (_instanceof(ac,Grammar_FunctionAccess))  {
               // actualVar = .tryGetMember(actualVar, '**return type**')
               actualVar = CALL2(tryGetMember_,this,actualVar, any_str("**return type**"));
           };

// check if we can continue on the chain

           // if actualVar isnt instance of Names.Declaration
           if (!(_instanceof(actualVar,Names_Declaration)))  {
             // actualVar = undefined
             actualVar = undefined;
             // break
             break;
           }
           
           else {
             // partial += ac.toString()
             partial.value.number += _anyToNumber(CALL0(toString_,ac));
           };
       }};// end for each in PROP(accessors_,this)

       // end for #each accessor

       // if no actualVar and options.informError
       if (!_anyToBool(actualVar) && _anyToBool(PROP(informError_,options)))  {
           // .sayErr "'#{this}'. Reference can not be analyzed further than '#{partial}'"
           CALL1(sayErr_,this,_concatAny(5,(any_arr){any_str("'"), this, any_str("'. Reference can not be analyzed further than '"), partial, any_str("'")}));
       };

       // return actualVar
       return actualVar;
    }

    // helper method getResultType() returns Names.Declaration
    any Grammar_VariableRef_getResultType(DEFAULT_ARGUMENTS){
     assert(_instanceof(this,Grammar_VariableRef));
     //---------

     // return .tryGetReference()
     return CALL0(tryGetReference_,this);
    }

// -------

   // append to class Grammar.AssignmentStatement ###


    // method evaluateAssignments() ## Grammar.AssignmentStatement
    any Grammar_AssignmentStatement_evaluateAssignments(DEFAULT_ARGUMENTS){
     assert(_instanceof(this,Grammar_AssignmentStatement));
     //---------

// check if we've got a a clear reference.

     // var reference = .lvalue.tryGetReference()
     var reference = CALL0(tryGetReference_,PROP(lvalue_,this));
     // if reference isnt instanceof Names.Declaration, return
     if (!(_instanceof(reference,Names_Declaration))) {return undefined;};
     // if reference.findOwnMember('**proto**'), return #has a type already
     if (_anyToBool(CALL1(findOwnMember_,reference,any_str("**proto**")))) {return undefined;};

// check if we've got a clear rvalue.
// if we do, set type for lvalue (unless is "null" or "undefined", they destroy type info)

     // reference.assignTypeFromValue .rvalue
     CALL1(assignTypeFromValue_,reference,PROP(rvalue_,this));
    }


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
    any Grammar_Expression_getResultType(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_Expression));
       //---------
// Try to get return type from a simple Expression

        // declare valid .root.getResultType
       // return .root.getResultType() # .root is Grammar.Oper or Grammar.Operand
       return CALL0(getResultType_,PROP(root_,this));// # .root is Grammar.Oper or Grammar.Operand
    }


   // append to class Grammar.Oper ###

// for 'into var x' oper, we declare the var, and we deduce type

    // method declare()
    any Grammar_Oper_declare(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_Oper));
       //---------

       // if .intoVar # is a into-assignment operator with 'var' declaration
       if (_anyToBool(PROP(intoVar_,this)))  {// # is a into-assignment operator with 'var' declaration

           // var varRef = .right.name
           var varRef = PROP(name_,PROP(right_,this));
           // if varRef isnt instance of Grammar.VariableRef
           if (!(_instanceof(varRef,Grammar_VariableRef)))  {
               // .throwError "Expected 'variable name' after 'into var'"
               CALL1(throwError_,this,any_str("Expected 'variable name' after 'into var'"));
           };

           // if varRef.accessors
           if (_anyToBool(PROP(accessors_,varRef)))  {
               // .throwError "Expected 'simple variable name' after 'into var'"
               CALL1(throwError_,this,any_str("Expected 'simple variable name' after 'into var'"));
           };

           // var opt = new Names.NameDeclOptions
           var opt = new(Names_NameDeclOptions,0,NULL);
           // opt.type = varRef.type
           PROP(type_,opt) = PROP(type_,varRef);
           // .addToScope .declareName(varRef.name,opt)
           CALL1(addToScope_,this,CALL2(declareName_,this,PROP(name_,varRef), opt));
       };
    }

    // method evaluateAssignments()
    any Grammar_Oper_evaluateAssignments(DEFAULT_ARGUMENTS){
     assert(_instanceof(this,Grammar_Oper));
     //---------

// for into-assignment operator

     // if .name is 'into' # is a into-assignment operator
     if (__is(PROP(name_,this),any_str("into")))  {// # is a into-assignment operator

// check if we've got a clear reference (into var x)

         // if .right.name instance of Grammar.VariableRef
         if (_instanceof(PROP(name_,PROP(right_,this)),Grammar_VariableRef))  {

              // declare valid .right.name.tryGetReference
             // var nameDecl = .right.name.tryGetReference()
             var nameDecl = CALL0(tryGetReference_,PROP(name_,PROP(right_,this)));

             // if nameDecl isnt instanceof Names.Declaration, return
             if (!(_instanceof(nameDecl,Names_Declaration))) {return undefined;};
             // if nameDecl.findOwnMember('**proto**'), return #has a type already
             if (_anyToBool(CALL1(findOwnMember_,nameDecl,any_str("**proto**")))) {return undefined;};

// check if we've got a clear .left (value to be assigned) type
// if we do, set type for .rigth ('into var x') (unless is "null" or "undefined", they destroy type info)

             // nameDecl.assignTypeFromValue .left
             CALL1(assignTypeFromValue_,nameDecl,PROP(left_,this));
         };
     };
    }


    // helper method getResultType() returns Names.Declaration
    any Grammar_Oper_getResultType(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_Oper));
       //---------
// Try to get return type from this Oper (only for 'new' unary oper)

        // declare valid .right.getResultType

       // if .name is 'new'
       if (__is(PROP(name_,this),any_str("new")))  {
           // return .right.getResultType() #.right is Grammar.Operand
           return CALL0(getResultType_,PROP(right_,this));// #.right is Grammar.Operand
       };
    }


   // append to class Grammar.Operand ###

    // helper method getResultType() returns Names.Declaration
    any Grammar_Operand_getResultType(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Grammar_Operand));
       //---------
// Try to get return type from this Operand

        // declare valid .name.type
        // declare valid .name.getResultType
        // declare valid .name.tryGetReference

       // if .name instance of Grammar.ObjectLiteral
       if (_instanceof(PROP(name_,this),Grammar_ObjectLiteral))  {
           // return .name.getResultType()
           return CALL0(getResultType_,PROP(name_,this));
       }
       
       else if (_instanceof(PROP(name_,this),Grammar_Literal))  {
           // return globalPrototype(.name.type)
           return Validate_globalPrototype(undefined,1,(any_arr){PROP(type_,PROP(name_,this))});
       }
       
       else if (_instanceof(PROP(name_,this),Grammar_VariableRef))  {
           // return .name.tryGetReference()
           return CALL0(tryGetReference_,PROP(name_,this));
       };
    }


   // append to class Grammar.DeclareStatement
    // method declare() # pass 1, declare as props
    any Grammar_DeclareStatement_declare(DEFAULT_ARGUMENTS){
     assert(_instanceof(this,Grammar_DeclareStatement));
     //---------

// declare [all] x:type
// declare [global] var x
// declare on x
// declare valid x.y.z


     // if .specifier is 'on'
     if (__is(PROP(specifier_,this),any_str("on")))  {

         // var opt=new Names.NameDeclOptions
         var opt = new(Names_NameDeclOptions,0,NULL);
         // opt.isForward = true
         PROP(isForward_,opt) = true;
         // var reference = .tryGetFromScope(.name,opt)
         var reference = CALL2(tryGetFromScope_,this,PROP(name_,this), opt);

         // if Strings.isCapitalized(reference.name) //let's assume is a Class
         if (_anyToBool(Strings_isCapitalized(undefined,1,(any_arr){PROP(name_,reference)})))  { //let's assume is a Class
             // if no reference.findOwnMember('prototype'), reference.addMember('prototype')
             if (!_anyToBool(CALL1(findOwnMember_,reference,any_str("prototype")))) {CALL1(addMember_,reference,any_str("prototype"));};
             // reference=reference.findOwnMember('prototype')
             reference = CALL1(findOwnMember_,reference,any_str("prototype"));
         };

         // for each varDecl in .names
         any _list49=PROP(names_,this);
         { var varDecl=undefined;
         for(int varDecl__inx=0 ; varDecl__inx<_list49.value.arr->length ; varDecl__inx++){varDecl=ITEM(varDecl__inx,_list49);
             // .addMemberTo reference, varDecl.createNameDeclaration()
             CALL2(addMemberTo_,this,reference, CALL0(createNameDeclaration_,varDecl));
         }};// end for each in PROP(names_,this)
         
     }

// else: declare (name affinity|var) (VariableDecl,)
     
     else if (CALL1(indexOf_,_newArray(2,(any_arr){any_str("affinity"), any_str("var")}),PROP(specifier_,this)).value.number>=0)  {

         // for each varDecl in .names
         any _list50=PROP(names_,this);
         { var varDecl=undefined;
         for(int varDecl__inx=0 ; varDecl__inx<_list50.value.arr->length ; varDecl__inx++){varDecl=ITEM(varDecl__inx,_list50);

           // varDecl.nameDecl = varDecl.createNameDeclaration()
           PROP(nameDecl_,varDecl) = CALL0(createNameDeclaration_,varDecl);

           // if .specifier is 'var'
           if (__is(PROP(specifier_,this),any_str("var")))  {
               // if .globVar
               if (_anyToBool(PROP(globVar_,this)))  {
                    // declare valid project.root.addToScope
                   // project.root.addToScope varDecl.nameDecl
                   CALL1(addToScope_,PROP(root_,Validate_project),PROP(nameDecl_,varDecl));
               }
               
               else {
                   // .addToScope varDecl.nameDecl
                   CALL1(addToScope_,this,PROP(nameDecl_,varDecl));
               };
           }
           
           else if (__is(PROP(specifier_,this),any_str("affinity")))  {
               // var classDecl = .getParent(Grammar.ClassDeclaration)
               var classDecl = CALL1(getParent_,this,Grammar_ClassDeclaration);
               // if no classDecl
               if (!_anyToBool(classDecl))  {
                   // .sayErr "'declare name affinity' must be included in a class declaration"
                   CALL1(sayErr_,this,any_str("'declare name affinity' must be included in a class declaration"));
                   // return
                   return undefined;
               };
                // #add as member to nameAffinity, referencing class decl (.nodeDeclared)
               // varDecl.nameDecl.nodeDeclared = classDecl
               PROP(nodeDeclared_,PROP(nameDecl_,varDecl)) = classDecl;
               // nameAffinity.members.set varDecl.name.capitalized(), classDecl.nameDecl
               CALL2(set_,PROP(members_,Validate_nameAffinity),CALL0(capitalized_,PROP(name_,varDecl)), PROP(nameDecl_,classDecl));
           };
         }};// end for each in PROP(names_,this)
         
     };
    }

// if .specifier is 'on-the-fly', the type will be converted on next passes over the created Names.Declaration.
// On the method validatePropertyAccess(), types will be switched "on the fly"
// while checking property access.

    // method evaluateAssignments() # Grammar.DeclareStatement ###
    any Grammar_DeclareStatement_evaluateAssignments(DEFAULT_ARGUMENTS){
     assert(_instanceof(this,Grammar_DeclareStatement));
     //---------
// Assign specific type to varRef - for the entire compilation

     // if .specifier is 'type'
     if (__is(PROP(specifier_,this),any_str("type")))  {
         // var opt = new Names.NameDeclOptions
         var opt = new(Names_NameDeclOptions,0,NULL);
         // opt.informError=true
         PROP(informError_,opt) = true;
         // if .varRef.tryGetReference(opt) into var actualVar
         var actualVar=undefined;
         if (_anyToBool((actualVar=CALL1(tryGetReference_,PROP(varRef_,this),opt))))  {
             // .setTypes actualVar
             CALL1(setTypes_,this,actualVar);
         };
     };
    }

    // helper method setTypes(actualVar:Names.Declaration) # Grammar.DeclareStatement ###
    any Grammar_DeclareStatement_setTypes(DEFAULT_ARGUMENTS){
     assert(_instanceof(this,Grammar_DeclareStatement));
     //---------
     // define named params
     var actualVar= argc? arguments[0] : undefined;
     //---------
// Assign types if it was declared

      // #create type on the fly, overwrite existing type

     // .setSubType actualVar,.type,'**proto**'
     CALL3(setSubType_,this,actualVar, PROP(type_,this), any_str("**proto**"));
     // .setSubType actualVar,.itemType,'**item type**'
     CALL3(setSubType_,this,actualVar, PROP(itemType_,this), any_str("**item type**"));
    }

    // helper method setSubType(actualVar:Names.Declaration, toSet, propName )
    any Grammar_DeclareStatement_setSubType(DEFAULT_ARGUMENTS){
     assert(_instanceof(this,Grammar_DeclareStatement));
     //---------
     // define named params
     var actualVar, toSet, propName;
     actualVar=toSet=propName=undefined;
     switch(argc){
       case 3:propName=arguments[2];
       case 2:toSet=arguments[1];
       case 1:actualVar=arguments[0];
     }
     //---------
// Assign type if it was declared

     // if toSet #create type on the fly
     if (_anyToBool(toSet))  {// #create type on the fly
          //var act=actualVar.findMember(propName)
          //print "set *type* was #{act} set to #{toSet}"
         // actualVar.setMember propName, toSet
         CALL2(setMember_,actualVar,propName, toSet);
         // var result = actualVar.processConvertTypes()
         var result = CALL0(processConvertTypes_,actualVar);
         // if result.failures, .sayErr "can't find type '#{toSet}' in scope"
         if (_anyToBool(PROP(failures_,result))) {CALL1(sayErr_,this,_concatAny(3,(any_arr){any_str("can't find type '"), toSet, any_str("' in scope")}));};
     };
    }

    // method validatePropertyAccess() # Grammar.DeclareStatement ###
    any Grammar_DeclareStatement_validatePropertyAccess(DEFAULT_ARGUMENTS){
     assert(_instanceof(this,Grammar_DeclareStatement));
     //---------

// declare members on the fly, with optional type

     // var actualVar:Names.Declaration
     var actualVar = undefined;

     // switch .specifier
     any _switch5=PROP(specifier_,this);
        // case 'valid':
     if (__is(_switch5,any_str("valid"))){

           // actualVar = .tryGetFromScope(.varRef.name,{informError:true})
           actualVar = CALL2(tryGetFromScope_,this,PROP(name_,PROP(varRef_,this)), new(Map,1,(any_arr){
           {&NameValuePair_CLASSINFO,&((NameValuePair_s){any_str("informError"),true})}
           }));
           // if no actualVar, return
           if (!_anyToBool(actualVar)) {return undefined;};

           // for each ac in .varRef.accessors
           any _list51=PROP(accessors_,PROP(varRef_,this));
           { var ac=undefined;
           for(int ac__inx=0 ; ac__inx<_list51.value.arr->length ; ac__inx++){ac=ITEM(ac__inx,_list51);
                // declare valid ac.name

               // if ac isnt instance of Grammar.PropertyAccess
               if (!(_instanceof(ac,Grammar_PropertyAccess)))  {
                   // actualVar = undefined
                   actualVar = undefined;
                   // break
                   break;
               };

               // if ac.name is 'prototype'
               if (__is(PROP(name_,ac),any_str("prototype")))  {
                   // actualVar = actualVar.findOwnMember(ac.name) or .addMemberTo(actualVar, ac.name)
                   actualVar = __or(CALL1(findOwnMember_,actualVar,PROP(name_,ac)),CALL2(addMemberTo_,this,actualVar, PROP(name_,ac)));
               }
               
               else {
                   // actualVar = actualVar.findMember(ac.name) or .addMemberTo(actualVar, ac.name)
                   actualVar = __or(CALL1(findMember_,actualVar,PROP(name_,ac)),CALL2(addMemberTo_,this,actualVar, PROP(name_,ac)));
               };
           }};// end for each in PROP(accessors_,PROP(varRef_,this))

           // end for

           // if actualVar, .setTypes actualVar
           if (_anyToBool(actualVar)) {CALL1(setTypes_,this,actualVar);};
     
     }// case 'on-the-fly':
     else if (__is(_switch5,any_str("on-the-fly"))){
            // #set type on-the-fly, from here until next type-assignment
            // #we allow more than one "declare x:type" on the same block
           // var opt=new Names.NameDeclOptions
           var opt = new(Names_NameDeclOptions,0,NULL);
           // opt.informError = true
           PROP(informError_,opt) = true;
           // if .varRef.tryGetReference(opt) into actualVar
           if (_anyToBool((actualVar=CALL1(tryGetReference_,PROP(varRef_,this),opt))))  {
               // .setTypes actualVar
               CALL1(setTypes_,this,actualVar);
           };
     
     };
    }


   // helper function AddGlobalClasses()
   any Validate_AddGlobalClasses(DEFAULT_ARGUMENTS){

       // var nameDecl
       var nameDecl = undefined;

       // for each name in arguments.toArray()
       any _list52=_newArray(argc,arguments);
       { var name=undefined;
       for(int name__inx=0 ; name__inx<_list52.value.arr->length ; name__inx++){name=ITEM(name__inx,_list52);
           // nameDecl = globalScope.addMember(name)
           nameDecl = CALL1(addMember_,Validate_globalScope,name);
           // nameDecl.addMember 'prototype'
           CALL1(addMember_,nameDecl,any_str("prototype"));

            // add to name affinity
           // if not nameAffinity.members.has(name)
           if (!(_anyToBool(CALL1(has_,PROP(members_,Validate_nameAffinity),name))))  {
               // nameAffinity.members.set name, nameDecl
               CALL2(set_,PROP(members_,Validate_nameAffinity),name, nameDecl);
           };
       }};// end for each in _newArray(argc,arguments)
       
   }

//-------------------------
void Validate__moduleInit(void){
   
};