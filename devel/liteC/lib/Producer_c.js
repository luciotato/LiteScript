//Compiled by LiteScript compiler v0.7.0, source: /home/ltato/LiteScript/devel/source-v0.8/Producer_c.lite.md
// Producer C
// ===========

// The `producer` module extends Grammar classes, adding a `produce()` method
// to generate target code for the node.

// The compiler calls the `.produce()` method of the root 'Module' node
// in order to return the compiled code for the entire tree.

// We extend the Grammar classes, so this module require the `Grammar` module.

   // import
   var Project = require('./Project');
   var ASTBase = require('./ASTBase');
   var Grammar = require('./Grammar');
   var NameDeclaration = require('./NameDeclaration');
   var Lexer = require('./Lexer');
   var Environment = require('./Environment');
   var log = require('./log');
   var color = require('./color');
   var Map = require('./Map');

// "C" Producer Functions
// ==========================

// module vars

    // # list of classes, to call __registerclass
   var classes = [];

    // # USER_CLASSES_START_ID
    // # must be kept in sync with hand-coded LiteC-core.c
   var USER_CLASSES_START_ID = 32;

    // #store info to create a dispatcher for each method name (globally)
   var allDispatchersNameDecl = new NameDeclaration();
   var dispatcherModule = undefined;
   // export
   module.exports.dispatcherModule = dispatcherModule;

   var DEFAULT_ARGUMENTS = "(any this, len_t argc, any* arguments)";

   // append to class NameDeclaration ###
      // properties
        // funcDecl: Grammar.FunctionDeclaration #pointer on dispatcherModule's each case
     


   // public function preProduction(project)
   function preProduction(project){

        // user class ID's start
       ASTBase.setUniqueID('TYPEID', USER_CLASSES_START_ID);
   };
   // export
   module.exports.preProduction=preProduction;

   // public function postProduction(project)
   function postProduction(project){

// create _dispatcher.c & .h

       dispatcherModule = new Grammar.Module(project);
        // declare valid project.options
       dispatcherModule.lexer = new Lexer(null, project, project.options);

       project.redirectOutput(dispatcherModule.lexer.out); // all Lexers now out here

       dispatcherModule.fileInfo = Environment.fileInfoNewFile("_dispatcher", project.options);
       dispatcherModule.produceDispatcher(project);

       resultLines = dispatcherModule.lexer.out.getResult(); //get .c file contents
       // if resultLines.length
       if (resultLines.length) {
           Environment.externalCacheSave(dispatcherModule.fileInfo.outFilename, resultLines);
       };

       var resultLines = dispatcherModule.lexer.out.getResult(1); //get .h file contents
       // if resultLines.length
       if (resultLines.length) {
           Environment.externalCacheSave(dispatcherModule.fileInfo.outFilename.slice(0, -1) + 'h', resultLines);
       };

       log.message("" + color.green + "[OK] -> " + dispatcherModule.fileInfo.outRelFilename + " " + color.normal);
       log.extra();// #blank line
   };
   // export
   module.exports.postProduction=postProduction;

   // end function

   // helper function normalizeDefine(name:string)
   function normalizeDefine(name){
       return name.replace(/[\s\W]/g, "_").toUpperCase();
   };


   // append to class Grammar.Module ###

    // method produceDispatcher(project)
    Grammar.Module.prototype.produceDispatcher = function(project){

       var requiredHeaders = [];

// Add core-supported dispatchers & methods

// "toString" have a default handler in core. It's added for any class

       this.addMethodDispatcher('toString');

       var supportedCoreMethods = new Map();
       supportedCoreMethods.map_members = {
           String: ['slice', 'split', 'indexOf', 'lastIndexOf', 'concat'], 
           Array: ['slice', 'splice', 'indexOf', 'lastIndexOf', 'push', 'unshift', 'pop', 'join', 'concat'], 
           Map: ['get', 'has', 'set', 'clear', 'delete'], 
           console: ['log', 'error'], 
           process: ['exit', 'cwd']
           };

       // for each className, methodNames:array in map supportedCoreMethods
       var methodNames=undefined;
       if(!supportedCoreMethods.map_members) throw(new Error("for each in map: not a Map, no .map_members"));
       for ( var className in supportedCoreMethods.map_members) if (supportedCoreMethods.map_members.hasOwnProperty(className)){methodNames=supportedCoreMethods.map_members[className];
           {
           // for each methodName in methodNames
           for( var methodName__inx=0,methodName ; methodName__inx<methodNames.length ; methodName__inx++){methodName=methodNames[methodName__inx];
                 this.addMethodDispatcher(methodName, className);
           };// end for each in methodNames
           
           }
           
           }// end for each property

// _dispatcher.c

       this.out('#include "_dispatcher.h"', NL, NL, NL, NL);

// core support and defined classes init function

       this.out('void __init_core_support(int argc, char** argv){', NL, NL, NL);

       this.out('    LiteC_registerCoreClasses(argc,argv);', NL);

// register user classes, init singletons

       // for each classDeclaration in classes
       for( var classDeclaration__inx=0,classDeclaration ; classDeclaration__inx<classes.length ; classDeclaration__inx++){classDeclaration=classes[classDeclaration__inx];
           this.out('    __registerClass(', classDeclaration.name, '_TYPEID,', '"', classDeclaration.name, '", ');

           // if classDeclaration.varRefSuper
           if (classDeclaration.varRefSuper) {
               this.out(classDeclaration.varRefSuper, "_TYPEID");
           }
           
           else {
               this.out('UNDEFINED', ', ');
           };

           this.out(classDeclaration.name, '__init', ', ', 'sizeof(struct ', classDeclaration.name, '_s));', NL);
       };// end for each in classes

       this.out(NL);
       // for each classDeclaration in classes
       for( var classDeclaration__inx=0,classDeclaration ; classDeclaration__inx<classes.length ; classDeclaration__inx++){classDeclaration=classes[classDeclaration__inx];
         if(classDeclaration instanceof Grammar.NamespaceDeclaration){
               this.out('    ' + classDeclaration.name + '__init_singleton();', NL);
       }};// end for each in classes

       this.out(NL, '};', NL, NL);

// now all method dispatchers

       this.out({COMMENT: 'method dispatchers'}, NL, NL);
       // for each dispatcherNameDecl in map allDispatchersNameDecl.members
       var dispatcherNameDecl=undefined;
       if(!allDispatchersNameDecl.members.map_members) throw(new Error("for each in map: not a Map, no .map_members"));
       for ( var dispatcherNameDecl__propName in allDispatchersNameDecl.members.map_members) if (allDispatchersNameDecl.members.map_members.hasOwnProperty(dispatcherNameDecl__propName)){dispatcherNameDecl=allDispatchersNameDecl.members.map_members[dispatcherNameDecl__propName];
           {

           var methodName = dispatcherNameDecl.name;
           this.out('any _', methodName, DEFAULT_ARGUMENTS);
            //.produceParameters 'void*' //type for implicit parameter "this"
           this.out("{", NL);
           this.out("    switch(this.type){", NL);

           // for each caseNameDecl in map dispatcherNameDecl.members
           var caseNameDecl=undefined;
           if(!dispatcherNameDecl.members.map_members) throw(new Error("for each in map: not a Map, no .map_members"));
           for ( var caseNameDecl__propName in dispatcherNameDecl.members.map_members) if (dispatcherNameDecl.members.map_members.hasOwnProperty(caseNameDecl__propName)){caseNameDecl=dispatcherNameDecl.members.map_members[caseNameDecl__propName];
               {
               this.out("      case ", caseNameDecl.name, "_TYPEID:", NL);
                // call specific class_method
               this.out("         return ", caseNameDecl.name, "_", methodName, "(this,argc,arguments);", NL);
                // passs same parameters, same order as dispatcher
                // C-compiler should optimize this tail-call to a JMP instead of CALL

                // keep a list of required Headers
               // if caseNameDecl.funcDecl
               if (caseNameDecl.funcDecl) {
                   var classModule = caseNameDecl.funcDecl.getParent(Grammar.Module);
                   // if classModule not in requiredHeaders
                   if (requiredHeaders.indexOf(classModule)===-1) {
                       requiredHeaders.push(classModule);
                   };
               };
               }
               
               }// end for each property

           // end for each case

           this.out(NL, '      default:', NL);
           // if methodName is 'toString' //'toString' has "default" handler in core
           if (methodName === 'toString') { //'toString' has "default" handler in core
               this.out('         return _default_toString(this,argc,arguments);', NL);
           }
           
           else {
               this.out('         throw(_noMethod(this.type,"', methodName, '"));', NL);
           };

           this.out("    };", NL);
           this.out("};", NL, NL);
           }
           
           }// end for each property

       // end for each dispatcher (method name)

// _dispatcher.h

       this.out({h: 1}, NL);

       this.out('#ifndef ' + (normalizeDefine(this.fileInfo.outRelFilename)) + '_H', NL);
       this.out('#define ' + (normalizeDefine(this.fileInfo.outRelFilename)) + '_H', NL, NL);

// include LiteC-core

       this.out('#include "LiteC-core.h"', NL);

// include headers for all the imported modules

       // for each moduleNode:Grammar.Module in map project.moduleCache
       var moduleNode=undefined;
       if(!project.moduleCache.map_members) throw(new Error("for each in map: not a Map, no .map_members"));
       for ( var moduleNode__propName in project.moduleCache.map_members) if (project.moduleCache.map_members.hasOwnProperty(moduleNode__propName)){moduleNode=project.moduleCache.map_members[moduleNode__propName];
           {
           this.out('#include "' + (moduleNode.fileInfo.outRelFilename.slice(0, -1)) + 'h"', NL);
           }
           
           }// end for each property

        //var project = .parent
        //.out '#include "#{project.main.fileInfo.outRelFilename.slice(0,-1)}h"',NL
        //for each moduleDecl in requiredHeaders
        //    .out '#include "#{moduleDecl.fileInfo.outRelFilename.slice(0,-1)}h"',NL

// LiteC__init extern declaration

       this.out(NL, {COMMENT: 'core support and defined classes init'}, NL);
       this.out('extern void __init_core_support();', NL, NL);

// methods dispatchers extern declaration

       this.out({COMMENT: 'method dispatchers'}, NL, NL);

       // for each dispatcherNameDecl in map allDispatchersNameDecl.members
       var dispatcherNameDecl=undefined;
       if(!allDispatchersNameDecl.members.map_members) throw(new Error("for each in map: not a Map, no .map_members"));
       for ( var dispatcherNameDecl__propName in allDispatchersNameDecl.members.map_members) if (allDispatchersNameDecl.members.map_members.hasOwnProperty(dispatcherNameDecl__propName)){dispatcherNameDecl=allDispatchersNameDecl.members.map_members[dispatcherNameDecl__propName];
           {
           this.out('extern any _', dispatcherNameDecl.name, "( DEFAULT_ARGUMENTS );", NL);
           }
           
           }// end for each property
            //.produceParameters 'void*' //type for implicit parameter "this"
            //.out ";",NL

       this.out(NL, NL, "#endif", NL, NL);
    };

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
           if (this.exportDefault.list.length > 1) {this.exportDefault.throwError("only one var:Object alllowed for 'export default'");};
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
       this.out('#ifndef ' + (normalizeDefine(this.fileInfo.outRelFilename)) + '_H', NL);
       this.out('#define ' + (normalizeDefine(this.fileInfo.outRelFilename)) + '_H', NL, NL);

       this.out('#include "_dispatcher.h"', NL);

       this.out({h: 0}, NL);
       this.out('#include "' + this.fileInfo.basename + '.h"', NL, NL);

// if is main module,
// First: all classes declarations, imports and declares
// after that, we start "int main(){..."

       // if .isMain
       if (this.isMain) {

           // for each statement in .statements
           for( var statement__inx=0,statement ; statement__inx<this.statements.length ; statement__inx++){statement=this.statements[statement__inx];

               // if statement.statement instanceof Grammar.VarStatement
               if (statement.statement instanceof Grammar.VarStatement) {
                    // declare statement.statement: Grammar.VarStatement
                   statement.statement.produceDeclare();
               }
               
               else if (statement.isDeclaration()) {
                   statement.produce();
               };
           };// end for each in this.statements

           this.out(NL, NL, NL, "//-------------------------------", NL);
           this.out("int main(int argc, char** argv) {", NL);
           this.out("   __init_core_support(argc,argv); //see _dispatcher.c", NL);

           // for each statement in .statements
           for( var statement__inx=0,statement ; statement__inx<this.statements.length ; statement__inx++){statement=this.statements[statement__inx];

               // if statement.statement instanceof Grammar.VarStatement
               if (statement.statement instanceof Grammar.VarStatement) {
                    // declare statement.statement: Grammar.VarStatement
                   statement.statement.produceAssignments();
               }
               
               else if (!(statement.isDeclaration())) {
                   statement.produce();
               };
           };// end for each in this.statements

            //if not mainFunctionStarted, .throwError '"#{.fileInfo.outRelFilename}": no code found to create main function'
           this.out(NL, "}//end main function", NL);
       }
       
       else {

           this.out(this.statements);
       };

        //add end of file comments
       this.outPrevLinesComments(this.lexer.infoLines.length - 1);

// export 'export default' namespace, if it was set.

        //if not .lexer.out.browser
        //    if .lexer.out.exportNamespace isnt exportsName
        //        .out exportsName,'=',.lexer.out.exportNamespace,";",NL

// close .h #ifdef

       this.out(NL);
       this.out({h: 1}, NL);
       this.out('#endif', NL);
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
           if (!(([Grammar.PrintStatement, Grammar.VarStatement, Grammar.CompilerStatement, Grammar.DeclareStatement, Grammar.AssignmentStatement, Grammar.ReturnStatement, Grammar.PropertiesDeclaration, Grammar.FunctionCall, Grammar.DoNothingStatement].indexOf(this.statement.constructor)>=0))) {
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
// Note: producer_js uses: callOnSubTree

        //ifdef TARGET_C
        //for each child in .children where child.constructor isnt Grammar.Body
            //declare valid child.declareIntoVar
            //child.declareIntoVar
        // #else
       this.callOnSubTree("declareIntoVar", Grammar.Body);
        // #endif

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

// helper function to determine if a statement is a declaration (can be outside a funcion in "C")
// or a "statement" (must be inside a funcion in "C")

     // helper method isDeclaration returns boolean
     Grammar.Statement.prototype.isDeclaration = function(){

       return this.statement instanceof Grammar.ClassDeclaration || this.statement instanceof Grammar.FunctionDeclaration || [Grammar.ImportStatement, Grammar.DeclareStatement, Grammar.CompilerStatement].indexOf(this.statement.constructor)>=0;
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
           this.out("throw(new(Error_TYPEID,1,(any_arr){", this.expr, "}));");
         }
         
         else {
           this.out("throw(", this.expr, ")");
         };
     };


   // append to class Grammar.ReturnStatement ###

     // method produce()
     Grammar.ReturnStatement.prototype.produce = function(){
       this.out("return");
       // if .expr, .out ' ',.expr
       if (this.expr) {this.out(' ', this.expr);};
     };


   // append to class Grammar.FunctionCall ###

     // method produce()
     Grammar.FunctionCall.prototype.produce = function(){

       var options = {
           validations: []
           };

       var result = this.varRef.calcReference(options);

        // assert not null or undefined before calling
        //for each validation in options.validations
        //    .out validation,NL

        // out function call
       this.out(result);
     };

        //if .varRef.executes, return #if varRef already executes, nothing more to do
        //.out "()" #add (), so JS executes the function call


   // append to class Grammar.Operand ###

// `Operand:
  // |NumberLiteral|StringLiteral|RegExpLiteral
  // |ParenExpression|ArrayLiteral|ObjectLiteral|FunctionDeclaration
  // |VariableRef

// A `Operand` is the left or right part of a binary oper
// or the only Operand of a unary oper.

      // properties
        // produceType: string

     // method produce()
     Grammar.Operand.prototype.produce = function(){

       var pre = undefined, post = undefined;

       // if .name instance of Grammar.StringLiteral
       if (this.name instanceof Grammar.StringLiteral) {
            // declare .name:Grammar.StringLiteral
            // in C we only have "" to define strings, '' are for char constants
            // if the StringLiteral is defined with '', change to "" and escape all internal \"
           var strValue = this.name.name;
           // if strValue[0] is "'"
           if (strValue[0] === "'") {
               strValue = this.name.getValue(); // w/o quotes
               strValue = strValue.replace(/"/g, '\\"'); // escape internal \"
               strValue = '"' + strValue + '"'; // enclose in ""
           };

           // if .produceType is 'any'
           if (this.produceType === 'any') {
               pre = "any_str(";
               post = ")";
           };

           // if strValue is '""'
           if (strValue === '""') {
               this.out("any_EMPTY_STR");
           }
           
           else {
               this.out(pre, strValue, post);
           };

           this.out(this.accessors);
       }
       
       else if (this.name instanceof Grammar.NumberLiteral) {

           // if .produceType is 'any'
           if (this.produceType === 'any') {
               pre = "any_number(";
               post = ")";
           };

           this.out(pre, this.name, post, this.accessors);
       }
       
       else if (this.name instanceof Grammar.VariableRef) {
            // declare .name:Grammar.VariableRef
           this.name.produceType = this.produceType;
           this.out(this.name);
       }
       
       else {
            // declare valid .name.produceType
           this.name.produceType = this.produceType;
           this.out(this.name, this.accessors);
       };

       // end if
       
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

      // properties
        // produceType: string

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
       };


       // if translated is "new" and .right.name instance of Grammar.VariableRef
       if (translated === "new" && this.right.name instanceof Grammar.VariableRef) {
            // declare .right.name:Grammar.VariableRef
           this.out(this.right.name.calcReference({nameReplace: "new", typeID: this.right.name.name}));
       }
       
       else {
           var pre = undefined, post = undefined;
           // if .produceType is 'any'
           if (this.produceType === 'any') {
               pre = "any_number(";
               post = ")";
           };

           this.right.produceType = translated === "!" ? 'Bool' : 'Number'; //Except "!", unary opers require numbers

// add a space if the unary operator is a word. Example `typeof`

           // if /\w/.test(translated), translated+=" "
           if (/\w/.test(translated)) {translated += " ";};

           this.out(pre, translated, prepend, this.right, append, post);
       };
     };


   // append to class Grammar.Oper ###

      // properties
          // produceType: string

     // method produce()
     Grammar.Oper.prototype.produce = function(){

       var oper = this.name;

// default mechanism to handle 'negated' operand

       var toAnyPre = undefined, toAnyPost = undefined;
       // if .produceType is 'any'
       if (this.produceType === 'any') {
           toAnyPre = 'any_number(';
           toAnyPost = ")";
       };

       var prepend = undefined, append = undefined;
       // if .negated # NEGATED
       if (this.negated) {// # NEGATED

// else -if NEGATED- we add `!( )` to the expression

               prepend = "!(";
               append = ")";
       };

// Check for special cases:

// 1) 'in' operator, requires swapping left and right operands and to use `.indexOf(...)>=0`
// example: `x in [1,2,3]` -> `indexOf(x,_literalArray(1,2,3))>=0`
// example: `x not in [1,2,3]` -> `indexOf(x,_literalArray(1,2,3))==-1`
// example: `char not in myString` -> `indexOf(char,myString)==-1`

       // switch .name
       switch(this.name){
       
       case 'in':
           this.out(toAnyPre, "indexOf(", this.left, ",1,(any_arr){", this.right, "}).value.number", this.negated ? "==-1" : ">=0", toAnyPost);
           break;
           
       case 'has property':
           this.out(toAnyPre, "indexOf(", this.right, ",1,(any_arr){", this.left, "}).value.number", this.negated ? "==-1" : ">=0", toAnyPost);
           break;
           
       case 'into':
           // if .produceType and .produceType isnt 'any', .out 'anyTo',.produceType,'('
           if (this.produceType && this.produceType !== 'any') {this.out('anyTo', this.produceType, '(');};
           this.out("(", this.right, "=", this.left, ")");
           // if .produceType and .produceType isnt 'any', .out ')'
           if (this.produceType && this.produceType !== 'any') {this.out(')');};
           break;
           
       case 'like':
           this.out(toAnyPre, prepend, 'RegExp_test(', this.left, ',"', this.right, '")', append, toAnyPost);
           break;
           
       case 'is':
           this.left.produceType = 'any';
           this.right.produceType = 'any';
           this.out(this.negated ? '!' : '', '__is(', this.left, ',', this.right, ')');
           break;
           
       case 'or':
           this.left.produceType = 'any';
           this.right.produceType = 'any';
           this.out('__or(', this.left, ',', this.right, ')');
           break;
           
       default:

           var operC = operTranslate(oper);

           // switch operC
           switch(operC){
           
           case '?':
                   this.left.produceType = 'Bool';
                   this.right.produceType = this.produceType;
                   break;
                   
           case ':':
                   this.left.produceType = this.produceType;
                   this.right.produceType = this.produceType;
                   break;
                   
           case '&&': case '||':
                   this.left.produceType = 'Bool';
                   this.right.produceType = 'Bool';
                   break;
                   
           default:
                   this.left.produceType = 'Number';
                   this.right.produceType = 'Number';
           
           };

           // if operC isnt '?' // cant put xx( a ? b )
           if (operC !== '?') { // cant put xx( a ? b )
               var extra = undefined, preExtra = undefined;
               // if .produceType is 'any'
               if (this.produceType === 'any') {
                   // if .left.produceType is 'any' and .right.produceType is 'any'
                   if (this.left.produceType === 'any' && this.right.produceType === 'any') {
                       // do nothing
                       null;
                   }
                   
                   else {
                       preExtra = 'any_number(';
                       extra = ")";
                   };
               }
               
               else if (this.produceType) {
                   // if ( .left.produceType is .produceType and .right.produceType is .produceType )
                   if ((this.left.produceType === this.produceType && this.right.produceType === this.produceType) || (this.produceType === 'Bool' && this.left.produceType === 'Number' && this.right.produceType === 'Number')) {
                       // do nothing
                       null;
                   }
                   
                   else {
                     preExtra = 'anyTo' + this.produceType + '(';
                     extra = ")";
                   };
               };
           };

           this.out(preExtra, prepend, this.left, ' ', operC, ' ', this.right, append, extra);
       
       };

       // end case oper
       
     };


   // append to class Grammar.Expression ###

      // properties
          // produceType: string

     // method produce(options)
     Grammar.Expression.prototype.produce = function(options){

// Produce the expression body, negated if options={negated:true}

       // default options=
       if(!options) options={};
       // options.negated: undefined

       // default .produceType='any'
       if(this.produceType===undefined) this.produceType='any';

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

        // declare valid .root.produceType
       this.root.produceType = this.produceType;
       this.out(prepend, this.root, append);
     };
        //.out preExtra, prepend, .root, append, extra


   // helper function fixCReservedWord(methodName)
   function fixCReservedWord(methodName){

        // hack: fix some C's reserverd word usage
       // switch methodName
       switch(methodName){
       
       case 'exit':return 'exit_';break;
           
       case 'log':return 'log_';break;
           
       case 'error':return 'error_';break;
           
       
       };

       return methodName;
   };

   // append to class Grammar.VariableRef ###

// `VariableRef: ['--'|'++'] IDENTIFIER [Accessors] ['--'|'++']`

// `VariableRef` is a Variable Reference.

 // a VariableRef can include chained 'Accessors', which can:
 // *access a property of the object : `.`-> PropertyAccess `[`->IndexAccess
 // *assume the variable is a function and perform a function call :  `(`-> FunctionAccess

      // properties
          // produceType: string
          // isAny: boolean

     // method produce()
     Grammar.VariableRef.prototype.produce = function(){

// Prefix ++/--, varName, Accessors and postfix ++/--

       // if .name is 'arguments'
       if (this.name === 'arguments') {
           this.out('_newArrayWith(argc,arguments)');
           return;
       };

       var result = this.calcReference();

       var pre = undefined, post = undefined;

       // if .produceType is 'any' and not .isAny
       if (this.produceType === 'any' && !(this.isAny)) {
           pre = 'any_number(';
           post = ')';
       }
       
       else if (this.produceType && this.produceType !== 'any' && this.isAny) {
           pre = 'anyTo' + this.produceType + '(';
           post = ')';
       };

       this.out(pre, this.preIncDec, result, this.postIncDec, post);
     };

     // helper method calcReference(options) returns array of array
     Grammar.VariableRef.prototype.calcReference = function(options){

       var result = []; //array of arrays
       var partial = undefined;

       // default options=
       if(!options) options={};
       // options.nameReplace: undefined
       // options.typeID: undefined
       if(options.validations===undefined) options.validations=[];

// Start with main variable name, to check property names

       partial = options.nameReplace || (function(_caseVar1){
                   if(_caseVar1===('true')) return 'any_TRUE';
                   if(_caseVar1===('false')) return 'any_FALSE';
                   return this.name;
                       }.call(this,this.name));

       result.push([fixCReservedWord(partial)]);
       this.isAny = true;
       var actualVar = this.tryGetFromScope(this.name, {informError: true, isForward: true, isDummy: true});

       // if no actualVar, .throwError("var '#{partial}' not found in scope")
       if (!actualVar) {this.throwError("var '" + partial + "' not found in scope");};
       // if actualVar.findOwnMember("**proto**") is '**nativeNumber**', .isAny=false
       if (actualVar.findOwnMember("**proto**") === '**nativeNumber**') {this.isAny = false;};

       // if no .accessors, return result
       if (!this.accessors) {return result;};

// now follow each accessor

       var avType = undefined;

       // for each inx,ac in .accessors
       for( var inx=0,ac ; inx<this.accessors.length ; inx++){ac=this.accessors[inx];
            // declare valid ac.name

           // if no actualVar
           if (!actualVar) {
               this.throwError("processing '" + partial + "', cant follow property chain types");
           };

// for FunctionAccess

           // if ac.constructor is Grammar.FunctionAccess
           if (ac.constructor === Grammar.FunctionAccess) {

               partial += "(...)";
               this.isAny = true;

               // if inx>1 and .accessors[inx-1].constructor isnt Grammar.PropertyAccess
               if (inx > 1 && this.accessors[inx - 1].constructor !== Grammar.PropertyAccess) {
                   this.throwError("'" + partial + ".call' or '.apply' must be used to call a function pointer stored on a variable");
               };

               var prevNameArr = result.pop(); //take fn name

               var callParams = undefined;
               // if inx is 0 //first accessor is function access, this is a call to a global function
               if (inx === 0) { //first accessor is function access, this is a call to a global function
                   prevNameArr.push("("); //add "("
                   result.unshift(prevNameArr); // put "functioname" first - call to glboal function
                   callParams = [options.typeID ? "" + options.typeID + "_TYPEID" : "NONE"]; //"this=NONE when calling a global fn w/o instance
               }
               
               else {
                    //method call
                   prevNameArr.unshift("_"); //add "_" to call dispatcher for this method
                   prevNameArr.push("("); //add "("
                   result.unshift(prevNameArr); // put "methodname(" first - call to dispatcher
                   callParams = result.pop(); //take instance reference as 1st param (this)
                   options.validations.push(["assert("].concat(callParams, ".type>TYPE_NULL);"));
               };

                //add arguments[]
               // if ac.args and ac.args.length
               if (ac.args && ac.args.length) {
                   callParams.push("," + ac.args.length + ",(any_arr){", {CSL: ac.args, freeForm: 1}, "}");
               }
               
               else {
                   callParams.push(",0,NULL");
               };
               callParams.push(")");

               result.push(callParams);

               actualVar = actualVar.findMember('**return type**');
           }
                // #the actualVar is now function's return type'
                // #and next property access should be on defined members of the return type

// for PropertyAccess, we must apply AS(type...) to prev item
           
           else if (ac instanceof Grammar.PropertyAccess) {

               // if ac.name is '_typeID' //native int, part of any_s
               if (ac.name === '_typeID') { //native int, part of any_s
                   result.push([".", "type"]);
                   this.isAny = false;
               }
               
               else if (ac.name === 'length') { //hack, convert x.length in a funcion call, length(x)
                   result.unshift(['length', '(']); // put "length(" first - call to dispatcher
                   result.push([")"]);
                   this.isAny = false;
               }
               
               else if (inx + 1 < this.accessors.length && this.accessors[inx + 1].constructor === Grammar.FunctionAccess) {
                    // next is function access,
                    // we do not need to derefence this as a pointer. Keep it as it is
                   result.push([fixCReservedWord(ac.name)]);
                   this.isAny = true;
               }
               
               else if (ac.name === 'apply' || inx + 2 < this.accessors.length && this.accessors[inx + 1].constructor === Grammar.PropertyAccess && this.accessors[inx + 1].name === 'apply') {
                    // this is apply or next is .apply, call: _apply_function(function,this,args)
                    //hack: _apply
                   result.pop(); //take method owner (remove)
                   var methodName = undefined;
                   // if ac.name is 'apply'
                   if (ac.name === 'apply') {
                       methodName = fixCReservedWord(this.name); //main varref name, global fn
                   }
                   
                   else {
                       methodName = "_" + (fixCReservedWord(ac.name)); //a method call
                   };

                   var acApplyCall = this.accessors[inx + 2];
                   // if no acApplyCall.constructor is Grammar.FunctionAccess or no acApplyCall.args or acApplyCall.args.length isnt 2
                   if (!(acApplyCall.constructor === Grammar.FunctionAccess) || !acApplyCall.args || acApplyCall.args.length !== 2) {
                       this.sayErr("Expected 2 arguments after .apply, 'this' and 'arguments:array'");
                   }
                   
                   else {
                       result.push(["_apply_function(", methodName, ",", acApplyCall.args[0], ",", acApplyCall.args[1], ")"]);
                   };

                   inx += 2; //skip apply and "(this,args)"
               }
               
               else {

                   this.isAny = true;

                   var typeStr = undefined;
                   avType = actualVar.findOwnMember('**proto**');
                   // if no avType, avType = actualVar.findOwnMember('*namespace*')
                   if (!avType) {avType = actualVar.findOwnMember('*namespace*');};
                   // if no avType
                   if (!avType) {
                       // if inx is 0
                       if (inx === 0) {
                           typeStr = this.name; //let's assume singleton
                       }
                       
                       else {
                           this.sayErr("Can not determine type of '" + partial + "'. Can not code Property Access(.)");
                           return;
                       };
                   }
                   
                   else {
                        // #get type name
                       typeStr = avType.name;
                       // if typeStr is 'prototype'
                       if (typeStr === 'prototype') {
                           typeStr = avType.parent.name;
                       };
                       // end if
                       
                   };
                   // end if

                   result.unshift(["((", typeStr, "_ptr)"]);
                   prevNameArr = result.pop();
                    // Note: generate a complete typecast instead of using macro "AS(..)"
                    // to ease C code Netbeans GUI debugging (macro AS(..) can't be added as watch)
                   prevNameArr.push(".value.ptr)->");

                   result.push(prevNameArr, [ac.name]);
               };

               // end if // subtypes of propertyAccess

               partial += "." + ac.name;

                //get prop definition
               actualVar = this.tryGetMember(actualVar, ac.name, {informError: true});
           }

// else, for IndexAccess, the varRef type is now 'name.value.item[...]'
// and next property access should be on defined members of the type
           
           else if (ac.constructor === Grammar.IndexAccess) {

               partial += "[...]";
               this.isAny = true;

                // declare ac:Grammar.IndexAccess

                //add .value.item[...]
               var prevName = result.pop();

                //ac.name is Expression
               ac.name.produceType = 'Number';

                // w/o array bounds check:
               prevName.push(".value.arr->item[(len_t)", ac.name, "]"); //ac.name is Expression

                // with array bounds check:
                //result.unshift ["__getItem","("]
                //prevName.push ",",ac.name,")" //ac.name is Expression

               result.push(prevName);

               actualVar = actualVar.findMember('**item type**');
           };

           // end if //type of accessor

           // if actualVar instanceof Grammar.VariableRef
           if (actualVar instanceof Grammar.VariableRef) {
                // declare actualVar:Grammar.VariableRef
               actualVar = actualVar.tryGetReference({informError: true, isForward: true, isDummy: true});
           };
       };// end for each in this.accessors

       // end for #each accessor

       return result;
     };


     // method getTypeName() returns string
     Grammar.VariableRef.prototype.getTypeName = function(){

         var avType = this.tryGetReference({informError: true, isForward: true, isDummy: true});
          // #get type name
         var typeStr = avType.name;
         // if typeStr is 'prototype'
         if (typeStr === 'prototype') {
             typeStr = avType.parent.name;
         };
         // end if

         return typeStr;
     };

   // append to class Grammar.AssignmentStatement ###

     // method produce()
     Grammar.AssignmentStatement.prototype.produce = function(){

       this.out(this.lvalue, ' ', operTranslate(this.name), ' ');
       this.out(this.rvalue);
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


    // method getOwnerPrefix() returns string
    ASTBase.prototype.getOwnerPrefix = function(){

// check if we're inside a ClassDeclaration or AppendToDeclaration.
// return prefix for item to be appended

       var parent = this.getParent(Grammar.ClassDeclaration);

       // if no parent, return
       if (!parent) {return;};

       var ownerName = undefined, toPrototype = undefined;
       // if parent instance of Grammar.AppendToDeclaration
       if (parent instanceof Grammar.AppendToDeclaration) {
          // #append to class prototype or object
          // declare parent:Grammar.AppendToDeclaration
         toPrototype = !(parent.toNamespace);
         ownerName = parent.varRef.toString();
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
// See: Grammar.VariableDecl

     // method produce()
     Grammar.PropertiesDeclaration.prototype.produce = function(){

        //.outLinesAsComment .lineInx, .lastLineInxOf(.list)

       this.out('any ', {CSL: this.list}, ";");
        //for each varDecl in
        //    .out varDecl,";",NL

//         var prefix
//         // AppendToDeclaration extends NamespaceDeclaration extends ClassDeclaration
//         if .getParent(Grammar.NamespaceDeclaration) into var parent:Grammar.NamespaceDeclaration
//             // for NamespaceDeclaration and Append-to namespace, declare vars with prefix
//             if parent.toNamespace, prefix = .getOwnerPrefix()
//         for each varDecl in .list
//             varDecl.produce(prefix)
//             .out ";",NL

// if varDecl.assignedValue #is not valid to assign to .prototype. - creates subtle errors later
//             if prefix instance of Array and prefix[1] and prefix[1] isnt '.', .throwError 'cannot assign values to instance properties in "Append to"'
//             .out '    ',prefix, varDecl.name,"=",varDecl.assignedValue,";",NL
       this.skipSemiColon = true;
     };


   // append to class Grammar.VarDeclList ###

     // method produceAssignments(className)
     Grammar.VarDeclList.prototype.produceAssignments = function(className){

       var count = 0;

       // for each variableDecl in .list
       for( var variableDecl__inx=0,variableDecl ; variableDecl__inx<this.list.length ; variableDecl__inx++){variableDecl=this.list[variableDecl__inx];
           // if count++ and no className, .out ", "
           if (count++ && !className) {this.out(", ");};
           variableDecl.produceAssignment(className);
           // if className, .out ";",NL
           if (className) {this.out(";", NL);};
       };// end for each in this.list

       // if count and no className, .out ";",NL
       if (count && !className) {this.out(";", NL);};
     };

   // append to class Grammar.VarStatement ###

// 'var' followed by a list of comma separated: var names and optional assignment

     // method produceDeclare()
     Grammar.VarStatement.prototype.produceDeclare = function(){
       this.out('var ', {CSL: this.list}, ";", NL);
     };

     // method produce()
     Grammar.VarStatement.prototype.produce = function(){

        // declare valid .compilerVar
        // declare valid .export

//         if .keyword is 'let' and .compilerVar('ES6')
//           .out 'let '
//         else
//           .out 'var '
//         

       this.out('var ');

// Now, after 'var' (alias for 'any') out one or more comma separated VariableDecl

       this.produceAssignments();
     };

// If 'var' was adjectivated 'export', add to exportNamespace

//         if not .lexer.out.browser
//               if .export and not .default
//                 .out ";", NL,{COMMENT:'export'},NL
//                 for each varDecl in .list
//                     .out .lexer.out.exportNamespace,'.',varDecl.name,' = ', varDecl.name, ";", NL
//                 .skipSemiColon = true
//         


   // append to class Grammar.ImportStatement ###

// 'import' followed by a list of comma separated: var names and optional assignment

     // method produce()
     Grammar.ImportStatement.prototype.produce = function(){

       // for each item in .list
       for( var item__inx=0,item ; item__inx<this.list.length ; item__inx++){item=this.list[item__inx];
           this.out('#include "', item.getBaseFilename(), '.h"', NL);
       };// end for each in this.list

       this.skipSemiColon = true;
     };


   // append to class Grammar.VariableDecl ###

// variable name and optionally assign a value

     // method produceAssignment(className)
     Grammar.VariableDecl.prototype.produceAssignment = function(className){

           // if className, .out '((',className,'_ptr)this.value.ptr)->'
           if (className) {this.out('((', className, '_ptr)this.value.ptr)->');};
           this.out(this.name, ' = ');

           // if .assignedValue
           if (this.assignedValue) {
               this.out(this.assignedValue);
           }
           
           else {
               this.out('undefined');
           };
     };


      //method produce(options)
      //      .out .name

//           if no .nameDecl, .sayErr "INTERNAL ERROR: var '#{.name}' has no .nameDecl"
//           var typeNameDecl = .nameDecl.findMember("**proto**")
//           var typeStr
//           if no typeNameDecl
//               //.sayErr "can't determine type for var '#{.name}'"
//               // if no explicit type assume "any"
//               typeStr = 'any'
//           else
//               typeStr = typeNameDecl.name
//               if typeNameDecl.name is 'prototype'
//                   var parentName = typeNameDecl.parent.name
//                   typeStr = parentName is 'String'?'str' else "#{parentName}_ptr";
//               end if
//           .out typeStr ,' ', .name
//           


    // #end VariableDecl


   // append to class Grammar.SingleLineStatement ###

     // method produce()
     Grammar.SingleLineStatement.prototype.produce = function(){

       this.out("{", {CSL: this.statements, separator: ";"}, ";", "}");
     };


   // append to class Grammar.IfStatement ###

     // method produce()
     Grammar.IfStatement.prototype.produce = function(){

        // declare valid .elseStatement.produce
       this.conditional.produceType = 'Bool';
       this.out("if (", this.conditional, ") ");

       // if .body instanceof Grammar.SingleLineStatement
       if (this.body instanceof Grammar.SingleLineStatement) {
           this.out(this.body);
       }
       
       else {
           this.out(" {", this.getEOLComment());
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

        // declare valid .variant.produce
       this.variant.produce();

// Since al 3 cases are closed with '}; //comment', we skip statement semicolon

       this.skipSemiColon = true;
     };


   // append to class Grammar.ForEachProperty
// ### Variant 1) 'for each property' to loop over *object property names*

// `ForEachProperty: for each [own] property name-VariableDecl in object-VariableRef`

     // method produce()
     Grammar.ForEachProperty.prototype.produce = function(){

       this.sayErr("'for each property' not supported for C production");
     };
//         //declare valid iterable.root.name.hasSideEffects
//         //if iterable.operandCount>1 or iterable.root.name.hasSideEffects or iterable.root.name instanceof Grammar.Literal
//           var listName:string = ASTBase.getUniqueVarName('list')  #unique temp listName var name
//           .out "any * ",listName,"=",.iterable,"->base;",NL
//           if .mainVar
//             .out "var ", .mainVar.name,"=undefined;",NL
//           .out "for ( var ", .indexVar.name, " in ", listName, ")"
//           if .ownOnly
//               .out "if (",listName,".hasOwnProperty(",.indexVar,"))"
//           if .mainVar
//               .body.out "{", .mainVar.name,"=",listName,"[",.indexVar,"];",NL
//           .out .where
//           .body.out "{", .body, "}",NL
//           if .mainVar
//             .body.out NL, "}"
//           .out {COMMENT:"end for each property"},NL
//         

   // append to class Grammar.ForEachInArray
// ### Variant 2) 'for each index' to loop over *Array indexes and items*

// `ForEachInArray: for each [index-VariableDecl,]item-VariableDecl in array-VariableRef`

     // method produce()
     Grammar.ForEachInArray.prototype.produce = function(){

// Create a default index var name if none was provided

       var listName = undefined;
        // declare valid .iterable.root.name.hasSideEffects
       // if .iterable.operandCount>1 or .iterable.root.name.hasSideEffects or .iterable.root.name instanceof Grammar.Literal
       if (this.iterable.operandCount > 1 || this.iterable.root.name.hasSideEffects || this.iterable.root.name instanceof Grammar.Literal) {
           listName = ASTBase.getUniqueVarName('list');// #unique temp listName var name
           this.out("any ", listName, "=", this.iterable, ";", NL);
       }
       
       else {
           listName = this.iterable;
       };

       var startValue = "0";
       var intIndexVarName = undefined;
       // if .indexVar
       if (this.indexVar) {
           this.out("any ", this.indexVar, "=undefined;", NL);
           intIndexVarName = this.indexVar.name;
           startValue = this.indexVar.assignedValue || "0";
       }
       
       else {
           intIndexVarName = this.mainVar.name + '__inx';
       };

       this.out("any ", this.mainVar.name, "=undefined;", NL);

       this.out("for(int ", intIndexVarName, "=", startValue, " ; ", intIndexVarName, "<", listName, ".value.arr->length", " ; ", intIndexVarName, "++){");

       // if .isMap
       if (this.isMap) {
           // if .indexVar, .body.out .indexVar,"=",listName,".value.map->keys[",intIndexVarName,"];",NL
           if (this.indexVar) {this.body.out(this.indexVar, "=", listName, ".value.map->keys[", intIndexVarName, "];", NL);};
           this.body.out(this.mainVar.name, "=", listName, ".value.map->values[", intIndexVarName, "];", NL);
       }
       
       else {
            // #Array
           this.body.out(this.mainVar.name, "=", listName, ".value.arr->item[", intIndexVarName, "];", NL);
       };

       // if .where
       if (this.where) {
         this.out('  ', this.where, "{", this.body, "}");
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

        // indicate .indexVar is a native number, so no ".value.number" required to produce a number
       this.indexVar.nameDecl.members.set('**proto**', '**nativeNumber**');

       this.indexVar.assignedValue.produceType = 'Number';

       this.out("for(int64_t ", this.indexVar.name, "=", this.indexVar.assignedValue || "0", "; ");

       // if .conditionPrefix is 'to'
       if (this.conditionPrefix === 'to') {
            // #'for n=0 to 10' -> for(n=0;n<=10;...
           this.endExpression.produceType = 'Number';
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

       this.expr.produceType = 'Bool';
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
       this.out("//do nothing", NL);
     };

   // append to class Grammar.ParenExpression ###
// A `ParenExpression` is just a normal expression surrounded by parentheses.

      // properties
        // produceType

     // method produce()
     Grammar.ParenExpression.prototype.produce = function(){
       this.expr.produceType = this.produceType;
       this.out("(", this.expr, ")");
     };

   // append to class Grammar.ArrayLiteral ###

// A `ArrayLiteral` is a definition of a list like `[1, a, 2+3]`. We just pass this through to JavaScript.

     // method produce()
     Grammar.ArrayLiteral.prototype.produce = function(){

       this.out("_newArrayWith(");

       // if no .items or .items.length is 0
       if (!this.items || this.items.length === 0) {
           this.out("0,NULL");
       }
       
       else {
            // e.g.: LiteScript:   var list = [a,b,c]
            // e.g.: "C": any list = (any){Array_TYPEID,.value.arr=&(Array_s){3,.item=(any_arr){a,b,c}}};
           this.out(this.items.length, ",(any_arr){", {CSL: this.items}, "}");
       };

       this.out(")");
     };

// else
//             // e.g.: LiteScript:   var list = [a,b,c]
//             // e.g.: "C": any list = (any){Array_TYPEID,.value.arr=&(Array_s){3,.item=(any_arr){a,b,c}}};
//             .out "(any){Array_TYPEID,.value.arr=&(Array_s){#{.items.length},.item=(any_arr){",{CSL:.items},"}}}"
//         


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
       // if no .items or .items.length is 0
       if (!this.items || this.items.length === 0) {
           this.out("_newMap(0,NULL)");
       }
       
       else {
           this.out("{", {CSL: this.items}, "}");
       };
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

     // method produce()
     Grammar.FunctionDeclaration.prototype.produce = function(){

       var generatorMark = this.hasAdjective('generator') && this.compilerVar('ES6') ? "*" : "";
       var isConstructor = this instanceof Grammar.ConstructorDeclaration;
       var addThis = false;
       var ownerClass = undefined;
       var className = undefined;

// check if this is a 'constructor', 'method' or 'function'

       // if isConstructor
       if (isConstructor) {
           this.out("//class _init fn", NL);
           ownerClass = this.getParent(Grammar.ClassDeclaration);
           className = ownerClass.name;
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
            //.out .type or 'void',' '
           this.out('any ', className, '_', fixCReservedWord(this.name));

           addThis = true;

// For C production, we're using a dispatcher for each method name

           this.addMethodDispatcher(this.name, className);
       }

// else is a simple function
       
       else {
            //.out any [name]( any this, int argc, any * arguments )
           this.out('any ', ' ', fixCReservedWord(this.name));
       };

// Now, function parameters

       this.out(DEFAULT_ARGUMENTS);
        //.produceParameters className

// if 'nice', produce default nice body, and then the generator header for real body

//         var isNice = .nice and not (isConstructor or .shim or .definePropItems or .generator)
//         if isNice
//             var argsArray = (.paramsDeclarations or []).concat["__callback"]
//             .out "(", {CSL:argsArray},"){", .getEOLComment(),NL
//             .out '  nicegen(this, ',prefix,.name,"_generator, arguments);",NL
//             .out "};",NL
//             .out "function* ",prefix,.name,"_generator"
//         end if
//         


// start body

       // if no .body, .throwError 'function #{.name} has no body'
       if (!this.body) {this.throwError('function ' + this.name + ' has no body');};

       this.body.out("{", this.getEOLComment(), NL);

       // if className
       if (className) {
           this.body.out(NL, NL, "// validate this type", NL, "assert(this.type==", className, "_TYPEID);", NL, "//---------", NL);
       };

       // if .paramsDeclarations and .paramsDeclarations.length
       if (this.paramsDeclarations && this.paramsDeclarations.length) {

               this.body.out("// define named params", NL);

               // if .paramsDeclarations.length is 1
               if (this.paramsDeclarations.length === 1) {
                   this.body.out("var ", this.paramsDeclarations[0].name, "= argc? arguments[0] : undefined;", NL);
               }
               
               else {
                   var namedParams = [];

                   // for each paramDecl in .paramsDeclarations
                   for( var paramDecl__inx=0,paramDecl ; paramDecl__inx<this.paramsDeclarations.length ; paramDecl__inx++){paramDecl=this.paramsDeclarations[paramDecl__inx];
                       namedParams.push(paramDecl.name);
                   };// end for each in this.paramsDeclarations

                   this.body.out("var ", {CSL: namedParams}, ";", NL, namedParams.join("="), "=undefined;", NL, "switch(argc){", NL);

                   // for inx=namedParams.length-1, while inx>=0, inx--
                   for( var inx=namedParams.length - 1; inx >= 0; inx--) {
                       this.body.out("  case " + (inx + 1) + ":" + (namedParams[inx]) + "=arguments[" + inx + "];", NL);
                   };// end for inx

                   this.body.out("}", NL);
               };

               // end if
               this.body.out("//---------", NL);
       };

       // end if //named params


// if is __init, assign initial values for properties

       // if isConstructor
       if (isConstructor) {
           ownerClass.producePropertyAssignments(className);
       };

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
                   this.body.out(" try{", NL);
                   // break
                   break;
               };
           };// end for each in this.body.statements
           
       };

// if params defaults where included, we assign default values to arguments
// (if ES6 enabled, they were included abobve in ParamsDeclarations production )

// no on C
//         if .paramsDeclarations and not .compilerVar('ES6')
//             for each paramDecl in .paramsDeclarations
//                 if paramDecl.assignedValue
//                     .body.assignIfUndefined paramDecl.name, paramDecl.assignedValue
//             #end for
//         #end if
//         

// now produce function body

       this.body.produce();

// close the function, add source map for function default "return undefined".

       this.out("}");
        //ifdef PROD_C
       // do nothing
       null;
        // #else
        //if .lexer.out.sourceMap
            //.lexer.out.sourceMap.add ( .EndFnLineNum, 0, .lexer.out.lineNum-1, 0)
        // #endif

// if we were coding .definePropItems , close Object.defineProperty

//         if .definePropItems
//             for each definePropItem in .definePropItems
//                 .out NL,",",definePropItem.name,":", definePropItem.negated? 'false':'true'
//             end for
//             .out NL,"})"

// If the function was adjectivated 'export/public', add to .h

        //if .export and not .default and this isnt instance of Grammar.ConstructorDeclaration
       // if true and this isnt instance of Grammar.ConstructorDeclaration
       if (true && !(this instanceof Grammar.ConstructorDeclaration)) {
           this.out({h: 1}, NL);
           this.out("extern ");
           // if this is instance of Grammar.MethodDeclaration
           if (this instanceof Grammar.MethodDeclaration) {
                //.out .type or 'void',' '
               this.out('any ', className, '_', fixCReservedWord(this.name));
           }
                //.out .type or 'void',' '
           
           else {
               this.out('any ', ' ', fixCReservedWord(this.name));
           };

            //.produceParameters className
           this.out("( DEFAULT_ARGUMENTS );", NL, {h: 0});
       };
     };

// #### method produceParameters(className)
// if this is a class method, add "this" as first parameter
//         var isConstructor = this is instance of Grammar.ConstructorDeclaration
//         if isConstructor
//           or this is instance of Grammar.MethodDeclaration
//             .out "(", (isConstructor?"any":"#{className}_ptr") ," this"
//             if .paramsDeclarations.length
//                 .out ',',{CSL:.paramsDeclarations}
//             .out ")"
//         else
//             //just function parameters declaration
//             .out "(", {CSL:.paramsDeclarations}, ")"
//     


// --------------------
   // append to class Grammar.PrintStatement ###
// `print` is an alias for console.log

     // method produce()
     Grammar.PrintStatement.prototype.produce = function(){

       // if .args.length
       if (this.args.length) {
           this.out('console_log_(NONE,' + this.args.length + ',(any_arr){', {CSL: this.args}, '})');
       }
       
       else {
           this.out('console_log_(NONE,0,NULL)');
       };
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
   // append to class Grammar.ImportStatementItem ###

       // method getBaseFilename return .importParameter?.importParameter.getValue():.name
       Grammar.ImportStatementItem.prototype.getBaseFilename = function(){return this.importParameter ? this.importParameter.getValue() : this.name};

// --------------------
   // append to class Grammar.DeclareStatement ###

// Out as comments

     // method produce()
     Grammar.DeclareStatement.prototype.produce = function(){

       // if .hasAdjective('global')
       if (this.hasAdjective('global')) {

         this.out({h: 1}, NL);

         // for each item in .list
         for( var item__inx=0,item ; item__inx<this.list.length ; item__inx++){item=this.list[item__inx];
           this.out('#include "', item.getBaseFilename(), '.h"', NL);
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

       log.debug("produce: " + this.constructor.name + " " + this.name);

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

       // end if has .body

// In C we create a struct for "instance properties" of each class

       // if .constructor is Grammar.NamespaceDeclaration
       if (this.constructor === Grammar.NamespaceDeclaration) {

            //.out no .varRef.accessors? 'var ':'' ,.varRef,'={};'
            // declare .name:string
           this.name = this.name.replace(/\./g, '_');

           this.out('any ' + (fixCReservedWord(this.name)) + '={.type=0}; //declare singleton', NL, 'void ' + this.name + '__init_singleton(){', NL, '   if (!' + (fixCReservedWord(this.name)) + '.type) ' + (fixCReservedWord(this.name)) + '=new(' + this.name + '_TYPEID,0,NULL);', NL, '};', NL);

           this.out({h: 1}, NL, "//-------------------", NL, "//.namespace ", this.name, NL, 'extern any ' + (fixCReservedWord(this.name)) + '; //' + this.name + ' is a singleton', NL, 'void ' + this.name + '__init_singleton();', NL, "//-------------------", NL); //start header output
       }
       
       else {
           this.out({h: 1}, NL); //start header output
           this.out({COMMENT: "class"}, this.name);
           // if .varRefSuper
           if (this.varRefSuper) {
               this.out(' extends ', this.varRefSuper, NL);
           }
           
           else {
               this.out(NL);
           };
       };

       // end if

        // generate unique class id
       this.out("#define " + this.name + "_TYPEID ", ASTBase.getUniqueID('TYPEID'), NL);

        //.out NL,"// declare:",NL
        //.out "// #{.name}_ptr : type = ptr to instance",NL
       this.out("typedef struct ", this.name, "_s * ", this.name, "_ptr;", NL);

        //.out "// struct #{.name}_s = struct with instance properties",NL
       this.out("typedef struct ", this.name, "_s {", NL);
       // for each propertiesDeclaration in PropertiesDeclarationStatements
       for( var propertiesDeclaration__inx=0,propertiesDeclaration ; propertiesDeclaration__inx<PropertiesDeclarationStatements.length ; propertiesDeclaration__inx++){propertiesDeclaration=PropertiesDeclarationStatements[propertiesDeclaration__inx];
           propertiesDeclaration.produce();
       };// end for each in PropertiesDeclarationStatements
       this.out("} ", this.name, "_s;", NL, NL);

// export class__init(), constructor

       this.out("extern void ", this.name, "__init", DEFAULT_ARGUMENTS, ";");
//         if theConstructor
//             theConstructor.produceParameters .name
//         else
//             //default constructor
//             .out DEFAULT_ARGUMENTS
//         end if
//         .out ";",NL,NL
//         

       this.out({h: 0}, NL); //end header output

        // keep a list of classes|namespaces in each moudle, to out __registerClass
       classes.push(this);


// Now on the .c file:

// a) the __init constructor ( void function [name]__init)

        //.out {COMMENT:"constructor"},NL

       // if theConstructor
       if (theConstructor) {
           theConstructor.produce();
           this.out(";", NL);
       }
       
       else {
           this.out("//auto ", this.name, "__init", NL);
           this.out("void ", this.name, "__init", DEFAULT_ARGUMENTS, "{", NL);
           // if .varRefSuper and .varRefSuper.toString() isnt 'Object'
           if (this.varRefSuper && this.varRefSuper.toString() !== 'Object') {
               this.out("    ", {COMMENT: ["//auto call super__init, to initialize first part of space at *this.value.ptr"]}, NL);
               this.out("    ", this.varRefSuper, "__init(this,argc,arguments);", NL);
           };

            //initialize properties with assigned values
           this.producePropertyAssignments(this.name);

            // en default constructor
           this.out("};", NL);
       };

       // end if


// b) the methods

// now out methods, which means create functions
// named: class__fnName

       this.out(theMethods);

// If the class was adjectivated 'export', add to module.exports
//         if not .lexer.out.browser
//           if .export and not .default
//             .out NL,{COMMENT:'export'},NL
//             .out .lexer.out.exportNamespace,'.',.name,' = ', .name,';'
//       

        // .out NL,{COMMENT:'end class '},.name,NL
       this.skipSemiColon = true;
    };

    // method producePropertyAssignments(className)
    Grammar.ClassDeclaration.prototype.producePropertyAssignments = function(className){

       // if .body
       if (this.body) {
           // for each item in .body.statements where item.statement is instance of Grammar.PropertiesDeclaration
           for( var item__inx=0,item ; item__inx<this.body.statements.length ; item__inx++){item=this.body.statements[item__inx];
             if(item.statement instanceof Grammar.PropertiesDeclaration){
                // declare item.statement:Grammar.PropertiesDeclaration
                //initialize properties with assigned values
               item.statement.produceAssignments(className);
           }};// end for each in this.body.statements
           
       };
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

       Grammar.ClassDeclaration.prototype.produce.call(this);
     };

//         //.out no .varRef.accessors? 'var ':'' ,.varRef,'={};'
//         var namespaceName = .varRef.toString().replace(/\./g,'_')
//         .out "//-------------------",NL
//         .out "//namespace ", namespaceName ,NL
//         .out .body
//         //.out .body
//         .skipSemiColon = true

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
           this.out('switch(anyToInt64(', this.varRef, ')){', NL);
           this.out(this.cases);
           // if .defaultBody, .out 'default:',.defaultBody
           if (this.defaultBody) {this.out('default:', this.defaultBody);};
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
         if (this.defaultBody) {this.out(NL, 'else {', this.defaultBody, '}');};
       };
     };


   // append to class Grammar.SwitchCase ###

     // method produce()
     Grammar.SwitchCase.prototype.produce = function(){

       // for each expression in .expressions
       for( var expression__inx=0,expression ; expression__inx<this.expressions.length ; expression__inx++){expression=this.expressions[expression__inx];
           expression.produceType = 'Number';
       };// end for each in this.expressions

       this.out({pre: 'case ', CSL: this.expressions, post: ':', separator: ' '});
       this.out(this.body);
       this.body.out('break;', NL);
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
               caseWhenSection.out('if(', {pre: '' + caseVar + '==(', CSL: caseWhenSection.expressions, post: ')', separator: '||'}, ') return ', caseWhenSection.resultExpression, ';', NL);
           };// end for each in this.cases

           // if .elseExpression, .out '    return ',.elseExpression,';',NL
           if (this.elseExpression) {this.out('    return ', this.elseExpression, ';', NL);};
           this.out('        }(', this.varRef, '))');
       }

// else, it's a var-less case. we code it as chained ternary operators
       
       else {

         // for each caseWhenSection in .cases
         for( var caseWhenSection__inx=0,caseWhenSection ; caseWhenSection__inx<this.cases.length ; caseWhenSection__inx++){caseWhenSection=this.cases[caseWhenSection__inx];
             this.outLineAsComment(caseWhenSection.lineInx);
             caseWhenSection.booleanExpression.produceType = 'Bool';
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
       if (!((functionDeclaration=this.getParent(Grammar.FunctionDeclaration))) || !functionDeclaration.hasAdjective('nice')) {
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
     'is': '==', 
     'isnt': '!=', 
     '<>': '!=', 
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

    // helper method assignIfUndefined(name,expression)
    ASTBase.prototype.assignIfUndefined = function(name, expression){

         this.out("if(", name, '.type==UNDEFINED) ', name, "=", expression, ";", NL);
    };

    // helper method addMethodDispatcher(methodName,className)
    ASTBase.prototype.addMethodDispatcher = function(methodName, className){

// For C production, we're using a dispatcher for each method name

         methodName = fixCReservedWord(methodName);

          // look in existing dispatchers
         // if not allDispatchersNameDecl.findOwnMember(methodName) into var dispatcherNameDecl
         var dispatcherNameDecl=undefined;
         if (!((dispatcherNameDecl=allDispatchersNameDecl.findOwnMember(methodName)))) {
             dispatcherNameDecl = allDispatchersNameDecl.addMember(methodName);
         };

         // if className
         if (className) {
              //create a case for the class in the dispatcher
             // if dispatcherNameDecl.findOwnMember(className)
             if (dispatcherNameDecl.findOwnMember(className)) {
                 this.throwError("DUPLICATED METHOD: a method named '" + methodName + "' already exists for class '" + className + "'");
             };
             var caseNameDecl = dispatcherNameDecl.addMember(className);

              // #store a pointer to this FunctonDeclaration, to later code case call w parameters
             // if this is instance of Grammar.FunctionDeclaration
             if (this instanceof Grammar.FunctionDeclaration) {
                 caseNameDecl.funcDecl = this;
             };
         };
    };

// --------------------------------
