//The Parser Module
//=================

//The main class in this module is the Lexer.

//The Lexer translates code (an array of lines) into an array of tokenized lines to be parsed.

//The Lexer class acts as 
//* Lexer/Tokenizer
//* Token Stream (input)

//All the parts of the lexer work with "arrays" of lines.
//(instead of a buffer or a large string)

//The first lexer pass analyzes entire lines. 
//Each line of the array is classified with a 'Line Type': CODE, COMMENT or BLANK

//then each CODE line is *Tokenized*, getting a `tokens[]` array

//-------------------------
//### dependencies

    //import 
        //ControlledError, GeneralOptions
        //logger, Strings
    var ControlledError = require('./lib/ControlledError.js');
    var GeneralOptions = require('./lib/GeneralOptions.js');
    var logger = require('./lib/logger.js');
    var Strings = require('./lib/Strings.js');


    //global import fs
    var fs = require('fs');

    //shim import Map, PMREX, mkPath
    var Map = require('./lib/Map.js');
    var PMREX = require('./lib/PMREX.js');
    var mkPath = require('./lib/mkPath.js');

//module vars

    //var preprocessor_replaces: map string to string
    var preprocessor_replaces = undefined;

//The Lexer Class
//===============

//### public Class Lexer
    // constructor
    function Lexer(project, options){

//The Lexer class turns the input lines into an array of "infoLines"

//#### properties 

        //project
        //filename:string
        //options: GeneralOptions

        //lines:string array
        //infoLines: InfoLine array

        //#current line
        //line :string 
        //indent 
        //lineInx, sourceLineNum
        //infoLine, token, index

        //interfaceMode: boolean
        //stringInterpolationChar: string

        //last:LexerPos
        //maxSourceLineNum=0 //max source line num in indented block

        //hardError:Error, softError:Error

        //outCode: OutCode
         this.maxSourceLineNum=0;

//#### Constructor new Lexer(project, options:GeneralOptions)

          ////.compiler = compiler #Compiler.lite.md module.exports
          //.project = project #Compiler.lite.md class Project
          this.project = project;// #Compiler.lite.md class Project

//use same options as compiler

          //.options = options
          this.options = options;

          //default options.browser = undefined
          // options.browser: undefined
          //default options.comments = 1 #comment level
          if(options.comments===undefined) options.comments=1;

          //preprocessor_replaces = map
              //DATE: .options.now.toDateString()
              //TIME: .options.now.toTimeString()
              //TIMESTAMP: .options.now.toISOString()
          preprocessor_replaces = new Map().fromObject({
        DATE: this.options.now.toDateString(), 
        TIME: this.options.now.toTimeString(), 
        TIMESTAMP: this.options.now.toISOString()
});

//stringInterpolationChar starts for every file the same: "#"
//can be changed in-file with `lexer options` directive

          //.stringInterpolationChar = "#" 
          this.stringInterpolationChar = "#";

          //.hardError = null # stores most significative (deepest) error, when parsing fails
          this.hardError = null;// # stores most significative (deepest) error, when parsing fails

//clear out helper

          //.outCode = new OutCode() #helper class
          this.outCode = new OutCode();// #helper class
          //.outCode.start .options
          this.outCode.start(this.options);

//we start with an empty Token
          
          //.token = new Token()
          this.token = new Token();
     };
          
      //#end constructor

//#### Method reset()
     Lexer.prototype.reset = function(){

        //.sourceLineNum = 0
        this.sourceLineNum = 0;
        //.lineInx=0
        this.lineInx = 0;
        //.lines=""
        this.lines = "";
        //.setPos .last
        this.setPos(this.last);
     };


//#### Method initSource(filename:string, source:String)
     Lexer.prototype.initSource = function(filename, source){
//Load filename and source code in the lexer.
//First, remember filename (for error reporting) 

          //.filename = filename
          this.filename = filename;
          //.interfaceMode = filename.indexOf('.interface.') isnt -1
          this.interfaceMode = filename.indexOf('.interface.') !== -1;

//create source lines array

          //if source instanceof Array
          if (source instanceof Array) {
            //.lines = source
            this.lines = source;
          }
          else {

          //else

//If code is passed as a buffer, convert it to string
//then to lines array 

            //if typeof source isnt 'string', source = source.toString()
            if (typeof source !== 'string') {source = source.toString()};
            
            //.lines = source.split('\n')
            this.lines = source.split('\n');
            //.lines.push "" # add extra empty line
            this.lines.push("");// # add extra empty line
          };
     };


//#### Method preParseSource() returns InfoLine array
     Lexer.prototype.preParseSource = function(){
//read from .sourceLines and 
//prepares a processed infoLines result array

        //var infoLines = []
        var infoLines = [];

//Loop processing source code lines 

        //var lastLineWasBlank=true, inCodeBlock=false
        var lastLineWasBlank = true, inCodeBlock = false;

        //.sourceLineNum = 0
        this.sourceLineNum = 0;
        //do while .nextSourceLine()
        while(this.nextSourceLine()){

//get line indent, by counting whitespace (index of first non-whitespace: \S ),
//then trim() the line

            //var line = .line
            var line = this.line;
            //var indent = line.countSpaces()
            var indent = line.countSpaces();
            //line = line.trim()
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

            //var type
            var type = undefined;

//a blank line is always a blank line

            //if no line 
            if (!line) {
                //type = LineTypes.BLANK
                type = LineTypes.BLANK;
            }
            else {

//else, if indented 4 spaces or more, can be the start of a code block

            //else 
                //if indent >= 4
                if (indent >= 4) {
                    //if lastLineWasBlank,inCodeBlock = true
                    if (lastLineWasBlank) {inCodeBlock = true};
                }
                else {

//else, (not indented 4) probably a literate comment,
//except for title-keywords 

                //else
                    //inCodeBlock = false
                    inCodeBlock = false;

                    //if indent is 0 and line.charAt(0) is '#' //starts on column 1, with a '#'
                    if (indent === 0 && line.charAt(0) === '#') { //starts on column 1, with a '#'

//checkTitleCode: if found a vlid title-code, rewrite the line, 
//replacing MarkDown title MD hashs (###) by spaces and making keywords lowercase

                        //if .checkTitleCode(line) into var converted 
                        var converted=undefined;
                        if ((converted=this.checkTitleCode(line))) {

                            //line = converted 
                            line = converted;
                            //indent = line.countSpaces() //re-calc indent
                            indent = line.countSpaces(); //re-calc indent
                            //inCodeBlock = indent>=4
                            inCodeBlock = indent >= 4;
                        };
                    };

                    //end if startted with #
                    
                };

                //end if - line, check indent
                

//After applying rules: if we're in a Code Block, is CODE, else is a COMMENT

                //if inCodeBlock
                if (inCodeBlock) {

                    //if line.startsWith("#") or line.startsWith("//") # CODE by indent, but all commented
                    if (line.startsWith("#") || line.startsWith("//")) {// # CODE by indent, but all commented
                      //type = LineTypes.COMMENT
                      type = LineTypes.COMMENT;
                    }
                    else {
                    //else
                      //type = LineTypes.CODE
                      type = LineTypes.CODE;
                    };
                }
                else {
                
                //else
                    //type = LineTypes.COMMENT
                    type = LineTypes.COMMENT;
                };
            };
                //#end if

            //#end if line wasnt blank

//parse multi-line string (triple quotes) and convert to one logical line: 
//Example result: var a = 'first line\nsecond line\nThird line\n'

            //#saver reference to source line (for multiline)
            //var sourceLineNum = .sourceLineNum
            var sourceLineNum = this.sourceLineNum;

            //if type is LineTypes.CODE 
            if (type === LineTypes.CODE) {
                //line = .preprocessor(.parseTripleQuotes( line ))
                line = this.preprocessor(this.parseTripleQuotes(line));
            };

//check for multi-line comment, C and js style /* .... */ 
//then check for "#ifdef/#else/#endif"

            //if .checkMultilineComment(infoLines, type, indent, line )
            if (this.checkMultilineComment(infoLines, type, indent, line)) {
                //continue #found and pushed multiline comment, continue with next line
                continue;// #found and pushed multiline comment, continue with next line
            }
            else if (this.checkConditionalCompilation(line)) {

            //else if .checkConditionalCompilation(line)
                //continue #processed, continue with next line
                continue;// #processed, continue with next line
            };

//Create infoLine, with computed indent, text, and source code line num reference 

            //var infoLine = new InfoLine(this, type, indent, line, sourceLineNum )
            var infoLine = new InfoLine(this, type, indent, line, sourceLineNum);
            //infoLine.dump() # debug
            infoLine.dump();// # debug

            //infoLines.push infoLine 
            infoLines.push(infoLine);

            //lastLineWasBlank = type is LineTypes.BLANK
            lastLineWasBlank = type === LineTypes.BLANK;
        };// end loop
            
        //loop #process next source line

//now we have a infoLine array, tokenized, ready to be parsed
//if we do not need to produce comments with original source
//for reference at produced .c or .js, clear source lines from memory 

        //if no .options.comments
        if (!this.options.comments) {
            //.lines = undefined
            this.lines = undefined;
        };

        //return infoLines
        return infoLines;
     };
  

//#### method checkTitleCode(line:string) returns string // or undefined
     Lexer.prototype.checkTitleCode = function(line){ // or undefined

//check for title-keywords: e.g.: `### Class MyClass`, `### export Function compile(sourceLines:string array)`

        ////var titleKeyRegexp = /^(#)+ *(?:(?:public|export|default|helper)\s*)*(class|namespace|append to|function|method|constructor|properties)\b/i

        //var words = line.split(" ")
        var words = line.split(" ");

        //if words[0].length<3, return // should be at least indent 4: '### '
        if (words[0].length < 3) {return};

        //// return if first word is not all #'s
        //if words[0].replaceAll("#"," ").trim(), return 
        if (words[0].replaceAll("#", " ").trim()) {return};

        //var sustantives = ["class","namespace","function","method","constructor","properties"];
        var sustantives = ["class", "namespace", "function", "method", "constructor", "properties"];

        //var inx=1, countAdj=0, countSust=0, sustLeft=1
        var 
        inx = 1, 
        countAdj = 0, 
        countSust = 0, 
        sustLeft = 1
;

        //while inx<words.length
        while(inx < words.length){

            //if words[inx] //skip empty items
            if (words[inx]) { //skip empty items

                //if words[inx].toLowerCase() in ["public","export","default","helper"]
                if (["public", "export", "default", "helper"].indexOf(words[inx].toLowerCase())>=0) {
                    //countAdj++ //valid
                    countAdj++; //valid
                }
                else {
                //else
                  //break //invalid word
                  break; //invalid word
                };
            };
            
            //inx++ //next
            inx++; //next
        };// end loop

        //if no countAdj and inx<words.length-1
        if (!countAdj && inx < words.length - 1) {
            //if words[inx].toLowerCase() is 'append'
            if (words[inx].toLowerCase() === 'append') {
                //inx++ //skip 'append'
                inx++; //skip 'append'
                //if words[inx] is 'to', inx++ //skip to
                if (words[inx] === 'to') {inx++};
            };
        };

        //while inx<words.length
        while(inx < words.length){

            //if words[inx] into var w:string //skip empty items
            var w=undefined;
            if ((w=words[inx])) { //skip empty items
            
                //if w.indexOf('(') into var posParen <> -1
                var posParen=undefined;
                if ((posParen=w.indexOf('(')) !== -1) {
                    ////split at "(". remove composed and insert splitted at "("
                    //words.splice inx,1, w.slice(0,posParen), w.slice(posParen)
                    words.splice(inx, 1, w.slice(0, posParen), w.slice(posParen));
                    //w = words[inx]
                    w = words[inx];
                };

                //if w.toLowerCase() in sustantives
                if (sustantives.indexOf(w.toLowerCase())>=0) {
                    //countSust++ //valid
                    countSust++; //valid
                    //break //exit, sustantive found
                    break; //exit, sustantive found
                }
                else {
                //else
                  //break //invalid word
                  break; //invalid word
                };
            };
            
            //inx++ //next
            inx++; //next
        };// end loop

        //if countAdj>1 and no countSust, .throwErr "MarkDown Title-keyword, expected a sustantive: #{sustantives.join()}"
        if (countAdj > 1 && !countSust) {this.throwErr("MarkDown Title-keyword, expected a sustantive: " + (sustantives.join()))};

        //if countSust
        if (countSust) {

            //if words[0].length<3, .throwErr "MarkDown Title-keyword, expected at least indent 4: '### '"
            if (words[0].length < 3) {this.throwErr("MarkDown Title-keyword, expected at least indent 4: '### '")};

            //for recogn=1 to inx //each recognized word, convert to lowercase
            var _end2=inx;
            for( var recogn=1; recogn<=_end2; recogn++) {
                //words[recogn]=words[recogn].toLowerCase()
                words[recogn] = words[recogn].toLowerCase();
            };// end for recogn

            //words[0] = words[0].replaceAll("#"," ") //replace # by ' '
            words[0] = words[0].replaceAll("#", " "); //replace # by ' '

            //return words.join(' ') // re-join
            return words.join(' '); // re-join
        };
     };



//#### method tokenize
     Lexer.prototype.tokenize = function(){

//*Tokenize CODE lines

//Now, after processing all lines, we tokenize each CODE line

        //logger.debug "---- TOKENIZE"
        logger.debug("---- TOKENIZE");

        //for each item in .infoLines
        for( var item__inx=0,item ; item__inx<this.infoLines.length ; item__inx++){item=this.infoLines[item__inx];
        

            //try
            try{
            
                //item.dump() # debug
                item.dump();// # debug

                //if item.type is LineTypes.CODE
                if (item.type === LineTypes.CODE) {
                    //item.tokenizeLine(this)
                    item.tokenizeLine(this);
                };
                //end if
                
            
            }catch(err){

            //catch err
                ////adds position info
                //throw new ControlledError("#{.filename}:#{item.sourceLineNum}:1 #{err.message}")
                throw new ControlledError('' + this.filename + ":" + item.sourceLineNum + ":1 " + err.message);
            };
        };// end for each in this.infoLines

        //end loop code lines
        

//reset Lexer position, to allow the parser to start reading tokens

        //.lineInx = -1 #line index
        this.lineInx = -1;// #line index
        //.infoLine = null #current infoLine
        this.infoLine = null;// #current infoLine
        //.index = -1 #token index
        this.index = -1;// #token index

        //.last = .getPos() #last position
        this.last = this.getPos();// #last position

//read first token

        //.nextToken() 
        this.nextToken();
     };

    //#end Lexer tokenize


//Pre-Processor
//-------------

//#### method preprocessor(line:string)
     Lexer.prototype.preprocessor = function(line){

//This is a ver crude preprocessor.
//Here we search for simple macros as __DATE__, __TIME__ , __TMESTAMP__

        //for each macro,value in map preprocessor_replaces
        var value=undefined;
        if(!preprocessor_replaces.dict) throw(new Error("for each in map: not a Map, no .dict property"));
        for ( var macro in preprocessor_replaces.dict) if (preprocessor_replaces.dict.hasOwnProperty(macro)){value=preprocessor_replaces.dict[macro];
            {
            //line=line.replaceAll("__#{macro}__",value)
            line = line.replaceAll("__" + macro + "__", value);
            }
            
            }// end for each property

        //return line
        return line;
     };



//#### method process()
     Lexer.prototype.process = function(){

//Analyze generated lines. preParseSource() set line type, calculates indent, 
//handles multiline string, comments, string interpolation, etc.

      //.infoLines = .preParseSource()
      this.infoLines = this.preParseSource();

//Tokenize final lines

      //.tokenize
      this.tokenize();
     };

//Next Source Line
//----------------

//#### method nextSourceLine()
     Lexer.prototype.nextSourceLine = function(){

//returns false is there are no more lines

        //if .sourceLineNum >= .lines.length
        if (this.sourceLineNum >= this.lines.length) {
            //return false
            return false;
        };

//get source line, replace TAB with 4 spaces, remove trailing withespace and remove CR

        //.line = .lines[.sourceLineNum].replaceAll("\t",'    ').trimRight().replaceAll("\r","")
        this.line = this.lines[this.sourceLineNum].replaceAll("\t", '    ').trimRight().replaceAll("\r", "");
        //.sourceLineNum++ # note: source files line numbers are 1-based
        this.sourceLineNum++;// # note: source files line numbers are 1-based

        //return true
        return true;
     };

//#### method replaceSourceLine(newLine)
     Lexer.prototype.replaceSourceLine = function(newLine){
        //.lines[.sourceLineNum-1] = newLine
        this.lines[this.sourceLineNum - 1] = newLine;
     };


//----------------------------
//Multiline strings
//-----------------

//#### method parseTripleQuotes(line:string)
     Lexer.prototype.parseTripleQuotes = function(line){

//This method handles `"""` triple quotes multiline strings
//Mulitple coded-enclosed source lines are converted to one logical infoLine

//Example:
///*
 //var c = """
   //first line
   //second line
   //That's all
   //""".length

//gets converted to:
//<pre>
  //var c = 'first line\nsecond line\nThat\'s all\n'.length
  //^^^^^^^   ^^^^^^^                               ^^^^^
    //pre    |- section                          --| post
//</pre>
//*/

//Get section between """ and """

        //var result = new MultilineSection(this,line, '"""', '"""')
        var result = new MultilineSection(this, line, '"""', '"""');
        //if result.section
        if (result.section) {

          //#discard first and last lines, if empty
          //if no result.section[0].trim()
          if (!result.section[0].trim()) {
            //result.section.shift()
            result.section.shift();
          };

          //if no result.section[result.section.length-1].trim()
          if (!result.section[result.section.length - 1].trim()) {
            //result.section.pop()
            result.section.pop();
          };

          //#search min indent
          //var indent = 999
          var indent = 999;
          //for each sectionLine1 in result.section
          for( var sectionLine1__inx=0,sectionLine1 ; sectionLine1__inx<result.section.length ; sectionLine1__inx++){sectionLine1=result.section[sectionLine1__inx];
          
            //var lineIndent=sectionLine1.countSpaces()
            var lineIndent = sectionLine1.countSpaces();
            //if lineIndent>=0 and lineIndent<indent
            if (lineIndent >= 0 && lineIndent < indent) {
                //indent = lineIndent
                indent = lineIndent;
            };
          };// end for each in result.section

          //#trim indent on the left and extra right spaces
          //for each inx,sectionLine in result.section
          for( var inx=0,sectionLine ; inx<result.section.length ; inx++){sectionLine=result.section[inx];
          
            //result.section[inx] = sectionLine.slice(indent).trimRight()
            result.section[inx] = sectionLine.slice(indent).trimRight();
          };// end for each in result.section

          //#join with (encoded) newline char and enclose in quotes (for splitExpressions)
          //line = result.section.join("\\n").quoted('"') 
          line = result.section.join("\\n").quoted('"');

//Now we should escape internal d-quotes, but only *outside* string interpolation expressions

          //var parsed = .splitExpressions(line,.stringInterpolationChar)
          var parsed = this.splitExpressions(line, this.stringInterpolationChar);
          //for each inx,item:string in parsed
          for( var inx=0,item ; inx<parsed.length ; inx++){item=parsed[inx];
          
              //if item.charAt(0) is '"' //a string part
              if (item.charAt(0) === '"') { //a string part
                  //item = item.slice(1,-1) //remove quotes
                  item = item.slice(1, -1); //remove quotes
                  //parsed[inx] = item.replaceAll('"','\\"') #store with *escaped* internal d-quotes
                  parsed[inx] = item.replaceAll('"', '\\"');// #store with *escaped* internal d-quotes
              }
              else {
              //else
                  //#restore string interp. codes
                  //parsed[inx] = "#{.stringInterpolationChar}{#{item}}"
                  parsed[inx] = '' + this.stringInterpolationChar + "{" + item + "}";
              };
          };// end for each in parsed

          //#re-join & re.enclose in quotes
          //line = parsed.join("").quoted('"') 
          line = parsed.join("").quoted('"');
          //line = "#{result.pre} #{line}#{result.post}" #add pre & post
          line = '' + result.pre + " " + line + result.post;// #add pre & post
        };

        //return line
        return line;
     };

      //#end parse triple quotes

//----------------------------
//#### method checkMultilineComment(infoLines:InfoLine array, lineType, startLineIndent, line)
     Lexer.prototype.checkMultilineComment = function(infoLines, lineType, startLineIndent, line){

//This method handles multiline comments: `/*` `*/` 

        //var startSourceLine = .sourceLineNum
        var startSourceLine = this.sourceLineNum;

        //var result = new MultilineSection(this, line, '/*', '*/')
        var result = new MultilineSection(this, line, '/*', '*/');
        //if no result.section
        if (!result.section) {
          //return false
          return false;
        };

        //if result.section.length is 1 # just one line
        if (result.section.length === 1) {// # just one line
          //line = "#{result.pre} #{result.post}//#{result.section[0]}"
          line = '' + result.pre + " " + result.post + "//" + (result.section[0]);
          //infoLines.push(new InfoLine(this, lineType, startLineIndent, line, startSourceLine))  
          infoLines.push(new InfoLine(this, lineType, startLineIndent, line, startSourceLine));
        }
        else {

        //else 
          //if result.pre
          if (result.pre) {
              //infoLines.push(new InfoLine(this, lineType, startLineIndent, result.pre, startSourceLine))  
              infoLines.push(new InfoLine(this, lineType, startLineIndent, result.pre, startSourceLine));
          };

          //for each inx,sectionLine in result.section
          for( var inx=0,sectionLine ; inx<result.section.length ; inx++){sectionLine=result.section[inx];
          
              //infoLines.push(new InfoLine(this, LineTypes.COMMENT, 0, sectionLine, startSourceLine+inx))  
              infoLines.push(new InfoLine(this, LineTypes.COMMENT, 0, sectionLine, startSourceLine + inx));
          };// end for each in result.section

          //if result.post.trim() 
          if (result.post.trim()) {
              //logger.warning "#{.filename}:#{.sourceLineNum}:1. Do not add text on the same line after `*/`. Indent is not clear"
              logger.warning('' + this.filename + ":" + this.sourceLineNum + ":1. Do not add text on the same line after `*/`. Indent is not clear");
              //infoLines.push(new InfoLine(this, LineTypes.CODE, result.postIndent, result.post, .sourceLineNum))  
              infoLines.push(new InfoLine(this, LineTypes.CODE, result.postIndent, result.post, this.sourceLineNum));
          };
        };

        //return true #OK, lines processed
        return true;// #OK, lines processed
     };

//----------------------------
//#### method checkConditionalCompilation(line:string)
     Lexer.prototype.checkConditionalCompilation = function(line){

//This method handles "#ifdef/#else/#endif" as multiline comments

        //var startSourceLine = .sourceLineNum
        var startSourceLine = this.sourceLineNum;

        //var words: string array
        var words = undefined;

        //var isDefine = line.indexOf("#define ")
        var isDefine = line.indexOf("#define ");
        //if isDefine>=0
        if (isDefine >= 0) {
            //words = line.trim().split(' ')
            words = line.trim().split(' ');
            //.project.setCompilerVar words[1],true
            this.project.setCompilerVar(words[1], true);
            //return false
            return false;
        };

        //var isUndef = line.indexOf("#undef ")
        var isUndef = line.indexOf("#undef ");
        //if isUndef>=0
        if (isUndef >= 0) {
            //words = line.trim().split(' ')
            words = line.trim().split(' ');
            //.project.setCompilerVar words[1],false
            this.project.setCompilerVar(words[1], false);
            //return false
            return false;
        };

//ifdef, #ifndef, #else and #endif should be the first thing on the line

        //if line.indexOf("#endif") is 0, .throwErr 'found "#endif" without "#ifdef"'
        if (line.indexOf("#endif") === 0) {this.throwErr('found "#endif" without "#ifdef"')};
        //if line.indexOf("#else") is 0, .throwErr 'found "#else" without "#ifdef"'
        if (line.indexOf("#else") === 0) {this.throwErr('found "#else" without "#ifdef"')};

        //var invert = false
        var invert = false;
        //var pos = line.indexOf("#ifdef ")
        var pos = line.indexOf("#ifdef ");
        //if pos isnt 0 
        if (pos !== 0) {
            //pos = line.indexOf("#ifndef ")
            pos = line.indexOf("#ifndef ");
            //invert = true
            invert = true;
        };

        //if pos isnt 0, return 
        if (pos !== 0) {return};

        //var startRef = "while processing #ifdef started on line #{startSourceLine}"
        var startRef = "while processing #ifdef started on line " + startSourceLine;

        //words = line.slice(pos).split(' ')
        words = line.slice(pos).split(' ');
        //var conditional = words.tryGet(1)
        var conditional = words.tryGet(1);
        //if no conditional, .throwErr "#ifdef; missing conditional"
        if (!conditional) {this.throwErr("#ifdef; missing conditional")};
        //var defValue = .project.compilerVar(conditional)
        var defValue = this.project.compilerVar(conditional);
        //if invert, defValue = not defValue //if it was "#ifndef"
        if (invert) {defValue = !(defValue)};

        //.replaceSourceLine .line.replaceAll("#if","//if")
        this.replaceSourceLine(this.line.replaceAll("#if", "//if"));

        //var endFound=false
        var endFound = false;
        //do
        do{
            //#get next line
            //if no .nextSourceLine(),.throwErr "EOF #{startRef}"
            if (!this.nextSourceLine()) {this.throwErr("EOF " + startRef)};
            //line = .line
            line = this.line;
            
            //if line.countSpaces() into var indent >= 0
            var indent=undefined;
            if ((indent=line.countSpaces()) >= 0) {
                //line = line.trim()
                line = line.trim();
                //if line.charAt(0) is '#' and line.charAt(1) isnt '#' //expected: "#else, #endif #end if"
                if (line.charAt(0) === '#' && line.charAt(1) !== '#') { //expected: "#else, #endif #end if"
                    //words = line.split(' ')
                    words = line.split(' ');
                    //case words.tryGet(0)
                    
                        //when '#else'
                    if ((words.tryGet(0)=='#else')){
                            //.replaceSourceLine .line.replaceAll("#else","//else")
                            this.replaceSourceLine(this.line.replaceAll("#else", "//else"));
                            //defValue = not defValue
                            defValue = !(defValue);
                    
                    }
                        //when "#end"
                    else if ((words.tryGet(0)=="#end")){
                            //if words.tryGet(1) isnt 'if', .throwErr "expected '#end if', read '#{line}' #{startRef}"
                            if (words.tryGet(1) !== 'if') {this.throwErr("expected '#end if', read '" + line + "' " + startRef)};
                            //endFound = true
                            endFound = true;
                    
                    }
                        //when "#endif"
                    else if ((words.tryGet(0)=="#endif")){
                            //endFound = true
                            endFound = true;
                    
                    }
                    else {
                        //else
                            //.throwErr "expected '#else/#end if', read '#{line}' #{startRef}"
                            this.throwErr("expected '#else/#end if', read '" + line + "' " + startRef);
                    };
                    //end case
                    
                }
                else {
                //else
                    //// comment line if .compilerVar not defined (or processing #else)
                    ////and this is not a blank line
                    //if not defValue and line, .replaceSourceLine "#{String.spaces(indent)}//#{line}"
                    if (!(defValue) && line) {this.replaceSourceLine('' + (String.spaces(indent)) + "//" + line)};
                };
                //end if
                
            };
            //end if              
            
        } while (!endFound);// end loop
        //loop until endFound

        //.replaceSourceLine .line.replaceAll("#end","//end")
        this.replaceSourceLine(this.line.replaceAll("#end", "//end"));

        //#rewind position after #ifdef, reprocess lines
        //.sourceLineNum = startSourceLine -1 
        this.sourceLineNum = startSourceLine - 1;
        //return true #OK, lines processed
        return true;// #OK, lines processed
     };


//----------------------------
//Methods getPos() and setPos() are used to save and restore a specific lexer position in code
//When a AST node parse() fails, the lexer position is rewound to try another AST class

//#### method getPos() returns LexerPos
     Lexer.prototype.getPos = function(){
        //#return {lineInx:.lineInx, index:.index, sourceLineNum:.sourceLineNum, token:.token, last:.last}
        //return new LexerPos(this)
        return new LexerPos(this);
     };

//----------------------------

//#### method setPos(pos:LexerPos)
     Lexer.prototype.setPos = function(pos){

        //.lineInx = pos.lineInx
        this.lineInx = pos.lineInx;

        //if .lineInx>=0 and .lineInx<.infoLines.length
        if (this.lineInx >= 0 && this.lineInx < this.infoLines.length) {
            //.infoLine = .infoLines[.lineInx]
            this.infoLine = this.infoLines[this.lineInx];
            //.indent = .infoLine.indent
            this.indent = this.infoLine.indent;
        }
        else {
        //else
            //.infoLine = null
            this.infoLine = null;
            //.indent = 0
            this.indent = 0;
        };

        //.index = pos.index
        this.index = pos.index;
        //.sourceLineNum = pos.sourceLineNum
        this.sourceLineNum = pos.sourceLineNum;
        //.token = pos.token
        this.token = pos.token;
        //.last = pos.last
        this.last = pos.last;
     };


//#### helper method posToString()
     Lexer.prototype.posToString = function(){
//Create a full string with last position. Useful to inform errors

        //if .last, return .last.toString()
        if (this.last) {return this.last.toString()};
        //return .getPos().toString()
        return this.getPos().toString();
     };


        ///*
        //if no .last.token
            //.last.token = {column:0}

        //var col = (.last.token.column or .infoLine.indent or 0 ) 

        //return "#{.filename}:#{.last.sourceLineNum}:#{col+1}"
        //*/

//----------------------------
//getPrevIndent() method returns the indent of the previous code line
//is used in 'Parser.lite' when processing an indented block of code, 
//to validate the line indents and give meaningful compiler error messages

//#### method getPrevIndent()
     Lexer.prototype.getPrevIndent = function(){
        //var inx = .lineInx-1
        var inx = this.lineInx - 1;
        //while inx >=0
        while(inx >= 0){
            //if .infoLines[inx].type is LineTypes.CODE
            if (this.infoLines[inx].type === LineTypes.CODE) {
                //return .infoLines[inx].indent
                return this.infoLines[inx].indent;
            };
            //inx -= 1
            inx -= 1;
        };// end loop

        //return 0
        return 0;
     };

//----------------------------------------------------
//This functions allows the parser to navigate lines and tokens
//of the lexer. It returns the next token, advancing the position variables.
//This method returns CODE tokens, "NEWLINE" tokens (on each new line) or the "EOF" token.
//All other tokens (COMMENT and WHITESPACE) are discarded.


//#### method consumeToken()
     Lexer.prototype.consumeToken = function(){

//loop until a CODE token is found

        //while true
        while(true){

//loop until a valid CODE infoLine is selected

            //.token = null
            this.token = null;
            //while true
            while(true){

//if no line selected

                //if not .infoLine
                if (!(this.infoLine)) {

                    //.index = -1
                    this.index = -1;

//get next CODE line

                    //if not .nextCODELine()
                    if (!(this.nextCODELine())) {

//if no more CODE lines -> EOF

                        //.infoLine = new InfoLine(this, LineTypes.CODE, -1, '', .lineInx)
                        this.infoLine = new InfoLine(this, LineTypes.CODE, -1, '', this.lineInx);
                        //.token = new Token('EOF')
                        this.token = new Token('EOF');
                        //.infoLine.tokens = [.token]
                        this.infoLine.tokens = [this.token];
                        //.indent = -1
                        this.indent = -1;
                        //return
                        return;
                    };

//since we moved to the next line, return "NEWLINE" token

                    //.sourceLineNum = .infoLine.sourceLineNum
                    this.sourceLineNum = this.infoLine.sourceLineNum;
                    //.indent = .infoLine.indent
                    this.indent = this.infoLine.indent;
                    //.token = new Token('NEWLINE')
                    this.token = new Token('NEWLINE');
                    //return
                    return;
                };

//get next token in the line

                //if no .infoLine.tokens
                if (!this.infoLine.tokens) {
                  //debugger
                  debugger;
                };


                //.index += 1
                this.index += 1;
                //if .index < .infoLine.tokens.length
                if (this.index < this.infoLine.tokens.length) {
                    //break #ok, a line with tokens
                    break;// #ok, a line with tokens
                };

//if there was no more tokens, set infoLine to null, 
//and continue (get the next line)

                //.infoLine = null
                this.infoLine = null;
            };// end loop

            //#end while

//Here we have a infoLine, where type is CODE
//Get the token

            //.token = .infoLine.tokens[.index]
            this.token = this.infoLine.tokens[this.index];

//if the token is a COMMENT, discard it, 
//by continuing the loop (get the next token)

            //if .token.type is 'COMMENT'
            if (this.token.type === 'COMMENT') {
                //continue #discard COMMENT
                continue;// #discard COMMENT
            }
            else {

//if it is not a COMMENT, break the loop
//returning the CODE Token in lexer.token

            //else
                //break #the loop, CODE token is in lexer.token
                break;// #the loop, CODE token is in lexer.token
            };
        };// end loop
        
     };

        //#loop #try to get another

      //#end method consumeToken

//---------------------------------------------------------

//#### method nextToken()
     Lexer.prototype.nextToken = function(){

//Save current pos, and get next token

        //.last = .getPos()
        this.last = this.getPos();

        //.consumeToken()
        this.consumeToken();

        //#debug
        //logger.debug ">>>ADVANCE", "#{.sourceLineNum}:#{.token.column or 0} [#{.index}]", .token.toString()
        logger.debug(">>>ADVANCE", '' + this.sourceLineNum + ":" + (this.token.column || 0) + " [" + this.index + "]", this.token.toString());
        
        //return true
        return true;
     };


//-----------------------------------------------------

//#### method returnToken()
     Lexer.prototype.returnToken = function(){
        //#restore last saved pos (rewind)

        //.setPos .last
        this.setPos(this.last);
        //logger.debug '<< Returned:',.token.toString(),'line',.sourceLineNum 
        logger.debug('<< Returned:', this.token.toString(), 'line', this.sourceLineNum);
     };

//-----------------------------------------------------
//This method gets the next line CODE from infoLines
//BLANK and COMMENT lines are skipped.
//return true if a CODE Line is found, false otherwise

//#### method nextCODELine()
     Lexer.prototype.nextCODELine = function(){

        //if .lineInx >= .infoLines.length
        if (this.lineInx >= this.infoLines.length) {
            //return false # no more lines
            return false;// # no more lines
        };

//loop until a CODE line is found

        //while true
        while(true){

            //.lineInx += 1
            this.lineInx += 1;
            //if .lineInx >= .infoLines.length
            if (this.lineInx >= this.infoLines.length) {
                //return false # no more lines
                return false;// # no more lines
            };
//Get line

            //.infoLine = .infoLines[.lineInx]
            this.infoLine = this.infoLines[this.lineInx];

//if it is a CODE line, store in lexer.sourceLineNum, and return true (ok)

            //if .infoLine.type is LineTypes.CODE
            if (this.infoLine.type === LineTypes.CODE) {

                //.sourceLineNum = .infoLine.sourceLineNum
                this.sourceLineNum = this.infoLine.sourceLineNum;
                //.indent = .infoLine.indent
                this.indent = this.infoLine.indent;
                //.index = -1
                this.index = -1;

                //return true #ok nextCODEline found
                return true;// #ok nextCODEline found
            };
        };// end loop
        
     };

        //#end while

      //#end method


//#### method say()
     Lexer.prototype.say = function(){
//**say** emit error (but continue compiling)

        //logger.error.apply this,arguments
        logger.error.apply(this, Array.prototype.slice.call(arguments));
     };


//#### method throwErr(msg)
     Lexer.prototype.throwErr = function(msg){
//**throwErr** add lexer position and emit error (abort compilation)

        //logger.throwControlled "#{.posToString()} #{msg}"
        logger.throwControlled('' + (this.posToString()) + " " + msg);
     };

//#### method sayErr(msg)
     Lexer.prototype.sayErr = function(msg){
//**sayErr** add lexer position and emit error (but continue compiling)

        //logger.error .posToString(),msg
        logger.error(this.posToString(), msg);
     };


//#### method warn(msg)
     Lexer.prototype.warn = function(msg){
//**warn** add lexer position and emit warning (continue compiling)

        //logger.warning .posToString(),msg
        logger.warning(this.posToString(), msg);
     };


//#### method splitExpressions(text:string) returns array of string
     Lexer.prototype.splitExpressions = function(text){
//split on #{expresion} using lexer.stringInterpolationChar

        //var delimiter = .stringInterpolationChar
        var delimiter = this.stringInterpolationChar;

//look for #{expression} inside a quoted string
//split expressions

        //if no text then return []
        if (!text) {return []};

        ////get quotes
        //var quotes = text.charAt(0)
        var quotes = text.charAt(0);
        //if quotes isnt '"' and quotes isnt "'"
        if (quotes !== '"' && quotes !== "'") {
            //.throwErr 'splitExpressions: expected text to be a quoted string, quotes included'
            this.throwErr('splitExpressions: expected text to be a quoted string, quotes included');
        };

        //var delimiterPos, closerPos, itemPos, item:string;
        var 
        delimiterPos = undefined, 
        closerPos = undefined, 
        itemPos = undefined, 
        item = undefined
;
        //var items=[];
        var items = [];

        ////clear start and end quotes
        //var s:string = text.slice(1,-1)
        var s = text.slice(1, -1);

        //var lastDelimiterPos=0;
        var lastDelimiterPos = 0;
        
        //do
        while(true){

            //delimiterPos = s.indexOf("#{delimiter}{",lastDelimiterPos);
            delimiterPos = s.indexOf('' + delimiter + "{", lastDelimiterPos);
            //if delimiterPos<0 then break
            if (delimiterPos < 0) {break};

            //// first part - text upto first delimiter
            //pushAt items, s.slice(lastDelimiterPos,delimiterPos),quotes 
            pushAt(items, s.slice(lastDelimiterPos, delimiterPos), quotes);
            
            //var start = delimiterPos + 1
            var start = delimiterPos + 1;

            //closerPos = String.findMatchingPair(s,start,"}")
            closerPos = String.findMatchingPair(s, start, "}");

            //if closerPos<0
            if (closerPos < 0) {
                //.throwErr "unmatched '#{delimiter}{' at string: #{text}"
                this.throwErr("unmatched '" + delimiter + "{' at string: " + text);
            };
           
            //item = s.slice(start+1, closerPos);
            item = s.slice(start + 1, closerPos);

            //// add parens if expression
            //var p = PMREX.whileRanges(item,0,"A-Za-z0-9_$.")
            var p = PMREX.whileRanges(item, 0, "A-Za-z0-9_$.");
            //if p<item.length then item = '(#{item})';
            if (p < item.length) {item = '(' + item + ')'};

            //lastDelimiterPos = closerPos + 1
            lastDelimiterPos = closerPos + 1;

            //pushAt items, item //push expression
            pushAt(items, item); //push expression
        };// end loop

        //loop

        //// remainder
        //pushAt items, s.slice(lastDelimiterPos),quotes
        pushAt(items, s.slice(lastDelimiterPos), quotes);

        //return items
        return items;
     };
    // export
    module.exports.Lexer = Lexer;
    
    // end class Lexer
      
//### end class Lexer

    //// helper internal function
    //helper function pushAt(arr:array, content:string, useQuotes)
    function pushAt(arr, content, useQuotes){
        //if content
        if (content) {
            //if useQuotes, content = content.quoted(useQuotes)
            if (useQuotes) {content = content.quoted(useQuotes)};
            //arr.push content
            arr.push(content);
        };
    };

//----------------------

//The Token Class
//===============

//Each token instance has:
//-a "type" e.g.: NEWLINE,EOF, when the token is a special char
//-a "value": the parsed text
//-the column in the source line in which the token appears

    //class Token
    // constructor
    function Token(type, tokenText, column){
    
        //properties
          //type:string
          //value:string
          //column

        //constructor(type, tokenText, column)

            //.type = type 
            this.type = type;
            //.value = tokenText or ' ' # no text is represened by ' ', since '' is "falsey" in js
            this.value = tokenText || ' ';// # no text is represened by ' ', since '' is "falsey" in js
            //.column = column
            this.column = column;
        };
        
        //method toString()
        Token.prototype.toString = function(){
            //return "'#{.value}'(#{.type})"
            return "'" + this.value + "'(" + this.type + ")";
        };
    // end class Token


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
    // constructor
    function InfoLine(lexer, type, indent, text, sourceLineNum){
    
      //properties
          //type
          //indent,sourceLineNum
          //text:String
          //tokens: Token array

      //constructor new InfoLine(lexer,type,indent,text,sourceLineNum)
        //.type = type
        this.type = type;
        //.indent = indent
        this.indent = indent;
        //.text = text
        this.text = text;
        //.sourceLineNum = sourceLineNum
        this.sourceLineNum = sourceLineNum;
      };

        //#.dump() #debug info

      //#end InfoLine constructor

             
      //method dump() # out debug info
      InfoLine.prototype.dump = function(){// # out debug info

        //if .type is LineTypes.BLANK
        if (this.type === LineTypes.BLANK) {
          //logger.debug .sourceLineNum,"(BLANK)"
          logger.debug(this.sourceLineNum, "(BLANK)");
          //return
          return;
        };

        //var type = ""
        var type = "";
        //if .type is LineTypes.COMMENT
        if (this.type === LineTypes.COMMENT) {
          //type="COMMENT"
          type = "COMMENT";
        }
        else if (this.type === LineTypes.CODE) {
        //else if .type is LineTypes.CODE
          //type="CODE"
          type = "CODE";
        };
        
        //logger.debug .sourceLineNum, "#{.indent}(#{type})", .text
        logger.debug(this.sourceLineNum, '' + this.indent + "(" + type + ")", this.text);
        //if .tokens
        if (this.tokens) {
            //logger.debug('   ',.tokens.join(' '))
            logger.debug('   ', this.tokens.join(' '));
            //logger.debug()
            logger.debug();
        };
      };


//The Tokenize Line method
//------------------------

//The Infoline.tokenizeLine() method, creates the 'tokens' array by parsing the .text 
//It also replaces *Embdeded Expressions* #{} in string constants, storing the expression tokens

      //method tokenizeLine(lexer)
      InfoLine.prototype.tokenizeLine = function(lexer){

        //var code = .text
        var code = this.text;
        
        //var words=[]
        var words = [];
        //var result=[]
        var result = [];
        //var colInx = 0
        var colInx = 0;

        //#debug
        //var msg = ""
        var msg = "";

        //while colInx < code.length
        while(colInx < code.length){

            //var chunk = code.slice(colInx)
            var chunk = code.slice(colInx);

//This for loop will try each regular expression in `tokenPatterns` 
//against the current head of the code line until one matches.

            //var token = .recognizeToken(chunk)
            var token = this.recognizeToken(chunk);

//If there was no match, this is a bad token and we will abort compilation here.

            //if no token
            if (!token) {

                //// calc position from line info (we're at post-lexexr)
                //msg = "(#{lexer.filename}:#{.sourceLineNum}:#{colInx+1}) Tokenize patterns: invalid token: #{chunk}"
                msg = "(" + lexer.filename + ":" + this.sourceLineNum + ":" + (colInx + 1) + ") Tokenize patterns: invalid token: " + chunk;
                //logger.error msg 
                logger.error(msg);

                //var errPosString=''
                var errPosString = '';
                //while errPosString.length<colInx
                while(errPosString.length < colInx){
                    //errPosString='#{errPosString} '
                    errPosString = '' + errPosString + ' ';
                };// end loop

                //logger.error code
                logger.error(code);
                //logger.error '#{errPosString}^'
                logger.error('' + errPosString + '^');

                //logger.throwControlled "parsing tokens"
                logger.throwControlled("parsing tokens");
            };

            //end if
            

//If its 'WHITESPACE' we ignore it. 

            //if token.type is 'WHITESPACE'
            if (token.type === 'WHITESPACE') {
                //do nothing #ignore it
                null;// #ignore it
            }
            else {

            //else

//set token column

                //token.column = .indent + colInx + 1 
                token.column = this.indent + colInx + 1;

//store value in a temp array to parse special lexer options

                //words.push(token.value)
                words.push(token.value);

//If its a string constant, and it has `#{`|`${`, process the **Interpolated Expressions**.

                //if token.type is 'STRING' and token.value.length>3 and lexer.stringInterpolationChar & "{" in token.value
                if (token.type === 'STRING' && token.value.length > 3 && token.value.indexOf(lexer.stringInterpolationChar + "{")>=0) {

                    //declare parsed:Array
                    

                    //#parse the quoted string, splitting at #{...}, return array 
                    //var parsed = lexer.splitExpressions(token.value)
                    var parsed = lexer.splitExpressions(token.value);

//For C generation, replace string interpolation
//with a call to core function "concat"

                ////ifdef PROD_C
                    
                    //// code a litescript call to "_concatAny" to handle string interpolation
                    //// (the producer will add argc)
                    //var composed = new InfoLine(lexer, LineTypes.CODE, token.column, 
                    var composed = new InfoLine(lexer, LineTypes.CODE, token.column, "_concatAny(" + (parsed.join(',')) + ")", this.sourceLineNum);
                        //"_concatAny(#{parsed.join(',')})", .sourceLineNum  )

                ////else //-> JavaScript
                    //////if the first expression isnt a quoted string constant
                    ////// we add `"" + ` so we get string concatenation from javascript.
                    ////// Also: if the first expression starts with `(`, LiteScript can
                    ////// mis-parse the expression as a "function call"
                    ////if parsed.length and parsed[0][0] not in "\"\'" // if it do not start with quotes
                        ////parsed.unshift "''" // prepend ''
                    //////join expressions using +, so we have a valid js composed expression, evaluating to a string.
                    ////var composed = new InfoLine(lexer, LineTypes.CODE, token.column, parsed.join(' + '), .sourceLineNum  )
                ////end if

                    //#Now we 'tokenize' the new composed expression
                    //composed.tokenizeLine(lexer) #recurse
                    composed.tokenizeLine(lexer);// #recurse

                    //#And we append the new tokens instead of the original string constant
                    //result = result.concat( composed.tokens )
                    result = result.concat(composed.tokens);
                }
                else {

                //else

//Else it's a single token. Add the token to result array

                    ////ifndef NDEBUG
                    //msg = "#{msg}#{token.toString()}"
                    msg = '' + msg + (token.toString());
                    ////endif

                    //result.push(token)
                    result.push(token);
                };

                //end if
                
            };

            //end if WITHESPACE
            

//Advance col index into code line

            //colInx += token.value.length
            colInx += token.value.length;
        };// end loop

        //end while text in the line
        

        //#debug
        //#debug msg

//Store tokenize result in .tokens

        //.tokens = result
        this.tokens = result;

//Special lexer options: string interpolation char
//`lexer options string interpolation char [is] (IDENTIFIER|PUCT|STRING)`
//`lexer options literal (map|object)`

        //if words.tryGet(0) is 'lexer' and words.tryGet(1) is 'options'
        if (words.tryGet(0) === 'lexer' && words.tryGet(1) === 'options') {
            //.type = LineTypes.COMMENT # is a COMMENT line
            this.type = LineTypes.COMMENT;// # is a COMMENT line

            //if words.slice(2,5).join(" ") is "string interpolation char" 
            if (words.slice(2, 5).join(" ") === "string interpolation char") {
                //var ch:string
                var ch = undefined;
                //if words.tryGet(5) into ch is 'is' then ch = words.tryGet(6) #get it (skip optional 'is')
                if ((ch=words.tryGet(5)) === 'is') {ch = words.tryGet(6)};
                //if ch.charAt(0) in ['"',"'"], ch = ch.slice(1,-1) #optionally quoted, remove quotes
                if (['"', "'"].indexOf(ch.charAt(0))>=0) {ch = ch.slice(1, -1)};
                //if no ch then fail with "missing string interpolation char"  #check
                if (!ch) {throw new Error("missing string interpolation char")};
                //lexer.stringInterpolationChar = ch
                lexer.stringInterpolationChar = ch;
            }
            else if (words.slice(2, 5).join(" ") === "object literal is") {
            
            //else if words.slice(2,5).join(" ") is "object literal is" 
                //if no words.tryGet(5) into lexer.options.literalMap
                if (!((lexer.options.literalMap=words.tryGet(5)))) {
                    //fail with "missing class to be used instead of object literals"  #check
                    throw new Error("missing class to be used instead of object literals");// #check
                };
            }
            else {

            //else
                //fail with "Lexer options, expected: 'literal map'|'literal object'"
                throw new Error("Lexer options, expected: 'literal map'|'literal object'");
            };
        };
      };
            
      //end tokenizeLine
      

//The recognize method
//--------------------

//The Infoline.recognize() method matches the current position in the text stream
//with the known tokens, returning a new Token or undefined

      //method recognizeToken(chunk:string) returns Token // or undefined
      InfoLine.prototype.recognizeToken = function(chunk){ // or undefined

//Comment lines, start with # or //

            //if chunk.startsWith('#') or chunk.startsWith('//')
            if (chunk.startsWith('#') || chunk.startsWith('//')) {
                //return new Token('COMMENT',chunk)
                return new Token('COMMENT', chunk);
            };

//Punctuation: 
//We include also here punctuation symbols (like `,` `[` `:`)  and the arrow `->`
//Postfix and prefix ++ and -- are considered also 'PUNCT'.
//They're not considered 'operators' since they do no introduce a new operand, ++ and -- are "modifiers" for a variable reference.

  //['PUNCT',/^(\+\+|--|->)/],
  //['PUNCT',/^[\(\)\[\]\;\,\.\{\}]/],

            //if chunk.charAt(0) in "()[]{};,." 
            if ("()[]{};,.".indexOf(chunk.charAt(0))>=0) {
                //return new Token('PUNCT',chunk.slice(0,1))
                return new Token('PUNCT', chunk.slice(0, 1));
            };
            //if chunk.slice(0,2) in ["++","--","->"]
            if (["++", "--", "->"].indexOf(chunk.slice(0, 2))>=0) {
                //return new Token('PUNCT',chunk.slice(0,2))
                return new Token('PUNCT', chunk.slice(0, 2));
            };

//Whitespace is discarded by the lexer, but needs to exist to break up other tokens.
//We recognize ' .' (space+dot) to be able to recognize: 'myFunc .x' as alias to: 'myFunc this.x'
//We recognize ' [' (space+bracket) to be able to diferntiate: 'myFunc [x]' and 'myFunc[x]'

  //['SPACE_DOT',/^\s+\./],
  //['SPACE_BRACKET',/^\s+\[/],
  //['WHITESPACE',/^[\f\r\t\v\u00A0\u2028\u2029 ]+/],

            //if chunk.startsWith(" .")
            if (chunk.startsWith(" .")) {
                //return new Token('SPACE_DOT',chunk.slice(0,2))
                return new Token('SPACE_DOT', chunk.slice(0, 2));
            };
            //if chunk.startsWith(" [")
            if (chunk.startsWith(" [")) {
                //return new Token('SPACE_BRACKET',chunk.slice(0,2))
                return new Token('SPACE_BRACKET', chunk.slice(0, 2));
            };
            //if PMREX.whileRanges(chunk,0," \t\r") into var whiteSpaceLength
            var whiteSpaceLength=undefined;
            if ((whiteSpaceLength=PMREX.whileRanges(chunk, 0, " \t\r"))) {
                //if chunk.charAt(whiteSpaceLength) in '.[', whiteSpaceLength-- //allow recognition of SPACE_DOT and SPACE_BRACKET
                if ('.['.indexOf(chunk.charAt(whiteSpaceLength))>=0) {whiteSpaceLength--};
                //return new Token('WHITESPACE',chunk.slice(0,whiteSpaceLength))
                return new Token('WHITESPACE', chunk.slice(0, whiteSpaceLength));
            };

//Strings can be either single or double quoted.

  //['STRING', /^'(?:[^'\\]|\\.)*'/],
  //['STRING', /^"(?:[^"\\]|\\.)*"/],

            //if chunk.startsWith("'") or chunk.startsWith('"') 
            if (chunk.startsWith("'") || chunk.startsWith('"')) {
                //if PMREX.findMatchingQuote(chunk,0) into var quotedCount is -1, fail with "unclosed quoted string"
                var quotedCount=undefined;
                if ((quotedCount=PMREX.findMatchingQuote(chunk, 0)) === -1) {throw new Error("unclosed quoted string")};
                //return new Token('STRING',chunk.slice(0,quotedCount))
                return new Token('STRING', chunk.slice(0, quotedCount));
            };

//ASSIGN are symbols triggering the assignment statements.
//In LiteScript, assignment is a *statement* not a *expression*

  //['ASSIGN',/^=/],
  //['ASSIGN',/^[\+\-\*\/\&]=/ ], # = += -= *= /= &=

            //if chunk.startsWith("=")
            if (chunk.startsWith("=")) {
                //return new Token('ASSIGN',chunk.slice(0,1))
                return new Token('ASSIGN', chunk.slice(0, 1));
            };
            //if chunk.charAt(0) in "+-*/&" and chunk.charAt(1) is "=" 
            if ("+-*/&".indexOf(chunk.charAt(0))>=0 && chunk.charAt(1) === "=") {
                //return new Token('ASSIGN',chunk.slice(0,2))
                return new Token('ASSIGN', chunk.slice(0, 2));
            };

//Regex tokens are regular expressions. The javascript producer, just passes the raw regex to JavaScript.

  //['REGEX', /^(\/(?![\s=])[^[\/\n\\]*(?:(?:\\[\s\S]|\[[^\]\n\\]*(?:\\[\s\S][^\]\n\\]*)*])[^[\/\n\\]*)*\/)([imgy]{0,4})(?!\w)/],

            //if chunk.startsWith('/') 
            if (chunk.startsWith('/')) {
                //if PMREX.whileUnescaped(chunk,1,"/") into var endRegexp is -1, fail with "unclosed literal RegExp expression"
                var endRegexp=undefined;
                if ((endRegexp=PMREX.whileUnescaped(chunk, 1, "/")) === -1) {throw new Error("unclosed literal RegExp expression")};
                //return new Token('REGEX',chunk.slice(0,endRegexp))
                return new Token('REGEX', chunk.slice(0, endRegexp));
            };

//A "Unary Operator" is a symbol that precedes and transform *one* operand.
//A "Binary Operator" is a  symbol or a word (like `>=` or `+` or `and`), 
//that sits between *two* operands in a `Expressions`. 

  //['OPER', /^(\*|\/|\%|\+|-|<>|>=|<=|>>|<<|>|<|!==|\~|\^|\bitor)/],
  //['OPER', /^[\?\:]/], //ternary if
  ////identifier-like operators are handled in the identifier section below
  //['OPER', /^(is|isnt|not|and|but|into|like|or|in|into|instance|instanceof|has|hasnt|bitand|bitor)\b/],

            //if chunk.slice(0,3) is '!=='
            if (chunk.slice(0, 3) === '!==') {
                //return new Token('OPER',chunk.slice(0,3))
                return new Token('OPER', chunk.slice(0, 3));
            };

            //if "|#{chunk.slice(0,2)}|" in "|<>|>=|<=|>>|<<|!=|"
            if ("|<>|>=|<=|>>|<<|!=|".indexOf("|" + (chunk.slice(0, 2)) + "|")>=0) {
                //return new Token('OPER',chunk.slice(0,2))
                return new Token('OPER', chunk.slice(0, 2));
            };

            //if chunk.charAt(0) in "><+-*/%&~^|?:" 
            if ("><+-*/%&~^|?:".indexOf(chunk.charAt(0))>=0) {
                //return new Token('OPER',chunk.slice(0,1))
                return new Token('OPER', chunk.slice(0, 1));
            };

//**Numbers** can be either in hex format (like `0xa5b`) or decimal/scientific format (`10`, `3.14159`, or `10.02e23`).
//As in js, all numbers are floating point.

  //['NUMBER',/^0x[a-f0-9]+/i ],
  //['NUMBER',/^[0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?/i],

            //if chunk.startsWith('0x')
            if (chunk.startsWith('0x')) {
                //return new Token('NUMBER',chunk.slice(0, PMREX.whileRanges(chunk,2,"a-fA-F0-9")))
                return new Token('NUMBER', chunk.slice(0, PMREX.whileRanges(chunk, 2, "a-fA-F0-9")));
            };
    
            //if PMREX.whileRanges(chunk,0,"0-9") into var numberDigits
            var numberDigits=undefined;
            if ((numberDigits=PMREX.whileRanges(chunk, 0, "0-9"))) {
                //if chunk.charAt(numberDigits) is '.', numberDigits = PMREX.whileRanges(chunk,numberDigits+1,"0-9")
                if (chunk.charAt(numberDigits) === '.') {numberDigits = PMREX.whileRanges(chunk, numberDigits + 1, "0-9")};
                //if chunk.charAt(numberDigits) is 'e', numberDigits = PMREX.whileRanges(chunk,numberDigits+1,"0-9")
                if (chunk.charAt(numberDigits) === 'e') {numberDigits = PMREX.whileRanges(chunk, numberDigits + 1, "0-9")};
                //return new Token('NUMBER',chunk.slice(0, numberDigits))
                return new Token('NUMBER', chunk.slice(0, numberDigits));
            };

//Identifiers (generally variable names), must start with a letter, `$`, or underscore.
//Subsequent characters can also be numbers. Unicode characters are supported in variable names.

//Identifier-like OPERs, as: 'and', 'not', 'is','or' are checked before concluding is an IDENTIFIER

  //['IDENTIFIER',/^[$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*/] ]
  //['OPER', /^(is|isnt|not|and|but|into|like|or|in|into|instance|instanceof|has|hasnt|bitand|bitor)\b/],

//a IDENTIFIER starts with A-Z a-z (a unicode codepoint), $ or _

            //if PMREX.whileRanges(chunk,0,"A-Za-z\x7F-\xFF$_") into var wordLetters
            var wordLetters=undefined;
            if ((wordLetters=PMREX.whileRanges(chunk, 0, "A-Za-z\x7F-\xFF$_"))) {
                //wordLetters = PMREX.whileRanges(chunk,wordLetters,"0-9A-Za-z_\x7F-\xFF") //Subsequent characters can also be numbers
                wordLetters = PMREX.whileRanges(chunk, wordLetters, "0-9A-Za-z_\x7F-\xFF"); //Subsequent characters can also be numbers

                //if "|#{chunk.slice(0,wordLetters)}|" in "|is|isnt|not|and|but|into|like|or|in|into|instance|instanceof|has|hasnt|bitand|bitor|"
                if ("|is|isnt|not|and|but|into|like|or|in|into|instance|instanceof|has|hasnt|bitand|bitor|".indexOf("|" + (chunk.slice(0, wordLetters)) + "|")>=0) {
                    //return new Token('OPER',chunk.slice(0,wordLetters))
                    return new Token('OPER', chunk.slice(0, wordLetters));
                };

                //return new Token('IDENTIFIER',chunk.slice(0,wordLetters))
                return new Token('IDENTIFIER', chunk.slice(0, wordLetters));
            };
      };
    // end class InfoLine



//--------------------------

//### helper class LexerPos
    // constructor
    function LexerPos(lexer){

      //properties
        //lexer, lineInx,sourceLineNum
        //index,token,last

      //constructor new LexerPos(lexer)
        //.lexer = lexer
        this.lexer = lexer;
        //.lineInx = lexer.lineInx
        this.lineInx = lexer.lineInx;
        //.index = lexer.index
        this.index = lexer.index;
        //.sourceLineNum = lexer.sourceLineNum
        this.sourceLineNum = lexer.sourceLineNum;
        //.token = lexer.token
        this.token = lexer.token;
        //.last = lexer.last
        this.last = lexer.last;
      };

      //method toString()
      LexerPos.prototype.toString = function(){
        //if no .token, .token = new Token(type='',tokenText='',column=0)
        if (!this.token) {this.token = new Token('', '', 0)};
        //return "#{.lexer.filename}:#{.sourceLineNum}:#{(.token.column or 0)+1}"
        return '' + this.lexer.filename + ":" + this.sourceLineNum + ":" + ((this.token.column || 0) + 1);
      };
    // end class LexerPos


//----------------------------------------------------------------------------------------------

//### helper Class MultilineSection
    // constructor
    function MultilineSection(lexer, line, startCode, endCode){
//This is a helper class the to get a section of text between start and end codes

      //properties

        //pre:string, section:string array, post:string
        //postIndent

      //constructor (lexer, line:string, startCode:string, endCode:string)

//check if startCode is in the line, if not found, exit 

        //var startCol = line.indexOf(startCode)
        var startCol = line.indexOf(startCode);
        //if startCol<0 
        if (startCol < 0) {
            //#no start code found
            //return 
            return;
        };

        //// get rid of quoted strings. Still there?
        //if String.replaceQuoted(line,"").indexOf(startCode)<0
        if (String.replaceQuoted(line, "").indexOf(startCode) < 0) {
            //return #no 
            return;// #no
        };

//ok, found startCode, initialize

        //logger.debug "**** START MULTILINE ",startCode
        logger.debug("**** START MULTILINE ", startCode);

        //this.section = []
        this.section = [];
        //var startSourceLine = lexer.sourceLineNum
        var startSourceLine = lexer.sourceLineNum;

//Get and save text previous to startCode

        //this.pre = line.slice(0, startCol).trim()
        this.pre = line.slice(0, startCol).trim();

//Get text after startCode

        //line = line.slice(startCol+startCode.length).trim()
        line = line.slice(startCol + startCode.length).trim();

//read lines until endCode is found

        //var endCol
        var endCol = undefined;
        //do until line.indexOf(endCode) into endCol >= 0 #found end of section
        while(!((endCol=line.indexOf(endCode)) >= 0)){

            //# still inside the section
            //this.section.push line
            this.section.push(line);

            //#get next line
            //if no lexer.nextSourceLine()
            if (!lexer.nextSourceLine()) {
                //lexer.sayErr "EOF while processing multiline #{startCode} (started on #{lexer.filename}:#{startSourceLine}:#{startCol})"
                lexer.sayErr("EOF while processing multiline " + startCode + " (started on " + lexer.filename + ":" + startSourceLine + ":" + startCol + ")");
                //return
                return;
            };

            //line = lexer.line
            line = lexer.line;
        };// end loop

        //loop #until end of section

//get text after endCode (is multilineSection.post)

        //this.post = line.slice(endCol+endCode.length)
        this.post = line.slice(endCol + endCode.length);

//text before endCode, goes into multiline section

        //line = line.slice(0, endCol)
        line = line.slice(0, endCol);
        //if line 
        if (line) {
          //this.section.push line
          this.section.push(line);
        };

        //this.postIndent = endCol+endCode.length
        this.postIndent = endCol + endCode.length;
      };
    
    // end class MultilineSection

//------------------------

//Exported Module vars
//------------------------

//### Public namespace LineTypes 
    var LineTypes={};
        //properties 
            //CODE = 0
            //COMMENT = 1
            //BLANK = 2
            LineTypes.CODE=0;
            LineTypes.COMMENT=1;
            LineTypes.BLANK=2;
        
    
    // export
    module.exports.LineTypes = LineTypes;

//### Public Helper Class OutCode
    // constructor
    function OutCode(){ // default constructor
//This class contains helper methods for AST nodes's `produce()` methods
//It also handles SourceMap generation for Chrome Developer Tools debugger and Firefox Firebug

//#### Properties

      //lineNum, column
      //currLine: DynBuffer

      //header:number = 0 //out to different files, 0:.c/.js 1:.h 2:.extra
      //fileMode:boolean // if output directly to file
      //filenames=['','',''] //filename for each group
      //fileIsOpen=[false,false,false] //filename for each group
      //fHandles=[null,null,null] //file handle for each group


      //lines:array  // array of array of string lines[header][0..n]

      //lastOriginalCodeComment
      //lastOutCommentLine
      //sourceMap
      //browser:boolean

      //exportNamespace

      //orTempVarCount=0 //helper temp vars to code js "or" in C, using ternary ?:
         this.header=0;
         this.filenames=['', '', ''];
         this.fileIsOpen=[false, false, false];
         this.fHandles=[null, null, null];
         this.orTempVarCount=0;
    };


//#### Method start(options)
     OutCode.prototype.start = function(options){
//Initialize output array

        //declare on options
            //nomap # do not generate sourcemap
        

        //.lineNum=1
        this.lineNum = 1;
        //.column=1
        this.column = 1;
        //.lines=[[],[],[]]
        this.lines = [[], [], []];
        
        //.lastOriginalCodeComment = 0
        this.lastOriginalCodeComment = 0;
        //.lastOutCommentLine = 0
        this.lastOutCommentLine = 0;

//if sourceMap option is set, and we're in node generating .js

        ////ifdef PROD_C
        //do nothing
        null;
     };
        ////else
        ////if not options.nomap and type of process isnt 'undefined' # in node
              ////import SourceMap
              ////.sourceMap = new SourceMap
        ////end if

//#### Method setHeader(num)
     OutCode.prototype.setHeader = function(num){

        //.startNewLine
        this.startNewLine();
        //.header = num
        this.header = num;
     };

//#### Method put(text:string)
     OutCode.prototype.put = function(text){
//put a string into produced code

//if no current line
//create a empty one

        //if .currLine is undefined
        if (this.currLine === undefined) {
            //.currLine=new DynBuffer(128)
            this.currLine = new DynBuffer(128);
            //.column=1
            this.column = 1;
        };

//append text to line 

        //if text, .column += .currLine.append(text)
        if (text) {this.column += this.currLine.append(text)};
     };


//#### Method startNewLine()
     OutCode.prototype.startNewLine = function(){
//Start New Line into produced code

//send the current line

          //if .currLine
          if (this.currLine) {

              //if .fileMode
              if (this.fileMode) {
                  //if no .fileIsOpen[.header]
                  if (!this.fileIsOpen[this.header]) {
                      //// make sure output dir exists
                      //var filename = .filenames[.header] 
                      var filename = this.filenames[this.header];
                      //mkPath.toFile(filename);
                      mkPath.toFile(filename);
                      //.fHandles[.header]=fs.openSync(filename,'w')
                      this.fHandles[this.header] = fs.openSync(filename, 'w');
                      //.fileIsOpen[.header] = true
                      this.fileIsOpen[this.header] = true;
                  };

                  //.currLine.saveLine .fHandles[.header]
                  this.currLine.saveLine(this.fHandles[this.header]);
              }
              else {

              //else
                  //.lines[.header].push .currLine.toString()
                  this.lines[this.header].push(this.currLine.toString());
              };
              
              //if .header is 0
              if (this.header === 0) {
                  //.lineNum++
                  this.lineNum++;
                  ////ifndef NDEBUG
                  //logger.debug  .lineNum, .currLine.toString()
                  logger.debug(this.lineNum, this.currLine.toString());
              };
          };
                  ////endif

//clear current line

          //.currLine = undefined
          this.currLine = undefined;
          //.column = 1
          this.column = 1;
     };

//#### Method ensureNewLine()
     OutCode.prototype.ensureNewLine = function(){
//if there's something on the line, start a new one

          //if .currLine, .startNewLine
          if (this.currLine) {this.startNewLine()};
     };

//#### Method blankLine()
     OutCode.prototype.blankLine = function(){

          //.startNewLine
          this.startNewLine();
          //.put ""
          this.put("");
          //.startNewLine
          this.startNewLine();
     };


//#### method getResult(header:boolean) returns array of string
     OutCode.prototype.getResult = function(header){
//get result and clear memory      

        //.header = header
        this.header = header;
        //.startNewLine() #close last line
        this.startNewLine();// #close last line
        //var result
        var result = undefined;
        //result = .lines[header]
        result = this.lines[header];
        //.lines[header] = []
        this.lines[header] = [];

        //return result
        return result;
     };

//#### method close()
     OutCode.prototype.close = function(){

        //if .fileMode
        if (this.fileMode) {

            //for header=0 to 2
            var _end3=2;
            for( var header=0; header<=_end3; header++) {

                //if .fileIsOpen[header]
                if (this.fileIsOpen[header]) {

                    //fs.closeSync .fHandles[header]
                    fs.closeSync(this.fHandles[header]);
                    //.fileIsOpen[header] = false
                    this.fileIsOpen[header] = false;
                };
            };// end for header
            
        };
     };


//#### helper method markSourceMap(indent) returns SourceMapMark
     OutCode.prototype.markSourceMap = function(indent){

        //var col = .column 
        var col = this.column;
        //if not .currLine, col += indent-1
        if (!(this.currLine)) {col += indent - 1};
        //return SourceMapMark.{
                      //col:col        
                      //lin:.lineNum-1
        return SourceMapMark.newFromObject({col: col, lin: this.lineNum - 1});
     };
                //}

//#### helper method addSourceMap(mark, sourceLin, sourceCol, indent)
     OutCode.prototype.addSourceMap = function(mark, sourceLin, sourceCol, indent){

        ////ifdef PROD_C
        //do nothing
        null;
     };
    // export
    module.exports.OutCode = OutCode;
    
    // end class OutCode
        ////else
        ////if .sourceMap
            ////declare on mark
                ////lin,col
            ////.sourceMap.add ( (sourceLin or 1)-1, 0, mark.lin, 0)
        ////endif


//### Class DynBuffer
    // constructor
    function DynBuffer(size){

//Like node.js Buffer, but auto-extends if required

        //properties
            //used = 0
            //buf :Buffer
            this.used=0;


        //constructor new DynBuffer(size)
            //.buf = new Buffer(size)
            this.buf = new Buffer(size);
        };


        //method append(text:string)
        DynBuffer.prototype.append = function(text){

          //var byteLen = Buffer.byteLength(text)
          var byteLen = Buffer.byteLength(text);

          //if .used + byteLen > .buf.length
          if (this.used + byteLen > this.buf.length) {

              //var nbuf = new Buffer(.used + byteLen + 32)
              var nbuf = new Buffer(this.used + byteLen + 32);
              //.buf.copy nbuf
              this.buf.copy(nbuf);
              //.buf = nbuf //replace
              this.buf = nbuf; //replace
          };

          //.used += .buf.write(text,.used)
          this.used += this.buf.write(text, this.used);

          //return byteLen
          return byteLen;
        };


        //method saveLine(fd)
        DynBuffer.prototype.saveLine = function(fd){

          //fs.writeSync fd, .buf,0,.used
          fs.writeSync(fd, this.buf, 0, this.used);
          //fs.writeSync fd, "\n"
          fs.writeSync(fd, "\n");
        };
    // end class DynBuffer


//### helper class SourceMapMark
    // constructor
    function SourceMapMark(){ // default constructor
      //properties 
        //col, lin
    };
    
    // end class SourceMapMark


