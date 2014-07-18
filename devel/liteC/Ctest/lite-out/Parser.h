#ifndef PARSER_C__H
#define PARSER_C__H
#include "_dispatcher.h"
//-------------------------
//Module Parser
//-------------------------
extern void Parser__moduleInit(void);
    

//--------------
    // Parser_Lexer
    any Parser_Lexer; //Class Parser_Lexer
    typedef struct Parser_Lexer_s * Parser_Lexer_ptr;
    typedef struct Parser_Lexer_s {
        //Lexer
        any project;
        any filename;
        any options;
        any lines;
        any infoLines;
        any line;
        any indent;
        any lineInx;
        any sourceLineNum;
        any infoLine;
        any token;
        any index;
        any interfaceMode;
        any stringInterpolationChar;
        any last;
        any maxSourceLineNum;
        any hardError;
        any softError;
        any outCode;
    
    } Parser_Lexer_s;
    
    extern void Parser_Lexer__init(DEFAULT_ARGUMENTS);
    extern any Parser_Lexer_reset(DEFAULT_ARGUMENTS);
    extern any Parser_Lexer_initSource(DEFAULT_ARGUMENTS);
    extern any Parser_Lexer_preParseSource(DEFAULT_ARGUMENTS);
    extern any Parser_Lexer_checkTitleCode(DEFAULT_ARGUMENTS);
    extern any Parser_Lexer_tokenize(DEFAULT_ARGUMENTS);
    extern any Parser_Lexer_preprocessor(DEFAULT_ARGUMENTS);
    extern any Parser_Lexer_process(DEFAULT_ARGUMENTS);
    extern any Parser_Lexer_nextSourceLine(DEFAULT_ARGUMENTS);
    extern any Parser_Lexer_replaceSourceLine(DEFAULT_ARGUMENTS);
    extern any Parser_Lexer_parseTripleQuotes(DEFAULT_ARGUMENTS);
    extern any Parser_Lexer_checkMultilineComment(DEFAULT_ARGUMENTS);
    extern any Parser_Lexer_checkConditionalCompilation(DEFAULT_ARGUMENTS);
    extern any Parser_Lexer_getPos(DEFAULT_ARGUMENTS);
    extern any Parser_Lexer_setPos(DEFAULT_ARGUMENTS);
    extern any Parser_Lexer_posToString(DEFAULT_ARGUMENTS);
    extern any Parser_Lexer_getPrevIndent(DEFAULT_ARGUMENTS);
    extern any Parser_Lexer_consumeToken(DEFAULT_ARGUMENTS);
    extern any Parser_Lexer_nextToken(DEFAULT_ARGUMENTS);
    extern any Parser_Lexer_returnToken(DEFAULT_ARGUMENTS);
    extern any Parser_Lexer_nextCODELine(DEFAULT_ARGUMENTS);
    extern any Parser_Lexer_say(DEFAULT_ARGUMENTS);
    extern any Parser_Lexer_throwErr(DEFAULT_ARGUMENTS);
    extern any Parser_Lexer_sayErr(DEFAULT_ARGUMENTS);
    extern any Parser_Lexer_warn(DEFAULT_ARGUMENTS);
    extern any Parser_Lexer_splitExpressions(DEFAULT_ARGUMENTS);
    

//--------------
    // Parser_Token
    any Parser_Token; //Class Parser_Token
    typedef struct Parser_Token_s * Parser_Token_ptr;
    typedef struct Parser_Token_s {
        //Token
        any type;
        any value;
        any column;
    
    } Parser_Token_s;
    
    extern void Parser_Token__init(DEFAULT_ARGUMENTS);
    extern any Parser_Token_toString(DEFAULT_ARGUMENTS);
    

//--------------
    // Parser_InfoLine
    any Parser_InfoLine; //Class Parser_InfoLine
    typedef struct Parser_InfoLine_s * Parser_InfoLine_ptr;
    typedef struct Parser_InfoLine_s {
        //InfoLine
        any type;
        any indent;
        any sourceLineNum;
        any text;
        any tokens;
    
    } Parser_InfoLine_s;
    
    extern void Parser_InfoLine__init(DEFAULT_ARGUMENTS);
    extern any Parser_InfoLine_dump(DEFAULT_ARGUMENTS);
    extern any Parser_InfoLine_tokenizeLine(DEFAULT_ARGUMENTS);
    extern any Parser_InfoLine_recognizeToken(DEFAULT_ARGUMENTS);
    

//--------------
    // Parser_LexerPos
    any Parser_LexerPos; //Class Parser_LexerPos
    typedef struct Parser_LexerPos_s * Parser_LexerPos_ptr;
    typedef struct Parser_LexerPos_s {
        //LexerPos
        any lexer;
        any lineInx;
        any sourceLineNum;
        any index;
        any token;
        any last;
    
    } Parser_LexerPos_s;
    
    extern void Parser_LexerPos__init(DEFAULT_ARGUMENTS);
    extern any Parser_LexerPos_toString(DEFAULT_ARGUMENTS);
    

//--------------
    // Parser_MultilineSection
    any Parser_MultilineSection; //Class Parser_MultilineSection
    typedef struct Parser_MultilineSection_s * Parser_MultilineSection_ptr;
    typedef struct Parser_MultilineSection_s {
        //MultilineSection
        any pre;
        any section;
        any post;
        any postIndent;
    
    } Parser_MultilineSection_s;
    
    extern void Parser_MultilineSection__init(DEFAULT_ARGUMENTS);
    //-------------------------
    // namespace Parser_LineTypes
    //-------------------------
        extern var Parser_LineTypes_CODE;
        extern var Parser_LineTypes_COMMENT;
        extern var Parser_LineTypes_BLANK;
    

//--------------
    // Parser_OutCode
    any Parser_OutCode; //Class Parser_OutCode
    typedef struct Parser_OutCode_s * Parser_OutCode_ptr;
    typedef struct Parser_OutCode_s {
        //OutCode
        any lineNum;
        any column;
        any currLine;
        any toHeader;
        any lines;
        any hLines;
        any lastOriginalCodeComment;
        any lastOutCommentLine;
        any sourceMap;
        any browser;
        any exportNamespace;
        any orTempVarCount;
    
    } Parser_OutCode_s;
    
    extern void Parser_OutCode__init(DEFAULT_ARGUMENTS);
    extern any Parser_OutCode_start(DEFAULT_ARGUMENTS);
    extern any Parser_OutCode_put(DEFAULT_ARGUMENTS);
    extern any Parser_OutCode_startNewLine(DEFAULT_ARGUMENTS);
    extern any Parser_OutCode_ensureNewLine(DEFAULT_ARGUMENTS);
    extern any Parser_OutCode_blankLine(DEFAULT_ARGUMENTS);
    extern any Parser_OutCode_getResult(DEFAULT_ARGUMENTS);
    extern any Parser_OutCode_markSourceMap(DEFAULT_ARGUMENTS);
    extern any Parser_OutCode_addSourceMap(DEFAULT_ARGUMENTS);
#endif