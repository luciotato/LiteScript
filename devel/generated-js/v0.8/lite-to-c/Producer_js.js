//===========

//The `producer` module extends Grammar classes, adding a `produce()` method
//to generate target code for the node.

//The compiler calls the `.produce()` method of the root 'Module' node
//in order to return the compiled code for the entire tree.

//We extend the Grammar classes, so this module require the `Grammar` module.

    //import ASTBase, Grammar, Environment, UniqueID
    var ASTBase = require('./ASTBase.js');
    var Grammar = require('./Grammar.js');
    var Environment = require('./lib/Environment.js');
    var UniqueID = require('./lib/UniqueID.js');

    //shim import LiteCore
    var LiteCore = require('./interfaces/LiteCore.js');

//JavaScript Producer Functions
//==============================

    //    append to class Grammar.Module ###
    

     //     method produce()
     Grammar.Module.prototype.produce = function(){

//if a 'export default' was declared, set the referenced namespace
//as the new 'export default' (instead of 'module.exports')

        //.lexer.outCode.exportNamespace = 'module.exports'
        this.lexer.outCode.exportNamespace = 'module.exports';


//COMMENTED - reordering statementes in js is destructive
//
//Literate programming should allow to reference a function definde later.
//Leave loose module imperative statements for the last.
//Produce all vars & functions definitions first.
//
//        var looseStatements=[]
//
//        for each statement in .statements
//            statement.produce
//
//            case statement.specific.constructor
//
//                when
//                    Grammar.ImportStatement
//                    Grammar.VarStatement
//                    Grammar.ClassDeclaration
//                    Grammar.FunctionDeclaration
//                    Grammar.NamespaceDeclaration
//                    Grammar.AppendToDeclaration
//                    :
//                        statement.produce
//
//                else
//                    looseStatements.push statement
//
//        var separ = "-"
//        .out
//            {COMMENT: separ.repeat(20)},NL
//            {COMMENT:"Module code"},NL
//            {COMMENT: separ.repeat(20)},NL
//
//        for each statement in looseStatements
//            statement.produce
//
//        //for each statement in produceThird
//        //    statement.produce
//
//        .out
//            NL
//            {COMMENT:'end of module'},NL
//            NL

        //for each statement in .statements
        for( var statement__inx=0,statement ; statement__inx<this.statements.length ; statement__inx++){statement=this.statements[statement__inx];
        
            //statement.produce
            statement.produce();
        };// end for each in this.statements

//add end of file comments

        //.outPreviousComments .lexer.infoLines.length
        this.outPreviousComments(this.lexer.infoLines.length);

//export 'export default' namespace, if it was set.

        //if not .lexer.outCode.browser
        if (!(this.lexer.outCode.browser)) {
        
            //if .exportsReplaced
            if (this.exportsReplaced) {
            
                //.out 'module.exports=',.exports.name,";",NL
                this.out('module.exports=', this.exports.name, ";", NL);
            };
        };
     };


    //    append to class Grammar.Body ### and Module (derives from Body)
    

//A "Body" is an ordered list of statements.

//"Body"s lines have all the same indent, representing a scope.

//"Body"s are used for example, to parse an `if` statement body and `else` body, `for` loops, etc.

      //method produce()
      Grammar.Body.prototype.produce = function(){

        //for each statement in .statements
        for( var statement__inx=0,statement ; statement__inx<this.statements.length ; statement__inx++){statement=this.statements[statement__inx];
        
          //statement.produce()
          statement.produce();
        };// end for each in this.statements

        //.out NL
        this.out(NL);
      };


//-------------------------------------
    //    append to class Grammar.Statement ###
    

//`Statement` objects call their specific statement node's `produce()` method
//after adding any comment lines preceding the statement

      //method produce()
      Grammar.Statement.prototype.produce = function(){

//add preceeding comment lines, in the same position as the source

        //.outPreviousComments
        this.outPreviousComments();

//To enhance compiled code readability, add original Lite line as comment

        //if .lexer.options.comments // and .lexer.outCode.lastOriginalCodeComment<.lineInx
        if (this.lexer.options.comments) {
        

            //var commentTo =  .lastSourceLineNum
            var commentTo = this.lastSourceLineNum;
            //if .specific has property "body"
            if ("body" in this.specific || this.specific instanceof Grammar.IfStatement || this.specific instanceof Grammar.WithStatement || this.specific instanceof Grammar.ForStatement || this.specific instanceof Grammar.CaseStatement) {
            
                    //commentTo =  .sourceLineNum
                    commentTo = this.sourceLineNum;
            };

            //.outSourceLinesAsComment commentTo
            this.outSourceLinesAsComment(commentTo);
        };

            //.lexer.outCode.lastOriginalCodeComment = commentTo

//Each statement in its own line

        //if .specific isnt instance of Grammar.SingleLineBody
        if (!(this.specific instanceof Grammar.SingleLineBody)) {
        
            //.lexer.outCode.ensureNewLine
            this.lexer.outCode.ensureNewLine();
        };

//if there are one or more 'into var x' in a expression in this statement,
//declare vars before statement (exclude body of FunctionDeclaration)

        //this.callOnSubTree "declareIntoVar", Grammar.Body
        this.callOnSubTree("declareIntoVar", Grammar.Body);

//call the specific statement (if,for,print,if,function,class,etc) .produce()

        //var mark = .lexer.outCode.markSourceMap(.indent)
        var mark = this.lexer.outCode.markSourceMap(this.indent);
        //.out .specific
        this.out(this.specific);

//add ";" after the statement
//then EOL comment (if it isnt a multiline statement)
//then NEWLINE

        //if not .specific.skipSemiColon
        if (!(this.specific.skipSemiColon)) {
        
          //.addSourceMap mark
          this.addSourceMap(mark);
          //.out ";"
          this.out(";");
        };
      };
          //if .specific hasnt property "body"
          //  .out .getEOLComment()

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
    //    append to class Grammar.ThrowStatement ###
    

      //method produce()
      Grammar.ThrowStatement.prototype.produce = function(){
          //if .specifier is 'fail'
          if (this.specifier === 'fail') {
          
            //.out "throw new Error(", .expr,")"
            this.out("throw new Error(", this.expr, ")");
          }
          //if .specifier is 'fail'
          
          else {
            //.out "throw ", .expr
            this.out("throw ", this.expr);
          };
      };


    //    append to class Grammar.ReturnStatement ###
    

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


    //    append to class Grammar.FunctionCall ###
    

      //method produce()
      Grammar.FunctionCall.prototype.produce = function(){

        //.varRef.produce()
        this.varRef.produce();
        //if .varRef.executes, return #if varRef already executes, () are not needed
        if (this.varRef.executes) {return};

        //.out "()" #add (), so JS executes the function call
        this.out("()");
      };


    //    append to class Grammar.Operand ###
    

//`Operand:
  //|NumberLiteral|StringLiteral|RegExpLiteral
  //|ParenExpression|ArrayLiteral|ObjectLiteral|FunctionDeclaration
  //|VariableRef

//A `Operand` is the left or right part of a binary oper
//or the only Operand of a unary oper.

      //method produce()
      Grammar.Operand.prototype.produce = function(){

        //.out .name, .accessors
        this.out(this.name, this.accessors);
      };

      //#end Operand


    //    append to class Grammar.UnaryOper ###
    

//`UnaryOper: ('-'|new|type of|not|no|bitnot) `

//A Unary Oper is an operator acting on a single operand.
//Unary Oper inherits from Oper, so both are `instance of Oper`

//Examples:
//1) `not`     *boolean negation*     `if not a is b`
//2) `-`       *numeric unary minus*  `-(4+3)`
//3) `new`     *instantiation*        `x = new classNumber[2]`
//4) `type of` *type name access*     `type of x is classNumber[2]`
//5) `no`      *'falsey' check*       `if no options then options={}`
//6) `bitnot`  *bit-unary-negation*   `a = bitnot xC0 + 5`

      //method produce()
      Grammar.UnaryOper.prototype.produce = function(){

        //var translated = operTranslate(.name)
        var translated = operTranslate(this.name);
        //var prepend,append
        var prepend = undefined, append = undefined;

//if it is "boolean not", add parentheses, because js has a different precedence for "boolean not"
//-(prettier generated code) do not add () for simple "falsey" variable check

        //if translated is "!"
        if (translated === "!") {
        
            //if not (.name is "no" and .right.name instanceof Grammar.VariableRef)
            if (!((this.name === "no" && this.right.name instanceof Grammar.VariableRef))) {
            
                //prepend ="("
                prepend = "(";
                //append=")"
                append = ")";
            };
        }
        //if translated is "!"
        
        else if (translated.charAt(0) >= 'a' && translated.charAt(0) <= 'z') {
        
            //translated &= " "
            translated += " ";
        };

        //.out translated, prepend, .right, append
        this.out(translated, prepend, this.right, append);
      };


    //    append to class Grammar.Oper ###
    

      //method produce()
      Grammar.Oper.prototype.produce = function(){

        //var oper = .name
        var oper = this.name;

//default mechanism to handle 'negated' operand

        //var prepend,append
        var prepend = undefined, append = undefined;
        //if .negated # NEGATED
        if (this.negated) {
        

//if NEGATED and the oper is `is` we convert it to 'isnt'.
//'isnt' will be translated to !==

            //if oper is 'is' # Negated is ---> !==
            if (oper === 'is') {
            
                //oper = '!=='
                oper = '!==';
            }
            //if oper is 'is' # Negated is ---> !==
            
            else {
                //prepend ="!("
                prepend = "!(";
                //append=")"
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
        }
        //if .name is 'in'
        
        else if (this.name === 'has property') {
        
            //.out prepend, .right," in ",.left, append
            this.out(prepend, this.right, " in ", this.left, append);
        }
        //else if .name is 'has property'
        
        else if (this.name === 'into') {
        
            //.out "(",.right,"=",.left,")"
            this.out("(", this.right, "=", this.left, ")");
        }
        //else if .name is 'into'
        
        else if (this.name === 'like') {
        
            //.out prepend,.right,".test(",.left,")",append
            this.out(prepend, this.right, ".test(", this.left, ")", append);
        }
        //else if .name is 'like'
        
        else {
            //.out prepend, .left, ' ', operTranslate(oper), ' ', .right , append
            this.out(prepend, this.left, ' ', operTranslate(oper), ' ', this.right, append);
        };
      };


    //    append to class Grammar.Expression ###
    

      //method produce(negated:boolean)
      Grammar.Expression.prototype.produce = function(negated){

//Produce the expression body, negated if options={negated:true}

        //var prepend=""
        var prepend = "";
        //var append=""
        var append = "";
        //if negated
        if (negated) {
        

//(prettier generated code) Try to avoid unnecessary parens after '!'
//for example: if the expression is a single variable, as in the 'falsey' check:
//Example: `if no options.log then... ` --> `if (!options.log) {...`
//we don't want: `if (!(options.log)) {...`

          //if .operandCount is 1
          if (this.operandCount === 1) {
          
              //#no parens needed
              //prepend = "!"
              prepend = "!";
          }
          //if .operandCount is 1
          
          else {
              //prepend = "!("
              prepend = "!(";
              //append = ")"
              append = ")";
          };
        };
          //#end if
        //#end if negated

//produce the expression body

        //.out prepend, .root, append
        this.out(prepend, this.root, append);
      };


    //    append to class Grammar.VariableRef ###
    

//`VariableRef: ['--'|'++'] IDENTIFIER [Accessors] ['--'|'++']`

//`VariableRef` is a Variable Reference.

 //a VariableRef can include chained 'Accessors', which can:
 //*access a property of the object : `.`-> PropertyAccess `[`->IndexAccess
 //*assume the variable is a function and perform a function call :  `(`-> FunctionAccess

      //method produce()
      Grammar.VariableRef.prototype.produce = function(){

        //var preIfExported
        var preIfExported = undefined;

//Prefix ++/--, varName, Accessors and postfix ++/--

        //if .name is 'arguments' //the only thing that can be done with "arguments" is "arguments.toArray()"
        if (this.name === 'arguments') {
        
            //.out 'Array.prototype.slice.call(arguments)'
            this.out('Array.prototype.slice.call(arguments)');
            //return
            return;
        }
        //if .name is 'arguments' //the only thing that can be done with "arguments" is "arguments.toArray()"
        
        else {
            //var refNameDecl = .tryGetFromScope(.name)
            var refNameDecl = this.tryGetFromScope(this.name);
            //if no refNameDecl
            if (!refNameDecl) {
            
                //.sayErr "cannot find '#{.name}' in scope"
                this.sayErr("cannot find '" + this.name + "' in scope");
            }
            //if no refNameDecl
            
            else {
                //if refNameDecl.isPublicVar
                if (refNameDecl.isPublicVar) {
                
                    //preIfExported='module.exports.'
                    preIfExported = 'module.exports.';
                };
            };
        };

//node.js module.exports is a leaky abstractions for exported
//objects other than functions (e.g: Arrays or objects).
//You MUST use always "module.export.varX" and not a local var.

//If you do:

  //var arr=[];
  //module.export.arr = arr;

  //then use arr.push... arr.pop in the module code...

//It'll work fine until a module requirer does:

  //var reqd=require('theModule');
  //reqd.arr = []

//At that point, module.export.arr will point to a different array than
//the internal module var "arr[]", so the module will stop working as intended.

        //.out .preIncDec, preIfExported, .name, .accessors, .postIncDec
        this.out(this.preIncDec, preIfExported, this.name, this.accessors, this.postIncDec);
      };


    //    append to class Grammar.AssignmentStatement ###
    

      //method produce()
      Grammar.AssignmentStatement.prototype.produce = function(){

        //.out .lvalue, ' ', operTranslate(.name), ' ', .rvalue
        this.out(this.lvalue, ' ', operTranslate(this.name), ' ', this.rvalue);
      };


//-------
    //    append to class Grammar.DefaultAssignment ###
    

      //method produce()
      Grammar.DefaultAssignment.prototype.produce = function(){

        //.process(.assignment.lvalue, .assignment.rvalue)
        this.process(this.assignment.lvalue, this.assignment.rvalue);

        //.skipSemiColon = true
        this.skipSemiColon = true;
      };

//#### helper Functions

      //#recursive duet 1
      //helper method process(name,value)
      Grammar.DefaultAssignment.prototype.process = function(name, value){

//if it is ObjectLiteral: recurse levels, else, a simple 'if undefined, assignment'

//check if it's a ObjectLiteral (level indent)

          //if value instanceof Grammar.ObjectLiteral
          if (value instanceof Grammar.ObjectLiteral) {
          
            //.processItems name, value # recurse Grammar.ObjectLiteral
            this.processItems(name, value);
          }
          //if value instanceof Grammar.ObjectLiteral
          
          else {
            //.assignIfUndefined name, value # Expression
            this.assignIfUndefined(name, value);
          };
      };


      //#recursive duet 2
      //helper method processItems(main, objectLiteral)
      Grammar.DefaultAssignment.prototype.processItems = function(main, objectLiteral){

          //.out "if(!",main,') ',main,"={};",NL
          this.out("if(!", main, ') ', main, "={};", NL);

          //for each nameValue in objectLiteral.items
          for( var nameValue__inx=0,nameValue ; nameValue__inx<objectLiteral.items.length ; nameValue__inx++){nameValue=objectLiteral.items[nameValue__inx];
          
            //var itemFullName = [main,'.',nameValue.name]
            var itemFullName = [main, '.', nameValue.name];
            //.process(itemFullName, nameValue.value)
            this.process(itemFullName, nameValue.value);
          };// end for each in objectLiteral.items
          
      };


    //#end helper recursive functions


//-----------
//## Accessors
//We just defer to JavaScript's built in `.` `[ ]` and `( )` accessors

    //    append to class Grammar.PropertyAccess ##
    
      //method produce()
      Grammar.PropertyAccess.prototype.produce = function(){
        //if .name is 'initInstance'
        if (this.name === 'initInstance') {
        
            //do nothing  // initInstance is the liteScript unified (C and JS) way to call Class instance Initializator function.
            null;
        }
        //if .name is 'initInstance'
        
        else {
            //.out ".",.name
            this.out(".", this.name);
        };
      };

    //    append to class Grammar.IndexAccess
    
      //method produce()
      Grammar.IndexAccess.prototype.produce = function(){
        //.out "[",.name,"]"
        this.out("[", this.name, "]");
      };

    //    append to class Grammar.FunctionArgument
    
      //method produce()
      Grammar.FunctionArgument.prototype.produce = function(){
        //.out .expression
        this.out(this.expression);
      };

    //    append to class Grammar.FunctionAccess
    
      //method produce()
      Grammar.FunctionAccess.prototype.produce = function(){
        //.out "(",{CSL:.args},")"
        this.out("(", {CSL: this.args}, ")");
      };

//-----------

    //    append to class ASTBase
    
     //     helper method lastLineOf(list:ASTBase array)
     ASTBase.prototype.lastLineOf = function(list){

//More Helper methods, get max line of list

        //var lastLine = .sourceLineNum
        var lastLine = this.sourceLineNum;
        //for each item in list
        for( var item__inx=0,item ; item__inx<list.length ; item__inx++){item=list[item__inx];
        
            //if item.sourceLineNum>lastLine
            if (item.sourceLineNum > lastLine) {
            
              //lastLine = item.sourceLineNum
              lastLine = item.sourceLineNum;
            };
        };// end for each in list

        //return lastLine
        return lastLine;
     };


     //     method getOwnerPrefix() returns array
     ASTBase.prototype.getOwnerPrefix = function(){

//check if we're inside a ClassDeclaration or AppendToDeclaration.
//return prefix for item to be appended

        //var result=[]
        var result = [];
        //var start = this
        var start = this;

        //while start and start.getParent(Grammar.ClassDeclaration) into var parent
        var parent=undefined;
        while(start && (parent=start.getParent(Grammar.ClassDeclaration))){

            //var ownerName, toPrototype
            var ownerName = undefined, toPrototype = undefined;

            //if parent instance of Grammar.AppendToDeclaration
            if (parent instanceof Grammar.AppendToDeclaration) {
            
                //#append to class prototype or object
                //declare parent:Grammar.AppendToDeclaration
                
                //toPrototype = not parent.toNamespace
                toPrototype = !(parent.toNamespace);
                //ownerName = parent.varRef
                ownerName = parent.varRef;
                //var refNameDecl  = parent.varRef.tryGetReference()
                var refNameDecl = parent.varRef.tryGetReference();
                //if refNameDecl and refNameDecl.nodeDeclared instanceof Grammar.ClassDeclaration
                if (refNameDecl && refNameDecl.nodeDeclared instanceof Grammar.ClassDeclaration) {
                
                    //start = refNameDecl.nodeDeclared
                    start = refNameDecl.nodeDeclared;
                }
                //if refNameDecl and refNameDecl.nodeDeclared instanceof Grammar.ClassDeclaration
                
                else {
                    //start = undefined
                    start = undefined;
                };
            }
            //if parent instance of Grammar.AppendToDeclaration
            
            else if (parent instanceof Grammar.NamespaceDeclaration) {
            
                //toPrototype = false
                toPrototype = false;
                //ownerName = parent.name
                ownerName = parent.name;
                //start = parent
                start = parent;
            }
            //else if parent instance of Grammar.NamespaceDeclaration
            
            else {
                //toPrototype = true
                toPrototype = true;
                //ownerName = parent.name
                ownerName = parent.name;
                //start = parent
                start = parent;
            };

            //result.unshift ownerName, (toPrototype? ".prototype." else ".")
            result.unshift(ownerName, (toPrototype ? ".prototype." : "."));
        };// end loop

        //#loop

        //return result
        return result;
     };


//---
    //    append to class Grammar.WithStatement ###
    

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
//to js:
//```
//var with__1=frontDoor;
  //with__1.show;
  //with__1.open
  //with__1.show
  //with__1.close
  //with__1.show
//```

      //method produce()
      Grammar.WithStatement.prototype.produce = function(){

        //.out "var ",.name,'=',.varRef,";"
        this.out("var ", this.name, '=', this.varRef, ";");
        //.out .body
        this.out(this.body);

        //.out {COMMENT:"end with #{.name}"}
        this.out({COMMENT: "end with " + this.name});
        //.skipSemiColon = true
        this.skipSemiColon = true;
      };


//---

    //    append to class Grammar.VarDeclList ###
    

//default "produce" for VarDeclList is to out only names, comma separated

      //method produce
      Grammar.VarDeclList.prototype.produce = function(){
        //.out {CSL:.getNames()}
        this.out({CSL: this.getNames()});
      };


    //    append to class Grammar.PropertiesDeclaration ###
    

//'var' followed by a list of comma separated: var names and optional assignment

      //method produce(prefix)
      Grammar.PropertiesDeclaration.prototype.produce = function(prefix){

        //.outSourceLinesAsComment .lastLineOf(.list)
        this.outSourceLinesAsComment(this.lastLineOf(this.list));

        //if no prefix, prefix = .getOwnerPrefix()
        if (!prefix) {prefix = this.getOwnerPrefix()};

        //for each varDecl in .list
        for( var varDecl__inx=0,varDecl ; varDecl__inx<this.list.length ; varDecl__inx++){varDecl=this.list[varDecl__inx];
        
          //if varDecl.assignedValue #is not valid to assign to .prototype. - creates subtle errors later
          if (varDecl.assignedValue) {
          
            //if prefix instance of Array and prefix[1] and prefix[1] isnt '.', .throwError 'cannot assign values to instance properties in "Append to"'
            if (prefix instanceof Array && prefix[1] && prefix[1] !== '.') {this.throwError('cannot assign values to instance properties in "Append to"')};
            //.out '    ',prefix, varDecl.name,"=",varDecl.assignedValue,";",NL
            this.out('    ', prefix, varDecl.name, "=", varDecl.assignedValue, ";", NL);
          };
        };// end for each in this.list

        //.skipSemiColon = true
        this.skipSemiColon = true;
      };

    //    append to class Grammar.VarStatement ###
    

//'var' followed by a list of comma separated: var names and optional assignment

      //method produce()
      Grammar.VarStatement.prototype.produce = function(){

        //declare valid .compilerVar
        
        //declare valid .export
        

        //if .keyword is 'let' and .compilerVar('ES6')
        if (this.keyword === 'let' && this.compilerVar('ES6')) {
        
          //.out 'let '
          this.out('let ');
        }
        //if .keyword is 'let' and .compilerVar('ES6')
        
        else {
          //.out 'var '
          this.out('var ');
        };

//Now, after 'var' or 'let' out one or more comma separated VariableDecl

        //.out {CSL:.list, freeForm:.list.length>2}
        this.out({CSL: this.list, freeForm: this.list.length > 2});

//If 'var' was adjectivated 'export', add all vars to exportNamespace

        //if not .lexer.outCode.browser
        if (!(this.lexer.outCode.browser)) {
        
            //if .hasAdjective('export')
            if (this.hasAdjective('export')) {
            
                //.out ";", NL,{COMMENT:'export'},NL
                this.out(";", NL, {COMMENT: 'export'}, NL);
                //for each varDecl in .list
                for( var varDecl__inx=0,varDecl ; varDecl__inx<this.list.length ; varDecl__inx++){varDecl=this.list[varDecl__inx];
                
                    //.out 'module.exports.',varDecl.name,' = ', varDecl.name, ";", NL
                    this.out('module.exports.', varDecl.name, ' = ', varDecl.name, ";", NL);
                };// end for each in this.list
                //.skipSemiColon = true
                this.skipSemiColon = true;
            };
        };
      };


    //    append to class Grammar.ImportStatementItem ###
    

      //method produce()
      Grammar.ImportStatementItem.prototype.produce = function(){
        //.out "var ",.name," = require('", .getNodeJSRequireFileRef(),"');", NL
        this.out("var ", this.name, " = require('", this.getNodeJSRequireFileRef(), "');", NL);
      };


      //method getNodeJSRequireFileRef()
      Grammar.ImportStatementItem.prototype.getNodeJSRequireFileRef = function(){

//node.js require() use "./" to denote a local module to load.
//It does as bash does for executable files.
//A name  without "./"" means "look in $PATH" (node_modules and up)

        //if no .importedModule or .importedModule.fileInfo.isCore or '.interface.' in .importedModule.fileInfo.filename
        if (!this.importedModule || this.importedModule.fileInfo.isCore || this.importedModule.fileInfo.filename.indexOf('.interface.')>=0) {
        
            //return .name // for node, no './' means "look in node_modules, and up, then global paths"
            return this.name;
        };

        //var thisModule = .getParent(Grammar.Module)
        var thisModule = this.getParent(Grammar.Module);

//get the required file path, relative to the location of this module (as nodejs's require() requires)

        //#debug
        //#if no .importedModule.fileInfo.outRelFilename
        //#print "thisModule.fileInfo.outRelFilename",thisModule.fileInfo.outFilename
        //#print  ".importedModule.fileInfo.outRelFilename",.importedModule.fileInfo.outFilename

        //var fn = Environment.relativeFrom(Environment.getDir(thisModule.fileInfo.outFilename)
                                            //,.importedModule.fileInfo.outFilename);
        var fn = Environment.relativeFrom(Environment.getDir(thisModule.fileInfo.outFilename), this.importedModule.fileInfo.outFilename);

//check for 'import x from 'path/file';

        //if .importParameter and fn.charAt(0) is '/' //has `from 'path/file'` AND  is an absolute path
        if (this.importParameter && fn.charAt(0) === '/') {
        
            //return fn
            return fn;
        };

//else, a simple 'import x'

        //return "./#{fn}"; // node.js require() use "./" to denote a local module to load
        return "./" + fn;
      };


    //    append to class Grammar.ImportStatement ###
    

//'import' followed by a list of comma separated: var names and optional assignment

      //method produce()
      Grammar.ImportStatement.prototype.produce = function(){
        //.out .list //see:Grammar.ImportStatementItem
        this.out(this.list);
        //.skipSemiColon = true //each item is `var x=require('x');`
        this.skipSemiColon = true;
      };


    //    append to class Grammar.VariableDecl ###
    

//variable name and optionally assign a value

      //method produce()
      Grammar.VariableDecl.prototype.produce = function(){

//It's a `var` keyword or we're declaring function parameters.
//In any case starts with the variable name

          //.out .name
          this.out(this.name);

          //declare valid .keyword
          

//If this VariableDecl come from a 'var' statement, we force assignment (to avoid subtle bugs,
//in LiteScript, 'var' declaration assigns 'undefined')

          //if .parent instanceof Grammar.VarStatement
          if (this.parent instanceof Grammar.VarStatement) {
          
              //.out ' = ',.assignedValue or 'undefined'
              this.out(' = ', this.assignedValue || 'undefined');
          }
          //if .parent instanceof Grammar.VarStatement
          
          else {
            //if .assignedValue and .lexer.project.compilerVar('ES6')
            if (this.assignedValue && this.lexer.project.compilerVar('ES6')) {
            
                //.out ' = ',.assignedValue
                this.out(' = ', this.assignedValue);
            };
          };
      };

    //#end VariableDecl


    //    append to class Grammar.SingleLineBody ###
    

      //method produce()
      Grammar.SingleLineBody.prototype.produce = function(){
        //var bare=[]
        var bare = [];
        //for each statement in .statements
        for( var statement__inx=0,statement ; statement__inx<this.statements.length ; statement__inx++){statement=this.statements[statement__inx];
        
            //bare.push statement.specific
            bare.push(statement.specific);
        };// end for each in this.statements
        //.out {CSL:bare, separator:","}
        this.out({CSL: bare, separator: ","});
      };

    //    append to class Grammar.IfStatement ###
    

      //method produce()
      Grammar.IfStatement.prototype.produce = function(){

        //declare valid .elseStatement.produce
        

        //if .body instanceof Grammar.SingleLineBody
        if (this.body instanceof Grammar.SingleLineBody) {
        
            //.out "if (", .conditional,") {",.body,"}"
            this.out("if (", this.conditional, ") {", this.body, "}");
        }
        //if .body instanceof Grammar.SingleLineBody
        
        else {
            //.out "if (", .conditional, ") {", NL // .getEOLComment()
            this.out("if (", this.conditional, ") {", NL);
            //.out  .body, "}"
            this.out(this.body, "}");
        };

        //if .elseStatement
        if (this.elseStatement) {
        
            //.outSourceLinesAsComment
            this.outSourceLinesAsComment();
            //.elseStatement.produce()
            this.elseStatement.produce();
        };
      };


    //    append to class Grammar.ElseIfStatement ###
    

      //method produce()
      Grammar.ElseIfStatement.prototype.produce = function(){

        //.out NL,"else ", .nextIf
        this.out(NL, "else ", this.nextIf);
      };

    //    append to class Grammar.ElseStatement ###
    

      //method produce()
      Grammar.ElseStatement.prototype.produce = function(){

        //.out NL,"else {", .body, "}"
        this.out(NL, "else {", this.body, "}");
      };

    //    append to class Grammar.ForStatement ###
    

//There are 3 variants of `ForStatement` in LiteScript

      //method produce()
      Grammar.ForStatement.prototype.produce = function(){

        //.variant.produce()
        this.variant.produce();

//Since al 3 cases are closed with '}; //comment', we skip statement semicolon

        //.skipSemiColon = true
        this.skipSemiColon = true;
      };

//Pre-For code. If required, store the iterable in a temp var.
//(prettier generated code)
//Only do it if the iterable is a complex expression, if it can have side-effects or it's a literal.
//We create a temp var to assign the iterable expression to

    //Append to class Grammar.Expression
    

      //method prepareTempVar() returns string
      Grammar.Expression.prototype.prepareTempVar = function(){

        //declare .root.name: Grammar.VariableRef
        

        //if .operandCount>1 or .root.name.hasSideEffects or .root.name instanceof Grammar.Literal
        if (this.operandCount > 1 || this.root.name.hasSideEffects || this.root.name instanceof Grammar.Literal) {
        
            //var tempVarIterable = UniqueID.getVarName('list')  #unique temp iterable var name
            var tempVarIterable = UniqueID.getVarName('list');
            //.out "var ",tempVarIterable,"=",this,";",NL
            this.out("var ", tempVarIterable, "=", this, ";", NL);
            //return tempVarIterable
            return tempVarIterable;
        };

        //return this
        return this;
      };


    //    append to class Grammar.ForEachProperty
    
//### Variant 1) 'for each property' to loop over *object property names*

//`ForEachProperty: for each [own] property name-VariableDecl in object-VariableRef`

      //method produce()
      Grammar.ForEachProperty.prototype.produce = function(){

          //var iterable = .iterable.prepareTempVar()
          var iterable = this.iterable.prepareTempVar();

          //if .valueVar
          if (this.valueVar) {
          
            //.out "var ", .valueVar.name,"=undefined;",NL
            this.out("var ", this.valueVar.name, "=undefined;", NL);
          };

          //var index=.keyIndexVar or UniqueID.getVarName('inx');
          var index = this.keyIndexVar || UniqueID.getVarName('inx');

          //.out "for ( var ", index, " in ", iterable, ")"
          this.out("for ( var ", index, " in ", iterable, ")");

          //if .ownKey
          if (this.ownKey) {
          
              //.out "if (",iterable,".hasOwnProperty(",index,"))"
              this.out("if (", iterable, ".hasOwnProperty(", index, "))");
          };

          //.body.out "{", .valueVar.name,"=",iterable,"[",index,"];",NL
          this.body.out("{", this.valueVar.name, "=", iterable, "[", index, "];", NL);

          //.out .where
          this.out(this.where);

          //.body.out "{", .body, "}",NL
          this.body.out("{", this.body, "}", NL);

          //.body.out NL, "}"
          this.body.out(NL, "}");

          //.out {COMMENT:"end for each property"},NL
          this.out({COMMENT: "end for each property"}, NL);
      };


    //    append to class Grammar.ForEachInArray
    
//### Variant 2) 'for each index' to loop over *Array indexes and items*

//`ForEachInArray: for each [index-VariableDecl,]item-VariableDecl in array-VariableRef`

      //method produce()
      Grammar.ForEachInArray.prototype.produce = function(){

        //var iterable = .iterable.prepareTempVar()
        var iterable = this.iterable.prepareTempVar();

        //if .isMap //new syntax "for each in map xx"
        if (this.isMap) {
        
            //return .produceInMap(iterable)
            return this.produceInMap(iterable);
        };

//Create a default index var name if none was provided

        //var indexVarName, startValue
        var indexVarName = undefined, startValue = undefined;

        //if no .keyIndexVar
        if (!this.keyIndexVar) {
        
            //indexVarName = .valueVar.name & '__inx'  #default index var name
            indexVarName = this.valueVar.name + '__inx';
            //startValue = "0"
            startValue = "0";
        }
        //if no .keyIndexVar
        
        else {
            //indexVarName = .keyIndexVar.name
            indexVarName = this.keyIndexVar.name;
            //startValue = .keyIndexVar.assignedValue or "0"
            startValue = this.keyIndexVar.assignedValue || "0";
        };

        //.out "for( var "
                //, indexVarName,"=",startValue,",",.valueVar.name
                //," ; ",indexVarName,"<",iterable,".length"
                //," ; ",indexVarName,"++){"
        this.out("for( var ", indexVarName, "=", startValue, ",", this.valueVar.name, " ; ", indexVarName, "<", iterable, ".length", " ; ", indexVarName, "++){");

        //.body.out .valueVar.name,"=",iterable,"[",indexVarName,"];",NL
        this.body.out(this.valueVar.name, "=", iterable, "[", indexVarName, "];", NL);

        //if .where
        if (this.where) {
        
          //.out '  ',.where,"{",.body,"}"
          this.out('  ', this.where, "{", this.body, "}");
        }
        //if .where
        
        else {
          //.out .body
          this.out(this.body);
        };

        //.out "};",{COMMENT:["end for each in ",.iterable]},NL
        this.out("};", {COMMENT: ["end for each in ", this.iterable]}, NL);
      };


//method: produceInMap
//When Map is implemented using js "Object"

      //method produceInMap(iterable)
      Grammar.ForEachInArray.prototype.produceInMap = function(iterable){

          //var indexVarName:string
          var indexVarName = undefined;
          //if no .keyIndexVar
          if (!this.keyIndexVar) {
          
            //indexVarName = .valueVar.name & '__propName'
            indexVarName = this.valueVar.name + '__propName';
          }
          //if no .keyIndexVar
          
          else {
            //indexVarName = .keyIndexVar.name
            indexVarName = this.keyIndexVar.name;
          };

          //.out "var ", .valueVar.name,"=undefined;",NL
          this.out("var ", this.valueVar.name, "=undefined;", NL);
          //.out 'if(!',iterable,'.dict) throw(new Error("for each in map: not a Map, no .dict property"));',NL
          this.out('if(!', iterable, '.dict) throw(new Error("for each in map: not a Map, no .dict property"));', NL);
          //.out "for ( var ", indexVarName, " in ", iterable, ".dict)"
          this.out("for ( var ", indexVarName, " in ", iterable, ".dict)");

          //if .valueVar
          if (this.valueVar) {
          
              //.body.out "{", .valueVar.name,"=",iterable,".dict[",indexVarName,"];",NL
              this.body.out("{", this.valueVar.name, "=", iterable, ".dict[", indexVarName, "];", NL);
          };

          //.out .where
          this.out(this.where);

          //.body.out "{", .body, "}",NL
          this.body.out("{", this.body, "}", NL);

          //if .valueVar
          if (this.valueVar) {
          
            //.body.out NL, "}"
            this.body.out(NL, "}");
          };

          //.out {COMMENT:"end for each property"},NL
          this.out({COMMENT: "end for each property"}, NL);
      };

    //    append to class Grammar.ForIndexNumeric
    
//### Variant 3) 'for index=...' to create *numeric loops*

//`ForIndexNumeric: for index-VariableDecl "=" start-Expression [,|;] (while|until) condition-Expression [(,|;) increment-Statement]`

//Examples: `for n=0 while n<10`, `for n=0 to 9`
//Handle by using a js/C standard for(;;){} loop

      //method produce()
      Grammar.ForIndexNumeric.prototype.produce = function(){

        //var isToDownTo: boolean
        var isToDownTo = undefined;
        //var endTempVarName
        var endTempVarName = undefined;

        //if .conditionPrefix in['to','down']
        if (['to', 'down'].indexOf(this.conditionPrefix)>=0) {
        

            //isToDownTo= true
            isToDownTo = true;

//store endExpression in a temp var.
//For loops "to/down to" evaluate end expresion only once

            //endTempVarName = UniqueID.getVarName('end')
            endTempVarName = UniqueID.getVarName('end');
            //.out "var ",endTempVarName,"=",.endExpression,";",NL
            this.out("var ", endTempVarName, "=", this.endExpression, ";", NL);
        };

        //end if

        //.out "for( var ",.keyIndexVar.name, "=", .keyIndexVar.assignedValue or "0", "; "
        

        //.out "for( var ",.keyIndexVar.name, "=", .keyIndexVar.assignedValue or "0", "; "
        this.out("for( var ", this.keyIndexVar.name, "=", this.keyIndexVar.assignedValue || "0", "; ");

        //if isToDownTo
        if (isToDownTo) {
        

            //#'for n=0 to 10' -> for(n=0;n<=10;n++)
            //#'for n=10 down to 0' -> for(n=10;n>=0;n--)
            //.out .keyIndexVar.name, .conditionPrefix is 'to'? "<=" else ">=", endTempVarName
            this.out(this.keyIndexVar.name, this.conditionPrefix === 'to' ? "<=" : ">=", endTempVarName);
        }
        //if isToDownTo
        
        else {

//while|until conditions are evaluated on each loop.
//Produce the condition, negated if the prefix is 'until'.

            //#for n=0, while n<arr.length  -> for(n=0;n<arr.length;...
            //#for n=0, until n >= arr.length  -> for(n=0;!(n>=arr.length);...
            //.endExpression.produce( negated = .conditionPrefix is 'until' )
            this.endExpression.produce(this.conditionPrefix === 'until');
        };

        //.out "; "
        this.out("; ");

//if no increment specified, the default is keyIndexVar++

        //if .increment
        if (this.increment) {
        
            //.out .increment //statements separated by ","
            this.out(this.increment);
        }
        //if .increment
        
        else {
            //default index++ (to) or index-- (down to)
            //.out .keyIndexVar.name, .conditionPrefix is 'down'? '--' else '++'
            this.out(this.keyIndexVar.name, this.conditionPrefix === 'down' ? '--' : '++');
        };

        //.out ") "
        this.out(") ");

        //.out "{", .body, "};",{COMMENT:"end for #{.keyIndexVar.name}"}, NL
        this.out("{", this.body, "};", {COMMENT: "end for " + this.keyIndexVar.name}, NL);
      };



    //    append to class Grammar.ForWhereFilter
    
//### Helper for where filter
//`ForWhereFilter: [where Expression]`

      //method produce()
      Grammar.ForWhereFilter.prototype.produce = function(){
        //.out 'if(',.filterExpression,')'
        this.out('if(', this.filterExpression, ')');
      };

    //    append to class Grammar.DeleteStatement
    
//`DeleteStatement: delete VariableRef`

      //method produce()
      Grammar.DeleteStatement.prototype.produce = function(){
        //.out 'delete ',.varRef
        this.out('delete ', this.varRef);
      };

    //    append to class Grammar.WhileUntilExpression ###
    

      //method produce(askFor:string, negated:boolean)
      Grammar.WhileUntilExpression.prototype.produce = function(askFor, negated){

//If the parent ask for a 'while' condition, but this is a 'until' condition,
//or the parent ask for a 'until' condition and this is 'while', we must *negate* the condition.

        //if askFor and .name isnt askFor
        if (askFor && this.name !== askFor) {
        
            //negated = true
            negated = true;
        };

//*askFor* is used when the source code was, for example,
//`do until Expression` and we need to code: `while(!(Expression))`
//or the code was `loop while Expression` and we need to code: `if (!(Expression)) break`

//when you have a `until` condition, you need to negate the expression
//to produce a `while` condition. (`while NOT x` is equivalent to `until x`)

        //.expr.produce negated
        this.expr.produce(negated);
      };


    //    append to class Grammar.DoLoop ###
    

      //method produce()
      Grammar.DoLoop.prototype.produce = function(){

//Note: **WhileUntilLoop** symbol has **DoLoop** as *prototype*, so this *.produce()* method
//is used by both symbols.

        //if .postWhileUntilExpression
        if (this.postWhileUntilExpression) {
        

//if we have a post-condition, for example: `do ... loop while x>0`,

            //.out "do{",NL // .getEOLComment()
            this.out("do{", NL);
            //.out .body
            this.out(this.body);
            //.out "} while ("
            this.out("} while (");
            //.postWhileUntilExpression.produce(askFor='while')
            this.postWhileUntilExpression.produce('while');
            //.out ")"
            this.out(")");
        }
        //if .postWhileUntilExpression
        
        else {

            //.out 'while('
            this.out('while(');
            //if .preWhileUntilExpression
            if (this.preWhileUntilExpression) {
            
              //.preWhileUntilExpression.produce(askFor='while')
              this.preWhileUntilExpression.produce('while');
            }
            //if .preWhileUntilExpression
            
            else {
              //.out 'true'
              this.out('true');
            };
            //.out '){', .body , "}"
            this.out('){', this.body, "}");
        };

        //end if

        //.out ";",{COMMENT:"end loop"},NL
        

        //.out ";",{COMMENT:"end loop"},NL
        this.out(";", {COMMENT: "end loop"}, NL);
        //.skipSemiColon = true
        this.skipSemiColon = true;
      };

    //    append to class Grammar.LoopControlStatement ###
    
//This is a very simple produce() to allow us to use the `break` and `continue` keywords.

      //method produce()
      Grammar.LoopControlStatement.prototype.produce = function(){

//validate usage inside a for/while

        //var nodeASTBase = this.parent
        var nodeASTBase = this.parent;
        //do
        while(true){

            //if nodeASTBase is instanceof Grammar.FunctionDeclaration
            if (nodeASTBase instanceof Grammar.FunctionDeclaration) {
            
                //if we reach function header
                //.sayErr '"{.control}" outside a for|while|do loop'
                this.sayErr('"{.control}" outside a for|while|do loop');
                //break
                break;
            }
            //if nodeASTBase is instanceof Grammar.FunctionDeclaration
            
            else if (nodeASTBase instanceof Grammar.ForStatement || nodeASTBase instanceof Grammar.DoLoop) {
            
                    //break //ok, break/continue used inside a loop
                    break;
            };

            //end if

            //nodeASTBase = nodeASTBase.parent
            

            //nodeASTBase = nodeASTBase.parent
            nodeASTBase = nodeASTBase.parent;
        };// end loop

        //.out .control
        this.out(this.control);
      };

    //    append to class Grammar.DoNothingStatement ###
    

      //method produce()
      Grammar.DoNothingStatement.prototype.produce = function(){
        //.out "null"
        this.out("null");
      };

    //    append to class Grammar.ParenExpression ###
    

//A `ParenExpression` is just a normal expression surrounded by parentheses.

      //method produce()
      Grammar.ParenExpression.prototype.produce = function(){
        //.out "(",.expr,")"
        this.out("(", this.expr, ")");
      };

    //    append to class Grammar.ArrayLiteral ###
    

//A `ArrayLiteral` is a definition of a list like `[1, a, 2+3]`. We just pass this through to JavaScript.

      //method produce()
      Grammar.ArrayLiteral.prototype.produce = function(){
        //.out "[",{CSL:.items},"]"
        this.out("[", {CSL: this.items}, "]");
      };

    //    append to class Grammar.NameValuePair ###
    

//A `NameValuePair` is a single item in an object definition. Since we copy js for this, we pass this straight through

      //method produce()
      Grammar.NameValuePair.prototype.produce = function(){
        //.out .name,": ",.value
        this.out(this.name, ": ", this.value);
      };

    //    append to class Grammar.ObjectLiteral ### also FreeObjectLiteral
    

//A `ObjectLiteral` is an object definition using key/value pairs like `{a:1,b:2}`.
//JavaScript supports this syntax, so we just pass it through.

//A `FreeObjectLiteral` is an object definition using key/value pairs, but in free-form
//(one NameValuePair per line, indented, comma is optional)

      //method produce()
      Grammar.ObjectLiteral.prototype.produce = function(){

          //if .parent.constructor is Grammar.Operand
          if (this.parent.constructor === Grammar.Operand) {
          
              //if .parent.parent.isMap //expression has isMap set
              if (this.parent.parent.isMap) {
              
                  //.isMap = true
                  this.isMap = true;
              };
          };

          //if .isMap, .out 'new Map().fromObject('
          if (this.isMap) {this.out('new Map().fromObject(')};
          //.out '{',{CSL:.items, freeForm:.constructor is Grammar.FreeObjectLiteral },'}'
          this.out('{', {CSL: this.items, freeForm: this.constructor === Grammar.FreeObjectLiteral}, '}');
          //if .isMap, .out ')'
          if (this.isMap) {this.out(')')};
      };


    //    append to class Grammar.FunctionDeclaration ###
    

//`FunctionDeclaration: '[export][generator] (function|method|constructor) [name] FunctionParameters (["=" Expression]|Body)`

//`FunctionDeclaration`s are function definitions.

//`export` prefix causes the function to be included in `module.exports`
//`generator` prefix marks a 'generator' function that can be paused by `yield` (js/ES6 function*)

     //method produce(prefix:array)
     Grammar.FunctionDeclaration.prototype.produce = function(prefix){

      //var isConstructor = this instance of Grammar.ConstructorDeclaration
      var isConstructor = this instanceof Grammar.ConstructorDeclaration;

      //Generators are implemented in ES6 with the "function*" keyword (note the asterisk)
      //var generatorMark = .hasAdjective("generator") and .lexer.project.compilerVar('ES6')? "*" else ""
      var generatorMark = this.hasAdjective("generator") && this.lexer.project.compilerVar('ES6') ? "*" : "";

      //if this instance of Grammar.MethodDeclaration
      if (this instanceof Grammar.MethodDeclaration) {
      

          //#get owner where this method belongs to
          //if no prefix
          if (!prefix) {
          
              //if no .getOwnerPrefix() into prefix
              if (!((prefix=this.getOwnerPrefix()))) {
              
                  //fail with 'method "#{.name}" Cannot determine owner object'
                  throw new Error('method "' + this.name + '" Cannot determine owner object');
              };
          };

          //var ownerName:string = prefix.join("")
          var ownerName = prefix.join("");
          //if ownerName.slice(-1) is '.', ownerName = ownerName.slice(0,-1)
          if (ownerName.slice(-1) === '.') {ownerName = ownerName.slice(0, -1)};

          //#if shim, check before define
          //if .hasAdjective("shim"), .out "if (!Object.prototype.hasOwnProperty.call(",ownerName,",'",.name,"'))",NL
          if (this.hasAdjective("shim")) {this.out("if (!Object.prototype.hasOwnProperty.call(", ownerName, ",'", this.name, "'))", NL)};

          //if .definePropItems #we should code Object.defineProperty
          if (this.definePropItems) {
          
              //.out "Object.defineProperty(",NL,
                    //ownerName, ",'",.name,"',{value:function",generatorMark
              this.out("Object.defineProperty(", NL, ownerName, ",'", this.name, "',{value:function", generatorMark);
          }
          //if .definePropItems #we should code Object.defineProperty
          
          else {
              //.out prefix,.name," = function",generatorMark
              this.out(prefix, this.name, " = function", generatorMark);
          };
      }
      //if this instance of Grammar.MethodDeclaration
      
      else {
          //.out "function ",.name, generatorMark
          this.out("function ", this.name, generatorMark);
      };

//if 'nice', produce default nice body, and then the generator header for real body

      //var isNice = .hasAdjective("nice") and not (isConstructor or .hasAdjective("shim") or .definePropItems or .hasAdjective("generator"))
      var isNice = this.hasAdjective("nice") && !((isConstructor || this.hasAdjective("shim") || this.definePropItems || this.hasAdjective("generator")));
      //if isNice
      if (isNice) {
      
          //.out "("
          this.out("(");
          //if .paramsDeclarations, .out .paramsDeclarations,","
          if (this.paramsDeclarations) {this.out(this.paramsDeclarations, ",")};
          //.out "__callback){", NL
          this.out("__callback){", NL);
          //.out '  nicegen.run(this, ',prefix,.name,"_generator, arguments);",NL
          this.out('  nicegen.run(this, ', prefix, this.name, "_generator, arguments);", NL);
          //.out "};",NL
          this.out("};", NL);
          //.out "function* ",prefix,.name,"_generator"
          this.out("function* ", prefix, this.name, "_generator");
      };
      //end if

//Produce function parameters declaration

      //.out "(", .paramsDeclarations, "){", NL //.getEOLComment()
      

//Produce function parameters declaration

      //.out "(", .paramsDeclarations, "){", NL //.getEOLComment()
      this.out("(", this.paramsDeclarations, "){", NL);

//now produce function body

      //.produceBody
      this.produceBody();

//if we were coding .definePropItems , close Object.defineProperty

      //if .definePropItems
      if (this.definePropItems) {
      
          //for each definePropItem in .definePropItems
          for( var definePropItem__inx=0,definePropItem ; definePropItem__inx<this.definePropItems.length ; definePropItem__inx++){definePropItem=this.definePropItems[definePropItem__inx];
          
            //.out NL,",",definePropItem.name,":", definePropItem.negated? 'false':'true'
            this.out(NL, ",", definePropItem.name, ":", definePropItem.negated ? 'false' : 'true');
          };// end for each in this.definePropItems
          //end for
          //.out NL,"})"
          
          //.out NL,"})"
          this.out(NL, "})");
      };

//If the function was adjectivated 'export', add to module.exports

      //.produceExport .name
      this.produceExport(this.name);
     };


     //     method produceBody()
     Grammar.FunctionDeclaration.prototype.produceBody = function(){

//if the function has a exception block, insert 'try{'

      //if no .body or no .body.statements //interface function?
      if (!this.body || !this.body.statements) {
      
            //.throwError 'function #{.name} from #{.lexer.filename} has no body'
            this.throwError('function ' + this.name + ' from ' + this.lexer.filename + ' has no body');
      };

//if one-line-function, code now: Example: function square(x) = x*x

      //if .body instance of Grammar.Expression
      if (this.body instanceof Grammar.Expression) {
      
          //.out "return ", .body
          this.out("return ", this.body);
      }
      //if .body instance of Grammar.Expression
      
      else {

//if it has a "catch" or "exception", insert 'try{'

          //for each statement in .body.statements
          for( var statement__inx=0,statement ; statement__inx<this.body.statements.length ; statement__inx++){statement=this.body.statements[statement__inx];
          
            //if statement.specific instance of Grammar.ExceptionBlock
            if (statement.specific instanceof Grammar.ExceptionBlock) {
            
                //.out " try{",NL
                this.out(" try{", NL);
                //break
                break;
            };
          };// end for each in this.body.statements

//if params defaults where included, we assign default values to arguments

          //if .paramsDeclarations
          if (this.paramsDeclarations) {
          
              //for each varDecl in .paramsDeclarations.list
              for( var varDecl__inx=0,varDecl ; varDecl__inx<this.paramsDeclarations.list.length ; varDecl__inx++){varDecl=this.paramsDeclarations.list[varDecl__inx];
              
                //if varDecl.assignedValue
                if (varDecl.assignedValue) {
                
                    //.body.assignIfUndefined varDecl.name, varDecl.assignedValue
                    this.body.assignIfUndefined(varDecl.name, varDecl.assignedValue);
                };
              };// end for each in this.paramsDeclarations.list
              
          };
              //#end for
          //#end if

          //.body.produce()
          this.body.produce();
      };

      //end if one-line-function

//close the function, add source map for function default "return undefined" execution point

      //.out "}"
      

//close the function, add source map for function default "return undefined" execution point

      //.out "}"
      this.out("}");
     };
      //ifdef PROD_JS // if compile-to-js
      //if .lexer.outCode.sourceMap
          //.lexer.outCode.sourceMap.add ( .EndFnLineNum, 0, .lexer.outCode.lineNum-1, 0)
      //endif

//--------------------
    //    append to class Grammar.PrintStatement ###
    
//`print` is an alias for console.log

      //method produce()
      Grammar.PrintStatement.prototype.produce = function(){
        //.out "console.log(",{"CSL":.args},")"
        this.out("console.log(", {"CSL": this.args}, ")");
      };


//--------------------
    //    append to class Grammar.EndStatement ###
    

//Marks the end of a block. It's just a comment for javascript

      //method produce()
      Grammar.EndStatement.prototype.produce = function(){
        //.skipSemiColon = true
        this.skipSemiColon = true;
      };

//--------------------
    //    append to class Grammar.CompilerStatement ###
    

      //method produce()
      Grammar.CompilerStatement.prototype.produce = function(){
        //.skipSemiColon = true
        this.skipSemiColon = true;
      };


//--------------------
    //    append to class Grammar.DeclareStatement ###
    

//Out as comments

      //method produce()
      Grammar.DeclareStatement.prototype.produce = function(){
        //.skipSemiColon = true
        this.skipSemiColon = true;
      };


//----------------------------
    //    append to class Grammar.ClassDeclaration ###
    

//Classes contain a code block with properties and methods definitions.

      //method produce()
      Grammar.ClassDeclaration.prototype.produce = function(){

        //.out {COMMENT:"constructor"},NL
        this.out({COMMENT: "constructor"}, NL);

//First, since in JS we have a object-class-function-constructor all-in-one
//we need to get the class constructor, and separate other class items.

        //var theConstructorDeclaration = null
        var theConstructorDeclaration = null;
        //var theMethods = []
        var theMethods = [];
        //var theProperties = []
        var theProperties = [];

        //if .body
        if (this.body) {
        
          //for each index,item in .body.statements
          for( var index=0,item ; index<this.body.statements.length ; index++){item=this.body.statements[index];
          

            //if item.specific instanceof Grammar.ConstructorDeclaration
            if (item.specific instanceof Grammar.ConstructorDeclaration) {
            

              //if theConstructorDeclaration # what? more than one?
              if (theConstructorDeclaration) {
              
                //.throwError('Two constructors declared for class #{.name}')
                this.throwError('Two constructors declared for class ' + this.name);
              };

              //theConstructorDeclaration = item.specific
              theConstructorDeclaration = item.specific;
            }
            //if item.specific instanceof Grammar.ConstructorDeclaration
            
            else if (item.specific instanceof Grammar.PropertiesDeclaration) {
            
              //theProperties.push item.specific
              theProperties.push(item.specific);
            }
            //else if item.specific instanceof Grammar.PropertiesDeclaration
            
            else {
              //theMethods.push item
              theMethods.push(item);
            };
          };// end for each in this.body.statements
          
        };

        //#end if body

        //var prefix = .getOwnerPrefix()
        var prefix = this.getOwnerPrefix();

//js: function-constructor-class-namespace-object (All-in-one)

        //.out "function ",.name
        this.out("function ", this.name);

        //if theConstructorDeclaration //there was a constructor body, add specified params
        if (theConstructorDeclaration) {
        
            //.out "(", theConstructorDeclaration.paramsDeclarations, "){", NL // .getEOLComment()
            this.out("(", theConstructorDeclaration.paramsDeclarations, "){", NL);
        }
        //if theConstructorDeclaration //there was a constructor body, add specified params
        
        else {
            //.out "(){ // default constructor",NL
            this.out("(){ // default constructor", NL);
        };

//call super-class __init

        //.addCallToSuperClassInit
        this.addCallToSuperClassInit();

//initialize own properties

        //for each propDecl in theProperties
        for( var propDecl__inx=0,propDecl ; propDecl__inx<theProperties.length ; propDecl__inx++){propDecl=theProperties[propDecl__inx];
        
            //propDecl.produce('this.') //property assignments
            propDecl.produce('this.');
        };// end for each in theProperties

        //if theConstructorDeclaration //there was a body
        if (theConstructorDeclaration) {
        
            //theConstructorDeclaration.produceBody
            theConstructorDeclaration.produceBody();
            //.out ";",NL
            this.out(";", NL);
        }
        //if theConstructorDeclaration //there was a body
        
        else {
            //.out "};",NL
            this.out("};", NL);
        };

//if the class is global...

        //if .hasAdjective('global')
        if (this.hasAdjective('global')) {
        
            //.out '//global class',NL
            this.out('//global class', NL);
            //.out 'GLOBAL.',.name,"=",.name,";",NL //set declared fn-Class as method of GLOBAL
            this.out('GLOBAL.', this.name, "=", this.name, ";", NL);
        };

//if the class is inside a namespace...

        //if prefix and prefix.length
        if (prefix && prefix.length) {
        
            //.out prefix,.name,"=",.name,";",NL //set declared fn-Class as method of owner-namespace
            this.out(prefix, this.name, "=", this.name, ";", NL);
        };

//Set super-class if we have one indicated

        //if .varRefSuper
        if (this.varRefSuper) {
        
          //.out {COMMENT:[.name,' (extends|proto is) ',.varRefSuper,NL]}
          this.out({COMMENT: [this.name, ' (extends|proto is) ', this.varRefSuper, NL]});
          //.out .name,'.prototype.__proto__ = ', .varRefSuper,'.prototype;',NL
          this.out(this.name, '.prototype.__proto__ = ', this.varRefSuper, '.prototype;', NL);
        };

//now out methods, meaning: create properties in the object-function-class prototype

        //for each itemMethodDeclaration in theMethods
        for( var itemMethodDeclaration__inx=0,itemMethodDeclaration ; itemMethodDeclaration__inx<theMethods.length ; itemMethodDeclaration__inx++){itemMethodDeclaration=theMethods[itemMethodDeclaration__inx];
        
            //itemMethodDeclaration.produce prefix
            itemMethodDeclaration.produce(prefix);
        };// end for each in theMethods

//If the class was adjectivated 'export', add to module.exports

        //.produceExport .name
        this.produceExport(this.name);

        //.out NL,{COMMENT:"end class "},.name,NL
        this.out(NL, {COMMENT: "end class "}, this.name, NL);
        //.skipSemiColon = true
        this.skipSemiColon = true;
      };


      //method addCallToSuperClassInit
      Grammar.ClassDeclaration.prototype.addCallToSuperClassInit = function(){

        //if .varRefSuper
        if (this.varRefSuper) {
        

            //if .varRefSuper.name is 'Error'
            if (this.varRefSuper.name === 'Error') {
            

//a hack to overcome a js quirk - extending Error class

              //.out "//Sadly, the Error Class in javascript is not easily subclassed.\n//http://stackoverflow.com/questions/8802845/inheriting-from-the-error-object-where-is-the-message-property\nthis.__proto__.__proto__=Error.apply(null,arguments);\n//NOTE: all instances of ControlledError will share the same info"
              this.out("//Sadly, the Error Class in javascript is not easily subclassed.\n//http://stackoverflow.com/questions/8802845/inheriting-from-the-error-object-where-is-the-message-property\nthis.__proto__.__proto__=Error.apply(null,arguments);\n//NOTE: all instances of ControlledError will share the same info");
            }
            //if .varRefSuper.name is 'Error'
            
            else {

              //.out
                  //{COMMENT:["default constructor: call super.constructor"]},NL
                  //"    ",.varRefSuper,".prototype.constructor.apply(this,arguments)",NL


    //    append to class Grammar.AppendToDeclaration ###
              this.out({COMMENT: ["default constructor: call super.constructor"]}, NL, "    ", this.varRefSuper, ".prototype.constructor.apply(this,arguments)", NL);
            };
        };
      };


    //    append to class Grammar.AppendToDeclaration ###
    

//Any class|object can have properties or methods appended at any time.
//Append-to body contains properties and methods definitions.

      //method produce()
      Grammar.AppendToDeclaration.prototype.produce = function(){
        //.out .body
        this.out(this.body);
        //.skipSemiColon = true
        this.skipSemiColon = true;
      };


    //    append to class Grammar.NamespaceDeclaration ###
    

//Any class|object can have properties or methods appended at any time.
//Append-to body contains properties and methods definitions.

      //method produce()
      Grammar.NamespaceDeclaration.prototype.produce = function(){
        //.out 'var ',.name,'={};'
        this.out('var ', this.name, '={};');
        //.out .body
        this.out(this.body);
        //.skipSemiColon = true
        this.skipSemiColon = true;

        //if .hasAdjective('global')
        if (this.hasAdjective('global')) {
        
            //.out '//global class',NL
            this.out('//global class', NL);
            //.out 'GLOBAL.',.name,"=",.name,";",NL //set declared fn-Class as method of GLOBAL
            this.out('GLOBAL.', this.name, "=", this.name, ";", NL);
        };

        //.produceExport .name
        this.produceExport(this.name);
      };


    //    append to class Grammar.TryCatch ###
    

      //method produce()
      Grammar.TryCatch.prototype.produce = function(){

        //.out "try{", .body, .exceptionBlock
        this.out("try{", this.body, this.exceptionBlock);
      };

    //    append to class Grammar.ExceptionBlock ###
    

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


    //    append to class Grammar.CaseStatement ###
    

      //      method produce()
      Grammar.CaseStatement.prototype.produce = function(){

//if we have a varRef, is a case over a value

        //if .isInstanceof
        if (this.isInstanceof) {
        
            //.produceInstanceOfLoop
            this.produceInstanceOfLoop();
            //return
            return;
        };

        //for each index,whenSection in .cases
        for( var index=0,whenSection ; index<this.cases.length ; index++){whenSection=this.cases[index];
        

            //whenSection.outSourceLinesAsComment
            whenSection.outSourceLinesAsComment();

            //.out index>0? 'else ' : ''
            this.out(index > 0 ? 'else ' : '');

            //if .varRef
            if (this.varRef) {
            
                //case foo...
                //.out 'if (', {pre:['(',.varRef,'=='], CSL:whenSection.expressions, post:')', separator:'||', freeForm:1}
                this.out('if (', {pre: ['(', this.varRef, '=='], CSL: whenSection.expressions, post: ')', separator: '||', freeForm: 1});
            }
            //if .varRef
            
            else {
                //case when TRUE
                //.out 'if (', {pre:['('], CSL:whenSection.expressions, post:')', separator:'||', freeForm:1}
                this.out('if (', {pre: ['('], CSL: whenSection.expressions, post: ')', separator: '||', freeForm: 1});
            };

            //.out '){',
                //whenSection.body, NL,
                //'}'
            this.out('){', whenSection.body, NL, '}');
        };// end for each in this.cases

//else body

        //if .elseBody, .out NL,'else {',.elseBody,'}'
        if (this.elseBody) {this.out(NL, 'else {', this.elseBody, '}')};
      };


      //      method produceInstanceOfLoop
      Grammar.CaseStatement.prototype.produceInstanceOfLoop = function(){

        //var tmpVar=UniqueID.getVarName('class')
        var tmpVar = UniqueID.getVarName('class');
        //.out "Class_ptr ",tmpVar," = ",.varRef,".class;",NL,
            //"while(",tmpVar,"){",NL
        this.out("Class_ptr ", tmpVar, " = ", this.varRef, ".class;", NL, "while(", tmpVar, "){", NL);

        //for each index,whenSection in .cases
        for( var index=0,whenSection ; index<this.cases.length ; index++){whenSection=this.cases[index];
        

            //whenSection.outSourceLinesAsComment
            whenSection.outSourceLinesAsComment();

            //whenSection.out index>0? 'else ' : '' ,
                //'if (', {pre:['(',.varRef,'.class=='], CSL:whenSection.expressions, post:')', separator:'||'},
                //'){',
                //whenSection.body, NL,
                //'break;',NL, //exit while super loop
                //'}'
            whenSection.out(index > 0 ? 'else ' : '', 'if (', {pre: ['(', this.varRef, '.class=='], CSL: whenSection.expressions, post: ')', separator: '||'}, '){', whenSection.body, NL, 'break;', NL, '}');
        };// end for each in this.cases

        //end for

        //.out tmpVar,'=',tmpVar,'.super;',NL //move to super
        

        //.out tmpVar,'=',tmpVar,'.super;',NL //move to super
        this.out(tmpVar, '=', tmpVar, '.super;', NL);
        //.out '}',NL //close while loooking for super
        this.out('}', NL);

//else body

        //if .elseBody, .out NL,'if(!tmpVar) {',.elseBody,'}'
        if (this.elseBody) {this.out(NL, 'if(!tmpVar) {', this.elseBody, '}')};
      };


    //    append to class Grammar.YieldExpression ###
    

      //method produce()
      Grammar.YieldExpression.prototype.produce = function(){

//Check location

        //if no .getParent(Grammar.FunctionDeclaration) into var functionDeclaration
        var functionDeclaration=undefined;
        if (!((functionDeclaration=this.getParent(Grammar.FunctionDeclaration))) || !functionDeclaration.hasAdjective("nice")) {
        
                //.throwError '"yield" can only be used inside a "nice function/method"'
                this.throwError('"yield" can only be used inside a "nice function/method"');
        };

        //var yieldArr=[]
        var yieldArr = [];

        //var varRef = .fnCall.varRef
        var varRef = this.fnCall.varRef;
        //from .varRef calculate object owner and method name

        //var thisValue=['null']
        var thisValue = ['null'];
        //var fnName = varRef.name #default if no accessors
        var fnName = varRef.name;

        //if varRef.accessors
        if (varRef.accessors) {
        

            //var inx=varRef.accessors.length-1
            var inx = varRef.accessors.length - 1;
            //if varRef.accessors[inx] instance of Grammar.FunctionAccess
            if (varRef.accessors[inx] instanceof Grammar.FunctionAccess) {
            
                //var functionAccess = varRef.accessors[inx]
                var functionAccess = varRef.accessors[inx];
                //yieldArr = functionAccess.args
                yieldArr = functionAccess.args;
                //inx--
                inx--;
            };

            //if inx>=0
            if (inx >= 0) {
            
                //if varRef.accessors[inx] isnt instance of Grammar.PropertyAccess
                if (!(varRef.accessors[inx] instanceof Grammar.PropertyAccess)) {
                
                    //.throwError 'yield needs a clear method name. Example: "yield until obj.method(10)". redefine yield parameter.'
                    this.throwError('yield needs a clear method name. Example: "yield until obj.method(10)". redefine yield parameter.');
                };

                //fnName = "'#{varRef.accessors[inx].name}'"
                fnName = "'" + (varRef.accessors[inx].name) + "'";
                //thisValue = [varRef.name]
                thisValue = [varRef.name];
                //thisValue.push varRef.accessors.slice(0,inx)
                thisValue.push(varRef.accessors.slice(0, inx));
            };
        };


        //if .specifier is 'until'
        if (this.specifier === 'until') {
        

            //yieldArr.unshift fnName
            yieldArr.unshift(fnName);
            //yieldArr.unshift thisValue
            yieldArr.unshift(thisValue);
        }
        //if .specifier is 'until'
        
        else {

            //yieldArr.push "'map'",.arrExpression, thisValue, fnName
            yieldArr.push("'map'", this.arrExpression, thisValue, fnName);
        };


        //.out "yield [ ",{CSL:yieldArr}," ]"
        this.out("yield [ ", {CSL: yieldArr}, " ]");
      };



//# Helper functions


//Utility
//-------

    //var NL = '\n' # New Line constant
    var NL = '\n';

//Operator Mapping
//================

//Many LiteScript operators can be easily mapped one-to-one with their JavaScript equivalents.

    //var OPER_TRANSLATION_map = map

      //'no':           '!'
      //'not':          '!'
      //'unary -':      '-'
      //'unary +':      '+'

      //'&':            '+'  //string concat
      //'&=':           '+='  //string concat

      //'bitand':       '&'
      //'bitor':        '|'
      //'bitxor':       '^'
      //'bitnot':       '~'

      //'type of':      'typeof'
      //'instance of':  'instanceof'

      //'is':           '==='
      //'isnt':         '!=='
      //'<>':           '!=='
      //'and':          '&&'
      //'but':          '&&'
      //'or':           '||'
      //'has property': 'in'

    //function operTranslate(name:string)
    var OPER_TRANSLATION_map = new Map().fromObject({
        'no': '!'
        , 'not': '!'
        , 'unary -': '-'
        , 'unary +': '+'
        , '&': '+'
        , '&=': '+='
        , 'bitand': '&'
        , 'bitor': '|'
        , 'bitxor': '^'
        , 'bitnot': '~'
        , 'type of': 'typeof'
        , 'instance of': 'instanceof'
        , 'is': '==='
        , 'isnt': '!=='
        , '<>': '!=='
        , 'and': '&&'
        , 'but': '&&'
        , 'or': '||'
        , 'has property': 'in'
      });

    //function operTranslate(name:string)
    function operTranslate(name){
      //return OPER_TRANSLATION_map.get(name) or name
      return OPER_TRANSLATION_map.get(name) || name;
    };

//---------------------------------

    //    append to class ASTBase
    

//Helper methods and properties, valid for all nodes

     //     properties skipSemiColon
     
     //     properties skipSemiColon

     //     helper method assignIfUndefined(name, value: Grammar.Expression)
     ASTBase.prototype.assignIfUndefined = function(name, value){

          //declare valid value.root.name.name
          
          //#do nothing if value is 'undefined'

          //#Expression->Operand->VariableRef->name
          //var varRef:Grammar.VariableRef = value.root.name
          var varRef = value.root.name;
          //if varRef.constructor is Grammar.VariableRef
          if (varRef.constructor === Grammar.VariableRef) {
          
              //if varRef.name is 'undefined'
              if (varRef.name === 'undefined') {
              
                  //.out {COMMENT:name},": undefined",NL
                  this.out({COMMENT: name}, ": undefined", NL);
                  //return
                  return;
              };
          };

          //.out "if(",name,'===undefined) ',name,"=",value,";",NL
          this.out("if(", name, '===undefined) ', name, "=", value, ";", NL);
     };

     //     helper method produceExport(name:string)
     ASTBase.prototype.produceExport = function(name){

//"module.export" not valid for browser modules

        //if .lexer.options.browser, return
        if (this.lexer.options.browser) {return};

//if the class/namespace has the same name as the file, it's the export object

        //var moduleNode:Grammar.Module = .getParent(Grammar.Module)
        var moduleNode = this.getParent(Grammar.Module);

        //if moduleNode.fileInfo.base is .name
        if (moduleNode.fileInfo.base === this.name) {
        

            //do nothing //is the default export
            null;
        }
        //if moduleNode.fileInfo.base is .name
        
        else if (this.hasAdjective("export")) {
        
            //.out NL,{COMMENT:'export'},NL
            this.out(NL, {COMMENT: 'export'}, NL);
            //.out 'module.exports.',name,' = ', name,";",NL
            this.out('module.exports.', name, ' = ', name, ";", NL);
            //.skipSemiColon = true
            this.skipSemiColon = true;
        };
     };