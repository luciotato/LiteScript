(function () {
  var token_types, parse_token;

  /* The Kal Lexer
     -------------

     This file is responsible for translating raw code (a long string) into an array of tokens that can be more easily parsed by the parser.

     Tokens
     ======

     **Comments** are tokens that are not part of the code. These are returned seperately from the token array with line markers to indicate where they belong. Comments can be single line, starting with a `#` and ending at the end of a line. They do not need to be the first thing on the line (for example `x = 1 #comment` is valid). Comments can also be multiline, starting with a `###` and ending with either a `###` or end-of-file.
      */
  token_types = [[/^###([^#][\s\S]*?)(?:###[^\n\S]*|(?:###)?$)|^(?:[^\n\S]*#(?!##[^#]).*)+/, 'COMMENT']
  , [/^(\/(?![\s=])[^[\/\n\\]*(?:(?:\\[\s\S]|\[[^\]\n\\]*(?:\\[\s\S][^\]\n\\]*)*])[^[\/\n\\]*)*\/)([imgy]{0,4})(?!\w)/, 'REGEX']
  , [/^0x[a-f0-9]+/i, 'NUMBER']
  , [/^[0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?/i, 'NUMBER']
  , [/^'''(?:[^'\\]|\\.)*'''/, 'BLOCKSTRING']
  , [/^"""(?:[^"\\]|\\.)*"""/, 'BLOCKSTRING']
  , [/^'(?:[^'\\]|\\.)*'/, 'STRING']
  , [/^"(?:[^"\\]|\\.)*"/, 'STRING']
  , [/^[$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*/, 'IDENTIFIER']
  , [/^\n([\f\r\t\v\u00A0\u2028\u2029 ]*\n)*\r*/, 'NEWLINE']
  , [/^[\f\r\t\v\u00A0\u2028\u2029 ]+/, 'WHITESPACE']
  , [/^\\[\f\r\t\v\u00A0\u2028\u2029 ]*\n[\f\r\t\v\u00A0\u2028\u2029 ]*/, 'WHITESPACE']
  , [/^[\<\>\!\=]\=/, 'LITERAL'], [/^[\+\-\*\/\^\=\.><\(\)\[\]\,\.\{\}\:\?]/, 'LITERAL']];
  
  /*
     ***Regex** tokens are regular expressions. Kal does not do much with the regex contents at this time. It just passes the raw regex through to JavaScript.


     Numbers can be either in hex format (like `0xa5b`) or decimal/scientific format (`10`, `3.14159`, or `10.02e23`). There is no distinction between floating point and integer numbers.


     Block strings are multilne strings with triple quotes that preserve indentation.


     Strings can be either single or double quoted.


     Identifiers (generally variable names), must start with a letter, `$`, or underscore. Subsequent characters can also be numbers. Unicode characters are supported in variable names.


     A newline is used to demark the end of a statement. Whitespace without other content between newlines is ignored. Multiple newlines in a row generate just one token.


     Whitespace is ignored by the parser (and thrown out by the lexer), but needs to exist to break up other tokens. We also include the line continuation character, a backslash followed by one newline and some whitespace.


     A literal is a symbol (like `=` or `+`) used as an operator. Some literals like `+=` can be two characters


     Token Values
     ============

     Token objects also contain semantic values that are used during parsing. For example, `+ =` and `+=` are both equivalent to `+=`. This object maps tokens types to a function that returns their semantic value.
      */
  parse_token = {NUMBER: function (text) {
    /*
       `NUMBER` tokens are represented by their numeric value. This is used in constant folding in some cases.
        */
    return Number(text);
  }, STRING: function (text) {
    /*
       `STRING` tokens need any newlines removed to support JavaScript syntax.
        */
    return text.replace(/\r?\n\r?/g, '');
  }, BLOCKSTRING: function (text) {
    var rv, first_indent, indent_length;
    /*
       `BLOCKSTRING` tokens need newlines and indentation replaced. We also need to replace the multi-quotes with a single quote.


       Collapse triple quotes to single. Remove the first/last newline right next to the enclosing quotes.
        */
    rv = text;
    rv = rv.replace(/^'''(\r?\n)?|(\r?\n)?\s*'''$/g, "'");
    rv = rv.replace(/^"""(\r?\n)?|(\r?\n)?\s*"""$/g, '"');
    /*
       Figure out the indent level of the first line after the triple quote.
        */
    first_indent = rv.match(/^['"]\s*/)[0];
    indent_length = first_indent.match(/['"]\s*/)[0].length - 1;
    /*
       Replace leading spaces on all subsequent lines.
        */
    rv = rv.replace(new RegExp(("\\n\\s{" + indent_length + "}"), 'g'), "\n");
    rv = rv.replace(new RegExp(("^\"\\s{" + indent_length + "}")), '"');
    rv = rv.replace(new RegExp(("^'\\s{" + indent_length + "}")), "'");
    /*
       Escape newlines.
        */
    rv = rv.replace(/\r?\n\r?/g, '\\n');
    /*
       Remove first line whitespace.
        */
    return rv;
  }, IDENTIFIER: function (text) {
    /*
       `IDENTIFIER` tokens are just the same as their content.
        */
    return text;
  }, NEWLINE: function (text) {
    /*
       `NEWLINE` tokens have only one possible semantic value, so they are just set to empty to make printouts with `showTokens` cleaner.
        */
    return '';
  }, WHITESPACE: function (text) {
    /*
       `WHITESPACE` tokens all have the same semantic value, so they are just replaced with a single space.
        */
    return ' ';
  }, COMMENT: function (text) {
    var rv;
    /*
       `COMMENT` tokens are trimmed and have their `#`s removed. Any JavaScript comment markers are also escaped here.
        */
    rv = text.trim();
    rv = rv.replace(/^#*\s*|#*$/g, "");
    rv = rv.replace(/\n[\f\r\t\v\u00A0\u2028\u2029 ]*#*[\f\r\t\v\u00A0\u2028\u2029 ]*/g, '\n * ');
    return rv.replace(/(\/\*)|(\*\/)/g, '**');
  }, LITERAL: function (text) {
    /*
       `LITERAL` tokens have their spaces removed as noted above.
        */
    return text.replace(/[\f\r\t\v\u00A0\u2028\u2029 ]/, '');
  }, REGEX: function (text) {
    /*
       `REGEX` tokens just pass through.
        */
    return text;
  }};

  /*
     The Lexer Class
     ===============

     This class is initialized with a code string. It's `tokens` and `comments` members are then populated using the `tokenize` method (called automatically during initialization).
      */
  function Lexer(code, line_number) {
    if (line_number == null) line_number = 1;
    this.code = code;
    this.line = line_number;
    this.indent = 0;
    this.indents = [];
    this.tokenize();
  }

  /*
     The `line_number` argument is optional and allows you to specify a line offset to start on.
      */

  /*  */
  Lexer.prototype.tokenize = function () {
    var last_token_type, last_token_text, index, chunk, tt, regex, type, text, ki$1, kobj$1, code, context_len, val, comment_token;
    this.tokens = [];
    this.comments = [];
    last_token_type = null;
    last_token_text = null;
    index = 0;
    /*
       This loop will try each regular expression in `token_types` against the current head of the code string until one matches.
        */
    while (index < this.code.length) {
      chunk = this.code.slice(index);
      kobj$1 = token_types;
      for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
        tt = kobj$1[ki$1];
        regex = tt[0];
        type = tt[1];
        text = ((regex.exec(chunk) != null) ? regex.exec(chunk)[0] : void 0);
        if ((text != null)) {
          this.type = type;
          break;
        }
      }
      /*
         If there was no match, this is a bad token and we will abort compilation here. We only report up to the first 16 characters of the token in case it is very long.
          */
      if ((text == null)) {
        code = this.code.toString().trim();
        context_len = (code.length >= 46) ? 46 : code.length;
        if ((text == null)) {
          throw ("invalid token '" + (code.slice(index, index + context_len)) + "...' on line " + (this.line));
        }
      }
      /*
         Parse the semantic value of the token.
          */

      if (this.type==='IDENTIFIER' && text==='no' && last_token_text==='if') text='not';

      val = parse_token[this.type](text);
      /*
         If we previously saw a `NEWLINE`, we check to see if the current indent level has changed. If so, we generate `INDENT` or `DEDENT` tokens as appropriate in the `handleIndentation` method. `COMMENT`-only lines are ignored since we want to allow arbitrary indentation on non-code lines.
          */
      if (last_token_type === 'NEWLINE' && type !== 'COMMENT') {
        this.handleIndentation(type, text);
      }
      /*
         For comments, we create a special comment token and put it in `me.comments`. We mark if it is postfix (after code on a line) or prefix (alone before a line of code). This will matter when we generate JavaScript code and try to place these tokens back as JavaScript comments. Multiline comments are also marked for this same reason.
          */
      if (type === 'COMMENT') {
        comment_token = {text: text, line: this.line, value: val, type: type};
        if (last_token_type === 'NEWLINE' || (last_token_type == null)) {
          comment_token.post_fix = false;
        } else {
          comment_token.post_fix = true;
        }
        if (val.match(/\n/)) {
          comment_token.multiline = true;
        } else {
          comment_token.multiline = false;
        }
        this.comments.push(comment_token);
      } else {
        /*
           For non-comment tokens, we generally just add the token to `me.tokens`. We will skip `NEWLINE` tokens if it would cause multiple `NEWLINE`s in a row.

           The `soft` attribute indicates that the token was separated from the previous token by whitespace. This is used by the `sugar` module in some cases to determine whether this is a function call or not. For example `my_function () ->` could mean `my_function()(->)` or `my_function(->)`. Marking whether or not there was whitespace allows us to translate `my_function () ->` differently from `my_function() ->`.
            */
        if (!(type === 'NEWLINE' && ((this.tokens[this.tokens.length - 1] != null) ? this.tokens[this.tokens.length - 1].type : void 0) === 'NEWLINE')) {
          this.tokens.push({text: text, line: this.line, value: val, type: type, soft: last_token_type === 'WHITESPACE'});
        }
      }
      /*
         Update our current index and the line number we are looking at. Line numbers are used for source maps and error messages.
          */
      index += text.length;
      this.line += ((text.match(/\n/g) != null) ? text.match(/\n/g).length : void 0) || 0;
      last_token_type = type;
      if (text.trim().length) last_token_text = text;
      //console.log('last_token_text',last_token_text)
    }
    /*
       Add a trailing newline in case the user didn't. The parser needs this in some cases.
        */
    this.tokens.push({text: '\n', line: this.line, value: '', type: 'NEWLINE'});
    /*
       Clear up any remaining indents at the end of the file.
        */
    this.handleIndentation('NEWLINE', '');
    /*
       Remove the newline we added if it wasn't needed.
        */
    (this.tokens[this.tokens.length - 1].type === 'NEWLINE') ? this.tokens.pop() : void 0;
  }

  /*
     The `handleIndentation` method adds `INDENT` and `DEDENT` tokens as necessary.
      */
  Lexer.prototype.handleIndentation = function (type, text) {
    var indentation;
    /*
       Get the current line's indentation.
        */
    indentation = (type === 'WHITESPACE') ? text.length : 0;
    /*
       If indentation has changed, push tokens as appropriate. Note that we treat multiple indents (multiples of two spaces) as a single indent/dedent pair. We keep track of the indentation level of each indent separately in the `me.indents` array in case the code is inconsistent.
        */
    if (indentation > this.indent) {
      this.indents.push(this.indent);
      this.indent = indentation;
      this.tokens.push({text: text, line: this.line, value: '', type: 'INDENT'});
    } else if (indentation < this.indent) {
      /*
         We allow for multiple dedents on a single line by looping until indentation matches.
          */
      while (this.indents.length > 0 && indentation < this.indent) {
        this.indent = this.indents.pop();
        if (indentation > this.indent) {
          throw 'indentation is misaligned on line ' + this.line;
        }
        this.tokens.push({text: text, line: this.line, value: '', type: 'DEDENT'});
      }
      /*
         A misalignment is not parseable so we throw an error.
          */
      if (indentation !== this.indent) {
        throw 'indentation is misaligned';
      }
    }
  }

  /*
     The Tokenizer
     =============

     This function is the entry point for the compiler. It parses a code string using the lexer and returns the tokens and comments separately.
      */
  function tokenize(code) {
    var lex;
    lex = new Lexer(code);
    return [lex.tokens, lex.comments];
  }

  exports.tokenize = tokenize;
})()