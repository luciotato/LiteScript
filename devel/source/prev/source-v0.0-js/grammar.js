(function () {
  var ast, ASTBase, KAL_RESERVED, KAL_RVALUE_OK, JS_RESERVED, JS_RVALUE_OK, KEYWORDS, RVALUE_OK, Nodes, v, ki$3, kobj$3;
  var __hasProp = {}.hasOwnProperty, __extends = function (child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; }
  var k$indexof = [].indexOf || function (item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
  /* Kal Grammar 
     ----------- 
      
     This file defines the parser grammar in the form of abstract syntax tree classes that inherit from `ASTBase`. Each class implements a `parse` method which, given the token stream, attempts to parse the stream as a particular language construct. 
      
     The end result of a call to `parse` is a tree of objects representing a language construct or an error if the particular class could not parse the token stream. 
      
     The `ast` module defines the base class for these grammar definitions along with utility methods to recursively create subtrees using these classes. 
      */
  ast = require('./ast');
  ASTBase = ast.ASTBase;
  /*  
     Reserved Words 
     ============== 
      
     Reserved words are used to determine whether assignments are valid (for example, you cannot assign a value to `if`). They are also used by other files for REPL autocompletion and by the `sugar` module to determine where to insert implicit parentheses. 
      
     **Words that are reserved in Kal and cannot be used for identifiers** 
      */
  KAL_RESERVED = ['constructor','true', 'false', 'yes', 'no', 'on', 'off', 'function', 'method', 'task', 'return', 'if', 'else', 'unless', 'except', 'when', 'otherwise', 'and', 'or', 'but', 'xor', 'not', 'nor', 'bitwise', 'mod', 'new', 'while', 'until', 'for', 'class', 'exists', 'doesnt', 'exist', 'is', 'isnt', 'inherits', 'from', 'nothing', 'empty', 'null', 'break', 'continue', 'try', 'catch', 'throw', 'raise', 'fail', 'with', 'arguments', 'of', 'in', 'instanceof', 'property', 'until', 'me', 'this', 'typeof', 'at', 'to'];
  /*  
     **Words that are reserved in Kal but can be used as r-values** 
      */
  KAL_RVALUE_OK = ['true', 'false', 'yes', 'no', 'on', 'off', 'me', 'this', 'super', 'arguments', 'none', 'nothing'];
  /*  
     **JavaScript reserved words** 
      
     Note `label` is not included because it can technically be used as an identifier (and it's more useful as a variable name than for its intended purpose). `undefined`, while technically assignable, is included here to avoid confusion and terribleness. 
      */
  JS_RESERVED = ['constructor','break', 'case', 'catch', 'continue', 'default', 'delete', 'do', 'else', 'finally', 'for', 'function', 'if', 'in', 'instanceof', 'new', 'return', 'switch', 'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'class', 'enum', 'export', 'extends', 'import', 'super', 'implements', 'interface', 'let', 'package', 'private', 'protected', 'public', 'static', 'yield', 'null', 'true', 'false', 'undefined', 'const'];
  /*  
     JavaScript words that are reserved but usable as rvalues. In the future `super` may get added to this list depending on the ES6 spec. 
      */
  JS_RVALUE_OK = ['this', 'null', 'true', 'false', 'undefined'];
  /*  
     JavaScript keywords are considered reserved in Kal. It's OK if these lists have some duplicates. 
      */
  KEYWORDS = KAL_RESERVED.concat(JS_RESERVED);
  RVALUE_OK = KAL_RVALUE_OK.concat(JS_RVALUE_OK);
  /*  
     Other modules use these values as well, such as the `sugar` module which checks for reserved words when generating implicit parentheses. 
      */
  exports.KEYWORDS = KEYWORDS;
  exports.RVALUE_OK = RVALUE_OK;

  /*  
     Block 
     ===== 
      
     `Block : NEWLINE INDENT Statment* DEDENT` 
      
     A code block (`Block`) is defined as a newline + indent followed by zero or more `Statment`s, then a dedent. In practice it is impossible to have an indent followed immediately by a dedent, so technically this class requires one or more `Statment`s. 
      */

  function Block() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(Block,ASTBase);

  Block.prototype.parse = function () {
    this.req('NEWLINE');
    this.lock();
    this.req('INDENT');
    this.lock();
    this.statements = [];
    while (!(this.opt('DEDENT'))) {
      this.statements.push(this.req(Statement));
      this.lock();
    }
  }

  /*  
     File 
     ==== 
      
     `File: Statement* EOF` 
      
     The `File` node shares some code generation with `Block`, so it is a subclass of `Block`. It is defined as zero or more statements followed by the end-of-file token. 
      */

  function File() {
    return Block.prototype.constructor.apply(this,arguments);
  }
  __extends(File,Block);

  File.prototype.parse = function () {
    this.lock();
    this.statements = [];
    while (!(this.opt('EOF'))) {
      this.statements.push(this.req(Statement));
      this.lock();
    }
  }

  /*  
     BlockWithoutIndent 
     ================== 
      
     `BlockWithoutIndent: NEWLINE Statement* (?=DEDENT|EOF) 
      
     `BlockWithoutIndent` is the same as a block (it shares generator code) but it does not require an indent. This is used for `wait for` statements to separate code after asynchronous calls into its own block. 
      */

  function BlockWithoutIndent() {
    return Block.prototype.constructor.apply(this,arguments);
  }
  __extends(BlockWithoutIndent,Block);

  BlockWithoutIndent.prototype.parse = function () {
    this.req('NEWLINE');
    this.lock();
    this.statements = [];
    while (!(this.opt('DEDENT', 'EOF'))) {
      this.statements.push(this.req(Statement));
      this.lock();
    }
    /*  
       Unsee the dedent (don't consume it) since it belongs to our parent block. 
        */
    this.ts.prev();
  }

  /*  
     Statement 
     ========= 
      
     `Statement: (BlankStatement|TryCatch|ClassDefinition|ReturnStatement|WaitForStatement|SimpleWaitForStatement|PauseForStatement|IfStatement|WhileStatement|ForStatement|ThrowStatement|SuperStatement|RunInParallelBlock|LoopControlStatement|AssignmentStatement|ExpressionStatement)` 
      
     The `Statement` node is a generic wrapper for the many types of statment/control constructs that are valid inside a block. Keeping these in one class helps keep the code maintainable when we add new node types. 
      
     The order in the `me.req` call is important here for two reasons. One, we want to keep the compiler fast by keeping commonly used constructs first if possible. This avoids unnecessary parsing steps. More importantly, things like `ExpressionStatement` need to go last because some `AssignmentStatement`s and other constructs can parse as valid `ExpressionStatement`s. 
      */

  function Statement() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(Statement,ASTBase);

  Statement.prototype.parse = function () {
    this.statement = this.req(BlankStatement, TryCatch, ClassDefinition, ReturnStatement, WaitForStatement, SimpleWaitForStatement, PauseForStatement, IfStatement, WhileStatement, ForStatement, ThrowStatement, SuperStatement, RunInParallelBlock, LoopControlStatement, DeleteStatement, AssignmentStatement, ExpressionStatement);
  }

  /*  
     LoopControlStatement 
     ==================== 
      
     `LoopControlStatement: ('break'|'continue')` 
      
     This handles the `break` and `continue` keywords. 
      */

  function LoopControlStatement() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(LoopControlStatement,ASTBase);

  LoopControlStatement.prototype.parse = function () {
    this.control = this.req_val('break', 'continue');
  }

  /*  
     ThrowStatement 
     ============== 
      
     `ThrowStatement: ('throw'|'raise'|('fail' 'with')) Expression WhenExpression?` 
      
     This handles `throw` and its synonyms followed by an expression and an optional tail conditional. 
      */

  function ThrowStatement() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(ThrowStatement,ASTBase);

  ThrowStatement.prototype.parse = function () {
    var specifier;
    specifier = this.req_val('throw', 'raise', 'fail');
    this.specifier = specifier;
    /*  
       At this point we lock because it is definitely a `throw` statement. Failure to parse the expression is a syntax error. 
        */
    this.lock();
    (specifier.value === 'fail') ? this.req_val('with') : void 0;
    this.expr = this.req(Expression);
    /*  
       We also need to check for tail conditionals (`throw "help" if error`) 
        */
    this.conditional = this.expr.transform_when_statement();
  }

  /*  
     ReturnStatement 
     =============== 
      
     `ReturnStatement: 'return' (Expression [',' Expression]*) WhenExpression?` 
      
     This handles simple `return`s, `return value`s, and returns with multiple return values. 
      */

  function ReturnStatement() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(ReturnStatement,ASTBase);

  ReturnStatement.prototype.parse = function () {
    var expr;
    this.req_val('return');
    /*  
       Definitely a return statement at this point. 
        */
    this.lock();
    /*  
       Check for a conditional here in case there is no return value (for example `return if a is 2`) 
        */
    this.conditional = this.opt(WhenExpression);
    /*  
       Returns can have multiple return values, so we keep grabbing expressions followed by commas. 
        */
    this.exprs = [];
    if (!((this.conditional != null))) {
      expr = this.opt(Expression);
      if ((expr != null)) {
        this.exprs.push(expr);
        while (this.opt_val(',')) {
          expr = this.req(Expression);
          this.exprs.push(expr);
        }
        /*  
           Check again for a conditional after the expression (`return a if a isnt 2`) 
            */
        if ((expr != null)) {
          this.conditional = expr.transform_when_statement();
        }
      }
    }
  }

  /*  
     DeleteStatement 
     =============== 
      
     `DeleteStatement: 'delete' ('property' IDENTIFIER|STRING)|('item'|'items' NoBracketListExpression) 'from' UnaryExpression` 
      
     This statement deletes a property or set of indexes from an object. It supports property deletion as a string (`delete property "a" from obj`) or identifier (`delete property a from obj`). It supports index deletion as for a number or array of numbered indexes (`delete item n from obj` or `delete items 1, 2 from obj` or `delete items 2 to 3 from obj`). 
      */

  function DeleteStatement() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(DeleteStatement,ASTBase);

  DeleteStatement.prototype.parse = function () {
    this.req_val('delete');
    this.lock();
    this.specifier = this.req_val('property', 'item', 'items');
    this.lock();
    if (this.specifier.value === 'property') {
      this.prop = this.req('STRING', 'IDENTIFIER');
    } else {
      this.item_list = this.req(NoBracketListExpression);
      (!((this.item_list.comprehension != null) || ((this.item_list.items != null) ? this.item_list.items.length : void 0) > 0)) ? this.error("Expected: index to delete") : void 0;
    }
    this.lock();
    this.req_val('from');
    this.from_var = this.req(UnaryExpression);
  }

  /*  
     IfStatement 
     =========== 
      
     `IfStatement: ('if'|'when'|'unless'|('except' 'when') Expression Block ElseStatement*` 
      
     Parses `if` statments and any attached `else`s or `else if`s (including synonyms). 
      */

  function IfStatement() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(IfStatement,ASTBase);

  IfStatement.prototype.parse = function () {
    var keep_going, got_raw_else, new_else;
    this.condition = this.req_val('if', 'unless', 'when', 'except');
    this.lock();
    (this.condition.value === 'except') ? this.req_val('when') : void 0;
    this.conditional = this.req(Expression);
    this.block = this.req(Block, Statement);
    /*  
       If statements can have multiple `else if`s, but nothing after the final `else` block. 
        */
    this.elses = [];
    keep_going = true;
    got_raw_else = false;
    while (keep_going) {
      new_else = this.opt(ElseStatement);
      if ((new_else == null)) {
        keep_going = false;
      } else {
        this.elses.push(new_else);
        if ((new_else.conditional == null)) {
          keep_going = false;
        }
      }
    }
  }

  /*  
     ElseStatement 
     ============= 
      
     `ElseStatement: ('else'|'otherwise') (('if'|'when') Expression) Block` 
      
     This covers `else` and `else if`. 
      */

  function ElseStatement() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(ElseStatement,ASTBase);

  ElseStatement.prototype.parse = function () {
    this.req_val('else', 'otherwise');
    this.lock();
    if (this.opt_val('if', 'when')) {
      this.conditional = this.req(Expression);
    }
    this.block = this.req(Block, Statement);
  }

  /*  
     WhileStatement 
     ============== 
      
     `WhileStatement: ('while'|'until') Expression Block` 
      
     While loops continue executing until the expression is true (or false in the case of `until` loops). 
      */

  function WhileStatement() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(WhileStatement,ASTBase);

  WhileStatement.prototype.parse = function () {
    this.specifier = this.req_val('while', 'until');
    this.lock();
    this.expr = this.req(Expression);
    this.block = this.req(Block);
  }

  /*  
     ForStatement 
     ============ 
      
     `ForStatement: 'for' ('parallel'|'series')? Variable ('at' Variable)? ('in'|'of') Expression Block` 
      
     For loops can iterate over object properties (`of`) or over an array (`in`). The `parallel` and `series` specifiers only apply if there are asynchronous constructs within the loop (the default is `series`). 
      
     The `at` keyword allows the user to specify an index variable for `for in` loops. 
      */

  function ForStatement() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(ForStatement,ASTBase);

  ForStatement.prototype.parse = function () {
    this.req_val('for');
    this.lock();
    this.execution_style = this.opt_val('parallel', 'series');
    this.iterant = this.req(Variable);
    if (this.opt_val('at')) {
      this.index_var = this.req(Variable);
    }
    this.type = this.req_val('in', 'of');
    if ((this.index_var != null) && this.type.value !== 'in') {
      this.error("index variables specified with 'at' are only allowed in 'for ... in' loops");
    }
    this.iterable = this.req(Expression);
    if (this.opt_val('to')) {
      this.iterable_to = this.req(Expression);
    }
    this.loop_block = this.req(Block);
  }

  /*  
     AssignmentStatement 
     =================== 
      
     `AssignmentStatement: UnaryExpression ('+'|'-'|'*'|'/')? '=' Expression WhenExpression?` 
      
     Note that the `UnaryExpression` must be a valid l-value. 
      */

  function AssignmentStatement() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(AssignmentStatement,ASTBase);

  AssignmentStatement.prototype.parse = function () {
    this.lvalue = this.req(UnaryExpression);
    /*  
       We mark this `UnaryExpression` as a possible l-value for later checks. 
        */
    this.lvalue.can_be_lvalue = true;
    this.assignOp = this.req('LITERAL');
    (!((k$indexof.call(['+', '-', '*', '/', '='], this.assignOp.value) >= 0))) ? this.error(("invalid operator " + (this.assignOp.value))) : void 0;
    if (this.assignOp.value !== '=') {
      this.req_val('=');
    }
    this.lock();
    /*  
       Now check that `lvalue` is indeed a valid l-value. 
        */
    (!(this.lvalue.is_lvalue())) ? this.error("invalid assignment - the left side must be assignable") : void 0;
    this.rvalue = this.req(Expression);
    this.conditional = this.rvalue.transform_when_statement();
  }

  /*  
     WaitForStatement 
     ================ 
      
     `WaitForStatement: 'safe'? 'wait' 'for' MultipleReturnValues 'from' Expression WhenExpression? BlockWithoutIndent` 
      
     The `wait for` statement pauses execution asynchronously and waits for the `Expression` to call back. Note that the `Expression` must be a function call. A `WaitForStatement` can optionally be marked `safe` indicating the expression does not use an error callback argument (like node's `http.get`) 
      */

  function WaitForStatement() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(WaitForStatement,ASTBase);

  WaitForStatement.prototype.parse = function () {
    var last_accessor;
    this.no_errors = this.opt_val('safe');
    this.req_val('wait');
    this.req_val('for');
    this.lvalue = this.req(MultipleReturnValues);
    /*  
       Mark the return values as possible l-values. 
        */
    this.lvalue.can_be_lvalue = true;
    this.req_val('from');
    this.lock();
    /*  
       Verify all return values are valid l-values. 
        */
    (!(this.lvalue.is_lvalue())) ? this.error("invalid assignment - the left side must be assignable") : void 0;
    this.rvalue = this.req(UnaryExpression);
    /*  
       Check for tail conditionals 
        */
    this.conditional = this.opt(WhenExpression);
    /*  
       Verify that `rvalue` is a function call. 
        */
    last_accessor = this.rvalue.accessors[this.rvalue.accessors.length - 1];
    (!(last_accessor instanceof FunctionCall)) ? this.error("expected a function call after 'from'") : void 0;
    this.block = this.req(BlockWithoutIndent);
  }

  /*  
     SimpleWaitForStatement 
     ====================== 
      
     `SimpleWaitForStatement: 'safe'? 'wait' 'for' Expression WhenExpression? BlockWithoutIndent` 
      
     The same as a `WaitForStatement` but without any return values. 
      */

  function SimpleWaitForStatement() {
    return WaitForStatement.prototype.constructor.apply(this,arguments);
  }
  __extends(SimpleWaitForStatement,WaitForStatement);

  SimpleWaitForStatement.prototype.parse = function () {
    var last_accessor;
    this.no_errors = this.opt_val('safe');
    this.req_val('wait');
    this.lock();
    this.req_val('for');
    /*  
       No l-value for this type of `wait for`. 
        */
    this.lvalue = null;
    this.rvalue = this.req(UnaryExpression);
    this.conditional = this.opt(WhenExpression);
    last_accessor = this.rvalue.accessors[this.rvalue.accessors.length - 1];
    (!(last_accessor instanceof FunctionCall)) ? this.error("expected a function call after 'for'") : void 0;
    this.block = this.req(BlockWithoutIndent);
  }

  /*  
     WaitForExpression 
     ================= 
      
     `WaitForExpression: 'safe'? ('wait' 'for')? MultipleReturnValues? 'from' UnaryExpression WhenExpression? 
      
     This is similar to a WaitForStatement except that it is called as part of a `RunInParallelBlock` and does not contain a `BlockWithoutIndent`. 
      */

  function WaitForExpression() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(WaitForExpression,ASTBase);

  WaitForExpression.prototype.parse = function () {
    var explicit, last_accessor;
    this.no_errors = this.opt_val('safe');
    (this.no_errors) ? this.lock() : void 0;
    explicit = this.opt_val('wait');
    (this.explicit) ? this.lock() : void 0;
    (explicit) ? this.req_val('for') : void 0;
    this.lvalue = this.opt(MultipleReturnValues);
    ((this.lvalue != null)) ? this.req_val('from') : void 0;
    this.rvalue = this.req(UnaryExpression);
    this.lock();
    this.conditional = this.opt(WhenExpression);
    last_accessor = this.rvalue.accessors[this.rvalue.accessors.length - 1];
    (!(last_accessor instanceof FunctionCall)) ? this.error("expected a function call after 'for'") : void 0;
    this.req('NEWLINE');
  }

  /*  
     PauseForStatement 
     ================= 
      
     `PauseForStatement: 'pause' 'for' Expression ('second'|'seconds')? WhenExpression?` 
      
     `PauseForStatement`s asynchronously pause execution for the specified time interval. The suffix `second` or `seconds` is optional and just for readability. 
      */

  function PauseForStatement() {
    return WaitForStatement.prototype.constructor.apply(this,arguments);
  }
  __extends(PauseForStatement,WaitForStatement);

  PauseForStatement.prototype.parse = function () {
    this.req_val('pause');
    this.lock();
    this.req_val('for');
    this.tvalue = this.req(Expression);
    this.opt_val('second', 'seconds');
    this.conditional = this.opt(WhenExpression);
    this.block = this.req(BlockWithoutIndent);
  }

  /*  
     RunInParallelBlock 
     ================== 
      
     `RunInParallelBlock: 'run' 'in'? 'parallel' NEWLINE INDENT WaitForExpression* DEDENT` 
      
     The `RunInParallelBlock` specifies a set of `WaitForExpression`s to kick off in parallel, delaying execution until all are complete. Only `WaitForExpression`s are allowed in the block. 
      */

  function RunInParallelBlock() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(RunInParallelBlock,ASTBase);

  RunInParallelBlock.prototype.parse = function () {
    this.req_val('run');
    this.opt_val('in');
    this.req_val('parallel');
    this.lock();
    this.req('NEWLINE');
    this.req('INDENT');
    this.wait_fors = this.req_multi(WaitForExpression);
    this.lock();
    this.req('DEDENT');
  }

  /*  
     MultipleReturnValues 
     ==================== 
      
     `MultipleReturnValues: '('? UnaryExpression (',' UnaryExpression)* ')'?` 
      
     This class is used in `wait for` expressions to specify a list of return values, such as `wait for x, y from f()`. Enclosing parentheses (`wait for (x, y) from f()`) are optional and must come as a pair. 
      */

  function MultipleReturnValues() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(MultipleReturnValues,ASTBase);

  MultipleReturnValues.prototype.is_lvalue = function () {
    var arg, ki$1, kobj$1;
    kobj$1 = this.arguments;
    for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
      arg = kobj$1[ki$1];
      if (!(arg.is_lvalue())) {
        return false;
      }
    }
    return true;
  }

  MultipleReturnValues.prototype.parse = function () {
    var left_paren, t, arg;
    left_paren = this.opt_val('(');
    this.arguments = [];
    t = {value: ','};
    while (t.value === ',') {
      arg = this.req(UnaryExpression);
      arg.can_be_lvalue = true;
      this.arguments.push(arg);
      if (left_paren) {
        t = this.req_val(')', ',');
      } else {
        t = this.req_val('from', ',');
      }
    }
    this.ts.prev();
    (left_paren) ? this.req_val(')') : void 0;
  }

  /*  
     ExpressionStatement 
     =================== 
      
     `ExpressionStatement: Expression` 
      
     `ExpressionStatement`s are statements that are simply an r-value expression (no assignment or control operators). This is most commonly used for function calls (`my_func()` is a valid statement), though technically things like `x` are also valid statments. 
      */

  function ExpressionStatement() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(ExpressionStatement,ASTBase);

  ExpressionStatement.prototype.parse = function () {
    this.expr = this.req(Expression);
  }

  /*  
     BlankStatement 
     ============== 
      
     `BlankStatement: ('pass' NEWLINE|EOF)|NEWLINE` 
      
     `BlankStatement`s are used to fill in when there are extra newlines or bare function definitions. A blank statement does not generate any output code and has no semantic significance. 
      */

  function BlankStatement() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(BlankStatement,ASTBase);

  BlankStatement.prototype.parse = function () {
    if (this.opt_val('pass')) {
      this.lock();
      this.req('NEWLINE', 'EOF');
      this.ts.prev();
    } else {
      this.req('NEWLINE');
    }
  }

  /*  
     Variable 
     ======== 
      
     `Variable: IDENTIFIER` 
      
     `Variable` works like an `IDENTIFIER` token except that it also checks to see if the token is a reserved word. 
      */

  function Variable() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(Variable,ASTBase);

  Variable.prototype.parse = function () {
    this.identifier = this.req('IDENTIFIER');
    this.lock();
    /*  
       We copy the `value` property over so that `Variable` objects can be drop-in replacements for `IDENTIFIER` tokens. 
        */
    this.value = this.identifier.value;
    ((k$indexof.call(KEYWORDS, this.value) >= 0)) ? this.error(("'" + (this.value) + "' is reserved and can't be used as a name")) : void 0;
  }

  /*  
     BinOp 
     ===== 
      
     `BinOp: ('bitwise'? 'and'|'or'|'xor'|'left'|'right'|'not')|('not' 'in'|'of')|('+'|'-'|'*'|'/'|'>'|'<'|'^'|'<='|'>='|'=='|'!='|'and'|'but'|'or'|'xor'|'nor'|'in'|'mod'|('is' 'not'?)|'isnt'|'instanceof'|'of')` 
      
     Binary operators can include bitwise operations, the `in` or `of` collection checks, or standard Boolean and arithmetic operators. 
      */

  function BinOp() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(BinOp,ASTBase);

  BinOp.prototype.parse = function () {
    /*  
       Some operations (`in` and `of`) can be inverted using the `not` keyword. 
        */
    this.invert = false;
    /*  
       Bitwise operators have the `bitwise` prefix. 
        */
    this.bitwise = this.opt_val('bitwise');
    this.op = this.req('IDENTIFIER', 'LITERAL');
    /*  
       A `bitwise` prefix indicates this is definitely a `BinOp` 
        */
    (this.bitwise) ? this.lock() : void 0;
    /*  
       Literals are limited to the list of valid arithmetic and Boolean operators above. 
        */
    if (this.op.type === 'LITERAL') {
      /*  
         First we need to fail softly on certain tokens that are not necessarily syntax errors, like closing parens. For example `x[a]` would try to parse for a `BinOp` after `a`, so it must fail cleanly in this case. Note that if `me.bitwise` was set, we are already locked, so this would be a "hard" syntax error as expected. 
          */
      ((k$indexof.call([')', ']', '}', ';', ':', ','], this.op.value) >= 0) || this.bitwise) ? this.error(("unexpected operator " + (this.op.value))) : void 0;
      this.lock();
      /*  
         Now we do a "hard" check to make sure the operator is in the acceptabled list. 
          */
      (!((k$indexof.call(['+', '-', '*', '/', '>', '<', '^', '<=', '>=', '==', '!='], this.op.value) >= 0))) ? this.error(("unexpected operator " + (this.op.value))) : void 0;
    } else {
      /*  
         For `IDENTIFIER` tokens, we also check the token against the acceptable list. 
          
          
         First we need to check if we got a `not` token. In this case we just set the `invert` flag and check that the next token is `in` or `of`. 
          */
      if (this.op.value === 'not') {
        this.op = this.req_val('in', 'of');
        this.invert = true;
      } else if (this.op.value === 'is' && this.opt_val('not')) {
        /*  
           Also check for `is not`, which we treat as `isnt` rather than `is (not`. 
            */
        this.invert = true;
      }
      /*  
         Bitwise operators are limited to a smaller list. 
          */
      if (this.bitwise) {
        (!((k$indexof.call(['and', 'or', 'xor', 'left', 'right'], this.op.value) >= 0))) ? this.error(("unexpected operator " + (this.op.value))) : void 0;
      } else {
        (!((k$indexof.call(['and', 'but', 'or', 'xor', 'nor', 'in', 'mod', 'is', 'isnt', 'instanceof', 'of'], this.op.value) >= 0))) ? this.error(("unexpected operator " + (this.op.value))) : void 0;
      }
    }
  }

  /*  
     Expression 
     ========== 
      
     `Expression: UnaryExpression (BinOp Expression)? WhenExpression?` 
      */

  function Expression() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(Expression,ASTBase);

  /*  
     Parent objects may call `transform_when_statement` to grab the rightmost tail conditional and claim it as their own. For example, in `x = y + 1 when y < 2`, normally the `WhenExpression` would associate with `y + 1`, compiling to something like `x = (y < 2) ? y + 1 : void 0;` when in reality we want `if (y < 2) x = y + 1;`. This method allows parent objects, in this case the `AssignmentStatement` to grab child conditionals by recursing down the tree. 
      */
  Expression.prototype.transform_when_statement = function () {
    var rv;
    if ((this.conditional != null) && (this.conditional.false_expr == null)) {
      rv = this.conditional;
      this.conditional = null;
      return rv;
    } else if (this.right instanceof Expression) {
      return this.right.transform_when_statement();
    }
     else {
      return null;
    }
  }

  /*  */
  Expression.prototype.parse = function () {
    this.left = this.req(UnaryExpression);
    /*  
       We flag the `left` `UnaryExpression` as not eligable to be an l-value since it is not being assigned to. 
        */
    this.left.can_be_lvalue = false;
    /*  
       `FunctionExpression`s define a function and we don't want to allow things like: 
       ``` 
       function x() 
       return 2 
       + 3 
       ``` 
       so we don't check for a `BinOp` or right value in these cases. 
        */
    if (this.left.base instanceof FunctionExpression) {
      return;
    }
    /*  
       Try to parse this as a binary expression. 
        */
    this.op = this.opt(BinOp);
    this.lock();
    /*  
       If it is binary, get the right side. 
        */
    if ((this.op != null)) {
      this.right = this.req(Expression);
    }
    /*  
       Don't parse tail conditionals after dedents. This typically is from an `ImplicitMapExpression` followed by an `if` statement (see gh-72). 
        */
    if (!(this.ts.peek(-1).type === 'DEDENT')) {
      this.conditional = this.opt(WhenExpression);
    }
  }

  /*  
     For constant folding, this method returns the numeric value if this is a unary expression with a number constant. Otherwise, it returns null. Only used by the generator for `pause for` statements at this time. 
      */
  Expression.prototype.number_constant = function () {
    if ((this.op != null) || (this.conditional != null)) {
      return null;
    } else {
      return this.left.number_constant();
    }
  }

  /*  
     UnaryExpression 
     =============== 
      
     `UnaryExpression: (('bitwise' 'not')|'not'|'new'|'-'|'typeof')? ParenExpression|ListExpression|MapExpression|FunctionExpression|ImplicitMapExpression|NumberConstant|StringConstant|RegexConstant|'IDENTIFIER' IndexExpression|FunctionCall|PropertyAccess|ExisentialCheck` 
      
     `UnaryExpression` is a container class for the different types of unary expressions supported by the language. It handles the unary prefix operators `not`, `bitwise not`, `new`, `typeof` and unary `-`. This class also handles unary suffix operators such as array/object indexing, funcation calls, property accessors, and existence checks. 
      */

  function UnaryExpression() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(UnaryExpression,ASTBase);

  /*  
     This method is used to check if an expression is an l-value when used in assignments. 
      */
  UnaryExpression.prototype.is_lvalue = function () {
    var accessor, ki$2, kobj$2;
    /*  
       The `can_be_lvalue` flag must be set by the parent node for this check to pass. Things like assignments will set this flag, whereas binary expressions will not. 
        */
    if (this.can_be_lvalue === false) {
      return false;
    }
    /*  
       Constants can't be l-values 
        */
    if ((k$indexof.call([NumberConstant, StringConstant, RegexConstant], this.base.constructor) >= 0)) {
      return false;
    }
    /*  
       We only check if the base is a valid r-value if it has no property accessors. In other words, we allow things like `me.a = 1` but not `me = 1`. 
        */
    if (this.accessors.length > 0) {
      if (((k$indexof.call(KEYWORDS, this.base.value) >= 0)) && !(((k$indexof.call(RVALUE_OK, this.base.value) >= 0)))) {
        return false;
      }
    } else {
      if ((k$indexof.call(KEYWORDS, this.base.value) >= 0)) {
        return false;
      }
    }
    /*  
       Function call results are not assignable (`f() = 2` for example). 
        */
    kobj$2 = this.accessors;
    for (ki$2 = 0; ki$2 < kobj$2.length; ki$2++) {
      accessor = kobj$2[ki$2];
      if ((accessor instanceof FunctionCall)) {
        return false;
      }
    }
    /*  
       Otherwise, this is a good l-value. 
        */
    return true;
  }

  /*  */
  UnaryExpression.prototype.parse = function () {
    var first;
    this.bitwise = this.opt_val('bitwise');
    this.preop = this.opt_val('not', 'new', '-', 'typeof');
    if (this.bitwise && ((this.preop != null) ? this.preop.value : void 0) !== 'not') {
      this.error("expected 'not' after 'bitwise' for a unary expression");
    }
    this.base = this.req(ParenExpression, ListExpression, MapExpression, FunctionExpression, ImplicitMapExpression, NumberConstant, StringConstant, RegexConstant, 'IDENTIFIER');
    /*  
       Next we check for suffix operators (accessors), including property access but also function calls, array/object indexing, and exisentials. 
        
       If a paren expression occurs immediately after the function block dedent, this would normally be interpreted as a function call on the function expression. While this may be desired it is usually just confusing, so we explicitly avoid it here. By not checking for `FunctionCall`s on the first accessor. 
        */
    if ((this.base instanceof FunctionExpression)) {
      this.accessors = [];
      first = this.opt(IndexExpression, PropertyAccess, ExisentialCheck);
      if ((first != null)) {
        this.accessors.push(first);
        this.accessors = this.accessors.concat(this.opt_multi(IndexExpression, FunctionCall, PropertyAccess, ExisentialCheck));
      }
    } else {
      this.accessors = this.opt_multi(IndexExpression, FunctionCall, PropertyAccess, ExisentialCheck);
    }
    /*  */
    this.lock();
    /*  
       Check for keyword use as an identifier. 
        */
    if ((this.base.value != null) && ((k$indexof.call(KEYWORDS, this.base.value) >= 0)) && !(((k$indexof.call(RVALUE_OK, this.base.value) >= 0)))) {
      this.error(("'" + (this.base.value) + "' is a reserved word and can't be used as a name"));
    }
  }

  /*  
     For constant folding, return a numeric value if possible, otherwise `null`. This is used by the `pause for` generator code. 
      */
  UnaryExpression.prototype.number_constant = function () {
    var n;
    if ((this.bitwise != null) || (this.preop != null)) {
      return null;
    } else if (this.base instanceof NumberConstant) {
      n = Number(this.base.token.text);
      return (isNaN(n)) ? null : n;
    }
     else {
      return null;
    }
  }

  /*  
     ExisentialCheck 
     =============== 
      
     `ExisentialCheck: 'exists'|('doesnt' 'exist')|'?' 
      
     This operator indicates a variable's existence (non-nullness and/or variable is defined) should be checked. 
      */

  function ExisentialCheck() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(ExisentialCheck,ASTBase);

  ExisentialCheck.prototype.parse = function () {
    var op;
    op = this.req_val('exists', '?', 'doesnt');
    this.lock();
    if (op.value === 'doesnt') {
      this.req_val('exist');
      this.invert = true;
    } else {
      this.invert = false;
    }
  }

  /*  
     WhenExpression 
     ============== 
      
     `WhenExpression: 'when'|'if'|'unless'|('except' 'when') Expression ('otherwise'|'else' Expression)?` 
      
     This node can either be used as a ternary operator (`2 if a otherwise 3`) or a tail conditional (`x = 5 if a`). `Expression` objects use the `transform_when_statement` method to pull these nodes to the top level of a statement (see the definition of `transform_when_statement` above). 
      */

  function WhenExpression() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(WhenExpression,ASTBase);

  WhenExpression.prototype.parse = function () {
    this.specifier = this.req_val('when', 'except', 'if', 'unless');
    this.lock();
    (this.specifier.value === 'except') ? this.req_val('when') : void 0;
    this.condition = this.req(Expression);
    if (this.opt_val('otherwise', 'else')) {
      this.false_expr = this.req(Expression);
    }
  }

  /*  
     NumberConstant 
     ============== 
      
     `NumberConstant: NUMBER` 
      
     A numeric token constant. Can be anything the lexer supports, including scientific notation, integers, floating point, or hex. 
      */

  function NumberConstant() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(NumberConstant,ASTBase);

  NumberConstant.prototype.parse = function () {
    this.token = this.req('NUMBER');
  }

  /*  
     StringConstant 
     ============== 
      
     `StringConstant: STRING` 
      
     A string token constant. Can be anything the lexer supports, including single or double-quoted strings. Note that the `sugar` module handles double-quoted strings with embedded code by turning it into multiple `STRING` tokens, so we don't have to do anything special here. 
      */

  function StringConstant() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(StringConstant,ASTBase);

  StringConstant.prototype.parse = function () {
    this.token = this.req('STRING', 'BLOCKSTRING');
  }

  /*  
     RegexConstant 
     ============== 
      
     `RegexConstant: REGEX` 
      
     A regular expression token constant. Can be anything the lexer supports. 
      */

  function RegexConstant() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(RegexConstant,ASTBase);

  RegexConstant.prototype.parse = function () {
    this.token = this.req('REGEX');
  }

  /*  
     IndexExpression 
     ============== 
      
     `IndexExpression: '?'? '[' Expression ']'` 
      
     Array or object property access. This can be prepended by an exisential check, meaning only attempt access if the underlying object is defined. For example, `a?[2]` won't fail if `a` is `null` or not declared, instead it returns `undefined`. 
      */

  function IndexExpression() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(IndexExpression,ASTBase);

  IndexExpression.prototype.parse = function () {
    var op;
    op = this.req_val('[', '?');
    this.exisential = (op.value === '?');
    (this.exisential) ? this.req_val('[') : void 0;
    this.lock();
    this.expr = this.req(Expression);
    this.req_val(']');
  }

  /*  
     PropertyAccess 
     ============== 
      
     `PropertyAccess: '?'? '.' IDENTIFIER` 
      
     Object property access. This can be prepended by an exisential check, meaning only attempt access if the underlying object is defined. For example, `a?.prop` won't fail if `a` is `null` or not declared, instead it returns `undefined`. 
      */

  function PropertyAccess() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(PropertyAccess,ASTBase);

  PropertyAccess.prototype.parse = function () {
    var op;
    op = this.req_val('.', '?');
    this.exisential = (op.value === '?');
    (this.exisential) ? this.req_val('.') : void 0;
    this.lock();
    this.expr = this.req('IDENTIFIER');
  }

  /*  
     FunctionCall 
     ============== 
      
     `FunctionCall: '?'? '(' FunctionCallArgument* ')'` 
      
     Indicates a function call on the preceeding object. This can be prepended by an exisential check, meaning only attempt access if the underlying object is defined. For example, `a?()` won't fail if `a` is `null` or not declared, instead it returns `undefined`. It will fail if `a` is not a function, though this can't be determined at compile time. 
      */

  function FunctionCall() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(FunctionCall,ASTBase);

  FunctionCall.prototype.parse = function () {
    var op;
    op = this.req_val('(', '?');
    this.exisential = (op.value === '?');
    (this.exisential) ? this.req_val('(') : void 0;
    this.lock();
    this.arguments = this.opt_multi(FunctionCallArgument);
    this.req_val(')');
  }

  /*  
     FunctionCallArgument 
     ==================== 
      
     `FunctionCallArgument: (Expression ',')* Expression (?=')')` 
      
     A single argument to a function call, followed by a comma or close-paren. If it is followed by a close-paren, that token will not be captured. 
      */

  function FunctionCallArgument() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(FunctionCallArgument,ASTBase);

  FunctionCallArgument.prototype.parse = function () {
    this.val = this.req(Expression);
    this.lock();
    if (this.req_val(',', ')').value === ')') {
      this.ts.prev();
    }
  }

  /*  
     ParenExpression 
     ============== 
      
     `ParenExpression: '(' Expression ')'` 
      
     An expression enclosed by parentheses, like `(a + b)`. 
      */

  function ParenExpression() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(ParenExpression,ASTBase);

  ParenExpression.prototype.parse = function () {
    this.req_val('(');
    this.lock();
    this.expr = this.req(Expression);
    this.req_val(')');
  }

  /*  
     RangeExpression 
     =============== 
      
     `RangeExpression: Expression 'to' Expression` 
      
     This is used inside array definitions to define a range of values (like `[1 to 4]`). 
      */

  function RangeExpression() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(RangeExpression,ASTBase);

  RangeExpression.prototype.parse = function () {
    this.from_expr = this.req(Expression);
    this.req_val('to');
    this.lock();
    this.to_expr = this.req(Expression);
  }

  /*  
     ListExpression 
     ============== 
      
     `ListExpression: '[' ObjectComprehension|ListComprehension|((Expression ',')* Expression)? ']'` 
      
     An array definition, such as `[1,2,3]`. Multiline list definitions are handled by the `sugar` module. This also supports comprehensions inside the definition. 
      */

  function ListExpression() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(ListExpression,ASTBase);

  ListExpression.prototype.parse = function () {
    this.req_val('[');
    this.lock();
    this.parse_inside();
    this.req_val(']');
  }

  /*  */
  ListExpression.prototype.parse_inside = function () {
    var item;
    this.comprehension = this.opt(ObjectComprehension, ListComprehension, RangeExpression);
    if ((this.comprehension == null)) {
      item = this.opt(Expression);
      this.items = [];
      while (item) {
        this.items.push(item);
        if (this.opt_val(',')) {
          item = this.opt(Expression);
        } else {
          item = null;
        }
      }
    }
  }

  /*  
     NoBracketListExpression 
     ======================= 
      
     `NoBracketListExpression: ObjectComprehension|ListComprehension|((Expression ',')* Expression)?` 
      
     This is the same as a `ListExpression` except that it does not require enclosing brackets. It is used by the `DeleteStatement`. 
      */

  function NoBracketListExpression() {
    return ListExpression.prototype.constructor.apply(this,arguments);
  }
  __extends(NoBracketListExpression,ListExpression);

  NoBracketListExpression.prototype.parse = function () {
    this.parse_inside();
  }

  /*  
     ListComprehension 
     ================= 
      
     `ListComprehension: Expression 'for' Variable 'in' Expression` 
      
     List comprehensions allow list generation by applying an expression to each member in another list. For example `[a+1 for a in [1,2,3]]` would yield `[2,3,4]`. 
      */

  function ListComprehension() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(ListComprehension,ASTBase);

  ListComprehension.prototype.parse = function () {
    this.iter_expr = this.req(Expression);
    this.req_val('for');
    this.lock();
    this.iterant = this.req(Variable);
    this.req_val('in');
    this.iterable = this.req(Expression);
    this.conditional = this.iterable.transform_when_statement();
  }

  /*  
     ObjectComprehension 
     ================= 
      
     `ObjectComprehension: Expression 'for' ('property' Variable)|('property' 'value' Variable)|('property' Variable 'with' 'value' Variable) 'in' Expression` 
      
     Object comprehensions allow list generation by applying an expression to each member in an object. It comes in three forms: 
      
     `[x for property x of obj]` - returns all the keys (properties) of `obj` as a list. 
     `[x for property value x of obj]` - returns all the values (property values) of `obj` as a list. 
     `[[w,x for property w with value x of obj]` - returns all the keys (properties) and values (property values) of `obj` as a list of list tuples. 
      */

  function ObjectComprehension() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(ObjectComprehension,ASTBase);

  ObjectComprehension.prototype.parse = function () {
    this.iter_expr = this.req(Expression);
    this.req_val('for');
    this.req_val('property');
    this.lock();
    if (this.opt_val('value')) {
      this.value_iterant = this.req(Variable);
    } else {
      this.property_iterant = this.req(Variable);
      if (this.opt_val('with')) {
        this.req_val('value');
        this.value_iterant = this.req(Variable);
      }
    }
    this.req_val('in');
    this.iterable = this.req(Expression);
    this.conditional = this.iterable.transform_when_statement();
  }

  /*  
     MapExpression 
     ============= 
      
     `MapExpression: '{' MapItem* '}'` 
      
     Defines an object with a list of key value pairs. This is a JavaScript-style definition. Multiline definitions are supported to some extent by the `sugar` module which removes the newlines and indents: 
      
     `x = {a:1,b:2,c:{d:1}}` 
      */

  function MapExpression() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(MapExpression,ASTBase);

  MapExpression.prototype.parse = function () {
    this.req_val('{');
    this.lock();
    this.items = this.opt_multi(MapItem);
    this.req_val('}');
  }

  /*  
     ImplicitMapExpression 
     ===================== 
      
     `ImplicitMapExpression: NEWLINE INDENT ImplicitMapItem* DEDENT` 
      
     Defines an object with a list of key value pairs. This is a CoffeeScript-style definition: 
     ``` 
     x = 
     a: 1 
     b: 2 
     ``` 
      */

  function ImplicitMapExpression() {
    return MapExpression.prototype.constructor.apply(this,arguments);
  }
  __extends(ImplicitMapExpression,MapExpression);

  ImplicitMapExpression.prototype.parse = function () {
    this.req('NEWLINE');
    this.req('INDENT');
    this.lock();
    this.items = this.req_multi(ImplicitMapItem);
    this.req('DEDENT');
  }

  /*  
     MapItem 
     ======= 
      
     `MapItem: IDENTIFIER|STRING|NUMBER ':' Expression ','|(?='}')` 
      
     A single definition in a `MapExpression` of a property/value pair. It also tries to consume a comma if one is available and fails if it is not followed by a comma or `}`. 
      */

  function MapItem() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(MapItem,ASTBase);

  MapItem.prototype.parse = function () {
    this.key = this.req('IDENTIFIER', 'STRING', 'NUMBER');
    this.req_val(':');
    this.lock();
    this.val = this.req(Expression);
    this.end_token = this.req_val(',', '}');
    if (this.end_token.value === '}') {
      this.ts.prev();
    }
  }

  /*  
     ImplicitMapItem 
     ======= 
      
     `ImplicitMapItem: IDENTIFIER|STRING|NUMBER ':' Expression ','|(?='}')` 
      
     A single definition in a `ImplicitMapExpression` of a property/value pair. 
      */

  function ImplicitMapItem() {
    return MapItem.prototype.constructor.apply(this,arguments);
  }
  __extends(ImplicitMapItem,MapItem);

  ImplicitMapItem.prototype.parse = function () {
    this.key = this.req('IDENTIFIER', 'STRING', 'NUMBER');
    this.req_val(':');
    this.lock();
    this.val = this.req(Expression);
    /*  
       It requires either a `NEWLINE` or comma unless the value expression is another `ImplicitMapExpression` or a function definition, since these consume the newline for us. 
        */
    if (!(((this.val.left != null) ? this.val.left.base : void 0) instanceof ImplicitMapExpression || ((this.val.left != null) ? this.val.left.base : void 0) instanceof FunctionExpression)) {
      this.end_token = this.opt_multi('NEWLINE');
      if (this.end_token.length === 0) {
        this.end_token = this.req_val(',');
      }
    }
  }

  /*  
     FunctionExpression 
     ================== 
      
     `FunctionExpression: 'function'|'method'|'task' Variable? '(' FunctionDefArgument* ')' ('of' UnaryExpression)? Block` 
      
     Defines a function, method, or task. The `of` suffix allows us to late-bind this function to another class. 
      */

  function FunctionExpression() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(FunctionExpression,ASTBase);

  FunctionExpression.prototype.parse = function () {
    this.specifier = this.req_val('function', 'method', 'task');
    this.lock();
    this.name = this.opt(Variable);
    this.req_val('(');
    this.arguments = this.opt_multi(FunctionDefArgument);
    this.req_val(')');
    this.late_bind = this.opt_val('of');
    if (this.late_bind) {
      this.lock();
      this.bind_to = this.req(UnaryExpression);
      this.bind_to.can_be_lvalue = false;
    }
    this.block = this.req(Block);
  }

  /*  
     FunctionDefArgument 
     =================== 
      
     `FunctionDefArgument: Variable ('=' Expression)? ','|(?=')')` 
      */

  function FunctionDefArgument() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(FunctionDefArgument,ASTBase);

  FunctionDefArgument.prototype.parse = function () {
    this.name = this.req(Variable);
    this.lock();
    if (this.opt_val(':')) {
      this.typeName = this.req('IDENTIFIER');
    }
    if (this.opt_val('=')) {
      this.default = this.req(Expression);
    }
    /*  
       Require either a comma or ')', but unsee a ')' since the `FunctionExpression` needs it. 
        */
    if (this.req_val(',', ')').value === ')') {
      this.ts.prev();
    }
  }

  /*  
     ClassDefinition 
     =============== 
      
     `ClassDefinition: class Variable ('inherits' 'from' Variable)? Block` 
      
     Defines a new class with an optional parent class. Methods and members go inside the block. 
      */

  function ClassDefinition() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(ClassDefinition,ASTBase);

  ClassDefinition.prototype.parse = function () {
    this.req_val('class');
    this.lock();
    this.name = this.req(Variable);
    if (this.opt_val('inherits')) {
      this.req_val('from');
      this.parent = this.req(Variable);
    }
    this.block = this.req(Block);
  }

  /*  
     TryCatch 
     ======== 
      
     `TryCatch: 'try' Block ('catch' Variable? Block)?` 
      
     Defines a `try` and `catch` block for trapping exceptions and handling them. `finally` is not supported at this time. The `catch` block and error variable are optional. 
      */

  function TryCatch() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(TryCatch,ASTBase);

  TryCatch.prototype.parse = function () {
    this.req_val('try');
    this.lock();
    this.try_block = this.req(Block);
    if (this.opt_val('catch')) {
      this.lock();
      this.identifier = this.opt(Variable);
      this.catch_block = this.req(Block);
    }
  }

  /*  
     SuperStatement 
     ============== 
      
     `SuperStatement: 'super' FunctionCall?` 
      
     Within a method, calls the parent class's version of that method. Unlike most function calls, the `()`s are optional even when there are no arguments. 
      */

  function SuperStatement() {
    return ASTBase.prototype.constructor.apply(this,arguments);
  }
  __extends(SuperStatement,ASTBase);

  SuperStatement.prototype.parse = function () {
    this.req_val('super');
    this.lock();
    this.accessor = this.opt(FunctionCall);
  }

  /*  
     Exports 
     ======= 
      
     A list of nodes to export. For now, this is the cleanest way to do this in Kal. Perhaps an `export` keyword in the future will make this neater. 
      */
  Nodes = [ASTBase, File, Block, Statement, ThrowStatement, ReturnStatement, IfStatement, ElseStatement, WhileStatement, ForStatement, AssignmentStatement, ExpressionStatement, LoopControlStatement, BlankStatement, BinOp, Expression, UnaryExpression, ExisentialCheck, WhenExpression, NumberConstant, StringConstant, RegexConstant, IndexExpression, PropertyAccess, FunctionCallArgument, FunctionCall, ParenExpression, ListExpression, ListComprehension, ObjectComprehension, MapItem, MapExpression, ImplicitMapItem, ImplicitMapExpression, FunctionDefArgument, FunctionExpression, ClassDefinition, TryCatch, SuperStatement, BlockWithoutIndent, SimpleWaitForStatement, WaitForStatement, PauseForStatement, MultipleReturnValues, RunInParallelBlock, WaitForExpression, Variable, RangeExpression, DeleteStatement];
  /*  */
  exports.Grammar = {};
  kobj$3 = Nodes;
  for (ki$3 = 0; ki$3 < kobj$3.length; ki$3++) {
    v = kobj$3[ki$3];
    exports.Grammar[v.name] = v;
  }
  exports.GrammarRoot = exports.Grammar.File;
})()