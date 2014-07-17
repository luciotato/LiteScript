The Abstract Syntax Tree (AST) Base class
-----------------------------------------

This module defines the base abstract syntax tree class used by the grammar. 
It's main purpose is to provide utility methods used in the grammar 
for **req**uired tokens, **opt**ional tokens 
and comma or semicolon **Separated Lists** of symbols.

Dependencies

    import Parser, ControlledError
    import logger, Strings 
    
    shim import LiteCore, Map

### public default Class ASTBase 

This class serves as a base class on top of which Grammar classes are defined.
It contains basic functions to parse a token stream.

#### properties
        parent: ASTBase 
        name:string, keyword:string

        type, keyType, itemType
        extraInfo // if parse failed, extra information 

        lexer: Parser.Lexer, lineInx
        sourceLineNum, column
        indent, locked

#### Constructor (parent:ASTBase, name)

        .parent = parent
        .name = name

Get lexer from parent

        if parent
            .lexer = parent.lexer

Remember this node source position.
Also remember line index in tokenized lines, and indent

            if .lexer 
                .sourceLineNum = .lexer.sourceLineNum
                .column = .lexer.token.column
                .indent = .lexer.indent
                .lineInx = .lexer.lineInx

        #debug "created [#.constructor.name] indent #.indent col:#.column #{.lexer? .lexer.token:''}"

------------------------------------------------------------------------
#### method lock()
**lock** marks this node as "locked", meaning we are certain this is the right class
for the given syntax. For example, if the `FunctionDeclaration` class see the token `function`,
we are certain this is the right class to use, so we 'lock()'. 
Once locked, any **req**uired token not present causes compilation to fail.

        .locked = true

#### helper method getParent(searchedClass)
**getParent** method searchs up the AST tree until a specfied node class is found

        var node = this.parent
        while node and not(node instanceof searchedClass)
            node = node.parent # move to parent
        return node


#### helper method positionText() 

        if not .lexer or no .sourceLineNum, return "(compiler-defined)"    
        return "#{.lexer.filename}:#{.sourceLineNum}:#{.column or 0}"
  
#### helper method toString()

        return "[#{.constructor.name}]"


#### helper method sayErr(msg)

        logger.error .positionText(), msg

#### helper method warn(msg)

        logger.warning .positionText(), msg

#### method throwError(msg)
**throwError** add node position info and throws a 'controlled' error.

A 'controlled' error, shows only err.message

A 'un-controlled' error is an unhandled exception in the compiler code itself, 
and it shows error message *and stack trace*.

        logger.throwControlled "#{.positionText()}. #{msg}"

#### method throwParseFailed(msg)
throws a parseFailed-error

During a node.parse(), if there is a token mismatch, a "parse failed" is raised.
"parse failed" signals a failure to parse the tokens from the stream, 
however the syntax might still be valid for another AST node. 
If the AST node was locked-on-target, it is a hard-error.
If the AST node was NOT locked, it's a soft-error, and will not abort compilation 
as the parent node will try other AST classes against the token stream before failing.

        //var err = new Error("#{.positionText()}. #{msg}")
        var cErr = new ControlledError("#{.lexer.posToString()}. #{msg}")
        cErr.soft = not .locked
        throw cErr

#### method parse()
abstract method representing the TRY-Parse of the node.
Child classes _must_ override this method
      
        .throwError 'Parser Not Implemented'

#### method produce()
**produce()** is the method to produce target code
Target code produces should override this, if the default production isnt: `.out .name`

        .out .name

#### method parseDirect(key, directMap)

We use a DIRECT associative array to pick the exact AST node to parse 
based on the actual token value or type.
This speeds up parsing, avoiding parsing by trial & error

Check keyword

        if directMap.get(key) into var param

try parse by calling .opt, accept Array as param
            
            var statement = param instance of Array ? 
                    ASTBase.prototype.opt.apply(this, param) 
                    : .opt(param)

return parsed statement or nothing

            return statement



#### Method opt() returns ASTBase
**opt** (optional) is for optional parts of a grammar. It attempts to parse 
the token stream using one of the classes or token types specified.
This method takes a variable number of arguments.
For example:
  calling `.opt IfStatement, Expression, 'IDENTIFIER'`
  would attempt to parse the token stream first as an `IfStatement`. If that fails, it would attempt
  to use the `Expression` class. If that fails, it will accept a token of type `IDENTIFIER`.
  If all of those fail, it will return `undefined`.

Method start:
Remember the actual position, to rewind if all the arguments to `opt` fail

        var startPos = .lexer.getPos()

        declare on startPos
          index,sourceLineNum,column,token
        declare valid startPos.token.column

        #debug
        var spaces = .levelIndent()

For each argument, -a class or a string-, we will attempt to parse the token stream 
with the class, or match the token type to the string.

        for each searched in arguments.toArray()

skip empty, null & undefined

          if no searched, continue

determine value or type
For strings we check the token **value** or **TYPE** (if searched is all-uppercase)

          if typeof searched is 'string'

            declare searched:string

            #debug spaces, .constructor.name,'TRY',searched, 'on', .lexer.token.toString()

            var isTYPE = searched.charAt(0)>="A" and searched.charAt(0)<="Z" and searched is searched.toUpperCase()
            var found

            if isTYPE 
              found = .lexer.token.type is searched
            else
              found = .lexer.token.value is searched

            if found

Ok, type/value found! now we return: token.value
Note: we shouldnt return the 'token' object, because returning objects (here and in js) 
is a "pass by reference". You return a "pointer" to the object.
If we return the 'token' object, the calling function will recive a "pointer"
and it can inadvertedly alter the token object in the token stream. (it should not, leads to subtle bugs)

              logger.debug spaces, .constructor.name,'matched OK:',searched, .lexer.token.value
              var result = .lexer.token.value 

Advance a token, .lexer.token always has next token

              .lexer.nextToken()
              return result

          else

"searched" is an AST class

            declare searched:Function //class

            logger.debug spaces, .constructor.name,'TRY',searched.name, 'on', .lexer.token.toString()

if the argument is an AST node class, we instantiate the class and try the `parse()` method.
`parse()` can fail with `ParseFailed` if the syntax do not match

            try

                var astNode:ASTBase = new searched(this) # create required ASTNode, to try parse

                astNode.parse() # if it can't parse, will raise an exception

                logger.debug spaces, 'Parsed OK!->',searched.name

                return astNode # parsed ok!, return instance

            catch err
                if err isnt instance of ControlledError, throw err //re-raise if not ControlledError
                declare err:ControlledError
                
If parsing fail, but the AST node were not 'locked' on target, (a soft-error),
we will try other AST nodes.

                if err.soft
                    .lexer.softError = err
                    logger.debug spaces, searched.name,'parse failed.',err.message

rewind the token stream, to try other AST nodes

                    logger.debug "<<REW to", "#{startPos.sourceLineNum}:#{startPos.token.column or 0} [#{startPos.index}]", startPos.token.toString()
                    .lexer.setPos startPos

                else

else: it's a hard-error. The AST node were locked-on-target.
We abort parsing and throw.

                    # the first hard-error is the most informative, the others are cascading ones
                    if .lexer.hardError is null, .lexer.hardError = err

raise up, abort parsing
              
                    raise err

                end if - type of error

            end catch
            
          end if - string or class

        end loop - try the next argument

No more arguments.
`opt` returns `undefined` if none of the arguments can be use to parse the token stream.

        return undefined

     end method opt


#### method req() returns ASTBase

**req** (required) if for required symbols of the grammar. It works the same way as `opt` 
except that it throws an error if none of the arguments can be used to parse the stream.

We first call `opt` to see what we get. If a value is returned, the function was successful,
so we just return the node that `opt` found.

else, If `opt` returned nothing, we give the user a useful error.

        var result = ASTBase.prototype.opt.apply(this,arguments)

        if no result 
          .throwParseFailed "#{.constructor.name}:#{.extraInfo or ''} found #{.lexer.token.toString()} but #{.listArgs(arguments)} required"

        return result


#### method reqOneOf(arr)
(performance) call req only if next token (value) in list
        
        if .lexer.token.value in arr
            return ASTBase.prototype.req.apply(this,arr)
        else
            .throwParseFailed "not in list"


#### method optList()
this generic method will look for zero or more of the requested classes,

        var item
        var list=[]
        
        do
          item = ASTBase.prototype.opt.apply(this,arguments)
          if no item then break
          list.push item
        loop

        return list.length? list : undefined


#### method optSeparatedList(astClass:ASTBase, separator, closer) #[Separated Lists]

Start optSeparatedList

        var result = []
        var optSepar

except the requested closer is NEWLINE, 
NEWLINE is included as an optional extra separator 
and also we allow a free-form mode list

        if closer isnt 'NEWLINE' #Except required closer *IS* NEWLINE

if the list starts with a NEWLINE, 
assume an indented free-form mode separated list, 
where NEWLINE is a valid separator.

            if .lexer.token.type is 'NEWLINE'
                return .optFreeFormList( astClass, separator, closer )

else normal list, but NEWLINE is accepted as optional before and after separator

            optSepar = 'NEWLINE' #newline is optional before and after separator

normal separated list, 
loop until closer found

        logger.debug "optSeparatedList [#{.constructor.name}] indent:#{.indent}, get SeparatedList of [#{astClass.name}] by '#{separator}' closer:", closer or '-no closer-'

        var startLine = .lexer.sourceLineNum
        do until .opt(closer) or .lexer.token.type is 'EOF'

get a item

            var item = .req(astClass)
            .lock()

add item to result

            result.push(item)

newline after item (before comma or closer) is optional

            var consumedNewLine = .opt(optSepar)

if, after newline, we got the closer, then exit. 

            if .opt(closer) then break #closer found

here, a 'separator' (comma/semicolon) means: 'there is another item'.
Any token other than 'separator' means 'end of list'

            if no .opt(separator)
                # any token other than comma/semicolon means 'end of comma separated list'
                # but if a closer was required, then "other" token is an error
                if closer, .throwError "Expected '#{closer}' to end list started at line #{startLine}, got '#{.lexer.token.value}'"
                if consumedNewLine, .lexer.returnToken()
                break # if no error, end of list
            end if

optional newline after comma 

            .opt(optSepar)

        loop #try get next item

        return result

#### Method optFreeFormList(astClass:ASTBase, separator, closer)

In "freeForm Mode", each item stands in its own line, and commas (separators) are optional.
The item list ends when a closer is found or when indentation changes

        var result = []
        var lastItemSourceLine = -1
        var separatorAfterItem
        var parentIndent = .parent.indent

FreeFormList should start with NEWLINE
First line sets indent level

        .req "NEWLINE"
        var startLine = .lexer.sourceLineNum
        var blockIndent = .lexer.indent

        logger.debug "optFreeFormList: [#{astClass.name} #{separator}]*  parent:#{.parent.name}.#{.constructor.name} parentIndent:#{parentIndent}, blockIndent:#{blockIndent}, closer:", closer or '-no-'

        if blockIndent <= parentIndent #first line is same or less indented than parent - assume empty list
          .lexer.sayErr "free-form SeparatedList: next line is same or less indented (#{blockIndent}) than parent indent (#{parentIndent}) - assume empty list"
          return result

now loop until closer or an indent change

        #if closer found (`]`, `)`, `}`), end of list
        do until .opt(closer) or .lexer.token.type is 'EOF'

check for indent changes

            logger.debug "freeForm Mode .lexer.indent:#{.lexer.indent} block indent:#{blockIndent} parentIndent:#{parentIndent}"
            if .lexer.indent isnt blockIndent

indent changed:
if a closer was specified, indent change before the closer means error (line misaligned)

                  if closer 
                    .lexer.throwErr "Misaligned indent: #{.lexer.indent}. Expected #{blockIndent}, or '#{closer}' to end block started at line #{startLine}"

check for excesive indent

                  if .lexer.indent > blockIndent
                    .lexer.throwErr "Misaligned indent: #{.lexer.indent}. Expected #{blockIndent} to continue block, or #{parentIndent} to close block started at line #{startLine}"

else, if no closer specified, and indent decreased => end of list

                  break #end of list

            end if

check for more than one statement on the same line, with no separator

            if not separatorAfterItem and .lexer.sourceLineNum is lastItemSourceLine 
                .lexer.sayErr "More than one [#{astClass.name}] on line #{lastItemSourceLine}. Missing ( ) on function call?"

            lastItemSourceLine = .lexer.sourceLineNum

else, get a item

            var item = .req(astClass)
            .lock()

add item to result

            result.push(item)

newline after item (before comma or closer) is optional

            if item.sourceLineNum>.lexer.maxSourceLineNum, .lexer.maxSourceLineNum=item.sourceLineNum
            .opt('NEWLINE')

separator (comma|semicolon) is optional, 
NEWLINE also is optional and valid 

            separatorAfterItem = .opt(separator)
            .opt('NEWLINE')

        loop #try get next item

        logger.debug "END freeFormMode [#{.constructor.name}] blockIndent:#{blockIndent}, get SeparatedList of [#{astClass.name}] by '#{separator}' closer:", closer or '-no closer-'

        //if closer then .opt('NEWLINE') # consume optional newline after closer in free-form mode

        return result


#### method reqSeparatedList(astClass:ASTBase, separator, closer)
**reqSeparatedList** is the same as `optSeparatedList` except that it throws an error 
if the list is empty
        
First, call optSeparatedList

        var result:ASTBase array = .optSeparatedList(astClass, separator, closer)
        if result.length is 0, .throwParseFailed "#{.constructor.name}: Get list: At least one [#{astClass.name}] was expected"

        return result


#### helper method listArgs(args:Object array)
listArgs list arguments (from opt or req). used for debugging
and syntax error reporting

        var msg = []
        for each i in args

            declare valid i.name

            if typeof i is 'string'
                msg.push("'#{i}'")
            else if i
                if typeof i is 'function'
                  msg.push("[#{i.name}]")
                else
                  msg.push("<#{i.name}>")
            else
                msg.push("[null]")

        return msg.join('|')



Helper functions for code generation
=====================================

#### helper method out()

*out* is a helper function for code generation
It evaluates and output its arguments. uses .lexer.out

        var rawOut = .lexer.outCode

        for each item in arguments.toArray()

skip empty items

          if no item, continue

if it is the first thing in the line, out indentation

          if not rawOut.currLine and .indent > 1
              rawOut.put Strings.spaces(.indent-1)

if it is an AST node, call .produce()

          if item instance of ASTBase 
              declare item:ASTBase 
              item.produce()

New line char means "start new line"

          else if item is '\n' 
            rawOut.startNewLine()

a simple string, out the string

          else if type of item is 'string'
            rawOut.put item
            
if the object is an array, resolve with a recursive call

          else if item instance of Array
              # Recursive #
              ASTBase.prototype.out.apply this,item 

else, Object codes

          else if item instanceof Map

              declare item: Map string to any

            // expected keys:
            //  COMMENT:string, NLI, CSL:Object array, freeForm, h
            
{CSL:arr} -> output the array as Comma Separated List
 
              if item.get('CSL') into var CSL:array

                  // additional keys: pre,post,separator
                  var separator = item.get('separator') or ', '
                  
                  for each inx,listItem in CSL

                    declare valid listItem.out

                    if inx>0 
                      rawOut.put separator

                    if item.get('freeForm')
                        rawOut.put '\n        '

                    #recurse
                    .out item.get('pre'), listItem, item.get('post')

                  end for

                  if item.get('freeForm'), rawOut.put '\n' # (prettier generated code)

{COMMENT:text} --> output text as a comment 
 
              else if item.get('COMMENT') into var comment:string

                  if no .lexer or .lexer.options.comments #comments level > 0

                      # prepend // if necessary
                      if type of item isnt 'string' or not comment.startsWith("//"), rawOut.put "// "
                      .out comment

{h:1/0} --> enable/disabe output to header file
 
              else if item.get('h') into var header:number isnt undefined
                  rawOut.startNewLine
                  rawOut.toHeader = header

              else 
                  .sayErr "ASTBase method out, item:map: unrecognized map keys: #{item}"

Last option, out item.toString()

          else
              rawOut.put item.toString() # try item.toString()

          end if

        end loop, next item


#### helper method outLineAsComment(preComment,lineInx)
out a full source line as comment into produced code

        if no .lexer.options.comments, return 

manage optional parameters

        if no lineInx
          lineInx = preComment
          preComment = ""
        else
          preComment="#{preComment}: "

validate index

        if no .lexer, return logger.error("ASTBase.outLineAsComment #{lineInx}: NO LEXER")

        var line = .lexer.infoLines[lineInx]
        if no line, return logger.error("ASTBase.outLineAsComment #{lineInx}: NO LINE")

        if line.type is Parser.LineTypes.BLANK
            .lexer.outCode.blankLine
            return

out as comment

        var prepend=""
        if preComment or not line.text.startsWith("//"), prepend="// "
        if no .lexer.outCode.currLine, prepend="#{Strings.spaces(line.indent)}#{prepend}"
        if preComment or line.text, .lexer.outCode.put "#{prepend}#{preComment}#{line.text}"

        .lexer.outCode.startNewLine

        .lexer.outCode.lastOutCommentLine = lineInx

      
#### helper method outLinesAsComment(fromLine,toLine)

        if no .lexer.options.comments, return 

        # if line has something and is not spaces
        if .lexer.outCode.currLine and .lexer.outCode.currLine.trim()
            .lexer.outCode.startNewLine()

        .lexer.outCode.currLine = undefined #clear indents

        for i=fromLine to toLine
            .outLineAsComment i


#### helper method outPrevLinesComments(startFrom) 

outPrevLinesComments helper method: output comments from previous lines
before the statement

      if no .lexer.options.comments, return 

      var inx = startFrom or .lineInx or 0
      if inx<1, return

      default .lexer.outCode.lastOutCommentLine = -1

find comment lines in the previous lines of code. 

      var preInx = inx
      while preInx and preInx>.lexer.outCode.lastOutCommentLine 
          preInx--
          if .lexer.infoLines[preInx].type is Parser.LineTypes.CODE 
              preInx++
              break

Output prev comments lines (also blank lines)

      .outLinesAsComment preInx, inx-1

    #end method


#### helper method getEOLComment() 
getEOLComment: get the comment at the end of the line

Check for "postfix" comments. These are comments that occur at the end of the line,
such as `a = 1 #comment`. We want to try to add these at the end of the current JavaScript line.

        if no .lexer.options.comments, return 

        var inx = .lineInx
        var infoLine = .lexer.infoLines[inx]

        if infoLine.tokens and infoLine.tokens.length
            var lastToken = infoLine.tokens[infoLine.tokens.length-1]
            if lastToken.type is 'COMMENT'
                return "#{lastToken.value.startsWith('//')? '' else '//'} #{lastToken.value}"

#### helper method addSourceMap(mark)

        .lexer.outCode.addSourceMap mark, .sourceLineNum, .column, .indent


#### helper method levelIndent()
show indented messaged for debugging

        var indent = 0
        var node = this
        while node.parent into node
            indent += 2 //add 2 spaces

        return Strings.spaces(indent)

    
#### helper method getRootNode()

**getRootNode** method moves up in the AST up to the node holding the global scope ("root").
"root" node has parent = Project 

        var node = this
        while node.parent instanceof ASTBase
            node = node.parent # move up
        return node


#### helper method compilerVar(name) 

helper function compilerVar(name)
return root.compilerVars.members.get(name)

        return .getRootNode().parent.compilerVars.members.get(name) 

    end class ASTBase


