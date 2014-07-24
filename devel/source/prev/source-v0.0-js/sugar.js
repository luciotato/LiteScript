(function () {
  var grammar, KEYWORDS, RVALUE_OK, NOPAREN_WORDS;
  var k$indexof = [].indexOf || function (item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
  /* Kal Sugar 
     ========= 
      
     This module applies a couple of "syntactic sugar" pre-processing steps to Kal code before it goes to the compiler. These steps would be onerous to do during the parsing stage, but are generally easier to do on a token stream. Each function in this module takes an input token stream and returns a new, possibly modified one. 
      
     Some sugar functions use the keyword list from the grammar, most notable the implicit parentheses for function calls. 
      
      */
  grammar = require('./grammar');
  KEYWORDS = grammar.KEYWORDS;
  RVALUE_OK = grammar.RVALUE_OK;

  /*  
     The entry point for this module is the `translate_sugar` function, which takes an input token stream and returns a modified token stream for use with the parser. It also takes an optional `options` parameter which may contain the following properties: 
      
     * **show_tokens** - if true, this module will print the input token stream to the console. This is useful for debugging the compiler 
      
     The function also takes a `tokenizer` argument which is a function that given a code string, returns an array with the first element being a token array and the second a comment token array. The Kal compiler uses the `tokenize` funtion in the `lexer` module for this argument. `tokenizer`, if present, is used to tokenize code embedded in double-quoted strings. If this argument is missing, double-quoted strings with embedded code blocks will be left as strings. 
      */
  function translate_sugar(tokens, options, tokenizer) {
    var out_tokens, debug, t, ki$1, kobj$1;
    /*  
       The current sugar stages are: 
        
       1. **code\_in\_strings** - for double-quoted strings with embedded code blocks (`"1 + 1 = #{1 + 1}"`), this function tokenizes the code blocks and converts the string to the equivalent of `"1 + 1 = " + (1 + 1)`. 
       2. **clean** - removes whitespace 
       3. **multiline\_statements** - removes line breaks after commas on long statements 
       4. **multiline\_lists** - this function collapses list definitions that span muliple lines into a single line, though the tokens do still retain their original line numbers. 
       5. **no\_paren\_function\_calls** - adds parentheses around implicit function calls like `my_function 1, 2`. 
       6. **print\_statement** - converts calls to `print` to `console.log` 
       7. **coffee\_style\_functions** - converts functions with CoffeeScript syntax (`(a,b) -> return a + b`) to standard Kal function syntax. 
        
       The output is a new token stream (array). 
        */
    out_tokens = coffee_style_functions(print_statement(noparen_function_calls(multiline_statements(multiline_lists(clean(code_in_strings(tokens, tokenizer)))))));
    /*  
       Debug printing of the token stream is enabled with the `show_tokens` option. 
        */
    if (((options != null) ? options.show_tokens : void 0)) {
      debug = [];
      kobj$1 = out_tokens;
      for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
        t = kobj$1[ki$1];
        if (t.type === 'NEWLINE') {
          debug.push('\n');
        } else {
          debug.push(t.value || t.type);
        }
      }
      console.log(debug.join(' '));
    }
    return out_tokens;
  }

  exports.translate_sugar = translate_sugar;

  /*  
     Code In Strings 
     =============== 
      
     This function allows support for double-quoted strings with embedded code, like: "x is #{x}". It uses the `tokenizer` argument (a function that converts a code string into a token array, like `lexer.tokenize`)  to run the code blocks in the string through the lexer. The return value is the merged stream of tokens. 
      */
  function code_in_strings(tokens, tokenizer) {
    var out_tokens, token, rv, r, m, add_parens, new_token_text, new_tokens, ki$2, kobj$2;
    /*  
       We abort if there is no `tokenizer` provided and just don't translate the strings. 
        */
    if ((tokenizer == null)) {
      return tokens;
    }
    /*  
       The output is a new token array (we don't modify the original). 
        */
    out_tokens = [];
    kobj$2 = tokens;
    for (ki$2 = 0; ki$2 < kobj$2.length; ki$2++) {
      token = kobj$2[ki$2];
      /*  
         For double-quoted strings, we search for code blocks like `"#{code}"`. The regex uses the non-greedy operator to avoid parsing `"#{block1} #{block2}"` as a single block. 
          */
      if ((k$indexof.call(['STRING', 'BLOCKSTRING'], token.type) >= 0) && token.value[0] === '"') {
        rv = token.value;
        r = /#{.*?}/g;
        m = r.exec(rv);
        /*  
           We generally must add parentheses around any string that gets broken up for code blocks (and it is always safe to do so). `soft` indicates that this was added by the `sugar` module, not the user. It's passed forward to no-paren function calls. 
            */
        add_parens = (m) ? true : false;
        (add_parens) ? out_tokens.push({text: '(', line: token.line, value: '(', type: 'LITERAL', soft: true}) : void 0;
        /*  
           For each code block match, we first add a string token to the stream for all the constant text before the block start, then a `+`. 
            */
        while (m) {
          new_token_text = rv.slice(0, m.index) + '"';
          out_tokens.push({text: new_token_text, line: token.line, value: new_token_text, type: 'STRING'});
          out_tokens.push({text: '+', line: token.line, value: '+', type: 'LITERAL'});
          /*  
             Next we add the parsed version of the code block (a token array) generated by running the code through the lexer. If there is more than one token, this also needs to be in parentheses. 
              */
          new_tokens = tokenizer(rv.slice(m.index + 2, m.index + m[0].length - 1))[0];
          (new_tokens.length !== 1) ? out_tokens.push({text: '(', line: token.line, value: '(', type: 'LITERAL'}) : void 0;
          out_tokens = out_tokens.concat(new_tokens);
          (new_tokens.length !== 1) ? out_tokens.push({text: ')', line: token.line, value: ')', type: 'LITERAL'}) : void 0;
          /*  
             Next we make a string out of any remaining text after the block in case this is the last match. If the loop exits here, it gets added to the token stream, otherwise we ignore it since the next iteration will take care of it. If the string is the empty string, we set it to blank since we don't want things like `"a is #{a}"` turning into `("a is " + a + "")` for asthetic reasons. 
              */
          rv = '"' + rv.slice(m.index + m[0].length);
          if (rv === '""') {
            rv = '';
          } else {
            out_tokens.push({text: '+', line: token.line, value: '+', type: 'LITERAL'});
          }
          /*  
             Find the next code block if there is one. 
              */
          r = /#{.*?}/g;
          m = r.exec(rv);
        }
        /*  
           If there wasn't a next code block, add the remaining string (if any) and close paren. 
            */
        (rv !== '') ? out_tokens.push({text: rv, line: token.line, value: rv, type: 'STRING'}) : void 0;
        (add_parens) ? out_tokens.push({text: ')', line: token.line, value: ')', type: 'LITERAL', soft: true}) : void 0;
      } else {
        /*  
           For anything other than a double-quoted string, just pass it through. 
            */
        out_tokens.push(token);
      }
    }
    return out_tokens;
  }

  /*  
     Clean 
     ===== 
      
     Removes whitespace. It marks tokens that were followed by whitespace so that the later stages can detect the difference between things like `my_function(a) ->` and `my_function (a) ->`. 
      */
  function clean(tokens) {
    var out_tokens, token, ki$3, kobj$3;
    out_tokens = [];
    kobj$3 = tokens;
    for (ki$3 = 0; ki$3 < kobj$3.length; ki$3++) {
      token = kobj$3[ki$3];
      if (token.type !== 'WHITESPACE') {
        out_tokens.push(token);
      } else if (out_tokens.length > 0) {
        out_tokens[out_tokens.length - 1].trailed_by_white = true;
      }
    }
    return out_tokens;
  }

  /*  
     Multiline Statements 
     ==================== 
      
     This function removes newlines and indentation after commas, allowing long lines of code to be broken up into multiple lines. Token line numbers are preserved for error reporting. 
      */
  function multiline_statements(tokens) {
    var out_tokens, last_token, continue_line, reduce_dedent, token, skip_token, ki$4, kobj$4;
    out_tokens = [];
    last_token = null;
    /*  
       We keep track of whether or not we are on a continued line and how many indents we ignored. 
        */
    continue_line = false;
    reduce_dedent = 0;
    /*  */
    kobj$4 = tokens;
    for (ki$4 = 0; ki$4 < kobj$4.length; ki$4++) {
      token = kobj$4[ki$4];
      skip_token = false;
      /*  
         If we see a newline after a comma, remove it from the stream and mark that we are in line continuation mode. 
          */
      if ((k$indexof.call([','], ((last_token != null) ? last_token.value : void 0)) >= 0) && token.type === 'NEWLINE') {
        continue_line = true;
        skip_token = true;
      } else if (continue_line) {
        /*  
           In line continuation mode, ignore indents and dedents, but keep track of them. We exit line continuation mode when we see a `DEDENT` that brings back to even with the original line. 
            */
        if (token.type === 'INDENT') {
          skip_token = true;
          reduce_dedent += 1;
        } else if (token.type === 'NEWLINE') {
          skip_token = true;
        }
         else if (token.type === 'DEDENT') {
          if (reduce_dedent > 0) {
            reduce_dedent -= 1;
            skip_token = true;
            if (reduce_dedent === 0) {
              out_tokens.push({text: '\n', line: token.line, value: '', type: 'NEWLINE'});
            }
          } else {
            /*  
               When exiting line continuation mode, we have to add back in the last `NEWLINE`. 
                */
            out_tokens.push(last_token);
          }
        }
      }
      /*  
         Add the token to the new stream unless we decided to skip it. 
          */
      (!(skip_token)) ? out_tokens.push(token) : void 0;
      last_token = token;
    }
    return out_tokens;
  }

  /*  
     No-Paren Function Calls 
     ======================= 
      
     This stage converts implicit function calls (`my_function a, b`) to explicit ones (`my_function(a,b)`). `NOPAREN_WORDS` specify keywords that should not be considered as a first argument to a function call. For example, we don't want `x is a` to turn into `x(is(a))`, but we do want `x y z` to become `x(y(z))`. 
      
      */
  NOPAREN_WORDS = ['is', 'otherwise', 'except', 'else', 'doesnt', 'exist', 'exists', 'isnt', 'inherits', 'from', 'and', 'or', 'xor', 'in', 'when', 'instanceof', 'of', 'nor', 'if', 'unless', 'except', 'for', 'with', 'wait', 'task', 'fail', 'parallel', 'series', 'safe', 'but', 'bitwise', 'mod', 'second', 'seconds', 'while', 'until', 'at', 'to'];
  /*  */

  function noparen_function_calls(tokens) {
    var out_tokens, triggers, enclosure_depth, indentation, declaring_function, token, i, last_token, last_last_token, next_token, add_auto_paren, acceptable_literal, trigger, ki$5, kobj$5;
    out_tokens = [];
    triggers = [];
    enclosure_depth = 0;
    indentation = 0;
    declaring_function = false;

    /*  
        
       The `closeout` helper will push as many dangling `)`s as necessary to the stream when a closeout trigger is reached. 
        */
    function closeout() {
      var trigger;
      trigger = triggers[triggers.length - 1];
      while (((trigger != null) ? trigger.indentation : void 0) === indentation && ((trigger != null) ? trigger.enclosure_depth : void 0) >= enclosure_depth) {
        out_tokens.push({text: ')', line: token.line, value: ')', type: 'LITERAL'});
        triggers.pop();
        trigger = triggers[triggers.length - 1];
      }
    }

    /*  */
    kobj$5 = tokens;
    for (ki$5 = 0; ki$5 < kobj$5.length; ki$5++) {
      token = kobj$5[ki$5];
      i = ki$5;
      last_token = tokens[i - 1];
      last_last_token = tokens[i - 2];
      next_token = tokens[i + 1];
      add_auto_paren = true;
      /*  
         If the last token was a keyword, we normally can't add implicit parens (ex: `for x`). However, we do need to account for the following cases: 
          
         * Two tokens ago was a `.` (like `x.for a`) 
         * The last token is a keyword but it is a valid r-value (`me x`). 
          
         If these conditions are not all met, we can't use implicit parentheses here. 
          */
      if ((k$indexof.call(KEYWORDS, ((last_token != null) ? last_token.value : void 0)) >= 0)) {
        if (!(((last_last_token != null) ? last_last_token.value : void 0) === '.' || (k$indexof.call(RVALUE_OK, ((last_token != null) ? last_token.value : void 0)) >= 0))) {
          add_auto_paren = false;
        }
      }
      /*  
         Next, we verify that the previous token was callable. This is only true if the token was an `IDENTIFIER` (not reserved), a `]` (like `x["func"] a`), or a `)` (like `get_func(1) 1`). Don't auto-paren things like `) ->` since they are Coffee-Style functions. 
          */
      if (((last_token != null) ? last_token.type : void 0) !== 'IDENTIFIER') {
        if (!((k$indexof.call([']', ')'], ((last_token != null) ? last_token.value : void 0)) >= 0))) {
          add_auto_paren = false;
        }
        if (((last_token != null) ? last_token.value : void 0) === ')' && token.value === '-' && ((next_token != null) ? next_token.value : void 0) === '>') {
          add_auto_paren = false;
        }
      }
      /*  
         Check that the current token isn't a no-paren word (make sure we are not looking at something like `x for`). 
          */
      if ((k$indexof.call(NOPAREN_WORDS, token.value) >= 0)) {
        add_auto_paren = false;
      }
      /*  
         Check that the current token is not a literal (don't want `my_function * 2` to become `my_function(* 2)`). There are some exceptions for callable literals, for things like `f {x:1}`, `f [1]`, and `->`. Also, parens with whitespace are allowed. For example, `my_func (3+2), 1` should get implicit parens. 
          */
      if (token.type === 'LITERAL') {
        acceptable_literal = false;
        if (token.value === '{') {
          acceptable_literal = true;
        }
        if ((k$indexof.call(['[', '('], token.value) >= 0) && ((last_token != null) ? last_token.trailed_by_white : void 0)) {
          acceptable_literal = true;
        }
        if (token.value === '-' && ((next_token != null) ? next_token.value : void 0) === '>') {
          acceptable_literal = true;
        }
        if (!(acceptable_literal)) {
          add_auto_paren = false;
        }
      }
      /*  
         We also handle the special case of a function definition with a space between the function name and the argument list. We need to consider the case of something like `x.function a b` which should turn into `x.function(a(b))` 
          */
      if ((k$indexof.call(['function', 'task', 'method', 'class'], ((last_token != null) ? last_token.value : void 0)) >= 0) && ((last_last_token != null) ? last_last_token.value : void 0) !== '.') {
        declaring_function = true;
      }
      if (((last_last_token != null) ? last_last_token.value : void 0) === '-' && ((last_token != null) ? last_token.value : void 0) === '>') {
        declaring_function = true;
      }
      if (declaring_function) {
        add_auto_paren = false;
      }
      /*  
         Check if a parenthesis is `soft`, meaning added by the sugar and not the user. 
          */
      if (token.value === '(' && !(token.soft)) {
        add_auto_paren = false;
      }
      /*  
         Don't want to add parentheses around `bitwise left` or `bitwise right`, but we also really don't want `left` and `right` to be no-paren words, otherwise `x left` would not translate to `x(left)`. These are really useful words, so we handle them in this special case to avoid this issue. 
          */
      if ((k$indexof.call(['left', 'right'], ((last_token != null) ? last_token.value : void 0)) >= 0) && ((last_last_token != null) ? last_last_token.value : void 0) === 'bitwise') {
        add_auto_paren = false;
      }
      /*  
          
         Same story for `delete item` and `delete items`. `item` is a useful word. 
          */
      if ((k$indexof.call(['item', 'items'], ((last_token != null) ? last_token.value : void 0)) >= 0) && ((last_last_token != null) ? last_last_token.value : void 0) === 'delete') {
        add_auto_paren = false;
      }
      /*  
         The `trigger` variable tells us what indentation and paren depth we expect to be at when we close the last implicit paren. 
          */
      trigger = triggers[triggers.length - 1];
      /*  
         We keep track of indents and dedents so that we can do things like `my_func - > NEWLINE INDENT return 2 NEWLINE DEDENT` and have parentheses enclose the entire call. 
          */
      if (token.type === 'INDENT') {
        indentation += 1;
        out_tokens.push(token);
      } else if (token.type === 'DEDENT') {
        indentation -= 1;
        /*  
           A dedent back to the previous level where the paren was inserted indicates we should close out the paren. Dedents need to go before the paren due to parsing rules. 
            */
        out_tokens.push(token);
        closeout();
      }
       else if ((k$indexof.call(['(', '{', '['], token.value) >= 0)) {
        /*  
           Similarly, we keep track of parens/braces/brackets. We assume the code has no open/close mismatches since these will wind up being parse errors anyway. Openers can be part of implicit function calls (`my_func {x:1}`). 
            */
        if (add_auto_paren) {
          out_tokens.push({text: '(', line: token.line, value: '(', type: 'LITERAL'});
          triggers.push({enclosure_depth: enclosure_depth, indentation: indentation});
        }
        enclosure_depth += 1;
        out_tokens.push(token);
      }
       else if ((k$indexof.call([')', '}', ']'], token.value) >= 0)) {
        enclosure_depth -= 1;
        /*  
           An implicit paren can be caused by a closing of a brace/bracket/paren like `x = (my_func a) + b`. 
            */
        ((trigger != null) && enclosure_depth < trigger.enclosure_depth) ? closeout() : void 0;
        out_tokens.push(token);
      }
       else if (token.type === 'NEWLINE') {
        /*  
           It can also be closed out by a newline or a tail conditional like `x = 1 if b`. 
            */
        if (!(declaring_function)) {
          closeout();
        }
        declaring_function = false;
        out_tokens.push(token);
      }
       else if ((k$indexof.call(['if', 'unless', 'when', 'except'], token.value) >= 0)) {
        closeout();
        out_tokens.push(token);
      }
       else if (add_auto_paren) {
        /*  
           If we need to insert a paren, do it here. 
            */
        out_tokens.push({text: '(', line: token.line, value: '(', type: 'LITERAL'});
        triggers.push({enclosure_depth: enclosure_depth, indentation: indentation});
        out_tokens.push(token);
      }
       else if (token.type === 'EOF') {
        /*  
           Close out all auto-parens unconditionally if the file is finished. 
            */
        while (triggers.length > 0) {
          out_tokens.push({text: ')', line: token.line, value: ')', type: 'LITERAL'});
          triggers.pop();
        }
        out_tokens.push(token);
      }
       else {
        /*  
           Pass through the current token. If it was a dedent we already pushed it. 
            */
        out_tokens.push(token);
      }
    }
    /*  
       Close out in case the EOF is missing. 
        */
    while (triggers.length > 0) {
      out_tokens.push({text: ')', line: token.line, value: ')', type: 'LITERAL'});
      triggers.pop();
    }
    return out_tokens;
  }

  /*  
     Coffee-Style Functions 
     ====================== 
      
     This function converts CoffeeScript-style functions (`() ->`) to Kal syntax. 
      */
  function coffee_style_functions(tokens) {
    var out_tokens, last_token, i, token, new_tokens, t, f_token;
    out_tokens = [];
    last_token = null;
    /*  
       We need to track the token index since we look back several tokens in this stage. 
        */
    i = 0;
    while (i < tokens.length) {
      token = tokens[i];
      /*  
         Look for a `->`. 
          */
      if (((last_token != null) ? last_token.value : void 0) === '-' && ((token != null) ? token.value : void 0) === '>') {
        /*  
           If we see the `->`, that means the current token is `>` and we already added the `-` to the new stream. We have to pop the `-` off the stream. 
            */
        out_tokens.pop();
        /*  
           We create a new token stream fragment for this function header. 
            */
        new_tokens = [];
        /*  
           Next we examine the last token in the stream. Since we just popped the `-`, this will either be a `)` if the definition is in the form `(args) ->` or something else if it doesn't specify arguments. 
            */
        t = out_tokens.pop();
        if (((t != null) ? t.value : void 0) === ')') {
          /*  
             If there are arguments here, keep popping until we hit the `(`, adding the argument tokens to the `new_tokens` stream. At the end of this loop, `new_tokens` will be the arguments passed (if any) without enclosing parens. 
              */
          while (((t != null) ? t.value : void 0) !== '(') {
            new_tokens.unshift(t);
            t = out_tokens.pop();
          }
          /*  
             Pass the closing paren. 
              */
          new_tokens.unshift(t);
        } else {
          /*  
             If no arguments were specified, let new_tokens be `()` 
              */
          out_tokens.push(t);
          new_tokens.push({text: '(', line: token.line, value: '(', type: 'LITERAL'});
          new_tokens.push({text: ')', line: token.line, value: ')', type: 'LITERAL'});
        }
        /*  
           Prepend the `function` token to `new_tokens`, which currently has the arguments (if any) in parentheses. Then add it to the `out_tokens` stream. 
            */
        f_token = {text: 'function', line: token.line, value: 'function', type: 'IDENTIFIER'};
        new_tokens.unshift(f_token);
        out_tokens = out_tokens.concat(new_tokens);
      } else {
        /*  
           If we're not handling a Coffee-Style function, just pass tokens through. 
            */
        out_tokens.push(token);
      }
      last_token = token;
      i += 1;
    }
    return out_tokens;
  }

  /*  
     Multiline Lists 
     =============== 
      
     This function converts list definitions that span multiple lines into a single line. Tokens retain their original line numbers. This supports lists and explicit map definitions (`{}`). 
      
     This function is admittedly awful and needs rework. 
      */
  function multiline_lists(tokens) {
    var out_tokens, list_depth, last_token_was_separator, indent_depths, indent_depth, leftover_indent, token, skip_this_token, token_is_separator, ki$6, kobj$6;
    out_tokens = [];
    /*  
       We need to track nested lists. 
        */
    list_depth = 0;
    last_token_was_separator = false;
    indent_depths = [];
    indent_depth = 0;
    leftover_indent = 0;
    kobj$6 = tokens;
    for (ki$6 = 0; ki$6 < kobj$6.length; ki$6++) {
      token = kobj$6[ki$6];
      skip_this_token = false;
      /*  
         We need to keep track of whether or not this token is eligible as a list item separator. 
          */
      token_is_separator = ((k$indexof.call(['NEWLINE', 'INDENT', 'DEDENT'], token.type) >= 0) || token.value === ',');
      /*  
         When we see a list start, we push to the list stack. 
          */
      if (token.value === '[' || token.value === '{') {
        list_depth += 1;
        indent_depths.push(indent_depth);
        indent_depth = 0;
      } else if (token.value === ']' || token.value === '}') {
        /*  
           Likewise for a list end, we pop the stack. 
            */
        list_depth -= 1;
        leftover_indent = indent_depth;
        indent_depth = indent_depths.pop();
      }
       else if (token.type === 'INDENT') {
        /*  
           Keep track of the indentation level, looking for a token that returns us to the original indent. We continue to skip indents/dedents until this happens. Basically, we want to ignore indentation inside these multi-line definitions. Once back to original the indent level, we push in a `NEWLINE`. 
            
           Note that none of this happens unless we are inside a list definition (all these flags are ignored). 
            */
        indent_depth += 1;
        if (leftover_indent !== 0) {
          leftover_indent += 1;
          skip_this_token = true;
          (leftover_indent === 0) ? out_tokens.push({text: '', line: token.line, value: '\n', type: 'NEWLINE'}) : void 0;
        }
      }
       else if (token.type === 'DEDENT') {
        indent_depth -= 1;
        if (leftover_indent !== 0) {
          leftover_indent -= 1;
          (leftover_indent === 0) ? out_tokens.push({text: '', line: token.line, value: '\n', type: 'NEWLINE'}) : void 0;
          skip_this_token = true;
        }
      }
       else if (token.type === 'NEWLINE') {
        /*  
           Skip newlines inside of list definitions. 
            */
        if (leftover_indent !== 0) {
          skip_this_token = true;
        }
      }
       else {
        leftover_indent = 0;
      }
      /*  */
      if (list_depth > 0) {
        /*  
           The first token in a newline stretch gets turned into a comma 
            */
        if (token_is_separator && !(last_token_was_separator)) {
          out_tokens.push({text: ',', line: token.line, value: ',', type: 'LITERAL'});
        } else {
          (!(token_is_separator || skip_this_token)) ? out_tokens.push(token) : void 0;
        }
      } else {
        (!(skip_this_token)) ? out_tokens.push(token) : void 0;
      }
      last_token_was_separator = token_is_separator && (list_depth > 0);
    }
    return out_tokens;
  }

  /*  
     Print Statements 
     ================ 
      
     Convert `print` tokens to `console` `.` `log` tokens. 
      */
  function print_statement(tokens) {
    var new_tokens, token, ki$7, kobj$7;
    new_tokens = [];
    kobj$7 = tokens;
    for (ki$7 = 0; ki$7 < kobj$7.length; ki$7++) {
      token = kobj$7[ki$7];
      if (token.value === 'print' && token.type === 'IDENTIFIER') {
        new_tokens.push({text: 'print', line: token.line, value: 'console', type: 'IDENTIFIER'});
        new_tokens.push({text: 'print', line: token.line, value: '.', type: 'LITERAL'});
        new_tokens.push({text: 'print', line: token.line, value: 'log', type: 'IDENTIFIER'});
      } else {
        new_tokens.push(token);
      }
    }
    return new_tokens;
  }

})()