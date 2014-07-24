#ifndef ASTBASE_C__H
#define ASTBASE_C__H
#include "_dispatcher.h"
//-------------------------
//Module ASTBase
//-------------------------
extern void ASTBase__moduleInit(void);
    

//--------------
    // ASTBase
    any ASTBase; //Class ASTBase
    typedef struct ASTBase_s * ASTBase_ptr;
    typedef struct ASTBase_s {
        //ASTBase
        any parent;
        any name;
        any keyword;
        any type;
        any keyType;
        any itemType;
        any lexer;
        any lineInx;
        any sourceLineNum;
        any column;
        any indent;
        any locked;
        any extraInfo;
        any accessors;
        any executes;
        any hasSideEffects;
        any isMap;
        any scope;
        any skipSemiColon;
    
    } ASTBase_s;
    
    extern void ASTBase__init(DEFAULT_ARGUMENTS);
    extern any ASTBase_newFromObject(DEFAULT_ARGUMENTS);
    extern any ASTBase_lock(DEFAULT_ARGUMENTS);
    extern any ASTBase_getParent(DEFAULT_ARGUMENTS);
    extern any ASTBase_positionText(DEFAULT_ARGUMENTS);
    extern any ASTBase_toString(DEFAULT_ARGUMENTS);
    extern any ASTBase_sayErr(DEFAULT_ARGUMENTS);
    extern any ASTBase_warn(DEFAULT_ARGUMENTS);
    extern any ASTBase_throwError(DEFAULT_ARGUMENTS);
    extern any ASTBase_throwParseFailed(DEFAULT_ARGUMENTS);
    extern any ASTBase_parse(DEFAULT_ARGUMENTS);
    extern any ASTBase_produce(DEFAULT_ARGUMENTS);
    extern any ASTBase_parseDirect(DEFAULT_ARGUMENTS);
    extern any ASTBase_opt(DEFAULT_ARGUMENTS);
    extern any ASTBase_req(DEFAULT_ARGUMENTS);
    extern any ASTBase_reqOneOf(DEFAULT_ARGUMENTS);
    extern any ASTBase_optList(DEFAULT_ARGUMENTS);
    extern any ASTBase_optSeparatedList(DEFAULT_ARGUMENTS);
    extern any ASTBase_optFreeFormList(DEFAULT_ARGUMENTS);
    extern any ASTBase_reqSeparatedList(DEFAULT_ARGUMENTS);
    extern any ASTBase_listArgs(DEFAULT_ARGUMENTS);
    extern any ASTBase_out(DEFAULT_ARGUMENTS);
    extern any ASTBase_outSourceLineAsComment(DEFAULT_ARGUMENTS);
    extern any ASTBase_outSourceLinesAsComment(DEFAULT_ARGUMENTS);
    extern any ASTBase_getEOLComment(DEFAULT_ARGUMENTS);
    extern any ASTBase_addSourceMap(DEFAULT_ARGUMENTS);
    extern any ASTBase_levelIndent(DEFAULT_ARGUMENTS);
    extern any ASTBase_parseAccessors(DEFAULT_ARGUMENTS);
    extern any ASTBase_addAccessor(DEFAULT_ARGUMENTS);
    extern any ASTBase_hasAdjective(DEFAULT_ARGUMENTS);
    extern any ASTBase_parseType(DEFAULT_ARGUMENTS);
    extern any ASTBase_declareName(DEFAULT_ARGUMENTS);
    extern any ASTBase_addMemberTo(DEFAULT_ARGUMENTS);
    extern any ASTBase_tryGetMember(DEFAULT_ARGUMENTS);
    extern any ASTBase_getScopeNode(DEFAULT_ARGUMENTS);
    extern any ASTBase_findInScope(DEFAULT_ARGUMENTS);
    extern any ASTBase_tryGetFromScope(DEFAULT_ARGUMENTS);
    extern any ASTBase_addToScope(DEFAULT_ARGUMENTS);
    extern any ASTBase_addToSpecificScope(DEFAULT_ARGUMENTS);
    extern any ASTBase_createScope(DEFAULT_ARGUMENTS);
    extern any ASTBase_tryGetOwnerNameDecl(DEFAULT_ARGUMENTS);
    extern any ASTBase_callOnSubTree(DEFAULT_ARGUMENTS);
    extern any ASTBase_assignIfUndefined(DEFAULT_ARGUMENTS);
#endif
