(function () {
  var stdin, stdout, Kal, readline, util, inspect, vm, Script, Module, KAL_KEYWORDS, REPL_PROMPT, REPL_PROMPT_MULTILINE, REPL_PROMPT_CONTINUATION, enableColors, ACCESSOR, SIMPLEVAR, backlog, sandbox, pipedInput, repl, multilineMode;
  var k$indexof = [].indexOf || function (item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
  /* Kal Interactive Shell 
     --------------------- 
      
     The interactive shell is a read-evaluate-print loop (REPL) that compiles one line to Javascript and executes it, displaying the result to the user. 
      
     Most of this was lovingly stolen from [CoffeeScript](http://coffeescript.org/documentation/docs/repl.html). 
      
     The REPL starts by opening up `stdin` and `stdout`. 
      */
  stdin = process.openStdin();
  stdout = process.stdout;
  /*  
     The Kal compiler and the built-in node utilities are also used, including `util.inspect` for displaying pretty values of objects. Kal keywords are used to help autocomplete. 
      */
  Kal = require('./kal');
  readline = require('readline');
  util = require('util');
  inspect = util.inspect;
  vm = require('vm');
  Script = vm.Script;
  Module = require('module');
  KAL_KEYWORDS = require('./grammar').KEYWORDS;
  /*  
      
     The prompt is five characters (with a space) and defaults to `kal> `. We tried to enable color output if the OS/shell supports it. We don't bother on Windows since it won't work with normal escape codes anyway. 
      */
  REPL_PROMPT = 'kal> ';
  REPL_PROMPT_MULTILINE = '---> ';
  REPL_PROMPT_CONTINUATION = '...> ';
  enableColors = false;
  if (!(process.platform === 'win32')) {
    enableColors = !(process.env.NODE_DISABLE_COLORS);
  }

  /*  
      
     The error function will print the stack trace if it is available. 
      */
  function error(err) {
    stdout.write(err.stack || err.toString());
    stdout.write('\n');
  }

  /*  
     Autocompletion 
     ============== 
      
     These regexes match complete-able bits of text. 
      */
  ACCESSOR = /\s*([\w\.]+)(?:\.(\w*))$/;
  SIMPLEVAR = /(\w+)$/i;

  /*  
     The `autocomplete` function returns a list of completions, and the completed text. 
      */
  function autocomplete(text) {
    return completeAttribute(text) || completeVariable(text) || [[], text];
  }

  /*  
     `completeAttribute` attempts to autocomplete a chained dotted attribute: `one.two.three`. 
      */
  function completeAttribute(text) {
    var match, all, obj, prefix, candidates, key, ki$1, kobj$1, completions;
    match = text.match(ACCESSOR);
    if (match) {
      all = match[0];
      obj = match[1];
      prefix = match[2];
      /*  
         If the object doesn't exist (or running it causes an error), we abort autocomplete. 
          */
      try {
        obj = Script.runInThisContext(obj);
      } catch (e) {
        return;
      }
      if ((obj == null)) {
        return;
      }
      /*  
         Otherwise we get property names and return them as a list, avoiding duplicates. 
          */
      obj = Object(obj);
      candidates = Object.getOwnPropertyNames(obj);
      obj = Object.getPrototypeOf(obj);
      while (obj) {
        kobj$1 = Object.getOwnPropertyNames(obj);
        for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
          key = kobj$1[ki$1];
          (!((k$indexof.call(candidates, key) >= 0))) ? candidates.push(key) : void 0;
        }
        obj = Object.getPrototypeOf(obj);
      }
      completions = getCompletions(prefix, candidates);
      return [completions, prefix];
    }
  }

  /*  
     `completeVariable` attempts to autocomplete an in-scope free variable like `one`. 
      */
  function completeVariable(text) {
    var free, vars, keywords, r, ki$2, kobj$2, candidates, key, ki$3, kobj$3, completions;
    free = ((text.match(SIMPLEVAR) != null) ? text.match(SIMPLEVAR)[1] : void 0);
    if (text === "") {
      free = "";
    }
    /*  
       Get a list of variables by running `getOwnPropertyNames` on `this`. 
        */
    if ((free != null)) {
      vars = Script.runInThisContext('Object.getOwnPropertyNames(Object(this))');
      keywords = [];
      /*  
         Include keywords as possible matches unless they start with `__`. 
          */
      kobj$2 = KAL_KEYWORDS;
      for (ki$2 = 0; ki$2 < kobj$2.length; ki$2++) {
        r = kobj$2[ki$2];
        (r.slice(0, 2) !== '__') ? keywords.push(r) : void 0;
      }
      candidates = vars;
      kobj$3 = keywords;
      for (ki$3 = 0; ki$3 < kobj$3.length; ki$3++) {
        key = kobj$3[ki$3];
        (!(((k$indexof.call(candidates, key) >= 0)))) ? candidates.push(key) : void 0;
      }
      completions = getCompletions(free, candidates);
      return [completions, free];
    }
  }

  /*  
     `getCompletions` returns elements of candidates for which `prefix` is a prefix. 
      */
  function getCompletions(prefix, candidates) {
    var rv, el, ki$4, kobj$4;
    rv = [];
    kobj$4 = candidates;
    for (ki$4 = 0; ki$4 < kobj$4.length; ki$4++) {
      el = kobj$4[ki$4];
      (0 === el.indexOf(prefix)) ? rv.push(el) : void 0;
    }
    return rv;
  }

  /*  
     Exceptions 
     ========== 
      
     Make sure that uncaught exceptions don't kill the REPL. 
      */
  process.on('uncaughtException', error);
  /*  
     Running the REPL 
     ================ 
      
     The current backlog of multi-line code. 
      */
  backlog = '';
  /*  
     The current sandbox. We run in the current scope because certain globals (like Array) are not identical in a sandbox. For example, [1,2] instanceof Array would be false in a sandbox. 
      */
  sandbox = global;

  /*  
     The main REPL function, **run**, is called every time a line of code is entered. We attempt to evaluate the command. If there's an exception, we print it out instead of exiting. 
      */
  function run(buffer) {
    var code, _, returnValue;
    /*  
       Remove single-line comments 
        */
    buffer = buffer.replace(/(^|[\r\n]+)(\s*)##?(?:[^#\r\n][^\r\n]*|)($|[\r\n])/, "$1$2$3");
    /*  
       Remove trailing newlines. 
        */
    buffer = buffer.replace(/[\r\n]+$/, "");
    /*  
       If we are in multiline mode, just add text to the backlog. 
        */
    if (multilineMode) {
      backlog += ("" + buffer + "\n");
      repl.setPrompt(REPL_PROMPT_CONTINUATION);
      repl.prompt();
      return;
    }
    /*  
       If there was nothing entered, don't bother to evaluate it - just print a new prompt. 
        */
    if (buffer.toString().trim() === "" && backlog === "") {
      repl.prompt();
      return;
    }
    /*  
       Otherwise, update the backlog. 
        */
    backlog += buffer;
    code = backlog;
    /*  
       Check for a line continuation character and give another prompt line if one was found. 
        */
    if (code[code.length - 1] === '\\') {
      backlog = ("" + (backlog.slice(0, -1)) + "\n");
      repl.setPrompt(REPL_PROMPT_CONTINUATION);
      repl.prompt();
      return;
    }
    /*  
       If we made it this far, we are ready to execute `code`. Reset the prompt and backlog then make the sandbox. 
        */
    repl.setPrompt(REPL_PROMPT);
    backlog = "";
    /*  
       We keep the same sandbox between runs, so only create it if it doesn't exist. 
        */
    if (!((sandbox != null))) {
      sandbox = Kal.makeSandbox();
    }
    /*  
       Run the code and print the output (using `util.inspect`) or error trace. 
        */
    try {
      _ = global._;
      returnValue = Kal.eval(code, {filename: 'repl', modulename: 'repl', bare: true, sandbox: sandbox});
      if (returnValue === undefined) {
        global._ = _;
      }
      repl.output.write(("" + (inspect(returnValue, false, 2, enableColors)) + "\n"));
    } catch (err) {
      error(err);
    }
    repl.prompt();
  }

  /*  
     Set up `stdin`. 
      */
  if (stdin.readable && stdin.isRaw) {
    /*  
       Handle piped input. 
        */
    pipedInput = '';
    repl = {};
    repl.prompt = function () {
      stdout.write(this._prompt);
    };

    repl.setPrompt = function (p) {
      this._prompt = p;
    };

    repl.input = stdin;
    repl.output = stdout;
    repl.on = function () {
      return;
    };

    /*  */
    stdin.on('data', function (chunk) {
      var nlre, lines, line, ki$5, kobj$5;
      pipedInput += chunk;
      nlre = /\n/;
      if (!(nlre.test(pipedInput))) {
        return;
      }
      lines = pipedInput.split("\n");
      pipedInput = lines[lines.length - 1];
      kobj$5 = lines.slice(1, -1);
      for (ki$5 = 0; ki$5 < kobj$5.length; ki$5++) {
        line = kobj$5[ki$5];
        if (line) {
          stdout.write(("" + line + "\n"));
          run(line, sandbox);
        }
      }
      return;
    });
    /*  */
    stdin.on('end', function () {
      var line, ki$6, kobj$6;
      kobj$6 = pipedInput.trim().split("\n");
      for (ki$6 = 0; ki$6 < kobj$6.length; ki$6++) {
        line = kobj$6[ki$6];
        if (line) {
          stdout.write(("" + line + "\n"));
          run(line, sandbox);
        }
      }
      stdout.write("\n");
      process.exit(0);
    });
  } else {
    /*  
        
       Handle user input using autocomplete and a read buffer. 
        */
    if (readline.createInterface.length < 3) {
      repl = readline.createInterface(stdin, autocomplete);
      stdin.on('data', function (buffer) {
        repl.write(buffer);
      });
    } else {
      repl = readline.createInterface(stdin, stdout, autocomplete);
    }
  }
  /*  
     Default multiline mode to off. 
      */
  multilineMode = false;
  /*  
     Handle the multi-line mode key switch (Ctrl-V). 
      */
  repl.input.on('keypress', function (char, key) {
    var cursorPos, newPrompt;
    if (!(key && key.ctrl && !(key.meta) && !(key.shift) && key.name === 'v')) {
      return;
    }
    cursorPos = repl.cursor;
    repl.output.cursorTo(0);
    repl.output.clearLine(1);
    multilineMode = !(multilineMode);
    (!(multilineMode) && backlog) ? repl._line() : void 0;
    backlog = '';
    /*  
       Switch the prompt and reset the cursor to the next line. 
        */
    newPrompt = (multilineMode) ? REPL_PROMPT_MULTILINE : REPL_PROMPT;
    repl.setPrompt(newPrompt);
    repl.prompt();
    repl.cursor = cursorPos;
    repl.output.cursorTo(newPrompt.length + (repl.cursor));
  });
  /*  
     Handle Ctrl-d press at end of last line in multiline mode 
      */
  repl.input.on('keypress', function (char, key) {
    if (!(multilineMode && repl.line)) {
      return;
    }
    if (!(key && key.ctrl && !(key.meta) && !(key.shift) && key.name === 'd')) {
      return;
    }
    multilineMode = false;
    repl._line();
  });
  /*  
     Watch for Ctrl-C and handle it gracefully if we are in the midle of a multiline entry. 
      */
  repl.on('attemptClose', function () {
    if (multilineMode) {
      multilineMode = false;
      repl.output.cursorTo(0);
      repl.output.clearLine(1);
      repl._onLine(repl.line);
      return;
    }
    if (backlog || repl.line) {
      backlog = '';
      repl.historyIndex = -1;
      repl.setPrompt(REPL_PROMPT);
      repl.output.write('\n(^C again to quit)');
      repl.line = '';
      repl._line((repl.line));
    } else {
      repl.close();
    }
  });
  /*  
     Cleanup on close. 
      */
  repl.on('close', function () {
    repl.output.write('\n');
    repl.input.destroy();
  });
  /*  
     Run `run` when a line is entered. 
      */
  repl.on('line', run);
  /*  
     Start with the default prompt and go. 
      */
  repl.setPrompt(REPL_PROMPT);
  repl.prompt();
})()