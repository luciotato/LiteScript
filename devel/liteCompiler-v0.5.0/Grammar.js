//Compiled by LiteScript compiler v0.4.0, source: /home/ltato/LiteScript/source-v0.5.0/Grammar.lite.md
//LiteScript Grammar
//==================

//The LiteScript Grammar is based on [Parsing Expression Grammars (PEGs)](http://en.wikipedia.org/wiki/Parsing_expression_grammar)
//*with extensions*.

//Grammar Meta-Syntax
//-------------------

//Each Grammar class, contains a 'grammar definition' as reference.
//The meta-syntax for the grammar definitions is an extended form of
//[Parsing Expression Grammars (PEGs)](http://en.wikipedia.org/wiki/Parsing_expression_grammar)

//The differences with classic PEG are:
//* instead of `Symbol <- definition`, we use `Symbol: definition` (colon instead of arrow)
//* we use `[Symbol]` for optional symbols instead of `Symbol` (brackets also groups symbols, the entire group is optional)
//* symbols upper/lower case carries meaning
//* we add `(Symbol,)` meaning: `comma separated List of` as a syntax option

//Examples:

//`ReturnStatement`    : CamelCase is reserved for non-terminal symbol
//`function`       : all-lowercase means the literal word
//`":"`            : literal symbols are quoted

//`IDENTIFIER`,`OPER` : all-uppercase denotes entire classes of symbols
//`NEWLINE`,`EOF`     : or special unprintable characters

//`[of]`               : Optional symbols are enclosed in brackets
//`(var|let)`          : The vertical bar represents ordered alternatives
//`(Oper Operand)`     : Parentheses groups symbols
//`(Oper Operand)*`    : Asterisk after a group `()*` means the group can repeat (meaning one or more)
//`[Oper Operand]*`    : Asterisk after a optional group `[]*` means *zero* or more of the group.

//`"(" [Expression,] ")"` : the comma means a comma "Separated List".

//`Body: (Statement;)` : the semicolon means: a semicolon "Separated List".


//###"Separated List"

//Example: `FunctionCall: IDENTIFIER '(' [Expression,] ')'`

//`[Expression,]` means *optional* **comma "Separated List"** of Expressions. When the comma is
//inside a **[ ]** group, it means the entire list is optional.

//Example: `VarStatement: (VariableDecl,)`, where `VariableDecl: IDENTIFIER ["=" Expression]`

//`(VariableDecl,)` means **comma "Separated List"** of `VariableDecl`
//When the comma is inside a **( )** group, it means one or more of the group

//###Free-Form Separated List
//At every point where a "Separated List" is accepted, also
//a "**free-form** Separated List" is accepted.

//In *free-form* mode, each item stands on its own line, and separators (comma/semicolon)
//are optional, and can appear after or before the NEWLINE.

//For example, given the previous example: **VarStatement: (IDENTIFIER ["=" Expression] ,)**,
//all the following constructions are equivalent and valid in LiteScript:

//Examples:


//    //standard js
//    var a = {prop1:30 prop2: { prop2_1:19, prop2_2:71} arr:["Jan","Feb","Mar"]}

//    //LiteScript: mixed freeForm and comma separated
//    var a =
//        prop1: 30
//        prop2:
//          prop2_1: 19, prop2_2: 71
//        arr: [ "Jan",
//              "Feb", "Mar"]

//    //LiteScript: in freeForm, commas are optional
//    var a =
//        prop1: 30
//        prop2:
//          prop2_1: 19,
//          prop2_2: 71,
//        arr: [
//            "Jan",
//            "Feb"
//            "Mar"
//            ]


//##More about comma separated lists

//The examples above only show Object and List Expressions, but *you can use free-form mode (multiple lines with the same indent), everywhere a comma separated list of items apply.*

//The previous examples were for:

//* Literal Object expression<br>
  //because a Literal Object expression is:<br>
  //"{" + a comma separated list of Item:Value pairs + "}"

//and
//* Literal Array expression<br>
  //because a Literal Array expression is<br>
  //"[" + a comma separated list of expressions + "]"

//But the free-form option also applies for:

//* Function parameters declaration<br>
  //because Function parameters declaration is:<br>
  //"(" + a comma separated list of paramter names + ")"

//* Arguments, for any function call<br>
  //because function call arguments are:<br>
  //"(" + a comma separated list of expressions + ")"

//* Variables declaration<br>
  //because variables declaration is:<br>
  //'var' + a comma separated list of: IDENTIFIER ["=" Expression]

//Examples:


//  js:

//    Console.log(title,subtitle,line1,line2,value,recommendation)

//  LiteScript available variations:

//    print title,subtitle,
//          line1,line2,
//          value,recommendation

//    print
//      title
//      subtitle
//      line1
//      line2
//      value
//      recommendation

//  js:

//    var a=10, b=20, c=30,
//        d=40;

//    function complexFn( 10, 4, 'sample'
//       'see 1',
//       2+2,
//       null ){
//      ...function body...
//    };

//  LiteScript:

//    var
//      a=10,b=20
//      c=30,d=40

//    function complexFn(
//      10       # determines something important to this function
//      4        # do not pass nulll to this
//      'sample' # this is original data
//      'see 1'  # note param
//      2+2      # useful tip
//      null     # reserved for extensions ;)
//      )
//      ...function body...

//Implementation
//---------------

//The LiteScript Grammar is defined as `classes`, one class for each non-terminal symbol.

//The `.parse()` method of each class will try the grammar on the token stream and:
//* If all tokens match, it will simply return after consuming the tokens. (success)
//* On a token mismatch, it will raise a 'parse failed' exception.

//When a 'parse failed' exception is raised, other classes can be tried.
//If no class parses ok, a compiler error is emitted and compilation is aborted.

//if the error is *before* the class has determined this was the right language construction,
//it is a soft-error and other grammars can be tried over the source code.

//if the error is *after* the class has determined this was the right language construction
//(if the node was 'locked'), it is a hard-error and compilation is aborted.

//The `ASTBase` module defines the base class for the grammar classes along with
//utility methods to **req**uire tokens and allow **opt**ional ones.


//### Dependencies

   //import ASTBase, log
   var ASTBase = require('./ASTBase');
   var log = require('./log');
   var debug = log.debug;


   //compiler set sourceMap = false

    //declare global process
    //declare on process exit


//Reserved Words
//---------------

//Words that are reserved in LiteScript and cannot be used as variable or function names
//(There are no restrictions to object property names)

   var RESERVED_WORDS = ['namespace', 'function', 'class', 'method', 'constructor', 'prototype', 'if', 'then', 'else', 'switch', 'when', 'case', 'end', 'null', 'true', 'false', 'undefined', 'and', 'or', 'but', 'no', 'not', 'has', 'hasnt', 'property', 'properties', 'new', 'is', 'isnt', 'do', 'loop', 'while', 'until', 'for', 'to', 'break', 'continue', 'return', 'try', 'catch', 'throw', 'raise', 'fail', 'exception', 'finally', 'with', 'arguments', 'in', 'instanceof', 'typeof', 'var', 'let', 'default', 'delete', 'interface', 'implements', 'yield', 'like', 'this', 'super', 'export', 'compiler', 'compile', 'debugger'];


//Operators precedence
//--------------------

//The order of symbols here determines operators precedence

   var operatorsPrecedence = ['++', '--', 'unary -', 'unary +', '~', '&', '^', '|', '>>', '<<', 'new', 'type of', 'instance of', 'has property', '*', '/', '%', '+', '-', 'into', 'in', '>', '<', '>=', '<=', 'is', '<>', '!==', 'like', 'no', 'not', 'and', 'but', 'or', '?', ':'];

//--------------------------

//LiteScript Grammar - AST Classes
//================================
//This file is code and documentation, you'll find a class
//for each syntax construction the compiler accepts.

   //export class PrintStatement extends ASTBase
   //constructor
   function PrintStatement(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // PrintStatement (extends|super is) ASTBase
   PrintStatement.prototype.__proto__ = ASTBase.prototype;

//`PrintStatement: 'print' [Expression,]`

//This handles `print` followed by an optional comma separated list of expressions

      //properties
        //args

     //method parse()
     PrintStatement.prototype.parse = function(){

       this.req('print');

//At this point we lock because it is definitely a `print` statement. Failure to parse the expression
//from this point is a syntax error.

       this.lock();

       this.args = this.optSeparatedList(Expression, ",");
     };
   //export
   module.exports.PrintStatement = PrintStatement;
   //end class PrintStatement



   //export class VarStatement extends ASTBase
   //constructor
   function VarStatement(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // VarStatement (extends|super is) ASTBase
   VarStatement.prototype.__proto__ = ASTBase.prototype;

//`VarStatement: (var|let) (VariableDecl,)+ `

//`var` followed by a comma separated list of VariableDecl (one or more)

      //properties
        //list:array
        //export:boolean, default:boolean

     //method parse()
     VarStatement.prototype.parse = function(){

       this.req('var', 'let');
       this.lock();

       this.list = this.reqSeparatedList(VariableDecl, ",");
     };
   //export
   module.exports.VarStatement = VarStatement;
   //end class VarStatement


   //export class VariableDecl extends ASTBase
   //constructor
   function VariableDecl(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // VariableDecl (extends|super is) ASTBase
   VariableDecl.prototype.__proto__ = ASTBase.prototype;

//`VariableDecl: IDENTIFIER (':' dataType-VariableRef) ('=' assignedValue-Expression)`

//(variable name, optional type anotation and optionally assign a value)

//Note: If no value is assigned, `= undefined` is assumed

//VariableDecls are used in `var` statement, in functions for *parameter declaration*
//and in class *properties declaration*

//Example:
  //`var a : string = 'some text'`
  //`function x ( a : string = 'some text', b, c=0)`

      //properties
        //name
        //type: VariableRef
        //itemType: VariableRef
        //assignedValue: Expression

      //declare name affinity varDecl, paramDecl

     //method parse()
     VariableDecl.prototype.parse = function(){

       this.name = this.req('IDENTIFIER');

       this.lock();

//optional type annotation
//optional assigned value

       var dangling = undefined;

       //if .opt(':')
       if (this.opt(':')) {
           //if .lexer.token.type is 'NEWLINE' #dangling assignment :
           if (this.lexer.token.type === 'NEWLINE') {// #dangling assignment :
               dangling = true;
           }
           
           else {
               this.parseType();
           };
       };

       //if not dangling and .opt('=')
       if (!(dangling) && this.opt('=')) {
           //if .lexer.token.type is 'NEWLINE' #dangling assignment =
           if (this.lexer.token.type === 'NEWLINE') {// #dangling assignment =
               dangling = true;
           }
           
           else {
               this.assignedValue = this.req(Expression);
               return;
           };
       };

       //if dangling #dangling assignment :/= assume free-form object literal
       if (dangling) {// #dangling assignment :/= assume free-form object literal
           this.assignedValue = this.req(FreeObjectLiteral);
       };
     };
   //export
   module.exports.VariableDecl = VariableDecl;
   //end class VariableDecl


   //export class PropertiesDeclaration extends ASTBase
   //constructor
   function PropertiesDeclaration(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // PropertiesDeclaration (extends|super is) ASTBase
   PropertiesDeclaration.prototype.__proto__ = ASTBase.prototype;

//`PropertiesDeclaration: properties (VariableDecl,)`

//The `properties` keyword is used inside classes to define properties of the class (prototype).

      //properties
        //list: VariableDecl array
        //toNamespace: boolean

      //declare name affinity propDecl

     //method parse()
     PropertiesDeclaration.prototype.parse = function(){

       this.toNamespace = this.opt('namespace') ? true : false;

       this.req('properties');
       this.lock();

       this.list = this.reqSeparatedList(VariableDecl, ',');
     };
   //export
   module.exports.PropertiesDeclaration = PropertiesDeclaration;
   //end class PropertiesDeclaration


   //export class TryCatch extends ASTBase
   //constructor
   function TryCatch(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // TryCatch (extends|super is) ASTBase
   TryCatch.prototype.__proto__ = ASTBase.prototype;

//`TryCatch: 'try' Body ExceptionBlock`

//Defines a `try` block for trapping exceptions and handling them.

      //properties body,exceptionBlock

     //method parse()
     TryCatch.prototype.parse = function(){
       this.req('try');
       this.lock();
       this.body = this.req(Body);

       this.exceptionBlock = this.req(ExceptionBlock);
     };
   //export
   module.exports.TryCatch = TryCatch;
   //end class TryCatch


   //export class ExceptionBlock extends ASTBase
   //constructor
   function ExceptionBlock(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // ExceptionBlock (extends|super is) ASTBase
   ExceptionBlock.prototype.__proto__ = ASTBase.prototype;

//`ExceptionBlock: (exception|catch) Identifier Body [finally Body]`

//Defines a `catch` block for trapping exceptions and handling them.
//If no `try` preceded this construction, `try` is assumed at the beggining of the function

      //properties
        //catchVar:string
        //body,finallyBody

     //method parse()
     ExceptionBlock.prototype.parse = function(){

       this.req('catch', 'exception', 'Exception');
       this.lock();

//get catch variable - Note: catch variables in js are block-scoped

       this.catchVar = this.req('IDENTIFIER');

//get body

       this.body = this.req(Body);

//get optional "finally" block

       //if .opt('finally')
       if (this.opt('finally')) {
         this.finallyBody = this.req(Body);
       };
     };
   //export
   module.exports.ExceptionBlock = ExceptionBlock;
   //end class ExceptionBlock


   //export class ThrowStatement extends ASTBase
   //constructor
   function ThrowStatement(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // ThrowStatement (extends|super is) ASTBase
   ThrowStatement.prototype.__proto__ = ASTBase.prototype;

//`ThrowStatement: (throw|raise|fail with) Expression`

//This handles `throw` and its synonyms followed by an expression

      //properties specifier, expr

     //method parse()
     ThrowStatement.prototype.parse = function(){

       this.specifier = this.req('throw', 'raise', 'fail');

//At this point we lock because it is definitely a `throw` statement

       this.lock();

       //if .specifier is 'fail'
       if (this.specifier === 'fail') {
           this.req('with');
       };

       this.expr = this.req(Expression);
     };
   //export
   module.exports.ThrowStatement = ThrowStatement;
   //end class ThrowStatement


   //export class ReturnStatement extends ASTBase
   //constructor
   function ReturnStatement(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // ReturnStatement (extends|super is) ASTBase
   ReturnStatement.prototype.__proto__ = ASTBase.prototype;

//`ReturnStatement: return Expression`

      //properties expr

     //method parse()
     ReturnStatement.prototype.parse = function(){
       this.req('return');
       this.lock();
       this.expr = this.opt(Expression);
     };
   //export
   module.exports.ReturnStatement = ReturnStatement;
   //end class ReturnStatement


   //export class IfStatement extends ASTBase
   //constructor
   function IfStatement(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // IfStatement (extends|super is) ASTBase
   IfStatement.prototype.__proto__ = ASTBase.prototype;

//`IfStatement: (if|when) Expression (then|',') SingleLineStatement [ElseIfStatement|ElseStatement]*`
//`IfStatement: (if|when) Expression Body [ElseIfStatement|ElseStatement]*`

//Parses `if` statments and any attached `else`s or `else if`s

      //properties conditional,body,elseStatement

     //method parse()
     IfStatement.prototype.parse = function(){

       this.req('if', 'when');
       this.lock();

       this.conditional = this.req(Expression);

       //if .opt(',','then')
       if (this.opt(',', 'then')) {

//after `,` or `then`, a statement on the same line is required

           this.body = this.req(SingleLineStatement);
       }
       
       else {

           this.body = this.req(Body);
       };

        //#end if

//control: "if"-"else" are related by having the same indent

       //if .lexer.token.value is 'else'
       if (this.lexer.token.value === 'else') {

         //if .lexer.index isnt 0
         if (this.lexer.index !== 0) {
           this.throwError('expected "else" to start on a new line');
         };

         //if .lexer.indent < .indent
         if (this.lexer.indent < this.indent) {
            //#token is 'else' **BUT IS LESS-INDENTED**. It is not the "else" to this "if"
           return;
         };

         //if .lexer.indent > .indent
         if (this.lexer.indent > this.indent) {
           this.throwError("'else' statement is over-indented");
         };
       };

        //#end if

       this.elseStatement = this.opt(ElseIfStatement, ElseStatement);
     };
   //export
   module.exports.IfStatement = IfStatement;
   //end class IfStatement


   //export class ElseIfStatement extends ASTBase
   //constructor
   function ElseIfStatement(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // ElseIfStatement (extends|super is) ASTBase
   ElseIfStatement.prototype.__proto__ = ASTBase.prototype;

//`ElseIfStatement: (else|otherwise) if Expression Body`

//This class handles chained else-if statements

      //properties nextIf

     //method parse()
     ElseIfStatement.prototype.parse = function(){

       this.req('else');
       this.req('if');
       this.lock();

//return the consumed 'if', to parse as a normal 'IfStatement'

       this.lexer.returnToken();
       this.nextIf = this.req(IfStatement);
     };
   //export
   module.exports.ElseIfStatement = ElseIfStatement;
   //end class ElseIfStatement


   //export class ElseStatement extends ASTBase
   //constructor
   function ElseStatement(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // ElseStatement (extends|super is) ASTBase
   ElseStatement.prototype.__proto__ = ASTBase.prototype;

//`ElseStatement: ('else'|'otherwise') (Statement | Body) `

//This class handles closing "else" statements

      //properties body

     //method parse()
     ElseStatement.prototype.parse = function(){

       this.req('else');
       this.lock();
       this.body = this.req(Body);
     };
   //export
   module.exports.ElseStatement = ElseStatement;
   //end class ElseStatement


//Loops
//=====

//LiteScript provides the standard js and C `while` loop, but also provides a `until` loop
//and a post-condition `do loop while|until`


   //export class WhileUntilExpression extends ASTBase
   //constructor
   function WhileUntilExpression(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // WhileUntilExpression (extends|super is) ASTBase
   WhileUntilExpression.prototype.__proto__ = ASTBase.prototype;

//common symbol for loops conditions. Is the word 'while' or 'until' followed by a boolean-Expression

//`WhileUntilExpression: ('while'|'until') boolean-Expression`

      //properties expr

     //method parse()
     WhileUntilExpression.prototype.parse = function(){
       this.name = this.req('while', 'until');
       this.lock();
       this.expr = this.req(Expression);
     };
   //export
   module.exports.WhileUntilExpression = WhileUntilExpression;
   //end class WhileUntilExpression

//DoLoop
//------

//`DoLoop: do [pre-WhileUntilExpression] [":"] Body loop`
//`DoLoop: do [":"] Body loop [post-WhileUntilExpression]`

//do-loop can have a optional pre-condition or a optional post-condition

//### Case 1) do-loop without any condition

//a do-loop without any condition is an *infinite loop* (usually with a `break` statement inside)

//Example:

//  var x=1

//  do:

//    x++
//    print x
//    when x is 10, break

//  loop

//### Case 2) do-loop with pre-condition

//A do-loop with pre-condition, is the same as a while|until loop

//Example:

//  var x=1

//  do while x<10

//    x++
//    print x

//  loop

//### Case 3) do-loop with post-condition

//A do-loop with post-condition, execute the block, at least once, and after each iteration,
//checks the post-condition, and loops `while` the expression is true
//*or* `until` the expression is true

//Example:

//  var x=1

//  do

//    x++
//    print x

//  loop while x < 10


//### Implementation

   //public class DoLoop extends ASTBase
   //constructor
   function DoLoop(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // DoLoop (extends|super is) ASTBase
   DoLoop.prototype.__proto__ = ASTBase.prototype;

      //properties
        //preWhileUntilExpression
        //body
        //postWhileUntilExpression

     //method parse()
     DoLoop.prototype.parse = function(){

       this.req('do');

       //if .opt('nothing')
       if (this.opt('nothing')) {
         this.throwParseFailed('is do nothing');
       };

       this.opt(":");
       this.lock();

//Get optional pre-condition

       this.preWhileUntilExpression = this.opt(WhileUntilExpression);

       this.body = this.opt(Body);

       this.req("loop");

//Get optional post-condition

       this.postWhileUntilExpression = this.opt(WhileUntilExpression);

       //if .preWhileUntilExpression and .postWhileUntilExpression
       if (this.preWhileUntilExpression && this.postWhileUntilExpression) {
         this.sayErr("Loop: cant have a pre-condition a and post-condition at the same time");
       };
     };
   //export
   module.exports.DoLoop = DoLoop;
   //end class DoLoop


   //export class WhileUntilLoop extends DoLoop
   //constructor
   function WhileUntilLoop(){
       // default constructor: call super.constructor
       return DoLoop.prototype.constructor.apply(this,arguments)
   };
   // WhileUntilLoop (extends|super is) DoLoop
   WhileUntilLoop.prototype.__proto__ = DoLoop.prototype;

//`WhileUntilLoop: pre-WhileUntilExpression Body`

//Execute the block `while` the condition is true or `until` the condition is true

//while|until loops are simpler forms of loops. The `while` form, is the same as in C and js.

//WhileUntilLoop derives from DoLoop, to use its `.produce()` method (it is a simple form of DoLoop)

      //properties preWhileUntilExpression, body

     //method parse()
     WhileUntilLoop.prototype.parse = function(){

       this.preWhileUntilExpression = this.req(WhileUntilExpression);
       this.lock();

       this.body = this.opt(Body);
     };
   //export
   module.exports.WhileUntilLoop = WhileUntilLoop;
   //end class WhileUntilLoop


   //export class LoopControlStatement extends ASTBase
   //constructor
   function LoopControlStatement(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // LoopControlStatement (extends|super is) ASTBase
   LoopControlStatement.prototype.__proto__ = ASTBase.prototype;

//`LoopControlStatement: (break|continue)`

//This handles the `break` and `continue` keywords.
//'continue' jumps to the start of the loop (as C & Js: 'continue')

      //properties control

     //method parse()
     LoopControlStatement.prototype.parse = function(){
       this.control = this.req('break', 'continue');
     };
   //export
   module.exports.LoopControlStatement = LoopControlStatement;
   //end class LoopControlStatement


   //export class DoNothingStatement extends ASTBase
   //constructor
   function DoNothingStatement(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // DoNothingStatement (extends|super is) ASTBase
   DoNothingStatement.prototype.__proto__ = ASTBase.prototype;

//`DoNothingStatement: do nothing`

     //method parse()
     DoNothingStatement.prototype.parse = function(){
       this.req('do');
       this.req('nothing');
     };
   //export
   module.exports.DoNothingStatement = DoNothingStatement;
   //end class DoNothingStatement


//## For Statement

   //export class ForStatement extends ASTBase
   //constructor
   function ForStatement(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // ForStatement (extends|super is) ASTBase
   ForStatement.prototype.__proto__ = ASTBase.prototype;

//`ForStatement: (ForEachProperty|ForEachInArray|ForIndexNumeric)`

      //properties
        //variant: ASTBase

     //method parse()
     ForStatement.prototype.parse = function(){

        //declare valid .createScope

//We start with commonn `for` keyword

       this.req('for');
       this.lock();

//There are 3 variants of `ForStatement` in LiteScript,
//we now require one of them

       this.variant = this.req(ForEachProperty, ForEachInArray, ForIndexNumeric);
     };
   //export
   module.exports.ForStatement = ForStatement;
   //end class ForStatement

//##Variant 1) **for each property** to loop over **object property names**

//Grammar:
//`ForEachProperty: for each [own] property name-VariableDecl ["," value-VariableDecl] in object-VariableRef [where Expression]`

//where `name-VariableDecl` is a variable declared on the spot to store each property name,
//and `object-VariableRef` is the object having the properties

//if the optional `own` keyword is used, only instance properties will be looped
//(no prototype chain properties)

   //export class ForEachProperty extends ASTBase
   //constructor
   function ForEachProperty(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // ForEachProperty (extends|super is) ASTBase
   ForEachProperty.prototype.__proto__ = ASTBase.prototype;

      //properties
        //ownOnly
        //indexVar:VariableDecl, mainVar:VariableDecl
        //iterable, where:ForWhereFilter
        //body

     //method parse()
     ForEachProperty.prototype.parse = function(){

       this.req('each');

//then check for optional `own`

       this.ownOnly = this.opt('own') ? true : false;

//next we require: 'property', and lock.

       this.req('property');
       this.lock();

//Get index variable name (to store property names)

       this.indexVar = this.req(VariableDecl);

//Get main variable name (to store property value)

       //if .opt(",")
       if (this.opt(",")) {
         this.mainVar = this.req(VariableDecl);
       };

//Then we require `in`, then the iterable-Expression (a object)

       this.req('in');
       this.iterable = this.req(Expression);

//optional where expression

       this.where = this.opt(ForWhereFilter);

//Now, get the loop body

       this.body = this.req(Body);
     };
   //export
   module.exports.ForEachProperty = ForEachProperty;
   //end class ForEachProperty


//##Variant 2) **for each in** to loop over **Arrays**

//Grammar:
//`ForEachInArray: for each [index-VariableDecl,]item-VariableDecl in array-VariableRef [where Expression]`

//where:
//* `index-VariableDecl` is a variable declared on the spot to store each item index (from 0 to array.length)
//* `item-VariableDecl` is a variable declared on the spot to store each array item (array[index])
//and `array-VariableRef` is the array to iterate over

   //export class ForEachInArray extends ASTBase
   //constructor
   function ForEachInArray(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // ForEachInArray (extends|super is) ASTBase
   ForEachInArray.prototype.__proto__ = ASTBase.prototype;

      //properties
        //indexVar:VariableDecl, mainVar:VariableDecl, iterable:Expression
        //where:ForWhereFilter
        //body

     //method parse()
     ForEachInArray.prototype.parse = function(){

//first, require 'each'

       this.req('each');

//Get index variable and value variable.
//Keep it simple: index and value are always variables declared on the spot

       this.mainVar = this.req(VariableDecl);

//a comma means: previous var was 'index', so register as index and get main var

       //if .opt(',')
       if (this.opt(',')) {
         this.indexVar = this.mainVar;
         this.mainVar = this.req(VariableDecl);
       };

//we now *require* `in` and the iterable (array)

       this.req('in');
       this.lock();
       this.iterable = this.req(Expression);

//optional where expression

       this.where = this.opt(ForWhereFilter);

//and then, loop body

       this.body = this.req(Body);
     };
   //export
   module.exports.ForEachInArray = ForEachInArray;
   //end class ForEachInArray

//##Variant 3) **for index=...** to create **numeric loops**

//This `for` variant is just a verbose expressions of the standard C (and js) `for(;;)` loop

//Grammar:
//`ForIndexNumeric: for index-VariableDecl [[","] (while|until|to) end-Expression ["," increment-Statement] ["," where Expression]`

//where `index-VariableDecl` is a numeric variable declared on the spot to store loop index,
//`start-Expression` is the start value for the index (ussually 0)
//`end-Expression` is the end value (`to`), the condition to keep looping (`while`) or to end looping (`until`)
//and `increment-Statement` is the statement used to advance the loop index. If omitted the default is `index++`

   //export class ForIndexNumeric extends ASTBase
   //constructor
   function ForIndexNumeric(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // ForIndexNumeric (extends|super is) ASTBase
   ForIndexNumeric.prototype.__proto__ = ASTBase.prototype;

      //properties
        //indexVar:VariableDecl
        //conditionPrefix, endExpression
        //where
        //increment: Statement
        //body

     //method parse()
     ForIndexNumeric.prototype.parse = function(){

//we require: a variableDecl, with optional assignment

       this.indexVar = this.req(VariableDecl);
       this.lock();

//next comma is  optional
//get 'while|until|to' and condition

       this.opt(',');
       this.conditionPrefix = this.req('while', 'until', 'to');
       this.endExpression = this.req(Expression);

//another optional comma, and ForWhereFilter

       this.opt(',');
       this.where = this.opt(ForWhereFilter);

//another optional comma, and increment-Statement

       this.opt(',');
       this.increment = this.opt(SingleLineStatement);

//Now, get the loop body

       this.body = this.req(Body);
     };
   //export
   module.exports.ForIndexNumeric = ForIndexNumeric;
   //end class ForIndexNumeric



   //public helper class ForWhereFilter extends ASTBase
   //constructor
   function ForWhereFilter(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // ForWhereFilter (extends|super is) ASTBase
   ForWhereFilter.prototype.__proto__ = ASTBase.prototype;
//`ForWhereFilter: [NEWLINE] where Expression`

      //properties
        //filter

     //method parse
     ForWhereFilter.prototype.parse = function(){

//optional NEWLINE, then 'where' then filter-Expression

       var optNewLine = this.opt('NEWLINE');

       //if .opt('where')
       if (this.opt('where')) {
         this.lock();
         this.filter = this.req(Expression);
       }
       
       else {
         //if optNewLine, .lexer.returnToken # return NEWLINE
         if (optNewLine) {
             this.lexer.returnToken()};
         this.throwParseFailed("expected '[NEWLINE] where'");
       };
     };
   //export
   module.exports.ForWhereFilter = ForWhereFilter;
   //end class ForWhereFilter

//--------------------------------

   //public class DeleteStatement extends ASTBase
   //constructor
   function DeleteStatement(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // DeleteStatement (extends|super is) ASTBase
   DeleteStatement.prototype.__proto__ = ASTBase.prototype;
//`DeleteStatement: delete VariableRef`

      //properties
        //varRef

     //method parse
     DeleteStatement.prototype.parse = function(){
       this.req('delete');
       this.lock();
       this.varRef = this.req(VariableRef);
     };
   //export
   module.exports.DeleteStatement = DeleteStatement;
   //end class DeleteStatement


   //export class AssignmentStatement extends ASTBase
   //constructor
   function AssignmentStatement(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // AssignmentStatement (extends|super is) ASTBase
   AssignmentStatement.prototype.__proto__ = ASTBase.prototype;

//`AssignmentStatement: VariableRef ("="|"+="|"-="|"*="|"/=") Expression`

      //properties lvalue:VariableRef, rvalue:Expression

     //method parse()
     AssignmentStatement.prototype.parse = function(){

        //declare valid this.scopeEvaluateAssignment
        //declare valid .parent.preParsedVarRef
        //declare valid .scopeEvaluateAssignment

       //if .parent.preParsedVarRef
       if (this.parent.preParsedVarRef) {
         this.lvalue = this.parent.preParsedVarRef;// # get already parsed VariableRef
       }
       
       else {
         this.lvalue = this.req(VariableRef);
       };

//require an assignment symbol: ("="|"+="|"-="|"*="|"/=")

       this.name = this.req('ASSIGN');
       this.lock();

       //if .lexer.token.type is 'NEWLINE' #dangling assignment
       if (this.lexer.token.type === 'NEWLINE') {// #dangling assignment
         this.rvalue = this.req(FreeObjectLiteral);// #assume Object Expression in freeForm mode
       }
       
       else {
         this.rvalue = this.req(Expression);
       };
     };
   //export
   module.exports.AssignmentStatement = AssignmentStatement;
   //end class AssignmentStatement


//-----------------------

//## Accessors

//`Accessors: (PropertyAccess|FunctionAccess|IndexAccess)`

//Accessors:
  //`PropertyAccess: '.' IDENTIFIER`
  //`IndexAccess:    '[' Expression ']'`
  //`FunctionAccess: '(' [Expression,]* ')'`

//Accessors can appear after a VariableRef (most common case)
//but also after a String constant, a Regex Constant,
//a ObjectLiteral and a ArrayLiteral

//Examples:
  //myObj.item.fn(call)  <-- 3 accesors, two PropertyAccess and a FunctionAccess
  //myObj[5](param).part  <-- 3 accesors, IndexAccess, FunctionAccess and PropertyAccess
  //[1,2,3,4].indexOf(3) <-- 2 accesors, PropertyAccess and FunctionAccess


//Actions:
//`.`-> PropertyAccess: Search the property in the object and in his pototype chain.
                      //It resolves to the property value

//`[...]` -> IndexAccess: Same as PropertyAccess

//`(...)` -> FunctionAccess: The object is assumed to be a function, and the code executed.
                      //It resolves to the function return value.

//## Implementation
//We provide a class Accessor to be super class for the three accessors types.

   //export class Accessor extends ASTBase
   //constructor
   function Accessor(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // Accessor (extends|super is) ASTBase
   Accessor.prototype.__proto__ = ASTBase.prototype;
     //method parse
     Accessor.prototype.parse = function(){
       //fail with 'abstract'
       throw new Error('abstract');
     };
     //method toString
     Accessor.prototype.toString = function(){
       //fail with 'abstract'
       throw new Error('abstract');
     };
   //export
   module.exports.Accessor = Accessor;
   //end class Accessor


   //export class PropertyAccess extends Accessor
   //constructor
   function PropertyAccess(){
       // default constructor: call super.constructor
       return Accessor.prototype.constructor.apply(this,arguments)
   };
   // PropertyAccess (extends|super is) Accessor
   PropertyAccess.prototype.__proto__ = Accessor.prototype;

//`.` -> PropertyAccess: get the property named "n"

//`PropertyAccess: '.' IDENTIFIER`

     //method parse()
     PropertyAccess.prototype.parse = function(){
       this.req('.');
       this.lock();
       this.name = this.req('IDENTIFIER');
     };

     //method toString()
     PropertyAccess.prototype.toString = function(){
       return '.' + this.name;
     };
   //export
   module.exports.PropertyAccess = PropertyAccess;
   //end class PropertyAccess


   //export class IndexAccess extends Accessor
   //constructor
   function IndexAccess(){
       // default constructor: call super.constructor
       return Accessor.prototype.constructor.apply(this,arguments)
   };
   // IndexAccess (extends|super is) Accessor
   IndexAccess.prototype.__proto__ = Accessor.prototype;

//`[n]`-> IndexAccess: get the property named "n" / then nth index of the array
                       //It resolves to the property value

//`IndexAccess: '[' Expression ']'`

     //method parse()
     IndexAccess.prototype.parse = function(){

       this.req("[");
       this.lock();
       this.name = this.req(Expression);
       this.req("]");// #closer ]
     };

     //method toString()
     IndexAccess.prototype.toString = function(){
       return '[...]';
     };
   //export
   module.exports.IndexAccess = IndexAccess;
   //end class IndexAccess


   //export class FunctionAccess extends Accessor
   //constructor
   function FunctionAccess(){
       // default constructor: call super.constructor
       return Accessor.prototype.constructor.apply(this,arguments)
   };
   // FunctionAccess (extends|super is) Accessor
   FunctionAccess.prototype.__proto__ = Accessor.prototype;
//`(...)` -> FunctionAccess: The object is assumed to be a function, and the code executed.
                           //It resolves to the function return value.

//`FunctionAccess: '(' [Expression,]* ')'`

      //properties
        //args

     //method parse()
     FunctionAccess.prototype.parse = function(){
       this.req("(");
       this.lock();
       this.args = this.optSeparatedList(Expression, ",", ")");// #comma-separated list of expressions, closed by ")"
     };

     //method toString()
     FunctionAccess.prototype.toString = function(){
       return '(...)';
     };
   //export
   module.exports.FunctionAccess = FunctionAccess;
   //end class FunctionAccess

//## Helper Functions to parse accessors on any node

   //append to class ASTBase
   
      //properties
        //accessors: Accessor array
        //executes, hasSideEffects

     //helper method parseAccessors
     ASTBase.prototype.parseAccessors = function(){

//(performance) only if the next token in ".[("

         //if .lexer.token.value not in '.[(' then return
         if ('.[('.indexOf(this.lexer.token.value)===-1) {
             return};

//We store the accessors in the property: .accessors
//if the accessors node exists, .list will have **at least one item**

//loop parsing accessors

         //do
         while(true){
             var ac = this.parseDirect(this.lexer.token.value, AccessorsDirect);
             //if no ac, break
             if (!ac) {
                 break};

             this.addAccessor(ac);
         };//end loop

         return;
     };

     //helper method insertAccessorAt(position,item)
     ASTBase.prototype.insertAccessorAt = function(position, item){

            //#create accessors list, if there was none
           //if no .accessors, .accessors = []
           if (!this.accessors) {
               this.accessors = []};

            //#polymorphic params: string defaults to PropertyAccess
           //if type of item is 'string', item = new PropertyAccess(this, item)
           if (typeof item === 'string') {
               item = new PropertyAccess(this, item)};

            //#insert
           this.accessors.splice(position, 0, item);
     };


     //helper method addAccessor(item)
     ASTBase.prototype.addAccessor = function(item){

            //#create accessors list, if there was none
           //if no .accessors, .accessors = []
           if (!this.accessors) {
               this.accessors = []};
           this.insertAccessorAt(this.accessors.length, item);

//if the very last accesor is "(", it means the entire expression is a function call,
//it's a call to "execute code", so it's a imperative statement on it's own.
//if any accessor is a function call, this statement is assumed to have side-effects

           this.executes = item instanceof FunctionAccess;
           //if .executes, .hasSideEffects = true
           if (this.executes) {
               this.hasSideEffects = true};
     };



   //export class VariableRef extends ASTBase
   //constructor
   function VariableRef(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // VariableRef (extends|super is) ASTBase
   VariableRef.prototype.__proto__ = ASTBase.prototype;

//`VariableRef: ('--'|'++') IDENTIFIER [Accessors] ('--'|'++')`

//`VariableRef` is a Variable Reference

//a VariableRef can include chained 'Accessors', which do:
//* access a property of the object : `.`-> **PropertyAccess** and `[...]`->**IndexAccess**
//* assume the variable is a function and perform a function call :  `(...)`->**FunctionAccess**

      //properties
        //preIncDec
        //postIncDec

      //declare name affinity varRef

     //method parse()
     VariableRef.prototype.parse = function(){

       this.preIncDec = this.opt('--', '++');

       this.executes = false;

//assume 'this.x' on '.x'.
//get var name

       //if .opt('.','SPACE_DOT') # note: DOT has SPACES in front when .property used as parameter
       if (this.opt('.', 'SPACE_DOT')) {// # note: DOT has SPACES in front when .property used as parameter
          //#'.name' -> 'this.name'
         this.lock();
         this.name = 'this';
         var member = this.req('IDENTIFIER');
         this.addAccessor(new PropertyAccess(this, member));
       }
       
       else {
         this.name = this.req('IDENTIFIER');
       };

       this.lock();

//Now we check for accessors:
//`.`->**PropertyAccess**
//`[...]`->**IndexAccess**
//`(...)`->**FunctionAccess**
//Note: paserAccessors() will:
//* set .hasSideEffects=true if a function accessor is parsed
//* set .executes=true if the last accessor is a function accessor

       this.parseAccessors();

//Replace lexical 'super' by '#{SuperClass name}.prototype'

       //if .name is 'super'
       if (this.name === 'super') {

           var classDecl = this.getParent(ClassDeclaration);
           //if no classDecl
           if (!classDecl) {
             this.throwError("can't use 'super' outside a class method");
           };

           //if classDecl.varRefSuper
           if (classDecl.varRefSuper) {
                //#replace name='super' by name = #{SuperClass name}
               this.name = classDecl.varRefSuper.name;
           }
                //#replace name='super' by name = #{SuperClass name}
           
           else {
               this.name = 'Object';// # no superclass means 'Object' is super class
           };

            //#insert '.prototype.' as first accessor (after super class name)
           this.insertAccessorAt(0, 'prototype');

            //#if super class is a composed name (x.y.z), we must insert those accessors also
            //# so 'super.myFunc' turns into 'NameSpace.subName.SuperClass.prototype.myFunc'
           //if classDecl.varRefSuper and classDecl.varRefSuper.accessors
           if (classDecl.varRefSuper && classDecl.varRefSuper.accessors) {
                //#insert super class accessors
               var position = 0;
               //for each ac in classDecl.varRefSuper.accessors
               for( var ac__inx=0,ac ; ac__inx<classDecl.varRefSuper.accessors.length ; ac__inx++){ac=classDecl.varRefSuper.accessors[ac__inx];
               
                 //if ac instanceof PropertyAccess
                 if (ac instanceof PropertyAccess) {
                   this.insertAccessorAt(position++, ac.name);
                 };
               }; // end for each in classDecl.varRefSuper.accessors
               
           };
       };

       //end if super

//Allow 'null' as alias to 'do nothing'

       //if .name is 'null', .executes = true
       if (this.name === 'null') {
           this.executes = true};

//Hack: after 'into var', allow :type for simple (no accessor) var names

       //if .getParent(Statement).intoVars and .opt(":")
       if (this.getParent(Statement).intoVars && this.opt(":")) {
           this.type = this.req(VariableRef);
       };

//check for post-fix increment/decrement

       this.postIncDec = this.opt('--', '++');

//If this variable ref has ++ or --, IT IS CONSIDERED a "call to execution" in itself,
//a "imperative statement", because it has side effects.
//(`i++` has a "imperative" part, It means: "give me the value of i, and then increment it!")

       //if .preIncDec or .postIncDec
       if (this.preIncDec || this.postIncDec) {
         this.executes = true;
         this.hasSideEffects = true;
       };

//Note: In LiteScript, *any VariableRef standing on its own line*, it's considered
//a function call. A VariableRef on its own line means "execute this!",
//so, when translating to js, it'll be translated as a function call, and `()` will be added.
//If the VariableRef is marked as 'executes' then it's assumed it is alread a functioncall,
//so `()` will NOT be added.

//Examples:
//---------
    //LiteScript   | Translated js  | Notes
    //-------------|----------------|-------
    //start        | start();       | "start", on its own, is considered a function call
    //start(10,20) | start(10,20);  | Normal function call
    //start 10,20  | start(10,20);  | function call w/o parentheses
    //start.data   | start.data();  | start.data, on its own, is considered a function call
    //i++          | i++;           | i++ is marked "executes", it is a statement in itself

//Keep track of 'require' calls, to import modules (recursive)

       //if .name is 'require'
       if (this.name === 'require') {
           this.getParent(Module).requireCallNodes.push(this);
       };
     };

//---------------------------------
//This method is only valid to be used in error reporting.
//function accessors will be output as "(...)", and index accessors as [...]

     //helper method toString()
     VariableRef.prototype.toString = function(){

       var result = (this.preIncDec || "") + this.name;
       //if .accessors
       if (this.accessors) {
         //for each ac in .accessors
         for( var ac__inx=0,ac ; ac__inx<this.accessors.length ; ac__inx++){ac=this.accessors[ac__inx];
         
           result += ac.toString();
         }; // end for each in this.accessors
         
       };
       return result + (this.postIncDec || "");
     };
   //export
   module.exports.VariableRef = VariableRef;
   //end class VariableRef

//-----------------------

//## Operand

//`Operand: (
  //(NumberLiteral|StringLiteral|RegExpLiteral|ArrayLiteral|ObjectLiteral
                    //|ParenExpression|FunctionDeclaration)[Accessors])
  //|VariableRef)

//Examples:

//4 + 3 : Operand Oper Operand
//-4    : UnaryOper Operand

//A `Operand` is the data on which the operator operates.
//It's the left and right part of a binary operator.
//It's the data affected (righ) by a UnaryOper.

//To make parsing faster, associate a token type/value,
//with exact AST class to call parse() on.

   var OPERAND_DIRECT_TYPE = {
         'STRING': StringLiteral, 
         'NUMBER': NumberLiteral, 
         'REGEX': RegExpLiteral
         };


   var OPERAND_DIRECT_TOKEN = {
         '(': ParenExpression, 
         '[': ArrayLiteral, 
         '{': ObjectLiteral, 
         'function': FunctionDeclaration, 
         'case': CaseWhenExpression
         };


   //public class Operand extends ASTBase
   //constructor
   function Operand(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // Operand (extends|super is) ASTBase
   Operand.prototype.__proto__ = ASTBase.prototype;

     //method parse()
     Operand.prototype.parse = function(){

//fast-parse: if it's a NUMBER: it is NumberLiteral, if it's a STRING: it is StringLiteral (also for REGEX)
//or, upon next token, cherry pick which AST nodes to try,
//'(':ParenExpression,'[':ArrayLiteral,'{':ObjectLiteral,'function': FunctionDeclaration

       this.name = this.parseDirect(this.lexer.token.type, OPERAND_DIRECT_TYPE) || this.parseDirect(this.lexer.token.value, OPERAND_DIRECT_TOKEN);

//if it was a Literal, ParenExpression or FunctionDeclaration
//besides base value, this operands can have accessors. For example: `"string".length` , `myObj.fn(10)`

       //if .name
       if (this.name) {
           this.parseAccessors();
       }

//else, (if not Literal, ParenExpression or FunctionDeclaration)
//it must be a variable ref
       
       else {
           this.name = this.req(VariableRef);
       };
     };
   //export
   module.exports.Operand = Operand;
   //end class Operand

        //#end if

    //#end Operand


//## Oper

//`Oper: ('~'|'&'|'^'|'|'|'>>'|'<<'
        //|'*'|'/'|'+'|'-'|mod
        //|instance of|instanceof
        //|'>'|'<'|'>='|'<='
        //|is|'==='|isnt|is not|'!=='
        //|and|but|or
        //|[not] in
        //|(has|hasnt) property
        //|? true-Expression : false-Expression)`

//An Oper sits between two Operands ("Oper" is a "Binary Operator",
//differents from *UnaryOperators* which optionally precede a Operand)

//If an Oper is found after an Operand, a second Operand is expected.

//Operators can include:
//* arithmetic operations "*"|"/"|"+"|"-"
//* boolean operations "and"|"or"
//* `in` collection check.  (js: `indexOx()>=0`)
//* instance class checks   (js: instanceof)
//* short-if ternary expressions ? :
//* bit operations (|&)
//* `has property` object property check (js: 'propName in object')

   //public class Oper extends ASTBase
   //constructor
   function Oper(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // Oper (extends|super is) ASTBase
   Oper.prototype.__proto__ = ASTBase.prototype;

      //properties
        //negated
        //left:Operand, right:Operand
        //pushed, precedence
        //intoVar

     //method parse()
     Oper.prototype.parse = function(){

        //declare valid .getPrecedence

//Get token, require an OPER.
//Special: v0.3 - 'ternary expression with else'. "x? a else b" should be valid alias for "x?a:b"

        //declare valid .parent.ternaryCount
       //if .parent.ternaryCount and .opt('else')
       if (this.parent.ternaryCount && this.opt('else')) {
           this.name = ':';// # if there's a open ternaryCount, 'else' is converted to ":"
       }
       
       else {
           this.name = this.req('OPER');
       };

       this.lock();

//A) validate double-word opers

//A.1) validate `instance of`

       //if .name is 'instance'
       if (this.name === 'instance') {
           this.name += ' ' + this.req('of');
       }

//A.2) validate `has|hasnt property`
       
       else if (this.name === 'has') {
           this.negated = this.opt('not') ? true : false;// # set the 'negated' flag
           this.name += ' ' + this.req('property');
       }
       
       else if (this.name === 'hasnt') {
           this.negated = true;// # set the 'negated' flag
           this.name += 'has ' + this.req('property');
       }

//A.3) also, check if we got a `not` token.
//In this case we require the next token to be `in`
//`not in` is the only valid (not-unary) *Oper* starting with `not`
       
       else if (this.name === 'not') {
           this.negated = true;// # set the 'negated' flag
           this.name = this.req('in', 'like');// # require 'not in'|'not like'
       };

//A.4) handle 'into [var] x'

       //if .name is 'into' and .opt('var')
       if (this.name === 'into' && this.opt('var')) {
           this.intoVar = true;
           this.getParent(Statement).intoVars = true;// #mark owner statement
       }

//B) Synonyms

//else, check for `isnt`, which we treat as `!==`, `negated is`
       
       else if (this.name === 'isnt') {
         this.negated = true;// # set the 'negated' flag
         this.name = 'is';// # treat as 'Negated is'
       }

//else check for `instanceof`, (old habits die hard)
       
       else if (this.name === 'instanceof') {
         this.name = 'instance of';
       };

        //#end if

//C) Variants on 'is/isnt...'

       //if .name is 'is' # note: 'isnt' was converted to 'is {negated:true}' above
       if (this.name === 'is') {// # note: 'isnt' was converted to 'is {negated:true}' above

  //C.1) is not
  //Check for `is not`, which we treat as `isnt` rather than `is ( not`.

         //if .opt('not') # --> is not/has not...
         if (this.opt('not')) {// # --> is not/has not...
             //if .negated, .throwError '"isnt not" is invalid'
             if (this.negated) {
                 this.throwError('"isnt not" is invalid')};
             this.negated = true;// # set the 'negated' flag
         };

        //#end if

  //C.2) accept 'is/isnt instance of' and 'is/isnt instanceof'

         //if .opt('instance')
         if (this.opt('instance')) {
             this.name = 'instance ' + this.req('of');
         }
         
         else if (this.opt('instanceof')) {
             this.name = 'instance of';
         };
       };

        //#end if

//Get operator precedence index

       this.getPrecedence();
     };

      //#end Oper parse


//###getPrecedence:
//Helper method to get Precedence Index (lower number means higher precedende)

     //helper method getPrecedence()
     Oper.prototype.getPrecedence = function(){

       this.precedence = operatorsPrecedence.indexOf(this.name);
       //if .precedence is -1
       if (this.precedence === -1) {
           //debugger
           debugger;
           //fail with "OPER '#{.name}' not found in the operator precedence list"
           throw new Error("OPER '" + this.name + "' not found in the operator precedence list");
       };
     };
   //export
   module.exports.Oper = Oper;
   //end class Oper



//###Boolean Negation: `not`

//####Notes for the javascript programmer


//In LiteScript, the *boolean negation* `not`,
//has LOWER PRECEDENCE than the arithmetic and logical operators.

//In LiteScript: `if not a + 2 is 5` means `if not (a+2 is 5)`

//In javascript: `if ( ! a + 2 === 5 )` means `if ( (!a)+2 === 5 )`

//so remember **not to** mentally translate `not` to js `!`


//UnaryOper
//---------

//`UnaryOper: ('-'|'+'|new|type of|typeof|not|no|'~') `

//A Unary Oper is an operator acting on a single operand.
//Unary Oper extends Oper, so both are `instance of Oper`

//Examples:
//1) `not`     *boolean negation*     `if not ( a is 3 or b is 4)`
//2) `-`       *numeric unary minus*  `-(4+3)`
//2) `+`       *numeric unary plus*   `+4` (can be ignored)
//3) `new`     *instantiation*        `x = new classes[2]()`
//4) `type of` *type name access*     `type of x is 'string'`
//5) `no`      *'falsey' check*       `if no options then options={}`
//6) `~`       *bit-unary-negation*   `a = ~xC0 + 5`

   var unaryOperators = ['new', '-', 'no', 'not', 'type', 'typeof', '~', '+'];

   //public class UnaryOper extends Oper
   //constructor
   function UnaryOper(){
       // default constructor: call super.constructor
       return Oper.prototype.constructor.apply(this,arguments)
   };
   // UnaryOper (extends|super is) Oper
   UnaryOper.prototype.__proto__ = Oper.prototype;

     //method parse()
     UnaryOper.prototype.parse = function(){

//require a unaryOperator

         this.name = this.reqOneOf(unaryOperators);

//Check for `type of` - we allow "type" as var name, but recognize "type of" as UnaryOper

         //if .name is 'type'
         if (this.name === 'type') {
             //if .opt('of')
             if (this.opt('of')) {
               this.name = 'type of';
             }
             
             else {
               this.throwParseFailed('expected "of" after "type"');
             };
         };

//Lock, we have a unary oper

         this.lock();

//Rename - and + to 'unary -' and 'unary +'
//'typeof' to 'type of'

         //if .name is '-'
         if (this.name === '-') {
             this.name = 'unary -';
         }
         
         else if (this.name === '+') {
             this.name = 'unary +';
         }
         
         else if (this.name === 'typeof') {
             this.name = 'type of';
         };

          //#end if

//calculate precedence - Oper.getPrecedence()

         this.getPrecedence();
     };
   //export
   module.exports.UnaryOper = UnaryOper;
   //end class UnaryOper

      //#end parse


//-----------
//## Expression

//`Expression: [UnaryOper] Operand [Oper [UnaryOper] Operand]*`

//The expression class parses intially a *flat* array of nodes.
//After the expression is parsed, a *Expression Tree* is created based on operator precedence.

   //public class Expression extends ASTBase
   //constructor
   function Expression(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // Expression (extends|super is) ASTBase
   Expression.prototype.__proto__ = ASTBase.prototype;

      //properties operandCount, root, ternaryCount

     //method parse()
     Expression.prototype.parse = function(){

        //declare valid .growExpressionTree
        //declare valid .root.name.type

       var arr = [];
       this.operandCount = 0;
       this.ternaryCount = 0;

       //do
       while(true){

//Get optional unary operator
//(performance) check token first

           //if .lexer.token.value in unaryOperators
           if (unaryOperators.indexOf(this.lexer.token.value)>=0) {
               var unaryOper = this.opt(UnaryOper);
               //if unaryOper
               if (unaryOper) {
                   arr.push(unaryOper);
                   this.lock();
               };
           };

//Get operand

           arr.push(this.req(Operand));
           this.operandCount += 1;
           this.lock();

//(performance) Fast exit for common tokens: `= , ] )` -> end of expression.

           //if .lexer.token.type is 'ASSIGN' or .lexer.token.value in ',)]'
           if (this.lexer.token.type === 'ASSIGN' || ',)]'.indexOf(this.lexer.token.value)>=0) {
               //break
               break;
           };

//optional newline **before** Oper
//To allow a expressions to continue on the next line, we look ahead, and if the first token in the next line is OPER
//we consume the NEWLINE, allowing multiline expressions. The exception is ArrayLiteral, because in free-form mode
//the next item in the array on the next line, can start with a unary operator

           //if .lexer.token.type is 'NEWLINE' and not (.parent instanceof ArrayLiteral)
           if (this.lexer.token.type === 'NEWLINE' && !((this.parent instanceof ArrayLiteral))) {
             this.opt('NEWLINE');// #consume newline
             //if .lexer.indent<=.indent or .lexer.token.type isnt 'OPER' # the first token in the next line isnt OPER (+,and,or,...)
             if (this.lexer.indent <= this.indent || this.lexer.token.type !== 'OPER') {// # the first token in the next line isnt OPER (+,and,or,...)
               this.lexer.returnToken();// # return NEWLINE
               //break #end Expression
               break;// #end Expression
             };
           };

//Try to parse next token as an operator

           var oper = this.opt(Oper);
           //if no oper then break # no more operators, end of expression
           if (!oper) {
               break};

//keep count on ternaryOpers

           //if oper.name is '?'
           if (oper.name === '?') {
               this.ternaryCount++;
           }
           
           else if (oper.name === ':') {

               //if no .ternaryCount //":" without '?'. It can be 'case' expression ending ":"
               if (!this.ternaryCount) { //":" without '?'. It can be 'case' expression ending ":"
                   this.lexer.returnToken();
                   //break //end of expression
                   break; //end of expression
               };
               this.ternaryCount--;
           };

           //end if

//If it was an operator, store, and continue because we expect another operand.
//(operators sits between two operands)

           arr.push(oper);

//allow dangling expression. If the line ends with OPER,
//we consume the NEWLINE and continue parsing the expression on the next line

           this.opt('NEWLINE');// #consume optional newline after Oper
       };//end loop

//Control: complete all ternary operators

       //if .ternaryCount, .throwError 'missing (":"|else) on ternary operator (a? b else c)'
       if (this.ternaryCount) {
           this.throwError('missing (":"|else) on ternary operator (a? b else c)')};

//Fix 'new' calls. Check parameters for 'new' unary operator, for consistency, add '()' if not present,
//so `a = new MyClass` turns into `a = new MyClass()`

       //for each index,item in arr
       for( var index=0,item ; index<arr.length ; index++){item=arr[index];
       
          //declare item:UnaryOper
         //if item instanceof UnaryOper and item.name is 'new'
         if (item instanceof UnaryOper && item.name === 'new') {
           var operand = arr[index + 1];
           //if operand.name instanceof VariableRef
           if (operand.name instanceof VariableRef) {
               var varRef = operand.name;
               //if no varRef.executes, varRef.addAccessor new FunctionAccess(this)
               if (!varRef.executes) {
                   varRef.addAccessor(new FunctionAccess(this))};
           };
         };
       }; // end for each in arr

//Now we create a tree from .arr[], based on operator precedence

       this.growExpressionTree(arr);
     };


     //end method Expression.parse()


//Grow The Expression Tree
//========================

//Growing the expression AST
//--------------------------

//By default, for every expression, the parser creates a *flat array*
//of UnaryOper, Operands and Operators.

//`Expression: [UnaryOper] Operand [Oper [UnaryOper] Operand]*`

//For example, `not 1 + 2 * 3 is 5`, turns into:

//.arr =  ['not','1','+','2','*','3','is','5']

//In this method we create the tree, by pushing down operands,
//according to operator precedence.

//Te process runs until there is only one operator left in the root node
//(the one with lower precedence)

//For example, `not 1 + 2 * 3 is 5`, turns into:

//<pre>
//>   not
//>      \
//>      is
//>     /  \
//>   +     5
//>  / \
//> 1   *
//>    / \
//>    2  3
//</pre>


//`3 in a and not 4 in b`
//<pre>
//>      and
//>     /  \
//>   in    not
//>  / \     |
//> 3   a    in
//>         /  \
//>        4   b
//</pre>

//`3 in a and 4 not in b`
//<pre>
//>      and
//>     /  \
//>   in   not-in
//>  / \    / \
//> 3   a  4   b
//>
//</pre>

//`-(4+3)*2`
//<pre>
//>   *
//>  / \
//> -   2
//>  \
//>   +
//>  / \
//> 4   3
//</pre>

//Expression.growExpressionTree()
//-------------------------------

     //method growExpressionTree(arr:array)
     Expression.prototype.growExpressionTree = function(arr){

//while there is more than one operator in the root node...

       //while arr.length > 1
       while(arr.length > 1){

//find the one with highest precedence (lower number) to push down
//(on equal precedende, we use the leftmost)

         //compile if inNode

           var d = "Expr.TREE: ";
           //for each inx,item in arr
           for( var inx=0,item ; inx<arr.length ; inx++){item=arr[inx];
           
              //declare valid item.name.name
              //declare valid item.pushed
             //if item instanceof Oper
             if (item instanceof Oper) {
               d += " " + item.name;
               //if item.pushed
               if (item.pushed) {
                   d += "-v";
               };
               d += " ";
             }
             
             else {
               d += " " + item.name.name;
             };
           }; // end for each in arr
           debug(d);
         //end

         var pos = -1;
         var minPrecedenceInx = 100;
         //for each inx,item in arr
         for( var inx=0,item ; inx<arr.length ; inx++){item=arr[inx];
         

            //debug "item at #{inx} #{item.name}, Oper? #{item instanceof Oper}. precedence:",item.precedence
            //declare valid item.precedence
            //declare valid item.pushed

           //if item instanceof Oper
           if (item instanceof Oper) {
             //if not item.pushed and item.precedence < minPrecedenceInx
             if (!(item.pushed) && item.precedence < minPrecedenceInx) {
               pos = inx;
               minPrecedenceInx = item.precedence;
             };
           };
         }; // end for each in arr

          //#end for

          //#control
         //if pos<0, .throwError("can't find highest precedence operator")
         if (pos < 0) {
             this.throwError("can't find highest precedence operator")};

//Un-flatten: Push down the operands a level down

         var oper = arr[pos];

         oper.pushed = true;

         //if oper instanceof UnaryOper
         if (oper instanceof UnaryOper) {

            //#control
           //compile if debug

             //if pos is arr.length
             if (pos === arr.length) {
               this.throwError("can't get RIGHT operand for unary operator '" + oper + "'");
             };
           //end compile

            //# if it's a unary operator, take the only (right) operand, and push-it down the tree
           oper.right = arr.splice(pos + 1, 1)[0];
         }
         
         else {

            //#control
           //compile if debug

             //if pos is arr.length
             if (pos === arr.length) {
               this.throwError("can't get RIGHT operand for binary operator '" + oper + "'");
             };
             //if pos is 0
             if (pos === 0) {
               this.throwError("can't get LEFT operand for binary operator '" + oper + "'");
             };
           //end compile

            //# if it's a binary operator, take the left and right operand, and push-them down the tree
           oper.right = arr.splice(pos + 1, 1)[0];
           oper.left = arr.splice(pos - 1, 1)[0];
         };
       };//end loop

          //#end if

        //#loop until there's only one operator

//Store the root operator

       this.root = arr[0];
     };
   //export
   module.exports.Expression = Expression;
   //end class Expression

      //#end method

//-----------------------

//## Literal

//This class groups: NumberLiteral, StringLiteral, RegExpLiteral, ArrayLiteral and ObjectLiteral

   //public class Literal extends ASTBase
   //constructor
   function Literal(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // Literal (extends|super is) ASTBase
   Literal.prototype.__proto__ = ASTBase.prototype;

      //properties
        //type = '*abstract-Literal*'
     Literal.prototype.type='*abstract-Literal*';

     //method getValue()
     Literal.prototype.getValue = function(){
       return this.name;
     };
   //export
   module.exports.Literal = Literal;
   //end class Literal


//## NumberLiteral

//`NumberLiteral: NUMBER`

//A numeric token constant. Can be anything the lexer supports, including scientific notation
//, integers, floating point, or hex.

   //public class NumberLiteral extends Literal
   //constructor
   function NumberLiteral(){
       // default constructor: call super.constructor
       return Literal.prototype.constructor.apply(this,arguments)
   };
   // NumberLiteral (extends|super is) Literal
   NumberLiteral.prototype.__proto__ = Literal.prototype;

      //properties
        //type = 'Number'
     NumberLiteral.prototype.type='Number';

     //method parse()
     NumberLiteral.prototype.parse = function(){
       this.name = this.req('NUMBER');
     };
   //export
   module.exports.NumberLiteral = NumberLiteral;
   //end class NumberLiteral


//## StringLiteral

//`StringLiteral: STRING`

//A string constant token. Can be anything the lexer supports, including single or double-quoted strings.
//The token include the enclosing quotes

   //public class StringLiteral extends Literal
   //constructor
   function StringLiteral(){
       // default constructor: call super.constructor
       return Literal.prototype.constructor.apply(this,arguments)
   };
   // StringLiteral (extends|super is) Literal
   StringLiteral.prototype.__proto__ = Literal.prototype;

      //properties
        //type = 'String'
     StringLiteral.prototype.type='String';

     //method parse()
     StringLiteral.prototype.parse = function(){
       this.name = this.req('STRING');
     };

     //method getValue()
     StringLiteral.prototype.getValue = function(){
       return this.name.slice(1, -1);// #remove quotes
     };
   //export
   module.exports.StringLiteral = StringLiteral;
   //end class StringLiteral

//## RegExpLiteral

//`RegExpLiteral: REGEX`

//A regular expression token constant. Can be anything the lexer supports.

   //public class RegExpLiteral extends Literal
   //constructor
   function RegExpLiteral(){
       // default constructor: call super.constructor
       return Literal.prototype.constructor.apply(this,arguments)
   };
   // RegExpLiteral (extends|super is) Literal
   RegExpLiteral.prototype.__proto__ = Literal.prototype;

      //properties
        //type = 'RegExp'
     RegExpLiteral.prototype.type='RegExp';

     //method parse()
     RegExpLiteral.prototype.parse = function(){
       this.name = this.req('REGEX');
     };
   //export
   module.exports.RegExpLiteral = RegExpLiteral;
   //end class RegExpLiteral


//## ArrayLiteral

//`ArrayLiteral: '[' (Expression,)* ']'`

//An array definition, such as `a = [1,2,3]`
//or

//```
//a = [
   //"January"
   //"February"
   //"March"
  //]
//```

   //public class ArrayLiteral extends Literal
   //constructor
   function ArrayLiteral(){
       // default constructor: call super.constructor
       return Literal.prototype.constructor.apply(this,arguments)
   };
   // ArrayLiteral (extends|super is) Literal
   ArrayLiteral.prototype.__proto__ = Literal.prototype;

      //properties
        //type = 'Array'
        //items
     ArrayLiteral.prototype.type='Array';

     //method parse()
     ArrayLiteral.prototype.parse = function(){
       this.req('[');
       this.lock();
       this.items = this.optSeparatedList(Expression, ',', ']');// # closer "]" required
     };
   //export
   module.exports.ArrayLiteral = ArrayLiteral;
   //end class ArrayLiteral


//## ObjectLiteral

//`ObjectLiteral: '{' NameValuePair* '}'`

//Defines an object with a list of key value pairs. This is a JavaScript-style definition.

//`x = {a:1,b:2,c:{d:1}}`

   //public class ObjectLiteral extends Literal
   //constructor
   function ObjectLiteral(){
       // default constructor: call super.constructor
       return Literal.prototype.constructor.apply(this,arguments)
   };
   // ObjectLiteral (extends|super is) Literal
   ObjectLiteral.prototype.__proto__ = Literal.prototype;

      //properties
        //items: NameValuePair array
        //type = 'Object'
     ObjectLiteral.prototype.type='Object';

     //method parse()
     ObjectLiteral.prototype.parse = function(){

       this.req('{');
       this.lock();
       this.items = this.optSeparatedList(NameValuePair, ',', '}');// # closer "}" required
     };


//####helper Functions

      //#recursive duet 1 (see NameValuePair)
     //helper method forEach(callback)
     ObjectLiteral.prototype.forEach = function(callback){
         //for each nameValue in .items
         for( var nameValue__inx=0,nameValue ; nameValue__inx<this.items.length ; nameValue__inx++){nameValue=this.items[nameValue__inx];
         
           nameValue.forEach(callback);
         }; // end for each in this.items
         
     };
   //export
   module.exports.ObjectLiteral = ObjectLiteral;
   //end class ObjectLiteral


//## NameValuePair

//`NameValuePair: (IDENTIFIER|STRING|NUMBER) ':' Expression`

//A single definition in a `ObjectLiteral`
//a `property-name: value` pair.

   //public class NameValuePair extends ASTBase
   //constructor
   function NameValuePair(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // NameValuePair (extends|super is) ASTBase
   NameValuePair.prototype.__proto__ = ASTBase.prototype;

      //properties value: Expression

     //method parse()
     NameValuePair.prototype.parse = function(){

       this.name = this.req('IDENTIFIER', 'STRING', 'NUMBER');

       this.req(':');
       this.lock();

//if it's a "dangling assignment", we assume FreeObjectLiteral

       //if .lexer.token.type is 'NEWLINE'
       if (this.lexer.token.type === 'NEWLINE') {
         this.value = this.req(FreeObjectLiteral);
       }
       
       else {
         //if .lexer.interfaceMode
         if (this.lexer.interfaceMode) {
             this.parseType();
         }
         
         else {
             this.value = this.req(Expression);
         };
       };
     };

      //#recursive duet 2 (see ObjectLiteral)
     //helper method forEach(callback)
     NameValuePair.prototype.forEach = function(callback){

         callback(this);

//if ObjectLiteral, recurse

          //declare valid .value.root.name

         //if .value.root.name instanceof ObjectLiteral
         if (this.value.root.name instanceof ObjectLiteral) {
            //declare valid .value.root.name.forEach
           this.value.root.name.forEach(callback);// # recurse
         };
     };
   //export
   module.exports.NameValuePair = NameValuePair;
   //end class NameValuePair

    //#end helper recursive functions


//## FreeObjectLiteral

//Defines an object with a list of key value pairs.
//Each pair can be in it's own line. A indent denotes a new level deep.
//FreeObjectLiterals are triggered by a "danglin assignment"

//Examples:


//    var x =            // <- dangling assignment
//          a: 1
//          b:           // <- dangling assignment
//            b1:"some"
//            b2:"cofee"

//    var x =
//     a:1
//     b:2
//     c:
//      d:1
//     months: ["J","F",
//      "M","A","M","J",
//      "J","A","S","O",
//      "N","D" ]


//    var y =
//     c:{d:1}
//     trimester:[
//       "January"
//       "February"
//       "March"
//     ]
//     getValue: function(i)
//       return y.trimester[i]

   //public class FreeObjectLiteral extends ObjectLiteral
   //constructor
   function FreeObjectLiteral(){
       // default constructor: call super.constructor
       return ObjectLiteral.prototype.constructor.apply(this,arguments)
   };
   // FreeObjectLiteral (extends|super is) ObjectLiteral
   FreeObjectLiteral.prototype.__proto__ = ObjectLiteral.prototype;

     //method parse()
     FreeObjectLiteral.prototype.parse = function(){
       this.lock();

//get items: optional comma separated, closes on de-indent, at least one required

       this.items = this.reqSeparatedList(NameValuePair, ',');
     };
   //export
   module.exports.FreeObjectLiteral = FreeObjectLiteral;
   //end class FreeObjectLiteral



//## ParenExpression

//`ParenExpression: '(' Expression ')'`

//An expression enclosed by parentheses, like `(a + b)`.

   //public class ParenExpression extends ASTBase
   //constructor
   function ParenExpression(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // ParenExpression (extends|super is) ASTBase
   ParenExpression.prototype.__proto__ = ASTBase.prototype;

      //properties expr:Expression

     //method parse()
     ParenExpression.prototype.parse = function(){
       this.req('(');
       this.lock();
       this.expr = this.req(Expression);
       this.opt('NEWLINE');
       this.req(')');
     };
   //export
   module.exports.ParenExpression = ParenExpression;
   //end class ParenExpression


//## FunctionDeclaration

//`FunctionDeclaration: 'function [IDENTIFIER] ["(" [VariableDecl,]* ")"] [returns type-VariableRef] Body`

//Functions: parametrized pieces of callable code.

   //public class FunctionDeclaration extends ASTBase
   //constructor
   function FunctionDeclaration(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // FunctionDeclaration (extends|super is) ASTBase
   FunctionDeclaration.prototype.__proto__ = ASTBase.prototype;

      //properties
        //specifier, export, default, shim, generator
        //paramsDeclarations: VariableDecl array
        //definePropItems: DefinePropertyItem array
        //body

     //method parse()
     FunctionDeclaration.prototype.parse = function(){

       this.specifier = this.req('function', 'method');
       this.lock();

        //declare valid .parent.parent.parent
       //if .specifier is 'function' and .parent.parent.parent instanceof ClassDeclaration
       if (this.specifier === 'function' && this.parent.parent.parent instanceof ClassDeclaration) {
           this.throwError("unexpected 'function' in 'class/append' body. You should use 'method'");
       };

       this.name = this.opt('IDENTIFIER');

//get parameter members, and function body

       this.parseParametersAndBody();
     };

      //#end parse

     //method parseParametersAndBody()
     FunctionDeclaration.prototype.parseParametersAndBody = function(){

//This method is shared by functions, methods and constructors and

//`()` after `function` are optional

//parse parameter: `'(' [VariableDecl,] ')'`

       //if .opt("(")
       if (this.opt("(")) {
           this.paramsDeclarations = this.optSeparatedList(VariableDecl, ',', ')');
       };

       //if .opt('returns'), .parseType
       if (this.opt('returns')) {
           this.parseType()};

       //if .opt("[")
       if (this.opt("[")) {
           this.definePropItems = this.optSeparatedList(DefinePropertyItem, ',', ']');
       };

//now get function body

       this.body = this.req(Body);
     };
   //export
   module.exports.FunctionDeclaration = FunctionDeclaration;
   //end class FunctionDeclaration


   //public class DefinePropertyItem extends ASTBase
   //constructor
   function DefinePropertyItem(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // DefinePropertyItem (extends|super is) ASTBase
   DefinePropertyItem.prototype.__proto__ = ASTBase.prototype;

      //declare name affinity definePropItem

      //properties
        //negated:boolean

     //method parse()
     DefinePropertyItem.prototype.parse = function(){
       this.lock();
       this.negated = this.opt('not');
       this.name = this.req('enumerable', 'configurable', 'writable');
     };
   //export
   module.exports.DefinePropertyItem = DefinePropertyItem;
   //end class DefinePropertyItem



//## MethodDeclaration

//`MethodDeclaration: 'method [name] ["(" [VariableDecl,]* ")"] [returns type-VariableRef] ["["DefinePropertyItem,"]"] Body`

//A `method` is a function defined in the prototype of a class.
//A `method` has an implicit var `this` pointing to the specific instance the method is called on.

//MethodDeclaration derives from FunctionDeclaration, so both are instance of FunctionDeclaration

//Examples:
  //method concat(a:string, b:string) return string
  //method remove(element) [not enumerable, not writable, configurable]

   //public class MethodDeclaration extends FunctionDeclaration
   //constructor
   function MethodDeclaration(){
       // default constructor: call super.constructor
       return FunctionDeclaration.prototype.constructor.apply(this,arguments)
   };
   // MethodDeclaration (extends|super is) FunctionDeclaration
   MethodDeclaration.prototype.__proto__ = FunctionDeclaration.prototype;

     //method parse()
     MethodDeclaration.prototype.parse = function(){

       this.specifier = this.req('method');
       this.lock();

//require method name

        //.name = .req('IDENTIFIER') //jQuery uses 'not' and 'has' as method names
       this.name = this.lexer.token.value; //let's take any token, and check if it's valid identifier
       //if not .name like /^[a-zA-Z$_]+[0-9a-zA-Z$_]*$/, .throwError 'invalid method name: "#{.name}"'
       if (!(/^[a-zA-Z$_]+[0-9a-zA-Z$_]*$/.test(this.name))) {
           this.throwError('invalid method name: "' + this.name + '"')};
       this.lexer.nextToken();

//now parse parameters and body (as with any function)

       this.parseParametersAndBody();
     };
   //export
   module.exports.MethodDeclaration = MethodDeclaration;
   //end class MethodDeclaration

      //#end parse


//## ClassDeclaration

//`ClassDeclaration: class IDENTIFIER [[","] (extends|inherits from)] Body`

//Defines a new class with an optional parent class. properties and methods go inside the block.

   //public class ClassDeclaration extends ASTBase
   //constructor
   function ClassDeclaration(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // ClassDeclaration (extends|super is) ASTBase
   ClassDeclaration.prototype.__proto__ = ASTBase.prototype;

      //properties
        //export:boolean,default:boolean
        //varRefSuper:VariableRef
        //body

      //declare name affinity classDecl

     //method parse()
     ClassDeclaration.prototype.parse = function(){

       this.req('class');
       this.lock();

       this.name = this.req('IDENTIFIER');

//Control: class names should be Capitalized

       //if not String.isCapitalized(.name), .lexer.sayErr "class names should be Capitalized: class #{.name}"
       if (!(String.isCapitalized(this.name))) {
           this.lexer.sayErr("class names should be Capitalized: class " + this.name)};

//Now parse optional `,(proto is|extend|inherits from)` setting the super class
//(aka oop classic:'inherits', or ES6: 'extends')

       this.opt(',');
       //if .opt('extends','inherits','proto')
       if (this.opt('extends', 'inherits', 'proto')) {
         this.opt('from', 'is');
         this.varRefSuper = this.req(VariableRef);
       };

//Now get class body.

       this.body = this.opt(Body);
     };
   //export
   module.exports.ClassDeclaration = ClassDeclaration;
   //end class ClassDeclaration



//## ConstructorDeclaration

//`ConstructorDeclaration : 'constructor [new className-IDENTIFIER] ["(" [VariableDecl,]* ")"] [returns type-VariableRef] Body`

//A `constructor` is the main function of the class. In js is the function-class body  (js: `function Class(...){... `)
//The `constructor` method is called upon creation of the object, by the `new` operator.
//The return value is the value returned by `new` operator, that is: the new instance of the class.

//ConstructorDeclaration derives from MethodDeclaration, so it is also a instance of FunctionDeclaration

   //public class ConstructorDeclaration extends MethodDeclaration
   //constructor
   function ConstructorDeclaration(){
       // default constructor: call super.constructor
       return MethodDeclaration.prototype.constructor.apply(this,arguments)
   };
   // ConstructorDeclaration (extends|super is) MethodDeclaration
   ConstructorDeclaration.prototype.__proto__ = MethodDeclaration.prototype;

     //method parse()
     ConstructorDeclaration.prototype.parse = function(){

       this.specifier = this.req('constructor');
       this.lock();

       //if .opt('new') # optional: constructor new Person(name:string)
       if (this.opt('new')) {// # optional: constructor new Person(name:string)
          //# to ease reading, and to find the constructor when you search for "new Person"
         var className = this.req('IDENTIFIER');
         var classDeclaration = this.getParent(ClassDeclaration);
         //if classDeclaration and classDeclaration.name isnt className, .sayErr "Class Name mismatch #{className}/#{.parent.name}"
         if (classDeclaration && classDeclaration.name !== className) {
             this.sayErr("Class Name mismatch " + className + "/" + this.parent.name)};
       };

//now get parameters and body (as with any function)

       this.parseParametersAndBody();
     };
   //export
   module.exports.ConstructorDeclaration = ConstructorDeclaration;
   //end class ConstructorDeclaration

      //#end parse

//------------------------------

//## AppendToDeclaration

//`AppendToDeclaration: append to (class|object) VariableRef Body`

//Adds methods and properties to an existent object, e.g., Class.prototype

   //public class AppendToDeclaration extends ClassDeclaration
   //constructor
   function AppendToDeclaration(){
       // default constructor: call super.constructor
       return ClassDeclaration.prototype.constructor.apply(this,arguments)
   };
   // AppendToDeclaration (extends|super is) ClassDeclaration
   AppendToDeclaration.prototype.__proto__ = ClassDeclaration.prototype;

      //properties
        //toNamespace
        //varRef:VariableRef
        //body

     //method parse()
     AppendToDeclaration.prototype.parse = function(){

       this.req('append', 'Append');
       this.req('to');
       this.lock();

       this.toNamespace = this.req('class', 'object', 'namespace') !== 'class';

       this.varRef = this.req(VariableRef);

//Now get body.

       this.body = this.req(Body);
     };
   //export
   module.exports.AppendToDeclaration = AppendToDeclaration;
   //end class AppendToDeclaration


//## NamespaceDeclaration

//`NamespaceDeclaration: namespace IDENTIFIER Body`

//creates a object with methods, properties and classes

   //public class NamespaceDeclaration extends AppendToDeclaration
   //constructor
   function NamespaceDeclaration(){
       // default constructor: call super.constructor
       return AppendToDeclaration.prototype.constructor.apply(this,arguments)
   };
   // NamespaceDeclaration (extends|super is) AppendToDeclaration
   NamespaceDeclaration.prototype.__proto__ = AppendToDeclaration.prototype;

     //method parse()
     NamespaceDeclaration.prototype.parse = function(){

       this.req('namespace', 'Namespace');
       //if .opt('properties'), .throwParseFailed "is properties"
       if (this.opt('properties')) {
           this.throwParseFailed("is properties")};

       this.lock();
       this.toNamespace = true;
       this.varRef = this.req(VariableRef);

//Now get body.

       this.body = this.req(Body);
     };
   //export
   module.exports.NamespaceDeclaration = NamespaceDeclaration;
   //end class NamespaceDeclaration



//## DebuggerStatement

//`DebuggerStatement: debugger`

//When a debugger is attached, break at this point.

   //public class DebuggerStatement extends ASTBase
   //constructor
   function DebuggerStatement(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // DebuggerStatement (extends|super is) ASTBase
   DebuggerStatement.prototype.__proto__ = ASTBase.prototype;
     //method parse()
     DebuggerStatement.prototype.parse = function(){
       this.name = this.req("debugger");
     };
   //export
   module.exports.DebuggerStatement = DebuggerStatement;
   //end class DebuggerStatement



//CompilerStatement
//-----------------

//`compiler` is a generic entry point to alter LiteScript compiler from source code.
//It allows conditional complilation, setting compiler options, define macros(*)
//and also allow the programmer to hook transformations on the compiler process itself(*).

//(*) Not yet.

//`CompilerStatement: (compiler|compile) (set|if|debugger|option) Body`

//`set-CompilerStatement: compiler set (VariableDecl,)`

//`conditional-CompilerStatement: 'compile if IDENTIFIER Body`

   //public class CompilerStatement extends ASTBase
   //constructor
   function CompilerStatement(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // CompilerStatement (extends|super is) ASTBase
   CompilerStatement.prototype.__proto__ = ASTBase.prototype;

      //properties
        //kind, conditional:string
        //list, body
        //importStatement
        //endLineInx

     //method parse()
     CompilerStatement.prototype.parse = function(){

        //declare list:VariableDecl array

       this.req('compiler', 'compile');
       this.lock();

//### compiler ImportStatement

       this.kind = this.lexer.token.value;

       //if .kind is 'import'
       if (this.kind === 'import') {
         this.importStatement = this.req(ImportStatement);
         return;
       };

//### others

       this.kind = this.req('set', 'if', 'debugger', 'options');

//### compiler set

       //if .kind is 'set'
       if (this.kind === 'set') {

//get list of declared names, add to root node 'Compiler Vars'

           this.list = this.reqSeparatedList(VariableDecl, ',');
       }

//### compiler if conditional compilation
       
       else if (this.kind === 'if') {

         this.conditional = this.req('IDENTIFIER');

         //if .compilerVar(.conditional)
         if (this.compilerVar(this.conditional)) {
             this.body = this.req(Body);
         }
         
         else {
            //skip block
           //do
           do{
             this.lexer.nextToken();
           } while (!(this.lexer.indent <= this.indent));//end loop
           
         };
       }


//### other compile options
       
       else if (this.kind === 'debugger') {// #debug-pause the compiler itself, to debug compiling process
         //debugger
         debugger;
       }
       
       else {
         this.sayErr('invalid compiler command');
       };
     };
   //export
   module.exports.CompilerStatement = CompilerStatement;
   //end class CompilerStatement


//## Import Statement

//`ImportStatement: import (ImportStatementItem,)`

//Example: `import fs, path` ->  js:`var fs=require('fs'),path=require('path')`

//Example: `import http, wait from 'wait.for'` ->  js:`var http=require('http'),wait=require('wait.for')`

   //public class ImportStatement extends ASTBase
   //constructor
   function ImportStatement(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // ImportStatement (extends|super is) ASTBase
   ImportStatement.prototype.__proto__ = ASTBase.prototype;

      //properties
        //global:boolean
        //list: ImportStatementItem array

     //method parse()
     ImportStatement.prototype.parse = function(){

       this.req('import');
       this.lock();
       this.list = this.reqSeparatedList(ImportStatementItem, ",");

//keep track of `import/require` calls

       var parentModule = this.getParent(Module);
       //for each item in .list
       for( var item__inx=0,item ; item__inx<this.list.length ; item__inx++){item=this.list[item__inx];
       
           parentModule.requireCallNodes.push(item);
       }; // end for each in this.list
       
     };
   //export
   module.exports.ImportStatement = ImportStatement;
   //end class ImportStatement


   //export class ImportStatementItem extends ASTBase
   //constructor
   function ImportStatementItem(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // ImportStatementItem (extends|super is) ASTBase
   ImportStatementItem.prototype.__proto__ = ASTBase.prototype;

//`ImportStatementItem: IDENTIFIER [from STRING]`

//Example: `import http, wait from 'wait.for'` ->  node.js:`var http=require('http'),wait=require('wait.for')`

      //properties
        //importParameter:StringLiteral

     //method parse()
     ImportStatementItem.prototype.parse = function(){

       this.name = this.req('IDENTIFIER');
       //if .opt('from')
       if (this.opt('from')) {
           this.lock();
           this.importParameter = this.req(StringLiteral);
       };
     };
   //export
   module.exports.ImportStatementItem = ImportStatementItem;
   //end class ImportStatementItem


   //export class DeclareStatement extends ASTBase
   //constructor
   function DeclareStatement(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // DeclareStatement (extends|super is) ASTBase
   DeclareStatement.prototype.__proto__ = ASTBase.prototype;

//#### DeclareStatement

//Declare statement allows you to forward-declare variable or object members.
//Also allows to declare the valid properties for externally created objects
//when you dont want to create a class to use as type.

//`DeclareStatement: declare ([types]|global|forward|on IDENTIFIER) (VariableDecl,)+`
//`DeclareStatement: declare name affinity (IDENTIFIER,)+`

//#####Declare types
//`DeclareStatement: declare [types] (VariableDecl,)+`

//To declare valid types for scope vars:

//Example:
    //declare types name:string, parent:NameDeclaration

//#####Declare valid
//`DeclareStatement: declare valid IDENTIFIER ("."IDENTIFIER|"()"|"[]")*`

//To declare valid chains

//Example:
    //declare valid .type[].name.name

//#####Declare name affinity
//`DeclareStatement: name affinity (IDENTIFIER,)+`

//To de used inside a class declaration, declare var names that will default to Class as type

//Example
    //Class NameDeclaration
      //properties
        //name: string, sourceLine, column
      //**declare name affinity nameDecl**

//Given the above declaration, any `var` named (or ending in) **"nameDecl"** or **"nameDeclaration"**
//will assume `:NameDeclaration` as type. (Class name is automatically included in 'name affinity')

//Example:

//`var nameDecl, parentNameDeclaration, childNameDecl, nameDeclaration`

//all three vars will assume `:NameDeclaration` as type.

//#####global Declare
//`DeclareStatement: global declare (VariableDecl,)+`

//To declare global, externally created vars. Example: `declare global logMessage, colors`

//#####Declare on
//`DeclareStatement: declare on IDENTIFIER (VariableDecl,)+` #declare members on vars

//To declare valid members on scope vars.

//#### DeclareStatement body

      //properties
        //varRef: VariableRef
        //names: VariableDecl array
        //specifier
        //global:boolean
        //type: VariableRef

     //method parse()
     DeclareStatement.prototype.parse = function(){

       this.req('declare');
       this.lock();

       this.names = [];

//check 'on|valid|forward|global'

       this.specifier = this.opt('on');
       //if .specifier
       if (this.specifier) {

//Find the main name where this properties are being declared. Read names

           this.name = this.req('IDENTIFIER');
           this.names = this.reqSeparatedList(VariableDecl, ',');
           return;
       };

//check 'valid'

       this.specifier = this.opt('valid');
       //if .specifier
       if (this.specifier) {
           this.varRef = this.req(VariableRef);
           //if no .varRef.accessors, .sayErr "declare valid: expected accesor chain. Example: 'declare valid name.member.member'"
           if (!this.varRef.accessors) {
               this.sayErr("declare valid: expected accesor chain. Example: 'declare valid name.member.member'")};
           //if .opt(':'), .parseType //optional type
           if (this.opt(':')) {
               this.parseType()};
           return;
       };

//check 'name affinity', if not, must be: global|forward|types(default)

       //if .opt('name')
       if (this.opt('name')) {
         this.specifier = this.req('affinity');
       }
       
       else {
         this.specifier = this.opt('global') || 'types';
       };

//all of them get a (VariableDecl,)+

       this.names = this.reqSeparatedList(VariableDecl, ',');

//check syntax

       //for each varDecl in .names
       for( var varDecl__inx=0,varDecl ; varDecl__inx<this.names.length ; varDecl__inx++){varDecl=this.names[varDecl__inx];
       
          //if .specifier is 'affinity' and varDecl.type or varDecl.assignedValue
          if (this.specifier === 'affinity' && varDecl.type || varDecl.assignedValue) {
             this.sayErr("declare name affinity: expected 'name,name,...'");
          };
       }; // end for each in this.names

       return;
     };
   //export
   module.exports.DeclareStatement = DeclareStatement;
   //end class DeclareStatement


//## DefaultAssignment

//`DefaultAssignment: default AssignmentStatement`

//It is a common pattern in javascript to use a object parameters (named "options")
//to pass misc options to functions.

//Litescript provide a 'default' construct as syntax sugar for this common pattern

//The 'default' construct is formed as an ObjectLiteral assignment,
//but only the 'undfined' properties of the object will be assigned.


//    function theApi(object,options,callback)

//      default options =
//        log: console.log
//        encoding: 'utf-8'
//        throwErrors: true
//        debug:
//          enabled: false
//          level: 2
//      end default

//      ...function body...

//    end function
//is equivalent to js's:


//    function theApi(object,options,callback) {

//        //defaults
//        if (!options) options = {};
//        if (options.log===undefined) options.log = console.log;
//        if (options.encoding===undefined) options.encoding = 'utf-8';
//        if (options.throwErrors===undefined) options.throwErrors=true;
//        if (!options.debug) options.debug = {};
//        if (options.debug.enabled===undefined) options.debug.enabled=false;
//        if (options.debug.level===undefined) options.debug.level=2;

//        ...function body...
//    }

   //public class DefaultAssignment extends ASTBase
   //constructor
   function DefaultAssignment(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // DefaultAssignment (extends|super is) ASTBase
   DefaultAssignment.prototype.__proto__ = ASTBase.prototype;

      //properties
        //assignment: AssignmentStatement

     //method parse()
     DefaultAssignment.prototype.parse = function(){

       this.req('default');
       this.lock();

       this.assignment = this.req(AssignmentStatement);
     };
   //export
   module.exports.DefaultAssignment = DefaultAssignment;
   //end class DefaultAssignment



//## End Statement

//`EndStatement: end (IDENTIFIER)* NEWLINE`

//`end` is an **optional** end-block marker to ease code reading.
//It marks the end of code blocks, and can include extra tokens referencing the construction
//closed. (in the future) This references will be cross-checked, to help redude subtle bugs
//by checking that the block ending here is the intended one.

//If it's not used, the indentation determines where blocks end ()

//Example: `end if` , `end loop`, `end for each item`

//Usage Examples:


//    if a is 3 and b is 5
//      print "a is 3"
//      print "b is 5"
//    end if

//    loop while a < 10
//      a++
//      b++
//    end loop

   //public class EndStatement extends ASTBase
   //constructor
   function EndStatement(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // EndStatement (extends|super is) ASTBase
   EndStatement.prototype.__proto__ = ASTBase.prototype;

      //properties
        //references:string array

     //method parse()
     EndStatement.prototype.parse = function(){

       this.req('end');

       this.lock();
       this.references = [];

//The words after `end` are just 'loose references' to the block intended to be closed
//We pick all the references up to EOL (or EOF)

       //while not .opt('NEWLINE','EOF')
       while(!(this.opt('NEWLINE', 'EOF'))){

//Get optional identifier reference
//We save `end` references, to match on block indentation,
//for Example: `end for` indentation must match a `for` statement on the same indent

           //if .lexer.token.type is 'IDENTIFIER'
           if (this.lexer.token.type === 'IDENTIFIER') {
             this.references.push(this.lexer.token.value);
           };

           this.lexer.nextToken();
       };//end loop
       
     };
   //export
   module.exports.EndStatement = EndStatement;
   //end class EndStatement

        //#end loop


//## WaitForAsyncCall

//`WaitForAsyncCall: wait for fnCall-VariableRef`

//The `wait for` expression calls a normalized async function
//and `waits` for the async function to execute the callback.

//A normalized async function is an async function with the last parameter = callback(err,data)

//The waiting is implemented by exisiting libs.

//Example: `contents = wait for fs.readFile('myFile.txt','utf8')`

   //public class WaitForAsyncCall extends ASTBase
   //constructor
   function WaitForAsyncCall(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // WaitForAsyncCall (extends|super is) ASTBase
   WaitForAsyncCall.prototype.__proto__ = ASTBase.prototype;

      //properties
        //varRef

     //method parse()
     WaitForAsyncCall.prototype.parse = function(){

       this.req('wait');
       this.lock();

       this.req('for');
       this.varRef = this.req(VariableRef);
     };
   //export
   module.exports.WaitForAsyncCall = WaitForAsyncCall;
   //end class WaitForAsyncCall


//LaunchStatement
//---------------

//`LaunchStatement: 'launch' fnCall-VariableRef`

//`launch` starts a generator function.
//The generator function rus as a co-routine, (pseudo-parallel),
//and will be paused on `wait for` statements.

//The `launch` statement will return on the first `wait for` or `yield` of the generator

   //public class LaunchStatement extends ASTBase
   //constructor
   function LaunchStatement(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // LaunchStatement (extends|super is) ASTBase
   LaunchStatement.prototype.__proto__ = ASTBase.prototype;

      //properties
        //varRef

     //method parse()
     LaunchStatement.prototype.parse = function(){

       this.req('launch');
       this.lock();

       this.varRef = this.req(VariableRef);
     };
   //export
   module.exports.LaunchStatement = LaunchStatement;
   //end class LaunchStatement


//Adjective
//---------

//`Adjective: (export|generator|shim|helper|global)`

   //public class Adjective extends ASTBase
   //constructor
   function Adjective(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // Adjective (extends|super is) ASTBase
   Adjective.prototype.__proto__ = ASTBase.prototype;

    //method parse()
    Adjective.prototype.parse = function(){

       this.name = this.req('public', 'export', 'default', 'global', 'generator', 'shim', 'helper');
    };


    //helper method validate(statement)
    Adjective.prototype.validate = function(statement){
//Check validity of adjective-statement combination

       var CFVN = ['class', 'function', 'var', 'namespace'];

       var validCombinations = {
             export: CFVN, 
             public: CFVN, 
             default: CFVN, 
             generator: ['function', 'method'], 
             shim: ['function', 'method', 'class'], 
             helper: ['function', 'method', 'class'], 
             global: ['import', 'declare']
             };

        //declare valid:array
        //declare valid statement.keyword

       var valid = validCombinations[this.name] || ['-*none*-'];
       //if not (statement.keyword in valid)
       if (!((valid.indexOf(statement.keyword)>=0))) {
           this.throwError("'" + this.name + "' can only apply to " + (valid.join('|')) + " not to '" + statement.keyword + "'");
       };

//Also convert adjectives to Statement node properties to ease code generation.

       statement[this.name] = true;

//'public' is just alias for 'export'

        //declare valid statement.export
       //if .name is 'public', statement.export = true
       if (this.name === 'public') {
           statement.export = true};

//set module.exportDefault if 'export default' or 'public default' was parsed

        //declare valid statement.default
       //if statement.export and statement.default
       if (statement.export && statement.default) {
           var moduleNode = this.getParent(Module);
           //if moduleNode.exportDefault, .throwError "only one 'export default' can be defined"
           if (moduleNode.exportDefault) {
               this.throwError("only one 'export default' can be defined")};
           moduleNode.exportDefault = statement;
       };
    };
   //export
   module.exports.Adjective = Adjective;
   //end class Adjective


//FunctionCall
//------------

//`FunctionCall: VariableRef ["("] (Expression,) [")"]`

   //public class FunctionCall extends ASTBase
   //constructor
   function FunctionCall(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // FunctionCall (extends|super is) ASTBase
   FunctionCall.prototype.__proto__ = ASTBase.prototype;

      //properties
          //varRef: VariableRef

     //method parse(options)
     FunctionCall.prototype.parse = function(options){

        //declare valid .parent.preParsedVarRef
        //declare valid .name.executes

//Check for VariableRef. - can include (...) FunctionAccess

       //if .parent.preParsedVarRef #VariableRef already parsed
       if (this.parent.preParsedVarRef) {// #VariableRef already parsed
         this.varRef = this.parent.preParsedVarRef;// #use it
       }
       
       else {
         this.varRef = this.req(VariableRef);
       };

//if the last accessor is function call, this is already a FunctionCall

       //if .varRef.executes
       if (this.varRef.executes) {
           return;// #already a function call
       };

//Here we assume is a function call without parentheses, a 'command'

       //if .lexer.token.type in ['NEWLINE','EOF']
       if (['NEWLINE', 'EOF'].indexOf(this.lexer.token.type)>=0) {
          //# no more tokens, let's asume FnCall w/o parentheses and w/o parameters
         return;
       };

//else, get parameters, add to varRef as FunctionAccess accessor

       var functionAccess = new FunctionAccess(this.varRef);
       functionAccess.args = functionAccess.optSeparatedList(Expression, ",");

       this.varRef.addAccessor(functionAccess);
     };
   //export
   module.exports.FunctionCall = FunctionCall;
   //end class FunctionCall


//## SwitchStatement

//`SwitchStatement: switch [VariableRef] (case (Expression,) ":" Body)* [default Body]`

//Similar to js switch, but:
//1. no fall-through
//2. each 'case' can have several expressions, comma separated, then ':'
//3. if no var specified, select first true expression

//See Also: [CaseWhenExpression]

//Examples:

  //switch a
    //case 2,4,6:
      //print 'even'
    //case 1,3,5:
      //print 'odd'
    //default:
      //print 'idk'

  //switch
    //case a is 3 or b < 10:
      //print 'option 1'
    //case b >= 10, a<0, c is 5:
      //print 'option 2'
    //default:
      //print 'other'


   //public class SwitchStatement extends ASTBase
   //constructor
   function SwitchStatement(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // SwitchStatement (extends|super is) ASTBase
   SwitchStatement.prototype.__proto__ = ASTBase.prototype;

      //properties
        //varRef
        //cases: SwitchCase array
        //defaultBody: Body

     //method parse()
     SwitchStatement.prototype.parse = function(){

       this.req('switch');
       this.lock();

       this.varRef = this.opt(VariableRef);

       this.cases = [];

//Loop processing: 'NEWLINE','case' or 'default'

       //do until .lexer.token.type is 'EOF'
       while(!(this.lexer.token.type === 'EOF')){

           var keyword = this.req('case', 'default', 'NEWLINE');

//on 'case', get a comma separated list of expressions, ended by ":"
//and a "Body". Push both on .cases[]

           //if keyword is 'case'
           if (keyword === 'case') {
               this.cases.push(this.req(SwitchCase));
           }

//else, on 'default', get default body, and break loop
           
           else if (keyword === 'default') {
               this.opt(":");
               this.defaultBody = this.req(Body);
               //break;
               break;
           };
       };//end loop

       //if no .cases.length, .throwError "no 'case' found after 'switch'"
       if (!this.cases.length) {
           this.throwError("no 'case' found after 'switch'")};
     };
   //export
   module.exports.SwitchStatement = SwitchStatement;
   //end class SwitchStatement


   //public helper class SwitchCase extends ASTBase
   //constructor
   function SwitchCase(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // SwitchCase (extends|super is) ASTBase
   SwitchCase.prototype.__proto__ = ASTBase.prototype;
//Helper class to parse each case

        //properties
            //expressions: Expression array
            //body

//...a comma separated list of expressions, ended by ":", and a "Body"

       //method parse()
       SwitchCase.prototype.parse = function(){
           this.expressions = this.reqSeparatedList(Expression, ",", ":");
           this.body = this.req(Body);
       };
   //export
   module.exports.SwitchCase = SwitchCase;
   //end class SwitchCase


//## CaseWhenExpression

//`CaseWhenExpression: case [VariableRef] (when (Expression,) then Expression)* [else Expression] end`

//Similar to ANSI-SQL 'CASE', and ruby's 'case'

//Examples:

  //print case b
          //when 2,4,6 then 'even'
          //when 1,3,5 then 'odd'
          //else 'idk'
        //end

  //var result = case
          //when a is 3 or b < 10 then 'option 1'
          //when b >= 10 or a<0 or c is 5 then 'option 2'
          //else 'other'
        //end


   //public class CaseWhenExpression extends ASTBase
   //constructor
   function CaseWhenExpression(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // CaseWhenExpression (extends|super is) ASTBase
   CaseWhenExpression.prototype.__proto__ = ASTBase.prototype;

      //properties
        //varRef
        //cases: CaseWhenSection array
        //elseExpression: Expression

     //method parse()
     CaseWhenExpression.prototype.parse = function(){

       this.req('case');
       this.lock();

       this.varRef = this.opt(VariableRef);

       this.cases = [];

//Loop processing: 'NEWLINE','when' or 'else' until 'end'

       //do until .lexer.token.value is 'end'
       while(!(this.lexer.token.value === 'end')){

           var keyword = this.req('NEWLINE', 'when', 'else');

//on 'case', get a comma separated list of expressions, ended by ":"
//and a "Body". Push both on .cases[]

           //if keyword is 'when'
           if (keyword === 'when') {
               this.cases.push(this.req(CaseWhenSection));
           }

//else, on 'default', get default body, and break loop
           
           else if (keyword === 'else') {
               this.elseExpression = this.req(Expression);
               //break; #no more cases allowed after else
               break;// #no more cases allowed after else
           };
       };//end loop

//check if there are cases. Require 'end'

       //if no .cases.length, .throwError "no 'when' found after 'case'"
       if (!this.cases.length) {
           this.throwError("no 'when' found after 'case'")};

       this.opt('NEWLINE');
       this.req('end');
     };
   //export
   module.exports.CaseWhenExpression = CaseWhenExpression;
   //end class CaseWhenExpression


   //public helper class CaseWhenSection extends ASTBase
   //constructor
   function CaseWhenSection(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // CaseWhenSection (extends|super is) ASTBase
   CaseWhenSection.prototype.__proto__ = ASTBase.prototype;
//Helper class to parse each case

        //properties
            //parent:CaseWhenExpression
            //expressions: Expression array
            //booleanExpression
            //resultExpression

//if there is a var, we allow a list of comma separated expressions to compare to.
//If there is no var, we allow a single boolean-Expression.
//After: 'then', and the result-Expression

       //method parse()
       CaseWhenSection.prototype.parse = function(){

           //if .parent.varRef
           if (this.parent.varRef) {
               this.expressions = this.reqSeparatedList(Expression, ",");
           }
           
           else {
               this.booleanExpression = this.req(Expression);
           };

           this.req('then');
           this.resultExpression = this.req(Expression);
       };
   //export
   module.exports.CaseWhenSection = CaseWhenSection;
   //end class CaseWhenSection



//Statement
//---------

//A `Statement` is an imperative statment (command) or a control construct.

//The `Statement` node is a generic container for all previously defined statements.


//The generic `Statement` is used to define `Body: (Statement;)`, that is,
//**Body** is a list of semicolon (or NEWLINE) separated **Statements**.

//`Statement: [Adjective]* (ClassDeclaration|FunctionDeclaration
 //|IfStatement|ForStatement|WhileUntilLoop|DoLoop
 //|AssignmentStatement
 //|LoopControlStatement|ThrowStatement
 //|TryCatch|ExceptionBlock
 //|ReturnStatement|PrintStatement|DoNothingStatement)`

//`Statement: ( AssignmentStatement | fnCall-VariableRef [ ["("] (Expression,) [")"] ] )`

   //public class Statement extends ASTBase
   //constructor
   function Statement(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // Statement (extends|super is) ASTBase
   Statement.prototype.__proto__ = ASTBase.prototype;

      //properties
        //adjectives: Adjective array
        //statement
        //preParsedVarRef
        //intoVars

     //method parse()
     Statement.prototype.parse = function(){

        //#debug show line and tokens
       debug("");
       this.lexer.infoLine.dump();

//First, fast-parse the statement by using a table.
//We look up the token (keyword) in **StatementsDirect** table, and parse the specific AST node

       this.statement = this.parseDirect(this.lexer.token.value, StatementsDirect);
       //if no .statement
       if (!this.statement) {

//If it was not found, try optional adjectives (zero or more). Adjectives precede statement keyword.
//Recognized adjectives are: `(export|public|generator|shim|helper)`.

         this.adjectives = this.optList(Adjective);

//Now re-try fast-parse

         this.statement = this.parseDirect(this.lexer.token.value, StatementsDirect);
         //if no .statement
         if (!this.statement) {

//Last possibilities are: FunctionCall or AssignmentStatement
//both start with a VariableRef:

//(performance) **require** & pre-parse the VariableRef.
//Then we require a AssignmentStatement or FunctionCall

           this.preParsedVarRef = this.req(VariableRef);
           this.statement = this.req(AssignmentStatement, FunctionCall);
           this.preParsedVarRef = undefined;// #clear
         };
       };

        //#end if - statement parse tries

//If we reached here, we have parsed a valid statement.
//Check validity of adjective-statement combination

       //if .adjectives
       if (this.adjectives) {
         //for each adj in .adjectives
         for( var adj__inx=0,adj ; adj__inx<this.adjectives.length ; adj__inx++){adj=this.adjectives[adj__inx];
         
           adj.validate(this.statement);
         }; // end for each in this.adjectives
         
       };
     };
   //export
   module.exports.Statement = Statement;
   //end class Statement



//## Body

//`Body: (Statement;)`

//Body is a semicolon-separated list of statements (At least one)

//`Body` is used for "Module" body, "class" body, "function" body, etc.
//Anywhere a list of semicolon separated statements apply.

   //public class Body extends ASTBase
   //constructor
   function Body(){
       // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // Body (extends|super is) ASTBase
   Body.prototype.__proto__ = ASTBase.prototype;

      //properties
        //statements: Statement array

     //method parse()
     Body.prototype.parse = function(){

       //if .lexer.interfaceMode
       if (this.lexer.interfaceMode) {
           //if .parent.constructor not in [ClassDeclaration,AppendToDeclaration,NamespaceDeclaration]
           if ([ClassDeclaration, AppendToDeclaration, NamespaceDeclaration].indexOf(this.parent.constructor)===-1) {
               return;// #no 'Bodys' expected on interface.md file except for the above
           };
       };

       //if .lexer.token.type isnt 'NEWLINE'
       if (this.lexer.token.type !== 'NEWLINE') {
           this.lexer.sayErr("found " + this.lexer.token + " but expected NEWLINE and indented body");
       };

//We use the generic ***ASTBase.reqSeparatedList*** to get a list of **Statement** symbols,
//*semicolon* separated or in freeForm mode: one statement per line, closed when indent changes.

       this.statements = this.reqSeparatedList(Statement, ";");
     };
   //export
   module.exports.Body = Body;
   //end class Body


//## Single Line Statement

//This construction is used when a statement is expected on the same line.
//It is used by `IfStatement: if conditon-Expression (','|then) *SingleLineStatement*`
//It is also used for the increment statemenf in for-while loops:`for x=0; while x<10 [,SingleLineStatement]`

   //public class SingleLineStatement extends Statement
   //constructor
   function SingleLineStatement(){
       // default constructor: call super.constructor
       return Statement.prototype.constructor.apply(this,arguments)
   };
   // SingleLineStatement (extends|super is) Statement
   SingleLineStatement.prototype.__proto__ = Statement.prototype;

      //properties
        //statements: Statement array

     //method parse()
     SingleLineStatement.prototype.parse = function(){

//if .lexer.token.type is 'NEWLINE'
//          .lexer.returnToken()
//          .lock()
//          .lexer.sayErr "Expected statement on the same line after '#{.lexer.token.value}'"
//        
        //# normally: ReturnStatement, ThrowStatement, PrintStatement, AssignmentStatement
        //# but we parse any Statement up to NEWLINE

       this.statements = this.reqSeparatedList(Statement, ";", 'NEWLINE');
       this.lexer.returnToken();// #return closing NEWLINE
     };
   //export
   module.exports.SingleLineStatement = SingleLineStatement;
   //end class SingleLineStatement

//## Module

//The `Module` represents a complete source file.

   //public class Module extends Body
   //constructor
   function Module(){
       // default constructor: call super.constructor
       return Body.prototype.constructor.apply(this,arguments)
   };
   // Module (extends|super is) Body
   Module.prototype.__proto__ = Body.prototype;

      //properties
        //exportDefault: ASTBase

     //method parse()
     Module.prototype.parse = function(){

//We start by locking. There is no other construction to try,
//if Module.parse() fails we abort compilation.

         this.lock();

//Get Module body: Statements, separated by NEWLINE|';' closer:'EOF'

         this.statements = this.optFreeFormList(Statement, ';', 'EOF');
     };
   //export
   module.exports.Module = Module;
   //end class Module

      //#end Module parse


//----------------------------------------

//Table-based (fast) Statement parsing
//------------------------------------

//This a extension to PEGs.
//To make the compiler faster and easier to debug, we define an
//object with name-value pairs: `"keyword" : AST node class`

//We look here for fast-statement parsing, selecting the right AST node to call `parse()` on
//based on `token.value`. (instead of parsing by ordered trial & error)

//This table makes a direct parsing of almost all statements, thanks to a core definition of LiteScript:
//Anything standing aline in it's own line, its an imperative statement (it does something, it produces effects).

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
     'wait': WaitForAsyncCall, 
     'launch': LaunchStatement
     };


   var AccessorsDirect = {
       '.': PropertyAccess, 
       '[': IndexAccess, 
       '(': FunctionAccess
       };


   //export helper function autoCapitalizeCoreClasses(name:string) returns String
   function autoCapitalizeCoreClasses(name){
      //#auto-capitalize core classes when used as type annotations
     //if name in ['string','array','number','object','function','boolean']
     if (['string', 'array', 'number', 'object', 'function', 'boolean'].indexOf(name)>=0) {
       return name.slice(0, 1).toUpperCase() + name.slice(1);
     };
     return name;
   };
   //export
   module.exports.autoCapitalizeCoreClasses=autoCapitalizeCoreClasses;


   //append to class ASTBase
   
     //helper method parseType
     ASTBase.prototype.parseType = function(){

        //#parse type declaration: type-IDENTIFIER [array]

       //if .opt('function') #function as type declaration
       if (this.opt('function')) {// #function as type declaration
           //if .opt('(')
           if (this.opt('(')) {
                //declare valid .paramsDeclarations
               this.paramsDeclarations = this.optSeparatedList(VariableDecl, ',', ')');
           };
           this.type = new VariableRef(this, 'function');
       }
       
       else {
         this.type = this.req(VariableRef);// #reference to an existing class
       };

        //#auto-capitalize core classes
        //declare valid .type.name
       this.type.name = autoCapitalizeCoreClasses(this.type.name);

        //# check for 'array', e.g.: `var list : string array`
       //if .opt('Array','array')
       if (this.opt('Array', 'array')) {
           this.itemType = this.type;// #assign as sub-type
           this.type = 'Array';
       };
     };



//###re-export ASTBase

   exports.ASTBase = ASTBase;

