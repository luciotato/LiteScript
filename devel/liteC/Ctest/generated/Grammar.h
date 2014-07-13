#ifndef GRAMMAR_C__H
#define GRAMMAR_C__H
#include "_dispatcher.h"
//-------------------------
//Module Grammar
//-------------------------
extern void Grammar__moduleInit(void);
   

//--------------
   // Grammar_PrintStatement extends ASTBase
   
   
   extern any Grammar_PrintStatement; //Class Object
   
   typedef struct Grammar_PrintStatement_s * Grammar_PrintStatement_ptr;
   typedef struct Grammar_PrintStatement_s {
       any
           args
   ;
   } Grammar_PrintStatement_s;
   
   extern void Grammar_PrintStatement__init(DEFAULT_ARGUMENTS);
   extern any Grammar_PrintStatement_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_PrintStatement_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_VarDeclList extends ASTBase
   
   
   extern any Grammar_VarDeclList; //Class Object
   
   typedef struct Grammar_VarDeclList_s * Grammar_VarDeclList_ptr;
   typedef struct Grammar_VarDeclList_s {
       any
           list
   ;
   } Grammar_VarDeclList_s;
   
   extern void Grammar_VarDeclList__init(DEFAULT_ARGUMENTS);
   extern any Grammar_VarDeclList_parseList(DEFAULT_ARGUMENTS);
   extern any Grammar_VarDeclList_addToAllProperties(DEFAULT_ARGUMENTS);
   extern any Grammar_VarDeclList_getNames(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_VarStatement extends Grammar_VarDeclList
   
   
   extern any Grammar_VarStatement; //Class Object
   
   typedef struct Grammar_VarStatement_s * Grammar_VarStatement_ptr;
   typedef struct Grammar_VarStatement_s {
   
   } Grammar_VarStatement_s;
   
   extern void Grammar_VarStatement__init(DEFAULT_ARGUMENTS);
   extern any Grammar_VarStatement_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_VarStatement_declare(DEFAULT_ARGUMENTS);
   extern any Grammar_VarStatement_evaluateAssignments(DEFAULT_ARGUMENTS);
   extern any Grammar_VarStatement_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_VariableDecl extends ASTBase
   
   
   extern any Grammar_VariableDecl; //Class Object
   
   typedef struct Grammar_VariableDecl_s * Grammar_VariableDecl_ptr;
   typedef struct Grammar_VariableDecl_s {
       any
           type,
           itemType,
           aliasVarRef,
           assignedValue,
           nameDecl
   ;
   } Grammar_VariableDecl_s;
   
   extern void Grammar_VariableDecl__init(DEFAULT_ARGUMENTS);
   extern any Grammar_VariableDecl_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_VariableDecl_createNameDeclaration(DEFAULT_ARGUMENTS);
   extern any Grammar_VariableDecl_declareInScope(DEFAULT_ARGUMENTS);
   extern any Grammar_VariableDecl_getTypeFromAssignedValue(DEFAULT_ARGUMENTS);
   extern any Grammar_VariableDecl_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_PropertiesDeclaration extends Grammar_VarDeclList
   
   
   extern any Grammar_PropertiesDeclaration; //Class Object
   
   typedef struct Grammar_PropertiesDeclaration_s * Grammar_PropertiesDeclaration_ptr;
   typedef struct Grammar_PropertiesDeclaration_s {
       any
           list,
           nameDecl,
           declared,
           scope
   ;
   } Grammar_PropertiesDeclaration_s;
   
   extern void Grammar_PropertiesDeclaration__init(DEFAULT_ARGUMENTS);
   extern any Grammar_PropertiesDeclaration_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_PropertiesDeclaration_declare(DEFAULT_ARGUMENTS);
   extern any Grammar_PropertiesDeclaration_evaluateAssignments(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_WithStatement extends ASTBase
   
   
   extern any Grammar_WithStatement; //Class Object
   
   typedef struct Grammar_WithStatement_s * Grammar_WithStatement_ptr;
   typedef struct Grammar_WithStatement_s {
       any
           varRef,
           body,
           nameDecl
   ;
   } Grammar_WithStatement_s;
   
   extern void Grammar_WithStatement__init(DEFAULT_ARGUMENTS);
   extern any Grammar_WithStatement_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_WithStatement_declare(DEFAULT_ARGUMENTS);
   extern any Grammar_WithStatement_evaluateAssignments(DEFAULT_ARGUMENTS);
   extern any Grammar_WithStatement_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_TryCatch extends ASTBase
   
   
   extern any Grammar_TryCatch; //Class Object
   
   typedef struct Grammar_TryCatch_s * Grammar_TryCatch_ptr;
   typedef struct Grammar_TryCatch_s {
       any
           body,
           exceptionBlock
   ;
   } Grammar_TryCatch_s;
   
   extern void Grammar_TryCatch__init(DEFAULT_ARGUMENTS);
   extern any Grammar_TryCatch_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_TryCatch_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_ExceptionBlock extends ASTBase
   
   
   extern any Grammar_ExceptionBlock; //Class Object
   
   typedef struct Grammar_ExceptionBlock_s * Grammar_ExceptionBlock_ptr;
   typedef struct Grammar_ExceptionBlock_s {
       any
           catchVar,
           body,
           finallyBody
   ;
   } Grammar_ExceptionBlock_s;
   
   extern void Grammar_ExceptionBlock__init(DEFAULT_ARGUMENTS);
   extern any Grammar_ExceptionBlock_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_ExceptionBlock_declare(DEFAULT_ARGUMENTS);
   extern any Grammar_ExceptionBlock_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_ThrowStatement extends ASTBase
   
   
   extern any Grammar_ThrowStatement; //Class Object
   
   typedef struct Grammar_ThrowStatement_s * Grammar_ThrowStatement_ptr;
   typedef struct Grammar_ThrowStatement_s {
       any
           specifier,
           expr
   ;
   } Grammar_ThrowStatement_s;
   
   extern void Grammar_ThrowStatement__init(DEFAULT_ARGUMENTS);
   extern any Grammar_ThrowStatement_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_ThrowStatement_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_ReturnStatement extends ASTBase
   
   
   extern any Grammar_ReturnStatement; //Class Object
   
   typedef struct Grammar_ReturnStatement_s * Grammar_ReturnStatement_ptr;
   typedef struct Grammar_ReturnStatement_s {
       any
           expr
   ;
   } Grammar_ReturnStatement_s;
   
   extern void Grammar_ReturnStatement__init(DEFAULT_ARGUMENTS);
   extern any Grammar_ReturnStatement_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_ReturnStatement_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_IfStatement extends ASTBase
   
   
   extern any Grammar_IfStatement; //Class Object
   
   typedef struct Grammar_IfStatement_s * Grammar_IfStatement_ptr;
   typedef struct Grammar_IfStatement_s {
       any
           conditional,
           body,
           elseStatement
   ;
   } Grammar_IfStatement_s;
   
   extern void Grammar_IfStatement__init(DEFAULT_ARGUMENTS);
   extern any Grammar_IfStatement_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_IfStatement_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_ElseIfStatement extends ASTBase
   
   
   extern any Grammar_ElseIfStatement; //Class Object
   
   typedef struct Grammar_ElseIfStatement_s * Grammar_ElseIfStatement_ptr;
   typedef struct Grammar_ElseIfStatement_s {
       any
           nextIf
   ;
   } Grammar_ElseIfStatement_s;
   
   extern void Grammar_ElseIfStatement__init(DEFAULT_ARGUMENTS);
   extern any Grammar_ElseIfStatement_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_ElseIfStatement_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_ElseStatement extends ASTBase
   
   
   extern any Grammar_ElseStatement; //Class Object
   
   typedef struct Grammar_ElseStatement_s * Grammar_ElseStatement_ptr;
   typedef struct Grammar_ElseStatement_s {
       any
           body
   ;
   } Grammar_ElseStatement_s;
   
   extern void Grammar_ElseStatement__init(DEFAULT_ARGUMENTS);
   extern any Grammar_ElseStatement_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_ElseStatement_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_DoLoop extends ASTBase
   
   
   extern any Grammar_DoLoop; //Class Object
   
   typedef struct Grammar_DoLoop_s * Grammar_DoLoop_ptr;
   typedef struct Grammar_DoLoop_s {
       any
           preWhileUntilExpression,
           body,
           postWhileUntilExpression
   ;
   } Grammar_DoLoop_s;
   
   extern void Grammar_DoLoop__init(DEFAULT_ARGUMENTS);
   extern any Grammar_DoLoop_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_DoLoop_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_WhileUntilLoop extends Grammar_DoLoop
   
   
   extern any Grammar_WhileUntilLoop; //Class Object
   
   typedef struct Grammar_WhileUntilLoop_s * Grammar_WhileUntilLoop_ptr;
   typedef struct Grammar_WhileUntilLoop_s {
       any
           preWhileUntilExpression,
           body
   ;
   } Grammar_WhileUntilLoop_s;
   
   extern void Grammar_WhileUntilLoop__init(DEFAULT_ARGUMENTS);
   extern any Grammar_WhileUntilLoop_parse(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_WhileUntilExpression extends ASTBase
   
   
   extern any Grammar_WhileUntilExpression; //Class Object
   
   typedef struct Grammar_WhileUntilExpression_s * Grammar_WhileUntilExpression_ptr;
   typedef struct Grammar_WhileUntilExpression_s {
       any
           expr
   ;
   } Grammar_WhileUntilExpression_s;
   
   extern void Grammar_WhileUntilExpression__init(DEFAULT_ARGUMENTS);
   extern any Grammar_WhileUntilExpression_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_WhileUntilExpression_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_LoopControlStatement extends ASTBase
   
   
   extern any Grammar_LoopControlStatement; //Class Object
   
   typedef struct Grammar_LoopControlStatement_s * Grammar_LoopControlStatement_ptr;
   typedef struct Grammar_LoopControlStatement_s {
       any
           control
   ;
   } Grammar_LoopControlStatement_s;
   
   extern void Grammar_LoopControlStatement__init(DEFAULT_ARGUMENTS);
   extern any Grammar_LoopControlStatement_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_LoopControlStatement_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_DoNothingStatement extends ASTBase
   
   
   extern any Grammar_DoNothingStatement; //Class Object
   
   typedef struct Grammar_DoNothingStatement_s * Grammar_DoNothingStatement_ptr;
   typedef struct Grammar_DoNothingStatement_s {
   
   } Grammar_DoNothingStatement_s;
   
   extern void Grammar_DoNothingStatement__init(DEFAULT_ARGUMENTS);
   extern any Grammar_DoNothingStatement_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_DoNothingStatement_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_ForStatement extends ASTBase
   
   
   extern any Grammar_ForStatement; //Class Object
   
   typedef struct Grammar_ForStatement_s * Grammar_ForStatement_ptr;
   typedef struct Grammar_ForStatement_s {
       any
           variant
   ;
   } Grammar_ForStatement_s;
   
   extern void Grammar_ForStatement__init(DEFAULT_ARGUMENTS);
   extern any Grammar_ForStatement_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_ForStatement_declare(DEFAULT_ARGUMENTS);
   extern any Grammar_ForStatement_evaluateAssignments(DEFAULT_ARGUMENTS);
   extern any Grammar_ForStatement_validatePropertyAccess(DEFAULT_ARGUMENTS);
   extern any Grammar_ForStatement_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_ForEachProperty extends ASTBase
   
   
   extern any Grammar_ForEachProperty; //Class Object
   
   typedef struct Grammar_ForEachProperty_s * Grammar_ForEachProperty_ptr;
   typedef struct Grammar_ForEachProperty_s {
       any
           indexVar,
           mainVar,
           iterable,
           where,
           body
   ;
   } Grammar_ForEachProperty_s;
   
   extern void Grammar_ForEachProperty__init(DEFAULT_ARGUMENTS);
   extern any Grammar_ForEachProperty_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_ForEachProperty_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_ForEachInArray extends ASTBase
   
   
   extern any Grammar_ForEachInArray; //Class Object
   
   typedef struct Grammar_ForEachInArray_s * Grammar_ForEachInArray_ptr;
   typedef struct Grammar_ForEachInArray_s {
       any
           indexVar,
           mainVar,
           iterable,
           where,
           body,
           isMap
   ;
   } Grammar_ForEachInArray_s;
   
   extern void Grammar_ForEachInArray__init(DEFAULT_ARGUMENTS);
   extern any Grammar_ForEachInArray_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_ForEachInArray_produce(DEFAULT_ARGUMENTS);
   extern any Grammar_ForEachInArray_produceForMap(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_ForIndexNumeric extends ASTBase
   
   
   extern any Grammar_ForIndexNumeric; //Class Object
   
   typedef struct Grammar_ForIndexNumeric_s * Grammar_ForIndexNumeric_ptr;
   typedef struct Grammar_ForIndexNumeric_s {
       any
           indexVar,
           conditionPrefix,
           endExpression,
           increment,
           body
   ;
   } Grammar_ForIndexNumeric_s;
   
   extern void Grammar_ForIndexNumeric__init(DEFAULT_ARGUMENTS);
   extern any Grammar_ForIndexNumeric_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_ForIndexNumeric_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_ForWhereFilter extends ASTBase
   
   
   extern any Grammar_ForWhereFilter; //Class Object
   
   typedef struct Grammar_ForWhereFilter_s * Grammar_ForWhereFilter_ptr;
   typedef struct Grammar_ForWhereFilter_s {
       any
           filterExpression
   ;
   } Grammar_ForWhereFilter_s;
   
   extern void Grammar_ForWhereFilter__init(DEFAULT_ARGUMENTS);
   extern any Grammar_ForWhereFilter_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_ForWhereFilter_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_DeleteStatement extends ASTBase
   
   
   extern any Grammar_DeleteStatement; //Class Object
   
   typedef struct Grammar_DeleteStatement_s * Grammar_DeleteStatement_ptr;
   typedef struct Grammar_DeleteStatement_s {
       any
           varRef
   ;
   } Grammar_DeleteStatement_s;
   
   extern void Grammar_DeleteStatement__init(DEFAULT_ARGUMENTS);
   extern any Grammar_DeleteStatement_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_DeleteStatement_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_AssignmentStatement extends ASTBase
   
   
   extern any Grammar_AssignmentStatement; //Class Object
   
   typedef struct Grammar_AssignmentStatement_s * Grammar_AssignmentStatement_ptr;
   typedef struct Grammar_AssignmentStatement_s {
       any
           lvalue,
           rvalue
   ;
   } Grammar_AssignmentStatement_s;
   
   extern void Grammar_AssignmentStatement__init(DEFAULT_ARGUMENTS);
   extern any Grammar_AssignmentStatement_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_AssignmentStatement_evaluateAssignments(DEFAULT_ARGUMENTS);
   extern any Grammar_AssignmentStatement_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_VariableRef extends ASTBase
   
   
   extern any Grammar_VariableRef; //Class Object
   
   typedef struct Grammar_VariableRef_s * Grammar_VariableRef_ptr;
   typedef struct Grammar_VariableRef_s {
       any
           preIncDec,
           postIncDec,
           importedModule,
           produceType,
           calcType
   ;
   } Grammar_VariableRef_s;
   
   extern void Grammar_VariableRef__init(DEFAULT_ARGUMENTS);
   extern any Grammar_VariableRef_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_VariableRef_toString(DEFAULT_ARGUMENTS);
   extern any Grammar_VariableRef_validatePropertyAccess(DEFAULT_ARGUMENTS);
   extern any Grammar_VariableRef_tryGetReference(DEFAULT_ARGUMENTS);
   extern any Grammar_VariableRef_getResultType(DEFAULT_ARGUMENTS);
   extern any Grammar_VariableRef_produce(DEFAULT_ARGUMENTS);
   extern any Grammar_VariableRef_calcReference(DEFAULT_ARGUMENTS);
   extern any Grammar_VariableRef_calcReferenceArr(DEFAULT_ARGUMENTS);
   extern any Grammar_VariableRef_getTypeName(DEFAULT_ARGUMENTS);
   extern any Grammar_VariableRef_addArguments(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_Accessor extends ASTBase
   
   
   extern any Grammar_Accessor; //Class Object
   
   typedef struct Grammar_Accessor_s * Grammar_Accessor_ptr;
   typedef struct Grammar_Accessor_s {
   
   } Grammar_Accessor_s;
   
   extern void Grammar_Accessor__init(DEFAULT_ARGUMENTS);
   extern any Grammar_Accessor_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_Accessor_toString(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_PropertyAccess extends Grammar_Accessor
   
   
   extern any Grammar_PropertyAccess; //Class Object
   
   typedef struct Grammar_PropertyAccess_s * Grammar_PropertyAccess_ptr;
   typedef struct Grammar_PropertyAccess_s {
   
   } Grammar_PropertyAccess_s;
   
   extern void Grammar_PropertyAccess__init(DEFAULT_ARGUMENTS);
   extern any Grammar_PropertyAccess_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_PropertyAccess_toString(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_IndexAccess extends Grammar_Accessor
   
   
   extern any Grammar_IndexAccess; //Class Object
   
   typedef struct Grammar_IndexAccess_s * Grammar_IndexAccess_ptr;
   typedef struct Grammar_IndexAccess_s {
   
   } Grammar_IndexAccess_s;
   
   extern void Grammar_IndexAccess__init(DEFAULT_ARGUMENTS);
   extern any Grammar_IndexAccess_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_IndexAccess_toString(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_FunctionArgument extends ASTBase
   
   
   extern any Grammar_FunctionArgument; //Class Object
   
   typedef struct Grammar_FunctionArgument_s * Grammar_FunctionArgument_ptr;
   typedef struct Grammar_FunctionArgument_s {
       any
           expression
   ;
   } Grammar_FunctionArgument_s;
   
   extern void Grammar_FunctionArgument__init(DEFAULT_ARGUMENTS);
   extern any Grammar_FunctionArgument_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_FunctionArgument_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_FunctionAccess extends Grammar_Accessor
   
   
   extern any Grammar_FunctionAccess; //Class Object
   
   typedef struct Grammar_FunctionAccess_s * Grammar_FunctionAccess_ptr;
   typedef struct Grammar_FunctionAccess_s {
       any
           args
   ;
   } Grammar_FunctionAccess_s;
   
   extern void Grammar_FunctionAccess__init(DEFAULT_ARGUMENTS);
   extern any Grammar_FunctionAccess_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_FunctionAccess_toString(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_Operand extends ASTBase
   
   
   extern any Grammar_Operand; //Class Object
   
   typedef struct Grammar_Operand_s * Grammar_Operand_ptr;
   typedef struct Grammar_Operand_s {
       any
           produceType
   ;
   } Grammar_Operand_s;
   
   extern void Grammar_Operand__init(DEFAULT_ARGUMENTS);
   extern any Grammar_Operand_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_Operand_getResultType(DEFAULT_ARGUMENTS);
   extern any Grammar_Operand_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_Oper extends ASTBase
   
   
   extern any Grammar_Oper; //Class Object
   
   typedef struct Grammar_Oper_s * Grammar_Oper_ptr;
   typedef struct Grammar_Oper_s {
       any
           negated,
           left,
           right,
           pushed,
           precedence,
           intoVar,
           produceType
   ;
   } Grammar_Oper_s;
   
   extern void Grammar_Oper__init(DEFAULT_ARGUMENTS);
   extern any Grammar_Oper_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_Oper_getPrecedence(DEFAULT_ARGUMENTS);
   extern any Grammar_Oper_declare(DEFAULT_ARGUMENTS);
   extern any Grammar_Oper_evaluateAssignments(DEFAULT_ARGUMENTS);
   extern any Grammar_Oper_getResultType(DEFAULT_ARGUMENTS);
   extern any Grammar_Oper_declareIntoVar(DEFAULT_ARGUMENTS);
   extern any Grammar_Oper_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_UnaryOper extends Grammar_Oper
   
   
   extern any Grammar_UnaryOper; //Class Object
   
   typedef struct Grammar_UnaryOper_s * Grammar_UnaryOper_ptr;
   typedef struct Grammar_UnaryOper_s {
       any
           produceType
   ;
   } Grammar_UnaryOper_s;
   
   extern void Grammar_UnaryOper__init(DEFAULT_ARGUMENTS);
   extern any Grammar_UnaryOper_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_UnaryOper_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_Expression extends ASTBase
   
   
   extern any Grammar_Expression; //Class Object
   
   typedef struct Grammar_Expression_s * Grammar_Expression_ptr;
   typedef struct Grammar_Expression_s {
       any
           operandCount,
           root,
           ternaryCount,
           produceType
   ;
   } Grammar_Expression_s;
   
   extern void Grammar_Expression__init(DEFAULT_ARGUMENTS);
   extern any Grammar_Expression_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_Expression_growExpressionTree(DEFAULT_ARGUMENTS);
   extern any Grammar_Expression_getResultType(DEFAULT_ARGUMENTS);
   extern any Grammar_Expression_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_Literal extends ASTBase
   
   
   extern any Grammar_Literal; //Class Object
   
   typedef struct Grammar_Literal_s * Grammar_Literal_ptr;
   typedef struct Grammar_Literal_s {
       any
           type
   ;
   } Grammar_Literal_s;
   
   extern void Grammar_Literal__init(DEFAULT_ARGUMENTS);
   extern any Grammar_Literal_getValue(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_NumberLiteral extends Grammar_Literal
   
   
   extern any Grammar_NumberLiteral; //Class Object
   
   typedef struct Grammar_NumberLiteral_s * Grammar_NumberLiteral_ptr;
   typedef struct Grammar_NumberLiteral_s {
       any
           type
   ;
   } Grammar_NumberLiteral_s;
   
   extern void Grammar_NumberLiteral__init(DEFAULT_ARGUMENTS);
   extern any Grammar_NumberLiteral_parse(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_StringLiteral extends Grammar_Literal
   
   
   extern any Grammar_StringLiteral; //Class Object
   
   typedef struct Grammar_StringLiteral_s * Grammar_StringLiteral_ptr;
   typedef struct Grammar_StringLiteral_s {
       any
           type
   ;
   } Grammar_StringLiteral_s;
   
   extern void Grammar_StringLiteral__init(DEFAULT_ARGUMENTS);
   extern any Grammar_StringLiteral_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_StringLiteral_getValue(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_RegExpLiteral extends Grammar_Literal
   
   
   extern any Grammar_RegExpLiteral; //Class Object
   
   typedef struct Grammar_RegExpLiteral_s * Grammar_RegExpLiteral_ptr;
   typedef struct Grammar_RegExpLiteral_s {
       any
           type
   ;
   } Grammar_RegExpLiteral_s;
   
   extern void Grammar_RegExpLiteral__init(DEFAULT_ARGUMENTS);
   extern any Grammar_RegExpLiteral_parse(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_ArrayLiteral extends Grammar_Literal
   
   
   extern any Grammar_ArrayLiteral; //Class Object
   
   typedef struct Grammar_ArrayLiteral_s * Grammar_ArrayLiteral_ptr;
   typedef struct Grammar_ArrayLiteral_s {
       any
           type,
           items
   ;
   } Grammar_ArrayLiteral_s;
   
   extern void Grammar_ArrayLiteral__init(DEFAULT_ARGUMENTS);
   extern any Grammar_ArrayLiteral_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_ArrayLiteral_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_ObjectLiteral extends Grammar_Literal
   
   
   extern any Grammar_ObjectLiteral; //Class Object
   
   typedef struct Grammar_ObjectLiteral_s * Grammar_ObjectLiteral_ptr;
   typedef struct Grammar_ObjectLiteral_s {
       any
           items,
           nameDecl
   ;
   } Grammar_ObjectLiteral_s;
   
   extern void Grammar_ObjectLiteral__init(DEFAULT_ARGUMENTS);
   extern any Grammar_ObjectLiteral_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_ObjectLiteral_forEach(DEFAULT_ARGUMENTS);
   extern any Grammar_ObjectLiteral_declare(DEFAULT_ARGUMENTS);
   extern any Grammar_ObjectLiteral_getResultType(DEFAULT_ARGUMENTS);
   extern any Grammar_ObjectLiteral_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_NameValuePair extends ASTBase
   
   
   extern any Grammar_NameValuePair; //Class Object
   
   typedef struct Grammar_NameValuePair_s * Grammar_NameValuePair_ptr;
   typedef struct Grammar_NameValuePair_s {
       any
           value,
           nameDecl
   ;
   } Grammar_NameValuePair_s;
   
   extern void Grammar_NameValuePair__init(DEFAULT_ARGUMENTS);
   extern any Grammar_NameValuePair_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_NameValuePair_forEach(DEFAULT_ARGUMENTS);
   extern any Grammar_NameValuePair_declare(DEFAULT_ARGUMENTS);
   extern any Grammar_NameValuePair_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_FreeObjectLiteral extends Grammar_ObjectLiteral
   
   
   extern any Grammar_FreeObjectLiteral; //Class Object
   
   typedef struct Grammar_FreeObjectLiteral_s * Grammar_FreeObjectLiteral_ptr;
   typedef struct Grammar_FreeObjectLiteral_s {
   
   } Grammar_FreeObjectLiteral_s;
   
   extern void Grammar_FreeObjectLiteral__init(DEFAULT_ARGUMENTS);
   extern any Grammar_FreeObjectLiteral_parse(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_ParenExpression extends ASTBase
   
   
   extern any Grammar_ParenExpression; //Class Object
   
   typedef struct Grammar_ParenExpression_s * Grammar_ParenExpression_ptr;
   typedef struct Grammar_ParenExpression_s {
       any
           expr,
           produceType
   ;
   } Grammar_ParenExpression_s;
   
   extern void Grammar_ParenExpression__init(DEFAULT_ARGUMENTS);
   extern any Grammar_ParenExpression_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_ParenExpression_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_FunctionDeclaration extends ASTBase
   
   
   extern any Grammar_FunctionDeclaration; //Class Object
   
   typedef struct Grammar_FunctionDeclaration_s * Grammar_FunctionDeclaration_ptr;
   typedef struct Grammar_FunctionDeclaration_s {
       any
           specifier,
           paramsDeclarations,
           definePropItems,
           body,
           EndFnLineNum,
           nameDecl,
           declared,
           scope
   ;
   } Grammar_FunctionDeclaration_s;
   
   extern void Grammar_FunctionDeclaration__init(DEFAULT_ARGUMENTS);
   extern any Grammar_FunctionDeclaration_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_FunctionDeclaration_parseParametersAndBody(DEFAULT_ARGUMENTS);
   extern any Grammar_FunctionDeclaration_declare(DEFAULT_ARGUMENTS);
   extern any Grammar_FunctionDeclaration_addMethodToOwnerNameDecl(DEFAULT_ARGUMENTS);
   extern any Grammar_FunctionDeclaration_createReturnType(DEFAULT_ARGUMENTS);
   extern any Grammar_FunctionDeclaration_produce(DEFAULT_ARGUMENTS);
   extern any Grammar_FunctionDeclaration_produceFunctionBody(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_DefinePropertyItem extends ASTBase
   
   
   extern any Grammar_DefinePropertyItem; //Class Object
   
   typedef struct Grammar_DefinePropertyItem_s * Grammar_DefinePropertyItem_ptr;
   typedef struct Grammar_DefinePropertyItem_s {
       any
           negated
   ;
   } Grammar_DefinePropertyItem_s;
   
   extern void Grammar_DefinePropertyItem__init(DEFAULT_ARGUMENTS);
   extern any Grammar_DefinePropertyItem_parse(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_MethodDeclaration extends Grammar_FunctionDeclaration
   
   
   extern any Grammar_MethodDeclaration; //Class Object
   
   typedef struct Grammar_MethodDeclaration_s * Grammar_MethodDeclaration_ptr;
   typedef struct Grammar_MethodDeclaration_s {
   
   } Grammar_MethodDeclaration_s;
   
   extern void Grammar_MethodDeclaration__init(DEFAULT_ARGUMENTS);
   extern any Grammar_MethodDeclaration_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_MethodDeclaration_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_ClassDeclaration extends ASTBase
   
   
   extern any Grammar_ClassDeclaration; //Class Object
   
   typedef struct Grammar_ClassDeclaration_s * Grammar_ClassDeclaration_ptr;
   typedef struct Grammar_ClassDeclaration_s {
       any
           varRefSuper,
           body,
           nameDecl
   ;
   } Grammar_ClassDeclaration_s;
   
   extern void Grammar_ClassDeclaration__init(DEFAULT_ARGUMENTS);
   extern any Grammar_ClassDeclaration_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_ClassDeclaration_declare(DEFAULT_ARGUMENTS);
   extern any Grammar_ClassDeclaration_produceHeader(DEFAULT_ARGUMENTS);
   extern any Grammar_ClassDeclaration_produce(DEFAULT_ARGUMENTS);
   extern any Grammar_ClassDeclaration_produceStaticListMethodsAndProps(DEFAULT_ARGUMENTS);
   extern any Grammar_ClassDeclaration_produceClassRegistration(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_ConstructorDeclaration extends Grammar_MethodDeclaration
   
   
   extern any Grammar_ConstructorDeclaration; //Class Object
   
   typedef struct Grammar_ConstructorDeclaration_s * Grammar_ConstructorDeclaration_ptr;
   typedef struct Grammar_ConstructorDeclaration_s {
   
   } Grammar_ConstructorDeclaration_s;
   
   extern void Grammar_ConstructorDeclaration__init(DEFAULT_ARGUMENTS);
   extern any Grammar_ConstructorDeclaration_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_ConstructorDeclaration_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_AppendToDeclaration extends Grammar_ClassDeclaration
   
   
   extern any Grammar_AppendToDeclaration; //Class Object
   
   typedef struct Grammar_AppendToDeclaration_s * Grammar_AppendToDeclaration_ptr;
   typedef struct Grammar_AppendToDeclaration_s {
       any
           toNamespace,
           varRef,
           body
   ;
   } Grammar_AppendToDeclaration_s;
   
   extern void Grammar_AppendToDeclaration__init(DEFAULT_ARGUMENTS);
   extern any Grammar_AppendToDeclaration_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_AppendToDeclaration_processAppendTo(DEFAULT_ARGUMENTS);
   extern any Grammar_AppendToDeclaration_produceHeader(DEFAULT_ARGUMENTS);
   extern any Grammar_AppendToDeclaration_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_NamespaceDeclaration extends Grammar_ClassDeclaration
   
   
   extern any Grammar_NamespaceDeclaration; //Class Object
   
   typedef struct Grammar_NamespaceDeclaration_s * Grammar_NamespaceDeclaration_ptr;
   typedef struct Grammar_NamespaceDeclaration_s {
   
   } Grammar_NamespaceDeclaration_s;
   
   extern void Grammar_NamespaceDeclaration__init(DEFAULT_ARGUMENTS);
   extern any Grammar_NamespaceDeclaration_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_NamespaceDeclaration_makeName(DEFAULT_ARGUMENTS);
   extern any Grammar_NamespaceDeclaration_produceHeader(DEFAULT_ARGUMENTS);
   extern any Grammar_NamespaceDeclaration_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_DebuggerStatement extends ASTBase
   
   
   extern any Grammar_DebuggerStatement; //Class Object
   
   typedef struct Grammar_DebuggerStatement_s * Grammar_DebuggerStatement_ptr;
   typedef struct Grammar_DebuggerStatement_s {
   
   } Grammar_DebuggerStatement_s;
   
   extern void Grammar_DebuggerStatement__init(DEFAULT_ARGUMENTS);
   extern any Grammar_DebuggerStatement_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_DebuggerStatement_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_CompilerStatement extends ASTBase
   
   
   extern any Grammar_CompilerStatement; //Class Object
   
   typedef struct Grammar_CompilerStatement_s * Grammar_CompilerStatement_ptr;
   typedef struct Grammar_CompilerStatement_s {
       any
           kind,
           conditional,
           list,
           body,
           endLineInx
   ;
   } Grammar_CompilerStatement_s;
   
   extern void Grammar_CompilerStatement__init(DEFAULT_ARGUMENTS);
   extern any Grammar_CompilerStatement_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_CompilerStatement_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_ImportStatement extends ASTBase
   
   
   extern any Grammar_ImportStatement; //Class Object
   
   typedef struct Grammar_ImportStatement_s * Grammar_ImportStatement_ptr;
   typedef struct Grammar_ImportStatement_s {
       any
           global,
           list
   ;
   } Grammar_ImportStatement_s;
   
   extern void Grammar_ImportStatement__init(DEFAULT_ARGUMENTS);
   extern any Grammar_ImportStatement_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_ImportStatement_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_ImportStatementItem extends ASTBase
   
   
   extern any Grammar_ImportStatementItem; //Class Object
   
   typedef struct Grammar_ImportStatementItem_s * Grammar_ImportStatementItem_ptr;
   typedef struct Grammar_ImportStatementItem_s {
       any
           importParameter,
           importedModule,
           nameDecl
   ;
   } Grammar_ImportStatementItem_s;
   
   extern void Grammar_ImportStatementItem__init(DEFAULT_ARGUMENTS);
   extern any Grammar_ImportStatementItem_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_ImportStatementItem_declare(DEFAULT_ARGUMENTS);
   extern any Grammar_ImportStatementItem_getRefFilename(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_DeclareStatement extends ASTBase
   
   
   extern any Grammar_DeclareStatement; //Class Object
   
   typedef struct Grammar_DeclareStatement_s * Grammar_DeclareStatement_ptr;
   typedef struct Grammar_DeclareStatement_s {
       any
           varRef,
           type,
           names,
           list,
           specifier,
           globVar
   ;
   } Grammar_DeclareStatement_s;
   
   extern void Grammar_DeclareStatement__init(DEFAULT_ARGUMENTS);
   extern any Grammar_DeclareStatement_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_DeclareStatement_declare(DEFAULT_ARGUMENTS);
   extern any Grammar_DeclareStatement_evaluateAssignments(DEFAULT_ARGUMENTS);
   extern any Grammar_DeclareStatement_setTypes(DEFAULT_ARGUMENTS);
   extern any Grammar_DeclareStatement_setSubType(DEFAULT_ARGUMENTS);
   extern any Grammar_DeclareStatement_validatePropertyAccess(DEFAULT_ARGUMENTS);
   extern any Grammar_DeclareStatement_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_DefaultAssignment extends ASTBase
   
   
   extern any Grammar_DefaultAssignment; //Class Object
   
   typedef struct Grammar_DefaultAssignment_s * Grammar_DefaultAssignment_ptr;
   typedef struct Grammar_DefaultAssignment_s {
       any
           assignment
   ;
   } Grammar_DefaultAssignment_s;
   
   extern void Grammar_DefaultAssignment__init(DEFAULT_ARGUMENTS);
   extern any Grammar_DefaultAssignment_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_DefaultAssignment_produce(DEFAULT_ARGUMENTS);
   extern any Grammar_DefaultAssignment_process(DEFAULT_ARGUMENTS);
   extern any Grammar_DefaultAssignment_processItems(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_EndStatement extends ASTBase
   
   
   extern any Grammar_EndStatement; //Class Object
   
   typedef struct Grammar_EndStatement_s * Grammar_EndStatement_ptr;
   typedef struct Grammar_EndStatement_s {
       any
           references
   ;
   } Grammar_EndStatement_s;
   
   extern void Grammar_EndStatement__init(DEFAULT_ARGUMENTS);
   extern any Grammar_EndStatement_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_EndStatement_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_YieldExpression extends ASTBase
   
   
   extern any Grammar_YieldExpression; //Class Object
   
   typedef struct Grammar_YieldExpression_s * Grammar_YieldExpression_ptr;
   typedef struct Grammar_YieldExpression_s {
       any
           specifier,
           fnCall,
           arrExpression
   ;
   } Grammar_YieldExpression_s;
   
   extern void Grammar_YieldExpression__init(DEFAULT_ARGUMENTS);
   extern any Grammar_YieldExpression_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_YieldExpression_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_FunctionCall extends ASTBase
   
   
   extern any Grammar_FunctionCall; //Class Object
   
   typedef struct Grammar_FunctionCall_s * Grammar_FunctionCall_ptr;
   typedef struct Grammar_FunctionCall_s {
       any
           varRef
   ;
   } Grammar_FunctionCall_s;
   
   extern void Grammar_FunctionCall__init(DEFAULT_ARGUMENTS);
   extern any Grammar_FunctionCall_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_FunctionCall_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_SwitchStatement extends ASTBase
   
   
   extern any Grammar_SwitchStatement; //Class Object
   
   typedef struct Grammar_SwitchStatement_s * Grammar_SwitchStatement_ptr;
   typedef struct Grammar_SwitchStatement_s {
       any
           varRef,
           cases,
           defaultBody
   ;
   } Grammar_SwitchStatement_s;
   
   extern void Grammar_SwitchStatement__init(DEFAULT_ARGUMENTS);
   extern any Grammar_SwitchStatement_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_SwitchStatement_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_SwitchCase extends ASTBase
   
   
   extern any Grammar_SwitchCase; //Class Object
   
   typedef struct Grammar_SwitchCase_s * Grammar_SwitchCase_ptr;
   typedef struct Grammar_SwitchCase_s {
       any
           expressions,
           body
   ;
   } Grammar_SwitchCase_s;
   
   extern void Grammar_SwitchCase__init(DEFAULT_ARGUMENTS);
   extern any Grammar_SwitchCase_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_SwitchCase_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_CaseWhenExpression extends ASTBase
   
   
   extern any Grammar_CaseWhenExpression; //Class Object
   
   typedef struct Grammar_CaseWhenExpression_s * Grammar_CaseWhenExpression_ptr;
   typedef struct Grammar_CaseWhenExpression_s {
       any
           varRef,
           cases,
           elseExpression
   ;
   } Grammar_CaseWhenExpression_s;
   
   extern void Grammar_CaseWhenExpression__init(DEFAULT_ARGUMENTS);
   extern any Grammar_CaseWhenExpression_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_CaseWhenExpression_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_CaseWhenSection extends ASTBase
   
   
   extern any Grammar_CaseWhenSection; //Class Object
   
   typedef struct Grammar_CaseWhenSection_s * Grammar_CaseWhenSection_ptr;
   typedef struct Grammar_CaseWhenSection_s {
       any
           parent,
           expressions,
           booleanExpression,
           resultExpression
   ;
   } Grammar_CaseWhenSection_s;
   
   extern void Grammar_CaseWhenSection__init(DEFAULT_ARGUMENTS);
   extern any Grammar_CaseWhenSection_parse(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_Statement extends ASTBase
   
   
   extern any Grammar_Statement; //Class Object
   
   typedef struct Grammar_Statement_s * Grammar_Statement_ptr;
   typedef struct Grammar_Statement_s {
       any
           adjectives,
           specific,
           preParsedVarRef,
           intoVars
   ;
   } Grammar_Statement_s;
   
   extern void Grammar_Statement__init(DEFAULT_ARGUMENTS);
   extern any Grammar_Statement_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_Statement_produce(DEFAULT_ARGUMENTS);
   extern any Grammar_Statement_isDeclaration(DEFAULT_ARGUMENTS);
   extern any Grammar_Statement_isExecutableStatement(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_Body extends ASTBase
   
   
   extern any Grammar_Body; //Class Object
   
   typedef struct Grammar_Body_s * Grammar_Body_ptr;
   typedef struct Grammar_Body_s {
       any
           statements
   ;
   } Grammar_Body_s;
   
   extern void Grammar_Body__init(DEFAULT_ARGUMENTS);
   extern any Grammar_Body_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_Body_validate(DEFAULT_ARGUMENTS);
   extern any Grammar_Body_produce(DEFAULT_ARGUMENTS);
   extern any Grammar_Body_produceDeclaredExternProps(DEFAULT_ARGUMENTS);
   extern any Grammar_Body_produceSustance(DEFAULT_ARGUMENTS);
   extern any Grammar_Body_produceMainFunctionBody(DEFAULT_ARGUMENTS);
   extern any Grammar_Body_producePropertiesInitialValueAssignments(DEFAULT_ARGUMENTS);
   extern any Grammar_Body_produceLooseExecutableStatements(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_SingleLineBody extends Grammar_Body
   
   
   extern any Grammar_SingleLineBody; //Class Object
   
   typedef struct Grammar_SingleLineBody_s * Grammar_SingleLineBody_ptr;
   typedef struct Grammar_SingleLineBody_s {
   
   } Grammar_SingleLineBody_s;
   
   extern void Grammar_SingleLineBody__init(DEFAULT_ARGUMENTS);
   extern any Grammar_SingleLineBody_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_SingleLineBody_produce(DEFAULT_ARGUMENTS);
   

//--------------
   // Grammar_Module extends Grammar_Body
   
   
   extern any Grammar_Module; //Class Object
   
   typedef struct Grammar_Module_s * Grammar_Module_ptr;
   typedef struct Grammar_Module_s {
       any
           isMain,
           exportDefault,
           fileInfo,
           exports,
           exportsReplaced,
           requireCallNodes,
           referenceCount
   ;
   } Grammar_Module_s;
   
   extern void Grammar_Module__init(DEFAULT_ARGUMENTS);
   extern any Grammar_Module_parse(DEFAULT_ARGUMENTS);
   extern any Grammar_Module_getCompiledLines(DEFAULT_ARGUMENTS);
   extern any Grammar_Module_getCompiledText(DEFAULT_ARGUMENTS);
   extern any Grammar_Module_produceDispatcher(DEFAULT_ARGUMENTS);
   extern any Grammar_Module_produce(DEFAULT_ARGUMENTS);
extern any Grammar_autoCapitalizeCoreClasses(DEFAULT_ARGUMENTS);
#endif