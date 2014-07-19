#include "Parser.h"
//-------------------------
//Module Parser
//-------------------------
#include "Parser.c.extra"
var Parser_preprocessor_replaces;
    //-----------------------
    // Class Parser_Lexer: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Parser_Lexer_METHODS = {
      { reset_, Parser_Lexer_reset },
      { initSource_, Parser_Lexer_initSource },
      { preParseSource_, Parser_Lexer_preParseSource },
      { checkTitleCode_, Parser_Lexer_checkTitleCode },
      { tokenize_, Parser_Lexer_tokenize },
      { preprocessor_, Parser_Lexer_preprocessor },
      { process_, Parser_Lexer_process },
      { nextSourceLine_, Parser_Lexer_nextSourceLine },
      { replaceSourceLine_, Parser_Lexer_replaceSourceLine },
      { parseTripleQuotes_, Parser_Lexer_parseTripleQuotes },
      { checkMultilineComment_, Parser_Lexer_checkMultilineComment },
      { checkConditionalCompilation_, Parser_Lexer_checkConditionalCompilation },
      { getPos_, Parser_Lexer_getPos },
      { setPos_, Parser_Lexer_setPos },
      { posToString_, Parser_Lexer_posToString },
      { getPrevIndent_, Parser_Lexer_getPrevIndent },
      { consumeToken_, Parser_Lexer_consumeToken },
      { nextToken_, Parser_Lexer_nextToken },
      { returnToken_, Parser_Lexer_returnToken },
      { nextCODELine_, Parser_Lexer_nextCODELine },
      { say_, Parser_Lexer_say },
      { throwErr_, Parser_Lexer_throwErr },
      { sayErr_, Parser_Lexer_sayErr },
      { warn_, Parser_Lexer_warn },
      { splitExpressions_, Parser_Lexer_splitExpressions },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Parser_Lexer_PROPS[] = {
    project_
    , filename_
    , options_
    , lines_
    , infoLines_
    , line_
    , indent_
    , lineInx_
    , sourceLineNum_
    , infoLine_
    , token_
    , index_
    , interfaceMode_
    , stringInterpolationChar_
    , last_
    , maxSourceLineNum_
    , hardError_
    , softError_
    , outCode_
    };
    
any Parser_pushAt(DEFAULT_ARGUMENTS); //forward declare
    //-----------------------
    // Class Parser_Token: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Parser_Token_METHODS = {
      { toString_, Parser_Token_toString },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Parser_Token_PROPS[] = {
    type_
    , value_
    , column_
    };
    
    //-----------------------
    // Class Parser_InfoLine: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Parser_InfoLine_METHODS = {
      { dump_, Parser_InfoLine_dump },
      { tokenizeLine_, Parser_InfoLine_tokenizeLine },
      { recognizeToken_, Parser_InfoLine_recognizeToken },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Parser_InfoLine_PROPS[] = {
    type_
    , indent_
    , sourceLineNum_
    , text_
    , tokens_
    };
    
    //-----------------------
    // Class Parser_LexerPos: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Parser_LexerPos_METHODS = {
      { toString_, Parser_LexerPos_toString },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Parser_LexerPos_PROPS[] = {
    lexer_
    , lineInx_
    , sourceLineNum_
    , index_
    , token_
    , last_
    };
    
    //-----------------------
    // Class Parser_MultilineSection: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Parser_MultilineSection_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Parser_MultilineSection_PROPS[] = {
    pre_
    , section_
    , post_
    , postIndent_
    };
    
    //-----------------------
    // Class Parser_OutCode: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Parser_OutCode_METHODS = {
      { start_, Parser_OutCode_start },
      { setHeader_, Parser_OutCode_setHeader },
      { put_, Parser_OutCode_put },
      { startNewLine_, Parser_OutCode_startNewLine },
      { ensureNewLine_, Parser_OutCode_ensureNewLine },
      { blankLine_, Parser_OutCode_blankLine },
      { getResult_, Parser_OutCode_getResult },
      { close_, Parser_OutCode_close },
      { markSourceMap_, Parser_OutCode_markSourceMap },
      { addSourceMap_, Parser_OutCode_addSourceMap },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Parser_OutCode_PROPS[] = {
    lineNum_
    , column_
    , currLine_
    , header_
    , fileMode_
    , filenames_
    , fileIsOpen_
    , fHandles_
    , lines_
    , lastOriginalCodeComment_
    , lastOutCommentLine_
    , sourceMap_
    , browser_
    , exportNamespace_
    , orTempVarCount_
    };
    
    //-----------------------
    // Class Parser_DynBuffer: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Parser_DynBuffer_METHODS = {
      { append_, Parser_DynBuffer_append },
      { saveLine_, Parser_DynBuffer_saveLine },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Parser_DynBuffer_PROPS[] = {
    used_
    , buf_
    };
    
    

//--------------
    // Parser_Lexer
    any Parser_Lexer; //Class Parser_Lexer
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
    //global import fs
    //shim import Map, PMREX, mkPath
//module vars
    //lexer options literal map
    //var preprocessor_replaces: map string to string
//The Lexer Class
//===============
//### public Class Lexer
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
     ;
//#### Constructor new Lexer(project, options:GeneralOptions)
     void Parser_Lexer__init(DEFAULT_ARGUMENTS){
     PROP(maxSourceLineNum_,this)=any_number(0);
          
          // define named params
          var project, options;
          project=options=undefined;
          switch(argc){
            case 2:options=arguments[1];
            case 1:project=arguments[0];
          }
          //---------
          ////.compiler = compiler #Compiler.lite.md module.exports
          //.project = project #Compiler.lite.md class Project
          PROP(project_,this) = project;// #Compiler.lite.md class Project
//use same options as compiler
          //.options = options
          PROP(options_,this) = options;
          //default options.browser = undefined
          _default(&PROP(browser_,options),undefined);
          //default options.comments = 1 #comment level
          _default(&PROP(comments_,options),any_number(1));
          //preprocessor_replaces = 
              //DATE: .options.now.toDateString()
              //TIME: .options.now.toTimeString()
              //TIMESTAMP: .options.now.toISOString()
          Parser_preprocessor_replaces = new(Map,3,(any_arr){
              _newPair("DATE",__call(toDateString_,PROP(now_,PROP(options_,this)),0,NULL)), 
              _newPair("TIME",__call(toTimeString_,PROP(now_,PROP(options_,this)),0,NULL)), 
              _newPair("TIMESTAMP",__call(toISOString_,PROP(now_,PROP(options_,this)),0,NULL))
              })
          ;
//stringInterpolationChar starts for every file the same: "#"
//can be changed in-file with `lexer options` directive
          //.stringInterpolationChar = "#" 
          PROP(stringInterpolationChar_,this) = any_str("#");
          //.hardError = null # stores most significative (deepest) error, when parsing fails
          PROP(hardError_,this) = null;// # stores most significative (deepest) error, when parsing fails
//clear out helper
          //.outCode = new OutCode() #helper class
          PROP(outCode_,this) = new(Parser_OutCode,0,NULL);// #helper class
          //.outCode.start .options
          __call(start_,PROP(outCode_,this),1,(any_arr){PROP(options_,this)});
//we start with an empty Token
         // 
          //.token = new Token()
          PROP(token_,this) = new(Parser_Token,0,NULL);
     }
         // 
      //#end constructor
//#### Method reset()
     any Parser_Lexer_reset(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Parser_Lexer));
        //---------
        //.sourceLineNum = 0
        PROP(sourceLineNum_,this) = any_number(0);
        //.lineInx=0
        PROP(lineInx_,this) = any_number(0);
        //.lines=""
        PROP(lines_,this) = any_EMPTY_STR;
        //.setPos .last
        METHOD(setPos_,this)(this,1,(any_arr){PROP(last_,this)});
     return undefined;
     }
//#### Method initSource(filename:string, source:String)
     any Parser_Lexer_initSource(DEFAULT_ARGUMENTS){
          assert(_instanceof(this,Parser_Lexer));
          //---------
          // define named params
          var filename, source;
          filename=source=undefined;
          switch(argc){
            case 2:source=arguments[1];
            case 1:filename=arguments[0];
          }
          //---------
//Load filename and source code in the lexer.
//First, remember filename (for error reporting) 
          //.filename = filename
          PROP(filename_,this) = filename;
          //.interfaceMode = filename.indexOf('.interface.') isnt -1
          PROP(interfaceMode_,this) = any_number(!__is(METHOD(indexOf_,filename)(filename,1,(any_arr){any_str(".interface.")}),any_number(-1)));
//create source lines array
          //if source instanceof Array
          if (_instanceof(source,Array))  {
            //.lines = source
            PROP(lines_,this) = source;
          }
          //else
          
          else {
//If code is passed as a buffer, convert it to string
//then to lines array 
            //if typeof source isnt 'string', source = source.toString()
            if (!__is(_typeof(source),any_str("string"))) {source = METHOD(toString_,source)(source,0,NULL);};
           // 
            //.lines = source.split('\n')
            PROP(lines_,this) = METHOD(split_,source)(source,1,(any_arr){any_str("\n")});
            //.lines.push "" # add extra empty line
            __call(push_,PROP(lines_,this),1,(any_arr){any_EMPTY_STR});// # add extra empty line
          };
     return undefined;
     }
//#### Method preParseSource() returns InfoLine array
     any Parser_Lexer_preParseSource(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Parser_Lexer));
        //---------
//read from .sourceLines and 
//prepares a processed infoLines result array
        //var infoLines = []
        var infoLines = new(Array,0,NULL);
//Loop processing source code lines 
        //var lastLineWasBlank=true, inCodeBlock=false
        var lastLineWasBlank = true, inCodeBlock = false;
        //.sourceLineNum = 0
        PROP(sourceLineNum_,this) = any_number(0);
        //do while .nextSourceLine()
        while(_anyToBool(METHOD(nextSourceLine_,this)(this,0,NULL))){
//get line indent, by counting whitespace (index of first non-whitespace: \S ),
//then trim() the line
            //var line = .line
            var line = PROP(line_,this);
            //var indent = line.countSpaces()
            var indent = METHOD(countSpaces_,line)(line,0,NULL);
            //line = line.trim()
            line = METHOD(trim_,line)(line,0,NULL);
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
            if (!_anyToBool(line))  {
                //type = LineTypes.BLANK
                type = Parser_LineTypes_BLANK;
            }
//else, if indented 4 spaces or more, can be the start of a code block
            //else 
            
            else {
                //if indent >= 4
                if (_anyToNumber(indent) >= 4)  {
                    //if lastLineWasBlank,inCodeBlock = true
                    if (_anyToBool(lastLineWasBlank)) {inCodeBlock = true;};
                }
//else, (not indented 4) probably a literate comment,
//except for title-keywords 
                //else
                
                else {
                    //inCodeBlock = false
                    inCodeBlock = false;
                    //if indent is 0 and line.charAt(0) is '#' //starts on column 1, with a '#'
                    if (__is(indent,any_number(0)) && __is(METHOD(charAt_,line)(line,1,(any_arr){any_number(0)}),any_str("#")))  { //starts on column 1, with a '#'
//checkTitleCode: if found a vlid title-code, rewrite the line, 
//replacing MarkDown title MD hashs (###) by spaces and making keywords lowercase
                        //if .checkTitleCode(line) into var converted 
                        var converted=undefined;
                        if (_anyToBool((converted=METHOD(checkTitleCode_,this)(this,1,(any_arr){line}))))  {
                            //line = converted 
                            line = converted;
                            //indent = line.countSpaces() //re-calc indent
                            indent = METHOD(countSpaces_,line)(line,0,NULL); //re-calc indent
                            //inCodeBlock = indent>=4
                            inCodeBlock = any_number(_anyToNumber(indent) >= 4);
                        };
                    };
                    //end if startted with #
                    
                };
                //end if - line, check indent
                
//After applying rules: if we're in a Code Block, is CODE, else is a COMMENT
                //if inCodeBlock
                if (_anyToBool(inCodeBlock))  {
                    //if line.startsWith("#") or line.startsWith("//") # CODE by indent, but all commented
                    if (_anyToBool((_anyToBool(__or1=METHOD(startsWith_,line)(line,1,(any_arr){any_str("#")}))? __or1 : METHOD(startsWith_,line)(line,1,(any_arr){any_str("//")}))))  {// # CODE by indent, but all commented
                      //type = LineTypes.COMMENT
                      type = Parser_LineTypes_COMMENT;
                    }
                    //else
                    
                    else {
                      //type = LineTypes.CODE
                      type = Parser_LineTypes_CODE;
                    };
                }
               // 
                //else
                
                else {
                    //type = LineTypes.COMMENT
                    type = Parser_LineTypes_COMMENT;
                };
            };
                //#end if
            //#end if line wasnt blank
//parse multi-line string (triple quotes) and convert to one logical line: 
//Example result: var a = 'first line\nsecond line\nThird line\n'
            //if type is LineTypes.CODE 
            if (__is(type,Parser_LineTypes_CODE))  {
                //line = .preprocessor(.parseTripleQuotes( line ))
                line = METHOD(preprocessor_,this)(this,1,(any_arr){METHOD(parseTripleQuotes_,this)(this,1,(any_arr){line})});
            };
//check for multi-line comment, C and js style /* .... */ 
//then check for "#ifdef/#else/#endif"
            //if .checkMultilineComment(infoLines, type, indent, line )
            if (_anyToBool(METHOD(checkMultilineComment_,this)(this,4,(any_arr){infoLines, type, indent, line})))  {
                //continue #found and pushed multiline comment, continue with next line
                continue;// #found and pushed multiline comment, continue with next line
            }
            //else if .checkConditionalCompilation(line)
            
            else if (_anyToBool(METHOD(checkConditionalCompilation_,this)(this,1,(any_arr){line})))  {
                //continue #processed, continue with next line
                continue;// #processed, continue with next line
            };
//Create infoLine, with computed indent, text, and source code line num reference 
            //var infoLine = new InfoLine(this, type, indent, line, .sourceLineNum )
            var infoLine = new(Parser_InfoLine,5,(any_arr){this, type, indent, line, PROP(sourceLineNum_,this)});
            //infoLine.dump() # debug
            METHOD(dump_,infoLine)(infoLine,0,NULL);// # debug
            //infoLines.push infoLine 
            METHOD(push_,infoLines)(infoLines,1,(any_arr){infoLine});
            //lastLineWasBlank = type is LineTypes.BLANK
            lastLineWasBlank = any_number(__is(type,Parser_LineTypes_BLANK));
        };// end loop
           // 
        //loop #process next source line
//now we have a infoLine array, tokenized, ready to be parsed
//if we do not need to produce comments with original source
//for reference at produced .c or .js, clear source lines from memory 
        //if no .options.comments
        if (!_anyToBool(PROP(comments_,PROP(options_,this))))  {
            //.lines = undefined
            PROP(lines_,this) = undefined;
        };
        //return infoLines
        return infoLines;
     return undefined;
     }
 // 
//#### method checkTitleCode(line:string) returns string // or undefined
     any Parser_Lexer_checkTitleCode(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Parser_Lexer));
        //---------
        // define named params
        var line= argc? arguments[0] : undefined;
        //---------
//check for title-keywords: e.g.: `### Class MyClass`, `### export Function compile(sourceLines:string array)`
        ////var titleKeyRegexp = /^(#)+ *(?:(?:public|export|default|helper)\s*)*(class|namespace|append to|function|method|constructor|properties)\b/i
        //var words = line.split(" ")
        var words = METHOD(split_,line)(line,1,(any_arr){any_str(" ")});
        //if words[0].length<3, return // should be at least indent 4: '### '
        if (_length(ITEM(0,words)) < 3) {return undefined;};
        //// return if first word is not all #'s
        //if words[0].replaceAll("#"," ").trim(), return 
        if (_anyToBool(__call(trim_,__call(replaceAll_,ITEM(0,words),2,(any_arr){any_str("#"), any_str(" ")}),0,NULL))) {return undefined;};
        //var sustantives = ["class","namespace","function","method","constructor","properties"];
        var sustantives = new(Array,6,(any_arr){any_str("class"), any_str("namespace"), any_str("function"), any_str("method"), any_str("constructor"), any_str("properties")});
        //var inx=1, countAdj=0, countSust=0, sustLeft=1
        var inx = any_number(1), countAdj = any_number(0), countSust = any_number(0), sustLeft = any_number(1);
        //while inx<words.length
        while(_anyToNumber(inx) < _length(words)){
            //if words[inx] //skip empty items
            if (_anyToBool(ITEM(_anyToNumber(inx),words)))  { //skip empty items
                //if words[inx].toLowerCase() in ["public","export","default","helper"]
                if (__in(__call(toLowerCase_,ITEM(_anyToNumber(inx),words),0,NULL),4,(any_arr){any_str("public"), any_str("export"), any_str("default"), any_str("helper")}))  {
                    //countAdj++ //valid
                    countAdj.value.number++; //valid
                }
                //else
                
                else {
                  //break //invalid word
                  break; //invalid word
                };
            };
           // 
            //inx++ //next
            inx.value.number++; //next
        };// end loop
        //if no countAdj and inx<words.length-1
        if (!_anyToBool(countAdj) && _anyToNumber(inx) < _length(words) - 1)  {
            //if words[inx].toLowerCase() is 'append'
            if (__is(__call(toLowerCase_,ITEM(_anyToNumber(inx),words),0,NULL),any_str("append")))  {
                //inx++ //skip 'append'
                inx.value.number++; //skip 'append'
                //if words[inx] is 'to', inx++ //skip to
                if (__is(ITEM(_anyToNumber(inx),words),any_str("to"))) {inx.value.number++;};
            };
        };
        //while inx<words.length
        while(_anyToNumber(inx) < _length(words)){
            //if words[inx] into var w:string //skip empty items
            var w=undefined;
            if (_anyToBool((w=ITEM(_anyToNumber(inx),words))))  { //skip empty items
           // 
                //if w.indexOf('(') into var posParen <> -1
                var posParen=undefined;
                if (_anyToNumber((posParen=METHOD(indexOf_,w)(w,1,(any_arr){any_str("(")}))) != -1)  {
                    ////split at "(". remove composed and insert splitted at "("
                    //words.splice inx,1, w.slice(0,posParen), w.slice(posParen)
                    METHOD(splice_,words)(words,4,(any_arr){inx, any_number(1), METHOD(slice_,w)(w,2,(any_arr){any_number(0), posParen}), METHOD(slice_,w)(w,1,(any_arr){posParen})});
                    //w = words[inx]
                    w = ITEM(_anyToNumber(inx),words);
                };
                //if w.toLowerCase() in sustantives
                if (CALL1(indexOf_,sustantives,METHOD(toLowerCase_,w)(w,0,NULL)).value.number>=0)  {
                    //countSust++ //valid
                    countSust.value.number++; //valid
                    //break //exit, sustantive found
                    break; //exit, sustantive found
                }
                //else
                
                else {
                  //break //invalid word
                  break; //invalid word
                };
            };
           // 
            //inx++ //next
            inx.value.number++; //next
        };// end loop
        //if countAdj>1 and no countSust, .throwErr "MarkDown Title-keyword, expected a sustantive: #{sustantives.join()}"
        if (_anyToNumber(countAdj) > 1 && !_anyToBool(countSust)) {METHOD(throwErr_,this)(this,1,(any_arr){_concatAny(2,any_str("MarkDown Title-keyword, expected a sustantive: "), METHOD(join_,sustantives)(sustantives,0,NULL))});};
        //if countSust
        if (_anyToBool(countSust))  {
            //if words[0].length<3, .throwErr "MarkDown Title-keyword, expected at least indent 4: '### '"
            if (_length(ITEM(0,words)) < 3) {METHOD(throwErr_,this)(this,1,(any_arr){any_str("MarkDown Title-keyword, expected at least indent 4: '### '")});};
            //for recogn=1 to inx //each recognized word, convert to lowercase
            int64_t _end4=_anyToNumber(inx);
            for(int64_t recogn=1; recogn<=_end4; recogn++) {
                //words[recogn]=words[recogn].toLowerCase()
                ITEM(recogn,words) = __call(toLowerCase_,ITEM(recogn,words),0,NULL);
            };// end for recogn
            //words[0] = words[0].replaceAll("#"," ") //replace # by ' '
            ITEM(0,words) = __call(replaceAll_,ITEM(0,words),2,(any_arr){any_str("#"), any_str(" ")}); //replace # by ' '
            //return words.join(' ') // re-join
            return METHOD(join_,words)(words,1,(any_arr){any_str(" ")}); // re-join
        };
     return undefined;
     }
//#### method tokenize
     any Parser_Lexer_tokenize(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Parser_Lexer));
        //---------
//*Tokenize CODE lines
//Now, after processing all lines, we tokenize each CODE line
        //logger.debug "---- TOKENIZE"
        logger_debug(undefined,1,(any_arr){any_str("---- TOKENIZE")});
        //for each item in .infoLines
        any _list13=PROP(infoLines_,this);
        { var item=undefined;
        for(int item__inx=0 ; item__inx<_list13.value.arr->length ; item__inx++){item=ITEM(item__inx,_list13);
        
            //try
            try{
           // 
                //item.dump() # debug
                METHOD(dump_,item)(item,0,NULL);// # debug
                //if item.type is LineTypes.CODE
                if (__is(PROP(type_,item),Parser_LineTypes_CODE))  {
                    //item.tokenizeLine(this)
                    METHOD(tokenizeLine_,item)(item,1,(any_arr){this});
                };
                //end if
                
            
            }catch(err){
            //catch err
                ////adds position info
                //throw new ControlledError("#{.filename}:#{item.sourceLineNum}:1 #{err.message}")
                throw(new(ControlledError,1,(any_arr){_concatAny(5,PROP(filename_,this), any_str(":"), PROP(sourceLineNum_,item), any_str(":1 "), PROP(message_,err))}));
            };
        }};// end for each in PROP(infoLines_,this)
        //end loop code lines
        
//reset Lexer position, to allow the parser to start reading tokens
        //.lineInx = -1 #line index
        PROP(lineInx_,this) = any_number(-1);// #line index
        //.infoLine = null #current infoLine
        PROP(infoLine_,this) = null;// #current infoLine
        //.index = -1 #token index
        PROP(index_,this) = any_number(-1);// #token index
        //.last = .getPos() #last position
        PROP(last_,this) = METHOD(getPos_,this)(this,0,NULL);// #last position
//read first token
        //.nextToken() 
        METHOD(nextToken_,this)(this,0,NULL);
     return undefined;
     }
    //#end Lexer tokenize
//Pre-Processor
//-------------
//#### method preprocessor(line:string)
     any Parser_Lexer_preprocessor(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Parser_Lexer));
        //---------
        // define named params
        var line= argc? arguments[0] : undefined;
        //---------
//This is a ver crude preprocessor.
//Here we search for simple macros as __DATE__, __TIME__ , __TMESTAMP__
        //for each macro,value in map preprocessor_replaces
        any _list14=Parser_preprocessor_replaces;
        {NameValuePair_ptr __nvp=NULL; //name:value pair
        int64_t __len=MAPSIZE(_list14); //how many pairs
        var macro=undefined; //key
        var value=undefined; //value
        for(int64_t __inx=0 ; __inx < __len ; __inx++ ){
            __nvp = MAPITEM( __inx,_list14);
            macro= __nvp->name;
            value= __nvp->value;
        
            //line=line.replaceAll("__#{macro}__",value)
            line = METHOD(replaceAll_,line)(line,2,(any_arr){_concatAny(3,any_str("__"), macro, any_str("__")), value});
        }};// end for each in map Parser_preprocessor_replaces
        //return line
        return line;
     return undefined;
     }
//#### method process()
     any Parser_Lexer_process(DEFAULT_ARGUMENTS){
      assert(_instanceof(this,Parser_Lexer));
      //---------
//Analyze generated lines. preParseSource() set line type, calculates indent, 
//handles multiline string, comments, string interpolation, etc.
      //.infoLines = .preParseSource()
      PROP(infoLines_,this) = METHOD(preParseSource_,this)(this,0,NULL);
//Tokenize final lines
      //.tokenize
      METHOD(tokenize_,this)(this,0,NULL);
     return undefined;
     }
//Next Source Line
//----------------
//#### method nextSourceLine()
     any Parser_Lexer_nextSourceLine(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Parser_Lexer));
        //---------
//returns false is there are no more lines
        //if .sourceLineNum >= .lines.length
        if (_anyToNumber(PROP(sourceLineNum_,this)) >= _length(PROP(lines_,this)))  {
            //return false
            return false;
        };
//get source line, replace TAB with 4 spaces, remove trailing withespace and remove CR
        //.line = .lines[.sourceLineNum].replaceAll("\t",'    ').trimRight().replaceAll("\r","")
        PROP(line_,this) = __call(replaceAll_,__call(trimRight_,__call(replaceAll_,ITEM(_anyToNumber(PROP(sourceLineNum_,this)),PROP(lines_,this)),2,(any_arr){any_str("\t"), any_str("    ")}),0,NULL),2,(any_arr){any_str("\r"), any_EMPTY_STR});
        //.sourceLineNum++ # note: source files line numbers are 1-based
        PROP(sourceLineNum_,this).value.number++;// # note: source files line numbers are 1-based
        //return true
        return true;
     return undefined;
     }
//#### method replaceSourceLine(newLine)
     any Parser_Lexer_replaceSourceLine(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Parser_Lexer));
        //---------
        // define named params
        var newLine= argc? arguments[0] : undefined;
        //---------
        //.lines[.sourceLineNum-1] = newLine
        ITEM(_anyToNumber(PROP(sourceLineNum_,this)) - 1,PROP(lines_,this)) = newLine;
     return undefined;
     }
//----------------------------
//Multiline strings
//-----------------
//#### method parseTripleQuotes(line:string)
     any Parser_Lexer_parseTripleQuotes(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Parser_Lexer));
        //---------
        // define named params
        var line= argc? arguments[0] : undefined;
        //---------
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
        var result = new(Parser_MultilineSection,4,(any_arr){this, line, any_str("\"\"\""), any_str("\"\"\"")});
        //if result.section
        if (_anyToBool(PROP(section_,result)))  {
          //#discard first and last lines, if empty
          //if no result.section[0].trim()
          if (!_anyToBool(__call(trim_,ITEM(0,PROP(section_,result)),0,NULL)))  {
            //result.section.shift()
            __call(shift_,PROP(section_,result),0,NULL);
          };
          //if no result.section[result.section.length-1].trim()
          if (!_anyToBool(__call(trim_,ITEM(_length(PROP(section_,result)) - 1,PROP(section_,result)),0,NULL)))  {
            //result.section.pop()
            __call(pop_,PROP(section_,result),0,NULL);
          };
          //#search min indent
          //var indent = 999
          var indent = any_number(999);
          //for each sectionLine1 in result.section
          any _list15=PROP(section_,result);
          { var sectionLine1=undefined;
          for(int sectionLine1__inx=0 ; sectionLine1__inx<_list15.value.arr->length ; sectionLine1__inx++){sectionLine1=ITEM(sectionLine1__inx,_list15);
          
            //var lineIndent=sectionLine1.countSpaces()
            var lineIndent = METHOD(countSpaces_,sectionLine1)(sectionLine1,0,NULL);
            //if lineIndent>=0 and lineIndent<indent
            if (_anyToNumber(lineIndent) >= 0 && _anyToNumber(lineIndent) < _anyToNumber(indent))  {
                //indent = lineIndent
                indent = lineIndent;
            };
          }};// end for each in PROP(section_,result)
          //#trim indent on the left and extra right spaces
          //for each inx,sectionLine in result.section
          any _list16=PROP(section_,result);
          { var sectionLine=undefined;
          for(int inx=0 ; inx<_list16.value.arr->length ; inx++){sectionLine=ITEM(inx,_list16);
          
            //result.section[inx] = sectionLine.slice(indent).trimRight()
            ITEM(inx,PROP(section_,result)) = __call(trimRight_,METHOD(slice_,sectionLine)(sectionLine,1,(any_arr){indent}),0,NULL);
          }};// end for each in PROP(section_,result)
          //#join with (encoded) newline char and enclose in quotes (for splitExpressions)
          //line = result.section.join("\\n").quoted('"') 
          line = __call(quoted_,__call(join_,PROP(section_,result),1,(any_arr){any_str("\\n")}),1,(any_arr){any_str("\"")});
//Now we should escape internal d-quotes, but only *outside* string interpolation expressions
          //var parsed = .splitExpressions(line,.stringInterpolationChar)
          var parsed = METHOD(splitExpressions_,this)(this,2,(any_arr){line, PROP(stringInterpolationChar_,this)});
          //for each inx,item:string in parsed
          any _list17=parsed;
          { var item=undefined;
          for(int inx=0 ; inx<_list17.value.arr->length ; inx++){item=ITEM(inx,_list17);
          
              //if item.charAt(0) is '"' //a string part
              if (__is(METHOD(charAt_,item)(item,1,(any_arr){any_number(0)}),any_str("\"")))  { //a string part
                  //item = item.slice(1,-1) //remove quotes
                  item = METHOD(slice_,item)(item,2,(any_arr){any_number(1), any_number(-1)}); //remove quotes
                  //parsed[inx] = item.replaceAll('"','\\"') #store with *escaped* internal d-quotes
                  ITEM(inx,parsed) = METHOD(replaceAll_,item)(item,2,(any_arr){any_str("\""), any_str("\\\"")});// #store with *escaped* internal d-quotes
              }
              //else
              
              else {
                  //#restore string interp. codes
                  //parsed[inx] = "#{.stringInterpolationChar}{#{item}}"
                  ITEM(inx,parsed) = _concatAny(4,PROP(stringInterpolationChar_,this), any_str("{"), item, any_str("}"));
              };
          }};// end for each in parsed
          //#re-join & re.enclose in quotes
          //line = parsed.join("").quoted('"') 
          line = __call(quoted_,METHOD(join_,parsed)(parsed,1,(any_arr){any_EMPTY_STR}),1,(any_arr){any_str("\"")});
          //line = "#{result.pre} #{line}#{result.post}" #add pre & post
          line = _concatAny(4,PROP(pre_,result), any_str(" "), line, PROP(post_,result));// #add pre & post
        };
        //return line
        return line;
     return undefined;
     }
      //#end parse triple quotes
//----------------------------
//#### method checkMultilineComment(infoLines:InfoLine array, lineType, startLineIndent, line)
     any Parser_Lexer_checkMultilineComment(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Parser_Lexer));
        //---------
        // define named params
        var infoLines, lineType, startLineIndent, line;
        infoLines=lineType=startLineIndent=line=undefined;
        switch(argc){
          case 4:line=arguments[3];
          case 3:startLineIndent=arguments[2];
          case 2:lineType=arguments[1];
          case 1:infoLines=arguments[0];
        }
        //---------
//This method handles multiline comments: `/*` `*/` 
        //var startSourceLine = .sourceLineNum
        var startSourceLine = PROP(sourceLineNum_,this);
        //var result = new MultilineSection(this, line, '/*', '*/')
        var result = new(Parser_MultilineSection,4,(any_arr){this, line, any_str("/*"), any_str("*/")});
        //if no result.section
        if (!_anyToBool(PROP(section_,result)))  {
          //return false
          return false;
        };
        //if result.section.length is 1 # just one line
        if (__is(any_number(_length(PROP(section_,result))),any_number(1)))  {// # just one line
          //line = "#{result.pre} #{result.post}//#{result.section[0]}"
          line = _concatAny(5,PROP(pre_,result), any_str(" "), PROP(post_,result), any_str("//"), ITEM(0,PROP(section_,result)));
          //infoLines.push(new InfoLine(this, lineType, startLineIndent, line, startSourceLine))  
          METHOD(push_,infoLines)(infoLines,1,(any_arr){new(Parser_InfoLine,5,(any_arr){this, lineType, startLineIndent, line, startSourceLine})});
        }
        //else 
        
        else {
          //if result.pre
          if (_anyToBool(PROP(pre_,result)))  {
              //infoLines.push(new InfoLine(this, lineType, startLineIndent, result.pre, startSourceLine))  
              METHOD(push_,infoLines)(infoLines,1,(any_arr){new(Parser_InfoLine,5,(any_arr){this, lineType, startLineIndent, PROP(pre_,result), startSourceLine})});
          };
          //for each inx,sectionLine in result.section
          any _list18=PROP(section_,result);
          { var sectionLine=undefined;
          for(int inx=0 ; inx<_list18.value.arr->length ; inx++){sectionLine=ITEM(inx,_list18);
          
              //infoLines.push(new InfoLine(this, LineTypes.COMMENT, 0, sectionLine, startSourceLine+inx))  
              METHOD(push_,infoLines)(infoLines,1,(any_arr){new(Parser_InfoLine,5,(any_arr){this, Parser_LineTypes_COMMENT, any_number(0), sectionLine, any_number(_anyToNumber(startSourceLine) + inx)})});
          }};// end for each in PROP(section_,result)
          //if result.post.trim() 
          if (_anyToBool(__call(trim_,PROP(post_,result),0,NULL)))  {
              //logger.warning "#{.filename}:#{.sourceLineNum}:1. Do not add text on the same line after `*/`. Indent is not clear"
              logger_warning(undefined,1,(any_arr){_concatAny(4,PROP(filename_,this), any_str(":"), PROP(sourceLineNum_,this), any_str(":1. Do not add text on the same line after `*/`. Indent is not clear"))});
              //infoLines.push(new InfoLine(this, LineTypes.CODE, result.postIndent, result.post, .sourceLineNum))  
              METHOD(push_,infoLines)(infoLines,1,(any_arr){new(Parser_InfoLine,5,(any_arr){this, Parser_LineTypes_CODE, PROP(postIndent_,result), PROP(post_,result), PROP(sourceLineNum_,this)})});
          };
        };
        //return true #OK, lines processed
        return true;// #OK, lines processed
     return undefined;
     }
//----------------------------
//#### method checkConditionalCompilation(line:string)
     any Parser_Lexer_checkConditionalCompilation(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Parser_Lexer));
        //---------
        // define named params
        var line= argc? arguments[0] : undefined;
        //---------
//This method handles "#ifdef/#else/#endif" as multiline comments
        //var startSourceLine = .sourceLineNum
        var startSourceLine = PROP(sourceLineNum_,this);
        //var words: string array
        var words = undefined;
        //declare valid .project.compilerVar
        
        //declare valid .project.setCompilerVar
        
        //var isDefine = line.indexOf("#define ")
        var isDefine = METHOD(indexOf_,line)(line,1,(any_arr){any_str("#define ")});
        //if isDefine>=0
        if (_anyToNumber(isDefine) >= 0)  {
            //words = line.trim().split(' ')
            words = __call(split_,METHOD(trim_,line)(line,0,NULL),1,(any_arr){any_str(" ")});
            //.project.setCompilerVar words[1],true
            __call(setCompilerVar_,PROP(project_,this),2,(any_arr){ITEM(1,words), true});
            //return false
            return false;
        };
        //var isUndef = line.indexOf("#undef ")
        var isUndef = METHOD(indexOf_,line)(line,1,(any_arr){any_str("#undef ")});
        //if isUndef>=0
        if (_anyToNumber(isUndef) >= 0)  {
            //words = line.trim().split(' ')
            words = __call(split_,METHOD(trim_,line)(line,0,NULL),1,(any_arr){any_str(" ")});
            //.project.setCompilerVar words[1],false
            __call(setCompilerVar_,PROP(project_,this),2,(any_arr){ITEM(1,words), false});
            //return false
            return false;
        };
//ifdef, #ifndef, #else and #endif should be the first thing on the line
        //if line.indexOf("#endif") is 0, .throwErr 'found "#endif" without "#ifdef"'
        if (__is(METHOD(indexOf_,line)(line,1,(any_arr){any_str("#endif")}),any_number(0))) {METHOD(throwErr_,this)(this,1,(any_arr){any_str("found \"#endif\" without \"#ifdef\"")});};
        //if line.indexOf("#else") is 0, .throwErr 'found "#else" without "#ifdef"'
        if (__is(METHOD(indexOf_,line)(line,1,(any_arr){any_str("#else")}),any_number(0))) {METHOD(throwErr_,this)(this,1,(any_arr){any_str("found \"#else\" without \"#ifdef\"")});};
        //var invert = false
        var invert = false;
        //var pos = line.indexOf("#ifdef ")
        var pos = METHOD(indexOf_,line)(line,1,(any_arr){any_str("#ifdef ")});
        //if pos isnt 0 
        if (!__is(pos,any_number(0)))  {
            //pos = line.indexOf("#ifndef ")
            pos = METHOD(indexOf_,line)(line,1,(any_arr){any_str("#ifndef ")});
            //invert = true
            invert = true;
        };
        //if pos isnt 0, return 
        if (!__is(pos,any_number(0))) {return undefined;};
        //var startRef = "while processing #ifdef started on line #{startSourceLine}"
        var startRef = _concatAny(2,any_str("while processing #ifdef started on line "), startSourceLine);
        //words = line.slice(pos).split(' ')
        words = __call(split_,METHOD(slice_,line)(line,1,(any_arr){pos}),1,(any_arr){any_str(" ")});
        //var conditional = words.tryGet(1)
        var conditional = METHOD(tryGet_,words)(words,1,(any_arr){any_number(1)});
        //if no conditional, .throwErr "#ifdef; missing conditional"
        if (!_anyToBool(conditional)) {METHOD(throwErr_,this)(this,1,(any_arr){any_str("#ifdef; missing conditional")});};
        //var defValue = .project.compilerVar(conditional)
        var defValue = __call(compilerVar_,PROP(project_,this),1,(any_arr){conditional});
        //if invert, defValue = not defValue //if it was "#ifndef"
        if (_anyToBool(invert)) {defValue = any_number(!(_anyToBool(defValue)));};
        //.replaceSourceLine .line.replaceAll("#if","//if")
        METHOD(replaceSourceLine_,this)(this,1,(any_arr){__call(replaceAll_,PROP(line_,this),2,(any_arr){any_str("#if"), any_str("//if")})});
        //var endFound=false
        var endFound = false;
        //do
        do{
            //#get next line
            //if no .nextSourceLine(),.throwErr "EOF #{startRef}"
            if (!_anyToBool(METHOD(nextSourceLine_,this)(this,0,NULL))) {METHOD(throwErr_,this)(this,1,(any_arr){_concatAny(2,any_str("EOF "), startRef)});};
            //line = .line
            line = PROP(line_,this);
           // 
            //if line.countSpaces() into var indent >= 0
            var indent=undefined;
            if (_anyToNumber((indent=METHOD(countSpaces_,line)(line,0,NULL))) >= 0)  {
                //line = line.trim()
                line = METHOD(trim_,line)(line,0,NULL);
                //if line.charAt(0) is '#' and line.charAt(1) isnt '#' //expected: "#else, #endif #end if"
                if (__is(METHOD(charAt_,line)(line,1,(any_arr){any_number(0)}),any_str("#")) && !__is(METHOD(charAt_,line)(line,1,(any_arr){any_number(1)}),any_str("#")))  { //expected: "#else, #endif #end if"
                    //words = line.split(' ')
                    words = METHOD(split_,line)(line,1,(any_arr){any_str(" ")});
                    //switch words.tryGet(0)
                    any _switch1=METHOD(tryGet_,words)(words,1,(any_arr){any_number(0)});
                        //case '#else':
                    if (__is(_switch1,any_str("#else"))){
                            //.replaceSourceLine .line.replaceAll("#else","//else")
                            METHOD(replaceSourceLine_,this)(this,1,(any_arr){__call(replaceAll_,PROP(line_,this),2,(any_arr){any_str("#else"), any_str("//else")})});
                            //defValue = not defValue
                            defValue = any_number(!(_anyToBool(defValue)));
                    
                    }
                        //case "#end":
                    else if (__is(_switch1,any_str("#end"))){
                            //if words.tryGet(1) isnt 'if', .throwErr "expected '#end if', read '#{line}' #{startRef}"
                            if (!__is(METHOD(tryGet_,words)(words,1,(any_arr){any_number(1)}),any_str("if"))) {METHOD(throwErr_,this)(this,1,(any_arr){_concatAny(4,any_str("expected '#end if', read '"), line, any_str("' "), startRef)});};
                            //endFound = true
                            endFound = true;
                    
                    }
                        //case "#endif":
                    else if (__is(_switch1,any_str("#endif"))){
                            //endFound = true
                            endFound = true;
                    
                    }
                    else {
                        //default
                            //.throwErr "expected '#else/#end if', read '#{line}' #{startRef}"
                            METHOD(throwErr_,this)(this,1,(any_arr){_concatAny(4,any_str("expected '#else/#end if', read '"), line, any_str("' "), startRef)});
                    };
                    //end switch
                    
                }
                //else
                
                else {
                    //// comment line if .compilerVar not defined (or processing #else)
                    //if not defValue, .replaceSourceLine "#{String.spaces(indent)}//#{line}"
                    if (!(_anyToBool(defValue))) {METHOD(replaceSourceLine_,this)(this,1,(any_arr){_concatAny(3,String_spaces(undefined,1,(any_arr){indent}), any_str("//"), line)});};
                };
                //end if
                
            };
            //end if              
            
        } while (!_anyToBool(endFound));// end loop
        //loop until endFound
        //.replaceSourceLine .line.replaceAll("#end","//end")
        METHOD(replaceSourceLine_,this)(this,1,(any_arr){__call(replaceAll_,PROP(line_,this),2,(any_arr){any_str("#end"), any_str("//end")})});
        //#rewind position after #ifdef, reprocess lines
        //.sourceLineNum = startSourceLine -1 
        PROP(sourceLineNum_,this) = any_number(_anyToNumber(startSourceLine) - 1);
        //return true #OK, lines processed
        return true;// #OK, lines processed
     return undefined;
     }
//----------------------------
//Methods getPos() and setPos() are used to save and restore a specific lexer position in code
//When a AST node parse() fails, the lexer position is rewound to try another AST class
//#### method getPos() returns LexerPos
     any Parser_Lexer_getPos(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Parser_Lexer));
        //---------
        //#return {lineInx:.lineInx, index:.index, sourceLineNum:.sourceLineNum, token:.token, last:.last}
        //return new LexerPos(this)
        return new(Parser_LexerPos,1,(any_arr){this});
     return undefined;
     }
//----------------------------
//#### method setPos(pos:LexerPos)
     any Parser_Lexer_setPos(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Parser_Lexer));
        //---------
        // define named params
        var pos= argc? arguments[0] : undefined;
        //---------
        //.lineInx = pos.lineInx
        PROP(lineInx_,this) = PROP(lineInx_,pos);
        //if .lineInx>=0 and .lineInx<.infoLines.length
        if (_anyToNumber(PROP(lineInx_,this)) >= 0 && _anyToNumber(PROP(lineInx_,this)) < _length(PROP(infoLines_,this)))  {
            //.infoLine = .infoLines[.lineInx]
            PROP(infoLine_,this) = ITEM(_anyToNumber(PROP(lineInx_,this)),PROP(infoLines_,this));
            //.indent = .infoLine.indent
            PROP(indent_,this) = PROP(indent_,PROP(infoLine_,this));
        }
        //else
        
        else {
            //.infoLine = null
            PROP(infoLine_,this) = null;
            //.indent = 0
            PROP(indent_,this) = any_number(0);
        };
        //.index = pos.index
        PROP(index_,this) = PROP(index_,pos);
        //.sourceLineNum = pos.sourceLineNum
        PROP(sourceLineNum_,this) = PROP(sourceLineNum_,pos);
        //.token = pos.token
        PROP(token_,this) = PROP(token_,pos);
        //.last = pos.last
        PROP(last_,this) = PROP(last_,pos);
     return undefined;
     }
//#### helper method posToString()
     any Parser_Lexer_posToString(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Parser_Lexer));
        //---------
//Create a full string with last position. Useful to inform errors
        //if .last, return .last.toString()
        if (_anyToBool(PROP(last_,this))) {return __call(toString_,PROP(last_,this),0,NULL);};
        //return .getPos().toString()
        return __call(toString_,METHOD(getPos_,this)(this,0,NULL),0,NULL);
     return undefined;
     }
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
     any Parser_Lexer_getPrevIndent(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Parser_Lexer));
        //---------
        //var inx = .lineInx-1
        var inx = any_number(_anyToNumber(PROP(lineInx_,this)) - 1);
        //while inx >=0
        while(_anyToNumber(inx) >= 0){
            //if .infoLines[inx].type is LineTypes.CODE
            if (__is(PROP(type_,ITEM(_anyToNumber(inx),PROP(infoLines_,this))),Parser_LineTypes_CODE))  {
                //return .infoLines[inx].indent
                return PROP(indent_,ITEM(_anyToNumber(inx),PROP(infoLines_,this)));
            };
            //inx -= 1
            inx.value.number -= 1;
        };// end loop
        //return 0
        return any_number(0);
     return undefined;
     }
//----------------------------------------------------
//This functions allows the parser to navigate lines and tokens
//of the lexer. It returns the next token, advancing the position variables.
//This method returns CODE tokens, "NEWLINE" tokens (on each new line) or the "EOF" token.
//All other tokens (COMMENT and WHITESPACE) are discarded.
//#### method consumeToken()
     any Parser_Lexer_consumeToken(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Parser_Lexer));
        //---------
//loop until a CODE token is found
        //while true
        while(_anyToBool(true)){
//loop until a valid CODE infoLine is selected
            //.token = null
            PROP(token_,this) = null;
            //while true
            while(_anyToBool(true)){
//if no line selected
                //if not .infoLine
                if (!(_anyToBool(PROP(infoLine_,this))))  {
                    //.index = -1
                    PROP(index_,this) = any_number(-1);
//get next CODE line
                    //if not .nextCODELine()
                    if (!(_anyToBool(METHOD(nextCODELine_,this)(this,0,NULL))))  {
//if no more CODE lines -> EOF
                        //.infoLine = new InfoLine(this, LineTypes.CODE, -1, '', .lineInx)
                        PROP(infoLine_,this) = new(Parser_InfoLine,5,(any_arr){this, Parser_LineTypes_CODE, any_number(-1), any_EMPTY_STR, PROP(lineInx_,this)});
                        //.token = new Token('EOF')
                        PROP(token_,this) = new(Parser_Token,1,(any_arr){any_str("EOF")});
                        //.infoLine.tokens = [.token]
                        PROP(tokens_,PROP(infoLine_,this)) = new(Array,1,(any_arr){PROP(token_,this)});
                        //.indent = -1
                        PROP(indent_,this) = any_number(-1);
                        //return
                        return undefined;
                    };
//since we moved to the next line, return "NEWLINE" token
                    //.sourceLineNum = .infoLine.sourceLineNum
                    PROP(sourceLineNum_,this) = PROP(sourceLineNum_,PROP(infoLine_,this));
                    //.indent = .infoLine.indent
                    PROP(indent_,this) = PROP(indent_,PROP(infoLine_,this));
                    //.token = new Token('NEWLINE')
                    PROP(token_,this) = new(Parser_Token,1,(any_arr){any_str("NEWLINE")});
                    //return
                    return undefined;
                };
//get next token in the line
                //if no .infoLine.tokens
                if (!_anyToBool(PROP(tokens_,PROP(infoLine_,this))))  {
                  //debugger
                  assert(0);
                };
                //.index += 1
                PROP(index_,this).value.number += 1;
                //if .index < .infoLine.tokens.length
                if (_anyToNumber(PROP(index_,this)) < _length(PROP(tokens_,PROP(infoLine_,this))))  {
                    //break #ok, a line with tokens
                    break;// #ok, a line with tokens
                };
//if there was no more tokens, set infoLine to null, 
//and continue (get the next line)
                //.infoLine = null
                PROP(infoLine_,this) = null;
            };// end loop
            //#end while
//Here we have a infoLine, where type is CODE
//Get the token
            //.token = .infoLine.tokens[.index]
            PROP(token_,this) = ITEM(_anyToNumber(PROP(index_,this)),PROP(tokens_,PROP(infoLine_,this)));
//if the token is a COMMENT, discard it, 
//by continuing the loop (get the next token)
            //if .token.type is 'COMMENT'
            if (__is(PROP(type_,PROP(token_,this)),any_str("COMMENT")))  {
                //continue #discard COMMENT
                continue;// #discard COMMENT
            }
//if it is not a COMMENT, break the loop
//returning the CODE Token in lexer.token
            //else
            
            else {
                //break #the loop, CODE token is in lexer.token
                break;// #the loop, CODE token is in lexer.token
            };
        };// end loop
        
     return undefined;
     }
        //#loop #try to get another
      //#end method consumeToken
//---------------------------------------------------------
//#### method nextToken()
     any Parser_Lexer_nextToken(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Parser_Lexer));
        //---------
//Save current pos, and get next token
        //.last = .getPos()
        PROP(last_,this) = METHOD(getPos_,this)(this,0,NULL);
        //.consumeToken()
        METHOD(consumeToken_,this)(this,0,NULL);
        //#debug
        //logger.debug ">>>ADVANCE", "#{.sourceLineNum}:#{.token.column or 0} [#{.index}]", .token.toString()
        logger_debug(undefined,3,(any_arr){any_str(">>>ADVANCE"), _concatAny(6,PROP(sourceLineNum_,this), any_str(":"), (_anyToBool(__or2=PROP(column_,PROP(token_,this)))? __or2 : any_number(0)), any_str(" ["), PROP(index_,this), any_str("]")), __call(toString_,PROP(token_,this),0,NULL)});
       // 
        //return true
        return true;
     return undefined;
     }
//-----------------------------------------------------
//#### method returnToken()
     any Parser_Lexer_returnToken(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Parser_Lexer));
        //---------
        //#restore last saved pos (rewind)
        //.setPos .last
        METHOD(setPos_,this)(this,1,(any_arr){PROP(last_,this)});
        //logger.debug '<< Returned:',.token.toString(),'line',.sourceLineNum 
        logger_debug(undefined,4,(any_arr){any_str("<< Returned:"), __call(toString_,PROP(token_,this),0,NULL), any_str("line"), PROP(sourceLineNum_,this)});
     return undefined;
     }
//-----------------------------------------------------
//This method gets the next line CODE from infoLines
//BLANK and COMMENT lines are skipped.
//return true if a CODE Line is found, false otherwise
//#### method nextCODELine()
     any Parser_Lexer_nextCODELine(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Parser_Lexer));
        //---------
        //if .lineInx >= .infoLines.length
        if (_anyToNumber(PROP(lineInx_,this)) >= _length(PROP(infoLines_,this)))  {
            //return false # no more lines
            return false;// # no more lines
        };
//loop until a CODE line is found
        //while true
        while(_anyToBool(true)){
            //.lineInx += 1
            PROP(lineInx_,this).value.number += 1;
            //if .lineInx >= .infoLines.length
            if (_anyToNumber(PROP(lineInx_,this)) >= _length(PROP(infoLines_,this)))  {
                //return false # no more lines
                return false;// # no more lines
            };
//Get line
            //.infoLine = .infoLines[.lineInx]
            PROP(infoLine_,this) = ITEM(_anyToNumber(PROP(lineInx_,this)),PROP(infoLines_,this));
//if it is a CODE line, store in lexer.sourceLineNum, and return true (ok)
            //if .infoLine.type is LineTypes.CODE
            if (__is(PROP(type_,PROP(infoLine_,this)),Parser_LineTypes_CODE))  {
                //.sourceLineNum = .infoLine.sourceLineNum
                PROP(sourceLineNum_,this) = PROP(sourceLineNum_,PROP(infoLine_,this));
                //.indent = .infoLine.indent
                PROP(indent_,this) = PROP(indent_,PROP(infoLine_,this));
                //.index = -1
                PROP(index_,this) = any_number(-1);
                //return true #ok nextCODEline found
                return true;// #ok nextCODEline found
            };
        };// end loop
        
     return undefined;
     }
        //#end while
      //#end method
//#### method say()
     any Parser_Lexer_say(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Parser_Lexer));
        //---------
//**say** emit error (but continue compiling)
        //logger.error.apply this,arguments
        __applyArr(any_func(logger_error),this,_newArray(argc,arguments));
     return undefined;
     }
//#### method throwErr(msg)
     any Parser_Lexer_throwErr(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Parser_Lexer));
        //---------
        // define named params
        var msg= argc? arguments[0] : undefined;
        //---------
//**throwErr** add lexer position and emit error (abort compilation)
        //logger.throwControlled "#{.posToString()} #{msg}"
        logger_throwControlled(undefined,1,(any_arr){_concatAny(3,METHOD(posToString_,this)(this,0,NULL), any_str(" "), msg)});
     return undefined;
     }
//#### method sayErr(msg)
     any Parser_Lexer_sayErr(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Parser_Lexer));
        //---------
        // define named params
        var msg= argc? arguments[0] : undefined;
        //---------
//**sayErr** add lexer position and emit error (but continue compiling)
        //logger.error .posToString(),msg
        logger_error(undefined,2,(any_arr){METHOD(posToString_,this)(this,0,NULL), msg});
     return undefined;
     }
//#### method warn(msg)
     any Parser_Lexer_warn(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Parser_Lexer));
        //---------
        // define named params
        var msg= argc? arguments[0] : undefined;
        //---------
//**warn** add lexer position and emit warning (continue compiling)
        //logger.warning .posToString(),msg
        logger_warning(undefined,2,(any_arr){METHOD(posToString_,this)(this,0,NULL), msg});
     return undefined;
     }
//#### method splitExpressions(text:string) returns array of string
     any Parser_Lexer_splitExpressions(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Parser_Lexer));
        //---------
        // define named params
        var text= argc? arguments[0] : undefined;
        //---------
//split on #{expresion} using lexer.stringInterpolationChar
        //var delimiter = .stringInterpolationChar
        var delimiter = PROP(stringInterpolationChar_,this);
//look for #{expression} inside a quoted string
//split expressions
        //if no text then return []
        if (!_anyToBool(text)) {return new(Array,0,NULL);};
        ////get quotes
        //var quotes = text.charAt(0)
        var quotes = METHOD(charAt_,text)(text,1,(any_arr){any_number(0)});
        //if quotes isnt '"' and quotes isnt "'"
        if (!__is(quotes,any_str("\"")) && !__is(quotes,any_str("'")))  {
            //.throwErr 'splitExpressions: expected text to be a quoted string, quotes included'
            METHOD(throwErr_,this)(this,1,(any_arr){any_str("splitExpressions: expected text to be a quoted string, quotes included")});
        };
        //var delimiterPos, closerPos, itemPos, item:string;
        var delimiterPos = undefined, closerPos = undefined, itemPos = undefined, item = undefined;
        //var items=[];
        var items = new(Array,0,NULL);
        ////clear start and end quotes
        //var s:string = text.slice(1,-1)
        var s = METHOD(slice_,text)(text,2,(any_arr){any_number(1), any_number(-1)});
        //var lastDelimiterPos=0;
        var lastDelimiterPos = any_number(0);
       // 
        //do
        while(TRUE){
            //delimiterPos = s.indexOf("#{delimiter}{",lastDelimiterPos);
            delimiterPos = METHOD(indexOf_,s)(s,2,(any_arr){_concatAny(2,delimiter, any_str("{")), lastDelimiterPos});
            //if delimiterPos<0 then break
            if (_anyToNumber(delimiterPos) < 0) {break;};
            //// first part - text upto first delimiter
            //pushAt items, s.slice(lastDelimiterPos,delimiterPos),quotes 
            Parser_pushAt(undefined,3,(any_arr){items, METHOD(slice_,s)(s,2,(any_arr){lastDelimiterPos, delimiterPos}), quotes});
           // 
            //var start = delimiterPos + 1
            var start = any_number(_anyToNumber(delimiterPos) + 1);
            //closerPos = String.findMatchingPair(s,start,"}")
            closerPos = String_findMatchingPair(undefined,3,(any_arr){s, start, any_str("}")});
            //if closerPos<0
            if (_anyToNumber(closerPos) < 0)  {
                //.throwErr "unmatched '#{delimiter}{' at string: #{text}"
                METHOD(throwErr_,this)(this,1,(any_arr){_concatAny(4,any_str("unmatched '"), delimiter, any_str("{' at string: "), text)});
            };
          // 
            //item = s.slice(start+1, closerPos);
            item = METHOD(slice_,s)(s,2,(any_arr){any_number(_anyToNumber(start) + 1), closerPos});
            //// add parens if expression
            //var p = PMREX.whileRanges(item,0,"A-Za-z0-9_$.")
            var p = PMREX_whileRanges(undefined,3,(any_arr){item, any_number(0), any_str("A-Za-z0-9_$.")});
            //if p<item.length then item = '(#{item})';
            if (_anyToNumber(p) < _length(item)) {item = _concatAny(3,any_str("("), item, any_str(")"));};
            //lastDelimiterPos = closerPos + 1
            lastDelimiterPos = any_number(_anyToNumber(closerPos) + 1);
            //pushAt items, item //push expression
            Parser_pushAt(undefined,2,(any_arr){items, item}); //push expression
        };// end loop
        //loop
        //// remainder
        //pushAt items, s.slice(lastDelimiterPos),quotes
        Parser_pushAt(undefined,3,(any_arr){items, METHOD(slice_,s)(s,1,(any_arr){lastDelimiterPos}), quotes});
        //return items
        return items;
     return undefined;
     }
    

//--------------
    // Parser_Token
    any Parser_Token; //Class Parser_Token
     // 
//### end class Lexer
    //// helper internal function
    //helper function pushAt(arr:array, content:string, useQuotes)
        //if content
            //if useQuotes, content = content.quoted(useQuotes)
            //arr.push content
//----------------------
//The Token Class
//===============
//Each token instance has:
//-a "type" e.g.: NEWLINE,EOF, when the token is a special char
//-a "value": the parsed text
//-the column in the source line in which the token appears
    //class Token
   // 
        //properties
          //type:string
          //value:string
          //column
        ;
        //constructor(type, tokenText, column)
        void Parser_Token__init(DEFAULT_ARGUMENTS){
            
            // define named params
            var type, tokenText, column;
            type=tokenText=column=undefined;
            switch(argc){
              case 3:column=arguments[2];
              case 2:tokenText=arguments[1];
              case 1:type=arguments[0];
            }
            //---------
            //.type = type 
            PROP(type_,this) = type;
            //.value = tokenText or ' ' # no text is represened by ' ', since '' is "falsey" in js
            PROP(value_,this) = (_anyToBool(__or3=tokenText)? __or3 : any_str(" "));// # no text is represened by ' ', since '' is "falsey" in js
            //.column = column
            PROP(column_,this) = column;
        }
       // 
        //method toString()
        any Parser_Token_toString(DEFAULT_ARGUMENTS){
            assert(_instanceof(this,Parser_Token));
            //---------
            //return "'#{.value}'(#{.type})"
            return _concatAny(5,any_str("'"), PROP(value_,this), any_str("'("), PROP(type_,this), any_str(")"));
        return undefined;
        }
    

//--------------
    // Parser_InfoLine
    any Parser_InfoLine; //Class Parser_InfoLine
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
   // 
      //properties
          //type
          //indent,sourceLineNum
          //text:String
          //tokens: Token array
      ;
      //constructor new InfoLine(lexer,type,indent,text,sourceLineNum)
      void Parser_InfoLine__init(DEFAULT_ARGUMENTS){
        
        // define named params
        var lexer, type, indent, text, sourceLineNum;
        lexer=type=indent=text=sourceLineNum=undefined;
        switch(argc){
          case 5:sourceLineNum=arguments[4];
          case 4:text=arguments[3];
          case 3:indent=arguments[2];
          case 2:type=arguments[1];
          case 1:lexer=arguments[0];
        }
        //---------
        //.type = type
        PROP(type_,this) = type;
        //.indent = indent
        PROP(indent_,this) = indent;
        //.text = text
        PROP(text_,this) = text;
        //.sourceLineNum = sourceLineNum
        PROP(sourceLineNum_,this) = sourceLineNum;
      }
        //#.dump() #debug info
      //#end InfoLine constructor
            // 
      //method dump() # out debug info
      any Parser_InfoLine_dump(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Parser_InfoLine));
        //---------
        //if .type is LineTypes.BLANK
        if (__is(PROP(type_,this),Parser_LineTypes_BLANK))  {
          //logger.debug .sourceLineNum,"(BLANK)"
          logger_debug(undefined,2,(any_arr){PROP(sourceLineNum_,this), any_str("(BLANK)")});
          //return
          return undefined;
        };
        //var type = ""
        var type = any_EMPTY_STR;
        //if .type is LineTypes.COMMENT
        if (__is(PROP(type_,this),Parser_LineTypes_COMMENT))  {
          //type="COMMENT"
          type = any_str("COMMENT");
        }
        //else if .type is LineTypes.CODE
        
        else if (__is(PROP(type_,this),Parser_LineTypes_CODE))  {
          //type="CODE"
          type = any_str("CODE");
        };
       // 
        //logger.debug .sourceLineNum, "#{.indent}(#{type})", .text
        logger_debug(undefined,3,(any_arr){PROP(sourceLineNum_,this), _concatAny(4,PROP(indent_,this), any_str("("), type, any_str(")")), PROP(text_,this)});
        //if .tokens
        if (_anyToBool(PROP(tokens_,this)))  {
            //logger.debug('   ',.tokens.join(' '))
            logger_debug(undefined,2,(any_arr){any_str("   "), __call(join_,PROP(tokens_,this),1,(any_arr){any_str(" ")})});
            //logger.debug()
            logger_debug(undefined,0,NULL);
        };
      return undefined;
      }
//The Tokenize Line method
//------------------------
//The Infoline.tokenizeLine() method, creates the 'tokens' array by parsing the .text 
//It also replaces *Embdeded Expressions* #{} in string constants, storing the expression tokens
      //method tokenizeLine(lexer)
      any Parser_InfoLine_tokenizeLine(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Parser_InfoLine));
        //---------
        // define named params
        var lexer= argc? arguments[0] : undefined;
        //---------
        //var code = .text
        var code = PROP(text_,this);
       // 
        //var words=[]
        var words = new(Array,0,NULL);
        //var result=[]
        var result = new(Array,0,NULL);
        //var colInx = 0
        var colInx = any_number(0);
        //#debug
        //var msg = ""
        var msg = any_EMPTY_STR;
        //while colInx < code.length
        while(_anyToNumber(colInx) < _length(code)){
            //var chunk = code.slice(colInx)
            var chunk = METHOD(slice_,code)(code,1,(any_arr){colInx});
//This for loop will try each regular expression in `tokenPatterns` 
//against the current head of the code line until one matches.
            //var token = .recognizeToken(chunk)
            var token = METHOD(recognizeToken_,this)(this,1,(any_arr){chunk});
//If there was no match, this is a bad token and we will abort compilation here.
            //if no token
            if (!_anyToBool(token))  {
                //// calc position from line info (we're at post-lexexr)
                //msg = "(#{lexer.filename}:#{.sourceLineNum}:#{colInx+1}) Tokenize patterns: invalid token: #{chunk}"
                msg = _concatAny(8,any_str("("), PROP(filename_,lexer), any_str(":"), PROP(sourceLineNum_,this), any_str(":"), any_number(_anyToNumber(colInx) + 1), any_str(") Tokenize patterns: invalid token: "), chunk);
                //logger.error msg 
                logger_error(undefined,1,(any_arr){msg});
                //var errPosString=''
                var errPosString = any_EMPTY_STR;
                //while errPosString.length<colInx
                while(_length(errPosString) < _anyToNumber(colInx)){
                    //errPosString='#{errPosString} '
                    errPosString = _concatAny(2,errPosString, any_str(" "));
                };// end loop
                //logger.error code
                logger_error(undefined,1,(any_arr){code});
                //logger.error '#{errPosString}^'
                logger_error(undefined,1,(any_arr){_concatAny(2,errPosString, any_str("^"))});
                //logger.throwControlled "parsing tokens"
                logger_throwControlled(undefined,1,(any_arr){any_str("parsing tokens")});
            };
            //end if
            
//If its 'WHITESPACE' we ignore it. 
            //if token.type is 'WHITESPACE'
            if (__is(PROP(type_,token),any_str("WHITESPACE")))  {
                //do nothing #ignore it
                //do nothing
                ;// #ignore it
            }
            //else
            
            else {
//set token column
                //token.column = .indent + colInx + 1 
                PROP(column_,token) = any_number(_anyToNumber(PROP(indent_,this)) + _anyToNumber(colInx) + 1);
//store value in a temp array to parse special lexer options
                //words.push(token.value)
                METHOD(push_,words)(words,1,(any_arr){PROP(value_,token)});
//If its a string constant, and it has `#{`|`${`, process the **Interpolated Expressions**.
                //if token.type is 'STRING' and token.value.length>3 and "#{lexer.stringInterpolationChar}{" in token.value
                if (__is(PROP(type_,token),any_str("STRING")) && _length(PROP(value_,token)) > 3 && CALL1(indexOf_,PROP(value_,token),_concatAny(2,PROP(stringInterpolationChar_,lexer), any_str("{"))).value.number>=0)  {
                    //declare parsed:Array
                    
                    //#parse the quoted string, splitting at #{...}, return array 
                    //var parsed = lexer.splitExpressions(token.value)
                    var parsed = METHOD(splitExpressions_,lexer)(lexer,1,(any_arr){PROP(value_,token)});
//For C generation, replace string interpolation
//with a call to core function "concat"
                ////ifdef PROD_C
                   // 
                    //// code a litescript call to "_concatAny" to handle string interpolation
                    //// (the producer will add argc)
                    //var composed = new InfoLine(lexer, LineTypes.CODE, token.column, 
                    var composed = new(Parser_InfoLine,5,(any_arr){lexer, Parser_LineTypes_CODE, PROP(column_,token), _concatAny(3,any_str("_concatAny("), METHOD(join_,parsed)(parsed,1,(any_arr){any_str(",")}), any_str(")")), PROP(sourceLineNum_,this)});
                        //"_concatAny(#{parsed.join(',')})", .sourceLineNum  )
                ////else //-> JavaScript
                    //////if the first expression isnt a quoted string constant
                    ////// we add `"" + ` so: we get string concatenation from javascript.
                    ////// Also: if the first expression starts with `(`, LiteScript can
                    ////// mis-parse the expression as a "function call"
                    ////if parsed.length and parsed[0][0] isnt match[0] //match[0] is the quote: ' or "
                        ////parsed.unshift "''" // prepend ''
                    //////join expressions using +, so we have a valid js composed expression, evaluating to a string.
                    ////var composed = new InfoLine(lexer, LineTypes.CODE, token.column, parsed.join(' + '), .sourceLineNum  )
                ////end if
                    //#Now we 'tokenize' the new composed expression
                    //composed.tokenizeLine(lexer) #recurse
                    METHOD(tokenizeLine_,composed)(composed,1,(any_arr){lexer});// #recurse
                    //#And we append the new tokens instead of the original string constant
                    //result = result.concat( composed.tokens )
                    result = METHOD(concat_,result)(result,1,(any_arr){PROP(tokens_,composed)});
                }
                //else
                
                else {
//Else it's a single token. Add the token to result array
                    ////ifndef NDEBUG
                    //msg = "#{msg}#{token.toString()}"
                    msg = _concatAny(2,msg, METHOD(toString_,token)(token,0,NULL));
                    ////endif
                    //result.push(token)
                    METHOD(push_,result)(result,1,(any_arr){token});
                };
                //end if
                
            };
            //end if WITHESPACE
            
//Advance col index into code line
            //colInx += token.value.length
            colInx.value.number += _length(PROP(value_,token));
        };// end loop
        //end while text in the line
        
        //#debug
        //#debug msg
//Store tokenize result in .tokens
        //.tokens = result
        PROP(tokens_,this) = result;
//Special lexer options: string interpolation char
//`lexer options string interpolation char [is] (IDENTIFIER|PUCT|STRING)`
//`lexer options literal (map|object)`
        //if words.tryGet(0) is 'lexer' and words.tryGet(1) is 'options'
        if (__is(METHOD(tryGet_,words)(words,1,(any_arr){any_number(0)}),any_str("lexer")) && __is(METHOD(tryGet_,words)(words,1,(any_arr){any_number(1)}),any_str("options")))  {
            //.type = LineTypes.COMMENT # is a COMMENT line
            PROP(type_,this) = Parser_LineTypes_COMMENT;// # is a COMMENT line
            //if words.slice(2,5).join(" ") is "string interpolation char" 
            if (__is(__call(join_,METHOD(slice_,words)(words,2,(any_arr){any_number(2), any_number(5)}),1,(any_arr){any_str(" ")}),any_str("string interpolation char")))  {
                //var ch:string
                var ch = undefined;
                //if words.tryGet(5) into ch is 'is' then ch = words.tryGet(6) #get it (skip optional 'is')
                if (__is((ch=METHOD(tryGet_,words)(words,1,(any_arr){any_number(5)})),any_str("is"))) {ch = METHOD(tryGet_,words)(words,1,(any_arr){any_number(6)});};
                //if ch.charAt(0) in ['"',"'"], ch = ch.slice(1,-1) #optionally quoted, remove quotes
                if (__in(METHOD(charAt_,ch)(ch,1,(any_arr){any_number(0)}),2,(any_arr){any_str("\""), any_str("'")})) {ch = METHOD(slice_,ch)(ch,2,(any_arr){any_number(1), any_number(-1)});};
                //if no ch then fail with "missing string interpolation char"  #check
                if (!_anyToBool(ch)) {throw(new(Error,1,(any_arr){any_str("missing string interpolation char")}));;};
                //lexer.stringInterpolationChar = ch
                PROP(stringInterpolationChar_,lexer) = ch;
            }
           // 
            //else if words.tryGet(2) is "literal"
            
            else if (__is(METHOD(tryGet_,words)(words,1,(any_arr){any_number(2)}),any_str("literal")))  {
                  //switch words.tryGet(3)
                  any _switch2=METHOD(tryGet_,words)(words,1,(any_arr){any_number(3)});
                      //case "map":
                  if (__is(_switch2,any_str("map"))){
                          //lexer.options.literalMap = true                          
                          PROP(literalMap_,PROP(options_,lexer)) = true;
                  
                  }
                      //case "object":
                  else if (__is(_switch2,any_str("object"))){
                          //lexer.options.literalMap = false
                          PROP(literalMap_,PROP(options_,lexer)) = false;
                  
                  }
                  else {
                      //default:
                          //fail with "Lexer options, expected: 'literal map'|'literal object'"
                          throw(new(Error,1,(any_arr){any_str("Lexer options, expected: 'literal map'|'literal object'")}));;
                  };
            }
            //else 
            
            else {
              //fail with "Lexer options, expected: (string interpolation|literal)"
              throw(new(Error,1,(any_arr){any_str("Lexer options, expected: (string interpolation|literal)")}));;
            };
        };
      return undefined;
      }
      //end tokenizeLine
      
//The recognize method
//--------------------
//The Infoline.recognize() method matches the current position in the text stream
//with the known tokens, returning a new Token or undefined
      //method recognizeToken(chunk:string) returns Token // or undefined
      any Parser_InfoLine_recognizeToken(DEFAULT_ARGUMENTS){
            assert(_instanceof(this,Parser_InfoLine));
            //---------
            // define named params
            var chunk= argc? arguments[0] : undefined;
            //---------
//Comment lines, start with # or //
            //if chunk.startsWith('#') or chunk.startsWith('//')
            if (_anyToBool((_anyToBool(__or4=METHOD(startsWith_,chunk)(chunk,1,(any_arr){any_str("#")}))? __or4 : METHOD(startsWith_,chunk)(chunk,1,(any_arr){any_str("//")}))))  {
                //return new Token('COMMENT',chunk)
                return new(Parser_Token,2,(any_arr){any_str("COMMENT"), chunk});
            };
//Punctuation: 
//We include also here punctuation symbols (like `,` `[` `:`)  and the arrow `->`
//Postfix and prefix ++ and -- are considered also 'PUNCT'.
//They're not considered 'operators' since they do no introduce a new operand, ++ and -- are "modifiers" for a variable reference.
  //['PUNCT',/^(\+\+|--|->)/],
  //['PUNCT',/^[\(\)\[\]\;\,\.\{\}]/],
            //if chunk.charAt(0) in "()[]{};,." 
            if (CALL1(indexOf_,any_str("()[]{};,."),METHOD(charAt_,chunk)(chunk,1,(any_arr){any_number(0)})).value.number>=0)  {
                //return new Token('PUNCT',chunk.slice(0,1))
                return new(Parser_Token,2,(any_arr){any_str("PUNCT"), METHOD(slice_,chunk)(chunk,2,(any_arr){any_number(0), any_number(1)})});
            };
            //if chunk.slice(0,2) in ["++","--","->"]
            if (__in(METHOD(slice_,chunk)(chunk,2,(any_arr){any_number(0), any_number(2)}),3,(any_arr){any_str("++"), any_str("--"), any_str("->")}))  {
                //return new Token('PUNCT',chunk.slice(0,2))
                return new(Parser_Token,2,(any_arr){any_str("PUNCT"), METHOD(slice_,chunk)(chunk,2,(any_arr){any_number(0), any_number(2)})});
            };
//Whitespace is discarded by the lexer, but needs to exist to break up other tokens.
//We recognize ' .' (space+dot) to be able to recognize: 'myFunc .x' as alias to: 'myFunc this.x'
//We recognize ' [' (space+bracket) to be able to diferntiate: 'myFunc [x]' and 'myFunc[x]'
  //['SPACE_DOT',/^\s+\./],
  //['SPACE_BRACKET',/^\s+\[/],
  //['WHITESPACE',/^[\f\r\t\v\u00A0\u2028\u2029 ]+/],
            //if chunk.startsWith(" .")
            if (_anyToBool(METHOD(startsWith_,chunk)(chunk,1,(any_arr){any_str(" .")})))  {
                //return new Token('SPACE_DOT',chunk.slice(0,2))
                return new(Parser_Token,2,(any_arr){any_str("SPACE_DOT"), METHOD(slice_,chunk)(chunk,2,(any_arr){any_number(0), any_number(2)})});
            };
            //if chunk.startsWith(" [")
            if (_anyToBool(METHOD(startsWith_,chunk)(chunk,1,(any_arr){any_str(" [")})))  {
                //return new Token('SPACE_BRACKET',chunk.slice(0,2))
                return new(Parser_Token,2,(any_arr){any_str("SPACE_BRACKET"), METHOD(slice_,chunk)(chunk,2,(any_arr){any_number(0), any_number(2)})});
            };
            //if PMREX.whileRanges(chunk,0," \t\r") into var whiteSpaceLength
            var whiteSpaceLength=undefined;
            if (_anyToBool((whiteSpaceLength=PMREX_whileRanges(undefined,3,(any_arr){chunk, any_number(0), any_str(" \t\r")}))))  {
                //if chunk.charAt(whiteSpaceLength) in '.[', whiteSpaceLength-- //allow recognition of SPACE_DOT and SPACE_BRACKET
                if (CALL1(indexOf_,any_str(".["),METHOD(charAt_,chunk)(chunk,1,(any_arr){whiteSpaceLength})).value.number>=0) {whiteSpaceLength.value.number--;};
                //return new Token('WHITESPACE',chunk.slice(0,whiteSpaceLength))
                return new(Parser_Token,2,(any_arr){any_str("WHITESPACE"), METHOD(slice_,chunk)(chunk,2,(any_arr){any_number(0), whiteSpaceLength})});
            };
//Strings can be either single or double quoted.
  //['STRING', /^'(?:[^'\\]|\\.)*'/],
  //['STRING', /^"(?:[^"\\]|\\.)*"/],
            //if chunk.startsWith("'") or chunk.startsWith('"') 
            if (_anyToBool((_anyToBool(__or5=METHOD(startsWith_,chunk)(chunk,1,(any_arr){any_str("'")}))? __or5 : METHOD(startsWith_,chunk)(chunk,1,(any_arr){any_str("\"")}))))  {
                //if PMREX.findMatchingQuote(chunk,0) into var quotedCount is -1, fail with "unclosed quoted string"
                var quotedCount=undefined;
                if (__is((quotedCount=PMREX_findMatchingQuote(undefined,2,(any_arr){chunk, any_number(0)})),any_number(-1))) {throw(new(Error,1,(any_arr){any_str("unclosed quoted string")}));;};
                //return new Token('STRING',chunk.slice(0,quotedCount))
                return new(Parser_Token,2,(any_arr){any_str("STRING"), METHOD(slice_,chunk)(chunk,2,(any_arr){any_number(0), quotedCount})});
            };
//ASSIGN are symbols triggering the assignment statements.
//In LiteScript, assignment is a *statement* not a *expression*
  //['ASSIGN',/^=/],
  //['ASSIGN',/^[\+\-\*\/\&]=/ ], # = += -= *= /= &=
            //if chunk.startsWith("=")
            if (_anyToBool(METHOD(startsWith_,chunk)(chunk,1,(any_arr){any_str("=")})))  {
                //return new Token('ASSIGN',chunk.slice(0,1))
                return new(Parser_Token,2,(any_arr){any_str("ASSIGN"), METHOD(slice_,chunk)(chunk,2,(any_arr){any_number(0), any_number(1)})});
            };
            //if chunk.charAt(0) in "+-*/&" and chunk.charAt(1) is "=" 
            if (CALL1(indexOf_,any_str("+-*/&"),METHOD(charAt_,chunk)(chunk,1,(any_arr){any_number(0)})).value.number>=0 && __is(METHOD(charAt_,chunk)(chunk,1,(any_arr){any_number(1)}),any_str("=")))  {
                //return new Token('ASSIGN',chunk.slice(0,2))
                return new(Parser_Token,2,(any_arr){any_str("ASSIGN"), METHOD(slice_,chunk)(chunk,2,(any_arr){any_number(0), any_number(2)})});
            };
//Regex tokens are regular expressions. The javascript producer, just passes the raw regex to JavaScript.
  //['REGEX', /^(\/(?![\s=])[^[\/\n\\]*(?:(?:\\[\s\S]|\[[^\]\n\\]*(?:\\[\s\S][^\]\n\\]*)*])[^[\/\n\\]*)*\/)([imgy]{0,4})(?!\w)/],
            //if chunk.startsWith('/') 
            if (_anyToBool(METHOD(startsWith_,chunk)(chunk,1,(any_arr){any_str("/")})))  {
                //if PMREX.whileUnescaped(chunk,1,"/") into var endRegexp is -1, fail with "unclosed literal RegExp expression"
                var endRegexp=undefined;
                if (__is((endRegexp=PMREX_whileUnescaped(undefined,3,(any_arr){chunk, any_number(1), any_str("/")})),any_number(-1))) {throw(new(Error,1,(any_arr){any_str("unclosed literal RegExp expression")}));;};
                //return new Token('REGEX',chunk.slice(0,endRegexp))
                return new(Parser_Token,2,(any_arr){any_str("REGEX"), METHOD(slice_,chunk)(chunk,2,(any_arr){any_number(0), endRegexp})});
            };
//A "Unary Operator" is a symbol that precedes and transform *one* operand.
//A "Binary Operator" is a  symbol or a word (like `>=` or `+` or `and`), 
//that sits between *two* operands in a `Expressions`. 
  //['OPER', /^(\*|\/|\%|\+|-|<>|>=|<=|>>|<<|>|<|!==|\&|\~|\^|\|)/],
  //['OPER', /^[\?\:]/],
            //if chunk.slice(0,3) is '!=='
            if (__is(METHOD(slice_,chunk)(chunk,2,(any_arr){any_number(0), any_number(3)}),any_str("!==")))  {
                //return new Token('OPER',chunk.slice(0,3))
                return new(Parser_Token,2,(any_arr){any_str("OPER"), METHOD(slice_,chunk)(chunk,2,(any_arr){any_number(0), any_number(3)})});
            };
            //if "|#{chunk.slice(0,2)}|" in "|<>|>=|<=|>>|<<|!=|"
            if (CALL1(indexOf_,any_str("|<>|>=|<=|>>|<<|!=|"),_concatAny(3,any_str("|"), METHOD(slice_,chunk)(chunk,2,(any_arr){any_number(0), any_number(2)}), any_str("|"))).value.number>=0)  {
                //return new Token('OPER',chunk.slice(0,2))
                return new(Parser_Token,2,(any_arr){any_str("OPER"), METHOD(slice_,chunk)(chunk,2,(any_arr){any_number(0), any_number(2)})});
            };
            //if chunk.charAt(0) in "><+-*/%&~^|?:" 
            if (CALL1(indexOf_,any_str("><+-*/%&~^|?:"),METHOD(charAt_,chunk)(chunk,1,(any_arr){any_number(0)})).value.number>=0)  {
                //return new Token('OPER',chunk.slice(0,1))
                return new(Parser_Token,2,(any_arr){any_str("OPER"), METHOD(slice_,chunk)(chunk,2,(any_arr){any_number(0), any_number(1)})});
            };
//**Numbers** can be either in hex format (like `0xa5b`) or decimal/scientific format (`10`, `3.14159`, or `10.02e23`).
//As in js, all numbers are floating point.
  //['NUMBER',/^0x[a-f0-9]+/i ],
  //['NUMBER',/^[0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?/i],
            //if chunk.startsWith('0x')
            if (_anyToBool(METHOD(startsWith_,chunk)(chunk,1,(any_arr){any_str("0x")})))  {
                //return new Token('NUMBER',chunk.slice(0, PMREX.whileRanges(chunk,2,"a-fA-F0-9")))
                return new(Parser_Token,2,(any_arr){any_str("NUMBER"), METHOD(slice_,chunk)(chunk,2,(any_arr){any_number(0), PMREX_whileRanges(undefined,3,(any_arr){chunk, any_number(2), any_str("a-fA-F0-9")})})});
            };
   // 
            //if PMREX.whileRanges(chunk,0,"0-9") into var numberDigits
            var numberDigits=undefined;
            if (_anyToBool((numberDigits=PMREX_whileRanges(undefined,3,(any_arr){chunk, any_number(0), any_str("0-9")}))))  {
                //if chunk.charAt(numberDigits) is '.', numberDigits = PMREX.whileRanges(chunk,numberDigits+1,"0-9")
                if (__is(METHOD(charAt_,chunk)(chunk,1,(any_arr){numberDigits}),any_str("."))) {numberDigits = PMREX_whileRanges(undefined,3,(any_arr){chunk, any_number(_anyToNumber(numberDigits) + 1), any_str("0-9")});};
                //if chunk.charAt(numberDigits) is 'e', numberDigits = PMREX.whileRanges(chunk,numberDigits+1,"0-9")
                if (__is(METHOD(charAt_,chunk)(chunk,1,(any_arr){numberDigits}),any_str("e"))) {numberDigits = PMREX_whileRanges(undefined,3,(any_arr){chunk, any_number(_anyToNumber(numberDigits) + 1), any_str("0-9")});};
                //return new Token('NUMBER',chunk.slice(0, numberDigits))
                return new(Parser_Token,2,(any_arr){any_str("NUMBER"), METHOD(slice_,chunk)(chunk,2,(any_arr){any_number(0), numberDigits})});
            };
//Identifiers (generally variable names), must start with a letter, `$`, or underscore.
//Subsequent characters can also be numbers. Unicode characters are supported in variable names.
//Identifier-like OPERs, as: 'and', 'not', 'is','or' are checked before concluding is an IDENTIFIER
  //['IDENTIFIER',/^[$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*/] ]
  //['OPER', /^(is|isnt|not|and|but|into|like|or|in|into|instance|instanceof|has|hasnt)\b/],
            //if PMREX.whileRanges(chunk,0,"A-Za-z_\x7F-\xFF") into var wordLetters
            var wordLetters=undefined;
            if (_anyToBool((wordLetters=PMREX_whileRanges(undefined,3,(any_arr){chunk, any_number(0), any_str("A-Za-z_\x7F-\xFF")}))))  {
                //wordLetters = PMREX.whileRanges(chunk,wordLetters,"0-9A-Za-z_\x7F-\xFF") //Subsequent characters can also be numbers
                wordLetters = PMREX_whileRanges(undefined,3,(any_arr){chunk, wordLetters, any_str("0-9A-Za-z_\x7F-\xFF")}); //Subsequent characters can also be numbers
                //if "|#{chunk.slice(0,wordLetters)}|" in "|is|isnt|not|and|but|into|like|or|in|into|instance|instanceof|has|hasnt|"
                if (CALL1(indexOf_,any_str("|is|isnt|not|and|but|into|like|or|in|into|instance|instanceof|has|hasnt|"),_concatAny(3,any_str("|"), METHOD(slice_,chunk)(chunk,2,(any_arr){any_number(0), wordLetters}), any_str("|"))).value.number>=0)  {
                    //return new Token('OPER',chunk.slice(0,wordLetters))
                    return new(Parser_Token,2,(any_arr){any_str("OPER"), METHOD(slice_,chunk)(chunk,2,(any_arr){any_number(0), wordLetters})});
                };
                //return new Token('IDENTIFIER',chunk.slice(0,wordLetters))
                return new(Parser_Token,2,(any_arr){any_str("IDENTIFIER"), METHOD(slice_,chunk)(chunk,2,(any_arr){any_number(0), wordLetters})});
            };
      return undefined;
      }
    

//--------------
    // Parser_LexerPos
    any Parser_LexerPos; //Class Parser_LexerPos
//--------------------------
//### helper class LexerPos
      //properties
        //lexer, lineInx,sourceLineNum
        //index,token,last
      ;
      //constructor new LexerPos(lexer)
      void Parser_LexerPos__init(DEFAULT_ARGUMENTS){
        
        // define named params
        var lexer= argc? arguments[0] : undefined;
        //---------
        //.lexer = lexer
        PROP(lexer_,this) = lexer;
        //.lineInx = lexer.lineInx
        PROP(lineInx_,this) = PROP(lineInx_,lexer);
        //.index = lexer.index
        PROP(index_,this) = PROP(index_,lexer);
        //.sourceLineNum = lexer.sourceLineNum
        PROP(sourceLineNum_,this) = PROP(sourceLineNum_,lexer);
        //.token = lexer.token
        PROP(token_,this) = PROP(token_,lexer);
        //.last = lexer.last
        PROP(last_,this) = PROP(last_,lexer);
      }
      //method toString()
      any Parser_LexerPos_toString(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Parser_LexerPos));
        //---------
        //if no .token, .token = new Token(type='',tokenText='',column=0)
        if (!_anyToBool(PROP(token_,this))) {PROP(token_,this) = new(Parser_Token,3,(any_arr){any_EMPTY_STR, any_EMPTY_STR, any_number(0)});};
        //return "#{.lexer.filename}:#{.sourceLineNum}:#{(.token.column or 0)+1}"
        return _concatAny(5,PROP(filename_,PROP(lexer_,this)), any_str(":"), PROP(sourceLineNum_,this), any_str(":"), any_number(_anyToNumber((_anyToBool(__or6=PROP(column_,PROP(token_,this)))? __or6 : any_number(0))) + 1));
      return undefined;
      }
    

//--------------
    // Parser_MultilineSection
    any Parser_MultilineSection; //Class Parser_MultilineSection
//----------------------------------------------------------------------------------------------
//### helper Class MultilineSection
//This is a helper class the to get a section of text between start and end codes
      //properties
        //pre:string, section:string array, post:string
        //postIndent
      ;
      //constructor (lexer, line:string, startCode:string, endCode:string)
      void Parser_MultilineSection__init(DEFAULT_ARGUMENTS){
        
        // define named params
        var lexer, line, startCode, endCode;
        lexer=line=startCode=endCode=undefined;
        switch(argc){
          case 4:endCode=arguments[3];
          case 3:startCode=arguments[2];
          case 2:line=arguments[1];
          case 1:lexer=arguments[0];
        }
        //---------
//check if startCode is in the line, if not found, exit 
        //var startCol = line.indexOf(startCode)
        var startCol = METHOD(indexOf_,line)(line,1,(any_arr){startCode});
        //if startCol<0 
        if (_anyToNumber(startCol) < 0)  {
            //#no start code found
            //return 
            return ;
        };
        //// get rid of quoted strings. Still there?
        //if String.replaceQuoted(line,"").indexOf(startCode)<0
        if (_anyToNumber(__call(indexOf_,String_replaceQuoted(undefined,2,(any_arr){line, any_EMPTY_STR}),1,(any_arr){startCode})) < 0)  {
            //return #no 
            return ;// #no
        };
//ok, found startCode, initialize
        //logger.debug "**** START MULTILINE ",startCode
        logger_debug(undefined,2,(any_arr){any_str("**** START MULTILINE "), startCode});
        //this.section = []
        PROP(section_,this) = new(Array,0,NULL);
        //var startSourceLine = lexer.sourceLineNum
        var startSourceLine = PROP(sourceLineNum_,lexer);
//Get and save text previous to startCode
        //this.pre = line.slice(0, startCol).trim()
        PROP(pre_,this) = __call(trim_,METHOD(slice_,line)(line,2,(any_arr){any_number(0), startCol}),0,NULL);
//Get text after startCode
        //line = line.slice(startCol+startCode.length).trim()
        line = __call(trim_,METHOD(slice_,line)(line,1,(any_arr){any_number(_anyToNumber(startCol) + _length(startCode))}),0,NULL);
//read lines until endCode is found
        //var endCol
        var endCol = undefined;
        //do until line.indexOf(endCode) into endCol >= 0 #found end of section
        while(!(_anyToNumber((endCol=METHOD(indexOf_,line)(line,1,(any_arr){endCode}))) >= 0)){
            //# still inside the section
            //this.section.push line
            __call(push_,PROP(section_,this),1,(any_arr){line});
            //#get next line
            //if no lexer.nextSourceLine()
            if (!_anyToBool(METHOD(nextSourceLine_,lexer)(lexer,0,NULL)))  {
                //lexer.sayErr "EOF while processing multiline #{startCode} (started on #{lexer.filename}:#{startSourceLine}:#{startCol})"
                METHOD(sayErr_,lexer)(lexer,1,(any_arr){_concatAny(9,any_str("EOF while processing multiline "), startCode, any_str(" (started on "), PROP(filename_,lexer), any_str(":"), startSourceLine, any_str(":"), startCol, any_str(")"))});
                //return
                return ;
            };
            //line = lexer.line
            line = PROP(line_,lexer);
        };// end loop
        //loop #until end of section
//get text after endCode (is multilineSection.post)
        //this.post = line.slice(endCol+endCode.length)
        PROP(post_,this) = METHOD(slice_,line)(line,1,(any_arr){any_number(_anyToNumber(endCol) + _length(endCode))});
//text before endCode, goes into multiline section
        //line = line.slice(0, endCol)
        line = METHOD(slice_,line)(line,2,(any_arr){any_number(0), endCol});
        //if line 
        if (_anyToBool(line))  {
          //this.section.push line
          __call(push_,PROP(section_,this),1,(any_arr){line});
        };
        //this.postIndent = endCol+endCode.length
        PROP(postIndent_,this) = any_number(_anyToNumber(endCol) + _length(endCode));
      }
    //-------------------------
    //NAMESPACE Parser_LineTypes
    //-------------------------
        var Parser_LineTypes_CODE, Parser_LineTypes_COMMENT, Parser_LineTypes_BLANK;
    
    
    //------------------
    void Parser_LineTypes__namespaceInit(void){
            Parser_LineTypes_CODE = any_number(0);
            Parser_LineTypes_COMMENT = any_number(1);
            Parser_LineTypes_BLANK = any_number(2);
//------------------------
//Exported Module vars
//------------------------
//### Public namespace LineTypes 
        //properties 
            //CODE = 0
            //COMMENT = 1
            //BLANK = 2
        ;};
    

//--------------
    // Parser_OutCode
    any Parser_OutCode; //Class Parser_OutCode
    //auto Parser_OutCode__init
    void Parser_OutCode__init(any this, len_t argc, any* arguments){
     PROP(filenames_,this)=new(Array,3,(any_arr){any_EMPTY_STR, any_EMPTY_STR, any_EMPTY_STR});
     PROP(fileIsOpen_,this)=new(Array,3,(any_arr){false, false, false});
     PROP(fHandles_,this)=new(Array,3,(any_arr){null, null, null});
     PROP(orTempVarCount_,this)=any_number(0);
    };
//### Public Helper Class OutCode
//This class contains helper methods for AST nodes's `produce()` methods
//It also handles SourceMap generation for Chrome Developer Tools debugger and Firefox Firebug
//#### Properties
      //lineNum, column
      //currLine: DynBuffer
      //header:number //out to different files, 0:.c/.js 1:.h 2:.extra
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
     ;
//#### Method start(options)
     any Parser_OutCode_start(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Parser_OutCode));
        //---------
        // define named params
        var options= argc? arguments[0] : undefined;
        //---------
//Initialize output array
        //declare on options
            //nomap # do not generate sourcemap
        
        //.lineNum=1
        PROP(lineNum_,this) = any_number(1);
        //.column=1
        PROP(column_,this) = any_number(1);
        //.lines=[[],[],[]]
        PROP(lines_,this) = new(Array,3,(any_arr){new(Array,0,NULL), new(Array,0,NULL), new(Array,0,NULL)});
       // 
        //.lastOriginalCodeComment = 0
        PROP(lastOriginalCodeComment_,this) = any_number(0);
        //.lastOutCommentLine = 0
        PROP(lastOutCommentLine_,this) = any_number(0);
//if sourceMap option is set, and we're in node generating .js
        ////ifdef PROD_C
        //do nothing
        //do nothing
        ;
     return undefined;
     }
        ////else
        ////if not options.nomap and type of process isnt 'undefined' # in node
              ////import SourceMap
              ////.sourceMap = new SourceMap
        ////end if
//#### Method setHeader(num)
     any Parser_OutCode_setHeader(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Parser_OutCode));
        //---------
        // define named params
        var num= argc? arguments[0] : undefined;
        //---------
        //.startNewLine
        METHOD(startNewLine_,this)(this,0,NULL);
        //.header = num
        PROP(header_,this) = num;
     return undefined;
     }
//#### Method put(text:string)
     any Parser_OutCode_put(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Parser_OutCode));
        //---------
        // define named params
        var text= argc? arguments[0] : undefined;
        //---------
//put a string into produced code
//if no current line
//create a empty one
        //if .currLine is undefined
        if (__is(PROP(currLine_,this),undefined))  {
            //.currLine=new DynBuffer(128)
            PROP(currLine_,this) = new(Parser_DynBuffer,1,(any_arr){any_number(128)});
            //.column=1
            PROP(column_,this) = any_number(1);
        };
//append text to line 
        //if text, .column += .currLine.append(text)
        if (_anyToBool(text)) {PROP(column_,this).value.number += _anyToNumber(__call(append_,PROP(currLine_,this),1,(any_arr){text}));};
     return undefined;
     }
//#### Method startNewLine()
     any Parser_OutCode_startNewLine(DEFAULT_ARGUMENTS){
          assert(_instanceof(this,Parser_OutCode));
          //---------
//Start New Line into produced code
//send the current line
          //if .currLine
          if (_anyToBool(PROP(currLine_,this)))  {
              //if .fileMode
              if (_anyToBool(PROP(fileMode_,this)))  {
                  //if no .fileIsOpen[.header]
                  if (!_anyToBool(ITEM(_anyToNumber(PROP(header_,this)),PROP(fileIsOpen_,this))))  {
                      //// make sure output dir exists
                      //var filename = .filenames[.header] 
                      var filename = ITEM(_anyToNumber(PROP(header_,this)),PROP(filenames_,this));
                      //mkPath.toFile(filename);
                      mkPath_toFile(undefined,1,(any_arr){filename});
                      //.fHandles[.header]=fs.openSync(filename,'w')
                      ITEM(_anyToNumber(PROP(header_,this)),PROP(fHandles_,this)) = fs_openSync(undefined,2,(any_arr){filename, any_str("w")});
                      //.fileIsOpen[.header] = true
                      ITEM(_anyToNumber(PROP(header_,this)),PROP(fileIsOpen_,this)) = true;
                  };
                  //.currLine.saveLine .fHandles[.header]
                  __call(saveLine_,PROP(currLine_,this),1,(any_arr){ITEM(_anyToNumber(PROP(header_,this)),PROP(fHandles_,this))});
              }
              //else
              
              else {
                  //.lines[.header].push .currLine.toString()
                  __call(push_,ITEM(_anyToNumber(PROP(header_,this)),PROP(lines_,this)),1,(any_arr){__call(toString_,PROP(currLine_,this),0,NULL)});
              };
             // 
              //if .header is 0
              if (__is(PROP(header_,this),any_number(0)))  {
                  //.lineNum++
                  PROP(lineNum_,this).value.number++;
                  ////ifndef NDEBUG
                  //logger.debug  .lineNum, .currLine.toString()
                  logger_debug(undefined,2,(any_arr){PROP(lineNum_,this), __call(toString_,PROP(currLine_,this),0,NULL)});
              };
          };
                  ////endif
//clear current line
          //.currLine = undefined
          PROP(currLine_,this) = undefined;
          //.column = 1
          PROP(column_,this) = any_number(1);
     return undefined;
     }
//#### Method ensureNewLine()
     any Parser_OutCode_ensureNewLine(DEFAULT_ARGUMENTS){
          assert(_instanceof(this,Parser_OutCode));
          //---------
//if there's something on the line, start a new one
          //if .currLine, .startNewLine
          if (_anyToBool(PROP(currLine_,this))) {METHOD(startNewLine_,this)(this,0,NULL);};
     return undefined;
     }
//#### Method blankLine()
     any Parser_OutCode_blankLine(DEFAULT_ARGUMENTS){
          assert(_instanceof(this,Parser_OutCode));
          //---------
          //.startNewLine
          METHOD(startNewLine_,this)(this,0,NULL);
          //.put ""
          METHOD(put_,this)(this,1,(any_arr){any_EMPTY_STR});
          //.startNewLine
          METHOD(startNewLine_,this)(this,0,NULL);
     return undefined;
     }
//#### method getResult(header:boolean) returns array of string
     any Parser_OutCode_getResult(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Parser_OutCode));
        //---------
        // define named params
        var header= argc? arguments[0] : undefined;
        //---------
//get result and clear memory      
        //.header = header
        PROP(header_,this) = header;
        //.startNewLine() #close last line
        METHOD(startNewLine_,this)(this,0,NULL);// #close last line
        //var result
        var result = undefined;
        //result = .lines[header]
        result = ITEM(_anyToNumber(header),PROP(lines_,this));
        //.lines[header] = []
        ITEM(_anyToNumber(header),PROP(lines_,this)) = new(Array,0,NULL);
        //return result
        return result;
     return undefined;
     }
//#### method close()
     any Parser_OutCode_close(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Parser_OutCode));
        //---------
        //if .fileMode
        if (_anyToBool(PROP(fileMode_,this)))  {
            //for header=0 to 2
            int64_t _end5=2;
            for(int64_t header=0; header<=_end5; header++) {
                //if .fileIsOpen[header]
                if (_anyToBool(ITEM(header,PROP(fileIsOpen_,this))))  {
                    //fs.closeSync .fHandles[header]
                    fs_closeSync(undefined,1,(any_arr){ITEM(header,PROP(fHandles_,this))});
                    //.fileIsOpen[header] = false
                    ITEM(header,PROP(fileIsOpen_,this)) = false;
                };
            };// end for header
            
        };
     return undefined;
     }
//#### helper method markSourceMap(indent) returns object
     any Parser_OutCode_markSourceMap(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Parser_OutCode));
        //---------
        // define named params
        var indent= argc? arguments[0] : undefined;
        //---------
        //var col = .column 
        var col = PROP(column_,this);
        //if not .currLine, col += indent-1
        if (!(_anyToBool(PROP(currLine_,this)))) {col.value.number += _anyToNumber(indent) - 1;};
        //return {
              //col:col        
              //lin:.lineNum-1
        return new(Map,2,(any_arr){
              _newPair("col",col), 
              _newPair("lin",any_number(_anyToNumber(PROP(lineNum_,this)) - 1))
        })
        ;
     return undefined;
     }
        //}
//#### helper method addSourceMap(mark, sourceLin, sourceCol, indent)
     any Parser_OutCode_addSourceMap(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Parser_OutCode));
        //---------
        // define named params
        var mark, sourceLin, sourceCol, indent;
        mark=sourceLin=sourceCol=indent=undefined;
        switch(argc){
          case 4:indent=arguments[3];
          case 3:sourceCol=arguments[2];
          case 2:sourceLin=arguments[1];
          case 1:mark=arguments[0];
        }
        //---------
        ////ifdef PROD_C
        //do nothing
        //do nothing
        ;
     return undefined;
     }
    

//--------------
    // Parser_DynBuffer
    any Parser_DynBuffer; //Class Parser_DynBuffer
        ////else
        ////if .sourceMap
            ////declare on mark
                ////lin,col
            ////.sourceMap.add ( (sourceLin or 1)-1, 0, mark.lin, 0)
        ////endif
//### Class DynBuffer
        //properties
            //used = 0
            //buf :Buffer
        ;
        //constructor new DynBuffer(size)
        void Parser_DynBuffer__init(DEFAULT_ARGUMENTS){
        PROP(used_,this)=any_number(0);
            
            // define named params
            var size= argc? arguments[0] : undefined;
            //---------
            //.buf = new Buffer(size)
            PROP(buf_,this) = new(Buffer,1,(any_arr){size});
        }
        //method append(text:string)
        any Parser_DynBuffer_append(DEFAULT_ARGUMENTS){
          assert(_instanceof(this,Parser_DynBuffer));
          //---------
          // define named params
          var text= argc? arguments[0] : undefined;
          //---------
          //var byteLen = Buffer.byteLength(text)
          var byteLen = Buffer_byteLength(undefined,1,(any_arr){text});
          //if .used + byteLen > .buf.length
          if (_anyToNumber(PROP(used_,this)) + _anyToNumber(byteLen) > _length(PROP(buf_,this)))  {
              //var nbuf = new Buffer(.used + byteLen + 32)
              var nbuf = new(Buffer,1,(any_arr){any_number(_anyToNumber(PROP(used_,this)) + _anyToNumber(byteLen) + 32)});
              //.buf.copy nbuf
              __call(copy_,PROP(buf_,this),1,(any_arr){nbuf});
              //.buf = nbuf //replace
              PROP(buf_,this) = nbuf; //replace
          };
          //.used += .buf.write(text,.used)
          PROP(used_,this).value.number += _anyToNumber(__call(write_,PROP(buf_,this),2,(any_arr){text, PROP(used_,this)}));
          //return byteLen
          return byteLen;
        return undefined;
        }
        //method saveLine(fd)
        any Parser_DynBuffer_saveLine(DEFAULT_ARGUMENTS){
          assert(_instanceof(this,Parser_DynBuffer));
          //---------
          // define named params
          var fd= argc? arguments[0] : undefined;
          //---------
          //fs.writeSync fd, .buf,0,.used
          fs_writeSync(undefined,4,(any_arr){fd, PROP(buf_,this), any_number(0), PROP(used_,this)});
          //fs.writeSync fd, "\n"
          fs_writeSync(undefined,2,(any_arr){fd, any_str("\n")});
        return undefined;
        }
    
    
    
    any Parser_pushAt(DEFAULT_ARGUMENTS){
        // define named params
        var arr, content, useQuotes;
        arr=content=useQuotes=undefined;
        switch(argc){
          case 3:useQuotes=arguments[2];
          case 2:content=arguments[1];
          case 1:arr=arguments[0];
        }
        //---------
        if (_anyToBool(content))  {
            if (_anyToBool(useQuotes)) {content = METHOD(quoted_,content)(content,1,(any_arr){useQuotes});};
            METHOD(push_,arr)(arr,1,(any_arr){content});
        };
    return undefined;
    }

//-------------------------
void Parser__moduleInit(void){
        Parser_Lexer =_newClass("Parser_Lexer", Parser_Lexer__init, sizeof(struct Parser_Lexer_s), Object.value.classINFOptr);
        _declareMethods(Parser_Lexer, Parser_Lexer_METHODS);
        _declareProps(Parser_Lexer, Parser_Lexer_PROPS, sizeof Parser_Lexer_PROPS);
    
        Parser_Token =_newClass("Parser_Token", Parser_Token__init, sizeof(struct Parser_Token_s), Object.value.classINFOptr);
        _declareMethods(Parser_Token, Parser_Token_METHODS);
        _declareProps(Parser_Token, Parser_Token_PROPS, sizeof Parser_Token_PROPS);
    
        Parser_InfoLine =_newClass("Parser_InfoLine", Parser_InfoLine__init, sizeof(struct Parser_InfoLine_s), Object.value.classINFOptr);
        _declareMethods(Parser_InfoLine, Parser_InfoLine_METHODS);
        _declareProps(Parser_InfoLine, Parser_InfoLine_PROPS, sizeof Parser_InfoLine_PROPS);
    
        Parser_LexerPos =_newClass("Parser_LexerPos", Parser_LexerPos__init, sizeof(struct Parser_LexerPos_s), Object.value.classINFOptr);
        _declareMethods(Parser_LexerPos, Parser_LexerPos_METHODS);
        _declareProps(Parser_LexerPos, Parser_LexerPos_PROPS, sizeof Parser_LexerPos_PROPS);
    
        Parser_MultilineSection =_newClass("Parser_MultilineSection", Parser_MultilineSection__init, sizeof(struct Parser_MultilineSection_s), Object.value.classINFOptr);
        _declareMethods(Parser_MultilineSection, Parser_MultilineSection_METHODS);
        _declareProps(Parser_MultilineSection, Parser_MultilineSection_PROPS, sizeof Parser_MultilineSection_PROPS);
    
        Parser_OutCode =_newClass("Parser_OutCode", Parser_OutCode__init, sizeof(struct Parser_OutCode_s), Object.value.classINFOptr);
        _declareMethods(Parser_OutCode, Parser_OutCode_METHODS);
        _declareProps(Parser_OutCode, Parser_OutCode_PROPS, sizeof Parser_OutCode_PROPS);
    
        Parser_DynBuffer =_newClass("Parser_DynBuffer", Parser_DynBuffer__init, sizeof(struct Parser_DynBuffer_s), Object.value.classINFOptr);
        _declareMethods(Parser_DynBuffer, Parser_DynBuffer_METHODS);
        _declareProps(Parser_DynBuffer, Parser_DynBuffer_PROPS, sizeof Parser_DynBuffer_PROPS);
    
        Parser_LineTypes__namespaceInit();
};
