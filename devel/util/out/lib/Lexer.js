//Compiled by LiteScript compiler v0.6.1, source: /home/ltato/LiteScript/devel/source-v0.6/Lexer.lite.md
   var LineTypes = {CODE: 0, COMMENT: 1, BLANK: 2};
   var log = require('./log');
   var debug = log.debug;
   
    function Lexer(compiler, options){
         this.compiler = compiler;
         this.options = options;
         if(!options) options={};
         if(options.comments===undefined) options.comments=1;
         this.stringInterpolationChar = "#";
         this.hardError = null;
         this.out = new OutCode();
         this.out.start(this.options);
         this.token = new Token();
    };
   
    Lexer.prototype.initSource = function(filename, source){
         this.filename = filename;
         this.interfaceMode = filename.endsWith('interface.md');
         if (source instanceof Array) {
           this.lines = source;
         }
         else {
           if (typeof source !== 'string') {
               source = source.toString()};
           this.lines = source.split('\n');
           this.lines.push("");
         };
    };
    Lexer.prototype.preParseSource = function(){
       var infoLines = [];
       var titleKeyRegexp = /^(#)+ *(?:(?:public|export|default|helper|namespace)\s*)*(class|append to|function|method|constructor|properties)\b/i;
       var lastLineWasBlank = true, inCodeBlock = false;
       this.sourceLineNum = 0;
       while(this.nextSourceLine()){
           var line = this.line;
           var indent = line.search(/\S/);
           line = line.trim();
           var type = undefined;
           if (!line) {
               type = LineTypes.BLANK;
           }
           else {
               if (indent >= 4) {
                   if (lastLineWasBlank) {
                       inCodeBlock = true};
               }
               else {
                   inCodeBlock = false;
                   if (indent === 0) {
                       var foundTitleKey=undefined;
                       if ((foundTitleKey=titleKeyRegexp.exec(line))) {
                         line = foundTitleKey[0].replace(/#/g, " ").toLowerCase() + line.slice(foundTitleKey[0].length);
                         indent = line.search(/\S/);
                         if (indent < 4) {
                             this.throwErr("MarkDown Title-keyword, expected at least indent 4 ('\#\#\# ')")};
                         inCodeBlock = true;
                       };
                   };
               };
               if (inCodeBlock) {
                   if (line.startsWith("#") || line.startsWith("//")) {
                     type = LineTypes.COMMENT;
                   }
                   else {
                     type = LineTypes.CODE;
                   };
               }
               else {
                   type = LineTypes.COMMENT;
               };
           };
           if (type === LineTypes.CODE) {
             line = this.parseTripleQuotes(line);
           };
           if (this.checkMultilineComment(infoLines, type, indent, line)) {
               continue;
           };
           var infoLine = new InfoLine(this, type, indent, line, this.sourceLineNum);
           infoLine.dump();
           infoLines.push(infoLine);
           lastLineWasBlank = type === LineTypes.BLANK;
       };
       this.lines = undefined;
       return infoLines;
    };
    Lexer.prototype.tokenize = function(){
       debug("---- TOKENIZE");
       for( var item__inx=0,item ; item__inx<this.infoLines.length ; item__inx++){item=this.infoLines[item__inx];
       
           item.dump();
           if (item.type === LineTypes.CODE) {
               item.tokenize(this);
           };
           
       };
       
       this.lineInx = -1;
       this.infoLine = null;
       this.index = -1;
       this.last = this.getPos();
       this.nextToken();
    };
    Lexer.prototype.preprocessor = function(){
     for( var index=0,item ; index<this.infoLines.length ; index++){item=this.infoLines[index];
     if(item.type === LineTypes.CODE){
       if (/^compiler\s+generate\b/.test(item.text)) {
           var 
           bodyLines = [], 
           bodyInx = index + 1, 
           bodyIndent = 0
           ;
           var bodyLine=undefined;
           while(bodyInx < this.infoLines.length && ((bodyLine=this.infoLines[bodyInx])).indent > item.indent){
               bodyLines.push(String.spaces(bodyLine.indent) + bodyLine.text);
               if (bodyIndent === 0) {
                   bodyIndent = bodyLine.indent};
               bodyInx++;
           };
           bodyLines.unshift(String.spaces(bodyIndent) + 'global declare lines:string array');
           var referenceName = '*compiler generate* at line ' + item.sourceLineNum + ' file ' + this.filename;
           
           var moduleNode = this.compiler.compileModule(referenceName, bodyLines, {browser: this.options.browser, target: 'js', verbose: 0});
           var lines = [];
           
           var generateFn = new Function("lines", moduleNode.getCompiledText());
           generateFn(lines);
           for( var i=0,line ; i<lines.length ; i++){line=lines[i];
           
               lines[i] = '    ' + line;
           };
           this.initSource(referenceName, lines);
           var newInfoLines = this.preParseSource();
           newInfoLines.unshift(bodyInx - index);
           newInfoLines.unshift(index);
           Array.prototype.splice.apply(this.infoLines, newInfoLines);
       };
     }};
     
    };
    Lexer.prototype.process = function(){
     this.infoLines = this.preParseSource();
     this.preprocessor();
     this.tokenize();
    };
    Lexer.prototype.nextSourceLine = function(){
       if (this.sourceLineNum >= this.lines.length) {
         return false;
       };
       this.line = this.lines[this.sourceLineNum].replace(/\t/g, '    ').replace(/\s+$/, '').replace(/\r/, '');
       this.sourceLineNum++;
       return true;
    };
    Lexer.prototype.parseTripleQuotes = function(line){
       var result = new MultilineSection(this, line, '"""', '"""');
       if (result.section) {
         if (!((result.section[0].trim()))) {
           result.section.shift();
         };
         if (!((result.section[result.section.length - 1].trim()))) {
           result.section.pop();
         };
         for( var inx=0,sectionLine ; inx<result.section.length ; inx++){sectionLine=result.section[inx];
         
           result.section[inx] = sectionLine.trim();
         };
         line = result.section.join("\\n");
         line = line.replace(/'/g, "\\'");
         line = result.pre + " " + line.quoted("'") + result.post;
       };
       return line;
    };
    Lexer.prototype.checkMultilineComment = function(infoLines, lineType, startLineIndent, line){
       var startSourceLine = this.sourceLineNum;
       var result = new MultilineSection(this, line, '/*', '*/');
       if (!result.section) {
         return false;
       };
       if (result.section.length === 1) {
         line = result.pre + ' ' + result.post + "//" + result.section[0];
         infoLines.push(new InfoLine(this, lineType, startLineIndent, line, startSourceLine));
       }
       else {
         if (result.pre) {
             infoLines.push(new InfoLine(this, lineType, startLineIndent, result.pre, startSourceLine));
         };
         for( var inx=0,sectionLine ; inx<result.section.length ; inx++){sectionLine=result.section[inx];
         
             infoLines.push(new InfoLine(this, LineTypes.COMMENT, 0, sectionLine, startSourceLine + inx));
         };
         if (result.post.trim()) {
             log.warning("" + this.filename + ":" + this.sourceLineNum + ":1. Do not add text on the same line after `*/`. Indent is not clear");
             infoLines.push(new InfoLine(this, LineTypes.CODE, result.postIndent, result.post, this.sourceLineNum));
         };
       };
       return true;
    };
    Lexer.prototype.getPos = function(){
       return new LexerPos(this);
    };
    Lexer.prototype.setPos = function(pos){
       this.lineInx = pos.lineInx;
       if (this.lineInx >= 0 && this.lineInx < this.infoLines.length) {
           this.infoLine = this.infoLines[this.lineInx];
           this.indent = this.infoLine.indent;
       }
       else {
           this.infoLine = null;
           this.indent = 0;
       };
       this.index = pos.index;
       this.sourceLineNum = pos.sourceLineNum;
       this.token = pos.token;
       this.last = pos.last;
    };
    Lexer.prototype.posToString = function(){
       if (this.last) {
           return this.last.toString()};
       return this.getPos().toString();
    };
    Lexer.prototype.getPrevIndent = function(){
       var inx = this.lineInx - 1;
       while(inx >= 0){
           if (this.infoLines[inx].type === LineTypes.CODE) {
               return this.infoLines[inx].indent;
           };
           inx -= 1;
       };
       return 0;
    };
    Lexer.prototype.consumeToken = function(){
       while(true){
           this.token = null;
           while(true){
               if (!(this.infoLine)) {
                   this.index = -1;
                   if (!(this.nextCODELine())) {
                       this.infoLine = new InfoLine(this, LineTypes.CODE, -1, '', this.lineInx);
                       this.token = new Token('EOF');
                       this.infoLine.tokens = [this.token];
                       this.indent = -1;
                       return;
                   };
                   this.sourceLineNum = this.infoLine.sourceLineNum;
                   this.indent = this.infoLine.indent;
                   this.token = new Token('NEWLINE');
                   return;
               };
               if (!this.infoLine.tokens) {
                 debugger;
               };
               this.index += 1;
               if (this.index < this.infoLine.tokens.length) {
                   break;
               };
               this.infoLine = null;
           };
           this.token = this.infoLine.tokens[this.index];
           if (this.token.type === 'COMMENT') {
               continue;
           }
           else {
               break;
           };
       };
       
    };
    Lexer.prototype.nextToken = function(){
       this.last = this.getPos();
       this.consumeToken();
       debug(">>>ADVANCE", "" + this.sourceLineNum + ":" + (this.token.column || 0) + " [" + this.index + "]", this.token.toString());
       return true;
    };
    Lexer.prototype.returnToken = function(){
       this.setPos(this.last);
       debug('<< Returned:', this.token.toString(), 'line', this.sourceLineNum);
    };
    Lexer.prototype.nextCODELine = function(){
       if (this.lineInx >= this.infoLines.length) {
           return false;
       };
       while(true){
           this.lineInx += 1;
           if (this.lineInx >= this.infoLines.length) {
               return false;
           };
           this.infoLine = this.infoLines[this.lineInx];
           if (this.infoLine.type === LineTypes.CODE) {
               this.sourceLineNum = this.infoLine.sourceLineNum;
               this.indent = this.infoLine.indent;
               this.index = -1;
               return true;
           };
       };
       
    };
    Lexer.prototype.say = function(){
       log.error.apply(this, arguments);
    };
    Lexer.prototype.throwErr = function(msg){
       var err = new Error("" + (this.posToString()) + " " + msg);
       err.controled = true;
       throw err;
    };
    Lexer.prototype.sayErr = function(msg){
       log.error(this.posToString(), msg);
    };
    Lexer.prototype.warn = function(msg){
       log.warning(this.posToString(), msg);
    };
   Lexer
   var tokenPatterns = [['COMMENT', /^#(.*)$|^\/\/(.*)$/], ['NUMBER', /^0x[a-f0-9]+/i], ['NUMBER', /^[0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?/i], ['REGEX', /^(\/(?![\s=])[^[\/\n\\]*(?:(?:\\[\s\S]|\[[^\]\n\\]*(?:\\[\s\S][^\]\n\\]*)*])[^[\/\n\\]*)*\/)([imgy]{0,4})(?!\w)/], ['STRING', /^'(?:[^'\\]|\\.)*'/], ['STRING', /^"(?:[^"\\]|\\.)*"/], ['SPACE_DOT', /^\s+\./], ['WHITESPACE', /^[\f\r\t\v\u00A0\u2028\u2029 ]+/], ['ASSIGN', /^=/], ['ASSIGN', /^[\+\-\*\/]=/], ['LITERAL', /^(\+\+|--)/], ['LITERAL', /^[\(\)\[\]\;\,\.\{\}]/], ['OPER', /^(is|isnt|not|and|but|into|like|or|in|into|instance|instanceof|has|hasnt)\b/], ['OPER', /^(\*|\/|\%|\+|-|<>|>=|<=|>>|<<|>|<|!==|\&|\~|\^|\|)/], ['OPER', /^[\?\:]/], ['IDENTIFIER', /^[$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*/]];
   
       function Token(type, tokenText, column){
           this.type = type;
           this.value = tokenText || ' ';
           this.column = column;
       };
   
       Token.prototype.toString = function(){
           return "'" + this.value + "'(" + this.type + ")";
       };
   Token
   
     function InfoLine(lexer, type, indent, text, sourceLineNum){
       this.type = type;
       this.indent = indent;
       this.text = text;
       this.sourceLineNum = sourceLineNum;
     };
   
     InfoLine.prototype.dump = function(){
       if (this.type === LineTypes.BLANK) {
         debug(this.sourceLineNum, "(BLANK)");
         return;
       };
       var type = "";
       if (this.type === LineTypes.COMMENT) {
         type = "COMMENT";
       }
       else if (this.type === LineTypes.CODE) {
         type = "CODE";
       };
       debug(this.sourceLineNum, "" + this.indent + "(" + type + ")", this.text);
       if (this.tokens) {
           debug('   ', this.tokens.join(' '));
           debug();
       };
     };
     InfoLine.prototype.tokenize = function(lexer){
       var code = this.text;
       try{
           var words = [];
           var result = [];
           var colInx = 0;
           var msg = "";
           while(colInx < code.length){
             var chunk = code.slice(colInx);
             var match = '';
             var tokenType = '';
             for( var typeRegExpPair__inx=0,typeRegExpPair ; typeRegExpPair__inx<tokenPatterns.length ; typeRegExpPair__inx++){typeRegExpPair=tokenPatterns[typeRegExpPair__inx];
             
               var regex = typeRegExpPair[1];
               var matches = regex.exec(chunk);
               if (matches && matches[0]) {
                   match = matches[0];
                   tokenType = typeRegExpPair[0];
                   break;
               };
             };
             if (!match) {
               msg = "(" + lexer.filename + ":" + this.sourceLineNum + ":" + (colInx + 1) + ") Tokenize patterns: invalid token: " + chunk;
               log.error(msg);
               log.error(code);
               var errPosString = '';
               while(errPosString.length < colInx){
                   errPosString += ' ';
               };
               log.error(errPosString + '^');
               var err = new Error(msg);
               err.controled = true;
               throw err;
             };
             if (tokenType === 'WHITESPACE') {
                 null;
             }
             else {
                 var token = new Token(tokenType, match, this.indent + colInx + 1);
                 words.push(match);
                 if (tokenType === 'STRING' && match.length > 3 && match.indexOf("" + lexer.stringInterpolationChar + "{")>=0) {
                   
                   var parsed = String.splitExpressions(match, lexer.stringInterpolationChar);
                   if (parsed.length && parsed[0].startsWith("(")) {
                     parsed.unshift('""');
                   };
                   var composed = new InfoLine(lexer, LineTypes.CODE, token.column, parsed.join(' + '), this.sourceLineNum);
                   composed.tokenize(lexer);
                   result = result.concat(composed.tokens);
                 }
                 else {
                   msg += token.toString();
                   result.push(token);
                 };
             };
             colInx += match.length;
           };
           this.tokens = result;
           if (words[0] === 'lexer') {
             if (words.slice(1, 5).join(" ") === "options string interpolation char") {
               this.type = LineTypes.COMMENT;
               var char = undefined;
               if ((char=words[5]) === 'is') {
                   char = words[6]};
               if (['"', "'"].indexOf(char[0])>=0) {
                   char = char.slice(1, -1)};
               if (!char) {
                   lexer.throwErr("missing string interpolation char")};
               lexer.stringInterpolationChar = char;
             };
           };
       
       }catch(e){
           log.error("" + lexer.filename + ":" + this.sourceLineNum + ":" + (colInx + 1), e.message);
           log.error(msg);
           throw e;
       };
     };
   InfoLine
   
     function LexerPos(lexer){
       this.lexer = lexer;
       this.lineInx = lexer.lineInx;
       this.index = lexer.index;
       this.sourceLineNum = lexer.sourceLineNum;
       this.token = lexer.token;
       this.last = lexer.last;
     };
   
     LexerPos.prototype.toString = function(){
       if (!this.token) {
           this.token = {column: 0}};
       return "" + this.lexer.filename + ":" + this.sourceLineNum + ":" + ((this.token.column || 0) + 1);
     };
   LexerPos
   
     function MultilineSection(lexer, line, startCode, endCode){
       var startCol = line.indexOf(startCode);
       if (startCol < 0) {
           return;
       };
       if (String.replaceQuoted(line, "").indexOf(startCode) < 0) {
           return;
       };
       debug("**** START MULTILINE ", startCode);
       this.section = [];
       var startSourceLine = lexer.sourceLineNum;
       this.pre = line.slice(0, startCol).trim();
       line = line.slice(startCol + startCode.length).trim();
       var endCol = undefined;
       while(!((endCol=line.indexOf(endCode)) >= 0)){
           this.section.push(line);
           if (!lexer.nextSourceLine()) {
               lexer.sayErr("EOF while processing multiline " + startCode + " (started on " + lexer.filename + ":" + startSourceLine + ":" + startCol + ")");
               return;
           };
           line = lexer.line;
       };
       this.post = line.slice(endCol + endCode.length);
       line = line.slice(0, endCol);
       if (line) {
         this.section.push(line);
       };
       this.postIndent = endCol + endCode.length;
     };
   
   MultilineSection
   
   function OutCode(){    this.addSourceAsComment=true;
   };
   
    OutCode.prototype.start = function(options){
       
       this.lineNum = 1;
       this.column = 1;
       this.lines = [];
       this.lastOriginalCodeComment = 0;
       this.lastOutCommentLine = 0;
       if (!(options.nomap) && typeof window === 'undefined') {
             var SourceMap = require('./SourceMap');
             this.sourceMap = new SourceMap();
       };
    };
    OutCode.prototype.put = function(text){
       if (this.currLine === undefined) {
           this.currLine = "";
           this.column = 1;
       };
       if (text) {
           this.currLine += text;
           this.column += text.length;
       };
    };
    OutCode.prototype.startNewLine = function(){
         if (this.currLine || this.currLine === "") {
             this.lines.push(this.currLine);
             debug(this.lineNum, this.currLine);
         };
         this.currLine = undefined;
         this.lineNum++;
         this.column = 1;
    };
    OutCode.prototype.ensureNewLine = function(){
         if (this.currLine) {
             this.startNewLine()};
    };
    OutCode.prototype.blankLine = function(){
         this.startNewLine();
         this.currLine = "";
         this.startNewLine();
    };
    OutCode.prototype.getResult = function(){
       this.startNewLine();
       var result = this.lines;
       this.lines = [];
       return result;
    };
    OutCode.prototype.addSourceMap = function(sourceLin, sourceCol){
       if (this.sourceMap) {
           this.sourceMap.add((sourceLin || 1) - 1, (sourceCol || 1) - 1, this.lineNum - 1, this.column - 1);
       };
    };
   
   module.exports.OutCode = OutCode;
   OutCode
   Lexer.prototype.LineTypes = LineTypes;
   module.exports = Lexer;