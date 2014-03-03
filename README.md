###LiteScript is a highly-readable language that compiles to javascript

##Design considerations

- More hours are expended *reading* and *debugging* code, than *writing* it.
- Code should be easy to read and follow. 
- Programmer intention and code effects should be clear and explicit
- Code flow should be straightforward, top-down, left-right, then:
  - Condition evaluation should precede conditionally executed statements
  - Deviations from expected program flow, should be handled as "exceptions" (try-catch-finally)
  - Sequential programming with exceptions should be preferred.
  - Async callbacks and closures should be available to be used when required
  - Async callbacks and closures *should not* break the exception handling logic.
  - Hidden side-effects and global variables should be avoided whenever possible.  

##Objectives

- Make code as readable and easy to follow as possible.
- Do not try to be terse and clever. The best code is the clearest, not the shortest. 
- Create readable javascript code
- Catch typos in object members **in the compilation phase**. Is too time-expensive to debug subtle bugs caused by mistyped member names in javascript.
- Allow an easy context-switch in the coder's mind between programming languages.
  - Try to use the same meaning for the same symbols when the symbol is used in javascript, CoffeScript, Phyton, C, C#, JAVA, SQL.
  - Use js symbols and EcmaScript 6 constructs when appropriated and available.
  - Embrace javascript prototypal inheritance. "class" is syntax sugar.

------

##LiteScript is Literate

LiteScript is literate with a twist. (based on the idea of *Literate CoffeeScript*.  
You write code and documentation on the same file, using *Github flavored Markdown* syntax.  
Code blocks, denoted by four spaces of indentation after a blank line, are treated as **code**.
Every other line not indented at least 4 spaces, is considered Markdown 
and treated as comments by the compiler, *with some exceptions*. (the twist)

The exception are: MarkDown *Titles* **(###, ####, #####)** 
introducing classes, methods and functions.

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

2. Be more academic, and read the whole [LiteScript Grammar](/source/Grammar.lite.md)

3. Continue reading the highlights at [/doc](/doc)

4. Check a real-use case 

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

Development Environment
=======================

It's very useful to have syntax coloring to try a new language. This is what I use:

- OS: Linux, Debian, with KDE / or the linux distro that pleases you
- node.js >= 0.10
- [Sublime Text 2](http://www.sublimetext.com/2) - Higly recommended 
- [LiteScript tmLanguage](/extras/sublime) for Sublime Text. 
- A custom theme for Sublime Text ["Lite Dark"](/extras/sublime) based on "Soda Dark". install from: 
- A very simple Sublime "build system" (Ctrl-B)
```
  {
    "working_dir": "$project_path",
    "cmd": ["sh","build.sh"],
    "file_regex": "([\\w./_-]+?):([0-9]+):([0-9]+)(.*)"
  }
```


Once you have all that, with Sublime, "open folder" for example: 
/litescript_reception_demo/WebServer, then open "BareWebServer.lite.md".

- You can now compile (current dir) with Ctrl-B 
and then use F4 to check each error (Sublime jumps automatically to source pos)

This environment It's higly recommendable to be productive with the language.

If you have a windows box, it's time to start using Linux. Node.js works on windows, 
but some other very useful tools do not work smoothly on windows (like node-inspector). 
Go now and download "Virtual Box". After installing "Virtual Box" 
goto http://www.debian.org/distrib/netinst and continue from there 
until you've got the above configuration.

----
Developing a new version of LiteScript 
======================================

The LiteScript compiler is written in LiteScript. 

As a result, a previous version of the compiler 
is used to to develop and compile a newer -unstable- version. 

Check the /devel/ dir.

Once the new liteCompiler version passes all tests and can compile itself,
it's ready for release.

You can also clone the other repositories: 
[litescript_reception_demo](https://github.com/luciotato/LiteScript-reception-demo) 
and [LiteScript_online_playground](https://github.com/luciotato/LiteScript_online_playground), 
to see a web project using LiteScript.

