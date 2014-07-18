#include "Grammar.h"
//-------------------------
//Module Grammar
//-------------------------
//helper tempvars for 'or' expressions short-circuit evaluation
any __or1,__or2,__or3,__or4,__or5,__or6,__or7,__or8,__or9,__or10,__or11,__or12,__or13;
var Grammar_RESERVED_WORDS;
var Grammar_operatorsPrecedence;
    //-----------------------
    // Class Grammar_PrintStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_PrintStatement_METHODS = {
      { parse_, Grammar_PrintStatement_parse },
      { produce_, Grammar_PrintStatement_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_PrintStatement_PROPS[] = {
    args_
    };
    
    //-----------------------
    // Class Grammar_VarDeclList: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_VarDeclList_METHODS = {
      { parseList_, Grammar_VarDeclList_parseList },
      { addToAllProperties_, Grammar_VarDeclList_addToAllProperties },
      { getNames_, Grammar_VarDeclList_getNames },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_VarDeclList_PROPS[] = {
    list_
    };
    
    //-----------------------
    // Class Grammar_VarStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_VarStatement_METHODS = {
      { parse_, Grammar_VarStatement_parse },
      { declare_, Grammar_VarStatement_declare },
      { evaluateAssignments_, Grammar_VarStatement_evaluateAssignments },
      { produce_, Grammar_VarStatement_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_VarStatement_PROPS[] = {
    };
    
    //-----------------------
    // Class Grammar_VariableDecl: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_VariableDecl_METHODS = {
      { parse_, Grammar_VariableDecl_parse },
      { createNameDeclaration_, Grammar_VariableDecl_createNameDeclaration },
      { declareInScope_, Grammar_VariableDecl_declareInScope },
      { getTypeFromAssignedValue_, Grammar_VariableDecl_getTypeFromAssignedValue },
      { produce_, Grammar_VariableDecl_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_VariableDecl_PROPS[] = {
    aliasVarRef_
    , assignedValue_
    , nameDecl_
    };
    
    //-----------------------
    // Class Grammar_PropertiesDeclaration: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_PropertiesDeclaration_METHODS = {
      { parse_, Grammar_PropertiesDeclaration_parse },
      { declare_, Grammar_PropertiesDeclaration_declare },
      { evaluateAssignments_, Grammar_PropertiesDeclaration_evaluateAssignments },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_PropertiesDeclaration_PROPS[] = {
    nameDecl_
    , declared_
    };
    
    //-----------------------
    // Class Grammar_WithStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_WithStatement_METHODS = {
      { parse_, Grammar_WithStatement_parse },
      { declare_, Grammar_WithStatement_declare },
      { evaluateAssignments_, Grammar_WithStatement_evaluateAssignments },
      { produce_, Grammar_WithStatement_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_WithStatement_PROPS[] = {
    varRef_
    , body_
    , nameDecl_
    };
    
    //-----------------------
    // Class Grammar_TryCatch: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_TryCatch_METHODS = {
      { parse_, Grammar_TryCatch_parse },
      { produce_, Grammar_TryCatch_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_TryCatch_PROPS[] = {
    body_
    , exceptionBlock_
    };
    
    //-----------------------
    // Class Grammar_ExceptionBlock: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_ExceptionBlock_METHODS = {
      { parse_, Grammar_ExceptionBlock_parse },
      { declare_, Grammar_ExceptionBlock_declare },
      { produce_, Grammar_ExceptionBlock_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_ExceptionBlock_PROPS[] = {
    catchVar_
    , body_
    , finallyBody_
    };
    
    //-----------------------
    // Class Grammar_ThrowStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_ThrowStatement_METHODS = {
      { parse_, Grammar_ThrowStatement_parse },
      { produce_, Grammar_ThrowStatement_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_ThrowStatement_PROPS[] = {
    specifier_
    , expr_
    };
    
    //-----------------------
    // Class Grammar_ReturnStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_ReturnStatement_METHODS = {
      { parse_, Grammar_ReturnStatement_parse },
      { produce_, Grammar_ReturnStatement_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_ReturnStatement_PROPS[] = {
    expr_
    };
    
    //-----------------------
    // Class Grammar_IfStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_IfStatement_METHODS = {
      { parse_, Grammar_IfStatement_parse },
      { produce_, Grammar_IfStatement_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_IfStatement_PROPS[] = {
    conditional_
    , body_
    , elseStatement_
    };
    
    //-----------------------
    // Class Grammar_ElseIfStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_ElseIfStatement_METHODS = {
      { parse_, Grammar_ElseIfStatement_parse },
      { produce_, Grammar_ElseIfStatement_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_ElseIfStatement_PROPS[] = {
    nextIf_
    };
    
    //-----------------------
    // Class Grammar_ElseStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_ElseStatement_METHODS = {
      { parse_, Grammar_ElseStatement_parse },
      { produce_, Grammar_ElseStatement_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_ElseStatement_PROPS[] = {
    body_
    };
    
    //-----------------------
    // Class Grammar_DoLoop: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_DoLoop_METHODS = {
      { parse_, Grammar_DoLoop_parse },
      { produce_, Grammar_DoLoop_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_DoLoop_PROPS[] = {
    preWhileUntilExpression_
    , body_
    , postWhileUntilExpression_
    };
    
    //-----------------------
    // Class Grammar_WhileUntilLoop: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_WhileUntilLoop_METHODS = {
      { parse_, Grammar_WhileUntilLoop_parse },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_WhileUntilLoop_PROPS[] = {
    };
    
    //-----------------------
    // Class Grammar_WhileUntilExpression: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_WhileUntilExpression_METHODS = {
      { parse_, Grammar_WhileUntilExpression_parse },
      { produce_, Grammar_WhileUntilExpression_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_WhileUntilExpression_PROPS[] = {
    expr_
    };
    
    //-----------------------
    // Class Grammar_LoopControlStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_LoopControlStatement_METHODS = {
      { parse_, Grammar_LoopControlStatement_parse },
      { produce_, Grammar_LoopControlStatement_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_LoopControlStatement_PROPS[] = {
    control_
    };
    
    //-----------------------
    // Class Grammar_DoNothingStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_DoNothingStatement_METHODS = {
      { parse_, Grammar_DoNothingStatement_parse },
      { produce_, Grammar_DoNothingStatement_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_DoNothingStatement_PROPS[] = {
    };
    
    //-----------------------
    // Class Grammar_ForStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_ForStatement_METHODS = {
      { parse_, Grammar_ForStatement_parse },
      { declare_, Grammar_ForStatement_declare },
      { produce_, Grammar_ForStatement_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_ForStatement_PROPS[] = {
    variant_
    };
    
    //-----------------------
    // Class Grammar_ForEachProperty: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_ForEachProperty_METHODS = {
      { parse_, Grammar_ForEachProperty_parse },
      { declare_, Grammar_ForEachProperty_declare },
      { evaluateAssignments_, Grammar_ForEachProperty_evaluateAssignments },
      { produce_, Grammar_ForEachProperty_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_ForEachProperty_PROPS[] = {
    indexVar_
    , mainVar_
    , iterable_
    , where_
    , body_
    };
    
    //-----------------------
    // Class Grammar_ForEachInArray: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_ForEachInArray_METHODS = {
      { parse_, Grammar_ForEachInArray_parse },
      { declare_, Grammar_ForEachInArray_declare },
      { evaluateAssignments_, Grammar_ForEachInArray_evaluateAssignments },
      { validatePropertyAccess_, Grammar_ForEachInArray_validatePropertyAccess },
      { produce_, Grammar_ForEachInArray_produce },
      { produceForMap_, Grammar_ForEachInArray_produceForMap },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_ForEachInArray_PROPS[] = {
    indexVar_
    , mainVar_
    , iterable_
    , where_
    , body_
    };
    
    //-----------------------
    // Class Grammar_ForIndexNumeric: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_ForIndexNumeric_METHODS = {
      { parse_, Grammar_ForIndexNumeric_parse },
      { declare_, Grammar_ForIndexNumeric_declare },
      { produce_, Grammar_ForIndexNumeric_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_ForIndexNumeric_PROPS[] = {
    indexVar_
    , conditionPrefix_
    , endExpression_
    , increment_
    , body_
    };
    
    //-----------------------
    // Class Grammar_ForWhereFilter: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_ForWhereFilter_METHODS = {
      { parse_, Grammar_ForWhereFilter_parse },
      { produce_, Grammar_ForWhereFilter_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_ForWhereFilter_PROPS[] = {
    filterExpression_
    };
    
    //-----------------------
    // Class Grammar_DeleteStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_DeleteStatement_METHODS = {
      { parse_, Grammar_DeleteStatement_parse },
      { produce_, Grammar_DeleteStatement_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_DeleteStatement_PROPS[] = {
    varRef_
    };
    
    //-----------------------
    // Class Grammar_AssignmentStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_AssignmentStatement_METHODS = {
      { parse_, Grammar_AssignmentStatement_parse },
      { evaluateAssignments_, Grammar_AssignmentStatement_evaluateAssignments },
      { produce_, Grammar_AssignmentStatement_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_AssignmentStatement_PROPS[] = {
    lvalue_
    , rvalue_
    };
    
    //-----------------------
    // Class Grammar_VariableRef: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_VariableRef_METHODS = {
      { parse_, Grammar_VariableRef_parse },
      { toString_, Grammar_VariableRef_toString },
      { validatePropertyAccess_, Grammar_VariableRef_validatePropertyAccess },
      { tryGetReference_, Grammar_VariableRef_tryGetReference },
      { getResultType_, Grammar_VariableRef_getResultType },
      { produce_, Grammar_VariableRef_produce },
      { calcReference_, Grammar_VariableRef_calcReference },
      { calcReferenceArr_, Grammar_VariableRef_calcReferenceArr },
      { getTypeName_, Grammar_VariableRef_getTypeName },
      { addArguments_, Grammar_VariableRef_addArguments },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_VariableRef_PROPS[] = {
    preIncDec_
    , postIncDec_
    , produceType_
    , calcType_
    };
    
    //-----------------------
    // Class Grammar_Accessor: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_Accessor_METHODS = {
      { parse_, Grammar_Accessor_parse },
      { toString_, Grammar_Accessor_toString },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_Accessor_PROPS[] = {
    };
    
    //-----------------------
    // Class Grammar_PropertyAccess: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_PropertyAccess_METHODS = {
      { parse_, Grammar_PropertyAccess_parse },
      { toString_, Grammar_PropertyAccess_toString },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_PropertyAccess_PROPS[] = {
    };
    
    //-----------------------
    // Class Grammar_IndexAccess: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_IndexAccess_METHODS = {
      { parse_, Grammar_IndexAccess_parse },
      { toString_, Grammar_IndexAccess_toString },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_IndexAccess_PROPS[] = {
    };
    
    //-----------------------
    // Class Grammar_FunctionArgument: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_FunctionArgument_METHODS = {
      { parse_, Grammar_FunctionArgument_parse },
      { produce_, Grammar_FunctionArgument_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_FunctionArgument_PROPS[] = {
    expression_
    };
    
    //-----------------------
    // Class Grammar_FunctionAccess: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_FunctionAccess_METHODS = {
      { parse_, Grammar_FunctionAccess_parse },
      { toString_, Grammar_FunctionAccess_toString },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_FunctionAccess_PROPS[] = {
    args_
    };
    
var Grammar_OPERAND_DIRECT_TYPE;
var Grammar_OPERAND_DIRECT_TOKEN;
    //-----------------------
    // Class Grammar_Operand: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_Operand_METHODS = {
      { parse_, Grammar_Operand_parse },
      { getResultType_, Grammar_Operand_getResultType },
      { produce_, Grammar_Operand_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_Operand_PROPS[] = {
    produceType_
    };
    
    //-----------------------
    // Class Grammar_Oper: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_Oper_METHODS = {
      { parse_, Grammar_Oper_parse },
      { getPrecedence_, Grammar_Oper_getPrecedence },
      { declare_, Grammar_Oper_declare },
      { evaluateAssignments_, Grammar_Oper_evaluateAssignments },
      { getResultType_, Grammar_Oper_getResultType },
      { declareIntoVar_, Grammar_Oper_declareIntoVar },
      { produce_, Grammar_Oper_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_Oper_PROPS[] = {
    negated_
    , left_
    , right_
    , pushed_
    , precedence_
    , intoVar_
    , produceType_
    };
    
var Grammar_unaryOperators;
    //-----------------------
    // Class Grammar_UnaryOper: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_UnaryOper_METHODS = {
      { parse_, Grammar_UnaryOper_parse },
      { produce_, Grammar_UnaryOper_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_UnaryOper_PROPS[] = {
    };
    
    //-----------------------
    // Class Grammar_Expression: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_Expression_METHODS = {
      { parse_, Grammar_Expression_parse },
      { growExpressionTree_, Grammar_Expression_growExpressionTree },
      { getResultType_, Grammar_Expression_getResultType },
      { produce_, Grammar_Expression_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_Expression_PROPS[] = {
    operandCount_
    , root_
    , ternaryCount_
    , produceType_
    };
    
    //-----------------------
    // Class Grammar_Literal: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_Literal_METHODS = {
      { getValue_, Grammar_Literal_getValue },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_Literal_PROPS[] = {
    };
    
    //-----------------------
    // Class Grammar_NumberLiteral: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_NumberLiteral_METHODS = {
      { parse_, Grammar_NumberLiteral_parse },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_NumberLiteral_PROPS[] = {
    };
    
    //-----------------------
    // Class Grammar_StringLiteral: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_StringLiteral_METHODS = {
      { parse_, Grammar_StringLiteral_parse },
      { getValue_, Grammar_StringLiteral_getValue },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_StringLiteral_PROPS[] = {
    };
    
    //-----------------------
    // Class Grammar_RegExpLiteral: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_RegExpLiteral_METHODS = {
      { parse_, Grammar_RegExpLiteral_parse },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_RegExpLiteral_PROPS[] = {
    };
    
    //-----------------------
    // Class Grammar_ArrayLiteral: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_ArrayLiteral_METHODS = {
      { parse_, Grammar_ArrayLiteral_parse },
      { declare_, Grammar_ArrayLiteral_declare },
      { getResultType_, Grammar_ArrayLiteral_getResultType },
      { produce_, Grammar_ArrayLiteral_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_ArrayLiteral_PROPS[] = {
    items_
    , nameDecl_
    };
    
    //-----------------------
    // Class Grammar_ObjectLiteral: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_ObjectLiteral_METHODS = {
      { parse_, Grammar_ObjectLiteral_parse },
      { forEach_, Grammar_ObjectLiteral_forEach },
      { declare_, Grammar_ObjectLiteral_declare },
      { getResultType_, Grammar_ObjectLiteral_getResultType },
      { produce_, Grammar_ObjectLiteral_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_ObjectLiteral_PROPS[] = {
    items_
    , produceType_
    , nameDecl_
    };
    
    //-----------------------
    // Class Grammar_NameValuePair: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_NameValuePair_METHODS = {
      { parse_, Grammar_NameValuePair_parse },
      { forEach_, Grammar_NameValuePair_forEach },
      { declare_, Grammar_NameValuePair_declare },
      { produce_, Grammar_NameValuePair_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_NameValuePair_PROPS[] = {
    value_
    , nameDecl_
    };
    
    //-----------------------
    // Class Grammar_FreeObjectLiteral: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_FreeObjectLiteral_METHODS = {
      { parse_, Grammar_FreeObjectLiteral_parse },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_FreeObjectLiteral_PROPS[] = {
    };
    
    //-----------------------
    // Class Grammar_ParenExpression: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_ParenExpression_METHODS = {
      { parse_, Grammar_ParenExpression_parse },
      { produce_, Grammar_ParenExpression_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_ParenExpression_PROPS[] = {
    expr_
    , produceType_
    };
    
    //-----------------------
    // Class Grammar_FunctionDeclaration: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_FunctionDeclaration_METHODS = {
      { parse_, Grammar_FunctionDeclaration_parse },
      { parseParametersAndBody_, Grammar_FunctionDeclaration_parseParametersAndBody },
      { declare_, Grammar_FunctionDeclaration_declare },
      { addMethodToOwnerNameDecl_, Grammar_FunctionDeclaration_addMethodToOwnerNameDecl },
      { createReturnType_, Grammar_FunctionDeclaration_createReturnType },
      { produce_, Grammar_FunctionDeclaration_produce },
      { produceFunctionBody_, Grammar_FunctionDeclaration_produceFunctionBody },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_FunctionDeclaration_PROPS[] = {
    specifier_
    , paramsDeclarations_
    , definePropItems_
    , body_
    , hasExceptionBlock_
    , EndFnLineNum_
    , nameDecl_
    , declared_
    };
    
    //-----------------------
    // Class Grammar_DefinePropertyItem: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_DefinePropertyItem_METHODS = {
      { parse_, Grammar_DefinePropertyItem_parse },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_DefinePropertyItem_PROPS[] = {
    negated_
    };
    
    //-----------------------
    // Class Grammar_MethodDeclaration: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_MethodDeclaration_METHODS = {
      { parse_, Grammar_MethodDeclaration_parse },
      { produce_, Grammar_MethodDeclaration_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_MethodDeclaration_PROPS[] = {
    };
    
    //-----------------------
    // Class Grammar_ClassDeclaration: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_ClassDeclaration_METHODS = {
      { parse_, Grammar_ClassDeclaration_parse },
      { declare_, Grammar_ClassDeclaration_declare },
      { validatePropertyAccess_, Grammar_ClassDeclaration_validatePropertyAccess },
      { processAppendToExtends_, Grammar_ClassDeclaration_processAppendToExtends },
      { produceHeader_, Grammar_ClassDeclaration_produceHeader },
      { produce_, Grammar_ClassDeclaration_produce },
      { outClassTitleComment_, Grammar_ClassDeclaration_outClassTitleComment },
      { produceStaticListMethodsAndProps_, Grammar_ClassDeclaration_produceStaticListMethodsAndProps },
      { produceClassRegistration_, Grammar_ClassDeclaration_produceClassRegistration },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_ClassDeclaration_PROPS[] = {
    varRefSuper_
    , body_
    , nameDecl_
    };
    
    //-----------------------
    // Class Grammar_ConstructorDeclaration: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_ConstructorDeclaration_METHODS = {
      { parse_, Grammar_ConstructorDeclaration_parse },
      { produce_, Grammar_ConstructorDeclaration_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_ConstructorDeclaration_PROPS[] = {
    };
    
    //-----------------------
    // Class Grammar_AppendToDeclaration: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_AppendToDeclaration_METHODS = {
      { parse_, Grammar_AppendToDeclaration_parse },
      { processAppendToExtends_, Grammar_AppendToDeclaration_processAppendToExtends },
      { produceHeader_, Grammar_AppendToDeclaration_produceHeader },
      { produce_, Grammar_AppendToDeclaration_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_AppendToDeclaration_PROPS[] = {
    toNamespace_
    , varRef_
    };
    
    //-----------------------
    // Class Grammar_NamespaceDeclaration: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_NamespaceDeclaration_METHODS = {
      { parse_, Grammar_NamespaceDeclaration_parse },
      { produceCallNamespaceInit_, Grammar_NamespaceDeclaration_produceCallNamespaceInit },
      { makeName_, Grammar_NamespaceDeclaration_makeName },
      { produceHeader_, Grammar_NamespaceDeclaration_produceHeader },
      { produce_, Grammar_NamespaceDeclaration_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_NamespaceDeclaration_PROPS[] = {
    };
    
    //-----------------------
    // Class Grammar_DebuggerStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_DebuggerStatement_METHODS = {
      { parse_, Grammar_DebuggerStatement_parse },
      { produce_, Grammar_DebuggerStatement_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_DebuggerStatement_PROPS[] = {
    };
    
    //-----------------------
    // Class Grammar_CompilerStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_CompilerStatement_METHODS = {
      { parse_, Grammar_CompilerStatement_parse },
      { produce_, Grammar_CompilerStatement_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_CompilerStatement_PROPS[] = {
    kind_
    , conditional_
    , list_
    , body_
    , endLineInx_
    };
    
    //-----------------------
    // Class Grammar_ImportStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_ImportStatement_METHODS = {
      { parse_, Grammar_ImportStatement_parse },
      { produce_, Grammar_ImportStatement_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_ImportStatement_PROPS[] = {
    global_
    , list_
    };
    
    //-----------------------
    // Class Grammar_ImportStatementItem: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_ImportStatementItem_METHODS = {
      { parse_, Grammar_ImportStatementItem_parse },
      { declare_, Grammar_ImportStatementItem_declare },
      { getRefFilename_, Grammar_ImportStatementItem_getRefFilename },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_ImportStatementItem_PROPS[] = {
    importParameter_
    , importedModule_
    , nameDecl_
    };
    
    //-----------------------
    // Class Grammar_DeclareStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_DeclareStatement_METHODS = {
      { parse_, Grammar_DeclareStatement_parse },
      { declare_, Grammar_DeclareStatement_declare },
      { evaluateAssignments_, Grammar_DeclareStatement_evaluateAssignments },
      { setTypes_, Grammar_DeclareStatement_setTypes },
      { setSubType_, Grammar_DeclareStatement_setSubType },
      { validatePropertyAccess_, Grammar_DeclareStatement_validatePropertyAccess },
      { produce_, Grammar_DeclareStatement_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_DeclareStatement_PROPS[] = {
    varRef_
    , names_
    , list_
    , specifier_
    , globVar_
    };
    
    //-----------------------
    // Class Grammar_DefaultAssignment: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_DefaultAssignment_METHODS = {
      { parse_, Grammar_DefaultAssignment_parse },
      { produce_, Grammar_DefaultAssignment_produce },
      { process_, Grammar_DefaultAssignment_process },
      { processItems_, Grammar_DefaultAssignment_processItems },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_DefaultAssignment_PROPS[] = {
    assignment_
    };
    
    //-----------------------
    // Class Grammar_EndStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_EndStatement_METHODS = {
      { parse_, Grammar_EndStatement_parse },
      { produce_, Grammar_EndStatement_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_EndStatement_PROPS[] = {
    references_
    };
    
    //-----------------------
    // Class Grammar_YieldExpression: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_YieldExpression_METHODS = {
      { parse_, Grammar_YieldExpression_parse },
      { produce_, Grammar_YieldExpression_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_YieldExpression_PROPS[] = {
    specifier_
    , fnCall_
    , arrExpression_
    };
    
    //-----------------------
    // Class Grammar_FunctionCall: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_FunctionCall_METHODS = {
      { parse_, Grammar_FunctionCall_parse },
      { produce_, Grammar_FunctionCall_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_FunctionCall_PROPS[] = {
    varRef_
    };
    
    //-----------------------
    // Class Grammar_SwitchStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_SwitchStatement_METHODS = {
      { parse_, Grammar_SwitchStatement_parse },
      { produce_, Grammar_SwitchStatement_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_SwitchStatement_PROPS[] = {
    varRef_
    , cases_
    , defaultBody_
    };
    
    //-----------------------
    // Class Grammar_SwitchCase: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_SwitchCase_METHODS = {
      { parse_, Grammar_SwitchCase_parse },
      { produce_, Grammar_SwitchCase_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_SwitchCase_PROPS[] = {
    expressions_
    , body_
    };
    
    //-----------------------
    // Class Grammar_CaseWhenExpression: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_CaseWhenExpression_METHODS = {
      { parse_, Grammar_CaseWhenExpression_parse },
      { produce_, Grammar_CaseWhenExpression_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_CaseWhenExpression_PROPS[] = {
    varRef_
    , cases_
    , elseExpression_
    };
    
    //-----------------------
    // Class Grammar_CaseWhenSection: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_CaseWhenSection_METHODS = {
      { parse_, Grammar_CaseWhenSection_parse },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_CaseWhenSection_PROPS[] = {
    expressions_
    , booleanExpression_
    , resultExpression_
    };
    
    //-----------------------
    // Class Grammar_Statement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_Statement_METHODS = {
      { parse_, Grammar_Statement_parse },
      { produce_, Grammar_Statement_produce },
      { isDeclaration_, Grammar_Statement_isDeclaration },
      { isExecutableStatement_, Grammar_Statement_isExecutableStatement },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_Statement_PROPS[] = {
    adjectives_
    , specific_
    , preParsedVarRef_
    , intoVars_
    , lastSourceLineNum_
    };
    
    //-----------------------
    // Class Grammar_Body: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_Body_METHODS = {
      { parse_, Grammar_Body_parse },
      { validate_, Grammar_Body_validate },
      { produce_, Grammar_Body_produce },
      { produceDeclaredExternProps_, Grammar_Body_produceDeclaredExternProps },
      { produceSustance_, Grammar_Body_produceSustance },
      { produceMainFunctionBody_, Grammar_Body_produceMainFunctionBody },
      { producePropertiesInitialValueAssignments_, Grammar_Body_producePropertiesInitialValueAssignments },
      { produceLooseExecutableStatements_, Grammar_Body_produceLooseExecutableStatements },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_Body_PROPS[] = {
    statements_
    };
    
    //-----------------------
    // Class Grammar_SingleLineBody: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_SingleLineBody_METHODS = {
      { parse_, Grammar_SingleLineBody_parse },
      { produce_, Grammar_SingleLineBody_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_SingleLineBody_PROPS[] = {
    };
    
    //-----------------------
    // Class Grammar_Module: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr Grammar_Module_METHODS = {
      { parse_, Grammar_Module_parse },
      { getCompiledLines_, Grammar_Module_getCompiledLines },
      { getCompiledText_, Grammar_Module_getCompiledText },
      { produceDispatcher_, Grammar_Module_produceDispatcher },
      { produce_, Grammar_Module_produce },
    
    {0,0}}; //method jmp table initializer end mark
    
    static _posTableItem_t Grammar_Module_PROPS[] = {
    isMain_
    , exportDefault_
    , fileInfo_
    , exports_
    , exportsReplaced_
    , requireCallNodes_
    , referenceCount_
    };
    
var Grammar_StatementsDirect;
var Grammar_AccessorsDirect;
any Grammar_autoCapitalizeCoreClasses(DEFAULT_ARGUMENTS); //forward declare
    

//--------------
    // Grammar_PrintStatement
    any Grammar_PrintStatement; //Class Grammar_PrintStatement extends ASTBase
    
    //auto Grammar_PrintStatement__init
    void Grammar_PrintStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

// `PrintStatement: 'print' [Expression,]`

// This handles `print` followed by an optional comma separated list of expressions

      //properties
        //args: Expression array
      ;

      //method parse()
      any Grammar_PrintStatement_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_PrintStatement));
        //---------
        //this.req 'print'
        METHOD(req_,this)(this,1,(any_arr){any_str("print")});

// At this point we lock because it is definitely a `print` statement. Failure to parse the expression
// from this point is a syntax error.

        //this.lock()
        METHOD(lock_,this)(this,0,NULL);
        //this.args = this.optSeparatedList(Expression,",")
        PROP(args_,this) = METHOD(optSeparatedList_,this)(this,2,(any_arr){Grammar_Expression, any_str(",")});
      return undefined;
      }
    

//--------------
    // Grammar_VarDeclList
    any Grammar_VarDeclList; //Class Grammar_VarDeclList extends ASTBase
    
    //auto Grammar_VarDeclList__init
    void Grammar_VarDeclList__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

      //properties 
        //list: array of VariableDecl 
      ;

      //method parseList
      any Grammar_VarDeclList_parseList(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_VarDeclList));
        //---------
        //.list = .reqSeparatedList(VariableDecl,",")
        PROP(list_,this) = METHOD(reqSeparatedList_,this)(this,2,(any_arr){Grammar_VariableDecl, any_str(",")});
      return undefined;
      }
    

//--------------
    // Grammar_VarStatement
    any Grammar_VarStatement; //Class Grammar_VarStatement extends Grammar_VarDeclList
    
    //auto Grammar_VarStatement__init
    void Grammar_VarStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        Grammar_VarDeclList__init(this,argc,arguments);
    };

// `VarStatement: (var|let) (VariableDecl,)+ `

// `var` followed by a comma separated list of VariableDecl (one or more)

      //method parse()
      any Grammar_VarStatement_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_VarStatement));
        //---------
        //.req 'var','let'
        METHOD(req_,this)(this,2,(any_arr){any_str("var"), any_str("let")});
        //.lock
        METHOD(lock_,this)(this,0,NULL);
        //.parseList
        METHOD(parseList_,this)(this,0,NULL);
      return undefined;
      }
    

//--------------
    // Grammar_VariableDecl
    any Grammar_VariableDecl; //Class Grammar_VariableDecl extends ASTBase
    
    //auto Grammar_VariableDecl__init
    void Grammar_VariableDecl__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

// `VariableDecl: IDENTIFIER [':' dataType-VariableRef] ['=' assignedValue-Expression]`

// (variable name, optional type anotation and optionally assign a value)

// Note: If no value is assigned, `= undefined` is assumed

// VariableDecls are used in `var` statement, in function parameter declaration
// and in class properties declaration

// Example:
  // `var a : string = 'some text'` <br>
  // `function x ( a : string = 'some text', b, c=0)`

      //properties
        //aliasVarRef: VariableRef
        //assignedValue: Expression
      ;

      //declare name affinity varDecl, paramDecl
      // declare name affinity varDecl, paramDecl

      //method parse()
      any Grammar_VariableDecl_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_VariableDecl));
        //---------
        //.name = .req('IDENTIFIER')
        PROP(name_,this) = METHOD(req_,this)(this,1,(any_arr){any_str("IDENTIFIER")});
        //.lock()
        METHOD(lock_,this)(this,0,NULL);

        //if .name in RESERVED_WORDS, .sayErr '"#{.name}" is a reserved word'
        if (CALL1(indexOf_,Grammar_RESERVED_WORDS,PROP(name_,this)).value.number>=0) {METHOD(sayErr_,this)(this,1,(any_arr){_concatAny(3,(any_arr){any_str("\""), PROP(name_,this), any_str("\" is a reserved word")})});};

// optional type annotation &
// optional assigned value

        //var parseFreeFormMap
        var parseFreeFormMap = undefined;

        //if .opt(':')
        if (_anyToBool(METHOD(opt_,this)(this,1,(any_arr){any_str(":")})))  {
            //if .lexer.token.type is 'NEWLINE' #dangling  assignment ":"[NEWLINE]
            if (__is(PROP(type_,PROP(token_,PROP(lexer_,this))),any_str("NEWLINE")))  {// #dangling  assignment ":"[NEWLINE]
                //parseFreeFormMap=true
                parseFreeFormMap = true;
            }
            //else
            
            else {
                //.parseType
                METHOD(parseType_,this)(this,0,NULL);
            };
        };

        //if not parseFreeFormMap 
        if (!(_anyToBool(parseFreeFormMap)))  {

            //if .opt('=') 
            if (_anyToBool(METHOD(opt_,this)(this,1,(any_arr){any_str("=")})))  {

                //if .lexer.token.type is 'NEWLINE' #dangling assignment "="[NEWLINE]
                if (__is(PROP(type_,PROP(token_,PROP(lexer_,this))),any_str("NEWLINE")))  {// #dangling assignment "="[NEWLINE]
                    //parseFreeFormMap=true
                    parseFreeFormMap = true;
                    //if .lexer.options.literalMap, .type='Map'
                    if (_anyToBool(PROP(literalMap_,PROP(options_,PROP(lexer_,this))))) {PROP(type_,this) = any_str("Map");};
                }
                //else if .lexer.token.value is 'map' #literal map creation "x = map"[NEWLINE]
                
                else if (__is(PROP(value_,PROP(token_,PROP(lexer_,this))),any_str("map")))  {// #literal map creation "x = map"[NEWLINE]
                    //.req 'map'
                    METHOD(req_,this)(this,1,(any_arr){any_str("map")});
                    //.type='Map'
                    PROP(type_,this) = any_str("Map");
                    //parseFreeFormMap=true
                    parseFreeFormMap = true;
                }
                //else // just assignment aon the same line
                
                else {

                    //if .lexer.interfaceMode //assignment in interfaces => declare var alias. as in: `var $=jQuery`
                    if (_anyToBool(PROP(interfaceMode_,PROP(lexer_,this))))  { //assignment in interfaces => declare var alias. as in: `var $=jQuery`
                        //.aliasVarRef = .req(VariableRef)
                        PROP(aliasVarRef_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_VariableRef});
                    }
                    //else
                    
                    else {
                        //.assignedValue = .req(Expression)
                        PROP(assignedValue_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_Expression});
                    };
                    //return
                    return undefined;
                };
            };
        };


        //if parseFreeFormMap #dangling assignment, parse a free-form object literal as assigned value
        if (_anyToBool(parseFreeFormMap))  {// #dangling assignment, parse a free-form object literal as assigned value

            //.assignedValue   = .req(FreeObjectLiteral)
            PROP(assignedValue_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_FreeObjectLiteral});

            //.assignedValue.isMap = .type is 'Map'
            PROP(isMap_,PROP(assignedValue_,this)) = any_number(__is(PROP(type_,this),any_str("Map")));
        };
      return undefined;
      }
    

//--------------
    // Grammar_PropertiesDeclaration
    any Grammar_PropertiesDeclaration; //Class Grammar_PropertiesDeclaration extends Grammar_VarDeclList
    
    //auto Grammar_PropertiesDeclaration__init
    void Grammar_PropertiesDeclaration__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        Grammar_VarDeclList__init(this,argc,arguments);
    };

// `PropertiesDeclaration: [namespace] properties (VariableDecl,)`

// The `properties` keyword is used inside classes to define properties of the class instances.

      //declare name affinity propDecl
      // declare name affinity propDecl

      //method parse()
      any Grammar_PropertiesDeclaration_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_PropertiesDeclaration));
        //---------
        //.req 'properties'
        METHOD(req_,this)(this,1,(any_arr){any_str("properties")});
        //.lock
        METHOD(lock_,this)(this,0,NULL);
        //.parseList
        METHOD(parseList_,this)(this,0,NULL);
      return undefined;
      }
    

//--------------
    // Grammar_WithStatement
    any Grammar_WithStatement; //Class Grammar_WithStatement extends ASTBase
    
    //auto Grammar_WithStatement__init
    void Grammar_WithStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

// `WithStatement: with VariableRef Body`

// The WithStatement simplifies calling several methods of the same object:
// Example:
// ```
// with frontDoor
    // .show
    // .open
    // .show
    // .close
    // .show
// ```

      //properties
        //varRef, body
      ;

      //method parse()
      any Grammar_WithStatement_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_WithStatement));
        //---------
        //.req 'with'
        METHOD(req_,this)(this,1,(any_arr){any_str("with")});
        //.lock()
        METHOD(lock_,this)(this,0,NULL);
        //.name = UniqueID.getVarName('with')  #unique 'with' storage var name
        PROP(name_,this) = UniqueID_getVarName(undefined,1,(any_arr){any_str("with")});// #unique 'with' storage var name
        //.varRef = .req(VariableRef)
        PROP(varRef_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_VariableRef});
        //.body = .req(Body)
        PROP(body_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_Body});
      return undefined;
      }
    

//--------------
    // Grammar_TryCatch
    any Grammar_TryCatch; //Class Grammar_TryCatch extends ASTBase
    
    //auto Grammar_TryCatch__init
    void Grammar_TryCatch__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

// `TryCatch: 'try' Body ExceptionBlock`

// Defines a `try` block for trapping exceptions and handling them.

      //properties body,exceptionBlock
      ;

      //method parse()
      any Grammar_TryCatch_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_TryCatch));
        //---------
        //.req 'try'
        METHOD(req_,this)(this,1,(any_arr){any_str("try")});
        //.lock()
        METHOD(lock_,this)(this,0,NULL);
        //.body = .req(Body)
        PROP(body_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_Body});

        //.exceptionBlock = .req(ExceptionBlock)
        PROP(exceptionBlock_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_ExceptionBlock});
      return undefined;
      }
    

//--------------
    // Grammar_ExceptionBlock
    any Grammar_ExceptionBlock; //Class Grammar_ExceptionBlock extends ASTBase
    
    //auto Grammar_ExceptionBlock__init
    void Grammar_ExceptionBlock__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

// `ExceptionBlock: (exception|catch) IDENTIFIER Body [finally Body]`

// Defines a `catch` block for trapping exceptions and handling them.
// `try` should precede this construction for 'catch' keyword.
// `try{` will be auto-inserted for the 'Exception' keyword.

      //properties 
        //catchVar:string
        //body,finallyBody
      ;

      //method parse()
      any Grammar_ExceptionBlock_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ExceptionBlock));
        //---------
        //.keyword = .req('catch','exception','Exception')
        PROP(keyword_,this) = METHOD(req_,this)(this,3,(any_arr){any_str("catch"), any_str("exception"), any_str("Exception")});
        //.lock()
        METHOD(lock_,this)(this,0,NULL);

// in order to correctly count frames to unwind on "return" from inside a try-catch
// catch"'s parent MUST BE ONLY "try"

        //if .keyword is 'catch' and .parent.constructor isnt TryCatch
        if (__is(PROP(keyword_,this),any_str("catch")) && !__is(any_class(PROP(parent_,this).class),Grammar_TryCatch))  {
            //.throwError "internal error, expected 'try' as 'catch' previous block"
            METHOD(throwError_,this)(this,1,(any_arr){any_str("internal error, expected 'try' as 'catch' previous block")});
        };

// get catch variable - Note: catch variables in js are block-scoped

        //.catchVar = .req('IDENTIFIER')
        PROP(catchVar_,this) = METHOD(req_,this)(this,1,(any_arr){any_str("IDENTIFIER")});

// get body

        //.body = .req(Body)
        PROP(body_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_Body});

// get optional "finally" block

        //if .opt('finally'), .finallyBody = .req(Body)
        if (_anyToBool(METHOD(opt_,this)(this,1,(any_arr){any_str("finally")}))) {PROP(finallyBody_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_Body});};

// validate grammar: try=>catch / function=>exception

        //if .keyword is 'catch' 
        if (__is(PROP(keyword_,this),any_str("catch")))  {
            //if .parent.constructor isnt TryCatch, .sayErr '"catch" block without "try"'
            if (!__is(any_class(PROP(parent_,this).class),Grammar_TryCatch)) {METHOD(sayErr_,this)(this,1,(any_arr){any_str("\"catch\" block without \"try\"")});};
        }
        //else // .keyword is 'exception'
        
        else {

            //if .parent.constructor isnt Statement 
            if (_anyToBool((_anyToBool(__or1=(_anyToBool(__or2=any_number(!__is(any_class(PROP(parent_,this).class),Grammar_Statement)))? __or2 : any_number(!(_instanceof(PROP(parent_,PROP(parent_,this)),Grammar_Body)))))? __or1 : any_number(!(_instanceof(PROP(parent_,PROP(parent_,PROP(parent_,this))),Grammar_FunctionDeclaration))))))  {
                  //.sayErr '"Exception" block should be part of function/method/constructor body'
                  METHOD(sayErr_,this)(this,1,(any_arr){any_str("\"Exception\" block should be part of function/method/constructor body")});
            };

// here, it is a "exception" block in a FunctionDeclaration.
// Mark the function as having an ExceptionBlock in order to
// insert "try{" at function start and also handle C-exceptions unwinding

            //var theFunctionDeclaration = .parent.parent.parent
            var theFunctionDeclaration = PROP(parent_,PROP(parent_,PROP(parent_,this)));
            //theFunctionDeclaration.hasExceptionBlock = true
            PROP(hasExceptionBlock_,theFunctionDeclaration) = true;
        };
      return undefined;
      }
    

//--------------
    // Grammar_ThrowStatement
    any Grammar_ThrowStatement; //Class Grammar_ThrowStatement extends ASTBase
    
    //auto Grammar_ThrowStatement__init
    void Grammar_ThrowStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

// `ThrowStatement: (throw|raise|fail with) Expression`

// This handles `throw` and its synonyms followed by an expression

      //properties specifier, expr
      ;

      //method parse()
      any Grammar_ThrowStatement_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ThrowStatement));
        //---------
        //.specifier = .req('throw', 'raise', 'fail')
        PROP(specifier_,this) = METHOD(req_,this)(this,3,(any_arr){any_str("throw"), any_str("raise"), any_str("fail")});

// At this point we lock because it is definitely a `throw` statement

        //.lock()
        METHOD(lock_,this)(this,0,NULL);
        //if .specifier is 'fail', .req 'with'
        if (__is(PROP(specifier_,this),any_str("fail"))) {METHOD(req_,this)(this,1,(any_arr){any_str("with")});};
        //.expr = .req(Expression) #trow expression
        PROP(expr_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_Expression});// #trow expression
      return undefined;
      }
    

//--------------
    // Grammar_ReturnStatement
    any Grammar_ReturnStatement; //Class Grammar_ReturnStatement extends ASTBase
    
    //auto Grammar_ReturnStatement__init
    void Grammar_ReturnStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

// `ReturnStatement: return Expression`

      //properties expr:Expression
      ;

      //method parse()
      any Grammar_ReturnStatement_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ReturnStatement));
        //---------
        //.req 'return'
        METHOD(req_,this)(this,1,(any_arr){any_str("return")});
        //.lock()
        METHOD(lock_,this)(this,0,NULL);
        //.expr = .opt(Expression)
        PROP(expr_,this) = METHOD(opt_,this)(this,1,(any_arr){Grammar_Expression});
      return undefined;
      }
    

//--------------
    // Grammar_IfStatement
    any Grammar_IfStatement; //Class Grammar_IfStatement extends ASTBase
    
    //auto Grammar_IfStatement__init
    void Grammar_IfStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

// `IfStatement: (if|when) Expression (then|',') SingleLineBody [ElseIfStatement|ElseStatement]*`
// `IfStatement: (if|when) Expression Body [ElseIfStatement|ElseStatement]*`

// Parses `if` statments and any attached `else` or chained `else if`

      //properties 
        //conditional: Expression
        //body
        //elseStatement
      ;

      //method parse()
      any Grammar_IfStatement_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_IfStatement));
        //---------

        //.req 'if','when'
        METHOD(req_,this)(this,2,(any_arr){any_str("if"), any_str("when")});
        //.lock()
        METHOD(lock_,this)(this,0,NULL);
        //.conditional = .req(Expression)
        PROP(conditional_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_Expression});

// after `,` or `then`, a statement on the same line is required
// if we're processing all single-line if's, ',|then' is *required*

// choose same body class as parent:
// either SingleLineBody or Body (multiline indented)

        //if .opt(',','then')
        if (_anyToBool(METHOD(opt_,this)(this,2,(any_arr){any_str(","), any_str("then")})))  {
            //.body = .req(SingleLineBody)
            PROP(body_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_SingleLineBody});
            //.req 'NEWLINE'
            METHOD(req_,this)(this,1,(any_arr){any_str("NEWLINE")});
        }
        //else # and indented block
        
        else {
            //.body = .req(Body)
            PROP(body_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_Body});
        };
        //end if

// control: "if"-"else" are related by having the same indent

        //if .lexer.token.value is 'else'
        if (__is(PROP(value_,PROP(token_,PROP(lexer_,this))),any_str("else")))  {

            //if .lexer.index isnt 0 
            if (!__is(PROP(index_,PROP(lexer_,this)),any_number(0)))  {
                //.throwError 'expected "else" to start on a new line'
                METHOD(throwError_,this)(this,1,(any_arr){any_str("expected \"else\" to start on a new line")});
            };

            //if .lexer.indent < .indent
            if (_anyToNumber(PROP(indent_,PROP(lexer_,this))) < _anyToNumber(PROP(indent_,this)))  {
                // #token is 'else' **BUT IS LESS-INDENTED**. It is not the "else" to this "if"
                //return
                return undefined;
            };

            //if .lexer.indent > .indent
            if (_anyToNumber(PROP(indent_,PROP(lexer_,this))) > _anyToNumber(PROP(indent_,this)))  {
                //.throwError "'else' statement is over-indented"
                METHOD(throwError_,this)(this,1,(any_arr){any_str("'else' statement is over-indented")});
            };
        };

        //end if

// Now get optional `[ElseIfStatement|ElseStatement]`

        //.elseStatement = .opt(ElseIfStatement, ElseStatement)
        PROP(elseStatement_,this) = METHOD(opt_,this)(this,2,(any_arr){Grammar_ElseIfStatement, Grammar_ElseStatement});
      return undefined;
      }
    

//--------------
    // Grammar_ElseIfStatement
    any Grammar_ElseIfStatement; //Class Grammar_ElseIfStatement extends ASTBase
    
    //auto Grammar_ElseIfStatement__init
    void Grammar_ElseIfStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

// `ElseIfStatement: (else|otherwise) if Expression Body`

// This class handles chained else-if statements

      //properties 
        //nextIf
      ;

      //method parse()
      any Grammar_ElseIfStatement_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ElseIfStatement));
        //---------
        //.req 'else'
        METHOD(req_,this)(this,1,(any_arr){any_str("else")});
        //.req 'if'
        METHOD(req_,this)(this,1,(any_arr){any_str("if")});
        //.lock()
        METHOD(lock_,this)(this,0,NULL);

// return the consumed 'if', to parse as a normal `IfStatement`

        //.lexer.returnToken()
        __call(returnToken_,PROP(lexer_,this),0,NULL);
        //.nextIf = .req(IfStatement)
        PROP(nextIf_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_IfStatement});
      return undefined;
      }
    

//--------------
    // Grammar_ElseStatement
    any Grammar_ElseStatement; //Class Grammar_ElseStatement extends ASTBase
    
    //auto Grammar_ElseStatement__init
    void Grammar_ElseStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

// `ElseStatement: else (Statement | Body) `

// This class handles closing "else" statements

      //properties body
      ;

      //method parse()
      any Grammar_ElseStatement_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ElseStatement));
        //---------
        //.req 'else'
        METHOD(req_,this)(this,1,(any_arr){any_str("else")});
        //.lock()
        METHOD(lock_,this)(this,0,NULL);
        //.body = .req(Body)
        PROP(body_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_Body});
      return undefined;
      }
    

//--------------
    // Grammar_DoLoop
    any Grammar_DoLoop; //Class Grammar_DoLoop extends ASTBase
    
    //auto Grammar_DoLoop__init
    void Grammar_DoLoop__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

      //properties 
        //preWhileUntilExpression
        //body
        //postWhileUntilExpression
      ;

      //method parse()
      any Grammar_DoLoop_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_DoLoop));
        //---------
        //.req 'do'
        METHOD(req_,this)(this,1,(any_arr){any_str("do")});
        //if .opt('nothing')
        if (_anyToBool(METHOD(opt_,this)(this,1,(any_arr){any_str("nothing")})))  {
          //.throwParseFailed('is do nothing')
          METHOD(throwParseFailed_,this)(this,1,(any_arr){any_str("is do nothing")});
        };
        //.opt ":"
        METHOD(opt_,this)(this,1,(any_arr){any_str(":")});
        //.lock()
        METHOD(lock_,this)(this,0,NULL);

// Get optional pre-condition

        //.preWhileUntilExpression = .opt(WhileUntilExpression)
        PROP(preWhileUntilExpression_,this) = METHOD(opt_,this)(this,1,(any_arr){Grammar_WhileUntilExpression});
        //.body = .opt(Body)
        PROP(body_,this) = METHOD(opt_,this)(this,1,(any_arr){Grammar_Body});
        //.req "loop"
        METHOD(req_,this)(this,1,(any_arr){any_str("loop")});

// Get optional post-condition

        //.postWhileUntilExpression = .opt(WhileUntilExpression)
        PROP(postWhileUntilExpression_,this) = METHOD(opt_,this)(this,1,(any_arr){Grammar_WhileUntilExpression});
        //if .preWhileUntilExpression and .postWhileUntilExpression
        if (_anyToBool(PROP(preWhileUntilExpression_,this)) && _anyToBool(PROP(postWhileUntilExpression_,this)))  {
          //.sayErr "Loop: cannot have a pre-condition a and post-condition at the same time"
          METHOD(sayErr_,this)(this,1,(any_arr){any_str("Loop: cannot have a pre-condition a and post-condition at the same time")});
        };
      return undefined;
      }
    

//--------------
    // Grammar_WhileUntilLoop
    any Grammar_WhileUntilLoop; //Class Grammar_WhileUntilLoop extends Grammar_DoLoop
    
    //auto Grammar_WhileUntilLoop__init
    void Grammar_WhileUntilLoop__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        Grammar_DoLoop__init(this,argc,arguments);
    };

// `WhileUntilLoop: pre-WhileUntilExpression Body`

// Execute the block `while` the condition is true or `until` the condition is true.
// WhileUntilLoop are a simpler form of loop. The `while` form, is the same as in C and js.
// WhileUntilLoop derives from DoLoop, to use its `.produce()` method.

      //method parse()
      any Grammar_WhileUntilLoop_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_WhileUntilLoop));
        //---------
        //.preWhileUntilExpression = .req(WhileUntilExpression)
        PROP(preWhileUntilExpression_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_WhileUntilExpression});
        //.lock()
        METHOD(lock_,this)(this,0,NULL);
        //.body = .opt(Body)
        PROP(body_,this) = METHOD(opt_,this)(this,1,(any_arr){Grammar_Body});
      return undefined;
      }
    

//--------------
    // Grammar_WhileUntilExpression
    any Grammar_WhileUntilExpression; //Class Grammar_WhileUntilExpression extends ASTBase
    
    //auto Grammar_WhileUntilExpression__init
    void Grammar_WhileUntilExpression__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

// common symbol for loops conditions. Is the word 'while' or 'until'
// followed by a boolean-Expression

// `WhileUntilExpression: ('while'|'until') boolean-Expression`

      //properties expr:Expression
      ;

      //method parse()
      any Grammar_WhileUntilExpression_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_WhileUntilExpression));
        //---------
        //.name = .req('while','until')
        PROP(name_,this) = METHOD(req_,this)(this,2,(any_arr){any_str("while"), any_str("until")});
        //.lock()
        METHOD(lock_,this)(this,0,NULL);
        //.expr = .req(Expression)
        PROP(expr_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_Expression});
      return undefined;
      }
    

//--------------
    // Grammar_LoopControlStatement
    any Grammar_LoopControlStatement; //Class Grammar_LoopControlStatement extends ASTBase
    
    //auto Grammar_LoopControlStatement__init
    void Grammar_LoopControlStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

// `LoopControlStatement: (break|continue) [loop]`

// This handles the `break` and `continue` keywords.
// 'continue' jumps to the start of the loop (as C & Js: 'continue')

      //properties control
      ;

      //method parse()
      any Grammar_LoopControlStatement_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_LoopControlStatement));
        //---------
        //.control = .req('break','continue')
        PROP(control_,this) = METHOD(req_,this)(this,2,(any_arr){any_str("break"), any_str("continue")});
        //.opt 'loop'
        METHOD(opt_,this)(this,1,(any_arr){any_str("loop")});
      return undefined;
      }
    

//--------------
    // Grammar_DoNothingStatement
    any Grammar_DoNothingStatement; //Class Grammar_DoNothingStatement extends ASTBase
    
    //auto Grammar_DoNothingStatement__init
    void Grammar_DoNothingStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

// `DoNothingStatement: do nothing`

      //method parse()
      any Grammar_DoNothingStatement_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_DoNothingStatement));
        //---------
        //.req 'do'
        METHOD(req_,this)(this,1,(any_arr){any_str("do")});
        //.req 'nothing'
        METHOD(req_,this)(this,1,(any_arr){any_str("nothing")});
      return undefined;
      }
    

//--------------
    // Grammar_ForStatement
    any Grammar_ForStatement; //Class Grammar_ForStatement extends ASTBase
    
    //auto Grammar_ForStatement__init
    void Grammar_ForStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

// `ForStatement: (ForEachProperty|ForEachInArray|ForIndexNumeric)`

// There are 3 variants of `ForStatement` in LiteScript

      //properties 
        //variant: ASTBase
      ;

      //method parse()
      any Grammar_ForStatement_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ForStatement));
        //---------
        //declare valid .createScope
        // declare valid .createScope

// We start with commonn `for` keyword

        //.req 'for'
        METHOD(req_,this)(this,1,(any_arr){any_str("for")});
        //.lock()
        METHOD(lock_,this)(this,0,NULL);

// we now require one of the variants

        //.variant = .req(ForEachProperty,ForEachInArray,ForIndexNumeric)
        PROP(variant_,this) = METHOD(req_,this)(this,3,(any_arr){Grammar_ForEachProperty, Grammar_ForEachInArray, Grammar_ForIndexNumeric});
      return undefined;
      }
    

//--------------
    // Grammar_ForEachProperty
    any Grammar_ForEachProperty; //Class Grammar_ForEachProperty extends ASTBase
    
    //auto Grammar_ForEachProperty__init
    void Grammar_ForEachProperty__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

      //properties 
        //indexVar:VariableDecl, mainVar:VariableDecl
        //iterable:Expression 
        //where:ForWhereFilter
        //body
      ;

      //method parse()
      any Grammar_ForEachProperty_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ForEachProperty));
        //---------
        //.req('each')
        METHOD(req_,this)(this,1,(any_arr){any_str("each")});

// next we require: 'property', and lock.

        //.req('property')  
        METHOD(req_,this)(this,1,(any_arr){any_str("property")});
        //.lock()
        METHOD(lock_,this)(this,0,NULL);

// Get main variable name (to store property value)

        //.mainVar = .req(VariableDecl)
        PROP(mainVar_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_VariableDecl});

// if comma present, it was propName-index (to store property names)

        //if .opt(",")
        if (_anyToBool(METHOD(opt_,this)(this,1,(any_arr){any_str(",")})))  {
          //.indexVar = .mainVar
          PROP(indexVar_,this) = PROP(mainVar_,this);
          //.mainVar = .req(VariableDecl)
          PROP(mainVar_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_VariableDecl});
        };

// Then we require `in`, and the iterable-Expression (a object)

        //.req 'in'
        METHOD(req_,this)(this,1,(any_arr){any_str("in")});
        //.iterable = .req(Expression)
        PROP(iterable_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_Expression});

// optional where expression (filter)

        //.where = .opt(ForWhereFilter)
        PROP(where_,this) = METHOD(opt_,this)(this,1,(any_arr){Grammar_ForWhereFilter});

// Now, get the loop body

        //.body = .req(Body)
        PROP(body_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_Body});
      return undefined;
      }
    

//--------------
    // Grammar_ForEachInArray
    any Grammar_ForEachInArray; //Class Grammar_ForEachInArray extends ASTBase
    
    //auto Grammar_ForEachInArray__init
    void Grammar_ForEachInArray__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

      //properties 
        //indexVar:VariableDecl, mainVar:VariableDecl, iterable:Expression
        //where:ForWhereFilter
        //body
      ;

      //method parse()
      any Grammar_ForEachInArray_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ForEachInArray));
        //---------

// first, require 'each'

        //.req 'each'
        METHOD(req_,this)(this,1,(any_arr){any_str("each")});

// Get index variable and value variable.
// Keep it simple: index and value are always variables declared on the spot

        //.mainVar = .req(VariableDecl)
        PROP(mainVar_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_VariableDecl});

// a comma means: previous var was 'index', so register as index and get main var

        //if .opt(',')
        if (_anyToBool(METHOD(opt_,this)(this,1,(any_arr){any_str(",")})))  {
          //.indexVar = .mainVar
          PROP(indexVar_,this) = PROP(mainVar_,this);
          //.mainVar = .req(VariableDecl)
          PROP(mainVar_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_VariableDecl});
        };

// we now *require* `in` and the iterable (array)

        //.req 'in'
        METHOD(req_,this)(this,1,(any_arr){any_str("in")});
        //.lock()
        METHOD(lock_,this)(this,0,NULL);
        //.isMap = .opt('map')
        PROP(isMap_,this) = METHOD(opt_,this)(this,1,(any_arr){any_str("map")});
        //.iterable = .req(Expression)
        PROP(iterable_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_Expression});

// optional where expression

        //.where = .opt(ForWhereFilter)
        PROP(where_,this) = METHOD(opt_,this)(this,1,(any_arr){Grammar_ForWhereFilter});

// and then, loop body

        //.body = .req(Body)
        PROP(body_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_Body});
      return undefined;
      }
    

//--------------
    // Grammar_ForIndexNumeric
    any Grammar_ForIndexNumeric; //Class Grammar_ForIndexNumeric extends ASTBase
    
    //auto Grammar_ForIndexNumeric__init
    void Grammar_ForIndexNumeric__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

      //properties 
        //indexVar:VariableDecl
        //conditionPrefix, endExpression
        //increment: Statement
        //body
      ;

// we require: a variableDecl, with optional assignment

      //method parse()
      any Grammar_ForIndexNumeric_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ForIndexNumeric));
        //---------
        //.indexVar = .req(VariableDecl)
        PROP(indexVar_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_VariableDecl});
        //.lock()
        METHOD(lock_,this)(this,0,NULL);

// next comma is  optional, then
// get 'while|until|to' and condition

        //.opt ','
        METHOD(opt_,this)(this,1,(any_arr){any_str(",")});
        //.conditionPrefix = .req('while','until','to','down')
        PROP(conditionPrefix_,this) = METHOD(req_,this)(this,4,(any_arr){any_str("while"), any_str("until"), any_str("to"), any_str("down")});
        //if .conditionPrefix is 'down', .req 'to'
        if (__is(PROP(conditionPrefix_,this),any_str("down"))) {METHOD(req_,this)(this,1,(any_arr){any_str("to")});};
        //.endExpression = .req(Expression)
        PROP(endExpression_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_Expression});

// another optional comma, and increment-Statement(s)

        //.opt ','
        METHOD(opt_,this)(this,1,(any_arr){any_str(",")});
        //.increment = .opt(Statement)
        PROP(increment_,this) = METHOD(opt_,this)(this,1,(any_arr){Grammar_Statement});

// Now, get the loop body

        //.body = .req(Body)
        PROP(body_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_Body});
      return undefined;
      }
    

//--------------
    // Grammar_ForWhereFilter
    any Grammar_ForWhereFilter; //Class Grammar_ForWhereFilter extends ASTBase
    
    //auto Grammar_ForWhereFilter__init
    void Grammar_ForWhereFilter__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };
// `ForWhereFilter: [NEWLINE] where Expression`

// This is a helper symbol denoting optional filter for the ForLoop variants.
// is: optional NEWLINE, then 'where' then filter-Expression

      //properties
        //filterExpression
      ;

      //method parse
      any Grammar_ForWhereFilter_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ForWhereFilter));
        //---------
        //var optNewLine = .opt('NEWLINE')
        var optNewLine = METHOD(opt_,this)(this,1,(any_arr){any_str("NEWLINE")});

        //if .opt('where')
        if (_anyToBool(METHOD(opt_,this)(this,1,(any_arr){any_str("where")})))  {
          //.lock()
          METHOD(lock_,this)(this,0,NULL);
          //.filterExpression = .req(Expression)
          PROP(filterExpression_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_Expression});
        }
        //else
        
        else {
          //if optNewLine, .lexer.returnToken # return NEWLINE
          if (_anyToBool(optNewLine)) {__call(returnToken_,PROP(lexer_,this),0,NULL);};
          //.throwParseFailed "expected '[NEWLINE] where'"
          METHOD(throwParseFailed_,this)(this,1,(any_arr){any_str("expected '[NEWLINE] where'")});
        };
      return undefined;
      }
    

//--------------
    // Grammar_DeleteStatement
    any Grammar_DeleteStatement; //Class Grammar_DeleteStatement extends ASTBase
    
    //auto Grammar_DeleteStatement__init
    void Grammar_DeleteStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };
// `DeleteStatement: delete VariableRef`

      //properties
        //varRef
      ;

      //method parse
      any Grammar_DeleteStatement_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_DeleteStatement));
        //---------
        //.req('delete')
        METHOD(req_,this)(this,1,(any_arr){any_str("delete")});
        //.lock()
        METHOD(lock_,this)(this,0,NULL);
        //.varRef = .req(VariableRef)
        PROP(varRef_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_VariableRef});
      return undefined;
      }
    

//--------------
    // Grammar_AssignmentStatement
    any Grammar_AssignmentStatement; //Class Grammar_AssignmentStatement extends ASTBase
    
    //auto Grammar_AssignmentStatement__init
    void Grammar_AssignmentStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

// `AssignmentStatement: VariableRef ASSIGN Expression`
// <br>`ASSIGN: ("="|"+="|"-="|"*="|"/=")`

      //properties lvalue:VariableRef, rvalue:Expression
      ;

      //method parse()
      any Grammar_AssignmentStatement_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_AssignmentStatement));
        //---------

        //declare valid .parent.preParsedVarRef
        // declare valid .parent.preParsedVarRef

        //if .parent instanceof Statement and .parent.preParsedVarRef
        if (_instanceof(PROP(parent_,this),Grammar_Statement) && _anyToBool(PROP(preParsedVarRef_,PROP(parent_,this))))  {
          //.lvalue  = .parent.preParsedVarRef # get already parsed VariableRef 
          PROP(lvalue_,this) = PROP(preParsedVarRef_,PROP(parent_,this));// # get already parsed VariableRef
        }
        //else
        
        else {
          //.lvalue  = .req(VariableRef)
          PROP(lvalue_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_VariableRef});
        };

// require an assignment symbol: ("="|"+="|"-="|"*="|"/=")

        //.name = .req('ASSIGN')
        PROP(name_,this) = METHOD(req_,this)(this,1,(any_arr){any_str("ASSIGN")});
        //.lock()
        METHOD(lock_,this)(this,0,NULL);

        //if .lexer.token.type is 'NEWLINE' #dangling assignment
        if (__is(PROP(type_,PROP(token_,PROP(lexer_,this))),any_str("NEWLINE")))  {// #dangling assignment
          //.rvalue  = .req(FreeObjectLiteral) #assume Object Expression in freeForm mode
          PROP(rvalue_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_FreeObjectLiteral});// #assume Object Expression in freeForm mode
        }
        //else
        
        else {
          //.rvalue  = .req(Expression)
          PROP(rvalue_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_Expression});
        };
      return undefined;
      }
    

//--------------
    // Grammar_VariableRef
    any Grammar_VariableRef; //Class Grammar_VariableRef extends ASTBase
    
    //auto Grammar_VariableRef__init
    void Grammar_VariableRef__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

// `VariableRef: ('--'|'++') IDENTIFIER [Accessors] ('--'|'++')`

// `VariableRef` is a Variable Reference

// a VariableRef can include chained 'Accessors', which do:
// - access a property of the object : `.`-> **PropertyAccess** and `[...]`->**IndexAccess**
// - assume the variable is a function and perform a function call :  `(...)`->**FunctionAccess**


      //properties 
        //preIncDec
        //postIncDec
      ;

      //declare name affinity varRef
      // declare name affinity varRef

      //method parse()
      any Grammar_VariableRef_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_VariableRef));
        //---------
        //.preIncDec = .opt('--','++')
        PROP(preIncDec_,this) = METHOD(opt_,this)(this,2,(any_arr){any_str("--"), any_str("++")});
        //.executes = false
        PROP(executes_,this) = false;

// assume 'this.x' on '.x', or if we're in a WithStatement, the 'with' .name

// get var name

        //if .opt('.','SPACE_DOT') # note: DOT has SPACES in front when .property used as parameter
        if (_anyToBool(METHOD(opt_,this)(this,2,(any_arr){any_str("."), any_str("SPACE_DOT")})))  {// # note: DOT has SPACES in front when .property used as parameter

            // #'.name' -> 'x.name'
            //.lock()
            METHOD(lock_,this)(this,0,NULL);

            //if .getParent(WithStatement) into var withStatement 
            var withStatement=undefined;
            if (_anyToBool((withStatement=METHOD(getParent_,this)(this,1,(any_arr){Grammar_WithStatement}))))  {
                //.name = withStatement.name
                PROP(name_,this) = PROP(name_,withStatement);
            }
            //else
            
            else {
                //.name = 'this' #default replacement for '.x'
                PROP(name_,this) = any_str("this");// #default replacement for '.x'
            };

            //var member: string
            var member = undefined;
            // #we must allow 'not' and 'has' as method names, (jQuery uses "not", Map uses "has").
            // #They're classsified as "Opers", but they're valid identifiers in this context
            //if .lexer.token.value in ['not','has']
            if (__in(PROP(value_,PROP(token_,PROP(lexer_,this))),2,(any_arr){any_str("not"), any_str("has")}))  {
                //member = .lexer.nextToken() //get not|has as identifier
                member = __call(nextToken_,PROP(lexer_,this),0,NULL); //get not|has as identifier
            }
            //else
            
            else {
                //member = .req('IDENTIFIER')
                member = METHOD(req_,this)(this,1,(any_arr){any_str("IDENTIFIER")});
            };

            //.addAccessor new PropertyAccess(this,member)
            METHOD(addAccessor_,this)(this,1,(any_arr){new(Grammar_PropertyAccess,2,(any_arr){this, member})});
        }
        //else
        
        else {

            //.name = .req('IDENTIFIER')
            PROP(name_,this) = METHOD(req_,this)(this,1,(any_arr){any_str("IDENTIFIER")});
        };

        //.lock()
        METHOD(lock_,this)(this,0,NULL);

// Now we check for accessors:
// <br>`.`->**PropertyAccess**
// <br>`[...]`->**IndexAccess**
// <br>`(...)`->**FunctionAccess**

// Note: **.paserAccessors()** will:
// - set .hasSideEffects=true if a function accessor is parsed
// - set .executes=true if the last accessor is a function accessor

        //.parseAccessors
        METHOD(parseAccessors_,this)(this,0,NULL);

// Replace lexical `super` by `#{SuperClass name}.prototype`

        //if .name is 'super'
        if (__is(PROP(name_,this),any_str("super")))  {

            //var classDecl = .getParent(ClassDeclaration)
            var classDecl = METHOD(getParent_,this)(this,1,(any_arr){Grammar_ClassDeclaration});
            //if no classDecl
            if (!_anyToBool(classDecl))  {
              //.throwError "use of 'super' outside a class method"
              METHOD(throwError_,this)(this,1,(any_arr){any_str("use of 'super' outside a class method")});
            };

            //if classDecl.varRefSuper
            if (_anyToBool(PROP(varRefSuper_,classDecl)))  {
                // #replace name='super' by name = #{SuperClass name}
                //.name = classDecl.varRefSuper.toString()
                PROP(name_,this) = __call(toString_,PROP(varRefSuper_,classDecl),0,NULL);
            }
                // #replace name='super' by name = #{SuperClass name}
            //else
            
            else {
                //.name ='Object' # no superclass means 'Object' is super class
                PROP(name_,this) = any_str("Object");// # no superclass means 'Object' is super class
            };
        };

            //ifndef PROD_C
//
//insert '.prototype.' as first accessor (after super class name)
//
//             //.insertAccessorAt 0, 'prototype'
//
//if super class is a composed name (x.y.z), we must insert those accessors also
//so 'super.myFunc' turns into 'NameSpace.subName.SuperClass.prototype.myFunc'
//
//             //if classDecl.varRefSuper and classDecl.varRefSuper.accessors
//                 ////insert super class accessors
//                 //var position = 0
//                 //for each ac in classDecl.varRefSuper.accessors
//                   //if ac instanceof PropertyAccess
//                     //.insertAccessorAt position++, ac.name
//             //endif
        // end if super

// Hack: after 'into var', allow :type

        //if .getParent(Statement).intoVars and .opt(":")
        if (_anyToBool(PROP(intoVars_,METHOD(getParent_,this)(this,1,(any_arr){Grammar_Statement}))) && _anyToBool(METHOD(opt_,this)(this,1,(any_arr){any_str(":")})))  {
            //.parseType
            METHOD(parseType_,this)(this,0,NULL);
        };

// check for post-fix increment/decrement

        //.postIncDec = .opt('--','++')
        PROP(postIncDec_,this) = METHOD(opt_,this)(this,2,(any_arr){any_str("--"), any_str("++")});

// If this variable ref has ++ or --, IT IS CONSIDERED a "call to execution" in itself,
// a "imperative statement", because it has side effects.
// (`i++` has a "imperative" part, It means: "give me the value of i, and then increment it!")

        //if .preIncDec or .postIncDec 
        if (_anyToBool((_anyToBool(__or3=PROP(preIncDec_,this))? __or3 : PROP(postIncDec_,this))))  {
          //.executes = true
          PROP(executes_,this) = true;
          //.hasSideEffects = true
          PROP(hasSideEffects_,this) = true;
        };
      return undefined;
      }

// Note: In LiteScript, *any VariableRef standing on its own line*, it's considered
// a function call. A VariableRef on its own line means "execute this!",
// so, when translating to js, it'll be translated as a function call, and `()` will be added.
// If the VariableRef is marked as 'executes' then it's assumed it is alread a functioncall,
// so `()` will NOT be added.

// Examples:
// ---------
    // LiteScript   | Translated js  | Notes
    // -------------|----------------|-------
    // start        | start();       | "start", on its own, is considered a function call
    // start(10,20) | start(10,20);  | Normal function call
    // start 10,20  | start(10,20);  | function call w/o parentheses
    // start.data   | start.data();  | start.data, on its own, is considered a function call
    // i++          | i++;           | i++ is marked "executes", it is a statement in itself

// Keep track of 'require' calls, to import modules (recursive)
// Note: commented 2014-6-11
//        if .name is 'require'
//            .getParent(Module).requireCallNodes.push this

// ---------------------------------
//##### helper method toString()
      any Grammar_VariableRef_toString(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_VariableRef));
        //---------
// This method is only valid to be used in error reporting.
// function accessors will be output as "(...)", and index accessors as [...]

        //var result = "#{.preIncDec or ''}#{.name}"
        var result = _concatAny(2,(any_arr){(_anyToBool(__or4=PROP(preIncDec_,this))? __or4 : any_EMPTY_STR), PROP(name_,this)});
        //if .accessors
        if (_anyToBool(PROP(accessors_,this)))  {
          //for each ac in .accessors
          any _list19=PROP(accessors_,this);
          { var ac=undefined;
          for(int ac__inx=0 ; ac__inx<_list19.value.arr->length ; ac__inx++){ac=ITEM(ac__inx,_list19);
            //result = "#{result}#{ac.toString()}"
            result = _concatAny(2,(any_arr){result, METHOD(toString_,ac)(ac,0,NULL)});
          }};// end for each in PROP(accessors_,this)
          
        };
        //return "#{result}#{.postIncDec or ''}"
        return _concatAny(2,(any_arr){result, (_anyToBool(__or5=PROP(postIncDec_,this))? __or5 : any_EMPTY_STR)});
      return undefined;
      }
    

//--------------
    // Grammar_Accessor
    any Grammar_Accessor; //Class Grammar_Accessor extends ASTBase
    
    //auto Grammar_Accessor__init
    void Grammar_Accessor__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

      //method parse
      any Grammar_Accessor_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_Accessor));
        //---------
        //fail with 'abstract'
        throw(new(Error,1,(any_arr){any_str("abstract")}));;
      return undefined;
      }
      //method toString
      any Grammar_Accessor_toString(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_Accessor));
        //---------
        //fail with 'abstract'
        throw(new(Error,1,(any_arr){any_str("abstract")}));;
      return undefined;
      }
    

//--------------
    // Grammar_PropertyAccess
    any Grammar_PropertyAccess; //Class Grammar_PropertyAccess extends Grammar_Accessor
    
    //auto Grammar_PropertyAccess__init
    void Grammar_PropertyAccess__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        Grammar_Accessor__init(this,argc,arguments);
    };

// `.` -> PropertyAccess: get the property named "n"

// `PropertyAccess: '.' IDENTIFIER`

      //method parse()
      any Grammar_PropertyAccess_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_PropertyAccess));
        //---------
        //.req('.')
        METHOD(req_,this)(this,1,(any_arr){any_str(".")});
        //.lock()
        METHOD(lock_,this)(this,0,NULL);
        // #we must allow 'not' and 'has' as method names, (jQuery uses "not", Map uses "has").
        // #They're classsified as "Opers", but they're valid identifiers in this context
        //if .lexer.token.value in ['not','has']
        if (__in(PROP(value_,PROP(token_,PROP(lexer_,this))),2,(any_arr){any_str("not"), any_str("has")}))  {
            //.name = .lexer.token.value //get "not"|"has" as identifier
            PROP(name_,this) = PROP(value_,PROP(token_,PROP(lexer_,this))); //get "not"|"has" as identifier
            //.lexer.nextToken() //advance
            __call(nextToken_,PROP(lexer_,this),0,NULL); //advance
        }
        //else
        
        else {
            //.name = .req('IDENTIFIER')
            PROP(name_,this) = METHOD(req_,this)(this,1,(any_arr){any_str("IDENTIFIER")});
        };
      return undefined;
      }

      //method toString()
      any Grammar_PropertyAccess_toString(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_PropertyAccess));
        //---------
        //return '.#{.name}'
        return _concatAny(2,(any_arr){any_str("."), PROP(name_,this)});
      return undefined;
      }
    

//--------------
    // Grammar_IndexAccess
    any Grammar_IndexAccess; //Class Grammar_IndexAccess extends Grammar_Accessor
    
    //auto Grammar_IndexAccess__init
    void Grammar_IndexAccess__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        Grammar_Accessor__init(this,argc,arguments);
    };

// `[n]`-> IndexAccess: get the property named "n" / then nth index of the array
                       // It resolves to the property value

// `IndexAccess: '[' Expression ']'`

      //method parse()
      any Grammar_IndexAccess_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_IndexAccess));
        //---------

        //.req "["
        METHOD(req_,this)(this,1,(any_arr){any_str("[")});
        //.lock()
        METHOD(lock_,this)(this,0,NULL);
        //.name = .req( Expression )
        PROP(name_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_Expression});
        //.req "]" #closer ]
        METHOD(req_,this)(this,1,(any_arr){any_str("]")});// #closer ]
      return undefined;
      }

      //method toString()
      any Grammar_IndexAccess_toString(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_IndexAccess));
        //---------
        //return '[...]'
        return any_str("[...]");
      return undefined;
      }
    

//--------------
    // Grammar_FunctionArgument
    any Grammar_FunctionArgument; //Class Grammar_FunctionArgument extends ASTBase
    
    //auto Grammar_FunctionArgument__init
    void Grammar_FunctionArgument__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

// `FunctionArgument: [param-IDENTIFIER=]Expression`

      //properties 
        //expression
      ;

      //method parse()
      any Grammar_FunctionArgument_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_FunctionArgument));
        //---------

        //.lock()
        METHOD(lock_,this)(this,0,NULL);

        //if .opt('IDENTIFIER') into .name
        if (_anyToBool((PROP(name_,this)=METHOD(opt_,this)(this,1,(any_arr){any_str("IDENTIFIER")}))))  {
            //if .lexer.token.value is '=' 
            if (__is(PROP(value_,PROP(token_,PROP(lexer_,this))),any_str("=")))  {
                //.req '='
                METHOD(req_,this)(this,1,(any_arr){any_str("=")});
            }
            //else
            
            else {
                //.lexer.returnToken
                __call(returnToken_,PROP(lexer_,this),0,NULL);
                //.name = undefined
                PROP(name_,this) = undefined;
            };
        };

        //.expression =.req(Expression)
        PROP(expression_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_Expression});
      return undefined;
      }
    

//--------------
    // Grammar_FunctionAccess
    any Grammar_FunctionAccess; //Class Grammar_FunctionAccess extends Grammar_Accessor
    
    //auto Grammar_FunctionAccess__init
    void Grammar_FunctionAccess__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        Grammar_Accessor__init(this,argc,arguments);
    };
// `(...)` -> FunctionAccess: The object is assumed to be a function, and the code executed.
                           // It resolves to the function return value.

// `FunctionAccess: '(' [FunctionArgument,]* ')'`

      //properties 
        //args:array of FunctionArgument
      ;

      //method parse()
      any Grammar_FunctionAccess_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_FunctionAccess));
        //---------
        //.req "("
        METHOD(req_,this)(this,1,(any_arr){any_str("(")});
        //.lock()
        METHOD(lock_,this)(this,0,NULL);
        //.args = .optSeparatedList( FunctionArgument, ",", ")" ) #comma-separated list of FunctionArgument, closed by ")"
        PROP(args_,this) = METHOD(optSeparatedList_,this)(this,3,(any_arr){Grammar_FunctionArgument, any_str(","), any_str(")")});// #comma-separated list of FunctionArgument, closed by ")"
      return undefined;
      }

      //method toString()
      any Grammar_FunctionAccess_toString(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_FunctionAccess));
        //---------
        //return '(...)'
        return any_str("(...)");
      return undefined;
      }
    

//--------------
    // Grammar_Operand
    any Grammar_Operand; //Class Grammar_Operand extends ASTBase
    
    //auto Grammar_Operand__init
    void Grammar_Operand__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

// fast-parse: if it's a NUMBER: it is NumberLiteral, if it's a STRING: it is StringLiteral (also for REGEX)
// or, upon next token, cherry pick which AST nodes to try,
// '(':ParenExpression,'[':ArrayLiteral,'{':ObjectLiteral,'function': FunctionDeclaration

      //method parse()
      any Grammar_Operand_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_Operand));
        //---------
        //.name = .parseDirect(.lexer.token.type, OPERAND_DIRECT_TYPE) 
        PROP(name_,this) = (_anyToBool(__or6=METHOD(parseDirect_,this)(this,2,(any_arr){PROP(type_,PROP(token_,PROP(lexer_,this))), Grammar_OPERAND_DIRECT_TYPE}))? __or6 : METHOD(parseDirect_,this)(this,2,(any_arr){PROP(value_,PROP(token_,PROP(lexer_,this))), Grammar_OPERAND_DIRECT_TOKEN}));

// if it was a Literal, ParenExpression or FunctionDeclaration
// besides base value, this operands can have accessors. For example: `"string".length` , `myObj.fn(10)`

        //if .name
        if (_anyToBool(PROP(name_,this)))  {
            //.parseAccessors
            METHOD(parseAccessors_,this)(this,0,NULL);
        }

// else, (if not Literal, ParenExpression or FunctionDeclaration)
// it must be a variable ref
        //else
        
        else {
            //.name = .req(VariableRef)
            PROP(name_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_VariableRef});
        };

        //end if
        
      return undefined;
      }
    

//--------------
    // Grammar_Oper
    any Grammar_Oper; //Class Grammar_Oper extends ASTBase
    
    //auto Grammar_Oper__init
    void Grammar_Oper__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

      //properties 
        //negated
        //left:Operand, right:Operand
        //pushed, precedence
        //intoVar
      ;

// Get token, require an OPER.
// Note: 'ternary expression with else'. `x? a else b` should be valid alias for `x?a:b`

      //method parse()
      any Grammar_Oper_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_Oper));
        //---------
        //declare valid .getPrecedence
        // declare valid .getPrecedence
        //declare valid .parent.ternaryCount
        // declare valid .parent.ternaryCount
        //if .parent.ternaryCount and .opt('else')
        if (_anyToBool(PROP(ternaryCount_,PROP(parent_,this))) && _anyToBool(METHOD(opt_,this)(this,1,(any_arr){any_str("else")})))  {
            //.name=':' # if there's a open ternaryCount, 'else' is converted to ":"
            PROP(name_,this) = any_str(":");// # if there's a open ternaryCount, 'else' is converted to ":"
        }
        //else
        
        else {
            //.name = .req('OPER')
            PROP(name_,this) = METHOD(req_,this)(this,1,(any_arr){any_str("OPER")});
        };

        //.lock() 
        METHOD(lock_,this)(this,0,NULL);

// A) validate double-word opers

// A.1) validate `instance of`

        //if .name is 'instance'
        if (__is(PROP(name_,this),any_str("instance")))  {
            //.req('of')
            METHOD(req_,this)(this,1,(any_arr){any_str("of")});
            //.name = "instance of"
            PROP(name_,this) = any_str("instance of");
        }

// A.2) validate `has|hasnt property`
        //else if .name is 'has'
        
        else if (__is(PROP(name_,this),any_str("has")))  {
            //.negated = .opt('not')? true:false # set the 'negated' flag
            PROP(negated_,this) = _anyToBool(METHOD(opt_,this)(this,1,(any_arr){any_str("not")})) ? true : false;// # set the 'negated' flag
            //.req('property')
            METHOD(req_,this)(this,1,(any_arr){any_str("property")});
            //.name = "has property"
            PROP(name_,this) = any_str("has property");
        }
        //else if .name is 'hasnt'
        
        else if (__is(PROP(name_,this),any_str("hasnt")))  {
            //.req('property')
            METHOD(req_,this)(this,1,(any_arr){any_str("property")});
            //.negated = true # set the 'negated' flag
            PROP(negated_,this) = true;// # set the 'negated' flag
            //.name = "has property"
            PROP(name_,this) = any_str("has property");
        }

// A.3) also, check if we got a `not` token.
// In this case we require the next token to be `in|like`
// `not in|like` is the only valid (not-unary) *Oper* starting with `not`
        //else if .name is 'not'
        
        else if (__is(PROP(name_,this),any_str("not")))  {
            //.negated = true # set the 'negated' flag
            PROP(negated_,this) = true;// # set the 'negated' flag
            //.name = .req('in','like') # require 'not in'|'not like'
            PROP(name_,this) = METHOD(req_,this)(this,2,(any_arr){any_str("in"), any_str("like")});// # require 'not in'|'not like'
        };

// A.4) handle 'into [var] x', assignment-Expression

        //if .name is 'into' and .opt('var')
        if (__is(PROP(name_,this),any_str("into")) && _anyToBool(METHOD(opt_,this)(this,1,(any_arr){any_str("var")})))  {
            //.intoVar = true
            PROP(intoVar_,this) = true;
            //.getParent(Statement).intoVars = true #mark owner statement
            PROP(intoVars_,METHOD(getParent_,this)(this,1,(any_arr){Grammar_Statement})) = true;// #mark owner statement
        }

// B) Synonyms

// else, check for `isnt`, which we treat as `!==`, `negated is`
        //else if .name is 'isnt'
        
        else if (__is(PROP(name_,this),any_str("isnt")))  {
          //.negated = true # set the 'negated' flag
          PROP(negated_,this) = true;// # set the 'negated' flag
          //.name = 'is' # treat as 'Negated is'
          PROP(name_,this) = any_str("is");// # treat as 'Negated is'
        }

// else check for `instanceof`, (old habits die hard)
        //else if .name is 'instanceof'
        
        else if (__is(PROP(name_,this),any_str("instanceof")))  {
          //.name = 'instance of'
          PROP(name_,this) = any_str("instance of");
        };

        //end if

// C) Variants on 'is/isnt...'

        //if .name is 'is' # note: 'isnt' was converted to 'is {negated:true}' above
        if (__is(PROP(name_,this),any_str("is")))  {// # note: 'isnt' was converted to 'is {negated:true}' above

  // C.1) is not<br>
  // Check for `is not`, which we treat as `isnt` rather than `is ( not`.

            //if .opt('not') # --> is not/has not...
            if (_anyToBool(METHOD(opt_,this)(this,1,(any_arr){any_str("not")})))  {// # --> is not/has not...
                //if .negated, .throwError '"isnt not" is invalid'
                if (_anyToBool(PROP(negated_,this))) {METHOD(throwError_,this)(this,1,(any_arr){any_str("\"isnt not\" is invalid")});};
                //.negated = true # set the 'negated' flag
                PROP(negated_,this) = true;// # set the 'negated' flag
            };

            //end if

  // C.2) accept 'is/isnt instance of' and 'is/isnt instanceof'

            //if .opt('instance')
            if (_anyToBool(METHOD(opt_,this)(this,1,(any_arr){any_str("instance")})))  {
                //.req('of')
                METHOD(req_,this)(this,1,(any_arr){any_str("of")});
                //.name = 'instance of'
                PROP(name_,this) = any_str("instance of");
            }
            //else if .opt('instanceof')
            
            else if (_anyToBool(METHOD(opt_,this)(this,1,(any_arr){any_str("instanceof")})))  {
                //.name = 'instance of'
                PROP(name_,this) = any_str("instance of");
            };

            //end if
            
        };

// Get operator precedence index

        //.getPrecedence
        METHOD(getPrecedence_,this)(this,0,NULL);
      return undefined;
      }

      //end Oper parse


// ###getPrecedence:
// Helper method to get Precedence Index (lower number means higher precedende)

      //helper method getPrecedence()
      any Grammar_Oper_getPrecedence(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_Oper));
        //---------

        //.precedence = operatorsPrecedence.indexOf(.name)
        PROP(precedence_,this) = METHOD(indexOf_,Grammar_operatorsPrecedence)(Grammar_operatorsPrecedence,1,(any_arr){PROP(name_,this)});
        //if .precedence is -1 
        if (__is(PROP(precedence_,this),any_number(-1)))  {
            //debugger
            assert(0);
            //fail with "OPER '#{.name}' not found in the operator precedence list"
            throw(new(Error,1,(any_arr){_concatAny(3,(any_arr){any_str("OPER '"), PROP(name_,this), any_str("' not found in the operator precedence list")})}));;
        };
      return undefined;
      }
    

//--------------
    // Grammar_UnaryOper
    any Grammar_UnaryOper; //Class Grammar_UnaryOper extends Grammar_Oper
    
    //auto Grammar_UnaryOper__init
    void Grammar_UnaryOper__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        Grammar_Oper__init(this,argc,arguments);
    };

// require a unaryOperator

      //method parse()
      any Grammar_UnaryOper_parse(DEFAULT_ARGUMENTS){
          assert(_instanceof(this,Grammar_UnaryOper));
          //---------
          //.name = .reqOneOf(unaryOperators)
          PROP(name_,this) = METHOD(reqOneOf_,this)(this,1,(any_arr){Grammar_unaryOperators});

// Check for `type of` - we allow "type" as var name, but recognize "type of" as UnaryOper

          //if .name is 'type'
          if (__is(PROP(name_,this),any_str("type")))  {
              //if .opt('of')
              if (_anyToBool(METHOD(opt_,this)(this,1,(any_arr){any_str("of")})))  {
                //.name = 'type of'
                PROP(name_,this) = any_str("type of");
              }
              //else
              
              else {
                //.throwParseFailed 'expected "of" after "type"'
                METHOD(throwParseFailed_,this)(this,1,(any_arr){any_str("expected \"of\" after \"type\"")});
              };
          };

// Lock, we have a unary oper

          //.lock()
          METHOD(lock_,this)(this,0,NULL);

// Rename - and + to 'unary -' and 'unary +',
// 'typeof' to 'type of'

          //if .name is '-'
          if (__is(PROP(name_,this),any_str("-")))  {
              //.name = 'unary -'
              PROP(name_,this) = any_str("unary -");
          }
          //else if .name is '+'
          
          else if (__is(PROP(name_,this),any_str("+")))  {
              //.name = 'unary +'
              PROP(name_,this) = any_str("unary +");
          }
          //else if .name is 'typeof'
          
          else if (__is(PROP(name_,this),any_str("typeof")))  {
              //.name = 'type of'
              PROP(name_,this) = any_str("type of");
          };

          //end if

// calculate precedence - Oper.getPrecedence()

          //.getPrecedence()
          METHOD(getPrecedence_,this)(this,0,NULL);
      return undefined;
      }

      //end parse 
      
    

//--------------
    // Grammar_Expression
    any Grammar_Expression; //Class Grammar_Expression extends ASTBase
    
    //auto Grammar_Expression__init
    void Grammar_Expression__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

      //properties operandCount, root, ternaryCount
      ;

      //method parse()
      any Grammar_Expression_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_Expression));
        //---------

        //declare valid .growExpressionTree
        // declare valid .growExpressionTree
        //declare valid .root.name.type
        // declare valid .root.name.type

        //var arr = []
        var arr = new(Array,0,NULL);
        //.operandCount = 0 
        PROP(operandCount_,this) = any_number(0);
        //.ternaryCount = 0
        PROP(ternaryCount_,this) = any_number(0);

        //do
        while(TRUE){

// Get optional unary operator
// (performance) check token first

            //if .lexer.token.value in unaryOperators
            if (CALL1(indexOf_,Grammar_unaryOperators,PROP(value_,PROP(token_,PROP(lexer_,this)))).value.number>=0)  {
                //var unaryOper = .opt(UnaryOper)
                var unaryOper = METHOD(opt_,this)(this,1,(any_arr){Grammar_UnaryOper});
                //if unaryOper
                if (_anyToBool(unaryOper))  {
                    //arr.push unaryOper
                    METHOD(push_,arr)(arr,1,(any_arr){unaryOper});
                    //.lock()
                    METHOD(lock_,this)(this,0,NULL);
                };
            };

// Get operand

            //arr.push .req(Operand) 
            METHOD(push_,arr)(arr,1,(any_arr){METHOD(req_,this)(this,1,(any_arr){Grammar_Operand})});
            //.operandCount++
            PROP(operandCount_,this).value.number++;
            //.lock()
            METHOD(lock_,this)(this,0,NULL);

// (performance) Fast exit for common tokens: `= , ] )` -> end of expression.

            //if .lexer.token.type is 'ASSIGN' or .lexer.token.value in ',)]' 
            if (_anyToBool((_anyToBool(__or7=any_number(__is(PROP(type_,PROP(token_,PROP(lexer_,this))),any_str("ASSIGN"))))? __or7 : any_number(CALL1(indexOf_,any_str(",)]"),PROP(value_,PROP(token_,PROP(lexer_,this)))).value.number>=0))))  {
                //break
                break;
            };

// optional newline **before** `Oper`
// to allow a expressions to continue on the next line.
// We look ahead, and if the first token in the next line is OPER
// we consume the NEWLINE, allowing multiline expressions.
// The exception is ArrayLiteral, because in free-form mode
// the next item in the array on the next line, can start with a unary operator

            //if .lexer.token.type is 'NEWLINE' and not (.parent instanceof ArrayLiteral)
            if (__is(PROP(type_,PROP(token_,PROP(lexer_,this))),any_str("NEWLINE")) && !(_instanceof(PROP(parent_,this),Grammar_ArrayLiteral)))  {
              //.opt 'NEWLINE' #consume newline
              METHOD(opt_,this)(this,1,(any_arr){any_str("NEWLINE")});// #consume newline
              //if .lexer.token.type isnt 'OPER' # the first token in the next line isnt OPER (+,and,or,...)
              if (!__is(PROP(type_,PROP(token_,PROP(lexer_,this))),any_str("OPER")))  {// # the first token in the next line isnt OPER (+,and,or,...)
                  //.lexer.returnToken() # return NEWLINE
                  __call(returnToken_,PROP(lexer_,this),0,NULL);// # return NEWLINE
                  //break #end Expression
                  break;// #end Expression
              };
            };

// Try to parse next token as an operator

            //var oper = .opt(Oper)
            var oper = METHOD(opt_,this)(this,1,(any_arr){Grammar_Oper});
            //if no oper then break # no more operators, end of expression
            if (!_anyToBool(oper)) {break;};

// keep count on ternaryOpers

            //if oper.name is '?'
            if (__is(PROP(name_,oper),any_str("?")))  {
                //.ternaryCount++
                PROP(ternaryCount_,this).value.number++;
            }
            //else if oper.name is ':'
            
            else if (__is(PROP(name_,oper),any_str(":")))  {
                //if no .ternaryCount //":" without '?'. It can be 'case' expression ending ":"
                if (!_anyToBool(PROP(ternaryCount_,this)))  { //":" without '?'. It can be 'case' expression ending ":"
                    //.lexer.returnToken
                    __call(returnToken_,PROP(lexer_,this),0,NULL);
                    //break //end of expression
                    break; //end of expression
                };
                //.ternaryCount--
                PROP(ternaryCount_,this).value.number--;
            };

            //end if

// If it was an operator, store, and continue because we expect another operand.
// (operators sits between two operands)

            //arr.push(oper)
            METHOD(push_,arr)(arr,1,(any_arr){oper});

// allow dangling expression. If the line ends with OPER,
// we consume the NEWLINE and continue parsing the expression on the next line

            //.opt 'NEWLINE' #consume optional newline after Oper
            METHOD(opt_,this)(this,1,(any_arr){any_str("NEWLINE")});// #consume optional newline after Oper
        };// end loop

// Control: complete all ternary operators

        //if .ternaryCount, .throwError 'missing (":"|else) on ternary operator (a? b else c)'
        if (_anyToBool(PROP(ternaryCount_,this))) {METHOD(throwError_,this)(this,1,(any_arr){any_str("missing (\":\"|else) on ternary operator (a? b else c)")});};

// Fix 'new' calls. Check parameters for 'new' unary operator, for consistency, add '()' if not present,
// so `a = new MyClass` turns into `a = new MyClass()`

        //for each index,item in arr
        any _list20=arr;
        { var item=undefined;
        for(int index=0 ; index<_list20.value.arr->length ; index++){item=ITEM(index,_list20);
            //declare item:UnaryOper  
            // declare item:UnaryOper
            //if item instanceof UnaryOper and item.name is 'new'
            if (_instanceof(item,Grammar_UnaryOper) && __is(PROP(name_,item),any_str("new")))  {
                //var operand = arr[index+1]
                var operand = ITEM(index + 1,arr);
                //if operand.name instanceof VariableRef
                if (_instanceof(PROP(name_,operand),Grammar_VariableRef))  {
                    //var varRef = operand.name
                    var varRef = PROP(name_,operand);
                    //if no varRef.executes, varRef.addAccessor new FunctionAccess(this)
                    if (!_anyToBool(PROP(executes_,varRef))) {METHOD(addAccessor_,varRef)(varRef,1,(any_arr){new(Grammar_FunctionAccess,1,(any_arr){this})});};
                };
            };
        }};// end for each in arr

// Now we create a tree from .arr[], based on operator precedence

        //.growExpressionTree(arr)
        METHOD(growExpressionTree_,this)(this,1,(any_arr){arr});
      return undefined;
      }


      //end method Expression.parse()


// Grow The Expression Tree
// ========================

// Growing the expression AST
// --------------------------

// By default, for every expression, the parser creates a *flat array*
// of UnaryOper, Operands and Operators.

// `Expression: [UnaryOper] Operand [Oper [UnaryOper] Operand]*`

// For example, `not 1 + 2 * 3 is 5`, turns into:

// .arr =  ['not','1','+','2','*','3','is','5']

// In this method we create the tree, by pushing down operands,
// according to operator precedence.

// The process is repeated until there is only one operator left in the root node
// (the one with lower precedence)

// For example, `not 1 + 2 * 3 is 5`, turns into:

// ```
   // not
      // \
      // is
     // /  \
   // +     5
  // / \
 // 1   *
    // / \
    // 2  3
// ```


// `3 in a and not 4 in b`
// ```
      // and
     // /  \
   // in    not
  // / \     |
 // 3   a    in
         // /  \
        // 4   b
// ```

// `3 in a and 4 not in b`
// ```
      // and
     // /  \
   // in   not-in
  // / \    / \
 // 3   a  4   b

// ```


// `-(4+3)*2`
// ```
   // *
  // / \
 // -   2
  // \
   // +
  // / \
 // 4   3
// ```

// Expression.growExpressionTree()
// -------------------------------

// while there is more than one operator in the root node...

      //method growExpressionTree(arr:ASTBase array)
      any Grammar_Expression_growExpressionTree(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_Expression));
        //---------
        // define named params
        var arr= argc? arguments[0] : undefined;
        //---------
        //do while arr.length > 1
        while(_length(arr) > 1){

// find the one with highest precedence (lower number) to push down
// (on equal precedende, we use the leftmost)

          //var pos=-1
          var pos = any_number(-1);
          //var minPrecedenceInx = 100
          var minPrecedenceInx = any_number(100);
          //for each inx,item in arr
          any _list21=arr;
          { var item=undefined;
          for(int inx=0 ; inx<_list21.value.arr->length ; inx++){item=ITEM(inx,_list21);

            //debug "item at #{inx} #{item.name}, Oper? #{item instanceof Oper}. precedence:",item.precedence
            //declare valid item.precedence
            // declare valid item.precedence
            //declare valid item.pushed
            // declare valid item.pushed

            //if item instanceof Oper
            if (_instanceof(item,Grammar_Oper))  {
              //if not item.pushed and item.precedence < minPrecedenceInx
              if (!(_anyToBool(PROP(pushed_,item))) && _anyToNumber(PROP(precedence_,item)) < _anyToNumber(minPrecedenceInx))  {
                //pos = inx
                pos = any_number(inx);
                //minPrecedenceInx = item.precedence
                minPrecedenceInx = PROP(precedence_,item);
              };
            };
          }};// end for each in arr

          //end for

          // #control
          //if pos<0, .throwError("can't find highest precedence operator")
          if (_anyToNumber(pos) < 0) {METHOD(throwError_,this)(this,1,(any_arr){any_str("can't find highest precedence operator")});};

// Un-flatten: Push down the operands a level down

          //var oper = arr[pos]
          var oper = ITEM(_anyToNumber(pos),arr);

          //oper.pushed = true
          PROP(pushed_,oper) = true;

          //if oper instanceof UnaryOper
          if (_instanceof(oper,Grammar_UnaryOper))  {

            // #control
            //if pos is arr.length
            if (__is(pos,any_number(_length(arr))))  {
              //.throwError("can't get RIGHT operand for unary operator '#{oper}'") 
              METHOD(throwError_,this)(this,1,(any_arr){_concatAny(3,(any_arr){any_str("can't get RIGHT operand for unary operator '"), oper, any_str("'")})});
            };

            // # if it's a unary operator, take the only (right) operand, and push-it down the tree
            //oper.right = arr.splice(pos+1,1)[0]
            PROP(right_,oper) = ITEM(0,METHOD(splice_,arr)(arr,2,(any_arr){any_number(_anyToNumber(pos) + 1), any_number(1)}));
          }
          //else
          
          else {

            // #control
            //if pos is arr.length
            if (__is(pos,any_number(_length(arr))))  {
              //.throwError("can't get RIGHT operand for binary operator '#{oper}'")
              METHOD(throwError_,this)(this,1,(any_arr){_concatAny(3,(any_arr){any_str("can't get RIGHT operand for binary operator '"), oper, any_str("'")})});
            };
            //if pos is 0
            if (__is(pos,any_number(0)))  {
              //.throwError("can't get LEFT operand for binary operator '#{oper}'")
              METHOD(throwError_,this)(this,1,(any_arr){_concatAny(3,(any_arr){any_str("can't get LEFT operand for binary operator '"), oper, any_str("'")})});
            };

            // # if it's a binary operator, take the left and right operand, and push them down the tree
            //oper.right = arr.splice(pos+1,1)[0]
            PROP(right_,oper) = ITEM(0,METHOD(splice_,arr)(arr,2,(any_arr){any_number(_anyToNumber(pos) + 1), any_number(1)}));
            //oper.left = arr.splice(pos-1,1)[0]
            PROP(left_,oper) = ITEM(0,METHOD(splice_,arr)(arr,2,(any_arr){any_number(_anyToNumber(pos) - 1), any_number(1)}));
          };

          //end if
          
        };// end loop

// Store the root operator

        //.root = arr[0]
        PROP(root_,this) = ITEM(0,arr);
      return undefined;
      }

      //end method
      
    

//--------------
    // Grammar_Literal
    any Grammar_Literal; //Class Grammar_Literal extends ASTBase
    

      //constructor 
      void Grammar_Literal__init(DEFAULT_ARGUMENTS){
        // auto call super class __init
        ASTBase__init(this,argc,arguments);
        //.type = '*abstract-Literal*'
        PROP(type_,this) = any_str("*abstract-Literal*");
      }

      //method getValue()
      any Grammar_Literal_getValue(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_Literal));
        //---------
        //return .name
        return PROP(name_,this);
      return undefined;
      }
    

//--------------
    // Grammar_NumberLiteral
    any Grammar_NumberLiteral; //Class Grammar_NumberLiteral extends Grammar_Literal
    

      //constructor 
      void Grammar_NumberLiteral__init(DEFAULT_ARGUMENTS){
        // auto call super class __init
        Grammar_Literal__init(this,argc,arguments);
        //.type = 'Number'
        PROP(type_,this) = any_str("Number");
      }

      //method parse()
      any Grammar_NumberLiteral_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_NumberLiteral));
        //---------
        //.name = .req('NUMBER')
        PROP(name_,this) = METHOD(req_,this)(this,1,(any_arr){any_str("NUMBER")});
      return undefined;
      }
    

//--------------
    // Grammar_StringLiteral
    any Grammar_StringLiteral; //Class Grammar_StringLiteral extends Grammar_Literal
    

      //constructor 
      void Grammar_StringLiteral__init(DEFAULT_ARGUMENTS){
        // auto call super class __init
        Grammar_Literal__init(this,argc,arguments);
        //.type = 'String'
        PROP(type_,this) = any_str("String");
      }

      //method parse()
      any Grammar_StringLiteral_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_StringLiteral));
        //---------
        //.name = .req('STRING')
        PROP(name_,this) = METHOD(req_,this)(this,1,(any_arr){any_str("STRING")});
      return undefined;
      }

      //method getValue()
      any Grammar_StringLiteral_getValue(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_StringLiteral));
        //---------
        //return .name.slice(1,-1) #remove quotes
        return __call(slice_,PROP(name_,this),2,(any_arr){any_number(1), any_number(-1)});// #remove quotes
      return undefined;
      }
    

//--------------
    // Grammar_RegExpLiteral
    any Grammar_RegExpLiteral; //Class Grammar_RegExpLiteral extends Grammar_Literal
    

      //constructor 
      void Grammar_RegExpLiteral__init(DEFAULT_ARGUMENTS){
        // auto call super class __init
        Grammar_Literal__init(this,argc,arguments);
        //.type = 'RegExp'
        PROP(type_,this) = any_str("RegExp");
      }

      //method parse()
      any Grammar_RegExpLiteral_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_RegExpLiteral));
        //---------
        //.name = .req('REGEX')
        PROP(name_,this) = METHOD(req_,this)(this,1,(any_arr){any_str("REGEX")});
      return undefined;
      }
    

//--------------
    // Grammar_ArrayLiteral
    any Grammar_ArrayLiteral; //Class Grammar_ArrayLiteral extends Grammar_Literal
    

      //properties 
        //items: array of Expression
      ;

      //constructor 
      void Grammar_ArrayLiteral__init(DEFAULT_ARGUMENTS){
        // auto call super class __init
        Grammar_Literal__init(this,argc,arguments);
        //.type = 'Array'
        PROP(type_,this) = any_str("Array");
      }

      //method parse()
      any Grammar_ArrayLiteral_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ArrayLiteral));
        //---------
        //.req '[','SPACE_BRACKET'
        METHOD(req_,this)(this,2,(any_arr){any_str("["), any_str("SPACE_BRACKET")});
        //.lock()
        METHOD(lock_,this)(this,0,NULL);
        //.items = .optSeparatedList(Expression,',',']') # closer "]" required
        PROP(items_,this) = METHOD(optSeparatedList_,this)(this,3,(any_arr){Grammar_Expression, any_str(","), any_str("]")});// # closer "]" required
      return undefined;
      }
    

//--------------
    // Grammar_ObjectLiteral
    any Grammar_ObjectLiteral; //Class Grammar_ObjectLiteral extends Grammar_Literal
    
    //auto Grammar_ObjectLiteral__init
    void Grammar_ObjectLiteral__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        Grammar_Literal__init(this,argc,arguments);
    };

      //properties 
        //items: NameValuePair array
        //produceType: string
      ;

      //method parse()
      any Grammar_ObjectLiteral_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ObjectLiteral));
        //---------
        //.req '{'
        METHOD(req_,this)(this,1,(any_arr){any_str("{")});
        //.lock()
        METHOD(lock_,this)(this,0,NULL);
        //.items = .optSeparatedList(NameValuePair,',','}') # closer "}" required
        PROP(items_,this) = METHOD(optSeparatedList_,this)(this,3,(any_arr){Grammar_NameValuePair, any_str(","), any_str("}")});// # closer "}" required
      return undefined;
      }


// ####helper Functions

      // #recursive duet 1 (see NameValuePair)
      //helper method forEach(callback) 
      any Grammar_ObjectLiteral_forEach(DEFAULT_ARGUMENTS){
          assert(_instanceof(this,Grammar_ObjectLiteral));
          //---------
          // define named params
          var callback= argc? arguments[0] : undefined;
          //---------
          //for each nameValue in .items
          any _list22=PROP(items_,this);
          { var nameValue=undefined;
          for(int nameValue__inx=0 ; nameValue__inx<_list22.value.arr->length ; nameValue__inx++){nameValue=ITEM(nameValue__inx,_list22);
            //nameValue.forEach(callback)
            METHOD(forEach_,nameValue)(nameValue,1,(any_arr){callback});
          }};// end for each in PROP(items_,this)
          
      return undefined;
      }
    

//--------------
    // Grammar_NameValuePair
    any Grammar_NameValuePair; //Class Grammar_NameValuePair extends ASTBase
    
    //auto Grammar_NameValuePair__init
    void Grammar_NameValuePair__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

      //properties value: Expression
      ;

      //method parse()
      any Grammar_NameValuePair_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_NameValuePair));
        //---------

        //.name = .req('IDENTIFIER',StringLiteral,NumberLiteral)
        PROP(name_,this) = METHOD(req_,this)(this,3,(any_arr){any_str("IDENTIFIER"), Grammar_StringLiteral, Grammar_NumberLiteral});

        //.req ':'
        METHOD(req_,this)(this,1,(any_arr){any_str(":")});
        //.lock()
        METHOD(lock_,this)(this,0,NULL);

// if it's a "dangling assignment", we assume FreeObjectLiteral

        //if .lexer.token.type is 'NEWLINE'
        if (__is(PROP(type_,PROP(token_,PROP(lexer_,this))),any_str("NEWLINE")))  {
            //.value = .req(FreeObjectLiteral)
            PROP(value_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_FreeObjectLiteral});
        }
        //else
        
        else {
            //if .lexer.interfaceMode
            if (_anyToBool(PROP(interfaceMode_,PROP(lexer_,this))))  {
                //.parseType
                METHOD(parseType_,this)(this,0,NULL);
            }
            //else
            
            else {
                //.value = .req(Expression)
                PROP(value_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_Expression});
            };
        };
      return undefined;
      }

// recursive duet 2 (see ObjectLiteral)

      //helper method forEach(callback:Function)
      any Grammar_NameValuePair_forEach(DEFAULT_ARGUMENTS){
          assert(_instanceof(this,Grammar_NameValuePair));
          //---------
          // define named params
          var callback= argc? arguments[0] : undefined;
          //---------

          //callback.call(this) 
          __apply(callback,this,0,NULL);

          //if .value.root.name instanceof ObjectLiteral
          if (_instanceof(PROP(name_,PROP(root_,PROP(value_,this))),Grammar_ObjectLiteral))  {
            //declare .value.root.name:ObjectLiteral
            // declare .value.root.name:ObjectLiteral
            //.value.root.name.forEach callback # recurse
            __call(forEach_,PROP(name_,PROP(root_,PROP(value_,this))),1,(any_arr){callback});// # recurse
          };
      return undefined;
      }

      //end helper recursive functions
      
    

//--------------
    // Grammar_FreeObjectLiteral
    any Grammar_FreeObjectLiteral; //Class Grammar_FreeObjectLiteral extends Grammar_ObjectLiteral
    
    //auto Grammar_FreeObjectLiteral__init
    void Grammar_FreeObjectLiteral__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        Grammar_ObjectLiteral__init(this,argc,arguments);
    };

// get items: optional comma separated, closes on de-indent, at least one required

      //method parse()
      any Grammar_FreeObjectLiteral_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_FreeObjectLiteral));
        //---------
        //.lock()
        METHOD(lock_,this)(this,0,NULL);
        //.items = .reqSeparatedList(NameValuePair,',') 
        PROP(items_,this) = METHOD(reqSeparatedList_,this)(this,2,(any_arr){Grammar_NameValuePair, any_str(",")});
      return undefined;
      }
    

//--------------
    // Grammar_ParenExpression
    any Grammar_ParenExpression; //Class Grammar_ParenExpression extends ASTBase
    
    //auto Grammar_ParenExpression__init
    void Grammar_ParenExpression__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

      //properties expr:Expression
      ;

      //method parse()
      any Grammar_ParenExpression_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ParenExpression));
        //---------
        //.req '('
        METHOD(req_,this)(this,1,(any_arr){any_str("(")});
        //.lock()
        METHOD(lock_,this)(this,0,NULL);
        //.expr = .req(Expression)
        PROP(expr_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_Expression});
        //.opt 'NEWLINE'
        METHOD(opt_,this)(this,1,(any_arr){any_str("NEWLINE")});
        //.req ')'
        METHOD(req_,this)(this,1,(any_arr){any_str(")")});
      return undefined;
      }
    

//--------------
    // Grammar_FunctionDeclaration
    any Grammar_FunctionDeclaration; //Class Grammar_FunctionDeclaration extends ASTBase
    
    //auto Grammar_FunctionDeclaration__init
    void Grammar_FunctionDeclaration__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

      //properties 
        //specifier
        //paramsDeclarations: VariableDecl array
        //definePropItems: DefinePropertyItem array
        //body
        //hasExceptionBlock: boolean
        //EndFnLineNum
      ;

      //method parse()
      any Grammar_FunctionDeclaration_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_FunctionDeclaration));
        //---------

        //.specifier = .req('function','method','->')
        PROP(specifier_,this) = METHOD(req_,this)(this,3,(any_arr){any_str("function"), any_str("method"), any_str("->")});
        //.lock()
        METHOD(lock_,this)(this,0,NULL);

        //declare valid .parent.parent.parent
        // declare valid .parent.parent.parent
        //if .specifier isnt 'method' and .parent.parent.parent instance of ClassDeclaration
        if (!__is(PROP(specifier_,this),any_str("method")) && _instanceof(PROP(parent_,PROP(parent_,PROP(parent_,this))),Grammar_ClassDeclaration))  {
            //.throwError "unexpected 'function' in 'class/append' body. You should use 'method'"
            METHOD(throwError_,this)(this,1,(any_arr){any_str("unexpected 'function' in 'class/append' body. You should use 'method'")});
        };

// '->' are anonymous lambda functions

        //if .specifier is '->'
        if (__is(PROP(specifier_,this),any_str("->")))  {
            //.name = UniqueID.getVarName('fn')
            PROP(name_,this) = UniqueID_getVarName(undefined,1,(any_arr){any_str("fn")});
        }
        //else
        
        else {
            //.name = .opt('IDENTIFIER') 
            PROP(name_,this) = METHOD(opt_,this)(this,1,(any_arr){any_str("IDENTIFIER")});
            //if .name in ['main','__init','new'], .sayErr '"#{.name}" is a reserved function name'
            if (__in(PROP(name_,this),3,(any_arr){any_str("main"), any_str("__init"), any_str("new")})) {METHOD(sayErr_,this)(this,1,(any_arr){_concatAny(3,(any_arr){any_str("\""), PROP(name_,this), any_str("\" is a reserved function name")})});};
        };

// get parameter members, and function body

        //.parseParametersAndBody
        METHOD(parseParametersAndBody_,this)(this,0,NULL);
      return undefined;
      }

      // #end parse

//##### helper method parseParametersAndBody()
      any Grammar_FunctionDeclaration_parseParametersAndBody(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_FunctionDeclaration));
        //---------

// This method is shared by functions, methods and constructors.
// `()` after `function` are optional. It parses: `['(' [VariableDecl,] ')'] [returns VariableRef] '['DefinePropertyItem']'`

        //.EndFnLineNum = .sourceLineNum+1 //default value - store to generate accurate SourceMaps (js)
        PROP(EndFnLineNum_,this) = any_number(_anyToNumber(PROP(sourceLineNum_,this)) + 1); //default value - store to generate accurate SourceMaps (js)

        //if .opt("(")
        if (_anyToBool(METHOD(opt_,this)(this,1,(any_arr){any_str("(")})))  {
            //.paramsDeclarations = .optSeparatedList(VariableDecl,',',')')
            PROP(paramsDeclarations_,this) = METHOD(optSeparatedList_,this)(this,3,(any_arr){Grammar_VariableDecl, any_str(","), any_str(")")});
        }
        //else if .specifier is '->' #we arrived here by: FnCall-param-Expression-Operand-'->'
        
        else if (__is(PROP(specifier_,this),any_str("->")))  {// #we arrived here by: FnCall-param-Expression-Operand-'->'
            // # after '->' we accept function params w/o parentheses.
            // # get parameter names (name:type only), up to [NEWLINE] or '='
            //.paramsDeclarations=[]
            PROP(paramsDeclarations_,this) = new(Array,0,NULL);
            //until .lexer.token.type is 'NEWLINE' or .lexer.token.value is '='
            while(!(_anyToBool((_anyToBool(__or8=any_number(__is(PROP(type_,PROP(token_,PROP(lexer_,this))),any_str("NEWLINE"))))? __or8 : any_number(__is(PROP(value_,PROP(token_,PROP(lexer_,this))),any_str("="))))))){
                //if .paramsDeclarations.length, .req ','
                if (_length(PROP(paramsDeclarations_,this))) {METHOD(req_,this)(this,1,(any_arr){any_str(",")});};
                //var varDecl = new VariableDecl(this, .req('IDENTIFIER'))
                var varDecl = new(Grammar_VariableDecl,2,(any_arr){this, METHOD(req_,this)(this,1,(any_arr){any_str("IDENTIFIER")})});
                //if .opt(":"), varDecl.parseType
                if (_anyToBool(METHOD(opt_,this)(this,1,(any_arr){any_str(":")}))) {METHOD(parseType_,varDecl)(varDecl,0,NULL);};
                //.paramsDeclarations.push varDecl
                __call(push_,PROP(paramsDeclarations_,this),1,(any_arr){varDecl});
            };// end loop
            
        };

        //if .opt('=') #one line function. Body is a Expression
        if (_anyToBool(METHOD(opt_,this)(this,1,(any_arr){any_str("=")})))  {// #one line function. Body is a Expression

            //.body = .req(Expression)
            PROP(body_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_Expression});
        }
        //else # full body function
        
        else {

            //if .opt('returns'), .parseType  #function return type
            if (_anyToBool(METHOD(opt_,this)(this,1,(any_arr){any_str("returns")}))) {METHOD(parseType_,this)(this,0,NULL);};

            //if .opt('[','SPACE_BRACKET') # property attributes (non-enumerable, writable, etc - Object.defineProperty)
            if (_anyToBool(METHOD(opt_,this)(this,2,(any_arr){any_str("["), any_str("SPACE_BRACKET")})))  {// # property attributes (non-enumerable, writable, etc - Object.defineProperty)
                //.definePropItems = .optSeparatedList(DefinePropertyItem,',',']')
                PROP(definePropItems_,this) = METHOD(optSeparatedList_,this)(this,3,(any_arr){Grammar_DefinePropertyItem, any_str(","), any_str("]")});
            };

            // #indented function body
            //.body = .req(Body)
            PROP(body_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_Body});

            // # get function exit point source line number (for SourceMap)
            //.EndFnLineNum = .lexer.maxSourceLineNum
            PROP(EndFnLineNum_,this) = PROP(maxSourceLineNum_,PROP(lexer_,this));
        };

        //end if
        
      return undefined;
      }
    

//--------------
    // Grammar_DefinePropertyItem
    any Grammar_DefinePropertyItem; //Class Grammar_DefinePropertyItem extends ASTBase
    
    //auto Grammar_DefinePropertyItem__init
    void Grammar_DefinePropertyItem__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };
// This Symbol handles property attributes, the same used at js's **Object.DefineProperty()**

      //declare name affinity definePropItem
      // declare name affinity definePropItem

      //properties
        //negated:boolean
      ;

      //method parse()
      any Grammar_DefinePropertyItem_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_DefinePropertyItem));
        //---------
        //.lock()
        METHOD(lock_,this)(this,0,NULL);
        //.negated = .opt('not')
        PROP(negated_,this) = METHOD(opt_,this)(this,1,(any_arr){any_str("not")});
        //.name = .req('enumerable','configurable','writable')
        PROP(name_,this) = METHOD(req_,this)(this,3,(any_arr){any_str("enumerable"), any_str("configurable"), any_str("writable")});
      return undefined;
      }
    

//--------------
    // Grammar_MethodDeclaration
    any Grammar_MethodDeclaration; //Class Grammar_MethodDeclaration extends Grammar_FunctionDeclaration
    
    //auto Grammar_MethodDeclaration__init
    void Grammar_MethodDeclaration__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        Grammar_FunctionDeclaration__init(this,argc,arguments);
    };

      //method parse()
      any Grammar_MethodDeclaration_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_MethodDeclaration));
        //---------

        //.specifier = .req('method')
        PROP(specifier_,this) = METHOD(req_,this)(this,1,(any_arr){any_str("method")});
        //.lock()
        METHOD(lock_,this)(this,0,NULL);

// require method name. Note: jQuery uses 'not' and 'has' as method names, so here we
// take any token, and check if it's a valid identifier

        //.name = .req('IDENTIFIER')
        //var name = .lexer.token.value 
        var name = PROP(value_,PROP(token_,PROP(lexer_,this)));

        //var p = PMREX.whileRanges(name,0,"a-zA-Z$_") //start with one or more letters
        var p = PMREX_whileRanges(undefined,3,(any_arr){name, any_number(0), any_str("a-zA-Z$_")}); //start with one or more letters
        //if p>=0, p = PMREX.whileRanges(name,p,"0-9a-zA-Z$_") //can have numbers
        if (_anyToNumber(p) >= 0) {p = PMREX_whileRanges(undefined,3,(any_arr){name, p, any_str("0-9a-zA-Z$_")});};
        //if p < name.length, .throwError 'invalid method name: "#{name}"'
        if (_anyToNumber(p) < _length(name)) {METHOD(throwError_,this)(this,1,(any_arr){_concatAny(3,(any_arr){any_str("invalid method name: \""), name, any_str("\"")})});};

        //.name = name
        PROP(name_,this) = name;
        //.lexer.nextToken
        __call(nextToken_,PROP(lexer_,this),0,NULL);

// now parse parameters and body (as with any function)

        //.parseParametersAndBody
        METHOD(parseParametersAndBody_,this)(this,0,NULL);
      return undefined;
      }
    

//--------------
    // Grammar_ClassDeclaration
    any Grammar_ClassDeclaration; //Class Grammar_ClassDeclaration extends ASTBase
    
    //auto Grammar_ClassDeclaration__init
    void Grammar_ClassDeclaration__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

      //properties
        //varRefSuper:VariableRef
        //body
      ;

      //declare name affinity classDecl
      // declare name affinity classDecl

      //method parse()
      any Grammar_ClassDeclaration_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ClassDeclaration));
        //---------
        //.req 'class'
        METHOD(req_,this)(this,1,(any_arr){any_str("class")});
        //.lock()
        METHOD(lock_,this)(this,0,NULL);
        //.name = .req('IDENTIFIER')
        PROP(name_,this) = METHOD(req_,this)(this,1,(any_arr){any_str("IDENTIFIER")});

// Control: class names should be Capitalized, except: jQuery

        //if not .lexer.interfaceMode and not Strings.isCapitalized(.name)
        if (!(_anyToBool(PROP(interfaceMode_,PROP(lexer_,this)))) && !(_anyToBool(Strings_isCapitalized(undefined,1,(any_arr){PROP(name_,this)}))))  {
            //.lexer.sayErr "class names should be Capitalized: class #{.name}"
            __call(sayErr_,PROP(lexer_,this),1,(any_arr){_concatAny(2,(any_arr){any_str("class names should be Capitalized: class "), PROP(name_,this)})});
        };

// Now parse optional `,(extend|proto is|inherits from)` setting the super class

        //.opt(',') 
        METHOD(opt_,this)(this,1,(any_arr){any_str(",")});
        //if .opt('extends','inherits','proto') 
        if (_anyToBool(METHOD(opt_,this)(this,3,(any_arr){any_str("extends"), any_str("inherits"), any_str("proto")})))  {
          //.opt('from','is') 
          METHOD(opt_,this)(this,2,(any_arr){any_str("from"), any_str("is")});
          //.varRefSuper = .req(VariableRef)
          PROP(varRefSuper_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_VariableRef});
        };

// Now get body.

        //.body = .opt(Body)
        PROP(body_,this) = METHOD(opt_,this)(this,1,(any_arr){Grammar_Body});

        //.body.validate 
            //PropertiesDeclaration, ConstructorDeclaration 
            //MethodDeclaration, DeclareStatement
        __call(validate_,PROP(body_,this),4,(any_arr){Grammar_PropertiesDeclaration, Grammar_ConstructorDeclaration, Grammar_MethodDeclaration, Grammar_DeclareStatement});
      return undefined;
      }
    

//--------------
    // Grammar_ConstructorDeclaration
    any Grammar_ConstructorDeclaration; //Class Grammar_ConstructorDeclaration extends Grammar_MethodDeclaration
    
    //auto Grammar_ConstructorDeclaration__init
    void Grammar_ConstructorDeclaration__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        Grammar_MethodDeclaration__init(this,argc,arguments);
    };

      //method parse()
      any Grammar_ConstructorDeclaration_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ConstructorDeclaration));
        //---------

        //.specifier = .req('constructor')
        PROP(specifier_,this) = METHOD(req_,this)(this,1,(any_arr){any_str("constructor")});
        //.lock()
        METHOD(lock_,this)(this,0,NULL);

        //.name = '__init'
        PROP(name_,this) = any_str("__init");

        //if .opt('new') # optional: constructor new Person(name:string)
        if (_anyToBool(METHOD(opt_,this)(this,1,(any_arr){any_str("new")})))  {// # optional: constructor new Person(name:string)
          // # to ease reading, and to find also the constructor when searching for "new Person"
          //var className = .req('IDENTIFIER')
          var className = METHOD(req_,this)(this,1,(any_arr){any_str("IDENTIFIER")});
          //var classDeclaration = .getParent(ClassDeclaration)
          var classDeclaration = METHOD(getParent_,this)(this,1,(any_arr){Grammar_ClassDeclaration});
          //if classDeclaration and classDeclaration.name isnt className
          if (_anyToBool(classDeclaration) && !__is(PROP(name_,classDeclaration),className))  {
              //.sayErr "Class Name mismatch #{className}/#{classDeclaration.name}"
              METHOD(sayErr_,this)(this,1,(any_arr){_concatAny(4,(any_arr){any_str("Class Name mismatch "), className, any_str("/"), PROP(name_,classDeclaration)})});
          };
        };

// now get parameters and body (as with any function)

        //.parseParametersAndBody
        METHOD(parseParametersAndBody_,this)(this,0,NULL);
      return undefined;
      }
    

//--------------
    // Grammar_AppendToDeclaration
    any Grammar_AppendToDeclaration; //Class Grammar_AppendToDeclaration extends Grammar_ClassDeclaration
    
    //auto Grammar_AppendToDeclaration__init
    void Grammar_AppendToDeclaration__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        Grammar_ClassDeclaration__init(this,argc,arguments);
    };

      //properties 
        //toNamespace
        //varRef:VariableRef
      ;

      //method parse()
      any Grammar_AppendToDeclaration_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_AppendToDeclaration));
        //---------

        //.req 'append','Append'
        METHOD(req_,this)(this,2,(any_arr){any_str("append"), any_str("Append")});
        //.req 'to'
        METHOD(req_,this)(this,1,(any_arr){any_str("to")});
        //.lock()
        METHOD(lock_,this)(this,0,NULL);

        //var appendToWhat:string = .req('class','Class','namespace','Namespace')
        var appendToWhat = METHOD(req_,this)(this,4,(any_arr){any_str("class"), any_str("Class"), any_str("namespace"), any_str("Namespace")});
        //.toNamespace = appendToWhat.endsWith('space')
        PROP(toNamespace_,this) = METHOD(endsWith_,appendToWhat)(appendToWhat,1,(any_arr){any_str("space")});

        //.varRef = .req(VariableRef)
        PROP(varRef_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_VariableRef});

        //if .toNamespace, .name=.varRef.toString()
        if (_anyToBool(PROP(toNamespace_,this))) {PROP(name_,this) = __call(toString_,PROP(varRef_,this),0,NULL);};

// Now get body.

        //.body = .req(Body)
        PROP(body_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_Body});

        //.body.validate 
            //PropertiesDeclaration
            //MethodDeclaration
            //ClassDeclaration
        __call(validate_,PROP(body_,this),3,(any_arr){Grammar_PropertiesDeclaration, Grammar_MethodDeclaration, Grammar_ClassDeclaration});
      return undefined;
      }
    

//--------------
    // Grammar_NamespaceDeclaration
    any Grammar_NamespaceDeclaration; //Class Grammar_NamespaceDeclaration extends Grammar_ClassDeclaration
    
    //auto Grammar_NamespaceDeclaration__init
    void Grammar_NamespaceDeclaration__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        Grammar_ClassDeclaration__init(this,argc,arguments);
    };

      //method parse()
      any Grammar_NamespaceDeclaration_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_NamespaceDeclaration));
        //---------

        //.req 'namespace','Namespace'
        METHOD(req_,this)(this,2,(any_arr){any_str("namespace"), any_str("Namespace")});

        //.lock()
        METHOD(lock_,this)(this,0,NULL);
        //.name=.req('IDENTIFIER')
        PROP(name_,this) = METHOD(req_,this)(this,1,(any_arr){any_str("IDENTIFIER")});

// Now get body.

        //.body = .req(Body)
        PROP(body_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_Body});

        //.body.validate 
            //PropertiesDeclaration
            //MethodDeclaration
            //ClassDeclaration
            //NamespaceDeclaration
        __call(validate_,PROP(body_,this),4,(any_arr){Grammar_PropertiesDeclaration, Grammar_MethodDeclaration, Grammar_ClassDeclaration, Grammar_NamespaceDeclaration});
      return undefined;
      }
    

//--------------
    // Grammar_DebuggerStatement
    any Grammar_DebuggerStatement; //Class Grammar_DebuggerStatement extends ASTBase
    
    //auto Grammar_DebuggerStatement__init
    void Grammar_DebuggerStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };
      //method parse()
      any Grammar_DebuggerStatement_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_DebuggerStatement));
        //---------
        //.name = .req("debugger")
        PROP(name_,this) = METHOD(req_,this)(this,1,(any_arr){any_str("debugger")});
      return undefined;
      }
    

//--------------
    // Grammar_CompilerStatement
    any Grammar_CompilerStatement; //Class Grammar_CompilerStatement extends ASTBase
    
    //auto Grammar_CompilerStatement__init
    void Grammar_CompilerStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

      //properties
        //kind, conditional:string
        //list, body
        //endLineInx
      ;

      //method parse()
      any Grammar_CompilerStatement_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_CompilerStatement));
        //---------
        //.req 'compiler','compile'
        METHOD(req_,this)(this,2,(any_arr){any_str("compiler"), any_str("compile")});
        //.lock()
        METHOD(lock_,this)(this,0,NULL);

        //.kind = .req('set','if','debugger','options')
        PROP(kind_,this) = METHOD(req_,this)(this,4,(any_arr){any_str("set"), any_str("if"), any_str("debugger"), any_str("options")});

// ### compiler set
// get list of declared names, add to root node 'Compiler Vars'

        //if .kind is 'set'
        if (__is(PROP(kind_,this),any_str("set")))  {
            //.list = .reqSeparatedList(VariableDecl,',')
            PROP(list_,this) = METHOD(reqSeparatedList_,this)(this,2,(any_arr){Grammar_VariableDecl, any_str(",")});
        }

// ### compiler if conditional compilation
        //else if .kind is 'if'
        
        else if (__is(PROP(kind_,this),any_str("if")))  {

          //.conditional = .req('IDENTIFIER')
          PROP(conditional_,this) = METHOD(req_,this)(this,1,(any_arr){any_str("IDENTIFIER")});

          //if .compilerVar(.conditional)
          if (_anyToBool(METHOD(compilerVar_,this)(this,1,(any_arr){PROP(conditional_,this)})))  {
              //.body = .req(Body)
              PROP(body_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_Body});
          }
          //else
          
          else {
            //skip block
            //do 
            do{
              //.lexer.nextToken
              __call(nextToken_,PROP(lexer_,this),0,NULL);
            } while (!(_anyToNumber(PROP(indent_,PROP(lexer_,this))) <= _anyToNumber(PROP(indent_,this))));// end loop
            
          };
        }


// ### other compile options
        //else if .kind is 'debugger' #debug-pause the compiler itself, to debug compiling process
        
        else if (__is(PROP(kind_,this),any_str("debugger")))  {// #debug-pause the compiler itself, to debug compiling process
          //debugger
          assert(0);
        }
        //else
        
        else {
          //.sayErr 'invalid compiler command'
          METHOD(sayErr_,this)(this,1,(any_arr){any_str("invalid compiler command")});
        };
      return undefined;
      }
    

//--------------
    // Grammar_ImportStatement
    any Grammar_ImportStatement; //Class Grammar_ImportStatement extends ASTBase
    
    //auto Grammar_ImportStatement__init
    void Grammar_ImportStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

      //properties 
        //global:boolean
        //list: ImportStatementItem array
      ;

      //method parse()
      any Grammar_ImportStatement_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ImportStatement));
        //---------
        //.req('import')
        METHOD(req_,this)(this,1,(any_arr){any_str("import")});
        //.lock
        METHOD(lock_,this)(this,0,NULL);

        //if .lexer.options.browser, .throwError "'import' statement invalid in browser-mode. Do you mean 'global declare'?"
        if (_anyToBool(PROP(browser_,PROP(options_,PROP(lexer_,this))))) {METHOD(throwError_,this)(this,1,(any_arr){any_str("'import' statement invalid in browser-mode. Do you mean 'global declare'?")});};

        //.list = .reqSeparatedList(ImportStatementItem,",")
        PROP(list_,this) = METHOD(reqSeparatedList_,this)(this,2,(any_arr){Grammar_ImportStatementItem, any_str(",")});

// keep track of `import/require` calls

        //var parentModule = .getParent(Module)
        var parentModule = METHOD(getParent_,this)(this,1,(any_arr){Grammar_Module});
        //for each item in .list
        any _list23=PROP(list_,this);
        { var item=undefined;
        for(int item__inx=0 ; item__inx<_list23.value.arr->length ; item__inx++){item=ITEM(item__inx,_list23);
            //parentModule.requireCallNodes.push item
            __call(push_,PROP(requireCallNodes_,parentModule),1,(any_arr){item});
        }};// end for each in PROP(list_,this)
        
      return undefined;
      }
    

//--------------
    // Grammar_ImportStatementItem
    any Grammar_ImportStatementItem; //Class Grammar_ImportStatementItem extends ASTBase
    
    //auto Grammar_ImportStatementItem__init
    void Grammar_ImportStatementItem__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

// `ImportStatementItem: IDENTIFIER [from STRING]`

      //properties 
        //importParameter:StringLiteral
      ;

      //method parse()
      any Grammar_ImportStatementItem_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_ImportStatementItem));
        //---------
        //.name = .req('IDENTIFIER')
        PROP(name_,this) = METHOD(req_,this)(this,1,(any_arr){any_str("IDENTIFIER")});
        //if .opt('from')
        if (_anyToBool(METHOD(opt_,this)(this,1,(any_arr){any_str("from")})))  {
            //.lock()
            METHOD(lock_,this)(this,0,NULL);
            //.importParameter = .req(StringLiteral)
            PROP(importParameter_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_StringLiteral});
        };
      return undefined;
      }
    

//--------------
    // Grammar_DeclareStatement
    any Grammar_DeclareStatement; //Class Grammar_DeclareStatement extends ASTBase
    
    //auto Grammar_DeclareStatement__init
    void Grammar_DeclareStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

      //properties
        //varRef: VariableRef
        //names: VariableDecl array
        //list: ImportStatementItem array
        //specifier
        //globVar: boolean
      ;

      //method parse()
      any Grammar_DeclareStatement_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_DeclareStatement));
        //---------

        //.req 'declare'
        METHOD(req_,this)(this,1,(any_arr){any_str("declare")});
        //.lock()
        METHOD(lock_,this)(this,0,NULL);

// if it was 'global declare', treat as import statement

        //if .hasAdjective('global')
        if (_anyToBool(METHOD(hasAdjective_,this)(this,1,(any_arr){any_str("global")})))  {
              //.list = .reqSeparatedList(ImportStatementItem,",")
              PROP(list_,this) = METHOD(reqSeparatedList_,this)(this,2,(any_arr){Grammar_ImportStatementItem, any_str(",")});
              //keep track of `import/require` calls
              //var parentModule = .getParent(Module)
              var parentModule = METHOD(getParent_,this)(this,1,(any_arr){Grammar_Module});
              //for each item in .list
              any _list24=PROP(list_,this);
              { var item=undefined;
              for(int item__inx=0 ; item__inx<_list24.value.arr->length ; item__inx++){item=ITEM(item__inx,_list24);
                  //parentModule.requireCallNodes.push item
                  __call(push_,PROP(requireCallNodes_,parentModule),1,(any_arr){item});
              }};// end for each in PROP(list_,this)
              //return
              return undefined;
        };
        //end if

// get specifier 'on|valid|name|all'

        //.specifier = .opt('on','valid','name','global','var')
        PROP(specifier_,this) = METHOD(opt_,this)(this,5,(any_arr){any_str("on"), any_str("valid"), any_str("name"), any_str("global"), any_str("var")});
        //if .lexer.token.value is ':' #it was used as a var name
        if (__is(PROP(value_,PROP(token_,PROP(lexer_,this))),any_str(":")))  {// #it was used as a var name
            //.specifier='on-the-fly'
            PROP(specifier_,this) = any_str("on-the-fly");
            //.lexer.returnToken
            __call(returnToken_,PROP(lexer_,this),0,NULL);
        }
        //else if no .specifier
        
        else if (!_anyToBool(PROP(specifier_,this)))  {
            //.specifier='on-the-fly' #no specifier => assume on-the-fly type assignment
            PROP(specifier_,this) = any_str("on-the-fly");// #no specifier => assume on-the-fly type assignment
        };
        //end if

        // #handle '...global var..' & '...global type for..'
        //if .specifier is 'global' #declare global (var|type for)... 
        if (__is(PROP(specifier_,this),any_str("global")))  {// #declare global (var|type for)...
            //.specifier = .req('var','type') #require 'var|type'
            PROP(specifier_,this) = METHOD(req_,this)(this,2,(any_arr){any_str("var"), any_str("type")});// #require 'var|type'
            //if .specifier is 'var'
            if (__is(PROP(specifier_,this),any_str("var")))  {
                  //.globVar = true
                  PROP(globVar_,this) = true;
            }
            //else # .specifier is 'type' require 'for'
            
            else {
                  //.req('for')
                  METHOD(req_,this)(this,1,(any_arr){any_str("for")});
            };
        };
        //end if

        //switch .specifier
        any _switch3=PROP(specifier_,this);
          // case 'on-the-fly','type':
        if (__is(_switch3,any_str("on-the-fly"))||__is(_switch3,any_str("type"))){
            // #declare VarRef:Type
            //.varRef = .req(VariableRef)
            PROP(varRef_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_VariableRef});
            //.req(':') //type expected
            METHOD(req_,this)(this,1,(any_arr){any_str(":")}); //type expected
            //.parseType 
            METHOD(parseType_,this)(this,0,NULL);
        
        }// case 'valid':
        else if (__is(_switch3,any_str("valid"))){
            //.varRef = .req(VariableRef)
            PROP(varRef_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_VariableRef});
            //if no .varRef.accessors, .sayErr "declare valid: expected accesor chain. Example: 'declare valid name.member.member'"
            if (!_anyToBool(PROP(accessors_,PROP(varRef_,this)))) {METHOD(sayErr_,this)(this,1,(any_arr){any_str("declare valid: expected accesor chain. Example: 'declare valid name.member.member'")});};
            //if .opt(':') 
            if (_anyToBool(METHOD(opt_,this)(this,1,(any_arr){any_str(":")})))  {
                //.parseType //optional type
                METHOD(parseType_,this)(this,0,NULL); //optional type
            };
        
        }// case 'name':
        else if (__is(_switch3,any_str("name"))){
            //.specifier = .req('affinity')
            PROP(specifier_,this) = METHOD(req_,this)(this,1,(any_arr){any_str("affinity")});
            //.names = .reqSeparatedList(VariableDecl,',')
            PROP(names_,this) = METHOD(reqSeparatedList_,this)(this,2,(any_arr){Grammar_VariableDecl, any_str(",")});
            //for each varDecl in .names
            any _list25=PROP(names_,this);
            { var varDecl=undefined;
            for(int varDecl__inx=0 ; varDecl__inx<_list25.value.arr->length ; varDecl__inx++){varDecl=ITEM(varDecl__inx,_list25);
               //if (varDecl.type and varDecl.type isnt 'any') or varDecl.assignedValue
               if (_anyToBool((_anyToBool(__or9=any_number(_anyToBool(PROP(type_,varDecl)) && !__is(PROP(type_,varDecl),any_str("any"))))? __or9 : PROP(assignedValue_,varDecl))))  {
                  //.sayErr "declare name affinity: expected 'name,name,...'"
                  METHOD(sayErr_,this)(this,1,(any_arr){any_str("declare name affinity: expected 'name,name,...'")});
               };
            }};// end for each in PROP(names_,this)
            
        
        }// case 'var':
        else if (__is(_switch3,any_str("var"))){
            //.names = .reqSeparatedList(VariableDecl,',')
            PROP(names_,this) = METHOD(reqSeparatedList_,this)(this,2,(any_arr){Grammar_VariableDecl, any_str(",")});
            //for each varDecl in .names
            any _list26=PROP(names_,this);
            { var varDecl=undefined;
            for(int varDecl__inx=0 ; varDecl__inx<_list26.value.arr->length ; varDecl__inx++){varDecl=ITEM(varDecl__inx,_list26);
               //if varDecl.assignedValue
               if (_anyToBool(PROP(assignedValue_,varDecl)))  {
                  //.sayErr "declare var. Cannot assign value in .interface.md file."
                  METHOD(sayErr_,this)(this,1,(any_arr){any_str("declare var. Cannot assign value in .interface.md file.")});
               };
            }};// end for each in PROP(names_,this)
            
        
        }// case 'on':
        else if (__is(_switch3,any_str("on"))){
            //.name = .req('IDENTIFIER')
            PROP(name_,this) = METHOD(req_,this)(this,1,(any_arr){any_str("IDENTIFIER")});
            //.names = .reqSeparatedList(VariableDecl,',')
            PROP(names_,this) = METHOD(reqSeparatedList_,this)(this,2,(any_arr){Grammar_VariableDecl, any_str(",")});
        
        };

        //end switch

        //return 
        return undefined;
      return undefined;
      }

      //end method parse
      
    

//--------------
    // Grammar_DefaultAssignment
    any Grammar_DefaultAssignment; //Class Grammar_DefaultAssignment extends ASTBase
    
    //auto Grammar_DefaultAssignment__init
    void Grammar_DefaultAssignment__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

      //properties
        //assignment: AssignmentStatement
      ;

      //method parse()
      any Grammar_DefaultAssignment_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_DefaultAssignment));
        //---------

        //.req 'default'
        METHOD(req_,this)(this,1,(any_arr){any_str("default")});
        //.lock()
        METHOD(lock_,this)(this,0,NULL);

        //.assignment = .req(AssignmentStatement)
        PROP(assignment_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_AssignmentStatement});
      return undefined;
      }
    

//--------------
    // Grammar_EndStatement
    any Grammar_EndStatement; //Class Grammar_EndStatement extends ASTBase
    
    //auto Grammar_EndStatement__init
    void Grammar_EndStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

      //properties
        //references:string array
      ;

      //method parse()
      any Grammar_EndStatement_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_EndStatement));
        //---------

        //.req 'end'
        METHOD(req_,this)(this,1,(any_arr){any_str("end")});

        //.lock()
        METHOD(lock_,this)(this,0,NULL);
        //.references=[]
        PROP(references_,this) = new(Array,0,NULL);

        //var block:ASTBase
        var block = undefined;
        //if .parent.parent is instanceof Body or .parent.parent is instanceof Module
        if (_anyToBool((_anyToBool(__or10=any_number(_instanceof(PROP(parent_,PROP(parent_,this)),Grammar_Body)))? __or10 : any_number(_instanceof(PROP(parent_,PROP(parent_,this)),Grammar_Module)))))  {
            //block = .parent.parent
            block = PROP(parent_,PROP(parent_,this));
        };
        //if no block
        if (!_anyToBool(block))  {
            //.lexer.throwErr "'end' statement found outside a block"
            __call(throwErr_,PROP(lexer_,this),1,(any_arr){any_str("'end' statement found outside a block")});
        };
        //var expectedIndent = block.indent or 4
        var expectedIndent = (_anyToBool(__or11=PROP(indent_,block))? __or11 : any_number(4));
        //if .indent isnt expectedIndent
        if (!__is(PROP(indent_,this),expectedIndent))  {
            //.lexer.throwErr "'end' statement misaligned indent: #{.indent}. Expected #{expectedIndent} to close block started at line #{block.sourceLineNum}"
            __call(throwErr_,PROP(lexer_,this),1,(any_arr){_concatAny(6,(any_arr){any_str("'end' statement misaligned indent: "), PROP(indent_,this), any_str(". Expected "), expectedIndent, any_str(" to close block started at line "), PROP(sourceLineNum_,block)})});
        };


// The words after `end` are just 'loose references' to the block intended to be closed
// We pick all the references up to EOL (or EOF)

        //while not .opt('NEWLINE','EOF')
        while(!(_anyToBool(METHOD(opt_,this)(this,2,(any_arr){any_str("NEWLINE"), any_str("EOF")})))){

// Get optional identifier reference
// We save `end` references, to match on block indentation,
// for Example: `end for` indentation must match a `for` statement on the same indent

            //if .lexer.token.type is 'IDENTIFIER'
            if (__is(PROP(type_,PROP(token_,PROP(lexer_,this))),any_str("IDENTIFIER")))  {
              //.references.push(.lexer.token.value)
              __call(push_,PROP(references_,this),1,(any_arr){PROP(value_,PROP(token_,PROP(lexer_,this)))});
            };

            //.lexer.nextToken
            __call(nextToken_,PROP(lexer_,this),0,NULL);
        };// end loop
        
      return undefined;
      }
    

//--------------
    // Grammar_YieldExpression
    any Grammar_YieldExpression; //Class Grammar_YieldExpression extends ASTBase
    
    //auto Grammar_YieldExpression__init
    void Grammar_YieldExpression__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

      //properties
        //specifier
        //fnCall
        //arrExpression
      ;

      //method parse()
      any Grammar_YieldExpression_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_YieldExpression));
        //---------

        //.req 'yield'
        METHOD(req_,this)(this,1,(any_arr){any_str("yield")});
        //.specifier = .req('until','parallel')
        PROP(specifier_,this) = METHOD(req_,this)(this,2,(any_arr){any_str("until"), any_str("parallel")});

        //.lock()
        METHOD(lock_,this)(this,0,NULL);

        //if .specifier is 'until'
        if (__is(PROP(specifier_,this),any_str("until")))  {

            //.fnCall = .req(FunctionCall)
            PROP(fnCall_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_FunctionCall});
        }
        //else
        
        else {

            //.req 'map'
            METHOD(req_,this)(this,1,(any_arr){any_str("map")});
            //.arrExpression = .req(Expression)
            PROP(arrExpression_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_Expression});
            //.fnCall = .req(FunctionCall)
            PROP(fnCall_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_FunctionCall});
        };
      return undefined;
      }
    

//--------------
    // Grammar_FunctionCall
    any Grammar_FunctionCall; //Class Grammar_FunctionCall extends ASTBase
    
    //auto Grammar_FunctionCall__init
    void Grammar_FunctionCall__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

      //declare name affinity fnCall
      // declare name affinity fnCall

      //properties
          //varRef: VariableRef
      ;

      //method parse(options)
      any Grammar_FunctionCall_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_FunctionCall));
        //---------
        // define named params
        var options= argc? arguments[0] : undefined;
        //---------
        //declare valid .parent.preParsedVarRef
        // declare valid .parent.preParsedVarRef

// Check for VariableRef. - can include (...) FunctionAccess

        //if .parent.preParsedVarRef #VariableRef already parsed
        if (_anyToBool(PROP(preParsedVarRef_,PROP(parent_,this))))  {// #VariableRef already parsed
          //.varRef = .parent.preParsedVarRef #use it
          PROP(varRef_,this) = PROP(preParsedVarRef_,PROP(parent_,this));// #use it
        }
        //else  
        
        else {
          //.varRef = .req(VariableRef)
          PROP(varRef_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_VariableRef});
        };

// if the last accessor is function call, this is already a FunctionCall

        //debug "#{.varRef.toString()} #{.varRef.executes?'executes':'DO NOT executes'}"

        //if .varRef.executes
        if (_anyToBool(PROP(executes_,PROP(varRef_,this))))  {
            //return #already a function call
            return undefined;// #already a function call
        };

        //if .lexer.token.type is 'EOF'
        if (__is(PROP(type_,PROP(token_,PROP(lexer_,this))),any_str("EOF")))  {
            //return // no more tokens 
            return undefined; // no more tokens
        };

// alllow a indented block to be parsed as fn call arguments

        //if .opt('NEWLINE') // if end of line, check next line
        if (_anyToBool(METHOD(opt_,this)(this,1,(any_arr){any_str("NEWLINE")})))  { // if end of line, check next line
            //var nextLineIndent = .lexer.indent //save indent
            var nextLineIndent = PROP(indent_,PROP(lexer_,this)); //save indent
            //.lexer.returnToken() //return NEWLINE
            __call(returnToken_,PROP(lexer_,this),0,NULL); //return NEWLINE
            // check if next line is indented (with respect to Statement (parent))
            //if nextLineIndent <= .parent.indent // next line is not indented 
            if (_anyToNumber(nextLineIndent) <= _anyToNumber(PROP(indent_,PROP(parent_,this))))  { // next line is not indented
                  // assume this is just a fn call w/o parameters
                  //return
                  return undefined;
            };
        };

// else, get parameters, add to varRef as FunctionAccess accessor,

        //var functionAccess = new FunctionAccess(.varRef)
        var functionAccess = new(Grammar_FunctionAccess,1,(any_arr){PROP(varRef_,this)});
        //functionAccess.args = functionAccess.reqSeparatedList(FunctionArgument,",")
        PROP(args_,functionAccess) = METHOD(reqSeparatedList_,functionAccess)(functionAccess,2,(any_arr){Grammar_FunctionArgument, any_str(",")});
        //if .lexer.token.value is '->' #add last parameter: callback function
        if (__is(PROP(value_,PROP(token_,PROP(lexer_,this))),any_str("->")))  {// #add last parameter: callback function
            //functionAccess.args.push .req(FunctionDeclaration)
            __call(push_,PROP(args_,functionAccess),1,(any_arr){METHOD(req_,this)(this,1,(any_arr){Grammar_FunctionDeclaration})});
        };

        //.varRef.addAccessor functionAccess
        __call(addAccessor_,PROP(varRef_,this),1,(any_arr){functionAccess});
      return undefined;
      }
    

//--------------
    // Grammar_SwitchStatement
    any Grammar_SwitchStatement; //Class Grammar_SwitchStatement extends ASTBase
    
    //auto Grammar_SwitchStatement__init
    void Grammar_SwitchStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

      //properties
        //varRef
        //cases: SwitchCase array
        //defaultBody: Body
      ;

      //method parse()
      any Grammar_SwitchStatement_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_SwitchStatement));
        //---------
        //.req 'switch'
        METHOD(req_,this)(this,1,(any_arr){any_str("switch")});
        //.lock()
        METHOD(lock_,this)(this,0,NULL);
        //.varRef = .opt(VariableRef)
        PROP(varRef_,this) = METHOD(opt_,this)(this,1,(any_arr){Grammar_VariableRef});
        //.cases=[]
        PROP(cases_,this) = new(Array,0,NULL);

// Loop processing: 'NEWLINE','case' or 'default'

        //do until .lexer.token.type is 'EOF' or .lexer.indent<=.indent
        while(!(_anyToBool((_anyToBool(__or12=any_number(__is(PROP(type_,PROP(token_,PROP(lexer_,this))),any_str("EOF"))))? __or12 : any_number(_anyToNumber(PROP(indent_,PROP(lexer_,this))) <= _anyToNumber(PROP(indent_,this))))))){
            //var keyword = .req('case','default','NEWLINE')
            var keyword = METHOD(req_,this)(this,3,(any_arr){any_str("case"), any_str("default"), any_str("NEWLINE")});

// on 'case', get a comma separated list of expressions, ended by ":"
// and a "Body". Push both on .cases[]

            //if keyword is 'case'
            if (__is(keyword,any_str("case")))  {
                //.cases.push .req(SwitchCase)
                __call(push_,PROP(cases_,this),1,(any_arr){METHOD(req_,this)(this,1,(any_arr){Grammar_SwitchCase})});
            }

// else, on 'default', get default body, and break loop
            //else if keyword is 'default'
            
            else if (__is(keyword,any_str("default")))  {
                //.opt(":")
                METHOD(opt_,this)(this,1,(any_arr){any_str(":")});
                //.defaultBody = .reqBody()
                PROP(defaultBody_,this) = METHOD(reqBody_,this)(this,0,NULL);
                //break;
                break;
            };
        };// end loop

        //if no .cases.length, .throwError "no 'case' found after 'switch'"
        if (!_length(PROP(cases_,this))) {METHOD(throwError_,this)(this,1,(any_arr){any_str("no 'case' found after 'switch'")});};
      return undefined;
      }
    

//--------------
    // Grammar_SwitchCase
    any Grammar_SwitchCase; //Class Grammar_SwitchCase extends ASTBase
    
    //auto Grammar_SwitchCase__init
    void Grammar_SwitchCase__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };
// Helper class to parse each case

        //properties
            //expressions: Expression array
            //body
        ;

// ...a comma separated list of expressions, ended by ":", and a "Body"

        //method parse()
        any Grammar_SwitchCase_parse(DEFAULT_ARGUMENTS){
            assert(_instanceof(this,Grammar_SwitchCase));
            //---------
            //.expressions = .reqSeparatedList(Expression, ",", ":")
            PROP(expressions_,this) = METHOD(reqSeparatedList_,this)(this,3,(any_arr){Grammar_Expression, any_str(","), any_str(":")});
            //.body = .reqBody()
            PROP(body_,this) = METHOD(reqBody_,this)(this,0,NULL);
        return undefined;
        }
    

//--------------
    // Grammar_CaseWhenExpression
    any Grammar_CaseWhenExpression; //Class Grammar_CaseWhenExpression extends ASTBase
    
    //auto Grammar_CaseWhenExpression__init
    void Grammar_CaseWhenExpression__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

      //properties
        //varRef
        //cases: CaseWhenSection array
        //elseExpression: Expression
      ;

      //method parse()
      any Grammar_CaseWhenExpression_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_CaseWhenExpression));
        //---------
        //.req 'case'
        METHOD(req_,this)(this,1,(any_arr){any_str("case")});
        //.lock()
        METHOD(lock_,this)(this,0,NULL);
        //.varRef = .opt(VariableRef)
        PROP(varRef_,this) = METHOD(opt_,this)(this,1,(any_arr){Grammar_VariableRef});
        //.cases=[]
        PROP(cases_,this) = new(Array,0,NULL);

// Loop processing: 'NEWLINE','when' or 'else' until 'end'

        //do until .lexer.token.value is 'end'
        while(!(__is(PROP(value_,PROP(token_,PROP(lexer_,this))),any_str("end")))){
            //var keyword = .req('NEWLINE','when','else')
            var keyword = METHOD(req_,this)(this,3,(any_arr){any_str("NEWLINE"), any_str("when"), any_str("else")});

// on 'case', get a comma separated list of expressions, ended by ":"
// and a "Body". Push both on .cases[]

            //if keyword is 'when'
            if (__is(keyword,any_str("when")))  {
                //.cases.push .req(CaseWhenSection)
                __call(push_,PROP(cases_,this),1,(any_arr){METHOD(req_,this)(this,1,(any_arr){Grammar_CaseWhenSection})});
            }

// else, on 'default', get default body, and break loop
            //else if keyword is 'else'
            
            else if (__is(keyword,any_str("else")))  {
                //.elseExpression = .req(Expression)
                PROP(elseExpression_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_Expression});
                //break; #no more cases allowed after else
                break;// #no more cases allowed after else
            };
        };// end loop

// check if there are cases. Require 'end'

        //if no .cases.length, .sayErr "no 'when' found after 'case'"
        if (!_length(PROP(cases_,this))) {METHOD(sayErr_,this)(this,1,(any_arr){any_str("no 'when' found after 'case'")});};
        //if no .elseExpression, .sayErr "no 'else' expression in 'case/when'"
        if (!_anyToBool(PROP(elseExpression_,this))) {METHOD(sayErr_,this)(this,1,(any_arr){any_str("no 'else' expression in 'case/when'")});};

        //.opt 'NEWLINE'
        METHOD(opt_,this)(this,1,(any_arr){any_str("NEWLINE")});
        //.req 'end'
        METHOD(req_,this)(this,1,(any_arr){any_str("end")});
      return undefined;
      }
    

//--------------
    // Grammar_CaseWhenSection
    any Grammar_CaseWhenSection; //Class Grammar_CaseWhenSection extends ASTBase
    
    //auto Grammar_CaseWhenSection__init
    void Grammar_CaseWhenSection__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };
// Helper class to parse each case

        //properties
            //expressions: Expression array
            //booleanExpression
            //resultExpression
        ;



// if there is a var, we allow a list of comma separated expressions to compare to.
// If there is no var, we allow a single boolean-Expression.
// After: 'then', and the result-Expression

        //method parse()
        any Grammar_CaseWhenSection_parse(DEFAULT_ARGUMENTS){
            assert(_instanceof(this,Grammar_CaseWhenSection));
            //---------

            //declare .parent:CaseWhenExpression
            // declare .parent:CaseWhenExpression

            //if .parent.varRef 
            if (_anyToBool(PROP(varRef_,PROP(parent_,this))))  {
                //.expressions = .reqSeparatedList(Expression, ",")
                PROP(expressions_,this) = METHOD(reqSeparatedList_,this)(this,2,(any_arr){Grammar_Expression, any_str(",")});
            }
            //else
            
            else {
                //.booleanExpression = .req(Expression)
                PROP(booleanExpression_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_Expression});
            };

            //.req 'then'
            METHOD(req_,this)(this,1,(any_arr){any_str("then")});
            //.resultExpression = .req(Expression)
            PROP(resultExpression_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_Expression});
        return undefined;
        }
    

//--------------
    // Grammar_Statement
    any Grammar_Statement; //Class Grammar_Statement extends ASTBase
    
    //auto Grammar_Statement__init
    void Grammar_Statement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
      PROP(adjectives_,this)=new(Array,0,NULL);
    };

      //properties
        //adjectives: string array = []
        //specific: ASTBase //specific statement, e.g.: :VarDeclaration, :PropertiesDeclaration, :FunctionDeclaration
        //preParsedVarRef
        //intoVars
//
        //lastSourceLineNum
      ;

      //method parse()
      any Grammar_Statement_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_Statement));
        //---------

        //var key
        var key = undefined;

        // #debug show line and tokens
        //logger.debug ""
        logger_debug(undefined,1,(any_arr){any_EMPTY_STR});
        //.lexer.infoLine.dump()
        __call(dump_,PROP(infoLine_,PROP(lexer_,this)),0,NULL);

// First, fast-parse the statement by using a table.
// We look up the token (keyword) in **StatementsDirect** table, and parse the specific AST node

        //key = .lexer.token.value
        key = PROP(value_,PROP(token_,PROP(lexer_,this)));
        //.specific = .parseDirect(key, StatementsDirect)
        PROP(specific_,this) = METHOD(parseDirect_,this)(this,2,(any_arr){key, Grammar_StatementsDirect});

        //if no .specific
        if (!_anyToBool(PROP(specific_,this)))  {

// If it was not found, try optional adjectives (zero or more).
// Adjectives are: `(export|public|generator|shim|helper)`.

            //while .opt('public','export','default','nice','generator','shim','helper','global') into var adj
            var adj=undefined;
            while(_anyToBool((adj=METHOD(opt_,this)(this,8,(any_arr){any_str("public"), any_str("export"), any_str("default"), any_str("nice"), any_str("generator"), any_str("shim"), any_str("helper"), any_str("global")})))){
                //if adj is 'public', adj='export' #'public' is just alias for 'export'
                if (__is(adj,any_str("public"))) {adj = any_str("export");};
                //.adjectives.push adj
                __call(push_,PROP(adjectives_,this),1,(any_arr){adj});
            };// end loop

// Now re-try fast-parse

            //key = .lexer.token.value
            key = PROP(value_,PROP(token_,PROP(lexer_,this)));
            //.specific = .parseDirect(key, StatementsDirect)
            PROP(specific_,this) = METHOD(parseDirect_,this)(this,2,(any_arr){key, Grammar_StatementsDirect});

            //if no .specific
            if (!_anyToBool(PROP(specific_,this)))  {

// Last possibilities are: `FunctionCall` or `AssignmentStatement`
// both start with a `VariableRef`:

// (performance) **require** & pre-parse the VariableRef.
// Then we require a AssignmentStatement or FunctionCall

                //key = 'varref'
                key = any_str("varref");
                //.preParsedVarRef = .req(VariableRef)
                PROP(preParsedVarRef_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_VariableRef});
                //.specific = .req(AssignmentStatement,FunctionCall)
                PROP(specific_,this) = METHOD(req_,this)(this,2,(any_arr){Grammar_AssignmentStatement, Grammar_FunctionCall});
                //.preParsedVarRef = undefined #clear
                PROP(preParsedVarRef_,this) = undefined;// #clear
            };
        };

        //end if - statement parse tries

// If we reached here, we have parsed a valid statement.

// remember where the full statment ends

        //.lastSourceLineNum = .lexer.maxSourceLineNum 
        PROP(lastSourceLineNum_,this) = PROP(maxSourceLineNum_,PROP(lexer_,this));
        //if .lastSourceLineNum<.sourceLineNum, .lastSourceLineNum = .sourceLineNum
        if (_anyToNumber(PROP(lastSourceLineNum_,this)) < _anyToNumber(PROP(sourceLineNum_,this))) {PROP(lastSourceLineNum_,this) = PROP(sourceLineNum_,this);};

// Check validity of adjective-statement combination

        //key = key.toLowerCase()
        key = METHOD(toLowerCase_,key)(key,0,NULL);
        //.keyword = key
        PROP(keyword_,this) = key;

// Check validity of adjective-statement combination

        //var CFVN = ['class','function','var','namespace'] 
        var CFVN = new(Array,4,(any_arr){any_str("class"), any_str("function"), any_str("var"), any_str("namespace")});

        //var validCombinations =  
              //export: CFVN, default: CFVN
              //generator: ['function','method'] 
              //nice: ['function','method'] 
              //shim: ['function','method','class','namespace','import'] 
              //helper:  ['function','method','class','namespace']
              //global: ['import','declare']
        var validCombinations = new(Map,7,(any_arr){
              _newPair("export",CFVN), 
              _newPair("default",CFVN), 
              _newPair("generator",new(Array,2,(any_arr){any_str("function"), any_str("method")})), 
              _newPair("nice",new(Array,2,(any_arr){any_str("function"), any_str("method")})), 
              _newPair("shim",new(Array,5,(any_arr){any_str("function"), any_str("method"), any_str("class"), any_str("namespace"), any_str("import")})), 
              _newPair("helper",new(Array,4,(any_arr){any_str("function"), any_str("method"), any_str("class"), any_str("namespace")})), 
              _newPair("global",new(Array,2,(any_arr){any_str("import"), any_str("declare")}))
              })
        ;

        //for each adjective in .adjectives
        any _list27=PROP(adjectives_,this);
        { var adjective=undefined;
        for(int adjective__inx=0 ; adjective__inx<_list27.value.arr->length ; adjective__inx++){adjective=ITEM(adjective__inx,_list27);

              //var valid:string array = validCombinations.get(adjective) or ['-*none*-']
              var valid = (_anyToBool(__or13=METHOD(get_,validCombinations)(validCombinations,1,(any_arr){adjective}))? __or13 : new(Array,1,(any_arr){any_str("-*none*-")}));
              //if key not in valid, .throwError "'#{adjective}' can only apply to #{valid.join('|')} not to '#{key}'"
              if (CALL1(indexOf_,valid,key).value.number==-1) {METHOD(throwError_,this)(this,1,(any_arr){_concatAny(7,(any_arr){any_str("'"), adjective, any_str("' can only apply to "), METHOD(join_,valid)(valid,1,(any_arr){any_str("|")}), any_str(" not to '"), key, any_str("'")})});};
        }};// end for each in PROP(adjectives_,this)

        //end for

// set module.exportDefault if 'export default' or 'public default' was parsed.
// Also, if the class/namespace has the same name as the file, it's automagically "export default"

        //var moduleNode:Module = .getParent(Module)
        var moduleNode = METHOD(getParent_,this)(this,1,(any_arr){Grammar_Module});
        //if .specific.constructor in [ClassDeclaration,NamespaceDeclaration] and moduleNode.fileInfo.base is .specific.name  
        if (__in(any_class(PROP(specific_,this).class),2,(any_arr){Grammar_ClassDeclaration, Grammar_NamespaceDeclaration}) && __is(PROP(base_,PROP(fileInfo_,moduleNode)),PROP(name_,PROP(specific_,this))))  {
            //.adjectives.push 'export','default'
            __call(push_,PROP(adjectives_,this),2,(any_arr){any_str("export"), any_str("default")});
        };

        //if .hasAdjective('export') and .hasAdjective('default')
        if (_anyToBool(METHOD(hasAdjective_,this)(this,1,(any_arr){any_str("export")})) && _anyToBool(METHOD(hasAdjective_,this)(this,1,(any_arr){any_str("default")})))  {
            //if moduleNode.exportDefault, .throwError "only one 'export default' per module can be defined"
            if (_anyToBool(PROP(exportDefault_,moduleNode))) {METHOD(throwError_,this)(this,1,(any_arr){any_str("only one 'export default' per module can be defined")});};
            //moduleNode.exportDefault = .specific
            PROP(exportDefault_,moduleNode) = PROP(specific_,this);
        };
      return undefined;
      }
    

//--------------
    // Grammar_Body
    any Grammar_Body; //Class Grammar_Body extends ASTBase
    
    //auto Grammar_Body__init
    void Grammar_Body__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        ASTBase__init(this,argc,arguments);
    };

      //properties
        //statements: Statement array
      ;

      //method parse()
      any Grammar_Body_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_Body));
        //---------

        //if .lexer.interfaceMode
        if (_anyToBool(PROP(interfaceMode_,PROP(lexer_,this))))  {
            //if .parent isnt instance of ClassDeclaration
            if (!(_instanceof(PROP(parent_,this),Grammar_ClassDeclaration)))  {
                //return //"no 'Bodys' expected on interface.md file except for: class, append to and namespace
                return undefined; //"no 'Bodys' expected on interface.md file except for: class, append to and namespace
            };
        };

        //if .lexer.token.type isnt 'NEWLINE'
        if (!__is(PROP(type_,PROP(token_,PROP(lexer_,this))),any_str("NEWLINE")))  {
            //.lexer.sayErr "found #{.lexer.token} but expected NEWLINE and indented body"
            __call(sayErr_,PROP(lexer_,this),1,(any_arr){_concatAny(3,(any_arr){any_str("found "), PROP(token_,PROP(lexer_,this)), any_str(" but expected NEWLINE and indented body")})});
        };

// We use the generic ***ASTBase.reqSeparatedList*** to get a list of **Statement** symbols,
// *semicolon* separated or in freeForm mode: one statement per line, closed when indent changes.

        //.statements = .reqSeparatedList(Statement,";")
        PROP(statements_,this) = METHOD(reqSeparatedList_,this)(this,2,(any_arr){Grammar_Statement, any_str(";")});
      return undefined;
      }



      //method validate
      any Grammar_Body_validate(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_Body));
        //---------

// this method check all the body statements againts a valid-list (arguments)

        //var validArray = arguments.toArray()
        var validArray = _newArray(argc,arguments);

        //for each stm in .statements 
        any _list28=PROP(statements_,this);
        { var stm=undefined;
        for(int stm__inx=0 ; stm__inx<_list28.value.arr->length ; stm__inx++){stm=ITEM(stm__inx,_list28);
          // where stm.specific.constructor not in [EndStatement,CompilerStatement] //always Valid
            if(!(__in(any_class(PROP(specific_,stm).class),2,(any_arr){Grammar_EndStatement, Grammar_CompilerStatement}))){

                //if stm.specific.constructor not in validArray
                if (CALL1(indexOf_,validArray,any_class(PROP(specific_,stm).class)).value.number==-1)  {
                    //stm.sayErr "a [#{stm.specific.constructor.name}] is not valid in the body of a [#{.parent.constructor.name}]"
                    METHOD(sayErr_,stm)(stm,1,(any_arr){_concatAny(5,(any_arr){any_str("a ["), PROP(name_,any_class(PROP(specific_,stm).class)), any_str("] is not valid in the body of a ["), PROP(name_,any_class(PROP(parent_,this).class)), any_str("]")})});
                };
        }}};// end for each in PROP(statements_,this)
        
      return undefined;
      }
    

//--------------
    // Grammar_SingleLineBody
    any Grammar_SingleLineBody; //Class Grammar_SingleLineBody extends Grammar_Body
    
    //auto Grammar_SingleLineBody__init
    void Grammar_SingleLineBody__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        Grammar_Body__init(this,argc,arguments);
    };

      //method parse()
      any Grammar_SingleLineBody_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,Grammar_SingleLineBody));
        //---------

        //.statements = .reqSeparatedList(Statement,";",'NEWLINE')
        PROP(statements_,this) = METHOD(reqSeparatedList_,this)(this,3,(any_arr){Grammar_Statement, any_str(";"), any_str("NEWLINE")});
        //.lexer.returnToken() #return closing NEWLINE
        __call(returnToken_,PROP(lexer_,this),0,NULL);// #return closing NEWLINE
      return undefined;
      }
    

//--------------
    // Grammar_Module
    any Grammar_Module; //Class Grammar_Module extends Grammar_Body
    
    //auto Grammar_Module__init
    void Grammar_Module__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        Grammar_Body__init(this,argc,arguments);
    };

      //properties
        //isMain: boolean
        //exportDefault: ASTBase
      ;


      //method parse()
      any Grammar_Module_parse(DEFAULT_ARGUMENTS){
          assert(_instanceof(this,Grammar_Module));
          //---------

// We start by locking. There is no other construction to try,
// if Module.parse() fails we abort compilation.

          //.lock()
          METHOD(lock_,this)(this,0,NULL);

// Get Module body: Statements, separated by NEWLINE|';' closer:'EOF'

          //.statements = .optFreeFormList(Statement,';','EOF')
          PROP(statements_,this) = METHOD(optFreeFormList_,this)(this,3,(any_arr){Grammar_Statement, any_str(";"), any_str("EOF")});
      return undefined;
      }
    //import ASTBase, logger, UniqueID, Strings
    //shim import Map, PMREX
//### Append to class ASTBase
      //properties 
        //accessors: Accessor array      
        //executes, hasSideEffects
      ;
//##### helper method parseAccessors
      any ASTBase_parseAccessors(DEFAULT_ARGUMENTS){
          assert(_instanceof(this,ASTBase));
          //---------
          //if .lexer.token.value not in '.[(' then return
          if (CALL1(indexOf_,any_str(".[("),PROP(value_,PROP(token_,PROP(lexer_,this)))).value.number==-1) {return undefined;};
          //do
          while(TRUE){
              //var ac:Accessor = .parseDirect(.lexer.token.value, AccessorsDirect)
              var ac = METHOD(parseDirect_,this)(this,2,(any_arr){PROP(value_,PROP(token_,PROP(lexer_,this))), Grammar_AccessorsDirect});
              //if no ac, break
              if (!_anyToBool(ac)) {break;};
              //.addAccessor ac
              METHOD(addAccessor_,this)(this,1,(any_arr){ac});
          };// end loop
          //return
          return undefined;
      return undefined;
      }
//##### helper method insertAccessorAt(position,item)
      any ASTBase_insertAccessorAt(DEFAULT_ARGUMENTS){
            assert(_instanceof(this,ASTBase));
            //---------
            // define named params
            var position, item;
            position=item=undefined;
            switch(argc){
              case 2:item=arguments[1];
              case 1:position=arguments[0];
            }
            //---------
            //if no .accessors, .accessors = []
            if (!_anyToBool(PROP(accessors_,this))) {PROP(accessors_,this) = new(Array,0,NULL);};
            //if type of item is 'string', item = new PropertyAccess(this, item)
            if (__is(_typeof(item),any_str("string"))) {item = new(Grammar_PropertyAccess,2,(any_arr){this, item});};
            //.accessors.splice position,0,item
            __call(splice_,PROP(accessors_,this),3,(any_arr){position, any_number(0), item});
      return undefined;
      }
//##### helper method addAccessor(item)
      any ASTBase_addAccessor(DEFAULT_ARGUMENTS){
            assert(_instanceof(this,ASTBase));
            //---------
            // define named params
            var item= argc? arguments[0] : undefined;
            //---------
            //if no .accessors, .accessors = []
            if (!_anyToBool(PROP(accessors_,this))) {PROP(accessors_,this) = new(Array,0,NULL);};
            //.insertAccessorAt .accessors.length, item
            METHOD(insertAccessorAt_,this)(this,2,(any_arr){any_number(_length(PROP(accessors_,this))), item});
            //.executes = item instance of FunctionAccess
            PROP(executes_,this) = any_number(_instanceof(item,Grammar_FunctionAccess));
            //if .executes, .hasSideEffects = true
            if (_anyToBool(PROP(executes_,this))) {PROP(hasSideEffects_,this) = true;};
      return undefined;
      }
//### append to class ASTBase
      //method reqBody returns ASTBase
      any ASTBase_reqBody(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------
        //if .lexer.token.type is ('NEWLINE')
        if (__is(PROP(type_,PROP(token_,PROP(lexer_,this))),any_str("NEWLINE")))  {
            //return .req(Body)
            return METHOD(req_,this)(this,1,(any_arr){Grammar_Body});
        }
        //else
        
        else {
            //return .req(SingleLineBody)
            return METHOD(req_,this)(this,1,(any_arr){Grammar_SingleLineBody});
        };
      return undefined;
      }
//### Append to class ASTBase
//##### helper method hasAdjective(name) returns boolean
      any ASTBase_hasAdjective(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------
        // define named params
        var name= argc? arguments[0] : undefined;
        //---------
        //var stat:Statement = this.constructor is Statement? this else .getParent(Statement)
        var stat = __is(any_class(this.class),Grammar_Statement) ? this : METHOD(getParent_,this)(this,1,(any_arr){Grammar_Statement});
        //if no stat, .throwError "[#{.constructor.name}].hasAdjective('#{name}'): can't find a parent Statement"
        if (!_anyToBool(stat)) {METHOD(throwError_,this)(this,1,(any_arr){_concatAny(5,(any_arr){any_str("["), PROP(name_,any_class(this.class)), any_str("].hasAdjective('"), name, any_str("'): can't find a parent Statement")})});};
        //return name in stat.adjectives
        return any_number(CALL1(indexOf_,PROP(adjectives_,stat),name).value.number>=0);
      return undefined;
      }


// ##### Helpers

    //export helper function autoCapitalizeCoreClasses(name:string) returns String
    any Grammar_autoCapitalizeCoreClasses(DEFAULT_ARGUMENTS){
      // define named params
      var name= argc? arguments[0] : undefined;
      //---------
      // #auto-capitalize core classes when used as type annotations
      //if name in ['string','array','number','object','function','boolean','map']
      if (__in(name,7,(any_arr){any_str("string"), any_str("array"), any_str("number"), any_str("object"), any_str("function"), any_str("boolean"), any_str("map")}))  {
        //return "#{name.slice(0,1).toUpperCase()}#{name.slice(1)}"
        return _concatAny(2,(any_arr){__call(toUpperCase_,METHOD(slice_,name)(name,2,(any_arr){any_number(0), any_number(1)}),0,NULL), METHOD(slice_,name)(name,1,(any_arr){any_number(1)})});
      };
      //return name
      return name;
    return undefined;
    }


//### append to class ASTBase
      //properties
            //isMap: boolean
      ;

//##### helper method parseType
      any ASTBase_parseType(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------

// parse type declaration:
  // function [(VariableDecl,)]
  // type-IDENTIFIER [array]
  // [array of] type-IDENTIFIER
  // map type-IDENTIFIER to type-IDENTIFIER

        //if .opt('function','Function') #function as type declaration
        if (_anyToBool(METHOD(opt_,this)(this,2,(any_arr){any_str("function"), any_str("Function")})))  {// #function as type declaration
            //if .opt('(')
            if (_anyToBool(METHOD(opt_,this)(this,1,(any_arr){any_str("(")})))  {
                //declare valid .paramsDeclarations
                // declare valid .paramsDeclarations
                //.paramsDeclarations = .optSeparatedList(VariableDecl,',',')')
                PROP(paramsDeclarations_,this) = METHOD(optSeparatedList_,this)(this,3,(any_arr){Grammar_VariableDecl, any_str(","), any_str(")")});
            };
            //.type= new VariableRef(this, 'Function')
            PROP(type_,this) = new(Grammar_VariableRef,2,(any_arr){this, any_str("Function")});
            //return
            return undefined;
        };

// check for 'array', e.g.: `var list : array of String`

        //if .opt('array','Array')
        if (_anyToBool(METHOD(opt_,this)(this,2,(any_arr){any_str("array"), any_str("Array")})))  {
            //.type = 'Array'
            PROP(type_,this) = any_str("Array");
            //if .opt('of')
            if (_anyToBool(METHOD(opt_,this)(this,1,(any_arr){any_str("of")})))  {
                //.itemType = .req(VariableRef) #reference to an existing class
                PROP(itemType_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_VariableRef});// #reference to an existing class
                //auto-capitalize core classes
                //declare .itemType:VariableRef
                // declare .itemType:VariableRef
                //.itemType.name = autoCapitalizeCoreClasses(.itemType.name)
                PROP(name_,PROP(itemType_,this)) = Grammar_autoCapitalizeCoreClasses(undefined,1,(any_arr){PROP(name_,PROP(itemType_,this))});
            };
            //end if
            //return
            return undefined;
        };

// Check for 'map', e.g.: `var list : map string to Statement`

        //.type = .req(VariableRef) #reference to an existing class
        PROP(type_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_VariableRef});// #reference to an existing class
        //auto-capitalize core classes
        //declare .type:VariableRef
        // declare .type:VariableRef
        //.type.name = autoCapitalizeCoreClasses(.type.name)
        PROP(name_,PROP(type_,this)) = Grammar_autoCapitalizeCoreClasses(undefined,1,(any_arr){PROP(name_,PROP(type_,this))});

        //if .type.name is 'Map'
        if (__is(PROP(name_,PROP(type_,this)),any_str("Map")))  {
              //.extraInfo = 'map [type] to [type]' //extra info to show on parse fail
              PROP(extraInfo_,this) = any_str("map [type] to [type]"); //extra info to show on parse fail
              //.keyType = .req(VariableRef) #type for KEYS: reference to an existing class
              PROP(keyType_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_VariableRef});// #type for KEYS: reference to an existing class
              //auto-capitalize core classes
              //declare .keyType:VariableRef
              // declare .keyType:VariableRef
              //.keyType.name = autoCapitalizeCoreClasses(.keyType.name)
              PROP(name_,PROP(keyType_,this)) = Grammar_autoCapitalizeCoreClasses(undefined,1,(any_arr){PROP(name_,PROP(keyType_,this))});
              //.req('to')
              METHOD(req_,this)(this,1,(any_arr){any_str("to")});
              //.itemType = .req(VariableRef) #type for values: reference to an existing class
              PROP(itemType_,this) = METHOD(req_,this)(this,1,(any_arr){Grammar_VariableRef});// #type for values: reference to an existing class
              // #auto-capitalize core classes
              //declare .itemType:VariableRef
              // declare .itemType:VariableRef
              //.itemType.name = autoCapitalizeCoreClasses(.itemType.name)
              PROP(name_,PROP(itemType_,this)) = Grammar_autoCapitalizeCoreClasses(undefined,1,(any_arr){PROP(name_,PROP(itemType_,this))});
        }
        //else
        
        else {
            // #check for 'type array', e.g.: `var list : string array`
            //if .opt('Array','array')
            if (_anyToBool(METHOD(opt_,this)(this,2,(any_arr){any_str("Array"), any_str("array")})))  {
                //.itemType = .type #assign read type as sub-type
                PROP(itemType_,this) = PROP(type_,this);// #assign read type as sub-type
                //.type = 'Array' #real type
                PROP(type_,this) = any_str("Array");// #real type
            };
        };
      return undefined;
      }


//-------------------------
void Grammar__moduleInit(void){
        Grammar_PrintStatement =_newClass("Grammar_PrintStatement", Grammar_PrintStatement__init, sizeof(struct Grammar_PrintStatement_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_PrintStatement, Grammar_PrintStatement_METHODS);
        _declareProps(Grammar_PrintStatement, Grammar_PrintStatement_PROPS, sizeof Grammar_PrintStatement_PROPS);
    
        Grammar_VarDeclList =_newClass("Grammar_VarDeclList", Grammar_VarDeclList__init, sizeof(struct Grammar_VarDeclList_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_VarDeclList, Grammar_VarDeclList_METHODS);
        _declareProps(Grammar_VarDeclList, Grammar_VarDeclList_PROPS, sizeof Grammar_VarDeclList_PROPS);
    
        Grammar_VarStatement =_newClass("Grammar_VarStatement", Grammar_VarStatement__init, sizeof(struct Grammar_VarStatement_s), Grammar_VarDeclList.value.classINFOptr);
        _declareMethods(Grammar_VarStatement, Grammar_VarStatement_METHODS);
        _declareProps(Grammar_VarStatement, Grammar_VarStatement_PROPS, sizeof Grammar_VarStatement_PROPS);
    
        Grammar_VariableDecl =_newClass("Grammar_VariableDecl", Grammar_VariableDecl__init, sizeof(struct Grammar_VariableDecl_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_VariableDecl, Grammar_VariableDecl_METHODS);
        _declareProps(Grammar_VariableDecl, Grammar_VariableDecl_PROPS, sizeof Grammar_VariableDecl_PROPS);
    
        Grammar_PropertiesDeclaration =_newClass("Grammar_PropertiesDeclaration", Grammar_PropertiesDeclaration__init, sizeof(struct Grammar_PropertiesDeclaration_s), Grammar_VarDeclList.value.classINFOptr);
        _declareMethods(Grammar_PropertiesDeclaration, Grammar_PropertiesDeclaration_METHODS);
        _declareProps(Grammar_PropertiesDeclaration, Grammar_PropertiesDeclaration_PROPS, sizeof Grammar_PropertiesDeclaration_PROPS);
    
        Grammar_WithStatement =_newClass("Grammar_WithStatement", Grammar_WithStatement__init, sizeof(struct Grammar_WithStatement_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_WithStatement, Grammar_WithStatement_METHODS);
        _declareProps(Grammar_WithStatement, Grammar_WithStatement_PROPS, sizeof Grammar_WithStatement_PROPS);
    
        Grammar_TryCatch =_newClass("Grammar_TryCatch", Grammar_TryCatch__init, sizeof(struct Grammar_TryCatch_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_TryCatch, Grammar_TryCatch_METHODS);
        _declareProps(Grammar_TryCatch, Grammar_TryCatch_PROPS, sizeof Grammar_TryCatch_PROPS);
    
        Grammar_ExceptionBlock =_newClass("Grammar_ExceptionBlock", Grammar_ExceptionBlock__init, sizeof(struct Grammar_ExceptionBlock_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_ExceptionBlock, Grammar_ExceptionBlock_METHODS);
        _declareProps(Grammar_ExceptionBlock, Grammar_ExceptionBlock_PROPS, sizeof Grammar_ExceptionBlock_PROPS);
    
        Grammar_ThrowStatement =_newClass("Grammar_ThrowStatement", Grammar_ThrowStatement__init, sizeof(struct Grammar_ThrowStatement_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_ThrowStatement, Grammar_ThrowStatement_METHODS);
        _declareProps(Grammar_ThrowStatement, Grammar_ThrowStatement_PROPS, sizeof Grammar_ThrowStatement_PROPS);
    
        Grammar_ReturnStatement =_newClass("Grammar_ReturnStatement", Grammar_ReturnStatement__init, sizeof(struct Grammar_ReturnStatement_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_ReturnStatement, Grammar_ReturnStatement_METHODS);
        _declareProps(Grammar_ReturnStatement, Grammar_ReturnStatement_PROPS, sizeof Grammar_ReturnStatement_PROPS);
    
        Grammar_IfStatement =_newClass("Grammar_IfStatement", Grammar_IfStatement__init, sizeof(struct Grammar_IfStatement_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_IfStatement, Grammar_IfStatement_METHODS);
        _declareProps(Grammar_IfStatement, Grammar_IfStatement_PROPS, sizeof Grammar_IfStatement_PROPS);
    
        Grammar_ElseIfStatement =_newClass("Grammar_ElseIfStatement", Grammar_ElseIfStatement__init, sizeof(struct Grammar_ElseIfStatement_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_ElseIfStatement, Grammar_ElseIfStatement_METHODS);
        _declareProps(Grammar_ElseIfStatement, Grammar_ElseIfStatement_PROPS, sizeof Grammar_ElseIfStatement_PROPS);
    
        Grammar_ElseStatement =_newClass("Grammar_ElseStatement", Grammar_ElseStatement__init, sizeof(struct Grammar_ElseStatement_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_ElseStatement, Grammar_ElseStatement_METHODS);
        _declareProps(Grammar_ElseStatement, Grammar_ElseStatement_PROPS, sizeof Grammar_ElseStatement_PROPS);
    
        Grammar_DoLoop =_newClass("Grammar_DoLoop", Grammar_DoLoop__init, sizeof(struct Grammar_DoLoop_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_DoLoop, Grammar_DoLoop_METHODS);
        _declareProps(Grammar_DoLoop, Grammar_DoLoop_PROPS, sizeof Grammar_DoLoop_PROPS);
    
        Grammar_WhileUntilLoop =_newClass("Grammar_WhileUntilLoop", Grammar_WhileUntilLoop__init, sizeof(struct Grammar_WhileUntilLoop_s), Grammar_DoLoop.value.classINFOptr);
        _declareMethods(Grammar_WhileUntilLoop, Grammar_WhileUntilLoop_METHODS);
        _declareProps(Grammar_WhileUntilLoop, Grammar_WhileUntilLoop_PROPS, sizeof Grammar_WhileUntilLoop_PROPS);
    
        Grammar_WhileUntilExpression =_newClass("Grammar_WhileUntilExpression", Grammar_WhileUntilExpression__init, sizeof(struct Grammar_WhileUntilExpression_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_WhileUntilExpression, Grammar_WhileUntilExpression_METHODS);
        _declareProps(Grammar_WhileUntilExpression, Grammar_WhileUntilExpression_PROPS, sizeof Grammar_WhileUntilExpression_PROPS);
    
        Grammar_LoopControlStatement =_newClass("Grammar_LoopControlStatement", Grammar_LoopControlStatement__init, sizeof(struct Grammar_LoopControlStatement_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_LoopControlStatement, Grammar_LoopControlStatement_METHODS);
        _declareProps(Grammar_LoopControlStatement, Grammar_LoopControlStatement_PROPS, sizeof Grammar_LoopControlStatement_PROPS);
    
        Grammar_DoNothingStatement =_newClass("Grammar_DoNothingStatement", Grammar_DoNothingStatement__init, sizeof(struct Grammar_DoNothingStatement_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_DoNothingStatement, Grammar_DoNothingStatement_METHODS);
        _declareProps(Grammar_DoNothingStatement, Grammar_DoNothingStatement_PROPS, sizeof Grammar_DoNothingStatement_PROPS);
    
        Grammar_ForStatement =_newClass("Grammar_ForStatement", Grammar_ForStatement__init, sizeof(struct Grammar_ForStatement_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_ForStatement, Grammar_ForStatement_METHODS);
        _declareProps(Grammar_ForStatement, Grammar_ForStatement_PROPS, sizeof Grammar_ForStatement_PROPS);
    
        Grammar_ForEachProperty =_newClass("Grammar_ForEachProperty", Grammar_ForEachProperty__init, sizeof(struct Grammar_ForEachProperty_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_ForEachProperty, Grammar_ForEachProperty_METHODS);
        _declareProps(Grammar_ForEachProperty, Grammar_ForEachProperty_PROPS, sizeof Grammar_ForEachProperty_PROPS);
    
        Grammar_ForEachInArray =_newClass("Grammar_ForEachInArray", Grammar_ForEachInArray__init, sizeof(struct Grammar_ForEachInArray_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_ForEachInArray, Grammar_ForEachInArray_METHODS);
        _declareProps(Grammar_ForEachInArray, Grammar_ForEachInArray_PROPS, sizeof Grammar_ForEachInArray_PROPS);
    
        Grammar_ForIndexNumeric =_newClass("Grammar_ForIndexNumeric", Grammar_ForIndexNumeric__init, sizeof(struct Grammar_ForIndexNumeric_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_ForIndexNumeric, Grammar_ForIndexNumeric_METHODS);
        _declareProps(Grammar_ForIndexNumeric, Grammar_ForIndexNumeric_PROPS, sizeof Grammar_ForIndexNumeric_PROPS);
    
        Grammar_ForWhereFilter =_newClass("Grammar_ForWhereFilter", Grammar_ForWhereFilter__init, sizeof(struct Grammar_ForWhereFilter_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_ForWhereFilter, Grammar_ForWhereFilter_METHODS);
        _declareProps(Grammar_ForWhereFilter, Grammar_ForWhereFilter_PROPS, sizeof Grammar_ForWhereFilter_PROPS);
    
        Grammar_DeleteStatement =_newClass("Grammar_DeleteStatement", Grammar_DeleteStatement__init, sizeof(struct Grammar_DeleteStatement_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_DeleteStatement, Grammar_DeleteStatement_METHODS);
        _declareProps(Grammar_DeleteStatement, Grammar_DeleteStatement_PROPS, sizeof Grammar_DeleteStatement_PROPS);
    
        Grammar_AssignmentStatement =_newClass("Grammar_AssignmentStatement", Grammar_AssignmentStatement__init, sizeof(struct Grammar_AssignmentStatement_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_AssignmentStatement, Grammar_AssignmentStatement_METHODS);
        _declareProps(Grammar_AssignmentStatement, Grammar_AssignmentStatement_PROPS, sizeof Grammar_AssignmentStatement_PROPS);
    
        Grammar_VariableRef =_newClass("Grammar_VariableRef", Grammar_VariableRef__init, sizeof(struct Grammar_VariableRef_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_VariableRef, Grammar_VariableRef_METHODS);
        _declareProps(Grammar_VariableRef, Grammar_VariableRef_PROPS, sizeof Grammar_VariableRef_PROPS);
    
        Grammar_Accessor =_newClass("Grammar_Accessor", Grammar_Accessor__init, sizeof(struct Grammar_Accessor_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_Accessor, Grammar_Accessor_METHODS);
        _declareProps(Grammar_Accessor, Grammar_Accessor_PROPS, sizeof Grammar_Accessor_PROPS);
    
        Grammar_PropertyAccess =_newClass("Grammar_PropertyAccess", Grammar_PropertyAccess__init, sizeof(struct Grammar_PropertyAccess_s), Grammar_Accessor.value.classINFOptr);
        _declareMethods(Grammar_PropertyAccess, Grammar_PropertyAccess_METHODS);
        _declareProps(Grammar_PropertyAccess, Grammar_PropertyAccess_PROPS, sizeof Grammar_PropertyAccess_PROPS);
    
        Grammar_IndexAccess =_newClass("Grammar_IndexAccess", Grammar_IndexAccess__init, sizeof(struct Grammar_IndexAccess_s), Grammar_Accessor.value.classINFOptr);
        _declareMethods(Grammar_IndexAccess, Grammar_IndexAccess_METHODS);
        _declareProps(Grammar_IndexAccess, Grammar_IndexAccess_PROPS, sizeof Grammar_IndexAccess_PROPS);
    
        Grammar_FunctionArgument =_newClass("Grammar_FunctionArgument", Grammar_FunctionArgument__init, sizeof(struct Grammar_FunctionArgument_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_FunctionArgument, Grammar_FunctionArgument_METHODS);
        _declareProps(Grammar_FunctionArgument, Grammar_FunctionArgument_PROPS, sizeof Grammar_FunctionArgument_PROPS);
    
        Grammar_FunctionAccess =_newClass("Grammar_FunctionAccess", Grammar_FunctionAccess__init, sizeof(struct Grammar_FunctionAccess_s), Grammar_Accessor.value.classINFOptr);
        _declareMethods(Grammar_FunctionAccess, Grammar_FunctionAccess_METHODS);
        _declareProps(Grammar_FunctionAccess, Grammar_FunctionAccess_PROPS, sizeof Grammar_FunctionAccess_PROPS);
    
        Grammar_Operand =_newClass("Grammar_Operand", Grammar_Operand__init, sizeof(struct Grammar_Operand_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_Operand, Grammar_Operand_METHODS);
        _declareProps(Grammar_Operand, Grammar_Operand_PROPS, sizeof Grammar_Operand_PROPS);
    
        Grammar_Oper =_newClass("Grammar_Oper", Grammar_Oper__init, sizeof(struct Grammar_Oper_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_Oper, Grammar_Oper_METHODS);
        _declareProps(Grammar_Oper, Grammar_Oper_PROPS, sizeof Grammar_Oper_PROPS);
    
        Grammar_UnaryOper =_newClass("Grammar_UnaryOper", Grammar_UnaryOper__init, sizeof(struct Grammar_UnaryOper_s), Grammar_Oper.value.classINFOptr);
        _declareMethods(Grammar_UnaryOper, Grammar_UnaryOper_METHODS);
        _declareProps(Grammar_UnaryOper, Grammar_UnaryOper_PROPS, sizeof Grammar_UnaryOper_PROPS);
    
        Grammar_Expression =_newClass("Grammar_Expression", Grammar_Expression__init, sizeof(struct Grammar_Expression_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_Expression, Grammar_Expression_METHODS);
        _declareProps(Grammar_Expression, Grammar_Expression_PROPS, sizeof Grammar_Expression_PROPS);
    
        Grammar_Literal =_newClass("Grammar_Literal", Grammar_Literal__init, sizeof(struct Grammar_Literal_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_Literal, Grammar_Literal_METHODS);
        _declareProps(Grammar_Literal, Grammar_Literal_PROPS, sizeof Grammar_Literal_PROPS);
    
        Grammar_NumberLiteral =_newClass("Grammar_NumberLiteral", Grammar_NumberLiteral__init, sizeof(struct Grammar_NumberLiteral_s), Grammar_Literal.value.classINFOptr);
        _declareMethods(Grammar_NumberLiteral, Grammar_NumberLiteral_METHODS);
        _declareProps(Grammar_NumberLiteral, Grammar_NumberLiteral_PROPS, sizeof Grammar_NumberLiteral_PROPS);
    
        Grammar_StringLiteral =_newClass("Grammar_StringLiteral", Grammar_StringLiteral__init, sizeof(struct Grammar_StringLiteral_s), Grammar_Literal.value.classINFOptr);
        _declareMethods(Grammar_StringLiteral, Grammar_StringLiteral_METHODS);
        _declareProps(Grammar_StringLiteral, Grammar_StringLiteral_PROPS, sizeof Grammar_StringLiteral_PROPS);
    
        Grammar_RegExpLiteral =_newClass("Grammar_RegExpLiteral", Grammar_RegExpLiteral__init, sizeof(struct Grammar_RegExpLiteral_s), Grammar_Literal.value.classINFOptr);
        _declareMethods(Grammar_RegExpLiteral, Grammar_RegExpLiteral_METHODS);
        _declareProps(Grammar_RegExpLiteral, Grammar_RegExpLiteral_PROPS, sizeof Grammar_RegExpLiteral_PROPS);
    
        Grammar_ArrayLiteral =_newClass("Grammar_ArrayLiteral", Grammar_ArrayLiteral__init, sizeof(struct Grammar_ArrayLiteral_s), Grammar_Literal.value.classINFOptr);
        _declareMethods(Grammar_ArrayLiteral, Grammar_ArrayLiteral_METHODS);
        _declareProps(Grammar_ArrayLiteral, Grammar_ArrayLiteral_PROPS, sizeof Grammar_ArrayLiteral_PROPS);
    
        Grammar_ObjectLiteral =_newClass("Grammar_ObjectLiteral", Grammar_ObjectLiteral__init, sizeof(struct Grammar_ObjectLiteral_s), Grammar_Literal.value.classINFOptr);
        _declareMethods(Grammar_ObjectLiteral, Grammar_ObjectLiteral_METHODS);
        _declareProps(Grammar_ObjectLiteral, Grammar_ObjectLiteral_PROPS, sizeof Grammar_ObjectLiteral_PROPS);
    
        Grammar_NameValuePair =_newClass("Grammar_NameValuePair", Grammar_NameValuePair__init, sizeof(struct Grammar_NameValuePair_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_NameValuePair, Grammar_NameValuePair_METHODS);
        _declareProps(Grammar_NameValuePair, Grammar_NameValuePair_PROPS, sizeof Grammar_NameValuePair_PROPS);
    
        Grammar_FreeObjectLiteral =_newClass("Grammar_FreeObjectLiteral", Grammar_FreeObjectLiteral__init, sizeof(struct Grammar_FreeObjectLiteral_s), Grammar_ObjectLiteral.value.classINFOptr);
        _declareMethods(Grammar_FreeObjectLiteral, Grammar_FreeObjectLiteral_METHODS);
        _declareProps(Grammar_FreeObjectLiteral, Grammar_FreeObjectLiteral_PROPS, sizeof Grammar_FreeObjectLiteral_PROPS);
    
        Grammar_ParenExpression =_newClass("Grammar_ParenExpression", Grammar_ParenExpression__init, sizeof(struct Grammar_ParenExpression_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_ParenExpression, Grammar_ParenExpression_METHODS);
        _declareProps(Grammar_ParenExpression, Grammar_ParenExpression_PROPS, sizeof Grammar_ParenExpression_PROPS);
    
        Grammar_FunctionDeclaration =_newClass("Grammar_FunctionDeclaration", Grammar_FunctionDeclaration__init, sizeof(struct Grammar_FunctionDeclaration_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_FunctionDeclaration, Grammar_FunctionDeclaration_METHODS);
        _declareProps(Grammar_FunctionDeclaration, Grammar_FunctionDeclaration_PROPS, sizeof Grammar_FunctionDeclaration_PROPS);
    
        Grammar_DefinePropertyItem =_newClass("Grammar_DefinePropertyItem", Grammar_DefinePropertyItem__init, sizeof(struct Grammar_DefinePropertyItem_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_DefinePropertyItem, Grammar_DefinePropertyItem_METHODS);
        _declareProps(Grammar_DefinePropertyItem, Grammar_DefinePropertyItem_PROPS, sizeof Grammar_DefinePropertyItem_PROPS);
    
        Grammar_MethodDeclaration =_newClass("Grammar_MethodDeclaration", Grammar_MethodDeclaration__init, sizeof(struct Grammar_MethodDeclaration_s), Grammar_FunctionDeclaration.value.classINFOptr);
        _declareMethods(Grammar_MethodDeclaration, Grammar_MethodDeclaration_METHODS);
        _declareProps(Grammar_MethodDeclaration, Grammar_MethodDeclaration_PROPS, sizeof Grammar_MethodDeclaration_PROPS);
    
        Grammar_ClassDeclaration =_newClass("Grammar_ClassDeclaration", Grammar_ClassDeclaration__init, sizeof(struct Grammar_ClassDeclaration_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_ClassDeclaration, Grammar_ClassDeclaration_METHODS);
        _declareProps(Grammar_ClassDeclaration, Grammar_ClassDeclaration_PROPS, sizeof Grammar_ClassDeclaration_PROPS);
    
        Grammar_ConstructorDeclaration =_newClass("Grammar_ConstructorDeclaration", Grammar_ConstructorDeclaration__init, sizeof(struct Grammar_ConstructorDeclaration_s), Grammar_MethodDeclaration.value.classINFOptr);
        _declareMethods(Grammar_ConstructorDeclaration, Grammar_ConstructorDeclaration_METHODS);
        _declareProps(Grammar_ConstructorDeclaration, Grammar_ConstructorDeclaration_PROPS, sizeof Grammar_ConstructorDeclaration_PROPS);
    
        Grammar_AppendToDeclaration =_newClass("Grammar_AppendToDeclaration", Grammar_AppendToDeclaration__init, sizeof(struct Grammar_AppendToDeclaration_s), Grammar_ClassDeclaration.value.classINFOptr);
        _declareMethods(Grammar_AppendToDeclaration, Grammar_AppendToDeclaration_METHODS);
        _declareProps(Grammar_AppendToDeclaration, Grammar_AppendToDeclaration_PROPS, sizeof Grammar_AppendToDeclaration_PROPS);
    
        Grammar_NamespaceDeclaration =_newClass("Grammar_NamespaceDeclaration", Grammar_NamespaceDeclaration__init, sizeof(struct Grammar_NamespaceDeclaration_s), Grammar_ClassDeclaration.value.classINFOptr);
        _declareMethods(Grammar_NamespaceDeclaration, Grammar_NamespaceDeclaration_METHODS);
        _declareProps(Grammar_NamespaceDeclaration, Grammar_NamespaceDeclaration_PROPS, sizeof Grammar_NamespaceDeclaration_PROPS);
    
        Grammar_DebuggerStatement =_newClass("Grammar_DebuggerStatement", Grammar_DebuggerStatement__init, sizeof(struct Grammar_DebuggerStatement_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_DebuggerStatement, Grammar_DebuggerStatement_METHODS);
        _declareProps(Grammar_DebuggerStatement, Grammar_DebuggerStatement_PROPS, sizeof Grammar_DebuggerStatement_PROPS);
    
        Grammar_CompilerStatement =_newClass("Grammar_CompilerStatement", Grammar_CompilerStatement__init, sizeof(struct Grammar_CompilerStatement_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_CompilerStatement, Grammar_CompilerStatement_METHODS);
        _declareProps(Grammar_CompilerStatement, Grammar_CompilerStatement_PROPS, sizeof Grammar_CompilerStatement_PROPS);
    
        Grammar_ImportStatement =_newClass("Grammar_ImportStatement", Grammar_ImportStatement__init, sizeof(struct Grammar_ImportStatement_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_ImportStatement, Grammar_ImportStatement_METHODS);
        _declareProps(Grammar_ImportStatement, Grammar_ImportStatement_PROPS, sizeof Grammar_ImportStatement_PROPS);
    
        Grammar_ImportStatementItem =_newClass("Grammar_ImportStatementItem", Grammar_ImportStatementItem__init, sizeof(struct Grammar_ImportStatementItem_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_ImportStatementItem, Grammar_ImportStatementItem_METHODS);
        _declareProps(Grammar_ImportStatementItem, Grammar_ImportStatementItem_PROPS, sizeof Grammar_ImportStatementItem_PROPS);
    
        Grammar_DeclareStatement =_newClass("Grammar_DeclareStatement", Grammar_DeclareStatement__init, sizeof(struct Grammar_DeclareStatement_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_DeclareStatement, Grammar_DeclareStatement_METHODS);
        _declareProps(Grammar_DeclareStatement, Grammar_DeclareStatement_PROPS, sizeof Grammar_DeclareStatement_PROPS);
    
        Grammar_DefaultAssignment =_newClass("Grammar_DefaultAssignment", Grammar_DefaultAssignment__init, sizeof(struct Grammar_DefaultAssignment_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_DefaultAssignment, Grammar_DefaultAssignment_METHODS);
        _declareProps(Grammar_DefaultAssignment, Grammar_DefaultAssignment_PROPS, sizeof Grammar_DefaultAssignment_PROPS);
    
        Grammar_EndStatement =_newClass("Grammar_EndStatement", Grammar_EndStatement__init, sizeof(struct Grammar_EndStatement_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_EndStatement, Grammar_EndStatement_METHODS);
        _declareProps(Grammar_EndStatement, Grammar_EndStatement_PROPS, sizeof Grammar_EndStatement_PROPS);
    
        Grammar_YieldExpression =_newClass("Grammar_YieldExpression", Grammar_YieldExpression__init, sizeof(struct Grammar_YieldExpression_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_YieldExpression, Grammar_YieldExpression_METHODS);
        _declareProps(Grammar_YieldExpression, Grammar_YieldExpression_PROPS, sizeof Grammar_YieldExpression_PROPS);
    
        Grammar_FunctionCall =_newClass("Grammar_FunctionCall", Grammar_FunctionCall__init, sizeof(struct Grammar_FunctionCall_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_FunctionCall, Grammar_FunctionCall_METHODS);
        _declareProps(Grammar_FunctionCall, Grammar_FunctionCall_PROPS, sizeof Grammar_FunctionCall_PROPS);
    
        Grammar_SwitchStatement =_newClass("Grammar_SwitchStatement", Grammar_SwitchStatement__init, sizeof(struct Grammar_SwitchStatement_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_SwitchStatement, Grammar_SwitchStatement_METHODS);
        _declareProps(Grammar_SwitchStatement, Grammar_SwitchStatement_PROPS, sizeof Grammar_SwitchStatement_PROPS);
    
        Grammar_SwitchCase =_newClass("Grammar_SwitchCase", Grammar_SwitchCase__init, sizeof(struct Grammar_SwitchCase_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_SwitchCase, Grammar_SwitchCase_METHODS);
        _declareProps(Grammar_SwitchCase, Grammar_SwitchCase_PROPS, sizeof Grammar_SwitchCase_PROPS);
    
        Grammar_CaseWhenExpression =_newClass("Grammar_CaseWhenExpression", Grammar_CaseWhenExpression__init, sizeof(struct Grammar_CaseWhenExpression_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_CaseWhenExpression, Grammar_CaseWhenExpression_METHODS);
        _declareProps(Grammar_CaseWhenExpression, Grammar_CaseWhenExpression_PROPS, sizeof Grammar_CaseWhenExpression_PROPS);
    
        Grammar_CaseWhenSection =_newClass("Grammar_CaseWhenSection", Grammar_CaseWhenSection__init, sizeof(struct Grammar_CaseWhenSection_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_CaseWhenSection, Grammar_CaseWhenSection_METHODS);
        _declareProps(Grammar_CaseWhenSection, Grammar_CaseWhenSection_PROPS, sizeof Grammar_CaseWhenSection_PROPS);
    
        Grammar_Statement =_newClass("Grammar_Statement", Grammar_Statement__init, sizeof(struct Grammar_Statement_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_Statement, Grammar_Statement_METHODS);
        _declareProps(Grammar_Statement, Grammar_Statement_PROPS, sizeof Grammar_Statement_PROPS);
    
        Grammar_Body =_newClass("Grammar_Body", Grammar_Body__init, sizeof(struct Grammar_Body_s), ASTBase.value.classINFOptr);
        _declareMethods(Grammar_Body, Grammar_Body_METHODS);
        _declareProps(Grammar_Body, Grammar_Body_PROPS, sizeof Grammar_Body_PROPS);
    
        Grammar_SingleLineBody =_newClass("Grammar_SingleLineBody", Grammar_SingleLineBody__init, sizeof(struct Grammar_SingleLineBody_s), Grammar_Body.value.classINFOptr);
        _declareMethods(Grammar_SingleLineBody, Grammar_SingleLineBody_METHODS);
        _declareProps(Grammar_SingleLineBody, Grammar_SingleLineBody_PROPS, sizeof Grammar_SingleLineBody_PROPS);
    
        Grammar_Module =_newClass("Grammar_Module", Grammar_Module__init, sizeof(struct Grammar_Module_s), Grammar_Body.value.classINFOptr);
        _declareMethods(Grammar_Module, Grammar_Module_METHODS);
        _declareProps(Grammar_Module, Grammar_Module_PROPS, sizeof Grammar_Module_PROPS);
    
    Grammar_RESERVED_WORDS = new(Array,73,(any_arr){any_str("namespace"), any_str("function"), any_str("async"), any_str("class"), any_str("method"), any_str("if"), any_str("then"), any_str("else"), any_str("switch"), any_str("when"), any_str("case"), any_str("end"), any_str("null"), any_str("true"), any_str("false"), any_str("undefined"), any_str("and"), any_str("or"), any_str("but"), any_str("no"), any_str("not"), any_str("has"), any_str("hasnt"), any_str("property"), any_str("properties"), any_str("new"), any_str("is"), any_str("isnt"), any_str("prototype"), any_str("do"), any_str("loop"), any_str("while"), any_str("until"), any_str("for"), any_str("to"), any_str("break"), any_str("continue"), any_str("return"), any_str("try"), any_str("catch"), any_str("throw"), any_str("raise"), any_str("fail"), any_str("exception"), any_str("finally"), any_str("with"), any_str("arguments"), any_str("in"), any_str("instanceof"), any_str("typeof"), any_str("var"), any_str("let"), any_str("default"), any_str("delete"), any_str("interface"), any_str("implements"), any_str("yield"), any_str("like"), any_str("this"), any_str("super"), any_str("export"), any_str("compiler"), any_str("compile"), any_str("debugger"), any_str("char"), any_str("short"), any_str("long"), any_str("int"), any_str("unsigned"), any_str("void"), any_str("NULL"), any_str("bool"), any_str("assert")});
    Grammar_operatorsPrecedence = new(Array,36,(any_arr){any_str("++"), any_str("--"), any_str("unary -"), any_str("unary +"), any_str("~"), any_str("&"), any_str("^"), any_str("|"), any_str(">>"), any_str("<<"), any_str("new"), any_str("type of"), any_str("instance of"), any_str("has property"), any_str("*"), any_str("/"), any_str("%"), any_str("+"), any_str("-"), any_str("into"), any_str("in"), any_str(">"), any_str("<"), any_str(">="), any_str("<="), any_str("is"), any_str("<>"), any_str("!=="), any_str("like"), any_str("no"), any_str("not"), any_str("and"), any_str("but"), any_str("or"), any_str("?"), any_str(":")});
    Grammar_OPERAND_DIRECT_TYPE = new(Map,4,(any_arr){
          _newPair("STRING",Grammar_StringLiteral), 
          _newPair("NUMBER",Grammar_NumberLiteral), 
          _newPair("REGEX",Grammar_RegExpLiteral), 
          _newPair("SPACE_BRACKET",Grammar_ArrayLiteral)
          })
;
    Grammar_OPERAND_DIRECT_TOKEN = new(Map,7,(any_arr){
          _newPair("(",Grammar_ParenExpression), 
          _newPair("[",Grammar_ArrayLiteral), 
          _newPair("{",Grammar_ObjectLiteral), 
          _newPair("function",Grammar_FunctionDeclaration), 
          _newPair("->",Grammar_FunctionDeclaration), 
          _newPair("case",Grammar_CaseWhenExpression), 
          _newPair("yield",Grammar_YieldExpression)
          })
;
    Grammar_unaryOperators = new(Array,8,(any_arr){any_str("new"), any_str("-"), any_str("no"), any_str("not"), any_str("type"), any_str("typeof"), any_str("~"), any_str("+")});
    Grammar_StatementsDirect = new(Map,38,(any_arr){
      _newPair("class",Grammar_ClassDeclaration), 
      _newPair("Class",Grammar_ClassDeclaration), 
      _newPair("append",Grammar_AppendToDeclaration), 
      _newPair("Append",Grammar_AppendToDeclaration), 
      _newPair("function",Grammar_FunctionDeclaration), 
      _newPair("constructor",Grammar_ConstructorDeclaration), 
      _newPair("properties",Grammar_PropertiesDeclaration), 
      _newPair("namespace",Grammar_NamespaceDeclaration), 
      _newPair("method",Grammar_MethodDeclaration), 
      _newPair("var",Grammar_VarStatement), 
      _newPair("let",Grammar_VarStatement), 
      _newPair("default",Grammar_DefaultAssignment), 
      _newPair("if",Grammar_IfStatement), 
      _newPair("when",Grammar_IfStatement), 
      _newPair("for",Grammar_ForStatement), 
      _newPair("while",Grammar_WhileUntilLoop), 
      _newPair("until",Grammar_WhileUntilLoop), 
      _newPair("do",new(Array,2,(any_arr){Grammar_DoNothingStatement, Grammar_DoLoop})), 
      _newPair("break",Grammar_LoopControlStatement), 
      _newPair("switch",Grammar_SwitchStatement), 
      _newPair("continue",Grammar_LoopControlStatement), 
      _newPair("end",Grammar_EndStatement), 
      _newPair("return",Grammar_ReturnStatement), 
      _newPair("with",Grammar_WithStatement), 
      _newPair("print",Grammar_PrintStatement), 
      _newPair("throw",Grammar_ThrowStatement), 
      _newPair("raise",Grammar_ThrowStatement), 
      _newPair("fail",Grammar_ThrowStatement), 
      _newPair("try",Grammar_TryCatch), 
      _newPair("exception",Grammar_ExceptionBlock), 
      _newPair("Exception",Grammar_ExceptionBlock), 
      _newPair("debugger",Grammar_DebuggerStatement), 
      _newPair("declare",Grammar_DeclareStatement), 
      _newPair("import",Grammar_ImportStatement), 
      _newPair("delete",Grammar_DeleteStatement), 
      _newPair("compile",Grammar_CompilerStatement), 
      _newPair("compiler",Grammar_CompilerStatement), 
      _newPair("yield",Grammar_YieldExpression)
      })
;
    Grammar_AccessorsDirect = new(Map,3,(any_arr){
        _newPair(".",Grammar_PropertyAccess), 
        _newPair("[",Grammar_IndexAccess), 
        _newPair("(",Grammar_FunctionAccess)
        })
;
    //end Operand
    
};