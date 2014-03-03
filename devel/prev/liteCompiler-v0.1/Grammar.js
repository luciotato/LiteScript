var ASTBase, Lexer, RESERVED_WORDS, operatorsPrecedence, IDENTIFIER_ALIASES, OPERAND_DIRECT_TYPE, OPERAND_DIRECT_TOKEN, StatementsDirect, AccessorsDirect, Nodes, v, ki$9, kobj$9;
var __hasProp = {}.hasOwnProperty, __extends = function (child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; }
var k$indexof = [].indexOf || function (item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
/* LiteScript Grammar 
   ================== 
   The LiteScript Grammar is based on [Parsing Expression Grammars (PEGs)](http://en.wikipedia.org/wiki/Parsing_expression_grammar) 
   with some extensions. 
   The LiteScript Grammar is defined as `classes`, one class for each non-terminal symbol. 
   The `.parse()` method of each class will try the grammar on the token stream and: 
   * If all tokens match, it will simply return after consuming the tokens. 
   * On a token mismatch, it will raise a 'parse failed' exception. 
   When a 'parse failed' exception is raised, other classes can be tried. If none parses ok, a compiler error 
   is emitted and compilation is aborted. 
   if the error is produced *before* the class has determined this was the right language construction, 
   it is a soft-error and other grammars can be tried over the source code. 
   if the error is produced *after* the class has determined this was the right language construction 
   (if the node is 'locked'), it is a hard-error and a compiler error is raised 
   The `ASTBase` module defines the base class for the grammar classes along with 
   utility methods to **req**uire tokens and allow **opt**ional ones. */
ASTBase = require('./ASTBase');
Lexer = require('./Lexer');
/* /! 
    
   compiler set sourceMap = false 
    
   declare debug,log,process 
    
   declare valid log.error 
   declare valid log.warning 
   declare valid process.exit 
    
    
   declare on ASTBase 
   ownMember,addMember 
   getRootNode,globalVar 
   createScope,createFunctionScope,addToScope,addVarsToScope,findInScope 
   parseParametersAndBody 
    
   # forward declares 
    
   declare 
   StatementsDirect, AccessorsDirect, FunctionAccess 
    
   declare 
   Module, Expression, FreeObjectLiteral, NameValuePair 
   SingleLineStatement, Body, ExceptionBlock 
   ElseIfStatement, ElseStatement, ForEachProperty 
   Accessors, 
   ForIndexNumeric, ForEachInArray 
   VariableRef, FunctionDeclaration 
   ParenExpression,ArrayLiteral,ObjectLiteral 
   StringLiteral, NumberLiteral, RegExpLiteral 
   ClassDeclaration,AppendToDeclaration,Adjective 
    
   !/ 
   Reserved Words 
   ---------------------- 
   Words that are reserved in LiteScript and cannot be used as variable or function names 
   (There are no restrictions to object property names) */
RESERVED_WORDS = ['function', 'class', 'method', 'constructor', 'prototype', 'if', 'then', 'else', 'null', 'true', 'false', 'undefined', 'and', 'or', 'but', 'no', 'not', 'bitwise', 'has', 'property', 'properties', 'mod', 'new', 'is', 'isnt', 'do', 'loop', 'while', 'until', 'for', 'to', 'break', 'continue', 'return', 'try', 'catch', 'throw', 'raise', 'fail', 'exception', 'finally', 'with', 'arguments', 'in', 'instanceof', 'typeof', 'var', 'let', 'default', 'delete', 'interface', 'implements', 'yield', 'me', 'this', 'super', 'public', 'compiler', 'compile', 'debugger'];
/* Operators precedence 
   -------------------- 
   The order of symbols in `operatorsPrecedence`,  determines operators precedence */
operatorsPrecedence = ['++', '--', 'unary -', 'unary +', 'bitwise not', 'bitwise and', 'bitwise xor', 'bitwise or', '>>', '<<', 'new', 'type of', 'instance of', 'has property', 'no', '^', '*', '/', 'mod', '+', '-', 'in', '>', '<', '>=', '<=', 'is', '<>', 'not', 'and', 'but', 'or', '?', ':'];
/* -------------------------------------- 
   Grammar Meta-Syntax 
   =================== 
   Each Grammar class parsing code, contains a 'grammar definition' as reference. 
   The meta-syntax for the grammar definitions is 
   an extended form of [Parsing Expression Grammars (PEGs)](http://en.wikipedia.org/wiki/Parsing_expression_grammar) 
   The differences with classic PEG are: 
   * instead of **Symbol <- definition**, we use **Symbol: definition** 
   * we use **[Symbol]** for optional symbols instead of **Symbol?** (brackets also groups symbols, the entire group is optional) 
   * symbols upper/lower case carries meaning 
   * we add **,|; Separated List** as a syntax option 
   Examples: 
   `IfStatement`    : CamelCase is reserved for non-terminal symbol 
   `function`       : all-lowercase means the literal word 
   `":"`            : literal symbols are quoted 
   `IDENTIFIER`,`OPER` : all-uppercase denotes entire classes of symbols 
   `NEWLINE`,`EOF`     : or special unprintable characters 
   `[of]`               : Optional symbols are enclosed in brackets 
   `(var|let)`          : The vertical bar represents ordered alternatives 
   `(Oper Operand)`     : Parentheses groups symbols 
   `(Oper Operand)*`    : Asterisk after a group `()*` means the group can repeat (one or more) 
   `[Oper Operand]*`    : Asterisk after a optional group `[]*` means zero or more of the group 
   `"(" [Expression,] ")"` : the comma means a comma "Separated List". When a "Separated List" is accepted, 
   also a *free-form* is accepted 
   `Body: (Statement;)` : the semicolon means: a semicolon "Separated List". When a "Separated List" is accepted, 
   also a *free-form* is accepted 
   "Separated List" 
   ---------------- 
   Example: `FunctionCall: IDENTIFIER "(" [Expression,] ")"` 
   `[Expression,]` means *optional* **comma "Separated List"** of Expressions. When the comma is 
   inside a **[]** group, it means the entire list is optional. 
   Example: `VarStatement: (VariableDecl,)` 
   `(VariableDecl,)` means **comma "Separated List"** of `VariableDecl` (`VariableDecl: IDENTIFIER ["=" Expresion]`). 
   When the comma is inside a **()** group, it means one or more of the group 
   At every point where a "Separated List" is accepted, also 
   a "**free-form** Separated List" is accepted. 
   In *free-form* mode, each item stands on its own line, and separators (comma/semicolon) 
   are optional, and can appear after or before the NEWLINE. 
   For example, given the previous example: `VarStatement: var (VariableDecl,)`, 
   all of the following constructions are equivalent and valid in LiteScript: 
   Examples: 
   ** 
    
   //standard js 
    
   var a = {prop1:30 prop2: { prop2_1:19, prop2_2:71} arr:["Jan","Feb","Mar"]} 
    
    
   //mixed freeForm and comma separated 
    
   var a = 
   prop1: 30 
    
   prop2: 
   prop2_1: 19 
   prop2_2: 71 
    
   arr: [ "Jan", 
   "Feb", "Mar"] 
    
    
   //in freeForm, commas are optional 
    
   var a = { 
   prop1: 30 
   prop2: 
   prop2_1: 19, 
   prop2_2: 71, 
   arr: [ 
   "Jan", 
   "Feb" 
   "Mar" 
   ] 
   } 
   ** 
   -------------------------- 
   LiteScript Grammar - AST Classes 
   ================================ 
   PrintStatement 
   -------------- 
   `PrintStatement: 'print' [Expression,]` 
   This handles `print` followed by am optional comma separated list of expressions */


function PrintStatement() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(PrintStatement,ASTBase);

/* /! 
    
   properties 
   args 
   !/ */
PrintStatement.prototype.parse = function () {
  this.reqValue('print');
  /* At this point we lock because it is definitely a `print` statement. Failure to parse the expression 
     from this point is a syntax error. */
  this.lock();
  this.args = this.optSeparatedList(Expression, ",");
}

/* Require Name Declaration 
   ------------------------ 
   We want to avoid time lost debugging a mistyped object property, or variable, or function name. 
   All identifiers (names) used in LiteScript must be previously declared. 
   Names are case-controled, you  must use them always with the same case. 
   It means you can not have `totals` and `toTals` as different vars on the same scope. 
   Commonly used identifier aliases 
   -------------------------------- 
   This are a few aliases to most used built-in identifiers: */
IDENTIFIER_ALIASES = {'on': 'true', 'off': 'false', 'me': 'this'};

/* NameDeclaration 
   --------------- 
   `NameDeclaration` is a helper class used to parse an identifier. 
   It does 'alias' conversion and also store: 
   * 'members', a map of names declared under this name 
   For example, dependent name:value in object expressions, methods in a class, etc. 
   * type 
   * itemType (whe type is Array) */
function NameDeclaration() {
  this.members = {}; /* start with empty .members map */
  return ASTBase.prototype.constructor.apply(this, arguments);
}
__extends(NameDeclaration,ASTBase);

/* It's used for `var` names, `class` names, `function` name and parameter names, etc. 
   /! 
    
   properties 
   name, members, isForward, value 
   type,itemType 
   !/ */

NameDeclaration.prototype.parse = function () {
  var ident;
  /* Require an `IDENTIFIER` token 
     /! 
      
     declare ident:string 
     !/ */
  ident = this.req('IDENTIFIER');
  /* translate common aliases: me --> this,  on --> true / off --> false */
  this.name = ident.translate(IDENTIFIER_ALIASES);
}

/* end parse 
   ###NameDeclaration Helper methods 
   debug helper method *toString* */
NameDeclaration.prototype.toString = function () {
  var result, node;
  result = this.name;
  node = this.parent;
  while (node instanceof NameDeclaration && !(node.isScope)) {
    /* prepend owner name until we reach a scope */
    result = node.name + '.' + result;
    node = node.parent;
  }
  /* loop */
  return result;
}

/* debug helper method *originalDeclarationText* */
NameDeclaration.prototype.originalDeclarationText = function () {
  return ("" + (this.positionText()) + " for reference: original declaration of '" + (this.name) + "'");
}

/* ###a Helper function, *.declareName* 
   .declareName creates a new NameDeclaration. */
ASTBase.prototype.declareName = function (name, options) {
  var newDecl;
  /* /! 
      
     declare on options 
     type,isForward,value 
      
      
     !/ */
  newDecl = new NameDeclaration(this);
  newDecl.name = name;
  if (options) {
    if (options.type) {
      newDecl.type = options.type;
    }
    if (options.isForward) {
      newDecl.isForward = options.isForward;
    }
    if (options.hasOwnProperty('value')) {
      newDecl.value = options.value;
    }
  }
  return newDecl;
}

/* ###a Helper Function **addToExport** 
   Add to parentModule.exports */
ASTBase.prototype.addToExport = function (param) {
  var parentModule;
  parentModule = this.getParent(Module);
  if (param instanceof NameDeclaration) {
    parentModule.exports.addMember(param, {keepParent: true});
  } else {
    parentModule.exports.addMembers(param, {keepParent: true});
  }
}

/* Note: All other methods added to NameDeclaration are in the 'Scope' module 
   ----- 
   ## VariableDecl 
   `VariableDecl: NameDeclaration (':' dataType-IDENTIFIER) ('=' defaultValue-Expression)` 
   variable name, optional type anotation and optionally assign a value 
   Note: If no value is assigned, `= undefined` is assumed 
   VariableDecls are used in `var` statement, in functions for *parameter declaration* 
   and in class *properties declaration* 
   Example: 
   `var a : string = 'some text'` 
   `function x ( a : string = 'some text', b, c=0)` */

function VariableDecl() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(VariableDecl,ASTBase);

/* /! 
    
   properties 
   name:NameDeclaration 
   referencedName:NameDeclaration 
   assignedValue 
    
   !/ */
VariableDecl.prototype.parse = function () {
  var typeRef, isArray, capitalized, possibleClass;
  this.name = this.req(NameDeclaration);
  this.referencedName = this.name; /* to compatibilize with VariableRef */
  this.lock();
  /* optional type annotation. */
  if (this.optValue(':')) {
    /* auto-capitalize core classes */
    if ((k$indexof.call(['string', 'array', 'number', 'object', 'function', 'boolean'], this.lexer.token.value) >= 0)) {
      this.lexer.token.value = this.lexer.token.value[0].toUpperCase() + this.lexer.token.value.slice(1);
    }
    /* /! 
        
       declare typeRef 
       declare valid typeRef.referencedName.members.prototype 
       declare valid typeRef.referencedName.name 
       declare valid this.globalVar 
       declare valid this.name.name.slice 
       declare valid this.findInScope 
       declare valid this.name.type 
       declare valid this.name.itemType 
       declare valid this.scopeEvaluateAssignment 
        
       declare possibleClass:NameDeclaration 
       declare valid possibleClass.members.prototype 
       !/ */
    typeRef = this.req(VariableRef);
    this.name.type = typeRef.referencedName;
    if (typeRef.referencedName.members.prototype) { /* a class */
      this.name.type = typeRef.referencedName.members.prototype;
    }
    isArray = this.ifOptValue('Array', 'array');
    if (isArray) {
      this.name.itemType = this.name.type; /* assign as sub-type */
      this.name.type = this.globalVar('Array').members.prototype;
    }
  } else {
    /* if there is no type specified, but the name is lowercase of a Class name, we assume type is class.prototype */
    capitalized = this.name.name[0].toUpperCase() + this.name.name.slice(1);
    if (capitalized !== this.name.name) {
      possibleClass = this.findInScope(capitalized);
      if (possibleClass) {
        this.name.type = possibleClass.type;
        if (possibleClass.members.prototype) {
          this.name.type = possibleClass.members.prototype;
        }
      }
    }
  }
  /* optional assigned value */
  if (this.optValue('=')) {
    if (this.lexer.token.type === 'NEWLINE') { /* dangling assignment, assume free-form object literal */
      this.assignedValue = this.req(FreeObjectLiteral);
    } else {
      this.assignedValue = this.req(Expression);
    }
    /* Now evaluate assignment to: 
       a. Recognize `exports.name = x` as alternative to declaring x `public` 
       b. Recognize `name = require('name')` as alternative to `import name` 
       c. auto assign type */
    this.scopeEvaluateAssignment(this, this.name, this.assignedValue);
  }
}

/* ## Var Statement 
   `VarStatement: (var|let) (VariableDecl,) ` 
   `var` followed by a comma separated list of VariableDecl (one or more items) */

function VarStatement() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(VarStatement,ASTBase);

/* /! 
    
   properties list:array 
   !/ */
VarStatement.prototype.parse = function () {
  this.reqValue('var', 'let');
  this.lock();
  this.list = this.reqSeparatedList(VariableDecl, ",");
  /* Scope: Now add all the declared variables to the parent scope 
     and if 'public' add to exported names 
     /! 
      
     declare valid this.addVarsToScope 
     declare valid this.parent.isAdjectivated 
     !/ */
  this.addVarsToScope(this.list);
  if (this.parent.isAdjectivated('public')) {
    this.addToExport(this.list);
  }
}

/* ## PropertiesDeclaration 
   `PropertiesDeclaration: properties (VariableDecl,)` 
   The `properties` keyword is used inside classes to define properties of the class (prototype). 
   *PropertiesDeclaration* derives from *VarStatement* in order to use the same '.produce()' method. */

function PropertiesDeclaration() {
  return VarStatement.prototype.constructor.apply(this,arguments);
}
__extends(PropertiesDeclaration,VarStatement);

PropertiesDeclaration.prototype.parse = function () {
  var parentClass, ownerObj, varDecl, ki$1, kobj$1;
  this.singleton = this.optValue('namespace');
  this.reqValue('properties');
  this.lock();
  parentClass = this.getParent(ClassDeclaration); /* gets parent class/append to */
  if (!(parentClass)) {
    this.throwError("'properties' declaration outside class/append declaration. Check indent");
  }
  ownerObj;
  if (this.singleton) {
    ownerObj = parentClass.name;
  } else if (parentClass instanceof AppendToDeclaration) {
    /* 'properties' inside a "append to" -> assign to exact object */
    ownerObj = parentClass.referenced;
  }
   else {
    /* 'properties' inside a class -> assign to prototype */
    ownerObj = parentClass.name.members.prototype;
  }
  this.list = this.reqSeparatedList(VariableDecl, ',');
  /* Now add all properties as valid class.prototype members 
     and make names childs of ownerObj */
  kobj$1 = this.list;
  for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
    varDecl = kobj$1[ki$1];
    ownerObj.addMember(varDecl.name);
    varDecl.name.parent = ownerObj;
  }
}

/* ##TryCatch 
   `TryCatch: 'try' Body ExceptionBlock` 
   Defines a `try` block for trapping exceptions and handling them. */

function TryCatch() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(TryCatch,ASTBase);

/* /! 
    
   properties body,exceptionBlock 
   !/ */
TryCatch.prototype.parse = function () {
  this.reqValue('try');
  this.lock();
  this.body = this.req(Body);
  this.exceptionBlock = this.req(ExceptionBlock);
}

/* ## ExceptionBlock 
   `ExceptionBlock: (exception|catch) NameDeclaration Body [finally Body]` 
   Defines a `catch` block for trapping exceptions and handling them. 
   If no `try` preceded this construction, `try` is assumed at the beggining of the function */

function ExceptionBlock() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(ExceptionBlock,ASTBase);

/* /! 
    
   properties 
   catchVar:NameDeclaration 
   body,finallyBody 
   !/ */
ExceptionBlock.prototype.parse = function () {
  var functionScope;
  /* /! 
      
     declare valid this.createScope 
     declare valid this.addToScope 
     !/ */
  this.reqValue('exception', 'catch');
  this.lock();
  /* get catch variable - Note: catch variables in js are block-scoped */
  this.catchVar = this.req(NameDeclaration);
  if (!(this.catchVar.type)) {
    this.catchVar.type = this.globalVar('Error').members.prototype;
  }
  /* add catched err var to exception-block scope */
  this.createScope();
  this.addToScope(this.catchVar);
  /* get body */
  this.body = this.req(Body);
  /* get optional "finally" block */
  if (this.optValue('finally')) {
    this.finallyBody = this.req(Body);
  }
  /* If no `try` preceded this construction, we assume this is the function exception handler, 
     so we mark the function `hasExceptionBlock` (producer_js: will add 'try{' at function start) */
  if (!((this.parent instanceof TryCatch))) {
    functionScope = this.getParent(FunctionDeclaration);
    if (!(functionScope)) {
      this.throwError('[ExceptionBlock] found outside a function');
    }
    if (functionScope.exceptionBlock) {
      this.throwError(("Two [ExceptionBlocks] found for the same function: " + (functionScope.name)));
    }
    functionScope.exceptionBlock = this;
  }
}

/* ## ThrowStatement 
   `ThrowStatement: (throw|raise|fail with) Expression` 
   This handles `throw` and its synonyms followed by an expression */

function ThrowStatement() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(ThrowStatement,ASTBase);

/* /! 
    
   properties specifier, expr 
   !/ */
ThrowStatement.prototype.parse = function () {
  this.specifier = this.reqValue('throw', 'raise', 'fail');
  /* At this point we lock because it is definitely a `throw` statement */
  this.lock();
  if (this.specifier === 'fail') {
    this.reqValue('with');
  }
  this.expr = this.req(Expression);
}

/* ## ReturnStatement 
   `ReturnStatement: return Expression` */

function ReturnStatement() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(ReturnStatement,ASTBase);

/* /! 
    
   properties expr 
   !/ */
ReturnStatement.prototype.parse = function () {
  this.reqValue('return');
  this.lock(); /* Definitely a return statement at this point. */
  this.expr = this.opt(Expression);
}

/* IfStatement 
   ----------- 
   `IfStatement: (if|when) Expression (then|',') SingleLineStatement [ElseIfStatement|ElseStatement]*` 
   `IfStatement: (if|when) Expression Body [ElseIfStatement|ElseStatement]*` 
   Parses `if` statments and any attached `else`s or `else if`s */

function IfStatement() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(IfStatement,ASTBase);

/* /! 
    
   properties conditional,body,elseStatement 
   !/ */
IfStatement.prototype.parse = function () {
  this.reqValue('if', 'when');
  this.lock();
  this.conditional = this.req(Expression);
  if (this.optValue(',', 'then')) {
    /* after `,` or `then`, a statement on the same line is required */
    this.body = this.req(SingleLineStatement);
  } else {
    /* and indented block */
    if (this.lexer.token.type !== 'NEWLINE') {
      this.throwError(("expected: ','|then|NEWLINE not " + (this.lexer.token)));
    }
    this.body = this.req(Body);
  }
  /* end if 
     control: "if"-"else" are related by having the same indent */
  if (this.lexer.token.value === 'else') {
    if (this.lexer.index !== 0) {
      this.throwError('expected "else" to start on a new line');
    }
    if (this.lexer.indent < this.indent) {
      /* token is 'else' **BUT IS LESS-INDENTED**. It is not the "else" to this "if" */
      return;
    }
    if (this.lexer.indent > this.indent) {
      this.throwError("'else' statement is over-indented");
    }
  }
  /* end if */
  this.elseStatement = this.opt(ElseIfStatement, ElseStatement);
}

/* ElseIfStatement 
   --------------- 
   `ElseIfStatement: (else|otherwise) if Expression Body` 
   This class handles chained else-if statements */

function ElseIfStatement() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(ElseIfStatement,ASTBase);

/* /! 
    
   properties nextIf 
   !/ */
ElseIfStatement.prototype.parse = function () {
  this.reqValue('else', 'otherwise');
  this.reqValue('if');
  this.lock();
  /* return the consumed 'if', to parse as a normal 'IfStatement' */
  this.lexer.returnToken();
  this.nextIf = this.req(IfStatement);
}

/* ElseStatement 
   ------------- 
   `ElseStatement: ('else'|'otherwise') (Statement | Body) ` 
   This class handles closing "else" statements */

function ElseStatement() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(ElseStatement,ASTBase);

/* /! 
    
   properties body 
   !/ */
ElseStatement.prototype.parse = function () {
  this.reqValue('else', 'otherwise');
  this.lock();
  this.body = this.req(Body);
}

/* Loops 
   ===== 
   LiteScript provides the standard js and C `while` loop, but also provides a `until` loop 
   and a post-condition `do loop while|until` 
   ## WhileUntilExpression 
   common symbol for loops conditions. Is the word 'while' or 'until' followed by a boolean-Expression 
   `WhileUntilExpression: ('while'|'until') boolean-Expression` */

function WhileUntilExpression() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(WhileUntilExpression,ASTBase);

/* /! 
    
   properties expr 
   !/ */
WhileUntilExpression.prototype.parse = function () {
  this.name = this.reqValue('while', 'until');
  this.lock();
  this.expr = this.req(Expression);
}

/* DoLoop 
   ------ 
   `DoLoop: do [pre-WhileUntilExpression] [":"] Body loop [post-WhileUntilExpression]` 
   do-loop has optional pre-condition and optional post-condition 
   ###Case 1) do-loop without any condition 
   a do-loop without any condition is an *infinite loop* (usually with a `break` statement inside) 
   Example: 
   ** 
   var x=1 
    
   do: 
    
   x++ 
   print x 
   when x is 10, break 
    
   loop 
   ** 
   ###Case 2) do-loop with pre-condition 
   A do-loop with pre-condition, is the same as a while|until loop 
   Example: 
   ** 
   var x=1 
    
   do while x<10 
    
   x++ 
   print x 
    
   loop 
   ** 
   ### Case 3) do-loop with post-condition 
   A do-loop with post-condition, execute the block, at least once, and after each iteration, 
   checks the post-condition, and loops `while` the expression is true 
   *or* `until` the expression is true 
   Example: 
   ** 
   var x=1 
    
   do: 
    
   x++ 
   print x 
    
   loop until x is 10 
   ** 
   ### Case 4) loop with both, pre and post-conditions. 
   You can create a do-loop with both conditions, pre and post, **but this is dicouraged** since it affects code-flow 
   understanding. 
   For maximun readability, you should choose a loop construction with the followin rules: 
   A) For single-condition loops 
   1) Use a `while` loop 
   2) Use a `until` loop 
   3) Use a `do: ... loop while|until` 
   B) For multi-condition loops 
   1) Use the previous list, add: `if condition, break` to the loop body. 
   ### Implementation */

function DoLoop() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(DoLoop,ASTBase);

/* /! 
    
   properties preWhileUntilExpression,body,postWhileUntilExpression 
   !/ */
DoLoop.prototype.parse = function () {
  this.reqValue('do');
  if (this.optValue('nothing')) {
    this.throwParseFailed('is do nothing');
  }
  this.optValue(":");
  this.lock();
  /* Get optional pre-condition */
  this.preWhileUntilExpression = this.opt(WhileUntilExpression);
  this.body = this.opt(Body);
  this.reqValue("loop");
  /* Get optional post-condition */
  this.postWhileUntilExpression = this.opt(WhileUntilExpression);
}

/* WhileUntilLoop 
   -------------- 
   `WhileUntilLoop: pre-WhileUntilExpression Body` 
   Execute the block `while` the condition is true or `until` the condition is true 
   while|until loops are simpler forms of loops. The `while` form, is the same as in C and js. 
   WhileUntilLoop derives from DoLoop, to use its `.produce()` method (it is a simple form of DoLoop) */

function WhileUntilLoop() {
  return DoLoop.prototype.constructor.apply(this,arguments);
}
__extends(WhileUntilLoop,DoLoop);

/* /! 
    
   properties preWhileUntilExpression, body 
   !/ */
WhileUntilLoop.prototype.parse = function () {
  this.preWhileUntilExpression = this.req(WhileUntilExpression);
  this.lock();
  this.body = this.opt(Body);
}

/* LoopControlStatement 
   -------------------- 
   `LoopControlStatement: (break|continue)` 
   This handles the `break` and `continue` keywords. 
   'continue' jumps to the start of the loop (as C & Js: 'continue') */

function LoopControlStatement() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(LoopControlStatement,ASTBase);

/* /! 
    
   properties control 
   !/ */
LoopControlStatement.prototype.parse = function () {
  this.control = this.reqValue('break', 'continue');
}

/* DoNothingStatement 
   ------------------ 
   `DoNothingStatement: do nothing` */

function DoNothingStatement() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(DoNothingStatement,ASTBase);

DoNothingStatement.prototype.parse = function () {
  this.reqValue('do');
  this.reqValue('nothing');
  this.lock();
}

/* For Statement 
   ============= */

function ForStatement() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(ForStatement,ASTBase);

/* /! 
    
   properties variant 
   !/ */
ForStatement.prototype.parse = function () {
  /* /! 
      
     declare valid me.createScope 
     !/ 
     We start with commonn `for...` code */
  this.reqValue('for');
  this.lock();
  /* Create a scope, for index and value vars */
  this.createScope();
  /* There are 3 variants of `ForStatement` in LiteScript, 
     we now require one of them */
  this.variant = this.req(ForEachProperty, ForIndexNumeric, ForEachInArray);
}

/* ##Variant 1) **for each property** to loop over **object property names** 
   Grammar: 
   `ForEachProperty: for each [own] property name-NameDeclaration in object-VariableRef` 
   where `name-VariableDecl` is a variable declared on the spot to store each property name, 
   and `object-VariableRef` is the object having the properties 
   if the optional `own` keyword is used, only instance properties will be looped 
   (no prototype chain properties) */

function ForEachProperty() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(ForEachProperty,ASTBase);

/* /! 
    
   properties ownOnly,indexVar,iterable, body 
   !/ */
ForEachProperty.prototype.parse = function () {
  /* /! 
      
     declare valid me.addToScope 
     declare valid me.globalVar 
     declare valid me.addToScope 
      
     !/ */
  this.reqValue('each');
  /* then check for optional `own` */
  this.ownOnly = this.ifOptValue('own');
  /* next we require: 'property', and lock. */
  this.reqValue('property');
  this.lock();
  /* Get index variable name (to store property names), register index var in the scope */
  this.indexVar = this.req(NameDeclaration);
  this.addToScope(this.indexVar, {type: this.globalVar("String").members.prototype});
  /* Then we require `in`, then the iterable-Expression (a object) */
  this.reqValue('in');
  this.iterable = this.req(Expression);
  /* Now, get the loop body */
  this.body = this.req(Body);
}

/* ##Variant 2) **for index=...** to create **numeric loops** 
   This `for` variant is just a verbose expressions of the standard C (and js) `for(;;)` loop 
   Grammar: 
   `ForIndexNumeric: for index-NameDeclaration = start-Expression [,|;] (while|until) condition-Expression [(,|;) increment-Statement]` 
   where `index-VariableDecl` is a numeric variable declared on the spot to store loop index, 
   `start-Expression` is the start value for the index (ussually 0) 
   `condition-Expression` is the condition to keep looping (`while`) or to end looping (`until`) 
   and `increment-Statement` is the statement used to advance the loop index. If ommited the default is `index++` 
   Note: You can use comma or semicolons between the expressions. */

function ForIndexNumeric() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(ForIndexNumeric,ASTBase);

/* /! 
    
   properties 
   indexVar,startIndex,conditionPrefix,endExpression,increment,body 
   !/ */
ForIndexNumeric.prototype.parse = function () {
  /* /! 
      
     declare valid me.addToScope 
     !/ 
     we require: a variable, a "=", and a value */
  this.indexVar = this.req(NameDeclaration);
  this.reqValue("=");
  this.lock();
  this.startIndex = this.req(Expression);
  this.addToScope(this.indexVar);
  /* comma|semicolon are optional */
  this.optValue(',', ";");
  /* get 'while|until|to' and condition */
  this.conditionPrefix = this.reqValue('while', 'until', 'to');
  this.endExpression = this.req(Expression);
  /* if a comma is next, expect Increment-Statement */
  if (this.optValue(',', ";")) {
    this.increment = this.req(SingleLineStatement);
  }
  /* Now, get the loop body */
  this.body = this.req(Body);
}

/* ##Variant 3) **for each in** to loop over **Array indexes and items** 
   Grammar: 
   `ForEachInArray: for [each] [index-NameDeclaration,]item-NameDeclaration in array-VariableRef` 
   where: 
   * `index-VariableDecl` is a variable declared on the spot to store each item index (from 0 to array.length) 
   * `item-VariableDecl` is a variable declared on the spot to store each array item (array[index]) 
   and `array-VariableRef` is the array to iterate over */

function ForEachInArray() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(ForEachInArray,ASTBase);

/* /! 
    
   properties 
   mainVar:NameDeclaration 
   indexVar:NameDeclaration 
   iterable 
   body 
   !/ */
ForEachInArray.prototype.parse = function () {
  /* /! 
      
     declare valid me.iterable.root.name.referencedName.itemType 
     declare valid me.addToScope 
     !/ 
     first, optional 'each' */
  this.optValue('each');
  /* Get index variable and value variable. 
     Keep it simple: index and value are always variables declared on the spot */
  this.mainVar = this.req(NameDeclaration);
  /* a comma means: previous var was 'index', so register as index and get main var */
  if (this.optValue(',')) {
    this.indexVar = this.mainVar;
    this.addToScope(this.indexVar);
    this.mainVar = this.req(NameDeclaration);
  } else if (this.optValue('at')) {
    this.indexVar = this.req(NameDeclaration);
    this.addToScope(this.indexVar);
  }
  /* end if 
     we now *require* `in` and the iterable (array) */
  this.reqValue('in');
  this.lock();
  this.iterable = this.req(Expression);
  /* Set mainvar type to iterator item-type, register main var in scope */
  if (this.iterable.root.name instanceof VariableRef && this.iterable.root.name.referencedName && this.iterable.root.name.referencedName.itemType) {
    this.mainVar.type = this.iterable.root.name.referencedName.itemType;
  }
  this.addToScope(this.mainVar);
  /* and then, get the loop body */
  this.body = this.req(Body);
}

/* -------------------------------- 
   ## AssignmentStatement 
   `AssignmentStatement: VariableRef ("="|"+="|"-="|"*="|"/=") Expression` */

function AssignmentStatement() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(AssignmentStatement,ASTBase);

/* /! 
    
   properties lvalue, rvalue 
   !/ */
AssignmentStatement.prototype.parse = function () {
  /* /! 
      
     declare valid this.scopeEvaluateAssignment 
     declare valid me.parent.preParsedVarRef 
     declare valid me.scopeEvaluateAssignment 
     declare valid me.lvalue.referencedName 
     !/ */
  if (this.parent.preParsedVarRef) {
    this.lvalue = this.parent.preParsedVarRef; /* pass VariableRef already parsed */
  } else {
    this.lvalue = this.req(VariableRef);
  }
  /* require an assignment symbol: ("="|"+="|"-="|"*="|"/=") */
  this.name = this.req('ASSIGN');
  this.lock();
  if (this.lexer.token.type === 'NEWLINE') { /* dangling assignment */
    this.rvalue = this.req(FreeObjectLiteral); /* assume Object Expression in freeForm mode */
  } else {
    this.rvalue = this.req(Expression);
  }
  /* if it's a direct assignment (=), evaluate assignment to: 
     * recognize x = require('y') and `import` the module constructing the dependency tree 
     * recognize module.exports = x as alias to `public` ans export the value 
     * assume types on simple assignments: `var x=new myClass` x.type=MyClass.name */
  if (this.name === '=') {
    this.scopeEvaluateAssignment(this.lvalue, this.lvalue.referencedName, this.rvalue);
  }
}

/* ## VariableRef 
   `VariableRef: ('--'|'++') IDENTIFIER (PropertyAccess|IndexAccess|FunctionAccess)* ('--'|'++')` 
   `VariableRef` is a Variable Reference 
   a VariableRef can include chained 'Accessors', which do: 
   * access a property of the object : `.`-> **PropertyAccess** and `[...]`->**IndexAccess** 
   * assume the variable is a function and perform a function call :  `(...)`->**FunctionAccess** */

function VariableRef() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(VariableRef,ASTBase);

/* /! 
    
   properties 
   preIncDec,varName:NameDeclaration, accessors,postIncDec 
   executes,hasSideEffecs 
   referencedName 
    
   declare thisClass 
   declare valid thisClass.parentClass.name 
   !/ */
VariableRef.prototype.parse = function () {
  var mainVarName, thisClass, requireCall, importParameter, thisModule, root, importedModule;
  this.preIncDec = this.optValue('--', '++');
  /* get var name, translate common aliases (me->this) 
     /! 
      
     declare valid me.getDeclaration 
     declare mainVarName:string 
     !/ */
  this.executes = false;
  mainVarName = this.req('IDENTIFIER');
  mainVarName = mainVarName.translate(IDENTIFIER_ALIASES);
  this.lock();
  /* replace 'super' by '<SuperClass>.prototype' */
  if (mainVarName === 'super') {
    thisClass = this.getParent(ClassDeclaration);
    if (!(thisClass)) {
      this.throwError("can't use 'super' outside a class method");
    }
    this.varName = thisClass.parentClass;
    this.lexer.returnToken();
    this.lexer.insertTokens([{value: '.'}, {type: 'IDENTIFIER', value: 'prototype'}]);
  } else {
    /* else (not lexical 'super') 
       var name should be in the scope 
       Note: *getDeclaration()* Always return a NameDeclaration. 
       It emits error and create a dummy one if not found. */
    this.varName = this.getDeclaration(mainVarName);
    if (mainVarName === 'null') {
      this.executes = true; /* allow 'null' on its own line as alias to 'do nothing' */
    }
  }
  this.referencedName = this.varName; /* default value. Accessors.parse() can change it */
  /* Now we check for accessors: 
     `.`->**PropertyAccess** 
     `[...]`->**IndexAccess** 
     `(...)`->**FunctionAccess** 
     Note: Accessors.parse will: 
     * Check for valid property names 
     * if the accessors are `., property access, the last property will be assigned to me.referencedName 
     * set parent.hasSideEffects=true if there are a function accessor 
     * set parent.executes=true if the last accessor is a function accessor 
     (performance) only if the next token in ".[(", parse Accessors */
  if ((k$indexof.call(".[(", this.lexer.token.value) >= 0)) {
    this.accessors = this.req(Accessors);
  }
  /* check for post-fix increment/decrement */
  this.postIncDec = this.optValue('--', '++');
  /* If this variable ref has ++ or --, IT IS CONSIDERED a "call to execution" in itself, 
     a "imperative statement", because it has side effects. 
     for example: `i++` has a "imperative" part, It means: "give me the value of i, and then increment it!") */
  if (this.preIncDec || this.postIncDec) {
    this.executes = true;
    this.hasSideEffecs = true;
  }
  /* Note: In LiteScript, *any VariableRef standing on its own line*, it's considered 
     a function call. A VariableRef on its own line means "execute this!", 
     so, when translating to js, it'll be translated as a function call, and `()` will be added. 
     If the VariableRef is marked as 'executes' then it's assumed 
     it is a statementin itself, so `()` will NOT be added. 
     Examples: 
     --------- 
     LiteScript   | Translated js  | Notes 
     -------------|----------------|------- 
     start        | start();       | "start", on its own, is considered a function call 
     start(10,20) | start(10,20);  | Normal function call 
     start 10,20  | start(10,20);  | function call w/o parentheses 
     start.data   | start.data();  | start.data, on its own, is considered a function call 
     i++          | i++;           | i++ is marked "executes", it is a statement in itself 
     null         | null;          | null is accepted alias to 'do noting' 
     Check for 'require' calls, 'import' module */
  if (mainVarName === 'require') {
    if (this.executes && this.accessors.list[0] instanceof FunctionAccess) {
      requireCall = this.accessors.list[0];
      if (requireCall.args[0].root.name instanceof StringLiteral) {
        /* get import paramter, and parent Module */
        importParameter = requireCall.args[0].root.name.getValue();
        thisModule = this.getParent(Module);
        thisModule.required.push(importParameter);
        /* 'import' the required module (recursive compilation) 
           `importModule` is a method of 'Project' (MainModule parent) 
           Assign module exports as this varRef 'returnType' */
        try {
          root = this.getRootNode();
          importedModule = root.parent.importModule(thisModule, importParameter);
          thisModule.imported.push(importedModule);
          if (importedModule.exports) {
            this.returnType = importedModule.exports;
          }
        } catch (e) {
          /* include source position in error message */
          e.message = this.lexer.posToString() + ". " + e.message;
          throw e;
        }
      }
    }
  }
}

/* --------------------------------- 
   This methos is only valid to be used in error reporting function accessors 
   will be output as "(...)", and index accessors as [...] */
VariableRef.prototype.toString = function () {
  var result, ac, ki$2, kobj$2;
  result = (this.preIncDec || "") + this.varName.name;
  if (this.accessors) {
    kobj$2 = this.accessors.list;
    for (ki$2 = 0; ki$2 < kobj$2.length; ki$2++) {
      ac = kobj$2[ki$2];
      result += ac.toString();
    }
  }
  return result + (this.postIncDec || "");
}

/* ----------------------- 
   PropertyAccess 
   -------------- 
   `.` -> PropertyAccess: get the property named "n" 
   `PropertyAccess: '.' IDENTIFIER` */

function PropertyAccess() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(PropertyAccess,ASTBase);

PropertyAccess.prototype.parse = function () {
  this.reqValue('.');
  this.lock();
  this.name = this.req(NameDeclaration);
}

PropertyAccess.prototype.toString = function () {
  /* /! 
      
     declare valid me.name.name 
     !/ */
  return '.' + this.name.name;
}

/* IndexAccess 
   ----------- 
   `[n]`-> IndexAccess: get the property named "n" / then nth index of the array 
   It resolves to the property value 
   `IndexAccess: '[' Expression ']'` */

function IndexAccess() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(IndexAccess,ASTBase);

IndexAccess.prototype.parse = function () {
  this.reqValue("[");
  this.lock();
  this.name = this.req(Expression);
  this.reqValue("]"); /* closer ] */
}

IndexAccess.prototype.toString = function () {
  return '[...]';
}

/* FunctionAccess 
   -------------- 
   `(...)` -> FunctionAccess: The object is assumed to be a function, and the code executed. 
   It resolves to the function return value. 
   `FunctionAccess: '(' [Expression,]* ')'` */

function FunctionAccess() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(FunctionAccess,ASTBase);

/* /! 
    
   properties args 
   !/ */
FunctionAccess.prototype.parse = function () {
  this.reqValue("(");
  this.lock();
  this.args = this.optSeparatedList(Expression, ",", ")"); /* comma-separated list of expressions, closed by ")" */
}

FunctionAccess.prototype.toString = function () {
  return '(...)';
}

/* ## Accessors 
   `Accessors: (PropertyAccess|FunctionAccess|IndexAccess)` 
   Accessors are: 
   `PropertyAccess: '.' IDENTIFIER` 
   `IndexAccess:    '[' Expression ']'` 
   `FunctionAccess: '(' [Expression,]* ')'` 
   Accessors can appear after a VariableRef (most common case) 
   but also after a String constant, a Regex Constant, 
   a ObjectLiteral and a ArrayLiteral 
   Examples: 
   myObj.item.fn(call)  <-- 3 accesors, two PropertyAccess and a FunctionAccess 
   myObj[5](param).part  <-- 3 accesors, IndexAccess, FunctionAccess and PropertyAccess 
   [1,2,3,4].indexOf(3) <-- 2 accesors, PropertyAccess and FunctionAccess 
   Actions: 
   `.`-> PropertyAccess: Search the property in the object and in his pototype chain. 
   It resolves to the property value 
   `[...]` -> IndexAccess: Same as PropertyAccess 
   `(...)` -> FunctionAccess: The object is assumed to be a function, and the code executed. 
   It resolves to the function return value. */

function Accessors() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(Accessors,ASTBase);

/* /! 
    
   properties list 
   !/ */
Accessors.prototype.parse = function () {
  var ownerVar, skipChecks, ac;
  /* We store the accessors in the property: .list 
     if the accessors node exists, .list will have **at least one item** */
  this.list = [];
  /* /! 
      
     declare ac:Accessors 
     declare ownerVar:NameDeclaration 
      
     declare valid ac.name.name 
     declare valid ac.keyword 
     declare valid me.getValidProperty 
     declare valid me.parent.referencedName 
     declare valid me.parent.executes 
     declare valid me.parent.hasSideEffects 
     declare valid me.parent.varName 
     !/ 
     Starting main variable name, to check property names */
  ownerVar = this.parent.varName;
  skipChecks = false;
  while (true) {
    /* get accessor */
    ac = this.parseDirect(this.lexer.token.value, AccessorsDirect);
    if (!(ac)) {
      break;
    }
    /* Store parsed accessor */
    this.list.push(ac);
    /* for PropertyAccess, check if the property name is valid 
       also set VariableRef.referencedName to last accessed property 
       Example: myvar.x.y.z => referencedName = z (member of y, member of x, member of scope var myvar) */
    if (ac instanceof PropertyAccess) {
      if (ownerVar && !(skipChecks)) {
        if (ownerVar.name === 'exports' || ownerVar.name === 'prototype') {
          skipChecks = true;
        } else {
          ac.name = this.getValidProperty(ownerVar, ac.name);
        }
      }
      this.parent.referencedName = ac.name; /* last property access is the referenced name */
      ownerVar = ac.name; /* for the next accessor, this ac is its owner */
    } else {
      /* else, if IndexAccess or FunctionAccess: we stop check valid property names 
         also we dont know the referenced name (here, at compile time) 
         we dont know the function call result or the item stored */
      ownerVar = undefined;
      this.parent.referencedName = undefined;
      skipChecks = true;
    }
    /* if the very last accesor is "(", it means the entire expression is a function call, 
       it's a call to "execute code", so it's a imperative statement on it's own. 
       if any accessor is a function call, this statement is assumed to have side-effects */
    this.parent.executes = ac.keyword === "(";
    if (this.parent.executes) {
      this.parent.hasSideEffects = true;
    }
  }
  /* loop, continue parsing accesors */
  if (this.list.length === 0) {
    this.throwParseFailed("no accessors found");
  }
  return;
}

/* ----------------------- 
   Operand 
   ------- 
   `Operand: 
   (NumberLiteral|StringLiteral|RegExpLiteral 
   |ParenExpression|ArrayLiteral|ObjectLiteral 
   |FunctionDeclaration 
   |VariableRef) [Accessors]* 
   Examples: 
   4 + 3 : Operand Oper Operand 
   -4    : UnaryOper Operand 
   A `Operand` is the data on which the operator operates. 
   It's the left and right part of a binary operator. 
   It's the data affected (righ) by a UnaryOper. 
   To make parsing faster, associate a token type/value, 
   with exact AST class to call parse() on. */
OPERAND_DIRECT_TYPE = {'STRING': StringLiteral, 'NUMBER': NumberLiteral, 'REGEX': RegExpLiteral};
OPERAND_DIRECT_TOKEN = {'(': ParenExpression, '[': ArrayLiteral, '{': ObjectLiteral, 'function': FunctionDeclaration};


function Operand() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(Operand,ASTBase);

/* /! 
    
   properties accessors 
   !/ */
Operand.prototype.parse = function () {
  /* if it's a NUMBER: it is NumberLiteral, if it's a STRING: it is StringLiteral (also for REGEX) 
     or, upon next token, cherry pick which AST nodes to try, 
     '(':ParenExpression,'[':ArrayLiteral,'{':ObjectLiteral,'function': FunctionDeclaration */
  this.name = this.parseDirect(this.lexer.token.type, OPERAND_DIRECT_TYPE) || this.parseDirect(this.lexer.token.value, OPERAND_DIRECT_TOKEN);
  /* if it is a literal ParenExpression or FunctionDeclaration 
     besides base value, operands can have accessors. For example: `"string".length` , `myObj.fn(10)` 
     Now we check for accessors: `.`->**PropertyAccess** `[...]`->**IndexAccess** `(...)`->**FunctionAccess** 
     (performance) only if the right token. 
     Note: [Accessors] can set: parent.referencedName, parent.executes and parent.hasSideEffects */
  if (this.name) {
    if ((k$indexof.call(".[(", this.lexer.token.value) >= 0)) {
      this.accessors = this.opt(Accessors);
    }
  } else {
    /* else, (if not literal, ParenExpression or FunctionDeclaration) 
       it must be a variable ref */
    this.name = this.req(VariableRef);
  }
}

/* end if 
   end Operand 
   Oper 
   ---- 
   `Oper: (bitwise(and|or|xor)|>>|<< 
   |'^'|'*'|'/'|'+'|'-'|mod 
   |([is]instance of|instanceof) 
   |'>'|'<'|'>='|'<='|is|'==='|isnt|is not|!==' 
   |and|but|or 
   |not|in 
   |has property 
   |? true-Expression : false-Expression)` 
   An Oper sits between two Operands ("Oper" is a "Binary Operator", different from *UnaryOperators* which optionally precede a Operand) 
   If an Oper is found after an Operand, a second Operand is expected. 
   Operators can include: 
   * arithmetic operations "*"|"/"|"+"|"-" 
   * boolean operations "and"|"or" 
   * `in` collection check.  (js: `indexOx()>=0`) 
   * instance class checks   (js: instanceof) 
   * short-if ternary expressions ? : 
   * bit operations (bitwise/shift) 
   * `has property` object property check (js: `propName in object`) */

function Oper() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(Oper,ASTBase);

/* /! 
    
   properties 
   negated 
   left:Operand,right:Operand 
   pushed,precedence 
    
   !/ */
Oper.prototype.parse = function () {
  /* /! 
      
     declare valid me.calcPrecedence 
     !/ 
     Get next token, require an OPER */
  this.name = this.req('OPER');
  this.lock();
  /* A) validate double-word opers 
     A.1) validate `instance of` */
  if (this.name === 'instance') {
    this.name += ' ' + this.reqValue('of');
  } else if (this.name === 'has') {
    /* A.2) validate `has|hasnt property` */
    this.name += ' ' + this.reqValue('property');
  }
   else if (this.name === 'hasnt') {
    this.negated = true; /* set the 'negated' flag */
    this.name += 'has ' + this.reqValue('property');
  }
  /* A.3) validate `bitwise` */
  if (this.name === 'bitwise') {
    this.name += ' ' + this.reqValue('and', 'or', 'xor');
  } else if (this.name === 'not') {
    /* A.4) also, check if we got a `not` token. 
       In this case we require the next token to be `in` 
       `not in` is the only valid (not-unary) *Oper* starting with `not` */
    this.negated = true;
    this.name = this.reqValue('in'); /* require 'not in' */
  }
   else if (this.name === 'isnt') {
    /* B) Synonyms 
       else, check for `isnt`, which we treat as `!==`, `negated is` */
    this.negated = true;
    this.name = 'is'; /* treat as 'Negated is' */
  }
   else if (this.name === 'instanceof') {
    /* else check for `instanceof`, (old habits die hard) */
    this.name = 'instance of';
  }
  /* end if 
     C) Variants on 'is...' */
  if (this.name === 'is') {
    /* C.1) is not 
       Check for `is not`, which we treat as `isnt` rather than `is ( not`. */
    if (this.optValue('not')) {
      /* --> is not... */
      this.negated = true;
    }
    /* C.2) accept 'is instance of'|'is instanceof' */
    if (this.optValue('instance')) {
      this.name = 'instance ' + this.reqValue('of');
    } else if (this.optValue('instanceof')) {
      this.name = 'instance of';
    }
  }
  /* end if 
     end special 'is' treatment 
     calculate operator precedence */
  this.calcPrecedence();
}

/* end Oper parse 
   ###calcPrecedence: 
   **Helper method to get Precedence Index (lower number means higher precedende)** */
Oper.prototype.calcPrecedence = function () {
  this.precedence = operatorsPrecedence.indexOf(this.name);
  if (this.precedence === -1) {
    debugger;
    throw new Error(("OPER '" + (this.name) + "' not found in the operator precedence list"));
  }
}

/* ###Boolean Negation: `not` 
   ####Notes for the javascript programmer 
   In LiteScript, the *boolean negation* `not`, 
   has LOWER PRECEDENCE than the arithmetic and logical operators. 
   In LiteScript: `if not a + 2 is 5` means `if not (a+2 is 5)` 
   In javascript: `if ( ! a + 2 === 5 )` means `if ( (!a)+2 === 5 )` 
   so remember not to mentally translate `not` to js `!` 
   UnaryOper 
   --------- 
   `UnaryOper: ('-'|new|type[" "]of|not|no|bitwise not) ` 
   A Unary Oper is an operator acting on a single operand. 
   Unary Oper inherits from Oper, so both are `instance of Oper` 
   Examples: 
   1) `not`     *boolean negation*     `if not a is b` 
   2) `-`       *numeric unary minus*  `-(4+3)` 
   2) `+`       *numeric unary plus*   `+4` (can be ignored) 
   3) `new`     *instantiation*        `x = new classes[2]()` 
   4) `type of` *type name access*     `type of x is 'string'` 
   5) `no`      *'falsey' check*       `if no options then options={}` 
   6) `bitwise not` *bit-unary-negation* `a = bitwise not xC0 + 5` */

function UnaryOper() {
  return Oper.prototype.constructor.apply(this,arguments);
}
__extends(UnaryOper,Oper);

UnaryOper.prototype.parse = function () {
  this.name = this.reqValue('new', '+', '-', 'not', 'no', 'typeof', 'type', 'bitwise');
  /* Check for `type of` - we allow "type" as var name, but recognize "type of" as UnaryOper */
  if (this.name === 'type') {
    if (this.optValue('of')) {
      this.name = 'type of';
    } else {
      this.throwParseFailed('expected "of" after "type"');
    }
  }
  /* Lock, we have a unary pre-operator */
  this.lock();
  /* Rename - and + to 'unary -' and 'unary +' 
     'typeof' to 'type of' */
  if (this.name === '-') {
    this.name = 'unary -';
  } else if (this.name === '+') {
    this.name = 'unary +';
  }
   else if (this.name === 'typeof') {
    this.name = 'type of';
  }
   else if (this.name === 'bitwise') {
    /* if its 'bitwise', must be 'bitwise not' for an UnaryOper */
    this.name += ' ' + this.reqValue('not');
  }
  /* end if 
     calculate precedence - Oper.calcPrecedence() */
  this.calcPrecedence();
}

/* end parse 
   ----------- 
   ## Expression 
   `Expression: [UnaryOper] Operand [Oper [UnaryOper] Operand]*` 
   The expression class parses intially a *flat* array of nodes. 
   After the expression is parsed, a *Expression Tree* is created based on operator precedence. */

function Expression() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(Expression,ASTBase);

/* /! 
    
   properties operandCount, root 
   !/ */
Expression.prototype.parse = function () {
  var arr, unary, operator;
  /* /! 
      
     declare valid me.growExpressionTree 
     declare valid me.root.name.type 
     !/ */
  arr = [];
  this.operandCount = 0;
  while (true) {
    /* Get optional unary operator */
    unary = this.opt(UnaryOper);
    if (unary) {
      arr.push(unary);
      this.lock();
    }
    /* Get operand */
    arr.push(this.req(Operand));
    this.operandCount += 1;
    this.lock();
    /* (performance) Fast exit for common tokens: `=` `,` and `)` means end of expression. */
    if (this.lexer.token.type === 'ASSIGN' || (k$indexof.call([')', ','], this.lexer.token.value) >= 0)) {
      break;
    }
    /* optional newline **before** Oper 
       To allow a freeForm mode on expressions, we look ahead, and if the first token in the next line is OPER 
       we consume the NEWLINE, allowing multiline expressions. The exception is ArrayLiteral, brecause in fre-form mode 
       the next item in the array, can start with a unary operator */
    if (this.lexer.token.type === 'NEWLINE' && !((this.parent instanceof ArrayLiteral))) {
      this.opt('NEWLINE'); /* consume newline */
      if (this.lexer.token.type !== 'OPER') { /* the first token in the next line isnt OPER (+,and,or,...) */
        this.lexer.returnToken(); /* return NEWLINE */
        break; /* end Expression */
      }
    }
    /* Try to parse next token as an operator */
    operator = this.opt(Oper);
    if (operator) {
      /* If it was an (binary) operator, store, and continue because we expect another operand */
      arr.push(operator);
      /* (dangling expresion) if an oper is left at the end of a line, the expression continues on the next line */
      this.opt('NEWLINE');
      continue;
    } else {
      break; /* no more operators, end of expression */
    }
  }
  /* end if 
     loop 
     Now we analize precedence, and create a tree from me.arr[] */
  this.growExpressionTree(arr);
  /* (prettier generated code)if it's only one operand we give the expression the type of the operand */
  if (this.operandCount === 1) {
    this.type = this.root.name.type;
  }
}

/* end method Expression.parse() 
   Grow The Expression Tree 
   ======================== 
   Growing the expression AST 
   -------------------------- 
   By default, for every expression, the parser creates a *flat array* 
   of UnaryOper, Operands and Operators. 
   `Expression: [UnaryOper] Operand [Oper [UnaryOper] Operand]*` 
   For example, `not 1 + 2 * 3 is 5`, turns into: 
   me.arr =  ['not','1','+','2','*','3','is','5'] 
   In this method we create the tree, by pushing down operands, 
   according to operator precedence. 
   Te process runs until there is only one operator left in the root node 
   (the one with lower precedence) 
   For example, `not 1 + 2 * 3 is 5`, turns into: 
   <pre> 
   >   not 
   >      \ 
   >      is 
   >     /  \ 
   >   +     5 
   >  / \ 
   > 1   * 
   >    / \ 
   >    2  3 
   </pre> 
   `3 in a and not 4 in b` 
   <pre> 
   >      and 
   >     /  \ 
   >   in    not 
   >  / \     | 
   > 3   a    in 
   >         /  \ 
   >        4   b 
   </pre> 
   `3 in a and 4 not in b` 
   <pre> 
   >      and 
   >     /  \ 
   >   in   not-in 
   >  / \    / \ 
   > 3   a  4   b 
   > 
   </pre> 
   `-(4+3)*2` 
   <pre> 
   >   * 
   >  / \ 
   > -   2 
   >  \ 
   + 
   / \ 
   4   3 
   </pre> 
   Expression.growExpressionTree() 
   ------------------------------- */
Expression.prototype.growExpressionTree = function (arr) {
  var pos, minPrecedenceInx, item, inx, ki$3, kobj$3, oper;
  /* /! 
      
     declare debug 
     declare item 
     declare valid item.name.name 
     declare valid item.pushed 
     declare valid item.precedence 
      
     !/ 
     while there is more than one operator in the root node... */
  while (arr.length > 1) {
    /* find the one with highest precedence (lower number) to push down 
       (on equal precedende, we use the leftmost) 
       compile if debug 
       var d="Expr.TREE: " 
       for item at inx in arr 
       if item instanceof Oper 
       d+=" "+item.name 
       if item.pushed 
       d+="-v" 
       d+=" " 
       else 
       d+=" "+item.name.name 
       debug d 
       end compile */
    pos = -1;
    minPrecedenceInx = 100;
    kobj$3 = arr;
    for (ki$3 = 0; ki$3 < kobj$3.length; ki$3++) {
      item = kobj$3[ki$3];
      inx = ki$3;
      debug(("item at " + inx + " " + (item.name) + ", Oper? " + (item instanceof Oper) + ". precedence:"), item.precedence);
      if (item instanceof Oper) {
        if (!(item.pushed) && item.precedence < minPrecedenceInx) {
          pos = inx;
          minPrecedenceInx = item.precedence;
        }
      }
    }
    /* end for 
       control */
    if (pos < 0) {
      this.throwError("can't find high precedence operator");
    }
    /* Un-flatten: Push down the operands a level down */
    oper = arr[pos];
    oper.pushed = true;
    if (oper instanceof UnaryOper) {
      /* control 
         compile if debug 
         if pos is arr.length 
         me.throwError("can't get RIGHT operand for unary operator '#{oper}'") 
         end compile 
         if it's a unary operator, take the only (right) operand, and push-it down the tree */
      oper.right = arr.splice(pos + 1, 1)[0];
    } else {
      /* control 
         compile if debug 
         if pos is arr.length 
         me.throwError("can't get RIGHT operand for binary operator '#{oper}'") 
         if pos is 0 
         me.throwError("can't get LEFT operand for binary operator '#{oper}'") 
         end compile 
         if it's a binary operator, take the left and right operand, and push-them down the tree */
      oper.right = arr.splice(pos + 1, 1)[0];
      oper.left = arr.splice(pos - 1, 1)[0];
    }
  }
  /* end if 
     loop until there's only one operator 
     Store the root operator */
  this.root = arr[0];
}

/* end method 
   ----------------------- 
   ## Literal 
   This class groups: NumberLiteral, StringLiteral, RegExpLiteral, ArrayLiteral and ObjectLiteral */

function Literal() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(Literal,ASTBase);

/* /! 
    
   properties referencedName:NameDeclaration, type:NameDeclaration 
    
   !/ */
Literal.prototype.getClass = function () {
  throw new Error('abstract');
}

Literal.prototype.getValue = function () {
  return this.name;
}

Literal.prototype.setType = function () {
  this.referencedName = this.getClass();
  this.type = this.referencedName.ownMember('prototype');
}

/* NumberLiteral 
   ------------- 
   `NumberLiteral: NUMBER` 
   A numeric token constant. Can be anything the lexer supports, including scientific notation 
   , integers, floating point, or hex. */

function NumberLiteral() {
  return Literal.prototype.constructor.apply(this,arguments);
}
__extends(NumberLiteral,Literal);

NumberLiteral.prototype.parse = function () {
  this.name = this.req('NUMBER');
  this.setType();
}

NumberLiteral.prototype.getClass = function () {
  return this.globalVar('Number');
}

/* StringLiteral 
   ------------- 
   `StringLiteral: STRING` 
   A string constant token. Can be anything the lexer supports, including single or double-quoted strings. 
   The token include the enclosing quotes */

function StringLiteral() {
  return Literal.prototype.constructor.apply(this,arguments);
}
__extends(StringLiteral,Literal);

StringLiteral.prototype.parse = function () {
  this.name = this.req('STRING');
  this.setType();
}

StringLiteral.prototype.getClass = function () {
  return this.globalVar('String');
}

StringLiteral.prototype.getValue = function () {
  return this.name.slice(1, -1); /* remove quotes */
}

/* RegExpLiteral 
   ------------- 
   `RegExpLiteral: REGEX` 
   A regular expression token constant. Can be anything the lexer supports. */

function RegExpLiteral() {
  return Literal.prototype.constructor.apply(this,arguments);
}
__extends(RegExpLiteral,Literal);

RegExpLiteral.prototype.parse = function () {
  this.name = this.req('REGEX');
  this.setType();
}

RegExpLiteral.prototype.getClass = function () {
  return this.globalVar('RegExp');
}

/* ArrayLiteral 
   ------------ 
   `ArrayLiteral: '[' (Expression,)* ']'` 
   ** 
    
   An array definition, such as `a = [1,2,3]` 
   or 
    
   ``` 
   a = [ 
   "January" 
   "February" 
   "March" 
   ] 
   ``` 
    
   ** */

function ArrayLiteral() {
  return Literal.prototype.constructor.apply(this,arguments);
}
__extends(ArrayLiteral,Literal);

/* /! 
    
   properties items 
   !/ */
ArrayLiteral.prototype.parse = function () {
  this.reqValue('[');
  this.lock();
  this.name = this.declareName(("[ArrayLiteral]" + (this.positionText())));
  this.items = this.optSeparatedList(Expression, ',', ']'); /* closer "]" required */
  this.setType();
}

ArrayLiteral.prototype.getClass = function () {
  return this.globalVar('Array');
}

/* ## ObjectLiteral 
   `ObjectLiteral: '{' NameValuePair* '}'` 
   Defines an object with a list of key value pairs. This is a JavaScript-style definition. 
   `x = {a:1,b:2,c:{d:1}}` */

function ObjectLiteral() {
  return Literal.prototype.constructor.apply(this,arguments);
}
__extends(ObjectLiteral,Literal);

/* /! 
    
   properties items 
   !/ */
ObjectLiteral.prototype.parse = function () {
  this.reqValue('{');
  this.lock();
  this.items = this.optSeparatedList(NameValuePair, ',', '}'); /* closer "]" required */
  this.setType();
}

ObjectLiteral.prototype.getClass = function () {
  return this.globalVar('Object');
}

/* FreeObjectLiteral 
   ----------------- 
   Defines an object with a list of key value pairs. 
   Each pair can be in it's own line. A indent denotes a new level deep. 
   FreeObjectExpressions are triggered by a "danglin assignment" 
   Examples: 
   ** 
    
   var x =            // <- dangling assignment 
   a: 1 
   b:           // <- dangling assignment 
   b1:"some" 
   b2:"cofee" 
    
    
   var x = 
   a:1 
   b:2 
   c: 
   d:1 
   months: ["J","F", 
   "M","A","M","J", 
   "J","A","S","O", 
   "N","D" ] 
    
    
   var y = 
   c:{d:1} 
   trimester:[ 
   "January" 
   "February" 
   "March" 
   ] 
   getValue: function(i) 
   return y.trimester[i] 
   ** */

function FreeObjectLiteral() {
  return ObjectLiteral.prototype.constructor.apply(this,arguments);
}
__extends(FreeObjectLiteral,ObjectLiteral);

/* /! 
    
   properties indent,items 
   !/ */
FreeObjectLiteral.prototype.parse = function () {
  this.lock();
  /* get items: optional comma separated, closes on de-indent, at least one required */
  this.indent = this.parent.indent;
  this.items = this.reqSeparatedList(NameValuePair, ',');
  this.setType();
}

/* NameValuePair 
   ------------- 
   `NameValuePair: (IDENTIFIER|STRING|NUMBER) ':' Expression` 
   A single definition in a `ObjectLiteral` 
   a `property-name: value` pair. */

function NameValuePair() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(NameValuePair,ASTBase);

/* /! 
    
   properties value 
   !/ */
NameValuePair.prototype.parse = function () {
  /* /! 
      
     declare valid me.parent.name.addMember 
     !/ */
  this.name = this.req('IDENTIFIER', 'STRING', 'NUMBER');
  this.reqValue(':');
  this.lock();
  /* if it's a "dangling assignment", we assume FreeObjectLiteral */
  if (this.lexer.token.type === 'NEWLINE') {
    this.value = this.req(FreeObjectLiteral);
  } else {
    this.value = this.req(Expression);
  }
}

/* ParenExpression 
   --------------- 
   `ParenExpression: '(' Expression ')'` 
   An expression enclosed by parentheses, like `(a + b)`. */

function ParenExpression() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(ParenExpression,ASTBase);

/* /! 
    
   properties expr:Expression 
   !/ */
ParenExpression.prototype.parse = function () {
  this.reqValue('(');
  this.lock();
  this.expr = this.req(Expression);
  this.reqValue(')');
}

/* ## FunctionDeclaration 
   `FunctionDeclaration: 'function NameDeclaration ["(" [VariableDecl,]* ")"] [returns type-VariableRef] Body` 
   Functions: parametrized pieces of callable code. */

function FunctionDeclaration() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(FunctionDeclaration,ASTBase);

/* /! 
    
   properties specifier,paramsDeclarations,body 
   !/ */
FunctionDeclaration.prototype.parse = function () {
  /* /! 
      
     declare valid me.parent.isAdjectivated 
     !/ */
  this.specifier = this.reqValue('function');
  this.lock();
  this.name = this.opt(NameDeclaration);
  /* if it is not anonymous, add function name to parent scope 
     if its 'public' add to exports */
  if (this.name) {
    this.addToScope(this.name);
    if (this.parent.isAdjectivated('public')) {
      this.addToExport(this.name);
    }
  }
  /* A function has a scope for vars declared in it's body 
     Starts populated by 'this' and 'arguments.length' */
  this.createFunctionScope();
  /* get parameter members, and function body */
  this.parseParametersAndBody();
}

/* end parse 
   ###parseParametersAndBody() 
   This method is shared by functions, constructors and methods */
FunctionDeclaration.prototype.parseParametersAndBody = function () {
  /* if there are no `()` after `function`, we assume `()` */
  if (this.lexer.token.type === 'NEWLINE') {
    /* -> assume "()" (no parameters) */
    null;
  } else {
    /* else, parse parameter members: `'(' [VariableDecl,] ')'` */
    this.reqValue('(');
    this.paramsDeclarations = this.optSeparatedList(VariableDecl, ',', ')');
    if (this.optValue('returns')) {
      /* auto-capitalize core classes */
      if ((k$indexof.call(['string', 'array', 'number', 'object', 'function', 'boolean'], this.lexer.token.value) >= 0)) {
        this.lexer.token.value = this.lexer.token.value[0].toUpperCase() + this.lexer.token.value.slice(1);
      }
      this.returnType = this.req(VariableRef);
    }
    /* Add parameters names, to function scope */
    this.addVarsToScope(this.paramsDeclarations);
  }
  /* now get function body */
  this.body = this.req(Body);
}

/* ## ClassDeclaration 
   `ClassDeclaration: class NameDeclaration [[","] prototype is VariableRef] Body` 
   Defines a new class with an optional parent class. properties and methods go inside the block. */

function ClassDeclaration() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(ClassDeclaration,ASTBase);

/* /! 
    
   properties 
   name:NameDeclaration 
   parentClass:NameDeclaration 
   prototypeMember:NameDeclaration 
   body 
   !/ */
ClassDeclaration.prototype.parse = function () {
  var varRefSuper, superPrototype;
  /* /! 
      
     declare valid me.name.name 
     declare valid me.parent.isAdjectivated 
     declare valid me.name.type 
     declare valid me.name.addMember 
     !/ */
  this.reqValue('class');
  this.lock();
  this.name = this.req(NameDeclaration);
  /* A class in js, is a function */
  this.name.type = this.globalVar('Function').members.prototype;
  /* Control: class names should be Capitalized */
  if (!(String.isCapitalized(this.name.name))) {
    this.lexer.sayErr(("class names should be Capitalized: class " + (this.name)));
  }
  /* Add class name, to parent scope */
  this.addToScope(this.name);
  if (this.parent.isAdjectivated('public')) {
    this.addToExport(this.name);
  }
  /* Now parse optional `,(super is|extends)` setting the super class 
     (aka oop classic:'inherits', or ES6: 'extends') 
     /! 
      
     declare 
     varRefSuper:VariableRef 
     superPrototype:NameDeclaration 
      
     declare valid me.parentClass.members.prototype 
     !/ */
  varRefSuper;
  this.optValue(',');
  if (this.optValue('super', 'extends')) {
    this.optValue('is');
    varRefSuper = this.req(VariableRef);
    this.parentClass = varRefSuper.referencedName;
  }
  /* #old syntax support- REMOVE LATER */
  if (this.optValue('inherits')) {
    this.reqValue('from');
    varRefSuper = this.req(VariableRef);
  }
  /* #end old syntax support 
     Get superclass prototype */
  if (varRefSuper) {
    this.parentClass = varRefSuper.referencedName;
    superPrototype = this.parentClass;
    if (this.parentClass.members.prototype) { /* it's a class */
      superPrototype = this.parentClass.members.prototype;
    }
  }
  if (!(this.parentClass)) {
    superPrototype = this.globalVar('Object').members.prototype;
  }
  /* We create the 'Class.prototype' NameDeclaration 
     All class's properties & methods will be added to 'prototype' as valid member names. 
     'prototype' starts with 'constructor' which is the class-funcion itself */
  this.name.addMember('prototype', {type: superPrototype}).addMember('constructor', {type: this.name});
  /* Now get class body. All properties and methods will be added as members of 'protoype' */
  this.body = this.opt(Body);
}

/* end parse 
   ## MethodDeclaration 
   `MethodDeclaration: '(method|constructor) [name] ["(" (VariableDecl,)* ")"] Body` 
   A `method` is a function defined in the prototype of a class. 
   A `method` has an implicit var `this` pointing to the specific instance the method is called on. 
   MethodDeclaration derives from FunctionDeclaration, so both are instance of FunctionDeclaration */

function MethodDeclaration() {
  return FunctionDeclaration.prototype.constructor.apply(this,arguments);
}
__extends(MethodDeclaration,FunctionDeclaration);

MethodDeclaration.prototype.parse = function () {
  var pos, lastInx, ownerObj, protoPa, parentClass;
  /* /! 
      
     declare valid me.name.type 
      
     declare ownerObj:NameDeclaration, ownerObjFrom:string 
     declare varRef: VariableRef 
      
     !/ */
  this.specifier = this.reqValue('method');
  this.lock();
  /* require method name */
  this.name = this.req(NameDeclaration);
  /* a 'method' is a function */
  this.name.type = this.globalVar('Function').members.prototype;
  /* Now get object to add function to: normally Class.prototype */
  ownerObj;
  /* #support old SYNTAX - REMOVE LATER - method xx **of** class 
     save pos */
  pos = this.lexer.getPos();
  while (this.lexer.nextToken()) {
    if (this.lexer.token.type === 'NEWLINE') {
      break;
    }
    lastInx = this.lexer.index;
    /* is 'of xxx' - create Grammar.AppendToDeclaration */
    if (this.optValue('of')) {
      this.lock();
      this.varRef = this.req(VariableRef);
      ownerObj = this.varRef.referencedName;
      if (!(ownerObj.members) || !(ownerObj.members.prototype)) {
        this.throwError('of ' + this.varRef.toString() + ' no prototype found/not defined');
      }
      if (!(this.varRef.accessors)) {
        this.varRef.accessors = new Accessors(this);
        this.varRef.accessors.list = [];
      }
      protoPa = new PropertyAccess(this);
      protoPa.name = {name: 'prototype'};
      this.varRef.accessors.list.push(protoPa);
      ownerObj = ownerObj.members.prototype;
      /* restore pos */
      this.lexer.setPos(pos);
      /* remove 'of' */
      this.lexer.infoLine.tokens.splice(lastInx, 20);
    }
  }
  /* loop */
  this.lexer.setPos(pos);
  /* #end support old SYNTAX - */
  if (!(ownerObj)) {
    /* Get the object where this method should be attached to */
    parentClass = this.getParent(ClassDeclaration);
    if (!(parentClass)) {
      this.throwError("'method' declaration outside class/append declaration. Check indent");
    }
    if (parentClass instanceof AppendToDeclaration) {
      /* inside a "append to" -> assign to exact object */
      ownerObj = parentClass.referenced;
      this.varRef = parentClass.varRef; /* get varRef from append to, to out at function production */
    } else {
      /* inside a class -> assign to prototype */
      ownerObj = parentClass.name.members.prototype;
    }
  }
  /* add method name to ownerObj as valid new member 
     also name.parent is ownerObj, so name.toString() = OwnerObj.name +'.'+ name */
  ownerObj.addMember(this.name);
  this.name.parent = ownerObj;
  /* create method scope, initially populated by 'this' */
  this.createFunctionScope(ownerObj);
  /* now get parameters and body (as with any function) */
  this.parseParametersAndBody();
}

/* end parse 
   ## ConstructorDeclaration 
   `ConstructorDeclaration : 'constructor ["(" (VariableDecl,)* ")"] Body` 
   A `constructor` is the main function of the class. In js is the function-class body  (js: `function Class(...){... `) 
   The `constructor` method is called upon creation of the object, by the `new` operator. 
   The return value is the value returned by `new` operator, that is: the new instance of the class. 
   ConstructorDeclaration derives from MethodDeclaration, so it is also a instance of FunctionDeclaration */

function ConstructorDeclaration() {
  return MethodDeclaration.prototype.constructor.apply(this,arguments);
}
__extends(ConstructorDeclaration,MethodDeclaration);

ConstructorDeclaration.prototype.parse = function () {
  var parentClass;
  this.specifier = this.reqValue('constructor');
  this.lock();
  /* Get parent class NameDeclaration. The constructor function "represents" the class, is a function 
     whose name is the class name */
  parentClass = this.getParent(ClassDeclaration);
  if (!(parentClass)) {
    this.throwError('constructor found outside class declaration');
  }
  this.name = parentClass.name;
  /* The constructor (as any function), has a 'scope'. It captures all vars declared in its body. 
     Create constructor scope, initially populated by 'this:me.name.members.prototype' */
  this.createFunctionScope(this.name.members.prototype);
  /* now get parameters and body (as with any function) */
  this.parseParametersAndBody();
}

/* end parse 
   ------------------------------ 
   ## AppendToDeclaration 
   `AppendToDeclaration: append to (class|object) VariableRef Body` 
   Adds methods and properties to an existent object, e.g., Class.prototype */

function AppendToDeclaration() {
  return ClassDeclaration.prototype.constructor.apply(this,arguments);
}
__extends(AppendToDeclaration,ClassDeclaration);

/* /! 
    
   properties 
   referenced:NameDeclaration 
   body 
   !/ */
AppendToDeclaration.prototype.parse = function () {
  var toWhat, protoPa;
  this.req('append');
  this.req('to');
  this.lock();
  toWhat = this.req('class', 'object', 'namespace');
  this.optClass = toWhat === 'class';
  this.varRef = this.req(VariableRef);
  /* we take the referenced name as our own, and since we're recognized as 
     a 'ClassDeclaration', all methods and properties will be added 
     to the referenced object */
  this.referenced = this.varRef.referencedName;
  /* if optional 'class' keyword is present, we add to referenced.prototype */
  if (this.optClass) {
    if (!(this.referenced.members.prototype)) {
      this.referenced.addMember('prototype');
    }
    /* me.lexer.sayErr "'#{me.varRef.toString()}' has no prototype" */
    this.referenced = this.referenced.members.prototype;
    if (!(this.varRef.accessors)) {
      this.varRef.accessors = new Accessors(this);
      this.varRef.accessors.list = [];
    }
    protoPa = new PropertyAccess(this);
    protoPa.name = {name: 'prototype'};
    this.varRef.accessors.list.push(protoPa);
  }
  /* Now get body. ('methods' & 'properties' will be added to referenced object */
  this.body = this.req(Body);
}

/* FunctionCall 
   ------------ 
   `FunctionCall: VariableRef ["("] (Expression,) [")"]` */

function FunctionCall() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(FunctionCall,ASTBase);

/* /! 
    
   properties 
   args 
   !/ */
FunctionCall.prototype.parse = function (options) {
  /* /! 
      
     declare valid me.parent.preParsedVarRef 
     declare valid me.name.accessors 
     declare valid me.name.executes 
     !/ 
     Check for VariableRef. - can include (...) FunctionAccess */
  if (this.parent.preParsedVarRef) {
    /* VariableRef already parsed */
    this.name = this.parent.preParsedVarRef;
  } else {
    this.name = this.req(VariableRef);
  }
  /* if the last accessor is function call, this is already a FunctionCall */
  if (this.name.accessors && this.name.executes) {
    return; /* already a function call */
  }
  /* Here we assume is a function call without parentheses, a 'command' */
  if ((k$indexof.call(['NEWLINE', 'EOF'], this.lexer.token.type) >= 0)) {
    /* no more tokens, let's asume FnCall w/o parentheses and w/o parameters */
    return;
  }
  /* else, get parameters */
  this.args = this.optSeparatedList(Expression, ",");
}

/* ## DebuggerStatement 
   `DebuggerStatement: debugger` 
   When a debugger is attached, break at this point. */

function DebuggerStatement() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(DebuggerStatement,ASTBase);

DebuggerStatement.prototype.parse = function () {
  this.name = this.reqValue("debugger");
}

/* ## DeclareStatement 
   Declare statement allows you to forward-declare variable or object members. 
   Also allows to declare the valid accessors for externally created objects 
   when you dont want to create a class to use as type. 
   `DeclareStatement: 'declare (VariableDecl,)+` #declare valid types: declare type:string, type:NameDeclaration 
   `DeclareStatement: 'declare valid VariableRef` #declare valid chains: declare valid me.type.name.name 
   `DeclareStatement: 'declare global (VariableDecl,)` #declare global vars 
   `DeclareStatement: 'declare on IDENTIFIER (VariableDecl,)` #declare members on vars 
   `DeclareStatement: 'declare [forward] (VariableDecl,)+` #deprecated. */

function DeclareStatement() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(DeclareStatement,ASTBase);

/* /! 
    
   properties 
   names:VariableDecl array 
    
   !/ */
DeclareStatement.prototype.parse = function () {
  var parsed, mainVarName, mainVar, propName, newMember, varRef, varDecl, ki$4, kobj$4, option, ki$5, kobj$5;
  this.reqValue('declare');
  this.lock();
  /* /! 
      
     declare 
     mainVarName:string 
     mainVar:NameDeclaration 
     propName:string 
     inClass:ClassDeclaration 
      
     declare valid mainVar.members.prototype 
     declare valid inClass.name.members.prototype.ownMember 
     !/ */
  mainVarName;
  mainVar;
  propName;
  parsed = false;
  this.names = [];
  if (this.optValue('valid')) {
    if (this.lexer.token.value === ":") {
      this.lexer.returnToken();
    } else {
      mainVarName = this.req('IDENTIFIER');
      mainVarName = mainVarName.translate(IDENTIFIER_ALIASES);
      mainVar = this.findInScope(mainVarName);
      if (!(mainVar)) {
        this.throwError(("add valid properties: '" + mainVarName + "' not found in scope"));
      }
      this.names.push(mainVar);
      newMember;
      while (this.optValue('.')) {
        propName = this.req('IDENTIFIER');
        newMember = mainVar.ownMember(propName);
        if (!(newMember)) {
          newMember = mainVar.addMember(propName);
        }
        mainVar = newMember;
        this.names.push(newMember);
      }
      /* loop */
      parsed = true;
    }
  }
  if (!(parsed)) {
    if (this.optValue('on')) {
      /* Find the main name where this properties are being forward-declared. 
         If it doesnt exists, we create a "forward" declaration of the main var */
      varRef = this.req(VariableRef);
      /* read names, add to referenced */
      this.names = this.reqSeparatedList(VariableDecl, ',');
      kobj$4 = this.names;
      for (ki$4 = 0; ki$4 < kobj$4.length; ki$4++) {
        varDecl = kobj$4[ki$4];
        varDecl.name.isForward = true;
        varRef.referencedName.addMember(varDecl.name);
      }
    } else {
      /* else (if no 'on' keyword), is a list to declare forward variable names on the scope 
         get list of declared names. Add the names to the intended scope 
         add to scope as forward declare var names */
      option = this.optValue('global', 'forward', 'name') || 'types';
      if (option === 'name') {
        option = this.req('affinity');
      }
      this.names = this.reqSeparatedList(VariableDecl, ',');
      kobj$5 = this.names;
      for (ki$5 = 0; ki$5 < kobj$5.length; ki$5++) {
        varDecl = kobj$5[ki$5];
        if (option === 'forward') {
          varDecl.name.isForward = true;
          this.addToScope(varDecl.name);
        } else if (option === 'global') {
          this.createGlobalVar(varDecl.name.name);
        }
      }
    }
  }
}

/* CompilerStatement 
   ----------------- 
   `compiler` is a generic entry point to alter LiteScript compiler from source code. 
   It allows conditional complilation, setting compiler options, define macros(*) 
   and also allow the programmer to hook transformations on the compiler process itself(*). 
   (*) Not yet. 
   `CompilerStatement: (compiler|compile) (set|if|debugger|option) Body` 
   `set-CompilerStatement: compiler set (VariableDecl,)` 
   `conditional-CompilerStatement: 'compile if IDENTIFIER Body` */

function CompilerStatement() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(CompilerStatement,ASTBase);

/* /! 
    
   properties 
   kind, conditional:string 
   body 
   endLineInx 
   !/ */
CompilerStatement.prototype.parse = function () {
  var list, item, operandValue, aValue, ki$6, kobj$6;
  /* /! 
      
     declare list:VariableDecl array 
     !/ */
  this.reqValue('compiler', 'compile');
  this.lock();
  this.kind = this.reqValue('set', 'if', 'debugger', 'options');
  /* ### compiler set */
  if (this.kind === 'set') {
    /* get list of declared names, add to root node 'Compiler Vars' */
    list = this.reqSeparatedList(VariableDecl, ',');
    kobj$6 = list;
    for (ki$6 = 0; ki$6 < kobj$6.length; ki$6++) {
      item = kobj$6[ki$6];
      /* /! 
          
         declare valid item.assignedValue.operandCount 
         declare valid item.assignedValue.root.name 
         !/ */
      if (item.assignedValue.operandCount > 1) {
        this.throwError("compiler set: no expressions allowed");
      }
      operandValue = item.assignedValue.root.name;
      /* /! 
          
         declare valid operandValue.varName.name 
         declare valid operandValue.varName.hasOwnProperty 
         declare valid operandValue.varName.value 
         declare valid operandValue.getValue 
         !/ */
      aValue = true;
      if (operandValue instanceof VariableRef) {
        if (operandValue.varName.hasOwnProperty('value')) {
          aValue = operandValue.varName.value;
        } else {
          this.throwError(("compiler set: '" + (operandValue.varName.name) + "' has no value at compile-time"));
        }
      } else if (operandValue instanceof Literal) {
        aValue = operandValue.getValue();
      }
       else {
        this.throwError("compiler set: only literal values allowed");
      }
      this.getRootNode().parent.compilerVars.addMember(item.name, {value: aValue});
    }
  } else if (this.kind === 'if') {
    /* ### compiler if conditional compilation */
    this.conditional = this.req('IDENTIFIER');
    this.body = this.req(Body);
  }
   else if (this.kind === 'debugger') {
    /* ### other compile options 
       debug-pause the compiler itself, to debug compiling process */
    debugger;
  }
   else {
    this.lexer.sayErr('invalid compiler command');
  }
  this.endLineInx = this.lexer.lineInx; /* (prettier generated code) remember end line to out as comments in the generated code */
}

/* DefaultAssignment 
   ----------------- 
   `DefaultAssignment: default AssignmentStatement` 
   It is a common pattern in javascript to use a object parameters (named "options") 
   to pass misc options to functions. 
   Litescript provide a 'default' construct as syntax sugar for this common pattern 
   The 'default' construct is formed as an ObjectLiteral assignment, 
   but only the 'undfined' properties of the object will be assigned. 
   ** 
    
   function theApi(object,options,callback) 
    
   default options = 
   log: console.log 
   encoding: 'utf-8' 
   throwErrors: true 
   debug: 
   enabled: false 
   level: 2 
   end default 
    
   ...function body... 
    
   end function 
   ** 
   is equivalent to js's: 
   ** 
    
   function theApi(object,options,callback) { 
    
   //defaults 
   if (!options) options = {}; 
   if (options.log===undefined) options.log = console.log; 
   if (options.encoding===undefined) options.encoding = 'utf-8'; 
   if (options.throwErrors===undefined) options.throwErrors=true; 
   if (!options.debug) options.debug = {}; 
   if (options.debug.enabled===undefined) options.debug.enabled=false; 
   if (options.debug.level===undefined) options.debug.level=2; 
    
   ...function body... 
   } 
   ** */

function DefaultAssignment() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(DefaultAssignment,ASTBase);

/* /! 
    
   properties 
   assignment 
   !/ */
DefaultAssignment.prototype.parse = function () {
  this.reqValue('default');
  this.lock();
  this.assignment = this.req(AssignmentStatement);
}

/* End Statement 
   ------------- 
   `EndStatement: end (IDENTIFIER)* NEWLINE` 
   `end` is an **optional** end-block marker to ease code reading. 
   It marks the end of code blocks, and can include extra tokens referencing the construction 
   closed. (in the future) This references will be cross-checked, to help redude subtle bugs 
   by checking that the block ending here is the intended one. 
   If it's not used, the indentation determines where blocks end () 
   Example: `end if` , `end loop`, `end for each item` 
   Usage Examples: 
   ** 
    
   if a is 3 and b is 5 
   print "a is 3" 
   print "b is 5" 
   end if 
    
   loop while a < 10 
   a++ 
   b++ 
   end loop 
   ** */

function EndStatement() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(EndStatement,ASTBase);

/* /! 
    
   properties 
   references:string array 
   !/ */
EndStatement.prototype.parse = function () {
  var ref;
  this.reqValue('end');
  this.lock();
  this.references = [];
  /* The words after `end` are just 'loose references' to the block intended to be closed 
     We pick all the references up to EOL (or EOF) */
  while (!(this.opt('NEWLINE', 'EOF'))) {
    /* Get optional identifier reference 
       We save `end` references, to match on block indentation, 
       for Example: `end for` indentation must match a `for` statement on the same indent */
    ref = this.opt('IDENTIFIER');
    if (ref) {
      this.references.push(ref);
    }
  }
}

/* end loop 
   WaitForAsyncCall 
   ---------------- 
   `WaitForAsyncCall: wait for FunctionCall` 
   The `wait for` expression calls a normalized async function 
   and `waits` for the async function to execute the callback. 
   A normalized async function is an async function with the last parameter = callback(err,data) 
   The waiting is implemented by exisiting libs. 
   Example: `contents = wait for fs.readFile('myFile.txt','utf8')` */

function WaitForAsyncCall() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(WaitForAsyncCall,ASTBase);

/* /! 
    
   properties 
   call 
   !/ */
WaitForAsyncCall.prototype.parse = function () {
  this.reqValue('wait');
  this.lock();
  this.reqValue('for');
  this.call = this.req(FunctionCall);
}

/* LaunchStatement 
   --------------- 
   `LaunchStatement: 'launch' FunctionCall` 
   `launch` starts a generator function. 
   The generator function rus as a co-routine, (pseudo-parallel), 
   and will be paused on `wait for` statements. 
   The `launch` statement will return on the first `wait for` or `yield` of the generator */

function LaunchStatement() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(LaunchStatement,ASTBase);

/* /! 
    
   properties 
   call 
   !/ */
LaunchStatement.prototype.parse = function () {
  this.reqValue('launch');
  this.lock();
  this.call = this.reqValue(FunctionCall);
}

/* Adjective 
   --------- 
   `Adjective: (public|generator|shim|helper)` */

function Adjective() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(Adjective,ASTBase);

Adjective.prototype.parse = function () {
  this.name = this.reqValue("public", "generator", "shim", "helper");
}

/* ###a Helper method, Check validity of adjective-statement combination */
Adjective.prototype.validate = function (statement) {
  var validCombinations, valid;
  validCombinations = {public: ['class', 'function', 'var'], generator: ['function', 'method'], shim: ['function', 'method', 'class'], helper: ['function', 'method', 'class']};
  /* /! 
      
     declare valid:array 
     declare valid statement.keyword 
     !/ */
  valid = validCombinations[this.name] || ['-*none*-'];
  if (!(((k$indexof.call(valid, statement.keyword) >= 0)))) {
    this.throwError(("'" + (this.name) + "' can only apply to " + (valid.join('|')) + " not to '" + (statement.keyword) + "'"));
  }
  /* Also convert adjectives to Statement node properties to ease code generation */
  statement[this.name] = true;
}

/* Statement 
   --------- 
   A `Statement` is an imperative statment (command) or a control construct. 
   The `Statement` node is a generic container for all previously defined statements. 
   The generic `Statement` is used to define `Body: (Statement;)`, that is, 
   **Body** is a list of semicolon (or NEWLINE) separated **Statements**. 
   `Statement: [Adjective]* (ClassDeclaration|FunctionDeclaration 
   |IfStatement|ForStatement|WhileUntilLoop|DoLoop 
   |AssignmentStatement|FunctionCall 
   |LoopControlStatement|ThrowStatement 
   |TryCatch|ExceptionBlock 
   |ReturnStatement|PrintStatement) | DoNothingStatement | VariableRef (AssignmentStatement,FunctionCall)` */

function Statement() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(Statement,ASTBase);

/* /! 
    
   properties 
   adjectives: Adjective array 
   statement 
   preParsedVarRef 
    
   !/ */
Statement.prototype.parse = function () {
  var pos, adj, ki$7, kobj$7;
  /* debug show line and tokens */
  debug("");
  this.lexer.infoLine.dump();
  /* #support old SYNTAX - REMOVE LATER */
  pos = this.lexer.getPos();
  if (this.optValue('method')) {
    if (this.optValue('initialize')) {
      this.lexer.returnToken();
      this.lexer.token.value = 'constructor';
    } else {
      this.lexer.setPos(pos);
    }
  }
  /* #END support old SYNTAX - 
     First,fast-parse the statement by using a table. 
     We look up the token (keyword) in **StatementsDirect** table, and parse the specific AST node */
  this.statement = this.parseDirect(this.lexer.token.value, StatementsDirect);
  if (!(this.statement)) {
    /* If it was not found, try optional adjectives (zero or more). Adjectives precede statement keyword. 
       Recognized adjectives are: `(public|generator|shim|helper)`. */
    this.adjectives = this.optList(Adjective);
    /* Now re-try fast-parse */
    this.statement = this.parseDirect(this.lexer.token.value, StatementsDirect);
    if (!(this.statement)) {
      /* If the token wasn't on StatementsDirect, or parse failed, lets try DoNothingStatement 
         (It is not in StatementsDirect because starts wih 'do' as DoLoopStatement) */
      this.statement = this.opt(DoNothingStatement);
      if (!(this.statement)) {
        /* Last possibilities are: AssignmentStatement or FunctionCall 
           both starts with a VariableRef: 
           First **require** the VariableRef (performance) */
        this.preParsedVarRef = this.req(VariableRef);
        /* Then **require** one of AssignmentStatement or FunctionCall (this is the last option) 
           Note: both will use the pre-parsed VariableRef */
        this.statement = this.req(AssignmentStatement, FunctionCall);
      }
    }
  }
  /* end if - statement parse tries 
     If we reached here, we have parsed a valid statement 
     Check validity of adjective-statement combination */
  if (this.adjectives) {
    kobj$7 = this.adjectives;
    for (ki$7 = 0; ki$7 < kobj$7.length; ki$7++) {
      adj = kobj$7[ki$7];
      adj.validate(this.statement);
    }
  }
}

/* ###a helper method to check adjectives asosciated to this statement */
Statement.prototype.isAdjectivated = function (adjName) {
  var adj, ki$8, kobj$8;
  if (this.adjectives) {
    kobj$8 = this.adjectives;
    for (ki$8 = 0; ki$8 < kobj$8.length; ki$8++) {
      adj = kobj$8[ki$8];
      if (adj.name === adjName) {
        return true;
      }
    }
  }
}

/* ## Body 
   `Body: (Statement;)` 
   Body is a semicolon-separated list of statements (At least one) 
   `Body` is used for "Module" body, "class" body, "function" body, etc. 
   Anywhere a list of semicolon separated statements apply. */

function Body() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(Body,ASTBase);

/* /! 
    
   properties 
   statements: Statement array 
   !/ */
Body.prototype.parse = function () {
  /* start from parent indent to recognize "indented" body lines */
  this.indent = this.parent.indent;
  /* We use the generic ***ASTBase.reqSeparatedList*** to get a list of **Statement** symbols, 
     *semicolon* separated or in freeForm mode: one statement per line, closed when indent changes. */
  this.statements = this.reqSeparatedList(Statement, ";");
}

/* Single Line Statement 
   -------------------- 
   This construction is used when a statement is expected on the same line. 
   It is used by `IfStatement: if conditon-Expression (','|then) *SingleLineStatement*` 
   It is also used for the increment statemenf in for-while loops:`for x=0; while x<10 [,SingleLineStatement]` */

function SingleLineStatement() {
  return Body.prototype.constructor.apply(this,arguments);
}
__extends(SingleLineStatement,Body);

SingleLineStatement.prototype.parse = function () {
  if (this.lexer.token.type === 'NEWLINE') {
    this.lexer.returnToken();
    this.lock();
    this.lexer.sayErr(("Expected statement on the same line after '" + (this.lexer.token.toString()) + "'"));
  }
  /* normally: ReturnStatement, ThrowStatement, PrintStatement, AssignmentStatement, FunctionCall 
     but we parse any Statement */
  Body.prototype.parse.apply(this, arguments);
}

/* ## Module 
   The `Module` represents a complete source file. */

function Module() {
  return ASTBase.prototype.constructor.apply(this,arguments);
}
__extends(Module,ASTBase);

Module.prototype.parse = function () {
  /* We start by locking. There is no other construction to try, 
     if Module.parse() fails we abort compilation. */
  this.lock();
  /* Get Module body: Statements, separated by NEWLINE|';' closer:'EOF' */
  this.statements = this.optFreeFormList(Statement, ';', 'EOF');
}

/* end Module parse 
   ---------------------------------------- 
   Table-based (fast) Statement parsing 
   ------------------------------------ 
   This a extension to PEGs. 
   To make the compiler faster and easier to debug, we define an 
   object with name-value pairs: `"keyword" : AST node class` 
   We look here for fast-statement parsing, selecting the right AST node to call `parse()` on 
   based on `token.value`. (instead of parsing by ordered trial & error) 
   This table makes a direct parsing of almost all statements, thanks to a core definition of LiteScript: 
   Anything standing aline in it's own line, its an imperative statement (it does something, it produces effects). */
StatementsDirect = {'var': VarStatement, 'let': VarStatement, 'function': FunctionDeclaration, 'class': ClassDeclaration, 'append': AppendToDeclaration, 'constructor': ConstructorDeclaration, 'properties': PropertiesDeclaration, 'namespace': PropertiesDeclaration, 'method': MethodDeclaration, 'default': DefaultAssignment, 'if': IfStatement, 'when': IfStatement, 'for': ForStatement, 'while': WhileUntilLoop, 'until': WhileUntilLoop, 'do': DoLoop, 'break': LoopControlStatement, 'continue': LoopControlStatement, 'end': EndStatement, 'return': ReturnStatement, 'print': PrintStatement, 'throw': ThrowStatement, 'raise': ThrowStatement, 'fail': ThrowStatement, 'try': TryCatch, 'exception': ExceptionBlock, 'debugger': DebuggerStatement, 'declare': DeclareStatement, 'compile': CompilerStatement, 'compiler': CompilerStatement, 'wait': WaitForAsyncCall, 'launch': LaunchStatement};
AccessorsDirect = {'.': PropertyAccess, '[': IndexAccess, '(': FunctionAccess};
/* ------------ 
   Exports 
   A list of Grammar classes to export. */
Nodes = [ASTBase, Module, Statement, Body, SingleLineStatement, NameDeclaration, VariableRef, Accessors, PropertyAccess, IndexAccess, FunctionAccess, AssignmentStatement, VarStatement, VariableDecl, Oper, UnaryOper, Operand, Expression, ParenExpression, Literal, NumberLiteral, StringLiteral, RegExpLiteral, ArrayLiteral, ObjectLiteral, FreeObjectLiteral, NameValuePair, IfStatement, ElseIfStatement, ElseStatement, ForStatement, ForEachProperty, ForIndexNumeric, ForEachInArray, WhileUntilLoop, DoLoop, WhileUntilExpression, LoopControlStatement, FunctionDeclaration, FunctionCall, PrintStatement, EndStatement, DefaultAssignment, AppendToDeclaration, PropertiesDeclaration, ClassDeclaration, ConstructorDeclaration, MethodDeclaration, ThrowStatement, ReturnStatement, TryCatch, ExceptionBlock, DoNothingStatement, DeclareStatement, CompilerStatement, WaitForAsyncCall];
/* /! 
    
   declare v:ASTBase 
   !/ */
kobj$9 = Nodes;
for (ki$9 = 0; ki$9 < kobj$9.length; ki$9++) {
  v = kobj$9[ki$9];
  exports[v.name] = v;
}
exports.ASTBase = ASTBase;
exports.NameDeclaration = NameDeclaration;
exports.VariableDecl = VariableDecl;
exports.Expression = Expression;
exports.VariableRef = VariableRef;
exports.PropertyAccess = PropertyAccess;
exports.FunctionAccess = FunctionAccess;
exports.IndexAccess = IndexAccess;
exports.Module = Module;
exports.Literal = Literal;
exports.StringLiteral = StringLiteral;
exports.ObjectLiteral = ObjectLiteral;
exports.FreeObjectLiteral = FreeObjectLiteral;
exports.Body = Body;
exports.Statement = Statement;
exports.ThrowStatement = ThrowStatement;
exports.ClassDeclaration = ClassDeclaration;
exports.VarStatement = VarStatement;
exports.CompilerStatement = CompilerStatement;
exports.DeclareStatement = DeclareStatement;
exports.AssignmentStatement = AssignmentStatement;
exports.SingleLineStatement = SingleLineStatement;
exports.ReturnStatement = ReturnStatement;
exports.FunctionCall = FunctionCall;
exports.Operand = Operand;
exports.UnaryOper = UnaryOper;
exports.Oper = Oper;
exports.DefaultAssignment = DefaultAssignment;
exports.Accessors = Accessors;
exports.IfStatement = IfStatement;
exports.ElseIfStatement = ElseIfStatement;
exports.ElseStatement = ElseStatement;
exports.ForStatement = ForStatement;
exports.ForEachProperty = ForEachProperty;
exports.ForIndexNumeric = ForIndexNumeric;
exports.ForEachInArray = ForEachInArray;
exports.WhileUntilExpression = WhileUntilExpression;
exports.DoLoop = DoLoop;
exports.DoNothingStatement = DoNothingStatement;
exports.LoopControlStatement = LoopControlStatement;
exports.ParenExpression = ParenExpression;
exports.ArrayLiteral = ArrayLiteral;
exports.NameValuePair = NameValuePair;
exports.FunctionDeclaration = FunctionDeclaration;
exports.PrintStatement = PrintStatement;
exports.EndStatement = EndStatement;
exports.ConstructorDeclaration = ConstructorDeclaration;
exports.AppendToDeclaration = AppendToDeclaration;
exports.TryCatch = TryCatch;
exports.ExceptionBlock = ExceptionBlock;
exports.WaitForAsyncCall = WaitForAsyncCall;
exports.PropertiesDeclaration = PropertiesDeclaration;
