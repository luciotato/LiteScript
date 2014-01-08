The Abstract Syntax Tree (AST)
------------------------------

This module defines the base abstract syntax tree class `ASTBase` used by the parser. 
It's main purpose is to provide a prototype AST node with utility methods to parse 
the token stream into classes derived from `ASTBase`

###Declarations for external or forward symbols

To avoid long debug sessions over a mistyped object member, LiteScript compiler will emit warnings 
when a variable is used before declaration, and when a object property is unknown. 
The `compiler declare` directive lists valid property names, avoiding warnings. 
It is used to declare externally defined objects, or to forward-declare methods.

    compiler declare on ASTBase
        opt
        out
        spacesIndent
        listArgs
        keyword

    compiler declare on lexer
        posToString
        getPos, setPos
        lineInfo, token, index, nextToken
        sourceLineNum
        hardError
        options, filename
        outStartNewLine

    compiler declare on token
        type, value

    compiler declare on Error
        soft
        controled
        log, warning

    compiler declare on String
        spaces
        repeat

###The AST classes parsing mechanism

The parser is a hand-coded optimized recursive-descent parser.

The parsing logic in each grammar class .parse() method is straightforward.

Each .parse() method *requires* specific tokens in a specific order, and consume *optional* 
tokens for syntax variations.  

During a node.parse(), if a *required* token is missing, a "parse failed" error is raised.
However the syntax might still be valid for another AST class. 

When a *required* token is missing, a 'parse failed' exception is thrown, then, method `.req` rewinds the token stream 
for another grammar class to be tried.

If the AST node was NOT locked, "parse failed" is a soft-error, and will not abort compilation 
as the parent node will try other AST classes against the token stream.

If the node was locked-on-target, it is a hard-error, compilation will be aborted. 
(The parse function 'locks' when enough tokens are recognized to clearly identifiy the construction).


public Class ASTBase
====================

This class serves as a base class on top of which all AST classes are defined.
It contains basic functions to parse the token stream. Provides methods to **require** a token, `req()`, 
to get **optional** tokens, `opt()` and specialized methods to parse, for example, 
a comma separated list of symbols, `optCommaSeparated(symbol,closer)`
     
###properties
        parentNode
        lexer, indent, column, sourceLineNum, lineInx
        locked # when `true`, means the node is lock-on-target. Any exception when locked, aborts compilation.

Constructor (lexer, parent)
---------------------------

First, let's control passed arguments 

        if no lexer then fail with 'call to new ASTBase: lexer is null'

The node starts "unlocked", indicating that we are not sure this is the right node to parse this segment of the token stream.
We can't declare syntax errors until we are sure this is the right class.

        me.locked = false

        me.parentNode = parent

Link to the token stream and helper functions

        me.lexer = lexer

Remember this node source position

        me.sourceLineNum = lexer.sourceLineNum
        me.column = lexer.token.column

Also remember line index in tokenized lines, and this line indent

        me.lineInx = lexer.lineInx
        me.indent = lexer.indent

      end constructor


method lock
-----------

**lock** marks this class as locked, meaning we are certain this is the correct class
for the given syntax. For example, if the `FunctionDeclaration` class sees the token '**function**',
we are certain this is the rigth class to use. Once locked, any invalid syntax causes compilation to fail.

        me.locked = on // `on` is alias for `true`

debug helper method toString()

      method toString()
        return "[#me.constructor.name] (#me.lexer.options.filename:#me.sourceLineNum:#me.column)"


method throwError(msg)
----------------------

adds lexer position info and throws a 'controled' error

        var e = new Error(msg + me.lexer.posToString() )
        e.controled = true
        throw e
      

method throwParseFailed (msg)
-----------------------------

During a node.parse(), if there is a token mismatch, a "parse failed" is raised.
"parse failed" signals a failure to parse the tokens from the stream, 
however the syntax might still be valid for another AST node. 
If the AST node was NOT locked, it's a soft-error, and will not abort compilation 
as the parent node will try other AST classes against the token stream before failing.

        if me.locked #hard error if locked
          me.throwError(msg) 

        e = new Error(msg)
        e.soft = true  #"parse failed" is a soft error
        e.controled = true
        throw e

------------------------------------------------------------------------

method parse
------------

**parse()** is the method representing a parsing attempt.
Child classes _must_ override this method

        me.lock()
        me.throwParseFailed 'Parser Not Implemented: ' + me.constructor.name


method produce
--------------

**produce()** is the method to produce target code.
Child classes should override this.

        me.out me.name


method parseDirect (key, directAssoc)
------------------------------------

We use a DIRECT associative array to pick the exact AST node to parse 
based on the actual token value or type.
This speeds up parsing, avoiding parsing by trial & error

        if directAssoc.hasOwnProperty(key)
          var directASTClass = directAssoc[key]

*opt* tries to parse directASTClass. It returns 'null' if parse failed. 

          var result = me.opt(directASTClass)

if parsed ok, store the key in the node (to ease debuging and to validate optional `end` statements)

          if result, result.keyword = key

          return result


method opt 
----------

**opt** attempts to parse the token stream using one of the classes or token types specified.
This method takes a variable number of arguments.
For example:
  calling `me.opt IfStatement, Expression, 'IDENTIFIER'`
  would attempt to parse the token stream first as an `IfStatement`. If that fails, it would attempt
  to use the `Expression` class. If that fails, it will accept a token of type `IDENTIFIER`.
  If all of those fail, it will return `undefined`.

Remember the actual position, to rewind if all the arguments to `opt` fail

        var startPos = me.lexer.getPos()

        #debug
        var spaces = me.spacesIndent()

For each argument, -a class or a string-, we will attempt to parse the token stream 
with the class, or match the token type to the string. 

        for searched in arguments

First we have some **debug** code to avoid common error while developing support for new grammars.
The body of `compile if debug` will be included only if compiler's `options.debug` is set.
It's like C's `#ifdef` preprocessor directive.

          compile if debug
            if typeof searched is 'string' and searched isnt searched.toUpperCase()
              me.throwError """
                  compiler-internals: a call to req('#{searched}') was made, 
                  but '#{searched}' is not UPPERCASE. Do you mean to call reqValue()?
                  """

For strings we check the token **type**, and return the token value if the type match

          if typeof searched is 'string'

            #debug spaces, me.constructor.name,'TRY type',searched, 'on', me.lexer.token.toString()

            if me.lexer.token.type is searched

Ok, type found! Let's store matched type in me.type

              me.type = searched

Now we return: token.value

Note: we shouldnt return the 'token' object, because returning objects (here and in js) 
is a "pass by reference" return. You are returning a "pointer" to the object.
If we return the 'token' object, the calling function will recive a "pointer"
and it can inadvertedly alter the token object in the token stream. (it should not, leads to subtle bugs)

              debug spaces, me.constructor.name,'matched OK:',searched, me.lexer.token.value

              var result = me.lexer.token.value 

Advance a token, me.lexer.token always has next token

              me.lexer.nextToken()

              return result

else, if the argument is an AST node class, we instantiate the class and try the `parse()` method.
`parse()` can fail with `ParseFailed` if the construction do not match

          else

            debug spaces, me.constructor.name,'TRY',searched.name, 'on', me.lexer.token.toString()

            try
                var ASTnode = new searched(me.lexer, me)
                ASTnode.parse(options) # if it can't parse the stream, will raise an exception
                debug spaces, 'Parsed OK!->',searched.name
                return ASTnode # parsed ok!, return instance

            catch err

If parsing fail, but the AST node were not 'locked' on target, is a soft-error,
we will try other AST nodes.

              if err.soft

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
                  end if

raise up, abort parsing

                  raise err

              end if # type of error

            end catch
            
          end if # string or class

        end for # try the next argument

No more arguments.
`opt` returns `undefined` if none of the arguments could be use to parse the stream.

        return undefined


method req
----------

**req** (***require***) works the same way as `opt` except that it throws an error if none of the arguments
can be used to parse the stream.

We first call `opt` to see what we get. If a value is returned, the function was successful,
so we just return the node that `opt` found.

else, If `opt` returned nothing, we give the user a useful error.

        var result = me.opt.apply(this,arguments)

        if no result 
          me.throwParseFailed "#{me.constructor.name}: #{me.lexer.token.toString()} found but #{me.listArgs(arguments)} required"

        return result


------------------------------------------------------------------------
**optValue** checks if the next token has a "value" that matches one of the arguments provided.
If so, it returns token.value and advances the stream. Otherwise, it returns `undefined`

      method optValue()

        #debug
        var spaces = me.spacesIndent()
        #debug spaces, me.constructor.name,'TRY',me.listArgs(arguments),'on',me.lexer.token.toString()

        var actual = me.lexer.token.value

        if actual in arguments

One of the searched 'values' match

          debug spaces,'OK->',actual

Advance the token stream. lexer.token always has the next token

          me.lexer.nextToken()

return found token.value

          return actual

        else

          return undefined

method reqValue
---------------

**reqValue** is the same as `optValue` except that it throws an error if the value 
is not in the arguments
        
First, call optValue

        var val = me.optValue.apply(this,arguments)
        if val 
            return val

if it returns nothing, the token.value didn't match. We raise an error. 
if the AST node was 'locked' on target, it'll be a hard-error, 
else, it'll be a soft-error and others AST nodes could be tried.

        me.throwParseFailed "#{me.constructor.name}: '#{me.lexer.token.value}' found but #{me.listArgs(arguments)} was required"

method ifOptValue (optionalText)
--------------------------------

**ifOptValue** this very simple method calls 'optValue' but returns true|false instead of string|undefined

        return me.optValue(optionalText)? true :false;


method getSeparatedList (astClass, separator, closer)
-----------------------------------------------------

This generic method will look for zero or more instances of the requested structure,
parsing a comma|semicolon separated list of class items.
If it can't match any tokens it returns an empty array.
This method always returns an array.

It will try to match as many comma|semicolon separated occurrences of a class as possible,
until a "closer" token is found. "NEWLINES" are allowed inside the list, before or after the separator.

This method is used to parse:
* items in an object expression
* an array expression,
* arguments for a function
* variables in a var statement
* a class body
* a function body
* the body statements of a loop
* Anywhere a separated list apply.

####freeForm mode

If there is a NEWLINE before the first Item, a 'freeForm mode' is set.
In 'freeForm mode', each item sits in it's own line, all of them with the same indent (block)
In 'freeForm mode', separators are optional.

/*
Example: Object Expression (separator is "," - freeForm mode)
  a = {
   value: 
      list: 10
      discount: 8
   title: 'a string'
 }

Example: List Expression (separator is "," )
  a = [
   "value","title"
   "year","author"
   ]

Example: While loop body (separator is ";" - freeForm mode)
  while a<10
   print a
   a++

Example: While loop body (separator is ";" - non-freeForm mode)
  while a<10; print a; a++

*/

helper internal function to get optional NEWLINE. Warn if indent is not even.

        function optNewLine()
          var result = me.opt('NEWLINE')
          if result and me.lexer.indent mod 2 isnt 0
            log.warning "possible misaligned indent #{me.lexer.indent}, not-even, at #{me.lexer.posToString()}"
          return result
        end function

Start getSeparatedList

        debug "[#{me.constructor.name}] indent:#{me.indent}, getSeparatedList of [#{astClass.name}] by '#{separator}' closer:", closer or '-no closer char-'

        var 
          result = []
          freeFormMode = false
          item, newLineAfterItem

If the list starts with a NEWLINE, we enter free-form mode

        if optNewLine()

Starts with a NEWLINE => freeForm Mode
In "freeForm Mode", each item stands in its own line, and commas (separators) are optional.
The item list ends when a closer is found or when indentation changes

          freeFormMode = true

In "freeForm Mode", first line sets indent level

          indent = me.lexer.indent 

          if indent <= me.indent  #next line is same or less indented - assume empty list
            debug "getSeparatedList: next line is same or less indented (#{indent}) - assume empty list"
            return result
          end if

        end if #start with newline

now loop until: a closer, or an indent change

        do:

if closer found (`]`, `)`, `}`), end of list

            if closer and me.optValue(closer)
              break #end of list

else, get a item

            item = me.req(astClass)
            me.lock()

add item to result

            result.push(item)

newline after item (before comma or closer) is optional

            newLineAfterItem = optNewLine()

if now we got the closer, then exit. 
closer is normally one of: `]` , `)`, `}`

            if closer and me.optValue(closer) #closer found
                break

            debug "freeForm Mode: ", freeFormMode

            if freeFormMode

if in freeForm mode, check indent

                if me.lexer.indent isnt indent 

Indent changed:
if a closer was specified, an indent change before the closer is an error (line misaligned)

                    if closer, me.throwParseFailed "misaligned line. Indent: #{me.lexer.indent}. Expected indent: #{indent} or '#{closer}' to end list"

check for excesive indent

                    if me.lexer.indent > me.indent, me.throwError "misaligned indent #{me.lexer.posToString()} Excesive. indent is #{me.lexer.indent}, expected: #{me.indent} or less to close the block"

else, no closer specified, indent change => end of list

                    break #end of list

                end if

in **freeForm mode**, separator (comma|semicolon) is optional, NEWLINE is valid as separator

                me.optValue separator

            else

Not **freeForm mode**, here 'comma' means: 'there is another item'
any token other than comma means 'end of comma separated list'

                var separ = me.optValue(separator)
                if no separ
                  #any token other than comma means 'end of comma separated list'
                  if closer 
                    # but, if a closer was specified, it should be this not-comma token
                    me.reqValue(closer) #we *require* the closer or throw error
                  break # ok, end of comma separated list'
                end if

            #end if

newline after comma is optional, in any mode

            optNewLine() 

        loop #try get next item

        return result


method optCommaSeparated (astClass, closer)
-------------------------------------------

This method calls *getSeparatedList* with common parameters.
It looks for a *specific class* list, *comma* separated, and with an *optional closer*
It is used for arguments lists, object and list expresions, var statements.

Example: arguments lists:
  return me.getSeparatedList(Expression, ',', ')')
it means: look for a comma separated list of Expressions, ending at ")"

Example: Object expression:
  return me.getSeparatedList(NameValuePair, ',', '}')
it means: look for a comma separated list of NameValuePair, ending at "}"
and `NameValuePair: IDENTIFIER ":" Expression`

        return me.getSeparatedList(astClass,',',closer)


---------------------------------------------------------
###debug Helper function - list arguments, for debugging and error report

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



Helper functions for code generation
====================================

method out
----------

*out* is a helper function for code generation
It evaluates and output its arguments

        for item in arguments

          compiler declare on item
            CSL, NLI, COMMENT
            freeForm
            
if it is an AST node, call .produce()

          if item instanceof ASTBase 

            item.produce()

a string, out it

          else if typeof item is 'string'
            me.lexer.out item

New line char => start new line, with this statement indent

          else if item is '\n'
            me.lexer.outStartNewLine()
            me.lexer.out String.spaces(me.indent-1)

Object codes

          else if item and typeof item is 'object'

 {CSL:arr} --> output the array as comma separated values
 
            if item.hasOwnProperty('CSL')

              if no item.CSL
                  #empty list
                  continue

              if item.freeForm, me.out '\n'

              for each inx,value in item.CSL
                if inx>0, me.lexer.out ', '
                if item.freeForm, me.out '\n'
                me.out value
              end for

              if item.freeForm, me.outStartNewLine(me.indent)

 {NLI:indent} --> Start new line, with this indent
 
            else if item.NLI isnt undefined
              me.lexer.outStartNewLine()
              me.lexer.out String.spaces(item.NLI-1)
 
 {COMMENT:text} --> output text as a comment 
 
            else if item.COMMENT isnt undefined

prepend // if necessary

              if not item.COMMENT.startsWith("//"), me.out "//"

              me.out item.COMMENT

else, if the object is an array, recursive call

            else if item instanceof Array

              me.out.apply me,item

else, if the object has a 'name' property...

            else if item and item.name
              me.lexer.out item.name           
 
            else
              var msg = "method:ASTBase.out() Caller:#{me.constructor.name}: object not recognized: "+ item.constructor.name
              debug msg
              debug item
              fail with msg

Last resort, out item.toString()

          else if item #if there is somehting

            me.lexer.out item.toString() # try item.toString()

          end if

        end for #each argument


-------------
Helper method for debug output, indent according to tree depth level

      method levelIndent()

        var indent = ' ', parent = me.parentNode
        while parent
          parent = parent.parentNode
          indent += '  '

        return indent

