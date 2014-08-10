<p align=right><img src="https://travis-ci.org/luciotato/LiteScript.png?branch=master" /></p>
###LiteScript is a highly-readable language that compiles to javascript
##Design considerations
- More hours are expended *reading* and *debugging* code, than *writing* it.
- Code should be [easy to read and follow](http://luciotato.svbtle.com/keep-your-mind-at-full-speed-avoid-branch-mispredictions).
- Programmer intention and code effects should be clear and explicit
- Code flow should be straightforward, top-down, left-right, then:
  - Condition evaluation should precede conditionally executed statements
  - Deviations from expected program flow, should be handled as "exceptions" (try-catch-finally)
  - Sequential programming with exceptions should be available.
  - Async callbacks and closures should be available to be used when required
  - Async callbacks and closures *should not* break the exception handling logic.
  - Hidden side-effects and global variables should be avoided whenever possible.  

##Objectives

- Make code as readable and easy to follow as possible.
- Favor clear, readable code, over terse, hard to read code.
- Genereate readable javascript code.
- Catch typos in object members **in the compilation phase**. Is too time-expensive to debug subtle bugs caused by mistyped member names in javascript.
- Allow an easy context-switch in the coder's mind between programming languages.
  - Try to use the same meaning for the same symbols when the symbol is used in javascript, CoffeScript, Python, C, C#, JAVA, SQL.
  - Use js and EcmaScript 6 syntax when available.
  - Embrace javascript prototypal inheritance. "class" is just syntax sugar.

##Why?

I've reached a point, in pure js projects, at which refactoring code gets too risky. 
It's far too easy to introduce subtle bugs in pure js, just with a typo.
After hours lost debugging js code. You end up fearing to alter code that's already tested.
***I needed a tool to ease up javascript production for large projects, catching common 
errors in the compilation phase, to avoid long debugging hours.***

**Good Start**: By migrating a few projects to LiteScript I've found bugs lurking in js code I thought was bug-free. 
Also with LiteScript I found myself coding faster, fearless, trusting LiteScript compiler to catch typos 
and object misuse.

------

##LiteScript is Literate

LiteScript is literate (based on the idea of *Literate CoffeeScript*).
You write code and documentation on the same file, using *Github flavored Markdown* syntax.  
Code blocks, denoted by four spaces of indentation after a blank line, are treated as **code**.
Every other line not indented at least 4 spaces, is considered Markdown 
and treated as comments by the compiler, *with some exceptions*.

The exception are: MarkDown *Titles* **(###, ####, #####)** introducing classes, methods and functions.

This exception exists to allow markdown titles to act as block starters (class, function, method), 
and then keep literate markdown comment paragraphs *inside classes and functions*. 
Comments, if left outside the class or function, tend to get detached from their 
code on reorganizations.
Anything else not indented 4 spaces is a literate comment, Github flavor MarkDown syntax.

###Example:

-----
### Public Class Agent
This is an example of some class, the title above is CODE, because 
the title line start with `### Public Class`. This text is not code. This is a comment paragraph, 
which explains the class usage, and, because its location, 
has high chances of still be attached to the class after code refactorings. 

Now let's write the class body (code)
    
##### Properties
        name
    
##### Constructor(name)
        this.name = name
    
##### Method hello
        print "Hello! I'm #{.name}"

Now test the class

    var a = new Agent('the README')
    a.hello

Since LiteScript is literate, you can **run this README**, 
and see the above example in action. 

do:
```
sudo npm install -g litescript
git clone https://github.com/luciotato/LiteScript
cd LiteScript
lite -run README.md
```

***> Hello! I'm the README***


-----------

OK, now you can: 

1. Go cowboy-style, get hands-on and try it online, 
go to [LiteScript Online Playground](http://luciotato.github.io/LiteScript_online_playground/playground/)

2. Be more academic, and read the whole [LiteScript Grammar](/source/Grammar.lite.md) (it is also the code)

3. Continue reading the highlights at [/doc](/doc)

4. Install and start enjoying

----
##Compile-to-C

LiteScript can also be compiled-to-c  (beta in version 0.8.5)

when compiled-to-C, the LiteScript compiler itself runs 5x-7x faster.

See: devel/litec 

### UgilfyLS - proof of concept

In order to measure preformance gain when compiling-to-c, I've "translated" the parser
from UglifyJS into LiteScript code, and the compile such code to-js and to-c

##Results:

parsing of: `jquery-1.11.1.js + Underscore.js 1.6.0 + AngularJS` 366 KiB

code | time | difference
--|--
Original UglifyJS2, parse.js code | 425 ms | base
--|--
Uglify-LS code, compile-to-js | 455 ms  | +30 ms, 7% slower
--|--
Uglify-LS code, compile-to-c - debug | 250 ms | 1.8 times faster
--|--
Uglify-LS code, compile-to-c - NDEBUG | 200 ms | twice as fast



----
##Installation

```
sudo npm install -g litescript
```
See ***Development Environment*** below for tools installation.

##Usage
Primary usage is from the command line, to compile a project, a single file or to run a script:

To compile a project: `lite mainModule.lite.md`

To run a script: `lite -run mainModule.lite.md`

###Options:
```
  -r, -run         compile & run .lite.md file
  -o dir           output dir. Default is 'out'
  -b, -browser     compile for a browser environment (window instead of global, no process, etc)
  -v, -verbose     verbose level, default is 1 (0-2)
  -w, -warning     warning level, default is 1 (0-1)
  -comments        comment level on generated files, default is 1 (0-2)
  -version         print LiteScript version & exit

  Advanced options:
  -es6, --harmony  used with -run, uses node --harmony
  -s,  -single     compile single file. do not follow import/require() calls
  -nm, -nomap      do not generate sourcemap
  -noval           skip name validation
  -d, -debug       enable full compiler debug log file at 'out/debug.log'
  -run -debug      when -run used with -debug, launch compiled file with: node --debug-brk 
```

###Development Environment

It's very useful to have syntax coloring to try a new language. This is what I use:

- OS: Linux, Debian with KDE / or the linux distro that pleases you
- node.js >= 0.10
- [Sublime Text 2](http://www.sublimetext.com/2) - Higly recommended 
- [LiteScript tmLanguage](/extras/sublime) for Sublime Text. 
- A custom theme for Sublime Text ["Lite Day/Night"](/extras/sublime) based on "Soda Dark". 
- A very simple Sublime "build system" (Ctrl-B)
```
{
  "working_dir": "$project_path",
  "cmd": ["sh","build.sh"],
  "file_regex": "([\\w./_-]+?):([0-9]+):?([0-9]+)?(.*)?"
}
```

Install a code example
```
git clone https://github.com/luciotato/LiteScript-reception-demo.git
```

Once you have all that, with Sublime, "open folder" for example: 
`~/litescript_reception_demo/WebServer`, then open "BareWebServer.lite.md".

- You can now compile (current dir) with Ctrl-B 
and then use F4 to check each compiler error (Sublime jumps automatically to source position)

This is a higly recommendable environment to be productive with the language.

If you have a windows box, the better option is to install Linux on Virtual Box. 
Node.js works on windows, but some other very useful tools do not work smoothly on windows (like node-inspector). 
Go now and download "Virtual Box". After installing "Virtual Box" 
try http://www.debian.org/distrib/netinst and continue from there until 
you reach the above configuration.

----

###Real use cases so far 

##### On the server: LiteScript itself

LiteScript is written in LiteScript, every new version must be able to 
compile itself to be ready for release.
LiteScript is a real-use case of a heavy, server run,
text processing, class based program written in LiteScript.

##### On the browser: 

#####[LiteScript_online_playground](https://github.com/luciotato/LiteScript_online_playground.git)

Its a single page browser app. It downloads the entire LiteScript compiler (not minified) 
and fetch example LiteScript code  via AJAX, then compile on the browser presenting 
a side-by-side view of LiteScript and generated Javascript (via ace editor). 

The repository includes a "BareBones Minimal WebServer", also written in LiteScript, 
so you can git clone and host-it locally, being then a combination of LiteScript 
generated Server App and Browser App.

This project has a minimal "Document.interface.md" for the DOM and also minimals
"jQuery.interface.md" and "ace.interface.md"

**Note:** The "Document.interface.md" and "jQuery.interface.md" are partial and incomplete.
Patches are welcomed.

#####[LiteScript-reception-demo](https://github.com/luciotato/LiteScript-reception-demo.git)

Its a web app *prototype* for IPAD we were commisioned to do. In order to test LiteScript
with real-world code, I've ported it from pure browser javascript 
to node.js-LiteScript(server)-LiteScript(browser)

The repository includes again a "BareBones Minimal WebServer", also written in LiteScript, 
which simulates a database access.

You must clone and host-it locally to test-it.


----

###Developing a new version of LiteScript 

The LiteScript compiler is written in LiteScript. 

As a result, a previous version of the compiler 
is used to to develop and compile a newer -unstable- version. 

Check the /devel/ dir.

Once the new liteCompiler version passes all tests and ***can compile itself***,
it's ready for release.

You can also clone the other repositories: 
[litescript_reception_demo](https://github.com/luciotato/LiteScript-reception-demo) 
and [LiteScript_online_playground](https://github.com/luciotato/LiteScript_online_playground), 
to see a web project using LiteScript.

