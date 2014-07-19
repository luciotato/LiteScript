//Compiled by LiteScript compiler v0.7.0, source: /home/ltato/LiteScript/devel/source-v0.8/ASTBase.lite.md
// The Abstract Syntax Tree (AST) Base class
// -----------------------------------------

// This module defines the base abstract syntax tree class used by the grammar.
// It's main purpose is to provide utility methods used in the grammar
// for **req**uired tokens, **opt**ional tokens
// and comma or semicolon **Separated Lists** of symbols.

// Dependencies

   // import Parser, ControlledError
   var Parser = require('./Parser.js');
   var ControlledError = require('./lib/ControlledError.js');
   // import logger, Strings
   var logger = require('./lib/logger.js');
   var Strings = require('./lib/Strings.js');

   // shim import LiteCore, Map
   var LiteCore = require('./LiteCore.js');
   var Map = require('./lib/Map.js');

   // public default class ASTBase
   // constructor
   function ASTBase(parent, name){
     //      properties

        // parent: ASTBase

        // name:string, keyword:string

        // type, keyType, itemType

        // lexer: Parser.Lexer

// AST node position in source

        // lineInx
        // sourceLineNum, column
        // indent

// wile-parsing info

        // locked: boolean
        // extraInfo // if parse failed, extra information

       this.parent = parent;
       this.name = name;

// Get lexer from parent

       // if parent
       if (parent) {
           this.lexer = parent.lexer;

// Remember this node source position.
// Also remember line index in tokenized lines, and indent

           // if .lexer
           if (this.lexer) {
               this.sourceLineNum = this.lexer.sourceLineNum;
               this.column = this.lexer.token.column;
               this.indent = this.lexer.indent;
               this.lineInx = this.lexer.lineInx;
           };
       };
    };

        // #debug "created [#.constructor.name] indent #.indent col:#.column #{.lexer? .lexer.token:''}"

// ------------------------------------------------------------------------
    // method lock()
    ASTBase.prototype.lock = function(){
// **lock** marks this node as "locked", meaning we are certain this is the right class
// for the given syntax. For example, if the `FunctionDeclaration` class see the token `function`,
// we are certain this is the right class to use, so we 'lock()'.
// Once locked, any **req**uired token not present causes compilation to fail.

       this.locked = true;
    };

    // helper method getParent(searchedClass)
    ASTBase.prototype.getParent = function(searchedClass){
// **getParent** method searchs up the AST tree until a specfied node class is found

       var node = this.parent;
       // while node and node isnt instance of searchedClass
       while(node && !(node instanceof searchedClass)){
           node = node.parent;// # move to parent
       };// end loop
       return node;
    };


    // helper method positionText()
    ASTBase.prototype.positionText = function(){

       // if not .lexer or no .sourceLineNum, return "(compiler-defined)"
       if (!(this.lexer) || !this.sourceLineNum) {return "(compiler-defined)"};
       return "" + this.lexer.filename + ":" + this.sourceLineNum + ":" + (this.column || 0);
    };

    // helper method toString()
    ASTBase.prototype.toString = function(){

       return "[" + this.constructor.name + "]";
    };


    // helper method sayErr(msg)
    ASTBase.prototype.sayErr = function(msg){

       logger.error(this.positionText(), msg);
    };

    // helper method warn(msg)
    ASTBase.prototype.warn = function(msg){

       logger.warning(this.positionText(), msg);
    };

    // method throwError(msg)
    ASTBase.prototype.throwError = function(msg){
// **throwError** add node position info and throws a 'controlled' error.

// A 'controlled' error, shows only err.message

// A 'un-controlled' error is an unhandled exception in the compiler code itself,
// and it shows error message *and stack trace*.

       logger.throwControlled("" + (this.positionText()) + ". " + msg);
    };

    // method throwParseFailed(msg)
    ASTBase.prototype.throwParseFailed = function(msg){
// throws a parseFailed-error

// During a node.parse(), if there is a token mismatch, a "parse failed" is raised.
// "parse failed" signals a failure to parse the tokens from the stream,
// however the syntax might still be valid for another AST node.
// If the AST node was locked-on-target, it is a hard-error.
// If the AST node was NOT locked, it's a soft-error, and will not abort compilation
// as the parent node will try other AST classes against the token stream before failing.

        //var err = new Error("#{.positionText()}. #{msg}")
       var cErr = new ControlledError("" + (this.lexer.posToString()) + ". " + msg);
       cErr.soft = !(this.locked);
       // throw cErr
       throw cErr;
    };

    // method parse()
    ASTBase.prototype.parse = function(){
// abstract method representing the TRY-Parse of the node.
// Child classes _must_ override this method

       this.throwError('Parser Not Implemented');
    };

    // method produce()
    ASTBase.prototype.produce = function(){
// **produce()** is the method to produce target code
// Target code produces should override this, if the default production isnt: `.out .name`

       this.out(this.name);
    };

    // method parseDirect(key, directMap)
    ASTBase.prototype.parseDirect = function(key, directMap){

// We use a DIRECT associative array to pick the exact AST node to parse
// based on the actual token value or type.
// This speeds up parsing, avoiding parsing by trial & error

// Check keyword

       // if directMap.get(key) into var param
       var param=undefined;
       if ((param=directMap.get(key))) {

// try parse by calling .opt, accept Array as param

           var statement = param instanceof Array ? ASTBase.prototype.opt.apply(this, param) : this.opt(param);

// return parsed statement or nothing

           return statement;
       };
    };



    // method opt() returns ASTBase
    ASTBase.prototype.opt = function(){
// **opt** (optional) is for optional parts of a grammar. It attempts to parse
// the token stream using one of the classes or token types specified.
// This method takes a variable number of arguments.
// For example:
  // calling `.opt IfStatement, Expression, 'IDENTIFIER'`
  // would attempt to parse the token stream first as an `IfStatement`. If that fails, it would attempt
  // to use the `Expression` class. If that fails, it will accept a token of type `IDENTIFIER`.
  // If all of those fail, it will return `undefined`.

// Method start:
// Remember the actual position, to rewind if all the arguments to `opt` fail

       var startPos = this.lexer.getPos();

        // #debug
       var spaces = this.levelIndent();

// For each argument, -a class or a string-, we will attempt to parse the token stream
// with the class, or match the token type to the string.

       // for each searched in arguments.toArray()
       var _list1=Array.prototype.slice.call(arguments);
       for( var searched__inx=0,searched ; searched__inx<_list1.length ; searched__inx++){searched=_list1[searched__inx];

// skip empty, null & undefined

         // if no searched, continue
         if (!searched) {continue};

// determine value or type
// For strings we check the token **value** or **TYPE** (if searched is all-uppercase)

         // if typeof searched is 'string'
         if (typeof searched === 'string') {

            // declare searched:string

            // #debug spaces, .constructor.name,'TRY',searched, 'on', .lexer.token.toString()

           var isTYPE = searched.charAt(0) >= "A" && searched.charAt(0) <= "Z" && searched === searched.toUpperCase();
           var found = undefined;

           // if isTYPE
           if (isTYPE) {
             found = this.lexer.token.type === searched;
           }
           
           else {
             found = this.lexer.token.value === searched;
           };

           // if found
           if (found) {

// Ok, type/value found! now we return: token.value
// Note: we shouldnt return the 'token' object, because returning objects (here and in js)
// is a "pass by reference". You return a "pointer" to the object.
// If we return the 'token' object, the calling function will recive a "pointer"
// and it can inadvertedly alter the token object in the token stream. (it should not, leads to subtle bugs)

             logger.debug(spaces, this.constructor.name, 'matched OK:', searched, this.lexer.token.value);
             var result = this.lexer.token.value;

// Advance a token, .lexer.token always has next token

             this.lexer.nextToken();
             return result;
           };
         }
         
         else {

// "searched" is an AST class

            // declare searched:Function //class

           logger.debug(spaces, this.constructor.name, 'TRY', searched.name, 'on', this.lexer.token.toString());

// if the argument is an AST node class, we instantiate the class and try the `parse()` method.
// `parse()` can fail with `ParseFailed` if the syntax do not match

           // try
           try{

               var astNode = new searched(this);// # create required ASTNode, to try parse

               astNode.parse();// # if it can't parse, will raise an exception

               logger.debug(spaces, 'Parsed OK!->', searched.name);

               return astNode;// # parsed ok!, return instance
           
           }catch(err){
               // if err isnt instance of ControlledError, throw err //re-raise if not ControlledError
               if (!(err instanceof ControlledError)) {throw err};
                // declare err:ControlledError

// If parsing fail, but the AST node were not 'locked' on target, (a soft-error),
// we will try other AST nodes.

               // if err.soft
               if (err.soft) {
                   this.lexer.softError = err;
                   logger.debug(spaces, searched.name, 'parse failed.', err.message);

// rewind the token stream, to try other AST nodes

                   logger.debug("<<REW to", "" + startPos.sourceLineNum + ":" + (startPos.token.column || 0) + " [" + startPos.index + "]", startPos.token.toString());
                   this.lexer.setPos(startPos);
               }
               
               else {

// else: it's a hard-error. The AST node were locked-on-target.
// We abort parsing and throw.

                    // # the first hard-error is the most informative, the others are cascading ones
                   // if .lexer.hardError is null, .lexer.hardError = err
                   if (this.lexer.hardError === null) {this.lexer.hardError = err};

// raise up, abort parsing

                   // raise err
                   throw err;
               };

               // end if - type of error
               
           };

           // end catch
           
         };

         // end if - string or class
         
       };// end for each in Array.prototype.slice.call(arguments)

       // end loop - try the next argument

// No more arguments.
// `opt` returns `undefined` if none of the arguments can be use to parse the token stream.

       return undefined;
    };

    // end method opt


    // method req() returns ASTBase
    ASTBase.prototype.req = function(){

// **req** (required) if for required symbols of the grammar. It works the same way as `opt`
// except that it throws an error if none of the arguments can be used to parse the stream.

// We first call `opt` to see what we get. If a value is returned, the function was successful,
// so we just return the node that `opt` found.

// else, If `opt` returned nothing, we give the user a useful error.

       var result = ASTBase.prototype.opt.apply(this, Array.prototype.slice.call(arguments));

       // if no result
       if (!result) {
         this.throwParseFailed("" + this.constructor.name + ":" + (this.extraInfo || '') + " found " + (this.lexer.token.toString()) + " but " + (this.listArgs(Array.prototype.slice.call(arguments))) + " required");
       };

       return result;
    };


    // method reqOneOf(arr)
    ASTBase.prototype.reqOneOf = function(arr){
// (performance) call req only if next token (value) in list

       // if .lexer.token.value in arr
       if (arr.indexOf(this.lexer.token.value)>=0) {
           return ASTBase.prototype.req.apply(this, arr);
       }
       
       else {
           this.throwParseFailed("not in list");
       };
    };


    // method optList()
    ASTBase.prototype.optList = function(){
// this generic method will look for zero or more of the requested classes,

       var item = undefined;
       var list = [];

       // do
       while(true){
         item = ASTBase.prototype.opt.apply(this, Array.prototype.slice.call(arguments));
         // if no item then break
         if (!item) {break};
         list.push(item);
       };// end loop

       return list.length ? list : undefined;
    };


    // method optSeparatedList(astClass:ASTBase, separator, closer) #[Separated Lists]
    ASTBase.prototype.optSeparatedList = function(astClass, separator, closer){// #[Separated Lists]

// Start optSeparatedList

       var result = [];
       var optSepar = undefined;

// except the requested closer is NEWLINE,
// NEWLINE is included as an optional extra separator
// and also we allow a free-form mode list

       // if closer isnt 'NEWLINE' #Except required closer *IS* NEWLINE
       if (closer !== 'NEWLINE') {// #Except required closer *IS* NEWLINE

// if the list starts with a NEWLINE,
// assume an indented free-form mode separated list,
// where NEWLINE is a valid separator.

           // if .lexer.token.type is 'NEWLINE'
           if (this.lexer.token.type === 'NEWLINE') {
               return this.optFreeFormList(astClass, separator, closer);
           };

// else normal list, but NEWLINE is accepted as optional before and after separator

           optSepar = 'NEWLINE';// #newline is optional before and after separator
       };

// normal separated list,
// loop until closer found

       logger.debug("optSeparatedList [" + this.constructor.name + "] indent:" + this.indent + ", get SeparatedList of [" + astClass.name + "] by '" + separator + "' closer:", closer || '-no closer-');

       var startLine = this.lexer.sourceLineNum;
       // do until .opt(closer) or .lexer.token.type is 'EOF'
       while(!(this.opt(closer) || this.lexer.token.type === 'EOF')){

// get a item

           var item = this.req(astClass);
           this.lock();

// add item to result

           result.push(item);

// newline after item (before comma or closer) is optional

           var consumedNewLine = this.opt(optSepar);

// if, after newline, we got the closer, then exit.

           // if .opt(closer) then break #closer found
           if (this.opt(closer)) {break};

// here, a 'separator' (comma/semicolon) means: 'there is another item'.
// Any token other than 'separator' means 'end of list'

           // if no .opt(separator)
           if (!this.opt(separator)) {
                // # any token other than comma/semicolon means 'end of comma separated list'
                // # but if a closer was required, then "other" token is an error
               // if closer, .throwError "Expected '#{closer}' to end list started at line #{startLine}, got '#{.lexer.token.value}'"
               if (closer) {this.throwError("Expected '" + closer + "' to end list started at line " + startLine + ", got '" + this.lexer.token.value + "'")};
               // if consumedNewLine, .lexer.returnToken()
               if (consumedNewLine) {this.lexer.returnToken()};
               // break # if no error, end of list
               break;// # if no error, end of list
           };
           // end if

// optional newline after comma

           this.opt(optSepar);
       };// end loop

       return result;
    };

    // method optFreeFormList(astClass:ASTBase, separator, closer)
    ASTBase.prototype.optFreeFormList = function(astClass, separator, closer){

// In "freeForm Mode", each item stands in its own line, and commas (separators) are optional.
// The item list ends when a closer is found or when indentation changes

       var result = [];
       var lastItemSourceLine = -1;
       var separatorAfterItem = undefined;
       var parentIndent = this.parent.indent;

// FreeFormList should start with NEWLINE
// First line sets indent level

       this.req("NEWLINE");
       var startLine = this.lexer.sourceLineNum;
       var blockIndent = this.lexer.indent;

       logger.debug("optFreeFormList: [" + astClass.name + " " + separator + "]*  parent:" + this.parent.name + "." + this.constructor.name + " parentIndent:" + parentIndent + ", blockIndent:" + blockIndent + ", closer:", closer || '-no-');

       // if blockIndent <= parentIndent #first line is same or less indented than parent - assume empty list
       if (blockIndent <= parentIndent) {// #first line is same or less indented than parent - assume empty list
         this.lexer.sayErr("free-form SeparatedList: next line is same or less indented (" + blockIndent + ") than parent indent (" + parentIndent + ") - assume empty list");
         return result;
       };

// now loop until closer or an indent change

        // #if closer found (`]`, `)`, `}`), end of list
       // do until .opt(closer) or .lexer.token.type is 'EOF'
       while(!(this.opt(closer) || this.lexer.token.type === 'EOF')){

// check for indent changes

           logger.debug("freeForm Mode .lexer.indent:" + this.lexer.indent + " block indent:" + blockIndent + " parentIndent:" + parentIndent);
           // if .lexer.indent isnt blockIndent
           if (this.lexer.indent !== blockIndent) {

// indent changed:
// if a closer was specified, indent change before the closer means error (line misaligned)

                 // if closer
                 if (closer) {
                   this.lexer.throwErr("Misaligned indent: " + this.lexer.indent + ". Expected " + blockIndent + ", or '" + closer + "' to end block started at line " + startLine);
                 };

// check for excesive indent

                 // if .lexer.indent > blockIndent
                 if (this.lexer.indent > blockIndent) {
                   this.lexer.throwErr("Misaligned indent: " + this.lexer.indent + ". Expected " + blockIndent + " to continue block, or " + parentIndent + " to close block started at line " + startLine);
                 };

// else, if no closer specified, and indent decreased => end of list

                 // break #end of list
                 break;// #end of list
           };

           // end if

// check for more than one statement on the same line, with no separator

           // if not separatorAfterItem and .lexer.sourceLineNum is lastItemSourceLine
           if (!(separatorAfterItem) && this.lexer.sourceLineNum === lastItemSourceLine) {
               this.lexer.sayErr("More than one [" + astClass.name + "] on line " + lastItemSourceLine + ". Missing ( ) on function call?");
           };

           lastItemSourceLine = this.lexer.sourceLineNum;

// else, get a item

           var item = this.req(astClass);
           this.lock();

// add item to result

           result.push(item);

// record where the list ends - for accurate sorucemaps (function's end)
// and to add commented original litescript source at C-generation

           // if item.sourceLineNum>.lexer.maxSourceLineNum, .lexer.maxSourceLineNum=item.sourceLineNum
           if (item.sourceLineNum > this.lexer.maxSourceLineNum) {this.lexer.maxSourceLineNum = item.sourceLineNum};

// newline after item (before comma or closer) is optional

           this.opt('NEWLINE');

// separator (comma|semicolon) is optional,
// NEWLINE also is optional and valid

           separatorAfterItem = this.opt(separator);
           this.opt('NEWLINE');
       };// end loop

       logger.debug("END freeFormMode [" + this.constructor.name + "] blockIndent:" + blockIndent + ", get SeparatedList of [" + astClass.name + "] by '" + separator + "' closer:", closer || '-no closer-');

        //if closer then .opt('NEWLINE') # consume optional newline after closer in free-form mode

       return result;
    };


    // method reqSeparatedList(astClass:ASTBase, separator, closer)
    ASTBase.prototype.reqSeparatedList = function(astClass, separator, closer){
// **reqSeparatedList** is the same as `optSeparatedList` except that it throws an error
// if the list is empty

// First, call optSeparatedList

       var result = this.optSeparatedList(astClass, separator, closer);
       // if result.length is 0, .throwParseFailed "#{.constructor.name}: Get list: At least one [#{astClass.name}] was expected"
       if (result.length === 0) {this.throwParseFailed("" + this.constructor.name + ": Get list: At least one [" + astClass.name + "] was expected")};

       return result;
    };


    // helper method listArgs(args:Object array)
    ASTBase.prototype.listArgs = function(args){
// listArgs list arguments (from opt or req). used for debugging
// and syntax error reporting

       var msg = [];
       // for each i in args
       for( var i__inx=0,i ; i__inx<args.length ; i__inx++){i=args[i__inx];

            // declare valid i.name

           // if typeof i is 'string'
           if (typeof i === 'string') {
               msg.push("'" + i + "'");
           }
           
           else if (i) {
               // if typeof i is 'function'
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
       };// end for each in args

       return msg.join('|');
    };



// Helper functions for code generation
// =====================================

    // helper method out()
    ASTBase.prototype.out = function(){

// *out* is a helper function for code generation
// It evaluates and output its arguments. uses .lexer.out

       var rawOut = this.lexer.outCode;

       // for each item in arguments.toArray()
       var _list2=Array.prototype.slice.call(arguments);
       for( var item__inx=0,item ; item__inx<_list2.length ; item__inx++){item=_list2[item__inx];

// skip empty items

         // if no item, continue
         if (!item) {continue};

// if it is the first thing in the line, out indentation

         // if not rawOut.currLine and .indent > 0
         if (!(rawOut.currLine) && this.indent > 0) {
             rawOut.put(String.spaces(this.indent));
         };

// if it is an AST node, call .produce()

         // if item instance of ASTBase
         if (item instanceof ASTBase) {
              // declare item:ASTBase
             item.produce();
         }

// New line char means "start new line"
         
         else if (item === '\n') {
           rawOut.startNewLine();
         }

// a simple string, out the string
         
         else if (typeof item === 'string') {
           rawOut.put(item);
         }

// if the object is an array, resolve with a recursive call
         
         else if (item instanceof Array) {
              // # Recursive #
             ASTBase.prototype.out.apply(this, item);
         }

// else, Object codes
         
         else if (item instanceof Map) {

              // declare item: Map string to any

            // expected keys:
            //  COMMENT:string, NLI, CSL:Object array, freeForm, h

// {CSL:arr} -> output the array as Comma Separated List

             // if item.get('CSL') into var CSL:array
             var CSL=undefined;
             var comment=undefined;
             var header=undefined;
             if ((CSL=item.get('CSL'))) {

                  // additional keys: pre,post,separator
                 var separator = item.get('separator') || ', ';

                 // for each inx,listItem in CSL
                 for( var inx=0,listItem ; inx<CSL.length ; inx++){listItem=CSL[inx];

                    // declare valid listItem.out

                   // if inx>0
                   if (inx > 0) {
                     rawOut.put(separator);
                   };

                   // if item.get('freeForm')
                   if (item.get('freeForm')) {
                       rawOut.put('\n        ');
                   };

                    // #recurse
                   this.out(item.get('pre'), listItem, item.get('post'));
                 };// end for each in CSL

                 // end for

                 // if item.get('freeForm'), rawOut.put '\n' # (prettier generated code)
                 if (item.get('freeForm')) {rawOut.put('\n')};
             }

// {COMMENT:text} --> output text as a comment
             
             else if ((comment=item.get('COMMENT'))) {

                 // if no .lexer or .lexer.options.comments #comments level > 0
                 if (!this.lexer || this.lexer.options.comments) {// #comments level > 0

                      // # prepend // if necessary
                     // if type of item isnt 'string' or not comment.startsWith("//"), rawOut.put "// "
                     if (typeof item !== 'string' || !(comment.startsWith("//"))) {rawOut.put("// ")};
                     this.out(comment);
                 };
             }

// {h:1/0} --> enable/disabe output to header file
             
             else if ((header=item.get('h')) !== undefined) {
                 rawOut.setHeader(header);
             }
             
             else {
                 this.sayErr("ASTBase method out, item:map: unrecognized map keys: " + item);
             };
         }

// Last option, out item.toString()
         
         else {
             rawOut.put(item.toString());// # try item.toString()
         };

         // end if
         
       };// end for each in Array.prototype.slice.call(arguments)

       // end loop, next item
       
    };


    // helper method outSourceLineAsComment(sourceLineNum)
    ASTBase.prototype.outSourceLineAsComment = function(sourceLineNum){

// Note: check if we can remove "outLineAsComment" and use this instead

       // if .lexer.outCode.lastOutCommentLine < sourceLineNum
       if (this.lexer.outCode.lastOutCommentLine < sourceLineNum) {
           this.lexer.outCode.lastOutCommentLine = sourceLineNum;
       };

       // if sourceLineNum<1, return
       if (sourceLineNum < 1) {return};

       var line = this.lexer.lines[sourceLineNum - 1];
       // if no line, return
       if (!line) {return};

       var indent = line.countSpaces();

       this.lexer.outCode.ensureNewLine();
       this.lexer.outCode.put(line.slice(0, indent));
       this.lexer.outCode.put("//");
       this.lexer.outCode.put(line.slice(indent));
       this.lexer.outCode.startNewLine();
    };

    // helper method outSourceLinesAsComment(fromLineNum,toLineNum)
    ASTBase.prototype.outSourceLinesAsComment = function(fromLineNum, toLineNum){

       // if no .lexer.options.comments, return
       if (!this.lexer.options.comments) {return};

       // if no fromLineNum or fromLineNum<.lexer.outCode.lastOutCommentLine+1
       if (!fromLineNum || fromLineNum < this.lexer.outCode.lastOutCommentLine + 1) {
             fromLineNum = this.lexer.outCode.lastOutCommentLine + 1;
       };

       // for i=fromLineNum to toLineNum
       var _end1=toLineNum;
       for( var i=fromLineNum; i<=_end1; i++) {
           this.outSourceLineAsComment(i);
       };// end for i
       
    };

// #### helper method outLineAsComment(preComment,lineInx)
// out a full source line as comment into produced code
//         if no .lexer.options.comments, return
// manage optional parameters
//         if no lineInx
//           lineInx = preComment
//           preComment = ""
//         else
//           preComment="#{preComment}: "
// validate index
//         if no .lexer, return logger.error("ASTBase.outLineAsComment #{lineInx}: NO LEXER")
//         var line = .lexer.infoLines[lineInx]
//         if no line, return logger.error("ASTBase.outLineAsComment #{lineInx}: NO LINE")
//         if line.type is Parser.LineTypes.BLANK
//             .lexer.outCode.blankLine
//             return
// out as comment
//         var prepend=""
//         if preComment or not line.text.startsWith("//"), prepend="// "
//         if no .lexer.outCode.currLine, prepend="#{String.spaces(line.indent)}#{prepend}"
//         if preComment or line.text, .lexer.outCode.put "#{prepend}#{preComment}#{line.text}"
//         .lexer.outCode.startNewLine
//         .lexer.outCode.lastOutCommentLine = lineInx

// #### helper method outLinesAsComment(fromLine,toLine)
//         if no .lexer.options.comments, return
//         # if line has something and is not spaces
//         if .lexer.outCode.currLine and .lexer.outCode.currLine.trim()
//             .lexer.outCode.startNewLine()
//         .lexer.outCode.currLine = undefined #clear indents
//         for i=fromLine to toLine
//             .outLineAsComment i
// #### helper method outPrevLinesComments(startFrom)
// outPrevLinesComments helper method: output comments from previous lines
// before the statement
//       if no .lexer.options.comments, return
//       var inx = startFrom or .lineInx or 0
//       if inx<1, return
//       default .lexer.outCode.lastOutCommentLine = -1
// find comment lines in the previous lines of code.
//       var preInx = inx
//       while preInx and preInx>.lexer.outCode.lastOutCommentLine
//           preInx--
//           if .lexer.infoLines[preInx].type is Parser.LineTypes.CODE
//               preInx++
//               break
// Output prev comments lines (also blank lines)
//       .outLinesAsComment preInx, inx-1
//     #end method

    // helper method getEOLComment()
    ASTBase.prototype.getEOLComment = function(){
// getEOLComment: get the comment at the end of the line

// Check for "postfix" comments. These are comments that occur at the end of the line,
// such as `a = 1 #comment`. We want to try to add these at the end of the current JavaScript line.

       // if no .lexer.options.comments, return
       if (!this.lexer.options.comments) {return};

       var inx = this.lineInx;
       var infoLine = this.lexer.infoLines[inx];

       // if infoLine.tokens and infoLine.tokens.length
       if (infoLine.tokens && infoLine.tokens.length) {
           var lastToken = infoLine.tokens[infoLine.tokens.length - 1];
           // if lastToken.type is 'COMMENT'
           if (lastToken.type === 'COMMENT') {
               return "" + (lastToken.value.startsWith('//') ? '' : '//') + " " + lastToken.value;
           };
       };
    };

    // helper method addSourceMap(mark)
    ASTBase.prototype.addSourceMap = function(mark){

       this.lexer.outCode.addSourceMap(mark, this.sourceLineNum, this.column, this.indent);
    };


    // helper method levelIndent()
    ASTBase.prototype.levelIndent = function(){
// show indented messaged for debugging

       var indent = 0;
       var node = this;
       // while node.parent into node
       while((node=node.parent)){
           indent += 2; //add 2 spaces
       };// end loop

       return String.spaces(indent);
    };


    // helper method getRootNode()
    ASTBase.prototype.getRootNode = function(){

// **getRootNode** method moves up in the AST up to the node holding the global scope ("root").
// "root" node has parent = Project

       var node = this;
       // while node.parent instanceof ASTBase
       while(node.parent instanceof ASTBase){
           node = node.parent;// # move up
       };// end loop
       return node;
    };


    // helper method compilerVar(name)
    ASTBase.prototype.compilerVar = function(name){

// helper function compilerVar(name)
// return root.compilerVars.members.get(name)

       return this.getRootNode().parent.compilerVars.members.get(name);
    };
   // end class ASTBase

   // end class ASTBase
   



module.exports=ASTBase;