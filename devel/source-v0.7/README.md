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


### New syntax, 'nice function' 'yield until' 'yield parallel map'

A 'nice function' is a function which is nice to others by 'yielding' the execution
thread to it's caller while it does a blocking operation.

Any standard node.js async function is, by this definition, a 'nice function'. 

One of Node.js basic design choice is 'single process-single thread' (you share
the thread with node's main event loop) so **all functions** in nodejs **must** be 
nice async functions.

In LiteScript, you can write a 'nice function' having the following advantages:

1. It's a 'standard node.js async function', last parameter is a 
(implicit) callback: function(err,data)

2. In the function's body, you can 'yield' while calling other standard async functions, 
waiting for the result data, until the function completes.

3. You can use 'try/catch' to handle exceptions. You'll catch if any async function returned
err on callback(err,data).

4. You play nice to node.js standard:
    - any 'nice function' can be called as a 'standard node.js async function'.
    - Any unhandled exception in your code, is converted to: "callback(err)"

5. You can use 'yield parallel map' to easily implement parallel execution.


#####Example 1 - get google.com DNS and reverse DNS

    global import dns, nicegen

    nice function resolveAndReverse

        try 

          var addresses = yield until dns.resolve4 'google.com'

          for each addr in addresses
              print "#{addr}, and the reverse for #{addr} is #{yield until dns.reverse addr}"

        catch err
              print "#{err.message} during resolveAndReverse"

    end nice function

main:

    resolveAndReverse function(err,data)
        if err, print "oops"


#####Example 2 - Same, with parallel reverse

    global import dns, nicegen

    nice function parallelResolveAndReverse

        try

            var addresses = yield until dns.resolve4 'google.com'

            var results = yield parallel map addresses, dns.reverse 

            for each index,addr in addresses
                print "#{addr}, and the reverse for #{addr} is #{results[index]}"

        catch err
            print "#{err.message} during parallel resolveAndReverse"

    end nice function

main:

    parallelResolveAndReverse  function(err,data)
        if err, print "oops"




### New syntax, 'return' and '=' declare function body, when the body is just a Expression

    function square(x) return x*x

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


#####Compelling Reasons to differ from CoffeeScript on '->': 

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

