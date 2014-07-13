#ifndef PARSER_C__H
#define PARSER_C__H
#include "_dispatcher.h"
//-------------------------
//Module Parser
//-------------------------
extern void Parser__moduleInit(void);
   

//--------------
   // Parser_Lexer
   
   extern any Parser_Lexer; //Class Object
   
   typedef struct Parser_Lexer_s * Parser_Lexer_ptr;
   typedef struct Parser_Lexer_s {
       any
           project,
           filename,
           options,
           lines,
           infoLines,
           line,
           indent,
           lineInx,
           sourceLineNum,
           infoLine,
           token,
           index,
           interfaceMode,
           stringInterpolationChar,
           last,
           maxSourceLineNum,
           hardError,
           softError,
           outCode
   ;
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
   
   extern any Parser_Token; //Class Object
   
   typedef struct Parser_Token_s * Parser_Token_ptr;
   typedef struct Parser_Token_s {
       any
           type,
           value,
           column
   ;
   } Parser_Token_s;
   
   extern void Parser_Token__init(DEFAULT_ARGUMENTS);
   extern any Parser_Token_toString(DEFAULT_ARGUMENTS);
   

//--------------
   // Parser_InfoLine
   
   extern any Parser_InfoLine; //Class Object
   
   typedef struct Parser_InfoLine_s * Parser_InfoLine_ptr;
   typedef struct Parser_InfoLine_s {
       any
           type,
           indent,
           sourceLineNum,
           text,
           tokens
   ;
   } Parser_InfoLine_s;
   
   extern void Parser_InfoLine__init(DEFAULT_ARGUMENTS);
   extern any Parser_InfoLine_dump(DEFAULT_ARGUMENTS);
   extern any Parser_InfoLine_tokenizeLine(DEFAULT_ARGUMENTS);
   extern any Parser_InfoLine_recognizeToken(DEFAULT_ARGUMENTS);
   

//--------------
   // Parser_LexerPos
   
   extern any Parser_LexerPos; //Class Object
   
   typedef struct Parser_LexerPos_s * Parser_LexerPos_ptr;
   typedef struct Parser_LexerPos_s {
       any
           lexer,
           lineInx,
           sourceLineNum,
           index,
           token,
           last
   ;
   } Parser_LexerPos_s;
   
   extern void Parser_LexerPos__init(DEFAULT_ARGUMENTS);
   extern any Parser_LexerPos_toString(DEFAULT_ARGUMENTS);
   

//--------------
   // Parser_MultilineSection
   
   extern any Parser_MultilineSection; //Class Object
   
   typedef struct Parser_MultilineSection_s * Parser_MultilineSection_ptr;
   typedef struct Parser_MultilineSection_s {
       any
           pre,
           section,
           post,
           postIndent
   ;
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
   
   extern any Parser_OutCode; //Class Object
   
   typedef struct Parser_OutCode_s * Parser_OutCode_ptr;
   typedef struct Parser_OutCode_s {
       any
           lineNum,
           column,
           currLine,
           lines,
           hLines,
           lastOriginalCodeComment,
           lastOutCommentLine,
           sourceMap,
           browser,
           exportNamespace,
           toHeader
   ;
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