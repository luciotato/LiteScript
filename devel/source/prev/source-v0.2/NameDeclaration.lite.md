

Dependencies
------------

    var ASTBase = require('./ASTBase')
    var Grammar = require('./Grammar')

    declare forward normalizePropName

### Public Class NameDeclaration

#### namespace properties # Namespace "NameDeclaration" (singleton) properties

        allOfThem: NameDeclaration array = [] #array with all NameDeclarations created

#### properties

      name: string
      members
      nodeDeclared: ASTBase
      parent: NameDeclaration
      type, itemType
      converted
      value
      isForward
      isDummy

     declare name affinity nameDecl

#### constructor(name, options, node)
      
      me.name = name
      me.members = {}
      me.nodeDeclared = node

      declare on options
        pointsTo:NameDeclaration, type, itemType, value, isForward, isDummy

      if options 

if it 'points' to another namedecl, it uses other nameDecl's '.members={}'
effectively working as a pointer

        if options.pointsTo 
            me.members = options.pointsTo.members
        else 
          if options.type, me.setMember('**proto**',options.type)
          if options.itemType, me.setMember('**item type**',options.itemType)
          if options.hasOwnProperty('value'), me.setMember('**value**',options.value)
            
        if options.isForward, me.isForward = true
        if options.isDummy, me.isDummy = true

keep a list of all NameDeclarations

      NameDeclaration.allOfThem.push me

#### Helper method setMember(name,nameDecl)
force set a member

        if name is '**proto**' and nameDecl is me
          #avoid circular type defs
          return

        me.members[normalizePropName(name)]=nameDecl

#### Helper method findOwnMember(name) returns NameDeclaration
this method looks for 'name' in NameDeclaration members

        var normalized = normalizePropName(name)
        if me.members.hasOwnProperty(normalized)
          return me.members[normalized]



#### Helper method ownMember(name)
this method looks for a specific member, throws if not found

        var normalized = normalizePropName(name)
        if me.members.hasOwnProperty(normalized)
          return me.members[normalized]

        me.sayErr "No member named '#{name}' on #{me.info()}"


#### Helper method replaceForward ( realNameDecl: NameDeclaration )
This method is called on a 'forward' NameDeclaration
when the real declaration is found.
We mix in all members from realNameDecl to this declaration 
and maybe remove the forward flag.

        declare on realNameDecl
          members

mix in members

        for member in Object.keys(realNameDecl.members)
          me.addMember(member,{replaceSameName:true})

        me.isForward = realNameDecl.isForward

        if realNameDecl.nodeDeclared
          me.nodeDeclared = realNameDecl.nodeDeclared

        return true




#### helper method makePointTo(nameDecl:NameDeclaration)
        
        if nameDecl isnt instance of NameDeclaration, fail with "makePointTo: not a NameDeclaration"

        # remove existing members from nameDeclarations[]
        me.isForward = false
        for each property name in me.members
          var memberDecl:NameDeclaration = me.members[name]
          NameDeclaration.allOfThem.remove memberDecl

        #save a copy of this.members pointer
        var thisMembers = this.members

        #"point to" means share "members" object 
        this.members = nameDecl.members

        #other nameDecl pointing here are redirected
        for each other in NameDeclaration.allOfThem
            if other.members is thisMembers
                other.members = nameDecl.members

#### Helper Method getMembersFromObjProperties(obj) #Recursive
Recursively converts a obj properties in NameDeclarations.
it's used when a pure.js module is imported by 'require'
to convert required 'exports' to LiteScript compiler usable NameDeclarations
Also to load the global scope with built-in objects

        var newMember:NameDeclaration

        if obj instanceof Object or obj is Object.prototype
            for each prop in Object.getOwnPropertyNames(obj)
                if prop isnt '**proto**'
                    newMember = me.addMember(prop)
                    if prop is 'prototype'
                      #2nd level only for 'protoype' 
                      newMember.getMembersFromObjProperties(obj[prop]) #recursive


#### helper method positionText 

        if me.nodeDeclared
            return me.nodeDeclared.positionText()
        else
          return "(built-in)"


#### helper method originalDeclarationPosition 
        return "#{me.positionText()} for reference: original declaration of '#{me.name}'"


#### helper method sayErr(msg) 
        log.error "#{me.positionText()} '#{me.name}' #{msg}"

#### helper method warn(msg) 
        log.warning "#{me.positionText()} '#{me.name}' #{msg}"

#### helper method caseMismatch(text, actualNode:ASTBase) 
If this item has a different case than the name we're adding, emit error

        if me.name isnt text # if there is a case mismatch

            log.error "#{actualNode? actualNode.positionText():me.positionText()} CASE MISMATCH: '#{text}'/'#{me.name}'"
            log.error me.originalDeclarationPosition() #add original declaration line info
            return true


#### helper method addMember(nameDecl:NameDeclaration, options, nodeDeclared) 
Adds passed NameDeclaration to .members[].
Reports duplicated.
returns: Identifier
        
        declare valid options.replaceSameName

        declare dest:NameDeclaration
        declare found:NameDeclaration

        if not (nameDecl instanceof NameDeclaration)
          nameDecl = new NameDeclaration(nameDecl, options, nodeDeclared or me.nodeDeclared)
          //fail with "not nameDecl instanceof NameDeclaration"

        if no options
          options={}

        debug "addMember: '#{nameDecl.name}' to '#{me.name}'" #[#{me.constructor.name}] name:

        var dest = me
        if no me.members
          fail with "no .members in [#{me.constructor.name}]"

        var normalized = normalizePropName(nameDecl.name)

        if dest.members.hasOwnProperty(normalized)
          var found = dest.members[normalized]
          
        if not found
          dest.members[normalized] = nameDecl
          nameDecl.parent = dest
          return nameDecl

else, found.
If the found item has a different case than the name we're adding, emit error & return

        if found.caseMismatch(nameDecl.name, nodeDeclared or nameDecl.nodeDeclared)
            return nameDecl

if replaceSameName option set, replace found item with new item

            dest.members[normalized] = nameDecl

else, if the previously defined found item was a "forward" declaration, we add the nameDecl 
"childs" to pre-existent found declaration and remove the forward flag

        else if found.isForward
            found.replaceForward nameDecl
            return found

else, if it wasnt a forward declaration, then is a duplicated error

        else 
            log.error "#{nameDecl.positionText()}. DUPLICATED property name: '#{nameDecl.name}'"
            log.error found.originalDeclarationPosition() #add extra information line
            if no nameDecl.nodeDeclared, console.trace

        return nameDecl


#### helper method toString() 
        #note: parent may point to a different node than the original declaration, if makePointTo() was used
        return me.name
  
#### helper method info() 

        var type = ""
        var nameDecltype = me.findOwnMember('**proto**')
        if nameDecltype instanceof NameDeclaration
          type = nameDecltype.name
          if nameDecltype.parent
              if type is 'prototype'
                  type = nameDecltype.parent.name
              else
                  type = "#{nameDecltype.parent.name}.#type"
              end if 
        else
          type='Object'

        return "'#{me.name}:#type'"


#Module helper functions

### helper function fixSpecialNames(text:string)

      if text in ['__proto__','NaN','Infinity','undefined','null','false','true'] # not good names
        return '|'+text+'|'
      else
        return text

### helper function normalizePropName(text:string) returns string

      #we do not allow two names differing only in upper/lower case letters
      return fixSpecialNames(text.toLowerCase())


include module helper functions: "normalizePropName" and "fixSpecialNames"
as properties of namespace/class NameDeclaration

    append to namespace NameDeclaration
      properties
        normalizePropName = normalizePropName 
        fixSpecialNames = fixSpecialNames

##Exports is namespace/class NameDeclaration

    module.exports = NameDeclaration
