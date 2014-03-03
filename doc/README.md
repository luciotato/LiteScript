##Indentation as Block Scope

LiteScript uses indentation as block scope (Like Python and CofeeScript)

With indentation as block scope, you're forced to indent properly. -that's good-
(you're doing it anyhow in js, if you're not insane).

LiteScript prefers NEWLINE as statement separator, so all semicolons are optional,
so you stop worrying about semicolons and curly braces, -that's good-.

Nevertheless, you can put a semicolon at the end of every line (If the habit is too strong),
and *in theory* you can use semicolons to separate statements on the same line.
(**but don't**: more than one statement in one line affects readability)


##LiteScript Grammar
LiteScript parser is a *hand-coded class implemented PEG*.  
The meta-syntax for the grammar definitions is **an extended form** 
of [Parsing Expression Grammars (PEGs)](http://en.wikipedia.org/wiki/Parsing_expression_grammar)

Go now to [src/Grammar.lite.md] (src/Grammar.lite.md) 
to see LiteScript Grammar code and doc.


##Imperative Statements and Expressions

LiteScript separates imperative statements from expressions.

Note: In LiteScript, *any VariableRef standing on its own line*, it's considered 
a *function call*. A variable on its own line means "execute this!",
so, when translating to js, it'll be translated as a function call, and `()` will be added.

Examples:
---------
    LiteScript   | Translated js  | Notes
    -------------|----------------|-------
    start        | start();       | "start", on its own, is considered a function call
    start(10,20) | start(10,20);  | Normal function call
    start 10,20  | start(10,20);  | function call w/o parentheses
    start.data   | start.data();  | start.data, on its own, is considered a function call
    i++          | i++;           | i++ is imperative statement in itself

You can omit parentheses only when you're discarding the function result.

Example: 
<br>`getNextMessage //function call, discard result`
vs. 
<br>`a = getNextMessage() //execute & store result in a, "()"" required`


##Comments

Comments are preceeded by `//` or a `#` sign

Multiline comments are enclosed by `/*` and `*/` (C-style)


## Functions
Module-level Functions are defined with 'function'.
Functions parameteres can have default arguments. Parentheses are not required if you have no arguments.

Examples:

    function myFunction( x, y=2)
      return x + y

    function helloWorld
      print "hello world!"

    print myFunction(1) // prints 3

    helloWorld // prints hello world!

##Function Call, optional parentheses
Functions can be called without parentheses 
when used as statements and the result discarded.

Example:

    var username, result = []

    var data = myFunction(1, 2)  // js: idem
    result.push data             // js: result.push(data);
    initSession userName,key     // js: initSession(userName,key);


## Variables and properties, must be declared

To avoid long debug sessions over a mistyped object property name, 
LiteScript compiler will emit warnings when a variable is used before declaration, 
and when a object property is unknown.

Example: The following js code mistake, will be caught only while debugging. 
The complex the code is, the longer the debugging.


    options = options || {};
    if (options.impCodeDefaultTrue===undefined) options.impCodeDefaultTrue=true;
    if (options.anotherOptDefZero===undefined) options.anotherOptDefZero=0;
    initFunction(options);
    prepareDom(options);
    if (options.impCodeDefaultsTrue) { 
       moreInit(); 
       subtleChanges(); 
    }
    

The same LiteScript code, will emit an error during compilation -no debugging required-.

    options = options or {}
    if options.impCodeDefaultTrue is undefined, options.impCodeDefaultTrue=true
    if options.anotherOptDefZero is undefined, options.anotherOptDefZero=0
    initFunction options
    prepareDom options
    if options.impCodeDefaultTrue
       moreInit()
       subtleChanges()



###Uppercase, lowercase

* The compiler will emit a CASE MISMATCH error if you have two property names only differing in uppercase/lowercase, example: `options.total=10` and `options.toTals=0` -> CASE MISMATCH at compile-time 
* Class Names are required to be Capitalized.
* CONST are required to be all UPPERCASE.
* All other identifiers are required to be camelCased


##JAVASCRIPT, var, and Scope

Javascript (ES5) has 'function' and 'global' scope. Function scope means
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

  LiteScript, same code:

    // show even numbers
    var n = 0
    var ta = document.getElementById('result')
    var result=[]
    for i=2 while i<10
        var j
        if i mod 2 is 0, j = i
        if j, result.push(j)
    
    ta.innerText = result.join(',')

Expected result is: 2,4,6,8

this LiteScript code outs: 2,4,6,8



####Why the difference?

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


### Strings

Strings can either be double-quoted (`"`) or single quoted (`'`).

    x = 'this is a "string" with quotes in it'
    y = "so is 'this'"

### String Interpolation

Strings can contain interpolated values using the default interpolation char: `#` 
(as in CoffeeScript).

Example: 

    print "x is #{x}"

    print 'the function result plus 3 is #{fn(10)+3}'

Note: **ALL**: *Single, double and triple-multiline quoted strings* are interpolated.

    textArea.innerText = 'result of 1+3*3-7 = #{1+3-3*7}'
    print "the function returns: #{theFunction(reference,item,value)}"
    textArea.innerText = 'google.com HTML is: #{wait.for(httpGet,"www.google.com")}'

You can change the interpolation char using a lexer directive, 
for instance, to use `$` (as in ES6) instead of `#` 

    lexer option interpolation char is '$'

    print "The ${n}th element is: ${arr[n]}"
    ul.addChild '<li class="${class}"> ${item[inx]} ${obj.value} </li>'


### Defaults for objects 
It's a common pattern in javascript to use object parameters (named "options")
to pass misc options to functions.

Litescript provide a 'default' construct as syntax sugar for this common pattern

    function theApi(object,options,callback)

      default options =
        log: console.log
        encoding: 'utf-8'
        throwErrors: true
        debugLevel: 2
      end default

      //...function body...

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


The 'default' syntax its also useful if you want to assign a default value to a single var
Example:

    default x = 3  # -> js if(x===undefined)x=3;


## For Loops

There are 3 variants of `for loops` in LiteScript

### 1) 'for each index,value in array' 
to loop over *Array indexes and items* ###

Examples:

    var months = [ 'Jan', 'Feb', 'March' ]

    for each month in months
        print month

> Jan Feb March

    for each index,month in months
        print index,month

> 0 Jan 1 Feb 2 March

You can also use `where` to filter 

    for each index,month in months where month isnt 'Feb'
        print index,month

> 0 Jan 2 March


-------------------------------------------------------
### 2) 'for each property' 
to loop over *object property names and values* ###

Examples:

    //show all enumerable properties (proto chain)
    for each property name,value in object
        print "property '#{name}' is #{value}"

    // show Object own properties
    for each own property propName,propValue in object
        print '#{propName}:#{propValue}'

    // show own properties which are strings
    for each own property key,value in options 
        where type of value is 'string'
            print "'#{key}' has a string value"


-------------------------------------------------------
##### 3) 'for index=...' to create *numeric loops* 

This `for` variant is just a verbose expression 
of the standard C (and js) `for()` loop.
the loop variable increment is included by default.

Examples:

    for i=0 while i<3
      print months[i]

    // print even numbers until 10, except 6
    for i=0 until i is 10, where i isnt 6, i+=2
      print i

    // print chars 5 to 9, reversed
    var s = "a string"
    for p=9, while p>4, p--
      print s[p]



## While/Until Loop ##

Examples:

plain old C and js `while` loop still works the same

    var x = 0
    while x < 6
      x++
      print x

loop *until* condition is true, checks first

    x = 0
    until x is 5
      x++
      print x


## Do while|until... loop while|until ##

### Case 1) do-loop without any condition

a do-loop without any condition is an *infinite loop* 
(usually with a `break` statement inside)

Example:

    var x=1
    do
        x++
        print x
        when x is 10, break
    loop


### Case 2) do-loop with pre-condition

A do-loop with pre-condition, is the same as a while|until loop

Example:

    var x=1
    do while x<10
        x++
        print x
    loop


### Case 3) do-loop with post-condition

A do-loop with post-condition, execute the block, at least once, and after each iteration, 
checks the post-condition. 
It loops `while` the expression is true *or* `until` the expression is true 

Example:

    var x=1
    do
        x++
        print x
    loop while x < 10

    x=1
    do
        x++
        print x
    loop until x is 5


## break and continue  ##

`break` and `continue` allows you to *break* the loop at any point, 
or *continue* to the next iteration from any point inside the loop.

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

      // exit loop when function result > 1000
      when fn(x)>1000, break  

      x++

    loop



## Operators And Constants

Listed below are LiteScript's operators and constants, when they differ from CoffeScript or JavaScript

| LiteScript                 | CoffeeScript            | JavaScript                | Function                       |
|:--------------------------:|:-----------------------:|:-------------------------:|--------------------------------|
| `true`,`on`                | `true`, `yes`, `on`     | `true`                    | Boolean true                   |
| `false`,`off`              | `false`, `no`, `off`    | `false`                   | Boolean false                  |
| `and`                      | `and`                   | `&&`                      | Boolean and                    |
| `or`                       | `or`                    | <code>&#124;&#124;</code> | Boolean or                     |
| `no`,`not` (boolean not)   | `!`                     | `!`                       | Note: DIFFERENT PRECEDENDE     |
| `if no x` (falsey check)   | `if not x`, `if !x`     | `if (!x)`                 | Falsey check.                  |
| `if x` (truthy check)      | `if x`                  | `if (x)`                  | Truthy check.                  |
| `x? t else f` (ternary)    | `if x then t else f`    | `x? t: f` (ternary)       | Ternary operator.              |
| `is`,`===`                 | `is`, `==`              | `===`                     | Boolean equality               |
| `isnt`,`is not`,`!==`,`<>` | `isnt`, `!==`           | `!==`                     | Boolean inequality             |
| `this`,`.`                 | `this`,`@`              | `this`                    | Current object                 |
| `in`, `not in`             | `in`, `not in`          | `.indexOf(x)>=0`          | Find in array/string           |
| `has|hasnt property`       | `of`                    | `in`                      | Check property of object       |
| `instance of`,`instanceof` | `instanceof`            | `instanceof`              | prototype check                |
| `type of`,`typeof`         | `typeof`                | `typeof`                  | get type name                  |
| `into`                     | `=`                     | `=`                       | assignment-expression          |


###Boolean Negation: `not`
####Notes for the javascript programmer

In LiteScript, the *boolean negation* `not`, 
has LOWER PRECEDENCE than the arithmetic and logical operators.

In LiteScript: `if not a + 2 is 5` means `if not (a+2 is 5)`

In javascript: `if ( ! a + 2 === 5 )` means `if ( (!a)+2 === 5 )` 


## Classes and Prototypal Inheritance ##

http://javascript.crockford.com/prototypal.html
http://yehudakatz.com/2011/08/12/understanding-prototypes-in-javascript/

Classes are defined with the `class` keyword and are just
syntactic sugar for js Capitalized functions (js function-classes).

The `constructor` function, if present, is used as the body for the function-class.
default constructor is to call super constructor: `super.constructor.apply(this,arguments)`

`properties` can be declared inside the `class`, and are properties added to the prototype.

`method`s can be declared inside the `class` body, and are functions added to the prototype.

You cannot define local variables with the same name of a property (case insensitive).
To avoid subtle errors, you cannot define any two names in the same scope
differing only in uppercase/lowercase.

Checking if a object is instance of a Class
-------------------------------------------

`instance of Class` is used to check if an object is an instance of a class (or one of its parent Classes)

Synonyms:
  `is instance of Class`
  `instanceof Class`

Negation:
  `isnt instance of Class`

Full grammar:
`object-IDENTIFIER [(is|isnt|is not) (instance of|instanceof) Class-IDENTIFIER`

As expected, an object `is instance of` its Class and also `is instance of` 
all classes up the prototype chain.

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

    class FrumpyPerson extends Person

      function printName()
        print 'Frumpy ', .name

      function nameLength()
        return super.nameLength.call(this) + 6

    end class

    sue = new FrumpyPerson('Sue')
    sue.printName # prints 'Frumpy Sue'
    print sue instance of Person # prints true
    print sue instance of FrumpyPerson # prints true
    print jen instance of FrumpyPerson # prints false

You can add or override class methods after the class is defined (in another file, for example)
by using the `Append to class` construction.

The `Append to class` construction is a shortcut for altering the Class `prototype` object.

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

    append to class MyClass

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


Prototypal Inheritance, alter objects
-------------------------------------

You can use the `Append to object` construction
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

    Append to object y
        method myMethod(c)  #shadows MyClass's myMethod only on instance "y"
            me.value = c + 10
    end extend

    x.myMethod 10
    print x.value # prints 10, not changed

    y.myMethod 10
    print y.value # prints 20



`Append to` for the js programmer:
-------------------------------

LiteScript, Append to class:

    append to class MyClass

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


LiteScript, Append to object:

    Append to object y

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

    y.myMethod = function(c){ #only on this instance
      this.extraValue = c;
      this.value = c + 10;
    }


### Creating Shims ###

if you don't want to replace a method if it already exists in the Class
(for example: when creating shims), you can use:

`shim` before the method declaration.

Example:

    Append to class String

        shim method startsWith(text)
            return this.slice(0, text.length) is text

        shim method endsWith(text)
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

In order to add similar functionality, LiteScript have a `super` lexically scoped var.
`super` gets translated to `ParentClass.prototype`.

This allows you to use `super.fn.call(this,x)` to call a function named `fn` on the parent class,
when `fn` is shadowed in the current instance or class.

Example

    class BaseClass

      properties
        value

      function myMethod(c)
        return value+c

    end class

    class ChildClass extends BaseClass

      function myMethod(c) #shadows parent method
        return super.myMethod.call(this,c)+100 #call super's method
        // 'super' gets replaced by 'BaseClass.prototype', so it is
        // equivalent to: 'return BaseClass.prototype.myMethod.call(this,c)+100'

    end class

    var b = new BaseClass, c = new ChildClass

    b.value = 5

    print b.myMethod(10) # prints 15, BaseClass's method

    print c.myMethod(10) # prints 115, ChildClass method + BaseClass method



###Adjectives: Public/Export, Helper, Shim

By adding `public/export` to a function, class or var statement
you'll be adding it to the `exports` object (as node-js modules specification)

Example:

    public var Months =
      "jan"
      "feb"
      "march"

    public class MyClass

      properties
        value = 0

      method showValue
        print value

translate to js:

    var Months = ["jan","feb","march"];
    module.exports.Months = Months;

    function MyClass(){
      this.value=0;
    };
    MyClass.prototype.showValue = function(){
        console.log(this.value);
    };
    module.exports.MyClass = MyClass;

'Helper' is a valid adjective also, It can be added to `class`, `method` or `function`, but has no effects
on the produced javascript. Today it's only semantic information for the reader.


###Public default | Export default

By adding `public default` or `export default` to a module's function or class 
you'll be REPLACING  `module.exports` with the object. 

When you declare a object 'public default', all other 'public' objects
will be attached to the 'public default' object, in order to be exported also
as properties of the 'public default' object

Example:

    public default class MyClass

      properties
        value = 0

      method showValue
        print value


    public var Months =
      "jan"
      "feb"
      "march"


translate to js:

    function MyClass(){
      this.value=0;
    };
    MyClass.prototype.showValue = function(){
        console.log(this.value);
    };

    var Months = ["jan","feb","march"];
    MyClass.Months = Months; #export/public get attached to 'export default' object

    module.exports = MyClass; #export/public default
    

## try/catch, raise, fail, exception

`try`,`catch` and `finally` blocks work similarly to JavaScript/CoffeeScript.

The `throw` has a synonym: `raise`, and a similar construction `fail with`

`fail with` is like throw, but expects a string. It creates an Error object and then throws.

Example:

    fail with 'read error'

translates to js:

    throw new Error('read error');


You can also use `exception` as an alias for `catch`, without requiring a previous `try`.

Example:

    function test
      fail with 'exception here'
      b = 1 # never runs
    exception e
      print 'caught it!', e.message

js:


    function test(){ 
      try {
        throw new Error('here');
        b = 1; // never runs
      } 
      catch(e){
        console.log('caught it!', e.message);
      }
    }



## Regular Expressions

LiteScript pass-thru regex syntax to JavaScript's. There is an added operator: `like`, borrowed from SQL.
Like translates to RegExp.test()

`if myString like /abc|def/, return` translates to js: `if (/abc|def/.test(myString){return;}`


## Import statement (sugar for require calls, ES6-like implementation)

`import name` get translated to `require`

Grammar:
`ImportDeclaration: import (IDENTIFIER[='modulename'],)*`

`import fs[,path]` translates to javascript as: `var fs=require('fs'),path=require('path');`

if the module filename is not also a valid variable name, or you want to use another name:

`import sMap='source-map'`, translates to javascript: `var sMap=require('source-map');`

Note: `var name = require('name')` works as usual

Examples:

    import fs,path,util // -> var fs = require('fs'), path = require('path'), util = require('util');

    import
      fs
      pah
      sourceMap = "source-map"

      // js ->
      var fs = require('fs'),
          path = require('path'),
          SourceMap = require('source-map');


##Optional End keyword

All of the indented structures can be *optionally* ended with an "end" keyword, to ease code reading and to
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


Block end cues for the casual reader
------------------------------------

There is a problem I call "The closing braces wtf problem"

Let's say you were following the 900 lines of code from the function "theFirst", and you get distracted
by a phone call.

Picture the following "screen" in C (and js, java, etc)

<pre>
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
</pre>

Now, you're back at the screen , and you see a well-indented cascade of
closing curly braces... and you ask yourself... what are each one of them closing?
Now, you depend on some crazy jumping courtesy of your favorite editor's "find matching brace" function
(if you're lucky enough to be using your editor, and not, let's say, "reading code on the web").

In this case, you gain nothing by using indent as block scope (picture the same, but w/o the curly braces)
It's even worse: you can't even be sure of how many blocks are closing.

Because of this, LiteScript allows you to -optionally- use the `end` keyword to mark blocks closings.

So, to ease code reading, it's good to have optional end block statements, as in...

<pre>
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
</pre>

That's more clear, and easier to read.


LitesScript Corollary:
======================

  * if your LiteScript is harder to read than pure-js, you're doing it wrong.


##What Markdown Titles are considered CODE?

* MarkDown level 3 title plus a space `### ` is considered CODE indented 4 spaces if
  the line starts with: `[public|export|helper] [class|function|append to]`

Example: `### Export Class Lexer`, is a markdown title *and* introduces class Lexer. 
Is a *code* line line indented 4 spaces.

* MarkDown level 4 to 4 title plus one space '#### ' is considered CODE indented 5 to 6 spaces if:
the line starts with: `[helper|function|constructor|method|properties`]

Example: `##### Method tokenize(line:string)`, is a markdown title *and* introduces a method. 
Is a *code* line indented 6 spaces.


