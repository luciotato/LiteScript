Name Validation 
===============

This module contains helper functions to manage variable, 
function and object property name declaration.

This module purpose is to make the compiler catch 
mistyped variable and property names at compile time
(instead of YOU spending hours to debug a subtle bug at run time)

In order to do name validation we need to construct the scope tree, 
and also register all valid members of all "types" (objects).

----------
##Dependencies:

This module extends Grammar classes, adding 'declare', 'evaluateAssignments', etc.
methods to validate var & property names.

    import log
    var debug = log.debug

We extend the Grammar classes, so this module require the `Grammar` module.

    import 
        ASTBase, Grammar
        NameDeclaration, Environment

    
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
The compiler will catch such a misstype as "undeclared variable". 

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

The compiler will guess var types from creation, assignment
and by name affinity. If type cannot be guessed you can also explicitily use a 
`declare on myObj prop1,prop2` statement to dismiss the 'UNDECLARED PROPERTY' warnings.

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

  bObj.classAProp1 = 5 // <-- this **will be caught** as: object 'bObj' has no property 'classAProp1'

  var xObj = callToFn() // unknown type
  
  xObj.classBProp1 = 5 // <-- this trigger a "classBProp1 IS NOT A DECLARED PROPERTY OF xObj"

  declare on xObj  // <-- this fixes it
    classBProp1

  xObj.classBProp1 = 5 // <-- this is OK now

  var xObj:ClassB = callToFn() // type annotation, this also fixes it
  
  bObj.classBProp1 = 5 // <-- this is ok

*/


### export function validate()

We start this module once the entire multi-node AST tree has been parsed.

Initialize module vars

        nameAffinity= new NameDeclaration('Name Affinity') # project-wide name affinity for classes
        nameAffinity.addMember 'err','Error'

Now, run passes on the AST

#### Pass 1.0 Declarations 
Walk the tree, and call function 'declare' on every node having it. 
'declare' will create scopes, and vars in the scope. 
May inform 'DUPLICATES' and 'CASE MISMATCH' errors.

        log.message "- Process Declarations"
        walkAllNodesCalling 'declare'

#### Pass 1.1 Declare By Assignment
Walk the tree, and check assignments looking for: 'module.exports.x=x' and 'x.prototype.y = '.
Treat them as declarations.

        log.message "- Declare By Assignment"
        walkAllNodesCalling 'declareByAssignment'


#### Pass 1.2 connectImportRequire
check `x=require('y')` calls. 
Make var x point to required module 'y' exports 

        declare valid project.moduleCache

        log.message "- Connecting Imported"
        for each own property fname in project.moduleCache
          var moduleNode:Grammar.Module = project.moduleCache[fname]

          for each node in moduleNode.requireCallNodes

            if node.importedModule

              var parent: ASTBase
              var reference: NameDeclaration

              declare valid parent.lvalue.tryGetReference
              declare valid parent.nameDecl

if node is Grammar.ImportStatementItem

              if node instance of Grammar.ImportStatementItem
                  declare node:Grammar.ImportStatementItem
                  reference = node.nameDecl

if we processed a 'compiler import command' all exported should go to the global scope
            
                  if node.getParent(Grammar.CompilerStatement)
                      for each own property key,nameDecl in node.importedModule.exports.members
                          #declare valid project.root.addToScope
                          project.root.addToScope nameDecl

                      node.importedModule.exports.members = {}
                      reference = undefined


else is a "require" call (VariableRef). 
Get parent node.

              else
                  parent = node.parent
                  if parent instance of Grammar.Operand 
                     parent = node.parent.parent.parent # varRef->operand->Expression->Expression's Parent

get referece where import module is being assigned to

                  if parent instance of Grammar.AssignmentStatement 
                    reference = parent.lvalue.tryGetReference({informError:true}) 
                  
                  else if parent instance of Grammar.VariableDecl
                    reference = parent.nameDecl

              end if

make reference point to importedModule.exports

              if reference
                reference.makePointTo node.importedModule.exports


#### Pass 1.3 Process "Append To" Declarations
Since 'append to [class|object] x.y.z' statement can add to any object, we delay 
"Append To" declaration to this point, where 'x.y.z' can be analyzed and a reference obtained.
Walk the tree, and check "Append To" Methods & Properties Declarations

        log.message "- Processing Append-To"
        walkAllNodesCalling 'processAppendTo'


#### Pass 2. Convert Types
for each NameDeclaration try to find the declared 'type' (string) in the scope. 
Repeat until no conversions can be made.

        log.message "- Converting Types"

        var totalConverted = 0
        while totalConverted < NameDeclaration.allOfThem.length

            var converted = 0
            
            for each nameDecl in NameDeclaration.allOfThem 
              where not nameDecl.converted
                if nameDecl.processConvertTypes(), converted++

            if no converted, break #exit if no conversions made
            totalConverted += converted

            debug "converted:#{converted}, totalConverted:#{totalConverted}"

        #loop

Inform unconverted types as errors

        if totalConverted < NameDeclaration.allOfThem.length

          for each nameDecl in NameDeclaration.allOfThem

            var type = nameDecl.findOwnMember('**proto**')
            if type and type isnt instanceof NameDeclaration
                nameDecl.sayErr "undeclared type: '#{type.toString()}'"
                if type instanceof ASTBase
                    log.error type.positionText(),"for reference: type declaration position"
            
#### Pass 3 Evaluate Assignments
Walk the scope tree, and for each assignment, 
IF L-value has no type, try to guess from R-value's result type

        log.message "- Evaluating Assignments"
        walkAllNodesCalling 'evaluateAssignments'

#### Pass 4 -Final- Validate Property Access
Once we have all vars declared and typed, walk the AST, 
and for each VariableRef validate property access.
May inform 'UNDECLARED PROPERTY'.

        log.message "- Validating Property Access"
        walkAllNodesCalling 'validatePropertyAccess'

Inform forward declarations not fulfilled, as errors

        for each nameDecl in NameDeclaration.allOfThem

            if nameDecl.isForward and not nameDecl.isDummy

                nameDecl.warn "forward declared, but never found"
                var container = nameDecl.nodeDeclared.getParent(Grammar.ClassDeclaration)
                if container
                  declare container:Grammar.ClassDeclaration
                  declare valid container.varRef.toString
                  if container.varRef, log.warning "#{container.positionText()} more info: '#{nameDecl.name}' of '#{container.varRef.toString()}'"

    end function validate


### export function walkAllNodesCalling(methodName)

For all modules, for each node, if the specific AST node has methodName, call it

        for each own property filename in project.moduleCache
            var moduleNode:Grammar.Module = project.moduleCache[filename]
            moduleNode.callOnSubTree methodName


### export function createGlobalScope(aProject)
This method prepares a default global scope for a project

global scope starts populated with most common js built-in objects

Initialize module vars

        project = aProject
        
The "scope" of rootNode is the global scope. 
Initialize the global scope

        declare valid project.root.createScope
        declare valid project.globalScope

        globalScope = project.root.createScope()
        project.globalScope = globalScope

        #clear global NameDeclaration list
        NameDeclaration.allOfThem = []

Populate the global scope

        var objProto = addBuiltInObject('Object')
        declare valid objProto.members.constructor.addMember
        objProto.members.constructor.addMember('name')

        var stringProto = addBuiltInObject('String')

        #state that Obj.toString returns string:
        objProto.members["tostring"].setMember '**return type**', stringProto

        addBuiltInObject 'Function'
        addBuiltInObject 'Boolean'
        addBuiltInObject 'Array'
        addBuiltInObject 'Number' 
        addBuiltInObject 'Date' 
        addBuiltInObject 'RegExp'
        addBuiltInObject 'JSON'
        addBuiltInObject('Error').addMember('stack')
        addBuiltInObject 'Math'

        globalScope.addMember 'true',{value:true}
        globalScope.addMember 'false',{value:false}
        globalScope.addMember 'on',{value:true}
        globalScope.addMember 'off',{value:false}
        globalScope.addMember 'undefined',{value:undefined}
        globalScope.addMember 'null',{value:null}

        declare valid project.options.browser
        if project.options.browser
          do nothing
          //globalScope.addMember 'window',{type:globalScope}
          //globalScope.addMember 'document'

        else #node.js
          globalScope.addMember 'global',{type:globalScope}
          globalScope.addMember 'require'
          globalScope.addMember 'setTimeout'
          addBuiltInObject 'process'


----------
----------

## Module Helper Functions

### Helper function tryGetGlobalPrototype(name) 
gets a var from global scope
      
      var normalized = NameDeclaration.normalizeVarName(name)      
      var nameDecl:NameDeclaration = globalScope.members[normalized]
      if nameDecl
        declare valid nameDecl.members.prototype
        return nameDecl.members.prototype

### Helper function globalPrototype(name) 
gets a var from global scope

      if name instanceof NameDeclaration, return name #already converted type

      var normalized = NameDeclaration.normalizeVarName(name)      

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

      var normalized = NameDeclaration.normalizeVarName(name)      
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

##Additions to NameDeclaration. Helper methods to do validation

### Append to class NameDeclaration

#### Helper method findMember(name) returns NameDeclaration
this method looks for a name in NameDeclaration members,
it also follows the **proto** chain (same mechanism as js __proto__ chain)

        var actual = this
        var count=0

        do while actual instance of NameDeclaration 

            if actual.findOwnMember(name) into var result
               return result

We use a member named '**proto**' on NameDeclarations, mapping run-time proto chain.
We follow the chain to validate property names.

            var nextInChain = actual.findOwnMember('**proto**')

As last option in the chain, we always use 'Object.prototype'

            if no nextInChain and actual isnt globalPrototype('Object')
              nextInChain = globalPrototype('Object')

            actual = nextInChain

            if count++ > 50 #assume circular
                .warn "circular type reference"
                return
        
        loop


#### Helper Method getMembersFromObjProperties(obj) #Recursive
Recursively converts a obj properties in NameDeclarations.
it's used when a pure.js module is imported by 'require'
to convert required 'exports' to LiteScript compiler usable NameDeclarations
Also to load the global scope with built-in objects

        var newMember:NameDeclaration

        if obj instanceof Object or obj is Object.prototype

            for each prop in Object.getOwnPropertyNames(obj) #even not enumerables
                where prop isnt '__proto__' #exclude __proto__ 

                    var type =  Grammar.autoCapitalizeCoreClasses(typeof obj[prop])
                    type = tryGetGlobalPrototype(type) #core classes: Function, Object, String
                    if type is this, type = undefined #avoid circular references

                    newMember = .addMember(prop,{type:type})

                    #on 'protoype' member or 
                    #if member is a Function-class - dive into
                    declare valid Object.hasOwnProperty.call
                    if prop isnt 'constructor' 
                        if prop is 'prototype' 
                            or (typeof obj[prop] is 'function' 
                                and obj[prop].hasOwnProperty('prototype') 
                                and not .isInParents(prop) 
                               )
                            or (typeof obj[prop] is 'object' 
                                and not .isInParents(prop) 
                               )
                              newMember.getMembersFromObjProperties(obj[prop]) #recursive
                              if prop is 'super_' # used in node's core modules: http, EventEmitter, etc.
                                  if newMember.findOwnMember('prototype') into var superProtopNameDecl 
                                    var protopNameDecl = .findOwnMember('prototype') or .addMember('prototype')
                                    protopNameDecl.setMember '**proto**', superProtopNameDecl #put super's proto in **proto** of prototype



                        

#### Helper Method isInParents(name)
return true if a property name is in the parent chain.
Used to avoid recursing circular properties
        
        var nameDecl = this.parent
        name = NameDeclaration.normalizePropName(name)
        while nameDecl
          if nameDecl.members.hasOwnProperty(name),return true
          nameDecl = nameDecl.parent


#### Helper method processConvertTypes() 
convert possible types stored in NameDeclaration, 
from string to NameDeclarations in the scope
returns '**proto**' converted type

        .convertType '**return type**'  #a Function can have **return type**
        .convertType '**item type**'  #an Array can have **item type** e.g.: 'var list: string array'

        var converted
        if .findOwnMember('**proto**')

Try to convert type, from string or VariableRef to a found NameDeclaration in Scope.

          converted = .convertType('**proto**')

else, if no type defined, try by name affinity,e.g., for var 'token', if a Class named 'Token' is
in scope, var 'token' is assumed type 'Token', return true if type was assigned

        else
          converted = .assignTypebyNameAffinity()

if converted, mark

        if converted, .converted = true

return true if a conversion was made

        return converted


#### Helper method convertType(internalName) 
convert type from string to NameDeclarations in the scope.
returns 'true' if converted, 'false' if it has to be tried later

        if no .findOwnMember(internalName) into var type, return  #nothing to process

        if type instance of NameDeclaration
            #already converted
            return 

        # if the type is a varRef, must reference a class
        if type instanceof Grammar.VariableRef
            declare type:Grammar.VariableRef

            if type.tryGetReference() into var classFN:NameDeclaration 

              if no classFN.members['prototype']
                .sayErr "TYPE: '#{type}' has no prototype"
                return 
            
              type = classFN.members['prototype']

        else if typeof type is 'string'

            if no .nodeDeclared
              type = globalPrototype(type)
            else
              type = .nodeDeclared.findInScope(type)
              declare valid type.members.prototype
              type = type.members.prototype or type

        else
          declare valid type.constructor.name
          .sayErr "INTERNAL ERROR: UNRECOGNIZED TYPE on #{internalName}: '#{type}' [#{type.constructor.name}] typeof is '#{typeof type}'"
          return

        #store converted
        if type, .setMember(internalName,type)

        return type


#### helper method assignTypeFromValue(value) 
if we can determine assigned value type, set var type

      declare valid value.getResultType
      var valueNameDecl = value.getResultType()

now set var type (unless is "null" or "undefined", they destroy type info)

      if valueNameDecl instance of NameDeclaration and valueNameDecl.name not in ["undefined","null"]
          .setMember '**proto**', valueNameDecl



#### helper method assignTypebyNameAffinity() 
Auto-assign type by name affinity. 
If no type specified, check project.nameAffinity
        
        if .nodeDeclared and not String.isCapitalized(.name)

            if not .findOwnMember('**proto**')

                var normalized:string = NameDeclaration.normalizePropName(.name)
                var possibleClassRef = nameAffinity.members[normalized]

                # possibleClassRef is a NameDeclaration whose .nodeDeclared is a ClassDeclaration

                # check 'ends with' if name is at least 6 chars in length
                if not possibleClassRef and normalized.length>=6
                    for each own property affinityName in nameAffinity.members
                        if normalized.endsWith(affinityName)
                            possibleClassRef = nameAffinity.members[affinityName]
                            break

                #if there is a candidate class, check of it has a defined prototype
                declare valid possibleClassRef.nodeDeclared.nameDecl.members.prototype
                if possibleClassRef and possibleClassRef.nodeDeclared and possibleClassRef.nodeDeclared.nameDecl.members.prototype
                    .setMember('**proto**', possibleClassRef.nodeDeclared.nameDecl.members.prototype)
                    return true

                #last option err:Error
                if normalized is 'err'
                    .setMember '**proto**', tryGetGlobalPrototype('Error')
                    return true



--------------------------------
## Helper methods added to AST Tree

### Append to class ASTBase

#### helper method declareName(name, options) 
declareName creates a new NameDeclaration, referecing source (AST node)

        return new NameDeclaration(name, options, this)

#### method addMemberTo(nameDecl, memberName, options) 
a Helper method ASTBase.*addMemberTo*
Adds a member to a NameDecl, referencing this node as nodeDeclared
        
        return nameDecl.addMember(memberName, options, this)

#### Helper method tryGetMember(nameDecl,name:string,options)
this method looks for a specific member, optionally declare as forward
or inform error. We need this AST node, to correctly report error.
        
        default options = 
          informError: undefined
          isForward: undefined
  
        var found = nameDecl.findMember(name)
        
        if found and name.slice(0,2) isnt '**'
          found.caseMismatch name,this
        
        else #not found
          if options.informError, log.warning "#{.positionText()}. No member named '#{name}' on #{nameDecl.info()}"
          if options.isForward, found = .addMemberTo(nameDecl,name,options)

        return found


#### helper method getScopeNode() 

**getScopeNode** method return the parent 'scoped' node in the hierarchy.
It looks up until found a node with .scope
        
Start at this node

        var node = this
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

        normalized = NameDeclaration.normalizeVarName(name)

Start at this node

        var node = this
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
          informError: undefined
          isForward: undefined
          isDummy: undefined


Search the scope

         
        if .findInScope(name) into var found 

Declaration found, we check the upper/lower case to be consistent
If the found item has a different case than the name we're looking for, emit error 

            if found.caseMismatch(name, this)
              return found
            #end if

if declaration not found, check if it's a built-in value like 'true'

        else if name in ['true','false','undefined','null','NaN','Infinity']
            found = .getRootNode().addToScope(name)

else, check if it's a built-in "object", so we declare it in the global scope

        else if Environment.isBuiltInObject(name)
            found = addBuiltInObject(name,this)

if it is not found,check options: a) inform error. b) declare foward.

        else
            if options.informError
                .sayErr "UNDECLARED NAME: '#{name}'"

            if options.isForward
                found = .addToScope(name,options)  
                if options.isDummy and String.isCapitalized(name) #let's assume is a class
                    .addMemberTo(found,'prototype',options)

        #end if - check declared variables 

        return found



#### method addToScope(item, options) returns NameDeclaration 
a Helper method ASTBase.*addToScope*
Search for parent Scope, adds passed name to scope.members[]
Reports duplicated.
return: NameDeclaration

        if no item, return # do nothing on undefined params

        var scope:NameDeclaration = .getScopeNode().scope

        if no options
          options={}

First search it to report duplicates, if found in the scope.
If the found item has a different case than the name we're adding, emit error & return

        declare valid item.name
        var name = type of item is 'string'? item : item.name

        debug "addToScope: '#{name}' to '#{scope.name}'" #[#{.constructor.name}] name:

        if .findInScope(name) into var found 

            if found.caseMismatch(name, this)
              #case mismatch informed
              do nothing

            else if found.isForward
              found.isForward = false
              found.nodeDeclared = this
              if item instanceof NameDeclaration
                found.replaceForward item

            else 
              .sayErr "DUPLICATED name in scope: '#{name}'"
              log.error found.originalDeclarationPosition() #add extra information line

            return found

        #end if

else, not found, add it to the scope

        var nameDecl
        if item instanceof NameDeclaration
          nameDecl = item
        else
          nameDecl = .declareName(name,options)

        var normalized = NameDeclaration.normalizeVarName(name)
        scope.members[normalized] = nameDecl

        return nameDecl


#### helper method addToExport(exportedNameDecl, asDefault)
Add to parentModule.exports, but *preserve parent*
      
      var parentModule:Grammar.Module = .getParent(Grammar.Module)
      
      var options=
          scopeCase: undefined

if we're processing an interface.md file, 
properties will be moved to global scope. Keep case

      var isInterface = parentModule.lexer.interfaceMode 

      if isInterface, options.scopeCase = true #keep 1st letter case

      if asDefault and not isInterface  #export "asDefault" means replace "module.exports"
          parentModule.exports.makePointTo exportedNameDecl
      else
        #just add to actual exports, but preserve parent
        var saveParent = exportedNameDecl.parent
        parentModule.exports.addMember(exportedNameDecl,options)
        exportedNameDecl.parent = saveParent


#### Helper method createScope()
initializes an empty scope in this node

        declare valid .scope.isScope

        if no .scope 
          .scope = .declareName("#{.name or .constructor.name} Scope")
          .scope.isScope = true

        return .scope

#### helper method createFunctionScope(scopeThisProto)

Functions (methods and constructors also), have a 'scope'. 
It captures al vars declared in its body.
We now create function's scope and add the special var 'this'. 
The 'type' of 'this' is normally a class prototype, 
which contains other methods and properties from the class.
We also add 'arguments.length'

        var scope = .createScope()

        .addMemberTo(scope, 'arguments').addMember('length')

        var varThis = .addMemberTo(scope,'this',{type:scopeThisProto})

Note: since ALL functions have 'this' in scope, when you create 
a class inside a function, or a function inside a function, you'll have TWO different
'this' "in scope". One in the inner scope, shadowing other in the outer scope. 
This is technically a scope 'name duplication', but it's allowed fot 'this' & 'arguments'

#### helper method tryGetOwnerDecl(options)
Used by properties & methods in the body of ClassDeclaration|AppendToDeclaration
to get their 'owner', i.e., a NameDeclaration where they'll be added as members

        default options=
          informError:undefined

        var toNamespace, classRef
        var ownerDecl 

        declare valid .specifier

        # get parent class/append to
        var parent:Grammar.ClassDeclaration = .getParent(Grammar.ClassDeclaration)
        if no parent
          .throwError "'#{.specifier}' declaration outside 'class/append to' declaration. Check indent"

Append to class|namespace

        if parent instance of Grammar.AppendToDeclaration

            #get varRefOwner from AppendToDeclaration
            declare parent:Grammar.AppendToDeclaration

            toNamespace = parent.toNamespace #if it was 'append to namespace'

            classRef = parent.varRef
            
            #get referenced class
            declare valid classRef.tryGetReference
            if no classRef.tryGetReference() into ownerDecl
              if options.informError, .sayErr "Append to: '#{classRef}'. Reference is not fully declared"
              return

        else # simpler direct ClassDeclaration

            if no parent.nameDecl into ownerDecl
                 .sayErr "Unexpected. Class has no nameDecl"

            classRef = ownerDecl

            declare valid .toNamespace
            toNamespace = .toNamespace

        end if


check if owner is class (namespace) or class.prototype (class)

        if toNamespace 
            do nothing #'namespace properties' and 'append to namespace' are added directly to rerenced class-function
        else
          # move to class prototype
          declare valid ownerDecl.members.prototype
          if no ownerDecl.members.prototype into ownerDecl
              if options.informError, .sayErr "Class '#{classRef}' has no .prototype"
              return

        return ownerDecl



----
## Methods added to specific Grammar Classes to handle scope, var & members declaration

### Append to class Grammar.VariableDecl ###

`VariableDecl: Identifier (':' dataType-IDENTIFIER) ('=' assignedValue-Expression)`

variable name, optional type anotation and optionally assign a value

VariableDecls are used in:
1. `var` statement
2. function *parameter declaration* 
3. class *properties declaration*

Examples:  
  `var a : string = 'some text'` 
  `function x ( a : string = 'some text', b, c=0)`

      properties nameDecl

      helper method createNameDeclaration(options)  

        default options =
          type: .type
          itemType: .itemType
          value: .assignedValue

        return .declareName(.name,options)

      helper method declareInScope()  
          .nameDecl = .addToScope(.createNameDeclaration())

      helper method getTypeFromAssignedValue() 
          if .nameDecl and .assignedValue
              if no .nameDecl.findOwnMember('**proto**') into var type #if has no type
                  if .assignedValue.getResultType() into var result #get assignedValue type
                      this.nameDecl.setMember('**proto**', result) #assign to this.nameDecl


### Append to class Grammar.VarStatement ###

     method declare()  # pass 1
        for each varDecl in .list
            varDecl.declareInScope
            if .export, .addToExport varDecl.nameDecl, .default

     method evaluateAssignments() # pass 4, determine type from assigned value
        for each varDecl in .list
            varDecl.getTypeFromAssignedValue


### Append to class Grammar.WithStatement ###

      properties nameDecl

      method declare()  # pass 1
         .nameDecl = .addToScope(.declareName(.name))

      method evaluateAssignments() # pass 4, determine type from assigned value
        .nameDecl.assignTypeFromValue .varRef
      

### Append to class Grammar.ImportStatementItem ###

      properties nameDecl

      method declare #pass 1: declare name choosed for imported contents as a scope var

        if no .getParent(Grammar.CompilerStatement)
            .nameDecl = .addToScope(.name)


----------------------------
### Append to class Grammar.ClassDeclaration ### also AppendToDeclaration (child class)
Classes contain a code block with properties and methods definitions.

#### properties
      nameDecl

#### method declare()

if it is 'append to', nothing to declare, object must pre-exist

        if this instanceof Grammar.AppendToDeclaration, return
    
Add class name, to parent scope. A "class" in js is a function

        .nameDecl = .addToScope(.name,{type:globalPrototype('Function')})

If we're in a namespace, add class to namespace, 
else, if public/export, add to module.exports
        
        if .getParent(Grammar.NamespaceDeclaration) into var namespaceDeclaration
            namespaceDeclaration.nameDecl.addMember .nameDecl
        else
            if .export, .addToExport .nameDecl, .default

We create 'Class.prototype' member
Class's properties & methods will be added to 'prototype' as valid member members.
'prototype' starts with 'constructor' which is a pointer to the class-funcion itself

        var prtypeNameDecl = .nameDecl.findOwnMember('prototype') or .addMemberTo(.nameDecl,'prototype')
        if .varRefSuper, prtypeNameDecl.setMember('**proto**',.varRefSuper)
        prtypeNameDecl.addMember('constructor',{pointsTo:.nameDecl}) 

return type of the class-function, is the prototype

        .nameDecl.setMember '**return type**',prtypeNameDecl

add to nameAffinity

        if not nameAffinity.findOwnMember(.name)
            .addMemberTo nameAffinity, .name

------------

### Append to class Grammar.ObjectLiteral ###
     properties nameDecl

     method declare
      declare valid .parent.nameDecl
      .nameDecl = .parent.nameDecl or .declareName(ASTBase.getUniqueVarName('*ObjectLiteral*'))

     method getResultType
      return .nameDecl


### Append to class Grammar.NameValuePair ###
    
     properties nameDecl

     method declare

      declare valid .parent.nameDecl

      .nameDecl = .addMemberTo(.parent.nameDecl, .name)

check if we can determine type from value 
if we do, set type (unless is "null" or "undefined", they destroy type info)

      if .type and .type instance of NameDeclaration and .type.name not in ["undefined","null"]
          .nameDecl.setMember '**proto**', .type

      else if .value
          .nameDecl.assignTypeFromValue .value

### Append to class Grammar.FunctionDeclaration ###
`FunctionDeclaration: '[export][generator] (function|method|constructor) [name] '(' FunctionParameterDecl* ')' Block`

     properties nameDecl, declared:boolean, scope:NameDeclaration

#### Method declare() ## function, methods and constructors

      var owner

1st: Grammar.FunctionDeclaration

if it is not anonymous, add function name to parent scope,
if its 'export' add to exports

      if .constructor is Grammar.FunctionDeclaration

          if .name
            .nameDecl = .addToScope(.name,{type:'Function'})
            if .export, .addToExport .nameDecl, .default

determine 'owner' (where 'this' points to for this function)

          var nameValuePair = .getParent(Grammar.NameValuePair)
          if nameValuePair #NameValue pair where function is 'value'
              declare valid nameValuePair.parent.nameDecl
              owner = nameValuePair.parent.nameDecl  #owner object nameDecl
          else
            owner = globalScope

2nd: Methods & constructors

Try to determine owner, for declaration and to set scope var "this"'s  **proto**.
if owner *can* be determined at this point, declare method as member.

Note: Constructors have no "name". Constructors are the class itself.

      else 
          owner = .tryGetOwnerDecl()
          if owner and .name 
              .addMethodToOwner owner
      end if

Define function's return type from parsed text

      .createReturnType

Now create function's scope, using found owner as function's scope var this's **proto**

Scope starts populated by 'this' and 'arguments'.

      .createFunctionScope(owner)

add parameters to function's scope

      if .paramsDeclarations
        for each varDecl in .paramsDeclarations
          varDecl.declareInScope


#### method processAppendTo() ## function, methods and constructors

For undeclared methods only

      if .constructor isnt Grammar.MethodDeclaration or .declared, return

tryGetOwnerDecl will evaluate 'append to' varRef to get object where this method belongs

      var owner = .tryGetOwnerDecl({informError:true}) # inform error if try-fails

Now that we have 'owner' we can set **proto** for scope var 'this', 
so we can later validate `.x` in `this.x = 7`

      if owner
          .addMethodToOwner owner
          declare valid .scope.members.this.setMember
          .scope.members.this.setMember '**proto**',owner
          #set also **return type**
          .createReturnType


#### helper method addMethodToOwner(owner:NameDeclaration)  ## methods

      var actual = owner.findOwnMember(.name)
      if actual and .shim #shim for an exising method, do nothing
        return

Add to owner, type is 'Function'

      if no .nameDecl, .nameDecl = .declareName(.name,{type:globalPrototype('Function')})
      
      .declared = true

      .addMemberTo owner, .nameDecl


#### method createReturnType() ## functions & methods

      if no .nameDecl, return #nowhere to put definitions

Define function's return type from parsed text

      if .itemType

if there's a "itemType", it means type is: `TypeX Array`. 
We create a intermediate type for `TypeX Array` 
and set this new nameDecl as function's **return type**

          var composedName = .itemType.toString()+' Array'

check if it alerady exists, if not found, create one. Type is 'Array'
        
          var intermediateNameDecl = globalScope.members[composedName] 
                or globalScope.addMember(composedName,{type:globalPrototype('Array')})

item type, is each array member's type 

          intermediateNameDecl.setMember "**item type**", .itemType

          .nameDecl.setMember '**return type**', intermediateNameDecl

else, it's a simple type

      else 

          if .type then .nameDecl.setMember('**return type**', .type)


### Append to class Grammar.PropertiesDeclaration ###

     properties nameDecl, declared:boolean, scope:NameDeclaration

#### method declare(options) 
Add all properties as members of its owner object (normally: class.prototype)

        if .tryGetOwnerDecl(options) into var owner 

            for each varDecl in .list
                varDecl.nameDecl = varDecl.addMemberTo(owner,varDecl.name,{type:varDecl.type, itemType:varDecl.itemType})

            .declared = true

#### method processAppendTo() 
Add all properties as members of its owner (append to).
For undeclared properties only

        if not .declared, .declare({informError:true})

#### method evaluateAssignments() # determine type from assigned value on properties declaration

        for each varDecl in .list
            varDecl.getTypeFromAssignedValue



### Append to class Grammar.ForStatement ###

#### method declare()

a ForStatement has a 'Scope'. Add, if they exists, indexVar & mainVar

        declare valid .variant.indexVar:Grammar.VariableDecl
        declare valid .variant.mainVar:Grammar.VariableDecl
        declare valid .variant.iterable:Grammar.VariableRef

        .createScope
        if .variant.indexVar, .variant.indexVar.declareInScope

        if .variant.mainVar
            if .variant.iterable, default .variant.mainVar.type = .variant.iterable.itemType
            .variant.mainVar.declareInScope

        //debug:
        //.sayErr "ForStatement - pass declare"
        //console.log "index",.variant.indexVar, .indexNameDecl? .indexNameDecl.toString():undefined
        //console.log "main",.variant.mainVar, .mainNameDecl? .mainNameDecl.toString(): undefined


#### method evaluateAssignments() # Grammar.ForStatement

        declare valid .variant.iterable.getResultType

ForEachInArray:
If no mainVar.type, guess type from iterable's itemType

        if .variant instanceof Grammar.ForEachInArray
            if no .variant.mainVar.nameDecl.findOwnMember('**proto**')
                var iterableType:NameDeclaration = .variant.iterable.getResultType()          
                if iterableType and iterableType.findOwnMember('**item type**')  into var itemType
                    .variant.mainVar.nameDecl.setMember('**proto**',itemType)

ForEachProperty: index is string (property name)

        else if .variant instanceof Grammar.ForEachProperty
            .variant.indexVar.nameDecl.setMember('**proto**',globalPrototype('String'))


#### method validatePropertyAccess() # Grammar.ForStatement
ForEachInArray: check if the iterable has a .length property.

        if .variant instanceof Grammar.ForEachInArray

            declare valid .variant.iterable.getResultType

            var iterableType:NameDeclaration = .variant.iterable.getResultType()

            if no iterableType 
              #.sayErr "ForEachInArray: no type declared for: '#{.variant.iterable}'"
              do nothing
            else if no iterableType.findMember('length')
              .sayErr "ForEachInArray: no .length property declared in '#{.variant.iterable}' type:'#{iterableType.toString()}'"
              log.error iterableType.originalDeclarationPosition()


### Append to class Grammar.ExceptionBlock
`ExceptionBlock: (exception|catch) catchVar-IDENTIFIER Body [finally Body]`

      method declare()

Exception blocks have a scope

        .createScope
        .addToScope .catchVar,{type:globalPrototype('Error')}


### Append to class Grammar.NamespaceDeclaration

#### method declare()

if it's a simple IDENTIFIER, declare it in the scope

        if no .varRef.accessors

            .nameDecl = .addToScope(.declareName(.varRef.name))

else, a composed Identifier

        else
            #remove last accessors
            var lastAccessor = .varRef.accessors.pop

try to get a reference, without the last accessor. Add as member of reference

            if .varRef.tryGetReference({informError:true}) into var reference
                .nameDecl = .addMemberTo(reference,lastAccessor.name)

restore last accessor

            .varRef.accessors.push lastAccessor

        if .export and .nameDecl, .addToExport .nameDecl, .default

        .createScope



### Append to class Grammar.VariableRef ### Helper methods

`VariableRef: ['--'|'++']Identifier[Accessors]['--'|'++']`

`VariableRef` is a Variable Reference. 

#### method validatePropertyAccess() # Grammar.VariableRef

        if .parent is instance of Grammar.DeclareStatement, return

Start with main variable name, to check property names

        var actualVar = .tryGetFromScope(.name, {informError:true, isForward:true, isDummy:true})

now follow each accessor

        if no actualVar or no .accessors, return 

        for each ac in .accessors
            declare valid ac.name

for PropertyAccess, check if the property name is valid 

            if ac instanceof Grammar.PropertyAccess
              actualVar = .tryGetMember(actualVar, ac.name,{informError:true})

else, for IndexAccess, the varRef type is now 'itemType'
and next property access should be on defined members of the type

            else if ac instanceof Grammar.IndexAccess
                actualVar = actualVar.findMember('**item type**')

else, for FunctionAccess, the varRef type is now function's return type'
and next property access should be on defined members of the return type

            else if ac instanceof Grammar.FunctionAccess
                actualVar = actualVar.findMember('**return type**')

            if actualVar instanceof Grammar.VariableRef
                declare actualVar:Grammar.VariableRef
                actualVar = actualVar.tryGetReference({informError:true, isForward:true, isDummy:true})

            if no actualVar, break

        end for #each accessor

        return actualVar

#### helper method tryGetReference(options) returns NameDeclaration

evaluate this VariableRef. 
Try to determine referenced NameDecl.
if we can reach a reference, return reference

        default options=
          informError: undefined

Start with main variable name

        var actualVar = .tryGetFromScope(.name, options)
        if no actualVar, return

now check each accessor
        
        if no .accessors, return actualVar

        var partial = .name

        for each ac in .accessors
            declare valid ac.name

for PropertyAccess

            if ac instanceof Grammar.PropertyAccess
                actualVar = .tryGetMember(actualVar, ac.name, options)

else, for IndexAccess, the varRef type is now 'itemType'
and next property access should be on defined members of the type

            else if ac instanceof Grammar.IndexAccess
                actualVar = .tryGetMember(actualVar, '**item type**')

else, for FunctionAccess, the varRef type is now function's return type'
and next property access should be on defined members of the return type

            else if ac instanceof Grammar.FunctionAccess
                actualVar = .tryGetMember(actualVar, '**return type**')

check if we can continue on the chain

            if actualVar isnt instance of NameDeclaration
              actualVar = undefined
              break
            else
              partial += ac.toString()

        end for #each accessor

        if no actualVar and options.informError
            .sayErr "'#{this}'. Reference can not be analyzed further than '#{partial}'"

        return actualVar

#### Helper Method getResultType() returns NameDeclaration
      
      return .tryGetReference()

-------


### Append to class Grammar.AssignmentStatement ###

#### method declareByAssignment()

Here we check for lvalue VariableRef in the form:

`exports.x = xx`, `module.exports.x = xx` and `xx.prototype.yy =`

We consider this assignments as 'declarations' of members rather than variable references to check.

Start with main variable name

        var varRef = .lvalue

        var keywordFound

        if varRef.name is 'exports' #start with 'exports'
            keywordFound = varRef.name

        if no varRef.accessors 

          if keywordFound # is: `exports = x`, it does not work in node-js
              .sayErr "'exports = x', does not work. You need to do: 'module.exports = x'"

          return # no accessors to check

        var actualVar = .findInScope(varRef.name)
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
              actualVar = .addMemberTo(actualVar,createName) # create x on module.exports

            #try to execute assignment, so exported var points to content
            var content = .rvalue.getResultType({informError:true}) 
            if content instanceof NameDeclaration
                actualVar.makePointTo content


#### method evaluateAssignments() ## Grammar.AssignmentStatement 
    
check if we've got a a clear reference.

      var reference = .lvalue.tryGetReference()
      if reference isnt instanceof NameDeclaration, return 
      if reference.findOwnMember('**proto**'), return #has a type already

check if we've got a clear rvalue.
if we do, set type for lvalue (unless is "null" or "undefined", they destroy type info)

      reference.assignTypeFromValue .rvalue


### Append to class Grammar.Expression ###

#### Helper Method getResultType() returns NameDeclaration
Try to get return type from a simple Expression

        declare valid .root.getResultType
        return .root.getResultType() # .root is Grammar.Oper or Grammar.Operand


### Append to class Grammar.Oper ###

for 'into var x' oper, we declare the var, and we deduce type

#### Method declare() 
        
        if .intoVar # is a into-assignment operator with 'var' declaration

            var varRef = .right.name
            if varRef isnt instance of Grammar.VariableRef
                .throwError "Expected 'variable name' after 'into var'"

            if varRef.accessors 
                .throwError "Expected 'simple variable name' after 'into var'"
            
            .addToScope .declareName(varRef.name,{type:varRef.type})

#### method evaluateAssignments() 
    
for into-assignment operator

      if .name is 'into' # is a into-assignment operator

check if we've got a clear reference (into var x)

          if .right.name instance of Grammar.VariableRef

              declare valid .right.name.tryGetReference
              var nameDecl = .right.name.tryGetReference()

              if nameDecl isnt instanceof NameDeclaration, return 
              if nameDecl.findOwnMember('**proto**'), return #has a type already

check if we've got a clear .left (value to be assigned) type
if we do, set type for .rigth ('into var x') (unless is "null" or "undefined", they destroy type info)

              nameDecl.assignTypeFromValue .left


#### Helper Method getResultType() returns NameDeclaration
Try to get return type from this Oper (only for 'new' unary oper)

        declare valid .right.getResultType

        if .name is 'new'
            return .right.getResultType() #.right is Grammar.Operand


### Append to class Grammar.Operand ###

#### Helper Method getResultType() returns NameDeclaration
Try to get return type from this Operand

        declare valid .name.type
        declare valid .name.getResultType
        declare valid .name.tryGetReference

        if .name instance of Grammar.ObjectLiteral
            return .name.getResultType()

        else if .name instance of Grammar.Literal
            return globalPrototype(.name.type)

        else if .name instance of Grammar.VariableRef
            return .name.tryGetReference()


### Append to class Grammar.DeclareStatement
#### method declare() # pass 1, declare as props

declare valid x.y.z

declare on x

      if .specifier is 'on'

          var reference = .tryGetFromScope(.name,{isForward:true})

          if String.isCapitalized(reference.name)
              declare valid reference.members.prototype
              if no reference.members.prototype
                  reference.addMember('prototype')
              reference=reference.members.prototype

          for each varDecl in .names
              .addMemberTo reference, varDecl.createNameDeclaration()

else: declare (VariableDecl,)

      else

          for each varDecl in .names

            varDecl.nameDecl = varDecl.createNameDeclaration()

            if .global or .specifier is 'global'
                declare valid project.root.addToScope
                project.root.addToScope varDecl.nameDecl

            if .specifier is 'affinity'
                var classDecl = .getParent(Grammar.ClassDeclaration)
                if no classDecl
                    .sayErr "'declare name affinity' must be included in a class declaration"
                    return
                #add as member to nameAffinity, referencing class decl (.nodeDeclared)
                varDecl.nameDecl.nodeDeclared = classDecl
                nameAffinity.addMember varDecl.nameDecl

            else if .specifier is 'forward'
                do nothing

if .specifier is 'types', the type will be converted on next passes over the created NameDeclaration.
On the method validatePropertyAccess(), types will be switched "on the fly" while checking property access.


#### method validatePropertyAccess() # Grammar.DeclareStatement ###

declare var:type. alter on the fly scope var "types"

      if .specifier is 'types'

          for each varDecl in .names
              if .tryGetFromScope(varDecl.name,{informError:true}) into var mainVar
                  if varDecl.nameDecl.findOwnMember('**proto**') into var declaredType # has type
                      mainVar.setMember '**proto**', declaredType

declare members on the fly 

      else if .specifier is 'valid'
          var actualVar = .tryGetFromScope(.varRef.name,{informError:true})
          for each ac in .varRef.accessors
            declare valid ac.name

            if ac isnt instance of Grammar.PropertyAccess, break
            
            if ac.name is 'prototype'
                actualVar = actualVar.findOwnMember(ac.name) or .addMemberTo(actualVar, ac.name)  
            else
                actualVar = actualVar.findMember(ac.name) or .addMemberTo(actualVar, ac.name)

            if this.type #create type on the fly
                actualVar.setMember '**proto**', this.type
                actualVar.processConvertTypes


