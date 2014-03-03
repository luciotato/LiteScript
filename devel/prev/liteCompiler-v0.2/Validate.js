//Name Validation
//===============

//This module contains helper functions to manage variable,
//function and object property name declaration.

//This module purpose is to make the compiler catch
//mistyped variable and property names at compile time
//(instead of YOU spending hours to debug a subtle bug at run time)

//In order to do name validation we need to construct the scope tree,
//and also register all valid members of all "types" (objects).


    //declare forward
      //globalPrototype

//----------
//##Dependencies:

//This module extends Grammar classes, adding 'declare', 'evaluateAssignments', etc.
//methods to validate var & property names.

//We extend the Grammar classes, so this module require the `Grammar` module.

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
//The compiler will catch that as "undeclared variable".

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

//If you don't want to include var types, You can also explicitily use a
//`declare on myObj prop1,prop2` statement to dismiss the 'prop1 IS NOT A PROPERTY OF myObj'
//compiler errors

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

//  bObj.classAProp1 = 5 // <-- this **will be caught**

//  var xObj = callToFn() // unknown type

//  xObj.classBProp1 = 5 // <-- this trigger a "classBProp1 IS NOT A DECLARED PROPERTY OF xObj"

//  declare on xObj  // <-- this fixes it
//    classBProp1

//  xObj.classBProp1 = 5 // <-- this is OK now

//  var xObj:ClassB = callToFn() // type annotation, this also fixes it

//  bObj.classBProp1 = 5 // <-- this is ok


//forward

    //declare forward walkAllNodesCalling,forEachASTNode


   //    helper function normalizeVarName(text:string) returns String
   function normalizeVarName(text){

      //#for vars, we allow "token" and "Token" to be in the same scope
     //return NameDeclaration.fixSpecialNames(text.slice(0,1)+text.slice(1).toLowerCase())
     return NameDeclaration.fixSpecialNames(text.slice(0, 1) + text.slice(1).toLowerCase());
   };


//##Additions to NameDeclaration. Helpers to do name validation

   //append to NameDeclaration.prototype
   

    //     helper method findMember(name) returns NameDeclaration
    NameDeclaration.prototype.findMember = function(name){
//this method looks for a name in NameDeclaration members,
//it also follows the **proto** chain (same mechanism as js __proto__ chain)

       var actual = this;
       var count = 0;

       //do while actual instance of NameDeclaration
       while(actual instanceof NameDeclaration){
       

           var result = actual.findOwnMember(name);
           //if result, return result
           if (result) {
               return result};

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
           if (count++ > 50) {//#assume circular
               //me.warn "circular type reference"
               this.warn("circular type reference");
               //return
               return;
           };
       
       };//end loop
       ;
    };


    //     helper method processConvertTypes()
    NameDeclaration.prototype.processConvertTypes = function(){
//convert possible types stored in NameDeclaration,
//from string to NameDeclarations in the scope
//returns '**proto**' converted type

       //me.convertType '**return type**'  #a Function can have **return type**
       this.convertType('**return type**');//#a Function can have **return type**
       //me.convertType '**item type**'  #an Array can have **item type** e.g.: 'var list: string array'
       this.convertType('**item type**');//#an Array can have **item type** e.g.: 'var list: string array'

//if no type defined, try by name affinity,e.g., for var 'token', if a Class named 'Token' is
//in scope, var 'token' is assumed type 'Token', return true if type was assigned

       var converted = undefined;
       //if not me.findOwnMember('**proto**')
       if (!(this.findOwnMember('**proto**'))) {
         converted = this.assignTypebyNameAffinity();
       }
       else {
         converted = this.convertType('**proto**');//#other objects
       
       };

       //if converted, me.converted = true
       if (converted) {
           this.converted = true};

       //return converted
       return converted;
    };


    //     helper method convertType(internalName)
    NameDeclaration.prototype.convertType = function(internalName){
//convert type from string to NameDeclarations in the scope.
//returns 'true' if converted, 'false' if it has to be tried later

       var type = this.findOwnMember(internalName);
       //if no type, return  #nothing to process
       if (!type) {
           return};

       //if type instance of NameDeclaration
       if (type instanceof NameDeclaration) {
            //#already converted
           //return
           return;
       };

        //# if the type is a varRef, must reference a class
       //if type instanceof Grammar.VariableRef
       if (type instanceof Grammar.VariableRef) {
            //declare valid type.tryGetReference
            //var classFN = type.tryGetReference()
           var classFN = type.tryGetReference();
            //declare valid classFN.members.prototype
            //if classFN
           //if classFN
           if (classFN) {
             //if no classFN.members.prototype
             if (!classFN.members.prototype) {
               //me.sayErr "TYPE: '#{Grammar.VariableRef}' has no prototype"
               this.sayErr("TYPE: '" + (Grammar.VariableRef) + "' has no prototype");
               //return
               return;
             };
             type = classFN.members.prototype;
           };
       }
       else if (typeof type === 'string') {

           //if no me.nodeDeclared
           if (!this.nodeDeclared) {
             type = globalPrototype(type);
           }
           else {
             type = this.nodeDeclared.findInScope(type);
              //declare valid type.members.prototype
              //type = type.members.prototype or type
             type = type.members.prototype || type;
           
           };
       }
       else {
          //declare valid type.constructor.name
          //me.sayErr "INTERNAL ERROR: UNRECG. TYPE on #internalName: '#{type}' [#{type.constructor.name}] typeof is '#{typeof type}'"
         //me.sayErr "INTERNAL ERROR: UNRECG. TYPE on #internalName: '#{type}' [#{type.constructor.name}] typeof is '#{typeof type}'"
         this.sayErr("INTERNAL ERROR: UNRECG. TYPE on " + internalName + ": '" + (type) + "' [" + (type.constructor.name) + "] typeof is '" + (typeof type) + "'");
         //return
         return;
       
       };

        //#store converted
       //if type, me.setMember(internalName,type)
       if (type) {
           this.setMember(internalName, type)};

       //return type
       return type;
    };


    //     helper method assignTypebyNameAffinity()
    NameDeclaration.prototype.assignTypebyNameAffinity = function(){
//Auto-assign type by name affinity.
//If no type specified, check project.nameAffinity

       //if me.nodeDeclared and not String.isCapitalized(me.name)
       if (this.nodeDeclared && !(String.isCapitalized(this.name))) {

           //if not me.findOwnMember('**proto**')
           if (!(this.findOwnMember('**proto**'))) {

               var normalized = NameDeclaration.normalizePropName(this.name);
               var possibleClassRef = nameAffinity.members[normalized];

                //# possibleClassRef is a NameDeclaration whose .nodeDeclared is a ClassDeclaration

                //# check 'ends with' if name is at least 6 chars in length
               //if not possibleClassRef and normalized.length>=6
               if (!(possibleClassRef) && normalized.length >= 6) {
                   //for each own property affinityName in nameAffinity.members
                   for ( var affinityName in nameAffinity.members) if (nameAffinity.members.hasOwnProperty(affinityName)) {
                       //if normalized.endsWith(affinityName)
                       if (normalized.endsWith(affinityName)) {
                           possibleClassRef = nameAffinity.members[affinityName];
                           //break
                           break;
                       };
                   }; // end for each property
               };

                //declare valid possibleClassRef.nodeDeclared.nameDecl.members.prototype
                //if possibleClassRef and possibleClassRef.nodeDeclared.nameDecl.members.prototype
               //if possibleClassRef and possibleClassRef.nodeDeclared.nameDecl.members.prototype
               if (possibleClassRef && possibleClassRef.nodeDeclared.nameDecl.members.prototype) {
                   //me.setMember('**proto**', possibleClassRef.nodeDeclared.nameDecl.members.prototype)
                   this.setMember('**proto**', possibleClassRef.nodeDeclared.nameDecl.members.prototype);
                   //return true
                   return true;
               };
           };
       };
    };


   //    helper function globalPrototype(name)
   function globalPrototype(name){
//gets a var from global scope

     //if name instanceof NameDeclaration, return name #already converted type
     if (name instanceof NameDeclaration) {
         return name};

     var normalized = normalizeVarName(name);

     var nameDecl = globalScope.members[normalized];
     //if no nameDecl
     if (!nameDecl) {
       //fail with "no '#{name}' in global scope"
       throw new Error("no '" + (name) + "' in global scope");
     };

      //declare valid nameDecl.members.prototype

      //if no nameDecl.members.prototype
     //if no nameDecl.members.prototype
     if (!nameDecl.members.prototype) {
       //fail with "global scope '#{name}' has no .members.prototype"
       throw new Error("global scope '" + (name) + "' has no .members.prototype");
     };

     //return nameDecl.members.prototype
     return nameDecl.members.prototype;
   };


   //    helper function addBuiltInObject(name,node)
   function addBuiltInObject(name, node){
//Add a built-in class to global scope, return class prototype

     var nameDecl = new NameDeclaration(name, {isBuiltIn: true}, node);

     var normalized = normalizeVarName(name);
     globalScope.members[normalized] = nameDecl;

     //nameDecl.getMembersFromObjProperties Environment.getGlobalObject(name)
     nameDecl.getMembersFromObjProperties(Environment.getGlobalObject(name));

      //declare valid nameDecl.members.prototype

      //if nameDecl.members.prototype
     //if nameDecl.members.prototype
     if (nameDecl.members.prototype) {
       //nameDecl.setMember '**return type**', nameDecl.members.prototype
       nameDecl.setMember('**return type**', nameDecl.members.prototype);
       //return nameDecl.members.prototype
       return nameDecl.members.prototype;
     };

     //return nameDecl
     return nameDecl;
   };

//---------------------------------------
//----------------------------------------
//----------------------------------------

   //    public function validate(aProject)
   function validate(aProject){

//We start this module once the entire multi-node AST tree has been parsed.
//### Steps:

//#### Initialize Global Scope

//Initialize module vars

       project = aProject;

       nameAffinity = new NameDeclaration('Name Affinity');//# project-wide name affinity for classes

//The "scope" of rootNode is the global scope.
//Initialize the global scope

        //declare valid project.root.createScope
        //declare valid project.globalScope
        //declare valid project.globalScope

        //globalScope = project.root.createScope()
       globalScope = project.root.createScope();
       project.globalScope = globalScope;

//Populate the global scope

       var objProto = addBuiltInObject('Object');
        //declare valid objProto.members.constructor.addMember
        //objProto.members.constructor.addMember('name')
       //objProto.members.constructor.addMember('name')
       objProto.members.constructor.addMember('name');

       //addBuiltInObject('String')
       addBuiltInObject('String');
       //addBuiltInObject('Function')
       addBuiltInObject('Function');
       //addBuiltInObject('Boolean')
       addBuiltInObject('Boolean');
       //addBuiltInObject('Array')
       addBuiltInObject('Array');
       //addBuiltInObject('Number')
       addBuiltInObject('Number');
       //addBuiltInObject('RegExp')
       addBuiltInObject('RegExp');
       //addBuiltInObject('JSON')
       addBuiltInObject('JSON');
       //addBuiltInObject('Error')
       addBuiltInObject('Error');
       //addBuiltInObject('Math')
       addBuiltInObject('Math');

       //globalScope.addMember new NameDeclaration('true',{value:true})
       globalScope.addMember(new NameDeclaration('true', {value: true}));
       //globalScope.addMember new NameDeclaration('false',{value:false})
       globalScope.addMember(new NameDeclaration('false', {value: false}));
       //globalScope.addMember new NameDeclaration('on',{value:true})
       globalScope.addMember(new NameDeclaration('on', {value: true}));
       //globalScope.addMember new NameDeclaration('off',{value:false})
       globalScope.addMember(new NameDeclaration('off', {value: false}));
       //globalScope.addMember new NameDeclaration('undefined',{value:undefined})
       globalScope.addMember(new NameDeclaration('undefined', {value: undefined}));
       //globalScope.addMember new NameDeclaration('null',{value:null})
       globalScope.addMember(new NameDeclaration('null', {value: null}));

       //globalScope.addMember new NameDeclaration('require')
       globalScope.addMember(new NameDeclaration('require'));
       //globalScope.addMember new NameDeclaration('debugger')
       globalScope.addMember(new NameDeclaration('debugger'));

       //globalScope.addMember(new NameDeclaration('global',{type:globalScope}))
       globalScope.addMember(new NameDeclaration('global', {type: globalScope}));

//Now, run passes on each project module.

//#### Pass 1.0 Declarations
//Walk the tree, and call function 'declare' on every node having it.
//'declare' will create scopes, and vars in the scope.
//May inform 'DUPLICATES' and 'CASE MISMATCH' errors.

       //log.message "Pass 1.0 Declarations"
       log.message("Pass 1.0 Declarations");
       //walkAllNodesCalling 'declare'
       walkAllNodesCalling('declare');

//#### Pass 1.1 Declare By Assignment
//Walk the tree, and check assignments looking for: 'module.exports.x=x' and 'x.prototype.y = '.
//Treat them as declarations.

       //log.message "Pass 1.1 Declare By Assignment"
       log.message("Pass 1.1 Declare By Assignment");
       //walkAllNodesCalling 'declareByAssignment'
       walkAllNodesCalling('declareByAssignment');


//#### Pass 1.2 connectImportRequire
//check `x=require('y')` calls.
//Make var x point to required module 'y' exports

        //declare valid project.moduleCache

        //log.message "Pass 1.2 Connect Import Require"
       //log.message "Pass 1.2 Connect Import Require"
       log.message("Pass 1.2 Connect Import Require");
       //for each own property fname in project.moduleCache
       for ( var fname in project.moduleCache) if (project.moduleCache.hasOwnProperty(fname)) {
         var moduleNode = project.moduleCache[fname];

         //for each node in moduleNode.requireCallNodes
         for ( var node__inx=0; node__inx<moduleNode.requireCallNodes.length; node__inx++) {
           var node=moduleNode.requireCallNodes[node__inx];

           //if node.importedModule
           if (node.importedModule) {

             var parent = undefined;
             var reference = undefined;

              //declare valid parent.lvalue.tryGetReference
              //declare valid parent.nameDecl
              //declare valid parent.nameDecl

//get immediate parent of the "require" call

              //parent = node.parent
             parent = node.parent;
             //if parent instance of Grammar.Operand
             if (parent instanceof Grammar.Operand) {
                parent = node.parent.parent.parent;//# varRef->operand->Expression->Expression's Parent
             };

//get referece where "require" result is being assigned to (AssignmentStatement or VariableDecl)

             //if parent instance of Grammar.AssignmentStatement
             if (parent instanceof Grammar.AssignmentStatement) {
               reference = parent.lvalue.tryGetReference({informError: true});
             }
             else if (parent instanceof Grammar.VariableDecl) {
               reference = parent.nameDecl;
             };

//make reference point to importedModule.exports

             //if reference
             if (reference) {
               //reference.makePointTo node.importedModule.exports
               reference.makePointTo(node.importedModule.exports);
             };
           };
         }; // end for each in moduleNode.requireCallNodes
       }; // end for each property


//#### Pass 1.3 Process "Append To" Declarations
//Since 'append to [class|object] x.y.z' statement can add to any object, we delay
//"Append To" declaration to this point, where 'x.y.z' can be analyzed and a reference obtained.
//Walk the tree, and check "Append To" Methods & Properties Declarations

       //log.message "Pass 1.3 Process Append-To"
       log.message("Pass 1.3 Process Append-To");
       //walkAllNodesCalling 'processAppendTo'
       walkAllNodesCalling('processAppendTo');


//#### Pass 3. Convert Type
//for each NameDeclaration try to find the declared 'type' (string) in the scope.
//Repeat until no conversions can be made.

       //log.message "Pass 3.0 Convert Type"
       log.message("Pass 3.0 Convert Type");

       var totalConverted = 0;
       //while totalConverted < NameDeclaration.allOfThem.length
       while(totalConverted < NameDeclaration.allOfThem.length){
       

         var converted = 0;

         //for each nameDecl in NameDeclaration.allOfThem
         for ( var nameDecl__inx=0; nameDecl__inx<NameDeclaration.allOfThem.length; nameDecl__inx++) {
           var nameDecl=NameDeclaration.allOfThem[nameDecl__inx];
           //if no nameDecl.converted
           if (!nameDecl.converted) {
             //if nameDecl.processConvertTypes(), converted++
             if (nameDecl.processConvertTypes()) {
                 converted++};
           };
         }; // end for each in NameDeclaration.allOfThem
         //end for

         //if no converted, break #exit if no more conversions possible
         if (!converted) {
             break};
         totalConverted += converted;
         //debug "converted:#converted, totalConverted:#totalConverted"
         debug("converted:" + converted + ", totalConverted:" + totalConverted);
       
       };//end loop
       ;
        //#loop

//Inform unconverted types as errors

       //if totalConverted < NameDeclaration.allOfThem.length
       if (totalConverted < NameDeclaration.allOfThem.length) {

         //for each nameDecl in NameDeclaration.allOfThem
         for ( var nameDecl__inx=0; nameDecl__inx<NameDeclaration.allOfThem.length; nameDecl__inx++) {
           var nameDecl=NameDeclaration.allOfThem[nameDecl__inx];

           var type = nameDecl.findOwnMember('**proto**');
           //if type and type isnt instanceof NameDeclaration
           if (type && !(type instanceof NameDeclaration)) {
               //nameDecl.sayErr "undeclard type: '#{type.toString()}'"
               nameDecl.sayErr("undeclard type: '" + (type.toString()) + "'");
               //if type instanceof Grammar.ASTBase
               if (type instanceof Grammar.ASTBase) {
                 //log.error type.positionText(),"for reference, type declaration"
                 log.error(type.positionText(), "for reference, type declaration");
               };
           };
         }; // end for each in NameDeclaration.allOfThem
       };

//#### Pass 4.0 Evaluate Assignments
//Walk the scope tree, and for each assignment,
//IF L-value has no type, try to guess from R-value's result type

       //log.message "Pass 4.0 Evaluate Assignments"
       log.message("Pass 4.0 Evaluate Assignments");
       //walkAllNodesCalling 'evaluateAssignments'
       walkAllNodesCalling('evaluateAssignments');

//#### Pass 5.0 -Final- Validate Property Access
//Once we have all vars declared and typed, walk the scope tree,
//and for each VariableRef validate property access.
//May inform 'UNDECLARED PROPERTY'.

       //log.message "Pass 5.0 Validate Property Access"
       log.message("Pass 5.0 Validate Property Access");
       //walkAllNodesCalling 'validatePropertyAccess'
       walkAllNodesCalling('validatePropertyAccess');

//Inform forward declarations not fullfilled, as errors

       //for each nameDecl in NameDeclaration.allOfThem
       for ( var nameDecl__inx=0; nameDecl__inx<NameDeclaration.allOfThem.length; nameDecl__inx++) {
           var nameDecl=NameDeclaration.allOfThem[nameDecl__inx];

           //if nameDecl.isForward and not nameDecl.isDummy
           if (nameDecl.isForward && !(nameDecl.isDummy)) {
               //nameDecl.warn "forward declared, but never found"
               nameDecl.warn("forward declared, but never found");
               var container = nameDecl.nodeDeclared.getParent(Grammar.ClassDeclaration);
               //if container
               if (container) {
                  //declare container:Grammar.ClassDeclaration
                  //declare valid container.varRef.toString
                  //if container.varRef, log.warning "#{container.positionText()} more info: '#nameDecl.name' of '#{container.varRef.toString()}'"
                 //if container.varRef, log.warning "#{container.positionText()} more info: '#nameDecl.name' of '#{container.varRef.toString()}'"
                 if (container.varRef) {
                     log.warning("" + (container.positionText()) + " more info: '" + nameDecl.name + "' of '" + (container.varRef.toString()) + "'")};
               };
           };
       }; // end for each in NameDeclaration.allOfThem
   };
   exports.validate=validate;

   //end function validate


   //    public function walkAllNodesCalling(methodName)
   function walkAllNodesCalling(methodName){

//For each node, if the specific statement has methodName, call it

       //forEachASTNode project.moduleCache, function(node)
       forEachASTNode(project.moduleCache, function(node){
           //if node has property methodName
           if (methodName in node) {
               //node[methodName]()
               node[methodName]();
           };
       });
   };
   exports.walkAllNodesCalling=walkAllNodesCalling;


   //    helper function forEachASTNode(obj,callback) # recursive
   function forEachASTNode(obj, callback){//# recursive

//if obj is instance of ASTBase, callback

     //if obj is instance of ASTBase, callback(obj)
     if (obj instanceof ASTBase) {
         callback(obj)};

//recurse on ASTBase properties and also Arrays (exclude 'parent' and 'importedModule')

     //for each own property name in obj
     for ( var name in obj) if (obj.hasOwnProperty(name)) {
         //if name isnt 'parent' and name isnt 'importedModule'
         if (name !== 'parent' && name !== 'importedModule') {
           //if obj[name] instance of ASTBase or obj[name] instance of Array
           if (obj[name] instanceof ASTBase || obj[name] instanceof Array) {
             //forEachASTNode obj[name],callback #recurse
             forEachASTNode(obj[name], callback);//#recurse
           };
         };
     }; // end for each property
   };


//----------
//----------
//----------
//----------
//----------
//----------
//Utility
//-------

   var util = require('./util');


//--------------------------------
//## Helper methods added to AST Tree

   //append to ASTBase.prototype
   

    //     helper method declareName(name, options)
    ASTBase.prototype.declareName = function(name, options){
//declareName creates a new NameDeclaration, referecing source (AST node)

       //return new NameDeclaration(name, options, me)
       return new NameDeclaration(name, options, this);
    };

    //     method addMemberTo(nameDecl, memberName, options)
    ASTBase.prototype.addMemberTo = function(nameDecl, memberName, options){
//a Helper method ASTBase.*addMemberTo*
//Adds a member to a NameDecl, referencing this node as nodeDeclared

       //return nameDecl.addMember(memberName, options, me)
       return nameDecl.addMember(memberName, options, this);
    };

    //     helper method tryGetMember(nameDecl,name:string,options)
    ASTBase.prototype.tryGetMember = function(nameDecl, name, options){
//this method looks for a specific member, optionally declare as forward
//or inform error. We need this AST node, to correctly report error.

       //default options =
       if(!options) options={};
       if(options.informError===undefined) options.informError=undefined;
       if(options.isForward===undefined) options.isForward=undefined;

       var found = nameDecl.findMember(name);

       //if found and name.slice(0,2) isnt '**'
       if (found && name.slice(0, 2) !== '**') {
         //found.caseMismatch name,me
         found.caseMismatch(name, this);
       }
       else {
         //if options.informError, log.warning "#{me.positionText()}. No member named '#{name}' on #{nameDecl.info()}"
         if (options.informError) {
             log.warning("" + (this.positionText()) + ". No member named '" + (name) + "' on " + (nameDecl.info()))};
         //if options.isForward, found = me.addMemberTo(nameDecl,name,options)
         if (options.isForward) {
             found = this.addMemberTo(nameDecl, name, options)};
       
       };

       //return found
       return found;
    };


    //     helper method getRootNode()
    ASTBase.prototype.getRootNode = function(){

//**getRootNode** method moves up in the AST up to the node holding the global scope ("root").
//"root" node has parent = Project

       var node = this;
       //while node.parent instanceof ASTBase
       while(node.parent instanceof ASTBase){
       
           node = node.parent;//# move up
       
       };//end loop
       ;
       //return node
       return node;
    };


    //     helper method getScopeNode()
    ASTBase.prototype.getScopeNode = function(){

//**getScopeNode** method return the parent 'scoped' node in the hierarchy.
//It looks up until found a node with .scope

//Start at this node

       var node = this;
        //declare valid node.scope

        //while node
       //while node
       while(node){
       

         //if node.scope
         if (node.scope) {
           //return node # found a node with scope
           return node;//# found a node with scope
         };

         node = node.parent;//# move up
       
       };//end loop
       ;

        //#loop

       //return null
       return null;
    };


    //     method findInScope(name) returns NameDeclaration
    ASTBase.prototype.findInScope = function(name){
//this method looks for the original place
//where a name was defined (function,method,var)
//Returns the Identifier node from the original scope
//It's used to validate variable references to be previously declared names

       var normalized = undefined;


//First we handle multi-item names, as: String.prototype.split

//        if name.indexOf('.')>=0
//          var parts = name.split('.')
//          var mainVar = me.findInScope(parts[0])
//          if no mainVar
//            return null
//          var n=1
//          while n<parts.length
//            normalized = normalize(parts[n])
//            if mainVar.members.hasOwnProperty(normalized)
//              mainVar = mainVar.members[normalized]
//            else
//              return null
//          #loop
//          return mainVar
//        #end if

       normalized = normalizeVarName(name);

//Start at this node

       var node = this;
        //declare valid node.scope.members

//Look for the declaration in this scope

        //while node
       //while node
       while(node){
       
         //if node.scope
         if (node.scope) {
           //if node.scope.members.hasOwnProperty(normalized)
           if (node.scope.members.hasOwnProperty(normalized)) {
             //return node.scope.members[normalized]
             return node.scope.members[normalized];
           };
         };

//move up in scopes

         node = node.parent;
       
       };//end loop
       ;
    };

        //#loop


    //     method tryGetFromScope(name, options) returns NameDeclaration
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
       if(options.isForward===undefined) options.isForward=undefined;
       if(options.informError===undefined) options.informError=undefined;

//Search the scope

       var found = this.findInScope(name);
       //if found
       if (found) {

//Declaration found, we check the upper/lower case to be consistent
//If the found item has a different case than the name we're looking for, emit error

           //if found.caseMismatch(name, me)
           if (found.caseMismatch(name, this)) {
             //return found
             return found;
           };
       }
       else if (['true', 'false', 'undefined', 'null', 'NaN', 'Infinity'].indexOf(name)>=0) {
           found = this.getRootNode().addToScope(name);
       }
       else if (Environment.isBuiltInObject(name)) {

           found = addBuiltInObject(name, this);
       }
       else {
           //if options.informError
           if (options.informError) {
               //me.sayErr "UNDECLARED NAME: '#{name}'"
               this.sayErr("UNDECLARED NAME: '" + (name) + "'");
           };

           //if options.isForward
           if (options.isForward) {
               found = this.addToScope(name, options);
               //if options.isDummy and String.isCapitalized(name) #let's assume is a class
               if (options.isDummy && String.isCapitalized(name)) {//#let's assume is a class
                   //me.addMemberTo(found,'prototype',options)
                   this.addMemberTo(found, 'prototype', options);
               };
           };
       
       };

        //#end if - check declared variables

       //return found
       return found;
    };



    //     method addToScope(item, options) returns NameDeclaration
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
        //var name = type of item is 'string'? item : item.name
       var name = typeof item === 'string' ? item : item.name;

       //debug "addToScope: '#{name}' to '#{scope.name}'" #[#{me.constructor.name}] name:
       debug("addToScope: '" + (name) + "' to '" + (scope.name) + "'");//#[#{me.constructor.name}] name:

       var found = this.findInScope(name);
       //if found
       if (found) {

           //if found.caseMismatch(name, me)
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
               //found.replaceForward item
               found.replaceForward(item);
             };
           }
           else {
             //me.sayErr "DUPLICATED name in scope: '#{name}'"
             this.sayErr("DUPLICATED name in scope: '" + (name) + "'");
             //log.error found.originalDeclarationPosition() #add extra information line
             log.error(found.originalDeclarationPosition());//#add extra information line
           
           };

           //return found
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

       var normalized = normalizeVarName(name);
       scope.members[normalized] = nameDecl;

       //return nameDecl
       return nameDecl;
    };


    //     helper method addToExport(nameDecl)
    ASTBase.prototype.addToExport = function(nameDecl){
//Add to parentModule.exports, but *preserve parent*

     var parentModule = this.getParent(Grammar.Module);
     var saveParent = nameDecl.parent;
     //parentModule.exports.addMember(nameDecl)
     parentModule.exports.addMember(nameDecl);
     nameDecl.parent = saveParent;
    };


    //     helper method createScope()
    ASTBase.prototype.createScope = function(){
//initializes an empty scope in this node

        //declare valid me.scope.isScope

        //if no me.scope
       //if no me.scope
       if (!this.scope) {
         this.scope = this.declareName("" + (this.name || this.constructor.name) + " Scope");
         this.scope.isScope = true;
       };

       //return me.scope
       return this.scope;
    };

    //     helper method createFunctionScope(scopeThisProto)
    ASTBase.prototype.createFunctionScope = function(scopeThisProto){

//Functions (methods and constructors also), have a 'scope'.
//It captures al vars declared in its body.
//We now create function's scope and add the special var 'this'.
//The 'type' of 'this' is normally a class prototype,
//which contains other methods and properties from the class.
//We also add 'arguments.length'

       var scope = this.createScope();

       //me.addMemberTo(scope, 'arguments').addMember('length')
       this.addMemberTo(scope, 'arguments').addMember('length');

       var varThis = this.addMemberTo(scope, 'this', {type: scopeThisProto});
       //me.addMemberTo(scope,'me',{pointsTo:varThis}) # me -> this
       this.addMemberTo(scope, 'me', {pointsTo: varThis});//# me -> this
    };

//Note: since ALL functions have 'this' in scope, when you create
//a class inside a function, or a function inside a function, you'll have TWO different
//'this' "in scope". One in the inner scope, shadowing other in the outer scope.
//This is technically a scope 'name duplication', but it's allowed fot 'this' & 'arguments'

    //     helper method tryGetOwnerDecl(options)
    ASTBase.prototype.tryGetOwnerDecl = function(options){
//Used by properties & methods in the body of AppendToDeclaration
//to get their 'owner', i.e., a NameDeclaration where they'll be added as members

       //default options=
       if(!options) options={};
       if(options.informError===undefined) options.informError=undefined;

       var ownerDecl = undefined, optClass = true;

        //declare valid me.varRefOwner.tryGetReference
        //declare valid me.specifier
        //declare valid me.specifier

        //# get parent class/append to
        //var parent:Grammar.ClassDeclaration = me.getParent(Grammar.ClassDeclaration)
       var parent = this.getParent(Grammar.ClassDeclaration);
       //if no parent
       if (!parent) {
         //me.throwError "'#{me.specifier}' declaration outside 'class/append to' declaration. Check indent"
         this.throwError("'" + (this.specifier) + "' declaration outside 'class/append to' declaration. Check indent");
       };

       //if parent instance of Grammar.AppendToDeclaration
       if (parent instanceof Grammar.AppendToDeclaration) {

            //#get varRefOwner from AppendToDeclaration
            //declare parent:Grammar.AppendToDeclaration
           this.varRefOwner = parent.varRef;
           optClass = parent.optClass;//#option: 'append to classs|object'

           ownerDecl = this.varRefOwner.tryGetReference();
           //if no ownerDecl
           if (!ownerDecl) {
             //if options.informError, me.sayErr "Append to: '#{me.varRefOwner}'. Reference is not fully declared"
             if (options.informError) {
                 this.sayErr("Append to: '" + (this.varRefOwner) + "'. Reference is not fully declared")};
             //return
             return;
           };

           //if optClass
           if (optClass) {
              //declare valid ownerDecl.members.prototype
              //ownerDecl = ownerDecl.members.prototype
             ownerDecl = ownerDecl.members.prototype;
             //if no ownerDecl
             if (!ownerDecl) {
               //if options.informError, me.sayErr "Append to class: '#{me.varRefOwner}' has no .prototype"
               if (options.informError) {
                   this.sayErr("Append to class: '" + (this.varRefOwner) + "' has no .prototype")};
               //return
               return;
             };
           };
       }
       else {

           //if no parent.nameDecl, me.sayErr "Unexpected. Class has no nameDecl"
           if (!parent.nameDecl) {
               this.sayErr("Unexpected. Class has no nameDecl")};
            //declare valid me.toNamespace
            //if me.toNamespace
           //if me.toNamespace
           if (this.toNamespace) {
               ownerDecl = parent.nameDecl;//#add to class as namespace
           }
           else {
                //#add to .prototype.
                //declare valid parent.nameDecl.members.prototype
                //ownerDecl = parent.nameDecl.members.prototype
               ownerDecl = parent.nameDecl.members.prototype;
               //if no ownerDecl, me.sayErr "Unexpected. Class has no prototype"
               if (!ownerDecl) {
                   this.sayErr("Unexpected. Class has no prototype")};
           
           };
       
       };

       //return ownerDecl
       return ownerDecl;
    };



//----
//## Methods added to specific Grammar Classes to handle scope, var & members declaration

   //append to Grammar.VariableDecl.prototype
   

//`VariableDecl: Identifier (':' dataType-IDENTIFIER) ('=' assignedValue-Expression)`

//variable name, optional type anotation and optionally assign a value

//VariableDecls are used in `var` statement, in function *parameter declaration* and in class *properties declaration*

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

       //return me.declareName(me.name,options)
       return this.declareName(this.name, options);
     };

     //helper method declareInScope()
     Grammar.VariableDecl.prototype.declareInScope = function(){
       this.nameDecl = this.addToScope(this.createNameDeclaration());
     };

     //helper method getTypeFromAssignedValue()
     Grammar.VariableDecl.prototype.getTypeFromAssignedValue = function(){
       //if me.nameDecl and me.assignedValue
       if (this.nameDecl && this.assignedValue) {
           var type = this.nameDecl.findOwnMember('**proto**');
           //if no type
           if (!type) {
               var result = this.assignedValue.getResultType();
               //if result, me.nameDecl.setMember('**proto**', result)
               if (result) {
                   this.nameDecl.setMember('**proto**', result)};
           };
       };
     };

   //append to VarStatement.prototype
   

    //     method declare()  # pass 1
    Grammar.VarStatement.prototype.declare = function(){//# pass 1
       //for each varDecl in me.list
       for ( var varDecl__inx=0; varDecl__inx<this.list.length; varDecl__inx++) {
           var varDecl=this.list[varDecl__inx];
           //varDecl.declareInScope
           varDecl.declareInScope();
           //if me.public, me.addToExport varDecl.nameDecl
           if (this.public) {
               this.addToExport(varDecl.nameDecl)};
       }; // end for each in this.list
    };

    //     method evaluateAssignments() # pass 4, determine type from assigned value
    Grammar.VarStatement.prototype.evaluateAssignments = function(){//# pass 4, determine type from assigned value
       //for each varDecl in me.list
       for ( var varDecl__inx=0; varDecl__inx<this.list.length; varDecl__inx++) {
           var varDecl=this.list[varDecl__inx];
           //varDecl.getTypeFromAssignedValue
           varDecl.getTypeFromAssignedValue();
       }; // end for each in this.list
    };


//----------------------------
   //append to ClassDeclaration.prototype
   
//Classes contain a code block with properties and methods definitions.

     //     properties
      //nameDecl, public

    //     method declare()
    Grammar.ClassDeclaration.prototype.declare = function(){

//if it is 'append to', nothing to declare, object must pre-exist

       //if me instanceof Grammar.AppendToDeclaration, return
       if (this instanceof Grammar.AppendToDeclaration) {
           return};

//Add class name, to parent scope. A class in js, is a function

       this.nameDecl = this.addToScope(this.name, {type: globalPrototype('Function')});
       //if me.public, me.addToExport me.nameDecl
       if (this.public) {
           this.addToExport(this.nameDecl)};

//We create 'Class.prototype' member
//Class's properties & methods will be added to 'prototype' as valid member members.
//'prototype' starts with 'constructor' which is a pointer to the class-funcion itself

       var prtypeNameDecl = this.nameDecl.findMember('prototype') || this.addMemberTo(this.nameDecl, 'prototype');
       //if me.varRefSuper, prtypeNameDecl.setMember('**proto**',me.varRefSuper)
       if (this.varRefSuper) {
           prtypeNameDecl.setMember('**proto**', this.varRefSuper)};
       //prtypeNameDecl.addMember('constructor',{pointsTo:me.nameDecl})
       prtypeNameDecl.addMember('constructor', {pointsTo: this.nameDecl});

//returnType of the class-function, is the prototype

       //me.nameDecl.setMember('**return type**',prtypeNameDecl)
       this.nameDecl.setMember('**return type**', prtypeNameDecl);

//add to nameAffinity

       //me.addMemberTo nameAffinity, me.name
       this.addMemberTo(nameAffinity, this.name);
    };

//------------

   //append to ObjectLiteral.prototype
   
     //properties nameDecl

    //     method declare
    Grammar.ObjectLiteral.prototype.declare = function(){
      //declare valid me.parent.nameDecl
      //me.nameDecl = me.parent.nameDecl or me.declareName(me.outCode.getUniqueVarName('*ObjectLiteral*'))
     this.nameDecl = this.parent.nameDecl || this.declareName(this.outCode.getUniqueVarName('*ObjectLiteral*'));
    };

    //     method getResultType
    Grammar.ObjectLiteral.prototype.getResultType = function(){
     //return me.nameDecl
     return this.nameDecl;
    };


   //append to NameValuePair.prototype
   
     //properties nameDecl
    //     method declare
    Grammar.NameValuePair.prototype.declare = function(){
      //declare valid me.parent.nameDecl
      //me.nameDecl = me.addMemberTo(me.parent.nameDecl, me.name)
     this.nameDecl = this.addMemberTo(this.parent.nameDecl, this.name);
    };


   //append to FunctionDeclaration.prototype
   
//`FunctionDeclaration: '[public][generator] (function|method|constructor) [name] '(' FunctionParameterDecl* ')' Block`

     //properties nameDecl, declared:boolean, scope:NameDeclaration

    //     method declare() ## function, methods and constructors
    Grammar.FunctionDeclaration.prototype.declare = function(){//## function, methods and constructors

     var owner = undefined;

//#####1st: Grammar.FunctionDeclaration
//if it is not anonymous, add function name to parent scope,
//if its 'public' add to exports

     //if me.constructor is Grammar.FunctionDeclaration
     if (this.constructor === Grammar.FunctionDeclaration) {

         //if me.name
         if (this.name) {
           var nameDecl = this.addToScope(this.name, {type: 'Function'});
           //if me.public, me.addToExport nameDecl
           if (this.public) {
               this.addToExport(nameDecl)};
         };

//determine 'owner' (where 'this' points to for this function)

         var nameValuePair = this.getParent(Grammar.NameValuePair);
         //if nameValuePair #NameValue pair where function is 'value'
         if (nameValuePair) {//#NameValue pair where function is 'value'
              //declare valid nameValuePair.parent.nameDecl
              //owner = nameValuePair.parent.nameDecl  #owner object nameDecl
             owner = nameValuePair.parent.nameDecl;//#owner object nameDecl
         }
         else {
           owner = globalScope;
         
         };
     }
     else {

         owner = this.tryGetOwnerDecl();

//if owner *can* be determined at his point, declare method as member, else
//will be added later. Note: Constructors have no "name". Constructors are the class itself.

         //if owner and me.name
         if (owner && this.name) {
             //me.addMethodToOwner owner
             this.addMethodToOwner(owner);
         };
     
     };

//Now create function's scope, using 'owner' as var this's **proto**

//Scope starts populated by 'this' and 'arguments.length'.

     //me.createFunctionScope(owner)
     this.createFunctionScope(owner);

//add parameters to function's scope

     //if me.paramsDeclarations
     if (this.paramsDeclarations) {
       //for each varDecl in me.paramsDeclarations
       for ( var varDecl__inx=0; varDecl__inx<this.paramsDeclarations.length; varDecl__inx++) {
         var varDecl=this.paramsDeclarations[varDecl__inx];
         //varDecl.declareInScope
         varDecl.declareInScope();
       }; // end for each in this.paramsDeclarations
     };
    };


    //     method processAppendTo() ## function, methods and constructors
    Grammar.FunctionDeclaration.prototype.processAppendTo = function(){//## function, methods and constructors

//For undeclared methods only

     //if me.constructor isnt Grammar.MethodDeclaration or me.declared, return
     if (this.constructor !== Grammar.MethodDeclaration || this.declared) {
         return};

//tryGetOwnerDecl will evaluate 'append to' varRef to get object where this method belongs

     var owner = this.tryGetOwnerDecl({informError: true});//# inform error if try-fails

//Now that we have 'owner' we can set **proto** for scope var 'this',
//so we can later validate `.x` in `this.x = 7`

     //if owner
     if (owner) {
         //me.addMethodToOwner owner
         this.addMethodToOwner(owner);
          //declare valid me.scope.members.this.setMember
          //me.scope.members.this.setMember '**proto**',owner
         //me.scope.members.this.setMember '**proto**',owner
         this.scope.members.this.setMember('**proto**', owner);
     };
    };


    //     helper method addMethodToOwner(owner:NameDeclaration)
    Grammar.FunctionDeclaration.prototype.addMethodToOwner = function(owner){

     var actual = owner.findOwnMember(this.name);
     //if actual and me.shim #shim for an exising method, do nothing
     if (actual && this.shim) {//#shim for an exising method, do nothing
       //do nothing
       null;
     }
     else {
       this.nameDecl = this.addMemberTo(owner, this.name, {type: 'Function'});
       //if me.returnType, me.nameDecl.setMember '**return type**', me.returnType
       if (this.returnType) {
           this.nameDecl.setMember('**return type**', this.returnType)};
       this.declared = true;
     
     };
    };



   //append to PropertiesDeclaration.prototype
   

     //properties nameDecl, declared:boolean, scope:NameDeclaration

    //     method declare(options)
    Grammar.PropertiesDeclaration.prototype.declare = function(options){
//Add all properties as members of its owner object (normally: class.prototype)

       var owner = this.tryGetOwnerDecl(options);
       //if owner
       if (owner) {
           //for each varDecl in me.list
           for ( var varDecl__inx=0; varDecl__inx<this.list.length; varDecl__inx++) {
               var varDecl=this.list[varDecl__inx];
               varDecl.nameDecl = varDecl.addMemberTo(owner, varDecl.name, {type: varDecl.type, itemType: varDecl.itemType});
           }; // end for each in this.list
           this.declared = true;
       };
    };

    //     method processAppendTo()
    Grammar.PropertiesDeclaration.prototype.processAppendTo = function(){
//Add all properties as members of its owner (append to).
//For undeclared properties only

       //if not me.declared, me.declare({informError:true})
       if (!(this.declared)) {
           this.declare({informError: true})};
    };

    //     method evaluateAssignments() # determine type from assigned value on properties declaration
    Grammar.PropertiesDeclaration.prototype.evaluateAssignments = function(){//# determine type from assigned value on properties declaration

       //for each varDecl in me.list
       for ( var varDecl__inx=0; varDecl__inx<this.list.length; varDecl__inx++) {
           var varDecl=this.list[varDecl__inx];
           //varDecl.getTypeFromAssignedValue
           varDecl.getTypeFromAssignedValue();
       }; // end for each in this.list
    };



   //append to ForStatement.prototype
   

     //     properties indexNameDecl, mainNameDecl

    //     method declare()
    Grammar.ForStatement.prototype.declare = function(){

//a ForStatement has a 'Scope'. Add, if they exists, indexVar & mainVar

        //declare valid me.variant.indexVar
        //declare valid me.variant.mainVar
        //declare valid me.variant.mainVar

        //me.createScope
       //me.createScope
       this.createScope();
       this.indexNameDecl = this.addToScope(this.variant.indexVar);
       this.mainNameDecl = this.addToScope(this.variant.mainVar);
    };

        //debug:
        //me.sayErr "ForStatement - pass declare"
        //console.log "index",me.variant.indexVar, me.indexNameDecl? me.indexNameDecl.toString():undefined
        //console.log "main",me.variant.mainVar, me.mainNameDecl? me.mainNameDecl.toString(): undefined


    //     method evaluateAssignments()
    Grammar.ForStatement.prototype.evaluateAssignments = function(){

        //declare valid me.variant.iterable.getResultType

//ForEachInArray:
//If no mainVar.type, guess type from iterable's itemType

        //if me.variant instanceof Grammar.ForEachInArray
       //if me.variant instanceof Grammar.ForEachInArray
       if (this.variant instanceof Grammar.ForEachInArray) {
           //if no me.mainNameDecl.findOwnMember('**proto**')
           if (!this.mainNameDecl.findOwnMember('**proto**')) {
               var iterableType = this.variant.iterable.getResultType();
               //if iterableType
               if (iterableType) {
                 var itemType = iterableType.findOwnMember('**item type**');
                 //if itemType
                 if (itemType) {
                   //me.mainNameDecl.setMember('**proto**',itemType)
                   this.mainNameDecl.setMember('**proto**', itemType);
                 };
               };
           };
       }
       else if (this.variant instanceof Grammar.ForEachProperty) {
           //me.indexNameDecl.setMember('**proto**',globalPrototype('String'))
           this.indexNameDecl.setMember('**proto**', globalPrototype('String'));
       };
    };


    //     method validatePropertyAccess()
    Grammar.ForStatement.prototype.validatePropertyAccess = function(){
//ForEachInArray: check if the iterable has a .length property.

       //if me.variant instanceof Grammar.ForEachInArray
       if (this.variant instanceof Grammar.ForEachInArray) {

            //declare valid me.variant.iterable.getResultType

            //var iterableType:NameDeclaration = me.variant.iterable.getResultType()
           var iterableType = this.variant.iterable.getResultType();

           //if no iterableType
           if (!iterableType) {
              //#me.sayErr "ForEachInArray: no type declared for: '#{me.variant.iterable}'"
             //do nothing
             null;
           }
           else if (!iterableType.findMember('length')) {
             //me.sayErr "ForEachInArray: no .length property declared in '#{me.variant.iterable}' type:'#{iterableType.toString()}'"
             this.sayErr("ForEachInArray: no .length property declared in '" + (this.variant.iterable) + "' type:'" + (iterableType.toString()) + "'");
             //log.error iterableType.originalDeclarationPosition()
             log.error(iterableType.originalDeclarationPosition());
           };
       };
    };


   //append to ExceptionBlock.prototype
   
//`ExceptionBlock: (exception|catch) catchVar-IDENTIFIER Body [finally Body]`

     //method declare()
     Grammar.ExceptionBlock.prototype.declare = function(){

//Exception blocks have a scope

       //me.createScope
       this.createScope();
       //me.addToScope me.catchVar,{type:globalPrototype('Error')}
       this.addToScope(this.catchVar, {type: globalPrototype('Error')});
     };


   //append to VariableRef.prototype
   

//`VariableRef: ['--'|'++']Identifier[Accessors]['--'|'++']`

//`VariableRef` is a Variable Reference.

 //a VariableRef can include chained 'Accessors', which can:
 //*access a property of the object : `.`-> PropertyAccess `[`->IndexAccess
 //*assume the variable is a function and perform a function call :  `(`-> FunctionAccess

    //     helper method tryGetReference(options) returns NameDeclaration
    Grammar.VariableRef.prototype.tryGetReference = function(options){

//evaluate this VariableRef.
//Try to determine referenced NameDecl.
//if we can reach to a reference, return reference

       //default options=
       if(!options) options={};
       if(options.informError===undefined) options.informError=undefined;

//Start with main variable name

       var actualVar = this.tryGetFromScope(this.name, options);
       //if no actualVar, return
       if (!actualVar) {
           return};

//now check each accessor

       //if no me.accessors, return actualVar
       if (!this.accessors) {
           return actualVar};

       var partial = this.name;

       //for each ac in me.accessors
       for ( var ac__inx=0; ac__inx<this.accessors.length; ac__inx++) {
           var ac=this.accessors[ac__inx];
            //declare valid ac.name

//for PropertyAccess

            //if ac instanceof Grammar.PropertyAccess
           //if ac instanceof Grammar.PropertyAccess
           if (ac instanceof Grammar.PropertyAccess) {
               actualVar = this.tryGetMember(actualVar, ac.name, options);
           }
           else if (ac instanceof Grammar.IndexAccess) {
               actualVar = this.tryGetMember(actualVar, '**item type**');
           }
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
           //me.sayErr "'#{me}'. Reference can not be analyzed further than '#{partial}'"
           this.sayErr("'" + (this) + "'. Reference can not be analyzed further than '" + (partial) + "'");
       };

       //return actualVar
       return actualVar;
    };


    //     method validatePropertyAccess() # last pass
    Grammar.VariableRef.prototype.validatePropertyAccess = function(){//# last pass

       //if me.parent is instance of Grammar.DeclareStatement, return
       if (this.parent instanceof Grammar.DeclareStatement) {
           return};

//Start with main variable name, to check property names

       var actualVar = this.tryGetFromScope(this.name, {informError: true, isForward: true, isDummy: true});

//now follow each accessor

       //if no me.accessors, return
       if (!this.accessors) {
           return};

       //for each ac in me.accessors
       for ( var ac__inx=0; ac__inx<this.accessors.length; ac__inx++) {
           var ac=this.accessors[ac__inx];
            //declare valid ac.name

//for PropertyAccess, check if the property name is valid

            //if ac instanceof Grammar.PropertyAccess
           //if ac instanceof Grammar.PropertyAccess
           if (ac instanceof Grammar.PropertyAccess) {
             actualVar = this.tryGetMember(actualVar, ac.name, {informError: true, isForward: true, isDummy: true});
           }
           else if (ac instanceof Grammar.IndexAccess) {
               actualVar = actualVar.findMember('**item type**');
           }
           else if (ac instanceof Grammar.FunctionAccess) {
               actualVar = actualVar.findMember('**return type**');
           };

           //if actualVar isnt instanceof NameDeclaration, break
           if (!(actualVar instanceof NameDeclaration)) {
               break};
       }; // end for each in this.accessors

       //end for #each accessor
       };


   //append to AssignmentStatement.prototype
   

    //     method declareByAssignment()
    Grammar.AssignmentStatement.prototype.declareByAssignment = function(){

//Here we check for lvalue VariableRef in the form:

//`exports.x = xx`, `module.exports.x = xx` and `xx.prototype.yy =`

//We consider this assignments as 'declarations' of members rather than variable references to check.

//Start with main variable name

       var varRef = this.lvalue;

       var keywordFound = undefined;

       //if varRef.name is 'exports' #start with 'exports'
       if (varRef.name === 'exports') {//#start with 'exports'
           keywordFound = varRef.name;
       };

       //if no varRef.accessors
       if (!varRef.accessors) {

         //if keywordFound # is: `exports = x`, it does not work in node-js
         if (keywordFound) {//# is: `exports = x`, it does not work in node-js
             //me.sayErr "'exports = x', does not work. You need to do: 'module.exports = x'"
             this.sayErr("'exports = x', does not work. You need to do: 'module.exports = x'");
         };

         //return # no accessors to check
         return;//# no accessors to check
       };

       var actualVar = this.findInScope(varRef.name);
       //if no actualVar, return
       if (!actualVar) {
           return};

//now check each accessor

       var createName = undefined;

       //for each index,ac in varRef.accessors
       for ( var index=0; index<varRef.accessors.length; index++) {
           var ac=varRef.accessors[index];
            //declare valid ac.name

//for PropertyAccess

            //if ac instanceof Grammar.PropertyAccess
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
           else {
             //return #exit
             return;//#exit
           
           };
       }; // end for each in varRef.accessors

       //end for #each accessor in lvalue, look for module.exports=...

//if we found 'exports' or 'prototype', and we reach a valid reference

       //if keywordFound and actualVar
       if (keywordFound && actualVar) {

           //if createName # module.exports.x =... create a member
           if (createName) {//# module.exports.x =... create a member
             actualVar = this.addMemberTo(actualVar, createName);//# create x on module.exports
           };

            //#try to execute assignment, so exported var points to content
           var content = this.rvalue.getResultType({informError: true});
           //if content instanceof NameDeclaration
           if (content instanceof NameDeclaration) {
               //actualVar.makePointTo content
               actualVar.makePointTo(content);
           }
           else {
               //debugger
               debugger;
           
           };
       };
    };


    //     method evaluateAssignments() ## Grammar.AssignmentStatement
    Grammar.AssignmentStatement.prototype.evaluateAssignments = function(){//## Grammar.AssignmentStatement

//check if we've got a a clear reference.

     var reference = this.lvalue.tryGetReference();
     //if reference isnt instanceof NameDeclaration, return
     if (!(reference instanceof NameDeclaration)) {
         return};
     //if reference.findOwnMember('**proto**'), return #has a type already
     if (reference.findOwnMember('**proto**')) {
         return};

//check if we've got a clear rvalue.
//if we do, make lvalue point to rvalue

     var rvalueType = this.rvalue.getResultType();
     //if rvalueType instance of NameDeclaration
     if (rvalueType instanceof NameDeclaration) {
         //reference.setMember('**proto**',rvalueType)
         reference.setMember('**proto**', rvalueType);
     };
    };

   //append to DefaultAssignment.prototype
   

    //     method evaluateAssignments() # determine type from assigned value
    Grammar.DefaultAssignment.prototype.evaluateAssignments = function(){//# determine type from assigned value

     //me.assignment.evaluateAssignments()
     this.assignment.evaluateAssignments();
    };


   //append to Expression.prototype
   

    //     method getResultType() returns NameDeclaration
    Grammar.Expression.prototype.getResultType = function(){
//Try to get return type from a simple Expression

        //declare valid me.root.name.type
        //declare valid me.root.name.getResultType
        //declare valid me.root.name.getResultType
        //declare valid me.root.name.tryGetReference
        //declare valid me.root.name.tryGetReference
        //declare valid me.root.right.name.tryGetReference
        //declare valid me.root.right.name.tryGetReference

        //if me.root.name instance of Grammar.ObjectLiteral
       //if me.root.name instance of Grammar.ObjectLiteral
       if (this.root.name instanceof Grammar.ObjectLiteral) {
           //return me.root.name.getResultType()
           return this.root.name.getResultType();
       }
       else if (this.root.name instanceof Grammar.Literal) {
           //return globalPrototype(me.root.name.type)
           return globalPrototype(this.root.name.type);
       }
       else if (this.root.name instanceof Grammar.VariableRef) {
           //return me.root.name.tryGetReference()
           return this.root.name.tryGetReference();
       }
       else if (this.root.name === 'new') {
           //if me.root.right.name instanceof Grammar.VariableRef
           if (this.root.right.name instanceof Grammar.VariableRef) {
             //return me.root.right.name.tryGetReference()
             return this.root.right.name.tryGetReference();
           };
       };
    };

   //append to DeclareStatement.prototype
   
    //     method declare() # pass 1, declare as props
    Grammar.DeclareStatement.prototype.declare = function(){//# pass 1, declare as props

//declare valid x.y.z

//declare on x

     //if me.specifier is 'on'
     if (this.specifier === 'on') {

         var reference = this.tryGetFromScope(this.name, {isForward: true});

         var isCapitalized = String.isCapitalized(reference.name);
         //if isCapitalized
         if (isCapitalized) {
              //declare valid reference.members.prototype
              //if no reference.members.prototype
             //if no reference.members.prototype
             if (!reference.members.prototype) {
               //reference.addMember('prototype')
               reference.addMember('prototype');
             };
             reference = reference.members.prototype;
         };

         //for each varDecl in me.names
         for ( var varDecl__inx=0; varDecl__inx<this.names.length; varDecl__inx++) {
             var varDecl=this.names[varDecl__inx];
             //me.addMemberTo reference, varDecl.createNameDeclaration()
             this.addMemberTo(reference, varDecl.createNameDeclaration());
         }; // end for each in this.names
     }
     else {

         //for varDecl in me.names
         for ( var varDecl__inx=0; varDecl__inx<this.names.length; varDecl__inx++) {
           var varDecl=this.names[varDecl__inx];

           varDecl.nameDecl = varDecl.createNameDeclaration();

           //if me.specifier is 'global'
           if (this.specifier === 'global') {
              //declare valid project.root.addToScope
              //project.root.addToScope varDecl.nameDecl
             //project.root.addToScope varDecl.nameDecl
             project.root.addToScope(varDecl.nameDecl);
           };

           //if me.specifier is 'affinity'
           if (this.specifier === 'affinity') {
             var classDecl = this.getParent(Grammar.ClassDeclaration);
             //if no classDecl
             if (!classDecl) {
                 //me.sayErr "declare affinity must be included in a class declaration"
                 this.sayErr("declare affinity must be included in a class declaration");
                 //return
                 return;
             };
              //#add as member to nameAffinity, referencing class decl (.nodeDeclared)
             varDecl.nameDecl.nodeDeclared = classDecl;
             //nameAffinity.addMember varDecl.nameDecl
             nameAffinity.addMember(varDecl.nameDecl);
           }
           else if (this.specifier === 'forward') {
             //do nothing
             null;
           };
         }; // end for each in this.names
     
     };
    };

//if me.specifier is 'types', the type will be converted on next passes over the created NameDeclaration.
//On the method validatePropertyAccess(), types will be switched "on the fly" while checking property access.


   //append to DeclareStatement.prototype
   
    //     method validatePropertyAccess() # last pass
    Grammar.DeclareStatement.prototype.validatePropertyAccess = function(){//# last pass

//alter on the fly scope var "types"

     //if me.specifier is 'types'
     if (this.specifier === 'types') {

         //for each varDecl in me.names
         for ( var varDecl__inx=0; varDecl__inx<this.names.length; varDecl__inx++) {
             var varDecl=this.names[varDecl__inx];
             var mainVar = this.tryGetFromScope(varDecl.name, {informError: true});
             //if mainVar, mainVar.setMember '**proto**', varDecl.nameDecl.ownMember('**proto**')
             if (mainVar) {
                 mainVar.setMember('**proto**', varDecl.nameDecl.ownMember('**proto**'))};
         }; // end for each in this.names
     }
     else if (this.specifier === 'valid') {
         var actualVar = this.tryGetFromScope(this.varRef.name, {informError: true});
         //for each ac in me.varRef.accessors
         for ( var ac__inx=0; ac__inx<this.varRef.accessors.length; ac__inx++) {
           var ac=this.varRef.accessors[ac__inx];
            //declare valid ac.name
            //if ac isnt instance of Grammar.PropertyAccess, break
           //if ac isnt instance of Grammar.PropertyAccess, break
           if (!(ac instanceof Grammar.PropertyAccess)) {
               break};
           actualVar = actualVar.findOwnMember(ac.name) || this.addMemberTo(actualVar, ac.name);
         }; // end for each in this.varRef.accessors
     };
    };