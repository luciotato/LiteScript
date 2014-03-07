LiteScript Grammar
==================

The LiteScript Grammar is based on [Parsing Expression Grammars (PEGs)](http://en.wikipedia.org/wiki/Parsing_expression_grammar)
*with extensions*.

Grammar Meta-Syntax
-------------------

Each Grammar class, contains a 'grammar definition' as reference. 
The meta-syntax for the grammar definitions is an extended form of 
[Parsing Expression Grammars (PEGs)](http://en.wikipedia.org/wiki/Parsing_expression_grammar)

The differences with classic PEG are:
* instead of `Symbol <- definition`, we use `Symbol: definition` (colon instead of arrow)
* we use `[Symbol]` for optional symbols instead of `Symbol?` (brackets also groups symbols, the entire group is optional)
* symbols upper/lower case has meaning
* we add `(Symbol,)` for `comma separated List of` as a powerful syntax option

Examples:

`ReturnStatement`    : CamelCase is reserved for non-terminal symbol<br>
`function`       : all-lowercase means the literal word<br>
`":"`            : literal symbols are quoted<br>

`IDENTIFIER`,`OPER` : all-uppercase denotes entire classes of symbols<br>
`NEWLINE`,`EOF`     : or special unprintable characters<br>

`[to]`               : Optional symbols are enclosed in brackets<br>
`(var|let)`          : The vertical bar represents ordered alternatives<br>

`(Oper Operand)`     : Parentheses groups symbols<br>
`(Oper Operand)*`    : Asterisk after a group `()*` means the group can repeat (meaning one or more)<br>
`[Oper Operand]*`    : Asterisk after a optional group `[]*` means *zero* or more of the group.<br>

`[Expression,]` : the comma means a comma "Separated List".<br>
`Body: (Statement;)` : the semicolon means: a semicolon "Separated List".<br>


###"Separated List"

Example: `FunctionCall: IDENTIFIER '(' [Expression,] ')'`

`[Expression,]` means *optional* **comma "Separated List"** of Expressions. 
Since the comma is inside a **[ ]** group, it means the entire list is optional.

Example: `VarStatement: (VariableDecl,)`, where `VariableDecl: IDENTIFIER ["=" Expression]`

`(VariableDecl,)` means **comma "Separated List"** of `VariableDecl` 
Since the comma is inside a **( )** group, it means at least one of the Symbol is required.


Implementation
---------------

The LiteScript Grammar is defined as `classes`, one class for each non-terminal symbol.

The `.parse()` method of each class will try the grammar on the token stream and:
* If all tokens match, it will simply return after consuming the tokens. (success)
* On a token mismatch, it will raise a 'parse failed' exception.

When a 'parse failed' exception is raised, other classes can be tried. 
If no class parses ok, a compiler error is emitted and compilation is aborted.

if the error is *before* the class has determined this was the right language construction,
it is a soft-error and other grammars can be tried over the source code.

if the error is *after* the class has determined this was the right language construction 
(if the node was 'locked'), it is a hard-error and compilation is aborted.

The `ASTBase` module defines the base class for the grammar classes along with
utility methods to **req**uire tokens and allow **opt**ional ones.


### Dependencies 

    import ASTBase, log
    var debug = log.debug


Reserved Words
---------------

Words that are reserved in LiteScript and cannot be used as variable or function names
(There are no restrictions to object property names)

    var RESERVED_WORDS = [
        'namespace'
        'function','async'
        ,'class','method','constructor','prototype'
        ,'if','then','else','switch','when','case','end'
        ,'null','true','false','undefined'
        ,'and','or','but','no','not','has','hasnt','property','properties'
        ,'new','is','isnt'
        ,'do','loop','while','until','for','to','break','continue'
        ,'return','try','catch','throw','raise','fail','exception','finally'
        ,'with','arguments','in','instanceof','typeof'
        ,'var','let','default','delete','interface','implements','yield'
        ,'like','this','super'
        ,'export','compiler','compile','debugger']


Operators precedence
--------------------

The order of symbols here determines operators precedence

    var operatorsPrecedence = [ 
      '++','--', 'unary -', 'unary +', '~' ,'&', '^' ,'|'
      ,'>>','<<'
      ,'new','type of','instance of','has property'
      ,'*','/','%','+','-'
      ,'into','in'
      ,'>','<','>=','<=','is','<>','!==','like'
      ,'no','not','and','but','or'
      ,'?',':' 
    ]

--------------------------

LiteScript Grammar - AST Classes
================================
This file is code and documentation, you'll find a class 
for each syntax construction the compiler accepts.

### export class PrintStatement extends ASTBase

`PrintStatement: 'print' [Expression,]`

This handles `print` followed by an optional comma separated list of expressions

      properties
        args

      method parse()
        this.req 'print'

At this point we lock because it is definitely a `print` statement. Failure to parse the expression 
from this point is a syntax error.

        this.lock()
        this.args = this.optSeparatedList(Expression,",")


### export class VarStatement extends ASTBase

`VarStatement: (var|let) (VariableDecl,)+ `

`var` followed by a comma separated list of VariableDecl (one or more)

      properties 
        list:array
        export:boolean, default:boolean

      method parse()
        .req('var','let')
        .lock()
        .list = .reqSeparatedList(VariableDecl,",")


### export class VariableDecl extends ASTBase
    
`VariableDecl: IDENTIFIER [':' dataType-VariableRef] ['=' assignedValue-Expression]`

(variable name, optional type anotation and optionally assign a value)

Note: If no value is assigned, `= undefined` is assumed

VariableDecls are used in `var` statement, in function parameter declaration
and in class properties declaration

Example:  
  `var a : string = 'some text'` <br> 
  `function x ( a : string = 'some text', b, c=0)`

      properties
        name 
        type: VariableRef
        itemType: VariableRef
        assignedValue: Expression

      declare name affinity varDecl, paramDecl

      method parse()
        .name = .req('IDENTIFIER')
        .lock()

optional type annotation & 
optional assigned value 

        var dangling

        if .opt(':')
            if .lexer.token.type is 'NEWLINE' #dangling assignment ":"[NEWLINE]
                dangling=true
            else
                .parseType

        if not dangling and .opt('=')
            if .lexer.token.type is 'NEWLINE' #dangling assignment "="[NEWLINE]
                dangling=true
            else
                .assignedValue   = .req(Expression)
                return

        if dangling #dangling assignment :/= assume free-form object literal
            .assignedValue   = .req(FreeObjectLiteral)



##FreeObjectLiteral and Free-Form Separated List

In *free-form* mode, each item stands on its own line, and separators (comma/semicolon)
are optional, and can appear after or before the NEWLINE.

For example, given the previous example: **VarStatement: (IDENTIFIER ["=" Expression] ,)**,
all the following constructions are equivalent and valid in LiteScript:

Examples: /*

    //standard js
    var a = {prop1:30 prop2: { prop2_1:19, prop2_2:71} arr:["Jan","Feb","Mar"]}

    //LiteScript: mixed freeForm and comma separated
    var a =
        prop1: 30
        prop2:
          prop2_1: 19, prop2_2: 71
        arr: [ "Jan",
              "Feb", "Mar"]

    //LiteScript: in freeForm, commas are optional
    var a = 
        prop1: 30
        prop2:
          prop2_1: 19,
          prop2_2: 71,
        arr: [
            "Jan",
            "Feb"
            "Mar"
            ]

*/

##More about comma separated lists

The examples above only show Object and List Expressions, but *you can use free-form mode (multiple lines with the same indent), everywhere a comma separated list of items apply.*

The previous examples were for:

* Literal Object expression<br>
  because a Literal Object expression is:<br>
  "{" + a comma separated list of Item:Value pairs + "}"

and
* Literal Array expression<br>
  because a Literal Array expression is<br>
  "[" + a comma separated list of expressions + "]"

But the free-form option also applies for:

* Function parameters declaration<br>
  because Function parameters declaration is:<br>
  "(" + a comma separated list of paramter names + ")"

* Arguments, for any function call<br>
  because function call arguments are:<br>
  "(" + a comma separated list of expressions + ")"

* Variables declaration<br>
  because variables declaration is:<br>
  'var' + a comma separated list of: IDENTIFIER ["=" Expression]

Examples: /*

  js:

    Console.log(title,subtitle,line1,line2,value,recommendation)

  LiteScript available variations:

    print title,subtitle,
          line1,line2,
          value,recommendation

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

    function complexFn( 10, 4, 'sample'
       'see 1', 
       2+2, 
       null ){
      ...function body...
    };

  LiteScript:

    var
      a=10,b=20
      c=30,d=40

    function complexFn(
      10       # determines something important to this function
      4        # do not pass nulll to this
      'sample' # this is original data
      'see 1'  # note param
      2+2      # useful tip
      null     # reserved for extensions ;)
      )
      ...function body...
*/


### export class PropertiesDeclaration extends ASTBase

`PropertiesDeclaration: [namespace] properties (VariableDecl,)`

The `properties` keyword is used inside classes to define properties of the class instances.

      properties
        list: VariableDecl array
        toNamespace: boolean

      declare name affinity propDecl
      
      method parse()
        .toNamespace = .opt('namespace')? true else false
        .req('properties')
        .lock()
        .list = .reqSeparatedList(VariableDecl,',')


### export class WithStatement extends ASTBase

`WithStatement: with VariableRef Body`

The WithStatement simplifies calling several methods of the same object:
Example:
```    
with frontDoor
    .show
    .open
    .show
    .close
    .show
```

      properties
        varRef, body

      method parse()
        .req 'with'
        .lock()
        .name = ASTBase.getUniqueVarName('with')  #unique 'with' storage var name
        .varRef = .req(VariableRef)
        .body = .req(Body)


### export class TryCatch extends ASTBase

`TryCatch: 'try' Body ExceptionBlock`

Defines a `try` block for trapping exceptions and handling them. 

      properties body,exceptionBlock

      method parse()
        .req 'try'
        .lock()
        .body = .req(Body)

        .exceptionBlock = .req(ExceptionBlock)


### export class ExceptionBlock extends ASTBase

`ExceptionBlock: (exception|catch) IDENTIFIER Body [finally Body]`

Defines a `catch` block for trapping exceptions and handling them. 
If no `try` preceded this construction, `try` is assumed at the beggining of the function

      properties 
        catchVar:string
        body,finallyBody

      method parse()
        .req 'catch','exception','Exception'
        .lock()

get catch variable - Note: catch variables in js are block-scoped

        .catchVar = .req('IDENTIFIER')

get body 

        .body = .req(Body)

get optional "finally" block

        if .opt('finally'), .finallyBody = .req(Body)


### export class ThrowStatement extends ASTBase
      
`ThrowStatement: (throw|raise|fail with) Expression`

This handles `throw` and its synonyms followed by an expression 

      properties specifier, expr

      method parse()
        .specifier = .req('throw', 'raise', 'fail')

At this point we lock because it is definitely a `throw` statement

        .lock()
        if .specifier is 'fail', .req 'with'
        .expr = .req(Expression) #trow expression


### export class ReturnStatement extends ASTBase

`ReturnStatement: return Expression`

      properties expr

      method parse()
        .req 'return'
        .lock()
        .expr = .opt(Expression)


### export class IfStatement extends ASTBase
      
`IfStatement: (if|when) Expression (then|',') SingleLineStatement [ElseIfStatement|ElseStatement]*`
`IfStatement: (if|when) Expression Body [ElseIfStatement|ElseStatement]*`
 
Parses `if` statments and any attached `else` or chained `else if` 

      properties 
        conditional,body,elseStatement

      method parse()

        .req 'if','when'
        .lock()
        .conditional = .req(Expression)

after `,` or `then`, a statement on the same line is required 
if we're processing all single-line if's, ',|then' is *required*

choose same body class as parent:
either SingleLineStatement or Body (multiline indented)

        if .opt(',','then')
            .body = .req(SingleLineStatement)
            .req 'NEWLINE'

        else # and indented block
            .body = .req(Body)
        end if

control: "if"-"else" are related by having the same indent

        if .lexer.token.value is 'else'

            if .lexer.index isnt 0 
                .throwError 'expected "else" to start on a new line'

            if .lexer.indent < .indent
                #token is 'else' **BUT IS LESS-INDENTED**. It is not the "else" to this "if"
                return

            if .lexer.indent > .indent
                .throwError "'else' statement is over-indented"

        end if

Now get optional `[ElseIfStatement|ElseStatement]`

        .elseStatement = .opt(ElseIfStatement, ElseStatement)


### export class ElseIfStatement extends ASTBase

`ElseIfStatement: (else|otherwise) if Expression Body`

This class handles chained else-if statements

      properties 
        nextIf

      method parse()
        .req 'else'
        .req 'if'
        .lock()

return the consumed 'if', to parse as a normal `IfStatement`

        .lexer.returnToken()
        .nextIf = .req(IfStatement)


### export class ElseStatement extends ASTBase

`ElseStatement: else (Statement | Body) `

This class handles closing "else" statements
      
      properties body
      
      method parse()
        .req 'else'
        .lock()
        .body = .req(Body)


Loops
=====

LiteScript provides the standard js and C `while` loop, but also provides a `until` loop
and a versatil `do loop while|until`


DoLoop
------

`DoLoop: do [pre-WhileUntilExpression] [":"] Body loop`
`DoLoop: do [":"] Body loop [post-WhileUntilExpression]`

do-loop can have a optional pre-condition or a optional post-condition

##### Case 1) do-loop without any condition

a do-loop without any condition is an *infinite loop* (usually with a `break` statement inside)

Example: 
```
var x=1
do:
  x++
  print x
  when x is 10, break
loop
```

##### Case 2) do-loop with pre-condition

A do-loop with pre-condition, is the same as a while|until loop

Example:
```
var x=1
do while x<10
  x++
  print x
loop
```

##### Case 3) do-loop with post-condition

A do-loop with post-condition, execute the block, at least once, and after each iteration, 
checks the post-condition, and loops `while` the expression is true
*or* `until` the expression is true 

Example:
```
var x=1
do
  x++
  print x
loop while x < 10
```

#### Implementation

    public class DoLoop extends ASTBase
      
      properties 
        preWhileUntilExpression
        body
        postWhileUntilExpression

      method parse()
        .req 'do'
        if .opt('nothing')
          .throwParseFailed('is do nothing')
        .opt ":"
        .lock()

Get optional pre-condition

        .preWhileUntilExpression = .opt(WhileUntilExpression)
        .body = .opt(Body)
        .req "loop"

Get optional post-condition

        .postWhileUntilExpression = .opt(WhileUntilExpression)
        if .preWhileUntilExpression and .postWhileUntilExpression
          .sayErr "Loop: cannot have a pre-condition a and post-condition at the same time"


### export class WhileUntilLoop extends DoLoop
      
`WhileUntilLoop: pre-WhileUntilExpression Body`

Execute the block `while` the condition is true or `until` the condition is true.
WhileUntilLoop are a simpler form of loop. The `while` form, is the same as in C and js.
WhileUntilLoop derives from DoLoop, to use its `.produce()` method.

      properties preWhileUntilExpression, body

      method parse()
        .preWhileUntilExpression = .req(WhileUntilExpression)
        .lock()
        .body = .opt(Body)


### export helper class WhileUntilExpression extends ASTBase
      
common symbol for loops conditions. Is the word 'while' or 'until' 
followed by a boolean-Expression

`WhileUntilExpression: ('while'|'until') boolean-Expression`

      properties expr

      method parse()
        .name = .req('while','until')
        .lock()
        .expr = .req(Expression)


### export class LoopControlStatement extends ASTBase
      
`LoopControlStatement: (break|continue)`

This handles the `break` and `continue` keywords.
'continue' jumps to the start of the loop (as C & Js: 'continue')

      properties control

      method parse()
        .control = .req('break','continue')


### export class DoNothingStatement extends ASTBase

`DoNothingStatement: do nothing`

      method parse()
        .req 'do'
        .req 'nothing'


## For Statement

### export class ForStatement extends ASTBase
      
`ForStatement: (ForEachProperty|ForEachInArray|ForIndexNumeric)`

There are 3 variants of `ForStatement` in LiteScript

      properties 
        variant: ASTBase

      method parse()
        declare valid .createScope

We start with commonn `for` keyword

        .req 'for'
        .lock()

we now require one of the variants

        .variant = .req(ForEachProperty,ForEachInArray,ForIndexNumeric)

##Variant 1) **for each property** 
###Loop over **object property names**

Grammar:
`ForEachProperty: for each [own] property name-VariableDecl ["," value-VariableDecl] in object-VariableRef [where Expression]`

where `name-VariableDecl` is a variable declared on the spot to store each property name,
and `object-VariableRef` is the object having the properties 

if the optional `own` keyword is used, only instance properties will be looped 
(no prototype chain properties)

### export class ForEachProperty extends ASTBase

      properties 
        ownOnly
        indexVar:VariableDecl, mainVar:VariableDecl
        iterable, where:ForWhereFilter
        body

      method parse()
        .req('each')

then check for optional `own`

        .ownOnly = .opt('own')? true: false

next we require: 'property', and lock.

        .req('property')  
        .lock()

Get index variable name (to store property names)

        .indexVar = .req(VariableDecl)

if comma present, get main variable name (to store property value)

        if .opt(",")
          .mainVar = .req(VariableDecl)

Then we require `in`, and the iterable-Expression (a object)

        .req 'in'
        .iterable = .req(Expression)

optional where expression (filter)

        .where = .opt(ForWhereFilter)

Now, get the loop body

        .body = .req(Body)


##Variant 2) **for each in** 
### loop over **Arrays**

Grammar:
`ForEachInArray: for each [index-VariableDecl,]item-VariableDecl in array-VariableRef [where Expression]`

where:
* `index-VariableDecl` is a variable declared on the spot to store each item index (from 0 to array.length)
* `item-VariableDecl` is a variable declared on the spot to store each array item (array[index])
and `array-VariableRef` is the array to iterate over

### export class ForEachInArray extends ASTBase
      
      properties 
        indexVar:VariableDecl, mainVar:VariableDecl, iterable:Expression
        where:ForWhereFilter
        body

      method parse()
      
first, require 'each'

        .req 'each'

Get index variable and value variable.
Keep it simple: index and value are always variables declared on the spot

        .mainVar = .req(VariableDecl)

a comma means: previous var was 'index', so register as index and get main var
  
        if .opt(',')
          .indexVar = .mainVar
          .mainVar = .req(VariableDecl)

we now *require* `in` and the iterable (array)

        .req 'in'
        .lock()
        .iterable = .req(Expression)

optional where expression

        .where = .opt(ForWhereFilter)

and then, loop body

        .body = .req(Body)


##Variant 3) **for index=...** 
### to do **numeric loops**

This `for` variant is just a verbose expressions of the standard C (and js) `for(;;)` loop

Grammar:
`ForIndexNumeric: for index-VariableDecl [[","] (while|until|to) end-Expression ["," increment-Statement] ["," where Expression]`

where `index-VariableDecl` is a numeric variable declared on the spot to store loop index,
`start-Expression` is the start value for the index (ussually 0)
`end-Expression` is:
- the end value (`to`)
- the condition to keep looping (`while`) 
- the condition to end looping (`until`)
<br>and `increment-Statement` is the statement used to advance the loop index. 
If omitted the default is `index++`

### export class ForIndexNumeric extends ASTBase
      
      properties 
        indexVar:VariableDecl
        conditionPrefix, endExpression
        where
        increment: Statement
        body

we require: a variableDecl, with optional assignment

      method parse()
        .indexVar = .req(VariableDecl)
        .lock()

next comma is  optional, then
get 'while|until|to' and condition

        .opt ','
        .conditionPrefix = .req('while','until','to')
        .endExpression = .req(Expression)

another optional comma, and ForWhereFilter

        .opt ','
        .where = .opt(ForWhereFilter)

another optional comma, and increment-Statement

        .opt ','
        .increment = .opt(SingleLineStatement)

Now, get the loop body

        .body = .req(Body)



### public helper class ForWhereFilter extends ASTBase
`ForWhereFilter: [NEWLINE] where Expression`

This is a helper symbol denoting optional filter for the ForLoop variants.
is: optional NEWLINE, then 'where' then filter-Expression

      properties
        filter

      method parse
        var optNewLine = .opt('NEWLINE')

        if .opt('where')
          .lock()
          .filter = .req(Expression)

        else
          if optNewLine, .lexer.returnToken # return NEWLINE
          .throwParseFailed "expected '[NEWLINE] where'"

--------------------------------

### public class DeleteStatement extends ASTBase
`DeleteStatement: delete VariableRef`
      
      properties
        varRef

      method parse
        .req('delete')
        .lock()
        .varRef = .req(VariableRef)


### export class AssignmentStatement extends ASTBase
      
`AssignmentStatement: VariableRef ASSIGN Expression`
<br>`ASSIGN: ("="|"+="|"-="|"*="|"/=")`

      properties lvalue:VariableRef, rvalue:Expression

      method parse()
      
        declare valid .parent.preParsedVarRef

        if .parent.preParsedVarRef
          .lvalue  = .parent.preParsedVarRef # get already parsed VariableRef 
        else
          .lvalue  = .req(VariableRef)

require an assignment symbol: ("="|"+="|"-="|"*="|"/=")

        .name = .req('ASSIGN')
        .lock()

        if .lexer.token.type is 'NEWLINE' #dangling assignment
          .rvalue  = .req(FreeObjectLiteral) #assume Object Expression in freeForm mode
        else
          .rvalue  = .req(Expression)


-----------------------

### export class VariableRef extends ASTBase
      
`VariableRef: ('--'|'++') IDENTIFIER [Accessors] ('--'|'++')`

`VariableRef` is a Variable Reference

a VariableRef can include chained 'Accessors', which do:
- access a property of the object : `.`-> **PropertyAccess** and `[...]`->**IndexAccess**
- assume the variable is a function and perform a function call :  `(...)`->**FunctionAccess**


      properties 
        preIncDec
        postIncDec

      declare name affinity varRef

      method parse()
        .preIncDec = .opt('--','++')
        .executes = false

assume 'this.x' on '.x', or if we're in a WithStatement, the 'with' .name

get var name

        if .opt('.','SPACE_DOT') # note: DOT has SPACES in front when .property used as parameter
  
            #'.name' -> 'x.name'
            .lock()

            if .getParent(WithStatement) into var withStatement 
                .name = withStatement.name
            else
                .name = 'this' #default replacement for '.x'

            var member = .req('IDENTIFIER')
            .addAccessor new PropertyAccess(this,member)

        else

            .name = .req('IDENTIFIER')

        .lock()

Now we check for accessors: 
<br>`.`->**PropertyAccess** 
<br>`[...]`->**IndexAccess** 
<br>`(...)`->**FunctionAccess**

Note: **.paserAccessors()** will:
- set .hasSideEffects=true if a function accessor is parsed
- set .executes=true if the last accessor is a function accessor

        .parseAccessors

Replace lexical `super` by `#{SuperClass name}.prototype`
    
        if .name is 'super'

            var classDecl = .getParent(ClassDeclaration)
            if no classDecl
              .throwError "can't use 'super' outside a class method"

            if classDecl.varRefSuper
                #replace name='super' by name = #{SuperClass name}
                .name = classDecl.varRefSuper.name
            else
                .name ='Object' # no superclass means 'Object' is super class

            #insert '.prototype.' as first accessor (after super class name)
            .insertAccessorAt 0, 'prototype'

            #if super class is a composed name (x.y.z), we must insert those accessors also
            # so 'super.myFunc' turns into 'NameSpace.subName.SuperClass.prototype.myFunc'
            if classDecl.varRefSuper and classDecl.varRefSuper.accessors
                #insert super class accessors
                var position = 0
                for each ac in classDecl.varRefSuper.accessors
                  if ac instanceof PropertyAccess
                    .insertAccessorAt position++, ac.name

        end if super

Allow 'null' as alias to 'do nothing'

        if .name is 'null', .executes = true

Hack: after 'into var', allow :type for simple (no accessor) var names

        if .getParent(Statement).intoVars and .opt(":")
            .type = .req(VariableRef)

check for post-fix increment/decrement

        .postIncDec = .opt('--','++')

If this variable ref has ++ or --, IT IS CONSIDERED a "call to execution" in itself, 
a "imperative statement", because it has side effects. 
(`i++` has a "imperative" part, It means: "give me the value of i, and then increment it!")

        if .preIncDec or .postIncDec 
          .executes = true
          .hasSideEffects = true

Note: In LiteScript, *any VariableRef standing on its own line*, it's considered 
a function call. A VariableRef on its own line means "execute this!",
so, when translating to js, it'll be translated as a function call, and `()` will be added.
If the VariableRef is marked as 'executes' then it's assumed it is alread a functioncall, 
so `()` will NOT be added.

Examples:
---------
    LiteScript   | Translated js  | Notes
    -------------|----------------|-------
    start        | start();       | "start", on its own, is considered a function call
    start(10,20) | start(10,20);  | Normal function call
    start 10,20  | start(10,20);  | function call w/o parentheses
    start.data   | start.data();  | start.data, on its own, is considered a function call
    i++          | i++;           | i++ is marked "executes", it is a statement in itself

Keep track of 'require' calls, to import modules (recursive)

        if .name is 'require'
            .getParent(Module).requireCallNodes.push this            

---------------------------------
##### helper method toString()
This method is only valid to be used in error reporting.
function accessors will be output as "(...)", and index accessors as [...]

        var result = (.preIncDec or "") + .name
        if .accessors
          for each ac in .accessors
            result += ac.toString()
        return result + (.postIncDec or "")

-----------------------

## Accessors

`Accessors: (PropertyAccess|FunctionAccess|IndexAccess)`

Accessors: 
  `PropertyAccess: '.' IDENTIFIER`
  `IndexAccess:    '[' Expression ']'`
  `FunctionAccess: '(' [Expression,]* ')'`

Accessors can appear after a VariableRef (most common case)
but also after a String constant, a Regex Constant,
a ObjectLiteral and a ArrayLiteral 

Examples:
- `myObj.item.fn(call)`  <-- 3 accesors, two PropertyAccess and a FunctionAccess
- `myObj[5](param).part`  <-- 3 accesors, IndexAccess, FunctionAccess and PropertyAccess
- `[1,2,3,4].indexOf(3)` <-- 2 accesors, PropertyAccess and FunctionAccess


#####Actions:

`.` -> PropertyAccess: Search the property in the object and in his pototype chain.
                      It resolves to the property value

`[...]` -> IndexAccess: Same as PropertyAccess

`(...)` -> FunctionAccess: The object is assumed to be a function, and the code executed. 
                      It resolves to the function return value.

## Implementation
We provide a class Accessor to be super class for the three accessors types.

### export class Accessor extends ASTBase
      properties
        args:array

      method parse
        fail with 'abstract'
      method toString
        fail with 'abstract'


### export class PropertyAccess extends Accessor

`.` -> PropertyAccess: get the property named "n" 

`PropertyAccess: '.' IDENTIFIER`
  
      method parse()
        .req('.')
        .lock()
        .name = .req('IDENTIFIER') 

      method toString()
        return '.'+.name


### export class IndexAccess extends Accessor

`[n]`-> IndexAccess: get the property named "n" / then nth index of the array
                       It resolves to the property value

`IndexAccess: '[' Expression ']'`

      method parse()
        
        .req "["
        .lock()
        .name = .req( Expression )
        .req "]" #closer ]

      method toString()
        return '[...]'


### export class FunctionAccess extends Accessor
`(...)` -> FunctionAccess: The object is assumed to be a function, and the code executed. 
                           It resolves to the function return value.

`FunctionAccess: '(' [Expression,]* ')'`

      properties 
        args:array

      method parse()
        .req "("
        .lock()
        .args = .optSeparatedList( Expression, ",", ")" ) #comma-separated list of expressions, closed by ")"

      method toString()
        return '(...)'

## Helper Functions to parse accessors on any node

### Append to class ASTBase
      properties 
        accessors: Accessor array      
        executes, hasSideEffects

##### helper method parseAccessors
      
          #(performance) only if the next token in ".[("
          if .lexer.token.value not in '.[(' then return

We store the accessors in the property: .accessors
if the accessors node exists, .list will have **at least one item**.
Loop parsing accessors

          do
              var ac:Accessor = .parseDirect(.lexer.token.value, AccessorsDirect)
              if no ac, break
              .addAccessor ac
          loop #continue parsing accesors
          return

##### helper method insertAccessorAt(position,item)

            #create accessors list, if there was none
            if no .accessors, .accessors = []

            #polymorphic params: string defaults to PropertyAccess
            if type of item is 'string', item = new PropertyAccess(this, item)

            #insert
            .accessors.splice position,0,item


##### helper method addAccessor(item)

            #create accessors list, if there was none
            if no .accessors, .accessors = []
            .insertAccessorAt .accessors.length, item

if the very last accesor is "(", it means the entire expression is a function call,
it's a call to "execute code", so it's a imperative statement on it's own.
if any accessor is a function call, this statement is assumed to have side-effects

            .executes = item instance of FunctionAccess
            if .executes, .hasSideEffects = true




## Operand

```
Operand: (
  (NumberLiteral|StringLiteral|RegExpLiteral|ArrayLiteral|ObjectLiteral
                    |ParenExpression|FunctionDeclaration)[Accessors])
  |VariableRef) 
```

Examples:
<br> 4 + 3 -> `Operand Oper Operand`
<br> -4    -> `UnaryOper Operand`

A `Operand` is the data on which the operator operates.
It's the left and right part of a binary operator.
It's the data affected (righ) by a UnaryOper.

To make parsing faster, associate a token type/value,
with exact AST class to call parse() on.

    var OPERAND_DIRECT_TYPE = 
          'STRING': StringLiteral
          'NUMBER': NumberLiteral
          'REGEX': RegExpLiteral
          'SPACE_BRACKET':ArrayLiteral # one or more spaces + "[" 
    

    var OPERAND_DIRECT_TOKEN = 
          '(':ParenExpression
          '[':ArrayLiteral
          '{':ObjectLiteral
          'function': FunctionDeclaration
          '->': FunctionDeclaration
          'case': CaseWhenExpression
          'yield': YieldExpression
    

### public class Operand extends ASTBase

fast-parse: if it's a NUMBER: it is NumberLiteral, if it's a STRING: it is StringLiteral (also for REGEX)
or, upon next token, cherry pick which AST nodes to try,
'(':ParenExpression,'[':ArrayLiteral,'{':ObjectLiteral,'function': FunctionDeclaration

      method parse()
        .name = .parseDirect(.lexer.token.type, OPERAND_DIRECT_TYPE) 
          or .parseDirect(.lexer.token.value, OPERAND_DIRECT_TOKEN)

if it was a Literal, ParenExpression or FunctionDeclaration
besides base value, this operands can have accessors. For example: `"string".length` , `myObj.fn(10)`

        if .name
            .parseAccessors

else, (if not Literal, ParenExpression or FunctionDeclaration)
it must be a variable ref 

        else
            .name = .req(VariableRef)

        end if

    end Operand


## Oper

```
Oper: ('~'|'&'|'^'|'|'|'>>'|'<<'
        |'*'|'/'|'+'|'-'|mod
        |instance of|instanceof
        |'>'|'<'|'>='|'<='
        |is|'==='|isnt|is not|'!=='
        |and|but|or
        |[not] in
        |(has|hasnt) property
        |? true-Expression : false-Expression)`
```

An Oper sits between two Operands ("Oper" is a "Binary Operator", 
different from *UnaryOperators* which optionally precede a Operand)

If an Oper is found after an Operand, a second Operand is expected.

Operators can include:
* arithmetic operations "*"|"/"|"+"|"-"
* boolean operations "and"|"or"
* `in` collection check.  (js: `indexOx()>=0`)
* instance class checks   (js: instanceof)
* short-if ternary expressions ? :
* bit operations (|&)
* `has property` object property check (js: 'propName in object')

### public class Oper extends ASTBase

      properties 
        negated
        left:Operand, right:Operand
        pushed, precedence
        intoVar

Get token, require an OPER.
Note: 'ternary expression with else'. `x? a else b` should be valid alias for `x?a:b`
        
      method parse()
        declare valid .getPrecedence
        declare valid .parent.ternaryCount
        if .parent.ternaryCount and .opt('else')
            .name=':' # if there's a open ternaryCount, 'else' is converted to ":"
        else
            .name = .req('OPER')

        .lock() 

A) validate double-word opers

A.1) validate `instance of`

        if .name is 'instance'
            .name += ' '+.req('of')

A.2) validate `has|hasnt property`

        else if .name is 'has'
            .negated = .opt('not')? true:false # set the 'negated' flag
            .name += ' '+.req('property')

        else if .name is 'hasnt'
            .negated = true # set the 'negated' flag
            .name += 'has '+.req('property')

A.3) also, check if we got a `not` token.
In this case we require the next token to be `in|like` 
`not in|like` is the only valid (not-unary) *Oper* starting with `not`

        else if .name is 'not'
            .negated = true # set the 'negated' flag
            .name = .req('in','like') # require 'not in'|'not like'

A.4) handle 'into [var] x', assignment-Expression

        if .name is 'into' and .opt('var')
            .intoVar = true
            .getParent(Statement).intoVars = true #mark owner statement

B) Synonyms 

else, check for `isnt`, which we treat as `!==`, `negated is` 

        else if .name is 'isnt'
          .negated = true # set the 'negated' flag
          .name = 'is' # treat as 'Negated is'

else check for `instanceof`, (old habits die hard)

        else if .name is 'instanceof'
          .name = 'instance of'

        end if

C) Variants on 'is/isnt...'

        if .name is 'is' # note: 'isnt' was converted to 'is {negated:true}' above

  C.1) is not<br>
  Check for `is not`, which we treat as `isnt` rather than `is ( not`.
  
            if .opt('not') # --> is not/has not...
                if .negated, .throwError '"isnt not" is invalid'
                .negated = true # set the 'negated' flag

            end if

  C.2) accept 'is/isnt instance of' and 'is/isnt instanceof'

            if .opt('instance')
                .name = 'instance '+.req('of')
            else if .opt('instanceof')
                .name = 'instance of'

            end if

Get operator precedence index

        .getPrecedence

      end Oper parse


###getPrecedence:
Helper method to get Precedence Index (lower number means higher precedende)

      helper method getPrecedence()

        .precedence = operatorsPrecedence.indexOf(.name)
        if .precedence is -1 
            debugger
            fail with "OPER '#{.name}' not found in the operator precedence list"



###Boolean Negation: `not`

####Notes for the javascript programmer

In LiteScript, *the boolean negation* `not`, 
has LOWER PRECEDENCE than the arithmetic and logical operators.

In LiteScript:  `if not a + 2 is 5` means `if not (a+2 is 5)`

In javascript: `if ( ! a + 2 === 5 )` means `if ( (!a)+2 === 5 )` 

so remember **not to** mentally translate `not` to js `!`


UnaryOper
---------

`UnaryOper: ('-'|'+'|new|type of|typeof|not|no|'~')`

A Unary Oper is an operator acting on a single operand.
Unary Oper extends Oper, so both are `instance of Oper`

Examples:

1· `not`     *boolean negation*     `if not ( a is 3 or b is 4)`
2. `-`       *numeric unary minus*  `-(4+3)`
2. `+`       *numeric unary plus*   `+4` (can be ignored)
3. `new`     *instantiation*        `x = new classes[2]()`
4. `type of` *type name access*     `type of x is 'string'` 
5. `no`      *'falsey' check*       `if no options then options={}` 
6. `~`       *bit-unary-negation*   `a = ~xC0 + 5`

    var unaryOperators = ['new','-','no','not','type','typeof','~','+']

    public class UnaryOper extends Oper

require a unaryOperator

      method parse()
          .name = .reqOneOf(unaryOperators)

Check for `type of` - we allow "type" as var name, but recognize "type of" as UnaryOper

          if .name is 'type'
              if .opt('of')
                .name = 'type of'
              else
                .throwParseFailed 'expected "of" after "type"'
                    
Lock, we have a unary oper

          .lock()

Rename - and + to 'unary -' and 'unary +', 
'typeof' to 'type of'

          if .name is '-'
              .name = 'unary -'

          else if .name is '+'
              .name = 'unary +'

          else if .name is 'typeof'
              .name = 'type of'

          end if

calculate precedence - Oper.getPrecedence()

          .getPrecedence()

      end parse 


-----------
## Expression

`Expression: [UnaryOper] Operand [Oper [UnaryOper] Operand]*`

The expression class parses intially a *flat* array of nodes.
After the expression is parsed, a *Expression Tree* is created based on operator precedence.

    public class Expression extends ASTBase
      
      properties operandCount, root, ternaryCount
 
      method parse()
      
        declare valid .growExpressionTree
        declare valid .root.name.type

        var arr = []
        .operandCount = 0 
        .ternaryCount = 0

        do

Get optional unary operator
(performance) check token first

            if .lexer.token.value in unaryOperators
                var unaryOper = .opt(UnaryOper)
                if unaryOper
                    arr.push unaryOper
                    .lock()

Get operand

            arr.push .req(Operand) 
            .operandCount += 1 
            .lock()

(performance) Fast exit for common tokens: `= , ] )` -> end of expression.

            if .lexer.token.type is 'ASSIGN' or .lexer.token.value in ',)]' 
                break

optional newline **before** `Oper`
to allow a expressions to continue on the next line.
We look ahead, and if the first token in the next line is OPER
we consume the NEWLINE, allowing multiline expressions. 
The exception is ArrayLiteral, because in free-form mode
the next item in the array on the next line, can start with a unary operator

            if .lexer.token.type is 'NEWLINE' and not (.parent instanceof ArrayLiteral)
              .opt 'NEWLINE' #consume newline
              if .lexer.indent<=.indent or .lexer.token.type isnt 'OPER' # the first token in the next line isnt OPER (+,and,or,...)
                .lexer.returnToken() # return NEWLINE
                break #end Expression

Try to parse next token as an operator

            var oper = .opt(Oper)
            if no oper then break # no more operators, end of expression

keep count on ternaryOpers

            if oper.name is '?'
                .ternaryCount++

            else if oper.name is ':'
                if no .ternaryCount //":" without '?'. It can be 'case' expression ending ":"
                    .lexer.returnToken
                    break //end of expression
                .ternaryCount--

            end if

If it was an operator, store, and continue because we expect another operand.
(operators sits between two operands)

            arr.push(oper)

allow dangling expression. If the line ends with OPER, 
we consume the NEWLINE and continue parsing the expression on the next line

            .opt 'NEWLINE' #consume optional newline after Oper

        loop

Control: complete all ternary operators

        if .ternaryCount, .throwError 'missing (":"|else) on ternary operator (a? b else c)'

Fix 'new' calls. Check parameters for 'new' unary operator, for consistency, add '()' if not present,
so `a = new MyClass` turns into `a = new MyClass()`

        for each index,item in arr
          declare item:UnaryOper         
          if item instanceof UnaryOper and item.name is 'new'
            var operand = arr[index+1]
            if operand.name instanceof VariableRef
                var varRef = operand.name
                if no varRef.executes, varRef.addAccessor new FunctionAccess(this)

Now we create a tree from .arr[], based on operator precedence

        .growExpressionTree(arr)


      end method Expression.parse()


Grow The Expression Tree
========================

Growing the expression AST
--------------------------

By default, for every expression, the parser creates a *flat array*
of UnaryOper, Operands and Operators.

`Expression: [UnaryOper] Operand [Oper [UnaryOper] Operand]*`

For example, `not 1 + 2 * 3 is 5`, turns into:

.arr =  ['not','1','+','2','*','3','is','5']

In this method we create the tree, by pushing down operands, 
according to operator precedence.

Te process runs until there is only one operator left in the root node 
(the one with lower precedence)

For example, `not 1 + 2 * 3 is 5`, turns into:

```
   not
      \
      is
     /  \
   +     5
  / \   
 1   *  
    / \ 
    2  3
```


`3 in a and not 4 in b`
```
      and
     /  \
   in    not
  / \     |
 3   a    in
         /  \
        4   b
```

`3 in a and 4 not in b`
```
      and
     /  \
   in   not-in
  / \    / \
 3   a  4   b

```


`-(4+3)*2`
```
   *
  / \
 -   2
  \
   +
  / \
 4   3
```

Expression.growExpressionTree()
-------------------------------

while there is more than one operator in the root node...

      method growExpressionTree(arr:array)
        do while arr.length > 1

find the one with highest precedence (lower number) to push down
(on equal precedende, we use the leftmost)

          var pos=-1
          var minPrecedenceInx = 100
          for each inx,item in arr

            //debug "item at #{inx} #{item.name}, Oper? #{item instanceof Oper}. precedence:",item.precedence
            declare valid item.precedence
            declare valid item.pushed

            if item instanceof Oper
              if not item.pushed and item.precedence < minPrecedenceInx
                pos = inx
                minPrecedenceInx = item.precedence

          end for
          
          #control
          if pos<0, .throwError("can't find highest precedence operator")

Un-flatten: Push down the operands a level down

          var oper = arr[pos]

          oper.pushed = true

          if oper instanceof UnaryOper

            #control
            compile if debug
              if pos is arr.length
                .throwError("can't get RIGHT operand for unary operator '#{oper}'") 
            end compile

            # if it's a unary operator, take the only (right) operand, and push-it down the tree
            oper.right = arr.splice(pos+1,1)[0]

          else

            #control
            compile if debug
              if pos is arr.length
                .throwError("can't get RIGHT operand for binary operator '#{oper}'")
              if pos is 0
                .throwError("can't get LEFT operand for binary operator '#{oper}'")
            end compile

            # if it's a binary operator, take the left and right operand, and push-them down the tree
            oper.right = arr.splice(pos+1,1)[0]
            oper.left = arr.splice(pos-1,1)[0]

          end if

        loop #until there's only one operator

Store the root operator

        .root = arr[0]

      end method

-----------------------

## Literal

This class groups: NumberLiteral, StringLiteral, RegExpLiteral, ArrayLiteral and ObjectLiteral

    public class Literal extends ASTBase
  
      properties 
        type = '*abstract-Literal*'

      method getValue()
        return .name


## NumberLiteral

`NumberLiteral: NUMBER`

A numeric token constant. Can be anything the lexer supports, including scientific notation
, integers, floating point, or hex.

    public class NumberLiteral extends Literal

      properties 
        type = 'Number'

      method parse()
        .name = .req('NUMBER')


## StringLiteral

`StringLiteral: STRING`

A string constant token. Can be anything the lexer supports, including single or double-quoted strings. 
The token include the enclosing quotes

    public class StringLiteral extends Literal

      properties 
        type = 'String'

      method parse()
        .name = .req('STRING')

      method getValue()
        return .name.slice(1,-1) #remove quotes

## RegExpLiteral

`RegExpLiteral: REGEX`

A regular expression token constant. Can be anything the lexer supports.

    public class RegExpLiteral extends Literal

      properties 
        type = 'RegExp'

      method parse()
        .name = .req('REGEX')


## ArrayLiteral

`ArrayLiteral: '[' (Expression,)* ']'`

An array definition, such as `a = [1,2,3]`
or 

```
a = [
   "January"
   "February"
   "March"
  ]
```

    public class ArrayLiteral extends Literal

      properties 
        type = 'Array'
        items

      method parse()
        .req '[','SPACE_BRACKET'
        .lock()
        .items = .optSeparatedList(Expression,',',']') # closer "]" required


## ObjectLiteral

`ObjectLiteral: '{' NameValuePair* '}'`

Defines an object with a list of key value pairs. This is a JavaScript-style definition.

`x = {a:1,b:2,c:{d:1}}`

    public class ObjectLiteral extends Literal

      properties 
        items: NameValuePair array
        type = 'Object'

      method parse()
        .req '{'
        .lock()
        .items = .optSeparatedList(NameValuePair,',','}') # closer "}" required


####helper Functions

      #recursive duet 1 (see NameValuePair)
      helper method forEach(callback) 
          for each nameValue in .items
            nameValue.forEach(callback)


## NameValuePair

`NameValuePair: (IDENTIFIER|STRING|NUMBER) ':' Expression`

A single definition in a `ObjectLiteral` 
a `property-name: value` pair.

    public class NameValuePair extends ASTBase

      properties value: Expression

      method parse()

        .name = .req('IDENTIFIER','STRING','NUMBER')

        .req ':'
        .lock()

if it's a "dangling assignment", we assume FreeObjectLiteral

        if .lexer.token.type is 'NEWLINE'
          .value = .req(FreeObjectLiteral)

        else
          if .lexer.interfaceMode
              .parseType
          else
              .value = .req(Expression)

recursive duet 2 (see ObjectLiteral)

      helper method forEach(callback)

          callback(this) 

          #if ObjectLiteral, recurse
          declare valid .value.root.name
          if .value.root.name instanceof ObjectLiteral
            declare valid .value.root.name.forEach
            .value.root.name.forEach callback # recurse

      end helper recursive functions


## FreeObjectLiteral

Defines an object with a list of key value pairs. 
Each pair can be in it's own line. A indent denotes a new level deep.
FreeObjectLiterals are triggered by a "danglin assignment"

Examples: 
/*

    var x =            // <- dangling assignment
          a: 1 
          b:           // <- dangling assignment
            b1:"some"
            b2:"cofee"

    var x =
     a:1
     b:2
     c:
      d:1
     months: ["J","F",
      "M","A","M","J",
      "J","A","S","O",
      "N","D" ]


    var y =
     c:{d:1}
     trimester:[
       "January"
       "February"
       "March"
     ]
     getValue: function(i)
       return y.trimester[i]
*/

### public class FreeObjectLiteral extends ObjectLiteral

get items: optional comma separated, closes on de-indent, at least one required

      method parse()
        .lock()
        .items = .reqSeparatedList(NameValuePair,',') 


## ParenExpression

`ParenExpression: '(' Expression ')'`

An expression enclosed by parentheses, like `(a + b)`.

    public class ParenExpression extends ASTBase

      properties expr:Expression

      method parse()
        .req '('
        .lock()
        .expr = .req(Expression)
        .opt 'NEWLINE'
        .req ')'


## FunctionDeclaration

`FunctionDeclaration: 'function [IDENTIFIER] ["(" [VariableDecl,]* ")"] [returns type-VariableRef] Body`

Functions: parametrized pieces of callable code.

    public class FunctionDeclaration extends ASTBase

      properties 
        specifier, export, default, nice, shim, generator
        paramsDeclarations: VariableDecl array
        definePropItems: DefinePropertyItem array
        body

      method parse()

        .specifier = .req('function','method','->')
        .lock()

        declare valid .parent.parent.parent
        if .specifier isnt 'method' and .parent.parent.parent instance of ClassDeclaration
            .throwError "unexpected 'function' in 'class/append' body. You should use 'method'"

'->' are anonymous lambda functions

        if .specifier isnt '->'
            .name = .opt('IDENTIFIER') 

get parameter members, and function body

        .parseParametersAndBody

      #end parse

##### helper method parseParametersAndBody()

This method is shared by functions, methods and constructors. 
`()` after `function` are optional. It parses: `['(' [VariableDecl,] ')'] [returns VariableRef] '['DefinePropertyItem']'`

        if .opt("(")
            .paramsDeclarations = .optSeparatedList(VariableDecl,',',')')

        else if .specifier is '->' #we arrive here by: FnCall-param-Expression-Operand-'->'
            # after '->' we accept function params w/o parentheses.
            # get parameter names (name:type only), up to [NEWLINE],'=' or 'return'
            .paramsDeclarations=[]
            until .lexer.token.type is 'NEWLINE' or .lexer.token.value in ['=','return'] 
                if .paramsDeclarations.length, .req ','
                var varDecl = new VariableDecl(this, .req('IDENTIFIER'))
                if .opt(":"), varDecl.parseType
                .paramsDeclarations.push varDecl

        if .opt('=','return') #one line function. Body is a Expression

            .body = .req(Expression)

        else # full body function

            if .opt('returns'), .parseType  #function return type

            if .opt('[','SPACE_BRACKET') # property attributes
                .definePropItems = .optSeparatedList(DefinePropertyItem,',',']')

            #indented function body
            .body = .req(Body)

        end if

### public class DefinePropertyItem extends ASTBase
This Symbol handles property attributes, the same used at js's **Object.DefineProperty()**

      declare name affinity definePropItem

      properties
        negated:boolean

      method parse()
        .lock()
        .negated = .opt('not')
        .name = .req('enumerable','configurable','writable')



## MethodDeclaration 

`MethodDeclaration: 'method [name] ["(" [VariableDecl,] ")"] [returns type-VariableRef] ["["DefinePropertyItem,"]"] Body`

A `method` is a function defined in the prototype of a class. 
A `method` has an implicit var `this` pointing to the specific instance the method is called on.

MethodDeclaration derives from FunctionDeclaration, so both are instance of FunctionDeclaration

Examples:
<br>`method concat(a:string, b:string) return string`
<br>`method remove(element) [not enumerable, not writable, configurable]`

    public class MethodDeclaration extends FunctionDeclaration

      method parse()

        .specifier = .req('method')
        .lock()

require method name. Note: jQuery uses 'not' and 'has' as method names, so here we 
take any token, and check if it's valid identifier

        //.name = .req('IDENTIFIER') 
        .name = .lexer.token.value 
        if not .name like /^[a-zA-Z$_]+[0-9a-zA-Z$_]*$/, .throwError 'invalid method name: "#{.name}"'
        .lexer.nextToken

now parse parameters and body (as with any function)

        .parseParametersAndBody


## ClassDeclaration

`ClassDeclaration: class IDENTIFIER [[","] (extends|inherits from)] Body`

Defines a new class with an optional parent class. properties and methods go inside the block.

    public class ClassDeclaration extends ASTBase

      properties
        export:boolean,default:boolean
        varRefSuper:VariableRef
        body

      declare name affinity classDecl

      method parse()
        .req 'class'
        .lock()
        .name = .req('IDENTIFIER')

Control: class names should be Capitalized, except: jQuery

        if not .lexer.interfaceMode and not String.isCapitalized(.name)
            .lexer.sayErr "class names should be Capitalized: class #{.name}"

Now parse optional `,(extend|proto is|inherits from)` setting the super class

        .opt(',') 
        if .opt('extends','inherits','proto') 
          .opt('from','is') 
          .varRefSuper = .req(VariableRef)

Now get class body.

        .body = .opt(Body)



## ConstructorDeclaration 

`ConstructorDeclaration : 'constructor [new className-IDENTIFIER] ["(" [VariableDecl,]* ")"] [returns type-VariableRef] Body`

A `constructor` is the main function of the class. In js is the function-class body  (js: `function Class(...){... `)
The `constructor` method is called upon creation of the object, by the `new` operator.
The return value is the value returned by `new` operator, that is: the new instance of the class.

ConstructorDeclaration derives from MethodDeclaration, so it is also a instance of FunctionDeclaration

    public class ConstructorDeclaration extends MethodDeclaration

      method parse()

        .specifier = .req('constructor')
        .lock()

        if .opt('new') # optional: constructor new Person(name:string)
          # to ease reading, and to find the constructor when you search for "new Person"
          var className = .req('IDENTIFIER')
          var classDeclaration = .getParent(ClassDeclaration)
          if classDeclaration and classDeclaration.name isnt className, .sayErr "Class Name mismatch #{className}/#{.parent.name}"

now get parameters and body (as with any function)

        .parseParametersAndBody

      #end parse

------------------------------

## AppendToDeclaration

`AppendToDeclaration: append to (class|object) VariableRef Body`

Adds methods and properties to an existent object, e.g., Class.prototype

    public class AppendToDeclaration extends ClassDeclaration
      
      properties 
        toNamespace
        varRef:VariableRef
        body

      method parse()

        .req 'append','Append'
        .req 'to'
        .lock()

        .toNamespace = .req('class','object','namespace') isnt 'class'

        .varRef = .req(VariableRef)

Now get body.

        .body = .req(Body)


## NamespaceDeclaration

`NamespaceDeclaration: namespace IDENTIFIER Body`

creates a object with methods, properties and classes

    public class NamespaceDeclaration extends AppendToDeclaration
      
      method parse()

        .req 'namespace','Namespace'
        if .opt('properties'), .throwParseFailed "is properties"

        .lock()
        .toNamespace = true
        .varRef = .req(VariableRef)

Now get body.

        .body = .req(Body)



## DebuggerStatement

`DebuggerStatement: debugger`

When a debugger is attached, break at this point.

    public class DebuggerStatement extends ASTBase
      method parse()
        .name = .req("debugger")



CompilerStatement
-----------------

`compiler` is a generic entry point to alter LiteScript compiler from source code.
It allows conditional complilation, setting compiler options, and execute macros
to generate code on the fly. 
Future: allow the programmer to hook transformations on the compiler process itself.
<br>`CompilerStatement: (compiler|compile) (set|if|debugger|option) Body`
<br>`set-CompilerStatement: compiler set (VariableDecl,)`
<br>`conditional-CompilerStatement: 'compile if IDENTIFIER Body`

    public class CompilerStatement extends ASTBase

      properties
        kind, conditional:string
        list, body
        importStatement
        endLineInx

      method parse()
        .req 'compiler','compile'
        .lock()
        .kind = .lexer.token.value

### compiler ImportStatement

        if .kind is 'import'
          .importStatement = .req(ImportStatement)
          return

### others

        .kind = .req('set','if','debugger','options')

### compiler set
get list of declared names, add to root node 'Compiler Vars'

        if .kind is 'set'
            .list = .reqSeparatedList(VariableDecl,',')

### compiler if conditional compilation

        else if .kind is 'if'

          .conditional = .req('IDENTIFIER')

          if .compilerVar(.conditional)
              .body = .req(Body)
          else
            //skip block
            do 
              .lexer.nextToken
            loop until .lexer.indent <= .indent


### other compile options

        else if .kind is 'debugger' #debug-pause the compiler itself, to debug compiling process
          debugger

        else
          .sayErr 'invalid compiler command'


## Import Statement

`ImportStatement: import (ImportStatementItem,)`

Example: `global import fs, path` ->  js:`var fs=require('fs'),path=require('path')`

Example: `import Args, wait from 'wait.for'` ->  js:`var http=require('./Args'),wait=require('./wait.for')`

    public class ImportStatement extends ASTBase

      properties 
        global:boolean
        list: ImportStatementItem array

      method parse()
        .req('import')
        .lock()
        .list = .reqSeparatedList(ImportStatementItem,",")

keep track of `import/require` calls

        var parentModule = .getParent(Module)
        for each item in .list
            parentModule.requireCallNodes.push item


### export class ImportStatementItem extends ASTBase

`ImportStatementItem: IDENTIFIER [from STRING]`

      properties 
        importParameter:StringLiteral

      method parse()
        .name = .req('IDENTIFIER')
        if .opt('from')
            .lock()
            .importParameter = .req(StringLiteral)


## DeclareStatement

Declare statement allows you to forward-declare variable or object members. 
Also allows to declare the valid properties for externally created objects
when you dont want to create a class to use as type.
<br>`DeclareStatement: declare ([types]|global|forward|on IDENTIFIER) (VariableDecl,)+`
<br>`DeclareStatement: declare name affinity (IDENTIFIER,)+` 

#####Declare types
<br>`DeclareStatement: declare [types] (VariableDecl,)+` 

To declare valid types for scope vars: 

Example: `declare types name:string, parent:NameDeclaration`

#####Declare valid
`DeclareStatement: declare valid IDENTIFIER ("."IDENTIFIER|"()"|"[]")*` 

To declare valid chains

Example: `declare valid .type[].name.name`

#####Declare name affinity
`DeclareStatement: name affinity (IDENTIFIER,)+` 

To be used inside a class declaration, declare var names 
that will default to Class as type

Example
```
  Class NameDeclaration
    properties
      name: string, sourceLine, column
      declare name affinity nameDecl
```

Given the above declaration, any `var` named (or ending in) **"nameDecl"** or **"nameDeclaration"** 
will assume `:NameDeclaration` as type. (Class name is automatically included in 'name affinity')

Example:
`var nameDecl, parentNameDeclaration, childNameDecl, nameDeclaration`

all three vars will assume `:NameDeclaration` as type.

#####global Declare 
`DeclareStatement: global declare (VariableDecl,)+` 

To declare global, externally created vars. Example: `declare global logMessage, colors`

#####Declare on 
`DeclareStatement: declare on IDENTIFIER (VariableDecl,)+` #declare members on vars

To declare valid members on scope vars. 

### export class DeclareStatement extends ASTBase

      properties
        varRef: VariableRef
        names: VariableDecl array
        specifier
        global:boolean
        type: VariableRef

      method parse()

        .req 'declare'
        .lock()

        .names = []

check 'on|valid|forward|global'

        .specifier = .opt('on')
        if .specifier

Find the main name where this properties are being declared. Read names

            .name = .req('IDENTIFIER')
            .names = .reqSeparatedList(VariableDecl,',')
            return

check 'valid' 

        .specifier = .opt('valid')
        if .specifier
            .varRef = .req(VariableRef)
            if no .varRef.accessors, .sayErr "declare valid: expected accesor chain. Example: 'declare valid name.member.member'"
            if .opt(':'), .parseType //optional type
            return

check 'name affinity', if not, must be: global|forward|types(default)

        if .opt('name')
          .specifier = .req('affinity')
        else 
          .specifier = .opt('global') or 'types' 

all of them get a (VariableDecl,)+

        .names = .reqSeparatedList(VariableDecl,',')
        
check syntax

        for each varDecl in .names
           if .specifier is 'affinity' and varDecl.type or varDecl.assignedValue
              .sayErr "declare name affinity: expected 'name,name,...'"

        return


## DefaultAssignment

`DefaultAssignment: default AssignmentStatement`

It is a common pattern in javascript to use a object parameters (named "options")
to pass misc options to functions.

Litescript provide a 'default' construct as syntax sugar for this common pattern

The 'default' construct is formed as an ObjectLiteral assignment, 
but only the 'undfined' properties of the object will be assigned.


Example: /*

    function theApi(object,options,callback)

      default options =
        log: console.log
        encoding: 'utf-8'
        throwErrors: true
        debug:
          enabled: false
          level: 2
      end default

      ...function body...

    end function
*/
is equivalent to js's:
/*

    function theApi(object,options,callback) {

        //defaults
        if (!options) options = {};
        if (options.log===undefined) options.log = console.log;
        if (options.encoding===undefined) options.encoding = 'utf-8';
        if (options.throwErrors===undefined) options.throwErrors=true;
        if (!options.debug) options.debug = {};
        if (options.debug.enabled===undefined) options.debug.enabled=false;
        if (options.debug.level===undefined) options.debug.level=2;

        ...function body...
    }
*/

### public class DefaultAssignment extends ASTBase
  
      properties
        assignment: AssignmentStatement

      method parse()

        .req 'default'
        .lock()

        .assignment = .req(AssignmentStatement)



## End Statement

`EndStatement: end (IDENTIFIER)* NEWLINE`

`end` is an **optional** end-block marker to ease code reading.
It marks the end of code blocks, and can include extra tokens referencing the construction
closed. (in the future) This references will be cross-checked, to help redude subtle bugs
by checking that the block ending here is the intended one.

If it's not used, the indentation determines where blocks end ()

Example: `end if` , `end loop`, `end for each item`

Usage Examples:  
/*

    if a is 3 and b is 5
      print "a is 3"
      print "b is 5"
    end if

    loop while a < 10
      a++
      b++
    end loop
*/

### public class EndStatement extends ASTBase
  
      properties
        references:string array

      method parse()

        .req 'end'

        .lock()
        .references=[]
 
The words after `end` are just 'loose references' to the block intended to be closed
We pick all the references up to EOL (or EOF)

        while not .opt('NEWLINE','EOF')

Get optional identifier reference
We save `end` references, to match on block indentation,
for Example: `end for` indentation must match a `for` statement on the same indent

            if .lexer.token.type is 'IDENTIFIER'
              .references.push(.lexer.token.value)

            .lexer.nextToken

        #end loop


## YieldExpression

`YieldExpression: yield until asyncFnCall-VariableRef`
`YieldExpression: yield parallel map array-Expression asyncFnCall-VariableRef`

`yield until` expression calls a 'standard node.js async function'
and `yield` execution to the caller function until the async completes (callback).

A 'standard node.js async function' is an async function 
with the last parameter = callback(err,data)

The yield-wait is implemented by exisiting lib 'nicegen'.

Example: `contents = yield until fs.readFile 'myFile.txt','utf8'`

    public class YieldExpression extends ASTBase
  
      properties
        specifier
        fnCall
        arrExpression

      method parse()

        .req 'yield'
        .specifier = .req('until','parallel')
        
        .lock()

        if .specifier is 'until'

            .fnCall = .req(FunctionCall)

        else

            .req 'map'
            .arrExpression = .req(Expression)
            .fnCall = .req(FunctionCall)


--------------

Adjective
---------
`Adjective: (public|export|default|nice|generator|shim|helper|global)`

Adjectives can precede several statement.

### public class Adjective extends ASTBase

#### method parse()

        .name = .req('public','export','default','nice','generator','shim','helper','global')

#### Helper method validate(statement)
Check validity of adjective-statement combination 

        var CFVN = ['class','function','var','namespace'] 

        var validCombinations =  
              export: CFVN, public: CFVN, default: CFVN
              generator: ['function','method'] 
              nice: ['function','method'] 
              shim: ['function','method','class'] 
              helper:  ['function','method','class']
              global: ['import','declare']

        //declare valid:array
        declare valid statement.keyword

        var valid:array = validCombinations[.name] or ['-*none*-']
        if not (statement.keyword in valid)
            .throwError "'#{.name}' can only apply to #{valid.join('|')} not to '#{statement.keyword}'"
        
Also convert adjectives to Statement node properties to ease code generation.

        statement[.name] = true

'public' is just alias for 'export'

        declare valid statement.export
        if .name is 'public', statement.export = true

set module.exportDefault if 'export default' or 'public default' was parsed

        declare valid statement.default
        if statement.export and statement.default
            var moduleNode:Module = .getParent(Module)
            if moduleNode.exportDefault, .throwError "only one 'export default' can be defined"
            moduleNode.exportDefault = statement


FunctionCall
------------

`FunctionCall: VariableRef ["("] (Expression,) [")"]`

    public class FunctionCall extends ASTBase
      
      declare name affinity fnCall

      properties
          varRef: VariableRef

      method parse(options)
        declare valid .parent.preParsedVarRef
        declare valid .name.executes

Check for VariableRef. - can include (...) FunctionAccess

        if .parent.preParsedVarRef #VariableRef already parsed
          .varRef = .parent.preParsedVarRef #use it
        else  
          .varRef = .req(VariableRef)

if the last accessor is function call, this is already a FunctionCall

        if .varRef.executes
            return #already a function call

Here we assume is a function call without parentheses, a 'command'

        if .lexer.token.type in ['NEWLINE','EOF']
          # no more tokens, let's asume FnCall w/o parentheses and w/o parameters
          return

else, get parameters, add to varRef as FunctionAccess accessor

        var functionAccess = new FunctionAccess(.varRef)
        functionAccess.args = functionAccess.optSeparatedList(Expression,",")
        if .lexer.token.value is '->' #add last parameter: callback function
            functionAccess.args.push .req(FunctionDeclaration)

        .varRef.addAccessor functionAccess


## SwitchStatement

`SwitchStatement: switch [VariableRef] (case (Expression,) ":" Body)* [default Body]`

Similar to js switch, but:

 1. no fall-through 
 2. each 'case' can have several expressions, comma separated, then ':'
 3. if no var specified, select first true expression 

See Also: [CaseWhenExpression]

Examples:
```
  switch a
    case 2,4,6:
      print 'even'
    case 1,3,5: 
      print 'odd'
    default:
      print 'idk'

  switch 
    case a is 3 or b < 10:
      print 'option 1'
    case b >= 10, a<0, c is 5: 
      print 'option 2'
    default:
      print 'other'
```

### public class SwitchStatement extends ASTBase

      properties
        varRef
        cases: SwitchCase array
        defaultBody: Body

      method parse()
        .req 'switch'
        .lock()
        .varRef = .opt(VariableRef)
        .cases=[]

Loop processing: 'NEWLINE','case' or 'default'

        do until .lexer.token.type is 'EOF'
            var keyword = .req('case','default','NEWLINE')
            
on 'case', get a comma separated list of expressions, ended by ":"
and a "Body". Push both on .cases[]

            if keyword is 'case'
                .cases.push .req(SwitchCase)

else, on 'default', get default body, and break loop

            else if keyword is 'default'
                .opt(":")
                .defaultBody = .req(Body)
                break;

        loop

        if no .cases.length, .throwError "no 'case' found after 'switch'"


### public helper class SwitchCase extends ASTBase
Helper class to parse each case

        properties
            expressions: Expression array
            body

...a comma separated list of expressions, ended by ":", and a "Body"
    
        method parse()
            .expressions = .reqSeparatedList(Expression, ",", ":")
            .body = .req(Body)


## CaseWhenExpression

`CaseWhenExpression: case [VariableRef] (when (Expression,) then Expression)* [else Expression] end`

Similar to ANSI-SQL 'CASE', and ruby's 'case'

Examples:
```
  print case b 
          when 2,4,6 then 'even' 
          when 1,3,5 then 'odd'
          else 'idk' 
        end

  var result = case 
          when a is 3 or b < 10 then 'option 1'
          when b >= 10 or a<0 or c is 5 then 'option 2'
          else 'other' 
        end
```

### public class CaseWhenExpression extends ASTBase

      properties
        varRef
        cases: CaseWhenSection array
        elseExpression: Expression

      method parse()
        .req 'case'
        .lock()
        .varRef = .opt(VariableRef)
        .cases=[]

Loop processing: 'NEWLINE','when' or 'else' until 'end'

        do until .lexer.token.value is 'end'
            var keyword = .req('NEWLINE','when','else')
            
on 'case', get a comma separated list of expressions, ended by ":"
and a "Body". Push both on .cases[]

            if keyword is 'when'
                .cases.push .req(CaseWhenSection)

else, on 'default', get default body, and break loop

            else if keyword is 'else'
                .elseExpression = .req(Expression)
                break; #no more cases allowed after else

        loop

check if there are cases. Require 'end'

        if no .cases.length, .throwError "no 'when' found after 'case'"

        .opt 'NEWLINE'
        .req 'end'


### public helper class CaseWhenSection extends ASTBase
Helper class to parse each case

        properties
            parent:CaseWhenExpression
            expressions: Expression array
            booleanExpression
            resultExpression

if there is a var, we allow a list of comma separated expressions to compare to. 
If there is no var, we allow a single boolean-Expression.
After: 'then', and the result-Expression
    
        method parse()
            if .parent.varRef 
                .expressions = .reqSeparatedList(Expression, ",")
            else
                .booleanExpression = .req(Expression)

            .req 'then'
            .resultExpression = .req(Expression)



##Statement

A `Statement` is an imperative statment (command) or a control construct.

The `Statement` node is a generic container for all previously defined statements. 


The generic `Statement` is used to define `Body: (Statement;)`, that is,
**Body** is a list of semicolon (or NEWLINE) separated **Statements**.

Grammar: 
```
Statement: [Adjective]* (ClassDeclaration|FunctionDeclaration
 |IfStatement|ForStatement|WhileUntilLoop|DoLoop
 |AssignmentStatement
 |LoopControlStatement|ThrowStatement
 |TryCatch|ExceptionBlock
 |ReturnStatement|PrintStatement|DoNothingStatement)

Statement: ( AssignmentStatement | fnCall-VariableRef [ ["("] (Expression,) [")"] ] )
```

    public class Statement extends ASTBase
  
      properties
        adjectives: Adjective array
        statement
        preParsedVarRef
        intoVars

      method parse()
        #debug show line and tokens
        debug ""
        .lexer.infoLine.dump()

First, fast-parse the statement by using a table.
We look up the token (keyword) in **StatementsDirect** table, and parse the specific AST node

        .statement = .parseDirect(.lexer.token.value, StatementsDirect)
        if no .statement

If it was not found, try optional adjectives (zero or more). Adjectives are: `(export|public|generator|shim|helper)`. 

          .adjectives = .optList(Adjective)

Now re-try fast-parse

          .statement = .parseDirect(.lexer.token.value, StatementsDirect)
          if no .statement

Last possibilities are: `FunctionCall` or `AssignmentStatement`
both start with a `VariableRef`:

(performance) **require** & pre-parse the VariableRef.
Then we require a AssignmentStatement or FunctionCall

            .preParsedVarRef = .req(VariableRef)
            .statement = .req(AssignmentStatement,FunctionCall)
            .preParsedVarRef = undefined #clear

        end if - statement parse tries

If we reached here, we have parsed a valid statement. 
Check validity of adjective-statement combination 
        
        if .adjectives
          for each adj in .adjectives
            adj.validate .statement


##### helper method hasAdjective(name) returns boolean
To check if a statement has an adjective WHILE parsing the statment
(after the statement, adjectives are assignes as statement properties)

        if .adjectives 
          for each adjective in .adjectives where adjective.name is name
            return true


## Body

`Body: (Statement;)`

Body is a semicolon-separated list of statements (At least one)

`Body` is used for "Module" body, "class" body, "function" body, etc.
Anywhere a list of semicolon separated statements apply.

    public class Body extends ASTBase

      properties
        statements: Statement array

      method parse()

        if .lexer.interfaceMode
            if .parent.constructor not in [ClassDeclaration,AppendToDeclaration,NamespaceDeclaration]
                return //"no 'Bodys' expected on interface.md file except for: class, append to and namespace

        if .lexer.token.type isnt 'NEWLINE'
            .lexer.sayErr "found #{.lexer.token} but expected NEWLINE and indented body"

We use the generic ***ASTBase.reqSeparatedList*** to get a list of **Statement** symbols, 
*semicolon* separated or in freeForm mode: one statement per line, closed when indent changes.

        .statements = .reqSeparatedList(Statement,";")


## Single Line Statement

This construction is used when a statement is expected on the same line.
It is used by `IfStatement: if conditon-Expression (','|then) *SingleLineStatement*`
It is also used for the increment statemenf in for-while loops:`for x=0; while x<10 [,SingleLineStatement]`

    public class SingleLineStatement extends Statement
      
      properties
        statements: Statement array

      method parse()

        /*if .lexer.token.type is 'NEWLINE'
          .lexer.returnToken()
          .lock()
          .lexer.sayErr "Expected statement on the same line after '#{.lexer.token.value}'"
        */
        # normally: ReturnStatement, ThrowStatement, PrintStatement, AssignmentStatement
        # but we parse any Statement up to NEWLINE
  
        .statements = .reqSeparatedList(Statement,";",'NEWLINE')
        .lexer.returnToken() #return closing NEWLINE

## Module

The `Module` represents a complete source file. 

    public class Module extends Body

      properties
        exportDefault: ASTBase

      method parse()

We start by locking. There is no other construction to try,
if Module.parse() fails we abort compilation.

          .lock()

Get Module body: Statements, separated by NEWLINE|';' closer:'EOF'

          .statements = .optFreeFormList(Statement,';','EOF')

      #end Module parse


----------------------------------------

Table-based (fast) Statement parsing
------------------------------------

This a extension to PEGs.
To make the compiler faster and easier to debug, we define an 
object with name-value pairs: `"keyword" : AST node class` 

We look here for fast-statement parsing, selecting the right AST node to call `parse()` on 
based on `token.value`. (instead of parsing by ordered trial & error)

This table makes a direct parsing of almost all statements, thanks to a core definition of LiteScript:
Anything standing alone in it's own line, its an imperative statement (it does something, it produces effects).

    var StatementsDirect = 
      'class': ClassDeclaration
      'Class': ClassDeclaration
      'append': AppendToDeclaration
      'Append': AppendToDeclaration
      'function': FunctionDeclaration
      'constructor': ConstructorDeclaration
      'properties': PropertiesDeclaration
      'namespace': [NamespaceDeclaration, PropertiesDeclaration]
      'method': MethodDeclaration
      'var': VarStatement
      'let': VarStatement
      'default': DefaultAssignment
      'if': IfStatement
      'when': IfStatement
      'for':ForStatement
      'while':WhileUntilLoop
      'until':WhileUntilLoop
      'do':[DoNothingStatement,DoLoop]
      'break':LoopControlStatement
      'switch':SwitchStatement
      'continue':LoopControlStatement
      'end':EndStatement
      'return':ReturnStatement
      'with':WithStatement
      'print':PrintStatement
      'throw':ThrowStatement
      'raise':ThrowStatement
      'fail':ThrowStatement
      'try':TryCatch
      'exception':ExceptionBlock
      'Exception':ExceptionBlock
      'debugger':DebuggerStatement 
      'declare':DeclareStatement
      'import':ImportStatement
      'delete':DeleteStatement
      'compile':CompilerStatement
      'compiler':CompilerStatement
      'yield':YieldExpression
    

    var AccessorsDirect = 
        '.': PropertyAccess
        '[': IndexAccess
        '(': FunctionAccess 


##### Helper Functions

    export helper function autoCapitalizeCoreClasses(name:string) returns String
      #auto-capitalize core classes when used as type annotations
      if name in ['string','array','number','object','function','boolean']
        return name.slice(0,1).toUpperCase()+name.slice(1)
      return name


    append to class ASTBase
      helper method parseType

        #parse type declaration: type-IDENTIFIER [array]

        if .opt('function') #function as type declaration
            if .opt('(')
                declare valid .paramsDeclarations
                .paramsDeclarations = .optSeparatedList(VariableDecl,',',')')
            .type= new VariableRef(this, 'function')

        else
          .type = .req(VariableRef) #reference to an existing class

        #auto-capitalize core classes
        declare valid .type.name
        .type.name = autoCapitalizeCoreClasses(.type.name)

        # check for 'array', e.g.: `var list : string array`
        if .opt('Array','array')
            .itemType = .type #assign as sub-type
            .type = 'Array'


