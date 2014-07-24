The Parser Module
=================

The main class in this module is the Lexer.

The Lexer translates code (an array of lines) into an array of tokenized lines to be parsed.

The Lexer class acts as 
* Lexer/Tokenizer
* Token Stream (input)

All the parts of the lexer work with "arrays" of lines.
(instead of a buffer or a large string)

The first lexer pass analyzes entire lines. 
Each line of the array is classified with a 'Line Type': CODE, COMMENT or BLANK

then each CODE line is *Tokenized*, getting a `tokens[]` array

-------------------------
### dependencies

    import 
        ControlledError, GeneralOptions
        logger, Strings


    global import fs

    shim import Map, PMREX, mkPath

module vars

    var preprocessor_replaces: map string to string

The Lexer Class
===============

### public Class Lexer

The Lexer class turns the input lines into an array of "infoLines"

#### properties 

        project
        filename:string
        options: GeneralOptions

        lines:string array
        infoLines: InfoLine array

        #current line
        line :string 
        indent 
        lineInx, sourceLineNum
        infoLine, token, index

        interfaceMode: boolean
        stringInterpolationChar: string

        last:LexerPos
        maxSourceLineNum=0 //max source line num in indented block

        hardError:Error, softError:Error

        outCode: OutCode

#### Constructor new Lexer(project, options:GeneralOptions)

          //.compiler = compiler #Compiler.lite.md module.exports
          .project = project #Compiler.lite.md class Project

use same options as compiler

          .options = options

          default options.browser = undefined
          default options.comments = 1 #comment level

          preprocessor_replaces = map
              DATE: .options.now.toDateString()
              TIME: .options.now.toTimeString()
              TIMESTAMP: .options.now.toISOString()

stringInterpolationChar starts for every file the same: "#"
can be changed in-file with `lexer options` directive

          .stringInterpolationChar = "#" 

          .hardError = null # stores most significative (deepest) error, when parsing fails

clear out helper

          .outCode = new OutCode() #helper class
          .outCode.start .options

we start with an empty Token
          
          .token = new Token()
          
      #end constructor

#### Method reset()

        .sourceLineNum = 0
        .lineInx=0
        .lines=""
        .setPos .last


#### Method initSource(filename:string, source:String)
Load filename and source code in the lexer.
First, remember filename (for error reporting) 

          .filename = filename
          .interfaceMode = filename.indexOf('.interface.') isnt -1

create source lines array

          if source instanceof Array
            .lines = source

          else

If code is passed as a buffer, convert it to string
then to lines array 

            if typeof source isnt 'string', source = source.toString()
            
            .lines = source.split('\n')
            .lines.push "" # add extra empty line


#### Method preParseSource() returns InfoLine array
read from .sourceLines and 
prepares a processed infoLines result array

        var infoLines = []

Loop processing source code lines 

        var lastLineWasBlank=true, inCodeBlock=false

        .sourceLineNum = 0
        do while .nextSourceLine()

get line indent, by counting whitespace (index of first non-whitespace: \S ),
then trim() the line

            var line = .line
            var indent = line.countSpaces()
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

                    if indent is 0 and line.charAt(0) is '#' //starts on column 1, with a '#'

checkTitleCode: if found a vlid title-code, rewrite the line, 
replacing MarkDown title MD hashs (###) by spaces and making keywords lowercase

                        if .checkTitleCode(line) into var converted 

                            line = converted 
                            indent = line.countSpaces() //re-calc indent
                            inCodeBlock = indent>=4

                    end if startted with #

                end if - line, check indent

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
Example result: var a = 'first line\nsecond line\nThird line\n'

            #saver reference to source line (for multiline)
            var sourceLineNum = .sourceLineNum

            if type is LineTypes.CODE 
                line = .preprocessor(.parseTripleQuotes( line ))

check for multi-line comment, C and js style /* .... */ 
then check for "#ifdef/#else/#endif"

            if .checkMultilineComment(infoLines, type, indent, line )
                continue #found and pushed multiline comment, continue with next line

            else if .checkConditionalCompilation(line)
                continue #processed, continue with next line

Create infoLine, with computed indent, text, and source code line num reference 

            var infoLine = new InfoLine(this, type, indent, line, sourceLineNum )
            infoLine.dump() # debug

            infoLines.push infoLine 

            lastLineWasBlank = type is LineTypes.BLANK
            
        loop #process next source line

now we have a infoLine array, tokenized, ready to be parsed
if we do not need to produce comments with original source
for reference at produced .c or .js, clear source lines from memory 

        if no .options.comments
            .lines = undefined

        return infoLines
  

#### method checkTitleCode(line:string) returns string // or undefined

check for title-keywords: e.g.: `### Class MyClass`, `### export Function compile(sourceLines:string array)`

        //var titleKeyRegexp = /^(#)+ *(?:(?:public|export|default|helper)\s*)*(class|namespace|append to|function|method|constructor|properties)\b/i

        var words = line.split(" ")

        if words[0].length<3, return // should be at least indent 4: '### '

        // return if first word is not all #'s
        if words[0].replaceAll("#"," ").trim(), return 

        var sustantives = ["class","namespace","function","method","constructor","properties"];

        var inx=1, countAdj=0, countSust=0, sustLeft=1

        while inx<words.length

            if words[inx] //skip empty items

                if words[inx].toLowerCase() in ["public","export","default","helper"]
                    countAdj++ //valid
                else
                  break //invalid word
            
            inx++ //next

        if no countAdj and inx<words.length-1
            if words[inx].toLowerCase() is 'append'
                inx++ //skip 'append'
                if words[inx] is 'to', inx++ //skip to

        while inx<words.length

            if words[inx] into var w:string //skip empty items
            
                if w.indexOf('(') into var posParen <> -1
                    //split at "(". remove composed and insert splitted at "("
                    words.splice inx,1, w.slice(0,posParen), w.slice(posParen)
                    w = words[inx]

                if w.toLowerCase() in sustantives
                    countSust++ //valid
                    break //exit, sustantive found
                else
                  break //invalid word
            
            inx++ //next

        if countAdj>1 and no countSust, .throwErr "MarkDown Title-keyword, expected a sustantive: #{sustantives.join()}"

        if countSust

            if words[0].length<3, .throwErr "MarkDown Title-keyword, expected at least indent 4: '### '"

            for recogn=1 to inx //each recognized word, convert to lowercase
                words[recogn]=words[recogn].toLowerCase()

            words[0] = words[0].replaceAll("#"," ") //replace # by ' '

            return words.join(' ') // re-join



#### method tokenize

*Tokenize CODE lines

Now, after processing all lines, we tokenize each CODE line

        logger.debug "---- TOKENIZE"

        for each item in .infoLines

            try
            
                item.dump() # debug

                if item.type is LineTypes.CODE
                    item.tokenizeLine(this)
                end if

            catch err
                //adds position info
                throw new ControlledError("#{.filename}:#{item.sourceLineNum}:1 #{err.message}")

        end loop code lines

reset Lexer position, to allow the parser to start reading tokens

        .lineInx = -1 #line index
        .infoLine = null #current infoLine
        .index = -1 #token index

        .last = .getPos() #last position

read first token

        .nextToken() 

    #end Lexer tokenize


Pre-Processor
-------------

#### method preprocessor(line:string)

This is a ver crude preprocessor.
Here we search for simple macros as __DATE__, __TIME__ , __TMESTAMP__

        for each macro,value in map preprocessor_replaces
            line=line.replaceAll("__#{macro}__",value)

        return line



#### method process()

Analyze generated lines. preParseSource() set line type, calculates indent, 
handles multiline string, comments, string interpolation, etc.

      .infoLines = .preParseSource()

Tokenize final lines

      .tokenize

Next Source Line
----------------

#### method nextSourceLine()

returns false is there are no more lines

        if .sourceLineNum >= .lines.length
            return false

get source line, replace TAB with 4 spaces, remove trailing withespace and remove CR

        .line = .lines[.sourceLineNum].replaceAll("\t",'    ').trimRight().replaceAll("\r","")
        .sourceLineNum++ # note: source files line numbers are 1-based

        return true

#### method replaceSourceLine(newLine)
        .lines[.sourceLineNum-1] = newLine


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
          if no result.section[0].trim()
            result.section.shift()

          if no result.section[result.section.length-1].trim()
            result.section.pop()

          #search min indent
          var indent = 999
          for each sectionLine1 in result.section
            var lineIndent=sectionLine1.countSpaces()
            if lineIndent>=0 and lineIndent<indent
                indent = lineIndent

          #trim indent on the left and extra right spaces
          for each inx,sectionLine in result.section
            result.section[inx] = sectionLine.slice(indent).trimRight()

          #join with (encoded) newline char and enclose in quotes (for splitExpressions)
          line = result.section.join("\\n").quoted('"') 

Now we should escape internal d-quotes, but only *outside* string interpolation expressions

          var parsed = .splitExpressions(line,.stringInterpolationChar)
          for each inx,item:string in parsed
              if item.charAt(0) is '"' //a string part
                  item = item.slice(1,-1) //remove quotes
                  parsed[inx] = item.replaceAll('"','\\"') #store with *escaped* internal d-quotes
              else
                  #restore string interp. codes
                  parsed[inx] = "#{.stringInterpolationChar}{#{item}}"

          #re-join & re.enclose in quotes
          line = parsed.join("").quoted('"') 
          line = "#{result.pre} #{line}#{result.post}" #add pre & post

        return line

      #end parse triple quotes

----------------------------
#### method checkMultilineComment(infoLines:InfoLine array, lineType, startLineIndent, line)

This method handles multiline comments: `/*` `*/` 

        var startSourceLine = .sourceLineNum

        var result = new MultilineSection(this, line, '/*', '*/')
        if no result.section
          return false

        if result.section.length is 1 # just one line
          line = "#{result.pre} #{result.post}//#{result.section[0]}"
          infoLines.push(new InfoLine(this, lineType, startLineIndent, line, startSourceLine))  

        else 
          if result.pre
              infoLines.push(new InfoLine(this, lineType, startLineIndent, result.pre, startSourceLine))  

          for each inx,sectionLine in result.section
              infoLines.push(new InfoLine(this, LineTypes.COMMENT, 0, sectionLine, startSourceLine+inx))  

          if result.post.trim() 
              logger.warning "#{.filename}:#{.sourceLineNum}:1. Do not add text on the same line after `*/`. Indent is not clear"
              infoLines.push(new InfoLine(this, LineTypes.CODE, result.postIndent, result.post, .sourceLineNum))  

        return true #OK, lines processed

----------------------------
#### method checkConditionalCompilation(line:string)

This method handles "#ifdef/#else/#endif" as multiline comments

        var startSourceLine = .sourceLineNum

        var words: string array

        var isDefine = line.indexOf("#define ")
        if isDefine>=0
            words = line.trim().split(' ')
            .project.setCompilerVar words[1],true
            return false

        var isUndef = line.indexOf("#undef ")
        if isUndef>=0
            words = line.trim().split(' ')
            .project.setCompilerVar words[1],false
            return false

ifdef, #ifndef, #else and #endif should be the first thing on the line

        if line.indexOf("#endif") is 0, .throwErr 'found "#endif" without "#ifdef"'
        if line.indexOf("#else") is 0, .throwErr 'found "#else" without "#ifdef"'

        var invert = false
        var pos = line.indexOf("#ifdef ")
        if pos isnt 0 
            pos = line.indexOf("#ifndef ")
            invert = true

        if pos isnt 0, return 

        var startRef = "while processing #ifdef started on line #{startSourceLine}"

        words = line.slice(pos).split(' ')
        var conditional = words.tryGet(1)
        if no conditional, .throwErr "#ifdef; missing conditional"
        var defValue = .project.compilerVar(conditional)
        if invert, defValue = not defValue //if it was "#ifndef"

        .replaceSourceLine .line.replaceAll("#if","//if")

        var endFound=false
        do
            #get next line
            if no .nextSourceLine(),.throwErr "EOF #{startRef}"
            line = .line
            
            if line.countSpaces() into var indent >= 0
                line = line.trim()
                if line.charAt(0) is '#' and line.charAt(1) isnt '#' //expected: "#else, #endif #end if"
                    words = line.split(' ')
                    case words.tryGet(0)
                        when '#else'
                            .replaceSourceLine .line.replaceAll("#else","//else")
                            defValue = not defValue
                        when "#end"
                            if words.tryGet(1) isnt 'if', .throwErr "expected '#end if', read '#{line}' #{startRef}"
                            endFound = true
                        when "#endif"
                            endFound = true
                        else
                            .throwErr "expected '#else/#end if', read '#{line}' #{startRef}"
                    end case
                else
                    // comment line if .compilerVar not defined (or processing #else)
                    //and this is not a blank line
                    if not defValue and line, .replaceSourceLine "#{String.spaces(indent)}//#{line}"
                end if
            end if              
        loop until endFound

        .replaceSourceLine .line.replaceAll("#end","//end")

        #rewind position after #ifdef, reprocess lines
        .sourceLineNum = startSourceLine -1 
        return true #OK, lines processed


----------------------------
Methods getPos() and setPos() are used to save and restore a specific lexer position in code
When a AST node parse() fails, the lexer position is rewound to try another AST class

#### method getPos() returns LexerPos
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
        logger.debug ">>>ADVANCE", "#{.sourceLineNum}:#{.token.column or 0} [#{.index}]", .token.toString()
        
        return true


-----------------------------------------------------

#### method returnToken()
        #restore last saved pos (rewind)

        .setPos .last
        logger.debug '<< Returned:',.token.toString(),'line',.sourceLineNum 

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


#### method say()
**say** emit error (but continue compiling)

        logger.error.apply this,arguments


#### method throwErr(msg)
**throwErr** add lexer position and emit error (abort compilation)

        logger.throwControlled "#{.posToString()} #{msg}"

#### method sayErr(msg)
**sayErr** add lexer position and emit error (but continue compiling)

        logger.error .posToString(),msg


#### method warn(msg)
**warn** add lexer position and emit warning (continue compiling)

        logger.warning .posToString(),msg


#### method splitExpressions(text:string) returns array of string
split on #{expresion} using lexer.stringInterpolationChar

        var delimiter = .stringInterpolationChar

look for #{expression} inside a quoted string
split expressions

        if no text then return []

        //get quotes
        var quotes = text.charAt(0)
        if quotes isnt '"' and quotes isnt "'"
            .throwErr 'splitExpressions: expected text to be a quoted string, quotes included'

        var delimiterPos, closerPos, itemPos, item:string;
        var items=[];

        //clear start and end quotes
        var s:string = text.slice(1,-1)

        var lastDelimiterPos=0;
        
        do

            delimiterPos = s.indexOf("#{delimiter}{",lastDelimiterPos);
            if delimiterPos<0 then break

            // first part - text upto first delimiter
            pushAt items, s.slice(lastDelimiterPos,delimiterPos),quotes 
            
            var start = delimiterPos + 1

            closerPos = String.findMatchingPair(s,start,"}")

            if closerPos<0
                .throwErr "unmatched '#{delimiter}{' at string: #{text}"
           
            item = s.slice(start+1, closerPos);

            // add parens if expression
            var p = PMREX.whileRanges(item,0,"A-Za-z0-9_$.")
            if p<item.length then item = '(#{item})';

            lastDelimiterPos = closerPos + 1

            pushAt items, item //push expression

        loop

        // remainder
        pushAt items, s.slice(lastDelimiterPos),quotes

        return items
      
### end class Lexer

    // helper internal function
    helper function pushAt(arr:array, content:string, useQuotes)
        if content
            if useQuotes, content = content.quoted(useQuotes)
            arr.push content

----------------------

The Token Class
===============

Each token instance has:
-a "type" e.g.: NEWLINE,EOF, when the token is a special char
-a "value": the parsed text
-the column in the source line in which the token appears

    class Token
    
        properties
          type:string
          value:string
          column

        constructor(type, tokenText, column)

            .type = type 
            .value = tokenText or ' ' # no text is represened by ' ', since '' is "falsey" in js
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

      constructor new InfoLine(lexer,type,indent,text,sourceLineNum)
        .type = type
        .indent = indent
        .text = text
        .sourceLineNum = sourceLineNum

        #.dump() #debug info

      #end InfoLine constructor

             
      method dump() # out debug info

        if .type is LineTypes.BLANK
          logger.debug .sourceLineNum,"(BLANK)"
          return

        var type = ""
        if .type is LineTypes.COMMENT
          type="COMMENT"
        else if .type is LineTypes.CODE
          type="CODE"
        
        logger.debug .sourceLineNum, "#{.indent}(#{type})", .text
        if .tokens
            logger.debug('   ',.tokens.join(' '))
            logger.debug()


The Tokenize Line method
------------------------

The Infoline.tokenizeLine() method, creates the 'tokens' array by parsing the .text 
It also replaces *Embdeded Expressions* #{} in string constants, storing the expression tokens

      method tokenizeLine(lexer)

        var code = .text
        
        var words=[]
        var result=[]
        var colInx = 0

        #debug
        var msg = ""

        while colInx < code.length

            var chunk = code.slice(colInx)

This for loop will try each regular expression in `tokenPatterns` 
against the current head of the code line until one matches.

            var token = .recognizeToken(chunk)

If there was no match, this is a bad token and we will abort compilation here.

            if no token

                // calc position from line info (we're at post-lexexr)
                msg = "(#{lexer.filename}:#{.sourceLineNum}:#{colInx+1}) Tokenize patterns: invalid token: #{chunk}"
                logger.error msg 

                var errPosString=''
                while errPosString.length<colInx
                    errPosString='#{errPosString} '

                logger.error code
                logger.error '#{errPosString}^'

                logger.throwControlled "parsing tokens"

            end if

If its 'WHITESPACE' we ignore it. 

            if token.type is 'WHITESPACE'
                do nothing #ignore it

            else

set token column

                token.column = .indent + colInx + 1 

store value in a temp array to parse special lexer options

                words.push(token.value)

If its a string constant, and it has `#{`|`${`, process the **Interpolated Expressions**.

                if token.type is 'STRING' and token.value.length>3 and lexer.stringInterpolationChar & "{" in token.value

                    declare parsed:Array

                    #parse the quoted string, splitting at #{...}, return array 
                    var parsed = lexer.splitExpressions(token.value)

For C generation, replace string interpolation
with a call to core function "concat"

                #ifdef PROD_C
                    
                    // code a litescript call to "_concatAny" to handle string interpolation
                    // (the producer will add argc)
                    var composed = new InfoLine(lexer, LineTypes.CODE, token.column, 
                        "_concatAny(#{parsed.join(',')})", .sourceLineNum  )

                #else //-> JavaScript
                    //if the first expression isnt a quoted string constant
                    // we add `"" + ` so we get string concatenation from javascript.
                    // Also: if the first expression starts with `(`, LiteScript can 
                    // mis-parse the expression as a "function call"
                    if parsed.length and parsed[0][0] not in "\"\'" // if it do not start with quotes
                        parsed.unshift "''" // prepend ''
                    //join expressions using +, so we have a valid js composed expression, evaluating to a string.
                    var composed = new InfoLine(lexer, LineTypes.CODE, token.column, parsed.join(' + '), .sourceLineNum  )
                #end if

                    #Now we 'tokenize' the new composed expression
                    composed.tokenizeLine(lexer) #recurse

                    #And we append the new tokens instead of the original string constant
                    result = result.concat( composed.tokens )

                else

Else it's a single token. Add the token to result array

                    #ifndef NDEBUG
                    msg = "#{msg}#{token.toString()}"
                    #endif

                    result.push(token)

                end if

            end if WITHESPACE

Advance col index into code line

            colInx += token.value.length

        end while text in the line

        #debug
        #debug msg

Store tokenize result in .tokens

        .tokens = result

Special lexer options: string interpolation char
`lexer options string interpolation char [is] (IDENTIFIER|PUCT|STRING)`
`lexer options literal (map|object)`

        if words.tryGet(0) is 'lexer' and words.tryGet(1) is 'options'
            .type = LineTypes.COMMENT # is a COMMENT line

            if words.slice(2,5).join(" ") is "string interpolation char" 
                var ch:string
                if words.tryGet(5) into ch is 'is' then ch = words.tryGet(6) #get it (skip optional 'is')
                if ch.charAt(0) in ['"',"'"], ch = ch.slice(1,-1) #optionally quoted, remove quotes
                if no ch then fail with "missing string interpolation char"  #check
                lexer.stringInterpolationChar = ch
            
            else if words.slice(2,5).join(" ") is "object literal is" 
                if no words.tryGet(5) into lexer.options.literalMap
                    fail with "missing class to be used instead of object literals"  #check

            else
                fail with "Lexer options, expected: 'literal map'|'literal object'"
            
      end tokenizeLine

The recognize method
--------------------

The Infoline.recognize() method matches the current position in the text stream
with the known tokens, returning a new Token or undefined

      method recognizeToken(chunk:string) returns Token // or undefined

Comment lines, start with # or //

            if chunk.startsWith('#') or chunk.startsWith('//')
                return new Token('COMMENT',chunk)

Punctuation: 
We include also here punctuation symbols (like `,` `[` `:`)  and the arrow `->`
Postfix and prefix ++ and -- are considered also 'PUNCT'.
They're not considered 'operators' since they do no introduce a new operand, ++ and -- are "modifiers" for a variable reference.

  ['PUNCT',/^(\+\+|--|->)/],
  ['PUNCT',/^[\(\)\[\]\;\,\.\{\}]/],

            if chunk.charAt(0) in "()[]{};,." 
                return new Token('PUNCT',chunk.slice(0,1))
            if chunk.slice(0,2) in ["++","--","->"]
                return new Token('PUNCT',chunk.slice(0,2))

Whitespace is discarded by the lexer, but needs to exist to break up other tokens.
We recognize ' .' (space+dot) to be able to recognize: 'myFunc .x' as alias to: 'myFunc this.x'
We recognize ' [' (space+bracket) to be able to diferntiate: 'myFunc [x]' and 'myFunc[x]'

  ['SPACE_DOT',/^\s+\./],
  ['SPACE_BRACKET',/^\s+\[/],
  ['WHITESPACE',/^[\f\r\t\v\u00A0\u2028\u2029 ]+/],

            if chunk.startsWith(" .")
                return new Token('SPACE_DOT',chunk.slice(0,2))
            if chunk.startsWith(" [")
                return new Token('SPACE_BRACKET',chunk.slice(0,2))
            if PMREX.whileRanges(chunk,0," \t\r") into var whiteSpaceLength
                if chunk.charAt(whiteSpaceLength) in '.[', whiteSpaceLength-- //allow recognition of SPACE_DOT and SPACE_BRACKET
                return new Token('WHITESPACE',chunk.slice(0,whiteSpaceLength))

Strings can be either single or double quoted.

  ['STRING', /^'(?:[^'\\]|\\.)*'/],
  ['STRING', /^"(?:[^"\\]|\\.)*"/],

            if chunk.startsWith("'") or chunk.startsWith('"') 
                if PMREX.findMatchingQuote(chunk,0) into var quotedCount is -1, fail with "unclosed quoted string"
                return new Token('STRING',chunk.slice(0,quotedCount))

ASSIGN are symbols triggering the assignment statements.
In LiteScript, assignment is a *statement* not a *expression*

  ['ASSIGN',/^=/],
  ['ASSIGN',/^[\+\-\*\/\&]=/ ], # = += -= *= /= &=

            if chunk.startsWith("=")
                return new Token('ASSIGN',chunk.slice(0,1))
            if chunk.charAt(0) in "+-*/&" and chunk.charAt(1) is "=" 
                return new Token('ASSIGN',chunk.slice(0,2))

Regex tokens are regular expressions. The javascript producer, just passes the raw regex to JavaScript.

  ['REGEX', /^(\/(?![\s=])[^[\/\n\\]*(?:(?:\\[\s\S]|\[[^\]\n\\]*(?:\\[\s\S][^\]\n\\]*)*])[^[\/\n\\]*)*\/)([imgy]{0,4})(?!\w)/],

            if chunk.startsWith('/') 
                if PMREX.whileUnescaped(chunk,1,"/") into var endRegexp is -1, fail with "unclosed literal RegExp expression"
                return new Token('REGEX',chunk.slice(0,endRegexp))

A "Unary Operator" is a symbol that precedes and transform *one* operand.
A "Binary Operator" is a  symbol or a word (like `>=` or `+` or `and`), 
that sits between *two* operands in a `Expressions`. 

  ['OPER', /^(\*|\/|\%|\+|-|<>|>=|<=|>>|<<|>|<|!==|\~|\^|\bitor)/],
  ['OPER', /^[\?\:]/], //ternary if
  //identifier-like operators are handled in the identifier section below
  ['OPER', /^(is|isnt|not|and|but|into|like|or|in|into|instance|instanceof|has|hasnt|bitand|bitor)\b/],

            if chunk.slice(0,3) is '!=='
                return new Token('OPER',chunk.slice(0,3))

            if "|#{chunk.slice(0,2)}|" in "|<>|>=|<=|>>|<<|!=|"
                return new Token('OPER',chunk.slice(0,2))

            if chunk.charAt(0) in "><+-*/%&~^|?:" 
                return new Token('OPER',chunk.slice(0,1))

**Numbers** can be either in hex format (like `0xa5b`) or decimal/scientific format (`10`, `3.14159`, or `10.02e23`).
As in js, all numbers are floating point.

  ['NUMBER',/^0x[a-f0-9]+/i ],
  ['NUMBER',/^[0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?/i],

            if chunk.startsWith('0x')
                return new Token('NUMBER',chunk.slice(0, PMREX.whileRanges(chunk,2,"a-fA-F0-9")))
    
            if PMREX.whileRanges(chunk,0,"0-9") into var numberDigits
                if chunk.charAt(numberDigits) is '.', numberDigits = PMREX.whileRanges(chunk,numberDigits+1,"0-9")
                if chunk.charAt(numberDigits) is 'e', numberDigits = PMREX.whileRanges(chunk,numberDigits+1,"0-9")
                return new Token('NUMBER',chunk.slice(0, numberDigits))

Identifiers (generally variable names), must start with a letter, `$`, or underscore.
Subsequent characters can also be numbers. Unicode characters are supported in variable names.

Identifier-like OPERs, as: 'and', 'not', 'is','or' are checked before concluding is an IDENTIFIER

  ['IDENTIFIER',/^[$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*/] ]
  ['OPER', /^(is|isnt|not|and|but|into|like|or|in|into|instance|instanceof|has|hasnt|bitand|bitor)\b/],

a IDENTIFIER starts with A-Z a-z (a unicode codepoint), $ or _

            if PMREX.whileRanges(chunk,0,"A-Za-z\x7F-\xFF$_") into var wordLetters
                wordLetters = PMREX.whileRanges(chunk,wordLetters,"0-9A-Za-z_\x7F-\xFF") //Subsequent characters can also be numbers

                if "|#{chunk.slice(0,wordLetters)}|" in "|is|isnt|not|and|but|into|like|or|in|into|instance|instanceof|has|hasnt|bitand|bitor|"
                    return new Token('OPER',chunk.slice(0,wordLetters))

                return new Token('IDENTIFIER',chunk.slice(0,wordLetters))



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
        if no .token, .token = new Token(type='',tokenText='',column=0)
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

        // get rid of quoted strings. Still there?
        if String.replaceQuoted(line,"").indexOf(startCode)<0
            return #no 

ok, found startCode, initialize

        logger.debug "**** START MULTILINE ",startCode

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

Exported Module vars
------------------------

### Public namespace LineTypes 
        properties 
            CODE = 0
            COMMENT = 1
            BLANK = 2

### Public Helper Class OutCode
This class contains helper methods for AST nodes's `produce()` methods
It also handles SourceMap generation for Chrome Developer Tools debugger and Firefox Firebug

#### Properties

      lineNum, column
      currLine: DynBuffer

      header:number = 0 //out to different files, 0:.c/.js 1:.h 2:.extra
      fileMode:boolean // if output directly to file
      filenames=['','',''] //filename for each group
      fileIsOpen=[false,false,false] //filename for each group
      fHandles=[null,null,null] //file handle for each group


      lines:array  // array of array of string lines[header][0..n]

      lastOriginalCodeComment
      lastOutCommentLine
      sourceMap
      browser:boolean

      exportNamespace

      orTempVarCount=0 //helper temp vars to code js "or" in C, using ternary ?:


#### Method start(options)
Initialize output array

        declare on options
            nomap # do not generate sourcemap

        .lineNum=1
        .column=1
        .lines=[[],[],[]]
        
        .lastOriginalCodeComment = 0
        .lastOutCommentLine = 0

if sourceMap option is set, and we're in node generating .js

        #ifdef PROD_C
        do nothing
        #else
        if not options.nomap and type of process isnt 'undefined' # in node
              import SourceMap
              .sourceMap = new SourceMap
        #end if

#### Method setHeader(num)

        .startNewLine
        .header = num

#### Method put(text:string)
put a string into produced code

if no current line
create a empty one

        if .currLine is undefined
            .currLine=new DynBuffer(128)
            .column=1

append text to line 

        if text, .column += .currLine.append(text)


#### Method startNewLine()
Start New Line into produced code

send the current line

          if .currLine

              if .fileMode
                  if no .fileIsOpen[.header]
                      // make sure output dir exists
                      var filename = .filenames[.header] 
                      mkPath.toFile(filename);
                      .fHandles[.header]=fs.openSync(filename,'w')
                      .fileIsOpen[.header] = true

                  .currLine.saveLine .fHandles[.header]

              else
                  .lines[.header].push .currLine.toString()
              
              if .header is 0
                  .lineNum++
                  #ifndef NDEBUG
                  logger.debug  .lineNum, .currLine.toString()
                  #endif

clear current line

          .currLine = undefined
          .column = 1

#### Method ensureNewLine()
if there's something on the line, start a new one

          if .currLine, .startNewLine

#### Method blankLine()

          .startNewLine
          .put ""
          .startNewLine


#### method getResult(header:boolean) returns array of string
get result and clear memory      

        .header = header
        .startNewLine() #close last line
        var result
        result = .lines[header]
        .lines[header] = []

        return result

#### method close()

        if .fileMode

            for header=0 to 2

                if .fileIsOpen[header]

                    fs.closeSync .fHandles[header]
                    .fileIsOpen[header] = false


#### helper method markSourceMap(indent) returns SourceMapMark

        var col = .column 
        if not .currLine, col += indent-1
        return SourceMapMark.{
                      col:col        
                      lin:.lineNum-1
                }

#### helper method addSourceMap(mark, sourceLin, sourceCol, indent)

        #ifdef PROD_C
        do nothing
        #else
        if .sourceMap
            declare on mark 
                lin,col
            .sourceMap.add ( (sourceLin or 1)-1, 0, mark.lin, 0)
        #endif


### Class DynBuffer

Like node.js Buffer, but auto-extends if required

        properties
            used = 0
            buf :Buffer


        constructor new DynBuffer(size)
            .buf = new Buffer(size)


        method append(text:string)

          var byteLen = Buffer.byteLength(text)

          if .used + byteLen > .buf.length

              var nbuf = new Buffer(.used + byteLen + 32)
              .buf.copy nbuf
              .buf = nbuf //replace

          .used += .buf.write(text,.used)

          return byteLen


        method saveLine(fd)

          fs.writeSync fd, .buf,0,.used
          fs.writeSync fd, "\n"


### helper class SourceMapMark
      properties 
        col, lin

