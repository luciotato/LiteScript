(function () {
  var inNode, Grammar, command, KEYWORD_TRANSLATE, scopes, scope, try_block_stack, try_block_stacks, parfor_cb, parfor_cb_stack, callback_counter, current_callback, current_callbacks, comments, class_defs, class_def, literate, for_count, while_count, use_snippets, js_line_number, snippets;
  var k$indexof = [].indexOf || function (item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
  var k$comprl = function (iterable,func) {var o = []; if (iterable instanceof Array || typeof iterable.length == "number") {for (var i=0;i<iterable.length;i++) {o.push(func(iterable[i]));}} else if (typeof iterable.next == "function") {var i; while ((i = iterable.next()) != null) {o.push(func(i));}} else {throw "Object is not iterable";}return o;};
  /* Kal Generator
     -------------

     Check if we're in node or in the browser
      */
  inNode = (typeof window === 'undefined');
  /*
     The `generator` module extends parser abstract syntax tree classes. It provides methods for generating JavaScript code for each node by traversing the tree. The compiler calls the `.js()` method of the root object to return the compiled JavaScript for the tree.

     We extend the grammar classes, so this module needs to be loaded **after** the `grammar` module.
      */
  Grammar = require('./grammar').Grammar;

    /*
     globalMap for sourceMapping
      */
  if (inNode) {
    command;// = require('../sourceMap');
  }
  /*
     Keyword Mapping
     ===============

     Many keywords can be easily mapped one-to-one with their JavaScript equivalents.
      */
  KEYWORD_TRANSLATE = {'yes': 'true', 'on': 'true', 'no': 'false', 'off': 'false', 'is': '===', 'isnt': '!==', '==': '===', '!=': '!==', 'and': '&&', 'but': '&&', 'or': '||', 'xor': '^', '^': 'pow', 'mod': '%', 'not': '!', 'new': 'new', 'me': 'this', 'this': 'this', 'null': 'null', 'nothing': 'null', 'none': 'null', 'break': 'break', 'throw': 'throw', 'raise': 'throw', 'instanceof': 'instanceof', 'of': 'in', 'EndOfList': 'undefined', 'fail': 'throw', 'bitwise and': '&', 'bitwise or': '|', 'bitwise xor': '^', 'bitwise not': '~', 'typeof': 'typeof', 'bitwise left': '<<', 'bitwise right': '>>'};
  /*
     Globals
     =======

     These globals are reset each time a `File` object's `js` method is called.

     Scope is tracked using a mapping from variable names to scope qualifier strings. Qualifier strings include:

     * `closures ok` - A "normal" variable that will not be redefined if used in a child scope. Instead its closure will be used. This lets the compiler know this variable is new and needs a `var` definition in this scope.
     * `closure` - A "normal" that was used in a parent scope and was passed through as a closure. This lets the compiler know this variable is already defined and it does not need a `var` definition in this scope.
     * `no closures` - This variable is valid in the current scope and should be redefined if used in child scopes. This is used for iterator variables, temporary variables for return values, and callback function variables.
     * `argument` - This is for function arguments. Arguments _are_ passed through to child scopes but _do not_ get `var` definitions in the local scope.
     * `function` - Function definitions _are_ passed through to child scopes but _do not_ need `var` definitions in the local scope.
     * `class definition` - Class definitions _are_ passed through to child scopes but _do not_ need `var` definitions in the local scope.

     `scopes` represents the current scope stack.
      */
  scopes = [];
  scope = {};
  /*
     Try blocks are maintained in a stack for asynchronous error handler generation.
      */
  try_block_stack = [];
  try_block_stacks = [];
  /*
     `parfor_cb` and it's stack are used to store the callback for any parallel `for` loops currently being generated.
      */
  parfor_cb = null;
  parfor_cb_stack = [];
  /*
     The `current_callback` is the function to call upon exiting the current asynchronous block. For example, `if` statements with async members must call this function at all exit paths to make sure that code following the `if` block is executed. For example, in:

     <pre>
     if flag
     wait for x from y()
     else
     x = 2
     </pre>

     The `if` block will need to wrap `print x` in a callback function. Every branch of the `if` statement needs to execute this callback somehow, even if it's just as a function call (like for the `else` block).

     Callbacks get unique names throughout the file.
      */
  callback_counter = 0;
  current_callback = "k$cb0";
  current_callbacks = [];
  /*
     The `comments` stream stores the comments from the original code that have not been inserted into the JavaScript output yet.
      */
  comments = [];
  /*
     The current class being defined is tracked in a stack (classes can technically be definined inside other class definitions). The `class_def` object stores the class name and code that occurs directly in the definition that gets thrown in the constructor later.
      */
  class_defs = [];
  class_def = {};
  /*
     The literate flag is set for Literate Kal files. It is used to determine how comments, or in this case inline documentation lines, are formatted in the JavaScript output.
      */
  literate = false;
  /*
     Counters used to generate unique iterator variables for loops.
      */
  for_count = 1;
  while_count = 1;
  /*
     Snippets are useful chunks of JavaScript that are only included in the output when they are actually used.
      */
  use_snippets = {};
  /*
     Generated js line number, for Source Map
      */
  js_line_number = 1;

  /*
     Utility Functions
     =================

     These functions indent a block of JavaScript to make it pretty.

     Indent JavaScript with two spaces:
      */
  function indent(code) {
    if (code !== '') {
      return '  ' + code.replace(/\n(?![\r\n]|$)/g, '\n  ');
    } else {
      return code;
    }
  }

  /*
     Indent JavaScript with `level * 2` spaces.
      */
  function multi_indent(code, level) {
    var new_str;
    if (code !== '' && level > 0) {
      new_str = Array(level * 2 + 1).join(' ');
      return new_str + code.replace(/\n(?![\r\n]|$)/g, '\n' + new_str);
    } else {
      return code;
    }
  }

  /*
     Return a new unique callback function name.
      */
  function create_callback() {
    callback_counter += 1;
    current_callback = ("k$cb" + callback_counter);
    return current_callback;
  }

  /*
     Define a new class and push the current one to the stack.
      */
  function push_class() {
    class_defs.push(class_def);
    class_def = {name: '', code: '', args: [], has_constructor: false};
  }

  /*
     Finish a class definition and pop the stack.
      */
  function pop_class() {
    class_def = class_defs.pop();
    return class_def;
  }

  /*
     `push_scope` is used to start a new function definition.
      */
  function push_scope() {
    var new_scope, k, v, ki$1, kobj$1;
    scopes.push(scope);
    /*
       It also creates a new context for `try` blocks.
        */
    try_block_stacks.push(try_block_stack);
    try_block_stack = [];
    /*
       Closeout callbacks are also saved for when we pop the scope.
        */
    parfor_cb_stack.push(parfor_cb);
    parfor_cb = null;
    current_callbacks.push(current_callback);
    /*
       We copy in variables to the new scope as long as they are not marked `"no closures"`. We mark all of these as `"closure"` variables in the new scope so that they don't get a `var` definition inside the new scope.
        */
    new_scope = {};
    kobj$1 = scope;
    for (k in kobj$1) {
      if (!kobj$1.hasOwnProperty(k)) {continue;}
      v = scope[k];
      if (v === 'no closures') {
      } else if (v === 'closures ok' || v === 'argument' || v === 'function') {
        new_scope[k] = 'closure';
      }
       else if (v === 'closure') {
        new_scope[k] = 'closure';
      }
    }
    scope = new_scope;
  }

  /*
     `pop_scope` finishes out a function definition. It prepends the `code` argument with `var` definitions for variables that need them. If `wrap` is true, it will also wrap the code in a function to prevent leaks to the global scope.
      */
  function pop_scope(code, wrap) {
    var rv, var_names, var_name, ki$2, kobj$2;
    rv = "";
    /*
       `var_names` is a list of variables that need to be declared in this scope. We don't redeclare closures, function arguments, functions, or classes.
        */
    var_names = [];
    kobj$2 = scope;
    for (var_name in kobj$2) {
      if (!kobj$2.hasOwnProperty(var_name)) {continue;}
      if (!(((k$indexof.call(['closure', 'argument', 'function', 'class definition'], scope[var_name]) >= 0))) && var_name !== 'k$next') {
        var_names.push(var_name);
      }
    }
    /*
       Wrap the function in a `(function () {...})()` wrapper if requested.
        */
    if (wrap) {
      rv += '(function () {\n';
    }
    /*
       If we have variables to declare, add a `var` statement for JavaScript.
        */
    if (var_names.length > 0) {
      code = 'var ' + var_names.join(', ') + ';\n' + code;
    }
    /*
       Indent if we are in the wrapper.
        */
    rv += (wrap) ? indent(code) : code;
    /*
       Close out the wrapper if present.
        */
    if (wrap) {
      rv += "})()";
    }
    /*
       Actually pop the scope (if we aren't at the top level), `try` context, and callback pointers.
        */
    if (!(scopes === [])) {
      scope = scopes.pop();
    }
    try_block_stack = try_block_stacks.pop();
    current_callback = current_callbacks.pop();
    parfor_cb = parfor_cb_stack.pop();
    return rv;
  }

  /*
     `check_existence_wrapper` wraps a variable access with a check to make sure it actually exists before accessing it. This is used with the `?`, `doesnt exist`, and `exists` operators.
      */
  function check_existence_wrapper(code, undefined_unary, invert) {
    var rv;
    /*
       An "undefined unary" (`undefined_unary` is true) refers to a simple variable access to an undeclared variable, for example `x = a` where `a` is not defined in the current scope. This case requres we check if the variable exists before checking if it is null/undefined. Comparing directly to `null` would fail if the variable wasn't defined, so we do a `typeof ... === 'undefined'` check first for this special case.

       `invert` indicates we should do a boolean invert of the check (check that it doesn't exist). The output code looks cleaner if we handle this seperately rather than using a `!`.
        */
    if (undefined_unary) {
      rv = (invert) ? ("(typeof " + code + " === 'undefined' || " + code + " === null)") : ("(typeof " + code + " !== 'undefined' && " + code + " !== null)");
    } else {
      rv = (invert) ? ("" + code + " == null") : ("" + code + " != null");
    }
    return rv;
  }

  /*
     `kthis()` returns the current useable value for `me`. If we are in a callback or a task, this value gets stored in a `k$this` closure. Otherwise we just use `this`.
      */
  function kthis() {
    return (((scope['k$this'] != null)) ? "k$this" : "this");
  }

  /*
     `render_try_blocks` will apply the current stack of `try` blocks. This is used when defining a new callback in order to carry error handling code through to the callback function.
      */
  function render_try_blocks() {
    var rv, indent_level, try_block, ki$3, kobj$3;
    rv = "";
    indent_level = 0;
    kobj$3 = try_block_stack;
    for (ki$3 = 0; ki$3 < kobj$3.length; ki$3++) {
      try_block = kobj$3[ki$3];
      rv += multi_indent(try_block.js_wrapper_try(), indent_level);
      indent_level += 1;
    }
    return rv;
  }

  /*
     `render_catch_blocks` will apply the current stack of `catch` blocks. This is used when defining a new callback in order to carry error handling code through to the callback function.
      */
  function render_catch_blocks() {
    var rv, indent_level, try_block, ki$4, kobj$4;
    rv = "";
    indent_level = try_block_stack.length - 1;
    kobj$4 = try_block_stack;
    for (ki$4 = 0; ki$4 < kobj$4.length; ki$4++) {
      try_block = kobj$4[ki$4];
      rv += multi_indent(try_block.js_wrapper_catch(), indent_level);
      indent_level -= 1;
    }
    return rv;
  }

  /*
     JavaScript Generator Functions
     ==============================

     ### File

     `File` objects take an options argument (optional), that may contain the following entries:

     * `literate` - `true` if this file is Literate Kal. It changes the output style of the comments to look better for literate files.
     * `bare` - if `true`, the output of this `File` will not get wrapped in a `function` wrapper and any module-level variables will leak to the global scope.

     This method also resets all the globals in this module.
      */
  Grammar.File.prototype.js = function (options) {
    var comment, code, snip, key, ki$5, kobj$5, rv;
    /*
       Global loop counters, flags, and stacks are reset here in case we are compiling multiple files.
        */
    js_line_number = 1;
    for_count = 1;
    while_count = 1;
    literate = options.literate;
    scopes = [];
    scope = {};
    try_block_stack = [];
    try_block_stacks = [];
    parfor_cb = null;
    parfor_cb_stack = [];
    callback_counter = 0;
    current_callback = 'k$cb0';
    current_callbacks = [];
    class_defs = [];
    class_def = {name: '', code: '', args: [], has_constructor: false};
    use_snippets = {};
    this.callback = current_callback;
    this.bare = options.bare;
    /*
       We consume the comments array later, so we make a copy in case the compiler needs it (not currently an issue).
        */
    comments = k$comprl(this.ts.comments,function (k$i) {comment = k$i; return comment;});
    /*
       We use the `Block` object's JavaScript generator for this node's statements since this class acts like a block. `super` isn't supported as an expression yet, so this should wind up being something like `code = super()`.
        */
    code = Grammar.Block.prototype.js.apply(this);
    /*
       We prepend any Kal JavaScript "snippets". Snippets are useful pieces of code that only get included if used, such as code for the `in` operator.
        */
    snip = [];
    kobj$5 = use_snippets;
    for (key in kobj$5) {
      if (!kobj$5.hasOwnProperty(key)) {continue;}
      snip.push(use_snippets[key]);
    }
    snip = snip.join('\n');
    rv = [snip, code].join('\n');
    /*
       Close out any last callback (if present).
        */
    if (current_callback !== 'k$cb0') {
      rv += "}";
    }
    /*
       Close out the scope and wrap with a function if necessary.
        */
    return pop_scope(rv, !(options.bare));
  }

  /*
     ### Statement

     `Statement` objects call their child node's `js` method and apply any comment tokens that apply to this segment of code.
      */
  Grammar.Statement.prototype.js = function () {
    var comment_postfix, comment, comment_prefix, rv;
    /*
       Pass all flags about our current state through to the child statement node.
        */
    this.statement.in_conditional = this.in_conditional;
    this.statement.in_loop = this.in_loop;
    this.statement.parent_block = this.parent_block;
    this.statement.callback = this.callback;
    this.statement.original_callback = this.original_callback;
    /*
       Check for "postfix" comments. These are comments that occur at the end of the line, such as `a = 1 #comment`. We want to try to add these at the end of the current JavaScript line.
        */
    comment_postfix = "";
    if ((comments[0] != null) && comments[0].line === this.statement.line && comments[0].post_fix) {
      comment = comments.shift();
      comment_postfix = (" /* " + (comment.value) + " */\n");
    }
    comment_prefix = "";
    /*
       Check for "prefix" comments. These are comments that occur on their own line before the current line of code. There may be more than one, so we try to lump them all together into a big comment and prepend it.
        */
    while ((comments[0] != null) && comments[0].line < this.statement.line) {
      comment = comments.shift();
      comment_prefix += ("/* " + (comment.value) + " */");
    }
    if (literate) {
      comment_prefix = comment_prefix.replace(/\*\/\/\*/g, '\n  ');
    }
    rv = this.statement.js();
    if (!(comment_postfix === '')) {
      rv = rv.replace(/\n/, comment_postfix);
    }
    /*
       Add in newlines to make things look nice. Try not to add extra newlines.
        */
    if (rv[0] === '\n' && comment_prefix !== "") {
      rv = '\n' + comment_prefix + rv;
    } else if (comment_prefix !== "") {
      rv = comment_prefix + '\n' + rv;
    }
    return rv;
  }

  /*
     ### ThrowStatement

     `ThrowStatement`s are context-dependent. They require different code for asynchronous and synchronous blocks.
      */
  Grammar.ThrowStatement.prototype.js = function () {
    var rv;
    /*
       If there is no local `try` block and we are in an asynchronous place, we call back with an error. Otherwise, we use a normal `throw`.
        */
    if (try_block_stack.length === 0 && (scope['k$next'] != null)) {
      rv = ("return k$next.apply(" + (kthis()) + ", [" + (this.expr.js()) + "]);\n");
    } else {
      if (this.specifier.text==='fail') 
        rv = "throw new Error(" + (this.expr.js()) + ");\n";
      else rv = "throw " + (this.expr.js()) + ";\n";
    }
    /*
       Tail conditionals work with `throw` statements, so we apply one if specified.
        */
    if ((this.conditional != null)) {
      rv = this.conditional.js(rv, false);
    }
    return rv;
  }

  /*
     `ThrowStatement`s are context-dependent. They require different code for asynchronous and synchronous blocks.

     ### ReturnStatement
      */
  Grammar.ReturnStatement.prototype.js = function () {
    var exprs_js, expr, arg_list, rv;
    /*
       Since return statements can have multiple return values, we generate JavaScript for each expression.
        */
    exprs_js = k$comprl(this.exprs,function (k$i) {expr = k$i; return expr.js();});
    /*
       In asynchronous contexts, we need to prepend an error argument, in this case `null` since we are not throwing an error.
        */
    ((scope['k$next'] != null)) ? exprs_js.unshift('null') : void 0;
    arg_list = exprs_js.join(', ');
    /*
       In asynchronous contexts, we assign the return value array to a temporary variable and execute the callback.
        */
    if ((scope['k$next'] != null)) {
      scope['k$rv'] = 'no closures';
      use_snippets['async'] = snippets['async'];
      rv = ("return k$rv = [" + arg_list + "], k$async(k$next, " + (kthis()) + ", k$rv);");
      /*
         We also wrap this in a conditional if specified.
          */
      if ((this.conditional != null)) {
        rv = this.conditional.js(rv, false);
      }
      rv += "\n";
      return rv;
    } else {
      /*
         In a synchronous context, this turns into a simple `return` statement. If there are multiple return values, we return them as an array.
          */
      rv = "return";
      if (this.exprs.length === 1) {
        rv += " " + arg_list;
      } else if (this.exprs.length > 1) {
        rv += ("[" + arg_list + "]");
      }
      rv += ";\n";
      if ((this.conditional != null)) {
        rv = this.conditional.js(rv, false);
      }
      return rv;
    }
  }

  /*
     ### DeleteStatement
      */
  Grammar.DeleteStatement.prototype.js = function () {
    var list_range, from_val, to_val, rv;
    /*
       For property deletes the syntax translates directly to JavaScript.
        */
    if ((this.prop != null)) {
      if (this.prop.type === 'IDENTIFIER') {
        return ("delete " + (this.from_var.js()) + "." + (this.prop.value) + ";\n");
      } else {
        return ("delete " + (this.from_var.js()) + "[" + (this.prop.value) + "];\n");
      }
    } else {
      /*
         For index deletes, we need to use custom snippets.


         If the code requests a range of deletes, we can handle that in a clever way using `slice`.
          */
      if (this.item_list.comprehension instanceof Grammar.RangeExpression) {
        list_range = this.item_list.comprehension;
        from_val = list_range.from_expr.number_constant();
        to_val = list_range.to_expr.number_constant();
        if ((from_val != null) && (to_val != null)) {
          return ("" + (this.from_var.js()) + ".splice(" + from_val + ", " + (to_val - from_val + 1) + ");\n");
        } else {
          scope['k$rstart'] = 'no closures';
          rv = ("k$rstart = " + (list_range.from_expr.js()) + ";\n");
          rv += ("" + (this.from_var.js()) + ".splice(k$rstart, " + (list_range.to_expr.js()) + " - k$rstart);\n");
          return rv;
        }
      } else if ((this.item_list.comprehension != null) || this.item_list.items.length > 1) {
        /*
           If the code requests multiple deletes, we use the snippet for deleting indices specied by an array.
            */
        use_snippets['delete'] = snippets['delete'];
        return ("k$del(" + (this.from_var.js()) + ", " + (this.item_list.js()) + ");\n");
      }
       else if ((this.item_list.items[0].number_constant != null && this.item_list.items[0].number_constant() != null)) {
        /*
           If the code requests a single numeric delete, we can use simpler JavaScript.
            */
        return ("" + (this.from_var.js()) + ".splice(" + (this.item_list.items[0].number_constant()) + ", 1);\n");
      }
       else {
        /*
           Otherwise let `k$del` handle it.
            */
        return ("k$del(" + (this.from_var.js()) + ", " + (this.item_list.items[0].js()) + ");\n");
      }
    }
  }

  /*
     ### ExpressionStatement

     `ExpressionStatement`s are simply expressions wrapped as a statement, so we just return the child expression's JavaScript.
      */
  Grammar.ExpressionStatement.prototype.js = function () {
    var rv;
    rv = this.expr.js();
    /*
       We add newlines to make it look nice. Function definitions fall under this class, so we add extra newlines in that instance.
        */
    if (rv === "") {
      return "";
    } else if (this.expr.left.base instanceof Grammar.FunctionExpression) {
      return '\n' + rv + '\n\n';
    }
     else {
      return rv + ';\n';
    }
  }

  /*
     ### Expression

     `Expression`s are not context-dependent with respect to asynchronous or synchronous blocks. By default, the parser just creates a tree with only one long branch when expressions are chained together. For example, `1 + 2 + 3`, turns into:

     <pre>
     >   +
     >  / \
     > 1   +
     >    / \
     >   2   3
     </pre>

     Which is normally fine because JavaScript has the same order of operations. However, certain operators in Kal don't match up one-for-one and need to have their precedence altered. The `in` and `^` operators are the only operators impacted at this time. For example, with `3 in a and 4 in b` gets parsed as:

     <pre>
     >   in*
     >  /  \
     > 3   and**
     >     / \
     >    a+  in
     >       / \
     >      4   b
     </pre>

     Because `in` gets turned into `k$indexof` function calls, we would get `k$indexof(3, a && k$kindexof(4,b))`, which is clearly wrong. We need to convert the tree to:

     <pre>
     >     and**
     >    /    \
     >   in*   in
     >  / \    / \
     > 3   a+ 4   b
     </pre>

     If `oop_reverse` is specified, the current node (`*`) makes itself the left branch of it's own right branch (`**`). It then replaces it's own right branch with the old right branch's left branch (`+`).
      */
  Grammar.Expression.prototype.js = function (oop_reverse) {
    var rv, left_code, opjs, subscope, ki$6, kobj$6, old_right, new_right, new_left;
    rv = '';
    /*
       When `oop_reverse` is specified, my `left` object has already been compiled to a string and passed in with `oop_reverse`.
        */
    if (oop_reverse) {
      left_code = oop_reverse;
    } else {
      left_code = this.left.js();
    }
    /*
       If this is not a binary expression, we just use the JavaScript from the left operand.
        */
    if ((this.op == null)) {
      rv += left_code;
    } else {
      /*
         Otherwise compile the operator.
          */
      opjs = this.op.js();
      /*
         The `in` operator gets replaced with a call to the `k$indexof` function. We mark the snipped as used and declare it in all scopes as a closure. I'm pretty sure these steps are redundant (other than the `use_snippets` step).
          */
      if (opjs === 'in' && this.op.op.value !== 'of') {
        if (!((use_snippets['in'] != null))) {
          use_snippets['in'] = snippets['in'];
          kobj$6 = scopes;
          for (ki$6 = 0; ki$6 < kobj$6.length; ki$6++) {
            subscope = kobj$6[ki$6];
            subscope['k$indexof'] = 'closure';
          }
          scope['k$indexof'] = 'closure';
        }
        /*
           Do the order of operations reverse described above.
            */
        old_right = this.right;
        new_right = this.right.left;
        new_left = ("(k$indexof.call(" + (new_right.js()) + ", " + left_code + ") >= 0)");
        rv += old_right.js(new_left);
      } else if (opjs === 'nor') {
        /*
           Nor gets a special case since we need to wrap the whole thing in a `!`.
            */
        rv += ("!(" + left_code + " || " + (this.right.js()) + ")");
      }
       else if (opjs === 'pow') {
        /*
           `pow` (`^`) needs to have it's order of operations reversed.
            */
        old_right = this.right;
        new_right = this.right.left;
        new_left = ("Math.pow(" + left_code + ", " + (new_right.js()) + ")");
        rv += old_right.js(new_left);
      }
       else {
        /*
           Otherwise, just generate code and let JavaScript handle order of operations.
            */
        rv += ("" + left_code + " " + opjs + " " + (this.right.js()));
      }
    }
    /*
       For inverted expressions (those preceeded with a `not`), wrap it with a `!`.
        */
    if (((this.op != null) ? this.op.invert : void 0)) {
      rv = ("!(" + rv + ")");
    }
    /*
       Apply tail conditionals when appropriate.
        */
    if ((this.conditional != null)) {
      rv = this.conditional.js(rv, true);
    }
    return rv;
  }

  /*
     ### UnaryExpression

     Unary expressions are not context-dependent for asynchronous or synchronous contexts. These represent a single variable or constant, possibly with a chain of property access, array access, exisential, and/or function call operators.
      */
  Grammar.UnaryExpression.prototype.js = function () {
    var rv, base_val, kw_translate, undefined_unary, existence_qualifiers, last_accessor, accessor, ki$7, kobj$7, existence_check, eq, ki$8, kobj$8, closeout, preop_value;
    rv = '';
    /*
       For identifiers, we attempt to tranlate the value if it is a keyword. For example, `yes` becomes `true`. If it's not a keyword, we just use it as-is.
        */
    if (this.base.type === 'IDENTIFIER') {
      base_val = this.base.value;
      kw_translate = KEYWORD_TRANSLATE[base_val];
      /*
         `this` is a special case because we might be in a callback. `kthis` will give us the right value to use.
          */
      if (kw_translate === 'this') {
        kw_translate = kthis();
      }
      rv += kw_translate || base_val;
      /*
         If it wasn't a keyword, we declare the variable in this scope if it has not been declared and is being used here as an l-value. We don't do this if we are doing a compound assignment or if this unary has accessors (for example, `x.a = 1` does not declare `x`).
          */
      if ((kw_translate == null) && (scope[base_val] == null) && this.is_lvalue() && this.accessors.length === 0 && !(this.compound_assign)) {
        scope[base_val] = 'closures ok';
      }
    } else {
      /*
         For constants we just pass the value through.
          */
      rv += this.base.js();
    }
    /*
       We do a check here to see if this is an "undefined unary". An undefined unary is a simple variable access to an undeclared variable. When used with exisential operators, undefined unary's require a check if the variable exists before checking if it is `null` or `undefined` (`x == null` throws an error if `x` has never been defined).
        */
    undefined_unary = (this.base.type === 'IDENTIFIER' && (scope[base_val] == null) && (kw_translate == null));
    /*
       We need to build up a list of exisential qualifiers for each accessor. For example `x.a?.b` needs an exisential check wrapper for access to the `b` property. If there is no exisential for an accessor, it just returns an empty string.
        */
    existence_qualifiers = [];
    last_accessor = this.accessors[this.accessors.length - 1];
    kobj$7 = this.accessors;
    for (ki$7 = 0; ki$7 < kobj$7.length; ki$7++) {
      accessor = kobj$7[ki$7];
      existence_qualifiers.push(accessor.js_existence(rv, undefined_unary, last_accessor.invert));
      /*
         Append the accessor (property access, function calls, array access, and/or exisentials) JavaScript.
          */
      rv += accessor.js();
      /*
         Only the first access in a chain can be an undefined unary. `x?.a?.b` does not require that we check if `a` is defined before comparing it to `null`.
          */
      undefined_unary = false;
    }
    /*
       Make a list of exisential checks, filtering out the empty ones. This will eventually be a list comprehension once they support conditionals.
        */
    existence_check = [];
    kobj$8 = existence_qualifiers;
    for (ki$8 = 0; ki$8 < kobj$8.length; ki$8++) {
      eq = kobj$8[ki$8];
      if (eq !== "") {
        existence_check.push(eq);
      }
    }
    /*
       We join together all existence checks and wrap the current JavaScript with the check if necessary.
        */
    existence_check = existence_check.join(' && ');
    if (existence_check !== "") {
      if (last_accessor instanceof Grammar.ExisentialCheck) {
        rv = ("(" + existence_check + ")");
      } else {
        closeout = "void 0";
        rv = ("((" + existence_check + ") ? " + rv + " : " + closeout + ")");
      }
    }
    /*
       Lastly, prefix operators are prepended to the output code. These include `new`, `typeof`, `-`, `not`, and `bitwise not`.
        */
    preop_value = ((this.preop != null) ? this.preop.value : void 0);
    if (preop_value === 'new' || preop_value === 'typeof') {
      rv = ("" + (KEYWORD_TRANSLATE[preop_value]) + " " + rv);
    } else if (preop_value === 'not') {
      if (this.bitwise) {
        preop_value = "bitwise not";
      }
      rv = ("" + (KEYWORD_TRANSLATE[preop_value]) + "(" + rv + ")");
    }
     else if (preop_value === '-') {
      rv = ("-" + rv);
    }
    return rv;
  }

  /*
     ### WhenExpression

     `WhenExpression`s are tail conditionals. When calling this method, we pass in the JavaScript that returns the "true" value (`true_block_js`).

     We also pass in the JavaScript that returns the "false" value (`false_js`) if there is any, for example when we do `1 if x otherwise 2`. `must_return_value` is set to true if this expression needs to have a return value and can't be turned into an `if` statement, for example in assignment (`x = 1 if x else 2`), the right-hand side needs to return a value and can't be turned into an `if` statement.
      */
  Grammar.WhenExpression.prototype.js = function (true_block_js, must_return_value, false_js) {
    var conditional_js, rv;
    /*
       Compile the conditional expression.
        */
    conditional_js = this.condition.js();
    /*
       Invert if necessary based on the specifier.
        */
    if (this.specifier.value === 'unless' || this.specifier.value === 'except') {
      conditional_js = ("!(" + conditional_js + ")");
    }
    /*
       If we have a false branch parsed as part of this expression, we return a ternary with the compiled version of that expression.
        */
    if ((this.false_expr != null) && (false_js == null)) {
      return ("(" + conditional_js + ") ? " + true_block_js + " : " + (this.false_expr.js()));
    } else {
      /*
         If we need a return value, we use a ternary that returns undefined for false.
          */
      if (must_return_value) {
        return ("(" + conditional_js + ") ? " + true_block_js + " : void 0");
      } else {
        /*
           Otherwise this becomes an if statement for things like `return x if x exists`.
            */
        rv = ("if (" + conditional_js + ") {\n" + (indent(true_block_js)) + "}");
        if ((false_js != null)) {
          rv += (" else {\n" + false_js + "}");
        }
        rv += "\n";
        return rv;
      }
    }
  }

  /*
     `js_bool` returns an expression that evaluates the truth of the condition.
      */
  Grammar.WhenExpression.prototype.js_bool = function () {
    if (this.specifier.value === 'unless' || this.specifier.value === 'except') {
      return ("!(" + (this.condition.js()) + ")");
    } else {
      return this.condition.js();
    }
  }

  /*
     ### ExisentialCheck

     An existential check is used to check if a variable is non-null and defined. The `js` method is never called because these are only parsed as accessors for `UnaryExpression`s. `UnaryExpression` calls `js_existence`.
      */
  Grammar.ExisentialCheck.prototype.js = function () {
    return "";
  }

  /*
     In this case we just use the `check_existence_wrapper` utility.
      */
  Grammar.ExisentialCheck.prototype.js_existence = function (accessor, undefined_unary, invert) {
    return check_existence_wrapper(accessor, undefined_unary, invert);
  }

  /*
     ### PropertyAccess

     For property access we just defer to JavaScript's built in `.` operator.
      */
  Grammar.PropertyAccess.prototype.js = function () {
    var rv;
    if (this.expr.type === 'IDENTIFIER') {
      rv = this.expr.value;
    } else {
      rv = this.expr.js();
    }
    rv = ("." + rv);
    return rv;
  }

  /*
     If this access has an exisential qualifier (`a?.b`), we generate a wrapper.
      */
  Grammar.PropertyAccess.prototype.js_existence = function (accessor, undefined_unary, invert) {
    if (this.exisential) {
      return check_existence_wrapper(accessor, undefined_unary, invert);
    } else {
      return '';
    }
  }

  /*
     ### AssignmentStatement

     Assignment statements are not context dependent. Asynchronous assignments are done using `wait for`s.
      */
  Grammar.AssignmentStatement.prototype.js = function () {
    var op, rv;
    /*
       We need to set the `compound_assign` flag on our l-value if we are using a compound assignment like `+=`. This tells the l-value not to automatically declare itself. We do this because the l-value is accessed before assignment, so we want the JavaScript to throw an error if it hasn't been defined yet. For `=`, we do want the l-value to get declared if necessary.
        */
    op = this.assignOp.value;
    if (op !== '=') {
      op += '=';
      this.lvalue.compound_assign = true;
    }
    rv = ("" + (this.lvalue.js()) + " " + op + " " + (this.rvalue.js()) + ";\n");
    /*
       For prettyness, we add an extra newline after anonymous function definitions.
        */
    if (this.rvalue.left.base instanceof Grammar.FunctionExpression) {
      rv += '\n';
    }
    /*
       The statement is wrapped with its tail conditional if there is one.
        */
    if ((this.conditional != null)) {
      rv = this.conditional.js(rv, false);
    }
    return rv;
  }

  /*
     ### NumberConstant

     We actually use the raw token text here rather than the numeric value. JavaScript and Kal number syntax are identical, so no trascompiling is necessary. It also makes the JavaScript output more readable if we avoid converting things, especially for hex values.
      */
  Grammar.NumberConstant.prototype.js = function () {
    return this.token.text;
  }

  /*
     ### StringConstant

     We pass through the string value (the part between quotes) here.
      */
  Grammar.StringConstant.prototype.js = function () {
    return this.token.value;
  }

  /*
     ### RegexConstant

     Just let JavaScript handle the regex syntax.
      */
  Grammar.RegexConstant.prototype.js = function () {
    return this.token.text;
  }

  /*
     ### BinOp

     Operators are compiled using the `KEYWORD_TRANSLATE` mapping.
      */
  Grammar.BinOp.prototype.js = function () {
    var op_value;
    op_value = this.op.value;
    if (this.bitwise) {
      op_value = ("bitwise " + op_value);
    }
    return KEYWORD_TRANSLATE[op_value] || this.op.value;
  }

  /*
     ### IfStatement

     `IfStatement`s are context dependent. When the `js` method is called, we actually don't know if there will be asynchronous code inside the `if`/`else` blocks. We first try generating JavaScript assuming this is pure synchronous code using `js_no_callbacks`. If we detect asynchronous calls after code generation, we throw away those results and generate asynchronous code using `js_callbacks`.
      */
  Grammar.IfStatement.prototype.js = function () {
    var cb_counter, conditional_js, rv, else_clause, ki$9, kobj$9, inner_js;
    /*
       We record the original callback function name for two reasons. First, we want to be able to check if any new callbacks get generated when we generate our code blocks. This would indicate asynchronous code in the blocks. Second, all branches need to execute a callback to the original_callback once they are finished.

       `me.original_callback` can be set for us by a parent block if we previously hit asynchronous code.
        */
    if (!((this.original_callback != null))) {
      this.original_callback = this.callback;
    }
    /*
       We store the `cb_counter` so that we can reset it if we decide to regenerate JavaScript.
        */
    cb_counter = callback_counter;
    /*
       `conditional_js` stores the generated JavaScript for the conditional expression in the `if` statement.
        */
    conditional_js = this.conditional.js();
    if (this.condition.value === 'unless' || this.condition.value === 'except') {
      conditional_js = ("!(" + conditional_js + ")");
    }
    rv = ("if (" + conditional_js + ") {\n");
    /*
       We need to set the `in_conditional` flag (which propagates down) so that any child blocks know to call back to the `original_callback` when they complete. We pass the similar `in_loop` flag down.
        */
    this.block.in_conditional = true;
    this.block.in_loop = this.in_loop;
    kobj$9 = this.elses;
    for (ki$9 = 0; ki$9 < kobj$9.length; ki$9++) {
      else_clause = kobj$9[ki$9];
      else_clause.block.in_conditional = true;
      else_clause.block.in_loop = this.in_loop;
    }
    /*
       Try to make synchronous code.
        */
    inner_js = this.js_no_callbacks();
    /*
       If there were asynchronous statements, try again with asynchronous code. We don't bother in `else if`s because our parent `if` will do this for us.
        */
    if (this.callback !== current_callback && !(this.is_else_if)) {
      callback_counter = cb_counter;
      inner_js = this.js_callbacks();
    }
    return rv + inner_js;
  }

  /*
     `js_no_callbacks` generates synchronous code.
      */
  Grammar.IfStatement.prototype.js_no_callbacks = function () {
    var block_js, else_js, else_clause, ki$10, kobj$10;
    /*
       Pass any parent block callback, if one exists, down the tree.
        */
    this.block.callback = this.callback;
    /*
       Compile and indent the block.
        */
    block_js = indent(this.block.js() + this.block.js_closeout()) + '}';
    if (this.elses.length === 0) {
      block_js += '\n';
    }
    else_js = "";
    /*
       Compile any `else` or `else if` clauses.
        */
    kobj$10 = this.elses;
    for (ki$10 = 0; ki$10 < kobj$10.length; ki$10++) {
      else_clause = kobj$10[ki$10];
      else_clause.block.callback = this.callback;
      else_clause.block.original_callback = this.original_callback;
      else_js += " else";
      if ((else_clause.conditional != null)) {
        else_js += (" if (" + (else_clause.conditional.js()) + ")");
      }
      else_js += " {\n";
      else_js += indent(else_clause.block.js() + else_clause.block.js_closeout());
      else_js += '}\n';
    }
    return block_js + else_js;
  }

  /*
     `js_callbacks` generates asynchronous code.
      */
  Grammar.IfStatement.prototype.js_callbacks = function () {
    var block_js, else_clause, ki$11, kobj$11, else_js, ki$12, kobj$12, callback_js;
    /*
       We need a callback that branches use to exit. All branches must call this callback whether they are synchronous or asynchronous. This callback gets passed
        */
    this.callback = create_callback();
    this.block.callback = this.callback;
    this.block.original_callback = this.callback;
    /*
       Compile the block and any `else`s or `else if`s.
        */
    block_js = indent(this.block.js());
    kobj$11 = this.elses;
    for (ki$11 = 0; ki$11 < kobj$11.length; ki$11++) {
      else_clause = kobj$11[ki$11];
      /*
         We pass callback trackers down the tree.
          */
      else_clause.block.callback = this.callback;
      else_clause.block.original_callback = this.callback;
      else_clause.block_js_header = " else ";
      if ((else_clause.conditional != null)) {
        else_clause.block_js_header += ("if (" + (else_clause.conditional.js()) + ") ");
      }
      else_clause.block_js_header += "{\n";
      else_clause.block_js = indent(else_clause.block.js());
    }
    block_js += indent(this.block.js_closeout()) + '}';
    if (this.elses.length === 0) {
      block_js += '\n';
    }
    else_js = "";
    /*
       We construct the JavaScript output using the headers we made above, the block JavaScript, and by calling `js_closeout` to get any callback headers and exit callbacks.
        */
    kobj$12 = this.elses;
    for (ki$12 = 0; ki$12 < kobj$12.length; ki$12++) {
      else_clause = kobj$12[ki$12];
      else_js += else_clause.block_js_header + else_clause.block_js + indent(else_clause.block.js_closeout()) + '}';
    }
    /*
       Make sure we include the `async` snippet since we're about to use it.
        */
    use_snippets['async'] = snippets['async'];
    /*
       We wrap any code after this `if` statement in our callback function. We also add a call to this function in case we get out of the `if` statement synchronously.
        */
    callback_js = ("return k$async(" + (this.callback) + "," + (kthis()) + ");\n");
    callback_js += ("function " + (this.callback) + "() {\n");
    callback_js += indent(render_try_blocks());
    /*
       Tell our parent block what function it is shoving code into.
        */
    this.parent_block.closeout_callback = this.original_callback;
    /*
       Generate a new callback for future if statements/for loops
        */
    create_callback();
    return block_js + else_js + '\n' + callback_js;
  }

  /*
     ### BlankStatement

     The simplest statement, and the most important. The most important line of code is the one you didn't write. Except in Kal, where `pass` is required to make an empty block.
      */
  Grammar.BlankStatement.prototype.js = function () {
    return '';
  }

  /*
     ### ForStatement

     `ForStatement`s are context dependent. When the `js` method is called, we actually don't know if there will be asynchronous code inside the loop block. We first try generating JavaScript assuming this is pure synchronous code using `js_no_callbacks`. If we detect asynchronous calls after code generation, we throw away those results and generate asynchronous code using `js_callbacks`.
      */
  Grammar.ForStatement.prototype.js = function () {
    var rv, iterator, terminator, loop_counter, initial_val, incrementor, loop_block_js, from_val, to_val, increment;
    /*
       Save the current callback name. We use this to check if any asynchronous code got generated from our block.
        */
    this.callback = current_callback;
    /*
       Pass the `in_loop` and `in_conditional` variables down the tree. These are used in block closouts to decide if we need to call a callback.
        */
    this.loop_block.in_loop = true;
    this.loop_block.in_conditional = this.in_conditional;
    /*
       Generate variables for an iterator, terminator (end of loop check), and a loop counter (used for asynchronous calls to count the number of callbacks required). The `initial_val` and `incrementor` variables are only used in `for x in a to b`-style loops.
        */
    rv = "";
    iterator = ("ki$" + for_count);
    terminator = ("kobj$" + for_count);
    loop_counter = ("klc$" + for_count);
    initial_val = ("kiv$" + for_count);
    incrementor = ("kinc$" + for_count);
    for_count += 1;
    /*
       Declare the iterant variable (the `x` from `for x in y`).
        */
    if (!((scope[this.iterant.value] != null))) {
      scope[this.iterant.value] = 'closures ok';
    }
    if (!((this.index_var == null) || (scope[this.index_var.value] != null))) {
      scope[this.index_var.value] = 'closures ok';
    }
    /*
       Try generating synchronous code, fall back to asynchronous code if we detect something asynchronous in our block.
        */
    loop_block_js = this.loop_block.js() + this.loop_block.js_closeout();
    if (this.callback !== current_callback) {
      return this.js_callbacks(iterator, terminator, loop_counter);
    } else {
      /*
         `for ... in ...` loops just loop from element 0 of the iterable (the `y` in `for x in y`) to element `iterable.length - 1`. We assign the element to the user supplied `iterant` (`x`) at  the beginning of each iteration.
          */
      if (this.type.value === 'in') {
        if ((this.iterable_to != null)) {
          from_val = this.iterable.number_constant();
          to_val = this.iterable_to.number_constant();
          if ((to_val != null) && (from_val != null)) {
            increment = (to_val > from_val) ? '++' : '--';
            rv += ("for (" + (this.iterant.value) + " = " + from_val + "; " + (this.iterant.value) + " <= " + to_val + "; " + (this.iterant.value) + "" + increment + ") {\n");
          } else {
            scope[terminator] = 'no closures';
            scope[initial_val] = "no closures";
            scope[incrementor] = "no closures";
            rv += ("" + initial_val + " = " + (this.iterable.js()) + "\n");
            rv += ("" + terminator + " = " + (this.iterable_to.js()) + "\n");
            rv += ("" + incrementor + " = " + initial_val + " < " + terminator + " ? 1 : -1;\n");
            rv += ("for (" + (this.iterant.value) + " = " + initial_val + "; " + terminator + " > " + initial_val + " ? " + (this.iterant.value) + " <= " + terminator + " : " + (this.iterant.value) + " >= " + terminator + "; " + (this.iterant.value) + " += " + incrementor + ") {\n");
          }
        } else {
          /*
             Declare the iterator and terminator.
              */
          scope[iterator] = 'no closures';
          scope[terminator] = 'no closures';
          rv += ("" + terminator + " = " + (this.iterable.js()) + ";\n");
          rv += ("for (" + iterator + " = 0; " + iterator + " < " + terminator + ".length; " + iterator + "++) {\n");
          rv += ("  " + (this.iterant.value) + " = " + terminator + "[" + iterator + "];\n");
          if ((this.index_var != null)) {
            rv += ("  " + (this.index_var.value) + " = " + iterator + ";\n");
          }
        }
      } else {
        /*
           `for ... of ...` loops loop through each property of the iterable (the `y` in `for x of y`) in whatever order. Luckily the JavaScript `in` operator does almost exactly this. We do have to skip properties that don't meet the `hasOwnProperty` criterion since these are inherited. We assign the element to the user supplied `iterant` (`x`) at the beginning of each iteration.
            */
        scope[iterator] = 'no closures';
        scope[terminator] = 'no closures';
        rv += ("" + terminator + " = " + (this.iterable.js()) + ";\n");
        rv += ("for (" + (this.iterant.value) + " in " + terminator + ") {\n");
        rv += ("  if (!" + terminator + ".hasOwnProperty(" + (this.iterant.value) + ")) {continue;}\n");
      }
      rv += indent(loop_block_js);
      rv += "}\n";
    }
    /*  */
    return rv;
  }

  /*
     `js_callbacks` generates asynchronous code for parallel and series `for` loops.
      */
  Grammar.ForStatement.prototype.js_callbacks = function (iterator, terminator, loop_counter) {
    var rv, loop_callback;
    rv = "";
    /*  */
    if ((this.iterable_to != null)) {
      throw new Error("asynchronous for ... to ... loops are not supported");
    }
    /*
       The `execution_style` actually matters for asynchronous loops. The default, if none is specified, is `series`.
        */
    if (((this.execution_style != null) ? this.execution_style.value : void 0) === 'parallel') {
      /*
         The `loop_callback` is called after each iteration of the loop. It uses `loop_counter` to detect when all iterations have called back. `callback` is used after `loop_callback` decides the loop is done.
          */
      loop_callback = create_callback();
      this.callback = create_callback();
      /*
         Pass the loop callback down the tree.
          */
      this.loop_block.callback = loop_callback;
      this.loop_block.original_callback = loop_callback;
      /*
         We do need a special stack for parallel for loop callbacks so that `catch` blocks know where to call back to.
          */
      parfor_cb_stack.push(parfor_cb);
      parfor_cb = loop_callback;
      /*
         Declare the iterator and terminator.
          */
      scope[iterator] = 'no closures';
      scope[terminator] = 'no closures';
      /*
         We wrap the loop block in a function because we want a unique scope for each call to the loop body. Otherwise, you could wind up with the following situation:
         <pre>
         for parallel x in y
         wait for update(x)
         wait for save(x)
         </pre>
         If x was part of the current scope, it could change between the `wait for`s if another iteration of the loop was executing. By making `x` an argument to a function, it creates a unique scope for each loop iteration.
          */
      rv += ("(function (" + loop_counter + ") {\n");
      rv += ("  " + terminator + " = " + (this.iterable.js()) + ";\n");
      /*
         Handle `in` and `of` operators like we do in synchronous loops.
          */
      if (this.type.value === 'in') {
        rv += ("  for (" + iterator + " = 0; " + iterator + " < " + terminator + ".length; " + iterator + "++) {\n");
      } else {
        rv += ("  for (" + iterator + " in " + terminator + ") {\n");
      }
      /*
         Increment the number of calls back we are expecting.
          */
      rv += ("      " + loop_counter + "++;\n");
      /*
         Async call a wrapper function for the loop block. This way all iterations start on the next tick.
          */
      rv += ("      k$async(function (" + (this.iterant.value));
      if ((this.index_var != null)) {
        rv += (", " + (this.index_var.value));
      }
      rv += ") {\n";
      rv += multi_indent(render_try_blocks(), 3);
      rv += multi_indent(this.loop_block.js() + this.loop_block.js_closeout(), 3);
      rv += multi_indent(render_catch_blocks(), 3);
      if (this.type.value === 'in') {
        rv += ("    }," + (kthis()) + ",[" + terminator + "[" + iterator + "]," + iterator + "]);\n");
      } else {
        rv += ("    }," + (kthis()) + ",[" + iterator + "]);\n");
      }
      rv += "  }\n";
      /*
         Ensure the async snippet is present.
          */
      use_snippets['async'] = snippets['async'];
      /*
         Call back to the loop callback once all iterations are accounted for. This decrements the initial seed of 1 that we gave to the loop counter and ensures that the loop counter doesn't hit zero until all the iterations are at least started.
          */
      rv += ("  return " + loop_callback + ".apply(" + (kthis()) + ");\n");
      /*
         Once the loop counter is zero, the loop callback calls the actual callback.
          */
      rv += ("  function " + loop_callback + "() {\n");
      rv += ("    if (--" + loop_counter + " == 0) return k$async(" + (this.callback) + "," + (kthis()) + ");\n");
      rv += "  }\n";
      rv += "})(1);\n";
      rv += "return;\n";
      rv += ("function " + (this.callback) + "() {\n");
      rv += indent(render_try_blocks());
      this.parent_block.closeout_callback = this.original_callback;
      parfor_cb = parfor_cb_stack.pop();
    } else {
      /*
         Series for loops are the default.


         Create the callback for the end of the loop. We can safely use `k$lcb` as the loop callback here since we using it inside a new function.
          */
      this.callback = create_callback();
      this.loop_block.callback = "k$lcb";
      this.loop_block.original_callback = "k$lcb";
      /*
         Make sure we have the async snippet.
          */
      use_snippets['async'] = snippets['async'];
      /*
         For `for series ... in ...` loops, we call the `loop_counter` function with the index 0, our iterable, and the value of the iterant to kick off the loop.
          */
      if (this.type.value === 'in') {
        rv += ("return k$async(" + loop_counter + "," + (kthis()) + ",[0," + (this.iterable.js()) + "," + (this.iterable.js()) + "[0]]);\n");
      } else {
        /*
           For `for series ... of ...` loops, we fill in `terminator` with an array of `iterable`'s  properties, then kick off `loop_counter` with an index 0, the array of properties, and the first element.
            */
        scope[terminator] = 'no closures';
        scope[iterator] = 'no closures';
        rv += ("" + terminator + " = [];\n");
        rv += ("for (" + iterator + " in " + (this.iterable.js()) + ") {if ((" + (this.iterable.js()) + ").hasOwnProperty(" + iterator + ")) {" + terminator + ".push(" + iterator + ")};}\n");
        rv += ("return " + loop_counter + ".apply(" + (kthis()) + ",[0," + terminator + "," + terminator + "[0]]);\n");
      }
      /*
         The loop counter function first checks if the index variable is greater than the terminator length - 1. If so we are done looping and can execute the callback. Otherwise, we execute the loop block and queue up another call to `loop_counter`. We render `try`/`catch` blocks inside loop couner and our callback. function to make sure they get carried through.
          */
      rv += ("function " + loop_counter + "(k$i,k$obj," + (this.iterant.value) + ") {\n");
      if (!((this.index_var == null))) {
        rv += ("  " + (this.index_var.value) + " = k$i;\n");
      }
      rv += render_try_blocks();
      rv += "  k$i++;\n";
      rv += ("  var k$lcb = function () {if (k$i < k$obj.length) return " + loop_counter + ".apply(" + (kthis()) + ",[k$i,k$obj,k$obj[k$i]]); else return k$async(" + (this.callback) + "," + (kthis()) + ");};\n");
      rv += indent(this.loop_block.js() + this.loop_block.js_closeout());
      rv += indent(render_catch_blocks());
      rv += "}\n";
      /*
         Our callback function, which we pass up to the parent block.
          */
      rv += ("function " + (this.callback) + "() {\n");
      rv += indent(render_try_blocks());
      this.parent_block.closeout_callback = this.original_callback;
    }
    return rv;
  }

  /*
     ### WhileStatement

     `WhileStatement`s are context dependent. When the `js` method is called, we actually don't know if there will be asynchronous code inside the loop block. We first try generating JavaScript assuming this is pure synchronous code using `js`. If we detect asynchronous calls after code generation, we throw away those results and generate asynchronous code using `js_callbacks`.
      */
  Grammar.WhileStatement.prototype.js = function () {
    var rv;
    /*
       Mark the loop and conditional flags for our child block.
        */
    this.block.in_loop = true;
    this.block.in_conditional = this.in_conditional;
    /*
       `until` is the same as `while` except that we invert the conditional.
        */
    if (this.specifier.value === 'until') {
      rv = ("while (!(" + (this.expr.js()) + ")) {\n");
    } else {
      rv = ("while (" + (this.expr.js()) + ") {\n");
    }
    rv += indent(this.block.js() + this.block.js_closeout());
    rv += "}\n";
    /*
       If asynchronous code was detected, we throw away `rv` and generate an async while loop.
        */
    if (this.callback !== current_callback) {
      return this.js_callbacks();
    } else {
      return rv;
    }
  }

  /*  */
  Grammar.WhileStatement.prototype.js_callbacks = function () {
    var rv, while_wrapper, expr_js;
    /*
       Asynchronous while loops do actually need a loop counter and a callback for when the loop is finished. We also need a loop callback that runs after each iteration.
        */
    rv = "";
    while_count += 1;
    while_wrapper = ("kw$" + while_count);
    this.callback = create_callback();
    this.block.callback = "k$lcb";
    this.block.original_callback = "k$lcb";
    /*
       Make sure to include the async snippet.
        */
    use_snippets['async'] = snippets['async'];
    /*
       We wrap the code block in a function that runs for each iteration.
        */
    rv += ("return " + while_wrapper + "();\n");
    rv += ("function " + while_wrapper + "() {\n");
    /*
       `try` and `catch` blocks need to be reinserted in the new function context.
        */
    rv += render_try_blocks();
    /*
       We finish the iteration by calling back to `k$lcb` and checking the conditional (or it's inverse if appropriate). If the check passes we do an async call to `while_wrapper` again. This puts it on the next tick to avoid super-deep recursion depth.
        */
    expr_js = this.expr.js();
    if (this.specifier.value === 'until') {
      expr_js = ("!(" + expr_js + ")");
    }
    rv += ("  var k$lcb = function () {if (" + expr_js + ") return " + while_wrapper + ".apply(" + (kthis()) + "); else return k$async(" + (this.callback) + "," + (kthis()) + ");};\n");
    rv += indent(this.block.js() + this.block.js_closeout());
    rv += indent(render_catch_blocks());
    rv += "}\n";
    /*
       Code after this loop is wrapped with a callback wrapper and we re-render try blocks. We tell our parent block what callback it is writing code to.
        */
    rv += ("function " + (this.callback) + "() {\n");
    rv += indent(render_try_blocks());
    this.parent_block.closeout_callback = this.original_callback;
    return rv;
  }

  /*
     ### LoopControlStatement

     This is a very simple class to allow us to use the `break` and `continue` keywords.
      */
  Grammar.LoopControlStatement.prototype.js = function () {
    return ("" + (this.control.value) + ";\n");
  }

  /*
     ### Block

     `Block`s can be standard blocks, like in an `if` statement, or a derived class, like `BlockWithoutIndent`. A `Block` is an ordered list of statements. The `js` function generates JavaScript for the block's statements. The `js_closeout` function closes out any lingering callback functions and `catch` blocks in case one of the block's statements inserted a callback function.
      */
  Grammar.Block.prototype.js = function () {
    var previous_cb, rv, statement, sourceMapItem, statement_js, ki$13, kobj$13;
    /*
       We set the callback to the current one unless a parent node has already specified a callback to use. We save this callback to check later if any asynchronous code was generated.
        */
    if (!((this.callback != null))) {
      this.callback = current_callback;
    }
    if (!((this.original_callback != null))) {
      this.original_callback = current_callback;
    }
    previous_cb = current_callback;
    /*
       `callbacks` is a list of callbacks we need to close out (add a trailing `}` to `catch` blocks) in `js_closeout`.
        */
    this.callbacks = [];
    rv = '';
    this.indent_level = 0;
    /*
       We compile each statement and pass through callback information along with conditional and loop flags.
        */
    kobj$13 = this.statements;
    for (ki$13 = 0; ki$13 < kobj$13.length; ki$13++) {
      statement = kobj$13[ki$13];
      /*  */
      statement.parent_block = this;
      statement.callback = this.callback;
      statement.original_callback = this.original_callback;
      statement.in_conditional = this.in_conditional;
      statement.in_loop = this.in_loop;
      /*
         Source Map
         https://github.com/mozilla/source-map#with-sourcemapgenerator-low-level-api
          */
      if (inNode) {
        sourceMapItem = {generated: {line: js_line_number, column: 1}, original: {line: statement.line || 1, column: 1}, name: "a"};
        //command.addMapping(sourceMapItem);
      }
      /*  */
      statement_js = statement.js();
      /*
         Code is indented to look pretty, trying to avoid multiple newlines.
          */
      if (statement_js[0] === '\n' && (rv.slice(-2) === '\n\n' || rv.length === 0)) {
        statement_js = multi_indent(statement_js.slice(1), this.indent_level);
      } else {
        statement_js = multi_indent(statement_js, this.indent_level);
      }
      /* end if
          */
      rv += statement_js;
      js_line_number += statement_js.split("\n").length; /* count lines */
      /*
         We need to indent if this statement started a new callback function. We also save the new callback.
          */
      if (current_callback !== previous_cb) {
        this.indent_level += 1;
        this.callbacks.unshift(this.callback);
        this.callback = current_callback;
        previous_cb = current_callback;
      }
    }
    /* end if

       end for

       If there is any asynchronous code, we need to handle the case where we have an implied `return` (the function ends without an explicit `return` statement). If code execution gets to the end of the function or task, we check for a `k$next` variable and call back to it. We clear out `k$next` before doing this to avoid ever calling back twice.
        */
    if (this.callbacks.length > 0) {
      if ((scope['k$next'] != null)) {
        rv += multi_indent("var k$done = (typeof k$next == 'function') ? k$next : function () {}; k$next=function () {}; return k$done();\n", this.indent_level + 1);
      }
    }
    return rv;
  }

  /*
     The closeout method calls the block's `closeout_callback` if it exists. This ensures all branches of `if` statements call back to the `if` block's callback.
      */
  Grammar.Block.prototype.js_closeout = function () {
    var rv, callback, ki$14, kobj$14;
    rv = "";
    if ((this.closeout_callback != null) && this.callbacks.length !== 0 && (this.in_conditional || this.in_loop)) {
      use_snippets['async'] = snippets['async'];
      rv += multi_indent(("return k$async(" + (this.closeout_callback) + "," + (kthis()) + ");\n"), this.indent_level);
    }
    /*
       We also rerender any `catch` blocks at the end of each callback function.
        */
    kobj$14 = this.callbacks;
    for (ki$14 = 0; ki$14 < kobj$14.length; ki$14++) {
      callback = kobj$14[ki$14];
      rv += multi_indent(render_catch_blocks(), this.indent_level);
      rv += multi_indent("}\n", this.indent_level - 1);
    }
    return rv;
  }

  Grammar.Statement.prototype.js_closeout = function () {
      return ''; // '/* Grammar.Statement.prototype.js_closeout */';
  }
  /*
     ### ParenExpression

     A `ParenExpression` is just a normal expression surrounded by parentheses.
      */
  Grammar.ParenExpression.prototype.js = function () {
    return ("(" + (this.expr.js()) + ")");
  }

  /*
     ### IndexExpression

     An `IndexExpression` is an accessor for accessing an array index or object property. It works the same as JavaScript's `[]` operator so we just pass it through.
      */
  Grammar.IndexExpression.prototype.js = function () {
    return ("[" + (this.expr.js()) + "]");
  }

  /*
     As an accessor, it can have an exisential check like `a?[1]`, so we support the `js_existence` method. This method just passes the arguments to `check_existence_wrapper` if the `IndexExpression` has an exisential chcek.
      */
  Grammar.IndexExpression.prototype.js_existence = function (accessor, undefined_unary, invert) {
    if (this.exisential) {
      return check_existence_wrapper(accessor, undefined_unary, invert);
    } else {
      return '';
    }
  }

  /*
     ### RangeExpression

     A `RangeExpression` is a range like `1 to 4`. It is only used from within a `ListExpression`, so its JavaScript output is just the appropriate list.
      */
  Grammar.RangeExpression.prototype.js = function () {
    use_snippets['range'] = snippets['range'];
    return ("k$range(" + (this.from_expr.js()) + "," + (this.to_expr.js()) + ")");
  }

  /*
     ### ListExpression

     A `ListExpression` is a definition of a list like `[1, a, 2+3]`. We just pass this through to JavaScript.
      */
  Grammar.ListExpression.prototype.js = function () {
    var rv, item, ki$15, kobj$15;
    if ((this.comprehension == null)) {
      rv = [];
      kobj$15 = this.items;
      for (ki$15 = 0; ki$15 < kobj$15.length; ki$15++) {
        item = kobj$15[ki$15];
        rv.push(item.js());
      }
      rv = rv.join(', ');
      return ("[" + rv + "]");
    } else {
      return this.comprehension.js();
    }
  }

  /*
     ### ListComprehension

     List comprehensions support the `[x*x for x in [1,2,3]]` syntax. We just use the `k$comprl` function ("array list comprehension" snippet) for this. We pass this snippet the iterable and a function to perform on each item.
      */
  Grammar.ListComprehension.prototype.js = function () {
    var rv;
    use_snippets['array list comprehension'] = snippets['array list comprehension'];
    scope[this.iterant.value] = 'closures ok';
    rv = ("k$comprl(" + (this.iterable.js()) + ",function (k$i) {" + (this.iterant.value) + " = k$i; return " + (this.iter_expr.js()) + ";}");
    if ((this.conditional != null)) {
      rv += (",function (" + (this.iterant.value) + ") {return " + (this.conditional.js_bool()) + ";}");
    }
    rv += ")";
    return rv;
  }

  /*
     ### ObjectComprehension

     Object comprehensions support the `[x*x for x of {a:1,b:2}]` syntax and the `property`/`value` keywords. We just use the `k$compro` function ("object list comprehension" snippet) for this. We pass this snippet the iterable and a function to perform on each key/value pair.
      */
  Grammar.ObjectComprehension.prototype.js = function () {
    var init, rv;
    use_snippets['object list comprehension'] = snippets['object list comprehension'];
    init = "";
    /*
       We also assign to the `property_iterant`, `value_iterant`, or both depending on which one was specified. This supports the syntaxes `[k for k of obj]`, `[k for property k in obj]`, `[v for value v in obj]`, and `[k + v for property k with value v in obj]`.
        */
    if ((this.property_iterant != null)) {
      scope[this.property_iterant.value] = 'closures ok';
      init += ("" + (this.property_iterant.value) + " = k$p;");
    }
    if ((this.value_iterant != null)) {
      scope[this.value_iterant.value] = 'closures ok';
      init += ("" + (this.value_iterant.value) + " = k$v;");
    }
    rv = ("k$compro(" + (this.iterable.js()) + ",function (k$p,k$v) {" + init + " return " + (this.iter_expr.js()) + ";}");
    if ((this.conditional != null)) {
      rv += (",function (k$p,k$v) {" + init + " return " + (this.conditional.js_bool()) + ";}");
    }
    rv += ")";
    return rv;
  }

  /*
     ### MapItem

     A `MapItem` is a single item in an object definition. We pass this straight through to JavaScript. Note that this also covers the subclass `ImplicitMapItem`.
      */
  Grammar.MapItem.prototype.js = function () {
    return ("" + (this.key.value) + ": " + (this.val.js()));
  }

  /*
     ### MapExpression

     A `MapExpression` is an object definition using key/value pairs like `{a:1,b:2}`. JavaScript supports this syntax, so we just pass it through. Note that this also supports the subclass `ImplicitMapExpression` which allows multi-line definitions without `{}`s.
      */
  Grammar.MapExpression.prototype.js = function () {
    var rv, item, ki$16, kobj$16;
    rv = [];
    kobj$16 = this.items;
    for (ki$16 = 0; ki$16 < kobj$16.length; ki$16++) {
      item = kobj$16[ki$16];
      rv.push(item.js());
    }
    rv = rv.join(', ');
    return ("{" + rv + "}");
  }

  /*
     ### FunctionExpression

     `FunctionExpression`s are function definitions, but like JavaScript they evaluate to a `function` object. There are several "flavors" of functions that each have their own utility generator function, including constructors, class members, and regular functions/tasks.
      */
  Grammar.FunctionExpression.prototype.js = function () {
    var rv;
    /*
       If this is a task (asynchronous), we set the callback to the `k$next` variable. This will get populated later with the last argument passed into the function.
        */
    if (this.specifier.value === 'task') {
      this.callback = 'k$next';
    }
    /*
       For late binding classes, we pretend to be in the process of defining the owner class by pushing it to the stack. No support for late binding constructors at this time.
        */
    if ((this.name != null) && (this.bind_to != null)) {
      if (this.specifier.value === 'method' && this.name.value === 'initialize') {
        throw new Error("late binding for constructors is not supported");
      } else {
        push_class();
        class_def = {name: this.bind_to.js(), code: '', args: [], has_constructor: false};
        rv = this.js_class_member();
        pop_class();
        return rv;
      }
    } else if (class_defs.length > 0 && (this.name != null)) {
      /*
         If this is a member of a class (including a late binding), we run `js_constructor` if its name is `initialize`, and `js_class_member` for normal members. `js_constructor` will dump this class's code in the class definition. `js_class_member` will ensure this function gets added to the class's prototype.

         is a member function/method */
      if (this.specifier.value === 'method' && this.name.value === 'initialize') {
        class_def.code += this.js_constructor();
        return "";
      } else {
        return this.js_class_member();
      }
    }
     else {
      /*
         Normal functions go straight to `js_bare_function`.
          */
      return this.js_bare_function();
    }
  }

  /*
     Bare functions just get the `function` header and an optional name before generating the body.
      */
  Grammar.FunctionExpression.prototype.js_bare_function = function () {
    var rv;
    rv = "function ";
    if ((this.name != null)) {
      rv += this.name.value;
    }
    return rv + this.js_body();
  }

  /*
     Class members get assigned to the class's prototype if they are methods/tasks. Regular function members are just assigned as a member of the class variable.
      */
  Grammar.FunctionExpression.prototype.js_class_member = function () {
    var rv;
    if (this.specifier.value === 'method' || this.specifier.value === 'task') {
      rv = ("" + (class_def.name) + ".prototype." + (this.name.value) + " = function ");
    } else {
      rv = ("" + (class_def.name) + "." + (this.name.value) + " = function ");
    }
    return rv + this.js_body();
  }

  /*
     Constructors are handled a little differently. Since JavaScript "classes" are really just functions, the constructor code has to wind up in a function with the same name as the class. We set the approprate flags for the arguments to the current `class_def`.

     Note: The parameter to `js_body` appears to be unused?
      */
  Grammar.FunctionExpression.prototype.js_constructor = function () {
    var rv, argument;
    class_def.has_constructor = true;
    rv = ("function " + (class_def.name));
    class_def.args = [];
    class_def.arguments = k$comprl(this.arguments,function (k$i) {argument = k$i; return argument;});
    rv += this.js_body(class_def.args);
    ((this.callback != null)) ? class_def.arguments.push(this.callback) : void 0;
    return rv;
  }

  /*
     `js_body` is the worker method that generates the function body.
      */
  Grammar.FunctionExpression.prototype.js_body = function () {
    var rv, default_arg_js, arg_names, argument, arg_name, ki$17, kobj$17, block_code, ki$18, kobj$18;
    rv = "";
    default_arg_js = "";
    /*
       Start a new scope for this function.
        */
    push_scope();
    /*
       If this is a task (has a callback), define `k$next` (local only, don't want this to propagate to lower scopes) and `k$this` (OK for closures).
        */
    if ((this.callback != null)) {
      scope['k$next'] = 'no closures';
      scope['k$this'] = 'closures ok';
    }
    /*
       We create the argument array here by looking through the argument names.
        */
    arg_names = k$comprl(this.arguments,function (k$i) {argument = k$i; return ((argument.name != null) ? argument.name.value : void 0) || argument;});
    kobj$17 = arg_names;
    for (ki$17 = 0; ki$17 < kobj$17.length; ki$17++) {
      arg_name = kobj$17[ki$17];
      scope[arg_name] = 'argument';
    }
    /*
       Generate the block code. Note: the argument to `block.js` appears unused?
        */
    block_code = this.block.js(true) + this.block.js_closeout();
    /*
       We assign default values to arguments if necessary. Normally we just do a `null` check on arguments to see if they need to be seeded with default values. For tasks, we also need to make sure they aren't equal to `k$next` (the callback argument) since it's always the last argument, even if some are missing.
        */
    kobj$18 = this.arguments;
    for (ki$18 = 0; ki$18 < kobj$18.length; ki$18++) {
      argument = kobj$18[ki$18];
      if ((argument.default != null)) {
        default_arg_js += ("if (" + (argument.name.value) + " == null");
        if ((this.callback != null)) {
          default_arg_js += (" || " + (argument.name.value) + " == k$next");
        }
        default_arg_js += (") " + (argument.name.value) + " = " + (argument.default.js()) + ";\n");
      }
    }
    /*
       For async code, we seed `k$next` with the last argument that is a function using the `k$getcb` ("get callback") snippet. We also save `this` into `k$this`.

       Async functions get wrapped in a `try` block so that we can catch errors and forward them to our callback.
        */
    if ((this.callback != null)) {
      use_snippets['async'] = snippets['async'];
      use_snippets['get callback'] = snippets['get callback'];
      block_code = ("var k$next = k$getcb(arguments);\nk$this = this;\n" + default_arg_js + "try {\n") + indent(block_code);
    } else {
      block_code = default_arg_js + block_code;
    }
    /*
       We pop the scope, which generates `var` definitions as necessary. We pass `no` for the `wrap` argument because we do our own function wrapping here.
        */
    rv += indent(pop_scope(block_code, false));
    /*
       This `catch` block takes care of any uncaught errors from a task. If an error is caught here, we call back to `k$next` with the error as the first and only argument. If `k$next` is another task, this will cause it to throw.
        */
    if ((this.callback != null)) {
      rv += "  } catch (k$err) {if (k$next) {return k$async(k$next,k$this,[k$err]);} else {throw k$err;}}\n";
      rv += "  return k$next ? k$async(k$next,k$this) : void 0;\n";
    }
    /*
       We then prepend the argument code that we generated previously.
        */
    rv = ("(" + (arg_names.join(', ')) + ") {\n" + rv + "}");
    return rv;
  }

  /*
     ### FunctionCall

     `FunctionCall` is an accessor that calls a function. We generate JavaScript for each expression in the argument list and just pass it through to JavaScript.
      */
  Grammar.FunctionCall.prototype.js = function (as_list) {
    var rv, argument, ki$19, kobj$19;
    rv = [];
    kobj$19 = this.arguments;
    for (ki$19 = 0; ki$19 < kobj$19.length; ki$19++) {
      argument = kobj$19[ki$19];
      rv.push(argument.js());
    }
    ((this.callback_name != null)) ? rv.push(this.callback_name) : void 0;
    rv = rv.join(', ');
    /*
       `as_list` is currently unused (always false). Note: remove this?
        */
    if (as_list) {
      return ("[" + rv + "]");
    } else {
      return ("(" + rv + ")");
    }
  }

  /*
     Function calls can have exisential checks (`a?(1)`) since they are accessors.
      */
  Grammar.FunctionCall.prototype.js_existence = function (accessor, undefined_unary, invert) {
    if (this.exisential) {
      return check_existence_wrapper(accessor, undefined_unary, invert);
    } else {
      return '';
    }
  }

  /*
     ### FunctionCallArgument

     `FunctionCallArgument` is a wrapper for an expression in a function call argument list.
      */
  Grammar.FunctionCallArgument.prototype.js = function () {
    return this.val.js();
  }

  /*
     ### ClassDefinition

     Classes contain a code block with function, method, and task definitions.
      */
  Grammar.ClassDefinition.prototype.js = function () {
    var block_code, rv;
    /*
       For the class definition, we start a new scope and class and populate the `class_def` global.
        */
    push_scope();
    push_class();
    class_def.name = this.name.value;
    class_def.parent = ((this.parent != null) ? this.parent.value : void 0);
    block_code = this.block.js() + this.block.js_closeout();
    block_code = pop_scope(block_code, false);
    rv = '\n' + class_def.code;
    if ((class_def.code != null) !== '') {
      rv += '\n';
    }
    /*
       If there was no `initialize` method defined, we create a function with the class name. It calls the parent constructor if there is a parent. If the user does define an `initialize` method, it will generate this for us.
        */
    if (!(class_def.has_constructor)) {
      rv += ("function " + (class_def.name) + "() {\n");
      if ((this.parent != null)) {
        rv += ("  return " + (this.parent.value) + ".prototype.constructor.apply(this,arguments);\n");
      }
      rv += "}\n";
    }
    /*
       Use the inheritance snippet if we have a parent class.
        */
    if ((this.parent != null)) {
      rv += ("__extends(" + (this.name.value) + "," + (this.parent.value) + ");\n\n");
      use_snippets['inherits'] = snippets['inherits'];
    } else {
      rv += '\n';
    }
    rv += block_code;
    pop_class();
    return rv;
  }

  /*
     ### TryCatch

     `TryCatch` blocks are context dependent. In synchronous contexts, they are very similar to JavaScript equivalents. In asynchronous contexts, things get very complicated because we need to redefine the error handling code every time we generate a new callback. As a result, we keep a `try_block_stack` so that we can regenerate error handlers whenever we make a new scope.
      */
  Grammar.TryCatch.prototype.js = function () {
    var rv;
    /*
       Add this object to the stack and pass conditional and loop status down the tree.
        */
    try_block_stack.unshift(this);
    this.try_block.in_conditional = true;
    this.try_block.in_loop = this.in_loop;
    if (!((this.original_callback != null))) {
      this.original_callback = this.callback;
    }
    /*
       Try making synchronous code.
        */
    rv = this.js_no_callbacks();
    /*
       If that failed, we fall back to asynchronous code generation.
        */
    if (this.callback !== current_callback) {
      this.callback = create_callback();
      this.closeout_callback = this.callback;
      rv = this.js_callbacks();
    } else {
      /*
         For synchronous code, we don't need to keep this object on the stack since it is closed out.
          */
      try_block_stack.shift();
    }
    return rv;
  }

  /*
     For synchronous code, we use the wrapper methods to generate code. We need to set `original_callback` to our original callback (whatever the current callback is) since we don't have a callback of our own.
      */
  Grammar.TryCatch.prototype.js_no_callbacks = function () {
    var rv;
    rv = this.js_wrapper_try();
    this.try_block.original_callback = this.original_callback;
    rv += multi_indent(this.try_block.js() + this.try_block.js_closeout(), try_block_stack.length);
    rv += this.js_wrapper_catch();
    return rv;
  }

  /*
     For asynchronous code, we still use the wrappers but start a new closeout callback that all branches need to eventually call. We pass this up to the parent block so it knows what callback it is inserting code into.
      */
  Grammar.TryCatch.prototype.js_callbacks = function () {
    var rv;
    rv = this.js_wrapper_try();
    this.try_block.original_callback = this.callback;
    rv += multi_indent(this.try_block.js() + this.try_block.js_closeout(), try_block_stack.length);
    rv += this.js_wrapper_catch();
    rv += ("function " + (this.callback) + "() {\n");
    try_block_stack.shift();
    rv += indent(render_try_blocks());
    this.parent_block.closeout_callback = this.original_callback;
    return rv;
  }

  /*  */
  Grammar.TryCatch.prototype.js_wrapper_try = function () {
    var rv;
    rv = "try {\n";
    return rv;
  }

  /*
     `js_wrapper_catch` generates catch blocks and associated code. It is meant to be called multiple times (once each time the `try`/`catch` stack is regenerated for a callback).
      */
  Grammar.TryCatch.prototype.js_wrapper_catch = function () {
    var rv;
    /*
       This is a bit of a hack until we support catch callbacks. We mark `in_catch` on the top try block so that the `WaitForStatement` will fail to generate here. `wait for`s in catch blocks are not yet supported.
        */
    if ((try_block_stack[0] != null)) {
      try_block_stack[0].in_catch = true;
    }
    /*
       Close the `try` block.
        */
    rv = "}";
    /*
       If the user actually specified a `catch` block (remember they are optional in Kal), generate the code for that block. The identifier name is optional in Kal but not JavaScript, so we just use `k$e` to throw the value away if it's unneeded.
        */
    if ((this.catch_block != null)) {
      rv += (" catch (" + (((this.identifier != null) ? this.identifier.value : void 0) || 'k$e') + ") {\n");
      rv += indent(this.catch_block.js() + this.catch_block.js_closeout());
    } else {
      /*
         If no `catch` block was specified, we just make a blank one.
          */
      rv += " catch (k$e) {";
      if ((parfor_cb != null) || (this.closeout_callback != null)) {
        rv += '\n';
      }
    }
    /*
       Parallel `for` loops require that we call back to the `parfor_cb`, otherwise the loop will never finish.
        */
    if ((parfor_cb != null)) {
      use_snippets['async'] = snippets['async'];
      rv += indent(("return k$async(" + parfor_cb + "," + (kthis()) + ");\n"));
    } else if ((this.closeout_callback != null)) {
      /*
         Once complete, we need to call back to the closeout callback.
          */
      use_snippets['async'] = snippets['async'];
      rv += indent(("return k$async(" + (this.closeout_callback) + "," + (kthis()) + ");\n"));
    }
    rv += '}\n';
    /*
       Unhack to avoid `wait for`s in `catch` blocks.
        */
    if ((try_block_stack[0] != null)) {
      try_block_stack[0].in_catch = false;
    }
    return rv;
  }

  /*
     ### SuperStatement

     The `SuperStatement` calls the parent class's constructor on the current object.
      */
  Grammar.SuperStatement.prototype.js = function () {
    var rv;
    if ((class_def.parent == null)) {
      return "";
    }
    rv = ("" + (class_def.parent) + ".prototype.constructor.apply(" + (kthis()) + ",");
    if ((this.accessor != null)) {
      rv += this.accessor.js(true);
    } else {
      rv += "arguments";
    }
    rv += ");\n";
    return rv;
  }

  /*
     ### WaitForStatement

     `WaitForStatement`s generate new callbacks. They are always considered asynchronous code. This generator needs to be robust to being called multiple times since many parent objects will attempt to make synchronous code, then try again if they see a `wait for`.
      */
  Grammar.WaitForStatement.prototype.js = function () {
    var prefix, rv, number, tvalue_js, rv_block, arg_i, argument, ki$20, kobj$20, try_count;
    /*
       `wait for`s are not currently supported in `catch` blocks.
        */
    if (((try_block_stack[0] != null) ? try_block_stack[0].in_catch : void 0)) {
      throw new Error("wait fors not supported in catch blocks");
    }
    /*
       If this is a "bare" file, we can't use the `return` statement at the top level when executing callbacks.
        */
    prefix = (this.parent_block.bare) ? "" : "return ";
    /*
       Make the new callback identifier. Most parents that care about context check for the side effect of this function.
        */
    this.new_callback = create_callback();
    /*
       Standard `wait for`s have an r-value. `pause for`s (a subclass of this) do not have an r-value.
        */
    if ((this.rvalue != null)) {
      /*
         For `wait for`s, we set the `callback_args` to the l-values on the left side of the `wait for`. We do support multiple return values here. The `callback_name` field tells this `FunctionCall` which callback function to pass in as its last argument. This allows the `FunctionCall` generator method to generate a call to the task with an extra callback argument. Note: `me.rvalue.callback_args` appears to be unused?
          */
      this.rvalue.callback_args = this.lvalue;
      this.rvalue.accessors[this.rvalue.accessors.length - 1].callback_name = this.new_callback;
      rv = ("" + prefix + "" + (this.rvalue.js()) + ";\n");
    } else {
      /*
         In `pause for`s, we use constant folding since we multiply the time value by 1000 if possible. Because it looks better.
          */
      number = this.tvalue.number_constant();
      if ((number != null)) {
        tvalue_js = ("" + (number * 1000));
      } else {
        tvalue_js = this.tvalue.js();
        tvalue_js = ("(" + (this.tvalue.js()) + ")*1000");
      }
      /*
         Then we call `setTimeout` with our callback as the argument.
          */
      rv = ("" + prefix + "setTimeout(" + (this.new_callback) + "," + tvalue_js + ");\n");
    }
    /*
       If there is a tail conditional, we wrap the call in the conditional. Note: TODO - I think we need to pass that code on the second line to `conditional.js` as the false expression.
        */
    if ((this.conditional != null)) {
      rv = this.conditional.js(rv, false);
      rv += ("" + prefix + "" + (this.new_callback) + "();\n");
    }
    /*
       Next we compile our "block" which is actually a `BlockWithoutIndent`.
        */
    rv_block = "";
    /*
       We assign return values (arguments to the callback) to their appropriate variable names and declare the variables. If this is a `safe` wait for (`no_errors`), we don't need to add an error argument. This is used for "non-standard" functions like node's `http.get` which don't call back with error arguments.
        */
    arg_i = (this.no_errors) ? 0 : 1;
    kobj$20 = ((this.lvalue != null) ? this.lvalue.arguments : void 0) || [];
    for (ki$20 = 0; ki$20 < kobj$20.length; ki$20++) {
      argument = kobj$20[ki$20];
      rv_block += ("" + (argument.base.value) + " = arguments[" + arg_i + "];\n");
      if (!((scope[argument.base.value] != null))) {
        scope[argument.base.value] = 'closures ok';
      }
      arg_i += 1;
    }
    /*
       Pass down the conditional and loop states.
        */
    this.block.in_conditional = this.in_conditional;
    this.block.in_loop = this.in_loop;
    /*
       Now compile the block and wrap it in the callback `function` wrapper.
        */
    rv_block += this.block.js();
    rv += ("function " + (this.new_callback) + "() {\n");
    /*
       `try_count` is used to determine the indentation level. Note: TODO - it looks like the second line here does nothing `try_block` is not used anywhere.
        */
    try_count = try_block_stack.length + 1;
    if (((typeof try_block !== 'undefined' && try_block !== null))) {
      try_count += 1;
    }
    /*
       We render any currently used `try` blocks in the new function scope.
        */
    rv += indent(render_try_blocks());
    /*
       The first thing we do is throw any errors passed into the callback so the user can catch them with normal `try` blocks.
        */
    if (!(this.no_errors)) {
      rv += multi_indent("if (arguments[0] != null) throw arguments[0];\n", try_count);
    }
    /*
       Add the block code.
        */
    rv += multi_indent(rv_block, try_count);
    /*
       At the end of the block, call back to any required closeouts or implied returns.
        */
    if (this.in_conditional || this.in_loop) {
      use_snippets['async'] = snippets['async'];
      rv += multi_indent(("" + prefix + "k$async(" + (this.parent_block.original_callback) + "," + (kthis()) + ");\n"), this.block.indent_level + try_count);
    } else if (scope['k$next']) {
      use_snippets['async'] = snippets['async'];
      rv += multi_indent(("" + prefix + "k$next ? k$async(k$next," + (kthis()) + ") : void 0;\n"), this.block.indent_level + try_count);
    }
    /*
       Close out the function, generating `catch` blocks from the stack.
        */
    rv += this.block.js_closeout();
    return rv;
  }

  /*
     ### WaitForExpression

     A `WaitForExpression` is like a `WaitForStatement` except that it only occurs inside a `RunInParallelBlock`.
      */
  Grammar.WaitForExpression.prototype.js = function () {
    var rv_block, arg_i, argument, ki$21, kobj$21, rv;
    rv_block = "";
    /*
       Make a new callback.
        */
    this.new_callback = create_callback();
    /*
       If this is a `safe wait for`, we don't need an error argument in the callback. This is used for "non-standard" functions like node's `http.get` which don't call back with error arguments. This section generates code that assigns return values (arguments to our callback) to variables. We add these variables to the local scope.
        */
    arg_i = (this.no_errors) ? 0 : 1;
    kobj$21 = ((this.lvalue != null) ? this.lvalue.arguments : void 0) || [];
    for (ki$21 = 0; ki$21 < kobj$21.length; ki$21++) {
      argument = kobj$21[ki$21];
      rv_block += ("" + (argument.base.value) + " = arguments[" + arg_i + "];\n");
      if (!((scope[argument.base.value] != null))) {
        scope[argument.base.value] = 'closures ok';
      }
      arg_i += 1;
    }
    /*
       Note: TODO - I think this does nothing.
        */
    this.rvalue.callback_args = this.lvalue;
    /*
       We tell the r-value function call accessor to use our callback as the last argument.
        */
    this.rvalue.accessors[this.rvalue.accessors.length - 1].callback_name = this.new_callback;
    /*
       We add the function call code and any conditional wrapping as appropriate.
        */
    rv = ("" + (this.rvalue.js()) + ";\n");
    if ((this.conditional != null)) {
      rv = this.conditional.js(rv, false, ("k$async(" + (this.callback) + "," + (kthis()) + ");\n"));
    }
    /*
       `WaitForExpression`s store any errors in the `error_holder` array, which is thrown if more than zero errors occur (see the `RunInParallelBlock`, which sets these properties). `safe wait for`s don't check for errors.
        */
    rv += ("function " + (this.new_callback) + "() {\n");
    use_snippets['async'] = snippets['async'];
    if (!(this.no_errors)) {
      rv += "  if (arguments[0] != null) {\n";
      rv += ("    " + (this.error_holder) + "[" + (this.error_index) + "] = arguments[0];\n");
      rv += ("    return k$async(" + (this.callback) + "," + (kthis()) + ");\n");
      rv += "  }\n";
    }
    rv += indent(rv_block);
    rv += ("  k$async(" + (this.callback) + "," + (kthis()) + ");\n");
    rv += "}\n";
    return rv;
  }

  /*
     ### RunInParallelBlock

     A `RunInParallelBlock` kicks off several `WaitForExpression`s in parallel. It calls its own callback when all these tasks are done. It throws an error (with an array of errors from each `wait for`) if there were any errors.
      */
  Grammar.RunInParallelBlock.prototype.js = function () {
    var loop_counter, loop_errors, rv, wf_index, wait_for, ki$22, kobj$22;
    /*
       Make our callback and a loop counter and loop error variable.
        */
    this.callback = create_callback();
    loop_counter = ("klc$" + for_count);
    loop_errors = ("kle$" + for_count);
    /*
       This is treated much like a parallel `for` loop.
        */
    for_count += 1;
    /*
       Make sure the counters and error array are defined in the local scope.
        */
    scope[loop_counter] = 'no closures';
    scope[loop_errors] = 'no closures';
    /*
       Set the counter variable to the number of tasks. Set the errors array to empty.
        */
    rv = ("" + loop_counter + " = " + (this.wait_fors.length) + ";\n" + loop_errors + " = [];\n");
    /*
       Set the flags on each child `WaitForExpression`. We give each expression an index to store its error information to.
        */
    wf_index = 0;
    kobj$22 = this.wait_fors;
    for (ki$22 = 0; ki$22 < kobj$22.length; ki$22++) {
      wait_for = kobj$22[ki$22];
      wait_for.callback = this.callback;
      wait_for.parent_block = this.parent_block;
      wait_for.error_holder = loop_errors;
      wait_for.error_index = wf_index;
      rv += ("" + (wait_for.js()));
      wf_index += 1;
    }
    /*
       Our callback checks if all tasks are done. If they are not, it just returns.
        */
    rv += ("function " + (this.callback) + "() {\n");
    rv += ("  if (--" + loop_counter + ") return;\n");
    /*
       Add in the user's `try` blocks.
        */
    rv += indent(render_try_blocks());
    /*
       If we are done, check for errors in the array and throw if there were any.
        */
    rv += multi_indent(("  for (var " + loop_errors + "i = 0; " + loop_errors + "i < " + wf_index + "; " + loop_errors + "i++) { if (" + loop_errors + "[" + loop_errors + "i]) throw " + loop_errors + "; }\n"), try_block_stack.length);
    this.parent_block.closeout_callback = this.original_callback;
    return rv;
  }

  /*
     Snippets
     ========

     These are useful blocks of code that are only included in the output when used.
      */
  snippets = {'in': 'var k$indexof = [].indexOf || function (item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };', 'inherits': 'var __hasProp = {}.hasOwnProperty, __extends = function (child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; }', 'array list comprehension': 'var k$comprl = function (iterable,func,cond) {var o = []; cond = cond || function () {return true;}; if (iterable instanceof Array || typeof iterable.length == "number") {for (var i=0;i<iterable.length;i++) {if (cond(iterable[i])) {o.push(func(iterable[i]));}}} else if (typeof iterable.next == "function") {var i; while ((i = iterable.next()) != null) {if (cond(i)) {o.push(func(i));}}} else {throw "Object is not iterable";}return o;};', 'object list comprehension': 'var k$compro = function (obj,func,cond) {var o = []; cond = cond || function () {return true;}; for (var k in obj) {if (cond(k,obj[k])) {o.push(func(k,obj[k]));}} return o;}', 'async': 'var k$async = (typeof process === "undefined" || !(process.nextTick)) ? (function (fn,self,args) {setTimeout(function () {fn.apply(self,args);}, 0);}) : (function (fn,self,args) {process.nextTick(function () {fn.apply(self,args);});});', 'get callback': 'var k$getcb = function (args) {return typeof args[args.length-1] == "function" ? args[args.length-1] : function () {}};', 'range': 'var k$range = function (start,stop,step) {step = step || (start > stop ? -1 : 1);for (var rv=[]; step>0?start<=stop:start>=stop; start+=step) rv.push(start);return rv;};', 'delete': 'var k$del = function (arr,indices) {if (typeof indices == "number") {arr.splice(indicies,1);} else {indices.sort(); for (var i = indices.length-1; i >= 0; i--) arr.splice(indices[i],1);}}'};
})()