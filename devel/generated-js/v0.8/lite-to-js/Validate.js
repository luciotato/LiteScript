// -----------
// Module Init
// -----------
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
        //logger, UniqueID

    //shim import LiteCore
    var ASTBase = require('./ASTBase.js');
    var Grammar = require('./Grammar.js');
    var Names = require('./Names.js');
    var Environment = require('./lib/Environment.js');
    var logger = require('./lib/logger.js');
    var UniqueID = require('./lib/UniqueID.js');

    //shim import LiteCore
    var LiteCore = require('./interfaces/LiteCore.js');


//---------
//Module vars:

    //var project
    var project = undefined;

    //var globalScope: Names.Declaration
    var globalScope = undefined;
    //var globalObjectProto: Names.Declaration
    var globalObjectProto = undefined;

    //var nameAffinity: Names.Declaration
    var nameAffinity = undefined;


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
//
//
//  class ClassA
//
//    properties
//      classAProp1, classAProp2
//
//    method methodA
//      this.classAProp1 = 11
//      this.classAProp2 = 12
//
//  class ClassB
//
//    properties
//      classBProp1, classBProp2
//
//    method methodB
//      this.classBProp1 = 21
//
//  var instanceB = new ClassB // implicit type
//
//  instanceB.classBprop1 = 5 // <-- this **will be caught** as "case mismatch" since classBprop1 is defined as classBProp1
//
//  var bObj = instanceB // simple assignment, implicit type
//
//  bObj.classAProp1 = 5 // <-- this **will be caught** as: object 'bObj' has no property 'classAProp1'
//
//  var xObj = callToFn() // unknown type
//
//  xObj.classBProp1 = 5 // <-- this trigger a "classBProp1 IS NOT A DECLARED PROPERTY OF xObj"
//
//  declare on xObj  // <-- this fixes it
//    classBProp1
//
//  xObj.classBProp1 = 5 // <-- this is OK now
//
//  var xObj:ClassB = callToFn() // type annotation, this also fixes it
//
//  bObj.classBProp1 = 5 // <-- this is ok
//


    //    export function launch()
    // ---------------------------
    function launch(){

//We start this module once the entire multi-node AST tree has been parsed.

//Start running passes on the AST

//#### Pass 1.0 Declarations
//Walk the tree, and call function 'declare' on every node having it.
//'declare' will create scopes, and vars in the scope.
//May inform 'DUPLICATES' and 'CASE MISMATCH' errors.

        //logger.info "- Process Declarations"
        logger.info("- Process Declarations");
        //walkAllNodesCalling 'declare'
        walkAllNodesCalling('declare');

//
//#### Pass 1.1 Declare By Assignment
//Walk the tree, and check assignments looking for: 'module.exports.x=x' and 'x.prototype.y = '.
//Treat them as declarations.
//
//        logger.info "- Declare By Assignment (support .js syntax, .exports.x=..., .prototype.x=...)"
//        walkAllNodesCalling 'declareByAssignment'

//#### Pass 1.2 connectImportRequire

        //logger.info "- Connect Imported"
        logger.info("- Connect Imported");

//validate public exports.
//set module.exports with default export object if set

        //for each moduleNode:Grammar.Module in map project.moduleCache
        var moduleNode=undefined;
        if(!project.moduleCache.dict) throw(new Error("for each in map: not a Map, no .dict property"));
        for ( var moduleNode__propName in project.moduleCache.dict){moduleNode=project.moduleCache.dict[moduleNode__propName];
            {

            //moduleNode.confirmExports
            moduleNode.confirmExports();

            //for interfaces, connect alias to vars & props
            //this is to support jQuery.fn = prototype and "append to namespace jQuery.fn" as alias to "append to namespace jQuery.prototype"
            //if moduleNode.fileInfo.isInterface
            if (moduleNode.fileInfo.isInterface) {
            
                //moduleNode.callOnSubTree "connectAlias" //only vardecls have this method
                moduleNode.callOnSubTree("connectAlias");
            };
            }
            
            }// end for each property

//handle: `import x` and `global declare x`
//Make var x point to imported module 'x' exports

        //for each moduleNode:Grammar.Module in map project.moduleCache
        var moduleNode=undefined;
        if(!project.moduleCache.dict) throw(new Error("for each in map: not a Map, no .dict property"));
        for ( var moduleNode__propName in project.moduleCache.dict){moduleNode=project.moduleCache.dict[moduleNode__propName];
          {

          //for each node in moduleNode.requireCallNodes
          for( var node__inx=0,node ; node__inx<moduleNode.requireCallNodes.length ; node__inx++){node=moduleNode.requireCallNodes[node__inx];
          

            //if node.importedModule
            if (node.importedModule) {
            

              //var parent: ASTBase
              var parent = undefined;
              //var referenceNameDecl: Names.Declaration //var where to import exported module members
              var referenceNameDecl = undefined;

              //declare valid parent.nameDecl
              

//1st, more common: if node is Grammar.ImportStatementItem

              //if node instance of Grammar.ImportStatementItem
              if (node instanceof Grammar.ImportStatementItem) {
              
                  //declare node:Grammar.ImportStatementItem
                  
                  //referenceNameDecl = node.nameDecl
                  referenceNameDecl = node.nameDecl;

//if we process a 'global declare' command (interface)
//all exported should go to the global scope.

//If the imported module exports a class, e.g.: "export default class OptionsParser",
//'importedModule.exports' points to the class 'prototype'.

                  //if node.getParent(Grammar.DeclareStatement) isnt undefined //is a "global declare"
                  if (node.getParent(Grammar.DeclareStatement) !== undefined) {
                  

                        //if not node.importedModule.movedToGlobal //already processed
                        if (!(node.importedModule.movedToGlobal)) {
                        
                            //var moveWhat = node.importedModule.exports
                            var moveWhat = node.importedModule.exports;
                            //#if the module has a export-only class, move to global with class name
                            //if moveWhat.findOwnMember('prototype') into var protoExportNameDecl
                            var protoExportNameDecl=undefined;
                            if ((protoExportNameDecl=moveWhat.findOwnMember('prototype'))) {
                            
                                //if it has a 'prototype'
                                //replace 'prototype' (on module.exports) with the class name, and add as the class
                                //protoExportNameDecl.name = protoExportNameDecl.parent.name
                                protoExportNameDecl.name = protoExportNameDecl.parent.name;
                                //project.rootModule.addToScope protoExportNameDecl
                                project.rootModule.addToScope(protoExportNameDecl);
                            }
                            //if moveWhat.findOwnMember('prototype') into var protoExportNameDecl
                            
                            else {
                                // a "declare global x", but "x.lite.md" do not export a class
                                // move all exported (namespace members) to global scope
                                //for each nameDecl in map moveWhat.members
                                var nameDecl=undefined;
                                if(!moveWhat.members.dict) throw(new Error("for each in map: not a Map, no .dict property"));
                                for ( var nameDecl__propName in moveWhat.members.dict){nameDecl=moveWhat.members.dict[nameDecl__propName];
                                    {
                                    //project.rootModule.addToScope nameDecl
                                    project.rootModule.addToScope(nameDecl);
                                    }
                                    
                                    }// end for each property
                                
                            };

                            //mark as processed
                            //node.importedModule.movedToGlobal = true
                            node.importedModule.movedToGlobal = true;
                        };

                        //we moved all to the global scope, e.g.:"declare global jQuery" do not assign to referenceNameDecl
                        //referenceNameDecl = undefined
                        referenceNameDecl = undefined;
                  };
              };

                  //else
                      //commented: is valid that some modules to export nothing
                      // e.g.: module "shims" and a main module
                      //if node.importedModule.exports.members.size is 0
                      //    node.warn "nothing exported in #{node.importedModule.fileInfo.filename}"

//
//
//else is a "require" call (VariableRef).
//Get parent node.
//
//              else
//                  parent = node.parent
//                  if parent instance of Grammar.Operand
//                     parent = node.parent.parent.parent # varRef->operand->Expression->Expression Parent
//
//get referece where import module is being assigned to
//
//                  if parent instance of Grammar.AssignmentStatement
//                      var opt = new Names.NameDeclOptions
//                      opt.informError = true
//                      declare valid parent.lvalue.tryGetReference
//                      referenceNameDecl = parent.lvalue.tryGetReference(opt)
//
//                  else if parent instance of Grammar.VariableDecl
//                      referenceNameDecl = parent.nameDecl
//
//              end if

//After determining referenceNameDecl where imported items go,
//make referenceNameDecl point to importedModule.exports

              //if referenceNameDecl
              if (referenceNameDecl) {
              
                  //referenceNameDecl.makePointTo node.importedModule.exports
                  referenceNameDecl.makePointTo(node.importedModule.exports);
              };
            };
          };// end for each in moduleNode.requireCallNodes
          
          }
          
          }// end for each property
                  // if it has a 'prototype' => it's a Function-Class
                  // else we assume all exported from module is a namespace
                  //referenceNameDecl.isNamespace = no referenceNameDecl.findOwnMember('prototype')


//#### Pass 1.3 Process "Append To" Declarations
//Since 'append to [class|object] x.y.z' statement can add to any object, we delay
//"Append To" declaration to this point, where 'x.y.z' can be analyzed and a reference obtained.
//Walk the tree, and check "Append To" Methods & Properties Declarations

        //logger.info "- Processing Append-To, extends"
        logger.info("- Processing Append-To, extends");
        //walkAllNodesCalling 'processAppendToExtends'
        walkAllNodesCalling('processAppendToExtends');


//#### Pass 2.0 Apply Name Affinity

        //logger.info "- Apply Name Affinity"
        logger.info("- Apply Name Affinity");

        //#first, try to assign type by "name affinity"
        //#(only applies when type is not specified)
        //for each nameDecl in Names.allNameDeclarations
        for( var nameDecl__inx=0,nameDecl ; nameDecl__inx<Names.allNameDeclarations.length ; nameDecl__inx++){nameDecl=Names.allNameDeclarations[nameDecl__inx];
        
            //nameDecl.assignTypebyNameAffinity()
            nameDecl.assignTypebyNameAffinity();
        };// end for each in Names.allNameDeclarations

//#### Pass 2.1 Convert Types
//for each Names.Declaration try to find the declared 'type' (string) in the scope.
//Repeat until no conversions can be made.

        //logger.info "- Converting Types"
        logger.info("- Converting Types");

        //#now try de-referencing types
        //var pass=0, sumConverted=0, sumFailures=0, lastSumFailures=0
        var 
            pass = 0
            , sumConverted = 0
            , sumFailures = 0
            , lastSumFailures = 0
        ;
        //#repeat until all converted
        //do
        do{
        

            //lastSumFailures = sumFailures
            lastSumFailures = sumFailures;
            //sumFailures = 0
            sumFailures = 0;
            //sumConverted = 0
            sumConverted = 0;

            //#process all, sum conversion failures
            //for each nameDecl in Names.allNameDeclarations
            for( var nameDecl__inx=0,nameDecl ; nameDecl__inx<Names.allNameDeclarations.length ; nameDecl__inx++){nameDecl=Names.allNameDeclarations[nameDecl__inx];
            
                //var result = nameDecl.processConvertTypes()
                var result = nameDecl.processConvertTypes();
                //sumFailures += result.failures
                sumFailures += result.failures;
                //sumConverted += result.converted
                sumConverted += result.converted;
            };// end for each in Names.allNameDeclarations
            //end for

            //pass++
            

            //pass++
            pass++;
        } while (!(sumFailures === lastSumFailures));// end loop

//Inform unconverted types as errors

        //if sumFailures #there was failures, inform al errors
        if (sumFailures) {
        
            //for each nameDecl in Names.allNameDeclarations
            for( var nameDecl__inx=0,nameDecl ; nameDecl__inx<Names.allNameDeclarations.length ; nameDecl__inx++){nameDecl=Names.allNameDeclarations[nameDecl__inx];
            
                //nameDecl.processConvertTypes({informError:true})
                nameDecl.processConvertTypes({informError: true});
            };// end for each in Names.allNameDeclarations
            
        };

//#### Pass 3 Evaluate Assignments
//Walk the scope tree, and for each assignment,
//IF L-value has no type, try to guess from R-value's result type

        //logger.info "- Evaluating Assignments"
        logger.info("- Evaluating Assignments");
        //walkAllNodesCalling 'evaluateAssignments'
        walkAllNodesCalling('evaluateAssignments');

//#### Pass 4 -Final- Validate Property Access
//Once we have all vars declared and typed, walk the AST,
//and for each VariableRef validate property access.
//May inform 'UNDECLARED PROPERTY'.

        //logger.info "- Validating Property Access"
        logger.info("- Validating Property Access");
        //walkAllNodesCalling 'validatePropertyAccess'
        walkAllNodesCalling('validatePropertyAccess');

//Inform forward declarations not fulfilled, as errors

        //for each nameDecl in Names.allNameDeclarations
        for( var nameDecl__inx=0,nameDecl ; nameDecl__inx<Names.allNameDeclarations.length ; nameDecl__inx++){nameDecl=Names.allNameDeclarations[nameDecl__inx];
        

            //if nameDecl.isForward and not nameDecl.isDummy
            if (nameDecl.isForward && !(nameDecl.isDummy)) {
            

                //nameDecl.warn "forward declared, but never found"
                nameDecl.warn("forward declared, but never found");
                //var container = nameDecl.nodeDeclared.getParent(Grammar.ClassDeclaration)
                var container = nameDecl.nodeDeclared.getParent(Grammar.ClassDeclaration);
                //if container
                if (container) {
                
                  //declare container:Grammar.ClassDeclaration
                  
                  //declare valid container.varRef.toString
                  
                  //if container.varRef, logger.warning "#{container.positionText()} more info: '#{nameDecl.name}' of '#{container.varRef.toString()}'"
                  if (container.varRef) {logger.warning('' + (container.positionText()) + " more info: '" + nameDecl.name + "' of '" + (container.varRef.toString()) + "'")};
                };
            };
        };// end for each in Names.allNameDeclarations
        
    }
    // export
    module.exports.launch = launch;

    //    export function walkAllNodesCalling(methodName:string)
    // ---------------------------
    function walkAllNodesCalling(methodName){

        //var methodSymbol = LiteCore.getSymbol(methodName)
        var methodSymbol = LiteCore.getSymbol(methodName);

        //if project.moduleCache.size is 0
        if (project.moduleCache.size === 0) {
        
            //throw new Error("walkAllNodes: no modules in moduleCache")
            throw new Error("walkAllNodes: no modules in moduleCache");
        };

//For all modules, for each node, if the specific AST node has methodName, call it

        //for each moduleNode:Grammar.Module in map project.moduleCache
        var moduleNode=undefined;
        if(!project.moduleCache.dict) throw(new Error("for each in map: not a Map, no .dict property"));
        for ( var moduleNode__propName in project.moduleCache.dict){moduleNode=project.moduleCache.dict[moduleNode__propName];
            {
            //moduleNode.callOnSubTree methodSymbol
            moduleNode.callOnSubTree(methodSymbol);
            }
            
            }// end for each property
        
    }
    // export
    module.exports.walkAllNodesCalling = walkAllNodesCalling;


    //    export function initialize(aProject)
    // ---------------------------
    function initialize(aProject){

//Initialize module vars

        //project = aProject
        project = aProject;

        //#clear global Names.Declaration list
        //Names.allNameDeclarations = []
        Names.allNameDeclarations = [];

//initialize NameAffinity

        //# project-wide name affinity for classes
        //nameAffinity = new Names.Declaration('Name Affinity',{
            //normalizeModeKeepFirstCase:true #nameAffinity members are stored: [0].Toupper()+slice(1).toLower()
            //nodeClass: Grammar.VariableDecl
            //});
        nameAffinity = new Names.Declaration('Name Affinity', {normalizeModeKeepFirstCase: true, nodeClass: Grammar.VariableDecl});

        //populateGlobalScope(aProject)

//The "scope" of rootNode is the global scope.

        //globalScope = project.rootModule.createScope()
        globalScope = project.rootModule.createScope();

//Initialize global scope
//a)non-instance values

        //var opt = new Names.DeclarationOptions
        var opt = new Names.DeclarationOptions();
        //opt.nodeClass = Grammar.VariableDecl
        opt.nodeClass = Grammar.VariableDecl;

        //globalScope.addMember 'undefined',opt
        globalScope.addMember('undefined', opt);
        //opt.value = null
        opt.value = null;
        //globalScope.addMember 'null',opt
        globalScope.addMember('null', opt);
        //opt.value = true
        opt.value = true;
        //globalScope.addMember 'true',opt
        globalScope.addMember('true', opt);
        //opt.value = false
        opt.value = false;
        //globalScope.addMember 'false',opt
        globalScope.addMember('false', opt);
        //opt.value = NaN
        opt.value = NaN;
        //globalScope.addMember 'NaN',opt
        globalScope.addMember('NaN', opt);
        //opt.value = Infinity
        opt.value = Infinity;
        //globalScope.addMember 'Infinity',opt
        globalScope.addMember('Infinity', opt);

//b) pre-create core classes, to allow the interface.md file to declare property types and return values

        //AddGlobalClasses
            //'Object', 'Function', 'Array'
            //'String', 'Number', 'Boolean'

//In JS the global environment (global|window) is a *Object*, and as such it
//*has* Object.prototype in its prototype chain, which means
//*all properties in Object.prototype are also in the global scope*

//Get hold of Object.prototype since we're using it as "parent" (__proto__) of the global scope.

        //globalObjectProto = tryGetGlobalPrototype('Object')
        AddGlobalClasses('Object', 'Function', 'Array', 'String', 'Number', 'Boolean');

//In JS the global environment (global|window) is a *Object*, and as such it
//*has* Object.prototype in its prototype chain, which means
//*all properties in Object.prototype are also in the global scope*

//Get hold of Object.prototype since we're using it as "parent" (__proto__) of the global scope.

        //globalObjectProto = tryGetGlobalPrototype('Object')
        globalObjectProto = tryGetGlobalPrototype('Object');

//Allow use of "__proto__" getter/setter on any object

        //globalObjectProto.addMember '__proto__',{nodeClass:Grammar.VariableDecl}
        globalObjectProto.addMember('__proto__', {nodeClass: Grammar.VariableDecl});

//note: 'Map' and 'NameValuePair' are declared at GlobalScopeX.interface.md

//b) create special types

//-"any" default type for vars

        //globalScope.addMember 'any',{nodeClass:Grammar.ClassDeclaration} // used for "map string to any" - Dictionaries
        globalScope.addMember('any', {nodeClass: Grammar.ClassDeclaration});

//-arguments:any*

//"arguments:any*" - arguments, type: pointer to any

//'arguments' is a local var to all functions, representing a pseudo-array witj all the arguments.
//'arguments' has only one method: `arguments.toArray()`

//we declare here the type:"pointer to any" - "any*"

        //var argumentsType = globalScope.addMember('any*',{nodeClass:Grammar.ClassDeclaration}) //  any pointer, type for "arguments"
        var argumentsType = globalScope.addMember('any*', {nodeClass: Grammar.ClassDeclaration});

//-"arguments" have only one method: "toArray()"

        //argumentsType.addMember('toArray',{
              //type:       globalPrototype('Function')
              //returnType: globalPrototype('Array')
              //nodeClass:  Grammar.FunctionDeclaration
          //})
        argumentsType.addMember('toArray', {type: globalPrototype('Function'), returnType: globalPrototype('Array'), nodeClass: Grammar.FunctionDeclaration});

//b.2) Lite-C: the Lexer replaces string interpolation with calls to `_concatAny`

        //globalScope.addMember '_concatAny',{ //used for string interpolation
              //type:       globalPrototype('Function')
              //returnType: globalPrototype('String')
              //nodeClass:  Grammar.FunctionDeclaration
        //}
        globalScope.addMember('_concatAny', {type: globalPrototype('Function'), returnType: globalPrototype('String'), nodeClass: Grammar.FunctionDeclaration});

        //globalScope.addMember 'parseFloat',{
              //type:       globalPrototype('Function')
              //returnType: globalPrototype('Number')
              //nodeClass:  Grammar.FunctionDeclaration
              //}
        globalScope.addMember('parseFloat', {type: globalPrototype('Function'), returnType: globalPrototype('Number'), nodeClass: Grammar.FunctionDeclaration});

        //globalScope.addMember 'parseInt',{
              //type:       globalPrototype('Function')
              //returnType: globalPrototype('Number')
              //nodeClass:  Grammar.FunctionDeclaration
              //}
        globalScope.addMember('parseInt', {type: globalPrototype('Function'), returnType: globalPrototype('Number'), nodeClass: Grammar.FunctionDeclaration});

        //globalScope.addMember '__dirname',{ // current module dir (node.js)
              //type:       globalPrototype('String')
              //nodeClass:  Grammar.VariableDecl
              //}
        globalScope.addMember('__dirname', {type: globalPrototype('String'), nodeClass: Grammar.VariableDecl});

//Process the global scope declarations interface file: GlobalScopeJS|C.interface.md

        //processInterfaceFile 'GlobalScope#{project.options.target.toUpperCase()}'
        processInterfaceFile('GlobalScope' + (project.options.target.toUpperCase()));

//if we're compiling for node.js, add extra node global core objects, e.g: process, Buffer

        //if project.options.target is 'js' and not project.options.browser
        if (project.options.target === 'js' && !(project.options.browser)) {
        
            //processInterfaceFile 'GlobalScopeNODE'
            processInterfaceFile('GlobalScopeNODE');
        };

//Initial NameAffinity, err|xxxErr => type:Error

        //if tryGetGlobalPrototype('Error') into var errProto:Names.Declaration
        var errProto=undefined;
        if ((errProto=tryGetGlobalPrototype('Error'))) {
        
            //nameAffinity.members.set 'Err',errProto.parent // err|xxxErr => type:Error
            nameAffinity.members.set('Err', errProto.parent);
        };
    }
    // export
    module.exports.initialize = initialize;

    //    helper function processInterfaceFile(globalInterfaceFile)
    // ---------------------------
    function processInterfaceFile(globalInterfaceFile){

//Process the global scope declarations interface file: GlobalScope(JS|C|NODE).interface.md

        //logger.info 'Declare global scope using #{globalInterfaceFile}.interface.md'
        logger.info('Declare global scope using ' + globalInterfaceFile + '.interface.md');
        //var globalInterfaceModule = project.compileFile(globalInterfaceFile)
        var globalInterfaceModule = project.compileFile(globalInterfaceFile);
        //logger.info '    from:',globalInterfaceModule.fileInfo.relFilename
        logger.info('    from:', globalInterfaceModule.fileInfo.relFilename);

//call "declare" on each item of the GlobalScope interface file, to create the NameDeclarations

        //globalInterfaceModule.callOnSubTree LiteCore.getSymbol('declare')
        globalInterfaceModule.callOnSubTree(LiteCore.getSymbol('declare'));

//move all exported from the interface file, to project.rootModule global scope

        //for each nameDecl in map globalInterfaceModule.exports.members
        var nameDecl=undefined;
        if(!globalInterfaceModule.exports.members.dict) throw(new Error("for each in map: not a Map, no .dict property"));
        for ( var nameDecl__propName in globalInterfaceModule.exports.members.dict){nameDecl=globalInterfaceModule.exports.members.dict[nameDecl__propName];
            {
            //project.rootModule.addToSpecificScope globalScope, nameDecl
            project.rootModule.addToSpecificScope(globalScope, nameDecl);
            }
            
            }// end for each property
        
    };


//----------

//## Module Helper Functions

    //    helper function tryGetGlobalPrototype(name)
    // ---------------------------
    function tryGetGlobalPrototype(name){
//gets a var from global scope

      //if globalScope.findOwnMember(name) into var nameDecl
      var nameDecl=undefined;
      if ((nameDecl=globalScope.findOwnMember(name))) {
      
          //return nameDecl.members.get("prototype")
          return nameDecl.members.get("prototype");
      };
    };

    //    public helper function globalPrototype(name)
    // ---------------------------
    function globalPrototype(name){
//gets a var from global scope

      //if name instanceof Names.Declaration, return name #already converted type
      if (name instanceof Names.Declaration) {return name};

      //if not globalScope.findOwnMember(name) into var nameDecl
      var nameDecl=undefined;
      if (!((nameDecl=globalScope.findOwnMember(name)))) {
      
        //fail with "no '#{name}' in global scope"
        throw new Error("no '" + name + "' in global scope");
      };

      //if no nameDecl.findOwnMember("prototype") into var protoNameDecl
      var protoNameDecl=undefined;
      if (!((protoNameDecl=nameDecl.findOwnMember("prototype")))) {
      
        //fail with "global scope type '#{name}' must have a 'prototype' property"
        throw new Error("global scope type '" + name + "' must have a 'prototype' property");
      };

      //return protoNameDecl
      return protoNameDecl;
    }
    // export
    module.exports.globalPrototype = globalPrototype;


    //    helper function addBuiltInClass(name,node) returns Names.Declaration
    // ---------------------------
    function addBuiltInClass(name, node){
//Add a built-in class to global scope, return class prototype

      //var nameDecl = new Names.Declaration( name, {nodeClass:Grammar.ClassDeclaration} ,node )
      var nameDecl = new Names.Declaration(name, {nodeClass: Grammar.ClassDeclaration}, node);
      //globalScope.addMember nameDecl
      globalScope.addMember(nameDecl);

      //nameDecl.getMembersFromObjProperties Environment.getGlobalObject(name)
      nameDecl.getMembersFromObjProperties(Environment.getGlobalObject(name));

      //if no nameDecl.findOwnMember("prototype") into var classProto:Names.Declaration
      var classProto=undefined;
      if (!((classProto=nameDecl.findOwnMember("prototype")))) {
      
          //throw new Error("addBuiltInClass '#{name}, expected to have a prototype")
          throw new Error("addBuiltInClass '" + name + ", expected to have a prototype");
      };

      //nameDecl.setMember '**proto**', globalPrototype('Function')
      nameDecl.setMember('**proto**', globalPrototype('Function'));
      // commented v0.8: classes can not be used as functions.
      // nameDecl.setMember '**return type**', classProto

      //return classProto
      return classProto;
    };


    //    helper function addBuiltInObject(name,node) returns Names.Declaration
    // ---------------------------
    function addBuiltInObject(name, node){
//Add a built-in object to global scope, return object

      //var nameDecl = new Names.Declaration(name, {nodeClass:Grammar.NamespaceDeclaration}, node)
      var nameDecl = new Names.Declaration(name, {nodeClass: Grammar.NamespaceDeclaration}, node);
      //globalScope.addMember nameDecl
      globalScope.addMember(nameDecl);
      //nameDecl.getMembersFromObjProperties Environment.getGlobalObject(name)
      nameDecl.getMembersFromObjProperties(Environment.getGlobalObject(name));

      //if nameDecl.findOwnMember("prototype")
      if (nameDecl.findOwnMember("prototype")) {
      
          //throw new Error("addBuiltObject '#{name}, expected *Object* to have not a prototype")
          throw new Error("addBuiltObject '" + name + ", expected *Object* to have not a prototype");
      };

      //return nameDecl
      return nameDecl;
    };

//---------------------------------------
//----------------------------------------
//----------------------------------------

    //    append to namespace Names
    

      //class ConvertResult
      // constructor
      function ConvertResult(initializer){ // default constructor
        //properties
          //converted:number=0
          //failures:number=0
            this.converted=0;
            this.failures=0;
          for(prop in initializer) if (initializer.hasOwnProperty(prop)) this[prop]=initializer[prop];};
      Names.ConvertResult=ConvertResult;
      
      // end class ConvertResult
      

//##Additions to Names.Declaration. Helper methods to do validation

    //    append to class Names.Declaration
    

     //     helper method findMember(name) returns Names.Declaration
     // ---------------------------
     Names.Declaration.prototype.findMember = function(name){
//this method looks for a name in Names.Declaration members,
//it also follows the **proto** chain (same mechanism as js __proto__ chain)

        //var actual = this
        var actual = this;
        //var count=0
        var count = 0;

        //do while actual instance of Names.Declaration
        while(actual instanceof Names.Declaration){

            //if actual.findOwnMember(name) into var result
            var result=undefined;
            if ((result=actual.findOwnMember(name))) {
            
               //return result
               return result;
            };

//We use a member named '**proto**' on NameDeclarations, mapping run-time proto chain.
//We follow the chain to validate property names.

            //var nextInChain = actual.findOwnMember('**proto**')
            var nextInChain = actual.findOwnMember('**proto**');

//As last option in the chain, we always use 'Object.prototype'

            //if no nextInChain and actual isnt globalObjectProto
            if (!nextInChain && actual !== globalObjectProto) {
            
              //nextInChain = globalObjectProto
              nextInChain = globalObjectProto;
            };

            //actual = nextInChain
            actual = nextInChain;

            //if count++ > 50 #assume circular
            if (count++ > 50) {
            
                //.warn "circular type reference"
                this.warn("circular type reference");
                //return
                return;
            };
        };// end loop
        
     };


     //     helper method hasProto(name) returns boolean
     // ---------------------------
     Names.Declaration.prototype.hasProto = function(name){
//this method looks for a name in Names.Declaration members **proto**->prototype->parent
//it also follows the **proto** chain (same mechanism as js __proto__ chain)

        //var actual = this
        var actual = this;
        //var count=0
        var count = 0;

        //do while actual instance of Names.Declaration
        while(actual instanceof Names.Declaration){

            //if actual.name is 'prototype' and actual.parent.name is name
            if (actual.name === 'prototype' && actual.parent.name === name) {
            
                //return true
                return true;
            };

//We use a member named '**proto**' on NameDeclarations, mapping run-time proto chain.
//We follow the chain to validate property names.

            //var nextInChain = actual.findOwnMember('**proto**')
            var nextInChain = actual.findOwnMember('**proto**');

//As last option in the chain, we always use 'Object.prototype'

            //if no nextInChain and actual isnt globalObjectProto
            if (!nextInChain && actual !== globalObjectProto) {
            
                //nextInChain = globalObjectProto
                nextInChain = globalObjectProto;
            };

            //actual = nextInChain
            actual = nextInChain;

            //if count++ > 50 #assume circular
            if (count++ > 50) {
            
                //.warn "circular type reference"
                this.warn("circular type reference");
                //return
                return;
            };
        };// end loop
        
     };

     //     helper method getMembersFromObjProperties(obj) #Recursive
     // ---------------------------
     Names.Declaration.prototype.getMembersFromObjProperties = function(obj){
//Recursively converts a obj properties in NameDeclarations.
//it's used when a pure.js module is imported by 'require'
//to convert required 'exports' to LiteScript compiler usable NameDeclarations
//Also to load the global scope with built-in objects

        //ifdef TARGET_C
        //return
        //else
        //var newMember:Names.Declaration
        var newMember = undefined;

        //if obj instanceof Object or obj is Object.prototype
        if (obj instanceof Object || obj === Object.prototype) {
        
            //declare obj:array //to allow js's property access []
            
            //for each prop in Object.getOwnPropertyNames(obj) #even not enumerables
            var _list3=Object.getOwnPropertyNames(obj);
            for( var prop__inx=0,prop ; prop__inx<_list3.length ; prop__inx++){prop=_list3[prop__inx];
              if(['__proto__', 'arguments', 'caller'].indexOf(prop)===-1){

                    //var type =  Grammar.autoCapitalizeCoreClasses(typeof obj[prop])
                    var type = Grammar.autoCapitalizeCoreClasses(typeof obj[prop]);
                    //type = tryGetGlobalPrototype(type) #core classes: Function, Object, String
                    type = tryGetGlobalPrototype(type);
                    //if type is this, type = undefined #avoid circular references
                    if (type === this) {type = undefined};

                    //newMember = .addMember(prop,{type:type})
                    newMember = this.addMember(prop, {type: type});

//on 'prototype' member or
//if member is a Function-class - dive into

                    //declare valid Object.hasOwnProperty.call
                    
                    //if prop isnt 'constructor'
                    if (prop !== 'constructor') {
                    
                        //if  prop is 'prototype'
                        if (prop === 'prototype' || (typeof obj[prop] === 'function' && obj[prop].hasOwnProperty('prototype') && !(this.isInParents(prop))) || (typeof obj[prop] === 'object' && !(this.isInParents(prop)))) {
                        
                              //newMember.getMembersFromObjProperties(obj[prop]) #recursive
                              newMember.getMembersFromObjProperties(obj[prop]);
                              //if prop is 'super_' # used in node's core modules: http, EventEmitter, etc.
                              if (prop === 'super_') {
                              
                                  //if newMember.findOwnMember('prototype') into var superProtopNameDecl
                                  var superProtopNameDecl=undefined;
                                  if ((superProtopNameDecl=newMember.findOwnMember('prototype'))) {
                                  
                                    //var protopNameDecl = .findOwnMember('prototype') or .addMember('prototype')
                                    var protopNameDecl = this.findOwnMember('prototype') || this.addMember('prototype');
                                    //protopNameDecl.setMember '**proto**', superProtopNameDecl #put super's proto in **proto** of prototype
                                    protopNameDecl.setMember('**proto**', superProtopNameDecl);
                                  };
                              };
                        };
                    };
            }};// end for each in Object.getOwnPropertyNames(obj)
            
        };
     };

        //end if



     //     helper method isInParents(name)
     // ---------------------------
     Names.Declaration.prototype.isInParents = function(name){
//return true if a property name is in the parent chain.
//Used to avoid recursing circular properties

        //var nameDecl = this.parent
        var nameDecl = this.parent;
        //while nameDecl
        while(nameDecl){
          //if nameDecl.findOwnMember(name), return true
          if (nameDecl.findOwnMember(name)) {return true};
          //nameDecl = nameDecl.parent
          nameDecl = nameDecl.parent;
        };// end loop
        
     };


     //     helper method processConvertTypes(options:Names.DeclarationOptions) returns Names.ConvertResult
     // ---------------------------
     Names.Declaration.prototype.processConvertTypes = function(options){
//convert possible types stored in Names.Declaration,
//from string/varRef to other NameDeclarations in the scope

        //var result = new Names.ConvertResult
        var result = new Names.ConvertResult();

        //.convertType '**proto**',result,options  #try convert main type
        this.convertType('**proto**', result, options);
        //.convertType '**return type**',result,options  #a Function can have **return type**
        this.convertType('**return type**', result, options);
        //.convertType '**item type**',result,options  #an Array can have **item type** e.g.: 'var list: string array'
        this.convertType('**item type**', result, options);

        //return result
        return result;
     };


     //     helper method convertType(internalName, result: Names.ConvertResult, options: Names.DeclarationOptions)
     // ---------------------------
     Names.Declaration.prototype.convertType = function(internalName, result, options){
//convert type from string to NameDeclarations in the scope.
//returns 'true' if converted, 'false' if it has to be tried later

        //if no .findOwnMember(internalName) into var typeRef
        var typeRef=undefined;
        if (!((typeRef=this.findOwnMember(internalName)))) {
        
            //#nothing to process
            //return
            return;
        };

        //if typeRef instance of Names.Declaration
        if (typeRef instanceof Names.Declaration) {
        
            //#already converted, nothing to do
            //return
            return;
        };

        //if typeRef instance of Grammar.TypeDeclaration
        if (typeRef instanceof Grammar.TypeDeclaration) {
        
            //declare valid typeRef.mainType
            
            //typeRef = typeRef.mainType
            typeRef = typeRef.mainType;
        };

        //var converted:Names.Declaration
        var converted = undefined;

        //# if the typeRef is a varRef, get reference
        //if typeRef instanceof Grammar.VariableRef
        if (typeRef instanceof Grammar.VariableRef) {
        
            //declare typeRef:Grammar.VariableRef
            
            //converted = typeRef.tryGetReference()
            converted = typeRef.tryGetReference();
        }
        //if typeRef instanceof Grammar.VariableRef
        
        else if (typeof typeRef === 'string') {
        

            //if no .nodeDeclared #converting typeRef for a var not declared in code
            if (!this.nodeDeclared) {
            
              //converted = globalPrototype(typeRef)
              converted = globalPrototype(typeRef);
            }
            //if no .nodeDeclared #converting typeRef for a var not declared in code
            
            else {
              //converted = .nodeDeclared.findInScope(typeRef)
              converted = this.nodeDeclared.findInScope(typeRef);
            };
            //end if

        //else
            
        }
        //else if typeof typeRef is 'string' #built-in class or local var
        
        else {
            //declare valid typeRef.constructor.name
            
            //.sayErr "INTERNAL ERROR: convertType UNRECOGNIZED type of:'#{typeof typeRef}' on #{internalName}: '#{typeRef}' [#{typeRef.constructor.name}]"
            this.sayErr("INTERNAL ERROR: convertType UNRECOGNIZED type of:'" + (typeof typeRef) + "' on " + internalName + ": '" + typeRef + "' [" + typeRef.constructor.name + "]");
            //return
            return;
        };

        //end if #check instance of "typeRef"


        //if converted
        


        //if converted
        if (converted) {
        
            //#move to prototype if referenced is a class
            //if converted.findOwnMember("prototype") into var prototypeNameDecl
            var prototypeNameDecl=undefined;
            if ((prototypeNameDecl=converted.findOwnMember("prototype"))) {
            
                //converted = prototypeNameDecl
                converted = prototypeNameDecl;
            };
            //#store converted
            //.setMember(internalName,converted)
            this.setMember(internalName, converted);
            //result.converted++
            result.converted++;
        }
        //if converted
        
        else {
            //result.failures++
            result.failures++;
            //if options and options.informError, .sayErr "Undeclared type: '#{typeRef.toString()}'"
            if (options && options.informError) {this.sayErr("Undeclared type: '" + (typeRef.toString()) + "'")};
        };
        //end if

        //return
        

        //return
        return;
     };


     //     helper method assignTypeFromValue(value)
     // ---------------------------
     Names.Declaration.prototype.assignTypeFromValue = function(value){
//if we can determine assigned value type, set var type

      //declare valid value.getResultType:function
      
      //var valueNameDecl = value.getResultType()
      var valueNameDecl = value.getResultType();

//now set var type (unless is "null" or "undefined", because they destroy type info)

      //if valueNameDecl instance of Names.Declaration
      if (valueNameDecl instanceof Names.Declaration && ["undefined", "null"].indexOf(valueNameDecl.name)===-1) {
      

            //var theType
            var theType = undefined;
            //if valueNameDecl.name is 'prototype' # getResultType returns a class prototype
            if (valueNameDecl.name === 'prototype') {
            
                // use the class as type
                //theType = valueNameDecl
                theType = valueNameDecl;
            }
            //if valueNameDecl.name is 'prototype' # getResultType returns a class prototype
            
            else {
                //we assume valueNameDecl is a simple var, then we try to get **proto**
                //theType = valueNameDecl.findOwnMember('**proto**') or valueNameDecl
                theType = valueNameDecl.findOwnMember('**proto**') || valueNameDecl;
            };
            //end if

            // assign type: now both nameDecls points to same type
            //.setMember '**proto**', theType
            

            // assign type: now both nameDecls points to same type
            //.setMember '**proto**', theType
            this.setMember('**proto**', theType);
      };
     };



     //     helper method assignTypebyNameAffinity()
     // ---------------------------
     Names.Declaration.prototype.assignTypebyNameAffinity = function(){
//Auto-assign type by name affinity.
//If no type specified, check project.nameAffinity

        //if .nodeDeclared and not String.isCapitalized(.name) and .name isnt 'prototype'
        if (this.nodeDeclared && !(String.isCapitalized(this.name)) && this.name !== 'prototype') {
        

            //if not .findOwnMember('**proto**')
            if (!(this.findOwnMember('**proto**'))) {
            

                //var possibleClassRef:Names.Declaration
                var possibleClassRef = undefined;
                //# possibleClassRef is a Names.Declaration whose .nodeDeclared is a ClassDeclaration

                //#should look as className. Also when searching with "endsWith",
                //# nameAffinity declarations are stored capitalized
                //var asClassName = .name.capitalized()
                var asClassName = this.name.capitalized();

                //# look in name affinity map
                //if no nameAffinity.members.get(.name) into possibleClassRef
                if (!((possibleClassRef=nameAffinity.members.get(this.name)))) {
                
                    //# make first letter uppercase, e.g.: convert 'lexer' to 'Lexer'
                    //# try with name, 1st letter capitalized
                    //possibleClassRef = nameAffinity.members.get(asClassName)
                    possibleClassRef = nameAffinity.members.get(asClassName);
                };
                //end if

                //# check 'ends with' if name is at least 6 chars in length
                //if not possibleClassRef and .name.length>=6
                

                //# check 'ends with' if name is at least 6 chars in length
                //if not possibleClassRef and .name.length>=6
                if (!(possibleClassRef) && this.name.length >= 6) {
                
                    //for each affinityName,classRef in map nameAffinity.members
                    var classRef=undefined;
                    if(!nameAffinity.members.dict) throw(new Error("for each in map: not a Map, no .dict property"));
                    for ( var affinityName in nameAffinity.members.dict){classRef=nameAffinity.members.dict[affinityName];
                        {
                        //if asClassName.endsWith(affinityName)
                        if (asClassName.endsWith(affinityName)) {
                        
                            //possibleClassRef = classRef
                            possibleClassRef = classRef;
                            //break
                            break;
                        };
                        }
                        
                        }// end for each property
                    
                };

                //#if there is a candidate class, check of it has a defined prototype
                //if possibleClassRef and possibleClassRef.findOwnMember("prototype") into var prototypeNameDecl
                var prototypeNameDecl=undefined;
                if (possibleClassRef && (prototypeNameDecl=possibleClassRef.findOwnMember("prototype"))) {
                
                      //.setMember '**proto**', prototypeNameDecl
                      this.setMember('**proto**', prototypeNameDecl);
                      //return true
                      return true;
                };
            };
        };
     };


//--------------------------------
//## Helper methods added to AST Tree

    //    append to class ASTBase
    

     //     properties
        //scope: Names.Declaration //for nodes with scope

     //     helper method declareName(name, options:Names.DeclarationOptions)
     
     //     properties
        //scope: Names.Declaration //for nodes with scope

     //     helper method declareName(name, options:Names.DeclarationOptions)
     // ---------------------------
     ASTBase.prototype.declareName = function(name, options){
//declareName creates a new Names.Declaration, *referecing source as nodeDeclared (AST node)*

        //return new Names.Declaration(name, options, this)
        return new Names.Declaration(name, options, this);
     };

     //     method addMemberTo(nameDecl, memberName, options:Names.DeclarationOptions)  returns Names.Declaration
     // ---------------------------
     ASTBase.prototype.addMemberTo = function(nameDecl, memberName, options){
//a Helper method ASTBase.*addMemberTo*
//Adds a member to a NameDecl, referencing this node as nodeDeclared

        //return nameDecl.addMember(memberName, options, this)
        return nameDecl.addMember(memberName, options, this);
     };

     //     helper method tryGetMember(nameDecl, name:string, options:Names.DeclarationOptions)
     // ---------------------------
     ASTBase.prototype.tryGetMember = function(nameDecl, name, options){
//this method looks for a specific member, optionally declare as forward
//or inform error. We need this AST node, to correctly report error.

        //default options = new Names.DeclarationOptions
        if(options===undefined) options=new Names.DeclarationOptions();

        //var found = nameDecl.findMember(name)
        var found = nameDecl.findMember(name);

        //if found and name.slice(0,2) isnt '**'
        if (found && name.slice(0, 2) !== '**') {
        
          //found.caseMismatch name,this
          found.caseMismatch(name, this);
        }
        //if found and name.slice(0,2) isnt '**'
        
        else {

          //if options.informError
          if (options.informError) {
          
                //logger.warning "#{.positionText()}. No member named '#{name}' on #{nameDecl.info()}"
                logger.warning('' + (this.positionText()) + ". No member named '" + name + "' on " + (nameDecl.info()));
          };

          //if options.isForward, found = .addMemberTo(nameDecl,name,options)
          if (options.isForward) {found = this.addMemberTo(nameDecl, name, options)};
        };

        //return found
        return found;
     };


     //     helper method getScopeNode()
     // ---------------------------
     ASTBase.prototype.getScopeNode = function(){

//**getScopeNode** method return the parent 'scoped' node in the hierarchy.
//It looks up until found a node with .scope

//Start at this node

        //var node = this
        var node = this;

        //while node
        while(node){

          //if node.scope
          if (node.scope) {
          
              //return node # found a node with scope
              return node;
          };

          //node = node.parent # move up
          node = node.parent;
        };// end loop

        //#loop

        //return null
        return null;
     };


     //     method findInScope(name) returns Names.Declaration
     // ---------------------------
     ASTBase.prototype.findInScope = function(name){
//this method looks for the original place
//where a name was defined (function,method,var)
//Returns the Identifier node from the original scope
//It's used to validate variable references to be previously declared names

//Start at this node

        //var node = this
        var node = this;
        //var found
        var found = undefined;

//Look for the declaration in this scope

        //while node
        while(node){

          //if node.scope
          if (node.scope) {
          

              //if node.scope.findOwnMember(name) into found
              if ((found=node.scope.findOwnMember(name))) {
              
                  //return found
                  return found;
              };
          };

//move up in scopes

          //node = node.parent
          node = node.parent;
        };// end loop

        //#loop

//In JS the global environment (global|window) is a *Object*, and as such it
//*has* Object.prototype in its prototype chain, which means
//*all properties in Object.prototype are also in the global scope*

//**To emulate JS (quirky) behavior, if a name is not found in any scope up to global scope,
//we must search also Object.prototype (since is __proto__ of global scope object).
//This help alleviating subtle bugs in js, if tou dare to add something to Object.prototype.

        //if globalObjectProto.findOwnMember(name) into found
        if ((found=globalObjectProto.findOwnMember(name))) {
        
            //return found
            return found;
        };
     };


     //     method tryGetFromScope(name, options:Names.DeclarationOptions) returns Names.Declaration
     // ---------------------------
     ASTBase.prototype.tryGetFromScope = function(name, options){
//a Helper method: *ASTBase.tryGetFromScope(name)*, this method looks for the original declaration
//in the scope. if the declaration is not found, an error is emmited and a -pseudo- var is created
//in the scope in order to continue compilation

//Check if the name is declared. Retrieve the original declaration

//if it's already a Names.Declaration, no need to search

        //if name instanceof Names.Declaration, return name
        if (name instanceof Names.Declaration) {return name};

//Search the scope

        //if .findInScope(name) into var found
        var found=undefined;
        if ((found=this.findInScope(name))) {
        

//Declaration found, we check the upper/lower case to be consistent
//If the found item has a different case than the name we're looking for, emit error

            //if found.caseMismatch(name, this)
            if (found.caseMismatch(name, this)) {
            
                //return found
                return found;
            };
            //end if

//if it is not found,check options: a) inform error. b) declare foward.

        //else
            
        }
        //if .findInScope(name) into var found
        
        else {
            //if options and options.informError
            if (options && options.informError) {
            
                //.sayErr "UNDECLARED NAME: '#{name}'"
                this.sayErr("UNDECLARED NAME: '" + name + "'");
            };

            //if options and options.isForward
            if (options && options.isForward) {
            
                //found = .addToScope(name,options)
                found = this.addToScope(name, options);
                //if options.isDummy and String.isCapitalized(name) #let's assume is a class
                if (options.isDummy && String.isCapitalized(name)) {
                
                    //.addMemberTo(found,'prototype',options)
                    this.addMemberTo(found, 'prototype', options);
                };
            };
        };

        //#end if - check declared variables

        //return found
        return found;
     };


     //     method addToScope(item, options:Names.DeclarationOptions) returns Names.Declaration
     // ---------------------------
     ASTBase.prototype.addToScope = function(item, options){
//a Helper method ASTBase.*addToScope*
//Search for parent Scope, adds passed name to scope.members
//Reports duplicated.
//return: Names.Declaration

        //if no item, return # do nothing on undefined params
        if (!item) {return};

        //var scope:Names.Declaration = .getScopeNode().scope
        var scope = this.getScopeNode().scope;

        //return .addToSpecificScope(scope, item, options)
        return this.addToSpecificScope(scope, item, options);
     };

//First search it to report duplicates, if found in the scope.
//If the found item has a different case than the name we're adding, emit error & return

     //     method addToSpecificScope(scope:Names.Declaration, item, options:Names.DeclarationOptions) returns Names.Declaration
     // ---------------------------
     ASTBase.prototype.addToSpecificScope = function(scope, item, options){

        //declare valid item.name
        
        //var name = type of item is 'string'? item : item.name
        var name = typeof item === 'string' ? item : item.name;

        //logger.debug "addToScope: '#{name}' to '#{scope.name}'" #[#{.constructor.name}] name:
        logger.debug("addToScope: '" + name + "' to '" + scope.name + "'");

        //if .findInScope(name) into var found
        var found=undefined;
        if ((found=this.findInScope(name))) {
        

            //if found.caseMismatch(name, this)
            if (found.caseMismatch(name, this)) {
            
                //#case mismatch informed
                //do nothing
                null;
            }
            //if found.caseMismatch(name, this)
            
            else if (found.isForward) {
            
                //found.isForward = false
                found.isForward = false;
                //found.nodeDeclared = this
                found.nodeDeclared = this;
                //if item instanceof Names.Declaration
                if (item instanceof Names.Declaration) {
                
                    //found.replaceForward item
                    found.replaceForward(item);
                };
            }
            //else if found.isForward
            
            else {
                //var errPosNode:ASTBase = item instanceof Names.Declaration? item else this
                var errPosNode = item instanceof Names.Declaration ? item : this;
                //errPosNode.sayErr "DUPLICATED name in scope: '#{name}'"
                errPosNode.sayErr("DUPLICATED name in scope: '" + name + "'");
                //logger.error found.originalDeclarationPosition() #add extra information line
                logger.error(found.originalDeclarationPosition());
            };

            //return found
            return found;
        };

        //#end if

//else, not found, add it to the scope

        //var nameDecl
        var nameDecl = undefined;
        //if item instanceof Names.Declaration
        if (item instanceof Names.Declaration) {
        
          //nameDecl = item
          nameDecl = item;
        }
        //if item instanceof Names.Declaration
        
        else {
          //nameDecl = .declareName(name,options)
          nameDecl = this.declareName(name, options);
        };

        //scope.addMember nameDecl
        scope.addMember(nameDecl);

        //return nameDecl
        return nameDecl;
     };


     //     helper method createScope()
     // ---------------------------
     ASTBase.prototype.createScope = function(){
//initializes an empty scope in this node

        //if no .scope
        if (!this.scope) {
        

            //.scope = .declareName("[#{.constructor.name} #{.name} Scope]", {
                  //normalizeModeKeepFirstCase:true
                  //nodeClass: Grammar.VariableDecl
                  //})
            this.scope = this.declareName("[" + this.constructor.name + " " + this.name + " Scope]", {normalizeModeKeepFirstCase: true, nodeClass: Grammar.VariableDecl});

            //.scope.isScope = true
            this.scope.isScope = true;
        };

        //return .scope
        return this.scope;
     };

     //     helper method tryGetOwnerNameDecl( informError ) returns Names.Declaration
     // ---------------------------
     ASTBase.prototype.tryGetOwnerNameDecl = function(informError){

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
        var parent = this.getParent(Grammar.ClassDeclaration);

        //if no parent
        if (!parent) {
        
           //if informError, .throwError "declaration is outside 'class/namespace/append to'. Check indent"
           if (informError) {this.throwError("declaration is outside 'class/namespace/append to'. Check indent")};
           //return
           return;
        };

//Append to class|namespace

        //if parent instance of Grammar.AppendToDeclaration
        if (parent instanceof Grammar.AppendToDeclaration) {
        

            //#get varRefOwner from AppendToDeclaration
            //declare parent:Grammar.AppendToDeclaration
            

            //toNamespace = parent.toNamespace #if it was 'append to namespace'
            toNamespace = parent.toNamespace;

            //#get referenced class/namespace
            //if no parent.varRef.tryGetReference() into ownerDecl
            if (!((ownerDecl=parent.varRef.tryGetReference()))) {
            
                //if informError
                if (informError) {
                
                    //.sayErr "Append to: '#{parent.varRef}'. Reference is not fully declared"
                    this.sayErr("Append to: '" + parent.varRef + "'. Reference is not fully declared");
                };
                //return //if no ownerDecl found
                return;
            };
        }
        //if parent instance of Grammar.AppendToDeclaration
        
        else {

            //toNamespace = parent.constructor is Grammar.NamespaceDeclaration
            toNamespace = parent.constructor === Grammar.NamespaceDeclaration;

            //ownerDecl = parent.nameDecl
            ownerDecl = parent.nameDecl;
            //if no ownerDecl
            if (!ownerDecl) {
            

                //if parent.hasAdjective('shim') // it was a shim class|namespace
                if (parent.hasAdjective('shim')) {
                
                    //ownerDecl = .findInScope(parent.name) //get pre-existent
                    ownerDecl = this.findInScope(parent.name);
                };

                //if no ownerDecl
                if (!ownerDecl) {
                
                    //return .sayErr("cannot get parent name declaration")
                    return this.sayErr("cannot get parent name declaration");
                };
            };
        };

        //end if


//check if owner is class (namespace) or class.prototype (class)


        //if toNamespace
        


//check if owner is class (namespace) or class.prototype (class)


        //if toNamespace
        if (toNamespace) {
        
            //#'append to namespace'/'namespace x'. Members are added directly to owner
            //return ownerDecl
            return ownerDecl;
        }
        //if toNamespace
        
        else {
            //# Class: members are added to the prototype
            //# move to class prototype
            //if no ownerDecl.findOwnMember("prototype") into var ownerDeclProto
            var ownerDeclProto=undefined;
            if (!((ownerDeclProto=ownerDecl.findOwnMember("prototype")))) {
            
                //if informError, .sayErr "Class '#{ownerDecl}' has no .prototype"
                if (informError) {this.sayErr("Class '" + ownerDecl + "' has no .prototype")};
                //return
                return;
            };

            //# Class: members are added to the prototype
            //return ownerDeclProto
            return ownerDeclProto;
        };

        //end if


     //     helper method callOnSubTree(methodSymbol,excludeClass) # recursive
        
     };


     //     helper method callOnSubTree(methodSymbol,excludeClass) # recursive
     // ---------------------------
     ASTBase.prototype.callOnSubTree = function(methodSymbol, excludeClass){

//This is instance has the method, call the method on the instance

      //logger.debugGroup "callOnSubTree #{.constructor.name}.#{LiteCore.getSymbolName(methodSymbol)}() - '#{.name}'"

      //if this.tryGetMethod(methodSymbol) into var theFunction:Function
      var theFunction=undefined;
      if ((theFunction=this.tryGetMethod(methodSymbol))) {
      
            //logger.debug "calling #{.constructor.name}.#{LiteCore.getSymbolName(methodSymbol)}() - '#{.name}'"
            logger.debug("calling " + this.constructor.name + "." + (LiteCore.getSymbolName(methodSymbol)) + "() - '" + this.name + "'");
            //theFunction.call(this)
            theFunction.call(this);
      };

      //if excludeClass and this is instance of excludeClass, return #do not recurse on filtered's childs
      if (excludeClass && this instanceof excludeClass) {return};

//recurse on all properties (exclude 'parent' and 'importedModule' and others, shortcut-references)

      //for each property name,value in this
      var value=undefined;
      for ( var name in this){value=this[name];
            if(['constructor', 'parent', 'importedModule', 'requireCallNodes', 'constructorDeclaration'].indexOf(name)===-1){

            //if value instance of ASTBase
            if (value instanceof ASTBase) {
            
                //declare value:ASTBase
                
                //value.callOnSubTree methodSymbol,excludeClass #recurse
                value.callOnSubTree(methodSymbol, excludeClass);
            }
            //if value instance of ASTBase
            
            else if (value instanceof Array) {
            
                //declare value:array
                
                //logger.debug "callOnSubArray #{.constructor.name}.#{name}[]"
                //for each item in value where item instance of ASTBase
                for( var item__inx=0,item ; item__inx<value.length ; item__inx++){item=value[item__inx];
                  if(item instanceof ASTBase){
                    //declare item:ASTBase
                    
                    //item.callOnSubTree methodSymbol,excludeClass
                    item.callOnSubTree(methodSymbol, excludeClass);
                }};// end for each in value
                
            };
            }
            
            }// end for each property
      //end for

      //logger.debugGroupEnd


    //    append to class Grammar.Module ###
      
     };

      //logger.debugGroupEnd


    //    append to class Grammar.Module ###
    

     //     helper method addToExport(exportedNameDecl)
     // ---------------------------
     Grammar.Module.prototype.addToExport = function(exportedNameDecl){

//Add to parentModule.exports, but *preserve parent*

      //#just add to actual exports, but preserve parent
      //var saveParent = exportedNameDecl.parent
      var saveParent = exportedNameDecl.parent;

      //.exports.addMember(exportedNameDecl)
      this.exports.addMember(exportedNameDecl);

      //exportedNameDecl.parent = saveParent
      exportedNameDecl.parent = saveParent;
     };


     //     helper method confirmExports()
     // ---------------------------
     Grammar.Module.prototype.confirmExports = function(){

//Check that:
//- if we have a "default export" (a class/namespace named as the module)
  //- we cannot have other vars or functions declared public/export
  //- replace module.exports with the default export object

      //var exportDefaultNameDecl
      var exportDefaultNameDecl = undefined;

//search for a export default object (a class/namespace named as the module)

      //for each nameDecl in map .exports.members
      var nameDecl=undefined;
      if(!this.exports.members.dict) throw(new Error("for each in map: not a Map, no .dict property"));
      for ( var nameDecl__propName in this.exports.members.dict){nameDecl=this.exports.members.dict[nameDecl__propName];
          {
          //if nameDecl.nodeDeclared and nameDecl.nodeDeclared.hasAdjective('only export')
          if (nameDecl.nodeDeclared && nameDecl.nodeDeclared.hasAdjective('only export')) {
          
              //exportDefaultNameDecl = nameDecl
              exportDefaultNameDecl = nameDecl;
              //break
              break;
          };
          }
          
          }// end for each property

      //if exportDefaultNameDecl
      if (exportDefaultNameDecl) {
      

          //if .exports.getMemberCount() > 1
          if (this.exports.getMemberCount() > 1) {
          
              //only one "export-only" allowed
              //for each nameDecl in map .exports.members
              var nameDecl=undefined;
              if(!this.exports.members.dict) throw(new Error("for each in map: not a Map, no .dict property"));
              for ( var nameDecl__propName in this.exports.members.dict){nameDecl=this.exports.members.dict[nameDecl__propName];
              if(nameDecl !== exportDefaultNameDecl && nameDecl.parent !== exportDefaultNameDecl){
                  //nameDecl.warn 'only export: cannot have "public functions/vars" and also a *only export* class/namespace'
                  nameDecl.warn('only export: cannot have "public functions/vars" and also a *only export* class/namespace');
                  }
                  
                  }// end for each property
              
          };

          //set as namespace & replace module.exports
          //.exports.makePointTo exportDefaultNameDecl
          this.exports.makePointTo(exportDefaultNameDecl);
          //.exports.name = exportDefaultNameDecl.name
          this.exports.name = exportDefaultNameDecl.name;
          //.exportsReplaced = true
          this.exportsReplaced = true;
      };
     };


//----
//## Methods added to specific Grammar Classes to handle scope, var & members declaration

    //    append to class Grammar.VariableDecl ###
    

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
      
      //properties nameDecl

      //helper method createNameDeclaration()
      // ---------------------------
      Grammar.VariableDecl.prototype.createNameDeclaration = function(){
        //declare .type: Grammar.TypeDeclaration
        
        //return .declareName(.name,{type:.type})
        return this.declareName(this.name, {type: this.type});
      };

      //helper method declareInScope()
      // ---------------------------
      Grammar.VariableDecl.prototype.declareInScope = function(){
          //.nameDecl = .addToScope(.createNameDeclaration())
          this.nameDecl = this.addToScope(this.createNameDeclaration());
      };

      //helper method connectAlias()
      // ---------------------------
      Grammar.VariableDecl.prototype.connectAlias = function(){
          //if .aliasVarRef
          if (this.aliasVarRef) {
          
              //Example: "public var $ = jQuery" => declare alias $ for jQuery
              //if .aliasVarRef.tryGetReference({informError:true}) into var ref
              var ref=undefined;
              if ((ref=this.aliasVarRef.tryGetReference({informError: true}))) {
              
                  //# aliases share .members
                  //.nameDecl.members = ref.members
                  this.nameDecl.members = ref.members;
              };
          };
      };

      //helper method getTypeFromAssignedValue()
      // ---------------------------
      Grammar.VariableDecl.prototype.getTypeFromAssignedValue = function(){

          // if it has an assigned value
          //if .nameDecl and .assignedValue and .nameDecl.name isnt 'prototype'
          if (this.nameDecl && this.assignedValue && this.nameDecl.name !== 'prototype') {
          

              //if .assignedValue instanceof Grammar.Expression
              var type=undefined;
              if (this.assignedValue instanceof Grammar.Expression && [Grammar.StringLiteral, Grammar.NumberLiteral].indexOf(this.assignedValue.root.name.constructor)>=0) {
              
                    //var theLiteral = .assignedValue.root.name
                    var theLiteral = this.assignedValue.root.name;
                    // if it is assigning a literal, force type to string|number|array
                    //.nameDecl.setMember('**proto**', globalPrototype(theLiteral.type))
                    this.nameDecl.setMember('**proto**', globalPrototype(theLiteral.type));
              }
              //if .assignedValue instanceof Grammar.Expression
              
              else if (!((type=this.nameDecl.findOwnMember('**proto**')))) {
              
                  //if .assignedValue.getResultType() into var result #get assignedValue type
                  var result=undefined;
                  if ((result=this.assignedValue.getResultType())) {
                  
                      //.nameDecl.setMember('**proto**', result) #assign to this.nameDecl
                      this.nameDecl.setMember('**proto**', result);
                  };
              };
          };
      };


    //    append to class Grammar.VarStatement ###
    

     //method declare()  # pass 1
     // ---------------------------
     Grammar.VarStatement.prototype.declare = function(){

        //var moduleNode:Grammar.Module = .getParent(Grammar.Module)
        var moduleNode = this.getParent(Grammar.Module);

        //for each varDecl in .list
        for( var varDecl__inx=0,varDecl ; varDecl__inx<this.list.length ; varDecl__inx++){varDecl=this.list[varDecl__inx];
        

            //varDecl.declareInScope
            varDecl.declareInScope();

            //if .hasAdjective("export")
            if (this.hasAdjective("export")) {
            

                //moduleNode.addToExport varDecl.nameDecl
                moduleNode.addToExport(varDecl.nameDecl);

                //mark as isPublicVar to prepend "module.exports.x" when referenced in module body
                // except interfaces (no body & vars are probably aliases. case: public var $=jQuery)
                //if not moduleNode.fileInfo.isInterface
                if (!(moduleNode.fileInfo.isInterface)) {
                
                      //varDecl.nameDecl.isPublicVar = true
                      varDecl.nameDecl.isPublicVar = true;
                };
            };
        };// end for each in this.list
        
     };


     //method evaluateAssignments() # pass 4, determine type from assigned value
     // ---------------------------
     Grammar.VarStatement.prototype.evaluateAssignments = function(){
        //for each varDecl in .list
        for( var varDecl__inx=0,varDecl ; varDecl__inx<this.list.length ; varDecl__inx++){varDecl=this.list[varDecl__inx];
        
            //varDecl.getTypeFromAssignedValue
            varDecl.getTypeFromAssignedValue();
        };// end for each in this.list
        
     };


    //    append to class Grammar.WithStatement ###
    

      //properties nameDecl
      
      //properties nameDecl

      //method declare()  # pass 1
      // ---------------------------
      Grammar.WithStatement.prototype.declare = function(){
         //.nameDecl = .addToScope(.declareName(.name))
         this.nameDecl = this.addToScope(this.declareName(this.name));
      };

      //method evaluateAssignments() # pass 4, determine type from assigned value
      // ---------------------------
      Grammar.WithStatement.prototype.evaluateAssignments = function(){
        //.nameDecl.assignTypeFromValue .varRef
        this.nameDecl.assignTypeFromValue(this.varRef);
      };


    //    append to class Grammar.ImportStatementItem ###
    

      //properties nameDecl
      
      //properties nameDecl

      //method declare #pass 1: declare name choosen for imported(required) contents as a scope var
      // ---------------------------
      Grammar.ImportStatementItem.prototype.declare = function(){

        //if no .getParent(Grammar.DeclareStatement) #except for 'global declare'
        if (!this.getParent(Grammar.DeclareStatement)) {
        

            //if .hasAdjective('shim') and .findInScope(.name), return // do not import if shim and already declared
            if (this.hasAdjective('shim') && this.findInScope(this.name)) {return};

            //.nameDecl = .addToScope(.name)
            this.nameDecl = this.addToScope(this.name);
        };
      };


//----------------------------
//
//### Append to class Grammar.NamespaceDeclaration
//
//#### method declare()
//
//        .nameDecl = .addToScope(.declareName(.name))
//
//        .createScope


    //    append to class Grammar.ClassDeclaration
    
//also AppendToDeclaration and NamespaceDeclaration (child classes).

     //     properties

      //nameDecl

     //     method declare()
     
     //     properties

      //nameDecl

     //     method declare()
     // ---------------------------
     Grammar.ClassDeclaration.prototype.declare = function(){

//AppendToDeclarations do not "declare" anything at this point.

        //if this.constructor is Grammar.AppendToDeclaration, return
        if (this.constructor === Grammar.AppendToDeclaration) {return};

//AppendToDeclarations add to a existing classes or namespaces.
//The adding is delayed until pass:"processAppendToExtends",
//where append-To var reference is searched in the scope
//and methods and properties are added.
//This need to be done after all declarations.

//if is a class adjectivated "shim", do not declare if already exists

        //if .hasAdjective('shim')
        if (this.hasAdjective('shim')) {
        
            //if .tryGetFromScope(.name)
            if (this.tryGetFromScope(this.name)) {
            
                //return
                return;
            };
        };

//Check if it is a class or a namespace

        //var isNamespace = this.constructor is Grammar.NamespaceDeclaration
        var isNamespace = this.constructor === Grammar.NamespaceDeclaration;
        //var isClass = this.constructor is Grammar.ClassDeclaration
        var isClass = this.constructor === Grammar.ClassDeclaration;

        //if isNamespace
        if (isNamespace) {
        

//declare the namespace

            //.nameDecl = .declareName(.name)
            this.nameDecl = this.declareName(this.name);
        }
        //if isNamespace
        
        else {

//declare the class

            //.nameDecl = .declareName(.name, {type:globalPrototype('Function')} ) //class
            this.nameDecl = this.declareName(this.name, {type: globalPrototype('Function')});
        };

        //end if

//if has adjective "global" add to global scope

        //if .hasAdjective('global')
        

//if has adjective "global" add to global scope

        //if .hasAdjective('global')
        if (this.hasAdjective('global')) {
        
            //globalScope.addMember .nameDecl
            globalScope.addMember(this.nameDecl);
        }
        //if .hasAdjective('global')
        
        else {
            //var container = .getParent(Grammar.NamespaceDeclaration)
            var container = this.getParent(Grammar.NamespaceDeclaration);

//if it is declared inside a namespace, it becomes a item of the namespace

            //if container
            if (container) {
            
                //declare container: Grammar.NamespaceDeclaration
                
                //container.nameDecl.addMember .nameDecl
                container.nameDecl.addMember(this.nameDecl);
            }
            //if container
            
            else {
                //check for "append to"
                //container = .getParent(Grammar.AppendToDeclaration)
                container = this.getParent(Grammar.AppendToDeclaration);
                //if container
                if (container) {
                
                    //do nothing //will be handled later in processAppendToExtends()
                    null;
                }
                //if container
                
                else {
                    //else, is a module-level class|namespace. Add to scope
                    //.addToScope .nameDecl
                    this.addToScope(this.nameDecl);
                };
            };
        };

//export:

//if has adjective public/export, add to module.exports

        //if .hasAdjective('export')
        if (this.hasAdjective('export')) {
        
            //var moduleNode:Grammar.Module = .getParent(Grammar.Module)
            var moduleNode = this.getParent(Grammar.Module);
            //moduleNode.addToExport .nameDecl
            moduleNode.addToExport(this.nameDecl);
        };


//if it is a Class, we create 'Class.prototype' member
//Class's properties & methods will be added to 'prototype' as valid member members.
//'prototype' starts with 'constructor' which is a pointer to the class-funcion itself

        //if isClass
        if (isClass) {
        
            //var prtypeNameDecl = .nameDecl.findOwnMember('prototype') or .addMemberTo(.nameDecl,'prototype')
            var prtypeNameDecl = this.nameDecl.findOwnMember('prototype') || this.addMemberTo(this.nameDecl, 'prototype');
            //if .varRefSuper
            if (this.varRefSuper) {
            
                //prtypeNameDecl.setMember('**proto**',.varRefSuper)
                prtypeNameDecl.setMember('**proto**', this.varRefSuper);
            };
            //else
            //    prtypeNameDecl.setMember('**proto**',globalObjectProto)

            //prtypeNameDecl.addMember('constructor',{pointsTo:.nameDecl})
            prtypeNameDecl.addMember('constructor', {pointsTo: this.nameDecl});

//return type of the class-function, is the prototype

            //.nameDecl.setMember '**return type**',prtypeNameDecl
            this.nameDecl.setMember('**return type**', prtypeNameDecl);

//add to nameAffinity

            //if not nameAffinity.members.has(.name)
            if (!(nameAffinity.members.has(this.name))) {
            
                //nameAffinity.members.set .name, .nameDecl
                nameAffinity.members.set(this.name, this.nameDecl);
            };
        };
     };


     //     method validatePropertyAccess()
     // ---------------------------
     Grammar.ClassDeclaration.prototype.validatePropertyAccess = function(){

//in the pass "Validating Property Access", for a "ClassDeclaration"
//we check for duplicate property names in the super-class-chain

        //if .constructor isnt Grammar.ClassDeclaration, return // exclude derived classes
        if (this.constructor !== Grammar.ClassDeclaration) {return};

        //var prt:Names.Declaration = .nameDecl.ownMember('prototype')
        var prt = this.nameDecl.ownMember('prototype');
        //for each propNameDecl in map prt.members where propNameDecl.nodeClass is Grammar.VariableDecl
        var propNameDecl=undefined;
        if(!prt.members.dict) throw(new Error("for each in map: not a Map, no .dict property"));
        for ( var propNameDecl__propName in prt.members.dict){propNameDecl=prt.members.dict[propNameDecl__propName];
        if(propNameDecl.nodeClass === Grammar.VariableDecl){
                //propNameDecl.checkSuperChainProperties .nameDecl.superDecl
                propNameDecl.checkSuperChainProperties(this.nameDecl.superDecl);
                }
                
                }// end for each property
        
     };




    //    append to class Grammar.ArrayLiteral ###
    

     //properties nameDecl
     
     //properties nameDecl

     //method declare
     // ---------------------------
     Grammar.ArrayLiteral.prototype.declare = function(){

//When producing C-code, an ArrayLiteral creates a "new(Array" at module level

        //if project.options.target is 'c'
        if (project.options.target === 'c') {
        
            //.nameDecl = .declareName(UniqueID.getVarName('_literalArray'))
            this.nameDecl = this.declareName(UniqueID.getVarName('_literalArray'));
            //.getParent(Grammar.Module).addToScope .nameDecl
            this.getParent(Grammar.Module).addToScope(this.nameDecl);
        };
     };

     //method getResultType
     // ---------------------------
     Grammar.ArrayLiteral.prototype.getResultType = function(){
          //return tryGetGlobalPrototype('Array')
          return tryGetGlobalPrototype('Array');
     };


    //    append to class Grammar.ObjectLiteral ###
    

     //properties nameDecl
     
     //properties nameDecl

     //method declare
     // ---------------------------
     Grammar.ObjectLiteral.prototype.declare = function(){

//When producing js-code, an ObjectLiteral declares a new ad-hoc "type".
//The var is assigned this ad-hoc "type"

//When producing c-code, an ObjectLiteral creates a "Map string to any" on the fly,
//so *it does not declare a type with members*

        //if project.options.target is 'js'
        if (project.options.target === 'js') {
        

//if the .parent has a .nameDecl we copy that so members get added there.
//if it does not, create a new one (we're a interal LiteralObject, 'value'
//of a name:value pair)

          //.nameDecl = .parent.tryGetProperty('nameDecl')
          this.nameDecl = this.parent.tryGetProperty('nameDecl');

          //if no .nameDecl
          if (!this.nameDecl) {
          
              //.nameDecl = .declareName(UniqueID.getVarName('*ObjectLiteral*'))
              this.nameDecl = this.declareName(UniqueID.getVarName('*ObjectLiteral*'));
          };
        };
     };

//When producing the LiteScript-to-C compiler, a ObjectLiteral's return type is 'Map string to any'

//When producing js-code is the ad-hoc type created for the ObjectLiteral

     //method getResultType
     // ---------------------------
     Grammar.ObjectLiteral.prototype.getResultType = function(){

        //if project.options.target is 'c'
        if (project.options.target === 'c') {
        
            //return tryGetGlobalPrototype('Map')
            return tryGetGlobalPrototype('Map');
        }
        //if project.options.target is 'c'
        
        else {
            //return  .nameDecl
            return this.nameDecl;
        };
     };


    //    append to class Grammar.NameValuePair ###
    

     //properties nameDecl
     
     //properties nameDecl

     //method declare
     // ---------------------------
     Grammar.NameValuePair.prototype.declare = function(){

//When producing C-code, a ObjectLiteral creates a "Map string to any" on the fly,
//but it does not declare a valid type/class.

        //if project.options.target is 'c', return
        if (project.options.target === 'c') {return};

//Add this name as member of the parent ObjectLiteral/Value

        //declare .parent: Grammar.ObjectLiteral
        
        //.nameDecl = .addMemberTo(.parent.nameDecl, .name)
        this.nameDecl = this.addMemberTo(this.parent.nameDecl, this.name);

//check if we can determine type from value

        //if .type and .type instance of Names.Declaration and .type.name not in ["undefined","null"]
        if (this.type && this.type instanceof Names.Declaration && ["undefined", "null"].indexOf(this.type.name)===-1) {
        
            //.nameDecl.setMember '**proto**', .type
            this.nameDecl.setMember('**proto**', this.type);
        }
        //if .type and .type instance of Names.Declaration and .type.name not in ["undefined","null"]
        
        else if (this.value) {
        
            //.nameDecl.assignTypeFromValue .value
            this.nameDecl.assignTypeFromValue(this.value);
        };
     };

    //    append to class Grammar.FunctionDeclaration ###
    
//`FunctionDeclaration: '[export][generator] (function|method|constructor) [name] '(' FunctionParameterDecl* ')' Block`

     //properties
        //nameDecl
        //declared:boolean

     //     method declare() ## function, methods and constructors
     
     //properties
        //nameDecl
        //declared:boolean

     //     method declare() ## function, methods and constructors
     // ---------------------------
     Grammar.FunctionDeclaration.prototype.declare = function(){

      //var ownerNameDecl
      var ownerNameDecl = undefined;
      //var isMethod = .constructor is Grammar.MethodDeclaration
      var isMethod = this.constructor === Grammar.MethodDeclaration;
      //var isFunction = .constructor is Grammar.FunctionDeclaration
      var isFunction = this.constructor === Grammar.FunctionDeclaration;

//1st: Grammar.FunctionDeclaration

//if it is not anonymous, add function name to parent scope,
//if its 'public/export' (or we're processing an "interface" file), add to exports

      //if isFunction
      if (isFunction) {
      

          //.nameDecl = .addToScope(.name)
          this.nameDecl = this.addToScope(this.name);

          //if .hasAdjective('export')
          if (this.hasAdjective('export')) {
          
              //var moduleNode:Grammar.Module=.getParent(Grammar.Module)
              var moduleNode = this.getParent(Grammar.Module);
              //moduleNode.addToExport .nameDecl
              moduleNode.addToExport(this.nameDecl);
          };
      }
      //if isFunction
      
      else if ((ownerNameDecl=this.tryGetOwnerNameDecl())) {
      

          //if .constructor isnt Grammar.ConstructorDeclaration
          if (this.constructor !== Grammar.ConstructorDeclaration) {
          
              //the constructor is the Function-Class itself
              // so it is not a member function
              //.addMethodToOwnerNameDecl ownerNameDecl
              this.addMethodToOwnerNameDecl(ownerNameDecl);
          };
      };

      //end if

//Define function's return type from parsed text

      //var returnType = .createReturnType()
      

//Define function's return type from parsed text

      //var returnType = .createReturnType()
      var returnType = this.createReturnType();

//Functions (methods and constructors also), have a 'scope'.
//It captures al vars declared in its body.
//We now create function's scope and add the special var 'this'.
//The 'type' of 'this' is normally a class prototype,
//which contains other methods and properties from the class.
//We also add 'arguments.length'

//Scope starts populated by 'this' and 'arguments'.

      //var scope = .createScope()
      var scope = this.createScope();

      //.addMemberTo scope,'arguments', {type:'any*', nodeClass:Grammar.VariableDecl}
      this.addMemberTo(scope, 'arguments', {type: 'any*', nodeClass: Grammar.VariableDecl});


      // NOTE: in js there's a "this" everywhere. In browser mode,
      // "this" on a global function is normally used when such function is registered as
      // a DOM node event handler (this=DOM node triggering the event)

      //var typeOfThis
      var typeOfThis = undefined;

      //if isFunction
      if (isFunction) {
      
          //for "functions" add a "this" without type
          //do nothing
          null;
      }
      //if isFunction
      
      else {
          //for "methods", "this" :type is the class prototype

          //if no .getParent(Grammar.ClassDeclaration) into var containerClassDeclaration //also append-to & NamespaceDeclaration
          var containerClassDeclaration=undefined;
          if (!((containerClassDeclaration=this.getParent(Grammar.ClassDeclaration)))) {
          
              //.sayErr "method outside class|namespace|apeend-to"
              this.sayErr("method outside class|namespace|apeend-to");
              //return
              return;
          };

          //if containerClassDeclaration.constructor is Grammar.ClassDeclaration
          if (containerClassDeclaration.constructor === Grammar.ClassDeclaration) {
          
              //typeOfThis = ownerNameDecl
              typeOfThis = ownerNameDecl;
          }
          //if containerClassDeclaration.constructor is Grammar.ClassDeclaration
          
          else if (containerClassDeclaration.constructor === Grammar.AppendToDeclaration) {
          
              //declare containerClassDeclaration:Grammar.AppendToDeclaration
              
              //typeOfThis = containerClassDeclaration.varRef
              typeOfThis = containerClassDeclaration.varRef;
          };
      };

      //end if //select typeOfThis

      //.addMemberTo(scope,'this',{type:typeOfThis,nodeClass:Grammar.VariableDecl})
      

      //.addMemberTo(scope,'this',{type:typeOfThis,nodeClass:Grammar.VariableDecl})
      this.addMemberTo(scope, 'this', {type: typeOfThis, nodeClass: Grammar.VariableDecl});

//Note: only class methods have 'this' as parameter

//add parameters to function's scope

      //if .paramsDeclarations
      if (this.paramsDeclarations) {
      
          //for each varDecl in .paramsDeclarations.list
          for( var varDecl__inx=0,varDecl ; varDecl__inx<this.paramsDeclarations.list.length ; varDecl__inx++){varDecl=this.paramsDeclarations.list[varDecl__inx];
          
              //varDecl.declareInScope
              varDecl.declareInScope();
          };// end for each in this.paramsDeclarations.list
          
      };
     };


     //     helper method addMethodToOwnerNameDecl(owner:Names.Declaration)  ## methods
     // ---------------------------
     Grammar.FunctionDeclaration.prototype.addMethodToOwnerNameDecl = function(owner){

      //var actual = owner.findOwnMember(.name)
      var actual = owner.findOwnMember(this.name);

      //if actual and .hasAdjective('shim') #shim for an exising method, do nothing
      if (actual && this.hasAdjective('shim')) {
      
        //return
        return;
      };

//Add to owner, type is 'Function'

      //if no .nameDecl
      if (!this.nameDecl) {
      
          //.nameDecl = .declareName(.name,{type:globalPrototype('Function')})
          this.nameDecl = this.declareName(this.name, {type: globalPrototype('Function')});
      };

      //.declared = true
      this.declared = true;

      //.addMemberTo owner, .nameDecl
      this.addMemberTo(owner, this.nameDecl);
     };


     //     method createReturnType() ## functions & methods
     // ---------------------------
     Grammar.FunctionDeclaration.prototype.createReturnType = function(){

      //if no .nameDecl, return #nowhere to put definitions
      if (!this.nameDecl) {return};

      //.nameDecl.setMember "**proto**", globalPrototype('Function')
      this.nameDecl.setMember("**proto**", globalPrototype('Function'));

//Define function's return type from parsed text

      //if .type and .type.itemType
      if (this.type && this.type.itemType) {
      

//if there's a "itemType", it means type is: `array of [itemType]`
//We create a intermediate type for `Array of itemType`
//and set this new nameDecl as function's **return type**

          //var composedName = 'Array of #{.type.itemType.toString()}'
          var composedName = 'Array of ' + (this.type.itemType.toString());

//check if it already exists, if not found, create one. Type is 'Array'

          //if not globalScope.findMember(composedName) into var intermediateNameDecl
          var intermediateNameDecl=undefined;
          if (!((intermediateNameDecl=globalScope.findMember(composedName)))) {
          
              //intermediateNameDecl = globalScope.addMember(composedName, {
                    //type:globalPrototype('Array')
                    //nodeClass:Grammar.ClassDeclaration
                    //})
              intermediateNameDecl = globalScope.addMember(composedName, {type: globalPrototype('Array'), nodeClass: Grammar.ClassDeclaration});
          };

//item type, is each array member's type

          //intermediateNameDecl.setMember "**item type**", .type.itemType
          intermediateNameDecl.setMember("**item type**", this.type.itemType);

          //.nameDecl.setMember '**return type**', intermediateNameDecl
          this.nameDecl.setMember('**return type**', intermediateNameDecl);
      }
      //if .type and .type.itemType
      
      else {

          //if .type, .nameDecl.setMember('**return type**', .type)
          if (this.type) {this.nameDecl.setMember('**return type**', this.type)};
      };
     };


    //    append to class Grammar.AppendToDeclaration ###
    

     //     method processAppendToExtends()
     // ---------------------------
     Grammar.AppendToDeclaration.prototype.processAppendToExtends = function(){

//get referenced class/namespace

      //if no .varRef.tryGetReference() into var ownerDecl
      var ownerDecl=undefined;
      if (!((ownerDecl=this.varRef.tryGetReference()))) {
      
          //.sayErr "Append to: '#{.varRef}'. Reference is not fully declared"
          this.sayErr("Append to: '" + this.varRef + "'. Reference is not fully declared");
          //return //if no ownerDecl found
          return;
      };

      //if not .toNamespace
      if (!(this.toNamespace)) {
      
          //if is "append to class"
          //if no ownerDecl.findOwnMember('prototype') into var prt
          var prt=undefined;
          if (!((prt=ownerDecl.findOwnMember('prototype')))) {
          
              //.throwError "Append to: class '#{ownerDecl}' has no prototype"
              this.throwError("Append to: class '" + ownerDecl + "' has no prototype");
          };

          //ownerDecl=prt // append to class, adds to prototype
          ownerDecl = prt;
      };

      //if project.options.target is 'c'
      //    if .toNamespace and prt
      //        .sayErr "Append to: '#{.varRef}'. For C production, cannot append to class as namespace."

      //for each item in .body.statements
      for( var item__inx=0,item ; item__inx<this.body.statements.length ; item__inx++){item=this.body.statements[item__inx];
      

          //case item.specific.constructor
          
              //when Grammar.PropertiesDeclaration:
          if (
              (item.specific.constructor==Grammar.PropertiesDeclaration)
          ){
                  //declare item.specific:Grammar.PropertiesDeclaration
                  
                  //if not item.specific.declared, item.specific.declare(informError=true)
                  if (!(item.specific.declared)) {item.specific.declare(true)};
          
          }
              //when Grammar.MethodDeclaration:
          else if (
              (item.specific.constructor==Grammar.MethodDeclaration)
          ){
                  //var m:Grammar.MethodDeclaration = item.specific
                  var m = item.specific;
                  //if m.declared, continue
                  if (m.declared) {continue};

//Now that we have 'owner' we can set **proto** for scope var 'this',
//so we can later validate `.x` in `this.x = 7`

                  //m.addMethodToOwnerNameDecl ownerDecl
                  m.addMethodToOwnerNameDecl(ownerDecl);

                  //if m.scope.findOwnMember("this") into var scopeThis
                  var scopeThis=undefined;
                  if ((scopeThis=m.scope.findOwnMember("this"))) {
                  
                      //scopeThis.setMember '**proto**',ownerDecl
                      scopeThis.setMember('**proto**', ownerDecl);
                      //#set also **return type**
                      //m.createReturnType
                      m.createReturnType();
                  };
          
          }
              //when Grammar.ClassDeclaration:
          else if (
              (item.specific.constructor==Grammar.ClassDeclaration)
          ){
                  //declare item.specific:Grammar.ClassDeclaration
                  
                  //ownerDecl.addMember item.specific.nameDecl
                  ownerDecl.addMember(item.specific.nameDecl);
          
          }
              //when Grammar.EndStatement:
          else if (
              (item.specific.constructor==Grammar.EndStatement)
          ){
                  //do nothing
                  null;
          
          }
          else {
                  //.sayErr 'unexpected "#{item.specific.constructor.name}" inside Append-to Declaration'
                  this.sayErr('unexpected "' + item.specific.constructor.name + '" inside Append-to Declaration');
          };
      };// end for each in this.body.statements
      
     };


    //    append to class Names.Declaration ###
    
     //     properties
      //superDecl : Names.Declaration //nameDecl of the super class

     //     method checkSuperChainProperties(superClassNameDecl)
     
     //     properties
      //superDecl : Names.Declaration //nameDecl of the super class

     //     method checkSuperChainProperties(superClassNameDecl)
     // ---------------------------
     Names.Declaration.prototype.checkSuperChainProperties = function(superClassNameDecl){

        //if no superClassNameDecl, return
        if (!superClassNameDecl) {return};

//Check for duplicate class properties in the super class

        //if superClassNameDecl.findOwnMember('prototype') into var superPrt:Names.Declaration
        var superPrt=undefined;
        if ((superPrt=superClassNameDecl.findOwnMember('prototype'))) {
        

            //if superPrt.findOwnMember(.name) into var originalNameDecl
            var originalNameDecl=undefined;
            if ((originalNameDecl=superPrt.findOwnMember(this.name))) {
            
                //.sayErr "Duplicated property. super class [#{superClassNameDecl}] already has a property '#{this}'"
                this.sayErr("Duplicated property. super class [" + superClassNameDecl + "] already has a property '" + this + "'");
                //originalNameDecl.sayErr "for reference, original declaration."
                originalNameDecl.sayErr("for reference, original declaration.");
            };

//recurse with super's super. Here we're using recursion as a loop device à la Haskell
//(instead of a simpler "while .superDecl into node" loop. Just to be fancy)

            //.checkSuperChainProperties superClassNameDecl.superDecl
            this.checkSuperChainProperties(superClassNameDecl.superDecl);
        };
     };

    //    append to class Grammar.ClassDeclaration ###
    

     //     method processAppendToExtends()
     // ---------------------------
     Grammar.ClassDeclaration.prototype.processAppendToExtends = function(){
//In Class's processAppendToExtends we try to get a reference to the superclass
//and then store the superclass nameDecl in the class nameDecl

//get referenced super class

      //if .varRefSuper
      if (this.varRefSuper) {
      
          //if no .varRefSuper.tryGetReference() into var superClassNameDecl
          var superClassNameDecl=undefined;
          if (!((superClassNameDecl=this.varRefSuper.tryGetReference()))) {
          
              //.sayErr "class #{.name} extends '#{.varRefSuper}'. Reference is not fully declared"
              this.sayErr("class " + this.name + " extends '" + this.varRefSuper + "'. Reference is not fully declared");
              //return //if no superClassNameDecl found
              return;
          };

          //.nameDecl.superDecl = superClassNameDecl
          this.nameDecl.superDecl = superClassNameDecl;
      };
     };

    //    append to class Grammar.PropertiesDeclaration ###
    

     //properties
        //nameDecl
        //declared:boolean

     //     method declare(informError)
     
     //properties
        //nameDecl
        //declared:boolean

     //     method declare(informError)
     // ---------------------------
     Grammar.PropertiesDeclaration.prototype.declare = function(informError){
//Add all properties as members of its owner object (normally: class.prototype)

        //if .tryGetOwnerNameDecl(informError) into var ownerNameDecl
        var ownerNameDecl=undefined;
        if ((ownerNameDecl=this.tryGetOwnerNameDecl(informError))) {
        

            //for each varDecl in .list
            for( var varDecl__inx=0,varDecl ; varDecl__inx<this.list.length ; varDecl__inx++){varDecl=this.list[varDecl__inx];
            
                //varDecl.nameDecl = varDecl.addMemberTo(ownerNameDecl,varDecl.name,{type:varDecl.type})
                varDecl.nameDecl = varDecl.addMemberTo(ownerNameDecl, varDecl.name, {type: varDecl.type});
            };// end for each in this.list
            //end for

            //.declared = true
            

            //.declared = true
            this.declared = true;
        };
     };

     //     method evaluateAssignments() # determine type from assigned value on properties declaration
     // ---------------------------
     Grammar.PropertiesDeclaration.prototype.evaluateAssignments = function(){

        //for each varDecl in .list
        for( var varDecl__inx=0,varDecl ; varDecl__inx<this.list.length ; varDecl__inx++){varDecl=this.list[varDecl__inx];
        
            //varDecl.getTypeFromAssignedValue
            varDecl.getTypeFromAssignedValue();
        };// end for each in this.list
        
     };



    //    append to class Grammar.ForStatement ###
    

     //     method declare()
     // ---------------------------
     Grammar.ForStatement.prototype.declare = function(){

//a ForStatement has a 'Scope', keyIndexVar & valueVar belong to the scope

        //.createScope
        this.createScope();
     };

    //    append to class Grammar.ForEachProperty ###
    

     //     method declare()
     // ---------------------------
     Grammar.ForEachProperty.prototype.declare = function(){

        //if .iterable.type
        if (this.iterable.type) {
        
            //default .valueVar.type = .iterable.type.itemType
            if(this.valueVar.type===undefined) this.valueVar.type=this.iterable.type.itemType;
            
        };

        //.valueVar.declareInScope
        this.valueVar.declareInScope();

        //if .keyIndexVar, .keyIndexVar.declareInScope
        if (this.keyIndexVar) {this.keyIndexVar.declareInScope()};
     };

     //     method evaluateAssignments()
     // ---------------------------
     Grammar.ForEachProperty.prototype.evaluateAssignments = function(){

//ForEachProperty: index is: string for js (property name) and number for C (symbol)

        //if .keyIndexVar
        if (this.keyIndexVar) {
        

            //var indexType = project.options.target is 'js'? 'String':'Number'
            var indexType = project.options.target === 'js' ? 'String' : 'Number';
            //.keyIndexVar.nameDecl.setMember('**proto**',globalPrototype(indexType))
            this.keyIndexVar.nameDecl.setMember('**proto**', globalPrototype(indexType));
        };
     };

    //    append to class Grammar.ForEachInArray ###
    

     //     method declare()
     // ---------------------------
     Grammar.ForEachInArray.prototype.declare = function(){

        //if .iterable.type
        if (this.iterable.type) {
        
            //default .valueVar.type = .iterable.type.itemType
            if(this.valueVar.type===undefined) this.valueVar.type=this.iterable.type.itemType;
            
        };

        //.valueVar.declareInScope
        this.valueVar.declareInScope();

        //if .keyIndexVar, .keyIndexVar.declareInScope
        if (this.keyIndexVar) {this.keyIndexVar.declareInScope()};

        //if .intIndexVar, .intIndexVar.declareInScope
        if (this.intIndexVar) {this.intIndexVar.declareInScope()};
     };

     //     method evaluateAssignments()
     // ---------------------------
     Grammar.ForEachInArray.prototype.evaluateAssignments = function(){

//ForEachInArray:
//If no valueVar.type, guess type from iterable's itemType

        //if no .valueVar.nameDecl.findOwnMember('**proto**')
        if (!this.valueVar.nameDecl.findOwnMember('**proto**')) {
        
            //var iterableType:Names.Declaration = .iterable.getResultType()
            var iterableType = this.iterable.getResultType();
            //if iterableType and iterableType.findOwnMember('**item type**')  into var itemType
            var itemType=undefined;
            if (iterableType && (itemType=iterableType.findOwnMember('**item type**'))) {
            
                //.valueVar.nameDecl.setMember('**proto**',itemType)
                this.valueVar.nameDecl.setMember('**proto**', itemType);
            };
        };
     };

     //     method validatePropertyAccess()
     // ---------------------------
     Grammar.ForEachInArray.prototype.validatePropertyAccess = function(){
//ForEachInArray: check if the iterable has a .length property.

        //if .isMap, return
        if (this.isMap) {return};

        //var iterableType:Names.Declaration = .iterable.getResultType()
        var iterableType = this.iterable.getResultType();

        //if no iterableType
        if (!iterableType) {
        
            //#.sayErr "ForEachInArray: no type declared for: '#{.iterable}'"
            //do nothing
            null;
        }
        //if no iterableType
        
        else if (!iterableType.findMember('length')) {
        
            //.sayErr "ForEachInArray: no .length property declared in '#{.iterable}' type:'#{iterableType.toString()}'"
            this.sayErr("ForEachInArray: no .length property declared in '" + this.iterable + "' type:'" + (iterableType.toString()) + "'");
            //logger.error iterableType.originalDeclarationPosition()
            logger.error(iterableType.originalDeclarationPosition());
        };
     };

    //    append to class Grammar.ForIndexNumeric ###
    

     //     method declare()
     // ---------------------------
     Grammar.ForIndexNumeric.prototype.declare = function(){

        //.keyIndexVar.declareInScope
        this.keyIndexVar.declareInScope();
     };


    //    append to class Grammar.ExceptionBlock
    
//`ExceptionBlock: (exception|catch) catchVar-IDENTIFIER Body [finally Body]`

      //method declare()
      // ---------------------------
      Grammar.ExceptionBlock.prototype.declare = function(){

//Exception blocks have a scope

        //.createScope
        this.createScope();
        //.addToScope .catchVar,{type:globalPrototype('Error')}
        this.addToScope(this.catchVar, {type: globalPrototype('Error')});
      };


    //    append to class Grammar.VariableRef ### Helper methods
    

//`VariableRef: ['--'|'++']Identifier[Accessors]['--'|'++']`

//`VariableRef` is a Variable Reference.

     //     method validatePropertyAccess()
     // ---------------------------
     Grammar.VariableRef.prototype.validatePropertyAccess = function(){

        //if .parent is instance of Grammar.DeclareStatement
        if (this.parent instanceof Grammar.DeclareStatement) {
        
            //declare valid .parent.specifier
            
            //if .parent.specifier is 'valid'
            if (this.parent.specifier === 'valid') {
            
                  //return #declare valid xx.xx.xx
                  return;
            };
        };

//Start with main variable name, to check property names

        //var actualVar = .tryGetFromScope(.name, {
                                //informError:true
                                //isForward:true
                                //isDummy:true
                                //nodeClass: Grammar.VariableDecl
                          //})
        var actualVar = this.tryGetFromScope(this.name, {informError: true, isForward: true, isDummy: true, nodeClass: Grammar.VariableDecl});

//now follow each accessor

        //if no actualVar or no .accessors, return
        if (!actualVar || !this.accessors) {return};

        //for each ac in .accessors
        for( var ac__inx=0,ac ; ac__inx<this.accessors.length ; ac__inx++){ac=this.accessors[ac__inx];
        
            //declare valid ac.name
            

//for PropertyAccess, check if the property name is valid

            //if ac instanceof Grammar.PropertyAccess
            if (ac instanceof Grammar.PropertyAccess) {
            
                //actualVar = .tryGetMember(actualVar, ac.name, {
                                //informError:true
                                //isDummy:true
                                //nodeClass: Grammar.VariableDecl
                          //})
                actualVar = this.tryGetMember(actualVar, ac.name, {informError: true, isDummy: true, nodeClass: Grammar.VariableDecl});
            }
            //if ac instanceof Grammar.PropertyAccess
            
            else if (ac instanceof Grammar.IndexAccess) {
            
                //actualVar = actualVar.findMember('**item type**')
                actualVar = actualVar.findMember('**item type**');
            }
            //else if ac instanceof Grammar.IndexAccess
            
            else if (ac instanceof Grammar.FunctionAccess) {
            
                //declare ac:Grammar.FunctionAccess
                

                //if no actualVar.findMember('call') and actualVar.name isnt 'Object'
                if (!actualVar.findMember('call') && actualVar.name !== 'Object') {
                
                //if actualVar.findOwnMember('**proto**') into var prt
                //    if prt.name is 'prototype', prt=prt.parent
                //    if prt.name isnt 'Function'
                        //.warn "function call. '#{actualVar}' is class '#{prt.name}', not 'Function'"
                        //.warn "function call. '#{actualVar}' has no method 'call', it is not type:Function"
                        this.warn("function call. '" + actualVar + "' has no method 'call', it is not type:Function");
                };

//Validate arguments against function parameters declaration

                //if actualVar.nodeDeclared instanceof Grammar.FunctionDeclaration
                if (actualVar.nodeDeclared instanceof Grammar.FunctionDeclaration) {
                
                    //ac.validateArguments actualVar.nodeDeclared
                    ac.validateArguments(actualVar.nodeDeclared);
                };

                //actualVar = actualVar.findMember('**return type**')
                actualVar = actualVar.findMember('**return type**');
            };

//if actualVar is a VarRef, find type in scope

            //if actualVar instanceof Grammar.VariableRef
            if (actualVar instanceof Grammar.VariableRef) {
            
                //.sayErr  "actualVar instanceof Grammar.VariableRef: #{actualVar.toString()}"
                this.sayErr("actualVar instanceof Grammar.VariableRef: " + (actualVar.toString()));
                //declare actualVar:Grammar.VariableRef
                
                //actualVar = actualVar.tryGetReference({
                                //informError:true
                                //isForward:true
                                //isDummy:true
                                //nodeClass: Grammar.VariableDecl
                          //})
                actualVar = actualVar.tryGetReference({informError: true, isForward: true, isDummy: true, nodeClass: Grammar.VariableDecl});
            };

            //if no actualVar, break
            if (!actualVar) {break};
        };// end for each in this.accessors

        //end for #each accessor

        //return actualVar
        

        //return actualVar
        return actualVar;
     };


     //     helper method tryGetReference(options:Names.DeclarationOptions) returns Names.Declaration
     // ---------------------------
     Grammar.VariableRef.prototype.tryGetReference = function(options){

//evaluate this VariableRef.
//Try to determine referenced NameDecl.
//if we can reach a reference, return reference.
//For classes, return ClassDeclaration.nameDecl (not ClassDeclaration.nameDecl.prototype)

        //default options= new Names.DeclarationOptions
        if(options===undefined) options=new Names.DeclarationOptions();

//Start with main variable name

        //var actualVar = .tryGetFromScope(.name, options)
        var actualVar = this.tryGetFromScope(this.name, options);
        //if no actualVar, return
        if (!actualVar) {return};

//now check each accessor

        //if no .accessors, return actualVar
        if (!this.accessors) {return actualVar};

        //var partial = .name
        var partial = this.name;

        //for each ac in .accessors
        for( var ac__inx=0,ac ; ac__inx<this.accessors.length ; ac__inx++){ac=this.accessors[ac__inx];
        
            //declare valid ac.name
            

//for PropertyAccess

            //if ac instanceof Grammar.PropertyAccess
            if (ac instanceof Grammar.PropertyAccess) {
            
                //actualVar = .tryGetMember(actualVar, ac.name, options)
                actualVar = this.tryGetMember(actualVar, ac.name, options);
            }
            //if ac instanceof Grammar.PropertyAccess
            
            else if (ac instanceof Grammar.IndexAccess) {
            
                //actualVar = .tryGetMember(actualVar, '**item type**')
                actualVar = this.tryGetMember(actualVar, '**item type**');
            }
            //else if ac instanceof Grammar.IndexAccess
            
            else if (ac instanceof Grammar.FunctionAccess) {
            
                //actualVar = .tryGetMember(actualVar, '**return type**')
                actualVar = this.tryGetMember(actualVar, '**return type**');
            };

//check if we can continue on the chain

            //if actualVar isnt instance of Names.Declaration
            if (!(actualVar instanceof Names.Declaration)) {
            
              //actualVar = undefined
              actualVar = undefined;
              //break
              break;
            }
            //if actualVar isnt instance of Names.Declaration
            
            else {
              //partial += ac.toString()
              partial += ac.toString();
            };
        };// end for each in this.accessors

        //end for #each accessor

        //if no actualVar and options.informError
        

        //if no actualVar and options.informError
        if (!actualVar && options.informError) {
        
            //.sayErr "'#{this}'. Reference can not be analyzed further than '#{partial}'"
            this.sayErr("'" + this + "'. Reference can not be analyzed further than '" + partial + "'");
        };

        //return actualVar
        return actualVar;
     };

     //     helper method getResultType() returns Names.Declaration
     // ---------------------------
     Grammar.VariableRef.prototype.getResultType = function(){

      //return .tryGetReference()
      return this.tryGetReference();
     };


    //    append to class Grammar.FunctionAccess
    

     //     method validateArguments(funcDecl:Grammar.FunctionDeclaration)
     // ---------------------------
     Grammar.FunctionAccess.prototype.validateArguments = function(funcDecl){

        //var definedArgs= funcDecl.paramsDeclarations? funcDecl.paramsDeclarations.list.length else 0
        var definedArgs = funcDecl.paramsDeclarations ? funcDecl.paramsDeclarations.list.length : 0;

        //if no definedArgs, return
        if (!definedArgs) {return};

        //var varDecl
        var varDecl = undefined;
        //for each inx,functionArgument in .args
        for( var inx=0,functionArgument ; inx<this.args.length ; inx++){functionArgument=this.args[inx];
        

            //if inx<definedArgs
            if (inx < definedArgs) {
            
                //varDecl = funcDecl.paramsDeclarations.list[inx]
                varDecl = funcDecl.paramsDeclarations.list[inx];
            }
            //if inx<definedArgs
            
            else {
                //varDecl = undefined
                varDecl = undefined;
                //if no funcDecl.paramsDeclarations.variadic
                if (!funcDecl.paramsDeclarations.variadic) {
                
                    //.sayErr "#{funcDecl.specifier} #{funcDecl.nameDecl} accepts only #{definedArgs} arguments"
                    this.sayErr('' + funcDecl.specifier + " " + funcDecl.nameDecl + " accepts only " + definedArgs + " arguments");
                    //funcDecl.sayErr "function declaration is here"
                    funcDecl.sayErr("function declaration is here");
                };
            };

            //if varDecl and varDecl.nameDecl
            if (varDecl && varDecl.nameDecl) {
            
                //var defined = varDecl.nameDecl.findMember("**proto**")
                var defined = varDecl.nameDecl.findMember("**proto**");
                //if defined and defined.name is 'prototype', defined = defined.parent
                if (defined && defined.name === 'prototype') {defined = defined.parent};
                //var passed = functionArgument.expression.getResultType()
                var passed = functionArgument.expression.getResultType();
                //if defined isnt passed
                if (defined !== passed) {
                
                    //do nothing
                    null;
                };
            };
        };// end for each in this.args
                    //.sayErr "#{funcDecl.nameDecl} argument ##{inx+1} is type:#{defined} and a type:#{passed} was passed"

        //end for

//-------

    //    append to class Grammar.AssignmentStatement ###
        
     };

//-------

    //    append to class Grammar.AssignmentStatement ###
    


     //     method evaluateAssignments() ## Grammar.AssignmentStatement
     // ---------------------------
     Grammar.AssignmentStatement.prototype.evaluateAssignments = function(){

//check if we've got a a clear reference.

      //var reference = .lvalue.tryGetReference()
      var reference = this.lvalue.tryGetReference();
      //if reference isnt instanceof Names.Declaration, return
      if (!(reference instanceof Names.Declaration)) {return};

//if it is assigning string or number literal, force type

      //if .rvalue instanceof Grammar.Expression
      if (this.rvalue instanceof Grammar.Expression) {
      
          //if .rvalue.root.name.constructor in [Grammar.StringLiteral,Grammar.NumberLiteral]
          if ([Grammar.StringLiteral, Grammar.NumberLiteral].indexOf(this.rvalue.root.name.constructor)>=0) {
          
              //var theLiteral = .rvalue.root.name
              var theLiteral = this.rvalue.root.name;
              // if it is assigning a literal, force type to string|number|array
              //reference.setMember('**proto**', globalPrototype(theLiteral.type))
              reference.setMember('**proto**', globalPrototype(theLiteral.type));
              //return
              return;
          };
      };

      //if reference.findOwnMember('**proto**'), return #has a type already
      if (reference.findOwnMember('**proto**')) {return};

//check if we've got a clear rvalue.
//if we do, set type for lvalue (unless is "null" or "undefined", they destroy type info)

      //reference.assignTypeFromValue .rvalue
      reference.assignTypeFromValue(this.rvalue);
     };


//
//#### method declareByAssignment()
//
//Here we check for lvalue VariableRef in the form:
//
//`exports.x = xx`, `module.exports.x = xx` and `xx.prototype.yy =`
//
//We consider this assignments as 'declarations' of members rather than variable references to check.
//
//Start with main variable name
//
//        var varRef = .lvalue
//
//        var keywordFound
//
//        if varRef.name is 'exports' #start with 'exports'
//            keywordFound = varRef.name
//
//        if no varRef.accessors
//
//          if keywordFound # is: `exports = x`, it does not work in node-js
//              .sayErr "'exports = x', does not work. You need to do: 'module.exports = x'"
//
//          return # no accessors to check
//
//        var actualVar = .findInScope(varRef.name)
//        if no actualVar, return
//
//now check each accessor
//
//        var createName
//
//        for each index,ac in varRef.accessors
//            declare valid ac.name
//
//for PropertyAccess
//
//            if ac instanceof Grammar.PropertyAccess
//
//              #if we're after 'exports|prototype' keyword and this is the last accessor,
//              #then this is the name to create
//              if keywordFound and index is varRef.accessors.length-1
//                  createName = ac.name
//                  break
//
//check for 'exports' or 'prototype', after that, last accessor is property declaration
//
//              if ac.name in ['exports','prototype']
//                keywordFound = ac.name
//
//              actualVar =  actualVar.findMember(ac.name)
//              if no actualVar, break
//
//else, if IndexAccess or function access, we exit analysis
//
//            else
//              return #exit
//
//        end for #each accessor in lvalue, look for module.exports=...
//
//if we found 'exports' or 'prototype', and we reach a valid reference
//
//        if keywordFound and actualVar
//
//            if createName # module.exports.x =... create a member
//              actualVar = .addMemberTo(actualVar,createName) # create x on module.exports
//
//            #try to execute assignment, so exported var points to content
//            var content = .rvalue.getResultType()
//            if content instanceof Names.Declaration
//                actualVar.makePointTo content

    //    append to class Grammar.Expression ###
    

     //     helper method getResultType() returns Names.Declaration
     // ---------------------------
     Grammar.Expression.prototype.getResultType = function(){
//Try to get return type from a simple Expression

        //declare valid .root.getResultType:function
        
        //return .root.getResultType() # .root is Grammar.Oper or Grammar.Operand
        return this.root.getResultType();
     };


    //    append to class Grammar.Oper ###
    

//for 'into var x' oper, we declare the var, and we deduce type

     //     method declare()
     // ---------------------------
     Grammar.Oper.prototype.declare = function(){

        //if .intoVar is '*r' # is a into-assignment operator with 'var' declaration
        if (this.intoVar === '*r') {
        

            //var varRef = .right.name
            var varRef = this.right.name;
            //if varRef isnt instance of Grammar.VariableRef
            if (!(varRef instanceof Grammar.VariableRef)) {
            
                //.throwError "Expected 'variable name' after 'into var'"
                this.throwError("Expected 'variable name' after 'into var'");
            };

            //if varRef.accessors
            if (varRef.accessors) {
            
                //.throwError "Expected 'simple variable name' after 'into var'"
                this.throwError("Expected 'simple variable name' after 'into var'");
            };

            //.addToScope .declareName(varRef.name,{
                                        //type:varRef.type
                                        //nodeClass:Grammar.VariableDecl
                                      //})
            this.addToScope(this.declareName(varRef.name, {type: varRef.type, nodeClass: Grammar.VariableDecl}));
        };
     };

     //     method evaluateAssignments()
     // ---------------------------
     Grammar.Oper.prototype.evaluateAssignments = function(){

//for into-assignment operator

      //if .name is 'into' # is a into-assignment operator
      if (this.name === 'into') {
      

//check if we've got a clear reference (into var x)

          //if .right.name instance of Grammar.VariableRef
          if (this.right.name instanceof Grammar.VariableRef) {
          

              //declare valid .right.name.tryGetReference:function
              
              //var nameDecl = .right.name.tryGetReference()
              var nameDecl = this.right.name.tryGetReference();

              //if nameDecl isnt instanceof Names.Declaration, return
              if (!(nameDecl instanceof Names.Declaration)) {return};
              //if nameDecl.findOwnMember('**proto**'), return #has a type already
              if (nameDecl.findOwnMember('**proto**')) {return};

//check if we've got a clear .left (value to be assigned) type
//if we do, set type for .rigth ('into var x') (unless is "null" or "undefined", they destroy type info)

              //nameDecl.assignTypeFromValue .left
              nameDecl.assignTypeFromValue(this.left);
          };
      };
     };


     //     helper method getResultType() returns Names.Declaration
     // ---------------------------
     Grammar.Oper.prototype.getResultType = function(){
//Try to get return type from this Oper (only for 'new' unary oper)

        //declare valid .right.getResultType
        

        //if .name is 'new'
        if (this.name === 'new') {
        
            //return .right.getResultType() #.right is Grammar.Operand
            return this.right.getResultType();
        };
     };


    //    append to class Grammar.Operand ###
    

     //     helper method getResultType() returns Names.Declaration
     // ---------------------------
     Grammar.Operand.prototype.getResultType = function(){
//Try to get return type from this Operand

        //declare valid .name.type
        
        //declare valid .name.getResultType
        
        //declare valid .name.tryGetReference
        

        //if .name instance of Grammar.ObjectLiteral
        if (this.name instanceof Grammar.ObjectLiteral) {
        
            //return .name.getResultType()
            return this.name.getResultType();
        }
        //if .name instance of Grammar.ObjectLiteral
        
        else if (this.name instanceof Grammar.Literal) {
        
            //return globalPrototype(.name.type)
            return globalPrototype(this.name.type);
        }
        //else if .name instance of Grammar.Literal
        
        else if (this.name instanceof Grammar.VariableRef) {
        
            //return .name.tryGetReference()
            return this.name.tryGetReference();
        }
        //else if .name instance of Grammar.VariableRef
        
        else if (this.name instanceof Grammar.FunctionDeclaration) {
        
            //return globalPrototype('Function')
            return globalPrototype('Function');
        };
     };

    //    append to class Grammar.DeclareStatement
    
     //     method declare() # pass 1, declare as props
     // ---------------------------
     Grammar.DeclareStatement.prototype.declare = function(){

//declare [all] x:type
//declare [global] var x
//declare on x
//declare valid x.y.z


      //if .specifier is 'on'
      if (this.specifier === 'on') {
      

          //var reference = .tryGetFromScope(.name,{isForward:true})
          var reference = this.tryGetFromScope(this.name, {isForward: true});

          //if String.isCapitalized(reference.name) //let's assume is a Class
          if (String.isCapitalized(reference.name)) {
          
              //if no reference.findOwnMember('prototype'), reference.addMember('prototype')
              if (!reference.findOwnMember('prototype')) {reference.addMember('prototype')};
              //reference=reference.findOwnMember('prototype')
              reference = reference.findOwnMember('prototype');
          };

          //for each varDecl in .names
          for( var varDecl__inx=0,varDecl ; varDecl__inx<this.names.length ; varDecl__inx++){varDecl=this.names[varDecl__inx];
          
              //.addMemberTo reference, varDecl.createNameDeclaration()
              this.addMemberTo(reference, varDecl.createNameDeclaration());
          };// end for each in this.names
          
      }
      //if .specifier is 'on'
      
      else if (['affinity', 'var'].indexOf(this.specifier)>=0) {
      

          //for each varDecl in .names
          for( var varDecl__inx=0,varDecl ; varDecl__inx<this.names.length ; varDecl__inx++){varDecl=this.names[varDecl__inx];
          

            //varDecl.nameDecl = varDecl.createNameDeclaration()
            varDecl.nameDecl = varDecl.createNameDeclaration();

            //if .specifier is 'var'
            if (this.specifier === 'var') {
            
                //if .globVar
                if (this.globVar) {
                
                    //project.rootModule.addToScope varDecl.nameDecl
                    project.rootModule.addToScope(varDecl.nameDecl);
                }
                //if .globVar
                
                else {
                    //.addToScope varDecl.nameDecl
                    this.addToScope(varDecl.nameDecl);
                };
            }
            //if .specifier is 'var'
            
            else if (this.specifier === 'affinity') {
            
                //var classDecl = .getParent(Grammar.ClassDeclaration)
                var classDecl = this.getParent(Grammar.ClassDeclaration);
                //if no classDecl
                if (!classDecl) {
                
                    //.sayErr "'declare name affinity' must be included in a class declaration"
                    this.sayErr("'declare name affinity' must be included in a class declaration");
                    //return
                    return;
                };
                //#add as member to nameAffinity, referencing class decl (.nodeDeclared)
                //varDecl.nameDecl.nodeDeclared = classDecl
                varDecl.nameDecl.nodeDeclared = classDecl;
                //declare varDecl.name:string
                
                //nameAffinity.members.set varDecl.name.capitalized(), classDecl.nameDecl
                nameAffinity.members.set(varDecl.name.capitalized(), classDecl.nameDecl);
            };
          };// end for each in this.names
          
      };
     };

//if .specifier is 'on-the-fly', the type will be converted on next passes over the created Names.Declaration.
//On the method validatePropertyAccess(), types will be switched "on the fly"
//while checking property access.

     //     method evaluateAssignments() # Grammar.DeclareStatement ###
     // ---------------------------
     Grammar.DeclareStatement.prototype.evaluateAssignments = function(){
//Assign specific type to varRef - for the entire compilation

      //if .specifier is 'type'
      if (this.specifier === 'type') {
      
          //if .varRef.tryGetReference({informError:true}) into var actualVar
          var actualVar=undefined;
          if ((actualVar=this.varRef.tryGetReference({informError: true}))) {
          
              //.setTypes actualVar
              this.setTypes(actualVar);
          };
      };
     };

     //     helper method setTypes(actualVar:Names.Declaration) # Grammar.DeclareStatement ###
     // ---------------------------
     Grammar.DeclareStatement.prototype.setTypes = function(actualVar){
//Assign types if it was declared

      //#create type on the fly, overwrite existing type

      //if .type
      if (this.type) {
      
        //.setSubType actualVar,.type.mainType,'**proto**'
        this.setSubType(actualVar, this.type.mainType, '**proto**');
        //.setSubType actualVar,.type.itemType,'**item type**'
        this.setSubType(actualVar, this.type.itemType, '**item type**');
      };
     };

     //     helper method setSubType(actualVar:Names.Declaration, toSet, propName )
     // ---------------------------
     Grammar.DeclareStatement.prototype.setSubType = function(actualVar, toSet, propName){
//Assign type if it was declared

      //if toSet #create type on the fly
      if (toSet) {
      
          //var act=actualVar.findMember(propName)
          //print "set *type* was #{act} set to #{toSet}"
          //actualVar.setMember propName, toSet
          actualVar.setMember(propName, toSet);
          //var result = actualVar.processConvertTypes()
          var result = actualVar.processConvertTypes();
          //if result.failures, .sayErr "can't find type '#{toSet}' in scope"
          if (result.failures) {this.sayErr("can't find type '" + toSet + "' in scope")};
      };
     };

     //     method validatePropertyAccess() # Grammar.DeclareStatement ###
     // ---------------------------
     Grammar.DeclareStatement.prototype.validatePropertyAccess = function(){

//declare members on the fly, with optional type

      //var actualVar:Names.Declaration
      var actualVar = undefined;

      //case .specifier
      
        //when 'valid':
      if (
          (this.specifier=='valid')
      ){

            //actualVar = .tryGetFromScope(.varRef.name,{informError:true})
            actualVar = this.tryGetFromScope(this.varRef.name, {informError: true});
            //if no actualVar, return
            if (!actualVar) {return};

            //for each ac in .varRef.accessors
            for( var ac__inx=0,ac ; ac__inx<this.varRef.accessors.length ; ac__inx++){ac=this.varRef.accessors[ac__inx];
            
                //declare valid ac.name
                

                //if ac isnt instance of Grammar.PropertyAccess
                if (!(ac instanceof Grammar.PropertyAccess)) {
                
                    //actualVar = undefined
                    actualVar = undefined;
                    //break
                    break;
                };

                //if ac.name is 'prototype'
                if (ac.name === 'prototype') {
                
                    //actualVar = actualVar.findOwnMember(ac.name) or .addMemberTo(actualVar, ac.name)
                    actualVar = actualVar.findOwnMember(ac.name) || this.addMemberTo(actualVar, ac.name);
                }
                //if ac.name is 'prototype'
                
                else {
                    //actualVar = actualVar.findMember(ac.name) or .addMemberTo(actualVar, ac.name)
                    actualVar = actualVar.findMember(ac.name) || this.addMemberTo(actualVar, ac.name);
                };
            };// end for each in this.varRef.accessors

            //end for

            //if actualVar, .setTypes actualVar
            

            //if actualVar, .setTypes actualVar
            if (actualVar) {this.setTypes(actualVar)};
      
      }
        //when 'on-the-fly':
      else if (
          (this.specifier=='on-the-fly')
      ){
            //#set type on-the-fly, from here until next type-assignment
            //#we allow more than one "declare x:type" on the same block
            //if .varRef.tryGetReference({informError:true}) into actualVar
            if ((actualVar=this.varRef.tryGetReference({informError: true}))) {
            
                //.setTypes actualVar
                this.setTypes(actualVar);
            };
      
      };
     };


    //    helper function AddGlobalClasses()
    // ---------------------------
    function AddGlobalClasses(){

        //var nameDecl
        var nameDecl = undefined;

        //for each name in arguments.toArray()
        var _list4=Array.prototype.slice.call(arguments);
        for( var name__inx=0,name ; name__inx<_list4.length ; name__inx++){name=_list4[name__inx];
        

            //nameDecl = globalScope.addMember(name,{nodeClass:Grammar.ClassDeclaration})
            nameDecl = globalScope.addMember(name, {nodeClass: Grammar.ClassDeclaration});

            //nameDecl.addMember 'prototype',{nodeClass:Grammar.VariableDecl}
            nameDecl.addMember('prototype', {nodeClass: Grammar.VariableDecl});

            // add to name affinity
            //if not nameAffinity.members.has(name)
            if (!(nameAffinity.members.has(name))) {
            
                //nameAffinity.members.set name, nameDecl
                nameAffinity.members.set(name, nameDecl);
            };
        };// end for each in Array.prototype.slice.call(arguments)
        
    };// -----------
// Module code
// -----------

    //end function validate

    //    export function walkAllNodesCalling(methodName:string)
    
// end of module
