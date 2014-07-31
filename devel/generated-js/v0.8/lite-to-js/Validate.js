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
    var ASTBase = require('./ASTBase.js');
    var Grammar = require('./Grammar.js');
    var Names = require('./Names.js');
    var Environment = require('./lib/Environment.js');
    //import logger, UniqueID
    var logger = require('./lib/logger.js');
    var UniqueID = require('./lib/UniqueID.js');
    //shim import LiteCore, Map
    var LiteCore = require('./lib/LiteCore.js');
    var Map = require('./lib/Map.js');
    
//---------
//Module vars:
    //var project
    var project = undefined;
    //var globalScope: Names.Declaration
    var globalScope = undefined;
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
///*
  //class ClassA
    //properties 
      //classAProp1, classAProp2
    
    //method methodA
      //this.classAProp1 = 11
      //this.classAProp2 = 12
  //class ClassB
    
    //properties 
      //classBProp1, classBProp2
    //method methodB
      //this.classBProp1 = 21
  //var instanceB = new ClassB // implicit type
  //instanceB.classBprop1 = 5 // <-- this **will be caught** as "case mismatch" since classBprop1 is defined as classBProp1
  //var bObj = instanceB // simple assignment, implicit type
  //bObj.classAProp1 = 5 // <-- this **will be caught** as: object 'bObj' has no property 'classAProp1'
  //var xObj = callToFn() // unknown type
  
  //xObj.classBProp1 = 5 // <-- this trigger a "classBProp1 IS NOT A DECLARED PROPERTY OF xObj"
  //declare on xObj  // <-- this fixes it
    //classBProp1
  //xObj.classBProp1 = 5 // <-- this is OK now
  //var xObj:ClassB = callToFn() // type annotation, this also fixes it
  
  //bObj.classBProp1 = 5 // <-- this is ok
//*/
//### export function validate()
    function validate(){
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
///*
//#### Pass 1.1 Declare By Assignment
//Walk the tree, and check assignments looking for: 'module.exports.x=x' and 'x.prototype.y = '.
//Treat them as declarations.
        //logger.info "- Declare By Assignment (support .js syntax, .exports.x=..., .prototype.x=...)"
        //walkAllNodesCalling 'declareByAssignment'
//*/
//#### Pass 1.2 connectImportRequire
        //logger.info "- Connect Imported"
        logger.info("- Connect Imported");
//validate public exports.
//set module.exports with default export object if set
        //for each moduleNode:Grammar.Module in map project.moduleCache
        var moduleNode=undefined;
        if(!project.moduleCache.dict) throw(new Error("for each in map: not a Map, no .dict property"));
        for ( var moduleNode__propName in project.moduleCache.dict) if (project.moduleCache.dict.hasOwnProperty(moduleNode__propName)){moduleNode=project.moduleCache.dict[moduleNode__propName];
            {
            //moduleNode.confirmExports 
            moduleNode.confirmExports();
            }
            
            }// end for each property
//handle: `import x` and `global declare x`
//Make var x point to imported module 'x' exports 
        //for each moduleNode:Grammar.Module in map project.moduleCache
        var moduleNode=undefined;
        if(!project.moduleCache.dict) throw(new Error("for each in map: not a Map, no .dict property"));
        for ( var moduleNode__propName in project.moduleCache.dict) if (project.moduleCache.dict.hasOwnProperty(moduleNode__propName)){moduleNode=project.moduleCache.dict[moduleNode__propName];
          {
          //for each node in moduleNode.requireCallNodes
          for( var node__inx=0,node ; node__inx<moduleNode.requireCallNodes.length ; node__inx++){node=moduleNode.requireCallNodes[node__inx];
          
            //if node.importedModule
            if (node.importedModule) {
              //var parent: ASTBase
              var parent = undefined;
              //var referenceNameDecl: Names.Declaration //var where to import exported module members
              var referenceNameDecl = undefined; //var where to import exported module members
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
                  if (node.getParent(Grammar.DeclareStatement) !== undefined) { //is a "global declare"
                        //var moveWhat = node.importedModule.exports
                        var moveWhat = node.importedModule.exports;
                        //#if the module exports a "class-function", move to global with class name
                        //if moveWhat.findOwnMember('prototype') into var protoExportNameDecl 
                        var protoExportNameDecl=undefined;
                        if ((protoExportNameDecl=moveWhat.findOwnMember('prototype'))) {
                            ////if it has a 'prototype'
                            ////replace 'prototype' (on module.exports) with the class name, and add as the class
                            //protoExportNameDecl.name = protoExportNameDecl.parent.name
                            protoExportNameDecl.name = protoExportNameDecl.parent.name;
                            //project.rootModule.addToScope protoExportNameDecl
                            project.rootModule.addToScope(protoExportNameDecl);
                        }
                        else {
                      
                        //else
                            //// a "declare global x", but "x.lite.md" do not export a class
                            //// move all exported (namespace members) to global scope
                            //for each nameDecl in map moveWhat.members
                            var nameDecl=undefined;
                            if(!moveWhat.members.dict) throw(new Error("for each in map: not a Map, no .dict property"));
                            for ( var nameDecl__propName in moveWhat.members.dict) if (moveWhat.members.dict.hasOwnProperty(nameDecl__propName)){nameDecl=moveWhat.members.dict[nameDecl__propName];
                                {
                                //project.rootModule.addToScope nameDecl
                                project.rootModule.addToScope(nameDecl);
                                }
                                
                                }// end for each property
                            
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
                  
                  //else if parent instance of Grammar.VariableDecl
                      //referenceNameDecl = parent.nameDecl
              //end if
//*/
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
                  //// if it has a 'prototype' => it's a Function-Class
                  //// else we assume all exported from module is a namespace
                  ////referenceNameDecl.isNamespace = no referenceNameDecl.findOwnMember('prototype') 
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
        var pass = 0
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
            pass++;
        } while (!(sumFailures === lastSumFailures));// end loop
            ////logger.debug "  -  Pass #{pass}, converted:#{sumConverted}, failures:#{sumFailures}"
        //#loop unitl no progress is made
        //loop until sumFailures is lastSumFailures
//Inform unconverted types as errors
        //if sumFailures #there was failures, inform al errors
        if (sumFailures) {// #there was failures, inform al errors
            //var opt = new Names.NameDeclOptions
            var opt = new Names.NameDeclOptions();
            //opt.informError = true
            opt.informError = true;
            //for each nameDecl in Names.allNameDeclarations
            for( var nameDecl__inx=0,nameDecl ; nameDecl__inx<Names.allNameDeclarations.length ; nameDecl__inx++){nameDecl=Names.allNameDeclarations[nameDecl__inx];
            
                //nameDecl.processConvertTypes(opt)
                nameDecl.processConvertTypes(opt);
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
    module.exports.validate = validate;
    //end function validate
//### export function walkAllNodesCalling(methodName:string)
    function walkAllNodesCalling(methodName){
        //var methodSymbol = LiteCore.getSymbol(methodName)
        var methodSymbol = LiteCore.getSymbol(methodName);
//For all modules, for each node, if the specific AST node has methodName, call it
        //for each moduleNode:Grammar.Module in map project.moduleCache
        var moduleNode=undefined;
        if(!project.moduleCache.dict) throw(new Error("for each in map: not a Map, no .dict property"));
        for ( var moduleNode__propName in project.moduleCache.dict) if (project.moduleCache.dict.hasOwnProperty(moduleNode__propName)){moduleNode=project.moduleCache.dict[moduleNode__propName];
            {
            //moduleNode.callOnSubTree methodSymbol
            moduleNode.callOnSubTree(methodSymbol);
            }
            
            }// end for each property
        
    }
    // export
    module.exports.walkAllNodesCalling = walkAllNodesCalling;
//### export function initialize(aProject)
    function initialize(aProject){
//Initialize module vars
        //project = aProject
        project = aProject;
        
        //#clear global Names.Declaration list
        //Names.allNameDeclarations = []
        Names.allNameDeclarations = [];
//initialize NameAffinity
        //var options = new Names.NameDeclOptions
        var options = new Names.NameDeclOptions();
        //options.normalizeModeKeepFirstCase = true #nameAffinity members are stored: [0].Toupper()+slice(1).toLower()
        options.normalizeModeKeepFirstCase = true;// #nameAffinity members are stored: [0].Toupper()+slice(1).toLower()
        //nameAffinity= new Names.Declaration('Name Affinity',options) # project-wide name affinity for classes
        nameAffinity = new Names.Declaration('Name Affinity', options);// # project-wide name affinity for classes
        ////populateGlobalScope(aProject)
//The "scope" of rootNode is the global scope. 
        //globalScope = project.rootModule.createScope()
        globalScope = project.rootModule.createScope();
//Initialize global scope
//a)non-instance values
        //globalScope.addMember 'undefined'
        globalScope.addMember('undefined');
        //var opt = new Names.NameDeclOptions
        var opt = new Names.NameDeclOptions();
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
        AddGlobalClasses('Object', 'Function', 'Array', 'String', 'Number', 'Boolean');
            
//note: 'Map' and 'NameValuePair' are declared at GlobalScopeX.interface.md
//b) create special types
//b.1) arguments:any*
//"arguments:any*" - arguments, type: pointer to any 
//'arguments' is a local var to all functions, representing a pseudo-array witj all the arguments.
//'arguments' has only one method: `arguments.toArray()`
//we declare here the type:"pointer to any" - "any*"
        //var argumentsType = globalScope.addMember('any*') //  any pointer, type for "arguments"
        var argumentsType = globalScope.addMember('any*'); //  any pointer, type for "arguments"
        //opt.value = undefined
        opt.value = undefined;
        //opt.type = globalPrototype('Function')
        opt.type = globalPrototype('Function');
        //opt.returnType=globalPrototype('Array')
        opt.returnType = globalPrototype('Array');
        //argumentsType.addMember('toArray',opt) 
        argumentsType.addMember('toArray', opt);
//b.2) Lite-C: the Lexer replaces string interpolation with calls to `_concatAny`
        //opt.returnType=globalPrototype('String')
        opt.returnType = globalPrototype('String');
        //globalScope.addMember '_concatAny',opt //used for string interpolation
        globalScope.addMember('_concatAny', opt); //used for string interpolation
        
        //opt.returnType=undefined
        opt.returnType = undefined;
        //globalScope.addMember 'parseFloat',opt //used for string interpolation
        globalScope.addMember('parseFloat', opt); //used for string interpolation
        //globalScope.addMember 'parseInt',opt //used for string interpolation
        globalScope.addMember('parseInt', opt); //used for string interpolation
        ////var core = globalScope.addMember('LiteCore') //core supports
        ////core.isNamespace = true
        ////opt.returnType='Number'
        ////core.addMember 'getSymbol',opt //to get a symbol (int) from a symbol name (string)
//b.3) "any" default type for vars
        //globalScope.addMember 'any' // used for "map string to any" - Dictionaries
        globalScope.addMember('any'); // used for "map string to any" - Dictionaries
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
            nameAffinity.members.set('Err', errProto.parent); // err|xxxErr => type:Error
        };
    }
    // export
    module.exports.initialize = initialize;
//### helper function processInterfaceFile(globalInterfaceFile)
    function processInterfaceFile(globalInterfaceFile){
//Process the global scope declarations interface file: GlobalScope(JS|C|NODE).interface.md
        //logger.msg "Declare global scope using #{globalInterfaceFile}.interface.md"
        logger.msg("Declare global scope using " + globalInterfaceFile + ".interface.md");
        //var globalInterfaceModule = project.compileFile(globalInterfaceFile)
        var globalInterfaceModule = project.compileFile(globalInterfaceFile);
//call "declare" on each item of the GlobalScope interface file, to create the NameDeclarations
        //globalInterfaceModule.callOnSubTree LiteCore.getSymbol('declare')
        globalInterfaceModule.callOnSubTree(LiteCore.getSymbol('declare'));
//move all exported from the interface file, to project.rootModule global scope
        //for each nameDecl in map globalInterfaceModule.exports.members
        var nameDecl=undefined;
        if(!globalInterfaceModule.exports.members.dict) throw(new Error("for each in map: not a Map, no .dict property"));
        for ( var nameDecl__propName in globalInterfaceModule.exports.members.dict) if (globalInterfaceModule.exports.members.dict.hasOwnProperty(nameDecl__propName)){nameDecl=globalInterfaceModule.exports.members.dict[nameDecl__propName];
            {
            //project.rootModule.addToSpecificScope globalScope, nameDecl
            project.rootModule.addToSpecificScope(globalScope, nameDecl);
            }
            
            }// end for each property
        
    };
//----------
//## Module Helper Functions
//### Helper function tryGetGlobalPrototype(name) 
    function tryGetGlobalPrototype(name){
//gets a var from global scope
      
      //if globalScope.findOwnMember(name) into var nameDecl
      var nameDecl=undefined;
      if ((nameDecl=globalScope.findOwnMember(name))) {
          //return nameDecl.members.get("prototype")
          return nameDecl.members.get("prototype");
      };
    };
//### public Helper function globalPrototype(name) 
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
//### helper function addBuiltInClass(name,node) returns Names.Declaration
    function addBuiltInClass(name, node){
//Add a built-in class to global scope, return class prototype
      //var opt = new Names.NameDeclOptions
      var opt = new Names.NameDeclOptions();
      ////opt.isBuiltIn = true
      //var nameDecl = new Names.Declaration( name,opt,node )
      var nameDecl = new Names.Declaration(name, opt, node);
      //globalScope.addMember nameDecl
      globalScope.addMember(nameDecl);
      //nameDecl.getMembersFromObjProperties Environment.getGlobalObject(name)
      nameDecl.getMembersFromObjProperties(Environment.getGlobalObject(name));
      //if no nameDecl.findOwnMember("prototype") into var classProto:Names.Declaration
      var classProto=undefined;
      if (!((classProto=nameDecl.findOwnMember("prototype")))) {
          //throw("addBuiltInClass '#{name}, expected to have a prototype")
          throw ("addBuiltInClass '" + name + ", expected to have a prototype");
      };
      //nameDecl.setMember '**proto**', globalPrototype('Function')
      nameDecl.setMember('**proto**', globalPrototype('Function'));
      //// commented v0.8: classes can not be used as functions. 
      //// nameDecl.setMember '**return type**', classProto
      //return classProto
      return classProto;
    };
//### helper function addBuiltInObject(name,node) returns Names.Declaration
    function addBuiltInObject(name, node){
//Add a built-in object to global scope, return object
      //var opt = new Names.NameDeclOptions
      var opt = new Names.NameDeclOptions();
      ////opt.isBuiltIn = true
      //var nameDecl = new Names.Declaration(name, opt ,node)
      var nameDecl = new Names.Declaration(name, opt, node);
      //globalScope.addMember nameDecl
      globalScope.addMember(nameDecl);
      //nameDecl.getMembersFromObjProperties Environment.getGlobalObject(name)
      nameDecl.getMembersFromObjProperties(Environment.getGlobalObject(name));
      //if nameDecl.findOwnMember("prototype") 
      if (nameDecl.findOwnMember("prototype")) {
          //throw("addBuiltObject '#{name}, expected *Object* to have not a prototype")
          throw ("addBuiltObject '" + name + ", expected *Object* to have not a prototype");
      };
      //return nameDecl
      return nameDecl;
    };
//---------------------------------------
//----------------------------------------
//----------------------------------------
//### Append to namespace Names
    
      //class ConvertResult
      // constructor
      function ConvertResult(){ // default constructor
        //properties
          //converted:number=0
          //failures:number=0
            this.converted=0;
            this.failures=0;
      };
      Names.ConvertResult=ConvertResult;
      
      // end class ConvertResult
      
//##Additions to Names.Declaration. Helper methods to do validation
//### Append to class Names.Declaration
    
//#### Helper method findMember(name) returns Names.Declaration
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
            //if no nextInChain and actual isnt globalPrototype('Object')
            if (!nextInChain && actual !== globalPrototype('Object')) {
              //nextInChain = globalPrototype('Object')
              nextInChain = globalPrototype('Object');
            };
            //actual = nextInChain
            actual = nextInChain;
            //if count++ > 50 #assume circular
            if (count++ > 50) {// #assume circular
                //.warn "circular type reference"
                this.warn("circular type reference");
                //return
                return;
            };
        };// end loop
        
     };
        
        //loop
//#### Helper method hasProto(name) returns boolean
     Names.Declaration.prototype.hasProto = function(name){
//this method looks for a name in Names.Declaration members **proto**->prototpye->parent
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
            //if no nextInChain and actual isnt globalPrototype('Object')
            if (!nextInChain && actual !== globalPrototype('Object')) {
                //nextInChain = globalPrototype('Object')
                nextInChain = globalPrototype('Object');
            };
            //actual = nextInChain
            actual = nextInChain;
            //if count++ > 50 #assume circular
            if (count++ > 50) {// #assume circular
                //.warn "circular type reference"
                this.warn("circular type reference");
                //return
                return;
            };
        };// end loop
        
     };
        
        //loop
//#### Helper Method getMembersFromObjProperties(obj) #Recursive
     Names.Declaration.prototype.getMembersFromObjProperties = function(obj){// #Recursive
//Recursively converts a obj properties in NameDeclarations.
//it's used when a pure.js module is imported by 'require'
//to convert required 'exports' to LiteScript compiler usable NameDeclarations
//Also to load the global scope with built-in objects
        ////ifdef TARGET_C
        ////return
        ////else
        //var newMember:Names.Declaration
        var newMember = undefined;
        //if obj instanceof Object or obj is Object.prototype
        if (obj instanceof Object || obj === Object.prototype) {
            //declare obj:array //to allow js's property access []
            
            //for each prop in Object.getOwnPropertyNames(obj) #even not enumerables
            var _list3=Object.getOwnPropertyNames(obj);
            for( var prop__inx=0,prop ; prop__inx<_list3.length ; prop__inx++){prop=_list3[prop__inx];
              if(['__proto__', 'arguments', 'caller'].indexOf(prop)===-1){
                //where prop not in ['__proto__','arguments','caller'] #exclude __proto__ 
                    //var type =  Grammar.autoCapitalizeCoreClasses(typeof obj[prop])
                    var type = Grammar.autoCapitalizeCoreClasses(typeof obj[prop]);
                    //type = tryGetGlobalPrototype(type) #core classes: Function, Object, String
                    type = tryGetGlobalPrototype(type);// #core classes: Function, Object, String
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
                            //or (typeof obj[prop] is 'function' 
                                //and obj[prop].hasOwnProperty('prototype') 
                                //and not .isInParents(prop) 
                               //)
                            //or (typeof obj[prop] is 'object' 
                                //and not .isInParents(prop) 
                               //)
                              //newMember.getMembersFromObjProperties(obj[prop]) #recursive
                              newMember.getMembersFromObjProperties(obj[prop]);// #recursive
                              //if prop is 'super_' # used in node's core modules: http, EventEmitter, etc.
                              if (prop === 'super_') {// # used in node's core modules: http, EventEmitter, etc.
                                  //if newMember.findOwnMember('prototype') into var superProtopNameDecl 
                                  var superProtopNameDecl=undefined;
                                  if ((superProtopNameDecl=newMember.findOwnMember('prototype'))) {
                                    //var protopNameDecl = .findOwnMember('prototype') or .addMember('prototype')
                                    var protopNameDecl = this.findOwnMember('prototype') || this.addMember('prototype');
                                    //protopNameDecl.setMember '**proto**', superProtopNameDecl #put super's proto in **proto** of prototype
                                    protopNameDecl.setMember('**proto**', superProtopNameDecl);// #put super's proto in **proto** of prototype
                                  };
                              };
                        };
                    };
            }};// end for each in Object.getOwnPropertyNames(obj)
            
        };
     };
        ////end if
                        
//#### Helper Method isInParents(name)
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
//#### Helper method processConvertTypes(options) returns Names.ConvertResult
     Names.Declaration.prototype.processConvertTypes = function(options){
//convert possible types stored in Names.Declaration, 
//from string/varRef to other NameDeclarations in the scope
        //var result = new Names.ConvertResult
        var result = new Names.ConvertResult();
        //.convertType '**proto**',result,options  #try convert main type
        this.convertType('**proto**', result, options);// #try convert main type
        //.convertType '**return type**',result,options  #a Function can have **return type**
        this.convertType('**return type**', result, options);// #a Function can have **return type**
        //.convertType '**item type**',result,options  #an Array can have **item type** e.g.: 'var list: string array'
        this.convertType('**item type**', result, options);// #an Array can have **item type** e.g.: 'var list: string array'
        //return result
        return result;
     };
//#### Helper method convertType(internalName, result: Names.ConvertResult, options: Names.NameDeclOptions) 
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
        //var converted:Names.Declaration
        var converted = undefined;
        //# if the typeRef is a varRef, get reference 
        //if typeRef instanceof Grammar.VariableRef
        if (typeRef instanceof Grammar.VariableRef) {
            //declare typeRef:Grammar.VariableRef
            
            //converted = typeRef.tryGetReference()
            converted = typeRef.tryGetReference();
        }
        else if (typeof typeRef === 'string') {// #built-in class or local var
        //else if typeof typeRef is 'string' #built-in class or local var
            //if no .nodeDeclared #converting typeRef for a var not declared in code
            if (!this.nodeDeclared) {// #converting typeRef for a var not declared in code
              //converted = globalPrototype(typeRef)
              converted = globalPrototype(typeRef);
            }
            else {
            //else
              //converted = .nodeDeclared.findInScope(typeRef)
              converted = this.nodeDeclared.findInScope(typeRef);
            };
            //end if
            
        }
        else {
        //else
            //declare valid typeRef.constructor.name
            
            //.sayErr "INTERNAL ERROR: convertType UNRECOGNIZED type of:'#{typeof typeRef}' on #{internalName}: '#{typeRef}' [#{typeRef.constructor.name}]"
            this.sayErr("INTERNAL ERROR: convertType UNRECOGNIZED type of:'" + (typeof typeRef) + "' on " + internalName + ": '" + typeRef + "' [" + typeRef.constructor.name + "]");
            //return
            return;
        };
        //end if #check instance of "typeRef"
        
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
        else {
        //else
            //result.failures++
            result.failures++;
            //if options and options.informError, .sayErr "Undeclared type: '#{typeRef.toString()}'"
            if (options && options.informError) {this.sayErr("Undeclared type: '" + (typeRef.toString()) + "'")};
        };
        //end if
        
        //return 
        return;
     };
//#### helper method assignTypeFromValue(value) 
     Names.Declaration.prototype.assignTypeFromValue = function(value){
//if we can determine assigned value type, set var type
      //declare valid value.getResultType
      
      //var valueNameDecl = value.getResultType()
      var valueNameDecl = value.getResultType();
//now set var type (unless is "null" or "undefined", because they destroy type info)
      //if valueNameDecl instance of Names.Declaration 
      if (valueNameDecl instanceof Names.Declaration && ["undefined", "null"].indexOf(valueNameDecl.name)===-1) {
        //and valueNameDecl.name not in ["undefined","null"]
            //var theType
            var theType = undefined;
            //if valueNameDecl.name is 'prototype' # getResultType returns a class prototype
            if (valueNameDecl.name === 'prototype') {// # getResultType returns a class prototype
                //// use the class as type
                //theType = valueNameDecl
                theType = valueNameDecl;
            }
            else {
            //else 
                ////we assume valueNameDecl is a simple var, then we try to get **proto**
                //theType = valueNameDecl.findOwnMember('**proto**') or valueNameDecl
                theType = valueNameDecl.findOwnMember('**proto**') || valueNameDecl;
            };
            //end if
            
            //// assign type: now both nameDecls points to same type
            //.setMember '**proto**', theType 
            this.setMember('**proto**', theType);
      };
     };
//#### helper method assignTypebyNameAffinity() 
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
                if (!(possibleClassRef) && this.name.length >= 6) {
                    //for each affinityName,classRef in map nameAffinity.members
                    var classRef=undefined;
                    if(!nameAffinity.members.dict) throw(new Error("for each in map: not a Map, no .dict property"));
                    for ( var affinityName in nameAffinity.members.dict) if (nameAffinity.members.dict.hasOwnProperty(affinityName)){classRef=nameAffinity.members.dict[affinityName];
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
//### Append to class ASTBase
    
//#### properties
        //scope: Names.Declaration //for nodes with scope
     
//#### helper method declareName(name, options) 
     ASTBase.prototype.declareName = function(name, options){
//declareName creates a new Names.Declaration, *referecing source as nodeDeclared (AST node)*
        //return new Names.Declaration(name, options, this)
        return new Names.Declaration(name, options, this);
     };
//#### method addMemberTo(nameDecl, memberName, options)  returns Names.Declaration
     ASTBase.prototype.addMemberTo = function(nameDecl, memberName, options){
//a Helper method ASTBase.*addMemberTo*
//Adds a member to a NameDecl, referencing this node as nodeDeclared
        
        //return nameDecl.addMember(memberName, options, this)
        return nameDecl.addMember(memberName, options, this);
     };
//#### Helper method tryGetMember(nameDecl, name:string, options:Names.NameDeclOptions)
     ASTBase.prototype.tryGetMember = function(nameDecl, name, options){
//this method looks for a specific member, optionally declare as forward
//or inform error. We need this AST node, to correctly report error.
        
        //default options = new Names.NameDeclOptions
        if(options===undefined) options=new Names.NameDeclOptions();
  
        //var found = nameDecl.findMember(name)
        var found = nameDecl.findMember(name);
        
        //if found and name.slice(0,2) isnt '**'
        if (found && name.slice(0, 2) !== '**') {
          //found.caseMismatch name,this
          found.caseMismatch(name, this);
        }
        else {
        
        //else #not found
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
//#### helper method getScopeNode() 
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
              return node;// # found a node with scope
          };
          //node = node.parent # move up
          node = node.parent;// # move up
        };// end loop
        //#loop
        //return null
        return null;
     };
//#### method findInScope(name) returns Names.Declaration
     ASTBase.prototype.findInScope = function(name){
//this method looks for the original place 
//where a name was defined (function,method,var) 
//Returns the Identifier node from the original scope
//It's used to validate variable references to be previously declared names
//Start at this node
        //var node = this
        var node = this;
//Look for the declaration in this scope
        //while node
        while(node){
          //if node.scope
          if (node.scope) {
              //if node.scope.findOwnMember(name) into var found
              var found=undefined;
              if ((found=node.scope.findOwnMember(name))) {
                  //return found
                  return found;
              };
          };
//move up in scopes
          //node = node.parent
          node = node.parent;
        };// end loop
        
     };
        //#loop
//#### method tryGetFromScope(name, options:Names.NameDeclOptions) returns Names.Declaration
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
            
        }
        else {
//if it is not found,check options: a) inform error. b) declare foward.
        //else
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
                if (options.isDummy && String.isCapitalized(name)) {// #let's assume is a class
                    //.addMemberTo(found,'prototype',options)
                    this.addMemberTo(found, 'prototype', options);
                };
            };
        };
        //#end if - check declared variables 
        //return found
        return found;
     };
//#### method addToScope(item, options:Names.NameDeclOptions) returns Names.Declaration 
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
//#### method addToSpecificScope(scope:Names.Declaration, item, options:Names.NameDeclOptions) returns Names.Declaration 
     ASTBase.prototype.addToSpecificScope = function(scope, item, options){
        //declare valid item.name
        
        //var name = type of item is 'string'? item : item.name
        var name = typeof item === 'string' ? item : item.name;
        //logger.debug "addToScope: '#{name}' to '#{scope.name}'" #[#{.constructor.name}] name:
        logger.debug("addToScope: '" + name + "' to '" + scope.name + "'");// #[#{.constructor.name}] name:
        //if .findInScope(name) into var found 
        var found=undefined;
        if ((found=this.findInScope(name))) {
            //if found.caseMismatch(name, this)
            if (found.caseMismatch(name, this)) {
              //#case mismatch informed
              //do nothing
              null;
            }
            else if (found.isForward) {
            //else if found.isForward
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
            else {
            //else 
              //.sayErr "DUPLICATED name in scope: '#{name}'"
              this.sayErr("DUPLICATED name in scope: '" + name + "'");
              //logger.error found.originalDeclarationPosition() #add extra information line
              logger.error(found.originalDeclarationPosition());// #add extra information line
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
        else {
        //else
          //nameDecl = .declareName(name,options)
          nameDecl = this.declareName(name, options);
        };
        //scope.addMember nameDecl
        scope.addMember(nameDecl);
        //return nameDecl
        return nameDecl;
     };
//#### Helper method createScope()
     ASTBase.prototype.createScope = function(){
//initializes an empty scope in this node
        //if no .scope 
        if (!this.scope) {
          //var options=new Names.NameDeclOptions
          var options = new Names.NameDeclOptions();
          //options.normalizeModeKeepFirstCase = true
          options.normalizeModeKeepFirstCase = true;
          //.scope = .declareName("[#{.constructor.name} Scope]", options)
          this.scope = this.declareName("[" + this.constructor.name + " Scope]", options);
          //.scope.isScope = true
          this.scope.isScope = true;
        };
        //return .scope
        return this.scope;
     };
//#### helper method tryGetOwnerNameDecl( informError ) returns Names.Declaration
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
            toNamespace = parent.toNamespace;// #if it was 'append to namespace'
            //#get referenced class/namespace
            //if no parent.varRef.tryGetReference() into ownerDecl
            if (!((ownerDecl=parent.varRef.tryGetReference()))) {
                //if informError 
                if (informError) {
                    //.sayErr "Append to: '#{parent.varRef}'. Reference is not fully declared"
                    this.sayErr("Append to: '" + parent.varRef + "'. Reference is not fully declared");
                };
                //return //if no ownerDecl found
                return; //if no ownerDecl found
            };
        }
        else {
        //else # directly inside a ClassDeclaration|NamespaceDeclaration
            //toNamespace = parent.constructor is Grammar.NamespaceDeclaration
            toNamespace = parent.constructor === Grammar.NamespaceDeclaration;
            //ownerDecl = parent.nameDecl
            ownerDecl = parent.nameDecl;
        };
        //end if
        
//check if owner is class (namespace) or class.prototype (class)
        //if toNamespace 
        if (toNamespace) {
            //#'append to namespace'/'namespace x'. Members are added directly to owner
            //return ownerDecl
            return ownerDecl;
        }
        else {
        //else
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
        
     };
//#### helper method callOnSubTree(methodSymbol,excludeClass) # recursive
     ASTBase.prototype.callOnSubTree = function(methodSymbol, excludeClass){// # recursive
//This is instance has the method, call the method on the instance
      ////logger.debugGroup "callOnSubTree #{.constructor.name}.#{LiteCore.getSymbolName(methodSymbol)}() - '#{.name}'"
  
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
//recurse on this properties and Arrays (exclude 'parent' and 'importedModule')
      //for each property name,value in this
      var value=undefined;
      for ( var name in this)if (this.hasOwnProperty(name)){value=this[name];
      if(['constructor', 'parent', 'importedModule', 'requireCallNodes', 'exportDefault'].indexOf(name)===-1){
        //where name not in ['constructor','parent','importedModule','requireCallNodes','exportDefault']
            //if value instance of ASTBase 
            if (value instanceof ASTBase) {
                //declare value:ASTBase
                
                //value.callOnSubTree methodSymbol,excludeClass #recurse
                value.callOnSubTree(methodSymbol, excludeClass);// #recurse
            }
            else if (value instanceof Array) {
            //else if value instance of Array
                //declare value:array 
                
                ////logger.debug "callOnSubArray #{.constructor.name}.#{name}[]"
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
      
     };
      ////logger.debugGroupEnd
//### Append to class Grammar.Module ###
    
//#### Helper method addToExport(exportedNameDecl)
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
//#### Helper method confirmExports()
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
      for ( var nameDecl__propName in this.exports.members.dict) if (this.exports.members.dict.hasOwnProperty(nameDecl__propName)){nameDecl=this.exports.members.dict[nameDecl__propName];
          {
          //if nameDecl.name is .fileInfo.base and (nameDecl.nodeClass in [Grammar.NamespaceDeclaration, Grammar.ClassDeclaration])
          if (nameDecl.name === this.fileInfo.base && ([Grammar.NamespaceDeclaration, Grammar.ClassDeclaration].indexOf(nameDecl.nodeClass)>=0)) {
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
              //for each nameDecl in map .exports.members
              var nameDecl=undefined;
              if(!this.exports.members.dict) throw(new Error("for each in map: not a Map, no .dict property"));
              for ( var nameDecl__propName in this.exports.members.dict) if (this.exports.members.dict.hasOwnProperty(nameDecl__propName)){nameDecl=this.exports.members.dict[nameDecl__propName];
                  {
                  //nameDecl.warn 'default export: cannot have "public functions/vars" and also a class/namespace named as the module (default export)'
                  nameDecl.warn('default export: cannot have "public functions/vars" and also a class/namespace named as the module (default export)');
                  }
                  
                  }// end for each property
              
          };
          ////replace
          //.exports.makePointTo exportDefaultNameDecl
          this.exports.makePointTo(exportDefaultNameDecl);
          //.exportsReplaced = true
          this.exportsReplaced = true;
      };
     };
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
      
      //helper method createNameDeclaration()  
      Grammar.VariableDecl.prototype.createNameDeclaration = function(){
        //var options = new Names.NameDeclOptions
        var options = new Names.NameDeclOptions();
        //options.type = .type
        options.type = this.type;
        //options.itemType = .itemType
        options.itemType = this.itemType;
        //return .declareName(.name,options)
        return this.declareName(this.name, options);
      };
      //helper method declareInScope()  
      Grammar.VariableDecl.prototype.declareInScope = function(){
          //.nameDecl = .addToScope(.createNameDeclaration())
          this.nameDecl = this.addToScope(this.createNameDeclaration());
      };
      //helper method getTypeFromAssignedValue() 
      Grammar.VariableDecl.prototype.getTypeFromAssignedValue = function(){
          //// if it has an assigned value
          //if .nameDecl and .assignedValue and .nameDecl.name isnt 'prototype'
          if (this.nameDecl && this.assignedValue && this.nameDecl.name !== 'prototype') {
              
              //if .assignedValue instanceof Grammar.Expression
              var type=undefined;
              if (this.assignedValue instanceof Grammar.Expression && [Grammar.StringLiteral, Grammar.NumberLiteral].indexOf(this.assignedValue.root.name.constructor)>=0) {
                //and .assignedValue.root.name.constructor in [Grammar.StringLiteral,Grammar.NumberLiteral]
                    //var theLiteral = .assignedValue.root.name
                    var theLiteral = this.assignedValue.root.name;
                    //// if it is assigning a literal, force type to string|number|array
                    //.nameDecl.setMember('**proto**', globalPrototype(theLiteral.type))
                    this.nameDecl.setMember('**proto**', globalPrototype(theLiteral.type));
              }
              else if (!((type=this.nameDecl.findOwnMember('**proto**')))) {// #if has no type
              //else if no .nameDecl.findOwnMember('**proto**') into var type #if has no type
                  //if .assignedValue.getResultType() into var result #get assignedValue type
                  var result=undefined;
                  if ((result=this.assignedValue.getResultType())) {// #get assignedValue type
                      //.nameDecl.setMember('**proto**', result) #assign to this.nameDecl
                      this.nameDecl.setMember('**proto**', result);// #assign to this.nameDecl
                  };
              };
          };
      };
//### Append to class Grammar.VarStatement ###
    
     //method declare()  # pass 1
     Grammar.VarStatement.prototype.declare = function(){// # pass 1
        //var moduleNode:Grammar.Module = .getParent(Grammar.Module)
        var moduleNode = this.getParent(Grammar.Module);
        //for each varDecl in .list
        for( var varDecl__inx=0,varDecl ; varDecl__inx<this.list.length ; varDecl__inx++){varDecl=this.list[varDecl__inx];
        
            //varDecl.declareInScope
            varDecl.declareInScope();
            //if .hasAdjective("export")
            if (this.hasAdjective("export")) {
                ////mark as public
                //varDecl.nameDecl.isPublicVar = true
                varDecl.nameDecl.isPublicVar = true;
                //moduleNode.addToExport varDecl.nameDecl
                moduleNode.addToExport(varDecl.nameDecl);
            };
            //if varDecl.aliasVarRef
            if (varDecl.aliasVarRef) {
                ////Example: "public var $ = jQuery" => declare alias $ for jQuery
                //var opt = new Names.NameDeclOptions
                var opt = new Names.NameDeclOptions();
                //opt.informError= true
                opt.informError = true;
                //if varDecl.aliasVarRef.tryGetReference(opt) into var ref
                var ref=undefined;
                if ((ref=varDecl.aliasVarRef.tryGetReference(opt))) {
                    //# aliases share .members
                    //varDecl.nameDecl.members = ref.members
                    varDecl.nameDecl.members = ref.members;
                };
            };
        };// end for each in this.list
        
     };
                     
     //method evaluateAssignments() # pass 4, determine type from assigned value
     Grammar.VarStatement.prototype.evaluateAssignments = function(){// # pass 4, determine type from assigned value
        //for each varDecl in .list
        for( var varDecl__inx=0,varDecl ; varDecl__inx<this.list.length ; varDecl__inx++){varDecl=this.list[varDecl__inx];
        
            //varDecl.getTypeFromAssignedValue
            varDecl.getTypeFromAssignedValue();
        };// end for each in this.list
        
     };
//### Append to class Grammar.WithStatement ###
    
      //properties nameDecl
      
      //method declare()  # pass 1
      Grammar.WithStatement.prototype.declare = function(){// # pass 1
         //.nameDecl = .addToScope(.declareName(.name))
         this.nameDecl = this.addToScope(this.declareName(this.name));
      };
      //method evaluateAssignments() # pass 4, determine type from assigned value
      Grammar.WithStatement.prototype.evaluateAssignments = function(){// # pass 4, determine type from assigned value
        //.nameDecl.assignTypeFromValue .varRef
        this.nameDecl.assignTypeFromValue(this.varRef);
      };
      
//### Append to class Grammar.ImportStatementItem ###
    
      //properties nameDecl
      
      //method declare #pass 1: declare name choosed for imported(required) contents as a scope var
      Grammar.ImportStatementItem.prototype.declare = function(){// #pass 1: declare name choosed for imported(required) contents as a scope var
        //if no .getParent(Grammar.DeclareStatement) #except for 'global declare'
        if (!this.getParent(Grammar.DeclareStatement)) {// #except for 'global declare'
            //if .hasAdjective('shim') and .findInScope(.name), return // do not import if shim and already declared
            if (this.hasAdjective('shim') && this.findInScope(this.name)) {return};
            //.nameDecl = .addToScope(.name)
            this.nameDecl = this.addToScope(this.name);
        };
      };
//----------------------------
///*
//### Append to class Grammar.NamespaceDeclaration
//#### method declare()
        //.nameDecl = .addToScope(.declareName(.name))
        //.createScope
//*/
        
//### Append to class Grammar.ClassDeclaration 
    
//also AppendToDeclaration and NamespaceDeclaration (child classes).
//#### properties
      //nameDecl
     
      ////container: Grammar.NamespaceDeclaration // in which namespace this class/namespace is declared
//#### method declare()
     Grammar.ClassDeclaration.prototype.declare = function(){
//AppendToDeclarations do not "declare" anything at this point. 
//AppendToDeclarations add to a existing classes or namespaces. 
//The adding is delayed until pass:"processAppendToExtends", where
//append-To var reference is searched in the scope 
//and methods and properties are added. 
//This need to be done after all declarations.
        //if this.constructor is Grammar.AppendToDeclaration, return
        if (this.constructor === Grammar.AppendToDeclaration) {return};
//Check if it is a class or a namespace
        //var isNamespace = this.constructor is Grammar.NamespaceDeclaration
        var isNamespace = this.constructor === Grammar.NamespaceDeclaration;
        //var isClass = this.constructor is Grammar.ClassDeclaration
        var isClass = this.constructor === Grammar.ClassDeclaration;
        //var opt = new Names.NameDeclOptions
        var opt = new Names.NameDeclOptions();
        //if isNamespace 
        if (isNamespace) {
            //.nameDecl = .declareName(.name)
            this.nameDecl = this.declareName(this.name);
        }
        else {
        //else 
//if is a class adjectivated "shim", do not declare if already exists
    
            //if .hasAdjective('shim') 
            if (this.hasAdjective('shim')) {
                //if .tryGetFromScope(.name) 
                if (this.tryGetFromScope(this.name)) {
                    //return 
                    return;
                };
            };
//declare the class
            //opt.type = globalPrototype('Function')
            opt.type = globalPrototype('Function');
            //.nameDecl = .declareName(.name,opt) //class
            this.nameDecl = this.declareName(this.name, opt); //class
            //opt.type = undefined
            opt.type = undefined;
        };
//get parent. We cover here class/namespaces directly declared inside namespaces (without AppendTo)
        //var container = .getParent(Grammar.NamespaceDeclaration)
        var container = this.getParent(Grammar.NamespaceDeclaration);
//if it is declared inside a namespace, it becomes a item of the namespace
        //if container
        if (container) {
            //declare container: Grammar.NamespaceDeclaration
            
            //container.nameDecl.addMember .nameDecl
            container.nameDecl.addMember(this.nameDecl);
        }
        else {
//else, is a module-level class|namespace. Add to scope
        //else
            //.addToScope .nameDecl 
            this.addToScope(this.nameDecl);
//if id the default export object, or interface file, or has adjective public/export, 
//add also to module.exports
            //var moduleNode:Grammar.Module = .getParent(Grammar.Module)
            var moduleNode = this.getParent(Grammar.Module);
            //if moduleNode.fileInfo.base is .name or moduleNode.fileInfo.isInterface or .hasAdjective('export') 
            if (moduleNode.fileInfo.base === this.name || moduleNode.fileInfo.isInterface || this.hasAdjective('export')) {
                //moduleNode.addToExport .nameDecl 
                moduleNode.addToExport(this.nameDecl);
            };
        };
//if it is a Class, we create 'Class.prototype' member
//Class's properties & methods will be added to 'prototype' as valid member members.
//'prototype' starts with 'constructor' which is a pointer to the class-funcion itself
        //if isClass
        if (isClass) {
            //var prtypeNameDecl = .nameDecl.findOwnMember('prototype') or .addMemberTo(.nameDecl,'prototype')
            var prtypeNameDecl = this.nameDecl.findOwnMember('prototype') || this.addMemberTo(this.nameDecl, 'prototype');
            //if .varRefSuper, prtypeNameDecl.setMember('**proto**',.varRefSuper)
            if (this.varRefSuper) {prtypeNameDecl.setMember('**proto**', this.varRefSuper)};
            //opt.pointsTo = .nameDecl
            opt.pointsTo = this.nameDecl;
            //prtypeNameDecl.addMember('constructor',opt) 
            prtypeNameDecl.addMember('constructor', opt);
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
//#### method validatePropertyAccess() 
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
        for ( var propNameDecl__propName in prt.members.dict) if (prt.members.dict.hasOwnProperty(propNameDecl__propName)){propNameDecl=prt.members.dict[propNameDecl__propName];
        if(propNameDecl.nodeClass === Grammar.VariableDecl){
                //propNameDecl.checkSuperChainProperties .nameDecl.superDecl
                propNameDecl.checkSuperChainProperties(this.nameDecl.superDecl);
                }
                
                }// end for each property
        
     };
//### Append to class Grammar.ArrayLiteral ###
    
     //properties nameDecl
     
     //method declare
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
     Grammar.ArrayLiteral.prototype.getResultType = function(){
          //return tryGetGlobalPrototype('Array')
          return tryGetGlobalPrototype('Array');
     };
//### Append to class Grammar.ObjectLiteral ###
    
///*
     //properties nameDecl
     //method declare
//When producing C-code, an ObjectLiteral creates a "Map string to any" on the fly, 
//but it does not declare a valid type/class.
        //if project.options.target is 'c'
            //.nameDecl = .declareName(UniqueID.getVarName('_literalMap'))
            //.getParent(Grammar.Module).addToScope .nameDecl
        
        //else
            //if .parent.hasProperty("nameDecl")
                  //.nameDecl = .parent.nameDecl 
            //else
                  //.nameDecl = .declareName(UniqueID.getVarName('*ObjectLiteral*'))
//*/
//When producing the LiteScript-to-C compiler, a ObjectLiteral's return type is 'Map string to any'
     //method getResultType
     Grammar.ObjectLiteral.prototype.getResultType = function(){
          //return tryGetGlobalPrototype( project.options.target is 'c'? 'Map' else 'Object')
          return tryGetGlobalPrototype(project.options.target === 'c' ? 'Map' : 'Object');
     };
///*        if project.options.target is 'c' 
            //return tryGetGlobalPrototype('Map')
        //else
            //return  .nameDecl
//*/
///*
//### Append to class Grammar.NameValuePair ###
    
     //properties nameDecl
     //method declare
//When producing C-code, a ObjectLiteral creates a "Map string to any" on the fly, 
//but it does not declare a valid type/class.
        //if project.options.target is 'c', return
        //declare valid .parent.nameDecl
        //.nameDecl = .addMemberTo(.parent.nameDecl, .name)
//check if we can determine type from value 
        //if .type and .type instance of Names.Declaration and .type.name not in ["undefined","null"]
            //.nameDecl.setMember '**proto**', .type
        //else if .value
            //.nameDecl.assignTypeFromValue .value
//*/
//### Append to class Grammar.FunctionDeclaration ###
    
//`FunctionDeclaration: '[export][generator] (function|method|constructor) [name] '(' FunctionParameterDecl* ')' Block`
     //properties 
        //nameDecl 
        //declared:boolean
     
//#### Method declare() ## function, methods and constructors
     Grammar.FunctionDeclaration.prototype.declare = function(){// ## function, methods and constructors
      //var ownerNameDecl
      var ownerNameDecl = undefined;
      //var isMethod = .constructor is Grammar.MethodDeclaration
      var isMethod = this.constructor === Grammar.MethodDeclaration;
      //var isFunction = .constructor is Grammar.FunctionDeclaration
      var isFunction = this.constructor === Grammar.FunctionDeclaration;
      //var opt = new Names.NameDeclOptions
      var opt = new Names.NameDeclOptions();
//1st: Grammar.FunctionDeclaration
//if it is not anonymous, add function name to parent scope,
//if its 'public/export' (or we're processing an "interface" file), add to exports
      //if isFunction
      if (isFunction) {
          //opt.type = globalPrototype('Function')
          opt.type = globalPrototype('Function');
          //.nameDecl = .addToScope(.name,opt)
          this.nameDecl = this.addToScope(this.name, opt);
          //var moduleNode:Grammar.Module=.getParent(Grammar.Module)
          var moduleNode = this.getParent(Grammar.Module);
          //if .hasAdjective('export') or moduleNode.fileInfo.isInterface
          if (this.hasAdjective('export') || moduleNode.fileInfo.isInterface) {
              //moduleNode.addToExport .nameDecl
              moduleNode.addToExport(this.nameDecl);
          };
      }
      else if ((ownerNameDecl=this.tryGetOwnerNameDecl())) {
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
          //if .constructor isnt Grammar.ConstructorDeclaration 
          if (this.constructor !== Grammar.ConstructorDeclaration) {
              ////the constructor is the Function-Class itself
              //// so it is not a member function
              //.addMethodToOwnerNameDecl ownerNameDecl
              this.addMethodToOwnerNameDecl(ownerNameDecl);
          };
      };
      //end if
      
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
      //opt.type='any*'
      opt.type = 'any*';
      //.addMemberTo(scope,'arguments',opt)
      this.addMemberTo(scope, 'arguments', opt);
      //if not isFunction
      if (!(isFunction)) {
          //var addThis = false
          var addThis = false;
          //var containerClassDeclaration = .getParent(Grammar.ClassDeclaration) //also append-to & NamespaceDeclaration
          var containerClassDeclaration = this.getParent(Grammar.ClassDeclaration); //also append-to & NamespaceDeclaration
          //if containerClassDeclaration.constructor is Grammar.ClassDeclaration
          if (containerClassDeclaration.constructor === Grammar.ClassDeclaration) {
              //addThis = true
              addThis = true;
          }
          else if (containerClassDeclaration.constructor === Grammar.AppendToDeclaration) {
          //else if containerClassDeclaration.constructor is Grammar.AppendToDeclaration
              //declare containerClassDeclaration:Grammar.AppendToDeclaration
              
              //addThis = not containerClassDeclaration.toNamespace
              addThis = !(containerClassDeclaration.toNamespace);
          };
          //if addThis 
          if (addThis) {
              //opt.type=ownerNameDecl
              opt.type = ownerNameDecl;
              //.addMemberTo(scope,'this',opt)
              this.addMemberTo(scope, 'this', opt);
          };
      };
//Note: only class methods have 'this' as parameter
//add parameters to function's scope
      //if .paramsDeclarations
      if (this.paramsDeclarations) {
          //for each varDecl in .paramsDeclarations
          for( var varDecl__inx=0,varDecl ; varDecl__inx<this.paramsDeclarations.length ; varDecl__inx++){varDecl=this.paramsDeclarations[varDecl__inx];
          
              //varDecl.declareInScope
              varDecl.declareInScope();
          };// end for each in this.paramsDeclarations
          
      };
     };
//#### helper method addMethodToOwnerNameDecl(owner:Names.Declaration)  ## methods
     Grammar.FunctionDeclaration.prototype.addMethodToOwnerNameDecl = function(owner){// ## methods
      //var actual = owner.findOwnMember(.name)
      var actual = owner.findOwnMember(this.name);
      //if actual and .hasAdjective('shim') #shim for an exising method, do nothing
      if (actual && this.hasAdjective('shim')) {// #shim for an exising method, do nothing
        //return
        return;
      };
//Add to owner, type is 'Function'
      //if no .nameDecl 
      if (!this.nameDecl) {
          //var opt = new Names.NameDeclOptions
          var opt = new Names.NameDeclOptions();
          //opt.type=globalPrototype('Function')
          opt.type = globalPrototype('Function');
          //.nameDecl = .declareName(.name,opt)
          this.nameDecl = this.declareName(this.name, opt);
      };
      
      //.declared = true
      this.declared = true;
      //.addMemberTo owner, .nameDecl
      this.addMemberTo(owner, this.nameDecl);
     };
//#### method createReturnType() returns string ## functions & methods
     Grammar.FunctionDeclaration.prototype.createReturnType = function(){// ## functions & methods
      //if no .nameDecl, return #nowhere to put definitions
      if (!this.nameDecl) {return};
//Define function's return type from parsed text
      //if .itemType
      if (this.itemType) {
//if there's a "itemType", it means type is: `TypeX Array`. 
//We create a intermediate type for `TypeX Array` 
//and set this new nameDecl as function's **return type**
          //var composedName = '#{.itemType.toString()} Array'
          var composedName = '' + (this.itemType.toString()) + ' Array';
//check if it alerady exists, if not found, create one. Type is 'Array'
        
          //if not globalScope.findMember(composedName) into var intermediateNameDecl
          var intermediateNameDecl=undefined;
          if (!((intermediateNameDecl=globalScope.findMember(composedName)))) {
              //var opt = new Names.NameDeclOptions
              var opt = new Names.NameDeclOptions();
              //opt.type = globalPrototype('Array')
              opt.type = globalPrototype('Array');
              //intermediateNameDecl = globalScope.addMember(composedName,opt)
              intermediateNameDecl = globalScope.addMember(composedName, opt);
          };
//item type, is each array member's type 
          //intermediateNameDecl.setMember "**item type**", .itemType
          intermediateNameDecl.setMember("**item type**", this.itemType);
          //.nameDecl.setMember '**return type**', intermediateNameDecl
          this.nameDecl.setMember('**return type**', intermediateNameDecl);
          //return intermediateNameDecl
          return intermediateNameDecl;
      }
      else {
//else, it's a simple type
      //else 
          //if .type then .nameDecl.setMember('**return type**', .type)
          if (this.type) {this.nameDecl.setMember('**return type**', this.type)};
          //return .type
          return this.type;
      };
     };
//### Append to class Grammar.AppendToDeclaration ###
    
//#### method processAppendToExtends() 
     Grammar.AppendToDeclaration.prototype.processAppendToExtends = function(){
//when target is '.c' we do not allow treating classes as namespaces
//so an "append to namespace classX" should throw an error
    
//get referenced class/namespace
      //if no .varRef.tryGetReference() into var ownerDecl
      var ownerDecl=undefined;
      if (!((ownerDecl=this.varRef.tryGetReference()))) {
          //.sayErr "Append to: '#{.varRef}'. Reference is not fully declared"
          this.sayErr("Append to: '" + this.varRef + "'. Reference is not fully declared");
          //return //if no ownerDecl found
          return; //if no ownerDecl found
      };
      //if not .toNamespace
      if (!(this.toNamespace)) {
          ////if is "append to class"
          //if no ownerDecl.findOwnMember('prototype') into var prt, .throwError "Append to: class '#{ownerDecl}' has no prototype"
          var prt=undefined;
          if (!((prt=ownerDecl.findOwnMember('prototype')))) {this.throwError("Append to: class '" + ownerDecl + "' has no prototype")};
          //ownerDecl=prt // append to class, adds to prototype
          ownerDecl = prt; // append to class, adds to prototype
      };
      ////if project.options.target is 'c'
      ////    if .toNamespace and prt
      ////        .sayErr "Append to: '#{.varRef}'. For C production, cannot append to class as namespace."
      //for each item in .body.statements
      for( var item__inx=0,item ; item__inx<this.body.statements.length ; item__inx++){item=this.body.statements[item__inx];
      
          //case item.specific.constructor
          
              //when Grammar.PropertiesDeclaration:
          if ((item.specific.constructor==Grammar.PropertiesDeclaration)
          ){
                  //declare item.specific:Grammar.PropertiesDeclaration
                  
                  //if not item.specific.declared, item.specific.declare(informError=true) 
                  if (!(item.specific.declared)) {item.specific.declare(true)};
          
          }
              //when Grammar.MethodDeclaration:
          else if ((item.specific.constructor==Grammar.MethodDeclaration)
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
          else if ((item.specific.constructor==Grammar.ClassDeclaration)
          ){
                  //declare item.specific:Grammar.ClassDeclaration
                  
                  //ownerDecl.addMember item.specific.nameDecl                 
                  ownerDecl.addMember(item.specific.nameDecl);
          
          }
              //when Grammar.EndStatement:
          else if ((item.specific.constructor==Grammar.EndStatement)
          ){
                  //do nothing
                  null;
          
          }
          else {
              //else
                  //.sayErr 'unexpected "#{item.specific.constructor.name}" inside Append-to Declaration'
                  this.sayErr('unexpected "' + item.specific.constructor.name + '" inside Append-to Declaration');
          };
      };// end for each in this.body.statements
      
     };
//### Append to class Names.Declaration ###
    
//#### Properties 
      //superDecl : Names.Declaration //nameDecl of the super class
     
//#### method checkSuperChainProperties(superClassNameDecl)
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
//### Append to class Grammar.ClassDeclaration ###
    
//#### method processAppendToExtends() 
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
              return; //if no superClassNameDecl found
          };
          //.nameDecl.superDecl = superClassNameDecl
          this.nameDecl.superDecl = superClassNameDecl;
      };
     };
//### Append to class Grammar.PropertiesDeclaration ###
    
     //properties 
        //nameDecl 
        //declared:boolean 
     
//#### method declare(informError) 
     Grammar.PropertiesDeclaration.prototype.declare = function(informError){
//Add all properties as members of its owner object (normally: class.prototype)
        //var opt= new Names.NameDeclOptions
        var opt = new Names.NameDeclOptions();
        //if .tryGetOwnerNameDecl(informError) into var ownerNameDecl 
        var ownerNameDecl=undefined;
        if ((ownerNameDecl=this.tryGetOwnerNameDecl(informError))) {
            //for each varDecl in .list
            for( var varDecl__inx=0,varDecl ; varDecl__inx<this.list.length ; varDecl__inx++){varDecl=this.list[varDecl__inx];
            
                //opt.type = varDecl.type
                opt.type = varDecl.type;
                //opt.itemType = varDecl.itemType
                opt.itemType = varDecl.itemType;
                //varDecl.nameDecl = varDecl.addMemberTo(ownerNameDecl,varDecl.name,opt)
                varDecl.nameDecl = varDecl.addMemberTo(ownerNameDecl, varDecl.name, opt);
            };// end for each in this.list
            //.declared = true
            this.declared = true;
        };
     };
//#### method evaluateAssignments() # determine type from assigned value on properties declaration
     Grammar.PropertiesDeclaration.prototype.evaluateAssignments = function(){// # determine type from assigned value on properties declaration
        //for each varDecl in .list
        for( var varDecl__inx=0,varDecl ; varDecl__inx<this.list.length ; varDecl__inx++){varDecl=this.list[varDecl__inx];
        
            //varDecl.getTypeFromAssignedValue
            varDecl.getTypeFromAssignedValue();
        };// end for each in this.list
        
     };
//### Append to class Grammar.ForStatement ###
    
//#### method declare()
     Grammar.ForStatement.prototype.declare = function(){
//a ForStatement has a 'Scope', indexVar & mainVar belong to the scope
        //.createScope
        this.createScope();
     };
//### Append to class Grammar.ForEachProperty ###
    
//#### method declare()
     Grammar.ForEachProperty.prototype.declare = function(){
        //default .mainVar.type = .iterable.itemType
        if(this.mainVar.type===undefined) this.mainVar.type=this.iterable.itemType;
        //.mainVar.declareInScope
        this.mainVar.declareInScope();
        //if .indexVar, .indexVar.declareInScope
        if (this.indexVar) {this.indexVar.declareInScope()};
     };
//#### method evaluateAssignments() 
     Grammar.ForEachProperty.prototype.evaluateAssignments = function(){
//ForEachProperty: index is: string for js (property name) and number for C (symbol)
        //if .indexVar
        if (this.indexVar) {
        
            //var indexType = project.options.target is 'js'? 'String':'Number'
            var indexType = project.options.target === 'js' ? 'String' : 'Number';
            //.indexVar.nameDecl.setMember('**proto**',globalPrototype(indexType))
            this.indexVar.nameDecl.setMember('**proto**', globalPrototype(indexType));
        };
     };
//### Append to class Grammar.ForEachInArray ###
    
//#### method declare()
     Grammar.ForEachInArray.prototype.declare = function(){
        //default .mainVar.type = .iterable.itemType
        if(this.mainVar.type===undefined) this.mainVar.type=this.iterable.itemType;
        //.mainVar.declareInScope
        this.mainVar.declareInScope();
        //if .indexVar, .indexVar.declareInScope
        if (this.indexVar) {this.indexVar.declareInScope()};
     };
//#### method evaluateAssignments() 
     Grammar.ForEachInArray.prototype.evaluateAssignments = function(){
//ForEachInArray:
//If no mainVar.type, guess type from iterable's itemType
        //if no .mainVar.nameDecl.findOwnMember('**proto**')
        if (!this.mainVar.nameDecl.findOwnMember('**proto**')) {
            //var iterableType:Names.Declaration = .iterable.getResultType()          
            var iterableType = this.iterable.getResultType();
            //if iterableType and iterableType.findOwnMember('**item type**')  into var itemType
            var itemType=undefined;
            if (iterableType && (itemType=iterableType.findOwnMember('**item type**'))) {
                //.mainVar.nameDecl.setMember('**proto**',itemType)
                this.mainVar.nameDecl.setMember('**proto**', itemType);
            };
        };
     };
//#### method validatePropertyAccess() 
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
        else if (!iterableType.findMember('length')) {
        //else if no iterableType.findMember('length')
            //.sayErr "ForEachInArray: no .length property declared in '#{.iterable}' type:'#{iterableType.toString()}'"
            this.sayErr("ForEachInArray: no .length property declared in '" + this.iterable + "' type:'" + (iterableType.toString()) + "'");
            //logger.error iterableType.originalDeclarationPosition()
            logger.error(iterableType.originalDeclarationPosition());
        };
     };
//### Append to class Grammar.ForIndexNumeric ###
    
//#### method declare()
     Grammar.ForIndexNumeric.prototype.declare = function(){
        //.indexVar.declareInScope
        this.indexVar.declareInScope();
     };
//### Append to class Grammar.ExceptionBlock
    
//`ExceptionBlock: (exception|catch) catchVar-IDENTIFIER Body [finally Body]`
      //method declare()
      Grammar.ExceptionBlock.prototype.declare = function(){
//Exception blocks have a scope
        //.createScope
        this.createScope();
        //var opt=new Names.NameDeclOptions
        var opt = new Names.NameDeclOptions();
        //opt.type= globalPrototype('Error')
        opt.type = globalPrototype('Error');
        //.addToScope .catchVar,opt
        this.addToScope(this.catchVar, opt);
      };
//### Append to class Grammar.VariableRef ### Helper methods
    
//`VariableRef: ['--'|'++']Identifier[Accessors]['--'|'++']`
//`VariableRef` is a Variable Reference. 
//#### method validatePropertyAccess() 
     Grammar.VariableRef.prototype.validatePropertyAccess = function(){
        //if .parent is instance of Grammar.DeclareStatement
        if (this.parent instanceof Grammar.DeclareStatement) {
            //declare valid .parent.specifier
            
            //if .parent.specifier is 'valid'
            if (this.parent.specifier === 'valid') {
                  //return #declare valid xx.xx.xx
                  return;// #declare valid xx.xx.xx
            };
        };
//Start with main variable name, to check property names
        //var opt = new Names.NameDeclOptions
        var opt = new Names.NameDeclOptions();
        //opt.informError=true
        opt.informError = true;
        //opt.isForward=true
        opt.isForward = true;
        //opt.isDummy=true
        opt.isDummy = true;
        //var actualVar = .tryGetFromScope(.name, opt)
        var actualVar = this.tryGetFromScope(this.name, opt);
//now follow each accessor
        //if no actualVar or no .accessors, return 
        if (!actualVar || !this.accessors) {return};
        //for each ac in .accessors
        for( var ac__inx=0,ac ; ac__inx<this.accessors.length ; ac__inx++){ac=this.accessors[ac__inx];
        
            //declare valid ac.name
            
//for PropertyAccess, check if the property name is valid 
            //if ac instanceof Grammar.PropertyAccess
            if (ac instanceof Grammar.PropertyAccess) {
                //opt.isForward=false
                opt.isForward = false;
                //actualVar = .tryGetMember(actualVar, ac.name,opt)
                actualVar = this.tryGetMember(actualVar, ac.name, opt);
            }
            else if (ac instanceof Grammar.IndexAccess) {
//else, for IndexAccess, the varRef type is now 'itemType'
//and next property access should be on defined members of the type
            //else if ac instanceof Grammar.IndexAccess
                //actualVar = actualVar.findMember('**item type**')
                actualVar = actualVar.findMember('**item type**');
            }
            else if (ac instanceof Grammar.FunctionAccess) {
//else, for FunctionAccess, the varRef type is now function's return type'
//and next property access should be on defined members of the return type
            //else if ac instanceof Grammar.FunctionAccess
                //if actualVar.findOwnMember('**proto**') into var prt
                var prt=undefined;
                if ((prt=actualVar.findOwnMember('**proto**'))) {
                    //if prt.name is 'prototype', prt=prt.parent
                    if (prt.name === 'prototype') {prt = prt.parent};
                    //if prt.name isnt 'Function'
                    if (prt.name !== 'Function') {
                        //.warn "function call. '#{actualVar}' is class '#{prt.name}', not 'Function'"
                        this.warn("function call. '" + actualVar + "' is class '" + prt.name + "', not 'Function'");
                    };
                };
                //actualVar = actualVar.findMember('**return type**')
                actualVar = actualVar.findMember('**return type**');
            };
            //if actualVar instanceof Grammar.VariableRef
            if (actualVar instanceof Grammar.VariableRef) {
                //declare actualVar:Grammar.VariableRef
                
                //opt.isForward=true
                opt.isForward = true;
                //actualVar = actualVar.tryGetReference(opt)
                actualVar = actualVar.tryGetReference(opt);
            };
            //if no actualVar, break
            if (!actualVar) {break};
        };// end for each in this.accessors
        //end for #each accessor
        
        //return actualVar
        return actualVar;
     };
//#### helper method tryGetReference(options:Names.NameDeclOptions) returns Names.Declaration
     Grammar.VariableRef.prototype.tryGetReference = function(options){
//evaluate this VariableRef. 
//Try to determine referenced NameDecl.
//if we can reach a reference, return reference.
//For classes, return ClassDeclaration.nameDecl (not ClassDeclaration.nameDecl.prototype)
        //default options= new Names.NameDeclOptions
        if(options===undefined) options=new Names.NameDeclOptions();
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
            else if (ac instanceof Grammar.IndexAccess) {
//else, for IndexAccess, the varRef type is now 'itemType'
//and next property access should be on defined members of the type
            //else if ac instanceof Grammar.IndexAccess
                //actualVar = .tryGetMember(actualVar, '**item type**')
                actualVar = this.tryGetMember(actualVar, '**item type**');
            }
            else if (ac instanceof Grammar.FunctionAccess) {
//else, for FunctionAccess, the varRef type is now function's return type'
//and next property access should be on defined members of the return type
            //else if ac instanceof Grammar.FunctionAccess
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
            else {
            //else
              //partial += ac.toString()
              partial += ac.toString();
            };
        };// end for each in this.accessors
        //end for #each accessor
        
        //if no actualVar and options.informError
        if (!actualVar && options.informError) {
            //.sayErr "'#{this}'. Reference can not be analyzed further than '#{partial}'"
            this.sayErr("'" + this + "'. Reference can not be analyzed further than '" + partial + "'");
        };
        //return actualVar
        return actualVar;
     };
//#### Helper Method getResultType() returns Names.Declaration
     Grammar.VariableRef.prototype.getResultType = function(){
      
      //return .tryGetReference()
      return this.tryGetReference();
     };
//-------
//### Append to class Grammar.AssignmentStatement ###
    
//#### method evaluateAssignments() ## Grammar.AssignmentStatement 
     Grammar.AssignmentStatement.prototype.evaluateAssignments = function(){// ## Grammar.AssignmentStatement
    
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
              //// if it is assigning a literal, force type to string|number|array
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
          
            //if createName # module.exports.x =... create a member
              //actualVar = .addMemberTo(actualVar,createName) # create x on module.exports
            //#try to execute assignment, so exported var points to content
            //var content = .rvalue.getResultType() 
            //if content instanceof Names.Declaration
                //actualVar.makePointTo content
//*/
//### Append to class Grammar.Expression ###
    
//#### Helper Method getResultType() returns Names.Declaration
     Grammar.Expression.prototype.getResultType = function(){
//Try to get return type from a simple Expression
        //declare valid .root.getResultType
        
        //return .root.getResultType() # .root is Grammar.Oper or Grammar.Operand
        return this.root.getResultType();// # .root is Grammar.Oper or Grammar.Operand
     };
//### Append to class Grammar.Oper ###
    
//for 'into var x' oper, we declare the var, and we deduce type
//#### Method declare() 
     Grammar.Oper.prototype.declare = function(){
        
        //if .intoVar # is a into-assignment operator with 'var' declaration
        if (this.intoVar) {// # is a into-assignment operator with 'var' declaration
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
            
            //var opt = new Names.NameDeclOptions
            var opt = new Names.NameDeclOptions();
            //opt.type = varRef.type
            opt.type = varRef.type;
            //.addToScope .declareName(varRef.name,opt)
            this.addToScope(this.declareName(varRef.name, opt));
        };
     };
//#### method evaluateAssignments() 
     Grammar.Oper.prototype.evaluateAssignments = function(){
    
//for into-assignment operator
      //if .name is 'into' # is a into-assignment operator
      if (this.name === 'into') {// # is a into-assignment operator
//check if we've got a clear reference (into var x)
          //if .right.name instance of Grammar.VariableRef
          if (this.right.name instanceof Grammar.VariableRef) {
              //declare valid .right.name.tryGetReference
              
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
//#### Helper Method getResultType() returns Names.Declaration
     Grammar.Oper.prototype.getResultType = function(){
//Try to get return type from this Oper (only for 'new' unary oper)
        //declare valid .right.getResultType
        
        //if .name is 'new'
        if (this.name === 'new') {
            //return .right.getResultType() #.right is Grammar.Operand
            return this.right.getResultType();// #.right is Grammar.Operand
        };
     };
//### Append to class Grammar.Operand ###
    
//#### Helper Method getResultType() returns Names.Declaration
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
        else if (this.name instanceof Grammar.Literal) {
        //else if .name instance of Grammar.Literal
            //return globalPrototype(.name.type)
            return globalPrototype(this.name.type);
        }
        else if (this.name instanceof Grammar.VariableRef) {
        //else if .name instance of Grammar.VariableRef
            //return .name.tryGetReference()
            return this.name.tryGetReference();
        };
     };
//### Append to class Grammar.DeclareStatement
    
//#### method declare() # pass 1, declare as props
     Grammar.DeclareStatement.prototype.declare = function(){// # pass 1, declare as props
//declare [all] x:type
//declare [global] var x
//declare on x
//declare valid x.y.z
      
      //if .specifier is 'on'
      if (this.specifier === 'on') {
          //var opt=new Names.NameDeclOptions
          var opt = new Names.NameDeclOptions();
          //opt.isForward = true
          opt.isForward = true;
          //var reference = .tryGetFromScope(.name,opt)
          var reference = this.tryGetFromScope(this.name, opt);
          //if String.isCapitalized(reference.name) //let's assume is a Class
          if (String.isCapitalized(reference.name)) { //let's assume is a Class
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
      else if (['affinity', 'var'].indexOf(this.specifier)>=0) {
//else: declare (name affinity|var) (VariableDecl,)
      //else if .specifier in ['affinity','var']
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
                else {
                //else
                    //.addToScope varDecl.nameDecl
                    this.addToScope(varDecl.nameDecl);
                };
            }
            else if (this.specifier === 'affinity') {
            //else if .specifier is 'affinity'
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
//#### method evaluateAssignments() # Grammar.DeclareStatement ###
     Grammar.DeclareStatement.prototype.evaluateAssignments = function(){// # Grammar.DeclareStatement ###
//Assign specific type to varRef - for the entire compilation
      //if .specifier is 'type'
      if (this.specifier === 'type') {
          //var opt = new Names.NameDeclOptions
          var opt = new Names.NameDeclOptions();
          //opt.informError=true
          opt.informError = true;
          //if .varRef.tryGetReference(opt) into var actualVar
          var actualVar=undefined;
          if ((actualVar=this.varRef.tryGetReference(opt))) {
              //.setTypes actualVar
              this.setTypes(actualVar);
          };
      };
     };
//#### helper method setTypes(actualVar:Names.Declaration) # Grammar.DeclareStatement ###
     Grammar.DeclareStatement.prototype.setTypes = function(actualVar){// # Grammar.DeclareStatement ###
//Assign types if it was declared
      //#create type on the fly, overwrite existing type
      //.setSubType actualVar,.type,'**proto**'
      this.setSubType(actualVar, this.type, '**proto**');
      //.setSubType actualVar,.itemType,'**item type**'
      this.setSubType(actualVar, this.itemType, '**item type**');
     };
//#### helper method setSubType(actualVar:Names.Declaration, toSet, propName ) 
     Grammar.DeclareStatement.prototype.setSubType = function(actualVar, toSet, propName){
//Assign type if it was declared
      //if toSet #create type on the fly
      if (toSet) {// #create type on the fly
          ////var act=actualVar.findMember(propName)
          ////print "set *type* was #{act} set to #{toSet}"
          //actualVar.setMember propName, toSet
          actualVar.setMember(propName, toSet);
          //var result = actualVar.processConvertTypes()
          var result = actualVar.processConvertTypes();
          //if result.failures, .sayErr "can't find type '#{toSet}' in scope"
          if (result.failures) {this.sayErr("can't find type '" + toSet + "' in scope")};
      };
     };
//#### method validatePropertyAccess() # Grammar.DeclareStatement ###
     Grammar.DeclareStatement.prototype.validatePropertyAccess = function(){// # Grammar.DeclareStatement ###
//declare members on the fly, with optional type
      //var actualVar:Names.Declaration
      var actualVar = undefined;
      //var opt=new Names.NameDeclOptions
      var opt = new Names.NameDeclOptions();
      //opt.informError = true
      opt.informError = true;
      //case .specifier 
      
        //when 'valid':
      if ((this.specifier=='valid')
      ){
            //actualVar = .tryGetFromScope(.varRef.name,opt)
            actualVar = this.tryGetFromScope(this.varRef.name, opt);
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
                else {
                //else
                    //actualVar = actualVar.findMember(ac.name) or .addMemberTo(actualVar, ac.name)
                    actualVar = actualVar.findMember(ac.name) || this.addMemberTo(actualVar, ac.name);
                };
            };// end for each in this.varRef.accessors
            //end for
            
            //if actualVar, .setTypes actualVar
            if (actualVar) {this.setTypes(actualVar)};
      
      }
        //when 'on-the-fly':
      else if ((this.specifier=='on-the-fly')
      ){
            //#set type on-the-fly, from here until next type-assignment
            //#we allow more than one "declare x:type" on the same block
            //if .varRef.tryGetReference(opt) into actualVar
            if ((actualVar=this.varRef.tryGetReference(opt))) {
                //.setTypes actualVar
                this.setTypes(actualVar);
            };
      
      };
     };
//### helper function AddGlobalClasses()
    function AddGlobalClasses(){
  
        //var nameDecl
        var nameDecl = undefined;
        
        //for each name in arguments.toArray()
        var _list4=Array.prototype.slice.call(arguments);
        for( var name__inx=0,name ; name__inx<_list4.length ; name__inx++){name=_list4[name__inx];
        
            //nameDecl = globalScope.addMember(name)
            nameDecl = globalScope.addMember(name);
            //nameDecl.addMember 'prototype'
            nameDecl.addMember('prototype');
            //// add to name affinity
            //if not nameAffinity.members.has(name)
            if (!(nameAffinity.members.has(name))) {
                //nameAffinity.members.set name, nameDecl
                nameAffinity.members.set(name, nameDecl);
            };
        };// end for each in Array.prototype.slice.call(arguments)
        
    };// --------------------
// Module code
// --------------------
    
// end of module
