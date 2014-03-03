//Compiled by LiteScript compiler v0.6.1, source: /home/ltato/LiteScript/devel/source-v0.6/Producer_js.lite.md
   var ASTBase = require('./ASTBase');
   var Grammar = require('./Grammar');
   
    Grammar.Module.prototype.produce = function(){
       this.lexer.out.exportNamespace = 'module.exports';
       if (this.exportDefault instanceof Grammar.VarStatement) {
           
           
           if (this.exportDefault.list.length > 1) {
               this.exportDefault.throwError("only one var:Object alllowed for 'export default'")};
           this.lexer.out.exportNamespace = this.exportDefault.list[0].name;
       }
       else if (this.exportDefault instanceof ASTBase) {
           
           this.lexer.out.exportNamespace = this.exportDefault.name;
       };
       
       for( var statement__inx=0,statement ; statement__inx<this.statements.length ; statement__inx++){statement=this.statements[statement__inx];
       
         statement.produce();
       };
       this.out(NL);
       this.outPrevLinesComments(this.lexer.infoLines.length - 1);
       if (!(this.lexer.out.browser)) {
           if (this.lexer.out.exportNamespace !== 'module.exports') {
               this.out('module.exports=', this.lexer.out.exportNamespace, ";", NL);
           };
       };
    };
   
     Grammar.Body.prototype.produce = function(){
       for( var statement__inx=0,statement ; statement__inx<this.statements.length ; statement__inx++){statement=this.statements[statement__inx];
       
         statement.produce();
       };
       this.out(NL);
       this.addSourceMap();
     };
   
     Grammar.Statement.prototype.produce = function(){
       
       this.outPrevLinesComments();
       if (this.lexer.options.comments) {
         if (this.lexer.out.lastOriginalCodeComment < this.lineInx) {
           if (!(([Grammar.PrintStatement, Grammar.VarStatement, Grammar.CompilerStatement, Grammar.DeclareStatement, Grammar.AssignmentStatement, Grammar.ReturnStatement, Grammar.PropertiesDeclaration, Grammar.FunctionCall].indexOf(this.statement.constructor)>=0))) {
             this.out({COMMENT: this.lexer.infoLines[this.lineInx].text.trim()}, NL);
           };
         };
         this.lexer.out.lastOriginalCodeComment = this.lineInx;
       };
       if (!(this.statement instanceof Grammar.SingleLineStatement)) {
         this.lexer.out.ensureNewLine();
       };
       this.callOnSubTree("declareIntoVar", Grammar.Body);
       this.addSourceMap();
       this.out(this.statement);
       if (!(this.statement.skipSemiColon)) {
         this.out(";");
         if (!(this.statement.body)) {
           this.out(this.getEOLComment());
         };
       };
     };
   
     Grammar.Oper.prototype.declareIntoVar = function(){
         if (this.intoVar) {
             this.out("var ", this.right, "=undefined;", NL);
         };
     };
   
     Grammar.ThrowStatement.prototype.produce = function(){
         if (this.specifier === 'fail') {
           this.out("throw new Error(", this.expr, ")");
         }
         else {
           this.out("throw ", this.expr);
         };
     };
   
     Grammar.ReturnStatement.prototype.produce = function(){
       this.out("return");
       if (this.expr) {
         this.out(" ", this.expr);
       };
     };
   
     Grammar.FunctionCall.prototype.produce = function(){
       this.varRef.produce();
       if (this.varRef.executes) {
           return};
       this.out("()");
     };
   
     Grammar.Operand.prototype.produce = function(){
       this.out(this.name, this.accessors);
     };
   
     Grammar.UnaryOper.prototype.produce = function(){
       var translated = operTranslate(this.name);
       var prepend = undefined, append = undefined;
       if (translated === "!") {
           if (!((this.name === "no" && this.right.name instanceof Grammar.VariableRef))) {
               prepend = "(";
               append = ")";
           };
       }
       else if (/\w/.test(translated)) {
           translated += " ";
       };
       this.out(translated, prepend, this.right, append);
     };
   
     Grammar.Oper.prototype.produce = function(){
       var oper = this.name;
       var prepend = undefined, append = undefined;
       if (this.negated) {
           if (oper === 'is') {
               oper = '!==';
           }
           else {
               prepend = "!(";
               append = ")";
           };
       };
       if (this.name === 'in') {
           this.out(this.right, ".indexOf(", this.left, ")", this.negated ? "===-1" : ">=0");
           this.lexer.out.currLine = this.lexer.out.currLine.replace(/\barguments.indexOf\(/, 'Array.prototype.slice.call(arguments).indexOf(');
       }
       else if (this.name === 'has property') {
           this.out(prepend, this.right, " in ", this.left, append);
       }
       else if (this.name === 'into') {
           this.out("(", this.right, "=", this.left, ")");
       }
       else if (this.name === 'like') {
           this.out(prepend, this.right, ".test(", this.left, ")", append);
       }
       else {
           this.out(prepend, this.left, ' ', operTranslate(oper), ' ', this.right, append);
       };
     };
   
     Grammar.Expression.prototype.produce = function(options){
       
       if(!options) options={};
       
       var prepend = "";
       var append = "";
       if (options.negated) {
         if (this.operandCount === 1) {
             prepend = "!";
         }
         else {
             prepend = "!(";
             append = ")";
         };
       };
       this.out(prepend, this.root, append);
     };
   
     Grammar.VariableRef.prototype.produce = function(){
       this.out(this.preIncDec, this.name.translate(IDENTIFIER_ALIASES), this.accessors, this.postIncDec);
     };
   
     Grammar.AssignmentStatement.prototype.produce = function(){
       this.out(this.lvalue, ' ', operTranslate(this.name), ' ', this.rvalue);
     };
   
     Grammar.DefaultAssignment.prototype.produce = function(){
       this.process(this.assignment.lvalue, this.assignment.rvalue);
       this.skipSemiColon = true;
     };
     Grammar.DefaultAssignment.prototype.process = function(name, value){
         if (value instanceof Grammar.ObjectLiteral) {
           this.processItems(name, value);
         }
         else {
           this.assignIfUndefined(name, value);
         };
     };
     Grammar.DefaultAssignment.prototype.processItems = function(main, objectLiteral){
         this.out("if(!", main, ') ', main, "={};", NL);
         for( var nameValue__inx=0,nameValue ; nameValue__inx<objectLiteral.items.length ; nameValue__inx++){nameValue=objectLiteral.items[nameValue__inx];
         
           var itemFullName = [main, '.', nameValue.name];
           this.process(itemFullName, nameValue.value);
         };
         
     };
   
     Grammar.PropertyAccess.prototype.produce = function(){
       this.out(".", this.name);
     };
   
     Grammar.IndexAccess.prototype.produce = function(){
       this.out("[", this.name, "]");
     };
   
     Grammar.FunctionAccess.prototype.produce = function(){
       this.out("(", {CSL: this.args}, ")");
     };
   
    ASTBase.prototype.lastLineInxOf = function(list){
       var lastLine = this.lineInx;
       for( var item__inx=0,item ; item__inx<list.length ; item__inx++){item=list[item__inx];
       
           if (item.lineInx > lastLine) {
             lastLine = item.lineInx;
           };
       };
       return lastLine;
    };
    ASTBase.prototype.getOwnerPrefix = function(){
       var parent = this.getParent(Grammar.ClassDeclaration);
       if (!parent) {
           return};
       var ownerName = undefined, toPrototype = undefined;
       if (parent instanceof Grammar.AppendToDeclaration) {
         
         toPrototype = !(parent.toNamespace);
         ownerName = parent.varRef;
       }
       else {
         
         toPrototype = !(this.toNamespace);
         ownerName = parent.name;
       };
       return [ownerName, toPrototype ? ".prototype." : "."];
    };
   
     Grammar.PropertiesDeclaration.prototype.produce = function(prefix){
       this.outLinesAsComment(this.lineInx, this.lastLineInxOf(this.list));
       if (!prefix) {
           prefix = this.getOwnerPrefix()};
       for( var varDecl__inx=0,varDecl ; varDecl__inx<this.list.length ; varDecl__inx++){varDecl=this.list[varDecl__inx];
       
         if (varDecl.assignedValue) {
           if (prefix instanceof Array && prefix[1] && prefix[1] !== '.') {
               this.throwError('cannot assign values to instance properties in "Append to"')};
           this.out('    ', prefix, varDecl.name, "=", varDecl.assignedValue, ";", NL);
         };
       };
       this.skipSemiColon = true;
     };
   
     Grammar.VarStatement.prototype.produce = function(){
       
       
       
       if (this.keyword === 'let' && this.compilerVar('ES6')) {
         this.out('let ');
       }
       else {
         this.out('var ');
       };
       this.out({CSL: this.list, freeForm: this.list.length > 2});
       if (!(this.lexer.out.browser)) {
         if (this.export && !(this.default)) {
           this.out(";", NL, {COMMENT: 'export'}, NL);
           for( var varDecl__inx=0,varDecl ; varDecl__inx<this.list.length ; varDecl__inx++){varDecl=this.list[varDecl__inx];
           
               this.out(this.lexer.out.exportNamespace, '.', varDecl.name, ' = ', varDecl.name, ";", NL);
           };
           this.skipSemiColon = true;
         };
       };
     };
   
     Grammar.ImportStatement.prototype.produce = function(){
       for( var item__inx=0,item ; item__inx<this.list.length ; item__inx++){item=this.list[item__inx];
       
         var requireParam = item.importParameter ? item.importParameter.getValue() : item.name;
         this.out("var ", item.name, " = require('", this.global || requireParam[0] === '/' ? "" : "./", requireParam, "');", NL);
       };
       this.skipSemiColon = true;
     };
   
     Grammar.VariableDecl.prototype.produce = function(){
         this.out(this.name);
         
         if (this.parent instanceof Grammar.VarStatement) {
             this.out(' = ', this.assignedValue || 'undefined');
         }
         else {
           if (this.assignedValue && this.compilerVar('ES6')) {
               this.out(' = ', this.assignedValue);
           };
         };
     };
   
     Grammar.SingleLineStatement.prototype.produce = function(){
       var bare = [];
       for( var statement__inx=0,statement ; statement__inx<this.statements.length ; statement__inx++){statement=this.statements[statement__inx];
       
           bare.push(statement.statement);
       };
       this.out(NL, "    ", {CSL: bare, separator: ";"});
     };
   
     Grammar.IfStatement.prototype.produce = function(){
       
       if (this.body instanceof Grammar.SingleLineStatement) {
           this.out("if (", this.conditional, ") {", this.body, "}");
       }
       else {
           this.out("if (", this.conditional, ") {", this.getEOLComment());
           this.out(this.body, "}");
       };
       if (this.elseStatement) {
           this.outPrevLinesComments(this.elseStatement.lineInx - 1);
           this.elseStatement.produce();
       };
     };
   
     Grammar.ElseIfStatement.prototype.produce = function(){
       this.out(NL, "else ", this.nextIf);
     };
   
     Grammar.ElseStatement.prototype.produce = function(){
       this.out(NL, "else {", this.body, "}");
     };
   
     Grammar.ForStatement.prototype.produce = function(){
       
       
       var iterable = this.variant.iterable;
       
       if (iterable) {
         if (iterable.operandCount > 1 || iterable.root.name.hasSideEffects || iterable.root.name instanceof Grammar.Literal) {
           iterable = ASTBase.getUniqueVarName('list');
           this.out("var ", iterable, "=", this.variant.iterable, ";", NL);
         };
       };
       this.variant.produce(iterable);
       this.skipSemiColon = true;
     };
   
     Grammar.ForEachProperty.prototype.produce = function(iterable){
         if (this.mainVar) {
           this.out("var ", this.mainVar.name, "=undefined;", NL);
         };
         this.out("for ( var ", this.indexVar.name, " in ", iterable, ")");
         if (this.ownOnly) {
             this.out("if (", iterable, ".hasOwnProperty(", this.indexVar, "))");
         };
         if (this.mainVar) {
             this.body.out("{", this.mainVar.name, "=", iterable, "[", this.indexVar, "];", NL);
         };
         this.out(this.where);
         this.body.out("{", this.body, "}", NL);
         if (this.mainVar) {
           this.body.out(NL, "}");
         };
         this.out({COMMENT: "end for each property"}, NL);
     };
   
     Grammar.ForEachInArray.prototype.produce = function(iterable){
       var indexVar = this.indexVar;
       if (!indexVar) {
         indexVar = {name: this.mainVar.name + '__inx', assignedValue: 0};
       };
       this.out("for( var ", indexVar.name, "=", indexVar.assignedValue || "0", ",", this.mainVar.name, " ; ", indexVar.name, "<", iterable, ".length", " ; ", indexVar.name, "++){");
       this.body.out(this.mainVar.name, "=", iterable, "[", indexVar.name, "];", NL);
       if (this.where) {
         this.out(this.where, "{", this.body, "}");
       }
       else {
         this.out(this.body);
       };
       this.out("};", {COMMENT: ["end for each in ", this.iterable]}, NL);
     };
   
     Grammar.ForIndexNumeric.prototype.produce = function(iterable){
       
       this.out("for( var ", this.indexVar.name, "=", this.indexVar.assignedValue || "0", "; ");
       if (this.conditionPrefix === 'to') {
           this.out(this.indexVar.name, "<=", this.endExpression);
       }
       else {
         this.endExpression.produce({negated: this.conditionPrefix === 'until'});
       };
       this.out("; ");
       this.out(this.increment || [this.indexVar.name, "++"]);
       this.out(") ", this.where);
       this.out("{", this.body, "};", {COMMENT: "end for " + this.indexVar.name}, NL);
     };
   
     Grammar.ForWhereFilter.prototype.produce = function(){
       this.out('if(', this.filter, ')');
     };
   
     Grammar.DeleteStatement.prototype.produce = function(){
       this.out('delete ', this.varRef);
     };
   
     Grammar.WhileUntilExpression.prototype.produce = function(options){
       
       if(!options) options={};
       
       if (options.askFor && this.name !== options.askFor) {
           options.negated = true;
       };
       this.expr.produce(options);
     };
   
     Grammar.DoLoop.prototype.produce = function(){
       if (this.postWhileUntilExpression) {
           this.out("do{", this.getEOLComment());
           this.out(this.body);
           this.out("} while (");
           this.postWhileUntilExpression.produce({askFor: 'while'});
           this.out(")");
       }
       else {
           this.out('while(');
           if (this.preWhileUntilExpression) {
             this.preWhileUntilExpression.produce({askFor: 'while'});
           }
           else {
             this.out('true');
           };
           this.out('){', this.body, "}");
       };
       
       this.out(";", {COMMENT: "end loop"}, NL);
       this.skipSemiColon = true;
     };
   
     Grammar.LoopControlStatement.prototype.produce = function(){
       this.out(this.control);
     };
   
     Grammar.DoNothingStatement.prototype.produce = function(){
       this.out("null");
     };
   
     Grammar.ParenExpression.prototype.produce = function(){
       this.out("(", this.expr, ")");
     };
   
     Grammar.ArrayLiteral.prototype.produce = function(){
       this.out("[", {CSL: this.items}, "]");
     };
   
     Grammar.NameValuePair.prototype.produce = function(){
       this.out(this.name, ": ", this.value);
     };
   
     Grammar.ObjectLiteral.prototype.produce = function(){
       this.out("{", {CSL: this.items}, "}");
     };
   
     Grammar.FreeObjectLiteral.prototype.produce = function(){
       this.out("{", {CSL: this.items, freeForm: true}, "}");
     };
   
    Grammar.FunctionDeclaration.prototype.produce = function(theProperties){
     var generatorMark = this.generator && this.compilerVar('ES6') ? "*" : "";
     if (this instanceof Grammar.ConstructorDeclaration) {
         this.out("function ", this.getParent(Grammar.ClassDeclaration).name);
     }
     else if (this instanceof Grammar.MethodDeclaration) {
         var prefix=undefined;
         if (!((prefix=this.getOwnerPrefix()))) {
             throw new Error("method #.name. Can not determine owner object");
         };
         if (this.shim) {
             this.out("if (!", prefix, this.name, ")", NL)};
         if (this.definePropItems) {
             prefix[1] = prefix[1].replace(/\.$/, "");
             this.out("Object.defineProperty(", NL, prefix, ",'", this.name, "',{value:function", generatorMark);
         }
         else {
             this.out(prefix, this.name, " = function", generatorMark);
         };
     }
     else {
         this.out("function ", this.name, generatorMark);
     };
     this.out("(", {CSL: this.paramsDeclarations}, "){", this.getEOLComment());
     if (!this.body || !this.body.statements) {
         throw new Error('function ' + this.name + ' has no body')};
     for( var statement__inx=0,statement ; statement__inx<this.body.statements.length ; statement__inx++){statement=this.body.statements[statement__inx];
     
       if (statement.statement instanceof Grammar.ExceptionBlock) {
           this.out(" try{", NL);
           break;
       };
     };
     if (this.paramsDeclarations && !(this.compilerVar('ES6'))) {
         for( var paramDecl__inx=0,paramDecl ; paramDecl__inx<this.paramsDeclarations.length ; paramDecl__inx++){paramDecl=this.paramsDeclarations[paramDecl__inx];
         
           if (paramDecl.assignedValue) {
               this.body.assignIfUndefined(paramDecl.name, paramDecl.assignedValue);
           };
         };
         
     };
     if (theProperties) {
         for( var propDecl__inx=0,propDecl ; propDecl__inx<theProperties.length ; propDecl__inx++){propDecl=theProperties[propDecl__inx];
         
           propDecl.produce('this.');
         };
         
     };
     this.body.produce();
     this.out("}");
     if (this.definePropItems) {
         for( var definePropItem__inx=0,definePropItem ; definePropItem__inx<this.definePropItems.length ; definePropItem__inx++){definePropItem=this.definePropItems[definePropItem__inx];
         
           this.out(NL, ",", definePropItem.name, ":", definePropItem.negated ? 'false' : 'true');
         };
         
         this.out(NL, "})");
     };
     if (!(this.lexer.out.browser)) {
       if (this.export && !(this.default)) {
         this.out(";", NL, {COMMENT: 'export'}, NL);
         this.out(this.lexer.out.exportNamespace, '.', this.name, '=', this.name, ";");
         this.skipSemiColon = true;
       };
     };
    };
   
     Grammar.PrintStatement.prototype.produce = function(){
       this.out("console.log(", {"CSL": this.args}, ")");
     };
   
     Grammar.EndStatement.prototype.produce = function(){
       
       
       if (this.lexer.out.lastOriginalCodeComment < this.lineInx) {
         this.out({COMMENT: this.lexer.infoLines[this.lineInx].text});
       };
       this.skipSemiColon = true;
     };
   
     Grammar.CompilerStatement.prototype.produce = function(){
       this.outLineAsComment(this.lineInx);
       if (this.conditional) {
           if (this.compilerVar(this.conditional)) {
               
               this.body.produce();
           };
       };
       this.skipSemiColon = true;
     };
   
     Grammar.DeclareStatement.prototype.produce = function(){
       this.outLinesAsComment(this.lineInx, this.lastLineInxOf(this.names));
       this.skipSemiColon = true;
     };
   
     Grammar.ClassDeclaration.prototype.produce = function(){
       this.out({COMMENT: "constructor"}, NL);
       
       
       
       var theConstructor = null;
       var theMethods = [];
       var theProperties = [];
       var theNamespaceProperties = [];
       if (this.body) {
         for( var index=0,item ; index<this.body.statements.length ; index++){item=this.body.statements[index];
         
           if (item.statement instanceof Grammar.ConstructorDeclaration) {
             if (theConstructor) {
               this.throwError('Two constructors declared for class ' + this.name);
             };
             theConstructor = item.statement;
           }
           else if (item.statement instanceof Grammar.PropertiesDeclaration) {
             
             if (item.statement.toNamespace) {
                theNamespaceProperties.push(item.statement);
             }
             else {
                 theProperties.push(item.statement);
             };
           }
           else {
             theMethods.push(item);
           };
         };
         
       };
       if (theConstructor) {
         theConstructor.produce(theProperties);
         this.out(";", NL);
       }
       else {
         this.out("function ", this.name, "(){");
         if (this.varRefSuper) {
             this.out({COMMENT: ["default constructor: call super.constructor"]});
             this.out(NL, "    ", this.varRefSuper, ".prototype.constructor.apply(this,arguments)", NL);
         };
         for( var propDecl__inx=0,propDecl ; propDecl__inx<theProperties.length ; propDecl__inx++){propDecl=theProperties[propDecl__inx];
         
             propDecl.produce('this.');
         };
         this.out("};", NL);
       };
       if (this.varRefSuper) {
         this.out({COMMENT: [this.name, ' (extends|proto is) ', this.varRefSuper, NL]});
         this.out(this.name, '.prototype.__proto__ = ', this.varRefSuper, '.prototype;', NL);
       };
       for( var propDecl__inx=0,propDecl ; propDecl__inx<theNamespaceProperties.length ; propDecl__inx++){propDecl=theNamespaceProperties[propDecl__inx];
       
         propDecl.produce(this.name + '.');
       };
       this.out(theMethods);
       if (!(this.lexer.out.browser)) {
         if (this.export && !(this.default)) {
           this.out(NL, {COMMENT: 'export'}, NL);
           this.out(this.lexer.out.exportNamespace, '.', this.name, ' = ', this.name, ";");
         };
       };
       this.out(NL, {COMMENT: "end class "}, this.name, NL);
       this.skipSemiColon = true;
     };
   
     Grammar.AppendToDeclaration.prototype.produce = function(){
       this.out(this.body);
       this.skipSemiColon = true;
     };
   
     Grammar.NamespaceDeclaration.prototype.produce = function(){
       this.out(!this.varRef.accessors ? 'var ' : '', this.varRef, '={};');
       this.out(this.body);
       this.skipSemiColon = true;
     };
   
     Grammar.TryCatch.prototype.produce = function(){
       this.out("try{", this.body, this.exceptionBlock);
     };
   
     Grammar.ExceptionBlock.prototype.produce = function(){
       this.out(NL, "}catch(", this.catchVar, "){", this.body, "}");
       if (this.finallyBody) {
         this.out(NL, "finally{", this.finallyBody, "}");
       };
     };
   
     Grammar.SwitchStatement.prototype.produce = function(){
       if (this.varRef) {
           this.out("switch(", this.varRef, "){", NL, NL);
           for( var switchCase__inx=0,switchCase ; switchCase__inx<this.cases.length ; switchCase__inx++){switchCase=this.cases[switchCase__inx];
           
               this.out({pre: "case ", CSL: switchCase.expressions, post: ":", separator: ' '});
               this.out(switchCase.body);
               switchCase.body.out("break;", NL, NL);
           };
           if (this.defaultBody) {
               this.out("default:", this.defaultBody)};
           this.out(NL, "}");
       }
       else {
         for( var index=0,switchCase ; index<this.cases.length ; index++){switchCase=this.cases[index];
         
             this.outLineAsComment(switchCase.lineInx);
             this.out(index > 0 ? "else " : "", "if (");
             this.out({pre: "(", CSL: switchCase.expressions, post: ")", separator: "||"});
             this.out("){");
             this.out(switchCase.body);
             this.out(NL, "}");
         };
         if (this.defaultBody) {
             this.out(NL, "else {", this.defaultBody, "}")};
       };
     };
   
     Grammar.CaseWhenExpression.prototype.produce = function(){
       if (this.varRef) {
           var caseVar = ASTBase.getUniqueVarName('caseVar');
           this.out("(function(", caseVar, "){", NL);
           for( var caseWhenSection__inx=0,caseWhenSection ; caseWhenSection__inx<this.cases.length ; caseWhenSection__inx++){caseWhenSection=this.cases[caseWhenSection__inx];
           
               caseWhenSection.out("if(", {pre: "" + caseVar + "===(", CSL: caseWhenSection.expressions, post: ")", separator: '||'}, ") return ", caseWhenSection.resultExpression, ";", NL);
           };
           if (this.elseExpression) {
               this.out("    return ", this.elseExpression, ";", NL)};
           this.out("        }(", this.varRef, "))");
       }
       else {
         for( var caseWhenSection__inx=0,caseWhenSection ; caseWhenSection__inx<this.cases.length ; caseWhenSection__inx++){caseWhenSection=this.cases[caseWhenSection__inx];
         
             this.outLineAsComment(caseWhenSection.lineInx);
             caseWhenSection.out("(", caseWhenSection.booleanExpression, ") ? (", caseWhenSection.resultExpression, ") :", NL);
         };
         this.out("/* else */ ", this.elseExpression || 'undefined');
       };
     };
   
     Grammar.WaitForAsyncCall.prototype.produce = function(){
       
       
       this.out("wait.for(", {CSL: [this.call.funcRef].concat(this.call.args)}, ")");
     };
   var IDENTIFIER_ALIASES = {
     'on': 'true', 
     'off': 'false'
     };
   var NL = '\n';
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
   function operTranslate(name){
     return name.translate(OPER_TRANSLATION);
   };
   
    
    ASTBase.prototype.assignIfUndefined = function(name, value){
         
         if (value.root.name.name === 'undefined') {
           this.out({COMMENT: [name, ": undefined", NL]});
           return;
         };
         this.out("if(", name, '===undefined) ', name, "=", value, ";", NL);
    };
