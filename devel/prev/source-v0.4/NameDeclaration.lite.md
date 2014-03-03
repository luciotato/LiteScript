
Dependencies
------------

    import ASTBase,Grammar,log
    var debug = log.debug

### public class NameDeclaration

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
      
      .name = name
      .members = {}
      .nodeDeclared = node

      declare on options
        pointsTo:NameDeclaration, type, itemType, value, isForward, isDummy

      if options 

if it 'points' to another namedecl, it uses other nameDecl's '.members={}'
effectively working as a pointer

        if options.pointsTo 
            .members = options.pointsTo.members
        else 
          if options.type, .setMember('**proto**',options.type)
          if options.itemType, .setMember('**item type**',options.itemType)
          if options.hasOwnProperty('value'), .setMember('**value**',options.value)
            
        if options.isForward, .isForward = true
        if options.isDummy, .isDummy = true

keep a list of all NameDeclarations

      NameDeclaration.allOfThem.push this


#### Helper method setMember(name,nameDecl)
force set a member

        if name is '**proto**' #setting type
          if nameDecl is this, return  #avoid circular type defs

        .members[normalizePropName(name)]=nameDecl

#### Helper method findOwnMember(name) returns NameDeclaration
this method looks for 'name' in NameDeclaration members

        var normalized = normalizePropName(name)
        if .members.hasOwnProperty(normalized)
          return .members[normalized]



#### Helper method ownMember(name)
this method looks for a specific member, throws if not found

        var normalized = normalizePropName(name)
        if .members.hasOwnProperty(normalized)
          return .members[normalized]

        .sayErr "No member named '#{name}' on #{.info()}"


#### Helper method replaceForward ( realNameDecl: NameDeclaration )
This method is called on a 'forward' NameDeclaration
when the real declaration is found.
We mix in all members from realNameDecl to this declaration 
and maybe remove the forward flag.

        declare on realNameDecl
          members

mix in members

        for each member in Object.keys(realNameDecl.members)
          .addMember(member,{replaceSameName:true})

        .isForward = realNameDecl.isForward

        if realNameDecl.nodeDeclared
          .nodeDeclared = realNameDecl.nodeDeclared

        return true




#### helper method makePointTo(nameDecl:NameDeclaration)
        
        if nameDecl isnt instance of NameDeclaration, fail with "makePointTo: not a NameDeclaration"

        # remove existing members from nameDeclarations[]
        .isForward = false
        for each property name in .members
          var memberDecl:NameDeclaration = .members[name]
          NameDeclaration.allOfThem.remove memberDecl

        #save a copy of this.members pointer
        var thisMembers = this.members

        #"point to" means share "members" object 
        this.members = nameDecl.members

        #other nameDecl pointing here are redirected
        for each other in NameDeclaration.allOfThem
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
        log.error "#{.positionText()} #{.info()} #{msg}"

#### helper method warn(msg) 
        log.warning "#{.positionText()} #{.info()} #{msg}"

#### helper method caseMismatch(text, actualNode:ASTBase) 
If this item has a different case than the name we're adding, emit error

        if .name isnt text # if there is a case mismatch

            log.error "#{actualNode? actualNode.positionText():.positionText()} CASE MISMATCH: '#{text}'/'#{.name}'"
            log.error .originalDeclarationPosition() #add original declaration line info
            return true


#### helper method addMember(nameDecl:NameDeclaration, options, nodeDeclared) 
Adds passed NameDeclaration to .members[].
Reports duplicated.
returns: Identifier
        
        declare valid options.replaceSameName

        declare dest:NameDeclaration
        declare found:NameDeclaration

        if not (nameDecl instanceof NameDeclaration)
          nameDecl = new NameDeclaration(nameDecl, options, nodeDeclared or .nodeDeclared)
          //fail with "not nameDecl instanceof NameDeclaration"

        if no options
          options={}

        debug "addMember: '#{nameDecl.name}' to '#{.name}'" #[#{.constructor.name}] name:

        var dest = this
        if no .members
          fail with "no .members in [#{.constructor.name}]"

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
        return .name
  
#### helper method composedName() 
        var name = .name
        if .parent and .parent.name isnt "Project Root Scope"
          name = .parent.name+'.'+name
        return name

#### helper method info() 

        var type = ""
        
        var nameDecltype = .findOwnMember('**proto**')
        if nameDecltype instanceof NameDeclaration
          type = nameDecltype.name
          if nameDecltype.parent and nameDecltype.parent.name isnt "Project Root Scope"
              if type is 'prototype'
                  type = nameDecltype.parent.name
              else
                  type = "#{nameDecltype.parent.name}.#{type}"
              end if 
        else
          type='Object'

        return "'#{.composedName()}:#{type}'"


#Module helper functions

### helper function fixSpecialNames(text:string)

      if text in ['__proto__','NaN','Infinity','undefined','null','false','true'] # not good names
        return '|'+text+'|'
      else
        return text

### helper function normalizePropName(text:string) returns string

we do not allow two names differing only in upper/lower case letters

      if text[0] is "'" or text[0] is '"' #Except for quoted names
          return text

      return fixSpecialNames(text.toLowerCase())


include module helper functions: "normalizePropName" and "fixSpecialNames"
as properties of namespace/class NameDeclaration

    append to namespace NameDeclaration
      properties
        normalizePropName = normalizePropName 
        fixSpecialNames = fixSpecialNames

##Exports is namespace/class NameDeclaration

    module.exports = NameDeclaration
