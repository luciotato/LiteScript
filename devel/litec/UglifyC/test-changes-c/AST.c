#include "AST.h"
//-------------------------
//Module AST
//-------------------------
//-------------------------
//NAMESPACE AST
//-------------------------
    //-----------------------
    // Class AST_Token: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_Token_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_Token_PROPS[] = {
    file_
    , comments_before_
    , nlb_
    , endpos_
    , pos_
    , col_
    , line_
    , value_
    , type_
    };
    
    //-----------------------
    // Class AST_Node: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_Node_METHODS = {
      { clone_, AST_Node_clone },
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_Node_PROPS[] = {
    endpos_
    , start_
    };
    
    //-----------------------
    // Class AST_Statement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_Statement_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_Statement_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_Debugger: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_Debugger_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_Debugger_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_Directive: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_Directive_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_Directive_PROPS[] = {
    scope_
    , value_
    };
    
    //-----------------------
    // Class AST_SimpleStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_SimpleStatement_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_SimpleStatement_PROPS[] = {
    body_
    };
    
    //-----------------------
    // Class AST_Block: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_Block_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_Block_PROPS[] = {
    body_
    };
    
    //-----------------------
    // Class AST_BlockStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_BlockStatement_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_BlockStatement_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_EmptyStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_EmptyStatement_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_EmptyStatement_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_StatementWithBody: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_StatementWithBody_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_StatementWithBody_PROPS[] = {
    body_
    };
    
    //-----------------------
    // Class AST_LabeledStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_LabeledStatement_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_LabeledStatement_PROPS[] = {
    label_
    };
    
    //-----------------------
    // Class AST_IterationStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_IterationStatement_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_IterationStatement_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_DWLoop: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_DWLoop_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_DWLoop_PROPS[] = {
    condition_
    };
    
    //-----------------------
    // Class AST_DoStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_DoStatement_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_DoStatement_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_WhileStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_WhileStatement_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_WhileStatement_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_ForStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_ForStatement_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_ForStatement_PROPS[] = {
    step_
    , condition_
    , init_
    };
    
    //-----------------------
    // Class AST_ForIn: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_ForIn_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_ForIn_PROPS[] = {
    object_
    , name_
    , init_
    };
    
    //-----------------------
    // Class AST_WithStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_WithStatement_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_WithStatement_PROPS[] = {
    expression_
    };
    
    //-----------------------
    // Class AST_Scope: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_Scope_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_Scope_PROPS[] = {
    cname_
    , enclosed_
    , parent_scope_
    , uses_eval_
    , uses_with_
    , functions_
    , variables_
    , directives_
    };
    
    //-----------------------
    // Class AST_Toplevel: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_Toplevel_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_Toplevel_PROPS[] = {
    globals_
    };
    
    //-----------------------
    // Class AST_Lambda: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_Lambda_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_Lambda_PROPS[] = {
    uses_arguments_
    , argnames_
    , name_
    };
    
    //-----------------------
    // Class AST_Accessor: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_Accessor_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_Accessor_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_FunctionExpression: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_FunctionExpression_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_FunctionExpression_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_Defun: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_Defun_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_Defun_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_Jump: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_Jump_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_Jump_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_ExitStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_ExitStatement_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_ExitStatement_PROPS[] = {
    value_
    };
    
    //-----------------------
    // Class AST_ReturnStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_ReturnStatement_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_ReturnStatement_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_ThrowStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_ThrowStatement_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_ThrowStatement_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_LoopControl: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_LoopControl_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_LoopControl_PROPS[] = {
    label_
    };
    
    //-----------------------
    // Class AST_BreakStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_BreakStatement_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_BreakStatement_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_ContinueStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_ContinueStatement_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_ContinueStatement_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_IfStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_IfStatement_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_IfStatement_PROPS[] = {
    alternative_
    , condition_
    };
    
    //-----------------------
    // Class AST_Switch: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_Switch_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_Switch_PROPS[] = {
    expression_
    };
    
    //-----------------------
    // Class AST_SwitchBranch: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_SwitchBranch_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_SwitchBranch_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_Default: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_Default_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_Default_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_Case: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_Case_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_Case_PROPS[] = {
    expression_
    };
    
    //-----------------------
    // Class AST_Try: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_Try_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_Try_PROPS[] = {
    bfinally_
    , bcatch_
    };
    
    //-----------------------
    // Class AST_Catch: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_Catch_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_Catch_PROPS[] = {
    argname_
    };
    
    //-----------------------
    // Class AST_Finally: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_Finally_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_Finally_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_Definitions: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_Definitions_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_Definitions_PROPS[] = {
    definitions_
    };
    
    //-----------------------
    // Class AST_Var: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_Var_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_Var_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_Const: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_Const_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_Const_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_VarDef: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_VarDef_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_VarDef_PROPS[] = {
    value_
    , name_
    };
    
    //-----------------------
    // Class AST_CallStatement: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_CallStatement_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_CallStatement_PROPS[] = {
    args_
    , expression_
    };
    
    //-----------------------
    // Class AST_New: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_New_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_New_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_Seq: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_Seq_METHODS = {
      { to_array_, AST_Seq_to_array },
      { add_, AST_Seq_add },
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_Seq_PROPS[] = {
    cdr_
    , car_
    };
    
    //-----------------------
    // Class AST_PropAccess: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_PropAccess_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_PropAccess_PROPS[] = {
    prop_
    , expression_
    };
    
    //-----------------------
    // Class AST_Dot: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_Dot_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_Dot_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_Sub: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_Sub_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_Sub_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_Unary: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_Unary_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_Unary_PROPS[] = {
    expression_
    , operator_
    };
    
    //-----------------------
    // Class AST_UnaryPrefix: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_UnaryPrefix_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_UnaryPrefix_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_UnaryPostfix: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_UnaryPostfix_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_UnaryPostfix_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_Binary: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_Binary_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_Binary_PROPS[] = {
    right_
    , operator_
    , left_
    };
    
    //-----------------------
    // Class AST_Conditional: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_Conditional_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_Conditional_PROPS[] = {
    alternative_
    , consequent_
    , condition_
    };
    
    //-----------------------
    // Class AST_Assign: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_Assign_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_Assign_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_ArrayLiteral: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_ArrayLiteral_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_ArrayLiteral_PROPS[] = {
    elements_
    };
    
    //-----------------------
    // Class AST_ObjectLiteral: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_ObjectLiteral_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_ObjectLiteral_PROPS[] = {
    props_
    };
    
    //-----------------------
    // Class AST_ObjectProperty: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_ObjectProperty_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_ObjectProperty_PROPS[] = {
    value_
    , key_
    };
    
    //-----------------------
    // Class AST_ObjectKeyVal: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_ObjectKeyVal_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_ObjectKeyVal_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_ObjectSetter: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_ObjectSetter_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_ObjectSetter_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_ObjectGetter: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_ObjectGetter_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_ObjectGetter_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_Symbol: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_Symbol_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_Symbol_PROPS[] = {
    thedef_
    , name_
    , scope_
    };
    
    //-----------------------
    // Class AST_SymbolAccessor: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_SymbolAccessor_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_SymbolAccessor_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_SymbolDeclaration: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_SymbolDeclaration_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_SymbolDeclaration_PROPS[] = {
    init_
    };
    
    //-----------------------
    // Class AST_SymbolVar: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_SymbolVar_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_SymbolVar_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_SymbolConst: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_SymbolConst_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_SymbolConst_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_SymbolFunarg: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_SymbolFunarg_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_SymbolFunarg_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_SymbolDefun: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_SymbolDefun_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_SymbolDefun_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_SymbolLambda: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_SymbolLambda_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_SymbolLambda_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_SymbolCatch: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_SymbolCatch_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_SymbolCatch_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_Label: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_Label_METHODS = {
      { initialize_, AST_Label_initialize },
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_Label_PROPS[] = {
    references_
    };
    
    //-----------------------
    // Class AST_SymbolRef: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_SymbolRef_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_SymbolRef_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_LabelRef: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_LabelRef_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_LabelRef_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_This: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_This_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_This_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_Constant: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_Constant_METHODS = {
      { getValue_, AST_Constant_getValue },
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_Constant_PROPS[] = {
    value_
    };
    
    //-----------------------
    // Class AST_StringLiteral: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_StringLiteral_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_StringLiteral_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_NumberLiteral: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_NumberLiteral_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_NumberLiteral_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_RegExpLiteral: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_RegExpLiteral_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_RegExpLiteral_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_Atom: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_Atom_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_Atom_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_NullAtom: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_NullAtom_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_NullAtom_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_NaNAtom: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_NaNAtom_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_NaNAtom_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_UndefinedAtom: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_UndefinedAtom_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_UndefinedAtom_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_Hole: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_Hole_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_Hole_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_InfinityAtom: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_InfinityAtom_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_InfinityAtom_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_BooleanAtom: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_BooleanAtom_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_BooleanAtom_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_FalseAtom: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_FalseAtom_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_FalseAtom_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_TrueAtom: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_TrueAtom_METHODS = {
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_TrueAtom_PROPS[] = {
    };
    
    //-----------------------
    // Class AST_TreeWalker: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr AST_TreeWalker_METHODS = {
      { _visit_, AST_TreeWalker__visit },
      { parent_, AST_TreeWalker_parent },
      { push_, AST_TreeWalker_push },
      { pop_, AST_TreeWalker_pop },
      { self_, AST_TreeWalker_self },
      { find_parent_, AST_TreeWalker_find_parent },
      { has_directive_, AST_TreeWalker_has_directive },
      { in_boolean_context_, AST_TreeWalker_in_boolean_context },
      { loopcontrol_target_, AST_TreeWalker_loopcontrol_target },
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t AST_TreeWalker_PROPS[] = {
    visit_
    , stack_
    };
    
    

//--------------
    // AST_Token
    any AST_Token; //Class AST_Token
    
    //auto AST_Token_newFromObject
    inline any AST_Token_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_Token,argc,arguments);
    }

//Litescript translation of: UglifyJS's ast.js
//(c) Lucio Tato - 2014

///***********************************************************************
  //A JavaScript tokenizer / parser / beautifier / compressor.
  //https://github.com/mishoo/UglifyJS2

  //-------------------------------- (C) ---------------------------------

                           //Author: Mihai Bazon
                         //<mihai.bazon@gmail.com>
                       //http://mihai.bazon.net/blog

  //Distributed under the BSD license:

    //Copyright 2012 (c) Mihai Bazon <mihai.bazon@gmail.com>

    //Redistribution and use in source and binary forms, with or without
    //modification, are permitted provided that the following conditions
    //are met:

        //* Redistributions of source code must retain the above
          //copyright notice, this list of conditions and the following
          //disclaimer.

        //* Redistributions in binary form must reproduce the above
          //copyright notice, this list of conditions and the following
          //disclaimer in the documentation and/or other materials
          //provided with the distribution.

    //THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDER “AS IS” AND ANY
    //EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
    //IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
    //PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE
    //LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
    //OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
    //PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
    //PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
    //THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
    //TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
    //THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
    //SUCH DAMAGE.

 //***********************************************************************/


//### public class Token 

       //constructor(props)
       void AST_Token__init(DEFAULT_ARGUMENTS){
           
           // define named params
           var props= argc? arguments[0] : undefined;
           //---------
           //for each property name,value in props
           {len_t __propCount=_length(props); any name=undefined; any value=undefined;
           for(int __propIndex=0 ; __propIndex < __propCount ; __propIndex++ ){
               NameValuePair_s _nvp = _unifiedGetNVPAtIndex(props, __propIndex);
               value= _nvp.value;name= _nvp.name;
           
               //this.setProperty name,value
               METHOD(setProperty_,this)(this,2,(any_arr){name
                  , value
              });
           }};// end for each property in props
           
       }

       //properties
            //file  
            //comments_before : array
            //nlb  
            //endpos  
            //pos  
            //col  
            //line  
            //value
            //type  :string 
       ;
    

//--------------
    // AST_Node
    any AST_Node; //Class AST_Node
    
    //auto AST_Node_newFromObject
    inline any AST_Node_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_Node,argc,arguments);
    }


//### public class Node 

//Base class of all AST nodes

       //constructor(props)
       void AST_Node__init(DEFAULT_ARGUMENTS){
           
           // define named params
           var props= argc? arguments[0] : undefined;
           //---------
           //for each property name,value in props
           {len_t __propCount=_length(props); any name=undefined; any value=undefined;
           for(int __propIndex=0 ; __propIndex < __propCount ; __propIndex++ ){
               NameValuePair_s _nvp = _unifiedGetNVPAtIndex(props, __propIndex);
               value= _nvp.value;name= _nvp.name;
           
               //this.setProperty name,value
               METHOD(setProperty_,this)(this,2,(any_arr){name
                  , value
              });
           }};// end for each property in props
           
       }

       //properties
            //endpos 	 // [AST_Token] The last token of this node
            //start  // [AST_Token] The first token of this node
       ;

       //method clone () 
       any AST_Node_clone(DEFAULT_ARGUMENTS){
            assert(_instanceof(this,AST_Node));
            //---------
            //return new this.constructor(this);
            return new(any_class(this.class),1,(any_arr){this
           });
       return undefined;
       }
    

//--------------
    // AST_Statement
    any AST_Statement; //Class AST_Statement extends AST_Node
    
    //auto AST_Statement__init
    void AST_Statement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Node__init(this,argc,arguments);
    };
    
    //auto AST_Statement_newFromObject
    inline any AST_Statement_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_Statement,argc,arguments);
    }


       ///*method _walk (visitor) 
            //return visitor._visit(this);

       //method walk (visitor) 
            //return this._walk(visitor); // not sure the indirection will be any help
      //*/


    //append to namespace Node
       //properties
            //documentation = "Base class of all AST nodes"
            //propdoc = 
//						  "start": "[AST_Token] The first token of this node",
//						  "endpos": "[AST_Token] The last token of this node"



//### public class Statement extends Node

//Base class of all statements

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_Debugger
    any AST_Debugger; //Class AST_Debugger extends AST_Statement
    
    //auto AST_Debugger__init
    void AST_Debugger__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Statement__init(this,argc,arguments);
    };
    
    //auto AST_Debugger_newFromObject
    inline any AST_Debugger_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_Debugger,argc,arguments);
    }


    //append to namespace Statement
       //properties
            //documentation = "Base class of all statements"


//### public class Debugger extends Statement

//Represents a debugger statement

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_Directive
    any AST_Directive; //Class AST_Directive extends AST_Statement
    
    //auto AST_Directive__init
    void AST_Directive__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Statement__init(this,argc,arguments);
    };
    
    //auto AST_Directive_newFromObject
    inline any AST_Directive_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_Directive,argc,arguments);
    }


    //append to namespace Debugger
       //properties
            //documentation = "Represents a debugger statement"


//### public class Directive extends Statement

//Represents a directive, like "use strict";

       //properties
            //scope 	// [AST_Scope/S] The scope that this directive affects
            //value 	// [string] The value of this directive as a plain string (it's not an AST_String!)
       ;
    

//--------------
    // AST_SimpleStatement
    any AST_SimpleStatement; //Class AST_SimpleStatement extends AST_Statement
    
    //auto AST_SimpleStatement__init
    void AST_SimpleStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Statement__init(this,argc,arguments);
    };
    
    //auto AST_SimpleStatement_newFromObject
    inline any AST_SimpleStatement_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_SimpleStatement,argc,arguments);
    }


    //append to namespace Directive
       //properties
            //documentation = "Represents a directive, like \"use strict\";"
            //propdoc = 
//						  "value": "[string] The value of this directive as a plain string (it's not an AST_String!)",
//						  "scope": "[AST_Scope/S] The scope that this directive affects"



//### public class SimpleStatement extends Statement

//A statement consisting of an expression, i.e. a = 1 + 2

       //properties
            //body:Token 	// [AST_Node] an expression node (should not be instanceof AST_Statement)
       ;
    

//--------------
    // AST_Block
    any AST_Block; //Class AST_Block extends AST_Statement
    
    //auto AST_Block__init
    void AST_Block__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Statement__init(this,argc,arguments);
    };
    
    //auto AST_Block_newFromObject
    inline any AST_Block_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_Block,argc,arguments);
    }

       ///*
       //method _walk (visitor) 
        //return visitor._visit(this, function()
            //this.body._walk(visitor);
        //);
      //*/

    //append to namespace SimpleStatement
       //properties
            //documentation = "A statement consisting of an expression, i.e. a = 1 + 2"
            //propdoc = 
//						  "body": "[AST_Node] an expression node (should not be instanceof AST_Statement)"


//### public class Block extends Statement

//A body of statements (usually bracketed)

       //properties
            //body:array of Statement 	// [AST_Statement*] an array of statements
       ;
    

//--------------
    // AST_BlockStatement
    any AST_BlockStatement; //Class AST_BlockStatement extends AST_Block
    
    //auto AST_BlockStatement__init
    void AST_BlockStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Block__init(this,argc,arguments);
    };
    
    //auto AST_BlockStatement_newFromObject
    inline any AST_BlockStatement_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_BlockStatement,argc,arguments);
    }

       ///*
       //method _walk (visitor) 
        //return visitor._visit(this, function()
            //walk_body(this, visitor);
        //);
      //*/


    //append to namespace Block
       //properties
            //documentation = "A body of statements (usually bracketed)"
            //propdoc = 
//						  "body": "[AST_Statement*] an array of statements"



//### public class BlockStatement extends Block

//A block statement

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_EmptyStatement
    any AST_EmptyStatement; //Class AST_EmptyStatement extends AST_Statement
    
    //auto AST_EmptyStatement__init
    void AST_EmptyStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Statement__init(this,argc,arguments);
    };
    
    //auto AST_EmptyStatement_newFromObject
    inline any AST_EmptyStatement_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_EmptyStatement,argc,arguments);
    }


    //append to namespace BlockStatement
       //properties
            //documentation = "A block statement"


//### public class EmptyStatement extends Statement

//The empty statement (empty block or simply a semicolon)

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_StatementWithBody
    any AST_StatementWithBody; //Class AST_StatementWithBody extends AST_Statement
    
    //auto AST_StatementWithBody__init
    void AST_StatementWithBody__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Statement__init(this,argc,arguments);
    };
    
    //auto AST_StatementWithBody_newFromObject
    inline any AST_StatementWithBody_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_StatementWithBody,argc,arguments);
    }


///*       method _walk (visitor) 
        //return visitor._visit(this);
      //*/

    //append to namespace EmptyStatement
       //properties
            //documentation = "The empty statement (empty block or simply a semicolon)"


//### public class StatementWithBody extends Statement

//Base class for all statements that contain one nested body: `For`, `ForIn`, `Do`, `While`, `With`

       //properties
            //body 	// [AST_Statement] the body; this should always be present, even if it's an AST_EmptyStatement
       ;
    

//--------------
    // AST_LabeledStatement
    any AST_LabeledStatement; //Class AST_LabeledStatement extends AST_StatementWithBody
    
    //auto AST_LabeledStatement__init
    void AST_LabeledStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_StatementWithBody__init(this,argc,arguments);
    };
    
    //auto AST_LabeledStatement_newFromObject
    inline any AST_LabeledStatement_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_LabeledStatement,argc,arguments);
    }

       ///*method _walk (visitor) 
        //return visitor._visit(this, function()
            //this.body._walk(visitor);
        //);
    //*/

    //append to namespace StatementWithBody
       //properties
            //documentation = "Base class for all statements that contain one nested body: `For`, `ForIn`, `Do`, `While`, `With`"
            //propdoc = 
//						  "body": "[AST_Statement] the body; this should always be present, even if it's an AST_EmptyStatement"

//### public class LabeledStatement extends StatementWithBody

//Statement with a label

       //properties
            //label 	// [AST_Label] a label definition
       ;
    

//--------------
    // AST_IterationStatement
    any AST_IterationStatement; //Class AST_IterationStatement extends AST_StatementWithBody
    
    //auto AST_IterationStatement__init
    void AST_IterationStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_StatementWithBody__init(this,argc,arguments);
    };
    
    //auto AST_IterationStatement_newFromObject
    inline any AST_IterationStatement_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_IterationStatement,argc,arguments);
    }

       ///*method _walk (visitor) 
        //return visitor._visit(this, function()
            //this.label._walk(visitor);
            //this.body._walk(visitor);
        //);*/

    //append to namespace LabeledStatement
       //properties
            //documentation = "Statement with a label"
            //propdoc = 
//						  "label": "[AST_Label] a label definition"


//### public class IterationStatement extends StatementWithBody

//Internal class.  All loops inherit from it.

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_DWLoop
    any AST_DWLoop; //Class AST_DWLoop extends AST_IterationStatement
    
    //auto AST_DWLoop__init
    void AST_DWLoop__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_IterationStatement__init(this,argc,arguments);
    };
    
    //auto AST_DWLoop_newFromObject
    inline any AST_DWLoop_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_DWLoop,argc,arguments);
    }


    //append to namespace IterationStatement
       //properties
            //documentation = "Internal class.  All loops inherit from it."


//### public class DWLoop extends IterationStatement

//Base class for do/while statements

       //properties
            //condition 	// [AST_Node] the loop condition.  Should not be instanceof AST_Statement
       ;
    

//--------------
    // AST_DoStatement
    any AST_DoStatement; //Class AST_DoStatement extends AST_DWLoop
    
    //auto AST_DoStatement__init
    void AST_DoStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_DWLoop__init(this,argc,arguments);
    };
    
    //auto AST_DoStatement_newFromObject
    inline any AST_DoStatement_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_DoStatement,argc,arguments);
    }

       ///*method _walk (visitor) 
        //return visitor._visit(this, function()
            //this.condition._walk(visitor);
            //this.body._walk(visitor);
        //);*/


    //append to namespace DWLoop
       //properties
            //documentation = "Base class for do/while statements"
            //propdoc = 
//						  "condition": "[AST_Node] the loop condition.  Should not be instanceof AST_Statement"



//### public class DoStatement extends DWLoop

//A `do` statement

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_WhileStatement
    any AST_WhileStatement; //Class AST_WhileStatement extends AST_DWLoop
    
    //auto AST_WhileStatement__init
    void AST_WhileStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_DWLoop__init(this,argc,arguments);
    };
    
    //auto AST_WhileStatement_newFromObject
    inline any AST_WhileStatement_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_WhileStatement,argc,arguments);
    }


    //append to namespace DoStatement
       //properties
            //documentation = "A `do` statement"


//### public class WhileStatement extends DWLoop

//A `while` statement

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_ForStatement
    any AST_ForStatement; //Class AST_ForStatement extends AST_IterationStatement
    
    //auto AST_ForStatement__init
    void AST_ForStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_IterationStatement__init(this,argc,arguments);
    };
    
    //auto AST_ForStatement_newFromObject
    inline any AST_ForStatement_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_ForStatement,argc,arguments);
    }


    //append to namespace WhileStatement
       //properties
            //documentation = "A `while` statement"


//### public class ForStatement extends IterationStatement

//A `for` statement

       //properties
            //step 	      // [AST_Node?] the `for` update clause, or null if empty
            //condition 	// [AST_Node?] the `for` termination clause, or null if empty
            //init 	      // [AST_Node?] the `for` initialization code, or null if empty
       ;
    

//--------------
    // AST_ForIn
    any AST_ForIn; //Class AST_ForIn extends AST_IterationStatement
    
    //auto AST_ForIn__init
    void AST_ForIn__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_IterationStatement__init(this,argc,arguments);
    };
    
    //auto AST_ForIn_newFromObject
    inline any AST_ForIn_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_ForIn,argc,arguments);
    }

       ///*
       //method _walk (visitor) 
        //return visitor._visit(this, function()
            //if (this.init) this.init._walk(visitor);
            //if (this.condition) this.condition._walk(visitor);
            //if (this.step) this.step._walk(visitor);
            //this.body._walk(visitor);
        //);
      //*/

    //append to namespace ForStatement
       //properties
            //documentation = "A `for` statement"
            //propdoc = 
//						  "init": "[AST_Node?] the `for` initialization code, or null if empty",
//						  "condition": "[AST_Node?] the `for` termination clause, or null if empty",
//						  "step": "[AST_Node?] the `for` update clause, or null if empty"



//### public class ForIn extends IterationStatement

//A `for ... in` statement

       //properties
            //object 	// [AST_Node] the object that we're looping through
            //name 	// [AST_SymbolRef?] the loop variable, only if `init` is AST_Var
            //init 	// [AST_Node] the `for/in` initialization code
       ;
    

//--------------
    // AST_WithStatement
    any AST_WithStatement; //Class AST_WithStatement extends AST_StatementWithBody
    
    //auto AST_WithStatement__init
    void AST_WithStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_StatementWithBody__init(this,argc,arguments);
    };
    
    //auto AST_WithStatement_newFromObject
    inline any AST_WithStatement_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_WithStatement,argc,arguments);
    }

       ///*method _walk (visitor) 
        //return visitor._visit(this, function()
            //this.init._walk(visitor);
            //this.object._walk(visitor);
            //this.body._walk(visitor);
        //);*/



    //append to namespace ForIn
       //properties
            //documentation = "A `for ... in` statement"
            //propdoc = 
//						  "init": "[AST_Node] the `for/in` initialization code",
//						  "name": "[AST_SymbolRef?] the loop variable, only if `init` is AST_Var",
//						  "object": "[AST_Node] the object that we're looping through"



//### public class WithStatement extends StatementWithBody

//A `with` statement

       //properties
            //expression 	// [AST_Node] the `with` expression
       ;
    

//--------------
    // AST_Scope
    any AST_Scope; //Class AST_Scope extends AST_Block
    
    //auto AST_Scope__init
    void AST_Scope__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Block__init(this,argc,arguments);
    };
    
    //auto AST_Scope_newFromObject
    inline any AST_Scope_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_Scope,argc,arguments);
    }

       ///*method _walk (visitor) 
        //return visitor._visit(this, function()
            //this.expression._walk(visitor);
            //this.body._walk(visitor);
        //);*/



    //append to namespace WithStatement
       //properties
            //documentation = "A `with` statement"
            //propdoc = 
//						  "expression": "[AST_Node] the `with` expression"



//### public class Scope extends Block

//Base class for all statements introducing a lexical scope

       //properties
            //cname 	// [integer/S] current index for mangling variables (used internally by the mangler)
            //enclosed 	// [SymbolDef*/S] a list of all symbol definitions that are accessed from this scope or any subscopes
            //parent_scope 	// [AST_Scope?/S] link to the parent scope
            //uses_eval 	// [boolean/S] tells whether this scope contains a direct call to the global `eval`
            //uses_with 	// [boolean/S] tells whether this scope uses the `with` statement
            //functions 	// [Object/S] like `variables`, but only lists function declarations
            //variables 	// [Object/S] a map of name -> SymbolDef for all variables/functions defined in this scope
            //directives 	// [string*/S] an array of directives declared in this scope
       ;
    

//--------------
    // AST_Toplevel
    any AST_Toplevel; //Class AST_Toplevel extends AST_Scope
    
    //auto AST_Toplevel__init
    void AST_Toplevel__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Scope__init(this,argc,arguments);
    };
    
    //auto AST_Toplevel_newFromObject
    inline any AST_Toplevel_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_Toplevel,argc,arguments);
    }


    //append to namespace Scope
       //properties
            //documentation = "Base class for all statements introducing a lexical scope"
            //propdoc = 
//						  "directives": "[string*/S] an array of directives declared in this scope",
//						  "variables": "[Object/S] a map of name -> SymbolDef for all variables/functions defined in this scope",
//						  "functions": "[Object/S] like `variables`, but only lists function declarations",
//						  "uses_with": "[boolean/S] tells whether this scope uses the `with` statement",
//						  "uses_eval": "[boolean/S] tells whether this scope contains a direct call to the global `eval`",
//						  "parent_scope": "[AST_Scope?/S] link to the parent scope",
//						  "enclosed": "[SymbolDef*/S] a list of all symbol definitions that are accessed from this scope or any subscopes",
//						  "cname": "[integer/S] current index for mangling variables (used internally by the mangler)"



//### public class Toplevel extends Scope

//The toplevel scope

       //properties
            //globals 	// [Object/S] a map of name -> SymbolDef for all undeclared names
       ;
    

//--------------
    // AST_Lambda
    any AST_Lambda; //Class AST_Lambda extends AST_Scope
    
    //auto AST_Lambda__init
    void AST_Lambda__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Scope__init(this,argc,arguments);
    };
    
    //auto AST_Lambda_newFromObject
    inline any AST_Lambda_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_Lambda,argc,arguments);
    }

       ///*
       //method wrap_enclose (arg_parameter_pairs) 
        //var self = this;
        //var args = [];
        //var parameters = [];

        //arg_parameter_pairs.forEach(function(pair) 
            //var splitAt = pair.lastIndexOf(":");

            //args.push(pair.substr(0, splitAt));
            //parameters.push(pair.substr(splitAt + 1));
        //);

        //var wrapped_tl = "(function(" + parameters.join(",") + ") '$ORIG'; )(" + args.join(",") + ")";
        //wrapped_tl = parse(wrapped_tl);
        //wrapped_tl = wrapped_tl.transform(new TreeTransformer(function before(node)
            //if (node instanceof AST_Directive and node.value is "$ORIG") 
                //return MAP.splice(self.body);

        //));
        //return wrapped_tl;


       //method wrap_commonjs (name, export_all) 
        //var self = this;
        //var to_export = [];

        //if export_all

            //self.figure_out_scope();

            //self.walk(new TreeWalker(function(node)

                //if (node instanceof AST_SymbolDeclaration and node.definition().global) 

                    //var found
                    //for each n in to_export
                        //if n.name is node.name
                            //found = n
                            //break

                    //if not found 
                        //to_export.push(node);

            //));

        //var wrapped_tl = "(function(exports, global) global['" + name + "'] = exports; '$ORIG'; '$EXPORTS'; (, (function()return this())))";
        //wrapped_tl = parse(wrapped_tl);
        //wrapped_tl = wrapped_tl.transform(new TreeTransformer(function before(node)
            //if (node instanceof AST_SimpleStatement) 
                //node = node.body;
                //if (node instanceof AST_String) switch (node.getValue()) 
                  //case "$ORIG":
                    //return MAP.splice(self.body);
                  //case "$EXPORTS":
                    //var body = [];
                    //to_export.forEach(function(sym)
                        //body.push(new AST_SimpleStatement(
                            //body: new AST_Assign(
                                //left: new AST_Sub(
                                    //expression: new AST_SymbolRef( name: "exports" ),
                                    //property: new AST_String( value: sym.name ),
                                //),
                                //operator: "=",
                                //right: new AST_SymbolRef(sym),
                            //),
                        //));
                    //);
                    //return MAP.splice(body);


        //));
        //return wrapped_tl;
        //*/


    //append to namespace Toplevel
       //properties
            //documentation = "The toplevel scope"
            //propdoc = 
//						  "globals": "[Object/S] a map of name -> SymbolDef for all undeclared names"



//### public class Lambda extends Scope

//Base class for functions

       //properties
            //uses_arguments 	// [boolean/S] tells whether this function accesses the arguments array
            //argnames 	// [AST_SymbolFunarg*] array of function arguments
            //name 	// [AST_SymbolDeclaration?] the name of this function
       ;
    

//--------------
    // AST_Accessor
    any AST_Accessor; //Class AST_Accessor extends AST_Lambda
    
    //auto AST_Accessor__init
    void AST_Accessor__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Lambda__init(this,argc,arguments);
    };
    
    //auto AST_Accessor_newFromObject
    inline any AST_Accessor_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_Accessor,argc,arguments);
    }

       ///*
       //method _walk (visitor) 
        //return visitor._visit(this, function()
            //if (this.name) this.name._walk(visitor);
            //this.argnames.forEach(function(arg)
                //arg._walk(visitor);
            //);
            //walk_body(this, visitor);
        //);
       //*/


    //append to namespace Lambda
       //properties
            //documentation = "Base class for functions"
            //propdoc = 
//						  "name": "[AST_SymbolDeclaration?] the name of this function",
//						  "argnames": "[AST_SymbolFunarg*] array of function arguments",
//						  "uses_arguments": "[boolean/S] tells whether this function accesses the arguments array"



//### public class Accessor extends Lambda

//A setter/getter function.  The `name` property is always null.

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_FunctionExpression
    any AST_FunctionExpression; //Class AST_FunctionExpression extends AST_Lambda
    
    //auto AST_FunctionExpression__init
    void AST_FunctionExpression__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Lambda__init(this,argc,arguments);
    };
    
    //auto AST_FunctionExpression_newFromObject
    inline any AST_FunctionExpression_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_FunctionExpression,argc,arguments);
    }


    //append to namespace Accessor
       //properties
            //documentation = "A setter/getter function.  The `name` property is always null."


//### public class FunctionExpression extends Lambda

//A function expression

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_Defun
    any AST_Defun; //Class AST_Defun extends AST_Lambda
    
    //auto AST_Defun__init
    void AST_Defun__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Lambda__init(this,argc,arguments);
    };
    
    //auto AST_Defun_newFromObject
    inline any AST_Defun_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_Defun,argc,arguments);
    }


    //append to namespace FunctionExpression
       //properties
            //documentation = "A function expression"


//### public class Defun extends Lambda

//A function definition

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_Jump
    any AST_Jump; //Class AST_Jump extends AST_Statement
    
    //auto AST_Jump__init
    void AST_Jump__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Statement__init(this,argc,arguments);
    };
    
    //auto AST_Jump_newFromObject
    inline any AST_Jump_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_Jump,argc,arguments);
    }


    //append to namespace Defun
       //properties
            //documentation = "A function definition"


//### public class Jump extends Statement

//Base class for “jumps” (for now that's `return`, `throw`, `break` and `continue`)

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_ExitStatement
    any AST_ExitStatement; //Class AST_ExitStatement extends AST_Jump
    
    //auto AST_ExitStatement__init
    void AST_ExitStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Jump__init(this,argc,arguments);
    };
    
    //auto AST_ExitStatement_newFromObject
    inline any AST_ExitStatement_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_ExitStatement,argc,arguments);
    }


    //append to namespace Jump
       //properties
            //documentation = "Base class for “jumps” (for now that's `return`, `throw`, `break` and `continue`)"


//### public class ExitStatement extends Jump

//Base class for “exits” (`return` and `throw`)

       //properties
            //value 	// [AST_Node?] the value returned or thrown by this statement; could be null for AST_Return
       ;
    

//--------------
    // AST_ReturnStatement
    any AST_ReturnStatement; //Class AST_ReturnStatement extends AST_ExitStatement
    
    //auto AST_ReturnStatement__init
    void AST_ReturnStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_ExitStatement__init(this,argc,arguments);
    };
    
    //auto AST_ReturnStatement_newFromObject
    inline any AST_ReturnStatement_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_ReturnStatement,argc,arguments);
    }

       ///*method _walk (visitor) 
        //return visitor._visit(this, this.value and function()
            //this.value._walk(visitor);
        //);*/


    //append to namespace ExitStatement
       //properties
            //documentation = "Base class for “exits” (`return` and `throw`)"
            //propdoc = 
//						  "value": "[AST_Node?] the value returned or thrown by this statement; could be null for AST_Return"



//### public class ReturnStatement extends ExitStatement

//A `return` statement

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_ThrowStatement
    any AST_ThrowStatement; //Class AST_ThrowStatement extends AST_ExitStatement
    
    //auto AST_ThrowStatement__init
    void AST_ThrowStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_ExitStatement__init(this,argc,arguments);
    };
    
    //auto AST_ThrowStatement_newFromObject
    inline any AST_ThrowStatement_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_ThrowStatement,argc,arguments);
    }


    //append to namespace ReturnStatement
       //properties
            //documentation = "A `return` statement"


//### public class ThrowStatement extends ExitStatement

//A `throw` statement

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_LoopControl
    any AST_LoopControl; //Class AST_LoopControl extends AST_Jump
    
    //auto AST_LoopControl__init
    void AST_LoopControl__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Jump__init(this,argc,arguments);
    };
    
    //auto AST_LoopControl_newFromObject
    inline any AST_LoopControl_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_LoopControl,argc,arguments);
    }


    //append to namespace ThrowStatement
       //properties
            //documentation = "A `throw` statement"


//### public class LoopControl extends Jump

//Base class for loop control statements (`break` and `continue`)

       //properties
            //label 	// [AST_LabelRef?] the label, or null if none
       ;
    

//--------------
    // AST_BreakStatement
    any AST_BreakStatement; //Class AST_BreakStatement extends AST_LoopControl
    
    //auto AST_BreakStatement__init
    void AST_BreakStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_LoopControl__init(this,argc,arguments);
    };
    
    //auto AST_BreakStatement_newFromObject
    inline any AST_BreakStatement_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_BreakStatement,argc,arguments);
    }

       ///*
       //method _walk (visitor) 
        //return visitor._visit(this, this.label and function()
            //this.label._walk(visitor);
        //);
      //*/

    //append to namespace LoopControl
       //properties
            //documentation = "Base class for loop control statements (`break` and `continue`)"
            //propdoc = 
//						  "label": "[AST_LabelRef?] the label, or null if none"



//### public class BreakStatement extends LoopControl

//A `break` statement

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_ContinueStatement
    any AST_ContinueStatement; //Class AST_ContinueStatement extends AST_LoopControl
    
    //auto AST_ContinueStatement__init
    void AST_ContinueStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_LoopControl__init(this,argc,arguments);
    };
    
    //auto AST_ContinueStatement_newFromObject
    inline any AST_ContinueStatement_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_ContinueStatement,argc,arguments);
    }


    //append to namespace BreakStatement
       //properties
            //documentation = "A `break` statement"


//### public class ContinueStatement extends LoopControl

//A `continue` statement

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_IfStatement
    any AST_IfStatement; //Class AST_IfStatement extends AST_StatementWithBody
    
    //auto AST_IfStatement__init
    void AST_IfStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_StatementWithBody__init(this,argc,arguments);
    };
    
    //auto AST_IfStatement_newFromObject
    inline any AST_IfStatement_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_IfStatement,argc,arguments);
    }


    //append to namespace ContinueStatement
       //properties
            //documentation = "A `continue` statement"


//### public class IfStatement extends StatementWithBody

//A `if` statement

       //properties
            //alternative 	// [AST_Statement?] the `else` part, or null if not present
            //condition 	// [AST_Node] the `if` condition
       ;
    

//--------------
    // AST_Switch
    any AST_Switch; //Class AST_Switch extends AST_Block
    
    //auto AST_Switch__init
    void AST_Switch__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Block__init(this,argc,arguments);
    };
    
    //auto AST_Switch_newFromObject
    inline any AST_Switch_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_Switch,argc,arguments);
    }

       ///*
       //method _walk (visitor) 
        //return visitor._visit(this, function()
            //this.condition._walk(visitor);
            //this.body._walk(visitor);
            //if (this.alternative) this.alternative._walk(visitor);
        //);
        //*/


    //append to namespace IfStatement
       //properties
            //documentation = "A `if` statement"
            //propdoc = 
//						  "condition": "[AST_Node] the `if` condition",
//						  "alternative": "[AST_Statement?] the `else` part, or null if not present"


//### public class Switch extends Block

//A `switch` statement

       //properties
            //expression 	// [AST_Node] the `switch` “discriminant”
       ;
    

//--------------
    // AST_SwitchBranch
    any AST_SwitchBranch; //Class AST_SwitchBranch extends AST_Block
    
    //auto AST_SwitchBranch__init
    void AST_SwitchBranch__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Block__init(this,argc,arguments);
    };
    
    //auto AST_SwitchBranch_newFromObject
    inline any AST_SwitchBranch_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_SwitchBranch,argc,arguments);
    }

       ///*
       //method _walk (visitor) 
        //return visitor._visit(this, function()
            //this.expression._walk(visitor);
            //walk_body(this, visitor);
        //);
       //*/

    //append to namespace Switch
       //properties
            //documentation = "A `switch` statement"
            //propdoc = 
//						  "expression": "[AST_Node] the `switch` “discriminant”"



//### public class SwitchBranch extends Block

//Base class for `switch` branches

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_Default
    any AST_Default; //Class AST_Default extends AST_SwitchBranch
    
    //auto AST_Default__init
    void AST_Default__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_SwitchBranch__init(this,argc,arguments);
    };
    
    //auto AST_Default_newFromObject
    inline any AST_Default_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_Default,argc,arguments);
    }


    //append to namespace SwitchBranch
       //properties
            //documentation = "Base class for `switch` branches"


//### public class Default extends SwitchBranch

//A `default` switch branch

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_Case
    any AST_Case; //Class AST_Case extends AST_SwitchBranch
    
    //auto AST_Case__init
    void AST_Case__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_SwitchBranch__init(this,argc,arguments);
    };
    
    //auto AST_Case_newFromObject
    inline any AST_Case_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_Case,argc,arguments);
    }


    //append to namespace Default
       //properties
            //documentation = "A `default` switch branch"


//### public class Case extends SwitchBranch

//A `case` switch branch

       //properties
            //expression 	// [AST_Node] the `case` expression
       ;
    

//--------------
    // AST_Try
    any AST_Try; //Class AST_Try extends AST_Block
    
    //auto AST_Try__init
    void AST_Try__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Block__init(this,argc,arguments);
    };
    
    //auto AST_Try_newFromObject
    inline any AST_Try_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_Try,argc,arguments);
    }

       ///*method _walk (visitor) 
        //return visitor._visit(this, function()
            //this.expression._walk(visitor);
            //walk_body(this, visitor);
        //);*/



    //append to namespace Case
       //properties
            //documentation = "A `case` switch branch"
            //propdoc = 
//						  "expression": "[AST_Node] the `case` expression"



//### public class Try extends Block

//A `try` statement

       //properties
            //bfinally 	// [AST_Finally?] the finally block, or null if not present
            //bcatch 	// [AST_Catch?] the catch block, or null if not present
       ;
    

//--------------
    // AST_Catch
    any AST_Catch; //Class AST_Catch extends AST_Block
    
    //auto AST_Catch__init
    void AST_Catch__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Block__init(this,argc,arguments);
    };
    
    //auto AST_Catch_newFromObject
    inline any AST_Catch_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_Catch,argc,arguments);
    }

      ///*
       //method _walk (visitor) 
        //return visitor._visit(this, function()
            //walk_body(this, visitor);
            //if (this.bcatch) this.bcatch._walk(visitor);
            //if (this.bfinally) this.bfinally._walk(visitor);
        //);
      //*/


    //append to namespace Try
       //properties
            //documentation = "A `try` statement"
            //propdoc = 
//						  "bcatch": "[AST_Catch?] the catch block, or null if not present",
//						  "bfinally": "[AST_Finally?] the finally block, or null if not present"



//### public class Catch extends Block

//A `catch` node; only makes sense as part of a `try` statement

       //properties
            //argname 	// [AST_SymbolCatch] symbol for the exception
       ;
    

//--------------
    // AST_Finally
    any AST_Finally; //Class AST_Finally extends AST_Block
    
    //auto AST_Finally__init
    void AST_Finally__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Block__init(this,argc,arguments);
    };
    
    //auto AST_Finally_newFromObject
    inline any AST_Finally_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_Finally,argc,arguments);
    }

       ///*method _walk (visitor) 
        //return visitor._visit(this, function()
            //this.argname._walk(visitor);
            //walk_body(this, visitor);
        //);*/



    //append to namespace Catch
       //properties
            //documentation = "A `catch` node; only makes sense as part of a `try` statement"
            //propdoc = 
//						  "argname": "[AST_SymbolCatch] symbol for the exception"



//### public class Finally extends Block

//A `finally` node; only makes sense as part of a `try` statement

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_Definitions
    any AST_Definitions; //Class AST_Definitions extends AST_Statement
    
    //auto AST_Definitions__init
    void AST_Definitions__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Statement__init(this,argc,arguments);
    };
    
    //auto AST_Definitions_newFromObject
    inline any AST_Definitions_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_Definitions,argc,arguments);
    }


    //append to namespace Finally
       //properties
            //documentation = "A `finally` node; only makes sense as part of a `try` statement"


//### public class Definitions extends Statement

//Base class for `var` or `const` nodes (variable declarations/initializations)

       //properties
            //definitions: array of VarDef	// [AST_VarDef*] array of variable definitions
       ;
    

//--------------
    // AST_Var
    any AST_Var; //Class AST_Var extends AST_Definitions
    
    //auto AST_Var__init
    void AST_Var__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Definitions__init(this,argc,arguments);
    };
    
    //auto AST_Var_newFromObject
    inline any AST_Var_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_Var,argc,arguments);
    }

       ///*method _walk (visitor) 
        //return visitor._visit(this, function()
            //this.definitions.forEach(function(def)
                //def._walk(visitor);
            //);
        //);*/



    //append to namespace Definitions
       //properties
            //documentation = "Base class for `var` or `const` nodes (variable declarations/initializations)"
            //propdoc = 
//						  "definitions": "[AST_VarDef*] array of variable definitions"



//### public class Var extends Definitions

//A `var` statement

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_Const
    any AST_Const; //Class AST_Const extends AST_Definitions
    
    //auto AST_Const__init
    void AST_Const__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Definitions__init(this,argc,arguments);
    };
    
    //auto AST_Const_newFromObject
    inline any AST_Const_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_Const,argc,arguments);
    }


    //append to namespace Var
       //properties
            //documentation = "A `var` statement"


//### public class Const extends Definitions

//A `const` statement

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_VarDef
    any AST_VarDef; //Class AST_VarDef extends AST_Node
    
    //auto AST_VarDef__init
    void AST_VarDef__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Node__init(this,argc,arguments);
    };
    
    //auto AST_VarDef_newFromObject
    inline any AST_VarDef_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_VarDef,argc,arguments);
    }


    //append to namespace Const
       //properties
            //documentation = "A `const` statement"


//### public class VarDef extends Node

//A variable declaration; only appears in a AST_Definitions node

       //properties
            //value 	// [AST_Node?] initializer, or null of there's no initializer
            //name 	// [AST_SymbolVar|AST_SymbolConst] name of the variable
       ;
    

//--------------
    // AST_CallStatement
    any AST_CallStatement; //Class AST_CallStatement extends AST_Node
    
    //auto AST_CallStatement__init
    void AST_CallStatement__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Node__init(this,argc,arguments);
    };
    
    //auto AST_CallStatement_newFromObject
    inline any AST_CallStatement_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_CallStatement,argc,arguments);
    }

       ///*
       //method _walk (visitor) 
        //return visitor._visit(this, function()
            //this.name._walk(visitor);
            //if (this.value) this.value._walk(visitor);
        //);
        //*/


    //append to namespace VarDef
       //properties
            //documentation = "A variable declaration; only appears in a AST_Definitions node"
            //propdoc = 
//						  "name": "[AST_SymbolVar|AST_SymbolConst] name of the variable",
//						  "value": "[AST_Node?] initializer, or null of there's no initializer"



//### public class CallStatement extends Node

//A function call expression

       //properties
            //args 	// [AST_Node*] array of arguments
            //expression 	// [AST_Node] expression to invoke as function
       ;
    

//--------------
    // AST_New
    any AST_New; //Class AST_New extends AST_CallStatement
    
    //auto AST_New__init
    void AST_New__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_CallStatement__init(this,argc,arguments);
    };
    
    //auto AST_New_newFromObject
    inline any AST_New_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_New,argc,arguments);
    }

       ///*
       //method _walk (visitor) 
        //return visitor._visit(this, function()
            //this.expression._walk(visitor);
            //this.args.forEach(function(arg)
                //arg._walk(visitor);
            //);
        //);
        //*/


    //append to namespace CallStatement
       //properties
            //documentation = "A function call expression"
            //propdoc = 
//						  "expression": "[AST_Node] expression to invoke as function",
//						  "args": "[AST_Node*] array of arguments"



//### public class New extends CallStatement

//An object instantiation.  Derives from a function call since it has exactly the same properties

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_Seq
    any AST_Seq; //Class AST_Seq extends AST_Node
    
    //auto AST_Seq__init
    void AST_Seq__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Node__init(this,argc,arguments);
    };
    
    //auto AST_Seq_newFromObject
    inline any AST_Seq_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_Seq,argc,arguments);
    }


    //append to namespace New
       //properties
            //documentation = "An object instantiation.  Derives from a function call since it has exactly the same properties"


//### public class Seq extends Node

//A sequence expression (two comma-separated expressions)

       //properties
            //cdr 	// [AST_Node] second element in sequence
            //car 	// [AST_Node] first element in sequence
       ;

       //method to_array () 
       any AST_Seq_to_array(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,AST_Seq));
        //---------
        //var p = this, a = [];
        var p = this
           , a = new(Array,0,NULL)
       ;
        //while (p) 
        while((_anyToBool(p))){
            //a.push(p.car);
            METHOD(push_,a)(a,1,(any_arr){PROP(car_,p)
           });
            //if p.cdr and p.cdr isnt instance of Seq
            if (_anyToBool(PROP(cdr_,p)) && !(_instanceof(PROP(cdr_,p),AST_Seq)))  {
                //a.push(p.cdr);
                METHOD(push_,a)(a,1,(any_arr){PROP(cdr_,p)
               });
                //break;
                break;
            };

            //p = p.cdr;
            p = PROP(cdr_,p);
        };// end loop

        //return a;
        return a;
       return undefined;
       }


       //method add (node) 
       any AST_Seq_add(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,AST_Seq));
        //---------
        // define named params
        var node= argc? arguments[0] : undefined;
        //---------
        //var p = this;
        var p = this
       ;
        //while (p) 
        while((_anyToBool(p))){
            //if p.cdr isnt instanceof Seq 
            if (!(_instanceof(PROP(cdr_,p),AST_Seq)))  {
                //var cell = Seq.cons(p.cdr, node);
                var cell = AST_Seq_cons(undefined,2,(any_arr){PROP(cdr_,p)
                   , node
               })
               ;
                //return cell into p.cdr;
                return (PROP(cdr_,p)=cell);
            };

            //p = p.cdr;
            p = PROP(cdr_,p);
        };// end loop
        
       return undefined;
       }
    

//--------------
    // AST_PropAccess
    any AST_PropAccess; //Class AST_PropAccess extends AST_Node
    
    //auto AST_PropAccess__init
    void AST_PropAccess__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Node__init(this,argc,arguments);
    };
    
    //auto AST_PropAccess_newFromObject
    inline any AST_PropAccess_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_PropAccess,argc,arguments);
    }

      ///*        
       //method _walk (visitor) 
        //return visitor._visit(this, function()
            //this.car._walk(visitor);
            //if (this.cdr) this.cdr._walk(visitor);
        //);
      //*/


    //append to namespace Seq

      //properties
            //documentation = "A sequence expression (two comma-separated expressions)"
            //propdoc = 
//						  "car": "[AST_Node] first element in sequence",
//						  "cdr": "[AST_Node] second element in sequence"

      //method cons(x, y) returns Seq
          //var seq = new Seq(x);
          //seq.car = x;
          //seq.cdr = y;
          //return seq;

      //method from_array(array) 
          //if (array.length is 0), return null;
          //if (array.length is 1), return array[0].clone();
          //var list = null;
          //for  i = array.length down to 0
              //list = Seq.cons(array[i], list);

          //var p:Seq = list;
          //while p 
              //if (p.cdr and not p.cdr.cdr) 
                  //p.cdr = p.cdr.car
                  //break

              //p = p.cdr

          //return list



//### public class PropAccess extends Node

//Base class for property access expressions, i.e. `a.foo` or `a["foo"]`

       //properties
            //prop       	// [AST_Node|string] the property to access.  For AST_Dot this is always a plain string, while for AST_Sub it's an arbitrary AST_Node
            //expression 	// [AST_Node] the “container” expression
       ;
    

//--------------
    // AST_Dot
    any AST_Dot; //Class AST_Dot extends AST_PropAccess
    
    //auto AST_Dot__init
    void AST_Dot__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_PropAccess__init(this,argc,arguments);
    };
    
    //auto AST_Dot_newFromObject
    inline any AST_Dot_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_Dot,argc,arguments);
    }


    //append to namespace PropAccess
       //properties
            //documentation = "Base class for property access expressions, i.e. `a.foo` or `a[\"foo\"]`"
            //propdoc = 
//						  "expression": "[AST_Node] the “container” expression",
//						  "property": "[AST_Node|string] the property to access.  For AST_Dot this is always a plain string, while for AST_Sub it's an arbitrary AST_Node"



//### public class Dot extends PropAccess

//A dotted property access expression

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_Sub
    any AST_Sub; //Class AST_Sub extends AST_PropAccess
    
    //auto AST_Sub__init
    void AST_Sub__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_PropAccess__init(this,argc,arguments);
    };
    
    //auto AST_Sub_newFromObject
    inline any AST_Sub_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_Sub,argc,arguments);
    }


        ///*
       //method _walk (visitor) 
        //return visitor._visit(this, function()
            //this.expression._walk(visitor);
        //);
      //*/


    //append to namespace Dot
       //properties
            //documentation = "A dotted property access expression"


//### public class Sub extends PropAccess

//Index-style property access, i.e. `a["foo"]`

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_Unary
    any AST_Unary; //Class AST_Unary extends AST_Node
    
    //auto AST_Unary__init
    void AST_Unary__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Node__init(this,argc,arguments);
    };
    
    //auto AST_Unary_newFromObject
    inline any AST_Unary_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_Unary,argc,arguments);
    }


      ///*
       //method _walk (visitor) 
        //return visitor._visit(this, function()
            //this.expression._walk(visitor);
            //this.property._walk(visitor);
        //);
      //*/

    //append to namespace Sub
       //properties
            //documentation = "Index-style property access, i.e. `a[\"foo\"]`"


//### public class Unary extends Node

//Base class for unary expressions

       //properties
            //expression 	// [AST_Node] expression that this unary operator applies to
            //operator 	// [string] the operator
       ;
    

//--------------
    // AST_UnaryPrefix
    any AST_UnaryPrefix; //Class AST_UnaryPrefix extends AST_Unary
    
    //auto AST_UnaryPrefix__init
    void AST_UnaryPrefix__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Unary__init(this,argc,arguments);
    };
    
    //auto AST_UnaryPrefix_newFromObject
    inline any AST_UnaryPrefix_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_UnaryPrefix,argc,arguments);
    }

       ///*method _walk (visitor) 
        //return visitor._visit(this, function()
            //this.expression._walk(visitor);
        //);*/



    //append to namespace Unary
       //properties
            //documentation = "Base class for unary expressions"
            //propdoc = 
//						  "operator": "[string] the operator",
//						  "expression": "[AST_Node] expression that this unary operator applies to"



//### public class UnaryPrefix extends Unary

//Unary prefix expression, i.e. `typeof i` or `++i`

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_UnaryPostfix
    any AST_UnaryPostfix; //Class AST_UnaryPostfix extends AST_Unary
    
    //auto AST_UnaryPostfix__init
    void AST_UnaryPostfix__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Unary__init(this,argc,arguments);
    };
    
    //auto AST_UnaryPostfix_newFromObject
    inline any AST_UnaryPostfix_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_UnaryPostfix,argc,arguments);
    }


    //append to namespace UnaryPrefix
       //properties
            //documentation = "Unary prefix expression, i.e. `typeof i` or `++i`"


//### public class UnaryPostfix extends Unary

//Unary postfix expression, i.e. `i++`

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_Binary
    any AST_Binary; //Class AST_Binary extends AST_Node
    
    //auto AST_Binary__init
    void AST_Binary__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Node__init(this,argc,arguments);
    };
    
    //auto AST_Binary_newFromObject
    inline any AST_Binary_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_Binary,argc,arguments);
    }


    //append to namespace UnaryPostfix
       //properties
            //documentation = "Unary postfix expression, i.e. `i++`"


//### public class Binary extends Node

//Binary expression, i.e. `a + b`

       //properties
            //right 	// [AST_Node] right-hand side expression
            //operator 	// [string] the operator
            //left 	// [AST_Node] left-hand side expression
       ;
    

//--------------
    // AST_Conditional
    any AST_Conditional; //Class AST_Conditional extends AST_Node
    
    //auto AST_Conditional__init
    void AST_Conditional__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Node__init(this,argc,arguments);
    };
    
    //auto AST_Conditional_newFromObject
    inline any AST_Conditional_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_Conditional,argc,arguments);
    }

      ///*
       //method _walk (visitor) 
        //return visitor._visit(this, function()
            //this.left._walk(visitor);
            //this.right._walk(visitor);
        //);
      //*/


    //append to namespace Binary
       //properties
            //documentation = "Binary expression, i.e. `a + b`"
            //propdoc = 
//						  "left": "[AST_Node] left-hand side expression",
//						  "operator": "[string] the operator",
//						  "right": "[AST_Node] right-hand side expression"



//### public class Conditional extends Node

//Conditional expression using the ternary operator, i.e. `a ? b : c`

       //properties
            //alternative 	// [AST_Node]
            //consequent 	// [AST_Node]
            //condition 	// [AST_Node]
       ;
    

//--------------
    // AST_Assign
    any AST_Assign; //Class AST_Assign extends AST_Binary
    
    //auto AST_Assign__init
    void AST_Assign__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Binary__init(this,argc,arguments);
    };
    
    //auto AST_Assign_newFromObject
    inline any AST_Assign_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_Assign,argc,arguments);
    }

      ///*
       //method _walk (visitor) 
        //return visitor._visit(this, function()
            //this.condition._walk(visitor);
            //this.consequent._walk(visitor);
            //this.alternative._walk(visitor);
        //);
      //*/


    //append to namespace Conditional
       //properties
            //documentation = "Conditional expression using the ternary operator, i.e. `a ? b : c`"
            //propdoc = 
//						  "condition": "[AST_Node]",
//						  "consequent": "[AST_Node]",
//						  "alternative": "[AST_Node]"



//### public class Assign extends Binary

//An assignment expression — `a = b + 5`

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_ArrayLiteral
    any AST_ArrayLiteral; //Class AST_ArrayLiteral extends AST_Node
    
    //auto AST_ArrayLiteral__init
    void AST_ArrayLiteral__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Node__init(this,argc,arguments);
    };
    
    //auto AST_ArrayLiteral_newFromObject
    inline any AST_ArrayLiteral_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_ArrayLiteral,argc,arguments);
    }


    //append to namespace Assign
       //properties
            //documentation = "An assignment expression — `a = b + 5`"


//### public class ArrayLiteral extends Node

//An array literal

       //properties
            //elements 	// [AST_Node*] array of elements
       ;
    

//--------------
    // AST_ObjectLiteral
    any AST_ObjectLiteral; //Class AST_ObjectLiteral extends AST_Node
    
    //auto AST_ObjectLiteral__init
    void AST_ObjectLiteral__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Node__init(this,argc,arguments);
    };
    
    //auto AST_ObjectLiteral_newFromObject
    inline any AST_ObjectLiteral_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_ObjectLiteral,argc,arguments);
    }

       ///*
       //method _walk (visitor) 
        //return visitor._visit(this, function()
            //this.elements.forEach(function(el)
                //el._walk(visitor);
            //);
        //);
        //*/

    //append to namespace ArrayLiteral
       //properties
            //documentation = "An array literal"
            //propdoc = 
//						  "elements": "[AST_Node*] array of elements"



//### public class ObjectLiteral extends Node

//An object literal

       //properties
            //props 	// [AST_ObjectProperty*] array of properties
       ;
    

//--------------
    // AST_ObjectProperty
    any AST_ObjectProperty; //Class AST_ObjectProperty extends AST_Node
    
    //auto AST_ObjectProperty__init
    void AST_ObjectProperty__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Node__init(this,argc,arguments);
    };
    
    //auto AST_ObjectProperty_newFromObject
    inline any AST_ObjectProperty_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_ObjectProperty,argc,arguments);
    }

       ///*
       //method _walk (visitor) 
        //return visitor._visit(this, function()
            //this.properties.forEach(function(prop)
                //prop._walk(visitor);
            //);
        //);
        //*/


    //append to namespace ObjectLiteral
       //properties
            //documentation = "An object literal"
            //propdoc = 
//						  "properties": "[AST_ObjectProperty*] array of properties"



//### public class ObjectProperty extends Node

//Base class for literal object properties

       //properties
            //value 	// [AST_Node] property value.  For setters and getters this is an AST_Function.
            //key 	// [string] the property name converted to a string for ObjectKeyVal.  For setters and getters this is an arbitrary AST_Node.
       ;
    

//--------------
    // AST_ObjectKeyVal
    any AST_ObjectKeyVal; //Class AST_ObjectKeyVal extends AST_ObjectProperty
    
    //auto AST_ObjectKeyVal__init
    void AST_ObjectKeyVal__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_ObjectProperty__init(this,argc,arguments);
    };
    
    //auto AST_ObjectKeyVal_newFromObject
    inline any AST_ObjectKeyVal_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_ObjectKeyVal,argc,arguments);
    }

       ///*
       //method _walk (visitor) 
        //return visitor._visit(this, function()
            //this.value._walk(visitor);
        //);
      //*/


    //append to namespace ObjectProperty
       //properties
            //documentation = "Base class for literal object properties"
            //propdoc = 
//						  "key": "[string] the property name converted to a string for ObjectKeyVal.  For setters and getters this is an arbitrary AST_Node.",
//						  "value": "[AST_Node] property value.  For setters and getters this is an AST_Function."



//### public class ObjectKeyVal extends ObjectProperty

//A key:value object property

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_ObjectSetter
    any AST_ObjectSetter; //Class AST_ObjectSetter extends AST_ObjectProperty
    
    //auto AST_ObjectSetter__init
    void AST_ObjectSetter__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_ObjectProperty__init(this,argc,arguments);
    };
    
    //auto AST_ObjectSetter_newFromObject
    inline any AST_ObjectSetter_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_ObjectSetter,argc,arguments);
    }


    //append to namespace ObjectKeyVal
       //properties
            //documentation = "A key: value object property"


//### public class ObjectSetter extends ObjectProperty

//An object setter property

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_ObjectGetter
    any AST_ObjectGetter; //Class AST_ObjectGetter extends AST_ObjectProperty
    
    //auto AST_ObjectGetter__init
    void AST_ObjectGetter__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_ObjectProperty__init(this,argc,arguments);
    };
    
    //auto AST_ObjectGetter_newFromObject
    inline any AST_ObjectGetter_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_ObjectGetter,argc,arguments);
    }



    //append to namespace ObjectSetter
       //properties
            //documentation = "An object setter property"


//### public class ObjectGetter extends ObjectProperty

//An object getter property

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_Symbol
    any AST_Symbol; //Class AST_Symbol extends AST_Node
    
    //auto AST_Symbol__init
    void AST_Symbol__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Node__init(this,argc,arguments);
    };
    
    //auto AST_Symbol_newFromObject
    inline any AST_Symbol_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_Symbol,argc,arguments);
    }


    //append to namespace ObjectGetter
       //properties
            //documentation = "An object getter property"


//### public class Symbol extends Node

//Base class for all symbols

       //properties
            //thedef 	// [SymbolDef/S] the definition of this symbol
            //name 	// [string] name of this symbol
            //scope 	// [AST_Scope/S] the current scope (not necessarily the definition scope)
       ;
    

//--------------
    // AST_SymbolAccessor
    any AST_SymbolAccessor; //Class AST_SymbolAccessor extends AST_Symbol
    
    //auto AST_SymbolAccessor__init
    void AST_SymbolAccessor__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Symbol__init(this,argc,arguments);
    };
    
    //auto AST_SymbolAccessor_newFromObject
    inline any AST_SymbolAccessor_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_SymbolAccessor,argc,arguments);
    }


    //append to namespace Symbol
       //properties
            //propdoc = 
//						  "name": "[string] name of this symbol",
//						  "scope": "[AST_Scope/S] the current scope (not necessarily the definition scope)",
//						  "thedef": "[SymbolDef/S] the definition of this symbol"

            //documentation = "Base class for all symbols"


//### public class SymbolAccessor extends Symbol

//The name of a property accessor (setter/getter function)

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_SymbolDeclaration
    any AST_SymbolDeclaration; //Class AST_SymbolDeclaration extends AST_Symbol
    
    //auto AST_SymbolDeclaration__init
    void AST_SymbolDeclaration__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Symbol__init(this,argc,arguments);
    };
    
    //auto AST_SymbolDeclaration_newFromObject
    inline any AST_SymbolDeclaration_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_SymbolDeclaration,argc,arguments);
    }


    //append to namespace SymbolAccessor
       //properties
            //documentation = "The name of a property accessor (setter/getter function)"


//### public class SymbolDeclaration extends Symbol

//A declaration symbol (symbol in var/const, function name or argument, symbol in catch)

       //properties
            //init 	// [AST_Node*/S] array of initializers for this declaration.
       ;
    

//--------------
    // AST_SymbolVar
    any AST_SymbolVar; //Class AST_SymbolVar extends AST_SymbolDeclaration
    
    //auto AST_SymbolVar__init
    void AST_SymbolVar__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_SymbolDeclaration__init(this,argc,arguments);
    };
    
    //auto AST_SymbolVar_newFromObject
    inline any AST_SymbolVar_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_SymbolVar,argc,arguments);
    }


    //append to namespace SymbolDeclaration
       //properties
            //documentation = "A declaration symbol (symbol in var/const, function name or argument, symbol in catch)"
            //propdoc = 
//						  "init": "[AST_Node*/S] array of initializers for this declaration."



//### public class SymbolVar extends SymbolDeclaration

//Symbol defining a variable

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_SymbolConst
    any AST_SymbolConst; //Class AST_SymbolConst extends AST_SymbolDeclaration
    
    //auto AST_SymbolConst__init
    void AST_SymbolConst__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_SymbolDeclaration__init(this,argc,arguments);
    };
    
    //auto AST_SymbolConst_newFromObject
    inline any AST_SymbolConst_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_SymbolConst,argc,arguments);
    }


    //append to namespace SymbolVar
       //properties
            //documentation = "Symbol defining a variable"


//### public class SymbolConst extends SymbolDeclaration

//A constant declaration

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_SymbolFunarg
    any AST_SymbolFunarg; //Class AST_SymbolFunarg extends AST_SymbolVar
    
    //auto AST_SymbolFunarg__init
    void AST_SymbolFunarg__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_SymbolVar__init(this,argc,arguments);
    };
    
    //auto AST_SymbolFunarg_newFromObject
    inline any AST_SymbolFunarg_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_SymbolFunarg,argc,arguments);
    }


    //append to namespace SymbolConst
       //properties
            //documentation = "A constant declaration"


//### public class SymbolFunarg extends SymbolVar

//Symbol naming a function argument

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_SymbolDefun
    any AST_SymbolDefun; //Class AST_SymbolDefun extends AST_SymbolDeclaration
    
    //auto AST_SymbolDefun__init
    void AST_SymbolDefun__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_SymbolDeclaration__init(this,argc,arguments);
    };
    
    //auto AST_SymbolDefun_newFromObject
    inline any AST_SymbolDefun_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_SymbolDefun,argc,arguments);
    }


    //append to namespace SymbolFunarg
       //properties
            //documentation = "Symbol naming a function argument"


//### public class SymbolDefun extends SymbolDeclaration

//Symbol defining a function

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_SymbolLambda
    any AST_SymbolLambda; //Class AST_SymbolLambda extends AST_SymbolDeclaration
    
    //auto AST_SymbolLambda__init
    void AST_SymbolLambda__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_SymbolDeclaration__init(this,argc,arguments);
    };
    
    //auto AST_SymbolLambda_newFromObject
    inline any AST_SymbolLambda_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_SymbolLambda,argc,arguments);
    }


    //append to namespace SymbolDefun
       //properties
            //documentation = "Symbol defining a function"


//### public class SymbolLambda extends SymbolDeclaration

//Symbol naming a function expression

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_SymbolCatch
    any AST_SymbolCatch; //Class AST_SymbolCatch extends AST_SymbolDeclaration
    
    //auto AST_SymbolCatch__init
    void AST_SymbolCatch__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_SymbolDeclaration__init(this,argc,arguments);
    };
    
    //auto AST_SymbolCatch_newFromObject
    inline any AST_SymbolCatch_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_SymbolCatch,argc,arguments);
    }


    //append to namespace SymbolLambda
       //properties
            //documentation = "Symbol naming a function expression"


//### public class SymbolCatch extends SymbolDeclaration

//Symbol naming the exception in catch

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_Label
    any AST_Label; //Class AST_Label extends AST_Symbol
    
    //auto AST_Label__init
    void AST_Label__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Symbol__init(this,argc,arguments);
    };
    
    //auto AST_Label_newFromObject
    inline any AST_Label_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_Label,argc,arguments);
    }


    //append to namespace SymbolCatch
       //properties
            //documentation = "Symbol naming the exception in catch"


//### public class Label extends Symbol

//Symbol naming a label (declaration)

       //properties
            //references 	// [AST_LoopControl*] a list of nodes referring to this label
       ;

       //method initialize () 
       any AST_Label_initialize(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,AST_Label));
        //---------
        //this.references = [];
        PROP(references_,this) = new(Array,0,NULL);
        //this.thedef = this;
        PROP(thedef_,this) = this;
       return undefined;
       }
    

//--------------
    // AST_SymbolRef
    any AST_SymbolRef; //Class AST_SymbolRef extends AST_Symbol
    
    //auto AST_SymbolRef__init
    void AST_SymbolRef__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Symbol__init(this,argc,arguments);
    };
    
    //auto AST_SymbolRef_newFromObject
    inline any AST_SymbolRef_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_SymbolRef,argc,arguments);
    }



    //append to namespace Label
       //properties
            //documentation = "Symbol naming a label (declaration)"
            //propdoc = 
//						  "references": "[AST_LoopControl*] a list of nodes referring to this label"



//### public class SymbolRef extends Symbol

//Reference to some symbol (not definition/declaration)

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_LabelRef
    any AST_LabelRef; //Class AST_LabelRef extends AST_Symbol
    
    //auto AST_LabelRef__init
    void AST_LabelRef__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Symbol__init(this,argc,arguments);
    };
    
    //auto AST_LabelRef_newFromObject
    inline any AST_LabelRef_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_LabelRef,argc,arguments);
    }


    //append to namespace SymbolRef
       //properties
            //documentation = "Reference to some symbol (not definition/declaration)"


//### public class LabelRef extends Symbol

//Reference to a label symbol

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_This
    any AST_This; //Class AST_This extends AST_Symbol
    
    //auto AST_This__init
    void AST_This__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Symbol__init(this,argc,arguments);
    };
    
    //auto AST_This_newFromObject
    inline any AST_This_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_This,argc,arguments);
    }


    //append to namespace LabelRef
       //properties
            //documentation = "Reference to a label symbol"


//### public class This extends Symbol

//The `this` symbol

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_Constant
    any AST_Constant; //Class AST_Constant extends AST_Node
    
    //auto AST_Constant__init
    void AST_Constant__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Node__init(this,argc,arguments);
    };
    
    //auto AST_Constant_newFromObject
    inline any AST_Constant_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_Constant,argc,arguments);
    }


    //append to namespace This
       //properties
            //documentation = "The `this` symbol"


//### public class Constant extends Node

//Base class for all constants

      //properties value
      ;

      //method getValue () 
      any AST_Constant_getValue(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,AST_Constant));
        //---------
        //return this.value;
        return PROP(value_,this);
      return undefined;
      }
    

//--------------
    // AST_StringLiteral
    any AST_StringLiteral; //Class AST_StringLiteral extends AST_Constant
    
    //auto AST_StringLiteral__init
    void AST_StringLiteral__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Constant__init(this,argc,arguments);
    };
    
    //auto AST_StringLiteral_newFromObject
    inline any AST_StringLiteral_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_StringLiteral,argc,arguments);
    }

    //append to namespace Constant
       //properties
            //documentation = "Base class for all constants"


//### public class StringLiteral extends Constant

//A string literal

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_NumberLiteral
    any AST_NumberLiteral; //Class AST_NumberLiteral extends AST_Constant
    
    //auto AST_NumberLiteral__init
    void AST_NumberLiteral__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Constant__init(this,argc,arguments);
    };
    
    //auto AST_NumberLiteral_newFromObject
    inline any AST_NumberLiteral_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_NumberLiteral,argc,arguments);
    }


    //append to namespace StringLiteral
       //properties
            //documentation = "A string literal"
            //propdoc = 
//						  "value": "[string] the contents of this string"



//### public class NumberLiteral extends Constant

//A number literal

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_RegExpLiteral
    any AST_RegExpLiteral; //Class AST_RegExpLiteral extends AST_Constant
    
    //auto AST_RegExpLiteral__init
    void AST_RegExpLiteral__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Constant__init(this,argc,arguments);
    };
    
    //auto AST_RegExpLiteral_newFromObject
    inline any AST_RegExpLiteral_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_RegExpLiteral,argc,arguments);
    }


       //properties
       //     value 	// [number] the numeric value


    //append to namespace NumberLiteral
       //properties
            //documentation = "A number literal"
            //propdoc = 
//						  "value": "[number] the numeric value"



//### public class RegExpLiteral extends Constant

//A regexp literal

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_Atom
    any AST_Atom; //Class AST_Atom extends AST_Constant
    
    //auto AST_Atom__init
    void AST_Atom__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Constant__init(this,argc,arguments);
    };
    
    //auto AST_Atom_newFromObject
    inline any AST_Atom_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_Atom,argc,arguments);
    }


    //append to namespace RegExpLiteral
       //properties
            //documentation = "A regexp literal"
            //propdoc = 
//						  "value": "[RegExp] the actual regexp"



//### public class Atom extends Constant

//Base class for atoms

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_NullAtom
    any AST_NullAtom; //Class AST_NullAtom extends AST_Atom
    
    //auto AST_NullAtom__init
    void AST_NullAtom__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Atom__init(this,argc,arguments);
    };
    
    //auto AST_NullAtom_newFromObject
    inline any AST_NullAtom_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_NullAtom,argc,arguments);
    }


    //append to namespace Atom
       //properties
            //documentation = "Base class for atoms"


//### public class NullAtom extends Atom

//The `null` atom

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_NaNAtom
    any AST_NaNAtom; //Class AST_NaNAtom extends AST_Atom
    
    
    //auto AST_NaNAtom_newFromObject
    inline any AST_NaNAtom_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_NaNAtom,argc,arguments);
    }


       //properties value = null

    //append to namespace NullAtom
       //properties
            //documentation = "The `null` atom"


//### public class NaNAtom extends Atom

//The Not-a-Number value

       //constructor()
       void AST_NaNAtom__init(DEFAULT_ARGUMENTS){
         // auto call super class __init
         AST_Atom__init(this,argc,arguments);
          //.value = NaN
          PROP(value_,this) = NaN;
       }
    

//--------------
    // AST_UndefinedAtom
    any AST_UndefinedAtom; //Class AST_UndefinedAtom extends AST_Atom
    
    //auto AST_UndefinedAtom__init
    void AST_UndefinedAtom__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Atom__init(this,argc,arguments);
    };
    
    //auto AST_UndefinedAtom_newFromObject
    inline any AST_UndefinedAtom_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_UndefinedAtom,argc,arguments);
    }

    //append to namespace NaNAtom
       //properties
            //documentation = "The impossible value"


//### public class UndefinedAtom extends Atom
//The `undefined` value

        //do nothing
        //do nothing
        ;
    

//--------------
    // AST_Hole
    any AST_Hole; //Class AST_Hole extends AST_Atom
    
    //auto AST_Hole__init
    void AST_Hole__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Atom__init(this,argc,arguments);
    };
    
    //auto AST_Hole_newFromObject
    inline any AST_Hole_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_Hole,argc,arguments);
    }

    //append to namespace UndefinedAtom
       //properties
            //documentation = "The `undefined` value"


//### public class Hole extends Atom
//A hole in an array

        //do nothing
        //do nothing
        ;
    

//--------------
    // AST_InfinityAtom
    any AST_InfinityAtom; //Class AST_InfinityAtom extends AST_Atom
    
    
    //auto AST_InfinityAtom_newFromObject
    inline any AST_InfinityAtom_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_InfinityAtom,argc,arguments);
    }

    //append to namespace Hole
       //properties
            //documentation = "A hole in an array"


//### public class InfinityAtom extends Atom

//The `Infinity` value

       //constructor()
       void AST_InfinityAtom__init(DEFAULT_ARGUMENTS){
         // auto call super class __init
         AST_Atom__init(this,argc,arguments);
          //.value = Infinity
          PROP(value_,this) = Infinity;
       }
    

//--------------
    // AST_BooleanAtom
    any AST_BooleanAtom; //Class AST_BooleanAtom extends AST_Atom
    
    //auto AST_BooleanAtom__init
    void AST_BooleanAtom__init(any this, len_t argc, any* arguments){
        // //auto call super class __init
        AST_Atom__init(this,argc,arguments);
    };
    
    //auto AST_BooleanAtom_newFromObject
    inline any AST_BooleanAtom_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_BooleanAtom,argc,arguments);
    }

    //append to namespace InfinityAtom
       //properties
            //documentation = "The `Infinity` value"


//### public class BooleanAtom extends Atom

//Base class for booleans

      //do nothing
      //do nothing
      ;
    

//--------------
    // AST_FalseAtom
    any AST_FalseAtom; //Class AST_FalseAtom extends AST_BooleanAtom
    
    
    //auto AST_FalseAtom_newFromObject
    inline any AST_FalseAtom_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_FalseAtom,argc,arguments);
    }


    //append to namespace Boolean
       //properties
            //documentation = "Base class for booleans"


//### public class FalseAtom extends BooleanAtom

//The `false` atom

        //constructor()
        void AST_FalseAtom__init(DEFAULT_ARGUMENTS){
          // auto call super class __init
          AST_BooleanAtom__init(this,argc,arguments);
          //.value = undefined // (sic) ported from UglifyJS code as 2014-8-3
          PROP(value_,this) = undefined; // (sic) ported from UglifyJS code as 2014-8-3
        }
    

//--------------
    // AST_TrueAtom
    any AST_TrueAtom; //Class AST_TrueAtom extends AST_BooleanAtom
    
    
    //auto AST_TrueAtom_newFromObject
    inline any AST_TrueAtom_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_TrueAtom,argc,arguments);
    }

    //append to namespace FalseAtom
       //properties
            //documentation = "The `false` atom"


//### public class TrueAtom extends BooleanAtom

//The `true` atom

       //constructor()
       void AST_TrueAtom__init(DEFAULT_ARGUMENTS){
         // auto call super class __init
         AST_BooleanAtom__init(this,argc,arguments);
          //.value = undefined // (sic) ported from UglifyJS code as 2014-8-3
          PROP(value_,this) = undefined; // (sic) ported from UglifyJS code as 2014-8-3
       }
    

//--------------
    // AST_TreeWalker
    any AST_TreeWalker; //Class AST_TreeWalker
    
    //auto AST_TreeWalker_newFromObject
    inline any AST_TreeWalker_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(AST_TreeWalker,argc,arguments);
    }

    //append to namespace TrueAtom
       //properties
            //documentation = "The `true` atom"


//## -----[ TreeWalker ]-----

    //class TreeWalker

      //properties
        //visit: Function
        //stack: array
      ;

      //constructor(callback) 
      void AST_TreeWalker__init(DEFAULT_ARGUMENTS){
        
        // define named params
        var callback= argc? arguments[0] : undefined;
        //---------
        //this.visit = callback;
        PROP(visit_,this) = callback;
        //this.stack = [];
        PROP(stack_,this) = new(Array,0,NULL);
      }

      //method _visit(node) //, descend:function) 
      any AST_TreeWalker__visit(DEFAULT_ARGUMENTS){
            assert(_instanceof(this,AST_TreeWalker));
            //---------
            // define named params
            var node= argc? arguments[0] : undefined;
            //---------
            //this.stack.push(node)
            __call(push_,PROP(stack_,this),1,(any_arr){node
           });
            //var ret = this.visit.call(node) /*, descend ? function(){
            var ret = __apply(PROP(visit_,this),node,0,NULL)
           ;
                //descend.call(node);
            //} : noop);
            //if (!ret and descend) {
                //descend.call(node);
            //}
            //*/
            //this.stack.pop();
            __call(pop_,PROP(stack_,this),0,NULL);
            //return ret;
            return ret;
      return undefined;
      }

      //method parent(n) 
      any AST_TreeWalker_parent(DEFAULT_ARGUMENTS){
            assert(_instanceof(this,AST_TreeWalker));
            //---------
            // define named params
            var n= argc? arguments[0] : undefined;
            //---------
            //return this.stack[this.stack.length - 2 - (n or 0)];
            var ___or26=undefined;
            return ITEM(_length(PROP(stack_,this)) - 2 - (_anyToNumber((_anyToBool(___or26=n)? ___or26 : any_number(0)))),PROP(stack_,this));
      return undefined;
      }

      //method push(node) 
      any AST_TreeWalker_push(DEFAULT_ARGUMENTS){
            assert(_instanceof(this,AST_TreeWalker));
            //---------
            // define named params
            var node= argc? arguments[0] : undefined;
            //---------
            //this.stack.push(node)
            __call(push_,PROP(stack_,this),1,(any_arr){node
           });
      return undefined;
      }

      //method pop()
      any AST_TreeWalker_pop(DEFAULT_ARGUMENTS){
            assert(_instanceof(this,AST_TreeWalker));
            //---------
            //return this.stack.pop();
            return __call(pop_,PROP(stack_,this),0,NULL);
      return undefined;
      }

      //method self
      any AST_TreeWalker_self(DEFAULT_ARGUMENTS){
            assert(_instanceof(this,AST_TreeWalker));
            //---------
            //return this.stack[this.stack.length - 1];
            return ITEM(_length(PROP(stack_,this)) - 1,PROP(stack_,this));
      return undefined;
      }

      //method find_parent(type) 
      any AST_TreeWalker_find_parent(DEFAULT_ARGUMENTS){
            assert(_instanceof(this,AST_TreeWalker));
            //---------
            // define named params
            var type= argc? arguments[0] : undefined;
            //---------
            //var stack = this.stack
            var stack = PROP(stack_,this)
           ;
            //for i = stack.length-1 while i>=0, i--
            for(int64_t i=_length(stack) - 1; i >= 0; i--){
                //var x = stack[i]
                var x = ITEM(i,stack)
               ;
                //if x instanceof type, return x
                if (_instanceof(x,type)) {return x;};
            };// end for i
            
      return undefined;
      }


      //method has_directive(type) 
      any AST_TreeWalker_has_directive(DEFAULT_ARGUMENTS){
            assert(_instanceof(this,AST_TreeWalker));
            //---------
            // define named params
            var type= argc? arguments[0] : undefined;
            //---------
            //return this.find_parent(Scope).has_directive(type);
            return __call(has_directive_,METHOD(find_parent_,this)(this,1,(any_arr){AST_Scope
           }),1,(any_arr){type
          });
      return undefined;
      }

      //method in_boolean_context
      any AST_TreeWalker_in_boolean_context(DEFAULT_ARGUMENTS){
            assert(_instanceof(this,AST_TreeWalker));
            //---------
            //var stack = this.stack;
            var stack = PROP(stack_,this)
           ;
            //var i = stack.length, self = stack[--i];
            var i = any_number(_length(stack))
               , self = ITEM(--i.value.number,stack)
           ;
            //while i > 0
            while(_anyToNumber(i) > 0){

                //var p = stack[--i];
                var p = ITEM(--i.value.number,stack)
               ;

                //declare valid p.expression
                
                //declare valid p.operator 
                
                //declare valid p.condition
                

                //if ((p instanceof IfStatement   and p.condition is self) or
                    var ___or30=undefined;
                    var ___or29=undefined;
                    var ___or28=undefined;
                var ___or27=undefined;
                if ((_anyToBool((_anyToBool(___or30=(_anyToBool(___or29=(_anyToBool(___or28=(_anyToBool(___or27=(any_number(_instanceof(p,AST_IfStatement) && __is(PROP(condition_,p),self))))? ___or27 : (any_number(_instanceof(p,AST_Conditional) && __is(PROP(condition_,p),self)))))? ___or28 : (any_number(_instanceof(p,AST_DWLoop) && __is(PROP(condition_,p),self)))))? ___or29 : (any_number(_instanceof(p,AST_ForStatement) && __is(PROP(condition_,p),self)))))? ___or30 : (any_number(_instanceof(p,AST_UnaryPrefix) && __is(PROP(operator_,p),any_LTR("!")) && __is(PROP(expression_,p),self)))))))  {
                    //(p instanceof Conditional   and p.condition is self) or
                    //(p instanceof DWLoop        and p.condition is self) or
                    //(p instanceof ForStatement  and p.condition is self) or
                    //(p instanceof UnaryPrefix   and p.operator is "!" and p.expression is self))

                      //return true;
                      return true;
                };

                //if ( not (p instanceof Binary and (p.operator is "and" or p.operator is "||")))
                var ___or31=undefined;
                if ((!((_instanceof(p,AST_Binary) && (_anyToBool((_anyToBool(___or31=any_number(__is(PROP(operator_,p),any_LTR("and"))))? ___or31 : any_number(__is(PROP(operator_,p),any_LTR("||"))))))))))  {
                    //return false;
                    return false;
                };

                //self = p;
                self = p;
            };// end loop
            
      return undefined;
      }


      //method loopcontrol_target(label) 
      any AST_TreeWalker_loopcontrol_target(DEFAULT_ARGUMENTS){
            assert(_instanceof(this,AST_TreeWalker));
            //---------
            // define named params
            var label= argc? arguments[0] : undefined;
            //---------
            //var stack = this.stack;
            var stack = PROP(stack_,this)
           ;

            //if label 
            if (_anyToBool(label))  {
              //for i = stack.length-1 down to 0
              int64_t _end3=0;
              for(int64_t i=_length(stack) - 1; i>=_end3; i--){
                //var x:LabeledStatement = stack[i];
                var x = ITEM(i,stack)
               ;
                //if x instanceof LabeledStatement and x.label.name is label.name
                if (_instanceof(x,AST_LabeledStatement) && __is(PROP(name_,PROP(label_,x)),PROP(name_,label)))  {
                    //return x.body;
                    return PROP(body_,x);
                };
              };// end for i
              
            }

            //else 
            
            else {
              //for i = stack.length-1 down to 0
              int64_t _end4=0;
              for(int64_t i=_length(stack) - 1; i>=_end4; i--){
                //var x:Switch = stack[i];
                var x = ITEM(i,stack)
               ;
                //if x instanceof Switch or x instanceof IterationStatement
                var ___or32=undefined;
                if (_anyToBool((_anyToBool(___or32=any_number(_instanceof(x,AST_Switch)))? ___or32 : any_number(_instanceof(x,AST_IterationStatement)))))  {
                    //return x
                    return x;
                };
              };// end for i
              
            };
      return undefined;
      }
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
      ;
      any AST_Seq_cons(DEFAULT_ARGUMENTS){
          
          // define named params
          var x, y;
          x=y=undefined;
          switch(argc){
            case 2:y=arguments[1];
            case 1:x=arguments[0];
          }
          //---------
          var seq = new(AST_Seq,1,(any_arr){x
         })
         ;
          PROP(car_,seq) = x;
          PROP(cdr_,seq) = y;
          return seq;
      return undefined;
      }
      any AST_Seq_from_array(DEFAULT_ARGUMENTS){
          
          // define named params
          var array= argc? arguments[0] : undefined;
          //---------
          if ((__is(any_number(_length(array)),any_number(0)))) {return null;};
          if ((__is(any_number(_length(array)),any_number(1)))) {return __call(clone_,ITEM(0,array),0,NULL);};
          var list = null
         ;
          int64_t _end5=0;
          for(int64_t i=_length(array); i>=_end5; i--){
              list = AST_Seq_cons(undefined,2,(any_arr){ITEM(i,array)
                 , list
             });
          };// end for i
          var p = list
         ;
          while(_anyToBool(p)){
              if ((_anyToBool(PROP(cdr_,p)) && !(_anyToBool(PROP(cdr_,PROP(cdr_,p))))))  {
                  PROP(cdr_,p) = PROP(car_,PROP(cdr_,p));
                  break;
              };
              p = PROP(cdr_,p);
          };// end loop
          return list;
      return undefined;
      }
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
    
       ;
//------------------
void AST__namespaceInit(void){
        AST_Token =_newClass("AST_Token", AST_Token__init, sizeof(struct AST_Token_s), Object);
        _declareMethods(AST_Token, AST_Token_METHODS);
        _declareProps(AST_Token, AST_Token_PROPS, sizeof AST_Token_PROPS);
    
        AST_Node =_newClass("AST_Node", AST_Node__init, sizeof(struct AST_Node_s), Object);
        _declareMethods(AST_Node, AST_Node_METHODS);
        _declareProps(AST_Node, AST_Node_PROPS, sizeof AST_Node_PROPS);
    
        AST_Statement =_newClass("AST_Statement", AST_Statement__init, sizeof(struct AST_Statement_s), AST_Node);
        _declareMethods(AST_Statement, AST_Statement_METHODS);
        _declareProps(AST_Statement, AST_Statement_PROPS, sizeof AST_Statement_PROPS);
    
        AST_Debugger =_newClass("AST_Debugger", AST_Debugger__init, sizeof(struct AST_Debugger_s), AST_Statement);
        _declareMethods(AST_Debugger, AST_Debugger_METHODS);
        _declareProps(AST_Debugger, AST_Debugger_PROPS, sizeof AST_Debugger_PROPS);
    
        AST_Directive =_newClass("AST_Directive", AST_Directive__init, sizeof(struct AST_Directive_s), AST_Statement);
        _declareMethods(AST_Directive, AST_Directive_METHODS);
        _declareProps(AST_Directive, AST_Directive_PROPS, sizeof AST_Directive_PROPS);
    
        AST_SimpleStatement =_newClass("AST_SimpleStatement", AST_SimpleStatement__init, sizeof(struct AST_SimpleStatement_s), AST_Statement);
        _declareMethods(AST_SimpleStatement, AST_SimpleStatement_METHODS);
        _declareProps(AST_SimpleStatement, AST_SimpleStatement_PROPS, sizeof AST_SimpleStatement_PROPS);
    
        AST_Block =_newClass("AST_Block", AST_Block__init, sizeof(struct AST_Block_s), AST_Statement);
        _declareMethods(AST_Block, AST_Block_METHODS);
        _declareProps(AST_Block, AST_Block_PROPS, sizeof AST_Block_PROPS);
    
        AST_BlockStatement =_newClass("AST_BlockStatement", AST_BlockStatement__init, sizeof(struct AST_BlockStatement_s), AST_Block);
        _declareMethods(AST_BlockStatement, AST_BlockStatement_METHODS);
        _declareProps(AST_BlockStatement, AST_BlockStatement_PROPS, sizeof AST_BlockStatement_PROPS);
    
        AST_EmptyStatement =_newClass("AST_EmptyStatement", AST_EmptyStatement__init, sizeof(struct AST_EmptyStatement_s), AST_Statement);
        _declareMethods(AST_EmptyStatement, AST_EmptyStatement_METHODS);
        _declareProps(AST_EmptyStatement, AST_EmptyStatement_PROPS, sizeof AST_EmptyStatement_PROPS);
    
        AST_StatementWithBody =_newClass("AST_StatementWithBody", AST_StatementWithBody__init, sizeof(struct AST_StatementWithBody_s), AST_Statement);
        _declareMethods(AST_StatementWithBody, AST_StatementWithBody_METHODS);
        _declareProps(AST_StatementWithBody, AST_StatementWithBody_PROPS, sizeof AST_StatementWithBody_PROPS);
    
        AST_LabeledStatement =_newClass("AST_LabeledStatement", AST_LabeledStatement__init, sizeof(struct AST_LabeledStatement_s), AST_StatementWithBody);
        _declareMethods(AST_LabeledStatement, AST_LabeledStatement_METHODS);
        _declareProps(AST_LabeledStatement, AST_LabeledStatement_PROPS, sizeof AST_LabeledStatement_PROPS);
    
        AST_IterationStatement =_newClass("AST_IterationStatement", AST_IterationStatement__init, sizeof(struct AST_IterationStatement_s), AST_StatementWithBody);
        _declareMethods(AST_IterationStatement, AST_IterationStatement_METHODS);
        _declareProps(AST_IterationStatement, AST_IterationStatement_PROPS, sizeof AST_IterationStatement_PROPS);
    
        AST_DWLoop =_newClass("AST_DWLoop", AST_DWLoop__init, sizeof(struct AST_DWLoop_s), AST_IterationStatement);
        _declareMethods(AST_DWLoop, AST_DWLoop_METHODS);
        _declareProps(AST_DWLoop, AST_DWLoop_PROPS, sizeof AST_DWLoop_PROPS);
    
        AST_DoStatement =_newClass("AST_DoStatement", AST_DoStatement__init, sizeof(struct AST_DoStatement_s), AST_DWLoop);
        _declareMethods(AST_DoStatement, AST_DoStatement_METHODS);
        _declareProps(AST_DoStatement, AST_DoStatement_PROPS, sizeof AST_DoStatement_PROPS);
    
        AST_WhileStatement =_newClass("AST_WhileStatement", AST_WhileStatement__init, sizeof(struct AST_WhileStatement_s), AST_DWLoop);
        _declareMethods(AST_WhileStatement, AST_WhileStatement_METHODS);
        _declareProps(AST_WhileStatement, AST_WhileStatement_PROPS, sizeof AST_WhileStatement_PROPS);
    
        AST_ForStatement =_newClass("AST_ForStatement", AST_ForStatement__init, sizeof(struct AST_ForStatement_s), AST_IterationStatement);
        _declareMethods(AST_ForStatement, AST_ForStatement_METHODS);
        _declareProps(AST_ForStatement, AST_ForStatement_PROPS, sizeof AST_ForStatement_PROPS);
    
        AST_ForIn =_newClass("AST_ForIn", AST_ForIn__init, sizeof(struct AST_ForIn_s), AST_IterationStatement);
        _declareMethods(AST_ForIn, AST_ForIn_METHODS);
        _declareProps(AST_ForIn, AST_ForIn_PROPS, sizeof AST_ForIn_PROPS);
    
        AST_WithStatement =_newClass("AST_WithStatement", AST_WithStatement__init, sizeof(struct AST_WithStatement_s), AST_StatementWithBody);
        _declareMethods(AST_WithStatement, AST_WithStatement_METHODS);
        _declareProps(AST_WithStatement, AST_WithStatement_PROPS, sizeof AST_WithStatement_PROPS);
    
        AST_Scope =_newClass("AST_Scope", AST_Scope__init, sizeof(struct AST_Scope_s), AST_Block);
        _declareMethods(AST_Scope, AST_Scope_METHODS);
        _declareProps(AST_Scope, AST_Scope_PROPS, sizeof AST_Scope_PROPS);
    
        AST_Toplevel =_newClass("AST_Toplevel", AST_Toplevel__init, sizeof(struct AST_Toplevel_s), AST_Scope);
        _declareMethods(AST_Toplevel, AST_Toplevel_METHODS);
        _declareProps(AST_Toplevel, AST_Toplevel_PROPS, sizeof AST_Toplevel_PROPS);
    
        AST_Lambda =_newClass("AST_Lambda", AST_Lambda__init, sizeof(struct AST_Lambda_s), AST_Scope);
        _declareMethods(AST_Lambda, AST_Lambda_METHODS);
        _declareProps(AST_Lambda, AST_Lambda_PROPS, sizeof AST_Lambda_PROPS);
    
        AST_Accessor =_newClass("AST_Accessor", AST_Accessor__init, sizeof(struct AST_Accessor_s), AST_Lambda);
        _declareMethods(AST_Accessor, AST_Accessor_METHODS);
        _declareProps(AST_Accessor, AST_Accessor_PROPS, sizeof AST_Accessor_PROPS);
    
        AST_FunctionExpression =_newClass("AST_FunctionExpression", AST_FunctionExpression__init, sizeof(struct AST_FunctionExpression_s), AST_Lambda);
        _declareMethods(AST_FunctionExpression, AST_FunctionExpression_METHODS);
        _declareProps(AST_FunctionExpression, AST_FunctionExpression_PROPS, sizeof AST_FunctionExpression_PROPS);
    
        AST_Defun =_newClass("AST_Defun", AST_Defun__init, sizeof(struct AST_Defun_s), AST_Lambda);
        _declareMethods(AST_Defun, AST_Defun_METHODS);
        _declareProps(AST_Defun, AST_Defun_PROPS, sizeof AST_Defun_PROPS);
    
        AST_Jump =_newClass("AST_Jump", AST_Jump__init, sizeof(struct AST_Jump_s), AST_Statement);
        _declareMethods(AST_Jump, AST_Jump_METHODS);
        _declareProps(AST_Jump, AST_Jump_PROPS, sizeof AST_Jump_PROPS);
    
        AST_ExitStatement =_newClass("AST_ExitStatement", AST_ExitStatement__init, sizeof(struct AST_ExitStatement_s), AST_Jump);
        _declareMethods(AST_ExitStatement, AST_ExitStatement_METHODS);
        _declareProps(AST_ExitStatement, AST_ExitStatement_PROPS, sizeof AST_ExitStatement_PROPS);
    
        AST_ReturnStatement =_newClass("AST_ReturnStatement", AST_ReturnStatement__init, sizeof(struct AST_ReturnStatement_s), AST_ExitStatement);
        _declareMethods(AST_ReturnStatement, AST_ReturnStatement_METHODS);
        _declareProps(AST_ReturnStatement, AST_ReturnStatement_PROPS, sizeof AST_ReturnStatement_PROPS);
    
        AST_ThrowStatement =_newClass("AST_ThrowStatement", AST_ThrowStatement__init, sizeof(struct AST_ThrowStatement_s), AST_ExitStatement);
        _declareMethods(AST_ThrowStatement, AST_ThrowStatement_METHODS);
        _declareProps(AST_ThrowStatement, AST_ThrowStatement_PROPS, sizeof AST_ThrowStatement_PROPS);
    
        AST_LoopControl =_newClass("AST_LoopControl", AST_LoopControl__init, sizeof(struct AST_LoopControl_s), AST_Jump);
        _declareMethods(AST_LoopControl, AST_LoopControl_METHODS);
        _declareProps(AST_LoopControl, AST_LoopControl_PROPS, sizeof AST_LoopControl_PROPS);
    
        AST_BreakStatement =_newClass("AST_BreakStatement", AST_BreakStatement__init, sizeof(struct AST_BreakStatement_s), AST_LoopControl);
        _declareMethods(AST_BreakStatement, AST_BreakStatement_METHODS);
        _declareProps(AST_BreakStatement, AST_BreakStatement_PROPS, sizeof AST_BreakStatement_PROPS);
    
        AST_ContinueStatement =_newClass("AST_ContinueStatement", AST_ContinueStatement__init, sizeof(struct AST_ContinueStatement_s), AST_LoopControl);
        _declareMethods(AST_ContinueStatement, AST_ContinueStatement_METHODS);
        _declareProps(AST_ContinueStatement, AST_ContinueStatement_PROPS, sizeof AST_ContinueStatement_PROPS);
    
        AST_IfStatement =_newClass("AST_IfStatement", AST_IfStatement__init, sizeof(struct AST_IfStatement_s), AST_StatementWithBody);
        _declareMethods(AST_IfStatement, AST_IfStatement_METHODS);
        _declareProps(AST_IfStatement, AST_IfStatement_PROPS, sizeof AST_IfStatement_PROPS);
    
        AST_Switch =_newClass("AST_Switch", AST_Switch__init, sizeof(struct AST_Switch_s), AST_Block);
        _declareMethods(AST_Switch, AST_Switch_METHODS);
        _declareProps(AST_Switch, AST_Switch_PROPS, sizeof AST_Switch_PROPS);
    
        AST_SwitchBranch =_newClass("AST_SwitchBranch", AST_SwitchBranch__init, sizeof(struct AST_SwitchBranch_s), AST_Block);
        _declareMethods(AST_SwitchBranch, AST_SwitchBranch_METHODS);
        _declareProps(AST_SwitchBranch, AST_SwitchBranch_PROPS, sizeof AST_SwitchBranch_PROPS);
    
        AST_Default =_newClass("AST_Default", AST_Default__init, sizeof(struct AST_Default_s), AST_SwitchBranch);
        _declareMethods(AST_Default, AST_Default_METHODS);
        _declareProps(AST_Default, AST_Default_PROPS, sizeof AST_Default_PROPS);
    
        AST_Case =_newClass("AST_Case", AST_Case__init, sizeof(struct AST_Case_s), AST_SwitchBranch);
        _declareMethods(AST_Case, AST_Case_METHODS);
        _declareProps(AST_Case, AST_Case_PROPS, sizeof AST_Case_PROPS);
    
        AST_Try =_newClass("AST_Try", AST_Try__init, sizeof(struct AST_Try_s), AST_Block);
        _declareMethods(AST_Try, AST_Try_METHODS);
        _declareProps(AST_Try, AST_Try_PROPS, sizeof AST_Try_PROPS);
    
        AST_Catch =_newClass("AST_Catch", AST_Catch__init, sizeof(struct AST_Catch_s), AST_Block);
        _declareMethods(AST_Catch, AST_Catch_METHODS);
        _declareProps(AST_Catch, AST_Catch_PROPS, sizeof AST_Catch_PROPS);
    
        AST_Finally =_newClass("AST_Finally", AST_Finally__init, sizeof(struct AST_Finally_s), AST_Block);
        _declareMethods(AST_Finally, AST_Finally_METHODS);
        _declareProps(AST_Finally, AST_Finally_PROPS, sizeof AST_Finally_PROPS);
    
        AST_Definitions =_newClass("AST_Definitions", AST_Definitions__init, sizeof(struct AST_Definitions_s), AST_Statement);
        _declareMethods(AST_Definitions, AST_Definitions_METHODS);
        _declareProps(AST_Definitions, AST_Definitions_PROPS, sizeof AST_Definitions_PROPS);
    
        AST_Var =_newClass("AST_Var", AST_Var__init, sizeof(struct AST_Var_s), AST_Definitions);
        _declareMethods(AST_Var, AST_Var_METHODS);
        _declareProps(AST_Var, AST_Var_PROPS, sizeof AST_Var_PROPS);
    
        AST_Const =_newClass("AST_Const", AST_Const__init, sizeof(struct AST_Const_s), AST_Definitions);
        _declareMethods(AST_Const, AST_Const_METHODS);
        _declareProps(AST_Const, AST_Const_PROPS, sizeof AST_Const_PROPS);
    
        AST_VarDef =_newClass("AST_VarDef", AST_VarDef__init, sizeof(struct AST_VarDef_s), AST_Node);
        _declareMethods(AST_VarDef, AST_VarDef_METHODS);
        _declareProps(AST_VarDef, AST_VarDef_PROPS, sizeof AST_VarDef_PROPS);
    
        AST_CallStatement =_newClass("AST_CallStatement", AST_CallStatement__init, sizeof(struct AST_CallStatement_s), AST_Node);
        _declareMethods(AST_CallStatement, AST_CallStatement_METHODS);
        _declareProps(AST_CallStatement, AST_CallStatement_PROPS, sizeof AST_CallStatement_PROPS);
    
        AST_New =_newClass("AST_New", AST_New__init, sizeof(struct AST_New_s), AST_CallStatement);
        _declareMethods(AST_New, AST_New_METHODS);
        _declareProps(AST_New, AST_New_PROPS, sizeof AST_New_PROPS);
    
        AST_Seq =_newClass("AST_Seq", AST_Seq__init, sizeof(struct AST_Seq_s), AST_Node);
        _declareMethods(AST_Seq, AST_Seq_METHODS);
        _declareProps(AST_Seq, AST_Seq_PROPS, sizeof AST_Seq_PROPS);
    
        AST_PropAccess =_newClass("AST_PropAccess", AST_PropAccess__init, sizeof(struct AST_PropAccess_s), AST_Node);
        _declareMethods(AST_PropAccess, AST_PropAccess_METHODS);
        _declareProps(AST_PropAccess, AST_PropAccess_PROPS, sizeof AST_PropAccess_PROPS);
    
        AST_Dot =_newClass("AST_Dot", AST_Dot__init, sizeof(struct AST_Dot_s), AST_PropAccess);
        _declareMethods(AST_Dot, AST_Dot_METHODS);
        _declareProps(AST_Dot, AST_Dot_PROPS, sizeof AST_Dot_PROPS);
    
        AST_Sub =_newClass("AST_Sub", AST_Sub__init, sizeof(struct AST_Sub_s), AST_PropAccess);
        _declareMethods(AST_Sub, AST_Sub_METHODS);
        _declareProps(AST_Sub, AST_Sub_PROPS, sizeof AST_Sub_PROPS);
    
        AST_Unary =_newClass("AST_Unary", AST_Unary__init, sizeof(struct AST_Unary_s), AST_Node);
        _declareMethods(AST_Unary, AST_Unary_METHODS);
        _declareProps(AST_Unary, AST_Unary_PROPS, sizeof AST_Unary_PROPS);
    
        AST_UnaryPrefix =_newClass("AST_UnaryPrefix", AST_UnaryPrefix__init, sizeof(struct AST_UnaryPrefix_s), AST_Unary);
        _declareMethods(AST_UnaryPrefix, AST_UnaryPrefix_METHODS);
        _declareProps(AST_UnaryPrefix, AST_UnaryPrefix_PROPS, sizeof AST_UnaryPrefix_PROPS);
    
        AST_UnaryPostfix =_newClass("AST_UnaryPostfix", AST_UnaryPostfix__init, sizeof(struct AST_UnaryPostfix_s), AST_Unary);
        _declareMethods(AST_UnaryPostfix, AST_UnaryPostfix_METHODS);
        _declareProps(AST_UnaryPostfix, AST_UnaryPostfix_PROPS, sizeof AST_UnaryPostfix_PROPS);
    
        AST_Binary =_newClass("AST_Binary", AST_Binary__init, sizeof(struct AST_Binary_s), AST_Node);
        _declareMethods(AST_Binary, AST_Binary_METHODS);
        _declareProps(AST_Binary, AST_Binary_PROPS, sizeof AST_Binary_PROPS);
    
        AST_Conditional =_newClass("AST_Conditional", AST_Conditional__init, sizeof(struct AST_Conditional_s), AST_Node);
        _declareMethods(AST_Conditional, AST_Conditional_METHODS);
        _declareProps(AST_Conditional, AST_Conditional_PROPS, sizeof AST_Conditional_PROPS);
    
        AST_Assign =_newClass("AST_Assign", AST_Assign__init, sizeof(struct AST_Assign_s), AST_Binary);
        _declareMethods(AST_Assign, AST_Assign_METHODS);
        _declareProps(AST_Assign, AST_Assign_PROPS, sizeof AST_Assign_PROPS);
    
        AST_ArrayLiteral =_newClass("AST_ArrayLiteral", AST_ArrayLiteral__init, sizeof(struct AST_ArrayLiteral_s), AST_Node);
        _declareMethods(AST_ArrayLiteral, AST_ArrayLiteral_METHODS);
        _declareProps(AST_ArrayLiteral, AST_ArrayLiteral_PROPS, sizeof AST_ArrayLiteral_PROPS);
    
        AST_ObjectLiteral =_newClass("AST_ObjectLiteral", AST_ObjectLiteral__init, sizeof(struct AST_ObjectLiteral_s), AST_Node);
        _declareMethods(AST_ObjectLiteral, AST_ObjectLiteral_METHODS);
        _declareProps(AST_ObjectLiteral, AST_ObjectLiteral_PROPS, sizeof AST_ObjectLiteral_PROPS);
    
        AST_ObjectProperty =_newClass("AST_ObjectProperty", AST_ObjectProperty__init, sizeof(struct AST_ObjectProperty_s), AST_Node);
        _declareMethods(AST_ObjectProperty, AST_ObjectProperty_METHODS);
        _declareProps(AST_ObjectProperty, AST_ObjectProperty_PROPS, sizeof AST_ObjectProperty_PROPS);
    
        AST_ObjectKeyVal =_newClass("AST_ObjectKeyVal", AST_ObjectKeyVal__init, sizeof(struct AST_ObjectKeyVal_s), AST_ObjectProperty);
        _declareMethods(AST_ObjectKeyVal, AST_ObjectKeyVal_METHODS);
        _declareProps(AST_ObjectKeyVal, AST_ObjectKeyVal_PROPS, sizeof AST_ObjectKeyVal_PROPS);
    
        AST_ObjectSetter =_newClass("AST_ObjectSetter", AST_ObjectSetter__init, sizeof(struct AST_ObjectSetter_s), AST_ObjectProperty);
        _declareMethods(AST_ObjectSetter, AST_ObjectSetter_METHODS);
        _declareProps(AST_ObjectSetter, AST_ObjectSetter_PROPS, sizeof AST_ObjectSetter_PROPS);
    
        AST_ObjectGetter =_newClass("AST_ObjectGetter", AST_ObjectGetter__init, sizeof(struct AST_ObjectGetter_s), AST_ObjectProperty);
        _declareMethods(AST_ObjectGetter, AST_ObjectGetter_METHODS);
        _declareProps(AST_ObjectGetter, AST_ObjectGetter_PROPS, sizeof AST_ObjectGetter_PROPS);
    
        AST_Symbol =_newClass("AST_Symbol", AST_Symbol__init, sizeof(struct AST_Symbol_s), AST_Node);
        _declareMethods(AST_Symbol, AST_Symbol_METHODS);
        _declareProps(AST_Symbol, AST_Symbol_PROPS, sizeof AST_Symbol_PROPS);
    
        AST_SymbolAccessor =_newClass("AST_SymbolAccessor", AST_SymbolAccessor__init, sizeof(struct AST_SymbolAccessor_s), AST_Symbol);
        _declareMethods(AST_SymbolAccessor, AST_SymbolAccessor_METHODS);
        _declareProps(AST_SymbolAccessor, AST_SymbolAccessor_PROPS, sizeof AST_SymbolAccessor_PROPS);
    
        AST_SymbolDeclaration =_newClass("AST_SymbolDeclaration", AST_SymbolDeclaration__init, sizeof(struct AST_SymbolDeclaration_s), AST_Symbol);
        _declareMethods(AST_SymbolDeclaration, AST_SymbolDeclaration_METHODS);
        _declareProps(AST_SymbolDeclaration, AST_SymbolDeclaration_PROPS, sizeof AST_SymbolDeclaration_PROPS);
    
        AST_SymbolVar =_newClass("AST_SymbolVar", AST_SymbolVar__init, sizeof(struct AST_SymbolVar_s), AST_SymbolDeclaration);
        _declareMethods(AST_SymbolVar, AST_SymbolVar_METHODS);
        _declareProps(AST_SymbolVar, AST_SymbolVar_PROPS, sizeof AST_SymbolVar_PROPS);
    
        AST_SymbolConst =_newClass("AST_SymbolConst", AST_SymbolConst__init, sizeof(struct AST_SymbolConst_s), AST_SymbolDeclaration);
        _declareMethods(AST_SymbolConst, AST_SymbolConst_METHODS);
        _declareProps(AST_SymbolConst, AST_SymbolConst_PROPS, sizeof AST_SymbolConst_PROPS);
    
        AST_SymbolFunarg =_newClass("AST_SymbolFunarg", AST_SymbolFunarg__init, sizeof(struct AST_SymbolFunarg_s), AST_SymbolVar);
        _declareMethods(AST_SymbolFunarg, AST_SymbolFunarg_METHODS);
        _declareProps(AST_SymbolFunarg, AST_SymbolFunarg_PROPS, sizeof AST_SymbolFunarg_PROPS);
    
        AST_SymbolDefun =_newClass("AST_SymbolDefun", AST_SymbolDefun__init, sizeof(struct AST_SymbolDefun_s), AST_SymbolDeclaration);
        _declareMethods(AST_SymbolDefun, AST_SymbolDefun_METHODS);
        _declareProps(AST_SymbolDefun, AST_SymbolDefun_PROPS, sizeof AST_SymbolDefun_PROPS);
    
        AST_SymbolLambda =_newClass("AST_SymbolLambda", AST_SymbolLambda__init, sizeof(struct AST_SymbolLambda_s), AST_SymbolDeclaration);
        _declareMethods(AST_SymbolLambda, AST_SymbolLambda_METHODS);
        _declareProps(AST_SymbolLambda, AST_SymbolLambda_PROPS, sizeof AST_SymbolLambda_PROPS);
    
        AST_SymbolCatch =_newClass("AST_SymbolCatch", AST_SymbolCatch__init, sizeof(struct AST_SymbolCatch_s), AST_SymbolDeclaration);
        _declareMethods(AST_SymbolCatch, AST_SymbolCatch_METHODS);
        _declareProps(AST_SymbolCatch, AST_SymbolCatch_PROPS, sizeof AST_SymbolCatch_PROPS);
    
        AST_Label =_newClass("AST_Label", AST_Label__init, sizeof(struct AST_Label_s), AST_Symbol);
        _declareMethods(AST_Label, AST_Label_METHODS);
        _declareProps(AST_Label, AST_Label_PROPS, sizeof AST_Label_PROPS);
    
        AST_SymbolRef =_newClass("AST_SymbolRef", AST_SymbolRef__init, sizeof(struct AST_SymbolRef_s), AST_Symbol);
        _declareMethods(AST_SymbolRef, AST_SymbolRef_METHODS);
        _declareProps(AST_SymbolRef, AST_SymbolRef_PROPS, sizeof AST_SymbolRef_PROPS);
    
        AST_LabelRef =_newClass("AST_LabelRef", AST_LabelRef__init, sizeof(struct AST_LabelRef_s), AST_Symbol);
        _declareMethods(AST_LabelRef, AST_LabelRef_METHODS);
        _declareProps(AST_LabelRef, AST_LabelRef_PROPS, sizeof AST_LabelRef_PROPS);
    
        AST_This =_newClass("AST_This", AST_This__init, sizeof(struct AST_This_s), AST_Symbol);
        _declareMethods(AST_This, AST_This_METHODS);
        _declareProps(AST_This, AST_This_PROPS, sizeof AST_This_PROPS);
    
        AST_Constant =_newClass("AST_Constant", AST_Constant__init, sizeof(struct AST_Constant_s), AST_Node);
        _declareMethods(AST_Constant, AST_Constant_METHODS);
        _declareProps(AST_Constant, AST_Constant_PROPS, sizeof AST_Constant_PROPS);
    
        AST_StringLiteral =_newClass("AST_StringLiteral", AST_StringLiteral__init, sizeof(struct AST_StringLiteral_s), AST_Constant);
        _declareMethods(AST_StringLiteral, AST_StringLiteral_METHODS);
        _declareProps(AST_StringLiteral, AST_StringLiteral_PROPS, sizeof AST_StringLiteral_PROPS);
    
        AST_NumberLiteral =_newClass("AST_NumberLiteral", AST_NumberLiteral__init, sizeof(struct AST_NumberLiteral_s), AST_Constant);
        _declareMethods(AST_NumberLiteral, AST_NumberLiteral_METHODS);
        _declareProps(AST_NumberLiteral, AST_NumberLiteral_PROPS, sizeof AST_NumberLiteral_PROPS);
    
        AST_RegExpLiteral =_newClass("AST_RegExpLiteral", AST_RegExpLiteral__init, sizeof(struct AST_RegExpLiteral_s), AST_Constant);
        _declareMethods(AST_RegExpLiteral, AST_RegExpLiteral_METHODS);
        _declareProps(AST_RegExpLiteral, AST_RegExpLiteral_PROPS, sizeof AST_RegExpLiteral_PROPS);
    
        AST_Atom =_newClass("AST_Atom", AST_Atom__init, sizeof(struct AST_Atom_s), AST_Constant);
        _declareMethods(AST_Atom, AST_Atom_METHODS);
        _declareProps(AST_Atom, AST_Atom_PROPS, sizeof AST_Atom_PROPS);
    
        AST_NullAtom =_newClass("AST_NullAtom", AST_NullAtom__init, sizeof(struct AST_NullAtom_s), AST_Atom);
        _declareMethods(AST_NullAtom, AST_NullAtom_METHODS);
        _declareProps(AST_NullAtom, AST_NullAtom_PROPS, sizeof AST_NullAtom_PROPS);
    
        AST_NaNAtom =_newClass("AST_NaNAtom", AST_NaNAtom__init, sizeof(struct AST_NaNAtom_s), AST_Atom);
        _declareMethods(AST_NaNAtom, AST_NaNAtom_METHODS);
        _declareProps(AST_NaNAtom, AST_NaNAtom_PROPS, sizeof AST_NaNAtom_PROPS);
    
        AST_UndefinedAtom =_newClass("AST_UndefinedAtom", AST_UndefinedAtom__init, sizeof(struct AST_UndefinedAtom_s), AST_Atom);
        _declareMethods(AST_UndefinedAtom, AST_UndefinedAtom_METHODS);
        _declareProps(AST_UndefinedAtom, AST_UndefinedAtom_PROPS, sizeof AST_UndefinedAtom_PROPS);
    
        AST_Hole =_newClass("AST_Hole", AST_Hole__init, sizeof(struct AST_Hole_s), AST_Atom);
        _declareMethods(AST_Hole, AST_Hole_METHODS);
        _declareProps(AST_Hole, AST_Hole_PROPS, sizeof AST_Hole_PROPS);
    
        AST_InfinityAtom =_newClass("AST_InfinityAtom", AST_InfinityAtom__init, sizeof(struct AST_InfinityAtom_s), AST_Atom);
        _declareMethods(AST_InfinityAtom, AST_InfinityAtom_METHODS);
        _declareProps(AST_InfinityAtom, AST_InfinityAtom_PROPS, sizeof AST_InfinityAtom_PROPS);
    
        AST_BooleanAtom =_newClass("AST_BooleanAtom", AST_BooleanAtom__init, sizeof(struct AST_BooleanAtom_s), AST_Atom);
        _declareMethods(AST_BooleanAtom, AST_BooleanAtom_METHODS);
        _declareProps(AST_BooleanAtom, AST_BooleanAtom_PROPS, sizeof AST_BooleanAtom_PROPS);
    
        AST_FalseAtom =_newClass("AST_FalseAtom", AST_FalseAtom__init, sizeof(struct AST_FalseAtom_s), AST_BooleanAtom);
        _declareMethods(AST_FalseAtom, AST_FalseAtom_METHODS);
        _declareProps(AST_FalseAtom, AST_FalseAtom_PROPS, sizeof AST_FalseAtom_PROPS);
    
        AST_TrueAtom =_newClass("AST_TrueAtom", AST_TrueAtom__init, sizeof(struct AST_TrueAtom_s), AST_BooleanAtom);
        _declareMethods(AST_TrueAtom, AST_TrueAtom_METHODS);
        _declareProps(AST_TrueAtom, AST_TrueAtom_PROPS, sizeof AST_TrueAtom_PROPS);
    
        AST_TreeWalker =_newClass("AST_TreeWalker", AST_TreeWalker__init, sizeof(struct AST_TreeWalker_s), Object);
        _declareMethods(AST_TreeWalker, AST_TreeWalker_METHODS);
        _declareProps(AST_TreeWalker, AST_TreeWalker_PROPS, sizeof AST_TreeWalker_PROPS);
    
};


//-------------------------
void AST__moduleInit(void){
    AST__namespaceInit();
};
