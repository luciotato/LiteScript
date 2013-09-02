var source = [] // pre-processed, each item is a object "new Leido"

var pos =  //position on source
    lineIndex : 0
    prevIndent : 0
    SourceLinesIndex: 0

var leido  // last read, contents: {line:string, indent:number, words:[], EOF:true, others] }
            // spanish "leido" means "what was read" (read past participle)
            //(english has the same syntax but different pronunciations: read ~reed / read ~red ) -wtf! cfde.

// js output
var result = []
var lastResultCodeLine=0

//export
var lite =
    processBlock: processBlock //main recursive fn
    setSource:setSource
    sourceLines: [] //
    advanceHook: null //optional callback


// ------------------------------------------------------------------------------------------------
// Set pos, reset line position and indent
// ------------------------------------------------------------------------------------------------
function setSource(sourceText)

    lite.sourceLines = sourceText.split("\n");

    preProcess();

    result = [];
    pos.lineIndex = 0;
    pos.indent = 0;
    pos.SourceLinesIndex = 0;
    pos.blockCount = 0;


// ------------------------------------------------------------------------------------------------
// RECURSIVE fn processBlock
// ------------------------------------------------------------------------------------------------
function processBlock(state)  //uses globals: leido, pos

    if state is null then state={};

    state.blockIntroIndent = leido.indent

    state.blockLinesCount=0

    if ++pos.blockCount is 1 then state.keyword = 'main' // 1st block

    // default values | valores default
    if no state.endWord then state.endWord="end";
    if no state.EndBlock_callback then state.EndBlock_callback = Default_EndBlock_callback

    // read lines until EOF
    while readNext()

        // line's first word
        var word = leido.first()

        if ++state.blockLinesCount is 1
            //1st line of block sets block's indent
            state.blockIndent = leido.indent;
            //first word sets block keyword (if it wasn't provided)
            if no state.keyword then state.keyword = word

        // sugary lines
        case word

            when "function"

                Sugar_FUNCTION_Block()

            when "if" or "while"

                Sugar_IF_WHILE_Block()

            when "case"

                Sugar_CASE_Block()

            when 'when'

                sugar_CASE_WHEN_subBlock(state)

            when 'else'

                sugar_CASE_ELSE_subBlock(state)

            else

                // a less-sugary line
                // peek ahead
                var nextItem = peekNextItem() // peek Next code Line

                if nextItem.indent > state.blockIndent // next line is indented, so this must be a block starter

                    startBracedSubBlock() // start block

                else if nextItem.indent < state.blockIndent // next line is -less- indented
                                                                  // --> this is the last line of this block
                    out_leido() // no terminator

                    closeBlock(state,nextItem) // close current block, add '}'

                    return // End of block

                else  // same indent, this is an intermediate line in the same block

                    if state.keyword is 'var' // var = {... (object)

                        out_leido(',') // use ',' as separator - add "," if it's not there

                    else

                        out_leido(';') // statement: add ";" if it's not there

                    end if

                end if

            end case // check if sugary

    end while


//-----------------------------------------
//-----------------------------------------
function Sugar_FUNCTION_Block

    /*
    Lite:

        function now
            return today();

        function aFunction( a:number, b:string )
            var s
            for n in 1..number
                s+=b
            return s

    js:

        function now(){
            return today();
        }

        function aFunction(a,b){
            var s;
            for(var n=0;n<number;n++){
                s+=b;
            }
            return s;
        };

    */

    var words = leido.words
    // functionName -> words[1];
    // fill in "()"
    if words.length<=2 then words[2]='('
    if words.length<=3 then words[3]=')'

    // remove optional type information
    var typeInfo=[]

    for var n=4 to words.length-1

        case words[n]

            when ":" // optional type information
                typeInfo.push(words.slice(n-1,n+2)) // save info
                words[n]=""   //clear
                words[n+1]="" //clear

            when ";" // title
                titleInfo.push(words.slice(n-1,n+2)) // save info
                words[n]=""   //clear
                words[n+1]="" //clear

            when "/" // alias
                aliasInfo.push(words.slice(n-1,n+2)) // save info
                words[n]=""   //clear
                words[n+1]="" //clear

    end for

    if typeInfo.length then words.push("// "+typeInfo.join(', ')); // add typeinfo as comment

    // saco lo procesado hasta aqui, words[0..n-1], y considero lo que siga como una linea inferior identada
    // output words[0..n-1], and process the rest of the line as the start of an indented block

    startBracedSubBlock()
}

//-----------------------------------------
//-----------------------------------------
function Sugar_BOOLEAN

    var thenKeywordFound=false

    var words=leido.words

    // process each word
    for each word in words

        case word

            when "" or " " then null;

            when "not" then word="!"

            when "<>" then word="!="

            when "and" then word="&&"

            when "or" then word="||"

            when "then"
                word=")"
                thenKeywordFound=true

            when "is":
                word="==";
                if (n>=words.length-1) err("error parsing keyword 'is'. Expected: another word after 'is'");

                var negated=false;
                if word[n+1] is 'not'
                    word="!=" // <-- replacement for 'is not'
                    negated=true
                    words.splice(n+1,1) //remove 'not'
                    if n is words.length-1 then err("error parsing keyword 'is not'. Expected: another word after 'is not'");


                // basic replacement:  is -> ===, is not -> !==
                // special cases: x is function, is string, is array, is object  -> (typeof x === 'type')
                //                x is null, x is undefined -> if (!x) {...

                // Usage 1: is ->  ===
                // Usage 2: [variable] is [null|undefined]  ->js:  if (![variable]){...   // false for null,undefined and ''
                // Usage 3: [variable] is [function|string|object|array]  ->js:  typeof [variable]==='[keyword]'"

                case word[n+1] //special cases

                    when "function","string","number","object" or "Object" //-> (typeof x ==='type')

                        word[n-1]="typeof "+word[n-1]; // [var] --> typeof [var]
                        word[n+1]="'"+word[n+1]+"'"; // quote keyword function|string|object...
                        n++; // skip-it

                    when "array" or "Array" // --> Object.prototype.toString.call(x)==='[object Array]'
                        word[n-1]="Object.prototype.toString.call( $word[n-1] )"
                        word[n+1]="'[object Array]'";
                        n++; // skip-it

                    when "null" or "undefined"
                        word=word[n-1]
                        word[n-1]=(negated?'':'!'); // if x is null -> if( !x ) {...

                end case "is"

            else
                leido.code.replaceAll('<>','!==')) // <> --> !==

        end case

        words[index]=word //replace word

        if thenKeywordFound then break

    end for

    if no thenKeywordFound // si NO HUBO un 'then'... | if there was not a 'then' keyword....

        words.push(')') // fuerzo ")" | force ")"

        n++ // que lo incluya | include it


    // output words[0..n-1], and process the rest of the line as the start of an indented block
    // saco lo procesado hasta aqui, words[0..n-1], y considero lo que siga como una linea inferior identada

    startBracedSubBlock ( {keyword:'if'}, n )

end function

//-----------------------------------------
//-----------------------------------------
function Sugar_CASE_Block(leido)

    // "case"'s first line
    var words=leido.words

    if words.length is 1 then err("expected [var name] or 'when' after 'case'");

    // aqui: words.length >=2

    var n;

    bool var booleanMode = words[1] is 'when'

    if booleanMode

        words[0] = "if"

        words[1] = "("  // --> if ([bool expression]) { /n ...  /n } else if ([bool expression]) { /n ... /n } else { /n };

        n = replaceLast(words,2,'then',")")+1  // 'then' gets replaced by ')'
        // n = index of 'then'

    else // mode 2: case [var] when [value] then...

        words[0] = "switch( $words[1] )"

        n=2; //from 3rd word as a new line

    end if

    // saco lo procesado hasta aqui, words[0..n-1], y considero lo proximo como otro bloque
    // output words[0..n-1], and process the rest of the line as an indented block

    startBracedSubBlock ( {booleanMode:booleanMode}, n )

end function


// -------------------------------
function sugar_CASE_WHEN_subBlock(state, newState)

    newState.keyword='when';

    case state.keyword
        when 'case'then
            sugar_CASE_IF_ELSE_subBlock (state, newState)

        when 'switch' then
            sugar_SWITCH_WHEN_subBlock (state, newState)

        else
            err ("'when' without 'case'")

end function


// -------------------------------
function sugar_SWITCH_WHEN_subBlock(state, newState)
{

    var words=leido.words //convenience

    words[leido.inx]="" // delete 'when'

    var codeFound=false

    // check each word in the 'when' line (to construct js's case value1: case value2:)
    // veo cada palabra en esta linea de "when" (valores para js's case value:)
    while leido.nextCode()

        case leido.code
            when  ',', 'or', ':'
                words[leido.inx]="" //  optionals, delete | opcionales, borro

            when 'then'  // 'then' -> //end of value list | fin de lista de valores
                words[leido.inx]="" // remove 'then'
                if leido.nextCode() // there is code after 'when', assume single line 'case'
                    codeFound = true
                    addTerminator(';')
                    appendCode("break")

                break; //exit while, end of value list | fin de lista de valores

            else  // a value
                leido.replaceWith("case $words[leido.inx] :"); // Lite: 'when [value]' --> js: 'case [value]:'

        end case

    end while

    newState.terminator='break;'

    //check, in case the programmer forgot to write some code for the case
    if no codeFound
        var nextItem=peekNextItem()
        if (nextItem.indent <= state.blockIndent) err("expected some CODE for the 'case/when' block")

}


// -------------------------------
function sugar_CASE_ELSE_subBlock(state)

    if state.keyword is 'switch' then // mode 2: case [var] when value then... else... end
            leido.replaceWith("default:") // replace 'else' -> "default:"

end function


// -------------------------------
// -------------------------------
function startBracedSubBlock(newState)  //start braced indented block

    // words.slice(0,n) is the block intro
    // anything after n will be processed as the first indented line

    //default values
    if no newState then newState={};
    if no newState.keyword then newState.keyword=leido.first()

    //output words, add '{', block starts
    if newState.terminator is not 'break;' // not when terminator='break;'
        newState.openBraceInserted = addTerminator('{',' '); // add ' {' if it's not there

    out_leido()

    // RECURSIVE
    processBlock(newState)

end function


//----------------------------
function insertCode(char, inx)

    // adds "(" if it isn't there

    // skip comments and spaces
    var n=inx
    while n<leido.words.length and (leido.words[n] is ' ' or leido.words[n].isComment() )
       n++

    // add '(' if it isn't there
    if n>=leido.words.length or not leido.words[n].startsWith(char) // next word does not have it
        leido.words.splice(inx,0,char) // insert at inx
        return true //inserted

    return false

end function

//----------------------------
function appendCode(char)

    // adds ")" to the end of the line (considering comments)

    // skip comments and spaces at the end of the line
    var n=leido.words.length-1
    while n>=0 and (leido.words[n] is ' ' or leido.words[n].isComment())
       n--

    // insert after
    leido.words.splice(n+1,0,char)

end function

//----------------------------
function addTerminator(terminator, pre)

    // adds ";" or " {" to the end of the line (considering comments)

    if not leido.commentLine

        // default value
        pre=pre||'';

        // skip comments and spaces at the end of the line
        var n=leido.words.length-1
        while n>=0 and ( leido.words[n] is ' ' or leido.words[n].isComment() )
           n--

        // add ';' or '{' if it isn't there
        if n is -1 // only comments found
            leido.words.unshift(pre + terminator) // insert at 0
            return true // inserted
        else
            if not leido.words[n].endsWith(terminator)
                leido.words[n] += (pre + terminator)
                return true // inserted
            end if
        end if

        return false // not inserted
    }

end function

//----------------------------
function out_leido

    // output result | saco resultado
    result.push( space(leido.indent) + leido.words.join('').trimRight() );

end function


//----------------------------------
function closeBlock(state, nextItem)  // add '};', call callback

    if nextItem is not null and not nextItem.line.startsWith('}')  // add '}', if it isn't there

        if nextItem.line.startsWith(state.endWord+' ')  // --> end if, end function, end case, end for, etc.

             nextItem.line = "$state.terminator // $nextItem.line"; // close block, with optional cues as comment

        else
            // no closing brace, no cues --> add closing block brace, auto-cues
            // closing block brace on its own line
            result.push( '' )
            result.push( space(state.blockIntroIndent) + state.terminator _
                         + (state.blockLinesCount>4 && state.keyword!='var'? "// end "+state.keyword : "") );
        }

    }

    state.EndBlock_callback(state, nextItem) //end of block, callback hook

end function

//-----------------------------------------
function Default_EndBlock_callback(state, nextItem)
    // end of block hook
    return null;

end function


//----------------------------
// utility protoype functions
//----------------------------
String.prototype.startsWith = function(s)
    bool return this.slice(0, s.length) is s

String.prototype.isComment = function()
    bool return this.length>1 and ( this.slice(0,2) is "//" or this.slice(0,2) is "/*" )

String.prototype.isCode = function()
    bool return this.length>0 and this<>' ' and not this.isComment()

String.prototype.endsWith = function(s)
    return this.slice(-s.length)===s

String.prototype.replaceAt = function(index, count, replacement)
    return this.slice(0, index) + replacement + this.slice(index + count)

String.prototype.isEmpty = function()
    bool return  not this  or this.length is 0  or this.trimLeft().trimRight().length is 0

String.prototype.replaceAll = function (find, replace)
    return this.replace(new RegExp(find,'ig'), replace)


//----------------------------
// utility functions
//----------------------------

function replaceLast(words,position,searched,replace)
{
    var n=words.lastIndexOf(words,searched)
    if (n<0) err("'expected: '"+searched+"'")
    words[n]=replace
    return n
}

function space(cant){
    var spaces=[]
    spaces[cant]=''
    return spaces.join(' ')
}

// -------------------------
function err(s)

    console.log("line: $result.length - ERR: $s");
    result.push("---------------------------------------------------");
    result.push("line $leido.sourceLinesStart : "+space(leido.indent)+leido.line);
    result.push("!!! ERROR: $s");
    result.push("---------------------------------------------------");

end function


// -------------------------
function queueLine(line)

    if line.trimLeft().trimRight() then // si la linea tiene algo... | if there's something...

        if pos.lineIndex>source.length then pos.lineIndex = source.length

        source.splice(pos.lineIndex,0, new Leido(line)) //insert

    end if

end function

//----------------------------
//class Leido
//----------------------------
//- 'new' Constructor
function Leido(line)

    if not this instanceof Leido return new Leido(line); // in case somebody forgets the "new"

    //analyze line --> { indent:number,  line:string, hasCode:bool}

    // Count & Remove leading spaces
    var indent=0
    for each char in line
        if char is ' ' then
            indent++
        else if char is "\t" then
            indent+=4;
        else
            break; //not space or tab, exit for
    end for

    line = line.slice(n) //cut leading spaces/tabs

    this.line = line
    this.indent = indent

    bool this.lineComment = _
            line.length>1 _
            and ( line.slice(0,2) is "//" or line.slice(0,2) is "/*" )

    bool this.hasCode = line and not this.lineComment

    this.inx=-1

end function

//- Methods

Leido.prototype.first = function() { return this.words[0] };

Leido.prototype.EOL = function() {
    return (this.inx>=this.words.length);
}

Leido.prototype.nextCode = function()

    this.code =''
    this.inx++

    // skip spaces & comments
    while this.inx < this.words.length and not this.words[this.inx].isCode()
        this.inx++

    if this.inx >= this.words.length then return false; //no more code words
    this.code = this.words[this.inx]
    return true

end function

Leido.prototype.replaceWith = function(s) {
    if this.inx<this.words.length then this.words[this.inx] = s
}

//----------------------------
// end class Leido
//----------------------------


//----------------------------
function preProcess // sourceLines[ string ] --> source[ {hasCode:bool, EOF:bool, indent:number, line:string },... ]

    source=[];

    var insideMultilineComment=false

    //pre-process all source lines
    //append on continuation code

    for each line in lite.sourceLines

        line = line.trimRight() //trim extra spaces

        var start = i;

        // line continuation code: ' _'
        while i < lite.sourceLines.length-1 and line.length>=2 and line.slice(-2) is ' _')
            line=line.slice(0,-2) + lite.sourceLines[++i].trimLeft().trimRight(); //append next line
        }

        leido = new Leido(line)

        line = leido.line // convenience. w/o leading spaces

        leido.sourceLinesStart = start
        leido.sourceLinesEnd = i

        if line.startsWith("/*" )
            insideMultilineComment= true


        if insideMultilineComment then
            leido.commentLine = true
            leido.hasCode = false


        if insideMultilineComment and line contains "*/"
            insideMultilineComment= false

        source.push(leido);
    }

    //EOF mark
    source.push( {EOF:true, hasCode:false, line:'', indent:0})

    //reset indexes
    pos.lineIndex=0
    pos.SourceLinesIndex=0

end function

//----------------------------
function peekNextItem() // peek ahead next code line

    for each item in source starting at pos.lineIndex
        if item.hasCode then return item

    return source[source.length-1] //return item with EOF code

end function


//----------------------------
function readNext() // read next source code line
                    //return false if EOF, store values in global.leido={line:string, indent:number, words:[], [EOF:true]}
                    // skips comments and empty lines

    // while empty or comment lines
    // mientras sean lineas vacias o de comentario
    while true

        if pos.lineIndex >= source.length
            leido = source[source.length-1] //EOF mark
            return false //EOF

        leido = source[pos.lineIndex++] //advance, position on pre-processed source

        //position on original source
        if (leido.sourceLinesEnd) pos.SourceLinesIndex=leido.sourceLinesEnd

        if (leido.EOF) return false //reached EOF mark

        if (leido.hasCode) break // Code line, exit "skip blank and comments" loop

        result.push( space(leido.indent) + leido.line )
        // isn't code, output w/o change, keep reading lines

    end loop // - keep reading lines, while line is empty or comment
             // sigo leyendo, mientras sea linea vacia o de comentario


    //aqui, la linea contiene codigo
    //here, the line has code

    //split words
    leido.words = splitJSLine(leido.line)

    return true

end function


// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------
// Util Functions
// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------

function splitJSLine(s)

    var start=0
    var previous
    var quoteChar
    var inQuotes = false
    var res=[]

    for each char in s

        if inQuotes
            if char is quoteChar
                inQuotes=false;
                res.push(s.slice(start,i+1));
                start = i+1;

            else
                null //do nothing, still in quotes

        else // not in quotes

            case char

                when '"' or "'" // start quotes
                    if start<i then res.push(s.slice(start,i)); // si habia algo antes de las comillas
                    start=i;
                    inQuotes=true;
                    quoteChar=char;

                when '/'
                    if previous=='/' // //-comment
                        res.push(s.slice(start));
                        i=s.length;
                        start=i+1;

                // Separators
                when ' ' ':' ',' ';' '=' '(' ')' '{' '}' '[' or ']'
                    if start<i then res.push(s.slice(start,i)) // si habia algo antes del separ
                    res.push(char)
                    start = i+1

            end case

        end if

        previous=char

    end for

    if start<i then res.push(s.slice(start,i)) // last word

    //console.log(res);
    return res

end function

