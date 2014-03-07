//Compiled by LiteScript compiler v0.6.3, source: /home/ltato/LiteScript/devel/source-v0.6/Grammar.lite.md
   var ASTBase = require('./ASTBase');
   var log = require('./log');
   var debug = log.debug;
   var RESERVED_WORDS = ['namespace', 'function', 'async', 'class', 'method', 'constructor', 'prototype', 'if', 'then', 'else', 'switch', 'when', 'case', 'end', 'null', 'true', 'false', 'undefined', 'and', 'or', 'but', 'no', 'not', 'has', 'hasnt', 'property', 'properties', 'new', 'is', 'isnt', 'do', 'loop', 'while', 'until', 'for', 'to', 'break', 'continue', 'return', 'try', 'catch', 'throw', 'raise', 'fail', 'exception', 'finally', 'with', 'arguments', 'in', 'instanceof', 'typeof', 'var', 'let', 'default', 'delete', 'interface', 'implements', 'yield', 'like', 'this', 'super', 'export', 'compiler', 'compile', 'debugger'];
   var operatorsPrecedence = ['++', '--', 'unary -', 'unary +', '~', '&', '^', '|', '>>', '<<', 'new', 'type of', 'instance of', 'has property', '*', '/', '%', '+', '-', 'into', 'in', '>', '<', '>=', '<=', 'is', '<>', '!==', 'like', 'no', 'not', 'and', 'but', 'or', '?', ':'];
   
   function PrintStatement(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   PrintStatement.prototype.__proto__ = ASTBase.prototype;
   
     PrintStatement.prototype.parse = function(){
       this.req('print');
       this.lock();
       this.args = this.optSeparatedList(Expression, ",");
     };
   
   module.exports.PrintStatement = PrintStatement;
   PrintStatement
   
   function VarStatement(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   VarStatement.prototype.__proto__ = ASTBase.prototype;
   
     VarStatement.prototype.parse = function(){
       this.req('var', 'let');
       this.lock();
       this.list = this.reqSeparatedList(VariableDecl, ",");
     };
   
   module.exports.VarStatement = VarStatement;
   VarStatement
   
   function VariableDecl(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   VariableDecl.prototype.__proto__ = ASTBase.prototype;
   
     
     VariableDecl.prototype.parse = function(){
       this.name = this.req('IDENTIFIER');
       this.lock();
       var dangling = undefined;
       if (this.opt(':')) {
           if (this.lexer.token.type === 'NEWLINE') {
               dangling = true;
           }
           else {
               this.parseType();
           };
       };
       if (!(dangling) && this.opt('=')) {
           if (this.lexer.token.type === 'NEWLINE') {
               dangling = true;
           }
           else {
               this.assignedValue = this.req(Expression);
               return;
           };
       };
       if (dangling) {
           this.assignedValue = this.req(FreeObjectLiteral);
       };
     };
   
   module.exports.VariableDecl = VariableDecl;
   VariableDecl
   
   function PropertiesDeclaration(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   PropertiesDeclaration.prototype.__proto__ = ASTBase.prototype;
   
     
     PropertiesDeclaration.prototype.parse = function(){
       this.toNamespace = this.opt('namespace') ? true : false;
       this.req('properties');
       this.lock();
       this.list = this.reqSeparatedList(VariableDecl, ',');
     };
   
   module.exports.PropertiesDeclaration = PropertiesDeclaration;
   PropertiesDeclaration
   
   function WithStatement(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   WithStatement.prototype.__proto__ = ASTBase.prototype;
   
     WithStatement.prototype.parse = function(){
       this.req('with');
       this.lock();
       this.name = ASTBase.getUniqueVarName('with');
       this.varRef = this.req(VariableRef);
       this.body = this.req(Body);
     };
   
   module.exports.WithStatement = WithStatement;
   WithStatement
   
   function TryCatch(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   TryCatch.prototype.__proto__ = ASTBase.prototype;
   
     TryCatch.prototype.parse = function(){
       this.req('try');
       this.lock();
       this.body = this.req(Body);
       this.exceptionBlock = this.req(ExceptionBlock);
     };
   
   module.exports.TryCatch = TryCatch;
   TryCatch
   
   function ExceptionBlock(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   ExceptionBlock.prototype.__proto__ = ASTBase.prototype;
   
     ExceptionBlock.prototype.parse = function(){
       this.req('catch', 'exception', 'Exception');
       this.lock();
       this.catchVar = this.req('IDENTIFIER');
       this.body = this.req(Body);
       if (this.opt('finally')) {
           this.finallyBody = this.req(Body)};
     };
   
   module.exports.ExceptionBlock = ExceptionBlock;
   ExceptionBlock
   
   function ThrowStatement(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   ThrowStatement.prototype.__proto__ = ASTBase.prototype;
   
     ThrowStatement.prototype.parse = function(){
       this.specifier = this.req('throw', 'raise', 'fail');
       this.lock();
       if (this.specifier === 'fail') {
           this.req('with')};
       this.expr = this.req(Expression);
     };
   
   module.exports.ThrowStatement = ThrowStatement;
   ThrowStatement
   
   function ReturnStatement(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   ReturnStatement.prototype.__proto__ = ASTBase.prototype;
   
     ReturnStatement.prototype.parse = function(){
       this.req('return');
       this.lock();
       this.expr = this.opt(Expression);
     };
   
   module.exports.ReturnStatement = ReturnStatement;
   ReturnStatement
   
   function IfStatement(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   IfStatement.prototype.__proto__ = ASTBase.prototype;
   
     IfStatement.prototype.parse = function(){
       this.req('if', 'when');
       this.lock();
       this.conditional = this.req(Expression);
       if (this.opt(',', 'then')) {
           this.body = this.req(SingleLineStatement);
           this.req('NEWLINE');
       }
       else {
           this.body = this.req(Body);
       };
       
       if (this.lexer.token.value === 'else') {
           if (this.lexer.index !== 0) {
               this.throwError('expected "else" to start on a new line');
           };
           if (this.lexer.indent < this.indent) {
               return;
           };
           if (this.lexer.indent > this.indent) {
               this.throwError("'else' statement is over-indented");
           };
       };
       
       this.elseStatement = this.opt(ElseIfStatement, ElseStatement);
     };
   
   module.exports.IfStatement = IfStatement;
   IfStatement
   
   function ElseIfStatement(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   ElseIfStatement.prototype.__proto__ = ASTBase.prototype;
   
     ElseIfStatement.prototype.parse = function(){
       this.req('else');
       this.req('if');
       this.lock();
       this.lexer.returnToken();
       this.nextIf = this.req(IfStatement);
     };
   
   module.exports.ElseIfStatement = ElseIfStatement;
   ElseIfStatement
   
   function ElseStatement(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   ElseStatement.prototype.__proto__ = ASTBase.prototype;
   
     ElseStatement.prototype.parse = function(){
       this.req('else');
       this.lock();
       this.body = this.req(Body);
     };
   
   module.exports.ElseStatement = ElseStatement;
   ElseStatement
   
   function DoLoop(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   DoLoop.prototype.__proto__ = ASTBase.prototype;
   
     DoLoop.prototype.parse = function(){
       this.req('do');
       if (this.opt('nothing')) {
         this.throwParseFailed('is do nothing');
       };
       this.opt(":");
       this.lock();
       this.preWhileUntilExpression = this.opt(WhileUntilExpression);
       this.body = this.opt(Body);
       this.req("loop");
       this.postWhileUntilExpression = this.opt(WhileUntilExpression);
       if (this.preWhileUntilExpression && this.postWhileUntilExpression) {
         this.sayErr("Loop: cannot have a pre-condition a and post-condition at the same time");
       };
     };
   
   module.exports.DoLoop = DoLoop;
   DoLoop
   
   function WhileUntilLoop(){
       DoLoop.prototype.constructor.apply(this,arguments)
   };
   WhileUntilLoop.prototype.__proto__ = DoLoop.prototype;
   
     WhileUntilLoop.prototype.parse = function(){
       this.preWhileUntilExpression = this.req(WhileUntilExpression);
       this.lock();
       this.body = this.opt(Body);
     };
   
   module.exports.WhileUntilLoop = WhileUntilLoop;
   WhileUntilLoop
   
   function WhileUntilExpression(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   WhileUntilExpression.prototype.__proto__ = ASTBase.prototype;
   
     WhileUntilExpression.prototype.parse = function(){
       this.name = this.req('while', 'until');
       this.lock();
       this.expr = this.req(Expression);
     };
   
   module.exports.WhileUntilExpression = WhileUntilExpression;
   WhileUntilExpression
   
   function LoopControlStatement(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   LoopControlStatement.prototype.__proto__ = ASTBase.prototype;
   
     LoopControlStatement.prototype.parse = function(){
       this.control = this.req('break', 'continue');
     };
   
   module.exports.LoopControlStatement = LoopControlStatement;
   LoopControlStatement
   
   function DoNothingStatement(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   DoNothingStatement.prototype.__proto__ = ASTBase.prototype;
   
     DoNothingStatement.prototype.parse = function(){
       this.req('do');
       this.req('nothing');
     };
   
   module.exports.DoNothingStatement = DoNothingStatement;
   DoNothingStatement
   
   function ForStatement(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   ForStatement.prototype.__proto__ = ASTBase.prototype;
   
     ForStatement.prototype.parse = function(){
       
       this.req('for');
       this.lock();
       this.variant = this.req(ForEachProperty, ForEachInArray, ForIndexNumeric);
     };
   
   module.exports.ForStatement = ForStatement;
   ForStatement
   
   function ForEachProperty(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   ForEachProperty.prototype.__proto__ = ASTBase.prototype;
   
     ForEachProperty.prototype.parse = function(){
       this.req('each');
       this.ownOnly = this.opt('own') ? true : false;
       this.req('property');
       this.lock();
       this.indexVar = this.req(VariableDecl);
       if (this.opt(",")) {
         this.mainVar = this.req(VariableDecl);
       };
       this.req('in');
       this.iterable = this.req(Expression);
       this.where = this.opt(ForWhereFilter);
       this.body = this.req(Body);
     };
   
   module.exports.ForEachProperty = ForEachProperty;
   ForEachProperty
   
   function ForEachInArray(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   ForEachInArray.prototype.__proto__ = ASTBase.prototype;
   
     ForEachInArray.prototype.parse = function(){
       this.req('each');
       this.mainVar = this.req(VariableDecl);
       if (this.opt(',')) {
         this.indexVar = this.mainVar;
         this.mainVar = this.req(VariableDecl);
       };
       this.req('in');
       this.lock();
       this.iterable = this.req(Expression);
       this.where = this.opt(ForWhereFilter);
       this.body = this.req(Body);
     };
   
   module.exports.ForEachInArray = ForEachInArray;
   ForEachInArray
   
   function ForIndexNumeric(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   ForIndexNumeric.prototype.__proto__ = ASTBase.prototype;
   
     ForIndexNumeric.prototype.parse = function(){
       this.indexVar = this.req(VariableDecl);
       this.lock();
       this.opt(',');
       this.conditionPrefix = this.req('while', 'until', 'to');
       this.endExpression = this.req(Expression);
       this.opt(',');
       this.where = this.opt(ForWhereFilter);
       this.opt(',');
       this.increment = this.opt(SingleLineStatement);
       this.body = this.req(Body);
     };
   
   module.exports.ForIndexNumeric = ForIndexNumeric;
   ForIndexNumeric
   
   function ForWhereFilter(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   ForWhereFilter.prototype.__proto__ = ASTBase.prototype;
   
     ForWhereFilter.prototype.parse = function(){
       var optNewLine = this.opt('NEWLINE');
       if (this.opt('where')) {
         this.lock();
         this.filter = this.req(Expression);
       }
       else {
         if (optNewLine) {
             this.lexer.returnToken()};
         this.throwParseFailed("expected '[NEWLINE] where'");
       };
     };
   
   module.exports.ForWhereFilter = ForWhereFilter;
   ForWhereFilter
   
   function DeleteStatement(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   DeleteStatement.prototype.__proto__ = ASTBase.prototype;
   
     DeleteStatement.prototype.parse = function(){
       this.req('delete');
       this.lock();
       this.varRef = this.req(VariableRef);
     };
   
   module.exports.DeleteStatement = DeleteStatement;
   DeleteStatement
   
   function AssignmentStatement(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   AssignmentStatement.prototype.__proto__ = ASTBase.prototype;
   
     AssignmentStatement.prototype.parse = function(){
       
       if (this.parent.preParsedVarRef) {
         this.lvalue = this.parent.preParsedVarRef;
       }
       else {
         this.lvalue = this.req(VariableRef);
       };
       this.name = this.req('ASSIGN');
       this.lock();
       if (this.lexer.token.type === 'NEWLINE') {
         this.rvalue = this.req(FreeObjectLiteral);
       }
       else {
         this.rvalue = this.req(Expression);
       };
     };
   
   module.exports.AssignmentStatement = AssignmentStatement;
   AssignmentStatement
   
   function VariableRef(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   VariableRef.prototype.__proto__ = ASTBase.prototype;
   
     
     VariableRef.prototype.parse = function(){
       this.preIncDec = this.opt('--', '++');
       this.executes = false;
       if (this.opt('.', 'SPACE_DOT')) {
           this.lock();
           var withStatement=undefined;
           if ((withStatement=this.getParent(WithStatement))) {
               this.name = withStatement.name;
           }
           else {
               this.name = 'this';
           };
           var member = this.req('IDENTIFIER');
           this.addAccessor(new PropertyAccess(this, member));
       }
       else {
           this.name = this.req('IDENTIFIER');
       };
       this.lock();
       this.parseAccessors();
       if (this.name === 'super') {
           var classDecl = this.getParent(ClassDeclaration);
           if (!classDecl) {
             this.throwError("can't use 'super' outside a class method");
           };
           if (classDecl.varRefSuper) {
               this.name = classDecl.varRefSuper.name;
           }
           else {
               this.name = 'Object';
           };
           this.insertAccessorAt(0, 'prototype');
           if (classDecl.varRefSuper && classDecl.varRefSuper.accessors) {
               var position = 0;
               for( var ac__inx=0,ac ; ac__inx<classDecl.varRefSuper.accessors.length ; ac__inx++){ac=classDecl.varRefSuper.accessors[ac__inx];
               
                 if (ac instanceof PropertyAccess) {
                   this.insertAccessorAt(position++, ac.name);
                 };
               };
               
           };
       };
       
       if (this.name === 'null') {
           this.executes = true};
       if (this.getParent(Statement).intoVars && this.opt(":")) {
           this.type = this.req(VariableRef);
       };
       this.postIncDec = this.opt('--', '++');
       if (this.preIncDec || this.postIncDec) {
         this.executes = true;
         this.hasSideEffects = true;
       };
       if (this.name === 'require') {
           this.getParent(Module).requireCallNodes.push(this);
       };
     };
     VariableRef.prototype.toString = function(){
       var result = (this.preIncDec || "") + this.name;
       if (this.accessors) {
         for( var ac__inx=0,ac ; ac__inx<this.accessors.length ; ac__inx++){ac=this.accessors[ac__inx];
         
           result += ac.toString();
         };
         
       };
       return result + (this.postIncDec || "");
     };
   
   module.exports.VariableRef = VariableRef;
   VariableRef
   
   function Accessor(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   Accessor.prototype.__proto__ = ASTBase.prototype;
   
     Accessor.prototype.parse = function(){
       throw new Error('abstract');
     };
     Accessor.prototype.toString = function(){
       throw new Error('abstract');
     };
   
   module.exports.Accessor = Accessor;
   Accessor
   
   function PropertyAccess(){
       Accessor.prototype.constructor.apply(this,arguments)
   };
   PropertyAccess.prototype.__proto__ = Accessor.prototype;
   
     PropertyAccess.prototype.parse = function(){
       this.req('.');
       this.lock();
       this.name = this.req('IDENTIFIER');
     };
     PropertyAccess.prototype.toString = function(){
       return '.' + this.name;
     };
   
   module.exports.PropertyAccess = PropertyAccess;
   PropertyAccess
   
   function IndexAccess(){
       Accessor.prototype.constructor.apply(this,arguments)
   };
   IndexAccess.prototype.__proto__ = Accessor.prototype;
   
     IndexAccess.prototype.parse = function(){
       this.req("[");
       this.lock();
       this.name = this.req(Expression);
       this.req("]");
     };
     IndexAccess.prototype.toString = function(){
       return '[...]';
     };
   
   module.exports.IndexAccess = IndexAccess;
   IndexAccess
   
   function FunctionAccess(){
       Accessor.prototype.constructor.apply(this,arguments)
   };
   FunctionAccess.prototype.__proto__ = Accessor.prototype;
   
     FunctionAccess.prototype.parse = function(){
       this.req("(");
       this.lock();
       this.args = this.optSeparatedList(Expression, ",", ")");
     };
     FunctionAccess.prototype.toString = function(){
       return '(...)';
     };
   
   module.exports.FunctionAccess = FunctionAccess;
   FunctionAccess
   
     
     ASTBase.prototype.parseAccessors = function(){
         if ('.[('.indexOf(this.lexer.token.value)===-1) {
             return};
         while(true){
             var ac = this.parseDirect(this.lexer.token.value, AccessorsDirect);
             if (!ac) {
                 break};
             this.addAccessor(ac);
         };
         return;
     };
     ASTBase.prototype.insertAccessorAt = function(position, item){
           if (!this.accessors) {
               this.accessors = []};
           if (typeof item === 'string') {
               item = new PropertyAccess(this, item)};
           this.accessors.splice(position, 0, item);
     };
     ASTBase.prototype.addAccessor = function(item){
           if (!this.accessors) {
               this.accessors = []};
           this.insertAccessorAt(this.accessors.length, item);
           this.executes = item instanceof FunctionAccess;
           if (this.executes) {
               this.hasSideEffects = true};
     };
   var OPERAND_DIRECT_TYPE = {
         'STRING': StringLiteral, 
         'NUMBER': NumberLiteral, 
         'REGEX': RegExpLiteral, 
         'SPACE_BRACKET': ArrayLiteral
         };
   var OPERAND_DIRECT_TOKEN = {
         '(': ParenExpression, 
         '[': ArrayLiteral, 
         '{': ObjectLiteral, 
         'function': FunctionDeclaration, 
         '->': FunctionDeclaration, 
         'case': CaseWhenExpression, 
         'yield': YieldExpression
         };
   
   function Operand(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   Operand.prototype.__proto__ = ASTBase.prototype;
   
     Operand.prototype.parse = function(){
       this.name = this.parseDirect(this.lexer.token.type, OPERAND_DIRECT_TYPE) || this.parseDirect(this.lexer.token.value, OPERAND_DIRECT_TOKEN);
       if (this.name) {
           this.parseAccessors();
       }
       else {
           this.name = this.req(VariableRef);
       };
       
     };
   
   module.exports.Operand = Operand;
   Operand
   
   
   function Oper(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   Oper.prototype.__proto__ = ASTBase.prototype;
   
     Oper.prototype.parse = function(){
       
       
       if (this.parent.ternaryCount && this.opt('else')) {
           this.name = ':';
       }
       else {
           this.name = this.req('OPER');
       };
       this.lock();
       if (this.name === 'instance') {
           this.name += ' ' + this.req('of');
       }
       else if (this.name === 'has') {
           this.negated = this.opt('not') ? true : false;
           this.name += ' ' + this.req('property');
       }
       else if (this.name === 'hasnt') {
           this.negated = true;
           this.name += 'has ' + this.req('property');
       }
       else if (this.name === 'not') {
           this.negated = true;
           this.name = this.req('in', 'like');
       };
       if (this.name === 'into' && this.opt('var')) {
           this.intoVar = true;
           this.getParent(Statement).intoVars = true;
       }
       else if (this.name === 'isnt') {
         this.negated = true;
         this.name = 'is';
       }
       else if (this.name === 'instanceof') {
         this.name = 'instance of';
       };
       
       if (this.name === 'is') {
           if (this.opt('not')) {
               if (this.negated) {
                   this.throwError('"isnt not" is invalid')};
               this.negated = true;
           };
           
           if (this.opt('instance')) {
               this.name = 'instance ' + this.req('of');
           }
           else if (this.opt('instanceof')) {
               this.name = 'instance of';
           };
           
       };
       this.getPrecedence();
     };
     
     Oper.prototype.getPrecedence = function(){
       this.precedence = operatorsPrecedence.indexOf(this.name);
       if (this.precedence === -1) {
           debugger;
           throw new Error("OPER '" + this.name + "' not found in the operator precedence list");
       };
     };
   
   module.exports.Oper = Oper;
   Oper
   var unaryOperators = ['new', '-', 'no', 'not', 'type', 'typeof', '~', '+'];
   
   function UnaryOper(){
       Oper.prototype.constructor.apply(this,arguments)
   };
   UnaryOper.prototype.__proto__ = Oper.prototype;
   
     UnaryOper.prototype.parse = function(){
         this.name = this.reqOneOf(unaryOperators);
         if (this.name === 'type') {
             if (this.opt('of')) {
               this.name = 'type of';
             }
             else {
               this.throwParseFailed('expected "of" after "type"');
             };
         };
         this.lock();
         if (this.name === '-') {
             this.name = 'unary -';
         }
         else if (this.name === '+') {
             this.name = 'unary +';
         }
         else if (this.name === 'typeof') {
             this.name = 'type of';
         };
         
         this.getPrecedence();
     };
     
   
   module.exports.UnaryOper = UnaryOper;
   UnaryOper
   
   function Expression(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   Expression.prototype.__proto__ = ASTBase.prototype;
   
     Expression.prototype.parse = function(){
       
       
       var arr = [];
       this.operandCount = 0;
       this.ternaryCount = 0;
       while(true){
           if (unaryOperators.indexOf(this.lexer.token.value)>=0) {
               var unaryOper = this.opt(UnaryOper);
               if (unaryOper) {
                   arr.push(unaryOper);
                   this.lock();
               };
           };
           arr.push(this.req(Operand));
           this.operandCount += 1;
           this.lock();
           if (this.lexer.token.type === 'ASSIGN' || ',)]'.indexOf(this.lexer.token.value)>=0) {
               break;
           };
           if (this.lexer.token.type === 'NEWLINE' && !((this.parent instanceof ArrayLiteral))) {
             this.opt('NEWLINE');
             if (this.lexer.indent <= this.indent || this.lexer.token.type !== 'OPER') {
               this.lexer.returnToken();
               break;
             };
           };
           var oper = this.opt(Oper);
           if (!oper) {
               break};
           if (oper.name === '?') {
               this.ternaryCount++;
           }
           else if (oper.name === ':') {
               if (!this.ternaryCount) {
                   this.lexer.returnToken();
                   break;
               };
               this.ternaryCount--;
           };
           
           arr.push(oper);
           this.opt('NEWLINE');
       };
       if (this.ternaryCount) {
           this.throwError('missing (":"|else) on ternary operator (a? b else c)')};
       for( var index=0,item ; index<arr.length ; index++){item=arr[index];
       
         
         if (item instanceof UnaryOper && item.name === 'new') {
           var operand = arr[index + 1];
           if (operand.name instanceof VariableRef) {
               var varRef = operand.name;
               if (!varRef.executes) {
                   varRef.addAccessor(new FunctionAccess(this))};
           };
         };
       };
       this.growExpressionTree(arr);
     };
     
     Expression.prototype.growExpressionTree = function(arr){
       while(arr.length > 1){
         var pos = -1;
         var minPrecedenceInx = 100;
         for( var inx=0,item ; inx<arr.length ; inx++){item=arr[inx];
         
           
           
           if (item instanceof Oper) {
             if (!(item.pushed) && item.precedence < minPrecedenceInx) {
               pos = inx;
               minPrecedenceInx = item.precedence;
             };
           };
         };
         
         if (pos < 0) {
             this.throwError("can't find highest precedence operator")};
         var oper = arr[pos];
         oper.pushed = true;
         if (oper instanceof UnaryOper) {
           
             if (pos === arr.length) {
               this.throwError("can't get RIGHT operand for unary operator '" + oper + "'");
             };
           
           oper.right = arr.splice(pos + 1, 1)[0];
         }
         else {
           
             if (pos === arr.length) {
               this.throwError("can't get RIGHT operand for binary operator '" + oper + "'");
             };
             if (pos === 0) {
               this.throwError("can't get LEFT operand for binary operator '" + oper + "'");
             };
           
           oper.right = arr.splice(pos + 1, 1)[0];
           oper.left = arr.splice(pos - 1, 1)[0];
         };
         
       };
       this.root = arr[0];
     };
     
   
   module.exports.Expression = Expression;
   Expression
   
   function Literal(){
       ASTBase.prototype.constructor.apply(this,arguments)
         this.type='*abstract-Literal*';
   };
   Literal.prototype.__proto__ = ASTBase.prototype;
   
     Literal.prototype.getValue = function(){
       return this.name;
     };
   
   module.exports.Literal = Literal;
   Literal
   
   function NumberLiteral(){
       Literal.prototype.constructor.apply(this,arguments)
         this.type='Number';
   };
   NumberLiteral.prototype.__proto__ = Literal.prototype;
   
     NumberLiteral.prototype.parse = function(){
       this.name = this.req('NUMBER');
     };
   
   module.exports.NumberLiteral = NumberLiteral;
   NumberLiteral
   
   function StringLiteral(){
       Literal.prototype.constructor.apply(this,arguments)
         this.type='String';
   };
   StringLiteral.prototype.__proto__ = Literal.prototype;
   
     StringLiteral.prototype.parse = function(){
       this.name = this.req('STRING');
     };
     StringLiteral.prototype.getValue = function(){
       return this.name.slice(1, -1);
     };
   
   module.exports.StringLiteral = StringLiteral;
   StringLiteral
   
   function RegExpLiteral(){
       Literal.prototype.constructor.apply(this,arguments)
         this.type='RegExp';
   };
   RegExpLiteral.prototype.__proto__ = Literal.prototype;
   
     RegExpLiteral.prototype.parse = function(){
       this.name = this.req('REGEX');
     };
   
   module.exports.RegExpLiteral = RegExpLiteral;
   RegExpLiteral
   
   function ArrayLiteral(){
       Literal.prototype.constructor.apply(this,arguments)
         this.type='Array';
   };
   ArrayLiteral.prototype.__proto__ = Literal.prototype;
   
     ArrayLiteral.prototype.parse = function(){
       this.req('[', 'SPACE_BRACKET');
       this.lock();
       this.items = this.optSeparatedList(Expression, ',', ']');
     };
   
   module.exports.ArrayLiteral = ArrayLiteral;
   ArrayLiteral
   
   function ObjectLiteral(){
       Literal.prototype.constructor.apply(this,arguments)
         this.type='Object';
   };
   ObjectLiteral.prototype.__proto__ = Literal.prototype;
   
     ObjectLiteral.prototype.parse = function(){
       this.req('{');
       this.lock();
       this.items = this.optSeparatedList(NameValuePair, ',', '}');
     };
     ObjectLiteral.prototype.forEach = function(callback){
         for( var nameValue__inx=0,nameValue ; nameValue__inx<this.items.length ; nameValue__inx++){nameValue=this.items[nameValue__inx];
         
           nameValue.forEach(callback);
         };
         
     };
   
   module.exports.ObjectLiteral = ObjectLiteral;
   ObjectLiteral
   
   function NameValuePair(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   NameValuePair.prototype.__proto__ = ASTBase.prototype;
   
     NameValuePair.prototype.parse = function(){
       this.name = this.req('IDENTIFIER', 'STRING', 'NUMBER');
       this.req(':');
       this.lock();
       if (this.lexer.token.type === 'NEWLINE') {
         this.value = this.req(FreeObjectLiteral);
       }
       else {
         if (this.lexer.interfaceMode) {
             this.parseType();
         }
         else {
             this.value = this.req(Expression);
         };
       };
     };
     NameValuePair.prototype.forEach = function(callback){
         callback(this);
         
         if (this.value.root.name instanceof ObjectLiteral) {
           
           this.value.root.name.forEach(callback);
         };
     };
     
   
   module.exports.NameValuePair = NameValuePair;
   NameValuePair
   
   function FreeObjectLiteral(){
       ObjectLiteral.prototype.constructor.apply(this,arguments)
   };
   FreeObjectLiteral.prototype.__proto__ = ObjectLiteral.prototype;
   
     FreeObjectLiteral.prototype.parse = function(){
       this.lock();
       this.items = this.reqSeparatedList(NameValuePair, ',');
     };
   
   module.exports.FreeObjectLiteral = FreeObjectLiteral;
   FreeObjectLiteral
   
   function ParenExpression(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   ParenExpression.prototype.__proto__ = ASTBase.prototype;
   
     ParenExpression.prototype.parse = function(){
       this.req('(');
       this.lock();
       this.expr = this.req(Expression);
       this.opt('NEWLINE');
       this.req(')');
     };
   
   module.exports.ParenExpression = ParenExpression;
   ParenExpression
   
   function FunctionDeclaration(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   FunctionDeclaration.prototype.__proto__ = ASTBase.prototype;
   
     FunctionDeclaration.prototype.parse = function(){
       this.specifier = this.req('function', 'method', '->');
       this.lock();
       
       if (this.specifier !== 'method' && this.parent.parent.parent instanceof ClassDeclaration) {
           this.throwError("unexpected 'function' in 'class/append' body. You should use 'method'");
       };
       if (this.specifier !== '->') {
           this.name = this.opt('IDENTIFIER');
       };
       this.parseParametersAndBody();
     };
     FunctionDeclaration.prototype.parseParametersAndBody = function(){
       if (this.opt("(")) {
           this.paramsDeclarations = this.optSeparatedList(VariableDecl, ',', ')');
       }
       else if (this.specifier === '->') {
           this.paramsDeclarations = [];
           while(!(this.lexer.token.type === 'NEWLINE' || ['=', 'return'].indexOf(this.lexer.token.value)>=0)){
               if (this.paramsDeclarations.length) {
                   this.req(',')};
               var varDecl = new VariableDecl(this, this.req('IDENTIFIER'));
               if (this.opt(":")) {
                   varDecl.parseType()};
               this.paramsDeclarations.push(varDecl);
           };
           
       };
       if (this.opt('=', 'return')) {
           this.body = this.req(Expression);
       }
       else {
           if (this.opt('returns')) {
               this.parseType()};
           if (this.opt('[', 'SPACE_BRACKET')) {
               this.definePropItems = this.optSeparatedList(DefinePropertyItem, ',', ']');
           };
           this.body = this.req(Body);
       };
       
     };
   
   module.exports.FunctionDeclaration = FunctionDeclaration;
   FunctionDeclaration
   
   function DefinePropertyItem(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   DefinePropertyItem.prototype.__proto__ = ASTBase.prototype;
   
     
     DefinePropertyItem.prototype.parse = function(){
       this.lock();
       this.negated = this.opt('not');
       this.name = this.req('enumerable', 'configurable', 'writable');
     };
   
   module.exports.DefinePropertyItem = DefinePropertyItem;
   DefinePropertyItem
   
   function MethodDeclaration(){
       FunctionDeclaration.prototype.constructor.apply(this,arguments)
   };
   MethodDeclaration.prototype.__proto__ = FunctionDeclaration.prototype;
   
     MethodDeclaration.prototype.parse = function(){
       this.specifier = this.req('method');
       this.lock();
       this.name = this.lexer.token.value;
       if (!(/^[a-zA-Z$_]+[0-9a-zA-Z$_]*$/.test(this.name))) {
           this.throwError('invalid method name: "' + this.name + '"')};
       this.lexer.nextToken();
       this.parseParametersAndBody();
     };
   
   module.exports.MethodDeclaration = MethodDeclaration;
   MethodDeclaration
   
   function ClassDeclaration(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   ClassDeclaration.prototype.__proto__ = ASTBase.prototype;
   
     
     ClassDeclaration.prototype.parse = function(){
       this.req('class');
       this.lock();
       this.name = this.req('IDENTIFIER');
       if (!(this.lexer.interfaceMode) && !(String.isCapitalized(this.name))) {
           this.lexer.sayErr("class names should be Capitalized: class " + this.name);
       };
       this.opt(',');
       if (this.opt('extends', 'inherits', 'proto')) {
         this.opt('from', 'is');
         this.varRefSuper = this.req(VariableRef);
       };
       this.body = this.opt(Body);
     };
   
   module.exports.ClassDeclaration = ClassDeclaration;
   ClassDeclaration
   
   function ConstructorDeclaration(){
       MethodDeclaration.prototype.constructor.apply(this,arguments)
   };
   ConstructorDeclaration.prototype.__proto__ = MethodDeclaration.prototype;
   
     ConstructorDeclaration.prototype.parse = function(){
       this.specifier = this.req('constructor');
       this.lock();
       if (this.opt('new')) {
         var className = this.req('IDENTIFIER');
         var classDeclaration = this.getParent(ClassDeclaration);
         if (classDeclaration && classDeclaration.name !== className) {
             this.sayErr("Class Name mismatch " + className + "/" + this.parent.name)};
       };
       this.parseParametersAndBody();
     };
   
   module.exports.ConstructorDeclaration = ConstructorDeclaration;
   ConstructorDeclaration
   
   function AppendToDeclaration(){
       ClassDeclaration.prototype.constructor.apply(this,arguments)
   };
   AppendToDeclaration.prototype.__proto__ = ClassDeclaration.prototype;
   
     AppendToDeclaration.prototype.parse = function(){
       this.req('append', 'Append');
       this.req('to');
       this.lock();
       this.toNamespace = this.req('class', 'object', 'namespace') !== 'class';
       this.varRef = this.req(VariableRef);
       this.body = this.req(Body);
     };
   
   module.exports.AppendToDeclaration = AppendToDeclaration;
   AppendToDeclaration
   
   function NamespaceDeclaration(){
       AppendToDeclaration.prototype.constructor.apply(this,arguments)
   };
   NamespaceDeclaration.prototype.__proto__ = AppendToDeclaration.prototype;
   
     NamespaceDeclaration.prototype.parse = function(){
       this.req('namespace', 'Namespace');
       if (this.opt('properties')) {
           this.throwParseFailed("is properties")};
       this.lock();
       this.toNamespace = true;
       this.varRef = this.req(VariableRef);
       this.body = this.req(Body);
     };
   
   module.exports.NamespaceDeclaration = NamespaceDeclaration;
   NamespaceDeclaration
   
   function DebuggerStatement(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   DebuggerStatement.prototype.__proto__ = ASTBase.prototype;
   
     DebuggerStatement.prototype.parse = function(){
       this.name = this.req("debugger");
     };
   
   module.exports.DebuggerStatement = DebuggerStatement;
   DebuggerStatement
   
   function CompilerStatement(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   CompilerStatement.prototype.__proto__ = ASTBase.prototype;
   
     CompilerStatement.prototype.parse = function(){
       this.req('compiler', 'compile');
       this.lock();
       this.kind = this.lexer.token.value;
       if (this.kind === 'import') {
         this.importStatement = this.req(ImportStatement);
         return;
       };
       this.kind = this.req('set', 'if', 'debugger', 'options');
       if (this.kind === 'set') {
           this.list = this.reqSeparatedList(VariableDecl, ',');
       }
       else if (this.kind === 'if') {
         this.conditional = this.req('IDENTIFIER');
         if (this.compilerVar(this.conditional)) {
             this.body = this.req(Body);
         }
         else {
           do{
             this.lexer.nextToken();
           } while (!(this.lexer.indent <= this.indent));
           
         };
       }
       else if (this.kind === 'debugger') {
         debugger;
       }
       else {
         this.sayErr('invalid compiler command');
       };
     };
   
   module.exports.CompilerStatement = CompilerStatement;
   CompilerStatement
   
   function ImportStatement(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   ImportStatement.prototype.__proto__ = ASTBase.prototype;
   
     ImportStatement.prototype.parse = function(){
       this.req('import');
       this.lock();
       this.list = this.reqSeparatedList(ImportStatementItem, ",");
       var parentModule = this.getParent(Module);
       for( var item__inx=0,item ; item__inx<this.list.length ; item__inx++){item=this.list[item__inx];
       
           parentModule.requireCallNodes.push(item);
       };
       
     };
   
   module.exports.ImportStatement = ImportStatement;
   ImportStatement
   
   function ImportStatementItem(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   ImportStatementItem.prototype.__proto__ = ASTBase.prototype;
   
     ImportStatementItem.prototype.parse = function(){
       this.name = this.req('IDENTIFIER');
       if (this.opt('from')) {
           this.lock();
           this.importParameter = this.req(StringLiteral);
       };
     };
   
   module.exports.ImportStatementItem = ImportStatementItem;
   ImportStatementItem
   
   function DeclareStatement(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   DeclareStatement.prototype.__proto__ = ASTBase.prototype;
   
     DeclareStatement.prototype.parse = function(){
       this.req('declare');
       this.lock();
       this.names = [];
       this.specifier = this.opt('on');
       if (this.specifier) {
           this.name = this.req('IDENTIFIER');
           this.names = this.reqSeparatedList(VariableDecl, ',');
           return;
       };
       this.specifier = this.opt('valid');
       if (this.specifier) {
           this.varRef = this.req(VariableRef);
           if (!this.varRef.accessors) {
               this.sayErr("declare valid: expected accesor chain. Example: 'declare valid name.member.member'")};
           if (this.opt(':')) {
               this.parseType()};
           return;
       };
       if (this.opt('name')) {
         this.specifier = this.req('affinity');
       }
       else {
         this.specifier = this.opt('global') || 'types';
       };
       this.names = this.reqSeparatedList(VariableDecl, ',');
       for( var varDecl__inx=0,varDecl ; varDecl__inx<this.names.length ; varDecl__inx++){varDecl=this.names[varDecl__inx];
       
          if (this.specifier === 'affinity' && varDecl.type || varDecl.assignedValue) {
             this.sayErr("declare name affinity: expected 'name,name,...'");
          };
       };
       return;
     };
   
   module.exports.DeclareStatement = DeclareStatement;
   DeclareStatement
   
   function DefaultAssignment(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   DefaultAssignment.prototype.__proto__ = ASTBase.prototype;
   
     DefaultAssignment.prototype.parse = function(){
       this.req('default');
       this.lock();
       this.assignment = this.req(AssignmentStatement);
     };
   
   module.exports.DefaultAssignment = DefaultAssignment;
   DefaultAssignment
   
   function EndStatement(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   EndStatement.prototype.__proto__ = ASTBase.prototype;
   
     EndStatement.prototype.parse = function(){
       this.req('end');
       this.lock();
       this.references = [];
       while(!(this.opt('NEWLINE', 'EOF'))){
           if (this.lexer.token.type === 'IDENTIFIER') {
             this.references.push(this.lexer.token.value);
           };
           this.lexer.nextToken();
       };
       
     };
   
   module.exports.EndStatement = EndStatement;
   EndStatement
   
   function YieldExpression(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   YieldExpression.prototype.__proto__ = ASTBase.prototype;
   
     YieldExpression.prototype.parse = function(){
       this.req('yield');
       this.specifier = this.req('until', 'parallel');
       this.lock();
       if (this.specifier === 'until') {
           this.fnCall = this.req(FunctionCall);
       }
       else {
           this.req('map');
           this.arrExpression = this.req(Expression);
           this.fnCall = this.req(FunctionCall);
       };
     };
   
   module.exports.YieldExpression = YieldExpression;
   YieldExpression
   
   function Adjective(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   Adjective.prototype.__proto__ = ASTBase.prototype;
   
    Adjective.prototype.parse = function(){
       this.name = this.req('public', 'export', 'default', 'nice', 'generator', 'shim', 'helper', 'global');
    };
    Adjective.prototype.validate = function(statement){
       var CFVN = ['class', 'function', 'var', 'namespace'];
       var validCombinations = {
             export: CFVN, 
             public: CFVN, 
             default: CFVN, 
             generator: ['function', 'method'], 
             nice: ['function', 'method'], 
             shim: ['function', 'method', 'class'], 
             helper: ['function', 'method', 'class'], 
             global: ['import', 'declare']
             };
       
       var valid = validCombinations[this.name] || ['-*none*-'];
       if (!((valid.indexOf(statement.keyword)>=0))) {
           this.throwError("'" + this.name + "' can only apply to " + (valid.join('|')) + " not to '" + statement.keyword + "'");
       };
       statement[this.name] = true;
       
       if (this.name === 'public') {
           statement.export = true};
       
       if (statement.export && statement.default) {
           var moduleNode = this.getParent(Module);
           if (moduleNode.exportDefault) {
               this.throwError("only one 'export default' can be defined")};
           moduleNode.exportDefault = statement;
       };
    };
   
   module.exports.Adjective = Adjective;
   Adjective
   
   function FunctionCall(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   FunctionCall.prototype.__proto__ = ASTBase.prototype;
   
     
     FunctionCall.prototype.parse = function(options){
       
       
       if (this.parent.preParsedVarRef) {
         this.varRef = this.parent.preParsedVarRef;
       }
       else {
         this.varRef = this.req(VariableRef);
       };
       if (this.varRef.executes) {
           return;
       };
       if (['NEWLINE', 'EOF'].indexOf(this.lexer.token.type)>=0) {
         return;
       };
       var functionAccess = new FunctionAccess(this.varRef);
       functionAccess.args = functionAccess.optSeparatedList(Expression, ",");
       if (this.lexer.token.value === '->') {
           functionAccess.args.push(this.req(FunctionDeclaration));
       };
       this.varRef.addAccessor(functionAccess);
     };
   
   module.exports.FunctionCall = FunctionCall;
   FunctionCall
   
   function SwitchStatement(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   SwitchStatement.prototype.__proto__ = ASTBase.prototype;
   
     SwitchStatement.prototype.parse = function(){
       this.req('switch');
       this.lock();
       this.varRef = this.opt(VariableRef);
       this.cases = [];
       while(!(this.lexer.token.type === 'EOF')){
           var keyword = this.req('case', 'default', 'NEWLINE');
           if (keyword === 'case') {
               this.cases.push(this.req(SwitchCase));
           }
           else if (keyword === 'default') {
               this.opt(":");
               this.defaultBody = this.req(Body);
               break;
           };
       };
       if (!this.cases.length) {
           this.throwError("no 'case' found after 'switch'")};
     };
   
   module.exports.SwitchStatement = SwitchStatement;
   SwitchStatement
   
   function SwitchCase(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   SwitchCase.prototype.__proto__ = ASTBase.prototype;
   
       SwitchCase.prototype.parse = function(){
           this.expressions = this.reqSeparatedList(Expression, ",", ":");
           this.body = this.req(Body);
       };
   
   module.exports.SwitchCase = SwitchCase;
   SwitchCase
   
   function CaseWhenExpression(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   CaseWhenExpression.prototype.__proto__ = ASTBase.prototype;
   
     CaseWhenExpression.prototype.parse = function(){
       this.req('case');
       this.lock();
       this.varRef = this.opt(VariableRef);
       this.cases = [];
       while(!(this.lexer.token.value === 'end')){
           var keyword = this.req('NEWLINE', 'when', 'else');
           if (keyword === 'when') {
               this.cases.push(this.req(CaseWhenSection));
           }
           else if (keyword === 'else') {
               this.elseExpression = this.req(Expression);
               break;
           };
       };
       if (!this.cases.length) {
           this.throwError("no 'when' found after 'case'")};
       this.opt('NEWLINE');
       this.req('end');
     };
   
   module.exports.CaseWhenExpression = CaseWhenExpression;
   CaseWhenExpression
   
   function CaseWhenSection(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   CaseWhenSection.prototype.__proto__ = ASTBase.prototype;
   
       CaseWhenSection.prototype.parse = function(){
           if (this.parent.varRef) {
               this.expressions = this.reqSeparatedList(Expression, ",");
           }
           else {
               this.booleanExpression = this.req(Expression);
           };
           this.req('then');
           this.resultExpression = this.req(Expression);
       };
   
   module.exports.CaseWhenSection = CaseWhenSection;
   CaseWhenSection
   
   function Statement(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   Statement.prototype.__proto__ = ASTBase.prototype;
   
     Statement.prototype.parse = function(){
       debug("");
       this.lexer.infoLine.dump();
       this.statement = this.parseDirect(this.lexer.token.value, StatementsDirect);
       if (!this.statement) {
         this.adjectives = this.optList(Adjective);
         this.statement = this.parseDirect(this.lexer.token.value, StatementsDirect);
         if (!this.statement) {
           this.preParsedVarRef = this.req(VariableRef);
           this.statement = this.req(AssignmentStatement, FunctionCall);
           this.preParsedVarRef = undefined;
         };
       };
       
       if (this.adjectives) {
         for( var adj__inx=0,adj ; adj__inx<this.adjectives.length ; adj__inx++){adj=this.adjectives[adj__inx];
         
           adj.validate(this.statement);
         };
         
       };
     };
     Statement.prototype.hasAdjective = function(name){
       if (this.adjectives) {
         for( var adjective__inx=0,adjective ; adjective__inx<this.adjectives.length ; adjective__inx++){adjective=this.adjectives[adjective__inx];
         if(adjective.name === name){
           return true;
         }};
         
       };
     };
   
   module.exports.Statement = Statement;
   Statement
   
   function Body(){
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   Body.prototype.__proto__ = ASTBase.prototype;
   
     Body.prototype.parse = function(){
       if (this.lexer.interfaceMode) {
           if ([ClassDeclaration, AppendToDeclaration, NamespaceDeclaration].indexOf(this.parent.constructor)===-1) {
               return;
           };
       };
       if (this.lexer.token.type !== 'NEWLINE') {
           this.lexer.sayErr("found " + this.lexer.token + " but expected NEWLINE and indented body");
       };
       this.statements = this.reqSeparatedList(Statement, ";");
     };
   
   module.exports.Body = Body;
   Body
   
   function SingleLineStatement(){
       Statement.prototype.constructor.apply(this,arguments)
   };
   SingleLineStatement.prototype.__proto__ = Statement.prototype;
   
     SingleLineStatement.prototype.parse = function(){
       this.statements = this.reqSeparatedList(Statement, ";", 'NEWLINE');
       this.lexer.returnToken();
     };
   
   module.exports.SingleLineStatement = SingleLineStatement;
   SingleLineStatement
   
   function Module(){
       Body.prototype.constructor.apply(this,arguments)
   };
   Module.prototype.__proto__ = Body.prototype;
   
     Module.prototype.parse = function(){
         this.lock();
         this.statements = this.optFreeFormList(Statement, ';', 'EOF');
     };
   
   module.exports.Module = Module;
   Module
   var StatementsDirect = {
     'class': ClassDeclaration, 
     'Class': ClassDeclaration, 
     'append': AppendToDeclaration, 
     'Append': AppendToDeclaration, 
     'function': FunctionDeclaration, 
     'constructor': ConstructorDeclaration, 
     'properties': PropertiesDeclaration, 
     'namespace': [NamespaceDeclaration, PropertiesDeclaration], 
     'method': MethodDeclaration, 
     'var': VarStatement, 
     'let': VarStatement, 
     'default': DefaultAssignment, 
     'if': IfStatement, 
     'when': IfStatement, 
     'for': ForStatement, 
     'while': WhileUntilLoop, 
     'until': WhileUntilLoop, 
     'do': [DoNothingStatement, DoLoop], 
     'break': LoopControlStatement, 
     'switch': SwitchStatement, 
     'continue': LoopControlStatement, 
     'end': EndStatement, 
     'return': ReturnStatement, 
     'with': WithStatement, 
     'print': PrintStatement, 
     'throw': ThrowStatement, 
     'raise': ThrowStatement, 
     'fail': ThrowStatement, 
     'try': TryCatch, 
     'exception': ExceptionBlock, 
     'Exception': ExceptionBlock, 
     'debugger': DebuggerStatement, 
     'declare': DeclareStatement, 
     'import': ImportStatement, 
     'delete': DeleteStatement, 
     'compile': CompilerStatement, 
     'compiler': CompilerStatement, 
     'yield': YieldExpression
     };
   var AccessorsDirect = {
       '.': PropertyAccess, 
       '[': IndexAccess, 
       '(': FunctionAccess
       };
   function autoCapitalizeCoreClasses(name){
     if (['string', 'array', 'number', 'object', 'function', 'boolean'].indexOf(name)>=0) {
       return name.slice(0, 1).toUpperCase() + name.slice(1);
     };
     return name;
   };
   
   module.exports.autoCapitalizeCoreClasses=autoCapitalizeCoreClasses;
   
     ASTBase.prototype.parseType = function(){
       if (this.opt('function')) {
           if (this.opt('(')) {
               
               this.paramsDeclarations = this.optSeparatedList(VariableDecl, ',', ')');
           };
           this.type = new VariableRef(this, 'function');
       }
       else {
         this.type = this.req(VariableRef);
       };
       
       this.type.name = autoCapitalizeCoreClasses(this.type.name);
       if (this.opt('Array', 'array')) {
           this.itemType = this.type;
           this.type = 'Array';
       };
     };
