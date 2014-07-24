var Grammar, NL, util, OPER_TRANSLATION;

/* Producer JS 
   =========== 
   The `producer` module extends Grammar classes, adding a `produce()` method 
   to generate target code for the node. 
   The compiler calls the `.produce()` method of the root 'Module' node 
   in order to return the compiled code for the entire tree. 
   We extend the Grammar classes, so this module require the `Grammar` module. */
Grammar = require('./Grammar');
/* Utility 
   ------- */
NL = '\n';
util = require('./util');
/* /! 
    
   declare on String 
   translate 
    
   declare log 
   declare on log 
   error, warning 
    
   !/ 
   Operator Mapping 
   ================ 
   Many LiteScript operators can be easily mapped one-to-one with their JavaScript equivalents. */
OPER_TRANSLATION = {'no': '!', 'not': '!', 'unary -': '-', 'unary +': '+', 'type of': 'typeof', 'instance of': 'instanceof', 'is': '===', 'isnt': '!==', '<>': '!==', 'and': '&&', 'but': '&&', 'or': '||', 'mod': '%', 'has property': 'in', 'bitwise and': '&', 'bitwise or': '|', 'bitwise xor': '^', 'bitwise not': '~'};

function operTranslate(name) {
  return name.translate(OPER_TRANSLATION);
}

/* --------------------------------- 
   a helper function compilerVar(name) 
   return root.compilerVars[name].value */
Grammar.ASTBase.prototype.compilerVar = function (name) {
  var asked;
  asked = this.getRootNode().ownMember(name);
  if (asked) {
    return asked.value;
  }
}

/* --------------------------------- 
   outPrevLinesComments helper method: output comments from previous lines 
   before the statement */
Grammar.ASTBase.prototype.outPrevLinesComments = function () {
  var inx, preInx;
  /* /! 
      
     declare valid me.lexer.lastOutCommentLine 
     declare valid me.lexer.LineTypes.CODE 
     declare valid me.lexer.infoLines 
     declare infoLine 
     declare on infoLine 
     indent,text 
     !/ */
  inx = this.lineInx;
  if (inx < 1) {
    return;
  }
  if (!(this.lexer.lastOutCommentLine)) {
    this.lexer.lastOutCommentLine = -1;
  }
  /* find comment lines in the previous lines of code. */
  preInx = inx;
  while (preInx && preInx > this.lexer.lastOutCommentLine) {
    preInx -= 1;
    if (this.lexer.infoLines[preInx].type === this.lexer.LineTypes.CODE) {
      preInx += 1;
      break;
    }
  }
  /* Output prev comments lines (also blank lines) */
  this.outLinesAsComment(preInx, inx - 1);
}

/* end method 
   getEOLComment: get the comment at the end of the line */
Grammar.ASTBase.prototype.getEOLComment = function () {
  var inx, infoLine, lastToken;
  /* Check for "postfix" comments. These are comments that occur at the end of the line, 
     such as `a = 1 #comment`. We want to try to add these at the end of the current JavaScript line. 
     /! 
      
     declare valid me.lexer.lastOutCommentLine 
     declare valid me.lexer.LineTypes.CODE 
     declare valid me.lexer.infoLines 
      
     declare infoLine 
     declare on infoLine 
     indent,text,tokens 
      
     declare lastToken 
     declare on lastToken 
     type,value 
     !/ */
  inx = this.lineInx;
  infoLine = this.lexer.infoLines[inx];
  if (infoLine.tokens && infoLine.tokens.length) {
    lastToken = infoLine.tokens[infoLine.tokens.length - 1];
    if (lastToken.type === 'COMMENT') {
      return {COMMENT: lastToken.value};
    }
  }
}

/* -------------------------------- 
   JavaScript Producer Functions 
   ============================== 
   ### Body  
   A "Body" is an ordered list of statements. 
   "Body"s lines have all the same indent, representing a scope. 
   "Body"s are used for example, to parse an `if` statement body and `else` body, `for` loops, etc. */
Grammar.Body.prototype.produce = function () {
  var statement, ki$1, kobj$1;
  this.outCode.startNewLine();
  kobj$1 = this.statements;
  for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
    statement = kobj$1[ki$1];
    statement.produce();
  }
}

/* ### Module  
   Same as Body */
Grammar.Module.prototype.produce = function () {
  Grammar.Body.prototype.produce.apply(this, arguments);
}

/* ------------------------------------- 
   ### Statement  
   `Statement` objects call their specific statement node's `produce()` method 
   after adding any comment lines preceding the statement */
Grammar.Statement.prototype.produce = function () {
  /* /! 
      
     declare valid me.lexer.lastOriginalCodeComment 
     declare valid me.lexer.LineTypes.CODE 
     declare valid me.lexer.infoLines 
     declare valid me.statement.skipSemiColon 
     !/ 
     add comment lines, in the same position as the source */
  this.outPrevLinesComments();
  /* To ease reading of compiled code, add original Lite line as comment 
     (except for EndStatement ant others which produdce it) */
  if (this.lexer.lastOriginalCodeComment < this.lineInx) {
    if (!((this.statement instanceof Grammar.ClassDeclaration || this.statement instanceof Grammar.VarStatement || this.statement instanceof Grammar.CompilerStatement || this.statement instanceof Grammar.DeclareStatement || this.statement instanceof Grammar.AssignmentStatement))) {
      this.out({COMMENT: this.lexer.infoLines[this.lineInx].text}, NL);
    }
  }
  this.lexer.lastOriginalCodeComment = this.lineInx;
  /* call the specific statement (if,for,print,if,function,class,etc) .produce() */
  this.out(this.statement);
  /* add ";" after the statement 
     then EOL comment (if it isnt a multiline statement) 
     then NEWLINE */
  if (!(this.statement.skipSemiColon)) {
    this.out(";");
    if (!(this.statement.body)) {
      this.out(this.getEOLComment());
    }
    this.out(NL);
  }
}

/* --------------------------------- 
   ### ThrowStatement  */
Grammar.ThrowStatement.prototype.produce = function () {
  if (this.specifier === 'fail') {
    this.out("throw new Error(", this.expr, ")");
  } else {
    this.out("throw ", this.expr);
  }
}

/* ### ReturnStatement  */
Grammar.ReturnStatement.prototype.produce = function () {
  this.out("return");
  if (this.expr) {
    this.out(" ", this.expr);
  }
}

/* ### FunctionCall  */
Grammar.FunctionCall.prototype.produce = function () {
  /* /! 
      
     declare valid me.name.produce 
     declare valid me.name.executes 
     !/ 
     me.name is a VariableRef. A VariableRef can contain accesors, even FunctionAccess. */
  this.name.produce();
  /* If the last Accessor is FunctionAccess, the js "function call" parentheses 
     were included in the output by VariableRef.accessors.produce(). 
     The output js statement is already a function call. */
  if (this.name.executes) {
    return; /* a function call already output */
  }
  /* if not, let's output js fn-call '()' accesor, and any without-parens arguments */
  this.out("(", {CSL: this.args}, ")");
}

/* ### Operand  
   `Operand: 
   |NumberLiteral|StringLiteral|RegExpLiteral 
   |ParenExpression|ArrayLiteral|ObjectLiteral|FunctionDeclaration 
   |VariableRef 
   A `Operand` is the left or right part of a binary oper 
   or the only Operand of a unary oper. */
Grammar.Operand.prototype.produce = function () {
  this.out(this.name, this.accessors);
}

/* end Operand 
   ### UnaryOper  
   `UnaryOper: ('-'|new|type of|not|no|bitwise not) ` 
   A Unary Oper is an operator acting on a single operand. 
   Unary Oper inherits from Oper, so both are `instance of Oper` 
   Examples: 
   1) `not`     *boolean negation*     `if not a is b` 
   2) `-`       *numeric unary minus*  `-(4+3)` 
   3) `new`     *instantiation*        `x = new classNumber[2]` 
   4) `type of` *type name access*     `type of x is classNumber[2]` 
   5) `no`      *'falsey' check*       `if no options then options={}` 
   6) `bitwise not` *bit-unary-negation* `a = bitwise not xC0 + 5` */
Grammar.UnaryOper.prototype.produce = function () {
  var translated, prepend, append;
  /* /! 
      
     declare valid me.right.operandCount 
     !/ */
  translated = operTranslate(this.name);
  /* if it is boolean not, add parentheses, because js as a different precedence for boolean not 
     -(prettier generated code) do not add () for "falsey" variable check */
  if (translated === "!" && !((this.name === "no" && this.right.name instanceof Grammar.VariableRef))) {
    prepend = "(";
    append = ")";
  }
  /* add a space if the unary operator is a word. Example `typeof` */
  if (/\w/.test(translated)) {
    translated += " ";
  }
  this.out(translated, prepend, this.right, append);
}

/* ### Oper  */
Grammar.Oper.prototype.produce = function () {
  var prepend, oper, append, desiredResult;
  prepend = "";
  oper = this.name;
  append = "";
  /* Consider 'negated' flag */
  if (this.negated) {
    /* NEGATED 
       if NEGATED and the oper is `is` we convert it to 'isnt'. 
       'isnt' will be translated to !== */
    if (oper === 'is') {
      /* Negated is ---> isnt --> !== */
      oper = 'isnt';
    } else {
      /* else -if NEGATED- we add `!( )` to the expression */
      prepend = "!(";
      append = ")";
    }
  }
  /* end if - NEGATED 
     Check for special cases: 
     *'in' operator, requires swapping left and right operands and to use `.indexOf(...)>=0` 
     example: `x in [1,2,3]` -> `[1,2,3].indexOf(x)>=0` 
     example: `x not in [1,2,3]` -> `[1,2,3].indexOf(x)==-1` 
     example: `char not in myString` -> `myString.indexOf(char)==-1` 
     example (`arguments` pseudo-array): `'lite' not in arguments` -> `Array.prototype.slice.call(arguments).indexOf(char)==-1` */
  if (this.name === 'in') {
    if (this.negated) {
      desiredResult = "===-1";
    } else {
      desiredResult = ">=0";
    }
    this.out(this.right, ".indexOf(", this.left, ")", desiredResult);
    /* fix pseudo-array 'arguments' */
    this.outCode.currLine = this.outCode.currLine.replace(/\barguments.indexOf\(/, 'Array.prototype.slice.call(arguments).indexOf(');
  } else if (this.name === 'has property') {
    /* *'has property' operator, requires swapping left and right operands and to use js:`in` */
    this.out(this.right, " in ", this.left);
  }
   else if (this.name === '^') {
    /* *`^` operator, requires calling Math.pow(left,right) 
       example: `2^8` --> `Math.pow(2,8)` */
    this.out(prepend, "Math.pow(", this.left, ',', this.right, ")", append);
  }
   else {
    /* else we have a direct transpilable operator. 
       We out: left,operator,right */
    this.out(prepend, this.left, ' ', operTranslate(oper), ' ', this.right, append);
  }
}

/* end if 
   ### Expression  */
Grammar.Expression.prototype.produce = function (options) {
  var prepend, append;
  /* /! 
      
     declare on options 
     negated 
     !/ 
     Produce the expression body, negated if options={negated:true} */
  if (!(options)) {
    options = {}; /* default */
  }
  prepend = "";
  append = "";
  if (options.negated) {
    /* (prettier generated code) Try to avoid unnecessary parens after '!' 
       for example: if the expression is a single variable, as in the 'falsey' check: 
       Example: `if no options.log then... ` --> `if (!options.log) {...` 
       we don't want: `if (!(options.log)) {...` */
    if (this.operandCount === 1) {
      /* no parens needed */
      prepend = "!";
    } else {
      prepend = "!(";
      append = ")";
    }
  }
  /* end if 
     end if negated 
     produce the expression body */
  this.out(prepend, this.root, append);
}

/* ### NameDeclaration  */
Grammar.NameDeclaration.prototype.produce = function () {
  /* use NameDeclaration.toString() 
     if the name is a member of other name, add parents. 
     Example: protoype -> Class.prototype */
  this.out(this.toString());
}

/* ### VariableRef  
   `VariableRef: ['--'|'++']NameDeclaration[Accessors]['--'|'++']` 
   `VariableRef` is a Variable Reference. 
   a VariableRef can include chained 'Accessors', which can: 
   *access a property of the object : `.`-> PropertyAccess `[`->IndexAccess 
   *assume the variable is a function and perform a function call :  `(`-> FunctionAccess */
Grammar.VariableRef.prototype.produce = function () {
  if (!(this.varName)) {
    debugger;
  }
  if (!(this.varName.name)) {
    debugger;
  }
  /* Prefix ++/--, varName, Accessors and postfix ++/-- */
  this.out(this.preIncDec, this.varName.name, this.accessors, this.postIncDec);
}

/* ### AssignmentStatement  */
Grammar.AssignmentStatement.prototype.produce = function () {
  this.out(this.lvalue, ' ', operTranslate(this.name), ' ', this.rvalue);
}

/* ####*helper method assignIfUndefined* */
Grammar.ASTBase.prototype.assignIfUndefined = function (name, value) {
  this.out("if(", name, '===undefined) ', name, "=", value, ";", NL);
}

/* end function 
   ------- 
   ### DefaultAssignment  
   V0 does not handle OK inner Functions. 
   FIX when V1 Move INTO method produce() of Grammar.DefaultAssignment 
   ####helper Functions 
   recursive duet 1 */
Grammar.DefaultAssignment.prototype.processItems = function (main, obj) {
  var nameValue, itemFullName, ki$2, kobj$2;
  this.out("if(!", main, ') ', main, "={};", NL);
  kobj$2 = obj.items;
  for (ki$2 = 0; ki$2 < kobj$2.length; ki$2++) {
    nameValue = kobj$2[ki$2];
    itemFullName = [main, '.', nameValue.name];
    this.process(itemFullName, nameValue.value);
  }
}

/* end recursive function 
   recursive duet 2 */
Grammar.DefaultAssignment.prototype.process = function (name, value) {
  /* if it is an ObjectLiteral (direct or in a Expression), recurse levels 
     else, a simple 'if undefined, assignment' */
  if (value instanceof Grammar.ObjectLiteral) {
    this.processItems(name, value); /* recurse */
  } else if (value.root && value.root.name instanceof Grammar.ObjectLiteral) {
    /* was a expression */
    this.processItems(name, value.root.name);
  }
   else {
    this.assignIfUndefined(name, value); /* non-object value */
  }
}

/* end recursive function 
   ####main DefaultAssignment produce */
Grammar.DefaultAssignment.prototype.produce = function () {
  this.process(this.assignment.lvalue, this.assignment.rvalue);
  this.skipSemiColon = true;
}

/* ----------- 
   ## Accessors  
   We just defer to JavaScript's built in `.` `[ ]` and `( )` accessors */
Grammar.Accessors.prototype.produce = function () {
  this.out(this.list);
}

/* each item in the list is one of: */
Grammar.PropertyAccess.prototype.produce = function () {
  this.out(".", this.name.name);
}

Grammar.IndexAccess.prototype.produce = function () {
  this.out("[", this.name, "]");
}

Grammar.FunctionAccess.prototype.produce = function () {
  this.out("(", {CSL: this.args}, ")");
}

/* ####*Helper method, get max line of list* */
Grammar.ASTBase.prototype.lastLineInxOf = function (list) {
  var lastLine, item, ki$3, kobj$3;
  lastLine = this.lineInx;
  kobj$3 = list;
  for (ki$3 = 0; ki$3 < kobj$3.length; ki$3++) {
    item = kobj$3[ki$3];
    if (item.lineInx > lastLine) {
      lastLine = item.lineInx;
    }
  }
  return lastLine;
}

/* ### PropertiesDeclaration  
   'var' followed by a list of comma separated: var names and optional assignment */
Grammar.PropertiesDeclaration.prototype.produce = function () {
  var varDecl, ki$4, kobj$4;
  this.outLinesAsComment(this.lineInx, this.lastLineInxOf(this.list));
  kobj$4 = this.list;
  for (ki$4 = 0; ki$4 < kobj$4.length; ki$4++) {
    varDecl = kobj$4[ki$4];
    if (varDecl.assignedValue) {
      this.out(varDecl.name, "=", varDecl.assignedValue, ";", NL);
    }
  }
  this.skipSemiColon = true;
}

/* ### VarStatement  
   'var' followed by a list of comma separated: var names and optional assignment */
Grammar.VarStatement.prototype.produce = function () {
  var item, ki$5, kobj$5;
  /* /! 
      
     declare valid me.keyword 
     declare valid me.compilerVar 
     declare valid me.public 
     !/ */
  if (this.keyword === 'let' && this.compilerVar('ES6')) {
    this.out('let ');
  } else {
    this.out('var ');
  }
  /* Now, after 'var' or 'let' out one or more comma separated VariableDecls */
  this.out({CSL: this.list});
  /* If 'var' was adjectivated 'public', add to module.exports */
  if (this.public) {
    kobj$5 = this.list;
    for (ki$5 = 0; ki$5 < kobj$5.length; ki$5++) {
      item = kobj$5[ki$5];
      this.out(";", NL, 'exports.', item.name, ' = ', item.name, NL);
    }
  }
}

/* ### VariableDecl  
   variable name and optionally assign a value */
Grammar.VariableDecl.prototype.produce = function () {
  /* It's a `var` keyword or we're declaring function parameters. 
     In any case starts with the variable name */
  this.out(this.name);
  /* /! 
      
     declare valid me.keyword 
     declare valid me.public 
     !/ 
     If this VariableDecl is from a 'var' statement, we force assignment (to avoid subtle bugs, 
     in LiteScript, 'var' declaration assigns 'undefined') */
  if (this.parent instanceof Grammar.VarStatement) {
    this.out(' = ', this.assignedValue || 'undefined');
  } else {
    /* else, if this VariableDecl is from function parameters, 
       if it has AssginedValue, we out assignment if ES6 is available. 
       (ES6 implements 'default' for parameters, so `function myFunc(a=3)` is valid in ES6) */
    if (this.assignedValue && this.compilerVar('ES6')) {
      this.out(' = ', this.assignedValue);
    }
  }
}

/* end VariableDecl 
   ### SingleLineStatement  */
Grammar.SingleLineStatement.prototype.produce = function () {
  var bare, statement, ki$6, kobj$6;
  bare = [];
  kobj$6 = this.statements;
  for (ki$6 = 0; ki$6 < kobj$6.length; ki$6++) {
    statement = kobj$6[ki$6];
    bare.push(statement.statement);
  }
  this.out(NL, "    ", {CSL: bare, separator: ";"});
}

/* ### IfStatement  */
Grammar.IfStatement.prototype.produce = function () {
  /* /! 
      
     declare valid me.elseStatement.produce 
     !/ */
  if (this.body instanceof Grammar.SingleLineStatement) {
    this.out("if (", this.conditional, ") {", this.body, "}");
  } else {
    this.out("if (", this.conditional, ") {", this.getEOLComment());
    this.out(this.body, "}");
  }
  if (this.elseStatement) {
    this.elseStatement.produce();
  }
}

/* ### ElseIfStatement  */
Grammar.ElseIfStatement.prototype.produce = function () {
  this.out(NL, "else ", this.nextIf);
}

/* ### ElseStatement  */
Grammar.ElseStatement.prototype.produce = function () {
  this.out(NL, "else {", this.body, NL, "}");
}

/* ### ForStatement  
   There are 3 variants of `ForStatement` in LiteScript */
Grammar.ForStatement.prototype.produce = function () {
  var iterable;
  /* /! 
      
     declare iterable:Grammar.Expression 
     declare valid me.variant.iterable 
     declare valid me.variant.produce 
     declare valid me.skipSemiColon 
     declare valid iterable.root.name.hasSideEffects 
     !/ 
     Pre-For code. If required, store the iterable in a temp var. 
     (prettier generated code) Only if the iterable is a complex expression, 
     (if it can have side-effects) we store it in a temp 
     var in order to avoid calling it twice. Else, we use it as is. */
  iterable = this.variant.iterable;
  if (iterable) {
    if (iterable.operandCount > 1 || iterable.root.name.hasSideEffects || iterable.root instanceof Grammar.Literal) {
      iterable = this.outCode.getUniqueVarName('list'); /* unique temp iterable name */
      this.out("var ", iterable, "=", this.variant.iterable, ";", NL);
    }
  }
  this.variant.produce(iterable);
  /* Since al 3 cases are closed with '}; //comment', we skip statement semicolon */
  this.skipSemiColon = true;
}

/* ####Variant 1) 'for each property' to loop over *object property names* 
   `ForEachProperty: for each [own] property name-VariableDecl in object-VariableRef` */
Grammar.ForEachProperty.prototype.produce = function (iterable) {
  this.out("for ( var ", this.indexVar, " in ", iterable, ") ");
  if (this.ownOnly) {
    this.out("if (", iterable, ".hasOwnProperty(", this.indexVar, ")) ");
  }
  this.out("{", this.body, "}; // end for each property", NL);
}

/* ###Variant 2) 'for index=...' to create *numeric loops* 
   `ForIndexNumeric: for index-VariableDecl "=" start-Expression [,|;] (while|until) condition-Expression [(,|;) increment-Statement]` */
Grammar.ForIndexNumeric.prototype.produce = function () {
  /* Examples: `for n=0 while n<10`, `for n=0 to 9` 
     Handle by using a js/C standard for(;;){} loop 
     /! 
      
     declare valid me.endExpression.produce 
     !/ */
  this.out("for( var ", this.indexVar, "=", this.startIndex, "; ");
  if (this.conditionPrefix === 'to') {
    /* 'for n=0 to 10' -> for(n=0;n<=10;... */
    this.out(this.indexVar, "<=", this.endExpression);
  } else {
    /* is while|until 
       produce the condition, negated if the prefix is 'until' 
       for n=0, while n<arr.length  -> for(n=0;n<arr.length;... 
       for n=0, until n >= arr.length  -> for(n=0;!(n>=arr.length);... */
    this.endExpression.produce({negated: this.conditionPrefix === 'until'});
  }
  this.out("; ");
  /* if no increment specified, the default is indexVar++ */
  if (this.increment) {
    this.out(this.increment.statement);
  } else {
    this.out(this.indexVar, "++");
  }
  this.out("){", this.body, "}; // end for ", this.indexVar, NL);
}

/* ####Variant 3) 'for each index' to loop over *Array indexes and items* 
   `ForEachInArray: for each [index-VariableDecl,]item-VariableDecl in array-VariableRef` */
Grammar.ForEachInArray.prototype.produce = function (iterable) {
  var indexVar;
  /* Create a default index var name if none was provided */
  indexVar = this.indexVar;
  if (!(indexVar)) {
    indexVar = this.mainVar.name + '__inx'; /* default index name */
  }
  this.out("for ( var ", indexVar, "=0; ", indexVar, "<", iterable, ".length; ", indexVar, "++) {", NL);
  this.body.out("var ", this.mainVar, "=", iterable, "[", indexVar, "];");
  this.out(this.body, "}; // end for each in ", this.iterable, NL);
}

/* ### WhileUntilExpression  */
Grammar.WhileUntilExpression.prototype.produce = function (options) {
  /* If the parent ask for a 'while' condition, but this is a 'until' condition, 
     or the parent ask for a 'until' condition and this is 'while', we must *negate* the condition. 
     /! 
      
     declare on options 
     askFor,negated 
      
     declare valid me.expr.produce 
     !/ */
  if (!(options)) {
    options = {};
  }
  if (options.askFor && this.name !== options.askFor) {
    options.negated = true;
  }
  /* *options.askFor* is used when the source code was, for example, 
     `do until Expression` and we need to code: `while(!(Expression))` 
     or the code was `loop while Expression` and we need to code: `if (!(Expression)) break` 
     to code a js `while` you need to negate the expression when what you have 
     is a `until` condition. (`while NOT x` is equivalent to  `until x`) */
  this.expr.produce(options);
}

/* ### DoLoop Produce  */
Grammar.DoLoop.prototype.produce = function () {
  var loopCountVar;
  /* Note: **WhileUntilLoop** symbol has **DoLoop** as *prototype*, so this *.produce()* method 
     is used by both symbols. 
     To emulate pre and post-loop condition at the same time 
     we must count loops and check the post-loop-condition on the 2nd iteration onwards. 
     This is required for the `continue` keyword to work as expected (to check the post-loop-condition) 
     /! 
      
     declare valid me.preWhileUntilExpression.lineInx 
     declare valid me.postWhileUntilExpression.lineInx 
     !/ */
  if (this.postWhileUntilExpression) {
    /* ####loop, with post-condition 
       if it has a post-condition, for example: `do ... loop while x>0`, 
       we should *break* on the condition, after the first iteration 
       Also, we must place both conditions checks on the loop start, and the post-condition first, 
       for the `continue` command to work as expected (to go to check the post-condition) 
       create a var to count iterations */
    loopCountVar = this.outCode.getUniqueVarName('loopCount');
    this.out('var ', loopCountVar, '=0;', NL);
    this.out("while(true){", NL); /* start the loop */
    /* if there is a post-loop exit condition (while x do:, loop while y), 
       we must check if it's the 2nd+ iteration, and 'break' on the condition 
       Example: 
       if the original source was: 'do ... loop **while x<10**' 
       the output should be: `if (loopCountVar++>0 && !(x<10) ) break;` */
    this.body.outLineAsComment("post-condition", this.postWhileUntilExpression.lineInx);
    /* 2nd+ loop iteration, check post-loop condition' */
    this.body.out('if(', loopCountVar, '++>0 && ');
    this.postWhileUntilExpression.produce({askFor: 'until'});
    this.body.out(") break;", NL);
    this.body.outLineAsComment("pre-condition", this.preWhileUntilExpression.lineInx);
    this.body.out('if(');
    this.preWhileUntilExpression.produce({askFor: 'until'});
    this.body.out(") break;", NL);
  } else {
    /* else, optional pre-condition only: 
       This loops are easier to produce in js */
    this.out('while(');
    if (this.preWhileUntilExpression) {
      this.preWhileUntilExpression.produce({askFor: 'while'});
    } else {
      this.out('true');
    }
    this.out('){');
  }
  /* end if */
  this.out(NL, this.body);
  this.out(NL, "};", {COMMENT: "end loop"}, NL);
}

/* ### DoNothingStatement  */
Grammar.DoNothingStatement.prototype.produce = function () {
  this.out("null");
}

/* ### LoopControlStatement  
   This is a very simple class to allow us to use the `break` and `continue` keywords. */
Grammar.LoopControlStatement.prototype.produce = function () {
  this.out(this.control);
}

/* ### ParenExpression  
   A `ParenExpression` is just a normal expression surrounded by parentheses. */
Grammar.ParenExpression.prototype.produce = function () {
  this.out("(", this.expr, ")");
}

/* ### ArrayLiteral  
   A `ArrayLiteral` is a definition of a list like `[1, a, 2+3]`. We just pass this through to JavaScript. */
Grammar.ArrayLiteral.prototype.produce = function () {
  this.out("[", {CSL: this.items}, "]");
}

/* ### NameValuePair  
   A `NameValuePair` is a single item in an object definition. Since we copy js for this, we pass this straight through */
Grammar.NameValuePair.prototype.produce = function () {
  this.out(this.name, ": ", this.value);
}

/* ### ObjectLiteral  
   A `ObjectLiteral` is an object definition using key/value pairs like `{a:1,b:2}`. 
   JavaScript supports this syntax, so we just pass it through. */
Grammar.ObjectLiteral.prototype.produce = function () {
  this.out("{", {CSL: this.items}, "}");
}

/* ### FreeObjectLiteral  
   A `FreeObjectLiteral` is an object definition using key/value pairs, but in free-form 
   (one NameValuePair per line, indented, comma is optional) */
Grammar.FreeObjectLiteral.prototype.produce = function () {
  this.out("{", {CSL: this.items, freeForm: true}, "}");
}

/* ### FunctionDeclaration  
   `FunctionDeclaration: '[public][generator] (function|method|constructor) [name] '(' FunctionParameterDecl* ')' Block` 
   `FunctionDeclaration`s are function definitions. 
   `public` prefix causes the function to be included in `module.exports` 
   `generator` prefix marks a 'generator' function that can be paused by `yield` (js/ES6 function*) */
Grammar.FunctionDeclaration.prototype.produce = function () {
  var generatorMark, count, paramDecl, ki$7, kobj$7;
  /* /! 
      
     declare valid me.public 
     declare valid me.generator 
     declare valid me.body.produce 
     declare valid me.exceptionBlock 
      
     declare paramDecl 
     declare valid paramDecl.assignedValue 
      
     !/ 
     Generators are implemented in ES6 with the "function*" keyword (note the asterisk) */
  generatorMark = "";
  if (this.generator && this.compilerVar('ES6')) {
    generatorMark = "*";
  }
  /* if this function is named, 
     if the name is in scope */
  if (this.name) {
    /* Check if it is a scope *named* function, then out 'function name(...' 
       This function will have .name=xx, and also .constructor.name=xx */
    if (this.name.parent.isScope) {
      this.out("function", generatorMark, " ", this.name);
    } else {
      /* else, *anonymous* function asigned to object property, e.g., 'Class.prototype.name = function...' 
         This function will have .name='' 
         Notes: me.varRef is set only in the old syntax "of xx" BUT 
         CLASS ARE DYNAMIC. AppendToDeclaration MUST HAVE a varRef (to do) 
         and maybe ClassDeclaration too. */
      if (this.varRef) {
        this.out(this.varRef, ".", this.name.name, " = function", generatorMark);
      } else {
        this.out(this.name, " = function", generatorMark);
      }
    }
  } else {
    /* else, no name, anonymous fn declaration */
    this.out("function", generatorMark);
  }
  /* now produce function parameters declaration */
  this.out("(", {CSL: this.paramsDeclarations}, "){", this.getEOLComment(), NL);
  /* if the function has a exception block, insert 'try{' */
  if (this.exceptionBlock) {
    this.out(" try{", NL);
  }
  /* if params defaults where included, we assign default values to arguments 
     (if ES6 enabled, they were included abobve in ParamsDeclarations production ) */
  if (this.paramsDeclarations && !(this.compilerVar('ES6'))) {
    count = 0;
    kobj$7 = this.paramsDeclarations;
    for (ki$7 = 0; ki$7 < kobj$7.length; ki$7++) {
      paramDecl = kobj$7[ki$7];
      if (paramDecl.assignedValue) {
        count += 1;
        if (count === 1) {
          this.body.out("//defaults", NL);
        }
        this.body.assignIfUndefined(paramDecl.name, paramDecl.assignedValue);
      }
    }
    /* end for */
    if (count > 1) {
      this.body.out("//end defaults", NL);
    }
  }
  /* end if 
     now produce function body */
  this.body.produce();
  /* close the function */
  this.out("}");
  /* If the function was adjectivated 'public', add to module.exports */
  if (this.public) {
    this.out(";", NL, 'exports.', this.name, '=', this.name);
  }
}

/* -------------------- 
   ### PrintStatement  
   `print` is an alias for console.log */
Grammar.PrintStatement.prototype.produce = function () {
  this.out("console.log(", {"CSL": this.args}, ")");
}

/* -------------------- 
   ### EndStatement  
   Marks the end of a block. It's just a comment for javascript */
Grammar.EndStatement.prototype.produce = function () {
  /* /! 
      
     declare valid me.lexer.lastOriginalCodeComment 
     declare valid me.lexer.infoLines 
     declare valid me.skipSemiColon 
     !/ */
  if (this.lexer.lastOriginalCodeComment < this.lineInx) {
    this.out({COMMENT: this.lexer.infoLines[this.lineInx].text});
  }
  this.skipSemiColon = true;
}

/* -------------------- 
   ### CompilerStatement  
   Out as comments */
Grammar.CompilerStatement.prototype.produce = function () {
  this.outLineAsComment(this.lineInx);
  /* /! 
      
     declare asked 
     declare on asked 
     value 
     declare valid me.body.produce 
     declare valid me.skipSemiColon 
     !/ 
     if it's a conditional compile, output body is option is Set */
  if (this.conditional) {
    if (this.compilerVar(this.conditional)) {
      this.body.produce();
    }
  } else {
    /* else, another kind, just out as comments */
    this.outLinesAsComment(this.lineInx, this.lineInx);
  }
  this.skipSemiColon = true;
}

/* -------------------- 
   ### DeclareStatement  
   Out as comments */
Grammar.DeclareStatement.prototype.produce = function () {
  this.outLinesAsComment(this.lineInx, this.lastLineInxOf(this.names));
  this.skipSemiColon = true;
}

/* ---------------------------- 
   ### ClassDeclaration  
   Classes contain a code block with properties and methods definitions. */
Grammar.ClassDeclaration.prototype.produce = function () {
  var theConstructor, methodsAndProperties, item, index, ki$8, kobj$8;
  this.out({COMMENT: "class "}, this.name);
  if (this.parentClass) {
    this.out(", extends|super is ", this.parentClass);
  }
  this.out(", constructor:", NL);
  /* First, since js has a object-class-constructor function all in one 
     we need to get the class constructor, and separate other class items. 
     /! 
      
     declare theConstructor:Grammar.FunctionDeclaration 
     declare valid me.body.statements 
     declare valid me.produce_AssignObjectProperties 
     declare valid me.public 
     !/ */
  theConstructor = null;
  methodsAndProperties = [];
  if (this.body) {
    kobj$8 = this.body.statements;
    for (ki$8 = 0; ki$8 < kobj$8.length; ki$8++) {
      item = kobj$8[ki$8];
      index = ki$8;
      if (item.statement instanceof Grammar.ConstructorDeclaration) {
        if (theConstructor) { /* what? more than one? */
          this.throwError('Two constructors declared for class #{me.name}');
        }
        theConstructor = item.statement;
      } else {
        methodsAndProperties.push(item);
      }
    }
  }
  /* end if body */
  if (theConstructor) {
    this.out(theConstructor, ";", NL);
  } else {
    /* out a default "constructor" */
    this.out("function ", this.name, "(){");
    if (this.parentClass) {
      this.out(NL, "// default constructor: call super.constructor", NL);
      this.out("    return ", this.parentClass.name, ".prototype.constructor.apply(this,arguments)", NL);
    }
    this.out("};", NL);
  }
  /* end if 
     Set parent class if we have one indicated */
  if (this.parentClass) {
    this.out('// ', this.name, ' (extends|super is) ', this.parentClass.name, NL);
    this.out(this.name, '.prototype.__proto__ = ', this.parentClass.name, '.prototype;', NL);
  }
  /* now out class body, which means create properties in the object-function-class prototype */
  this.out(NL, '// declared properties & methods', NL);
  this.out(methodsAndProperties);
  /* If the class was adjectivated 'public', add to module.exports */
  if (this.public) {
    this.out(NL, 'exports.', this.name, ' = ', this.name, ";");
  }
  this.out(NL, {COMMENT: "end class "}, this.name, NL);
  this.skipSemiColon = true;
}

/* ### AppendToDeclaration  
   Any class|object can be extended at any time. 
   'extend' body contains a code block with properties and methods definitions. */
Grammar.AppendToDeclaration.prototype.produce = function () {
  /* me.referenced is VartiableRef. */
  this.out({COMMENT: "append to "}, this.referenced, NL);
  /* out extend body (properties,methods,etc) */
  this.out(this.body);
  this.skipSemiColon = true;
}

/* ### TryCatch  */
Grammar.TryCatch.prototype.produce = function () {
  this.out("try{", this.body, this.exceptionBlock);
}

/* ### ExceptionBlock  */
Grammar.ExceptionBlock.prototype.produce = function () {
  this.out(NL, "}catch(", this.catchVar, "){", this.body, "}");
  if (this.finallyBody) {
    this.out(NL, "finally{", this.finallyBody, "}");
  }
}

/* ### WaitForAsyncCall  */
Grammar.WaitForAsyncCall.prototype.produce = function () {
  /* /! 
      
     declare valid me.call.funcRef 
     declare valid me.call.args 
     !/ */
  this.out("wait.for(", {CSL: [this.call.funcRef].concat(this.call.args)}, ")");
}

