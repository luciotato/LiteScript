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

   //import log
   var log = require('./log');
   var debug = log.debug;

//We extend the Grammar classes, so this module require the `Grammar` module.

   //import
   var ASTBase = require('./ASTBase');
   var Grammar = require('./Grammar');
   var NameDeclaration = require('./NameDeclaration');
   var Environment = require('./Environment');


//---------
//Module vars:

   var project = undefined;

   var globalScope = undefined;

   var nameAffinity = undefined;


//##Members & Scope

//A NameDeclaration have a `.members={}` property
//`.members={}` is a map to other `NameDeclaration`s which are valid members of this name.

//A 'scope' is a NameDeclaration whose members are the declared vars in the scope.

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


//  class ClassA

//    properties
//      classAProp1, classAProp2

//    method methodA
//      this.classAProp1 = 11
//      this.classAProp2 = 12

//  class ClassB

//    properties
//      classBProp1, classBProp2

//    method methodB
//      this.classBProp1 = 21

//  var instanceB = new ClassB // implicit type

//  instanceB.classBprop1 = 5 // <-- this **will be caught** as "case mismatch" since classBprop1 is defined as classBProp1

//  var bObj = instanceB // simple assignment, implicit type

//  bObj.classAProp1 = 5 // <-- this **will be caught** as: object 'bObj' has no property 'classAProp1'

//  var xObj = callToFn() // unknown type

//  xObj.classBProp1 = 5 // <-- this trigger a "classBProp1 IS NOT A DECLARED PROPERTY OF xObj"

//  declare on xObj  // <-- this fixes it
//    classBProp1

//  xObj.classBProp1 = 5 // <-- this is OK now

//  var xObj:ClassB = callToFn() // type annotation, this also fixes it

//  bObj.classBProp1 = 5 // <-- this is ok



   //export function validate()
   function validate(){

//We start this module once the entire multi-node AST tree has been parsed.

//Initialize module vars

       NameDeclaration.allOfThem = [];
       nameAffinity = new NameDeclaration('Name Affinity');// # project-wide name affinity for classes

//Now, run passes on the AST

//#### Pass 1.0 Declarations
//Walk the tree, and call function 'declare' on every node having it.
//'declare' will create scopes, and vars in the scope.
//May inform 'DUPLICATES' and 'CASE MISMATCH' errors.

       log.message("- Process Declarations");
       walkAllNodesCalling('declare');

//#### Pass 1.1 Declare By Assignment
//Walk the tree, and check assignments looking for: 'module.exports.x=x' and 'x.prototype.y = '.
//Treat them as declarations.

       log.message("- Declare By Assignment");
       walkAllNodesCalling('declareByAssignment');


//#### Pass 1.2 connectImportRequire
//check `x=require('y')` calls.
//Make var x point to required module 'y' exports

        //declare valid project.moduleCache

       log.message("- Connecting Imported");
       //for each own property fname in project.moduleCache
       for ( var fname in project.moduleCache)if (project.moduleCache.hasOwnProperty(fname)){
         var moduleNode = project.moduleCache[fname];

         //for each node in moduleNode.requireCallNodes
         for( var node__inx=0,node ; node__inx<moduleNode.requireCallNodes.length ; node__inx++){node=moduleNode.requireCallNodes[node__inx];
         

           //if node.importedModule
           if (node.importedModule) {

             var parent = undefined;
             var reference = undefined;

              //declare valid parent.lvalue.tryGetReference
              //declare valid parent.nameDecl

//if node is Grammar.ImportStatementItem

             //if node instance of Grammar.ImportStatementItem
             if (node instanceof Grammar.ImportStatementItem) {
                  //declare node:Grammar.ImportStatementItem
                 reference = node.nameDecl;

//if we processed a 'compiler import command' all exported should go to the global scope

                 //if node.getParent(Grammar.CompilerStatement)
                 if (node.getParent(Grammar.CompilerStatement)) {
                     //for each own property key,nameDecl in node.importedModule.exports.members
                     var nameDecl=undefined;
                     for ( var key in node.importedModule.exports.members)if (node.importedModule.exports.members.hasOwnProperty(key)){nameDecl=node.importedModule.exports.members[key];
                         {
                          //#declare valid project.root.addToScope
                         project.root.addToScope(nameDecl);
                         }
                         
                         }//end for each property

                     node.importedModule.exports.members = {};
                     reference = undefined;
                 };
             }


//else is a "require" call (VariableRef).
//Get parent node.
             
             else {
                 parent = node.parent;
                 //if parent instance of Grammar.Operand
                 if (parent instanceof Grammar.Operand) {
                    parent = node.parent.parent.parent;// # varRef->operand->Expression->Expression's Parent
                 };

//get referece where import module is being assigned to

                 //if parent instance of Grammar.AssignmentStatement
                 if (parent instanceof Grammar.AssignmentStatement) {
                   reference = parent.lvalue.tryGetReference({informError: true});
                 }
                 
                 else if (parent instanceof Grammar.VariableDecl) {
                   reference = parent.nameDecl;
                 };
             };

             //end if

//make reference point to importedModule.exports

             //if reference
             if (reference) {
               reference.makePointTo(node.importedModule.exports);
             };
           };
         }; // end for each in moduleNode.requireCallNodes
         
         }
       //end for each property


//#### Pass 1.3 Process "Append To" Declarations
//Since 'append to [class|object] x.y.z' statement can add to any object, we delay
//"Append To" declaration to this point, where 'x.y.z' can be analyzed and a reference obtained.
//Walk the tree, and check "Append To" Methods & Properties Declarations

       log.message("- Processing Append-To");
       walkAllNodesCalling('processAppendTo');


//#### Pass 2. Convert Types
//for each NameDeclaration try to find the declared 'type' (string) in the scope.
//Repeat until no conversions can be made.

       log.message("- Converting Types");

       var totalConverted = 0;
       //while totalConverted < NameDeclaration.allOfThem.length
       while(totalConverted < NameDeclaration.allOfThem.length){

           var converted = 0;

           //for each nameDecl in NameDeclaration.allOfThem
           for( var nameDecl__inx=0,nameDecl ; nameDecl__inx<NameDeclaration.allOfThem.length ; nameDecl__inx++){nameDecl=NameDeclaration.allOfThem[nameDecl__inx];
           if(!(nameDecl.converted)){
               //if nameDecl.processConvertTypes(), converted++
               if (nameDecl.processConvertTypes()) {
                   converted++};
           }}; // end for each in NameDeclaration.allOfThem

           //if no converted, break #exit if no conversions made
           if (!converted) {
               break};
           totalConverted += converted;

           debug("converted:" + converted + ", totalConverted:" + totalConverted);
       };//end loop

        //#loop

//Inform unconverted types as errors

       //if totalConverted < NameDeclaration.allOfThem.length
       if (totalConverted < NameDeclaration.allOfThem.length) {

         //for each nameDecl in NameDeclaration.allOfThem
         for( var nameDecl__inx=0,nameDecl ; nameDecl__inx<NameDeclaration.allOfThem.length ; nameDecl__inx++){nameDecl=NameDeclaration.allOfThem[nameDecl__inx];
         

           var type = nameDecl.findOwnMember('**proto**');
           //if type and type isnt instanceof NameDeclaration
           if (type && !(type instanceof NameDeclaration)) {
               nameDecl.sayErr("undeclared type: '" + (type.toString()) + "'");
               //if type instanceof Grammar.ASTBase
               if (type instanceof Grammar.ASTBase) {
                   log.error(type.positionText(), "for reference: type declaration position");
               };
           };
         }; // end for each in NameDeclaration.allOfThem
         
       };

//#### Pass 3 Evaluate Assignments
//Walk the scope tree, and for each assignment,
//IF L-value has no type, try to guess from R-value's result type

       log.message("- Evaluating Assignments");
       walkAllNodesCalling('evaluateAssignments');

//#### Pass 4 -Final- Validate Property Access
//Once we have all vars declared and typed, walk the AST,
//and for each VariableRef validate property access.
//May inform 'UNDECLARED PROPERTY'.

       log.message("- Validating Property Access");
       walkAllNodesCalling('validatePropertyAccess');

//Inform forward declarations not fulfilled, as errors

       //for each nameDecl in NameDeclaration.allOfThem
       for( var nameDecl__inx=0,nameDecl ; nameDecl__inx<NameDeclaration.allOfThem.length ; nameDecl__inx++){nameDecl=NameDeclaration.allOfThem[nameDecl__inx];
       

           //if nameDecl.isForward and not nameDecl.isDummy
           if (nameDecl.isForward && !(nameDecl.isDummy)) {

               nameDecl.warn("forward declared, but never found");
               var container = nameDecl.nodeDeclared.getParent(Grammar.ClassDeclaration);
               //if container
               if (container) {
                  //declare container:Grammar.ClassDeclaration
                  //declare valid container.varRef.toString
                 //if container.varRef, log.warning "#{container.positionText()} more info: '#{nameDecl.name}' of '#{container.varRef.toString()}'"
                 if (container.varRef) {
                     log.warning("" + (container.positionText()) + " more info: '" + nameDecl.name + "' of '" + (container.varRef.toString()) + "'")};
               };
           };
       }; // end for each in NameDeclaration.allOfThem
       
   };
   //export
   module.exports.validate=validate;

   //end function validate


   //export function walkAllNodesCalling(methodName)
   function walkAllNodesCalling(methodName){

//For all modules, for each node, if the specific AST node has methodName, call it

       //for each own property filename in project.moduleCache
       for ( var filename in project.moduleCache)if (project.moduleCache.hasOwnProperty(filename)){
           module = project.moduleCache[filename];
           module.callOnSubTree(methodName);
           }
       //end for each property
       
   };
   //export
   module.exports.walkAllNodesCalling=walkAllNodesCalling;


   //export function createGlobalScope(aProject)
   function createGlobalScope(aProject){
//This method prepares a default global scope for a project

//global scope starts populated with most common js built-in objects

//Initialize module vars

       project = aProject;

//The "scope" of rootNode is the global scope.
//Initialize the global scope

        //declare valid project.root.createScope
        //declare valid project.globalScope

       globalScope = project.root.createScope();
       project.globalScope = globalScope;

//Populate the global scope

       var objProto = addBuiltInObject('Object');
        //declare valid objProto.members.constructor.addMember
       objProto.members.constructor.addMember('name');

       var stringProto = addBuiltInObject('String');

        //#state that Obj.toString returns string:
       objProto.members["tostring"].setMember('**return type**', stringProto);

       addBuiltInObject('Function');
       addBuiltInObject('Boolean');
       addBuiltInObject('Array');
       addBuiltInObject('Number');
       addBuiltInObject('Date');
       addBuiltInObject('RegExp');
       addBuiltInObject('JSON');
       addBuiltInObject('Error');
       addBuiltInObject('Math');

       globalScope.addMember('true', {value: true});
       globalScope.addMember('false', {value: false});
       globalScope.addMember('on', {value: true});
       globalScope.addMember('off', {value: false});
       globalScope.addMember('undefined', {value: undefined});
       globalScope.addMember('null', {value: null});

        //declare valid project.options.browser
       //if project.options.browser
       if (project.options.browser) {
         //do nothing
         null;
       }
          //globalScope.addMember 'window',{type:globalScope}
          //globalScope.addMember 'document'
       
       else {
         globalScope.addMember('global', {type: globalScope});
         globalScope.addMember('require');
         addBuiltInObject('process');
       };
   };
   //export
   module.exports.createGlobalScope=createGlobalScope;


//----------
//----------

//## Module Helper Functions

   //helper function tryGetGlobalPrototype(name)
   function tryGetGlobalPrototype(name){
//gets a var from global scope

     var normalized = NameDeclaration.normalizeVarName(name);
     var nameDecl = globalScope.members[normalized];
     //if nameDecl
     if (nameDecl) {
        //declare valid nameDecl.members.prototype
       return nameDecl.members.prototype;
     };
   };

   //helper function globalPrototype(name)
   function globalPrototype(name){
//gets a var from global scope

     //if name instanceof NameDeclaration, return name #already converted type
     if (name instanceof NameDeclaration) {
         return name};

     var normalized = NameDeclaration.normalizeVarName(name);

     var nameDecl = globalScope.members[normalized];
     //if no nameDecl
     if (!nameDecl) {
       //fail with "no '#{name}' in global scope"
       throw new Error("no '" + name + "' in global scope");
     };

      //declare valid nameDecl.members.prototype

     //if no nameDecl.members.prototype
     if (!nameDecl.members.prototype) {
       //fail with "global scope '#{name}' has no .members.prototype"
       throw new Error("global scope '" + name + "' has no .members.prototype");
     };

     return nameDecl.members.prototype;
   };


   //helper function addBuiltInObject(name,node)
   function addBuiltInObject(name, node){
//Add a built-in class to global scope, return class prototype

     var nameDecl = new NameDeclaration(name, {isBuiltIn: true}, node);

     var normalized = NameDeclaration.normalizeVarName(name);
     globalScope.members[normalized] = nameDecl;

     nameDecl.getMembersFromObjProperties(Environment.getGlobalObject(name));

      //declare valid nameDecl.members.prototype

     //if nameDecl.members.prototype
     if (nameDecl.members.prototype) {
       nameDecl.setMember('**return type**', nameDecl.members.prototype);
       return nameDecl.members.prototype;
     };

     return nameDecl;
   };

//---------------------------------------
//----------------------------------------
//----------------------------------------

//##Additions to NameDeclaration. Helper methods to do validation

   //append to class NameDeclaration
   

    //helper method findMember(name) returns NameDeclaration
    NameDeclaration.prototype.findMember = function(name){
//this method looks for a name in NameDeclaration members,
//it also follows the **proto** chain (same mechanism as js __proto__ chain)

       var actual = this;
       var count = 0;

       //do while actual instance of NameDeclaration
       while(actual instanceof NameDeclaration){

           //if actual.findOwnMember(name) into var result
           var result=undefined;
           if ((result=actual.findOwnMember(name))) {
              return result;
           };

//We use a member named '**proto**' on NameDeclarations, mapping run-time proto chain.
//We follow the chain to validate property names.

           var nextInChain = actual.findOwnMember('**proto**');

//As last option in the chain, we always use 'Object.prototype'

           //if no nextInChain and actual isnt globalPrototype('Object')
           if (!nextInChain && actual !== globalPrototype('Object')) {
             nextInChain = globalPrototype('Object');
           };

           actual = nextInChain;

           //if count++ > 50 #assume circular
           if (count++ > 50) {// #assume circular
               this.warn("circular type reference");
               return;
           };
       };//end loop
       
    };


    //helper method getMembersFromObjProperties(obj) #Recursive
    NameDeclaration.prototype.getMembersFromObjProperties = function(obj){// #Recursive
//Recursively converts a obj properties in NameDeclarations.
//it's used when a pure.js module is imported by 'require'
//to convert required 'exports' to LiteScript compiler usable NameDeclarations
//Also to load the global scope with built-in objects

       var newMember = undefined;

       //if obj instanceof Object or obj is Object.prototype
       if (obj instanceof Object || obj === Object.prototype) {

           //for each prop in Object.getOwnPropertyNames(obj) #even not enumerables
           var _list3=Object.getOwnPropertyNames(obj);
           for( var prop__inx=0,prop ; prop__inx<_list3.length ; prop__inx++){prop=_list3[prop__inx];
           if(prop !== '__proto__'){

                   var type = Grammar.autoCapitalizeCoreClasses(typeof obj[prop]);
                   type = tryGetGlobalPrototype(type);// #core classes: Function, Object, String
                   //if type is this, type = undefined #avoid circular references
                   if (type === this) {
                       type = undefined};

                   newMember = this.addMember(prop, {type: type});

                    //#on 'protoype' member or
                    //#if member is a Function-class - dive into
                    //declare valid Object.hasOwnProperty.call
                   //if prop isnt 'constructor'
                   if (prop !== 'constructor') {
                       //if prop is 'prototype'
                       if (prop === 'prototype' || (typeof obj[prop] === 'function' && obj[prop].hasOwnProperty('prototype') && !(this.isInParents(prop))) || (typeof obj[prop] === 'object' && !(this.isInParents(prop)))) {
                             newMember.getMembersFromObjProperties(obj[prop]);// #recursive
                             //if prop is 'super_' # used in node's core modules: http, EventEmitter, etc.
                             if (prop === 'super_') {// # used in node's core modules: http, EventEmitter, etc.
                                 //if newMember.findOwnMember('prototype') into var superProtopNameDecl
                                 var superProtopNameDecl=undefined;
                                 if ((superProtopNameDecl=newMember.findOwnMember('prototype'))) {
                                   var protopNameDecl = this.findOwnMember('prototype') || this.addMember('prototype');
                                   protopNameDecl.setMember('**proto**', superProtopNameDecl);// #put super's proto in **proto** of prototype
                                 };
                             };
                       };
                   };
           }}; // end for each in Object.getOwnPropertyNames(obj)
           
       };
    };





    //helper method isInParents(name)
    NameDeclaration.prototype.isInParents = function(name){
//return true if a property name is in the parent chain.
//Used to avoid recursing circular properties

       var nameDecl = this.parent;
       name = NameDeclaration.normalizePropName(name);
       //while nameDecl
       while(nameDecl){
         //if nameDecl.members.hasOwnProperty(name),return true
         if (nameDecl.members.hasOwnProperty(name)) {
             return true};
         nameDecl = nameDecl.parent;
       };//end loop
       
    };


    //helper method processConvertTypes()
    NameDeclaration.prototype.processConvertTypes = function(){
//convert possible types stored in NameDeclaration,
//from string to NameDeclarations in the scope
//returns '**proto**' converted type

       this.convertType('**return type**');// #a Function can have **return type**
       this.convertType('**item type**');// #an Array can have **item type** e.g.: 'var list: string array'

       var converted = undefined;
       //if .findOwnMember('**proto**')
       if (this.findOwnMember('**proto**')) {

//Try to convert type, from string or VariableRef to a found NameDeclaration in Scope.

         converted = this.convertType('**proto**');
       }

//else, if no type defined, try by name affinity,e.g., for var 'token', if a Class named 'Token' is
//in scope, var 'token' is assumed type 'Token', return true if type was assigned
       
       else {
         converted = this.assignTypebyNameAffinity();
       };

//if converted, mark

       //if converted, .converted = true
       if (converted) {
           this.converted = true};

//return true if a conversion was made

       return converted;
    };


    //helper method convertType(internalName)
    NameDeclaration.prototype.convertType = function(internalName){
//convert type from string to NameDeclarations in the scope.
//returns 'true' if converted, 'false' if it has to be tried later

       //if no .findOwnMember(internalName) into var type, return  #nothing to process
       var type=undefined;
       if (!((type=this.findOwnMember(internalName)))) {
           return};

       //if type instance of NameDeclaration
       if (type instanceof NameDeclaration) {
            //#already converted
           return;
       };

        //# if the type is a varRef, must reference a class
       //if type instanceof Grammar.VariableRef
       if (type instanceof Grammar.VariableRef) {
            //declare type:Grammar.VariableRef

           //if type.tryGetReference() into var classFN:NameDeclaration
           var classFN=undefined;
           if ((classFN=type.tryGetReference())) {

             //if no classFN.members['prototype']
             if (!classFN.members['prototype']) {
               this.sayErr("TYPE: '" + type + "' has no prototype");
               return;
             };

             type = classFN.members['prototype'];
           };
       }
       
       else if (typeof type === 'string') {

           //if no .nodeDeclared
           if (!this.nodeDeclared) {
             type = globalPrototype(type);
           }
           
           else {
             type = this.nodeDeclared.findInScope(type);
              //declare valid type.members.prototype
             type = type.members.prototype || type;
           };
       }
       
       else {
          //declare valid type.constructor.name
         this.sayErr("INTERNAL ERROR: UNRECOGNIZED TYPE on " + internalName + ": '" + type + "' [" + type.constructor.name + "] typeof is '" + (typeof type) + "'");
         return;
       };

        //#store converted
       //if type, .setMember(internalName,type)
       if (type) {
           this.setMember(internalName, type)};

       return type;
    };


    //helper method assignTypeFromValue(value)
    NameDeclaration.prototype.assignTypeFromValue = function(value){
//if we can determine assigned value type, set var type

      //declare valid value.getResultType
     var valueNameDecl = value.getResultType();

//now set var type (unless is "null" or "undefined", they destroy type info)

     //if valueNameDecl instance of NameDeclaration and valueNameDecl.name not in ["undefined","null"]
     if (valueNameDecl instanceof NameDeclaration && ["undefined", "null"].indexOf(valueNameDecl.name)===-1) {
         this.setMember('**proto**', valueNameDecl);
     };
    };



    //helper method assignTypebyNameAffinity()
    NameDeclaration.prototype.assignTypebyNameAffinity = function(){
//Auto-assign type by name affinity.
//If no type specified, check project.nameAffinity

       //if .nodeDeclared and not String.isCapitalized(.name)
       if (this.nodeDeclared && !(String.isCapitalized(this.name))) {

           //if not .findOwnMember('**proto**')
           if (!(this.findOwnMember('**proto**'))) {

               var normalized = NameDeclaration.normalizePropName(this.name);
               var possibleClassRef = nameAffinity.members[normalized];

                //# possibleClassRef is a NameDeclaration whose .nodeDeclared is a ClassDeclaration

                //# check 'ends with' if name is at least 6 chars in length
               //if not possibleClassRef and normalized.length>=6
               if (!(possibleClassRef) && normalized.length >= 6) {
                   //for each own property affinityName in nameAffinity.members
                   for ( var affinityName in nameAffinity.members)if (nameAffinity.members.hasOwnProperty(affinityName)){
                       //if normalized.endsWith(affinityName)
                       if (normalized.endsWith(affinityName)) {
                           possibleClassRef = nameAffinity.members[affinityName];
                           //break
                           break;
                       };
                       }
                   //end for each property
                   
               };

                //#if there is a candidate class, check of it has a defined prototype
                //declare valid possibleClassRef.nodeDeclared.nameDecl.members.prototype
               //if possibleClassRef and possibleClassRef.nodeDeclared and possibleClassRef.nodeDeclared.nameDecl.members.prototype
               if (possibleClassRef && possibleClassRef.nodeDeclared && possibleClassRef.nodeDeclared.nameDecl.members.prototype) {
                   this.setMember('**proto**', possibleClassRef.nodeDeclared.nameDecl.members.prototype);
                   return true;
               };
           };
       };
    };



//--------------------------------
//## Helper methods added to AST Tree

   //append to class ASTBase
   

    //helper method declareName(name, options)
    ASTBase.prototype.declareName = function(name, options){
//declareName creates a new NameDeclaration, referecing source (AST node)

       return new NameDeclaration(name, options, this);
    };

    //method addMemberTo(nameDecl, memberName, options)
    ASTBase.prototype.addMemberTo = function(nameDecl, memberName, options){
//a Helper method ASTBase.*addMemberTo*
//Adds a member to a NameDecl, referencing this node as nodeDeclared

       return nameDecl.addMember(memberName, options, this);
    };

    //helper method tryGetMember(nameDecl,name:string,options)
    ASTBase.prototype.tryGetMember = function(nameDecl, name, options){
//this method looks for a specific member, optionally declare as forward
//or inform error. We need this AST node, to correctly report error.

       //default options =
       if(!options) options={};
       // options.informError: undefined
       // options.isForward: undefined

       var found = nameDecl.findMember(name);

       //if found and name.slice(0,2) isnt '**'
       if (found && name.slice(0, 2) !== '**') {
         found.caseMismatch(name, this);
       }
       
       else {
         //if options.informError, log.warning "#{.positionText()}. No member named '#{name}' on #{nameDecl.info()}"
         if (options.informError) {
             log.warning("" + (this.positionText()) + ". No member named '" + name + "' on " + (nameDecl.info()))};
         //if options.isForward, found = .addMemberTo(nameDecl,name,options)
         if (options.isForward) {
             found = this.addMemberTo(nameDecl, name, options)};
       };

       return found;
    };


    //helper method getScopeNode()
    ASTBase.prototype.getScopeNode = function(){

//**getScopeNode** method return the parent 'scoped' node in the hierarchy.
//It looks up until found a node with .scope

//Start at this node

       var node = this;
        //declare valid node.scope

       //while node
       while(node){

         //if node.scope
         if (node.scope) {
           return node;// # found a node with scope
         };

         node = node.parent;// # move up
       };//end loop

        //#loop

       return null;
    };


    //method findInScope(name) returns NameDeclaration
    ASTBase.prototype.findInScope = function(name){
//this method looks for the original place
//where a name was defined (function,method,var)
//Returns the Identifier node from the original scope
//It's used to validate variable references to be previously declared names

       var normalized = undefined;

       normalized = NameDeclaration.normalizeVarName(name);

//Start at this node

       var node = this;
        //declare valid node.scope.members

//Look for the declaration in this scope

       //while node
       while(node){
         //if node.scope
         if (node.scope) {
           //if node.scope.members.hasOwnProperty(normalized)
           if (node.scope.members.hasOwnProperty(normalized)) {
             return node.scope.members[normalized];
           };
         };

//move up in scopes

         node = node.parent;
       };//end loop
       
    };

        //#loop


    //method tryGetFromScope(name, options) returns NameDeclaration
    ASTBase.prototype.tryGetFromScope = function(name, options){
//a Helper method: *ASTBase.tryGetFromScope(name)*, this method looks for the original declaration
//in the scope. if the declaration is not found, an error is emmited and a -pseudo- var is created
//in the scope in order to continue compilation

//Check if the name is declared. Retrieve the original declaration

//if it's already a NameDeclaration, no need to search

       //if name instanceof NameDeclaration, return name
       if (name instanceof NameDeclaration) {
           return name};

       //default options=
       if(!options) options={};
       // options.informError: undefined
       // options.isForward: undefined
       // options.isDummy: undefined


//Search the scope


       //if .findInScope(name) into var found
       var found=undefined;
       if ((found=this.findInScope(name))) {

//Declaration found, we check the upper/lower case to be consistent
//If the found item has a different case than the name we're looking for, emit error

           //if found.caseMismatch(name, this)
           if (found.caseMismatch(name, this)) {
             return found;
           };
       }
            //#end if

//if declaration not found, check if it's a built-in value like 'true'
       
       else if (['true', 'false', 'undefined', 'null', 'NaN', 'Infinity'].indexOf(name)>=0) {
           found = this.getRootNode().addToScope(name);
       }

//else, check if it's a built-in "object", so we declare it in the global scope
       
       else if (Environment.isBuiltInObject(name)) {
           found = addBuiltInObject(name, this);
       }

//if it is not found,check options: a) inform error. b) declare foward.
       
       else {
           //if options.informError
           if (options.informError) {
               this.sayErr("UNDECLARED NAME: '" + name + "'");
           };

           //if options.isForward
           if (options.isForward) {
               found = this.addToScope(name, options);
               //if options.isDummy and String.isCapitalized(name) #let's assume is a class
               if (options.isDummy && String.isCapitalized(name)) {// #let's assume is a class
                   this.addMemberTo(found, 'prototype', options);
               };
           };
       };

        //#end if - check declared variables

       return found;
    };



    //method addToScope(item, options) returns NameDeclaration
    ASTBase.prototype.addToScope = function(item, options){
//a Helper method ASTBase.*addToScope*
//Search for parent Scope, adds passed name to scope.members[]
//Reports duplicated.
//return: NameDeclaration

       //if no item, return # do nothing on undefined params
       if (!item) {
           return};

       var scope = this.getScopeNode().scope;

       //if no options
       if (!options) {
         options = {};
       };

//First search it to report duplicates, if found in the scope.
//If the found item has a different case than the name we're adding, emit error & return

        //declare valid item.name
       var name = typeof item === 'string' ? item : item.name;

       debug("addToScope: '" + name + "' to '" + scope.name + "'");// #[#{.constructor.name}] name:

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
             found.isForward = false;
             found.nodeDeclared = this;
             //if item instanceof NameDeclaration
             if (item instanceof NameDeclaration) {
               found.replaceForward(item);
             };
           }
           
           else {
             this.sayErr("DUPLICATED name in scope: '" + name + "'");
             log.error(found.originalDeclarationPosition());// #add extra information line
           };

           return found;
       };

        //#end if

//else, not found, add it to the scope

       var nameDecl = undefined;
       //if item instanceof NameDeclaration
       if (item instanceof NameDeclaration) {
         nameDecl = item;
       }
       
       else {
         nameDecl = this.declareName(name, options);
       };

       var normalized = NameDeclaration.normalizeVarName(name);
       scope.members[normalized] = nameDecl;

       return nameDecl;
    };


    //helper method addToExport(exportedNameDecl, asDefault)
    ASTBase.prototype.addToExport = function(exportedNameDecl, asDefault){
//Add to parentModule.exports, but *preserve parent*

     var parentModule = this.getParent(Grammar.Module);

     var options = {
         scopeCase: undefined
         };

//if we're processing an interface.md file,
//properties will be moved to global scope. Keep case

     var isInterface = parentModule.lexer.options.interfaceMode;

     //if isInterface, options.scopeCase = true #keep 1st letter case
     if (isInterface) {
         options.scopeCase = true};

     //if asDefault and not isInterface  #export "asDefault" means replace "module.exports"
     if (asDefault && !(isInterface)) {// #export "asDefault" means replace "module.exports"
         parentModule.exports.makePointTo(exportedNameDecl);
     }
     
     else {
        //#just add to actual exports, but preserve parent
       var saveParent = exportedNameDecl.parent;
       parentModule.exports.addMember(exportedNameDecl, options);
       exportedNameDecl.parent = saveParent;
     };
    };


    //helper method createScope()
    ASTBase.prototype.createScope = function(){
//initializes an empty scope in this node

        //declare valid .scope.isScope

       //if no .scope
       if (!this.scope) {
         this.scope = this.declareName("" + (this.name || this.constructor.name) + " Scope");
         this.scope.isScope = true;
       };

       return this.scope;
    };

    //helper method createFunctionScope(scopeThisProto)
    ASTBase.prototype.createFunctionScope = function(scopeThisProto){

//Functions (methods and constructors also), have a 'scope'.
//It captures al vars declared in its body.
//We now create function's scope and add the special var 'this'.
//The 'type' of 'this' is normally a class prototype,
//which contains other methods and properties from the class.
//We also add 'arguments.length'

       var scope = this.createScope();

       this.addMemberTo(scope, 'arguments').addMember('length');

       var varThis = this.addMemberTo(scope, 'this', {type: scopeThisProto});
    };

//Note: since ALL functions have 'this' in scope, when you create
//a class inside a function, or a function inside a function, you'll have TWO different
//'this' "in scope". One in the inner scope, shadowing other in the outer scope.
//This is technically a scope 'name duplication', but it's allowed fot 'this' & 'arguments'

    //helper method tryGetOwnerDecl(options)
    ASTBase.prototype.tryGetOwnerDecl = function(options){
//Used by properties & methods in the body of ClassDeclaration|AppendToDeclaration
//to get their 'owner', i.e., a NameDeclaration where they'll be added as members

       //default options=
       if(!options) options={};
       // options.informError: undefined

       var toNamespace = undefined, classRef = undefined;
       var ownerDecl = undefined;

        //declare valid .specifier

        //# get parent class/append to
       var parent = this.getParent(Grammar.ClassDeclaration);
       //if no parent
       if (!parent) {
         this.throwError("'" + this.specifier + "' declaration outside 'class/append to' declaration. Check indent");
       };

//Append to class|namespace

       //if parent instance of Grammar.AppendToDeclaration
       if (parent instanceof Grammar.AppendToDeclaration) {

            //#get varRefOwner from AppendToDeclaration
            //declare parent:Grammar.AppendToDeclaration

           toNamespace = parent.toNamespace;// #if it was 'append to namespace'

           classRef = parent.varRef;

            //#get referenced class
            //declare valid classRef.tryGetReference
           //if no classRef.tryGetReference() into ownerDecl
           if (!((ownerDecl=classRef.tryGetReference()))) {
             //if options.informError, .sayErr "Append to: '#{classRef}'. Reference is not fully declared"
             if (options.informError) {
                 this.sayErr("Append to: '" + classRef + "'. Reference is not fully declared")};
             return;
           };
       }
       
       else {

           //if no parent.nameDecl into ownerDecl
           if (!((ownerDecl=parent.nameDecl))) {
                this.sayErr("Unexpected. Class has no nameDecl");
           };

           classRef = ownerDecl;

            //declare valid .toNamespace
           toNamespace = this.toNamespace;
       };

       //end if


//check if owner is class (namespace) or class.prototype (class)

       //if toNamespace
       if (toNamespace) {
           //do nothing #'namespace properties' and 'append to namespace' are added directly to rerenced class-function
           null;// #'namespace properties' and 'append to namespace' are added directly to rerenced class-function
       }
       
       else {
          //# move to class prototype
          //declare valid ownerDecl.members.prototype
         //if no ownerDecl.members.prototype into ownerDecl
         if (!((ownerDecl=ownerDecl.members.prototype))) {
             //if options.informError, .sayErr "Class '#{classRef}' has no .prototype"
             if (options.informError) {
                 this.sayErr("Class '" + classRef + "' has no .prototype")};
             return;
         };
       };

       return ownerDecl;
    };



//----
//## Methods added to specific Grammar Classes to handle scope, var & members declaration

   //append to class Grammar.VariableDecl ###
   

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

     //helper method createNameDeclaration(options)
     Grammar.VariableDecl.prototype.createNameDeclaration = function(options){

       //default options =
       if(!options) options={};
       if(options.type===undefined) options.type=this.type;
       if(options.itemType===undefined) options.itemType=this.itemType;
       if(options.value===undefined) options.value=this.assignedValue;

       return this.declareName(this.name, options);
     };

     //helper method declareInScope()
     Grammar.VariableDecl.prototype.declareInScope = function(){
         this.nameDecl = this.addToScope(this.createNameDeclaration());
     };

     //helper method getTypeFromAssignedValue()
     Grammar.VariableDecl.prototype.getTypeFromAssignedValue = function(){
         //if .nameDecl and .assignedValue
         if (this.nameDecl && this.assignedValue) {
             //if no .nameDecl.findOwnMember('**proto**') into var type #if has no type
             var type=undefined;
             if (!((type=this.nameDecl.findOwnMember('**proto**')))) {// #if has no type
                 //if .assignedValue.getResultType() into var result #get assignedValue type
                 var result=undefined;
                 if ((result=this.assignedValue.getResultType())) {// #get assignedValue type
                     this.nameDecl.setMember('**proto**', result);// #assign to this.nameDecl
                 };
             };
         };
     };


   //append to class Grammar.VarStatement ###
   

    //method declare()  # pass 1
    Grammar.VarStatement.prototype.declare = function(){// # pass 1
       //for each varDecl in .list
       for( var varDecl__inx=0,varDecl ; varDecl__inx<this.list.length ; varDecl__inx++){varDecl=this.list[varDecl__inx];
       
           varDecl.declareInScope();
           //if .export, .addToExport varDecl.nameDecl, .default
           if (this.export) {
               this.addToExport(varDecl.nameDecl, this.default)};
       }; // end for each in this.list
       
    };

    //method evaluateAssignments() # pass 4, determine type from assigned value
    Grammar.VarStatement.prototype.evaluateAssignments = function(){// # pass 4, determine type from assigned value
       //for each varDecl in .list
       for( var varDecl__inx=0,varDecl ; varDecl__inx<this.list.length ; varDecl__inx++){varDecl=this.list[varDecl__inx];
       
           varDecl.getTypeFromAssignedValue();
       }; // end for each in this.list
       
    };


   //append to class Grammar.ImportStatementItem ###
   

      //properties nameDecl

     //method declare #pass 1: declare name choosed for imported contents as a scope var
     Grammar.ImportStatementItem.prototype.declare = function(){// #pass 1: declare name choosed for imported contents as a scope var

       //if no .getParent(Grammar.CompilerStatement)
       if (!this.getParent(Grammar.CompilerStatement)) {
           this.nameDecl = this.addToScope(this.name);
       };
     };


//----------------------------
   //append to class Grammar.ClassDeclaration ### also AppendToDeclaration (child class)
   
//Classes contain a code block with properties and methods definitions.

     //     properties
      //nameDecl

    //method declare()
    Grammar.ClassDeclaration.prototype.declare = function(){

//if it is 'append to', nothing to declare, object must pre-exist

       //if this instanceof Grammar.AppendToDeclaration, return
       if (this instanceof Grammar.AppendToDeclaration) {
           return};

//Add class name, to parent scope. A "class" in js is a function

       this.nameDecl = this.addToScope(this.name, {type: globalPrototype('Function')});

       //if .getParent(Grammar.NamespaceDeclaration) into var namespaceDeclaration
       var namespaceDeclaration=undefined;
       if ((namespaceDeclaration=this.getParent(Grammar.NamespaceDeclaration))) {
           namespaceDeclaration.nameDecl.addMember(this.nameDecl);
       }
       
       else {
           //if .export, .addToExport .nameDecl, .default
           if (this.export) {
               this.addToExport(this.nameDecl, this.default)};
       };

//We create 'Class.prototype' member
//Class's properties & methods will be added to 'prototype' as valid member members.
//'prototype' starts with 'constructor' which is a pointer to the class-funcion itself

       var prtypeNameDecl = this.nameDecl.findOwnMember('prototype') || this.addMemberTo(this.nameDecl, 'prototype');
       //if .varRefSuper, prtypeNameDecl.setMember('**proto**',.varRefSuper)
       if (this.varRefSuper) {
           prtypeNameDecl.setMember('**proto**', this.varRefSuper)};
       prtypeNameDecl.addMember('constructor', {pointsTo: this.nameDecl});

//return type of the class-function, is the prototype

       this.nameDecl.setMember('**return type**', prtypeNameDecl);

//add to nameAffinity

       //if not nameAffinity.findOwnMember(.name)
       if (!(nameAffinity.findOwnMember(this.name))) {
           this.addMemberTo(nameAffinity, this.name);
       };
    };

//------------

   //append to class Grammar.ObjectLiteral ###
   
     //properties nameDecl

    //method declare
    Grammar.ObjectLiteral.prototype.declare = function(){
      //declare valid .parent.nameDecl
     this.nameDecl = this.parent.nameDecl || this.declareName(ASTBase.getUniqueVarName('*ObjectLiteral*'));
    };

    //method getResultType
    Grammar.ObjectLiteral.prototype.getResultType = function(){
     return this.nameDecl;
    };


   //append to class Grammar.NameValuePair ###
   

     //properties nameDecl

    //method declare
    Grammar.NameValuePair.prototype.declare = function(){

      //declare valid .parent.nameDecl

     this.nameDecl = this.addMemberTo(this.parent.nameDecl, this.name);

//check if we can determine type from value
//if we do, set type (unless is "null" or "undefined", they destroy type info)

     //if .type and .type instance of NameDeclaration and .type.name not in ["undefined","null"]
     if (this.type && this.type instanceof NameDeclaration && ["undefined", "null"].indexOf(this.type.name)===-1) {
         this.nameDecl.setMember('**proto**', this.type);
     }
     
     else if (this.value) {
         this.nameDecl.assignTypeFromValue(this.value);
     };
    };

   //append to class Grammar.FunctionDeclaration ###
   
//`FunctionDeclaration: '[export][generator] (function|method|constructor) [name] '(' FunctionParameterDecl* ')' Block`

     //properties nameDecl, declared:boolean, scope:NameDeclaration

    //method declare() ## function, methods and constructors
    Grammar.FunctionDeclaration.prototype.declare = function(){// ## function, methods and constructors

     var owner = undefined;

//1st: Grammar.FunctionDeclaration

//if it is not anonymous, add function name to parent scope,
//if its 'export' add to exports

     //if .constructor is Grammar.FunctionDeclaration
     if (this.constructor === Grammar.FunctionDeclaration) {

         //if .name
         if (this.name) {
           this.nameDecl = this.addToScope(this.name, {type: 'Function'});
           //if .export, .addToExport .nameDecl, .default
           if (this.export) {
               this.addToExport(this.nameDecl, this.default)};
         };

//determine 'owner' (where 'this' points to for this function)

         var nameValuePair = this.getParent(Grammar.NameValuePair);
         //if nameValuePair #NameValue pair where function is 'value'
         if (nameValuePair) {// #NameValue pair where function is 'value'
              //declare valid nameValuePair.parent.nameDecl
             owner = nameValuePair.parent.nameDecl;// #owner object nameDecl
         }
         
         else {
           owner = globalScope;
         };
     }

//2nd: Methods & constructors

//Try to determine owner, for declaration and to set scope var "this"'s  **proto**.
//if owner *can* be determined at this point, declare method as member.

//Note: Constructors have no "name". Constructors are the class itself.
     
     else {
         owner = this.tryGetOwnerDecl();
         //if owner and .name
         if (owner && this.name) {
             this.addMethodToOwner(owner);
         };
     };
     //end if

//Define function's return type from parsed text

     this.createReturnType();

//Now create function's scope, using found owner as function's scope var this's **proto**

//Scope starts populated by 'this' and 'arguments'.

     this.createFunctionScope(owner);

//add parameters to function's scope

     //if .paramsDeclarations
     if (this.paramsDeclarations) {
       //for each varDecl in .paramsDeclarations
       for( var varDecl__inx=0,varDecl ; varDecl__inx<this.paramsDeclarations.length ; varDecl__inx++){varDecl=this.paramsDeclarations[varDecl__inx];
       
         varDecl.declareInScope();
       }; // end for each in this.paramsDeclarations
       
     };
    };


    //method processAppendTo() ## function, methods and constructors
    Grammar.FunctionDeclaration.prototype.processAppendTo = function(){// ## function, methods and constructors

//For undeclared methods only

     //if .constructor isnt Grammar.MethodDeclaration or .declared, return
     if (this.constructor !== Grammar.MethodDeclaration || this.declared) {
         return};

//tryGetOwnerDecl will evaluate 'append to' varRef to get object where this method belongs

     var owner = this.tryGetOwnerDecl({informError: true});// # inform error if try-fails

//Now that we have 'owner' we can set **proto** for scope var 'this',
//so we can later validate `.x` in `this.x = 7`

     //if owner
     if (owner) {
         this.addMethodToOwner(owner);
          //declare valid .scope.members.this.setMember
         this.scope.members.this.setMember('**proto**', owner);
          //#set also **return type**
         this.createReturnType();
     };
    };


    //helper method addMethodToOwner(owner:NameDeclaration)  ## methods
    Grammar.FunctionDeclaration.prototype.addMethodToOwner = function(owner){// ## methods

     var actual = owner.findOwnMember(this.name);
     //if actual and .shim #shim for an exising method, do nothing
     if (actual && this.shim) {// #shim for an exising method, do nothing
       return;
     };

//Add to owner, type is 'Function'

     //if no .nameDecl, .nameDecl = .declareName(.name,{type:globalPrototype('Function')})
     if (!this.nameDecl) {
         this.nameDecl = this.declareName(this.name, {type: globalPrototype('Function')})};

     this.declared = true;

     this.addMemberTo(owner, this.nameDecl);
    };


    //method createReturnType() ## functions & methods
    Grammar.FunctionDeclaration.prototype.createReturnType = function(){// ## functions & methods

     //if no .nameDecl, return #nowhere to put definitions
     if (!this.nameDecl) {
         return};

//Define function's return type from parsed text

     //if .itemType
     if (this.itemType) {

//if there's a "itemType", it means type is: `TypeX Array`.
//We create a intermediate type for `TypeX Array`
//and set this new nameDecl as function's **return type**

         var composedName = this.itemType.toString() + ' Array';

//check if it alerady exists, if not found, create one. Type is 'Array'

         var intermediateNameDecl = globalScope.members[composedName] || globalScope.addMember(composedName, {type: globalPrototype('Array')});

//item type, is each array member's type

         intermediateNameDecl.setMember("**item type**", this.itemType);

         this.nameDecl.setMember('**return type**', intermediateNameDecl);
     }

//else, it's a simple type
     
     else {

         //if .type then .nameDecl.setMember('**return type**', .type)
         if (this.type) {
             this.nameDecl.setMember('**return type**', this.type)};
     };
    };


   //append to class Grammar.PropertiesDeclaration ###
   

     //properties nameDecl, declared:boolean, scope:NameDeclaration

    //method declare(options)
    Grammar.PropertiesDeclaration.prototype.declare = function(options){
//Add all properties as members of its owner object (normally: class.prototype)

       //if .tryGetOwnerDecl(options) into var owner
       var owner=undefined;
       if ((owner=this.tryGetOwnerDecl(options))) {

           //for each varDecl in .list
           for( var varDecl__inx=0,varDecl ; varDecl__inx<this.list.length ; varDecl__inx++){varDecl=this.list[varDecl__inx];
           
               varDecl.nameDecl = varDecl.addMemberTo(owner, varDecl.name, {type: varDecl.type, itemType: varDecl.itemType});
           }; // end for each in this.list

           this.declared = true;
       };
    };

    //method processAppendTo()
    Grammar.PropertiesDeclaration.prototype.processAppendTo = function(){
//Add all properties as members of its owner (append to).
//For undeclared properties only

       //if not .declared, .declare({informError:true})
       if (!(this.declared)) {
           this.declare({informError: true})};
    };

    //method evaluateAssignments() # determine type from assigned value on properties declaration
    Grammar.PropertiesDeclaration.prototype.evaluateAssignments = function(){// # determine type from assigned value on properties declaration

       //for each varDecl in .list
       for( var varDecl__inx=0,varDecl ; varDecl__inx<this.list.length ; varDecl__inx++){varDecl=this.list[varDecl__inx];
       
           varDecl.getTypeFromAssignedValue();
       }; // end for each in this.list
       
    };



   //append to class Grammar.ForStatement ###
   

    //method declare()
    Grammar.ForStatement.prototype.declare = function(){

//a ForStatement has a 'Scope'. Add, if they exists, indexVar & mainVar

        //declare valid .variant.indexVar:Grammar.VariableDecl
        //declare valid .variant.mainVar:Grammar.VariableDecl
        //declare valid .variant.iterable:Grammar.VariableRef

       this.createScope();
       //if .variant.indexVar, .variant.indexVar.declareInScope
       if (this.variant.indexVar) {
           this.variant.indexVar.declareInScope()};

       //if .variant.mainVar
       if (this.variant.mainVar) {
           //if .variant.iterable, default .variant.mainVar.type = .variant.iterable.itemType
           if (this.variant.iterable) {
               if(this.variant.mainVar.type===undefined) this.variant.mainVar.type=this.variant.iterable.itemType;
           };
           this.variant.mainVar.declareInScope();
       };
    };

        //debug:
        //.sayErr "ForStatement - pass declare"
        //console.log "index",.variant.indexVar, .indexNameDecl? .indexNameDecl.toString():undefined
        //console.log "main",.variant.mainVar, .mainNameDecl? .mainNameDecl.toString(): undefined


    //method evaluateAssignments() # Grammar.ForStatement
    Grammar.ForStatement.prototype.evaluateAssignments = function(){// # Grammar.ForStatement

        //declare valid .variant.iterable.getResultType

//ForEachInArray:
//If no mainVar.type, guess type from iterable's itemType

       //if .variant instanceof Grammar.ForEachInArray
       if (this.variant instanceof Grammar.ForEachInArray) {
           //if no .variant.mainVar.nameDecl.findOwnMember('**proto**')
           if (!this.variant.mainVar.nameDecl.findOwnMember('**proto**')) {
               var iterableType = this.variant.iterable.getResultType();
               //if iterableType and iterableType.findOwnMember('**item type**')  into var itemType
               var itemType=undefined;
               if (iterableType && (itemType=iterableType.findOwnMember('**item type**'))) {
                   this.variant.mainVar.nameDecl.setMember('**proto**', itemType);
               };
           };
       }

//ForEachProperty: index is string (property name)
       
       else if (this.variant instanceof Grammar.ForEachProperty) {
           this.variant.indexVar.nameDecl.setMember('**proto**', globalPrototype('String'));
       };
    };


    //method validatePropertyAccess() # Grammar.ForStatement
    Grammar.ForStatement.prototype.validatePropertyAccess = function(){// # Grammar.ForStatement
//ForEachInArray: check if the iterable has a .length property.

       //if .variant instanceof Grammar.ForEachInArray
       if (this.variant instanceof Grammar.ForEachInArray) {

            //declare valid .variant.iterable.getResultType

           var iterableType = this.variant.iterable.getResultType();

           //if no iterableType
           if (!iterableType) {
              //#.sayErr "ForEachInArray: no type declared for: '#{.variant.iterable}'"
             //do nothing
             null;
           }
              //#.sayErr "ForEachInArray: no type declared for: '#{.variant.iterable}'"
           
           else if (!iterableType.findMember('length')) {
             this.sayErr("ForEachInArray: no .length property declared in '" + this.variant.iterable + "' type:'" + (iterableType.toString()) + "'");
             log.error(iterableType.originalDeclarationPosition());
           };
       };
    };


   //append to class Grammar.ExceptionBlock
   
//`ExceptionBlock: (exception|catch) catchVar-IDENTIFIER Body [finally Body]`

     //method declare()
     Grammar.ExceptionBlock.prototype.declare = function(){

//Exception blocks have a scope

       this.createScope();
       this.addToScope(this.catchVar, {type: globalPrototype('Error')});
     };


   //append to class Grammar.NamespaceDeclaration
   

    //method declare()
    Grammar.NamespaceDeclaration.prototype.declare = function(){

//if it's a simple IDENTIFIER, declare it in the scope

       //if no .varRef.accessors
       if (!this.varRef.accessors) {

           this.nameDecl = this.addToScope(this.declareName(this.varRef.name));
       }

//else, a composed Identifier
       
       else {
            //#remove last accessors
           var lastAccessor = this.varRef.accessors.pop;

//try to get a reference, without the last accessor. Add as member of reference

           //if .varRef.tryGetReference({informError:true}) into var reference
           var reference=undefined;
           if ((reference=this.varRef.tryGetReference({informError: true}))) {
               this.nameDecl = this.addMemberTo(reference, lastAccessor.name);
           };

//restore last accessor

           this.varRef.accessors.push(lastAccessor);
       };

       //if .export and .nameDecl, .addToExport .nameDecl, .default
       if (this.export && this.nameDecl) {
           this.addToExport(this.nameDecl, this.default)};

       this.createScope();
    };



   //append to class Grammar.VariableRef ### Helper methods
   

//`VariableRef: ['--'|'++']Identifier[Accessors]['--'|'++']`

//`VariableRef` is a Variable Reference.

    //method validatePropertyAccess() # Grammar.VariableRef
    Grammar.VariableRef.prototype.validatePropertyAccess = function(){// # Grammar.VariableRef

       //if .parent is instance of Grammar.DeclareStatement, return
       if (this.parent instanceof Grammar.DeclareStatement) {
           return};

//Start with main variable name, to check property names

       var actualVar = this.tryGetFromScope(this.name, {informError: true, isForward: true, isDummy: true});

//now follow each accessor

       //if no actualVar or no .accessors, return
       if (!actualVar || !this.accessors) {
           return};

       //for each ac in .accessors
       for( var ac__inx=0,ac ; ac__inx<this.accessors.length ; ac__inx++){ac=this.accessors[ac__inx];
       
            //declare valid ac.name

//for PropertyAccess, check if the property name is valid

           //if ac instanceof Grammar.PropertyAccess
           if (ac instanceof Grammar.PropertyAccess) {
             actualVar = this.tryGetMember(actualVar, ac.name, {informError: true});
           }

//else, for IndexAccess, the varRef type is now 'itemType'
//and next property access should be on defined members of the type
           
           else if (ac instanceof Grammar.IndexAccess) {
               actualVar = actualVar.findMember('**item type**');
           }

//else, for FunctionAccess, the varRef type is now function's return type'
//and next property access should be on defined members of the return type
           
           else if (ac instanceof Grammar.FunctionAccess) {
               actualVar = actualVar.findMember('**return type**');
           };

           //if actualVar instanceof Grammar.VariableRef
           if (actualVar instanceof Grammar.VariableRef) {
                //declare actualVar:Grammar.VariableRef
               actualVar = actualVar.tryGetReference({informError: true, isForward: true, isDummy: true});
           };

           //if no actualVar, break
           if (!actualVar) {
               break};
       }; // end for each in this.accessors

       //end for #each accessor

       return actualVar;
    };

    //helper method tryGetReference(options) returns NameDeclaration
    Grammar.VariableRef.prototype.tryGetReference = function(options){

//evaluate this VariableRef.
//Try to determine referenced NameDecl.
//if we can reach a reference, return reference

       //default options=
       if(!options) options={};
       // options.informError: undefined

//Start with main variable name

       var actualVar = this.tryGetFromScope(this.name, options);
       //if no actualVar, return
       if (!actualVar) {
           return};

//now check each accessor

       //if no .accessors, return actualVar
       if (!this.accessors) {
           return actualVar};

       var partial = this.name;

       //for each ac in .accessors
       for( var ac__inx=0,ac ; ac__inx<this.accessors.length ; ac__inx++){ac=this.accessors[ac__inx];
       
            //declare valid ac.name

//for PropertyAccess

           //if ac instanceof Grammar.PropertyAccess
           if (ac instanceof Grammar.PropertyAccess) {
               actualVar = this.tryGetMember(actualVar, ac.name, options);
           }

//else, for IndexAccess, the varRef type is now 'itemType'
//and next property access should be on defined members of the type
           
           else if (ac instanceof Grammar.IndexAccess) {
               actualVar = this.tryGetMember(actualVar, '**item type**');
           }

//else, for FunctionAccess, the varRef type is now function's return type'
//and next property access should be on defined members of the return type
           
           else if (ac instanceof Grammar.FunctionAccess) {
               actualVar = this.tryGetMember(actualVar, '**return type**');
           };

//check if we can continue on the chain

           //if actualVar isnt instance of NameDeclaration
           if (!(actualVar instanceof NameDeclaration)) {
             actualVar = undefined;
             //break
             break;
           }
           
           else {
             partial += ac.toString();
           };
       }; // end for each in this.accessors

       //end for #each accessor

       //if no actualVar and options.informError
       if (!actualVar && options.informError) {
           this.sayErr("'" + this + "'. Reference can not be analyzed further than '" + partial + "'");
       };

       return actualVar;
    };

//-------


   //append to class Grammar.AssignmentStatement ###
   

    //method declareByAssignment()
    Grammar.AssignmentStatement.prototype.declareByAssignment = function(){

//Here we check for lvalue VariableRef in the form:

//`exports.x = xx`, `module.exports.x = xx` and `xx.prototype.yy =`

//We consider this assignments as 'declarations' of members rather than variable references to check.

//Start with main variable name

       var varRef = this.lvalue;

       var keywordFound = undefined;

       //if varRef.name is 'exports' #start with 'exports'
       if (varRef.name === 'exports') {// #start with 'exports'
           keywordFound = varRef.name;
       };

       //if no varRef.accessors
       if (!varRef.accessors) {

         //if keywordFound # is: `exports = x`, it does not work in node-js
         if (keywordFound) {// # is: `exports = x`, it does not work in node-js
             this.sayErr("'exports = x', does not work. You need to do: 'module.exports = x'");
         };

         return;// # no accessors to check
       };

       var actualVar = this.findInScope(varRef.name);
       //if no actualVar, return
       if (!actualVar) {
           return};

//now check each accessor

       var createName = undefined;

       //for each index,ac in varRef.accessors
       for( var index=0,ac ; index<varRef.accessors.length ; index++){ac=varRef.accessors[index];
       
            //declare valid ac.name

//for PropertyAccess

           //if ac instanceof Grammar.PropertyAccess
           if (ac instanceof Grammar.PropertyAccess) {

              //#if we're after 'exports|prototype' keyword and this is the last accessor,
              //#then this is the name to create
             //if keywordFound and index is varRef.accessors.length-1
             if (keywordFound && index === varRef.accessors.length - 1) {
                 createName = ac.name;
                 //break
                 break;
             };

//check for 'exports' or 'prototype', after that, last accessor is property declaration

             //if ac.name in ['exports','prototype']
             if (['exports', 'prototype'].indexOf(ac.name)>=0) {
               keywordFound = ac.name;
             };

             actualVar = actualVar.findMember(ac.name);
             //if no actualVar, break
             if (!actualVar) {
                 break};
           }

//else, if IndexAccess or function access, we exit analysis
           
           else {
             return;// #exit
           };
       }; // end for each in varRef.accessors

       //end for #each accessor in lvalue, look for module.exports=...

//if we found 'exports' or 'prototype', and we reach a valid reference

       //if keywordFound and actualVar
       if (keywordFound && actualVar) {

           //if createName # module.exports.x =... create a member
           if (createName) {// # module.exports.x =... create a member
             actualVar = this.addMemberTo(actualVar, createName);// # create x on module.exports
           };

            //#try to execute assignment, so exported var points to content
           var content = this.rvalue.getResultType({informError: true});
           //if content instanceof NameDeclaration
           if (content instanceof NameDeclaration) {
               actualVar.makePointTo(content);
           };
       };
    };


    //method evaluateAssignments() ## Grammar.AssignmentStatement
    Grammar.AssignmentStatement.prototype.evaluateAssignments = function(){// ## Grammar.AssignmentStatement

//check if we've got a a clear reference.

     var reference = this.lvalue.tryGetReference();
     //if reference isnt instanceof NameDeclaration, return
     if (!(reference instanceof NameDeclaration)) {
         return};
     //if reference.findOwnMember('**proto**'), return #has a type already
     if (reference.findOwnMember('**proto**')) {
         return};

//check if we've got a clear rvalue.
//if we do, set type for lvalue (unless is "null" or "undefined", they destroy type info)

     reference.assignTypeFromValue(this.rvalue);
    };


   //append to class Grammar.Expression ###
   

    //helper method getResultType() returns NameDeclaration
    Grammar.Expression.prototype.getResultType = function(){
//Try to get return type from a simple Expression

        //declare valid .root.getResultType
       return this.root.getResultType();// # .root is Grammar.Oper or Grammar.Operand
    };


   //append to class Grammar.Oper ###
   

//for 'into var x' oper, we declare the var, and we deduce type

    //method declare()
    Grammar.Oper.prototype.declare = function(){

       //if .intoVar # is a into-assignment operator with 'var' declaration
       if (this.intoVar) {// # is a into-assignment operator with 'var' declaration

           var varRef = this.right.name;
           //if varRef isnt instance of Grammar.VariableRef
           if (!(varRef instanceof Grammar.VariableRef)) {
               this.throwError("Expected 'variable name' after 'into var'");
           };

           //if varRef.accessors
           if (varRef.accessors) {
               this.throwError("Expected 'simple variable name' after 'into var'");
           };

           this.addToScope(this.declareName(varRef.name, {type: varRef.type}));
       };
    };

    //method evaluateAssignments()
    Grammar.Oper.prototype.evaluateAssignments = function(){

//for into-assignment operator

     //if .name is 'into' # is a into-assignment operator
     if (this.name === 'into') {// # is a into-assignment operator

//check if we've got a clear reference (into var x)

         //if .right.name instance of Grammar.VariableRef
         if (this.right.name instanceof Grammar.VariableRef) {

              //declare valid .right.name.tryGetReference
             var nameDecl = this.right.name.tryGetReference();

             //if nameDecl isnt instanceof NameDeclaration, return
             if (!(nameDecl instanceof NameDeclaration)) {
                 return};
             //if nameDecl.findOwnMember('**proto**'), return #has a type already
             if (nameDecl.findOwnMember('**proto**')) {
                 return};

//check if we've got a clear .left (value to be assigned) type
//if we do, set type for .rigth ('into var x') (unless is "null" or "undefined", they destroy type info)

             nameDecl.assignTypeFromValue(this.left);
         };
     };
    };


    //helper method getResultType() returns NameDeclaration
    Grammar.Oper.prototype.getResultType = function(){
//Try to get return type from this Oper (only for 'new' unary oper)

        //declare valid .right.getResultType

       //if .name is 'new'
       if (this.name === 'new') {
           return this.right.getResultType();// #.right is Grammar.Operand
       };
    };


   //append to class Grammar.Operand ###
   

    //helper method getResultType() returns NameDeclaration
    Grammar.Operand.prototype.getResultType = function(){
//Try to get return type from this Operand

        //declare valid .name.type
        //declare valid .name.getResultType
        //declare valid .name.tryGetReference

       //if .name instance of Grammar.ObjectLiteral
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


   //append to class Grammar.DeclareStatement
   
    //method declare() # pass 1, declare as props
    Grammar.DeclareStatement.prototype.declare = function(){// # pass 1, declare as props

//declare valid x.y.z

//declare on x

     //if .specifier is 'on'
     if (this.specifier === 'on') {

         var reference = this.tryGetFromScope(this.name, {isForward: true});

         //if String.isCapitalized(reference.name)
         if (String.isCapitalized(reference.name)) {
              //declare valid reference.members.prototype
             //if no reference.members.prototype
             if (!reference.members.prototype) {
                 reference.addMember('prototype');
             };
             reference = reference.members.prototype;
         };

         //for each varDecl in .names
         for( var varDecl__inx=0,varDecl ; varDecl__inx<this.names.length ; varDecl__inx++){varDecl=this.names[varDecl__inx];
         
             this.addMemberTo(reference, varDecl.createNameDeclaration());
         }; // end for each in this.names
         
     }

//else: declare (VariableDecl,)
     
     else {

         //for each varDecl in .names
         for( var varDecl__inx=0,varDecl ; varDecl__inx<this.names.length ; varDecl__inx++){varDecl=this.names[varDecl__inx];
         

           varDecl.nameDecl = varDecl.createNameDeclaration();

           //if .global or .specifier is 'global'
           if (this.global || this.specifier === 'global') {
                //declare valid project.root.addToScope
               project.root.addToScope(varDecl.nameDecl);
           };

           //if .specifier is 'affinity'
           if (this.specifier === 'affinity') {
               var classDecl = this.getParent(Grammar.ClassDeclaration);
               //if no classDecl
               if (!classDecl) {
                   this.sayErr("declare affinity must be included in a class declaration");
                   return;
               };
                //#add as member to nameAffinity, referencing class decl (.nodeDeclared)
               varDecl.nameDecl.nodeDeclared = classDecl;
               nameAffinity.addMember(varDecl.nameDecl);
           }
           
           else if (this.specifier === 'forward') {
               //do nothing
               null;
           };
         }; // end for each in this.names
         
     };
    };

//if .specifier is 'types', the type will be converted on next passes over the created NameDeclaration.
//On the method validatePropertyAccess(), types will be switched "on the fly" while checking property access.


    //method validatePropertyAccess() # Grammar.DeclareStatement ###
    Grammar.DeclareStatement.prototype.validatePropertyAccess = function(){// # Grammar.DeclareStatement ###

//declare var:type. alter on the fly scope var "types"

     //if .specifier is 'types'
     if (this.specifier === 'types') {

         //for each varDecl in .names
         for( var varDecl__inx=0,varDecl ; varDecl__inx<this.names.length ; varDecl__inx++){varDecl=this.names[varDecl__inx];
         
             //if .tryGetFromScope(varDecl.name,{informError:true}) into var mainVar
             var mainVar=undefined;
             if ((mainVar=this.tryGetFromScope(varDecl.name, {informError: true}))) {
                 //if varDecl.nameDecl.findOwnMember('**proto**') into var declaredType # has type
                 var declaredType=undefined;
                 if ((declaredType=varDecl.nameDecl.findOwnMember('**proto**'))) {// # has type
                     mainVar.setMember('**proto**', declaredType);
                 };
             };
         }; // end for each in this.names
         
     }

//declare members on the fly
     
     else if (this.specifier === 'valid') {
         var actualVar = this.tryGetFromScope(this.varRef.name, {informError: true});
         //for each ac in .varRef.accessors
         for( var ac__inx=0,ac ; ac__inx<this.varRef.accessors.length ; ac__inx++){ac=this.varRef.accessors[ac__inx];
         
            //declare valid ac.name

           //if ac isnt instance of Grammar.PropertyAccess, break
           if (!(ac instanceof Grammar.PropertyAccess)) {
               break};

           //if ac.name is 'prototype'
           if (ac.name === 'prototype') {
               actualVar = actualVar.findOwnMember(ac.name) || this.addMemberTo(actualVar, ac.name);
           }
           
           else {
               actualVar = actualVar.findMember(ac.name) || this.addMemberTo(actualVar, ac.name);
           };

           //if this.type #create type on the fly
           if (this.type) {// #create type on the fly
               actualVar.setMember('**proto**', this.type);
               actualVar.processConvertTypes();
           };
         }; // end for each in this.varRef.accessors
         
     };
    };




//Compiled by LiteScript compiler v0.5.0, source: /home/ltato/LiteScript/devel/source-v0.6.0/Validate.lite.md
//# sourceMappingURL=Validate.js.map
