#include "Validate.h"
//-------------------------
//Module Validate
//-------------------------
#include "Validate.c.extra"
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
      //-----------------------
      // Class Names_ConvertResult: static list of METHODS(verbs) and PROPS(things)
      //-----------------------
      
      static _methodInfoArr Names_ConvertResult_METHODS = {
      
      {0,0}}; //method jmp table initializer end mark
      
      static _posTableItem_t Names_ConvertResult_PROPS[] = {
      converted_
    , failures_
    };
      
any Validate_AddGlobalClasses(DEFAULT_ARGUMENTS); //forward declare
//Name Validation 
//===============
//This module contains helper functions to manage variable, 
//function and object property name declaration.
//This module purpose is to make the compiler catch 
//mistyped variable and property names at compile time
//(instead of YOU spending hours to debug a subtle bug at run time)
//In order to do name validation we need to construct the scope tree, 
//and also register all valid members of all "types" (objects).
//----------
//##Dependencies:
//This module extends Grammar classes, adding 'declare', 'evaluateAssignments', etc.
//methods to validate var & property names.
    //import 
        //ASTBase, Grammar
        //Names, Environment
    
    //import logger, UniqueID, Strings
    
    //shim import LiteCore, Map
    
   // 
//---------
//Module vars:
    //var project
    //var globalScope: Names.Declaration
    //var nameAffinity: Names.Declaration
//##Members & Scope
//A Names.Declaration have a `.members=Map string to NamedDeclaration` property
//`.members={}` is a map to other `Names.Declaration`s which are valid members of this name.
//A 'scope' is a Names.Declaration whose members are the declared vars in the scope.
//For Example: 'console' is stored at 'Global Scope' and has '.log' and '.error' as members
//Project
//|_ 
   //scope = {
     //name: 'global scope'
     //members: {
        //console: { 
          //name:'console'
          //type: Object
          //members: 
              //log: 
                //name:'log'
                //type: Function
              //error:
                //name: 'error'
                //type: Function
          //}
     //}
//'Scopes' are created only for certain AST nodes, such as:
//Module, FunctionDeclaration, ForStatement, Catch/Exception, etc.
//Variables in the scope
//----------------------
//Referenced vars must be in the scope . You are required to explicitly declare your variables
//so you're **unable** to create a global variable by mistipying a name in an assignment. 
//The compiler will catch such a misstype as "undeclared variable". 
//Object properties access
//------------------------
//Object properties access are another source of subtle bugs in any medium to large javascript project.
//The problem is a mistyped property name results in the property not being found 
//in the object nor the prototype chain, and javascript in this case just returns "undefined" 
//and goes on. This causes hard to find subtle bugs.
//Example: The following javascript code, **will probably need debugging.**
  //options = options || {};
  //if (options.importantCodeDefaultTrue===undefined) options.importantCodeDefaultTrue=true;
  //if (options.anotherOptionDefaultZero===undefined) options.anotherOptionDefaultZero=0;
  //initFunction(options);
  //prepareDom(options);
  //if (options.importantCodesDefaultTrue) { moreInit(); subtleDomChanges(); }
 // 
//The same LiteScript code, but the mistake **will be caught by the compiler**
//The compiler will emit an error during compilation, -no debugging required-.
  //options = options or {}
  //if options.importantCodeDefaultTrue is undefined, options.importantCodeDefaultTrue=true
  //if options.anotherOptionDefaultZero is undefined, options.anotherOptionDefaultZero=0;
  //initFunction options
  //prepareDom options
  //if options.importantCodesDefaultTrue then moreInit(); subtleDomChanges()
//In order to completely check property names, a full type system is neeeded.
//LiteScript, based in js, *is not typed*, but you can add "type annotations"
//to your variable declaration, in order to declare the list of valid members 
//to check at compile time.
//The compiler will guess var types from creation, assignment
//and by name affinity. If type cannot be guessed you can also explicitily use a 
//`declare on myObj prop1,prop2` statement to dismiss the 'UNDECLARED PROPERTY' warnings.
//Example:
///*
  //class ClassA
    //properties 
      //classAProp1, classAProp2
   // 
    //method methodA
      //this.classAProp1 = 11
      //this.classAProp2 = 12
  //class ClassB
   // 
    //properties 
      //classBProp1, classBProp2
    //method methodB
      //this.classBProp1 = 21
  //var instanceB = new ClassB // implicit type
  //instanceB.classBprop1 = 5 // <-- this **will be caught** as "case mismatch" since classBprop1 is defined as classBProp1
  //var bObj = instanceB // simple assignment, implicit type
  //bObj.classAProp1 = 5 // <-- this **will be caught** as: object 'bObj' has no property 'classAProp1'
  //var xObj = callToFn() // unknown type
 // 
  //xObj.classBProp1 = 5 // <-- this trigger a "classBProp1 IS NOT A DECLARED PROPERTY OF xObj"
  //declare on xObj  // <-- this fixes it
    //classBProp1
  //xObj.classBProp1 = 5 // <-- this is OK now
  //var xObj:ClassB = callToFn() // type annotation, this also fixes it
 // 
  //bObj.classBProp1 = 5 // <-- this is ok
//*/
//### export function validate()
    any Validate_validate(DEFAULT_ARGUMENTS){
//We start this module once the entire multi-node AST tree has been parsed.
//Start running passes on the AST
//#### Pass 1.0 Declarations 
//Walk the tree, and call function 'declare' on every node having it. 
//'declare' will create scopes, and vars in the scope. 
//May inform 'DUPLICATES' and 'CASE MISMATCH' errors.
        //logger.info "- Process Declarations"
        logger_info(undefined,1,(any_arr){any_str("- Process Declarations")});
        //walkAllNodesCalling 'declare'
        Validate_walkAllNodesCalling(undefined,1,(any_arr){any_str("declare")});
///*
//#### Pass 1.1 Declare By Assignment
//Walk the tree, and check assignments looking for: 'module.exports.x=x' and 'x.prototype.y = '.
//Treat them as declarations.
        //logger.info "- Declare By Assignment (support .js syntax, .exports.x=..., .prototype.x=...)"
        //walkAllNodesCalling 'declareByAssignment'
//*/
//#### Pass 1.2 connectImportRequire
//handle: `import x` and `global declare x`
//Make var x point to imported module 'x' exports 
        //declare valid project.moduleCache
        
        //logger.info "- Connect Imported"
        logger_info(undefined,1,(any_arr){any_str("- Connect Imported")});
        //for each moduleNode:Grammar.Module in map project.moduleCache
        any _list32=PROP(moduleCache_,Validate_project);
        {NameValuePair_ptr __nvp=NULL; //name:value pair
        int64_t __len=MAPSIZE(_list32); //how many pairs
        var moduleNode=undefined; //value
        for(int64_t __inx=0 ; __inx < __len ; __inx++ ){
          __nvp = MAPITEM( __inx,_list32);
          moduleNode= __nvp->value;
        
          //for each node in moduleNode.requireCallNodes
          any _list33=PROP(requireCallNodes_,moduleNode);
          { var node=undefined;
          for(int node__inx=0 ; node__inx<_list33.value.arr->length ; node__inx++){node=ITEM(node__inx,_list33);
          
            //declare valid node.importedModule.exports.members
            
            //if node.importedModule
            if (_anyToBool(PROP(importedModule_,node)))  {
              //var parent: ASTBase
              var parent = undefined;
              //var referenceNameDecl: Names.Declaration //var where to import exported module members
              var referenceNameDecl = undefined; //var where to import exported module members
              //declare valid parent.nameDecl
              
//1st, more common: if node is Grammar.ImportStatementItem
              //if node instance of Grammar.ImportStatementItem
              if (_instanceof(node,Grammar_ImportStatementItem))  {
                  //declare node:Grammar.ImportStatementItem
                  
                  //referenceNameDecl = node.nameDecl
                  referenceNameDecl = PROP(nameDecl_,node);
//if we process a 'global declare' command (interface) 
//all exported should go to the global scope.
//If the imported module exports a class, e.g.: "export default class OptionsParser",
//'importedModule.exports' points to the class 'prototype'. 
           // 
                  //if node.getParent(Grammar.DeclareStatement) isnt undefined //is a "global declare"
                  if (!__is(METHOD(getParent_,node)(node,1,(any_arr){Grammar_DeclareStatement}),undefined))  { //is a "global declare"
                        //var moveWhat = node.importedModule.exports
                        var moveWhat = PROP(exports_,PROP(importedModule_,node));
                        //#if the module exports a "class-function", move to global with class name
                        //if moveWhat.findOwnMember('prototype') into var protoExportNameDecl 
                        var protoExportNameDecl=undefined;
                        if (_anyToBool((protoExportNameDecl=METHOD(findOwnMember_,moveWhat)(moveWhat,1,(any_arr){any_str("prototype")}))))  {
                            ////if it has a 'prototype'
                            ////replace 'prototype' (on module.exports) with the class name, and add as the class
                            //protoExportNameDecl.name = protoExportNameDecl.parent.name
                            PROP(name_,protoExportNameDecl) = PROP(name_,PROP(parent_,protoExportNameDecl));
                            //project.rootModule.addToScope protoExportNameDecl
                            __call(addToScope_,PROP(rootModule_,Validate_project),1,(any_arr){protoExportNameDecl});
                        }
                     // 
                        //else
                        
                        else {
                            //// a "declare global x", but "x.lite.md" do not export a class
                            //// move all exported (namespace members) to global scope
                            //for each nameDecl in map moveWhat.members
                            any _list34=PROP(members_,moveWhat);
                            {NameValuePair_ptr __nvp=NULL; //name:value pair
                            int64_t __len=MAPSIZE(_list34); //how many pairs
                            var nameDecl=undefined; //value
                            for(int64_t __inx=0 ; __inx < __len ; __inx++ ){
                                __nvp = MAPITEM( __inx,_list34);
                                nameDecl= __nvp->value;
                            
                                //project.rootModule.addToScope nameDecl
                                __call(addToScope_,PROP(rootModule_,Validate_project),1,(any_arr){nameDecl});
                            }};// end for each in map PROP(members_,moveWhat)
                            
                        };
                        ////we moved all to the global scope, e.g.:"declare global jQuery" do not assign to referenceNameDecl
                        //referenceNameDecl = undefined
                        referenceNameDecl = undefined;
                  };
              };
///*
//else is a "require" call (VariableRef). 
//Get parent node.
              //else
                  //parent = node.parent
                  //if parent instance of Grammar.Operand 
                     //parent = node.parent.parent.parent # varRef->operand->Expression->Expression Parent
//get referece where import module is being assigned to
                  //if parent instance of Grammar.AssignmentStatement 
                      //var opt = new Names.NameDeclOptions
                      //opt.informError = true
                      //declare valid parent.lvalue.tryGetReference
                      //referenceNameDecl = parent.lvalue.tryGetReference(opt) 
                 // 
                  //else if parent instance of Grammar.VariableDecl
                      //referenceNameDecl = parent.nameDecl
              //end if
//*/
//After determining referenceNameDecl where imported items go,
//make referenceNameDecl point to importedModule.exports
              //if referenceNameDecl
              if (_anyToBool(referenceNameDecl))  {
                  //referenceNameDecl.makePointTo node.importedModule.exports
                  METHOD(makePointTo_,referenceNameDecl)(referenceNameDecl,1,(any_arr){PROP(exports_,PROP(importedModule_,node))});
                  //// if it has a 'prototype' => it's a Function-Class
                  //// else we assume all exported from module is a namespace
                  //referenceNameDecl.isNamespace = no referenceNameDecl.findOwnMember('prototype') 
                  PROP(isNamespace_,referenceNameDecl) = any_number(!_anyToBool(METHOD(findOwnMember_,referenceNameDecl)(referenceNameDecl,1,(any_arr){any_str("prototype")})));
              };
            };
          }};// end for each in PROP(requireCallNodes_,moduleNode)
          
        }};// end for each in map PROP(moduleCache_,Validate_project)
//#### Pass 1.3 Process "Append To" Declarations
//Since 'append to [class|object] x.y.z' statement can add to any object, we delay 
//"Append To" declaration to this point, where 'x.y.z' can be analyzed and a reference obtained.
//Walk the tree, and check "Append To" Methods & Properties Declarations
        //logger.info "- Processing Append-To, extends"
        logger_info(undefined,1,(any_arr){any_str("- Processing Append-To, extends")});
        //walkAllNodesCalling 'processAppendToExtends'
        Validate_walkAllNodesCalling(undefined,1,(any_arr){any_str("processAppendToExtends")});
//#### Pass 2.0 Apply Name Affinity
        //logger.info "- Apply Name Affinity"
        logger_info(undefined,1,(any_arr){any_str("- Apply Name Affinity")});
        //#first, try to assign type by "name affinity" 
        //#(only applies when type is not specified)
        //for each nameDecl in Names.allNameDeclarations 
        any _list35=Names_allNameDeclarations;
        { var nameDecl=undefined;
        for(int nameDecl__inx=0 ; nameDecl__inx<_list35.value.arr->length ; nameDecl__inx++){nameDecl=ITEM(nameDecl__inx,_list35);
        
            //nameDecl.assignTypebyNameAffinity()
            METHOD(assignTypebyNameAffinity_,nameDecl)(nameDecl,0,NULL);
        }};// end for each in Names_allNameDeclarations
//#### Pass 2.1 Convert Types
//for each Names.Declaration try to find the declared 'type' (string) in the scope. 
//Repeat until no conversions can be made.
        //logger.info "- Converting Types"
        logger_info(undefined,1,(any_arr){any_str("- Converting Types")});
        //#now try de-referencing types
        //var pass=0, sumConverted=0, sumFailures=0, lastSumFailures=0
        var pass = any_number(0), sumConverted = any_number(0), sumFailures = any_number(0), lastSumFailures = any_number(0);
        //#repeat until all converted
        //do
        do{
            //lastSumFailures = sumFailures
            lastSumFailures = sumFailures;
            //sumFailures = 0
            sumFailures = any_number(0);
            //sumConverted = 0
            sumConverted = any_number(0);
           // 
            //#process all, sum conversion failures
            //for each nameDecl in Names.allNameDeclarations 
            any _list36=Names_allNameDeclarations;
            { var nameDecl=undefined;
            for(int nameDecl__inx=0 ; nameDecl__inx<_list36.value.arr->length ; nameDecl__inx++){nameDecl=ITEM(nameDecl__inx,_list36);
            
                //var result = nameDecl.processConvertTypes()
                var result = METHOD(processConvertTypes_,nameDecl)(nameDecl,0,NULL);
                //sumFailures += result.failures
                sumFailures.value.number += _anyToNumber(PROP(failures_,result));
                //sumConverted += result.converted
                sumConverted.value.number += _anyToNumber(PROP(converted_,result));
            }};// end for each in Names_allNameDeclarations
            //end for
            
            //pass++
            pass.value.number++;
        } while (!(__is(sumFailures,lastSumFailures)));// end loop
            ////logger.debug "  -  Pass #{pass}, converted:#{sumConverted}, failures:#{sumFailures}"
        //#loop unitl no progress is made
        //loop until sumFailures is lastSumFailures
//Inform unconverted types as errors
        //if sumFailures #there was failures, inform al errors
        if (_anyToBool(sumFailures))  {// #there was failures, inform al errors
            //var opt = new Names.NameDeclOptions
            var opt = new(Names_NameDeclOptions,0,NULL);
            //opt.informError = true
            PROP(informError_,opt) = true;
            //for each nameDecl in Names.allNameDeclarations
            any _list37=Names_allNameDeclarations;
            { var nameDecl=undefined;
            for(int nameDecl__inx=0 ; nameDecl__inx<_list37.value.arr->length ; nameDecl__inx++){nameDecl=ITEM(nameDecl__inx,_list37);
            
                //nameDecl.processConvertTypes(opt)
                METHOD(processConvertTypes_,nameDecl)(nameDecl,1,(any_arr){opt});
            }};// end for each in Names_allNameDeclarations
            
        };
//#### Pass 3 Evaluate Assignments
//Walk the scope tree, and for each assignment, 
//IF L-value has no type, try to guess from R-value's result type
        //logger.info "- Evaluating Assignments"
        logger_info(undefined,1,(any_arr){any_str("- Evaluating Assignments")});
        //walkAllNodesCalling 'evaluateAssignments'
        Validate_walkAllNodesCalling(undefined,1,(any_arr){any_str("evaluateAssignments")});
//#### Pass 4 -Final- Validate Property Access
//Once we have all vars declared and typed, walk the AST, 
//and for each VariableRef validate property access.
//May inform 'UNDECLARED PROPERTY'.
        //logger.info "- Validating Property Access"
        logger_info(undefined,1,(any_arr){any_str("- Validating Property Access")});
        //walkAllNodesCalling 'validatePropertyAccess'
        Validate_walkAllNodesCalling(undefined,1,(any_arr){any_str("validatePropertyAccess")});
//Inform forward declarations not fulfilled, as errors
        //for each nameDecl in Names.allNameDeclarations
        any _list38=Names_allNameDeclarations;
        { var nameDecl=undefined;
        for(int nameDecl__inx=0 ; nameDecl__inx<_list38.value.arr->length ; nameDecl__inx++){nameDecl=ITEM(nameDecl__inx,_list38);
        
            //if nameDecl.isForward and not nameDecl.isDummy
            if (_anyToBool(PROP(isForward_,nameDecl)) && !(_anyToBool(PROP(isDummy_,nameDecl))))  {
                //nameDecl.warn "forward declared, but never found"
                METHOD(warn_,nameDecl)(nameDecl,1,(any_arr){any_str("forward declared, but never found")});
                //var container = nameDecl.nodeDeclared.getParent(Grammar.ClassDeclaration)
                var container = __call(getParent_,PROP(nodeDeclared_,nameDecl),1,(any_arr){Grammar_ClassDeclaration});
                //if container
                if (_anyToBool(container))  {
                  //declare container:Grammar.ClassDeclaration
                  
                  //declare valid container.varRef.toString
                  
                  //if container.varRef, logger.warning "#{container.positionText()} more info: '#{nameDecl.name}' of '#{container.varRef.toString()}'"
                  if (_anyToBool(PROP(varRef_,container))) {logger_warning(undefined,1,(any_arr){_concatAny(6,METHOD(positionText_,container)(container,0,NULL), any_str(" more info: '"), PROP(name_,nameDecl), any_str("' of '"), __call(toString_,PROP(varRef_,container),0,NULL), any_str("'"))});};
                };
            };
        }};// end for each in Names_allNameDeclarations
        
    return undefined;
    }
    //end function validate
//### export function walkAllNodesCalling(methodName:string)
    any Validate_walkAllNodesCalling(DEFAULT_ARGUMENTS){
        // define named params
        var methodName= argc? arguments[0] : undefined;
        //---------
        //var methodSymbol
        var methodSymbol = undefined;
        //methodSymbol = LiteCore.getSymbol(methodName)
        methodSymbol = LiteCore_getSymbol(undefined,1,(any_arr){methodName});
//For all modules, for each node, if the specific AST node has methodName, call it
        //for each moduleNode:Grammar.Module in map project.moduleCache
        any _list39=PROP(moduleCache_,Validate_project);
        {NameValuePair_ptr __nvp=NULL; //name:value pair
        int64_t __len=MAPSIZE(_list39); //how many pairs
        var moduleNode=undefined; //value
        for(int64_t __inx=0 ; __inx < __len ; __inx++ ){
            __nvp = MAPITEM( __inx,_list39);
            moduleNode= __nvp->value;
        
            //moduleNode.callOnSubTree methodSymbol
            METHOD(callOnSubTree_,moduleNode)(moduleNode,1,(any_arr){methodSymbol});
        }};// end for each in map PROP(moduleCache_,Validate_project)
        
    return undefined;
    }
//### export function initialize(aProject)
    any Validate_initialize(DEFAULT_ARGUMENTS){
        // define named params
        var aProject= argc? arguments[0] : undefined;
        //---------
//Initialize module vars
        //project = aProject
        Validate_project = aProject;
       // 
        //#clear global Names.Declaration list
        //Names.allNameDeclarations = []
        Names_allNameDeclarations = new(Array,0,NULL);
//initialize NameAffinity
        //var options = new Names.NameDeclOptions
        var options = new(Names_NameDeclOptions,0,NULL);
        //options.normalizeModeKeepFirstCase = true #nameAffinity members are stored: [0].Toupper()+slice(1).toLower()
        PROP(normalizeModeKeepFirstCase_,options) = true;// #nameAffinity members are stored: [0].Toupper()+slice(1).toLower()
        //nameAffinity= new Names.Declaration('Name Affinity',options) # project-wide name affinity for classes
        Validate_nameAffinity = new(Names_Declaration,2,(any_arr){any_str("Name Affinity"), options});// # project-wide name affinity for classes
        ////populateGlobalScope(aProject)
//The "scope" of rootNode is the global scope. 
        //globalScope = project.rootModule.createScope()
        Validate_globalScope = __call(createScope_,PROP(rootModule_,Validate_project),0,NULL);
//Initialize global scope
//a)non-instance values
        //globalScope.addMember 'undefined'
        METHOD(addMember_,Validate_globalScope)(Validate_globalScope,1,(any_arr){any_str("undefined")});
        //var opt = new Names.NameDeclOptions
        var opt = new(Names_NameDeclOptions,0,NULL);
        //opt.value = null
        PROP(value_,opt) = null;
        //globalScope.addMember 'null',opt
        METHOD(addMember_,Validate_globalScope)(Validate_globalScope,2,(any_arr){any_str("null"), opt});
        //opt.value = true
        PROP(value_,opt) = true;
        //globalScope.addMember 'true',opt
        METHOD(addMember_,Validate_globalScope)(Validate_globalScope,2,(any_arr){any_str("true"), opt});
        //opt.value = false
        PROP(value_,opt) = false;
        //globalScope.addMember 'false',opt
        METHOD(addMember_,Validate_globalScope)(Validate_globalScope,2,(any_arr){any_str("false"), opt});
        //opt.value = NaN
        PROP(value_,opt) = NaN;
        //globalScope.addMember 'NaN',opt
        METHOD(addMember_,Validate_globalScope)(Validate_globalScope,2,(any_arr){any_str("NaN"), opt});
        //opt.value = Infinity
        PROP(value_,opt) = Infinity;
        //globalScope.addMember 'Infinity',opt
        METHOD(addMember_,Validate_globalScope)(Validate_globalScope,2,(any_arr){any_str("Infinity"), opt});
//b) pre-create core classes, to allow the interface.md file to declare property types and return values
        //AddGlobalClasses 
            //'Object', 'Function', 'Array' 
            //'String', 'Number', 'Date', 'Boolean'
        Validate_AddGlobalClasses(undefined,7,(any_arr){any_str("Object"), any_str("Function"), any_str("Array"), any_str("String"), any_str("Number"), any_str("Date"), any_str("Boolean")});
           // 
//note: 'Map' and 'NameValuePair' are declared at GlobalScopeX.interface.md
//b) create special types
//b.1) arguments:any*
//"arguments:any*" - arguments, type: pointer to any 
//'arguments' is a local var to all functions, representing a pseudo-array witj all the arguments.
//'arguments' has only one method: `arguments.toArray()`
//we declare here the type:"pointer to any" - "any*"
        //var argumentsType = globalScope.addMember('any*') //  any pointer, type for "arguments"
        var argumentsType = METHOD(addMember_,Validate_globalScope)(Validate_globalScope,1,(any_arr){any_str("any*")}); //  any pointer, type for "arguments"
        //opt.value = undefined
        PROP(value_,opt) = undefined;
        //opt.type = globalPrototype('Function')
        PROP(type_,opt) = Validate_globalPrototype(undefined,1,(any_arr){any_str("Function")});
        //opt.returnType=globalPrototype('Array')
        PROP(returnType_,opt) = Validate_globalPrototype(undefined,1,(any_arr){any_str("Array")});
        //argumentsType.addMember('toArray',opt) 
        METHOD(addMember_,argumentsType)(argumentsType,2,(any_arr){any_str("toArray"), opt});
//b.2) Lite-C: the Lexer replaces string interpolation with calls to `__concatAny`
        //opt.returnType=globalPrototype('String')
        PROP(returnType_,opt) = Validate_globalPrototype(undefined,1,(any_arr){any_str("String")});
        //globalScope.addMember '_concatAny',opt //used for string interpolation
        METHOD(addMember_,Validate_globalScope)(Validate_globalScope,2,(any_arr){any_str("_concatAny"), opt}); //used for string interpolation
       // 
        //opt.returnType=undefined
        PROP(returnType_,opt) = undefined;
        //globalScope.addMember 'parseFloat',opt //used for string interpolation
        METHOD(addMember_,Validate_globalScope)(Validate_globalScope,2,(any_arr){any_str("parseFloat"), opt}); //used for string interpolation
        //globalScope.addMember 'parseInt',opt //used for string interpolation
        METHOD(addMember_,Validate_globalScope)(Validate_globalScope,2,(any_arr){any_str("parseInt"), opt}); //used for string interpolation
        ////var core = globalScope.addMember('LiteCore') //core supports
        ////core.isNamespace = true
        ////opt.returnType='Number'
        ////core.addMember 'getSymbol',opt //to get a symbol (int) from a symbol name (string)
//b.3) "any" default type for vars
        //globalScope.addMember 'any' // used for "map string to any" - Dictionaries
        METHOD(addMember_,Validate_globalScope)(Validate_globalScope,1,(any_arr){any_str("any")}); // used for "map string to any" - Dictionaries
//Process the global scope declarations interface file: GlobalScopeJS.interface.md
        //var globalInterfaceFile = '#{process.cwd()}/lib/GlobalScope#{project.options.target.toUpperCase()}'
        var globalInterfaceFile = _concatAny(3,process_cwd(undefined,0,NULL), any_str("/lib/GlobalScope"), __call(toUpperCase_,PROP(target_,PROP(options_,Validate_project)),0,NULL));
        //logger.msg "Declare global scope using ", globalInterfaceFile
        logger_msg(undefined,2,(any_arr){any_str("Declare global scope using "), globalInterfaceFile});
        //var globalInterfaceModule = project.compileFile(globalInterfaceFile)
        var globalInterfaceModule = METHOD(compileFile_,Validate_project)(Validate_project,1,(any_arr){globalInterfaceFile});
//For the globalInterfaceModule, which have parsed GlobalScopeJS.interface.md file
//we call "declare" on all nodes, create the Names.Declaration
        //var methodSymbol = LiteCore.getSymbol('declare')
        var methodSymbol = LiteCore_getSymbol(undefined,1,(any_arr){any_str("declare")});
//calll "declare" on each item of the GlobalScope interface file, to create the NameDeclarations
        //globalInterfaceModule.callOnSubTree methodSymbol
        METHOD(callOnSubTree_,globalInterfaceModule)(globalInterfaceModule,1,(any_arr){methodSymbol});
//move all exported from the interface file, to project.rootModule global scope
        //for each nameDecl in map globalInterfaceModule.exports.members
        any _list40=PROP(members_,PROP(exports_,globalInterfaceModule));
        {NameValuePair_ptr __nvp=NULL; //name:value pair
        int64_t __len=MAPSIZE(_list40); //how many pairs
        var nameDecl=undefined; //value
        for(int64_t __inx=0 ; __inx < __len ; __inx++ ){
            __nvp = MAPITEM( __inx,_list40);
            nameDecl= __nvp->value;
        
            //project.rootModule.addToSpecificScope globalScope, nameDecl
            __call(addToSpecificScope_,PROP(rootModule_,Validate_project),2,(any_arr){Validate_globalScope, nameDecl});
        }};// end for each in map PROP(members_,PROP(exports_,globalInterfaceModule))
//Initial NameAffinity, err|xxxErr => type:Error
        //if tryGetGlobalPrototype('Error') into var errProto:Names.Declaration 
        var errProto=undefined;
        if (_anyToBool((errProto=Validate_tryGetGlobalPrototype(undefined,1,(any_arr){any_str("Error")}))))  {
            //nameAffinity.members.set 'Err',errProto.parent // err|xxxErr => type:Error
            __call(set_,PROP(members_,Validate_nameAffinity),2,(any_arr){any_str("Err"), PROP(parent_,errProto)}); // err|xxxErr => type:Error
        };
    return undefined;
    }
///*
//### export function populateGlobalScope(aProject)
//This method prepares a default global scope for a project
//global scope starts populated with most common js built-in objects
//Populate the global scope 
        //globalScope.addMember 'setTimeout'
        //globalScope.addMember 'clearTimeout'
        //globalScope.addMember 'setInterval'
        //globalScope.addMember 'clearInterval'
        //globalScope.addMember 'undefined',{value:undefined}
        //globalScope.addMember 'null',{value:null}
        //globalScope.addMember 'true',{value:true}
        //globalScope.addMember 'false',{value:false}
        //globalScope.addMember 'NaN',{value:NaN}
        //var objProto = addBuiltInClass('Object') #first: Object. Order is important
        //objProto.addMember('__proto__')
        //#ifndef PROD_C
        //objProto.ownMember("constructor").addMember('name')
        //#endif
        //var functionProto = addBuiltInClass('Function') #second: Function. Order is important
        //functionProto.addMember('initInstance',{type:functionProto}) #unified way to call Class Initialization function
        //#Function is declared here so ':function' type properties (methods) of "Array" or "String" 
        //#can be properly typified
        //var stringProto = addBuiltInClass('String')
        //var arrayProto = addBuiltInClass('Array')
        //#state that String.split returns string array
        //stringProto.ownMember("split").setMember '**return type**', arrayProto
        //#state that Obj.toString returns string:
        //objProto.ownMember("tostring").setMember '**return type**', stringProto
        //// int equals 'number'
        //globalScope.addMember 'int'
        //addBuiltInObject 'Boolean'
        //addBuiltInObject 'Number' 
        //addBuiltInObject 'Date' 
        //addBuiltInObject 'RegExp'
        //addBuiltInObject 'JSON'
       // 
        //var ErrProto = addBuiltInClass('Error')
        //ErrProto.addMember 'stack'
        //ErrProto.addMember 'code'
        //addBuiltInObject 'Math'
        //// "arguments" is a local var to any function, with only a method: arguments.toArray()
        //var argumentsType = globalScope.addMember('any*') //  any pointer, type for "arguments"
        //argumentsType.addMember('length') // 
        //argumentsType.addMember('toArray',{type:functionProto, returnType:arrayProto}) // 
        //globalScope.addMember("liteC_getSymbol",{type:functionProto}) 
        //globalScope.addMember("liteC_tryGetMethod",{type:functionProto})
        //globalScope.addMember("liteC_getMethod",{type:functionProto})
        //#ifdef PROD_C
        //var anyType = globalScope.addMember('any') // all vars and props are type:any - see LiteC core, any.h
        //var anyTypeProto = anyType.addMember('prototype')
        //anyTypeProto.addMember 'constructor',{type:"any"} //hack, constructor = typeID
        //anyTypeProto.addMember 'length',{type:"int"} //hack convert property 'length' to a fn call length(this)
        //var MapType = globalScope.addMember('Map',{type:functionProto}) // Map is like a js-ES6 Map. Should be used to have dyn props
        //var MapProto = MapType.addMember('prototype')
        //MapProto.addMember 'get',{type:functionProto, returnType:anyTypeProto}
        //MapProto.addMember 'set',{type:functionProto, returnType:anyTypeProto}
        //MapProto.addMember 'has',{type:functionProto, returnType:anyTypeProto}
        //MapProto.addMember 'keys',{type:functionProto, returnType:arrayProto}
        //globalScope.addMember '_concatAny',{type:functionProto} //used for string interpolation
        ////console is a namespace in Lite-C
        //addBuiltInObject 'console'
        //globalScope.findOwnMember('console').isNamespace = true
        //#endif
//if we're not compiling for the browser, add 'process'
        //if not project.options.browser
            //var proc = globalScope.addMember('process') // node "process" global var emulation
            //proc.isNamespace = true
            //proc.addMember('exit',{type:functionProto}) 
            //proc.addMember('cwd',{type:functionProto})  
            //proc.addMember('argv',{type:arrayProto})  
            //if project.options.target is 'js'
                //#node.js
                //globalScope.addMember 'global',{type:globalScope}
                //globalScope.addMember 'require'
            //end if
        //end if
//*/
//----------
//----------
//## Module Helper Functions
//### Helper function tryGetGlobalPrototype(name) 
    any Validate_tryGetGlobalPrototype(DEFAULT_ARGUMENTS){
      // define named params
      var name= argc? arguments[0] : undefined;
      //---------
//gets a var from global scope
     // 
      //if globalScope.findOwnMember(name) into var nameDecl
      var nameDecl=undefined;
      if (_anyToBool((nameDecl=METHOD(findOwnMember_,Validate_globalScope)(Validate_globalScope,1,(any_arr){name}))))  {
          //return nameDecl.members.get("prototype")
          return __call(get_,PROP(members_,nameDecl),1,(any_arr){any_str("prototype")});
      };
    return undefined;
    }
//### Helper function globalPrototype(name) 
    any Validate_globalPrototype(DEFAULT_ARGUMENTS){
      // define named params
      var name= argc? arguments[0] : undefined;
      //---------
//gets a var from global scope
      //if name instanceof Names.Declaration, return name #already converted type
      if (_instanceof(name,Names_Declaration)) {return name;};
      //if not globalScope.findOwnMember(name) into var nameDecl
      var nameDecl=undefined;
      if (!(_anyToBool((nameDecl=METHOD(findOwnMember_,Validate_globalScope)(Validate_globalScope,1,(any_arr){name})))))  {
        //fail with "no '#{name}' in global scope"
        throw(new(Error,1,(any_arr){_concatAny(3,any_str("no '"), name, any_str("' in global scope"))}));;
      };
      //if no nameDecl.findOwnMember("prototype") into var protoNameDecl
      var protoNameDecl=undefined;
      if (!(_anyToBool((protoNameDecl=METHOD(findOwnMember_,nameDecl)(nameDecl,1,(any_arr){any_str("prototype")})))))  {
        //fail with "global scope type '#{name}' must have a 'prototype' property"
        throw(new(Error,1,(any_arr){_concatAny(3,any_str("global scope type '"), name, any_str("' must have a 'prototype' property"))}));;
      };
      //return protoNameDecl
      return protoNameDecl;
    return undefined;
    }
//### helper function addBuiltInClass(name,node) returns Names.Declaration
    any Validate_addBuiltInClass(DEFAULT_ARGUMENTS){
      // define named params
      var name, node;
      name=node=undefined;
      switch(argc){
        case 2:node=arguments[1];
        case 1:name=arguments[0];
      }
      //---------
//Add a built-in class to global scope, return class prototype
      //var nameDecl = new Names.Declaration( name,{isBuiltIn:true},node )
      var nameDecl = new(Names_Declaration,3,(any_arr){name, new(Map,1,(any_arr){
      _newPair("isBuiltIn",true)
      })
, node});
      //globalScope.addMember nameDecl
      METHOD(addMember_,Validate_globalScope)(Validate_globalScope,1,(any_arr){nameDecl});
      //nameDecl.getMembersFromObjProperties Environment.getGlobalObject(name)
      METHOD(getMembersFromObjProperties_,nameDecl)(nameDecl,1,(any_arr){Environment_getGlobalObject(undefined,1,(any_arr){name})});
      //if no nameDecl.findOwnMember("prototype") into var classProto:Names.Declaration
      var classProto=undefined;
      if (!(_anyToBool((classProto=METHOD(findOwnMember_,nameDecl)(nameDecl,1,(any_arr){any_str("prototype")})))))  {
          //throw("addBuiltInClass '#{name}, expected to have a prototype")
          throw(_concatAny(3,any_str("addBuiltInClass '"), name, any_str(", expected to have a prototype")));
      };
      //nameDecl.setMember '**proto**', globalPrototype('Function')
      METHOD(setMember_,nameDecl)(nameDecl,2,(any_arr){any_str("**proto**"), Validate_globalPrototype(undefined,1,(any_arr){any_str("Function")})});
      //// commented v0.8: classes can not be used as functions. 
      //// nameDecl.setMember '**return type**', classProto
      //return classProto
      return classProto;
    return undefined;
    }
//### helper function addBuiltInObject(name,node) returns Names.Declaration
    any Validate_addBuiltInObject(DEFAULT_ARGUMENTS){
      // define named params
      var name, node;
      name=node=undefined;
      switch(argc){
        case 2:node=arguments[1];
        case 1:name=arguments[0];
      }
      //---------
//Add a built-in object to global scope, return object
      //var nameDecl = new Names.Declaration(name, {isBuiltIn:true},node)
      var nameDecl = new(Names_Declaration,3,(any_arr){name, new(Map,1,(any_arr){
      _newPair("isBuiltIn",true)
      })
, node});
      //globalScope.addMember nameDecl
      METHOD(addMember_,Validate_globalScope)(Validate_globalScope,1,(any_arr){nameDecl});
      //nameDecl.getMembersFromObjProperties Environment.getGlobalObject(name)
      METHOD(getMembersFromObjProperties_,nameDecl)(nameDecl,1,(any_arr){Environment_getGlobalObject(undefined,1,(any_arr){name})});
      //if nameDecl.findOwnMember("prototype") 
      if (_anyToBool(METHOD(findOwnMember_,nameDecl)(nameDecl,1,(any_arr){any_str("prototype")})))  {
          //throw("addBuiltObject '#{name}, expected *Object* to have not a prototype")
          throw(_concatAny(3,any_str("addBuiltObject '"), name, any_str(", expected *Object* to have not a prototype")));
      };
      //return nameDecl
      return nameDecl;
    return undefined;
    }
//---------------------------------------
//----------------------------------------
//----------------------------------------
//### Append to namespace Names
    
      //class ConvertResult
      

//--------------
      // Names_ConvertResult
      any Names_ConvertResult; //Class Names_ConvertResult
      //auto Names_ConvertResult__init
      void Names_ConvertResult__init(any this, len_t argc, any* arguments){
        PROP(converted_,this)=any_number(0);
        PROP(failures_,this)=any_number(0);
      };
        //properties
          //converted:number=0
          //failures:number=0
        ;
      
//##Additions to Names.Declaration. Helper methods to do validation
//### Append to class Names.Declaration
    
//#### Helper method findMember(name) returns Names.Declaration
     any Names_Declaration_findMember(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Names_Declaration));
        //---------
        // define named params
        var name= argc? arguments[0] : undefined;
        //---------
//this method looks for a name in Names.Declaration members,
//it also follows the **proto** chain (same mechanism as js __proto__ chain)
        //var actual = this
        var actual = this;
        //var count=0
        var count = any_number(0);
        //do while actual instance of Names.Declaration 
        while(_instanceof(actual,Names_Declaration)){
            //if actual.findOwnMember(name) into var result
            var result=undefined;
            if (_anyToBool((result=METHOD(findOwnMember_,actual)(actual,1,(any_arr){name}))))  {
               //return result
               return result;
            };
//We use a member named '**proto**' on NameDeclarations, mapping run-time proto chain.
//We follow the chain to validate property names.
            //var nextInChain = actual.findOwnMember('**proto**')
            var nextInChain = METHOD(findOwnMember_,actual)(actual,1,(any_arr){any_str("**proto**")});
//As last option in the chain, we always use 'Object.prototype'
            //if no nextInChain and actual isnt globalPrototype('Object')
            if (!_anyToBool(nextInChain) && !__is(actual,Validate_globalPrototype(undefined,1,(any_arr){any_str("Object")})))  {
              //nextInChain = globalPrototype('Object')
              nextInChain = Validate_globalPrototype(undefined,1,(any_arr){any_str("Object")});
            };
            //actual = nextInChain
            actual = nextInChain;
            //if count++ > 50 #assume circular
            if (count.value.number++ > 50)  {// #assume circular
                //.warn "circular type reference"
                METHOD(warn_,this)(this,1,(any_arr){any_str("circular type reference")});
                //return
                return undefined;
            };
        };// end loop
        
     return undefined;
     }
       // 
        //loop
//#### Helper method isInstanceof(name) returns boolean
     any Names_Declaration_isInstanceof(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Names_Declaration));
        //---------
        // define named params
        var name= argc? arguments[0] : undefined;
        //---------
//this method looks for a name in Names.Declaration members **proto**->prototpye->parent
//it also follows the **proto** chain (same mechanism as js __proto__ chain)
        //var actual = this
        var actual = this;
        //var count=0
        var count = any_number(0);
        //do while actual instance of Names.Declaration 
        while(_instanceof(actual,Names_Declaration)){
            //if actual.name is 'prototype' and actual.parent.name is name
            if (__is(PROP(name_,actual),any_str("prototype")) && __is(PROP(name_,PROP(parent_,actual)),name))  {
                //return true
                return true;
            };
//We use a member named '**proto**' on NameDeclarations, mapping run-time proto chain.
//We follow the chain to validate property names.
            //var nextInChain = actual.findOwnMember('**proto**')
            var nextInChain = METHOD(findOwnMember_,actual)(actual,1,(any_arr){any_str("**proto**")});
//As last option in the chain, we always use 'Object.prototype'
            //if no nextInChain and actual isnt globalPrototype('Object')
            if (!_anyToBool(nextInChain) && !__is(actual,Validate_globalPrototype(undefined,1,(any_arr){any_str("Object")})))  {
                //nextInChain = globalPrototype('Object')
                nextInChain = Validate_globalPrototype(undefined,1,(any_arr){any_str("Object")});
            };
            //actual = nextInChain
            actual = nextInChain;
            //if count++ > 50 #assume circular
            if (count.value.number++ > 50)  {// #assume circular
                //.warn "circular type reference"
                METHOD(warn_,this)(this,1,(any_arr){any_str("circular type reference")});
                //return
                return undefined;
            };
        };// end loop
        
     return undefined;
     }
       // 
        //loop
//#### Helper Method getMembersFromObjProperties(obj) #Recursive
     any Names_Declaration_getMembersFromObjProperties(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Names_Declaration));
        //---------
        // define named params
        var obj= argc? arguments[0] : undefined;
        //---------
//Recursively converts a obj properties in NameDeclarations.
//it's used when a pure.js module is imported by 'require'
//to convert required 'exports' to LiteScript compiler usable NameDeclarations
//Also to load the global scope with built-in objects
        ////ifdef PROD_C
        //return
        return undefined;
     return undefined;
     }
        ////else
        ////var newMember:Names.Declaration
////
        ////if obj instanceof Object or obj is Object.prototype
////
            ////for each prop in Object.getOwnPropertyNames(obj) #even not enumerables
                ////where prop not in ['__proto__','arguments','caller'] #exclude __proto__
////
                    ////var type =  Grammar.autoCapitalizeCoreClasses(typeof obj[prop])
                    ////type = tryGetGlobalPrototype(type) #core classes: Function, Object, String
                    ////if type is this, type = undefined #avoid circular references
////
                    ////newMember = .addMember(prop,{type:type})
////
////on 'prototype' member or
////if member is a Function-class - dive into
////
                    ////declare valid Object.hasOwnProperty.call
                    ////if prop isnt 'constructor'
                        ////if  prop is 'prototype'
                            ////or (typeof obj[prop] is 'function'
                                ////and obj[prop].hasOwnProperty('prototype')
                                ////and not .isInParents(prop)
                               ////)
                            ////or (typeof obj[prop] is 'object'
                                ////and not .isInParents(prop)
                               ////)
                              ////newMember.getMembersFromObjProperties(obj[prop]) #recursive
                              ////if prop is 'super_' # used in node's core modules: http, EventEmitter, etc.
                                  ////if newMember.findOwnMember('prototype') into var superProtopNameDecl
                                    ////var protopNameDecl = .findOwnMember('prototype') or .addMember('prototype')
                                    ////protopNameDecl.setMember '**proto**', superProtopNameDecl #put super's proto in **proto** of prototype
////
        ////end if
                       // 
//#### Helper Method isInParents(name)
     any Names_Declaration_isInParents(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Names_Declaration));
        //---------
        // define named params
        var name= argc? arguments[0] : undefined;
        //---------
//return true if a property name is in the parent chain.
//Used to avoid recursing circular properties
       // 
        //var nameDecl = this.parent
        var nameDecl = PROP(parent_,this);
        //while nameDecl
        while(_anyToBool(nameDecl)){
          //if nameDecl.findOwnMember(name), return true
          if (_anyToBool(METHOD(findOwnMember_,nameDecl)(nameDecl,1,(any_arr){name}))) {return true;};
          //nameDecl = nameDecl.parent
          nameDecl = PROP(parent_,nameDecl);
        };// end loop
        
     return undefined;
     }
//#### Helper method processConvertTypes(options) returns Names.ConvertResult
     any Names_Declaration_processConvertTypes(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Names_Declaration));
        //---------
        // define named params
        var options= argc? arguments[0] : undefined;
        //---------
//convert possible types stored in Names.Declaration, 
//from string/varRef to other NameDeclarations in the scope
        //var result = new Names.ConvertResult
        var result = new(Names_ConvertResult,0,NULL);
        //.convertType '**proto**',result,options  #try convert main type
        METHOD(convertType_,this)(this,3,(any_arr){any_str("**proto**"), result, options});// #try convert main type
        //.convertType '**return type**',result,options  #a Function can have **return type**
        METHOD(convertType_,this)(this,3,(any_arr){any_str("**return type**"), result, options});// #a Function can have **return type**
        //.convertType '**item type**',result,options  #an Array can have **item type** e.g.: 'var list: string array'
        METHOD(convertType_,this)(this,3,(any_arr){any_str("**item type**"), result, options});// #an Array can have **item type** e.g.: 'var list: string array'
        //return result
        return result;
     return undefined;
     }
//#### Helper method convertType(internalName, result: Names.ConvertResult, options: Names.NameDeclOptions) 
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
//convert type from string to NameDeclarations in the scope.
//returns 'true' if converted, 'false' if it has to be tried later
        //if no .findOwnMember(internalName) into var typeRef
        var typeRef=undefined;
        if (!(_anyToBool((typeRef=METHOD(findOwnMember_,this)(this,1,(any_arr){internalName})))))  {
            //#nothing to process
            //return  
            return undefined;
        };
        //if typeRef instance of Names.Declaration
        if (_instanceof(typeRef,Names_Declaration))  {
            //#already converted, nothing to do
            //return 
            return undefined;
        };
        //var converted:Names.Declaration
        var converted = undefined;
        //# if the typeRef is a varRef, get reference 
        //if typeRef instanceof Grammar.VariableRef
        if (_instanceof(typeRef,Grammar_VariableRef))  {
            //declare typeRef:Grammar.VariableRef
            
            //converted = typeRef.tryGetReference()
            converted = METHOD(tryGetReference_,typeRef)(typeRef,0,NULL);
        }
        //else if typeof typeRef is 'string' #built-in class or local var
        
        else if (__is(_typeof(typeRef),any_str("string")))  {// #built-in class or local var
            //if no .nodeDeclared #converting typeRef for a var not declared in code
            if (!_anyToBool(PROP(nodeDeclared_,this)))  {// #converting typeRef for a var not declared in code
              //converted = globalPrototype(typeRef)
              converted = Validate_globalPrototype(undefined,1,(any_arr){typeRef});
            }
            //else
            
            else {
              //converted = .nodeDeclared.findInScope(typeRef)
              converted = __call(findInScope_,PROP(nodeDeclared_,this),1,(any_arr){typeRef});
            };
            //end if
            
        }
        //else
        
        else {
            //declare valid typeRef.constructor.name
            
            //.sayErr "INTERNAL ERROR: convertType UNRECOGNIZED type of:'#{typeof typeRef}' on #{internalName}: '#{typeRef}' [#{typeRef.constructor.name}]"
            METHOD(sayErr_,this)(this,1,(any_arr){_concatAny(9,any_str("INTERNAL ERROR: convertType UNRECOGNIZED type of:'"), _typeof(typeRef), any_str("' on "), internalName, any_str(": '"), typeRef, any_str("' ["), PROP(name_,any_class(typeRef.class)), any_str("]"))});
            //return
            return undefined;
        };
        //end if #check instance of "typeRef"
        
        //if converted
        if (_anyToBool(converted))  {
            //#move to prototype if referenced is a class
            //if converted.findOwnMember("prototype") into var prototypeNameDecl
            var prototypeNameDecl=undefined;
            if (_anyToBool((prototypeNameDecl=METHOD(findOwnMember_,converted)(converted,1,(any_arr){any_str("prototype")}))))  {
                //converted = prototypeNameDecl
                converted = prototypeNameDecl;
            };
            //#store converted
            //.setMember(internalName,converted)
            METHOD(setMember_,this)(this,2,(any_arr){internalName, converted});
            //result.converted++
            PROP(converted_,result).value.number++;
        }
        //else
        
        else {
            //result.failures++
            PROP(failures_,result).value.number++;
            //if options and options.informError, .sayErr "Undeclared type: '#{typeRef.toString()}'"
            if (_anyToBool(options) && _anyToBool(PROP(informError_,options))) {METHOD(sayErr_,this)(this,1,(any_arr){_concatAny(3,any_str("Undeclared type: '"), METHOD(toString_,typeRef)(typeRef,0,NULL), any_str("'"))});};
        };
        //end if
        
        //return 
        return undefined;
     return undefined;
     }
//#### helper method assignTypeFromValue(value) 
     any Names_Declaration_assignTypeFromValue(DEFAULT_ARGUMENTS){
      assert(_instanceof(this,Names_Declaration));
      //---------
      // define named params
      var value= argc? arguments[0] : undefined;
      //---------
//if we can determine assigned value type, set var type
      //declare valid value.getResultType
      
      //var valueNameDecl = value.getResultType()
      var valueNameDecl = METHOD(getResultType_,value)(value,0,NULL);
//now set var type (unless is "null" or "undefined", because they destroy type info)
      //if valueNameDecl instance of Names.Declaration 
      if (_instanceof(valueNameDecl,Names_Declaration) && !(__in(PROP(name_,valueNameDecl),2,(any_arr){any_str("undefined"), any_str("null")})))  {
        //and valueNameDecl.name not in ["undefined","null"]
            //var theType
            var theType = undefined;
            //if valueNameDecl.name is 'prototype' # getResultType returns a class prototype
            if (__is(PROP(name_,valueNameDecl),any_str("prototype")))  {// # getResultType returns a class prototype
                //// use the class as type
                //theType = valueNameDecl
                theType = valueNameDecl;
            }
            //else 
            
            else {
                ////we assume valueNameDecl is a simple var, then we try to get **proto**
                //theType = valueNameDecl.findOwnMember('**proto**') or valueNameDecl
                theType = (_anyToBool(__or1=METHOD(findOwnMember_,valueNameDecl)(valueNameDecl,1,(any_arr){any_str("**proto**")}))? __or1 : valueNameDecl);
            };
            //end if
            
            //// assign type: now both nameDecls points to same type
            //.setMember '**proto**', theType 
            METHOD(setMember_,this)(this,2,(any_arr){any_str("**proto**"), theType});
      };
     return undefined;
     }
//#### helper method assignTypebyNameAffinity() 
     any Names_Declaration_assignTypebyNameAffinity(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Names_Declaration));
        //---------
//Auto-assign type by name affinity. 
//If no type specified, check project.nameAffinity
       // 
        //if .nodeDeclared and not String.isCapitalized(.name) and .name isnt 'prototype'
        if (_anyToBool(PROP(nodeDeclared_,this)) && !(_anyToBool(String_isCapitalized(undefined,1,(any_arr){PROP(name_,this)}))) && !__is(PROP(name_,this),any_str("prototype")))  {
            //if not .findOwnMember('**proto**')
            if (!(_anyToBool(METHOD(findOwnMember_,this)(this,1,(any_arr){any_str("**proto**")}))))  {
                //var possibleClassRef:Names.Declaration
                var possibleClassRef = undefined;
                //# possibleClassRef is a Names.Declaration whose .nodeDeclared is a ClassDeclaration
                //#should look as className. Also when searching with "endsWith", 
                //# nameAffinity declarations are stored capitalized
                //var asClassName = .name.capitalized()
                var asClassName = __call(capitalized_,PROP(name_,this),0,NULL);
                //# look in name affinity map
                //if no nameAffinity.members.get(.name) into possibleClassRef
                if (!(_anyToBool((possibleClassRef=__call(get_,PROP(members_,Validate_nameAffinity),1,(any_arr){PROP(name_,this)})))))  {
                    //# make first letter uppercase, e.g.: convert 'lexer' to 'Lexer'
                    //# try with name, 1st letter capitalized
                    //possibleClassRef = nameAffinity.members.get(asClassName) 
                    possibleClassRef = __call(get_,PROP(members_,Validate_nameAffinity),1,(any_arr){asClassName});
                };
                //end if
                
               // 
                //# check 'ends with' if name is at least 6 chars in length
                //if not possibleClassRef and .name.length>=6
                if (!(_anyToBool(possibleClassRef)) && _length(PROP(name_,this)) >= 6)  {
                    //for each affinityName,classRef in map nameAffinity.members
                    any _list41=PROP(members_,Validate_nameAffinity);
                    {NameValuePair_ptr __nvp=NULL; //name:value pair
                    int64_t __len=MAPSIZE(_list41); //how many pairs
                    var affinityName=undefined; //key
                    var classRef=undefined; //value
                    for(int64_t __inx=0 ; __inx < __len ; __inx++ ){
                        __nvp = MAPITEM( __inx,_list41);
                        affinityName= __nvp->name;
                        classRef= __nvp->value;
                    
                        //if asClassName.endsWith(affinityName)
                        if (_anyToBool(METHOD(endsWith_,asClassName)(asClassName,1,(any_arr){affinityName})))  {
                            //possibleClassRef = classRef
                            possibleClassRef = classRef;
                            //break
                            break;
                        };
                    }};// end for each in map PROP(members_,Validate_nameAffinity)
                    
                };
                //#if there is a candidate class, check of it has a defined prototype
                //if possibleClassRef and possibleClassRef.findOwnMember("prototype") into var prototypeNameDecl
                var prototypeNameDecl=undefined;
                if (_anyToBool(possibleClassRef) && _anyToBool((prototypeNameDecl=METHOD(findOwnMember_,possibleClassRef)(possibleClassRef,1,(any_arr){any_str("prototype")}))))  {
                      //.setMember '**proto**', prototypeNameDecl
                      METHOD(setMember_,this)(this,2,(any_arr){any_str("**proto**"), prototypeNameDecl});
                      //return true
                      return true;
                };
            };
        };
     return undefined;
     }
//--------------------------------
//## Helper methods added to AST Tree
//### Append to class ASTBase
    
//#### properties
        //scope: Names.Declaration //for nodes with scope
     ;
//#### helper method declareName(name, options) 
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
//declareName creates a new Names.Declaration, *referecing source as nodeDeclared (AST node)*
        //return new Names.Declaration(name, options, this)
        return new(Names_Declaration,3,(any_arr){name, options, this});
     return undefined;
     }
//#### method addMemberTo(nameDecl, memberName, options)  returns Names.Declaration
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
//a Helper method ASTBase.*addMemberTo*
//Adds a member to a NameDecl, referencing this node as nodeDeclared
       // 
        //return nameDecl.addMember(memberName, options, this)
        return METHOD(addMember_,nameDecl)(nameDecl,3,(any_arr){memberName, options, this});
     return undefined;
     }
//#### Helper method tryGetMember(nameDecl, name:string, options:Names.NameDeclOptions)
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
//this method looks for a specific member, optionally declare as forward
//or inform error. We need this AST node, to correctly report error.
       // 
        //default options = new Names.NameDeclOptions
        _default(&options,new(Names_NameDeclOptions,0,NULL));
 // 
        //var found = nameDecl.findMember(name)
        var found = METHOD(findMember_,nameDecl)(nameDecl,1,(any_arr){name});
       // 
        //if found and name.slice(0,2) isnt '**'
        if (_anyToBool(found) && !__is(METHOD(slice_,name)(name,2,(any_arr){any_number(0), any_number(2)}),any_str("**")))  {
          //found.caseMismatch name,this
          METHOD(caseMismatch_,found)(found,2,(any_arr){name, this});
        }
       // 
        //else #not found
        
        else {
          //if options.informError 
          if (_anyToBool(PROP(informError_,options)))  {
                //logger.warning "#{.positionText()}. No member named '#{name}' on #{nameDecl.info()}"
                logger_warning(undefined,1,(any_arr){_concatAny(5,METHOD(positionText_,this)(this,0,NULL), any_str(". No member named '"), name, any_str("' on "), METHOD(info_,nameDecl)(nameDecl,0,NULL))});
          };
         // 
          //if options.isForward, found = .addMemberTo(nameDecl,name,options)
          if (_anyToBool(PROP(isForward_,options))) {found = METHOD(addMemberTo_,this)(this,3,(any_arr){nameDecl, name, options});};
        };
        //return found
        return found;
     return undefined;
     }
//#### helper method getScopeNode() 
     any ASTBase_getScopeNode(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------
//**getScopeNode** method return the parent 'scoped' node in the hierarchy.
//It looks up until found a node with .scope
       // 
//Start at this node
        //var node = this
        var node = this;
        //while node
        while(_anyToBool(node)){
          //if node.scope
          if (_anyToBool(PROP(scope_,node)))  {
              //return node # found a node with scope
              return node;// # found a node with scope
          };
          //node = node.parent # move up
          node = PROP(parent_,node);// # move up
        };// end loop
        //#loop
        //return null
        return null;
     return undefined;
     }
//#### method findInScope(name) returns Names.Declaration
     any ASTBase_findInScope(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------
        // define named params
        var name= argc? arguments[0] : undefined;
        //---------
//this method looks for the original place 
//where a name was defined (function,method,var) 
//Returns the Identifier node from the original scope
//It's used to validate variable references to be previously declared names
//Start at this node
        //var node = this
        var node = this;
//Look for the declaration in this scope
        //while node
        while(_anyToBool(node)){
          //declare valid node.scope:Names.Declaration
          
          //if node.scope and node.scope.findOwnMember(name) into var found
          var found=undefined;
          if (_anyToBool(PROP(scope_,node)) && _anyToBool((found=__call(findOwnMember_,PROP(scope_,node),1,(any_arr){name}))))  {
              //return found
              return found;
          };
//move up in scopes
          //node = node.parent
          node = PROP(parent_,node);
        };// end loop
        
     return undefined;
     }
        //#loop
//#### method tryGetFromScope(name, options:Names.NameDeclOptions) returns Names.Declaration
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
//a Helper method: *ASTBase.tryGetFromScope(name)*, this method looks for the original declaration
//in the scope. if the declaration is not found, an error is emmited and a -pseudo- var is created 
//in the scope in order to continue compilation
//Check if the name is declared. Retrieve the original declaration
//if it's already a Names.Declaration, no need to search
        //if name instanceof Names.Declaration, return name  
        if (_instanceof(name,Names_Declaration)) {return name;};
//Search the scope
        //if .findInScope(name) into var found 
        var found=undefined;
        if (_anyToBool((found=METHOD(findInScope_,this)(this,1,(any_arr){name}))))  {
//Declaration found, we check the upper/lower case to be consistent
//If the found item has a different case than the name we're looking for, emit error 
            //if found.caseMismatch(name, this)
            if (_anyToBool(METHOD(caseMismatch_,found)(found,2,(any_arr){name, this})))  {
                //return found
                return found;
            };
            //end if
            
        }
//if it is not found,check options: a) inform error. b) declare foward.
        //else
        
        else {
            //if options and options.informError
            if (_anyToBool(options) && _anyToBool(PROP(informError_,options)))  {
                //.sayErr "UNDECLARED NAME: '#{name}'"
                METHOD(sayErr_,this)(this,1,(any_arr){_concatAny(3,any_str("UNDECLARED NAME: '"), name, any_str("'"))});
            };
            //if options and options.isForward
            if (_anyToBool(options) && _anyToBool(PROP(isForward_,options)))  {
                //found = .addToScope(name,options)  
                found = METHOD(addToScope_,this)(this,2,(any_arr){name, options});
                //if options.isDummy and String.isCapitalized(name) #let's assume is a class
                if (_anyToBool(PROP(isDummy_,options)) && _anyToBool(String_isCapitalized(undefined,1,(any_arr){name})))  {// #let's assume is a class
                    //.addMemberTo(found,'prototype',options)
                    METHOD(addMemberTo_,this)(this,3,(any_arr){found, any_str("prototype"), options});
                };
            };
        };
        //#end if - check declared variables 
        //return found
        return found;
     return undefined;
     }
//#### method addToScope(item, options:Names.NameDeclOptions) returns Names.Declaration 
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
//a Helper method ASTBase.*addToScope*
//Search for parent Scope, adds passed name to scope.members
//Reports duplicated.
//return: Names.Declaration
        //if no item, return # do nothing on undefined params
        if (!_anyToBool(item)) {return undefined;};
        //var scope:Names.Declaration = .getScopeNode().scope
        var scope = PROP(scope_,METHOD(getScopeNode_,this)(this,0,NULL));
        //return .addToSpecificScope(scope, item, options)
        return METHOD(addToSpecificScope_,this)(this,3,(any_arr){scope, item, options});
     return undefined;
     }
//First search it to report duplicates, if found in the scope.
//If the found item has a different case than the name we're adding, emit error & return
//#### method addToSpecificScope(scope:Names.Declaration, item, options:Names.NameDeclOptions) returns Names.Declaration 
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
        //declare valid item.name
        
        //var name = type of item is 'string'? item : item.name
        var name = __is(_typeof(item),any_str("string")) ? item : PROP(name_,item);
        //logger.debug "addToScope: '#{name}' to '#{scope.name}'" #[#{.constructor.name}] name:
        logger_debug(undefined,1,(any_arr){_concatAny(5,any_str("addToScope: '"), name, any_str("' to '"), PROP(name_,scope), any_str("'"))});// #[#{.constructor.name}] name:
        //if .findInScope(name) into var found 
        var found=undefined;
        if (_anyToBool((found=METHOD(findInScope_,this)(this,1,(any_arr){name}))))  {
            //if found.caseMismatch(name, this)
            if (_anyToBool(METHOD(caseMismatch_,found)(found,2,(any_arr){name, this})))  {
              //#case mismatch informed
              //do nothing
              //do nothing
              ;
            }
            //else if found.isForward
            
            else if (_anyToBool(PROP(isForward_,found)))  {
              //found.isForward = false
              PROP(isForward_,found) = false;
              //found.nodeDeclared = this
              PROP(nodeDeclared_,found) = this;
              //if item instanceof Names.Declaration
              if (_instanceof(item,Names_Declaration))  {
                //found.replaceForward item
                METHOD(replaceForward_,found)(found,1,(any_arr){item});
              };
            }
            //else 
            
            else {
              //.sayErr "DUPLICATED name in scope: '#{name}'"
              METHOD(sayErr_,this)(this,1,(any_arr){_concatAny(3,any_str("DUPLICATED name in scope: '"), name, any_str("'"))});
              //logger.error found.originalDeclarationPosition() #add extra information line
              logger_error(undefined,1,(any_arr){METHOD(originalDeclarationPosition_,found)(found,0,NULL)});// #add extra information line
            };
            //return found
            return found;
        };
        //#end if
//else, not found, add it to the scope
        //var nameDecl
        var nameDecl = undefined;
        //if item instanceof Names.Declaration
        if (_instanceof(item,Names_Declaration))  {
          //nameDecl = item
          nameDecl = item;
        }
        //else
        
        else {
          //nameDecl = .declareName(name,options)
          nameDecl = METHOD(declareName_,this)(this,2,(any_arr){name, options});
        };
        //scope.addMember nameDecl
        METHOD(addMember_,scope)(scope,1,(any_arr){nameDecl});
        //return nameDecl
        return nameDecl;
     return undefined;
     }
//#### helper method addToExport(exportedNameDecl, isVarFn)
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
//Add to parentModule.exports, but *preserve parent*
     // 
      //var theModule: Grammar.Module = .getParent(Grammar.Module)
      var theModule = METHOD(getParent_,this)(this,1,(any_arr){Grammar_Module});
     // 
      //var exportDefault = theModule.exports.name is exportedNameDecl.name
      var exportDefault = any_number(__is(PROP(name_,PROP(exports_,theModule)),PROP(name_,exportedNameDecl)));
      //var informInconsistency
      var informInconsistency = undefined;
     // 
      //if exportDefault 
      if (_anyToBool(exportDefault))  {
          //informInconsistency = true
          informInconsistency = true;
          //if not theModule.exportsReplaced
          if (!(_anyToBool(PROP(exportsReplaced_,theModule))) && __is(__call(getMemberCount_,PROP(exports_,theModule),0,NULL),any_number(0)))  {
              //and theModule.exports.getMemberCount() is 0
                  ////ok to replace
                  //theModule.exports.makePointTo exportedNameDecl
                  __call(makePointTo_,PROP(exports_,theModule),1,(any_arr){exportedNameDecl});
                  //theModule.exportsReplaced = true
                  PROP(exportsReplaced_,theModule) = true;
                  //informInconsistency = false
                  informInconsistency = false;
          };
      }
      //else //not exportDefault, simply add to actual namespace
      
      else {
          //if isVarFn and theModule.exportsReplaced
          if (_anyToBool(isVarFn) && _anyToBool(PROP(exportsReplaced_,theModule)))  {
              //informInconsistency = true
              informInconsistency = true;
          }
          //else
          
          else {
              //theModule.exports.addMember exportedNameDecl
              __call(addMember_,PROP(exports_,theModule),1,(any_arr){exportedNameDecl});
          };
      };
      //if informInconsistency
      if (_anyToBool(informInconsistency))  {
          //exportedNameDecl.warn 'default export: cannot have some "public function/var" and also a class/namespace named as the module (default export)'
          METHOD(warn_,exportedNameDecl)(exportedNameDecl,1,(any_arr){any_str("default export: cannot have some \"public function/var\" and also a class/namespace named as the module (default export)")});
      };
     return undefined;
     }
//#### Helper method createScope()
     any ASTBase_createScope(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------
//initializes an empty scope in this node
        //if no .scope 
        if (!_anyToBool(PROP(scope_,this)))  {
          //var options=new Names.NameDeclOptions
          var options = new(Names_NameDeclOptions,0,NULL);
          //options.normalizeModeKeepFirstCase = true
          PROP(normalizeModeKeepFirstCase_,options) = true;
          //.scope = .declareName("[#{.constructor.name} Scope]", options)
          PROP(scope_,this) = METHOD(declareName_,this)(this,2,(any_arr){_concatAny(3,any_str("["), PROP(name_,any_class(this.class)), any_str(" Scope]")), options});
          //.scope.isScope = true
          PROP(isScope_,PROP(scope_,this)) = true;
        };
        //return .scope
        return PROP(scope_,this);
     return undefined;
     }
//#### helper method tryGetOwnerNameDecl( informError ) returns Names.Declaration
     any ASTBase_tryGetOwnerNameDecl(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------
        // define named params
        var informError= argc? arguments[0] : undefined;
        //---------
//Returns namedeclaration where this node should be.
//Used for properties & methods declarations.
//If the parent is Append-To, search for the referenced clas/namespace.
//returns owner.nameDecl or nothing
        //var toNamespace
        var toNamespace = undefined;
        //var ownerDecl 
        var ownerDecl = undefined;
        //# get parent ClassDeclaration/Append-to/Namespace
        //var parent:Grammar.ClassDeclaration = .getParent(Grammar.ClassDeclaration)
        var parent = METHOD(getParent_,this)(this,1,(any_arr){Grammar_ClassDeclaration});
        //if no parent
        if (!_anyToBool(parent))  {
           //if informError, .throwError "declaration is outside 'class/namespace/append to'. Check indent"
           if (_anyToBool(informError)) {METHOD(throwError_,this)(this,1,(any_arr){any_str("declaration is outside 'class/namespace/append to'. Check indent")});};
           //return          
           return undefined;
        };
//Append to class|namespace
        //if parent instance of Grammar.AppendToDeclaration
        if (_instanceof(parent,Grammar_AppendToDeclaration))  {
            //#get varRefOwner from AppendToDeclaration
            //declare parent:Grammar.AppendToDeclaration
            
            //toNamespace = parent.toNamespace #if it was 'append to namespace'
            toNamespace = PROP(toNamespace_,parent);// #if it was 'append to namespace'
            //#get referenced class/namespace
            //if no parent.varRef.tryGetReference() into ownerDecl
            if (!(_anyToBool((ownerDecl=__call(tryGetReference_,PROP(varRef_,parent),0,NULL)))))  {
                //if informError 
                if (_anyToBool(informError))  {
                    //.sayErr "Append to: '#{parent.varRef}'. Reference is not fully declared"
                    METHOD(sayErr_,this)(this,1,(any_arr){_concatAny(3,any_str("Append to: '"), PROP(varRef_,parent), any_str("'. Reference is not fully declared"))});
                };
                //return //if no ownerDecl found
                return undefined; //if no ownerDecl found
            };
        }
        //else # directly inside a ClassDeclaration|NamespaceDeclaration
        
        else {
            //toNamespace = parent.constructor is Grammar.NamespaceDeclaration
            toNamespace = any_number(__is(any_class(parent.class),Grammar_NamespaceDeclaration));
            //ownerDecl = parent.nameDecl
            ownerDecl = PROP(nameDecl_,parent);
        };
        //end if
        
//check if owner is class (namespace) or class.prototype (class)
        //if toNamespace 
        if (_anyToBool(toNamespace))  {
            //#'append to namespace'/'namespace x'. Members are added directly to owner
            //return ownerDecl
            return ownerDecl;
        }
        //else
        
        else {
            //# Class: members are added to the prototype
            //# move to class prototype
            //if no ownerDecl.findOwnMember("prototype") into var ownerDeclProto
            var ownerDeclProto=undefined;
            if (!(_anyToBool((ownerDeclProto=METHOD(findOwnMember_,ownerDecl)(ownerDecl,1,(any_arr){any_str("prototype")})))))  {
                //if informError, .sayErr "Class '#{ownerDecl}' has no .prototype"
                if (_anyToBool(informError)) {METHOD(sayErr_,this)(this,1,(any_arr){_concatAny(3,any_str("Class '"), ownerDecl, any_str("' has no .prototype"))});};
                //return
                return undefined;
            };
            //# Class: members are added to the prototype
            //return ownerDeclProto
            return ownerDeclProto;
        };
        //end if
        
     return undefined;
     }
///*
//#### helper method tryGetOwnerDecl(options:Names.NameDeclOptions) returns Names.Declaration
//Used by properties & methods in the body of ClassDeclaration|AppendToDeclaration
//to get their 'owner', i.e., a Names.Declaration where they'll be added as members
        //var toNamespace, classRef
        //var ownerDecl 
        //declare valid .specifier
        //# get parent class/append to
        //var parent:Grammar.ClassDeclaration = .getParent(Grammar.ClassDeclaration)
        //if no parent
          //.throwError "'#{.specifier}' declaration outside 'class/append to' declaration. Check indent"
//Append to class|namespace
        //if parent instance of Grammar.AppendToDeclaration
            //#get varRefOwner from AppendToDeclaration
            //declare parent:Grammar.AppendToDeclaration
            //toNamespace = parent.toNamespace #if it was 'append to namespace'
            //classRef = parent.varRef
           // 
            //#get referenced class/namespace
            //declare valid classRef.tryGetReference
            //if no classRef.tryGetReference() into ownerDecl
                //if options and options.informError, .sayErr "Append to: '#{classRef}'. Reference is not fully declared"
              //return
        //else # simpler direct ClassDeclaration / NamespaceDeclaration
            //if no parent.nameDecl into ownerDecl
                 //.sayErr "Unexpected. Class has no nameDecl"
            //classRef = ownerDecl
            //toNamespace = parent.constructor is Grammar.NamespaceDeclaration
        //end if
//check if owner is class (namespace) or class.prototype (class)
        //if toNamespace 
            //do nothing #'append to namespace'/'namespace x'. Members are added directly to owner
        //else
          //# Class: members are added to the prototype
          //# move to class prototype
          //if no ownerDecl.findOwnMember("prototype") into ownerDecl
              //if options and options.informError, .sayErr "Class '#{classRef}' has no .prototype"
              //return
        //return ownerDecl
//*/
//#### helper method callOnSubTree(methodSymbol,excludeClass) # recursive
     any ASTBase_callOnSubTree(DEFAULT_ARGUMENTS){
      assert(_instanceof(this,ASTBase));
      //---------
      // define named params
      var methodSymbol, excludeClass;
      methodSymbol=excludeClass=undefined;
      switch(argc){
        case 2:excludeClass=arguments[1];
        case 1:methodSymbol=arguments[0];
      }
      //---------
//This is instance has the method, call the method on the instance
      ////logger.debugGroup "callOnSubTree #{.constructor.name}.#{LiteCore.getSymbolName(methodSymbol)}() - '#{.name}'"
 // 
      //if this.tryGetMethod(methodSymbol) into var theFunction 
      var theFunction=undefined;
      if (_anyToBool((theFunction=METHOD(tryGetMethod_,this)(this,1,(any_arr){methodSymbol}))))  {
            //logger.debug "calling #{.constructor.name}.#{LiteCore.getSymbolName(methodSymbol)}() - '#{.name}'"
            logger_debug(undefined,1,(any_arr){_concatAny(7,any_str("calling "), PROP(name_,any_class(this.class)), any_str("."), LiteCore_getSymbolName(undefined,1,(any_arr){methodSymbol}), any_str("() - '"), PROP(name_,this), any_str("'"))});
            //theFunction.call(this)
            __apply(theFunction,this,0,NULL);
      };
      //if excludeClass and this is instance of excludeClass, return #do not recurse on filtered's childs
      if (_anyToBool(excludeClass) && _instanceof(this,excludeClass)) {return undefined;};
//recurse on this properties and Arrays (exclude 'parent' and 'importedModule')
      //for each property name,value in this
      {
      len_t __propCount=this.class->instanceSize / sizeof(any);
      any name=undefined;
      any value=undefined;
      for(int __propIndex=0 ; __propIndex < __propCount ; __propIndex++ ){value=this.value.prop[__propIndex];
            name= _getPropertyNameAtIndex(this,__propIndex);
        
        //where name not in ['constructor','parent','importedModule','requireCallNodes','exportDefault']
        if(!(__in(name,5,(any_arr){any_str("constructor"), any_str("parent"), any_str("importedModule"), any_str("requireCallNodes"), any_str("exportDefault")}))){
            //if value instance of ASTBase 
            if (_instanceof(value,ASTBase))  {
                //declare value:ASTBase
                
                //value.callOnSubTree methodSymbol,excludeClass #recurse
                METHOD(callOnSubTree_,value)(value,2,(any_arr){methodSymbol, excludeClass});// #recurse
            }
            //else if value instance of Array
            
            else if (_instanceof(value,Array))  {
                //declare value:array 
                
                ////logger.debug "callOnSubArray #{.constructor.name}.#{name}[]"
                //for each item in value where item instance of ASTBase
                any _list43=value;
                { var item=undefined;
                for(int item__inx=0 ; item__inx<_list43.value.arr->length ; item__inx++){item=ITEM(item__inx,_list43);
                  
                //for each item in value where item instance of ASTBase
                if(_instanceof(item,ASTBase)){
                    //declare item:ASTBase
                    
                    //item.callOnSubTree methodSymbol,excludeClass
                    METHOD(callOnSubTree_,item)(item,2,(any_arr){methodSymbol, excludeClass});
                }}};// end for each in value
                
            };
      }}};// end for each property in this
      //end for
      
     return undefined;
     }
      ////logger.debugGroupEnd
//----
//## Methods added to specific Grammar Classes to handle scope, var & members declaration
//### Append to class Grammar.VariableDecl ###
    
//`VariableDecl: Identifier (':' dataType-IDENTIFIER) ('=' assignedValue-Expression)`
//variable name, optional type anotation and optionally assign a value
//VariableDecls are used in:
//1. `var` statement
//2. function *parameter declaration* 
//3. class *properties declaration*
//Examples:  
  //`var a : string = 'some text'` 
  //`function x ( a : string = 'some text', b, c=0)`
      //properties nameDecl
      ;
      //helper method createNameDeclaration()  
      any Grammar_VariableDecl_createNameDeclaration(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_VariableDecl));
        //---------
        //var options = new Names.NameDeclOptions
        var options = new(Names_NameDeclOptions,0,NULL);
        //options.type = .type
        PROP(type_,options) = PROP(type_,this);
        //options.itemType = .itemType
        PROP(itemType_,options) = PROP(itemType_,this);
        //return .declareName(.name,options)
        return METHOD(declareName_,this)(this,2,(any_arr){PROP(name_,this), options});
      return undefined;
      }
      //helper method declareInScope()  
      any Grammar_VariableDecl_declareInScope(DEFAULT_ARGUMENTS){
          assert(_instanceof(this,Grammar_VariableDecl));
          //---------
          //.nameDecl = .addToScope(.createNameDeclaration())
          PROP(nameDecl_,this) = METHOD(addToScope_,this)(this,1,(any_arr){METHOD(createNameDeclaration_,this)(this,0,NULL)});
      return undefined;
      }
      //helper method getTypeFromAssignedValue() 
      any Grammar_VariableDecl_getTypeFromAssignedValue(DEFAULT_ARGUMENTS){
          assert(_instanceof(this,Grammar_VariableDecl));
          //---------
          //if .nameDecl and .assignedValue and .nameDecl.name isnt 'prototype'
          if (_anyToBool(PROP(nameDecl_,this)) && _anyToBool(PROP(assignedValue_,this)) && !__is(PROP(name_,PROP(nameDecl_,this)),any_str("prototype")))  {
              //if no .nameDecl.findOwnMember('**proto**') into var type #if has no type
              var type=undefined;
              if (!(_anyToBool((type=__call(findOwnMember_,PROP(nameDecl_,this),1,(any_arr){any_str("**proto**")})))))  {// #if has no type
                  //if .assignedValue.getResultType() into var result #get assignedValue type
                  var result=undefined;
                  if (_anyToBool((result=__call(getResultType_,PROP(assignedValue_,this),0,NULL))))  {// #get assignedValue type
                      //this.nameDecl.setMember('**proto**', result) #assign to this.nameDecl
                      __call(setMember_,PROP(nameDecl_,this),2,(any_arr){any_str("**proto**"), result});// #assign to this.nameDecl
                  };
              };
          };
      return undefined;
      }
//### Append to class Grammar.VarStatement ###
    
     //method declare()  # pass 1
     any Grammar_VarStatement_declare(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_VarStatement));
        //---------
        //for each varDecl in .list
        any _list44=PROP(list_,this);
        { var varDecl=undefined;
        for(int varDecl__inx=0 ; varDecl__inx<_list44.value.arr->length ; varDecl__inx++){varDecl=ITEM(varDecl__inx,_list44);
        
            //varDecl.declareInScope
            METHOD(declareInScope_,varDecl)(varDecl,0,NULL);
            //declare .parent: Grammar.Statement
            
            //if .hasAdjective('export'), .addToExport varDecl.nameDecl, isVarFn=true
            if (_anyToBool(METHOD(hasAdjective_,this)(this,1,(any_arr){any_str("export")}))) {METHOD(addToExport_,this)(this,2,(any_arr){PROP(nameDecl_,varDecl), true});};
            //if varDecl.aliasVarRef
            if (_anyToBool(PROP(aliasVarRef_,varDecl)))  {
                ////Example: "public var $ = jQuery" => declare alias $ for jQuery
                //var opt = new Names.NameDeclOptions
                var opt = new(Names_NameDeclOptions,0,NULL);
                //opt.informError= true
                PROP(informError_,opt) = true;
                //if varDecl.aliasVarRef.tryGetReference(opt) into var ref
                var ref=undefined;
                if (_anyToBool((ref=__call(tryGetReference_,PROP(aliasVarRef_,varDecl),1,(any_arr){opt}))))  {
                    //# aliases share .members
                    //varDecl.nameDecl.members = ref.members
                    PROP(members_,PROP(nameDecl_,varDecl)) = PROP(members_,ref);
                };
            };
        }};// end for each in PROP(list_,this)
        
     return undefined;
     }
                    // 
     //method evaluateAssignments() # pass 4, determine type from assigned value
     any Grammar_VarStatement_evaluateAssignments(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_VarStatement));
        //---------
        //for each varDecl in .list
        any _list45=PROP(list_,this);
        { var varDecl=undefined;
        for(int varDecl__inx=0 ; varDecl__inx<_list45.value.arr->length ; varDecl__inx++){varDecl=ITEM(varDecl__inx,_list45);
        
            //varDecl.getTypeFromAssignedValue
            METHOD(getTypeFromAssignedValue_,varDecl)(varDecl,0,NULL);
        }};// end for each in PROP(list_,this)
        
     return undefined;
     }
//### Append to class Grammar.WithStatement ###
    
      //properties nameDecl
      ;
      //method declare()  # pass 1
      any Grammar_WithStatement_declare(DEFAULT_ARGUMENTS){
         assert(_instanceof(this,Grammar_WithStatement));
         //---------
         //.nameDecl = .addToScope(.declareName(.name))
         PROP(nameDecl_,this) = METHOD(addToScope_,this)(this,1,(any_arr){METHOD(declareName_,this)(this,1,(any_arr){PROP(name_,this)})});
      return undefined;
      }
      //method evaluateAssignments() # pass 4, determine type from assigned value
      any Grammar_WithStatement_evaluateAssignments(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_WithStatement));
        //---------
        //.nameDecl.assignTypeFromValue .varRef
        __call(assignTypeFromValue_,PROP(nameDecl_,this),1,(any_arr){PROP(varRef_,this)});
      return undefined;
      }
     // 
//### Append to class Grammar.ImportStatementItem ###
    
      //properties nameDecl
      ;
      //method declare #pass 1: declare name choosed for imported(required) contents as a scope var
      any Grammar_ImportStatementItem_declare(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ImportStatementItem));
        //---------
        //if no .getParent(Grammar.DeclareStatement) #except for 'global declare'
        if (!_anyToBool(METHOD(getParent_,this)(this,1,(any_arr){Grammar_DeclareStatement})))  {// #except for 'global declare'
            //if .hasAdjective('shim') and .findInScope(.name), return // do not import if shim and already declared
            if (_anyToBool(METHOD(hasAdjective_,this)(this,1,(any_arr){any_str("shim")})) && _anyToBool(METHOD(findInScope_,this)(this,1,(any_arr){PROP(name_,this)}))) {return undefined;};
            //.nameDecl = .addToScope(.name)
            PROP(nameDecl_,this) = METHOD(addToScope_,this)(this,1,(any_arr){PROP(name_,this)});
        };
      return undefined;
      }
//----------------------------
///*
//### Append to class Grammar.NamespaceDeclaration
//#### method declare()
        //.nameDecl = .addToScope(.declareName(.name))
        //.createScope
//*/
       // 
//### Append to class Grammar.ClassDeclaration 
    
//also AppendToDeclaration and NamespaceDeclaration (child classes).
//#### properties
      //nameDecl
     ;
      ////container: Grammar.NamespaceDeclaration // in which namespace this class/namespace is declared
//#### method declare()
     any Grammar_ClassDeclaration_declare(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ClassDeclaration));
        //---------
//AppendToDeclarations do not "declare" anything at this point. 
//AppendToDeclarations add to a existing classes or namespaces. 
//The adding is delayed until pass:"processAppendToExtends", where
//append-To var reference is searched in the scope 
//and methods and properties are added. 
//This need to be done after all declarations.
        //if this.constructor is Grammar.AppendToDeclaration, return
        if (__is(any_class(this.class),Grammar_AppendToDeclaration)) {return undefined;};
//Check if it is a class or a namespace
        //var isNamespace = this.constructor is Grammar.NamespaceDeclaration
        var isNamespace = any_number(__is(any_class(this.class),Grammar_NamespaceDeclaration));
        //var isClass = this.constructor is Grammar.ClassDeclaration
        var isClass = any_number(__is(any_class(this.class),Grammar_ClassDeclaration));
        //var opt = new Names.NameDeclOptions
        var opt = new(Names_NameDeclOptions,0,NULL);
        //if isNamespace 
        if (_anyToBool(isNamespace))  {
            //.nameDecl = .declareName(.name)
            PROP(nameDecl_,this) = METHOD(declareName_,this)(this,1,(any_arr){PROP(name_,this)});
        }
        //else 
        
        else {
//if is a class adjectivated "shim", do not declare if already exists
   // 
            //if .hasAdjective('shim') 
            if (_anyToBool(METHOD(hasAdjective_,this)(this,1,(any_arr){any_str("shim")})))  {
                //if .tryGetFromScope(.name) 
                if (_anyToBool(METHOD(tryGetFromScope_,this)(this,1,(any_arr){PROP(name_,this)})))  {
                    //return 
                    return undefined;
                };
            };
//declare the class
            //opt.type = globalPrototype('Function')
            PROP(type_,opt) = Validate_globalPrototype(undefined,1,(any_arr){any_str("Function")});
            //.nameDecl = .declareName(.name,opt) //class
            PROP(nameDecl_,this) = METHOD(declareName_,this)(this,2,(any_arr){PROP(name_,this), opt}); //class
            //opt.type = undefined
            PROP(type_,opt) = undefined;
        };
//get parent. We cover here class/namespaces directly declared inside namespaces (without AppendTo)
        //var container = .getParent(Grammar.NamespaceDeclaration)
        var container = METHOD(getParent_,this)(this,1,(any_arr){Grammar_NamespaceDeclaration});
//if it is declared inside a namespace, it becomes a item of the namespace
        //if container
        if (_anyToBool(container))  {
            //declare container: Grammar.NamespaceDeclaration
            
            //container.nameDecl.addMember .nameDecl
            __call(addMember_,PROP(nameDecl_,container),1,(any_arr){PROP(nameDecl_,this)});
        }
//else, is a module-level class|namespace. Add to scope
        //else
        
        else {
            //.addToScope .nameDecl 
            METHOD(addToScope_,this)(this,1,(any_arr){PROP(nameDecl_,this)});
//if public/export, or interface, also add to module.exports
            //var scopeModule=.getParent(Grammar.Module)
            var scopeModule = METHOD(getParent_,this)(this,1,(any_arr){Grammar_Module});
            //if scopeModule.fileInfo.isInterface or .hasAdjective('export') 
            if (_anyToBool((_anyToBool(__or2=PROP(isInterface_,PROP(fileInfo_,scopeModule)))? __or2 : METHOD(hasAdjective_,this)(this,1,(any_arr){any_str("export")}))))  {
                  //.addToExport .nameDecl 
                  METHOD(addToExport_,this)(this,1,(any_arr){PROP(nameDecl_,this)});
            };
        };
//if it is a Class, we create 'Class.prototype' member
//Class's properties & methods will be added to 'prototype' as valid member members.
//'prototype' starts with 'constructor' which is a pointer to the class-funcion itself
        //if isClass
        if (_anyToBool(isClass))  {
            //var prtypeNameDecl = .nameDecl.findOwnMember('prototype') or .addMemberTo(.nameDecl,'prototype')
            var prtypeNameDecl = (_anyToBool(__or3=__call(findOwnMember_,PROP(nameDecl_,this),1,(any_arr){any_str("prototype")}))? __or3 : METHOD(addMemberTo_,this)(this,2,(any_arr){PROP(nameDecl_,this), any_str("prototype")}));
            //if .varRefSuper, prtypeNameDecl.setMember('**proto**',.varRefSuper)
            if (_anyToBool(PROP(varRefSuper_,this))) {METHOD(setMember_,prtypeNameDecl)(prtypeNameDecl,2,(any_arr){any_str("**proto**"), PROP(varRefSuper_,this)});};
            //opt.pointsTo = .nameDecl
            PROP(pointsTo_,opt) = PROP(nameDecl_,this);
            //prtypeNameDecl.addMember('constructor',opt) 
            METHOD(addMember_,prtypeNameDecl)(prtypeNameDecl,2,(any_arr){any_str("constructor"), opt});
//return type of the class-function, is the prototype
            //.nameDecl.setMember '**return type**',prtypeNameDecl
            __call(setMember_,PROP(nameDecl_,this),2,(any_arr){any_str("**return type**"), prtypeNameDecl});
//add to nameAffinity
            //if not nameAffinity.members.has(.name)
            if (!(_anyToBool(__call(has_,PROP(members_,Validate_nameAffinity),1,(any_arr){PROP(name_,this)}))))  {
                //nameAffinity.members.set .name, .nameDecl
                __call(set_,PROP(members_,Validate_nameAffinity),2,(any_arr){PROP(name_,this), PROP(nameDecl_,this)});
            };
        };
     return undefined;
     }
//#### method validatePropertyAccess() 
     any Grammar_ClassDeclaration_validatePropertyAccess(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ClassDeclaration));
        //---------
//in the pass "Validating Property Access", for a "ClassDeclaration"
//we check for duplicate property names in the super-class-chain
        //if .constructor isnt Grammar.ClassDeclaration, return // exclude child classes
        if (!__is(any_class(this.class),Grammar_ClassDeclaration)) {return undefined;};
        //var prt:Names.Declaration = .nameDecl.ownMember('prototype')
        var prt = __call(ownMember_,PROP(nameDecl_,this),1,(any_arr){any_str("prototype")});
        //for each propNameDecl in map prt.members where propNameDecl.isProperty
        any _list46=PROP(members_,prt);
        {NameValuePair_ptr __nvp=NULL; //name:value pair
        int64_t __len=MAPSIZE(_list46); //how many pairs
        var propNameDecl=undefined; //value
        for(int64_t __inx=0 ; __inx < __len ; __inx++ ){
                __nvp = MAPITEM( __inx,_list46);
                propNameDecl= __nvp->value;
          
        //for each propNameDecl in map prt.members where propNameDecl.isProperty
        if(_anyToBool(PROP(isProperty_,propNameDecl))){
                //propNameDecl.checkSuperChainProperties .nameDecl.superDecl
                METHOD(checkSuperChainProperties_,propNameDecl)(propNameDecl,1,(any_arr){PROP(superDecl_,PROP(nameDecl_,this))});
        }}};// end for each in map PROP(members_,prt)
        
     return undefined;
     }
//### Append to class Grammar.ArrayLiteral ###
    
     //properties nameDecl
     ;
     //method declare
     any Grammar_ArrayLiteral_declare(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ArrayLiteral));
        //---------
//When producing C-code, an ArrayLiteral creates a "new(Array" at module level
        //if project.options.target is 'c'
        if (__is(PROP(target_,PROP(options_,Validate_project)),any_str("c")))  {
            //.nameDecl = .declareName(UniqueID.getVarName('_literalArray'))
            PROP(nameDecl_,this) = METHOD(declareName_,this)(this,1,(any_arr){UniqueID_getVarName(undefined,1,(any_arr){any_str("_literalArray")})});
            //.getParent(Grammar.Module).addToScope .nameDecl
            __call(addToScope_,METHOD(getParent_,this)(this,1,(any_arr){Grammar_Module}),1,(any_arr){PROP(nameDecl_,this)});
        };
     return undefined;
     }
       // 
     //method getResultType
     any Grammar_ArrayLiteral_getResultType(DEFAULT_ARGUMENTS){
          assert(_instanceof(this,Grammar_ArrayLiteral));
          //---------
          //return tryGetGlobalPrototype('Array')
          return Validate_tryGetGlobalPrototype(undefined,1,(any_arr){any_str("Array")});
     return undefined;
     }
//### Append to class Grammar.ObjectLiteral ###
    
     //properties nameDecl
     ;
     //method declare
     any Grammar_ObjectLiteral_declare(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ObjectLiteral));
        //---------
//When producing C-code, an ObjectLiteral creates a "Map string to any" on the fly, 
//but it does not declare a valid type/class.
        //if project.options.target is 'c'
        if (__is(PROP(target_,PROP(options_,Validate_project)),any_str("c")))  {
            //.nameDecl = .declareName(UniqueID.getVarName('_literalMap'))
            PROP(nameDecl_,this) = METHOD(declareName_,this)(this,1,(any_arr){UniqueID_getVarName(undefined,1,(any_arr){any_str("_literalMap")})});
            //.getParent(Grammar.Module).addToScope .nameDecl
            __call(addToScope_,METHOD(getParent_,this)(this,1,(any_arr){Grammar_Module}),1,(any_arr){PROP(nameDecl_,this)});
        }
       // 
        //else
        
        else {
            //declare valid .parent.nameDecl
            
            //.nameDecl = .parent.nameDecl or .declareName(UniqueID.getVarName('*ObjectLiteral*'))
            PROP(nameDecl_,this) = (_anyToBool(__or4=PROP(nameDecl_,PROP(parent_,this)))? __or4 : METHOD(declareName_,this)(this,1,(any_arr){UniqueID_getVarName(undefined,1,(any_arr){any_str("*ObjectLiteral*")})}));
        };
     return undefined;
     }
//When producing the LiteScript-to-C compiler, a ObjectLiteral's return type is 'Map string to any'
     //method getResultType
     any Grammar_ObjectLiteral_getResultType(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ObjectLiteral));
        //---------
        //if project.options.target is 'c' 
        if (__is(PROP(target_,PROP(options_,Validate_project)),any_str("c")))  {
            //return tryGetGlobalPrototype('Map')
            return Validate_tryGetGlobalPrototype(undefined,1,(any_arr){any_str("Map")});
        }
        //else
        
        else {
            //return .nameDecl
            return PROP(nameDecl_,this);
        };
     return undefined;
     }
//### Append to class Grammar.NameValuePair ###
    
   // 
     //properties nameDecl
     ;
     //method declare
     any Grammar_NameValuePair_declare(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_NameValuePair));
        //---------
//When producing C-code, a ObjectLiteral creates a "Map string to any" on the fly, 
//but it does not declare a valid type/class.
        //if project.options.target is 'c', return
        if (__is(PROP(target_,PROP(options_,Validate_project)),any_str("c"))) {return undefined;};
        //declare valid .parent.nameDecl
        
        //.nameDecl = .addMemberTo(.parent.nameDecl, .name)
        PROP(nameDecl_,this) = METHOD(addMemberTo_,this)(this,2,(any_arr){PROP(nameDecl_,PROP(parent_,this)), PROP(name_,this)});
//check if we can determine type from value 
        //if .type and .type instance of Names.Declaration and .type.name not in ["undefined","null"]
        if (_anyToBool(PROP(type_,this)) && _instanceof(PROP(type_,this),Names_Declaration) && !(__in(PROP(name_,PROP(type_,this)),2,(any_arr){any_str("undefined"), any_str("null")})))  {
            //.nameDecl.setMember '**proto**', .type
            __call(setMember_,PROP(nameDecl_,this),2,(any_arr){any_str("**proto**"), PROP(type_,this)});
        }
        //else if .value
        
        else if (_anyToBool(PROP(value_,this)))  {
            //.nameDecl.assignTypeFromValue .value
            __call(assignTypeFromValue_,PROP(nameDecl_,this),1,(any_arr){PROP(value_,this)});
        };
     return undefined;
     }
//### Append to class Grammar.FunctionDeclaration ###
    
//`FunctionDeclaration: '[export][generator] (function|method|constructor) [name] '(' FunctionParameterDecl* ')' Block`
     //properties 
        //nameDecl 
        //declared:boolean
     ;
//#### Method declare() ## function, methods and constructors
     any Grammar_FunctionDeclaration_declare(DEFAULT_ARGUMENTS){
      assert(_instanceof(this,Grammar_FunctionDeclaration));
      //---------
      //var ownerNameDecl
      var ownerNameDecl = undefined;
      //var isMethod = .constructor is Grammar.MethodDeclaration
      var isMethod = any_number(__is(any_class(this.class),Grammar_MethodDeclaration));
      //var isFunction = .constructor is Grammar.FunctionDeclaration
      var isFunction = any_number(__is(any_class(this.class),Grammar_FunctionDeclaration));
      //var opt = new Names.NameDeclOptions
      var opt = new(Names_NameDeclOptions,0,NULL);
//1st: Grammar.FunctionDeclaration
//if it is not anonymous, add function name to parent scope,
//if its 'export' add to exports
      //if isFunction
      if (_anyToBool(isFunction))  {
          //opt.type = globalPrototype('Function')
          PROP(type_,opt) = Validate_globalPrototype(undefined,1,(any_arr){any_str("Function")});
          //.nameDecl = .addToScope(.name,opt)
          PROP(nameDecl_,this) = METHOD(addToScope_,this)(this,2,(any_arr){PROP(name_,this), opt});
          //if .hasAdjective('export'), .addToExport .nameDecl,isVarFn=true
          if (_anyToBool(METHOD(hasAdjective_,this)(this,1,(any_arr){any_str("export")}))) {METHOD(addToExport_,this)(this,2,(any_arr){PROP(nameDecl_,this), true});};
      }
///* commmented, for functions and namespace methods, this should'n be a parameter
//determine 'owner' (where 'this' points to for this function)
          //var nameValuePair = .getParent(Grammar.NameValuePair)
          //if nameValuePair #NameValue pair where function is 'value'
              //declare valid nameValuePair.parent.nameDecl
              //ownerNameDecl = nameValuePair.parent.nameDecl  #ownerNameDecl object nameDecl
          //else
            //ownerNameDecl = globalScope
//*/
//2nd: Methods & constructors
//Try to determine ownerNameDecl, for declaration and to set scope var "this"'s  **proto**.
//if ownerNameDecl *can* be determined at this point, declare method as member.
//Note: following JS design, constructors
//are the body of the function-class itself.
      //else if .tryGetOwnerNameDecl() into ownerNameDecl
      
      else if (_anyToBool((ownerNameDecl=METHOD(tryGetOwnerNameDecl_,this)(this,0,NULL))))  {
          //if .constructor isnt Grammar.ConstructorDeclaration 
          if (!__is(any_class(this.class),Grammar_ConstructorDeclaration))  {
              ////the constructor is the Function-Class itself
              //// so it is not a member function
              //.addMethodToOwnerNameDecl ownerNameDecl
              METHOD(addMethodToOwnerNameDecl_,this)(this,1,(any_arr){ownerNameDecl});
          };
      };
      //end if
      
//Define function's return type from parsed text
      //var returnType = .createReturnType()
      var returnType = METHOD(createReturnType_,this)(this,0,NULL);
//Functions (methods and constructors also), have a 'scope'. 
//It captures al vars declared in its body.
//We now create function's scope and add the special var 'this'. 
//The 'type' of 'this' is normally a class prototype, 
//which contains other methods and properties from the class.
//We also add 'arguments.length'
//Scope starts populated by 'this' and 'arguments'.
      //var scope = .createScope()
      var scope = METHOD(createScope_,this)(this,0,NULL);
      //opt.type='any*'
      PROP(type_,opt) = any_str("any*");
      //.addMemberTo(scope,'arguments',opt)
      METHOD(addMemberTo_,this)(this,3,(any_arr){scope, any_str("arguments"), opt});
      //if not isFunction
      if (!(_anyToBool(isFunction)))  {
          //var addThis = false
          var addThis = false;
          //var containerClassDeclaration = .getParent(Grammar.ClassDeclaration) //also append-to & NamespaceDeclaration
          var containerClassDeclaration = METHOD(getParent_,this)(this,1,(any_arr){Grammar_ClassDeclaration}); //also append-to & NamespaceDeclaration
          //if containerClassDeclaration.constructor is Grammar.ClassDeclaration
          if (__is(any_class(containerClassDeclaration.class),Grammar_ClassDeclaration))  {
              //addThis = true
              addThis = true;
          }
          //else if containerClassDeclaration.constructor is Grammar.AppendToDeclaration
          
          else if (__is(any_class(containerClassDeclaration.class),Grammar_AppendToDeclaration))  {
              //declare containerClassDeclaration:Grammar.AppendToDeclaration
              
              //addThis = not containerClassDeclaration.toNamespace
              addThis = any_number(!(_anyToBool(PROP(toNamespace_,containerClassDeclaration))));
          };
          //if addThis 
          if (_anyToBool(addThis))  {
              //opt.type=ownerNameDecl
              PROP(type_,opt) = ownerNameDecl;
              //.addMemberTo(scope,'this',opt)
              METHOD(addMemberTo_,this)(this,3,(any_arr){scope, any_str("this"), opt});
          };
      };
//Note: only class methods have 'this' as parameter
//add parameters to function's scope
      //if .paramsDeclarations
      if (_anyToBool(PROP(paramsDeclarations_,this)))  {
        //for each varDecl in .paramsDeclarations
        any _list47=PROP(paramsDeclarations_,this);
        { var varDecl=undefined;
        for(int varDecl__inx=0 ; varDecl__inx<_list47.value.arr->length ; varDecl__inx++){varDecl=ITEM(varDecl__inx,_list47);
        
          //varDecl.declareInScope
          METHOD(declareInScope_,varDecl)(varDecl,0,NULL);
        }};// end for each in PROP(paramsDeclarations_,this)
        
      };
     return undefined;
     }
//#### helper method addMethodToOwnerNameDecl(owner:Names.Declaration)  ## methods
     any Grammar_FunctionDeclaration_addMethodToOwnerNameDecl(DEFAULT_ARGUMENTS){
      assert(_instanceof(this,Grammar_FunctionDeclaration));
      //---------
      // define named params
      var owner= argc? arguments[0] : undefined;
      //---------
      //var actual = owner.findOwnMember(.name)
      var actual = METHOD(findOwnMember_,owner)(owner,1,(any_arr){PROP(name_,this)});
      //if actual and .hasAdjective('shim') #shim for an exising method, do nothing
      if (_anyToBool(actual) && _anyToBool(METHOD(hasAdjective_,this)(this,1,(any_arr){any_str("shim")})))  {// #shim for an exising method, do nothing
        //return
        return undefined;
      };
//Add to owner, type is 'Function'
      //if no .nameDecl 
      if (!_anyToBool(PROP(nameDecl_,this)))  {
          //var opt = new Names.NameDeclOptions
          var opt = new(Names_NameDeclOptions,0,NULL);
          //opt.type=globalPrototype('Function')
          PROP(type_,opt) = Validate_globalPrototype(undefined,1,(any_arr){any_str("Function")});
          //.nameDecl = .declareName(.name,opt)
          PROP(nameDecl_,this) = METHOD(declareName_,this)(this,2,(any_arr){PROP(name_,this), opt});
      };
     // 
      //.declared = true
      PROP(declared_,this) = true;
      //.addMemberTo owner, .nameDecl
      METHOD(addMemberTo_,this)(this,2,(any_arr){owner, PROP(nameDecl_,this)});
     return undefined;
     }
//#### method createReturnType() returns string ## functions & methods
     any Grammar_FunctionDeclaration_createReturnType(DEFAULT_ARGUMENTS){
      assert(_instanceof(this,Grammar_FunctionDeclaration));
      //---------
      //if no .nameDecl, return #nowhere to put definitions
      if (!_anyToBool(PROP(nameDecl_,this))) {return undefined;};
//Define function's return type from parsed text
      //if .itemType
      if (_anyToBool(PROP(itemType_,this)))  {
//if there's a "itemType", it means type is: `TypeX Array`. 
//We create a intermediate type for `TypeX Array` 
//and set this new nameDecl as function's **return type**
          //var composedName = '#{.itemType.toString()} Array'
          var composedName = _concatAny(2,__call(toString_,PROP(itemType_,this),0,NULL), any_str(" Array"));
//check if it alerady exists, if not found, create one. Type is 'Array'
       // 
          //if not globalScope.findMember(composedName) into var intermediateNameDecl
          var intermediateNameDecl=undefined;
          if (!(_anyToBool((intermediateNameDecl=METHOD(findMember_,Validate_globalScope)(Validate_globalScope,1,(any_arr){composedName})))))  {
              //var opt = new Names.NameDeclOptions
              var opt = new(Names_NameDeclOptions,0,NULL);
              //opt.type = globalPrototype('Array')
              PROP(type_,opt) = Validate_globalPrototype(undefined,1,(any_arr){any_str("Array")});
              //intermediateNameDecl = globalScope.addMember(composedName,opt)
              intermediateNameDecl = METHOD(addMember_,Validate_globalScope)(Validate_globalScope,2,(any_arr){composedName, opt});
          };
//item type, is each array member's type 
          //intermediateNameDecl.setMember "**item type**", .itemType
          METHOD(setMember_,intermediateNameDecl)(intermediateNameDecl,2,(any_arr){any_str("**item type**"), PROP(itemType_,this)});
          //.nameDecl.setMember '**return type**', intermediateNameDecl
          __call(setMember_,PROP(nameDecl_,this),2,(any_arr){any_str("**return type**"), intermediateNameDecl});
          //return intermediateNameDecl
          return intermediateNameDecl;
      }
//else, it's a simple type
      //else 
      
      else {
          //if .type then .nameDecl.setMember('**return type**', .type)
          if (_anyToBool(PROP(type_,this))) {__call(setMember_,PROP(nameDecl_,this),2,(any_arr){any_str("**return type**"), PROP(type_,this)});};
          //return .type
          return PROP(type_,this);
      };
     return undefined;
     }
//### Append to class Grammar.AppendToDeclaration ###
    
//#### method processAppendToExtends() 
     any Grammar_AppendToDeclaration_processAppendToExtends(DEFAULT_ARGUMENTS){
      assert(_instanceof(this,Grammar_AppendToDeclaration));
      //---------
//when target is '.c' we do not allow treating classes as namespaces
//so an "append to namespace classX" should throw an error
   // 
//get referenced class/namespace
      //if no .varRef.tryGetReference() into var ownerDecl
      var ownerDecl=undefined;
      if (!(_anyToBool((ownerDecl=__call(tryGetReference_,PROP(varRef_,this),0,NULL)))))  {
          //.sayErr "Append to: '#{.varRef}'. Reference is not fully declared"
          METHOD(sayErr_,this)(this,1,(any_arr){_concatAny(3,any_str("Append to: '"), PROP(varRef_,this), any_str("'. Reference is not fully declared"))});
          //return //if no ownerDecl found
          return undefined; //if no ownerDecl found
      };
      //if not .toNamespace
      if (!(_anyToBool(PROP(toNamespace_,this))))  {
          ////if is "append to class"
          //if no ownerDecl.findOwnMember('prototype') into var prt, .throwError "class '#{ownerDecl}' has no prototype"
          var prt=undefined;
          if (!(_anyToBool((prt=METHOD(findOwnMember_,ownerDecl)(ownerDecl,1,(any_arr){any_str("prototype")}))))) {METHOD(throwError_,this)(this,1,(any_arr){_concatAny(3,any_str("class '"), ownerDecl, any_str("' has no prototype"))});};
          //ownerDecl=prt // append to class, adds to prototype
          ownerDecl = prt; // append to class, adds to prototype
      };
      ////if project.options.target is 'c'
      ////    if .toNamespace and prt
      ////        .sayErr "Append to: '#{.varRef}'. For C production, cannot append to class as namespace."
      //for each item in .body.statements
      any _list48=PROP(statements_,PROP(body_,this));
      { var item=undefined;
      for(int item__inx=0 ; item__inx<_list48.value.arr->length ; item__inx++){item=ITEM(item__inx,_list48);
      
          //switch item.specific.constructor
          any _switch4=any_class(PROP(specific_,item).class);
              //case Grammar.PropertiesDeclaration:
          if (__is(_switch4,Grammar_PropertiesDeclaration)){
                  //declare item.specific:Grammar.PropertiesDeclaration
                  
                  //if not item.specific.declared, item.specific.declare(informError=true) 
                  if (!(_anyToBool(PROP(declared_,PROP(specific_,item))))) {__call(declare_,PROP(specific_,item),1,(any_arr){true});};
          
          }
              //case Grammar.MethodDeclaration:
          else if (__is(_switch4,Grammar_MethodDeclaration)){
                  //var m:Grammar.MethodDeclaration = item.specific
                  var m = PROP(specific_,item);
                  //if m.declared, continue
                  if (_anyToBool(PROP(declared_,m))) {continue;};
//Now that we have 'owner' we can set **proto** for scope var 'this', 
//so we can later validate `.x` in `this.x = 7`
                  //m.addMethodToOwnerNameDecl ownerDecl
                  METHOD(addMethodToOwnerNameDecl_,m)(m,1,(any_arr){ownerDecl});
                  //if m.scope.findOwnMember("this") into var scopeThis 
                  var scopeThis=undefined;
                  if (_anyToBool((scopeThis=__call(findOwnMember_,PROP(scope_,m),1,(any_arr){any_str("this")}))))  {
                      //scopeThis.setMember '**proto**',ownerDecl
                      METHOD(setMember_,scopeThis)(scopeThis,2,(any_arr){any_str("**proto**"), ownerDecl});
                      //#set also **return type**
                      //m.createReturnType
                      METHOD(createReturnType_,m)(m,0,NULL);
                  };
          
          }
              //case Grammar.ClassDeclaration:
          else if (__is(_switch4,Grammar_ClassDeclaration)){
                  //declare item.specific:Grammar.ClassDeclaration
                  
                  //ownerDecl.addMember item.specific.nameDecl                 
                  METHOD(addMember_,ownerDecl)(ownerDecl,1,(any_arr){PROP(nameDecl_,PROP(specific_,item))});
          
          }
              //case Grammar.EndStatement:
          else if (__is(_switch4,Grammar_EndStatement)){
                  //do nothing
                  //do nothing
                  ;
          
          }
          else {
              //default:
                  //.sayErr 'unexpected "#{item.specific.constructor.name}" inside Append-to Declaration'
                  METHOD(sayErr_,this)(this,1,(any_arr){_concatAny(3,any_str("unexpected \""), PROP(name_,any_class(PROP(specific_,item).class)), any_str("\" inside Append-to Declaration"))});
          };
      }};// end for each in PROP(statements_,PROP(body_,this))
      
     return undefined;
     }
//### Append to class Names.Declaration ###
    
//#### Properties 
      //superDecl : Names.Declaration //nameDecl of the super class
     ;
//#### method checkSuperChainProperties(superClassNameDecl)
     any Names_Declaration_checkSuperChainProperties(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Names_Declaration));
        //---------
        // define named params
        var superClassNameDecl= argc? arguments[0] : undefined;
        //---------
        //if no superClassNameDecl, return 
        if (!_anyToBool(superClassNameDecl)) {return undefined;};
//Check for duplicate class properties in the super class
        //if superClassNameDecl.findOwnMember('prototype') into var superPrt:Names.Declaration
        var superPrt=undefined;
        if (_anyToBool((superPrt=METHOD(findOwnMember_,superClassNameDecl)(superClassNameDecl,1,(any_arr){any_str("prototype")}))))  {
           // 
            //if superPrt.findOwnMember(.name) into var originalNameDecl
            var originalNameDecl=undefined;
            if (_anyToBool((originalNameDecl=METHOD(findOwnMember_,superPrt)(superPrt,1,(any_arr){PROP(name_,this)}))))  {
                //.sayErr "Duplicated property. super class [#{superClassNameDecl}] already has a property '#{this}'"
                METHOD(sayErr_,this)(this,1,(any_arr){_concatAny(5,any_str("Duplicated property. super class ["), superClassNameDecl, any_str("] already has a property '"), this, any_str("'"))});
                //originalNameDecl.sayErr "for reference, original declaration."
                METHOD(sayErr_,originalNameDecl)(originalNameDecl,1,(any_arr){any_str("for reference, original declaration.")});
            };
//recurse with super's super. Here we're using recursion as a loop device à la Haskell
//(instead of a simpler "while .superDecl into node" loop. Just to be fancy)
            //.checkSuperChainProperties superClassNameDecl.superDecl
            METHOD(checkSuperChainProperties_,this)(this,1,(any_arr){PROP(superDecl_,superClassNameDecl)});
        };
     return undefined;
     }
//### Append to class Grammar.ClassDeclaration ###
    
//#### method processAppendToExtends() 
     any Grammar_ClassDeclaration_processAppendToExtends(DEFAULT_ARGUMENTS){
      assert(_instanceof(this,Grammar_ClassDeclaration));
      //---------
//In Class's processAppendToExtends we try to get a reference to the superclass
//and then store the superclass nameDecl in the class nameDecl
   // 
//get referenced super class
      //if .varRefSuper 
      if (_anyToBool(PROP(varRefSuper_,this)))  {
          //if no .varRefSuper.tryGetReference() into var superClassNameDecl
          var superClassNameDecl=undefined;
          if (!(_anyToBool((superClassNameDecl=__call(tryGetReference_,PROP(varRefSuper_,this),0,NULL)))))  {
              //.sayErr "class #{.name} extends '#{.varRefSuper}'. Reference is not fully declared"
              METHOD(sayErr_,this)(this,1,(any_arr){_concatAny(5,any_str("class "), PROP(name_,this), any_str(" extends '"), PROP(varRefSuper_,this), any_str("'. Reference is not fully declared"))});
              //return //if no superClassNameDecl found
              return undefined; //if no superClassNameDecl found
          };
          //.nameDecl.superDecl = superClassNameDecl
          PROP(superDecl_,PROP(nameDecl_,this)) = superClassNameDecl;
      };
     return undefined;
     }
//### Append to class Grammar.PropertiesDeclaration ###
    
     //properties 
        //nameDecl 
        //declared:boolean 
     ;
//#### method declare(informError) 
     any Grammar_PropertiesDeclaration_declare(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_PropertiesDeclaration));
        //---------
        // define named params
        var informError= argc? arguments[0] : undefined;
        //---------
//Add all properties as members of its owner object (normally: class.prototype)
        //var opt= new Names.NameDeclOptions
        var opt = new(Names_NameDeclOptions,0,NULL);
        //if .tryGetOwnerNameDecl(informError) into var ownerNameDecl 
        var ownerNameDecl=undefined;
        if (_anyToBool((ownerNameDecl=METHOD(tryGetOwnerNameDecl_,this)(this,1,(any_arr){informError}))))  {
            //for each varDecl in .list
            any _list49=PROP(list_,this);
            { var varDecl=undefined;
            for(int varDecl__inx=0 ; varDecl__inx<_list49.value.arr->length ; varDecl__inx++){varDecl=ITEM(varDecl__inx,_list49);
            
                //opt.type = varDecl.type
                PROP(type_,opt) = PROP(type_,varDecl);
                //opt.itemType = varDecl.itemType
                PROP(itemType_,opt) = PROP(itemType_,varDecl);
                //varDecl.nameDecl = varDecl.addMemberTo(ownerNameDecl,varDecl.name,opt)
                PROP(nameDecl_,varDecl) = METHOD(addMemberTo_,varDecl)(varDecl,3,(any_arr){ownerNameDecl, PROP(name_,varDecl), opt});
            }};// end for each in PROP(list_,this)
            //.declared = true
            PROP(declared_,this) = true;
        };
     return undefined;
     }
//#### method evaluateAssignments() # determine type from assigned value on properties declaration
     any Grammar_PropertiesDeclaration_evaluateAssignments(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_PropertiesDeclaration));
        //---------
        //for each varDecl in .list
        any _list50=PROP(list_,this);
        { var varDecl=undefined;
        for(int varDecl__inx=0 ; varDecl__inx<_list50.value.arr->length ; varDecl__inx++){varDecl=ITEM(varDecl__inx,_list50);
        
            //varDecl.getTypeFromAssignedValue
            METHOD(getTypeFromAssignedValue_,varDecl)(varDecl,0,NULL);
        }};// end for each in PROP(list_,this)
        
     return undefined;
     }
//### Append to class Grammar.ForStatement ###
    
//#### method declare()
     any Grammar_ForStatement_declare(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ForStatement));
        //---------
//a ForStatement has a 'Scope', indexVar & mainVar belong to the scope
        //.createScope
        METHOD(createScope_,this)(this,0,NULL);
     return undefined;
     }
//### Append to class Grammar.ForEachProperty ###
    
//#### method declare()
     any Grammar_ForEachProperty_declare(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ForEachProperty));
        //---------
        //default .mainVar.type = .iterable.itemType
        _default(&PROP(type_,PROP(mainVar_,this)),PROP(itemType_,PROP(iterable_,this)));
        //.mainVar.declareInScope
        __call(declareInScope_,PROP(mainVar_,this),0,NULL);
        //if .indexVar, .indexVar.declareInScope
        if (_anyToBool(PROP(indexVar_,this))) {__call(declareInScope_,PROP(indexVar_,this),0,NULL);};
     return undefined;
     }
//#### method evaluateAssignments() 
     any Grammar_ForEachProperty_evaluateAssignments(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ForEachProperty));
        //---------
//ForEachProperty: index is: string for js (property name) and number for C (symbol)
        //var indexType = project.options.target is 'js'? 'String':'Number'
        var indexType = __is(PROP(target_,PROP(options_,Validate_project)),any_str("js")) ? any_str("String") : any_str("Number");
        //.indexVar.nameDecl.setMember('**proto**',globalPrototype(indexType))
        __call(setMember_,PROP(nameDecl_,PROP(indexVar_,this)),2,(any_arr){any_str("**proto**"), Validate_globalPrototype(undefined,1,(any_arr){indexType})});
     return undefined;
     }
//### Append to class Grammar.ForEachInArray ###
    
//#### method declare()
     any Grammar_ForEachInArray_declare(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ForEachInArray));
        //---------
        //default .mainVar.type = .iterable.itemType
        _default(&PROP(type_,PROP(mainVar_,this)),PROP(itemType_,PROP(iterable_,this)));
        //.mainVar.declareInScope
        __call(declareInScope_,PROP(mainVar_,this),0,NULL);
        //if .indexVar, .indexVar.declareInScope
        if (_anyToBool(PROP(indexVar_,this))) {__call(declareInScope_,PROP(indexVar_,this),0,NULL);};
     return undefined;
     }
//#### method evaluateAssignments() 
     any Grammar_ForEachInArray_evaluateAssignments(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ForEachInArray));
        //---------
//ForEachInArray:
//If no mainVar.type, guess type from iterable's itemType
        //if no .mainVar.nameDecl.findOwnMember('**proto**')
        if (!_anyToBool(__call(findOwnMember_,PROP(nameDecl_,PROP(mainVar_,this)),1,(any_arr){any_str("**proto**")})))  {
            //var iterableType:Names.Declaration = .iterable.getResultType()          
            var iterableType = __call(getResultType_,PROP(iterable_,this),0,NULL);
            //if iterableType and iterableType.findOwnMember('**item type**')  into var itemType
            var itemType=undefined;
            if (_anyToBool(iterableType) && _anyToBool((itemType=METHOD(findOwnMember_,iterableType)(iterableType,1,(any_arr){any_str("**item type**")}))))  {
                //.mainVar.nameDecl.setMember('**proto**',itemType)
                __call(setMember_,PROP(nameDecl_,PROP(mainVar_,this)),2,(any_arr){any_str("**proto**"), itemType});
            };
        };
     return undefined;
     }
//#### method validatePropertyAccess() 
     any Grammar_ForEachInArray_validatePropertyAccess(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ForEachInArray));
        //---------
//ForEachInArray: check if the iterable has a .length property.
        //if .isMap, return
        if (_anyToBool(PROP(isMap_,this))) {return undefined;};
        //var iterableType:Names.Declaration = .iterable.getResultType()
        var iterableType = __call(getResultType_,PROP(iterable_,this),0,NULL);
        //if no iterableType 
        if (!_anyToBool(iterableType))  {
            //#.sayErr "ForEachInArray: no type declared for: '#{.iterable}'"
            //do nothing
            //do nothing
            ;
        }
        //else if no iterableType.findMember('length')
        
        else if (!_anyToBool(METHOD(findMember_,iterableType)(iterableType,1,(any_arr){any_str("length")})))  {
            //.sayErr "ForEachInArray: no .length property declared in '#{.iterable}' type:'#{iterableType.toString()}'"
            METHOD(sayErr_,this)(this,1,(any_arr){_concatAny(5,any_str("ForEachInArray: no .length property declared in '"), PROP(iterable_,this), any_str("' type:'"), METHOD(toString_,iterableType)(iterableType,0,NULL), any_str("'"))});
            //logger.error iterableType.originalDeclarationPosition()
            logger_error(undefined,1,(any_arr){METHOD(originalDeclarationPosition_,iterableType)(iterableType,0,NULL)});
        };
     return undefined;
     }
//### Append to class Grammar.ForIndexNumeric ###
    
//#### method declare()
     any Grammar_ForIndexNumeric_declare(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ForIndexNumeric));
        //---------
        //.indexVar.declareInScope
        __call(declareInScope_,PROP(indexVar_,this),0,NULL);
     return undefined;
     }
//### Append to class Grammar.ExceptionBlock
    
//`ExceptionBlock: (exception|catch) catchVar-IDENTIFIER Body [finally Body]`
      //method declare()
      any Grammar_ExceptionBlock_declare(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ExceptionBlock));
        //---------
//Exception blocks have a scope
        //.createScope
        METHOD(createScope_,this)(this,0,NULL);
        //var opt=new Names.NameDeclOptions
        var opt = new(Names_NameDeclOptions,0,NULL);
        //opt.type= globalPrototype('Error')
        PROP(type_,opt) = Validate_globalPrototype(undefined,1,(any_arr){any_str("Error")});
        //.addToScope .catchVar,opt
        METHOD(addToScope_,this)(this,2,(any_arr){PROP(catchVar_,this), opt});
      return undefined;
      }
//### Append to class Grammar.VariableRef ### Helper methods
    
//`VariableRef: ['--'|'++']Identifier[Accessors]['--'|'++']`
//`VariableRef` is a Variable Reference. 
//#### method validatePropertyAccess() 
     any Grammar_VariableRef_validatePropertyAccess(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_VariableRef));
        //---------
        //if .parent is instance of Grammar.DeclareStatement
        if (_instanceof(PROP(parent_,this),Grammar_DeclareStatement))  {
            //declare valid .parent.specifier
            
            //if .parent.specifier is 'valid'
            if (__is(PROP(specifier_,PROP(parent_,this)),any_str("valid")))  {
                  //return #declare valid xx.xx.xx
                  return undefined;// #declare valid xx.xx.xx
            };
        };
//Start with main variable name, to check property names
        //var opt = new Names.NameDeclOptions
        var opt = new(Names_NameDeclOptions,0,NULL);
        //opt.informError=true
        PROP(informError_,opt) = true;
        //opt.isForward=true
        PROP(isForward_,opt) = true;
        //opt.isDummy=true
        PROP(isDummy_,opt) = true;
        //var actualVar = .tryGetFromScope(.name, opt)
        var actualVar = METHOD(tryGetFromScope_,this)(this,2,(any_arr){PROP(name_,this), opt});
//now follow each accessor
        //if no actualVar or no .accessors, return 
        if (_anyToBool((_anyToBool(__or5=any_number(!_anyToBool(actualVar)))? __or5 : any_number(!_anyToBool(PROP(accessors_,this)))))) {return undefined;};
        //for each ac in .accessors
        any _list51=PROP(accessors_,this);
        { var ac=undefined;
        for(int ac__inx=0 ; ac__inx<_list51.value.arr->length ; ac__inx++){ac=ITEM(ac__inx,_list51);
        
            //declare valid ac.name
            
//for PropertyAccess, check if the property name is valid 
            //if ac instanceof Grammar.PropertyAccess
            if (_instanceof(ac,Grammar_PropertyAccess))  {
                //opt.isForward=false
                PROP(isForward_,opt) = false;
                //actualVar = .tryGetMember(actualVar, ac.name,opt)
                actualVar = METHOD(tryGetMember_,this)(this,3,(any_arr){actualVar, PROP(name_,ac), opt});
            }
//else, for IndexAccess, the varRef type is now 'itemType'
//and next property access should be on defined members of the type
            //else if ac instanceof Grammar.IndexAccess
            
            else if (_instanceof(ac,Grammar_IndexAccess))  {
                //actualVar = actualVar.findMember('**item type**')
                actualVar = METHOD(findMember_,actualVar)(actualVar,1,(any_arr){any_str("**item type**")});
            }
//else, for FunctionAccess, the varRef type is now function's return type'
//and next property access should be on defined members of the return type
            //else if ac instanceof Grammar.FunctionAccess
            
            else if (_instanceof(ac,Grammar_FunctionAccess))  {
                //if actualVar.findOwnMember('**proto**') into var prt
                var prt=undefined;
                if (_anyToBool((prt=METHOD(findOwnMember_,actualVar)(actualVar,1,(any_arr){any_str("**proto**")}))))  {
                    //if prt.name is 'prototype', prt=prt.parent
                    if (__is(PROP(name_,prt),any_str("prototype"))) {prt = PROP(parent_,prt);};
                    //if prt.name isnt 'Function'
                    if (!__is(PROP(name_,prt),any_str("Function")))  {
                        //.warn "function call. '#{actualVar}' is class '#{prt.name}', not 'Function'"
                        METHOD(warn_,this)(this,1,(any_arr){_concatAny(5,any_str("function call. '"), actualVar, any_str("' is class '"), PROP(name_,prt), any_str("', not 'Function'"))});
                    };
                };
                //actualVar = actualVar.findMember('**return type**')
                actualVar = METHOD(findMember_,actualVar)(actualVar,1,(any_arr){any_str("**return type**")});
            };
            //if actualVar instanceof Grammar.VariableRef
            if (_instanceof(actualVar,Grammar_VariableRef))  {
                //declare actualVar:Grammar.VariableRef
                
                //opt.isForward=true
                PROP(isForward_,opt) = true;
                //actualVar = actualVar.tryGetReference(opt)
                actualVar = METHOD(tryGetReference_,actualVar)(actualVar,1,(any_arr){opt});
            };
            //if no actualVar, break
            if (!_anyToBool(actualVar)) {break;};
        }};// end for each in PROP(accessors_,this)
        //end for #each accessor
        
        //return actualVar
        return actualVar;
     return undefined;
     }
//#### helper method tryGetReference(options:Names.NameDeclOptions) returns Names.Declaration
     any Grammar_VariableRef_tryGetReference(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_VariableRef));
        //---------
        // define named params
        var options= argc? arguments[0] : undefined;
        //---------
//evaluate this VariableRef. 
//Try to determine referenced NameDecl.
//if we can reach a reference, return reference.
//For classes, return ClassDeclaration.nameDecl (not ClassDeclaration.nameDecl.prototype)
        //default options= new Names.NameDeclOptions
        _default(&options,new(Names_NameDeclOptions,0,NULL));
//Start with main variable name
        //var actualVar = .tryGetFromScope(.name, options)
        var actualVar = METHOD(tryGetFromScope_,this)(this,2,(any_arr){PROP(name_,this), options});
        //if no actualVar, return
        if (!_anyToBool(actualVar)) {return undefined;};
//now check each accessor
       // 
        //if no .accessors, return actualVar
        if (!_anyToBool(PROP(accessors_,this))) {return actualVar;};
        //var partial = .name
        var partial = PROP(name_,this);
        //for each ac in .accessors
        any _list52=PROP(accessors_,this);
        { var ac=undefined;
        for(int ac__inx=0 ; ac__inx<_list52.value.arr->length ; ac__inx++){ac=ITEM(ac__inx,_list52);
        
            //declare valid ac.name
            
//for PropertyAccess
            //if ac instanceof Grammar.PropertyAccess
            if (_instanceof(ac,Grammar_PropertyAccess))  {
                //actualVar = .tryGetMember(actualVar, ac.name, options)
                actualVar = METHOD(tryGetMember_,this)(this,3,(any_arr){actualVar, PROP(name_,ac), options});
            }
//else, for IndexAccess, the varRef type is now 'itemType'
//and next property access should be on defined members of the type
            //else if ac instanceof Grammar.IndexAccess
            
            else if (_instanceof(ac,Grammar_IndexAccess))  {
                //actualVar = .tryGetMember(actualVar, '**item type**')
                actualVar = METHOD(tryGetMember_,this)(this,2,(any_arr){actualVar, any_str("**item type**")});
            }
//else, for FunctionAccess, the varRef type is now function's return type'
//and next property access should be on defined members of the return type
            //else if ac instanceof Grammar.FunctionAccess
            
            else if (_instanceof(ac,Grammar_FunctionAccess))  {
                //actualVar = .tryGetMember(actualVar, '**return type**')
                actualVar = METHOD(tryGetMember_,this)(this,2,(any_arr){actualVar, any_str("**return type**")});
            };
//check if we can continue on the chain
            //if actualVar isnt instance of Names.Declaration
            if (!(_instanceof(actualVar,Names_Declaration)))  {
              //actualVar = undefined
              actualVar = undefined;
              //break
              break;
            }
            //else
            
            else {
              //partial += ac.toString()
              partial.value.number += _anyToNumber(METHOD(toString_,ac)(ac,0,NULL));
            };
        }};// end for each in PROP(accessors_,this)
        //end for #each accessor
        
        //if no actualVar and options.informError
        if (!_anyToBool(actualVar) && _anyToBool(PROP(informError_,options)))  {
            //.sayErr "'#{this}'. Reference can not be analyzed further than '#{partial}'"
            METHOD(sayErr_,this)(this,1,(any_arr){_concatAny(5,any_str("'"), this, any_str("'. Reference can not be analyzed further than '"), partial, any_str("'"))});
        };
        //return actualVar
        return actualVar;
     return undefined;
     }
//#### Helper Method getResultType() returns Names.Declaration
     any Grammar_VariableRef_getResultType(DEFAULT_ARGUMENTS){
      assert(_instanceof(this,Grammar_VariableRef));
      //---------
     // 
      //return .tryGetReference()
      return METHOD(tryGetReference_,this)(this,0,NULL);
     return undefined;
     }
//-------
//### Append to class Grammar.AssignmentStatement ###
    
//#### method evaluateAssignments() ## Grammar.AssignmentStatement 
     any Grammar_AssignmentStatement_evaluateAssignments(DEFAULT_ARGUMENTS){
      assert(_instanceof(this,Grammar_AssignmentStatement));
      //---------
   // 
//check if we've got a a clear reference.
      //var reference = .lvalue.tryGetReference()
      var reference = __call(tryGetReference_,PROP(lvalue_,this),0,NULL);
      //if reference isnt instanceof Names.Declaration, return 
      if (!(_instanceof(reference,Names_Declaration))) {return undefined;};
      //if reference.findOwnMember('**proto**'), return #has a type already
      if (_anyToBool(METHOD(findOwnMember_,reference)(reference,1,(any_arr){any_str("**proto**")}))) {return undefined;};
//check if we've got a clear rvalue.
//if we do, set type for lvalue (unless is "null" or "undefined", they destroy type info)
      //reference.assignTypeFromValue .rvalue
      METHOD(assignTypeFromValue_,reference)(reference,1,(any_arr){PROP(rvalue_,this)});
     return undefined;
     }
///*
//#### method declareByAssignment()
//Here we check for lvalue VariableRef in the form:
//`exports.x = xx`, `module.exports.x = xx` and `xx.prototype.yy =`
//We consider this assignments as 'declarations' of members rather than variable references to check.
//Start with main variable name
        //var varRef = .lvalue
        //var keywordFound
        //if varRef.name is 'exports' #start with 'exports'
            //keywordFound = varRef.name
        //if no varRef.accessors 
          //if keywordFound # is: `exports = x`, it does not work in node-js
              //.sayErr "'exports = x', does not work. You need to do: 'module.exports = x'"
          //return # no accessors to check
        //var actualVar = .findInScope(varRef.name)
        //if no actualVar, return
//now check each accessor
       // 
        //var createName 
        //for each index,ac in varRef.accessors
            //declare valid ac.name
//for PropertyAccess
            //if ac instanceof Grammar.PropertyAccess
              //#if we're after 'exports|prototype' keyword and this is the last accessor,
              //#then this is the name to create
              //if keywordFound and index is varRef.accessors.length-1
                  //createName = ac.name
                  //break
//check for 'exports' or 'prototype', after that, last accessor is property declaration
              //if ac.name in ['exports','prototype']
                //keywordFound = ac.name
              //actualVar =  actualVar.findMember(ac.name)
              //if no actualVar, break
//else, if IndexAccess or function access, we exit analysis
            //else 
              //return #exit
        //end for #each accessor in lvalue, look for module.exports=...
//if we found 'exports' or 'prototype', and we reach a valid reference
        //if keywordFound and actualVar 
         // 
            //if createName # module.exports.x =... create a member
              //actualVar = .addMemberTo(actualVar,createName) # create x on module.exports
            //#try to execute assignment, so exported var points to content
            //var content = .rvalue.getResultType() 
            //if content instanceof Names.Declaration
                //actualVar.makePointTo content
//*/
//### Append to class Grammar.Expression ###
    
//#### Helper Method getResultType() returns Names.Declaration
     any Grammar_Expression_getResultType(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_Expression));
        //---------
//Try to get return type from a simple Expression
        //declare valid .root.getResultType
        
        //return .root.getResultType() # .root is Grammar.Oper or Grammar.Operand
        return __call(getResultType_,PROP(root_,this),0,NULL);// # .root is Grammar.Oper or Grammar.Operand
     return undefined;
     }
//### Append to class Grammar.Oper ###
    
//for 'into var x' oper, we declare the var, and we deduce type
//#### Method declare() 
     any Grammar_Oper_declare(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_Oper));
        //---------
       // 
        //if .intoVar # is a into-assignment operator with 'var' declaration
        if (_anyToBool(PROP(intoVar_,this)))  {// # is a into-assignment operator with 'var' declaration
            //var varRef = .right.name
            var varRef = PROP(name_,PROP(right_,this));
            //if varRef isnt instance of Grammar.VariableRef
            if (!(_instanceof(varRef,Grammar_VariableRef)))  {
                //.throwError "Expected 'variable name' after 'into var'"
                METHOD(throwError_,this)(this,1,(any_arr){any_str("Expected 'variable name' after 'into var'")});
            };
            //if varRef.accessors 
            if (_anyToBool(PROP(accessors_,varRef)))  {
                //.throwError "Expected 'simple variable name' after 'into var'"
                METHOD(throwError_,this)(this,1,(any_arr){any_str("Expected 'simple variable name' after 'into var'")});
            };
           // 
            //var opt = new Names.NameDeclOptions
            var opt = new(Names_NameDeclOptions,0,NULL);
            //opt.type = varRef.type
            PROP(type_,opt) = PROP(type_,varRef);
            //.addToScope .declareName(varRef.name,opt)
            METHOD(addToScope_,this)(this,1,(any_arr){METHOD(declareName_,this)(this,2,(any_arr){PROP(name_,varRef), opt})});
        };
     return undefined;
     }
//#### method evaluateAssignments() 
     any Grammar_Oper_evaluateAssignments(DEFAULT_ARGUMENTS){
      assert(_instanceof(this,Grammar_Oper));
      //---------
   // 
//for into-assignment operator
      //if .name is 'into' # is a into-assignment operator
      if (__is(PROP(name_,this),any_str("into")))  {// # is a into-assignment operator
//check if we've got a clear reference (into var x)
          //if .right.name instance of Grammar.VariableRef
          if (_instanceof(PROP(name_,PROP(right_,this)),Grammar_VariableRef))  {
              //declare valid .right.name.tryGetReference
              
              //var nameDecl = .right.name.tryGetReference()
              var nameDecl = __call(tryGetReference_,PROP(name_,PROP(right_,this)),0,NULL);
              //if nameDecl isnt instanceof Names.Declaration, return 
              if (!(_instanceof(nameDecl,Names_Declaration))) {return undefined;};
              //if nameDecl.findOwnMember('**proto**'), return #has a type already
              if (_anyToBool(METHOD(findOwnMember_,nameDecl)(nameDecl,1,(any_arr){any_str("**proto**")}))) {return undefined;};
//check if we've got a clear .left (value to be assigned) type
//if we do, set type for .rigth ('into var x') (unless is "null" or "undefined", they destroy type info)
              //nameDecl.assignTypeFromValue .left
              METHOD(assignTypeFromValue_,nameDecl)(nameDecl,1,(any_arr){PROP(left_,this)});
          };
      };
     return undefined;
     }
//#### Helper Method getResultType() returns Names.Declaration
     any Grammar_Oper_getResultType(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_Oper));
        //---------
//Try to get return type from this Oper (only for 'new' unary oper)
        //declare valid .right.getResultType
        
        //if .name is 'new'
        if (__is(PROP(name_,this),any_str("new")))  {
            //return .right.getResultType() #.right is Grammar.Operand
            return __call(getResultType_,PROP(right_,this),0,NULL);// #.right is Grammar.Operand
        };
     return undefined;
     }
//### Append to class Grammar.Operand ###
    
//#### Helper Method getResultType() returns Names.Declaration
     any Grammar_Operand_getResultType(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_Operand));
        //---------
//Try to get return type from this Operand
        //declare valid .name.type
        
        //declare valid .name.getResultType
        
        //declare valid .name.tryGetReference
        
        //if .name instance of Grammar.ObjectLiteral
        if (_instanceof(PROP(name_,this),Grammar_ObjectLiteral))  {
            //return .name.getResultType()
            return __call(getResultType_,PROP(name_,this),0,NULL);
        }
        //else if .name instance of Grammar.Literal
        
        else if (_instanceof(PROP(name_,this),Grammar_Literal))  {
            //return globalPrototype(.name.type)
            return Validate_globalPrototype(undefined,1,(any_arr){PROP(type_,PROP(name_,this))});
        }
        //else if .name instance of Grammar.VariableRef
        
        else if (_instanceof(PROP(name_,this),Grammar_VariableRef))  {
            //return .name.tryGetReference()
            return __call(tryGetReference_,PROP(name_,this),0,NULL);
        };
     return undefined;
     }
//### Append to class Grammar.DeclareStatement
    
//#### method declare() # pass 1, declare as props
     any Grammar_DeclareStatement_declare(DEFAULT_ARGUMENTS){
      assert(_instanceof(this,Grammar_DeclareStatement));
      //---------
//declare [all] x:type
//declare [global] var x
//declare on x
//declare valid x.y.z
     // 
      //if .specifier is 'on'
      if (__is(PROP(specifier_,this),any_str("on")))  {
          //var opt=new Names.NameDeclOptions
          var opt = new(Names_NameDeclOptions,0,NULL);
          //opt.isForward = true
          PROP(isForward_,opt) = true;
          //var reference = .tryGetFromScope(.name,opt)
          var reference = METHOD(tryGetFromScope_,this)(this,2,(any_arr){PROP(name_,this), opt});
          //if String.isCapitalized(reference.name) //let's assume is a Class
          if (_anyToBool(String_isCapitalized(undefined,1,(any_arr){PROP(name_,reference)})))  { //let's assume is a Class
              //if no reference.findOwnMember('prototype'), reference.addMember('prototype')
              if (!_anyToBool(METHOD(findOwnMember_,reference)(reference,1,(any_arr){any_str("prototype")}))) {METHOD(addMember_,reference)(reference,1,(any_arr){any_str("prototype")});};
              //reference=reference.findOwnMember('prototype')
              reference = METHOD(findOwnMember_,reference)(reference,1,(any_arr){any_str("prototype")});
          };
          //for each varDecl in .names
          any _list53=PROP(names_,this);
          { var varDecl=undefined;
          for(int varDecl__inx=0 ; varDecl__inx<_list53.value.arr->length ; varDecl__inx++){varDecl=ITEM(varDecl__inx,_list53);
          
              //.addMemberTo reference, varDecl.createNameDeclaration()
              METHOD(addMemberTo_,this)(this,2,(any_arr){reference, METHOD(createNameDeclaration_,varDecl)(varDecl,0,NULL)});
          }};// end for each in PROP(names_,this)
          
      }
//else: declare (name affinity|var) (VariableDecl,)
      //else if .specifier in ['affinity','var']
      
      else if (__in(PROP(specifier_,this),2,(any_arr){any_str("affinity"), any_str("var")}))  {
          //for each varDecl in .names
          any _list54=PROP(names_,this);
          { var varDecl=undefined;
          for(int varDecl__inx=0 ; varDecl__inx<_list54.value.arr->length ; varDecl__inx++){varDecl=ITEM(varDecl__inx,_list54);
          
            //varDecl.nameDecl = varDecl.createNameDeclaration()
            PROP(nameDecl_,varDecl) = METHOD(createNameDeclaration_,varDecl)(varDecl,0,NULL);
            //if .specifier is 'var'
            if (__is(PROP(specifier_,this),any_str("var")))  {
                //if .globVar
                if (_anyToBool(PROP(globVar_,this)))  {
                    //declare valid project.root.addToScope
                    
                    //project.root.addToScope varDecl.nameDecl
                    __call(addToScope_,PROP(root_,Validate_project),1,(any_arr){PROP(nameDecl_,varDecl)});
                }
                //else
                
                else {
                    //.addToScope varDecl.nameDecl
                    METHOD(addToScope_,this)(this,1,(any_arr){PROP(nameDecl_,varDecl)});
                };
            }
            //else if .specifier is 'affinity'
            
            else if (__is(PROP(specifier_,this),any_str("affinity")))  {
                //var classDecl = .getParent(Grammar.ClassDeclaration)
                var classDecl = METHOD(getParent_,this)(this,1,(any_arr){Grammar_ClassDeclaration});
                //if no classDecl
                if (!_anyToBool(classDecl))  {
                    //.sayErr "'declare name affinity' must be included in a class declaration"
                    METHOD(sayErr_,this)(this,1,(any_arr){any_str("'declare name affinity' must be included in a class declaration")});
                    //return
                    return undefined;
                };
                //#add as member to nameAffinity, referencing class decl (.nodeDeclared)
                //varDecl.nameDecl.nodeDeclared = classDecl
                PROP(nodeDeclared_,PROP(nameDecl_,varDecl)) = classDecl;
                //declare varDecl.name:string
                
                //nameAffinity.members.set varDecl.name.capitalized(), classDecl.nameDecl
                __call(set_,PROP(members_,Validate_nameAffinity),2,(any_arr){__call(capitalized_,PROP(name_,varDecl),0,NULL), PROP(nameDecl_,classDecl)});
            };
          }};// end for each in PROP(names_,this)
          
      };
     return undefined;
     }
//if .specifier is 'on-the-fly', the type will be converted on next passes over the created Names.Declaration.
//On the method validatePropertyAccess(), types will be switched "on the fly" 
//while checking property access.
//#### method evaluateAssignments() # Grammar.DeclareStatement ###
     any Grammar_DeclareStatement_evaluateAssignments(DEFAULT_ARGUMENTS){
      assert(_instanceof(this,Grammar_DeclareStatement));
      //---------
//Assign specific type to varRef - for the entire compilation
      //if .specifier is 'type'
      if (__is(PROP(specifier_,this),any_str("type")))  {
          //var opt = new Names.NameDeclOptions
          var opt = new(Names_NameDeclOptions,0,NULL);
          //opt.informError=true
          PROP(informError_,opt) = true;
          //if .varRef.tryGetReference(opt) into var actualVar
          var actualVar=undefined;
          if (_anyToBool((actualVar=__call(tryGetReference_,PROP(varRef_,this),1,(any_arr){opt}))))  {
              //.setTypes actualVar
              METHOD(setTypes_,this)(this,1,(any_arr){actualVar});
          };
      };
     return undefined;
     }
//#### helper method setTypes(actualVar:Names.Declaration) # Grammar.DeclareStatement ###
     any Grammar_DeclareStatement_setTypes(DEFAULT_ARGUMENTS){
      assert(_instanceof(this,Grammar_DeclareStatement));
      //---------
      // define named params
      var actualVar= argc? arguments[0] : undefined;
      //---------
//Assign types if it was declared
      //#create type on the fly, overwrite existing type
      //.setSubType actualVar,.type,'**proto**'
      METHOD(setSubType_,this)(this,3,(any_arr){actualVar, PROP(type_,this), any_str("**proto**")});
      //.setSubType actualVar,.itemType,'**item type**'
      METHOD(setSubType_,this)(this,3,(any_arr){actualVar, PROP(itemType_,this), any_str("**item type**")});
     return undefined;
     }
//#### helper method setSubType(actualVar:Names.Declaration, toSet, propName ) 
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
//Assign type if it was declared
      //if toSet #create type on the fly
      if (_anyToBool(toSet))  {// #create type on the fly
          ////var act=actualVar.findMember(propName)
          ////print "set *type* was #{act} set to #{toSet}"
          //actualVar.setMember propName, toSet
          METHOD(setMember_,actualVar)(actualVar,2,(any_arr){propName, toSet});
          //var result = actualVar.processConvertTypes()
          var result = METHOD(processConvertTypes_,actualVar)(actualVar,0,NULL);
          //if result.failures, .sayErr "can't find type '#{toSet}' in scope"
          if (_anyToBool(PROP(failures_,result))) {METHOD(sayErr_,this)(this,1,(any_arr){_concatAny(3,any_str("can't find type '"), toSet, any_str("' in scope"))});};
      };
     return undefined;
     }
//#### method validatePropertyAccess() # Grammar.DeclareStatement ###
     any Grammar_DeclareStatement_validatePropertyAccess(DEFAULT_ARGUMENTS){
      assert(_instanceof(this,Grammar_DeclareStatement));
      //---------
//declare members on the fly, with optional type
      //var actualVar:Names.Declaration
      var actualVar = undefined;
      //switch .specifier 
      any _switch5=PROP(specifier_,this);
        //case 'valid':
      if (__is(_switch5,any_str("valid"))){
            //actualVar = .tryGetFromScope(.varRef.name,{informError:true})
            actualVar = METHOD(tryGetFromScope_,this)(this,2,(any_arr){PROP(name_,PROP(varRef_,this)), new(Map,1,(any_arr){
            _newPair("informError",true)
            })
            });
            //if no actualVar, return
            if (!_anyToBool(actualVar)) {return undefined;};
            //for each ac in .varRef.accessors
            any _list55=PROP(accessors_,PROP(varRef_,this));
            { var ac=undefined;
            for(int ac__inx=0 ; ac__inx<_list55.value.arr->length ; ac__inx++){ac=ITEM(ac__inx,_list55);
            
                //declare valid ac.name
                
                //if ac isnt instance of Grammar.PropertyAccess 
                if (!(_instanceof(ac,Grammar_PropertyAccess)))  {
                    //actualVar = undefined
                    actualVar = undefined;
                    //break
                    break;
                };
               // 
                //if ac.name is 'prototype'
                if (__is(PROP(name_,ac),any_str("prototype")))  {
                    //actualVar = actualVar.findOwnMember(ac.name) or .addMemberTo(actualVar, ac.name)  
                    actualVar = (_anyToBool(__or6=METHOD(findOwnMember_,actualVar)(actualVar,1,(any_arr){PROP(name_,ac)}))? __or6 : METHOD(addMemberTo_,this)(this,2,(any_arr){actualVar, PROP(name_,ac)}));
                }
                //else
                
                else {
                    //actualVar = actualVar.findMember(ac.name) or .addMemberTo(actualVar, ac.name)
                    actualVar = (_anyToBool(__or7=METHOD(findMember_,actualVar)(actualVar,1,(any_arr){PROP(name_,ac)}))? __or7 : METHOD(addMemberTo_,this)(this,2,(any_arr){actualVar, PROP(name_,ac)}));
                };
            }};// end for each in PROP(accessors_,PROP(varRef_,this))
            //end for
            
            //if actualVar, .setTypes actualVar
            if (_anyToBool(actualVar)) {METHOD(setTypes_,this)(this,1,(any_arr){actualVar});};
      
      }
        //case 'on-the-fly':
      else if (__is(_switch5,any_str("on-the-fly"))){
            //#set type on-the-fly, from here until next type-assignment
            //#we allow more than one "declare x:type" on the same block
            //var opt=new Names.NameDeclOptions
            var opt = new(Names_NameDeclOptions,0,NULL);
            //opt.informError = true
            PROP(informError_,opt) = true;
            //if .varRef.tryGetReference(opt) into actualVar
            if (_anyToBool((actualVar=__call(tryGetReference_,PROP(varRef_,this),1,(any_arr){opt}))))  {
                //.setTypes actualVar
                METHOD(setTypes_,this)(this,1,(any_arr){actualVar});
            };
      
      };
     return undefined;
     }
//### helper function AddGlobalClasses()
    any Validate_AddGlobalClasses(DEFAULT_ARGUMENTS){
 // 
        //var nameDecl
        var nameDecl = undefined;
       // 
        //for each name in arguments.toArray()
        any _list56=_newArray(argc,arguments);
        { var name=undefined;
        for(int name__inx=0 ; name__inx<_list56.value.arr->length ; name__inx++){name=ITEM(name__inx,_list56);
        
            //nameDecl = globalScope.addMember(name)
            nameDecl = METHOD(addMember_,Validate_globalScope)(Validate_globalScope,1,(any_arr){name});
            //nameDecl.addMember 'prototype'
            METHOD(addMember_,nameDecl)(nameDecl,1,(any_arr){any_str("prototype")});
            //// add to name affinity
            //if not nameAffinity.members.has(name)
            if (!(_anyToBool(__call(has_,PROP(members_,Validate_nameAffinity),1,(any_arr){name}))))  {
                //nameAffinity.members.set name, nameDecl
                __call(set_,PROP(members_,Validate_nameAffinity),2,(any_arr){name, nameDecl});
            };
        }};// end for each in _newArray(argc,arguments)
        
    return undefined;
    }

//-------------------------
void Validate__moduleInit(void){
          Names_ConvertResult =_newClass("Names_ConvertResult", Names_ConvertResult__init, sizeof(struct Names_ConvertResult_s), Object.value.classINFOptr);
          _declareMethods(Names_ConvertResult, Names_ConvertResult_METHODS);
          _declareProps(Names_ConvertResult, Names_ConvertResult_PROPS, sizeof Names_ConvertResult_PROPS);
      
    
};
