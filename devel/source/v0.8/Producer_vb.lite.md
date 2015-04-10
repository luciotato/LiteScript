Producer JS
===========

The `producer` module extends Grammar classes, adding a `produce()` method 
to generate target code for the node.

The compiler calls the `.produce()` method of the root 'Module' node 
in order to return the compiled code for the entire tree.

We extend the Grammar classes, so this module require the `Grammar` module.

    import ASTBase, Grammar, Environment, UniqueID 
    shim import Map
    
VB.NET Producer Functions
=========================

### Append to class Grammar.Module ###

#### method produce()

if a 'export default' was declared, set the referenced namespace 
as the new 'export default' (instead of 'module.exports')

        .lexer.outCode.exportNamespace = 'module.exports'

Literate programming should allow to reference a function defined later.
Leave loose module imperative statements for the last. 
Produce all vars & functions definitions first.

        var looseStatements=[]

        .out
            {COMMENT: "-----------"},NL
            "Module #{.fileInfo.base}",NL
            {COMMENT: "-----------"},NL 

        for each statement in .body.statements

            case statement.specific.constructor
  
                when 
                    Grammar.ImportStatement
                    Grammar.VarStatement
                    Grammar.ClassDeclaration
                    Grammar.FunctionDeclaration
                    Grammar.NamespaceDeclaration
                    Grammar.AppendToDeclaration
                    :
                        statement.produce

                else
                    looseStatements.push statement

        .out
            {COMMENT: "-----------"},NL
            {COMMENT:"Module code"},NL
            {COMMENT: "-----------"},NL 

        for each statement in looseStatements
            statement.produce

        .out 
            NL
            'end module',NL
            NL


export 'export default' namespace, if it was set.

/*        if not .lexer.outCode.browser
            if .exportsReplaced
                .out 'module.exports=',.exports.name,";",NL
*/

### Append to class Grammar.Body 

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

add preceeding comment lines, in the same position as the source

        .outPreviousComments

To enhance compiled code readability, add original Lite line as comment 

        if .lexer.options.comments // and .lexer.outCode.lastOriginalCodeComment<.lineInx
               
            var commentTo =  .lastSourceLineNum
            if .specific has property "body"
                or .specific is instance of Grammar.IfStatement
                or .specific is instance of Grammar.WithStatement
                or .specific is instance of Grammar.ForStatement
                or .specific is instance of Grammar.CaseStatement
                    commentTo =  .sourceLineNum

            .outSourceLinesAsComment commentTo

            //.lexer.outCode.lastOriginalCodeComment = commentTo

Each statement in its own line

        if .specific isnt instance of Grammar.SingleLineBody
            .lexer.outCode.ensureNewLine

if there are one or more 'into var x' in a expression in this statement, 
declare vars before statement (exclude body of FunctionDeclaration)

        this.callOnSubTree "declareIntoVar", Grammar.Body

call the specific statement (if,for,print,if,function,class,etc) .produce()

        var mark = .lexer.outCode.markSourceMap(.indent)
        .out .specific

add ";" after the statement
then EOL comment (if it isnt a multiline statement)
then NEWLINE

        if not .specific.skipSemiColon
          .addSourceMap mark
          //.out ";"

called above, pre-declare vars from 'into var x' assignment-expression

    append to class Grammar.Oper
      method declareIntoVar()
          if .intoVar
              .out "Dim ",.right," as Object",NL


---------------------------------
### append to class Grammar.ThrowStatement ###

      method produce()
          if .specifier is 'fail'
            .out "Throw New System.Exception(", .expr,")"
          else
            .out "Throw ", .expr


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

### append to class Grammar.StringLiteral ###

      method produce()
          .out '"', .getValue(), '"'

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

if it is "boolean not", add parentheses, because vb has a different precedence for "boolean not"
-(prettier generated code) do not add () for simple "falsey" variable check

        if translated is "Not" 
            if not (.name is "no" and .right.name instanceof Grammar.VariableRef)
                prepend ="("
                append=")"

add a space if the unary operator is a word. Example `typeof`

        else if (translated.charAt(0)>='a' and translated.charAt(0)<='z')
            or (translated.charAt(0)>='A' and translated.charAt(0)<='Z')
              translated &= " "

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
                oper = '<>'

else -if NEGATED- we add `!( )` to the expression

            else 
                prepend ="Not ("
                append=")"

Check for special cases: 

1) 'in' operator, requires swapping left and right operands and to use `.indexOf(...)>=0`
example: `x in [1,2,3]` -> `[1,2,3].indexOf(x)>=0`
example: `x not in [1,2,3]` -> `[1,2,3].indexOf(x)==-1`
example: `char not in myString` -> `myString.indexOf(char)==-1`
example (`arguments` pseudo-array): `'lite' not in arguments` -> `Array.prototype.slice.call(arguments).indexOf(char)==-1`

        if .name is 'in' 
            .out prepend,.right,".Contains(",.left,")", append

fix when used on JS built-in array-like `arguments`
//            .lexer.outCode.currLine = .lexer.outCode.currLine.replace(/\barguments.indexOf\(/,'Array.prototype.slice.call(arguments).indexOf(')

2) *'X instance of Y'* => TypeOf X is Y

        else if .name is 'instance of'
            .out prepend,'TypeOf ',.left," is ",.right, append

2) *'has property'* operator, requires swapping left and right operands and to use js: `in`

        else if .name is 'has property'
            .out prepend,.left,".Contains(",.right,")", append

3) *'into'* operator (assignment-expression), requires swapping left and right operands and to use js: `=`

        else if .name is 'into'
            .out "Assign(",.right,",",.left,")"

4) *'like'* operator (RegExp.test), requires swapping left and right operands and to use js: `.test()`

//        else if .name is 'like'
//            .out prepend,.right,".test(",.left,")",append

else we have a direct translatable operator. 
We out: left,operator,right

        else
            .out prepend, .left, ' ', operTranslate(oper), ' ', .right , append


### append to class Grammar.Expression ###

      method produce(negated:boolean) 

Produce the expression body, negated if options={negated:true}

        var prepend=""
        var append=""
        if negated

(prettier generated code) Try to avoid unnecessary parens after '!' 
for example: if the expression is a single variable, as in the 'falsey' check: 
Example: `if no options.log then... ` --> `if (!options.log) {...` 
we don't want: `if (!(options.log)) {...` 

          if .operandCount is 1 
              #no parens needed
              prepend = "Not"
          else
              prepend = "Not("
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

        var refNameDecl = .tryGetFromScope(.name)
        if no refNameDecl
            .sayErr "cannot find '#{.name}' in scope"

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

        var useme = .name is 'this'? 'Me' else .name
        .out .preIncDec, preIfExported, useme, .accessors, .postIncDec


### append to class Grammar.AssignmentStatement ###

      method produce() 

        .out .lvalue, ' ', operTranslate(.name), ' ', .rvalue


-------
### append to class Grammar.DefaultAssignment ###

Example: `default option = 5`

      method produce() 

        .out "if ismissing(",.assignment.lvalue,') then ',.assignment.lvalue,"=",.assignment.rvalue,": end if",NL

        .skipSemiColon = true

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
        .out "(",.name,")"

### append to class Grammar.FunctionArgument
      method produce() 
        .out .expression

### append to class Grammar.FunctionAccess
      method produce() 
        .out "(",{CSL:.args},")"

-----------

### Append to class ASTBase
#### helper method lastLineOf(list:ASTBase array) 

More Helper methods, get max line of list

        var lastLine = .sourceLineNum
        for each item in list
            if item.sourceLineNum>lastLine 
              lastLine = item.sourceLineNum

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

      method produce() 

        .out "With ",.name
        .out .body

        .out "end with"
        .skipSemiColon = true


---

### Append to class Grammar.VarDeclList ###

default "produce" for VarDeclList is to out only names, comma separated

      method produce
        .out {CSL:.getNames()}


### Append to class Grammar.TypeDeclaration ###

      method produce() 
        if .mainType.name is 'Map'
          .out "new Dictionary(Of #{.keyType or 'Object'}, #{.itemType or 'Object'})"
        else
          .out .mainType or 'Object'
          if .mainType, .out {COMMENT:"mainType: #{.mainType}  "}
          if .keyType, .out {COMMENT:"keyType: #{.keyType}  "}
          if .itemType, .out {COMMENT:"itemType: #{.itemType}"}
        
        .out NL

### Append to class Grammar.PropertiesDeclaration ###

'var' followed by a list of comma separated: var names and optional assignment

      method produce() 
        for each varDecl in .list
          .out '    Public Property ', varDecl.name," as ",varDecl.type or 'Object'
          if varDecl.assignedValue, .out "=",varDecl.assignedValue
          .out NL

      method produceAssignment(prefix) 

        //.outSourceLinesAsComment .lastLineOf(.list)

        if no prefix, prefix = .getOwnerPrefix()

        for each varDecl in .list
          if varDecl.assignedValue #is not valid to assign to .prototype. - creates subtle errors later
            if prefix instance of Array and prefix[1] and prefix[1] isnt '.', .throwError 'cannot assign values to instance properties in "Append to"'
            .out '    ',prefix, varDecl.name,"=",varDecl.assignedValue,NL

        .skipSemiColon = true

### Append to class Grammar.VarStatement ###

'var' followed by a list of comma separated: var names and optional assignment

      method produce() 

        declare valid .compilerVar:function
        declare valid .export

        .out 'Dim '

Now, after 'var' or 'let' out one or more comma separated VariableDecl 
  
        .out {CSL:.list, freeForm:.list.length>2}


### Append to class Grammar.ImportStatementItem ###

      method produce() 
        .out "'var ",.name," = require('", .getNodeJSRequireFileRef(),"');", NL


      method getNodeJSRequireFileRef() 
        
        if .lexer.options.single and .importParameter
            return .importParameter.name
        
node.js require() use "./" to denote a local module to load.
It does as bash does for executable files.
A name  without "./"" means "look in $PATH" (node_modules and up)

        if no .importedModule or .importedModule.fileInfo.isCore or '.interface.' in .importedModule.fileInfo.filename
            return .name // for node, no './' means "look in node_modules, and up, then global paths"

        var thisModule = .getParent(Grammar.Module)

get the required file path, relative to the location of this module (as nodejs's require() requires)

        #debug
        #if no .importedModule.fileInfo.outRelFilename
        #print "thisModule.fileInfo.outRelFilename",thisModule.fileInfo.outFilename
        #print  ".importedModule.fileInfo.outRelFilename",.importedModule.fileInfo.outFilename

        var fn = Environment.relativeFrom(Environment.getDir(thisModule.fileInfo.outFilename)
                                            ,.importedModule.fileInfo.outFilename);
        
check for 'import x from 'path/file';

        if .importParameter and fn.charAt(0) is '/' //has `from 'path/file'` AND  is an absolute path 
            return fn

else, a simple 'import x'

        return "./#{fn}"; // node.js require() use "./" to denote a local module to load                


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
              .out ' = ',.assignedValue or 'Nothing'

else, this VariableDecl come from function parameters decl, 
if it has AssginedValue, we out assignment if ES6 is available. 
(ES6 implements 'default' for parameters, so `function myFunc(a=3)` is valid in ES6)

          else
            if .assignedValue // parameter default assignment
                .out ':=',.assignedValue

    #end VariableDecl


### Append to class Grammar.SingleLineBody ###

      method produce()
        var bare=[]
        for each statement in .statements
            bare.push statement.specific
        .out {CSL:bare, separator:","}

### Append to class Grammar.IfStatement ###

      method produce() 

        declare valid .elseStatement.produce

        if .body instanceof Grammar.SingleLineBody
            .out "if ", .conditional,' Then ',.body
        else
            .out "if ", .conditional, " Then", NL // .getEOLComment()
            .out  .body, NL
            if .elseStatement
                .outSourceLinesAsComment 
                .elseStatement.produce()
            .out "End if",NL


### Append to class Grammar.ElseIfStatement ###

      method produce() 

        .out NL,"else", .nextIf

### Append to class Grammar.ElseStatement ###

      method produce()

        .out NL,"else",NL, .body, NL

### Append to class Grammar.ForStatement ###

There are 3 variants of `ForStatement` in LiteScript

      method produce() 

        .variant.produce()

Since al 3 cases are closed with '}; //comment', we skip statement semicolon

        .skipSemiColon = true

Pre-For code. If required, store the iterable in a temp var.
(prettier generated code) 
Only do it if the iterable is a complex expression, if it can have side-effects or it's a literal.
We create a temp var to assign the iterable expression to

    Append to class Grammar.Expression

      method prepareTempVar() returns string

        declare .root.name: Grammar.VariableRef

        if .operandCount>1 or .root.name.hasSideEffects or .root.name instanceof Grammar.Literal
            var tempVarIterable = UniqueID.getVarName('list')  #unique temp iterable var name
            .out "var ",tempVarIterable,"=",this,NL
            return tempVarIterable

        return this


### Append to class Grammar.ForEachProperty
### Variant 1) 'for each property' to loop over *object property names* 

`ForEachProperty: for each [own] property name-VariableDecl in object-VariableRef`

      method produce() 

          var iterable = .iterable.prepareTempVar()

          if .valueVar
            .out "var ", .valueVar.name,"=undefined;",NL

          var index=.keyIndexVar or UniqueID.getVarName('inx');

          .out "for ( var ", index, " in ", iterable, ")"
          
          if .ownKey
              .out "if (",iterable,".hasOwnProperty(",index,"))"

          .body.out "{", .valueVar.name,"=",iterable,"[",index,"];",NL

          .body.out .where

          .body.out "{", .body, "}",NL

          .body.out NL, "}"

          .out {COMMENT:"end for each property"},NL


### Append to class Grammar.ForEachInArray
### Variant 2) 'for each index' to loop over *Array indexes and items*

`ForEachInArray: for each [index-VariableDecl,]item-VariableDecl in array-VariableRef`

      method produce()

        var iterable = .iterable.prepareTempVar()

        if .isMap //new syntax "for each in map xx"
            return .produceInMap(iterable)

Create a default index var name if none was provided

        var indexVarName, startValue

        if .keyIndexVar
            indexVarName = .keyIndexVar.name
            startValue = .keyIndexVar.assignedValue or "0"
            .out "Dim ",indexVarName," as Integer =",startValue,NL

        .out "For Each ", .valueVar.name, " in ", iterable,NL
        .out .where 
        .out .body
        if .where, .out "End if",NL

        .out "Next",{COMMENT:[" each in ",.iterable]},NL


method: produceInMap
When Map is implemented using js "Object"

      method produceInMap(iterable)

          var indexVarName:string
          if no .keyIndexVar
            indexVarName = .valueVar.name & '__propName'
          else
            indexVarName = .keyIndexVar.name

          //.out "var ", .valueVar.name,"=undefined;",NL
          //.out 'if(!',iterable,'.dict) throw(new Error("for each in map: not a Map, no .dict property"));',NL
          .out "for Each item in ", iterable, NL
          .body.out 'Dim ',indexVarName, " as string = item.key",NL
          if .valueVar
              .body.out 'Dim ',.valueVar.name,"=item.value",NL
          .out .where
          .out .body
          if .where, .out 'End if',NL

          .out "Next",{COMMENT:" for each item in map"},NL

### Append to class Grammar.ForIndexNumeric
### Variant 3) 'for index=...' to create *numeric loops* 

`ForIndexNumeric: for index-VariableDecl "=" start-Expression [,|;] (while|until) condition-Expression [(,|;) increment-Statement]`

Examples: `for n=0 while n<10`, `for n=0 to 9`

      method produce()

        var isToDownTo: boolean
        var endTempVarName

        if .conditionPrefix in['to','down']
            isToDownTo= true
        end if

        if isToDownTo

            #'for n=0 to 10' -> for(n=0;n<=10;n++)
            #'for n=10 down to 0' -> for(n=10;n>=0;n--)
            .out "for ",.keyIndexVar.name, " As Integer =", .keyIndexVar.assignedValue or "0"
            .out .keyIndexVar.name, .conditionPrefix is 'to'? " to " else " downto ", .endExpression
            .out .body,NL
            .out "Next", NL

        else # is while|until

while|until conditions are evaluated on each loop.
Produce the condition, negated if the prefix is 'until'.

            #for n=0, while n<arr.length  -> for(n=0;n<arr.length;...
            #for n=0, until n >= arr.length  -> for(n=0;!(n>=arr.length);...
            .out "Dim ",.keyIndexVar.name, " As Integer =", .keyIndexVar.assignedValue or "0",NL
            .out "Do While ", .endExpression.produce( negated = .conditionPrefix is 'until' ),NL
            .out .body,NL
            .out .keyIndexVar.name,"+=1", NL
            .out "Loop", NL


### Append to class Grammar.ForWhereFilter
### Helper for where filter
`ForWhereFilter: [where Expression]`

      method produce()
        .out 'if ',.filterExpression,' Then',NL

### Append to class Grammar.DeleteStatement
`DeleteStatement: delete VariableRef`

      method produce()
        .out 'delete ',.varRef

### Append to class Grammar.WhileUntilExpression ###

      method produce(askFor:string, negated:boolean) 

If the parent ask for a 'while' condition, but this is a 'until' condition,
or the parent ask for a 'until' condition and this is 'while', we must *negate* the condition.

        if askFor and .name isnt askFor
            negated = true

*askFor* is used when the source code was, for example,
`do until Expression` and we need to code: `while(!(Expression))` 
or the code was `loop while Expression` and we need to code: `if (!(Expression)) break` 

when you have a `until` condition, you need to negate the expression 
to produce a `while` condition. (`while NOT x` is equivalent to `until x`)

        .expr.produce negated


### Append to class Grammar.DoLoop ###

      method produce() 

Note: **WhileUntilLoop** symbol has **DoLoop** as *prototype*, so this *.produce()* method
is used by both symbols.

        if .postWhileUntilExpression 

if we have a post-condition, for example: `do ... loop while x>0`, 

            .out "do ",NL // .getEOLComment()
            .out .body
            .out "Loop while "
            .postWhileUntilExpression.produce(askFor='while')
            .out NL

else, optional pre-condition:
  
        else

            .out 'Do while'
            if .preWhileUntilExpression
              .preWhileUntilExpression.produce(askFor='while')
            else 
              .out 'true'
            .out NL, .body , NL
            .out "Loop",NL


        end if


### Append to class Grammar.LoopControlStatement ###
This is a very simple produce() to allow us to use the `break` and `continue` keywords.
  
      method produce() 

validate usage inside a for/while

        var nodeASTBase = this.parent
        do

            if nodeASTBase is instanceof Grammar.FunctionDeclaration
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
        .out "Do Nothing"

### Append to class Grammar.ParenExpression ###

A `ParenExpression` is just a normal expression surrounded by parentheses.

      method produce() 
        .out "(",.expr,")"

### Append to class Grammar.ArrayLiteral ###

A `ArrayLiteral` is a definition of a list like `[1, a, 2+3]`. We just pass this through to JavaScript.

      method produce() 
        .out "new ArrayList"
        if .items.length
          .out " From {",{CSL:.items},"}"
        .out NL

### Append to class Grammar.NameValuePair ###

A `NameValuePair` is a single item in an object definition. Since we copy js for this, we pass this straight through 

      method produce() 
        .out "{",.name,",",.value,"}"

### Append to class Grammar.ObjectLiteral ### also FreeObjectLiteral

A `ObjectLiteral` is an object definition using key/value pairs like `{a:1,b:2}`. 
JavaScript supports this syntax, so we just pass it through. 

A `FreeObjectLiteral` is an object definition using key/value pairs, but in free-form
(one NameValuePair per line, indented, comma is optional)

#### method produce()

          if .parent.constructor is Grammar.Operand
              if .parent.parent.isMap //expression has isMap set
                  .isMap = true

          if .isMap, .out 'new Dictionary(Of String,Object) from '
          .out '{',{CSL:.items, freeForm:.constructor is Grammar.FreeObjectLiteral },'}'
          //if .isMap, .out ')'


#### method calcFastNew(className)

calcFastNew compose the arguments when a function is called with a instanceLiteral (ObjectLiteral).
In this case (producing JS) we just pass the ObjectLiteral to the constructor,
in the case of Producer C, there's a optimized version.

        return this

### Append to class Grammar.FunctionDeclaration ###

`FunctionDeclaration: '[export][generator] (function|method|constructor) [name] FunctionParameters (["=" Expression]|Body)`

`FunctionDeclaration`s are function definitions. 

`export` prefix causes the function to be included in `module.exports`
`generator` prefix marks a 'generator' function that can be paused by `yield` (js/ES6 function*)

     method produce(prefix:array)

      var isConstructor = this instance of Grammar.ConstructorDeclaration

      //Generators are implemented in ES6 with the "function*" keyword (note the asterisk)
      var generatorMark = .hasAdjective("generator") and .lexer.project.compilerVar('ES6')? "*" else ""

      .out {COMMENT:"---------------------------"},NL //function start separator

      if this instance of Grammar.MethodDeclaration

          #get owner where this method belongs to
          if no prefix
              if no .getOwnerPrefix() into prefix 
                  fail with 'method "#{.name}" Cannot determine owner object'

          var ownerName:string = prefix.join("")
          if ownerName.slice(-1) is '.', ownerName = ownerName.slice(0,-1)

          #if shim, check before define
          //if .hasAdjective("shim"), .out "if (!Object.prototype.hasOwnProperty.call(",ownerName,",'",.name,"'))",NL

          //if .definePropItems #we should code Object.defineProperty
          //    .out "Object.defineProperty(",NL,
          //          ownerName, ",'",.name,"',{value:function",generatorMark
          //else
          
          //.out "Public Function ",prefix,.name," ",generatorMark
          .out "Public Function ",.name," "

else, it is a simple function

      else 
          .out "function ",.name, generatorMark

if 'nice', produce default nice body, and then the generator header for real body

      var isNice = .hasAdjective("nice") and not (isConstructor or .hasAdjective("shim") or .definePropItems or .hasAdjective("generator"))
      if isNice
          .out "("
          if .paramsDeclarations.list.length, .out .paramsDeclarations,","
          .out "__callback){", NL
          .out '  nicegen.run(this, ',prefix,.name,"_generator, arguments);",NL
          .out "};",NL
          .out "function* ",prefix,.name,"_generator"
      end if

Produce function parameters declaration
       
      .out "(", .paramsDeclarations, ")", NL //.getEOLComment()

now produce function body

      .produceBody

if we were coding .definePropItems , close Object.defineProperty

      if .definePropItems 
          for each definePropItem in .definePropItems 
            .out NL,",",definePropItem.name,":", definePropItem.negated? 'false':'true'
          end for
          .out NL,"})"

If the function was adjectivated 'export', add to module.exports

      .produceExport .name


#### method produceBody()

if the function has a exception block, insert 'try{'

      if no .body or no .body.statements //interface function?
            //.throwError 'function #{.name} from #{.lexer.filename} has no body'
            .sayErr 'function #{.name} from #{.lexer.filename} has no body'
            .out "**NO BODY**",NL
            .out "end function",NL
            return

if one-line-function, code now: Example: function square(x) = x*x

      if .body instance of Grammar.Expression
          .out "return ", .body

      else

if it has a "catch" or "exception", insert 'try{'

          for each statement in .body.statements
            if statement.specific instance of Grammar.ExceptionBlock
                .out " try ",NL
                break

if params defaults where included, we assign default values to arguments 

          if .paramsDeclarations 
              for each varDecl in .paramsDeclarations.list
                if varDecl.assignedValue 
                    .body.assignIfUndefined varDecl.name, varDecl.assignedValue
              #end for
          #end if

          .body.produce()

      end if one-line-function

close the function, add source map for function default "return undefined" execution point

      .out "end function",NL

--------------------
### Append to class Grammar.PrintStatement ###
`print` is an alias for console.log

      method produce()
        .out "Debug.Print(",{"CSL":.args},")"


--------------------
### Append to class Grammar.EndStatement ###

Marks the end of a block. It's just a comment for javascript

      method produce()
        .skipSemiColon = true

--------------------
### Append to class Grammar.CompilerStatement ###

      method produce()
        .skipSemiColon = true


--------------------
### Append to class Grammar.DeclareStatement ###

Out as comments

      method produce()
        .skipSemiColon = true


----------------------------
### Append to class Grammar.ClassDeclaration ###

Classes contain a code block with properties and methods definitions.

      method produce()

        .out {COMMENT:"constructor"},NL
      
First, since in JS we have a object-class-function-constructor all-in-one
we need to get the class constructor, and separate other class items.

        var prefix = .getOwnerPrefix()

        .out "Class ",.name,NL
        if .varRefSuper 
          .out "Inherits ",.varRefSuper,NL

properties

        for each item in .body.statements 
          where item.specific.constructor is Grammar.PropertiesDeclaration
            .out item.specific

constructor

        .out NL
        if .constructorDeclaration //there was a constructor body, add specified params
            .out "Sub New(", .constructorDeclaration.paramsDeclarations, ")", NL // .getEOLComment()
        else
            .out "Sub New() 'default constructor",NL

call super-class __init

        if .varRefSuper 
              .out 
                  {COMMENT:["default constructor: call super.constructor"]},NL
                  "    MyBase.New("
              if .constructorDeclaration and .constructorDeclaration.paramsDeclarations 
                 var names=[]
                 for each varDecl in .constructorDeclaration.paramsDeclarations.list
                    names.push varDecl.name
                 .out {CSL:names}
                 .out ")",NL
              #end for
          #end if

// COMENTADO: NO ES NECESARIO EN VB.NET p q las props decl tienen su valor default
initialize own properties

        /*for each item in .body.statements 
          where item.specific.constructor is Grammar.PropertiesDeclaration
            declare item.specific:Grammar.PropertiesDeclaration
            item.specific.produceAssignment('Me.') //produce property assignments
        */

        if .constructorDeclaration //there was a body
            .constructorDeclaration.produceBody

        .out NL


now out methods, meaning: create properties in the object-function-class prototype

        for each item in .body.statements 
          where item.specific.constructor not in [Grammar.PropertiesDeclaration,Grammar.ConstructorDeclaration]
            item.specific.produce //produce methods

If the class was adjectivated 'export', add to module.exports

        .out NL,"end class '",.name,NL




### Append to class Grammar.AppendToDeclaration ###

Any class|object can have properties or methods appended at any time. 
Append-to body contains properties and methods definitions.

      method produce() 
        .out "Partial Class ",.varRef,NL
        .out .body
        .out NL
        .out "End Class 'partial"
        .skipSemiColon = true



### Append to class Grammar.NamespaceDeclaration ###

Any class|object can have properties or methods appended at any time. 
Append-to body contains properties and methods definitions.

      method produce() 
        .out 'Namespace ',.name,NL
        .out .body


### Append to class Grammar.TryCatch ###

      method produce() 

        .out "try ",NL,.body, .exceptionBlock,NL
        .out "End try",NL

### Append to class Grammar.ExceptionBlock ###

      method produce() 

        .out NL,"Catch ",.catchVar
        .out .body

        if .finallyBody
          .out NL,"Finally"
          .out .finallyBody


### Append to class Grammar.CaseStatement ###

##### method produce()

if we have a varRef, is a case over a value

        if .isInstanceof
            .produceInstanceOfLoop
            return

        .out 'select ',.varRef,NL
        for each index,whenSection in .cases

            .out 'case ', {CSL:whenSection.expressions,  separator:',', freeForm:0},NL
            .out whenSection.body, NL,NL
else body

        if .elseBody 
            .out NL,'case else', NL,.elseBody,NL


##### method produceInstanceOfLoop

        var tmpVar=UniqueID.getVarName('class')
        .out "Class_ptr ",tmpVar," = ",.varRef,".class;",NL,
            "while(",tmpVar,"){",NL

        for each index,whenSection in .cases

            whenSection.outSourceLinesAsComment

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
            or no functionDeclaration.hasAdjective("nice")
                .throwError '"yield" can only be used inside a "nice function/method"'

        var yieldArr=[]

        var varRef = .fnCall.varRef
        //from .varRef calculate object owner and method name 

        var thisValue=['null']
        var fnName = varRef.name #default if no accessors 

        if varRef.accessors

            var inx=varRef.accessors.length-1
            if varRef.accessors[inx] instance of Grammar.FunctionAccess
                var functionAccess = varRef.accessors[inx]
                yieldArr = functionAccess.args
                inx--

            if inx>=0 
                if varRef.accessors[inx] isnt instance of Grammar.PropertyAccess
                    .throwError 'yield needs a clear method name. Example: "yield until obj.method(10)". redefine yield parameter.'

                fnName = "'#{varRef.accessors[inx].name}'"
                thisValue = [varRef.name]
                thisValue.push varRef.accessors.slice(0,inx)


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

    var OPER_TRANSLATION_map = map

      'no':           'Not'
      'not':          'Not'
      'unary -':      '-'
      'unary +':      '+'

      '&':            '&'  //string concat
      '&=':           '&='  //string concat

      'bitand':       'And'
      'bitor':        'Or'
      'bitxor':       'Xor'
      'bitnot':       'Not'

      'type of':      'TypeOf'
      'instance of':  'TypeOf'

      'is':           '='
      'isnt':         '<>'
      '<>':           '<>'
      'and':          'AndAlso'
      'but':          'AndAlso'
      'or':           'OrElse'
      'has property': 'Contains'

    function operTranslate(name:string)
      return OPER_TRANSLATION_map.get(name) or name

---------------------------------

### Append to class ASTBase

Helper methods and properties, valid for all nodes

#### properties skipSemiColon 

#### helper method assignIfUndefined(name, value: Grammar.Expression) 
          
          declare valid value.root.name.name
          #do nothing if value is 'undefined'
    
          #Expression->Operand->VariableRef->name
          var varRef:Grammar.VariableRef = value.root.name
          if varRef.constructor is Grammar.VariableRef
              if varRef.name is 'undefined' 
                  .out {COMMENT:name},": undefined",NL
                  return

          .out "if isMissing(",name,') then ',name,"=",value,": end if",NL

#### helper method produceExport(name:string)

"module.export" not valid for browser modules

        return

/*        if .lexer.options.browser, return

        if .hasAdjective("export") and not .hasAdjective("default") 
            .out NL,{COMMENT:'export'},NL
            .out 'module.exports.',name,' = ', name,";",NL
            .skipSemiColon = true
*/

--------------------------------


