// SAMPLE 3 - LITE source text

var source = [] // pre-processed, each item is a object "new Leido"

var pos =  //position on source
    lineIndex : 0
    prevIndent : 0
    SourceLinesIndex: 0


function padLines(src,result)

    // keep a "padded Source" to match lines on result
    // add lines to result if needed


    for n=src.length-1 downto src.length-3
        if src[n] contains 'function' then 
            while src.length < result.length
                src.splice(n-1,0,"") //insert line
        end if
    
    while result.length < src.length
        result.push(" ") //add line


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
// ------------------------------------------------------------------------------------------------
// Set pos, reset line position and indent
// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------
function setSource(sourceText)

    lite.sourceLines = sourceText.split("\n");

    preProcess();

    result = [];
    pos.lineIndex = 0;
    pos.indent = 0;
    pos.SourceLinesIndex = 0;
    pos.blockCount = 0;

end function


function processBlock(state)  //uses globals: leido, pos

    if state is null then state={};

    state.blockIntroIndent = leido.indent

    state.blockLinesCount=0

    if (++pos.blockCount===1) state.keyword = 'main'; // 1st block

    // default values | valores default
    if no state.endWord then state.endWord="end";
    if no state.EndBlock_callback then state.EndBlock_callback = Default_EndBlock_callback

    // read lines until EOF
    while readNext()

        // line's first word
        var word = leido.first()

        if (++state.blockLinesCount === 1 )
            //1st line of block sets block's indent
            state.blockIndent = leido.indent;
            //first word sets block keyword (if it wasn't provided)
            if no state.keyword then state.keyword = word

        // sugary lines
        case word

            when "function"

                Sugar_FUNCTION_Block();

            when "if" or "while"

                Sugar_IF_WHILE_Block()

            when "case"

                Sugar_CASE_Block();

            when 'when'

                Sugar_WHEN_subBlock(state);

            when 'else'

                Sugar_CASE_ELSE_subBlock(state);

            else

                // a less-sugary line
                // peek ahead
                var nextItem = peekNextItem(); // peek Next code Line

                if nextItem.indent > state.blockIndent // next line is indented, so this must be a block starter

                    startBracedSubBlock(); // start block

                else if nextItem.indent < state.blockIndent // next line is -less- indented
                                                                  // --> this is the last line of this block
                    out_leido(); // no terminator

                    closeBlock(state,nextItem); // close current block, add '}'

                    return // End of block;

                else  // same indent, this is an intermediate line in the same block

                    if (state.keyword=='var') // var = {... (object)

                        out_leido(','); // use ',' as separator - add "," if it's not there

                    else

                        out_leido(';'); // statement: add ";" if it's not there
                end if
                
            end default case
                
        end case // check if sugary

        // hook for online test
        if lite.advanceHook then lite.advanceHook();

    end while

end function

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

    var words = leido.words;
    // functionName -> words[1];
    // fill in "()"
    if (words.length<=2) words[2]='(';
    if (words.length<=3) words[3]=')';

    // remove optional type information
    var typeInfo=[];

    for var n=4 to words.length

        case words[n]

            when ":" // optional type information
                typeInfo.push(words.slice(n-1,n+2)); // save info
                words[n]="";   //clear
                words[n+1]=""; //clear

    end for

    if typeInfo.length then words.push("// "+typeInfo.join(', ')); // add typeinfo as comment

    // saco lo procesado hasta aqui, words[0..n-1], y considero lo que siga como una linea inferior identada
    // output words[0..n-1], and process the rest of the line as the start of an indented block

    startBracedSubBlock();

end function

//-----------------------------------------
//-----------------------------------------
function Sugar_IF_WHILE_Block

    var thenKeywordFound=false;

    var words=leido.words;

    words[0] = "if ("; // add "("

    // process 'if' line
    for var n=1 to words.length

        var word=words[n];

        case word

            when "" or " " 
                null; //skip

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
                    word="!="; // <-- replacement for 'is not'
                    negated=true;
                    words.splice(n+1,1); //remove 'not'
                    if (n == words.length-1) err("error parsing keyword 'is not'. Expected: another word after 'is not'");


                // basic replacement:  is -> ==, is not -> !=
                // special cases: x is function, is string, is array, is object  -> (typeof x === 'type')
                //                x is null, x is undefined -> if (!x) {...

                // Usage 1: is ->  ==
                // Usage 2: [variable] is [null|undefined]  ->js:  if (![variable]){...   // false for null,undefined and ''
                // Usage 3: [variable] is [function|string|object|array]  ->js:  typeof [variable]==='[keyword]'"

                case word[n+1] //special cases

                    when "function","string","number","object" or "Object" //-> (typeof x ==='type')

                        word[n-1]="typeof "+word[n-1]; // [var] --> typeof [var]
                        word += "=" // '=='/'!=' --> '===' / '!=='
                        word[n+1]="'"+word[n+1]+"'"; // quote keyword function|string|object...
                        n++; // skip-it

                    when "array" or "Array" // --> Object.prototype.toString.call(x)==='[object Array]'
                        word[n-1]="Object.prototype.toString.call(" +word[n-1]+")"
                        word += "=" // '=='/'!=' --> '===' / '!=='
                        word[n+1]="'[object Array]'";
                        n++; // skip-it

                    when "null" or "undefined"
                        word=word[n-1];
                        word[n-1]=(negated?'':'!'); // if x is null -> if( !x ) {...
                        break;

            end case "is"

            when "points" // to be clearer than ===
                // basic replacement:  points as -> ===
                word='===';
                if (n+1<words.length-1 && word[n+1]=='as') word[n+1]=""; //optional 'as'

            default:
                word=DoubleOper(word,"<>","!="); // a<>b -> a!=b
        end case

        words[n]=word; //replace word

        if thenKeywordFound then break

    end for

    if not thenKeywordFound // si NO HUBO un 'then'... | if there was not a 'then' keyword....

        words.push(')'); // fuerzo ")" | force ")"

        n++; // que lo incluya | include it


    // saco lo procesado hasta aqui, words[0..n-1], y considero lo que siga como una linea inferior identada
    // output words[0..n-1], and process the rest of the line as the start of an indented block

    startBracedSubBlock ( {keyword:'if'}, n );

end function

//-----------------------------------------
//-----------------------------------------
function Sugar_CASE_Block(leido) 

    // "case"'s first line
    var words=leido.words;

    if (words.length==1) err("expected [var name] or 'when' after 'case'");

    // aqui: words.length >=2

    var n;

    var booleanMode=(words[1]=='when');

    if booleanMode // mode 1: case when [bool expression] then... /n when [bool expression] then... /n else... /n end case

        words[0] = "if";

        words[1] = "(";  // --> if ([bool expression]) { /n ...  /n } else if ([bool expression]) { /n ... /n } else { /n };

        n = replaceLast(words,2,'then',")")+1; //busco 'then' que marca el fin de la expresion
                                                // 'then' gets replaced by ')'
        // n = index of 'then'

    else // mode 2: case [var] when [value] then...

        words[0] = "switch("+words[1]+")";

        n=2; //from 3rd word as a new line

    end if

    // saco lo procesado hasta aqui, words[0..n-1], y considero lo proximo como otro bloque
    // output words[0..n-1], and process the rest of the line as an indented block

    startBracedSubBlock ( {booleanMode:booleanMode}, n );


