Producer JS
===========

The `producer` module extends Grammar classes, adding a `produce()` method 
to generate target code for the node.

The compiler calls the `.produce()` method of the root 'Module' node 
in order to return the compiled code for the entire tree.

We extend the Grammar classes, so this module require the `Grammar` module.

    import ASTBase, Grammar, Environment 

JavaScript Producer Functions
==============================

### Append to class Grammar.Module ###

#### method produce()

if a 'export default' was declared, set the referenced namespace 
as the new 'export default' (instead of 'module.exports')

        .lexer.out.exportNamespace = 'module.exports'
        
        if .exportDefault instance of Grammar.VarStatement
            declare valid .exportDefault.list.length
            declare valid .exportDefault.throwError
            if .exportDefault.list.length > 1, .exportDefault.throwError "only one var:Object alllowed for 'export default'"
            .lexer.out.exportNamespace = .exportDefault.list[0].name

        else if .exportDefault instance of ASTBase
            declare valid .exportDefault.name
            .lexer.out.exportNamespace = .exportDefault.name

        end if

        for each statement in .statements
          statement.produce()
        .out NL

        //add end of file comments
        .outPrevLinesComments .lexer.infoLines.length-1

export 'export default' namespace, if it was set.

        if not .lexer.out.browser
            if .lexer.out.exportNamespace isnt 'module.exports'
                .out 'module.exports=',.lexer.out.exportNamespace,";",NL

### Append to class Grammar.Body ### and Module (derives from Body)

A "Body" is an ordered list of statements.

"Body"s lines have all the same indent, representing a scope.

"Body"s are used for example, to parse an `if` statement body and `else` body, `for` loops, etc.

      method produce()

        for each statement in .statements
          statement.produce()

        .out NL


-------------------------------------
### append to class Grammar.Statement ###

`Statement` objects call their specific statement node's `produce()` method
after adding any comment lines preceding the statement

      method produce()

        declare valid .statement.body

add comment lines, in the same position as the source

        .outPrevLinesComments()

To ease reading of compiled code, add original Lite line as comment 

        if .lexer.options.comments
          if .lexer.out.lastOriginalCodeComment<.lineInx
            if not (.statement.constructor in [
                Grammar.PrintStatement, Grammar.VarStatement, Grammar.CompilerStatement
                Grammar.DeclareStatement,Grammar.AssignmentStatement, Grammar.ReturnStatement
                Grammar.PropertiesDeclaration, Grammar.FunctionCall
              ])
              .out {COMMENT: .lexer.infoLines[.lineInx].text.trim()},NL
          .lexer.out.lastOriginalCodeComment = .lineInx

Each statement in its own line

        if .statement isnt instance of Grammar.SingleLineBody
          .lexer.out.ensureNewLine

if there are one or more 'into var x' in a expression in this statement, 
declare vars before statement (exclude body of FunctionDeclaration)

        this.callOnSubTree "declareIntoVar", Grammar.Body

call the specific statement (if,for,print,if,function,class,etc) .produce()

        var mark = .lexer.out.markSourceMap(.indent)
        .out .statement

add ";" after the statement
then EOL comment (if it isnt a multiline statement)
then NEWLINE

        if not .statement.skipSemiColon
          .addSourceMap mark
          .out ";"
          if not .statement.body
            .out .getEOLComment()

called above, pre-declare vars from 'into var x' assignment-expression

    append to class Grammar.Oper
      method declareIntoVar()
          if .intoVar
              .out "var ",.right,"=undefined;",NL


---------------------------------
### append to class Grammar.ThrowStatement ###

      method produce()
          if .specifier is 'fail'
            .out "throw new Error(", .expr,")"
          else
            .out "throw ", .expr


### Append to class Grammar.ReturnStatement ###

      method produce()
        .out "return"
        if .expr
          .out " ",.expr


### Append to class Grammar.FunctionCall ###

      method produce() 

        .varRef.produce()
        if .varRef.executes, return #if varRef already executes, () are not needed
        
        .out "()" #add (), so JS executes the function call


### append to class Grammar.Operand ###

`Operand:
  |NumberLiteral|StringLiteral|RegExpLiteral
  |ParenExpression|ArrayLiteral|ObjectLiteral|FunctionDeclaration
  |VariableRef

A `Operand` is the left or right part of a binary oper
or the only Operand of a unary oper.

      method produce()

        .out .name, .accessors

      #end Operand


### append to class Grammar.UnaryOper ###

`UnaryOper: ('-'|new|type of|not|no|bitnot) `

A Unary Oper is an operator acting on a single operand.
Unary Oper inherits from Oper, so both are `instance of Oper`

Examples:
1) `not`     *boolean negation*     `if not a is b`
2) `-`       *numeric unary minus*  `-(4+3)`
3) `new`     *instantiation*        `x = new classNumber[2]`
4) `type of` *type name access*     `type of x is classNumber[2]` 
5) `no`      *'falsey' check*       `if no options then options={}` 
6) `bitnot`  *bit-unary-negation*   `a = bitnot xC0 + 5`

      method produce() 
        
        var translated = operTranslate(.name)
        var prepend,append

if it is "boolean not", add parentheses, because js has a different precedence for "boolean not"
-(prettier generated code) do not add () for simple "falsey" variable check

        if translated is "!" 
            if not (.name is "no" and .right.name instanceof Grammar.VariableRef)
                prepend ="("
                append=")"

add a space if the unary operator is a word. Example `typeof`

        else if /\w/.test(translated) 
            translated+=" "

        .out translated, prepend, .right, append


### append to class Grammar.Oper ###

      method produce()

        var oper = .name

default mechanism to handle 'negated' operand

        var prepend,append
        if .negated # NEGATED

if NEGATED and the oper is `is` we convert it to 'isnt'.
'isnt' will be translated to !==

            if oper is 'is' # Negated is ---> !==
                oper = '!=='

else -if NEGATED- we add `!( )` to the expression

            else 
                prepend ="!("
                append=")"

Check for special cases: 

1) 'in' operator, requires swapping left and right operands and to use `.indexOf(...)>=0`
example: `x in [1,2,3]` -> `[1,2,3].indexOf(x)>=0`
example: `x not in [1,2,3]` -> `[1,2,3].indexOf(x)==-1`
example: `char not in myString` -> `myString.indexOf(char)==-1`
example (`arguments` pseudo-array): `'lite' not in arguments` -> `Array.prototype.slice.call(arguments).indexOf(char)==-1`

        if .name is 'in'
            .out .right,".indexOf(",.left,")", .negated? "===-1" : ">=0"

fix when used on JS built-in array-like `arguments`
//            .lexer.out.currLine = .lexer.out.currLine.replace(/\barguments.indexOf\(/,'Array.prototype.slice.call(arguments).indexOf(')

2) *'has property'* operator, requires swapping left and right operands and to use js: `in`

        else if .name is 'has property'
            .out prepend, .right," in ",.left, append

3) *'into'* operator (assignment-expression), requires swapping left and right operands and to use js: `=`

        else if .name is 'into'
            .out "(",.right,"=",.left,")"

4) *'like'* operator (RegExp.test), requires swapping left and right operands and to use js: `.test()`

        else if .name is 'like'
            .out prepend,.right,".test(",.left,")",append

else we have a direct translatable operator. 
We out: left,operator,right

        else
            .out prepend, .left, ' ', operTranslate(oper), ' ', .right , append


### append to class Grammar.Expression ###

      method produce(options) 

        declare on options
          negated

Produce the expression body, negated if options={negated:true}

        default options=
          negated: undefined

        var prepend=""
        var append=""
        if options.negated

(prettier generated code) Try to avoid unnecessary parens after '!' 
for example: if the expression is a single variable, as in the 'falsey' check: 
Example: `if no options.log then... ` --> `if (!options.log) {...` 
we don't want: `if (!(options.log)) {...` 

          if .operandCount is 1 
              #no parens needed
              prepend = "!"
          else
              prepend = "!("
              append = ")"
          #end if
        #end if negated

produce the expression body

        .out prepend, .root, append


### append to class Grammar.VariableRef ###

`VariableRef: ['--'|'++'] IDENTIFIER [Accessors] ['--'|'++']`

`VariableRef` is a Variable Reference. 

 a VariableRef can include chained 'Accessors', which can:
 *access a property of the object : `.`-> PropertyAccess `[`->IndexAccess
 *assume the variable is a function and perform a function call :  `(`-> FunctionAccess

      method produce() 

        var preIfExported 

Prefix ++/--, varName, Accessors and postfix ++/--

        if .name is 'arguments' //the only thing that can be done with "arguments" is "arguments.toArray()"
            .out 'Array.prototype.slice.call(arguments)' 
            return

        if .name is 'getProperty' //hack access *BOTH* map key/object property - to make portable to-js to-c code

            if no .accessors or .accessors.length isnt 1 or .accessors[1].constructor isnt Grammar.FunctionAccess 
                .sayErr "expected onTimeout(milliseconds,function)"
            var fnAccess: Grammar.FunctionAccess = .accessors[1]
            if fnAccess.args.length isnt 2
                .sayErr "expected two arguments: onTimeout(milliseconds,function)"

            .out "setTimeout(", fnAccess.args[1],fnAccess.args[0],")" //call setTimeout, invert parameter order

        else 
            var refNameDecl = .tryGetFromScope(.name)
            if no refNameDecl
                .sayErr "cannot find '#{.name}' in scope"
            else
                if refNameDecl.isPublic
                    preIfExported='module.exports.'

node.js module.exports is a leaky abstractions for exported
objects other than functions (e.g: Arrays or objects).
You MUST use always "module.export.varX" and not a local var.

If you do: 

  var arr=[];
  module.export.arr = arr;

  then use arr.push... arr.pop in the module code...

It'll work fine until a module requirer does: 

  var reqd=require('theModule');
  reqd.arr = []

At that point, module.export.arr will point to a different array than
the internal module var "arr[]", so the module will stop working as intended.

        .out .preIncDec, preIfExported, .name, .accessors, .postIncDec


### append to class Grammar.AssignmentStatement ###

      method produce() 

        .out .lvalue, ' ', operTranslate(.name), ' ', .rvalue


-------
### append to class Grammar.DefaultAssignment ###

      method produce() 

        .process(.assignment.lvalue, .assignment.rvalue)

        .skipSemiColon = true

#### helper Functions

      #recursive duet 1
      helper method process(name,value)

if it is ObjectLiteral: recurse levels, else, a simple 'if undefined, assignment'

check if it's a ObjectLiteral (level indent)

          if value instanceof Grammar.ObjectLiteral
            .processItems name, value # recurse Grammar.ObjectLiteral

else, simple value (Expression)

          else
            .assignIfUndefined name, value # Expression


      #recursive duet 2
      helper method processItems(main, objectLiteral) 

          .out "if(!",main,') ',main,"={};",NL

          for each nameValue in objectLiteral.items
            var itemFullName = [main,'.',nameValue.name]
            .process(itemFullName, nameValue.value)


    #end helper recursive functions


-----------
## Accessors
We just defer to JavaScript's built in `.` `[ ]` and `( )` accessors

### append to class Grammar.PropertyAccess ##
      method produce() 
        if .name is 'initInstance' 
            do nothing  // initInstance is the liteScript unified (C and JS) way to call Class instance Initializator function.
                        // in JS, since Classes are Functions, JS uses the Class-Function as initializator function 
                        // so we need to add nothing in case of 'initInstance' 
        else
            .out ".",.name

### append to class Grammar.IndexAccess
      method produce() 
        .out "[",.name,"]"

### append to class Grammar.FunctionArgument
      method produce() 
        .out .expression

### append to class Grammar.FunctionAccess
      method produce() 
        .out "(",{CSL:.args},")"

-----------

### Append to class ASTBase
#### helper method lastLineInxOf(list:ASTBase array) 

More Helper methods, get max line of list

        var lastLine = .lineInx
        for each item in list
            if item.lineInx>lastLine 
              lastLine = item.lineInx

        return lastLine


#### method getOwnerPrefix() returns array

check if we're inside a ClassDeclaration or AppendToDeclaration.
return prefix for item to be appended

        var result=[]
        var start = this

        while start and start.getParent(Grammar.ClassDeclaration) into var parent

            var ownerName, toPrototype

            if parent instance of Grammar.AppendToDeclaration
                #append to class prototype or object
                declare parent:Grammar.AppendToDeclaration
                toPrototype = not parent.toNamespace
                ownerName = parent.varRef
                var refNameDecl  = parent.varRef.tryGetReference()
                if refNameDecl and refNameDecl.nodeDeclared instanceof Grammar.ClassDeclaration
                    start = refNameDecl.nodeDeclared
                else
                    start = undefined
              
            else if parent instance of Grammar.NamespaceDeclaration
                toPrototype = false
                ownerName = parent.name
                start = parent

            else # in a ClassDeclaration
                toPrototype = true
                ownerName = parent.name
                start = parent

            result.unshift ownerName, (toPrototype? ".prototype." else ".")

        #loop

        return result


---
### Append to class Grammar.WithStatement ###

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
to js:
```
var with__1=frontDoor;
  with__1.show;
  with__1.open
  with__1.show
  with__1.close
  with__1.show
```

      method produce() 

        .out "var ",.name,'=',.varRef,";"
        .out .body


---
### Append to class Grammar.PropertiesDeclaration ###

'var' followed by a list of comma separated: var names and optional assignment

      method produce(prefix) 

        .outLinesAsComment .lineInx, .lastLineInxOf(.list)

        if no prefix, prefix = .getOwnerPrefix()

        for each varDecl in .list
          if varDecl.assignedValue #is not valid to assign to .prototype. - creates subtle errors later
            if prefix instance of Array and prefix[1] and prefix[1] isnt '.', .throwError 'cannot assign values to instance properties in "Append to"'
            .out '    ',prefix, varDecl.name,"=",varDecl.assignedValue,";",NL

        .skipSemiColon = true

### Append to class Grammar.VarStatement ###

'var' followed by a list of comma separated: var names and optional assignment

      method produce() 

        if .keyword is 'let' and .compilerVar('ES6')
          .out 'let '

        else
          .out 'var '

Now, after 'var' or 'let' out one or more comma separated VariableDecl 
  
        .out {CSL:.list, freeForm:.list.length>2}

If 'var' was adjectivated 'export', add to exportNamespace

        if not .lexer.out.browser
  
          if .hasAdjective("export") 
            .out ";", NL,{COMMENT:'export'},NL
            for each varDecl in .list
                .out .lexer.out.exportNamespace,'.',varDecl.name,' = ', varDecl.name, ";", NL
            .skipSemiColon = true



### Append to class Grammar.ImportStatementItem ###

      method produce() 
        .out "var ",.name," = require('", .getNodeJSRequireFileRef(),"');", NL


      method getNodeJSRequireFileRef() 
        
node.js require() require "./" to denote a local module to load.
it does like bash does for executable files. A name  without ./ means "look in $PATH".
this is not the most intuitive choice.

        if .importedModule.fileInfo.importInfo.globalImport 
            return .name // for node, no './' means "look in node_modules, and up, then global paths"

        var thisModule = .getParent(Grammar.Module)

get the required file path, relative to the location of this module (as nodejs's require() requires)

        if no .importedModule.fileInfo.outRelFilename
            print JSON.stringify(.importedModule.fileInfo)
            print thisModule.fileInfo.dirname

        var fn = Environment.relName(.importedModule.fileInfo.outRelFilename
                                     ,Environment.dirName(thisModule.fileInfo.outRelFilename));
        
check for 'import x from 'path/file';

        if .importParameter and fn[0] is '/' //has `from 'path/file'` AND  is an absolute path 
            return fn

else, a simple 'import x'

        return "./#{fn}"; // node.js require() require "./" to denote a local module to load                


### Append to class Grammar.ImportStatement ###

'import' followed by a list of comma separated: var names and optional assignment

      method produce() 
        .out .list //see:Grammar.ImportStatementItem
        .skipSemiColon = true //each item is `var x=require('x');`


### Append to class Grammar.VariableDecl ###

variable name and optionally assign a value

      method produce() 

It's a `var` keyword or we're declaring function parameters.
In any case starts with the variable name
      
          .out .name

          declare valid .keyword

If this VariableDecl come from a 'var' statement, we force assignment (to avoid subtle bugs,
in LiteScript, 'var' declaration assigns 'undefined')

          if .parent instanceof Grammar.VarStatement 
              .out ' = ',.assignedValue or 'undefined'

else, this VariableDecl come from function parameters decl, 
if it has AssginedValue, we out assignment if ES6 is available. 
(ES6 implements 'default' for parameters, so `function myFunc(a=3)` is valid in ES6)

          else
            if .assignedValue and .compilerVar('ES6')
                .out ' = ',.assignedValue

    #end VariableDecl


### Append to class Grammar.SingleLineBody ###

      method produce(sep=";")
        var bare=[]
        for each statement in .statements
            bare.push statement.statement
        .out {CSL:bare, separator:sep}

### Append to class Grammar.IfStatement ###

      method produce() 

        declare valid .elseStatement.produce

        if .body instanceof Grammar.SingleLineBody
            .out "if (", .conditional,") {",.body,"}"
        else
            .out "if (", .conditional, ") {", .getEOLComment()
            .out  .body, "}"

        if .elseStatement
            .outPrevLinesComments .elseStatement.lineInx-1
            .elseStatement.produce()


### Append to class Grammar.ElseIfStatement ###

      method produce() 

        .out NL,"else ", .nextIf

### Append to class Grammar.ElseStatement ###

      method produce()

        .out NL,"else {", .body, "}"

### Append to class Grammar.ForStatement ###

There are 3 variants of `ForStatement` in LiteScript

      method produce() 

        declare valid .variant.iterable
        declare valid .variant.produce

Pre-For code. If required, store the iterable in a temp var.
(prettier generated code) Only if the iterable is a complex expression, 
(if it can have side-effects) we store it in a temp 
var in order to avoid calling it twice. Else, we use it as is.

        var iterable:Grammar.Expression = .variant.iterable
        if iterable 
            declare valid iterable.root.name.hasSideEffects
            if iterable.operandCount>1 or iterable.root.name.hasSideEffects or iterable.root.name instanceof Grammar.Literal
                iterable = ASTBase.getUniqueVarName('list')  #unique temp iterable var name
                .out "var ",iterable,"=",.variant.iterable,";",NL

        .variant.produce(iterable)

Since al 3 cases are closed with '}; //comment', we skip statement semicolon

        .skipSemiColon = true


### Append to class Grammar.ForEachProperty
### Variant 1) 'for each property' to loop over *object property names* 

`ForEachProperty: for each [own] property name-VariableDecl in object-VariableRef`

      method produce(iterable) 

          if .mainVar
            .out "var ", .mainVar.name,"=undefined;",NL

          var index=.indexVar or ASTBase.getUniqueVarName('inx');

          .out "for ( var ", index, " in ", iterable, ")"
          //.out "if (",iterable,".hasOwnProperty(",index,"))"

          .body.out "{", .mainVar.name,"=",iterable,"[",index,"];",NL

          .out .where

          .body.out "{", .body, "}",NL

          .body.out NL, "}"

          .out {COMMENT:"end for each property"},NL


### Append to class Grammar.ForEachInArray
### Variant 2) 'for each index' to loop over *Array indexes and items*

`ForEachInArray: for each [index-VariableDecl,]item-VariableDecl in array-VariableRef`

      method produce(iterable)

Create a default index var name if none was provided

        if .inMap //new syntax "for each in map xx"
            return .produceInMap(iterable)

        var indexVar = .indexVar
        if no indexVar
          indexVar = {name:.mainVar.name+'__inx', assignedValue:0} #default index var name

        .out "for( var "
                , indexVar.name,"=",indexVar.assignedValue or "0",",",.mainVar.name
                ," ; ",indexVar.name,"<",iterable,".length"
                ," ; ",indexVar.name,"++){"

        .body.out .mainVar.name,"=",iterable,"[",indexVar.name,"];",NL

        if .where 
          .out '  ',.where,"{",.body,"}"
        else 
          .out .body

        .out "};",{COMMENT:["end for each in ",.iterable]},NL


method: produceInMap
When Map is implemented using js "Object"

      method produceInMap(iterable)

          var indexVarName:string
          if no .indexVar
            indexVarName = .mainVar.name+'__propName'
          else
            indexVarName = .indexVar.name

          .out "var ", .mainVar.name,"=undefined;",NL
          .out 'if(!',iterable,'.dict) throw(new Error("for each in map: not a Map, no .dict property"));',NL
          .out "for ( var ", indexVarName, " in ", iterable, ".dict)"
          .out " if (",iterable,".dict.hasOwnProperty(",indexVarName,"))"

          if .mainVar
              .body.out "{", .mainVar.name,"=",iterable,".dict[",indexVarName,"];",NL

          .out .where

          .body.out "{", .body, "}",NL

          if .mainVar
            .body.out NL, "}"

          .out {COMMENT:"end for each property"},NL

### Append to class Grammar.ForIndexNumeric
### Variant 3) 'for index=...' to create *numeric loops* 

`ForIndexNumeric: for index-VariableDecl "=" start-Expression [,|;] (while|until) condition-Expression [(,|;) increment-Statement]`

Examples: `for n=0 while n<10`, `for n=0 to 9`
Handle by using a js/C standard for(;;){} loop

      method produce(iterable)

        var isToDownTo: boolean

        if .conditionPrefix in['to','down']
            
            isToDownTo= true

store endExpression in a temp var. 
For loops "to/down to" evaluate end expresion only once

            var endTempVarName = ASTBase.getUniqueVarName('end')
            .out "var ",endTempVarName,"=",.endExpression,";",NL

        end if

        .out "for( var ",.indexVar.name, "=", .indexVar.assignedValue or "0", "; "

        if isToDownTo

            #'for n=0 to 10' -> for(n=0;n<=10;n++)
            #'for n=10 down to 0' -> for(n=10;n>=0;n--)
            .out .indexVar.name, .conditionPrefix is 'to'? "<=" else ">=", endTempVarName

        else # is while|until

while|until conditions are evaluated on each loop.
Produce the condition, negated if the prefix is 'until'.

            #for n=0, while n<arr.length  -> for(n=0;n<arr.length;...
            #for n=0, until n >= arr.length  -> for(n=0;!(n>=arr.length);...
            .endExpression.produce( {negated: .conditionPrefix is 'until' })

        .out "; "

if no increment specified, the default is indexVar++

        if .increment
            .increment.produce(",") //statements separated by ","
        else
            //default index++ (to) or index-- (down to)
            .out .indexVar.name, .conditionPrefix is 'down'? '--' else '++'

        .out ") ", .where

        .out "{", .body, "};",{COMMENT:"end for #{.indexVar.name}"}, NL



### Append to class Grammar.ForWhereFilter
### Helper for where filter
`ForWhereFilter: [where Expression]`

      method produce()
        .out 'if(',.filter,')'

### Append to class Grammar.DeleteStatement
`DeleteStatement: delete VariableRef`

      method produce()
        .out 'delete ',.varRef

### Append to class Grammar.WhileUntilExpression ###

      method produce(options) 

If the parent ask for a 'while' condition, but this is a 'until' condition,
or the parent ask for a 'until' condition and this is 'while', we must *negate* the condition.

        declare valid .expr.produce

        default options = 
          askFor: undefined
          negated: undefined

        if options.askFor and .name isnt options.askFor
            options.negated = true

*options.askFor* is used when the source code was, for example,
`do until Expression` and we need to code: `while(!(Expression))` 
or the code was `loop while Expression` and we need to code: `if (!(Expression)) break` 

when you have a `until` condition, you need to negate the expression 
to produce a `while` condition. (`while NOT x` is equivalent to `until x`)

        .expr.produce(options)


### Append to class Grammar.DoLoop ###

      method produce() 

Note: **WhileUntilLoop** symbol has **DoLoop** as *prototype*, so this *.produce()* method
is used by both symbols.

        if .postWhileUntilExpression 

if we have a post-condition, for example: `do ... loop while x>0`, 

            .out "do{", .getEOLComment()
            .out .body
            .out "} while ("
            .postWhileUntilExpression.produce({askFor:'while'})
            .out ")"

else, optional pre-condition:
  
        else

            .out 'while('
            if .preWhileUntilExpression
              .preWhileUntilExpression.produce({askFor:'while'})
            else 
              .out 'true'
            .out '){', .body , "}"

        end if

        .out ";",{COMMENT:"end loop"},NL
        .skipSemiColon = true

### Append to class Grammar.LoopControlStatement ###
This is a very simple produce() to allow us to use the `break` and `continue` keywords.
  
      method produce() 

validate usage inside a for/while

        var nodeASTBase = this.parent
        do

            if .control is 'break' and nodeASTBase is instanceof Grammar.SwitchCase
                .sayErr 'cannot use "break" from inside a "switch" statement for "historic" reasons'

            else if nodeASTBase is instanceof Grammar.FunctionDeclaration
                //if we reach function header
                .sayErr '"{.control}" outside a for|while|do loop'
                break

            else if nodeASTBase is instanceof Grammar.ForStatement
                or nodeASTBase is instanceof Grammar.DoLoop
                    break //ok, break/continue used inside a loop

            end if

            nodeASTBase = nodeASTBase.parent

        loop

        .out .control

### Append to class Grammar.DoNothingStatement ###

      method produce()
        .out "null"

### Append to class Grammar.ParenExpression ###

A `ParenExpression` is just a normal expression surrounded by parentheses.

      method produce() 
        .out "(",.expr,")"

### Append to class Grammar.ArrayLiteral ###

A `ArrayLiteral` is a definition of a list like `[1, a, 2+3]`. We just pass this through to JavaScript.

      method produce() 
        .out "[",{CSL:.items},"]"

### Append to class Grammar.NameValuePair ###

A `NameValuePair` is a single item in an object definition. Since we copy js for this, we pass this straight through 

      method produce() 
        .out .name,": ",.value

### Append to class Grammar.ObjectLiteral ### also FreeObjectLiteral

A `ObjectLiteral` is an object definition using key/value pairs like `{a:1,b:2}`. 
JavaScript supports this syntax, so we just pass it through. 

A `FreeObjectLiteral` is an object definition using key/value pairs, but in free-form
(one NameValuePair per line, indented, comma is optional)

      method produce()

          if .isMap, .out 'new Map().fromObject('
          .out '{',{CSL:.items, freeForm:.constructor is Grammar.FreeObjectLiteral },'}'
          if .isMap, .out ')'


### Append to class Grammar.FunctionDeclaration ###

`FunctionDeclaration: '[export][generator] (function|method|constructor) [name] '(' FunctionParameterDecl* ')' Block`

`FunctionDeclaration`s are function definitions. 

`export` prefix causes the function to be included in `module.exports`
`generator` prefix marks a 'generator' function that can be paused by `yield` (js/ES6 function*)

     method produce(prefix:array)

Generators are implemented in ES6 with the "function*" keyword (note the asterisk)

      var generatorMark = .generator and .compilerVar('ES6')? "*" else ""

      var isConstructor = this instance of Grammar.ConstructorDeclaration

      if this instance of Grammar.MethodDeclaration

          #get owner where this method belongs to
          if no prefix
              if no .getOwnerPrefix() into prefix 
                  fail with 'method "#{.name}" Cannot determine owner object'

          #if shim, check before define
          if .shim, .out "if (!",prefix,.name,")",NL

          if .definePropItems #we should code Object.defineProperty
              prefix[1] = prefix[1].replace(/\.$/,"") #remove extra dot
              .out "Object.defineProperty(",NL,
                    prefix, ",'",.name,"',{value:function",generatorMark
          else
              .out prefix,.name," = function",generatorMark

else, it is a simple function

      else 
          .out "function ",.name, generatorMark

if 'nice', produce default nice body, and then the generator header for real body

      var isNice = .nice and not (isConstructor or .shim or .definePropItems or .generator)
      if isNice
          var argsArray = (.paramsDeclarations or []).concat["__callback"]
          .out "(", {CSL:argsArray},"){", .getEOLComment(),NL
          .out '  nicegen(this, ',prefix,.name,"_generator, arguments);",NL
          .out "};",NL
          .out "function* ",prefix,.name,"_generator"
      end if

Produce function parameters declaration
       
      .out "(", {CSL:.paramsDeclarations}, "){", .getEOLComment()

now produce function body

      .produceBody

if we were coding .definePropItems , close Object.defineProperty

      if .definePropItems 
          for each definePropItem in .definePropItems 
            .out NL,",",definePropItem.name,":", definePropItem.negated? 'false':'true'
          end for
          .out NL,"})"

If the function was adjectivated 'export', add to module.exports

      if not .lexer.out.browser
        if .export and not .default
          .out ";",NL,{COMMENT:'export'},NL
          .out .lexer.out.exportNamespace,'.',.name,'=',.name,";"
          .skipSemiColon = true


#### method produceBody()

if the function has a exception block, insert 'try{'

      if no .body, .throwError 'function #{.name} has no body'

if one-line-function, code now: Example: function square(x) = x*x

      if .body instance of Grammar.Expression
          .out "return ", .body

      else

if it has a "catch" or "exception", insert 'try{'

          for each statement in .body.statements
            if statement.statement instance of Grammar.ExceptionBlock
                .out " try{",NL
                break

if params defaults where included, we assign default values to arguments 
(if ES6 enabled, they were included abobve in ParamsDeclarations production )

          if .paramsDeclarations and not .compilerVar('ES6')
              for each paramDecl in .paramsDeclarations
                if paramDecl.assignedValue 
                    .body.assignIfUndefined paramDecl.name, paramDecl.assignedValue
              #end for
          #end if

          .body.produce()

      end if one-line-function

close the function, add source map for function default "return undefined" execution point

      .out "}"
      if .lexer.out.sourceMap
          .lexer.out.sourceMap.add ( .EndFnLineNum, 0, .lexer.out.lineNum-1, 0)

--------------------
### Append to class Grammar.PrintStatement ###
`print` is an alias for console.log

      method produce()
        .out "console.log(",{"CSL":.args},")"


--------------------
### Append to class Grammar.EndStatement ###

Marks the end of a block. It's just a comment for javascript

      method produce()

        declare valid .lexer.out.lastOriginalCodeComment
        declare valid .lexer.infoLines

        if .lexer.out.lastOriginalCodeComment<.lineInx
          .out {COMMENT: .lexer.infoLines[.lineInx].text}
        
        .skipSemiColon = true

--------------------
### Append to class Grammar.CompilerStatement ###

      method produce()

first, out as comment this line

        .outLineAsComment .lineInx

if it's a conditional compile, output body is option is Set

        if .conditional
            if .compilerVar(.conditional)
                declare valid .body.produce
                .body.produce()

        .skipSemiColon = true


--------------------
### Append to class Grammar.DeclareStatement ###

Out as comments

      method produce()

        .outLinesAsComment .lineInx, .names? .lastLineInxOf(.names) : .lineInx
        .skipSemiColon = true


----------------------------
### Append to class Grammar.ClassDeclaration ###

Classes contain a code block with properties and methods definitions.

      method produce()

        .out {COMMENT:"constructor"},NL
      
First, since in JS we have a object-class-function-constructor  all-in-one
we need to get the class constructor, and separate other class items.

        declare theConstructor:Grammar.FunctionDeclaration
        declare valid .produce_AssignObjectProperties
        declare valid .export

        var theConstructor = null
        var theMethods = []
        var theProperties = []

        if .body
          for each index,item in .body.statements

            if item.statement instanceof Grammar.ConstructorDeclaration 

              if theConstructor # what? more than one?
                .throwError('Two constructors declared for class #{.name}')

              theConstructor = item.statement

            else if item.statement instanceof Grammar.PropertiesDeclaration
              theProperties.push item.statement

            else 
              theMethods.push item

        #end if body

        var prefix = .getOwnerPrefix()

js: function-constructor-class-namespace-object (All-in-one)

        .out "function ",.name

        if theConstructor //there was a constructor body, add specified params
            .out "(", {CSL:theConstructor.paramsDeclarations}, "){", .getEOLComment()
        else
            .out "(){ // default constructor",NL

call super-class __init

        if .varRefSuper
            .out {COMMENT:["default constructor: call super.constructor"]}
            .out NL,"    ",.varRefSuper,".prototype.constructor.apply(this,arguments)",NL

initialize own properties

        for each propDecl in theProperties
            propDecl.produce('this.') //property assignments
        
        if theConstructor //there was a body
            theConstructor.produceBody
            .out ";",NL
        else
            .out "};",NL

if the class is inside a namespace...

        if prefix and prefix.length 
            .out prefix,.name,"=",.name,";",NL //set declared fn-Class as method of owner-namespace

Set super-class if we have one indicated

        if .varRefSuper
          .out {COMMENT:[.name,' (extends|proto is) ',.varRefSuper,NL]}
          .out .name,'.prototype.__proto__ = ', .varRefSuper,'.prototype;',NL 

now out methods, meaning: create properties in the object-function-class prototype

        for each itemMethodDeclaration in theMethods
            itemMethodDeclaration.produce undefined, prefix

If the class was adjectivated 'export', add to module.exports

        if not .lexer.out.browser
          if .export and not .default
            .out NL,{COMMENT:'export'},NL
            .out .lexer.out.exportNamespace,'.',.name,' = ', .name,";"

        .out NL,{COMMENT:"end class "},.name,NL
        .skipSemiColon = true


### Append to class Grammar.AppendToDeclaration ###

Any class|object can have properties or methods appended at any time. 
Append-to body contains properties and methods definitions.

      method produce() 
        .out .body
        .skipSemiColon = true


### Append to class Grammar.NamespaceDeclaration ###

Any class|object can have properties or methods appended at any time. 
Append-to body contains properties and methods definitions.

      method produce() 
        .out no .varRef.accessors? 'var ':'' ,.varRef,'={};'
        .out .body
        .skipSemiColon = true

        if not .lexer.out.browser
            if .export and not .default
                .out ";",NL,{COMMENT:'export'},NL
                .out .lexer.out.exportNamespace,'.',.name,'=',.name,";"



### Append to class Grammar.TryCatch ###

      method produce() 

        .out "try{", .body, .exceptionBlock

### Append to class Grammar.ExceptionBlock ###

      method produce() 

        .out NL,"}catch(",.catchVar,"){", .body, "}"

        if .finallyBody
          .out NL,"finally{", .finallyBody, "}"


### Append to class Grammar.SwitchStatement ###

      method produce()

if we have a varRef, is a switch over a value

        if .varRef

            .out "switch(", .varRef, "){",NL,NL
            for each switchCase in .cases
                .out {pre:"case ", CSL:switchCase.expressions, post:":", separator:' '}
                .out switchCase.body
                switchCase.body.out "break;",NL,NL

            if .defaultBody, .out "default:",.defaultBody
            .out NL,"}"

else, it's a swtich over true-expression, we produce as chained if-else

        else

          for each index,switchCase in .cases
              .outLineAsComment switchCase.lineInx
              .out index>0? "else ":"", "if ("
              .out {pre:"(", CSL:switchCase.expressions, post:")", separator:"||"}
              .out "){"
              .out switchCase.body
              .out NL,"}"

          if .defaultBody, .out NL,"else {",.defaultBody,"}"


### Append to class Grammar.CaseStatement ###

##### method produce()

if we have a varRef, is a case over a value

        if .isInstanceof
            return .produceInstanceOfLoop

        for each index,whenSection in .cases

            .outLineAsComment whenSection.lineInx

            .out index>0? 'else ' : '' 

            if .varRef
                //case foo...
                .out 'if (', {pre:['(',.varRef,'=='], CSL:whenSection.expressions, post:')', separator:'||'}
            else
                //case when TRUE
                .out 'if (', {pre:['('], CSL:whenSection.expressions, post:')', separator:'||'}
                
            .out '){',
                whenSection.body, NL,
                '}'

else body

        if .elseBody, .out NL,'else {',.elseBody,'}'


##### method produceInstanceOfLoop

        var tmpVar=ASTBase.getUniqueVarName('class')
        .out "Class_ptr ",tmpVar," = ",.varRef,".class;",NL,
            "while(",tmpVar,"){",NL

        for each index,whenSection in .cases

            .outLineAsComment whenSection.lineInx

            whenSection.out index>0? 'else ' : '' ,
                'if (', {pre:['(',.varRef,'.class=='], CSL:whenSection.expressions, post:')', separator:'||'},
                '){',
                whenSection.body, NL,
                'break;',NL, //exit while super loop
                '}'

        end for

        .out tmpVar,'=',tmpVar,'.super;',NL //move to super
        .out '}',NL //close while loooking for super

else body

        if .elseBody, .out NL,'if(!tmpVar) {',.elseBody,'}'


### Append to class Grammar.YieldExpression ###

      method produce()

Check location
      
        if no .getParent(Grammar.FunctionDeclaration) into var functionDeclaration 
            or no functionDeclaration.nice
                .throwError '"yield" can only be used inside a "nice function/method"'

        var yieldArr=[]

        var varRef = .fnCall.varRef
        //from .varRef calculate object owner and method name 

        var thisValue='null'
        var fnName = varRef.name #default if no accessors 

        if varRef.accessors

            var inx=varRef.accessors.length-1
            if varRef.accessors[inx] instance of Grammar.FunctionAccess
                yieldArr = varRef.accessors[inx].args
                inx--

            if inx>=0 
                if varRef.accessors[inx] isnt instance of Grammar.PropertyAccess
                    .throwError 'yield needs a clear method name. Example: "yield until obj.method(10)". redefine yield parameter.'

                fnName = "'#{varRef.accessors[inx].name}'"
                thisValue = [varRef.name].concat(varRef.accessors.slice(0,inx))


        if .specifier is 'until'

            yieldArr.unshift fnName
            yieldArr.unshift thisValue

        else #parallel map

            yieldArr.push "'map'",.arrExpression, thisValue, fnName


        .out "yield [ ",{CSL:yieldArr}," ]"



# Helper functions 


Utility 
-------

    var NL = '\n' # New Line constant

Operator Mapping
================

Many LiteScript operators can be easily mapped one-to-one with their JavaScript equivalents.

    var OPER_TRANSLATION =

      'no':           '!'
      'not':          '!'
      'unary -':      '-'
      'unary +':      '+'

      '&':            '+'  //string concat
      '&=':           '+='  //string concat

      'bitand':       '&'
      'bitor':        '|'
      'bitxor':       '^'
      'bitnot':       '~'

      'type of':      'typeof'
      'instance of':  'instanceof'

      'is':           '==='
      'isnt':         '!=='
      '<>':           '!=='
      'and':          '&&'
      'but':          '&&'
      'or':           '||'
      'has property': 'in'

    function operTranslate(name:string)
      return name.translate(OPER_TRANSLATION)

---------------------------------

### Append to class ASTBase

Helper methods and properties, valid for all nodes

#### properties skipSemiColon 

#### helper method assignIfUndefined(name,value) 
          
          declare valid value.root.name.name
          #do nothing if value is 'undefined'
          if value.root.name.name is 'undefined' #Expression->Operand->VariableRef->name
            .out {COMMENT:[name,": undefined",NL]}
            return

          .out "if(",name,'===undefined) ',name,"=",value,";",NL


--------------------------------
