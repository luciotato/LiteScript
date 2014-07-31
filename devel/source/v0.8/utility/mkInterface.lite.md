mkInterface - creates a name.interface.md from a "require(name)"

Dependencies
------------

//    import Map

    
##Main

    var moduleName = process.argv[2]

    if no moduleName
        print """ 
            usage: mkInterface name

            where "name" is the name of a module to "require()"

            a .interface.md file will be generated for the loaded module

        """
        process.exit 1

    var requiredModule = require(moduleName)

    var mainOut = new Output
    
    var foundClasses = [] //clear

    var mainNameDecl = new NameDeclaration(moduleName, requiredModule)

    mainNameDecl.processMain mainOut

    mainOut.printAll


### class Output

        declare name affinity out

        properties

            text: string array = []
            indentSpace = '    '
            headers: string array = []
            pendingHeaders


        method indent
            .indentSpace += '    '

        method deindent
            .indentSpace = .indentSpace.slice(4)
        
        method setHeader(s:string)
            .headers.push .indentSpace + s
            .pendingHeaders = .headers.length

        method clearHeader
            .headers.pop
            .pendingHeaders = .headers.length

        method push(s:string)

            if s
                for inx=0 while inx<.pendingHeaders
                    .text.push .headers[inx]
                    .headers[inx]=undefined
                end for
                .pendingHeaders=0

            .text.push .indentSpace + s


        method printAll

            for each string in .text
                print string



### class NameDeclaration

        properties
            parent: NameDeclaration
            name
            type
            params: string
            members: map string to NameDeclaration
            pointer


        constructor new NameDeclaration(name, obj, parent)
            .name = name
            .pointer = obj
            .parent = parent

            .type = typeof obj

            if .type is 'function'
                var source= obj.toString()
                .params = source.slice(source.indexOf('('),source.indexOf('{'))

            declare valid obj.prototype
            if .type is 'function' and obj.prototype and Object.getOwnPropertyNames(obj.prototype).length>4
                .type='class'
                for each nameDecl in foundClasses
                    if nameDecl.name is this.name, return #do not duplicate
                foundClasses.push this


---------

        method processMain(out, comment)

                .getMembersFromObjProperties

                if .type isnt 'class'
                    out.indentSpace = '    '
                    out.push ""
                    out.push 'namespace '+.toString()
                    .pushMethodsAndProperties out

                //while found classes
                while foundClasses.length
                    var nameDecl = foundClasses.shift()
                    nameDecl.processClass out


        method processClass(out, comment)

                .getMembersFromObjProperties

                out.indentSpace = '    '
                out.push ""
                out.push ""
                out.push 'public '+.type+' '+.name

                // constructor
                if .params 
                    out.indent
                    out.push 'constructor new '+.name+' '+.params
                    out.deindent

                // out props from prototype
                var ptrNameDecl = .members.get("_prototype")
                ptrNameDecl.pushMethodsAndProperties out

                //now as namespace 
                .processAppendToNamespace out


        method processAppendToNamespace(out)

                out.indentSpace = '    '
                out.setHeader ""
                out.setHeader 'append to namespace '+.name
                .pushMethodsAndProperties out
                out.clearHeader
                out.clearHeader


        method pushMethodsAndProperties(out, comment)

                //properties 
                out.indent
                out.setHeader 'properties'
                out.indent
                for each key,nameDecl in map .members
                    where nameDecl.type isnt 'function' 
                        and nameDecl.type isnt 'class'
                        and nameDecl.name isnt 'prototype'
                        
                        nameDecl.pushMembers out
                        //out.push indent+'#{protoypeMember.name}:#{protoypeMember.type}'

                out.clearHeader
                out.deindent

                //out.setHeader ""
                //out.setHeader "//methods"
                out.setHeader ""
                
                for each key,methodNameDecl in map .members
                    where methodNameDecl.type is 'function'
                        out.push "method #{methodNameDecl.name}#{methodNameDecl.params or ''}"
                
                out.clearHeader
                //out.clearHeader
                //out.clearHeader
                //out.push ""

                out.deindent

        declare name affinity nameDecl

        helper method pushMembers(out) #recursive

recursively writes a object declaration

            if .name not like /^[a-zA-Z$_]+$/, return # exclude strange/private names

            if .type is 'object' and .members

                out.setHeader '#{.name}:'
                for each key,nameDecl in map .members
                    out.indent
                    nameDecl.pushMembers out
                    out.deindent
                out.clearHeader
            
            else if .type is 'class'
                do nothing
                //out.push '#{.name}:#{"function"}#{.params or ""} #CLASS'

            else                
                out.push '#{.name}:#{.type}#{.params or ""}'
            end if


----

        helper method getMembersFromObjProperties() returns array #Recursive

Recursively converts a obj properties in NameDeclarations.
it's used when a pure.js module is imported by 'require'
to convert required 'exports' to LiteScript compiler usable NameDeclarations
Also to load the global scope with built-in objects

            if .pointer instanceof Object //or obj is Object.prototype

              for each prop in Object.getOwnPropertyNames(.pointer) #even not enumerables
                where prop isnt '__proto__' # exclude __proto__ 
                    and prop isnt 'super_' # exclude 
                    and prop isnt 'constructor' # exclude 
                    # and exclude 'function' core props
                    and not (typeof .pointer is 'function' and prop in ['caller','arguments','length','name'])

                    var value = .pointer[prop]

                    //create
                    var newMember = new NameDeclaration(prop,value,this)

                    //print newMember.toString()
                    if no .members, .members = new Map
                    .members.set NameDeclaration.normalize(prop), newMember

                    if newMember.type isnt 'class'

                        if value instanceof Object 
                            and not .isInParents(value)
                            and .countDepth()<2

                            newMember.getMembersFromObjProperties #recursive

        end method


        helper method countDepth()
            var result = 0        
            var nameDecl = this.parent
            while nameDecl
              result++
              nameDecl = nameDecl.parent
            return result


        helper method isInParents(value)

return true if a property name is in the parent chain.
Used to avoid recursing circular properties
        
            var nameDecl = this.parent
            while nameDecl
              if nameDecl.pointer is value,return true
              nameDecl = nameDecl.parent

        end helper method

        helper method toString

            var result=.name 
            var a=.parent
            while a
                result=a.name+'.'+result
                a=a.parent

            return "#{result}"


    Append to namespace NameDeclaration
        method normalize(name)
            return "_"+name;



### helper class Map
        properties
            dict:Object
            size

        method clear()
            .dict= new Object
            .size=0

        constructor new Map
            .clear
            
To keep compatibility with ES6, we have a special "Map.fromObject()"
used to create a Map from a Literal Object. 
We can't use default Map constructor, since ES6 Map constructor is: new Map([iterator])

        method fromObject(object)
            .dict = object
            .size = Object.keys(.dict).length
            return this

        method set(key:string, value)
            if no .dict.hasOwnProperty(key), .size++
            .dict[key]=value

        method setProperty(name:string, value) //use Map|Object interchangeably
            .dict[name] = value

        method delete(key:string)
            if .dict.hasOwnProperty(key), .size--
            delete .dict[key]

        method get(key:string)
            return .dict[key]

        method tryGetProperty(key:string) //use Map|Object interchangeably
            return .dict[key]

        method has(key:string)
            return .dict has property key

        method hasProperty(key:string) //use Map|Object interchangeably
            return .dict has property key

        method hasOwnProperty(key:string) //use Map|Object interchangeably
            return .dict has property key

        method keys() returns array
            return Object.keys(.dict)

        method getObjectKeys() returns array  //use Map|Object interchangeably
            return Object.keys(.dict)

        method forEach(callb)
            for each property propName,value in .dict
                callb(propName,value)


