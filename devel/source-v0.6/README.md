LiteScript Compiler Source v0.6
===============================

This .lite code is written in v0.5 SYNTAX, and when processed by v0.5 compiler,
will generate the v0.6 compiler, supporting v0.6 SYNTAX. 

Actually, v0.6 compiler is able to compile itself.

##IMPORTANT: development is made at /devel/source-v0.6

Ig you're reading /source/, it's just a snapshot of the las release.
Do NOT work on /source/, work on /devel/source-v0.6/.


v0.6 SYNTAX
-----------

### Preprocessor

added meta-statement 'compiler generate' to generate LiteScript code on the fly
while compiling.


### New syntax, property attributes for methods

     method x [not enumerable, configurable]

generates js: Object.defineProperty(...


### New syntax, '=' declares function body, when the body is just a Expression

    function square(x) = x*x

generates js: 

    function square(x){return x*x}


### New syntax, '-> x,y' shortcut for 'function(x,y)'

Example:

      fs.readFile 'test' -> err,data
          print 'file contents:',data

generates js: 

      fs.readFile('test',function(err,data){
          console.log('file contents',data);
      };

#####Differences with CoffeeScript

Example:

CoffeeScript:

    square = (x) -> x*x
    someVar = ( somevalue, someothervalue) -> somevalue * someothervalue + 10

    #filter
    array = [1..10]

    console.log array.filter (x) -> x > 5
    # => [6,7,8,9,10]

    http.get { host: 'checkip.dyndns.org' }, (res) ->

        data = ''

        res.on 'data', (chunk) ->
            data += chunk.toString()

        res.on 'end', () ->
            console.log data

LiteScript:

    function square(x) = x*x

    #verbose
    var someVar = function(somevalue, someothervalue) = somevalue * someothervalue + 10    

    #terse arrow
    someVar = -> somevalue, someothervalue = somevalue * someothervalue + 10

    #filter
    var array = [1,2,3,4,5,6,7,8,9,10]

    print array.filter ->x: x > 5
    # => [6,7,8,9,10]

    #Event Emitters
    http.get { host: 'checkip.dyndns.org' } -> res

        var data = ''

        res.on 'data' -> chunk
            data += chunk.toString()

        res.on 'end' -> 
            print data


#####Compelling Reasons to differ from stablished CoffeeScript on '->': 

Coffescript choice for '->' is a great choice, consistent with Coffescript approach, 
and with: 'everyting is a expression' and 'implicit return'

LiteScript approach, in order to enhance readability, separates statements and expressions, 
,has no implicit return, and uses the word 'function' to declare a function.
The best choice in order to do not confuse programmers would have been 
to use '->' as in CoffeScript, but sadly is not consistent with LiteScript base design.

1. Be ligth: By making '->' just a shortcut for 'function', it is only a lexical concept, ( 
syntax sugar), and not another semantical concept. 

2. Enhance readabiliy: '-> x,y' reads as 'function(x,y)' 

3. The following two statements are valid in CoffeeScript, but 
   have completely different meaning and effects:

    s = map (x) -> square(x)
    s = map(x) -> square(x)    

#####Details:

In LiteScript, '-> x' is just short for 'function(x)'

In CoffeeScript, '->' is the semantical way to declare a function
and function params go *BEFORE* the '->', ()-enclosed.

In LiteScript:

1. Since '->' *precede* arguments there is no MBM in LiteScript, you see '->',
    read 'function' and correctly read next tokens as function parameter names.

3. Since '->' *precede* arguments, "()" are optional, resulting a cleaner syntax, 
    specially for Event Emitters, as seen in the examples.

In CoffeeScript, Since '->' appears *after* the arguments, when you read left-to-rigth
you normally start reading "(somename,someothername)" as a parenthesized Expression: 

    var someVar = ( somevalue, someothervalue) -> somevalue * someothervalue + 10
    
you read `var someVar = ( somevalue `... and initially, your brain parse 
"var someVar =... complex parenthesized Expression..." then read `,` 
and get a MBM, scan for the '->', backtrack, and reparse the assignment as 
a function declaration.


###TO DO:
PropertyDeclaration:
    [enumerable][read-only] property IDENTIFIER ["=" value-Expression]
                [get ":" get-FunctionDeclaration]
                [set ":" set-FunctionDeclaration]

---

