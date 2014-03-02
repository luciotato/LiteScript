The Lexer
=========

The Lexer translates code (an array of lines) into an array of tokenized lines to be parsed.

The Lexer class acts as 
* Lexer/Tokenizer
* Token Stream (input)

All the parts of the lexer work with "arrays" of lines.
(instead of a buffer or a large string)

The first lexer pass analyzes entire lines. 
Each line of the array is classified with a 'Line Type':

    var LineTypes = {CODE:0, COMMENT:1, BLANK:2}

then each CODE line is *Tokenized*, getting a `tokens[]` array

-------------------------
### dependencies

    import log
    var debug = log.debug


The Lexer Class
===============

### Class Lexer

The Lexer class turns the input lines into an array of "infoLines"

#### properties 
        filename:string, interfaceMode:boolean
        lines:string array
        infoLines: InfoLine array
        sourceLineNum
        lineInx
        line:String
        infoLine, token, last:LexerPos
        indent, index

        stringInterpolationChar = "#" // can be changed later with `compiler` directive
        errCount, hardError:Error, softError:Error
        inNode

        out:OutCode

#### Constructor

Err counter, and important inner-error

          .errCount = 0 #incremented each time the compiler emits a "ERROR" (not WARN - see sayErr)

          .hardError = null # stores most significative (deepest) error, when parsing fails

clear out helper

          .out = new OutCode() #helper class
          .out.start

we start with an empty Token
          
          .token = new Token()
          
      #end constructor


#### Method initSource(filename:string, source:String)
Load filename and source code in the lexer.
First, remember filename (for error reporting) 

          this.filename = filename
          this.interfaceMode = filename.endsWith('interface.md')

create source lines array

          if source instanceof Array
            .lines = source

          else

If code is passed as a buffer, convert it to string
then to lines array 

            if typeof source isnt 'string'
              source = source.toString()
            
            .lines = source.split('\n')



#### Method process()
*Create infoLines[] array
*Tokenize CODE lines

prepare processed lines result array

        .infoLines = []

Regexp to match class/method markdown titles, they're considered CODE

        var titleKeyRegexp = /^(#)+ *(?:(?:public|export|default|helper|namespace)\s*)*(class|append to|function|method|constructor|properties)\b/i

Loop processing source code lines 

        var lastLineWasBlank=true, inCodeBlock=false

        .sourceLineNum = 0
        while .nextSourceLine()

get line indent, by counting whitespace (index of first non-whitespace: \S ),
then trim() the line

            var line = .line
            var indent = line.search(/\S/)
            line = line.trim()

LiteScript files (.lite.md) are "literate" markdown code files.

To be considered "code", a block of lines must be indented at least four spaces. 
(see: Github Flavored MarkDown syntax)

The exception are: MARKDOWN TITLES (###) introducing classes, methods and functions.

* MarkDown level 3 title plus a space '### ' is considered CODE indented 4 spaces if
  the line starts with: `[public|export|default|helper|namespace] [class|function|append to]`

* MarkDown level 4 title plus one space '#### ' is considered CODE indented 5 spaces if:
  * the line starts with: `[constructor|method|properties`]

Anything else starting on col 1, 2 or 3 is a literate comment, MD syntax.

Now, process the lines with this rules

            var type

a blank line is always a blank line

            if no line 
                type = LineTypes.BLANK

else, if indented 4 spaces or more, can be the start of a code block

            else 
                if indent >= 4
                    if lastLineWasBlank,inCodeBlock = true

else, (not indented 4) probably a literate comment,
except for title-keywords 

                else
                    inCodeBlock = false

                    if indent is 0 # ...starts on column 1

check for title-keywords: e.g.: `### Class MyClass`, `### export Function compile(sourceLines:string array)`

                        if titleKeyRegexp.exec(line) into var foundTitleKey

if found, rewrite the line, replacing MarkDown title MD hashs (###) by spaces 
and making keywords lowercase

                          line = foundTitleKey[0].replace(/#/g," ").toLowerCase() + line.slice(foundTitleKey[0].length)

re-check indent, inform now if indent is less than 4

                          indent = line.search(/\S/)
                          if indent<4, .throwErr "MarkDown Title-keyword, expected at least indent 4 ('\#\#\# ')"
                          inCodeBlock = true

                    #end if - special kws

                #end if - line, check indent

After applying rules: if we're in a Code Block, is CODE, else is a COMMENT

                if inCodeBlock

                    if line.startsWith("#") or line.startsWith("//") # CODE by indent, but all commented
                      type = LineTypes.COMMENT
                    else
                      type = LineTypes.CODE
                
                else
                    type = LineTypes.COMMENT
                #end if

            #end if line wasnt blank

parse multi-line string (triple quotes) and convert to one logical line: 
Example: var a = 'first line\nsecond line\nThat\'s all\n'

            if type is LineTypes.CODE 
              line = .parseTripleQuotes( line )

check for multi-line comment, C and js style /* .... */ 

            if .checkMultilineComment(type, indent, line )
                continue #found and pushed multiline comment, continue with next line

Create infoLine, with computed indent, text, and source code line num reference 

            var infoLine = new InfoLine(this, type, indent, line, .sourceLineNum )
            infoLine.dump() # debug

            .infoLines.push infoLine 

            lastLineWasBlank = type is LineTypes.BLANK
            
            

        #end loop, process next source line


Now, after processing all lines, we tokenize each CODE line

        debug "---- TOKENIZE"

        for each item in .infoLines

            item.dump() # debug
        
            if item.type is LineTypes.CODE
                item.tokenize(this)
            end if

        end loop code lines

now we have a infoLine array, tokenized, ready to be parsed
clear source lines from memory

        .lines = undefined

reset Lexer position, to allow the parser to start reading tokens

        .lineInx = -1 #line index
        .infoLine = null #current infoLine
        .index = -1 #token index

        .last = .getPos() #last position

read first token

        .nextToken() 

    #end Lexer process


Next Source Line
----------------

#### method nextSourceLine()

returns false is there are no more lines

        if .sourceLineNum >= .lines.length
          return false

get source line, replace TAB with 4 spaces, remove trailing withespace and remove CR

        .line = .lines[.sourceLineNum].replace(/\t/g,'    ').replace(/\s+$/,'').replace(/\r/,'')
        .sourceLineNum++ # note: source files line numbers are 1-based

        return true


----------------------------
Multiline strings
-----------------

#### method parseTripleQuotes(line:string)

This method handles `"""` triple quotes multiline strings
Mulitple coded-enclosed source lines are converted to one logical infoLine

Example:
/*
 var c = """
   first line
   second line
   That's all
   """.length

gets converted to:
<pre>
  var c = 'first line\nsecond line\nThat\'s all\n'.length
  ^^^^^^^   ^^^^^^^                               ^^^^^
    pre    |- section                          --| post
</pre>
*/

Get section between """ and """

        var result = new MultilineSection(this,line, '"""', '"""')
        if result.section

            #discard first and last lines, if empty
          if not (result.section[0].trim())
            result.section.shift()

          if not (result.section[result.section.length-1].trim())
            result.section.pop()

            #trim all lines
          for each inx,sectionLine in result.section
            result.section[inx]=sectionLine.trim()

          line = result.section.join("\\n") #join with (encoded) newline char
          line = line.replace(/'/g,"\\'") #escape quotes
          line = result.pre + " " + line.quoted("'") + result.post #add pre & post

        return line

      #end parse triple quotes

----------------------------
#### method checkMultilineComment(lineType, startLineIndent, line)

This method handles multiline comments: `/*` `*/` 

        var startSourceLine = .sourceLineNum

        var result = new MultilineSection(this, line, '/*', '*/')
        if no result.section
          return false

        if result.section.length is 1 # just one line
          line = result.pre + ' ' + result.post + "//" + result.section[0]
          .infoLines.push(new InfoLine(this, lineType, startLineIndent, line, startSourceLine))  

        else 
          if result.pre
              .infoLines.push(new InfoLine(this, lineType, startLineIndent, result.pre, startSourceLine))  

          for each inx,sectionLine in result.section
              .infoLines.push(new InfoLine(this, LineTypes.COMMENT, 0, sectionLine, startSourceLine+inx))  

          if result.post.trim() 
              log.warning "#{.filename}:#{.sourceLineNum}:1. Do not add text on the same line after `*/`. Indent is not clear"
              .infoLines.push(new InfoLine(this, LineTypes.CODE, result.postIndent, result.post, .sourceLineNum))  

        return true #OK, lines processed



----------------------------
Methods getPos() and setPos() are used to save and restore a specific lexer position in code
When a AST node parse() fails, the lexer position is rewound to try another AST class

#### method getPos()
        #return {lineInx:.lineInx, index:.index, sourceLineNum:.sourceLineNum, token:.token, last:.last}
        return new LexerPos(this)

----------------------------

#### method setPos(pos:LexerPos)

        .lineInx = pos.lineInx

        if .lineInx>=0 and .lineInx<.infoLines.length
            .infoLine = .infoLines[.lineInx]
            .indent = .infoLine.indent
        else
            .infoLine = null
            .indent = 0

        .index = pos.index
        .sourceLineNum = pos.sourceLineNum
        .token = pos.token
        .last = pos.last


#### helper method posToString()
Create a full string with last position. Useful to inform errors

        if .last, return .last.toString()
        return .getPos().toString()


        /*
        if no .last.token
            .last.token = {column:0}

        var col = (.last.token.column or .infoLine.indent or 0 ) 

        return "#{.filename}:#{.last.sourceLineNum}:#{col+1}"
        */

----------------------------
getPrevIndent() method returns the indent of the previous code line
is used in 'Parser.lite' when processing an indented block of code, 
to validate the line indents and give meaningful compiler error messages

#### method getPrevIndent()
        var inx = .lineInx-1
        while inx >=0
            if .infoLines[inx].type is LineTypes.CODE
                return .infoLines[inx].indent
            inx -= 1

        return 0

----------------------------------------------------
This functions allows the parser to navigate lines and tokens
of the lexer. It returns the next token, advancing the position variables.
This method returns CODE tokens, "NEWLINE" tokens (on each new line) or the "EOF" token.
All other tokens (COMMENT and WHITESPACE) are discarded.


#### method consumeToken()

loop until a CODE token is found

        while true

loop until a valid CODE infoLine is selected

            .token = null
            while true

if no line selected

                if not .infoLine

                    .index = -1

get next CODE line

                    if not .nextCODELine()

if no more CODE lines -> EOF

                        .infoLine = new InfoLine(this, LineTypes.CODE, -1, '', .lineInx)
                        .token = new Token('EOF')
                        .infoLine.tokens = [.token]
                        .indent = -1
                        return

since we moved to the next line, return "NEWLINE" token

                    .sourceLineNum = .infoLine.sourceLineNum
                    .indent = .infoLine.indent
                    .token = new Token('NEWLINE')
                    return

get next token in the line

                if no .infoLine.tokens
                  debugger


                .index += 1
                if .index < .infoLine.tokens.length
                    break #ok, a line with tokens

if there was no more tokens, set infoLine to null, 
and continue (get the next line)

                .infoLine = null

            #end while

Here we have a infoLine, where type is CODE
Get the token

            .token = .infoLine.tokens[.index]

if the token is a COMMENT, discard it, 
by continuing the loop (get the next token)

            if .token.type is 'COMMENT'
                continue #discard COMMENT

if it is not a COMMENT, break the loop
returning the CODE Token in lexer.token

            else
                break #the loop, CODE token is in lexer.token

        #loop #try to get another

      #end method consumeToken

---------------------------------------------------------

#### method nextToken()

Save current pos, and get next token

        .last = .getPos()

        .consumeToken()

        #debug
        debug ">>>ADVANCE", "#{.sourceLineNum}:#{.token.column or 0} [#{.index}]", .token.toString()
        
        return true


-----------------------------------------------------

#### method returnToken()
        #restore last saved pos (rewind)

        .setPos .last
        debug '<< Returned:',.token.toString(),'line',.sourceLineNum 

-----------------------------------------------------
This method gets the next line CODE from infoLines
BLANK and COMMENT lines are skipped.
return true if a CODE Line is found, false otherwise

#### method nextCODELine()

        if .lineInx >= .infoLines.length
            return false # no more lines

loop until a CODE line is found

        while true

            .lineInx += 1
            if .lineInx >= .infoLines.length
                return false # no more lines
Get line

            .infoLine = .infoLines[.lineInx]

if it is a CODE line, store in lexer.sourceLineNum, and return true (ok)

            if .infoLine.type is LineTypes.CODE

                .sourceLineNum = .infoLine.sourceLineNum
                .indent = .infoLine.indent
                .index = -1

                return true #ok nextCODEline found

        #end while

      #end method


-----------------------------------------------------------------------
**say** emit error (but continue compiling)

#### method say()

        .errCount+=1
        log.error.apply(this,arguments)

      #end 


-----------------------------------------------------------------------
**throwErr** add lexer position and emit error (abort compilation)

#### method throwErr(msg)

        var err = new Error("#{.posToString()} #{msg}")
        err.controled = true 
        throw err

      #end 

-----------------------------------------------------------------------
**sayErr** add lexer position and emit error (but continue compiling)

#### method sayErr(msg)

        .errCount+=1
        log.error(.posToString(), msg)

      #end 

**warn** add lexer position and emit warning (continue compiling)

#### method warn(msg)

        log.warning(.posToString(), msg)

      #end 

      #end 


----------------------

Token Recognition Regex Patterns
--------------------------------

Single line comments starts with `#` or `//`, to the end of the line.
Comments can also be multiline, starting with starting with `/*` and ending with `*/` 

    var tokenPatterns = [['COMMENT', /^#(.*)$|^\/\/(.*)$/],

**Numbers** can be either in hex format (like `0xa5b`) or decimal/scientific format (`10`, `3.14159`, or `10.02e23`).
There is no distinction between floating point and integer numbers.

        ['NUMBER',/^0x[a-f0-9]+/i ],
        ['NUMBER',/^[0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?/i],

Regex tokens are regular expressions. The javascript producer, just passes the raw regex to JavaScript.

        ['REGEX', /^(\/(?![\s=])[^[\/\n\\]*(?:(?:\\[\s\S]|\[[^\]\n\\]*(?:\\[\s\S][^\]\n\\]*)*])[^[\/\n\\]*)*\/)([imgy]{0,4})(?!\w)/],

Strings can be either single or double quoted.

        ['STRING', /^'(?:[^'\\]|\\.)*'/],
        ['STRING', /^"(?:[^"\\]|\\.)*"/],

Whitespace is discarded by the lexer, but needs to exist to break up other tokens.
We recognize ' .' (space+dot) to be able to recognize: 'myFunc .x' as alias to: 'myFunc this.x'

        ['SPACE_DOT',/^\s+\./],
        ['WHITESPACE',/^[\f\r\t\v\u00A0\u2028\u2029 ]+/],

ASSIGN are symbols triggering the assignment statements.
In LiteScript, assignment is a *statement* and not a *expression*

        ['ASSIGN',/^=/],
        ['ASSIGN',/^[\+\-\*\/]=/ ], # = += -= *= /=

Postfix and prefix ++ and -- are considered 'LITERAL' 
They're not considered 'operators' since they do no introduce a new operand.
Postfix ++ and -- are modifiers for a variable reference
also puctuation symbols (like `,` `[` `:`) 

        ['LITERAL',/^(\+\+|--)/],
        ['LITERAL',/^[\(\)\[\]\;\,\.\{\}]/],


A -binary- operator is a  symbol or a word (like `>=` or `+` or `and`), that sits between
two operands in a `Expressions`. We DO NOT include "Unary Operators" here.

        ['OPER', /^(is|isnt|not|and|but|into|like|or|in|into|instance|instanceof|has|hasnt)\b/],
        ['OPER', /^(\*|\/|\%|\+|-|<>|>=|<=|>>|<<|>|<|!==|\&|\~|\^|\|)/],
        ['OPER', /^[\?\:]/],

Identifiers (generally variable names), must start with a letter, `$`, or underscore.
Subsequent characters can also be numbers. Unicode characters are supported in variable names.

        ['IDENTIFIER',/^[$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*/] ]


The Token Class
===============

* a `value` (parsed text)
* and the column in the source line in which the token appears

    class Token
    
        properties
          type:string
          value:string
          column

        constructor(type, tokenText, column)

            .type = type 
            .value = tokenText or ' ' # no text is represened by ' ', since '' is 'falsey'
            .column = column
        
        method toString()
            return "'#{.value}'(#{.type})"


InfoLine Class
==============

The lexer turns each input line into a **infoLine**
A **infoLine** is a clean, tipified, indent computed, trimmed line
it has a source line number reference, and a tokens[] array if it's a CODE line

Each "infoLine" has: 
* a line "type" of: `BLANK`, `COMMENT` or `CODE` (LineTypes), 
* a tokens[] array if it's `CODE` 
* sourceLineNum: the original source line number (for SourceMap)
* indent: the line indent
* text: the line text (clean, trimmed)

    class InfoLine
    
      properties
          type
          indent,sourceLineNum
          text:String
          tokens: Token array

      constructor(lexer,type,indent,text,sourceLineNum)
        .type = type
        .indent = indent
        .text = text
        .sourceLineNum = sourceLineNum

        #.dump() #debug info

      #end InfoLine constructor

             
      method dump() # out debug info

        if .type is LineTypes.BLANK
          debug .sourceLineNum,"(BLANK)"
          return

        var type = ""
        if .type is LineTypes.COMMENT
          type="COMMENT"
        else if .type is LineTypes.CODE
          type="CODE"
        
        debug .sourceLineNum, "#{.indent}(#{type})", .text
        if .tokens
            debug('   ',.tokens.join(' '))
            debug()


The Tokenize method
-------------------

The Infoline.tokenize() method, creates the 'tokens' array by parsing the .text 
It also replaces *Embdeded Expressions* #{} in string constants, storing the expression tokens

      method tokenize(lexer)

        var code = .text
        
        try

            var words=[]
            var result=[]
            var colInx = 0

            #debug
            var msg = ""

            while colInx < code.length

              var chunk = code.slice(colInx)

This for loop will try each regular expression in `tokenPatterns` 
against the current head of the code line until one matches.

              var match=''
              var tokenType=''
              for each typeRegExpPair in tokenPatterns
                var regex:RegExp = typeRegExpPair[1]
                var matches = regex.exec(chunk)
                if matches and matches[0]
                    match = matches[0]
                    tokenType = typeRegExpPair[0] 
                    break

              #end for checking patterns

If there was no match, this is a bad token and we will abort compilation here.

              if no match

                msg = "(#{lexer.filename}:#{.sourceLineNum}:#{colInx+1}) Tokenize patterns: invalid token: #{chunk}"
                log.error msg
                log.error code

                var errPosString=''
                while errPosString.length<colInx
                    errPosString+=' '

                log.error errPosString+'^'

                var err = new Error(msg)
                err.controled = true
                raise err

              #end if

If its 'WHITESPACE' we ignore it. 

              if tokenType is 'WHITESPACE'
                  do nothing #ignore it

              else

create token 

                  var token = new Token(tokenType, match, .indent + colInx + 1 )

                  words.push(match)

If its a string constant, and it has `#{`|`${`, process the **Interpolated Expressions**.

                  if tokenType is 'STRING' and match.length>3 and "#{lexer.stringInterpolationChar}{" in match

                    declare parsed:Array

                    #parse the string, splitting at #{...}, return array 
                    var parsed = String.splitExpressions(match, lexer.stringInterpolationChar)

                    #if the first expression starts with "(", we add `"" + ` so the parentheses
                    # can't be mis-parsed as a "function call"
                    if parsed.length and parsed[0].startsWith("(")
                      parsed.unshift('""')

                    #join expressions using +, so we have a valid composed expression, evaluating to a string.
                    var composed = new InfoLine(lexer, LineTypes.CODE, token.column, parsed.join(' + '), .sourceLineNum  )

                    #Now we 'tokenize' the new composed expression
                    composed.tokenize(lexer)

                    #And we append the new tokens instead of the original string constant
                    result = result.concat( composed.tokens )

                  else

Else it's a single token. Add the token to result array

                    #debug
                    msg += token.toString()

                    result.push(token)

                  #end if

              #end if WITHESPACE

Advance col index into code line

              colInx += match.length

            #end while text in the line

            #debug
            #debug msg

Store tokenize result in tokens

            .tokens = result

Special lexer options: string interpolation char
`lexer options string interpolation char [is] (IDENTIFIER|LITERAL|STRING)`

            if words[0] is 'lexer'
              if words.slice(0,5).join(" ") is "lexer options string interpolation char" 
                .type = LineTypes.COMMENT # not a CODE line
                lexer.stringInterpolationChar = words[5] #get it 
                if lexer.stringInterpolationChar is 'is' #optional 'is'
                  lexer.stringInterpolationChar= words[6] 
                if lexer.stringInterpolationChar[0] in ['"',"'"] #optionally quoted
                  lexer.stringInterpolationChar=lexer.stringInterpolationChar.slice(1,-1)
                if not lexer.stringInterpolationChar #check
                  lexer.throwErr "missing string interpolation char"


enhance error reporting

        catch e
            log.error "#{lexer.filename}:#{.sourceLineNum}:#{colInx+1}",e.message
            log.error msg
            throw e


--------------------------

### helper class LexerPos

      properties
        lexer, lineInx,sourceLineNum
        index,token,last

      constructor new LexerPos(lexer)
        .lexer = lexer
        .lineInx = lexer.lineInx
        .index = lexer.index
        .sourceLineNum = lexer.sourceLineNum
        .token = lexer.token
        .last = lexer.last

      method toString()
        if no .token, .token = {column:0}
        return "#{.lexer.filename}:#{.sourceLineNum}:#{(.token.column or 0)+1}"


----------------------------------------------------------------------------------------------

### helper Class MultilineSection
This is a helper class the to get a section of text between start and end codes

      properties

        pre:string, section:string array, post:string
        postIndent

      constructor (lexer, line:string, startCode:string, endCode:string)

check if startCode is in the line, if not found, exit 

        var startCol = line.indexOf(startCode)
        if startCol<0 
            #no start code found
            return 

get rid of quoted strings. Still there?

        if String.replaceQuoted(line,"").indexOf(startCode)<0
            return #no 

ok, found startCode, initialize

        debug "**** START MULTILINE ",startCode

        this.section = []
        var startSourceLine = lexer.sourceLineNum

Get and save text previous to startCode

        this.pre = line.slice(0, startCol).trim()

Get text after startCode

        line = line.slice(startCol+startCode.length).trim()

read lines until endCode is found

        var endCol
        do until line.indexOf(endCode) into endCol >= 0 #found end of section

            # still inside the section
            this.section.push line

            #get next line
            if no lexer.nextSourceLine()
                lexer.sayErr "EOF while processing multiline #{startCode} (started on #{lexer.filename}:#{startSourceLine}:#{startCol})"
                return

            line = lexer.line

        loop #until end of section

get text after endCode (is multilineSection.post)

        this.post = line.slice(endCol+endCode.length)

text before endCode, goes into multiline section

        line = line.slice(0, endCol)
        if line 
          this.section.push line

        this.postIndent = endCol+endCode.length


------------------------
----------------------------------------------------------------------------------------------

### Public Helper Class OutCode
This class contains helper methods for AST nodes's `produce()` methods
It also handles SourceMap generation for Chrome Developer Tools debugger and Firefox Firebug

#### Properties

      lineNum, column
      currLine:string
      lines:string array
      addSourceAsComment = true
      lastOriginalCodeComment
      lastOutCommentLine
      sourceMap
      browser:boolean
      exportNamespace

#### Method start(enableSourceMap)
Initialize output array

        .lineNum=1
        .column=1
        .lines=[]
        
        .lastOriginalCodeComment = 0
        .lastOutCommentLine = 0

        if enableSourceMap and type of window is 'undefined' #in node
            import SourceMap
            .sourceMap = new SourceMap

#### Method put(text:string)
put a string into produced code

if no current line
create a empty one

        if .currLine is undefined
            .currLine=""
            .column=1

append text to line 

        if text
            .currLine += text
            .column += text.length


#### Method startNewLine()
Start New Line into produced code

send the current line

          if .lineNum>1 or .currLine
              .lines.push .currLine or ""
              debug  .lineNum, .currLine or ""

clear current line

          .lineNum += 1
          .column = 1
          .currLine = undefined


#### method getResult()
get result and clear memory      

        .startNewLine() #close last line
        var result = .lines
        .lines = []
        return result

#### helper method addSourceMap(sourceLin, sourceCol)

        if .sourceMap
            .sourceMap.add ( (sourceLin or 1)-1, (sourceCol or 1)-1,   
                             .lineNum-1, .column-1 )


------------------------
Exports
=======

    
    #make LineTypes const available as .lexer.LineTypes
    Lexer.prototype.LineTypes = LineTypes

    module.exports = Lexer 
