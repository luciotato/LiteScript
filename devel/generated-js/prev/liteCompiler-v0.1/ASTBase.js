var Lexer;
var k$indexof = [].indexOf || function (item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
/* The Abstract Syntax Tree (AST) Base class 
   ----------------------------------------- 
   This module defines the base abstract syntax tree class used by the grammar. 
   It's main purpose is to provide utility methods used in the grammar 
   for **req**uired tokens, **opt**ional tokens 
   and comma or semicolon **Separated Lists** of symbols. 
   Dependencies */
Lexer = require('./Lexer');

/* /! 
    
   declare debug,log 
    
   declare on log 
   error, warning 
    
   declare on Error.prototype 
   message 
   controled 
   soft 
    
   !/ 
   ---------------------------------------------------------------------------------------------- 
   ##OutCode helper class 
   outCode: helper methods to produce code 
   Theese are helper methods for AST nodes produce() methods 
   It also handles SourceMap generation for Chrome Developer Tools debugger and Firefox Firebug */

function OutCode() {
}

/* /! 
    
   properties 
   lineNum, column 
   currLine:string 
   lines:string array 
   uniqueIds 
   sourceMap 
    
   !/ */
OutCode.prototype.start = function () {
  /* Source Map 
     globalMap for sourceMapping 
     https://github.com/mozilla/source-map#with-sourcemapgenerator-low-level-api */
  this.lineNum = 1;
  this.column = 1;
  this.lines = [];
  this.uniqueIds = {};
}

/* me.sourceMap = require('../sourceMap.js') 
   ###Generate unique variable names */
OutCode.prototype.getUniqueVarName = function (prefix) {
  var id;
  id = this.uniqueIds[prefix] || 0;
  id += 1;
  this.uniqueIds[prefix] = id;
  return prefix + '__' + id;
}

/* ### out some text into produced code */
OutCode.prototype.out = function (text) {
  /* if no current line */
  if (this.currLine === undefined) {
    /* create a empty one */
    this.currLine = "";
    this.column = 1;
  }
  if (text) {
    this.currLine += text;
    this.column += text.length;
  }
}

/* ### Start New Line into produced code */
OutCode.prototype.startNewLine = function () {
  /* if there is something in the buffer */
  if (this.currLine !== undefined) {
    /* send the current line */
    this.lines.push(this.currLine);
    debug(this.lineNum + ' ' + this.currLine);
    /* clear current line */
    this.lineNum += 1;
    this.currLine = undefined;
  }
}

/* ### get result and clear memory */
OutCode.prototype.getResult = function () {
  var result;
  this.startNewLine(); /* close last line */
  result = this.lines;
  this.lines = [];
  return result;
}

/* ----------------------------- 
   outRemove removes the last part of inserted code, starting from a col 
   It is used when a produce() method require "rewind" in order to prepend code 
   Example: 
   Lite: `if getItem(index++) is Array` 
   js: `if (Array.isArray(getItem(index++)))` 
   The Lite producer, outs , `getItem(index++)` but then it read 'Array' and 
   it has to to wrap the entire expression with `Array.isArray()` 
   so we "remove" the last produced string: `getItem(index++)`, and then insert 
   `Array.isArray(`, `getItem(index++)`, `)` */
OutCode.prototype.outRemove = function (col) {
  var result;
  result = this.currLine.substr(col - 1);
  debug('<-(backspace)<-: ', result);
  this.currLine = this.currLine.substr(0, col - 1);
  this.column = col;
  return result;
}

/* ASTBase Class 
   ============= 
   This class serves as a base class on top of which AST nodes are defined. 
   It contains basic functions to parse the token stream. 
   forward declares  - class methods */
function ASTBase(parent) {
  this.parent = parent;
  /* Get lexer from parent */
  this.lexer = parent.lexer;
  /* Remember this node source position */
  if (this.lexer && this.lexer.sourceLineNum) {
    this.sourceLineNum = this.lexer.sourceLineNum;
    this.column = this.lexer.token.column;
    /* Also remember line index in tokenized lines, and this line indent */
    this.lineInx = this.lexer.lineInx;
    this.indent = this.lexer.indent;
  }
}

/* /! 
    
   properties 
   parent, lexer:Lexer, sourceLineNum, lineInx 
   column, index 
   indent, locked 
   name, type 
   outCode 
    
   !/ */

/* debug "created",me.constructor.name,"indent",me.indent 
   ------------------------------------------------------------------------ 
   **lock** marks this node as "locked", meaning we are certain this is the right class 
   for the given syntax. For example, if the `FunctionDeclaration` class see the token `function`, 
   we are certain this is the correct class to use, so we 'lock()'. 
   Once locked, any **req**uired token not present causes compilation to fail. */
ASTBase.prototype.lock = function () {
  this.locked = true;
}

/* debug helper method *positionText* */
ASTBase.prototype.positionText = function () {
  if (!(this.lexer)) {
    return "(built-in)";
  }
  return ("" + (this.lexer.filename) + ":" + (this.sourceLineNum) + ":" + (this.column || 0));
}

/* debug helper method toString() */
ASTBase.prototype.toString = function () {
  return ("[" + (this.constructor.name) + "]");
}

/* ------------------------------------------------------------------------ 
   **throwError** add lexer position info and throws a 'controled' error */
ASTBase.prototype.throwError = function (msg) {
  var err;
  err = new Error(this.lexer.posToString() + ". " + msg);
  err.controled = true;
  throw err;
}

/* end 
   ------------------------------------------------------------------------ 
   **throwParseFailed** throws a soft-error 
   During a node.parse(), if there is a token mismatch, a "parse failed" is raised. 
   "parse failed" signals a failure to parse the tokens from the stream, 
   however the syntax might still be valid for another AST node. 
   If the AST node was locked-on-target, it is a hard-error. 
   If the AST node was NOT locked, it's a soft-error, and will not abort compilation 
   as the parent node will try other AST classes against the token stream before failing. */
ASTBase.prototype.throwParseFailed = function (msg) {
  var err;
  if (this.locked) { /* hard error if locked */
    this.throwError(msg);
  }
  err = new Error(msg);
  err.soft = true; /* "parse failed" is a soft error */
  err.controled = true;
  throw err;
}

/* ------------------------------------------------------------------------ 
   **parse()** is an abstract method representing the TRY-Parse of the node. 
   Child classes _must_ override this method */
ASTBase.prototype.parse = function () {
  this.lock();
  this.throwParseFailed('Parser Not Implemented: ' + this.constructor.name);
}

/* **produce()** is the method to produce target code 
   Child classes should override this, if the default production isnt: `me.out me.name` */
ASTBase.prototype.produce = function () {
  this.out(this.name);
}

/* ---------------------------------------------------------------------------------------------- */
ASTBase.prototype.parseDirect = function (key, directObj) {
  var directASTNode, statement;
  /* We use a DIRECT associative array to pick the exact AST node to parse 
     based on the actual token value or type. 
     This speeds up parsing, avoiding parsing by trial & error 
     Check keyword */
  if (directObj.hasOwnProperty(key)) {
    /* get class */
    directASTNode = directObj[key];
    /* try parse */
    statement = this.opt(directASTNode);
    /* if parsed ok, assign keyword for reference */
    if (statement) {
      statement.keyword = key;
    }
    /* return parsed statement or nothing */
    return statement;
  }
}

/* end method 
   ---------------------------------------------------------------------------------------------- 
   **opt** attempts to parse the token stream using one of the classes or token types specified. 
   This method takes a variable number of arguments. 
   For example: 
   calling `me.opt IfStatement, Expression, 'IDENTIFIER'` 
   would attempt to parse the token stream first as an `IfStatement`. If that fails, it would attempt 
   to use the `Expression` class. If that fails, it will accept a token of type `IDENTIFIER`. 
   If all of those fail, it will return `undefined`. */
ASTBase.prototype.opt = function () {
  var startPos, spaces, searched, isTYPE, result, astNode, ki$1, kobj$1;
  /* Remember the actual position, to rewind if all the arguments to `opt` fail */
  startPos = this.lexer.getPos();
  /* debug */
  spaces = this.levelIndent();
  /* For each argument, -a class or a string-, we will attempt to parse the token stream 
     with the class, or match the token type to the string. 
     /! 
      
     declare debug 
      
     declare searched 
     declare on searched 
     toUpperCase 
     name 
     !/ */
  kobj$1 = arguments;
  for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
    searched = kobj$1[ki$1];
    /* skip empty, null & undefined */
    if (!(searched)) {
      continue;
    }
    /* determine value or type 
       For strings we check the token **value** or **TYPE**, and return the token value */
    if (typeof searched === 'string') {
      isTYPE = /^[A-Z]+$/.test(searched);
      debug(spaces, this.constructor.name, 'TRY', searched, 'on', this.lexer.token.toString());
      if ((isTYPE && this.lexer.token.type === searched) || (!(isTYPE) && this.lexer.token.value === searched)) {
        /* Ok, type/value found! now we return: token.value 
           Note: we shouldnt return the 'token' object, because returning objects (here and in js) 
           is a "pass by reference". You return a "pointer" to the object. 
           If we return the 'token' object, the calling function will recive a "pointer" 
           and it can inadvertedly alter the token object in the token stream. (it should not - subtle bugs) */
        debug(spaces, this.constructor.name, 'matched OK:', searched, this.lexer.token.value);
        result = this.lexer.token.value;
        /* Advance a token, me.lexer.token always has next token */
        this.lexer.nextToken();
        return result;
      }
    } else {
      /* "searched" is a AST class */
      debug(spaces, this.constructor.name, 'TRY', searched.name, 'on', this.lexer.token.toString());
      /* if the argument is an AST node class, we instantiate the class and try the `parse()` method. 
         `parse()` can fail with `ParseFailed` if the construction do not match 
         /! 
          
         declare astNode:ASTBase 
         !/ 
         if it can't parse, will raise an exception 
         parsed ok!, return instance */
      try {
        astNode = new searched(this);
        astNode.parse();
        debug(spaces, 'Parsed OK!->', searched.name);
        return astNode;
      } catch (err) {
        /* If parsing fail, but the AST node were not 'locked' on target, (a soft-error), 
           we will try other AST nodes. */
        if (err.soft) {
          debug(spaces, searched.name, 'parse failed.', err.message);
          /* rewind the token stream, to try other AST nodes */
          debug('REW to', this.sourceLineNum, this.lexer.index, this.lexer.token.toString());
          this.lexer.setPos(startPos);
        } else {
          /* else: it's a hard-error 
             The AST node were locked-on-target, or is a generic error. 
             We abort parsing and throw. 
             debug 
             the first hard-error is the most informative, the others are cascading ones */
          if (this.lexer.hardError === null) {
            this.lexer.hardError = err;
          }
          /* end if 
             raise up, abort parsing */
          throw err;
        }
      }
    }
  }
  /* end if - type of error 
     end catch 
     end if - string or class 
     loop - try the next argument 
     No more arguments. 
     `opt` returns `undefined` if none of the arguments could be use to parse the stream. */
  return undefined;
}

/* end method opt 
   ----------------------------- 
   **req** works the same way as `opt` except that it throws an error if none of the arguments 
   can be used to parse the stream. */
ASTBase.prototype.req = function () {
  var result;
  /* We first call `opt` to see what we get. If a value is returned, the function was successful, 
     so we just return the node that `opt` found. 
     else, If `opt` returned nothing, we give the user a useful error. */
  result = this.opt.apply(this, arguments);
  if (!(result)) {
    this.throwParseFailed(("" + (this.constructor.name) + ": found " + (this.lexer.token.toString()) + " but " + (this.listArgs(arguments)) + " required"));
  }
  return result;
}

/* ------------------------------------------------------------------------ 
   **optValue** checks if the next token has a "value" that matches one of the arguments provided. 
   If so, it returns token.value and advances the stream. Otherwise, it returns `nothing`. */
ASTBase.prototype.optValue = function () {
  var actual;
  actual = this.lexer.token.value;
  if ((k$indexof.call(arguments, actual) >= 0)) {
    /* One of the searched 'values' match */
    debug(this.levelIndent(), 'OK->', actual);
    /* Advance the token stream. lexer.token always has the next token */
    this.lexer.nextToken();
    /* return found token.value */
    return actual;
  } else {
    return undefined;
  }
}

/* ------------------------------------------------------------------------ 
   **reqValue** is the same as `optValue` except that it throws an error if the value 
   is not in the arguments */
ASTBase.prototype.reqValue = function () {
  var val;
  /* First, call optValue */
  val = this.optValue.apply(this, arguments);
  if (val) {
    return val;
  }
  /* if it returns nothing, the token.value didn't match. We raise an error. 
     if the AST node was 'locked' on target, it'll be a hard-error, 
     else, it'll be a soft-error and others AST nodes could be tried. */
  this.throwParseFailed(("" + (this.constructor.name) + ": found '" + (this.lexer.token.value) + "' but expected: " + (this.listArgs(arguments))));
}

/* ------------------------------------------------------------------------------------ 
   **ifOptValue** this very simple method calls 'optValue' but returns true|false instead of string|undefined */
ASTBase.prototype.ifOptValue = function () {
  if (this.optValue.apply(this, arguments)) {
    return true;
  } else {
    return false;
  }
}

/* ------------------------------------------------------------------------------------ 
   **optList** this generic method will look for zero or more of the requested class, */
ASTBase.prototype.optList = function (astClass) {
  var list, item;
  item;
  list = [];
  while (true) {
    item = this.opt(astClass);
    if (!(item)) { /* no more items */
      return list;
    }
    list.push(item);
  }
}

/* loop 
   ####a helper method optNewLine() 
   internal function to get optional NEWLINE. Warn if indent is not even. */
ASTBase.prototype.optNewLine = function () {
  var nl;
  nl = this.opt('NEWLINE');
  if (nl && this.lexer.indent % 2 !== 0) {
    log.warning(("" + (this.lexer.posToString()) + ". Odd indent " + (this.lexer.indent)));
  }
  return nl;
}

/* ###a method optSeparatedList(astClass:ASTBase, separator, closer) */
ASTBase.prototype.optSeparatedList = function (astClass, separator, closer) {
  var result, startLine, item;
  debug(("optSeparatedList [" + (this.constructor.name) + "] indent:" + (this.indent) + ", get SeparatedList of [" + (astClass.name) + "] by '" + separator + "' closer:"), closer || '-no closer char-');
  /* Start optSeparatedList */
  result = [];
  /* If the list starts with a NEWLINE, 
     process as free-form mode separated list */
  if (this.lexer.token.type === 'NEWLINE') {
    return this.optFreeFormList(astClass, separator, closer);
  }
  /* normal separated list 
     loop until closer found */
  startLine = this.lexer.sourceLineNum;
  while (true) {
    /* if closer found, end of list */
    if (this.opt(closer)) {
      break; /* end of list */
    }
    /* else, get a item */
    item = this.req(astClass);
    this.lock();
    /* add item to result */
    result.push(item);
    /* newline after item (before comma or closer) is optional */
    this.optNewLine();
    /* if, after newline, we got the closer, then exit. */
    if (this.opt(closer)) {
      /* closer found */
      break;
    }
    /* here 'comma/semicolon' means: 'there is another item' 
       any token other than comma means 'end of comma separated list' */
    if (!(this.opt(separator))) {
      /* any token other than comma/semicolon means 'end of comma separated list' 
         if a closer was required, then this is an error */
      if (closer) {
        this.throwError(("Expected '" + closer + "' to end list started at line " + startLine));
      }
      break; /* ok, end of comma separated list' */
    }
    /* end if 
       optional newline after comma */
    this.optNewLine();
  }
  /* loop, try get next item */
  return result;
}

/* ###a method optFreeFormList 
   In "freeForm Mode", each item stands in its own line, and commas (separators) are optional. 
   The item list ends when a closer is found or when indentation changes */
ASTBase.prototype.optFreeFormList = function (astClass, separator, closer) {
  var result, lastItemSourceLine, startLine, blockIndent, item, newLineAfterItem, separatorAfterItem;
  result = [];
  lastItemSourceLine = -1;
  separatorAfterItem;
  /* FreeFormList should start with NEWLINE 
     First line sets indent level */
  this.req("NEWLINE");
  startLine = this.lexer.sourceLineNum;
  blockIndent = this.lexer.indent;
  if (blockIndent <= this.indent) { /* first line is same or less indented than parent - assume empty list */
    this.lexer.sayErr(("free-form SeparatedList: next line is same or less indented (" + blockIndent + ") than parent indent (" + (this.indent) + ") - assume empty list"));
    return result;
  }
  /* now loop until a indent change */
  while (true) {
    /* if closer found (`]`, `)`, `}`), end of list */
    if (this.opt(closer)) {
      /*  */
      break;
    }
    /* check if there are more tha one statement on the same line, with no separator */
    if (!(separatorAfterItem) && this.lexer.sourceLineNum === lastItemSourceLine) {
      this.throwError(("More than one [" + (astClass.name) + "] on line " + lastItemSourceLine + ". Missing ( ) on function call?"));
    }
    /* else, get a item */
    lastItemSourceLine = this.lexer.sourceLineNum;
    item = this.req(astClass);
    this.lock();
    /* add item to result */
    result.push(item);
    /* newline after item (before comma or closer) is optional */
    newLineAfterItem = this.optNewLine();
    /* if, after newline, we got the closer, then exit. 
       closer is normally one of: `]` , `)`, `}` */
    if (this.opt(closer)) {
      /* closer found */
      break;
    }
    /* check indent changes */
    debug(("freeForm Mode indent:" + blockIndent + " me.lexer.indent:" + (this.lexer.indent)));
    if (this.lexer.indent !== blockIndent) {
      /* indent changed: 
         if a closer was specified, indent change before the closer means error (line misaligned) */
      if (closer) {
        this.throwError(("Misaligned indent: " + (this.lexer.indent) + ". Expected " + blockIndent + ", or '" + closer + "' to end block started at line " + startLine));
      }
      /* check for excesive indent */
      if (this.lexer.indent > blockIndent) {
        this.throwError(("Misaligned indent: " + (this.lexer.indent) + ". Expected " + blockIndent + " to continue block, or " + (this.indent) + " to close block started at line " + startLine));
      }
      /* else, if no closer specified, indent decreased => end of list */
      break;
    }
    /* end if 
       in reeForm mode, separator (comma|semicolon) is optional, 
       NEWLINE also is optional and valid */
    separatorAfterItem = this.opt(separator);
    this.optNewLine();
  }
  /* loop, try get next item */
  debug(("END freeFormMode [" + (this.constructor.name) + "] blockIndent:" + blockIndent + ", get SeparatedList of [" + (astClass.name) + "] by '" + separator + "' closer:"), closer || '-no closer-');
  /* set body indent to block indent */
  this.indent = blockIndent;
  if (closer) {
    this.optNewLine(); /* optional newline after closer in free-form */
  }
  return result;
}

/* ------------------------------------------------------------------------ 
   **reqSeparatedList** is the same as `optSeparatedList` except that it throws an error 
   if the list is empty */
ASTBase.prototype.reqSeparatedList = function (astClass, separator, closer) {
  var result;
  /* First, call optSeparatedList 
     /! 
      
     declare result:array 
     !/ */
  result = this.optSeparatedList(astClass, separator, closer);
  if (result.length === 0) {
    this.throwParseFailed(("" + (this.constructor.name) + ": Get list: At least one [" + (astClass.name) + "] was expected"));
  }
  return result;
}

/* -------------------------------- 
   **getParent** method searchs up the AST until found the specfied node class */
ASTBase.prototype.getParent = function (searchedClass) {
  var node;
  node = this;
  while (node && !((node instanceof searchedClass))) {
    node = node.parent; /* move to parent */
  }
  return node;
}

/* ------------------------------------------------------------------------ 
   #debug - listArgs list arguments, for debugging */
ASTBase.prototype.listArgs = function (args) {
  var msg, i, ki$2, kobj$2;
  msg = [];
  kobj$2 = args;
  for (ki$2 = 0; ki$2 < kobj$2.length; ki$2++) {
    i = kobj$2[ki$2];
    /* /! 
        
       declare on i 
       name 
       !/ */
    if (typeof i === 'string') {
      msg.push(("'" + i + "'"));
    } else if (i) {
      if (typeof i === 'function') {
        msg.push(("[" + (i.name) + "]"));
      } else {
        msg.push(("<" + (i.name) + ">"));
      }
    }
     else {
      msg.push("[null]");
    }
  }
  return msg.join('|');
}

/* Helper functions for code generation 
   ===================================== */
ASTBase.prototype.out = function () {
  var item, itemCSL, inx, ki$4, kobj$4, msg, ki$3, kobj$3;
  /* *out* is a helper function for code generation 
     It evaluates and output its arguments. uses ASTBase.prototype.outCode */
  kobj$3 = arguments;
  for (ki$3 = 0; ki$3 < kobj$3.length; ki$3++) {
    item = kobj$3[ki$3];
    /* /! 
        
       declare on item 
       COMMENT:string, NLI, CSL:array, freeForm 
       name, lexer, produce, out 
        
       !/ 
       if it is the first thing in the line, out indent */
    if (!(this.outCode.currLine)) {
      this.outCode.out(String.spaces(this.indent - 1));
    }
    /* if it is an AST node, call .produce() */
    if (item instanceof ASTBase) {
      item.produce();
    } else if (item === '\n') {
      /* New line char => start new line, with this statement indent */
      this.outCode.startNewLine();
    }
     else if (typeof item === 'string') {
      this.outCode.out(item);
    }
     else if (item && typeof item === 'object') {
      /* Object codes 
         if the object is an array, recursive call */
      if (item instanceof Array) {
        this.out.apply(this, item); /* recursive */
      } else if (item.hasOwnProperty('CSL')) {
        /* {CSL:arr} -> output the array as comma separated values */
        if (!(item.CSL)) {
          /* empty list */
          continue;
        }
        kobj$4 = item.CSL;
        for (ki$4 = 0; ki$4 < kobj$4.length; ki$4++) {
          itemCSL = kobj$4[ki$4];
          inx = ki$4;
          if (inx > 0) {
            this.outCode.out(item.separator || ', ');
          }
          if (item.freeForm) {
            if (itemCSL instanceof ASTBase) {
              itemCSL.out('\n'); /* (prettier generated code) use "itemCSL" indent */
            } else {
              item.out('\n');
            }
          }
          this.out(itemCSL);
        }
        /* end for */
        if (item.freeForm) {
          this.out('\n');
        }
      }
       else if (item.NLI !== undefined) {
        /* {NLI:indent} --> new line and spaces to reach the indent */
        this.outCode.startNewLine();
        this.outCode.out(String.spaces(item.NLI - 1));
      }
       else if (item.COMMENT !== undefined) {
        /* {COMMENT:text} --> output text as a comment 
           prepend // if necessary */
        if (!(item.COMMENT.startsWith("//"))) {
          this.outCode.out("//");
        }
        this.out(item.COMMENT);
      }
       else {
        msg = ("method:ASTBase.out() Caller:" + (this.constructor.name) + ": object not recognized. type: ") + typeof item;
        debug(msg);
        debug(item);
        this.throwError(msg);
      }
    }
     else if (item) {
      /* fail with msg 
         Last chance, out item.toString() 
         if there is somehting */
      this.outCode.out(item.toString());
    }
  }
}

/* end if 
   end Loop 
   ### out a full line as comment into produced code */
ASTBase.prototype.outLineAsComment = function (preComment, lineInx) {
  var line, prepend;
  if (!(lineInx)) {
    lineInx = preComment;
    preComment = "";
  } else {
    preComment += ": ";
  }
  if (!(this.lexer)) {
    log.error(("ASTBase.outLineAsComment " + lineInx + ": NO LEXER"));
  } else {
    line = this.lexer.infoLines[lineInx];
    if (!(line)) {
      log.error(("ASTBase.outLineAsComment " + lineInx + ": NO LINE"));
    } else {
      prepend = "";
      if (preComment || (line.text && !(line.text.startsWith("//")))) {
        prepend = "//";
      }
      this.outCode.out(String.spaces(line.indent) + prepend + preComment + line.text);
      this.outCode.startNewLine();
    }
  }
  this.lexer.lastOutCommentLine = lineInx;
}

ASTBase.prototype.outLinesAsComment = function (fromLine, toLine) {
  var i;
  if (this.outCode.currLine && this.outCode.currLine.trim()) {
    this.outCode.startNewLine();
  }
  this.outCode.currLine = "";
  i = fromLine;
  while (i <= toLine) {
    this.outLineAsComment(i);
    i += 1;
  }
}

/* ------------------------------- 
   Here we use mozilla/source-map to generate source map items 
   https://github.com/mozilla/source-map#with-sourcemapgenerator-low-level-api */
ASTBase.prototype.addSourceMap = function () {
  var sourceMapItem;
  /* /! 
      
     declare window 
     !/ */
  if (typeof window === 'undefined') {
    /* in Node */
    sourceMapItem = {generated: {line: this.outCode.lineNum, column: this.outCode.column}, original: {line: this.sourceLineNum || 1, column: this.column}, name: "a"};
    this.outCode.sourceMap.addMapping(sourceMapItem);
  }
}

/* ------------- */
ASTBase.prototype.levelIndent = function () {
  var indent, parent;
  indent = ' ';
  parent = this.parent;
  while (parent) {
    parent = parent.parent;
    indent += '  ';
  }
  return indent;
}

/* ------------------------------------------------------------------------ 
   Initialize prototype */
ASTBase.prototype.outCode = new OutCode();
/* ------------------------------------------------------------------------ 
   Export */
module.exports = ASTBase;
