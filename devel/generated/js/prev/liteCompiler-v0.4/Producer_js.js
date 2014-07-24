
//Producer JS
//===========

//The `producer` module extends Grammar classes, adding a `produce()` method
//to generate target code for the node.

//The comp1iler calls the `.produce()` method of the root 'Module' node
//in order to return the compiled code for the entire tree.

//We extend the Grammar classes, so this module require the `Grammar` module.

   var Grammar = require('./Grammar');

//JavaScript Producer Functions
//==============================

   //append to class Grammar.Module ###
   

    //method produce(firstLine, extraComments)
    Grammar.Module.prototype.produce = function(firstLine, extraComments){

       this.outCode.addSourceAsComment = extraComments;

//if a 'export default' was declared, set the referenced namespace
//as the new 'export default' (instead of 'module.exports')

//        declare valid .outCode.exportNamespace
       this.outCode.exportNamespace = 'module.exports';
       //if .exportDefault instance of Grammar.VarStatement
       if (this.exportDefault instanceof Grammar.VarStatement) {
//            declare valid .exportDefault.list.length
//            declare valid .exportDefault.throwError
           //if .exportDefault.list.length!==1, .exportDefault.throwError "only one var:Object alllowed for 'export default'"
           if (this.exportDefault.list.length !== 1) {
               this.exportDefault.throwError("only one var:Object alllowed for 'export default'")};
           this.outCode.exportNamespace = this.exportDefault.list[0].name;
       }
       else if (this.exportDefault instanceof Grammar.ASTBase) {
//            declare valid .exportDefault.name
           this.outCode.exportNamespace = this.exportDefault.name;
       };

       //end if

       //.outCode.start
       this.outCode.start();
       //.out firstLine
       this.out(firstLine);
       //for each statement in .statements
       for( var statement__inx=0,statement=undefined; statement__inx<this.statements.length; statement__inx++){statement=this.statements[statement__inx];
       
         //statement.produce()
         statement.produce();
       }; // end for each in this.statements
       //.out NL
       this.out(NL);

        //add end of file comments
       //.outPrevLinesComments .lexer.infoLines.length-1
       this.outPrevLinesComments(this.lexer.infoLines.length - 1);

//export 'export default' namespace, if it was set.

       //if .outCode.exportNamespace isnt 'module.exports'
       if (this.outCode.exportNamespace !== 'module.exports') {
           //.out 'module.exports=',.outCode.exportNamespace,";",NL
           this.out('module.exports=', this.outCode.exportNamespace, ";", NL);
       };
    };

   //append to class Grammar.Body ### and Module (derives from Body)
   

//A "Body" is an ordered list of statements.

//"Body"s lines have all the same indent, representing a scope.

//"Body"s are used for example, to parse an `if` statement body and `else` body, `for` loops, etc.

     //method produce()
     Grammar.Body.prototype.produce = function(){

       //.outCode.startNewLine()
       this.outCode.startNewLine();
       //for each statement in .statements
       for( var statement__inx=0,statement=undefined; statement__inx<this.statements.length; statement__inx++){statement=this.statements[statement__inx];
       
         //statement.produce()
         statement.produce();
       }; // end for each in this.statements

       //.out NL
       this.out(NL);
     };


//-------------------------------------
   //append to class Grammar.Statement ###
   

//`Statement` objects call their specific statement node's `produce()` method
//after adding any comment lines preceding the statement

     //method produce()
     Grammar.Statement.prototype.produce = function(){

//        declare valid .lexer.LineTypes.CODE
//        declare valid .lexer.infoLines
//        declare valid .statement.body
//        declare valid .statement.skipSemiColon

//add comment lines, in the same position as the source

       //.outPrevLinesComments()
       this.outPrevLinesComments();

//To ease reading of compiled code, add original Lite line as comment

       //if .outCode.addSourceAsComment
       if (this.outCode.addSourceAsComment) {
         //if .outCode.lastOriginalCodeComment<.lineInx
         if (this.outCode.lastOriginalCodeComment < this.lineInx) {
           //if not (.statement.constructor in [
           if (!(([Grammar.VarStatement, Grammar.CompilerStatement, Grammar.DeclareStatement, Grammar.AssignmentStatement, Grammar.ReturnStatement, Grammar.PropertiesDeclaration, Grammar.FunctionCall].indexOf(this.statement.constructor)>=0))) {
             //.out {COMMENT: .lexer.infoLines[.lineInx].text.trim()},NL
             this.out({COMMENT: this.lexer.infoLines[this.lineInx].text.trim()}, NL);
           };
         };
         this.outCode.lastOriginalCodeComment = this.lineInx;
       };

//if there are one or more 'into var x' in a expression in this statement,
//declare vars before statement (exclude body of FunctionDeclaration)

       //this.callOnSubTree "declareIntoVar", Grammar.Body
       this.callOnSubTree("declareIntoVar", Grammar.Body);

//call the specific statement (if,for,print,if,function,class,etc) .produce()

       //.out .statement
       this.out(this.statement);

//add ";" after the statement
//then EOL comment (if it isnt a multiline statement)
//then NEWLINE

       //if not .statement.skipSemiColon
       if (!(this.statement.skipSemiColon)) {
         //.out ";"
         this.out(";");
         //if not .statement.body
         if (!(this.statement.body)) {
           //.out .getEOLComment()
           this.out(this.getEOLComment());
         };
       };
     };

//called above, pre-declare vars from 'into var x' assignment-expression

   //append to class Grammar.Oper
   
     //method declareIntoVar()
     Grammar.Oper.prototype.declareIntoVar = function(){
         //if .intoVar
         if (this.intoVar) {
             //.out "var ",.right,"=undefined;",NL
             this.out("var ", this.right, "=undefined;", NL);
         };
     };


//---------------------------------
   //append to class Grammar.ThrowStatement ###
   

     //method produce()
     Grammar.ThrowStatement.prototype.produce = function(){
         //if .specifier is 'fail'
         if (this.specifier === 'fail') {
           //.out "throw new Error(", .expr,")"
           this.out("throw new Error(", this.expr, ")");
         }
         else {
           //.out "throw ", .expr
           this.out("throw ", this.expr);
         };
     };


   //append to class Grammar.ReturnStatement ###
   

     //method produce()
     Grammar.ReturnStatement.prototype.produce = function(){
       //.out "return"
       this.out("return");
       //if .expr
       if (this.expr) {
         //.out " ",.expr
         this.out(" ", this.expr);
       };
     };


   //append to class Grammar.FunctionCall ###
   

     //method produce()
     Grammar.FunctionCall.prototype.produce = function(){

       //.varRef.produce()
       this.varRef.produce();
       //if .varRef.executes, return #if varRef already executes, nothing more to do
       if (this.varRef.executes) {
           return};
       //.out "()" #add (), so JS executes de function call
       this.out("()");// #add (), so JS executes de function call
     };


   //append to class Grammar.Operand ###
   

//`Operand:
//  |NumberLiteral|StringLiteral|RegExpLiteral
//  |ParenExpression|ArrayLiteral|ObjectLiteral|FunctionDeclaration
//  |VariableRef

//A `Operand` is the left or right part of a binary oper
//or the only Operand of a unary oper.

     //method produce()
     Grammar.Operand.prototype.produce = function(){

       //.out .name, .accessors
       this.out(this.name, this.accessors);
     };

//      #end Operand


   //append to class Grammar.UnaryOper ###
   

//`UnaryOper: ('-'|new|type of|not|no|bitwise not) `

//A Unary Oper is an operator acting on a single operand.
//Unary Oper inherits from Oper, so both are `instance of Oper`

//Examples:
//1) `not`     *boolean negation*     `if not a is b`
//2) `-`       *numeric unary minus*  `-(4+3)`
//3) `new`     *instantiation*        `x = new classNumber[2]`
//4) `type of` *type name access*     `type of x is classNumber[2]`
//5) `no`      *'falsey' check*       `if no options then options={}`
//6) `~`       *bit-unary-negation*   `a = ~xC0 + 5`

     //method produce()
     Grammar.UnaryOper.prototype.produce = function(){

       var translated = operTranslate(this.name);
       var prepend = undefined, append = undefined;

//if it is "boolean not", add parentheses, because js has a different precedence for "boolean not"
//-(prettier generated code) do not add () for simple "falsey" variable check

       //if translated is "!"
       if (translated === "!") {
           //if not (.name is "no" and .right.name instanceof Grammar.VariableRef)
           if (!((this.name === "no" && this.right.name instanceof Grammar.VariableRef))) {
               prepend = "(";
               append = ")";
           };
       }
       else if (/\w/.test(translated)) {
           translated += " ";
       };

       //.out translated, prepend, .right, append
       this.out(translated, prepend, this.right, append);
     };


   //append to class Grammar.Oper ###
   

     //method produce()
     Grammar.Oper.prototype.produce = function(){

       var oper = this.name;

//default mechanism to handle 'negated' operand

       var prepend = undefined, append = undefined;
       //if .negated # NEGATED
       if (this.negated) {// # NEGATED

//if NEGATED and the oper is `is` we convert it to 'isnt'.
//'isnt' will be translated to !==

           //if oper is 'is' # Negated is ---> !==
           if (oper === 'is') {// # Negated is ---> !==
             oper = '!==';
           }
           else {
             prepend = "!(";
             append = ")";
           };
       };

//Check for special cases:

//1) 'in' operator, requires swapping left and right operands and to use `.indexOf(...)>=0`
//example: `x in [1,2,3]` -> `[1,2,3].indexOf(x)>=0`
//example: `x not in [1,2,3]` -> `[1,2,3].indexOf(x)==-1`
//example: `char not in myString` -> `myString.indexOf(char)==-1`
//example (`arguments` pseudo-array): `'lite' not in arguments` -> `Array.prototype.slice.call(arguments).indexOf(char)==-1`

       //if .name is 'in'
       if (this.name === 'in') {
           //.out .right,".indexOf(",.left,")", .negated? "===-1" : ">=0"
           this.out(this.right, ".indexOf(", this.left, ")", this.negated ? "===-1" : ">=0");

//fix when used on JS built-in array-like `arguments`

           this.outCode.currLine = this.outCode.currLine.replace(/\barguments.indexOf\(/, 'Array.prototype.slice.call(arguments).indexOf(');
       }
       else if (this.name === 'has property') {
           //.out prepend, .right," in ",.left, append
           this.out(prepend, this.right, " in ", this.left, append);
       }
       else if (this.name === 'into') {
           //.out "(",.right,"=",.left,")"
           this.out("(", this.right, "=", this.left, ")");
       }
       else if (this.name === 'like') {
           //.out .right,".test(",.left,")"
           this.out(this.right, ".test(", this.left, ")");
       }
       else {
           //.out prepend, .left, ' ', operTranslate(oper), ' ', .right , append
           this.out(prepend, this.left, ' ', operTranslate(oper), ' ', this.right, append);
       };
     };


   //append to class Grammar.Expression ###
   

     //method produce(options)
     Grammar.Expression.prototype.produce = function(options){

//        declare on options
//          negated

//Produce the expression body, negated if options={negated:true}

       //default options=
       if(!options) options={};
       // options.negated: undefined

       var prepend = "";
       var append = "";
       //if options.negated
       if (options.negated) {

//(prettier generated code) Try to avoid unnecessary parens after '!'
//for example: if the expression is a single variable, as in the 'falsey' check:
//Example: `if no options.log then... ` --> `if (!options.log) {...`
//we don't want: `if (!(options.log)) {...`

         //if .operandCount is 1
         if (this.operandCount === 1) {
//              #no parens needed
             prepend = "!";
         }
         else {
             prepend = "!(";
             append = ")";
         };
       };
//          #end if
//        #end if negated

//produce the expression body

       //.out prepend, .root, append
       this.out(prepend, this.root, append);
     };


   //append to class Grammar.VariableRef ###
   

//`VariableRef: ['--'|'++'] IDENTIFIER [Accessors] ['--'|'++']`

//`VariableRef` is a Variable Reference.

// a VariableRef can include chained 'Accessors', which can:
// *access a property of the object : `.`-> PropertyAccess `[`->IndexAccess
// *assume the variable is a function and perform a function call :  `(`-> FunctionAccess

     //method produce()
     Grammar.VariableRef.prototype.produce = function(){

//Prefix ++/--, varName, Accessors and postfix ++/--

       //.out .preIncDec, .name.translate(IDENTIFIER_ALIASES), .accessors, .postIncDec
       this.out(this.preIncDec, this.name.translate(IDENTIFIER_ALIASES), this.accessors, this.postIncDec);
     };


   //append to class Grammar.AssignmentStatement ###
   

     //method produce()
     Grammar.AssignmentStatement.prototype.produce = function(){

       //.out .lvalue, ' ', operTranslate(.name), ' ', .rvalue
       this.out(this.lvalue, ' ', operTranslate(this.name), ' ', this.rvalue);
     };


//-------
   //append to class Grammar.DefaultAssignment ###
   

     //method produce()
     Grammar.DefaultAssignment.prototype.produce = function(){

       //.process(.assignment.lvalue, .assignment.rvalue)
       this.process(this.assignment.lvalue, this.assignment.rvalue);

       this.skipSemiColon = true;
     };

//#### helper Functions

//      #recursive duet 1
     //helper method process(name,value)
     Grammar.DefaultAssignment.prototype.process = function(name, value){

//if it is ObjectLiteral: recurse levels, else, a simple 'if undefined, assignment'

//check if it's a ObjectLiteral (level indent)

         //if value instanceof Grammar.ObjectLiteral
         if (value instanceof Grammar.ObjectLiteral) {
           //.processItems name, value # recurse Grammar.ObjectLiteral
           this.processItems(name, value);// # recurse Grammar.ObjectLiteral
         }
         else {
           //.assignIfUndefined name, value # Expression
           this.assignIfUndefined(name, value);// # Expression
         };
     };


//      #recursive duet 2
     //helper method processItems(main, objectLiteral)
     Grammar.DefaultAssignment.prototype.processItems = function(main, objectLiteral){

         //.out "if(!",main,') ',main,"={};",NL
         this.out("if(!", main, ') ', main, "={};", NL);

         //for each nameValue in objectLiteral.items
         for( var nameValue__inx=0,nameValue=undefined; nameValue__inx<objectLiteral.items.length; nameValue__inx++){nameValue=objectLiteral.items[nameValue__inx];
         
           var itemFullName = [main, '.', nameValue.name];
           //.process(itemFullName, nameValue.value)
           this.process(itemFullName, nameValue.value);
         }; // end for each in objectLiteral.items
         
     };


//    #end helper recursive functions


//-----------
//## Accessors
//We just defer to JavaScript's built in `.` `[ ]` and `( )` accessors

   //append to class Grammar.PropertyAccess ##
   
     //method produce()
     Grammar.PropertyAccess.prototype.produce = function(){
       //.out ".",.name
       this.out(".", this.name);
     };

   //append to class Grammar.IndexAccess
   
     //method produce()
     Grammar.IndexAccess.prototype.produce = function(){
       //.out "[",.name,"]"
       this.out("[", this.name, "]");
     };

   //append to class Grammar.FunctionAccess
   
     //method produce()
     Grammar.FunctionAccess.prototype.produce = function(){
       //.out "(",{CSL:.args},")"
       this.out("(", {CSL: this.args}, ")");
     };

//-----------

   //append to class Grammar.ASTBase
   
    //helper method lastLineInxOf(list:Grammar.ASTBase array)
    Grammar.ASTBase.prototype.lastLineInxOf = function(list){

//More Helper methods, get max line of list

       var lastLine = this.lineInx;
       //for each item in list
       for( var item__inx=0,item=undefined; item__inx<list.length; item__inx++){item=list[item__inx];
       
           //if item.lineInx>lastLine
           if (item.lineInx > lastLine) {
             lastLine = item.lineInx;
           };
       }; // end for each in list

       //return lastLine
       return lastLine;
    };


    //method getOwnerPrefix() returns array
    Grammar.ASTBase.prototype.getOwnerPrefix = function(){

//check if we're inside a ClassDeclaration or AppendToDeclaration.
//return prefix for item to be appended

       var parent = this.getParent(Grammar.ClassDeclaration);

       //if no parent, return
       if (!parent) {
           return};

       var ownerName = undefined, toPrototype = undefined;
       //if parent instance of Grammar.AppendToDeclaration
       if (parent instanceof Grammar.AppendToDeclaration) {
//          #append to class prototype or object
//          declare parent:Grammar.AppendToDeclaration
         toPrototype = !(parent.toNamespace);
         ownerName = parent.varRef;
       }
       else {
//          declare valid .toNamespace
         toPrototype = !(this.toNamespace);// #if it's a "namespace properties" or "namespace method"
         ownerName = parent.name;
       };

       //return [ownerName, toPrototype? ".prototype." else "." ]
       return [ownerName, toPrototype ? ".prototype." : "."];
    };


//---
   //append to class Grammar.PropertiesDeclaration ###
   

//'var' followed by a list of comma separated: var names and optional assignment

     //method produce()
     Grammar.PropertiesDeclaration.prototype.produce = function(){

       //.outLinesAsComment .lineInx, .lastLineInxOf(.list)
       this.outLinesAsComment(this.lineInx, this.lastLineInxOf(this.list));

       var prefix = this.getOwnerPrefix();

       //for each varDecl in .list
       for( var varDecl__inx=0,varDecl=undefined; varDecl__inx<this.list.length; varDecl__inx++){varDecl=this.list[varDecl__inx];
       
         //if varDecl.assignedValue
         if (varDecl.assignedValue) {
           //.out prefix, varDecl.name,"=",varDecl.assignedValue,";",NL
           this.out(prefix, varDecl.name, "=", varDecl.assignedValue, ";", NL);
         };
       }; // end for each in this.list

       this.skipSemiColon = true;
     };

   //append to class Grammar.VarStatement ###
   

//'var' followed by a list of comma separated: var names and optional assignment

     //method produce()
     Grammar.VarStatement.prototype.produce = function(){

//        declare valid .keyword
//        declare valid .compilerVar
//        declare valid .export

       //if .keyword is 'let' and .compilerVar('ES6')
       if (this.keyword === 'let' && this.compilerVar('ES6')) {
         //.out 'let '
         this.out('let ');
       }
       else {
         //.out 'var '
         this.out('var ');
       };

//Now, after 'var' or 'let' out one or more comma separated VariableDecl

       //.out {CSL:.list, freeForm:.list.length>2}
       this.out({CSL: this.list, freeForm: this.list.length > 2});

//If 'var' was adjectivated 'export', add to exportNamespace

       //if .export and not .default
       if (this.export && !(this.default)) {
         //.out ";", NL,{COMMENT:'export'},NL
         this.out(";", NL, {COMMENT: 'export'}, NL);
         //for each varDecl in .list
         for( var varDecl__inx=0,varDecl=undefined; varDecl__inx<this.list.length; varDecl__inx++){varDecl=this.list[varDecl__inx];
         
           //.out .outCode.exportNamespace,'.',varDecl.name,' = ', varDecl.name, ";", NL
           this.out(this.outCode.exportNamespace, '.', varDecl.name, ' = ', varDecl.name, ";", NL);
         }; // end for each in this.list
         this.skipSemiColon = true;
       };
     };



   //append to class Grammar.ImportStatement ###
   

//'import' followed by a list of comma separated: var names and optional assignment

     //method produce()
     Grammar.ImportStatement.prototype.produce = function(){

       //for each varDecl in .list
       for( var varDecl__inx=0,varDecl=undefined; varDecl__inx<this.list.length; varDecl__inx++){varDecl=this.list[varDecl__inx];
       
         //.out "var ",varDecl.name," = require("
         this.out("var ", varDecl.name, " = require(");
         //if varDecl.assignedValue
         if (varDecl.assignedValue) {
             //if no .global, .out '"./"+'
             if (!this.global) {
                 this.out('"./"+')};
             //.out varDecl.assignedValue
             this.out(varDecl.assignedValue);
         }
         else {
             //.out "'", .global? "" : "./", varDecl.name, "'"
             this.out("'", this.global ? "" : "./", varDecl.name, "'");
         };
         //.out ");",NL
         this.out(");", NL);
       }; // end for each in this.list

       this.skipSemiColon = true;
     };


   //append to class Grammar.VariableDecl ###
   

//variable name and optionally assign a value

     //method produce()
     Grammar.VariableDecl.prototype.produce = function(){

//It's a `var` keyword or we're declaring function parameters.
//In any case starts with the variable name

         //.out .name
         this.out(this.name);

//          declare valid .keyword

//If this VariableDecl come from a 'var' statement, we force assignment (to avoid subtle bugs,
//in LiteScript, 'var' declaration assigns 'undefined')

         //if .parent instanceof Grammar.VarStatement
         if (this.parent instanceof Grammar.VarStatement) {
             //.out ' = ',.assignedValue or 'undefined'
             this.out(' = ', this.assignedValue || 'undefined');
         }
         else {
           //if .assignedValue and .compilerVar('ES6')
           if (this.assignedValue && this.compilerVar('ES6')) {
               //.out ' = ',.assignedValue
               this.out(' = ', this.assignedValue);
           };
         };
     };

//    #end VariableDecl


   //append to class Grammar.SingleLineStatement ###
   

     //method produce()
     Grammar.SingleLineStatement.prototype.produce = function(){

       var bare = [];
       //for each statement in .statements
       for( var statement__inx=0,statement=undefined; statement__inx<this.statements.length; statement__inx++){statement=this.statements[statement__inx];
       
           //bare.push statement.statement
           bare.push(statement.statement);
       }; // end for each in this.statements
       //.out NL,"    ",{CSL:bare, separator:";"}
       this.out(NL, "    ", {CSL: bare, separator: ";"});
     };


   //append to class Grammar.IfStatement ###
   

     //method produce()
     Grammar.IfStatement.prototype.produce = function(){

//        declare valid .elseStatement.produce

       //if .body instanceof Grammar.SingleLineStatement
       if (this.body instanceof Grammar.SingleLineStatement) {
           //.out "if (", .conditional,") {",.body, "}"
           this.out("if (", this.conditional, ") {", this.body, "}");
       }
       else {
           //.out "if (", .conditional, ") {", .getEOLComment()
           this.out("if (", this.conditional, ") {", this.getEOLComment());
           //.out  .body, "}"
           this.out(this.body, "}");
       };

       //if .elseStatement
       if (this.elseStatement) {
           //.outPrevLinesComments .elseStatement.lineInx-1
           this.outPrevLinesComments(this.elseStatement.lineInx - 1);
           //.elseStatement.produce()
           this.elseStatement.produce();
       };
     };


   //append to class Grammar.ElseIfStatement ###
   

     //method produce()
     Grammar.ElseIfStatement.prototype.produce = function(){

       //.out NL,"else ", .nextIf
       this.out(NL, "else ", this.nextIf);
     };

   //append to class Grammar.ElseStatement ###
   

     //method produce()
     Grammar.ElseStatement.prototype.produce = function(){

       //.out NL,"else {", .body, "}"
       this.out(NL, "else {", this.body, "}");
     };

   //append to class Grammar.ForStatement ###
   

//There are 3 variants of `ForStatement` in LiteScript

     //method produce()
     Grammar.ForStatement.prototype.produce = function(){

//        declare valid .variant.iterable
//        declare valid .variant.produce

//Pre-For code. If required, store the iterable in a temp var.
//(prettier generated code) Only if the iterable is a complex expression,
//(if it can have side-effects) we store it in a temp
//var in order to avoid calling it twice. Else, we use it as is.

       var iterable = this.variant.iterable;

//        declare valid iterable.root.name.hasSideEffects

       //if iterable
       if (iterable) {
         //if iterable.operandCount>1 or iterable.root.name.hasSideEffects or iterable.root.name instanceof Grammar.Literal
         if (iterable.operandCount > 1 || iterable.root.name.hasSideEffects || iterable.root.name instanceof Grammar.Literal) {
           iterable = this.outCode.getUniqueVarName('list');// #unique temp iterable var name
           //.out "var ",iterable,"=",.variant.iterable,";",NL
           this.out("var ", iterable, "=", this.variant.iterable, ";", NL);
         };
       };

       //.variant.produce(iterable)
       this.variant.produce(iterable);

//Since al 3 cases are closed with '}; //comment', we skip statement semicolon

       this.skipSemiColon = true;
     };


   //append to class Grammar.ForEachProperty
   
//### Variant 1) 'for each property' to loop over *object property names*

//`ForEachProperty: for each [own] property name-VariableDecl in object-VariableRef`

     //method produce(iterable)
     Grammar.ForEachProperty.prototype.produce = function(iterable){

         //if .mainVar
         if (this.mainVar) {
           //.out "var ", .mainVar.name,"=undefined;",NL
           this.out("var ", this.mainVar.name, "=undefined;", NL);
         };

         //.out "for ( var ", .indexVar.name, " in ", iterable, ")"
         this.out("for ( var ", this.indexVar.name, " in ", iterable, ")");

         //if .ownOnly
         if (this.ownOnly) {
             //.out "if (",iterable,".hasOwnProperty(",.indexVar,"))"
             this.out("if (", iterable, ".hasOwnProperty(", this.indexVar, "))");
         };

         //if .mainVar
         if (this.mainVar) {
             //.body.out "{", .mainVar.name,"=",iterable,"[",.indexVar,"];",NL
             this.body.out("{", this.mainVar.name, "=", iterable, "[", this.indexVar, "];", NL);
         };

         //.out .where
         this.out(this.where);

         //.body.out "{", .body, "}",NL
         this.body.out("{", this.body, "}", NL);

         //if .mainVar
         if (this.mainVar) {
           //.body.out NL, "}"
           this.body.out(NL, "}");
         };

         //.out {COMMENT:"end for each property"},NL
         this.out({COMMENT: "end for each property"}, NL);
     };


   //append to class Grammar.ForEachInArray
   
//### Variant 2) 'for each index' to loop over *Array indexes and items*

//`ForEachInArray: for each [index-VariableDecl,]item-VariableDecl in array-VariableRef`

     //method produce(iterable)
     Grammar.ForEachInArray.prototype.produce = function(iterable){

//Create a default index var name if none was provided

       var indexVar = this.indexVar;
       //if no indexVar
       if (!indexVar) {
         indexVar = {name: this.mainVar.name + '__inx', assignedValue: 0};// #default index var name
       };

       //.out "for( var "
       this.out("for( var ", indexVar.name, "=", indexVar.assignedValue || "0", ",", this.mainVar.name, " ; ", indexVar.name, "<", iterable, ".length", " ; ", indexVar.name, "++){");

       //.body.out .mainVar.name,"=",iterable,"[",indexVar.name,"];",NL
       this.body.out(this.mainVar.name, "=", iterable, "[", indexVar.name, "];", NL);

       //if .where
       if (this.where) {
         //.out .where,"{",.body,"}"
         this.out(this.where, "{", this.body, "}");
       }
       else {
         //.out .body
         this.out(this.body);
       };

       //.out "}; // end for each in ", .iterable,NL
       this.out("}; // end for each in ", this.iterable, NL);
     };

   //append to class Grammar.ForIndexNumeric
   
//### Variant 3) 'for index=...' to create *numeric loops*

//`ForIndexNumeric: for index-VariableDecl "=" start-Expression [,|;] (while|until) condition-Expression [(,|;) increment-Statement]`

//Examples: `for n=0 while n<10`, `for n=0 to 9`
//Handle by using a js/C standard for(;;){} loop

     //method produce(iterable)
     Grammar.ForIndexNumeric.prototype.produce = function(iterable){

//        declare valid .endExpression.produce

       //.out "for( var ",.indexVar.name, "=", .indexVar.assignedValue or "0", "; "
       this.out("for( var ", this.indexVar.name, "=", this.indexVar.assignedValue || "0", "; ");

       //if .conditionPrefix is 'to'
       if (this.conditionPrefix === 'to') {
//            #'for n=0 to 10' -> for(n=0;n<=10;...
           //.out .indexVar.name,"<=",.endExpression
           this.out(this.indexVar.name, "<=", this.endExpression);
       }
       else {

//produce the condition, negated if the prefix is 'until'

//          #for n=0, while n<arr.length  -> for(n=0;n<arr.length;...
//          #for n=0, until n >= arr.length  -> for(n=0;!(n>=arr.length);...
         //.endExpression.produce( {negated: .conditionPrefix is 'until' })
         this.endExpression.produce({negated: this.conditionPrefix === 'until'});
       };

       //.out "; "
       this.out("; ");

//if no increment specified, the default is indexVar++

       //.out .increment or [.indexVar.name,"++"]
       this.out(this.increment || [this.indexVar.name, "++"]);

       //.out ") ", .where
       this.out(") ", this.where);

       //.out "{", .body, "}; // end for ", .indexVar, NL
       this.out("{", this.body, "}; // end for ", this.indexVar, NL);
     };




   //append to class Grammar.ForWhereFilter
   
//### Helper for where filter
//`ForWhereFilter: [where Expression]`

     //method produce()
     Grammar.ForWhereFilter.prototype.produce = function(){
       //.out 'if(',.filter,')'
       this.out('if(', this.filter, ')');
     };

   //append to class Grammar.DeleteStatement
   
//`DeleteStatement: delete VariableRef`

     //method produce()
     Grammar.DeleteStatement.prototype.produce = function(){
       //.out 'delete ',.varRef
       this.out('delete ', this.varRef);
     };

   //append to class Grammar.WhileUntilExpression ###
   

     //method produce(options)
     Grammar.WhileUntilExpression.prototype.produce = function(options){

//If the parent ask for a 'while' condition, but this is a 'until' condition,
//or the parent ask for a 'until' condition and this is 'while', we must *negate* the condition.

//        declare valid .expr.produce

       //default options =
       if(!options) options={};
       // options.askFor: undefined
       // options.negated: undefined

       //if options.askFor and .name isnt options.askFor
       if (options.askFor && this.name !== options.askFor) {
           options.negated = true;
       };

//*options.askFor* is used when the source code was, for example,
//`do until Expression` and we need to code: `while(!(Expression))`
//or the code was `loop while Expression` and we need to code: `if (!(Expression)) break`

//when you have a `until` condition, you need to negate the expression
//to produce a `while` condition. (`while NOT x` is equivalent to `until x`)

       //.expr.produce(options)
       this.expr.produce(options);
     };


   //append to class Grammar.DoLoop ###
   

     //method produce()
     Grammar.DoLoop.prototype.produce = function(){

//Note: **WhileUntilLoop** symbol has **DoLoop** as *prototype*, so this *.produce()* method
//is used by both symbols.

       //if .postWhileUntilExpression
       if (this.postWhileUntilExpression) {

//if we have a post-condition, for example: `do ... loop while x>0`,

           //.out "do{", .getEOLComment()
           this.out("do{", this.getEOLComment());
           //.out .body
           this.out(this.body);
           //.out "} while ("
           this.out("} while (");
           //.postWhileUntilExpression.produce({askFor:'while'})
           this.postWhileUntilExpression.produce({askFor: 'while'});
           //.out ")"
           this.out(")");
       }
       else {

           //.out 'while('
           this.out('while(');
           //if .preWhileUntilExpression
           if (this.preWhileUntilExpression) {
             //.preWhileUntilExpression.produce({askFor:'while'})
             this.preWhileUntilExpression.produce({askFor: 'while'});
           }
           else {
             //.out 'true'
             this.out('true');
           };
           //.out '){', .body , "}"
           this.out('){', this.body, "}");
       };

       //end if

       //.out ";",{COMMENT:"end loop"},NL
       this.out(";", {COMMENT: "end loop"}, NL);
       this.skipSemiColon = true;
     };

   //append to class Grammar.LoopControlStatement ###
   
//This is a very simple produce() to allow us to use the `break` and `continue` keywords.

     //method produce()
     Grammar.LoopControlStatement.prototype.produce = function(){
       //.out .control
       this.out(this.control);
     };

   //append to class Grammar.DoNothingStatement ###
   

     //method produce()
     Grammar.DoNothingStatement.prototype.produce = function(){
       //.out "null"
       this.out("null");
     };

   //append to class Grammar.ParenExpression ###
   

//A `ParenExpression` is just a normal expression surrounded by parentheses.

     //method produce()
     Grammar.ParenExpression.prototype.produce = function(){
       //.out "(",.expr,")"
       this.out("(", this.expr, ")");
     };

   //append to class Grammar.ArrayLiteral ###
   

//A `ArrayLiteral` is a definition of a list like `[1, a, 2+3]`. We just pass this through to JavaScript.

     //method produce()
     Grammar.ArrayLiteral.prototype.produce = function(){
       //.out "[",{CSL:.items},"]"
       this.out("[", {CSL: this.items}, "]");
     };

   //append to class Grammar.NameValuePair ###
   

//A `NameValuePair` is a single item in an object definition. Since we copy js for this, we pass this straight through

     //method produce()
     Grammar.NameValuePair.prototype.produce = function(){
       //.out .name,": ",.value
       this.out(this.name, ": ", this.value);
     };

   //append to class Grammar.ObjectLiteral ###
   

//A `ObjectLiteral` is an object definition using key/value pairs like `{a:1,b:2}`.
//JavaScript supports this syntax, so we just pass it through.

     //method produce()
     Grammar.ObjectLiteral.prototype.produce = function(){
       //.out "{",{CSL:.items},"}"
       this.out("{", {CSL: this.items}, "}");
     };

   //append to class Grammar.FreeObjectLiteral ###
   

//A `FreeObjectLiteral` is an object definition using key/value pairs, but in free-form
//(one NameValuePair per line, indented, comma is optional)

     //method produce()
     Grammar.FreeObjectLiteral.prototype.produce = function(){
       //.out "{",{CSL:.items, freeForm:true},"}"
       this.out("{", {CSL: this.items, freeForm: true}, "}");
     };


   //append to class Grammar.FunctionDeclaration ###
   

//`FunctionDeclaration: '[export][generator] (function|method|constructor) [name] '(' FunctionParameterDecl* ')' Block`

//`FunctionDeclaration`s are function definitions.

//`export` prefix causes the function to be included in `module.exports`
//`generator` prefix marks a 'generator' function that can be paused by `yield` (js/ES6 function*)

    //method produce()
    Grammar.FunctionDeclaration.prototype.produce = function(){

//Generators are implemented in ES6 with the "function*" keyword (note the asterisk)

     var generatorMark = this.generator && this.compilerVar('ES6') ? "*" : "";

//check if this is a 'constructor', 'method' or 'function'

     //if this instance of Grammar.ConstructorDeclaration
     if (this instanceof Grammar.ConstructorDeclaration) {
//          # class constructor: JS's function-class-object-constructor
         //.out "function ",.getParent(Grammar.ClassDeclaration).name
         this.out("function ", this.getParent(Grammar.ClassDeclaration).name);
     }
     else if (this instanceof Grammar.MethodDeclaration) {

//          #get owner where this method belongs to
         //if no .getOwnerPrefix() into var prefix
         var prefix=undefined;
         if (!((prefix=this.getOwnerPrefix()))) {
             //fail with "method #.name. Can not determine owner object"
             throw new Error("method " + this.name + ". Can not determine owner object");
         };

//          #if shim, check before define
         //if .shim, .out "if (!",prefix,.name,")",NL
         if (this.shim) {
             this.out("if (!", prefix, this.name, ")", NL)};

         //.out prefix,.name," = function",generatorMark
         this.out(prefix, this.name, " = function", generatorMark);
     }
     else {
         //.out "function ",.name, generatorMark
         this.out("function ", this.name, generatorMark);
     };

//now produce function parameters declaration

     //.out "(", {CSL:.paramsDeclarations}, "){", .getEOLComment()
     this.out("(", {CSL: this.paramsDeclarations}, "){", this.getEOLComment());

//if the function has a exception block, insert 'try{'

     //for each statement in .body.statements
     for( var statement__inx=0,statement=undefined; statement__inx<this.body.statements.length; statement__inx++){statement=this.body.statements[statement__inx];
     
       //if statement.statement instance of Grammar.ExceptionBlock
       if (statement.statement instanceof Grammar.ExceptionBlock) {
           //.out " try{",NL
           this.out(" try{", NL);
           //break
           break;
       };
     }; // end for each in this.body.statements

//if params defaults where included, we assign default values to arguments
//(if ES6 enabled, they were included abobve in ParamsDeclarations production )

     //if .paramsDeclarations and not .compilerVar('ES6')
     if (this.paramsDeclarations && !(this.compilerVar('ES6'))) {
         //for each paramDecl in .paramsDeclarations
         for( var paramDecl__inx=0,paramDecl=undefined; paramDecl__inx<this.paramsDeclarations.length; paramDecl__inx++){paramDecl=this.paramsDeclarations[paramDecl__inx];
         
           //if paramDecl.assignedValue
           if (paramDecl.assignedValue) {
               //.body.assignIfUndefined paramDecl.name, paramDecl.assignedValue
               this.body.assignIfUndefined(paramDecl.name, paramDecl.assignedValue);
           };
         }; // end for each in this.paramsDeclarations
         
     };
//          #end for
//      #end if

//now produce function body

     //.body.produce()
     this.body.produce();

//close the function

     //.out "}"
     this.out("}");

//If the function was adjectivated 'export', add to module.exports

     //if .export and not .default
     if (this.export && !(this.default)) {
       //.out ";",NL,{COMMENT:'export'},NL
       this.out(";", NL, {COMMENT: 'export'}, NL);
       //.out .outCode.exportNamespace,'.',.name,'=',.name,";"
       this.out(this.outCode.exportNamespace, '.', this.name, '=', this.name, ";");
       this.skipSemiColon = true;
     };
    };

//--------------------
   //append to class Grammar.PrintStatement ###
   
//`print` is an alias for console.log

     //method produce()
     Grammar.PrintStatement.prototype.produce = function(){
       //.out "console.log(",{"CSL":.args},")"
       this.out("console.log(", {"CSL": this.args}, ")");
     };


//--------------------
   //append to class Grammar.EndStatement ###
   

//Marks the end of a block. It's just a comment for javascript

     //method produce()
     Grammar.EndStatement.prototype.produce = function(){

//        declare valid .outCode.lastOriginalCodeComment
//        declare valid .lexer.infoLines

       //if .outCode.lastOriginalCodeComment<.lineInx
       if (this.outCode.lastOriginalCodeComment < this.lineInx) {
         //.out {COMMENT: .lexer.infoLines[.lineInx].text}
         this.out({COMMENT: this.lexer.infoLines[this.lineInx].text});
       };

       this.skipSemiColon = true;
     };

//--------------------
   //append to class Grammar.CompilerStatement ###
   

     //method produce()
     Grammar.CompilerStatement.prototype.produce = function(){

//first, out as comment this line

       //.outLineAsComment .lineInx
       this.outLineAsComment(this.lineInx);

//if it's a conditional compile, output body is option is Set

       //if .conditional
       if (this.conditional) {
           //if .compilerVar(.conditional)
           if (this.compilerVar(this.conditional)) {
//                declare valid .body.produce
               //.body.produce()
               this.body.produce();
           };
       };

       this.skipSemiColon = true;
     };


//--------------------
   //append to class Grammar.DeclareStatement ###
   

//Out as comments

     //method produce()
     Grammar.DeclareStatement.prototype.produce = function(){

       //.outLinesAsComment .lineInx, .lastLineInxOf(.names)
       this.outLinesAsComment(this.lineInx, this.lastLineInxOf(this.names));
       this.skipSemiColon = true;
     };


//----------------------------
   //append to class Grammar.ClassDeclaration ###
   

//Classes contain a code block with properties and methods definitions.

     //method produce()
     Grammar.ClassDeclaration.prototype.produce = function(){

       //.out {COMMENT:"constructor"},NL
       this.out({COMMENT: "constructor"}, NL);

//First, since in JS we have a object-class-function-constructor  all-in-one
//we need to get the class constructor, and separate other class items.

//        declare theConstructor:Grammar.FunctionDeclaration
//        declare valid .produce_AssignObjectProperties
//        declare valid .export

       var theConstructor = null;
       var methodsAndProperties = [];

       //if .body
       if (this.body) {
         //for each index,item in .body.statements
         for( var index=0,item=undefined; index<this.body.statements.length; index++){item=this.body.statements[index];
         

           //if item.statement instanceof Grammar.ConstructorDeclaration
           if (item.statement instanceof Grammar.ConstructorDeclaration) {

             //if theConstructor # what? more than one?
             if (theConstructor) {// # what? more than one?
               //.throwError('Two constructors declared for class #{.name}')
               this.throwError('Two constructors declared for class ' + (this.name));
             };

             theConstructor = item.statement;
           }
           else {
             //methodsAndProperties.push item
             methodsAndProperties.push(item);
           };
         }; // end for each in this.body.statements
         
       };

//        #end if body

       //if theConstructor
       if (theConstructor) {
         //.out theConstructor,";",NL
         this.out(theConstructor, ";", NL);
       }
       else {
//          #out a default "constructor"
         //.out "function ",.name,"(){"
         this.out("function ", this.name, "(){");
         //if .varRefSuper
         if (this.varRefSuper) {
             //.out NL,"    // default constructor: call super.constructor"
             this.out(NL, "    // default constructor: call super.constructor");
             //.out NL,"    return ",.varRefSuper,".prototype.constructor.apply(this,arguments)",NL
             this.out(NL, "    return ", this.varRefSuper, ".prototype.constructor.apply(this,arguments)", NL);
         };
         //.out "};",NL
         this.out("};", NL);
       };
//        #end if

//Set parent class if we have one indicated

       //if .varRefSuper
       if (this.varRefSuper) {
         //.out '// ',.name,' (extends|super is) ',.varRefSuper, NL
         this.out('// ', this.name, ' (extends|super is) ', this.varRefSuper, NL);
         //.out .name,'.prototype.__proto__ = ', .varRefSuper,'.prototype;',NL
         this.out(this.name, '.prototype.__proto__ = ', this.varRefSuper, '.prototype;', NL);
       };

//now out class body, which means create properties in the object-function-class prototype

       //.out methodsAndProperties
       this.out(methodsAndProperties);

//If the class was adjectivated 'export', add to module.exports

       //if .export and not .default
       if (this.export && !(this.default)) {
         //.out NL,{COMMENT:'export'},NL
         this.out(NL, {COMMENT: 'export'}, NL);
         //.out .outCode.exportNamespace,'.',.name,' = ', .name,";"
         this.out(this.outCode.exportNamespace, '.', this.name, ' = ', this.name, ";");
       };

       //.out NL,{COMMENT:"end class "},.name,NL
       this.out(NL, {COMMENT: "end class "}, this.name, NL);
       this.skipSemiColon = true;
     };


   //append to class Grammar.AppendToDeclaration ###
   

//Any class|object can have properties or methods appended at any time.
//Append-to body contains properties and methods definitions.

     //method produce()
     Grammar.AppendToDeclaration.prototype.produce = function(){
       //.out .body
       this.out(this.body);
       this.skipSemiColon = true;
     };


   //append to class Grammar.TryCatch ###
   

     //method produce()
     Grammar.TryCatch.prototype.produce = function(){

       //.out "try{", .body, .exceptionBlock
       this.out("try{", this.body, this.exceptionBlock);
     };

   //append to class Grammar.ExceptionBlock ###
   

     //method produce()
     Grammar.ExceptionBlock.prototype.produce = function(){

       //.out NL,"}catch(",.catchVar,"){", .body, "}"
       this.out(NL, "}catch(", this.catchVar, "){", this.body, "}");

       //if .finallyBody
       if (this.finallyBody) {
         //.out NL,"finally{", .finallyBody, "}"
         this.out(NL, "finally{", this.finallyBody, "}");
       };
     };


   //append to class Grammar.SwitchStatement ###
   

     //method produce()
     Grammar.SwitchStatement.prototype.produce = function(){

//if we have a varRef, is a switch over a value

       //if .varRef
       if (this.varRef) {

           //.out "switch(", .varRef, "){",NL,NL
           this.out("switch(", this.varRef, "){", NL, NL);
           //for each switchCase in .cases
           for( var switchCase__inx=0,switchCase=undefined; switchCase__inx<this.cases.length; switchCase__inx++){switchCase=this.cases[switchCase__inx];
           
               //.out {pre:"case ", CSL:switchCase.expressions, post:":", separator:' '}
               this.out({pre: "case ", CSL: switchCase.expressions, post: ":", separator: ' '});
               //.out switchCase.body
               this.out(switchCase.body);
               //switchCase.body.out "break;",NL,NL
               switchCase.body.out("break;", NL, NL);
           }; // end for each in this.cases

           //if .defaultBody, .out "default:",.defaultBody
           if (this.defaultBody) {
               this.out("default:", this.defaultBody)};
           //.out NL,"}"
           this.out(NL, "}");
       }
       else {

         //for each index,switchCase in .cases
         for( var index=0,switchCase=undefined; index<this.cases.length; index++){switchCase=this.cases[index];
         
             //.outLineAsComment switchCase.lineInx
             this.outLineAsComment(switchCase.lineInx);
             //.out index>0? "else ":"", "if ("
             this.out(index > 0 ? "else " : "", "if (");
             //.out {pre:"(", CSL:switchCase.expressions, post:")", separator:"||"}
             this.out({pre: "(", CSL: switchCase.expressions, post: ")", separator: "||"});
             //.out "){"
             this.out("){");
             //.out switchCase.body
             this.out(switchCase.body);
             //.out NL,"}"
             this.out(NL, "}");
         }; // end for each in this.cases

         //if .defaultBody, .out NL,"else {",.defaultBody,"}"
         if (this.defaultBody) {
             this.out(NL, "else {", this.defaultBody, "}")};
       };
     };


   //append to class Grammar.CaseWhenExpression ###
   

     //method produce()
     Grammar.CaseWhenExpression.prototype.produce = function(){

//if we have a varRef, is a case over a value

       //if .varRef
       if (this.varRef) {

           var caseVar = this.outCode.getUniqueVarName('caseVar');
           //.out "(function(",caseVar,"){",NL
           this.out("(function(", caseVar, "){", NL);
           //for each caseWhenSection in .cases
           for( var caseWhenSection__inx=0,caseWhenSection=undefined; caseWhenSection__inx<this.cases.length; caseWhenSection__inx++){caseWhenSection=this.cases[caseWhenSection__inx];
           
               //caseWhenSection.out "if("
               caseWhenSection.out("if(", {pre: "" + (caseVar) + "===(", CSL: caseWhenSection.expressions, post: ")", separator: '||'}, ") return ", caseWhenSection.resultExpression, ";", NL);
           }; // end for each in this.cases

           //if .elseExpression, .out "    return ",.elseExpression,";",NL
           if (this.elseExpression) {
               this.out("    return ", this.elseExpression, ";", NL)};
           //.out "        }(",.varRef,"))"
           this.out("        }(", this.varRef, "))");
       }
       else {

         //for each caseWhenSection in .cases
         for( var caseWhenSection__inx=0,caseWhenSection=undefined; caseWhenSection__inx<this.cases.length; caseWhenSection__inx++){caseWhenSection=this.cases[caseWhenSection__inx];
         
             //.outLineAsComment caseWhenSection.lineInx
             this.outLineAsComment(caseWhenSection.lineInx);
             //caseWhenSection.out "(",caseWhenSection.booleanExpression,") ? (", caseWhenSection.resultExpression,") :",NL
             caseWhenSection.out("(", caseWhenSection.booleanExpression, ") ? (", caseWhenSection.resultExpression, ") :", NL);
         }; // end for each in this.cases

         //.out "/* else */ ",.elseExpression or 'undefined'
         this.out("/* else */ ", this.elseExpression || 'undefined');
       };
     };

   //append to class Grammar.WaitForAsyncCall ###
   

     //method produce()
     Grammar.WaitForAsyncCall.prototype.produce = function(){

//        declare valid .call.funcRef
//        declare valid .call.args

       //.out "wait.for(", {CSL:[.call.funcRef].concat(.call.args)} ,")"
       this.out("wait.for(", {CSL: [this.call.funcRef].concat(this.call.args)}, ")");
     };



//# Helper functions


//Identifier aliases
//------------------

//This are a few aliases to most used built-in identifiers:

   var IDENTIFIER_ALIASES = {
     'on': 'true', 
     'off': 'false'
     };

//Utility
//-------

   var NL = '\n';// # New Line constant

//Operator Mapping
//================

//Many LiteScript operators can be easily mapped one-to-one with their JavaScript equivalents.

   var OPER_TRANSLATION = {
     'no': '!', 
     'not': '!', 
     'unary -': '-', 
     'unary +': '+', 
     'type of': 'typeof', 
     'instance of': 'instanceof', 
     'is': '===', 
     'isnt': '!==', 
     '<>': '!==', 
     'and': '&&', 
     'but': '&&', 
     'or': '||', 
     'has property': 'in'
     };

   //function operTranslate(name:string)
   function operTranslate(name){
     //return name.translate(OPER_TRANSLATION)
     return name.translate(OPER_TRANSLATION);
   };

//---------------------------------

   //append to class Grammar.ASTBase
   

//Helper methods and properties, valid for all nodes

//          properties skipSemiColon

    //helper method assignIfUndefined(name,value)
    Grammar.ASTBase.prototype.assignIfUndefined = function(name, value){

//          declare valid value.root.name.name
//          #do nothing if value is 'undefined'
         //if value.root.name.name is 'undefined' #Expression->Operand->VariableRef->name
         if (value.root.name.name === 'undefined') {// #Expression->Operand->VariableRef->name
           //.out "// ",name,": undefined",NL
           this.out("// ", name, ": undefined", NL);
           //return
           return;
         };

         //.out "if(",name,'===undefined) ',name,"=",value,";",NL
         this.out("if(", name, '===undefined) ', name, "=", value, ";", NL);
    };

