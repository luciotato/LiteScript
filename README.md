###New! Online Test Drive, check

<a href=http://rawgithub.com/luciotato/LiteScript/master/demo.html target=_blank>
LiteScript Online</a>

Considerations
==============

LiteScript is designed with the following considerations in mind:

* More hours are expended READING and DEBUGGING code, than WRITING it.
* Code should be easy to read and follow. Intention and effects should be clear and explicit
* Code flow should be straightforward, top-down and left to rigth
  * Condition evaluation should precede conditionally executed statements
  * Sequential programming with exceptions, shows in a very clean form the flow and intention of the code,
maximizing readability and easing code-understanding for newcomers.
  * Deviations from error-free expected program flow,should be handled as "exceptions" to normal (error-free) flow
  * Programming async with callbacks and closures, should be optional and not imposed. Async callbacks and closures are great tools, and shuold be available to be used when they are the right tools for the job.
* Hidden side-effects and global variables should be avoided whenever possible.

Objectives
==========

* Make code as readable and easy to follow as possible.
* DO NOT try to be terse and clever. The best code is the clearest, not the shortest. We have plenty of room for source code size.
* Catch typos in variables and object members *in the compilation phase*. Is too time-expensive to debug subtle bugs caused by mistyped variable or member names.
* Provide an easy alternative to callbacks while providing asynchronous support. Async should be available, but as an option, not an imposition.

Design Options
==============
* Allow an easy context-switch in the coder's mind between programming languages. Try to use the same meaning for the same symbols when the symbol has meaning in javascript, CoffeScript and other mainstream web related languages.
* Use js symbols and EcmaScript 6 constructs when appropriated and available.
* Use ANSI SQL symbols and constructs when appropriated.


Introduction:
=============

<blockquote>
***DISCLAIMER***: <i>All characters and events in the following histories are entirely fictional. All facts were twisted to fit the needs of the plot. Celebrity voices are impersonated (poorly).
Semantical, grammatical, and syntactic corrections are greatly appreciated. (this text has an error ratio of one every forty unicode points). Please don't even try to do fact-checking. 
The tales described here are intended to be amusing, not real. 
<b>Se non è vero, è ben trovato.</b></i>
</blockquote>

To semicolon or not to semicolon:
---------------------------------

LiteScript accepts end of line (EOL) as statement separator and indentation as block scope (Like Python, and CofeeScript)

With indentation as block scope, you're forced to properly indent. -that's good-
(you're doing it anyhow, if you're not insane).

Using EOL as statement separator, you stop worrying about semicolons and curly braces, -that's good-.
Nevertheless, you can put a semicolon at the end of every line (We will happily ignore it), and use semicolons to separate statement the same line. (although, more than one statement in one line affects readability and is discouraged) 

Block end cues for the casual reader
------------------------------------

There is a problem I call "The closing braces wtf problem"

Let's say you were following the 900 lines of code from the function "theFirst", and you get distracted
by a phone call.

Picture the following "screen" in C (and js, java, etc)

  +-------------------------------------------
  |987|                   inx++;
  |988|               }
  |989|               importantVar=false;
  |990|            }
  |991|        }
  |992|    }
  |993|};
  |994|
  |995|
  |996|function theSecond(){
  |997|

Now, you're back at the screen , and you see a well-indented cascade of
closing curly braces... and you ask yourself... wtf are each one of them are closing?
Now, you depend on some crazy jumping courtesy of your favorite editor's "find matching brace" function
(if you're lucky enough to be using your editor, and not, let's say, "reading code on the web").

In this case, you gain nothing by using indent as block scope (picture the same, but w/o the curly braces)
It's even worse: you can't even be sure of how many blocks are closing.

LiteScript allows you to -optionally- use the `end` keyword to mark blocks closings.

So, to ease code reading, it's good to have (optional... yes optional) end block statements, as in...

  +------------------------------
  |987|                  inx++;
  |988|               end if // if anotherVar was 3
  |989|               importantVar=false;
  |990|           end if
  |991|
  |992|       end loop cols
  |993|    end loop rows
  |994|end function theFirst
  |995|
  |996|function theSecond(){
  |997|

That's clear, and easier to read... and it is *optional*



## Literate LiteScript

LiteScript is literate. (based on the idea of [Literate CoffeeScript](http://coffeescript.org/#literate)). 

You write code and documentation on the same file, using [Github flavored Markdown](https://help.github.com/articles/github-flavored-markdown) syntax.

Code blocks, denoted by four spaces of indentation, are treated as... well, code.

With some exceptions, everything not indented at least 4 spaces, is considered Markdown and treated as comments

Exceptions:

*Any line starting with keywords: `public class`,`public function`,`function`,`class`,`constructor`,`method` or `properties` are recognized and considered a CODE line. 

This exception exists to allow literate comments *inside* classes and functions.
Comments, if left outside the class or function tend to get dettached from their code on reorganizations

The actual version of the LiteScript compiler, is written in LiteScript. Check any source file to see examples of literate LiteScript.


Grammar MetaSyntax
==================

Along this document and the code, a loose grammar is used to define language construction.
The syntax for this 'grammar definition language' is:

Example          |  Usage
-----------------|------------------
`IfStatement`    | Capitalized is reserved for non-terminal symbols
`function`       | all-lowercase means the literal word, (terminal symbol)
`":"`            | literal symbols are quoted (terminal symbol)
`exit-Condition` | lowercase`-`Symbol meanss: "tagged non-terminal", the tag helps declaring the intention

`IDENTIFIER`,`OPER` | all-uppercase denotes entire classes of terminal symbols 
`NEWLINE`,`EOF`     | or special unprintable characters

`[of]`               | Optional symbols are enclosed in brackets
`(Oper Operand)`     | Parentheses groups symbols
`(bitwise|shift)`    | The vertical bar represents an alternative
`(Accessor)*`        | Asterisk after a group `()*` means zero or more of the group
`(Accessor)+`        | Plus after a group `()+` means one or more of the group

`var [VariableDecl,]+` | a comma means: "Comma Separated List". When a "Comma Separated List" is accepted,
                       |  also a *free-form* is accepted
`Body: [Statement;]*`  | a semicolon means: "Semicolon Separated List". Also a *free-form* is accepted.

Grammar Examples:

`VarStatement: (var|let) (VariableDecl,)+`

  Means: keyword "var" or "let", followed by a comma separated list of VariableDecl (at least one)

`VariableDecl: IDENTIFIER ['=' Expression]`

  Means: IDENTIFIER, **optionally** followed by an equal sign and a Expression.

`ForEachInArray: for each [index-VariableDecl ","] item-VariableDecl in array-Expression Body`

  Means: keyword "for", then keyword "each", then **optional** VariableDecl (index) followed by a ",".
  After, VariableDecl is required (item), keyword "in" and a Expresion (array).
  After, a Body

`Body: (Statement;)*`

  Means: Semicolon separated list of Statement (zero or more), and when a separated list is accepted
  also "freeForm" is accepted, so it is also: (Statement [NEWLINE][;][NEWLINE])*`, meaning: 
  zero or more of Statement, optionally followed by "NEWLINE", optionally followed by ";", optionally followed by "NEWLINE".


Comma Separated List
--------------------

When a "Comma Separated List" is accepted:

Example:
`FunctionCall: IDENTIFIER "(" [Expression,]* ")"`

also a *free-form* is accepted.

In *free-form*, each item stands on its own line.
Commas are optional, and can appear after or before the NEWLINE

Example: All of the following contructions are equivalent and valid in LiteScript

    var a = {prop1:30 prop2: { prop2_1:19, prop2_2:71} arr:["Jan","Feb","Mar"]}

    var a =
        prop1: 30

        prop2: 
          prop2_1: 19
          prop2_2: 71

        arr: [ "Jan", "Feb"
              , "Mar" ]

    var a = {
        prop1: 30
        prop2: 
          prop2_1: 19,
          prop2_2: 71,
        arr: [ 
            "Jan", 
            "Feb"
            "Mar" 
            ]
        }


More about comma separated lists
================================

The examples above only show Object and List Expressions, but *you can use free-form mode (multiple lines with the same indent), everywhere a comma separated list of items apply.*

The previous examples were for:

*Literal Object expression

  because a Literal Object expression is:
  "{" a comma separated list of Item:Value pairs "}"

and

*Literal Array expression

  because a Literal Array expression is 
  "[" a comma separated list of expressions "]"

But the option also applies for:

*Function parameters declarations

  because a Function parameters declarations is: 
  "(" a comma separated list of paramter names ")"

*Arguments, for any function call 

  because function call arguments are:
  "(" a comma separated list of expressions ")"

*Variables declaration 

  because a variables declaration is:
  "var" + a comma separated list of: IDENTIFIER ["=" Expression] 

Examples:

  js: 

    Console.log(title,subtitle,line1,line2,value,recommendation)

  LiteScript available variations:

    print title,subtitle
          line1,line2,value,recommendation

    print
      title
      subtitle
      line1
      line2
      value
      recommendation

  js:
    var a=10, b=20, c=30,
        d=40;

    function complexFn( 10, 4, 'sample', 'see 1', 2+2, null ){
      ...function body...
    };

  LiteScript:

    var
      a=10
      b=20
      c=30
      d=40

    function complexFn(
      10       # determines something important to this function
      4        # do not pass nulll to this
      'sample' # this is original data
      'see 1'  # note param
      2+2      # useful tip
      null     # reserved for extensions ;)
      )
      ...function body...


## Comments

Comments are preceeded by `//` or a `#` sign

Multiline comments are enclosed by `/*` and `*/` (C-style)


## Optional End keyword

All of the indented structures can be optionally ended with an "end" keyword, to ease code reading and to 
make harder to introduce subtle bugs on code modifications and/or indentation changes

example:

    function my_function(arg1, arg2)
      return arg1 + arg2
    end function

    for each property name in options
        print name
        if options[name] is Array
            for each item in options[key]
                print item
            end for
        end if
    end for


## Functions

Functions can have default arguments. These will be used if the specified argument is `null` or `undefined`:

Example:

    function myFn(x,y = 2)
      return x + y

    print myFn(1) # prints 3

Functions are called using parentheses when you use the result, but can be called without parentheses
when the result is discarded.

Example:

    var a = myFunction(1, 2)

    initializeSystem userName, new Date()   // js: initializeSystem(userName, new Date());

    result.push data // js: result.push(data);

Objects work like JavaScript objects, so you can access members either using array subscripts or `.` notation

Example:

    var x =
      a : 1
      b : 2

    print x['a'] # prints 1
    print x.b    # prints 2

## Arguments

As in js, you can use 'arguments' as an array-like object containing all the function call arguments (declared or not)


## Variables and properties, must be declared

To avoid long debug sessions over a mistyped object member, LiteScript compiler will emit warnings 
when a variable is used before declaration, and when a object property is unknown. 

Example: The following js code mistake, will be catch only while debugging. The complex the code, the longer the debugging.

  options = options || {};
  if (options.importantCodeDefaultTrue===undeinfed) options.importantCodeDefaultTrue=true;
  if (options.anotherOptionDefaultZero===undeinfed) options.anotherOptionDefaultZero=0;

  initFunction(options);
  prepareDom(options)
  if (options.importantCodesDefaultTrue) { moreInit(); subtleChanges(); }
  

The same LiteScript code, will emit an error during compilation -no debugging required-.

  options = options or {}
  if options.importantCodeDefaultTrue is undeinfed, options.importantCodeDefaultTrue = true
  if options.anotherOptionDefaultZero is undeinfed, options.anotherOptionDefaultZero=0;

  initFunction options
  prepareDom options
  if options.importantCodesDefaultTrue then moreInit(); subtleChanges()
  

## Globals

You cannot create 'by mistake' a variable or function in the global scope. It's an error.
The only way to create a global variable or function is to use the `global` object.

Example:

    var x=3 # <- error, will create global variable

    global.x = 3 # <-ok


`global` is alias for `window` on the browser.


JAVASCRIPT, var, and Scope
--------------------------

Actual Javascript (ES5) has only 'function' scope. Function scope means 
all `var` declarations are considered to be made at the start of the function.

Also, Javascript **does not force** an implicit assignment at the point of declaration. 

This means subtle bugs can be introduced by declaring vars in the middle of a function.

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Scope_Cheatsheet


Example: 
  
  javascript:

    // show even numbers
    var n=0;
    var ta = document.getElementById('result');
    var result=[];
    for (var i=2;i<10;i++){
        var j;
        if (i%2 === 0) j = i;
        if (j) result.push(j);
    }
    ta.innerText = result.join(',');

Expected result is: 2,4,6,8

this js code outs: 2,2,4,4,6,6,8,8

  LiteScript:

    var n = 0
    var ta = document.getElementById('result')
    var result=[]
    for var i=2 while i<10
        var j
        if i mod 2 is 0 then j = i
        if j then result.push(j)
    }
    ta.innerText = result.join(',')

Expected result is: 2,4,6,8

this LiteScript code outs: 2,4,6,8

Why the difference?
-------------------

LiteScript forces variables to be initialized at the point of declaration,
thus somewhat limiting the scope of the variable **value** to start at the point of declaration. 
(Javascript does not force an implicit assignment at the point of declaration). 

The compiled js, for the LitesSript code is:

    var n=0;
    var ta = document.getElementById('result');
    var s=null;
    for (var i=2;i<10;i++){
        var j=undefined;  //<-- **difference is here**
        if (i%2 === 0) j = i;
        if (j) result.push(j);
    }
    ta.innerText = result.join(',')


###Uppercase, lowercase

* To avoid subtle errors, you cannot define any two variable names only differing in uppercase/lowercase
* Class Names are required to be Capitalized.
* CONST are required to be all UPPERCASE.
* All other identifiers are required to be camelCased


## Strings

Strings can either be double-quoted (`"`) or single quoted (`'`).

    x = 'this is a "string" with quotes in it'
    y = "so is 'this'"

## Embedded Expressions In Strings ## 

Strings can contain interpolated values using the default interpolation char: `#` (as in CoffeeScript).

Example: `print "x is #x"` 

`[` and `.` are considered part of the expression, 
so `#var[inx]` and `#obj.prop` are valid

If the replacement is a expression, it can be enclosed in curly braces, as in 

    print 'the function result plus 3 is #{fn(10)+3}'

Note: **BOTH**, *Single AND doble quoted strings* are interpolated.

You can change the interpolation char using a compiler directive, for instance, use `$` instead of `#` (as in ES6)

    compiler option
      interpolation char is '$'

Example: simple expressions

    print "The #n th element is: $arr[n]"
    ul.addChild('<li class="$class" onclick="${handlerFnName}();"> $item[inx] $obj.value </li>'

Example: complex expressions

    div.innerHtml = '<textarea>result of 1+3*3-7 = #{1+3-3*7}
    print "the function returns: #{theFunction(reference,item,value)}"
    div.innerHtml = '<textarea>google.com HTML is: #{wait for httpGet("www.google.com")}</textarea>'

All the embedded expressions are replaced with: `+ Expression +` or `+ (Expression) +` if it used {}

Examples:

    a = "cow"
    n = "moo"
    print "The #a says #n!"

> "The cow says, moo!"

    compiler option
      interpolation char is '$'
      
    var inx = 3

    var arr = [
      "this"
      "is"
      "a"
      "test"
      ]

    var agent = 
      type: "cow"
      talk: "moo"

    print "The value at $inx is: $arr[inx]"
    print "and the $agent.type says $agent.talk!"

> "The value at 3 is: test"
> "and the cow says moo!"

    print "The result of 1+1+1 is ${1+1+1}"

> "The result of 1+1+1 is 3"

    function myFunc(a)
      return "moo $a times!"

    print "The function returns: ${myFunc(10)}"

> "The function returns: moo 10 times!"


## Including literal $ or # ##

String interpolation is applied for single and double quoted strings.

if you need to include a literal `#` in a string, use: `\x23`. 
if you need to include a literal `$` in a string, use: `\x24`. 

Example:

      var MyString = "Get out of here, get me some \x24 too"
      // --> var MyString = "Get out of here, get me some $ too"

or you can use multi-line strings, like:

      var MyString = """sing on b#: Get out of here, get me some $ too"""


# Defaults for objects #
It's a common pattern in javascript to use a object parameters (named "options")
to pass misc options to functions.

Litescript provide a 'default' construct as syntax sugar for this common pattern

    function theApi(object,options,callback)

      default options =
        log: console.log
        encoding: 'utf-8'
        throwErrors: true
        debugLevel: 2
      end default

      ...function body...

    end function

is equivalent to js's:

    function theApi(object,options,callback) {

        //defaults
        if (!options) options = {};
        if (options.log===undefined) options.log = console.log;
        if (options.encoding===undefined) options.encoding = 'utf-8';
        if (options.throwErrors===undefined) options.throwErrors=true;
        if (options.debugLevel===undefined) options.debugLevel=2;

        ...function body...
    }


## For Loops

There are 3 variants of `for loops` in LiteScript


### Variant 1) 'for each index' to loop over *Array indexes and items* ###

Grammar:
`ForEachIndex: for each [index-VariableDecl,]item-VariableDecl in array-VariableRef`

where:
* `index-VariableDecl` is a variable declared on the spot to store each item index (from 0 to array.length)
* `item-VariableDecl` is a variable declared on the spot to store each array item (array[index])
and `array-VariableRef` is the array to iterate over

Examples:

    months = [
      'Jan'
      'Feb'
      'March'
    ]

    for each month in months
      print month

Will print `Jan`, `Feb`, `March`

    woods = ["cedar", "oak", "maple"]

    for each i,w in woods
      print i,w

Will print `0 cedar`, `1 oak`, `2 maple`


Javascript translations of the above examples:
----------------------------------------------


    months = ['Jan','Feb','March']

    //for each month in months
    //  print month

    for(var month__index=0; month__index<months.length; month__index++){
      var month = months[month__index];
      console.log(month);
    }


    woods = ["cedar", "oak", "maple"]

    //for each i,w in woods
    //  print i,w

    for(var i=0; i<woods.length; i++){
      var w = woods[i];
      console.log(i,w);
    }



### Variant 2) 'for each property' to loop over *object property names* ###

Grammar:
`ForEachProperty: for each [own] property name-VariableDecl in object-VariableRef`

where `name-VariableDecl` is a variable declared on the spot to store each property name,
and `object-VariableRef` is the object having the properties 

if the optional `own` keyword is used, only instance properties will be looped (no property chain access)

Examples:

    function showOptions ( options )    

      for each own property key in options
          if options[key], print "Option #key is #{options[key]}"


    function showAllProps ( object )    

      for each property name in object
          print "property #name is #{object[name]}"
          if not object.hasOwnProperty(name), print "property #name is in the prototype chain"


    function showProps ( object )    

      print "Object own properties:"
      for each own property name in object
          print "#name:#{object[name]}"


Javascript translations of the above examples:
----------------------------------------------


    function showOptions ( options ) {

      //for each own property key in options
      for(key in options) if options.hasOwnProperty(key){

          //if options[key], print "Option #key is #{options[key]}"
          if(options[key]) {console.log("Option "+key+" is "+ options[key])} 
      }
    }

    function showAllProps ( object )  {

      //for each property name in object
      for(name in object){

          //print "property #name is #{object[name]}"
          console.log("property "+name+" is "+ object[name])

          //if not object.hasOwnProperty(name), print "property #name is in the prototype chain"
          if(!object.hasOwnProperty(name)) {console.log("property "+name+" is in the prototype chain")};
      }
    }


    function showProps ( object ) {

      //print "Object own properties:"

      //for each own property name in object
      for(name in object) if options.hasOwnProperty(name){

          //print "#name:#{object[name]}"
          console.log(name+":"+object[name]);
      }
    }



### Variant 3) 'for index=...' to create *numeric loops* ###

This `for` variant are just verbose expressions of the standard C (and js) `for()` loop
the increment of the loop variable is included by default, if it is not specified

Grammar:
`ForIndex: for index-VariableDecl = start-Expression [,|;] (while|until) condition-Expression [(,|;) increment-Statement]`

where `index-VariableDecl` is a numeric variable declared on the spot to store loop index,
`start-Expression` is the start value for the index (ussually 0)
`condition-Expression` is the condition to keep looping (`while`) or to end looping (`until`)
and `increment-Statement` is the statement used to advance the loop index. If ommited the default is `index++`

you can use comma or semicolons between the expressions.

Examples:

    months = ['Jan','Feb','March']
    for i=0; while i<3 
      print months[i]

    // print event numbers until 10
    for i=0; until i is 10; i+=2
      print i

    // print chars 5 to 9, reversed
    var s = "a string"
    for p=9, while p>4, p--
      print s[p]


Js translation:
---------------

Litescript for-index loop:

    var s="123"
    for x=0, while x<3
      print s[x]

is translated to:

    var s="123"
    for (var x=0; x<3; x++) {
      console.log(s[x]);
    };



## While/Until Loop ##

While/Until Loop is the *pre-check* conditional loop.
The condition is evaluated *before* entering the loop.

Grammar:
`WhileUntilLoop: (while|until) condition-Expression ("," DoLoop | Block)`

where `pre-condition-Expression` is a boolean epxression to check *before* each loop iteration. 
do *while* the condition is true or *until* the condition is true.

Examples:

 // plain old C and js `while` loop still works the same

    x = 0
    while x < 6  
      x += 1
      print x

 // loop *until* condition is true, checks first

    x = 0
    until x is 5 
      x += 1
      print x



## DoLoop while|until ##

DoLoop is the *post-check* conditional loop
The condition is evaluated *after* the loop body.

Grammar:
`DoLoop: do [:] Block loop (while|until) post-condition-Expression`

where `post-condition-Expression` is a boolean epxression to check *after* each loop iteration. 
The code loops *while* the condition is true or *until* the condition is true.

Example: Checking *after* the loop:

    x=0
    do
      x += 1
      print x
    loop while x < 6 // loops while condition is true, checks after the loop body

    x=0
    do:
      x += 1
      print x
    loop until x is 5 // loops until certain condition is met, checks AFTER loop body


### Combinig both loops ###

You can combine both loops, as in the following examples:

Example:

    x = 0

    while getKeypress() isnt '^C', do:

      x += 1
      print x

    loop until x is 5000


Example:

    x=0

    until x is 5000, do

      x += 1
      print x

    loop while me.window.isOpen


## break and continue  ##

`break` and `continue` allows you to *break* the loop at any point, or *continue* to the next iteration from any point inside the loop.

Example:

    var x=0
    while x<100

      var result = function(x)
      if result>100
        print x, result
        break
     
      x++

    loop


    var x=-1
    do 
      x++

      if x mod 2 is 0, continue //skip even numbers

      print x

    loop until x>=10


    var x=0
    do 

      // exit
       loop when function result > 1000
      when fn(x)>1000, break  //infinite loop 

      x++

    loop 



## Operators And Constants

Listed below are LiteScript's operators and constants, and their other-language equivalents.

| LiteScript                 | CoffeeScript            | JavaScript                | Function                       |
|:--------------------------:|:-----------------------:|:-------------------------:|--------------------------------|
| `true`,`on`                | `true`, `yes`, `on`     | `true`                    | Boolean true                   |
| `false`,`off`              | `false`, `no`, `off`    | `false`                   | Boolean false                  |
| `null`                     | `null`                  | `null`                    | Null value                     |
| `undefined`                | `undefined`             | `undefined`               | no value                       |
| `and`, `but`               | `and`                   | `&&`                      | Boolean and                    |
| `or`                       | `or`                    | <code>&#124;&#124;</code> | Boolean or                     |
| `x? t: f` (ternary)        | `if x then t else f`    | `x? t: f` (ternary)       | Ternary operator.              |
| `if x` (truthy check)      | `if x?`                 | `if (x)`                  | Truthy check.                  |
| `if no x` (falsey check)   | `if not x`, `if !x`     | `if (!x)`                 | Falsey check.                  |
| `+`, `-`, `*`, `/`, `mod`  | `+`, `-`, `*`, `/`, `%` | `+`, `-`, `*`, `/`, `%`   | Math operators                 |
| `^`                        | none                    | none                      | Exponent (`Math.pow`)          |
| `is`, `===`                | `is`, `==`              | `===`                     | Boolean equality               |
| `isnt`,`is not`,`!==`,`<>` | `isnt`, `!==`           | `!==`                     | Boolean inequality             |
| `>`, `>=`, `<`, `<=`       | `>`, `>=`, `<`, `<=`    | `>`, `>=`, `<`, `<=`      | Boolean comparisons            |
| `this`,`me`                | `this`,`@`              | `this`                    | Current object                 |
| `in`, `not in`             | `in`, `not in`          | `.indexOf(x)>=0`          | Find in array/string           |
| `has property`             | `of`                    | `in`                      | Check property of object       |
| `instance of`,`instanceof` | `instanceof`            | `instanceof`              | prototype check                |
| `type of`,`typeof`         | `typeof`                | `typeof`                  | get type name                  |
| `bitwise xor`              | `^`                     | `^`                       | Bitwise xor                    |
| `bitwise not`              | `~`                     | `~`                       | Bitwise not (invert)           |
| `bitwise and`              | `&`                     | `&`                       | Bitwise and                    |
| `bitwise or`               | <code>&#124;</code>     | <code>&#124;</code>       | Bitwise or                     |
| `>>`                       | `>>`                    | `>>`                      | Bitwise shift right            |
| `<<`                       | `<<`                    | `<<`                      | Bitwise shift left             |




## Classes and Prototypal Inheritance ##

http://javascript.crockford.com/prototypal.html
http://yehudakatz.com/2011/08/12/understanding-prototypes-in-javascript/

Classes are defined with the `class` keyword and are just 
syntactic sugar for js Capitalized functions (js function-classes).

The `constructor` function, if present, is used as the body for the function-class.

`properties` declared inside the `class` body are properties added to the prototype. 

`method`s declared inside the `class` body are functions added to the prototype. 

You cannot define local variables with the same name of a property (case insensitive)
It derives from the rule: To avoid subtle errors, you cannot define any two names in the same scope 
differing only in uppercase/lowercase.

Checking if a object is instance of a Class 
-------------------------------------------

`instance of Class` is used to check if an object is an instance of a class (or one of its parent Classes)

Synonyms:
  `is instance of Class` 
  `instanceof Class` 

Full grammar:
`object-IDENTIFIER [(is|isnt|is not) (instance of|instanceof) Class-IDENTIFIER` 

As expected, an object `is instance of` its Class and also `is instance of` all classes up the prototype chain.

Example:

    class Person

      properties
        name: string

      constructor(name)
        this.name = name

      method printName()
        print this.name

      method nameLength()
        return this.name.length

    end class

    jen = new Person('Jen')
    jen.printName() # prints 'Jen'
    print(jen is a Person) # prints true


Classes can have other classes as prototypes, and override or add to their prototype method definitions.

    class FrumpyPerson, prototype is Person

      function printName()
        print 'Frumpy ', this.name

      function nameLength()
        return super.nameLength() + 6;

    end class

    sue = new FrumpyPerson('Sue')
    sue.printName() # prints 'Frumpy Sue'
    print(sue is a Person) # prints true
    print(sue is a FrumpyPerson) # prints true
    print(jen is a FrumpyPerson) # prints false

You can add or override class methods after the class is defined (in another file, for example) 
by using the `extend` keyword.

The `extend class` construction is a shortcut for altering the Class `prototype` object.

    class MyClass

      properties 
        value

      function myMethod(c)
        this.value = c

    end class

    var x = new MyClass()
    var y = new MyClass()
    
    x.myMethod 10
    print x.value # prints 10

    extend class MyClass

        method otherMethod() # adds another method
            print me.value + 100

        method myMethod(c)  #*replaces* MyClass's myMethod
            me.value = c + 1

    end extend

    x.myMethod 10
    print x.value # prints 11

    y.myMethod 10
    print y.value # prints 11

    x.otherMethod() # prints 111


Prototypal Inheritance, extend object
-------------------------------------

You can also use the `extend object` construction 
*to add methods and properties to a specific instance only*

    class MyClass

      properties 
        value

      function myMethod(c)
        this.value = c

    end class

    var 
      x = new MyClass()
      y = new MyClass()

    x.myMethod(10)
    print x.value # prints 10

    extend object y
        method myMethod(c)  #shadows MyClass's myMethod only on instance "y"
            me.value = c + 10
    end extend

    x.myMethod 10
    print x.value # prints 10, not changed
    
    y.myMethod 10
    print y.value # prints 20



`extend` for the js programmer:
-------------------------------

LiteScript, extend class:

    extend class MyClass

        properties
          oldValue = 0

        method myMethod(c)  #replaces MyClass's myMethod
            me.oldValue = value
            me.value = c + 1

translate to js:

    MyClass.prototype.oldValue = 0;

    MyClass.prototype.myMethod = function(c){ //replaces MyClass's myMethod
      this.value = c + 1;
    }


LiteScript, extend object:

    extend object y

        properties
          extraValue
          title = 'instance Y'

        method myMethod(c)  # overrides only on this instance
            me.extraValue = c
            me.value = c + 10

    end extend 

translate to js:

    y.extraValue = undefined;

    y.Title = 'instance Y';

    y.myMethod = function(c){ #overrides only on this instance
      this.extraValue = c;
      this.value = c + 10;
    }

    
### Creating Shims ###

if you don't want to replace a method if it already exists in the Class
(for example: when creating shims), you can use:

`create if not exists` before the method declaration.

Example:

    extend class String

        create if not exists method startsWith(text)
            return this.slice(0, text.length) is text

        create if not exists method endsWith(text)
            return this.slice(-text.length) is text

translates to js:

    if (!String.prototype.startsWith) {
      String.prototype.startsWith = function(text){
        return this.slice(0,text.length)===text;
      }
    }

    if (!String.prototype.endsWith) {
      String.prototype.endsWith = function(text){
        return this.slice(-text.length)===text;
      }
    }


### OOP 'super' ###

A 'super' keyword is used in classic OOP if you need to access a method (or property)
in the parent class, but you have 'shadowed' the method in this class.

In order to add similar functionality, LiteScript adds a `super` property to every prototype:
`Class.prototype.super = ParentClass.prototype` after the prototype is created.

This allows you to use `this.super.fn(x)` to call a function named `fn` on the parent class, 
even if `fn` is shadowed in the current instance or class.

Example

    class BaseClass

      properties 
        value

      function myMethod(c)
        print c

    end class

    class ChildClass, prototype is BaseClass

      function myMethod(c) #shadows parent method
        print c+10

    end class

    var x = new ChildClass

    x.myMethod 10 # prints 20, ChildClass's method

    x.super.myMethod 10 # prints 10, BaseClass's method



###Export

By adding `export` to a function, class or object
you'll be adding it to the `exports` object (as node-js modules specification)

    export var Months = 
      "jan"
      "feb"
      "march"

    export class MyClass, prototype is BaseClass

      properties
        value = 0

      method showValue
        print value

translate to js:

    var Months = ["jan","feb","march"];

    module.exports.Months = Months;

    function MyClass(){};
    MyClass.prototype = new BaseClass();
    MyClass.prototype.super = BaseClass.prototype;
    MyClass.prototype.value = 0;
    MyClass.prototype.showValue = function(){
        console.log(this.value);
    }

    module.exports.MyClass = MyClass;



## try/catch, raise, fail, exception

`try` and `catch` blocks work similarly to JavaScript/CoffeeScript.
`finally` blocks are not supported yet but are coming eventually.
The `throw` has a synonym: `raise`, and a similar construction `fail with`

`fail with` is like throw, but expects a string. It creates an Error object and then throws.

Example:
    
    fail with 'read error'

translates to js:

    throw new Error('read error');


You can also use `exception` as an alias for `catch`, without requiring a previous `try`.

Example:

    function test
      try
        raise new Error('here')
        b = 1 # never runs
      catch e
        print 'caught it!', e.message
    end function

    function test
      fail with 'exception here'
      b = 1 # never runs
    exception e
      print 'caught it!', e.message


## Regular Expressions

LiteScript pass-thru regex syntax to JavaScript's, but do not support CoffeeScript style block regex syntax yet.


## Import statement (sugar for require)

`import name` is syntax sugar for `require`

Grammar:
`ImportDeclaration: import (IDENTIFIER[='modulename'],)+`

`import name1[,name2]` will be translated to javascript as: `var name1=require('name1'),name2=require('name2');`

if the module filename is not also a valid variable name, or you want to use another name do:

`import name='module'`, translated to javascript: `var name=require('module');`

Note: `var name = require('name')` works as usual

Examples:

    import fs,path,util // -> var fs = require('fs'), path = require('path'), util = require('util');

    import 
      fs
      pah
      sourceMap = "source-map"

      // -> 
      var fs = require('fs'), 
          path = require('path'), 
          SourceMap = require('source-map');



## Wait For - like async/await from C#

The `wait for` statement executes a standard async function and pauses execution (yielding to the runtime) until the async function callback is called.

Wait For it's supported by available libs. 
See: http://github.com/luciotato/waitfor
See: http://github.com/luciotato/waitfor-ES6

`wait for` can be used to call and wait for any *standard async function*.
A *standard async function*, is an async function in which the last parameter is callback(err,data)

The following code, for node.js, get's google.com IPs (async) and then tries to 
reverse-dns each ip (async)

```LiteScript
import dns

function resolveReverse

    var addresses = wait for dns.resolve4("google.com")

    print "addresses for google.com are:", JSON.stringify(addresses)

    for each a in addresses
        print "reverse for #{a}:", JSON.stringify(wait for dns.reverse(a))

    exception e
      print "error",e.message
```

Note that:

* After the `wait for` line, execution is paused (the function yields) so other code can run. 
Keep this in mind if you have global variables that are modified asynchronously as they may change between the `wait for` line and the line after it. **(Better: do not use global variables)**

* Any errors, in the function code or reported by `dns.resolve4` 
(via callback's err parameter) **will be thrown in the function**. 
You can catch all errors in the `exception` block of the function.

* On node, `wait for` will be implmented with (wait.for/node-fibers) or generators (waitfor-ES6) 
if --harmony flag is passed to node.


## Launching fibers to do Asynchronous work

If you plan to use `wait for` you can only use it inside a function running in a 'Fiber'.
A 'Fiber' is a function which can be 'paused' (can "yield") to the calling function
and then, later, continued.

'Fibers' are implemented in node by means of node-fibers or by ES6 "generators" (--harmony flag)

On node, `wait for` can be implemented with:
* the wait.for lib (http://github.com/luciotato/waitfor, based on node-fibers)
* the wait.for-ES6 lib, which uses generators (waitfor-ES6, http://github.com/luciotato/waitfor-ES6)  if the --harmony flag is provided to node (or when ES6 become part of stable node)

In the browser, for now you'll have to wait for ES6 to become stable. Or help implementing https://github.com/luciotato/waitfor-javascript for LiteScript
 

More examples:

```LiteScript

import fs

function readFileSafe(filename)

  if 'secret' in filename
    fail with 'Illegal Access!'
  else
    print filename
    var contents = wait for fs.readFile(filename)
    print contents
  end if

  exception error
    print error.message, 'reading file', filename

end function

for filename in ['secret/data.txt', 'test.txt', 'test2.txt']
  launch readFileSafe(filename)

print 'parallel reads launched!'
```

Some node.js API functions (like `http.get`) don't follow the normal convention of callback(err,data).
For these functions you must create a standardized wrapper :

Example: 

    import http

    function hGet(url,callback)

        var req = http.get ( url, function(response)
                                    callback(null,response)
                            )

        req.on ( 'error', function(e)
                              callback(e)
               )
    } 

    //wait for request from http.get 'http://www.google.com'
    print 'response:', wait for hGet('www.google.com')


## Parallel coroutines (or fibers)

See: https://github.com/luciotato/parallel-ES6

You can kick off tasks in semi-parallel mode (co-routines) with the `launch` statement.
each task will be executed until the first `wait for`, which yields execution for the next launch.

Note: It only makes sense to "launch" long running functions containing async calls with `wait for`


    launch task1()
    launch task2 (a, b, c)
    launch task3()
    print 'all tasks launched'


## Parallel for

Each iteration of the `parallel for` block will be launched in parallel.
The for loop will not end until all tasks have completed. (all tasks will be 'joined' at `end parallel`)
Any errors thrown by each tasks, can be catch inside the loop, or will bubble up, and the other running tasks will be aborted.

```LiteScript
import fs

filenames =
    'secret/data.txt'
    'test.txt'
    'test2.txt'
end filenames

contents = []
parallel for index,file in filenames
    print 'reading file number', index,':', file
    contents.push( wait for fs.readFile(file,'utf-8') )
exception
    throw 'error reading file $file'
end parallel

print 'parallel read completed'

```

## Parallel Map

`parallel map` is syntax sugar over the previous `paralell for`.

`parallel map` allows you to launch one fiber for each item in an array,
returning another array with the results.

```LiteScript
function readFileSafe(filename)

  if 'secret' in filename
    throw 'Illegal Access!'
  else
    print filename
    var contents = wait for fs.readFile(filename,'utf-8')
    print contents
  end if

  exception error
    print error, 'reading file', filename

end function

var filenames =
    'secret/data.txt'
    'test.txt'
    'test2.txt'
end filenames

//parallel map
contents = parallel map filenames calling readFileSafe
print 'parallel read completed!'

//the above it's syntax sugar for:
contents = []
parallel for index,item in filenames
    launch contents.push(wait for readFileSafe(file))
end parallel
print 'parallel read completed'
```

```LiteScript
 var addresses = wait for dns.resolve4("google.com");
 var reverses = parallel map addresses using getReverse;
 console.log("reverses", reverses);
```


LitesScript Corollary:
======================

  * if your LiteScript is harder to read than pure-js, you're doing it wrong.

