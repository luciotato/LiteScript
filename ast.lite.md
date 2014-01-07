The Abstract Syntax Tree (AST)
------------------------------

This module defines error classes and the base abstract syntax tree class used by the parser and grammar. It's main purpose is to provide utility methods to parse the token array into classes that inherit from `ASTBase`.


-------------------------------------------------------------------------------------
Declarations for external of forward symbols

    compiler declare on ASTBase
        opt
        out
        spacesIndent
        listArgs

    compiler declare on lexer
        posToString
        getPos
        setPos
        token      
        lineInfo
        sourceLineNum
        nextToken
        index
        hardError
        outStartNewLine

    compiler declare on err
        controled

    compiler declare on token
        type
        value

public Class ParseFailed
========================

During a node.parse(), if there is a mismatch, a ParseFailed error is raised.
`ParseFailed` signals that the class failed to parse the tokens from the stream, 
however the syntax might still be valid for another AST node. 
If the AST node was locked-on-target, it is a hard-error.
If the AST node was NOT locked, it's a Soft-error, and will not abort compilation 
as the parent node will try other AST classes against the token stream before failing.

      method initialize(message)
        me.message = message


public Class ASTBase
====================

This class serves as a base class on top of which AST nodes are defined.
It contains basic functions to parse the token stream.
     
      properties
        parentNode
        locked
        lexer
        sourceLineNum
        column
        lineInx
        indent

Constructor(lexer, parent)
--------------------------

Control arguments

        if not lexer 
          fail with 'call to new ASTBase: lexer is null'

The object is initially marked as "unlocked",
indicating that we are not sure that this is the right node to parse this segment of the token stream.
We can't declare syntax errors until we are sure this is the right class.

        me.locked = false

        me.parentNode = parent

Link to the token stream and helper functions

        me.lexer = lexer

Remember this node source position

        me.sourceLineNum = lexer.sourceLineNum
        me.column = lexer.token.column

Also remeber line index in tokenized lines, and this line indent

        me.lineInx = lexer.lineInx
        me.indent = lexer.indent


      end constructor


method lock()
-------------

**lock** marks this class as locked, meaning we are certain this is the correct class
for the given syntax. For example, if the `FunctionExpression` class sees the IDENTIFIER `function`,
we are certain this is the correct class to use. Once locked, any invalid syntax causes compilation to fail.

`lock` can be called multiple times to update the line number. If a node spans multiple lines,
this is useful because the line number is reported in the error message.

        me.locked = on

method toString()
        return typeof me

method throwError(msg)
----------------------

adds lexer position info and throws a 'controled' error

        me.lock() # lock() to ensure a hard-error

        var err = new Error( msg + me.lexer.posToString())
    
        err.controled = true

        throw err


method throwParseFailed(msg)
----------------------------

throws a `ParseFailed` error

        if me.locked #is a hard-error
          me.throwError(msg)

        else #is a soft-error          
          var pf = new ParseFailed(msg)
          pf.controled = true
          throw pf

------------------------------------------------------------------------

method parse()
--------------

**parse()** is an abstract method representing the TRY-Parse of the node.
Child classes _must_ override this method

        me.lock()
        me.throwParseFailed 'Parser Not Implemented: ' + me.constructor.name


method produce()
---------------

**produce()** is the method to produce target code
Child classes should override this, if the default production isnt: `me.out me.name`

        me.out me.name


method parseDirect(key,directObj)
---------------------------------

We use a DIRECT associative array to pick the exact AST node to parse 
based on the actual token value or type.
This speeds up parsing, avoiding parsing by trial & error

        if directObj.hasOwnProperty(key)
          var directASTNode = directObj[key]
          return me.opt(directASTNode)

      end method



method opt(list, options)
-------------------------

**opt** attempts to parse the token stream using one of the classes or token types specified.
This method takes a variable number of arguments.
For example:
  calling `me.opt IfStatement, Expression, 'IDENTIFIER'`
  would attempt to parse the token stream first as an `IfStatement`. If that fails, it would attempt
  to use the `Expression` class. If that fails, it will accept a token of type `IDENTIFIER`.
  If all of those fail, it will return `nothing`.

      
arguments control:
convert to array if it was a single element

        if not Array.isArray(list)
          list = [list]

check 2nd parameter not to be a string (common error)

        #debug - control
        if typeof options is 'string'
          me.throwError "compiler-internals: Check parameteres in opt/req call. Accepted parameter are: list[] (Array) and options (object). Check second parameter"

Remember the actual position, to rewind if all the arguments to `opt` fail

        var startPos = me.lexer.getPos()

        #debug
        var spaces = me.spacesIndent()

For each argument, -a class or a string-, we will attempt to parse the token stream 
with the class, or match the token type to the string.

        for searched in list

          #debug - control
          if typeof searched is 'string' and searched isnt searched.toUpperCase()
            me.throwError "compiler-internals: a call to req('#{searched}') was made, but '#{searched}' is not UPPERCASE. Do you mean to call reqValue()?"

For strings we check the token **type**, and return the token value if the type match

          if typeof searched is 'string'

            #debug spaces, me.constructor.name,'TRY type',searched, 'on', me.lexer.token.toString()

            if me.lexer.token.type is searched

Ok, type found! Let's store matched type in me.type

              me.type = searched

Now we return: token.value

Note: we shouldnt return the 'token' object, because returning objects (here and in js) 
is a "pass by reference". You return a "pointer" to the object.
If we return then 'token' object, the calling function will recive a "pointer"
and it can inadvertedly alter the token object in the token stream. (it should not - subtle bugs)

              debug spaces, me.constructor.name,'matched OK:',searched, me.lexer.token.value

              var result = me.lexer.token.value 

Advance a token, me.lexer.token always has next token

              me.lexer.nextToken()

              return result

          else

            debug spaces, me.constructor.name,'TRY',searched.name, 'on', me.lexer.token.toString()

            if searched.name is "Object"
                debugger

if the argument is an AST node class, we instantiate the class and try the `parse()` method.
`parse()` can fail with `ParseFailed` if the construction do not match

            try
                var ASTnode = new searched(me.lexer, me)
                ASTnode.parse(options) # if it can't parse the stream, will raise an exception
                debug spaces, 'Parsed OK!->',searched.name
                return ASTnode # parsed ok!, return instance

            catch err

If parsing fail, but the AST node were not 'locked' on target, 
and the error is instanceof ParseFailed, then is a soft-error. 
Parse failed, but we will try other AST nodes.

              if not ASTnode.locked and err instanceof ParseFailed

                  debug spaces, searched.name,'parse failed.',err.message

rewind the token stream, to try other AST nodes

                  debug 'REW to', me.sourceLineNum, me.lexer.index, me.lexer.token.toString()
                  me.lexer.setPos startPos

              else

else: it's a hard-error
The AST node were locked-on-target, or is a generic error.
We abort parsing and throw.

                  # debug

                  # the first hard-error is the most informative, the others are cascading ones
                  if me.lexer.hardError is null 
                      me.lexer.hardError = err
                  #end if

raise up, abort parsing

                  raise err

              #end if - type of error

            #end catch
            
          #end if - string or class

        #loop - try the next argument

No more arguments.
`opt` returns `null` if none of the arguments could be use to parse the stream.

        return null

      #end method opt

-----------------------------

**req** works the same way as `opt` except that it throws an error if none of the arguments
can be used to parse the stream.

      method req(list,options)

        if not Array.isArray(list)
          list = [list]

We first call `opt` to see what we get. If a value is returned, the function was successful,
so we just return the node that `opt` found.

else, If `opt` returned nothing, we give the user a useful error.

        var result = me.opt(list,options)

        if no result 
          me.throwParseFailed "#{me.constructor.name}: #{me.lexer.token.toString()} found but #{me.listArgs(list)} required"

        return result


------------------------------------------------------------------------
**optValue** checks if the next token has a "value" that matches one of the arguments provided.
If so, it returns token.value and advances the stream. Otherwise, it returns `nothing`.

      method optValue(list)

convert to array if it was a single element

        if not Array.isArray(list)
          list = [list]

        #debug - control
        if arguments[1]
          throw new Error("compiler-internals: optValue accepts only one parameter of type Array")

        #debug
        var spaces = me.spacesIndent()
        #debug spaces, me.constructor.name,'TRY',me.listArgs(arguments),'on',me.lexer.token.toString()

        var actual = me.lexer.token.value

        if actual in list

One of the searched 'values' match

          debug spaces,'OK->',actual

Advance the token stream. lexer.token always has the next token

          me.lexer.nextToken()

return found token.value

          return actual

        else

          return null

------------------------------------------------------------------------
**reqValue** is the same as `optValue` except that it throws an error if the value 
is not in the arguments

      method reqValue(list)
        
        if not Array.isArray(list)
          list = [list]

First, call optValue

        var val = me.optValue(list)
        if val 
            return val

if it returns nothing, the token.value didn't match. We raise an error. 
if the AST node was 'locked' on target, it'll be a hard-error, 
else, it'll be a soft-error and others AST nodes could be tried.

        me.throwParseFailed "#{me.constructor.name}: '#{me.lexer.token.value}' found but #{me.listArgs(list)} was required"

------------------------------------------------------------------------------------
**ifOptValue** this very simple method calls 'optValue' but returns true|false instead of string|null

      method ifOptValue(optionalText)
        if me.optValue(optionalText) 
          return true
        else
          return false

------------------------------------------------------------------------------------
**opt_commaSeparated** this method will look for zero or more of the requested class,
parsing a comma separated list of class items.
If it can't match any tokens it returns an empty array.

It will try to match as many comma separated occurrences of a class as possible,
until a "closer" token is found. "NEWLINES" are allowed inside the comma separated list.

***freeForm mode***
If there is a NEWLINE before the first Item (dangling assignment), 
a 'freeForm mode' is set.
In 'freeForm mode', each item sits in it's own line, all of them with the same indent (block)
In 'freeForm mode', NEWLINE act as comma, and commas are optional
This method always returns an array.

/*
Example: Object Expression (freeForm mode)
  a = {
   value: 
      list: 10
      discount: 8
   title: 'a string'
 }

Example: List Expression (FreeForm mode)
  a = [
   "value"
   "title"
   "year"
   "author"
   ]
*/

      method opt_commaSeparated(required, closer, options)

        debug "opt_commaSeparated ", required.name, closer or '-no closer char-'

        var self = me

helper internal function to get optional NEWLINE. Warn if indent is not even.

        var optNewLine = function()
          var result = self.opt('NEWLINE')
          if result and self.lexer.indent mod 2 isnt 0
            print "WARNING: possible misaligned indent #{self.lexer.indent}, not-even, at #{self.lexer.posToString()}"
          return result
        #end function

Start opt_commaSeparated

        var 
          result = []
          freeFormMode = false
          item
          newLineAfterItem
          comma

If the list starts with a NEWLINE (dangling assignment)

        if optNewLine()

Starts with a NEWLINE => freeForm Mode
In "freeForm Mode", each item stands in its own line, and commas are optional.
The item list ends when a closer is found or when indentation changes

          freeFormMode = true

In "freeForm Mode", first line sets indent level

          indent = me.lexer.indent 

        #end if #newline

        while true

            if closer and me.optValue(closer) #closer found `]`, `)`, `}`, 
              break #end of list

            item = me.req(required,options)
            me.lock()

add item to result

            result.push(item)

newline after item (before comma or closer) is optional

            newLineAfterItem = optNewLine()

if the closer found, then exit. 
closer is normally one of: `]` , `)`, `}`

            if closer and me.optValue(closer) #closer found
                break

            debug "freeForm Mode: ", freeFormMode

            if freeFormMode

if in freeForm mode, check indent

                if me.lexer.indent isnt indent 

Indent changed:
if a closer was specified, an indent change before the closer is an error (line misaligned)

                  if closer 
                    me.throwParseFailed "misaligned line. Indent: #{me.lexer.indent}. Expected indent: #{indent} or '#{closer}' to end list"

else, if no closer specified, indent change => end of list

                  break #end of list

                #end if

in **freeForm mode**, comma is optional, NEWLINE is the separator

                me.optValue ',' 

            else

Not **freeForm mode**, here 'comma' means: 'there is another item'
any token other than comma means 'end of comma separated list'

                comma = me.optValue(',')
                if no comma
                  #any token other than comma means 'end of comma separated list'
                  if closer 
                    # if a closer was specified, it should be this not-comma token
                    me.reqValue(closer) #we *require* the closer or throw error
                  break # ok, end of comma separated list'
                #end if

            #end if

newline after comma is optional, in any mode

            optNewLine() 

        #wend #try next token

        return result


/*
------------------------------------------------------------------------
**req_multi** this method is like `req` except that it will return one or more of the requested class or token type.
If it can't match any tokens it does throw an error. It is "greedy" in that it will try to match as many occurences
as possible. `req_multi` will only return objects/tokens from the first argument that matches the token stream.
This method always returns an array.

      method req_multi()
        result = me.opt_multi.apply(this,arguments)
        if result.length > 0
            return result

  Create a useful error message for the user.

        me.throwParseFailed "Expected one of " + me.listArgs(arguments)
*/


------------------------------------------------------------------------
#debug - listArgs list arguments, for debugging

      method listArgs(args)
        var msg = []
        for i in args
            if typeof i is 'string'
                msg.push("'#{i}'")
            else if i
                if typeof i is 'function'
                  msg.push("[#{i.name}]")
                else
                  msg.push("<#{i.name}>")
            else
                msg.push("[null]")

        return msg.join(' or ')




method out()
------------
*out* is a helper function for code generation
It evaluates and output its arguments


        for item in arguments

          compiler declare on item
            CSL, NLI, COMMENT
            freeForm
            
if it is an AST node, call .produce()

          if item instanceof ASTBase 

            item.produce()

 New line char => start new line, with this statement indent

          else if item is '\n'
            me.outStartNewLine(me.indent)

          else if typeof item is 'string'
            me.lexer.out item

Object codes

          else if item and typeof item is 'object'

 {CSL:arr} --> output the array as comma separated values
 
            if item.hasOwnProperty('CSL')

              if no item.CSL
                 #empty list
                 continue

              if item.freeForm 
                me.outStartNewLine(me.indent)

              for each inx,value in item.CSL
                if inx>0, me.lexer.out ', '
                if item.freeForm, me.outStartNewLine(me.indent)
                me.out value
              end for

              if item.freeForm, me.outStartNewLine(me.indent)


 {NLI:indent} --> Start new line, with this indent
 
            else if item.NLI isnt undefined
              me.outStartNewLine(item.NLI)

 
 {COMMENT:text} --> output text as a comment 
 
            else if item.COMMENT isnt undefined

              # prepend // if necessary
              if not item.COMMENT.startsWith("//")
                me.out "//"

              me.out item.COMMENT

else, if the object is an array, recursive call

            else if item instanceof Array

              me.out.apply me,item

else, if the object has a 'name' property...

            else if item and item.name
              me.lexer.out item.name           
 
            else
              var msg = "method:ASTBase.out() Caller:#{me.constructor.name}: object not recognized. type: "+ typeof item
              debug msg
              debug item
              fail with msg

Last resort, out item.toString()

          else if item #if there is somehting

            me.lexer.out item.toString() # try item.toString()

          #end if

        #end Loop


------------

      method outStartNewLine(indent)

        me.lexer.outStartNewLine()
        me.lexer.out(String.spaces(indent))

-------------

      method spacesIndent()

        var 
          indent = ' '
          parent = me.parentNode

        while parent
          parent = parent.parentNode
          indent += '  '

        return indent

