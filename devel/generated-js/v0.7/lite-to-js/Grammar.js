//Compiled by LiteScript compiler v0.6.7, source: /home/ltato/LiteScript/devel/source/v0.7/Grammar.lite.md
// LiteScript Grammar
// ==================

// The LiteScript Grammar is based on [Parsing Expression Grammars (PEGs)](http://en.wikipedia.org/wiki/Parsing_expression_grammar)
// *with extensions*.

// Grammar Meta-Syntax
// -------------------

// Each Grammar class, contains a 'grammar definition' as reference.
// The meta-syntax for the grammar definitions is an extended form of
// [Parsing Expression Grammars (PEGs)](http://en.wikipedia.org/wiki/Parsing_expression_grammar)

// The differences with classic PEG are:
// * instead of `Symbol <- definition`, we use `Symbol: definition` (colon instead of arrow)
// * we use `[Symbol]` for optional symbols instead of `Symbol?` (brackets also groups symbols, the entire group is optional)
// * symbols upper/lower case has meaning
// * we add `(Symbol,)` for `comma separated List of` as a powerful syntax option

// Examples:

// `ReturnStatement`    : CamelCase is reserved for non-terminal symbol<br>
// `function`       : all-lowercase means the literal word<br>
// `":"`            : literal symbols are quoted<br>

// `IDENTIFIER`,`OPER` : all-uppercase denotes entire classes of symbols<br>
// `NEWLINE`,`EOF`     : or special unprintable characters<br>

// `[to]`               : Optional symbols are enclosed in brackets<br>
// `(var|let)`          : The vertical bar represents ordered alternatives<br>

// `(Oper Operand)`     : Parentheses groups symbols<br>
// `(Oper Operand)*`    : Asterisk after a group `()*` means the group can repeat (meaning one or more)<br>
// `[Oper Operand]*`    : Asterisk after a optional group `[]*` means *zero* or more of the group.<br>

// `[Expression,]` : the comma means a comma "Separated List".<br>
// `Body: (Statement;)` : the semicolon means: a semicolon "Separated List".<br>


// ###"Separated List"

// Example: `FunctionCall: IDENTIFIER '(' [Expression,] ')'`

// `[Expression,]` means *optional* **comma "Separated List"** of Expressions.
// Since the comma is inside a **[ ]** group, it means the entire list is optional.

// Example: `VarStatement: (VariableDecl,)`, where `VariableDecl: IDENTIFIER ["=" Expression]`

// `(VariableDecl,)` means **comma "Separated List"** of `VariableDecl`
// Since the comma is inside a **( )** group, it means at least one of the Symbol is required.


// Implementation
// ---------------

// The LiteScript Grammar is defined as `classes`, one class for each non-terminal symbol.

// The `.parse()` method of each class will try the grammar on the token stream and:
// * If all tokens match, it will simply return after consuming the tokens. (success)
// * On a token mismatch, it will raise a 'parse failed' exception.

// When a 'parse failed' exception is raised, other classes can be tried.
// If no class parses ok, a compiler error is emitted and compilation is aborted.

// if the error is *before* the class has determined this was the right language construction,
// it is a soft-error and other grammars can be tried over the source code.

// if the error is *after* the class has determined this was the right language construction
// (if the node was 'locked'), it is a hard-error and compilation is aborted.

// The `ASTBase` module defines the base class for the grammar classes along with
// utility methods to **req**uire tokens and allow **opt**ional ones.


// ### Dependencies

   // import ASTBase, log
   var ASTBase = require('./ASTBase');
   var log = require('./log');
   var debug = log.debug;


// Reserved Words
// ---------------

// Words that are reserved in LiteScript and cannot be used as variable or function names
// (There are no restrictions to object property names)

   var RESERVED_WORDS = ['namespace', 'function', 'async', 'class', 'method', 'constructor', 'prototype', 'if', 'then', 'else', 'switch', 'when', 'case', 'end', 'null', 'true', 'false', 'undefined', 'and', 'or', 'but', 'no', 'not', 'has', 'hasnt', 'property', 'properties', 'new', 'is', 'isnt', 'do', 'loop', 'while', 'until', 'for', 'to', 'break', 'continue', 'return', 'try', 'catch', 'throw', 'raise', 'fail', 'exception', 'finally', 'with', 'arguments', 'in', 'instanceof', 'typeof', 'var', 'let', 'default', 'delete', 'interface', 'implements', 'yield', 'like', 'this', 'super', 'export', 'compiler', 'compile', 'debugger'];


// Operators precedence
// --------------------

// The order of symbols here determines operators precedence

   var operatorsPrecedence = ['++', '--', 'unary -', 'unary +', 'bitnot', 'bitand', 'bitor', 'bitxor', '>>', '<<', 'new', 'type of', 'instance of', 'has property', '*', '/', '%', '+', '-', '&', 'into', 'in', '>', '<', '>=', '<=', 'is', '<>', '!==', 'like', 'no', 'not', 'and', 'but', 'or', '?', ':'];

// --------------------------

// LiteScript Grammar - AST Classes
// ================================
// This file is code and documentation, you'll find a class
// for each syntax construction the compiler accepts.

   // export class PrintStatement extends ASTBase
   // constructor
   function PrintStatement(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
        // args: Expression array
   };
   // PrintStatement (extends|proto is) ASTBase
   PrintStatement.prototype.__proto__ = ASTBase.prototype;

     // method parse()
     PrintStatement.prototype.parse = function(){
       this.req('print');

// At this point we lock because it is definitely a `print` statement. Failure to parse the expression
// from this point is a syntax error.

       this.lock();
       this.args = this.optSeparatedList(Expression, ",");
     };
   // export
   module.exports.PrintStatement = PrintStatement;
   // end class PrintStatement


   // export class VarStatement extends ASTBase
   // constructor
   function VarStatement(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
        // list:array
   };
   // VarStatement (extends|proto is) ASTBase
   VarStatement.prototype.__proto__ = ASTBase.prototype;

     // method parse()
     VarStatement.prototype.parse = function(){
       this.req('var', 'let');
       this.lock();
       this.list = this.reqSeparatedList(VariableDecl, ",");
     };
   // export
   module.exports.VarStatement = VarStatement;
   // end class VarStatement


   // export class VariableDecl extends ASTBase
   // constructor
   function VariableDecl(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
        // name
        // aliasVarRef: VariableRef
        // assignedValue: Expression
   };
   // VariableDecl (extends|proto is) ASTBase
   VariableDecl.prototype.__proto__ = ASTBase.prototype;

      // declare name affinity varDecl, paramDecl

     // method parse()
     VariableDecl.prototype.parse = function(){
       this.name = this.req('IDENTIFIER');
       this.lock();

// optional type annotation &
// optional assigned value

       var parseFreeForm = undefined;

       // if .opt(':'), .parseType
       if (this.opt(':')) {this.parseType()};

       // if .opt('=')
       if (this.opt('=')) {

           // if .lexer.token.type is 'NEWLINE' #dangling assignment "="[NEWLINE]
           if (this.lexer.token.type === 'NEWLINE') {// #dangling assignment "="[NEWLINE]
               parseFreeForm = true;
               // if .lexer.options.literalMap, .type='Map'
               if (this.lexer.options.literalMap) {this.type = 'Map'};
           }
           
           else if (this.lexer.token.value === 'map') {// #literal map creation "x = map"[NEWLINE]name:value[NEWLINE]name=value...
               this.req('map');
               this.type = 'Map';
               parseFreeForm = true;
           }
           
           else {

               // if .lexer.interfaceMode //assignment in interfaces => declare var alias. as in: `var $=jQuery`
               if (this.lexer.interfaceMode) { //assignment in interfaces => declare var alias. as in: `var $=jQuery`
                   this.aliasVarRef = this.req(VariableRef);
               }
               
               else {
                   this.assignedValue = this.req(Expression);
               };
               return;
           };
       };


       // if parseFreeForm #dangling assignment, parse a free-form object literal as assigned value
       if (parseFreeForm) {// #dangling assignment, parse a free-form object literal as assigned value
           this.assignedValue = this.req(FreeObjectLiteral);
           // if .type is 'Map'
           if (this.type === 'Map') {
               this.assignedValue.type = 'Map';
               this.assignedValue.isMap = true;
           };
       };
     };
   // export
   module.exports.VariableDecl = VariableDecl;
   // end class VariableDecl


// ##FreeObjectLiteral and Free-Form Separated List

// In *free-form* mode, each item stands on its own line, and separators (comma/semicolon)
// are optional, and can appear after or before the NEWLINE.

// For example, given the previous example: **VarStatement: (IDENTIFIER ["=" Expression] ,)**,
// all the following constructions are equivalent and valid in LiteScript:

// Examples:
//     //standard js
//     var a = {prop1:30 prop2: { prop2_1:19, prop2_2:71} arr:["Jan","Feb","Mar"]}
//     //LiteScript: mixed freeForm and comma separated
//     var a =
//         prop1: 30
//         prop2:
//           prop2_1: 19, prop2_2: 71
//         arr: [ "Jan",
//               "Feb", "Mar"]
//     //LiteScript: in freeForm, commas are optional
//     var a =
//         prop1: 30
//         prop2:
//           prop2_1: 19,
//           prop2_2: 71,
//         arr: [
//             "Jan",
//             "Feb"
//             "Mar"
//             ]

// ##More about comma separated lists

// The examples above only show Object and List Expressions, but *you can use free-form mode (multiple lines with the same indent), everywhere a comma separated list of items apply.*

// The previous examples were for:

// * Literal Object expression<br>
  // because a Literal Object expression is:<br>
  // "{" + a comma separated list of Item:Value pairs + "}"

// and
// * Literal Array expression<br>
  // because a Literal Array expression is<br>
  // "[" + a comma separated list of expressions + "]"

// But the free-form option also applies for:

// * Function parameters declaration<br>
  // because Function parameters declaration is:<br>
  // "(" + a comma separated list of paramter names + ")"

// * Arguments, for any function call<br>
  // because function call arguments are:<br>
  // "(" + a comma separated list of expressions + ")"

// * Variables declaration<br>
  // because variables declaration is:<br>
  // 'var' + a comma separated list of: IDENTIFIER ["=" Expression]

// Examples:
//   js:
//     Console.log(title,subtitle,line1,line2,value,recommendation)
//   LiteScript available variations:
//     print title,subtitle,
//           line1,line2,
//           value,recommendation
//     print
//       title
//       subtitle
//       line1
//       line2
//       value
//       recommendation
//   js:
//     var a=10, b=20, c=30,
//         d=40;
//     function complexFn( 10, 4, 'sample'
//        'see 1',
//        2+2,
//        null ){
//       ...function body...
//     };
//   LiteScript:
//     var
//       a=10,b=20
//       c=30,d=40
//     function complexFn(
//       10       # determines something important to this function
//       4        # do not pass nulll to this
//       'sample' # this is original data
//       'see 1'  # note param
//       2+2      # useful tip
//       null     # reserved for extensions ;)
//       )
//       ...function body...


   // export class PropertiesDeclaration extends ASTBase
   // constructor
   function PropertiesDeclaration(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
        // list: VariableDecl array
        // toNamespace: boolean
   };
   // PropertiesDeclaration (extends|proto is) ASTBase
   PropertiesDeclaration.prototype.__proto__ = ASTBase.prototype;

      // declare name affinity propDecl

     // method parse()
     PropertiesDeclaration.prototype.parse = function(){
       this.req('properties');
       this.lock();
       this.list = this.reqSeparatedList(VariableDecl, ',');
     };
   // export
   module.exports.PropertiesDeclaration = PropertiesDeclaration;
   // end class PropertiesDeclaration


   // export class WithStatement extends ASTBase
   // constructor
   function WithStatement(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
        // varRef, body
   };
   // WithStatement (extends|proto is) ASTBase
   WithStatement.prototype.__proto__ = ASTBase.prototype;

     // method parse()
     WithStatement.prototype.parse = function(){
       this.req('with');
       this.lock();
       this.name = ASTBase.getUniqueVarName('with');// #unique 'with' storage var name
       this.varRef = this.req(VariableRef);
       this.body = this.req(Body);
     };
   // export
   module.exports.WithStatement = WithStatement;
   // end class WithStatement

// ### export class WhenClass extends ASTBase
// `WhenClass: when class-VariableRef`
// Defines a filter to:
// - a) catch only specific error classes
// - b) implement `case class of... when` clauses
//       properties classRef:VariableRef
//       method parse()
//         .req 'when'
//         .lock()
//         .classRef = .req(VariableRef)

   // export class TryCatch extends ASTBase
   // constructor
   function TryCatch(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties body,exceptionBlock
   };
   // TryCatch (extends|proto is) ASTBase
   TryCatch.prototype.__proto__ = ASTBase.prototype;

     // method parse()
     TryCatch.prototype.parse = function(){
       this.req('try');
       this.lock();
       this.body = this.req(Body);

       this.exceptionBlock = this.req(ExceptionBlock);
     };
   // export
   module.exports.TryCatch = TryCatch;
   // end class TryCatch


   // export class ExceptionBlock extends ASTBase
   // constructor
   function ExceptionBlock(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
        // catchVar:string
        //whenClass
        // body,finallyBody
   };
   // ExceptionBlock (extends|proto is) ASTBase
   ExceptionBlock.prototype.__proto__ = ASTBase.prototype;

     // method parse()
     ExceptionBlock.prototype.parse = function(){
       this.req('catch', 'exception', 'Exception');
       this.lock();

// get catch variable - Note: catch variables in js are block-scoped

       this.catchVar = this.req('IDENTIFIER');
        //.whenClass = .opt(WhenClass)

// get body

       this.body = this.req(Body);

// get optional "finally" block

       // if .opt('finally'), .finallyBody = .req(Body)
       if (this.opt('finally')) {this.finallyBody = this.req(Body)};
     };
   // export
   module.exports.ExceptionBlock = ExceptionBlock;
   // end class ExceptionBlock


   // export class ThrowStatement extends ASTBase
   // constructor
   function ThrowStatement(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties specifier, expr
   };
   // ThrowStatement (extends|proto is) ASTBase
   ThrowStatement.prototype.__proto__ = ASTBase.prototype;

     // method parse()
     ThrowStatement.prototype.parse = function(){
       this.specifier = this.req('throw', 'raise', 'fail');

// At this point we lock because it is definitely a `throw` statement

       this.lock();
       // if .specifier is 'fail', .req 'with'
       if (this.specifier === 'fail') {this.req('with')};
       this.expr = this.req(Expression);// #trow expression
     };
   // export
   module.exports.ThrowStatement = ThrowStatement;
   // end class ThrowStatement


   // export class ReturnStatement extends ASTBase
   // constructor
   function ReturnStatement(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties expr
   };
   // ReturnStatement (extends|proto is) ASTBase
   ReturnStatement.prototype.__proto__ = ASTBase.prototype;

     // method parse()
     ReturnStatement.prototype.parse = function(){
       this.req('return');
       this.lock();
       this.expr = this.opt(Expression);
     };
   // export
   module.exports.ReturnStatement = ReturnStatement;
   // end class ReturnStatement


   // export class IfStatement extends ASTBase
   // constructor
   function IfStatement(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
        // conditional,body,elseStatement
   };
   // IfStatement (extends|proto is) ASTBase
   IfStatement.prototype.__proto__ = ASTBase.prototype;

     // method parse()
     IfStatement.prototype.parse = function(){

       this.req('if', 'when');
       this.lock();
       this.conditional = this.req(Expression);

// after `,` or `then`, a statement on the same line is required
// if we're processing all single-line if's, ',|then' is *required*

// choose same body class as parent:
// either SingleLineBody or Body (multiline indented)

       // if .opt(',','then')
       if (this.opt(',', 'then')) {
           this.body = this.req(SingleLineBody);
           this.req('NEWLINE');
       }
       
       else {
           this.body = this.req(Body);
       };
       // end if

// control: "if"-"else" are related by having the same indent

       // if .lexer.token.value is 'else'
       if (this.lexer.token.value === 'else') {

           // if .lexer.index isnt 0
           if (this.lexer.index !== 0) {
               this.throwError('expected "else" to start on a new line');
           };

           // if .lexer.indent < .indent
           if (this.lexer.indent < this.indent) {
                // #token is 'else' **BUT IS LESS-INDENTED**. It is not the "else" to this "if"
               return;
           };

           // if .lexer.indent > .indent
           if (this.lexer.indent > this.indent) {
               this.throwError("'else' statement is over-indented");
           };
       };

       // end if

// Now get optional `[ElseIfStatement|ElseStatement]`

       this.elseStatement = this.opt(ElseIfStatement, ElseStatement);
     };
   // export
   module.exports.IfStatement = IfStatement;
   // end class IfStatement


   // export class ElseIfStatement extends ASTBase
   // constructor
   function ElseIfStatement(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
        // nextIf
   };
   // ElseIfStatement (extends|proto is) ASTBase
   ElseIfStatement.prototype.__proto__ = ASTBase.prototype;

     // method parse()
     ElseIfStatement.prototype.parse = function(){
       this.req('else');
       this.req('if');
       this.lock();

// return the consumed 'if', to parse as a normal `IfStatement`

       this.lexer.returnToken();
       this.nextIf = this.req(IfStatement);
     };
   // export
   module.exports.ElseIfStatement = ElseIfStatement;
   // end class ElseIfStatement


   // export class ElseStatement extends ASTBase
   // constructor
   function ElseStatement(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties body
   };
   // ElseStatement (extends|proto is) ASTBase
   ElseStatement.prototype.__proto__ = ASTBase.prototype;

     // method parse()
     ElseStatement.prototype.parse = function(){
       this.req('else');
       this.lock();
       this.body = this.req(Body);
     };
   // export
   module.exports.ElseStatement = ElseStatement;
   // end class ElseStatement


// Loops
// =====

// LiteScript provides the standard js and C `while` loop, a `until` loop
// and a `do... loop while|until`


// DoLoop
// ------

// `DoLoop: do [pre-WhileUntilExpression] [":"] Body loop`
// `DoLoop: do [":"] Body loop [post-WhileUntilExpression]`

// do-loop can have a optional pre-condition or a optional post-condition

// ##### Case 1) do-loop without any condition

// a do-loop without any condition is an *infinite loop* (usually with a `break` statement inside)

// Example:
// ```
// var x=1
// do:
  // x++
  // print x
  // if x is 10, break
// loop
// ```

// ##### Case 2) do-loop with pre-condition

// A do-loop with pre-condition, is the same as a while|until loop

// Example:
// ```
// var x=1
// do while x<10
  // x++
  // print x
// loop
// ```

// ##### Case 3) do-loop with post-condition

// A do-loop with post-condition, execute the block, at least once, and after each iteration,
// checks the post-condition, and loops `while` the expression is true
// *or* `until` the expression is true

// Example:
// ```
// var x=1
// do
  // x++
  // print x
// loop while x < 10
// ```

// #### Implementation

   // public class DoLoop extends ASTBase
   // constructor
   function DoLoop(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
        // preWhileUntilExpression
        // body
        // postWhileUntilExpression
   };
   // DoLoop (extends|proto is) ASTBase
   DoLoop.prototype.__proto__ = ASTBase.prototype;

     // method parse()
     DoLoop.prototype.parse = function(){
       this.req('do');
       // if .opt('nothing')
       if (this.opt('nothing')) {
         this.throwParseFailed('is do nothing');
       };
       this.opt(":");
       this.lock();

// Get optional pre-condition

       this.preWhileUntilExpression = this.opt(WhileUntilExpression);
       this.body = this.opt(Body);
       this.req("loop");

// Get optional post-condition

       this.postWhileUntilExpression = this.opt(WhileUntilExpression);
       // if .preWhileUntilExpression and .postWhileUntilExpression
       if (this.preWhileUntilExpression && this.postWhileUntilExpression) {
         this.sayErr("Loop: cannot have a pre-condition a and post-condition at the same time");
       };
     };
   // export
   module.exports.DoLoop = DoLoop;
   // end class DoLoop


   // export class WhileUntilLoop extends DoLoop
   // constructor
   function WhileUntilLoop(){// default constructor: call super.constructor
       DoLoop.prototype.constructor.apply(this,arguments)
      // properties preWhileUntilExpression, body
   };
   // WhileUntilLoop (extends|proto is) DoLoop
   WhileUntilLoop.prototype.__proto__ = DoLoop.prototype;

     // method parse()
     WhileUntilLoop.prototype.parse = function(){
       this.preWhileUntilExpression = this.req(WhileUntilExpression);
       this.lock();
       this.body = this.opt(Body);
     };
   // export
   module.exports.WhileUntilLoop = WhileUntilLoop;
   // end class WhileUntilLoop


   // export helper class WhileUntilExpression extends ASTBase
   // constructor
   function WhileUntilExpression(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties expr
   };
   // WhileUntilExpression (extends|proto is) ASTBase
   WhileUntilExpression.prototype.__proto__ = ASTBase.prototype;

     // method parse()
     WhileUntilExpression.prototype.parse = function(){
       this.name = this.req('while', 'until');
       this.lock();
       this.expr = this.req(Expression);
     };
   // export
   module.exports.WhileUntilExpression = WhileUntilExpression;
   // end class WhileUntilExpression


   // export class LoopControlStatement extends ASTBase
   // constructor
   function LoopControlStatement(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties control
   };
   // LoopControlStatement (extends|proto is) ASTBase
   LoopControlStatement.prototype.__proto__ = ASTBase.prototype;

     // method parse()
     LoopControlStatement.prototype.parse = function(){
       this.control = this.req('break', 'continue');
       this.opt('loop');
     };
   // export
   module.exports.LoopControlStatement = LoopControlStatement;
   // end class LoopControlStatement

   // export class DoNothingStatement extends ASTBase
   // constructor
   function DoNothingStatement(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   // DoNothingStatement (extends|proto is) ASTBase
   DoNothingStatement.prototype.__proto__ = ASTBase.prototype;

// `DoNothingStatement: do nothing`

     // method parse()
     DoNothingStatement.prototype.parse = function(){
       this.req('do');
       this.req('nothing');
     };
   // export
   module.exports.DoNothingStatement = DoNothingStatement;
   // end class DoNothingStatement


// ## For Statement

   // export class ForStatement extends ASTBase
   // constructor
   function ForStatement(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
        // variant: ASTBase
   };
   // ForStatement (extends|proto is) ASTBase
   ForStatement.prototype.__proto__ = ASTBase.prototype;

     // method parse()
     ForStatement.prototype.parse = function(){
        // declare valid .createScope

// We start with commonn `for` keyword

       this.req('for');
       this.lock();

// we now require one of the variants

       this.variant = this.req(ForEachProperty, ForEachInArray, ForIndexNumeric);
     };
   // export
   module.exports.ForStatement = ForStatement;
   // end class ForStatement

// ##Variant 1) **for each property**
// ###Loop over **instance property names**

// Grammar:
// `ForEachProperty: for each [own] property name-VariableDecl ["," value-VariableDecl] in object-VariableRef [where Expression]`

// where `name-VariableDecl` is a variable declared on the spot to store each property name,
// and `object-VariableRef` is the object having the properties

// if the optional `own` keyword is used, only instance properties will be looped
// (no prototype chain properties)

   // export class ForEachProperty extends ASTBase
   // constructor
   function ForEachProperty(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
        // indexVar:VariableDecl, mainVar:VariableDecl
        // iterable, where:ForWhereFilter
        // body
   };
   // ForEachProperty (extends|proto is) ASTBase
   ForEachProperty.prototype.__proto__ = ASTBase.prototype;

     // method parse()
     ForEachProperty.prototype.parse = function(){
       this.req('each');

// next we require: 'property', and lock.

       this.req('property');
       this.lock();

// Get main variable name (to store property value)

       this.mainVar = this.req(VariableDecl);

// if comma present, it was propName-index (to store property names)

       // if .opt(",")
       if (this.opt(",")) {
         this.indexVar = this.mainVar;
         this.mainVar = this.req(VariableDecl);
       };

// Then we require `in`, and the iterable-Expression (a object)

       this.req('in');
       this.iterable = this.req(Expression);

// optional where expression (filter)

       this.where = this.opt(ForWhereFilter);

// Now, get the loop body

       this.body = this.req(Body);
     };
   // export
   module.exports.ForEachProperty = ForEachProperty;
   // end class ForEachProperty


// ##Variant 2) **for each in**
// ### loop over **Arrays**

// Grammar:
// `ForEachInArray: for each [index-VariableDecl,]item-VariableDecl in array-VariableRef [where Expression]`

// where:
// * `index-VariableDecl` is a variable declared on the spot to store each item index (from 0 to array.length)
// * `item-VariableDecl` is a variable declared on the spot to store each array item (array[index])
// and `array-VariableRef` is the array to iterate over

   // export class ForEachInArray extends ASTBase
   // constructor
   function ForEachInArray(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
        // indexVar:VariableDecl, mainVar:VariableDecl, iterable:Expression
        // where:ForWhereFilter
        // body
        // inMap: boolean
   };
   // ForEachInArray (extends|proto is) ASTBase
   ForEachInArray.prototype.__proto__ = ASTBase.prototype;

     // method parse()
     ForEachInArray.prototype.parse = function(){

// first, require 'each'

       this.req('each');

// Get index variable and value variable.
// Keep it simple: index and value are always variables declared on the spot

       this.mainVar = this.req(VariableDecl);

// a comma means: previous var was 'index', so register as index and get main var

       // if .opt(',')
       if (this.opt(',')) {
         this.indexVar = this.mainVar;
         this.mainVar = this.req(VariableDecl);
       };

// we now *require* `in` and the iterable (array)

       this.req('in');
       this.lock();
       this.inMap = this.opt('map');
       this.iterable = this.req(Expression);

// optional where expression

       this.where = this.opt(ForWhereFilter);

// and then, loop body

       this.body = this.req(Body);
     };
   // export
   module.exports.ForEachInArray = ForEachInArray;
   // end class ForEachInArray


// ##Variant 3) **for index=...**
// ### to do **numeric loops**

// This `for` variant is just a verbose expressions of the standard C (and js) `for(;;)` loop

// Grammar:
// `ForIndexNumeric: for index-VariableDecl [[","] (while|until|to) end-Expression ["," increment-Statement] ["," where Expression]`

// where `index-VariableDecl` is a numeric variable declared on the spot to store loop index,
// `start-Expression` is the start value for the index (ussually 0)
// `end-Expression` is:
// - the end value (`to`)
// - the condition to keep looping (`while`)
// - the condition to end looping (`until`)
// <br>and `increment-Statement` is the statement used to advance the loop index.
// If omitted the default is `index++`

   // export class ForIndexNumeric extends ASTBase
   // constructor
   function ForIndexNumeric(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
        // indexVar:VariableDecl
        // conditionPrefix, endExpression
        // where: ForWhereFilter
        // increment: SingleLineBody
        // body
   };
   // ForIndexNumeric (extends|proto is) ASTBase
   ForIndexNumeric.prototype.__proto__ = ASTBase.prototype;

// we require: a variableDecl, with optional assignment

     // method parse()
     ForIndexNumeric.prototype.parse = function(){
       this.indexVar = this.req(VariableDecl);
       this.lock();

// next comma is  optional, then
// get 'while|until|to' and condition

       this.opt(',');
       this.conditionPrefix = this.req('while', 'until', 'to', 'down');
       // if .conditionPrefix is 'down', .req 'to'
       if (this.conditionPrefix === 'down') {this.req('to')};
       this.endExpression = this.req(Expression);

// another optional comma, and ForWhereFilter

       this.opt(',');
       this.where = this.opt(ForWhereFilter);

// another optional comma, and increment-Statement

       this.opt(',');
       this.increment = this.opt(SingleLineBody);

// Now, get the loop body

       this.body = this.req(Body);
     };
   // export
   module.exports.ForIndexNumeric = ForIndexNumeric;
   // end class ForIndexNumeric



   // public helper class ForWhereFilter extends ASTBase
   // constructor
   function ForWhereFilter(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
        // filter:Expression
   };
   // ForWhereFilter (extends|proto is) ASTBase
   ForWhereFilter.prototype.__proto__ = ASTBase.prototype;

     // method parse
     ForWhereFilter.prototype.parse = function(){
       var optNewLine = this.opt('NEWLINE');

       // if .opt('where')
       if (this.opt('where')) {
         this.lock();
         this.filter = this.req(Expression);
       }
       
       else {
         // if optNewLine, .lexer.returnToken # return NEWLINE
         if (optNewLine) {this.lexer.returnToken()};
         this.throwParseFailed("expected '[NEWLINE] where'");
       };
     };
   // export
   module.exports.ForWhereFilter = ForWhereFilter;
   // end class ForWhereFilter

// --------------------------------

   // public class DeleteStatement extends ASTBase
   // constructor
   function DeleteStatement(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
        // varRef
   };
   // DeleteStatement (extends|proto is) ASTBase
   DeleteStatement.prototype.__proto__ = ASTBase.prototype;

     // method parse
     DeleteStatement.prototype.parse = function(){
       this.req('delete');
       this.lock();
       this.varRef = this.req(VariableRef);
     };
   // export
   module.exports.DeleteStatement = DeleteStatement;
   // end class DeleteStatement


   // export class AssignmentStatement extends ASTBase
   // constructor
   function AssignmentStatement(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties lvalue:VariableRef, rvalue:Expression
   };
   // AssignmentStatement (extends|proto is) ASTBase
   AssignmentStatement.prototype.__proto__ = ASTBase.prototype;

     // method parse()
     AssignmentStatement.prototype.parse = function(){

        // declare valid .parent.preParsedVarRef

       // if .parent.preParsedVarRef
       if (this.parent.preParsedVarRef) {
         this.lvalue = this.parent.preParsedVarRef;// # get already parsed VariableRef
       }
       
       else {
         this.lvalue = this.req(VariableRef);
       };

// require an assignment symbol: ("="|"+="|"-="|"*="|"/="|"&=")

       this.name = this.req('ASSIGN');
       this.lock();

       // if .lexer.token.value is 'map' #dangling assignment - Literal map
       if (this.lexer.token.value === 'map') {// #dangling assignment - Literal map
         this.req('map');
         this.rvalue = this.req(FreeObjectLiteral);// #assume Object Expression in freeForm mode
         this.rvalue.isMap = true;
         this.rvalue.type = 'Map';
       }

       
       else if (this.lexer.token.type === 'NEWLINE') {// #dangling assignment
         this.rvalue = this.req(FreeObjectLiteral);// #assume Object Expression in freeForm mode
       }
       
       else {
         this.rvalue = this.req(Expression);
       };
     };
   // export
   module.exports.AssignmentStatement = AssignmentStatement;
   // end class AssignmentStatement


// -----------------------

   // export class VariableRef extends ASTBase
   // constructor
   function VariableRef(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
        // preIncDec
        // postIncDec
   };
   // VariableRef (extends|proto is) ASTBase
   VariableRef.prototype.__proto__ = ASTBase.prototype;

      // declare name affinity varRef

     // method parse()
     VariableRef.prototype.parse = function(){
       this.preIncDec = this.opt('--', '++');
       this.executes = false;

// assume 'this.x' on '.x', or if we're in a WithStatement, the 'with' .name

// get var name

       // if .opt('.','SPACE_DOT') # note: DOT has SPACES in front when .property used as parameter
       if (this.opt('.', 'SPACE_DOT')) {// # note: DOT has SPACES in front when .property used as parameter

            // #'.name' -> 'x.name'
           this.lock();

           // if .getParent(WithStatement) into var withStatement
           var withStatement=undefined;
           if ((withStatement=this.getParent(WithStatement))) {
               this.name = withStatement.name;
           }
           
           else {
               this.name = 'this';// #default replacement for '.x'
           };

           var member = undefined;
            // #we must allow 'not' and 'has' as method names, (jQuery uses "not", Map uses "has").
            // #They're classsified as "Opers", but they're valid identifiers in this context
           // if .lexer.token.value in ['not','has']
           if (['not', 'has'].indexOf(this.lexer.token.value)>=0) {
               member = this.lexer.nextToken(); //get not|has as identifier
           }
           
           else {
               member = this.req('IDENTIFIER');
           };

           this.addAccessor(new PropertyAccess(this, member));
       }
       
       else {

           this.name = this.req('IDENTIFIER');
       };

       this.lock();

// Now we check for accessors:
// <br>`.`->**PropertyAccess**
// <br>`[...]`->**IndexAccess**
// <br>`(...)`->**FunctionAccess**

// Note: **.paserAccessors()** will:
// - set .hasSideEffects=true if a function accessor is parsed
// - set .executes=true if the last accessor is a function accessor

       this.parseAccessors();

// Replace lexical `super` by `#{SuperClass name}.prototype`

       // if .name is 'super'
       if (this.name === 'super') {

           var classDecl = this.getParent(ClassDeclaration);
           // if no classDecl
           if (!classDecl) {
             this.throwError("use of 'super' outside a class method");
           };

           // if classDecl.varRefSuper
           if (classDecl.varRefSuper) {
                // #replace name='super' by name = #{SuperClass name}
               this.name = classDecl.varRefSuper.name;
           }
                // #replace name='super' by name = #{SuperClass name}
           
           else {
               this.name = 'Object';// # no superclass means 'Object' is super class
           };
       };

//             #insert '.prototype.' as first accessor (after super class name)
//             .insertAccessorAt 0, 'prototype'
//             #if super class is a composed name (x.y.z), we must insert those accessors also
//             # so 'super.myFunc' turns into 'NameSpace.subName.SuperClass.prototype.myFunc'
//             if classDecl.varRefSuper and classDecl.varRefSuper.accessors
//                 #insert super class accessors
//                 var position = 0
//                 for each ac in classDecl.varRefSuper.accessors
//                   if ac instanceof PropertyAccess
//                     .insertAccessorAt position++, ac.name
//             

       // end if super

// Hack: after 'into var', allow :type for simple (no accessor) var names

       // if .getParent(Statement).intoVars and .opt(":")
       if (this.getParent(Statement).intoVars && this.opt(":")) {
           this.parseType();
       };

// check for post-fix increment/decrement

       this.postIncDec = this.opt('--', '++');

// If this variable ref has ++ or --, IT IS CONSIDERED a "call to execution" in itself,
// a "imperative statement", because it has side effects.
// (`i++` has a "imperative" part, It means: "give me the value of i, and then increment it!")

       // if .preIncDec or .postIncDec
       if (this.preIncDec || this.postIncDec) {
         this.executes = true;
         this.hasSideEffects = true;
       };
     };

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
     // helper method toString()
     VariableRef.prototype.toString = function(){
// This method is only valid to be used in error reporting.
// function accessors will be output as "(...)", and index accessors as [...]

       var result = (this.preIncDec || "") + this.name;
       // if .accessors
       if (this.accessors) {
         // for each ac in .accessors
         for( var ac__inx=0,ac ; ac__inx<this.accessors.length ; ac__inx++){ac=this.accessors[ac__inx];
           result += ac.toString();
         };// end for each in this.accessors
         
       };
       return result + (this.postIncDec || "");
     };
   // export
   module.exports.VariableRef = VariableRef;
   // end class VariableRef

// -----------------------

// ## Accessors

// `Accessors: (PropertyAccess|FunctionAccess|IndexAccess)`

// Accessors:
  // `PropertyAccess: '.' IDENTIFIER`
  // `IndexAccess:    '[' Expression ']'`
  // `FunctionAccess: '(' [Expression,]* ')'`

// Accessors can appear after a VariableRef (most common case)
// but also after a String constant, a Regex Constant,
// a ObjectLiteral and a ArrayLiteral

// Examples:
// - `myObj.item.fn(call)`  <-- 3 accesors, two PropertyAccess and a FunctionAccess
// - `myObj[5](param).part`  <-- 3 accesors, IndexAccess, FunctionAccess and PropertyAccess
// - `[1,2,3,4].indexOf(3)` <-- 2 accesors, PropertyAccess and FunctionAccess


// #####Actions:

// `.` -> PropertyAccess: Search the property in the object and in his pototype chain.
                      // It resolves to the property value

// `[...]` -> IndexAccess: Same as PropertyAccess

// `(...)` -> FunctionAccess: The object is assumed to be a function, and the code executed.
                      // It resolves to the function return value.

// ## Implementation
// We provide a class Accessor to be super class for the three accessors types.

   // export class Accessor extends ASTBase
   // constructor
   function Accessor(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
        // args:array
   };
   // Accessor (extends|proto is) ASTBase
   Accessor.prototype.__proto__ = ASTBase.prototype;

     // method parse
     Accessor.prototype.parse = function(){
       // fail with 'abstract'
       throw new Error('abstract');
     };
     // method toString
     Accessor.prototype.toString = function(){
       // fail with 'abstract'
       throw new Error('abstract');
     };
   // export
   module.exports.Accessor = Accessor;
   // end class Accessor


   // export class PropertyAccess extends Accessor
   // constructor
   function PropertyAccess(){// default constructor: call super.constructor
       Accessor.prototype.constructor.apply(this,arguments)
   };
   // PropertyAccess (extends|proto is) Accessor
   PropertyAccess.prototype.__proto__ = Accessor.prototype;

// `.` -> PropertyAccess: get the property named "n"

// `PropertyAccess: '.' IDENTIFIER`

     // method parse()
     PropertyAccess.prototype.parse = function(){
       this.req('.');
       this.lock();

       // if .lexer.token.value is '{' // ObjectLiteral, short-form for  `.newFromObject({a:1,b:2})`
       if (this.lexer.token.value === '{') { // ObjectLiteral, short-form for  `.newFromObject({a:1,b:2})`
           this.name = 'newFromObject'; // fixed property access "newFromObject" (call-to)
       }

        // #we must allow 'not' and 'has' as method names, (jQuery uses "not", Map uses "has").
       
       else if (['not', 'has'].indexOf(this.lexer.token.value)>=0) {
           this.name = this.lexer.token.value; //get "not"|"has" as identifier
           this.lexer.nextToken(); //advance
       }
       
       else {
           this.name = this.req('IDENTIFIER');
       };
     };

     // method toString()
     PropertyAccess.prototype.toString = function(){
       return '.' + this.name;
     };
   // export
   module.exports.PropertyAccess = PropertyAccess;
   // end class PropertyAccess


   // export class IndexAccess extends Accessor
   // constructor
   function IndexAccess(){// default constructor: call super.constructor
       Accessor.prototype.constructor.apply(this,arguments)
   };
   // IndexAccess (extends|proto is) Accessor
   IndexAccess.prototype.__proto__ = Accessor.prototype;

// `[n]`-> IndexAccess: get the property named "n" / then nth index of the array
                       // It resolves to the property value

// `IndexAccess: '[' Expression ']'`

     // method parse()
     IndexAccess.prototype.parse = function(){

       this.req("[");
       this.lock();
       this.name = this.req(Expression);
       this.req("]");// #closer ]
     };

     // method toString()
     IndexAccess.prototype.toString = function(){
       return '[...]';
     };
   // export
   module.exports.IndexAccess = IndexAccess;
   // end class IndexAccess


   // export class FunctionArgument extends ASTBase
   // constructor
   function FunctionArgument(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
        // expression
   };
   // FunctionArgument (extends|proto is) ASTBase
   FunctionArgument.prototype.__proto__ = ASTBase.prototype;

     // method parse()
     FunctionArgument.prototype.parse = function(){

       this.lock();

       // if .opt('IDENTIFIER') into .name
       if ((this.name=this.opt('IDENTIFIER'))) {
           // if .lexer.token.value is '='
           if (this.lexer.token.value === '=') {
               this.req('=');
           }
           
           else {
               this.lexer.returnToken();
               this.name = undefined;
           };
       };

       this.expression = this.req(Expression);
     };
   // export
   module.exports.FunctionArgument = FunctionArgument;
   // end class FunctionArgument


   // export class FunctionAccess extends Accessor
   // constructor
   function FunctionAccess(){// default constructor: call super.constructor
       Accessor.prototype.constructor.apply(this,arguments)
      // properties
        // args:array
   };
   // FunctionAccess (extends|proto is) Accessor
   FunctionAccess.prototype.__proto__ = Accessor.prototype;

     // method parse()
     FunctionAccess.prototype.parse = function(){
       this.req("(");
       this.lock();
       this.args = this.optSeparatedList(FunctionArgument, ",", ")");// #comma-separated list of FunctionArguments, closed by ")"
     };

     // method toString()
     FunctionAccess.prototype.toString = function(){
       return '(...)';
     };
   // export
   module.exports.FunctionAccess = FunctionAccess;
   // end class FunctionAccess

// ## Helper Functions to parse accessors on any node

   // append to class ASTBase
      // properties
        // accessors: Accessor array
        // executes, hasSideEffects

     // helper method parseAccessors
     ASTBase.prototype.parseAccessors = function(){

// We store the accessors in the property: .accessors
// if the accessors array exists, it will have **at least one item**.

// Loop parsing accessors

         var ac = undefined;

         // do
         do{
             var found = true;
             // switch .lexer.token.value
             switch(this.lexer.token.value){
             
             case '.':

                   ac = new PropertyAccess(this);
                   ac.parse();

                   // if .lexer.token.value is '{' // ObjectLiteral, short-form for  `.newFromObject({a:1,b:2})`
                   if (this.lexer.token.value === '{') { // ObjectLiteral, short-form for  `.newFromObject({a:1,b:2})`
                       this.addAccessor(ac); //add the PropertyAccess to method ".newFromObject"
                       ac = new FunctionAccess(this); //create FunctionAccess
                        // declare ac:FunctionAccess
                       ac.args = [];
                       ac.args.push(this.req(ObjectLiteral)); //.newFromObject() argument is the object literal
                   };
                   break;
                   
             case "(":

                   ac = new FunctionAccess(this);
                   ac.parse();
                   break;
                   
             case "[":

                   ac = new IndexAccess(this);
                   ac.parse();
                   break;
                   
             default:
                   found = false; //no more accessors
             
             };

             // end case

              //add parsed accessor
             // if found, .addAccessor ac
             if (found) {this.addAccessor(ac)};
         } while (found);// end loop

         return;
     };

// old v07
// ##### helper method parseAccessors
//           #(performance) only if the next token in ".[("
//           if .lexer.token.value not in '.[(' then return
// We store the accessors in the property: .accessors
// if the accessors node exists, .list will have **at least one item**.
// Loop parsing accessors
//           do
//               var ac:Accessor = .parseDirect(.lexer.token.value, AccessorsDirect)
//               if no ac, break
//               .addAccessor ac
//           loop #continue parsing accesors
//           return
     // helper method insertAccessorAt(position,item)
     ASTBase.prototype.insertAccessorAt = function(position, item){

            // #create accessors list, if there was none
           // if no .accessors, .accessors = []
           if (!this.accessors) {this.accessors = []};

            // #polymorphic params: string defaults to PropertyAccess
           // if type of item is 'string', item = new PropertyAccess(this, item)
           if (typeof item === 'string') {item = new PropertyAccess(this, item)};

            // #insert
           this.accessors.splice(position, 0, item);
     };


     // helper method addAccessor(item)
     ASTBase.prototype.addAccessor = function(item){

            // #create accessors list, if there was none
           // if no .accessors, .accessors = []
           if (!this.accessors) {this.accessors = []};
           this.insertAccessorAt(this.accessors.length, item);

// if the very last accesor is "(", it means the entire expression is a function call,
// it's a call to "execute code", so it's a imperative statement on it's own.
// if any of the accessors is a function call, this statement is assumed to have side-effects

           this.executes = item instanceof FunctionAccess;
           // if .executes, .hasSideEffects = true
           if (this.executes) {this.hasSideEffects = true};
     };




// ## Operand

// ```
// Operand: (
  // (NumberLiteral|StringLiteral|RegExpLiteral|ArrayLiteral|ObjectLiteral
                    // |ParenExpression|FunctionDeclaration)[Accessors])
  // |VariableRef)
// ```

// Examples:
// <br> 4 + 3 -> `Operand Oper Operand`
// <br> -4    -> `UnaryOper Operand`

// A `Operand` is the data on which the operator operates.
// It's the left and right part of a binary operator.
// It's the data affected (righ) by a UnaryOper.

// To make parsing faster, associate a token type/value,
// with exact AST class to call parse() on.

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
         'case': WhenSection, 
         'yield': YieldExpression
         };


   // public class Operand extends ASTBase
   // constructor
   function Operand(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   // Operand (extends|proto is) ASTBase
   Operand.prototype.__proto__ = ASTBase.prototype;

// fast-parse: if it's a NUMBER: it is NumberLiteral, if it's a STRING: it is StringLiteral (also for REGEX)
// or, upon next token, cherry pick which AST nodes to try,
// '(':ParenExpression,'[':ArrayLiteral,'{':ObjectLiteral,'function': FunctionDeclaration

     // method parse()
     Operand.prototype.parse = function(){
       this.name = this.parseDirect(this.lexer.token.type, OPERAND_DIRECT_TYPE) || this.parseDirect(this.lexer.token.value, OPERAND_DIRECT_TOKEN);

// if it was a Literal, ParenExpression or FunctionDeclaration
// besides base value, this operands can have accessors. For example: `"string".length` , `myObj.fn(10)`

       // if .name
       if (this.name) {
           this.parseAccessors();
       }

// else, (if not Literal, ParenExpression or FunctionDeclaration)
// it must be a variable ref
       
       else {
           this.name = this.req(VariableRef);
       };

       // end if
       
     };
   // export
   module.exports.Operand = Operand;
   // end class Operand

   // end Operand


// ## Oper

// ```
// Oper: ('~'|bitor|bitand|'^'|'|'|'>>'|'<<'
        // |'*'|'/'|'+'|'-'|mod
        // |'&'
        // |instance of|instanceof
        // |'>'|'<'|'>='|'<='
        // |is|'==='|isnt|is not|'!=='
        // |and|but|or
        // |[not] in
        // |(has|hasnt) property
        // |? true-Expression : false-Expression)`
// ```

// An Oper sits between two Operands ("Oper" is a "Binary Operator",
// different from *UnaryOperators* which optionally precede a Operand)

// If an Oper is found after an Operand, a second Operand is expected.

// Operators can include:
// * arithmetic operations "*"|"/"|"+"|"-"
// * boolean operations "and"|"or"
// * string concat oper "&"
// * `in` collection check.  (js: `indexOx()>=0`)
// * instance class checks   (js: instanceof)
// * short-if ternary expressions ? :
// * bit operations (bitor,bitand)
// * `has property` object property check (js: 'propName in object')

   // public class Oper extends ASTBase
   // constructor
   function Oper(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
        // negated
        // left:Operand, right:Operand
        // pushed, precedence
        // intoVar
   };
   // Oper (extends|proto is) ASTBase
   Oper.prototype.__proto__ = ASTBase.prototype;

// Get token, require an OPER.
// Note: 'ternary expression with else'. `x? a else b` should be valid alias for `x?a:b`

     // method parse()
     Oper.prototype.parse = function(){
        // declare valid .getPrecedence
        // declare valid .parent.ternaryCount
       // if .parent.ternaryCount and .opt('else')
       if (this.parent.ternaryCount && this.opt('else')) {
           this.name = ':';// # if there's a open ternaryCount, 'else' is converted to ":"
       }
       
       else {
           this.name = this.req('OPER');
       };

       this.lock();

// A) validate double-word opers

// A.1) validate `instance of`

       // if .name is 'instance'
       if (this.name === 'instance') {
           this.name += ' ' + this.req('of');
       }

// A.2) validate `has|hasnt property`
       
       else if (this.name === 'has') {
           this.negated = this.opt('not') ? true : false;// # set the 'negated' flag
           this.name += ' ' + this.req('property');
       }
       
       else if (this.name === 'hasnt') {
           this.negated = true;// # set the 'negated' flag
           this.name = 'has ' + this.req('property');
       }

// A.3) also, check if we got a `not` token.
// In this case we require the next token to be `in|like`
// `not in|like` is the only valid (not-unary) *Oper* starting with `not`
       
       else if (this.name === 'not') {
           this.negated = true;// # set the 'negated' flag
           this.name = this.req('in', 'like');// # require 'not in'|'not like'
       };

// A.4) handle 'into [var] x', assignment-Expression

       // if .name is 'into' and .opt('var')
       if (this.name === 'into' && this.opt('var')) {
           this.intoVar = true;
           this.getParent(Statement).intoVars = true;// #mark owner statement
       }

// B) Synonyms

// else, check for `isnt`, which we treat as `!==`, `negated is`
       
       else if (this.name === 'isnt') {
         this.negated = true;// # set the 'negated' flag
         this.name = 'is';// # treat as 'Negated is'
       }

// else check for `instanceof`, (old habits die hard)
       
       else if (this.name === 'instanceof') {
         this.name = 'instance of';
       };

       // end if

// C) Variants on 'is/isnt...'

       // if .name is 'is' # note: 'isnt' was converted to 'is {negated:true}' above
       if (this.name === 'is') {// # note: 'isnt' was converted to 'is {negated:true}' above

  // C.1) is not<br>
  // Check for `is not`, which we treat as `isnt` rather than `is ( not`.

           // if .opt('not') # --> is not/has not...
           if (this.opt('not')) {// # --> is not/has not...
               // if .negated, .throwError '"isnt not" is invalid'
               if (this.negated) {this.throwError('"isnt not" is invalid')};
               this.negated = true;// # set the 'negated' flag
           };

           // end if

  // C.2) accept 'is/isnt instance of' and 'is/isnt instanceof'

           // if .opt('instance')
           if (this.opt('instance')) {
               this.name = 'instance ' + this.req('of');
           }
           
           else if (this.opt('instanceof')) {
               this.name = 'instance of';
           };

           // end if
           
       };

// Get operator precedence index

       this.getPrecedence();
     };

     // end Oper parse


// ###getPrecedence:
// Helper method to get Precedence Index (lower number means higher precedende)

     // helper method getPrecedence()
     Oper.prototype.getPrecedence = function(){

       this.precedence = operatorsPrecedence.indexOf(this.name);
       // if .precedence is -1
       if (this.precedence === -1) {
           // debugger
           debugger;
           // fail with "OPER '#{.name}' not found in the operator precedence list"
           throw new Error("OPER '" + this.name + "' not found in the operator precedence list");
       };
     };
   // export
   module.exports.Oper = Oper;
   // end class Oper



// ###Boolean Negation: `not`

// ####Notes for the javascript programmer

// In LiteScript, *the boolean negation* `not`,
// has LOWER PRECEDENCE than the arithmetic and logical operators.

// In LiteScript:  `if not a + 2 is 5` means `if not (a+2 is 5)`

// In javascript: `if ( ! a + 2 === 5 )` means `if ( (!a)+2 === 5 )`

// so remember **not to** mentally translate `not` to js `!`


// UnaryOper
// ---------

// `UnaryOper: ('-'|'+'|new|type of|typeof|not|no|'~')`

// A Unary Oper is an operator acting on a single operand.
// Unary Oper extends Oper, so both are `instance of Oper`

// Examples:

// 1· `not`     *boolean negation*     `if not ( a is 3 or b is 4)`
// 2. `-`       *numeric unary minus*  `-(4+3)`
// 2. `+`       *numeric unary plus*   `+4` (can be ignored)
// 3. `new`     *instantiation*        `x = new classes[2]()`
// 4. `type of` *type name access*     `type of x is 'string'`
// 5. `no`      *'falsey' check*       `if no options then options={}`
// 6. `~`       *bit-unary-negation*   `a = ~xC0 + 5`

   var unaryOperators = ['new', '-', 'no', 'not', 'type', 'typeof', '~', '+'];

   // public class UnaryOper extends Oper
   // constructor
   function UnaryOper(){// default constructor: call super.constructor
       Oper.prototype.constructor.apply(this,arguments)
   };
   // UnaryOper (extends|proto is) Oper
   UnaryOper.prototype.__proto__ = Oper.prototype;

// require a unaryOperator

     // method parse()
     UnaryOper.prototype.parse = function(){
         this.name = this.reqOneOf(unaryOperators);

// Check for `type of` - we allow "type" as var name, but recognize "type of" as UnaryOper

         // if .name is 'type'
         if (this.name === 'type') {
             // if .opt('of')
             if (this.opt('of')) {
               this.name = 'type of';
             }
             
             else {
               this.throwParseFailed('expected "of" after "type"');
             };
         };

// Lock, we have a unary oper

         this.lock();

// Rename - and + to 'unary -' and 'unary +',
// 'typeof' to 'type of'

         // if .name is '-'
         if (this.name === '-') {
             this.name = 'unary -';
         }
         
         else if (this.name === '+') {
             this.name = 'unary +';
         }
         
         else if (this.name === 'typeof') {
             this.name = 'type of';
         };

         // end if

// calculate precedence - Oper.getPrecedence()

         this.getPrecedence();
     };

     // end parse
     
   // export
   module.exports.UnaryOper = UnaryOper;
   // end class UnaryOper


// -----------
// ## Expression

// `Expression: [UnaryOper] Operand [Oper [UnaryOper] Operand]*`

// The expression class parses intially a *flat* array of nodes.
// After the expression is parsed, a *Expression Tree* is created based on operator precedence.

   // public class Expression extends ASTBase
   // constructor
   function Expression(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties operandCount, root, ternaryCount
   };
   // Expression (extends|proto is) ASTBase
   Expression.prototype.__proto__ = ASTBase.prototype;

     // method parse()
     Expression.prototype.parse = function(){

        // declare valid .growExpressionTree
        // declare valid .root.name.type

       var arr = [];
       this.operandCount = 0;
       this.ternaryCount = 0;

       // do
       while(true){

// Get optional unary operator
// (performance) check token first

           // if .lexer.token.value in unaryOperators
           if (unaryOperators.indexOf(this.lexer.token.value)>=0) {
               var unaryOper = this.opt(UnaryOper);
               // if unaryOper
               if (unaryOper) {
                   arr.push(unaryOper);
                   this.lock();
               };
           };

// Get operand

           arr.push(this.req(Operand));
           this.operandCount += 1;
           this.lock();

// (performance) Fast exit for common tokens: `= , ] )` -> end of expression.

           // if .lexer.token.type is 'ASSIGN' or .lexer.token.value in ',)]'
           if (this.lexer.token.type === 'ASSIGN' || ',)]'.indexOf(this.lexer.token.value)>=0) {
               // break
               break;
           };

// optional newline **before** `Oper`
// to allow a expressions to continue on the next line.
// We look ahead, and if the first token in the next line is OPER
// we consume the NEWLINE, allowing multiline expressions.
// The exception is ArrayLiteral, because in free-form mode
// the next item in the array on the next line, can start with a unary operator

           // if .lexer.token.type is 'NEWLINE' and not (.parent instanceof ArrayLiteral)
           if (this.lexer.token.type === 'NEWLINE' && !((this.parent instanceof ArrayLiteral))) {
             this.opt('NEWLINE');// #consume newline
             // if .lexer.token.type isnt 'OPER' # the first token in the next line isnt OPER (+,and,or,...)
             if (this.lexer.token.type !== 'OPER') {// # the first token in the next line isnt OPER (+,and,or,...)
                 this.lexer.returnToken();// # return NEWLINE
                 // break #end Expression
                 break;// #end Expression
             };
           };

// Try to parse next token as an operator

           var oper = this.opt(Oper);
           // if no oper then break # no more operators, end of expression
           if (!oper) {break};

// keep count on ternaryOpers

           // if oper.name is '?'
           if (oper.name === '?') {
               this.ternaryCount++;
           }
           
           else if (oper.name === ':') {
               // if no .ternaryCount //":" without '?'. It can be 'case' expression ending ":"
               if (!this.ternaryCount) { //":" without '?'. It can be 'case' expression ending ":"
                   this.lexer.returnToken();
                   // break //end of expression
                   break; //end of expression
               };
               this.ternaryCount--;
           };

           // end if

// If it was an operator, store, and continue because we expect another operand.
// (operators sits between two operands)

           arr.push(oper);

// allow dangling expression. If the line ends with OPER,
// we consume the NEWLINE and continue parsing the expression on the next line

           this.opt('NEWLINE');// #consume optional newline after Oper
       };// end loop

// Control: complete all ternary operators

       // if .ternaryCount, .throwError 'missing (":"|else) on ternary operator (a? b else c)'
       if (this.ternaryCount) {this.throwError('missing (":"|else) on ternary operator (a? b else c)')};

// Fix 'new' calls. Check parameters for 'new' unary operator, for consistency, add '()' if not present,
// so `a = new MyClass` turns into `a = new MyClass()`

       // for each index,item in arr
       for( var index=0,item ; index<arr.length ; index++){item=arr[index];
          // declare item:UnaryOper
         // if item instanceof UnaryOper and item.name is 'new'
         if (item instanceof UnaryOper && item.name === 'new') {
           var operand = arr[index + 1];
           // if operand.name instanceof VariableRef
           if (operand.name instanceof VariableRef) {
               var varRef = operand.name;
               // if no varRef.executes, varRef.addAccessor new FunctionAccess(this)
               if (!varRef.executes) {varRef.addAccessor(new FunctionAccess(this))};
           };
         };
       };// end for each in arr

// Now we create a tree from .arr[], based on operator precedence

       this.growExpressionTree(arr);
     };


     // end method Expression.parse()


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

// Te process runs until there is only one operator left in the root node
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

     // method growExpressionTree(arr:array)
     Expression.prototype.growExpressionTree = function(arr){
       // do while arr.length > 1
       while(arr.length > 1){

// find the one with highest precedence (lower number) to push down
// (on equal precedende, we use the leftmost)

         var pos = -1;
         var minPrecedenceInx = 100;
         // for each inx,item in arr
         for( var inx=0,item ; inx<arr.length ; inx++){item=arr[inx];

            //debug "item at #{inx} #{item.name}, Oper? #{item instanceof Oper}. precedence:",item.precedence
            // declare valid item.precedence
            // declare valid item.pushed

           // if item instanceof Oper
           if (item instanceof Oper) {
             // if not item.pushed and item.precedence < minPrecedenceInx
             if (!(item.pushed) && item.precedence < minPrecedenceInx) {
               pos = inx;
               minPrecedenceInx = item.precedence;
             };
           };
         };// end for each in arr

         // end for

          // #control
         // if pos<0, .throwError("can't find highest precedence operator")
         if (pos < 0) {this.throwError("can't find highest precedence operator")};

// Un-flatten: Push down the operands a level down

         var oper = arr[pos];

         oper.pushed = true;

         // if oper instanceof UnaryOper
         if (oper instanceof UnaryOper) {

            // #control
           // compile if debug
             // if pos is arr.length
             if (pos === arr.length) {
               this.throwError("can't get RIGHT operand for unary operator '" + oper + "'");
             };
           // end compile

            // # if it's a unary operator, take the only (right) operand, and push-it down the tree
           oper.right = arr.splice(pos + 1, 1)[0];
         }
         
         else {

            // #control
           // compile if debug
             // if pos is arr.length
             if (pos === arr.length) {
               this.throwError("can't get RIGHT operand for binary operator '" + oper + "'");
             };
             // if pos is 0
             if (pos === 0) {
               this.throwError("can't get LEFT operand for binary operator '" + oper + "'");
             };
           // end compile

            // # if it's a binary operator, take the left and right operand, and push-them down the tree
           oper.right = arr.splice(pos + 1, 1)[0];
           oper.left = arr.splice(pos - 1, 1)[0];
         };

         // end if
         
       };// end loop

// Store the root operator

       this.root = arr[0];
     };

     // end method
     
   // export
   module.exports.Expression = Expression;
   // end class Expression

// -----------------------

// ## Literal

// This class groups: NumberLiteral, StringLiteral, RegExpLiteral, ArrayLiteral and ObjectLiteral

   // public class Literal extends ASTBase
   // constructor
   function Literal(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
        // type = '*abstract-Literal*'
         this.type='*abstract-Literal*';
   };
   // Literal (extends|proto is) ASTBase
   Literal.prototype.__proto__ = ASTBase.prototype;

     // method getValue()
     Literal.prototype.getValue = function(){
       return this.name;
     };
   // export
   module.exports.Literal = Literal;
   // end class Literal


// ## NumberLiteral

// `NumberLiteral: NUMBER`

// A numeric token constant. Can be anything the lexer supports, including scientific notation
// , integers, floating point, or hex.

   // public class NumberLiteral extends Literal
   // constructor
   function NumberLiteral(){// default constructor: call super.constructor
       Literal.prototype.constructor.apply(this,arguments)
      // properties
        // type = 'Number'
         this.type='Number';
   };
   // NumberLiteral (extends|proto is) Literal
   NumberLiteral.prototype.__proto__ = Literal.prototype;

     // method parse()
     NumberLiteral.prototype.parse = function(){
       this.name = this.req('NUMBER');
     };
   // export
   module.exports.NumberLiteral = NumberLiteral;
   // end class NumberLiteral


// ## StringLiteral

// `StringLiteral: STRING`

// A string constant token. Can be anything the lexer supports, including single or double-quoted strings.
// The token include the enclosing quotes

   // public class StringLiteral extends Literal
   // constructor
   function StringLiteral(){// default constructor: call super.constructor
       Literal.prototype.constructor.apply(this,arguments)
      // properties
        // type = 'String'
         this.type='String';
   };
   // StringLiteral (extends|proto is) Literal
   StringLiteral.prototype.__proto__ = Literal.prototype;

     // method parse()
     StringLiteral.prototype.parse = function(){
       this.name = this.req('STRING');
     };

     // method getValue()
     StringLiteral.prototype.getValue = function(){
       return this.name.slice(1, -1);// #remove quotes
     };
   // export
   module.exports.StringLiteral = StringLiteral;
   // end class StringLiteral

// ## RegExpLiteral

// `RegExpLiteral: REGEX`

// A regular expression token constant. Can be anything the lexer supports.

   // public class RegExpLiteral extends Literal
   // constructor
   function RegExpLiteral(){// default constructor: call super.constructor
       Literal.prototype.constructor.apply(this,arguments)
      // properties
        // type = 'RegExp'
         this.type='RegExp';
   };
   // RegExpLiteral (extends|proto is) Literal
   RegExpLiteral.prototype.__proto__ = Literal.prototype;

     // method parse()
     RegExpLiteral.prototype.parse = function(){
       this.name = this.req('REGEX');
     };
   // export
   module.exports.RegExpLiteral = RegExpLiteral;
   // end class RegExpLiteral


// ## ArrayLiteral

// `ArrayLiteral: '[' (Expression,)* ']'`

// An array definition, such as `a = [1,2,3]`
// or

// ```
// a = [
   // "January"
   // "February"
   // "March"
  // ]
// ```

   // public class ArrayLiteral extends Literal
   // constructor
   function ArrayLiteral(){// default constructor: call super.constructor
       Literal.prototype.constructor.apply(this,arguments)
      // properties
        // type = 'Array'
        // items
         this.type='Array';
   };
   // ArrayLiteral (extends|proto is) Literal
   ArrayLiteral.prototype.__proto__ = Literal.prototype;

     // method parse()
     ArrayLiteral.prototype.parse = function(){
       this.req('[', 'SPACE_BRACKET');
       this.lock();
       this.items = this.optSeparatedList(Expression, ',', ']');// # closer "]" required
     };
   // export
   module.exports.ArrayLiteral = ArrayLiteral;
   // end class ArrayLiteral


// ## ObjectLiteral

// `ObjectLiteral: '{' NameValuePair* '}'`

// Defines an object with a list of key value pairs. This is a JavaScript-style definition.

// `x = {a:1,b:2,c:{d:1}}`

   // public class ObjectLiteral extends Literal
   // constructor
   function ObjectLiteral(){// default constructor: call super.constructor
       Literal.prototype.constructor.apply(this,arguments)
      // properties
        // items: NameValuePair array
   };
   // ObjectLiteral (extends|proto is) Literal
   ObjectLiteral.prototype.__proto__ = Literal.prototype;

     // method parse()
     ObjectLiteral.prototype.parse = function(){
       this.req('{');
       this.lock();
       this.items = this.optSeparatedList(NameValuePair, ',', '}');// # closer "}" required
     };

// ####helper Functions

      // #recursive duet 1 (see NameValuePair)
     // helper method forEach(callback)
     ObjectLiteral.prototype.forEach = function(callback){
         // for each nameValue in .items
         for( var nameValue__inx=0,nameValue ; nameValue__inx<this.items.length ; nameValue__inx++){nameValue=this.items[nameValue__inx];
           nameValue.forEach(callback);
         };// end for each in this.items
         
     };
   // export
   module.exports.ObjectLiteral = ObjectLiteral;
   // end class ObjectLiteral


// ## NameValuePair

// `NameValuePair: (IDENTIFIER|STRING|NUMBER) ':' Expression`

// A single definition in a `ObjectLiteral`
// a `property-name: value` pair.

   // public class NameValuePair extends ASTBase
   // constructor
   function NameValuePair(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties value: Expression
   };
   // NameValuePair (extends|proto is) ASTBase
   NameValuePair.prototype.__proto__ = ASTBase.prototype;

     // method parse()
     NameValuePair.prototype.parse = function(){

       this.name = this.req('IDENTIFIER', 'STRING', 'NUMBER');

       this.req(':');
       this.lock();

// if it's a "dangling assignment", we assume FreeObjectLiteral

       // if .lexer.token.type is 'NEWLINE'
       if (this.lexer.token.type === 'NEWLINE') {
         this.value = this.req(FreeObjectLiteral);
       }
       
       else {
         // if .lexer.interfaceMode
         if (this.lexer.interfaceMode) {
             this.parseType();
         }
         
         else {
             this.value = this.req(Expression);
         };
       };
     };

// recursive duet 2 (see ObjectLiteral)

     // helper method forEach(callback)
     NameValuePair.prototype.forEach = function(callback){

         callback(this);

          // #if ObjectLiteral, recurse
          // declare valid .value.root.name
         // if .value.root.name instanceof ObjectLiteral
         if (this.value.root.name instanceof ObjectLiteral) {
            // declare valid .value.root.name.forEach
           this.value.root.name.forEach(callback);// # recurse
         };
     };

     // end helper recursive functions
     
   // export
   module.exports.NameValuePair = NameValuePair;
   // end class NameValuePair


// ## FreeObjectLiteral

// Defines an object with a list of key value pairs.
// Each pair can be in it's own line. A indent denotes a new level deep.
// FreeObjectLiterals are triggered by a "dangling assignment"

// Examples:
//     var x =            // <- dangling assignment
//           a: 1
//           b:           // <- dangling assignment
//             b1:"some"
//             b2:"latte"
//     var x =
//      a:1
//      b:2
//      c:
//       d:1
//      months: ["J","F",
//       "M","A","M","J",
//       "J","A","S","O",
//       "N","D" ]
//     var y =
//      c:{d:1}
//      trimester:[
//        "January"
//        "February"
//        "March"
//      ]
//      getValue: function(i)
//        return y.trimester[i]

   // public class FreeObjectLiteral extends ObjectLiteral
   // constructor
   function FreeObjectLiteral(){// default constructor: call super.constructor
       ObjectLiteral.prototype.constructor.apply(this,arguments)
   };
   // FreeObjectLiteral (extends|proto is) ObjectLiteral
   FreeObjectLiteral.prototype.__proto__ = ObjectLiteral.prototype;

// get items: optional comma separated, closes on de-indent, at least one required

     // method parse()
     FreeObjectLiteral.prototype.parse = function(){

       this.lock();
       this.items = this.reqSeparatedList(NameValuePair, ',');

       // if .lexer.options.literalMap
       if (this.lexer.options.literalMap) {
           this.isMap = true;
           this.type = 'Map';
       };
     };
   // export
   module.exports.FreeObjectLiteral = FreeObjectLiteral;
   // end class FreeObjectLiteral


// ## ParenExpression

// `ParenExpression: '(' Expression ')'`

// An expression enclosed by parentheses, like `(a + b)`.

   // public class ParenExpression extends ASTBase
   // constructor
   function ParenExpression(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties expr:Expression
   };
   // ParenExpression (extends|proto is) ASTBase
   ParenExpression.prototype.__proto__ = ASTBase.prototype;

     // method parse()
     ParenExpression.prototype.parse = function(){
       this.req('(');
       this.lock();
       this.expr = this.req(Expression);
       this.opt('NEWLINE');
       this.req(')');
     };
   // export
   module.exports.ParenExpression = ParenExpression;
   // end class ParenExpression


// ## FunctionDeclaration

// `FunctionDeclaration: 'function [IDENTIFIER] ["(" [VariableDecl,]* ")"] [returns type-VariableRef] Body`

// Functions: parametrized pieces of callable code.

   // public class FunctionDeclaration extends ASTBase
   // constructor
   function FunctionDeclaration(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
        // specifier
        // export,default,shim,generator,nice //adjectives
        // paramsDeclarations: VariableDecl array
        // definePropItems: DefinePropertyItem array
        // body
        // EndFnLineNum
   };
   // FunctionDeclaration (extends|proto is) ASTBase
   FunctionDeclaration.prototype.__proto__ = ASTBase.prototype;

     // method parse()
     FunctionDeclaration.prototype.parse = function(){

       this.specifier = this.req('function', 'method', '->');
       this.lock();

        // declare valid .parent.parent.parent
       // if .specifier isnt 'method' and .parent.parent.parent instance of ClassDeclaration
       if (this.specifier !== 'method' && this.parent.parent.parent instanceof ClassDeclaration) {
           this.throwError("unexpected 'function' in 'class/append' body. You should use 'method'");
       };

// '->' are anonymous lambda functions

       // if .specifier isnt '->'
       if (this.specifier !== '->') {
           this.name = this.opt('IDENTIFIER');
       };

// get parameter members, and function body

       this.parseParametersAndBody();
     };

      // #end parse

     // helper method parseParametersAndBody()
     FunctionDeclaration.prototype.parseParametersAndBody = function(){

// This method is shared by functions, methods and constructors.
// `()` after `function` are optional. It parses: `['(' [VariableDecl,] ')'] [returns VariableRef] '['DefinePropertyItem']'`

       this.EndFnLineNum = this.sourceLineNum + 1; //default value - store to generate accurate SourceMaps (js)

       // if .opt("(")
       if (this.opt("(")) {
           this.paramsDeclarations = this.optSeparatedList(VariableDecl, ',', ')');
       }
       
       else if (this.specifier === '->') {// #we arrived here by: FnCall-param-Expression-Operand-'->'
            // # after '->' we accept function params w/o parentheses.
            // # get parameter names (name:type only), up to [NEWLINE] or '='
           this.paramsDeclarations = [];
           // until .lexer.token.type is 'NEWLINE' or .lexer.token.value is '='
           while(!(this.lexer.token.type === 'NEWLINE' || this.lexer.token.value === '=')){
               // if .paramsDeclarations.length, .req ','
               if (this.paramsDeclarations.length) {this.req(',')};
               var varDecl = new VariableDecl(this, this.req('IDENTIFIER'));
               // if .opt(":"), varDecl.parseType
               if (this.opt(":")) {varDecl.parseType()};
               this.paramsDeclarations.push(varDecl);
           };// end loop
           
       };

       // if .opt('=') #one line function. Body is a Expression
       if (this.opt('=')) {// #one line function. Body is a Expression

           this.body = this.req(Expression);
       }
       
       else {

           // if .opt('returns'), .parseType  #function return type
           if (this.opt('returns')) {this.parseType()};

           // if .opt('[','SPACE_BRACKET') # property attributes (non-enumerable, writable, etc - Object.defineProperty)
           if (this.opt('[', 'SPACE_BRACKET')) {// # property attributes (non-enumerable, writable, etc - Object.defineProperty)
               this.definePropItems = this.optSeparatedList(DefinePropertyItem, ',', ']');
           };

            // #indented function body
           this.body = this.req(Body);

            // # get function exit point source line number (for SourceMap)
           this.EndFnLineNum = this.lexer.maxSourceLineNum;
       };

       // end if
       
     };
   // export
   module.exports.FunctionDeclaration = FunctionDeclaration;
   // end class FunctionDeclaration


   // public class DefinePropertyItem extends ASTBase
   // constructor
   function DefinePropertyItem(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
        // negated:boolean
   };
   // DefinePropertyItem (extends|proto is) ASTBase
   DefinePropertyItem.prototype.__proto__ = ASTBase.prototype;
      // declare name affinity definePropItem

     // method parse()
     DefinePropertyItem.prototype.parse = function(){
       this.lock();
       this.negated = this.opt('not');
       this.name = this.req('enumerable', 'configurable', 'writable');
     };
   // export
   module.exports.DefinePropertyItem = DefinePropertyItem;
   // end class DefinePropertyItem



// ## MethodDeclaration

// `MethodDeclaration: 'method [name] ["(" [VariableDecl,] ")"] [returns type-VariableRef] ["["DefinePropertyItem,"]"] Body`

// A `method` is a function defined in the prototype of a class.
// A `method` has an implicit var `this` pointing to the specific instance the method is called on.

// MethodDeclaration derives from FunctionDeclaration, so both are instance of FunctionDeclaration

// Examples:
// <br>`method concat(a:string, b:string) return string`
// <br>`method remove(element) [not enumerable, not writable, configurable]`

   // public class MethodDeclaration extends FunctionDeclaration
   // constructor
   function MethodDeclaration(){// default constructor: call super.constructor
       FunctionDeclaration.prototype.constructor.apply(this,arguments)
   };
   // MethodDeclaration (extends|proto is) FunctionDeclaration
   MethodDeclaration.prototype.__proto__ = FunctionDeclaration.prototype;

     // method parse()
     MethodDeclaration.prototype.parse = function(){

       this.specifier = this.req('method');
       this.lock();

// require method name. Note: jQuery uses 'not' and 'has' as method names, so here we
// take any token, and check if it's valid identifier

        //.name = .req('IDENTIFIER')
       this.name = this.lexer.token.value;
       // if not .name like /^[a-zA-Z$_]+[0-9a-zA-Z$_]*$/, .throwError 'invalid method name: "#{.name}"'
       if (!(/^[a-zA-Z$_]+[0-9a-zA-Z$_]*$/.test(this.name))) {this.throwError('invalid method name: "' + this.name + '"')};
       this.lexer.nextToken();

// now parse parameters and body (as with any function)

       this.parseParametersAndBody();
     };
   // export
   module.exports.MethodDeclaration = MethodDeclaration;
   // end class MethodDeclaration


// ## ClassDeclaration

// `ClassDeclaration: class IDENTIFIER [[","] (extends|inherits from)] Body`

// Defines a new class with an optional parent class. properties and methods go inside the block.

   // public class ClassDeclaration extends ASTBase
   // constructor
   function ClassDeclaration(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
        // export:boolean,default:boolean
        // varRefSuper:VariableRef
        // body
   };
   // ClassDeclaration (extends|proto is) ASTBase
   ClassDeclaration.prototype.__proto__ = ASTBase.prototype;

      // declare name affinity classDecl

     // method parse()
     ClassDeclaration.prototype.parse = function(){
       this.req('class');
       this.lock();
       this.name = this.req('IDENTIFIER');

// Control: class names should be Capitalized, except: jQuery

       // if not .lexer.interfaceMode and not String.isCapitalized(.name)
       if (!(this.lexer.interfaceMode) && !(String.isCapitalized(this.name))) {
           this.lexer.sayErr("class names should be Capitalized: class " + this.name);
       };

// Now parse optional `,(extend|proto is|inherits from)` setting the super class

       this.opt(',');
       // if .opt('extends','inherits','proto')
       if (this.opt('extends', 'inherits', 'proto')) {
         this.opt('from', 'is');
         this.varRefSuper = this.req(VariableRef);
       };

// Now get class body.

       this.body = this.opt(Body);
     };
   // export
   module.exports.ClassDeclaration = ClassDeclaration;
   // end class ClassDeclaration



// ## ConstructorDeclaration

// `ConstructorDeclaration : 'constructor [new className-IDENTIFIER] ["(" [VariableDecl,]* ")"] [returns type-VariableRef] Body`

// A `constructor` is the main function of the class. In js is the function-class body  (js: `function Class(...){... `)
// The `constructor` method is called upon creation of the object, by the `new` operator.
// The return value is the value returned by `new` operator, that is: the new instance of the class.

// ConstructorDeclaration derives from MethodDeclaration, so it is also a instance of FunctionDeclaration

   // public class ConstructorDeclaration extends MethodDeclaration
   // constructor
   function ConstructorDeclaration(){// default constructor: call super.constructor
       MethodDeclaration.prototype.constructor.apply(this,arguments)
   };
   // ConstructorDeclaration (extends|proto is) MethodDeclaration
   ConstructorDeclaration.prototype.__proto__ = MethodDeclaration.prototype;

     // method parse()
     ConstructorDeclaration.prototype.parse = function(){

       this.specifier = this.req('constructor');
       this.lock();

       // if .opt('new') # optional: constructor new Person(name:string)
       if (this.opt('new')) {// # optional: constructor new Person(name:string)
          // # to ease reading, and to find the constructor when you search for "new Person"
         var className = this.req('IDENTIFIER');
         var classDeclaration = this.getParent(ClassDeclaration);
         // if classDeclaration and classDeclaration.name isnt className
         if (classDeclaration && classDeclaration.name !== className) {
             this.sayErr("Class Name mismatch " + className + "/" + classDeclaration.name);
         };
       };

// now get parameters and body (as with any function)

       this.parseParametersAndBody();
     };
   // export
   module.exports.ConstructorDeclaration = ConstructorDeclaration;
   // end class ConstructorDeclaration

      // #end parse

// ------------------------------

// ## AppendToDeclaration

// `AppendToDeclaration: append to (class|object) VariableRef Body`

// Adds methods and properties to an existent object, e.g., Class.prototype

   // public class AppendToDeclaration extends ClassDeclaration
   // constructor
   function AppendToDeclaration(){// default constructor: call super.constructor
       ClassDeclaration.prototype.constructor.apply(this,arguments)
      // properties
        // toNamespace
        // varRef:VariableRef
        // body
   };
   // AppendToDeclaration (extends|proto is) ClassDeclaration
   AppendToDeclaration.prototype.__proto__ = ClassDeclaration.prototype;

     // method parse()
     AppendToDeclaration.prototype.parse = function(){

       this.req('append', 'Append');
       this.req('to');
       this.lock();

       var appendToWhat = this.req('class', 'Class', 'namespace', 'Namespace');
       this.toNamespace = appendToWhat.endsWith('space');

       this.varRef = this.req(VariableRef);

// Now get body.

       this.body = this.req(Body);
     };
   // export
   module.exports.AppendToDeclaration = AppendToDeclaration;
   // end class AppendToDeclaration


// ## NamespaceDeclaration

// `NamespaceDeclaration: namespace IDENTIFIER Body`

// creates a object with methods, properties and classes

   // public class NamespaceDeclaration extends AppendToDeclaration
   // constructor
   function NamespaceDeclaration(){// default constructor: call super.constructor
       AppendToDeclaration.prototype.constructor.apply(this,arguments)
   };
   // NamespaceDeclaration (extends|proto is) AppendToDeclaration
   NamespaceDeclaration.prototype.__proto__ = AppendToDeclaration.prototype;

     // method parse()
     NamespaceDeclaration.prototype.parse = function(){

       this.req('namespace', 'Namespace');

       this.lock();
       this.toNamespace = true;
       this.varRef = this.req(VariableRef);

       this.name = this.varRef.toString();

// Now get body.

       this.body = this.req(Body);
     };
   // export
   module.exports.NamespaceDeclaration = NamespaceDeclaration;
   // end class NamespaceDeclaration



// ## DebuggerStatement

// `DebuggerStatement: debugger`

// When a debugger is attached, break at this point.

   // public class DebuggerStatement extends ASTBase
   // constructor
   function DebuggerStatement(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   // DebuggerStatement (extends|proto is) ASTBase
   DebuggerStatement.prototype.__proto__ = ASTBase.prototype;
     // method parse()
     DebuggerStatement.prototype.parse = function(){
       this.name = this.req("debugger");
     };
   // export
   module.exports.DebuggerStatement = DebuggerStatement;
   // end class DebuggerStatement



// CompilerStatement
// -----------------

// `compiler` is a generic entry point to alter LiteScript compiler from source code.
// It allows conditional complilation, setting compiler options, and execute macros
// to generate code on the fly.
// Future: allow the programmer to hook transformations on the compiler process itself.
// <br>`CompilerStatement: (compiler|compile) (set|if|debugger|option) Body`
// <br>`set-CompilerStatement: compiler set (VariableDecl,)`
// <br>`conditional-CompilerStatement: 'compile if IDENTIFIER Body`

   // public class CompilerStatement extends ASTBase
   // constructor
   function CompilerStatement(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
        // kind, conditional:string
        // list, body
        // importStatement
        // endLineInx
   };
   // CompilerStatement (extends|proto is) ASTBase
   CompilerStatement.prototype.__proto__ = ASTBase.prototype;

     // method parse()
     CompilerStatement.prototype.parse = function(){
       this.req('compiler', 'compile');
       this.lock();
       this.kind = this.lexer.token.value;

// ### compiler ImportStatement

       // if .kind is 'import'
       if (this.kind === 'import') {
         this.importStatement = this.req(ImportStatement);
         return;
       };

// ### others

       this.kind = this.req('set', 'if', 'debugger', 'options');

// ### compiler set
// get list of declared names, add to root node 'Compiler Vars'

       // if .kind is 'set'
       if (this.kind === 'set') {
           this.list = this.reqSeparatedList(VariableDecl, ',');
       }

// ### compiler if conditional compilation
       
       else if (this.kind === 'if') {

         this.conditional = this.req('IDENTIFIER');

         // if .compilerVar(.conditional)
         if (this.compilerVar(this.conditional)) {
             this.body = this.req(Body);
         }
         
         else {
            //skip block
           // do
           do{
             this.lexer.nextToken();
           } while (!(this.lexer.indent <= this.indent));// end loop
           
         };
       }


// ### other compile options
       
       else if (this.kind === 'debugger') {// #debug-pause the compiler itself, to debug compiling process
         // debugger
         debugger;
       }
       
       else {
         this.sayErr('invalid compiler command');
       };
     };
   // export
   module.exports.CompilerStatement = CompilerStatement;
   // end class CompilerStatement


// ## Import Statement

// `ImportStatement: import (ImportStatementItem,)`

// Example: `global import fs, path` ->  js:`var fs=require('fs'),path=require('path')`

// Example: `import Args, wait from 'wait.for'` ->  js:`var http=require('./Args'),wait=require('./wait.for')`

   // public class ImportStatement extends ASTBase
   // constructor
   function ImportStatement(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
        // global:boolean
        // list: ImportStatementItem array
   };
   // ImportStatement (extends|proto is) ASTBase
   ImportStatement.prototype.__proto__ = ASTBase.prototype;

     // method parse()
     ImportStatement.prototype.parse = function(){
       this.req('import');
       this.lock();

       // if .lexer.options.browser, .throwError "'import' statement invalid in browser-mode. Do you mean 'global declare'?"
       if (this.lexer.options.browser) {this.throwError("'import' statement invalid in browser-mode. Do you mean 'global declare'?")};

       this.list = this.reqSeparatedList(ImportStatementItem, ",");

// keep track of `import/require` calls

       var parentModule = this.getParent(Module);
       // for each item in .list
       for( var item__inx=0,item ; item__inx<this.list.length ; item__inx++){item=this.list[item__inx];
           parentModule.requireCallNodes.push(item);
       };// end for each in this.list
       
     };
   // export
   module.exports.ImportStatement = ImportStatement;
   // end class ImportStatement


   // export class ImportStatementItem extends ASTBase
   // constructor
   function ImportStatementItem(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
        // importParameter:StringLiteral
   };
   // ImportStatementItem (extends|proto is) ASTBase
   ImportStatementItem.prototype.__proto__ = ASTBase.prototype;

     // method parse()
     ImportStatementItem.prototype.parse = function(){
       this.name = this.req('IDENTIFIER');
       // if .opt('from')
       if (this.opt('from')) {
           this.lock();
           this.importParameter = this.req(StringLiteral);
       };
     };
   // export
   module.exports.ImportStatementItem = ImportStatementItem;
   // end class ImportStatementItem


// ## DeclareStatement

// Declare allows you to define a variable and/or its type
// *for the type-checker (at compile-time)*

// #####Declare variable:type
// `DeclareStatement: declare VariableRef:type-VariableRef`

// Declare a variable type on the fly, from declaration point onward

// Example: `declare name:string, parent:NameDeclaration` #on the fly, from declaration point onward


// #####Global Declare
// `global declare (ImportStatementItem+)`
// Browser-mode: Import a *.interface.md* file to declare a global pre-existent complex objects
// Example: `global declare jQuery,Document,Window`

// #####Declare [global] var
// `DeclareStatement: declare [global] var (VariableDecl,)+`

// Allows you to declare a preexistent [global] variable
// Example: `declare global var window:object`

// #####Declare global type for VariableRef

// Allows you to set the type on a existing variable
// globally for the entire compilation.

// Example:
// `declare global type for LocalData.user: Models.userData` #set type globally for the entire compilation


// #####Declare name affinity
// `DeclareStatement: name affinity (IDENTIFIER,)+`

// To be used inside a class declaration, declare var names
// that will default to Class as type

// Example
// ```
  // Class NameDeclaration
    // properties
      // name: string, sourceLine, column
      // declare name affinity nameDecl
// ```

// Given the above declaration, any `var` named (or ending in) **"nameDecl"** or **"nameDeclaration"**
// will assume `:NameDeclaration` as type. (Classname is automatically included in 'name affinity')

// Example:
// `var nameDecl, parentNameDeclaration, childNameDecl, nameDeclaration`

// all three vars will assume `:NameDeclaration` as type.

// #####Declare valid
// `DeclareStatement: declare valid IDENTIFIER("."(IDENTIFIER|"()"|"[]"))* [:type-VariableRef]`

// To declare, on the fly, known-valid property chains for local variables.
// Example:
  // `declare valid data.user.name`
  // `declare valid node.parent.parent.text:string`
  // `declare valid node.parent.items[].name:string`

// #####Declare on
// `DeclareStatement: declare on IDENTIFIER (VariableDecl,)+`

// To declare valid members on scope vars.
// Allows you to declare the valid properties for a local variable or parameter
// Example:
//     function startServer(options)
//         declare on options
//             name:string, useHeaders:boolean, port:number


   // export class DeclareStatement extends ASTBase
   // constructor
   function DeclareStatement(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
        // global //adjective
        // varRef: VariableRef
        // type: VariableRef
        // names: VariableDecl array
        // list: ImportStatementItem array
        // specifier
        // globVar: boolean
   };
   // DeclareStatement (extends|proto is) ASTBase
   DeclareStatement.prototype.__proto__ = ASTBase.prototype;

     // method parse()
     DeclareStatement.prototype.parse = function(){

       this.req('declare');
       this.lock();

// if it was 'global declare', treat as import statement

       // if .global
       if (this.global) {
             this.list = this.reqSeparatedList(ImportStatementItem, ",");
              //keep track of `import/require` calls
             var parentModule = this.getParent(Module);
             // for each item in .list
             for( var item__inx=0,item ; item__inx<this.list.length ; item__inx++){item=this.list[item__inx];
                 parentModule.requireCallNodes.push(item);
             };// end for each in this.list
             return;
       };
       // end if

// get specifier 'on|valid|name|all'

       this.specifier = this.opt('on', 'valid', 'name', 'global', 'var');
       // if .lexer.token.value is ':' #it was used as a var name
       if (this.lexer.token.value === ':') {// #it was used as a var name
           this.specifier = 'on-the-fly';
           this.lexer.returnToken();
       }
       
       else if (!this.specifier) {
           this.specifier = 'on-the-fly';// #no specifier => assume on-the-fly type assignment
       };
       // end if

        // #handle '...global var..' & '...global type for..'
       // if .specifier is 'global' #declare global (var|type for)...
       if (this.specifier === 'global') {// #declare global (var|type for)...
           this.specifier = this.req('var', 'type');// #require 'var|type'
           // if .specifier is 'var'
           if (this.specifier === 'var') {
                 this.globVar = true;
           }
           
           else {
                 this.req('for');
           };
       };
       // end if

       // switch .specifier
       switch(this.specifier){
       
       case 'on-the-fly': case 'type':
            // #declare VarRef:Type
           this.varRef = this.req(VariableRef);
           this.req(':'); //type expected
           this.parseType();
           break;
           
       case 'valid':
           this.varRef = this.req(VariableRef);
           // if no .varRef.accessors, .sayErr "declare valid: expected accesor chain. Example: 'declare valid name.member.member'"
           if (!this.varRef.accessors) {this.sayErr("declare valid: expected accesor chain. Example: 'declare valid name.member.member'")};
           // if .opt(':'), .parseType //optional type
           if (this.opt(':')) {this.parseType()};
           break;
           
       case 'name':
           this.specifier = this.req('affinity');
           this.names = this.reqSeparatedList(VariableDecl, ',');
           // for each varDecl in .names
           for( var varDecl__inx=0,varDecl ; varDecl__inx<this.names.length ; varDecl__inx++){varDecl=this.names[varDecl__inx];
              // if varDecl.type or varDecl.assignedValue
              if (varDecl.type || varDecl.assignedValue) {
                 this.sayErr("declare name affinity: expected 'name,name,...'");
              };
           };// end for each in this.names
           
           break;
           
       case 'var':
           this.names = this.reqSeparatedList(VariableDecl, ',');
           // for each varDecl in .names
           for( var varDecl__inx=0,varDecl ; varDecl__inx<this.names.length ; varDecl__inx++){varDecl=this.names[varDecl__inx];
              // if varDecl.assignedValue
              if (varDecl.assignedValue) {
                 this.sayErr("declare var. Cannot assign value in .interface file.");
              };
           };// end for each in this.names
           
           break;
           
       case 'on':
           this.name = this.req('IDENTIFIER');
           this.names = this.reqSeparatedList(VariableDecl, ',');
           break;
           
       
       };

        //end switch

       return;
     };

     // end method parse
     
   // export
   module.exports.DeclareStatement = DeclareStatement;
   // end class DeclareStatement


// ## DefaultAssignment

// `DefaultAssignment: default VariableRef [NEWLINE] (VariableDecl,)*`

// It is a common pattern in javascript to use object parameters (named "options")
// to pass misc options to functions.

// Litescript provide a 'default' construct as syntax sugar for this common pattern

// The 'default' construct is formed as class properties declaration-assignment,
// but only the 'undefined' properties of the provided object will be assigned
// default values.


// Example:
//     function theApi(foo,options,bar)
//       default options
//         logger = console.log
//         encoding:string = 'utf-8'
//         throwErrors = true
//         debugEnabled = false
//         debugLevel = 2
//       ...function body...
//       secondaryFunction(options)
//     end function
//     theApi('abc', {throwErrors:false, debugEnabled:true}, 10)
// on the function call, options properties will be checked against
// valid property names declared in the "default" statement.
//     function secondaryFunction(options: Default_theApi_options)
//         options.debugLevel++
//         ...function body...
//     end secondaryFunction
// on the secondary function call, options are passed by reference, as a instance of Default_theApi_options
// is equivalent to js's:
//     function theApi(object,options,callback) {
//         //default options
//         options = new Default_theApi_options(options);
//         ...function body...
//         secondaryFunction(options);
//     }
//     theApi('abc', {throwErrors:false, debugEnabled:true}, 10);
//     function secondaryFunction(options){
//         options.debugLevel++;
//         ...function body...
//     }//end secondaryFunction
//     ...
//     function Default_theApi_options(optionsProvided){
//         this.log = console.log;
//         this.encoding = 'utf-8';
//         this.throwErrors = true;
//         this.debugEnabled = false;
//         this.debugLevel = 2;
//         for (name in optionsProvided) {
//             if (!(name in this)) throw new Error("invalid option: "+name);
//             this[name]=optionsProvided[name];
//         }
//     }
// compile to Lite-C:
// LiteC have a support core class OptionValues and support functions:
    // any _makeOpt(argc,symbol,value,...) // returns (any){OptionValues,{symbol,value,....}}
    // any _takeOpt(anyOptionValues,classToCreate) // returns result=new(anyClass) & for each in anyOptionValues, result[symbol]=value
    // #define TRYGETARG(x)

// also, when compile to Lite-C, the use of { } (LiteralObject) in FunctionArguments, gets compiled
// as a call to _makeOpt(...)
//     // function any theApi(object,options,callback)
//     any theApi(any this, int argc, any* arguments) {
//         //init default options (take data from arguments[1] if present)
//         var options = _takeOpt(argc>1?arguments[1]:undefined, Default_theApi_options);
//         ...function body...
//     }
//     //theApi('abc',{throwErrors:false, debugEnabled:true},10);
//     theApi(undefined,3,(any_arr){any_str("abc"), _makeOpt(2,throwErrors_,false,debugEnabled_,true),any_number(10)});
//     ...
//     void Default_theApi_options__init(any this, int argc, any* arguments){
//         assert_args(0,1,OptionValues);
//         PROP(log_,this) = console_log;
//         PROP(encoding_,this) = any_str("utf-8");
//         PROP(throwErrors_,this) = true;
//         PROP(debugEnabled_,this) = false;
//         PROP(debugLevel_,this) = any_number(2);
//         if (argc){
//             int len=arguments[0].value.options->length;
//             OptionValuesItem_ptr provided=arguments[0].value.options->first;
//             for (int inx=0;inx<len;inx++,provided++) {
//                   PROP(provided->symbol,this)=provided->value;
//             }
//         }
//     }
//     // function any theApi(object,options,callback)
//     any theApi(any this, int argc, ...) {
//         //init default options (take data from arguments[1] if present)
//         var options = _takeOpt(argc>1?arguments[1]:undefined, Default_theApi_options);
//         ...function body...
//     }
//     //theApi('abc',{throwErrors:false, debugEnabled:true},10);
//     theApi(undefined,3,any_str("abc"), _makeOpt(2, throwErrors_,false, debugEnabled_,true),any_number(10));
//     ...
//     void Default_theApi_options__init(any this, int argc, any* arguments){
//         assert_args(0,1,OptionValues);
//         PROP(log_,this) = console_log;
//         PROP(encoding_,this) = any_str("utf-8");
//         PROP(throwErrors_,this) = true;
//         PROP(debugEnabled_,this) = false;
//         PROP(debugLevel_,this) = any_number(2);
//         if (argc){
//             int len=arguments[0].length;
//             OptionValuesItem_ptr provided=(OptionValuesItem_ptr)arguments[0].value.ptr;
//             for (int inx=0;inx<len;inx++,provided++) {
//                   PROP(provided->symbol,this)=provided->value;
//             }
//         }
//     }

// "Default" auto-declares a "class" named Default_[function name]_[argument name]
// with a constructor accepting symbol:value pairs
// In the previous example the auto-created class will be: "Default_theApi_options"
// You can re-use the class as type for other derived function's arguments.

// You can also explicitly declare the "default" elswhere in the file, and convert the
// "default option" statement in properties declaration
// and/or constructor assignments.

// Example, with explicit defaults-class declaration
//     function theApi(object, options:ApiOptions, callback)
//       ...function body...
//     end function
//     theApi MyObject, new ApiOptions({throwErrors:false, debugEnabled:true}), callback
//     class ApiOptions
//       constructor (options)
//         default options
//           log = console.log
//           encoding = 'utf-8'
//           throwErrors = true
//           debugEnabled = false
//           debugLevel = 2
// is equivalent to js's:
//     function theApi(object,options,callback) {
//         //default options
//         options = new ApiOptions(options);
//         ...function body...
//     }
//     theApi(MyObject,{throwErrors:false, options,callback) {
//     function ApiOptions(provided){
//         this.log = console.log;
//         this.encoding = 'utf-8';
//         this.throwErrors = true;
//         this.debugEnabled = false;
//         this.debugLevel = 2;
//         for (name in provided)
//               this[name]=provided[name];
//     }


   // public class DefaultAssignment extends ASTBase
   // constructor
   function DefaultAssignment(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
        // assignment: AssignmentStatement
   };
   // DefaultAssignment (extends|proto is) ASTBase
   DefaultAssignment.prototype.__proto__ = ASTBase.prototype;

     // method parse()
     DefaultAssignment.prototype.parse = function(){

       this.req('default');
       this.lock();

       this.assignment = this.req(AssignmentStatement);
     };
   // export
   module.exports.DefaultAssignment = DefaultAssignment;
   // end class DefaultAssignment



// ## End Statement

// `EndStatement: end (IDENTIFIER)* NEWLINE`

// `end` is an **optional** end-block marker to ease code reading.
// It marks the end of code blocks, and can include extra tokens referencing the construction
// closed. (in the future) This references will be cross-checked, to help redude subtle bugs
// by checking that the block ending here is the intended one.

// If it's not used, the indentation determines where blocks end ()

// Example: `end if` , `end loop`, `end for each item`

// Usage Examples:
//     if a is 3 and b is 5
//       print "a is 3"
//       print "b is 5"
//     end if
//     loop while a < 10
//       a++
//       b++
//     end loop

   // public class EndStatement extends ASTBase
   // constructor
   function EndStatement(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
        // references:string array
   };
   // EndStatement (extends|proto is) ASTBase
   EndStatement.prototype.__proto__ = ASTBase.prototype;

     // method parse()
     EndStatement.prototype.parse = function(){

       this.req('end');

       this.lock();
       this.references = [];

       var block = undefined;
       // if .parent.parent is instanceof Body or .parent.parent is instanceof Module
       if (this.parent.parent instanceof Body || this.parent.parent instanceof Module) {
           block = this.parent.parent;
       };
       // if no block
       if (!block) {
           this.lexer.throwErr("'end' statement found outside a block");
       };
       var expectedIndent = block.indent || 4;
       // if .indent isnt expectedIndent
       if (this.indent !== expectedIndent) {
           this.lexer.throwErr("'end' statement misaligned indent: " + this.indent + ". Expected " + expectedIndent + " to close block started at line " + block.sourceLineNum);
       };


// The words after `end` are just 'loose references' to the block intended to be closed
// We pick all the references up to EOL (or EOF)

       // while not .opt('NEWLINE','EOF')
       while(!(this.opt('NEWLINE', 'EOF'))){

// Get optional identifier reference
// We save `end` references, to match on block indentation,
// for Example: `end for` indentation must match a `for` statement on the same indent

           // if .lexer.token.type is 'IDENTIFIER'
           if (this.lexer.token.type === 'IDENTIFIER') {
             this.references.push(this.lexer.token.value);
           };

           this.lexer.nextToken();
       };// end loop
       
     };
   // export
   module.exports.EndStatement = EndStatement;
   // end class EndStatement

        // #end loop


// ## YieldExpression

// `YieldExpression: yield until asyncFnCall-VariableRef`
// `YieldExpression: yield parallel map array-Expression asyncFnCall-VariableRef`

// `yield until` expression calls a 'standard node.js async function'
// and `yield` execution to the caller function until the async completes (callback).

// A 'standard node.js async function' is an async function
// with the last parameter = callback(err,data)

// The yield-wait is implemented by exisiting lib 'nicegen'.

// Example: `contents = yield until fs.readFile 'myFile.txt','utf8'`

   // public class YieldExpression extends ASTBase
   // constructor
   function YieldExpression(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
        // specifier
        // fnCall
        // arrExpression
   };
   // YieldExpression (extends|proto is) ASTBase
   YieldExpression.prototype.__proto__ = ASTBase.prototype;

     // method parse()
     YieldExpression.prototype.parse = function(){

       this.req('yield');
       this.specifier = this.req('until', 'parallel');

       this.lock();

       // if .specifier is 'until'
       if (this.specifier === 'until') {

           this.fnCall = this.req(FunctionCall);
       }
       
       else {

           this.req('map');
           this.arrExpression = this.req(Expression);
           this.fnCall = this.req(FunctionCall);
       };
     };
   // export
   module.exports.YieldExpression = YieldExpression;
   // end class YieldExpression


// --------------

// Adjective
// ---------
// `Adjective: (public|export|default|nice|generator|shim|helper|global)`

// Adjectives can precede several statement.

   // public class Adjective extends ASTBase
   // constructor
   function Adjective(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
   };
   // Adjective (extends|proto is) ASTBase
   Adjective.prototype.__proto__ = ASTBase.prototype;

    // method parse()
    Adjective.prototype.parse = function(){

       this.name = this.req('public', 'export', 'default', 'nice', 'generator', 'shim', 'helper', 'global');
        // #'public' is just alias for 'export'
       // if .name is 'public', .name='export'
       if (this.name === 'public') {this.name = 'export'};
    };
   // export
   module.exports.Adjective = Adjective;
   // end class Adjective



// FunctionCall
// ------------

// `FunctionCall: VariableRef ["("] (Expression,) [")"]`

   // public class FunctionCall extends ASTBase
   // constructor
   function FunctionCall(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
          // varRef: VariableRef
   };
   // FunctionCall (extends|proto is) ASTBase
   FunctionCall.prototype.__proto__ = ASTBase.prototype;
      // declare name affinity fnCall

     // method parse(options)
     FunctionCall.prototype.parse = function(options){
        // declare valid .parent.preParsedVarRef

// Check for VariableRef. - can include (...) FunctionAccess

       // if .parent.preParsedVarRef #VariableRef already parsed
       if (this.parent.preParsedVarRef) {// #VariableRef already parsed
         this.varRef = this.parent.preParsedVarRef;// #use it
       }
       
       else {
         this.varRef = this.req(VariableRef);
       };

// if the last accessor is function call, this is already a FunctionCall

        //debug "#{.varRef.toString()} #{.varRef.executes?'executes':'DO NOT executes'}"

       // if .varRef.executes
       if (this.varRef.executes) {
           return;// #already a function call
       };

       // if .lexer.token.type is 'EOF'
       if (this.lexer.token.type === 'EOF') {
           return; // no more tokens
       };

// alllow a indented block to be parsed as fn call arguments

       // if .opt('NEWLINE') // if end of line, check next line
       if (this.opt('NEWLINE')) { // if end of line, check next line
           var nextLineIndent = this.lexer.indent; //save indent
           this.lexer.returnToken(); //return NEWLINE
            // check if next line is indented (with respect to Statement (parent))
           // if nextLineIndent <= .parent.indent // next line is not indented
           if (nextLineIndent <= this.parent.indent) { // next line is not indented
                  // assume this is just a fn call w/o parameters
                 return;
           };
       };

// else, get parameters, add to varRef as FunctionAccess accessor,

       var functionAccess = new FunctionAccess(this.varRef);
       functionAccess.args = functionAccess.reqSeparatedList(FunctionArgument, ",");
       // if .lexer.token.value is '->' #add last parameter: callback function
       if (this.lexer.token.value === '->') {// #add last parameter: callback function
           functionAccess.args.push(this.req(FunctionDeclaration));
       };

       this.varRef.addAccessor(functionAccess);
     };
   // export
   module.exports.FunctionCall = FunctionCall;
   // end class FunctionCall


// ## SwitchStatement

// `SwitchStatement: switch [VariableRef] (case (Expression,) ":" Body)* [default Body]`

// Similar to js switch, but:

 // 1. no fall-through
 // 2. each 'case' can have several expressions, comma separated, then ':'
 // 3. if no var specified, select first true expression

// See Also: [WhenSection]

// Examples:
// ```
  // switch a
    // case 2,4,6:
      // print 'even'
    // case 1,3,5:
      // print 'odd'
    // default:
      // print 'idk'

  // switch
    // case a is 3 or b < 10:
      // print 'option 1'
    // case b >= 10, a<0, c is 5:
      // print 'option 2'
    // default:
      // print 'other'
// ```

   // public class SwitchStatement extends ASTBase
   // constructor
   function SwitchStatement(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
        // varRef
        // cases: SwitchCase array
        // defaultBody: Body
   };
   // SwitchStatement (extends|proto is) ASTBase
   SwitchStatement.prototype.__proto__ = ASTBase.prototype;

     // method parse()
     SwitchStatement.prototype.parse = function(){
       this.req('switch');
       this.lock();
       this.varRef = this.opt(VariableRef);
       this.cases = [];

// Loop processing: 'NEWLINE','case' or 'default'

       // do until .lexer.token.type is 'EOF' or .lexer.indent<=.indent
       while(!(this.lexer.token.type === 'EOF' || this.lexer.indent <= this.indent)){
           var keyword = this.req('case', 'default', 'NEWLINE');

// on 'case', get a comma separated list of expressions, ended by ":"
// and a "Body". Push both on .cases[]

           // if keyword is 'case'
           if (keyword === 'case') {
               this.cases.push(this.req(SwitchCase));
           }

// else, on 'default', get default body, and break loop
           
           else if (keyword === 'default') {
               this.opt(":");
               this.defaultBody = this.reqBody();
               // break;
               break;
           };
       };// end loop

       // if no .cases.length, .throwError "no 'case' found after 'switch'"
       if (!this.cases.length) {this.throwError("no 'case' found after 'switch'")};
     };
   // export
   module.exports.SwitchStatement = SwitchStatement;
   // end class SwitchStatement

   // append to class ASTBase

     // method reqBody returns ASTBase
     ASTBase.prototype.reqBody = function(){
       // if .lexer.token.type is ('NEWLINE')
       if (this.lexer.token.type === ('NEWLINE')) {
            //indented body
           return this.req(Body);
       }
            //indented body
       
       else {
            //single line case/default
           return this.req(SingleLineBody);
       };
     };

   // public helper class SwitchCase extends ASTBase
   // constructor
   function SwitchCase(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
        // properties
            // expressions: Expression array
            // body
   };
   // SwitchCase (extends|proto is) ASTBase
   SwitchCase.prototype.__proto__ = ASTBase.prototype;

// ...a comma separated list of expressions, ended by ":", and a "Body"

       // method parse()
       SwitchCase.prototype.parse = function(){
           this.expressions = this.reqSeparatedList(Expression, ",", ":");
           this.body = this.reqBody();
       };
   // export
   module.exports.SwitchCase = SwitchCase;
   // end class SwitchCase


// ## CaseStatement

// `CaseStatement: case [VariableRef] [instance of] NEWLINE (when (Expression,) Body)* [else Body]`

// Similar syntax to ANSI-SQL 'CASE', and ruby's 'case'
// but it is a "statement" not a expression

// Examples:
//     case b
//       when 2,4,6
//         print 'even'
//       when 1,3,5
//         print 'odd'
//       else
//         print 'idk'
//     end
//     // case instance of
//     case b instance of
//       when VarStatement
//         print 'variables #{b.list}'
//       when AppendToDeclaration
//         print 'it is append to #{b.varRef}'
//       when NamespaceDeclaration
//         print 'namespace #{b.name}'
//       when ClassDeclaration
//         print 'a class, extends #{b.varRefSuper}'
//       else
//         print 'unexpected class'
//     end
//     // case when TRUE
//     var result
//     case
//         when a is 3 or b < 10
//             result = 'option 1'
//         when b >= 10 or a<0 or c is 5
//             result= 'option 2'
//         else
//             result = 'other'
//     end

   // public class CaseStatement extends ASTBase
   // constructor
   function CaseStatement(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
        // varRef: VariableRef
        // isInstanceof: boolean
        // cases: WhenSection array
        // elseBody: Body
   };
   // CaseStatement (extends|proto is) ASTBase
   CaseStatement.prototype.__proto__ = ASTBase.prototype;

     // method parse()
     CaseStatement.prototype.parse = function(){

       this.req('case');
       this.lock();

       this.varRef = this.opt(VariableRef);

       this.isInstanceof = this.opt('instance', 'instanceof'); //case foo instance of
       // if .isInstanceof is 'instance', .opt('of')
       if (this.isInstanceof === 'instance') {this.opt('of')};

       this.req('NEWLINE');

       this.cases = [];
       // while .opt(WhenSection) into var whenSection
       var whenSection=undefined;
       while((whenSection=this.opt(WhenSection))){
           this.cases.push(whenSection);
       };// end loop

       // if .cases.length is 0, .sayErr 'no "when" sections found for "case" construction'
       if (this.cases.length === 0) {this.sayErr('no "when" sections found for "case" construction')};

       // if .opt('else')
       if (this.opt('else')) {
           this.elseBody = this.req(Body);
       };
     };
   // export
   module.exports.CaseStatement = CaseStatement;
   // end class CaseStatement

   // public helper class WhenSection extends ASTBase
   // constructor
   function WhenSection(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
        // properties
            // expressions: Expression array
            // body
   };
   // WhenSection (extends|proto is) ASTBase
   WhenSection.prototype.__proto__ = ASTBase.prototype;

// we allow a list of comma separated expressions to compare to and a body

       // method parse()
       WhenSection.prototype.parse = function(){

           this.req('when');
           this.lock();
           this.expressions = this.reqSeparatedList(Expression, ",");
           this.body = this.req(Body);
       };
   // export
   module.exports.WhenSection = WhenSection;
   // end class WhenSection




// ##Statement

// A `Statement` is an imperative statment (command) or a control construct.

// The `Statement` node is a generic container for all previously defined statements.


// The generic `Statement` is used to define `Body: (Statement;)`, that is,
// **Body** is a list of semicolon (or NEWLINE) separated **Statements**.

// Grammar:
// ```
// Statement: [Adjective]* (ClassDeclaration|FunctionDeclaration
 // |IfStatement|ForStatement|WhileUntilLoop|DoLoop
 // |AssignmentStatement
 // |LoopControlStatement|ThrowStatement
 // |TryCatch|ExceptionBlock
 // |ReturnStatement|PrintStatement|DoNothingStatement)

// Statement: ( AssignmentStatement | fnCall-VariableRef [ ["("] (Expression,) [")"] ] )
// ```

   // public class Statement extends ASTBase
   // constructor
   function Statement(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
        // keyword
        // adjectives: Adjective array
        // statement
        // preParsedVarRef
        // intoVars
   };
   // Statement (extends|proto is) ASTBase
   Statement.prototype.__proto__ = ASTBase.prototype;

     // method parse()
     Statement.prototype.parse = function(){

       var key = undefined;

        // #debug show line and tokens
       debug("");
       this.lexer.infoLine.dump();

// First, fast-parse the statement by using a table.
// We look up the token (keyword) in **StatementsDirect** table, and parse the specific AST node

       key = this.lexer.token.value;
       this.statement = this.parseDirect(key, StatementsDirect);
       // if no .statement
       if (!this.statement) {

// If it was not found, try optional adjectives (zero or more). Adjectives are: `(export|public|generator|shim|helper)`.

         this.adjectives = this.optList(Adjective);

// Now re-try fast-parse

         key = this.lexer.token.value;
         this.statement = this.parseDirect(key, StatementsDirect);
         // if no .statement
         if (!this.statement) {

// Last possibilities are: `FunctionCall` or `AssignmentStatement`
// both start with a `VariableRef`:

// (performance) **require** & pre-parse the VariableRef.
// Then we require a AssignmentStatement or FunctionCall

           key = 'varref';
           this.preParsedVarRef = this.req(VariableRef);
           this.statement = this.req(AssignmentStatement, FunctionCall);
           this.preParsedVarRef = undefined;// #clear
         };
       };

       // end if - statement parse tries

// If we reached here, we have parsed a valid statement.
// Check validity of adjective-statement combination

       key = key.toLowerCase();
       this.keyword = key;

       // if .adjectives
       if (this.adjectives) {
         // for each adj in .adjectives
         for( var adj__inx=0,adj ; adj__inx<this.adjectives.length ; adj__inx++){adj=this.adjectives[adj__inx];

// Check validity of adjective-statement combination

             var CFVN = ['class', 'function', 'var', 'namespace'];

             var validCombinations = {
                   export: CFVN, 
                   default: CFVN, 
                   generator: ['function', 'method'], 
                   nice: ['function', 'method'], 
                   shim: ['function', 'method', 'class', 'namespace', 'import'], 
                   helper: ['function', 'method', 'class', 'namespace'], 
                   global: ['import', 'declare']
                   };

             var valid = validCombinations[adj.name] || ['-*none*-'];
             // if key not in valid, .throwError "'#{adj.name}' can only apply to #{valid.join('|')} not to '#{key}'"
             if (valid.indexOf(key)===-1) {this.throwError("'" + adj.name + "' can only apply to " + (valid.join('|')) + " not to '" + key + "'")};
         };// end for each in this.adjectives

         // end for
         
       };

// set module.exportDefault if 'export default' or 'public default' was parsed.
// Also, if the class/namespace has the same name as the file, it's automagically "export default"

        // declare valid .statement.export
        // declare valid .statement.default

       var moduleNode = this.getParent(Module);
       // if .statement.constructor in [ClassDeclaration,NamespaceDeclaration] and moduleNode.fileInfo.basename is .statement.name
       if ([ClassDeclaration, NamespaceDeclaration].indexOf(this.statement.constructor)>=0 && moduleNode.fileInfo.basename === this.statement.name) {
           this.statement.export = true;
           this.statement.default = true;
       };

       // if .statement.export and .statement.default
       if (this.statement.export && this.statement.default) {
           // if moduleNode.exportDefault, .throwError "only one 'export default' can be defined"
           if (moduleNode.exportDefault) {this.throwError("only one 'export default' can be defined")};
           moduleNode.exportDefault = this.statement;
       };
     };
   // export
   module.exports.Statement = Statement;
   // end class Statement


   // append to class ASTBase

     // helper method hasAdjective(name) returns boolean
     ASTBase.prototype.hasAdjective = function(name){
// To check if a specicif statement has an adjective. We assume .parent is Grammar.Statement

       var stat = this.constructor === Statement ? this : this.getParent(Statement);
       // if no stat, .throwError "[#{.constructor.name}].hasAdjective('#{name}'): can't find a parent Statement"
       if (!stat) {this.throwError("[" + this.constructor.name + "].hasAdjective('" + name + "'): can't find a parent Statement")};
       // if no stat.adjectives, return false
       if (!stat.adjectives) {return false};
       // for each adjective in stat.adjectives
       for( var adjective__inx=0,adjective ; adjective__inx<stat.adjectives.length ; adjective__inx++){adjective=stat.adjectives[adjective__inx];
           // if adjective.name is name, return true
           if (adjective.name === name) {return true};
       };// end for each in stat.adjectives

       return false;
     };


// ## Body

// `Body: (Statement;)`

// Body is a semicolon-separated list of statements (At least one)

// `Body` is used for "Module" body, "class" body, "function" body, etc.
// Anywhere a list of semicolon separated statements apply.

   // public class Body extends ASTBase
   // constructor
   function Body(){// default constructor: call super.constructor
       ASTBase.prototype.constructor.apply(this,arguments)
      // properties
        // statements: Statement array
   };
   // Body (extends|proto is) ASTBase
   Body.prototype.__proto__ = ASTBase.prototype;

     // method parse()
     Body.prototype.parse = function(){

       // if .lexer.interfaceMode
       if (this.lexer.interfaceMode) {
           // if .parent.constructor not in [ClassDeclaration,AppendToDeclaration,NamespaceDeclaration]
           if ([ClassDeclaration, AppendToDeclaration, NamespaceDeclaration].indexOf(this.parent.constructor)===-1) {
               return; //"no 'Bodys' expected on interface.md file except for: class, append to and namespace
           };
       };

       // if .lexer.token.type isnt 'NEWLINE'
       if (this.lexer.token.type !== 'NEWLINE') {
           this.lexer.sayErr("found " + this.lexer.token + " but expected NEWLINE and indented body");
       };

// We use the generic ***ASTBase.reqSeparatedList*** to get a list of **Statement** symbols,
// *semicolon* separated or in freeForm mode: one statement per line, closed when indent changes.

       this.statements = this.reqSeparatedList(Statement, ";");
     };
   // export
   module.exports.Body = Body;
   // end class Body


// ## Single Line Body

// This construction is used when only one statement is expected, and on the same line.
// It is used by `IfStatement: if conditon-Expression (','|then) *SingleLineBody*`
// It is also used for the increment statemenf in for-while loops:`for x=0, while x<10 [,SingleLineBody]`

// normally: ReturnStatement, ThrowStatement, PrintStatement, AssignmentStatement

   // public class SingleLineBody extends Body
   // constructor
   function SingleLineBody(){// default constructor: call super.constructor
       Body.prototype.constructor.apply(this,arguments)
   };
   // SingleLineBody (extends|proto is) Body
   SingleLineBody.prototype.__proto__ = Body.prototype;

     // method parse()
     SingleLineBody.prototype.parse = function(){

       this.statements = this.reqSeparatedList(Statement, ";", 'NEWLINE');
       this.lexer.returnToken();// #return closing NEWLINE
       // if .lexer.token.type not in ['NEWLINE','EOF'], .throwError "returned not in ['NEWLINE','EOF']"
       if (['NEWLINE', 'EOF'].indexOf(this.lexer.token.type)===-1) {this.throwError("returned not in ['NEWLINE','EOF']")};
     };
   // export
   module.exports.SingleLineBody = SingleLineBody;
   // end class SingleLineBody

// ## Module

// The `Module` represents a complete source file.

   // public class Module extends Body
   // constructor
   function Module(){// default constructor: call super.constructor
       Body.prototype.constructor.apply(this,arguments)
      // properties
        // isMain: boolean
        // exportDefault: ASTBase
   };
   // Module (extends|proto is) Body
   Module.prototype.__proto__ = Body.prototype;


     // method parse()
     Module.prototype.parse = function(){

// We start by locking. There is no other construction to try,
// if Module.parse() fails we abort compilation.

         this.lock();

// Get Module body: Statements, separated by NEWLINE|';' closer:'EOF'

         this.statements = this.optFreeFormList(Statement, ';', 'EOF');
     };
   // export
   module.exports.Module = Module;
   // end class Module

      // #end Module parse


// ----------------------------------------

// Table-based (fast) Statement parsing
// ------------------------------------

// This a extension to PEGs.
// To make the compiler faster and easier to debug, we define an
// object with name-value pairs: `"keyword" : AST node class`

// We look here for fast-statement parsing, selecting the right AST node to call `parse()` on
// based on `token.value`. (instead of parsing by ordered trial & error)

// This table makes a direct parsing of almost all statements, thanks to a core definition of LiteScript:
// Anything standing alone in it's own line, its an imperative statement (it does something, it produces effects).

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
     'case': CaseStatement, 
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


// ##### Helper Functions

   // export helper function autoCapitalizeCoreClasses(name:string) returns String
   function autoCapitalizeCoreClasses(name){
      // #auto-capitalize core classes when used as type annotations
     // if name in ['string','array','number','object','function','boolean','map']
     if (['string', 'array', 'number', 'object', 'function', 'boolean', 'map'].indexOf(name)>=0) {
       return name.slice(0, 1).toUpperCase() + name.slice(1);
     };
     return name;
   };
   // export
   module.exports.autoCapitalizeCoreClasses=autoCapitalizeCoreClasses;


   // append to class ASTBase

     // helper method parseType
     ASTBase.prototype.parseType = function(){

// parse type declaration:
  // function [(VariableDecl,)]
  // type-IDENTIFIER [array]
  // [array of] type-IDENTIFIER
  // map type-IDENTIFIER to type-IDENTIFIER

       // if .opt('function','Function') #function as type declaration
       if (this.opt('function', 'Function')) {// #function as type declaration
           // if .opt('(')
           if (this.opt('(')) {
                // declare valid .paramsDeclarations
               this.paramsDeclarations = this.optSeparatedList(VariableDecl, ',', ')');
           };
           this.type = new VariableRef(this, 'Function');
           return;
       };

// check for 'array', e.g.: `var list : array of NameDeclaration`

       // if .opt('array','Array')
       if (this.opt('array', 'Array')) {
           this.type = 'Array';
           // if .opt('of')
           if (this.opt('of')) {
               this.itemType = this.req(VariableRef);// #reference to an existing class
                //auto-capitalize core classes
                // declare .itemType:VariableRef
               this.itemType.name = autoCapitalizeCoreClasses(this.itemType.name);
           };
           // end if
           return;
       };

// Check for 'map', e.g.: `var list : map string to NameDeclaration`

       this.type = this.req(VariableRef);// #reference to an existing class
        //auto-capitalize core classes
        // declare .type:VariableRef
       this.type.name = autoCapitalizeCoreClasses(this.type.name);

       // if .type.name is 'Map'
       if (this.type.name === 'Map') {
             this.extraInfo = 'map [type] to [type]'; //extra info to show on parse fail
             this.keyType = this.req(VariableRef);// #type for KEYS: reference to an existing class
              //auto-capitalize core classes
              // declare .keyType:VariableRef
             this.keyType.name = autoCapitalizeCoreClasses(this.keyType.name);
             this.req('to');
             this.itemType = this.req(VariableRef);// #type for values: reference to an existing class
              // #auto-capitalize core classes
              // declare .itemType:VariableRef
             this.itemType.name = autoCapitalizeCoreClasses(this.itemType.name);
       }
       
       else {
            // #check for 'type array', e.g.: `var list : string array`
           // if .opt('Array','array')
           if (this.opt('Array', 'array')) {
               this.itemType = this.type;// #assign read type as sub-type
               this.type = 'Array';// #real type
           };
       };
     };


