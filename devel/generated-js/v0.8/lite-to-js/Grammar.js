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
//* we use `[Symbol]` for optional symbols instead of `Symbol?` (brackets also groups symbols, the entire group is optional)
//* symbols upper/lower case has meaning
//* we add `(Symbol,)` for `comma separated List of` as a powerful syntax option
//Examples:
//`ReturnStatement`    : CamelCase is reserved for non-terminal symbol<br>
//`function`       : all-lowercase means the literal word<br>
//`":"`            : literal symbols are quoted<br>
//`IDENTIFIER`,`OPER` : all-uppercase denotes entire classes of symbols<br>
//`NEWLINE`,`EOF`     : or special unprintable characters<br>
//`[to]`               : Optional symbols are enclosed in brackets<br>
//`(var|let)`          : The vertical bar represents ordered alternatives<br>
//`(Oper Operand)`     : Parentheses groups symbols<br>
//`(Oper Operand)*`    : Asterisk after a group `()*` means the group can repeat (meaning one or more)<br>
//`[Oper Operand]*`    : Asterisk after a optional group `[]*` means *zero* or more of the group.<br>
//`[Expression,]` : the comma means a comma "Separated List".<br>
//`Body: (Statement;)` : the semicolon means: a semicolon "Separated List".<br>
//###"Separated List"
//Example: `FunctionCall: IDENTIFIER '(' [Expression,] ')'`
//`[Expression,]` means *optional* **comma "Separated List"** of Expressions. 
//Since the comma is inside a **[ ]** group, it means the entire list is optional.
//Example: `VarStatement: (VariableDecl,)`, where `VariableDecl: IDENTIFIER ["=" Expression]`
//`(VariableDecl,)` means **comma "Separated List"** of `VariableDecl` 
//Since the comma is inside a **( )** group, it means at least one of the Symbol is required.
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
    //import ASTBase, logger, UniqueID
    var ASTBase = require('./ASTBase.js');
    var logger = require('./lib/logger.js');
    var UniqueID = require('./lib/UniqueID.js');
    //shim import Map, PMREX
    var Map = require('./lib/Map.js');
    var PMREX = require('./lib/PMREX.js');
//Reserved Words
//---------------
//Words that are reserved in LiteScript and cannot be used as variable or function names
//(There are no restrictions to object property names)
    //var RESERVED_WORDS = [
        //'namespace'
        //'function','async'
        //'class','method'
        //'if','then','else','switch','when','case','end'
        //'null','true','false','undefined'
        //'and','or','but','no','not','has','hasnt','property','properties'
        //'new','is','isnt','prototype'
        //'do','loop','while','until','for','to','break','continue'
        //'return','try','catch','throw','raise','fail','exception','finally'
        //'with','arguments','in','instanceof','typeof'
        //'var','let','default','delete','interface','implements','yield'
        //'like','this','super'
        //'export','compiler','compile','debugger'
        ////-----------------
        //// "C" production reserved words
        //'char','short','long','int','unsigned','void','NULL','bool','assert' 
    var RESERVED_WORDS = ['namespace', 'function', 'async', 'class', 'method', 'if', 'then', 'else', 'switch', 'when', 'case', 'end', 'null', 'true', 'false', 'undefined', 'and', 'or', 'but', 'no', 'not', 'has', 'hasnt', 'property', 'properties', 'new', 'is', 'isnt', 'prototype', 'do', 'loop', 'while', 'until', 'for', 'to', 'break', 'continue', 'return', 'try', 'catch', 'throw', 'raise', 'fail', 'exception', 'finally', 'with', 'arguments', 'in', 'instanceof', 'typeof', 'var', 'let', 'default', 'delete', 'interface', 'implements', 'yield', 'like', 'this', 'super', 'export', 'compiler', 'compile', 'debugger', 'char', 'short', 'long', 'int', 'unsigned', 'void', 'NULL', 'bool', 'assert'];
        //]
//Operators precedence
//--------------------
//The order of symbols here determines operators precedence
    //var operatorsPrecedence = [ 
      //'++','--', 'unary -', 'unary +', 'bitnot' ,'bitand', 'bitor', 'bitxor'
      //,'>>','<<'
      //,'new','type of','instance of','has property'
      //,'*','/','%','+','-','&'
      //,'into','in'
      //,'>','<','>=','<=','is','<>','!==','like'
      //,'no','not','and','but','or'
      //,'?',':' 
    var operatorsPrecedence = ['++', '--', 'unary -', 'unary +', 'bitnot', 'bitand', 'bitor', 'bitxor', '>>', '<<', 'new', 'type of', 'instance of', 'has property', '*', '/', '%', '+', '-', '&', 'into', 'in', '>', '<', '>=', '<=', 'is', '<>', '!==', 'like', 'no', 'not', 'and', 'but', 'or', '?', ':'];
    //]
//--------------------------
//LiteScript Grammar - AST Classes
//================================
//This file is code and documentation, you'll find a class 
//for each syntax construction the compiler accepts.
//### export class PrintStatement extends ASTBase
    // constructor
    function PrintStatement(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
//`PrintStatement: 'print' [Expression,]`
//This handles `print` followed by an optional comma separated list of expressions
      //properties
        //args: array of Expression 
    };
    // PrintStatement (extends|proto is) ASTBase
    PrintStatement.prototype.__proto__ = ASTBase.prototype;
      //method parse()
      PrintStatement.prototype.parse = function(){
        //.req 'print'
        this.req('print');
//At this point we lock because it is definitely a `print` statement. Failure to parse the expression 
//from this point is a syntax error.
        //.lock()
        this.lock();
        //.args = this.optSeparatedList(Expression,",")
        this.args = this.optSeparatedList(Expression, ",");
      };
    // export
    module.exports.PrintStatement = PrintStatement;
    
    // end class PrintStatement
//### export helper class VarDeclList extends ASTBase
    // constructor
    function VarDeclList(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
      //properties 
        //list: array of VariableDecl 
    };
    // VarDeclList (extends|proto is) ASTBase
    VarDeclList.prototype.__proto__ = ASTBase.prototype;
      //method parseList
      VarDeclList.prototype.parseList = function(){
        //.list = .reqSeparatedList(VariableDecl,",")
        this.list = this.reqSeparatedList(VariableDecl, ",");
      };
    // export
    module.exports.VarDeclList = VarDeclList;
    
    // end class VarDeclList
//### export class VarStatement extends VarDeclList
    // constructor
    function VarStatement(){ // default constructor
    // default constructor: call super.constructor
        VarDeclList.prototype.constructor.apply(this,arguments)
    };
    // VarStatement (extends|proto is) VarDeclList
    VarStatement.prototype.__proto__ = VarDeclList.prototype;
//`VarStatement: (var|let) (VariableDecl,)+ `
//`var` followed by a comma separated list of VariableDecl (one or more)
      //method parse()
      VarStatement.prototype.parse = function(){
        //.req 'var','let'
        this.req('var', 'let');
        //.lock
        this.lock();
        //.parseList
        this.parseList();
      };
    // export
    module.exports.VarStatement = VarStatement;
    
    // end class VarStatement
        
//### export class VariableDecl extends ASTBase
    // constructor
    function VariableDecl(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
    
//`VariableDecl: IDENTIFIER [':' dataType-VariableRef] ['=' assignedValue-Expression]`
//(variable name, optional type anotation and optionally assign a value)
//Note: If no value is assigned, `= undefined` is assumed
//VariableDecls are used in `var` statement, in function parameter declaration
//and in class properties declaration
//Example:  
  //`var a : string = 'some text'` <br> 
  //`function x ( a : string = 'some text', b, c=0)`
      //properties
        //aliasVarRef: VariableRef
        //assignedValue: Expression
    };
    // VariableDecl (extends|proto is) ASTBase
    VariableDecl.prototype.__proto__ = ASTBase.prototype;
      //declare name affinity varDecl, paramDecl
      
      //method parse()
      VariableDecl.prototype.parse = function(){
        //.name = .req('IDENTIFIER')
        this.name = this.req('IDENTIFIER');
        //.lock()
        this.lock();
        //if .name in RESERVED_WORDS, .sayErr '"#{.name}" is a reserved word'
        if (RESERVED_WORDS.indexOf(this.name)>=0) {this.sayErr('"' + this.name + '" is a reserved word')};
//optional type annotation & 
//optional assigned value 
        //var parseFreeForm
        var parseFreeForm = undefined;
        //if .opt(':') 
        if (this.opt(':')) {
            //.parseType
            this.parseType();
        };
            ////Note: parseType if parses "Map", stores type as a VarRef->Map and also sets .isMap=true
        //if .opt('=') 
        if (this.opt('=')) {
            //if .lexer.token.type is 'NEWLINE' #dangling assignment "="[NEWLINE]
            if (this.lexer.token.type === 'NEWLINE') {// #dangling assignment "="[NEWLINE]
                //parseFreeForm=true
                parseFreeForm = true;
            }
            else if (this.lexer.token.value === 'map') {// #literal map creation "x = map"[NEWLINE]name:value[NEWLINE]name=value...
            //else if .lexer.token.value is 'map' #literal map creation "x = map"[NEWLINE]name:value[NEWLINE]name=value...
                //.req 'map'
                this.req('map');
                //.type='Map'
                this.type = 'Map';
                //.isMap = true
                this.isMap = true;
                //parseFreeForm=true
                parseFreeForm = true;
            }
            else {
            //else // just assignment on the same line
                //if .lexer.interfaceMode //assignment in interfaces => declare var alias. as in: `var $=jQuery`
                if (this.lexer.interfaceMode) { //assignment in interfaces => declare var alias. as in: `var $=jQuery`
                    //.aliasVarRef = .req(VariableRef)
                    this.aliasVarRef = this.req(VariableRef);
                }
                else {
                //else
                    //.assignedValue = .req(Expression)
                    this.assignedValue = this.req(Expression);
                };
            };
        };
        
        //if parseFreeForm #dangling assignment, parse a free-form object literal as assigned value
        if (parseFreeForm) {// #dangling assignment, parse a free-form object literal as assigned value
            //.assignedValue   = .req(FreeObjectLiteral)
            this.assignedValue = this.req(FreeObjectLiteral);
        };
//if was declared with type Map, (freeform or not) initialization literal is also map.
//e.g: `var myMap: map string to any = {}`. Because of type:Map, 
//the expression `{}` gets compiled as `new Map().fromObject({})`
        //if .isMap and .assignedValue
        if (this.isMap && this.assignedValue) {
            //.assignedValue.type='Map'
            this.assignedValue.type = 'Map';
            //.assignedValue.isMap = true
            this.assignedValue.isMap = true;
        };
      };
    // export
    module.exports.VariableDecl = VariableDecl;
    
    // end class VariableDecl
//##FreeObjectLiteral and Free-Form Separated List
//In *free-form* mode, each item stands on its own line, and separators (comma/semicolon)
//are optional, and can appear after or before the NEWLINE.
//For example, given the previous example: **VarStatement: (IDENTIFIER ["=" Expression] ,)**,
//all the following constructions are equivalent and valid in LiteScript:
//Examples: /*
    ////standard js
    //var a = {prop1:30 prop2: { prop2_1:19, prop2_2:71} arr:["Jan","Feb","Mar"]}
    ////LiteScript: mixed freeForm and comma separated
    //var a =
        //prop1: 30
        //prop2:
          //prop2_1: 19, prop2_2: 71
        //arr: [ "Jan",
              //"Feb", "Mar"]
    ////LiteScript: in freeForm, commas are optional
    //var a = 
        //prop1: 30
        //prop2:
          //prop2_1: 19,
          //prop2_2: 71,
        //arr: [
            //"Jan",
            //"Feb"
            //"Mar"
            //]
//*/
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
//Examples: /*
  //js:
    //Console.log(title,subtitle,line1,line2,value,recommendation)
  //LiteScript available variations:
    //print title,subtitle,
          //line1,line2,
          //value,recommendation
    //print
      //title
      //subtitle
      //line1
      //line2
      //value
      //recommendation
  //js:
  
    //var a=10, b=20, c=30,
        //d=40;
    //function complexFn( 10, 4, 'sample'
       //'see 1', 
       //2+2, 
       //null ){
      //...function body...
    //};
  //LiteScript:
    //var
      //a=10,b=20
      //c=30,d=40
    //function complexFn(
      //10       # determines something important to this function
      //4        # do not pass nulll to this
      //'sample' # this is original data
      //'see 1'  # note param
      //2+2      # useful tip
      //null     # reserved for extensions ;)
      //)
      //...function body...
//*/
//### export class PropertiesDeclaration extends VarDeclList
    // constructor
    function PropertiesDeclaration(){ // default constructor
    // default constructor: call super.constructor
        VarDeclList.prototype.constructor.apply(this,arguments)
    };
    // PropertiesDeclaration (extends|proto is) VarDeclList
    PropertiesDeclaration.prototype.__proto__ = VarDeclList.prototype;
//`PropertiesDeclaration: [namespace] properties (VariableDecl,)`
//The `properties` keyword is used inside classes to define properties of the class instances.
      //declare name affinity propDecl
      
      
      //method parse()
      PropertiesDeclaration.prototype.parse = function(){
        //.req 'properties'
        this.req('properties');
        //.lock
        this.lock();
        //.parseList
        this.parseList();
      };
    // export
    module.exports.PropertiesDeclaration = PropertiesDeclaration;
    
    // end class PropertiesDeclaration
//### export class WithStatement extends ASTBase
    // constructor
    function WithStatement(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
//`WithStatement: with VariableRef Body`
//The WithStatement simplifies calling several methods of the same object:
//Example:
//```    
//with frontDoor
    //.show
    //.open
    //.show
    //.close
    //.show
//```
      //properties
        //varRef, body
    };
    // WithStatement (extends|proto is) ASTBase
    WithStatement.prototype.__proto__ = ASTBase.prototype;
      //method parse()
      WithStatement.prototype.parse = function(){
        //.req 'with'
        this.req('with');
        //.lock()
        this.lock();
        //.name = UniqueID.getVarName('with')  #unique 'with' storage var name
        this.name = UniqueID.getVarName('with');// #unique 'with' storage var name
        //.varRef = .req(VariableRef)
        this.varRef = this.req(VariableRef);
        //.body = .req(Body)
        this.body = this.req(Body);
      };
    // export
    module.exports.WithStatement = WithStatement;
    
    // end class WithStatement
//### export class TryCatch extends ASTBase
    // constructor
    function TryCatch(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
//`TryCatch: 'try' Body ExceptionBlock`
//Defines a `try` block for trapping exceptions and handling them. 
      //properties body,exceptionBlock
    };
    // TryCatch (extends|proto is) ASTBase
    TryCatch.prototype.__proto__ = ASTBase.prototype;
      //method parse()
      TryCatch.prototype.parse = function(){
        //.req 'try'
        this.req('try');
        //.lock()
        this.lock();
        //.body = .req(Body)
        this.body = this.req(Body);
        //.exceptionBlock = .req(ExceptionBlock)
        this.exceptionBlock = this.req(ExceptionBlock);
        //if .exceptionBlock.indent isnt .indent
        if (this.exceptionBlock.indent !== this.indent) {
            //.sayErr "try: misaligned try-catch indent"
            this.sayErr("try: misaligned try-catch indent");
            //.exceptionBlock.sayErr "catch: misaligned try-catch indent"
            this.exceptionBlock.sayErr("catch: misaligned try-catch indent");
        };
      };
    // export
    module.exports.TryCatch = TryCatch;
    
    // end class TryCatch
//### export class ExceptionBlock extends ASTBase
    // constructor
    function ExceptionBlock(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
//`ExceptionBlock: (exception|catch) IDENTIFIER Body [finally Body]`
//Defines a `catch` block for trapping exceptions and handling them. 
//`try` should precede this construction for 'catch' keyword.
//`try{` will be auto-inserted for the 'Exception' keyword.
      //properties 
        //catchVar:string
        //body,finallyBody
    };
    // ExceptionBlock (extends|proto is) ASTBase
    ExceptionBlock.prototype.__proto__ = ASTBase.prototype;
      //method parse()
      ExceptionBlock.prototype.parse = function(){
        //.keyword = .req('catch','exception','Exception')
        this.keyword = this.req('catch', 'exception', 'Exception');
        //.lock()
        this.lock();
//in order to correctly count frames to unwind on "return" from inside a try-catch
//catch"'s parent MUST BE ONLY "try"
        //if .keyword is 'catch' and .parent.constructor isnt TryCatch
        if (this.keyword === 'catch' && this.parent.constructor !== TryCatch) {
            //.throwError "internal error, expected 'try' as 'catch' previous block"
            this.throwError("internal error, expected 'try' as 'catch' previous block");
        };
//get catch variable - Note: catch variables in js are block-scoped
        //.catchVar = .req('IDENTIFIER')
        this.catchVar = this.req('IDENTIFIER');
//get body 
        //.body = .req(Body)
        this.body = this.req(Body);
//get optional "finally" block
        //if .opt('finally'), .finallyBody = .req(Body)
        if (this.opt('finally')) {this.finallyBody = this.req(Body)};
//validate grammar: try=>catch / function=>exception
        //if .keyword is 'exception' 
        if (this.keyword === 'exception') {
            //if .parent.constructor isnt Statement 
            if (this.parent.constructor !== Statement || !(this.parent.parent instanceof Body) || !(this.parent.parent.parent instanceof FunctionDeclaration)) {
              //or .parent.parent isnt instance of Body
              //or .parent.parent.parent isnt instance of FunctionDeclaration
                  //.sayErr '"Exception" block should be the part of function/method/constructor body - use "catch" to match a "try" block'
                  this.sayErr('"Exception" block should be the part of function/method/constructor body - use "catch" to match a "try" block');
            };
//here, it is a "exception" block in a FunctionDeclaration. 
//Mark the function as having an ExceptionBlock in order to
//insert "try{" at function start and also handle C-exceptions unwinding
            //var theFunctionDeclaration = .parent.parent.parent
            var theFunctionDeclaration = this.parent.parent.parent;
            //theFunctionDeclaration.hasExceptionBlock = true
            theFunctionDeclaration.hasExceptionBlock = true;
        };
      };
    // export
    module.exports.ExceptionBlock = ExceptionBlock;
    
    // end class ExceptionBlock
//### export class ThrowStatement extends ASTBase
    // constructor
    function ThrowStatement(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
      
//`ThrowStatement: (throw|raise|fail with) Expression`
//This handles `throw` and its synonyms followed by an expression 
      //properties specifier, expr
    };
    // ThrowStatement (extends|proto is) ASTBase
    ThrowStatement.prototype.__proto__ = ASTBase.prototype;
      //method parse()
      ThrowStatement.prototype.parse = function(){
        //.specifier = .req('throw', 'raise', 'fail')
        this.specifier = this.req('throw', 'raise', 'fail');
//At this point we lock because it is definitely a `throw` statement
        //.lock()
        this.lock();
        //if .specifier is 'fail', .req 'with'
        if (this.specifier === 'fail') {this.req('with')};
        //.expr = .req(Expression) #trow expression
        this.expr = this.req(Expression);// #trow expression
      };
    // export
    module.exports.ThrowStatement = ThrowStatement;
    
    // end class ThrowStatement
//### export class ReturnStatement extends ASTBase
    // constructor
    function ReturnStatement(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
//`ReturnStatement: return Expression`
      //properties expr:Expression
    };
    // ReturnStatement (extends|proto is) ASTBase
    ReturnStatement.prototype.__proto__ = ASTBase.prototype;
      //method parse()
      ReturnStatement.prototype.parse = function(){
        //.req 'return'
        this.req('return');
        //.lock()
        this.lock();
        //.expr = .opt(Expression)
        this.expr = this.opt(Expression);
      };
    // export
    module.exports.ReturnStatement = ReturnStatement;
    
    // end class ReturnStatement
//### export class IfStatement extends ASTBase
    // constructor
    function IfStatement(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
      
//`IfStatement: (if|when) Expression (then|',') SingleLineBody [ElseIfStatement|ElseStatement]*`
//`IfStatement: (if|when) Expression Body [ElseIfStatement|ElseStatement]*`
 
//Parses `if` statments and any attached `else` or chained `else if` 
      //properties 
        //conditional: Expression
        //body
        //elseStatement
    };
    // IfStatement (extends|proto is) ASTBase
    IfStatement.prototype.__proto__ = ASTBase.prototype;
      //method parse()
      IfStatement.prototype.parse = function(){
        //.req 'if','when'
        this.req('if', 'when');
        //.lock()
        this.lock();
        //.conditional = .req(Expression)
        this.conditional = this.req(Expression);
//after `,` or `then`, a statement on the same line is required 
//if we're processing all single-line if's, ',|then' is *required*
//choose same body class as parent:
//either SingleLineBody or Body (multiline indented)
        //if .opt(',','then')
        if (this.opt(',', 'then')) {
            //.body = .req(SingleLineBody)
            this.body = this.req(SingleLineBody);
            //.req 'NEWLINE'
            this.req('NEWLINE');
        }
        else {
        //else # and indented block
            //.body = .req(Body)
            this.body = this.req(Body);
        };
        //end if
        
//control: "if"-"else" are related by having the same indent
        //if .lexer.token.value is 'else'
        if (this.lexer.token.value === 'else') {
            //if .lexer.index isnt 0 
            if (this.lexer.index !== 0) {
                //.throwError 'expected "else" to start on a new line'
                this.throwError('expected "else" to start on a new line');
            };
            //if .lexer.indent < .indent
            if (this.lexer.indent < this.indent) {
                //#token is 'else' **BUT IS LESS-INDENTED**. It is not the "else" to this "if"
                //return
                return;
            };
            //if .lexer.indent > .indent
            if (this.lexer.indent > this.indent) {
                //.throwError "'else' statement is over-indented"
                this.throwError("'else' statement is over-indented");
            };
        };
        //end if
        
//Now get optional `[ElseIfStatement|ElseStatement]`
        //.elseStatement = .opt(ElseIfStatement, ElseStatement)
        this.elseStatement = this.opt(ElseIfStatement, ElseStatement);
      };
    // export
    module.exports.IfStatement = IfStatement;
    
    // end class IfStatement
//### export class ElseIfStatement extends ASTBase
    // constructor
    function ElseIfStatement(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
//`ElseIfStatement: (else|otherwise) if Expression Body`
//This class handles chained else-if statements
      //properties 
        //nextIf
    };
    // ElseIfStatement (extends|proto is) ASTBase
    ElseIfStatement.prototype.__proto__ = ASTBase.prototype;
      //method parse()
      ElseIfStatement.prototype.parse = function(){
        //.req 'else'
        this.req('else');
        //.req 'if'
        this.req('if');
        //.lock()
        this.lock();
//return the consumed 'if', to parse as a normal `IfStatement`
        //.lexer.returnToken()
        this.lexer.returnToken();
        //.nextIf = .req(IfStatement)
        this.nextIf = this.req(IfStatement);
      };
    // export
    module.exports.ElseIfStatement = ElseIfStatement;
    
    // end class ElseIfStatement
//### export class ElseStatement extends ASTBase
    // constructor
    function ElseStatement(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
//`ElseStatement: else (Statement | Body) `
//This class handles closing "else" statements
      
      //properties body
    };
    // ElseStatement (extends|proto is) ASTBase
    ElseStatement.prototype.__proto__ = ASTBase.prototype;
      
      //method parse()
      ElseStatement.prototype.parse = function(){
        //.req 'else'
        this.req('else');
        //.lock()
        this.lock();
        //.body = .req(Body)
        this.body = this.req(Body);
      };
    // export
    module.exports.ElseStatement = ElseStatement;
    
    // end class ElseStatement
//Loops
//=====
//LiteScript provides the standard js and C `while` loop, a `until` loop
//and a `do... loop while|until`
//DoLoop
//------
//`DoLoop: do [pre-WhileUntilExpression] [":"] Body loop`
//`DoLoop: do [":"] Body loop [post-WhileUntilExpression]`
//do-loop can have a optional pre-condition or a optional post-condition
//##### Case 1) do-loop without any condition
//a do-loop without any condition is an *infinite loop* (usually with a `break` statement inside)
//Example: 
//```
//var x=1
//do:
  //x++
  //print x
  //if x is 10, break
//loop
//```
//##### Case 2) do-loop with pre-condition
//A do-loop with pre-condition, is the same as a while|until loop
//Example:
//```
//var x=1
//do while x<10
  //x++
  //print x
//loop
//```
//##### Case 3) do-loop with post-condition
//A do-loop with post-condition, execute the block, at least once, and after each iteration, 
//checks the post-condition, and loops `while` the expression is true
//*or* `until` the expression is true 
//Example:
//```
//var x=1
//do
  //x++
  //print x
//loop while x < 10
//```
//#### Implementation
    //public class DoLoop extends ASTBase
    // constructor
    function DoLoop(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
      
      //properties 
        //preWhileUntilExpression
        //body
        //postWhileUntilExpression
    };
    // DoLoop (extends|proto is) ASTBase
    DoLoop.prototype.__proto__ = ASTBase.prototype;
      //method parse()
      DoLoop.prototype.parse = function(){
        //.req 'do'
        this.req('do');
        //if .opt('nothing')
        if (this.opt('nothing')) {
          //.throwParseFailed('is do nothing')
          this.throwParseFailed('is do nothing');
        };
        //.opt ":"
        this.opt(":");
        //.lock()
        this.lock();
//Get optional pre-condition
        //.preWhileUntilExpression = .opt(WhileUntilExpression)
        this.preWhileUntilExpression = this.opt(WhileUntilExpression);
        //.body = .opt(Body)
        this.body = this.opt(Body);
        //.req "loop"
        this.req("loop");
//Get optional post-condition
        //.postWhileUntilExpression = .opt(WhileUntilExpression)
        this.postWhileUntilExpression = this.opt(WhileUntilExpression);
        //if .preWhileUntilExpression and .postWhileUntilExpression
        if (this.preWhileUntilExpression && this.postWhileUntilExpression) {
          //.sayErr "Loop: cannot have a pre-condition a and post-condition at the same time"
          this.sayErr("Loop: cannot have a pre-condition a and post-condition at the same time");
        };
      };
    // export
    module.exports.DoLoop = DoLoop;
    
    // end class DoLoop
//### export class WhileUntilLoop extends DoLoop
    // constructor
    function WhileUntilLoop(){ // default constructor
    // default constructor: call super.constructor
        DoLoop.prototype.constructor.apply(this,arguments)
    };
    // WhileUntilLoop (extends|proto is) DoLoop
    WhileUntilLoop.prototype.__proto__ = DoLoop.prototype;
      
//`WhileUntilLoop: pre-WhileUntilExpression Body`
//Execute the block `while` the condition is true or `until` the condition is true.
//WhileUntilLoop are a simpler form of loop. The `while` form, is the same as in C and js.
//WhileUntilLoop derives from DoLoop, to use its `.produce()` method.
      //method parse()
      WhileUntilLoop.prototype.parse = function(){
        //.preWhileUntilExpression = .req(WhileUntilExpression)
        this.preWhileUntilExpression = this.req(WhileUntilExpression);
        //.lock()
        this.lock();
        //.body = .opt(Body)
        this.body = this.opt(Body);
      };
    // export
    module.exports.WhileUntilLoop = WhileUntilLoop;
    
    // end class WhileUntilLoop
//### export helper class WhileUntilExpression extends ASTBase
    // constructor
    function WhileUntilExpression(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
      
//common symbol for loops conditions. Is the word 'while' or 'until' 
//followed by a boolean-Expression
//`WhileUntilExpression: ('while'|'until') boolean-Expression`
      //properties expr:Expression
    };
    // WhileUntilExpression (extends|proto is) ASTBase
    WhileUntilExpression.prototype.__proto__ = ASTBase.prototype;
      //method parse()
      WhileUntilExpression.prototype.parse = function(){
        //.name = .req('while','until')
        this.name = this.req('while', 'until');
        //.lock()
        this.lock();
        //.expr = .req(Expression)
        this.expr = this.req(Expression);
      };
    // export
    module.exports.WhileUntilExpression = WhileUntilExpression;
    
    // end class WhileUntilExpression
//### export class LoopControlStatement extends ASTBase
    // constructor
    function LoopControlStatement(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
      
//`LoopControlStatement: (break|continue) [loop]`
//This handles the `break` and `continue` keywords.
//'continue' jumps to the start of the loop (as C & Js: 'continue')
      //properties control
    };
    // LoopControlStatement (extends|proto is) ASTBase
    LoopControlStatement.prototype.__proto__ = ASTBase.prototype;
      //method parse()
      LoopControlStatement.prototype.parse = function(){
        //.control = .req('break','continue')
        this.control = this.req('break', 'continue');
        //.opt 'loop'
        this.opt('loop');
      };
    // export
    module.exports.LoopControlStatement = LoopControlStatement;
    
    // end class LoopControlStatement
//### export class DoNothingStatement extends ASTBase
    // constructor
    function DoNothingStatement(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
    };
    // DoNothingStatement (extends|proto is) ASTBase
    DoNothingStatement.prototype.__proto__ = ASTBase.prototype;
//`DoNothingStatement: do nothing`
      //method parse()
      DoNothingStatement.prototype.parse = function(){
        //.req 'do'
        this.req('do');
        //.req 'nothing'
        this.req('nothing');
      };
    // export
    module.exports.DoNothingStatement = DoNothingStatement;
    
    // end class DoNothingStatement
//## For Statement
//### export class ForStatement extends ASTBase
    // constructor
    function ForStatement(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
      
//`ForStatement: (ForEachProperty|ForEachInArray|ForIndexNumeric)`
//There are 3 variants of `ForStatement` in LiteScript
      //properties 
        //variant: ASTBase
    };
    // ForStatement (extends|proto is) ASTBase
    ForStatement.prototype.__proto__ = ASTBase.prototype;
      //method parse()
      ForStatement.prototype.parse = function(){
        //declare valid .createScope
        
//We start with commonn `for` keyword
        //.req 'for'
        this.req('for');
        //.lock()
        this.lock();
//we now require one of the variants
        //.variant = .req(ForEachProperty,ForEachInArray,ForIndexNumeric)
        this.variant = this.req(ForEachProperty, ForEachInArray, ForIndexNumeric);
      };
    // export
    module.exports.ForStatement = ForStatement;
    
    // end class ForStatement
//##Variant 1) **for each property** 
//###Loop over **object property names**
//Grammar:
//`ForEachProperty: for each [own] property name-VariableDecl ["," value-VariableDecl] in object-VariableRef [where Expression]`
//where `name-VariableDecl` is a variable declared on the spot to store each property name,
//and `object-VariableRef` is the object having the properties 
//### export class ForEachProperty extends ASTBase
    // constructor
    function ForEachProperty(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
      //properties 
        //indexVar:VariableDecl, mainVar:VariableDecl
        //iterable:Expression 
        //where:ForWhereFilter
        //body
    };
    // ForEachProperty (extends|proto is) ASTBase
    ForEachProperty.prototype.__proto__ = ASTBase.prototype;
      //method parse()
      ForEachProperty.prototype.parse = function(){
        //.req('each')
        this.req('each');
//next we require: 'property', and lock.
        //.req('property')  
        this.req('property');
        //.lock()
        this.lock();
//Get main variable name (to store property value)
        //.mainVar = .req(VariableDecl)
        this.mainVar = this.req(VariableDecl);
//if comma present, it was propName-index (to store property names)
        //if .opt(",")
        if (this.opt(",")) {
          //.indexVar = .mainVar
          this.indexVar = this.mainVar;
          //.mainVar = .req(VariableDecl)
          this.mainVar = this.req(VariableDecl);
        };
//Then we require `in`, and the iterable-Expression (a object)
        //.req 'in'
        this.req('in');
        //.iterable = .req(Expression)
        this.iterable = this.req(Expression);
//optional where expression (filter)
        //.where = .opt(ForWhereFilter)
        this.where = this.opt(ForWhereFilter);
//Now, get the loop body
        //.body = .req(Body)
        this.body = this.req(Body);
      };
    // export
    module.exports.ForEachProperty = ForEachProperty;
    
    // end class ForEachProperty
//##Variant 2) **for each in** 
//### loop over **Arrays**
//Grammar:
//`ForEachInArray: for each [index-VariableDecl,]item-VariableDecl in array-VariableRef [where Expression]`
//where:
//* `index-VariableDecl` is a variable declared on the spot to store each item index (from 0 to array.length)
//* `item-VariableDecl` is a variable declared on the spot to store each array item (array[index])
//and `array-VariableRef` is the array to iterate over
//### export class ForEachInArray extends ASTBase
    // constructor
    function ForEachInArray(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
      
      //properties 
        //indexVar:VariableDecl, mainVar:VariableDecl, iterable:Expression
        //where:ForWhereFilter
        //body
    };
    // ForEachInArray (extends|proto is) ASTBase
    ForEachInArray.prototype.__proto__ = ASTBase.prototype;
      //method parse()
      ForEachInArray.prototype.parse = function(){
      
//first, require 'each'
        //.req 'each'
        this.req('each');
//Get index variable and value variable.
//Keep it simple: index and value are always variables declared on the spot
        //.mainVar = .req(VariableDecl)
        this.mainVar = this.req(VariableDecl);
//a comma means: previous var was 'index', so register as index and get main var
  
        //if .opt(',')
        if (this.opt(',')) {
          //.indexVar = .mainVar
          this.indexVar = this.mainVar;
          //.mainVar = .req(VariableDecl)
          this.mainVar = this.req(VariableDecl);
        };
//we now *require* `in` and the iterable (array)
        //.req 'in'
        this.req('in');
        //.lock()
        this.lock();
        //.isMap = .opt('map')
        this.isMap = this.opt('map');
        //.iterable = .req(Expression)
        this.iterable = this.req(Expression);
//optional where expression
        //.where = .opt(ForWhereFilter)
        this.where = this.opt(ForWhereFilter);
//and then, loop body
        //.body = .req(Body)
        this.body = this.req(Body);
      };
    // export
    module.exports.ForEachInArray = ForEachInArray;
    
    // end class ForEachInArray
//##Variant 3) **for index=...** 
//### to do **numeric loops**
//This `for` variant is just a verbose expressions of the standard C (and js) `for(;;)` loop
//Grammar:
//`ForIndexNumeric: for index-VariableDecl [","] (while|until|to|down to) end-Expression ["," increment-SingleLineBody]`
//where `index-VariableDecl` is a numeric variable declared on the spot to store loop index,
//`start-Expression` is the start value for the index (ussually 0)
//`end-Expression` is:
//- the end value (`to`)
//- the condition to keep looping (`while`) 
//- the condition to end looping (`until`)
//<br>and `increment-SingleLineBody` is the statement(s) used to advance the loop index. 
//If omitted the default is `index++`
//### export class ForIndexNumeric extends ASTBase
    // constructor
    function ForIndexNumeric(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
      
      //properties 
        //indexVar:VariableDecl
        //conditionPrefix, endExpression
        //increment: SingleLineBody
        //body
    };
    // ForIndexNumeric (extends|proto is) ASTBase
    ForIndexNumeric.prototype.__proto__ = ASTBase.prototype;
//we require: a variableDecl, with optional assignment
      //method parse()
      ForIndexNumeric.prototype.parse = function(){
        //.indexVar = .req(VariableDecl)
        this.indexVar = this.req(VariableDecl);
        //.lock()
        this.lock();
//next comma is  optional, then
//get 'while|until|to' and condition
        //.opt ','
        this.opt(',');
        //.conditionPrefix = .req('while','until','to','down')
        this.conditionPrefix = this.req('while', 'until', 'to', 'down');
        //if .conditionPrefix is 'down', .req 'to'
        if (this.conditionPrefix === 'down') {this.req('to')};
        //.endExpression = .req(Expression)
        this.endExpression = this.req(Expression);
//another optional comma, and increment-Statement(s)
        //.opt ','
        this.opt(',');
        //.increment = .opt(SingleLineBody)
        this.increment = this.opt(SingleLineBody);
//Now, get the loop body
        //.body = .req(Body)
        this.body = this.req(Body);
      };
    // export
    module.exports.ForIndexNumeric = ForIndexNumeric;
    
    // end class ForIndexNumeric
//### public helper class ForWhereFilter extends ASTBase
    // constructor
    function ForWhereFilter(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
//`ForWhereFilter: [NEWLINE] where Expression`
//This is a helper symbol denoting optional filter for the ForLoop variants.
//is: optional NEWLINE, then 'where' then filter-Expression
      //properties
        //filterExpression
    };
    // ForWhereFilter (extends|proto is) ASTBase
    ForWhereFilter.prototype.__proto__ = ASTBase.prototype;
      //method parse
      ForWhereFilter.prototype.parse = function(){
        //var optNewLine = .opt('NEWLINE')
        var optNewLine = this.opt('NEWLINE');
        //if .opt('where')
        if (this.opt('where')) {
          //.lock()
          this.lock();
          //.filterExpression = .req(Expression)
          this.filterExpression = this.req(Expression);
        }
        else {
        //else
          //if optNewLine, .lexer.returnToken # return NEWLINE
          if (optNewLine) {this.lexer.returnToken()};
          //.throwParseFailed "expected '[NEWLINE] where'"
          this.throwParseFailed("expected '[NEWLINE] where'");
        };
      };
    // export
    module.exports.ForWhereFilter = ForWhereFilter;
    
    // end class ForWhereFilter
//--------------------------------
//### public class DeleteStatement extends ASTBase
    // constructor
    function DeleteStatement(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
//`DeleteStatement: delete VariableRef`
      
      //properties
        //varRef
    };
    // DeleteStatement (extends|proto is) ASTBase
    DeleteStatement.prototype.__proto__ = ASTBase.prototype;
      //method parse
      DeleteStatement.prototype.parse = function(){
        //.req('delete')
        this.req('delete');
        //.lock()
        this.lock();
        //.varRef = .req(VariableRef)
        this.varRef = this.req(VariableRef);
      };
    // export
    module.exports.DeleteStatement = DeleteStatement;
    
    // end class DeleteStatement
//### export class AssignmentStatement extends ASTBase
    // constructor
    function AssignmentStatement(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
      
//`AssignmentStatement: VariableRef ASSIGN Expression`
//<br>`ASSIGN: ("="|"+="|"-="|"*="|"/=")`
      //properties lvalue:VariableRef, rvalue:Expression
    };
    // AssignmentStatement (extends|proto is) ASTBase
    AssignmentStatement.prototype.__proto__ = ASTBase.prototype;
      //method parse()
      AssignmentStatement.prototype.parse = function(){
      
        //declare valid .parent.preParsedVarRef
        
        //if .parent instanceof Statement and .parent.preParsedVarRef
        if (this.parent instanceof Statement && this.parent.preParsedVarRef) {
          //.lvalue  = .parent.preParsedVarRef # get already parsed VariableRef 
          this.lvalue = this.parent.preParsedVarRef;// # get already parsed VariableRef
        }
        else {
        //else
          //.lvalue  = .req(VariableRef)
          this.lvalue = this.req(VariableRef);
        };
//require an assignment symbol: ("="|"+="|"-="|"*="|"/=")
        //.name = .req('ASSIGN')
        this.name = this.req('ASSIGN');
        //.lock()
        this.lock();
        //if .lexer.token.value is 'map' #dangling assignment - Literal map
        if (this.lexer.token.value === 'map') {// #dangling assignment - Literal map
          //.req 'map'
          this.req('map');
          //.rvalue  = .req(FreeObjectLiteral) #assume Object Expression in freeForm mode
          this.rvalue = this.req(FreeObjectLiteral);// #assume Object Expression in freeForm mode
          //.rvalue.type = 'Map'
          this.rvalue.type = 'Map';
          //.rvalue.isMap = true
          this.rvalue.isMap = true;
        }
        else if (this.lexer.token.type === 'NEWLINE') {// #dangling assignment
        //else if .lexer.token.type is 'NEWLINE' #dangling assignment
          //.rvalue  = .req(FreeObjectLiteral) #assume Object Expression in freeForm mode
          this.rvalue = this.req(FreeObjectLiteral);// #assume Object Expression in freeForm mode
        }
        else {
        //else
          //.rvalue  = .req(Expression)
          this.rvalue = this.req(Expression);
        };
      };
    // export
    module.exports.AssignmentStatement = AssignmentStatement;
    
    // end class AssignmentStatement
//-----------------------
//### export class VariableRef extends ASTBase
    // constructor
    function VariableRef(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
      
//`VariableRef: ('--'|'++') IDENTIFIER [Accessors] ('--'|'++')`
//`VariableRef` is a Variable Reference
//a VariableRef can include chained 'Accessors', which do:
//- access a property of the object : `.`-> **PropertyAccess** and `[...]`->**IndexAccess**
//- assume the variable is a function and perform a function call :  `(...)`->**FunctionAccess**
      //properties 
        //preIncDec
        //postIncDec
    };
    // VariableRef (extends|proto is) ASTBase
    VariableRef.prototype.__proto__ = ASTBase.prototype;
      //declare name affinity varRef
      
      //method parse()
      VariableRef.prototype.parse = function(){
        //.preIncDec = .opt('--','++')
        this.preIncDec = this.opt('--', '++');
        //.executes = false
        this.executes = false;
//assume 'this.x' on '.x', or if we're in a WithStatement, the 'with' .name
//get var name
        //if .opt('.','SPACE_DOT') # note: DOT has SPACES in front when .property used as parameter
        if (this.opt('.', 'SPACE_DOT')) {// # note: DOT has SPACES in front when .property used as parameter
  
            //#'.name' -> 'x.name'
            //.lock()
            this.lock();
            //if .getParent(WithStatement) into var withStatement 
            var withStatement=undefined;
            if ((withStatement=this.getParent(WithStatement))) {
                //.name = withStatement.name
                this.name = withStatement.name;
            }
            else {
            //else
                //.name = 'this' #default replacement for '.x'
                this.name = 'this';// #default replacement for '.x'
            };
            //var member: string
            var member = undefined;
            //#we must allow 'not' and 'has' as method names, (jQuery uses "not", Map uses "has").
            //#They're classsified as "Opers", but they're valid identifiers in this context
            //if .lexer.token.value in ['not','has']
            if (['not', 'has'].indexOf(this.lexer.token.value)>=0) {
                //member = .lexer.nextToken() //get not|has as identifier
                member = this.lexer.nextToken(); //get not|has as identifier
            }
            else {
            //else
                //member = .req('IDENTIFIER')
                member = this.req('IDENTIFIER');
            };
            //.addAccessor new PropertyAccess(this,member)
            this.addAccessor(new PropertyAccess(this, member));
        }
        else {
        //else
            //.name = .req('IDENTIFIER')
            this.name = this.req('IDENTIFIER');
        };
        //.lock()
        this.lock();
//Now we check for accessors: 
//<br>`.`->**PropertyAccess** 
//<br>`[...]`->**IndexAccess** 
//<br>`(...)`->**FunctionAccess**
//Note: **.paserAccessors()** will:
//- set .hasSideEffects=true if a function accessor is parsed
//- set .executes=true if the last accessor is a function accessor
        //.parseAccessors
        this.parseAccessors();
//Replace lexical `super` by `#{SuperClass name}.prototype`
    
        //if .name is 'super'
        if (this.name === 'super') {
            //var classDecl = .getParent(ClassDeclaration)
            var classDecl = this.getParent(ClassDeclaration);
            //if no classDecl
            if (!classDecl) {
              //.throwError "use of 'super' outside a class method"
              this.throwError("use of 'super' outside a class method");
            };
            //if classDecl.varRefSuper
            if (classDecl.varRefSuper) {
                //#replace name='super' by name = #{SuperClass name}
                //.name = classDecl.varRefSuper.toString()
                this.name = classDecl.varRefSuper.toString();
            }
            else {
            //else
                //.name ='Object' # no superclass means 'Object' is super class
                this.name = 'Object';// # no superclass means 'Object' is super class
            };
        };
        //end if super
        
//Hack: after 'into var', allow :type 
        //if .getParent(Statement).intoVars and .opt(":")
        if (this.getParent(Statement).intoVars && this.opt(":")) {
            //.parseType
            this.parseType();
        };
//check for post-fix increment/decrement
        //.postIncDec = .opt('--','++')
        this.postIncDec = this.opt('--', '++');
//If this variable ref has ++ or --, IT IS CONSIDERED a "call to execution" in itself, 
//a "imperative statement", because it has side effects. 
//(`i++` has a "imperative" part, It means: "give me the value of i, and then increment it!")
        //if .preIncDec or .postIncDec 
        if (this.preIncDec || this.postIncDec) {
          //.executes = true
          this.executes = true;
          //.hasSideEffects = true
          this.hasSideEffects = true;
        };
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
//Note: commented 2014-6-11
////        if .name is 'require'
////            .getParent(Module).requireCallNodes.push this            
//---------------------------------
//##### helper method toString()
      VariableRef.prototype.toString = function(){
//This method is only valid to be used in error reporting.
//function accessors will be output as "(...)", and index accessors as [...]
        //var result = "#{.preIncDec or ''}#{.name}"
        var result = '' + (this.preIncDec || '') + this.name;
        //if .accessors
        if (this.accessors) {
          //for each ac in .accessors
          for( var ac__inx=0,ac ; ac__inx<this.accessors.length ; ac__inx++){ac=this.accessors[ac__inx];
          
            //result = "#{result}#{ac.toString()}"
            result = '' + result + (ac.toString());
          };// end for each in this.accessors
          
        };
        //return "#{result}#{.postIncDec or ''}"
        return '' + result + (this.postIncDec || '');
      };
    // export
    module.exports.VariableRef = VariableRef;
    
    // end class VariableRef
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
//- `myObj.item.fn(call)`  <-- 3 accesors, two PropertyAccess and a FunctionAccess
//- `myObj[5](param).part`  <-- 3 accesors, IndexAccess, FunctionAccess and PropertyAccess
//- `[1,2,3,4].indexOf(3)` <-- 2 accesors, PropertyAccess and FunctionAccess
//#####Actions:
//`.` -> PropertyAccess: Search the property in the object and in his pototype chain.
                      //It resolves to the property value
//`[...]` -> IndexAccess: Same as PropertyAccess
//`(...)` -> FunctionAccess: The object is assumed to be a function, and the code executed. 
                      //It resolves to the function return value.
//## Implementation
//We provide a class Accessor to be super class for the three accessors types.
//### export class Accessor extends ASTBase
    // constructor
    function Accessor(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
    };
    // Accessor (extends|proto is) ASTBase
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
    // export
    module.exports.Accessor = Accessor;
    
    // end class Accessor
//### export class PropertyAccess extends Accessor
    // constructor
    function PropertyAccess(){ // default constructor
    // default constructor: call super.constructor
        Accessor.prototype.constructor.apply(this,arguments)
    };
    // PropertyAccess (extends|proto is) Accessor
    PropertyAccess.prototype.__proto__ = Accessor.prototype;
//`.` -> PropertyAccess: get the property named "n" 
//`PropertyAccess: '.' IDENTIFIER`
//`PropertyAccess: '.' ObjectLiteral` : short-form for  `.newFromObject({a:1,b:2})`
  
      //method parse()
      PropertyAccess.prototype.parse = function(){
        //.req('.')
        this.req('.');
        //.lock()
        this.lock();
        //if .lexer.token.value is '{' // ObjectLiteral, short-form for  `.initFromObject({a:1,b:2})`
        if (this.lexer.token.value === '{') { // ObjectLiteral, short-form for  `.initFromObject({a:1,b:2})`
            //.name='newFromObject' // fixed property access "initFromObject" (call-to)
            this.name = 'newFromObject'; // fixed property access "initFromObject" (call-to)
        }
        else if (['not', 'has'].indexOf(this.lexer.token.value)>=0) {
        //#we must allow 'not' and 'has' as method names, (jQuery uses "not", Map uses "has").
        //#They're classsified as "Opers", but they're valid identifiers in this context
        //else if .lexer.token.value in ['not','has']
            //.name = .lexer.token.value //get "not"|"has" as identifier
            this.name = this.lexer.token.value; //get "not"|"has" as identifier
            //.lexer.nextToken() //advance
            this.lexer.nextToken(); //advance
        }
        else {
        //else
            //.name = .req('IDENTIFIER')
            this.name = this.req('IDENTIFIER');
        };
      };
      //method toString()
      PropertyAccess.prototype.toString = function(){
        //return '.#{.name}'
        return '.' + this.name;
      };
    // export
    module.exports.PropertyAccess = PropertyAccess;
    
    // end class PropertyAccess
//### export class IndexAccess extends Accessor
    // constructor
    function IndexAccess(){ // default constructor
    // default constructor: call super.constructor
        Accessor.prototype.constructor.apply(this,arguments)
    };
    // IndexAccess (extends|proto is) Accessor
    IndexAccess.prototype.__proto__ = Accessor.prototype;
//`[n]`-> IndexAccess: get the property named "n" / then nth index of the array
                       //It resolves to the property value
//`IndexAccess: '[' Expression ']'`
      //method parse()
      IndexAccess.prototype.parse = function(){
        
        //.req "["
        this.req("[");
        //.lock()
        this.lock();
        //.name = .req( Expression )
        this.name = this.req(Expression);
        //.req "]" #closer ]
        this.req("]");// #closer ]
      };
      //method toString()
      IndexAccess.prototype.toString = function(){
        //return '[...]'
        return '[...]';
      };
    // export
    module.exports.IndexAccess = IndexAccess;
    
    // end class IndexAccess
//### export class FunctionArgument extends ASTBase
    // constructor
    function FunctionArgument(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
//`FunctionArgument: [param-IDENTIFIER=]Expression`
      //properties 
        //expression
    };
    // FunctionArgument (extends|proto is) ASTBase
    FunctionArgument.prototype.__proto__ = ASTBase.prototype;
      //method parse()
      FunctionArgument.prototype.parse = function(){
        //.lock()
        this.lock();
        //if .opt('IDENTIFIER') into .name
        if ((this.name=this.opt('IDENTIFIER'))) {
            //if .lexer.token.value is '=' 
            if (this.lexer.token.value === '=') {
                //.req '='
                this.req('=');
            }
            else {
            //else
                //.lexer.returnToken
                this.lexer.returnToken();
                //.name = undefined
                this.name = undefined;
            };
        };
        //.expression =.req(Expression)
        this.expression = this.req(Expression);
      };
    // export
    module.exports.FunctionArgument = FunctionArgument;
    
    // end class FunctionArgument
//### export class FunctionAccess extends Accessor
    // constructor
    function FunctionAccess(){ // default constructor
    // default constructor: call super.constructor
        Accessor.prototype.constructor.apply(this,arguments)
//`(...)` -> FunctionAccess: The object is assumed to be a function, and the code executed. 
                           //It resolves to the function return value.
//`FunctionAccess: '(' [FunctionArgument,]* ')'`
      //properties 
        //args:array of FunctionArgument
    };
    // FunctionAccess (extends|proto is) Accessor
    FunctionAccess.prototype.__proto__ = Accessor.prototype;
      //method parse()
      FunctionAccess.prototype.parse = function(){
        //.req "("
        this.req("(");
        //.lock()
        this.lock();
        //.args = .optSeparatedList( FunctionArgument, ",", ")" ) #comma-separated list of FunctionArgument, closed by ")"
        this.args = this.optSeparatedList(FunctionArgument, ",", ")");// #comma-separated list of FunctionArgument, closed by ")"
      };
      //method toString()
      FunctionAccess.prototype.toString = function(){
        //return '(...)'
        return '(...)';
      };
    // export
    module.exports.FunctionAccess = FunctionAccess;
    
    // end class FunctionAccess
//## Functions appended to ASTBase, to help parse accessors on any node
//### Append to class ASTBase
    
      //properties 
        //accessors: Accessor array      
        //executes, hasSideEffects
      
//##### helper method parseAccessors
      ASTBase.prototype.parseAccessors = function(){
      
//We store the accessors in the property: .accessors
//if the accessors array exists, it will have **at least one item**.
//Loop parsing accessors
          //var ac:Accessor
          var ac = undefined;
          //do
          while(true){
              //case .lexer.token.value
              
                //when '.' //property acceess
              if ((this.lexer.token.value=='.')){
                    //ac = new PropertyAccess(this)
                    ac = new PropertyAccess(this);
                    //ac.parse
                    ac.parse();
                    //if .lexer.token.value is '{' // ObjectLiteral, short-form for  `.newFromObject({a:1,b:2})`
                    if (this.lexer.token.value === '{') { // ObjectLiteral, short-form for  `.newFromObject({a:1,b:2})`
                        //.addAccessor ac //add the PropertyAccess to method ".newFromObject"
                        this.addAccessor(ac); //add the PropertyAccess to method ".newFromObject"
                        //ac = new FunctionAccess(this) //create FunctionAccess
                        ac = new FunctionAccess(this); //create FunctionAccess
                        //declare ac:FunctionAccess
                        
                        //ac.args = []
                        ac.args = [];
                        //ac.args.push .req(ObjectLiteral) //.newFromObject() argument is the object literal
                        ac.args.push(this.req(ObjectLiteral)); //.newFromObject() argument is the object literal
                    };
              
              }
                //when "(" //function access
              else if ((this.lexer.token.value=="(")){
                    //ac = new FunctionAccess(this)
                    ac = new FunctionAccess(this);
                    //ac.parse
                    ac.parse();
              
              }
                //when "[" //index access
              else if ((this.lexer.token.value=="[")){
                    //ac = new IndexAccess(this)
                    ac = new IndexAccess(this);
                    //ac.parse
                    ac.parse();
              
              }
              else {
                //else 
                    //break //no more accessors
                    break; //no more accessors
              };
              //end case
              
              ////add parsed accessor
              //.addAccessor ac 
              this.addAccessor(ac);
          };// end loop
          //loop #continue parsing accesors
          //return
          return;
      };
//##### helper method addAccessor(item)
      ASTBase.prototype.addAccessor = function(item){
            //#create accessors list, if there was none
            //if no .accessors, .accessors = []
            if (!this.accessors) {this.accessors = []};
            //#polymorphic params: string defaults to PropertyAccess
            //if type of item is 'string', item = new PropertyAccess(this, item)
            if (typeof item === 'string') {item = new PropertyAccess(this, item)};
            //.accessors.push item
            this.accessors.push(item);
//if the very last accesor is "(", it means the entire expression is a function call,
//it's a call to "execute code", so it's a imperative statement on it's own.
//if any accessor is a function call, this statement is assumed to have side-effects
            //.executes = item instance of FunctionAccess
            this.executes = item instanceof FunctionAccess;
            //if .executes, .hasSideEffects = true
            if (this.executes) {this.hasSideEffects = true};
      };
//## Operand
//```
//Operand: (
  //(NumberLiteral|StringLiteral|RegExpLiteral|ArrayLiteral|ObjectLiteral
                    //|ParenExpression|FunctionDeclaration)[Accessors])
  //|VariableRef) 
//```
//Examples:
//<br> 4 + 3 -> `Operand Oper Operand`
//<br> -4    -> `UnaryOper Operand`
//A `Operand` is the data on which the operator operates.
//It's the left and right part of a binary operator.
//It's the data affected (righ) by a UnaryOper.
//To make parsing faster, associate a token type/value,
//with exact AST class to call parse() on.
    //var OPERAND_DIRECT_TYPE = map
          //'STRING': StringLiteral
          //'NUMBER': NumberLiteral
          //'REGEX': RegExpLiteral
          //'SPACE_BRACKET':ArrayLiteral # one or more spaces + "[" 
    var OPERAND_DIRECT_TYPE = new Map().fromObject({
        'STRING': StringLiteral, 
        'NUMBER': NumberLiteral, 
        'REGEX': RegExpLiteral, 
        'SPACE_BRACKET': ArrayLiteral
});
    
    //var OPERAND_DIRECT_TOKEN = map
          //'(':ParenExpression
          //'[':ArrayLiteral
          //'{':ObjectLiteral
          //'function': FunctionDeclaration
          //'->': FunctionDeclaration
          //'yield': YieldExpression
    var OPERAND_DIRECT_TOKEN = new Map().fromObject({
        '(': ParenExpression, 
        '[': ArrayLiteral, 
        '{': ObjectLiteral, 
        'function': FunctionDeclaration, 
        '->': FunctionDeclaration, 
        'yield': YieldExpression
});
    
//### public class Operand extends ASTBase
    // constructor
    function Operand(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
    };
    // Operand (extends|proto is) ASTBase
    Operand.prototype.__proto__ = ASTBase.prototype;
//fast-parse: if it's a NUMBER: it is NumberLiteral, if it's a STRING: it is StringLiteral (also for REGEX)
//or, upon next token, cherry pick which AST nodes to try,
//'(':ParenExpression,'[':ArrayLiteral,'{':ObjectLiteral,'function': FunctionDeclaration
      //method parse()
      Operand.prototype.parse = function(){
        //.name = .parseDirect(.lexer.token.type, OPERAND_DIRECT_TYPE) 
        this.name = this.parseDirect(this.lexer.token.type, OPERAND_DIRECT_TYPE) || this.parseDirect(this.lexer.token.value, OPERAND_DIRECT_TOKEN);
          //or .parseDirect(.lexer.token.value, OPERAND_DIRECT_TOKEN)
//if it was a Literal, ParenExpression or FunctionDeclaration
//besides base value, this operands can have accessors. For example: `"string".length` , `myObj.fn(10)`
        //if .name
        if (this.name) {
            //.parseAccessors
            this.parseAccessors();
        }
        else {
//else, (if not Literal, ParenExpression or FunctionDeclaration)
//it must be a variable ref 
        //else
            //.name = .req(VariableRef)
            this.name = this.req(VariableRef);
        };
        //end if
        
      };
    // export
    module.exports.Operand = Operand;
    
    // end class Operand
    //end Operand
    
//## Oper
//```
//Oper: ('~'|'&'|'^'|'|'|'>>'|'<<'
        //|'*'|'/'|'+'|'-'|mod
        //|instance of|instanceof
        //|'>'|'<'|'>='|'<='
        //|is|'==='|isnt|is not|'!=='
        //|and|but|or
        //|[not] in
        //|(has|hasnt) property
        //|? true-Expression : false-Expression)`
//```
//An Oper sits between two Operands ("Oper" is a "Binary Operator", 
//different from *UnaryOperators* which optionally precede a Operand)
//If an Oper is found after an Operand, a second Operand is expected.
//Operators can include:
//* arithmetic operations "*"|"/"|"+"|"-"
//* boolean operations "and"|"or"
//* `in` collection check.  (js: `indexOx()>=0`)
//* instance class checks   (js: instanceof)
//* short-if ternary expressions ? :
//* bit operations (|&)
//* `has property` object property check (js: 'propName in object')
//### public class Oper extends ASTBase
    // constructor
    function Oper(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
      //properties 
        //negated
        //left:Operand, right:Operand
        //pushed, precedence
        //intoVar
    };
    // Oper (extends|proto is) ASTBase
    Oper.prototype.__proto__ = ASTBase.prototype;
//Get token, require an OPER.
//Note: 'ternary expression with else'. `x? a else b` should be valid alias for `x?a:b`
        
      //method parse()
      Oper.prototype.parse = function(){
        //declare valid .getPrecedence
        
        //declare valid .parent.ternaryCount
        
        //if .parent.ternaryCount and .opt('else')
        if (this.parent.ternaryCount && this.opt('else')) {
            //.name=':' # if there's a open ternaryCount, 'else' is converted to ":"
            this.name = ':';// # if there's a open ternaryCount, 'else' is converted to ":"
        }
        else {
        //else
            //.name = .req('OPER')
            this.name = this.req('OPER');
        };
        //.lock() 
        this.lock();
//A) validate double-word opers
//A.1) validate `instance of`
        //if .name is 'instance'
        if (this.name === 'instance') {
            //.req('of')
            this.req('of');
            //.name = "instance of"
            this.name = "instance of";
        }
        else if (this.name === 'has') {
//A.2) validate `has|hasnt property`
        //else if .name is 'has'
            //.negated = .opt('not')? true:false # set the 'negated' flag
            this.negated = this.opt('not') ? true : false;// # set the 'negated' flag
            //.req('property')
            this.req('property');
            //.name = "has property"
            this.name = "has property";
        }
        else if (this.name === 'hasnt') {
        //else if .name is 'hasnt'
            //.req('property')
            this.req('property');
            //.negated = true # set the 'negated' flag
            this.negated = true;// # set the 'negated' flag
            //.name = "has property"
            this.name = "has property";
        }
        else if (this.name === 'not') {
//A.3) also, check if we got a `not` token.
//In this case we require the next token to be `in|like` 
//`not in|like` is the only valid (not-unary) *Oper* starting with `not`
        //else if .name is 'not'
            //.negated = true # set the 'negated' flag
            this.negated = true;// # set the 'negated' flag
            //.name = .req('in','like') # require 'not in'|'not like'
            this.name = this.req('in', 'like');// # require 'not in'|'not like'
        };
//A.4) handle 'into [var] x', assignment-Expression
        //if .name is 'into' and .opt('var')
        if (this.name === 'into' && this.opt('var')) {
            //.intoVar = true
            this.intoVar = true;
            //.getParent(Statement).intoVars = true #mark owner statement
            this.getParent(Statement).intoVars = true;// #mark owner statement
        }
        else if (this.name === 'isnt') {
//B) Synonyms 
//else, check for `isnt`, which we treat as `!==`, `negated is` 
        //else if .name is 'isnt'
          //.negated = true # set the 'negated' flag
          this.negated = true;// # set the 'negated' flag
          //.name = 'is' # treat as 'Negated is'
          this.name = 'is';// # treat as 'Negated is'
        }
        else if (this.name === 'instanceof') {
//else check for `instanceof`, (old habits die hard)
        //else if .name is 'instanceof'
          //.name = 'instance of'
          this.name = 'instance of';
        };
        //end if
        
//C) Variants on 'is/isnt...'
        //if .name is 'is' # note: 'isnt' was converted to 'is {negated:true}' above
        if (this.name === 'is') {// # note: 'isnt' was converted to 'is {negated:true}' above
  //C.1) is not<br>
  //Check for `is not`, which we treat as `isnt` rather than `is ( not`.
  
            //if .opt('not') # --> is not/has not...
            if (this.opt('not')) {// # --> is not/has not...
                //if .negated, .throwError '"isnt not" is invalid'
                if (this.negated) {this.throwError('"isnt not" is invalid')};
                //.negated = true # set the 'negated' flag
                this.negated = true;// # set the 'negated' flag
            };
            //end if
            
  //C.2) accept 'is/isnt instance of' and 'is/isnt instanceof'
            //if .opt('instance')
            if (this.opt('instance')) {
                //.req('of')
                this.req('of');
                //.name = 'instance of'
                this.name = 'instance of';
            }
            else if (this.opt('instanceof')) {
            //else if .opt('instanceof')
                //.name = 'instance of'
                this.name = 'instance of';
            };
            //end if
            
        };
//Get operator precedence index
        //.getPrecedence
        this.getPrecedence();
      };
      //end Oper parse
      
//###getPrecedence:
//Helper method to get Precedence Index (lower number means higher precedende)
      //helper method getPrecedence()
      Oper.prototype.getPrecedence = function(){
        //.precedence = operatorsPrecedence.indexOf(.name)
        this.precedence = operatorsPrecedence.indexOf(this.name);
        //if .precedence is -1 
        if (this.precedence === -1) {
            //debugger
            debugger;
            //fail with "OPER '#{.name}' not found in the operator precedence list"
            throw new Error("OPER '" + this.name + "' not found in the operator precedence list");
        };
      };
    // export
    module.exports.Oper = Oper;
    
    // end class Oper
//###Boolean Negation: `not`
//####Notes for the javascript programmer
//In LiteScript, *the boolean negation* `not`, 
//has LOWER PRECEDENCE than the arithmetic and logical operators.
//In LiteScript:  `if not a + 2 is 5` means `if not (a+2 is 5)`
//In javascript: `if ( ! a + 2 === 5 )` means `if ( (!a)+2 === 5 )` 
//so remember **not to** mentally translate `not` to js `!`
//UnaryOper
//---------
//`UnaryOper: ('-'|'+'|new|type of|typeof|not|no|bitnot)`
//A Unary Oper is an operator acting on a single operand.
//Unary Oper extends Oper, so both are `instance of Oper`
//Examples:
//1· `not`     *boolean negation*     `if not ( a is 3 or b is 4)`
//2. `-`       *numeric unary minus*  `-(4+3)`
//2. `+`       *numeric unary plus*   `+4` (can be ignored)
//3. `new`     *instantiation*        `x = new classes[2]()`
//4. `type of` *type name access*     `type of x is 'string'` 
//5. `no`      *'falsey' check*       `if no options then options={}` 
//6. `~`       *bit-unary-negation*   `a = ~xC0 + 5`
    //var unaryOperators = ['new','-','no','not','type','typeof','bitnot','+']
    var unaryOperators = ['new', '-', 'no', 'not', 'type', 'typeof', 'bitnot', '+'];
    //public class UnaryOper extends Oper
    // constructor
    function UnaryOper(){ // default constructor
    // default constructor: call super.constructor
        Oper.prototype.constructor.apply(this,arguments)
    };
    // UnaryOper (extends|proto is) Oper
    UnaryOper.prototype.__proto__ = Oper.prototype;
//require a unaryOperator
      //method parse()
      UnaryOper.prototype.parse = function(){
          //.name = .reqOneOf(unaryOperators)
          this.name = this.reqOneOf(unaryOperators);
//Check for `type of` - we allow "type" as var name, but recognize "type of" as UnaryOper
          //if .name is 'type'
          if (this.name === 'type') {
              //if .opt('of')
              if (this.opt('of')) {
                //.name = 'type of'
                this.name = 'type of';
              }
              else {
              //else
                //.throwParseFailed 'expected "of" after "type"'
                this.throwParseFailed('expected "of" after "type"');
              };
          };
                    
//Lock, we have a unary oper
          //.lock()
          this.lock();
//Rename - and + to 'unary -' and 'unary +', 
//'typeof' to 'type of'
          //if .name is '-'
          if (this.name === '-') {
              //.name = 'unary -'
              this.name = 'unary -';
          }
          else if (this.name === '+') {
          //else if .name is '+'
              //.name = 'unary +'
              this.name = 'unary +';
          }
          else if (this.name === 'typeof') {
          //else if .name is 'typeof'
              //.name = 'type of'
              this.name = 'type of';
          };
          //end if
          
//calculate precedence - Oper.getPrecedence()
          //.getPrecedence()
          this.getPrecedence();
      };
      //end parse 
      
    // export
    module.exports.UnaryOper = UnaryOper;
    
    // end class UnaryOper
//-----------
//## Expression
//`Expression: [UnaryOper] Operand [Oper [UnaryOper] Operand]*`
//The expression class parses intially a *flat* array of nodes.
//After the expression is parsed, a *Expression Tree* is created based on operator precedence.
    //public class Expression extends ASTBase
    // constructor
    function Expression(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
      
      //properties operandCount, root, ternaryCount
    };
    // Expression (extends|proto is) ASTBase
    Expression.prototype.__proto__ = ASTBase.prototype;
 
      //method parse()
      Expression.prototype.parse = function(){
      
        //declare valid .growExpressionTree
        
        //declare valid .root.name.type
        
        //var arr = []
        var arr = [];
        //.operandCount = 0 
        this.operandCount = 0;
        //.ternaryCount = 0
        this.ternaryCount = 0;
        //do
        while(true){
//Get optional unary operator
//(performance) check token first
            //if .lexer.token.value in unaryOperators
            if (unaryOperators.indexOf(this.lexer.token.value)>=0) {
                //var unaryOper = .opt(UnaryOper)
                var unaryOper = this.opt(UnaryOper);
                //if unaryOper
                if (unaryOper) {
                    //arr.push unaryOper
                    arr.push(unaryOper);
                    //.lock()
                    this.lock();
                };
            };
//Get operand
            //arr.push .req(Operand) 
            arr.push(this.req(Operand));
            //.operandCount++
            this.operandCount++;
            //.lock()
            this.lock();
//(performance) Fast exit for common tokens: `= , ] )` -> end of expression.
            //if .lexer.token.type is 'ASSIGN' or .lexer.token.value in ',)]' 
            if (this.lexer.token.type === 'ASSIGN' || ',)]'.indexOf(this.lexer.token.value)>=0) {
                //break
                break;
            };
//optional newline **before** `Oper`
//to allow a expressions to continue on the next line.
//We look ahead, and if the first token in the next line is OPER
//we consume the NEWLINE, allowing multiline expressions. 
//The exception is ArrayLiteral, because in free-form mode
//the next item in the array on the next line, can start with a unary operator
            //if .lexer.token.type is 'NEWLINE' and not (.parent instanceof ArrayLiteral)
            if (this.lexer.token.type === 'NEWLINE' && !((this.parent instanceof ArrayLiteral))) {
              //.opt 'NEWLINE' #consume newline
              this.opt('NEWLINE');// #consume newline
              //if .lexer.token.type isnt 'OPER' # the first token in the next line isnt OPER (+,and,or,...)
              if (this.lexer.token.type !== 'OPER') {// # the first token in the next line isnt OPER (+,and,or,...)
                  //.lexer.returnToken() # return NEWLINE
                  this.lexer.returnToken();// # return NEWLINE
                  //break #end Expression
                  break;// #end Expression
              };
            };
//Try to parse next token as an operator
            //var oper = .opt(Oper)
            var oper = this.opt(Oper);
            //if no oper then break # no more operators, end of expression
            if (!oper) {break};
//keep count on ternaryOpers
            //if oper.name is '?'
            if (oper.name === '?') {
                //.ternaryCount++
                this.ternaryCount++;
            }
            else if (oper.name === ':') {
            //else if oper.name is ':'
                //if no .ternaryCount //":" without '?'. It can be 'case' expression ending ":"
                if (!this.ternaryCount) { //":" without '?'. It can be 'case' expression ending ":"
                    //.lexer.returnToken
                    this.lexer.returnToken();
                    //break //end of expression
                    break; //end of expression
                };
                //.ternaryCount--
                this.ternaryCount--;
            };
            //end if
            
//If it was an operator, store, and continue because we expect another operand.
//(operators sits between two operands)
            //arr.push(oper)
            arr.push(oper);
//allow dangling expression. If the line ends with OPER, 
//we consume the NEWLINE and continue parsing the expression on the next line
            //.opt 'NEWLINE' #consume optional newline after Oper
            this.opt('NEWLINE');// #consume optional newline after Oper
        };// end loop
        //loop
//Control: complete all ternary operators
        //if .ternaryCount, .throwError 'missing (":"|else) on ternary operator (a? b else c)'
        if (this.ternaryCount) {this.throwError('missing (":"|else) on ternary operator (a? b else c)')};
//Fix 'new' calls. Check parameters for 'new' unary operator, for consistency, add '()' if not present,
//so `a = new MyClass` turns into `a = new MyClass()`
        //for each index,item in arr
        for( var index=0,item ; index<arr.length ; index++){item=arr[index];
        
          //declare item:UnaryOper         
          
          //if item instanceof UnaryOper and item.name is 'new'
          if (item instanceof UnaryOper && item.name === 'new') {
            //var operand = arr[index+1]
            var operand = arr[index + 1];
            //if operand.name instanceof VariableRef
            if (operand.name instanceof VariableRef) {
                //var varRef = operand.name
                var varRef = operand.name;
                //if no varRef.executes, varRef.addAccessor new FunctionAccess(this)
                if (!varRef.executes) {varRef.addAccessor(new FunctionAccess(this))};
            };
          };
        };// end for each in arr
//Now we create a tree from .arr[], based on operator precedence
        //.growExpressionTree(arr)
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
//The process is repeated until there is only one operator left in the root node 
//(the one with lower precedence)
//For example, `not 1 + 2 * 3 is 5`, turns into:
//```
   //not
      //\
      //is
     ///  \
   //+     5
  /// \   
 //1   *  
    /// \ 
    //2  3
//```
//`3 in a and not 4 in b`
//```
      //and
     ///  \
   //in    not
  /// \     |
 //3   a    in
         ///  \
        //4   b
//```
//`3 in a and 4 not in b`
//```
      //and
     ///  \
   //in   not-in
  /// \    / \
 //3   a  4   b
//```
//`-(4+3)*2`
//```
   //*
  /// \
 //-   2
  //\
   //+
  /// \
 //4   3
//```
//Expression.growExpressionTree()
//-------------------------------
//while there is more than one operator in the root node...
      //method growExpressionTree(arr:ASTBase array)
      Expression.prototype.growExpressionTree = function(arr){
        //do while arr.length > 1
        while(arr.length > 1){
//find the one with highest precedence (lower number) to push down
//(on equal precedende, we use the leftmost)
          //var pos=-1
          var pos = -1;
          //var minPrecedenceInx = 100
          var minPrecedenceInx = 100;
          //for each inx,item in arr
          for( var inx=0,item ; inx<arr.length ; inx++){item=arr[inx];
          
              ////debug "item at #{inx} #{item.name}, Oper? #{item instanceof Oper}. precedence:",item.precedence
  
              //if item instanceof Oper
              if (item instanceof Oper) {
                  //declare item:Oper
                  
                  //if not item.pushed and item.precedence < minPrecedenceInx
                  if (!(item.pushed) && item.precedence < minPrecedenceInx) {
                      //pos = inx
                      pos = inx;
                      //minPrecedenceInx = item.precedence
                      minPrecedenceInx = item.precedence;
                  };
              };
          };// end for each in arr
          //end for
          
          
          //#control
          //if pos<0, .throwError("can't find highest precedence operator")
          if (pos < 0) {this.throwError("can't find highest precedence operator")};
//Un-flatten: Push down the operands a level down
          //var oper = arr[pos]
          var oper = arr[pos];
          //oper.pushed = true
          oper.pushed = true;
          //if oper instanceof UnaryOper
          if (oper instanceof UnaryOper) {
              //#control
              //if pos is arr.length
              if (pos === arr.length) {
                  //.throwError("can't get RIGHT operand for unary operator '#{oper}'") 
                  this.throwError("can't get RIGHT operand for unary operator '" + oper + "'");
              };
              //# if it's a unary operator, take the only (right) operand, and push-it down the tree
              //oper.right = arr.splice(pos+1,1)[0]
              oper.right = arr.splice(pos + 1, 1)[0];
          }
          else {
          //else
              //#control
              //if pos is arr.length
              if (pos === arr.length) {
                //.throwError("can't get RIGHT operand for binary operator '#{oper}'")
                this.throwError("can't get RIGHT operand for binary operator '" + oper + "'");
              };
              //if pos is 0
              if (pos === 0) {
                //.throwError("can't get LEFT operand for binary operator '#{oper}'")
                this.throwError("can't get LEFT operand for binary operator '" + oper + "'");
              };
              //# if it's a binary operator, take the left and right operand, and push them down the tree
              //oper.right = arr.splice(pos+1,1)[0]
              oper.right = arr.splice(pos + 1, 1)[0];
              //oper.left = arr.splice(pos-1,1)[0]
              oper.left = arr.splice(pos - 1, 1)[0];
          };
          //end if
          
        };// end loop
        //loop #until there's only one operator
//Store the root operator
        //.root = arr[0]
        this.root = arr[0];
      };
      //end method
      
    // export
    module.exports.Expression = Expression;
    
    // end class Expression
//-----------------------
//## Literal
//This class groups: NumberLiteral, StringLiteral, RegExpLiteral, ArrayLiteral and ObjectLiteral
    //public class Literal extends ASTBase
    // constructor
    function Literal(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
    };
    // Literal (extends|proto is) ASTBase
    Literal.prototype.__proto__ = ASTBase.prototype;
  
      //method getValue()
      Literal.prototype.getValue = function(){
        //return .name
        return this.name;
      };
    // export
    module.exports.Literal = Literal;
    
    // end class Literal
//## NumberLiteral
//`NumberLiteral: NUMBER`
//A numeric token constant. Can be anything the lexer supports, including scientific notation
//, integers, floating point, or hex.
    //public class NumberLiteral extends Literal
    // constructor
    function NumberLiteral(){// default constructor: call super.constructor
        Literal.prototype.constructor.apply(this,arguments)
      //constructor 
        //.type = 'Number'
        this.type = 'Number';
      };
    // NumberLiteral (extends|proto is) Literal
    NumberLiteral.prototype.__proto__ = Literal.prototype;
      //method parse()
      NumberLiteral.prototype.parse = function(){
        //.name = .req('NUMBER')
        this.name = this.req('NUMBER');
      };
    // export
    module.exports.NumberLiteral = NumberLiteral;
    
    // end class NumberLiteral
//## StringLiteral
//`StringLiteral: STRING`
//A string constant token. Can be anything the lexer supports, including single or double-quoted strings. 
//The token include the enclosing quotes
    //public class StringLiteral extends Literal
    // constructor
    function StringLiteral(){// default constructor: call super.constructor
        Literal.prototype.constructor.apply(this,arguments)
      //constructor 
        //.type = 'String'
        this.type = 'String';
      };
    // StringLiteral (extends|proto is) Literal
    StringLiteral.prototype.__proto__ = Literal.prototype;
      //method parse()
      StringLiteral.prototype.parse = function(){
        //.name = .req('STRING')
        this.name = this.req('STRING');
      };
      //method getValue()
      StringLiteral.prototype.getValue = function(){
        //return .name.slice(1,-1) #remove quotes
        return this.name.slice(1, -1);// #remove quotes
      };
    // export
    module.exports.StringLiteral = StringLiteral;
    
    // end class StringLiteral
//## RegExpLiteral
//`RegExpLiteral: REGEX`
//A regular expression token constant. Can be anything the lexer supports.
    //public class RegExpLiteral extends Literal
    // constructor
    function RegExpLiteral(){// default constructor: call super.constructor
        Literal.prototype.constructor.apply(this,arguments)
      //constructor 
        //.type = 'RegExp'
        this.type = 'RegExp';
      };
    // RegExpLiteral (extends|proto is) Literal
    RegExpLiteral.prototype.__proto__ = Literal.prototype;
      //method parse()
      RegExpLiteral.prototype.parse = function(){
        //.name = .req('REGEX')
        this.name = this.req('REGEX');
      };
    // export
    module.exports.RegExpLiteral = RegExpLiteral;
    
    // end class RegExpLiteral
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
    // constructor
    function ArrayLiteral(){// default constructor: call super.constructor
        Literal.prototype.constructor.apply(this,arguments)
      //properties 
        //items: array of Expression
      //constructor 
        //.type = 'Array'
        this.type = 'Array';
      };
    // ArrayLiteral (extends|proto is) Literal
    ArrayLiteral.prototype.__proto__ = Literal.prototype;
      //method parse()
      ArrayLiteral.prototype.parse = function(){
        //.req '[','SPACE_BRACKET'
        this.req('[', 'SPACE_BRACKET');
        //.lock()
        this.lock();
        //.items = .optSeparatedList(Expression,',',']') # closer "]" required
        this.items = this.optSeparatedList(Expression, ',', ']');// # closer "]" required
      };
    // export
    module.exports.ArrayLiteral = ArrayLiteral;
    
    // end class ArrayLiteral
//## ObjectLiteral
//`ObjectLiteral: '{' NameValuePair* '}'`
//Defines an object with a list of key value pairs. This is a JavaScript-style definition.
//For LiteC (the Litescript-to-C compiler), a ObjectLiteral crates a `Map string to any` on the fly.
//`x = {a:1,b:2,c:{d:1}}`
    //public class ObjectLiteral extends Literal
    // constructor
    function ObjectLiteral(){ // default constructor
    // default constructor: call super.constructor
        Literal.prototype.constructor.apply(this,arguments)
      //properties 
        //items: NameValuePair array
        //produceType: string
    };
    // ObjectLiteral (extends|proto is) Literal
    ObjectLiteral.prototype.__proto__ = Literal.prototype;
      //method parse()
      ObjectLiteral.prototype.parse = function(){
        //.req '{'
        this.req('{');
        //.lock()
        this.lock();
        //.items = .optSeparatedList(NameValuePair,',','}') # closer "}" required
        this.items = this.optSeparatedList(NameValuePair, ',', '}');// # closer "}" required
      };
//####helper Functions
      //#recursive duet 1 (see NameValuePair)
      //helper method forEach(callback) 
      ObjectLiteral.prototype.forEach = function(callback){
          //for each nameValue in .items
          for( var nameValue__inx=0,nameValue ; nameValue__inx<this.items.length ; nameValue__inx++){nameValue=this.items[nameValue__inx];
          
            //nameValue.forEach(callback)
            nameValue.forEach(callback);
          };// end for each in this.items
          
      };
    // export
    module.exports.ObjectLiteral = ObjectLiteral;
    
    // end class ObjectLiteral
//## NameValuePair
//`NameValuePair: (IDENTIFIER|StringLiteral|NumberLiteral) ':' Expression`
//A single definition in a `ObjectLiteral` 
//a `property-name: value` pair.
    //public class NameValuePair extends ASTBase
    // constructor
    function NameValuePair(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
      //properties value: Expression
    };
    // NameValuePair (extends|proto is) ASTBase
    NameValuePair.prototype.__proto__ = ASTBase.prototype;
      //method parse()
      NameValuePair.prototype.parse = function(){
        //.name = .req('IDENTIFIER',StringLiteral,NumberLiteral)
        this.name = this.req('IDENTIFIER', StringLiteral, NumberLiteral);
        //.req ':'
        this.req(':');
        //.lock()
        this.lock();
//if it's a "dangling assignment", we assume FreeObjectLiteral
        //if .lexer.token.type is 'NEWLINE'
        if (this.lexer.token.type === 'NEWLINE') {
          //.value = .req(FreeObjectLiteral)
          this.value = this.req(FreeObjectLiteral);
        }
        else {
        //else
          //if .lexer.interfaceMode
          if (this.lexer.interfaceMode) {
              //.parseType
              this.parseType();
          }
          else {
          //else
              //.value = .req(Expression)
              this.value = this.req(Expression);
          };
        };
      };
//recursive duet 2 (see ObjectLiteral)
      //helper method forEach(callback:Function)
      NameValuePair.prototype.forEach = function(callback){
          //callback.call(this) 
          callback.call(this);
          //if .value.root.name instanceof ObjectLiteral
          if (this.value.root.name instanceof ObjectLiteral) {
            //declare .value.root.name:ObjectLiteral
            
            //.value.root.name.forEach callback # recurse
            this.value.root.name.forEach(callback);// # recurse
          };
      };
      //end helper recursive functions
      
    // export
    module.exports.NameValuePair = NameValuePair;
    
    // end class NameValuePair
//## FreeObjectLiteral
//Defines an object with a list of key value pairs. 
//Each pair can be in it's own line. A indent denotes a new level deep.
//FreeObjectLiterals are triggered by a "dangling assignment"
//Examples: 
///*
    //var x =            // <- dangling assignment
          //a: 1 
          //b:           // <- dangling assignment
            //b1:"some"
            //b2:"latte"
    //var x =
     //a:1
     //b:2
     //c:
      //d:1
     //months: ["J","F",
      //"M","A","M","J",
      //"J","A","S","O",
      //"N","D" ]
    //var y =
     //c:{d:1}
     //trimester:[
       //"January"
       //"February"
       //"March"
     //]
     //getValue: function(i)
       //return y.trimester[i]
//*/
//### public class FreeObjectLiteral extends ObjectLiteral
    // constructor
    function FreeObjectLiteral(){ // default constructor
    // default constructor: call super.constructor
        ObjectLiteral.prototype.constructor.apply(this,arguments)
    };
    // FreeObjectLiteral (extends|proto is) ObjectLiteral
    FreeObjectLiteral.prototype.__proto__ = ObjectLiteral.prototype;
//get items: optional comma separated, closes on de-indent, at least one required
      //method parse()
      FreeObjectLiteral.prototype.parse = function(){
        //.lock()
        this.lock();
        //.items = .reqSeparatedList(NameValuePair,',') 
        this.items = this.reqSeparatedList(NameValuePair, ',');
      };
    // export
    module.exports.FreeObjectLiteral = FreeObjectLiteral;
    
    // end class FreeObjectLiteral
//## ParenExpression
//`ParenExpression: '(' Expression ')'`
//An expression enclosed by parentheses, like `(a + b)`.
    //public class ParenExpression extends ASTBase
    // constructor
    function ParenExpression(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
      //properties expr:Expression
    };
    // ParenExpression (extends|proto is) ASTBase
    ParenExpression.prototype.__proto__ = ASTBase.prototype;
      //method parse()
      ParenExpression.prototype.parse = function(){
        //.req '('
        this.req('(');
        //.lock()
        this.lock();
        //.expr = .req(Expression)
        this.expr = this.req(Expression);
        //.opt 'NEWLINE'
        this.opt('NEWLINE');
        //.req ')'
        this.req(')');
      };
    // export
    module.exports.ParenExpression = ParenExpression;
    
    // end class ParenExpression
//## FunctionDeclaration
//`FunctionDeclaration: 'function [IDENTIFIER] ["(" [VariableDecl,]* ")"] [returns type-VariableRef] Body`
//Functions: parametrized pieces of callable code.
    //public class FunctionDeclaration extends ASTBase
    // constructor
    function FunctionDeclaration(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
      //properties 
        //specifier
        //paramsDeclarations: VariableDecl array
        //definePropItems: DefinePropertyItem array
        //body
        //hasExceptionBlock: boolean
        //EndFnLineNum
    };
    // FunctionDeclaration (extends|proto is) ASTBase
    FunctionDeclaration.prototype.__proto__ = ASTBase.prototype;
      //method parse()
      FunctionDeclaration.prototype.parse = function(){
        //.specifier = .req('function','method','->')
        this.specifier = this.req('function', 'method', '->');
        //.lock()
        this.lock();
        //if .specifier isnt 'method' and .getParent(ClassDeclaration)
        if (this.specifier !== 'method' && this.getParent(ClassDeclaration)) {
            //.throwError "unexpected 'function' in 'class/namespace' body. You should use 'method'"
            this.throwError("unexpected 'function' in 'class/namespace' body. You should use 'method'");
        };
//'->' are anonymous functions
        //if .specifier is '->'
        if (this.specifier === '->') {
            //.name = ""
            this.name = "";
        }
        else {
        //else
            //.name = .opt('IDENTIFIER') 
            this.name = this.opt('IDENTIFIER');
            //if .name in ['__init','new'], .sayErr '"#{.name}" is a reserved function name'
            if (['__init', 'new'].indexOf(this.name)>=0) {this.sayErr('"' + this.name + '" is a reserved function name')};
        };
//get parameter members, and function body
        //.parseParametersAndBody
        this.parseParametersAndBody();
      };
      //#end parse
//##### helper method parseParametersAndBody()
      FunctionDeclaration.prototype.parseParametersAndBody = function(){
//This method is shared by functions, methods and constructors. 
//`()` after `function` are optional. It parses: `['(' [VariableDecl,] ')'] [returns VariableRef] '['DefinePropertyItem']'`
        //.EndFnLineNum = .sourceLineNum+1 //default value - store to generate accurate SourceMaps (js)
        this.EndFnLineNum = this.sourceLineNum + 1; //default value - store to generate accurate SourceMaps (js)
        //if .opt("(")
        if (this.opt("(")) {
            //.paramsDeclarations = .optSeparatedList(VariableDecl,',',')')
            this.paramsDeclarations = this.optSeparatedList(VariableDecl, ',', ')');
        }
        else if (this.specifier === '->') {// #we arrived here by: FnCall-param-Expression-Operand-'->'
        //else if .specifier is '->' #we arrived here by: FnCall-param-Expression-Operand-'->'
            //# after '->' we accept function params w/o parentheses.
            //# get parameter names (name:type only), up to [NEWLINE] or '=' 
            //.paramsDeclarations=[]
            this.paramsDeclarations = [];
            //until .lexer.token.type is 'NEWLINE' or .lexer.token.value is '='
            while(!(this.lexer.token.type === 'NEWLINE' || this.lexer.token.value === '=')){
                //if .paramsDeclarations.length, .req ','
                if (this.paramsDeclarations.length) {this.req(',')};
                //var varDecl = new VariableDecl(this, .req('IDENTIFIER'))
                var varDecl = new VariableDecl(this, this.req('IDENTIFIER'));
                //if .opt(":"), varDecl.parseType
                if (this.opt(":")) {varDecl.parseType()};
                //.paramsDeclarations.push varDecl
                this.paramsDeclarations.push(varDecl);
            };// end loop
            
        };
        //if .opt('=') #one line function. Body is a Expression
        if (this.opt('=')) {// #one line function. Body is a Expression
            //.body = .req(Expression)
            this.body = this.req(Expression);
        }
        else {
        //else # full body function
            //if .opt('returns'), .parseType  #function return type
            if (this.opt('returns')) {this.parseType()};
            //if .opt('[','SPACE_BRACKET') # property attributes (non-enumerable, writable, etc - Object.defineProperty)
            if (this.opt('[', 'SPACE_BRACKET')) {// # property attributes (non-enumerable, writable, etc - Object.defineProperty)
                //.definePropItems = .optSeparatedList(DefinePropertyItem,',',']')
                this.definePropItems = this.optSeparatedList(DefinePropertyItem, ',', ']');
            };
            //#indented function body
            //.body = .req(Body)
            this.body = this.req(Body);
            //# get function exit point source line number (for SourceMap)
            //.EndFnLineNum = .lexer.maxSourceLineNum
            this.EndFnLineNum = this.lexer.maxSourceLineNum;
        };
        //end if
        
      };
    // export
    module.exports.FunctionDeclaration = FunctionDeclaration;
    
    // end class FunctionDeclaration
//### public class DefinePropertyItem extends ASTBase
    // constructor
    function DefinePropertyItem(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
//This Symbol handles property attributes, the same used at js's **Object.DefineProperty()**
      //declare name affinity definePropItem
      //properties
        //negated:boolean
    };
    // DefinePropertyItem (extends|proto is) ASTBase
    DefinePropertyItem.prototype.__proto__ = ASTBase.prototype;
      
      //method parse()
      DefinePropertyItem.prototype.parse = function(){
        //.lock()
        this.lock();
        //.negated = .opt('not')
        this.negated = this.opt('not');
        //.name = .req('enumerable','configurable','writable')
        this.name = this.req('enumerable', 'configurable', 'writable');
      };
    // export
    module.exports.DefinePropertyItem = DefinePropertyItem;
    
    // end class DefinePropertyItem
//## MethodDeclaration 
//`MethodDeclaration: 'method [name] ["(" [VariableDecl,] ")"] [returns type-VariableRef] ["["DefinePropertyItem,"]"] Body`
//A `method` is a function defined in the prototype of a class. 
//A `method` has an implicit var `this` pointing to the specific instance the method is called on.
//MethodDeclaration derives from FunctionDeclaration, so both are instance of FunctionDeclaration
//Examples:
//<br>`method concat(a:string, b:string) return string`
//<br>`method remove(element) [not enumerable, not writable, configurable]`
    //public class MethodDeclaration extends FunctionDeclaration
    // constructor
    function MethodDeclaration(){ // default constructor
    // default constructor: call super.constructor
        FunctionDeclaration.prototype.constructor.apply(this,arguments)
    };
    // MethodDeclaration (extends|proto is) FunctionDeclaration
    MethodDeclaration.prototype.__proto__ = FunctionDeclaration.prototype;
      //method parse()
      MethodDeclaration.prototype.parse = function(){
        //.specifier = .req('method')
        this.specifier = this.req('method');
        //.lock()
        this.lock();
//require method name. Note: jQuery uses 'not' and 'has' as method names, so here we 
//take any token, and then check if it's a valid identifier
        ////.name = .req('IDENTIFIER') 
        //var name = .lexer.token.value 
        var name = this.lexer.token.value;
        //if no PMREX.whileRanges(name,"0-9") and name is PMREX.whileRanges(name,"a-zA-Z0-9$_") 
        if (!PMREX.whileRanges(name, "0-9") && name === PMREX.whileRanges(name, "a-zA-Z0-9$_")) {
            //do nothing //if do no start with a number and it's composed by "a-zA-Z0-9$_", is valid
            null; //if do no start with a number and it's composed by "a-zA-Z0-9$_", is valid
        }
        else {
        //else 
            //.throwError 'invalid method name: "#{name}"'
            this.throwError('invalid method name: "' + name + '"');
        };
        //.name = name
        this.name = name;
        //.lexer.nextToken
        this.lexer.nextToken();
//now parse parameters and body (as with any function)
        //.parseParametersAndBody
        this.parseParametersAndBody();
      };
    // export
    module.exports.MethodDeclaration = MethodDeclaration;
    
    // end class MethodDeclaration
//## ClassDeclaration
//`ClassDeclaration: class IDENTIFIER [[","] (extends|inherits from)] Body`
//Defines a new class with an optional parent class. properties and methods go inside the block.
    //public class ClassDeclaration extends ASTBase
    // constructor
    function ClassDeclaration(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
      //properties
        //varRefSuper:VariableRef
        //body
    };
    // ClassDeclaration (extends|proto is) ASTBase
    ClassDeclaration.prototype.__proto__ = ASTBase.prototype;
      //declare name affinity classDecl
      
      //method parse()
      ClassDeclaration.prototype.parse = function(){
        //.req 'class'
        this.req('class');
        //.lock()
        this.lock();
        //.name = .req('IDENTIFIER')
        this.name = this.req('IDENTIFIER');
//Control: class names should be Capitalized, except: jQuery
        //if not .lexer.interfaceMode and not String.isCapitalized(.name)
        if (!(this.lexer.interfaceMode) && !(String.isCapitalized(this.name))) {
            //.lexer.sayErr "class names should be Capitalized: class #{.name}"
            this.lexer.sayErr("class names should be Capitalized: class " + this.name);
        };
//Now parse optional `,(extend|proto is|inherits from)` setting the super class
        //.opt(',') 
        this.opt(',');
        //if .opt('extends','inherits','proto') 
        if (this.opt('extends', 'inherits', 'proto')) {
          //.opt('from','is') 
          this.opt('from', 'is');
          //.varRefSuper = .req(VariableRef)
          this.varRefSuper = this.req(VariableRef);
        };
//Now get body.
        //.body = .opt(Body)
        this.body = this.opt(Body);
        //.body.validate 
            //PropertiesDeclaration, ConstructorDeclaration 
            //MethodDeclaration, DeclareStatement
        this.body.validate(PropertiesDeclaration, ConstructorDeclaration, MethodDeclaration, DeclareStatement);
      };
    // export
    module.exports.ClassDeclaration = ClassDeclaration;
    
    // end class ClassDeclaration
//## ConstructorDeclaration 
//`ConstructorDeclaration : 'constructor [new className-IDENTIFIER] ["(" [VariableDecl,]* ")"] [returns type-VariableRef] Body`
//A `constructor` is the main function of the class. In js is the function-class body  (js: `function Class(...){... `)
//The `constructor` method is called upon creation of the object, by the `new` operator.
//The return value is the value returned by `new` operator, that is: the new instance of the class.
//ConstructorDeclaration derives from MethodDeclaration, so it is also a instance of FunctionDeclaration
    //public class ConstructorDeclaration extends MethodDeclaration
    // constructor
    function ConstructorDeclaration(){ // default constructor
    // default constructor: call super.constructor
        MethodDeclaration.prototype.constructor.apply(this,arguments)
    };
    // ConstructorDeclaration (extends|proto is) MethodDeclaration
    ConstructorDeclaration.prototype.__proto__ = MethodDeclaration.prototype;
      //method parse()
      ConstructorDeclaration.prototype.parse = function(){
        //.specifier = .req('constructor')
        this.specifier = this.req('constructor');
        //.lock()
        this.lock();
        //.name = '__init'
        this.name = '__init';
        //if .opt('new') # optional: constructor new Person(name:string)
        if (this.opt('new')) {// # optional: constructor new Person(name:string)
          //# to ease reading, and to find also the constructor when searching for "new Person"
          //var className = .req('IDENTIFIER')
          var className = this.req('IDENTIFIER');
          //var classDeclaration = .getParent(ClassDeclaration)
          var classDeclaration = this.getParent(ClassDeclaration);
          //if classDeclaration and classDeclaration.name isnt className
          if (classDeclaration && classDeclaration.name !== className) {
              //.sayErr "Class Name mismatch #{className}/#{classDeclaration.name}"
              this.sayErr("Class Name mismatch " + className + "/" + classDeclaration.name);
          };
        };
//now get parameters and body (as with any function)
        //.parseParametersAndBody
        this.parseParametersAndBody();
      };
    // export
    module.exports.ConstructorDeclaration = ConstructorDeclaration;
    
    // end class ConstructorDeclaration
      //#end parse
//------------------------------
//## AppendToDeclaration
//`AppendToDeclaration: append to (class|object) VariableRef Body`
//Adds methods and properties to an existent object, e.g., Class.prototype
    //public class AppendToDeclaration extends ClassDeclaration
    // constructor
    function AppendToDeclaration(){ // default constructor
    // default constructor: call super.constructor
        ClassDeclaration.prototype.constructor.apply(this,arguments)
      
      //properties 
        //toNamespace
        //varRef:VariableRef
    };
    // AppendToDeclaration (extends|proto is) ClassDeclaration
    AppendToDeclaration.prototype.__proto__ = ClassDeclaration.prototype;
      //method parse()
      AppendToDeclaration.prototype.parse = function(){
        //.req 'append','Append'
        this.req('append', 'Append');
        //.req 'to'
        this.req('to');
        //.lock()
        this.lock();
        //var appendToWhat:string = .req('class','Class','namespace','Namespace')
        var appendToWhat = this.req('class', 'Class', 'namespace', 'Namespace');
        //.toNamespace = appendToWhat.endsWith('space')
        this.toNamespace = appendToWhat.endsWith('space');
        //.varRef = .req(VariableRef)
        this.varRef = this.req(VariableRef);
        //if .toNamespace, .name=.varRef.toString()
        if (this.toNamespace) {this.name = this.varRef.toString()};
//Now get body.
        //.body = .req(Body)
        this.body = this.req(Body);
        //.body.validate 
            //PropertiesDeclaration
            //MethodDeclaration
            //ClassDeclaration
        this.body.validate(PropertiesDeclaration, MethodDeclaration, ClassDeclaration);
      };
    // export
    module.exports.AppendToDeclaration = AppendToDeclaration;
    
    // end class AppendToDeclaration
//## NamespaceDeclaration
//`NamespaceDeclaration: namespace IDENTIFIER Body`
//Declares a namespace. 
//for js: creates a object with methods and properties
//for LiteC, just declare a namespace. All classes created inside will have the namespace prepended with "_"
    //public class NamespaceDeclaration extends ClassDeclaration // NamespaceDeclaration is instance of ClassDeclaration
    // constructor
    function NamespaceDeclaration(){ // default constructor
    // default constructor: call super.constructor
        ClassDeclaration.prototype.constructor.apply(this,arguments)
    };
    // NamespaceDeclaration (extends|proto is) ClassDeclaration
    NamespaceDeclaration.prototype.__proto__ = ClassDeclaration.prototype;
      
      //method parse()
      NamespaceDeclaration.prototype.parse = function(){
        //.req 'namespace','Namespace'
        this.req('namespace', 'Namespace');
        //.lock()
        this.lock();
        //.name=.req('IDENTIFIER')
        this.name = this.req('IDENTIFIER');
//Now get body.
        //.body = .req(Body)
        this.body = this.req(Body);
        //.body.validate 
            //PropertiesDeclaration
            //MethodDeclaration
            //ClassDeclaration
            //NamespaceDeclaration
        this.body.validate(PropertiesDeclaration, MethodDeclaration, ClassDeclaration, NamespaceDeclaration);
      };
    // export
    module.exports.NamespaceDeclaration = NamespaceDeclaration;
    
    // end class NamespaceDeclaration
//## DebuggerStatement
//`DebuggerStatement: debugger`
//When a debugger is attached, break at this point.
    //public class DebuggerStatement extends ASTBase
    // constructor
    function DebuggerStatement(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
    };
    // DebuggerStatement (extends|proto is) ASTBase
    DebuggerStatement.prototype.__proto__ = ASTBase.prototype;
      //method parse()
      DebuggerStatement.prototype.parse = function(){
        //.name = .req("debugger")
        this.name = this.req("debugger");
      };
    // export
    module.exports.DebuggerStatement = DebuggerStatement;
    
    // end class DebuggerStatement
//CompilerStatement
//-----------------
//`compiler` is a generic entry point to alter LiteScript compiler from source code.
//It allows conditional complilation, setting compiler options, and execute macros
//to generate code on the fly. 
//Future: allow the programmer to hook transformations on the compiler process itself.
//<br>`CompilerStatement: (compiler|compile) (set|if|debugger|option) Body`
//<br>`set-CompilerStatement: compiler set (VariableDecl,)`
//<br>`conditional-CompilerStatement: 'compile if IDENTIFIER Body`
    //public class CompilerStatement extends ASTBase
    // constructor
    function CompilerStatement(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
      //properties
        //kind, conditional:string
        //list, body
        //endLineInx
    };
    // CompilerStatement (extends|proto is) ASTBase
    CompilerStatement.prototype.__proto__ = ASTBase.prototype;
      //method parse()
      CompilerStatement.prototype.parse = function(){
        //.req 'compiler','compile'
        this.req('compiler', 'compile');
        //.lock()
        this.lock();
        //.kind = .req('set','if','debugger','options')
        this.kind = this.req('set', 'if', 'debugger', 'options');
//### compiler set
//get list of declared names, add to root node 'Compiler Vars'
        //if .kind is 'set'
        if (this.kind === 'set') {
            //.list = .reqSeparatedList(VariableDecl,',')
            this.list = this.reqSeparatedList(VariableDecl, ',');
        }
        else if (this.kind === 'debugger') {// #debug-pause the compiler itself, to debug compiling process
//### compiler if conditional compilation
///*        else if .kind is 'if'
          //.conditional = .req('IDENTIFIER')
          //if .compilerVar(.conditional)
              //.body = .req(Body)
          //else
            ////skip block
            //do 
              //.lexer.nextToken
            //loop until .lexer.indent <= .indent
//*/
//### other compile options
        //else if .kind is 'debugger' #debug-pause the compiler itself, to debug compiling process
          //debugger
          debugger;
        }
        else {
        //else
          //.sayErr 'invalid compiler command'
          this.sayErr('invalid compiler command');
        };
      };
    // export
    module.exports.CompilerStatement = CompilerStatement;
    
    // end class CompilerStatement
//## Import Statement
//`ImportStatement: import (ImportStatementItem,)`
//Example: `global import fs, path` ->  js:`var fs=require('fs'),path=require('path')`
//Example: `import Args, wait from 'wait.for'` ->  js:`var http=require('./Args'),wait=require('./wait.for')`
    //public class ImportStatement extends ASTBase
    // constructor
    function ImportStatement(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
      //properties 
        //global:boolean
        //list: ImportStatementItem array
    };
    // ImportStatement (extends|proto is) ASTBase
    ImportStatement.prototype.__proto__ = ASTBase.prototype;
      //method parse()
      ImportStatement.prototype.parse = function(){
        //.req('import')
        this.req('import');
        //.lock
        this.lock();
        //if .lexer.options.browser, .throwError "'import' statement invalid in browser-mode. Do you mean 'global declare'?"
        if (this.lexer.options.browser) {this.throwError("'import' statement invalid in browser-mode. Do you mean 'global declare'?")};
        //.list = .reqSeparatedList(ImportStatementItem,",")
        this.list = this.reqSeparatedList(ImportStatementItem, ",");
//keep track of `import/require` calls
        //var parentModule = .getParent(Module)
        var parentModule = this.getParent(Module);
        //for each item in .list
        for( var item__inx=0,item ; item__inx<this.list.length ; item__inx++){item=this.list[item__inx];
        
            //parentModule.requireCallNodes.push item
            parentModule.requireCallNodes.push(item);
        };// end for each in this.list
        
      };
    // export
    module.exports.ImportStatement = ImportStatement;
    
    // end class ImportStatement
//### export class ImportStatementItem extends ASTBase
    // constructor
    function ImportStatementItem(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
//`ImportStatementItem: IDENTIFIER [from STRING]`
      //properties 
        //importParameter:StringLiteral
    };
    // ImportStatementItem (extends|proto is) ASTBase
    ImportStatementItem.prototype.__proto__ = ASTBase.prototype;
      //method parse()
      ImportStatementItem.prototype.parse = function(){
        //.name = .req('IDENTIFIER')
        this.name = this.req('IDENTIFIER');
        //if .opt('from')
        if (this.opt('from')) {
            //.lock()
            this.lock();
            //.importParameter = .req(StringLiteral)
            this.importParameter = this.req(StringLiteral);
        };
      };
    // export
    module.exports.ImportStatementItem = ImportStatementItem;
    
    // end class ImportStatementItem
//## DeclareStatement
//Declare allows you to define a variable and/or its type 
//*for the type-checker (at compile-time)*
//#####Declare variable:type
//`DeclareStatement: declare VariableRef:type-VariableRef` 
//Declare a variable type on the fly, from declaration point onward
//Example: `declare name:string, parent:Grammar.Statement` #on the fly, from declaration point onward
//#####Global Declare
//`global declare (ImportStatementItem+)`
//Browser-mode: Import a *.interface.md* file to declare a global pre-existent complex objects 
//Example: `global declare jQuery,Document,Window`
//#####Declare [global] var
//`DeclareStatement: declare [global] var (VariableDecl,)+`
//Allows you to declare a preexistent [global] variable
//Example: `declare global var window:object`
//#####Declare global type for VariableRef
//Allows you to set the type on a existing variable
//globally for the entire compilation.
//Example: 
//`declare global type for LocalData.user: Models.userData` #set type globally for the entire compilation
    
//#####Declare name affinity
//`DeclareStatement: name affinity (IDENTIFIER,)+` 
//To be used inside a class declaration, declare var names 
//that will default to Class as type
//Example
//```
  //Class VariableDecl
    //properties
      //name: string, sourceLine, column
      //declare name affinity varDecl
//```
//Given the above declaration, any `var` named (or ending in) **"varDecl"** or **"VariableDecl"** 
//will assume `:VariableDecl` as type. (Class name is automatically included in 'name affinity')
//Example:
//`var varDecl, parentVariableDecl, childVarDecl, variableDecl`
//all three vars will assume `:VariableDecl` as type.
//#####Declare valid
//`DeclareStatement: declare valid IDENTIFIER("."(IDENTIFIER|"()"|"[]"))* [:type-VariableRef]` 
//To declare, on the fly, known-valid property chains for local variables.
//Example: 
  //`declare valid data.user.name`
  //`declare valid node.parent.parent.text:string`
  //`declare valid node.parent.items[].name:string`
//#####Declare on 
//`DeclareStatement: declare on IDENTIFIER (VariableDecl,)+` 
//To declare valid members on scope vars. 
//Allows you to declare the valid properties for a local variable or parameter
//Example: 
///*
    //function startServer(options)
        //declare on options 
            //name:string, useHeaders:boolean, port:number
//*/
//### export class DeclareStatement extends ASTBase
    // constructor
    function DeclareStatement(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
      //properties
        //varRef: VariableRef
        //names: VariableDecl array
        //list: ImportStatementItem array
        //specifier
        //globVar: boolean
    };
    // DeclareStatement (extends|proto is) ASTBase
    DeclareStatement.prototype.__proto__ = ASTBase.prototype;
      //method parse()
      DeclareStatement.prototype.parse = function(){
        //.req 'declare'
        this.req('declare');
        //.lock()
        this.lock();
//if it was 'global declare', treat as import statement
        //if .hasAdjective('global')
        if (this.hasAdjective('global')) {
              //.list = .reqSeparatedList(ImportStatementItem,",")
              this.list = this.reqSeparatedList(ImportStatementItem, ",");
              ////keep track of `import/require` calls
              //var parentModule = .getParent(Module)
              var parentModule = this.getParent(Module);
              //for each item in .list
              for( var item__inx=0,item ; item__inx<this.list.length ; item__inx++){item=this.list[item__inx];
              
                  //parentModule.requireCallNodes.push item
                  parentModule.requireCallNodes.push(item);
              };// end for each in this.list
              //return
              return;
        };
        //end if
        
//get specifier 'on|valid|name|all'
        //.specifier = .opt('on','valid','name','global','var')
        this.specifier = this.opt('on', 'valid', 'name', 'global', 'var');
        //if .lexer.token.value is ':' #it was used as a var name
        if (this.lexer.token.value === ':') {// #it was used as a var name
            //.specifier='on-the-fly'
            this.specifier = 'on-the-fly';
            //.lexer.returnToken
            this.lexer.returnToken();
        }
        else if (!this.specifier) {
        //else if no .specifier
            //.specifier='on-the-fly' #no specifier => assume on-the-fly type assignment
            this.specifier = 'on-the-fly';// #no specifier => assume on-the-fly type assignment
        };
        //end if
        
        //#handle '...global var..' & '...global type for..'
        //if .specifier is 'global' #declare global (var|type for)... 
        if (this.specifier === 'global') {// #declare global (var|type for)...
            //.specifier = .req('var','type') #require 'var|type'
            this.specifier = this.req('var', 'type');// #require 'var|type'
            //if .specifier is 'var'
            if (this.specifier === 'var') {
                  //.globVar = true
                  this.globVar = true;
            }
            else {
            //else # .specifier is 'type' require 'for'
                  //.req('for')
                  this.req('for');
            };
        };
        //end if
        
        //case .specifier
        
          //when  'on-the-fly','type'
        if ((this.specifier=='on-the-fly')||(this.specifier=='type')){
            //#declare VarRef:Type
            //.varRef = .req(VariableRef)
            this.varRef = this.req(VariableRef);
            //.req(':') //type expected
            this.req(':'); //type expected
            //.parseType 
            this.parseType();
        
        }
          //when 'valid'
        else if ((this.specifier=='valid')){
            //.varRef = .req(VariableRef)
            this.varRef = this.req(VariableRef);
            //if no .varRef.accessors, .sayErr "declare valid: expected accesor chain. Example: 'declare valid name.member.member'"
            if (!this.varRef.accessors) {this.sayErr("declare valid: expected accesor chain. Example: 'declare valid name.member.member'")};
            //if .opt(':') 
            if (this.opt(':')) {
                //.parseType //optional type
                this.parseType(); //optional type
            };
        
        }
          //when 'name'
        else if ((this.specifier=='name')){
            //.specifier = .req('affinity')
            this.specifier = this.req('affinity');
            //.names = .reqSeparatedList(VariableDecl,',')
            this.names = this.reqSeparatedList(VariableDecl, ',');
            //for each varDecl in .names
            for( var varDecl__inx=0,varDecl ; varDecl__inx<this.names.length ; varDecl__inx++){varDecl=this.names[varDecl__inx];
            
               //if (varDecl.type and varDecl.type isnt 'any') or varDecl.assignedValue
               if ((varDecl.type && varDecl.type !== 'any') || varDecl.assignedValue) {
                  //.sayErr "declare name affinity: expected 'name,name,...'"
                  this.sayErr("declare name affinity: expected 'name,name,...'");
               };
            };// end for each in this.names
            
        
        }
          //when 'var'
        else if ((this.specifier=='var')){
            //.names = .reqSeparatedList(VariableDecl,',')
            this.names = this.reqSeparatedList(VariableDecl, ',');
            //for each varDecl in .names
            for( var varDecl__inx=0,varDecl ; varDecl__inx<this.names.length ; varDecl__inx++){varDecl=this.names[varDecl__inx];
            
               //if varDecl.assignedValue
               if (varDecl.assignedValue) {
                  //.sayErr "declare var. Cannot assign value in .interface.md file."
                  this.sayErr("declare var. Cannot assign value in .interface.md file.");
               };
            };// end for each in this.names
            
        
        }
          //when 'on'
        else if ((this.specifier=='on')){
            //.name = .req('IDENTIFIER')
            this.name = this.req('IDENTIFIER');
            //.names = .reqSeparatedList(VariableDecl,',')
            this.names = this.reqSeparatedList(VariableDecl, ',');
        
        };
        ////end cases
        //return 
        return;
      };
      //end method parse
      
    // export
    module.exports.DeclareStatement = DeclareStatement;
    
    // end class DeclareStatement
//## DefaultAssignment
//`DefaultAssignment: default AssignmentStatement`
//It is a common pattern in javascript to use a object parameters (named "options")
//to pass misc options to functions.
//Litescript provide a 'default' construct as syntax sugar for this common pattern
//The 'default' construct is formed as an ObjectLiteral assignment, 
//but only the 'undfined' properties of the object will be assigned.
//Example: /*
    //function theApi(object,options,callback)
      //default options =
        //logger: console.log
        //encoding: 'utf-8'
        //throwErrors: true
        //debug:
          //enabled: false
          //level: 2
      //end default
      //...function body...
    //end function
//*/
//is equivalent to js's:
///*
    //function theApi(object,options,callback) {
        ////defaults
        //if (!options) options = {};
        //if (options.logger===undefined) options.logger = console.log;
        //if (options.encoding===undefined) options.encoding = 'utf-8';
        //if (options.throwErrors===undefined) options.throwErrors=true;
        //if (!options.debug) options.debug = {};
        //if (options.debug.enabled===undefined) options.debug.enabled=false;
        //if (options.debug.level===undefined) options.debug.level=2;
        //...function body...
    //}
//*/
//### public class DefaultAssignment extends ASTBase
    // constructor
    function DefaultAssignment(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
  
      //properties
        //assignment: AssignmentStatement
    };
    // DefaultAssignment (extends|proto is) ASTBase
    DefaultAssignment.prototype.__proto__ = ASTBase.prototype;
      //method parse()
      DefaultAssignment.prototype.parse = function(){
        //.req 'default'
        this.req('default');
        //.lock()
        this.lock();
        //.assignment = .req(AssignmentStatement)
        this.assignment = this.req(AssignmentStatement);
      };
    // export
    module.exports.DefaultAssignment = DefaultAssignment;
    
    // end class DefaultAssignment
//## End Statement
//`EndStatement: end (IDENTIFIER)* NEWLINE`
//`end` is an **optional** end-block marker to ease code reading.
//It marks the end of code blocks, and can include extra tokens referencing the construction
//closed. (in the future) This references will be cross-checked, to help redude subtle bugs
//by checking that the block ending here is the intended one.
//If it's not used, the indentation determines where blocks end ()
//Example: `end if` , `end loop`, `end for each item`
//Usage Examples:  
///*
    //if a is 3 and b is 5
      //print "a is 3"
      //print "b is 5"
    //end if
    //loop while a < 10
      //a++
      //b++
    //end loop
//*/
//### public class EndStatement extends ASTBase
    // constructor
    function EndStatement(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
  
      //properties
        //references:string array
    };
    // EndStatement (extends|proto is) ASTBase
    EndStatement.prototype.__proto__ = ASTBase.prototype;
      //method parse()
      EndStatement.prototype.parse = function(){
        //.req 'end'
        this.req('end');
        //.lock()
        this.lock();
        //.references=[]
        this.references = [];
 
        //var block:ASTBase
        var block = undefined;
        //if .parent.parent is instanceof Body or .parent.parent is instanceof Module
        if (this.parent.parent instanceof Body || this.parent.parent instanceof Module) {
            //block = .parent.parent
            block = this.parent.parent;
        };
        //if no block
        if (!block) {
            //.lexer.throwErr "'end' statement found outside a block"
            this.lexer.throwErr("'end' statement found outside a block");
        };
        //var expectedIndent = block.indent or 4
        var expectedIndent = block.indent || 4;
        //if .indent isnt expectedIndent
        if (this.indent !== expectedIndent) {
            //.lexer.throwErr "'end' statement misaligned indent: #{.indent}. Expected #{expectedIndent} to close block started at line #{block.sourceLineNum}"
            this.lexer.throwErr("'end' statement misaligned indent: " + this.indent + ". Expected " + expectedIndent + " to close block started at line " + block.sourceLineNum);
        };
            
 
//The words after `end` are just 'loose references' to the block intended to be closed
//We pick all the references up to EOL (or EOF)
        //while not .opt('NEWLINE','EOF')
        while(!(this.opt('NEWLINE', 'EOF'))){
//Get optional identifier reference
//We save `end` references, to match on block indentation,
//for Example: `end for` indentation must match a `for` statement on the same indent
            //if .lexer.token.type is 'IDENTIFIER'
            if (this.lexer.token.type === 'IDENTIFIER') {
              //.references.push(.lexer.token.value)
              this.references.push(this.lexer.token.value);
            };
            //.lexer.nextToken
            this.lexer.nextToken();
        };// end loop
        
      };
    // export
    module.exports.EndStatement = EndStatement;
    
    // end class EndStatement
        //#end loop
//## YieldExpression
//`YieldExpression: yield until asyncFnCall-VariableRef`
//`YieldExpression: yield parallel map array-Expression asyncFnCall-VariableRef`
//`yield until` expression calls a 'standard node.js async function'
//and `yield` execution to the caller function until the async completes (callback).
//A 'standard node.js async function' is an async function 
//with the last parameter = callback(err,data)
//The yield-wait is implemented by exisiting lib 'nicegen'.
//Example: `contents = yield until fs.readFile 'myFile.txt','utf8'`
    //public class YieldExpression extends ASTBase
    // constructor
    function YieldExpression(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
  
      //properties
        //specifier
        //fnCall
        //arrExpression
    };
    // YieldExpression (extends|proto is) ASTBase
    YieldExpression.prototype.__proto__ = ASTBase.prototype;
      //method parse()
      YieldExpression.prototype.parse = function(){
        //.req 'yield'
        this.req('yield');
        //.specifier = .req('until','parallel')
        this.specifier = this.req('until', 'parallel');
        
        //.lock()
        this.lock();
        //if .specifier is 'until'
        if (this.specifier === 'until') {
            //.fnCall = .req(FunctionCall)
            this.fnCall = this.req(FunctionCall);
        }
        else {
        //else
            //.req 'map'
            this.req('map');
            //.arrExpression = .req(Expression)
            this.arrExpression = this.req(Expression);
            //.fnCall = .req(FunctionCall)
            this.fnCall = this.req(FunctionCall);
        };
      };
    // export
    module.exports.YieldExpression = YieldExpression;
    
    // end class YieldExpression
//FunctionCall
//------------
//`FunctionCall: VariableRef ["("] (FunctionArgument,) [")"]`
    //public class FunctionCall extends ASTBase
    // constructor
    function FunctionCall(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
      
      //declare name affinity fnCall
      //properties
          //varRef: VariableRef
    };
    // FunctionCall (extends|proto is) ASTBase
    FunctionCall.prototype.__proto__ = ASTBase.prototype;
      
      //method parse(options)
      FunctionCall.prototype.parse = function(options){
        //declare valid .parent.preParsedVarRef
        
//Check for VariableRef. - can include (...) FunctionAccess
        //if .parent.preParsedVarRef #VariableRef already parsed
        if (this.parent.preParsedVarRef) {// #VariableRef already parsed
          //.varRef = .parent.preParsedVarRef #use it
          this.varRef = this.parent.preParsedVarRef;// #use it
        }
        else {
        //else  
          //.varRef = .req(VariableRef)
          this.varRef = this.req(VariableRef);
        };
//if the last accessor is function call, this is already a FunctionCall
        ////debug "#{.varRef.toString()} #{.varRef.executes?'executes':'DO NOT executes'}"
        //if .varRef.executes
        if (this.varRef.executes) {
            //return #already a function call
            return;// #already a function call
        };
        //if .lexer.token.type is 'EOF'
        if (this.lexer.token.type === 'EOF') {
            //return // no more tokens 
            return; // no more tokens
        };
        
//alllow a indented block to be parsed as fn call arguments
        //if .opt('NEWLINE') // if end of line, check next line
        if (this.opt('NEWLINE')) { // if end of line, check next line
            //var nextLineIndent = .lexer.indent //save indent
            var nextLineIndent = this.lexer.indent; //save indent
            //.lexer.returnToken() //return NEWLINE
            this.lexer.returnToken(); //return NEWLINE
            //// check if next line is indented (with respect to Statement (parent))
            //if nextLineIndent <= .parent.indent // next line is not indented 
            if (nextLineIndent <= this.parent.indent) { // next line is not indented
                  //// assume this is just a fn call w/o parameters
                  //return
                  return;
            };
        };
//else, get parameters, add to varRef as FunctionAccess accessor,
        //var functionAccess = new FunctionAccess(.varRef)
        var functionAccess = new FunctionAccess(this.varRef);
        //functionAccess.args = functionAccess.reqSeparatedList(FunctionArgument,",")
        functionAccess.args = functionAccess.reqSeparatedList(FunctionArgument, ",");
        //if .lexer.token.value is '->' #add last parameter: callback function
        if (this.lexer.token.value === '->') {// #add last parameter: callback function
            //functionAccess.args.push .req(FunctionDeclaration)
            functionAccess.args.push(this.req(FunctionDeclaration));
        };
        //.varRef.addAccessor functionAccess
        this.varRef.addAccessor(functionAccess);
      };
    // export
    module.exports.FunctionCall = FunctionCall;
    
    // end class FunctionCall
//## CaseStatement
//`CaseStatement: case [VariableRef] [instance of] NEWLINE (when (Expression,) Body)* [else Body]`
//Similar syntax to ANSI-SQL 'CASE', and ruby's 'case'
//but it is a "statement" not a expression
//Examples: /*
    //case b 
      //when 2,4,6 
        //print 'even' 
      //when 1,3,5 
        //print 'odd'
      //else 
        //print 'idk' 
    //end
    //// case instance of
    //case b instance of
      //when VarStatement
        //print 'variables #{b.list}' 
      //when AppendToDeclaration
        //print 'it is append to #{b.varRef}'
      //when NamespaceDeclaration
        //print 'namespace #{b.name}'
      //when ClassDeclaration
        //print 'a class, extends #{b.varRefSuper}'
      //else 
        //print 'unexpected class' 
    
    //end
    //// case when TRUE
    //var result
    //case 
        //when a is 3 or b < 10 
            //result = 'option 1'
        //when b >= 10 or a<0 or c is 5 
            //result= 'option 2'
        //else 
            //result = 'other' 
    //end
//*/
//### public class CaseStatement extends ASTBase
    // constructor
    function CaseStatement(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
      //properties
        //varRef: VariableRef
        //isInstanceof: boolean
        //cases: array of WhenSection 
        //elseBody: Body
    };
    // CaseStatement (extends|proto is) ASTBase
    CaseStatement.prototype.__proto__ = ASTBase.prototype;
      //method parse()
      CaseStatement.prototype.parse = function(){
        
        //.req 'case'
        this.req('case');
        //.lock
        this.lock();
        //.varRef = .opt(VariableRef)
        this.varRef = this.opt(VariableRef);
        //.isInstanceof = .opt('instance','instanceof') //case foo instance of
        this.isInstanceof = this.opt('instance', 'instanceof'); //case foo instance of
        //if .isInstanceof is 'instance', .opt('of')
        if (this.isInstanceof === 'instance') {this.opt('of')};
        //.req('NEWLINE')
        this.req('NEWLINE');
        //.cases=[]
        this.cases = [];
        //while .opt(WhenSection) into var whenSection
        var whenSection=undefined;
        while((whenSection=this.opt(WhenSection))){
            //.cases.push whenSection
            this.cases.push(whenSection);
        };// end loop
        //if .cases.length is 0, .sayErr 'no "when" sections found for "case" construction'
        if (this.cases.length === 0) {this.sayErr('no "when" sections found for "case" construction')};
        //if .opt('else')
        if (this.opt('else')) {
            //.elseBody = .req(Body)
            this.elseBody = this.req(Body);
        };
      };
    // export
    module.exports.CaseStatement = CaseStatement;
    
    // end class CaseStatement
//### public helper class WhenSection extends ASTBase
    // constructor
    function WhenSection(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
//Helper class to parse each case
        //properties
            //expressions: Expression array
            //body
    };
    // WhenSection (extends|proto is) ASTBase
    WhenSection.prototype.__proto__ = ASTBase.prototype;
//we allow a list of comma separated expressions to compare to and a body
    
        //method parse()
        WhenSection.prototype.parse = function(){
            //.req 'when'
            this.req('when');
            //.lock
            this.lock();
            //.expressions = .reqSeparatedList(Expression, ",")
            this.expressions = this.reqSeparatedList(Expression, ",");
            //.body = .req(Body)
            this.body = this.req(Body);
        };
    // export
    module.exports.WhenSection = WhenSection;
    
    // end class WhenSection
//##Statement
//A `Statement` is an imperative statment (command) or a control construct.
//The `Statement` node is a generic container for all previously defined statements. 
//The generic `Statement` is used to define `Body: (Statement;)`, that is,
//**Body** is a list of semicolon (or NEWLINE) separated **Statements**.
//Grammar: 
//```
//Statement: [Adjective]* (ClassDeclaration|FunctionDeclaration
 //|IfStatement|ForStatement|WhileUntilLoop|DoLoop
 //|AssignmentStatement
 //|LoopControlStatement|ThrowStatement
 //|TryCatch|ExceptionBlock
 //|ReturnStatement|PrintStatement|DoNothingStatement)
//Statement: ( AssignmentStatement | fnCall-VariableRef [ ["("] (Expression,) [")"] ] )
//```
    //public class Statement extends ASTBase
    // constructor
    function Statement(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
  
      //properties
        //adjectives: string array = []
        //specific: ASTBase //specific statement, e.g.: :VarDeclaration, :PropertiesDeclaration, :FunctionDeclaration
        //preParsedVarRef
        //intoVars
        //lastSourceLineNum
          this.adjectives=[];
    };
    // Statement (extends|proto is) ASTBase
    Statement.prototype.__proto__ = ASTBase.prototype;
      //method parse()
      Statement.prototype.parse = function(){
        //var key
        var key = undefined;
        //#debug show line and tokens
        //logger.debug ""
        logger.debug("");
        //.lexer.infoLine.dump()
        this.lexer.infoLine.dump();
//First, fast-parse the statement by using a table.
//We look up the token (keyword) in **StatementsDirect** table, and parse the specific AST node
        //key = .lexer.token.value
        key = this.lexer.token.value;
        //.specific = .parseDirect(key, StatementsDirect)
        this.specific = this.parseDirect(key, StatementsDirect);
        //if no .specific
        if (!this.specific) {
//If it was not found, try optional adjectives (zero or more). 
//Adjectives are: `(export|public|generator|shim|helper)`. 
            //while .opt('public','export','nice','generator','shim','helper','global') into var adj
            var adj=undefined;
            while((adj=this.opt('public', 'export', 'nice', 'generator', 'shim', 'helper', 'global'))){
                //if adj is 'public', adj='export' #'public' is alias for 'export'
                if (adj === 'public') {adj = 'export'};
                //.adjectives.push adj
                this.adjectives.push(adj);
            };// end loop
//Now re-try fast-parse
            //key = .lexer.token.value
            key = this.lexer.token.value;
            //.specific = .parseDirect(key, StatementsDirect)
            this.specific = this.parseDirect(key, StatementsDirect);
//Last possibilities are: `FunctionCall` or `AssignmentStatement`
//both start with a `VariableRef`:
//(performance) **require** & pre-parse the VariableRef.
//Then we require a AssignmentStatement or FunctionCall
            //if no .specific
            if (!this.specific) {
                //key = 'varref'
                key = 'varref';
                //.preParsedVarRef = .req(VariableRef)
                this.preParsedVarRef = this.req(VariableRef);
                //.specific = .req(AssignmentStatement,FunctionCall)
                this.specific = this.req(AssignmentStatement, FunctionCall);
                //.preParsedVarRef = undefined #clear
                this.preParsedVarRef = undefined;// #clear
            };
        };
        //end if - statement parse tries
        
//If we reached here, we have parsed a valid statement. 
//remember where the full statment ends
        //.lastSourceLineNum = .lexer.maxSourceLineNum 
        this.lastSourceLineNum = this.lexer.maxSourceLineNum;
        //if .lastSourceLineNum<.sourceLineNum, .lastSourceLineNum = .sourceLineNum
        if (this.lastSourceLineNum < this.sourceLineNum) {this.lastSourceLineNum = this.sourceLineNum};
//store keyword of specific statement
        
        //key = key.toLowerCase()
        key = key.toLowerCase();
        //.keyword = key
        this.keyword = key;
        
//Check validity of adjective-statement combination 
        //var validCombinations = map
              //export: ['class','namespace','function','var'] 
              //generator: ['function','method'] 
              //nice: ['function','method'] 
              //shim: ['function','method','class','namespace','import'] 
              //helper:  ['function','method','class','namespace']
              //global: ['import','declare']
        var validCombinations = new Map().fromObject({
        export: ['class', 'namespace', 'function', 'var'], 
        generator: ['function', 'method'], 
        nice: ['function', 'method'], 
        shim: ['function', 'method', 'class', 'namespace', 'import'], 
        helper: ['function', 'method', 'class', 'namespace'], 
        global: ['import', 'declare']
});
        //for each adjective in .adjectives
        for( var adjective__inx=0,adjective ; adjective__inx<this.adjectives.length ; adjective__inx++){adjective=this.adjectives[adjective__inx];
        
              //var valid:string array = validCombinations.get(adjective) or ['-*none*-']
              var valid = validCombinations.get(adjective) || ['-*none*-'];
              //if key not in valid, .throwError "'#{adjective}' can only apply to #{valid.join('|')} not to '#{key}'"
              if (valid.indexOf(key)===-1) {this.throwError("'" + adjective + "' can only apply to " + (valid.join('|')) + " not to '" + key + "'")};
        };// end for each in this.adjectives
                          
        //end for
        
      };
    // export
    module.exports.Statement = Statement;
    
    // end class Statement
//### Append to class ASTBase
    
//##### helper method hasAdjective(name) returns boolean
      ASTBase.prototype.hasAdjective = function(name){
//To check if a statement has an adjective. We assume .parent is Grammar.Statement
        //var stat:Statement = this.constructor is Statement? this else .getParent(Statement)
        var stat = this.constructor === Statement ? this : this.getParent(Statement);
        //if no stat, .throwError "[#{.constructor.name}].hasAdjective('#{name}'): can't find a parent Statement"
        if (!stat) {this.throwError("[" + this.constructor.name + "].hasAdjective('" + name + "'): can't find a parent Statement")};
        //return name in stat.adjectives
        return stat.adjectives.indexOf(name)>=0;
      };
//## Body
//`Body: (Statement;)`
//Body is a semicolon-separated list of statements (At least one)
//`Body` is used for "Module" body, "class" body, "function" body, etc.
//Anywhere a list of semicolon separated statements apply.
//Body parser expects a [NEWLINE] and then a indented list of statements
    //public class Body extends ASTBase
    // constructor
    function Body(){ // default constructor
    // default constructor: call super.constructor
        ASTBase.prototype.constructor.apply(this,arguments)
      //properties
        //statements: Statement array
    };
    // Body (extends|proto is) ASTBase
    Body.prototype.__proto__ = ASTBase.prototype;
      //method parse()
      Body.prototype.parse = function(){
        //if .lexer.interfaceMode
        if (this.lexer.interfaceMode) {
            //if .parent isnt instance of ClassDeclaration
            if (!(this.parent instanceof ClassDeclaration)) {
                //return //"no 'Bodys' expected on interface.md file except for: class, append to and namespace
                return; //"no 'Bodys' expected on interface.md file except for: class, append to and namespace
            };
        };
        //if .lexer.token.type isnt 'NEWLINE'
        if (this.lexer.token.type !== 'NEWLINE') {
            //.lexer.sayErr "found #{.lexer.token} but expected NEWLINE and indented body"
            this.lexer.sayErr("found " + this.lexer.token + " but expected NEWLINE and indented body");
        };
//We use the generic ***ASTBase.reqSeparatedList*** to get a list of **Statement** symbols, 
//*semicolon* separated or in freeForm mode: one statement per line, closed when indent changes.
        //.statements = .reqSeparatedList(Statement,";")
        this.statements = this.reqSeparatedList(Statement, ";");
      };
      //method validate
      Body.prototype.validate = function(){
//this method check all the body statements againts a valid-list (arguments)      
      
        //var validArray = arguments.toArray()
        var validArray = Array.prototype.slice.call(arguments);
        //for each stm in .statements 
        for( var stm__inx=0,stm ; stm__inx<this.statements.length ; stm__inx++){stm=this.statements[stm__inx];
          if([EndStatement, CompilerStatement].indexOf(stm.specific.constructor)===-1){
            //where stm.specific.constructor not in [EndStatement,CompilerStatement] //always Valid
                //if stm.specific.constructor not in validArray
                if (validArray.indexOf(stm.specific.constructor)===-1) {
                    //stm.sayErr "a [#{stm.specific.constructor.name}] is not valid in the body of a [#{.parent.constructor.name}]"
                    stm.sayErr("a [" + stm.specific.constructor.name + "] is not valid in the body of a [" + this.parent.constructor.name + "]");
                };
        }};// end for each in this.statements
        
      };
    // export
    module.exports.Body = Body;
    
    // end class Body
//## Single Line Body
//This construction is used when only one statement is expected, and on the same line.
//It is used by `IfStatement: if conditon-Expression (','|then) *SingleLineBody*`
//It is also used for the increment statemenf in for-while loops:`for x=0, while x<10 [,SingleLineBody]`
//normally: ReturnStatement, ThrowStatement, PrintStatement, AssignmentStatement
    //public class SingleLineBody extends Body
    // constructor
    function SingleLineBody(){ // default constructor
    // default constructor: call super.constructor
        Body.prototype.constructor.apply(this,arguments)
    };
    // SingleLineBody (extends|proto is) Body
    SingleLineBody.prototype.__proto__ = Body.prototype;
      
      //method parse()
      SingleLineBody.prototype.parse = function(){
        //.statements = .reqSeparatedList(Statement,";",'NEWLINE')
        this.statements = this.reqSeparatedList(Statement, ";", 'NEWLINE');
        //.lexer.returnToken() #return closing NEWLINE
        this.lexer.returnToken();// #return closing NEWLINE
      };
    // export
    module.exports.SingleLineBody = SingleLineBody;
    
    // end class SingleLineBody
//## Module
//The `Module` represents a complete source file. 
    //public class Module extends Body
    // constructor
    function Module(){ // default constructor
    // default constructor: call super.constructor
        Body.prototype.constructor.apply(this,arguments)
      //properties
        //isMain: boolean
        //exportDefault: ASTBase
    };
    // Module (extends|proto is) Body
    Module.prototype.__proto__ = Body.prototype;
      //method parse()
      Module.prototype.parse = function(){
//We start by locking. There is no other construction to try,
//if Module.parse() fails we abort compilation.
          //.lock()
          this.lock();
//Get Module body: Statements, separated by NEWLINE|';' closer:'EOF'
          //.statements = .optFreeFormList(Statement,';','EOF')
          this.statements = this.optFreeFormList(Statement, ';', 'EOF');
      };
    // export
    module.exports.Module = Module;
    
    // end class Module
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
//Anything standing alone in it's own line, its an imperative statement (it does something, it produces effects).
    //var StatementsDirect = map
      //'class': ClassDeclaration
      //'Class': ClassDeclaration
      //'append': AppendToDeclaration
      //'Append': AppendToDeclaration
      //'function': FunctionDeclaration
      //'constructor': ConstructorDeclaration
      //'properties': PropertiesDeclaration
      //'namespace': NamespaceDeclaration
      //'method': MethodDeclaration
      //'var': VarStatement
      //'let': VarStatement
      //'default': DefaultAssignment
      //'if': IfStatement
      //'when': IfStatement
      //'case': CaseStatement
      //'for':ForStatement
      //'while':WhileUntilLoop
      //'until':WhileUntilLoop
      //'do':[DoNothingStatement,DoLoop]
      //'break':LoopControlStatement
      //'continue':LoopControlStatement
      //'end':EndStatement
      //'return':ReturnStatement
      //'with':WithStatement
      //'print':PrintStatement
      //'throw':ThrowStatement
      //'raise':ThrowStatement
      //'fail':ThrowStatement
      //'try':TryCatch
      //'exception':ExceptionBlock
      //'Exception':ExceptionBlock
      //'debugger':DebuggerStatement 
      //'declare':DeclareStatement
      //'import':ImportStatement
      //'delete':DeleteStatement
      //'compile':CompilerStatement
      //'compiler':CompilerStatement
      //'yield':YieldExpression
    var StatementsDirect = new Map().fromObject({
        'class': ClassDeclaration, 
        'Class': ClassDeclaration, 
        'append': AppendToDeclaration, 
        'Append': AppendToDeclaration, 
        'function': FunctionDeclaration, 
        'constructor': ConstructorDeclaration, 
        'properties': PropertiesDeclaration, 
        'namespace': NamespaceDeclaration, 
        'method': MethodDeclaration, 
        'var': VarStatement, 
        'let': VarStatement, 
        'default': DefaultAssignment, 
        'if': IfStatement, 
        'when': IfStatement, 
        'case': CaseStatement, 
        'for': ForStatement, 
        'while': WhileUntilLoop, 
        'until': WhileUntilLoop, 
        'do': [DoNothingStatement, DoLoop], 
        'break': LoopControlStatement, 
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
});
    
//##### Helpers
    //export helper function autoCapitalizeCoreClasses(name:string) returns String
    function autoCapitalizeCoreClasses(name){
      //#auto-capitalize core classes when used as type annotations
      //if name in ['string','array','number','object','function','boolean','map']
      if (['string', 'array', 'number', 'object', 'function', 'boolean', 'map'].indexOf(name)>=0) {
        //return "#{name.slice(0,1).toUpperCase()}#{name.slice(1)}"
        return '' + (name.slice(0, 1).toUpperCase()) + (name.slice(1));
      };
      //return name
      return name;
    }
    // export
    module.exports.autoCapitalizeCoreClasses = autoCapitalizeCoreClasses;
//### append to class ASTBase
    
      //properties
            //isMap: boolean
      
//##### helper method parseType
      ASTBase.prototype.parseType = function(){
//parse type declaration: 
  //function [(VariableDecl,)]
  //type-IDENTIFIER [array]
  //[array of] type-IDENTIFIER 
  //map type-IDENTIFIER to type-IDENTIFIER
        //if .opt('function','Function') #function as type declaration
        if (this.opt('function', 'Function')) {// #function as type declaration
            //if .opt('(')
            if (this.opt('(')) {
                //declare valid .paramsDeclarations
                
                //.paramsDeclarations = .optSeparatedList(VariableDecl,',',')')
                this.paramsDeclarations = this.optSeparatedList(VariableDecl, ',', ')');
            };
            //.type= new VariableRef(this, 'Function')
            this.type = new VariableRef(this, 'Function');
            //return
            return;
        };
//check for 'array', e.g.: `var list : array of String`
        //if .opt('array','Array')
        if (this.opt('array', 'Array')) {
            //.type = 'Array'
            this.type = 'Array';
            //if .opt('of')
            if (this.opt('of')) {
                //.itemType = .req(VariableRef) #reference to an existing class
                this.itemType = this.req(VariableRef);// #reference to an existing class
                ////auto-capitalize core classes
                //declare .itemType:VariableRef
                
                //.itemType.name = autoCapitalizeCoreClasses(.itemType.name)
                this.itemType.name = autoCapitalizeCoreClasses(this.itemType.name);
            };
            //end if
            
            //return
            return;
        };
//Check for 'map', e.g.: `var list : map string to Statement`
        //.type = .req(VariableRef) #reference to an existing class
        this.type = this.req(VariableRef);// #reference to an existing class
        ////auto-capitalize core classes
        //declare .type:VariableRef
        
        //.type.name = autoCapitalizeCoreClasses(.type.name)
        this.type.name = autoCapitalizeCoreClasses(this.type.name);
        
        //if .type.name is 'Map'
        if (this.type.name === 'Map') {
            //.isMap = true
            this.isMap = true;
            //.extraInfo = 'map [type] to [type]' //extra info to show on parse fail
            this.extraInfo = 'map [type] to [type]'; //extra info to show on parse fail
            //.keyType = .req(VariableRef) #type for KEYS: reference to an existing class
            this.keyType = this.req(VariableRef);// #type for KEYS: reference to an existing class
            ////auto-capitalize core classes
            //declare .keyType:VariableRef
            
            //.keyType.name = autoCapitalizeCoreClasses(.keyType.name)
            this.keyType.name = autoCapitalizeCoreClasses(this.keyType.name);
            //.req('to')
            this.req('to');
            //.itemType = .req(VariableRef) #type for values: reference to an existing class
            this.itemType = this.req(VariableRef);// #type for values: reference to an existing class
            //#auto-capitalize core classes
            //declare .itemType:VariableRef
            
            //.itemType.name = autoCapitalizeCoreClasses(.itemType.name)
            this.itemType.name = autoCapitalizeCoreClasses(this.itemType.name);
        }
        else {
        //else
            //#check for 'type array', e.g.: `var list : string array`
            //if .opt('Array','array')
            if (this.opt('Array', 'array')) {
                //.itemType = .type #assign read type as sub-type
                this.itemType = this.type;// #assign read type as sub-type
                //.type = 'Array' #real type
                this.type = 'Array';// #real type
            };
        };
      };
