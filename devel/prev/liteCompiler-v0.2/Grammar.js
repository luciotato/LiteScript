//LiteScript Grammar
//==================

//The LiteScript Grammar is based on [Parsing Expression Grammars (PEGs)](http://en.wikipedia.org/wiki/Parsing_expression_grammar)
//*with extensions*.

//The LiteScript Grammar is defined as `classes`, one class for each non-terminal symbol.

//The `.parse()` method of each class will try the grammar on the token stream and:
//* If all tokens match, it will simply return after consuming the tokens. (success)
//* On a token mismatch, it will raise a 'parse failed' exception.

//When a 'parse failed' exception is raised, other classes can be tried.
//If none parses ok, a compiler error is emitted and compilation is aborted.

//if the error is *before* the class has determined this was the right language construction,
//it is a soft-error and other grammars can be tried over the source code.

//if the error is *after* the class has determined this was the right language construction
//(if the node was 'locked'), it is a hard-error and compilation is aborted.

//The `ASTBase` module defines the base class for the grammar classes along with
//utility methods to **req**uire tokens and allow **opt**ional ones.

   var ASTBase = require('./ASTBase');
   var Lexer = require('./Lexer');

       //compiler set sourceMap = false
    //compiler set sourceMap = false

    //declare global process
    //declare on process exit

    //# forward declares

    //declare forward
      //StatementsDirect,FunctionAccess

    //declare forward
      //Module, Expression, FreeObjectLiteral, NameValuePair
      //SingleLineStatement, Body, ExceptionBlock
      //ElseIfStatement, ElseStatement, ForEachProperty
      //ForIndexNumeric, ForEachInArray
      //VariableRef, FunctionDeclaration
      //ParenExpression,ArrayLiteral,ObjectLiteral
      //StringLiteral, NumberLiteral, RegExpLiteral
      //ClassDeclaration,AppendToDeclaration,Adjective


//Reserved Words
//----------------------

//Words that are reserved in LiteScript and cannot be used as variable or function names
//(There are no restrictions to object property names)

   var RESERVED_WORDS = ['function', 'class', 'method', 'constructor', 'prototype', 'if', 'then', 'else', 'null', 'true', 'false', 'undefined', 'and', 'or', 'but', 'no', 'not', 'has', 'property', 'properties', 'new', 'is', 'isnt', 'do', 'loop', 'while', 'until', 'for', 'to', 'break', 'continue', 'return', 'try', 'catch', 'throw', 'raise', 'fail', 'exception', 'finally', 'with', 'arguments', 'in', 'instanceof', 'typeof', 'var', 'let', 'default', 'delete', 'interface', 'implements', 'yield', 'me', 'this', 'super', 'public', 'compiler', 'compile', 'debugger'];


//Operators precedence
//--------------------

//The order of symbols in `operatorsPrecedence`,  determines operators precedence

   var operatorsPrecedence = ['++', '--', 'unary -', 'unary +', '~', '&', '^', '|', '>>', '<<', 'new', 'type of', 'instance of', 'has property', 'no', '*', '/', '%', '+', '-', 'in', '>', '<', '>=', '<=', 'is', '<>', 'not', 'and', 'but', 'or', '?', ':'];

//--------------------------------------

//Grammar Meta-Syntax
//===================

//Each Grammar class parsing code, contains a 'grammar definition' as reference.
//The meta-syntax for the grammar definitions is
//an extended form of [Parsing Expression Grammars (PEGs)](http://en.wikipedia.org/wiki/Parsing_expression_grammar)

//The differences with classic PEG are:
//* instead of **Symbol <- definition**, we use **Symbol: definition**
//* we use **[Symbol]** for optional symbols instead of **Symbol?** (brackets also groups symbols, the entire group is optional)
//* symbols upper/lower case carries meaning
//* we add **,|; Separated List** as a syntax option

//Examples:

//`IfStatement`    : CamelCase is reserved for non-terminal symbol
//`function`       : all-lowercase means the literal word
//`":"`            : literal symbols are quoted

//`IDENTIFIER`,`OPER` : all-uppercase denotes entire classes of symbols
//`NEWLINE`,`EOF`     : or special unprintable characters

//`[of]`               : Optional symbols are enclosed in brackets
//`(var|let)`          : The vertical bar represents ordered alternatives
//`(Oper Operand)`     : Parentheses groups symbols
//`(Oper Operand)*`    : Asterisk after a group `()*` means the group can repeat (one or more)
//`[Oper Operand]*`    : Asterisk after a optional group `[]*` means zero or more of the group

//`"(" [Expression,] ")"` : the comma means a comma "Separated List". When a "Separated List" is accepted,
                         //also a *free-form* is accepted

//`Body: (Statement;)` : the semicolon means: a semicolon "Separated List". When a "Separated List" is accepted,
                         //also a *free-form* is accepted

//"Separated List"
//----------------

//Example: `FunctionCall: IDENTIFIER "(" [Expression,] ")"`

//`[Expression,]` means *optional* **comma "Separated List"** of Expressions. When the comma is
//inside a **[]** group, it means the entire list is optional.

//Example: `VarStatement: (VariableDecl,)`

//`(VariableDecl,)` means **comma "Separated List"** of `VariableDecl` (`VariableDecl: IDENTIFIER ["=" Expresion]`).
//When the comma is inside a **()** group, it means one or more of the group

//At every point where a "Separated List" is accepted, also
//a "**free-form** Separated List" is accepted.

//In *free-form* mode, each item stands on its own line, and separators (comma/semicolon)
//are optional and can appear after or before the NEWLINE.

//For example, given the previous example: `VarStatement: var (VariableDecl,)`,
//all of the following constructions are equivalent and valid in LiteScript:

//Examples:



//    // standard js

//    var a = {prop1:30 prop2: { prop2_1:19, prop2_2:71} arr:["Jan","Feb","Mar"]}


//    //mixed freeForm and comma separated

//    var a =
//        prop1: 30

//        prop2:
//          prop2_1: 19
//          prop2_2: 71

//        arr: [ "Jan",
//              "Feb", "Mar"]


//    //in freeForm, commas are optional

//    var a = {
//        prop1: 30
//        prop2:
//          prop2_1: 19,
//          prop2_2: 71,
//        arr: [
//            "Jan",
//            "Feb"
//            "Mar"
//            ]
//        }


//--------------------------

//LiteScript Grammar - AST Classes
//================================


//PrintStatement
//--------------

//`PrintStatement: 'print' [Expression,]`

//This handles `print` followed by am optional comma separated list of expressions

   //class PrintStatement, extends|super is ASTBase, constructor:
   function PrintStatement(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // PrintStatement (extends|super is) ASTBase
   PrintStatement.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

      //properties
        //args

     //method parse()
     PrintStatement.prototype.parse = function(){

       //me.req 'print'
       this.req('print');

//At this point we lock because it is definitely a `print` statement. Failure to parse the expression
//from this point is a syntax error.

       //me.lock()
       this.lock();

       this.args = this.optSeparatedList(Expression, ",");
     };
   
   //end class PrintStatement



   //class VariableDecl, extends|super is ASTBase, constructor:
   function VariableDecl(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // VariableDecl (extends|super is) ASTBase
   VariableDecl.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

//`VariableDecl: IDENTIFIER (':' dataType-VariableRef) ('=' assignedValue-Expression)`

//variable name, optional type anotation and optionally assign a value

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

       //me.lock()
       this.lock();

//optional type annotation

       //if me.opt(':')
       if (this.opt(':')) {

           this.type = this.req(VariableRef);

            //#auto-capitalize core classes
            //declare forward autoCapitalizeCoreClasses
           this.type.name = autoCapitalizeCoreClasses(this.type.name);

            //# check for 'array', e.g.: `var list : string array`
           //if me.opt('Array','array')
           if (this.opt('Array', 'array')) {
               this.itemType = this.type;//#assign as sub-type
               this.type = 'Array';
           };
       };


//optional assigned value

       //if me.opt('=')
       if (this.opt('=')) {
         //if me.lexer.token.type is 'NEWLINE' #dangling assignment, assume free-form object literal
         if (this.lexer.token.type === 'NEWLINE') {//#dangling assignment, assume free-form object literal
           this.assignedValue = this.req(FreeObjectLiteral);
         }
         else {
           this.assignedValue = this.req(Expression);
         
         };
       };
     };
   
   exports.VariableDecl = VariableDecl;
   //end class VariableDecl



//## Var Statement

//`VarStatement: (var|let) (VariableDecl,) `

//`var` followed by a comma separated list of VariableDecl (one or more items)

   //class VarStatement, extends|super is ASTBase, constructor:
   function VarStatement(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // VarStatement (extends|super is) ASTBase
   VarStatement.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

      //properties list:array

     //method parse()
     VarStatement.prototype.parse = function(){

       //me.req('var','let')
       this.req('var', 'let');
       //me.lock()
       this.lock();

       this.list = this.reqSeparatedList(VariableDecl, ",");
     };
   
   //end class VarStatement


//## PropertiesDeclaration

//`PropertiesDeclaration: properties (VariableDecl,)`

//The `properties` keyword is used inside classes to define properties of the class (prototype).

   //class PropertiesDeclaration, extends|super is ASTBase, constructor:
   function PropertiesDeclaration(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // PropertiesDeclaration (extends|super is) ASTBase
   PropertiesDeclaration.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

      //properties
        //toNamespace
        //list: VariableDecl array

     //method parse()
     PropertiesDeclaration.prototype.parse = function(){

       this.toNamespace = this.opt('namespace') ? true : false;
       //me.req('properties')
       this.req('properties');
       //me.lock()
       this.lock();

       this.list = this.reqSeparatedList(VariableDecl, ',');
     };
   
   //end class PropertiesDeclaration


//##TryCatch


//`TryCatch: 'try' Body ExceptionBlock`

//Defines a `try` block for trapping exceptions and handling them.

   //class TryCatch, extends|super is ASTBase, constructor:
   function TryCatch(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // TryCatch (extends|super is) ASTBase
   TryCatch.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

      //properties body,exceptionBlock

     //method parse()
     TryCatch.prototype.parse = function(){
       //me.req 'try'
       this.req('try');
       //me.lock()
       this.lock();
       this.body = this.req(Body);

       this.exceptionBlock = this.req(ExceptionBlock);
     };
   
   //end class TryCatch


//## ExceptionBlock

//`ExceptionBlock: (exception|catch) Identifier Body [finally Body]`

//Defines a `catch` block for trapping exceptions and handling them.
//If no `try` preceded this construction, `try` is assumed at the beggining of the function

   //class ExceptionBlock, extends|super is ASTBase, constructor:
   function ExceptionBlock(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // ExceptionBlock (extends|super is) ASTBase
   ExceptionBlock.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

      //properties
        //catchVar:string
        //body,finallyBody

     //method parse()
     ExceptionBlock.prototype.parse = function(){

       //me.req 'exception','catch'
       this.req('exception', 'catch');
       //me.lock()
       this.lock();

//get catch variable - Note: catch variables in js are block-scoped

       this.catchVar = this.req('IDENTIFIER');

//get body

       this.body = this.req(Body);

//get optional "finally" block

       //if me.opt('finally')
       if (this.opt('finally')) {
         this.finallyBody = this.req(Body);
       };
     };
   
   //end class ExceptionBlock


//## ThrowStatement

//`ThrowStatement: (throw|raise|fail with) Expression`

//This handles `throw` and its synonyms followed by an expression

   //class ThrowStatement, extends|super is ASTBase, constructor:
   function ThrowStatement(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // ThrowStatement (extends|super is) ASTBase
   ThrowStatement.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

      //properties specifier, expr

     //method parse()
     ThrowStatement.prototype.parse = function(){

       this.specifier = this.req('throw', 'raise', 'fail');

//At this point we lock because it is definitely a `throw` statement

       //me.lock()
       this.lock();

       //if me.specifier is 'fail'
       if (this.specifier === 'fail') {
           //me.req 'with'
           this.req('with');
       };

       this.expr = this.req(Expression);
     };
   
   //end class ThrowStatement


//## ReturnStatement


//`ReturnStatement: return Expression`

   //class ReturnStatement, extends|super is ASTBase, constructor:
   function ReturnStatement(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // ReturnStatement (extends|super is) ASTBase
   ReturnStatement.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

      //properties expr

     //method parse()
     ReturnStatement.prototype.parse = function(){
       //me.req 'return'
       this.req('return');
       //me.lock()
       this.lock();
       this.expr = this.opt(Expression);
     };
   
   //end class ReturnStatement


//IfStatement
//-----------

//`IfStatement: (if|when) Expression (then|',') SingleLineStatement [ElseIfStatement|ElseStatement]*`
//`IfStatement: (if|when) Expression Body [ElseIfStatement|ElseStatement]*`

//Parses `if` statments and any attached `else`s or `else if`s

   //class IfStatement, extends|super is ASTBase, constructor:
   function IfStatement(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // IfStatement (extends|super is) ASTBase
   IfStatement.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

      //properties conditional,body,elseStatement

     //method parse()
     IfStatement.prototype.parse = function(){

       //me.req 'if','when'
       this.req('if', 'when');
       //me.lock()
       this.lock();

       this.conditional = this.req(Expression);

       //if me.opt(',','then')
       if (this.opt(',', 'then')) {

//after `,` or `then`, a statement on the same line is required

           this.body = this.req(SingleLineStatement);
       }
       else {

           this.body = this.req(Body);
       
       };

        //#end if

//control: "if"-"else" are related by having the same indent

       //if me.lexer.token.value is 'else'
       if (this.lexer.token.value === 'else') {

         //if me.lexer.index isnt 0
         if (this.lexer.index !== 0) {
           //me.throwError 'expected "else" to start on a new line'
           this.throwError('expected "else" to start on a new line');
         };

         //if me.lexer.indent < me.indent
         if (this.lexer.indent < this.indent) {
            //#token is 'else' **BUT IS LESS-INDENTED**. It is not the "else" to this "if"
           //return
           return;
         };

         //if me.lexer.indent > me.indent
         if (this.lexer.indent > this.indent) {
           //me.throwError "'else' statement is over-indented"
           this.throwError("'else' statement is over-indented");
         };
       };

        //#end if

       this.elseStatement = this.opt(ElseIfStatement, ElseStatement);
     };
   
   //end class IfStatement


//ElseIfStatement
//---------------

//`ElseIfStatement: (else|otherwise) if Expression Body`

//This class handles chained else-if statements

   //class ElseIfStatement, extends|super is ASTBase, constructor:
   function ElseIfStatement(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // ElseIfStatement (extends|super is) ASTBase
   ElseIfStatement.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

      //properties nextIf

     //method parse()
     ElseIfStatement.prototype.parse = function(){

       //me.req 'else'
       this.req('else');
       //me.req 'if'
       this.req('if');
       //me.lock()
       this.lock();

//return the consumed 'if', to parse as a normal 'IfStatement'

       //me.lexer.returnToken()
       this.lexer.returnToken();
       this.nextIf = this.req(IfStatement);
     };
   
   //end class ElseIfStatement


//ElseStatement
//-------------
//`ElseStatement: ('else'|'otherwise') (Statement | Body) `

//This class handles closing "else" statements

   //class ElseStatement, extends|super is ASTBase, constructor:
   function ElseStatement(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // ElseStatement (extends|super is) ASTBase
   ElseStatement.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

      //properties body

     //method parse()
     ElseStatement.prototype.parse = function(){

       //me.req 'else'
       this.req('else');
       //me.lock()
       this.lock();
       this.body = this.req(Body);
     };
   
   //end class ElseStatement


//Loops
//=====

//LiteScript provides the standard js and C `while` loop, but also provides a `until` loop
//and a post-condition `do loop while|until`


//## WhileUntilExpression

//common symbol for loops conditions. Is the word 'while' or 'until' followed by a boolean-Expression

//`WhileUntilExpression: ('while'|'until') boolean-Expression`

   //class WhileUntilExpression, extends|super is ASTBase, constructor:
   function WhileUntilExpression(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // WhileUntilExpression (extends|super is) ASTBase
   WhileUntilExpression.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

      //properties expr

     //method parse()
     WhileUntilExpression.prototype.parse = function(){
       this.name = this.req('while', 'until');
       //me.lock()
       this.lock();
       this.expr = this.req(Expression);
     };
   
   //end class WhileUntilExpression

//DoLoop
//------

//`DoLoop: do [pre-WhileUntilExpression] [":"] Body loop`
//`DoLoop: do [":"] Body loop [post-WhileUntilExpression]`

//do-loop can have a optional pre-condition or a optional post-condition

//###Case 1) do-loop without any condition

//a do-loop without any condition is an *infinite loop* (usually with a `break` statement inside)

//Example:

//  var x=1

//  do:

//    x++
//    print x
//    when x is 10, break

//  loop

//###Case 2) do-loop with pre-condition

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

   //class DoLoop, extends|super is ASTBase, constructor:
   function DoLoop(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // DoLoop (extends|super is) ASTBase
   DoLoop.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

      //properties
        //preWhileUntilExpression
        //body
        //postWhileUntilExpression

     //method parse()
     DoLoop.prototype.parse = function(){

       //me.req 'do'
       this.req('do');

       //if me.opt('nothing')
       if (this.opt('nothing')) {
         //me.throwParseFailed('is do nothing')
         this.throwParseFailed('is do nothing');
       };

       //me.opt ":"
       this.opt(":");
       //me.lock()
       this.lock();

//Get optional pre-condition

       this.preWhileUntilExpression = this.opt(WhileUntilExpression);

       this.body = this.opt(Body);

       //me.req "loop"
       this.req("loop");

//Get optional post-condition

       this.postWhileUntilExpression = this.opt(WhileUntilExpression);

       //if me.preWhileUntilExpression and me.postWhileUntilExpression
       if (this.preWhileUntilExpression && this.postWhileUntilExpression) {
         //me.sayErr "Loop: cant have a pre-condition a and post-condition at the same time"
         this.sayErr("Loop: cant have a pre-condition a and post-condition at the same time");
       };
     };
   
   //end class DoLoop


//WhileUntilLoop
//--------------

//`WhileUntilLoop: pre-WhileUntilExpression Body`

//Execute the block `while` the condition is true or `until` the condition is true

//while|until loops are simpler forms of loops. The `while` form, is the same as in C and js.

//WhileUntilLoop derives from DoLoop, to use its `.produce()` method (it is a simple form of DoLoop)

   //class WhileUntilLoop, extends|super is DoLoop, constructor:
   function WhileUntilLoop(){
   // default constructor: call super.constructor
       return DoLoop.prototype.constructor.apply(this,arguments)
   };
   // WhileUntilLoop (extends|super is) DoLoop
   WhileUntilLoop.prototype.__proto__ = DoLoop.prototype;
   
   // declared properties & methods

      //properties preWhileUntilExpression, body

     //method parse()
     WhileUntilLoop.prototype.parse = function(){

       this.preWhileUntilExpression = this.req(WhileUntilExpression);
       //me.lock()
       this.lock();

       this.body = this.opt(Body);
     };
   
   //end class WhileUntilLoop


//LoopControlStatement
//--------------------

//`LoopControlStatement: (break|continue)`

//This handles the `break` and `continue` keywords.
//'continue' jumps to the start of the loop (as C & Js: 'continue')

   //class LoopControlStatement, extends|super is ASTBase, constructor:
   function LoopControlStatement(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // LoopControlStatement (extends|super is) ASTBase
   LoopControlStatement.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

      //properties control

     //method parse()
     LoopControlStatement.prototype.parse = function(){
       this.control = this.req('break', 'continue');
     };
   
   //end class LoopControlStatement


//DoNothingStatement
//------------------

//`DoNothingStatement: do nothing`

   //class DoNothingStatement, extends|super is ASTBase, constructor:
   function DoNothingStatement(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // DoNothingStatement (extends|super is) ASTBase
   DoNothingStatement.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods
     //method parse()
     DoNothingStatement.prototype.parse = function(){
       //me.req 'do'
       this.req('do');
       //me.req 'nothing'
       this.req('nothing');
     };
   
   //end class DoNothingStatement


//For Statement
//=============

   //class ForStatement, extends|super is ASTBase, constructor:
   function ForStatement(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // ForStatement (extends|super is) ASTBase
   ForStatement.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

      //properties
        //variant: ASTBase

     //method parse()
     ForStatement.prototype.parse = function(){

        //declare valid me.createScope

//We start with commonn `for` keyword

        //me.req 'for'
       //me.req 'for'
       this.req('for');
       //me.lock()
       this.lock();

//There are 3 variants of `ForStatement` in LiteScript,
//we now require one of them

       this.variant = this.req(ForEachProperty, ForIndexNumeric, ForEachInArray);
     };
   
   //end class ForStatement


//##Variant 1) **for each property** to loop over **object property names**

//Grammar:
//`ForEachProperty: for each [own] property name-Identifier in object-VariableRef`

//where `name-VariableDecl` is a variable declared on the spot to store each property name,
//and `object-VariableRef` is the object having the properties

//if the optional `own` keyword is used, only instance properties will be looped
//(no prototype chain properties)

   //class ForEachProperty, extends|super is ASTBase, constructor:
   function ForEachProperty(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // ForEachProperty (extends|super is) ASTBase
   ForEachProperty.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

      //properties ownOnly,indexVar,iterable, body

     //method parse()
     ForEachProperty.prototype.parse = function(){

       //me.req('each')
       this.req('each');

//then check for optional `own`

       this.ownOnly = this.opt('own') ? true : false;

//next we require: 'property', and lock.

       //me.req('property')
       this.req('property');
       //me.lock()
       this.lock();

//Get index variable name (to store property names), register index var in the scope

       this.indexVar = this.req('IDENTIFIER');

//Then we require `in`, then the iterable-Expression (a object)

       //me.req 'in'
       this.req('in');
       this.iterable = this.req(Expression);

//Now, get the loop body

       this.body = this.req(Body);
     };
   
   //end class ForEachProperty


//##Variant 2) **for index=...** to create **numeric loops**

//This `for` variant is just a verbose expressions of the standard C (and js) `for(;;)` loop

//Grammar:
//`ForIndexNumeric: for index-Identifier = start-Expression [,|;] (while|until|to) end-Expression [(,|;) increment-Statement]`

//where `index-VariableDecl` is a numeric variable declared on the spot to store loop index,
//`start-Expression` is the start value for the index (ussually 0)
//`end-Expression` is the end value (`to`), the condition to keep looping (`while`) or to end looping (`until`)
//and `increment-Statement` is the statement used to advance the loop index. If omitted the default is `index++`

//Note: You can use comma or semicolons between the expressions.

    //declare forward Statement

   //class ForIndexNumeric, extends|super is ASTBase, constructor:
   function ForIndexNumeric(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // ForIndexNumeric (extends|super is) ASTBase
   ForIndexNumeric.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

      //properties
        //indexVar, startIndex
        //conditionPrefix, endExpression
        //increment: Statement
        //body

     //method parse()
     ForIndexNumeric.prototype.parse = function(){

//we require: a variable, a "=", and a start index

       this.indexVar = this.req('IDENTIFIER');
       //me.req "="
       this.req("=");
       //me.lock()
       this.lock();
       this.startIndex = this.req(Expression);

//comma|semicolon are optional

       //me.opt ',',";"
       this.opt(',', ";");

//get 'while|until|to' and condition

       this.conditionPrefix = this.req('while', 'until', 'to');
       this.endExpression = this.req(Expression);

//if a comma is next, expect Increment-Statement

       //if me.opt(',',";")
       if (this.opt(',', ";")) {
         this.increment = this.req(SingleLineStatement);
       };

//Now, get the loop body

       this.body = this.req(Body);
     };
   
   //end class ForIndexNumeric


//##Variant 3) **for each in** to loop over **Arrays**

//Grammar:
//`ForEachInArray: for [each] [index-Identifier,]item-Identifier in array-VariableRef`

//where:
//* `index-VariableDecl` is a variable declared on the spot to store each item index (from 0 to array.length)
//* `item-VariableDecl` is a variable declared on the spot to store each array item (array[index])
//and `array-VariableRef` is the array to iterate over

   //class ForEachInArray, extends|super is ASTBase, constructor:
   function ForEachInArray(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // ForEachInArray (extends|super is) ASTBase
   ForEachInArray.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

      //properties
        //mainVar:String
        //indexVar:String
        //iterable
        //body

     //method parse()
     ForEachInArray.prototype.parse = function(){

//first, optional 'each'

       //me.opt('each')
       this.opt('each');

//Get index variable and value variable.
//Keep it simple: index and value are always variables declared on the spot

       this.mainVar = this.req('IDENTIFIER');

//a comma means: previous var was 'index', so register as index and get main var

       //if me.opt(',')
       if (this.opt(',')) {
         this.indexVar = this.mainVar;
         this.mainVar = this.req('IDENTIFIER');
       }
       else if (this.opt('at')) {//#old syntax
         this.indexVar = this.req('IDENTIFIER');
       };

        //#end if

//we now *require* `in` and the iterable (array)

       //me.req 'in'
       this.req('in');
       //me.lock()
       this.lock();
       this.iterable = this.req(Expression);

//and then, loop body

       this.body = this.req(Body);
     };
   
   //end class ForEachInArray


//--------------------------------

//## AssignmentStatement

//`AssignmentStatement: VariableRef ("="|"+="|"-="|"*="|"/=") Expression`

   //class AssignmentStatement, extends|super is ASTBase, constructor:
   function AssignmentStatement(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // AssignmentStatement (extends|super is) ASTBase
   AssignmentStatement.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

      //properties lvalue:VariableRef, rvalue:Expression

     //method parse()
     AssignmentStatement.prototype.parse = function(){

        //declare valid this.scopeEvaluateAssignment
        //declare valid me.parent.preParsedVarRef
        //declare valid me.parent.preParsedVarRef
        //declare valid me.scopeEvaluateAssignment
        //declare valid me.scopeEvaluateAssignment

       //if me.parent.preParsedVarRef
       if (this.parent.preParsedVarRef) {
         this.lvalue = this.parent.preParsedVarRef;//# get already parsed VariableRef
       }
       else {
         this.lvalue = this.req(VariableRef);
       
       };

//require an assignment symbol: ("="|"+="|"-="|"*="|"/=")

       this.name = this.req('ASSIGN');
       //me.lock()
       this.lock();

       //if me.lexer.token.type is 'NEWLINE' #dangling assignment
       if (this.lexer.token.type === 'NEWLINE') {//#dangling assignment
         this.rvalue = this.req(FreeObjectLiteral);//#assume Object Expression in freeForm mode
       }
       else {
         this.rvalue = this.req(Expression);
       
       };
     };
   
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

//### Implementation
//We provide a class Accessor to be super class for the three accessors types.

   //class Accessor, extends|super is ASTBase, constructor:
   function Accessor(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // Accessor (extends|super is) ASTBase
   Accessor.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods
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
   
   //end class Accessor

//PropertyAccess
//--------------

//`.` -> PropertyAccess: get the property named "n"

//`PropertyAccess: '.' IDENTIFIER`

   //class PropertyAccess, extends|super is Accessor, constructor:
   function PropertyAccess(){
   // default constructor: call super.constructor
       return Accessor.prototype.constructor.apply(this,arguments)
   };
   // PropertyAccess (extends|super is) Accessor
   PropertyAccess.prototype.__proto__ = Accessor.prototype;
   
   // declared properties & methods

     //method parse()
     PropertyAccess.prototype.parse = function(){
       //me.req('.')
       this.req('.');
       //me.lock()
       this.lock();
       this.name = this.req('IDENTIFIER');
     };

     //method toString()
     PropertyAccess.prototype.toString = function(){
       //return '.'+me.name
       return '.' + this.name;
     };
   
   //end class PropertyAccess

//IndexAccess
//-----------

//`[n]`-> IndexAccess: get the property named "n" / then nth index of the array
                       //It resolves to the property value

//`IndexAccess: '[' Expression ']'`

   //class IndexAccess, extends|super is Accessor, constructor:
   function IndexAccess(){
   // default constructor: call super.constructor
       return Accessor.prototype.constructor.apply(this,arguments)
   };
   // IndexAccess (extends|super is) Accessor
   IndexAccess.prototype.__proto__ = Accessor.prototype;
   
   // declared properties & methods

     //method parse()
     IndexAccess.prototype.parse = function(){

       //me.req "["
       this.req("[");
       //me.lock()
       this.lock();
       this.name = this.req(Expression);
       //me.req "]" #closer ]
       this.req("]");//#closer ]
     };

     //method toString()
     IndexAccess.prototype.toString = function(){
       //return '[...]'
       return '[...]';
     };
   
   //end class IndexAccess

//FunctionAccess
//--------------

//`(...)` -> FunctionAccess: The object is assumed to be a function, and the code executed.
                           //It resolves to the function return value.

//`FunctionAccess: '(' [Expression,]* ')'`

   //class FunctionAccess, extends|super is Accessor, constructor:
   function FunctionAccess(){
   // default constructor: call super.constructor
       return Accessor.prototype.constructor.apply(this,arguments)
   };
   // FunctionAccess (extends|super is) Accessor
   FunctionAccess.prototype.__proto__ = Accessor.prototype;
   
   // declared properties & methods
      //properties args

     //method parse()
     FunctionAccess.prototype.parse = function(){
       //me.req "("
       this.req("(");
       //me.lock()
       this.lock();
       this.args = this.optSeparatedList(Expression, ",", ")");//#comma-separated list of expressions, closed by ")"
     };

     //method toString()
     FunctionAccess.prototype.toString = function(){
       //return '(...)'
       return '(...)';
     };
   
   //end class FunctionAccess

//## Helper Functions to parse accessors on any node

   //append to ASTBase.prototype
   
      //properties
        //accessors: Accessor array
        //executes, hasSideEffects

     //helper method parseAccessors
     ASTBase.prototype.parseAccessors = function(){

//(performance) only if the next token in ".[("

         //if me.lexer.token.value not in ".[(" then return
         if (".[(".indexOf(this.lexer.token.value)===-1) {
             return};

//We store the accessors in the property: .accessors
//if the accessors node exists, .list will have **at least one item**

//loop parsing accessors

          //declare forward AccessorsDirect

         //do
         while(true){
         
             var ac = this.parseDirect(this.lexer.token.value, AccessorsDirect);
             //if no ac, break
             if (!ac) {
                 break};

             //me.addAccessor ac
             this.addAccessor(ac);
         
         };//end loop
         ;

         //return
         return;
     };

     //      helper method insertAccessorAt(position,item)
     ASTBase.prototype.insertAccessorAt = function(position, item){

            //#create accessors list, if there was none
           //if no me.accessors, me.accessors = []
           if (!this.accessors) {
               this.accessors = []};

            //#polymorphic params, string defaults to PropertyAccess
           //if type of item is 'string', item = new PropertyAccess(me, item)
           if (typeof item === 'string') {
               item = new PropertyAccess(this, item)};
            //#insert
           //me.accessors.splice position,0,item
           this.accessors.splice(position, 0, item);
     };


     //      helper method addAccessor(item)
     ASTBase.prototype.addAccessor = function(item){

            //#create accessors list, if there was none
           //if no me.accessors, me.accessors = []
           if (!this.accessors) {
               this.accessors = []};
           //me.insertAccessorAt me.accessors.length, item
           this.insertAccessorAt(this.accessors.length, item);

//if the very last accesor is "(", it means the entire expression is a function call,
//it's a call to "execute code", so it's a imperative statement on it's own.
//if any accessor is a function call, this statement is assumed to have side-effects

           this.executes = item instanceof FunctionAccess;
           //if me.executes, me.hasSideEffects = true
           if (this.executes) {
               this.hasSideEffects = true};
     };


//## VariableRef

//`VariableRef: ('--'|'++') IDENTIFIER [Accessors] ('--'|'++')`

//`VariableRef` is a Variable Reference

//a VariableRef can include chained 'Accessors', which do:
//* access a property of the object : `.`-> **PropertyAccess** and `[...]`->**IndexAccess**
//* assume the variable is a function and perform a function call :  `(...)`->**FunctionAccess**

   //class VariableRef, extends|super is ASTBase, constructor:
   function VariableRef(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // VariableRef (extends|super is) ASTBase
   VariableRef.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

      //properties
        //preIncDec
        //postIncDec

      //declare name affinity varRef

     //method parse()
     VariableRef.prototype.parse = function(){

       this.preIncDec = this.opt('--', '++');

//get var name, translate common aliases (me->this)

       this.executes = false;

       this.name = this.req('IDENTIFIER');

       //me.lock()
       this.lock();

//Now we check for accessors:
//`.`->**PropertyAccess**
//`[...]`->**IndexAccess**
//`(...)`->**FunctionAccess**
//Note: paserAccessors() will:
//* set .hasSideEffects=true if a function accessor is parsed
//* set .executes=true if the last accessor is a function accessor

       //me.parseAccessors
       this.parseAccessors();

//Replace lexical 'super' by '#{SuperClass name}.prototype'

       //if me.name is 'super'
       if (this.name === 'super') {

           var classDecl = this.getParent(ClassDeclaration);
           //if no classDecl
           if (!classDecl) {
             //me.throwError "can't use 'super' outside a class method"
             this.throwError("can't use 'super' outside a class method");
           };

           //if classDecl.varRefSuper
           if (classDecl.varRefSuper) {
                //#replace name='super' by name = SuperClass name
               this.name = classDecl.varRefSuper.name;
           }
           else {
               this.name = 'Object';//# no superclass means 'Object' is super class
           
           };

            //#insert '.prototype.' as first accessor (after super class name)
           //me.insertAccessorAt 0, 'prototype'
           this.insertAccessorAt(0, 'prototype');

            //#if super class is a composed name (x.y.z), we must insert those accessors also
            //# so 'super.myFunc' turns into 'NameSpace.subName.SuperClass.prototype.myFunc'
           //if classDecl.varRefSuper and classDecl.varRefSuper.accessors
           if (classDecl.varRefSuper && classDecl.varRefSuper.accessors) {
                //#insert super class accessors
               var position = 0;
               //for each ac in classDecl.varRefSuper.accessors
               for ( var ac__inx=0; ac__inx<classDecl.varRefSuper.accessors.length; ac__inx++) {
                 var ac=classDecl.varRefSuper.accessors[ac__inx];
                 //if ac instanceof PropertyAccess
                 if (ac instanceof PropertyAccess) {
                   //me.insertAccessorAt position++, ac.name
                   this.insertAccessorAt(position++, ac.name);
                 };
               }; // end for each in classDecl.varRefSuper.accessors
           };
       };

       //end if super

//Allow 'null' as alias to 'do nothing'

       //if me.name is 'null', me.executes = true
       if (this.name === 'null') {
           this.executes = true};

//check for post-fix increment/decrement

       this.postIncDec = this.opt('--', '++');

//If this variable ref has ++ or --, IT IS CONSIDERED a "call to execution" in itself,
//a "imperative statement", because it has side effects.
//(`i++` has a "imperative" part, It means: "give me the value of i, and then increment it!")

       //if me.preIncDec or me.postIncDec
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

       //if me.name is 'require'
       if (this.name === 'require') {
           //me.getParent(Module).requireCallNodes.push me
           this.getParent(Module).requireCallNodes.push(this);
       };
     };

//---------------------------------
//This method is only valid to be used in error reporting.
//function accessors will be output as "(...)", and index accessors as [...]

     //method toString()
     VariableRef.prototype.toString = function(){

       var result = (this.preIncDec || "") + this.name;
       //if me.accessors
       if (this.accessors) {
         //for ac in me.accessors
         for ( var ac__inx=0; ac__inx<this.accessors.length; ac__inx++) {
           var ac=this.accessors[ac__inx];
           result += ac.toString();
         }; // end for each in this.accessors
       };
       //return result + (me.postIncDec or "")
       return result + (this.postIncDec || "");
     };
   
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
         'function': FunctionDeclaration
         };


   //class Operand, extends|super is ASTBase, constructor:
   function Operand(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // Operand (extends|super is) ASTBase
   Operand.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

     //method parse()
     Operand.prototype.parse = function(){

//fast-parse: if it's a NUMBER: it is NumberLiteral, if it's a STRING: it is StringLiteral (also for REGEX)
//or, upon next token, cherry pick which AST nodes to try,
//'(':ParenExpression,'[':ArrayLiteral,'{':ObjectLiteral,'function': FunctionDeclaration

       this.name = this.parseDirect(this.lexer.token.type, OPERAND_DIRECT_TYPE) || this.parseDirect(this.lexer.token.value, OPERAND_DIRECT_TOKEN);

//if it was a Literal, ParenExpression or FunctionDeclaration
//besides base value, this operands can have accessors. For example: `"string".length` , `myObj.fn(10)`

       //if me.name
       if (this.name) {
           //me.parseAccessors
           this.parseAccessors();
       }
       else {
           this.name = this.req(VariableRef);
       
       };
     };
   
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

   //class Oper, extends|super is ASTBase, constructor:
   function Oper(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // Oper (extends|super is) ASTBase
   Oper.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

      //properties
        //negated
        //left:Operand, right:Operand
        //pushed, precedence

     //method parse()
     Oper.prototype.parse = function(){

        //declare valid me.getPrecedence

//Get next token, require an OPER

        //me.name = me.req('OPER')
       this.name = this.req('OPER');
       //me.lock()
       this.lock();

//A) validate double-word opers

//A.1) validate `instance of`

       //if me.name is 'instance'
       if (this.name === 'instance') {
           this.name += ' ' + this.req('of');
       }
       else if (this.name === 'has') {
           this.negated = this.opt('not') ? true : false;//# set the 'negated' flag
           this.name += ' ' + this.req('property');
       }
       else if (this.name === 'hasnt') {
           this.negated = true;//# set the 'negated' flag
           this.name += 'has ' + this.req('property');
       }
       else if (this.name === 'not') {
         this.negated = true;//# set the 'negated' flag
         this.name = this.req('in');//# require 'not in'
       }
       else if (this.name === 'isnt') {
         this.negated = true;//# set the 'negated' flag
         this.name = 'is';//# treat as 'Negated is'
       }
       else if (this.name === 'instanceof') {
         this.name = 'instance of';
       };

        //#end if

//C) Variants on 'is/isnt...'

       //if me.name is 'is' # note: 'isnt' was converted to 'is {negated:true}' above
       if (this.name === 'is') {//# note: 'isnt' was converted to 'is {negated:true}' above

  //C.1) is not
  //Check for `is not`, which we treat as `isnt` rather than `is ( not`.

         //if me.opt('not') # --> is not...
         if (this.opt('not')) {//# --> is not...
             //if me.negated, me.throwError '"isnt not" is invalid'
             if (this.negated) {
                 this.throwError('"isnt not" is invalid')};
             this.negated = true;//# set the 'negated' flag
         };

        //#end if

  //C.2) accept 'is/isnt instance of' and 'is/isnt instanceof'

         //if me.opt('instance')
         if (this.opt('instance')) {
             this.name = 'instance ' + this.req('of');
         }
         else if (this.opt('instanceof')) {
             this.name = 'instance of';
         };
       };

        //#end if

//Get operator precedence index

       //me.getPrecedence
       this.getPrecedence();
     };

      //#end Oper parse


//###getPrecedence:

//**Helper method to get Precedence Index (lower number means higher precedende)**

     //method getPrecedence()
     Oper.prototype.getPrecedence = function(){

       this.precedence = operatorsPrecedence.indexOf(this.name);
       //if me.precedence is -1
       if (this.precedence === -1) {
           //debugger
           debugger;
           //fail with "OPER '#{me.name}' not found in the operator precedence list"
           throw new Error("OPER '" + (this.name) + "' not found in the operator precedence list");
       };
     };
   
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
//Unary Oper inherits from Oper, so both are `instance of Oper`

//Examples:
//1) `not`     *boolean negation*     `if not ( a is 3 or b is 4)`
//2) `-`       *numeric unary minus*  `-(4+3)`
//2) `+`       *numeric unary plus*   `+4` (can be ignored)
//3) `new`     *instantiation*        `x = new classes[2]()`
//4) `type of` *type name access*     `type of x is 'string'`
//5) `no`      *'falsey' check*       `if no options then options={}`
//6) `~`       *bit-unary-negation*   `a = ~xC0 + 5`

   var unaryOperators = ['new', '-', 'no', 'not', 'type', 'typeof', '~', '+'];

   //class UnaryOper, extends|super is Oper, constructor:
   function UnaryOper(){
   // default constructor: call super.constructor
       return Oper.prototype.constructor.apply(this,arguments)
   };
   // UnaryOper (extends|super is) Oper
   UnaryOper.prototype.__proto__ = Oper.prototype;
   
   // declared properties & methods

     //method parse()
     UnaryOper.prototype.parse = function(){

//require a unaryOperator

         this.name = this.reqOneOf(unaryOperators);

//Check for `type of` - we allow "type" as var name, but recognize "type of" as UnaryOper

         //if me.name is 'type'
         if (this.name === 'type') {
             //if me.opt('of')
             if (this.opt('of')) {
               this.name = 'type of';
             }
             else {
               //me.throwParseFailed 'expected "of" after "type"'
               this.throwParseFailed('expected "of" after "type"');
             
             };
         };

//Lock, we have a unary oper

         //me.lock()
         this.lock();

//Rename - and + to 'unary -' and 'unary +'
//'typeof' to 'type of'

         //if me.name is '-'
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

         //me.getPrecedence()
         this.getPrecedence();
     };
   
   //end class UnaryOper

      //#end parse


//-----------
//## Expression

//`Expression: [UnaryOper] Operand [Oper [UnaryOper] Operand]*`

//The expression class parses intially a *flat* array of nodes.
//After the expression is parsed, a *Expression Tree* is created based on operator precedence.

   //class Expression, extends|super is ASTBase, constructor:
   function Expression(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // Expression (extends|super is) ASTBase
   Expression.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

      //properties operandCount, root

     //method parse()
     Expression.prototype.parse = function(){

        //declare valid me.growExpressionTree
        //declare valid me.root.name.type
        //declare valid me.root.name.type

        //var arr = []
       var arr = [];
       this.operandCount = 0;

       //while true
       while(true){
       

//Get optional unary operator
//(performance) check token first

         //if me.lexer.token.value in unaryOperators
         if (unaryOperators.indexOf(this.lexer.token.value)>=0) {
             var oper = this.opt(UnaryOper);
             //if oper
             if (oper) {
               //arr.push oper
               arr.push(oper);
               //me.lock()
               this.lock();
             };
         };

//Get operand

         //arr.push me.req(Operand)
         arr.push(this.req(Operand));
         this.operandCount += 1;
         //me.lock()
         this.lock();

//(performance) Fast exit for common tokens: `=` `,` `]`  `)` means end of expression.

         //if me.lexer.token.type is 'ASSIGN' or me.lexer.token.value in ',)]'
         if (this.lexer.token.type === 'ASSIGN' || ',)]'.indexOf(this.lexer.token.value)>=0) {
             //break
             break;
         };

//optional newline **before** Oper
//To allow a expressions to continue on the next line, we look ahead, and if the first token in the next line is OPER
//we consume the NEWLINE, allowing multiline expressions. The exception is ArrayLiteral, because in free-form mode
//the next item in the array, can start with a unary operator

         //if me.lexer.token.type is 'NEWLINE' and not (me.parent instanceof ArrayLiteral)
         if (this.lexer.token.type === 'NEWLINE' && !((this.parent instanceof ArrayLiteral))) {
           //me.opt 'NEWLINE' #consume newline
           this.opt('NEWLINE');//#consume newline
           //if me.lexer.token.type isnt 'OPER' # the first token in the next line isnt OPER (+,and,or,...)
           if (this.lexer.token.type !== 'OPER') {//# the first token in the next line isnt OPER (+,and,or,...)
             //me.lexer.returnToken() # return NEWLINE
             this.lexer.returnToken();//# return NEWLINE
             //break #end Expression
             break;//#end Expression
           };
         };

//Try to parse next token as an operator

         var operator = this.opt(Oper);
         //if no operator then break # no more operators, end of expression
         if (!operator) {
             break};

//If it was an operator, store, and continue because we expect another operand.
//(operators sits between two operands)

         //arr.push(operator)
         arr.push(operator);

//allow dangling expresion. If the line ends with OPER,
//we consume the NEWLINE and continue parsing the expression on the next line

         //me.opt 'NEWLINE' #consume optional newline after Oper
         this.opt('NEWLINE');//#consume optional newline after Oper
       
       };//end loop
       ;

        //#loop

//Fix 'new' calls. Check parameters for 'new' unary operator, for consistency, add '()' if not present,
//so `a = new MyClass` turns into `a = new MyClass()`

       //for each index,item in arr
       for ( var index=0; index<arr.length; index++) {
         var item=arr[index];
          //declare item:UnaryOper
         //if item instanceof UnaryOper and item.name is 'new'
         if (item instanceof UnaryOper && item.name === 'new') {
           var operand = arr[index + 1];
           //if operand.name instanceof VariableRef
           if (operand.name instanceof VariableRef) {
               var varRef = operand.name;
               //if no varRef.executes, varRef.addAccessor new FunctionAccess(me)
               if (!varRef.executes) {
                   varRef.addAccessor(new FunctionAccess(this))};
           };
         };
       }; // end for each in arr

//Now we create a tree from me.arr[], based on operator precedence

       //me.growExpressionTree(arr)
       this.growExpressionTree(arr);
     };


      //#end method Expression.parse()


//Grow The Expression Tree
//========================

//Growing the expression AST
//--------------------------

//By default, for every expression, the parser creates a *flat array*
//of UnaryOper, Operands and Operators.

//`Expression: [UnaryOper] Operand [Oper [UnaryOper] Operand]*`

//For example, `not 1 + 2 * 3 is 5`, turns into:

//me.arr =  ['not','1','+','2','*','3','is','5']

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

                   //compile if debug
         //end

         var pos = -1;
         var minPrecedenceInx = 100;
         //for each inx,item in arr
         for ( var inx=0; inx<arr.length; inx++) {
           var item=arr[inx];

            //debug "item at #{inx} #{item.name}, Oper? #{item instanceof Oper}. precedence:",item.precedence
            //declare valid item.precedence
            //declare valid item.pushed
            //declare valid item.pushed

            //if item instanceof Oper
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
         //if pos<0, me.throwError("can't find highest precedence operator")
         if (pos < 0) {
             this.throwError("can't find highest precedence operator")};

//Un-flatten: Push down the operands a level down

         var oper = arr[pos];

         oper.pushed = true;

         //if oper instanceof UnaryOper
         if (oper instanceof UnaryOper) {

            //#control
                       //compile if debug
           //end compile

            //# if it's a unary operator, take the only (right) operand, and push-it down the tree
           oper.right = arr.splice(pos + 1, 1)[0];
         }
         else {

            //#control
                       //compile if debug
           //end compile

            //# if it's a binary operator, take the left and right operand, and push-them down the tree
           oper.right = arr.splice(pos + 1, 1)[0];
           oper.left = arr.splice(pos - 1, 1)[0];
         
         };
       
       };//end loop
       ;

          //#end if

        //#loop until there's only one operator

//Store the root operator

       this.root = arr[0];
     };
   
   //end class Expression

      //#end method

//-----------------------

//## Literal

//This class groups: NumberLiteral, StringLiteral, RegExpLiteral, ArrayLiteral and ObjectLiteral

   //class Literal, extends|super is ASTBase, constructor:
   function Literal(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // Literal (extends|super is) ASTBase
   Literal.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

      //properties
        //type = '*abstract-Literal*'
       Literal.prototype.type='*abstract-Literal*';

     //method getValue()
     Literal.prototype.getValue = function(){
       //return me.name
       return this.name;
     };
   
   //end class Literal


//## NumberLiteral

//`NumberLiteral: NUMBER`

//A numeric token constant. Can be anything the lexer supports, including scientific notation
//, integers, floating point, or hex.

   //class NumberLiteral, extends|super is Literal, constructor:
   function NumberLiteral(){
   // default constructor: call super.constructor
       return Literal.prototype.constructor.apply(this,arguments)
   };
   // NumberLiteral (extends|super is) Literal
   NumberLiteral.prototype.__proto__ = Literal.prototype;
   
   // declared properties & methods

      //properties
        //type = 'Number'
       NumberLiteral.prototype.type='Number';

     //method parse()
     NumberLiteral.prototype.parse = function(){
       this.name = this.req('NUMBER');
     };
   
   //end class NumberLiteral


//## StringLiteral

//`StringLiteral: STRING`

//A string constant token. Can be anything the lexer supports, including single or double-quoted strings.
//The token include the enclosing quotes

   //class StringLiteral, extends|super is Literal, constructor:
   function StringLiteral(){
   // default constructor: call super.constructor
       return Literal.prototype.constructor.apply(this,arguments)
   };
   // StringLiteral (extends|super is) Literal
   StringLiteral.prototype.__proto__ = Literal.prototype;
   
   // declared properties & methods

      //properties
        //type = 'String'
       StringLiteral.prototype.type='String';

     //method parse()
     StringLiteral.prototype.parse = function(){
       this.name = this.req('STRING');
     };

     //method getValue()
     StringLiteral.prototype.getValue = function(){
       //return me.name.slice(1,-1) #remove quotes
       return this.name.slice(1, -1);//#remove quotes
     };
   
   //end class StringLiteral

//## RegExpLiteral

//`RegExpLiteral: REGEX`

//A regular expression token constant. Can be anything the lexer supports.

   //class RegExpLiteral, extends|super is Literal, constructor:
   function RegExpLiteral(){
   // default constructor: call super.constructor
       return Literal.prototype.constructor.apply(this,arguments)
   };
   // RegExpLiteral (extends|super is) Literal
   RegExpLiteral.prototype.__proto__ = Literal.prototype;
   
   // declared properties & methods

      //properties
        //type = 'RegExp'
       RegExpLiteral.prototype.type='RegExp';

     //method parse()
     RegExpLiteral.prototype.parse = function(){
       this.name = this.req('REGEX');
     };
   
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

   //class ArrayLiteral, extends|super is Literal, constructor:
   function ArrayLiteral(){
   // default constructor: call super.constructor
       return Literal.prototype.constructor.apply(this,arguments)
   };
   // ArrayLiteral (extends|super is) Literal
   ArrayLiteral.prototype.__proto__ = Literal.prototype;
   
   // declared properties & methods

      //properties
        //type = 'Array'
        //items
       ArrayLiteral.prototype.type='Array';

     //method parse()
     ArrayLiteral.prototype.parse = function(){
       //me.req '['
       this.req('[');
       //me.lock()
       this.lock();
       this.items = this.optSeparatedList(Expression, ',', ']');//# closer "]" required
     };
   
   //end class ArrayLiteral


//## ObjectLiteral

//`ObjectLiteral: '{' NameValuePair* '}'`

//Defines an object with a list of key value pairs. This is a JavaScript-style definition.

//`x = {a:1,b:2,c:{d:1}}`

   //class ObjectLiteral, extends|super is Literal, constructor:
   function ObjectLiteral(){
   // default constructor: call super.constructor
       return Literal.prototype.constructor.apply(this,arguments)
   };
   // ObjectLiteral (extends|super is) Literal
   ObjectLiteral.prototype.__proto__ = Literal.prototype;
   
   // declared properties & methods

      //properties
        //items: NameValuePair array
        //type = 'Object'
       ObjectLiteral.prototype.type='Object';

     //method parse()
     ObjectLiteral.prototype.parse = function(){

       //me.req '{'
       this.req('{');
       //me.lock()
       this.lock();
       this.items = this.optSeparatedList(NameValuePair, ',', '}');//# closer "}" required
     };


//####helper Functions

      //#recursive duet 1 (see NameValuePair)
     //helper method forEach(callback)
     ObjectLiteral.prototype.forEach = function(callback){
         //for nameValue in me.items
         for ( var nameValue__inx=0; nameValue__inx<this.items.length; nameValue__inx++) {
           var nameValue=this.items[nameValue__inx];
           //nameValue.forEach(callback)
           nameValue.forEach(callback);
         }; // end for each in this.items
     };
   
   //end class ObjectLiteral


//## NameValuePair

//`NameValuePair: (IDENTIFIER|STRING|NUMBER) ':' Expression`

//A single definition in a `ObjectLiteral`
//a `property-name: value` pair.

   //class NameValuePair, extends|super is ASTBase, constructor:
   function NameValuePair(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // NameValuePair (extends|super is) ASTBase
   NameValuePair.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

      //properties value: Expression

     //method parse()
     NameValuePair.prototype.parse = function(){

       this.name = this.req('IDENTIFIER', 'STRING', 'NUMBER');

       //me.req ':'
       this.req(':');
       //me.lock()
       this.lock();

//if it's a "dangling assignment", we assume FreeObjectLiteral

       //if me.lexer.token.type is 'NEWLINE'
       if (this.lexer.token.type === 'NEWLINE') {
         this.value = this.req(FreeObjectLiteral);
       }
       else {
         this.value = this.req(Expression);
       
       };
     };


      //#recursive duet 2 (see ObjectLiteral)
     //helper method forEach(callback)
     NameValuePair.prototype.forEach = function(callback){

         //callback(me)
         callback(this);

//if ObjectLiteral, recurse

          //declare valid me.value.root.name

          //if me.value.root.name instanceof ObjectLiteral
         //if me.value.root.name instanceof ObjectLiteral
         if (this.value.root.name instanceof ObjectLiteral) {
            //declare valid me.value.root.name.forEach
            //me.value.root.name.forEach callback # recurse
           //me.value.root.name.forEach callback # recurse
           this.value.root.name.forEach(callback);//# recurse
         };
     };
   
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

   //class FreeObjectLiteral, extends|super is ObjectLiteral, constructor:
   function FreeObjectLiteral(){
   // default constructor: call super.constructor
       return ObjectLiteral.prototype.constructor.apply(this,arguments)
   };
   // FreeObjectLiteral (extends|super is) ObjectLiteral
   FreeObjectLiteral.prototype.__proto__ = ObjectLiteral.prototype;
   
   // declared properties & methods

     //method parse()
     FreeObjectLiteral.prototype.parse = function(){
       //me.lock()
       this.lock();

//get items: optional comma separated, closes on de-indent, at least one required

       this.items = this.reqSeparatedList(NameValuePair, ',');
     };
   
   //end class FreeObjectLiteral



//## ParenExpression

//`ParenExpression: '(' Expression ')'`

//An expression enclosed by parentheses, like `(a + b)`.

   //class ParenExpression, extends|super is ASTBase, constructor:
   function ParenExpression(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // ParenExpression (extends|super is) ASTBase
   ParenExpression.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

      //properties expr:Expression

     //method parse()
     ParenExpression.prototype.parse = function(){
       //me.req '('
       this.req('(');
       //me.lock()
       this.lock();
       this.expr = this.req(Expression);
       //me.req ')'
       this.req(')');
     };
   
   //end class ParenExpression



//## FunctionDeclaration

//`FunctionDeclaration: 'function [IDENITIFIER] ["(" [VariableDecl,]* ")"] [returns type-VariableRef] Body`

//Functions: parametrized pieces of callable code.

   //class FunctionDeclaration, extends|super is ASTBase, constructor:
   function FunctionDeclaration(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // FunctionDeclaration (extends|super is) ASTBase
   FunctionDeclaration.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

      //properties
        //specifier, public, shim
        //paramsDeclarations: VariableDecl array
        //returnType: VariableRef
        //body

     //method parse()
     FunctionDeclaration.prototype.parse = function(){

        //declare valid me.parent.isAdjectivated

        //me.specifier = me.req('function','method')
       this.specifier = this.req('function', 'method');
       //me.lock()
       this.lock();

       this.name = this.opt('IDENTIFIER');

//get parameter members, and function body

       //me.parseParametersAndBody()
       this.parseParametersAndBody();
     };

      //#end parse

     //      method parseParametersAndBody()
     FunctionDeclaration.prototype.parseParametersAndBody = function(){

//This method is shared by functions, methods and constructors and

//if there are no `()` after `function`, we assume `()`

       //if me.lexer.token.type in 'NEWLINE' #-> assume "()" (no parameters)
       if ('NEWLINE'.indexOf(this.lexer.token.type)>=0) {//#-> assume "()" (no parameters)
           //do nothing
           null;
       }
       else {
           //me.req '('
           this.req('(');
           this.paramsDeclarations = this.optSeparatedList(VariableDecl, ',', ')');

           //if me.opt('returns')
           if (this.opt('returns')) {
             this.returnType = this.req(VariableRef);
              //declare forward autoCapitalizeCoreClasses
             this.returnType.name = autoCapitalizeCoreClasses(this.returnType.name);
           };
       
       };

//now get function body

       this.body = this.req(Body);
     };
   
   //end class FunctionDeclaration


//## MethodDeclaration

//`MethodDeclaration: 'method [name] ["(" [VariableDecl,]* ")"] [returns type-VariableRef] Body`

//A `method` is a function defined in the prototype of a class.
//A `method` has an implicit var `this` pointing to the specific instance the method is called on.

//MethodDeclaration derives from FunctionDeclaration, so both are instance of FunctionDeclaration

   //class MethodDeclaration, extends|super is FunctionDeclaration, constructor:
   function MethodDeclaration(){
   // default constructor: call super.constructor
       return FunctionDeclaration.prototype.constructor.apply(this,arguments)
   };
   // MethodDeclaration (extends|super is) FunctionDeclaration
   MethodDeclaration.prototype.__proto__ = FunctionDeclaration.prototype;
   
   // declared properties & methods

     //method parse()
     MethodDeclaration.prototype.parse = function(){

       this.specifier = this.req('method');
       //me.lock()
       this.lock();

//require method name

       this.name = this.req('IDENTIFIER');

//now parse parameters and body (as with any function)

       //me.parseParametersAndBody()
       this.parseParametersAndBody();
     };
   
   //end class MethodDeclaration

      //#end parse


//## ClassDeclaration

//`ClassDeclaration: class IDENTIFIER [[","] (extends|inherits from)] Body`

//Defines a new class with an optional parent class. properties and methods go inside the block.

   //class ClassDeclaration, extends|super is ASTBase, constructor:
   function ClassDeclaration(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // ClassDeclaration (extends|super is) ASTBase
   ClassDeclaration.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

      //properties
        //name:string
        //varRefSuper:VariableRef
        //body

      //declare name affinity classDecl

     //method parse()
     ClassDeclaration.prototype.parse = function(){

       //me.req 'class'
       this.req('class');
       //me.lock()
       this.lock();

       this.name = this.req('IDENTIFIER');

//Control: class names should be Capitalized

       //if not String.isCapitalized(me.name), me.lexer.sayErr "class names should be Capitalized: class #{me.name}"
       if (!(String.isCapitalized(this.name))) {
           this.lexer.sayErr("class names should be Capitalized: class " + (this.name))};

//Now parse optional `,(super is|extends)` setting the super class
//(aka oop classic:'inherits', or ES6: 'extends')

       //me.opt(',')
       this.opt(',');
       //if me.opt('extends','inherits')
       if (this.opt('extends', 'inherits')) {
         //me.opt('from')
         this.opt('from');
         this.varRefSuper = this.req(VariableRef);
       };

//Now get class body.

       this.body = this.opt(Body);
     };
   
   //end class ClassDeclaration



//## ConstructorDeclaration

//`ConstructorDeclaration : 'constructor [new className-IDENTIFIER] ["(" [VariableDecl,]* ")"] [returns type-VariableRef] Body`

//A `constructor` is the main function of the class. In js is the function-class body  (js: `function Class(...){... `)
//The `constructor` method is called upon creation of the object, by the `new` operator.
//The return value is the value returned by `new` operator, that is: the new instance of the class.

//ConstructorDeclaration derives from MethodDeclaration, so it is also a instance of FunctionDeclaration

   //class ConstructorDeclaration, extends|super is MethodDeclaration, constructor:
   function ConstructorDeclaration(){
   // default constructor: call super.constructor
       return MethodDeclaration.prototype.constructor.apply(this,arguments)
   };
   // ConstructorDeclaration (extends|super is) MethodDeclaration
   ConstructorDeclaration.prototype.__proto__ = MethodDeclaration.prototype;
   
   // declared properties & methods

     //method parse()
     ConstructorDeclaration.prototype.parse = function(){

       this.specifier = this.req('constructor');
       //me.lock()
       this.lock();

       //if me.opt('new') # optional: constructor new Person(name:string)
       if (this.opt('new')) {//# optional: constructor new Person(name:string)
          //# to ease reading, and to find the constructor when you search for "new Person"
         var className = this.req('IDENTIFIER');
         var classDeclaration = this.getParent(ClassDeclaration);
         //if classDeclaration.name isnt className, me.sayErr "Class Name mismatch #className/#me.parent.name"
         if (classDeclaration.name !== className) {
             this.sayErr("Class Name mismatch " + className + "/" + this.parent.name)};
       };

//now get parameters and body (as with any function)

       //me.parseParametersAndBody()
       this.parseParametersAndBody();
     };
   
   //end class ConstructorDeclaration

      //#end parse

//------------------------------

//## AppendToDeclaration

//`AppendToDeclaration: append to (class|object) VariableRef Body`

//Adds methods and properties to an existent object, e.g., Class.prototype

   //class AppendToDeclaration, extends|super is ClassDeclaration, constructor:
   function AppendToDeclaration(){
   // default constructor: call super.constructor
       return ClassDeclaration.prototype.constructor.apply(this,arguments)
   };
   // AppendToDeclaration (extends|super is) ClassDeclaration
   AppendToDeclaration.prototype.__proto__ = ClassDeclaration.prototype;
   
   // declared properties & methods

      //properties
        //optClass
        //varRef:VariableRef
        //body

     //method parse()
     AppendToDeclaration.prototype.parse = function(){

       //me.req 'append'
       this.req('append');
       //me.req 'to'
       this.req('to');
       //me.lock()
       this.lock();

       this.optClass = this.req('class', 'object', 'namespace') === 'class';

       this.varRef = this.req(VariableRef);

//Now get body.

       this.body = this.req(Body);
     };
   
   //end class AppendToDeclaration



//## DebuggerStatement

//`DebuggerStatement: debugger`

//When a debugger is attached, break at this point.

   //class DebuggerStatement, extends|super is ASTBase, constructor:
   function DebuggerStatement(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // DebuggerStatement (extends|super is) ASTBase
   DebuggerStatement.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods
     //method parse()
     DebuggerStatement.prototype.parse = function(){
       this.name = this.req("debugger");
     };
   
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

   //class CompilerStatement, extends|super is ASTBase, constructor:
   function CompilerStatement(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // CompilerStatement (extends|super is) ASTBase
   CompilerStatement.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

      //properties
        //kind, conditional:string
        //list, body
        //endLineInx

     //method parse()
     CompilerStatement.prototype.parse = function(){

        //declare list:VariableDecl array

       //me.req 'compiler','compile'
       this.req('compiler', 'compile');
       //me.lock()
       this.lock();
       this.kind = this.req('set', 'if', 'debugger', 'options');

//### compiler set

       //if me.kind is 'set'
       if (this.kind === 'set') {

//get list of declared names, add to root node 'Compiler Vars'

           this.list = this.reqSeparatedList(VariableDecl, ',');
       }
       else if (this.kind === 'if') {

         this.conditional = this.req('IDENTIFIER');
         this.body = this.req(Body);
       }
       else if (this.kind === 'debugger') {//#debug-pause the compiler itself, to debug compiling process
         //debugger
         debugger;
       }
       else {
         //me.lexer.sayErr 'invalid compiler command'
         this.lexer.sayErr('invalid compiler command');
       
       };
     };
   
   //end class CompilerStatement


   //class DeclareStatement, extends|super is ASTBase, constructor:
   function DeclareStatement(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // DeclareStatement (extends|super is) ASTBase
   DeclareStatement.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

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
    //declare valid me.type[].name.name

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

//#####Declare global
//`DeclareStatement: declare global (VariableDecl,)+`

//To declare global, externally created vars. Example: `declare global logMessage, colors`

//#####Declare on
//`DeclareStatement: declare on IDENTIFIER (VariableDecl,)+` #declare members on vars

//To declare valid members on scope vars.

//#####Declare forward ### DEPRECATED
//`DeclareStatement: declare forward (VariableDecl,)+`

//#### DeclareStatement body

      //properties
        //varRef: VariableRef
        //names: VariableDecl array
        //specifier

     //method parse()
     DeclareStatement.prototype.parse = function(){

       //me.req 'declare'
       this.req('declare');
       //me.lock()
       this.lock();

       this.names = [];

//check 'on|valid|forward|global'

       this.specifier = this.opt('on');
       //if me.specifier
       if (this.specifier) {

//Find the main name where this properties are being declared. Read names

           this.name = this.req('IDENTIFIER');
           this.names = this.reqSeparatedList(VariableDecl, ',');
           //return
           return;
       };

//check 'valid'

       this.specifier = this.opt('valid');
       //if me.specifier
       if (this.specifier) {
           this.varRef = this.req(VariableRef);
           //if no me.varRef.accessors, me.sayErr "declare valid: expected accesor chain. Example: 'declare valid name.member.member'"
           if (!this.varRef.accessors) {
               this.sayErr("declare valid: expected accesor chain. Example: 'declare valid name.member.member'")};
           //return
           return;
       };

//check 'name affinity', if not, must be: global|forward|types(default)

       //if me.opt('name')
       if (this.opt('name')) {
         this.specifier = this.req('affinity');
       }
       else {
         this.specifier = this.opt('global', 'forward') || 'types';
       
       };

//all of them get a (VariableDecl,)+

       this.names = this.reqSeparatedList(VariableDecl, ',');

//check syntax

       //for varDecl in me.names
       for ( var varDecl__inx=0; varDecl__inx<this.names.length; varDecl__inx++) {
         var varDecl=this.names[varDecl__inx];
         //if me.specifier is 'types'
         if (this.specifier === 'types') {
           //if no varDecl.type or varDecl.assignedValue
           if (!varDecl.type || varDecl.assignedValue) {
             //me.sayErr "declare types: expected 'name:type, name:type,...'"
             this.sayErr("declare types: expected 'name:type, name:type,...'");
           };
         }
         else if (this.specifier === 'affinity') {
           //if varDecl.type or varDecl.assignedValue
           if (varDecl.type || varDecl.assignedValue) {
             //me.sayErr "declare name affinity: expected 'name,name,...'"
             this.sayErr("declare name affinity: expected 'name,name,...'");
           };
         };
       }; // end for each in this.names

       //return
       return;
     };
   
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

   //class DefaultAssignment, extends|super is ASTBase, constructor:
   function DefaultAssignment(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // DefaultAssignment (extends|super is) ASTBase
   DefaultAssignment.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

      //properties
        //assignment: AssignmentStatement

     //method parse()
     DefaultAssignment.prototype.parse = function(){

       //me.req 'default'
       this.req('default');
       //me.lock()
       this.lock();

       this.assignment = this.req(AssignmentStatement);
     };
   
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

   //class EndStatement, extends|super is ASTBase, constructor:
   function EndStatement(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // EndStatement (extends|super is) ASTBase
   EndStatement.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

      //properties
        //references:string array

     //method parse()
     EndStatement.prototype.parse = function(){

       //me.req 'end'
       this.req('end');

       //me.lock()
       this.lock();
       this.references = [];

//The words after `end` are just 'loose references' to the block intended to be closed
//We pick all the references up to EOL (or EOF)

       //while not me.opt('NEWLINE','EOF')
       while(!(this.opt('NEWLINE', 'EOF'))){
       

//Get optional identifier reference
//We save `end` references, to match on block indentation,
//for Example: `end for` indentation must match a `for` statement on the same indent

           //if me.lexer.token.type is 'IDENTIFIER'
           if (this.lexer.token.type === 'IDENTIFIER') {
             //me.references.push(me.lexer.token.value)
             this.references.push(this.lexer.token.value);
           };

           //me.lexer.nextToken
           this.lexer.nextToken();
       
       };//end loop
       ;
     };
   
   //end class EndStatement

        //#end loop


//## WaitForAsyncCall

//`WaitForAsyncCall: wait for fnCall-VariableRef`

//The `wait for` expression calls a normalized async function
//and `waits` for the async function to execute the callback.

//A normalized async function is an async function with the last parameter = callback(err,data)

//The waiting is implemented by exisiting libs.

//Example: `contents = wait for fs.readFile('myFile.txt','utf8')`

   //class WaitForAsyncCall, extends|super is ASTBase, constructor:
   function WaitForAsyncCall(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // WaitForAsyncCall (extends|super is) ASTBase
   WaitForAsyncCall.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

      //properties
        //varRef

     //method parse()
     WaitForAsyncCall.prototype.parse = function(){

       //me.req 'wait'
       this.req('wait');
       //me.lock()
       this.lock();

       //me.req 'for'
       this.req('for');
       this.varRef = this.req(VariableRef);
     };
   
   //end class WaitForAsyncCall


//LaunchStatement
//---------------

//`LaunchStatement: 'launch' fnCall-VariableRef`

//`launch` starts a generator function.
//The generator function rus as a co-routine, (pseudo-parallel),
//and will be paused on `wait for` statements.

//The `launch` statement will return on the first `wait for` or `yield` of the generator

   //class LaunchStatement, extends|super is ASTBase, constructor:
   function LaunchStatement(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // LaunchStatement (extends|super is) ASTBase
   LaunchStatement.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

      //properties
        //varRef

     //method parse()
     LaunchStatement.prototype.parse = function(){

       //me.req 'launch'
       this.req('launch');
       //me.lock()
       this.lock();

       this.varRef = this.req(VariableRef);
     };
   
   //end class LaunchStatement


//Adjective
//---------

//`Adjective: (public|generator|shim|helper)`

   //class Adjective, extends|super is ASTBase, constructor:
   function Adjective(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // Adjective (extends|super is) ASTBase
   Adjective.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

     //method parse()
     Adjective.prototype.parse = function(){

       this.name = this.req("public", "generator", "shim", "helper");
     };


//###a Helper method, Check validity of adjective-statement combination

     //method validate(statement)
     Adjective.prototype.validate = function(statement){

       var validCombinations = {public: ['class', 'function', 'var'], generator: ['function', 'method'], shim: ['function', 'method', 'class'], helper: ['function', 'method', 'class']};

        //declare valid:array
        //declare valid statement.keyword

        //var valid:array = validCombinations[me.name] or ['-*none*-']
       var valid = validCombinations[this.name] || ['-*none*-'];
       //if not (statement.keyword in valid)
       if (!((valid.indexOf(statement.keyword)>=0))) {
           //me.throwError "'#{me.name}' can only apply to #{valid.join('|')} not to '#{statement.keyword}'"
           this.throwError("'" + (this.name) + "' can only apply to " + (valid.join('|')) + " not to '" + (statement.keyword) + "'");
       };

//Also convert adjectives to Statement node properties to ease code generation

       statement[this.name] = true;
     };
   
   //end class Adjective


//FunctionCall
//------------

//`FunctionCall: VariableRef ["("] (Expression,) [")"]`

   //class FunctionCall, extends|super is ASTBase, constructor:
   function FunctionCall(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // FunctionCall (extends|super is) ASTBase
   FunctionCall.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

      //properties
          //varRef: VariableRef

     //method parse(options)
     FunctionCall.prototype.parse = function(options){

        //declare valid me.parent.preParsedVarRef
        //declare valid me.name.executes
        //declare valid me.name.executes

//Check for VariableRef. - can include (...) FunctionAccess

        //if me.parent.preParsedVarRef #VariableRef already parsed
       //if me.parent.preParsedVarRef #VariableRef already parsed
       if (this.parent.preParsedVarRef) {//#VariableRef already parsed
         this.varRef = this.parent.preParsedVarRef;//#use it
       }
       else {
         this.varRef = this.req(VariableRef);
       
       };

//if the last accessor is function call, this is already a FunctionCall

       //if me.varRef.executes
       if (this.varRef.executes) {
           //return #already a function call
           return;//#already a function call
       };

//Here we assume is a function call without parentheses, a 'command'

       //if me.lexer.token.type in ['NEWLINE','EOF']
       if (['NEWLINE', 'EOF'].indexOf(this.lexer.token.type)>=0) {
          //# no more tokens, let's asume FnCall w/o parentheses and w/o parameters
         //return
         return;
       };

//else, get parameters, add to varRef as FunctionAccess accessor

       var functionAccess = new FunctionAccess(this.varRef);
       functionAccess.args = functionAccess.optSeparatedList(Expression, ",");

       //me.varRef.addAccessor functionAccess
       this.varRef.addAccessor(functionAccess);

//keep track of `require` calls

       //if me.varRef.name is 'require'
       if (this.varRef.name === 'require') {
           //me.getParent(Module).requireCallNodes.push me.varRef
           this.getParent(Module).requireCallNodes.push(this.varRef);
       };
     };
   
   //end class FunctionCall


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

   //class Statement, extends|super is ASTBase, constructor:
   function Statement(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // Statement (extends|super is) ASTBase
   Statement.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

      //properties
        //adjectives: Adjective array
        //statement
        //preParsedVarRef

     //method parse()
     Statement.prototype.parse = function(){

        //#debug show line and tokens
       //debug ""
       debug("");
       //me.lexer.infoLine.dump()
       this.lexer.infoLine.dump();

//#support old SYNTAX -  method initialize = constructor - REMOVE LATER

//        var pos=me.lexer.getPos()
//        if me.opt('method')
//          if me.opt('initialize')
//            me.lexer.returnToken()
//            me.lexer.token.value ='constructor'
//          else
//            me.lexer.setPos pos
//#END support old SYNTAX -

//First, fast-parse the statement by using a table.
//We look up the token (keyword) in **StatementsDirect** table, and parse the specific AST node

       this.statement = this.parseDirect(this.lexer.token.value, StatementsDirect);
       //if no me.statement
       if (!this.statement) {

//If it was not found, try optional adjectives (zero or more). Adjectives precede statement keyword.
//Recognized adjectives are: `(public|generator|shim|helper)`.

         this.adjectives = this.optList(Adjective);

//Now re-try fast-parse

         this.statement = this.parseDirect(this.lexer.token.value, StatementsDirect);
         //if no me.statement
         if (!this.statement) {

//If the token wasn't on StatementsDirect, or parse failed, lets try DoNothingStatement
//(It is not in StatementsDirect because starts wih 'do' as DoLoopStatement)

           this.statement = this.opt(DoNothingStatement);
           //if no me.statement
           if (!this.statement) {

//Last possibilities are: fnCall-VariableRef or AssignmentStatement
//both start with a VariableRef:

//(performance) **require** & pre-parse the VariableRef

             this.preParsedVarRef = this.req(VariableRef);

//Then we require a AssignmentStatement|FunctionCall

             this.statement = this.req(AssignmentStatement, FunctionCall);

             this.preParsedVarRef = undefined;//#clear
           };
         };
       };

        //#end if - statement parse tries

//If we reached here, we have parsed a valid statement
//Check validity of adjective-statement combination

       //if me.adjectives
       if (this.adjectives) {
         //for adj in me.adjectives
         for ( var adj__inx=0; adj__inx<this.adjectives.length; adj__inx++) {
           var adj=this.adjectives[adj__inx];
           //adj.validate(me.statement)
           adj.validate(this.statement);
         }; // end for each in this.adjectives
       };
     };


//###a helper method to check adjectives asosciated to this statement

     //method isAdjectivated(adjName)
     Statement.prototype.isAdjectivated = function(adjName){

       //if me.adjectives
       if (this.adjectives) {
         //for adj in me.adjectives
         for ( var adj__inx=0; adj__inx<this.adjectives.length; adj__inx++) {
           var adj=this.adjectives[adj__inx];
           //if adj.name is adjName
           if (adj.name === adjName) {
             //return true
             return true;
           };
         }; // end for each in this.adjectives
       };
     };
   
   //end class Statement




//## Body

//`Body: (Statement;)`

//Body is a semicolon-separated list of statements (At least one)

//`Body` is used for "Module" body, "class" body, "function" body, etc.
//Anywhere a list of semicolon separated statements apply.

   //class Body, extends|super is ASTBase, constructor:
   function Body(){
   // default constructor: call super.constructor
       return ASTBase.prototype.constructor.apply(this,arguments)
   };
   // Body (extends|super is) ASTBase
   Body.prototype.__proto__ = ASTBase.prototype;
   
   // declared properties & methods

      //properties
        //statements: Statement array

     //method parse()
     Body.prototype.parse = function(){

       //if me.lexer.token.type isnt 'NEWLINE'
       if (this.lexer.token.type !== 'NEWLINE') {
           //me.lexer.sayErr "Expected NEWLINE before indented body"
           this.lexer.sayErr("Expected NEWLINE before indented body");
       };

//We use the generic ***ASTBase.reqSeparatedList*** to get a list of **Statement** symbols,
//*semicolon* separated or in freeForm mode: one statement per line, closed when indent changes.

       this.statements = this.reqSeparatedList(Statement, ";");
     };
   
   //end class Body


//## Single Line Statement

//This construction is used when a statement is expected on the same line.
//It is used by `IfStatement: if conditon-Expression (','|then) *SingleLineStatement*`
//It is also used for the increment statemenf in for-while loops:`for x=0; while x<10 [,SingleLineStatement]`

   //class SingleLineStatement, extends|super is Statement, constructor:
   function SingleLineStatement(){
   // default constructor: call super.constructor
       return Statement.prototype.constructor.apply(this,arguments)
   };
   // SingleLineStatement (extends|super is) Statement
   SingleLineStatement.prototype.__proto__ = Statement.prototype;
   
   // declared properties & methods

      //properties
        //statements: Statement array

     //method parse()
     SingleLineStatement.prototype.parse = function(){

       //if me.lexer.token.type is 'NEWLINE'
       if (this.lexer.token.type === 'NEWLINE') {
         //me.lexer.returnToken()
         this.lexer.returnToken();
         //me.lock()
         this.lock();
         //me.lexer.sayErr "Expected statement on the same line after '#{me.lexer.token.value}'"
         this.lexer.sayErr("Expected statement on the same line after '" + (this.lexer.token.value) + "'");
       };

        //# normally: ReturnStatement, ThrowStatement, PrintStatement, AssignmentStatement
        //# but we parse any Statement

       this.statements = this.reqSeparatedList(Statement, ";");
     };
   
   //end class SingleLineStatement

//## Module

//The `Module` represents a complete source file.

   //class Module, extends|super is Body, constructor:
   function Module(){
   // default constructor: call super.constructor
       return Body.prototype.constructor.apply(this,arguments)
   };
   // Module (extends|super is) Body
   Module.prototype.__proto__ = Body.prototype;
   
   // declared properties & methods

     //method parse()
     Module.prototype.parse = function(){

//We start by locking. There is no other construction to try,
//if Module.parse() fails we abort compilation.

         //me.lock()
         this.lock();

//Get Module body: Statements, separated by NEWLINE|';' closer:'EOF'

         this.statements = this.optFreeFormList(Statement, ';', 'EOF');
     };
   
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

   var StatementsDirect = {'var': VarStatement, 'let': VarStatement, 'function': FunctionDeclaration, 'class': ClassDeclaration, 'append': AppendToDeclaration, 'constructor': ConstructorDeclaration, 'properties': PropertiesDeclaration, 'namespace': PropertiesDeclaration, 'method': MethodDeclaration, 'default': DefaultAssignment, 'if': IfStatement, 'when': IfStatement, 'for': ForStatement, 'while': WhileUntilLoop, 'until': WhileUntilLoop, 'do': DoLoop, 'break': LoopControlStatement, 'continue': LoopControlStatement, 'end': EndStatement, 'return': ReturnStatement, 'print': PrintStatement, 'throw': ThrowStatement, 'raise': ThrowStatement, 'fail': ThrowStatement, 'try': TryCatch, 'exception': ExceptionBlock, 'debugger': DebuggerStatement, 'declare': DeclareStatement, 'compile': CompilerStatement, 'compiler': CompilerStatement, 'wait': WaitForAsyncCall, 'launch': LaunchStatement};

   var AccessorsDirect = {'.': PropertyAccess, '[': IndexAccess, '(': FunctionAccess};


   //helper function autoCapitalizeCoreClasses(name:string) returns String
   function autoCapitalizeCoreClasses(name){
      //#auto-capitalize core classes
     //if name in ['string','array','number','object','function','boolean']
     if (['string', 'array', 'number', 'object', 'function', 'boolean'].indexOf(name)>=0) {
       //return name.capitalized()
       return name.capitalized();
     };
     //return name
     return name;
   };

//------------
//Exports

//A list of Grammar classes to export.

   exports.ASTBase = ASTBase;

   exports.Expression = Expression;
   exports.VariableRef = VariableRef;
   exports.FunctionCall = FunctionCall;

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
   exports.Operand = Operand;
   exports.UnaryOper = UnaryOper;
   exports.Oper = Oper;
   exports.DefaultAssignment = DefaultAssignment;

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
   exports.MethodDeclaration = MethodDeclaration;

   exports.PrintStatement = PrintStatement;
   exports.EndStatement = EndStatement;
   exports.ConstructorDeclaration = ConstructorDeclaration;
   exports.AppendToDeclaration = AppendToDeclaration;
   exports.TryCatch = TryCatch;
   exports.ExceptionBlock = ExceptionBlock;
   exports.WaitForAsyncCall = WaitForAsyncCall;
   exports.PropertiesDeclaration = PropertiesDeclaration;