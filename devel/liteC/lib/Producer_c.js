//Compiled by LiteScript compiler v0.7.0, source: /home/ltato/LiteScript/devel/source-v0.7/Producer_c.lite.md
// Producer C
// ===========

// The `producer` module extends Grammar classes, adding a `produce()` method
// to generate target code for the node.

// The compiler calls the `.produce()` method of the root 'Module' node
// in order to return the compiled code for the entire tree.

// We extend the Grammar classes, so this module require the `Grammar` module.

   // import ASTBase, Grammar
   var ASTBase = require('./ASTBase');
   var Grammar = require('./Grammar');

// "C" Producer Functions
// ==========================

   // append to class Grammar.Module ###

    // method produce()
    Grammar.Module.prototype.produce = function(){

// if a 'export default' was declared, set the referenced namespace
// as the new 'export default' (instead of 'module.exports')

       var exportsName = '_Module_' + this.name + '_exports';
       this.lexer.out.exportNamespace = exportsName;
       // if .exportDefault instance of Grammar.VarStatement
       if (this.exportDefault instanceof Grammar.VarStatement) {
            // declare valid .exportDefault.list.length
            // declare valid .exportDefault.throwError
           // if .exportDefault.list.length > 1, .exportDefault.throwError "only one var:Object alllowed for 'export default'"
           if (this.exportDefault.list.length > 1) {this.exportDefault.throwError("only one var:Object alllowed for 'export default'")};
           this.lexer.out.exportNamespace = this.exportDefault.list[0].name;
       }
       
       else if (this.exportDefault instanceof ASTBase) {
            // declare valid .exportDefault.name
           this.lexer.out.exportNamespace = this.exportDefault.name;
       };

       // end if

// default #includes:
// "LiteC-core.h" at the header, the header at the .c

       this.out({h: 1}, NL);
       this.out('#include "LiteC-core.h"', NL);

       this.out({h: 0}, NL);
       this.out('#include "' + this.fileInfo.basename + '.h"', NL, NL);

       // for each statement in .statements
       for( var statement__inx=0,statement ; statement__inx<this.statements.length ; statement__inx++){statement=this.statements[statement__inx];
         statement.produce();
       };// end for each in this.statements
       this.out(NL);

        //add end of file comments
       this.outPrevLinesComments(this.lexer.infoLines.length - 1);

// export 'export default' namespace, if it was set.

       // if not .lexer.out.browser
       if (!(this.lexer.out.browser)) {
           // if .lexer.out.exportNamespace isnt exportsName
           if (this.lexer.out.exportNamespace !== exportsName) {
               this.out(exportsName, '=', this.lexer.out.exportNamespace, ";", NL);
           };
       };
    };

   // append to class Grammar.Body ### and Module (derives from Body)

// A "Body" is an ordered list of statements.

// "Body"s lines have all the same indent, representing a scope.

// "Body"s are used for example, to parse an `if` statement body and `else` body, `for` loops, etc.

     // method produce()
     Grammar.Body.prototype.produce = function(){

       // for each statement in .statements
       for( var statement__inx=0,statement ; statement__inx<this.statements.length ; statement__inx++){statement=this.statements[statement__inx];
         statement.produce();
       };// end for each in this.statements

       this.out(NL);
     };


// -------------------------------------
   // append to class Grammar.Statement ###

// `Statement` objects call their specific statement node's `produce()` method
// after adding any comment lines preceding the statement

     // method produce()
     Grammar.Statement.prototype.produce = function(){

        // declare valid .statement.body

// add comment lines, in the same position as the source

       this.outPrevLinesComments();

// To ease reading of compiled code, add original Lite line as comment

       // if .lexer.options.comments
       if (this.lexer.options.comments) {
         // if .lexer.out.lastOriginalCodeComment<.lineInx
         if (this.lexer.out.lastOriginalCodeComment < this.lineInx) {
           // if not (.statement.constructor in [
           if (!(([Grammar.PrintStatement, Grammar.VarStatement, Grammar.CompilerStatement, Grammar.DeclareStatement, Grammar.AssignmentStatement, Grammar.ReturnStatement, Grammar.PropertiesDeclaration, Grammar.FunctionCall].indexOf(this.statement.constructor)>=0))) {
             this.out({COMMENT: this.lexer.infoLines[this.lineInx].text.trim()}, NL);
           };
         };
         this.lexer.out.lastOriginalCodeComment = this.lineInx;
       };

// Each statement in its own line

       // if .statement isnt instance of Grammar.SingleLineStatement
       if (!(this.statement instanceof Grammar.SingleLineStatement)) {
         this.lexer.out.ensureNewLine();
       };

// if there are one or more 'into var x' in a expression in this statement,
// declare vars before statement (exclude body of FunctionDeclaration)

       this.callOnSubTree("declareIntoVar", Grammar.Body);

// call the specific statement (if,for,print,if,function,class,etc) .produce()

       var mark = this.lexer.out.markSourceMap(this.indent);
       this.out(this.statement);

// add ";" after the statement
// then EOL comment (if it isnt a multiline statement)
// then NEWLINE

       // if not .statement.skipSemiColon
       if (!(this.statement.skipSemiColon)) {
         this.addSourceMap(mark);
         this.out(";");
         // if not .statement.body
         if (!(this.statement.body)) {
           this.out(this.getEOLComment());
         };
       };
     };

// called above, pre-declare vars from 'into var x' assignment-expression

   // append to class Grammar.Oper
     // method declareIntoVar()
     Grammar.Oper.prototype.declareIntoVar = function(){
         // if .intoVar
         if (this.intoVar) {
             this.out("var ", this.right, "=undefined;", NL);
         };
     };


// ---------------------------------
   // append to class Grammar.ThrowStatement ###

     // method produce()
     Grammar.ThrowStatement.prototype.produce = function(){
         // if .specifier is 'fail'
         if (this.specifier === 'fail') {
           this.out("throw _new(Error(", this.expr, "))");
         }
         
         else {
           this.out("throw ", this.expr);
         };
     };


   // append to class Grammar.ReturnStatement ###

     // method produce()
     Grammar.ReturnStatement.prototype.produce = function(){
       this.out("return");
       // if .expr
       if (this.expr) {
         this.out(" ", this.expr);
       };
     };


   // append to class Grammar.FunctionCall ###

     // method produce()
     Grammar.FunctionCall.prototype.produce = function(){

       this.varRef.produce();
       // if .varRef.executes, return #if varRef already executes, nothing more to do
       if (this.varRef.executes) {return};
       this.out("()");// #add (), so JS executes the function call
     };


   // append to class Grammar.Operand ###

// `Operand:
  // |NumberLiteral|StringLiteral|RegExpLiteral
  // |ParenExpression|ArrayLiteral|ObjectLiteral|FunctionDeclaration
  // |VariableRef

// A `Operand` is the left or right part of a binary oper
// or the only Operand of a unary oper.

     // method produce()
     Grammar.Operand.prototype.produce = function(){

       this.out(this.name, this.accessors);
     };

      // #end Operand


   // append to class Grammar.UnaryOper ###

// `UnaryOper: ('-'|new|type of|not|no|bitwise not) `

// A Unary Oper is an operator acting on a single operand.
// Unary Oper inherits from Oper, so both are `instance of Oper`

// Examples:
// 1) `not`     *boolean negation*     `if not a is b`
// 2) `-`       *numeric unary minus*  `-(4+3)`
// 3) `new`     *instantiation*        `x = new classNumber[2]`
// 4) `type of` *type name access*     `type of x is classNumber[2]`
// 5) `no`      *'falsey' check*       `if no options then options={}`
// 6) `~`       *bit-unary-negation*   `a = ~xC0 + 5`

     // method produce()
     Grammar.UnaryOper.prototype.produce = function(){

       var translated = operTranslate(this.name);
       var prepend = undefined, append = undefined;

// if it is "boolean not", add parentheses, because js has a different precedence for "boolean not"
// -(prettier generated code) do not add () for simple "falsey" variable check

       // if translated is "!"
       if (translated === "!") {
           // if not (.name is "no" and .right.name instanceof Grammar.VariableRef)
           if (!((this.name === "no" && this.right.name instanceof Grammar.VariableRef))) {
               prepend = "(";
               append = ")";
           };
       }

// add a space if the unary operator is a word. Example `typeof`
       
       else if (/\w/.test(translated)) {
           translated += " ";
       };

       this.out(translated, prepend, this.right, append);
     };


   // append to class Grammar.Oper ###

     // method produce()
     Grammar.Oper.prototype.produce = function(){

       var oper = this.name;

// default mechanism to handle 'negated' operand

       var prepend = undefined, append = undefined;
       // if .negated # NEGATED
       if (this.negated) {// # NEGATED

// if NEGATED and the oper is `is` we convert it to 'isnt'.
// 'isnt' will be translated to !==

           // if oper is 'is' # Negated is ---> !==
           if (oper === 'is') {// # Negated is ---> !==
               oper = '!=';
           }

// else -if NEGATED- we add `!( )` to the expression
           
           else {
               prepend = "!(";
               append = ")";
           };
       };

// Check for special cases:

// 1) 'in' operator, requires swapping left and right operands and to use `.indexOf(...)>=0`
// example: `x in [1,2,3]` -> `_indexOf(x,_literalArray(1,2,3))>=0`
// example: `x not in [1,2,3]` -> `_indexOf(x,_literalArray(1,2,3))==-1`
// example: `char not in myString` -> `_indexOf(char,myString)==-1`

       // if .name is 'in'
       if (this.name === 'in') {
           this.out("_indexOf(", this.left, ",", this.right, ")", this.negated ? "==-1" : ">=0");
       }

// 2) *'has property'* operator, requires swapping left and right operands and to use js: `in`
       
       else if (this.name === 'has property') {
           this.out(prepend, "_hasProperty(", this.right, ",", this.left, ")", append);
       }

// 3) *'into'* operator (assignment-expression), requires swapping left and right operands and to use: `=`
       
       else if (this.name === 'into') {
           this.out("(", this.right, "=", this.left, ")");
       }

// 4) *'like'* operator (RegExp.test), requires swapping left and right operands and to use js: `.test()`
       
       else if (this.name === 'like') {
           this.out(prepend, "_regepx_test(", this.left, ",", this.right, ")", append);
       }

// else we have a direct translatable operator.
// We out: left,operator,right
       
       else {
           this.out(prepend, this.left, ' ', operTranslate(oper), ' ', this.right, append);
       };
     };


   // append to class Grammar.Expression ###

     // method produce(options)
     Grammar.Expression.prototype.produce = function(options){

        // declare on options
          // negated

// Produce the expression body, negated if options={negated:true}

       // default options=
       if(!options) options={};
       // options.negated: undefined

       var prepend = "";
       var append = "";
       // if options.negated
       if (options.negated) {

// (prettier generated code) Try to avoid unnecessary parens after '!'
// for example: if the expression is a single variable, as in the 'falsey' check:
// Example: `if no options.log then... ` --> `if (!options.log) {...`
// we don't want: `if (!(options.log)) {...`

         // if .operandCount is 1
         if (this.operandCount === 1) {
              // #no parens needed
             prepend = "!";
         }
              // #no parens needed
         
         else {
             prepend = "!(";
             append = ")";
         };
       };
          // #end if
        // #end if negated

// produce the expression body

       this.out(prepend, this.root, append);
     };


   // append to class Grammar.VariableRef ###

// `VariableRef: ['--'|'++'] IDENTIFIER [Accessors] ['--'|'++']`

// `VariableRef` is a Variable Reference.

 // a VariableRef can include chained 'Accessors', which can:
 // *access a property of the object : `.`-> PropertyAccess `[`->IndexAccess
 // *assume the variable is a function and perform a function call :  `(`-> FunctionAccess

     // method produce()
     Grammar.VariableRef.prototype.produce = function(){

// Prefix ++/--, varName, Accessors and postfix ++/--

       this.out(this.preIncDec, this.expandAccessors(), this.postIncDec);
     };


     // helper method expandAccessors(upto:Number) returns array
     Grammar.VariableRef.prototype.expandAccessors = function(upto){

         var result = [this.name];
         // if .accessors
         if (this.accessors) {
             // for each inx,ac in .accessors
             for( var inx=0,ac ; inx<this.accessors.length ; inx++){ac=this.accessors[inx];
                 // if upto>=0 and inx is upto, break
                 if (upto >= 0 && inx === upto) {break};
                 // if ac instanceof Grammar.PropertyAccess
                 if (ac instanceof Grammar.PropertyAccess) {
                     // if inx+1<.accessors.length //is not the last
                     if (inx + 1 < this.accessors.length && this.accessors[inx + 1] instanceof Grammar.FunctionAccess) { //is not the last
                           result.push('->call');
                     };
                     // end if
                     result.push('->' + ac.name);
                 }
                 
                 else if (ac instanceof Grammar.FunctionAccess) {
                     result.push('(');
                     result.push({CSL: ac.args});
                     result.push(')');
                 }
                 
                 else if (ac instanceof Grammar.IndexAccess) {
                     result.push('[');
                     result.push(ac.name); //expression
                     result.push(']');
                 };
             };// end for each in this.accessors
             
         };

         return result;
     };

     // end helper method


     // helper method getInstanceAccessors() returns array
     Grammar.VariableRef.prototype.getInstanceAccessors = function(){

// This method will get all the accessors up to a method call
// returns an array, to send to .out

       var upto = 0;
       // if .accessors
       if (this.accessors) {
          // search from the end of the accessor chain, upto the function call
         upto = this.accessors.length;
         // while --upto>=0
         while(--upto >= 0){
             // if .accessors[upto] instanceof Grammar.FunctionAccess
             if (this.accessors[upto] instanceof Grammar.FunctionAccess) {
                //found the function call ()
               upto--; //move one back
               // if .accessors[upto] instanceof Grammar.PropertyAccess
               if (this.accessors[upto] instanceof Grammar.PropertyAccess) {
                    //is the function name, remove it to get the instance
                   upto--; //move one back
               };
             };
         };// end loop
         // end while
         
       };

       return this.expandAccessors(upto); //prop chain upto instance on which the function is called
     };

   // append to class Grammar.AssignmentStatement ###

     // method produce()
     Grammar.AssignmentStatement.prototype.produce = function(){

       this.out(this.lvalue, ' ', operTranslate(this.name), ' ', this.rvalue);
     };


// -------
   // append to class Grammar.DefaultAssignment ###

     // method produce()
     Grammar.DefaultAssignment.prototype.produce = function(){

       this.process(this.assignment.lvalue, this.assignment.rvalue);

       this.skipSemiColon = true;
     };

// #### helper Functions

      // #recursive duet 1
     // helper method process(name,value)
     Grammar.DefaultAssignment.prototype.process = function(name, value){

// if it is ObjectLiteral: recurse levels, else, a simple 'if undefined, assignment'

// check if it's a ObjectLiteral (level indent)

         // if value instanceof Grammar.ObjectLiteral
         if (value instanceof Grammar.ObjectLiteral) {
           this.processItems(name, value);// # recurse Grammar.ObjectLiteral
         }

// else, simple value (Expression)
         
         else {
           this.assignIfUndefined(name, value);// # Expression
         };
     };


      // #recursive duet 2
     // helper method processItems(main, objectLiteral)
     Grammar.DefaultAssignment.prototype.processItems = function(main, objectLiteral){

         this.out("_defaultObject(&", main, ");", NL);

         // for each nameValue in objectLiteral.items
         for( var nameValue__inx=0,nameValue ; nameValue__inx<objectLiteral.items.length ; nameValue__inx++){nameValue=objectLiteral.items[nameValue__inx];
           var itemFullName = [main, '.', nameValue.name];
           this.process(itemFullName, nameValue.value);
         };// end for each in objectLiteral.items
         
     };


    // #end helper recursive functions


// -----------
// ## Accessors
// 1) Property access "." translates to pointer dereference "->"
// 2) Function access "()", if it's a method, we must add "->call" to access
// the class jmp table. Also we must add the object as first parameter (this)
// 3) IndexAccess: we use C's built in `[ ]` accessor

   // append to class Grammar.PropertyAccess ##
     // method produce()
     Grammar.PropertyAccess.prototype.produce = function(){
       this.out("->", this.name);
     };

   // append to class Grammar.FunctionAccess
     // method produce()
     Grammar.FunctionAccess.prototype.produce = function(){
        // declare .parent:Grammar.VariableRef
       // if .parent.accessors[0] is this //simple function call
       if (this.parent.accessors[0] === this) { //simple function call
           this.out("(");
       }
       
       else {
            //member?
           this.out("->call(");
           this.out(this.parent.getInstanceAccessors(), ", "); //value for "this" param
       };
       // end if
       this.out({CSL: this.args}, ")");
     };

   // append to class Grammar.IndexAccess
     // method produce()
     Grammar.IndexAccess.prototype.produce = function(){
       this.out("[", this.name, "]");
     };

// -----------

   // append to class ASTBase
    // helper method lastLineInxOf(list:ASTBase array)
    ASTBase.prototype.lastLineInxOf = function(list){

// More Helper methods, get max line of list

       var lastLine = this.lineInx;
       // for each item in list
       for( var item__inx=0,item ; item__inx<list.length ; item__inx++){item=list[item__inx];
           // if item.lineInx>lastLine
           if (item.lineInx > lastLine) {
             lastLine = item.lineInx;
           };
       };// end for each in list

       return lastLine;
    };


    // method getOwnerPrefix() returns array
    ASTBase.prototype.getOwnerPrefix = function(){

// check if we're inside a ClassDeclaration or AppendToDeclaration.
// return prefix for item to be appended

       var parent = this.getParent(Grammar.ClassDeclaration);

       // if no parent, return
       if (!parent) {return};

       var ownerName = undefined, toPrototype = undefined;
       // if parent instance of Grammar.AppendToDeclaration
       if (parent instanceof Grammar.AppendToDeclaration) {
          // #append to class prototype or object
          // declare parent:Grammar.AppendToDeclaration
         toPrototype = !(parent.toNamespace);
         ownerName = parent.varRef;
       }
       
       else {
          // declare valid .toNamespace
         toPrototype = true;
         ownerName = parent.name;
       };

        //return [ownerName, toPrototype? "->prototype->" else "->" ]
       return ownerName;
    };


// ---
   // append to class Grammar.WithStatement ###

// `WithStatement: with VariableRef Body`

// The WithStatement simplifies calling several methods of the same object:
// Example:
// ```
// with frontDoor
    // .show
    // .open
    // .show
    // .close
    // .show
// ```
// to js:
// ```
// var with__1=frontDoor;
  // with__1.show;
  // with__1.open
  // with__1.show
  // with__1.close
  // with__1.show
// ```

     // method produce()
     Grammar.WithStatement.prototype.produce = function(){

       this.out("var ", this.name, '=', this.varRef, ";");
       this.out(this.body);
     };


// ---
   // append to class Grammar.PropertiesDeclaration ###

// 'properties' followed by a list of comma separated: var names and optional assignment

     // method produce(prefix)
     Grammar.PropertiesDeclaration.prototype.produce = function(prefix){

        //.outLinesAsComment .lineInx, .lastLineInxOf(.list)

        //if no prefix, prefix = .getOwnerPrefix()

       // for each varDecl in .list
       for( var varDecl__inx=0,varDecl ; varDecl__inx<this.list.length ; varDecl__inx++){varDecl=this.list[varDecl__inx];
         this.out(varDecl, ";", NL);
       };// end for each in this.list
       
     };
// if varDecl.assignedValue #is not valid to assign to .prototype. - creates subtle errors later
//             if prefix instance of Array and prefix[1] and prefix[1] isnt '.', .throwError 'cannot assign values to instance properties in "Append to"'
//             .out '    ',prefix, varDecl.name,"=",varDecl.assignedValue,";",NL
        // .skipSemiColon = true

   // append to class Grammar.VarStatement ###

// 'var' followed by a list of comma separated: var names and optional assignment

     // method produce()
     Grammar.VarStatement.prototype.produce = function(){

        // declare valid .compilerVar
        // declare valid .export

//         if .keyword is 'let' and .compilerVar('ES6')
//           .out 'let '
//         else
//           .out 'var '
//         

// Now, after 'var' or 'let' out one or more comma separated VariableDecl

       this.out({CSL: this.list, freeForm: this.list.length > 2});

// If 'var' was adjectivated 'export', add to exportNamespace

       // if not .lexer.out.browser
       if (!(this.lexer.out.browser)) {

         // if .export and not .default
         if (this.export && !(this.default)) {
           this.out(";", NL, {COMMENT: 'export'}, NL);
           // for each varDecl in .list
           for( var varDecl__inx=0,varDecl ; varDecl__inx<this.list.length ; varDecl__inx++){varDecl=this.list[varDecl__inx];
               this.out(this.lexer.out.exportNamespace, '.', varDecl.name, ' = ', varDecl.name, ";", NL);
           };// end for each in this.list
           this.skipSemiColon = true;
         };
       };
     };



   // append to class Grammar.ImportStatement ###

// 'import' followed by a list of comma separated: var names and optional assignment

     // method produce()
     Grammar.ImportStatement.prototype.produce = function(){

       // for each item:Grammar.ImportStatementItem in .list
       for( var item__inx=0,item ; item__inx<this.list.length ; item__inx++){item=this.list[item__inx];

         var requireParam = item.importParameter ? item.importParameter.getValue() : item.name;

         this.out("var ", item.name, " = require('", this.global || requireParam[0] === '/' ? "" : "./", requireParam, "');", NL);
       };// end for each in this.list

       this.skipSemiColon = true;
     };


   // append to class Grammar.VariableDecl ###

// variable name and optionally assign a value

     // method produce()
     Grammar.VariableDecl.prototype.produce = function(){

// It's a `var` keyword or we're declaring function parameters.
// In any case starts with the variable name

         this.out(this.type || 'void', ' ', this.name);

          // declare valid .keyword

// If this VariableDecl come from a 'var' statement, we force assignment (to avoid subtle bugs,
// in LiteScript, 'var' declaration assigns 'undefined')

         // if .parent instanceof Grammar.VarStatement and .assignedValue
         if (this.parent instanceof Grammar.VarStatement && this.assignedValue) {
             this.out(' = ', this.assignedValue);
         };
     };

// else, this VariableDecl come from function parameters decl,
// if it has AssginedValue, we out assignment if ES6 is available.
// (ES6 implements 'default' for parameters, so `function myFunc(a=3)` is valid in ES6)

          //else
          //  if .assignedValue and .compilerVar('ES6')
          //      .out ' = ',.assignedValue

    // #end VariableDecl


   // append to class Grammar.SingleLineStatement ###

     // method produce()
     Grammar.SingleLineStatement.prototype.produce = function(){

       var bare = [];
       // for each statement in .statements
       for( var statement__inx=0,statement ; statement__inx<this.statements.length ; statement__inx++){statement=this.statements[statement__inx];
           bare.push(statement.statement);
       };// end for each in this.statements
        // #.out NL,"    ",{CSL:bare, separator:";"}
       this.out({CSL: bare, separator: ";"}, ";");
     };


   // append to class Grammar.IfStatement ###

     // method produce()
     Grammar.IfStatement.prototype.produce = function(){

        // declare valid .elseStatement.produce

       // if .body instanceof Grammar.SingleLineStatement
       if (this.body instanceof Grammar.SingleLineStatement) {
           this.out("if (", this.conditional, ") {", this.body, "}");
       }
       
       else {
           this.out("if (", this.conditional, ") {", this.getEOLComment());
           this.out(this.body, "}");
       };

       // if .elseStatement
       if (this.elseStatement) {
           this.outPrevLinesComments(this.elseStatement.lineInx - 1);
           this.elseStatement.produce();
       };
     };


   // append to class Grammar.ElseIfStatement ###

     // method produce()
     Grammar.ElseIfStatement.prototype.produce = function(){

       this.out(NL, "else ", this.nextIf);
     };

   // append to class Grammar.ElseStatement ###

     // method produce()
     Grammar.ElseStatement.prototype.produce = function(){

       this.out(NL, "else {", this.body, "}");
     };

   // append to class Grammar.ForStatement ###

// There are 3 variants of `ForStatement` in LiteScript

     // method produce()
     Grammar.ForStatement.prototype.produce = function(){

        // declare valid .variant.iterable
        // declare valid .variant.produce

// Pre-For code. If required, store the iterable in a temp var.
// (prettier generated code) Only if the iterable is a complex expression,
// (if it can have side-effects) we store it in a temp
// var in order to avoid calling it twice. Else, we use it as is.

       var iterable = this.variant.iterable;

        // declare valid iterable.root.name.hasSideEffects

       // if iterable
       if (iterable) {
         // if iterable.operandCount>1 or iterable.root.name.hasSideEffects or iterable.root.name instanceof Grammar.Literal
         if (iterable.operandCount > 1 || iterable.root.name.hasSideEffects || iterable.root.name instanceof Grammar.Literal) {
           iterable = ASTBase.getUniqueVarName('list');// #unique temp iterable var name
           this.out("Object ", iterable, "=", this.variant.iterable, ";", NL);
         };
       };

       this.variant.produce(iterable);

// Since al 3 cases are closed with '}; //comment', we skip statement semicolon

       this.skipSemiColon = true;
     };


   // append to class Grammar.ForEachProperty
// ### Variant 1) 'for each property' to loop over *object property names*

// `ForEachProperty: for each [own] property name-VariableDecl in object-VariableRef`

     // method produce(iterable)
     Grammar.ForEachProperty.prototype.produce = function(iterable){

         // if .mainVar
         if (this.mainVar) {
           this.out("var ", this.mainVar.name, "=undefined;", NL);
         };

         this.out("for ( var ", this.indexVar.name, " in ", iterable, ")");

         // if .ownOnly
         if (this.ownOnly) {
             this.out("if (", iterable, ".hasOwnProperty(", this.indexVar, "))");
         };

         // if .mainVar
         if (this.mainVar) {
             this.body.out("{", this.mainVar.name, "=", iterable, "[", this.indexVar, "];", NL);
         };

         this.out(this.where);

         this.body.out("{", this.body, "}", NL);

         // if .mainVar
         if (this.mainVar) {
           this.body.out(NL, "}");
         };

         this.out({COMMENT: "end for each property"}, NL);
     };


   // append to class Grammar.ForEachInArray
// ### Variant 2) 'for each index' to loop over *Array indexes and items*

// `ForEachInArray: for each [index-VariableDecl,]item-VariableDecl in array-VariableRef`

     // method produce(iterable)
     Grammar.ForEachInArray.prototype.produce = function(iterable){

// Create a default index var name if none was provided

       var indexVar = this.indexVar;
       // if no indexVar
       if (!indexVar) {
         indexVar = {name: this.mainVar.name + '__inx', assignedValue: 0};// #default index var name
       };

       this.out("for(int ", indexVar.name, "=", indexVar.assignedValue || "0", ",", this.mainVar.name, " ; ", indexVar.name, "<", iterable, ".length", " ; ", indexVar.name, "++){");

       this.body.out(this.mainVar.name, "=", iterable, "[", indexVar.name, "];", NL);

       // if .where
       if (this.where) {
         this.out(this.where, "{", this.body, "}");
       }
       
       else {
         this.out(this.body);
       };

       this.out("};", {COMMENT: ["end for each in ", this.iterable]}, NL);
     };

   // append to class Grammar.ForIndexNumeric
// ### Variant 3) 'for index=...' to create *numeric loops*

// `ForIndexNumeric: for index-VariableDecl "=" start-Expression [,|;] (while|until) condition-Expression [(,|;) increment-Statement]`

// Examples: `for n=0 while n<10`, `for n=0 to 9`
// Handle by using a js/C standard for(;;){} loop

     // method produce(iterable)
     Grammar.ForIndexNumeric.prototype.produce = function(iterable){

        // declare valid .endExpression.produce

       this.out("for(int ", this.indexVar.name, "=", this.indexVar.assignedValue || "0", "; ");

       // if .conditionPrefix is 'to'
       if (this.conditionPrefix === 'to') {
            // #'for n=0 to 10' -> for(n=0;n<=10;...
           this.out(this.indexVar.name, "<=", this.endExpression);
       }
       
       else {

// produce the condition, negated if the prefix is 'until'

          // #for n=0, while n<arr.length  -> for(n=0;n<arr.length;...
          // #for n=0, until n >= arr.length  -> for(n=0;!(n>=arr.length);...
         this.endExpression.produce({negated: this.conditionPrefix === 'until'});
       };

       this.out("; ");

// if no increment specified, the default is indexVar++

       this.out(this.increment || [this.indexVar.name, "++"]);

       this.out(") ", this.where);

       this.out("{", this.body, "};", {COMMENT: "end for " + this.indexVar.name}, NL);
     };



   // append to class Grammar.ForWhereFilter
// ### Helper for where filter
// `ForWhereFilter: [where Expression]`

     // method produce()
     Grammar.ForWhereFilter.prototype.produce = function(){
       this.out('if(', this.filter, ')');
     };

   // append to class Grammar.DeleteStatement
// `DeleteStatement: delete VariableRef`

     // method produce()
     Grammar.DeleteStatement.prototype.produce = function(){
       this.out('delete ', this.varRef);
     };

   // append to class Grammar.WhileUntilExpression ###

     // method produce(options)
     Grammar.WhileUntilExpression.prototype.produce = function(options){

// If the parent ask for a 'while' condition, but this is a 'until' condition,
// or the parent ask for a 'until' condition and this is 'while', we must *negate* the condition.

        // declare valid .expr.produce

       // default options =
       if(!options) options={};
       // options.askFor: undefined
       // options.negated: undefined

       // if options.askFor and .name isnt options.askFor
       if (options.askFor && this.name !== options.askFor) {
           options.negated = true;
       };

// *options.askFor* is used when the source code was, for example,
// `do until Expression` and we need to code: `while(!(Expression))`
// or the code was `loop while Expression` and we need to code: `if (!(Expression)) break`

// when you have a `until` condition, you need to negate the expression
// to produce a `while` condition. (`while NOT x` is equivalent to `until x`)

       this.expr.produce(options);
     };


   // append to class Grammar.DoLoop ###

     // method produce()
     Grammar.DoLoop.prototype.produce = function(){

// Note: **WhileUntilLoop** symbol has **DoLoop** as *prototype*, so this *.produce()* method
// is used by both symbols.

       // if .postWhileUntilExpression
       if (this.postWhileUntilExpression) {

// if we have a post-condition, for example: `do ... loop while x>0`,

           this.out("do{", this.getEOLComment());
           this.out(this.body);
           this.out("} while (");
           this.postWhileUntilExpression.produce({askFor: 'while'});
           this.out(")");
       }

// else, optional pre-condition:
       
       else {

           this.out('while(');
           // if .preWhileUntilExpression
           if (this.preWhileUntilExpression) {
             this.preWhileUntilExpression.produce({askFor: 'while'});
           }
           
           else {
             this.out('true');
           };
           this.out('){', this.body, "}");
       };

       // end if

       this.out(";", {COMMENT: "end loop"}, NL);
       this.skipSemiColon = true;
     };

   // append to class Grammar.LoopControlStatement ###
// This is a very simple produce() to allow us to use the `break` and `continue` keywords.

     // method produce()
     Grammar.LoopControlStatement.prototype.produce = function(){
       this.out(this.control);
     };

   // append to class Grammar.DoNothingStatement ###

     // method produce()
     Grammar.DoNothingStatement.prototype.produce = function(){
       this.out("null");
     };

   // append to class Grammar.ParenExpression ###

// A `ParenExpression` is just a normal expression surrounded by parentheses.

     // method produce()
     Grammar.ParenExpression.prototype.produce = function(){
       this.out("(", this.expr, ")");
     };

   // append to class Grammar.ArrayLiteral ###

// A `ArrayLiteral` is a definition of a list like `[1, a, 2+3]`. We just pass this through to JavaScript.

     // method produce()
     Grammar.ArrayLiteral.prototype.produce = function(){
       this.out("[", {CSL: this.items}, "]");
     };

   // append to class Grammar.NameValuePair ###

// A `NameValuePair` is a single item in an object definition. Since we copy js for this, we pass this straight through

     // method produce()
     Grammar.NameValuePair.prototype.produce = function(){
       this.out(this.name, ": ", this.value);
     };

   // append to class Grammar.ObjectLiteral ###

// A `ObjectLiteral` is an object definition using key/value pairs like `{a:1,b:2}`.
// JavaScript supports this syntax, so we just pass it through.

     // method produce()
     Grammar.ObjectLiteral.prototype.produce = function(){
       this.out("{", {CSL: this.items}, "}");
     };

   // append to class Grammar.FreeObjectLiteral ###

// A `FreeObjectLiteral` is an object definition using key/value pairs, but in free-form
// (one NameValuePair per line, indented, comma is optional)

     // method produce()
     Grammar.FreeObjectLiteral.prototype.produce = function(){
       this.out("{", {CSL: this.items, freeForm: true}, "}");
     };


   // append to class Grammar.FunctionDeclaration ###

// `FunctionDeclaration: '[export][generator] (function|method|constructor) [name] '(' FunctionParameterDecl* ')' Block`

// `FunctionDeclaration`s are function definitions.

// `export` prefix causes the function to be included in `module.exports`
// `generator` prefix marks a 'generator' function that can be paused by `yield` (js/ES6 function*)

    // method produce(options)
    Grammar.FunctionDeclaration.prototype.produce = function(options){

     // default options =
     if(!options) options={};
     if(options.typeSignature===undefined) options.typeSignature=false;

     var generatorMark = this.generator && this.compilerVar('ES6') ? "*" : "";
     var isConstructor = this instanceof Grammar.ConstructorDeclaration;
     var addThis = false;
     var className = undefined;

// check if this is a 'constructor', 'method' or 'function'

     // if isConstructor
     if (isConstructor) {
         this.out("//class _init fn", NL);
         className = this.getParent(Grammar.ClassDeclaration).name;
         this.out("void ", className, "__init");
         addThis = true;
     }

// else, method?
     
     else if (this instanceof Grammar.MethodDeclaration) {

          //if no options.typeSignature, .out "//function ",.name,NL

          // #get owner where this method belongs to
         // if no .getOwnerPrefix() into className
         if (!((className=this.getOwnerPrefix()))) {
             // fail with 'method "#{.name}" Cannot determine owner object'
             throw new Error('method "' + this.name + '" Cannot determine owner object');
         };

          // #if shim, check before define
          //if .shim, .out "if (!",className,.name,")",NL

          //if .definePropItems #we should code Object.defineProperty
          //    className[1] = className[1].replace(/\.$/,"") #remove extra dot
          //    .out "Object.defineProperty(",NL,
          //          className, ",'",.name,"',{value:function",generatorMark
          //else
         this.out(this.type || 'void', ' ');
         // if options.typeSignature
         if (options.typeSignature) {
             this.out("(*", this.name, ")");
         }
         
         else {
             this.out(className, '__', this.name); //," = function",generatorMark
         };

         addThis = true;
     }

// else is a simple function
     
     else {
         this.out(this.type || 'void', ' ', this.name); //, generatorMark
     };

// Now, funtion parameters

     // if addThis
     if (addThis) {
          //method parameters declaration, add "[ClassName] this" is first param
         this.out("(", className, " this");
         // if .paramsDeclarations.length
         if (this.paramsDeclarations.length) {
             this.out(',', {CSL: this.paramsDeclarations});
         };
         this.out(")");
     }
     
     else {
          //just function parameters declaration
         this.out("(", {CSL: this.paramsDeclarations}, ")");
     };


// if 'nice', produce default nice body, and then the generator header for real body

//       var isNice = .nice and not (isConstructor or .shim or .definePropItems or .generator)
//       if isNice
//           var argsArray = (.paramsDeclarations or []).concat["__callback"]
//           .out "(", {CSL:argsArray},"){", .getEOLComment(),NL
//           .out '  nicegen(this, ',prefix,.name,"_generator, arguments);",NL
//           .out "};",NL
//           .out "function* ",prefix,.name,"_generator"
//       end if
//       


     // if options.typeSignature //close & exit
     if (options.typeSignature) { //close & exit
         this.out(";", this.getEOLComment(), NL);
         return;
     };

// start body

     this.out("{", this.getEOLComment());

// if the function has a exception block, insert 'try{'

     // if no .body, .throwError 'function #{.name} has no body'
     if (!this.body) {this.throwError('function ' + this.name + ' has no body')};

// if simple-function, insert implicit return. Example: function square(x) = x*x

     // if .body instance of Grammar.Expression
     if (this.body instanceof Grammar.Expression) {
         this.out("return ", this.body);
     }
     
     else {

// if it has a "catch" or "exception", insert 'try{'

         // for each statement in .body.statements
         for( var statement__inx=0,statement ; statement__inx<this.body.statements.length ; statement__inx++){statement=this.body.statements[statement__inx];
           // if statement.statement instance of Grammar.ExceptionBlock
           if (statement.statement instanceof Grammar.ExceptionBlock) {
               this.out(" try{", NL);
               // break
               break;
           };
         };// end for each in this.body.statements

// if params defaults where included, we assign default values to arguments
// (if ES6 enabled, they were included abobve in ParamsDeclarations production )
// no on C
//           if .paramsDeclarations and not .compilerVar('ES6')
//               for each paramDecl in .paramsDeclarations
//                 if paramDecl.assignedValue
//                     .body.assignIfUndefined paramDecl.name, paramDecl.assignedValue
//               #end for
//           #end if

// now produce function body

         this.body.produce();
     };

// close the function, add source map for function default "return undefined".

     this.out("}");
     // if .lexer.out.sourceMap
     if (this.lexer.out.sourceMap) {
         this.lexer.out.sourceMap.add(this.EndFnLineNum, 0, this.lexer.out.lineNum - 1, 0);
     };
    };

// if we were coding .definePropItems , close Object.defineProperty

// if .definePropItems
//           for each definePropItem in .definePropItems
//             .out NL,",",definePropItem.name,":", definePropItem.negated? 'false':'true'
//           end for
//           .out NL,"})"
// If the function was adjectivated 'export', add to module.exports
//       if not .lexer.out.browser
//         if .export and not .default
//           .out ";",NL,{COMMENT:'export'},NL
//           .out .lexer.out.exportNamespace,'.',.name,'=',.name,";"
//           .skipSemiColon = true

// --------------------
   // append to class Grammar.PrintStatement ###
// `print` is an alias for console.log

     // method produce()
     Grammar.PrintStatement.prototype.produce = function(){

       var format = [];

       // for each inx,arg:Grammar.Expression in .args
       for( var inx=0,arg ; inx<this.args.length ; inx++){arg=this.args[inx];
           var nameDecl = arg.getResultType();
           // if no nameDecl
           if (!nameDecl) {
               this.sayErr("can't determine type of expr #" + (inx + 1) + ": " + arg);
           }
           
           else if (nameDecl.name === 'int') {
               format.push("%d");
           }
           
           else if (nameDecl.name === 'str') {
               format.push("%s");
           }
           
           else if (nameDecl.name === 'float') {
               format.push("%f");
           }
           
           else {
               this.sayErr("don't know format code for type '" + (nameDecl.composedName()) + "' of expr #" + (inx + 1) + ": " + arg);
           };
           // end if
           
       };// end for each in this.args
       // end of

       this.out('printf("', format.join(' '), '",', {'CSL': this.args}, ');');
     };


// --------------------
   // append to class Grammar.EndStatement ###

// Marks the end of a block. It's just a comment for javascript

     // method produce()
     Grammar.EndStatement.prototype.produce = function(){

        // declare valid .lexer.out.lastOriginalCodeComment
        // declare valid .lexer.infoLines

       // if .lexer.out.lastOriginalCodeComment<.lineInx
       if (this.lexer.out.lastOriginalCodeComment < this.lineInx) {
         this.out({COMMENT: this.lexer.infoLines[this.lineInx].text});
       };

       this.skipSemiColon = true;
     };

// --------------------
   // append to class Grammar.CompilerStatement ###

     // method produce()
     Grammar.CompilerStatement.prototype.produce = function(){

// first, out as comment this line

       this.outLineAsComment(this.lineInx);

// if it's a conditional compile, output body is option is Set

       // if .conditional
       if (this.conditional) {
           // if .compilerVar(.conditional)
           if (this.compilerVar(this.conditional)) {
                // declare valid .body.produce
               this.body.produce();
           };
       };

       this.skipSemiColon = true;
     };


// --------------------
   // append to class Grammar.DeclareStatement ###

// Out as comments

     // method produce()
     Grammar.DeclareStatement.prototype.produce = function(){

       // if .global
       if (this.global) {

         this.out({h: 1}, NL);

         // for each item in .list
         for( var item__inx=0,item ; item__inx<this.list.length ; item__inx++){item=this.list[item__inx];
           this.out('#include "', item.name, '.h"', NL);
         };// end for each in this.list

         this.out({h: 0}, NL);
       };


       this.outLinesAsComment(this.lineInx, this.names ? this.lastLineInxOf(this.names) : this.lineInx);
       this.skipSemiColon = true;
     };


// ----------------------------
   // append to class Grammar.ClassDeclaration ###

// Classes contain a code block with properties and methods definitions.

     // method produce()
     Grammar.ClassDeclaration.prototype.produce = function(){

// 1st, split body into: a) properties b) constructor c) methods

        // declare theConstructor:Grammar.FunctionDeclaration
        // declare valid .produce_AssignObjectProperties
        // declare valid .export

       var theConstructor = null;
       var theMethods = [];
       var PropertiesDeclarationStatements = [];

       // if .body
       if (this.body) {
         // for each index,item in .body.statements
         for( var index=0,item ; index<this.body.statements.length ; index++){item=this.body.statements[index];

           // if item.statement instanceof Grammar.ConstructorDeclaration
           if (item.statement instanceof Grammar.ConstructorDeclaration) {

             // if theConstructor # what? more than one?
             if (theConstructor) {// # what? more than one?
               this.throwError('Two constructors declared for class ' + this.name);
             };

             theConstructor = item.statement;
           }
           
           else if (item.statement instanceof Grammar.PropertiesDeclaration) {
              PropertiesDeclarationStatements.push(item.statement);
           }
           
           else {
             theMethods.push(item);
           };
         };// end for each in this.body.statements
         
       };

       // end if body

// In C we need to create a struct for "methods jmp table type" in the .h
// where each member is a function with the correct type signature

       this.out({h: 1}, NL); //start header output

       this.out({COMMENT: "class"}, this.name);
       // if .varRefSuper
       if (this.varRefSuper) {
         this.out({COMMENT: [' extends ', this.varRefSuper]}, NL);
       }
       
       else {
         this.out(NL);
       };

       this.out("// " + this.name + " is the type for: ptr to instance of struct " + this.name + "_t", NL);
       this.out(NL, "typedef struct ", this.name, "_t * ", this.name, ";", NL, NL);

       this.out({COMMENT: "methods jmp table type"}, NL);
       this.out("struct ", this.name, "__METHODS_t {", NL);

       // for each item in theMethods
       for( var item__inx=0,item ; item__inx<theMethods.length ; item__inx++){item=theMethods[item__inx];
           item.statement.produce({typeSignature: true});
       };// end for each in theMethods
       this.out("};", NL, NL);

// Then a struct for the instance properties, preceded by
  // 1) Class pointer: "Class class"
  // 2) "methods jmp table" pointer: "struct [name]__METHODS_t * call"
// Theese are the commont properties for all Object-derived classes (all)

       this.out({COMMENT: "" + this.name + " instance properties"}, NL);
       this.out("struct ", this.name, "_t {", NL);
       this.out("    Class class;", NL);
       this.out("    struct ", this.name, "__METHODS_t * call;", NL);
       this.out("    //" + this.name + " specific properties", NL);
       // for each propertiesDeclaration in PropertiesDeclarationStatements
       for( var propertiesDeclaration__inx=0,propertiesDeclaration ; propertiesDeclaration__inx<PropertiesDeclarationStatements.length ; propertiesDeclaration__inx++){propertiesDeclaration=PropertiesDeclarationStatements[propertiesDeclaration__inx];
           propertiesDeclaration.produce();
       };// end for each in PropertiesDeclarationStatements
       this.out("};", NL, NL);

// Then we expose a instantiated struct Class_t, with the specific
// values for this class (created in the .c file)
// and a "const ptr to it", (also created in the .c file)

       this.out({COMMENT: "instantiated class info (_I) and a const ptr to it (_CLASS)"}, NL);
       this.out("extern struct Class_t ", this.name, "__CLASS_I;", NL);
       this.out("extern const Class ", this.name, "__CLASS;", NL);

       this.out({h: 0}, NL); //end header output

// Now on the .c file:

// a) the constructor ( void function [name]__init)

        //.out {COMMENT:"constructor"},NL

       // if theConstructor
       if (theConstructor) {
         theConstructor.produce();
         this.out(";", NL);
       }
       
       else {
         this.out("//default __init", NL);
         this.out("void ", this.name, "__init(", this.name, " this){");
         // if .varRefSuper
         if (this.varRefSuper) {
             this.out(NL, "    ", {COMMENT: ["//auto call super__init, to initialize first part of space at *this"]});
             this.out(NL, "    ", this.varRefSuper, "__init(this);", NL);
         };
         // for each propDecl in PropertiesDeclarationStatements
         for( var propDecl__inx=0,propDecl ; propDecl__inx<PropertiesDeclarationStatements.length ; propDecl__inx++){propDecl=PropertiesDeclarationStatements[propDecl__inx];
             propDecl.produce('this.'); //property assignments
         };// end for each in PropertiesDeclarationStatements
         this.out("};", NL);
       };
       // end if


// b) the methods

// now out methods, which means create functions
// named: class__fnName

       this.out(theMethods);

// c) the instantiation of the jmp table

       this.out(NL, NL, {COMMENT: '' + this.name + '__Methods: Instantiated jmp table'}, NL);
       this.out('struct ', this.name, '__METHODS_t ', this.name, '__METHODS_I = {', NL);
       // for each inx,item in theMethods
       for( var inx=0,item ; inx<theMethods.length ; inx++){item=theMethods[inx];
           this.out('   ', this.name, '__', item.statement.name);
           this.out(inx < theMethods.length - 1 ? ',' : '', NL);
       };// end for each in theMethods
       this.out('};', NL, NL);


// d) the instantiation of the clas info (__CLASS_I), and a const ptr to it

       this.out({COMMENT: '' + this.name + '__CLASS_I: Instantiated class info'}, NL);
       this.out({COMMENT: 'instantiated class info and a const ptr to it'}, NL);
       this.out('struct ', this.name, 't ', this.name, '__CLASS_I = {', NL);
       this.out('   &Class__CLASS_I', ', //type of this object (a class info)', NL);
       this.out('   &' + this.name + '__METHODS_I', ', //call = methods of this class', NL);
       this.out('   "' + this.name + '", //class name', NL);
       this.out('   ' + this.name + '__init, //fn __init', NL);
       this.out('   sizeof(struct ' + this.name + '_t), //each instance memory size', NL);
       this.out('   ' + this.name + '__METHODS_I, //methods jmp table', NL);
       // if .varRefSuper
       if (this.varRefSuper) {
           this.out('    &', this.varRefSuper, ' // super class', NL);
       }
       
       else {
           this.out('    NULL // no super class', NL);
       };
       this.out('};', NL, NL);

       this.out('const Class', NL);
       this.out(' ' + this.name + '__CLASS = &' + this.name + '__CLASS_I;', NL);


// If the class was adjectivated 'export', add to module.exports
//         if not .lexer.out.browser
//           if .export and not .default
//             .out NL,{COMMENT:'export'},NL
//             .out .lexer.out.exportNamespace,'.',.name,' = ', .name,';'
//       

       this.out(NL, {COMMENT: 'end class '}, this.name, NL);
       this.skipSemiColon = true;
     };


   // append to class Grammar.AppendToDeclaration ###

// Any class|object can have properties or methods appended at any time.
// Append-to body contains properties and methods definitions.

     // method produce()
     Grammar.AppendToDeclaration.prototype.produce = function(){
       this.out(this.body);
       this.skipSemiColon = true;
     };


   // append to class Grammar.NamespaceDeclaration ###

// Any class|object can have properties or methods appended at any time.
// Append-to body contains properties and methods definitions.

     // method produce()
     Grammar.NamespaceDeclaration.prototype.produce = function(){
       this.out(!this.varRef.accessors ? 'var ' : '', this.varRef, '={};');
       this.out(this.body);
       this.skipSemiColon = true;
     };

   // append to class Grammar.TryCatch ###

     // method produce()
     Grammar.TryCatch.prototype.produce = function(){

       this.out('try{', this.body, this.exceptionBlock);
     };

   // append to class Grammar.ExceptionBlock ###

     // method produce()
     Grammar.ExceptionBlock.prototype.produce = function(){

       this.out(NL, '}catch(', this.catchVar, '){', this.body, '}');

       // if .finallyBody
       if (this.finallyBody) {
         this.out(NL, 'finally{', this.finallyBody, '}');
       };
     };


   // append to class Grammar.SwitchStatement ###

     // method produce()
     Grammar.SwitchStatement.prototype.produce = function(){

// if we have a varRef, is a switch over a value

       // if .varRef
       if (this.varRef) {

           this.out('switch(', this.varRef, '){', NL, NL);
           // for each switchCase in .cases
           for( var switchCase__inx=0,switchCase ; switchCase__inx<this.cases.length ; switchCase__inx++){switchCase=this.cases[switchCase__inx];
               this.out({pre: 'case ', CSL: switchCase.expressions, post: ':', separator: ' '});
               this.out(switchCase.body);
               switchCase.body.out('break;', NL, NL);
           };// end for each in this.cases

           // if .defaultBody, .out 'default:',.defaultBody
           if (this.defaultBody) {this.out('default:', this.defaultBody)};
           this.out(NL, '}');
       }

// else, it's a swtich over true-expression, we produce as chained if-else
       
       else {

         // for each index,switchCase in .cases
         for( var index=0,switchCase ; index<this.cases.length ; index++){switchCase=this.cases[index];
             this.outLineAsComment(switchCase.lineInx);
             this.out(index > 0 ? 'else ' : '', 'if (');
             this.out({pre: '(', CSL: switchCase.expressions, post: ')', separator: '||'});
             this.out('){');
             this.out(switchCase.body);
             this.out(NL, '}');
         };// end for each in this.cases

         // if .defaultBody, .out NL,'else {',.defaultBody,'}'
         if (this.defaultBody) {this.out(NL, 'else {', this.defaultBody, '}')};
       };
     };


   // append to class Grammar.CaseWhenExpression ###

     // method produce()
     Grammar.CaseWhenExpression.prototype.produce = function(){

// if we have a varRef, is a case over a value

       // if .varRef
       if (this.varRef) {

           var caseVar = ASTBase.getUniqueVarName('caseVar');
           this.out('(function(', caseVar, '){', NL);
           // for each caseWhenSection in .cases
           for( var caseWhenSection__inx=0,caseWhenSection ; caseWhenSection__inx<this.cases.length ; caseWhenSection__inx++){caseWhenSection=this.cases[caseWhenSection__inx];
               caseWhenSection.out('if(', {pre: '' + caseVar + '===(', CSL: caseWhenSection.expressions, post: ')', separator: '||'}, ') return ', caseWhenSection.resultExpression, ';', NL);
           };// end for each in this.cases

           // if .elseExpression, .out '    return ',.elseExpression,';',NL
           if (this.elseExpression) {this.out('    return ', this.elseExpression, ';', NL)};
           this.out('        }(', this.varRef, '))');
       }

// else, it's a var-less case. we code it as chained ternary operators
       
       else {

         // for each caseWhenSection in .cases
         for( var caseWhenSection__inx=0,caseWhenSection ; caseWhenSection__inx<this.cases.length ; caseWhenSection__inx++){caseWhenSection=this.cases[caseWhenSection__inx];
             this.outLineAsComment(caseWhenSection.lineInx);
             caseWhenSection.out('(', caseWhenSection.booleanExpression, ') ? (', caseWhenSection.resultExpression, ') :', NL);
         };// end for each in this.cases

         this.out('/* else */ ', this.elseExpression || 'undefined');
       };
     };


   // append to class Grammar.YieldExpression ###

     // method produce()
     Grammar.YieldExpression.prototype.produce = function(){

// Check location

       // if no .getParent(Grammar.FunctionDeclaration) into var functionDeclaration
       var functionDeclaration=undefined;
       if (!((functionDeclaration=this.getParent(Grammar.FunctionDeclaration))) || !functionDeclaration.nice) {
               this.throwError('"yield" can only be used inside a "nice function/method"');
       };

       var yieldArr = [];

       var varRef = this.fnCall.varRef;
        //from .varRef calculate object owner and method name

       var thisValue = 'null';
       var fnName = varRef.name;// #default if no accessors

       // if varRef.accessors
       if (varRef.accessors) {

           var inx = varRef.accessors.length - 1;
           // if varRef.accessors[inx] instance of Grammar.FunctionAccess
           if (varRef.accessors[inx] instanceof Grammar.FunctionAccess) {
               yieldArr = varRef.accessors[inx].args;
               inx--;
           };

           // if inx>=0
           if (inx >= 0) {
               // if varRef.accessors[inx] isnt instance of Grammar.PropertyAccess
               if (!(varRef.accessors[inx] instanceof Grammar.PropertyAccess)) {
                   this.throwError('yield needs a clear method name. Example: "yield until obj.method(10)". redefine yield parameter.');
               };

               fnName = "'" + (varRef.accessors[inx].name) + "'";
               thisValue = [varRef.name].concat(varRef.accessors.slice(0, inx));
           };
       };


       // if .specifier is 'until'
       if (this.specifier === 'until') {

           yieldArr.unshift(fnName);
           yieldArr.unshift(thisValue);
       }
       
       else {

           yieldArr.push("'map'", this.arrExpression, thisValue, fnName);
       };


       this.out("yield [ ", {CSL: yieldArr}, " ]");
     };



// # Helper functions


// Identifier aliases
// ------------------

// This are a few aliases to most used built-in identifiers:

   var IDENTIFIER_ALIASES = {
     'on': 'true', 
     'off': 'false'
     };

// Utility
// -------

   var NL = '\n';// # New Line constant

// Operator Mapping
// ================

// Many LiteScript operators can be easily mapped one-to-one with their JavaScript equivalents.

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

   // function operTranslate(name:string)
   function operTranslate(name){
     return name.translate(OPER_TRANSLATION);
   };

// ---------------------------------

   // append to class ASTBase

// Helper methods and properties, valid for all nodes

     //      properties skipSemiColon

    // helper method assignIfUndefined(name,value)
    ASTBase.prototype.assignIfUndefined = function(name, value){

          // declare valid value.root.name.name
          // #do nothing if value is 'undefined'
         // if value.root.name.name is 'undefined' #Expression->Operand->VariableRef->name
         if (value.root.name.name === 'undefined') {// #Expression->Operand->VariableRef->name
           this.out(NL, {COMMENT: [name, ": undefined", NL]});
           return;
         };

         this.out(NL, "//TO DO - default for ", name, '=', value, ";");
         this.out(NL, "//if(", name, '===undefined) ', name, "=", value, ";", NL);
    };



// --------------------------------
