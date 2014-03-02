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
- Catch typos in object members **in the compilation phase**. Is too time-expensive to debug subtle bugs caused by mistyped member names.
- Allow an easy context-switch in the coder's mind between programming languages.
  - Try to use the same meaning for the same symbols when the symbol is used in javascript, CoffeScript, Phyton, C, C#, JAVA, SQL.
  - Use js symbols and EcmaScript 6 constructs when appropriated and available.
  - Embrace javascript prototypal inheritance. "class" is syntax sugar

------

##LiteScript is Literate

LiteScript is literate with a twist. (based on the idea of [Literate CoffeeScript](http://coffeescript.org/#literate)).  You write code and documentation on the same file, using [Github flavored Markdown](https://help.github.com/articles/github-flavored-markdown) syntax.  
Code blocks, denoted by four spaces of indentation after a blank line, are treated as **code**.
Every other line not indented at least 4 spaces, is considered Markdown 
and treated as comments by the compiler, *with some exceptions*. (the twist)

The exception are: MarkDown *Titles* **(###, ####, #####)** 
introducing classes, methods and functions.

This exception exists to allow markdown titles to act as block starters (class, function, method), 
and then keep literate markdown comments *inside classes and functions*. 
Comments, if left outside the class or function, tend to 
get detached from their code on reorganizations.
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
npm install -g litescript
git clone https://github.com/luciotato/LiteScript
cd LiteScript
lite -run README.md
```

***> Hello! I'm the README***


-----------

OK, now you can: 

1. Go cowboy-style, get hands-on and try it online, 
go to [LiteScript Online Playground](http://rawgithub.com/luciotato/litescript_online_playground/master/playground/index.html)

2. Be more academic, and read the whole [LiteScript Grammar](/source/Grammar.lite.md)

3. Continue reading the highlights at [/doc](/doc)
