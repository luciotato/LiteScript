//Compiled by LiteScript compiler v0.6.7, source: /home/ltato/LiteScript/devel/source/v0.7/Producer_js.lite.md
// Producer JS
// ===========

// The `producer` module extends Grammar classes, adding a `produce()` method
// to generate target code for the node.

// The compiler calls the `.produce()` method of the root 'Module' node
// in order to return the compiled code for the entire tree.

// We extend the Grammar classes, so this module require the `Grammar` module.

   // import ASTBase, Grammar, Environment
   var ASTBase = require('./ASTBase');
   var Grammar = require('./Grammar');
   var Environment = require('./Environment');

// JavaScript Producer Functions
// ==============================

   // append to class Grammar.Module ###

    // method produce()
    Grammar.Module.prototype.produce = function(){

// if a 'export default' was declared, set the referenced namespace
// as the new 'export default' (instead of 'module.exports')

       this.lexer.out.exportNamespace = 'module.exports';

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
           // if .lexer.out.exportNamespace isnt 'module.exports'
           if (this.lexer.out.exportNamespace !== 'module.exports') {
               this.out('module.exports=', this.lexer.out.exportNamespace, ";", NL);
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

       // if .statement isnt instance of Grammar.SingleLineBody
       if (!(this.statement instanceof Grammar.SingleLineBody)) {
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
           this.out("throw new Error(", this.expr, ")");
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
       // if .varRef.executes, return #if varRef already executes, () are not needed
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

// `UnaryOper: ('-'|new|type of|not|no|bitnot) `

// A Unary Oper is an operator acting on a single operand.
// Unary Oper inherits from Oper, so both are `instance of Oper`

// Examples:
// 1) `not`     *boolean negation*     `if not a is b`
// 2) `-`       *numeric unary minus*  `-(4+3)`
// 3) `new`     *instantiation*        `x = new classNumber[2]`
// 4) `type of` *type name access*     `type of x is classNumber[2]`
// 5) `no`      *'falsey' check*       `if no options then options={}`
// 6) `bitnot`  *bit-unary-negation*   `a = bitnot xC0 + 5`

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
               oper = '!==';
           }

// else -if NEGATED- we add `!( )` to the expression
           
           else {
               prepend = "!(";
               append = ")";
           };
       };

// Check for special cases:

// 1) 'in' operator, requires swapping left and right operands and to use `.indexOf(...)>=0`
// example: `x in [1,2,3]` -> `[1,2,3].indexOf(x)>=0`
// example: `x not in [1,2,3]` -> `[1,2,3].indexOf(x)==-1`
// example: `char not in myString` -> `myString.indexOf(char)==-1`
// example (`arguments` pseudo-array): `'lite' not in arguments` -> `Array.prototype.slice.call(arguments).indexOf(char)==-1`

       // if .name is 'in'
       if (this.name === 'in') {
           this.out(this.right, ".indexOf(", this.left, ")", this.negated ? "===-1" : ">=0");
       }

// fix when used on JS built-in array-like `arguments`
//            .lexer.out.currLine = .lexer.out.currLine.replace(/\barguments.indexOf\(/,'Array.prototype.slice.call(arguments).indexOf(')

// 2) *'has property'* operator, requires swapping left and right operands and to use js: `in`
       
       else if (this.name === 'has property') {
           this.out(prepend, this.right, " in ", this.left, append);
       }

// 3) *'into'* operator (assignment-expression), requires swapping left and right operands and to use js: `=`
       
       else if (this.name === 'into') {
           this.out("(", this.right, "=", this.left, ")");
       }

// 4) *'like'* operator (RegExp.test), requires swapping left and right operands and to use js: `.test()`
       
       else if (this.name === 'like') {
           this.out(prepend, this.right, ".test(", this.left, ")", append);
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

       var preIfExported = undefined;

// Prefix ++/--, varName, Accessors and postfix ++/--

       // if .name is 'arguments' //the only thing that can be done with "arguments" is "arguments.toArray()"
       if (this.name === 'arguments') { //the only thing that can be done with "arguments" is "arguments.toArray()"
           this.out('Array.prototype.slice.call(arguments)');
           return;
       };

       // if .name is 'getProperty' //hack access *BOTH* map key/object property - to make portable to-js to-c code
       if (this.name === 'getProperty') { //hack access *BOTH* map key/object property - to make portable to-js to-c code

           // if no .accessors or .accessors.length isnt 1 or .accessors[1].constructor isnt Grammar.FunctionAccess
           if (!this.accessors || this.accessors.length !== 1 || this.accessors[1].constructor !== Grammar.FunctionAccess) {
               this.sayErr("expected onTimeout(milliseconds,function)");
           };
           var fnAccess = this.accessors[1];
           // if fnAccess.args.length isnt 2
           if (fnAccess.args.length !== 2) {
               this.sayErr("expected two arguments: onTimeout(milliseconds,function)");
           };

           this.out("setTimeout(", fnAccess.args[1], fnAccess.args[0], ")"); //call setTimeout, invert parameter order
       }
       
       else {
           var refNameDecl = this.tryGetFromScope(this.name);
           // if no refNameDecl
           if (!refNameDecl) {
               this.sayErr("cannot find '" + this.name + "' in scope");
           }
           
           else {
               // if refNameDecl.isPublic
               if (refNameDecl.isPublic) {
                   preIfExported = 'module.exports.';
               };
           };
       };

// node.js module.exports is a leaky abstractions for exported
// objects other than functions (e.g: Arrays or objects).
// You MUST use always "module.export.varX" and not a local var.

// If you do:

  // var arr=[];
  // module.export.arr = arr;

  // then use arr.push... arr.pop in the module code...

// It'll work fine until a module requirer does:

  // var reqd=require('theModule');
  // reqd.arr = []

// At that point, module.export.arr will point to a different array than
// the internal module var "arr[]", so the module will stop working as intended.

       this.out(this.preIncDec, preIfExported, this.name, this.accessors, this.postIncDec);
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

         this.out("if(!", main, ') ', main, "={};", NL);

         // for each nameValue in objectLiteral.items
         for( var nameValue__inx=0,nameValue ; nameValue__inx<objectLiteral.items.length ; nameValue__inx++){nameValue=objectLiteral.items[nameValue__inx];
           var itemFullName = [main, '.', nameValue.name];
           this.process(itemFullName, nameValue.value);
         };// end for each in objectLiteral.items
         
     };


    // #end helper recursive functions


// -----------
// ## Accessors
// We just defer to JavaScript's built in `.` `[ ]` and `( )` accessors

   // append to class Grammar.PropertyAccess ##
     // method produce()
     Grammar.PropertyAccess.prototype.produce = function(){
       // if .name is 'initInstance'
       if (this.name === 'initInstance') {
           // do nothing  // initInstance is the liteScript unified (C and JS) way to call Class instance Initializator function.
           null; // initInstance is the liteScript unified (C and JS) way to call Class instance Initializator function.
       }
                        // in JS, since Classes are Functions, JS uses the Class-Function as initializator function
       
       else {
           this.out(".", this.name);
       };
     };

   // append to class Grammar.IndexAccess
     // method produce()
     Grammar.IndexAccess.prototype.produce = function(){
       this.out("[", this.name, "]");
     };

   // append to class Grammar.FunctionArgument
     // method produce()
     Grammar.FunctionArgument.prototype.produce = function(){
       this.out(this.expression);
     };

   // append to class Grammar.FunctionAccess
     // method produce()
     Grammar.FunctionAccess.prototype.produce = function(){
       this.out("(", {CSL: this.args}, ")");
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

       var result = [];
       var start = this;

       // while start and start.getParent(Grammar.ClassDeclaration) into var parent
       var parent=undefined;
       while(start && (parent=start.getParent(Grammar.ClassDeclaration))){

           var ownerName = undefined, toPrototype = undefined;

           // if parent instance of Grammar.AppendToDeclaration
           if (parent instanceof Grammar.AppendToDeclaration) {
                // #append to class prototype or object
                // declare parent:Grammar.AppendToDeclaration
               toPrototype = !(parent.toNamespace);
               ownerName = parent.varRef;
               var refNameDecl = parent.varRef.tryGetReference();
               // if refNameDecl and refNameDecl.nodeDeclared instanceof Grammar.ClassDeclaration
               if (refNameDecl && refNameDecl.nodeDeclared instanceof Grammar.ClassDeclaration) {
                   start = refNameDecl.nodeDeclared;
               }
               
               else {
                   start = undefined;
               };
           }
           
           else if (parent instanceof Grammar.NamespaceDeclaration) {
               toPrototype = false;
               ownerName = parent.name;
               start = parent;
           }
           
           else {
               toPrototype = true;
               ownerName = parent.name;
               start = parent;
           };

           result.unshift(ownerName, (toPrototype ? ".prototype." : "."));
       };// end loop

        // #loop

       return result;
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

// 'var' followed by a list of comma separated: var names and optional assignment

     // method produce(prefix)
     Grammar.PropertiesDeclaration.prototype.produce = function(prefix){

       this.outLinesAsComment(this.lineInx, this.lastLineInxOf(this.list));

       // if no prefix, prefix = .getOwnerPrefix()
       if (!prefix) {prefix = this.getOwnerPrefix()};

       // for each varDecl in .list
       for( var varDecl__inx=0,varDecl ; varDecl__inx<this.list.length ; varDecl__inx++){varDecl=this.list[varDecl__inx];
         // if varDecl.assignedValue #is not valid to assign to .prototype. - creates subtle errors later
         if (varDecl.assignedValue) {// #is not valid to assign to .prototype. - creates subtle errors later
           // if prefix instance of Array and prefix[1] and prefix[1] isnt '.', .throwError 'cannot assign values to instance properties in "Append to"'
           if (prefix instanceof Array && prefix[1] && prefix[1] !== '.') {this.throwError('cannot assign values to instance properties in "Append to"')};
           this.out('    ', prefix, varDecl.name, "=", varDecl.assignedValue, ";", NL);
         };
       };// end for each in this.list

       this.skipSemiColon = true;
     };

   // append to class Grammar.VarStatement ###

// 'var' followed by a list of comma separated: var names and optional assignment

     // method produce()
     Grammar.VarStatement.prototype.produce = function(){

       // if .keyword is 'let' and .compilerVar('ES6')
       if (this.keyword === 'let' && this.compilerVar('ES6')) {
         this.out('let ');
       }
       
       else {
         this.out('var ');
       };

// Now, after 'var' or 'let' out one or more comma separated VariableDecl

       this.out({CSL: this.list, freeForm: this.list.length > 2});

// If 'var' was adjectivated 'export', add to exportNamespace

       // if not .lexer.out.browser
       if (!(this.lexer.out.browser)) {

         // if .hasAdjective("export")
         if (this.hasAdjective("export")) {
           this.out(";", NL, {COMMENT: 'export'}, NL);
           // for each varDecl in .list
           for( var varDecl__inx=0,varDecl ; varDecl__inx<this.list.length ; varDecl__inx++){varDecl=this.list[varDecl__inx];
               this.out(this.lexer.out.exportNamespace, '.', varDecl.name, ' = ', varDecl.name, ";", NL);
           };// end for each in this.list
           this.skipSemiColon = true;
         };
       };
     };



   // append to class Grammar.ImportStatementItem ###

     // method produce()
     Grammar.ImportStatementItem.prototype.produce = function(){

       // if .parent.global
       if (this.parent.global) {
           this.out('global.');
       }
       
       else {
           this.out("var ");
       };

       this.out(this.name, " = require('", this.getNodeJSRequireFileRef(), "');", NL);
     };


     // method getNodeJSRequireFileRef()
     Grammar.ImportStatementItem.prototype.getNodeJSRequireFileRef = function(){

// node.js require() require "./" to denote a local module to load.
// it does as bash does for executable files. A name  without ./ means "look in $PATH".
// this is not the most intuitive choice.

       // if '.interface.' in .importedModule.fileInfo.filename or .importedModule.fileInfo.isCore
       if (this.importedModule.fileInfo.filename.indexOf('.interface.')>=0 || this.importedModule.fileInfo.isCore) {
           return this.name; // for node, no './' means "look in node_modules, and up, then global paths"
       };

       var thisModule = this.getParent(Grammar.Module);

// get the required file path, relative to the location of this module (as nodejs's require() requires)

       // if no .importedModule.fileInfo.outRelFilename
       if (!this.importedModule.fileInfo.outRelFilename) {
           console.log(JSON.stringify(this.importedModule.fileInfo));
           console.log(thisModule.fileInfo.dirname);
       };

       var fn = Environment.relName(this.importedModule.fileInfo.outRelFilename, Environment.dirname(thisModule.fileInfo.outRelFilename));

// check for 'import x from 'path/file';

       // if .importParameter and fn[0] is '/' //has `from 'path/file'` AND  is an absolute path
       if (this.importParameter && fn[0] === '/') { //has `from 'path/file'` AND  is an absolute path
           return fn;
       };

// else, a simple 'import x'

       return "./" + fn; // node.js require() require "./" to denote a local module to load
     };


   // append to class Grammar.ImportStatement ###

// 'import' followed by a list of comma separated: var names and optional assignment

     // method produce()
     Grammar.ImportStatement.prototype.produce = function(){
       this.out(this.list); //see:Grammar.ImportStatementItem
       this.skipSemiColon = true; //each item is `var x=require('x');`
     };


   // append to class Grammar.VariableDecl ###

// variable name and optionally assign a value

     // method produce()
     Grammar.VariableDecl.prototype.produce = function(){

// It's a `var` keyword or we're declaring function parameters.
// In any case starts with the variable name

         this.out(this.name);

          // declare valid .keyword

// If this VariableDecl come from a 'var' statement, we force assignment (to avoid subtle bugs,
// in LiteScript, 'var' declaration assigns 'undefined')

         // if .parent instanceof Grammar.VarStatement
         if (this.parent instanceof Grammar.VarStatement) {
             this.out(' = ', this.assignedValue || 'undefined');
         }

// else, this VariableDecl come from function parameters decl,
// if it has AssginedValue, we out assignment if ES6 is available.
// (ES6 implements 'default' for parameters, so `function myFunc(a=3)` is valid in ES6)
         
         else {
           // if .assignedValue and .compilerVar('ES6')
           if (this.assignedValue && this.compilerVar('ES6')) {
               this.out(' = ', this.assignedValue);
           };
         };
     };

    // #end VariableDecl


   // append to class Grammar.SingleLineBody ###

     // method produce(sep=";")
     Grammar.SingleLineBody.prototype.produce = function(sep){if(sep===undefined) sep=";";
       var bare = [];
       // for each statement in .statements
       for( var statement__inx=0,statement ; statement__inx<this.statements.length ; statement__inx++){statement=this.statements[statement__inx];
           bare.push(statement.statement);
       };// end for each in this.statements
       this.out({CSL: bare, separator: sep});
     };

   // append to class Grammar.IfStatement ###

     // method produce()
     Grammar.IfStatement.prototype.produce = function(){

        // declare valid .elseStatement.produce

       // if .body instanceof Grammar.SingleLineBody
       if (this.body instanceof Grammar.SingleLineBody) {
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
       // if iterable
       if (iterable) {
            // declare valid iterable.root.name.hasSideEffects
           // if iterable.operandCount>1 or iterable.root.name.hasSideEffects or iterable.root.name instanceof Grammar.Literal
           if (iterable.operandCount > 1 || iterable.root.name.hasSideEffects || iterable.root.name instanceof Grammar.Literal) {
               iterable = ASTBase.getUniqueVarName('list');// #unique temp iterable var name
               this.out("var ", iterable, "=", this.variant.iterable, ";", NL);
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

         var index = this.indexVar || ASTBase.getUniqueVarName('inx');

         this.out("for ( var ", index, " in ", iterable, ")");
         // if .ownKey
         if (this.ownKey) {
             this.out("if (", iterable, ".hasOwnProperty(", index, "))");
         };

         this.body.out("{", this.mainVar.name, "=", iterable, "[", index, "];", NL);

         this.out(this.where);

         this.body.out("{", this.body, "}", NL);

         this.body.out(NL, "}");

         this.out({COMMENT: "end for each property"}, NL);
     };


   // append to class Grammar.ForEachInArray
// ### Variant 2) 'for each index' to loop over *Array indexes and items*

// `ForEachInArray: for each [index-VariableDecl,]item-VariableDecl in array-VariableRef`

     // method produce(iterable)
     Grammar.ForEachInArray.prototype.produce = function(iterable){

// Create a default index var name if none was provided

       // if .inMap //new syntax "for each in map xx"
       if (this.inMap) { //new syntax "for each in map xx"
           return this.produceInMap(iterable);
       };

       var indexVar = this.indexVar;
       // if no indexVar
       if (!indexVar) {
         indexVar = {name: this.mainVar.name + '__inx', assignedValue: 0};// #default index var name
       };

       this.out("for( var ", indexVar.name, "=", indexVar.assignedValue || "0", ",", this.mainVar.name, " ; ", indexVar.name, "<", iterable, ".length", " ; ", indexVar.name, "++){");

       this.body.out(this.mainVar.name, "=", iterable, "[", indexVar.name, "];", NL);

       // if .where
       if (this.where) {
         this.out('  ', this.where, "{", this.body, "}");
       }
       
       else {
         this.out(this.body);
       };

       this.out("};", {COMMENT: ["end for each in ", this.iterable]}, NL);
     };


// method: produceInMap
// When Map is implemented using js "Object"

     // method produceInMap(iterable)
     Grammar.ForEachInArray.prototype.produceInMap = function(iterable){

         var indexVarName = undefined;
         // if no .indexVar
         if (!this.indexVar) {
           indexVarName = this.mainVar.name + '__propName';
         }
         
         else {
           indexVarName = this.indexVar.name;
         };

         this.out("var ", this.mainVar.name, "=undefined;", NL);
         this.out('if(!', iterable, '.dict) throw(new Error("for each in map: not a Map, no .dict property"));', NL);
         this.out("for ( var ", indexVarName, " in ", iterable, ".dict)");

         // if .mainVar
         if (this.mainVar) {
             this.body.out("{", this.mainVar.name, "=", iterable, ".dict[", indexVarName, "];", NL);
         };

         this.out(this.where);

         this.body.out("{", this.body, "}", NL);

         // if .mainVar
         if (this.mainVar) {
           this.body.out(NL, "}");
         };

         this.out({COMMENT: "end for each property"}, NL);
     };

   // append to class Grammar.ForIndexNumeric
// ### Variant 3) 'for index=...' to create *numeric loops*

// `ForIndexNumeric: for index-VariableDecl "=" start-Expression [,|;] (while|until) condition-Expression [(,|;) increment-Statement]`

// Examples: `for n=0 while n<10`, `for n=0 to 9`
// Handle by using a js/C standard for(;;){} loop

     // method produce(iterable)
     Grammar.ForIndexNumeric.prototype.produce = function(iterable){

       var isToDownTo = undefined;

       // if .conditionPrefix in['to','down']
       if (['to', 'down'].indexOf(this.conditionPrefix)>=0) {

           isToDownTo = true;

// store endExpression in a temp var.
// For loops "to/down to" evaluate end expresion only once

           var endTempVarName = ASTBase.getUniqueVarName('end');
           this.out("var ", endTempVarName, "=", this.endExpression, ";", NL);
       };

       // end if

       this.out("for( var ", this.indexVar.name, "=", this.indexVar.assignedValue || "0", "; ");

       // if isToDownTo
       if (isToDownTo) {

            // #'for n=0 to 10' -> for(n=0;n<=10;n++)
            // #'for n=10 down to 0' -> for(n=10;n>=0;n--)
           this.out(this.indexVar.name, this.conditionPrefix === 'to' ? "<=" : ">=", endTempVarName);
       }
       
       else {

// while|until conditions are evaluated on each loop.
// Produce the condition, negated if the prefix is 'until'.

            // #for n=0, while n<arr.length  -> for(n=0;n<arr.length;...
            // #for n=0, until n >= arr.length  -> for(n=0;!(n>=arr.length);...
           this.endExpression.produce({negated: this.conditionPrefix === 'until'});
       };

       this.out("; ");

// if no increment specified, the default is indexVar++

       // if .increment
       if (this.increment) {
           this.increment.produce(","); //statements separated by ","
       }
       
       else {
            //default index++ (to) or index-- (down to)
           this.out(this.indexVar.name, this.conditionPrefix === 'down' ? '--' : '++');
       };

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

// validate usage inside a for/while

       var nodeASTBase = this.parent;
       // do
       while(true){

           // if .control is 'break' and nodeASTBase is instanceof Grammar.SwitchCase
           if (this.control === 'break' && nodeASTBase instanceof Grammar.SwitchCase) {
               this.sayErr('cannot use "break" from inside a "switch" statement for "historic" reasons');
           }
           
           else if (nodeASTBase instanceof Grammar.FunctionDeclaration) {
                //if we reach function header
               this.sayErr('"{.control}" outside a for|while|do loop');
               // break
               break;
           }
           
           else if (nodeASTBase instanceof Grammar.ForStatement || nodeASTBase instanceof Grammar.DoLoop) {
                   // break //ok, break/continue used inside a loop
                   break; //ok, break/continue used inside a loop
           };

           // end if

           nodeASTBase = nodeASTBase.parent;
       };// end loop

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

   // append to class Grammar.ObjectLiteral ### also FreeObjectLiteral

// A `ObjectLiteral` is an object definition using key/value pairs like `{a:1,b:2}`.
// JavaScript supports this syntax, so we just pass it through.

// A `FreeObjectLiteral` is an object definition using key/value pairs, but in free-form
// (one NameValuePair per line, indented, comma is optional)

     // method produce()
     Grammar.ObjectLiteral.prototype.produce = function(){

         // if .isMap, .out 'new Map().fromObject('
         if (this.isMap) {this.out('new Map().fromObject(')};
         this.out('{', {CSL: this.items, freeForm: this.constructor === Grammar.FreeObjectLiteral}, '}');
         // if .isMap, .out ')'
         if (this.isMap) {this.out(')')};
     };


   // append to class Grammar.FunctionDeclaration ###

// `FunctionDeclaration: '[export][generator] (function|method|constructor) [name] '(' FunctionParameterDecl* ')' Block`

// `FunctionDeclaration`s are function definitions.

// `export` prefix causes the function to be included in `module.exports`
// `generator` prefix marks a 'generator' function that can be paused by `yield` (js/ES6 function*)

    // method produce(prefix:array)
    Grammar.FunctionDeclaration.prototype.produce = function(prefix){

// Generators are implemented in ES6 with the "function*" keyword (note the asterisk)

     var generatorMark = this.generator && this.compilerVar('ES6') ? "*" : "";

     var isConstructor = this instanceof Grammar.ConstructorDeclaration;

     // if this instance of Grammar.MethodDeclaration
     if (this instanceof Grammar.MethodDeclaration) {

          // #get owner where this method belongs to
         // if no prefix
         if (!prefix) {
             // if no .getOwnerPrefix() into prefix
             if (!((prefix=this.getOwnerPrefix()))) {
                 // fail with 'method "#{.name}" Cannot determine owner object'
                 throw new Error('method "' + this.name + '" Cannot determine owner object');
             };
         };

          // #if shim, check before define
         // if .shim, .out "if (!",prefix,.name,")",NL
         if (this.shim) {this.out("if (!", prefix, this.name, ")", NL)};

         // if .definePropItems #we should code Object.defineProperty
         if (this.definePropItems) {// #we should code Object.defineProperty
             prefix[1] = prefix[1].replace(/\.$/, "");// #remove extra dot
             this.out("Object.defineProperty(", NL, prefix, ",'", this.name, "',{value:function", generatorMark);
         }
         
         else {
             this.out(prefix, this.name, " = function", generatorMark);
         };
     }

// else, it is a simple function
     
     else {
         this.out("function ", this.name, generatorMark);
     };

// if 'nice', produce default nice body, and then the generator header for real body

     var isNice = this.nice && !((isConstructor || this.shim || this.definePropItems || this.generator));
     // if isNice
     if (isNice) {
         var argsArray = (this.paramsDeclarations || []).concat["__callback"];
         this.out("(", {CSL: argsArray}, "){", this.getEOLComment(), NL);
         this.out('  nicegen(this, ', prefix, this.name, "_generator, arguments);", NL);
         this.out("};", NL);
         this.out("function* ", prefix, this.name, "_generator");
     };
     // end if

// Produce function parameters declaration

     this.out("(", {CSL: this.paramsDeclarations}, "){", this.getEOLComment());

// now produce function body

     this.produceBody();

// if we were coding .definePropItems , close Object.defineProperty

     // if .definePropItems
     if (this.definePropItems) {
         // for each definePropItem in .definePropItems
         for( var definePropItem__inx=0,definePropItem ; definePropItem__inx<this.definePropItems.length ; definePropItem__inx++){definePropItem=this.definePropItems[definePropItem__inx];
           this.out(NL, ",", definePropItem.name, ":", definePropItem.negated ? 'false' : 'true');
         };// end for each in this.definePropItems
         // end for
         this.out(NL, "})");
     };

// If the function was adjectivated 'export', add to module.exports

     // if not .lexer.out.browser
     if (!(this.lexer.out.browser)) {
       // if .export and not .default
       if (this.export && !(this.default)) {
         this.out(";", NL, {COMMENT: 'export'}, NL);
         this.out(this.lexer.out.exportNamespace, '.', this.name, '=', this.name, ";");
         this.skipSemiColon = true;
       };
     };
    };


    // method produceBody()
    Grammar.FunctionDeclaration.prototype.produceBody = function(){

// if the function has a exception block, insert 'try{'

     // if no .body, .throwError 'function #{.name} has no body'
     if (!this.body) {this.throwError('function ' + this.name + ' has no body')};

// if one-line-function, code now: Example: function square(x) = x*x

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

         // if .paramsDeclarations and not .compilerVar('ES6')
         if (this.paramsDeclarations && !(this.compilerVar('ES6'))) {
             // for each paramDecl in .paramsDeclarations
             for( var paramDecl__inx=0,paramDecl ; paramDecl__inx<this.paramsDeclarations.length ; paramDecl__inx++){paramDecl=this.paramsDeclarations[paramDecl__inx];
               // if paramDecl.assignedValue
               if (paramDecl.assignedValue) {
                   this.body.assignIfUndefined(paramDecl.name, paramDecl.assignedValue);
               };
             };// end for each in this.paramsDeclarations
             
         };
              // #end for
          // #end if

         this.body.produce();
     };

     // end if one-line-function

// close the function, add source map for function default "return undefined" execution point

     this.out("}");
     // if .lexer.out.sourceMap
     if (this.lexer.out.sourceMap) {
         this.lexer.out.sourceMap.add(this.EndFnLineNum, 0, this.lexer.out.lineNum - 1, 0);
     };
    };

// --------------------
   // append to class Grammar.PrintStatement ###
// `print` is an alias for console.log

     // method produce()
     Grammar.PrintStatement.prototype.produce = function(){
       this.out("console.log(", {"CSL": this.args}, ")");
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

       this.outLinesAsComment(this.lineInx, this.names ? this.lastLineInxOf(this.names) : this.lineInx);
       this.skipSemiColon = true;
     };


// ----------------------------
   // append to class Grammar.ClassDeclaration ###

// Classes contain a code block with properties and methods definitions.

     // method produce()
     Grammar.ClassDeclaration.prototype.produce = function(){

       this.out({COMMENT: "constructor"}, NL);

// First, since in JS we have a object-class-function-constructor  all-in-one
// we need to get the class constructor, and separate other class items.

        // declare theConstructor:Grammar.FunctionDeclaration
        // declare valid .produce_AssignObjectProperties
        // declare valid .export

       var theConstructor = null;
       var theMethods = [];
       var theProperties = [];

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
             theProperties.push(item.statement);
           }
           
           else {
             theMethods.push(item);
           };
         };// end for each in this.body.statements
         
       };

        // #end if body

       var prefix = this.getOwnerPrefix();

// js: function-constructor-class-namespace-object (All-in-one)

       this.out("function ", this.name);

       // if theConstructor //there was a constructor body, add specified params
       if (theConstructor) { //there was a constructor body, add specified params
           this.out("(", {CSL: theConstructor.paramsDeclarations}, "){", this.getEOLComment());
       }
       
       else {
           this.out("(){ // default constructor", NL);
       };

// call super-class __init

       // if .varRefSuper
       if (this.varRefSuper) {
           this.out({COMMENT: ["default constructor: call super.constructor"]});
           this.out(NL, "    ", this.varRefSuper, ".prototype.constructor.apply(this,arguments)", NL);
       };

// initialize own properties

       // for each propDecl in theProperties
       for( var propDecl__inx=0,propDecl ; propDecl__inx<theProperties.length ; propDecl__inx++){propDecl=theProperties[propDecl__inx];
           propDecl.produce('this.'); //property assignments
       };// end for each in theProperties

       // if theConstructor //there was a body
       if (theConstructor) { //there was a body
           theConstructor.produceBody();
           this.out(";", NL);
       }
       
       else {
           this.out("};", NL);
       };

// if the class is global...

       // if .hasAdjective('global')
       if (this.hasAdjective('global')) {
           this.out('GLOBAL.', this.name, "=", this.name, ";", NL); //set declared fn-Class as method of GLOBAL
       };

// if the class is inside a namespace...

       // if prefix and prefix.length
       if (prefix && prefix.length) {
           this.out(prefix, this.name, "=", this.name, ";", NL); //set declared fn-Class as method of owner-namespace
       };


// Set super-class if we have one indicated

       // if .varRefSuper
       if (this.varRefSuper) {
         this.out({COMMENT: [this.name, ' (extends|proto is) ', this.varRefSuper, NL]});
         this.out(this.name, '.prototype.__proto__ = ', this.varRefSuper, '.prototype;', NL);
       };

// now out methods, meaning: create properties in the object-function-class prototype

       // for each itemMethodDeclaration in theMethods
       for( var itemMethodDeclaration__inx=0,itemMethodDeclaration ; itemMethodDeclaration__inx<theMethods.length ; itemMethodDeclaration__inx++){itemMethodDeclaration=theMethods[itemMethodDeclaration__inx];
           itemMethodDeclaration.produce(undefined, prefix);
       };// end for each in theMethods

// If the class was adjectivated 'export', add to module.exports

       // if not .lexer.out.browser
       if (!(this.lexer.out.browser)) {
         // if .export and not .default
         if (this.export && !(this.default)) {
           this.out(NL, {COMMENT: 'export'}, NL);
           this.out(this.lexer.out.exportNamespace, '.', this.name, ' = ', this.name, ";");
         };
       };

       this.out(NL, {COMMENT: "end class "}, this.name, NL);
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

       // if .hasAdjective('global')
       if (this.hasAdjective('global')) {
           this.out('GLOBAL.', this.varRef.name, "=", this.varRef.name, ";", NL); //set declared fn-Class as method of GLOBAL
       };

       // if not .lexer.out.browser
       if (!(this.lexer.out.browser)) {
           // if .export and not .default
           if (this.export && !(this.default)) {
               this.out(";", NL, {COMMENT: 'export'}, NL);
               this.out(this.lexer.out.exportNamespace, '.', this.name, '=', this.name, ";");
           };
       };
     };



   // append to class Grammar.TryCatch ###

     // method produce()
     Grammar.TryCatch.prototype.produce = function(){

       this.out("try{", this.body, this.exceptionBlock);
     };

   // append to class Grammar.ExceptionBlock ###

     // method produce()
     Grammar.ExceptionBlock.prototype.produce = function(){

       this.out(NL, "}catch(", this.catchVar, "){", this.body, "}");

       // if .finallyBody
       if (this.finallyBody) {
         this.out(NL, "finally{", this.finallyBody, "}");
       };
     };


   // append to class Grammar.SwitchStatement ###

     // method produce()
     Grammar.SwitchStatement.prototype.produce = function(){

// if we have a varRef, is a switch over a value

       // if .varRef
       if (this.varRef) {

           this.out("switch(", this.varRef, "){", NL, NL);
           // for each switchCase in .cases
           for( var switchCase__inx=0,switchCase ; switchCase__inx<this.cases.length ; switchCase__inx++){switchCase=this.cases[switchCase__inx];
               this.out({pre: "case ", CSL: switchCase.expressions, post: ":", separator: ' '});
               this.out(switchCase.body);
               switchCase.body.out("break;", NL, NL);
           };// end for each in this.cases

           // if .defaultBody, .out "default:",.defaultBody
           if (this.defaultBody) {this.out("default:", this.defaultBody)};
           this.out(NL, "}");
       }

// else, it's a swtich over true-expression, we produce as chained if-else
       
       else {

         // for each index,switchCase in .cases
         for( var index=0,switchCase ; index<this.cases.length ; index++){switchCase=this.cases[index];
             this.outLineAsComment(switchCase.lineInx);
             this.out(index > 0 ? "else " : "", "if (");
             this.out({pre: "(", CSL: switchCase.expressions, post: ")", separator: "||"});
             this.out("){");
             this.out(switchCase.body);
             this.out(NL, "}");
         };// end for each in this.cases

         // if .defaultBody, .out NL,"else {",.defaultBody,"}"
         if (this.defaultBody) {this.out(NL, "else {", this.defaultBody, "}")};
       };
     };


   // append to class Grammar.CaseStatement ###

     // method produce()
     Grammar.CaseStatement.prototype.produce = function(){

// if we have a varRef, is a case over a value

       // if .isInstanceof
       if (this.isInstanceof) {
           return this.produceInstanceOfLoop;
       };

       // for each index,whenSection in .cases
       for( var index=0,whenSection ; index<this.cases.length ; index++){whenSection=this.cases[index];

           this.outLineAsComment(whenSection.lineInx);

           this.out(index > 0 ? 'else ' : '');

           // if .varRef
           if (this.varRef) {
                //case foo...
               this.out('if (', {pre: ['(', this.varRef, '=='], CSL: whenSection.expressions, post: ')', separator: '||', freeForm: 1});
           }
                //case foo...
           
           else {
                //case when TRUE
               this.out('if (', {pre: ['('], CSL: whenSection.expressions, post: ')', separator: '||', freeForm: 1});
           };

           this.out('){', whenSection.body, NL, '}');
       };// end for each in this.cases

// else body

       // if .elseBody, .out NL,'else {',.elseBody,'}'
       if (this.elseBody) {this.out(NL, 'else {', this.elseBody, '}')};
     };


     // method produceInstanceOfLoop
     Grammar.CaseStatement.prototype.produceInstanceOfLoop = function(){

       var tmpVar = ASTBase.getUniqueVarName('class');
       this.out("Class_ptr ", tmpVar, " = ", this.varRef, ".class;", NL, "while(", tmpVar, "){", NL);

       // for each index,whenSection in .cases
       for( var index=0,whenSection ; index<this.cases.length ; index++){whenSection=this.cases[index];

           this.outLineAsComment(whenSection.lineInx);

           whenSection.out(index > 0 ? 'else ' : '', 'if (', {pre: ['(', this.varRef, '.class=='], CSL: whenSection.expressions, post: ')', separator: '||'}, '){', whenSection.body, NL, 'break;', NL, '}');
       };// end for each in this.cases

       // end for

       this.out(tmpVar, '=', tmpVar, '.super;', NL); //move to super
       this.out('}', NL); //close while loooking for super

// else body

       // if .elseBody, .out NL,'if(!tmpVar) {',.elseBody,'}'
       if (this.elseBody) {this.out(NL, 'if(!tmpVar) {', this.elseBody, '}')};
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
     '&': '+', 
     '&=': '+=', 
     'bitand': '&', 
     'bitor': '|', 
     'bitxor': '^', 
     'bitnot': '~', 
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
           this.out({COMMENT: [name, ": undefined", NL]});
           return;
         };

         this.out("if(", name, '===undefined) ', name, "=", value, ";", NL);
    };


// --------------------------------

//# sourceMappingURL=Producer_js.js.map