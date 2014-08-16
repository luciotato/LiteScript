
Dependencies
------------

    import ASTBase,Grammar,logger

    shim import LiteCore

Module vars

    public var allNameDeclarations: Declaration array = [] #array with all NameDeclarations created


### public Class Declaration

#### properties

        name: string
        members: Map string to Declaration
        parent: Declaration

        nodeDeclared: ASTBase
        nodeClass //VariableDecl(var&props)|MethodDeclaration|NamespaceDeclaration|ClassDeclaration

        /*isFunction: boolean // true if nodeDeclared instanceof FunctionDeclaration or this is a global function
        isClass: boolean // true if nodeDeclared.constructor is ClassDeclaration or this is a core Class
        isNamespace: boolean // true if nodeDeclared.constructor is NamespaceDeclaration or Module
        */

        normalizeModeKeepFirstCase: boolean

        isScope: boolean
        isPublicVar: boolean

        type, itemType
        value

        isForward
        isDummy


     declare name affinity nameDecl

#### constructor new Declaration(name, options:NameDeclOptions, node:ASTBase)
      
      .name = name.toString()
      .members = new Map // string to Declaration //contained Declarations

try to determine nodeClass from node.nodeDeclared

      .nodeDeclared = node
      if node 
          .nodeClass = node.constructor
          case .nodeClass 
              when 
                Grammar.ImportStatementItem 
                Grammar.DeclareStatement
                Grammar.WithStatement
                Grammar.ArrayLiteral
                Grammar.ExceptionBlock:
                    .nodeClass = Grammar.VariableDecl 

              when
                Grammar.ObjectLiteral, Grammar.FreeObjectLiteral:
                    .nodeClass = Grammar.NameValuePair

      end if


      if options 
          
          if options.nodeClass, .nodeClass = options.nodeClass

          if options.normalizeModeKeepFirstCase, .normalizeModeKeepFirstCase=true

if it 'points' to another namedecl, it uses other nameDecl's '.members={}'
effectively working as a pointer

          if options.pointsTo 
              .members = options.pointsTo.members
          else 
              if options.type, .setMember('**proto**',options.type)
              if options.itemType, .setMember('**item type**',options.itemType)
              if options.returnType, .setMember('**return type**',options.returnType)
              if options.value, .setMember('**value**',options.value)
              
          if options.isForward, .isForward = true
          if options.isDummy, .isDummy = true

          if options.isForward or options.isDummy and no .nodeClass, .nodeClass = Grammar.VariableDecl


Check for a valid nodeclass

      if no .nodeClass 
          or .nodeClass not in [  
              Grammar.NamespaceDeclaration
              Grammar.ClassDeclaration
              Grammar.PropertiesDeclaration //first level properties
              Grammar.NameValuePair //2nd level properties & ObjectLiteral members
              Grammar.FunctionDeclaration
              Grammar.MethodDeclaration
              Grammar.VariableDecl
              ]
          
            fail with "new Declaration, nodeClass is undefined or invalid: #{.nodeClass? .nodeClass.name:.nodeClass}"

set .isFunction flag

    /* if .nodeClass instanceof Grammar.FunctionDeclaration, .isFunction = true //fn, method & constructors

      if .nodeClass instanceof Grammar.FunctionDeclaration, .isFunction = true //fn, method & constructors

      case .nodeClass
          when Grammar.NamespaceDeclaration: .isNamespace = true
          when Grammar.ClassDeclaration: .isClass = true
    */

keep a list of all NameDeclarations

      allNameDeclarations.push this


#### Helper method normalize(name)
        if .normalizeModeKeepFirstCase 
            return normalizeKeepFirst(name) //first letter keeps its case
        else
            return normalizeToLower(name) //all lowercase


#### Helper method setMember(name,value)
force set a member

        if name is '**proto**'
            # walk all the **proto** chain to avoid circular references
            var nameDecl = value
            do 
                if nameDecl isnt instance of Declaration, break #a nameDecl with a string yet to be de-reference
                if nameDecl is this, return #circular ref, abort setting 
            loop while nameDecl.members.get(name) into nameDecl #next in chain

        end if #avoid circular references

        #set member
        .members.set .normalize(name), value

#### Helper method findOwnMember(name) returns Declaration
this method looks for 'name' in Declaration members

        return .members.get(.normalize(name))

#### Helper method ownMember(name) returns Declaration
this method looks for a specific member, throws if not found

        if no .findOwnMember(name) into var result
          .sayErr "No member named '#{name}' on #{.info()}"

        return result

#### Helper method getMemberCount 
        return .members.size

#### Helper method replaceForward ( realNameDecl: Declaration )
This method is called on a 'forward' Declaration
when the real declaration is found.
We mix in all members from realNameDecl to this declaration 
and maybe remove the forward flag.

        declare on realNameDecl
          members

mix in found namedecl here

        for each key,member in map realNameDecl.members
          declare member:Declaration
          member.parent = this
          .members.set key,member

        .isForward = realNameDecl.isForward

        if realNameDecl.nodeDeclared
          .nodeDeclared = realNameDecl.nodeDeclared

        return true

#### helper method makePointTo(nameDecl:Declaration)
        
        if nameDecl isnt instance of Declaration, fail with "makePointTo: not a Declaration"

        # remove existing members from nameDeclarations[]
        .isForward = false
        for each memberDecl in map .members
          allNameDeclarations.remove memberDecl

        #save a copy of this.members pointer
        var thisMembers = this.members

        #"point to" means share "members" object 
        this.members = nameDecl.members
        //since we get the members, we must also respect the same normalization mode
        this.normalizeModeKeepFirstCase = nameDecl.normalizeModeKeepFirstCase
        this.nodeClass = nameDecl.nodeClass //and other data
        this.isPublicVar = nameDecl.isPublicVar

        #other nameDecl pointing here are redirected
        for each other in allNameDeclarations
            if other.members is thisMembers
                other.members = nameDecl.members

#### helper method positionText 

        if .nodeDeclared
            return .nodeDeclared.positionText()
        else
          return "(compiler-defined)"


#### helper method originalDeclarationPosition 
        return "#{.positionText()} for reference: original declaration of '#{.name}'"


#### helper method sayErr(msg) 
        logger.error "#{.positionText()} #{.info()} #{msg}"

#### helper method warn(msg) 
        logger.warning "#{.positionText()} #{.info()} #{msg}"

#### helper method caseMismatch(text, actualNode:ASTBase) 
If this item has a different case than the name we're adding, emit error

        if .name isnt text # if there is a case mismatch

            logger.error "#{actualNode? actualNode.positionText():.positionText()} CASE MISMATCH: '#{text}'/'#{.name}'"
            logger.error .originalDeclarationPosition() #add original declaration line info
            return true

#### helper method addMember(nameDecl:Declaration, options:NameDeclOptions, nodeDeclared) returns Declaration
Adds passed Declaration to .members
Reports duplicated.
returns: Identifier
        
convert to Declaration

        if nameDecl isnt instance of Declaration
            nameDecl = new Declaration(nameDecl, options, nodeDeclared or .nodeDeclared)

        logger.debug "addMember: '#{nameDecl.name}' to '#{.name}'" #[#{.constructor.name}] name:

        if no .members
          fail with "no .members in [#{.constructor.name}]"

        var normalized = .normalize(nameDecl.name) 

        if not .members.get(normalized) into var found:Declaration
            .members.set normalized, nameDecl
            nameDecl.parent = this
            return nameDecl

else, found.

If the found item has a different case than the name we're adding, emit error & return

        if found.caseMismatch(nameDecl.name, nodeDeclared or nameDecl.nodeDeclared)
            return nameDecl

if replaceSameName option set, replace found item with new item

            .members.set normalized, nameDecl

else, if the previously defined found item was a "forward" declaration, we add the nameDecl 
"childs" to pre-existent found declaration and remove the forward flag

        else if found.isForward
            found.replaceForward nameDecl
            return found

else, if it wasnt a forward declaration, then is a duplicated error

        else 
            logger.error "#{nameDecl.positionText()}. DUPLICATED name: '#{nameDecl.name}'"
            logger.error "adding member '#{nameDecl.name}' to '#{.name}'"
            logger.error found.originalDeclarationPosition() #add extra information line

        return nameDecl


#### helper method toString() 
        #note: parent may point to a different node than the original declaration, if makePointTo() was used
        return .name
  
#### helper method composedName() 
        var name = .name
        if .parent and .parent.name isnt 'prototype' and not .parent.name.endsWith('Scope]')
          name = "#{.parent.name}.#{name}"
        return name

#### helper method info() 

        var type = ""
        
        if .nodeClass is Grammar.ClassDeclaration
            type = 'Class'

        else
            var nameDecltype = .findOwnMember('**proto**')
            if nameDecltype instanceof Declaration
                type = nameDecltype.name
                if nameDecltype.parent and nameDecltype.parent.name isnt "Project Root Scope" 
                    if type is 'prototype'
                        type = nameDecltype.parent.name
                    else
                        type = "#{nameDecltype.parent.name}.#{type}"
                    end if 
                
                if no type and .nodeClass is Grammar.ImportStatement, type="import"

            else
                if .nodeDeclared and .nodeDeclared.type, type=.nodeDeclared.type
        end if

        if type, type=":#{type}" //prepend :

        return "'#{.composedName()}#{type}'"


#Module helper functions 
exported as members of export default class Declaration

### helper function fixSpecialNames(text:string)

      if text in ['__proto__','NaN','Infinity','undefined','null','false','true','constructor'] # not good names
        return '|#{text}|'
      else
        return text

### helper function normalizeToLower(text:string) returns string
we do not allow two names differing only in upper/lower case letters

      if text.charAt(0) is "'" or text.charAt(0) is '"' #Except for quoted names
          return text

      return fixSpecialNames(text.toLowerCase())

### helper function normalizeKeepFirst(text:string) returns String
Normalization for vars means: 1st char untouched, rest to to lower case.

By keeping 1st char untouched, we allow "token" and "Token" to co-exists in the same scope.
'token', by name affinity, will default to type:'Token'

      return fixSpecialNames( "#{text.slice(0,1)}#{text.slice(1).toLowerCase()}" )

### helper function isCapitalized(text:string) returns boolean 

      if text and text.charAt(0) is text.charAt(0).toUpperCase()  and 
          ( text.length is 1 or text.charAt(1) is text.charAt(1).toLowerCase()) 
              return true

      return false


### export class NameDeclOptions
        properties

            normalizeModeKeepFirstCase: boolean

            pointsTo : Declaration

            type, itemType, returnType 
            
            nodeClass: ASTBase

            isForward, isDummy
            informError: boolean
            value 


