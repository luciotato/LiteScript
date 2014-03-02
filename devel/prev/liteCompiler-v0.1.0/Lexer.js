var LineTypes, util, tokenPatterns;
var k$indexof = [].indexOf || function (item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
/* The Lexer 
   ========= 
   The Lexer translates code (an array of lines) into an array of tokenized lines to be parsed. 
   The Lexer class acts as 
   * Lexer/Tokenizer 
   * Token Stream (input) 
   All the parts of the lexer work with "arrays" of lines. 
   (instead of a buffer or a large string) 
   The first lexer pass analyzes entire lines. 
   Each line of the array is then classified with a Line Type: */
LineTypes = {CODE: 0, COMMENT: 1, BLANK: 2};
/* After, each line with type:CODE is then *Tokenized* and gets a `tokens[]` array 
   ------------------------- 
   Utility 
   Helper methods 
   String shims (startsWith, endsWith) */
util = require('./util');
/* /! 
    
   declare debug:function 
    
   declare on String 
   startsWith,endsWith 
    
   declare log 
   declare on log 
   error:function, warning:function 
    
   declare err 
   declare on err 
   soft, controled 
    
   declare Lexer 
   declare on Lexer 
   initSource 
   filename, stringInterpolationChar 
   throwErr 
   nextSourceLine 
    
   !/ 
   Token Recognition Regex Patterns 
   -------------------------------- 
   Comments can be on a code line, starting with a `#` or `//`, and ending at the end of a line. 
   Example: `x = 1 //comment` 
   Comments can also be multiline, starting with starting with `**` and ending with `**` */
tokenPatterns = [['COMMENT', /^#(.*)$|^\/\/(.*)$/], ['NUMBER', /^0x[a-f0-9]+/i], ['NUMBER', /^[0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?/i], ['REGEX', /^(\/(?![\s=])[^[\/\n\\]*(?:(?:\\[\s\S]|\[[^\]\n\\]*(?:\\[\s\S][^\]\n\\]*)*])[^[\/\n\\]*)*\/)([imgy]{0,4})(?!\w)/], ['STRING', /^'(?:[^'\\]|\\.)*'/], ['STRING', /^"(?:[^"\\]|\\.)*"/], ['WHITESPACE', /^[\f\r\t\v\u00A0\u2028\u2029 ]+/], ['ASSIGN', /^=/], ['ASSIGN', /^[\+\-\*\/]=/], ['LITERAL', /^(\+\+|--)/], ['LITERAL', /^[\(\)\[\]\;\,\.\{\}]/], ['OPER', /^(no|is|isnt|not|and|but|or|in|instance|instanceof|has|bitwise|mod)\b/], ['OPER', /^(\^|\*|\/|\+|-|<>|>=|<=|>>|<<|>|<|!==)/], ['OPER', /^[\?\:]/], ['IDENTIFIER', /^[$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*/]];
/* **Numbers** can be either in hex format (like `0xa5b`) or decimal/scientific format (`10`, `3.14159`, or `10.02e23`). 
   There is no distinction between floating point and integer numbers. 
   Regex tokens are regular expressions. The javascript producer, just passes the raw regex to JavaScript. 
   Strings can be either single or double quoted. 
   Whitespace is discarded by the lexer, but needs to exist to break up other tokens. 
   The semicolon `;` is considered whithespace, so you can keep adding it at the end of the line, 
   and we will happily ignore it 
   ASSIGN are symbols triggering the assignment statements. 
   In LiteScript, assignment is a *statement* and not a *expression* 
   = += -= *= /= 
   Postfix and prefix ++ and -- are considered 'LITERAL' 
   They're not considered 'operators' since they do no introduce a new operand. 
   Postfix ++ and -- are modifiers for a variable reference 
   also puctuation symbols (like `,` `[` `:`) 
   An operator is a symbol or a word (like `=` or `+` or `and`) used to compose `Expressions` 
   Identifiers (generally variable names), must start with a letter, `$`, or underscore. 
   Subsequent characters can also be numbers. Unicode characters are supported in variable names. 
   ---------------------- 
   The Token Class 
   =============== 
   Each Token has: 
   * a type ('IDENTIFIER', 'STRING', 'OPER', 'NUMBER', etc), 
   * a `value` (parsed text) 
   * and the column in the source line in which the token appears */

function Token(type, tokenText, column) {
  this.type = type;
  this.value = tokenText || ' '; /* no text is represened by ' ', since '' is 'falsey' */
  this.column = column;
}

/* /! 
    
   properties 
   type:string 
   value:string 
   column 
   !/ */

Token.prototype.toString = function () {
  return ("'" + (this.value) + "'(" + (this.type) + ")");
}

/* InfoLine Class 
   -------------- 
   The lexer turns each input line into a **infoLine** 
   A **infoLine** is a clean, tipified, indent computed, trimmed line 
   it has a source line number reference, and a tokens[] array if it's a CODE line 
   Each "infoLine" has: 
   * a line "type" of: `BLANK`, `COMMENT` or `CODE` (LineTypes), 
   * a tokens[] array if it's `CODE` 
   * sourceLineNum: the original source line number (for SourceMap) 
   * indent: the line indent 
   * text: the line text (clean, trimmed) */
function InfoLine(lexer, type, indent, text, sourceLineNum) {
  this.type = type;
  this.indent = indent;
  this.text = text;
  this.sourceLineNum = sourceLineNum;
}

/* /! 
    
   properties 
   type 
   indent,sourceLineNum 
   text:String 
   tokens: Token array 
    
    
   !/ */

/* me.dump() #debug info 
   end InfoLine constructor */
InfoLine.prototype.dump = function () {
  var type;
  /* out debug info */
  if (this.type === LineTypes.BLANK) {
    debug(this.sourceLineNum, "(BLANK)");
    return;
  }
  type = "";
  if (this.type === LineTypes.COMMENT) {
    type = "COMMENT";
  } else if (this.type === LineTypes.CODE) {
    type = "CODE";
  }
  debug(this.sourceLineNum, ("" + (this.indent) + "(" + type + ")"), this.text);
  if (this.tokens) {
    debug('   ', this.tokens.join(' '));
    debug();
  }
}

/* The Tokenize method 
   ------------------- 
   The Infoline.tokenize() method, creates the 'tokens' array by parsing the .text 
   It also replaces *Embdeded Expressions* #{} in string constants, storing the expression tokens */
InfoLine.prototype.tokenize = function (lexer) {
  var code, words, result, colInx, msg, chunk, match, tokenType, typeRegExpPair, regex, matches, ki$1, kobj$1, errPosString, err, token, parsed, composed;
  code = this.text;
  /* debug 
     This for loop will try each regular expression in `tokenPatterns` 
     against the current head of the code line until one matches. 
     /! 
      
     declare regex:RegExp 
     !/ 
     end for checking patterns 
     If there was no match, this is a bad token and we will abort compilation here. 
     end if 
     If its 'WHITESPACE' we ignore it. 
     ignore it 
     create token 
     If its a string constant, and it has `#|$`, process the **Interpolated Expressions**. 
     /! 
      
     declare parsed:Array 
     !/ 
     parse the string, splitting at $ and ${...}, return array 
     if the first expression starts with "(", we add `"" + ` so the parentheses 
     can't be mis-parsed as a "function call" 
     join expressions using +, so we have a valid composed expression, evaluating to a string. 
     Now we 'tokenize' the new composed expression 
     And we append the new tokens instead of the original string constant 
     Else it's a single token. Add the token to result array 
     debug 
     end if 
     end if WITHESPACE 
     Advance col index into code line 
     end while text in the line 
     debug 
     debug msg 
     Store tokenize result in tokens 
     Special lexer options: string interpolation char 
     `lexer options string interpolation char [is] (IDENTIFIER|LITERAL|STRING)` 
     not a CODE line 
     get it 
     optional 'is' 
     optionally quoted 
     check 
     enhance error reporting */
  try {
    words = [];
    result = [];
    colInx = 0;
    msg = "";
    while (colInx < code.length) {
      chunk = code.slice(colInx);
      match = '';
      tokenType = '';
      kobj$1 = tokenPatterns;
      for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
        typeRegExpPair = kobj$1[ki$1];
        regex = typeRegExpPair[1];
        matches = regex.exec(chunk);
        if (matches && matches[0]) {
          match = matches[0];
          tokenType = typeRegExpPair[0];
          break;
        }
      }
      if (!(match)) {
        msg = ("" + (lexer.filename) + ":" + (this.sourceLineNum) + ":" + (colInx + 1) + " Tokenize patterns: invalid token: " + chunk);
        log.error(msg);
        log.error(code);
        errPosString = '';
        while (errPosString.length < colInx) {
          errPosString += ' ';
        }
        log.error(errPosString + '^');
        err = new Error(msg);
        err.controled = true;
        throw err;
      }
      if (tokenType === 'WHITESPACE') {
        null;
      } else {
        token = new Token(tokenType, match, this.indent + colInx + 1);
        words.push(match);
        if (tokenType === 'STRING' && match.length > 3 && match.search(RegExp("[^\\\\]\\" + lexer.stringInterpolationChar)) >= 0) {
          parsed = String.splitExpressions(match, lexer.stringInterpolationChar);
          if (parsed.length && parsed[0].startsWith("(")) {
            parsed.unshift('""');
          }
          composed = new InfoLine(lexer, LineTypes.CODE, token.column, parsed.join(' + '), this.sourceLineNum);
          composed.tokenize(lexer);
          result = result.concat(composed.tokens);
        } else {
          msg += token.toString();
          result.push(token);
        }
      }
      colInx += match.length;
    }
    this.tokens = result;
    if (words[0] === 'lexer') {
      if (words.slice(0, 5).join(" ") === "lexer options string interpolation char") {
        this.type = LineTypes.COMMENT;
        lexer.stringInterpolationChar = words[5];
        if (lexer.stringInterpolationChar === 'is') {
          lexer.stringInterpolationChar = words[6];
        }
        if ((k$indexof.call(['"', "'"], lexer.stringInterpolationChar[0]) >= 0)) {
          lexer.stringInterpolationChar = lexer.stringInterpolationChar.slice(1, -1);
        }
        if (!(lexer.stringInterpolationChar)) {
          lexer.throwErr("missing string interpolation char");
        }
      }
    }
  } catch (e) {
    log.error(("" + (lexer.filename) + ":" + (this.sourceLineNum) + ":" + (colInx + 1)), e.message);
    log.error(msg);
    throw e;
  }
}

/* -------------------------- */

function LexerPos() {
}

/* /! 
    
   properties 
   lineInx,sourceLineNum 
   index,token,last 
    
   !/ */
LexerPos.prototype.dummy = function () {
  null;
}

/* ---------------------------------------------------------------------------------------------- 
   The Lexer Class 
   =============== 
   The Lexer class turns the input lines into an array of "infoLines" 
   forward declare 
   /! 
    
   declare on Lexer 
   nextSourceLine 
   parseTripleQuotes,checkMultilineComment 
   getPos,nextToken 
   sayErr 
   nextCODELine 
   parseTripleQuotes 
    
   !/ */
function Lexer() {
  /* Default string interpolation char */
  this.stringInterpolationChar = '#';
  /* lexer-global vars */
  this.hardError = null;
  /* empty Token */
  this.token = new Token();
}

/* /! 
    
   properties 
   filename:string 
   lines:string array 
   infoLines: InfoLine array 
   sourceLineNum 
   lineInx 
   line:String 
   infoLine, token, last:LexerPos 
   indent, index 
    
   stringInterpolationChar = "#" 
   hardError 
   inNode 
    
    
   !/ 
   Lexer initialize: 
   ================= */

/* end constructor 
   ---------- */
Lexer.prototype.initSource = function (filename, source) {
  /* remember filename (for error reporting) */
  this.filename = filename;
  /* create source lines array */
  if (source instanceof Array) {
    this.lines = source;
  } else {
    /* If code is passed as a buffer, convert it to string 
       then to lines array */
    if (typeof source !== 'string') {
      source = source.toString();
    }
    this.lines = source.split('\n');
  }
}

/* ---------- 
   Lexer Process: 
   ============== 
   *Create infoLines[] array 
   *Tokenize CODE lines */
Lexer.prototype.process = function () {
  var titleKeyRegexp, lastLineWasBlank, line, indent, type, codeBlock, found, infoLine, item, ki$2, kobj$2;
  /* prepare processed lines result array */
  this.infoLines = [];
  /* Regexp to match class/method markdown titles, and consider them CODE */
  titleKeyRegexp = /^(#)+ *(?:(?:public|helper|namespace)\s*)*(class|append to|function|method|constructor|properties)\b/i;
  /* Loop processing source code lines */
  lastLineWasBlank = true;
  this.sourceLineNum = 0;
  while (this.nextSourceLine()) {
    /* get line indent, count whitespace: (index of first non-whitespace: \S ) 
       then trim() the line */
    line = this.line;
    indent = line.search(/\S/);
    line = line.trim();
    /* LiteScript files (.lite.md) are "literate" markdown and code files. 
       To be considered "code", a block of lines must be indented at least four spaces. 
       (see: Github Flavored MarkDown syntax) 
       The exception are MARKDOWN TITLES (#,##,###...) starting with: `public|helper|namespace`,`class|function|constructor|method|properties` 
       this lines will be considered CODE. 
       Anything else starting on col 1, 2 or 3 is a literate comment, MD syntax. 
       If you start a literate comment, like this one, it will continues until a blank line is found, 
       that is, you need to leave a blank line before starting a indented block of code. 
       Now, process the lines with this rules */
    if (!(line)) {
      /* a blank line is always a blank line */
      type = LineTypes.BLANK;
    } else {
      /* else, if indented 4 spaces or more, can be the start of a code block */
      if (indent >= 4) {
        if (lastLineWasBlank) {
          codeBlock = true;
        }
      } else {
        /* else, (not indented) probably a literate comment */
        codeBlock = false;
        /* except for title keywords */
        if (indent === 0) {
          /* ...on column 1 */
          found = titleKeyRegexp.exec(line);
          if (found) { /* 0:full match 1:markdown#s 2:found keyword */
            /* rewrite the line, replacing 'title' MD (###) by spaces and making keywords lowercase */
            line = found[0].replace(/#/g, " ").toLowerCase() + line.slice(found[0].length);
            indent = line.search(/\S/);
            if (indent < 4) {
              this.throwErr(("" + (this.filename) + ":" + (this.sourceLineNum) + ":" + indent + " MD Title-keyword, expected at least indent 4 ('### ' or '#### ')"));
            }
            codeBlock = true;
          }
        }
      }
      /* end if - special kws 
         end if - line, check indent 
         After rules: if we're in a codeBlock, is CODE, else is a COMMENT */
      if (codeBlock) {
        if (line.startsWith("#") || line.startsWith("//")) { /* code, but all comment */
          type = LineTypes.COMMENT;
        } else {
          type = LineTypes.CODE;
        }
      } else {
        type = LineTypes.COMMENT;
      }
    }
    /* end if 
       end if line wasnt blank 
       parse multi-line string (triple quotes) and convert to one logical line: 
       Example: var a = 'first line\nsecond line\nThat\'s all\n' */
    if (type === LineTypes.CODE) {
      line = this.parseTripleQuotes(line);
    }
    /* check for multi-line comment, C and js style ** .... ** */
    if (this.checkMultilineComment(type, indent, line)) {
      continue; /* found and pushed multiline comment, continue with next line */
    }
    /* Create infoLine, with computed indent, text, and source code line num reference */
    infoLine = new InfoLine(this, type, indent, line, this.sourceLineNum);
    infoLine.dump(); /* debug */
    this.infoLines.push(infoLine);
    lastLineWasBlank = type === LineTypes.BLANK;
  }
  /* end loop, process next source line 
     Now, after processing all lines, we tokenize each CODE line */
  debug("---- TOKENIZE");
  kobj$2 = this.infoLines;
  for (ki$2 = 0; ki$2 < kobj$2.length; ki$2++) {
    item = kobj$2[ki$2];
    item.dump(); /* debug */
    if (item.type === LineTypes.CODE) {
      item.tokenize(this);
    }
  }
  /* end if 
     end loop code lines 
     now we have a infoLine array, tokenized, ready to be parsed 
     clear source lines from memory */
  this.lines = undefined;
  /* reset Lexer position, to allow the parser to start reading tokens */
  this.lineInx = -1;
  this.infoLine = null; /* current infoLine */
  this.index = -1; /* token index */
  this.last = this.getPos(); /* last position */
  /* read first token */
  this.nextToken();
}

/* end Lexer process 
   Next Source Line 
   ---------------- */
Lexer.prototype.nextSourceLine = function () {
  if (this.sourceLineNum >= this.lines.length) {
    return false;
  }
  /* get source line, replace TAB with 4 spaces, remove trailing withespace and remove CR */
  this.line = this.lines[this.sourceLineNum].replace(/\t/g, '    ').replace(/\s+$/, '').replace(/\r/, '');
  this.sourceLineNum += 1; /* 1-based */
  return true;
}

/* Multiline strings 
   ----------------- 
   ---------------------------- 
   This is the generic method to get a section of text between start and end codes */
Lexer.prototype.getMultilineSection = function (line, startCode, endCode) {
  var startCol, section, startSourceLine, pre, endCol, post;
  /* check startCode for multiline, if not found, exit */
  startCol = line.indexOf(startCode);
  if (startCol < 0) {
    /* no start code found */
    return null;
  }
  /* get rid of quoted strings. Still there? */
  if (String.replaceQuoted(line, "").indexOf(startCode) < 0) {
    return null; /* no */
  }
  /* found startCode, initialize */
  debug("**** START MULTILINE ", startCode);
  section = [];
  startSourceLine = this.sourceLineNum;
  /* Get and save text previous to startCode */
  pre = line.slice(0, startCol).trim();
  /* Get text after startCode */
  line = line.slice(startCol + startCode.length).trim();
  /* read lines looking for endCode */
  while (true) {
    endCol = line.indexOf(endCode);
    if (endCol >= 0) { /* found end of section */
      break;
    }
    /* still inside the section */
    section.push(line);
    if (!(this.nextSourceLine())) {
      this.sayErr(("EOF while processing multiline " + startCode + " (started on " + (this.filename) + ":" + startSourceLine + ":" + startCol + ")"));
      return;
    }
    line = this.line;
  }
  /* loop until end of section 
     get text after endCode (post) */
  post = line.slice(endCol + endCode.length);
  /* text before endCode, goes into multiline section */
  line = line.slice(0, endCol);
  if (line) {
    section.push(line);
  }
  return {pre: pre, section: section, post: post, postIndent: endCol + endCode.length};
}

/* ---------------------------------------- 
   This method handles `"""` triple quotes multiline strings 
   Mulitple coded-enclosed source lines are converted to one logical infoLine 
   Example: 
   ** 
   var c = """ 
   first line 
   second line 
   That's all 
   """.length 
    
   gets converted to: 
   <pre> 
   var c = 'first line\nsecond line\nThat\'s all\n'.length 
   ^^^^^^^   ^^^^^^^                               ^^^^^ 
   pre     section                                post 
   </pre> 
   ** */
Lexer.prototype.parseTripleQuotes = function (line) {
  var result, sectionLine, inx, ki$3, kobj$3;
  result = this.getMultilineSection(line, '"""', '"""');
  /* /! 
      
     declare on result 
     pre:string, section:string array, post:string 
      
     !/ */
  if (result) {
    /* discard first and last, if empty */
    if (!((result.section[0].trim()))) {
      result.section.shift();
    }
    if (!((result.section[result.section.length - 1].trim()))) {
      result.section.pop();
    }
    /* trim lines */
    kobj$3 = result.section;
    for (ki$3 = 0; ki$3 < kobj$3.length; ki$3++) {
      sectionLine = kobj$3[ki$3];
      inx = ki$3;
      result.section[inx] = sectionLine.trim();
    }
    line = result.section.join("\\n"); /* join with (encoded) newline char */
    line = line.replace(/'/g, "\\'"); /* escape quotes */
    line = result.pre + " " + line.quoted("'") + result.post; /* add pre & post */
  }
  return line;
}

/* end parse triple quotes 
   ---------------------------- 
   This method handles multiline comments: `**` `**` */
Lexer.prototype.checkMultilineComment = function (lineType, startLineIndent, line) {
  var startSourceLine, result, sectionLine, inx, ki$4, kobj$4;
  startSourceLine = this.sourceLineNum;
  result = this.getMultilineSection(line, '/*', '*/');
  /* /! 
      
     declare on result 
     pre:string, section:string array, post:string 
      
     !/ */
  if (!(result)) {
    return false;
  }
  if (result.section.length === 1) { /* just one line */
    line = result.pre + " // " + result.section[0] + result.post;
    this.infoLines.push(new InfoLine(this, lineType, startLineIndent, line, startSourceLine));
  } else {
    if (result.pre) {
      this.infoLines.push(new InfoLine(this, lineType, startLineIndent, result.pre, startSourceLine));
    }
    kobj$4 = result.section;
    for (ki$4 = 0; ki$4 < kobj$4.length; ki$4++) {
      sectionLine = kobj$4[ki$4];
      inx = ki$4;
      this.infoLines.push(new InfoLine(this, LineTypes.COMMENT, 0, sectionLine, startSourceLine + inx));
    }
    if (result.post.trim()) {
      log.warning(("" + (this.filename) + ":" + (this.sourceLineNum) + ":1. Do not add text on the same line after `*/`. Indent is not clear"));
      this.infoLines.push(new InfoLine(this, LineTypes.CODE, result.postIndent, result.post, this.sourceLineNum));
    }
  }
  return true; /* OK, lines processed */
}

/* ---------------------------- 
   Methods getPos() and setPos() are used to save and restore a specific lexer position in code 
   When a AST node parse() fails, the lexer position is rewound to try another AST class */
Lexer.prototype.getPos = function () {
  return {lineInx: this.lineInx, index: this.index, sourceLineNum: this.sourceLineNum, token: this.token, last: this.last};
}

/* ---------------------------- */
Lexer.prototype.setPos = function (pos) {
  this.lineInx = pos.lineInx;
  if (this.lineInx >= 0 && this.lineInx < this.infoLines.length) {
    this.infoLine = this.infoLines[this.lineInx];
    this.indent = this.infoLine.indent;
  } else {
    this.infoLine = null;
    this.indent = 0;
  }
  this.index = pos.index;
  this.sourceLineNum = pos.sourceLineNum;
  this.token = pos.token;
  this.last = pos.last;
}

/* **helper method posToString()** 
   Create a full string with last position. Useful to inform errors */
Lexer.prototype.posToString = function () {
  var col;
  if (!(this.last)) {
    return;
  }
  if (!(this.last.token)) {
    this.last.token = {column: 0};
  }
  col = this.last.token.column || this.infoLine.indent;
  if (!(col) || col < 0) {
    col = 0;
  }
  return ("" + (this.filename) + ":" + (this.last.sourceLineNum) + ":" + col);
}

/* ---------------------------- 
   getPrevIndent() method returns the indent of the previous code line 
   is used in 'Parser.lite' when processing an indented block of code, 
   to validate the line indents and give meaningful compiler error messages */
Lexer.prototype.getPrevIndent = function () {
  var inx;
  inx = this.lineInx - 1;
  while (inx >= 0) {
    if (this.infoLines[inx].type === LineTypes.CODE) {
      return this.infoLines[inx].indent;
    }
    inx -= 1;
  }
  return 0;
}

/* ---------------------------------------------------- 
   This functions allows the parser to navigate lines and tokens 
   of the lexer. It returns the next token, advancing the position variables. 
   This method returns CODE tokens, "NEWLINE" tokens (on each new line) or the "EOF" token. 
   All other tokens (COMMENT and WHITESPACE) are discarded. */
Lexer.prototype.consumeToken = function () {
  /* loop until a CODE token is found */
  while (true) {
    /* loop until a valid CODE infoLine is selected */
    this.token = null;
    while (true) {
      /* if no line selected */
      if (!(this.infoLine)) {
        this.index = -1;
        /* get next CODE line */
        if (!(this.nextCODELine())) {
          /* if no more CODE lines -> EOF */
          this.infoLine = new InfoLine(this, LineTypes.CODE, -1, '', this.lineInx);
          this.token = new Token('EOF');
          this.infoLine.tokens = [this.token];
          this.indent = -1;
          return;
        }
        /* since we moved to the next line, return "NEWLINE" token */
        this.sourceLineNum = this.infoLine.sourceLineNum;
        this.indent = this.infoLine.indent;
        this.token = new Token('NEWLINE');
        return;
      }
      /* get next token in the line */
      if (!(this.infoLine.tokens)) {
        debugger;
      }
      this.index += 1;
      if (this.index < this.infoLine.tokens.length) {
        break; /* ok, a line with tokens */
      }
      /* if there was no more tokens, set infoLine to null, 
         and continue (get the next line) */
      this.infoLine = null;
    }
    /* end while 
       Here we have a infoLine, where type is CODE 
       Get the token */
    this.token = this.infoLine.tokens[this.index];
    /* if the token is a COMMENT, discard it, 
       by continuing the loop (get the next token) */
    if (this.token.type === 'COMMENT') {
      continue; /* discard COMMENT */
    } else {
      /* if it is not a COMMENT, break the loop 
         returning the CODE Token in lexer.token */
      break;
    }
  }
}

/* loop #try to get another 
   end method consumeToken 
   --------------------------------------------------------- */
Lexer.prototype.nextToken = function () {
  var tk;
  /* Save current pos, and get next token */
  this.last = this.getPos();
  if (this.insertedTokens && this.insertedTokens.length) {
    tk = this.insertedTokens.shift();
    this.token = new Token(tk.type, tk.value);
  } else {
    this.consumeToken();
  }
  /* debug */
  debug(">>>ADVANCE", this.sourceLineNum, this.index, this.token.toString());
  return true;
}

/* ----------------------------------------------------- */
Lexer.prototype.insertTokens = function (arr) {
  var tk;
  this.insertedTokens = arr;
  tk = arr.shift();
  this.token.type = tk.type;
  this.token.value = tk.value;
  debug(">>>INSERTED", arr);
}

/* ----------------------------------------------------- */
Lexer.prototype.returnToken = function () {
  /* restore last saved pos (rewind) */
  this.setPos(this.last);
  debug('<< Returned:', this.token.toString(), 'line', this.sourceLineNum);
}

/* ----------------------------------------------------- 
   This method gets the next line CODE from infoLines 
   BLANK and COMMENT lines are skipped. 
   return true if a CODE Line is found, false otherwise */
Lexer.prototype.nextCODELine = function () {
  if (this.lineInx >= this.infoLines.length) {
    return false; /* no more lines */
  }
  /* loop until a CODE line is found */
  while (true) {
    this.lineInx += 1;
    if (this.lineInx >= this.infoLines.length) {
      return false; /* no more lines */
    }
    /* Get line */
    this.infoLine = this.infoLines[this.lineInx];
    /* if it is a CODE line, store in lexer.sourceLineNum, and return true (ok) */
    if (this.infoLine.type === LineTypes.CODE) {
      this.sourceLineNum = this.infoLine.sourceLineNum;
      this.indent = this.infoLine.indent;
      this.index = -1;
      return true; /* ok nextCODEline found */
    }
  }
}

/* end while 
   end method 
   ----------------------------------------------------------------------- 
   **say** emit error (but continue compiling) */
Lexer.prototype.say = function () {
  log.error.apply(this, arguments);
}

/* end 
   ----------------------------------------------------------------------- 
   **throwErr** */
Lexer.prototype.throwErr = function (msg) {
  var err;
  err = new Error(msg);
  err.controled = true;
  throw err;
}

/* end 
   ----------------------------------------------------------------------- 
   **sayErr** add lexer position and emit error (but continue compiling) */
Lexer.prototype.sayErr = function (msg) {
  log.error(this.posToString(), msg);
  if (log.error.count > 10) {
    this.throwErr("10 errors, aborting compilation");
  }
}

/* end 
   **warn** add lexer position and emit warning (continue compiling) */
Lexer.prototype.warn = function (msg) {
  log.warning(this.posToString(), msg);
}

/* end 
   ------------------------ 
   Exports 
   ======= 
   make LineTypes const available as me.lexer.LineTypes */
Lexer.prototype.LineTypes = LineTypes;
Lexer.prototype.Token = Token;
Lexer.prototype.InfoLine = InfoLine;
module.exports = Lexer;
