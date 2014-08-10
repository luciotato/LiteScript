#ifndef AST_C__H
#define AST_C__H
#include "_dispatcher.h"
//-------------------------
//Module AST
//-------------------------
extern void AST__moduleInit(void);
    

//--------------
    // AST_Token
    any AST_Token; //Class AST_Token
    typedef struct AST_Token_s * AST_Token_ptr;
    typedef struct AST_Token_s {
        //Token
        any file;
        any comments_before;
        any nlb;
        any endpos;
        any pos;
        any col;
        any line;
        any value;
        any type;
    
    } AST_Token_s;
    
    extern void AST_Token__init(DEFAULT_ARGUMENTS);
    extern any AST_Token_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_Node
    any AST_Node; //Class AST_Node
    typedef struct AST_Node_s * AST_Node_ptr;
    typedef struct AST_Node_s {
        //Node
        any endpos;
        any start;
    
    } AST_Node_s;
    
    extern void AST_Node__init(DEFAULT_ARGUMENTS);
    extern any AST_Node_newFromObject(DEFAULT_ARGUMENTS);
    extern any AST_Node_clone(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_Statement
    any AST_Statement; //Class AST_Statement extends AST_Node
    
    typedef struct AST_Statement_s * AST_Statement_ptr;
    typedef struct AST_Statement_s {
        //Node
        any endpos;
        any start;
        //Statement
    
    } AST_Statement_s;
    
    extern void AST_Statement__init(DEFAULT_ARGUMENTS);
    extern any AST_Statement_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_Debugger
    any AST_Debugger; //Class AST_Debugger extends AST_Statement
    
    typedef struct AST_Debugger_s * AST_Debugger_ptr;
    typedef struct AST_Debugger_s {
        //Node
        any endpos;
        any start;
        //Statement
        //Debugger
    
    } AST_Debugger_s;
    
    extern void AST_Debugger__init(DEFAULT_ARGUMENTS);
    extern any AST_Debugger_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_Directive
    any AST_Directive; //Class AST_Directive extends AST_Statement
    
    typedef struct AST_Directive_s * AST_Directive_ptr;
    typedef struct AST_Directive_s {
        //Node
        any endpos;
        any start;
        //Statement
        //Directive
        any scope;
        any value;
    
    } AST_Directive_s;
    
    extern void AST_Directive__init(DEFAULT_ARGUMENTS);
    extern any AST_Directive_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_SimpleStatement
    any AST_SimpleStatement; //Class AST_SimpleStatement extends AST_Statement
    
    typedef struct AST_SimpleStatement_s * AST_SimpleStatement_ptr;
    typedef struct AST_SimpleStatement_s {
        //Node
        any endpos;
        any start;
        //Statement
        //SimpleStatement
        any body;
    
    } AST_SimpleStatement_s;
    
    extern void AST_SimpleStatement__init(DEFAULT_ARGUMENTS);
    extern any AST_SimpleStatement_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_Block
    any AST_Block; //Class AST_Block extends AST_Statement
    
    typedef struct AST_Block_s * AST_Block_ptr;
    typedef struct AST_Block_s {
        //Node
        any endpos;
        any start;
        //Statement
        //Block
        any body;
    
    } AST_Block_s;
    
    extern void AST_Block__init(DEFAULT_ARGUMENTS);
    extern any AST_Block_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_BlockStatement
    any AST_BlockStatement; //Class AST_BlockStatement extends AST_Block
    
    typedef struct AST_BlockStatement_s * AST_BlockStatement_ptr;
    typedef struct AST_BlockStatement_s {
        //Node
        any endpos;
        any start;
        //Statement
        //Block
        any body;
        //BlockStatement
    
    } AST_BlockStatement_s;
    
    extern void AST_BlockStatement__init(DEFAULT_ARGUMENTS);
    extern any AST_BlockStatement_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_EmptyStatement
    any AST_EmptyStatement; //Class AST_EmptyStatement extends AST_Statement
    
    typedef struct AST_EmptyStatement_s * AST_EmptyStatement_ptr;
    typedef struct AST_EmptyStatement_s {
        //Node
        any endpos;
        any start;
        //Statement
        //EmptyStatement
    
    } AST_EmptyStatement_s;
    
    extern void AST_EmptyStatement__init(DEFAULT_ARGUMENTS);
    extern any AST_EmptyStatement_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_StatementWithBody
    any AST_StatementWithBody; //Class AST_StatementWithBody extends AST_Statement
    
    typedef struct AST_StatementWithBody_s * AST_StatementWithBody_ptr;
    typedef struct AST_StatementWithBody_s {
        //Node
        any endpos;
        any start;
        //Statement
        //StatementWithBody
        any body;
    
    } AST_StatementWithBody_s;
    
    extern void AST_StatementWithBody__init(DEFAULT_ARGUMENTS);
    extern any AST_StatementWithBody_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_LabeledStatement
    any AST_LabeledStatement; //Class AST_LabeledStatement extends AST_StatementWithBody
    
    typedef struct AST_LabeledStatement_s * AST_LabeledStatement_ptr;
    typedef struct AST_LabeledStatement_s {
        //Node
        any endpos;
        any start;
        //Statement
        //StatementWithBody
        any body;
        //LabeledStatement
        any label;
    
    } AST_LabeledStatement_s;
    
    extern void AST_LabeledStatement__init(DEFAULT_ARGUMENTS);
    extern any AST_LabeledStatement_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_IterationStatement
    any AST_IterationStatement; //Class AST_IterationStatement extends AST_StatementWithBody
    
    typedef struct AST_IterationStatement_s * AST_IterationStatement_ptr;
    typedef struct AST_IterationStatement_s {
        //Node
        any endpos;
        any start;
        //Statement
        //StatementWithBody
        any body;
        //IterationStatement
    
    } AST_IterationStatement_s;
    
    extern void AST_IterationStatement__init(DEFAULT_ARGUMENTS);
    extern any AST_IterationStatement_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_DWLoop
    any AST_DWLoop; //Class AST_DWLoop extends AST_IterationStatement
    
    typedef struct AST_DWLoop_s * AST_DWLoop_ptr;
    typedef struct AST_DWLoop_s {
        //Node
        any endpos;
        any start;
        //Statement
        //StatementWithBody
        any body;
        //IterationStatement
        //DWLoop
        any condition;
    
    } AST_DWLoop_s;
    
    extern void AST_DWLoop__init(DEFAULT_ARGUMENTS);
    extern any AST_DWLoop_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_DoStatement
    any AST_DoStatement; //Class AST_DoStatement extends AST_DWLoop
    
    typedef struct AST_DoStatement_s * AST_DoStatement_ptr;
    typedef struct AST_DoStatement_s {
        //Node
        any endpos;
        any start;
        //Statement
        //StatementWithBody
        any body;
        //IterationStatement
        //DWLoop
        any condition;
        //DoStatement
    
    } AST_DoStatement_s;
    
    extern void AST_DoStatement__init(DEFAULT_ARGUMENTS);
    extern any AST_DoStatement_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_WhileStatement
    any AST_WhileStatement; //Class AST_WhileStatement extends AST_DWLoop
    
    typedef struct AST_WhileStatement_s * AST_WhileStatement_ptr;
    typedef struct AST_WhileStatement_s {
        //Node
        any endpos;
        any start;
        //Statement
        //StatementWithBody
        any body;
        //IterationStatement
        //DWLoop
        any condition;
        //WhileStatement
    
    } AST_WhileStatement_s;
    
    extern void AST_WhileStatement__init(DEFAULT_ARGUMENTS);
    extern any AST_WhileStatement_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_ForStatement
    any AST_ForStatement; //Class AST_ForStatement extends AST_IterationStatement
    
    typedef struct AST_ForStatement_s * AST_ForStatement_ptr;
    typedef struct AST_ForStatement_s {
        //Node
        any endpos;
        any start;
        //Statement
        //StatementWithBody
        any body;
        //IterationStatement
        //ForStatement
        any step;
        any condition;
        any init;
    
    } AST_ForStatement_s;
    
    extern void AST_ForStatement__init(DEFAULT_ARGUMENTS);
    extern any AST_ForStatement_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_ForIn
    any AST_ForIn; //Class AST_ForIn extends AST_IterationStatement
    
    typedef struct AST_ForIn_s * AST_ForIn_ptr;
    typedef struct AST_ForIn_s {
        //Node
        any endpos;
        any start;
        //Statement
        //StatementWithBody
        any body;
        //IterationStatement
        //ForIn
        any object;
        any name;
        any init;
    
    } AST_ForIn_s;
    
    extern void AST_ForIn__init(DEFAULT_ARGUMENTS);
    extern any AST_ForIn_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_WithStatement
    any AST_WithStatement; //Class AST_WithStatement extends AST_StatementWithBody
    
    typedef struct AST_WithStatement_s * AST_WithStatement_ptr;
    typedef struct AST_WithStatement_s {
        //Node
        any endpos;
        any start;
        //Statement
        //StatementWithBody
        any body;
        //WithStatement
        any expression;
    
    } AST_WithStatement_s;
    
    extern void AST_WithStatement__init(DEFAULT_ARGUMENTS);
    extern any AST_WithStatement_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_Scope
    any AST_Scope; //Class AST_Scope extends AST_Block
    
    typedef struct AST_Scope_s * AST_Scope_ptr;
    typedef struct AST_Scope_s {
        //Node
        any endpos;
        any start;
        //Statement
        //Block
        any body;
        //Scope
        any cname;
        any enclosed;
        any parent_scope;
        any uses_eval;
        any uses_with;
        any functions;
        any variables;
        any directives;
    
    } AST_Scope_s;
    
    extern void AST_Scope__init(DEFAULT_ARGUMENTS);
    extern any AST_Scope_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_Toplevel
    any AST_Toplevel; //Class AST_Toplevel extends AST_Scope
    
    typedef struct AST_Toplevel_s * AST_Toplevel_ptr;
    typedef struct AST_Toplevel_s {
        //Node
        any endpos;
        any start;
        //Statement
        //Block
        any body;
        //Scope
        any cname;
        any enclosed;
        any parent_scope;
        any uses_eval;
        any uses_with;
        any functions;
        any variables;
        any directives;
        //Toplevel
        any globals;
    
    } AST_Toplevel_s;
    
    extern void AST_Toplevel__init(DEFAULT_ARGUMENTS);
    extern any AST_Toplevel_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_Lambda
    any AST_Lambda; //Class AST_Lambda extends AST_Scope
    
    typedef struct AST_Lambda_s * AST_Lambda_ptr;
    typedef struct AST_Lambda_s {
        //Node
        any endpos;
        any start;
        //Statement
        //Block
        any body;
        //Scope
        any cname;
        any enclosed;
        any parent_scope;
        any uses_eval;
        any uses_with;
        any functions;
        any variables;
        any directives;
        //Lambda
        any uses_arguments;
        any argnames;
        any name;
    
    } AST_Lambda_s;
    
    extern void AST_Lambda__init(DEFAULT_ARGUMENTS);
    extern any AST_Lambda_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_Accessor
    any AST_Accessor; //Class AST_Accessor extends AST_Lambda
    
    typedef struct AST_Accessor_s * AST_Accessor_ptr;
    typedef struct AST_Accessor_s {
        //Node
        any endpos;
        any start;
        //Statement
        //Block
        any body;
        //Scope
        any cname;
        any enclosed;
        any parent_scope;
        any uses_eval;
        any uses_with;
        any functions;
        any variables;
        any directives;
        //Lambda
        any uses_arguments;
        any argnames;
        any name;
        //Accessor
    
    } AST_Accessor_s;
    
    extern void AST_Accessor__init(DEFAULT_ARGUMENTS);
    extern any AST_Accessor_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_FunctionExpression
    any AST_FunctionExpression; //Class AST_FunctionExpression extends AST_Lambda
    
    typedef struct AST_FunctionExpression_s * AST_FunctionExpression_ptr;
    typedef struct AST_FunctionExpression_s {
        //Node
        any endpos;
        any start;
        //Statement
        //Block
        any body;
        //Scope
        any cname;
        any enclosed;
        any parent_scope;
        any uses_eval;
        any uses_with;
        any functions;
        any variables;
        any directives;
        //Lambda
        any uses_arguments;
        any argnames;
        any name;
        //FunctionExpression
    
    } AST_FunctionExpression_s;
    
    extern void AST_FunctionExpression__init(DEFAULT_ARGUMENTS);
    extern any AST_FunctionExpression_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_Defun
    any AST_Defun; //Class AST_Defun extends AST_Lambda
    
    typedef struct AST_Defun_s * AST_Defun_ptr;
    typedef struct AST_Defun_s {
        //Node
        any endpos;
        any start;
        //Statement
        //Block
        any body;
        //Scope
        any cname;
        any enclosed;
        any parent_scope;
        any uses_eval;
        any uses_with;
        any functions;
        any variables;
        any directives;
        //Lambda
        any uses_arguments;
        any argnames;
        any name;
        //Defun
    
    } AST_Defun_s;
    
    extern void AST_Defun__init(DEFAULT_ARGUMENTS);
    extern any AST_Defun_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_Jump
    any AST_Jump; //Class AST_Jump extends AST_Statement
    
    typedef struct AST_Jump_s * AST_Jump_ptr;
    typedef struct AST_Jump_s {
        //Node
        any endpos;
        any start;
        //Statement
        //Jump
    
    } AST_Jump_s;
    
    extern void AST_Jump__init(DEFAULT_ARGUMENTS);
    extern any AST_Jump_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_ExitStatement
    any AST_ExitStatement; //Class AST_ExitStatement extends AST_Jump
    
    typedef struct AST_ExitStatement_s * AST_ExitStatement_ptr;
    typedef struct AST_ExitStatement_s {
        //Node
        any endpos;
        any start;
        //Statement
        //Jump
        //ExitStatement
        any value;
    
    } AST_ExitStatement_s;
    
    extern void AST_ExitStatement__init(DEFAULT_ARGUMENTS);
    extern any AST_ExitStatement_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_ReturnStatement
    any AST_ReturnStatement; //Class AST_ReturnStatement extends AST_ExitStatement
    
    typedef struct AST_ReturnStatement_s * AST_ReturnStatement_ptr;
    typedef struct AST_ReturnStatement_s {
        //Node
        any endpos;
        any start;
        //Statement
        //Jump
        //ExitStatement
        any value;
        //ReturnStatement
    
    } AST_ReturnStatement_s;
    
    extern void AST_ReturnStatement__init(DEFAULT_ARGUMENTS);
    extern any AST_ReturnStatement_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_ThrowStatement
    any AST_ThrowStatement; //Class AST_ThrowStatement extends AST_ExitStatement
    
    typedef struct AST_ThrowStatement_s * AST_ThrowStatement_ptr;
    typedef struct AST_ThrowStatement_s {
        //Node
        any endpos;
        any start;
        //Statement
        //Jump
        //ExitStatement
        any value;
        //ThrowStatement
    
    } AST_ThrowStatement_s;
    
    extern void AST_ThrowStatement__init(DEFAULT_ARGUMENTS);
    extern any AST_ThrowStatement_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_LoopControl
    any AST_LoopControl; //Class AST_LoopControl extends AST_Jump
    
    typedef struct AST_LoopControl_s * AST_LoopControl_ptr;
    typedef struct AST_LoopControl_s {
        //Node
        any endpos;
        any start;
        //Statement
        //Jump
        //LoopControl
        any label;
    
    } AST_LoopControl_s;
    
    extern void AST_LoopControl__init(DEFAULT_ARGUMENTS);
    extern any AST_LoopControl_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_BreakStatement
    any AST_BreakStatement; //Class AST_BreakStatement extends AST_LoopControl
    
    typedef struct AST_BreakStatement_s * AST_BreakStatement_ptr;
    typedef struct AST_BreakStatement_s {
        //Node
        any endpos;
        any start;
        //Statement
        //Jump
        //LoopControl
        any label;
        //BreakStatement
    
    } AST_BreakStatement_s;
    
    extern void AST_BreakStatement__init(DEFAULT_ARGUMENTS);
    extern any AST_BreakStatement_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_ContinueStatement
    any AST_ContinueStatement; //Class AST_ContinueStatement extends AST_LoopControl
    
    typedef struct AST_ContinueStatement_s * AST_ContinueStatement_ptr;
    typedef struct AST_ContinueStatement_s {
        //Node
        any endpos;
        any start;
        //Statement
        //Jump
        //LoopControl
        any label;
        //ContinueStatement
    
    } AST_ContinueStatement_s;
    
    extern void AST_ContinueStatement__init(DEFAULT_ARGUMENTS);
    extern any AST_ContinueStatement_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_IfStatement
    any AST_IfStatement; //Class AST_IfStatement extends AST_StatementWithBody
    
    typedef struct AST_IfStatement_s * AST_IfStatement_ptr;
    typedef struct AST_IfStatement_s {
        //Node
        any endpos;
        any start;
        //Statement
        //StatementWithBody
        any body;
        //IfStatement
        any alternative;
        any condition;
    
    } AST_IfStatement_s;
    
    extern void AST_IfStatement__init(DEFAULT_ARGUMENTS);
    extern any AST_IfStatement_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_Switch
    any AST_Switch; //Class AST_Switch extends AST_Block
    
    typedef struct AST_Switch_s * AST_Switch_ptr;
    typedef struct AST_Switch_s {
        //Node
        any endpos;
        any start;
        //Statement
        //Block
        any body;
        //Switch
        any expression;
    
    } AST_Switch_s;
    
    extern void AST_Switch__init(DEFAULT_ARGUMENTS);
    extern any AST_Switch_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_SwitchBranch
    any AST_SwitchBranch; //Class AST_SwitchBranch extends AST_Block
    
    typedef struct AST_SwitchBranch_s * AST_SwitchBranch_ptr;
    typedef struct AST_SwitchBranch_s {
        //Node
        any endpos;
        any start;
        //Statement
        //Block
        any body;
        //SwitchBranch
    
    } AST_SwitchBranch_s;
    
    extern void AST_SwitchBranch__init(DEFAULT_ARGUMENTS);
    extern any AST_SwitchBranch_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_Default
    any AST_Default; //Class AST_Default extends AST_SwitchBranch
    
    typedef struct AST_Default_s * AST_Default_ptr;
    typedef struct AST_Default_s {
        //Node
        any endpos;
        any start;
        //Statement
        //Block
        any body;
        //SwitchBranch
        //Default
    
    } AST_Default_s;
    
    extern void AST_Default__init(DEFAULT_ARGUMENTS);
    extern any AST_Default_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_Case
    any AST_Case; //Class AST_Case extends AST_SwitchBranch
    
    typedef struct AST_Case_s * AST_Case_ptr;
    typedef struct AST_Case_s {
        //Node
        any endpos;
        any start;
        //Statement
        //Block
        any body;
        //SwitchBranch
        //Case
        any expression;
    
    } AST_Case_s;
    
    extern void AST_Case__init(DEFAULT_ARGUMENTS);
    extern any AST_Case_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_Try
    any AST_Try; //Class AST_Try extends AST_Block
    
    typedef struct AST_Try_s * AST_Try_ptr;
    typedef struct AST_Try_s {
        //Node
        any endpos;
        any start;
        //Statement
        //Block
        any body;
        //Try
        any bfinally;
        any bcatch;
    
    } AST_Try_s;
    
    extern void AST_Try__init(DEFAULT_ARGUMENTS);
    extern any AST_Try_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_Catch
    any AST_Catch; //Class AST_Catch extends AST_Block
    
    typedef struct AST_Catch_s * AST_Catch_ptr;
    typedef struct AST_Catch_s {
        //Node
        any endpos;
        any start;
        //Statement
        //Block
        any body;
        //Catch
        any argname;
    
    } AST_Catch_s;
    
    extern void AST_Catch__init(DEFAULT_ARGUMENTS);
    extern any AST_Catch_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_Finally
    any AST_Finally; //Class AST_Finally extends AST_Block
    
    typedef struct AST_Finally_s * AST_Finally_ptr;
    typedef struct AST_Finally_s {
        //Node
        any endpos;
        any start;
        //Statement
        //Block
        any body;
        //Finally
    
    } AST_Finally_s;
    
    extern void AST_Finally__init(DEFAULT_ARGUMENTS);
    extern any AST_Finally_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_Definitions
    any AST_Definitions; //Class AST_Definitions extends AST_Statement
    
    typedef struct AST_Definitions_s * AST_Definitions_ptr;
    typedef struct AST_Definitions_s {
        //Node
        any endpos;
        any start;
        //Statement
        //Definitions
        any definitions;
    
    } AST_Definitions_s;
    
    extern void AST_Definitions__init(DEFAULT_ARGUMENTS);
    extern any AST_Definitions_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_Var
    any AST_Var; //Class AST_Var extends AST_Definitions
    
    typedef struct AST_Var_s * AST_Var_ptr;
    typedef struct AST_Var_s {
        //Node
        any endpos;
        any start;
        //Statement
        //Definitions
        any definitions;
        //Var
    
    } AST_Var_s;
    
    extern void AST_Var__init(DEFAULT_ARGUMENTS);
    extern any AST_Var_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_Const
    any AST_Const; //Class AST_Const extends AST_Definitions
    
    typedef struct AST_Const_s * AST_Const_ptr;
    typedef struct AST_Const_s {
        //Node
        any endpos;
        any start;
        //Statement
        //Definitions
        any definitions;
        //Const
    
    } AST_Const_s;
    
    extern void AST_Const__init(DEFAULT_ARGUMENTS);
    extern any AST_Const_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_VarDef
    any AST_VarDef; //Class AST_VarDef extends AST_Node
    
    typedef struct AST_VarDef_s * AST_VarDef_ptr;
    typedef struct AST_VarDef_s {
        //Node
        any endpos;
        any start;
        //VarDef
        any value;
        any name;
    
    } AST_VarDef_s;
    
    extern void AST_VarDef__init(DEFAULT_ARGUMENTS);
    extern any AST_VarDef_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_CallStatement
    any AST_CallStatement; //Class AST_CallStatement extends AST_Node
    
    typedef struct AST_CallStatement_s * AST_CallStatement_ptr;
    typedef struct AST_CallStatement_s {
        //Node
        any endpos;
        any start;
        //CallStatement
        any args;
        any expression;
    
    } AST_CallStatement_s;
    
    extern void AST_CallStatement__init(DEFAULT_ARGUMENTS);
    extern any AST_CallStatement_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_New
    any AST_New; //Class AST_New extends AST_CallStatement
    
    typedef struct AST_New_s * AST_New_ptr;
    typedef struct AST_New_s {
        //Node
        any endpos;
        any start;
        //CallStatement
        any args;
        any expression;
        //New
    
    } AST_New_s;
    
    extern void AST_New__init(DEFAULT_ARGUMENTS);
    extern any AST_New_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_Seq
    any AST_Seq; //Class AST_Seq extends AST_Node
    
    typedef struct AST_Seq_s * AST_Seq_ptr;
    typedef struct AST_Seq_s {
        //Node
        any endpos;
        any start;
        //Seq
        any cdr;
        any car;
    
    } AST_Seq_s;
    
    extern void AST_Seq__init(DEFAULT_ARGUMENTS);
    extern any AST_Seq_newFromObject(DEFAULT_ARGUMENTS);
    extern any AST_Seq_to_array(DEFAULT_ARGUMENTS);
    extern any AST_Seq_add(DEFAULT_ARGUMENTS);
    extern any AST_Seq_cons(DEFAULT_ARGUMENTS); //class as namespace
    extern any AST_Seq_from_array(DEFAULT_ARGUMENTS); //class as namespace
      extern any AST_Seq_cons(DEFAULT_ARGUMENTS);
      extern any AST_Seq_from_array(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_PropAccess
    any AST_PropAccess; //Class AST_PropAccess extends AST_Node
    
    typedef struct AST_PropAccess_s * AST_PropAccess_ptr;
    typedef struct AST_PropAccess_s {
        //Node
        any endpos;
        any start;
        //PropAccess
        any prop;
        any expression;
    
    } AST_PropAccess_s;
    
    extern void AST_PropAccess__init(DEFAULT_ARGUMENTS);
    extern any AST_PropAccess_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_Dot
    any AST_Dot; //Class AST_Dot extends AST_PropAccess
    
    typedef struct AST_Dot_s * AST_Dot_ptr;
    typedef struct AST_Dot_s {
        //Node
        any endpos;
        any start;
        //PropAccess
        any prop;
        any expression;
        //Dot
    
    } AST_Dot_s;
    
    extern void AST_Dot__init(DEFAULT_ARGUMENTS);
    extern any AST_Dot_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_Sub
    any AST_Sub; //Class AST_Sub extends AST_PropAccess
    
    typedef struct AST_Sub_s * AST_Sub_ptr;
    typedef struct AST_Sub_s {
        //Node
        any endpos;
        any start;
        //PropAccess
        any prop;
        any expression;
        //Sub
    
    } AST_Sub_s;
    
    extern void AST_Sub__init(DEFAULT_ARGUMENTS);
    extern any AST_Sub_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_Unary
    any AST_Unary; //Class AST_Unary extends AST_Node
    
    typedef struct AST_Unary_s * AST_Unary_ptr;
    typedef struct AST_Unary_s {
        //Node
        any endpos;
        any start;
        //Unary
        any expression;
        any operator;
    
    } AST_Unary_s;
    
    extern void AST_Unary__init(DEFAULT_ARGUMENTS);
    extern any AST_Unary_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_UnaryPrefix
    any AST_UnaryPrefix; //Class AST_UnaryPrefix extends AST_Unary
    
    typedef struct AST_UnaryPrefix_s * AST_UnaryPrefix_ptr;
    typedef struct AST_UnaryPrefix_s {
        //Node
        any endpos;
        any start;
        //Unary
        any expression;
        any operator;
        //UnaryPrefix
    
    } AST_UnaryPrefix_s;
    
    extern void AST_UnaryPrefix__init(DEFAULT_ARGUMENTS);
    extern any AST_UnaryPrefix_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_UnaryPostfix
    any AST_UnaryPostfix; //Class AST_UnaryPostfix extends AST_Unary
    
    typedef struct AST_UnaryPostfix_s * AST_UnaryPostfix_ptr;
    typedef struct AST_UnaryPostfix_s {
        //Node
        any endpos;
        any start;
        //Unary
        any expression;
        any operator;
        //UnaryPostfix
    
    } AST_UnaryPostfix_s;
    
    extern void AST_UnaryPostfix__init(DEFAULT_ARGUMENTS);
    extern any AST_UnaryPostfix_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_Binary
    any AST_Binary; //Class AST_Binary extends AST_Node
    
    typedef struct AST_Binary_s * AST_Binary_ptr;
    typedef struct AST_Binary_s {
        //Node
        any endpos;
        any start;
        //Binary
        any right;
        any operator;
        any left;
    
    } AST_Binary_s;
    
    extern void AST_Binary__init(DEFAULT_ARGUMENTS);
    extern any AST_Binary_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_Conditional
    any AST_Conditional; //Class AST_Conditional extends AST_Node
    
    typedef struct AST_Conditional_s * AST_Conditional_ptr;
    typedef struct AST_Conditional_s {
        //Node
        any endpos;
        any start;
        //Conditional
        any alternative;
        any consequent;
        any condition;
    
    } AST_Conditional_s;
    
    extern void AST_Conditional__init(DEFAULT_ARGUMENTS);
    extern any AST_Conditional_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_Assign
    any AST_Assign; //Class AST_Assign extends AST_Binary
    
    typedef struct AST_Assign_s * AST_Assign_ptr;
    typedef struct AST_Assign_s {
        //Node
        any endpos;
        any start;
        //Binary
        any right;
        any operator;
        any left;
        //Assign
    
    } AST_Assign_s;
    
    extern void AST_Assign__init(DEFAULT_ARGUMENTS);
    extern any AST_Assign_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_ArrayLiteral
    any AST_ArrayLiteral; //Class AST_ArrayLiteral extends AST_Node
    
    typedef struct AST_ArrayLiteral_s * AST_ArrayLiteral_ptr;
    typedef struct AST_ArrayLiteral_s {
        //Node
        any endpos;
        any start;
        //ArrayLiteral
        any elements;
    
    } AST_ArrayLiteral_s;
    
    extern void AST_ArrayLiteral__init(DEFAULT_ARGUMENTS);
    extern any AST_ArrayLiteral_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_ObjectLiteral
    any AST_ObjectLiteral; //Class AST_ObjectLiteral extends AST_Node
    
    typedef struct AST_ObjectLiteral_s * AST_ObjectLiteral_ptr;
    typedef struct AST_ObjectLiteral_s {
        //Node
        any endpos;
        any start;
        //ObjectLiteral
        any props;
    
    } AST_ObjectLiteral_s;
    
    extern void AST_ObjectLiteral__init(DEFAULT_ARGUMENTS);
    extern any AST_ObjectLiteral_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_ObjectProperty
    any AST_ObjectProperty; //Class AST_ObjectProperty extends AST_Node
    
    typedef struct AST_ObjectProperty_s * AST_ObjectProperty_ptr;
    typedef struct AST_ObjectProperty_s {
        //Node
        any endpos;
        any start;
        //ObjectProperty
        any value;
        any key;
    
    } AST_ObjectProperty_s;
    
    extern void AST_ObjectProperty__init(DEFAULT_ARGUMENTS);
    extern any AST_ObjectProperty_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_ObjectKeyVal
    any AST_ObjectKeyVal; //Class AST_ObjectKeyVal extends AST_ObjectProperty
    
    typedef struct AST_ObjectKeyVal_s * AST_ObjectKeyVal_ptr;
    typedef struct AST_ObjectKeyVal_s {
        //Node
        any endpos;
        any start;
        //ObjectProperty
        any value;
        any key;
        //ObjectKeyVal
    
    } AST_ObjectKeyVal_s;
    
    extern void AST_ObjectKeyVal__init(DEFAULT_ARGUMENTS);
    extern any AST_ObjectKeyVal_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_ObjectSetter
    any AST_ObjectSetter; //Class AST_ObjectSetter extends AST_ObjectProperty
    
    typedef struct AST_ObjectSetter_s * AST_ObjectSetter_ptr;
    typedef struct AST_ObjectSetter_s {
        //Node
        any endpos;
        any start;
        //ObjectProperty
        any value;
        any key;
        //ObjectSetter
    
    } AST_ObjectSetter_s;
    
    extern void AST_ObjectSetter__init(DEFAULT_ARGUMENTS);
    extern any AST_ObjectSetter_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_ObjectGetter
    any AST_ObjectGetter; //Class AST_ObjectGetter extends AST_ObjectProperty
    
    typedef struct AST_ObjectGetter_s * AST_ObjectGetter_ptr;
    typedef struct AST_ObjectGetter_s {
        //Node
        any endpos;
        any start;
        //ObjectProperty
        any value;
        any key;
        //ObjectGetter
    
    } AST_ObjectGetter_s;
    
    extern void AST_ObjectGetter__init(DEFAULT_ARGUMENTS);
    extern any AST_ObjectGetter_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_Symbol
    any AST_Symbol; //Class AST_Symbol extends AST_Node
    
    typedef struct AST_Symbol_s * AST_Symbol_ptr;
    typedef struct AST_Symbol_s {
        //Node
        any endpos;
        any start;
        //Symbol
        any thedef;
        any name;
        any scope;
    
    } AST_Symbol_s;
    
    extern void AST_Symbol__init(DEFAULT_ARGUMENTS);
    extern any AST_Symbol_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_SymbolAccessor
    any AST_SymbolAccessor; //Class AST_SymbolAccessor extends AST_Symbol
    
    typedef struct AST_SymbolAccessor_s * AST_SymbolAccessor_ptr;
    typedef struct AST_SymbolAccessor_s {
        //Node
        any endpos;
        any start;
        //Symbol
        any thedef;
        any name;
        any scope;
        //SymbolAccessor
    
    } AST_SymbolAccessor_s;
    
    extern void AST_SymbolAccessor__init(DEFAULT_ARGUMENTS);
    extern any AST_SymbolAccessor_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_SymbolDeclaration
    any AST_SymbolDeclaration; //Class AST_SymbolDeclaration extends AST_Symbol
    
    typedef struct AST_SymbolDeclaration_s * AST_SymbolDeclaration_ptr;
    typedef struct AST_SymbolDeclaration_s {
        //Node
        any endpos;
        any start;
        //Symbol
        any thedef;
        any name;
        any scope;
        //SymbolDeclaration
        any init;
    
    } AST_SymbolDeclaration_s;
    
    extern void AST_SymbolDeclaration__init(DEFAULT_ARGUMENTS);
    extern any AST_SymbolDeclaration_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_SymbolVar
    any AST_SymbolVar; //Class AST_SymbolVar extends AST_SymbolDeclaration
    
    typedef struct AST_SymbolVar_s * AST_SymbolVar_ptr;
    typedef struct AST_SymbolVar_s {
        //Node
        any endpos;
        any start;
        //Symbol
        any thedef;
        any name;
        any scope;
        //SymbolDeclaration
        any init;
        //SymbolVar
    
    } AST_SymbolVar_s;
    
    extern void AST_SymbolVar__init(DEFAULT_ARGUMENTS);
    extern any AST_SymbolVar_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_SymbolConst
    any AST_SymbolConst; //Class AST_SymbolConst extends AST_SymbolDeclaration
    
    typedef struct AST_SymbolConst_s * AST_SymbolConst_ptr;
    typedef struct AST_SymbolConst_s {
        //Node
        any endpos;
        any start;
        //Symbol
        any thedef;
        any name;
        any scope;
        //SymbolDeclaration
        any init;
        //SymbolConst
    
    } AST_SymbolConst_s;
    
    extern void AST_SymbolConst__init(DEFAULT_ARGUMENTS);
    extern any AST_SymbolConst_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_SymbolFunarg
    any AST_SymbolFunarg; //Class AST_SymbolFunarg extends AST_SymbolVar
    
    typedef struct AST_SymbolFunarg_s * AST_SymbolFunarg_ptr;
    typedef struct AST_SymbolFunarg_s {
        //Node
        any endpos;
        any start;
        //Symbol
        any thedef;
        any name;
        any scope;
        //SymbolDeclaration
        any init;
        //SymbolVar
        //SymbolFunarg
    
    } AST_SymbolFunarg_s;
    
    extern void AST_SymbolFunarg__init(DEFAULT_ARGUMENTS);
    extern any AST_SymbolFunarg_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_SymbolDefun
    any AST_SymbolDefun; //Class AST_SymbolDefun extends AST_SymbolDeclaration
    
    typedef struct AST_SymbolDefun_s * AST_SymbolDefun_ptr;
    typedef struct AST_SymbolDefun_s {
        //Node
        any endpos;
        any start;
        //Symbol
        any thedef;
        any name;
        any scope;
        //SymbolDeclaration
        any init;
        //SymbolDefun
    
    } AST_SymbolDefun_s;
    
    extern void AST_SymbolDefun__init(DEFAULT_ARGUMENTS);
    extern any AST_SymbolDefun_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_SymbolLambda
    any AST_SymbolLambda; //Class AST_SymbolLambda extends AST_SymbolDeclaration
    
    typedef struct AST_SymbolLambda_s * AST_SymbolLambda_ptr;
    typedef struct AST_SymbolLambda_s {
        //Node
        any endpos;
        any start;
        //Symbol
        any thedef;
        any name;
        any scope;
        //SymbolDeclaration
        any init;
        //SymbolLambda
    
    } AST_SymbolLambda_s;
    
    extern void AST_SymbolLambda__init(DEFAULT_ARGUMENTS);
    extern any AST_SymbolLambda_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_SymbolCatch
    any AST_SymbolCatch; //Class AST_SymbolCatch extends AST_SymbolDeclaration
    
    typedef struct AST_SymbolCatch_s * AST_SymbolCatch_ptr;
    typedef struct AST_SymbolCatch_s {
        //Node
        any endpos;
        any start;
        //Symbol
        any thedef;
        any name;
        any scope;
        //SymbolDeclaration
        any init;
        //SymbolCatch
    
    } AST_SymbolCatch_s;
    
    extern void AST_SymbolCatch__init(DEFAULT_ARGUMENTS);
    extern any AST_SymbolCatch_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_Label
    any AST_Label; //Class AST_Label extends AST_Symbol
    
    typedef struct AST_Label_s * AST_Label_ptr;
    typedef struct AST_Label_s {
        //Node
        any endpos;
        any start;
        //Symbol
        any thedef;
        any name;
        any scope;
        //Label
        any references;
    
    } AST_Label_s;
    
    extern void AST_Label__init(DEFAULT_ARGUMENTS);
    extern any AST_Label_newFromObject(DEFAULT_ARGUMENTS);
    extern any AST_Label_initialize(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_SymbolRef
    any AST_SymbolRef; //Class AST_SymbolRef extends AST_Symbol
    
    typedef struct AST_SymbolRef_s * AST_SymbolRef_ptr;
    typedef struct AST_SymbolRef_s {
        //Node
        any endpos;
        any start;
        //Symbol
        any thedef;
        any name;
        any scope;
        //SymbolRef
    
    } AST_SymbolRef_s;
    
    extern void AST_SymbolRef__init(DEFAULT_ARGUMENTS);
    extern any AST_SymbolRef_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_LabelRef
    any AST_LabelRef; //Class AST_LabelRef extends AST_Symbol
    
    typedef struct AST_LabelRef_s * AST_LabelRef_ptr;
    typedef struct AST_LabelRef_s {
        //Node
        any endpos;
        any start;
        //Symbol
        any thedef;
        any name;
        any scope;
        //LabelRef
    
    } AST_LabelRef_s;
    
    extern void AST_LabelRef__init(DEFAULT_ARGUMENTS);
    extern any AST_LabelRef_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_This
    any AST_This; //Class AST_This extends AST_Symbol
    
    typedef struct AST_This_s * AST_This_ptr;
    typedef struct AST_This_s {
        //Node
        any endpos;
        any start;
        //Symbol
        any thedef;
        any name;
        any scope;
        //This
    
    } AST_This_s;
    
    extern void AST_This__init(DEFAULT_ARGUMENTS);
    extern any AST_This_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_Constant
    any AST_Constant; //Class AST_Constant extends AST_Node
    
    typedef struct AST_Constant_s * AST_Constant_ptr;
    typedef struct AST_Constant_s {
        //Node
        any endpos;
        any start;
        //Constant
        any value;
    
    } AST_Constant_s;
    
    extern void AST_Constant__init(DEFAULT_ARGUMENTS);
    extern any AST_Constant_newFromObject(DEFAULT_ARGUMENTS);
    extern any AST_Constant_getValue(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_StringLiteral
    any AST_StringLiteral; //Class AST_StringLiteral extends AST_Constant
    
    typedef struct AST_StringLiteral_s * AST_StringLiteral_ptr;
    typedef struct AST_StringLiteral_s {
        //Node
        any endpos;
        any start;
        //Constant
        any value;
        //StringLiteral
    
    } AST_StringLiteral_s;
    
    extern void AST_StringLiteral__init(DEFAULT_ARGUMENTS);
    extern any AST_StringLiteral_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_NumberLiteral
    any AST_NumberLiteral; //Class AST_NumberLiteral extends AST_Constant
    
    typedef struct AST_NumberLiteral_s * AST_NumberLiteral_ptr;
    typedef struct AST_NumberLiteral_s {
        //Node
        any endpos;
        any start;
        //Constant
        any value;
        //NumberLiteral
    
    } AST_NumberLiteral_s;
    
    extern void AST_NumberLiteral__init(DEFAULT_ARGUMENTS);
    extern any AST_NumberLiteral_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_RegExpLiteral
    any AST_RegExpLiteral; //Class AST_RegExpLiteral extends AST_Constant
    
    typedef struct AST_RegExpLiteral_s * AST_RegExpLiteral_ptr;
    typedef struct AST_RegExpLiteral_s {
        //Node
        any endpos;
        any start;
        //Constant
        any value;
        //RegExpLiteral
    
    } AST_RegExpLiteral_s;
    
    extern void AST_RegExpLiteral__init(DEFAULT_ARGUMENTS);
    extern any AST_RegExpLiteral_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_Atom
    any AST_Atom; //Class AST_Atom extends AST_Constant
    
    typedef struct AST_Atom_s * AST_Atom_ptr;
    typedef struct AST_Atom_s {
        //Node
        any endpos;
        any start;
        //Constant
        any value;
        //Atom
    
    } AST_Atom_s;
    
    extern void AST_Atom__init(DEFAULT_ARGUMENTS);
    extern any AST_Atom_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_NullAtom
    any AST_NullAtom; //Class AST_NullAtom extends AST_Atom
    
    typedef struct AST_NullAtom_s * AST_NullAtom_ptr;
    typedef struct AST_NullAtom_s {
        //Node
        any endpos;
        any start;
        //Constant
        any value;
        //Atom
        //NullAtom
    
    } AST_NullAtom_s;
    
    extern void AST_NullAtom__init(DEFAULT_ARGUMENTS);
    extern any AST_NullAtom_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_NaNAtom
    any AST_NaNAtom; //Class AST_NaNAtom extends AST_Atom
    
    typedef struct AST_NaNAtom_s * AST_NaNAtom_ptr;
    typedef struct AST_NaNAtom_s {
        //Node
        any endpos;
        any start;
        //Constant
        any value;
        //Atom
        //NaNAtom
    
    } AST_NaNAtom_s;
    
    extern void AST_NaNAtom__init(DEFAULT_ARGUMENTS);
    extern any AST_NaNAtom_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_UndefinedAtom
    any AST_UndefinedAtom; //Class AST_UndefinedAtom extends AST_Atom
    
    typedef struct AST_UndefinedAtom_s * AST_UndefinedAtom_ptr;
    typedef struct AST_UndefinedAtom_s {
        //Node
        any endpos;
        any start;
        //Constant
        any value;
        //Atom
        //UndefinedAtom
    
    } AST_UndefinedAtom_s;
    
    extern void AST_UndefinedAtom__init(DEFAULT_ARGUMENTS);
    extern any AST_UndefinedAtom_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_Hole
    any AST_Hole; //Class AST_Hole extends AST_Atom
    
    typedef struct AST_Hole_s * AST_Hole_ptr;
    typedef struct AST_Hole_s {
        //Node
        any endpos;
        any start;
        //Constant
        any value;
        //Atom
        //Hole
    
    } AST_Hole_s;
    
    extern void AST_Hole__init(DEFAULT_ARGUMENTS);
    extern any AST_Hole_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_InfinityAtom
    any AST_InfinityAtom; //Class AST_InfinityAtom extends AST_Atom
    
    typedef struct AST_InfinityAtom_s * AST_InfinityAtom_ptr;
    typedef struct AST_InfinityAtom_s {
        //Node
        any endpos;
        any start;
        //Constant
        any value;
        //Atom
        //InfinityAtom
    
    } AST_InfinityAtom_s;
    
    extern void AST_InfinityAtom__init(DEFAULT_ARGUMENTS);
    extern any AST_InfinityAtom_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_BooleanAtom
    any AST_BooleanAtom; //Class AST_BooleanAtom extends AST_Atom
    
    typedef struct AST_BooleanAtom_s * AST_BooleanAtom_ptr;
    typedef struct AST_BooleanAtom_s {
        //Node
        any endpos;
        any start;
        //Constant
        any value;
        //Atom
        //BooleanAtom
    
    } AST_BooleanAtom_s;
    
    extern void AST_BooleanAtom__init(DEFAULT_ARGUMENTS);
    extern any AST_BooleanAtom_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_FalseAtom
    any AST_FalseAtom; //Class AST_FalseAtom extends AST_BooleanAtom
    
    typedef struct AST_FalseAtom_s * AST_FalseAtom_ptr;
    typedef struct AST_FalseAtom_s {
        //Node
        any endpos;
        any start;
        //Constant
        any value;
        //Atom
        //BooleanAtom
        //FalseAtom
    
    } AST_FalseAtom_s;
    
    extern void AST_FalseAtom__init(DEFAULT_ARGUMENTS);
    extern any AST_FalseAtom_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_TrueAtom
    any AST_TrueAtom; //Class AST_TrueAtom extends AST_BooleanAtom
    
    typedef struct AST_TrueAtom_s * AST_TrueAtom_ptr;
    typedef struct AST_TrueAtom_s {
        //Node
        any endpos;
        any start;
        //Constant
        any value;
        //Atom
        //BooleanAtom
        //TrueAtom
    
    } AST_TrueAtom_s;
    
    extern void AST_TrueAtom__init(DEFAULT_ARGUMENTS);
    extern any AST_TrueAtom_newFromObject(DEFAULT_ARGUMENTS);
    

//--------------
    // AST_TreeWalker
    any AST_TreeWalker; //Class AST_TreeWalker
    typedef struct AST_TreeWalker_s * AST_TreeWalker_ptr;
    typedef struct AST_TreeWalker_s {
        //TreeWalker
        any visit;
        any stack;
    
    } AST_TreeWalker_s;
    
    extern void AST_TreeWalker__init(DEFAULT_ARGUMENTS);
    extern any AST_TreeWalker_newFromObject(DEFAULT_ARGUMENTS);
    extern any AST_TreeWalker__visit(DEFAULT_ARGUMENTS);
    extern any AST_TreeWalker_parent(DEFAULT_ARGUMENTS);
    extern any AST_TreeWalker_push(DEFAULT_ARGUMENTS);
    extern any AST_TreeWalker_pop(DEFAULT_ARGUMENTS);
    extern any AST_TreeWalker_self(DEFAULT_ARGUMENTS);
    extern any AST_TreeWalker_find_parent(DEFAULT_ARGUMENTS);
    extern any AST_TreeWalker_has_directive(DEFAULT_ARGUMENTS);
    extern any AST_TreeWalker_in_boolean_context(DEFAULT_ARGUMENTS);
    extern any AST_TreeWalker_loopcontrol_target(DEFAULT_ARGUMENTS);
#endif
