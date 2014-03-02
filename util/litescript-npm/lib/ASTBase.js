//The Abstract Syntax Tree (AST) Base class
//-----------------------------------------

//This module defines the base abstract syntax tree class used by the grammar.
//It's main purpose is to provide utility methods used in the grammar
//for **req**uired tokens, **opt**ional tokens
//and comma or semicolon **Separated Lists** of symbols.

//Dependencies

   //import Lexer, log
   var Lexer = require('./Lexer');
   var log = require('./log');
   var debug = log.debug;


   //public default class ASTBase
   //constructor
    function ASTBase(parent, name){
     //     properties
        //parent,

        //name, keyword, type, itemType

        //lexer:Lexer, lineInx
        //sourceLineNum, column
        //indent, locked
        //index


       this.parent = parent;
       this.name = name;

//Get lexer from parent

       this.lexer = parent.lexer;

//Remember this node source position.
//Also remember line index in tokenized lines, and indent

       //if .lexer
       if (this.lexer) {
         this.sourceLineNum = this.lexer.sourceLineNum;
         this.column = this.lexer.token.column;
         this.indent = this.lexer.indent;
         this.lineInx = this.lexer.lineInx;
       };
    };

        //#debug "created [#.constructor.name] indent #.indent col:#.column #{.lexer? .lexer.token:''}"

//------------------------------------------------------------------------
    //method lock()
    ASTBase.prototype.lock = function(){
//**lock** marks this node as "locked", meaning we are certain this is the right class
//for the given syntax. For example, if the `FunctionDeclaration` class see the token `function`,
//we are certain this is the right class to use, so we 'lock()'.
//Once locked, any **req**uired token not present causes compilation to fail.

       this.locked = true;
    };

    //helper method getParent(searchedClass)
    ASTBase.prototype.getParent = function(searchedClass){
//**getParent** method searchs up the AST tree until a specfied node class is found

       var node = this;
       //while node and not(node instanceof searchedClass)
       while(node && !((node instanceof searchedClass))){
           node = node.parent;// # move to parent
       };//end loop
       return node;
    };


    //helper method positionText()
    ASTBase.prototype.positionText = function(){

       //if not .lexer, return "(compiler-defined)"
       if (!(this.lexer)) {
           return "(compiler-defined)"};
       return "" + this.lexer.filename + ":" + this.sourceLineNum + ":" + (this.column || 0);
    };

    //helper method toString()
    ASTBase.prototype.toString = function(){

       return "[" + this.constructor.name + "]";
    };


    //method throwError(msg)
    ASTBase.prototype.throwError = function(msg){
//**throwError** add node position info and throws a 'controled' error.

//A 'controled' error, shows only err.message

//A 'un-controled' error is an unhandled exception in the compiler code itself,
//and it shows error message *and stack trace*.

       var err = new Error("" + (this.positionText()) + ". " + msg);
       err.controled = true;
       //throw err
       throw err;
    };

    //helper method sayErr(msg)
    ASTBase.prototype.sayErr = function(msg){

       log.error(this.positionText(), msg);
    };


    //method throwParseFailed(msg)
    ASTBase.prototype.throwParseFailed = function(msg){
//throws a parseFailed-error

//During a node.parse(), if there is a token mismatch, a "parse failed" is raised.
//"parse failed" signals a failure to parse the tokens from the stream,
//however the syntax might still be valid for another AST node.
//If the AST node was locked-on-target, it is a hard-error.
//If the AST node was NOT locked, it's a soft-error, and will not abort compilation
//as the parent node will try other AST classes against the token stream before failing.

        //var err = new Error("#{.positionText()}. #{msg}")
       var err = new Error("" + (this.lexer.posToString()) + ". " + msg);
       err.soft = !(this.locked);// #if not locked, is a soft-error, another Grammar class migth parse.
       err.controled = true;
       //throw err
       throw err;
    };

    //method parse()
    ASTBase.prototype.parse = function(){
//abstract method representing the TRY-Parse of the node.
//Child classes _must_ override this method

       this.throwError('Parser Not Implemented: ' + this.constructor.name);
    };

    //method produce()
    ASTBase.prototype.produce = function(){
//**produce()** is the method to produce target code
//Target code produces should override this, if the default production isnt: `.out .name`

       this.out(this.name);
    };

    //method parseDirect(key,directObj)
    ASTBase.prototype.parseDirect = function(key, directObj){

//We use a DIRECT associative array to pick the exact AST node to parse
//based on the actual token value or type.
//This speeds up parsing, avoiding parsing by trial & error

//Check keyword

       //if directObj.hasOwnProperty(key)
       if (directObj.hasOwnProperty(key)) {

//get param

           var param = directObj[key];

//try parse

           var statement = //when param instance of Array then .opt.apply(this, param)
             (param instanceof Array) ? (this.opt.apply(this, param)) :
           /* else */ this.opt(param);

//if parsed ok, assign keyword for reference

            //declare valid statement.keyword
           //if statement
           if (statement) {
               statement.keyword = key;
           };

//return parsed statement or nothing

           return statement;
       };
    };



    //method opt()
    ASTBase.prototype.opt = function(){
//**opt** (optional) is for optional parts of a grammar. It attempts to parse
//the token stream using one of the classes or token types specified.
//This method takes a variable number of arguments.
//For example:
  //calling `.opt IfStatement, Expression, 'IDENTIFIER'`
  //would attempt to parse the token stream first as an `IfStatement`. If that fails, it would attempt
  //to use the `Expression` class. If that fails, it will accept a token of type `IDENTIFIER`.
  //If all of those fail, it will return `undefined`.

//Method start:
//Remember the actual position, to rewind if all the arguments to `opt` fail

       var startPos = this.lexer.getPos();

        //declare on startPos
          //index,sourceLineNum,column,token
        //declare valid startPos.token.column

        //#debug
       var spaces = this.levelIndent();

//For each argument, -a class or a string-, we will attempt to parse the token stream
//with the class, or match the token type to the string.

       //for each searched in arguments
       for( var searched__inx=0,searched ; searched__inx<arguments.length ; searched__inx++){searched=arguments[searched__inx];
       

          //declare on searched
            //toUpperCase #for strings
            //name #for AST nodes

//skip empty, null & undefined

         //if no searched, continue
         if (!searched) {
             continue};

//determine value or type
//For strings we check the token **value** or **TYPE** (if searched is all-uppercase)

         //if typeof searched is 'string'
         if (typeof searched === 'string') {

            //#debug spaces, .constructor.name,'TRY',searched, 'on', .lexer.token.toString()

           var isTYPE = /^[A-Z_]+$/.test(searched);
           var found = undefined;

           //if isTYPE
           if (isTYPE) {
             found = this.lexer.token.type === searched;
           }
           
           else {
             found = this.lexer.token.value === searched;
           };

           //if found
           if (found) {

//Ok, type/value found! now we return: token.value
//Note: we shouldnt return the 'token' object, because returning objects (here and in js)
//is a "pass by reference". You return a "pointer" to the object.
//If we return the 'token' object, the calling function will recive a "pointer"
//and it can inadvertedly alter the token object in the token stream. (it should not, leads to subtle bugs)

             debug(spaces, this.constructor.name, 'matched OK:', searched, this.lexer.token.value);
             var result = this.lexer.token.value;

//Advance a token, .lexer.token always has next token

             this.lexer.nextToken();
             return result;
           };
         }
         
         else {

//"searched" is a AST class

           debug(spaces, this.constructor.name, 'TRY', searched.name, 'on', this.lexer.token.toString());

//if the argument is an AST node class, we instantiate the class and try the `parse()` method.
//`parse()` can fail with `ParseFailed` if the syntax do not match

           //try
           try{

               var astNode = new searched(this);
               astNode.parse();// # if it can't parse, will raise an exception

               debug(spaces, 'Parsed OK!->', searched.name);

               return astNode;// # parsed ok!, return instance
           
           }catch(err){

//If parsing fail, but the AST node were not 'locked' on target, (a soft-error),
//we will try other AST nodes.

             //if err.soft
             if (err.soft) {
                 this.lexer.softError = err;
                 debug(spaces, searched.name, 'parse failed.', err.message);

//rewind the token stream, to try other AST nodes

                 debug("<<REW to", "" + startPos.sourceLineNum + ":" + (startPos.token.column || 0) + " [" + startPos.index + "]", startPos.token.toString());
                 this.lexer.setPos(startPos);
             }
             
             else {

//else: it's a hard-error. The AST node were locked-on-target.
//We abort parsing and throw.

                  //# debug

                  //# the first hard-error is the most informative, the others are cascading ones
                 //if .lexer.hardError is null
                 if (this.lexer.hardError === null) {
                     this.lexer.hardError = err;
                 };
                  //#end if

//raise up, abort parsing

                 //raise err
                 throw err;
             };
           };
         };
       }; // end for each in arguments

              //#end if - type of error

            //#end catch

          //#end if - string or class

        //#loop - try the next argument

//No more arguments.
//`opt` returns `undefined` if none of the arguments could be use to parse the stream.

       return undefined;
    };

      //#end method opt


    //method req()
    ASTBase.prototype.req = function(){

//**req** (required) if for required symbols of the grammar. It works the same way as `opt`
//except that it throws an error if none of the arguments can be used to parse the stream.

//We first call `opt` to see what we get. If a value is returned, the function was successful,
//so we just return the node that `opt` found.

//else, If `opt` returned nothing, we give the user a useful error.

       var result = this.opt.apply(this, arguments);

       //if no result
       if (!result) {
         this.throwParseFailed("" + this.constructor.name + ": found " + (this.lexer.token.toString()) + " but " + (this.listArgs(arguments)) + " required");
       };

       return result;
    };


    //method reqOneOf(arr)
    ASTBase.prototype.reqOneOf = function(arr){
//(performance) call req only if next token (value) in list

       //if .lexer.token.value in arr
       if (arr.indexOf(this.lexer.token.value)>=0) {
           return this.req.apply(this, arr);
       }
       
       else {
           this.throwParseFailed("not in list");
       };
    };


    //method optList()
    ASTBase.prototype.optList = function(){
//this generic method will look for zero or more of the requested classes,

       var item = undefined;
       var list = [];

       //do
       while(true){
         item = this.opt.apply(this, arguments);
         //if no item then break
         if (!item) {
             break};
         list.push(item);
       };//end loop

       return list.length ? list : undefined;
    };


    //method optSeparatedList(astClass:ASTBase, separator, closer) #[Separated Lists]
    ASTBase.prototype.optSeparatedList = function(astClass, separator, closer){// #[Separated Lists]

//Start optSeparatedList

       var result = [];
       var optSepar = 'NEWLINE';// #newline is optional before and after separator

//if the requested closer is NEWLINE, NEWLINE can't be optional

       //if closer is 'NEWLINE' #Except required closer *IS* NEWLINE
       if (closer === 'NEWLINE') {// #Except required closer *IS* NEWLINE
           optSepar = undefined;// #no optional separ
       }

//else, if the list starts with a NEWLINE,
//process as free-form mode separated list, where NEWLINE is a valid separator.
       
       else if (this.lexer.token.type === 'NEWLINE') {
         return this.optFreeFormList(astClass, separator, closer);
       };

//normal separated list,
//loop until closer found

       debug("optSeparatedList [" + this.constructor.name + "] indent:" + this.indent + ", get SeparatedList of [" + astClass.name + "] by '" + separator + "' closer:", closer || '-no closer-');

       var startLine = this.lexer.sourceLineNum;
       //do until .opt(closer)
       while(!this.opt(closer)){

//get a item

           var item = this.req(astClass);
           this.lock();

//add item to result

           result.push(item);

//newline after item (before comma or closer) is optional

           var consumedNewLine = this.opt(optSepar);

//if, after newline, we got the closer, then exit.

           //if .opt(closer) then break #closer found
           if (this.opt(closer)) {
               break};

//here, a 'separator' (comma/semicolon) means: 'there is another item'.
//Any token other than 'separator' means 'end of list'

           //if no .opt(separator)
           if (!this.opt(separator)) {
              //# any token other than comma/semicolon means 'end of comma separated list'
              //# but if a closer was required, then "other" token is an error
             //if closer, .throwError "Expected '#{closer}' to end list started at line #{startLine}"
             if (closer) {
                 this.throwError("Expected '" + closer + "' to end list started at line " + startLine)};
             //if consumedNewLine, .lexer.returnToken()
             if (consumedNewLine) {
                 this.lexer.returnToken()};
             //break # else ok, end of list
             break;// # else ok, end of list
           };
           //end if

//optional newline after comma

           this.opt(optSepar);
       };//end loop

       return result;
    };

    //method optFreeFormList(astClass:ASTBase, separator, closer)
    ASTBase.prototype.optFreeFormList = function(astClass, separator, closer){

//In "freeForm Mode", each item stands in its own line, and commas (separators) are optional.
//The item list ends when a closer is found or when indentation changes

       var result = [];
       var lastItemSourceLine = -1;
       var separatorAfterItem = undefined;
       var parentIndent = this.parent.indent;

//FreeFormList should start with NEWLINE
//First line sets indent level

       this.req("NEWLINE");
       var startLine = this.lexer.sourceLineNum;
       var blockIndent = this.lexer.indent;

       debug("optFreeFormList [" + this.constructor.name + "] parentname:" + this.parent.name + " parentIndent:" + parentIndent + ", blockIndent:" + blockIndent + ", get SeparatedList of [" + astClass.name + "] by '" + separator + "' closer:", closer || '-no-');

       //if blockIndent <= parentIndent #first line is same or less indented than parent - assume empty list
       if (blockIndent <= parentIndent) {// #first line is same or less indented than parent - assume empty list
         this.lexer.sayErr("free-form SeparatedList: next line is same or less indented (" + blockIndent + ") than parent indent (" + parentIndent + ") - assume empty list");
         return result;
       };

//now loop until closer or an indent change

       //do until .opt(closer) #if closer found (`]`, `)`, `}`), end of list
       while(!this.opt(closer)){

//check for indent changes

           debug("freeForm Mode .lexer.indent:" + this.lexer.indent + " block indent:" + blockIndent + " parentIndent:" + parentIndent);
           //if .lexer.indent isnt blockIndent
           if (this.lexer.indent !== blockIndent) {

//indent changed:
//if a closer was specified, indent change before the closer means error (line misaligned)

                 //if closer
                 if (closer) {
                   this.lexer.throwErr("Misaligned indent: " + this.lexer.indent + ". Expected " + blockIndent + ", or '" + closer + "' to end block started at line " + startLine);
                 };

//check for excesive indent

                 //if .lexer.indent > blockIndent
                 if (this.lexer.indent > blockIndent) {
                   this.lexer.throwErr("Misaligned indent: " + this.lexer.indent + ". Expected " + blockIndent + " to continue block, or " + parentIndent + " to close block started at line " + startLine);
                 };

//else, if no closer specified, and indent decreased => end of list

                 //break #end of list
                 break;// #end of list
           };

           //end if

//check for more than one statement on the same line, with no separator

           //if not separatorAfterItem and .lexer.sourceLineNum is lastItemSourceLine
           if (!(separatorAfterItem) && this.lexer.sourceLineNum === lastItemSourceLine) {
               this.lexer.sayErr("More than one [" + astClass.name + "] on line " + lastItemSourceLine + ". Missing ( ) on function call?");
           };

           lastItemSourceLine = this.lexer.sourceLineNum;

//else, get a item

           var item = this.req(astClass);
           this.lock();

//add item to result

           result.push(item);

//newline after item (before comma or closer) is optional

           this.opt('NEWLINE');

//separator (comma|semicolon) is optional,
//NEWLINE also is optional and valid

           separatorAfterItem = this.opt(separator);
           this.opt('NEWLINE');
       };//end loop

       debug("END freeFormMode [" + this.constructor.name + "] blockIndent:" + blockIndent + ", get SeparatedList of [" + astClass.name + "] by '" + separator + "' closer:", closer || '-no closer-');

        //if closer then .opt('NEWLINE') # consume optional newline after closer in free-form mode

       return result;
    };


    //method reqSeparatedList(astClass:ASTBase, separator, closer)
    ASTBase.prototype.reqSeparatedList = function(astClass, separator, closer){
//**reqSeparatedList** is the same as `optSeparatedList` except that it throws an error
//if the list is empty

//First, call optSeparatedList

       var result = this.optSeparatedList(astClass, separator, closer);
       //if result.length is 0, .throwParseFailed "#{.constructor.name}: Get list: At least one [#{astClass.name}] was expected"
       if (result.length === 0) {
           this.throwParseFailed("" + this.constructor.name + ": Get list: At least one [" + astClass.name + "] was expected")};

       return result;
    };


    //helper method listArgs(args:array)
    ASTBase.prototype.listArgs = function(args){
//listArgs list arguments (from opt or req). used for debugging
//and syntax error reporting

       var msg = [];
       //for each i in args
       for( var i__inx=0,i ; i__inx<args.length ; i__inx++){i=args[i__inx];
       

            //declare valid i.name

           //if typeof i is 'string'
           if (typeof i === 'string') {
               msg.push("'" + i + "'");
           }
           
           else if (i) {
               //if typeof i is 'function'
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
       }; // end for each in args

       return msg.join('|');
    };



//Helper functions for code generation
//=====================================

    //helper method out()
    ASTBase.prototype.out = function(){

//*out* is a helper function for code generation
//It evaluates and output its arguments. uses .lexer.out

       //for each item in arguments
       for( var item__inx=0,item ; item__inx<arguments.length ; item__inx++){item=arguments[item__inx];
       

          //declare on item
            //COMMENT:string, NLI, CSL:array, freeForm
            //name, lexer, produce, out

//skip empty items

         //if no item, continue
         if (!item) {
             continue};

//if it is the first thing in the line, out indentation

         //if not .lexer.out.currLine, .lexer.out.put String.spaces(.indent-1)
         if (!(this.lexer.out.currLine)) {
             this.lexer.out.put(String.spaces(this.indent - 1))};

//if it is an AST node, call .produce()

         //if item instance of ASTBase
         if (item instanceof ASTBase) {
           item.produce();
         }

//New line char means "start new line"
         
         else if (item === '\n') {
           this.lexer.out.startNewLine();
         }

//a simple string, out the string
         
         else if (typeof item === 'string') {
           this.lexer.out.put(item);
         }

//else, Object codes
         
         else if (typeof item === 'object') {

//if the object is an array, resolve with a recursive call

           //if item instance of Array
           if (item instanceof Array) {
             this.out.apply(this, item);// #recursive
           }

//{CSL:arr} -> output the array as Comma Separated List
           
           else if (item.hasOwnProperty('CSL')) {

             //if no item.CSL, continue #empty list
             if (!item.CSL) {
                 continue};

              //declare on item pre,post,separator

             //for each inx,listItem in item.CSL
             for( var inx=0,listItem ; inx<item.CSL.length ; inx++){listItem=item.CSL[inx];
             

                //declare valid listItem.out

               //if inx>0
               if (inx > 0) {
                 this.lexer.out.put(item.separator || ', ');
               };

               //if item.freeForm
               if (item.freeForm) {
                 //if listItem instanceof ASTBase
                 if (listItem instanceof ASTBase) {
                   listItem.out('\n');// #(prettier generated code) use "listItem" indent
                 }
                 
                 else {
                   item.out('\n');
                 };
               };

               this.out(item.pre, listItem, item.post);
             }; // end for each in item.CSL

             //end for

             //if item.freeForm, .out '\n' # (prettier generated code)
             if (item.freeForm) {
                 this.out('\n')};
           }

//{COMMENT:text} --> output text as a comment
           
           else if (item.COMMENT !== undefined) {

              //# prepend // if necessary
             //if not item.COMMENT.startsWith("//"), .lexer.out.put "//"
             if (!(item.COMMENT.startsWith("//"))) {
                 this.lexer.out.put("//")};

             this.out(item.COMMENT);
           }

//else, unrecognized object
           
           else {
             var msg = "method:ASTBase.out() Caller:" + this.constructor.name + ": object not recognized. type: " + typeof item;
             debug(msg);
             debug(item);
             this.throwError(msg);
           };
         }

//Last option, out item.toString()
         
         else {
           this.lexer.out.put(item.toString());// # try item.toString()
         };

         //end if
         
       }; // end for each in arguments
       
    };


        //#loop, next item


    //helper method outLineAsComment(preComment,lineInx)
    ASTBase.prototype.outLineAsComment = function(preComment, lineInx){
//out a full source line as comment into produced code

//manage optional parameters

       //if no lineInx
       if (!lineInx) {
         lineInx = preComment;
         preComment = "";
       }
       
       else {
         preComment += ": ";
       };

//validate index

       //if no .lexer, return log.error("ASTBase.outLineAsComment #{lineInx}: NO LEXER")
       if (!this.lexer) {
           return log.error("ASTBase.outLineAsComment " + lineInx + ": NO LEXER")};

       var line = this.lexer.infoLines[lineInx];
       //if no line, return log.error("ASTBase.outLineAsComment #{lineInx}: NO LINE")
       if (!line) {
           return log.error("ASTBase.outLineAsComment " + lineInx + ": NO LINE")};

//out as comment

       var prepend = "";
       //if preComment or not line.text.startsWith("//"), prepend="//"
       if (preComment || !(line.text.startsWith("//"))) {
           prepend = "//"};
       //if no .lexer.out.currLine, prepend=String.spaces(line.indent)+prepend
       if (!this.lexer.out.currLine) {
           prepend = String.spaces(line.indent) + prepend};
       //if preComment or line.text, .lexer.out.put prepend+preComment+line.text
       if (preComment || line.text) {
           this.lexer.out.put(prepend + preComment + line.text)};
       this.lexer.out.startNewLine();

       this.lexer.out.lastOutCommentLine = lineInx;
    };


    //helper method outLinesAsComment(fromLine,toLine)
    ASTBase.prototype.outLinesAsComment = function(fromLine, toLine){

       //if .lexer.out.currLine and .lexer.out.currLine.trim()
       if (this.lexer.out.currLine && this.lexer.out.currLine.trim()) {
         this.lexer.out.startNewLine();
       };

       this.lexer.out.currLine = "";// #clear indents

       //for i=fromLine to toLine
       for( var i=fromLine; i<=toLine; i++) {
         this.outLineAsComment(i);
       }; // end for i
       
    };


    //helper method outPrevLinesComments(startFrom)
    ASTBase.prototype.outPrevLinesComments = function(startFrom){

//outPrevLinesComments helper method: output comments from previous lines
//before the statement

      //declare valid .lexer.LineTypes.CODE
      //declare valid .lexer.infoLines

     var inx = startFrom || this.lineInx || 0;
     //if inx<1, return
     if (inx < 1) {
         return};

     //default .lexer.out.lastOutCommentLine = -1
     if(this.lexer.out.lastOutCommentLine===undefined) this.lexer.out.lastOutCommentLine=-1;

//find comment lines in the previous lines of code.

     var preInx = inx;
     //while preInx and preInx>.lexer.out.lastOutCommentLine
     while(preInx && preInx > this.lexer.out.lastOutCommentLine){
         preInx--;
         //if .lexer.infoLines[preInx].type is .lexer.LineTypes.CODE
         if (this.lexer.infoLines[preInx].type === this.lexer.LineTypes.CODE) {
             preInx++;
             //break
             break;
         };
     };//end loop

//Output prev comments lines (also blank lines)

     this.outLinesAsComment(preInx, inx - 1);
    };

    //#end method


    //helper method getEOLComment()
    ASTBase.prototype.getEOLComment = function(){
//getEOLComment: get the comment at the end of the line

//Check for "postfix" comments. These are comments that occur at the end of the line,
//such as `a = 1 #comment`. We want to try to add these at the end of the current JavaScript line.

        //declare valid .lexer.lastOutCommentLine
        //declare valid .lexer.LineTypes.CODE
        //declare valid .lexer.infoLines

       var inx = this.lineInx;
       var infoLine = this.lexer.infoLines[inx];

        //#declare on infoLine
        //#    indent,text,tokens:array

       //if infoLine.tokens and infoLine.tokens.length
       if (infoLine.tokens && infoLine.tokens.length) {
           var lastToken = infoLine.tokens[infoLine.tokens.length - 1];
           //if lastToken.type is 'COMMENT'
           if (lastToken.type === 'COMMENT') {
               return "" + (lastToken.value.startsWith('//') ? '' : '//') + " " + lastToken.value;
           };
       };
    };

    //helper method addSourceMap()
    ASTBase.prototype.addSourceMap = function(){

       this.lexer.out.addSourceMap(this.sourceLineNum, this.column);
    };


    //helper method levelIndent()
    ASTBase.prototype.levelIndent = function(){
//show indented messaged for debugging

       var indent = ' ';
       var node = this.parent;
       //while node
       while(node){
         node = node.parent;
         indent += '  ';
       };//end loop
       return indent;
    };


    //helper method callOnSubTree(methodName,classFilter) # recursive
    ASTBase.prototype.callOnSubTree = function(methodName, classFilter){// # recursive

//This is instance has the method, call it

     //if this has property methodName, this[methodName]()
     if (methodName in this) {
         this[methodName]()};

     //if classFilter and this is instance of classFilter, return #do not recurse on filtered's childs
     if (classFilter && this instanceof classFilter) {
         return};

//recurse on this properties and Arrays (exclude 'parent' and 'importedModule')

     //for each own property name in this
     for ( var name in this)if (this.hasOwnProperty(name))if(['parent', 'importedModule', 'requireCallNodes', 'exportDefault'].indexOf(name)===-1){

             //if this[name] instance of ASTBase
             if (this[name] instanceof ASTBase) {
                 this[name].callOnSubTree(methodName, classFilter);// #recurse
             }
             
             else if (this[name] instanceof Array) {
                 //for each item in this[name] where item instance of ASTBase
                 for( var item__inx=0,item ; item__inx<this[name].length ; item__inx++){item=this[name][item__inx];
                 if(item instanceof ASTBase){
                    //declare item:ASTBase
                   item.callOnSubTree(methodName, classFilter);
                 }}; // end for each in this[name]
                 
             };
             }
     //end for each property
     //end for
     
    };


    //helper method getRootNode()
    ASTBase.prototype.getRootNode = function(){

//**getRootNode** method moves up in the AST up to the node holding the global scope ("root").
//"root" node has parent = Project

       var node = this;
       //while node.parent instanceof ASTBase
       while(node.parent instanceof ASTBase){
           node = node.parent;// # move up
       };//end loop
       return node;
    };


    //helper method compilerVar(name)
    ASTBase.prototype.compilerVar = function(name){

//helper function compilerVar(name)
//return root.compilerVars.members[name].value

       //if .getRootNode().compilerVars.findOwnMember(name) into var asked
       var asked=undefined;
       if ((asked=this.getRootNode().compilerVars.findOwnMember(name))) {
          //declare valid asked.findOwnMember
         return asked.findOwnMember("**value**");
       };
    };
   //end class ASTBase

//----------------------------------------------------------------------------------------------

   //export helper function getUniqueVarName(prefix)
   function getUniqueVarName(prefix){
//Generate unique variable names

       var id = uniqueIds[prefix] || 0;

       id += 1;

       uniqueIds[prefix] = id;

       return '_' + prefix + id;
   };
   //export
   ASTBase.getUniqueVarName=getUniqueVarName;

//Support Module Var:

   var uniqueIds = {};




//------------------------------------------------------------------------
//##Export

//    module.exports = ASTBase

module.exports=ASTBase;

//Compiled by LiteScript compiler v0.5.0, source: /home/ltato/LiteScript/source-v0.6.0/ASTBase.lite.md
//# sourceMappingURL=ASTBase.js.map
