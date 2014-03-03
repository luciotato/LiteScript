//Compiled by LiteScript compiler v0.6.1, source: /home/ltato/LiteScript/devel/source-v0.6/ASTBase.lite.md
   var Lexer = require('./Lexer');
   var log = require('./log');
   var debug = log.debug;
   
    function ASTBase(parent, name){
       this.parent = parent;
       this.name = name;
       this.lexer = parent.lexer;
       if (this.lexer) {
         this.sourceLineNum = this.lexer.sourceLineNum;
         this.column = this.lexer.token.column;
         this.indent = this.lexer.indent;
         this.lineInx = this.lexer.lineInx;
       };
    };
   
    ASTBase.prototype.lock = function(){
       this.locked = true;
    };
    ASTBase.prototype.getParent = function(searchedClass){
       var node = this;
       while(node && !((node instanceof searchedClass))){
           node = node.parent;
       };
       return node;
    };
    ASTBase.prototype.positionText = function(){
       if (!(this.lexer)) {
           return "(compiler-defined)"};
       return "" + this.lexer.filename + ":" + this.sourceLineNum + ":" + (this.column || 0);
    };
    ASTBase.prototype.toString = function(){
       return "[" + this.constructor.name + "]";
    };
    ASTBase.prototype.throwError = function(msg){
       var err = new Error("" + (this.positionText()) + ". " + msg);
       err.controled = true;
       throw err;
    };
    ASTBase.prototype.sayErr = function(msg){
       log.error(this.positionText(), msg);
    };
    ASTBase.prototype.throwParseFailed = function(msg){
       var err = new Error("" + (this.lexer.posToString()) + ". " + msg);
       err.soft = !(this.locked);
       err.controled = true;
       throw err;
    };
    ASTBase.prototype.parse = function(){
       this.throwError('Parser Not Implemented: ' + this.constructor.name);
    };
    ASTBase.prototype.produce = function(){
       this.out(this.name);
    };
    ASTBase.prototype.parseDirect = function(key, directObj){
       if (directObj.hasOwnProperty(key)) {
           var param = directObj[key];
           var statement = (param instanceof Array) ? (this.opt.apply(this, param)) :
           /* else */ this.opt(param);
           if (statement) {
               statement.keyword = key};
           return statement;
       };
    };
    ASTBase.prototype.opt = function(){
       var startPos = this.lexer.getPos();
       
       
       var spaces = this.levelIndent();
       for( var searched__inx=0,searched ; searched__inx<arguments.length ; searched__inx++){searched=arguments[searched__inx];
       
         
         if (!searched) {
             continue};
         if (typeof searched === 'string') {
           var isTYPE = /^[A-Z_]+$/.test(searched);
           var found = undefined;
           if (isTYPE) {
             found = this.lexer.token.type === searched;
           }
           else {
             found = this.lexer.token.value === searched;
           };
           if (found) {
             debug(spaces, this.constructor.name, 'matched OK:', searched, this.lexer.token.value);
             var result = this.lexer.token.value;
             this.lexer.nextToken();
             return result;
           };
         }
         else {
           debug(spaces, this.constructor.name, 'TRY', searched.name, 'on', this.lexer.token.toString());
           try{
               var astNode = new searched(this);
               astNode.parse();
               debug(spaces, 'Parsed OK!->', searched.name);
               return astNode;
           
           }catch(err){
             if (err.soft) {
                 this.lexer.softError = err;
                 debug(spaces, searched.name, 'parse failed.', err.message);
                 debug("<<REW to", "" + startPos.sourceLineNum + ":" + (startPos.token.column || 0) + " [" + startPos.index + "]", startPos.token.toString());
                 this.lexer.setPos(startPos);
             }
             else {
                 if (this.lexer.hardError === null) {
                     this.lexer.hardError = err;
                 };
                 throw err;
             };
           };
         };
       };
       return undefined;
    };
    ASTBase.prototype.req = function(){
       var result = this.opt.apply(this, arguments);
       if (!result) {
         this.throwParseFailed("" + this.constructor.name + ": found " + (this.lexer.token.toString()) + " but " + (this.listArgs(arguments)) + " required");
       };
       return result;
    };
    ASTBase.prototype.reqOneOf = function(arr){
       if (arr.indexOf(this.lexer.token.value)>=0) {
           return this.req.apply(this, arr);
       }
       else {
           this.throwParseFailed("not in list");
       };
    };
    ASTBase.prototype.optList = function(){
       var item = undefined;
       var list = [];
       while(true){
         item = this.opt.apply(this, arguments);
         if (!item) {
             break};
         list.push(item);
       };
       return list.length ? list : undefined;
    };
    ASTBase.prototype.optSeparatedList = function(astClass, separator, closer){
       var result = [];
       var optSepar = 'NEWLINE';
       if (closer === 'NEWLINE') {
           optSepar = undefined;
       }
       else if (this.lexer.token.type === 'NEWLINE') {
         return this.optFreeFormList(astClass, separator, closer);
       };
       debug("optSeparatedList [" + this.constructor.name + "] indent:" + this.indent + ", get SeparatedList of [" + astClass.name + "] by '" + separator + "' closer:", closer || '-no closer-');
       var startLine = this.lexer.sourceLineNum;
       while(!this.opt(closer)){
           var item = this.req(astClass);
           this.lock();
           result.push(item);
           var consumedNewLine = this.opt(optSepar);
           if (this.opt(closer)) {
               break};
           if (!this.opt(separator)) {
             if (closer) {
                 this.throwError("Expected '" + closer + "' to end list started at line " + startLine)};
             if (consumedNewLine) {
                 this.lexer.returnToken()};
             break;
           };
           
           this.opt(optSepar);
       };
       return result;
    };
    ASTBase.prototype.optFreeFormList = function(astClass, separator, closer){
       var result = [];
       var lastItemSourceLine = -1;
       var separatorAfterItem = undefined;
       var parentIndent = this.parent.indent;
       this.req("NEWLINE");
       var startLine = this.lexer.sourceLineNum;
       var blockIndent = this.lexer.indent;
       debug("optFreeFormList [" + this.constructor.name + "] parentname:" + this.parent.name + " parentIndent:" + parentIndent + ", blockIndent:" + blockIndent + ", get SeparatedList of [" + astClass.name + "] by '" + separator + "' closer:", closer || '-no-');
       if (blockIndent <= parentIndent) {
         this.lexer.sayErr("free-form SeparatedList: next line is same or less indented (" + blockIndent + ") than parent indent (" + parentIndent + ") - assume empty list");
         return result;
       };
       while(!this.opt(closer)){
           debug("freeForm Mode .lexer.indent:" + this.lexer.indent + " block indent:" + blockIndent + " parentIndent:" + parentIndent);
           if (this.lexer.indent !== blockIndent) {
                 if (closer) {
                   this.lexer.throwErr("Misaligned indent: " + this.lexer.indent + ". Expected " + blockIndent + ", or '" + closer + "' to end block started at line " + startLine);
                 };
                 if (this.lexer.indent > blockIndent) {
                   this.lexer.throwErr("Misaligned indent: " + this.lexer.indent + ". Expected " + blockIndent + " to continue block, or " + parentIndent + " to close block started at line " + startLine);
                 };
                 break;
           };
           
           if (!(separatorAfterItem) && this.lexer.sourceLineNum === lastItemSourceLine) {
               this.lexer.sayErr("More than one [" + astClass.name + "] on line " + lastItemSourceLine + ". Missing ( ) on function call?");
           };
           lastItemSourceLine = this.lexer.sourceLineNum;
           var item = this.req(astClass);
           this.lock();
           result.push(item);
           this.opt('NEWLINE');
           separatorAfterItem = this.opt(separator);
           this.opt('NEWLINE');
       };
       debug("END freeFormMode [" + this.constructor.name + "] blockIndent:" + blockIndent + ", get SeparatedList of [" + astClass.name + "] by '" + separator + "' closer:", closer || '-no closer-');
       return result;
    };
    ASTBase.prototype.reqSeparatedList = function(astClass, separator, closer){
       var result = this.optSeparatedList(astClass, separator, closer);
       if (result.length === 0) {
           this.throwParseFailed("" + this.constructor.name + ": Get list: At least one [" + astClass.name + "] was expected")};
       return result;
    };
    ASTBase.prototype.listArgs = function(args){
       var msg = [];
       for( var i__inx=0,i ; i__inx<args.length ; i__inx++){i=args[i__inx];
       
           
           if (typeof i === 'string') {
               msg.push("'" + i + "'");
           }
           else if (i) {
               if (typeof i === 'function') {
                 msg.push("[" + i.name + "]");
               }
               else {
                 msg.push("<" + i.name + ">");
               };
           }
           else {
               msg.push("[null]");
           };
       };
       return msg.join('|');
    };
    ASTBase.prototype.out = function(){
       for( var item__inx=0,item ; item__inx<arguments.length ; item__inx++){item=arguments[item__inx];
       
         
         if (!item) {
             continue};
         if (!(this.lexer.out.currLine)) {
             this.lexer.out.put(String.spaces(this.indent - 1))};
         if (item instanceof ASTBase) {
           item.produce();
         }
         else if (item === '\n') {
           this.lexer.out.startNewLine();
         }
         else if (typeof item === 'string') {
           this.lexer.out.put(item);
         }
         else if (typeof item === 'object') {
           if (item instanceof Array) {
             this.out.apply(this, item);
           }
           else if (item.hasOwnProperty('CSL')) {
             if (!item.CSL) {
                 continue};
             
             for( var inx=0,listItem ; inx<item.CSL.length ; inx++){listItem=item.CSL[inx];
             
               
               if (inx > 0) {
                 this.lexer.out.put(item.separator || ', ');
               };
               if (item.freeForm) {
                 if (listItem instanceof ASTBase) {
                   listItem.out('\n');
                 }
                 else {
                   item.out('\n');
                 };
               };
               this.out(item.pre, listItem, item.post);
             };
             
             if (item.freeForm) {
                 this.out('\n')};
           }
           else if (item.COMMENT !== undefined) {
             if (this.lexer.options.comments) {
                 if (typeof item !== 'string' || !(item.COMMENT.startsWith("//"))) {
                     this.lexer.out.put("//")};
                 this.out(item.COMMENT);
             };
           }
           else {
             var msg = "method:ASTBase.out() Caller:" + this.constructor.name + ": object not recognized. type: " + typeof item;
             debug(msg);
             debug(item);
             this.throwError(msg);
           };
         }
         else {
           this.lexer.out.put(item.toString());
         };
         
       };
       
    };
    ASTBase.prototype.outLineAsComment = function(preComment, lineInx){
       if (!this.lexer.options.comments) {
           return};
       if (!lineInx) {
         lineInx = preComment;
         preComment = "";
       }
       else {
         preComment += ": ";
       };
       if (!this.lexer) {
           return log.error("ASTBase.outLineAsComment " + lineInx + ": NO LEXER")};
       var line = this.lexer.infoLines[lineInx];
       if (!line) {
           return log.error("ASTBase.outLineAsComment " + lineInx + ": NO LINE")};
       if (line.type === this.lexer.LineTypes.BLANK) {
           this.lexer.out.blankLine();
           return;
       };
       var prepend = "";
       if (preComment || !(line.text.startsWith("//"))) {
           prepend = "//"};
       if (!this.lexer.out.currLine) {
           prepend = String.spaces(line.indent) + prepend};
       if (preComment || line.text) {
           this.lexer.out.put(prepend + preComment + line.text)};
       this.lexer.out.startNewLine();
       this.lexer.out.lastOutCommentLine = lineInx;
    };
    ASTBase.prototype.outLinesAsComment = function(fromLine, toLine){
       if (!this.lexer.options.comments) {
           return};
       if (this.lexer.out.currLine && this.lexer.out.currLine.trim()) {
         this.lexer.out.startNewLine();
       };
       this.lexer.out.currLine = undefined;
       for( var i=fromLine; i<=toLine; i++) {
         this.outLineAsComment(i);
       };
       
    };
    ASTBase.prototype.outPrevLinesComments = function(startFrom){
     if (!this.lexer.options.comments) {
         return};
     var inx = startFrom || this.lineInx || 0;
     if (inx < 1) {
         return};
     if(this.lexer.out.lastOutCommentLine===undefined) this.lexer.out.lastOutCommentLine=-1;
     var preInx = inx;
     while(preInx && preInx > this.lexer.out.lastOutCommentLine){
         preInx--;
         if (this.lexer.infoLines[preInx].type === this.lexer.LineTypes.CODE) {
             preInx++;
             break;
         };
     };
     this.outLinesAsComment(preInx, inx - 1);
    };
    ASTBase.prototype.getEOLComment = function(){
       if (!this.lexer.options.comments) {
           return};
       var inx = this.lineInx;
       var infoLine = this.lexer.infoLines[inx];
       if (infoLine.tokens && infoLine.tokens.length) {
           var lastToken = infoLine.tokens[infoLine.tokens.length - 1];
           if (lastToken.type === 'COMMENT') {
               return "" + (lastToken.value.startsWith('//') ? '' : '//') + " " + lastToken.value;
           };
       };
    };
    ASTBase.prototype.addSourceMap = function(){
       this.lexer.out.addSourceMap(this.sourceLineNum, this.column);
    };
    ASTBase.prototype.levelIndent = function(){
       var indent = ' ';
       var node = this.parent;
       while(node){
         node = node.parent;
         indent += '  ';
       };
       return indent;
    };
    ASTBase.prototype.callOnSubTree = function(methodName, classFilter){
     if (methodName in this) {
         this[methodName]()};
     if (classFilter && this instanceof classFilter) {
         return};
     for ( var name in this)if (this.hasOwnProperty(name))if(['parent', 'importedModule', 'requireCallNodes', 'exportDefault'].indexOf(name)===-1){
             if (this[name] instanceof ASTBase) {
                 this[name].callOnSubTree(methodName, classFilter);
             }
             else if (this[name] instanceof Array) {
                 for( var item__inx=0,item ; item__inx<this[name].length ; item__inx++){item=this[name][item__inx];
                 if(item instanceof ASTBase){
                   
                   item.callOnSubTree(methodName, classFilter);
                 }};
                 
             };
             }
     
     
    };
    ASTBase.prototype.getRootNode = function(){
       var node = this;
       while(node.parent instanceof ASTBase){
           node = node.parent;
       };
       return node;
    };
    ASTBase.prototype.compilerVar = function(name){
       var asked=undefined;
       if ((asked=this.getRootNode().compilerVars.findOwnMember(name))) {
         
         return asked.findOwnMember("**value**");
       };
    };
   ASTBase
   function getUniqueVarName(prefix){
       var id = uniqueIds[prefix] || 0;
       id += 1;
       uniqueIds[prefix] = id;
       return '_' + prefix + id;
   };
   
   ASTBase.getUniqueVarName=getUniqueVarName;
   var uniqueIds = {};
module.exports=ASTBase;