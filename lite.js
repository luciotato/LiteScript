// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------
// LiteScript Processor
// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------

// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
// This js code should work on node and the browser. For node-specific code see main.js --
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------

//--------------------------
// class Lite (processor) --
//--------------------------

//-- 'new' Constructor
//-------------------------
function Lite(){

    this.source = []; // pre-processed, each item is a object "new Leido"

    this.pos = { //position on source
        lineIndex : -1
        ,originalSource_lineIndex: -1
    };

    this.extraSugar_fns=[];
}

// methods
// -------

// add sugar
// ------------------------------------
Lite.prototype.addSugar = function(fn){
    this.extraSugar_fns.push(fn);
};

// setSource
// ---------------------------------------------
Lite.prototype.setSource = function(sourceText){

    this.sourceLines = sourceText.split("\n");

    this.preProcess();

    this.result = [];
    this.pos.lineIndex = -1;
    this.pos.originalSource_lineIndex = -1;
};

//----------------------------
// class State
//----------------------------
//
//- 'new' Constructor
//-------------------
function State(lite,keyword,indent) {

    if (!lite || ! this instanceof State) throw new Error("call 'lite.makeState()' instead of 'new State()'"); // do not call directly

    this.lite = lite; // remember to wich processor this state belongs

    if (!keyword) { //main block
        this.blockStarterIndent=0;
        this.terminator=' ';
    }
    else if (keyword instanceof Leido) { //if called as: lite.makeState(leido)
        this.leido = keyword;
        this.blockStarterIndent=keyword.indent;
        this.keyword=keyword.code;
    }
    else {
        this.keyword=keyword;
        this.blockStarterIndent=indent;
    }

    this.blockStater = '{'; //default block opener

}
// end class State
//------------------

// ----------------
// Lite.makeState -
// ----------------
Lite.prototype.makeState = function(leido){
    return new State(this,leido);
};

// ----------------------------------------
// LiteScript Processor -------------------
// ----------------------------------------
//-----------------------------------------
//--- MAIN *RECURSIVE* fn processBlock ----
//-----------------------------------------
//--- Read lines, split words, replace ----
//--- until end of block ------------------
//-----------------------------------------
/*
Key to understand LiteScript processing:
----------------------------------------

    The 'processBlock' function is called recursively on each indentation increment (a new block)

    The recursion pushes each new 'state' parameter in the stack, so the process will
    enter a new state on each block, and will recover the previous state when
    exiting the block (return).

Clave para entender el proceso LiteScript:
------------------------------------------

    La funcion 'processBlock' se llama recursivmente en cada incremento de identacion (block)

    La llamada recursiva pushes cada 'state' en el stack, por lo que el proceso
    entrara en un nuevo estado en cada bloque, y recuperara el estado previo
    al salir del bloque (return).
*/

//---------------------------------------------
Lite.prototype.processBlock = function(state) {

    if (!state) state=this.makeState();

    state.blockLinesCount=0;

    // default values | valores default
    if (!state.blockIndent) state.blockIndent=state.blockIntroIndent+4;
    if (!state.terminator) state.terminator="}";
    if (!state.endWord) state.endWord="end";
    if (!state.EndBlock_callback) state.EndBlock_callback = this.Default_EndBlock_callback;
    if (!state.separator) state.separator = ';'; // default, statement separator

    var leido;

    // read lines until end of block
    while(true) {

        // read line
        leido = this.readNext();  // leido = read (as in: ~red)
        if (leido.EOF) return; //EOF

        state.blockLinesCount++;

        // prepare base new state (in case a new block is started)
        leido.nextCode(); //first code
        var newState = this.makeState(leido);

        //debug breakpoint
        if ( leido.line.indexOf("< result.length")>=0 )
            null;
        //--------

        // call registered extra sugar functions
        var thisLite=this;
        this.extraSugar_fns.forEach(
                function(extraSugar_fn){
                        extraSugar_fn(thisLite,newState,state);
                }
        );

        if (leido.code==="function" || leido.code==="export") {

            this.sugar_FUNCTION(newState, state);

        } else if (leido.code==="if" || leido.code==="while") {

            this.sugar_BOOL_EXPRESION(newState, state);

        } else if (leido.code==="case" && state.keyword !== 'switch') {

            this.sugar_CASE(newState, state);

        } else if (leido.code==='when') {

            if (state.keyword==='case' ) {
                this.sugar_CASE_WHEN_subBlock(newState, state);
            }
            else {
                this.sugar_WHEN_DONE(newState, state);
            }

        } else if (leido.code==='for' ) {

            this.sugar_FOR(newState, state);

        } else if (leido.code==='on' ) {

            this.sugar_ON(newState, state);

        } else if (leido.code==='else' ) {

            if (leido.nextCode()==='if') {

                this.sugar_BOOL_EXPRESION(newState, state);
            }

        } else if (leido.code==='bool' ) { //sugar for boolean var assignment

            this.sugar_BOOL_VAR(newState, state);

        }

        // after the sugar, depending on the indentation of the next line,
        // we can close the current block, continue, or open a sub-block.
        // peek ahead, next line
        var nextItem = this.peekNextItem(); // peek Next code Line

        if ( nextItem.indent > leido.indent ) { // next line is indented
            //--> this line is a block starter

            //new block
            newState.blockIndent = nextItem.indent; //block indent: defined by first indented line
            if (leido.code==='var') newState.separator=','; // for 'var' blocks => ',' is item separator

            var last = leido.lastCode();
            if (last==='done:') { //callback signal
                leido.replaceWith(' '); // clear...
                if (leido.lastcode()==='when') leido.replaceWith(' '); // clear...
                leido.appendCode(',function(err,data)')
                //next block is function body
            }

            if (leido.code==='switch'||leido.code==='case'||leido.code==='default') { // for js 60's "C" inherited 'switch', no open brace, no terminator
                newState.terminator=' ';
            }
            else { // regular curly-abided constructions
                // add block's opening brace to this line, if it's not there
                if (!newState.openBraceInserted) newState.openBraceInserted = leido.addTerminator(newState.blockStater,' ');
            }

            this.out(leido);  // out read (& converted) block starter line

            // RECURSIVE - new sub-block
            //----------------------
            this.processBlock(newState);
            //----------------------

            state.blockLinesCount+=newState.blockLinesCount; // add sub block lines count to this block

            nextItem = this.peekNextItem(); // re-peek Next code Line, after sub-block

        }
        else { // Next line is not indented, this is not a block starter line,
               // all in all you're just another line in the block

            last = leido.lastCode();
            if (last===',') { // ends with ','
                newState.separator=','; // assume line separator is comma
            }
            else if (last==='...') { //callback signal
                leido.replaceWith(' '); // clear...
                newState.separator=','; // inside function call, separator is comma
                //next line should be 'when done'
            }

            // add separator, if it's required
            if (!nextItem.avoidSeparator()) leido.addTerminator(state.separator);
            this.out(leido);  //out read (& converted) line
        }

        //check for block closing
        if ( nextItem.indent < leido.indent ) { // next line is -less- indented

            // close this block, add '}'

            if (!nextItem.line.startsWith(state.terminator)) { // add '}', if it isn't there

                if ( nextItem.line.startsWith(state.endWord+' ') // --> Block-end cues: 'end if', 'end function', 'end case'...
                     && nextItem.indent==state.blockStarterIndent ) { // && correctly positioned

                    nextItem.line = state.terminator + ' //'+nextItem.line; // close block, with optional cues as comment

                } else {
                    // no closing brace, no cues --> add closing block brace, auto-cues
                    // closing block brace on its own line
                    var cue = (state.leido && state.blockLinesCount>4 && state.keyword!='var'? "// end "+ state.leido.line : "");
                    this.out( state.blockStarterIndent,
                        state.terminator + cue );
                }

            }

            state.EndBlock_callback(newState, nextItem); //end of block, callback hook

            break; //*** end of this block (break loop, return)
        }

        // hook for online test
        if (this.advanceHook) this.advanceHook();

    } //end while, loop until end of block

};


//-----------------------------------------
//---- SUGAR for 'function' ---------------
//-----------------------------------------
/*
Lite: ------------------

    function now
        return today();

    function aFunction( a:number, b:array )
        var r = a
        for each num in b
            r+=num
        return r
    end function

js: -------------------

    function now(){
        return today();
    }

    function aFunction(a,b){ //a:number, b:array
        var r=a;
        b.forEach(function(num,i){
            r+=num;
        });
        return r;
    };

*/
//-----------------------------------------
Lite.prototype.sugar_FUNCTION = function(newState, blockState) {

    var leido = newState.leido;
    var words = leido.words;

    if (newState.keyword==='export'){
        newState.expect('function');
        newState.keyword='function';

        newState.functionName = leido.nextCode();

        leido.replacePrevious('module.exports.'+newState.functionName+' =function');
    }
    else {
        newState.functionName = leido.nextCode();
        if (newState.functionName==='(') { // anonymous fn
            newState.functionName='';
            leido.inx--; // return paren
        }
    }

    if (leido.nextCode() !='(') { // has no ( )
        leido.appendCode('()'); // inject "()"
    }

    // remove optional type information
    var typeInfo=[];
    var lastcode = leido.code;

    while (leido.nextCode()) {

        if (leido.code===':') { // optional type information (a:string, b:number, c:array)
            var colon_inx = leido.inx;
            typeInfo.push(lastcode +': '+ leido.nextCode()); // save info
            words[colon_inx]=""; //clear
            words[leido.inx]=""; //clear
        }

        lastcode = leido.code;
    }

    if (typeInfo.length) words.push("// "+typeInfo.join(', ')); // add typeinfo as comment

};

//-----------------------------------------
//---- SUGAR for 'for' --------------------
//-----------------------------------------
/*
Lite: ------------------

    for var n=0 to x
        [command]
        [command]


js: -------------------

    for (var n=0;n<=x;n++) {
        [command]
    }

Lite: ------------------ 'for each' every element in array -->js: for (var i=0;i<words.length;i++)

    for each item in array
        [command]
        [command]


js: -------------------

    array.forEach(function(item,i){
        [command]
        [command]
    });
*/
//-----------------------------------------
Lite.prototype.sugar_FOR = function(newState, blockState) {

    var leido = newState.leido;
    var words = leido.words;

    if (leido.nextCode()!=='(') { // is not pure-js 'for('... add sugar

        var varname;

        if (leido.code==='each') { // sugar for each

            blockState.out("//"+leido.line); // for each a in items... as comment
            varname=leido.nextCode(); // get varname
            newState.expect('in'); //next should be 'in'
            var arrayName = leido.nextCode();

            // Modo standard
            blockState.out('for(var index=0; index<'+arrayName+'.length; index++){');
            words[0]= space(4)+'var '+varname+'='+arrayName+'[index];';
            words.splice(1);
            newState.openBraceInserted=true;

            // Modo nuevo: Array.forEach
	     /* el problema que tiene es que el debugger lo pasa como un solo statement
            words[0]= arrayName+'.forEach(function('+varname+',index){';
            words.splice(1);
            newState.terminator="})";
	     */


        } else { // sugar for... to

            leido.insertCode('('); // add '('

            if (leido.code==='var') leido.nextCode(); //read another
            varname=leido.code; // get varname

            var inx_eq = words.indexOf('=');
            if (inx_eq<0) {
                newState.err("Equal (=) not found. Expected for [var] x =... " );
            }

            var inc_dec='++';
            var compare='<=';
            var inx_to = words.indexOf('to');
            if (inx_to<0) {
                inx_to = words.indexOf('downto');
                inc_dec='--';
                compare='>=';
            }
            if (inx_to<0) newState.err("Expected 'to/downto' after 'for'");

            words[inx_to]='; '+varname+' '+compare; // add ;varname<=/>= x
            leido.appendCode(' ; '+varname+inc_dec+')'); // add ;varname++/--)
        }
    }
};

//-----------------------------------------
//---- SUGAR IF, WHILE, bool expressions --
//-----------------------------------------
/*

Lite ------------------

    if  a is 2  and b is 3  and c is null  then
        console.log("a is 2, etc")

    if no data then
        log('no data')
    end if

    if callWithArr is function and data is Array then
        result=callWithArr(err,data)
        case
            when err is not null
                log(err.message)
            when result is null
                log('empty result')
            else
                save(data)
        end case
    end if

--> js: ------------------

    if (a==2 && b==3 && !c){
        console.log("a is 2, etc");
    }

    if (!data) {
        log('no data');
    }

    if ( typeof callWithArr === 'function' && Object.prototype.toString.call(data)==='[object Array]'){
        result=callWithArr(err,data);
        if (!result) {
            log('empty result');
        } else if (err) {
            log(err.message);
        } else {
            save(data);
        }

    }

*/
// --------------------------------
Lite.prototype.sugar_BOOL_EXPRESION = function(newState, blockState) {

    var thenKeywordFound=false;

    var insertedOpeningPar = false;

    var leido = newState.leido;

    var prev_inx = leido.inx;

    var words = leido.words; //convenience

    var codecount=0;

    // process 'if'/'while' line words
    while (leido.nextCode() && !thenKeywordFound) {

        codecount++;
        if (codecount==1 && leido.code!='(') { // missing "("
            insertedOpeningPar = leido.insertCode('('); // returns true if inserted
        }

        switch(leido.code) {

            case "not": case "no": leido.replaceWith("!"); break;

            case "<>": leido.replaceWith("!="); break;

            case "and": leido.replaceWith("&&"); break;

            case "or": leido.replaceWith("||"); break;

            case "contains":
                words[leido.inx-1]='.'; //se supone es un espacio
                leido.replaceWith("indexOf(");
                var spaceAfter=find(words,' ',leido.inx+2);
                words[spaceAfter]=')>=0 '; // insert ")>=0" in the next space
                break;

            case "in": // var in [value,value,value] => [value,value,value].indexOf(var)>=0
		  var varname=words[leido.inx-2];
                leido.replaceWith("(");
                var arrayEnd=find(words,']',leido.inx+2);
                words[arrayEnd]='].indexOf(' + varname +')>=0)'; // insert "].indexOf.. at the end og the literal array
                words[leido.inx-2]=""; // entre parens, para q tenga priorodad sobre "not"
                break;

            case "then":
                leido.replaceWith( insertedOpeningPar? ")": "" );
                thenKeywordFound=true;
                break;

            case "is":
                var is_inx = leido.inx;
                leido.replaceWith("===");

                if (!leido.nextCode()) newState.err("error parsing keyword 'is'. Expected: more words after 'is'");

                var negated=false;
                if (leido.code==='not'){
                    words[is_inx]="!="; // <-- replacement for 'is not'
                    negated=true;
                    leido.replaceWith(""); //remove ' not'
                    if (!leido.nextCode()) newState.err("error parsing keyword 'is not'. Expected: another word after 'is not'");
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
                        words[leido.inx]= "'" + words[leido.inx] + "'"; // quote keyword function|string|object...
                        break;

                     case "array": case "Array": // --> Object.prototype.toString.call(x)==='[object Array]'
                        words[prev_inx]="Object.prototype.toString.call(" +words[prev_inx]+")";
                        words[leido.inx]="'[object Array]'";
                        break;

                    case "null": case "undefined": // if x is null -> if( !x ) {...
                        words[is_inx] = words[prev_inx]; //variable
                        words[prev_inx]=(negated?'':'!');
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
        leido.appendCode(')'); // add closing par ")" | agrego ")"
    }

};

//-----------------------------------------------------
// SUGAR bool
//
// bool [var] x = [bool expression]
//
//-----------------------------------------------------
Lite.prototype.sugar_BOOL_VAR = function(newState, blockState) {

    var leido=newState.leido;
    leido.replaceWith(''); //remove 'bool'
    if (leido.nextCode()=='var') leido.nextCode(); //varname
    leido.nextCode(); // =
    this.sugar_BOOL_EXPRESION(newState,blockState); //process rest of line as a bool expression
}


//--------------------------------------------
//---- SUGAR CASE, instead of "switch" -------
//--------------------------------------------
/*
---------------------------------------------------------
    (implmented as ANSI SQL "CASE")

        Lite:
    ------------------------
    -- Mode 1 : CASE [var] WHEN [value]

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

        ------------------------
        -> js:

        if ([var]==value || var==value) {
            [commands];

        } else if ([var]==value || var==value || var==value) {
            [commands]
            [commands]
            [commands]

        } else {
            [commands]
        };

    ------------------------
    -- Mode 2 : CASE /n
                    WHEN boolean expressions

        case
            when [boolean expression 1] then [commands]

            when [boolean expression 2] then
                [commands]
                [commands]
                [commands]

            when [boolean expression 3]
                [commands]
                [commands]

            else
                [commands]

        end case


        ------------------------
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

//-----------------------------------------------------
Lite.prototype.sugar_CASE = function(newState, blockState) {

    // "case"'s first line

    var leido = newState.leido;
    var words=leido.words; //convenience

    newState.keyword='case';

    var case_inx = leido.inx;

    if (!leido.nextCode()) { //only 'case', mode 1: case /n when [bool expression] then...

        words[case_inx] = "// " + words[case_inx]; //comment case

    } else { // mode 2: case [variable] /n when [value] then...

        newState.varName = leido.code;

        if (!leido.nextCode()) { // only one word, single variable

            words[case_inx]="{ //"+words[case_inx]; //open block, comment original code

        } else { // more than one word => expression, store to evaluate only once
            this.out(leido.indent, "//" + leido.line); //add comment, original source
            newState.varName='$value';
            words[case_inx]="{ var " + newState.varName + '=' ; //evaluate expresion once, store in $value
            leido.addTerminator(";");
        }

        newState.openBraceInserted=true; //already inserted

    }

};

// -------------------------------
Lite.prototype.sugar_CASE_WHEN_subBlock = function(newState, blockState) {

    //check
    if ( blockState.keyword!='case') blockState.err("'when' without 'case'");

    newState.keyword='when';

    var leido = newState.leido;

    leido.replaceWith("if");
    if (blockState.blockLinesCount>1) leido.insertCode('else ');

    if (blockState.varName) { //Mode case varname /n when x then...

        leido.replaceWith("if (");

        this.sugar_CASE_VAR_subBlock(newState, blockState);

    } else {// Mode case /n when [bool expression] then...

        this.sugar_BOOL_EXPRESION(newState, blockState);

    }
};

// -------------------------------
Lite.prototype.sugar_CASE_VAR_subBlock = function(newState, blockState) {

    var leido = newState.leido;
    var words=leido.words; //convenience

    var valueCount=0;
    var thenFound=false;
    var codeFound=false;
    var orAdded=false;

    // check each word in the 'when' line (to construct js's condition $value=value1 ||...)
    // veo cada palabra en esta linea de "when" (valores para js's condition)
    while (leido.nextCode()) {

        if (leido.code===':' ) {
            words[leido.inx]=""; //  optionals, delete | opcionales, borro

        } else if (leido.code===',' || leido.code==='or' ) {
            words[leido.inx]="||"; //  or value==...
            orAdded=true;

        } else if (leido.code==='then') { // 'then' -> //end of value list | fin de lista de valores
            thenFound=true;
            var then_inx=leido.inx;
            words[then_inx]=")"; // replace 'then'
            if (leido.nextCode()) {
                // there is code after 'when', assume single line 'when'
                words[then_inx]=") {"; // replace'then'
                codeFound = true;
                leido.addTerminator('}');
                break; //end of value list
            }
        }
        else { // a value
            var compare='===';
            if (++valueCount>1 && !orAdded) leido.insertCode('||');
            leido.replaceWith(blockState.varName + compare + words[leido.inx]); // Lite: 'when [value]' --> js: '...|| $value==[value]'
            orAdded=false;
        }

    }//end while

    if (!thenFound)  {
        leido.appendCode(")");
    }

    //check, in case there is no code after 'case'
    if (!codeFound)  {
        var nextItem=this.peekNextItem();
        if (nextItem.indent <= leido.indent) newState.err("expected some CODE for the 'case/when' block");
    }

};


//-----------------------------------------------
//---- SUGAR "when done:", sugar for callbacks --
//-----------------------------------------------
/*
Note: 'when done:' can be used on the same line,
or in the next line, same indent.

Lite:
-----

    readFile(filename,...
    when done: (data)
            writeFile(dest, data, when done:
                if err then
                    response.end(err.message)
                else
                    response.end('data saved')


---> js:

    readFile(filename, function(data){
            writeFile(dest,data,function(){
                    if (err)
                        response.end(err.message)
                    else
                        response.end('data saved')

            });
    });


*/
// -------------------------------
Lite.prototype.sugar_WHEN_DONE = function(newState, blockState) {

    var leido = newState.leido;
    this.out(leido.indent,'//'+leido.line); //out "when done:" as comment

    newState.terminator = '});'; //close fn call when closing "when done:" block

    leido.replaceWith('function');// replace 'when'

    //check
    newState.expect('done');
    leido.replaceWith('');// replace 'done'

    if (leido.nextCode()===':') { leido.replaceWith('');leido.nextCode(); } // optional ":"

    if (leido.code==='(') return; //explicit prameters, nothing more to do

    leido.insertCode('(err,data)'); //default paramteres
    if (leido.code!=='') {// more code on the same line
            leido.insertCode('{');
            leido.appendCode('})');
    }

    return; //continue, process subblock

};

//----------------------------------------------
//---- SUGAR "on", sugar for event listeners ---
//----------------------------------------------
/*
Lite:
-----

    on session2 'changeScrollTop'
        function(scroll)
            session1.setScrollTop( parseInt(scroll) || 0 )

---> js:

    session2.on('changeScrollTop'
        ,function(scroll) {
            session1.setScrollTop(parseInt(scroll) || 0)
      }
    );


*/
// -------------------------------
Lite.prototype.sugar_ON = function(newState, blockState) {

    var leido = newState.leido;
    //this.out(leido.indent,'//'+leido.line); //out as comment

    var emitterName = leido.nextCode();

    leido.replacePrevious(emitterName+'.on(');// replace 'on object' --> object.on(

    var eventName = leido.nextCode();

    if (leido.nextCode()) { // there are more code on the same line
        //assume function call as in: on socket 'close' flushData(socket)
        //close the 'on' call here
        leido.appendCode(')');
    }
    else {
        newState.blockStater = ','; // indented items are parameters on the 'on' call
        newState.terminator = ');'; //close 'on' call when closing this block
    }

    return; //continue process, normally a sub-block indented function (the listener)

};

//----------------------------
// utility protoype functions
//----------------------------
Lite.prototype.Default_EndBlock_callback = function(blockState, nextItem) {
    // end of block hook
    return null;
};

//----------------------------------
// utility String protoype functions
//----------------------------------
String.prototype.startsWith =
    function(s){ return this.slice(0, s.length) == s; };

String.prototype.isComment =
    function() { return (this.length>1 && ( this.slice(0,2)==="//" || this.slice(0,2)==="/*" ) ); };

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
};

String.prototype.findMatchingPair = function (start, closer) {
    var opener=this[start];
    var opencount=1;
    for (var n=start+1;n<this.length;n++) {
        if (this[n]==closer && --opencount===0) return n;
        if (this[n]==opener) opencount++;
    }
    return -1;
};

//-------------------------------------------------
// Utility generic functions - String management --
//-------------------------------------------------
function space(cant){
    var spaces=[];
    spaces[cant]='';
    return spaces.join(' ');
}

// -------------------------
function splitJSLine(s){
    var start=0;
    var previous;
    var quoteChar;
    var inQuotes = false;
    var res=[];

    for(var i=0;i<s.length;i++) {

        var char = s[i];

        if (inQuotes){
            if (char==quoteChar && i<s.length && s[i+1]!=char){ //end of quotes
                inQuotes=false;
                var quoted=s.slice(start,i+1);
                if (quoteChar==='"') quoted = replace$inPlace(quoted);
                res.push(quoted );
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
                    if (previous==='/'){ // //-comment
                        res.push(s.slice(start));
                        i=s.length;
                        start=i+1;
                    }
                    break;

                // Separators
                case ' ': case ':': case ',': case ';': case '=': case '<': case '>': case '!':
                case '(': case ')': case '{': case '}': case '[': case ']':
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

//---------------------------
function quoted(s){
    return '"'+s+'"';
}

//-----------------------------------------
//--- find: return next index or .length --
//-----------------------------------------
function find(s,searched,start){
    var inx=s.indexOf(searched,start);
    return inx<0? s.length : inx;
}

//------------------------
//- split on $expresion --
//-------------------------
function split$expressions(q, err_fn){ //returns { items:[{pre,$pos,$len,expr},...], post:string}

    if (!q) return {items:[],post:''};

    // look for $expression or $(expression) inside a quoted (") string
    var n,i;
    var items=[];

    q=q.trimRight();

    //clear start and end quotes
    if (q[0]==='"') q=q.substr(1);
    if (q[q.length-1]==='"') q = q.substr(0,q.length-1);


    var last_delimiter=0;
    while (true) {
        var item={};
        n=q.indexOf('$',last_delimiter);
        if (n<0) break;

        item.pre=q.slice(last_delimiter,n);
        item.$pos=n;
        var start=n+1;
        if (q.slice(start,start+1)==="(") { // is "$(...)"
            i=q.findMatchingPair(start,")");
            if (i<0) {
                err_fn && err_fn('col:' + start + ', unmatched "("');
                break;
            }
            start++; //do not include open par
            last_delimiter=i+1; // nor closing par
        }
        else { // is not "$("
            // look for delimiter (not (word_character or .)
            var delim=q.slice(start).search(/[^\w.]/);
            if (delim===-1) i=q.length;
            else i=start+delim;
            last_delimiter=i;
        }

        item.$len=i-n;
        item.expr=q.slice(start,i);
        items.push(item);

    }
    return {items:items, post:q.slice(last_delimiter)};
}

//----------------------------
function replace$inPlace(q,err_fn){

    var spl=split$expressions(q);
    var arrResult=[];
    spl.items.forEach(
        function(item,index){
            if (item.pre) {
                arrResult.push(quoted(item.pre));
                arrResult.push(' + ');
            }
            arrResult.push(item.expr);
        }
    );
    if (spl.post) arrResult.push(quoted(spl.post));

    if (arrResult.length===0) return '""'; //must return a string expression
    return arrResult.join('');
}
//---------------------------
//-- End generic functions --
//---------------------------



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
            ( line.slice(0,2)==="//" || line.slice(0,2)==="/*" )
        );

    this.hasCode = ((line && !this.lineComment)? true: false);

    this.inx=-1;
}

//- Methods
//---------
Leido.prototype.readNextCode = function() {
    this.code ='';
    this.inx++;
    if (!this.words) return false; //no words
    // skip spaces & comments
    while (this.inx<this.words.length && !this.words[this.inx].isCode()) this.inx++;
    if (this.inx>=this.words.length) return false; // ***** no more code words
    this.code = this.words[this.inx];
    return true;
};

Leido.prototype.nextCode = function() {
    this.readNextCode(); //get next
    return this.code; //return it
};

Leido.prototype.replaceWith = function(s) {
    if (this.inx<this.words.length) this.words[this.inx] = s;
};

Leido.prototype.replacePrevious = function(s) {
    this.words.splice(0, this.inx );
    this.inx=0;
    if (s)
        this.replaceWith(s); //replace with something else
    else
        this.words.shift(); //also remove this one
};

Leido.prototype.avoidSeparator = function() {
    return this.line.startsWith('when') || this.line.startsWith('{');
};

// -------------------------------
Leido.prototype.insertCode = function(char,where){

    var inx= where? where : this.inx; // default is actual position
    // adds [char] (usually "(") if it isn't there

    // skip comments and spaces
    var n=inx;
    while ( n<this.words.length
            && (this.words[n]===' ' || this.words[n].isComment() )
          )
       n++;

    // add '(' if it isn't there
    if (n>=this.words.length || !this.words[n].startsWith(char)) { // next word does not have it
        this.words.splice(inx,0,char); // insert at inx
        if (inx<=this.inx) this.inx++; //adjust leido.inx
        return true; //inserted
    }

    return false;
};

//----------------------------
Leido.prototype.lastCode = function(char){
    // search for the last code at the end of the line (considering comments)

    // skip comments and spaces at the end of the line
    var n=this.words.length-1;
    while ( n>=0 && (this.words[n]===' ' || this.words[n].isComment()) )
       n--;

    this.inx=n;
    return this.words[n];
};

//----------------------------
Leido.prototype.appendCode = function(char){

    // adds [char] (usually ")") to the end of the line (considering comments)

    this.lastCode(); // skip comments and spaces at the end of the line
    // insert after
    this.words.splice(this.inx+1,0,char);
};

//----------------------------
Leido.prototype.addTerminator = function(terminator, pre){

    // adds ";" or " {" to the end of the line (considering comments)

    if (!this.commentLine) {

        // default value
        pre=pre||'';

        // skip comments and spaces at the end of the line
        var n=this.words.length-1;
        while ( n>=0 && (this.words[n]===' ' || this.words[n].isComment()) )
           n--;

        // add ';' or '{' if it isn't there
        if (n==-1) { // only comments
            this.words.unshift(pre + terminator); // insert at 0
            return true; // inserted
        }
        else
            if (!this.words[n].endsWith(terminator) && !(terminator===';' && this.words[n]==='}') ) {
                this.words[n] += (pre + terminator);
                return true; // inserted
            }

        return false; // not inserted
    }
};

//----------------------------
Leido.prototype.trimComments = function(){

    // get comments
    var comments=this.words.filter(function(item){return item.isComment()});

    // trim comments
    this.words = this.words.filter(function(item){return !item.isComment()});

    // trim spaces at the end of the line
    var n=this.words.length-1;
    while ( n>=0 && (this.words[n]===' ' || !this.words[n] ))
       n--;
    // truncate
    this.words.length=n+1;

    // return comments
    return comments;
};

// end class Leido
//----------------------------


// more methods
//----------------------------
State.prototype.split$expressions = function(){
    // calls split$expressions with blockState.leido.words
    //returns { items:[{pre,$pos,$len,expr},...], post:string}
    return split$expressions(this.leido.words.join(''), this.err);
};
//----------------------------
State.prototype.out = function(s){
    // agrego linea al resultado
    this.lite.result.push( space(this.blockIndent) + s );
};

//----------------------------
Lite.prototype.out = function(first, s){

    if (first instanceof Leido) { // called as: lite.out(leido);
        s=first.words.join('').trimRight();
        first = first.indent;
    }
    // agrego linea al resultado
    this.result.push( space(first) + s );
};

// -------------------------
State.prototype.err = function(s) {
    var sourceRef;
    if (this.lite.fileName)
        //sourceRef='"'+this.lite.fileName + '",'+this.leido.sourceLinesStart+',1';
        sourceRef= __dirname+'/'+this.lite.fileName+':'+this.leido.sourceLinesStart;
    else
        sourceRef='line :'+this.leido.sourceLinesStart;
    console.log(s,sourceRef);
    this.lite.out(this.blockIndent, "---------------------------------------------------");
    this.lite.out(this.blockIndent, "!!! ERROR: " + s);
    this.lite.out(this.blockIndent, "source line " + this.leido.sourceLinesStart+":");
    this.lite.out(this.leido.indent, this.leido.line);
    this.lite.out(this.blockIndent, "---------------------------------------------------");
};

// ----------------------------------------------
// Expect, throw error if not
// ----------------------------------------------
State.prototype.expect = function (expected) {
    if (this.leido.nextCode()!==expected)
        this.err("Expected '"+expected+"' after '"+this.leido.words.slice(0,this.leido.inx).join('')+"'");
};

//----------------------------
Lite.prototype.preProcess = function() {// sourceLines[ string ] --> source[ {hasCode:bool, EOF:bool, indent:number, line:string },... ]

    this.source=[];

    var insideMultilineComment=false;
    var isHTML=false;

    var leido;

    //pre-process all source lines
    //append on continuation code
    for(var n=0; n<this.sourceLines.length; n++) {

        var start = n;
        var line = this.sourceLines[n].trimRight(); //trim extra spaces

        // line continuation code: ' _'
        while (n < this.sourceLines.length-1 && line.length>=2 && line.slice(-2)===' _') {
            line=line.slice(0,-1) + this.sourceLines[++n].trimLeft().trimRight(); //append next line
        }

        leido = new Leido(line);

        line = leido.line; // convenience. w/o leading spaces

        leido.sourceLinesStart = start;
        leido.sourceLinesEnd = n;

        if (line.startsWith("/*" )) insideMultilineComment= true;
        if (!insideMultilineComment && line.startsWith('<')) isHTML = true;

        if (insideMultilineComment || isHTML) {
            leido.commentLine = true;
            leido.hasCode = false;
        }

        if (insideMultilineComment && line.indexOf("*/")>=0) {
            insideMultilineComment= false;
        }

        if (!insideMultilineComment && isHTML && line.indexOf("<script>")>=0) {
            isHTML= false;
        }

        this.source.push(leido);
    }

    //add end line, close all blocks, indent=-1
    leido = new Leido('');
    leido.indent=-1;
    leido.EOF=true;
    leido.words=[];
    this.source.push( leido );

    //reset indexes
    this.pos.lineIndex=-1;
    this.pos.originalSource_lineIndex=0;

};

//----------------------------
Lite.prototype.peekNextItem = function() {//peek ahead next code line

    for(var n=this.pos.lineIndex+1; n<this.source.length-1; n++) {
        if (this.source[n].hasCode) return this.source[n]; //another line
    }
    return this.source[n]; //return last extra line, indent=-1
};


//----------------------------
Lite.prototype.readNext = function() // read next source code line
                    //return leido={line:string, indent:number, words:[], [EOF:true]}
                    // skips comments and empty lines
{

    var leido;

    // while empty or comment lines
    // mientras sean lineas vacias o de comentario
    while(true){

        this.pos.lineIndex++;

        if (this.pos.lineIndex >= this.source.length-1) {
            return this.source[this.source.length-1]; //extra line, indent=-1, close all blocks
        }

        leido = this.source[this.pos.lineIndex]; //advance, position on pre-processed source

        //position on original source
        this.pos.originalSource_lineIndex=leido.sourceLinesEnd;

        if (leido.hasCode) break; // Code line, exit "skip blank and comments" loop

        this.out ( leido.indent, leido.line );
        // isn't code, output w/o change, keep reading lines

    } // loop - keep reading lines, while line is empty or comment
      // loop - sigo leyendo, mientras sea linea vacia o de comentario


    //aqui, la linea contiene codigo
    //here, the line has code

    //split words
    leido.words = splitJSLine(leido.line);

    return leido;
};

//--------------------------------------------------------------------
// Lite.getSubBlock(state) //append sub-block into state.leido.words
//--------------------------------------------------------------------
State.prototype.appendSubBlock = function() {
    var leido = this.leido;
    var comments=leido.trimComments();
    var res=leido.words;
    while (true) {
        // peek ahead, next line
        var nextItem = this.lite.peekNextItem(); // peek Next code Line
        if (nextItem.indent > this.leido.indent) { //next line is indented
            var nextLine=this.lite.readNext(); //get next line
            comments = comments.concat(nextLine.trimComments()); //trim comments
            res.push(' '); // add a space and...
            res = res.concat(nextLine.words);  // concat next line words
        }
        else
            break; //break loop

    } //loop

    this.leido.words = res;
    return comments;
};


// ----------------------------------------------
// Process all source loop
// ----------------------------------------------
Lite.prototype.process = function (sourceText) {

    this.setSource(sourceText);

    while (this.pos.lineIndex < this.sourceLines.length-1) {
        this.processBlock(); //level 0 blocks
    }

};



// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------
//-- exports
//-- node or js:require
// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------
if (typeof module!=='undefined') { // inside 'require'
    module.exports = Lite; //export class
}
