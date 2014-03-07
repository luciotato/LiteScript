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


### New syntax, '->' terse arrow to declare functions

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


In CoffeeScript, '->' declares a function, but it goes *AFTER* the () enclosed parameters.

In LiteScript, '->' declares a function, but it goes *BEFORE* the parameters, and () is optional.

In LiteScript:

1. since '->' *precede* the arguments, '-> x,y' 
    is easily repalced by 'function(x,y)', so '->' is just syntax sugar 
    over the verbose "function".

2. Since '->' *precede* arguments there is no MBM in LiteScript, you know it's
    a function declaration and correctly parse function parameter names.

3. Since '->' *precede* arguments, () can be optional, resulting a cleaner syntax, 
    specially for Array.map, filter and Event Emitters, as seen in the examples.

In CoffeeScript, Since '->' is *after* the arguments, when you read code like: 

    var someVar = ( somevalue, someothervalue) -> somevalue * someothervalue + 10
    
you read `var someVar = ( somevalue `... and parse 
" var someVar equals a complex Parenthesized Expression..." then read `,` 
and get a MBM, scan for the '->', backtrack, and reparse the assignment as 
a function declaration.



###TO DO:
PropertyDeclaration:
    [enumerable][read-only] property IDENTIFIER ["=" value-Expression]
                [get ":" get-FunctionDeclaration]
                [set ":" set-FunctionDeclaration]

---

