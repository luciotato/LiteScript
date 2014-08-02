#ifndef GRAMMAR_C__H
#define GRAMMAR_C__H
#include "_dispatcher.h"
//-------------------------
//Module Grammar
//-------------------------
extern void Grammar__moduleInit(void);
    

//--------------
    // Grammar_PrintStatement
    any Grammar_PrintStatement; //Class Grammar_PrintStatement extends ASTBase
    
    typedef struct Grammar_PrintStatement_s * Grammar_PrintStatement_ptr;
    typedef struct Grammar_PrintStatement_s {
        //ASTBase
        any parent;
        any childs;
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
        //PrintStatement
        any args;
    
    } Grammar_PrintStatement_s;
    
    extern void Grammar_PrintStatement__init(DEFAULT_ARGUMENTS);
    extern any Grammar_PrintStatement_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_PrintStatement_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_PrintStatement_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_VarDeclList
    any Grammar_VarDeclList; //Class Grammar_VarDeclList extends ASTBase
    
    typedef struct Grammar_VarDeclList_s * Grammar_VarDeclList_ptr;
    typedef struct Grammar_VarDeclList_s {
        //ASTBase
        any parent;
        any childs;
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
        //VarDeclList
        any list;
    
    } Grammar_VarDeclList_s;
    
    extern void Grammar_VarDeclList__init(DEFAULT_ARGUMENTS);
    extern any Grammar_VarDeclList_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_VarDeclList_parseList(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_VarStatement
    any Grammar_VarStatement; //Class Grammar_VarStatement extends Grammar_VarDeclList
    
    typedef struct Grammar_VarStatement_s * Grammar_VarStatement_ptr;
    typedef struct Grammar_VarStatement_s {
        //ASTBase
        any parent;
        any childs;
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
        //VarDeclList
        any list;
        //VarStatement
    
    } Grammar_VarStatement_s;
    
    extern void Grammar_VarStatement__init(DEFAULT_ARGUMENTS);
    extern any Grammar_VarStatement_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_VarStatement_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_VarStatement_declare(DEFAULT_ARGUMENTS);
    extern any Grammar_VarStatement_evaluateAssignments(DEFAULT_ARGUMENTS);
    extern any Grammar_VarStatement_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_VariableDecl
    any Grammar_VariableDecl; //Class Grammar_VariableDecl extends ASTBase
    
    typedef struct Grammar_VariableDecl_s * Grammar_VariableDecl_ptr;
    typedef struct Grammar_VariableDecl_s {
        //ASTBase
        any parent;
        any childs;
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
        //VariableDecl
        any aliasVarRef;
        any assignedValue;
        any nameDecl;
    
    } Grammar_VariableDecl_s;
    
    extern void Grammar_VariableDecl__init(DEFAULT_ARGUMENTS);
    extern any Grammar_VariableDecl_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_VariableDecl_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_VariableDecl_createNameDeclaration(DEFAULT_ARGUMENTS);
    extern any Grammar_VariableDecl_declareInScope(DEFAULT_ARGUMENTS);
    extern any Grammar_VariableDecl_getTypeFromAssignedValue(DEFAULT_ARGUMENTS);
    extern any Grammar_VariableDecl_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_PropertiesDeclaration
    any Grammar_PropertiesDeclaration; //Class Grammar_PropertiesDeclaration extends Grammar_VarDeclList
    
    typedef struct Grammar_PropertiesDeclaration_s * Grammar_PropertiesDeclaration_ptr;
    typedef struct Grammar_PropertiesDeclaration_s {
        //ASTBase
        any parent;
        any childs;
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
        //VarDeclList
        any list;
        //PropertiesDeclaration
        any nameDecl;
        any declared;
    
    } Grammar_PropertiesDeclaration_s;
    
    extern void Grammar_PropertiesDeclaration__init(DEFAULT_ARGUMENTS);
    extern any Grammar_PropertiesDeclaration_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_PropertiesDeclaration_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_PropertiesDeclaration_declare(DEFAULT_ARGUMENTS);
    extern any Grammar_PropertiesDeclaration_evaluateAssignments(DEFAULT_ARGUMENTS);
    extern any Grammar_PropertiesDeclaration_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_WithStatement
    any Grammar_WithStatement; //Class Grammar_WithStatement extends ASTBase
    
    typedef struct Grammar_WithStatement_s * Grammar_WithStatement_ptr;
    typedef struct Grammar_WithStatement_s {
        //ASTBase
        any parent;
        any childs;
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
        //WithStatement
        any varRef;
        any body;
        any nameDecl;
    
    } Grammar_WithStatement_s;
    
    extern void Grammar_WithStatement__init(DEFAULT_ARGUMENTS);
    extern any Grammar_WithStatement_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_WithStatement_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_WithStatement_declare(DEFAULT_ARGUMENTS);
    extern any Grammar_WithStatement_evaluateAssignments(DEFAULT_ARGUMENTS);
    extern any Grammar_WithStatement_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_TryCatch
    any Grammar_TryCatch; //Class Grammar_TryCatch extends ASTBase
    
    typedef struct Grammar_TryCatch_s * Grammar_TryCatch_ptr;
    typedef struct Grammar_TryCatch_s {
        //ASTBase
        any parent;
        any childs;
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
        //TryCatch
        any body;
        any exceptionBlock;
    
    } Grammar_TryCatch_s;
    
    extern void Grammar_TryCatch__init(DEFAULT_ARGUMENTS);
    extern any Grammar_TryCatch_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_TryCatch_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_TryCatch_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_ExceptionBlock
    any Grammar_ExceptionBlock; //Class Grammar_ExceptionBlock extends ASTBase
    
    typedef struct Grammar_ExceptionBlock_s * Grammar_ExceptionBlock_ptr;
    typedef struct Grammar_ExceptionBlock_s {
        //ASTBase
        any parent;
        any childs;
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
        //ExceptionBlock
        any catchVar;
        any body;
        any finallyBody;
    
    } Grammar_ExceptionBlock_s;
    
    extern void Grammar_ExceptionBlock__init(DEFAULT_ARGUMENTS);
    extern any Grammar_ExceptionBlock_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_ExceptionBlock_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_ExceptionBlock_declare(DEFAULT_ARGUMENTS);
    extern any Grammar_ExceptionBlock_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_ThrowStatement
    any Grammar_ThrowStatement; //Class Grammar_ThrowStatement extends ASTBase
    
    typedef struct Grammar_ThrowStatement_s * Grammar_ThrowStatement_ptr;
    typedef struct Grammar_ThrowStatement_s {
        //ASTBase
        any parent;
        any childs;
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
        //ThrowStatement
        any specifier;
        any expr;
    
    } Grammar_ThrowStatement_s;
    
    extern void Grammar_ThrowStatement__init(DEFAULT_ARGUMENTS);
    extern any Grammar_ThrowStatement_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_ThrowStatement_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_ThrowStatement_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_ReturnStatement
    any Grammar_ReturnStatement; //Class Grammar_ReturnStatement extends ASTBase
    
    typedef struct Grammar_ReturnStatement_s * Grammar_ReturnStatement_ptr;
    typedef struct Grammar_ReturnStatement_s {
        //ASTBase
        any parent;
        any childs;
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
        //ReturnStatement
        any expr;
    
    } Grammar_ReturnStatement_s;
    
    extern void Grammar_ReturnStatement__init(DEFAULT_ARGUMENTS);
    extern any Grammar_ReturnStatement_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_ReturnStatement_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_ReturnStatement_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_IfStatement
    any Grammar_IfStatement; //Class Grammar_IfStatement extends ASTBase
    
    typedef struct Grammar_IfStatement_s * Grammar_IfStatement_ptr;
    typedef struct Grammar_IfStatement_s {
        //ASTBase
        any parent;
        any childs;
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
        //IfStatement
        any conditional;
        any body;
        any elseStatement;
    
    } Grammar_IfStatement_s;
    
    extern void Grammar_IfStatement__init(DEFAULT_ARGUMENTS);
    extern any Grammar_IfStatement_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_IfStatement_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_IfStatement_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_ElseIfStatement
    any Grammar_ElseIfStatement; //Class Grammar_ElseIfStatement extends ASTBase
    
    typedef struct Grammar_ElseIfStatement_s * Grammar_ElseIfStatement_ptr;
    typedef struct Grammar_ElseIfStatement_s {
        //ASTBase
        any parent;
        any childs;
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
        //ElseIfStatement
        any nextIf;
    
    } Grammar_ElseIfStatement_s;
    
    extern void Grammar_ElseIfStatement__init(DEFAULT_ARGUMENTS);
    extern any Grammar_ElseIfStatement_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_ElseIfStatement_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_ElseIfStatement_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_ElseStatement
    any Grammar_ElseStatement; //Class Grammar_ElseStatement extends ASTBase
    
    typedef struct Grammar_ElseStatement_s * Grammar_ElseStatement_ptr;
    typedef struct Grammar_ElseStatement_s {
        //ASTBase
        any parent;
        any childs;
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
        //ElseStatement
        any body;
    
    } Grammar_ElseStatement_s;
    
    extern void Grammar_ElseStatement__init(DEFAULT_ARGUMENTS);
    extern any Grammar_ElseStatement_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_ElseStatement_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_ElseStatement_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_DoLoop
    any Grammar_DoLoop; //Class Grammar_DoLoop extends ASTBase
    
    typedef struct Grammar_DoLoop_s * Grammar_DoLoop_ptr;
    typedef struct Grammar_DoLoop_s {
        //ASTBase
        any parent;
        any childs;
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
        //DoLoop
        any preWhileUntilExpression;
        any body;
        any postWhileUntilExpression;
    
    } Grammar_DoLoop_s;
    
    extern void Grammar_DoLoop__init(DEFAULT_ARGUMENTS);
    extern any Grammar_DoLoop_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_DoLoop_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_DoLoop_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_WhileUntilLoop
    any Grammar_WhileUntilLoop; //Class Grammar_WhileUntilLoop extends Grammar_DoLoop
    
    typedef struct Grammar_WhileUntilLoop_s * Grammar_WhileUntilLoop_ptr;
    typedef struct Grammar_WhileUntilLoop_s {
        //ASTBase
        any parent;
        any childs;
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
        //DoLoop
        any preWhileUntilExpression;
        any body;
        any postWhileUntilExpression;
        //WhileUntilLoop
    
    } Grammar_WhileUntilLoop_s;
    
    extern void Grammar_WhileUntilLoop__init(DEFAULT_ARGUMENTS);
    extern any Grammar_WhileUntilLoop_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_WhileUntilLoop_parse(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_WhileUntilExpression
    any Grammar_WhileUntilExpression; //Class Grammar_WhileUntilExpression extends ASTBase
    
    typedef struct Grammar_WhileUntilExpression_s * Grammar_WhileUntilExpression_ptr;
    typedef struct Grammar_WhileUntilExpression_s {
        //ASTBase
        any parent;
        any childs;
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
        //WhileUntilExpression
        any expr;
    
    } Grammar_WhileUntilExpression_s;
    
    extern void Grammar_WhileUntilExpression__init(DEFAULT_ARGUMENTS);
    extern any Grammar_WhileUntilExpression_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_WhileUntilExpression_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_WhileUntilExpression_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_LoopControlStatement
    any Grammar_LoopControlStatement; //Class Grammar_LoopControlStatement extends ASTBase
    
    typedef struct Grammar_LoopControlStatement_s * Grammar_LoopControlStatement_ptr;
    typedef struct Grammar_LoopControlStatement_s {
        //ASTBase
        any parent;
        any childs;
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
        //LoopControlStatement
        any control;
    
    } Grammar_LoopControlStatement_s;
    
    extern void Grammar_LoopControlStatement__init(DEFAULT_ARGUMENTS);
    extern any Grammar_LoopControlStatement_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_LoopControlStatement_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_LoopControlStatement_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_DoNothingStatement
    any Grammar_DoNothingStatement; //Class Grammar_DoNothingStatement extends ASTBase
    
    typedef struct Grammar_DoNothingStatement_s * Grammar_DoNothingStatement_ptr;
    typedef struct Grammar_DoNothingStatement_s {
        //ASTBase
        any parent;
        any childs;
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
        //DoNothingStatement
    
    } Grammar_DoNothingStatement_s;
    
    extern void Grammar_DoNothingStatement__init(DEFAULT_ARGUMENTS);
    extern any Grammar_DoNothingStatement_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_DoNothingStatement_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_DoNothingStatement_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_ForStatement
    any Grammar_ForStatement; //Class Grammar_ForStatement extends ASTBase
    
    typedef struct Grammar_ForStatement_s * Grammar_ForStatement_ptr;
    typedef struct Grammar_ForStatement_s {
        //ASTBase
        any parent;
        any childs;
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
        //ForStatement
        any variant;
    
    } Grammar_ForStatement_s;
    
    extern void Grammar_ForStatement__init(DEFAULT_ARGUMENTS);
    extern any Grammar_ForStatement_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_ForStatement_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_ForStatement_declare(DEFAULT_ARGUMENTS);
    extern any Grammar_ForStatement_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_ForEachProperty
    any Grammar_ForEachProperty; //Class Grammar_ForEachProperty extends ASTBase
    
    typedef struct Grammar_ForEachProperty_s * Grammar_ForEachProperty_ptr;
    typedef struct Grammar_ForEachProperty_s {
        //ASTBase
        any parent;
        any childs;
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
        //ForEachProperty
        any indexVar;
        any mainVar;
        any iterable;
        any where;
        any body;
    
    } Grammar_ForEachProperty_s;
    
    extern void Grammar_ForEachProperty__init(DEFAULT_ARGUMENTS);
    extern any Grammar_ForEachProperty_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_ForEachProperty_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_ForEachProperty_declare(DEFAULT_ARGUMENTS);
    extern any Grammar_ForEachProperty_evaluateAssignments(DEFAULT_ARGUMENTS);
    extern any Grammar_ForEachProperty_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_ForEachInArray
    any Grammar_ForEachInArray; //Class Grammar_ForEachInArray extends ASTBase
    
    typedef struct Grammar_ForEachInArray_s * Grammar_ForEachInArray_ptr;
    typedef struct Grammar_ForEachInArray_s {
        //ASTBase
        any parent;
        any childs;
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
        //ForEachInArray
        any indexVar;
        any mainVar;
        any iterable;
        any where;
        any body;
    
    } Grammar_ForEachInArray_s;
    
    extern void Grammar_ForEachInArray__init(DEFAULT_ARGUMENTS);
    extern any Grammar_ForEachInArray_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_ForEachInArray_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_ForEachInArray_declare(DEFAULT_ARGUMENTS);
    extern any Grammar_ForEachInArray_evaluateAssignments(DEFAULT_ARGUMENTS);
    extern any Grammar_ForEachInArray_validatePropertyAccess(DEFAULT_ARGUMENTS);
    extern any Grammar_ForEachInArray_produce(DEFAULT_ARGUMENTS);
    extern any Grammar_ForEachInArray_produceInMap(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_ForIndexNumeric
    any Grammar_ForIndexNumeric; //Class Grammar_ForIndexNumeric extends ASTBase
    
    typedef struct Grammar_ForIndexNumeric_s * Grammar_ForIndexNumeric_ptr;
    typedef struct Grammar_ForIndexNumeric_s {
        //ASTBase
        any parent;
        any childs;
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
        //ForIndexNumeric
        any indexVar;
        any conditionPrefix;
        any endExpression;
        any increment;
        any body;
    
    } Grammar_ForIndexNumeric_s;
    
    extern void Grammar_ForIndexNumeric__init(DEFAULT_ARGUMENTS);
    extern any Grammar_ForIndexNumeric_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_ForIndexNumeric_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_ForIndexNumeric_declare(DEFAULT_ARGUMENTS);
    extern any Grammar_ForIndexNumeric_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_ForWhereFilter
    any Grammar_ForWhereFilter; //Class Grammar_ForWhereFilter extends ASTBase
    
    typedef struct Grammar_ForWhereFilter_s * Grammar_ForWhereFilter_ptr;
    typedef struct Grammar_ForWhereFilter_s {
        //ASTBase
        any parent;
        any childs;
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
        //ForWhereFilter
        any filterExpression;
    
    } Grammar_ForWhereFilter_s;
    
    extern void Grammar_ForWhereFilter__init(DEFAULT_ARGUMENTS);
    extern any Grammar_ForWhereFilter_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_ForWhereFilter_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_ForWhereFilter_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_DeleteStatement
    any Grammar_DeleteStatement; //Class Grammar_DeleteStatement extends ASTBase
    
    typedef struct Grammar_DeleteStatement_s * Grammar_DeleteStatement_ptr;
    typedef struct Grammar_DeleteStatement_s {
        //ASTBase
        any parent;
        any childs;
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
        //DeleteStatement
        any varRef;
    
    } Grammar_DeleteStatement_s;
    
    extern void Grammar_DeleteStatement__init(DEFAULT_ARGUMENTS);
    extern any Grammar_DeleteStatement_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_DeleteStatement_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_DeleteStatement_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_AssignmentStatement
    any Grammar_AssignmentStatement; //Class Grammar_AssignmentStatement extends ASTBase
    
    typedef struct Grammar_AssignmentStatement_s * Grammar_AssignmentStatement_ptr;
    typedef struct Grammar_AssignmentStatement_s {
        //ASTBase
        any parent;
        any childs;
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
        //AssignmentStatement
        any lvalue;
        any rvalue;
    
    } Grammar_AssignmentStatement_s;
    
    extern void Grammar_AssignmentStatement__init(DEFAULT_ARGUMENTS);
    extern any Grammar_AssignmentStatement_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_AssignmentStatement_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_AssignmentStatement_evaluateAssignments(DEFAULT_ARGUMENTS);
    extern any Grammar_AssignmentStatement_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_VariableRef
    any Grammar_VariableRef; //Class Grammar_VariableRef extends ASTBase
    
    typedef struct Grammar_VariableRef_s * Grammar_VariableRef_ptr;
    typedef struct Grammar_VariableRef_s {
        //ASTBase
        any parent;
        any childs;
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
        //VariableRef
        any preIncDec;
        any postIncDec;
    
    } Grammar_VariableRef_s;
    
    extern void Grammar_VariableRef__init(DEFAULT_ARGUMENTS);
    extern any Grammar_VariableRef_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_VariableRef_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_VariableRef_toString(DEFAULT_ARGUMENTS);
    extern any Grammar_VariableRef_validatePropertyAccess(DEFAULT_ARGUMENTS);
    extern any Grammar_VariableRef_tryGetReference(DEFAULT_ARGUMENTS);
    extern any Grammar_VariableRef_getResultType(DEFAULT_ARGUMENTS);
    extern any Grammar_VariableRef_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_Accessor
    any Grammar_Accessor; //Class Grammar_Accessor extends ASTBase
    
    typedef struct Grammar_Accessor_s * Grammar_Accessor_ptr;
    typedef struct Grammar_Accessor_s {
        //ASTBase
        any parent;
        any childs;
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
        //Accessor
    
    } Grammar_Accessor_s;
    
    extern void Grammar_Accessor__init(DEFAULT_ARGUMENTS);
    extern any Grammar_Accessor_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_Accessor_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_Accessor_toString(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_PropertyAccess
    any Grammar_PropertyAccess; //Class Grammar_PropertyAccess extends Grammar_Accessor
    
    typedef struct Grammar_PropertyAccess_s * Grammar_PropertyAccess_ptr;
    typedef struct Grammar_PropertyAccess_s {
        //ASTBase
        any parent;
        any childs;
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
        //Accessor
        //PropertyAccess
    
    } Grammar_PropertyAccess_s;
    
    extern void Grammar_PropertyAccess__init(DEFAULT_ARGUMENTS);
    extern any Grammar_PropertyAccess_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_PropertyAccess_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_PropertyAccess_toString(DEFAULT_ARGUMENTS);
    extern any Grammar_PropertyAccess_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_IndexAccess
    any Grammar_IndexAccess; //Class Grammar_IndexAccess extends Grammar_Accessor
    
    typedef struct Grammar_IndexAccess_s * Grammar_IndexAccess_ptr;
    typedef struct Grammar_IndexAccess_s {
        //ASTBase
        any parent;
        any childs;
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
        //Accessor
        //IndexAccess
    
    } Grammar_IndexAccess_s;
    
    extern void Grammar_IndexAccess__init(DEFAULT_ARGUMENTS);
    extern any Grammar_IndexAccess_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_IndexAccess_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_IndexAccess_toString(DEFAULT_ARGUMENTS);
    extern any Grammar_IndexAccess_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_FunctionArgument
    any Grammar_FunctionArgument; //Class Grammar_FunctionArgument extends ASTBase
    
    typedef struct Grammar_FunctionArgument_s * Grammar_FunctionArgument_ptr;
    typedef struct Grammar_FunctionArgument_s {
        //ASTBase
        any parent;
        any childs;
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
        //FunctionArgument
        any expression;
    
    } Grammar_FunctionArgument_s;
    
    extern void Grammar_FunctionArgument__init(DEFAULT_ARGUMENTS);
    extern any Grammar_FunctionArgument_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_FunctionArgument_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_FunctionArgument_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_FunctionAccess
    any Grammar_FunctionAccess; //Class Grammar_FunctionAccess extends Grammar_Accessor
    
    typedef struct Grammar_FunctionAccess_s * Grammar_FunctionAccess_ptr;
    typedef struct Grammar_FunctionAccess_s {
        //ASTBase
        any parent;
        any childs;
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
        //Accessor
        //FunctionAccess
        any args;
    
    } Grammar_FunctionAccess_s;
    
    extern void Grammar_FunctionAccess__init(DEFAULT_ARGUMENTS);
    extern any Grammar_FunctionAccess_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_FunctionAccess_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_FunctionAccess_toString(DEFAULT_ARGUMENTS);
    extern any Grammar_FunctionAccess_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_Operand
    any Grammar_Operand; //Class Grammar_Operand extends ASTBase
    
    typedef struct Grammar_Operand_s * Grammar_Operand_ptr;
    typedef struct Grammar_Operand_s {
        //ASTBase
        any parent;
        any childs;
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
        //Operand
    
    } Grammar_Operand_s;
    
    extern void Grammar_Operand__init(DEFAULT_ARGUMENTS);
    extern any Grammar_Operand_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_Operand_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_Operand_getResultType(DEFAULT_ARGUMENTS);
    extern any Grammar_Operand_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_Oper
    any Grammar_Oper; //Class Grammar_Oper extends ASTBase
    
    typedef struct Grammar_Oper_s * Grammar_Oper_ptr;
    typedef struct Grammar_Oper_s {
        //ASTBase
        any parent;
        any childs;
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
        //Oper
        any negated;
        any left;
        any right;
        any pushed;
        any precedence;
        any intoVar;
    
    } Grammar_Oper_s;
    
    extern void Grammar_Oper__init(DEFAULT_ARGUMENTS);
    extern any Grammar_Oper_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_Oper_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_Oper_getPrecedence(DEFAULT_ARGUMENTS);
    extern any Grammar_Oper_declare(DEFAULT_ARGUMENTS);
    extern any Grammar_Oper_evaluateAssignments(DEFAULT_ARGUMENTS);
    extern any Grammar_Oper_getResultType(DEFAULT_ARGUMENTS);
    extern any Grammar_Oper_declareIntoVar(DEFAULT_ARGUMENTS);
    extern any Grammar_Oper_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_UnaryOper
    any Grammar_UnaryOper; //Class Grammar_UnaryOper extends Grammar_Oper
    
    typedef struct Grammar_UnaryOper_s * Grammar_UnaryOper_ptr;
    typedef struct Grammar_UnaryOper_s {
        //ASTBase
        any parent;
        any childs;
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
        //Oper
        any negated;
        any left;
        any right;
        any pushed;
        any precedence;
        any intoVar;
        //UnaryOper
    
    } Grammar_UnaryOper_s;
    
    extern void Grammar_UnaryOper__init(DEFAULT_ARGUMENTS);
    extern any Grammar_UnaryOper_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_UnaryOper_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_UnaryOper_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_Expression
    any Grammar_Expression; //Class Grammar_Expression extends ASTBase
    
    typedef struct Grammar_Expression_s * Grammar_Expression_ptr;
    typedef struct Grammar_Expression_s {
        //ASTBase
        any parent;
        any childs;
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
        //Expression
        any operandCount;
        any root;
        any ternaryCount;
    
    } Grammar_Expression_s;
    
    extern void Grammar_Expression__init(DEFAULT_ARGUMENTS);
    extern any Grammar_Expression_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_Expression_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_Expression_growExpressionTree(DEFAULT_ARGUMENTS);
    extern any Grammar_Expression_getResultType(DEFAULT_ARGUMENTS);
    extern any Grammar_Expression_produce(DEFAULT_ARGUMENTS);
    extern any Grammar_Expression_prepareTempVar(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_Literal
    any Grammar_Literal; //Class Grammar_Literal extends ASTBase
    
    typedef struct Grammar_Literal_s * Grammar_Literal_ptr;
    typedef struct Grammar_Literal_s {
        //ASTBase
        any parent;
        any childs;
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
        //Literal
    
    } Grammar_Literal_s;
    
    extern void Grammar_Literal__init(DEFAULT_ARGUMENTS);
    extern any Grammar_Literal_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_Literal_getValue(DEFAULT_ARGUMENTS);
    extern any Grammar_Literal_toString(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_NumberLiteral
    any Grammar_NumberLiteral; //Class Grammar_NumberLiteral extends Grammar_Literal
    
    typedef struct Grammar_NumberLiteral_s * Grammar_NumberLiteral_ptr;
    typedef struct Grammar_NumberLiteral_s {
        //ASTBase
        any parent;
        any childs;
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
        //Literal
        //NumberLiteral
    
    } Grammar_NumberLiteral_s;
    
    extern void Grammar_NumberLiteral__init(DEFAULT_ARGUMENTS);
    extern any Grammar_NumberLiteral_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_NumberLiteral_parse(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_StringLiteral
    any Grammar_StringLiteral; //Class Grammar_StringLiteral extends Grammar_Literal
    
    typedef struct Grammar_StringLiteral_s * Grammar_StringLiteral_ptr;
    typedef struct Grammar_StringLiteral_s {
        //ASTBase
        any parent;
        any childs;
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
        //Literal
        //StringLiteral
    
    } Grammar_StringLiteral_s;
    
    extern void Grammar_StringLiteral__init(DEFAULT_ARGUMENTS);
    extern any Grammar_StringLiteral_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_StringLiteral_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_StringLiteral_getValue(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_RegExpLiteral
    any Grammar_RegExpLiteral; //Class Grammar_RegExpLiteral extends Grammar_Literal
    
    typedef struct Grammar_RegExpLiteral_s * Grammar_RegExpLiteral_ptr;
    typedef struct Grammar_RegExpLiteral_s {
        //ASTBase
        any parent;
        any childs;
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
        //Literal
        //RegExpLiteral
    
    } Grammar_RegExpLiteral_s;
    
    extern void Grammar_RegExpLiteral__init(DEFAULT_ARGUMENTS);
    extern any Grammar_RegExpLiteral_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_RegExpLiteral_parse(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_ArrayLiteral
    any Grammar_ArrayLiteral; //Class Grammar_ArrayLiteral extends Grammar_Literal
    
    typedef struct Grammar_ArrayLiteral_s * Grammar_ArrayLiteral_ptr;
    typedef struct Grammar_ArrayLiteral_s {
        //ASTBase
        any parent;
        any childs;
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
        //Literal
        //ArrayLiteral
        any items;
        any nameDecl;
    
    } Grammar_ArrayLiteral_s;
    
    extern void Grammar_ArrayLiteral__init(DEFAULT_ARGUMENTS);
    extern any Grammar_ArrayLiteral_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_ArrayLiteral_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_ArrayLiteral_declare(DEFAULT_ARGUMENTS);
    extern any Grammar_ArrayLiteral_getResultType(DEFAULT_ARGUMENTS);
    extern any Grammar_ArrayLiteral_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_ObjectLiteral
    any Grammar_ObjectLiteral; //Class Grammar_ObjectLiteral extends Grammar_Literal
    
    typedef struct Grammar_ObjectLiteral_s * Grammar_ObjectLiteral_ptr;
    typedef struct Grammar_ObjectLiteral_s {
        //ASTBase
        any parent;
        any childs;
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
        //Literal
        //ObjectLiteral
        any items;
        any produceType;
        any nameDecl;
    
    } Grammar_ObjectLiteral_s;
    
    extern void Grammar_ObjectLiteral__init(DEFAULT_ARGUMENTS);
    extern any Grammar_ObjectLiteral_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_ObjectLiteral_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_ObjectLiteral_forEach(DEFAULT_ARGUMENTS);
    extern any Grammar_ObjectLiteral_declare(DEFAULT_ARGUMENTS);
    extern any Grammar_ObjectLiteral_getResultType(DEFAULT_ARGUMENTS);
    extern any Grammar_ObjectLiteral_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_NameValuePair
    any Grammar_NameValuePair; //Class Grammar_NameValuePair extends ASTBase
    
    typedef struct Grammar_NameValuePair_s * Grammar_NameValuePair_ptr;
    typedef struct Grammar_NameValuePair_s {
        //ASTBase
        any parent;
        any childs;
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
        //NameValuePair
        any value;
        any nameDecl;
    
    } Grammar_NameValuePair_s;
    
    extern void Grammar_NameValuePair__init(DEFAULT_ARGUMENTS);
    extern any Grammar_NameValuePair_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_NameValuePair_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_NameValuePair_forEach(DEFAULT_ARGUMENTS);
    extern any Grammar_NameValuePair_declare(DEFAULT_ARGUMENTS);
    extern any Grammar_NameValuePair_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_FreeObjectLiteral
    any Grammar_FreeObjectLiteral; //Class Grammar_FreeObjectLiteral extends Grammar_ObjectLiteral
    
    typedef struct Grammar_FreeObjectLiteral_s * Grammar_FreeObjectLiteral_ptr;
    typedef struct Grammar_FreeObjectLiteral_s {
        //ASTBase
        any parent;
        any childs;
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
        //Literal
        //ObjectLiteral
        any items;
        any produceType;
        any nameDecl;
        //FreeObjectLiteral
    
    } Grammar_FreeObjectLiteral_s;
    
    extern void Grammar_FreeObjectLiteral__init(DEFAULT_ARGUMENTS);
    extern any Grammar_FreeObjectLiteral_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_FreeObjectLiteral_parse(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_ParenExpression
    any Grammar_ParenExpression; //Class Grammar_ParenExpression extends ASTBase
    
    typedef struct Grammar_ParenExpression_s * Grammar_ParenExpression_ptr;
    typedef struct Grammar_ParenExpression_s {
        //ASTBase
        any parent;
        any childs;
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
        //ParenExpression
        any expr;
    
    } Grammar_ParenExpression_s;
    
    extern void Grammar_ParenExpression__init(DEFAULT_ARGUMENTS);
    extern any Grammar_ParenExpression_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_ParenExpression_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_ParenExpression_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_FunctionDeclaration
    any Grammar_FunctionDeclaration; //Class Grammar_FunctionDeclaration extends ASTBase
    
    typedef struct Grammar_FunctionDeclaration_s * Grammar_FunctionDeclaration_ptr;
    typedef struct Grammar_FunctionDeclaration_s {
        //ASTBase
        any parent;
        any childs;
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
        //FunctionDeclaration
        any specifier;
        any paramsDeclarations;
        any definePropItems;
        any body;
        any hasExceptionBlock;
        any EndFnLineNum;
        any nameDecl;
        any declared;
    
    } Grammar_FunctionDeclaration_s;
    
    extern void Grammar_FunctionDeclaration__init(DEFAULT_ARGUMENTS);
    extern any Grammar_FunctionDeclaration_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_FunctionDeclaration_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_FunctionDeclaration_parseParametersAndBody(DEFAULT_ARGUMENTS);
    extern any Grammar_FunctionDeclaration_declare(DEFAULT_ARGUMENTS);
    extern any Grammar_FunctionDeclaration_addMethodToOwnerNameDecl(DEFAULT_ARGUMENTS);
    extern any Grammar_FunctionDeclaration_createReturnType(DEFAULT_ARGUMENTS);
    extern any Grammar_FunctionDeclaration_produce(DEFAULT_ARGUMENTS);
    extern any Grammar_FunctionDeclaration_produceBody(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_DefinePropertyItem
    any Grammar_DefinePropertyItem; //Class Grammar_DefinePropertyItem extends ASTBase
    
    typedef struct Grammar_DefinePropertyItem_s * Grammar_DefinePropertyItem_ptr;
    typedef struct Grammar_DefinePropertyItem_s {
        //ASTBase
        any parent;
        any childs;
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
        //DefinePropertyItem
        any negated;
    
    } Grammar_DefinePropertyItem_s;
    
    extern void Grammar_DefinePropertyItem__init(DEFAULT_ARGUMENTS);
    extern any Grammar_DefinePropertyItem_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_DefinePropertyItem_parse(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_MethodDeclaration
    any Grammar_MethodDeclaration; //Class Grammar_MethodDeclaration extends Grammar_FunctionDeclaration
    
    typedef struct Grammar_MethodDeclaration_s * Grammar_MethodDeclaration_ptr;
    typedef struct Grammar_MethodDeclaration_s {
        //ASTBase
        any parent;
        any childs;
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
        //FunctionDeclaration
        any specifier;
        any paramsDeclarations;
        any definePropItems;
        any body;
        any hasExceptionBlock;
        any EndFnLineNum;
        any nameDecl;
        any declared;
        //MethodDeclaration
    
    } Grammar_MethodDeclaration_s;
    
    extern void Grammar_MethodDeclaration__init(DEFAULT_ARGUMENTS);
    extern any Grammar_MethodDeclaration_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_MethodDeclaration_parse(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_ClassDeclaration
    any Grammar_ClassDeclaration; //Class Grammar_ClassDeclaration extends ASTBase
    
    typedef struct Grammar_ClassDeclaration_s * Grammar_ClassDeclaration_ptr;
    typedef struct Grammar_ClassDeclaration_s {
        //ASTBase
        any parent;
        any childs;
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
        //ClassDeclaration
        any varRefSuper;
        any body;
        any nameDecl;
    
    } Grammar_ClassDeclaration_s;
    
    extern void Grammar_ClassDeclaration__init(DEFAULT_ARGUMENTS);
    extern any Grammar_ClassDeclaration_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_ClassDeclaration_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_ClassDeclaration_declare(DEFAULT_ARGUMENTS);
    extern any Grammar_ClassDeclaration_validatePropertyAccess(DEFAULT_ARGUMENTS);
    extern any Grammar_ClassDeclaration_processAppendToExtends(DEFAULT_ARGUMENTS);
    extern any Grammar_ClassDeclaration_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_ConstructorDeclaration
    any Grammar_ConstructorDeclaration; //Class Grammar_ConstructorDeclaration extends Grammar_MethodDeclaration
    
    typedef struct Grammar_ConstructorDeclaration_s * Grammar_ConstructorDeclaration_ptr;
    typedef struct Grammar_ConstructorDeclaration_s {
        //ASTBase
        any parent;
        any childs;
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
        //FunctionDeclaration
        any specifier;
        any paramsDeclarations;
        any definePropItems;
        any body;
        any hasExceptionBlock;
        any EndFnLineNum;
        any nameDecl;
        any declared;
        //MethodDeclaration
        //ConstructorDeclaration
    
    } Grammar_ConstructorDeclaration_s;
    
    extern void Grammar_ConstructorDeclaration__init(DEFAULT_ARGUMENTS);
    extern any Grammar_ConstructorDeclaration_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_ConstructorDeclaration_parse(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_AppendToDeclaration
    any Grammar_AppendToDeclaration; //Class Grammar_AppendToDeclaration extends Grammar_ClassDeclaration
    
    typedef struct Grammar_AppendToDeclaration_s * Grammar_AppendToDeclaration_ptr;
    typedef struct Grammar_AppendToDeclaration_s {
        //ASTBase
        any parent;
        any childs;
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
        //ClassDeclaration
        any varRefSuper;
        any body;
        any nameDecl;
        //AppendToDeclaration
        any toNamespace;
        any varRef;
    
    } Grammar_AppendToDeclaration_s;
    
    extern void Grammar_AppendToDeclaration__init(DEFAULT_ARGUMENTS);
    extern any Grammar_AppendToDeclaration_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_AppendToDeclaration_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_AppendToDeclaration_processAppendToExtends(DEFAULT_ARGUMENTS);
    extern any Grammar_AppendToDeclaration_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_NamespaceDeclaration
    any Grammar_NamespaceDeclaration; //Class Grammar_NamespaceDeclaration extends Grammar_ClassDeclaration
    
    typedef struct Grammar_NamespaceDeclaration_s * Grammar_NamespaceDeclaration_ptr;
    typedef struct Grammar_NamespaceDeclaration_s {
        //ASTBase
        any parent;
        any childs;
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
        //ClassDeclaration
        any varRefSuper;
        any body;
        any nameDecl;
        //NamespaceDeclaration
    
    } Grammar_NamespaceDeclaration_s;
    
    extern void Grammar_NamespaceDeclaration__init(DEFAULT_ARGUMENTS);
    extern any Grammar_NamespaceDeclaration_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_NamespaceDeclaration_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_NamespaceDeclaration_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_DebuggerStatement
    any Grammar_DebuggerStatement; //Class Grammar_DebuggerStatement extends ASTBase
    
    typedef struct Grammar_DebuggerStatement_s * Grammar_DebuggerStatement_ptr;
    typedef struct Grammar_DebuggerStatement_s {
        //ASTBase
        any parent;
        any childs;
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
        //DebuggerStatement
    
    } Grammar_DebuggerStatement_s;
    
    extern void Grammar_DebuggerStatement__init(DEFAULT_ARGUMENTS);
    extern any Grammar_DebuggerStatement_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_DebuggerStatement_parse(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_CompilerStatement
    any Grammar_CompilerStatement; //Class Grammar_CompilerStatement extends ASTBase
    
    typedef struct Grammar_CompilerStatement_s * Grammar_CompilerStatement_ptr;
    typedef struct Grammar_CompilerStatement_s {
        //ASTBase
        any parent;
        any childs;
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
        //CompilerStatement
        any kind;
        any conditional;
        any list;
        any body;
        any endLineInx;
    
    } Grammar_CompilerStatement_s;
    
    extern void Grammar_CompilerStatement__init(DEFAULT_ARGUMENTS);
    extern any Grammar_CompilerStatement_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_CompilerStatement_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_CompilerStatement_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_ImportStatement
    any Grammar_ImportStatement; //Class Grammar_ImportStatement extends ASTBase
    
    typedef struct Grammar_ImportStatement_s * Grammar_ImportStatement_ptr;
    typedef struct Grammar_ImportStatement_s {
        //ASTBase
        any parent;
        any childs;
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
        //ImportStatement
        any global;
        any list;
    
    } Grammar_ImportStatement_s;
    
    extern void Grammar_ImportStatement__init(DEFAULT_ARGUMENTS);
    extern any Grammar_ImportStatement_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_ImportStatement_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_ImportStatement_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_ImportStatementItem
    any Grammar_ImportStatementItem; //Class Grammar_ImportStatementItem extends ASTBase
    
    typedef struct Grammar_ImportStatementItem_s * Grammar_ImportStatementItem_ptr;
    typedef struct Grammar_ImportStatementItem_s {
        //ASTBase
        any parent;
        any childs;
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
        //ImportStatementItem
        any importParameter;
        any importedModule;
        any nameDecl;
    
    } Grammar_ImportStatementItem_s;
    
    extern void Grammar_ImportStatementItem__init(DEFAULT_ARGUMENTS);
    extern any Grammar_ImportStatementItem_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_ImportStatementItem_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_ImportStatementItem_declare(DEFAULT_ARGUMENTS);
    extern any Grammar_ImportStatementItem_produce(DEFAULT_ARGUMENTS);
    extern any Grammar_ImportStatementItem_getNodeJSRequireFileRef(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_DeclareStatement
    any Grammar_DeclareStatement; //Class Grammar_DeclareStatement extends ASTBase
    
    typedef struct Grammar_DeclareStatement_s * Grammar_DeclareStatement_ptr;
    typedef struct Grammar_DeclareStatement_s {
        //ASTBase
        any parent;
        any childs;
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
        //DeclareStatement
        any varRef;
        any names;
        any list;
        any specifier;
        any globVar;
    
    } Grammar_DeclareStatement_s;
    
    extern void Grammar_DeclareStatement__init(DEFAULT_ARGUMENTS);
    extern any Grammar_DeclareStatement_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_DeclareStatement_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_DeclareStatement_declare(DEFAULT_ARGUMENTS);
    extern any Grammar_DeclareStatement_evaluateAssignments(DEFAULT_ARGUMENTS);
    extern any Grammar_DeclareStatement_setTypes(DEFAULT_ARGUMENTS);
    extern any Grammar_DeclareStatement_setSubType(DEFAULT_ARGUMENTS);
    extern any Grammar_DeclareStatement_validatePropertyAccess(DEFAULT_ARGUMENTS);
    extern any Grammar_DeclareStatement_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_DefaultAssignment
    any Grammar_DefaultAssignment; //Class Grammar_DefaultAssignment extends ASTBase
    
    typedef struct Grammar_DefaultAssignment_s * Grammar_DefaultAssignment_ptr;
    typedef struct Grammar_DefaultAssignment_s {
        //ASTBase
        any parent;
        any childs;
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
        //DefaultAssignment
        any assignment;
    
    } Grammar_DefaultAssignment_s;
    
    extern void Grammar_DefaultAssignment__init(DEFAULT_ARGUMENTS);
    extern any Grammar_DefaultAssignment_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_DefaultAssignment_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_DefaultAssignment_produce(DEFAULT_ARGUMENTS);
    extern any Grammar_DefaultAssignment_process(DEFAULT_ARGUMENTS);
    extern any Grammar_DefaultAssignment_processItems(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_EndStatement
    any Grammar_EndStatement; //Class Grammar_EndStatement extends ASTBase
    
    typedef struct Grammar_EndStatement_s * Grammar_EndStatement_ptr;
    typedef struct Grammar_EndStatement_s {
        //ASTBase
        any parent;
        any childs;
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
        //EndStatement
        any references;
    
    } Grammar_EndStatement_s;
    
    extern void Grammar_EndStatement__init(DEFAULT_ARGUMENTS);
    extern any Grammar_EndStatement_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_EndStatement_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_EndStatement_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_YieldExpression
    any Grammar_YieldExpression; //Class Grammar_YieldExpression extends ASTBase
    
    typedef struct Grammar_YieldExpression_s * Grammar_YieldExpression_ptr;
    typedef struct Grammar_YieldExpression_s {
        //ASTBase
        any parent;
        any childs;
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
        //YieldExpression
        any specifier;
        any fnCall;
        any arrExpression;
    
    } Grammar_YieldExpression_s;
    
    extern void Grammar_YieldExpression__init(DEFAULT_ARGUMENTS);
    extern any Grammar_YieldExpression_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_YieldExpression_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_YieldExpression_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_FunctionCall
    any Grammar_FunctionCall; //Class Grammar_FunctionCall extends ASTBase
    
    typedef struct Grammar_FunctionCall_s * Grammar_FunctionCall_ptr;
    typedef struct Grammar_FunctionCall_s {
        //ASTBase
        any parent;
        any childs;
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
        //FunctionCall
        any varRef;
    
    } Grammar_FunctionCall_s;
    
    extern void Grammar_FunctionCall__init(DEFAULT_ARGUMENTS);
    extern any Grammar_FunctionCall_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_FunctionCall_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_FunctionCall_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_CaseStatement
    any Grammar_CaseStatement; //Class Grammar_CaseStatement extends ASTBase
    
    typedef struct Grammar_CaseStatement_s * Grammar_CaseStatement_ptr;
    typedef struct Grammar_CaseStatement_s {
        //ASTBase
        any parent;
        any childs;
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
        //CaseStatement
        any varRef;
        any isInstanceof;
        any cases;
        any elseBody;
    
    } Grammar_CaseStatement_s;
    
    extern void Grammar_CaseStatement__init(DEFAULT_ARGUMENTS);
    extern any Grammar_CaseStatement_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_CaseStatement_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_CaseStatement_produce(DEFAULT_ARGUMENTS);
    extern any Grammar_CaseStatement_produceInstanceOfLoop(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_WhenSection
    any Grammar_WhenSection; //Class Grammar_WhenSection extends ASTBase
    
    typedef struct Grammar_WhenSection_s * Grammar_WhenSection_ptr;
    typedef struct Grammar_WhenSection_s {
        //ASTBase
        any parent;
        any childs;
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
        //WhenSection
        any expressions;
        any body;
    
    } Grammar_WhenSection_s;
    
    extern void Grammar_WhenSection__init(DEFAULT_ARGUMENTS);
    extern any Grammar_WhenSection_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_WhenSection_parse(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_Statement
    any Grammar_Statement; //Class Grammar_Statement extends ASTBase
    
    typedef struct Grammar_Statement_s * Grammar_Statement_ptr;
    typedef struct Grammar_Statement_s {
        //ASTBase
        any parent;
        any childs;
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
        //Statement
        any adjectives;
        any specific;
        any preParsedVarRef;
        any intoVars;
        any lastSourceLineNum;
    
    } Grammar_Statement_s;
    
    extern void Grammar_Statement__init(DEFAULT_ARGUMENTS);
    extern any Grammar_Statement_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_Statement_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_Statement_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_Body
    any Grammar_Body; //Class Grammar_Body extends ASTBase
    
    typedef struct Grammar_Body_s * Grammar_Body_ptr;
    typedef struct Grammar_Body_s {
        //ASTBase
        any parent;
        any childs;
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
        //Body
        any statements;
    
    } Grammar_Body_s;
    
    extern void Grammar_Body__init(DEFAULT_ARGUMENTS);
    extern any Grammar_Body_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_Body_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_Body_validate(DEFAULT_ARGUMENTS);
    extern any Grammar_Body_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_SingleLineBody
    any Grammar_SingleLineBody; //Class Grammar_SingleLineBody extends Grammar_Body
    
    typedef struct Grammar_SingleLineBody_s * Grammar_SingleLineBody_ptr;
    typedef struct Grammar_SingleLineBody_s {
        //ASTBase
        any parent;
        any childs;
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
        //Body
        any statements;
        //SingleLineBody
    
    } Grammar_SingleLineBody_s;
    
    extern void Grammar_SingleLineBody__init(DEFAULT_ARGUMENTS);
    extern any Grammar_SingleLineBody_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_SingleLineBody_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_SingleLineBody_produce(DEFAULT_ARGUMENTS);
    

//--------------
    // Grammar_Module
    any Grammar_Module; //Class Grammar_Module extends Grammar_Body
    
    typedef struct Grammar_Module_s * Grammar_Module_ptr;
    typedef struct Grammar_Module_s {
        //ASTBase
        any parent;
        any childs;
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
        //Body
        any statements;
        //Module
        any isMain;
        any exportDefault;
        any fileInfo;
        any exports;
        any exportsReplaced;
        any requireCallNodes;
        any referenceCount;
    
    } Grammar_Module_s;
    
    extern void Grammar_Module__init(DEFAULT_ARGUMENTS);
    extern any Grammar_Module_newFromObject(DEFAULT_ARGUMENTS);
    extern any Grammar_Module_parse(DEFAULT_ARGUMENTS);
    extern any Grammar_Module_getCompiledLines(DEFAULT_ARGUMENTS);
    extern any Grammar_Module_getCompiledText(DEFAULT_ARGUMENTS);
    extern any Grammar_Module_addToExport(DEFAULT_ARGUMENTS);
    extern any Grammar_Module_confirmExports(DEFAULT_ARGUMENTS);
    extern any Grammar_Module_produce(DEFAULT_ARGUMENTS);
extern any Grammar_autoCapitalizeCoreClasses(DEFAULT_ARGUMENTS);
#endif
