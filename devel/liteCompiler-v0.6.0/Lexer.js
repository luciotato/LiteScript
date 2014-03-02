//The Lexer
//=========

//The Lexer translates code (an array of lines) into an array of tokenized lines to be parsed.

//The Lexer class acts as
//* Lexer/Tokenizer
//* Token Stream (input)

//All the parts of the lexer work with "arrays" of lines.
//(instead of a buffer or a large string)

//The first lexer pass analyzes entire lines.
//Each line of the array is classified with a 'Line Type':

   var LineTypes = {CODE: 0, COMMENT: 1, BLANK: 2};

//then each CODE line is *Tokenized*, getting a `tokens[]` array

//-------------------------
//### dependencies

   //import log
   var log = require('./log');
   var debug = log.debug;


//The Lexer Class
//===============

   //class Lexer
   //constructor
    function Lexer(compiler, options){
     //     properties

        //compiler
        //filename:string
        //options

        //lines:string array
        //infoLines: InfoLine array

        //#current line
        //line :string
        //indent
        //lineInx, sourceLineNum
        //infoLine, token, index

        //stringInterpolationChar: string

        //last:LexerPos

        //hardError:Error, softError:Error

        //out:OutCode


         this.compiler = compiler;// #Compiler.lite.md module.exports

//use same options as compiler

         this.options = options;

         //default options =
         if(!options) options={};
         // options.interfaceMode: undefined
         // options.browser: undefined
         if(options.comments===undefined) options.comments=1;

//stringInterpolationChar starts for every file the same: "#"
//can be changed in-file with `lexer options` directive

         this.stringInterpolationChar = "#";

         this.hardError = null;// # stores most significative (deepest) error, when parsing fails

//clear out helper

         this.out = new OutCode();// #helper class
         this.out.start(this.options);

//we start with an empty Token

         this.token = new Token();
    };

      //#end constructor


    //method initSource(filename:string, source:String)
    Lexer.prototype.initSource = function(filename, source){
//Load filename and source code in the lexer.
//First, remember filename (for error reporting)

         this.filename = filename;
         //if filename.endsWith('interface.md'), .options.interfaceMode = true
         if (filename.endsWith('interface.md')) {
             this.options.interfaceMode = true};

//create source lines array

         //if source instanceof Array
         if (source instanceof Array) {
           this.lines = source;
         }
         
         else {

//If code is passed as a buffer, convert it to string
//then to lines array

           //if typeof source isnt 'string', source = source.toString()
           if (typeof source !== 'string') {
               source = source.toString()};

           this.lines = source.split('\n');
           this.lines.push("");// # add extra empty line
         };
    };


    //method preParseSource() returns InfoLine array
    Lexer.prototype.preParseSource = function(){
//read from .sourceLines and
//prepares a processed infoLines result array

       var infoLines = [];

//Regexp to match class/method markdown titles, they're considered CODE

       var titleKeyRegexp = /^(#)+ *(?:(?:public|export|default|helper|namespace)\s*)*(class|append to|function|method|constructor|properties)\b/i;

//Loop processing source code lines

       var lastLineWasBlank = true, inCodeBlock = false;

       this.sourceLineNum = 0;
       //do while .nextSourceLine()
       while(this.nextSourceLine()){

//get line indent, by counting whitespace (index of first non-whitespace: \S ),
//then trim() the line

           var line = this.line;
           var indent = line.search(/\S/);
           line = line.trim();

//LiteScript files (.lite.md) are "literate" markdown code files.

//To be considered "code", a block of lines must be indented at least four spaces.
//(see: Github Flavored MarkDown syntax)

//The exception are: MARKDOWN TITLES (###) introducing classes, methods and functions.

//* MarkDown level 3 title plus a space '### ' is considered CODE indented 4 spaces if
  //the line starts with: `[public|export|default|helper|namespace] [class|function|append to]`

//* MarkDown level 4 title plus one space '#### ' is considered CODE indented 5 spaces if:
  //* the line starts with: `[constructor|method|properties`]

//Anything else starting on col 1, 2 or 3 is a literate comment, MD syntax.

//Now, process the lines with this rules

           var type = undefined;

//a blank line is always a blank line

           //if no line
           if (!line) {
               type = LineTypes.BLANK;
           }

//else, if indented 4 spaces or more, can be the start of a code block
           
           else {
               //if indent >= 4
               if (indent >= 4) {
                   //if lastLineWasBlank,inCodeBlock = true
                   if (lastLineWasBlank) {
                       inCodeBlock = true};
               }

//else, (not indented 4) probably a literate comment,
//except for title-keywords
               
               else {
                   inCodeBlock = false;

                   //if indent is 0 # ...starts on column 1
                   if (indent === 0) {// # ...starts on column 1

//check for title-keywords: e.g.: `### Class MyClass`, `### export Function compile(sourceLines:string array)`

                       //if titleKeyRegexp.exec(line) into var foundTitleKey
                       var foundTitleKey=undefined;
                       if ((foundTitleKey=titleKeyRegexp.exec(line))) {

//if found, rewrite the line, replacing MarkDown title MD hashs (###) by spaces
//and making keywords lowercase

                         line = foundTitleKey[0].replace(/#/g, " ").toLowerCase() + line.slice(foundTitleKey[0].length);

//re-check indent, inform now if indent is less than 4

                         indent = line.search(/\S/);
                         //if indent<4, .throwErr "MarkDown Title-keyword, expected at least indent 4 ('\#\#\# ')"
                         if (indent < 4) {
                             this.throwErr("MarkDown Title-keyword, expected at least indent 4 ('\#\#\# ')")};
                         inCodeBlock = true;
                       };
                   };
               };

                    //#end if - special kws

                //#end if - line, check indent

//After applying rules: if we're in a Code Block, is CODE, else is a COMMENT

               //if inCodeBlock
               if (inCodeBlock) {

                   //if line.startsWith("#") or line.startsWith("//") # CODE by indent, but all commented
                   if (line.startsWith("#") || line.startsWith("//")) {// # CODE by indent, but all commented
                     type = LineTypes.COMMENT;
                   }
                   
                   else {
                     type = LineTypes.CODE;
                   };
               }
               
               else {
                   type = LineTypes.COMMENT;
               };
           };
                //#end if

            //#end if line wasnt blank

//parse multi-line string (triple quotes) and convert to one logical line:
//Example: var a = 'first line\nsecond line\nThat\'s all\n'

           //if type is LineTypes.CODE
           if (type === LineTypes.CODE) {
             line = this.parseTripleQuotes(line);
           };

//check for multi-line comment, C and js style //.... 

           //if .checkMultilineComment(infoLines, type, indent, line )
           if (this.checkMultilineComment(infoLines, type, indent, line)) {
               //continue #found and pushed multiline comment, continue with next line
               continue;// #found and pushed multiline comment, continue with next line
           };

//Create infoLine, with computed indent, text, and source code line num reference

           var infoLine = new InfoLine(this, type, indent, line, this.sourceLineNum);
           infoLine.dump();// # debug

           infoLines.push(infoLine);

           lastLineWasBlank = type === LineTypes.BLANK;
       };//end loop

//now we have a infoLine array, tokenized, ready to be parsed
//clear source lines from memory

       this.lines = undefined;

       return infoLines;
    };


    //method tokenize
    Lexer.prototype.tokenize = function(){

//*Tokenize CODE lines

//Now, after processing all lines, we tokenize each CODE line

       debug("---- TOKENIZE");

       //for each item in .infoLines
       for( var item__inx=0,item ; item__inx<this.infoLines.length ; item__inx++){item=this.infoLines[item__inx];
       

           item.dump();// # debug

           //if item.type is LineTypes.CODE
           if (item.type === LineTypes.CODE) {
               item.tokenize(this);
           };
           //end if
           
       }; // end for each in this.infoLines

       //end loop code lines

//reset Lexer position, to allow the parser to start reading tokens

       this.lineInx = -1;// #line index
       this.infoLine = null;// #current infoLine
       this.index = -1;// #token index

       this.last = this.getPos();// #last position

//read first token

       this.nextToken();
    };

    //#end Lexer tokenize


//Pre-Processor
//-------------

    //method preprocessor()
    Lexer.prototype.preprocessor = function(){

//Here we search for 'compiler generate', then we take the indented 'body', compile the body,
//run it, and replace 'compiler generate + Body' with the generated lines.

     //for each index,item in .infoLines where item.type is LineTypes.CODE
     for( var index=0,item ; index<this.infoLines.length ; index++){item=this.infoLines[index];
     if(item.type === LineTypes.CODE){

       //if item.text like /^compiler\s+generate\b/
       if (/^compiler\s+generate\b/.test(item.text)) {

//get all the indented lines under 'compiler generate'

           var 
           bodyLines = [], 
           bodyInx = index + 1, 
           bodyIndent = 0
           ;

           //while bodyInx<.infoLines.length and (.infoLines[bodyInx] into var bodyLine).indent>item.indent
           var bodyLine=undefined;
           while(bodyInx < this.infoLines.length && ((bodyLine=this.infoLines[bodyInx])).indent > item.indent){
               bodyLines.push(String.spaces(bodyLine.indent) + bodyLine.text);
               //if bodyIndent is 0, bodyIndent = bodyLine.indent #first indent
               if (bodyIndent === 0) {
                   bodyIndent = bodyLine.indent};
               bodyInx++;
           };//end loop

//add implicit parameter lines:string array to macro code

           bodyLines.unshift(String.spaces(bodyIndent) + 'global declare lines:string array');

//compile the body

           var referenceName = '*compiler generate* at line ' + item.sourceLineNum + ' file ' + this.filename;
            //declare valid .compiler.compileModule
           var moduleNode = this.compiler.compileModule(referenceName, bodyLines, {browser: this.options.browser, target: 'js', verbose: 0});

//run the body

           var lines = [];
            //declare valid moduleNode.getCompiledText
           var generateFn = new Function("lines", moduleNode.getCompiledText()); //create a Fn with compiled lines
           generateFn(lines); // call the Fn, Execute the 'compiler generate' body

//indent 4 spaces the generated lines

           //for each i,line in lines
           for( var i=0,line ; i<lines.length ; i++){line=lines[i];
           
               lines[i] = '    ' + line;
           }; // end for each in lines

//reuse this lexer, call .preParseSource to analyze generated lines.
//preParseSource() set line type, calculates indent, handle multiline comments, string interpolation, etc.

           this.initSource(referenceName, lines);
           var newInfoLines = this.preParseSource();// #generate 'infolines' from source

//replace 'compiler generate+Body' with generated lines in .infoLines

            //#pass parameters to Array.splice
           newInfoLines.unshift(bodyInx - index);// #how many to delete
           newInfoLines.unshift(index);// #where to start
           Array.prototype.splice.apply(this.infoLines, newInfoLines);// #remove old and insert new
       };
     }}; // end for each in this.infoLines

//now continue processing were we left, so the the newly generated lines
//will be processed, allowing recursion

     //end for code lines
     
    };


    //method process()
    Lexer.prototype.process = function(){

//Analyze generated lines. preParseSource() set line type, calculates indent,
//handles multiline string, comments, string interpolation, etc.

     this.infoLines = this.preParseSource();

//Pre-processor: search for 'compiler generate', execute body and replace lines (recursive)

     this.preprocessor();

//Tokenize final lines

     this.tokenize();
    };


//Next Source Line
//----------------

    //method nextSourceLine()
    Lexer.prototype.nextSourceLine = function(){

//returns false is there are no more lines

       //if .sourceLineNum >= .lines.length
       if (this.sourceLineNum >= this.lines.length) {
         return false;
       };

//get source line, replace TAB with 4 spaces, remove trailing withespace and remove CR

       this.line = this.lines[this.sourceLineNum].replace(/\t/g, '    ').replace(/\s+$/, '').replace(/\r/, '');
       this.sourceLineNum++;// # note: source files line numbers are 1-based

       return true;
    };


//----------------------------
//Multiline strings
//-----------------

    //method parseTripleQuotes(line:string)
    Lexer.prototype.parseTripleQuotes = function(line){

//This method handles `"""` triple quotes multiline strings
//Mulitple coded-enclosed source lines are converted to one logical infoLine

//Example:

// var c = """
//   first line
//   second line
//   That's all
//   """.length

//gets converted to:
//<pre>
//  var c = 'first line\nsecond line\nThat\'s all\n'.length
//  ^^^^^^^   ^^^^^^^                               ^^^^^
//    pre    |- section                          --| post
//</pre>

//Get section between """ and """

       var result = new MultilineSection(this, line, '"""', '"""');
       //if result.section
       if (result.section) {

            //#discard first and last lines, if empty
         //if not (result.section[0].trim())
         if (!((result.section[0].trim()))) {
           result.section.shift();
         };

         //if not (result.section[result.section.length-1].trim())
         if (!((result.section[result.section.length - 1].trim()))) {
           result.section.pop();
         };

            //#trim all lines
         //for each inx,sectionLine in result.section
         for( var inx=0,sectionLine ; inx<result.section.length ; inx++){sectionLine=result.section[inx];
         
           result.section[inx] = sectionLine.trim();
         }; // end for each in result.section

         line = result.section.join("\\n");// #join with (encoded) newline char
         line = line.replace(/'/g, "\\'");// #escape quotes
         line = result.pre + " " + line.quoted("'") + result.post;// #add pre & post
       };

       return line;
    };

      //#end parse triple quotes

//----------------------------
    //method checkMultilineComment(infoLines:InfoLine array, lineType, startLineIndent, line)
    Lexer.prototype.checkMultilineComment = function(infoLines, lineType, startLineIndent, line){

//This method handles multiline comments: ` `//` `

       var startSourceLine = this.sourceLineNum;

       var result = new MultilineSection(this, line, '/*', '*/');
       //if no result.section
       if (!result.section) {
         return false;
       };

       //if result.section.length is 1 # just one line
       if (result.section.length === 1) {// # just one line
         line = result.pre + ' ' + result.post + "//" + result.section[0];
         infoLines.push(new InfoLine(this, lineType, startLineIndent, line, startSourceLine));
       }
       
       else {
         //if result.pre
         if (result.pre) {
             infoLines.push(new InfoLine(this, lineType, startLineIndent, result.pre, startSourceLine));
         };

         //for each inx,sectionLine in result.section
         for( var inx=0,sectionLine ; inx<result.section.length ; inx++){sectionLine=result.section[inx];
         
             infoLines.push(new InfoLine(this, LineTypes.COMMENT, 0, sectionLine, startSourceLine + inx));
         }; // end for each in result.section

         //if result.post.trim()
         if (result.post.trim()) {
             log.warning("" + this.filename + ":" + this.sourceLineNum + ":1. Do not add text on the same line after `*/`. Indent is not clear");
             infoLines.push(new InfoLine(this, LineTypes.CODE, result.postIndent, result.post, this.sourceLineNum));
         };
       };

       return true;// #OK, lines processed
    };



//----------------------------
//Methods getPos() and setPos() are used to save and restore a specific lexer position in code
//When a AST node parse() fails, the lexer position is rewound to try another AST class

    //method getPos()
    Lexer.prototype.getPos = function(){
        //#return {lineInx:.lineInx, index:.index, sourceLineNum:.sourceLineNum, token:.token, last:.last}
       return new LexerPos(this);
    };

//----------------------------

    //method setPos(pos:LexerPos)
    Lexer.prototype.setPos = function(pos){

       this.lineInx = pos.lineInx;

       //if .lineInx>=0 and .lineInx<.infoLines.length
       if (this.lineInx >= 0 && this.lineInx < this.infoLines.length) {
           this.infoLine = this.infoLines[this.lineInx];
           this.indent = this.infoLine.indent;
       }
       
       else {
           this.infoLine = null;
           this.indent = 0;
       };

       this.index = pos.index;
       this.sourceLineNum = pos.sourceLineNum;
       this.token = pos.token;
       this.last = pos.last;
    };


    //helper method posToString()
    Lexer.prototype.posToString = function(){
//Create a full string with last position. Useful to inform errors

       //if .last, return .last.toString()
       if (this.last) {
           return this.last.toString()};
       return this.getPos().toString();
    };



//        if no .last.token
//            .last.token = {column:0}

//        var col = (.last.token.column or .infoLine.indent or 0 )

//        return "#{.filename}:#{.last.sourceLineNum}:#{col+1}"
//        

//----------------------------
//getPrevIndent() method returns the indent of the previous code line
//is used in 'Parser.lite' when processing an indented block of code,
//to validate the line indents and give meaningful compiler error messages

    //method getPrevIndent()
    Lexer.prototype.getPrevIndent = function(){
       var inx = this.lineInx - 1;
       //while inx >=0
       while(inx >= 0){
           //if .infoLines[inx].type is LineTypes.CODE
           if (this.infoLines[inx].type === LineTypes.CODE) {
               return this.infoLines[inx].indent;
           };
           inx -= 1;
       };//end loop

       return 0;
    };

//----------------------------------------------------
//This functions allows the parser to navigate lines and tokens
//of the lexer. It returns the next token, advancing the position variables.
//This method returns CODE tokens, "NEWLINE" tokens (on each new line) or the "EOF" token.
//All other tokens (COMMENT and WHITESPACE) are discarded.


    //method consumeToken()
    Lexer.prototype.consumeToken = function(){

//loop until a CODE token is found

       //while true
       while(true){

//loop until a valid CODE infoLine is selected

           this.token = null;
           //while true
           while(true){

//if no line selected

               //if not .infoLine
               if (!(this.infoLine)) {

                   this.index = -1;

//get next CODE line

                   //if not .nextCODELine()
                   if (!(this.nextCODELine())) {

//if no more CODE lines -> EOF

                       this.infoLine = new InfoLine(this, LineTypes.CODE, -1, '', this.lineInx);
                       this.token = new Token('EOF');
                       this.infoLine.tokens = [this.token];
                       this.indent = -1;
                       return;
                   };

//since we moved to the next line, return "NEWLINE" token

                   this.sourceLineNum = this.infoLine.sourceLineNum;
                   this.indent = this.infoLine.indent;
                   this.token = new Token('NEWLINE');
                   return;
               };

//get next token in the line

               //if no .infoLine.tokens
               if (!this.infoLine.tokens) {
                 //debugger
                 debugger;
               };


               this.index += 1;
               //if .index < .infoLine.tokens.length
               if (this.index < this.infoLine.tokens.length) {
                   //break #ok, a line with tokens
                   break;// #ok, a line with tokens
               };

//if there was no more tokens, set infoLine to null,
//and continue (get the next line)

               this.infoLine = null;
           };//end loop

            //#end while

//Here we have a infoLine, where type is CODE
//Get the token

           this.token = this.infoLine.tokens[this.index];

//if the token is a COMMENT, discard it,
//by continuing the loop (get the next token)

           //if .token.type is 'COMMENT'
           if (this.token.type === 'COMMENT') {
               //continue #discard COMMENT
               continue;// #discard COMMENT
           }

//if it is not a COMMENT, break the loop
//returning the CODE Token in lexer.token
           
           else {
               //break #the loop, CODE token is in lexer.token
               break;// #the loop, CODE token is in lexer.token
           };
       };//end loop
       
    };

        //#loop #try to get another

      //#end method consumeToken

//---------------------------------------------------------

    //method nextToken()
    Lexer.prototype.nextToken = function(){

//Save current pos, and get next token

       this.last = this.getPos();

       this.consumeToken();

        //#debug
       debug(">>>ADVANCE", "" + this.sourceLineNum + ":" + (this.token.column || 0) + " [" + this.index + "]", this.token.toString());

       return true;
    };


//-----------------------------------------------------

    //method returnToken()
    Lexer.prototype.returnToken = function(){
        //#restore last saved pos (rewind)

       this.setPos(this.last);
       debug('<< Returned:', this.token.toString(), 'line', this.sourceLineNum);
    };

//-----------------------------------------------------
//This method gets the next line CODE from infoLines
//BLANK and COMMENT lines are skipped.
//return true if a CODE Line is found, false otherwise

    //method nextCODELine()
    Lexer.prototype.nextCODELine = function(){

       //if .lineInx >= .infoLines.length
       if (this.lineInx >= this.infoLines.length) {
           return false;// # no more lines
       };

//loop until a CODE line is found

       //while true
       while(true){

           this.lineInx += 1;
           //if .lineInx >= .infoLines.length
           if (this.lineInx >= this.infoLines.length) {
               return false;// # no more lines
           };
//Get line

           this.infoLine = this.infoLines[this.lineInx];

//if it is a CODE line, store in lexer.sourceLineNum, and return true (ok)

           //if .infoLine.type is LineTypes.CODE
           if (this.infoLine.type === LineTypes.CODE) {

               this.sourceLineNum = this.infoLine.sourceLineNum;
               this.indent = this.infoLine.indent;
               this.index = -1;

               return true;// #ok nextCODEline found
           };
       };//end loop
       
    };

        //#end while

      //#end method


    //method say()
    Lexer.prototype.say = function(){
//**say** emit error (but continue compiling)

       log.error.apply(this, arguments);
    };


    //method throwErr(msg)
    Lexer.prototype.throwErr = function(msg){
//**throwErr** add lexer position and emit error (abort compilation)

       var err = new Error("" + (this.posToString()) + " " + msg);
       err.controled = true;
       //throw err
       throw err;
    };

    //method sayErr(msg)
    Lexer.prototype.sayErr = function(msg){
//**sayErr** add lexer position and emit error (but continue compiling)

       log.error(this.posToString(), msg);
    };


    //method warn(msg)
    Lexer.prototype.warn = function(msg){
//**warn** add lexer position and emit warning (continue compiling)

       log.warning(this.posToString(), msg);
    };
   //end class Lexer


//----------------------

//Token Recognition Regex Patterns
//--------------------------------

//Single line comments starts with `#` or `//`, to the end of the line.
//Comments can also be multiline, starting with starting with ` `//` and ending with `

   var tokenPatterns = [['COMMENT', /^#(.*)$|^\/\/(.*)$/], ['NUMBER', /^0x[a-f0-9]+/i], ['NUMBER', /^[0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?/i], ['REGEX', /^(\/(?![\s=])[^[\/\n\\]*(?:(?:\\[\s\S]|\[[^\]\n\\]*(?:\\[\s\S][^\]\n\\]*)*])[^[\/\n\\]*)*\/)([imgy]{0,4})(?!\w)/], ['STRING', /^'(?:[^'\\]|\\.)*'/], ['STRING', /^"(?:[^"\\]|\\.)*"/], ['SPACE_DOT', /^\s+\./], ['WHITESPACE', /^[\f\r\t\v\u00A0\u2028\u2029 ]+/], ['ASSIGN', /^=/], ['ASSIGN', /^[\+\-\*\/]=/], ['LITERAL', /^(\+\+|--)/], ['LITERAL', /^[\(\)\[\]\;\,\.\{\}]/], ['OPER', /^(is|isnt|not|and|but|into|like|or|in|into|instance|instanceof|has|hasnt)\b/], ['OPER', /^(\*|\/|\%|\+|-|<>|>=|<=|>>|<<|>|<|!==|\&|\~|\^|\|)/], ['OPER', /^[\?\:]/], ['IDENTIFIER', /^[$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*/]];


//The Token Class
//===============

//* a `value` (parsed text)
//* and the column in the source line in which the token appears

   //class Token
   //constructor
       function Token(type, tokenText, column){
        //properties
          //type:string
          //value:string
          //column


           this.type = type;
           this.value = tokenText || ' ';// # no text is represened by ' ', since '' is 'falsey'
           this.column = column;
       };

       //method toString()
       Token.prototype.toString = function(){
           return "'" + this.value + "'(" + this.type + ")";
       };
   //end class Token


//InfoLine Class
//==============

//The lexer turns each input line into a **infoLine**
//A **infoLine** is a clean, tipified, indent computed, trimmed line
//it has a source line number reference, and a tokens[] array if it's a CODE line

//Each "infoLine" has:
//* a line "type" of: `BLANK`, `COMMENT` or `CODE` (LineTypes),
//* a tokens[] array if it's `CODE`
//* sourceLineNum: the original source line number (for SourceMap)
//* indent: the line indent
//* text: the line text (clean, trimmed)

   //class InfoLine
   //constructor
     function InfoLine(lexer, type, indent, text, sourceLineNum){
      //properties
          //type
          //indent,sourceLineNum
          //text:String
          //tokens: Token array

       this.type = type;
       this.indent = indent;
       this.text = text;
       this.sourceLineNum = sourceLineNum;
     };

        //#.dump() #debug info

      //#end InfoLine constructor


     //method dump() # out debug info
     InfoLine.prototype.dump = function(){// # out debug info

       //if .type is LineTypes.BLANK
       if (this.type === LineTypes.BLANK) {
         debug(this.sourceLineNum, "(BLANK)");
         return;
       };

       var type = "";
       //if .type is LineTypes.COMMENT
       if (this.type === LineTypes.COMMENT) {
         type = "COMMENT";
       }
       
       else if (this.type === LineTypes.CODE) {
         type = "CODE";
       };

       debug(this.sourceLineNum, "" + this.indent + "(" + type + ")", this.text);
       //if .tokens
       if (this.tokens) {
           debug('   ', this.tokens.join(' '));
           debug();
       };
     };


//The Tokenize method
//-------------------

//The Infoline.tokenize() method, creates the 'tokens' array by parsing the .text
//It also replaces *Embdeded Expressions* #{} in string constants, storing the expression tokens

     //method tokenize(lexer)
     InfoLine.prototype.tokenize = function(lexer){

       var code = this.text;

       //try
       try{

           var words = [];
           var result = [];
           var colInx = 0;

            //#debug
           var msg = "";

           //while colInx < code.length
           while(colInx < code.length){

             var chunk = code.slice(colInx);

//This for loop will try each regular expression in `tokenPatterns`
//against the current head of the code line until one matches.

             var match = '';
             var tokenType = '';
             //for each typeRegExpPair in tokenPatterns
             for( var typeRegExpPair__inx=0,typeRegExpPair ; typeRegExpPair__inx<tokenPatterns.length ; typeRegExpPair__inx++){typeRegExpPair=tokenPatterns[typeRegExpPair__inx];
             
               var regex = typeRegExpPair[1];
               var matches = regex.exec(chunk);
               //if matches and matches[0]
               if (matches && matches[0]) {
                   match = matches[0];
                   tokenType = typeRegExpPair[0];
                   //break
                   break;
               };
             }; // end for each in tokenPatterns

              //#end for checking patterns

//If there was no match, this is a bad token and we will abort compilation here.

             //if no match
             if (!match) {

               msg = "(" + lexer.filename + ":" + this.sourceLineNum + ":" + (colInx + 1) + ") Tokenize patterns: invalid token: " + chunk;
               log.error(msg);
               log.error(code);

               var errPosString = '';
               //while errPosString.length<colInx
               while(errPosString.length < colInx){
                   errPosString += ' ';
               };//end loop

               log.error(errPosString + '^');

               var err = new Error(msg);
               err.controled = true;
               //raise err
               throw err;
             };

              //#end if

//If its 'WHITESPACE' we ignore it.

             //if tokenType is 'WHITESPACE'
             if (tokenType === 'WHITESPACE') {
                 //do nothing #ignore it
                 null;// #ignore it
             }
             
             else {

//create token

                 var token = new Token(tokenType, match, this.indent + colInx + 1);

                 words.push(match);

//If its a string constant, and it has `#{`|`${`, process the **Interpolated Expressions**.

                 //if tokenType is 'STRING' and match.length>3 and "#{lexer.stringInterpolationChar}{" in match
                 if (tokenType === 'STRING' && match.length > 3 && match.indexOf("" + lexer.stringInterpolationChar + "{")>=0) {

                    //declare parsed:Array

                    //#parse the string, splitting at #{...}, return array
                   var parsed = String.splitExpressions(match, lexer.stringInterpolationChar);

                    //#if the first expression starts with "(", we add `"" + ` so the parentheses
                    //# can't be mis-parsed as a "function call"
                   //if parsed.length and parsed[0].startsWith("(")
                   if (parsed.length && parsed[0].startsWith("(")) {
                     parsed.unshift('""');
                   };

                    //#join expressions using +, so we have a valid composed expression, evaluating to a string.
                   var composed = new InfoLine(lexer, LineTypes.CODE, token.column, parsed.join(' + '), this.sourceLineNum);

                    //#Now we 'tokenize' the new composed expression
                   composed.tokenize(lexer);

                    //#And we append the new tokens instead of the original string constant
                   result = result.concat(composed.tokens);
                 }
                 
                 else {

//Else it's a single token. Add the token to result array

                    //#debug
                   msg += token.toString();

                   result.push(token);
                 };
             };

                  //#end if

              //#end if WITHESPACE

//Advance col index into code line

             colInx += match.length;
           };//end loop

            //#end while text in the line

            //#debug
            //#debug msg

//Store tokenize result in tokens

           this.tokens = result;

//Special lexer options: string interpolation char
//`lexer options string interpolation char [is] (IDENTIFIER|LITERAL|STRING)`

           //if words[0] is 'lexer'
           if (words[0] === 'lexer') {
             //if words.slice(1,5).join(" ") is "options string interpolation char"
             if (words.slice(1, 5).join(" ") === "options string interpolation char") {
               this.type = LineTypes.COMMENT;// # is a COMMENT line
               var char = undefined;
               //if words[5] into char is 'is' then char = words[6] #get it (skip optional 'is')
               if ((char=words[5]) === 'is') {
                   char = words[6]};
               //if char[0] in ['"',"'"], char = char.slice(1,-1) #optionally quoted, remove quotes
               if (['"', "'"].indexOf(char[0])>=0) {
                   char = char.slice(1, -1)};
               //if no char then lexer.throwErr "missing string interpolation char"  #check
               if (!char) {
                   lexer.throwErr("missing string interpolation char")};
               lexer.stringInterpolationChar = char;
             };
           };
       
       }catch(e){
           log.error("" + lexer.filename + ":" + this.sourceLineNum + ":" + (colInx + 1), e.message);
           log.error(msg);
           //throw e
           throw e;
       };
     };
   //end class InfoLine


//--------------------------

   //helper class LexerPos
   //constructor
     function LexerPos(lexer){
      //properties
        //lexer, lineInx,sourceLineNum
        //index,token,last

       this.lexer = lexer;
       this.lineInx = lexer.lineInx;
       this.index = lexer.index;
       this.sourceLineNum = lexer.sourceLineNum;
       this.token = lexer.token;
       this.last = lexer.last;
     };

     //method toString()
     LexerPos.prototype.toString = function(){
       //if no .token, .token = {column:0}
       if (!this.token) {
           this.token = {column: 0}};
       return "" + this.lexer.filename + ":" + this.sourceLineNum + ":" + ((this.token.column || 0) + 1);
     };
   //end class LexerPos


//----------------------------------------------------------------------------------------------

   //helper class MultilineSection
   //constructor
     function MultilineSection(lexer, line, startCode, endCode){
      //properties

        //pre:string, section:string array, post:string
        //postIndent


//check if startCode is in the line, if not found, exit

       var startCol = line.indexOf(startCode);
       //if startCol<0
       if (startCol < 0) {
            //#no start code found
           return;
       };

//get rid of quoted strings. Still there?

       //if String.replaceQuoted(line,"").indexOf(startCode)<0
       if (String.replaceQuoted(line, "").indexOf(startCode) < 0) {
           return;// #no
       };

//ok, found startCode, initialize

       debug("**** START MULTILINE ", startCode);

       this.section = [];
       var startSourceLine = lexer.sourceLineNum;

//Get and save text previous to startCode

       this.pre = line.slice(0, startCol).trim();

//Get text after startCode

       line = line.slice(startCol + startCode.length).trim();

//read lines until endCode is found

       var endCol = undefined;
       //do until line.indexOf(endCode) into endCol >= 0 #found end of section
       while(!((endCol=line.indexOf(endCode)) >= 0)){

            //# still inside the section
           this.section.push(line);

            //#get next line
           //if no lexer.nextSourceLine()
           if (!lexer.nextSourceLine()) {
               lexer.sayErr("EOF while processing multiline " + startCode + " (started on " + lexer.filename + ":" + startSourceLine + ":" + startCol + ")");
               return;
           };

           line = lexer.line;
       };//end loop

//get text after endCode (is multilineSection.post)

       this.post = line.slice(endCol + endCode.length);

//text before endCode, goes into multiline section

       line = line.slice(0, endCol);
       //if line
       if (line) {
         this.section.push(line);
       };

       this.postIndent = endCol + endCode.length;
     };
   
   //end class MultilineSection


//------------------------
//----------------------------------------------------------------------------------------------

   //public helper class OutCode
   //constructor
   function OutCode(){
     //     properties

      //lineNum, column
      //currLine:string
      //lines:string array
      //addSourceAsComment = true
      //lastOriginalCodeComment
      //lastOutCommentLine
      //sourceMap
      //browser:boolean
      //exportNamespace
    this.addSourceAsComment=true;
   };

    //method start(options)
    OutCode.prototype.start = function(options){
//Initialize output array

        //declare on options
            //nomap # do not generate sourcemap

       this.lineNum = 1;
       this.column = 1;
       this.lines = [];

       this.lastOriginalCodeComment = 0;
       this.lastOutCommentLine = 0;

        //#if do generate sourceMap and in node
       //if not options.nomap and type of window is 'undefined' # in node
       if (!(options.nomap) && typeof window === 'undefined') {// # in node
             //import SourceMap
             var SourceMap = require('./SourceMap');
             this.sourceMap = new SourceMap();
       };
    };

    //method put(text:string)
    OutCode.prototype.put = function(text){
//put a string into produced code

//if no current line
//create a empty one

       //if .currLine is undefined
       if (this.currLine === undefined) {
           this.currLine = "";
           this.column = 1;
       };

//append text to line

       //if text
       if (text) {
           this.currLine += text;
           this.column += text.length;
       };
    };


    //method startNewLine()
    OutCode.prototype.startNewLine = function(){
//Start New Line into produced code

//send the current line

         //if .currLine or .currLine is ""
         if (this.currLine || this.currLine === "") {
             this.lines.push(this.currLine);
             debug(this.lineNum, this.currLine);
         };

//clear current line

         this.currLine = undefined;
         this.lineNum++;
         this.column = 1;
    };

    //method ensureNewLine()
    OutCode.prototype.ensureNewLine = function(){
//if there's something on the line, start a new one

         //if .currLine, .startNewLine
         if (this.currLine) {
             this.startNewLine()};
    };


    //method blankLine()
    OutCode.prototype.blankLine = function(){

         this.startNewLine();
         this.currLine = "";
         this.startNewLine();
    };


    //method getResult()
    OutCode.prototype.getResult = function(){
//get result and clear memory

       this.startNewLine();// #close last line
       var result = this.lines;
       this.lines = [];
       return result;
    };

    //helper method addSourceMap(sourceLin, sourceCol)
    OutCode.prototype.addSourceMap = function(sourceLin, sourceCol){

       //if .sourceMap
       if (this.sourceMap) {
           this.sourceMap.add((sourceLin || 1) - 1, (sourceCol || 1) - 1, this.lineNum - 1, this.column - 1);
       };
    };
   //export
   module.exports.OutCode = OutCode;
   //end class OutCode


//------------------------
//Exports
//=======


    //#make LineTypes const available as .lexer.LineTypes
   Lexer.prototype.LineTypes = LineTypes;

   module.exports = Lexer;

//Compiled by LiteScript compiler v0.5.0, source: /home/ltato/LiteScript/devel/source-v0.6.0/Lexer.lite.md
//# sourceMappingURL=Lexer.js.map
