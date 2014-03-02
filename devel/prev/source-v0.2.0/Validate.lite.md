Name Validation 
===============

This module contains helper functions to manage variable, 
function and object property name declaration.

This module purpose is to make the compiler catch 
mistyped variable and property names at compile time
(instead of YOU spending hours to debug a subtle bug at run time)

In order to do name validation we need to construct the scope tree, 
and also register all valid members of all "types" (objects).


    declare forward 
      globalPrototype 
    
----------
##Dependencies:

This module extends Grammar classes, adding 'declare', 'evaluateAssignments', etc.
methods to validate var & property names.

We extend the Grammar classes, so this module require the `Grammar` module.

    var ASTBase = require('./ASTBase')
    var Grammar = require('./Grammar')
    var NameDeclaration = require('./NameDeclaration')

    var Environment = require('./Environment')


---------
Module vars:

    var project

    var globalScope: NameDeclaration

    var nameAffinity: NameDeclaration


##Members & Scope

A NameDeclaration have a `.members={}` property
`.members={}` is a map to other `NameDeclaration`s which are valid members of this name.

A 'scope' is a NameDeclaration whose members are the declared vars in the scope.

For Example: 'console' is stored at 'Global Scope' and has '.log' and '.error' as members

Project
|_ 
   scope = {
     name: 'global scope'
     members: {
        console: { 
          name:'console'
          type: Object
          members: 
              log: 
                name:'log'
                type: Function
              error:
                name: 'error'
                type: Function
          }
     }


'Scopes' are created only for certain AST nodes, such as:
Module, FunctionDeclaration, ForStatement, Catch/Exception, etc.

Variables in the scope
----------------------
Referenced vars must be in the scope . You are required to explicitly declare your variables
so you're **unable** to create a global variable by mistipying a name in an assignment. 
The compiler will catch that as "undeclared variable". 

Object properties access
------------------------
Object properties access are another source of subtle bugs in any medium to large javascript project.
The problem is a mistyped property name results in the property not being found 
in the object nor the prototype chain, and javascript in this case just returns "undefined" 
and goes on. This causes hard to find subtle bugs.

Example: The following javascript code, **will probably need debugging.**

  options = options || {};
  if (options.importantCodeDefaultTrue===undefined) options.importantCodeDefaultTrue=true;
  if (options.anotherOptionDefaultZero===undefined) options.anotherOptionDefaultZero=0;

  initFunction(options);
  prepareDom(options);
  if (options.importantCodesDefaultTrue) { moreInit(); subtleDomChanges(); }
  
The same LiteScript code, but the mistake **will be caught by the compiler**
The compiler will emit an error during compilation, -no debugging required-.

  options = options or {}
  if options.importantCodeDefaultTrue is undefined, options.importantCodeDefaultTrue=true
  if options.anotherOptionDefaultZero is undefined, options.anotherOptionDefaultZero=0;

  initFunction options
  prepareDom options
  if options.importantCodesDefaultTrue then moreInit(); subtleDomChanges()

In order to completely check property names, a full type system is neeeded.
LiteScript, based in js, *is not typed*, but you can add "type annotations"
to your variable declaration, in order to declare the list of valid members 
to check at compile time.

If you don't want to include var types, You can also explicitily use a 
`declare on myObj prop1,prop2` statement to dismiss the 'prop1 IS NOT A PROPERTY OF myObj' 
compiler errors

Example:
/*

  class ClassA

    properties 
      classAProp1, classAProp2
    
    method methodA
      this.classAProp1 = 11
      this.classAProp2 = 12

  class ClassB
    
    properties 
      classBProp1, classBProp2

    method methodB
      this.classBProp1 = 21

  var instanceB = new ClassB // implicit type

  instanceB.classBprop1 = 5 // <-- this **will be caught** as "case mismatch" since classBprop1 is defined as classBProp1

  var bObj = instanceB // simple assignment, implicit type

  bObj.classAProp1 = 5 // <-- this **will be caught**

  var xObj = callToFn() // unknown type
  
  xObj.classBProp1 = 5 // <-- this trigger a "classBProp1 IS NOT A DECLARED PROPERTY OF xObj"

  declare on xObj  // <-- this fixes it
    classBProp1

  xObj.classBProp1 = 5 // <-- this is OK now

  var xObj:ClassB = callToFn() // type annotation, this also fixes it
  
  bObj.classBProp1 = 5 // <-- this is ok

*/

forward

    declare forward walkAllNodesCalling,forEachASTNode


### helper function normalizeVarName(text:string) returns String

      #for vars, we allow "token" and "Token" to be in the same scope
      return NameDeclaration.fixSpecialNames(text.slice(0,1)+text.slice(1).toLowerCase())


##Additions to NameDeclaration. Helpers to do name validation

### Append to class NameDeclaration

#### Helper method findMember(name) returns NameDeclaration
this method looks for a name in NameDeclaration members,
it also follows the **proto** chain (same mechanism as js __proto__ chain)

        var actual = me
        var count=0

        do while actual instance of NameDeclaration 

            var result = actual.findOwnMember(name)
            if result, return result

We use a member named '**proto**' on NameDeclarations, mapping run-time proto chain.
We follow the chain to validate property names.

            var nextInChain = actual.findOwnMember('**proto**')

As last option in the chain, we always use 'Object.prototype'

            if no nextInChain and actual isnt globalPrototype('Object')
              nextInChain = globalPrototype('Object')

            actual = nextInChain

            if count++ > 50 #assume circular
                me.warn "circular type reference"
                return
        
        loop


#### Helper method processConvertTypes() 
convert possible types stored in NameDeclaration, 
from string to NameDeclarations in the scope
returns '**proto**' converted type

        me.convertType '**return type**'  #a Function can have **return type**
        me.convertType '**item type**'  #an Array can have **item type** e.g.: 'var list: string array'

if no type defined, try by name affinity,e.g., for var 'token', if a Class named 'Token' is
in scope, var 'token' is assumed type 'Token', return true if type was assigned

        var converted
        if not me.findOwnMember('**proto**')
          converted = me.assignTypebyNameAffinity()

else, try to convert type from string or VariableRef, to a found NameDeclaration in Scope
return true if a conversion was made

        else
          converted = me.convertType('**proto**') #other objects

        if converted, me.converted = true

        return converted


#### Helper method convertType(internalName) 
convert type from string to NameDeclarations in the scope.
returns 'true' if converted, 'false' if it has to be tried later

        var type = me.findOwnMember(internalName)
        if no type, return  #nothing to process

        if type instance of NameDeclaration
            #already converted
            return 

        # if the type is a varRef, must reference a class
        if type instanceof Grammar.VariableRef
            declare valid type.tryGetReference
            var classFN = type.tryGetReference()
            declare valid classFN.members.prototype
            if classFN 
              if no classFN.members.prototype
                me.sayErr "TYPE: '#{Grammar.VariableRef}' has no prototype"
                return 
              type = classFN.members.prototype

        else if typeof type is 'string'

            if no me.nodeDeclared
              type = globalPrototype(type)
            else
              type = me.nodeDeclared.findInScope(type)
              declare valid type.members.prototype
              type = type.members.prototype or type

        else
          declare valid type.constructor.name
          me.sayErr "INTERNAL ERROR: UNRECG. TYPE on #internalName: '#{type}' [#{type.constructor.name}] typeof is '#{typeof type}'"
          return

        #store converted
        if type, me.setMember(internalName,type)

        return type


#### helper method assignTypebyNameAffinity() 
Auto-assign type by name affinity. 
If no type specified, check project.nameAffinity
        
        if me.nodeDeclared and not String.isCapitalized(me.name)

            if not me.findOwnMember('**proto**')

                var normalized:string = NameDeclaration.normalizePropName(me.name)
                var possibleClassRef = nameAffinity.members[normalized]

                # possibleClassRef is a NameDeclaration whose .nodeDeclared is a ClassDeclaration

                # check 'ends with' if name is at least 6 chars in length
                if not possibleClassRef and normalized.length>=6
                    for each own property affinityName in nameAffinity.members
                        if normalized.endsWith(affinityName)
                            possibleClassRef = nameAffinity.members[affinityName]
                            break

                declare valid possibleClassRef.nodeDeclared.nameDecl.members.prototype
                if possibleClassRef and possibleClassRef.nodeDeclared.nameDecl.members.prototype
                    me.setMember('**proto**', possibleClassRef.nodeDeclared.nameDecl.members.prototype)
                    return true


### Helper function globalPrototype(name) 
gets a var from global scope

      if name instanceof NameDeclaration, return name #already converted type

      var normalized = normalizeVarName(name)      

      var nameDecl:NameDeclaration = globalScope.members[normalized]
      if no nameDecl
        fail with "no '#{name}' in global scope"

      declare valid nameDecl.members.prototype

      if no nameDecl.members.prototype
        fail with "global scope '#{name}' has no .members.prototype"

      return nameDecl.members.prototype


### helper function addBuiltInObject(name,node) 
Add a built-in class to global scope, return class prototype

      var nameDecl = new NameDeclaration( name,{isBuiltIn:true},node )

      var normalized = normalizeVarName(name)      
      globalScope.members[normalized] = nameDecl

      nameDecl.getMembersFromObjProperties Environment.getGlobalObject(name)

      declare valid nameDecl.members.prototype

      if nameDecl.members.prototype
        nameDecl.setMember '**return type**', nameDecl.members.prototype
        return nameDecl.members.prototype

      return nameDecl

---------------------------------------
----------------------------------------
----------------------------------------

### Public function validate(aProject)

We start this module once the entire multi-node AST tree has been parsed.
### Steps:

#### Initialize Global Scope

Initialize module vars

        project = aProject

        nameAffinity= new NameDeclaration('Name Affinity') # project-wide name affinity for classes

The "scope" of rootNode is the global scope. 
Initialize the global scope

        declare valid project.root.createScope
        declare valid project.globalScope

        globalScope = project.root.createScope()
        project.globalScope = globalScope

Populate the global scope

        var objProto = addBuiltInObject('Object')
        declare valid objProto.members.constructor.addMember
        objProto.members.constructor.addMember('name')

        addBuiltInObject('String')
        addBuiltInObject('Function')
        addBuiltInObject('Boolean')
        addBuiltInObject('Array')
        addBuiltInObject('Number')
        addBuiltInObject('RegExp')
        addBuiltInObject('JSON')
        addBuiltInObject('Error')
        addBuiltInObject('Math')

        globalScope.addMember new NameDeclaration('true',{value:true})
        globalScope.addMember new NameDeclaration('false',{value:false})
        globalScope.addMember new NameDeclaration('on',{value:true})
        globalScope.addMember new NameDeclaration('off',{value:false})
        globalScope.addMember new NameDeclaration('undefined',{value:undefined})
        globalScope.addMember new NameDeclaration('null',{value:null})

        globalScope.addMember new NameDeclaration('require')
        globalScope.addMember new NameDeclaration('debugger')

        globalScope.addMember(new NameDeclaration('global',{type:globalScope})) 

Now, run passes on each project module.

#### Pass 1.0 Declarations 
Walk the tree, and call function 'declare' on every node having it. 
'declare' will create scopes, and vars in the scope. 
May inform 'DUPLICATES' and 'CASE MISMATCH' errors.

        log.message "Pass 1.0 Declarations"
        walkAllNodesCalling 'declare'

#### Pass 1.1 Declare By Assignment
Walk the tree, and check assignments looking for: 'module.exports.x=x' and 'x.prototype.y = '.
Treat them as declarations.

        log.message "Pass 1.1 Declare By Assignment"
        walkAllNodesCalling 'declareByAssignment'


#### Pass 1.2 connectImportRequire
check `x=require('y')` calls. 
Make var x point to required module 'y' exports 

        declare valid project.moduleCache

        log.message "Pass 1.2 Connect Import Require"
        for each own property fname in project.moduleCache
          var moduleNode:Grammar.Module = project.moduleCache[fname]

          for each node in moduleNode.requireCallNodes

            if node.importedModule

              var parent: ASTBase
              var reference: NameDeclaration

              declare valid parent.lvalue.tryGetReference
              declare valid parent.nameDecl

get immediate parent of the "require" call

              parent = node.parent
              if parent instance of Grammar.Operand 
                 parent = node.parent.parent.parent # varRef->operand->Expression->Expression's Parent

get referece where "require" result is being assigned to (AssignmentStatement or VariableDecl)

              if parent instance of Grammar.AssignmentStatement 
                reference = parent.lvalue.tryGetReference({informError:true}) 
              
              else if parent instance of Grammar.VariableDecl
                reference = parent.nameDecl

make reference point to importedModule.exports

              if reference
                reference.makePointTo node.importedModule.exports


#### Pass 1.3 Process "Append To" Declarations
Since 'append to [class|object] x.y.z' statement can add to any object, we delay 
"Append To" declaration to this point, where 'x.y.z' can be analyzed and a reference obtained.
Walk the tree, and check "Append To" Methods & Properties Declarations

        log.message "Pass 1.3 Process Append-To"
        walkAllNodesCalling 'processAppendTo'


#### Pass 3. Convert Type 
for each NameDeclaration try to find the declared 'type' (string) in the scope. 
Repeat until no conversions can be made.

        log.message "Pass 3.0 Convert Type"

        var totalConverted = 0
        while totalConverted < NameDeclaration.allOfThem.length

          var converted = 0
          
          for each nameDecl in NameDeclaration.allOfThem
            if no nameDecl.converted
              if nameDecl.processConvertTypes(), converted++
          end for 

          if no converted, break #exit if no more conversions possible
          totalConverted += converted
          debug "converted:#converted, totalConverted:#totalConverted"
        #loop

Inform unconverted types as errors

        if totalConverted < NameDeclaration.allOfThem.length

          for each nameDecl in NameDeclaration.allOfThem

            var type = nameDecl.findOwnMember('**proto**')
            if type and type isnt instanceof NameDeclaration
                nameDecl.sayErr "undeclard type: '#{type.toString()}'"
                if type instanceof Grammar.ASTBase
                  log.error type.positionText(),"for reference, type declaration"
            
#### Pass 4.0 Evaluate Assignments
Walk the scope tree, and for each assignment, 
IF L-value has no type, try to guess from R-value's result type

        log.message "Pass 4.0 Evaluate Assignments"
        walkAllNodesCalling 'evaluateAssignments'

#### Pass 5.0 -Final- Validate Property Access
Once we have all vars declared and typed, walk the scope tree, 
and for each VariableRef validate property access.
May inform 'UNDECLARED PROPERTY'.

        log.message "Pass 5.0 Validate Property Access"
        walkAllNodesCalling 'validatePropertyAccess'

Inform forward declarations not fullfilled, as errors

        for each nameDecl in NameDeclaration.allOfThem

            if nameDecl.isForward and not nameDecl.isDummy
                nameDecl.warn "forward declared, but never found"
                var container = nameDecl.nodeDeclared.getParent(Grammar.ClassDeclaration)
                if container
                  declare container:Grammar.ClassDeclaration
                  declare valid container.varRef.toString
                  if container.varRef, log.warning "#{container.positionText()} more info: '#nameDecl.name' of '#{container.varRef.toString()}'"

    end function validate


### public function walkAllNodesCalling(methodName)

For each node, if the specific statement has methodName, call it

        forEachASTNode project.moduleCache, function(node)
            if node has property methodName
                node[methodName]()


### helper function forEachASTNode(obj,callback) # recursive

if obj is instance of ASTBase, callback

      if obj is instance of ASTBase, callback(obj)

recurse on ASTBase properties and also Arrays (exclude 'parent' and 'importedModule')

      for each own property name in obj
          if name isnt 'parent' and name isnt 'importedModule'
            if obj[name] instance of ASTBase or obj[name] instance of Array
              forEachASTNode obj[name],callback #recurse


----------
----------
----------
----------
----------
----------
Utility 
-------

    var util = require('./util')


--------------------------------
## Helper methods added to AST Tree

### Append to class ASTBase

#### helper method declareName(name, options) 
declareName creates a new NameDeclaration, referecing source (AST node)

        return new NameDeclaration(name, options, me)

#### method addMemberTo(nameDecl, memberName, options) 
a Helper method ASTBase.*addMemberTo*
Adds a member to a NameDecl, referencing this node as nodeDeclared
        
        return nameDecl.addMember(memberName, options, me)

#### Helper method tryGetMember(nameDecl,name:string,options)
this method looks for a specific member, optionally declare as forward
or inform error. We need this AST node, to correctly report error.
        
        default options = 
          informError: undefined
          isForward: undefined
  
        var found = nameDecl.findMember(name)
        
        if found and name.slice(0,2) isnt '**'
          found.caseMismatch name,me
        
        else #not found
          if options.informError, log.warning "#{me.positionText()}. No member named '#{name}' on #{nameDecl.info()}"
          if options.isForward, found = me.addMemberTo(nameDecl,name,options)

        return found


#### helper method getRootNode()

**getRootNode** method moves up in the AST up to the node holding the global scope ("root").
"root" node has parent = Project 

        var node = me
        while node.parent instanceof ASTBase
            node = node.parent # move up
        return node


#### helper method getScopeNode() 

**getScopeNode** method return the parent 'scoped' node in the hierarchy.
It looks up until found a node with .scope
        
Start at this node

        var node = me
        declare valid node.scope

        while node

          if node.scope
            return node # found a node with scope

          node = node.parent # move up

        #loop

        return null


#### method findInScope(name) returns NameDeclaration
this method looks for the original place 
where a name was defined (function,method,var) 
Returns the Identifier node from the original scope
It's used to validate variable references to be previously declared names

        var normalized

/*
First we handle multi-item names, as: String.prototype.split

        if name.indexOf('.')>=0
          var parts = name.split('.')
          var mainVar = me.findInScope(parts[0])
          if no mainVar
            return null
          var n=1
          while n<parts.length
            normalized = normalize(parts[n])
            if mainVar.members.hasOwnProperty(normalized)
              mainVar = mainVar.members[normalized]
            else
              return null
          #loop
          return mainVar
        #end if
*/

        normalized = normalizeVarName(name)

Start at this node

        var node = me
        declare valid node.scope.members

Look for the declaration in this scope

        while node
          if node.scope
            if node.scope.members.hasOwnProperty(normalized)
              return node.scope.members[normalized]

move up in scopes

          node = node.parent

        #loop


#### method tryGetFromScope(name, options) returns NameDeclaration
a Helper method: *ASTBase.tryGetFromScope(name)*, this method looks for the original declaration
in the scope. if the declaration is not found, an error is emmited and a -pseudo- var is created 
in the scope in order to continue compilation

Check if the name is declared. Retrieve the original declaration

if it's already a NameDeclaration, no need to search

        if name instanceof NameDeclaration, return name  

        default options=
          isForward: undefined
          informError: undefined

Search the scope

        var found = me.findInScope(name)
        if found

Declaration found, we check the upper/lower case to be consistent
If the found item has a different case than the name we're looking for, emit error 

            if found.caseMismatch(name, me)
              return found
            #end if

if declaration not found, check if it's a built-in value like 'true'

        else if name in ['true','false','undefined','null','NaN','Infinity']
            found = me.getRootNode().addToScope(name)

else, check if it's a built-in "object", so we declare it in the global scope

        else if Environment.isBuiltInObject(name)

            found = addBuiltInObject(name,me)

if it is not found,check options: a) inform error. b) declare foward.

        else
            if options.informError
                me.sayErr "UNDECLARED NAME: '#{name}'"

            if options.isForward
                found = me.addToScope(name,options)  
                if options.isDummy and String.isCapitalized(name) #let's assume is a class
                    me.addMemberTo(found,'prototype',options)

        #end if - check declared variables 

        return found



#### method addToScope(item, options) returns NameDeclaration 
a Helper method ASTBase.*addToScope*
Search for parent Scope, adds passed name to scope.members[]
Reports duplicated.
return: NameDeclaration

        if no item, return # do nothing on undefined params

        var scope:NameDeclaration = me.getScopeNode().scope

        if no options
          options={}

First search it to report duplicates, if found in the scope.
If the found item has a different case than the name we're adding, emit error & return

        declare valid item.name
        var name = type of item is 'string'? item : item.name

        debug "addToScope: '#{name}' to '#{scope.name}'" #[#{me.constructor.name}] name:

        var found = me.findInScope(name)
        if found 

            if found.caseMismatch(name, me)
              #case mismatch informed
              do nothing

            else if found.isForward
              found.isForward = false
              found.nodeDeclared = me
              if item instanceof NameDeclaration
                found.replaceForward item

            else 
              me.sayErr "DUPLICATED name in scope: '#{name}'"
              log.error found.originalDeclarationPosition() #add extra information line

            return found

        #end if

else, not found, add it to the scope

        var nameDecl
        if item instanceof NameDeclaration
          nameDecl = item
        else
          nameDecl = me.declareName(name,options)

        var normalized = normalizeVarName(name)
        scope.members[normalized] = nameDecl

        return nameDecl


#### helper method addToExport(nameDecl)
Add to parentModule.exports, but *preserve parent*
      
      var parentModule:Grammar.Module = me.getParent(Grammar.Module)
      var saveParent = nameDecl.parent
      parentModule.exports.addMember(nameDecl)
      nameDecl.parent = saveParent


#### Helper method createScope()
initializes an empty scope in this node

        declare valid me.scope.isScope

        if no me.scope 
          me.scope = me.declareName("#{me.name or me.constructor.name} Scope")
          me.scope.isScope = true

        return me.scope

#### helper method createFunctionScope(scopeThisProto)

Functions (methods and constructors also), have a 'scope'. 
It captures al vars declared in its body.
We now create function's scope and add the special var 'this'. 
The 'type' of 'this' is normally a class prototype, 
which contains other methods and properties from the class.
We also add 'arguments.length'

        var scope = me.createScope()

        me.addMemberTo(scope, 'arguments').addMember('length')

        var varThis = me.addMemberTo(scope,'this',{type:scopeThisProto})
        me.addMemberTo(scope,'me',{pointsTo:varThis}) # me -> this

Note: since ALL functions have 'this' in scope, when you create 
a class inside a function, or a function inside a function, you'll have TWO different
'this' "in scope". One in the inner scope, shadowing other in the outer scope. 
This is technically a scope 'name duplication', but it's allowed fot 'this' & 'arguments'

#### helper method tryGetOwnerDecl(options)
Used by properties & methods in the body of AppendToDeclaration
to get their 'owner', i.e., a NameDeclaration where they'll be added as members

        default options=
          informError:undefined

        var ownerDecl, optClass = true

        declare valid me.varRefOwner.tryGetReference
        declare valid me.specifier

        # get parent class/append to
        var parent:Grammar.ClassDeclaration = me.getParent(Grammar.ClassDeclaration)
        if no parent
          me.throwError "'#{me.specifier}' declaration outside 'class/append to' declaration. Check indent"

        if parent instance of Grammar.AppendToDeclaration

            #get varRefOwner from AppendToDeclaration
            declare parent:Grammar.AppendToDeclaration
            me.varRefOwner = parent.varRef
            optClass = parent.optClass #option: 'append to classs|object'

            ownerDecl = me.varRefOwner.tryGetReference()
            if no ownerDecl
              if options.informError, me.sayErr "Append to: '#{me.varRefOwner}'. Reference is not fully declared"
              return

            if optClass 
              declare valid ownerDecl.members.prototype
              ownerDecl = ownerDecl.members.prototype
              if no ownerDecl
                if options.informError, me.sayErr "Append to class: '#{me.varRefOwner}' has no .prototype"
                return

        else # simpler direct ClassDeclaration

            if no parent.nameDecl, me.sayErr "Unexpected. Class has no nameDecl"
            declare valid me.toNamespace
            if me.toNamespace
                ownerDecl = parent.nameDecl #add to class as namespace
            else
                #add to .prototype.
                declare valid parent.nameDecl.members.prototype
                ownerDecl = parent.nameDecl.members.prototype
                if no ownerDecl, me.sayErr "Unexpected. Class has no prototype"

        return ownerDecl



----
## Methods added to specific Grammar Classes to handle scope, var & members declaration

### Append to class Grammar.VariableDecl ###

`VariableDecl: Identifier (':' dataType-IDENTIFIER) ('=' assignedValue-Expression)`

variable name, optional type anotation and optionally assign a value

VariableDecls are used in `var` statement, in function *parameter declaration* and in class *properties declaration*

Examples:  
  `var a : string = 'some text'` 
  `function x ( a : string = 'some text', b, c=0)`

      properties nameDecl

      helper method createNameDeclaration(options)  

        default options =
          type: me.type
          itemType: me.itemType
          value: me.assignedValue

        return me.declareName(me.name,options)

      helper method declareInScope()  
        me.nameDecl = me.addToScope(me.createNameDeclaration())

      helper method getTypeFromAssignedValue() 
        if me.nameDecl and me.assignedValue
            var type = me.nameDecl.findOwnMember('**proto**')
            if no type
                var result = me.assignedValue.getResultType()
                if result, me.nameDecl.setMember('**proto**', result)

### Append to class Grammar.VarStatement ###

#### method declare()  # pass 1
        for each varDecl in me.list
            varDecl.declareInScope
            if me.public, me.addToExport varDecl.nameDecl

#### method evaluateAssignments() # pass 4, determine type from assigned value
        for each varDecl in me.list
            varDecl.getTypeFromAssignedValue


----------------------------
### Append to class Grammar.ClassDeclaration ### also AppendToDeclaration (child class)
Classes contain a code block with properties and methods definitions.

#### properties
      nameDecl, public

#### method declare()

if it is 'append to', nothing to declare, object must pre-exist

        if me instanceof Grammar.AppendToDeclaration, return
    
Add class name, to parent scope. A class in js, is a function

        me.nameDecl = me.addToScope(me.name,{type:globalPrototype('Function')})
        if me.public, me.addToExport me.nameDecl

We create 'Class.prototype' member
Class's properties & methods will be added to 'prototype' as valid member members.
'prototype' starts with 'constructor' which is a pointer to the class-funcion itself

        var prtypeNameDecl = me.nameDecl.findMember('prototype') or me.addMemberTo(me.nameDecl,'prototype')
        if me.varRefSuper, prtypeNameDecl.setMember('**proto**',me.varRefSuper)
        prtypeNameDecl.addMember('constructor',{pointsTo:me.nameDecl}) 

returnType of the class-function, is the prototype

        me.nameDecl.setMember('**return type**',prtypeNameDecl)

add to nameAffinity

        me.addMemberTo nameAffinity, me.name

------------

### Append to class Grammar.ObjectLiteral ###
     properties nameDecl

#### method declare
      declare valid me.parent.nameDecl
      me.nameDecl = me.parent.nameDecl or me.declareName(me.outCode.getUniqueVarName('*ObjectLiteral*'))

#### method getResultType
      return me.nameDecl


### Append to class Grammar.NameValuePair ###
     properties nameDecl
#### method declare
      declare valid me.parent.nameDecl
      me.nameDecl = me.addMemberTo(me.parent.nameDecl, me.name)


### Append to class Grammar.FunctionDeclaration ###
`FunctionDeclaration: '[public][generator] (function|method|constructor) [name] '(' FunctionParameterDecl* ')' Block`

     properties nameDecl, declared:boolean, scope:NameDeclaration

#### method declare() ## function, methods and constructors

      var owner

#####1st: Grammar.FunctionDeclaration
if it is not anonymous, add function name to parent scope,
if its 'public' add to exports

      if me.constructor is Grammar.FunctionDeclaration

          if me.name
            var nameDecl = me.addToScope(me.name,{type:'Function'})
            if me.public, me.addToExport nameDecl

determine 'owner' (where 'this' points to for this function)

          var nameValuePair = me.getParent(Grammar.NameValuePair)
          if nameValuePair #NameValue pair where function is 'value'
              declare valid nameValuePair.parent.nameDecl
              owner = nameValuePair.parent.nameDecl  #owner object nameDecl
          else
            owner = globalScope


#####2nd: Methods & constructors

Try to determine owner, for declaration and to set scope var "this"'s  **proto** (type)

      else 

          owner = me.tryGetOwnerDecl()

if owner *can* be determined at his point, declare method as member, else 
will be added later. Note: Constructors have no "name". Constructors are the class itself.

          if owner and me.name 
              me.addMethodToOwner owner

Now create function's scope, using 'owner' as var this's **proto**

Scope starts populated by 'this' and 'arguments.length'.

      me.createFunctionScope(owner)

add parameters to function's scope

      if me.paramsDeclarations
        for each varDecl in me.paramsDeclarations
          varDecl.declareInScope


#### method processAppendTo() ## function, methods and constructors

For undeclared methods only

      if me.constructor isnt Grammar.MethodDeclaration or me.declared, return

tryGetOwnerDecl will evaluate 'append to' varRef to get object where this method belongs

      var owner = me.tryGetOwnerDecl({informError:true}) # inform error if try-fails

Now that we have 'owner' we can set **proto** for scope var 'this', 
so we can later validate `.x` in `this.x = 7`

      if owner
          me.addMethodToOwner owner
          declare valid me.scope.members.this.setMember
          me.scope.members.this.setMember '**proto**',owner


#### helper method addMethodToOwner(owner:NameDeclaration) 

      var actual = owner.findOwnMember(me.name)
      if actual and me.shim #shim for an exising method, do nothing
        do nothing
      else
        me.nameDecl = me.addMemberTo(owner, me.name,{type:'Function'})
        if me.returnType, me.nameDecl.setMember '**return type**', me.returnType
        me.declared = true



### Append to class Grammar.PropertiesDeclaration ###

     properties nameDecl, declared:boolean, scope:NameDeclaration

#### method declare(options) 
Add all properties as members of its owner object (normally: class.prototype)

        var owner = me.tryGetOwnerDecl(options)
        if owner 
            for each varDecl in me.list
                varDecl.nameDecl = varDecl.addMemberTo(owner,varDecl.name,{type:varDecl.type, itemType:varDecl.itemType})
            me.declared = true

#### method processAppendTo() 
Add all properties as members of its owner (append to).
For undeclared properties only

        if not me.declared, me.declare({informError:true})

#### method evaluateAssignments() # determine type from assigned value on properties declaration

        for each varDecl in me.list
            varDecl.getTypeFromAssignedValue



### Append to class Grammar.ForStatement ###

#### properties indexNameDecl, mainNameDecl

#### method declare()

a ForStatement has a 'Scope'. Add, if they exists, indexVar & mainVar

        declare valid me.variant.indexVar
        declare valid me.variant.mainVar

        me.createScope
        me.indexNameDecl = me.addToScope(me.variant.indexVar)
        me.mainNameDecl  = me.addToScope(me.variant.mainVar)

        //debug:
        //me.sayErr "ForStatement - pass declare"
        //console.log "index",me.variant.indexVar, me.indexNameDecl? me.indexNameDecl.toString():undefined
        //console.log "main",me.variant.mainVar, me.mainNameDecl? me.mainNameDecl.toString(): undefined


#### method evaluateAssignments()

        declare valid me.variant.iterable.getResultType

ForEachInArray:
If no mainVar.type, guess type from iterable's itemType

        if me.variant instanceof Grammar.ForEachInArray
            if no me.mainNameDecl.findOwnMember('**proto**')
                var iterableType:NameDeclaration = me.variant.iterable.getResultType()          
                if iterableType 
                  var itemType = iterableType.findOwnMember('**item type**')  
                  if itemType
                    me.mainNameDecl.setMember('**proto**',itemType)

ForEachProperty: index is string (property name)

        else if me.variant instanceof Grammar.ForEachProperty
            me.indexNameDecl.setMember('**proto**',globalPrototype('String'))


#### method validatePropertyAccess()
ForEachInArray: check if the iterable has a .length property.

        if me.variant instanceof Grammar.ForEachInArray

            declare valid me.variant.iterable.getResultType

            var iterableType:NameDeclaration = me.variant.iterable.getResultType()          

            if no iterableType 
              #me.sayErr "ForEachInArray: no type declared for: '#{me.variant.iterable}'"
              do nothing
            else if no iterableType.findMember('length')
              me.sayErr "ForEachInArray: no .length property declared in '#{me.variant.iterable}' type:'#{iterableType.toString()}'"
              log.error iterableType.originalDeclarationPosition()


### Append to class Grammar.ExceptionBlock
`ExceptionBlock: (exception|catch) catchVar-IDENTIFIER Body [finally Body]`

      method declare()

Exception blocks have a scope

        me.createScope
        me.addToScope me.catchVar,{type:globalPrototype('Error')}


### Append to class Grammar.VariableRef ### Helper methods

`VariableRef: ['--'|'++']Identifier[Accessors]['--'|'++']`

`VariableRef` is a Variable Reference. 

 a VariableRef can include chained 'Accessors', which can:
 *access a property of the object : `.`-> PropertyAccess `[`->IndexAccess
 *assume the variable is a function and perform a function call :  `(`-> FunctionAccess

#### helper method tryGetReference(options) returns NameDeclaration

evaluate this VariableRef. 
Try to determine referenced NameDecl.
if we can reach to a reference, return reference

        default options=
          informError: undefined

Start with main variable name

        var actualVar = me.tryGetFromScope(me.name, options)
        if no actualVar, return

now check each accessor
        
        if no me.accessors, return actualVar

        var partial = me.name

        for each ac in me.accessors
            declare valid ac.name

for PropertyAccess

            if ac instanceof Grammar.PropertyAccess
                actualVar = me.tryGetMember(actualVar, ac.name, options)

else, for IndexAccess, the varRef type is now 'itemType'
and next property access should be on defined members of the type

            else if ac instanceof Grammar.IndexAccess
                actualVar = me.tryGetMember(actualVar, '**item type**')

else, for FunctionAccess, the varRef type is now function's returnType'
and next property access should be on defined members of the returnType

            else if ac instanceof Grammar.FunctionAccess
                actualVar = me.tryGetMember(actualVar, '**return type**')

check if we can continue on the chain

            if actualVar isnt instance of NameDeclaration
              actualVar = undefined
              break
            else
              partial += ac.toString()

        end for #each accessor

        if no actualVar and options.informError
            me.sayErr "'#{me}'. Reference can not be analyzed further than '#{partial}'"

        return actualVar


#### method validatePropertyAccess() # last pass 

        if me.parent is instance of Grammar.DeclareStatement, return

Start with main variable name, to check property names

        var actualVar = me.tryGetFromScope(me.name, {informError:true, isForward:true, isDummy:true})

now follow each accessor

        if no me.accessors, return 

        for each ac in me.accessors
            declare valid ac.name

for PropertyAccess, check if the property name is valid 

            if ac instanceof Grammar.PropertyAccess
              actualVar = me.tryGetMember(actualVar, ac.name,{informError:true, isForward:true, isDummy:true})

else, for IndexAccess, the varRef type is now 'itemType'
and next property access should be on defined members of the type

            else if ac instanceof Grammar.IndexAccess
                actualVar = actualVar.findMember('**item type**')

else, for FunctionAccess, the varRef type is now function's returnType'
and next property access should be on defined members of the returnType

            else if ac instanceof Grammar.FunctionAccess
                actualVar = actualVar.findMember('**return type**')

            if actualVar isnt instanceof NameDeclaration, break

        end for #each accessor


### Append to class Grammar.AssignmentStatement ###

#### method declareByAssignment()

Here we check for lvalue VariableRef in the form:

`exports.x = xx`, `module.exports.x = xx` and `xx.prototype.yy =`

We consider this assignments as 'declarations' of members rather than variable references to check.

Start with main variable name

        var varRef = me.lvalue

        var keywordFound

        if varRef.name is 'exports' #start with 'exports'
            keywordFound = varRef.name

        if no varRef.accessors 

          if keywordFound # is: `exports = x`, it does not work in node-js
              me.sayErr "'exports = x', does not work. You need to do: 'module.exports = x'"

          return # no accessors to check

        var actualVar = me.findInScope(varRef.name)
        if no actualVar, return

now check each accessor
        
        var createName 

        for each index,ac in varRef.accessors
            declare valid ac.name

for PropertyAccess

            if ac instanceof Grammar.PropertyAccess

              #if we're after 'exports|prototype' keyword and this is the last accessor,
              #then this is the name to create
              if keywordFound and index is varRef.accessors.length-1
                  createName = ac.name
                  break

check for 'exports' or 'prototype', after that, last accessor is property declaration

              if ac.name in ['exports','prototype']
                keywordFound = ac.name

              actualVar =  actualVar.findMember(ac.name)
              if no actualVar, break

else, if IndexAccess or function access, we exit analysis

            else 
              return #exit

        end for #each accessor in lvalue, look for module.exports=...

if we found 'exports' or 'prototype', and we reach a valid reference

        if keywordFound and actualVar 
          
            if createName # module.exports.x =... create a member
              actualVar = me.addMemberTo(actualVar,createName) # create x on module.exports

            #try to execute assignment, so exported var points to content
            var content = me.rvalue.getResultType({informError:true}) 
            if content instanceof NameDeclaration
                actualVar.makePointTo content
            else
                debugger


#### method evaluateAssignments() ## Grammar.AssignmentStatement 
    
check if we've got a a clear reference.

      var reference = me.lvalue.tryGetReference()
      if reference isnt instanceof NameDeclaration, return 
      if reference.findOwnMember('**proto**'), return #has a type already

check if we've got a clear rvalue.
if we do, make lvalue point to rvalue

      var rvalueType = me.rvalue.getResultType()
      if rvalueType instance of NameDeclaration
          reference.setMember('**proto**',rvalueType)

### Append to class Grammar.DefaultAssignment ###

#### method evaluateAssignments() # determine type from assigned value

      me.assignment.evaluateAssignments()


### Append to class Grammar.Expression ###

#### Method getResultType() returns NameDeclaration
Try to get return type from a simple Expression

        declare valid me.root.name.type
        declare valid me.root.name.getResultType
        declare valid me.root.name.tryGetReference
        declare valid me.root.right.name.tryGetReference

        if me.root.name instance of Grammar.ObjectLiteral
            return me.root.name.getResultType()

        else if me.root.name instance of Grammar.Literal
            return globalPrototype(me.root.name.type)

        else if me.root.name instance of Grammar.VariableRef
            return me.root.name.tryGetReference()

        else if me.root.name is 'new'
            if me.root.right.name instanceof Grammar.VariableRef
              return me.root.right.name.tryGetReference()

### Append to class Grammar.DeclareStatement ###
#### method declare() # pass 1, declare as props

declare valid x.y.z

declare on x

      if me.specifier is 'on'

          var reference = me.tryGetFromScope(me.name,{isForward:true})

          var isCapitalized = String.isCapitalized(reference.name)
          if isCapitalized
              declare valid reference.members.prototype
              if no reference.members.prototype
                reference.addMember('prototype')
              reference=reference.members.prototype

          for each varDecl in me.names
              me.addMemberTo reference, varDecl.createNameDeclaration()

else: declare (VariableDecl,)

      else

          for varDecl in me.names

            varDecl.nameDecl = varDecl.createNameDeclaration()

            if me.specifier is 'global'
              declare valid project.root.addToScope
              project.root.addToScope varDecl.nameDecl

            if me.specifier is 'affinity'
              var classDecl = me.getParent(Grammar.ClassDeclaration)
              if no classDecl
                  me.sayErr "declare affinity must be included in a class declaration"
                  return
              #add as member to nameAffinity, referencing class decl (.nodeDeclared)
              varDecl.nameDecl.nodeDeclared = classDecl
              nameAffinity.addMember varDecl.nameDecl

            else if me.specifier is 'forward'
              do nothing

if me.specifier is 'types', the type will be converted on next passes over the created NameDeclaration.
On the method validatePropertyAccess(), types will be switched "on the fly" while checking property access.


### Append to class Grammar.DeclareStatement ###
#### method validatePropertyAccess() # last pass

alter on the fly scope var "types"

      if me.specifier is 'types'

          for each varDecl in me.names
              var mainVar = me.tryGetFromScope(varDecl.name,{informError:true})
              if mainVar, mainVar.setMember '**proto**', varDecl.nameDecl.ownMember('**proto**')

declare members on the fly 

      else if me.specifier is 'valid'
          var actualVar = me.tryGetFromScope(me.varRef.name,{informError:true})
          for each ac in me.varRef.accessors
            declare valid ac.name
            if ac isnt instance of Grammar.PropertyAccess, break
            actualVar = actualVar.findOwnMember(ac.name) or me.addMemberTo(actualVar, ac.name)

