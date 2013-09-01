/*

  Introduction:
  =============

  The Space Shuttle and the Horse's Rear End
  http://www.astrodigital.org/space/stshorse.html

  To semicolon or not to semicolon:
  ---------------------------------

    This is another engineer decision they made:
    --------------------------------------------

        - Either you choose: 1) consider line endings (EOL) as statement's end, or
        2) you choose to define a "terminator" char, and get a (semi) "free form" mode where the EOL chars are
        considered whithespace.

        K&R choose the free-form and the semiconlon as the statement terminator, since then, you're seeing
        a lot of semicolons.

        Here, again, the 72-col punchcard constraint was important in order to make the free-form preferable
        over the EOL as terminator. Also, 72-col lines make the "indent is a block" idea unfeasible.

        Today, w/o punchcards, there are more advantages into using indentation as block separator and
        using EOL as statement separator (with a line continuation escape code).

        With indentation as block separator, you're forced to properly indentate. -that's good-; you're
        doing it anyhow (if you're not insane).
        Using EOL as statement separator, you'll stop worrying about semicolons, -that's good too-.

        Lite uses EOL as statement separator and identation as block separator, but "Lite is not a language"
        so, what we do?... we do simple things:
            1. We insert a "{" when the code indents and a "}" when it's de-indented.
            2. Inside a block, we insert a semicolon at every EOL (after concating lines ending in ' _')

    Block end cues for the casual reader
    -------------------------------------

        There is another problem with curly braces and structured programming: it's called: "closing braces wtf".
        Picture the following "screen" in C (and pascal, js, java, etc)

        +-------------------------------------------
        |987|                   inx++;
        |988|               }
        |989|               importantVar=false;
        |990|            }
        |991|        }
        |992|    }
        |993|};
        |994|
        |995|
        |996|function theSecond(){
        |997|

        Let's say you were following the 500-line code of the function "theFirst", and you get distracted by a call.
        Now, you see a well-indented cascade of closing curly braces... wtf are each one of them closing?
        Now, you depend of some crazy jumping courtesy of your favorite editor's  "find matching brace" function
        (if you're lucky enough to be using your editor, and not, let's say, reading code on the web).

        In this case, you gain nothing by using indent as block separator (picture the same, but w/o the curlys)
        It's even worst, you can't be sure of how many blocks are closing.

        So, to ease code reading, it's good to have (optional) end block statements, as in...

        +------------------------------
        |987|                  inx++;
        |988|               end if // if anotherVar was 3
        |989|               importantVar=false;
        |990|           end if
        |991|
        |992|       end loop (cols)
        |993|    end loop (rows)
        |994|end function theFirst
        |995|
        |996|function theSecond(){
        |997|

        That's clearer, and easier to read.


LitesScript Laws:
=================

    -- LiteScript is not a language.

    -- If you can avoid it, do no harm.

Corollaries:
------------

    -- if your LiteScript is harder to read than pure-js, you're doing it wrong.

*/

// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------
// This js code should work on node and the browser. For node-specific code see node-lite.js
// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------

// source text

var source = []; // pre-processed, each item is a object "new Leido"

var pos = { //position on source
    lineIndex : 0
    ,prevIndent : 0
    ,SourceLinesIndex: 0
};

var leido;  // last read, contents: {line:string, indent:number, words:[], EOF:true, others] }
            // spanish "leido" means "what was read" (read past participle)
            //(english has the same syntax but different pronunciations: read ~reed / read ~red ) -wtf! cfde.

// js output
var result = [];

//export
var lite = {
    processBlock: processBlock //main recursive fn
    ,setSource:setSource
    ,sourceLines: [] //
    ,advanceHook: null //optional callback
};


// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------
// Set pos, reset line position and indent
// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------
function setSource(sourceText){

    lite.sourceLines = sourceText.split("\n");

    preProcess();

    result = [];
    pos.lineIndex = 0;
    pos.SourceLinesIndex = 0;
    pos.blockCount = 0;
}

// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------
// LiteScript Processor
// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------

//-----------------------------------------
//--- *RECURSIVE* fn processBlock ---------
//-----------------------------------------
//--- Read lines, split words, replace ----
//-----------------------------------------

/*
Key to understand LiteScript process:
    The 'processBlock' function is called recursively on each indentation increment (a new block)
    or when the line's first word is a sugary block start keyword.

    The recursion pushes each new 'state' parameter in the stack --> the process will
    enter a new state on each block, and will recover the previous state when exiting the block (return).

Clave para entender el proceso LiteScript:
    La function 'processBlock' se llama recursivmente en cada increment of indentation (block)
    o cuando la primer linea del bloque es una keyword de comienzo de un bloque 'azucarado'

    La llamada recursiva pushes el 'state' parameter en el stack --> el proceso
    entrara en un nuevo estado en cada bloque, y recuperara el estado previo al salir del bloque (return).

---------------------------
KEYWORDS (1st word on line)

    -------------------
    KEYWORD 'if'

    if a is 2 then
        console.log("a is 2")

    -> js:

    if(a==2){
        console.log("a is 2");
    }

    ---------------------------------------------------------
    KEYWORD 'case' - implmented as ANSI SQL "CASE"

        ------------------------
        -Mode 1 : CASE [var] WHEN [value]

        case [var]
        when [value] then [commands]

        when [value],[value] or [value] then
             [commands]
             [commands]
             [commands]

        when [value],[value] then
             [commands]

        else
             [commands]

        end case

        -> js:

        switch([var]) {

            case [value]:
                [commands];
                break;

            case [value]: case [value]: case [value]:
                [commands];
                [commands];
                [commands];

            default:
                [commands];
        }


        ------------------------
        -Mode 2 : CASE WHEN boolean expressions

        case when [boolean expression 1] then [commands]

        when [boolean expression 2] then
            [commands]
            [commands]
            [commands]

        when [boolean expression 3] then
            [commands]

        else
            [commands]

        end case


        -> js:


        if ([boolean expression 1]) {
            [commands];

        } else if ([boolean expression 2]) {
            [commands]
            [commands]
            [commands]

        } else if ([boolean expression 3]) {
            [commands]

        } else {
            [commands]
        };

*/

function processBlock(state) { //uses globals: leido, pos

    if (!state) state={};

    state.blockIntroIndent = leido.indent;

    state.blockLinesCount=0;

    if (++pos.blockCount===1) state.keyword = 'main'; // 1st block

    // default values | valores default
    if (!state.separator) state.separator=";";
    if (!state.terminator) state.terminator="}";
    if (!state.endWord) state.endWord="end";
    if (!state.EndBlock_callback) state.EndBlock_callback = Default_EndBlock_callback;

    // read lines until EOF
    while( readNext() ) {

        // line's first code word
        if (leido.nextCode()) {

            if (++state.blockLinesCount === 1 ) {
                //1st line of block sets block's indent
                state.blockIndent = leido.indent;
                //first word sets block keyword (if it wasn't provided)
                if (!state.keyword) state.keyword = leido.code;
                if (state.keyword=='var') state.separator = ','; // multiline var => JSON item separator
            }
    
            //debug breakpoint
            if ( leido.line.indexOf('break')>=0 )
                null; 
            //--------
        
            var newState={}; //in case this line starts a new block
    
            // sugary lines
            if (leido.code=="function") {
    
                sugar_FUNCTION(state, newState);
    
            } else if (leido.code=="if" || leido.code=="while") {
    
                sugar_IF_WHILE(state, newState);
    
            } else if (leido.code=="case") {
    
                sugar_CASE(state, newState);
    
            } else if (leido.code=='when' ) {
    
                sugar_CASE_WHEN_subBlock(state, newState);
    
            } else if ( leido.code=='else' && state.keyword=='switch') { // --> 'else' gets  replaced by 'default:'
    
                sugar_CASE_ELSE_subBlock(state, newState);
    
            };
            

            // after the sugar, depending on the indentation of the next line,
            // we can close the current block, continue, or open a sub-block
            
            // peek ahead, next line
            var nextItem = peekNextItem(); // peek Next code Line
        
            if ( nextItem.indent > state.blockIndent ) { // next line is indented, so this line is a block starter
        
                startBracedSubBlock(newState); // start block *recursive*
                state.blockLinesCount+=newState.blockLinesCount; // add sub block lines to this block
        
            } else if (nextItem.indent < state.blockIndent) { // next line is -less- indented
                                                              // --> this is the last line of this block
                                                              
                out_leido(); // last line, no terminator before '}'
        
                closeBlock(state,nextItem); // close current block, add '}'
        
                return; // End of block;
        
            } else { // same indent, this is an intermediate line in the same block
        
                addTerminator(state.separator); // add ";" if it's not there
                out_leido(); 
        
            }

        } 
        else // no code words (only comments)
            out_leido();
            
        // hook for online test
        if (lite.advanceHook) lite.advanceHook();

    } // Loop, until EOF

    lite.result = result;

}



//-----------------------------------------
//-----------------------------------------
function sugar_FUNCTION() {

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

    var words = leido.words;
    // functionName -> words[1];
    // fill in "()"
    if (words.length<=2) words[2]='(';
    if (words.length<=3) words[3]=')';

    // remove optional type information
    var typeInfo=[];

    for (var n=4; n<words.length ;n++) {

        switch(words[n]) {

            case ":": // optional type information
                typeInfo.push(words.slice(n-1,n+2)); // save info
                words[n]="";   //clear
                words[n+1]=""; //clear
        }

    }

    if (typeInfo.length) words.push("// "+typeInfo.join(', ')); // add typeinfo as comment

}

//-----------------------------------------
//-----------------------------------------
function sugar_IF_WHILE() {

    var thenKeywordFound=false;

    var insertedOpeningPar = insertCode('(',2); // returns true if inserted (if it wasn't there)
    
    var prev_inx = leido.inx;
    
    var words = leido.words; //convenience
 
    // process 'if'/'while' line words
    while (leido.nextCode()) {
    
        switch(leido.code) {

            case "not": case "no": leido.replaceWith("!"); break;

            case "<>": leido.replaceWith("!="); break;

            case "and": leido.replaceWith("&&"); break;

            case "or": leido.replaceWith("||"); break;

            case "then":
                leido.replaceWith( insertedOpeningPar? ")": "" );
                thenKeywordFound=true;
                break;

            case "is":
                var is_inx = leido.inx;
                leido.replaceWith("==");

                if (!leido.nextCode()) err("error parsing keyword 'is'. Expected: more words after 'is'");

                var negated=false;
                if (leido.code=='not'){
                    words[is_inx]="!="; // <-- replacement for 'is not'
                    negated=true;
                    leido.replaceWith(""); //remove ' not'
                    if (!leido.nextCode()) err("error parsing keyword 'is not'. Expected: another word after 'is not'");
                }

                // basic replacement:  is -> ==, is not -> !=
                // special cases: x is function, is string, is array, is object  -> (typeof x === 'type')
                //                x is null, x is undefined -> if (!x) {...

                // Usage 1: is ->  ==
                // Usage 2: [variable] is [null|undefined]  ->js:  if (![variable]){...   // false for null,undefined and ''
                // Usage 3: [variable] is [function|string|object|array]  ->js:  typeof [variable]==='[keyword]'"

                switch(leido.code) { //special cases

                    case "function": case "string": case "number": //-> (typeof x ==='type')
                    case "object": case "Object":
                        words[prev_inx]="typeof "+ words[prev_inx]; // [var] --> typeof [var]
                        words[is_inx] += "=";  // is --> '===' 
                        words[leido.inx]= "'" + words[leido.inx] + "'"; // quote keyword function|string|object...
                        break;

                     case "array": case "Array": // --> Object.prototype.toString.call(x)==='[object Array]'
                        words[prev_inx]="Object.prototype.toString.call(" +words[prev_inx]+")";
                        words[is_inx] += "="; // is --> '===' 
                        words[leido.inx]="'[object Array]'";
                        break;

                    case "null": case "undefined":
                        words[is_inx] = words[prev_inx]; //variable
                        words[prev_inx]=(negated?'':'!'); // if x is null -> if( !x ) {...
                        words[leido.inx]=""; 
                        break;

                    } // end special cases for 'is'

                break; //case 'is'

            default:
                leido.replaceWith(leido.code.replaceAll('<>','!=')); // <> --> !=
        }

        prev_inx = leido.inx;
    
    } // each code word

    if ( !thenKeywordFound && insertedOpeningPar) { // if there was not a 'then' keyword.... | si NO HUBO un 'then'... 
                                                    // and the opening par was inserted...
        appendCode(')'); // add closing par ")" | agrego ")"
    }

}

//-----------------------------------------
//-----------------------------------------
function sugar_CASE(state, newState) {

    // "case"'s first line
    
    var case_inx = leido.inx;
    
    var words=leido.words; //convenience

    if (!leido.nextCode()) err("expected [variable] or 'when' after 'case'");
    var booleanMode=(leido.code=='when');

    if (booleanMode) { // mode 1: case when [bool expression] then... /n when [bool expression] then... /n else... /n end case

        words[case_inx] = "if";

        words[leido.inx] = "(";  // --> if ([bool expression]) { /n ...  /n } else if ([bool expression]) { /n ... /n } else { /n };

        replaceLast(words,leido.inx+1,'then',")"); // 'then' gets replaced by ')' | busco 'then' que marca el fin de la expresion
                                                    // raises err if 'then' is not found

        newState.keyword='case';

    } else { // mode 2: case [expression] /n when [value] then...
             // use "switch(expression) /n case [value]:

        words[case_inx] = "switch"
        if (insertCode('(',2)) appendCode(')');; // if they weren't there

        newState.keyword="switch";

    }

}

// -------------------------------
function sugar_CASE_WHEN_subBlock(state, newState)
{

    newState.keyword='when';

    if ( state.keyword=='case') 
        sugar_CASE_IF_ELSE_subBlock (state, newState);
        
    else if ( state.keyword=='switch') 
        sugar_SWITCH_WHEN_subBlock (state, newState);
        
    else
        err ("'when' without 'case'");
}
    

// -------------------------------
function sugar_CASE_IF_ELSE_subBlock(state, newState)
{
    /* mode 1 : case when [boolean expression] -----> if (... ) {... } else if(... ) { } else {...} 
    
        case when [bool expression] then command;
        
            when [bool expression] then
                command;
                command;

            else... 
            
        end case
        
    */

    leido.words[0] = "else if (";

    replaceLast(leido.words,2,'then',")"); // 'then' gets replaced by ')' | busco 'then' que marca el fin de la expresion
                                           // raises err if 'then' is not found
}

// -------------------------------
function sugar_SWITCH_WHEN_subBlock(state, newState)
{
    /* mode 2: case [variable]... -----> switch(variable){... }
    
        case when [variable] then command;
        
            when [bool expression] then
                command;
                command;
                
            else... 
            
        end case
        
    */

    var words=leido.words; //convenience

        words[leido.inx]=""; // delete 'when'

        var codeFound=false;
        
        // check each word in the 'when' line (to construct js's case value1: case value2:)
        // veo cada palabra en esta linea de "when" (valores para js's case value:)
        while (leido.nextCode()) {

            if (leido.code==',' || leido.code=='or' || leido.code==':' ) {
                words[leido.inx]=""; //  optionals, delete | opcionales, borro
            
        } else if (leido.code=='break' ) { // not required in 'case when'...
            words[leido.inx]="//"+words[leido.inx]; //  comment
            
        } else if (leido.code=='then') { // 'then' -> //end of value list | fin de lista de valores 
                words[leido.inx]=""; // remove 'then'
                if (leido.nextCode()) { // there is code after 'when', assume single line 'case'
                    codeFound = true;
                    addTerminator(';');
                    appendCode("break");
                }
                break; // end of value list | fin de lista de valores 
            }
            else { // a value
                leido.replaceWith("case "+words[leido.inx]+":"); // Lite: 'when [value]' --> js: 'case [value]:'
            } 

        }//end for

        newState.terminator='break;';

    //check, in case the programmer forgot to write some code for the case
        if (!codeFound)  {
            var nextItem=peekNextItem();
        if (nextItem.indent <= state.blockIndent) err("expected some CODE for the 'case/when' block");
        }

}


// -------------------------------
function sugar_CASE_ELSE_subBlock(state) {

    if ( state.keyword=='switch') { // mode 2: case [var] when value then... else... end
            leido.replaceWith("default:"); // replace 'else' -> "default:"
    }
}



// -------------------------------
// -------------------------------
function startBracedSubBlock(newState) { //start braced indented block

    // words.slice(0,n) is the block intro
    // anything after n will be processed as the first indented line

    //default values
    if (!newState) newState={};
    if (!newState.keyword) newState.keyword=leido.first();

    //output words, add '{', block starts
    if (newState.terminator!='break;') { // not when terminator='break;'
        newState.openBraceInserted = addTerminator('{',' '); // add ' {' if it's not there
    } else {
        null;
    }
    
    out_leido();

    // RECURSIVE
    processBlock(newState);
}


//----------------------------
function insertCode(char, inx){

    // adds "(" if it isn't there

    // skip comments and spaces
    var n=inx;
    while ( n<leido.words.length
            && (leido.words[n]==' ' || leido.words[n].isComment() )
          ) 
       n++;

    // add '(' if it isn't there
    if (n>=leido.words.length || !leido.words[n].startsWith(char)) { // next word does not have it
        leido.words.splice(inx,0,char); // insert at inx
        return true; //inserted
    }
 
    return false;        
}

//----------------------------
function appendCode(char){

    // adds ")" to the end of the line (considering comments)

    // skip comments and spaces at the end of the line
    var n=leido.words.length-1;
    while ( n>=0 && (leido.words[n]==' ' || leido.words[n].isComment()) )
       n--;

    // insert after
    leido.words.splice(n+1,0,char); 
}

//----------------------------
function addTerminator(terminator, pre){

    // adds ";" or " {" to the end of the line (considering comments)

    if (!leido.commentLine) {

        // default value
        pre=pre||''; 
    
        // skip comments and spaces at the end of the line
        var n=leido.words.length-1;
        while ( n>=0 && (leido.words[n]==' ' || leido.words[n].isComment()) )
           n--;

        // add ';' or '{' if it isn't there
        if (n==-1) { // only comments
            leido.words.unshift(pre + terminator); // insert at 0
            return true; // inserted
        }
        else
            if (!leido.words[n].endsWith(terminator)) {
                leido.words[n] += (pre + terminator);
                return true; // inserted
            }

        return false; // not inserted
    }

}
//----------------------------
function out_leido(){

    // output result | saco resultado
    result.push( space(leido.indent) + leido.words.join('').trimRight() );

}


//----------------------------------
function closeBlock(state, nextItem){  // add '};', call callback

    if (nextItem && !nextItem.line.startsWith('}')) { // add '}', if it isn't there

        if ( nextItem.line.startsWith(state.endWord+' ') ) { // --> end if, end function, end case, end for, etc.

             nextItem.line = state.terminator + ' //'+nextItem.line; // close block, with optional cues as comment

        } else {
            // no closing brace, no cues --> add closing block brace, auto-cues
            // closing block brace on its own line
            result.push( '' );
            result.push( space(state.blockIntroIndent) + state.terminator 
                         + (state.blockLinesCount>4 && state.keyword!='var'? "// end "+state.keyword : "") );
        }

    }

    state.EndBlock_callback(state, nextItem); //end of block, callback hook
}


//-----------------------------------------
function Default_EndBlock_callback(state, nextItem) {
    // end of block hook
    return null;
}


//----------------------------
// utility protoype functions
//----------------------------
String.prototype.startsWith =
    function(s){ return this.slice(0, s.length) == s; };

String.prototype.isComment =
    function() { return (this.length>1 && ( this.slice(0,2)=="//" || this.slice(0,2)=="/*" ) ); };

String.prototype.isCode =
    function() { return (this.length>0 && this!=' ' && !this.isComment() ); };

String.prototype.endsWith =
    function(s){ return this.slice(-s.length) == s; };

String.prototype.replaceAt =
    function(index, count, replacement) { return this.slice(0, index) + replacement + this.slice(index + count); };

String.prototype.isEmpty =
    function() { return (!this || this.length===0 || this.trimLeft().trimRight().length===0); };

String.prototype.replaceAll = function (find, replace) {
    return this.replace(new RegExp(find,'ig'), replace);
}

//----------------------------
// utility functions
//----------------------------

function replaceLast(words,position,searched,replace)
{
    var n=words.lastIndexOf(words,searched);
    if (n<0) err("'expected: '"+searched+"'");
    words[n]=replace;
    return n;
}

function space(cant){
    var spaces=[];
    spaces[cant]='';
    return spaces.join(' ');
}

// -------------------------
function err(s) {
    console.log("line: " + result.length + ", ERR: " + s);
    result.push("---------------------------------------------------");
    result.push("line " + leido.sourceLinesStart+":"+space(leido.indent)+leido.line);
    result.push("!!! ERROR: " + s);
    result.push("---------------------------------------------------");
}


// -------------------------
function queueLine(line)
{
    if (line.trimLeft().trimRight()) {// si la linea tiene algo... | if there's something...

        if (pos.lineIndex>source.length) pos.lineIndex = source.length;

        source.splice(pos.lineIndex,0, new Leido(line)); //insert
    }
}

//----------------------------
// class Leido
//
//- 'new' Constructor
    function Leido(line) {

        if ( ! this instanceof Leido) return new Leido(line); // in case somebody forgets the "new"

        //analyze line --> { indent:number,  line:string, hasCode:bool}

        // Count & Remove leading spaces
        var indent=0;
        for (var n = 0; n < line.length; n++) {
            if (line[n] === " " ) indent++;
            else if ( line[n] === "\t") indent+=4;
            else break; //not space or tab
        }

        line = line.slice(n); //cut leading spaces/tabs
        
        this.line = line;
        this.indent = indent;

        this.lineComment 
            = (line.length>1 && 
                ( line.slice(0,2)=="//" || line.slice(0,2)=="/*" )    
            );
        
        this.hasCode = (line && !this.lineComment);

        this.inx=-1;        
    }

//- Methods

    Leido.prototype.first = function() { return this.words[0] };

    Leido.prototype.EOL = function() { 
        return (this.inx>=this.words.length);
    }
    
    Leido.prototype.nextCode = function() { 
        this.code ='';
        this.inx++;
        // skip spaces & comments
        while (this.inx<this.words.length && !this.words[this.inx].isCode()) this.inx++;
        if (this.inx>=this.words.length) return false; //no more code words
        this.code = this.words[this.inx];
        return true;
    }

    Leido.prototype.replaceWith = function(s) { 
        if (this.inx<this.words.length) this.words[this.inx] = s;
    }

// end class Leido
//----------------------------


//----------------------------
function preProcess() // sourceLines[ string ] --> source[ {hasCode:bool, EOF:bool, indent:number, line:string },... ]

{

    source=[];
    
    var insideMultilineComment=false;

    //pre-process all source lines
    //append on continuation code
    for(var n=0; n<lite.sourceLines.length; n++) {

        var start = n;
        var line = lite.sourceLines[n].trimRight(); //trim extra spaces

        // line continuation code: ' _'
        while (n < lite.sourceLines.length-1 && line.length>=2 && line.slice(-2)==' _') {
            line=line.slice(0,-2) + lite.sourceLines[++n].trimLeft().trimRight(); //append next line
        }

        leido = new Leido(line);
        
        line = leido.line; // convenience. w/o leading spaces
        
        leido.sourceLinesStart = start;
        leido.sourceLinesEnd = n;

        if (line.startsWith("/*" )) {
            insideMultilineComment= true;
        }

        if (insideMultilineComment) { 
            leido.commentLine = true;
            leido.hasCode = false;
        }
        
        if (insideMultilineComment && line.indexOf("*/")>=0) {
            insideMultilineComment= false;
        }

        source.push(leido);
    }

    //EOF mark
    source.push( {EOF:true, hasCode:false, line:'', indent:0});

    //reset indexes
    pos.lineIndex=0;
    pos.SourceLinesIndex=0;

}

//----------------------------
function peekNextItem() {//peek ahead next code line

    for(var n=pos.lineIndex; n<source.length-1; n++) {
        if (source[n].hasCode) return source[n];
    }
    return source[n]; //return item with EOF code
}


//----------------------------
function readNext() // read next source code line
                    //return false if EOF, store values in global.leido={line:string, indent:number, words:[], [EOF:true]}
                    // skips comments and empty lines
{

    // while empty or comment lines
    // mientras sean lineas vacias o de comentario
    while(true){

        if (pos.lineIndex >= source.length) {
            leido = source[source.length-1]; //EOF mark
            return false; //EOF
        }

        leido = source[pos.lineIndex++]; //advance, position on pre-processed source

        //position on original source
        if (leido.sourceLinesEnd) pos.SourceLinesIndex=leido.sourceLinesEnd;

        if (leido.EOF) return false; //reached EOF mark

        if (leido.hasCode) break; // Code line, exit "skip blank and comments" loop
        
        result.push( space(leido.indent) + leido.line );
        // isn't code, output w/o change, keep reading lines

    } // loop - keep reading lines, while line is empty or comment
      // loop - sigo leyendo, mientras sea linea vacia o de comentario


    //aqui, la linea contiene codigo
    //here, the line has code

    //split words
    leido.words = splitJSLine(leido.line);

    return true;
}


// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------
// Util Functions
// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------

function splitJSLine(s){
    var start=0;
    var previous;
    var quoteChar;
    var inQuotes = false;
    var res=[];

    for(var i=0;i<s.length;i++) {

        var char = s[i];

        if (inQuotes){
            if (char==quoteChar){
                inQuotes=false;
                res.push(s.slice(start,i+1));
                start = i+1;
            }
            else null; //do nothing, still in quotes
        }
        else { // not in quotes

            switch (char) {

                case '"': case "'": // start quotes
                    if (start<i) res.push(s.slice(start,i)); // si habia algo antes de las comillas
                    start=i;
                    inQuotes=true;
                    quoteChar=char;
                    break;

                case '/':
                    if (previous=='/'){ // //-comment
                        res.push(s.slice(start));
                        i=s.length;
                        start=i+1;
                    }
                    break;

                // Separators
                case ' ': case ':': case ',': case ';': case '(': case ')': case '{': case '}': case '[': case ']':
                    if (start<i) res.push(s.slice(start,i)); // si habia algo antes del separ
                    res.push(char);
                    start = i+1;
                    break;

            } // end switch

        } // end if

        previous=char;
    } // end for

    if (start<i) res.push(s.slice(start,i)); // last word

    //console.log(res);
    return res;
}


// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------
//-- node or js:require
//-- exports
// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------

if (this.hasOwnProperty("exports")) { // inside 'require' or node module
    exports = lite;
}